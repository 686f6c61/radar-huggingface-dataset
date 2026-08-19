# dronefreak/clearview-derain-nafnet

## Resumen

ClearView Derain NAFNet es un modelo de eliminación de lluvia en imágenes individuales (single image deraining) desarrollado por dronefreak. Se basa en la arquitectura NAFNet (Nonlinear Activation Free Network), con 14,3 millones de parámetros, y está entrenado sobre una mezcla de datasets sintéticos y reales de lluvia, con un sobremuestreo 2x de las fuentes reales para mejorar la generalización entre dominios. El modelo se selecciona mediante una métrica de validación mixta que combina conjuntos reales y sintéticos, evitando así el sobreajuste a las peculiaridades de un único dataset.

La relevancia de este modelo radica en su capacidad para operar tanto en escenarios sintéticos como reales, lo que lo hace útil para aplicaciones de conducción autónoma, vigilancia y restauración de imágenes. Su tamaño compacto (14,3M parámetros, ~0,1 GB) permite su despliegue en hardware modesto, incluyendo GPUs de consumo y CPU. El modelo se distribuye bajo licencia Apache 2.0 y está disponible en HuggingFace con pesos en formato PyTorch (.pth).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | NAFNet (Nonlinear Activation Free Network) |
| Parametros totales | 14,3 millones |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision) |
| Tipos de cuantizacion | no disponible (pesos en .pth, PyTorch) |
| Idiomas soportados | no aplica (modelo de vision, sin procesamiento de texto) |
| Licencia | Apache 2.0 |
| Formato de pesos | .pth (PyTorch) |

## Arquitectura y entrenamiento

NAFNet es una red convolucional que elimina las funciones de activación no lineales tradicionales, sustituyéndolas por operaciones como SimpleGate y simplificando el bloque base para mejorar la eficiencia y el rendimiento en tareas de restauración de imágenes. El modelo se entrenó sobre una combinación de cinco fuentes de datos: Rain13K (13.711 pares sintéticos), DDN-Data/Rain1400 (12.600 pares sintéticos), SPA-Data (6.385 pares reales), RealRain-1k-H (784 pares reales) y RealRain-1k-L (784 pares reales). Las fuentes reales se sobremuestrearon 2x, resultando en una proporción efectiva de ~62% sintético y ~38% real.

La selección del checkpoint se realizó sobre un conjunto de validación mixto que incluye SPA-Data val (limitado a 150 pares), RealRain-1k-H/L val (112 cada uno) y Rain100L (100 pares) como ancla sintética. Este enfoque busca maximizar el rendimiento en dominios reales sin sacrificar la capacidad en datos sintéticos. Las métricas de evaluación incluyen PSNR, SSIM, MAE, MSE, Rain Removal Rate (métrica propia que mide la reducción de energía residual de alta frecuencia) y NIQE (calidad perceptual sin referencia).

## Capacidades

- Eliminación de lluvia en imágenes individuales, tanto en dominios sintéticos como reales.
- Restauración de imágenes con lluvia ligera y fuerte (RealRain-1k-L y RealRain-1k-H).
- Procesamiento de imágenes a color con preservación de estructura y textura.
- No soporta tool calling, agentes ni razonamiento multi-paso (es un modelo puramente visual).
- No es multimodal en el sentido de texto-imagen; solo procesa imágenes.
- Capacidad de generalización a escenarios mixtos de lluvia y niebla limitada (ver limitaciones).

## Casos de uso

- Conducción autonoma: limpieza de imagenes de camaras de vehiculos en condiciones de lluvia para mejorar la deteccion de objetos, senales y peatones. El modelo puede integrarse en pipelines de vision por computador antes de algoritmos de deteccion.
- Vigilancia y seguridad: mejora de la calidad de grabaciones de CCTV bajo lluvia, facilitando la identificacion de personas, vehiculos o matriculas en entornos urbanos.
- Fotografia y postprocesado: eliminacion de lluvia en fotografias personales o profesionales, especialmente en imagenes capturadas durante tormentas o lluvias ligeras.
- Preprocesado para otros modelos de vision: uso como etapa previa en sistemas de segmentacion semantica, deteccion de objetos o reconocimiento de escenas, donde la lluvia degrada el rendimiento de los modelos aguas abajo.
- Restauracion de archivos visuales: recuperacion de imagenes historicas o de archivo que presentan artefactos de lluvia, mejorando su valor documental.
- Sistemas de asistencia a la conduccion (ADAS): integracion en tiempo real para limpiar el flujo de video de las camaras frontales, mejorando la fiabilidad de los sistemas de frenado automatico o aviso de cambio de carril.

## Benchmarks y rendimiento

La model card proporciona metricas detalladas por conjunto de test, calculadas sobre las particiones de evaluacion propias de cada dataset (no sobre la validacion mixta usada para seleccion de checkpoint):

| Test Set | Dominio | PSNR (dB) | SSIM | MAE | MSE | Rain Removal Rate | NIQE |
|---|---|---|---|---|---|---|---|
| Rain100L | Sintetico | 34,14 | 0,957 | 0,0122 | 0,00063 | 0,473 | 9,79 |
| Rain100H | Sintetico | 27,72 | 0,849 | 0,0293 | 0,00220 | 0,747 | 11,46 |
| Test100 | Sintetico | 27,96 | 0,873 | 0,0350 | 0,00258 | 0,520 | 9,81 |
| Test1200 | Sintetico | 31,28 | 0,898 | 0,0226 | 0,00122 | 0,491 | 7,42 |
| Test2800 | Sintetico | 31,66 | 0,923 | 0,0193 | 0,00077 | 0,465 | 791,61 |
| DDN-Data | Sintetico | 31,84 | 0,926 | 0,0191 | 0,00076 | 0,454 | 997,81 |
| SPA-Data | Real | 41,77 | 0,986 | 0,0047 | 0,00025 | 0,559 | 6,27 |
| RealRain-1k-H | Real | 38,68 | 0,980 | 0,0091 | 0,00043 | 0,798 | 3,97 |
| RealRain-1k-L | Real | 40,64 | 0,986 | 0,0069 | 0,00025 | 0,745 | 4,17 |
| AllWeather (lluvia+niebla) | Cross-domain (estres) | 13,64 | 0,579 | 0,1889 | 0,05526 | 0,134 | 228,11 |

Nota: los valores de NIQE solo son comparables dentro de la misma fila, ya que las estadisticas de referencia se reajustan por conjunto de test. Un NIQE de 791 en Test2800 no implica peor calidad que un 9,79 en Rain100L; la escala de referencia difiere.

## Requisitos de hardware

- VRAM estimada: con 14,3 millones de parametros, el modelo ocupa ~57 MB en FP32 y ~28 MB en FP16. Cualquier GPU con 1-2 GB de VRAM es suficiente para inferencia.
- GPUs recomendadas: cualquier GPU moderna, incluyendo NVIDIA GTX 1060, RTX 2060, RTX 3060, etc. Tambien puede ejecutarse en CPU con tiempos de inferencia aceptables para imagenes de resolucion moderada.
- Cabe en GPUs de consumo: si, sin problema.
- Opciones de despliegue: PyTorch nativo, ONNX Runtime, TorchScript. No se menciona soporte para vLLM, llama.cpp u Ollama (no aplica, es un modelo de vision).
- Latencia y throughput: no disponible en la informacion proporcionada. Dado el tamano del modelo, se espera una inferencia rapida (del orden de decenas de milisegundos en GPU para imagenes de 256x256).

## Comparativa con modelos similares

No se dispone de datos comparativos con otros modelos de eliminacion de lluvia (como Restormer, Uformer, etc.) en la informacion proporcionada. La model card menciona una comparacion con el resto del zoo de modelos ClearView, pero la tabla no se incluye completa en el README. Por tanto, no se puede establecer una comparativa cuantitativa con alternativas externas.

## Limitaciones y advertencias

- Rendimiento deficiente en escenarios con niebla combinada con lluvia: en el conjunto AllWeather (lluvia+niebla) el PSNR cae a 13,64 dB y el SSIM a 0,579, indicando que el modelo no generaliza bien a degradaciones mixtas.
- El modelo esta especializado en lluvia; no maneja nieve, granizo u otros fenomenos meteorologicos.
- Los valores de NIQE no son comparables entre datasets, lo que puede llevar a interpretaciones erroneas si no se lee la documentacion con atencion.
- No se han publicado resultados de benchmarks comparativos con otros modelos de deraining en la informacion disponible.
- El modelo se distribuye bajo Apache 2.0, lo que permite uso comercial sin restricciones, pero el autor no proporciona garantias de rendimiento en produccion.
- No se especifican sesgos conocidos, pero al ser un modelo de vision, podria presentar diferencias de rendimiento segun las condiciones de iluminacion o el tipo de camara utilizada.

## Enlaces

- HuggingFace: https://huggingface.co/dronefreak/clearview-derain-nafnet
- Repositorio ClearView: https://github.com/dronefreak/clearview
- Configuracion de mezcla de datos: https://github.com/dronefreak/clearview/blob/main/configs/mix/rain_mixed_synthetic_real.yaml
- Configuracion de validacion mixta: https://github.com/dronefreak/clearview/blob/main/configs/mix/rain_mixed_val.yaml
- Paper de NAFNet: https://arxiv.org/abs/2206.05514
