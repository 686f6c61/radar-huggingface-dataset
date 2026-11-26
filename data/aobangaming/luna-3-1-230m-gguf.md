# Aobangaming/Luna-3.1-230m-GGUF

## Resumen

Luna 3.1 230m es un modelo de lenguaje de tipo transformer causal desarrollado por AobanZ (Aobangaming), pensado para conversacion y generacion de texto en ingles. Se trata de un modelo pequeno, con 228.829.440 parametros totales y aproximadamente 100 millones de parametros efectivos en el bloque transformer, segun indica el autor. La version aqui descrita es la cuantizada en GGUF del modelo base `Aobangaming/Luna-3.1-230m`.

El modelo se presenta como una evolucion de la familia Luna, con mejoras en coherencia conversacional y velocidad de respuesta. Utiliza una arquitectura denominada "Lightning" por el autor, que no es una arquitectura estandar de llama.cpp y requiere un fork especifico del runtime (Lightning.cpp) para su ejecucion. Declara una ventana de contexto de 8k tokens, lo que lo orienta a chats y roleplay de longitud media.

Su relevancia es limitada pero concreta: se trata de un modelo muy ligero, entrenado en una unica GPU RTX 3050 de 6 GB en aproximadamente media hora, lo que lo convierte en un ejemplo de modelo de bolsillo para experimentacion, prototipado rapido y despliegue en hardware muy modesto. La licencia MIT facilita su uso y modificacion, aunque su tamano y su entrenamiento acotado limitan sus capacidades frente a modelos de mayor escala.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal (denominada "Lightning" por el autor), 12 capas, RMSNorm y RoPE |
| Parametros totales | 228.829.440 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 8192 tokens (la model card menciona 8k y 8126 de forma inconsistente) |
| Tipos de cuantizacion | GGUF (el repo incluye pesos cuantizados; no se detallan los niveles exactos) |
| Idiomas soportados | Ingles (en) |
| Licencia | MIT |
| Formato de pesos | GGUF (repo); el modelo base en formato transformers/safetensors |
| Dimension oculta (d_model) | 768 |
| Cabezas de atencion | 12 (Multi-Head Attention) |
| Vocabulario | ~100k tokens |
| Precision de entrenamiento | BF16 |

## Arquitectura y entrenamiento

Luna 3.1 emplea un transformer causal de 12 capas con estado oculto de 768 dimensiones y 12 cabezas de atencion multi-cabeza (MHA). Incorpora RMSNorm y RoPE, que el autor senala como las unicas modificaciones respecto a la generacion anterior de la arquitectura Lightning. El modelo usa una ventana de contexto de aproximadamente 8k tokens y un vocabulario de unos 100k tokens.

El entrenamiento se realizo mediante SFT (supervised fine-tuning) con la libreria TRL, sobre el dataset Capybara (`trl-lib/Capybara`), aunque la model card menciona tambien un subconjunto de OASST. Los hiperparametros declarados son AdamW, learning rate 2e-5, batch size 17 y precision BF16, con FlashAttention/SDPA. El entrenamiento completo se ejecuto en una RTX 3050 de 6 GB en aproximadamente 0,5 horas. No se documentan fases de RLHF o DPO, ni el numero total de tokens de entrenamiento.

## Capacidades

- Generacion de texto y conversacion multi-turno en ingles.
- Respuestas rapidas: el autor declara una velocidad de generacion de aproximadamente 130 tokens por segundo.
- Soporte para roleplay y conversaciones de longitud media gracias a su contexto de 8k tokens.
- Capacidad de ajuste fino adicional por parte del usuario (el autor lo recomienda explicitamente).
- Soporte de ejecucion con llama.cpp mediante el fork Lightning.cpp.
- No se documenta soporte de tool calling, function calling, agentes, vision, audio ni modo de razonamiento explicito.
- Capacidades multilingues limitadas al ingles.

## Casos de uso

- Prototipado rapido de chatbots: al ser un modelo de 230M parametros, permite iterar sobre prompts y flujos conversacionales en hardware de gama baja antes de migrar a modelos mayores.
- Experimentacion academica y docente: sirve para ilustrar el ciclo completo de fine-tuning con TRL y SFT en una unica GPU consumer.
- Despliegue en dispositivos con recursos muy limitados: su tamano reducido y su version GGUF permiten ejecucion en entornos con poca VRAM o incluso en CPU.
- Generacion de texto para tareas auxiliares: borradores, respuestas cortas o completado de texto en aplicaciones donde la latencia importa mas que la calidad maxima.
- Roleplay y entretenimiento conversacional: el contexto de 8k tokens y el entrenamiento sobre Capybara lo orientan a dialogos extendidos de caracter informal.
- Base para fine-tuning especifico de dominio: al tener licencia MIT, puede reentrenarse sobre datos propios para nichos concretos (soporte interno, asistentes de documentacion sencilla).
- Evaluacion de arquitecturas experimentales: util para investigadores que quieran comparar la arquitectura Lightning frente a transformers estandar en tareas pequenas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo declara una velocidad de generacion de aproximadamente 130 tokens por segundo, sin especificar el hardware exacto ni las condiciones de medida.

## Requisitos de hardware

- VRAM estimada para inferencia: en torno a 0,5 GB en cuantizacion de 4 bits y menos de 1 GB en FP16 para los pesos; el repo GGUF ocupa 0,9 GB.
- GPU recomendadas: cualquier GPU consumer moderna es suficiente; el propio autor entreno el modelo en una RTX 3050 de 6 GB.
- Cabe en GPU consumer: si, en practicamente cualquier GPU con 4 GB o mas de VRAM, e incluso en CPU.
- Opciones de despliegue: llama.cpp mediante el fork Lightning.cpp (obligatorio, ya que llama.cpp estandar falla con `unknown model architecture: 'lightning'`); el modelo base puede ejecutarse con transformers y text-generation-inference.
- Latencia y throughput: aproximadamente 130 tokens por segundo segun el autor, sin especificar hardware ni cuantizacion.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Luna 3.1 230m | 228,8M | 8k | MIT | Arquitectura Lightning propietaria; requiere Lightning.cpp |
| SmolLM2-135M | 135M | 8k | Apache 2.0 | Compatible con llama.cpp estandar; ecosistema amplio |
| Qwen2.5-0.5B | 494M | 32k | Apache 2.0 | Mayor contexto y soporte multilingue; requiere mas recursos |
| TinyLlama-1.1B | 1,1B | 2k | Apache 2.0 | Mayor capacidad pero contexto menor y mas VRAM |

La comparativa se basa en caracteristicas publicas de cada familia; no se dispone de resultados de benchmarks de Luna 3.1 para comparar rendimiento real.

## Limitaciones y advertencias

- Modelo entrenado exclusivamente en ingles; no se garantiza un comportamiento correcto en castellano u otros idiomas.
- Riesgo elevado de alucinacion, respuestas incompletas, repetitivas o irrelevantes, tal como advierte el propio autor.
- Entrenamiento muy acotado (0,5 horas en una RTX 3050, batch size 17), lo que limita la cobertura y calidad del modelo.
- La arquitectura Lightning no es compatible con llama.cpp estandar; requiere el fork Lightning.cpp, lo que reduce la portabilidad y el soporte de la comunidad.
- Inconsistencias en la model card: se menciona un contexto de 8k y de 8126 tokens de forma intercambiable, y se citan dos datasets de entrenamiento distintos (Capybara y OASST).
- El enlace al repositorio de la model card apunta a `luna-2-70m`, no al modelo actual, lo que puede confundir a los usuarios.
- Aunque la licencia es MIT y permite uso comercial, la calidad del modelo no es adecuada para produccion sin guardrails y evaluacion previa.
- No se documentan sesgos especificos, pero al entrenarse sobre Capybara y OASST puede heredar sesgos de esos datasets.
- El snippet de uso de la model card contiene `model="None"`, por lo que no es directamente ejecutable.

## Enlaces

- Hugging Face (GGUF): https://huggingface.co/Aobangaming/Luna-3.1-230m-GGUF
- Modelo base: https://huggingface.co/Aobangaming/Luna-3.1-230m
- Repositorio citado en la model card: https://huggingface.co/Aobangaming/luna-2-70m
- Lightning.cpp (fork de llama.cpp): https://github.com/AobanZu/lightning.cpp
- Web del autor: https://aobanweb.com
- Discord del proyecto: https://discord.gg/Ty775Ut26a
- Dataset Capybara: https://huggingface.co/datasets/trl-lib/Capybara
- Dataset OASST1: https://huggingface.co/datasets/OpenAssistant/oasst1
- TRL: https://github.com/huggingface/trl
