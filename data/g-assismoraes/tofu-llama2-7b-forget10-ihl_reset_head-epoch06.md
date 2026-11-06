# g-assismoraes/tofu-llama2-7b-forget10-ihl_reset_head-epoch06

## Resumen

El modelo `tofu-llama2-7b-forget10-ihl_reset_head-epoch06` es un checkpoint de investigacion publicado por el usuario g-assismoraes en Hugging Face. Se trata de un ajuste fino de Llama 2 de 7 mil millones de parametros, construido sobre el modelo base `locuslab/tofu_ft_llama2-7b`, que a su vez deriva del conocido Llama 2. El checkpoint forma parte de un experimento de *machine unlearning* (desaprendizaje automatico) sobre el conjunto de datos TOFU (Task of Fictional Unlearning), en su variante `forget10`, que busca eliminar selectivamente el conocimiento de un subconjunto de autores ficticios del modelo sin degradar el resto de sus capacidades.

La tecnica empleada combina dos mecanismos: por un lado, una perdida de tipo IHL (probablemente *Inverted Hinge Loss* o una variante de *Input-Output Hinge Loss* usada en la literatura de unlearning) aplicada sobre el conjunto *forget*, y por otro, una perdida de entropia cruzada (CE) con peso 1.0 sobre el conjunto *retain*. Ademas, el checkpoint reinicializa los *input embeddings* y la *LM head* a partir de `NousResearch/Llama-2-7b-chat-hf`, mientras conserva el resto de pesos del transformer del modelo base. Este checkpoint corresponde a la epoca 6 de un entrenamiento de 20 epocas.

Por su naturaleza, no es un modelo de proposito general ni esta pensado para produccion: es un artefacto de investigacion para estudiar hasta que punto las tecnicas de unlearning pueden eliminar informacion concreta de un LLM manteniendo su utilidad general. Su relevancia actual radica en el creciente interes por el derecho al olvido (RGPD, AI Act) y por metodos que permitan eliminar datos de entrenamiento sin reentrenar desde cero.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 2) |
| Parametros totales | 6.738.415.616 (~6,74 mil millones) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (heredada de Llama 2, 4096 tokens segun la arquitectura base, no confirmado en la model card) |
| Tipos de cuantizacion | no disponible (solo se publican pesos safetensors en fp16/bf16) |
| Idiomas soportados | ingles (en) |
| Licencia | Llama 2 Community License |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Llama 2 7B: un transformer decoder-only con atencion multi-cabeza, normalizacion RMSNorm, activacion SwiGLU y embeddings rotatorios (RoPE). El modelo parte de `locuslab/tofu_ft_llama2-7b`, un ajuste fino de Llama 2 sobre el dataset TOFU, y sobre el se aplica un procedimiento de unlearning en dos fases: reinicializacion de los *input embeddings* y de la *LM head* desde `NousResearch/Llama-2-7b-chat-hf`, manteniendo intactos el resto de pesos del transformer, y entrenamiento con una funcion de perdida compuesta que combina una perdida IHL sobre el conjunto *forget* (los autores a olvidar) y una perdida de entropia cruzada con peso 1.0 sobre el conjunto *retain* (los autores que deben conservarse).

El checkpoint corresponde a la epoca 6 de 20, lo que sugiere un proceso de entrenamiento relativamente temprano dentro del ciclo. No se especifican en la informacion disponible el numero total de tokens de entrenamiento, la composicion exacta del dataset TOFU utilizado, ni si se aplicaron tecnicas adicionales como RLHF o DPO. El autor menciona un fichero `ihl_manifest.json` con metadatos del experimento, pero su contenido no esta disponible en la informacion proporcionada.

## Capacidades

- Generacion de texto en ingles: al conservar la arquitectura y la mayor parte de los pesos de Llama 2 7B, mantiene la capacidad generativa base del modelo original.
- Razonamiento basico y respuesta a preguntas: heredado del ajuste fino sobre TOFU, orientado a conversaciones sobre autores ficticios.
- Capacidad de unlearning selectivo: el objetivo del checkpoint es haber eliminado el conocimiento sobre el 10 % de autores del conjunto *forget* de TOFU, manteniendo el rendimiento sobre el resto.
- No se documenta soporte de tool calling ni function calling en la informacion disponible.
- No se documenta soporte de agentes ni razonamiento multi-paso explicito.
- Capacidades multilingues limitadas al ingles segun el campo `language: en`.
- No se documentan modos especiales como thinking mode, vision o audio.

## Casos de uso

- Investigacion en machine unlearning: el checkpoint sirve como punto de comparacion para medir la eficacia de la combinacion IHL + reset de cabeza sobre TOFU forget10, comparandolo con otros metodos y epocas.
- Evaluacion de derecho al olvido: permite estudiar si un modelo puede eliminar informacion sobre individuos o entidades concretas sin reentrenar desde cero, un requisito creciente en el marco del RGPD y del AI Act europeo.
- Analisis de robustez del unlearning: util para comprobar si el conocimiento supuestamente olvidado puede recuperarse mediante *prompting* adversarial o tecnicas de extraccion.
- Reproducibilidad de experimentos: al ser un checkpoint autonomo con pesos safetensors, facilita la replicacion de resultados por parte de otros grupos de investigacion.
- Estudio de degradacion de capacidades generales: permite cuantificar cuanto rendimiento general se pierde al aplicar tecnicas agresivas de unlearning sobre un LLM de 7B.
- Benchmarking de metodos de unlearning: sirve como referencia para comparar frente a metodos como gradient ascent, preference optimization o task arithmetic en el mismo dataset TOFU.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16: aproximadamente 13,5 GB solo para pesos, mas overhead de activaciones y cache KV (en torno a 15-16 GB en total para contextos cortos).
- VRAM estimada en cuantizacion 8 bits: alrededor de 7-8 GB.
- VRAM estimada en cuantizacion 4 bits (si se generan pesos GGUF/AWQ a partir de los safetensors): en torno a 4-5 GB.
- GPU recomendadas para fp16: NVIDIA A100 40GB, H100 80GB, L40S, RTX 6000 Ada o RTX 4090 (24 GB) para inferencia comoda.
- Cabe en GPU de consumo: si, en RTX 3090/4090 (24 GB) en fp16 con contextos moderados, y en GPUs de 8-12 GB si se cuantiza a 4 u 8 bits.
- Opciones de despliegue: vLLM, TGI, llama.cpp, Ollama y transformers con accelerate, siempre que se conviertan los pesos a los formatos correspondientes (el repo solo publica safetensors).
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| tofu-llama2-7b-forget10-ihl_reset_head-epoch06 | 6,74 B | no disponible (base Llama 2: 4096) | Llama 2 | Hugging Face (0 descargas) | Checkpoint de investigacion en unlearning, epoca 6/20 |
| locuslab/tofu_ft_llama2-7b | 6,74 B | 4096 | Llama 2 | Hugging Face | Modelo base ajustado en TOFU, sin unlearning |
| NousResearch/Llama-2-7b-chat-hf | 6,74 B | 4096 | Llama 2 | Hugging Face | Llama 2 7B chat, usado aqui para reinicializar embeddings y LM head |
| meta-llama/Llama-2-7b-hf | 6,74 B | 4096 | Llama 2 | Hugging Face | Modelo original de Meta, referencia general |

## Limitaciones y advertencias

- Modelo de investigacion sin validacion en produccion: cero descargas y cero likes en el momento de la consulta, sin documentacion de evaluacion publicada.
- Riesgo de alucinacion: heredado de Llama 2 7B, acentuado potencialmente por la reinicializacion de embeddings y LM head, que puede degradar la coherencia general.
- El objetivo del checkpoint es eliminar conocimiento, no maximizar calidad: el rendimiento general puede estar degradado respecto al modelo base.
- Sesgos conocidos: los sesgos de Llama 2 7B y del dataset TOFU (autores ficticios en ingles) se mantienen o pueden amplificarse.
- Limitacion idiomatica: solo ingles segun la model card.
- Licencia Llama 2: restricciones de uso comercial y obligacion de cumplir la politica de uso aceptable de Meta; no es una licencia open source pura.
- El proceso de unlearning no garantiza la eliminacion completa de la informacion: estudios previos muestran que el conocimiento "olvidado" puede recuperarse mediante ataques de extraccion.
- No se documentan los hiperparametros completos del entrenamiento ni el contenido de `ihl_manifest.json` en la informacion disponible.
- Fecha de creacion inusual (2026-11-02) que conviene verificar antes de citar el modelo en publicaciones.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/g-assismoraes/tofu-llama2-7b-forget10-ihl_reset_head-epoch06
- Modelo base: https://huggingface.co/locuslab/tofu_ft_llama2-7b
- Modelo usado para reinicializar embeddings y LM head: https://huggingface.co/NousResearch/Llama-2-7b-chat-hf
- Modelo original Llama 2 7B: https://huggingface.co/meta-llama/Llama-2-7b-hf
- Dataset TOFU (referencia): https://huggingface.co/datasets/locuslab/TOFU
