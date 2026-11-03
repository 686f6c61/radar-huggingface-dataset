# agaresd/anychest

## Resumen

AnyCXR es un modelo de segmentación anatómica de radiografías de tórax que cubre vistas frontal (AP y PA), lateral (LA) y seis grupos oblicuos nominales (22,5°, 45°, 67,5°, 112,5°, 135° y 157,5°). Lo desarrolla el Advanced AI in Medicine and Physics Lab y se publica en HuggingFace bajo el identificador `agaresd/anychest`. Resuelve un problema concreto: la mayoría de segmentadores torácicos están entrenados solo para proyecciones frontales, lo que limita su uso en estudios con proyecciones laterales u oblicuas, habituales en exploraciones radiológicas reales.

La arquitectura es una ConvNeXt V2 Large con los módulos CAS-lite y AMFS, con JTR desactivado. El modelo produce 54 canales anatómicos independientes a partir de entradas de 384 × 384 píxeles, con una rejilla de salida nativa de 96 × 96. Se distribuyen cuatro familias de modelos (frontal, lateral, oblicuo y todas las vistas), cada una con un checkpoint de inferencia y otro de entrenamiento completo: ocho archivos en total, con un tamaño de repositorio de 21,6 GB.

La relevancia actual del modelo reside en su cobertura multi-vista y en la publicación de checkpoints completos de entrenamiento (modelo, optimizador, scheduler y estados RNG por rango), lo que permite continuar el entrenamiento. La versión conjunta recomendada se actualizó el 3 de noviembre de 2026 con el modelo seleccionado entrenado con aumento 2D (época 96). No se distribuyen imágenes médicas de origen ni máscaras de referencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ConvNeXt V2 Large con CAS-lite y AMFS (JTR desactivado) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión; entrada de 384 × 384 píxeles) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo de imagen, sin procesamiento de lenguaje) |
| Licencia | other |
| Formato de pesos | checkpoints PyTorch (`.pt`); bundle legacy `anychest_inference_bundle.pt` |
| Canales de salida | 54 canales anatómicos independientes |
| Resolución de entrada | 384 × 384 píxeles |
| Rejilla de salida nativa | 96 × 96 |
| Vistas soportadas | AP, PA, LA y seis grupos oblicuos nominales |
| Formatos de entrada | PNG, JPEG, DICOM, NIfTI 2D (`.nii`/`.nii.gz`, requiere SimpleITK) |
| Tamaño del repositorio | 21,6 GB |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

El modelo se basa en una red convolucional ConvNeXt V2 Large adaptada a segmentación densa, con dos componentes propios: CAS-lite y AMFS. La salida se organiza en 54 canales anatómicos independientes sobre una rejilla nativa de 96 × 96, lo que implica un tratamiento por canal sin garantía de exclusividad mutua entre estructuras; el runtime documenta el manejo de máscaras por canal independiente. JTR está desactivado en esta configuración. La entrada se normaliza a 384 × 384 píxeles y la vista de adquisición debe indicarse explícitamente en la inferencia; no se infiere de la imagen.

El repositorio contiene cuatro familias (frontal, lateral, oblicuo y todas las vistas), cada una con un checkpoint de inferencia y otro de entrenamiento completo. Los checkpoints completos conservan modelo, optimizador, scheduler, configuración y estado RNG por rango, y corresponden a la mejor época seleccionada, no al estado final de la última época. La selección de checkpoints se realizó con evaluación de desarrollo; la evaluación histórica disponible incluye solapamiento de pacientes y subconjuntos pequeños de lateral y oblicuo. El modelo conjunto recomendado se actualizó el 3 de noviembre de 2026 (época 96, con aumento 2D). No se especifican en la información disponible el número de tokens, la composición exacta del dataset ni si se emplearon técnicas de RLHF o DPO, algo por otra parte esperable en un modelo de segmentación de imagen.

## Capacidades

- Segmentación anatómica de radiografías de tórax en 54 canales independientes.
- Cobertura de vistas frontal (AP, PA), lateral (LA) y seis grupos oblicuos nominales.
- Modelo conjunto multi-vista (`all_views.pt`) además de especialistas por familia.
- Inferencia sobre PNG, JPEG, DICOM y NIfTI 2D.
- Ejecución en GPU (`--device cuda:0`) o CPU (`--device cpu`).
- Checkpoints de entrenamiento completo para continuar el ajuste con modelo, optimizador, scheduler y estados RNG.
- Runtime de inferencia autónomo incluido en `runtime/`, sin necesidad de generador ni espacio de trabajo de entrenamiento.
- No soporta tool calling, agentes, razonamiento multi-paso ni procesamiento de lenguaje; es un modelo puramente de visión.

## Casos de uso

- Segmentación multi-vista en pipelines de radiología: el modelo permite procesar estudios con proyecciones AP, PA, LA y oblicuas con un único conjunto de pesos (`all_views.pt`), evitando mantener segmentadores separados por vista.
- Preprocesado para modelos de diagnóstico: las 54 máscaras anatómicas pueden usarse para recortar regiones de interés o enmascarar estructuras antes de alimentar clasificadores o detectores torácicos.
- Investigación en imágenes médicas con proyecciones no frontales: los checkpoints lateral y oblicuo cubren vistas que la mayoría de segmentadores públicos no abordan, lo que facilita estudios comparativos.
- Ajuste fino sobre datos propios: los checkpoints `full/*` incluyen optimizador, scheduler y estados RNG, lo que permite reanudar o extender el entrenamiento con nuevos conjuntos anotados.
- Análisis retrospectivo de archivos DICOM y NIfTI: el runtime acepta estos formatos directamente, lo que simplifica el procesamiento por lotes de cohorts almacenadas en PACS o en formato de investigación.
- Docencia y validación de anotaciones: las máscaras generadas pueden servir como propuesta inicial que un radiólogo revise y corrija, reduciendo el tiempo de anotación manual.
- Despliegue en entornos sin GPU: el modo CPU permite ejecutar la segmentación en estaciones de trabajo o servidores sin acelerador, a costa de mayor latencia (no se publican cifras concretas).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada. El checkpoint de inferencia conjunto se descarga como un único archivo `.pt`; el tamaño exacto por archivo figura en `checkpoints.json`, no reproducido aquí.
- GPU recomendadas: no se especifican modelos concretos. El runtime acepta `--device cuda:0`, por lo que cualquier GPU con CUDA compatible debería funcionar; una ConvNeXt V2 Large a 384 × 384 es manejable en GPUs de gama media, pero no se confirma con datos del autor.
- GPU de consumo: no confirmado por el autor. Por el tamaño típico de una ConvNeXt V2 Large, es probable que quepa en GPUs de consumo con suficiente VRAM, pero debe verificarse con el tamaño real del checkpoint.
- Opciones de despliegue: runtime propio incluido en `runtime/` (instalable con `pip install ./AnyCXR/runtime` y ejecutable con el comando `anycxr`); soporte de CPU y CUDA. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tarea | Vistas | Canales de salida | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| AnyCXR (este modelo) | Segmentación anatómica de tórax | AP, PA, LA y 6 grupos oblicuos | 54 | other | HuggingFace, 8 checkpoints |
| Segmentadores torácicos frontales genéricos | Segmentación anatómica de tórax | Solo frontal | Variable | Variable | No disponible en la información proporcionada |
| Alternativas laterales/oblicuas específicas | Segmentación anatómica de tórax | Lateral u oblicua | Variable | Variable | No disponible en la información proporcionada |

No se dispone de datos de benchmarks ni de especificaciones de modelos comparables en la información proporcionada que permitan una comparación cuantitativa rigurosa.

## Limitaciones y advertencias

- La vista de adquisición debe indicarse manualmente; el modelo no la infiere de la imagen.
- Los grupos lateral y oblicuo son categorías nominales de adquisición y no establecen azimuts físicos calibrados con precisión.
- El modelo conjunto no se reclama superior a cada especialista en todas las vistas.
- La evaluación histórica incluye solapamiento de pacientes y subconjuntos pequeños de lateral y oblicuo; no establece rendimiento clínico independiente.
- No se distribuyen imágenes médicas de origen ni máscaras de referencia, lo que limita la reproducibilidad de la evaluación.
- Los 54 canales son independientes; no se garantiza exclusividad mutua entre estructuras, y el runtime documenta el manejo específico de máscaras por canal.
- La licencia es "other"; deben revisarse los términos exactos antes de cualquier uso comercial.
- Los checkpoints completos son mejores épocas seleccionadas, no estados finales; extender el entrenamiento requiere una fase o presupuesto nuevos.
- Los formatos de checkpoint ConvNeXt V2 no son compatibles con el bundle legacy del directorio raíz; no deben cargarse con loaders que solo soporten el bundle antiguo.
- La disponibilidad de checkpoints no garantiza compatibilidad con todas las versiones publicadas de la CLI.
- Riesgo de alucinación y sesgos: no aplica en el sentido habitual de modelos de lenguaje, pero sí existe riesgo de segmentación incorrecta en anatomías atípicas o adquisiciones fuera de las vistas nominales; no se documentan sesgos poblacionales.
- No se especifican requisitos de cuantización ni formatos GGUF/ONNX; el despliegue se limita a PyTorch.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/agaresd/anychest
- Repositorio del proyecto y código fuente: https://github.com/Advanced-AI-in-Medicine-and-Physics-Lab/AnyCXR
- Paper (preprint): https://arxiv.org/abs/2512.17263
- Guía del runtime de inferencia: https://huggingface.co/agaresd/anychest/blob/main/runtime/README.md
- Metadatos de checkpoints: https://huggingface.co/agaresd/anychest/blob/main/checkpoints.json
- Nombres de clases: https://huggingface.co/agaresd/anychest/blob/main/class_names.json
- Sumas de verificación SHA-256: https://huggingface.co/agaresd/anychest/blob/main/SHA256SUMS
