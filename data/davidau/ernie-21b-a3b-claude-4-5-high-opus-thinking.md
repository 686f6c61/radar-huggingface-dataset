# DavidAU/ERNIE-21B-A3B-Claude-4.5-High-OPUS-Thinking

## Resumen

ERNIE-21B-A3B-Claude-4.5-High-OPUS-Thinking es un ajuste fino (fine-tune) del modelo baidu/ERNIE-4.5-21B-A3B-Thinking, desarrollado por el usuario DavidAU de Hugging Face. Se trata de un modelo de arquitectura Mixture of Experts (MoE) con 64 expertos y 21.825 millones de parámetros totales, del cual solo una fracción (3B, segun el sufijo A3B del modelo base) se activa por token. El ajuste se ha realizado con el dataset TeichAI/claude-4.5-opus-high-reasoning-250x, que contiene trazas de razonamiento de Claude 4.5 Opus, utilizando la herramienta Unsloth sobre hardware local.

El objetivo del modelo es ofrecer capacidades de razonamiento "thinking" y escritura creativa sin las restricciones de censura habituales, manteniendo la ventana de contexto de 128k tokens del modelo base. Es relevante para desarrolladores e investigadores que necesitan un modelo de razonamiento compacto y sin filtros para generacion de ficcion, roleplay o experimentacion con cadenas de pensamiento, aunque su licencia Apache 2.0 y su naturaleza no oficial lo sitúan en el terreno de los modelos comunitarios.

La ficha se basa exclusivamente en la informacion publicada en la model card y en los metadatos de Hugging Face; muchos datos tecnicos del entrenamiento no estan disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture of Experts (MoE), 64 expertos, basada en ERNIE-4.5-21B-A3B-Thinking |
| Parametros totales | 21.825.437.888 (21,8B) |
| Parametros activos | 3B (segun nomenclatura A3B del modelo base; no confirmado en la model card) |
| Longitud de contexto | 128k tokens |
| Tipos de cuantizacion | No disponible (el autor menciona "lower quants" y publica GGUFs, EXL2, AWQ, GPTQ, HQQ en su coleccion de fuentes, pero no se detallan en esta model card) |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (bfloat16); el autor referencia versiones GGUF, EXL2, AWQ, GPTQ y HQQ en su coleccion |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura MoE del ERNIE-4.5-21B-A3B-Thinking de Baidu, con 64 expertos y 21,8B parametros totales, de los cuales aproximadamente 3B se activan por token. Esta arquitectura permite un coste de inferencia cercano al de un modelo denso de 3B, manteniendo la capacidad de representacion de un modelo mucho mayor. La ventana de contexto es de 128k tokens y el modelo base incorpora un modo de razonamiento ("thinking") que genera cadenas de pensamiento antes de la respuesta final.

El ajuste fino se realizo con Unsloth sobre el dataset TeichAI/claude-4.5-opus-high-reasoning-250x, compuesto por 250 ejemplos de razonamiento de alta calidad generados por Claude 4.5 Opus. El autor indica que el entrenamiento se ejecuto en hardware local con Linux. No se especifican el numero total de tokens de entrenamiento, la composicion exacta del dataset, ni si se aplicaron tecnicas de RLHF o DPO adicionales. La model card menciona que el modelo es "mayormente sin censura" desde su origen y que el razonamiento resultante es "compacto pero muy detallado".

## Capacidades

- Generacion de texto general y conversacion multi-turno.
- Razonamiento con modo "thinking": produce cadenas de pensamiento detalladas antes de la respuesta final.
- Escritura creativa: ficcion, generacion de tramas y subtramas, continuacion de escenas, storytelling, ciencia ficcion, romance y todos los generos.
- "Vivid prosing": prosa descriptiva y vivida, segun los tags del autor.
- Uso general sin censura ("uncensored"), orientado a roleplay y contenido sin filtros.
- Estabilidad de temperatura en el razonamiento (rango de temperatura 0,1 a 2,5).
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no confirmado explicitamente; el modo thinking sugiere capacidad de razonamiento encadenado, pero no se detalla.
- Capacidades multilingues: solo ingles declarado.
- Capacidades de vision o audio: no disponibles.

## Casos de uso

- Generacion de ficcion y novelas: el modelo esta ajustado especificamente para escritura creativa, con tags dedicados a generacion de tramas, subtramas y continuacion de escenas; su contexto de 128k permite mantener coherencia en manuscritos largos.
- Roleplay y chat de personajes: el caracter "uncensored" y las recomendaciones de parametros (smoothing factor 1.5, rep pen 1.01-1.1) lo orientan a interfaces como SillyTavern o KoboldCpp para conversaciones de personaje sin restricciones.
- Brainstorming creativo: el modo thinking genera razonamiento detallado que puede usarse para explorar ideas de guion, worldbuilding o desarrollo de personajes.
- Continuacion de escenas y "scene continue": util para herramientas de escritura asistida donde se necesita extender un texto existente manteniendo tono y estilo.
- Experimentacion con razonamiento sin censura: investigadores que estudian cadenas de pensamiento o comportamiento de modelos sin filtros pueden usar este fine-tune como sujeto de estudio.
- Generacion de prosa vivida para marketing o contenido editorial: el enfasis en "vivid writing" lo hace adecuado para textos descriptivos y narrativos de alta intensidad.
- Despliegue local en hardware de consumo: al ser un MoE con 3B activos, las versiones cuantizadas (GGUF) pueden ejecutarse en GPUs consumer, lo que facilita prototipado y uso personal.

## Benchmarks y rendimiento

El autor publica resultados en la model card comparando el fine-tune con el modelo base ("regular model"):

| Benchmark | Fine-tune | Modelo base |
|---|---|---|
| ARC Challenge | 0,392 | 0,331 |
| ARC Easy | 0,489 | 0,440 |
| BoolQ | 0,631 | 0,628 |
| HellaSwag | 0,686 | 0,663 |
| OpenBookQA | 0,364 | 0,338 |
| PIQA | 0,771 | 0,725 |
| Winogrande | 0,631 | 0,567 |

El fine-tune mejora en todos los benchmarks respecto al modelo base, con incrementos notables en Winogrande (+0,064) y PIQA (+0,046). No se han publicado resultados de MMLU, HumanEval o GSM8K en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bfloat16: aproximadamente 44 GB (21,8B parametros x 2 bytes), lo que requiere GPUs de 48 GB o superiores (A6000, A100 80GB, H100).
- VRAM estimada en cuantizacion de 8 bits: en torno a 22-24 GB, viable en RTX 3090/4090 (24 GB) con margen ajustado.
- VRAM estimada en cuantizacion de 4 bits (GGUF Q4): aproximadamente 12-14 GB, cabe en RTX 4080, RTX 4070 Ti Super y GPUs consumer de 16 GB o mas.
- Al ser un MoE con 3B activos, la velocidad de inferencia es comparativamente alta para su tamano total, aunque no se proporcionan cifras de latencia o throughput.
- Opciones de despliegue: transformers (libreria declarada), llama.cpp/Ollama mediante GGUFs, KoboldCpp, text-generation-webui (con llama_HF para GGUFs), y potencialmente vLLM/TGI aunque no se confirman en la model card.
- El autor advierte que las cuantizaciones bajas pueden entrar en bucles en algunos casos.

## Comparativa con modelos similares

| Modelo | Parametros | Activos | Contexto | Licencia | Notas |
|---|---|---|---|---|---|
| ERNIE-21B-A3B-Claude-4.5-High-OPUS-Thinking (este) | 21,8B | ~3B | 128k | Apache 2.0 | Fine-tune comunitario sin censura, orientado a creatividad |
| baidu/ERNIE-4.5-21B-A3B-Thinking | 21,8B | ~3B | 128k | Apache 2.0 | Modelo base oficial de Baidu, con censura y modo thinking |
| Qwen1.5-MoE-A2.7B | 14,3B | 2,7B | 32k | Apache 2.0 | MoE de Alibaba, contexto menor, sin fine-tune creativo |
| Mixtral 8x7B | 46,7B | 12,9B | 32k | Apache 2.0 | MoE mas grande, mayor coste de inferencia, sin modo thinking nativo |

No se dispone de comparativas de rendimiento directas con estos modelos en la informacion proporcionada; los benchmarks publicados solo comparan con el modelo base.

## Limitaciones y advertencias

- Modelo comunitario no oficial: no ha sido validado por Baidu ni por Anthropic; los resultados pueden diferir de lo esperado en produccion.
- Riesgo de alucinacion: como todo modelo de lenguaje, puede generar informacion falsa, especialmente en dominios facticos; el enfasis en creatividad agrava este riesgo.
- Censura reducida: el caracter "uncensored" implica que puede generar contenido inapropiado, ofensivo o ilegal; requiere moderacion externa en aplicaciones publicas.
- Solo ingles: no se declaran capacidades multilingues; el rendimiento en castellano no esta garantizado.
- Bucles en cuantizaciones bajas: el autor advierte explicitamente que las cuantizaciones menores pueden entrar en bucles.
- Sensibilidad a parametros de muestreo: requiere ajustes especificos (rep pen 1.01-1.1, smoothing 1.5) para un funcionamiento optimo; sin ellos el rendimiento puede degradarse.
- Dataset de entrenamiento pequeno (250 ejemplos): el ajuste fino puede no generalizar bien fuera de los dominios cubiertos.
- Licencia Apache 2.0: permite uso comercial, pero el autor no ofrece garantias; el modelo base de Baidu tambien es Apache 2.0, lo que facilita la redistribucion.
- Sin datos de sesgos: no se han publicado evaluaciones de sesgo o toxicidad en la informacion disponible.
- Fecha de creacion futura (2026-02-20): metadato anomalo que sugiere posible error en el registro o naturaleza experimental del repositorio.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/DavidAU/ERNIE-21B-A3B-Claude-4.5-High-OPUS-Thinking
- Modelo base: https://huggingface.co/baidu/ERNIE-4.5-21B-A3B-Thinking
- Dataset de entrenamiento: https://huggingface.co/datasets/TeichAI/claude-4.5-opus-high-reasoning-250x
- Perfil del autor: https://huggingface.co/DavidAU
- Coleccion de fuentes del autor (GGUF, EXL2, AWQ, GPTQ, HQQ): https://huggingface.co/collections/DavidAU/d-au-source-files-for-gguf-exl2-awq-gptq-hqq-etc-etc-66b55cb8ba25f914cbf210be
- Guia de parametros y samplers del autor: https://huggingface.co/DavidAU/Maximizing-Model-Performance-All-Quants-Types-And-Full-Precision-by-Samplers_Parameters
- Unsloth: https://github.com/unslothai/unsloth
