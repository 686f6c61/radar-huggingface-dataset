# keepmum/prompt-injection-guard-small-gguf

## Resumen

Prompt Injection Guard Small v2.3 GGUF es una conversión al formato GGUF del clasificador de inyección de prompts Prompt Injection Guard Small v2.3, desarrollado originalmente por Horizon Labs. El archivo lo publica el usuario keepmum, autor de la herramienta de privacidad local para agentes de programación keepmum, con el objetivo de que el clasificador funcione dentro de llama.cpp sin depender de la pila de Transformers. Se trata de un modelo de clasificación de texto de dos etiquetas (SAFE e INJECTION) construido sobre la arquitectura mmBERT-small, con 140.642.306 parámetros totales y una ventana de contexto operativa de 2.048 tokens en el ejemplo de uso del autor.

El modelo resuelve un problema concreto de seguridad en despliegues de agentes: detectar instrucciones maliciosas inyectadas en texto que el agente procesa, especialmente en resultados de herramientas (tool results) donde un atacante puede colar directivas ocultas. La conversión no entrena ni calibra nada: solo transforma los pesos originales a GGUF y los cuantiza a Q8_0, manteniendo normas y sesgos en F32. Su relevancia actual radica en que permite ejecutar la comprobación de inyecciones en local, con latencias de 12 ms por documento en un Apple M5 Pro según el benchmark del autor, sin enviar datos a servicios externos.

La ficha se centra en el artefacto GGUF, pero conviene tener presente que el modelo subyacente es el clasificador de Horizon Labs; para datos de entrenamiento, uso previsto y evaluación original hay que remitirse a la model card del modelo base.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | mmBERT-small (transformer encoder), cabeza de clasificación con mean pooling, dense, GELU, norm y classifier |
| Parámetros totales | 140.642.306 |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | 2.048 tokens en el ejemplo de uso del autor (ventana con solapamiento de 256 tokens); no se especifica un máximo arquitectónico |
| Tipos de cuantización | Q8_0 (normas y sesgos en F32) |
| Idiomas soportados | multilingüe (etiqueta `multilingual`; el modelo base declara 20 idiomas) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (`prompt-injection-guard-small-v2.3.Q8_0.gguf`, 164.361.472 bytes) |

## Arquitectura y entrenamiento

El artefacto es una conversión directa de los pesos de Prompt Injection Guard Small v2.3, un clasificador basado en mmBERT-small (modelo base de jhu-clsp/mmBERT-small, con aviso MIT incluido sin cambios en el NOTICE). La conversión se realizó con `convert_hf_to_gguf.py` de llama.cpp en el commit `8642541b` y después se cuantizó a Q8_0, dejando normas y sesgos en F32. No hubo entrenamiento, fine-tuning ni calibración en este paso. El autor documenta ajustes en el conversor: el tokenizador se lee como el de mmBERT, el pre-tokenizador se escribe en la forma `add_prefix_space` que llama.cpp acepta, y el pooling se configura como rank con anchura de salida 2 (las dos etiquetas), de modo que llama.cpp ejecuta la cabeza propia del modelo.

Un punto técnico crítico es la normalización del texto: el tokenizador original normaliza antes de tokenizar y llama.cpp no lo hace. El autor especifica el orden exacto de preprocesado (decodificación de caracteres de etiqueta Unicode U+E0020–U+E007E y selectores de variación U+E0110–U+E016E a ASCII, NFKC y eliminación de caracteres invisibles y de formato) y proporciona un fragmento de Python reproducible. Sin esta normalización, las instrucciones ocultas en caracteres invisibles no se detectan. El script de conversión (`bench/horizon_gguf.py` en el repositorio keepmum) reproduce el archivo byte a byte con las mismas entradas.

No se dispone de información sobre el dataset de entrenamiento original, el número de tokens ni el uso de RLHF o DPO en la información proporcionada; esos detalles corresponden a la model card de Horizon Labs.

## Capacidades

- Clasificación binaria de texto en dos etiquetas: SAFE e INJECTION, con salida de logits crudos que, tras softmax, dan P(INJECTION).
- Detección de inyección de prompts en resultados de herramientas y en texto procesado por agentes, incluido el caso de instrucciones plantadas.
- Robustez frente a ofuscación cuando se aplica la normalización previa documentada: caracteres de etiqueta Unicode, selectores de variación, letras de ancho completo, caracteres de ancho cero y de control bidireccional.
- Capacidad multilingüe heredada de mmBERT-small (el modelo base declara 20 idiomas).
- Ejecución local en llama.cpp mediante `llama-server` en modo embeddings (`--embedding`), con devolución de logits crudos usando `embd_normalize: -1`.
- Procesamiento de textos largos por ventanas: tokenización con `/tokenize` (`add_special: false`) y puntuación de ventanas de 2.048 tokens con 256 de solapamiento, tomando la ventana de mayor puntuación.
- No es un modelo generativo: no produce texto, no soporta tool calling ni razonamiento multi-paso; su función es exclusivamente de clasificación.

## Casos de uso

- Comprobación de resultados de herramientas en agentes de programación: antes de que un agente lea la salida de una herramienta (por ejemplo, el contenido de un issue o un archivo descargado), se puntúa el texto con el clasificador y se bloquea o marca si P(INJECTION) supera el umbral. Es el caso para el que se creó este GGUF dentro de keepmum.
- Pasarela de seguridad en pipelines de CI/CD: integrar el clasificador como paso previo al procesamiento de texto no confiable (descripciones de pull requests, comentarios, logs) para detectar instrucciones dirigidas a agentes automáticos.
- Filtrado de entradas en asistentes conversacionales: puntuar cada mensaje de usuario o cada documento recuperado en un sistema RAG antes de incorporarlo al contexto del modelo generativo, con la ventaja de una latencia de 12 ms por documento en hardware Apple.
- Protección de correo y mensajería: analizar cuerpos de correo o mensajes en busca de directivas ocultas (por ejemplo, texto invisible con caracteres de etiqueta Unicode) aplicando la normalización documentada antes de la clasificación.
- Auditoría de contenido web raspado: clasificar páginas o fragmentos extraídos por un scraper antes de que un agente los utilice, reduciendo el riesgo de inyección indirecta desde fuentes externas.
- Despliegue en entornos sin conectividad o con requisitos de privacidad: al ser un GGUF de 164 MB ejecutable en llama.cpp, permite clasificar localmente sin enviar texto sensible a APIs externas, algo relevante en sanidad, legal o banca.
- Evaluación comparativa de defensas: usar el modelo como línea base reproducible en pruebas de robustez frente a inyecciones ofuscadas, dado que el autor documenta la equivalencia de tokens con el tokenizador original.

## Benchmarks y rendimiento

Los datos disponibles provienen del benchmark del autor de la conversión (409 documentos, incluidos resultados de herramientas con y sin instrucciones plantadas, puntuados con las mismas ventanas). No son benchmarks estándar de la comunidad y el propio autor advierte que la muestra es pequeña y escrita por una sola persona.

| Métrica | Original (Transformers, MPS), umbral 0,6465 | Este GGUF (llama-server, Metal, Apple M5 Pro), umbral 0,65 |
|---|---|---|
| AUC en holdout | 1,000 | 1,000 |
| Recall | 1,00 | 1,00 |
| Falsas alarmas, escritura ordinaria | 0,03 | 0,03 |
| Falsas alarmas, escritura de seguridad | 0,09 | 0,09 |
| Latencia p50 por documento | 20 ms | 12 ms |

El autor indica que los veredictos coinciden con el original en los 409 documentos, con una diferencia máxima en P(INJECTION) de 0,054 y una diferencia mediana en el margen de logits de 0,05. Con la normalización indicada, los tokens de llama.cpp coinciden con los del tokenizador original en los 409 documentos y en cadenas de prueba ofuscadas. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible, y no tendrían sentido para un clasificador de este tipo.

## Requisitos de hardware

- VRAM estimada para inferencia: el archivo Q8_0 ocupa 164.361.472 bytes (unos 157 MiB); con overhead de llama.cpp, el consumo es del orden de unos cientos de MiB, apto para cualquier GPU consumer.
- GPU recomendadas: no se especifican requisitos mínimos; el autor reporta ejecución en Metal sobre Apple M5 Pro. Cualquier GPU con soporte de llama.cpp (RTX 3060 en adelante, A100, H100) es sobradamente suficiente.
- Cabe en GPU consumer: sí, en cualquier GPU con al menos 1 GB de memoria libre; también puede ejecutarse en CPU.
- Opciones de despliegue: llama.cpp (`llama-server` con `--embedding -c 2048 -ngl 99`); el formato GGUF es compatible con el ecosistema llama.cpp, aunque no se documenta soporte específico en Ollama, vLLM o TGI en la información disponible.
- Latencia y throughput: 12 ms p50 por documento en Apple M5 Pro con llama-server (Metal), según el benchmark del autor; no se proporcionan cifras de throughput agregado ni de otras plataformas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Función | Licencia | Formato |
|---|---|---|---|---|---|
| keepmum/prompt-injection-guard-small-gguf (este) | 140.642.306 | 2.048 tokens por ventana en el ejemplo de uso | Clasificación SAFE/INJECTION | Apache-2.0 | GGUF Q8_0 |
| Horizon-Labs/prompt-injection-guard-small | 140.642.306 | no disponible | Clasificación SAFE/INJECTION | Apache-2.0 | safetensors |
| Horizon-Labs/prompt-injection-guard-base | no disponible | no disponible | Clasificación de inyección y jailbreak | Apache-2.0 | safetensors, ONNX |

La comparación más directa es con el modelo original de Horizon Labs, del que este GGUF es una cuantización: misma arquitectura y mismos pesos, con la diferencia de formato, motor de inferencia y la necesidad de aplicar la normalización manualmente. El modelo base de Horizon Labs amplía etiquetas y formatos (ONNX, Transformers.js), pero no se dispone de sus cifras de rendimiento en la información proporcionada. No se han identificado en la información disponible otros clasificadores de inyección comparables con datos verificables.

## Limitaciones y advertencias

- La conversión no está afiliada ni respaldada por Horizon Labs; para el uso previsto, limitaciones y evaluación del modelo original hay que consultar su model card.
- Sin la normalización previa documentada (decodificación de caracteres de etiqueta y selectores de variación, NFKC y eliminación de invisibles), las instrucciones ocultas en caracteres invisibles no se detectan; es un requisito operativo, no opcional.
- El benchmark del autor es pequeño (409 documentos) y fue escrito por una sola persona; confirma la equivalencia con el original, no la calidad general de detección en producción.
- Es un clasificador binario con umbral ajustable (0,65 en el ejemplo); la elección de umbral afecta directamente a la tasa de falsas alarmas, que en escritura de seguridad fue del 0,09.
- Riesgo de falsos negativos ante técnicas de inyección no representadas en los datos de entrenamiento originales; no se dispone de información sobre la composición del dataset.
- No es un modelo generativo: no puede sustituir a un LLM para tareas de razonamiento, código o diálogo.
- El procesamiento de textos largos requiere ventaneo manual con solapamiento; la puntuación final es la de la ventana más alta, lo que puede omitir inyecciones de baja intensidad distribuidas en el documento.
- La licencia Apache-2.0 permite uso comercial, pero se debe conservar el NOTICE de Horizon Labs con el aviso MIT de mmBERT-small.
- No se documentan sesgos específicos del clasificador en la información disponible; al ser multilingüe, el rendimiento puede variar entre idiomas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/keepmum/prompt-injection-guard-small-gguf
- Modelo base (Horizon Labs): https://huggingface.co/Horizon-Labs/prompt-injection-guard-small
- Modelo base alternativo (Horizon Labs): https://huggingface.co/Horizon-Labs/prompt-injection-guard-base
- Modelo mmBERT-small: https://huggingface.co/jhu-clsp/mmBERT-small
- Repositorio keepmum: https://github.com/blueandhack/keepmum
- Script de conversión: https://github.com/blueandhack/keepmum/blob/f3d5454f47e9f942cdcb58266c9cb1d03548197a/bench/horizon_gguf.py
- Resultados del benchmark: https://github.com/blueandhack/keepmum/blob/f3d5454f47e9f942cdcb58266c9cb1d03548197a/bench/results/GUARD.md
- llama.cpp: https://github.com/ggml-org/llama.cpp
- Commit del conversor usado: https://github.com/ggml-org/llama.cpp/tree/8642541b255bfb5dc39cd351a178be09013a55d6
- Commit de los pesos originales: https://huggingface.co/Horizon-Labs/prompt-injection-guard-small/tree/9760ad5a613aa87b38c2e621189b9d06bfb6d12b
