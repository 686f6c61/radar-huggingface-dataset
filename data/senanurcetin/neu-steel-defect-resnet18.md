# senanurcetin/neu-steel-defect-resnet18

## Resumen

El modelo `senanurcetin/neu-steel-defect-resnet18` es un clasificador de imágenes basado en ResNet-18, preentrenado en ImageNet y ajustado (fine-tuning) sobre las seis clases de la base de datos NEU-CLS de defectos superficiales en acero: crazing, inclusion, patches, pitted surface, rolled-in scale y scratches. Lo desarrolla el usuario de Hugging Face senanurcetin y se distribuye como un único fichero ONNX, pensado para inferencia en CPU o directamente en el navegador.

El problema que aborda es la inspección visual automatizada de calidad (visual QC) en entornos industriales: detectar y clasificar defectos superficiales en tiras de acero a partir de recortes de imagen de 200×200 píxeles en escala de grises. El modelo se exporta a ONNX y se acompaña de un demo en Hugging Face Spaces que permite comparar predicciones sobre imágenes limpias y degradadas, además de un diseño de cola de revisión por confianza para derivar piezas dudosas a un operador humano.

La relevancia del modelo no reside en su rendimiento bruto —el benchmark NEU-CLS está saturado, con exactitud del 1.000 en las dos particiones evaluadas— sino en la documentación honesta de sus límites: el autor publica una tabla de degradación en tiempo de test que muestra caídas drásticas de exactitud ante desenfoque, ruido de sensor o baja resolución, lo que lo convierte en un caso útil para entender por qué una métrica perfecta en un dataset de laboratorio no implica despliegue en línea de producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ResNet-18 (CNN residual), preentrenada en ImageNet y ajustada en NEU-CLS |
| Parametros totales | no disponible (ResNet-18 estándar, ~11,7 M parámetros según la arquitectura de referencia; el autor no lo indica) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de clasificación de imágenes) |
| Tipos de cuantizacion | no disponible (se distribuye un único fichero ONNX; el benchmark cita FP32 en CPU y FP16 en TensorRT) |
| Idiomas soportados | no aplica (clasificación de imágenes; etiquetas en inglés) |
| Licencia | MIT |
| Formato de pesos | ONNX (`neu_resnet18.onnx`), acompañado de `labels.json` con media, desviación típica y orden de clases |

## Arquitectura y entrenamiento

La arquitectura es una ResNet-18 convolucional estándar con conexiones residuales, inicializada con pesos de ImageNet y ajustada sobre las seis clases de NEU-CLS. La entrada es un tensor de 1×3×224×224 en float32: la imagen en escala de grises se convierte a tres canales, se redimensiona a 224×224, se escala a [0, 1] y se normaliza con la media y desviación típica de ImageNet (los valores exactos y el orden de clases están en `labels.json`). La salida son logits sobre las seis clases.

El entrenamiento se detalla en el script `train_cnn.py`: 12 épocas, optimizador AdamW, aumentación con volteos y rotaciones pequeñas, y un coste aproximado de 5 minutos en una GPU. Se documentan dos particiones: una aleatoria 80/20 con semilla 42 y una bloqueada que retiene las imágenes 241–300 de cada clase, motivada porque las imágenes NEU son recortes de las mismas tiras de acero y los índices vecinos pueden ser casi duplicados. El dataset NEU-CLS (K. Song y Y. Yan, Northeastern University) contiene 1.800 imágenes, 300 por clase, y no se redistribuye en el repositorio.

## Capacidades

- Clasificación de imágenes en seis clases de defectos superficiales de acero: crazing, inclusion, patches, pitted surface, rolled-in scale y scratches.
- Inferencia en CPU y en navegador gracias a la exportación a un único fichero ONNX.
- Salida de logits y puntuaciones por clase, apta para umbrales de confianza y colas de revisión.
- Integración con un diseño de review-queue basado en confianza que deriva piezas dudosas a un operador humano.
- Demo interactivo que permite comparar predicciones sobre imágenes limpias y degradadas (desenfoque gaussiano y ruido gaussiano con semilla).
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multilingües: es un clasificador de imagen puro.

## Casos de uso

- Inspección visual en línea de producción de acero: el modelo clasifica recortes de superficie y, combinado con la cola de revisión por confianza, permite derivar las piezas de baja confianza a un operador en lugar de aceptarlas automáticamente. Es adecuado por su latencia baja en ONNX Runtime (3,286 ms de mediana en TensorRT FP16 con RTX 3060 Laptop).
- Pre-filtrado en pipelines de control de calidad: al ejecutarse en CPU con 47,779 ms de mediana por lote de 1 en FP32, puede desplegarse en servidores sin GPU para triar imágenes antes de un modelo más costoso.
- Despliegue en navegador o en el borde: el formato ONNX único y el demo en Hugging Face Spaces permiten probar el clasificador sin infraestructura, útil para prototipado y validación con operadores.
- Detección temprana de defectos en tiras de acero: las seis clases cubren los modos de fallo más comunes del dataset NEU-CLS, lo que lo hace útil como punto de partida para anotar y clasificar lotes históricos.
- Evaluación de robustez ante condiciones de cámara: la tabla de degradación del autor permite usar el modelo como referencia para medir cómo afectan iluminación, contraste, ruido y resolución a un clasificador CNN en un entorno concreto.
- Docencia y reproducción de experimentos: el script `train_cnn.py` reproduce ambas particiones en unos 5 minutos en una GPU, lo que lo convierte en un ejemplo práctico de fine-tuning, exportación a ONNX y análisis de saturación de benchmark.
- Integración en sistemas de inspección existentes: la salida de logits y el `labels.json` con media, desviación y orden de clases facilitan el encaje en pipelines Python con ONNX Runtime.

## Benchmarks y rendimiento

Resultados publicados por el autor en la model card:

| Modelo | Partición | Exactitud | Macro F1 |
|---|---|---|---|
| Random Forest sobre HOG + Gabor + grid (modelo del proyecto) | aleatoria 80/20, semilla 42 | 0,939 | 0,939 |
| Este ResNet-18 | aleatoria 80/20, semilla 42 | 1,000 (360/360) | 1,000 |
| Este ResNet-18 | bloqueada: imágenes 241–300 de cada clase retenidas | 1,000 (360/360) | 1,000 |

Degradación en tiempo de test sobre las mismas 360 imágenes (dos ejecuciones en GPU, por variabilidad no determinista):

| Condición de test | Exactitud (dos ejecuciones) |
|---|---|
| Limpia | 1,000 |
| Iluminación más oscura (×0,5) | 1,000 |
| Bajo contraste (×0,5) | 0,947–0,967 |
| Iluminación más brillante (×1,6) | 0,822–0,828 |
| Ruido de sensor, sd 0,05 | 0,692–0,808 |
| JPEG calidad 15 | 0,678–0,767 |
| Media resolución | 0,642–0,661 |
| Desenfoque leve (radio 1,5) | 0,556–0,631 |
| Cuarta parte de resolución | 0,514–0,594 |
| Ruido de sensor, sd 0,12 | 0,344–0,386 |
| Desenfoque fuerte (radio 3) | 0,356–0,375 |

Benchmark de inferencia ONNX Runtime sobre 1.800 imágenes NEU-CLS: latencia mediana por lote de 1 de 47,779 ms en CPU FP32 y 3,286 ms en TensorRT FP16 con RTX 3060 Laptop GPU. Todos los backends probados coincidieron en la clase predicha.

## Requisitos de hardware

- VRAM estimada para inferencia: mínima; ResNet-18 en FP16 ocupa del orden de decenas de MB de pesos, por lo que cabe holgadamente en cualquier GPU consumer. El autor no publica una cifra de VRAM.
- GPU recomendadas: RTX 3060 Laptop GPU es la empleada en el benchmark TensorRT FP16 (3,286 ms de mediana por imagen). Cualquier GPU con soporte CUDA y TensorRT es suficiente; también funciona en CPU.
- Cabe en GPU consumer: sí, en cualquier GPU consumer moderna, e incluso en CPU con ONNX Runtime (47,779 ms de mediana por imagen en FP32).
- Opciones de despliegue: ONNX Runtime (CPU, CUDA, TensorRT), ejecución en navegador vía ONNX y el demo en Hugging Face Spaces. No se documentan despliegues con vLLM, llama.cpp, Ollama ni TGI, que no aplican a un clasificador de imagen.
- Latencia y throughput: 47,779 ms por imagen en CPU FP32 y 3,286 ms por imagen en TensorRT FP16 con RTX 3060 Laptop GPU (mediana, lote de 1).

## Comparativa con modelos similares

No se dispone de datos de benchmarks de otros clasificadores ResNet-18 sobre NEU-CLS en la información proporcionada, salvo el Random Forest del propio proyecto. La comparativa disponible es la siguiente:

| Modelo | Arquitectura | Partición | Exactitud | Macro F1 | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Este modelo | ResNet-18 (ONNX) | aleatoria 80/20, semilla 42 | 1,000 | 1,000 | MIT | Hugging Face |
| Random Forest del proyecto | HOG + Gabor + grid | aleatoria 80/20, semilla 42 | 0,939 | 0,939 | no disponible | no disponible como modelo publicado |

No se han publicado comparativas con otros clasificadores NEU-CLS en la información disponible.

## Limitaciones y advertencias

- Benchmark saturado: la exactitud de 1,000 en NEU-CLS no indica que el modelo esté listo para una línea de producción; el propio autor lo advierte. NEU-CLS son recortes de 200×200 en escala de grises tomados con una única configuración.
- Sensibilidad a condiciones de captura: la exactitud cae a 0,356–0,375 con desenfoque fuerte, 0,344–0,386 con ruido de sensor sd 0,12, 0,514–0,594 a cuarta parte de resolución y 0,678–0,767 con JPEG calidad 15. Enfoque, resolución y ruido de sensor son las condiciones a controlar en línea o a añadir como aumentación en el entrenamiento.
- Generalización limitada: no hay evidencia sobre otras iluminaciones, cámaras, grados de acero o tamaños de defecto distintos a los del dataset NEU-CLS. Es obligatorio validar con imágenes de la línea propia antes de confiar en él.
- Riesgo de alucinación: no aplica en el sentido de generación de texto, pero sí existe riesgo de clasificación errónea con alta confianza fuera de la distribución de entrenamiento; el autor recomienda mantener la cola de revisión por confianza.
- Idiomas: no aplica; las etiquetas están en inglés y el modelo no procesa texto.
- Licencia MIT: permite uso comercial, modificación y redistribución con atribución; el dataset NEU-CLS no se redistribuye en el repositorio, por lo que su uso está sujeto a los términos de la base de datos original.
- Reproducibilidad: el entrenamiento en GPU no es bit a bit reproducible y las cifras de degradación varían unos pocos puntos entre ejecuciones.
- Tamaño del repositorio: 0,0 GB reportado, lo que sugiere que los pesos pueden no estar materializados o que el repositorio es muy pequeño; conviene verificar la disponibilidad efectiva del fichero ONNX antes de integrarlo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/senanurcetin/neu-steel-defect-resnet18
- Demo en Hugging Face Spaces: https://huggingface.co/spaces/senanurcetin/neu-steel-defect-demo
- Hilo de discusión del demo: https://huggingface.co/spaces/senanurcetin/neu-steel-defect-demo/discussions/1
- Repositorio del proyecto: https://github.com/senanurcetin/visual-qc-project
- Benchmark ONNX Runtime publicado: https://github.com/senanurcetin/visual-qc-project/blob/2025c842f7366501fdada365846b12115d2d5504/docs/data/tensorrt-benchmark/benchmark.json
- Notebook de robustez en Kaggle: https://www.kaggle.com/code/senanuretin/neu-steel-defects-100-accuracy-and-where-it-ends
