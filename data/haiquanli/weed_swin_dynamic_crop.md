# haiquanli/weed_swin_dynamic_crop

## Resumen

Weed Swin Dynamic Crop es un modelo de deteccion e instancia-segmentacion de objetos basado en Swin Transformer Small con cabecera Mask R-CNN, desarrollado por el usuario de Hugging Face `haiquanli`. Resuelve una tarea muy concreta: detectar y segmentar cuatro clases de plantas en fotografias cenitales de cultivo (mala hierba, lechuga, plantula de espinaca y espinaca en fase de crecimiento). El modelo se distribuye como copia de `haiquanli/weed_swin` en la revision `4d54d461cd8358861fdf741a15366990f69dd111`, actualizada con el mejor checkpoint de validacion (epoca 32 de una ejecucion de 42 epocas).

La innovacion que documenta el autor no esta en la arquitectura sino en la estrategia de recorte durante el entrenamiento: en lugar de una rejilla fija, se selecciona el recorte por imagen usando la mediana del tamano anotado de los objetos, con un tamano objetivo de 128 pixeles, factor maximo de recorte de 4 y borde minimo de 512 pixeles. En inferencia se procesan fotografias completas sin necesidad de anotaciones ni teselado. El modelo pesa 68,76 millones de parametros (0,3 GB en safetensors) y se publica bajo licencia MIT.

Es relevante para el nicho de vision artificial agricola: ofrece una comparacion controlada entre rejillas fijas y rejillas adaptativas por mediana sobre el mismo split, presupuesto de muestreo, optimizador y balanceo de clases, con resultados medidos sobre 126 fotos retenidas y 1.270 instancias anotadas. No es un modelo de lenguaje: es un detector-segmentador de imagenes con codigo Python personalizado que requiere `trust_remote_code=True`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Swin Transformer Small (backbone) + Mask R-CNN (cabecera de deteccion e instancia-segmentacion) |
| Parametros totales | 68.761.098 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision; entrada de imagen con recorte minimo de 512 px y tamano objetivo de 128 px por objeto) |
| Tipos de cuantizacion | no disponible (pesos en safetensors de precision completa; el autor no documenta variantes cuantizadas) |
| Idiomas soportados | no disponible (modelo de vision; las etiquetas de clase estan en ingles: weed, lettuce, spinach_seedling, spinach_growth) |
| Licencia | MIT |
| Formato de pesos | safetensors, con codigo Python personalizado (`custom_code`, `mmdet-bridge`) |

## Arquitectura y entrenamiento

El modelo es un Mask R-CNN con backbone Swin Transformer Small, implementado sobre MMDetection 3.x con MMCV 2.1.0, MMEngine, PyTorch y Transformers. La cabecera produce simultaneamente cajas delimitadoras, mascaras de instancia, puntuaciones y etiquetas de clase contiguas en las coordenadas de la imagen original. El pipeline de Hugging Face es `object-detection` y el modelo tambien expone `instance-segmentation` y `feature-extraction` como capacidades. Los IDs de categoria COCO usados en evaluacion son `[1, 2, 4, 5]`, correspondientes a las cuatro clases de planta.

El entrenamiento se realizo en una unica ejecucion semilla de 42 epocas, de la que se publica el checkpoint de la epoca 32 por ser el mejor en validacion de mascaras. La contribucion metodologica es la seleccion de recortes por imagen: se calcula la mediana del tamano anotado de los objetos de cada foto, se fija un tamano objetivo de 128 pixeles, un factor maximo de recorte de 4 y un borde minimo de 512 pixeles. El mismo split, presupuesto de muestreo, optimizador y balanceo de clases se emplearon en la comparacion con rejillas fijas, de modo que la unica variable es la politica de recorte. Los planes de recorte de entrenamiento son solo procedencia y no una politica de teselado en inferencia. No se documentan en la informacion disponible el numero de tokens de imagen, la composicion exacta del dataset ni si hubo RLHF/DPO (no aplica a un detector).

## Capacidades

- Deteccion de objetos en imagenes cenitales de cultivo con cuatro clases: mala hierba (`weed`), lechuga (`lettuce`), plantula de espinaca (`spinach_seedling`) y espinaca en crecimiento (`spinach_growth`).
- Segmentacion de instancias: genera mascaras por objeto ademas de cajas delimitadoras.
- Procesamiento de fotografias completas en inferencia, sin necesidad de anotaciones ni de teselado manual.
- Preservacion de la relacion de aspecto en el preprocesador, que pasa pixeles BGR en bruto al preprocesador de MMDetection.
- Manejo de EXIF: el ejemplo oficial aplica `ImageOps.exif_transpose` antes de la inferencia.
- Salida con umbral de puntuacion configurable (`score_threshold`) y post-procesado a coordenadas de la imagen original.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multilingues: es un modelo puramente visual.

## Casos de uso

- Monitorizacion de parcelas de hoja verde: el modelo procesa fotografias cenitales completas y devuelve cajas y mascaras por planta, lo que permite contar lechugas, espinacas y malas hierbas sin anotaciones manuales.
- Escarda selectiva asistida: la deteccion de la clase `weed` con su mascara permite generar mapas de densidad de malas hierbas para planificar deshierbado mecanico o dirigido, usando el umbral de puntuacion para ajustar la sensibilidad.
- Seguimiento fenologico de espinaca: la distincion entre `spinach_seedling` y `spinach_growth` permite estimar la fase de crecimiento por parcela y programar cosechas o tratamientos.
- Control de calidad de semilleros: la clase `lettuce` alcanza un Mask AP del 82,24% y un Mask AP50 del 95,71%, por lo que es adecuada para verificar densidad de plantacion y detectar fallos de nascencia en bandejas.
- Investigacion agronomica y comparacion de metodos: el repositorio incluye `evaluation/` con metricas completas y la comparacion entre rejillas fijas y rejillas por mediana, util para reproducir experimentos de aumento de datos y politica de recorte.
- Integracion en pipelines de vision con MMDetection: al estar construido sobre MMDetection 3.x, puede insertarse en flujos existentes de deteccion y segmentacion, reentrenarse con nuevas clases o combinarse con otros modelos del ecosistema.
- Prototipado en robotica agricola: al ser un modelo de 68,76 M de parametros y 0,3 GB, es viable desplegarlo en estaciones de trabajo con GPU consumer para pruebas de campo antes de optimizar a produccion.

## Benchmarks y rendimiento

Resultados sobre 126 fotos originales retenidas y 1.270 instancias anotadas. COCO AP con IoU 0,50:0,05:0,95, umbral de puntuacion 0,001 y maxDets [1, 10, 100], sin NMS adicional de mascaras.

| Metrica | Rejillas fijas | Rejillas por mediana |
|---|---:|---:|
| Box mAP | 53,30% | 54,08% |
| Box AP50 | 75,74% | 74,44% |
| Mask mAP | 47,65% | 49,05% |
| Mask AP50 | 72,61% | 74,21% |

| Clase | Mask AP | Mask AP50 |
|---|---:|---:|
| Weed | 35,33% | 57,47% |
| Lettuce | 82,24% | 95,71% |
| Spinach seedling | 32,27% | 64,10% |
| Growth-stage spinach | 46,36% | 79,57% |

No se han publicado en la informacion disponible resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros) porque no aplican a este tipo de modelo. Los resultados del repositorio original usaban evaluacion a nivel de recorte y no son directamente comparables con estos resultados a imagen completa.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; con 68,76 M de parametros en safetensors de precision completa, la huella de pesos ronda los 0,27 GB y el pico de memoria dependera del tamano de imagen y del backend de MMDetection.
- GPU recomendadas: no disponible en la informacion proporcionada; el modelo es lo bastante pequeno para ejecutarse en GPU consumer, pero el autor no documenta modelos concretos.
- Cabe en GPU consumer: previsiblemente si, dado el tamano de 0,3 GB del repositorio, aunque no se confirma en la documentacion.
- Opciones de despliegue: entorno MMDetection 3.x con MMCV 2.1.0, MMEngine, PyTorch y Transformers; carga mediante `AutoModelForObjectDetection` y `AutoImageProcessor` con `trust_remote_code=True`. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI (no aplican a un detector visual).
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

No se dispone en la informacion proporcionada de modelos comparables con los que contrastar parametros, contexto, rendimiento, licencia y disponibilidad. La comparacion interna documentada por el autor es contra la variante de rejillas fijas del mismo experimento (ver tabla de benchmarks), no contra otros modelos publicos.

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Weed Swin Dynamic Crop | 68.761.098 | no aplica | Mask mAP 49,05% (imagen completa) | MIT | Hugging Face |
| Weed Swin (original, revision 4d54d46) | no disponible | no aplica | evaluacion a nivel de recorte, no comparable | MIT | Hugging Face |
| Alternativas externas | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Las anotaciones de malas hierbas pueden ser incompletas, lo que penaliza la deteccion de hierbas no etiquetadas y explica en parte el Mask AP bajo de la clase `weed` (35,33%).
- Es un experimento de una sola semilla; los resultados no incluyen intervalos de confianza ni validacion cruzada.
- Los resultados del repositorio original usaban evaluacion a nivel de recorte y no son directamente comparables con los resultados a imagen completa de este repositorio.
- El modelo esta especializado en cuatro clases de plantas en fotografias cenitales de cultivo; no es un detector generico y su rendimiento fuera de ese dominio no esta documentado.
- Requiere `trust_remote_code=True` y codigo Python personalizado (`custom_code`, `mmdet-bridge`), lo que implica revisar el codigo antes de ejecutarlo en entornos de produccion.
- Depende de un entorno MMDetection 3.x con MMCV 2.1.0, lo que puede complicar el despliegue en stacks que no usen ese ecosistema.
- Licencia MIT: permite uso comercial y modificacion, pero no se documentan garantias ni soporte del autor.
- Riesgo de alucinacion: no aplica en el sentido de generacion de texto, pero si existe riesgo de falsos positivos y falsos negativos en deteccion; el umbral de puntuacion debe calibrarse por caso de uso.
- No se documentan sesgos demograficos ni linguisticos porque el modelo no procesa texto ni personas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/haiquanli/weed_swin_dynamic_crop
- Repositorio original: https://huggingface.co/haiquanli/weed_swin
- Revision original citada: `4d54d461cd8358861fdf741a15366990f69dd111`
- No se han encontrado en la informacion proporcionada enlaces a papers, blogs, repositorios de codigo independientes ni demos.
