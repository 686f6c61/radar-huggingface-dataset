# NextTransformer/UT-ACT-49B-Tokens

## Resumen

NextTransformer UT-ACT es un modelo de lenguaje causal de tipo Universal Transformer con Adaptive Computation Time (ACT), desarrollado por NextTransformer dentro de su comparativa de arquitecturas entrenadas sobre 49.152 mil millones de tokens. El checkpoint publicado tiene 742.394.259 parámetros y una ventana de contexto de 2.048 tokens, y se distribuye como pesos en safetensors compatibles con la implementación de referencia del proyecto en GitHub.

La propuesta técnica es poco habitual: en lugar de aplicar un número fijo de capas, el modelo repite un bloque de transformación un número variable de veces por token, acumulando "masa de halting" hasta decidir que el estado ha recibido suficiente cómputo. Esto permite, en teoría, asignar más profundidad computacional a tokens difíciles y menos a los triviales, con un coste de "ponderación" (ponder cost) que regulariza la profundidad media durante el entrenamiento.

Es relevante ahora porque forma parte de una comparativa abierta de arquitecturas (NextTransformer) que publica registros de ejecución y resultados de evaluación reproducibles, algo poco frecuente en modelos de este tamaño. No obstante, conviene subrayar que el modelo es un checkpoint de investigación preentrenado, sin ajuste por instrucciones ni alineación, y que su nombre "49B" hace referencia a los tokens de entrenamiento, no al número de parámetros.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Universal Transformer con Adaptive Computation Time (ACT), transformer causal con recursión adaptativa por token |
| Parametros totales | 742.394.259 |
| Parametros activos | no disponible (no es MoE; el cómputo efectivo varía por token según la profundidad de salida) |
| Longitud de contexto | 2.048 tokens |
| Tipos de cuantizacion | no disponible (solo se publican pesos en safetensors; no hay GGUF ni cuantizaciones oficiales) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (`model.safetensors`), más `model_config.json` y `tokenizer.tiktoken.json` |
| Tokenizador | tiktoken, con vocabulario y `pat_str` definidos en `tokenizer.tiktoken.json` |
| Tokens de entrenamiento | 49.152 millones (46.875 updates) |
| Dataset de entrenamiento | ClimbMix |
| Framework | PyTorch, librería `nexttransformer` (GitHub: Interactive-Active-AI/NextTransformer) |
| Tamaño del repo | 2,3 GB |

## Arquitectura y entrenamiento

El modelo es una adaptación "nanochat" causal del Universal Transformer. En lugar de una pila de capas distintas, emplea un bloque recurrente que se aplica varias veces por token; en cada recursión se acumula masa de halting y, cuando esta supera un umbral, el token "sale" y su estado se combina con los estados intermedios. Un coste de ponderación (ponder cost) penaliza la profundidad de cómputo durante el entrenamiento, de modo que el modelo aprende a repartir recursiones de forma adaptativa. La model card advierte explícitamente de que la ruta de referencia calcula todas las recursiones candidatas, por lo que una profundidad media de salida baja no implica menor coste de entrenamiento.

El preentrenamiento se realizó sobre ClimbMix durante 46.875 actualizaciones, hasta 49.152 millones de tokens, con un tokenizador tiktoken propio. No se documentan fases de ajuste fino supervisado, RLHF ni DPO: el checkpoint es estrictamente preentrenado (`pretrained`). La model card indica que el registro de ejecución del entrenamiento reporta finalización y una auditoría de cómputo acumulada del propio trainer, pero que la auditoría independiente de solo lectura sigue pendiente, lo que conviene tener en cuenta al interpretar los resultados.

## Capacidades

- Generación de texto causal autoregresiva: continuación de secuencias y modelado de lenguaje de siguiente token.
- Razonamiento de lenguaje general limitado a lo aprendido en preentrenamiento; no hay ajuste por instrucciones.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso explícito.
- Capacidades multilingües: no disponibles (no se especifican idiomas).
- No dispone de visión, audio ni modo "thinking" explícito.
- Particularidad arquitectónica: profundidad de cómputo adaptativa por token (ACT), con estados intermedios combinados.
- Tokenizador tiktoken con tokens especiales (por ejemplo `<|bos|>`).

## Casos de uso

- Investigación en arquitecturas recurrentes y ACT: el checkpoint sirve como referencia reproducible para estudiar cómo la profundidad adaptativa afecta al modelado de lenguaje, comparándolo con los demás checkpoints de la comparativa NextTransformer.
- Experimentos de eficiencia computacional: permite medir la relación entre profundidad media de salida, coste de ponderación y calidad (BPB, CORE-22) en un modelo de 742 M de parámetros.
- Reproducción de resultados: el registro de ejecución y la configuración publicados permiten replicar la evaluación sobre ClimbMix y verificar las cifras reportadas.
- Fine-tuning académico: al ser un modelo preentrenado de tamaño medio, es viable ajustarlo en una sola GPU para tareas concretas de clasificación o generación con contexto de hasta 2.048 tokens.
- Estudio de tokenizadores alternativos: el tokenizador tiktoken propio permite analizar el impacto de la tokenización en el rendimiento de un transformer causal pequeño.
- Prototipado de continuación de texto en dominios acotados: con prompts cortos (menos de 2.048 tokens) y sin expectativas de instrucciones, puede usarse para generar texto de dominio específico tras un ajuste fino.

## Benchmarks y rendimiento

Resultados de evaluación final reportados en la model card:

| Benchmark | Resultado |
|---|---|
| Validation BPB | 0,6866 |
| CORE-22 (×100) | 30,07 |

No se han publicado en la información disponible comparaciones con otros modelos en estos mismos benchmarks, ni resultados de MMLU, HumanEval o GSM8K.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: aproximadamente 3 GB solo para pesos (742 M de parámetros × 4 bytes), más activaciones y caché KV para 2.048 tokens.
- En fp16/bf16: alrededor de 1,5 GB para pesos; cabe holgadamente en GPUs de consumo como RTX 3060, RTX 4060 o superiores.
- El ejemplo oficial de la model card se ejecuta en CPU (`CUDA_VISIBLE_DEVICES=""`), lo que confirma que la inferencia es viable sin GPU.
- Opciones de despliegue: la implementación de referencia `nexttransformer` (instalable desde GitHub en el commit `4977f44`) junto con `safetensors` y `tiktoken`. No hay soporte documentado para vLLM, llama.cpp, Ollama ni TGI, al no existir pesos en GGUF ni integración en esos frameworks.
- Latencia y throughput: no disponibles. El coste real depende del número de recursiones ejecutadas por token, y la ruta de referencia calcula todas las recursiones candidatas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| NextTransformer UT-ACT | 742 M | 2.048 | Universal Transformer + ACT | no disponible | Hugging Face + GitHub |
| Modelos comparables de la comparativa NextTransformer | no disponible | no disponible | otras arquitecturas del mismo estudio | no disponible | no disponible |
| Alternativas de ~700 M tipo GPT-2/Pythia | ~700 M–1,4 B | 1.024–2.048 | transformer estándar | MIT / Apache-2.0 (según modelo) | amplia |

No se dispone de datos de benchmarks comparables publicados en la información proporcionada para establecer una comparación cuantitativa con alternativas.

## Limitaciones y advertencias

- Es un checkpoint exclusivamente preentrenado: no sigue instrucciones ni está alineado; puede generar contenido sesgado, tóxico o factualmente incorrecto.
- Riesgo de alucinación alto, como en cualquier modelo de lenguaje sin ajuste ni recuperación.
- Contexto limitado a 2.048 tokens, insuficiente para documentos largos o conversaciones multi-turno extensas.
- Idiomas soportados no documentados; el rendimiento fuera del inglés (si el corpus ClimbMix es mayoritariamente inglés) es incierto.
- Licencia no disponible: no puede asumirse uso comercial; debe contactarse con el autor antes de cualquier despliegue en producción.
- La auditoría independiente del registro de entrenamiento está pendiente según la propia model card; los resultados deben tratarse como preliminares.
- La profundidad adaptativa no garantiza menor coste de inferencia: la ruta de referencia calcula todas las recursiones candidatas.
- Dependencia de una implementación no estándar (`nexttransformer`) fijada a un commit concreto, lo que complica el mantenimiento a largo plazo.
- Sin cuantizaciones oficiales ni integración en frameworks de serving habituales.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/NextTransformer/UT-ACT-49B-Tokens
- Repositorio GitHub del proyecto: https://github.com/Interactive-Active-AI/NextTransformer
- Configuración de arquitectura (commit fijado): https://github.com/Interactive-Active-AI/NextTransformer/blob/4977f447d9aeb510ecb2cf8a9e8a6812d78b5c69/results/methods/ut_act.json
- Registro de ejecución del entrenamiento: https://github.com/Interactive-Active-AI/NextTransformer/blob/4977f447d9aeb510ecb2cf8a9e8a6812d78b5c69/results/runs/ut_act.json
