# moltherm1/olmo-mirror-olmo-3-7b-rl-zero-code

## Resumen

Olmo 3 7B RL-Zero Code es un modelo de lenguaje de 7.298.011.136 parámetros desarrollado por el Allen Institute for AI (Ai2) y distribuido en el Hub por el usuario `moltherm1` como espejo de `allenai/Olmo-3-7B-RLZero-Code`. Se trata de un ajuste fino por aprendizaje por refuerzo con verificación (RLVR) sobre el modelo base `allenai/Olmo-3-1025-7B`, especializado en tareas de generación y razonamiento de código mediante cadenas de pensamiento largas. Forma parte de la familia experimental RL-Zero, creada específicamente para la exploración científica del entrenamiento RLVR con recompensas verificables.

El modelo pertenece a la familia Olmo 3, que Ai2 publica con el objetivo declarado de habilitar la ciencia de los modelos de lenguaje: código, checkpoints, logs y detalles de entrenamiento completos y abiertos. La variante Code se entrena sobre el dataset `allenai/Dolci-RLZero-Code-7B` y está pensada para escenarios donde el razonamiento paso a paso antes de emitir código mejora la corrección del resultado final.

Es relevante ahora porque ofrece un punto de partida reproducible y con licencia Apache 2.0 para investigar RLVR en el dominio del código, sin depender de pesos cerrados. Su tamaño de 7B lo hace desplegable en hardware de gama alta de consumo, y su integración con `transformers` (versión 4.57.0 o superior) facilita la experimentación. Existe una versión posterior recomendada por el propio autor: `allenai/Olmo-3.1-7B-RL-Zero-Code`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer autorregresivo (estilo decoder-only) |
| Parametros totales | 7.298.011.136 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 8 bits vía bitsandbytes (mencionado en la model card); otras cuantizaciones no disponibles |
| Idiomas soportados | inglés (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un transformer autorregresivo de estilo decoder-only, según la descripción de la model card. Se construye sobre el checkpoint base `allenai/Olmo-3-1025-7B`, preentrenado sobre el corpus Dolma 3, y se postentrena sobre los datasets Dolci. La variante RL-Zero Code aplica entrenamiento RLVR (reinforcement learning with verifiable rewards) usando el dataset `allenai/Dolci-RLZero-Code-7B`, un conjunto de problemas de código con recompensas verificables automáticamente.

La familia Olmo 3 incluye variantes Instruct y Think en tamaños de 7B y 32B, y el pipeline completo de postentrenamiento pasa por SFT, DPO y RLVR final. La rama RL-Zero es explícitamente experimental y está orientada a la investigación del entrenamiento RLVR, no a un producto final. La model card indica que el modelo fomenta cadenas de pensamiento largas para mejorar tareas de razonamiento como matemáticas y programación. No se detallan en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset ni innovaciones técnicas adicionales como decodificación especulativa o atención lineal.

## Capacidades

- Generación de texto y razonamiento autorregresivo en inglés.
- Razonamiento de código con cadenas de pensamiento largas (long chain-of-thought) antes de producir la solución.
- Resolución de problemas de programación con recompensas verificables, adecuado para experimentación en RLVR.
- Generación y finalización de código en el contexto de tareas tipo benchmark de programación.
- Conversación multi-turno (pipeline `text-generation` con tag `conversational`).
- Integración con la librería `transformers` (>= 4.57.0) y compatibilidad con endpoints.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible de forma explícita más allá del razonamiento largo.
- Capacidades multilingües: limitadas al inglés según la model card.
- Capacidades de visión o audio: no disponibles.

## Casos de uso

- Investigación en RLVR: el modelo sirve como referencia reproducible para estudiar cómo las recompensas verificables sobre código afectan al comportamiento del modelo, usando el dataset Dolci-RLZero-Code-7B y el repositorio open-instruct.
- Generación de código con razonamiento explícito: en tareas donde se requiere justificar la solución (por ejemplo, ejercicios de programación o revisión de algoritmos), el modelo emite una cadena de pensamiento antes del código final.
- Evaluación comparativa de postentrenamiento: al compartir base con las variantes RLZero-Math, RLZero-IF y RLZero-General, permite aislar el efecto del dominio de entrenamiento en el rendimiento.
- Reproducción de experimentos académicos: con pesos safetensors y licencia Apache 2.0, se puede cargar en `transformers` y ejecutar en pipelines de investigación sin restricciones de uso comercial.
- Fine-tuning posterior: la model card documenta el ajuste con `open-instruct` y el script `rlvr_script.sh`, lo que permite adaptar el modelo a dominios de código específicos partiendo del checkpoint final o del base.
- Prototipado de asistentes de programación en inglés: para entornos de desarrollo donde se quiere un modelo pequeño (7B) desplegable en una sola GPU y con comportamiento de razonamiento paso a paso.
- Docencia y formación: por su licencia permisiva y su naturaleza abierta, es adecuado para cursos sobre entrenamiento con RL y modelos de lenguaje.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16/bf16: aproximadamente 14,6 GB solo para pesos, más overhead de activaciones y caché KV; en la práctica se recomienda 16-24 GB.
- Cuantización en 8 bits (bitsandbytes, documentada en la model card): reduce los pesos a unos 7,3 GB, permitiendo su uso en GPUs de 12-16 GB.
- GPU recomendadas: A100 40/80 GB, H100 para despliegue de alta concurrencia; RTX 4090 (24 GB) para fp16 con margen; RTX 3090 (24 GB) igualmente viable.
- Cabe en GPU de consumo: sí, en RTX 4090, RTX 3090 y, con cuantización de 8 bits, en GPUs de 12-16 GB como la RTX 4080 o la RTX 4070 Ti Super.
- Opciones de despliegue: `transformers` (soporte oficial), vLLM, TGI, llama.cpp y Ollama si se generan pesos GGUF (no se confirma su disponibilidad en la información proporcionada).
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Especialidad | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Olmo 3 7B RL-Zero Code (este) | 7,3B | no disponible | Código con RLVR | Apache 2.0 | Hugging Face |
| Olmo-3-7B-RLZero-Math | 7,3B (base compartida) | no disponible | Matemáticas con RLVR | Apache 2.0 | Hugging Face (`allenai`) |
| Olmo-3-7B-RLZero-General | 7,3B (base compartida) | no disponible | Propósito general con RLVR | Apache 2.0 | Hugging Face (`allenai`) |
| Olmo-3-7B-Think | 7,3B (base compartida) | no disponible | Razonamiento final (SFT+DPO+RLVR) | Apache 2.0 | Hugging Face (`allenai`) |

Las cuatro variantes comparten el modelo base `allenai/Olmo-3-1025-7B`, por lo que la comparación directa aísla el efecto del dataset de RLVR. No se dispone de datos de rendimiento comparado en la información proporcionada.

## Limitaciones y advertencias

- Modelo experimental: la propia model card lo describe como parte de una familia experimental para exploración científica de RLVR, no como un modelo listo para producción.
- Solo inglés: el soporte multilingüe no está contemplado.
- Riesgo de alucinación: inherente a los modelos generativos; las cadenas de pensamiento largas pueden producir razonamientos plausibles pero incorrectos.
- Sesgos: no se documentan análisis de sesgo en la información disponible; al entrenarse sobre Dolma 3 y Dolci, puede heredar sesgos de esos corpus.
- Longitud de contexto no especificada: no se puede garantizar el comportamiento en conversaciones o ficheros de código muy largos.
- Licencia Apache 2.0: permite uso comercial, pero Ai2 solicita el cumplimiento de sus Responsible Use Guidelines.
- Existe una versión posterior recomendada (`allenai/Olmo-3.1-7B-RL-Zero-Code`); esta variante puede quedar obsoleta para nuevos desarrollos.
- El repositorio es un espejo de un tercero (`moltherm1`) con 0 descargas y 0 likes; para uso serio conviene referenciar el repositorio original de `allenai`.
- No se documentan en la información disponible el soporte de tool calling ni el comportamiento en modo agente.

## Enlaces

- Modelo en Hugging Face (espejo): https://huggingface.co/moltherm1/olmo-mirror-olmo-3-7b-rl-zero-code
- Modelo original: https://huggingface.co/allenai/Olmo-3-7B-RLZero-Code
- Modelo base: https://huggingface.co/allenai/Olmo-3-1025-7B
- Dataset de entrenamiento: https://huggingface.co/datasets/allenai/Dolci-RLZero-Code-7B
- Versión posterior recomendada: https://huggingface.co/allenai/Olmo-3.1-7B-RL-Zero-Code
- Repositorio de fine-tuning open-instruct: https://github.com/allenai/open-instruct
- Guía de uso responsable de Ai2: https://allenai.org/responsible-use
- Paper referenciado (arXiv:2512.13961): https://arxiv.org/abs/2512.13961
- Contacto técnico: olmo@allenai.org
