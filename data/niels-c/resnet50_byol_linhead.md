# niels-c/resnet50_byol_linhead

## Resumen

`niels-c/resnet50_byol_linhead` es un clasificador de imágenes basado en una ResNet-50 preentrenada de forma auto-supervisada con BYOL (Bootstrap Your Own Latent) sobre ImageNet-1k, a la que se ha añadido una cabeza lineal de 1000 clases entrenada mediante linear probe sobre el backbone congelado. Lo desarrolla Niels Thiemann (usuario `niels-c`) a partir de los pesos de `yaox12/BYOL-PyTorch`, una reimplementación del trabajo de Grill et al. (2020). El modelo no busca competir en precisión de clasificación, sino servir como artefacto reproducible para evaluar la similitud entre representaciones de redes neuronales y el sistema visual de primates.

Su propósito principal es ser un plugin de Brain-Score, la plataforma de referencia para comparar modelos de visión artificial con datos neurales y conductuales del cerebro (áreas V1, V2, V4 e IT). La cabeza lineal aporta los logits de 1000 clases que exigen los benchmarks conductuales de Brain-Score, mientras que el backbone congelado permite extraer activaciones por capa. Forma parte del proyecto `neuro-jepas`, que compara arquitecturas predictivas conjuntas (JEPA) y otros modelos auto-supervisados por su parecido con la corteza visual.

Arquitectónicamente es una CNN clásica: ResNet-50 con 25,5 millones de parámetros totales (23,5 M de backbone y 2,05 M de cabeza), entrada de 224 × 224 RGB y salida de 1000 logits. No es un modelo generativo ni un LLM: no procesa texto, no tiene ventana de contexto y no soporta tool calling. Su interés es científico y de investigación en neurociencia computacional, no de producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ResNet-50 (CNN con conexiones residuales) preentrenada con BYOL; cabeza lineal sobre pooling global (2048 dim) |
| Parametros totales | 25.557.032 (backbone 23.508.032 + cabeza 2.049.000) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión, sin contexto textual) |
| Tipos de cuantizacion | no disponible (solo se publican pesos en safetensors, presumiblemente fp32/bf16) |
| Idiomas soportados | no aplica (clasificación de imágenes ImageNet-1k) |
| Licencia | MIT (los pesos del backbone quedan además sujetos a la licencia de su repositorio de origen) |
| Formato de pesos | safetensors (`resnet50_byol_linhead.safetensors`, 103 MB) |

## Arquitectura y entrenamiento

El backbone es una ResNet-50 estándar de torchvision, entrenada de forma auto-supervisada con BYOL sobre ImageNet-1k. BYOL aprende representaciones sin etiquetas mediante dos redes (online y target) que predicen la representación de una vista aumentada de la misma imagen a partir de otra vista, evitando el colapso sin necesidad de pares negativos. Los pesos del backbone proceden de `yaox12/BYOL-PyTorch` y se mantuvieron congelados, incluidas las estadísticas de batch normalization.

Sobre la salida globalmente promediada de la última etapa (2048 dimensiones) se entrenó una única capa lineal de 1000 clases con pérdida de entropía cruzada, sin label smoothing. El entrenamiento usó el split de train de ImageNet-1k (1.281.167 imágenes, 1000 clases), 10 épocas (12.510 pasos), batch size 1024, AdamW (betas 0,9/0,999, weight decay 0), learning rate pico de 1e-3 tras un warmup lineal de una época con decaimiento coseno hasta 1e-6, precisión mixta bf16 y semilla 0. El preprocesado de entrenamiento aplica random resized crop a 224 × 224 (escala 0,3–1,0), flip horizontal aleatorio y normalización con media (0,485, 0,456, 0,406) y desviación (0,229, 0,224, 0,225).

La innovación relevante no está en la arquitectura, sino en el empaquetado: el checkpoint se publica con la configuración exacta que espera el plugin `resnet50_byol_linhead` de `neuro-jepas-submissions`, que fija la revisión del modelo para garantizar reproducibilidad en Brain-Score.

## Capacidades

- Clasificación de imágenes en las 1000 clases de ImageNet-1k a partir de imágenes RGB de 224 × 224.
- Extracción de activaciones intermedias por capa del backbone ResNet-50 para análisis de representaciones (comparación con datos neurales de V1, V2, V4 e IT).
- Evaluación conductual y neural en Brain-Score como plugin oficial (`resnet50_byol_linhead`).
- Baseline de comparación con el modelo no entrenado de la misma arquitectura (`resnet50_untrained_linhead`) para aislar el efecto del preentrenamiento BYOL.
- No soporta tool calling, function calling ni agentes.
- No soporta generación de texto, razonamiento, código, matemáticas, visión-lenguaje, audio ni modo thinking.
- No tiene capacidades multilingües (no procesa lenguaje).

## Casos de uso

- Investigación en neurociencia computacional: cargar el modelo con `brainscore_vision.load_model("resnet50_byol_linhead")` y obtener puntuaciones de similitud con respuestas neurales de áreas visuales de primates, comparándolas con las de otros modelos auto-supervisados del proyecto `neuro-jepas`.
- Estudio de representaciones auto-supervisadas: extraer activaciones de capas intermedias del backbone congelado para analizar qué información codifica BYOL en cada etapa y contrastarla con arquitecturas JEPA.
- Baseline en experimentos de linear probing: usar la cabeza lineal como referencia de lo que se puede extraer de las features BYOL sin ajuste fino, y comparar con cabezas entrenadas sobre otros backbones.
- Prototipado rápido de clasificación de imágenes en investigación: cargar el checkpoint con torchvision y clasificar imágenes de dominio cercano a ImageNet para tareas exploratorias o de sanity check en pipelines de visión.
- Docencia y divulgación: ejemplo reproducible de auto-supervisión (BYOL) y de evaluación mediante linear probe, con código mínimo y licencia permisiva.
- Reproducibilidad de benchmarks: fijar la revisión del checkpoint en el plugin de Brain-Score para replicar resultados publicados en el contexto de `neuro-jepas-submissions`.
- Comparación de arquitecturas en ciencia cognitiva computacional: emplear el modelo junto con su contrapartida no entrenada para medir cuánto de la similitud con el cerebro aporta el aprendizaje auto-supervisado frente a la arquitectura por sí sola.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no reporta métricas de precisión top-1/top-5 en ImageNet-1k ni puntuaciones numéricas de Brain-Score; solo indica que el modelo se evalúa como plugin en dicha plataforma y que su precisión es inferior a la de un modelo con fine-tuning completo, al tratarse de una sonda lineal sobre un backbone congelado.

## Requisitos de hardware

- VRAM estimada para inferencia: muy baja; el checkpoint ocupa 103 MB y el modelo tiene 25,5 M de parámetros. En fp32 serían aproximadamente 100 MB de pesos, con un pico de memoria de unos pocos cientos de MB incluyendo activaciones para batch pequeño.
- GPU recomendadas: cualquier GPU moderna sirve; no requiere A100 ni H100. Una RTX 4090, RTX 3090, RTX 2080 Ti o incluso una GTX 1660 son más que suficientes.
- Cabe en GPU de consumo: sí, en prácticamente cualquier GPU consumer con al menos 2 GB de VRAM; también funciona en CPU para inferencia puntual.
- Opciones de despliegue: PyTorch + torchvision (vía `load_file` de safetensors, como muestra la model card), Brain-Score (`brainscore_vision`), y exportación a ONNX o TorchScript si se necesita servir en producción. No hay soporte nativo documentado para vLLM, llama.cpp, Ollama ni TGI, que están orientados a modelos de lenguaje.
- Latencia y throughput estimados: no disponibles en la información proporcionada. Por el tamaño del modelo, en una GPU moderna se espera un throughput alto con batch grande, pero no se aportan cifras medidas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / entrada | Preentrenamiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `niels-c/resnet50_byol_linhead` | 25,5 M | 224 × 224 RGB | BYOL auto-supervisado + linear probe | MIT | Hugging Face + plugin Brain-Score |
| `niels-c/resnet50_untrained_linhead` | 25,5 M (misma arquitectura) | 224 × 224 RGB | Sin preentrenamiento (baseline) | MIT | Hugging Face |
| ResNet-50 supervisada (torchvision) | 25,6 M | 224 × 224 RGB | Supervisado en ImageNet-1k | BSD-3-Clause (torchvision) | torchvision |
| `yaox12/BYOL-PyTorch` (backbone) | 23,5 M (backbone) | 224 × 224 RGB | BYOL auto-supervisado, sin cabeza | Según repositorio de origen | GitHub |

La comparación relevante es frente al baseline no entrenado del mismo autor, que la propia model card recomienda usar como referencia en Brain-Score, y frente a la ResNet-50 supervisada de torchvision, que suele obtener mayor precisión en ImageNet-1k pero no está pensada para comparaciones neurocientíficas. No se dispone de cifras de rendimiento comparadas en la información proporcionada.

## Limitaciones y advertencias

- Hereda los sesgos de ImageNet-1k: selección de clases, sesgo geográfico y demográfico de las fotos y ruido en las etiquetas.
- Solo se entrenó la cabeza lineal; el backbone no se adaptó a la clasificación, por lo que la precisión es inferior a la de un modelo con fine-tuning.
- Riesgo de alucinación no aplica en el sentido de los LLM, pero sí de clasificaciones erróneas o poco calibradas fuera de la distribución de ImageNet-1k.
- No apto para producción ni para decisiones de seguridad crítica: la cabeza es una sonda lineal sin ajuste de robustez ni calibración.
- Rendimiento degradado en imágenes alejadas de ImageNet-1k (médicas, satelitales, sintéticas) y para etiquetas fuera de las 1000 clases.
- No debe usarse para tomar decisiones sobre personas; las clases de ImageNet-1k no están diseñadas para describir personas.
- Discrepancia de preprocesado: la sonda se evaluó con resize a 256 y center crop a 224, mientras que Brain-Score redimensiona la imagen completa a 224 × 224, lo que altera la relación de aspecto y puede afectar a las puntuaciones.
- Licencia MIT para el empaquetado, pero los pesos del backbone quedan sujetos además a la licencia de `yaox12/BYOL-PyTorch`; conviene revisarla antes de uso comercial.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y fue creado en octubre de 2026; no hay evidencia de adopción ni de validación externa más allá del propio proyecto.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/niels-c/resnet50_byol_linhead
- Baseline no entrenado: https://huggingface.co/niels-c/resnet50_untrained_linhead
- Paper de BYOL (Grill et al., 2020): https://arxiv.org/abs/2006.07733
- Repositorio del backbone BYOL-PyTorch: https://github.com/yaox12/BYOL-PyTorch
- Plugin de Brain-Score (neuro-jepas-submissions): https://github.com/niels-c/neuro-jepas-submissions/tree/main/models/resnet50_byol_linhead
- Código de entrenamiento (neuro-jepas): https://github.com/niels-c/neuro-jepas
- Brain-Score Vision: https://www.brain-score.org/vision/
- Dataset ImageNet-1k en Hugging Face: https://huggingface.co/datasets/ILSVRC/imagenet-1k
