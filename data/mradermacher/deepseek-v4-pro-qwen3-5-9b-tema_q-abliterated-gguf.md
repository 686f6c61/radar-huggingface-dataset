# mradermacher/DeepSeek-V4-Pro-Qwen3.5-9B-Tema_Q-Abliterated-GGUF

## Resumen

DeepSeek-V4-Pro-Qwen3.5-9B-Tema_Q-Abliterated es un modelo de lenguaje de 9.197.093.888 parámetros (aproximadamente 9,2 mil millones) derivado de la familia Qwen3.5 y destilado a partir de DeepSeek-V4-Pro, según indica su nombre y las etiquetas de la model card. La versión aquí descrita es una cuantización estática en formato GGUF publicada por mradermacher, un conocido generador de cuantizaciones de la comunidad, sobre el modelo base de yuna1126. Incorpora la etiqueta "Tema_Q-Abliterated", que sugiere una modificación del modelo orientada a eliminar o atenuar un tema concreto, aunque la información disponible no detalla el procedimiento exacto.

El modelo está orientado a razonamiento, matemáticas, STEM, uso de herramientas (tool calling / function calling) y generación de código, con soporte multilingüe declarado para inglés, chino, coreano, japonés, español y ruso. La licencia es Apache 2.0, lo que facilita su uso comercial y su integración en productos.

Su relevancia radica en que ofrece un modelo de ~9B parámetros con capacidades de razonamiento y tool use en un formato GGUF listo para ejecutarse en hardware de consumo mediante llama.cpp u Ollama, con múltiples niveles de cuantización que van desde 4,0 GB (Q2_K) hasta 18,5 GB (f16). No obstante, la información pública es escasa: no se detallan la longitud de contexto, los datos de entrenamiento ni resultados de benchmarks.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Qwen3.5, según etiquetas); detalles no disponibles |
| Parametros totales | 9.197.093.888 (~9,2B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | f16, Q8_0, Q6_K, Q5_K_M, Q5_K_S, Q4_K_M, Q4_K_S, IQ4_XS, Q3_K_L, Q3_K_M, Q3_K_S, Q2_K; además mmproj-f16 y mmproj-Q8_0 (suplemento multimodal) |
| Idiomas soportados | en, zh, ko, ja, es, ru |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (cuantizaciones estáticas); el modelo base en safetensors |

## Arquitectura y entrenamiento

La información disponible no permite confirmar la arquitectura interna más allá de las etiquetas de la model card, que apuntan a una base Qwen3.5 (transformer) con un proceso de destilación desde DeepSeek-V4-Pro. Las etiquetas incluyen "distillation", "sft", "rl" y "gspo", lo que sugiere un pipeline de entrenamiento que combina supervisión fina (SFT) y aprendizaje por refuerzo con GSPO (Group Sequence Policy Optimization), además de la destilación. También aparece la etiqueta "mtp", que podría referirse a multi-token prediction, aunque no se detalla su implementación.

No se especifican el número de tokens de entrenamiento, la composición del dataset ni los detalles del proceso de alineación. La etiqueta "Tema_Q-Abliterated" indica una modificación orientada a eliminar o reducir un tema concreto del modelo base, pero no se documenta el método (por ejemplo, abliteration o edición de pesos). Tampoco se detallan innovaciones técnicas como decodificación especulativa o atención lineal.

## Capacidades

- Generación de texto conversacional y de razonamiento multi-paso.
- Razonamiento matemático y resolución de problemas STEM (etiquetas "math" y "stem").
- Generación y asistencia en código.
- Tool calling y function calling (etiquetas "tool-use" y "function-calling").
- Capacidades multimodales parciales: el repositorio incluye ficheros mmproj (suplemento multimodal), lo que sugiere soporte de entrada de imágenes, aunque no se detalla su alcance.
- Soporte multilingüe en inglés, chino, coreano, japonés, español y ruso.
- Modo de razonamiento (etiqueta "reasoning"), presumiblemente con cadenas de pensamiento, aunque no se documenta el formato exacto.
- Compatible con endpoints (etiqueta "endpoints_compatible") y con text-generation-inference.

## Casos de uso

- Asistente de razonamiento matemático: el modelo puede resolver problemas paso a paso en entornos educativos o de análisis, aprovechando su entrenamiento en matemáticas y su modo de razonamiento.
- Generación de código en local: al ejecutarse en formato GGUF con llama.cpp u Ollama, permite autocompletar y generar código en estaciones de trabajo sin GPU dedicada de gama alta, usando cuantizaciones Q4_K_M (~5,9 GB).
- Agentes con tool calling: su soporte de function calling permite integrarlo en flujos de agentes que consultan APIs, bases de datos o servicios externos, con razonamiento multi-paso entre llamadas.
- Atención al cliente multilingüe: con soporte para seis idiomas, puede gestionar conversaciones en español, inglés, chino, coreano, japonés y ruso en un mismo despliegue.
- Procesamiento de documentos con imágenes: los ficheros mmproj permiten, en principio, incorporar entrada visual para tareas de extracción o descripción, aunque su alcance no está documentado.
- Despliegue en hardware de consumo: con cuantizaciones desde 4,0 GB, puede ejecutarse en portátiles y equipos con 8-16 GB de RAM/VRAM para tareas de generación de texto y razonamiento ligero.
- Prototipado e investigación: al ser Apache 2.0, sirve para experimentar con destilación, RL y edición de modelos sin restricciones comerciales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM/RAM estimada para inferencia (según cuantización): Q2_K ~4,0 GB; Q3_K_S ~4,5 GB; Q4_K_M ~5,9 GB; Q5_K_M ~6,7 GB; Q6_K ~7,7 GB; Q8_0 ~9,9 GB; f16 ~18,5 GB. Añadir ~0,7-1,0 GB si se usa el suplemento multimodal mmproj.
- GPU recomendadas: no se especifican en la información disponible. Por tamaño, una RTX 4090 (24 GB) puede ejecutar f16 con holgura y Q8_0 sin problema; una RTX 3060 (12 GB) puede ejecutar Q8_0 y Q6_K; GPUs con 8 GB pueden ejecutar Q4_K_M.
- Cabe en GPU de consumo: sí, en la mayoría de configuraciones con cuantizaciones Q4_K_M o inferiores; también en CPU con RAM suficiente.
- Opciones de despliegue: llama.cpp, Ollama (formato GGUF), y potencialmente text-generation-inference y transformers para el modelo base. No se confirman vLLM ni otras opciones en la información disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| DeepSeek-V4-Pro-Qwen3.5-9B-Tema_Q-Abliterated (este) | ~9,2B | no disponible | Apache 2.0 | GGUF, safetensors (base) | Destilado de DeepSeek-V4-Pro, orientado a razonamiento y tool use |
| Qwen3.5-9B (base de referencia) | ~9B | no disponible | no disponible | safetensors | Modelo original del que deriva; sin destilación ni modificación Tema_Q |
| DeepSeek-V4-Pro | no disponible | no disponible | no disponible | no disponible | Modelo profesor del que se destila; tamaño y contexto no disponibles |

No se dispone de datos de rendimiento para establecer una comparación cuantitativa con alternativas de la misma categoría.

## Limitaciones y advertencias

- La información pública es muy escasa: no se documentan contexto, datos de entrenamiento, benchmarks ni detalles del proceso de alineación, lo que dificulta evaluar su calidad real.
- La modificación "Tema_Q-Abliterated" puede afectar al comportamiento del modelo en el tema eliminado, con riesgo de respuestas degradadas o sesgadas en ese ámbito; no se especifica qué tema es.
- Riesgo de alucinación inherente a los modelos de ~9B, especialmente en tareas de razonamiento prolongado o dominios especializados.
- No se especifica la longitud de contexto, por lo que no se puede garantizar el rendimiento en conversaciones o documentos largos.
- Aunque la licencia es Apache 2.0, conviene verificar las condiciones del modelo base (yuna1126/DeepSeek-V4-Pro-Qwen3.5-9B-Tema_Q-Abliterated) y de los modelos de origen (Qwen3.5, DeepSeek-V4-Pro) antes de un uso comercial.
- El soporte multimodal a través de mmproj no está documentado en cuanto a alcance ni calidad; no debe asumirse un rendimiento equiparable a modelos visión-lenguaje dedicados.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica ausencia de validación por parte de la comunidad.

## Enlaces

- [HuggingFace: mradermacher/DeepSeek-V4-Pro-Qwen3.5-9B-Tema_Q-Abliterated-GGUF](https://huggingface.co/mradermacher/DeepSeek-V4-Pro-Qwen3.5-9B-Tema_Q-Abliterated-GGUF)
- [Modelo base: yuna1126/DeepSeek-V4-Pro-Qwen3.5-9B-Tema_Q-Abliterated](https://huggingface.co/yuna1126/DeepSeek-V4-Pro-Qwen3.5-9B-Tema_Q-Abliterated)
- [Cuantizaciones con imatrix (i1-GGUF)](https://huggingface.co/mradermacher/DeepSeek-V4-Pro-Qwen3.5-9B-Tema_Q-Abliterated-i1-GGUF)
- [Página de descargas del autor](https://hf.tst.eu/model#DeepSeek-V4-Pro-Qwen3.5-9B-Tema_Q-Abliterated-GGUF)
- [FAQ y solicitudes de cuantización de mradermacher](https://huggingface.co/mradermacher/model_requests)
- [README de referencia de TheBloke sobre uso de GGUF](https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF)
- [Notas de Artefact2 sobre tipos de cuantización](https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9)
