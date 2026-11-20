# maochen-casia/warg_demo

## Resumen

WARG es un sistema de localización de rovers lunares que estima la posición de un vehículo sobre una imagen satelital. El paquete publicado en Hugging Face por el autor `maochen-casia` no es un modelo de lenguaje, sino un *bundle* de demostración que incluye los pesos del modelo (checkpoint de WARG), los pesos del extractor de características DINOv3 de Meta y diez fotogramas de test del dataset LuSNAR. El repositorio ocupa 1,3 GB y está etiquetado únicamente con `region:us`, sin pipeline, licencia ni idiomas declarados.

El problema que resuelve es la localización absoluta de un rover en un entorno sin GPS, un paso crítico para la navegación autónoma en misiones lunares. WARG combina la imagen del rover con mapas satelitales de referencia y estima posición y orientación mediante búsqueda en una región de 100 m × 100 m alrededor de una posición inicial aproximada, con hasta 65.536 posiciones candidatas por fotograma.

La relevancia actual del paquete es doble: por un lado, publica una implementación reproducible de un método de localización visual para exploración espacial; por otro, sirve como ejemplo de empaquetado de un modelo de visión con sus pesos base (DINOv3) y un conjunto de evaluación acotado. No hay información sobre arquitectura interna, número de parámetros ni datos de entrenamiento más allá de lo que describe la model card.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (sistema de localización visual basado en DINOv3 ViT-L/16 como extractor de características) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión, no de lenguaje) |
| Tipos de cuantizacion | no disponible (pesos en formato `.pth`) |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | no disponible para WARG; DINOv3 incluido con licencia oficial de Meta |
| Formato de pesos | `.pth` (PyTorch): `checkpoints/warg_pretrain/checkpoint.pth` y `checkpoints/dinov3/dinov3_vitl16_pretrain_lvd1689m-8aa4cbdd.pth` |
| Tamano del repositorio | 1,3 GB |
| Entrada | imagen del rover, mapas de profundidad, tiles satelitales e información de cámara |
| Salida | posición (x, y) y orientación (heading) del rover |
| Region de busqueda | 100 m × 100 m por defecto, configurable |
| Pasos de busqueda | 256 por eje (65.536 candidatos) por defecto, configurable |

## Arquitectura y entrenamiento

La model card no describe la arquitectura interna de WARG. Lo que sí se deduce del bundle es que el sistema emplea DINOv3 ViT-L/16 (variante `dinov3_vitl16_pretrain_lvd1689m`) como extractor de características visuales, sobre el que se construye un pipeline de estimación de posición. El proceso de localización consiste en una búsqueda exhaustiva (o por pasos) sobre una rejilla de posiciones candidatas dentro de una región de 100 m × 100 m centrada en una estimación inicial, que puede desviarse hasta 50 m por eje de la posición real.

El checkpoint de WARG corresponde al archivo de referencia del benchmark y la demo carga por defecto los pesos de la época 6. Se incluyen además mapas de profundidad e información de cámara del dataset LuSNAR (Moon_8), lo que sugiere que el método aprovecha tanto la apariencia visual como la geometría de la escena. No hay información disponible sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO (no aplicables a este tipo de modelo). La innovación técnica destacable es el uso de DINOv3 como backbone de correspondencia visual para emparejar la vista del rover con la imagen satelital y resolver la posición mediante búsqueda en rejilla.

## Capacidades

- Localización absoluta de un rover sobre una imagen satelital, devolviendo posición (x, y) y orientación (heading).
- Correspondencia visual entre la imagen del rover y los tiles satelitales mediante keypoints (hasta 24 pares dibujados por defecto en la visualización).
- Estimación de error en metros mediante el script `evaluate.py`.
- Visualización de posiciones, orientaciones y puntos de correspondencia (`visualize.py`).
- Ejecución en GPU CUDA cuando está disponible, con *fallback* a CPU.
- Configuración de la región de búsqueda, el número de pasos y el número de pares de keypoints dibujados.
- No dispone de generación de texto, razonamiento, código, matemáticas, tool calling, agentes ni capacidades multilingües: es un modelo de visión especializado en localización.

## Casos de uso

- Navegación autónoma de rovers lunares: el sistema estima la posición absoluta del vehículo comparando su cámara con mapas satelitales, lo que permite corregir la deriva de la odometría en entornos sin GPS.
- Validación de pipelines de localización en investigación: los diez fotogramas de LuSNAR y el script `evaluate.py` permiten medir el error en metros de un método de localización de forma reproducible antes de desplegarlo en un rover real.
- Planificación de rutas en superficie lunar: la posición y el heading estimados alimentan el planificador de trayectorias para evitar obstáculos y mantener el rumbo hacia un objetivo.
- Análisis de robustez frente a desviaciones iniciales: el parámetro `max_init_offset_m` permite simular errores de hasta 50 m por eje en la estimación inicial y evaluar la tolerancia del método.
- Generación de mapas de correspondencia visual: los pares de keypoints permiten auditar qué regiones de la imagen satelital se están usando para localizar, útil para depurar fallos en terrenos homogéneos.
- Docencia y demostraciones: el bundle incluye datos, pesos, scripts y salidas de ejemplo, lo que facilita reproducir el experimento en un portátil con GPU consumer o incluso en CPU.
- Integración en *pipelines* de percepción: el modelo puede ejecutarse como módulo de estimación de pose dentro de un sistema mayor de percepción y control del rover.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card menciona un informe de errores (`outputs/metrics.json`) y una figura de ejemplo, pero no incluye cifras numéricas de error ni comparaciones con otros métodos.

## Requisitos de hardware

- VRAM estimada: no disponible. El repositorio ocupa 1,3 GB, pero no se especifica el consumo en inferencia. Como referencia, un ViT-L/16 en FP32 requiere del orden de varios GB de VRAM; la demo no documenta la cifra exacta.
- GPU recomendadas: no disponible. La model card solo indica que se usa CUDA cuando está disponible.
- GPU consumer: no confirmado. El *fallback* a CPU está soportado, por lo que el demo puede ejecutarse sin GPU, aunque con mayor latencia.
- Opciones de despliegue: scripts Python propios (`demo.py`, `evaluate.py`, `visualize.py`) con un entorno virtual y `requirements.txt`. No se mencionan vLLM, llama.cpp, Ollama ni TGI (no aplicables a este tipo de modelo).
- Latencia y throughput: no disponibles. La carga computacional depende del número de pasos de búsqueda (65.536 candidatos por defecto), que el autor advierte que aumenta con la precisión.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la documentación proporcionada. WARG es un sistema de localización visual específico para rovers lunares y no se han publicado en el bundle referencias a alternativas de la misma categoría, ni datos de rendimiento que permitan una comparación cuantitativa.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no genera texto, código ni respuestas conversacionales; cualquier uso en ese sentido es inadecuado.
- La licencia de WARG no está declarada en la model card, lo que impide confirmar si se permite uso comercial. El componente DINOv3 sí incluye la licencia oficial de Meta en `checkpoints/dinov3/LICENSE.md`.
- El alcance de la búsqueda está limitado a 100 m × 100 m alrededor de la estimación inicial, con una desviación máxima de 50 m por eje; fuera de ese rango el método no está diseñado para localizar.
- La precisión depende del número de pasos de búsqueda: 256 por eje (65.536 candidatos) es el valor por defecto, y reducirlo acelera la ejecución a costa de exactitud.
- Solo se incluyen diez fotogramas de test de LuSNAR (Moon_8), por lo que la evaluación publicada es muy acotada y no representa la variabilidad completa de la superficie lunar.
- No hay información sobre sesgos, tasas de alucinación ni comportamiento en condiciones de iluminación extrema, sombras o terrenos homogéneos.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no existe validación comunitaria del funcionamiento del bundle.
- El pipeline no está declarado en Hugging Face, así que la integración con herramientas estándar de la plataforma no está garantizada.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/maochen-casia/warg_demo
- Código fuente de WARG: https://github.com/maochen-casia/warg
- Dataset LuSNAR: https://github.com/zqyu9/LuSNAR-dataset
- Paper del benchmark: https://arxiv.org/html/2606.10602v1#S2.F2
- Predicciones de ejemplo: `outputs/predictions.json`
- Informe de errores: `outputs/metrics.json`
- Visualización de ejemplo: `outputs/visualizations/0000_1693502010783979520.png`
