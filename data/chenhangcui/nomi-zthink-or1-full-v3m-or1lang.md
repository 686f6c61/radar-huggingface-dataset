# Chenhangcui/nomi-zthink-or1-full-v3m-or1lang

## Resumen

nomi-zthink-or1-full-v3m-or1lang es un checkpoint de investigación publicado por Chenhangcui sobre el modelo base Qwen/Qwen3.5-4B-Base. Se trata de un ajuste fino supervisado (SFT) de todos los parámetros orientado al razonamiento matemático mediante una técnica propietaria denominada "latent reasoning" o "Nomi think", en la que el modelo genera un pensamiento interno codificado que requiere un códec específico para su decodificación. El entrenamiento se ha realizado sobre el conjunto OpenR1 (LUFFY Openr1-Math-46k-8192) completo durante 1400 pasos.

El modelo no es un lanzamiento de producción: el autor lo describe explícitamente como un "research checkpoint (public)", sin model card extensa, sin licencia declarada y sin métricas de benchmarks estándar. Su interés radica en que documenta una línea de trabajo poco habitual (razonamiento latente con códecs separados) sobre una base de 4B parámetros, con logs de validación publicados (val acc_z 0.8126, val_ce 0.1247) que permiten reproducir el protocolo de evaluación.

La relevancia práctica es limitada fuera del ámbito de investigación: requiere el códec de Chenhangcui/nomi-codecs para interpretar el "thought", no declara idiomas soportados y su licencia es desconocida, lo que impide recomendarlo para uso comercial sin aclaración previa.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Qwen3.5-4B-Base); no se detalla en la model card |
| Parametros totales | 4B (heredados del modelo base Qwen3.5-4B-Base) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible (el conjunto de entrenamiento usa secuencias de 8192 tokens) |
| Tipos de cuantizacion | no disponible (el checkpoint se distribuye como `last.pt`, no se publican versiones GGUF/AWQ/GPTQ) |
| Idiomas soportados | no disponible (el nombre del checkpoint sugiere "or1lang", sin detalle) |
| Licencia | no disponible |
| Formato de pesos | PyTorch (`last.pt`, cargado con `torch.load`); no se publican safetensors ni GGUF |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.5-4B-Base y aplica un ajuste fino supervisado de todos los parámetros (full-parameter SFT) con un objetivo de "thinking" en formato Nomi v3m. El entrenamiento se realizó con el script `scripts/train_zthink.py` sobre el dataset OpenR1 (LUFFY Openr1-Math-46k-8192), con el conjunto de datos completo y 1400 pasos. El autor menciona también `scripts/rl_dapo.py`, lo que sugiere que la pipeline contempla una fase de RL con DAPO, aunque la model card no especifica si el checkpoint publicado incorpora esa fase o solo el SFT.

La innovación principal es el razonamiento latente: el modelo no emite el pensamiento en lenguaje natural, sino en una representación codificada ("Nomi think") que necesita el códec de Chenhangcui/nomi-codecs para decodificarse. El protocolo de decodificación está congelado: temperatura 0.6, top_p 0.95, seed 0, loop guard de 256, límite de pensamiento de 12288 tokens en Nomi y 18432 en inglés, y límite de respuesta de 1024 tokens; la precisión se reporta como avg@k. No se detalla la composición exacta del dataset ni si hubo RLHF/DPO en este checkpoint concreto.

## Capacidades

- Razonamiento matemático: entrenado específicamente sobre OpenR1-Math-46k, orientado a la resolución de problemas matemáticos con cadena de pensamiento latente.
- Generación de pensamiento interno ("Nomi think"): produce una representación latente que debe decodificarse con el códec correspondiente.
- Generación de texto y respuesta final: emite una respuesta de hasta 1024 tokens tras el bloque de pensamiento.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible; el diseño de pensamiento largo (hasta 12288/18432 tokens) es compatible con razonamiento multi-paso, pero no se documenta explícitamente.
- Capacidades multilingües: no disponibles; el nombre del checkpoint sugiere una variante "or1lang" sin especificar idiomas.
- Capacidades especiales: modo thinking latente con códec externo; no se documentan visión ni audio.

## Casos de uso

- Investigación en razonamiento latente: el modelo sirve como referencia reproducible para estudiar si el pensamiento codificado supera al pensamiento en lenguaje natural en tareas matemáticas, gracias a los logs de validación publicados.
- Reproducción de experimentos de SFT sobre OpenR1: permite replicar el pipeline `train_zthink.py` con 1400 pasos y comparar curvas de validación frente a otros checkpoints.
- Evaluación de códecs de pensamiento: al requerir el códec de Chenhangcui/nomi-codecs, es útil para validar la fidelidad de decodificación y medir la degradación al traducir el pensamiento latente a texto.
- Benchmarking de matemáticas en modelos de 4B: adecuado para comparar precisión avg@k en conjuntos tipo MATH/GSM8K frente a otros fine-tunes de Qwen3.5-4B, siempre bajo el protocolo congelado.
- Estudio de estabilidad de decodificación: el loop guard de 256 y los límites de tokens permiten analizar bucles y divergencias en modelos con pensamiento largo.
- Base para experimentos de RL con DAPO: el autor incluye `rl_dapo.py`, por lo que el checkpoint puede servir como punto de partida para fases de refuerzo posteriores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible. El autor solo reporta métricas de validación interna del entrenamiento:

| Metrica | Valor |
|---|---|
| val acc_z | 0.8126 |
| val_ce | 0.1247 |
| Pasos de entrenamiento | 1400 |
| Dataset | OpenR1 (LUFFY Openr1-Math-46k-8192), completo |

## Requisitos de hardware

- VRAM estimada para inferencia: el repo ocupa 10.0 GB en `last.pt`; en FP16 se necesitan aproximadamente 8-9 GB de VRAM para los pesos, más overhead de activaciones y KV cache (no cuantificado en la información disponible).
- GPU recomendadas: no disponibles en la información proporcionada; por tamaño, una GPU con 16-24 GB (RTX 4090, A10G, L4) sería suficiente para FP16, y una A100/H100 para mayor throughput.
- Cabe en GPU de consumo: sí, previsiblemente en RTX 4090 (24 GB) y RTX 3090 (24 GB) en FP16; en GPUs de 12-16 GB requeriría cuantización, que no se publica.
- Opciones de despliegue: no se documentan; al ser un `last.pt` con pensamiento latente y códec externo, no es compatible directamente con vLLM, llama.cpp, Ollama o TGI sin conversión y adaptación del códec.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| nomi-zthink-or1-full-v3m-or1lang | 4B | no disponible | no disponible | `last.pt` | Razonamiento latente con códec externo |
| Qwen/Qwen3.5-4B-Base | 4B | no disponible en la información | no disponible en la información | safetensors (habitual) | Modelo base sin fine-tune de razonamiento |
| OpenR1 fine-tunes sobre modelos 4B | ~4B | variable | variable | safetensors/GGUF | Alternativas de razonamiento matemático en lenguaje natural |

No se dispone de datos de rendimiento comparables para establecer una comparación cuantitativa con alternativas.

## Limitaciones y advertencias

- Checkpoint de investigación: el autor lo etiqueta como "research checkpoint (public)", sin garantías de robustez para producción.
- Licencia no declarada: no se puede asumir uso comercial; es imprescindible contactar con el autor o consultar el repo del modelo base.
- Dependencia de códec externo: sin Chenhangcui/nomi-codecs el pensamiento latente no es interpretable, lo que rompe la portabilidad.
- Formato no estándar: `last.pt` cargado con `torch.load` implica riesgos de seguridad (pickle) y requiere conversión para servir con herramientas estándar.
- Idiomas no documentados: el sufijo "or1lang" no aclara el alcance multilingüe; no se garantiza un rendimiento adecuado fuera del inglés o del dominio matemático.
- Riesgo de alucinación: no evaluado; los modelos de razonamiento matemático pueden producir cadenas plausibles pero incorrectas, y el pensamiento latente dificulta la auditoría.
- Sesgos: no documentados; al entrenar sobre OpenR1-Math, puede heredar sesgos de ese corpus.
- Sin benchmarks públicos: las métricas reportadas son de validación interna y no comparables con estándares externos.
- Contexto de entrenamiento limitado a 8192 tokens: no se especifica la ventana efectiva en inferencia.

## Enlaces

- Hugging Face: https://huggingface.co/Chenhangcui/nomi-zthink-or1-full-v3m-or1lang
- Códec requerido: https://huggingface.co/Chenhangcui/nomi-codecs
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B-Base
- Dataset de entrenamiento (referencia): LUFFY Openr1-Math-46k-8192 (no se proporciona URL directa en la información disponible)
- Paper, blog o demo: no disponibles en la información proporcionada.
