# FrancescoArno94/Qwen3-1.7B-grpo-math-code

## Resumen

Qwen3-1.7B-grpo-math-code es un ajuste fino del modelo Qwen3-1.7B de Alibaba, publicado por el usuario FrancescoArno94 en Hugging Face. Se trata de un modelo de generacion de texto de 1.720.574.976 parametros (1,7 mil millones) orientado a tareas de razonamiento matematico y generacion de codigo, entrenado mediante un pipeline de post-entrenamiento que combina SFT, DPO y GRPO (Group Relative Policy Optimization). El modelo parte de la familia Qwen3, una arquitectura transformer densa con soporte nativo de modo "thinking" y capacidades multilingues, aunque la model card solo declara ingles como idioma soportado.

La relevancia de este modelo radica en su tamano compacto (1,7B), que lo hace desplegable en hardware de consumo, combinado con un entrenamiento especifico en refuerzo (GRPO) sobre datasets de matematicas y codigo verificable. El pipeline descrito incluye SFT sobre el dataset Tulu, DPO sobre UltraFeedback y GRPO sobre una mezcla de DAPO-Math-17k-Processed y verifiable-coding-problems-python, lo que sugiere un enfasis en tareas de razonamiento con recompensa verificable. El modelo se distribuye bajo licencia Apache 2.0 y en formato safetensors, con 34 descargas y 0 likes en el momento de la consulta.

Es un modelo de nicho, con muy poca traccion en la comunidad y una model card minima que no aporta resultados de benchmarks ni detalles sobre hiperparametros de entrenamiento. Su interes principal es como ejemplo de pipeline de post-entrenamiento con GRPO sobre un modelo pequeno, mas que como modelo de produccion listo para usar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (familia Qwen3) |
| Parametros totales | 1.720.574.976 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (Qwen3-1.7B base soporta hasta 32.768 tokens, pero no se confirma en esta ficha) |
| Tipos de cuantizacion | no disponible (repo en safetensors; compatible con cuantizacion via llama.cpp/GGUF y bitsandbytes, pero no se documenta) |
| Idiomas soportados | en (ingles declarado en la model card) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un transformer denso de 1,7 mil millones de parametros, derivado de Qwen3-1.7B. La model card no detalla la arquitectura interna (numero de capas, dimensiones de atencion, uso de RoPE, etc.), pero al ser un finetune de Qwen3 hereda la arquitectura de esa familia, que incluye atencion con RoPE, normalizacion RMSNorm y un tokenizer multilingue. No se dispone de informacion sobre el numero total de tokens de entrenamiento ni la composicion exacta del dataset mas alla de los nombres citados.

El pipeline de post-entrenamiento descrito es el siguiente: partiendo de Qwen3-1.7B, se aplica SFT sobre el dataset Tulu para obtener un modelo instruct; despues DPO sobre UltraFeedback; a continuacion un paso de DPO adicional (la model card menciona "Qwen3.1 7B dpo", lo que parece un error tipografico o una referencia confusa); y finalmente GRPO sobre una mezcla de `open-r1/DAPO-Math-17k-Processed` y `open-r1/verifiable-coding-problems-python`. El entrenamiento se realizo con Unsloth, que el autor indica que acelera el entrenamiento 2x. No se especifican hiperparametros, tasas de aprendizaje, numero de pasos ni detalles del reward model usado en GRPO.

## Capacidades

- Generacion de texto conversacional en ingles, con formato de chat (etiqueta `conversational`).
- Razonamiento matematico: entrenado con GRPO sobre DAPO-Math-17k-Processed, orientado a problemas de matematicas con respuesta verificable.
- Generacion de codigo: entrenado sobre verifiable-coding-problems-python, con enfasis en problemas de programacion en Python.
- Razonamiento multi-paso: el uso de GRPO sugiere entrenamiento en cadenas de razonamiento, aunque no se documenta explicitamente el modo "thinking" de Qwen3.
- Soporte de tool calling / function calling: no documentado en la model card; al heredar de Qwen3 es probable que lo soporte, pero no se confirma.
- Capacidades de agente: no documentadas.
- Capacidades multilingues: la model card solo declara ingles; el modelo base Qwen3 es multilingue, pero este finetune no garantiza ese comportamiento.
- Vision y audio: no soportados (modelo de texto).
- Modo thinking: no documentado explicitamente en esta ficha.

## Casos de uso

- Resolucion de problemas matematicos paso a paso: el modelo puede usarse para generar soluciones detalladas a problemas de algebra, calculo o aritmetica, aprovechando el entrenamiento con GRPO sobre DAPO-Math-17k. Adecuado para entornos educativos o de verificacion automatica donde se necesita una cadena de razonamiento.
- Generacion de codigo Python para tareas acotadas: entrenado sobre problemas de codigo verificable, puede emplearse para completar funciones, corregir errores sintacticos o generar scripts pequenos en Python. Su tamano permite ejecutarlo en local.
- Asistente de programacion en entornos con recursos limitados: al ser un modelo de 1,7B, puede desplegarse en una GPU de consumo (por ejemplo, RTX 3060 de 12 GB) para autocompletado o generacion de codigo en un IDE, con latencia baja.
- Prototipado de pipelines de RL: util como caso de estudio para investigadores que quieran replicar un pipeline SFT -> DPO -> GRPO sobre un modelo pequeno, dado que el autor documenta las etapas y los datasets usados.
- Generacion de tests unitarios a partir de especificaciones: el enfasis en codigo verificable sugiere que puede generar casos de prueba para funciones Python, aunque requiere validacion posterior.
- Chatbot tecnico de dominio acotado: para preguntas de matematicas o programacion en ingles, con contexto corto, puede integrarse en una API de texto mediante TGI o transformers.
- Filtrado y clasificacion de soluciones matematicas: puede emplearse como generador de candidatos en un sistema de votacion (self-consistency) para problemas con respuesta verificable.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16: aproximadamente 3,5 GB solo para pesos, mas overhead de activaciones y KV cache; en la practica, unos 4-6 GB para contextos cortos.
- VRAM estimada en cuantizacion 8 bits: aproximadamente 2 GB de pesos; en 4 bits (GGUF Q4_K_M), alrededor de 1,1-1,3 GB.
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM para FP16 (RTX 3060 Ti, RTX 4060, RTX 3070); para cuantizacion 4 bits, cabe en GPUs de 4-6 GB (GTX 1650, RTX 3050) o incluso en CPU con llama.cpp.
- Cabe en GPU de consumo: si, en la mayoria de GPUs modernas de gama media; en 4 bits cabe en practicamente cualquier GPU dedicada.
- Opciones de despliegue: transformers (libreria declarada), text-generation-inference (tag `text-generation-inference`), Unsloth para fine-tuning, y potencialmente vLLM, llama.cpp u Ollama mediante conversion a GGUF (no documentado por el autor).
- Latencia y throughput estimados: no disponibles; para un modelo de 1,7B en una RTX 4090 se puede esperar un throughput del orden de decenas a cientos de tokens por segundo, pero no hay mediciones publicadas para este finetune concreto.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Qwen3-1.7B-grpo-math-code (este) | 1,72B | no disponible | Apache 2.0 | Hugging Face, 34 descargas | Finetune con SFT+DPO+GRPO sobre matematicas y codigo |
| Qwen3-1.7B (base) | 1,72B | 32.768 tokens (segun familia Qwen3) | Apache 2.0 | Hugging Face, ampliamente disponible | Modelo base oficial de Alibaba, con modo thinking |
| DeepSeek-R1-Distill-Qwen-1.5B | 1,5B | 32.768 tokens (aprox.) | MIT | Hugging Face, muy popular | Destilado de razonamiento, orientado a matematicas y codigo |
| SmolLM2-1.7B-Instruct | 1,7B | 8.192 tokens | Apache 2.0 | Hugging Face | Modelo instruct generalista de Hugging Face |

La comparativa se basa en caracteristicas publicas de los modelos citados; no se dispone de benchmarks de este finetune para comparar rendimiento real. El modelo de DeepSeek es el competidor mas directo en el nicho de razonamiento matematico a escala 1,5B, con mayor traccion y documentacion.

## Limitaciones y advertencias

- Sesgos conocidos: al derivar de Qwen3 y entrenarse sobre Tulu y UltraFeedback, puede heredar sesgos de esos datasets; no se documenta ninguna evaluacion de sesgo.
- Riesgo de alucinacion: alto en tareas fuera de matematicas y codigo, dado el enfasis del entrenamiento; en problemas matematicos puede generar cadenas de razonamiento plausibles pero incorrectas.
- Limitaciones de contexto: no se documenta la longitud de contexto soportada; el modelo base Qwen3-1.7B soporta 32.768 tokens, pero este finetune no lo confirma y el entrenamiento con GRPO suele usar contextos mas cortos.
- Limitaciones de idioma: solo se declara ingles; el rendimiento en castellano no esta garantizado y probablemente sea deficiente.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el modelo base Qwen3 tiene su propia licencia que debe respetarse; verificar los terminos de Qwen3 antes de uso comercial.
- Caveats para produccion: modelo con 34 descargas y 0 likes, sin benchmarks publicados, sin evaluacion de seguridad y con una model card minima; no recomendado para produccion sin evaluacion propia.
- La model card contiene referencias confusas (por ejemplo, "Qwen3.1 7B dpo" en un pipeline de 1,7B), lo que sugiere posibles errores en la documentacion del proceso.
- El tag `base_model` apunta al propio modelo, lo que indica un error de configuracion en el repo.

## Enlaces

- Hugging Face: https://huggingface.co/FrancescoArno94/Qwen3-1.7B-grpo-math-code
- Unsloth (herramienta de entrenamiento): https://github.com/unslothai/unsloth
- Dataset DAPO-Math-17k-Processed: https://huggingface.co/datasets/open-r1/DAPO-Math-17k-Processed
- Dataset verifiable-coding-problems-python: https://huggingface.co/datasets/open-r1/verifiable-coding-problems-python
- Modelo base Qwen3-1.7B: https://huggingface.co/Qwen/Qwen3-1.7B (referencia de la familia, no enlazado en la model card)
