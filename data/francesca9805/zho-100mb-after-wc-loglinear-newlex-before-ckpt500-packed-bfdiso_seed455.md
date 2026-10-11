# francesca9805/zho-100mb-after-wc-loglinear-newlex-before-ckpt500-packed-bfdiso_seed455

## Resumen

El modelo `francesca9805/zho-100mb-after-wc-loglinear-newlex-before-ckpt500-packed-bfdiso_seed455` es un checkpoint de generación de texto de 124.770.816 parámetros publicado por el usuario francesca9805, que según los metadatos de su entrenamiento (run de Weights & Biases en la cuenta de la Universidad de Groningen) forma parte de una línea de experimentos sobre tokenizadores ("new-tokenizers"). Está construido sobre la arquitectura GPT-2 y se ha afinado mediante SFT con la librería TRL (versión 0.23.0) a partir del modelo base `francesca9805/ppt-wc-loglinear-newlex-zho-before-100mb-packed-bfdiso_seed455`.

Su relevancia es estrictamente experimental: se trata de uno de los muchos brazos de una ablación sistemática (el nombre codifica variables como `wc` word-count, `loglinear`, `newlex`, `packed`, `ckpt500` y la semilla `seed455`), orientada a comparar variantes de tokenización y de empaquetado de secuencias sobre un corpus de aproximadamente 100 MB en chino (`zho`). No es un modelo pensado para producción: acumula 0 descargas y 0 likes, no declara licencia explícita utilizable, no documenta idiomas soportados ni publica resultados de evaluación.

A diferencia de los lanzamientos comerciales de pesos abiertos, esta ficha no contiene información sobre el dataset de entrenamiento, la composición del corpus, la longitud de contexto efectiva ni métricas de calidad. Cualquier uso práctico exige validación previa por parte del equipo que lo adopte.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GPT-2 (transformer decoder-only; confirmado por el tag `gpt2`) |
| Parametros totales | 124.770.816 (dato real de safetensors) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (GPT-2 estándar usa 1024 tokens, sin confirmar en esta ficha) |
| Tipos de cuantizacion | no disponible (no se publican variantes GGUF, AWQ ni GPTQ) |
| Idiomas soportados | no disponibles (el nombre del modelo sugiere chino, `zho`, e inglés, sin confirmar) |
| Licencia | no disponible (la model card solo indica `licence: license`, sin texto legal) |
| Formato de pesos | safetensors (repo de 2,7 GB, compatible con `transformers`) |

## Arquitectura y entrenamiento

Se trata de un transformer decoder-only de tipo GPT-2 con 124,77 millones de parámetros, la misma escala que GPT-2 small. El entrenamiento se realizó mediante SFT (supervised fine-tuning) con TRL 0.23.0, sobre Transformers 4.56.2, PyTorch 2.11.0, Datasets 4.8.4 y Tokenizers 0.22.1. El pipeline declarado es `text-generation`, admite plantilla de chat (el ejemplo oficial pasa una lista de mensajes con rol `user`) y está etiquetado como compatible con text-generation-inference.

No se documenta el número de tokens de entrenamiento, la composición del dataset ni si hubo fases de RLHF o DPO. El nombre del repositorio indica que el modelo base se entrenó con secuencias empaquetadas (`packed`) y con un tokenizador experimental (`newlex`, `wc-loglinear`) sobre unos 100 MB de datos en chino, y que este checkpoint concreto es el estado "antes del paso 500" (`before-ckpt500`) del brazo `bfdiso` con semilla 455. La relación exacta entre estas variables y su efecto en el modelo no está publicada; solo se dispone del enlace al run de W&B del proyecto `new-tokenizers`.

## Capacidades

- Generación de texto autoregresiva en formato de chat o de continuación libre.
- Conversación de un solo turno o multi-turno simple, gracias a la plantilla de mensajes que acepta el tokenizador.
- Ajuste por instrucciones básico, derivado del entrenamiento SFT con TRL.
- Cobertura multilingüe: no confirmada; el nombre del modelo apunta a chino (`zho`), pero no hay declaración oficial de idiomas.
- Tool calling / function calling: no disponible, no se documenta soporte.
- Capacidades de agente y razonamiento multi-paso: no disponibles, no se documentan.
- Modo "thinking", visión o audio: no disponibles.
- Razonamiento matemático o generación de código: no documentados ni evaluados.

## Casos de uso

- Investigación sobre tokenizadores: el modelo sirve como punto de comparación dentro de la ablación `new-tokenizers`, permitiendo medir cómo afectan el vocabulario nuevo (`newlex`) y el esquema de recuento (`wc-loglinear`) a la perplejidad y a la fluidez de un GPT-2 pequeño.

- Reproducción de experimentos académicos: al estar etiquetado como `generated_from_trainer` y publicar versiones equivalentes con otras semillas (`seed10`, `seed3407`, `seed455`), permite estudiar la varianza entre inicializaciones sobre el mismo corpus.

- Pruebas de infraestructura de despliegue: con 124,77 millones de parámetros y pesos safetensors, es útil para validar pipelines de TGI, vLLM o endpoints de Hugging Face a coste mínimo antes de escalar a modelos mayores.

- Docencia y demos de generación de texto: cabe en cualquier GPU de consumo e incluso en CPU, por lo que resulta adecuado para talleres donde se explique el ciclo completo de fine-tuning con SFT y TRL.

- Prototipado rápido de chatbots en chino: si se confirma el soporte de `zho`, puede emplearse como base para validar plantillas de conversación e interfaces antes de migrar a un modelo multilingüe mayor.

- Generación de texto creativo de bajo coste: continuación de prompts cortos con `max_new_tokens` reducidos (por ejemplo 128, como en el ejemplo oficial) en entornos con recursos limitados.

- Evaluación de técnicas de empaquetado de secuencias: el sufijo `packed` sugiere que el modelo se entrenó con secuencias concatenadas; puede usarse para reproducir estudios sobre eficiencia de entrenamiento y degradación por atención cruzada entre documentos.

En todos los casos conviene tratar el modelo como artefacto de investigación: no hay evidencia publicada de calidad mínima para uso comercial.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

No hay datos de MMLU, HumanEval, GSM8K, perplejidad ni ninguna otra métrica en la model card, en los metadatos de Hugging Face ni en los resultados de búsqueda. El único dato cuantitativo externo encontrado es la estimación de VRAM de 0,2 GB recogida en LLM Explorer, que es un cálculo de huella de memoria y no una medida de calidad.

## Requisitos de hardware

- VRAM para inferencia en fp32: aproximadamente 0,5 GB para los pesos más activaciones y caché KV.
- VRAM en fp16/bf16: aproximadamente 0,25 GB; LLM Explorer cifra la necesidad en 0,2 GB.
- VRAM en int8: alrededor de 0,12-0,15 GB; en int4, alrededor de 0,07-0,10 GB (estimaciones derivadas del recuento de parámetros, no publicadas por el autor).
- Cabe sin problema en cualquier GPU de consumo: GTX 1050 Ti/1650, RTX 2060, RTX 3060, RTX 4090, e incluso en CPU con `transformers` o con una conversión a GGUF.
- GPU de datacenter (A100, H100) innecesarias; solo tendrían sentido para lotes muy grandes o para servir muchas réplicas.
- Despliegue: `transformers.pipeline` de forma nativa; también compatible con text-generation-inference (tag `text-generation-inference` y `endpoints_compatible`), con vLLM y con FriendliAI, que ya lista el modelo.
- llama.cpp y Ollama requieren convertir los pesos a GGUF; no hay ficheros GGUF publicados en el repositorio.
- Latencia y throughput: no publicados. Al ser un GPT-2 de 124M, en una GPU moderna se espera un throughput muy alto (cientos de tokens por segundo por secuencia), pero no existe medición oficial asociada a este checkpoint.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| zho-100mb-after-wc-loglinear-newlex-before-ckpt500-packed-bfdiso_seed455 | 124,77 M | no disponible | no disponible | Hugging Face, 0 descargas | Checkpoint de investigación; sin benchmarks públicos |
| GPT-2 small (OpenAI) | 124 M | 1024 tokens | MIT modificada | Ampliamente disponible | Referencia de la misma arquitectura y escala; sí tiene evaluaciones publicadas |
| DistilGPT-2 (Hugging Face) | 82 M | 1024 tokens | Apache 2.0 | Muy extendido | Destilado de GPT-2, más rápido y ligero, con licencia clara para uso comercial |
| Pythia-160M (EleutherAI) | 160 M | 2048 tokens | Apache 2.0 | Suite completa de checkpoints | Diseñado para interpretabilidad, con evaluaciones reproducibles |
| SmolLM-135M (Hugging Face) | 135 M | 2048 tokens | Apache 2.0 | Amplia, con GGUF y ONNX | Modelo pequeño moderno entrenado con datos de mayor calidad |

La comparación con GPT-2 small es directa por arquitectura y número de parámetros; el resto de alternativas ofrecen contexto mayor, licencia explícita y métricas publicadas. No hay datos de rendimiento de este checkpoint que permitan establecer una comparación cuantitativa.

## Limitaciones y advertencias

- Licencia no disponible: la model card solo declara `licence: license`, sin términos legales. No se puede asumir permiso para uso comercial.
- Ausencia total de benchmarks: no hay ninguna métrica publicada de perplejidad, exactitud o calidad de generación.
- Repositorio con 0 descargas y 0 likes: no hay evidencia de uso, validación externa ni mantenimiento.
- Sesgos: al derivar de GPT-2 y de un corpus de unos 100 MB, es esperable un modelo con sesgos propios de ese corpus, no auditados ni documentados.
- Alucinación: los modelos GPT-2 pequeños generan con frecuencia contenido factualmente incorrecto o incoherente; no hay mecanismo de mitigación declarado.
- Longitud de contexto limitada: si se mantiene la configuración GPT-2 estándar, 1024 tokens; no está confirmado y no se documenta empaquetado ni ventana ampliada.
- Idiomas: no declarados. La parte `zho` del nombre sugiere chino, pero no se garantiza cobertura ni calidad en ningún idioma concreto.
- Plantilla de chat: no se documenta formalmente; el formato de mensajes del ejemplo puede no mantenerse en otros contextos.
- Naturaleza experimental: el nombre codifica variables de un estudio de tokenización; puede haber artefactos de entrenamiento (checkpoint intermedio "before-ckpt500") que reduzcan la calidad final.
- Sin soporte de herramientas ni de agentes: no sirve como base para flujos con function calling sin un entrenamiento adicional.
- Conversión a GGUF no publicada: desplegar en llama.cpp u Ollama exige un proceso manual adicional.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/francesca9805/zho-100mb-after-wc-loglinear-newlex-before-ckpt500-packed-bfdiso_seed455
- Modelo base: https://huggingface.co/francesca9805/ppt-wc-loglinear-newlex-zho-before-100mb-packed-bfdiso_seed455
- Run de entrenamiento en Weights & Biases: https://wandb.ai/f-padovani-university-of-groningen/new-tokenizers/runs/ou159lz9
- Repositorio de TRL: https://github.com/huggingface/trl
- Variante hermana con tokenizador uniforme (antes del paso 500, semilla 10): https://huggingface.co/francesca9805/zho-100mb-after-wc-uniform-newlex-before-ckpt500-packed-bfdiso_seed10
- Variante hermana con tokenizador uniforme (después del paso 500, semilla 3407): https://huggingface.co/francesca9805/zho-100mb-after-wc-uniform-newlex-after-ckpt500-packed-bfdiso_seed3407
- Ficha en LLM Explorer: https://llm-explorer.com/model/francesca9805%2Ftur-100mb-after-wc-uniform-newlex-before-ckpt500-packed-bfdiso_seed10,4DLoBa7wgbPEoviH1byDDP
- Ficha en FriendliAI: https://friendli.ai/models/francesca9805/zho-100mb-after-wc-uniform-newlex-before-ckpt500-packed-bfdiso_seed10
- Ficha en free2aitools: https://free2aitools.com/model/francesca9805/zho-100mb-after-wc-uniform-newlex-before-ckpt500-packed-bfdiso_seed10
