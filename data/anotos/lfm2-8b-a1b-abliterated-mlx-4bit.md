# Anotos/LFM2-8B-A1B-Abliterated-MLX-4bit

## Resumen

LFM2-8B-A1B-Abliterated-MLX-4bit es una conversion cuantizada a 4 bits en formato MLX del modelo huihui-ai/Huihui-LFM2-8B-A1B-abliterated, que a su vez es una version "abliterated" (sin censura, con menor tendencia a rechazar peticiones) del LFM2-8B-A1B desarrollado por Liquid AI. La publica el usuario Anotos y esta pensada especificamente para ejecucion en Apple Silicon mediante la libreria MLX.

Se trata de un modelo de mezcla de expertos (MoE) con 8.339.930.560 parametros en total y aproximadamente 1.500 millones de parametros activos por token. La cuantizacion se realizo con mlx-lm 0.32.0, dejando los pesos en 4 bits (4,5 bits por peso en conjunto, con grupo de tamano 64) y manteniendo las puertas de enrutamiento de expertos en 8 bits. El archivo resultante ocupa 4,69 GB.

Su relevancia es doble: por un lado ofrece un MoE eficiente para hardware de Apple, y por otro incorpora la modificacion "abliterated" que elimina los mecanismos de rechazo, lo que lo hace atractivo para experimentacion con generacion sin restricciones, pero tambien plantea advertencias de seguridad y de licencia que conviene revisar antes de cualquier uso en produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mezcla de expertos (MoE), familia LFM2 (liquid) |
| Parametros totales | 8.339.930.560 (8,3B) |
| Parametros activos | Aproximadamente 1,5B por token |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | MLX 4-bit (4,5 bits por peso, grupo de 64; puertas de expertos en 8 bits) |
| Idiomas soportados | no disponible |
| Licencia | LFM Open License v1.0 (lfm1.0); uso comercial limitado a organizaciones por debajo del umbral de ingresos indicado en la licencia |
| Formato de pesos | safetensors (MLX), 4,69 GB |

## Arquitectura y entrenamiento

El modelo es una mezcla de expertos (MoE) de la familia LFM2 de Liquid AI, con 8,3B parametros totales y en torno a 1,5B activos por token. La arquitectura subyacente corresponde a LFM2 (etiquetada como "liquid" y "lfm2" en los tags), si bien la informacion disponible no detalla la composicion interna de capas, el numero de expertos ni la estrategia de atencion mas alla de confirmar el enrutamiento MoE.

No se dispone de datos sobre el entrenamiento original (numero de tokens, composicion del dataset, fases de RLHF/DPO) en la informacion proporcionada. Respecto a esta version concreta, los cambios respecto al modelo base son unicamente de cuantizacion: se convirtio y cuantizo con mlx-lm 0.32.0 mediante el comando `mlx_lm.convert --hf-path huihui-ai/Huihui-LFM2-8B-A1B-abliterated -q --q-bits 4`, manteniendo las puertas de enrutamiento de expertos a 8 bits y sin ninguna otra modificacion. El proceso de "abliteration" (eliminacion de la direccion de rechazo) se aplico en el modelo intermedio de huihui-ai, no en esta conversion.

## Capacidades

- Generacion de texto y conversacion (pipeline text-generation, etiqueta conversational).
- Modelo de mezcla de expertos con inferencia eficiente: solo activa alrededor de 1,5B parametros por token pese a tener 8,3B totales.
- Comportamiento "abliterated"/"uncensored": menor tendencia a rechazar peticiones que el modelo original sin modificar.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Capacidades de agente y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible (no se listan idiomas).
- Capacidades especiales (modo thinking, vision, audio): no disponible.
- Ejecucion nativa en Apple Silicon mediante MLX, tanto en Python (mlx-lm) como en Swift (mlx-swift-lm 3.31.4 o superior).

## Casos de uso

- Inferencia local en Mac: al estar cuantizado en 4 bits MLX y ocupar 4,69 GB, permite ejecutar un MoE de 8,3B en equipos Apple Silicon con memoria unificada moderada, sin necesidad de GPU dedicada.
- Prototipado de asistentes conversacionales sin filtros: util para investigacion sobre comportamiento de modelos cuando se eliminan los mecanismos de rechazo, comparando respuestas con la version original.
- Experimentacion academica sobre abliteration: permite estudiar como la eliminacion de la direccion de rechazo afecta a la calidad, coherencia y seguridad de las respuestas en un MoE.
- Pruebas de seguridad y red-teaming: sirve como contraparte "sin restricciones" para evaluar hasta que punto un modelo puede generar contenido problematico y calibrar filtros externos.
- Aplicaciones de escritorio en macOS: integrable en apps nativas de Apple (como la app Erato mencionada en los creditos) mediante mlx-swift-lm.
- Generacion de texto offline y privada: al ejecutarse en local sobre Apple Silicon, los datos no salen del dispositivo, adecuado para entornos con requisitos de privacidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/memoria: el archivo de pesos ocupa 4,69 GB; se recomienda disponer de al menos 6-8 GB de memoria unificada para cargar el modelo y el contexto de inferencia.
- GPU compatibles: Apple Silicon exclusivamente (chips M1, M2, M3, M4 y variantes Pro/Max/Ultra). El formato MLX no esta pensado para GPU NVIDIA/AMD ni CUDA.
- Cabe en hardware de consumo: si, en equipos Apple Silicon con memoria unificada suficiente; no es ejecutable en GPU de consumo tipo RTX 4090 mediante este formato.
- Opciones de despliegue: mlx-lm (Python, version 0.32.0 para la conversion) y mlx-swift-lm (Swift, version 3.31.4 o superior; versiones anteriores enrutan mal los expertos de este modelo).
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Activos | Contexto | Licencia | Formato |
|---|---|---|---|---|---|
| Anotos/LFM2-8B-A1B-Abliterated-MLX-4bit | 8,3B | ~1,5B | no disponible | LFM Open License v1.0 | MLX safetensors 4-bit |
| huihui-ai/Huihui-LFM2-8B-A1B-abliterated | 8,3B | ~1,5B | no disponible | no disponible | safetensors (sin cuantizar) |
| LiquidAI/LFM2-8B-A1B | 8,3B | ~1,5B | no disponible | LFM Open License v1.0 (lfm1.0) | safetensors |

La informacion proporcionada no incluye datos de rendimiento ni de contexto de estos modelos, por lo que la comparacion se limita a parametros, formato y licencia. No se dispone de resultados de benchmarks que permitan comparar con otras alternativas MoE de tamano similar.

## Limitaciones y advertencias

- Modelo "abliterated"/"uncensored": se ha modificado para rechazar menos peticiones, por lo que puede generar contenido danino, sesgado o inapropiado. No debe desplegarse sin filtros externos en aplicaciones de cara al publico.
- Riesgo de alucinacion: no se han publicado evaluaciones de fiabilidad en la informacion disponible.
- Idiomas soportados: no disponibles; se desconoce la cobertura multilingue real.
- Longitud de contexto: no disponible, lo que limita la planificacion de casos de uso con ventanas largas.
- Restricciones de licencia: LFM Open License v1.0 limita el uso comercial a organizaciones por debajo del umbral de ingresos indicado en la licencia; conviene revisar el archivo LICENSE antes de cualquier uso comercial.
- Compatibilidad restringida: solo funciona con MLX en Apple Silicon; requiere mlx-swift-lm 3.31.4 o superior en Swift, ya que versiones anteriores enrutan mal los expertos.
- Advertencia de seguridad: al eliminar los rechazos, el modelo puede producir contenido que incumpla politicas de plataformas o normativas; se recomienda su uso en entornos controlados de investigacion.
- Trazabilidad: es una conversion de terceros (Anotos) sobre un modelo intermedio de huihui-ai sobre el original de Liquid AI; los cambios respecto al original son de cuantizacion y de abliteration, lo que anade una capa de variabilidad respecto al modelo oficial.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Anotos/LFM2-8B-A1B-Abliterated-MLX-4bit
- Modelo base (abliterated): https://huggingface.co/huihui-ai/Huihui-LFM2-8B-A1B-abliterated
- Modelo original: https://huggingface.co/LiquidAI/LFM2-8B-A1B
- Perfil del autor de la abliteration: https://huggingface.co/huihui-ai
