# RammusLeo/TouchAnnotator

## Resumen

TouchAnnotator es un modelo de vision por computador desarrollado por RammusLeo que estima campos de presion tactil relativa y probabilidad de contacto a partir de video egocentrico. Concretamente, predice una matriz de 21 × 21 por mano (izquierda y derecha) que representa la presion relativa y la probabilidad de contacto, usando unicamente un video RGB en primera persona y las poses de mano estimadas por WiLoR. El modelo resuelve el problema de anotar tacto sin necesidad de sensores fisicos ni camaras de muneca en el momento de la inferencia.

La arquitectura se construye sobre un backbone visual-lenguaje Qwen3.5-4B al que se anaden cabezas de prediccion tactil y un mecanismo de memoria temporal de clips. El entrenamiento emplea "privileged-view distillation" (destilacion desde vistas privilegiadas) y supervisa con seis conjuntos de datos que abarcan guantes, manos desnudas y robots diestros. El checkpoint publicado ocupa 9,40 GB y contiene 1.218 tensores.

El modelo es relevante porque permite generar anotaciones tactiles densas a partir de video egocentrico convencional, lo que reduce la dependencia de hardware especializado para tareas de aprendizaje de manipulacion, robotica y analisis de interaccion mano-objeto. La publicacion incluye un checkpoint "Full student" (0824) y un checkpoint cualitativo anterior (0813) mas ligero, de 951 MB.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Backbone visual-lenguaje Qwen3.5-4B con cabezas de prediccion tactil y memoria temporal de clips |
| Parametros totales | no disponible (checkpoint de 9,40 GB; 1.218 tensores) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | Clips de 8 fotogramas; 2 clips precedentes con 16 tokens de memoria cada uno |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en, zh |
| Licencia | no disponible |
| Formato de pesos | PyTorch (`model.pth`, checkpoint custom; no cargable con `AutoModel.from_pretrained()`) |

## Arquitectura y entrenamiento

TouchAnnotator parte de Qwen3.5-4B como backbone visual-lenguaje y le anade cabezas especificas para predecir, por cada mano, un campo de presion relativa de 21 × 21 y un campo de probabilidad de contacto. La entrada combina el video RGB egocentrico con las poses 3D de mano estimadas por WiLoR a partir del mismo video. El modulo de memoria temporal procesa clips de ocho fotogramas y mantiene contexto de los dos clips anteriores mediante 16 tokens de memoria por clip, lo que aporta coherencia temporal a las predicciones.

El entrenamiento utiliza destilacion desde vistas privilegiadas ("privileged-view distillation"): el modelo estudiante aprende a partir de supervisión multi-fuente obtenida con vistas e informacion adicionales no disponibles en inferencia. La supervision abarca seis conjuntos de datos con guantes, manos desnudas y robots diestros. El checkpoint publicado corresponde a la epoca 2 del run "Full student" (`20260824_003600_qwen3.5_4b_tactile_prediction_qwen35_full_causal_memory_opd_full_qwen`), exportado con valores y dtypes originales y excluyendo el optimizador y el profesor EMA. El checkpoint 0813, mas ligero (951 MB), usa solo la torre de vision de Qwen mas un decodificador temporal/query, sin razonador de lenguaje completo, sin memoria de clips y sin OPD.

## Capacidades

- Prediccion bimanual de presion relativa: genera un campo de 21 × 21 por mano izquierda y derecha.
- Prediccion de probabilidad de contacto independiente por mano (en el checkpoint Full 0824).
- Entrada exclusivamente egocentrica: solo requiere video RGB; no necesita camaras de muneca ni sensores tactiles en inferencia.
- Integracion con poses de mano WiLoR estimadas a partir del mismo video.
- Memoria temporal de clips: contexto de dos clips previos con 16 tokens de memoria cada uno.
- Anotacion automatica de video: convierte un video en anotaciones tactiles densas.
- Soporte de idiomas en y zh en el backbone subyacente.
- No se ha documentado soporte de tool calling, function calling, agentes ni modos de razonamiento multi-paso en la informacion disponible.

## Casos de uso

- Anotacion automatica de datasets de manipulacion: procesar videos egocentricos existentes para generar etiquetas de presion y contacto por mano, reduciendo el coste de anotacion manual en conjuntos de datos de robotica y vision.
- Aprendizaje de politicas de manipulacion robotica: usar las predicciones tactiles como senal de supervision o recompensa en entornos donde no se dispone de sensores tactiles fisicos.
- Analisis de interaccion mano-objeto en video: estudiar patrones de agarre y contacto en grabaciones en primera persona para investigacion en ergonomia o ciencia cognitiva.
- Preentrenamiento y aumento de datos: generar anotaciones tactiles sinteticas sobre video egocentrico para aumentar datasets de entrenamiento de otros modelos.
- Evaluacion de modelos de estimacion de pose: comparar la coherencia entre las poses WiLoR y los campos de contacto predichos para detectar fallos de seguimiento.
- Prototipado en investigacion de vision tactil: emplear el checkpoint 0813 (951 MB) para experimentos cualitativos rapidos y el Full 0824 para evaluaciones completas.
- Generacion de contenido y simulacion: producir mapas de presion plausibles para visualizacion o para alimentar simuladores de contacto en entornos virtuales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card incluye comparaciones cualitativas (figuras del paper) frente a EgoTouch y TouchAnything, pero no proporciona metricas numericas en el texto disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el checkpoint Full ocupa 9,40 GB en disco; en memoria requiere al menos el equivalente a los pesos mas el backbone Qwen3.5-4B y WiLoR. No se ha publicado una estimacion oficial de VRAM.
- GPU recomendadas: no disponible en la informacion proporcionada; por tamano del checkpoint se requiere una GPU con al menos 16-24 GB de VRAM para el checkpoint Full, aunque esta cifra no esta confirmada por el autor.
- Cabe en GPU de consumo: el checkpoint 0813 (951 MB) es viable en GPUs de consumo; el Full (9,40 GB) probablemente requiere GPUs de gama alta, sin confirmacion oficial.
- Opciones de despliegue: inferencia custom con el codigo del repositorio y `demo.py`; no es compatible con `AutoModel.from_pretrained()` ni con pipelines de generacion de texto de Transformers. Requiere descargar por separado TouchAnnotator, Qwen y WiLoR mediante `scripts/download_assets.py`.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros / tamano | Contexto temporal | Entrada | Salida | Licencia |
|---|---|---|---|---|---|
| TouchAnnotator (Full 0824) | 9,40 GB, backbone Qwen3.5-4B | Clips de 8 fotogramas + 2 clips de memoria | Video RGB egocentrico + poses WiLoR | Presion 21 × 21 + contacto por mano | no disponible |
| TouchAnnotator (0813) | 951 MB, torre de vision Qwen + decodificador | Ventanas solapadas de 8 fotogramas, sin memoria | Video RGB egocentrico + poses WiLoR | Presion y contacto por umbral (0,1) | no disponible |
| EgoTouch | no disponible | no disponible | Vista ego (segun figura del paper) | Presion | no disponible |
| TouchAnything | no disponible | no disponible | Multi-vista | Presion | no disponible |

No se dispone de datos numericos de parametros, contexto ni rendimiento de EgoTouch ni TouchAnything en la informacion proporcionada; solo aparecen como referencias cualitativas en las figuras del paper.

## Limitaciones y advertencias

- La licencia no esta especificada, por lo que no se puede confirmar el uso comercial sin consultar al autor.
- El checkpoint es custom y no se carga con `AutoModel.from_pretrained()` ni con pipelines estandar de Transformers; requiere el codigo de inferencia del repositorio.
- Depende de WiLoR para las poses de mano: errores en la estimacion de pose se propagan a las predicciones tactiles.
- La salida es presion relativa, no presion absoluta en unidades fisicas; no sustituye a sensores tactiles calibrados.
- Entrenado con seis datasets especificos; el rendimiento fuera de esas condiciones (guantes, manos desnudas, robots diestros) no esta garantizado.
- El checkpoint Full corresponde a la epoca 2; el autor no reporta metricas cuantitativas en la model card.
- El checkpoint 0813 se describe como cualitativamente mas llamativo pero no como mas preciso; no debe interpretarse como mejora de exactitud.
- Idiomas soportados limitados a en y zh en el backbone; no se documenta soporte multilingue adicional.
- Riesgo de alucinacion en las predicciones no cuantificado en la informacion disponible.
- Solo anota las manos de una persona en el video.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/RammusLeo/TouchAnnotator
- Checkpoint 0813: https://huggingface.co/RammusLeo/TouchAnnotator-0813
- Repositorio GitHub: https://github.com/RammusLeo/TouchAnnotator
- Guia de inferencia: https://huggingface.co/RammusLeo/TouchAnnotator/blob/main/docs/INFERENCE.md
- Guia del checkpoint 0813: https://github.com/RammusLeo/TouchAnnotator/blob/main/docs/MODEL_0813.md
- README en chino: https://huggingface.co/RammusLeo/TouchAnnotator/blob/main/README.zh-CN.md
- Checkpoint `model.pth`: https://huggingface.co/RammusLeo/TouchAnnotator/resolve/v1.0/model.pth
- Configuracion: https://huggingface.co/RammusLeo/TouchAnnotator/resolve/v1.0/config.yaml
- Manifest: https://huggingface.co/RammusLeo/TouchAnnotator/resolve/v1.0/manifest.json
- Version v1.0: https://huggingface.co/RammusLeo/TouchAnnotator/tree/v1.0
- Modelo base Qwen3.5-4B: https://huggingface.co/Qwen/Qwen3.5-4B
