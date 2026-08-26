# BUEORM/TBV-512-FLUX50K

## Resumen

TBV-512 (T-Bidirectional Vision) es un autoencoder bidireccional desarrollado por BUEORM (Bueorm LLC) que emplea una única transformación diferenciable T(x, d) para realizar tanto la codificación (compresión) como la decodificación (reconstrucción) de imágenes, compartiendo todos los pesos internos entre ambas direcciones. A diferencia de los autoencoders clásicos que requieren dos redes asimétricas (encoder y decoder), TBV utiliza los mismos bloques residuales convolucionales modulados por una dirección aprendida (+1 para codificar, -1 para decodificar). El checkpoint aquí presentado ha sido entrenado sobre el dataset sintético `russwang/flux-50k` (50.000 imágenes de alta resolución) a 512×512 píxeles.

El modelo tiene aproximadamente 1,32 millones de parámetros, lo que lo convierte en una arquitectura extremadamente ligera. Su factor de compresión espacial es de 24×, reduciendo una imagen RGB de 512×512 a un tensor latente de 128 canales en una rejilla de 16×16. Está diseñado para extracción de características visuales y reconstrucción de imágenes, con un entrenamiento por fases que incluye una segunda etapa de robustez frente a perturbaciones espaciales y de color. Su licencia MIT y su pequeño tamaño lo hacen accesible para experimentación en entornos con recursos limitados.

La relevancia de este modelo radica en su propuesta arquitectónica: compartir pesos entre codificación y decodificación podría reducir drásticamente el número de parámetros en sistemas de compresión neural y representación de imágenes, abriendo la puerta a aplicaciones eficientes en dispositivos edge. Sin embargo, al ser un checkpoint inicial (Fase 1 y 2) entrenado en un dataset sintético, su rendimiento en imágenes naturales reales aún no ha sido validado públicamente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Autoencoder bidireccional con transformación única compartida (T-Bidirectional Vision, TBV) |
| Parametros totales | 1.316.675 (~1,32 M) |
| Parametros activos | No aplica (modelo denso, no es MoE) |
| Longitud de contexto | No aplica (modelo de visión, no procesa texto) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | en, es (según la model card, aunque es un modelo visual) |
| Licencia | MIT |
| Formato de pesos | Checkpoint de PyTorch (.pt), no se menciona safetensors |

## Arquitectura y entrenamiento

La arquitectura TBV se basa en una única función diferenciable T(x, d) donde d es un embedding de dirección aprendido (+1 para codificación, -1 para decodificación). La entrada (imagen 3×512×512) pasa por una proyección por parches (PatchProj) con convoluciones no solapadas de 32×32, que la transforma en una rejilla espacial de 16×16. Sobre esta representación actúan 6 bloques residuales convolucionales compartidos (T-Blocks), modulados por el embedding de dirección. En la dirección inversa, el tensor latente (128×16×16) atraviesa los mismos bloques y una deproyección de parches (PatchDeproj) para reconstruir la imagen original. El factor de compresión espacial es de 24× (3×512×512 / 128×16×16).

El entrenamiento se realizó en dos fases sobre el dataset sintético `russwang/flux-50k` (50.000 imágenes). La Fase 1 se centró en la reconstrucción autoencoder pura, utilizando pérdida MSE más una regularización coseno de alineación latente. La Fase 2 añadió robustez ante perturbaciones sutiles (escala 95–100%, rotación ≤4°, jitter de color ≤5%) para lograr invariancia latente. Se usó el optimizador AdamW (lr=5e-4, weight_decay=1e-4) con programación lineal y precisión mixta AMP. La pérdida MSE final de la Fase 1 fue de 0,00625 (promedio ~0,01089). No se menciona el uso de RLHF, DPO ni otros métodos de alineación, al tratarse de un modelo de visión.

## Capacidades

- Codificación de imágenes RGB de 512×512 en un tensor latente compacto de 128×16×16 (256 tokens), con factor de compresión 24×.
- Decodificación del tensor latente para reconstruir la imagen original con pérdida MSE baja (0,00625 en el conjunto de entrenamiento).
- Extracción de características visuales mediante la representación latente, utilizable como entrada para otras tareas (clasificación, detección, etc.).
- Robustez ante pequeñas perturbaciones espaciales (rotación ≤4°, escala 95–100%) y de color (jitter ≤5%), gracias a la Fase 2 de entrenamiento.
- Bidireccionalidad con pesos compartidos: una sola red sirve para codificar y decodificar, reduciendo el número de parámetros frente a autoencoders tradicionales.
- No soporta generación de texto, tool calling, agentes ni razonamiento multi-paso; es exclusivamente un modelo de representación y reconstrucción visual.

## Casos de uso

- Compresión de imágenes en dispositivos edge: al tener solo 1,32 M de parámetros, el modelo puede ejecutarse en hardware con recursos limitados (Raspberry Pi, móviles) para comprimir imágenes a un factor 24× y reconstruirlas localmente, útil en aplicaciones de telemetría o almacenamiento eficiente.
- Preentrenamiento de representaciones visuales: el tensor latente de 128×16×16 puede servir como entrada para clasificadores ligeros o modelos de visión por computadora, reduciendo la dimensionalidad de las imágenes antes de procesarlas con redes más grandes.
- Filtrado o deduplicación de imágenes: al reconstruir y comparar la similitud entre la entrada y la salida, se puede detectar si una imagen está corrupta o es redundante en un pipeline de datos.
- Aumento de datos con invariancia: la robustez a perturbaciones aprendida en Fase 2 permite generar representaciones estables ante pequeñas variaciones, útil para entrenar modelos de seguimiento o registro de imágenes.
- Investigación en arquitecturas eficientes: sirve como banco de pruebas para estudiar el impacto de compartir pesos entre encoder y decoder en calidad de reconstrucción, comparándolo con autoencoders clásicos de tamaño similar.
- Prototipado rápido de sistemas de reconstrucción: su carga y ejecución en pocas líneas de código (como se muestra en la documentación) lo hace adecuado para validar conceptos de compresión neural sin necesidad de infraestructura pesada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La única métrica reportada es la pérdida MSE de entrenamiento (0,00625 final en Fase 1, promedio 0,01089) y la robustez cualitativa ante perturbaciones en Fase 2. No hay comparaciones con otros modelos en tareas estándar como ImageNet, CIFAR o similares.

## Requisitos de hardware

- VRAM estimada para inferencia: con 1,32 M de parámetros, el modelo ocupa aproximadamente 5,3 MB en float32 y ~2,6 MB en float16. La inferencia sobre una imagen 512×512 requiere memoria adicional para los tensores intermedios, estimable en menos de 100 MB en total. Cabe en cualquier GPU, incluso integradas, y en CPU.
- GPU recomendadas: cualquier GPU con al menos 1 GB de VRAM es suficiente; una NVIDIA GTX 1050 o superior, o incluso una GPU integrada (Intel UHD, AMD Vega) puede ejecutarlo sin problemas.
- Compatibilidad con consumer GPU: sí, absolutamente. Es uno de los modelos de visión más ligeros que se pueden encontrar.
- Opciones de despliegue: al ser un checkpoint de PyTorch, se puede cargar directamente con el código proporcionado. No se menciona soporte para vLLM, llama.cpp, Ollama ni TGI, que están orientados a modelos de lenguaje. Para despliegue en producción, se podría exportar a ONNX o TorchScript, aunque no está documentado.
- Latencia y throughput: no se proporcionan datos. Dado el tamaño, se espera una latencia de milisegundos en GPU y de decenas de milisegundos en CPU para una imagen 512×512.

## Comparativa con modelos similares

No se dispone de información sobre modelos directamente comparables en la documentación proporcionada. Como referencia genérica, los autoencoders convolucionales clásicos (por ejemplo, un VAE con encoder y decoder separados) suelen tener más parámetros y no comparten pesos. Modelos como ViT-VAE o Masked Autoencoders (MAE) operan con arquitecturas transformer y tamaños mucho mayores. Sin embargo, no hay datos de rendimiento público que permitan una comparación cuantitativa con TBV-512. Por tanto, la comparativa se considera no disponible.

## Limitaciones y advertencias

- Sesgos conocidos: el modelo fue entrenado exclusivamente con imágenes sintéticas del dataset `russwang/flux-50k`, que pueden no representar la distribución de imágenes naturales reales. Su rendimiento en fotografías reales no ha sido evaluado y podría ser deficiente.
- Riesgo de alucinación: al ser un autoencoder, no genera contenido nuevo, pero puede producir reconstrucciones inexactas o "inventar" detalles en regiones ambiguas, especialmente si la imagen de entrada difiere del dominio de entrenamiento.
- Limitaciones de contexto e idioma: no procesa texto ni tiene capacidades lingüísticas; la etiqueta de idiomas en la model card es meramente informativa.
- Restricciones de licencia: licencia MIT, permite uso comercial sin restricciones, pero el autor no ofrece garantías sobre el rendimiento en producción.
- Caveat importante: el modelo está en una fase experimental (checkpoint de Fase 1 y 2). No se han publicado evaluaciones en tareas downstream ni comparaciones con otros métodos de compresión. No se recomienda su uso en aplicaciones críticas sin una validación exhaustiva.
- Tamaño del repositorio: 0.0 GB en HuggingFace, lo que sugiere que el checkpoint es muy ligero, pero también que no se incluyen pesos en formatos alternativos (safetensors, ONNX).

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/BUEORM/TBV-512-FLUX50K
- Dataset de entrenamiento: https://huggingface.co/datasets/russwang/flux-50k
- Repositorio del código TBV (mencionado en la instalación): https://github.com/bueormnew/TBV.git
- Organización del autor en HuggingFace: https://huggingface.co/BueormLLC
- GitHub del autor: https://github.com/BueormLLC
