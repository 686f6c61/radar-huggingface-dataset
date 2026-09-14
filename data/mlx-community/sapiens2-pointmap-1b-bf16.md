# mlx-community/sapiens2-pointmap-1b-bf16

## Resumen

`mlx-community/sapiens2-pointmap-1b-bf16` es la conversion a formato MLX (Apple Silicon) del modelo `facebook/sapiens2-pointmap-1b`, un modelo de vision centrado en el cuerpo humano desarrollado por Meta dentro de la familia Sapiens2 (presentada en ICLR 2026). Su tarea es la prediccion densa de mapas de puntos: para cada pixel de la imagen de entrada genera coordenadas XYZ tridimensionales, ademas de un factor de escala. No es un modelo de lenguaje: no genera texto ni mantiene conversaciones, sino que produce tensores numericos a partir de imagenes.

La relevancia de esta ficha concreta es doble. Por un lado, Sapiens2 es la evolucion del proyecto Sapiens original de Meta, orientado a tareas human-centric como segmentacion, profundidad y pose. Por otro, esta version es una conversion comunitaria de `mlx-community` pensada para ejecutarse en Macs con chip Apple Silicon mediante la libreria `mlx-vlm` 0.7.0, lo que permite hacer inferencia local sin GPU NVIDIA. La conversion reduce el checkpoint original en float32 (aproximadamente el doble de tamano) a un unico fichero `model.safetensors` de 3,26 GB en bfloat16, con las proyecciones q/k/v fusionadas en un tensor `wqkv` por bloque tal y como espera la implementacion de Sapiens2 en mlx-vlm.

El modelo declara 1.629.594.164 parametros (aproximadamente 1,63 mil millones) y esta publicado bajo la licencia propietaria `sapiens2-license` de Meta, no bajo una licencia de codigo abierto estandar, lo que condiciona su uso comercial. El pipeline declarado en HuggingFace es `depth-estimation`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo de vision para prediccion densa (pointmap / depth-estimation). Detalle interno de la arquitectura no disponible en la informacion proporcionada |
| Parametros totales | 1.629.594.164 (aproximadamente 1,63 B) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica (modelo de vision, no de texto) |
| Tipos de cuantizacion | bfloat16 (bf16). Otras cuantizaciones no disponibles |
| Idiomas soportados | No disponible (modelo de vision, no procesa lenguaje natural) |
| Licencia | `sapiens2-license` (license: other, license_name: sapiens2-license) |
| Formato de pesos | safetensors (MLX). Fichero `model.safetensors` de 3,26 GB; repositorio de 3,3 GB |
| Modelo base | facebook/sapiens2-pointmap-1b |
| Libreria | mlx (mlx-vlm 0.7.0) |
| Pipeline declarado | depth-estimation |
| Fecha de creacion en HuggingFace | 2026-09-13 |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

Segun la model card, se trata de una conversion del checkpoint original `facebook/sapiens2-pointmap-1b` a bfloat16. El proceso de conversion, realizado con `mlx-vlm` 0.7.0, aplica dos transformaciones: convierte todos los parametros a bfloat16 (precision con la que el modelo de referencia ya ejecuta inferencia en modo mixed precision) y fusiona las proyecciones q/k/v en un unico tensor `wqkv` por bloque, tal y como espera la implementacion Sapiens2 de mlx-vlm. El checkpoint original en float32 ocupa el doble que esta version.

No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset, ni sobre si se aplicaron tecnicas de ajuste como RLHF o DPO (habitualmente no aplicables a un modelo de vision de este tipo). Tampoco se detallan en el material disponible innovaciones tecnicas internas del backbone (tipo de atencion, uso de decodificacion especulativa u otros). El unico dato funcional confirmado es que el modelo produce mapas de puntos XYZ por pixel mas un factor de escala, con salidas en formato numpy a la resolucion de la imagen de entrada para tareas densas, o en coordenadas de pixel de la imagen original para tareas de pose.

## Capacidades

- Prediccion de mapas de puntos (pointmaps): genera coordenadas XYZ por pixel a partir de una imagen, con salida de forma (H, W, 3).
- Estimacion de escala: devuelve un factor de escala asociado a la prediccion de pointmap.
- Estimacion de profundidad: el pipeline declarado es depth-estimation, lo que implica capacidad de generar mapas de profundidad densos.
- Procesamiento human-centric: la etiqueta `human-centric` y la familia Sapiens2 indican especializacion en cuerpos humanos, no en escenas genericas.
- Soporte para tareas densas y de pose: la model card menciona salidas a resolucion de entrada para tareas densas y en coordenadas de pixel de imagen fuente para pose.
- No soporta generacion de texto, razonamiento, codigo ni matematicas.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- Capacidades multilingues: no aplica, ya que no es un modelo de lenguaje.
- Capacidades especiales: ninguna adicional documentada mas alla de la prediccion densa de punto/profundidad y escala.

## Casos de uso

- Reconstruccion 3D de personas a partir de una sola imagen: el modelo devuelve un pointmap por pixel que puede alimentar pipelines de reconstruccion de malla o nube de puntos, util en escaneo corporal y modelado 3D.
- Captura de movimiento sin marcadores (markerless mocap): el modo de salida en coordenadas de pixel de la imagen fuente permite derivar posiciones articulares y alimentar sistemas de animacion.
- Realidad aumentada y realidad virtual: superponer avatares o elementos virtuales sobre una persona requiere conocer su posicion y geometria en el espacio; el pointmap por pixel ofrece esa base geometrica.
- Generacion de datos sinteticos y etiquetado automatico: usar el modelo para producir mapas de profundidad y pointmaps que sirvan como pseudo-etiquetas en el entrenamiento de otros modelos de vision.
- Efectos visuales y composicion en postproduccion: la estimacion de profundidad densa permite separar persona y fondo, aplicar desenfoque de profundidad o insertar elementos con oclusion correcta en Macs locales.
- Probador virtual (virtual try-on): combinado con un modelo de segmentacion, el pointmap aporta la geometria del cuerpo necesario para ajustar prendas en 3D.
- Robotica y captura de escena centrada en humanos: para robots que operan cerca de personas, un pointmap monocular permite estimar distancias y volumen del sujeto sin sensores de profundidad dedicados.
- Prototipado e investigacion en Apple Silicon: al ejecutarse con mlx-vlm en chips M-series, es adecuado para experimentar en portatiles sin GPU NVIDIA, con un checkpoint de 3,26 GB que cabe comodamente en memoria unificada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- Peso de los pesos: 3,26 GB en bfloat16 (el checkpoint original en float32 ocuparia el doble, en torno a 6,5 GB).
- VRAM / memoria unificada estimada: al no usar CUDA, requiere un Mac con Apple Silicon. Con los pesos bf16, un minimo practico de 8 GB de memoria unificada es razonable; 16 GB o mas da margen para imagenes grandes y activaciones de tareas densas. Esta cifra es una estimacion, no un requisito publicado.
- GPU recomendadas: no aplica. El formato MLX esta disenado para el motor unificado de Apple Silicon (serie M). No funciona en GPUs NVIDIA o AMD con CUDA/ROCm.
- Cabe en GPU de consumo: no en el sentido habitual; cabe en cualquier Mac Apple Silicon con memoria unificada suficiente (M1/M2/M3/M4 y variantes Pro, Max, Ultra).
- Opciones de despliegue: `mlx-vlm` (version 0.7.0 o superior) sobre el framework MLX. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que estan orientados a modelos de lenguaje.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Formato | Licencia | Tarea | Disponibilidad |
|---|---|---|---|---|---|
| mlx-community/sapiens2-pointmap-1b-bf16 | 1,63 B | safetensors MLX bf16 (3,26 GB) | sapiens2-license | Pointmap / depth-estimation | HuggingFace, via mlx-vlm en Apple Silicon |
| facebook/sapiens2-pointmap-1b (modelo base) | 1,63 B | Checkpoint original float32 (aproximadamente el doble de tamano, ~6,5 GB) | sapiens2-license | Pointmap / depth-estimation | HuggingFace, ejecucion estandar (PyTorch) |
| Otros modelos de pointmap o profundidad monocular | No disponible | No disponible | No disponible | Profundidad / pointmap | No disponible en la informacion proporcionada |

No se dispone de datos de rendimiento comparativo entre estas alternativas en el material proporcionado, por lo que no es posible establecer una comparacion cuantitativa.

## Limitaciones y advertencias

- Licencia restrictiva: el modelo se publica bajo `sapiens2-license`, una licencia propia de Meta (license: other), no una licencia de codigo abierto estandar. Es imprescindible revisar el texto completo en el enlace indicado antes de cualquier uso comercial.
- Modelo de vision, no de lenguaje: no genera texto, no responde a prompts conversacionales y no soporta tool calling, agentes ni razonamiento. Cualquier expectativa en ese sentido es incorrecta.
- Dependencia de plataforma: el formato MLX solo se ejecuta en Apple Silicon. No hay soporte documentado para CUDA, ROCm ni despliegue en servidores con GPU NVIDIA.
- Especializacion human-centric: al estar orientado a personas, su comportamiento en escenas sin humanos o con objetos no antropomorficos puede degradarse. No hay datos publicados al respecto.
- Sesgos: no se documentan en la informacion disponible analisis de sesgo por tono de piel, genero, corporalidad u otros atributos. Dado el enfoque human-centric, este analisis es recomendable antes de un despliegue en produccion.
- Alucinacion: no aplica en el sentido de generacion de texto, pero si existe riesgo de artefactos geometricos en superficies reflectantes, transparentes, oclusiones severas o iluminacion extrema, algo habitual en estimacion monocular de profundidad. No hay metricas publicadas de error.
- Resolucion y contexto: las salidas se generan a la resolucion de la imagen de entrada, por lo que imagenes muy grandes incrementan el coste de memoria; no se documentan limites maximos.
- Conversion comunitaria: se trata de un artefacto generado por `mlx-community`, no por Meta. Aunque la model card indica que la referencia ya ejecuta en bf16 mixed precision, no se aportan evaluaciones que confirmen la equivalencia numerica exacta frente al checkpoint original en float32.
- Trazabilidad limitada: el repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay evidencia de uso en produccion ni validacion externa.
- Idiomas: irrelevante para esta tarea, pero conviene recordar que no procesa texto en ningun idioma.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/mlx-community/sapiens2-pointmap-1b-bf16
- Modelo base: https://huggingface.co/facebook/sapiens2-pointmap-1b
- Licencia Sapiens2: https://github.com/facebookresearch/sapiens2/blob/main/LICENSE.md
- Repositorio Sapiens2 de Meta: https://github.com/facebookresearch/sapiens2
- Framework MLX: https://mlx-framework.org/
- Repositorio MLX (ml-explore): https://github.com/ml-explore/mlx
- MLX en Apple Open Source: https://opensource.apple.com/projects/mlx/
- MLX Studio: https://mlx.studio/
- MLX (software), Wikipedia: https://en.wikipedia.org/wiki/MLX_(software)
