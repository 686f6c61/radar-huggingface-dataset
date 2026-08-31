# ECCV26-Tomato-Phenotyping/SYNTOM-SAM3

## Resumen

SYNTOM-SAM3 es un modelo de segmentación semántica de órganos de tomate (hoja, tallo, flor y fruto) desarrollado por el equipo ECCV26-Tomato-Phenotyping, en colaboración con KAUST. Se trata de un fine-tuning completo del modelo SAM 3 de Meta, entrenado exclusivamente con el dataset sintético SYNTOM, generado proceduralmente mediante un modelo L-system que simula un invernadero comercial de tomate cherry. El objetivo es resolver el problema del fenotipado de cultivos en invernadero, donde la anotación manual de imágenes reales es costosa y escasa.

La relevancia de este modelo radica en su enfoque sim-to-real: entrenado solo con datos sintéticos, alcanza una mejora de 13 puntos en el IoU medio de fruto sobre tres conjuntos de datos reales de tomate en comparación con el SAM 3 sin ajustar. El modelo se distribuye como un checkpoint de PyTorch de 3,1 GiB, bajo la licencia SAM License de Meta, y está pensado para ser cargado con el paquete `sam3` de investigación, no con `transformers`. El trabajo asociado fue aceptado en el 11th Workshop on Computer Vision in Plant Phenotyping and Agriculture (CVPPA), en conjunción con ECCV 2026.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | SAM 3 (Segment Anything Model 3) fine-tuned |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (modelo de visión, sin contexto textual explícito) |
| Tipos de cuantizacion | no disponible (solo se ofrece el checkpoint en precisión completa) |
| Idiomas soportados | no disponible (acepta prompts de texto, pero no se especifican idiomas) |
| Licencia | SAM License (derivado de Meta SAM 3) |
| Formato de pesos | PyTorch `.pt` (archivo `sam3_fullft_syntom.pt`) |

## Arquitectura y entrenamiento

El modelo parte de SAM 3, la tercera generación de la familia Segment Anything de Meta, que combina un codificador de imagen basado en transformer con un decodificador de máscaras capaz de aceptar prompts de texto, puntos o cajas. SYNTOM-SAM3 se obtiene mediante fine-tuning completo (full fine-tuning) de todos los parámetros del detector de SAM 3 sobre el dataset sintético SYNTOM, que contiene más de 10 000 imágenes generadas proceduralmente con un modelo L-system de un invernadero de tomate cherry, variando iluminación, puntos de vista y morfología de la planta.

El entrenamiento se realizó únicamente con datos sintéticos, sin ninguna imagen real de entrenamiento. Según el paper, se compararon tres estrategias: fine-tuning con parámetros eficientes (PEFT), fine-tuning completo e interpolación de pesos. La variante de fine-tuning completo es la que mejor puntuación obtiene en imágenes reales de invernadero, y es la que se publica aquí. No se especifican detalles como número de épocas, tamaño de lote o función de pérdida en la información disponible.

## Capacidades

- Segmentación semántica de cuatro órganos de tomate: hoja, tallo, flor y fruto, condicionada por texto.
- Funciona en imágenes reales de invernadero a pesar de haber sido entrenado solo con datos sintéticos (transferencia sim-to-real).
- Generación de máscaras de segmentación a partir de prompts de texto, puntos o cajas (heredado de SAM 3).
- Reducción de la segmentación a clases binarias (p. ej., fruto vs. no fruto) para métricas de evaluación.
- Capacidad de procesar imágenes con diferentes condiciones de iluminación y puntos de vista, gracias a la diversidad del dataset sintético.
- Integrable en pipelines de fenotipado vegetal de alto rendimiento.

## Casos de uso

- Fenotipado de cultivos en invernadero: el modelo permite cuantificar automáticamente la superficie de hojas, tallos, flores y frutos en imágenes capturadas por cámaras fijas o drones, facilitando el seguimiento del crecimiento y desarrollo de las plantas.
- Estimación de rendimiento agrícola: al segmentar frutos de forma fiable, se puede contar y medir el tamaño de los tomates en diferentes etapas de maduración, lo que ayuda a predecir la producción y planificar la cosecha.
- Detección temprana de estrés o enfermedades: cambios en la morfología de hojas o tallos detectables mediante segmentación pueden correlacionarse con estrés hídrico, nutricional o presencia de patógenos, permitiendo intervenciones tempranas.
- Agricultura de precisión: integrado en sistemas robóticos de inspección, el modelo puede guiar la aplicación localizada de fitosanitarios o la poda selectiva, reduciendo el uso de insumos.
- Investigación en fenotipado vegetal: como herramienta de anotación automática, acelera la generación de datasets etiquetados para otros estudios, reduciendo el coste de anotación manual.
- Validación de modelos sim-to-real: sirve como caso de estudio para evaluar la transferibilidad de modelos entrenados con datos sintéticos a entornos reales, un problema recurrente en visión por computador agrícola.

## Benchmarks y rendimiento

El modelo se evaluó en tres conjuntos de datos reales de tomate (TomatoMAP, Laboro y Rob2Pheno), midiendo el IoU de fruto con las predicciones reducidas a fruto vs. no fruto. Los resultados se comparan con el SAM 3 sin ajustar (zero-shot):

| Modelo | TomatoMAP | Laboro | Rob2Pheno | macro | image-weighted |
|---|---:|---:|---:|---:|---:|
| **SYNTOM-SAM3 (full FT)** | **0,7785** | **0,7371** | **0,4529** | **0,6562** | **0,7372** |
| SAM 3 zero-shot | 0,5938 | 0,6875 | 0,2995 | 0,5269 | 0,6210 |

El fine-tuning con datos sintéticos mejora el IoU medio de fruto en 13 puntos porcentuales sobre la línea base zero-shot, sin utilizar ninguna imagen real de entrenamiento. No se han publicado resultados en otros benchmarks generales de segmentación (p. ej., COCO o ADE20K) en la información disponible.

## Requisitos de hardware

- El checkpoint pesa 3,1 GiB, lo que sugiere un modelo de cientos de millones de parámetros, aunque el número exacto no está disponible.
- No se especifican requisitos mínimos de VRAM en la documentación del modelo.
- Dado el tamaño del archivo, una GPU con al menos 8 GB de VRAM podría ser suficiente para inferencia en precisión completa, pero no hay confirmación oficial.
- Para despliegue en producción, se recomienda usar el paquete `sam3` de Meta (no `transformers`) para cargar los pesos, tal como indica la model card.
- No se mencionan opciones de cuantización ni integración con vLLM, llama.cpp u otros motores de inferencia optimizados.
- La latencia y el throughput no están documentados.

## Comparativa con modelos similares

La comparativa más directa es con el propio SAM 3 sin ajustar, ya que es el modelo base. No se dispone de datos de otros fine-tunes de SAM 3 para fenotipado vegetal en la información proporcionada.

| Modelo | Entrenamiento | TomatoMAP IoU | Laboro IoU | Rob2Pheno IoU | Licencia |
|---|---|---|---:|---:|---:|---|
| **SYNTOM-SAM3** | Fine-tuning completo con datos sintéticos | 0,7785 | 0,7371 | 0,4529 | SAM License |
| SAM 3 (zero-shot) | Preentrenamiento general de Meta | 0,5938 | 0,6875 | 0,2995 | SAM License |

No se dispone de comparaciones con otros modelos de segmentación agrícola (p. ej., versiones fine-tuned de SAM o SAM 2) en la información disponible.

## Limitaciones y advertencias

- El modelo se entrenó exclusivamente con datos sintéticos de tomate cherry en invernadero; su rendimiento en otros cultivos, variedades o entornos (campo abierto, invernaderos con otras condiciones) no está garantizado y probablemente sea inferior.
- La licencia SAM License de Meta impone restricciones de uso, incluyendo la obligación de citar a SAM 3 en publicaciones que utilicen estos pesos. Es necesario revisar el texto completo de la licencia antes de un uso comercial.
- El rendimiento en el conjunto Rob2Pheno es notablemente inferior (0,4529 de IoU) en comparación con los otros dos conjuntos, lo que sugiere sensibilidad a la variabilidad del dominio o a diferencias en la anotación.
- Como todo modelo de segmentación, puede producir máscaras incorrectas o incompletas, especialmente en imágenes con oclusiones, frutos superpuestos o condiciones de iluminación extremas.
- No se han publicado análisis de sesgos ni de robustez frente a ataques adversarios.
- El checkpoint se distribuye en formato `.pt` con nombres de parámetros del código de investigación de SAM 3; no es compatible directamente con la API de `transformers`, lo que limita su integración en ecosistemas estándar.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ECCV26-Tomato-Phenotyping/SYNTOM-SAM3
- Dataset SYNTOM: https://huggingface.co/datasets/ECCV26-Tomato-Phenotyping/SYNTOM
- Paper en arXiv: https://arxiv.org/abs/2607.18576
- Versión HTML del paper: https://arxiv.org/html/2607.18576v1
- Análisis del paper en AI Models: https://www.aimodels.fyi/papers/arxiv/text-conditioned-segmentation-tomato-phenotyping-via-procedural
