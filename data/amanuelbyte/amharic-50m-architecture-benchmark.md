# amanuelbyte/amharic-50m-architecture-benchmark

## Resumen

Este repositorio contiene un benchmark comparativo de cuatro arquitecturas de modelos de lenguaje de aproximadamente 50 millones de parámetros, entrenadas desde cero sobre el corpus de Wikipedia en amhárico. El autor, Amanuel Gizachew (amanuelbyte), investigador etíope especializado en IA para lenguas africanas de bajos recursos, busca evaluar qué arquitectura ofrece el mejor equilibrio entre rendimiento y eficiencia para el amhárico. Se comparan un transformer estilo Qwen3.5 con atención híbrida DeltaNet, un modelo recurrente HRM-Text, un SSM Mamba puro y un híbrido Mamba-Transformer. El objetivo es proporcionar una base empírica para elegir la arquitectura más adecuada en el desarrollo de LLMs para lenguas con pocos recursos.

El modelo se presenta como un conjunto de checkpoints y código de entrenamiento, más que como un modelo único desplegable. Incluye un tokenizador subword de 3.919 tokens entrenado con aprendizaje por refuerzo (según la descripción) y cuatro implementaciones PyTorch. La licencia Apache-2.0 permite uso comercial y modificación, lo que lo hace atractivo para investigación y desarrollo en entornos productivos. Aunque el tamaño es pequeño, su relevancia radica en el estudio comparativo de arquitecturas modernas aplicadas a un idioma poco representado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Multiple: Qwen3.5 Transformer (Gated DeltaNet + Attention), HRM-Text (recurrencia dual-timescale), Mamba SSM, Hybrid Mamba-Transformer |
| Parametros totales | 50.79M (Qwen3.5), 49.02M (HRM-Text), 49.47M (Mamba), 52.04M (Hybrid) |
| Parametros activos | No aplica (modelos densos, no MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Amharico (am) |
| Licencia | Apache-2.0 |
| Formato de pesos | PyTorch (checkpoints .pt) |

## Arquitectura y entrenamiento

El repositorio implementa cuatro arquitecturas distintas, todas con aproximadamente 50M de parametros, entrenadas desde cero sobre el corpus de Wikipedia en amharico. El tokenizador es un subword de 3.919 tokens, entrenado con un metodo que el autor describe como "RL-trained" (posiblemente aprendizaje por refuerzo, aunque no se detalla). Las arquitecturas son:

- **Qwen3.5 Transformer**: utiliza una mezcla 3:1 de Gated DeltaNet y Gated Attention, normalizacion RMSNorm centrada en cero, RoPE parcial (0.25) y una cabeza de prediccion multi-token (MTP). Esta disenada para combinar la eficiencia de DeltaNet con la calidad de atencion clasica.
- **HRM-Text**: modelo recurrente con recurrencia dual-timescale (H2L3), normalizacion MagicNorm sin parametros, enmascaramiento PrefixLM y entrenamiento con TBPTT (backpropagation through time) con calentamiento de 2 a 5 pasos.
- **Mamba SSM**: modelo de espacio de estados selectivo, con dt_rank=32, inicializacion log-uniforme de Delta y parametros S4D para la matriz A.
- **Hybrid Mamba-Transformer**: intercala capas Mamba y atencion Qwen3.5 en proporcion 2:1, con FFN unificada SwiGLU y escalado de profundidad idempotente.

No se especifican el numero total de tokens de entrenamiento, la composicion exacta del dataset ni si se aplicaron tecnicas de alineacion como RLHF o DPO. El entrenamiento parece ser de modelado de lenguaje autoregresivo puro, con variaciones en el enmascaramiento segun la arquitectura.

## Capacidades

- Generacion de texto en amharico: los cuatro modelos son capaces de producir texto coherente en amharico tras el entrenamiento, aunque su calidad depende de la arquitectura y no se han publicado metricas comparativas.
- Modelado de lenguaje: todos los checkpoints estan entrenados para predecir el siguiente token, lo que permite su uso como base para fine-tuning en tareas downstream.
- Investigacion arquitectonica: el repositorio permite comparar el comportamiento de distintas arquitecturas (transformer, recurrente, SSM, hibrida) bajo las mismas condiciones de datos y presupuesto de parametros.
- No se mencionan capacidades de tool calling, agentes, vision, audio ni razonamiento multi-paso. El modelo es exclusivamente de texto y no incluye modo de pensamiento explicito.

## Casos de uso

- Investigacion comparativa de arquitecturas: el repositorio esta disenado para que investigadores puedan analizar las curvas de perdida, throughput y frontera de Pareto entre las cuatro arquitecturas, ayudando a decidir que tipo de modelo escalar para amharico u otras lenguas de bajos recursos.
- Fine-tuning para generacion de texto en amharico: los checkpoints pueden servir como punto de partida para tareas como resumen, traduccion o dialogo, dado su tamano reducido y la licencia permisiva.
- Educacion y prototipado: al ser modelos de 50M, son adecuados para entornos docentes o para validar ideas de arquitectura sin necesidad de grandes recursos computacionales.
- Desarrollo de herramientas de procesamiento de lenguaje natural para amharico: por ejemplo, correccion ortografica, autocompletado o generacion de contenido en este idioma, aprovechando el tokenizador especifico.
- Benchmark de eficiencia: los logs de entrenamiento y las graficas incluidas permiten estudiar el trade-off entre velocidad de inferencia y calidad, util para despliegues en entornos con restricciones de hardware.
- Base para modelos mas grandes: los resultados de este benchmark pueden orientar la eleccion de arquitectura al escalar a cientos de millones o miles de millones de parametros para amharico.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card menciona que el repositorio contiene un informe comparativo (`analysis/report.md`) y tablas de resultados, pero no se incluyen numeros concretos en la descripcion. Por tanto, no es posible presentar una tabla de metricas como MMLU, HumanEval o GSM8K. Se recomienda consultar el repositorio para acceder a los datos de evaluacion si estan disponibles.

## Requisitos de hardware

- Al ser modelos de aproximadamente 50M de parametros, el uso de VRAM es muy bajo. En precision fp32, los pesos ocupan unos 200 MB; en fp16, unos 100 MB. Cualquier GPU con al menos 2 GB de VRAM puede ejecutar la inferencia sin problemas.
- GPUs recomendadas: cualquier GPU consumer moderna (NVIDIA GTX 1060 o superior, RTX 2060, etc.) es suficiente. Incluso CPU es viable para inferencia, aunque con mayor latencia.
- El entrenamiento desde cero, aunque no se especifican los requisitos, probablemente se realizo con una GPU de gama media (por ejemplo, RTX 3090 o similar) dado el tamano del modelo y el corpus de Wikipedia.
- Opciones de despliegue: al ser checkpoints PyTorch, se pueden cargar con la libreria `transformers` si se adaptan, o directamente con PyTorch. No se mencionan formatos GGUF ni soporte para vLLM, Ollama o TGI. Para produccion, seria necesario convertir los pesos a estos formatos.
- Latencia y throughput: no se proporcionan datos. Dado el tamano, la inferencia en GPU deberia ser de decenas de miles de tokens por segundo, pero no hay cifras oficiales.

## Comparativa con modelos similares

No disponible. No se han encontrado en la informacion proporcionada modelos comparables de tamano similar especificamente entrenados para amharico. Existen otros modelos multilingues que incluyen amharico (por ejemplo, algunos modelos de la familia Llama o Mistral), pero no son directamente comparables por su tamano y enfoque. Se recomienda consultar el informe del repositorio para posibles comparaciones internas entre las cuatro arquitecturas.

## Limitaciones y advertencias

- Entrenamiento limitado a Wikipedia en amharico: el corpus es relativamente pequeno y de dominio enciclopedico, lo que puede limitar la cobertura de vocabulario coloquial, tecnico o dialectal.
- Sesgos potenciales: al entrenarse solo con contenido de Wikipedia, el modelo puede reflejar los sesgos presentes en esa fuente, como una perspectiva predominantemente formal y etiope central.
- Riesgo de alucinacion: como cualquier modelo de lenguaje pequeno, puede generar texto incorrecto o inventado, especialmente en temas poco representados en el corpus.
- Sin datos de evaluacion publicados: no hay metricas de calidad que permitan comparar objetivamente con otros modelos, lo que dificulta su uso en produccion sin una evaluacion propia.
- Formato de pesos propietario: los checkpoints estan en formato `.pt` de PyTorch, no en safetensors ni GGUF, lo que puede requerir conversion para su uso con herramientas estandar.
- Fecha de creacion futura: el repositorio esta fechado en agosto de 2026, lo que podria indicar que es un proyecto reciente o experimental; se recomienda verificar la vigencia de las dependencias.
- No se especifica la longitud de contexto, por lo que se desconoce si soporta ventanas largas o si esta limitado a secuencias cortas.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/amanuelbyte/amharic-50m-architecture-benchmark
- Perfil del autor en Hugging Face: https://huggingface.co/amanuelbyte
- Perfil de GitHub del autor: https://github.com/Aman-byte1
- Referencias citadas en la model card:
  - Qwen3.5: Alibaba Qwen Team (2025/2026)
  - HRM-Text: Sapient Intelligence (Wang et al., 2026)
  - Mamba: Gu & Dao (2023)
