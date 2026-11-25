# fhyfhy/HRM-Text-checkpoints

## Resumen
HRM-Text L (0.6B) reproduction + recurrent baselines es un repositorio de checkpoints de entrenamiento en bruto publicado por el usuario fhyfhy en Hugging Face. No es un modelo oficial, sino una reproducción independiente del run de referencia de tamano L (unos 0,69 mil millones de parametros) del modelo HRM-Text de Sapient (arXiv:2605.20613), junto con una serie de ablaciones con el mismo numero de parametros entrenadas sobre un flujo de datos identico bit a bit. El objetivo es permitir el estudio y la comparacion de arquitecturas recurrentes frente a un transformer convencional bajo condiciones controladas.

La arquitectura se basa en el Hierarchical Reasoning Model (HRM), con un modulo lento "H" y uno rapido "L" iterados de forma recurrente, empaquetado PrefixLM, FlashAttention 3 y FSDP2. El repositorio incluye los pesos completos en fp32, estados del optimizador AdamATan2, pesos EMA, instantaneas de configuracion, codigo fuente y resultados de evaluacion para diez runs, ademas de un tokenizer BPE de 65.536 tokens. Su relevancia actual radica en que ofrece material reproducible para investigar el entrenamiento mas alla del escalado, con una reproduccion que se desvia unos 0,5 puntos porcentuales de la media oficial en ocho benchmarks.

El repositorio ocupa 142,5 GB y esta pensado para investigadores que quieran reanudar el entrenamiento, auditar los baselines o analizar el comportamiento de arquitecturas con recurrencia compartida. No incluye pipeline declarado ni idiomas especificados, y su licencia es Apache 2.0.

## Especificaciones tecnicas
| Parametro | Valor |
|---|---|
| Arquitectura | Hierarchical Reasoning Model (HRM): modulo H lento (12 capas) y modulo L rapido (12 capas) iterados recurrentemente; transformer con SwiGLU, RMSNorm pre-norm y RoPE theta 1e4 |
| Parametros totales | 694.682.880 (run HRM de referencia); entre 694.681.600 y 697.958.400 segun la ablacion |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 4096 tokens (longitud maxima de secuencia) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponibles |
| Licencia | apache-2.0 |
| Formato de pesos | checkpoints FSDP2 en PyTorch (pesos fp32, estados AdamATan2 y EMA); no se indica GGUF ni safetensors |

## Arquitectura y entrenamiento
El modelo sigue la arquitectura HRM: un modulo H de 12 capas y un modulo L de 12 capas que se iteran de forma recurrente con `H_cycles=2` y `L_cycles=3`. Cada capa usa atencion con FlashAttention 3, SwiGLU con expansion 4, RMSNorm pre-norm, RoPE con theta 1e4, inicializacion `lecun_normal` y embeddings de entrada y cabeza de salida no atados de 65.536 tokens. El entrenamiento emplea PrefixLM con perdida solo sobre los tokens de respuesta (`target_only=true`), empaquetado de secuencias y FSDP2 sobre 4 nodos de 8 H100 de 80 GB (world size 32).

Los datos provienen de `sapientinc/HRM-Text-data-io-cleaned-20260515`, un conjunto de QA de estilo instruccion generado con `sapientinc/data_io`. Todos los runs comparten el mismo flujo de datos y hiperparametros: optimizador AdamATan2 (betas 0,9/0,95, weight decay 0,1), LR pico 2,5e-4 con 2.000 pasos de warmup lineal y LR constante despues, EMA 0,9999, bf16 en forward/backward con pesos maestros fp32, batch global de 172.032 tokens por paso, semilla 0 y 4 epocas (348.257 pasos, unos 59,9 mil millones de tokens en total). La innovacion destacable es el esquema de retropropagacion truncada: el run `L-4n-repro` calienta `bp_steps` de 2 a 5 durante el primer 20 % de pasos, mientras que `hrm-fullbp-L-4n` pasa por fases de 2, 3, 4, 5 y 8 segmentos hasta aplicar retropropagacion completa desde el paso ~69.652. Las ablaciones incluyen transformer plano, Universal Transformer, gated-loop, soft-CoT loop y variantes con compuertas fijas.

## Capacidades
- Generacion de texto y respuesta a instrucciones en estilo QA, entrenado sobre datos de instruccion.
- Razonamiento iterativo mediante recurrencia entre los modulos H y L, con ciclos multiples por token.
- Razonamiento multi-paso implicito a traves de los ciclos recurrentes y, en las variantes soft-CoT, de un canal de cadena de pensamiento suave.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes: no disponible.
- Capacidades multilingues: no disponibles (no se especifican idiomas).
- Capacidades especiales: modo de razonamiento recurrente con retropropagacion truncada o completa; variantes con compuertas aprendidas por ciclo y por token; lectura softmax top-128 en el canal soft-CoT.

## Casos de uso
- Investigacion sobre escalado eficiente: comparar el run HRM con el transformer plano, el Universal Transformer y el gated-loop bajo datos e hiperparametros identicos para aislar el efecto de la recurrencia.
- Reanudacion de entrenamiento: los checkpoints incluyen estados del optimizador y pesos EMA, lo que permite continuar runs desde cualquier epoca con las mismas condiciones.
- Auditoria de reproducibilidad: verificar la desviacion de ~0,5 pp frente a los ocho benchmarks oficiales de HRM-Text y analizar las causas.
- Estudio de retropropagacion truncada: comparar `L-4n-repro` (bp 2 a 5) con `hrm-fullbp-L-4n` (hasta 8 segmentos) para medir el impacto del gradiente completo en la calidad final.
- Analisis de canales soft-CoT: usar las variantes `loop-cot-v2`, `loop-cot-b1`, `loop-cot` y `loop-cot-a011` para estudiar el efecto de las compuertas alfa y beta en el razonamiento.
- Desarrollo de tecnicas de decodificacion y evaluacion: emplear el codigo de `code/` y el tokenizer de 65.536 tokens para reproducir la evaluacion en ocho benchmarks y probar variantes.
- Formacion y docencia: servir de ejemplo practico de entrenamiento distribuido con FSDP2, FlashAttention 3 y AdamATan2 sobre 32 GPUs H100.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks detallados en la informacion disponible. La model card indica unicamente que la reproduccion HRM en la epoca 4 se desvia aproximadamente 0,5 puntos porcentuales de la media oficial en ocho benchmarks, sin especificar cuales ni los valores concretos.

## Requisitos de hardware
- VRAM estimada para inferencia: no disponible; el repositorio almacena pesos fp32 y estados del optimizador, por lo que la carga completa de un checkpoint supera con creces la de un modelo de 0,69B en bf16.
- GPU recomendadas: H100 de 80 GB para entrenamiento (4 nodos x 8 GPUs, world size 32); para inferencia se requiere al menos una GPU con memoria suficiente para pesos fp32 y buffers de atencion a 4096 tokens.
- Cabe en GPU consumer: no disponible; no se han publicado pesos cuantizados ni formatos ligeros.
- Opciones de despliegue: el codigo de `code/` usa PyTorch con FSDP2; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares
| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| HRM-Text L reproduction (este repo) | ~0,69B | 4096 | Apache 2.0 | Checkpoints de entrenamiento en HF |
| sapientinc/HRM-Text-1B (oficial) | ~1B | no disponible | no disponible | Modelo oficial en HF |
| Transformer plano `transformer-L-4n` (misma reproduccion) | 694.681.600 | 4096 | Apache 2.0 | Incluido en este repo |
| Universal Transformer `ut-L-4n` (misma reproduccion) | 694.682.880 | 4096 | Apache 2.0 | Incluido en este repo |

## Limitaciones y advertencias
- No es el modelo oficial: se trata de una reproduccion independiente y los checkpoints son de entrenamiento en bruto, no un artefacto listo para produccion.
- La reproduccion se desvia unos 0,5 pp de la media oficial en ocho benchmarks, por lo que los resultados no son identicos a los de Sapient.
- Los runs `loop-cot-L-4n` y `loop-cot-a011-L-4n` se detuvieron en el paso 195.000 (epoca 3), por lo que no completaron las 4 epocas.
- El run `loop-cot-b1-L-4n` y las variantes `loop-cot` presentan un cableado erroneo de la lectura soft-CoT (decodificacion a traves del embedding de entrada), lo que invalida su uso como referencia de calidad.
- El repositorio incluye un smoke test (`HRM-Text-smoke/smoke-gated-loop`) que no es un modelo util.
- No se especifican idiomas soportados, sesgos conocidos ni tasas de alucinacion; al estar entrenado sobre datos QA sinteticos, el riesgo de alucinacion en dominios abiertos es alto.
- No hay informacion sobre cuantizacion, por lo que el despliegue eficiente en hardware consumer no esta documentado.
- La licencia Apache 2.0 permite uso comercial, pero el modelo base y los datos subyacentes pueden tener condiciones adicionales no detalladas.

## Enlaces
- Repositorio en Hugging Face: https://huggingface.co/fhyfhy/HRM-Text-checkpoints
- Paper HRM-Text: Efficient Pretraining Beyond Scaling: https://arxiv.org/abs/2605.20613
- Repositorio oficial HRM-Text: https://github.com/sapientinc/HRM-Text
- Modelo oficial HRM-Text-1B: https://huggingface.co/sapientinc/HRM-Text-1B
- Repositorio de datos sapientinc/data_io: https://github.com/sapientinc/data_io
- Dataset de entrenamiento: https://huggingface.co/datasets/sapientinc/HRM-Text-data-io-cleaned-20260515
