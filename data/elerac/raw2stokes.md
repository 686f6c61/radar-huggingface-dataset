# elerac/raw2stokes

## Resumen

`raw2stokes` es un modelo de reconstrucción de imágenes de polarización en color desarrollado por el usuario elerac y publicado en Hugging Face. No es un modelo de lenguaje: se trata de una red neuronal convolucional empaquetada en formato ONNX que realiza de forma conjunta el demosaicing y la reducción de ruido de un mosaico RAW procedente de un sensor de polarización Sony IMX250MYR, y reconstruye el vector de Stokes en color para cada píxel. Su función es sustituir la función `pa.raw2stokes()` de la librería Polanalyser.

El modelo resuelve un problema específico de visión por computador: los sensores de polarización de división de plano capturan cuatro orientaciones de filtro polarizador intercaladas en el mosaico, lo que exige un proceso de reconstrucción cuidadoso para obtener los parámetros de Stokes (S0, S1, S2) sin artefactos de interpolación ni ruido. Al integrar demosaicing y denoising en una sola pasada convolucional, evita el encadenamiento de etapas que suele amplificar el ruido.

Es relevante para investigadores y desarrolladores que trabajan con imagen de polarización (visión robótica, inspección industrial, análisis de materiales, reconstrucción de superficies) y que necesitan un paso de reconstrucción rápido y desplegable mediante ONNX Runtime. El repositorio es pequeño (0,1 GB) y se distribuye con licencia Apache 2.0, lo que facilita su integración en pipelines propios. No se dispone de información sobre arquitectura detallada, número de parámetros ni datos de entrenamiento en la documentación publicada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | red neuronal convolucional (detalles no disponibles); empaquetada en ONNX |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión) |
| Tipos de cuantizacion | FP32 y mixta FP16/FP32 (dos artefactos ONNX) |
| Idiomas soportados | no aplica (modelo de imagen) |
| Licencia | Apache 2.0 (modelos ONNX); CC BY 4.0 para las tres imágenes TIFF de ejemplo |
| Formato de pesos | ONNX (`raw2stokes-fp32.onnx`, `raw2stokes-mixed_fp16.onnx`) |
| Entrada | tensor float32 de forma (H, W), mosaico RAW normalizado a [0,1] |
| Salida | tensor float32 de forma (H, W, 3, 3), orden de color BGR, S0/S1/S2 en el eje final |
| Sensor objetivo | Sony IMX250MYR (mosaico de polarización en color) |
| Runtime | onnxruntime |
| Tamano del repositorio | 0,1 GB |

## Arquitectura y entrenamiento

La documentación publicada no describe la arquitectura interna más allá de indicar que el modelo procesa características convolucionales y que la versión mixta mantiene en FP32 las operaciones de promediado local y conversión a Stokes. La variante `raw2stokes-mixed_fp16.onnx` aplica media precisión a las capas convolucionales y reserva FP32 para las etapas numéricamente sensibles, lo que sugiere una red de tipo encoder-decoder o un conjunto de capas convolucionales seguidas de un módulo de conversión analítica a parámetros de Stokes.

No se dispone de información sobre el conjunto de datos de entrenamiento, el número de imágenes, la composición del dataset, ni sobre si se emplearon técnicas de aumento de datos o funciones de pérdida específicas. Tampoco hay datos sobre si se usó entrenamiento supervisado con pares RAW/ground truth sintético o capturas reales. La única información operativa es la convención de entrada: mosaico en orientación nativa, escalado por el código blanco del sensor, fase canónica en la esquina superior izquierda (rojo, 90 grados), nivel de negro registrado y balance de blancos de captura conservados.

## Capacidades

- Demosaicing conjunto de un mosaico de polarización en color del sensor Sony IMX250MYR.
- Reducción de ruido integrada en la misma pasada que el demosaicing.
- Reconstrucción del vector de Stokes en color por píxel: S0 (intensidad), S1 y S2 (componentes lineales de polarización).
- Salida en orden de color BGR con forma (H, W, 3, 3) y S0/S1/S2 en el último eje.
- Preservación del balance de blancos de captura en la salida, sin transformación de visualización.
- Procesamiento de regiones de interés (ROI) si las coordenadas de origen se alinean a múltiplos de cuatro.
- Dos variantes de precisión para equilibrar exactitud y coste computacional (FP32 y mixta FP16/FP32).
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multilingües: es un modelo puramente de visión.

## Casos de uso

- Reconstrucción de imágenes de polarización en investigación: el modelo convierte directamente un mosaico RAW del IMX250MYR en mapas de Stokes en color, lo que permite obtener S0/S1/S2 listos para análisis de polarización sin implementar un pipeline propio de demosaicing y denoising.
- Inspección industrial de superficies: los mapas de S1/S2 permiten detectar tensiones, defectos superficiales o anisotropías en materiales; el modelo aporta una reconstrucción limpia y rápida en una sola pasada.
- Visión robótica con cámaras de polarización: la salida de Stokes por píxel alimenta algoritmos de reconstrucción de forma, estimación de normales o separación de reflexiones especulares y difusas en tiempo de inferencia con ONNX Runtime.
- Integración en Polanalyser: el modelo sustituye la función `pa.raw2stokes()` de la librería, de modo que los flujos de análisis existentes pueden beneficiarse de una reconstrucción aprendida sin cambiar la interfaz de trabajo.
- Procesamiento por regiones de interés: al admitir ROI con origen alineado a múltiplos de cuatro, permite analizar zonas concretas de una captura de gran tamaño sin procesar la imagen completa.
- Despliegue en entornos con recursos limitados: la variante mixta FP16/FP32 reduce el coste de las capas convolucionales y el repositorio de 0,1 GB cabe en dispositivos de borde con ONNX Runtime, útil para captura de campo o sistemas embebidos.
- Análisis de materiales y caracterización óptica: la reconstrucción de Stokes en color facilita estudiar birrefringencia, dicroísmo o reflexión polarizada en muestras bajo iluminación controlada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El repositorio ocupa 0,1 GB y el modelo es una red convolucional pequeña, por lo que la huella de memoria es reducida en comparación con modelos generativos, pero no se publican cifras concretas.
- GPU recomendadas: no disponible. Al ejecutarse mediante ONNX Runtime, puede usar CPU o GPU compatibles con los execution providers de ONNX Runtime (CUDA, TensorRT, DirectML, entre otros), pero no se especifican modelos concretos.
- Compatibilidad con GPU de consumo: probable por el tamaño del artefacto y el uso de ONNX Runtime, pero no confirmada en la documentación.
- Opciones de despliegue: ONNX Runtime (librería declarada). No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye otros modelos de reconstrucción de Stokes comparables ni datos de rendimiento que permitan una comparación cuantitativa.

## Limitaciones y advertencias

- Diseñado exclusivamente para mosaicos de polarización en color del sensor Sony IMX250MYR. Las cámaras monocromas requieren un método de reconstrucción diferente, según la propia model card.
- La entrada debe cumplir estrictamente las convenciones: orientación nativa, escala [0,1] respecto al código blanco del sensor, fase canónica en la esquina superior izquierda (rojo, 90 grados), nivel de negro registrado y balance de blancos conservados. Un incumplimiento produce resultados incorrectos.
- H y W deben ser al menos cuatro; para ROI, ambas coordenadas de origen deben ser múltiplos de cuatro.
- La salida conserva el balance de blancos de captura y no aplica transformación de visualización, por lo que no es directamente apta para visualización sin postprocesado.
- No se documentan sesgos, tasas de alucinación ni limitaciones de idioma porque el modelo no procesa texto; el riesgo principal es la amplificación de artefactos o ruido en capturas fuera de las condiciones de entrenamiento, extremo no cuantificado en la documentación.
- Licencia Apache 2.0 para los modelos ONNX, lo que permite uso comercial con las obligaciones de atribución correspondientes; las tres imágenes TIFF de ejemplo están bajo CC BY 4.0 y requieren crédito a Polanalyser, enlace a la fuente y licencia, e indicación de cambios.
- No se publican datos de entrenamiento, arquitectura detallada ni métricas de calidad, lo que dificulta evaluar su robustez antes de desplegarlo en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/elerac/raw2stokes
- Imagen de ejemplo: https://huggingface.co/elerac/raw2stokes/blob/main/examples/imx250myr/street-sign.tiff
- Directorio de ejemplos: https://huggingface.co/elerac/raw2stokes/tree/main/examples/imx250myr
- Licencia del modelo: https://huggingface.co/elerac/raw2stokes/blob/main/LICENSE
- Licencia de las imágenes de ejemplo: https://huggingface.co/elerac/raw2stokes/blob/main/examples/imx250myr/LICENSE.txt
