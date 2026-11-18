# dinokgc/SmolLM2-FT-DPO

## Resumen

SmolLM2-FT-DPO es un ajuste fino del modelo HuggingFaceTB/SmolLM2-135M-Instruct, publicado por el usuario dinokgc. Se trata de un modelo de lenguaje conversacional de pequeno tamano (134.515.008 parametros) entrenado mediante DPO (Direct Preference Optimization), una tecnica de alineacion que optimiza directamente las preferencias humanas sin necesidad de un modelo de recompensa separado. El modelo se enmarca en el contexto del curso "smol-course" de Hugging Face (etiqueta `module_1`), lo que sugiere que es un ejercicio didactico de ajuste fino mas que un modelo destinado a produccion.

La relevancia de este modelo es fundamentalmente educativa: demuestra el flujo completo de entrenamiento con TRL sobre una base pequena, permitiendo reproducir el proceso en hardware de consumo. No obstante, al derivar de SmolLM2-135M, hereda las limitaciones propias de un modelo de 135 millones de parametros, muy por debajo de los modelos de referencia actuales en razonamiento y conocimiento factual.

La model card es extremadamente escueta: no documenta el dataset de preferencias utilizado, el numero de pasos de entrenamiento, hiperparametros de DPO (beta, learning rate) ni resultados de evaluacion. Esto limita seriamente la evaluacion rigurosa del modelo y obliga a tratar muchos datos como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (derivada de SmolLM2-135M-Instruct) |
| Parametros totales | 134.515.008 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (el modelo base SmolLM2-135M-Instruct soporta 8.192 tokens, pero no se confirma para este ajuste) |
| Tipos de cuantizacion | no disponible (pesos en safetensors; cuantizacion GGUF/AWQ no publicada por el autor) |
| Idiomas soportados | no disponible (el modelo base esta entrenado mayoritariamente en ingles) |
| Licencia | no disponible (la model card indica "licence: license" sin especificar; el modelo base SmolLM2 se distribuye bajo Apache-2.0) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un ajuste fino por DPO sobre SmolLM2-135M-Instruct, que a su vez es un transformer decoder-only de 135 millones de parametros desarrollado por Hugging Face. La tecnica DPO (Rafailov et al., 2023) entrena el modelo directamente sobre pares de respuestas preferidas/rechazadas, eliminando la necesidad de entrenar un modelo de recompensa separado y de aplicar PPO. El entrenamiento se realizo con TRL 1.16.0, Transformers 5.20.2, PyTorch 2.14.1+cu130, Datasets 4.8.5 y Tokenizers 0.23.3.

No se especifica en la informacion disponible el dataset de preferencias empleado, el numero de ejemplos, el numero de epochs, el valor de beta ni la composicion del dataset. Tampoco se documenta si se aplicaron tecnicas adicionales como LoRA, quantized training o packing de secuencias. La ausencia de estos datos impide reproducir el entrenamiento o estimar su calidad de forma objetiva.

## Capacidades

- Generacion de texto conversacional multi-turno en formato de chat (roles user/assistant).
- Respuesta a preguntas abiertas y prompts de instruccion, heredadas del ajuste instructivo del modelo base.
- Alineacion basica de estilo y preferencias mediante DPO (respuestas potencialmente mas concisas o mejor valoradas que el modelo base, aunque no se documenta la mejora).
- Soporte de tool calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible; el tamano del modelo lo hace poco adecuado para estas tareas.
- Capacidades multilingues: no documentadas; el modelo base esta orientado principalmente al ingles.
- Capacidades especiales (vision, audio, thinking mode): no disponibles.

## Casos de uso

- Experimentacion didactica con DPO: el modelo sirve como ejemplo reproducible de un pipeline de alineacion con TRL sobre una base pequena, util para cursos y talleres donde se ensena el flujo completo de ajuste fino.
- Prototipado rapido de chatbots: al caber en cualquier GPU de consumo y ejecutarse en CPU con cuantizacion, permite validar interfaces conversacionales antes de migrar a modelos mayores.
- Generacion de texto en entornos con recursos muy limitados: despliegue en dispositivos edge, Raspberry Pi o contenedores sin GPU para tareas de generacion corta (resumenes breves, respuestas a FAQ).
- Filtrado y clasificacion ligera de texto: dado su bajo coste de inferencia, puede usarse como clasificador generativo de prompts o respuestas en pipelines de preprocesado.
- Benchmark de referencia para comparar tecnicas de alineacion: al ser un ajuste DPO documentado sobre una base publica, sirve como punto de partida para medir el efecto de distintos datasets de preferencias.
- Educacion e investigacion sobre alineacion: permite estudiar el comportamiento de DPO en modelos pequenos y analizar sesgos o artefactos introducidos por el ajuste.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16: aproximadamente 0,27 GB solo para pesos (134,5 M parametros x 2 bytes), mas overhead de activaciones y cache KV; en la practica, menos de 1 GB.
- VRAM estimada en cuantizacion de 8 bits: aproximadamente 0,14 GB para pesos; en 4 bits, aproximadamente 0,07 GB.
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3060, RTX 4060, RTX 4090) es mas que suficiente; tambien funciona en GPUs integradas y en CPU.
- Cabe holgadamente en GPU consumer y en dispositivos de bajos recursos.
- Opciones de despliegue: transformers (pipeline), text-generation-inference (etiqueta `text-generation-inference` presente), llama.cpp y Ollama requeririan conversion a GGUF no publicada por el autor.
- Latencia y throughput estimados: no disponibles; por el tamano del modelo se espera inferencia en decenas de milisegundos por token en GPU consumer, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| dinokgc/SmolLM2-FT-DPO | 134,5 M | no disponible | no disponible | Hugging Face |
| HuggingFaceTB/SmolLM2-135M-Instruct | 135 M | 8.192 tokens (segun model card del base) | Apache-2.0 | Hugging Face |
| HuggingFaceTB/SmolLM2-360M-Instruct | 360 M | 8.192 tokens (segun model card del base) | Apache-2.0 | Hugging Face |
| Qwen2.5-0.5B-Instruct | 494 M | 32.768 tokens | Apache-2.0 | Hugging Face |

No se dispone de datos de rendimiento comparativo para el modelo ajustado; la comparacion se limita a parametros, contexto y licencia.

## Limitaciones y advertencias

- Model card incompleta: no se documentan dataset de preferencias, hiperparametros de DPO, numero de pasos ni evaluacion, lo que impide verificar la calidad del ajuste.
- Licencia no especificada: la model card indica "licence: license" sin concrecion, lo que genera incertidumbre legal para uso comercial; conviene verificar la licencia del modelo base (Apache-2.0) y contactar con el autor.
- Tamano muy reducido (135 M): capacidad limitada de razonamiento, conocimiento factual escaso y alta propension a alucinaciones en preguntas abiertas.
- Idiomas: no se documenta soporte multilingue; el modelo base esta orientado al ingles, por lo que el rendimiento en castellano sera previsiblemente pobre.
- Contexto: no se confirma la ventana de contexto efectiva tras el ajuste; el valor del modelo base no debe asumirse sin verificacion.
- Riesgo de sesgos: al no documentarse el dataset de preferencias, no es posible evaluar sesgos introducidos por el ajuste.
- No apto para produccion en tareas criticas: sin benchmarks ni evaluacion de seguridad, su uso debe limitarse a experimentacion y prototipado.
- Cero descargas y cero likes en el momento de la consulta: no hay evidencia de uso comunitario ni validacion externa.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/dinokgc/SmolLM2-FT-DPO
- Modelo base: https://huggingface.co/HuggingFaceTB/SmolLM2-135M-Instruct
- Paper de DPO: https://huggingface.co/papers/2305.18290
- Repositorio TRL: https://github.com/huggingface/trl
- Paper DPO en NeurIPS 2023: http://papers.nips.cc/paper_files/paper/2023/hash/a85b405ed65c6477a4fe8302b5e06ce7-Abstract-Conference.html
