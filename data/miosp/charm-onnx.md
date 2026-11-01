# Miosp/charm-onnx

## Resumen

Charm (ONNX) es una exportación a formato ONNX de los modelos de evaluación de estética y calidad de imagen Charm, presentados en CVPR 2025 por Fatemeh Behrad, Tinne Tuytelaars y Johan Wagemans (KU Leuven). El repositorio, mantenido por Miosp, convierte los checkpoints originales de PyTorch publicados en `FatemehBehrad/Charm` a grafos ONNX Runtime optimizados, manteniendo la fidelidad numérica del modelo original. Charm no es un modelo de lenguaje: es un clasificador de imágenes cuyo backbone es DINOv2 y cuya contribución principal es un esquema de tokenización para ViTs que preserva composición, alta resolución, relación de aspecto e información multiescala.

El problema que resuelve es la evaluación automática de la calidad estética y técnica de fotografías, una tarea relevante para sistemas de curación de contenido, motores de recomendación visual y pipelines de generación de imágenes que necesitan filtrar o puntuar resultados. El repositorio incluye siete variantes entrenadas sobre distintos datasets de referencia (AADB, AVA, BAID, KONIQ10K, PARA, SPAQ y TAD66K), cada una con su propio `model.onnx` en fp32 y la tabla de posiciones de DINOv2 necesaria para el tokenizador.

La relevancia actual del repositorio es práctica: elimina la dependencia de PyTorch para inferencia (solo requiere `onnxruntime`, `numpy` y `pillow`), lo que facilita el despliegue en entornos de producción ligeros. El tamaño del repositorio es de 1,7 GB y la licencia es Apache-2.0, igual que el código y los checkpoints originales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ViT (DINOv2-small o DINOv2-large según dataset) con esquema de tokenización Charm |
| Parametros totales | no disponible (depende del backbone: DINOv2-small o DINOv2-large) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión; entrada = parches de 14x14 px con selección multiescala) |
| Tipos de cuantizacion | solo fp32 en este repositorio (ONNX Runtime transformer-fused) |
| Idiomas soportados | no aplica (modelo de imagen, sin entrada de texto) |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (`model.onnx`) + `pos_embed.npy` (tabla posicional DINOv2) |

## Arquitectura y entrenamiento

Charm es un esquema de tokenización para Vision Transformers que, en lugar de la rejilla uniforme estándar, selecciona parches a múltiples escalas y resoluciones preservando la composición y la relación de aspecto original de la imagen. El backbone es DINOv2 (variante small o large según el dataset de entrenamiento), y sobre él se añade una cabeza de predicción específica por tarea. La selección de parches de alta resolución se realiza mediante un ranking basado en FFT (configuración `frequency`, la recomendada por los autores para inferencia).

Cada una de las siete variantes se entrena sobre un dataset distinto de estética o calidad de imagen: AADB, AVA, BAID, KONIQ10K, PARA, SPAQ y TAD66K. La salida varía según el dataset: en algunos casos es la salida directa de la cabeza (`head output`), en AVA es la media de una distribución de 1 a 10, y en PARA la media de una distribución de 1 a 5. La conversión a ONNX reescribe el forward con operaciones trazables, pliega el LayerScale de DINOv2 en las capas lineales precedentes (equivalente numéricamente) y aplica las fusiones de transformer de ONNX Runtime.

## Capacidades

- Puntuación de estética de imágenes (variantes `aadb`, `ava`, `baid`, `para`, `tad66k`).
- Evaluación de calidad de imagen (variantes `koniq10k`, `spaq`).
- Procesamiento por lotes de imágenes con el mismo número de tokens (no hay máscara de atención).
- Inferencia sin PyTorch: solo `onnxruntime`, `numpy` y `pillow`; el tokenizador Charm está reimplementado en NumPy.
- Salidas dobles: `prediction [batch, classes]` y `score [batch]`.
- No soporta tool calling, agentes, texto ni audio: es exclusivamente un clasificador de imagen.

## Casos de uso

- Curación automática de galerías fotográficas: usar la variante `ava` o `aadb` para ordenar o filtrar imágenes por puntuación estética antes de publicarlas en un catálogo o portfolio.
- Filtrado de salidas de modelos generativos de imagen: puntuar cada imagen generada con `spaq` o `koniq10k` y descartar las que queden por debajo de un umbral de calidad técnica.
- Moderación de calidad en plataformas de contenido generado por usuarios: preclasificar subidas con `aadb` y derivar a revisión humana solo las que caigan en rangos ambiguos.
- Selección de miniaturas o imágenes de portada: puntuar candidatas con `tad66k` o `para` y elegir automáticamente la de mayor valor estético para un artículo o ficha de producto.
- Investigación en evaluación estética: comparar las siete variantes sobre un mismo conjunto de imágenes para analizar cómo difieren los sesgos de cada dataset de entrenamiento.
- Despliegue en servicios ligeros sin GPU: al requerir solo ONNX Runtime, el modelo puede ejecutarse en contenedores pequeños o entornos edge para preprocesar lotes de imágenes en pipelines de ingesta.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo reporta la fidelidad de la conversión a ONNX: con los mismos tokens de entrada, las salidas coinciden con los modelos PyTorch originales con un error menor que 1e-6; de extremo a extremo, las puntuaciones quedan dentro del 0,5 % del rango de puntuación en las imágenes de prueba, con diferencias ocasionales en uno de los 64 regiones de alta resolución por el redondeo en punto flotante del ranking FFT.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita; al ser DINOv2-small o DINOv2-large en fp32, la huella es moderada y cabe holgadamente en GPUs de consumo actuales.
- GPU recomendadas: cualquier GPU con soporte de ONNX Runtime (CUDA o TensorRT); para DINOv2-large conviene al menos 8 GB de VRAM.
- Cabe en GPU de consumo: sí, tanto las variantes small como la large en fp32.
- Opciones de despliegue: ONNX Runtime (CPU o GPU), con el paquete `charm-onnx` instalable desde el repositorio de GitHub; también puede integrarse en cualquier runtime compatible con ONNX.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Tarea | Backbone | Contexto de entrada | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Charm (ONNX) | Estética y calidad de imagen | DINOv2-small/large | Parches multiescala 14x14 | Apache-2.0 | HuggingFace + GitHub |
| NIMA | Calidad estética | CNN (Inception-ResNet) | Imagen completa redimensionada | Código abierto (repositorio original) | Disponible |
| MUSIQ | Calidad de imagen | ViT híbrido multiescala | Resolución nativa multiescala | Apache-2.0 (TensorFlow) | Disponible |
| Q-Align | Calidad y estética | LLaVA-based | Imagen + prompt textual | no disponible en esta ficha | Disponible |

La comparación cuantitativa con estas alternativas no está disponible en la información proporcionada; los datos de rendimiento relativos requerirían una evaluación propia sobre los mismos datasets.

## Limitaciones y advertencias

- La conversión solo implementa la selección de parches `frequency`; otras configuraciones del modelo original no están cubiertas.
- No hay máscara de atención: el batching solo funciona con imágenes que produzcan el mismo número de tokens.
- Las puntuaciones son relativas al dataset de entrenamiento de cada variante; no son directamente comparables entre variantes sin calibración.
- Riesgo de sesgo heredado de los datasets de estética (AVA, AADB, etc.), que sobrerrepresentan ciertos estilos fotográficos y culturas visuales.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta; no hay evidencia de uso en producción ni validación externa.
- Aunque la licencia es Apache-2.0, conviene verificar la licencia de los datasets originales si se redistribuyen los pesos entrenados sobre ellos.
- No apto para tareas fuera de la evaluación de imagen: no procesa texto, audio ni secuencias.

## Enlaces

- HuggingFace: https://huggingface.co/Miosp/charm-onnx
- Modelo base: https://huggingface.co/FatemehBehrad/Charm
- Repositorio del autor original: https://github.com/FBehrad/Charm
- Repositorio de la conversión ONNX: https://github.com/Miosp/charm-onnx
- Paper (CVPR 2025): Behrad, Tuytelaars, Wagemans, "Charm: The Missing Piece in ViT Fine-Tuning for Image Aesthetic Assessment", pp. 7815-7824.
