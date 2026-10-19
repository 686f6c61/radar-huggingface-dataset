# Angione-Lab/Shape2Force

## Resumen

Shape2Force (S2F) es un modelo de aprendizaje profundo desarrollado por Angione-Lab que predice mapas de fuerza de tracción celular directamente a partir de imágenes de microscopía de campo claro (bright-field), sin necesidad de marcaje fluorescente ni de microesferas reporteras. El sistema transforma una imagen de una célula única o de un esferoide en un mapa de calor de fuerzas, resolviendo el cuello de botella experimental de la microscopía de fuerza de tracción (TFM), que tradicionalmente exige adquisición de imágenes de fluorescencia y postprocesado intensivo.

El modelo se distribuye en dos variantes independientes: una para células individuales, con checkpoints específicos por sustrato (por ejemplo, `fibroblasts_PDMS`), y otra para esferoides multicelulares. Según las etiquetas del repositorio, la arquitectura se basa en pix2pix, un marco de GAN condicional orientado a traducción imagen-a-imagen, implementado en PyTorch. El repositorio ocupa 2,1 GB e incluye pesos, cuadernos de inferencia y evaluación, una aplicación Streamlit y código de entrenamiento.

Su relevancia actual es metodológica: permite obtener estimaciones de fuerza en experimentos de imagen live label-free, lo que abre la puerta a cribados de alto rendimiento en mecanobiología sin instrumental óptico especializado. El proyecto está asociado a la publicación "Shape-to-force (S2F): Predicting Cell Traction Forces from LabelFree Imaging" (2026) y se publica bajo licencia MIT, aunque con una adopción todavía muy incipiente (0 descargas y 1 like en el momento de la consulta).

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GAN condicional tipo pix2pix (traducción imagen a imagen) en PyTorch |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo de imagen a imagen; no procesa texto) |
| Tipos de cuantizacion | no disponible; se distribuyen checkpoints `.pth` y no se documentan versiones cuantizadas, GGUF ni ONNX |
| Idiomas soportados | no aplica (entrada y salida son imágenes) |
| Licencia | MIT |
| Formato de pesos | `.pth` (checkpoints de PyTorch) |
| Variantes | `single_cell` (con selección de sustrato) y `spheroid` |
| Entrada | imagen de campo claro en formato `.tif` (una célula o un esferoide por imagen) |
| Salida | mapa de fuerza / heatmap (en el dataset de entrenamiento se almacena como `*_gray.jpg`) |
| Tamaño del repositorio | 2,1 GB (incluye pesos, cuadernos, app y código de entrenamiento) |
| Descargas / likes | 0 / 1 |
| Fecha de creación / actualización | 2026-02-22 / 2026-10-18 |
| Pipeline declarado en HuggingFace | no disponible |

## Arquitectura y entrenamiento

La información disponible indica que S2F se implementa como una GAN condicional de tipo pix2pix, el marco clásico de traducción imagen-a-imagen en el que un generador produce el mapa de fuerza a partir de la imagen de campo claro y un discriminador evalúa la plausibilidad del par entrada-salida durante el entrenamiento. El repositorio no detalla la configuración concreta del generador ni del discriminador (número de capas, canales, funciones de pérdida auxiliares ni resolución de trabajo), por lo que estos extremos deben considerarse no disponibles.

En cuanto a los datos, el pipeline de entrenamiento espera una estructura de carpetas con subconjuntos `train/` y `test/`, donde cada muestra empareja una imagen de campo claro (`BF_001.tif`) con su mapa de fuerza de referencia (`*_gray.jpg`) y, opcionalmente, un fichero `.txt` con metadatos de área celular y fuerza total. No se especifican en la información proporcionada el volumen del dataset, el número de pares de entrenamiento, la procedencia de las verdades de referencia (presumiblemente TFM clásica) ni si se aplicaron etapas de refinamiento posteriores al entrenamiento adversario. El modelo se entrena por variante y, en el caso de célula única, condicionado al tipo de sustrato, lo que sugiere una especialización por condiciones de rigidez y química de superficie.

## Capacidades

- Predicción de mapas de fuerza de tracción a partir de imágenes de campo claro de células individuales, con checkpoints específicos por sustrato.
- Predicción de mapas de fuerza en esferoides multicelulares mediante una variante dedicada.
- Inferencia sobre imágenes `.tif` individuales o sobre lotes de una carpeta completa mediante cuadernos de Jupyter.
- Evaluación cuantitativa contra ground truth mediante cuadernos específicos que calculan métricas y generan gráficas comparativas.
- Interfaz web local (Streamlit) y aplicación online alojada en Hugging Face Spaces para uso sin programación.
- Entrenamiento y fine-tuning desde cero o reanudando desde checkpoint (`--resume`) con un comando único.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni generación de texto: no es un modelo de lenguaje.
- No dispone de capacidades de visión general (VQA, OCR, detección abierta): el dominio está restringido a microscopía de células y esferoides.

## Casos de uso

- Cribado de fármacos en mecanobiología: procesar placas completas de imágenes de campo claro tomadas en vivo y obtener mapas de fuerza por pocillo sin necesidad de adquirir fluorescencia, reduciendo el coste y el tiempo por experimento.
- Monitorización longitudinal de la contractilidad celular: al no requerir marcaje, el modelo permite seguir la evolución de las fuerzas de una misma célula a lo largo de horas sin fototoxicidad asociada a los fluoróforos.
- Estudios de invasión y metástasis en esferoides: la variante `spheroid` permite estimar la distribución espacial de fuerzas en modelos 3D, útil para caracterizar la rigidez diferencial entre núcleo y periferia del agregado.
- Validación cruzada con TFM clásica: usar el modelo como estimador rápido y reservar la TFM con microesferas para un subconjunto de muestras, comparando ambas salidas en el cuaderno de evaluación.
- Investigación en adhesión y migración celular: analizar cómo cambian los patrones de fuerza en fibroblastos sobre PDMS u otros sustratos ante perturbaciones genéticas o químicas.
- Docencia y divulgación: la app Streamlit con imágenes de ejemplo en `samples/` permite ilustrar el concepto de fuerza de tracción sin montar un microscopio de fluorescencia ni un pipeline de TFM.
- Integración en pipelines de análisis de imagen: los cuadernos de inferencia permiten procesar lotes de imágenes y guardar predicciones junto con métricas, lo que facilita su encadenamiento con herramientas de segmentación o análisis morfológico.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El repositorio incluye cuadernos de evaluación (`Singlecell_evaluation.ipynb` y `Spheroid_evaluation.ipynb`) que calculan métricas frente a ground truth, pero no se proporcionan cifras en la model card ni en los datos consultados, por lo que no es posible presentar una tabla comparativa sin inventar valores.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. No se publican el número de parámetros ni la resolución de entrada, que son los factores determinantes del consumo de memoria.
- El repositorio completo ocupa 2,1 GB, incluyendo pesos de ambas variantes, cuadernos y aplicación; el peso de cada checkpoint individual no se detalla.
- GPU recomendadas: no disponibles. Al tratarse de una GAN de traducción imagen a imagen, es razonable esperar que quepa en GPUs de consumo tipo NVIDIA RTX, pero no hay confirmación oficial ni cifras de VRAM.
- Despliegue: PyTorch con checkpoints `.pth`, aplicación Streamlit local, Hugging Face Space online y cuadernos de Jupyter. No hay soporte documentado para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles. No se documentan tiempos por imagen ni capacidad de procesamiento en lote más allá del procesado de carpetas desde los cuadernos.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto / entrada | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Shape2Force (S2F) | GAN pix2pix, imagen a mapa de fuerza | no disponible | imagen de microscopía | MIT | HuggingFace + GitHub + Space |
| TFM clásica (FTTC y variantes) | Método físico-matemático, no aprendido | no aplica | imágenes de microesferas fluorescentes | según implementación | software académico disperso |
| Modelos de segmentación celular (p. ej. Cellpose) | Red de segmentación | no disponible en esta consulta | imagen de microscopía | varía | ampliamente disponible |

No se dispone de datos cuantitativos que permitan comparar rendimiento entre S2F y alternativas. La comparación relevante es metodológica: frente a la TFM clásica, S2F evita el marcaje con microesferas pero introduce dependencia de la distribución de entrenamiento y no sustituye a una medición física directa. Frente a herramientas de segmentación como Cellpose, la tarea es distinta (predicción de campos de fuerza frente a delimitación de regiones), por lo que no son intercambiables.

## Limitaciones y advertencias

- Los mapas de fuerza son predicciones estadísticas, no mediciones físicas: no deben presentarse como sustitutos validados de la TFM en contextos donde la magnitud absoluta de la fuerza sea crítica.
- Dependencia fuerte de la distribución de entrenamiento: el modelo de célula única requiere seleccionar el sustrato correcto (`fibroblasts_PDMS` y otros), y se desconoce su comportamiento fuera de los tipos celulares, sustratos y condiciones de microscopía vistos en entrenamiento.
- No se publican métricas de error (MAE, RMSE, correlación espacial) en la model card, lo que impide evaluar su precisión antes de desplegarlo.
- Sensibilidad a la configuración óptica: cambios en objetivo, iluminación, contraste o formato de adquisición pueden degradar las predicciones; no se documenta ningún protocolo de normalización de imagen.
- Dos checkpoints separados con dominios no intercambiables: célula única y esferoide no comparten pesos, y la selección incorrecta produce resultados sin significado.
- Adopción prácticamente nula (0 descargas, 1 like) y proyecto reciente: no hay evidencia de uso independiente ni de replicación por terceros.
- Licencia MIT, que permite uso comercial y modificación, pero sin garantías del autor; conviene citar la publicación asociada en cualquier uso derivado.
- No dispone de funcionalidades de modelo de lenguaje: no hay soporte multilingüe, de tool calling, de agentes ni de razonamiento textual, por lo que no debe evaluarse con los criterios habituales de un LLM.
- No se documentan sesgos del dataset ni su composición demográfica o biológica, lo que impide auditar posibles sesgos por tipo celular o morfología.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Angione-Lab/Shape2Force
- Aplicación online (Hugging Face Space): https://huggingface.co/spaces/Angione-Lab/Shape2force
- Repositorio GitHub: https://github.com/Angione-Lab/Shape2Force
- DOI / publicación asociada: https://doi.org/10.5281/zenodo.20759318
- Badge Zenodo del proyecto: https://zenodo.org/badge/1164156159.svg
- Publicación citada: Baro, L., Shahhosseini, K., Andrés-Bordería, A., Angione, C., Juanes, M. A. "Shape-to-force (S2F): Predicting Cell Traction Forces from LabelFree Imaging", 2026 (sin URL directa en la información disponible).
