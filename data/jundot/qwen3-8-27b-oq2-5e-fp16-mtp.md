# Jundot/Qwen3.8-27B-oQ2.5e-fp16-mtp

## Resumen

Qwen3.8-27B-oQ2.5e-fp16-mtp es una cuantizacion mixta de precision del modelo Qwen/Qwen3.8-27B, un modelo denso de vision-lenguaje de 27.781 millones de parametros construido sobre la arquitectura Qwen3.5. Lo publica el usuario Jundot mediante la herramienta oQ (oMLX v0.8.0), un pipeline de cuantizacion de precision mixta orientado al ecosistema MLX de Apple Silicon. El checkpoint incluye el backbone de lenguaje, el codificador visual y la cabeza de prediccion multi-token (MTP).

El modelo base combina capas de Gated DeltaNet con capas de Gated Attention en un diseno hibrido, admite comprension de imagen y video, y ofrece una ventana de contexto nativa de 262.144 tokens. La cuantizacion reduce el peso efectivo a 3,943 bits por parametro en el checkpoint completo (3,431 bits/parametro en el backbone de lenguaje), almacenando en un unico repositorio de 13,7 GB lo que en precision original ocuparia decenas de gigabytes.

Su relevancia practica es que permite ejecutar un modelo multimodal de 27B con contexto largo en hardware Apple Silicon con memoria unificada moderada, manteniendo en FP32 el codificador visual para no degradar la percepcion de imagen. La licencia Apache-2.0 heredada del modelo fuente facilita el uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer hibrido con capas Gated DeltaNet y Gated Attention (familia Qwen3.5), con codificador visual y cabeza MTP |
| Parametros totales | 27.781.427.952 (27.781B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 262.144 tokens (contexto nativo) |
| Tipos de cuantizacion | Mezcla de affine 2, 3, 4, 5, 6 y 8 bits con grupos de 64 y 128, mas tensores FP16 y FP32; promedio efectivo de 3,943 bits/parametro |
| Idiomas soportados | No disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (libreria MLX) |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-27B es un transformer denso de 27.781 millones de parametros con un layout hibrido que alterna capas de Gated DeltaNet (mecanismo de estado recurrente con puertas) y capas de Gated Attention clasicas. Esta combinacion busca reducir el coste computacional y de memoria en secuencias largas manteniendo la calidad de atencion. El checkpoint incorpora ademas un codificador visual para tareas de imagen y video, y una cabeza de prediccion multi-token (MTP) de 0,425B parametros que permite decodificacion especulativa interna.

La cuantizacion aplicada por oQ asigna bits por sensibilidad medida de cada capa, redondea cada grupo con una matriz de importancia (128 muestras x 512 tokens) y reajusta escala y sesgo mediante minimos cuadrados ponderados. La distribucion resultante concentra el 73,8% de los pesos en affine 3-bit con grupo 128, reserva el 10,0% en 5-bit y el 8,4% en 2-bit, y mantiene el codificador visual integramente en FP32 (1,658% de los pesos, 1,716 GiB). No se dispone de informacion sobre el volumen de tokens de entrenamiento, la composicion del dataset ni las etapas de RLHF o DPO del modelo base en la informacion proporcionada.

## Capacidades

- Generacion de texto y razonamiento conversacional multi-turno.
- Comprension de imagen (image-text-to-text) mediante el codificador visual en FP32.
- Comprension de video, segun la model card del checkpoint.
- Procesamiento de contexto largo: hasta 262.144 tokens nativos.
- Decodificacion multi-token (MTP) para acelerar la generacion mediante prediccion especulativa.
- Capacidades multilingues: no disponible en la informacion proporcionada.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Modo thinking explicito: no disponible en la informacion proporcionada.

## Casos de uso

- Analisis de documentos largos con imagenes intercaladas: el contexto de 262.144 tokens permite cargar informes, contratos o articulos completos junto con sus figuras y hacer preguntas sobre el conjunto sin fragmentar el material.
- Asistencia sobre capturas y diagramas en local: un desarrollador puede enviar diagramas de arquitectura, errores de consola o bocetos de interfaz y obtener explicaciones, aprovechando el codificador visual en FP32 y la ejecucion en MLX sobre un Mac.
- Procesamiento de video para resumenes: la capacidad de video understanding permite extraer descripciones, transcripciones de escenas o resumenes de grabaciones sin subir el material a la nube.
- Chat conversacional privado en estacion de trabajo Apple: al caber en memoria unificada de un Mac con 16-24 GB, es viable desplegar un asistente que no envia datos a terceros, util en entornos con requisitos de confidencialidad.
- Prototipado rapido de aplicaciones multimodales: el formato MLX y el peso reducido (13,7 GB) permiten iterar sobre pipelines de image-text-to-text en portatiles con chip M-series antes de escalar a produccion.
- Evaluacion de modelos Qwen3.5 en investigacion: sirve como referencia cuantizada para estudiar la degradacion de calidad frente al checkpoint original y para comparar estrategias de cuantizacion mixta.
- Generacion de descripciones accesibles de imagenes y video en lotes: el modelo puede producir alt-text y subtitulos descriptivos para bibliotecas multimedia ejecutandose en local.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/memoria estimada: el checkpoint ocupa 13,7 GB en disco (12,752 GiB de pesos); en inferencia hay que sumar la cache KV para el contexto utilizado, por lo que se recomienda un minimo de 16 GB de memoria unificada y 24 GB o mas para contextos largos.
- GPU recomendadas: exclusivamente Apple Silicon (M1, M2, M3, M4 y variantes Pro, Max y Ultra) por el formato MLX; no es compatible con CUDA sin conversion previa.
- Cabe en GPU de consumo: si, en Mac con 16 GB o mas de memoria unificada; en GPUs NVIDIA consumer requeriria reconvertir los pesos a otro formato, lo que no se cubre en esta ficha.
- Opciones de despliegue: MLX y oMLX (herramienta del autor); vLLM, llama.cpp, Ollama y TGI no soportan este checkpoint tal cual.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Modalidad | Licencia | Formato |
|---|---|---|---|---|---|
| Qwen3.8-27B-oQ2.5e-fp16-mtp (este) | 27,781B | 262.144 | Imagen, video y texto | Apache-2.0 | MLX safetensors |
| Qwen/Qwen3.8-27B (modelo base) | 27,781B | 262.144 | Imagen, video y texto | Apache-2.0 | safetensors (BF16/FP16) |
| Otras cuantizaciones del mismo base | 27,781B | 262.144 | Imagen, video y texto | Apache-2.0 | segun herramienta (no disponible) |

No se dispone de datos de rendimiento comparado con alternativas de la misma categoria en la informacion proporcionada.

## Limitaciones y advertencias

- La cuantizacion a 3,943 bits/parametro promedio introduce perdida de calidad respecto al modelo base; las capas en 2-bit (8,4% de los pesos) son las mas expuestas a degradacion.
- El checkpoint esta atado al ecosistema MLX: no se puede cargar directamente en vLLM, TGI, llama.cpp ni Ollama sin reconversion.
- El codificador visual se mantiene en FP32 y suma 1,716 GiB, lo que eleva el consumo de memoria frente a una cuantizacion puramente de lenguaje.
- Riesgo de alucinacion inherente a los modelos generativos; no hay datos publicados sobre tasas de error en esta version cuantizada.
- Sesgos conocidos del modelo base: no disponibles en la informacion proporcionada.
- Idiomas soportados no documentados en esta ficha; conviene validar el comportamiento en castellano antes de usarlo en produccion.
- La model card advierte de que la version del 19 de noviembre de 2026 sustituye a la anterior por un redondeo oQe refinado; las copias antiguas deben descargarse de nuevo.
- Licencia Apache-2.0 permite uso comercial, pero se recomienda revisar el archivo LICENSE del repositorio y las condiciones del modelo base.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Jundot/Qwen3.8-27B-oQ2.5e-fp16-mtp
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Repositorio de la herramienta oQ/oMLX: https://github.com/jundot/omlx
- Pull request del redondeo oQe mejorado: https://github.com/jundot/omlx/pull/4930
- Pull request del refinamiento de redondeo oQe: https://github.com/jundot/omlx/pull/5292
