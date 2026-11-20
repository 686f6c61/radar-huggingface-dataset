# RRRong/GeoReader-Qwen3-VL-8B

## Resumen

GeoReader-Qwen3-VL-8B es un ajuste fino del modelo multimodal Qwen/Qwen3-VL-8B-Instruct orientado al razonamiento espacial y la comprensión de documentos geoespaciales. Lo publica el usuario RRRong (repositorio del proyecto en iris0329/GeoReader) como checkpoint final empleado en la fila Qwen3-VL-8B de la Tabla 2 de su trabajo. El modelo resuelve el problema de interpretar información espacial en imágenes —planos, mapas, vistas y documentos tecnicos— donde los modelos de vision-lenguaje genericos rinden por debajo de lo deseable.

Tecnicamente no es un checkpoint plano de Qwen3-VL, sino un wrapper GeoReader personalizado: el backbone Qwen3-VL ajustado, dos "Readers" congelados y un inyector condicionado por la pregunta. El repositorio incluye el state dict completo de PyTorch (22,4 GB) con los pesos de los Readers embebidos, ademas de los ficheros de configuracion necesarios para reconstruir la arquitectura. La licencia es Apache 2.0 y el pipeline declarado es image-text-to-text.

Su relevancia actual radica en que mejora de forma consistente al SFT vanilla sobre el mismo backbone en seis benchmarks de razonamiento espacial, con una ganancia media de +5,63 puntos porcentuales (64,42 a 70,05). Es, por tanto, una referencia util para quien trabaje en percepción espacial multimodal, aunque la carga portable del release aun no esta validada y el codigo publico de entrenamiento e inferencia esta en preparacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Wrapper GeoReader sobre transformer multimodal Qwen3-VL (backbone + dos Readers congelados + inyector condicionado por pregunta) |
| Parametros totales | no disponible (repo de 22,4 GB; backbone de 8B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (solo se distribuye `pytorch_model.bin` en precision original) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | PyTorch state dict (`pytorch_model.bin`); no se distribuye safetensors ni GGUF |

## Arquitectura y entrenamiento

El modelo parte de Qwen3-VL-8B-Instruct y le anade un wrapper GeoReader con dos componentes "Reader" congelados y un inyector condicionado por la pregunta, que combina la representacion visual con la consulta del usuario antes de pasarla al backbone. El checkpoint publicado conserva los nombres y valores originales de los tensores, e incluye los pesos de los Readers embebidos, por lo que los directorios de la Stage 1 no son descargas adicionales. Para reconstruirlo hay que usar `backbone_config.json` y `stage2_meta.json` junto con la implementacion GeoReader, ya que no es cargable con un `from_pretrained` estandar de Qwen3-VL.

El entrenamiento se realizo en dos etapas (Stage 1 de los Readers y Stage 2 del conjunto), con un dataset propio denominado RRRong/GeoReader-MultiSource. La comparacion de resultados usa el checkpoint de la epoca 2 tanto para GeoReader como para el SFT vanilla, que sirve de linea base. No se especifican en la informacion disponible el numero de tokens de entrenamiento, la composicion exacta del dataset ni si hubo RLHF o DPO.

## Capacidades

- Razonamiento espacial sobre imagenes: interpretacion de relaciones de posicion, orientacion y distancia entre elementos de una escena o documento.
- Comprension de documentos geoespaciales: planos, mapas, vistas y esquemas tecnicos con anotaciones espaciales.
- Generacion de texto e image-text-to-text conversacional, heredada del backbone Qwen3-VL-8B-Instruct.
- Capacidad multimodal de vision-lenguaje del backbone base (descripcion de imagenes, respuesta a preguntas visuales).
- Soporte de tool calling y function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible en la informacion proporcionada.
- Modo "thinking" explicito: no disponible en la informacion proporcionada.

## Casos de uso

- Analisis de planos de planta y esquemas de ingenieria: el modelo responde a preguntas condicionadas sobre la disposicion de habitaciones, elementos o cotas, aprovechando el inyector condicionado por pregunta del wrapper GeoReader.
- Interpretacion de mapas y cartografia: extraccion de relaciones espaciales entre puntos de interes, rutas o regiones en una imagen de mapa, tarea para la que el modelo supera al SFT vanilla en ViewSpatial (78,52 frente a 76,09).
- Asistencia en tareas de vision espacial tipo benchmark (VSI, SPBench, CV-Bench): util como referencia o componente en pipelines de evaluacion de razonamiento espacial multimodal.
- Analisis de imagenes de satelite o fotografia aerea en flujos de trabajo geoespaciales, apoyandose en la comprension visual del backbone Qwen3-VL.
- Respuesta a preguntas visuales sobre documentos tecnicos multi-fuente, dado el dataset de entrenamiento MultiSource del proyecto.
- Investigacion academica en razonamiento espacial: el repositorio incluye las salidas por pregunta y las puntuaciones oficiales de seis benchmarks (23.019 preguntas), lo que facilita la reproducibilidad de la comparacion.

## Benchmarks y rendimiento

Resultados en porcentaje de precision; la media es la media no ponderada de las seis metricas oficiales.

| Benchmark | Vanilla SFT | GeoReader | Diferencia (puntos) |
|---|---|---|---|
| VSI | 60,81 | 66,20 | +5,38 |
| SPBench | 69,01 | 76,72 | +7,71 |
| CV-Bench | 79,23 | 86,53 | +7,29 |
| SPAR-Bench | 60,48 | 65,71 | +5,23 |
| ViewSpatial | 76,09 | 78,52 | +2,43 |
| MMSI | 40,90 | 46,60 | +5,70 |
| Media | 64,42 | 70,05 | +5,63 |

Ambas filas usan el checkpoint final de la epoca 2. El resultado de la primera epoca del SFT (64,77) no se emplea en la comparacion.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la informacion proporcionada. El repo pesa 22,4 GB en precision original, lo que orienta sobre el orden de magnitud de la memoria necesaria para cargar los pesos completos.
- GPU recomendadas: no disponible en la informacion proporcionada.
- Compatibilidad con GPU de consumo: no disponible; al no distribuirse cuantizaciones, no puede confirmarse que quepa en tarjetas consumer.
- Opciones de despliegue: no disponible. El modelo es un wrapper personalizado que requiere la implementacion GeoReader del repositorio del proyecto; no se ha validado la carga portable del release.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Razonamiento espacial | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| GeoReader-Qwen3-VL-8B | 8B (backbone) | no disponible | Media de 70,05 en seis benchmarks | Apache 2.0 | Pesos en HF, carga no validada |
| Qwen3-VL-8B-Instruct (base) | 8B | no disponible | SFT vanilla de referencia: 64,42 | Apache 2.0 | Disponible en HF |
| Alternativas de vision-lenguaje de tamano similar | no disponible | no disponible | no disponible | no disponible | no disponible |

La unica comparacion con datos en la informacion proporcionada es frente al SFT vanilla del mismo backbone, que sirve como linea base controlada. No se aportan resultados de otros modelos de vision-lenguaje comparables.

## Limitaciones y advertencias

- La carga portable del release no ha sido validada; las puntuaciones archivadas se obtuvieron con la implementacion original, no con una carga estandar.
- El codigo publico de entrenamiento e inferencia esta aun en preparacion, lo que dificulta la reproduccion y el despliegue.
- Los pesos del SFT vanilla no estan incluidos; solo se conservan sus salidas de evaluacion.
- `stage2_meta.json` y los resumenes de evaluacion conservan rutas historicas de la maquina de entrenamiento, sin relevancia para la descarga.
- Riesgo de alusionacion: no cuantificado en la informacion disponible.
- Sesgos conocidos: no disponibles.
- Limitaciones de contexto e idioma: no disponibles.
- Aunque la licencia es Apache 2.0, conviene verificar las condiciones del backbone base Qwen3-VL antes de un uso comercial.
- El rendimiento en MMSI es el mas bajo de la tabla (46,60), lo que sugiere margen de mejora en ese benchmark.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/RRRong/GeoReader-Qwen3-VL-8B
- Modelo base: https://huggingface.co/Qwen/Qwen3-VL-8B-Instruct
- Repositorio del proyecto: https://github.com/iris0329/GeoReader
- Dataset de entrenamiento: https://huggingface.co/datasets/RRRong/GeoReader-MultiSource
