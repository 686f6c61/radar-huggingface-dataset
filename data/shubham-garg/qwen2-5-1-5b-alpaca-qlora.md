# shubham-garg/qwen2.5-1.5b-alpaca-qlora

## Resumen

`shubham-garg/qwen2.5-1.5b-alpaca-qlora` es un ajuste fino supervisado del modelo Qwen2.5-1.5B-Instruct, publicado por un autor individual (shubham-garg) bajo licencia Apache 2.0. El entrenamiento se realizó con QLoRA sobre la variante del modelo base ya cuantizada a 4 bits de Unsloth, y los pesos resultantes se publican fusionados en safetensors: 1.543.714.304 parámetros en un repositorio de 3,1 GB, un tamaño coherente con pesos en fp16/bf16 listos para cargarse con transformers.

El nombre del repositorio sugiere que el corpus de ajuste es Alpaca (instrucciones en inglés), pero la model card no lo confirma ni documenta hiperparámetros, número de pasos, composición del dataset o evaluación posterior. El modelo conserva la arquitectura densa de la familia Qwen2.5 (transformer decoder-only, 32.768 tokens de contexto según el modelo base) y está etiquetado únicamente para inglés.

Su relevancia es acotada y práctica: sirve como ejemplo reproducible de un pipeline QLoRA con Unsloth y TRL, y como modelo pequeño para prototipado local en hardware de consumo. No es una alternativa validada a los instructivos oficiales: no tiene descargas, valoraciones ni benchmarks publicados, por lo que debe tratarse como un artefacto experimental.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Qwen2), densa; detalles de capas no documentados en la model card |
| Parametros totales | 1.543.714.304 (~1,54 mil millones), según safetensors |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 32.768 tokens según el modelo base Qwen2.5-1.5B; no verificado en este fine-tune |
| Tipos de cuantizacion | Solo safetensors en el repositorio (3,1 GB, consistente con fp16/bf16). No se publican GGUF, AWQ ni GPTQ; cualquier cuantización posterior debe generarla el usuario |
| Idiomas soportados | Inglés (etiqueta `en`). La herencia multilingüe de Qwen2.5 no está validada en este ajuste |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería transformers) |
| Modelo base | unsloth/Qwen2.5-1.5B-Instruct-unsloth-bnb-4bit (a su vez derivado de Qwen/Qwen2.5-1.5B-Instruct) |
| Metodo de ajuste | QLoRA (adaptadores LoRA sobre base de 4 bits, fusionados en la publicación) |
| Tamaño del repositorio | 3,1 GB |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura de Qwen2.5-1.5B-Instruct: un transformer decoder-only con normalización RMSNorm, activación SwiGLU, embeddings rotatorios (RoPE) y atención con cabezales key/value agrupados (GQA), lo que reduce el coste de caché KV en inferencia. El contexto nativo del modelo base es de 32.768 tokens. El fine-tune no modifica la topología: parte de la versión del modelo base cuantizada a 4 bits en formato bitsandbytes (bnb-4bit) publicada por Unsloth.

El entrenamiento se realizó con QLoRA: los adaptadores LoRA se entrenan sobre los pesos congelados de 4 bits y posteriormente se fusionan en los pesos finales, publicados en 16 bits. La model card indica únicamente que el entrenamiento se hizo "2x faster" con Unsloth y la librería TRL de Hugging Face; no se especifican rango de LoRA, alpha, learning rate, número de pasos, tamaño de batch ni número de tokens vistos. Tampoco se documenta ninguna fase de RLHF, DPO o preferencias sobre este ajuste: la alineación proviene exclusivamente del modelo base Instruct. El dataset de ajuste se infiere del nombre del repositorio (Alpaca, formato instrucción-respuesta en inglés, ~52.000 ejemplos en su versión original), pero no está confirmado en la documentación. Como caveat técnico, entrenar sobre una base cuantizada a 4 bits e inferir después con pesos en 16 bits puede introducir un desajuste de cuantización que degrade ligeramente la calidad respecto a un LoRA equivalente sobre pesos completos.

## Capacidades

- Generación de texto conversacional en inglés, con formato de instrucción-respuesta (estilo Alpaca).
- Seguimiento de instrucciones simples y tareas de un solo turno; el modelo base es Instruct, así que conserva parte de esa capacidad, aunque el ajuste con Alpaca puede haber desplazado el estilo de respuesta.
- Generación de código y explicaciones técnicas a nivel básico, limitada por el tamaño de 1,5B parámetros.
- Aritmética y razonamiento elemental de pocos pasos; no es fiable en problemas de varios pasos.
- Tool calling / function calling: el modelo base Qwen2.5-Instruct soporta llamadas a herramientas con plantilla tipo Hermes, pero este ajuste no refuerza ni evalúa esa capacidad; debe validarse empíricamente antes de usarla.
- Capacidades de agente y razonamiento multi-paso: no documentadas ni evaluadas en este repositorio.
- Multilingüe: no soportado de forma declarada (solo `en`); el multilingüismo del modelo base no está garantizado tras el ajuste.
- Sin visión, audio, ni modo de razonamiento explícito (thinking mode).

## Casos de uso

- Prototipado rápido de asistentes conversacionales: al ocupar ~3,1 GB en fp16, se puede cargar en una GPU de 6-8 GB y validar prompts, plantillas y flujos de diálogo antes de migrar a un modelo mayor.
- Generación de respuestas estilo Alpaca para pruebas de pipelines de datos: útil como generador de referencia en tests de ingestión, formateo y evaluación de datasets de instrucciones.
- Etiquetado y reescritura de texto a pequeña escala: clasificación de tickets, normalización de campos o generación de resúmenes cortos en inglés en lotes, donde el coste por token importa más que la calidad puntera.
- Modelo de borrador para decodificación especulativa: un 1,5B denso puede actuar como draft model de un Qwen de mayor tamaño de la misma familia, compartiendo tokenizador y vocabulario.
- Entorno educativo y de investigación: caso de estudio reproducible de QLoRA con Unsloth y TRL, con pesos fusionados y licencia Apache 2.0, apto para comparar configuraciones de ajuste.
- Automatización de tareas de CI/documentación: generación de descripciones de commits, mensajes de error o borradores de docstrings en inglés dentro de un pipeline local, sin dependencia de APIs externas.
- Filtrado y preprocesado on-premise: al ejecutarse en CPU con llama.cpp tras convertir a GGUF, sirve para tareas de limpieza o deduplicación semántica en entornos sin GPU.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye evaluaciones de MMLU, HumanEval, GSM8K ni comparaciones con el modelo base, y el repositorio no enlaza ningún informe de evaluación. Cualquier cifra de rendimiento atribuida a este ajuste sería una extrapolación no verificada del comportamiento de Qwen2.5-1.5B-Instruct.

## Requisitos de hardware

- Pesos en fp16/bf16: ~3,1 GB. Con caché KV y overhead de runtime, la inferencia en transformers requiere del orden de 4-6 GB de VRAM para contextos moderados.
- Cabe en GPU de consumo: RTX 3060 12 GB, RTX 4060 Ti 8 GB, RTX 4070, RTX 4090 (holgada), así como portátiles con 6-8 GB de VRAM.
- En CPU: viable con llama.cpp u Ollama tras convertir los pesos a GGUF (el repositorio no incluye GGUF; hay que generarlo). Con cuantización Q4_K_M el peso baja a ~1 GB.
- Despliegue con GPU: transformers, vLLM, TGI (el repo incluye la etiqueta `text-generation-inference`) y SGLang. Para producción de alto throughput, vLLM es la opción habitual a este tamaño.
- Despliegue en local/edge: llama.cpp, Ollama, LM Studio (requieren conversión previa a GGUF).
- Latencia y throughput: no se han publicado medidas. El tamaño (1,54B, denso) sitúa al modelo en la categoría de baja latencia en GPU consumer, pero no hay cifras verificables.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Estado y validacion |
|---|---|---|---|---|
| shubham-garg/qwen2.5-1.5b-alpaca-qlora | 1,54B | 32.768 (heredado, no verificado) | Apache 2.0 | Sin descargas, sin benchmarks, autor individual |
| Qwen/Qwen2.5-1.5B-Instruct | 1,54B | 32.768 | Apache 2.0 | Modelo oficial, ampliamente evaluado, soporte de tool calling |
| meta-llama/Llama-3.2-1B-Instruct | 1,24B | 128.000 | Llama 3.2 Community License (restricciones de uso) | Oficial, evaluado, requiere aceptar licencia |
| HuggingFaceTB/SmolLM2-1.7B-Instruct | 1,71B | 8.192 | Apache 2.0 | Oficial, evaluado, orientado a dispositivo |

Frente a estas alternativas, el modelo aquí descrito no aporta ventajas medibles: mismo tamaño y arquitectura que su base, pero sin evaluación ni mantenimiento. Solo tiene sentido si se busca específicamente un checkpoint ajustado con Alpaca o un ejemplo de QLoRA reproducible. Los datos de rendimiento comparado no están disponibles para este ajuste.

## Limitaciones y advertencias

- Sin evaluación: no hay benchmarks, métricas ni comparación con el modelo base, por lo que se desconoce si el ajuste mejora o degrada las capacidades originales.
- Riesgo de degradación por catástrofe de olvido: el ajuste con Alpaca (respuestas cortas y de estilo uniforme) puede reducir la calidad conversacional, el soporte de tool calling y el multilingüismo del Instruct original.
- Desajuste de cuantización: entrenamiento sobre base de 4 bits e inferencia en 16 bits; puede introducir ruido respecto a un LoRA sobre pesos completos.
- Alucinación: esperable y no mitigada en un modelo de 1,5B; no apto para tareas factuales sin verificación externa.
- Idioma: solo inglés declarado; el rendimiento en castellano no está garantizado ni documentado.
- Contexto: los 32.768 tokens son herencia del modelo base y no se ha validado que el ajuste los aproveche; en la práctica, modelos de este tamaño degradan en contextos largos.
- Sesgos: no documentados. El corpus Alpaca y los datos del modelo base pueden introducir sesgos de género, culturales y de dominio; no hay auditoría.
- Licencia: Apache 2.0 permite uso comercial y modificaciones, pero el usuario debe verificar las obligaciones heredadas del modelo base y de los datos de ajuste (la procedencia del dataset no está documentada).
- Producción: autor individual, cero descargas y cero valoraciones; sin garantías de mantenimiento, versionado ni soporte. No recomendado como dependencia crítica sin una evaluación propia.
- Fecha de publicación del repositorio en Hugging Face: 22 de octubre de 2026, según los metadatos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/shubham-garg/qwen2.5-1.5b-alpaca-qlora
- Modelo base del ajuste: https://huggingface.co/unsloth/Qwen2.5-1.5B-Instruct-unsloth-bnb-4bit
- Modelo original: https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct
- Unsloth (repositorio citado en la model card): https://github.com/unslothai/unsloth
- TRL de Hugging Face (librería de entrenamiento citada): https://github.com/huggingface/trl
- Dataset Alpaca (inferido del nombre del repositorio, no confirmado): https://huggingface.co/datasets/tatsu-lab/alpaca
