# MohsinElis/patch-mfft-tampering-checkpoints

## Resumen

Patch-MFFT es un modelo de visión por computador orientado a forensia de imágenes: detección y localización de manipulaciones como *inpainting* generativo, *splicing* (inserción de regiones de otras imágenes) y *style tampering* (alteración de estilo o atributos). Lo desarrollan Mohsin Ibna Hossain, MD. Muttakin y Mohammad Mahmudul Hasan, y el repositorio de Hugging Face lo publica MohsinElis como material experimental asociado al artículo *Patch-MFFT: Dual-Branch Frequency Attention for Generative Inpainting, Composite Blackmail Forgery, and Style Tampering Detection*.

El interés técnico está en el enfoque: un modelo de dos ramas que combina atención en el dominio frecuencial (transformada de Fourier, de ahí la nomenclatura MFFT) con análisis por parches, de forma que no solo emite una decisión global de "imagen manipulada", sino que produce localizaciones a nivel de píxel evaluadas con mIoU. Es relevante ahora porque las técnicas de edición generativa (difusión, inpainting) dejan trazas cada vez menos visibles en el dominio espacial pero a menudo persistentes en el espectral.

El repositorio no es un modelo listo para producción: contiene pesos (last.pt, best.pt), métricas, predicciones y figuras de un experimento concreto, sin model card de uso, sin pipeline declarado y sin código de inferencia listado. Cualquier adopción requiere reconstruir el preprocesado y el *forward pass* a partir del paper o del código del autor.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Red neuronal de dos ramas (dual-branch) con atención en dominio frecuencial (Fourier/MFFT) y análisis por parches; detalles de capas y bloques no disponibles |
| Parámetros totales | no disponible |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible (no aplica: modelo de visión, no procesa secuencias de texto) |
| Tipos de cuantización | no disponible (los pesos publicados son checkpoints PyTorch; no se documentan versiones cuantizadas ni GGUF/ONNX) |
| Idiomas soportados | no disponible (no aplica: la entrada es imagen, no texto) |
| Licencia | MIT |
| Formato de pesos | checkpoints PyTorch `.pt` (`last.pt`, `best.pt`) dentro de `uns/<job_id>/checkpoints/` |

## Arquitectura y entrenamiento

La información disponible describe únicamente un esquema de dos ramas con atención frecuencial aplicada sobre parches de imagen, orientado a tres familias de manipulación: inpainting generativo, *splicing* compuesto (el artículo lo denomina "composite blackmail forgery") y alteración de estilo. La componente frecuencial (MFFT, transformada de Fourier) se usa como señal complementaria al dominio espacial, algo habitual en forensia de imágenes porque las operaciones de edición y las redes generativas alteran la distribución de alta frecuencia, las correlaciones de fase o el espectro local de forma detectable aunque visualmente la imagen sea convincente. El modelo produce, además de la clasificación, mapas de localización evaluados con mIoU a nivel de píxel, según se deduce de la estructura del repositorio (`test_predictions.csv` con "pixel-level mIoU" y matrices de confusión).

No se dispone de datos sobre volumen del conjunto de entrenamiento, composición del dataset, número de épocas, estrategia de aumento de datos, función de pérdida ni si hubo etapas de ajuste fino supervisado con anotaciones a nivel de píxel. Tampoco se documenta si el entrenamiento usó imágenes generadas por modelos de difusión concretos, ni si se aplicaron fases de *curriculum* o *hard negative mining*. La carpeta `coordinator/leases/` sugiere que el autor organizó el entrenamiento como un *swarm* de trabajadores con coordinación de *leases*, pero es un detalle de infraestructura, no del algoritmo.

## Capacidades

- Detección binaria de imagen manipulada frente a imagen auténtica, con métricas de clasificación reportadas en las matrices de confusión del repositorio.
- Localización a nivel de píxel de la región manipulada, evaluada con mIoU (métrica de solapamiento entre máscara predicha y máscara real).
- Detección específica de *inpainting* generativo, es decir, regiones sintetizadas o rellenadas por modelos generativos.
- Detección de *splicing*: regiones copiadas de otra imagen e integradas en la escena.
- Detección de *style tampering*: alteraciones de estilo, color o atributos globales/locales de la imagen.
- Análisis en dominio frecuencial mediante transformada de Fourier aplicada por parches, lo que permite explotar trazas espectrales de la edición.
- Salida de mapas de predicción por imagen exportables a CSV, aptos para *scoring* por región y umbralización posterior.
- No soporta *tool calling*, ni razonamiento multi-paso, ni capacidades multilingües, ni generación de texto: es un modelo discriminativo de visión.

## Casos de uso

- Verificación de integridad en redacción periodística: antes de publicar una imagen recibida de terceros, el modelo genera un mapa de calor de regiones sospechosas que el equipo puede contrastar con la fuente original; el análisis frecuencial ayuda cuando el retoque es sutil y no deja bordes visibles.
- Peritaje forense y fraude documental: en un expediente de seguros o un procedimiento judicial, el modelo actúa como herramienta de apoyo para señalar qué zonas de una fotografía (por ejemplo, daños en un vehículo o un inmueble) presentan indicios de haber sido insertadas o regeneradas, aportando la máscara de localización como evidencia cuantificable (mIoU frente a anotación manual del perito).
- Detección de *deepfakes* y montajes de identidad: en un flujo de verificación de identidad remota, el modelo se sitúa como filtro previo sobre el *selfie* o el documento de identidad subido, marcando regiones faciales o de fondo con trazas de generación antes de pasar al motor de reconocimiento facial.
- Moderación de contenido y abuso: plataformas que reciben imágenes de usuarios pueden usar el modelo como clasificador de cuarentena para imágenes compuestas con fines de extorsión ("composite blackmail forgery"), derivando a revisión humana los casos con alta puntuación en la región detectada.
- Comercio electrónico y catálogo de producto: detección de imágenes de producto manipuladas (añadir accesorios, borrar defectos, sustituir el fondo) en marketplaces donde la fidelidad visual es una promesa al comprador.
- Investigación académica y reproducción: los checkpoints `best.pt` y `last.pt` junto con `metrics.csv` y `test_metrics.json` permiten reproducir la tabla de resultados del paper, hacer ablaciones sobre la rama frecuencial y comparar contra detectores forenses previos.
- Construcción de un *dataset* de entrenamiento para otros detectores: usar las máscaras predichas como preetiquetado débil sobre grandes volúmenes de imágenes y refinarlas con revisión humana, reduciendo el coste de anotación a nivel de píxel.
- *Pipeline* de ingestión en archivo digital o biblioteca: clasificación automática de fondos de imágenes históricas o de prensa para señalar piezas restauradas digitalmente, evitando que una restauración generativa se catalogue como original.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El repositorio incluye ficheros de métricas (`metrics.csv`, `test_metrics.json`, matrices de confusión, `test_predictions.csv` con mIoU a nivel de píxel) y figuras de publicación, pero sus valores no se han incluido en la información proporcionada, por lo que no se reproducen cifras.

## Requisitos de hardware

- VRAM estimada: no disponible de forma confirmada. El repositorio completo ocupa 0,6 GB, lo que acota el orden de magnitud de los pesos a unos cientos de MB, pero ese tamaño incluye además métricas, predicciones y figuras de alta resolución; la cifra real de parámetros no está publicada.
- Estimación orientativa (inferencia a partir del tamaño del repositorio, no confirmada por el autor): si los pesos rondan los 150-300 MB en FP32, el modelo cabría con holgura en GPUs de consumo con 8-12 GB de VRAM, incluso procesando parches a resolución moderada con *batch* pequeño.
- GPU recomendadas: no disponibles. Por el tipo de carga (procesamiento por parches de una CNN/transformer de visión), una RTX 3060/4060 o superior sería suficiente para inferencia interactiva; A100/H100 solo tendrían sentido para evaluar datasets completos en paralelo.
- Cabe en GPU de consumo: probablemente sí, con la salvedad de que la VRAM depende del tamaño de parche y del *batch*, parámetros no documentados.
- Opciones de despliegue: los checkpoints son `.pt`, por lo que el camino natural es PyTorch (`torch.load` + definición del modelo en código propio). No hay pesos GGUF, ONNX ni TensorRT publicados, así que llama.cpp, Ollama, vLLM o TGI no son aplicables sin una conversión previa que el autor no documenta.
- Latencia y *throughput*: no disponibles.

## Comparativa con modelos similares

No se dispone de datos verificados de parámetros, contexto ni rendimiento de alternativas dentro de la información proporcionada, por lo que no se pueden comparar cifras. Cualitativamente, el modelo se sitúa en la categoría de detectores forenses de manipulación localizada con localización a nivel de píxel, donde las familias de referencia habituales son detectores basados en trazas de compresión (CAT-Net), en anomalías de ruido/PRNU (Noiseprint), en *self-correlation* (PSCC-Net) o en fusión de múltiples pistas (TruFor). Frente a ellos, la aportación declarada de Patch-MFFT es una rama dedicada de atención frecuencial sobre parches, con evaluación específica sobre inpainting generativo y *style tampering*.

| Modelo | Tarea | Enfoque declarado | Parámetros | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Patch-MFFT | Detección y localización de inpainting, splicing y style tampering | Doble rama con atención frecuencial (MFFT) por parches | no disponible | MIT | Checkpoints `.pt` en Hugging Face |
| CAT-Net | Localización de manipulación | Artefactos de compresión JPEG y RGB | no disponible | no disponible en esta información | No verificada en esta información |
| Noiseprint | Detección de manipulación | Huella de ruido del sensor | no disponible | no disponible en esta información | No verificada en esta información |
| PSCC-Net | Localización de manipulación | Self-correlation progresiva | no disponible | no disponible en esta información | No verificada en esta información |

## Limitaciones y advertencias

- Repositorio de investigación: no incluye código de inferencia, preprocesado documentado ni model card de uso; hay que reconstruir el *forward pass* y la normalización a partir del paper o del código del autor.
- Sin pipeline declarado en Hugging Face y con 0 descargas y 0 *likes*: no hay evidencia de uso externo ni de validación por terceros.
- Sin datos publicados sobre el conjunto de entrenamiento, no se puede evaluar el sesgo: se desconoce la distribución de géneros fotográficos, resoluciones, compresiones y orígenes (cámaras, móviles, imágenes generadas) cubiertos.
- Riesgo de falsos positivos en imágenes legítimamente retocadas (revelado RAW, filtros de móvil, reducción de ruido, recortes y recomposición). El análisis frecuencial es sensible a la recompresión y al reescalado, que pueden degradar la señal tanto como la manipulación.
- Falsos negativos esperables frente a generadores no representados en el entrenamiento: la detección de inpainting depende de las trazas que deje el modelo generativo concreto.
- Fragilidad ante adversarial: no se documentan evaluaciones de robustez frente a perturbaciones deliberadas, un requisito habitual en forensia real.
- Licencia MIT: permite uso comercial, modificación y redistribución con atribución y sin garantía alguna; no impone restricciones de uso, lo que también implica que el autor no ofrece cláusulas de responsabilidad ni soporte.
- Uso responsable: los resultados no constituyen prueba pericial por sí mismos; deben acompañarse de metodología validada, control de cadena de custodia y revisión por un experto humano.
- Advertencia operativa: al no haber pesos en formatos de despliegue estándar (ONNX, GGUF), integrar el modelo en producción exige trabajo de conversión y de fijado de versiones de PyTorch.

## Enlaces

- Hugging Face: https://huggingface.co/MohsinElis/patch-mfft-tampering-checkpoints
- Estructura interna del repositorio: `uns/<job_id>/checkpoints/` (last.pt, best.pt), `uns/<job_id>/metrics/` (metrics.csv, test_metrics.json, matrices de confusión), `uns/<job_id>/predictions/` (test_predictions.csv con mIoU a nivel de píxel), `uns/<job_id>/figures/` (figuras de publicación), `coordinator/leases/` (coordinador de *leases* del *swarm* de entrenamiento)
- Paper de referencia citado en la model card: *Patch-MFFT: Dual-Branch Frequency Attention for Generative Inpainting, Composite Blackmail Forgery, and Style Tampering Detection* (Mohsin Ibna Hossain, MD. Muttakin, Mohammad Mahmudul Hasan). Enlace al paper: no disponible en la información proporcionada.
- Repositorio de código, demo o blog del autor: no disponible en la información proporcionada.
