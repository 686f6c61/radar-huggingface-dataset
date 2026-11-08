# masluny/sokolik-300m-base

## Resumen

Sokolik-300M (base) es un modelo de lenguaje en polaco de 304,1 millones de parámetros entrenado desde cero por el desarrollador independiente masluny. Se trata de un proyecto de estudiante que cubre un hueco poco frecuente: modelos pequeños y monolingües para polaco, con un tamaño que permite ejecución en hardware modesto. La arquitectura es la de Qwen3 (RoPE, RMSNorm, SwiGLU, GQA, QK-norm y embeddings atados), lo que permite cargarlo con `transformers`, vLLM y llama.cpp sin código personalizado.

La innovación principal es el control de registro (formal, neutro, coloquial) mediante etiquetas especiales al inicio del documento (`<|reg:formalny|>`, `<|reg:neutralny|>`, `<|reg:potoczny|>`). El 90 % de los documentos de entrenamiento comienzan con su registro predicho por un clasificador entrenado con etiquetas de Bielik-11B. El modelo se entrenó con 12.000 millones de tokens del mix M2 (FineWeb-2 en polaco filtrado por valor educativo, Wikipedia en polaco y Wolne Lektury), en 47,5 horas sobre una A100 40GB con un coste aproximado de 34 USD.

Con 2.048 tokens de contexto y licencia Apache 2.0, está pensado como base para ajuste fino, clasificación de toxicidad (ya existe sokolik-tox-pl) y experimentación con control de estilo en lenguas eslavas. No es un modelo de conocimiento: su utilidad está en la fluidez del polaco y en el control de registro, no en la veracidad factual.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only estilo Qwen3 (RoPE, RMSNorm, SwiGLU, GQA, QK-norm, embeddings atados) |
| Parametros totales | 304.140.288 (304,1M) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 2.048 tokens |
| Tipos de cuantizacion | no disponible (los pesos se publican en safetensors; al ser arquitectura Qwen3, es compatible con cuantizaciones estándar GGUF/llama.cpp, pero el autor no las documenta) |
| Idiomas soportados | polaco (pl) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

Detalles adicionales de arquitectura: 24 capas, `d_model` 1024, 16 cabezas de consulta y 4 de clave-valor, dimensión intermedia SwiGLU de 2816. Tokenizador BPE a nivel de byte con 32.768 tokens, entrenado en polaco (1,62-1,89 tokens por palabra). Tamaño del repositorio: 0,6 GB.

## Arquitectura y entrenamiento

El modelo sigue la arquitectura Qwen3 en su variante pequeña: transformer decoder-only con RoPE, RMSNorm pre-norm, activación SwiGLU, atención con grouped-query attention (16 cabezas Q / 4 KV) y QK-norm para estabilidad, con embeddings de entrada y salida atados. Esta elección permite compatibilidad directa con el ecosistema (transformers, vLLM, llama.cpp) sin kernels ni código a medida.

El entrenamiento usó 12.000 millones de tokens del mix M2, aproximadamente una época, compuesto por FineWeb-2 en polaco por encima de la mediana de valor educativo, su parte coloquial, Wikipedia en polaco y Wolne Lektury completos. Los datos se deduplicaron contra los conjuntos de evaluación y se sustituyeron los datos personales (PII) por tokens placeholder. El 90 % de los documentos llevan una etiqueta de registro al inicio, generada por un clasificador entrenado con etiquetas de Bielik-11B. Optimizador AdamW (β 0,9/0,95), weight decay 0,1, LR 1,5e-3, schedule WSD con cooldown 1−√ en el último 20 % y batch de 524.288 tokens. Cómputo: 47,5 horas en una A100 40GB, 71k tokens/s, MFU 0,55. No se menciona RLHF ni DPO: es un modelo base puro.

## Capacidades

- Generación de texto en polaco con fluidez alta para su tamaño, incluyendo prosa formal y legal, estilo enciclopédico y periodístico, y registro coloquial de foro.
- Control de registro mediante etiquetas: `<|reg:formalny|>` (prosa oficial y legal), `<|reg:neutralny|>` (enciclopédico y noticias), `<|reg:potoczny|>` (publicaciones de foro). Sin etiqueta, el modelo elige el registro por sí mismo.
- Modelado de lenguaje y continuación de texto: adecuado como base para ajuste fino supervisado y para tareas de scoring de perplejidad.
- Clasificación derivada: el propio autor ha publicado un clasificador de toxicidad ajustado desde este modelo (sokolik-tox-pl), lo que demuestra su utilidad como backbone.
- No soporta tool calling ni function calling de forma nativa (es un modelo base sin entrenamiento de instrucciones).
- No soporta agentes ni razonamiento multi-paso entrenado.
- Multilingüe: no; únicamente polaco.
- Sin modo thinking, visión ni audio.

## Casos de uso

- Ajuste fino supervisado para asistentes en polaco: al ser un modelo base de 304M con licencia Apache 2.0, se puede afinar con SFT en una sola GPU consumer para tareas concretas (atención al cliente, resúmenes de noticias) partiendo de un modelo que ya escribe polaco con fluidez.
- Generación de texto con control de estilo: en sistemas de publicación o marketing que necesiten variar entre tono formal, neutro y coloquial, la etiqueta de registro al inicio del prompt permite fijar el estilo sin prompting complejo ni few-shot.
- Clasificación de toxicidad y moderación: el modelo sirve como backbone para clasificadores (el autor ya publica sokolik-tox-pl); su conocimiento del registro coloquial y vulgar lo hace útil para detectar lenguaje ofensivo en foros polacos.
- Prototipado y experimentación académica: con 0,6 GB de pesos y 2.048 tokens de contexto, se puede ejecutar en portátiles y GPUs de gama baja para investigar control de estilo, tokenización BPE en lenguas eslavas o currículos de entrenamiento.
- Generación aumentada de datos sintéticos en polaco: útil para crear corpus de texto en distintos registros (formal, coloquial) que alimenten otros modelos o sistemas de evaluación, dado el control explícito de estilo.
- Evaluación de perplejidad y benchmarking de modelos polacos: el autor proporciona métricas de bits por byte en cinco dominios (Wikipedia, libros, web, coloquial, vulgar), lo que permite usarlo como referencia en comparativas de modelos pequeños en polaco.
- Aplicaciones de bajo consumo en el borde: al ser un modelo de 304M, puede desplegarse en CPU o en GPUs integradas para generación de texto offline en polaco donde no se requiera conocimiento factual.

## Benchmarks y rendimiento

El autor publica bits por byte (menor es mejor) sobre texto polaco reservado, evaluando cada documento por separado en ventanas de hasta 2.048 tokens.

| Modelo | Params | Wikipedia | Libros | Web | Coloquial | Vulgar |
|---|---|---|---|---|---|---|
| **Sokolik-300M** | 304M | 0.765 | 1.253 | **0.855** | **1.036** | **1.215** |
| sdadas/polish-gpt2-medium | 357M | 1.225 | 1.555 | 1.119 | 1.318 | 1.443 |
| HuggingFaceTB/SmolLM2-360M | 362M | 1.839 | 2.247 | 1.855 | 1.999 | 2.146 |
| Qwen/Qwen3-0.6B-Base | 596M | 1.263 | 1.704 | 1.310 | 1.497 | 1.694 |
| Qwen/Qwen3.5-0.8B-Base | 752M | 1.073 | 1.539 | 1.170 | 1.389 | 1.577 |
| sdadas/polish-gpt2-large | 776M | 1.179 | 1.522 | 1.087 | 1.284 | 1.419 |
| utter-project/EuroLLM-1.7B | 1657M | **0.726** | **1.233** | 0.879 | 1.081 | 1.265 |

Advertencia del autor: los textos reservados provienen de las mismas fuentes de Sokolik (FineWeb-2, Wikipedia, Wolne Lektury), por lo que la comparación es in-distribution para él, mientras que los otros modelos probablemente entrenaron con los textos públicos de Wikipedia y Wolne Lektury. No se han publicado resultados de benchmarks de tareas (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos en safetensors ocupan unos 0,6 GB (fp32) o aproximadamente 0,3 GB en fp16/bf16; en cuantización de 8 bits, alrededor de 0,3 GB, y en 4 bits, unos 0,15-0,2 GB, más el overhead de activaciones y KV cache (pequeño por los 2.048 tokens de contexto).
- GPU recomendadas: cualquier GPU con 2 GB o más de VRAM es suficiente; A100, H100, RTX 4090, RTX 3090 o incluso RTX 3060 lo ejecutan sin problema. También funciona en CPU.
- Cabe en GPU consumer: sí, en cualquier GPU consumer moderna (GTX 1060 6GB en adelante, e incluso en iGPU con suficiente memoria compartida).
- Opciones de despliegue: `transformers` (soporte nativo), vLLM y llama.cpp según indica el autor; también TGI por la etiqueta `text-generation-inference` del repositorio. Ollama no está documentado explícitamente, pero al ser compatible con llama.cpp es viable convertir los pesos a GGUF.
- Latencia y throughput estimados: el autor reporta 71k tokens/s durante el entrenamiento en una A100 40GB (MFU 0,55); no se publican cifras de inferencia. Por el tamaño, se espera throughput muy alto en GPU y decenas de tokens por segundo en CPU.

## Comparativa con modelos similares

| Modelo | Params | Contexto | Idiomas | Licencia | Bpb web (polaco) |
|---|---|---|---|---|---|
| **Sokolik-300M** | 304M | 2.048 | pl | Apache 2.0 | **0.855** |
| sdadas/polish-gpt2-medium | 357M | 1.024 (GPT-2) | pl | no disponible en la información | 1.119 |
| HuggingFaceTB/SmolLM2-360M | 362M | 8.192 | en (multilingüe limitado) | Apache 2.0 | 1.855 |
| Qwen/Qwen3-0.6B-Base | 596M | 32.768 | multilingüe | Apache 2.0 | 1.310 |
| utter-project/EuroLLM-1.7B | 1.657M | 4.096 | multilingüe europeo | Apache 2.0 | 0.879 |

Sokolik-300M obtiene el mejor bits por byte en web, coloquial y vulgar entre los modelos de su rango de tamaño en polaco, y se acerca a EuroLLM-1.7B (5,4 veces más grande) en web y coloquial. Frente a SmolLM2-360M y Qwen3-0.6B-Base, la diferencia es muy amplia en polaco, lo esperable al ser modelos mayoritariamente ingleses o multilingües. La comparación es in-distribution para Sokolik, como advierte el autor.

## Limitaciones y advertencias

- Modelo pequeño y joven: con 304M de parámetros escribe polaco fluido pero sabe poco e inventa hechos. No debe usarse como fuente de información.
- Sin entrenamiento de seguridad: entrenado con texto web, puede producir contenido ofensivo, sesgado o sexual, especialmente con la etiqueta vulgar.
- La etiqueta `<|reg:wulgarny|>` no es útil: solo 510 documentos de entrenamiento la tenían, casi todos spam sexual, y eso es lo que genera.
- Datos personales: se eliminaron PII con reglas (correos, teléfonos, cuentas bancarias, PESEL y números de identidad), pero el modelo aún puede generar nombres y otros detalles de sus datos de entrenamiento.
- Etiquetas de registro: proceden de un LLM y concuerdan solo débilmente con un evaluador humano (según el informe técnico).
- Contexto limitado a 2.048 tokens: no apto para documentos largos ni conversaciones multi-turno extensas.
- Monolingüe: solo polaco; no se debe esperar calidad en castellano ni en otras lenguas.
- Licencia Apache 2.0 permite uso comercial, pero sin formación de instrucciones el modelo no sigue instrucciones de forma fiable; requiere ajuste fino previo.
- Proyecto de estudiante: el código de entrenamiento se publicará junto con el informe técnico, pero no está disponible en el momento de redactar esta ficha.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/masluny/sokolik-300m-base
- Versión con ajuste de instrucciones: https://huggingface.co/masluny/sokolik-300m-chat
- Clasificador de toxicidad derivado: https://huggingface.co/masluny/sokolik-tox-pl
- Dataset FineWeb-2: https://huggingface.co/datasets/HuggingFaceFW/fineweb-2
- Dataset Wikipedia (Wikimedia): https://huggingface.co/datasets/wikimedia/wikipedia
- Informe técnico y código de entrenamiento: no disponible en la información proporcionada.
