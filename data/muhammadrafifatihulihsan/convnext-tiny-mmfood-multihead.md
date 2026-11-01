# muhammadrafifatihulihsan/convnext-tiny-mmfood-multihead

## Resumen

ConvNeXt-Tiny MMFood Multihead es un modelo de visión por computador desarrollado por muhammadrafifatihulihsan que aborda una tarea de comprensión alimentaria a partir de una única imagen. Sobre un backbone ConvNeXt-Tiny preentrenado en ImageNet-224, el autor añade cuatro cabezas de clasificación y regresión que predicen simultáneamente el tipo de alimento (5 clases), el nombre del plato (50 clases), el método de cocción (11 clases) y cuatro valores nutricionales (calorías, proteínas, grasas e hidratos de carbono). El modelo tiene 28.068.774 parámetros y un peso principal de 112,3 MB en safetensors.

El modelo se entrena sobre un subconjunto del dataset Humanbased-AI/MM-Food-100K, con 28.798 imágenes de entrenamiento, 3.600 de validación y 3.600 de test. Es un experimento de investigación orientado a la evaluación personal, no un servicio de nutrición en producción ni un dispositivo médico. Su relevancia radica en demostrar que un backbone compacto de visión puede resolver múltiples tareas de comprensión alimentaria de forma conjunta, con métricas de error nutricional claramente inferiores a las líneas base triviales.

La licencia es restrictiva: `mmfood-personal-evaluation-only`, que limita el uso a evaluación personal no comercial de las contribuciones del autor. El modelo requiere código personalizado (`trust_remote_code=True`) y no garantiza compatibilidad con el pipeline genérico de clasificación de imágenes de Transformers.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | ConvNeXt-Tiny (backbone) con cuatro cabezas multi-tarea |
| Parámetros totales | 28.068.774 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión; entrada 224 x 224 RGB) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible (modelo de visión, sin componente textual) |
| Licencia | mmfood-personal-evaluation-only (uso personal no comercial) |
| Formato de pesos | safetensors (model.safetensors, 112,3 MB) |
| Modelo base | facebook/convnext-tiny-224 |
| Entrada | imagen RGB 224 x 224 tras preprocesado |
| Clases por cabeza | 5 (tipo de alimento) / 50 (plato) / 11 (cocción) |
| Salidas nutricionales | calorías (kcal), proteínas (g), grasas (g), hidratos de carbono (g) |
| Dataset | Humanbased-AI/MM-Food-100K |
| Tamaño del repo | 0,2 GB |

## Arquitectura y entrenamiento

El modelo parte de `facebook/convnext-tiny-224`, un backbone convolucional de tipo ConvNeXt preentrenado en ImageNet. Sobre las características extraídas por el backbone se añaden cuatro cabezas: tres de clasificación (tipo de alimento, nombre del plato y método de cocción) y una de regresión con cuatro salidas nutricionales. La predicción nutricional se decodifica desde un espacio estandarizado `log1p`, se recorta a valores no negativos y se redondea a un decimal; las etiquetas de baja granularidad (`nutrition_pred`) permanecen en espacio log estandarizado.

El entrenamiento se realizó sobre el subconjunto del dataset MM-Food-100K con 28.798 imágenes de entrenamiento, 3.600 de validación y 3.600 de test, con 6 épocas registradas. No se documenta en la información disponible el número total de tokens (no aplica al ser visión), la composición detallada del dataset ni si hubo fases de ajuste fino con RLHF o DPO. El preprocesado histórico emplea `Resize(255)`, `CenterCrop(224)` y normalización ImageNet con muestreo bilineal; el procesador exportado conserva muestreo bicúbico y `crop_pct=0.875`, por lo que las métricas históricas no son directamente extrapolables entre ambas rutas de preprocesado.

## Capacidades

- Clasificación de tipo de alimento en 5 categorías con puntuaciones softmax top-k.
- Clasificación de nombre de plato en un vocabulario fijo de 50 clases.
- Clasificación de método de cocción en 11 clases normalizadas.
- Regresión de cuatro valores nutricionales: calorías (kcal), proteínas (g), grasas (g) e hidratos de carbono (g).
- Predicción multi-tarea en una sola pasada de inferencia sobre una imagen RGB de 224 x 224.
- Salida estructurada por imagen en forma de diccionario con pares etiqueta/puntuación para las cabezas de clasificación y valores numéricos para nutrición.
- Inferencia en CPU documentada y probada (Python 3.10, Windows), además de soporte para CUDA moviendo modelo y entrada al mismo dispositivo.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multilingües: es un modelo puramente visual.
- No dispone de modo thinking, visión adicional, audio ni generación de texto.

## Casos de uso

- Registro dietético asistido: el modelo puede etiquetar una foto de un plato con tipo de alimento, nombre aproximado y método de cocción, y estimar calorías y macronutrientes para que el usuario revise y corrija el registro en una aplicación de seguimiento nutricional.
- Evaluación de investigación en visión alimentaria: sirve como línea base reproducible para experimentos de clasificación multi-tarea sobre MM-Food-100K, con métricas de referencia publicadas (77,92 % en tipo de alimento, 95,68 kcal de MAE en calorías).
- Prototipado de aplicaciones de cocina: integrado en una app móvil o web, permite sugerir categorías de plato y métodos de cocción a partir de una imagen para filtrar recetas o contenido culinario.
- Análisis de menús y catálogos: procesamiento por lotes de imágenes de platos para poblar bases de datos con etiquetas de tipo, plato y cocción, con revisión humana posterior dado el carácter experimental del modelo.
- Educación y demostraciones técnicas: ejemplo didáctico de arquitectura multi-cabeza sobre un backbone ConvNeXt, útil en cursos de visión por computador y aprendizaje multitarea.
- Investigación sobre estimación nutricional a partir de imagen: el modelo permite comparar el error de regresión nutricional frente a líneas base triviales (190,06 kcal de MAE en calorías) y estudiar el efecto de distintas rutas de preprocesado.
- Filtrado y moderación de contenido gastronómico: clasificación rápida de imágenes en plataformas de recetas para organizar por tipo de alimento o método de cocción, siempre con validación humana.

## Benchmarks y rendimiento

| Tarea | Resultado en test | Cobertura / línea base |
|---|---:|---|
| Tipo de alimento | 77,92 % de accuracy | 3.600 imágenes |
| Plato | 79,21 % de accuracy | 856 imágenes con etiqueta top-50 (23,78 % del test) |
| Cocción | 65,50 % de accuracy | 3.600 imágenes |
| Calorías | 95,68 kcal MAE | Línea base 190,06 kcal |
| Proteínas | 6,28 g MAE | Línea base 14,08 g |
| Grasas | 5,23 g MAE | Línea base 10,56 g |
| Hidratos de carbono | 13,26 g MAE | Línea base 23,47 g |

Estas métricas son resultados guardados de la ejecución de entrenamiento, no una reevaluación independiente. La accuracy de plato cubre solo el 23,78 % de los ejemplos de test. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible, ya que no aplican a un modelo de visión.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en FP32 para los 28,07 M de parámetros y el peso de 112,3 MB; no se documentan requisitos específicos de memoria.
- GPU recomendadas: cualquier GPU con al menos 1-2 GB de memoria; el modelo cabe holgadamente en GTX 1650, RTX 3060, RTX 4090, A100 y H100.
- Cabe en GPU de consumo: sí, en prácticamente cualquier GPU de consumo moderna e incluso en CPU.
- Opciones de despliegue: `transformers` con `AutoModel.from_pretrained(..., trust_remote_code=True)`, `torch` y `torchvision`; no se documenta soporte para vLLM, llama.cpp, Ollama o TGI (herramientas orientadas a modelos de lenguaje).
- Latencia y throughput: no se reclama ningún benchmark de latencia o memoria en la información disponible. El autor indica que la inferencia en CPU está probada en Python 3.10 sobre Windows.

## Comparativa con modelos similares

| Modelo | Parámetros | Tarea | Contexto / entrada | Licencia | Disponibilidad |
|---|---:|---|---|---|---|
| ConvNeXt-Tiny MMFood Multihead | 28,07 M | Clasificación y regresión alimentaria multi-tarea | Imagen 224 x 224 | Personal no comercial | HuggingFace |
| facebook/convnext-tiny-224 | ~28 M | Clasificación ImageNet (1.000 clases) | Imagen 224 x 224 | MIT (según el modelo base) | HuggingFace |
| Otros modelos de reconocimiento alimentario | no disponible | Clasificación de alimentos | no disponible | no disponible | no disponible |

No se dispone en la información proporcionada de otros modelos comparables de reconocimiento alimentario multi-tarea con métricas publicadas para establecer una comparación cuantitativa. El modelo base ConvNeXt-Tiny es el referente arquitectónico directo, pero no resuelve la tarea nutricional ni la clasificación de platos y métodos de cocción.

## Limitaciones y advertencias

- Modelo experimental: no es un servicio de nutrición en producción, ni un dispositivo médico, ni un sistema calibrado de medición de porciones.
- Las puntuaciones softmax no son certeza calibrada; el modelo no rechaza platos desconocidos y siempre elige etiquetas de su vocabulario fijo.
- La estimación nutricional no está expresada explícitamente por 100 g y depende del preprocesado y de la imagen; el error puede ser elevado en platos ambiguos o con porciones difíciles de estimar.
- La accuracy de plato (79,21 %) solo se evalúa sobre el 23,78 % de los ejemplos de test con etiqueta top-50, por lo que no representa el rendimiento global en nombres de platos.
- Las métricas históricas usan un preprocesado bilineal con `Resize(255)` y `CenterCrop(224)`, mientras que el procesador exportado usa bicúbico y `crop_pct=0.875`; los resultados no son directamente comparables entre rutas.
- Requiere `trust_remote_code=True` y revisión del código `modeling_mmfood.py` antes de su ejecución; no garantiza compatibilidad con el pipeline genérico de clasificación de imágenes.
- Licencia `mmfood-personal-evaluation-only`: restringe el uso a evaluación personal no comercial de las contribuciones del autor; el acceso público no convierte el modelo en open source.
- No se documentan sesgos conocidos, riesgos de alucinación textual (no genera texto) ni limitaciones idiomáticas, ya que no procesa lenguaje.
- No se han publicado benchmarks de latencia, memoria ni throughput, lo que dificulta planificar despliegues en producción.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/muhammadrafifatihulihsan/convnext-tiny-mmfood-multihead
- Repositorio GitHub con código y notebooks: https://github.com/muhammadrafifatihulihsan/convnext-tiny-mmfood-multihead
- Modelo base: https://huggingface.co/facebook/convnext-tiny-224
- Dataset: https://huggingface.co/datasets/Humanbased-AI/MM-Food-100K
- Paper de ConvNeXt (arXiv:2201.03545): https://arxiv.org/abs/2201.03545
- Paper de MM-Food (arXiv:2508.10429): https://arxiv.org/abs/2508.10429
- Guía de uso del autor: docs/usage.md (dentro del repositorio)
