# matthieulel/swinv2-large-patch4-window12to16-192to256-22kto1k-ft-galaxy10-decals-full-v2

## Resumen

Swin Transformer V2 es una arquitectura de visión de tipo transformer jerárquico con atención por ventanas desplazadas, desarrollada originalmente por Microsoft Research. Este checkpoint concreto es un ajuste fino completo de `microsoft/swinv2-large-patch4-window12to16-192to256-22kto1k-ft` para clasificación de morfología de galaxias sobre el conjunto Galaxy10 DECaLS, con diez clases de salida. Lo firma el usuario `matthieulel` en el marco de un benchmark más amplio de modelos fundacionales de visión aplicados a datos astronómicos.

El modelo resuelve una tarea acotada: asignar una imagen de galaxia a una de diez categorías morfológicas. Su relevancia no está en la generación de texto ni en capacidades generalistas, sino en servir como referencia reproducible de cómo un backbone preentrenado en ImageNet-22k y afinado en ImageNet-1k se adapta, mediante ajuste fino completo, a un dominio científico con datos limitados (17.736 imágenes). Forma parte de una colección de 80 configuraciones (40 backbones por dos regímenes de adaptación) descrita en el artículo *When foundation models meet astronomical data* (Astronomy and Computing, versión revisada, 2026).

El checkpoint tiene 195.218.302 parámetros, un repositorio de 0,8 GB en safetensors y licencia Apache 2.0. No es un modelo de lenguaje: no procesa texto, no tiene ventana de contexto en tokens ni soporta tool calling. Cualquier uso debe entenderse como clasificador de imágenes de 256x256 píxeles.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Swin Transformer V2 (transformer jerárquico con atención por ventanas desplazadas) |
| Parámetros totales | 195.218.302 |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión; entrada de imagen redimensionada y recortada a 256x256 px) |
| Tipos de cuantización | no disponible (el autor no documenta cuantizaciones; pesos en safetensors) |
| Idiomas soportados | no aplica (clasificación de imágenes; sin capacidades lingüísticas) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería transformers) |

## Arquitectura y entrenamiento

La base es SwinV2-Large con parches de 4x4, ventanas de 12 en preentrenamiento y 16 en ajuste fino, resolución progresiva de 192 a 256 píxeles y preentrenamiento en ImageNet-22k seguido de ajuste en ImageNet-1k. Sobre ese backbone se sustituye la cabeza por una capa lineal única de diez salidas y se realiza ajuste fino completo: se actualizan todos los parámetros, no solo la cabeza. El régimen de adaptación es, por tanto, el más costoso de los dos comparados en el estudio.

El protocolo es idéntico para los 40 backbones del benchmark. Datos: Galaxy10 DECaLS con 17.736 imágenes; el split público de test (1.774 imágenes) se reserva como conjunto de evaluación y el de train se divide de forma estratificada en 14.188 imágenes de entrenamiento y 1.774 de validación, usadas solo para seleccionar época. Optimizador AdamW (betas 0,9/0,999, eps 1e-8, weight decay 0,1, clipping de gradiente 1,0), tasa de aprendizaje 5e-5 con schedule lineal y 10% de warm-up, lotes de 32 con acumulación sobre 8 pasos (lote efectivo 256), 30 épocas, precisión simple fp32 con TF32 desactivado y una sola GPU. Aumento de datos: recorte redimensionado aleatorio a la resolución de entrada y volteo horizontal aleatorio. Evaluación: redimensionado y recorte central a 256x256 px con la normalización del procesador del checkpoint. Se selecciona la época de mínima pérdida de validación (época 13). Software: PyTorch 2.3.0, transformers 4.37.2, datasets 2.19.1, torchvision 0.18.0.

## Capacidades

- Clasificación de imágenes en diez clases de morfología galáctica sobre recortes de 256x256 píxeles.
- Extracción de características visuales mediante el backbone SwinV2-Large, reutilizable para otras tareas de visión con una cabeza nueva.
- Inferencia por lotes con la API estándar de `transformers` (`AutoModelForImageClassification`).
- Integración con `AutoImageProcessor` para el preprocesado de normalización.
- No soporta generación de texto, razonamiento simbólico, código ni matemáticas.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- Sin capacidades multilingües: no procesa lenguaje.
- Sin modo thinking, visión general, audio ni modalidades adicionales.
- Sin decodificación especulativa ni optimizaciones de inferencia documentadas por el autor.

## Casos de uso

- Clasificación morfológica en pipelines astronómicos: el modelo recibe recortes de 256x256 px procedentes de DECaLS y devuelve una de diez clases, lo que permite etiquetar catálogos de imágenes de forma automática y a bajo coste frente a la inspección visual humana.
- Triaje previo a inspección experta: ordenar candidatos por clase predicha y confianza para que los astrónomos revisen primero los casos ambiguos, reduciendo el volumen de imágenes que requieren atención manual.
- Estudio de poblaciones galácticas: agregar predicciones sobre un catálogo completo para estimar distribuciones de morfología por región del cielo o por rango de desplazamiento al rojo, con la precisión de ~85,7% que reporta el autor como cota de referencia.
- Referencia reproducible en investigación de adaptación de dominios: al formar parte de un benchmark de 80 configuraciones con receta fija, sirve para comparar regímenes de ajuste fino (completo frente a parcial) y backbones sobre el mismo conjunto y partición.
- Extracción de embeddings para búsqueda de similitud: usar la salida del backbone como vector de características para recuperar galaxias visualmente parecidas o agrupar morfologías no supervisadas.
- Docencia y divulgación: ejemplo autocontenido y ligero (0,8 GB) de transferencia de aprendizaje desde ImageNet a un dominio científico, ejecutable en una GPU de consumo.
- Validación de calidad de datos: detectar imágenes corruptas, mal recortadas o fuera de distribución a partir de predicciones de baja confianza o patrones anómalos en los logits.

## Benchmarks y rendimiento

Resultados declarados por el autor sobre el split de test de Galaxy10 DECaLS (1.774 imágenes), no verificados de forma independiente:

| Métrica | Valor | Contexto |
|---|---|---|
| Accuracy | 85,85% | seed 42, época 13 de 30 (seleccionada) |
| Weighted F1 | 85,53% | seed 42, época 13 de 30 (seleccionada) |
| Accuracy media | 85,68% ± 0,15 | media ± desviación típica sobre seeds 42, 1 y 2 |
| Weighted F1 medio | 85,48% ± 0,09 | media ± desviación típica sobre seeds 42, 1 y 2 |

El autor documenta además la curva por época: la accuracy de test sube de 69,45% en la época 1 a 85,85% en la época 13, con máximos puntuales de 86,30% en las épocas 18 y 22 y una meseta en torno al 85-86% desde la época 11. La pérdida de validación mínima se alcanza en la época 13 (0,4585) y repunta después, lo que indica sobreajuste moderado en las épocas finales. No se han publicado en la información disponible resultados comparativos frente a otros backbones del mismo benchmark.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: en torno a 0,8-1,0 GB para los pesos (195 M de parámetros) más el espacio de activaciones, que depende del tamaño de lote y de la resolución de entrada.
- VRAM estimada en fp16/bf16: aproximadamente 0,4 GB para los pesos; el autor no documenta versiones cuantizadas.
- GPU recomendadas: cualquier GPU con al menos 2-4 GB de VRAM para inferencia en fp32 con lotes pequeños; una NVIDIA T4, L4, RTX 3060 o superior es suficiente.
- Cabe holgadamente en GPU de consumo: RTX 3060, RTX 4060, RTX 4090 y similares.
- Despliegue: `transformers` con PyTorch es la vía documentada por el autor. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que en su mayoría no aplican a clasificadores de imagen.
- Latencia y throughput: no disponibles en la información proporcionada. El entrenamiento se realizó en una sola GPU en fp32, lo que sugiere que la inferencia es viable en hardware modesto, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parámetros | Tarea | Contexto / entrada | Rendimiento declarado | Licencia |
|---|---|---|---|---|---|
| Este checkpoint (SwinV2-Large, ajuste completo) | 195,2 M | Clasificación de morfología galáctica (10 clases) | Imagen 256x256 px | 85,85% accuracy, 85,53% weighted F1 | Apache 2.0 |
| `microsoft/swinv2-large-patch4-window12to16-192to256-22kto1k-ft` (base) | ~196 M | Clasificación ImageNet-1k (1.000 clases) | Imagen 256x256 px | no disponible en esta ficha | Apache 2.0 |
| Otros backbones del benchmark del autor (40 configuraciones) | no disponible | Clasificación de morfología galáctica (10 clases) | Imagen 256x256 px | no disponible en esta ficha | variable |
| Modelos especializados en morfología galáctica (p. ej. Zoobot, Galaxy Zoo) | no disponible | Clasificación morfológica | Imagen | no disponible en esta ficha | variable |

La comparación cuantitativa con alternativas del mismo benchmark no puede completarse porque la información proporcionada solo incluye los resultados de este checkpoint. El propio autor publica las métricas por época de las 80 configuraciones en el dataset `vision-foundation-models-benchmark-runs`, que sería la fuente adecuada para una comparativa rigurosa.

## Limitaciones y advertencias

- Modelo de visión sin capacidades de lenguaje: no admite prompts de texto, tool calling ni razonamiento multi-paso. Cualquier expectativa de ese tipo es un error de uso.
- Dominio muy restringido: entrenado exclusivamente sobre Galaxy10 DECaLS; el rendimiento fuera de esa distribución (otros telescopios, otras bandas, otras resoluciones o morfologías no representadas) no está caracterizado.
- Riesgo de sobreajuste: la pérdida de validación mínima está en la época 13 y aumenta hasta la 30, con accuracy de test en meseta; el checkpoint seleccionado es el de mínima pérdida de validación, no el de mejor test.
- Métricas no verificadas: los valores de accuracy y F1 los declara el autor (`verified: false`) y no han sido replicados de forma independiente en la información disponible.
- Sesgos de dataset: Galaxy10 DECaLS hereda los sesgos de selección y etiquetado de Galaxy Zoo; las clases minoritarias pueden tener peor recall, algo que la accuracy agregada y el F1 ponderado no reflejan por clase.
- Calibración de confianza no documentada: no se reportan curvas de calibración ni matrices de confusión, por lo que el uso de la probabilidad predicha como umbral de decisión requiere validación propia.
- Dependencia del preprocesado: el autor especifica redimensionado y recorte central a 256x256 px con la normalización del procesador; desviarse de esa receta puede degradar el rendimiento.
- Licencia Apache 2.0: permite uso comercial y modificación con atribución, pero no exime de las obligaciones de citación académica del artículo asociado.
- Integridad comprobada solo parcialmente: el autor verificó que las predicciones coinciden con los logits guardados en las primeras 96 imágenes de test (100% de coincidencia, diferencia absoluta máxima de 1,14e-05); no es una validación externa.
- Sin cifras de latencia ni throughput publicadas, lo que impide dimensionar despliegues en producción sin medición propia.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/matthieulel/swinv2-large-patch4-window12to16-192to256-22kto1k-ft-galaxy10-decals-full-v2
- Modelo base: https://huggingface.co/microsoft/swinv2-large-patch4-window12to16-192to256-22kto1k-ft
- Dataset Galaxy10 DECaLS: https://huggingface.co/datasets/matthieulel/galaxy10_decals
- Dataset de ejecuciones del benchmark: https://huggingface.co/datasets/matthieulel/vision-foundation-models-benchmark-runs
- Colección Vision Foundation Models Benchmark: https://huggingface.co/collections/matthieulel/vision-foundation-models-benchmark-6ae4ae6c3f83b52cf00d9dcb
- Artículo asociado: *When foundation models meet astronomical data*, Astronomy and Computing, versión revisada, 2026 (citación pendiente de publicación; no se dispone de enlace)
