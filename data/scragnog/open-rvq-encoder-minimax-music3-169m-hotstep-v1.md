# scragnog/open-rvq-encoder-minimax-music3-169m-hotstep-v1

## Resumen

`scragnog/open-rvq-encoder-minimax-music3-169m-hotstep-v1` es un encoder RVQ de audio de 169 millones de parámetros, derivado del modelo base `Mothersuperior/open-rvq-encoder-minimax-music3-169m-pooled-v4` y alineado con la familia MiniMax Music3. Su función es transformar audio en códigos residuales vectoriales (RVQ) que sirven como entrada para los modelos de difusión y autoregresivos de MiniMax Music3, es decir, actúa como tokenizador de audio. El autor del modelo, `scragnog`, lo publica con un objetivo de destilación suave (soft-distillation) frente al profesor oficial, más una calibración de logits por cabezas que hace que las probabilidades del modelo sean interpretables sin cambios en el orden de argmax.

El modelo resuelve un problema concreto en la línea de los encoders RVQ abiertos para MiniMax Music3: los encoders previos de la comunidad generaban códigos que se desviaban del comportamiento del encoder oficial, lo que degradaba la calidad de la generación de música. Este lanzamiento introduce dos correcciones metodológicas (el desajuste de la línea temporal del corpus y el desbordamiento de los IDs semánticos) y una regularización por destilación que mejora la consistencia de los códigos exportados frente a grabaciones reales, no solo frente al corpus sintético. El resultado es un modelo de 169 millones de parámetros con una arquitectura idéntica al base, disponible como reemplazo directo (drop-in) para los nodos de ComfyUI y difusores existentes.

La licencia es `minimax-music3-terms`, heredada del modelo oficial de MiniMax, lo que condiciona su uso comercial. El repositorio pesa 0,7 GB y se publica en formato de pesos de Hugging Face, con el entrenador incluido en el directorio `training/`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | RVQ encoder de audio (basado en MiniMax Music3, 8 cabezas de cuantización) |
| Parametros totales | 169 millones |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (procesa audio, no texto; el corpus usa ventanas de 200 frames con hop de 100 frames / 345 latentes) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (entrada de audio, sin dependencia de idioma) |
| Licencia | minimax-music3-terms (ver enlace en la model card) |
| Formato de pesos | safetensors (repo de 0,7 GB; no se especifica explícitamente, pero es el formato habitual en la línea MiniMax Music3) |

## Arquitectura y entrenamiento

El modelo conserva la arquitectura exacta del encoder base `Mothersuperior/open-rvq-encoder-minimax-music3-169m-pooled-v4`, que es un cuantizador RVQ de 8 cabezas que convierte audio en códigos discretos de 8 niveles (cabezas semántica y acústica). No se trata de un transformer generativo, sino de un codificador que produce tokens de audio para el pipeline de MiniMax Music3. El entrenamiento de esta versión se realizó con un objetivo puro de destilación suave: entropía cruzada suave (soft-CE) contra las distribuciones top-50 del profesor (el encoder oficial de MiniMax), con temperaturas por cabeza aprendibles, inicializadas mediante búsqueda en línea (~16 para la semántica, ~2 para la acústica) y plegadas en los pesos de la cabeza al exportar.

El entrenamiento se realizó sobre el corpus `Mothersuperior/minimax-music3-rvq-distill-corpus-8k`, con 20.000 pasos, batch efectivo de 64 (16×4 acumulación de gradientes), lr 1e-4 con decaimiento coseno y warmup de 200 pasos, en bf16, sobre una única RTX 5090. Se aplicaron dos correcciones previas sobre el corpus: deshacer el wrap de los IDs semánticos en `uint16` (que convertía los IDs en valores corruptos) y corregir el desalineamiento temporal de las latentes en el audio sintetizado (el mapeo uniforme `latent = frame * 441 // 128` derivaba ~1 latente cada 800 frames; el mapeo correcto usa una función por tramos). Estas correcciones solo afectan al entrenamiento con el corpus; en audio real el mapeo uniforme sigue siendo correcto. El modelo se seleccionó en el paso 18.500 de un holdout en dominio y se evaluó adicionalmente con un «real-audio gate» sobre 13 grabaciones comerciales.

## Capacidades

- Genera códigos RVQ de 8 cabezas (semántica + acústica) para audio, compatibles con el pipeline de MiniMax Music3 (modelo de difusión y decodificador de profundidad).
- Sustituye directamente al encoder base `pooled-v4` en cargas de trabajo existentes (nodos de ComfyUI, difusores, adaptadores de referencia).
- Salida de logits calibrados: tras el plegado de temperaturas, `softmax(logits)` y la entropía cruzada son interpretables de forma directa, sin necesidad de escalado manual.
- Mantiene el orden de argmax y top-K respecto al base, por lo que no altera la selección de códigos en uso típico.
- Mejora la consistencia de los códigos con el modelo oficial en audio real: reduce la entropía cruzada del modelo congelado sobre códigos exportados (semántica 5,866 vs 6,838 del base; acústica 4,725 vs 5,373).
- No incluye capacidades de texto, visión o razonamiento; es un componente de audio exclusivamente.

## Casos de uso

- **Generación de música con MiniMax Music3**: el encoder se usa como front-end para convertir audio de referencia en códigos RVQ que el modelo de difusión de MiniMax Music3 puede consumir, permitiendo edición y continuación de canciones.
- **Entrenamiento de modelos de lenguaje de audio (LM de códigos)**: sus códigos calibrados y consistentes con el profesor sirven como objetivo de entrenamiento para modelos autoregresivos de audio que aprendan a predecir secuencias de tokens.
- **Fine-tuning de encoders de audio en dominio específico**: al estar entrenado con destilación suave y calibración, es una base adecuada para adaptar el tokenizador a géneros o estilos concretos sin perder la compatibilidad con el pipeline oficial.
- **Evaluación de calidad de codificación de audio**: las métricas de entropía cruzada calibrada permiten comparar objetivamente la calidad de distintos encoders RVQ frente al modelo oficial, sin necesidad de escuchar renders.
- **Preprocesado para pipelines de generación de música en investigación**: investigadores que estudian la línea MiniMax Music3 pueden usar este encoder como alternativa reproducible al encoder oficial para experimentos de destilación o regularización.
- **Aplicaciones de edición de audio**: al exportar códigos que se acercan más a los del modelo oficial, tareas como inpainting de segmentos de audio o re-estilización se benefician de una menor divergencia en el espacio latente.

## Benchmarks y rendimiento

El autor reporta dos conjuntos de métricas en la model card. Primero, en el holdout dentro del dominio (corpus 8k, con el loader corregido y CE calibrada), comparando con el base `pooled-v4`:

| Metrica (holdout in-domain) | pooled-v4 (inicio) | hotstep-v1 (paso 18500) | Cambio |
|---|---|---|---|
| Semantic soft-CE (vs profesor) | 3,299 | 3,039 | −7,9 % |
| Acoustic soft-CE | 4,618 | 4,413 | −4,4 % |
| Semantic hard-CE | 2,336 | 2,154 | −7,8 % |
| Acoustic hard-CE | 3,925 | 3,763 | −4,1 % |
| Semantic top-1 | 41,9 % | 42,2 % | +0,3 pt |
| Acoustic top-1 | 16,8 % | 17,6 % | +0,8 pt |

Segundo, en el «real-audio gate» (13 grabaciones comerciales, modelo oficial congelado):

| Encoder | Params | Sem CE | Sem top-1 | Ac CE | Ac top-1 |
|---|---|---|---|---|---|
| Serveurperso community 41M | 41M | 8,447 | 5,8 % | 6,763 | 2,3 % |
| Mothersuperior pooled-v3 | 41M | 7,261 | 8,5 % | 6,347 | 4,5 % |
| SimpleTuner v4 | 169M | 7,158 | 8,9 % | 5,638 | 5,8 % |
| Mothersuperior pooled-v4 | 169M | 6,838 | 10,9 % | 5,373 | 7,5 % |
| **hotstep-v1 (este modelo)** | **169M** | **5,866** | **16,6 %** | **4,725** | **10,9 %** |

No se han publicado resultados en benchmarks generales tipo MMLU o HumanEval, al no tratarse de un modelo de lenguaje.

## Requisitos de hardware

- **VRAM estimada**: al ser un encoder de 169M de parámetros en bf16, el peso del modelo ocupa aproximadamente 338 MB; la inferencia completa con lote pequeño cabe en cualquier GPU con al menos 2-4 GB de VRAM, incluida tarjetas de consumo.
- **GPU recomendadas**: el entrenamiento se realizó en una RTX 5090, pero para inferencia basta con cualquier GPU moderna (RTX 3060, RTX 4090, etc.). No requiere GPU de datacenter para uso típico.
- **Compatibilidad con consumer GPU**: sí, cabe sin problemas en GPUs de consumo (8 GB o menos).
- **Opciones de despliegue**: al ser un encoder de audio, no se usa con vLLM ni Ollama. La integración natural es mediante los nodos de ComfyUI, los difusores de la línea MiniMax Music3 o el script de inferencia incluido en el repositorio. El formato safetensors permite cargarlo con PyTorch estándar.
- **Latencia y throughput**: no se han publicado mediciones específicas. Dado el tamaño (169M) y la operación de cuantización RVQ, la latencia por archivo de audio es del orden de milisegundos en GPU de consumo, pero no hay datos oficiales.

## Comparativa con modelos similares

La comparativa directa se establece con los encoders de la misma línea RVQ para MiniMax Music3, según el «real-audio gate» de la model card:

| Modelo | Params | CE semántica | CE acústica | Top-1 sem | Top-1 ac | Licencia |
|---|---|---|---|---|---|---|
| Serveurperso community 41M | 41M | 8,447 | 6,763 | 5,8 % | 2,3 % | no disponible |
| Mothersuperior pooled-v3 | 41M | 7,261 | 6,347 | 8,5 % | 4,5 % | no disponible |
| SimpleTuner v4 | 169M | 7,158 | 5,638 | 8,9 % | 5,8 % | no disponible |
| Mothersuperior pooled-v4 | 169M | 6,838 | 5,373 | 10,9 % | 7,5 % | no disponible |
| **hotstep-v1** | **169M** | **5,866** | **4,725** | **16,6 %** | **10,9 %** | minimax-music3-terms |

Frente a `pooled-v4`, que es su base directa, este modelo mejora en todas las métricas del gate de audio real, con una reducción de CE de ~1.5 nats en la semántica y ~0.6 nats en la acústica. No hay comparativas públicas con otros encoders de audio fuera de esta línea (por ejemplo, EnCodec o DAC), porque no son compatibles con el pipeline de MiniMax Music3.

## Limitaciones y advertencias

- **Sesgo de corpus sintético**: el entrenamiento se realizó íntegramente con el corpus `minimax-music3-rvq-distill-corpus-8k`, que está generado sintéticamente. Aunque el modelo generaliza mejor que el base a audio real, la mejora se describe como «sutil al oído» y con rendimientos decrecientes.
- **Riesgo de alucinación**: no aplica directamente, al no ser un modelo generativo de texto; sin embargo, los códigos exportados pueden no ser válidos para el modelo oficial si se usan fuera de las condiciones de inferencia probadas (por ejemplo, con audio de duración o formato no estándar).
- **Concentración de códigos**: se observa una reducción de ~14 % en el uso de códigos semánticos únicos en el conjunto real-audio (6.490 vs 7.515 sobre 64k frames), lo que indica una leve concentración de la distribución, aunque el autor confirma que no llega a colapso.
- **Restricciones de licencia**: la licencia `minimax-music3-terms` puede limitar el uso comercial o la redistribución. Es imprescindible revisar el texto completo en https://huggingface.co/MiniMaxAI/MiniMax-Music3 antes de usar el modelo en producción.
- **Mantenimiento y soporte**: el modelo es una versión experimental (v1) de un autor individual, con 0 descargas y 0 likes en el momento de redactar esta ficha. No hay garantía de soporte ni de estabilidad a largo plazo.
- **Requisito de correcciones en el corpus**: si se reutiliza el corpus `minimax-music3-rvq-distill-corpus-8k` para entrenar otros modelos, es obligatorio aplicar las correcciones de wrap y alineamiento temporal descritas en la model card; de lo contrario, las pérdidas de destilación son inválidas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/scragnog/open-rvq-encoder-minimax-music3-169m-hotstep-v1
- Modelo base: https://huggingface.co/Mothersuperior/open-rvq-encoder-minimax-music3-169m-pooled-v4
- Corpus de destilación: https://huggingface.co/datasets/Mothersuperior/minimax-music3-rvq-distill-corpus-8k
- Modelo oficial MiniMax Music3 (licencia): https://huggingface.co/MiniMaxAI/MiniMax-Music3
- Demo de MiniMax Music3: https://minimax-ai.github.io/music3-demo/
