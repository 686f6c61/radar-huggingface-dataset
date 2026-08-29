# huluhuluu/Qwen3-4B-Instruct-2507-EAGLE3-ShareGPT-NoWindow-epoch-6-step-155000

## Resumen

El repositorio `huluhuluu/Qwen3-4B-Instruct-2507-EAGLE3-ShareGPT-NoWindow-epoch-6-step-155000` contiene un checkpoint concreto del modelo de draft EAGLE3 entrenado para acelerar la inferencia del modelo `Qwen/Qwen3-4B-Instruct-2507` mediante decodificación especulativa. No es un modelo de chat independiente: se trata de un componente auxiliar de una sola capa decoder con 202,7 millones de parámetros que predice secuencias de tokens plausibles para que el modelo grande las verifique en paralelo, reduciendo la latencia de generación en entornos de producción con SGLang.

El entrenamiento se realizó con el método online EAGLE3 implementado en SpecForge, sobre un dataset limpio de ShareGPT, durante 10 épocas y 231810 pasos de optimización. Este checkpoint corresponde a la época 6, paso 155000, y forma parte de una colección de 47 checkpoints publicados por el autor. La licencia es Apache-2.0 y los pesos están en formato safetensors con precisión bfloat16.

La relevancia de este modelo radica en que permite aprovechar la decodificación especulativa EAGLE3 sobre un modelo de 4B parámetros sin necesidad de entrenar un draft desde cero, sino reutilizando un checkpoint ya entrenado y listo para integrarse en SGLang. No se han publicado métricas de evaluación ni de seguridad para este run.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LlamaForCausalLMEagle3 (una capa decoder, hidden size 2560, intermediate 9728, 32 attention heads, 8 key/value heads) |
| Parametros totales | 202.700.416 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 2048 tokens (entrenamiento); sin ventana deslizante (NoWindow) |
| Tipos de cuantizacion | no disponible (pesos en bfloat16) |
| Idiomas soportados | no disponible (entrenado con ShareGPT, predominantemente ingles, sin confirmacion oficial) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un draft model EAGLE3 con arquitectura `LlamaForCausalLMEagle3`: una sola capa decoder con hidden size 2560, intermediate size 9728, 32 attention heads y 8 key/value heads. El vocabulario de draft es de 32000 tokens, mientras que el vocabulario objetivo (del modelo base) es de 151936. Los pesos están en bfloat16. No se aplica ventana deslizante en este checkpoint (NoWindow).

El entrenamiento se realizó con el método online EAGLE3 implementado en SpecForge, usando un dataset limpio de ShareGPT en formato JSONL (revisión no registrada). Los hiperparámetros incluyen: 10 épocas, 231810 pasos totales, batch efectivo de 4 (data-parallel size 4, batch por dispositivo 1, sin acumulación de gradientes), learning rate 1e-4 con warmup lineal del 1.5% y decaimiento coseno, weight decay 0, max grad norm 0.5, longitud máxima de secuencia 2048, TTT length 7, attention con `sdpa`, y target backend SGLang con flashinfer. No se aplicó RLHF ni DPO; es un entrenamiento puramente de modelo de draft.

## Capacidades

- Generacion de secuencias de tokens draft para decodificacion especulativa sobre `Qwen/Qwen3-4B-Instruct-2507`.
- Aceleracion de inferencia en servidores SGLang mediante el algoritmo EAGLE3.
- Reduccion de latencia en generacion de texto de longitud media (hasta 2048 tokens de entrenamiento).
- Integracion con el backend SGLang (`flashinfer`) como ruta de draft especulativa.
- No es un modelo de chat: no genera respuestas por si mismo ni soporta tool calling, razonamiento o agentes.

## Casos de uso

- Aceleracion de inferencia en produccion: integrar el checkpoint como ruta de draft en SGLang para reducir la latencia de generacion de `Qwen3-4B-Instruct-2507` en servicios de chat o asistentes virtuales. El draft predice tokens futuros que el modelo grande verifica en paralelo, lo que reduce el numero de pasos secuenciales.
- Despliegue en GPU con VRAM limitada: al anadir solo ~0,4 GB de pesos del draft sobre el modelo base de 4B, se puede operar en tarjetas consumer de 24 GB (como RTX 3090/4090) manteniendo una latencia aceptable para cargas moderadas.
- Optimizacion de throughput en APIs de generacion de texto: al reducir el tiempo por peticion, se puede aumentar el numero de solicitudes concurrentes que un servidor SGLang puede atender.
- Investigacion en decodificacion especulativa: este checkpoint sirve como referencia para estudiar el efecto del entrenamiento online EAGLE3 sobre el rendimiento de la decodificacion especulativa en modelos de 4B.
- Integracion en pipelines de RAG o agentes con respuestas largas: cuando el modelo base genera respuestas extensas (documentos, resumenes, codigo), el draft acelera la generacion de cada token, mejorando la experiencia de usuario en aplicaciones interactivas.
- Evaluacion comparativa de estrategias de draft: al existir 47 checkpoints de diferentes épocas y pasos, se puede analizar como evoluciona la calidad del draft a lo largo del entrenamiento y seleccionar el checkpoint optimo para un workload especifico.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica explicitamente que no se registraron metricas de evaluacion ni de seguridad para este run. No se dispone de datos de latencia, throughput ni calidad de draft en comparacion con otros checkpoints o metodos.

## Requisitos de hardware

- VRAM estimada para el draft model solo: ~0,4 GB en bfloat16 (202,7M parametros).
- VRAM total necesaria: la del modelo base `Qwen3-4B-Instruct-2507` (~8 GB en bf16) mas el draft (~0,4 GB) mas overhead de SGLang y buffers de atencion. En total, se recomienda al menos 12-16 GB de VRAM para un despliegue comodo.
- GPU recomendadas: RTX 3090/4090 (24 GB) para entornos consumer; A100 o H100 para cargas de alta concurrencia.
- Si cabe en consumer GPU: si, en tarjetas con 16 GB o mas, aunque el modelo base de 4B en bf16 ya ocupa ~8 GB, por lo que una RTX 4080 (16 GB) o similar es suficiente para pruebas.
- Opciones de despliegue: SGLang con `--speculative-algorithm EAGLE3`, `--speculative-draft-model-path` apuntando a este checkpoint, y parametros de arbol configurables (`--speculative-num-steps`, `--speculative-eagle-topk`, `--speculative-num-draft-tokens`). No se menciona compatibilidad con vLLM u otros servidores.
- Latencia y throughput: no disponibles. Los valores de arbol (num-steps, topk, num-draft-tokens) deben ser ajustados mediante benchmarking para cada workload.

## Comparativa con modelos similares

No se han encontrado modelos comparables en la informacion disponible. No existen otros draft models publicados especificamente para `Qwen3-4B-Instruct-2507` con EAGLE3 en la busqueda realizada. El modelo base `Qwen3-4B-Instruct-2507` es el unico punto de referencia, pero no es un draft model, sino el modelo objetivo que este checkpoint acelera.

## Limitaciones y advertencias

- No es un modelo autonomo: debe usarse exclusivamente como draft model junto con `Qwen/Qwen3-4B-Instruct-2507`. Usarlo de forma independiente no produce respuestas utiles.
- No se registraron metricas de evaluacion ni de seguridad: el autor advierte que no hay datos de calidad del draft ni de sesgos. No se recomienda para entornos donde se requiera garantia de comportamiento.
- Entrenado con ShareGPT limpio: el dataset es mayoritariamente ingles, lo que puede limitar la calidad del draft en otros idiomas si el modelo base genera texto en ellos.
- Longitud de contexto de entrenamiento limitada a 2048 tokens: aunque el checkpoint no usa ventana deslizante, no se garantiza un rendimiento optimo para secuencias mas largas que las vistas durante el entrenamiento.
- Dependencia de SGLang y flashinfer: el modelo esta pensado para el backend SGLang con `flashinfer`; no se proporciona soporte para otros servidores de inferencia.
- Checkpoint especifico de un run mayor: este es el checkpoint de la época 6, paso 155000, de un total de 10 épocas y 231810 pasos. Otros checkpoints de la coleccion pueden ofrecer diferente rendimiento.
- El archivo `training_state.pt` incluido en el repositorio contiene estado de optimizador y argumentos de entrenamiento; solo debe deserializarse en entornos de confianza.

## Enlaces

- Repositorio HuggingFace del checkpoint: https://huggingface.co/huluhuluu/Qwen3-4B-Instruct-2507-EAGLE3-ShareGPT-NoWindow-epoch-6-step-155000
- Checkpoint hermano (época 6, paso 155000 sin "NoWindow"): https://huggingface.co/huluhuluu/Qwen3-4B-Instruct-2507-EAGLE3-ShareGPT-epoch-6-step-155000
- Checkpoint hermano (época 2, paso 50000): https://huggingface.co/huluhuluu/Qwen3-4B-Instruct-2507-EAGLE3-ShareGPT-epoch-2-step-50000
- Modelo base Qwen3-4B-Instruct-2507 en Qualcomm AI Hub: https://aihub.qualcomm.com/models/qwen3_4b_instruct_2507
- Implementacion oficial de EAGLE para Qwen3 (GitHub): https://github.com/Yunhai-Hu/EAGLE-Qwen3
