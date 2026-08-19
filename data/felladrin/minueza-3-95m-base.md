# Felladrin/Minueza-3-95M-Base

## Resumen

Minueza-3-95M-Base es un modelo de lenguaje compacto en inglés desarrollado por Felladrin (Victor Nogueira), con arquitectura Gemma 3 y 94,7 millones de parámetros. Entrenado desde cero sobre 1.950 millones de tokens con una ventana de contexto de 8192, está pensado como base ligera para fine-tuning, no para uso directo en producción. Su singularidad radica en que se distribuye únicamente en formato GGUF, ya que fue entrenado íntegramente con un trainer propio en TypeScript sobre WebGPU, sin PyTorch en ninguna parte del stack.

El modelo se ofrece en tres cuantizaciones (f32, q8_0 y q4_0), donde el f32 actúa como maestro de entrenamiento y permite continuar el preentrenamiento gracias al estado del optimizador publicado. Con solo 94,7M de parámetros, presenta limitaciones severas en razonamiento y conocimiento factual, generando texto fluido pero frecuentemente incorrecto. Su relevancia actual reside en ser un artefacto de entrenamiento desde cero reproducible, ejecutable en navegador mediante Wllama y en máquinas sin GPU, además de servir como base para tareas de clasificación, reranking o fine-tuning instructivo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Gemma 3 (transformer decoder con sliding-window attention) |
| Parametros totales | 94.732.416 (94,7M, embeddings atados) |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | 8192 |
| Tipos de cuantizacion | f32, q8_0, q4_0 |
| Idiomas soportados | en (ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (unico formato disponible) |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura Gemma 3 con 12 bloques, embedding de 640 dimensiones, feed-forward de 2560, 10 cabezas de atencion con 5 cabezas KV y dimension de clave 64. Emplea atencion de ventana deslizante en 5 de cada 6 capas, con ventana local de 1024 y una capa global por cada seis, usando frecuencias RoPE distintas (1.000.000 para global, 10.000 para local). El tokenizador es un BPE a nivel de byte con vocabulario de 32.768, que reserva tokens especiales de ChatML, razonamiento y tool-calling para futuros fine-tunings sin modificar la matriz de embeddings.

El entrenamiento se realizo en dos fases, ambas en precision f32 sobre una APU AMD Strix Halo mediante el backend WebGPU. La fase A uso una mezcla de 722M tokens (c4 ~58%, cosmopedia-100k ~18%, github-code-clean ~14%, open-web-math ~10%) con 1,44B tokens vistos en 2 epocas. La fase B empleo un subconjunto de fineweb-edu de 508,7M tokens en 1 epoca. El optimizador combina Muon (Newton-Schulz orthogonalized momentum) para matmuls y AdamW para normas y embeddings, con learning rate 0,01 y 0,003 respectivamente, scheduler WSD con 10% warmup y 20% cooldown, y batch de 8x2048 tokens por paso. El throughput fue de ~900 tokens/s, totalizando unos 24,5 dias de computo. La perdida final fue 2,45 en la mezcla de fase A y 2,78 en fineweb-edu al final de la fase B.

## Capacidades

- Generacion de texto por continuacion: al ser un modelo base, completa secuencias de texto sin plantilla de chat.
- Fine-tuning: disenado para ser ajustado en tareas especificas como instruct, clasificacion, routing o reranking.
- Ejecucion en navegador: el archivo q4_0 de 55 MB puede ejecutarse en un navegador via Wllama.
- Reserva de tokens especiales: incluye tokens de ChatML, razonamiento y tool-calling en el tokenizador, aunque no fueron emitidos durante el preentrenamiento.
- Continuacion de preentrenamiento: el archivo f32 incluye el estado del optimizador, permitiendo reanudar el entrenamiento con el GGUF Trainer.
- Multilingue: no, solo ingles.
- Razonamiento y conocimiento factual: muy limitados por su tamano; produce texto fluido pero con errores frecuentes.

## Casos de uso

- Base para fine-tuning instructivo: se puede ajustar con datos de instrucciones para tareas de generacion de texto en dominios acotados, aprovechando los tokens ChatML reservados.
- Clasificacion y routing de texto: fine-tuning para clasificar documentos, categorizar consultas o enrutar peticiones a sistemas especializados, gracias a su tamano reducido y rapida inferencia.
- Reranking en pipelines de recuperacion: ajustado como modelo de reranking para filtrar resultados de busqueda o recuperacion aumentada (RAG) en entornos con recursos limitados.
- Ejecucion en navegador: integrable en aplicaciones web mediante Wllama para tareas de autocompletado o generacion asistida sin servidor.
- Estudio de entrenamiento desde cero: sirve como artefacto didactico para analizar el proceso de preentrenamiento, incluyendo el estado del optimizador y la configuracion de hiperparametros.
- Prototipado rapido en CPU: al caber en 55 MB (q4_0), permite probar flujos de generacion en maquinas sin GPU, por ejemplo en portatiles o dispositivos edge.

## Benchmarks y rendimiento

El autor publico resultados de evaluacion en HellaSwag (validacion, 10.042 tareas) y ARC-Challenge (validacion), medidos con `llama-perplexity --multiple-choice` en la misma maquina:

| Modelo | Params | HellaSwag | ARC-Challenge |
| :----- | :----- | :-------- | :------------ |
| Minueza-3-95M-Base | 94,7M | 29,25 +/- 0,45 | 24,08 +/- 2,48 |

No se proporcionan comparaciones con otros modelos en la informacion disponible. Los resultados son bajos en terminos absolutos, coherentes con el tamano del modelo.

## Requisitos de hardware

- VRAM estimada: el archivo q4_0 pesa 55 MB, q8_0 unos 95 MB y f32 unos 380 MB. Cabe en cualquier GPU moderna, incluso integradas, y en CPU sin problema.
- GPU recomendadas: no requiere GPU especifica; puede ejecutarse en CPU, en APUs como AMD Strix Halo, o en cualquier GPU con al menos 1 GB de VRAM.
- Compatibilidad con consumer GPU: si, cualquier GPU de consumo (incluso integradas) puede ejecutar el modelo sin problemas.
- Opciones de despliegue: llama.cpp (recomendado), Wllama para navegador, y el GGUF Trainer para continuar preentrenamiento.
- Latencia y throughput: durante el entrenamiento se lograron ~900 tokens/s en una APU; en inferencia con llama.cpp se espera una latencia muy baja, del orden de milisegundos por token en CPU moderna, aunque no se proporcionan mediciones oficiales.

## Comparativa con modelos similares

| Modelo | Params | Contexto | Formato | Licencia | HellaSwag | ARC-Challenge |
| :----- | :----- | :------- | :------ | :------- | :--------- | :------------ |
| Minueza-3-95M-Base | 94,7M | 8192 | GGUF | Apache 2.0 | 29,25 | 24,08 |
| Minueza-32M-Base | 32M | no disponible | Safetensors, GGUF, ONNX | no disponible | no disponible | no disponible |

No se dispone de datos de otros modelos comparables en la informacion proporcionada. Minueza-32M-Base es un modelo anterior del mismo autor, con menos parametros y sin datos de evaluacion publicados.

## Limitaciones y advertencias

- Razonamiento y conocimiento factual severamente limitados: el propio autor advierte que produce texto fluido pero frecuentemente incorrecto.
- Sesgos de la web: entrenado con texto de internet, puede reproducir sesgos presentes en los corpus (c4, cosmopedia, github, open-web-math, fineweb-edu).
- Modelo base sin plantilla de chat: no incluye formato de conversacion; requiere fine-tuning para uso interactivo.
- Penalizacion de repeticion obligatoria: sin ella, el modelo entra en bucles de repeticion debido a su tamano.
- Solo ingles: no soporta otros idiomas.
- Formato exclusivo GGUF: no hay checkpoint PyTorch; solo puede usarse con herramientas compatibles con GGUF (llama.cpp, Wllama, etc.).
- Riesgo de alucinacion: alto en tareas de generacion abierta; no apto para uso en produccion sin validacion externa.
- Licencia Apache 2.0: permite uso comercial, pero el modelo no es fiable para aplicaciones criticas sin fine-tuning y evaluacion adicional.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Felladrin/Minueza-3-95M-Base
- Repositorio del GGUF Trainer: https://github.com/felladrin/gguf-trainer
- Perfil de GitHub del autor: https://github.com/felladrin
- Proyecto MiniSearch (uso de Wllama): https://github.com/felladrin/MiniSearch
- Articulo sobre Minueza-32M (modelo anterior): https://www.linkedin.com/pulse/making-minueza-32m-transformer-model-trained-from-scratch-nogueira-wfrnf
- Modelo anterior Minueza-32M-Base: https://huggingface.co/Felladrin/Minueza-32M-Base
- Version GGUF de Minueza-32M-Base: https://huggingface.co/Felladrin/gguf-Minueza-32M-Base
