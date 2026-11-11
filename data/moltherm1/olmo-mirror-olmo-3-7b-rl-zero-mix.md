# moltherm1/olmo-mirror-olmo-3-7b-rl-zero-mix

## Resumen

Olmo 3 7B RL-Zero Mix es un modelo de lenguaje de 7.000 millones de parametros desarrollado por el Allen Institute for AI (Ai2), publicado originalmente como `allenai/Olmo-3-7B-RLZero-Mix` y replicado en este repositorio espejo por el usuario `moltherm1`. Forma parte de la familia experimental RL-Zero de Olmo 3, un conjunto de modelos disenado para la exploracion cientifica del entrenamiento con RLVR (Reinforcement Learning with Verifiable Rewards). El modelo parte del checkpoint base `allenai/Olmo-3-1025-7B` y se post-entrena sobre el dataset `allenai/Dolci-RLZero-Mix-7B`, una mezcla de dominios de matematicas, codigo, instruction following y tareas generales.

La familia Olmo 3 incluye variantes de 7B y 32B en formatos Instruct y Think, con cadenas de razonamiento largas que mejoran tareas de matematicas y programacion. Olmo se disena explicitamente para habilitar la ciencia de los modelos de lenguaje: se liberan codigo, checkpoints, logs y detalles de entrenamiento, lo que lo convierte en una referencia para investigacion reproducible en abierto.

El modelo es relevante ahora porque ofrece una ventana poco habitual al proceso de RLVR en abierto: la variante Mix combina varios dominios verificables en un unico post-entrenamiento, permitiendo estudiar transferencia entre tareas y sinergias entre recompensas verificables. Su licencia Apache 2.0 y su compatibilidad con `transformers` 4.57.0 o superior facilitan su uso tanto en investigacion como en prototipado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer autoregresivo (estilo decoder-only) |
| Parametros totales | 7.000 millones (7B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 8 bits via bitsandbytes (mencionado en la model card); otras cuantizaciones no disponibles |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (formato estandar de `transformers`; no se detalla en la informacion disponible) |

## Arquitectura y entrenamiento

El modelo es un transformer autoregresivo de tipo decoder-only con 7.000 millones de parametros, derivado del checkpoint base `allenai/Olmo-3-1025-7B`. Sobre esa base se aplica un post-entrenamiento con RLVR (Reinforcement Learning with Verifiable Rewards) utilizando el dataset `allenai/Dolci-RLZero-Mix-7B`, una mezcla de dominios verificables que en la familia RL-Zero se desglosa en matematicas, codigo, instruction following y tareas generales. La model card no detalla el numero de tokens de entrenamiento, la composicion exacta de la mezcla ni los hiperparametros del proceso de RL.

La innovacion tecnica principal es el propio enfoque RL-Zero: un conjunto experimental pensado para la exploracion cientifica del RLVR, con todas las piezas (dataset, receta de entrenamiento, script de RLVR en el repositorio `open-instruct`) publicadas en abierto. La familia Olmo 3 en su conjunto se pre-entrena sobre Dolma 3 y se post-entrena sobre los datasets Dolci; las variantes Think emplean cadenas de razonamiento largas para mejorar matematicas y codigo. No se dispone de informacion sobre el uso de decodificacion especulativa, atencion lineal u otras optimizaciones de inferencia en este checkpoint concreto.

## Capacidades

- Generacion de texto autoregresiva en ingles.
- Razonamiento potenciado por RLVR en dominios con recompensas verificables: matematicas, codigo, instruction following y tareas generales (mezcla de la variante Mix).
- Cadenas de razonamiento largas (la familia Olmo 3 Think se disena explicitamente para mejorar matematicas y codigo).
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible de forma explicita; el razonamiento multi-paso esta implicito en las cadenas de pensamiento.
- Capacidades multilingues: limitadas al ingles segun la model card.
- Capacidades de vision o audio: no disponibles.
- Fine-tuning reproducible con el repositorio `open-instruct` (script `rlvr_script.sh`).
- Cuantizacion a 8 bits con bitsandbytes para reducir requisitos de memoria.

## Casos de uso

- Investigacion en RLVR: el modelo sirve como sujeto experimental para estudiar como las recompensas verificables afectan al comportamiento en distintos dominios, comparando la variante Mix con las variantes especificas (Math, Code, IF, General) publicadas por Ai2.
- Reproduccion de experimentos de post-entrenamiento: gracias a la publicacion del dataset Dolci-RLZero-Mix-7B y del repositorio `open-instruct`, un equipo puede reentrenar o modificar la receta RLVR y contrastar resultados contra este checkpoint.
- Generacion de codigo asistida: el componente de codigo del mix RLVR permite usar el modelo para autocompletar funciones, generar tests o resolver problemas de programacion en ingles, con cuantizacion a 8 bits para desplegarlo en una unica GPU.
- Razonamiento matematico en entornos educativos o de evaluacion: las cadenas de razonamiento largas de la familia Think son adecuadas para resolver problemas paso a paso y para generar explicaciones detalladas de la solucion.
- Baseline para comparativas de modelos abiertos: al ser Apache 2.0 y estar disponible en `transformers`, se puede integrar como referencia en evaluaciones internas de modelos de 7B en tareas de matematicas, codigo e instruction following.
- Prototipado de asistentes conversacionales en ingles: el pipeline `text-generation` y el tag `conversational` permiten usarlo como base para demos de chatbot de dominio general, siempre que el alcance se limite a ingles.
- Estudio de transferencia entre dominios: la mezcla Mix permite analizar si el entrenamiento conjunto en matematicas, codigo e IF produce sinergias o interferencias frente a los modelos especializados de la misma familia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16/BF16: aproximadamente 14-16 GB solo para los pesos, mas memoria para el KV cache y activaciones; en la practica se recomienda reservar 18-24 GB.
- VRAM estimada con cuantizacion de 8 bits (bitsandbytes): aproximadamente 7-8 GB para los pesos, con margen adicional para el contexto.
- GPU recomendadas: A100 (40/80 GB) o H100 para entrenamiento y fine-tuning; para inferencia en FP16 basta una RTX 4090 (24 GB) o una A6000 (48 GB).
- Cabe en GPU de consumo: si, en una RTX 4090 (24 GB) en FP16 o en GPUs con 12-16 GB usando cuantizacion de 8 bits; en GPUs de 8 GB no cabe sin cuantizaciones mas agresivas, no documentadas en la model card.
- Opciones de despliegue: `transformers` (>= 4.57.0) con `AutoModelForCausalLM`; cuantizacion con bitsandbytes; el resto de opciones (vLLM, llama.cpp, Ollama, TGI) no estan documentadas en la informacion disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Post-entrenamiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Olmo 3 7B RL-Zero Mix (este) | 7B | no disponible | RLVR sobre mezcla de dominios | Apache 2.0 | Hugging Face (espejo de `allenai/Olmo-3-7B-RLZero-Mix`) |
| Olmo-3-7B-RLZero-Math | 7B | no disponible | RLVR solo en matematicas | Apache 2.0 | Hugging Face (Ai2) |
| Olmo-3-7B-RLZero-Code | 7B | no disponible | RLVR solo en codigo | Apache 2.0 | Hugging Face (Ai2) |
| Olmo-3-7B-Think | 7B | no disponible | SFT + DPO + RLVR con cadenas de razonamiento | Apache 2.0 | Hugging Face (Ai2) |

La comparativa se limita a la propia familia Olmo 3 porque la informacion disponible no incluye datos de rendimiento que permitan contrastar con modelos de otros desarrolladores. No se dispone de resultados de benchmarks para ninguna de las variantes en la informacion proporcionada.

## Limitaciones y advertencias

- Modelo experimental: la familia RL-Zero se describe como un conjunto experimental para exploracion cientifica del RLVR, no como un modelo listo para produccion.
- Solo ingles: la model card declara unicamente el idioma ingles, sin capacidades multilingues documentadas.
- Riesgo de alucinacion: no se documentan evaluaciones de fidelidad ni tasas de alucinacion; al ser un modelo de 7B post-entrenado con RLVR, es esperable que genere contenido incorrecto con seguridad aparente, especialmente fuera de los dominios verificables.
- Sesgos: no se publica informacion sobre evaluaciones de sesgo en la model card; el pre-entrenamiento sobre Dolma 3 y el post-entrenamiento sobre Dolci pueden heredar sesgos de esos corpus.
- Licencia: Apache 2.0 permite uso comercial, pero Ai2 remite a sus Responsible Use Guidelines, que deben revisarse antes de un despliegue en produccion.
- Longitud de contexto no documentada: no se puede planificar el uso en tareas de contexto largo sin verificar experimentalmente el limite efectivo.
- Repositorio espejo: este repositorio (`moltherm1/olmo-mirror-olmo-3-7b-rl-zero-mix`) tiene 0 descargas y 0 likes; para uso en produccion conviene referenciar el repositorio oficial de Ai2.
- Compatibilidad: requiere `transformers` 4.57.0 o superior; la cuantizacion con bitsandbytes puede ser sensible a tipos de datos y operaciones CUDA, segun advierte la propia model card.
- Sin benchmarks publicados en la informacion disponible: no es posible validar el rendimiento frente a alternativas sin ejecutar evaluaciones propias.

## Enlaces

- Repositorio Hugging Face (espejo): https://huggingface.co/moltherm1/olmo-mirror-olmo-3-7b-rl-zero-mix
- Modelo original en Ai2: https://huggingface.co/allenai/Olmo-3-7B-RL-Zero-Mix/
- Modelo base: https://huggingface.co/allenai/Olmo-3-1025-7B
- Dataset de entrenamiento: https://huggingface.co/datasets/allenai/Dolci-RLZero-Mix-7B
- Variante Math: https://huggingface.co/allenai/Olmo-3-7B-RLZero-Math/
- Variante Code: https://huggingface.co/allenai/Olmo-3-7B-RLZero-Code/
- Variante IF: https://huggingface.co/allenai/Olmo-3-7B-RLZero-IF/
- Variante General: https://huggingface.co/allenai/Olmo-3-7B-RLZero-General/
- Repositorio de fine-tuning open-instruct: https://github.com/allenai/open-instruct
- Guia de uso responsable de Ai2: https://allenai.org/responsible-use
- Contacto tecnico: olmo@allenai.org
