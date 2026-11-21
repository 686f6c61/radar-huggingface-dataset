# Jundot/Qwen3.8-27B-oQ4e-mtp

## Resumen

Qwen3.8-27B-oQ4e-mtp es una cuantizacion de precision mixta en formato MLX del modelo Qwen/Qwen3.8-27B, un modelo denso de 27.781 millones de parametros de tipo vision-lenguaje construido sobre la arquitectura Qwen3.5. La publica el usuario Jundot mediante la herramienta oQ (oMLX v0.8.0), que asigna bits por capa segun su sensibilidad medida en lugar de aplicar una cuantizacion uniforme. El checkpoint incluye el backbone de lenguaje, el codificador visual y la cabeza de prediccion multi-token (MTP).

El modelo resuelve el problema de ejecutar un VLM de 27B con contexto nativo de 262.144 tokens en hardware Apple Silicon con un consumo de almacenamiento de 17,5 GB, frente a los aproximadamente 55 GB que ocuparia en BF16. La cuantizacion resultante tiene un promedio efectivo de 5,044 bits por peso para el checkpoint completo y 4,840 bits por peso para el backbone de lenguaje, lo que lo situa entre una cuantizacion de 4 y 5 bits convencional pero con distribucion no uniforme.

Es relevante ahora porque combina tres elementos poco frecuentes en un mismo artefacto: cuantizacion mixta guiada por sensibilidad, soporte de vision y video, y una ventana de contexto muy larga, todo bajo licencia Apache-2.0 y con un formato (MLX) optimizado para el ecosistema de Apple. Con 39.379 descargas y 88 likes, es una de las opciones practicas para desplegar un VLM grande en un Mac equipado con memoria unificada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer hibrido con capas Gated DeltaNet y Gated Attention (Qwen3.5), con codificador visual y cabeza MTP |
| Parametros totales | 27.781.427.952 (27,781B) |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | 262.144 tokens nativos |
| Tipos de cuantizacion | Precision mixta oQ4e: affine 4-bit (grupo 64), 5-bit, 6-bit, 8-bit y BF16 por capa |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors en formato MLX (libreria mlx) |

Desglose de almacenamiento por componente:

| Componente | Pesos logicos | Almacenamiento |
|---|---|---|
| Backbone de lenguaje | 26,896B | 16,272 GB / 15,155 GiB |
| Codificador visual | 0,461B | 0,921 GB / 0,858 GiB |
| Cabeza MTP | 0,425B | 0,323 GB / 0,301 GiB |
| Total | 27,781B | 17,517 GB / 16,314 GiB |

Distribucion de bits por peso:

| Formato | Pesos logicos | Porcentaje | Almacenamiento | Bits/peso efectivos |
|---|---|---|---|---|
| Affine 4-bit, grupo 64 | 19,393B | 69,807% | 10,160 GiB | 4,50 |
| Affine 5-bit, grupo 64 | 6,579B | 23,680% | 4,212 GiB | 5,50 |
| Affine 6-bit, grupo 64 | 1,282B | 4,615% | 0,970 GiB | 6,50 |
| Affine 8-bit, grupo 64 | 0,011B | 0,041% | 0,011 GiB | 8,50 |
| BF16 | 0,516B | 1,857% | 0,961 GiB | 16,00 |
| Total | 27,781B | 100% | 16,314 GiB | 5,044 |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-27B emplea una arquitectura hibrida que intercala capas Gated DeltaNet (un mecanismo de atencion lineal con estado recurrente) y capas de Gated Attention clasicas. Esta combinacion busca reducir el coste computacional y de memoria en contextos largos manteniendo la calidad de recuperacion de informacion. El modelo es denso, no utiliza mezcla de expertos, y suma un codificador visual para entrada de imagen y video, ademas de una cabeza de prediccion multi-token (MTP) que permite decodificacion especulativa interna y acelera la generacion.

El checkpoint publicado no aporta datos sobre el entrenamiento del modelo base: no se especifica el numero de tokens, la composicion del dataset ni si hubo etapas de RLHF o DPO. Lo que si documenta el autor es el proceso de cuantizacion: oQ4e mide la sensibilidad de cada capa, asigna en consecuencia un numero de bits (4, 5, 6 u 8, con un 1,857% de pesos mantenidos en BF16) y redondea cada grupo de 64 elementos usando una matriz de importancia calculada sobre 128 muestras de 512 tokens, con un reajuste posterior de escala y sesgo por minimos cuadrados ponderados. La version actual (actualizada el 2026-11-19) re-cuantiza con el redondeo oQe refinado de oMLX 0.8.0, que reduce el error de cuantizacion sin cambiar tamano ni velocidad.

## Capacidades

- Generacion de texto y razonamiento conversacional multi-turno.
- Comprension de imagen y video, con pipeline image-text-to-text.
- Procesamiento de contexto largo: hasta 262.144 tokens nativos, adecuado para documentos extensos, bases de codigo o transcripciones largas.
- Decodificacion multi-token mediante la cabeza MTP incluida en el checkpoint, orientada a acelerar la inferencia.
- Capacidades multilingues: no disponibles en la informacion proporcionada.
- Soporte de tool calling y function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Modo thinking, audio u otras capacidades especiales: no disponible en la informacion proporcionada.

## Casos de uso

- Analisis de documentos extensos en local: con 262.144 tokens de contexto, el modelo puede ingerir informes anuales, expedientes o libros completos en una sola pasada sin fragmentacion ni recuperacion externa, lo que simplifica el pipeline y evita errores de troceado.
- Procesamiento de video y fotogramas en Mac: el codificador visual integrado permite describir, resumir o extraer informacion estructurada de video, util para catalogacion de archivos audiovisuales o generacion de subtitulos descriptivos en un flujo totalmente local.
- Asistente de desarrollo en estacion de trabajo Apple Silicon: al ocupar 17,5 GB, el modelo cabe en un Mac con 32 GB o 64 GB de memoria unificada y puede usarse como asistente de codigo y revision de parches sin enviar codigo propietario a servicios externos.
- Extraccion de datos de formularios y facturas escaneadas: la combinacion de vision y contexto largo permite pasar lotes de documentos en una misma sesion y devolver campos estructurados, manteniendo la coherencia entre documentos del mismo lote.
- Investigacion academica con datos sensibles: al ser Apache-2.0 y ejecutarse en local, encaja en entornos con requisitos de confidencialidad (datos clinicos, juridicos) donde no es viable usar APIs de terceros.
- Prototipado rapido de aplicaciones multimodales: el formato MLX y la libreria mlx permiten cargar el modelo en Python en pocas lineas, lo que agiliza la validacion de ideas antes de invertir en infraestructura GPU.
- Transcripcion y analisis de reuniones largas: la ventana de contexto cubre varias horas de transcripcion, permitiendo resumir, extraer acuerdos y generar tareas en una sola llamada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM o memoria unificada: el checkpoint ocupa 16,314 GiB en disco; en ejecucion hay que sumar la cache KV, que con 262.144 tokens de contexto puede ser considerable y depende de la implementacion.
- Hardware objetivo: Apple Silicon con memoria unificada. Con 32 GB es viable para contextos moderados; 64 GB o mas es recomendable para aprovechar la ventana completa.
- GPU NVIDIA: el formato es MLX, por lo que no es directamente ejecutable en CUDA sin conversion previa a otro formato.
- Cabe en GPU de consumo: si, en equipos Apple con memoria unificada de 32 GB o superior; no esta pensado para RTX 4090 ni similares por incompatibilidad de formato.
- Opciones de despliegue: libreria mlx y el ecosistema oMLX del mismo autor. No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI en la informacion disponible.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Jundot/Qwen3.8-27B-oQ4e-mtp | 27,781B | 262.144 | MLX safetensors, precision mixta | Apache-2.0 | Vision y video, cabeza MTP, 17,5 GB |
| Qwen/Qwen3.8-27B (base) | 27,781B | 262.144 | safetensors BF16 | Apache-2.0 | Referencia sin cuantizar, aproximadamente 55 GB en BF16 |
| Cuantizaciones uniformes de 4 bits del mismo base | 27,781B | 262.144 | segun herramienta | Apache-2.0 | Menor granularidad adaptativa; datos concretos no disponibles |

La comparacion con alternativas de otros fabricantes (por ejemplo, VLMs densos de tamano similar con contexto largo) no esta disponible en la informacion proporcionada.

## Limitaciones y advertencias

- La cuantizacion introduce perdida de precision respecto al modelo base; aunque oQ4e reduce el error frente a esquemas uniformes, no es equivalente a BF16 en tareas de razonamiento fino o generacion de codigo critico.
- El autor indica que la version actual reemplaza a copias anteriores; es necesario re-descargar para obtener el redondeo oQe refinado.
- El formato MLX limita el despliegue al ecosistema Apple; no hay artefactos GGUF ni CUDA publicados en este repositorio.
- No se documentan idiomas soportados, lo que impide garantizar calidad en castellano sin evaluacion propia.
- No hay datos publicados de benchmarks, sesgos ni tasas de alucinacion; cualquier decision de produccion requiere evaluacion empirica sobre el caso de uso concreto.
- La ventana de 262.144 tokens implica un consumo de memoria en cache KV que puede exceder la capacidad de equipos con 32 GB si se usa el contexto completo.
- La licencia Apache-2.0 permite uso comercial, pero se heredan las condiciones del modelo base; conviene revisar la model card de Qwen/Qwen3.8-27B para cualquier restriccion adicional de uso aceptable.
- El pipeline declarado es image-text-to-text; el soporte real de video deberia validarse en la practica antes de depender de el.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Jundot/Qwen3.8-27B-oQ4e-mtp
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Repositorio de la herramienta oQ / oMLX: https://github.com/jundot/omlx
- Pull request de mejora oQe: https://github.com/jundot/omlx/pull/4930
- Pull request de refinamiento del redondeo oQe: https://github.com/jundot/omlx/pull/5292
