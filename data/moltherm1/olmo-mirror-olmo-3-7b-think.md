# moltherm1/olmo-mirror-olmo-3-7b-think

## Resumen

Olmo 3 7B Think es un modelo de lenguaje autoregresivo de tipo transformer desarrollado por el Allen Institute for AI (Ai2), perteneciente a la familia Olmo 3, que incluye variantes de 7B y 32B en versiones Instruct y Think. Este checkpoint concreto es un espejo alojado por el usuario `moltherm1` del modelo `allenai/Olmo-3-7B-Think-DPO`, es decir, la etapa intermedia de post-entrenamiento (DPO) previa al ajuste final con RLVR. El modelo está diseñado para generar cadenas de razonamiento largas (long chain-of-thought) con el objetivo de mejorar tareas de razonamiento matemático y de código.

La familia Olmo se caracteriza por ser completamente abierta: se publican los pesos, el código de entrenamiento, los checkpoints intermedios y los detalles del dataset (Dolma 3 para pre-entrenamiento y Dolci para post-entrenamiento). Esto la convierte en una referencia para investigación reproducible en modelos de lenguaje. El modelo tiene 7B parámetros, soporta únicamente inglés y se distribuye bajo licencia Apache 2.0.

Este espejo concreto tiene 0 descargas y 0 likes en el momento de la consulta, y su relevancia radica en que permite acceder a la etapa DPO del modelo Think sin depender del repositorio oficial, aunque para uso en producción se recomienda encarecidamente utilizar el checkpoint final `allenai/Olmo-3-7B-Think` publicado por Ai2.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer autoregresivo (estilo decoder-only) |
| Parametros totales | 7B (aproximado, segun denominacion del modelo) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 8-bit via bitsandbytes (mencionado en la model card); fp16; no se detallan otras |
| Idiomas soportados | Ingles |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (formato estandar de transformers; tamano del repo 5.0 GB) |

## Arquitectura y entrenamiento

El modelo es un transformer autoregresivo decoder-only, entrenado en varias etapas segun la convencion de la familia Olmo 3: pre-entrenamiento sobre el dataset Dolma 3, seguido de SFT, DPO y finalmente RLVR (Reinforcement Learning with Verifiable Rewards) en el checkpoint final. Este espejo corresponde a la etapa DPO, es decir, `allenai/Olmo-3-7B-Think-DPO`, y se ha post-entrenado sobre el dataset `allenai/Dolci-Think-RL-7B`. La model card oficial indica que el modelo final se obtiene tras aplicar RLVR sobre el checkpoint DPO.

La innovacion principal de la variante Think es el uso de cadenas de razonamiento largas delimitadas por las etiquetas ``, que el modelo genera antes de producir la respuesta final. El chat template utiliza tokens especiales estilo ChatML (`<|im_start|>`, `<|im_end|>`) y un system prompt por defecto que identifica al modelo como Olmo de Ai2 con fecha de corte en diciembre de 2024. No se detallan en la informacion disponible el numero exacto de tokens de entrenamiento, la composicion completa del dataset ni si se emplearon tecnicas adicionales como decodificacion especulativa o attention lineal.

## Capacidades

- Generacion de texto conversacional en ingles con soporte de system prompt y plantilla de chat ChatML.
- Razonamiento explicito mediante cadenas de pensamiento largas delimitadas por `<think>...</think>`, orientadas a mejorar matematicas y codigo.
- Razonamiento matematico y resolucion de problemas paso a paso (la model card menciona explicitamente mejoras en tareas de math y coding).
- Generacion de codigo (mencionada como area de mejora por el long chain-of-thought).
- Capacidad conversacional multi-turno a traves del chat template.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y multi-step reasoning: no disponible de forma explicita, aunque el modo thinking facilita el razonamiento multi-paso.
- Capacidades multilingues: limitadas al ingles.
- Capacidades de vision o audio: no disponibles.

## Casos de uso

- Razonamiento matematico asistido: el modelo puede resolver problemas paso a paso generando una cadena de pensamiento explicita antes de la respuesta, lo que facilita la verificacion por parte del usuario y su uso en entornos educativos o de investigacion.
- Generacion y revision de codigo: gracias a su entrenamiento orientado a coding, puede emplearse para generar fragmentos de codigo, explicar algoritmos o depurar errores mostrando su razonamiento intermedio.
- Investigacion en interpretabilidad: al exponer la cadena de pensamiento en `<think>...</think>`, permite estudiar como el modelo llega a sus conclusiones, util para lineas de investigacion sobre razonamiento en LLMs.
- Fine-tuning academico: al ser Apache 2.0 y estar completamente abierto (pesos, codigo, datasets), sirve como base para experimentos de ajuste supervisado o DPO en laboratorios con recursos limitados.
- Reproduccion de resultados: este espejo de la etapa DPO permite reproducir el pipeline de post-entrenamiento de Olmo 3 y comparar el comportamiento entre las etapas SFT, DPO y RLVR.
- Prototipado de asistentes conversacionales en ingles: con 7B parametros y cuantizacion de 8 bits, puede desplegarse en una GPU de consumo para demos y pruebas de concepto de chatbots con razonamiento visible.
- Evaluacion comparativa de modelos abiertos: util como baseline en benchmarks de razonamiento matematico y de codigo frente a otros modelos de 7-8B.

## Benchmarks y rendimiento

La model card incluye una tabla de evaluacion con columnas para Olmo 3 Think 7B (SFT, DPO y final), OpenThinker3-7B, Nemotron-Nano-9B-v2, DeepSeek-R1-Distill-Qwen-7B, Qwen 3 8B (reasoning) y Qwen 3 VL 8B Thinker, pero los valores numericos no se han incluido en la informacion proporcionada.

No se han publicado resultados de benchmarks numericos en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 14-16 GB en fp16 para 7B parametros; en torno a 8-10 GB con cuantizacion de 8 bits via bitsandbytes; en torno a 4-6 GB con cuantizaciones de 4 bits (no confirmadas en la model card).
- GPU recomendadas: A100 40GB o H100 para inferencia en fp16 sin cuantizar y con margen para contexto largo; RTX 4090 (24 GB) para fp16 o 8-bit; RTX 3090 (24 GB) equivalente.
- Cabe en GPU de consumo: si, en tarjetas con 24 GB (RTX 3090, 4090) en fp16 o 8-bit, y potencialmente en GPUs de 8-12 GB con cuantizacion de 4 bits.
- Opciones de despliegue: transformers >= 4.57.0 (soporte oficial), bitsandbytes para cuantizacion; vLLM, llama.cpp, Ollama y TGI no se mencionan explicitamente en la informacion disponible, aunque al ser un modelo transformers estandar es probable su compatibilidad.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Olmo 3 7B Think (este espejo, etapa DPO) | 7B | no disponible | Apache 2.0 | Hugging Face (espejo) | Etapa DPO, no checkpoint final |
| Olmo 3 7B Think (oficial Ai2) | 7B | no disponible | Apache 2.0 | Hugging Face (allenai) | Checkpoint final tras RLVR |
| OpenThinker3-7B | 7B | no disponible | no disponible | no disponible | Incluido como comparador en la model card |
| DeepSeek-R1-Distill-Qwen-7B | 7B | no disponible | no disponible | no disponible | Incluido como comparador en la model card |
| Qwen 3 8B (reasoning) | 8B | no disponible | no disponible | no disponible | Incluido como comparador en la model card |

Los datos de rendimiento comparativo no estan disponibles en la informacion proporcionada; la model card referencia estos modelos como comparadores pero no se han incluido los valores numericos.

## Limitaciones y advertencias

- Sesgos conocidos: no se detallan sesgos especificos en la informacion disponible; al entrenarse predominantemente en ingles, puede presentar sesgos culturales y linguisticos propios del corpus.
- Riesgo de alucinacion: como todo LLM, puede generar contenido factualmente incorrecto, especialmente en la cadena de pensamiento, que puede contener razonamientos plausibles pero erroneos.
- Limitaciones de idioma: el modelo solo soporta ingles de forma oficial; su rendimiento en castellano u otros idiomas no esta garantizado.
- Limitaciones de contexto: la longitud de contexto no se especifica en la informacion disponible, lo que impide planificar su uso en tareas de contexto largo.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero Ai2 indica que el modelo esta destinado a investigacion y uso educativo conforme a sus Responsible Use Guidelines.
- Caveat de produccion: este es un espejo no oficial alojado por un tercero (`moltherm1`) con 0 descargas; para produccion se recomienda usar el checkpoint oficial `allenai/Olmo-3-7B-Think`. Ademas, al ser la etapa DPO y no el modelo final con RLVR, su rendimiento puede ser inferior al del checkpoint publicado por Ai2.
- Fecha de corte: diciembre de 2024, por lo que no conoce eventos posteriores.
- La cuantizacion de 8 bits requiere precauciones adicionales segun la model card (pasar los inputs directamente a CUDA para evitar problemas con tipos de datos y operaciones CUDA).

## Enlaces

- Modelo en Hugging Face (este espejo): https://huggingface.co/moltherm1/olmo-mirror-olmo-3-7b-think
- Modelo base: https://huggingface.co/allenai/Olmo-3-7B-Think-DPO
- Modelo final oficial: https://huggingface.co/allenai/Olmo-3-7B-Think
- Modelo base pre-entrenado: https://huggingface.co/allenai/Olmo-3-1025-7B
- Checkpoint SFT: https://huggingface.co/allenai/Olmo-3-7B-Think-SFT
- Dataset de post-entrenamiento: https://huggingface.co/datasets/allenai/Dolci-Think-RL-7B
- Pagina del proyecto Olmo: https://allenai.org/olmo
- Repositorio Open-Instruct (DPO y RLVR): https://github.com/allenai/open-instruct
- Repositorio OLMo-Core (pre-entrenamiento y SFT): https://github.com/allenai/OLMo-core
- Repositorio OLMo-Eval (evaluacion): https://github.com/allenai/OLMo-Eval
- Responsible Use Guidelines de Ai2: https://allenai.org/responsible-use
- Paper: no disponible (TBD en la model card)
