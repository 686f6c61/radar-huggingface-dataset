# Jundot/gemma-4-31B-it-oQ4e-mtp

## Resumen

`Jundot/gemma-4-31B-it-oQ4e-mtp` es un checkpoint cuantizado en formato MLX del modelo `google/gemma-4-31B-it`, el modelo denso de 30,7B parametros de la familia Gemma 4 de Google DeepMind. La cuantizacion la ha realizado el usuario Jundot mediante la herramienta oQ (oMLX v0.8.0), que aplica cuantizacion de precision mixta guiada por la sensibilidad medida de cada capa en lugar de un esquema uniforme de 4 bits. El resultado es un checkpoint de 31,74B parametros logicos almacenado en 19,09 GiB, con un promedio efectivo de 5,167 bits por peso en el conjunto completo y 4,801 bits por peso en el backbone de lenguaje.

El modelo conserva las capacidades del original: entrada de texto e imagen, modos de razonamiento configurables y una ventana de contexto de 256K tokens. Ademas, incorpora una cabeza de prediccion multi-token (MTP) fusionada desde `google/gemma-4-31B-it-assistant`, lo que permite decodificacion especulativa y por tanto acelerar la generacion en inferencia. La relevancia practica esta en que permite ejecutar un modelo multimodal de 31B con contexto muy largo en hardware Apple Silicon con un consumo de memoria cercano a los 20 GB, algo imposible con los pesos en BF16.

La distribucion de bits no es homogenea: el 68,6% de los pesos se almacenan en 4 bits afines con grupo de 64, el 27,1% en 5 bits, el 0,9% en 6 bits y el 3,3% restante se mantiene en BF16. Esa asignacion se decide midiendo la sensibilidad de cada capa y redondeando cada grupo con una matriz de importancia (128 muestras x 512 tokens) y un reajuste de escala y sesgo por minimos cuadrados ponderados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso multimodal (backbone de lenguaje + codificador de vision + cabeza MTP) |
| Parametros totales | 31.742.607.472 (31,74B) |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | 256K tokens |
| Tipos de cuantizacion | oQ4e de precision mixta: affine 4-bit grupo 64 (68,645%), affine 5-bit grupo 64 (27,141%), affine 6-bit grupo 64 (0,937%), BF16 (3,278%); 5,167 bits/peso efectivos en el checkpoint completo |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 (sujeta a la licencia Gemma 4) |
| Formato de pesos | safetensors en formato MLX (libreria `mlx`), repo de 40,1 GB |

## Arquitectura y entrenamiento

El modelo subyacente es un transformer denso de 30,7B parametros con codificador de vision, disenado para entrada image-text-to-text y con modos de pensamiento configurables. Este checkpoint concreto no ha sido reentrenado: es una conversion de pesos del modelo original de Google DeepMind. La unica modificacion estructural es la fusion de la cabeza de prediccion multi-token (MTP) procedente de `google/gemma-4-31B-it-assistant`, que anade 0,470B parametros logicos (0,875 GiB) y habilita decodificacion especulativa sobre el propio modelo.

El proceso de cuantizacion oQ4e asigna bits por sensibilidad de capa medida, en lugar de aplicar una tasa fija. Para el redondeo de cada grupo utiliza una matriz de importancia construida con 128 muestras de 512 tokens y un reajuste posterior de escala y sesgo mediante minimos cuadrados ponderados. El desglose de almacenamiento queda en 17,155 GiB para el backbone de lenguaje (30,697B), 1,064 GiB para el codificador de vision (0,576B) y 0,875 GiB para la cabeza MTP. La version actual del repo se recuantizo el 2026-11-19 con el redondeo oQe refinado de oMLX 0.8.0, que reduce el error de cuantizacion sin cambiar tamano ni velocidad. No se dispone de informacion sobre el dataset de entrenamiento original, el numero de tokens ni las fases de RLHF o DPO en la informacion proporcionada.

## Capacidades

- Generacion de texto y razonamiento con modos de pensamiento configurables (thinking modes).
- Comprension de imagenes: el pipeline declarado es image-text-to-text e incluye codificador de vision de 0,576B parametros.
- Contexto largo de hasta 256K tokens, adecuado para documentos extensos o conversaciones multi-turno prolongadas.
- Decodificacion especulativa mediante la cabeza MTP fusionada, que acelera la generacion sin necesidad de un modelo borrador separado.
- Capacidades multilingues: no disponible en detalle; el modelo base es de Google, pero la model card no enumera idiomas.
- Soporte de tool calling / function calling: no documentado en la informacion disponible.
- Soporte de agentes y razonamiento multi-paso: no documentado explicitamente, aunque los modos de pensamiento del modelo base estan orientados a tareas de razonamiento.
- Inferencia optimizada para el framework MLX en Apple Silicon.

## Casos de uso

- Procesamiento de documentos largos en local: con 256K tokens de contexto y unos 20 GB de memoria, se puede analizar un contrato o un informe completo en un Mac con Apple Silicon sin enviar datos a la nube.
- Asistente multimodal de escritorio: el modelo acepta imagenes y texto, por lo que sirve para transcribir y razonar sobre capturas, diagramas o fotografias dentro de una aplicacion nativa de macOS.
- Generacion asistida con baja latencia: la cabeza MTP permite decodificacion especulativa, util en autocompletado o chat interactivo donde importa el tiempo hasta el primer token y el throughput.
- Prototipado e investigacion en MLX: al ser un checkpoint de 4-6 bits con desglose documentado por capa, es util para estudiar el impacto de la precision mixta en calidad frente a cuantizaciones uniformes.
- Analisis de imagenes medicas o tecnicas en entornos con requisitos de privacidad: la ejecucion local evita la exposicion de datos sensibles a APIs externas.
- Resumen y extraccion de informacion de corpus extensos: la ventana de 256K permite ingerir varios articulos o transcripciones en una sola pasada, reduciendo la necesidad de pipelines RAG complejos.
- Desarrollo de agentes locales con razonamiento multi-paso: los modos de pensamiento configurables permiten alternar entre respuestas rapidas y cadenas de razonamiento mas largas segun la tarea.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo documenta metricas de cuantizacion (bits por peso, distribucion de precision y tamano de almacenamiento), no evaluaciones de calidad como MMLU, HumanEval o GSM8K, ni comparaciones con el modelo base en BF16.

## Requisitos de hardware

- VRAM o memoria unificada estimada: aproximadamente 19,1 GiB solo para los pesos; en la practica se necesitan entre 22 y 26 GB para margen de contexto y cache KV, dependiendo de la longitud de la secuencia.
- Hardware objetivo: Apple Silicon con MLX. Un Mac con 32 GB de memoria unificada es el minimo razonable; 64 GB o mas permite contextos largos sin problemas.
- GPU NVIDIA: el formato MLX no es compatible directamente con CUDA. Para A100, H100 o RTX 4090 habria que usar el modelo base en otro formato (por ejemplo, GGUF o safetensors estandar), no este checkpoint.
- Cabe en GPU de consumo: si, en equipos Apple con memoria unificada de 32 GB o superior. En GPUs de consumo con 24 GB (RTX 4090) no es utilizable tal cual por el formato.
- Opciones de despliegue: `mlx-lm` y el ecosistema MLX; la herramienta oMLX del autor. No es compatible con vLLM, llama.cpp, Ollama ni TGI sin conversion previa.
- Latencia y throughput: no disponibles. La cabeza MTP deberia mejorar el throughput frente a la decodificacion autorregresiva estandar, pero no se han publicado cifras.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Jundot/gemma-4-31B-it-oQ4e-mtp | 31,74B (denso) | 256K | MLX safetensors, 5,167 bits/peso | Apache-2.0 | Precision mixta con MTP; solo Apple Silicon |
| google/gemma-4-31B-it | 30,7B (denso) | 256K | safetensors BF16 | Apache-2.0 (Gemma 4) | Modelo base sin cuantizar; requiere mucha mas memoria |
| google/gemma-4-31B-it-assistant | no disponible | no disponible | safetensors | Apache-2.0 (Gemma 4) | Modelo borrador para decodificacion especulativa; aqui su cabeza MTP esta fusionada |
| Cuantizaciones GGUF de Gemma 4 31B | ~31B | 256K | GGUF Q4/Q5 | Apache-2.0 (Gemma 4) | Alternativa para llama.cpp y GPUs NVIDIA; no incluye MTP fusionado |

## Limitaciones y advertencias

- Solo funciona con MLX: no se puede cargar en vLLM, llama.cpp, Ollama, TGI ni en GPUs NVIDIA sin convertir los pesos, lo que limita su uso en produccion fuera del ecosistema Apple.
- La cuantizacion introduce perdida de calidad respecto al BF16 original; la model card no publica evaluaciones que cuantifiquen esa degradacion.
- La cabeza MTP fusionada anade complejidad: si el runtime no la soporta, se desperdicia memoria (0,875 GiB) sin beneficio.
- Riesgo de alucinacion inherente a los modelos de lenguaje de esta escala; no hay datos especificos de evaluacion de fidelidad en la informacion disponible.
- Idiomas soportados no documentados: no se puede asumir un rendimiento uniforme fuera del ingles sin evaluacion previa.
- La licencia del repo es Apache-2.0, pero remite a la licencia Gemma 4 de Google, que puede imponer condiciones adicionales de uso comercial; conviene revisarla antes de desplegar en produccion.
- El repo ocupa 40,1 GB, mas del doble del almacenamiento efectivo de los pesos (19,09 GiB), por lo que la descarga y el almacenamiento requieren planificacion.
- La model card advierte de que la version actual (2026-11-19) sustituye a cuantizaciones anteriores; copias antiguas tienen mayor error de cuantizacion.
- No hay informacion sobre sesgos especificos, datos de entrenamiento ni evaluaciones de seguridad del modelo base en la documentacion proporcionada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Jundot/gemma-4-31B-it-oQ4e-mtp
- Modelo base: https://huggingface.co/google/gemma-4-31B-it
- Modelo asistente (origen de la cabeza MTP): https://huggingface.co/google/gemma-4-31B-it-assistant
- Repositorio de la herramienta oQ / oMLX: https://github.com/jundot/omlx
- Pull request del redondeo oQe mejorado: https://github.com/jundot/omlx/pull/4930
- Pull request del refinamiento del redondeo oQe: https://github.com/jundot/omlx/pull/5292
- Licencia Gemma 4: https://ai.google.dev/gemma/docs/gemma_4_license
