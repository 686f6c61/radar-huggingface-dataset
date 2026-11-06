# open-sci/open-sci-ref-v0.02-1.7b-fineweb-edu-1.4t-300B-4096-longsft_16k-DPO-Tulu3-decontaminated-sr30k

## Resumen

El modelo `open-sci-ref-v0.02-1.7b-fineweb-edu-1.4t-300B-4096-longsft_16k-DPO-Tulu3-decontaminated-sr30k` es un ajuste fino (SFT) del checkpoint de referencia `open-sci-ref-v0.02-1.7b` publicado por la organizacion `open-sci` en Hugging Face. Se trata de un transformer de 1.714.377.728 parametros (aproximadamente 1,7 mil millones) cuyo nombre documenta la cadena de entrenamiento del modelo base: preentrenamiento sobre FineWeb-Edu con 1,4 billones de tokens y una ventana de 4096 tokens, seguido de un SFT de contexto largo (16k), una fase de DPO y un filtrado de decontaminacion, con Tulu3 como referencia de datos y `sr30k` como identificador del conjunto de SFT final.

Este checkpoint concreto anade un ajuste fino supervisado adicional sobre el dataset `Superior-Reasoning-SFT-gpt-oss-120b-30k-sharegpt-hf`, un conjunto de 30.000 ejemplos de razonamiento en formato ShareGPT generado a partir de `gpt-oss-120b`. El objetivo declarado por la nomenclatura es reforzar las capacidades de razonamiento y seguir instrucciones de un modelo pequeno, manteniendo la base de conocimiento del preentrenamiento. Es relevante para la comunidad open source porque forma parte de un linaje de modelos de referencia reproducibles y completamente documentados en su pipeline de datos, algo poco habitual en modelos de este tamano.

La ficha se basa exclusivamente en los metadatos de Hugging Face y en la model card generada automaticamente por el Trainer de Llama Factory. La model card esta practicamente vacia en las secciones de descripcion, usos previstos y datos de evaluacion, por lo que multiples apartados de esta ficha se marcan como "no disponible". El modelo acumula 15 descargas y 0 likes en el momento de la consulta, y su licencia figura como `other`, sin terminos adicionales publicados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Llama, inferida del pipeline `feature-extraction` y del linaje `open-sci-ref-v0.02`; no confirmada explicitamente en la model card) |
| Parametros totales | 1.714.377.728 (dato real de safetensors) |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible en la model card; el nombre del checkpoint base indica entrenamiento con ventana de 4096 tokens y SFT de 16k |
| Tipos de cuantizacion | no disponible (solo se publican pesos safetensors; no se documentan GGUF ni cuantizaciones oficiales) |
| Idiomas soportados | no disponible |
| Licencia | other (sin terminos adicionales publicados) |
| Formato de pesos | safetensors (libreria transformers; tamano del repo 3,4 GB) |

## Arquitectura y entrenamiento

La arquitectura exacta no se detalla en la model card. Por el linaje del modelo base (`open-sci-ref-v0.02-1.7b`), el pipeline declarado (`feature-extraction`) y el uso de Llama Factory para el ajuste, se trata con alta probabilidad de un transformer decoder-only de tipo Llama con 1,7 mil millones de parametros. El nombre del checkpoint base documenta la secuencia de entrenamiento: preentrenamiento sobre FineWeb-Edu con 1,4 billones de tokens y contexto de 4096, SFT de contexto largo hasta 16k, una fase de DPO y un proceso de decontaminacion. No se especifican la composicion exacta del dataset, el numero de tokens de cada fase ni los detalles del filtrado de decontaminacion.

El ajuste fino de este checkpoint se realizo con Llama Factory en modo `full` (todos los parametros, sin LoRA) sobre el dataset `Superior-Reasoning-SFT-gpt-oss-120b-30k-sharegpt-hf`, compuesto por 30.000 ejemplos en formato ShareGPT. Los hiperparametros documentados son: learning rate 4e-05, batch size total 128 (batch 1 por dispositivo, 32 dispositivos, 4 pasos de acumulacion de gradiente), 5 epocas, optimizador AdamW fused con betas (0,9; 0,999) y epsilon 1e-08, scheduler coseno con warmup ratio 0,1 y semilla 42. El entrenamiento se ejecuto con Transformers 4.57.3, PyTorch 2.10.0+cu128, Datasets 4.8.4 y Tokenizers 0.22.2. No se documentan innovaciones tecnicas adicionales como decodificacion especulativa o atencion lineal.

## Capacidades

- Generacion de texto y ajuste a instrucciones: el modelo ha pasado por SFT sobre un dataset de instrucciones en formato ShareGPT, por lo que se espera que responda a prompts conversacionales.
- Razonamiento: el dataset de ajuste (`Superior-Reasoning-SFT-gpt-oss-120b-30k-sharegpt-hf`) esta orientado explicitamente a razonamiento, generado a partir de `gpt-oss-120b`.
- Extraccion de caracteristicas: el pipeline declarado en Hugging Face es `feature-extraction`, por lo que el modelo puede emplearse para obtener representaciones ocultas.
- Soporte de tool calling / function calling: no disponible (no documentado).
- Soporte de agentes y razonamiento multi-paso: no disponible (no documentado).
- Capacidades multilingues: no disponible (idiomas no declarados).
- Capacidades especiales (thinking mode, vision, audio): no disponible (no documentado).

## Casos de uso

- Generacion de texto asistida en local: con 1,7 mil millones de parametros, el modelo cabe en GPUs de consumo y puede desplegarse para tareas de redaccion y resumen en entornos con recursos limitados.
- Prototipado de pipelines de razonamiento: el ajuste sobre un dataset de razonamiento permite experimentar con cadenas de pensamiento en un modelo pequeno antes de escalar a modelos mayores.
- Extraccion de embeddings: dado el pipeline `feature-extraction`, puede usarse para generar representaciones de texto en sistemas de busqueda semantica o clasificacion.
- Ajuste fino posterior como base: al ser un checkpoint de referencia con linaje documentado, sirve como punto de partida para experimentos de SFT o DPO adicionales con Llama Factory.
- Evaluacion comparativa de tecnicas de entrenamiento: su nombre documenta cada fase (FineWeb-Edu, DPO, Tulu3, decontaminacion, SFT de razonamiento), lo que lo hace util en estudios sobre el impacto de cada etapa.
- Educacion e investigacion: modelo pequeno y abierto para estudiar el efecto de datos sinteticos de razonamiento generados por un modelo mayor (`gpt-oss-120b`).

## Benchmarks y rendimiento

La model-index del autor declara una unica entrada (`sft__Superior-Reasoning-SFT-gpt-oss-120b-30k-sharegpt-hf__open-sci-re-cfcc8751__sdpa-open-sci-steps`) con una lista de resultados vacia. La model card no incluye ninguna tabla de evaluacion.

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Como referencia orientativa por tamano (1,71 mil millones de parametros), en FP16 los pesos ocupan aproximadamente 3,4 GB, y en cuantizacion de 8 bits alrededor de 1,7 GB; no se han publicado cuantizaciones oficiales.
- GPU recomendadas: no disponible (no documentado por el autor).
- Cabe en GPU de consumo: no confirmado oficialmente; por tamano, es compatible con GPUs consumer con suficiente VRAM, pero el autor no publica requisitos.
- Opciones de despliegue: transformers (libreria declarada). No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

No se dispone de datos de rendimiento del modelo ni de alternativas evaluadas en la misma informacion, por lo que la comparativa cuantitativa no esta disponible. A continuacion se indica lo que si puede contrastarse a nivel de metadatos:

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| open-sci-ref-v0.02-1.7b-...-sr30k (este modelo) | 1.714.377.728 | no disponible (base con ventana 4096 y SFT 16k) | other | Hugging Face, 15 descargas |
| Modelos de ~1,7B de la familia Llama | no disponible en esta busqueda | no disponible | no disponible | no disponible |
| Alternativas de razonamiento de ~1-2B | no disponible en esta busqueda | no disponible | no disponible | no disponible |

No se han encontrado en la informacion proporcionada modelos comparables con datos verificables.

## Limitaciones y advertencias

- La model card esta generada automaticamente y no documenta usos previstos, limitaciones ni datos de evaluacion; el autor no ha completado esas secciones.
- No se declaran los idiomas soportados, por lo que no puede garantizarse un comportamiento adecuado en castellano ni en otros idiomas distintos del ingles de los datos de preentrenamiento (FineWeb-Edu).
- Riesgo de alucinacion: no evaluado ni documentado; en modelos de 1,7B el riesgo es estructuralmente alto en tareas de conocimiento factual.
- Sesgos conocidos: no documentados; los sesgos de FineWeb-Edu y del dataset sintetico de razonamiento no han sido analizados por el autor.
- Licencia `other` sin terminos publicados: no puede confirmarse el uso comercial; es necesario contactar con el autor antes de un despliegue en produccion.
- El dataset de ajuste es sintetico (generado a partir de `gpt-oss-120b`), lo que puede introducir sesgos y errores del modelo generador.
- No se publican cuantizaciones oficiales (GGUF, AWQ, GPTQ), lo que limita el despliegue en entornos de bajos recursos sin conversion manual.
- El pipeline declarado es `feature-extraction`, no `text-generation`, lo que puede requerir configuracion manual para uso generativo.
- El checkpoint base pertenece a otro autor (`ali-elganzory`), por lo que la trazabilidad y el soporte del linaje no estan garantizados por `open-sci`.

## Enlaces

- Hugging Face: https://huggingface.co/open-sci/open-sci-ref-v0.02-1.7b-fineweb-edu-1.4t-300B-4096-longsft_16k-DPO-Tulu3-decontaminated-sr30k
- Modelo base: https://huggingface.co/ali-elganzory/open-sci-ref-v0.02-1.7b-fineweb-edu-1.4t-300B-4096-longsft_16k-DPO-Tulu3-decontaminated
- Organizacion en Hugging Face: https://huggingface.co/open-sci
- Llama Factory (framework de entrenamiento): https://github.com/hiyouga/LLaMA-Factory
- FineWeb-Edu (dataset de preentrenamiento): https://huggingface.co/datasets/HuggingFaceFW/fineweb-edu
- Tulu3 (referencia de datos de instruccion): https://huggingface.co/datasets/allenai/tulu-3-sft-mixture
