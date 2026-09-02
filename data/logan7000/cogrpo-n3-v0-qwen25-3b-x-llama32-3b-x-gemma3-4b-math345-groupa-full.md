# logan7000/cogrpo-n3-v0-qwen25-3b-x-llama32-3b-x-gemma3-4b-math345-groupA-full

## Resumen

El repositorio `logan7000/cogrpo-n3-v0-qwen25-3b-x-llama32-3b-x-gemma3-4b-math345-groupA-full` contiene el resultado del primer experimento completo de co-aprendizaje multi-agente con el método Co-GRPO, desarrollado por el usuario logan7000. El modelo corresponde al agente A, basado en Qwen2.5-3B-Instruct, que fue entrenado colaborativamente junto con otros dos agentes (Llama-3.2-3B-Instruct y Gemma-3-4B-it) sobre problemas matemáticos de los niveles 3 a 5 del dataset MATH. Este run se conserva como registro de la decisión de sustituir posteriormente a Gemma por Qwen3-1.7B-Base.

El interés de este modelo es principalmente investigador: explora cómo el entrenamiento con refuerzo multi-agente (Co-GRPO) puede mejorar el razonamiento matemático en modelos pequeños. Aunque el modelo base tiene 3 mil millones de parámetros, el repositorio incluye múltiples checkpoints (best, endpoint) y logs de entrenamiento, lo que lo convierte en un recurso útil para estudiar la dinámica del co-entrenamiento y reproducir experimentos. No se dispone de información sobre licencia, idiomas o benchmark, por lo que su uso en producción no está documentado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (basada en Qwen2.5-3B-Instruct) |
| Parametros totales | 3 mil millones (inferido del nombre del modelo base) |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el repositorio solo contiene safetensors en precision completa) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un fine-tuning del checkpoint Qwen2.5-3B-Instruct mediante Co-GRPO (Group Relative Policy Optimization con co-aprendizaje). Segun la model card, se entrenaron tres agentes de forma simultanea: A (Qwen2.5-3B-Instruct), B (Llama-3.2-3B-Instruct) y C (Gemma-3-4B-it). El entrenamiento utilizo el dataset MATH con niveles 3 a 5 (math345), con 136 pasos equivalentes a 1 epoca, 128 prompts por actualizacion, K=12 (numero de respuestas muestreadas por prompt), beta=0 y una tasa de aprendizaje de 3e-6. La funcion de recompensa fue la co-reward v0 por defecto, anterior a las variantes de modo.

El metodo Co-GRPO es una extension de GRPO en la que varios agentes se entrenan conjuntamente, intercambiando informacion o recompensas para fomentar la diversidad y la colaboracion. En este experimento, los tres agentes parten de modelos base distintos, lo que podria favorecer estrategias de razonamiento complementarias. No se mencionan tecnicas adicionales como decodificacion especulativa ni attention lineal.

## Capacidades

- Razonamiento matematico: entrenado especificamente en problemas de matematicas de nivel intermedio (MATH 3-5), por lo que su capacidad principal es la resolucion de problemas aritmeticos, algebraicos y de razonamiento cuantitativo.
- Generacion de texto: al derivar de Qwen2.5-3B-Instruct, conserva la capacidad generativa general, aunque el entrenamiento se ha centrado en tareas matematicas.
- Co-aprendizaje: el modelo forma parte de un sistema multi-agente, aunque el checkpoint individual no expone una interfaz explicita para colaboracion.
- No se documentan capacidades de tool calling, agentes, vision ni audio.

## Casos de uso

- Investigacion en RL multi-agente: el repositorio permite analizar como el co-entrenamiento afecta al rendimiento individual de cada agente, comparando los checkpoints de los tres modelos.
- Reproduccion de experimentos: los logs de entrenamiento y los checkpoints intermedios (best, endpoint) facilitan replicar el estudio y verificar resultados.
- Evaluacion de razonamiento matematico en modelos pequenos: util para medir el impacto de Co-GRPO frente a fine-tuning convencional en benchmarks como GSM8K o MATH (aunque no se publican resultados aqui).
- Estudio de dinamicas de recompensa: el diseno de la co-reward v0 puede analizarse a partir de los datos de entrenamiento, sirviendo de base para disenar nuevas variantes.
- Comparacion de arquitecturas base: al usar tres modelos distintos (Qwen, Llama, Gemma), el experimento permite estudiar como la eleccion del modelo base influye en el co-aprendizaje.
- Desarrollo de metodos de entrenamiento colaborativo: los resultados pueden inspirar nuevos algoritmos de RL distribuido o federado con multiples agentes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de evaluacion ni comparaciones con otros modelos. El repositorio contiene un directorio `best/` con un checkpoint seleccionado por validacion, pero no se especifica que metrica se utilizo para esa seleccion.

## Requisitos de hardware

- VRAM estimada para inferencia: al ser un modelo de 3B parametros, en precision fp16/bf16 requiere aproximadamente 6-7 GB de VRAM. Con cuantizacion int8 se reduce a ~3-4 GB, y en int4 a ~2 GB (aunque no se ofrecen cuantizaciones en el repo).
- GPU recomendadas: una RTX 3090, RTX 4090 o A10G es suficiente para inferencia en fp16. Para entrenamiento, se necesitaria al menos una A100 40GB o varias GPUs, dado que el entrenamiento multi-agente implica cargar tres modelos simultaneamente.
- Compatibilidad con GPU de consumo: si, el modelo cabe en GPUs consumer de 8 GB o mas, dependiendo de la cuantizacion.
- Opciones de despliegue: al estar en formato safetensors, puede cargarse con transformers, vLLM, TGI o llama.cpp (si se convierte a GGUF). No hay instrucciones especificas en la model card.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

Dado que no hay datos de rendimiento, la comparativa se basa en caracteristicas estructurales de los modelos base involucrados en el experimento.

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Qwen2.5-3B-Instruct (base) | 3B | 32K (segun documentacion oficial) | Apache 2.0 | Modelo base del agente A |
| Llama-3.2-3B-Instruct | 3B | 128K | Llama 3.2 Community License | Agente B del experimento |
| Gemma-3-4B-it | 4B | 128K | Gemma Terms of Use | Agente C original, posteriormente reemplazado |

Este modelo no es directamente comparable con los modelos base porque ha sido modificado mediante Co-GRPO, pero no se dispone de metricas para cuantificar la diferencia. No se conocen otros modelos que utilicen el mismo metodo de co-aprendizaje en este tamano.

## Limitaciones y advertencias

- No se dispone de informacion sobre la licencia, por lo que el uso comercial es incierto y requiere contactar con el autor o verificar los archivos del repositorio.
- El modelo esta especializado en matematicas de nivel intermedio; su rendimiento en otras tareas puede degradarse respecto al modelo base.
- No se publican resultados de evaluacion, por lo que no hay garantia de calidad ni de ausencia de alucinaciones en respuestas matematicas.
- El experimento se realizo con beta=0, lo que implica que no se aplico regularizacion KL con el modelo de referencia; esto puede provocar una deriva excesiva en la politica.
- La fecha de creacion (2026) es futura, lo que sugiere que el repositorio podria ser experimental o no verificado; se recomienda precaucion antes de usarlo en entornos reales.
- El tamano del repositorio (12.4 GB) incluye multiples checkpoints y logs, no solo el modelo final; la descarga puede ser innecesariamente grande si solo se necesita el checkpoint final.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/logan7000/cogrpo-n3-v0-qwen25-3b-x-llama32-3b-x-gemma3-4b-math345-groupA-full
- Repositorio relacionado (variante con Phi-4-mini, agente A): https://huggingface.co/logan7000/cogrpo-n3-ring-qwen25-3b-x-llama32-3b-x-phi4mini-math345-groupA-qwen25-end
- Repositorio relacionado (variante con Phi-4-mini, agente B): https://huggingface.co/q1716523669/cogrpo-n3-ring-qwen25-3b-x-llama32-3b-x-phi4mini-math345-groupB-llama32-end
- Despliegue en FriendliAI (modelo similar): https://friendli.ai/models/q1716523669/cogrpo-n3-ring-qwen25-3b-x-llama32-3b-x-phi4mini-math345-groupA-qwen25-end
- Documentacion de Gemma-3-4B en Ollama: https://ollama.com/library/gemma3:4b
- Documentacion de Llama-3.2-3B en Ollama: https://ollama.com/library/llama3.2:3b
