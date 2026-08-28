# gyung/gdn2-cpt-ssc-chkpt-tk4-fineweb

## Resumen

El modelo `gyung/gdn2-cpt-ssc-chkpt-tk4-fineweb` es un checkpoint de *continued pretraining* (CPT) de la arquitectura GDN-2 (Gated DeltaNet v2) con 370 millones de parámetros, publicado por el usuario `gyung` en Hugging Face. Forma parte de una serie comparativa unificada de CPT denominada "Long-GDN CPT comparison" (2026-08-26), en la que se entrenan varias variantes sobre los mismos datos y número de pasos para evaluar el impacto de distintas estrategias de compresión de estado y atención lineal.

Este checkpoint concreto corresponde a la variante "SSC" (posiblemente *Sparse State Compression* o similar, aunque no se detalla) y se entrenó sobre 105 millones de tokens del dataset FineWeb, con 400 pasos de optimización, un tamaño de lote efectivo de 64 y secuencias de 4096 tokens. El resultado es un modelo de lenguaje pequeño, orientado a investigación, que explora la eficiencia de arquitecturas de estado recurrente con mecanismos de compuerta y delta rule.

La relevancia actual de este modelo radica en su contribución al estudio de alternativas al *attention* estándar, especialmente en el contexto de modelos con ventanas de contexto largas y menor coste computacional. Sin embargo, al tratarse de un checkpoint experimental sin documentación adicional, su uso práctico queda limitado al ámbito de la investigación y la comparación de arquitecturas.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GDN-2 (Gated DeltaNet v2) |
| Parametros totales | 370 millones (370M) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | checkpoint PyTorch (`.pth`) |

## Arquitectura y entrenamiento

GDN-2 (Gated DeltaNet v2) es una arquitectura de atención lineal con mecanismos de compuerta y actualización delta, diseñada para superar las limitaciones de las redes recurrentes clásicas en cuanto a capacidad de memoria y paralelización. A diferencia de los transformers con atención softmax completa, GDN-2 mantiene un estado recurrente comprimido, lo que permite procesar secuencias largas con coste lineal en la longitud de la secuencia.

El entrenamiento de este checkpoint se realizó como *continued pretraining* sobre el dataset FineWeb, con un total de 105 millones de tokens. El proceso consistió en 400 pasos de optimización con un tamaño de lote efectivo de 64 secuencias de 4096 tokens cada una. No se especifica si se emplearon técnicas como RLHF o DPO, ni la composición exacta del subconjunto de FineWeb utilizado. Tampoco se detalla el número total de tokens vistos durante el pretraining original del modelo base.

La variante "SSC" sugiere algún mecanismo de compresión de estado, pero no se proporciona información técnica al respecto en la model card. El autor menciona que forma parte de una serie comparativa con otras variantes (SSKetch+ReMoE, SSC fixed top-4, vanilla GDN-2), lo que indica un interés en estudiar diferentes estrategias de gestión de memoria recurrente.

## Capacidades

No se han documentado capacidades específicas para este checkpoint en la información disponible. Al ser un modelo de lenguaje autoregresivo de 370M parámetros, se espera que pueda realizar tareas básicas de generación de texto, pero no hay evaluaciones publicadas que confirmen su rendimiento en tareas concretas como razonamiento, código o matemáticas. La ausencia de benchmarks y de una descripción funcional impide afirmar capacidades concretas más allá de la generación de texto condicionada.

## Casos de uso

Dado el carácter experimental y la falta de documentación, los casos de uso son hipotéticos y deben considerarse con cautela:

- Investigación en arquitecturas de atención lineal: el modelo sirve como punto de comparación para estudiar el comportamiento de GDN-2 frente a otras variantes en la serie CPT.
- Evaluación de técnicas de compresión de estado: la variante SSC permite analizar el impacto de la compresión en la calidad de las representaciones aprendidas.
- Experimentos de *continued pretraining* sobre dominios específicos: al ser un checkpoint intermedio, puede servir como base para entrenamientos adicionales con datasets propios.
- Pruebas de eficiencia en hardware limitado: con solo 370M parámetros, es viable ejecutar inferencia en GPUs de gama media o incluso CPU, lo que facilita experimentos de bajo coste.
- Estudio de la transferencia de conocimiento desde FineWeb: el entrenamiento sobre este dataset permite analizar qué patrones lingüísticos se capturan con un presupuesto de tokens reducido.
- Desarrollo de prototipos de generación de texto en entornos sin acceso a modelos grandes: aunque no hay garantías de calidad, su tamaño reducido lo hace manejable para pruebas iniciales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No existen datos sobre MMLU, HumanEval, GSM8K u otras evaluaciones estándar para este checkpoint.

## Requisitos de hardware

- VRAM estimada para inferencia: para un modelo de 370M parámetros en FP16, los pesos ocupan aproximadamente 740 MB. Con overhead de activaciones y caché para una secuencia de 4096 tokens, se estima un consumo total de 2-3 GB en FP16, y el doble en FP32.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM puede ejecutar el modelo en FP16. Ejemplos: NVIDIA GTX 1650 (4 GB), RTX 3050 (8 GB), RTX 3060 (12 GB) o superiores. También es posible ejecutarlo en CPU con suficiente RAM.
- Compatibilidad con GPU de consumo: sí, cabe en la mayoría de GPUs consumer actuales, incluso en versiones con poca memoria.
- Opciones de despliegue: al ser un checkpoint en formato `.pth`, no es directamente compatible con vLLM, llama.cpp u Ollama sin conversión previa. Habría que exportar los pesos a un formato estándar como safetensors y adaptar la arquitectura para esos runners. No se proporcionan scripts de conversión.
- Latencia y throughput: no se dispone de datos medidos. Como referencia, un modelo de 370M en una GPU moderna (RTX 3090) puede generar decenas de tokens por segundo, pero esto depende de la implementación y la longitud de secuencia.

## Comparativa con modelos similares

No se dispone de información suficiente para establecer una comparativa rigurosa con otros modelos de tamaño similar (p. ej., GPT-2 small de 124M, Pythia-410M, OPT-350M). No se conocen los resultados de rendimiento de este checkpoint, ni sus características exactas de contexto o licencia. Por tanto, la comparativa no está disponible.

## Limitaciones y advertencias

- Falta de documentación: la model card es extremadamente escueta; no se especifican detalles de arquitectura interna, datos de entrenamiento completos, ni metodología de evaluación.
- Licencia no definida: al no indicarse licencia, no está claro si el modelo puede utilizarse comercialmente o con fines de investigación. Se recomienda contactar al autor antes de cualquier uso.
- Checkpoint experimental: es un punto intermedio de un entrenamiento de CPT, no un modelo final pulido. Su rendimiento en tareas reales es desconocido y probablemente inferior a modelos de tamaño similar entrenados desde cero.
- Riesgo de alucinación y sesgos: al entrenarse sobre FineWeb (un subconjunto de Common Crawl), el modelo puede haber aprendido sesgos presentes en la web. No hay información sobre mitigaciones.
- Formato propietario: los pesos están en formato `.pth` de PyTorch, lo que dificulta su uso con herramientas estándar de inferencia optimizada (vLLM, TGI, etc.) sin conversión manual.
- Sin soporte de tool calling, agentes o capacidades multimodales: no hay evidencia de que el modelo soporte estas funcionalidades.

## Enlaces

- Repositorio del modelo: https://huggingface.co/gyung/gdn2-cpt-ssc-chkpt-tk4-fineweb
- Serie comparativa de CPT: https://huggingface.co/gyung/gdn2-cpt-compare-2026-08-26
- Dataset utilizado (referencia): https://huggingface.co/datasets/gyung/gdn2-cpt-longdata-30k
