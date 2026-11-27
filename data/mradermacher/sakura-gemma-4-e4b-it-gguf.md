# mradermacher/sakura-gemma-4-E4B-it-GGUF

## Resumen

sakura-gemma-4-E4B-it-GGUF es la versión cuantizada en formato GGUF del modelo Takenoko12345678/sakura-gemma-4-E4B-it, un ajuste fino (LoRA) sobre la familia Gemma 4 de Google orientado a conversación con persona, roleplay y razonamiento con modo "thinking", con especial atención al idioma japonés. El trabajo de cuantización lo firma mradermacher, un conocido publicador de quants GGUF estáticos e imatrix para la comunidad de inferencia local. El modelo base declara 7.518.069.290 parámetros totales según los pesos en safetensors, si bien la nomenclatura "E4B" sugiere una configuración del tipo mixture-of-experts con aproximadamente 4.000 millones de parámetros activos, aunque este dato no está confirmado en la información disponible.

El modelo resulta relevante para desarrolladores que quieren desplegar un asistente conversacional especializado en japonés e inglés con capacidades multimodales (el repo incluye ficheros mmproj para el proyector de visión) y un modo de razonamiento explícito, todo ello sobre infraestructura local o GPU de consumo mediante llama.cpp u Ollama. La licencia Apache 2.0 del modelo base facilita su uso comercial, algo poco habitual en modelos especializados en roleplay.

Esta ficha cubre específicamente la distribución GGUF, que ofrece 12 niveles de cuantización desde Q2_K (4,5 GB) hasta f16 (15,2 GB), además de dos variantes del proyector multimodal. Para quienes necesiten mayor fidelidad, existe una versión con cuantización ponderada/imatrix publicada por el mismo autor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer basada en Gemma 4 (detalles exactos no disponibles); nomenclatura "E4B" compatible con MoE |
| Parametros totales | 7.518.069.290 |
| Parametros activos | no disponible (la etiqueta "E4B" sugiere ~4B activos, sin confirmar) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16; proyector multimodal en mmproj-Q8_0 y mmproj-f16 |
| Idiomas soportados | japonés (ja), inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (safetensors en el modelo base) |

## Arquitectura y entrenamiento

El modelo base es un ajuste fino mediante LoRA sobre un modelo de la familia Gemma 4, según indican las etiquetas del repositorio (`gemma4`, `lora`). La nomenclatura "E4B" es coherente con una arquitectura de mezcla de expertos (MoE) con aproximadamente 4.000 millones de parámetros activos sobre un total de 7.518 millones, aunque la información proporcionada no confirma explícitamente esta configuración. El modelo incorpora un proyector multimodal (mmproj), lo que indica que el modelo base conserva la torre de visión de Gemma 4 y puede procesar imágenes además de texto.

El ajuste fino está orientado a conversación con persona definida, roleplay y razonamiento con modo "thinking", con énfasis en japonés. No se dispone de información sobre el volumen de tokens de entrenamiento, la composición del dataset, ni si se aplicaron fases de RLHF o DPO. La cuantización realizada por mradermacher es estática (quantize_version 2) y con cuantización de tensores de salida (output_tensor_quantised 1), siguiendo su flujo habitual de conversión desde Hugging Face a GGUF.

## Capacidades

- Generación de texto conversacional en japonés e inglés, con especialización en mantener una persona consistente a lo largo de turnos.
- Roleplay y personificación: el ajuste LoRA está entrenado específicamente para interpretar personajes y sostener diálogos in-character.
- Modo "thinking": razonamiento explícito antes de responder, útil para tareas que requieren planificación.
- Procesamiento multimodal de imágenes mediante el proyector mmproj incluido en el repositorio.
- Conversación multi-turno con gestión de contexto (longitud exacta no disponible).
- Compatibilidad con endpoints y pipelines estándar de transformers y llama.cpp.
- No se ha confirmado soporte de tool calling, function calling ni comportamiento agéntico multi-paso.

## Casos de uso

- Asistentes de personaje para aplicaciones japonesas: el ajuste LoRA específico de persona permite desplegar chatbots in-character con coherencia a lo largo de sesiones, usando Q4_K_M (5,4 GB) en una GPU de consumo.
- Roleplay y ficción interactiva: el modelo mantiene registro y personalidad, adecuado para plataformas de narrativa interactiva donde la consistencia del personaje es crítica.
- Atención al cliente en japonés con tono definido: se puede fijar una persona corporativa mediante prompt de sistema y desplegar con llama.cpp u Ollama en servidores modestos.
- Procesamiento de documentos con imágenes en japonés: gracias al mmproj, puede describir capturas, formularios o diagramas acompañados de texto en japonés.
- Razonamiento asistido con trazas: el modo thinking permite usarlo en tareas de análisis donde se quiere auditar el razonamiento intermedio, por ejemplo clasificación de tickets con justificación.
- Prototipado local en estaciones de trabajo: las cuantizaciones Q4_K_S y Q4_K_M (5,3 y 5,4 GB) caben en GPUs consumer de 8 GB, permitiendo iterar sin infraestructura cloud.
- Evaluación comparativa de personas: investigadores pueden comparar el comportamiento del ajuste frente al Gemma 4 base usando la misma cuantización y decodificación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (solo pesos, sin KV cache): Q2_K ~4,5 GB; Q3_K_M ~5,0 GB; IQ4_XS ~5,2 GB; Q4_K_M ~5,4 GB; Q5_K_M ~5,9 GB; Q6_K ~6,3 GB; Q8_0 ~8,1 GB; f16 ~15,2 GB. Añadir 0,7-1,1 GB si se usa el proyector multimodal.
- GPU recomendadas: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070/4080/4090 para cuantizaciones Q4-Q8; A100/H100 solo necesarias para f16 con contexto largo o serving concurrente.
- Cabe en GPU consumer: sí, desde Q4_K_S en GPUs de 8 GB (RTX 3060 Ti, RTX 4060, RTX 3070) y con holgura en 12-16 GB para Q5/Q6.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, llama-cpp-python; el modelo base (safetensors) puede servirse con vLLM o TGI si se dispone de la versión no cuantizada.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| sakura-gemma-4-E4B-it (este) | 7,5B totales (E4B) | no disponible | ja, en | Apache 2.0 | GGUF, safetensors |
| Gemma 4 base (familia) | no disponible | no disponible | multilingüe | Gemma terms | safetensors, GGUF |
| Modelos de roleplay japoneses (p. ej. variantes de Qwen/ChatGPT fine-tuned) | variable | variable | ja, en | variable | variable |

No se dispone de datos de benchmarks que permitan una comparación cuantitativa con alternativas concretas. La comparativa cualitativa más directa es contra el Gemma 4 base sin ajuste, que no está especializado en persona ni roleplay, y contra otros ajustes japoneses de la misma familia, para los que no hay información en esta ficha.

## Limitaciones y advertencias

- Especializado en japonés e inglés: el rendimiento en castellano no está garantizado y probablemente sea inferior al de modelos multilingües generalistas.
- Riesgo de alucinación inherente a modelos de 7,5B totales; el modo thinking no elimina este riesgo y puede dar falsa sensación de rigor.
- El ajuste para roleplay y persona puede degradar el cumplimiento estricto de instrucciones en tareas de producción no conversacionales.
- No hay información sobre sesgos del dataset de ajuste; al ser un fine-tune sobre Gemma 4 hereda los sesgos del modelo base.
- Longitud de contexto no documentada: no asumir ventanas largas sin verificarlo empíricamente.
- La licencia Apache 2.0 se declara en el repo, pero conviene verificar los términos del modelo base Gemma 4 de Google antes de uso comercial, ya que pueden imponer restricciones adicionales.
- Las cuantizaciones Q2_K y Q3_K_S degradan notablemente la calidad; para producción se recomienda Q4_K_M o superior.
- El proyector multimodal debe descargarse por separado (mmproj-Q8_0 o mmproj-f16) y no todas las herramientas de inferencia lo soportan.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/sakura-gemma-4-E4B-it-GGUF
- Modelo base: https://huggingface.co/Takenoko12345678/sakura-gemma-4-E4B-it
- Quants imatrix/ponderados: https://huggingface.co/mradermacher/sakura-gemma-4-E4B-it-i1-GGUF
- Página de descargas del autor: https://hf.tst.eu/model#sakura-gemma-4-E4B-it-GGUF
- FAQ y peticiones de cuantización: https://huggingface.co/mradermacher/model_requests
- Guía de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Notas sobre tipos de cuantización (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
