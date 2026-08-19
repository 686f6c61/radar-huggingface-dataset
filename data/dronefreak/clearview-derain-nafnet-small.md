# dronefreak/clearview-derain-nafnet-small

## Resumen

ClearView Derain NAFNet Small es un modelo de eliminacion de lluvia en una sola imagen (single-image deraining) desarrollado por dronefreak. Se basa en la arquitectura NAFNet (Nonlinear Activation Free Network) en su variante "small", con aproximadamente 1,1 millones de parametros, lo que lo convierte en una solucion extremadamente ligera para restauracion de imagenes. El modelo se entrena con una mezcla de datos sinteticos y reales, con el objetivo de generalizar correctamente en entornos reales en lugar de optimizar exclusivamente para un unico benchmark.

La relevancia de este modelo radica en su enfoque de "dominio mixto": en lugar de entrenar solo con lluvia sintetica (que suele tener un aspecto artificial), incorpora conjuntos de datos reales como SPA-Data y RealRain-1k, sobremuestreados para equilibrar la proporcion. Esto lo hace especialmente util para aplicaciones practicas como conduccion autonoma, vigilancia o fotografia movil, donde las condiciones de lluvia real son muy variables. El checkpoint se selecciona mediante una metrica de validacion combinada que evita que un solo dataset domine el proceso.

El modelo se distribuye bajo licencia Apache 2.0, lo que permite uso comercial sin restricciones significativas. Se integra con la libreria ClearView, que proporciona una API sencilla para cargar el modelo y procesar imagenes. Aunque el repositorio de HuggingFace no muestra descargas ni likes, la ficha tecnica incluye metricas detalladas en multiples conjuntos de prueba, tanto sinteticos como reales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | NAFNet Small (Nonlinear Activation Free Network) |
| Parametros totales | 1,1 millones |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No aplica (modelo de vision, no de texto) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No aplica (procesa imagenes, no texto) |
| Licencia | Apache 2.0 |
| Formato de pesos | .pth (PyTorch) |

## Arquitectura y entrenamiento

NAFNet es una arquitectura de restauracion de imagenes que elimina las funciones de activacion no lineales (como ReLU o GELU) en favor de operaciones simples, lo que reduce la complejidad computacional y mejora la eficiencia sin sacrificar rendimiento. La variante "small" reduce el numero de canales y bloques respecto al modelo base, logrando un recuento de parametros de solo 1,1 millones, adecuado para despliegue en dispositivos con recursos limitados.

El entrenamiento combina cinco fuentes de datos: Rain13K (13.711 pares sinteticos), DDN-Data/Rain1400 (12.600 pares sinteticos), SPA-Data (6.385 pares reales), y RealRain-1k-H y RealRain-1k-L (784 pares reales cada uno). Los conjuntos de datos reales se sobremuestrean con un factor de 2,0, resultando en una proporcion efectiva de aproximadamente 62% sintetico y 38% real. La seleccion del checkpoint se realiza sobre un conjunto de validacion combinado que incluye SPA-Data val (limitado a 150 pares), RealRain-1k-H/L val (112 cada uno) y Rain100L (100 pares), evitando que un solo dataset domine la metrica de seleccion.

## Capacidades

- Eliminacion de lluvia en una sola imagen: el modelo procesa una imagen con lluvia y devuelve una version limpia, sin necesidad de informacion temporal o de multiples fotogramas.
- Restauracion de imagenes en dominios mixtos: funciona tanto con lluvia sintetica (generada por ordenador) como con lluvia real capturada en entornos naturales.
- Procesamiento de alta resolucion: aunque no se especifica un limite de resolucion, la arquitectura NAFNet es convolucional y puede manejar imagenes de tamano arbitrario en inferencia.
- Eficiencia computacional: con solo 1,1 millones de parametros, es adecuado para inferencia en tiempo real en hardware modesto.
- No incluye capacidades de texto, tool calling, agentes ni multimodalidad: es un modelo puramente de vision para una tarea especifica.

## Casos de uso

- Conduccion autonoma: las camaras de los vehiculos autonomos se degradan con lluvia intensa. Este modelo puede preprocesar las imagenes antes de pasarlas a sistemas de deteccion de objetos o segmentacion, mejorando la fiabilidad en condiciones adversas.
- Vigilancia y seguridad: las camaras de vigilancia exteriores sufren artefactos por lluvia. Aplicar deraining en tiempo real permite mantener la calidad de las grabaciones y facilita el analisis forense posterior.
- Fotografia de consumo: aplicaciones moviles de camara pueden integrar este modelo para limpiar fotos tomadas bajo lluvia, mejorando la experiencia del usuario sin requerir hardware especializado.
- Restauracion de archivos historicos: videos o fotografias antiguas con degradacion por lluvia pueden restaurarse de forma automatica, preservando contenido visual valioso.
- Preprocesado para otros modelos de vision: antes de alimentar un modelo de reconocimiento de matricula o de lectura de senales, se puede aplicar deraining para aumentar la precision de las tareas posteriores.
- Sistemas embebidos y edge computing: gracias a su tamano reducido, puede desplegarse en dispositivos con poca memoria, como drones, camaras IP o sistemas de bajo consumo, para procesamiento local sin conexion a la nube.

## Benchmarks y rendimiento

La model card proporciona metricas detalladas en conjuntos de prueba especificos, calculadas sobre las particiones de test/eval de cada fuente. Se incluyen PSNR, SSIM, MAE, MSE, Rain Removal Rate y NIQE. Nota: los valores de NIQE solo son comparables dentro de la misma fila, ya que las estadisticas de referencia se reajustan por conjunto de datos.

| Test Set | Dominio | PSNR (dB) | SSIM | MAE | MSE | Rain Removal Rate | NIQE |
|---|---|---|---|---|---|---|---|
| Rain100L | Sintetico | 30,20 | 0,922 | 0,0170 | 0,00136 | 0,273 | 9,84 |
| Rain100H | Sintetico | 25,02 | 0,763 | 0,0409 | 0,00390 | 0,679 | 12,28 |
| Test100 | Sintetico | 25,26 | 0,820 | 0,0513 | 0,00520 | 0,412 | 9,84 |
| Test1200 | Sintetico | 30,43 | 0,874 | 0,0250 | 0,00145 | 0,431 | 7,03 |
| Test2800 | Sintetico | 30,58 | 0,906 | 0,0218 | 0,00098 | 0,397 | 827,40 |
| DDN-Data | Sintetico | 30,83 | 0,910 | 0,0214 | 0,00095 | 0,389 | 1028,89 |
| SPA-Data | Real | 37,13 | 0,973 | 0,0071 | 0,00047 | 0,241 | 6,34 |
| RealRain-1k-H | Real | 34,33 | 0,957 | 0,0142 | 0,00094 | 0,703 | 3,98 |
| RealRain-1k-L | Real | 36,59 | 0,970 | 0,0103 | 0,00054 | 0,633 | 3,48 |
| AllWeather (lluvia+niebla) | Cross-domain (estres) | 13,59 | 0,574 | 0,1907 | 0,05592 | 0,113 | 239,36 |

Los resultados muestran un rendimiento solido en datos reales (SPA-Data, RealRain-1k) con PSNR superiores a 34 dB, mientras que en el conjunto de estres AllWeather (que combina lluvia y niebla) el rendimiento cae drasticamente, indicando que el modelo no esta disenado para degradaciones mixtas complejas.

## Requisitos de hardware

- VRAM estimada: no se proporcionan datos oficiales, pero con 1,1 millones de parametros, el modelo ocupa aproximadamente 4,4 MB en precision FP32. La inferencia puede ejecutarse en CPU sin problemas, y en GPU el uso de VRAM es despreciable (menos de 1 GB incluso con lotes grandes).
- GPU recomendadas: cualquier GPU moderna, incluidas las de gama de entrada como NVIDIA GTX 1650 o integradas. No requiere GPUs de datacenter.
- Compatibilidad con consumer GPU: si, cabe en cualquier GPU de consumo actual, incluso en sistemas con 2 GB de VRAM.
- Opciones de despliegue: la libreria ClearView proporciona una API Python. Tambien puede exportarse a ONNX o TorchScript para integracion en otros frameworks. No se menciona soporte para vLLM, llama.cpp u Ollama, ya que no es un modelo de lenguaje.
- Latencia y throughput: no se publican datos especificos, pero por el tamano del modelo, se espera una latencia de milisegundos en GPU y de decenas de milisegundos en CPU para imagenes de resolucion media (512x512).

## Comparativa con modelos similares

No se dispone de datos comparativos publicos con otros modelos de deraining en la informacion proporcionada. La model card menciona una "ClearView Model Comparison" dentro de la zoo de modelos ClearView, pero no se incluye la tabla completa en el texto extraido. Por tanto, no es posible realizar una comparativa cuantitativa con alternativas como Restormer, MPRNet o Uformer sin datos adicionales. Se indica "no disponible" para esta seccion.

## Limitaciones y advertencias

- Rendimiento degradado en condiciones extremas: el conjunto AllWeather (lluvia combinada con niebla) muestra un PSNR de solo 13,59 dB, lo que indica que el modelo no maneja bien degradaciones mixtas o escenarios fuera de su distribucion de entrenamiento.
- Riesgo de alucinacion de detalles: la metrica Rain Removal Rate puede ser negativa si el modelo anade error de alta frecuencia (por ejemplo, sobre-enfoque o detalles inventados). Aunque no se reportan valores negativos en los conjuntos de prueba, es un riesgo inherente a los modelos de restauracion.
- NIQE no comparable entre conjuntos: los valores de NIQE se reajustan por conjunto de datos, por lo que no deben interpretarse como una medida absoluta de calidad entre diferentes filas.
- Sesgo hacia datos reales: al sobremuestrear los conjuntos reales, el modelo puede estar sesgado hacia las caracteristicas especificas de SPA-Data y RealRain-1k, y podria no generalizar a otros tipos de lluvia real no representados.
- Sin soporte para otros tipos de degradacion: no elimina nieve, polvo ni ruido general; solo esta optimizado para lluvia.
- Dependencia de la libreria ClearView: para cargar el modelo correctamente, es necesario instalar la libreria ClearView desde GitHub, lo que anade una dependencia externa al ecosistema PyTorch.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/dronefreak/clearview-derain-nafnet-small
- Repositorio ClearView: https://github.com/dronefreak/clearview
- Configuracion de mezcla de datos (rain_mixed_synthetic_real.yaml): https://github.com/dronefreak/clearview/blob/main/configs/mix/rain_mixed_synthetic_real.yaml
- Configuracion de validacion mezclada (rain_mixed_val.yaml): https://github.com/dronefreak/clearview/blob/main/configs/mix/rain_mixed_val.yaml
- Paper de NAFNet (arXiv:2206.05514): https://arxiv.org/abs/2206.05514
