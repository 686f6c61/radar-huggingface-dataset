# puretensor/Jais-3-0.9B-NVFP4A16

## Resumen

Jais-3-0.9B-NVFP4A16 es una version cuantizada a 4 bits del modelo Jais-3-0.9B, el miembro mas pequeno de la familia Jais-3 desarrollada por Inception42. El modelo base es un transformer decoder-only de 1.078.285.824 parametros (aproximadamente 1,08 mil millones) especializado en texto arabe e ingles, con una plantilla de chat que incorpora un campo de razonamiento explicito en los turnos del asistente. La cuantizacion ha sido realizada por PureTensor a partir de los pesos oficiales en BF16 y se distribuye como un checkpoint de solo pesos en formato compressed-tensors.

La relevancia de esta ficha no reside tanto en el modelo base como en el proceso de cuantizacion: el autor documenta de forma detallada por que las recetas estandar de GPTQ fallan en este modelo concreto y propone una modificacion (limitar la estadistica de calibracion por token) que recupera buena parte de la calidad perdida. El checkpoint final pesa 0,89 GB frente a los 2,16 GB del BF16, lo que lo hace viable en GPUs de consumo con muy poca VRAM.

Se trata de un lanzamiento de prueba, no afiliado ni respaldado por los autores del modelo original, y esta pensado para evaluacion de la tecnica de cuantizacion NVFP4A16 sobre modelos pequenos y multilingues con mezcla de arabe e ingles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (28 bloques transformer, segun la model card) |
| Parametros totales | 1.078.285.824 (1,08 B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | NVFP4A16 (W4A16): valores de 4 bits en formato E2M1, una escala FP8 E4M3 por grupo de 16 y una escala FP32 por tensor; pesos de las capas `Linear` cuantizados, embeddings, cabeza de salida, normas y activaciones en BF16 |
| Idiomas soportados | arabe (ar) e ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors con esquema compressed-tensors `nvfp4-pack-quantized`; compatible con transformers y vLLM |

## Arquitectura y entrenamiento

El modelo base es un transformer decoder-only de 28 bloques con una plantilla de chat que exige un campo `reasoning_content` en los turnos del asistente, lo que sugiere un entrenamiento orientado a razonamiento explicito. No se dispone en la informacion proporcionada de datos sobre el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO en el modelo original.

La innovacion tecnica destacable de este checkpoint es el metodo de cuantizacion. El autor aplica GPTQ con `block_size` 128, `dampening_frac` 0.01 y `actorder` estatico, pero anade una limitacion en las estadisticas de calibracion: durante la acumulacion de estadisticas de cada capa, cualquier token cuya norma de entrada supere en mas de 4 veces la norma mediana de su secuencia se reduce hasta ese limite. El motivo es que en este modelo una capa MLP temprana (bloque 1 si el prompt empieza con el token de inicio de texto, bloque 3 si no) recibe en la primera posicion una entrada cuya norma cuadrada es millones de veces superior a la de cualquier otra posicion, acaparando mas del 99,9% de las estadisticas de calibracion de esa capa. Sin el limite, GPTQ optimiza para ese unico token y degrada el resto. La calibracion usa 2.048 muestras de hasta 2.048 tokens: 1.024 pares instruccion-respuesta en arabe de `arbml/CIDAR` y 1.024 de `mlabonne/open-perfectblend`, alternando filas con plantilla de chat y filas en texto plano sin token de inicio de texto. Las herramientas empleadas son llm-compressor 0.15.0, compressed-tensors 0.20.1, transformers 5.21.0 y torch 2.14.1.

## Capacidades

- Generacion de texto conversacional en arabe e ingles, con soporte de plantilla de chat y campo de razonamiento (`reasoning_content`).
- Razonamiento de un solo paso y generacion de respuestas instruidas; el modelo base esta disenado para producir contenido de razonamiento explicito en los turnos del asistente.
- Resolucion de problemas matematicos elementales (evaluado en GSM8K).
- Conocimiento general y de dominio arabe (evaluado en MMLU y ArabicMMLU).
- Capacidad multilingue limitada a los dos idiomas declarados: arabe e ingles.
- No hay evidencia en la informacion disponible de soporte de tool calling, function calling, agentes multi-paso, vision, audio ni otras modalidades.

## Casos de uso

- Evaluacion de tecnicas de cuantizacion: el checkpoint sirve como referencia reproducible para comparar recetas GPTQ estandar frente a la receta con limite de estadisticas, gracias a la tabla de resultados publicada con MMLU, ArabicMMLU, GSM8K y perplejidad.
- Despliegue en entornos con VRAM muy limitada: con 0,89 GB de pesos, el modelo cabe en GPUs de consumo de gama baja y en entornos de CPU/GPU integrada, permitiendo prototipos de generacion de texto en arabe sin infraestructura dedicada.
- Generacion de texto en arabe para prototipos: el modelo mantiene un 44,92 de precision en ArabicMMLU (frente a 47,00 en BF16), lo que lo hace util para tareas de respuesta a preguntas y clasificacion ligera en ese idioma.
- Experimentacion academica con modelos pequenos multilingues: al ser un lanzamiento de prueba con licencia Apache 2.0, es adecuado para estudiar el impacto de la cuantizacion W4A16 en modelos de menos de 1,1 B parametros.
- Asistencia conversacional de baja latencia: al reducir el peso de 2,16 GB a 0,89 GB, el modelo puede servirse con vLLM en una sola GPU pequena para chatbots de dominio acotado en arabe o ingles.
- Validacion de pipelines de calibracion: la documentacion del proceso (mezcla de datos con y sin plantilla de chat, tratamiento del token de inicio de texto) es un caso de estudio util para ingenieros que calibran modelos cuyo tokenizador no anade el token de inicio de texto.

## Benchmarks y rendimiento

Resultados publicados por el autor, comparando el checkpoint cuantizado con el BF16 de referencia. El harness es lm-evaluation-harness 0.4.13 con configuraciones por defecto, sin plantilla de chat, y GSM8K con extraccion flexible.

| Metrica | BF16 | Este checkpoint | Cambio |
|---|---:|---:|---:|
| ArabicMMLU, accuracy (14.455 preguntas) | 47,00 | 44,92 | -2,08 |
| GSM8K, exact match (1.319 problemas) | 45,49 | 42,46 | -3,03 |
| MMLU, accuracy (14.042 preguntas) | 47,24 | 44,74 | -2,50 |
| WikiText-2, perplejidad (131.072 tokens) | 15,37 | 16,08 | +0,71 |

Divergencia KL frente al BF16 (distribucion completa del siguiente token, forzado por profesor, ventanas de 1.024 tokens):

| Texto | Tokens | KL media | KL percentil 99 | Mismo token top-1 que BF16 |
|---|---:|---:|---:|---:|
| WikiText-2 test (ingles) | 131.072 | 0,079 | 0,60 | 85,8% |
| Chat (`HuggingFaceH4/ultrachat_200k`, test_sft, 256 conversaciones, ingles) | 243.954 | 0,070 | 0,62 | 88,0% |
| Arabe (`arbml/CIDAR`, 256 pares desde la fila 9.000) | 72.413 | 0,101 | 0,93 | 84,2% |
| WikiText-2 sin token de inicio de texto | 130.944 | 0,083 | 0,68 | 85,4% |

Comparacion de recetas de cuantizacion sobre el mismo modelo:

| Calibracion | MMLU | ArabicMMLU | GSM8K | KL sin token de inicio |
|---|---:|---:|---:|---:|
| BF16 de referencia | 47,24 | 47,00 | 45,49 | 0 |
| GPTQ estandar, todas las filas con plantilla de chat | 23,74 | 30,80 | 0,08 | 2,07 |
| GPTQ estandar, filas alternas en texto plano | 33,88 | 36,01 | 20,92 | 0,136 |
| Round-to-nearest, sin calibracion | 43,63 | 40,97 | 31,99 | 0,141 |
| Estadisticas limitadas, filas alternas en texto plano (este checkpoint) | 44,74 | 44,92 | 42,46 | 0,083 |

El autor indica que una segunda construccion de la misma receta con filas de calibracion distintas obtuvo 44,86 en MMLU, 44,01 en ArabicMMLU y 43,37 en GSM8K, lo que sugiere que los resultados no son producto de una eleccion afortunada de datos.

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos ocupan 0,89 GB; con overhead de activaciones, cache KV y runtime, un despliegue tipico requiere del orden de 1,5 a 3 GB de VRAM, aunque la cifra exacta no esta publicada.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM; el modelo cabe en RTX 3050, RTX 4060, RTX 4090, A100 y H100 sin problema. Para servir en vLLM se recomienda una GPU con soporte de operaciones FP4 (por ejemplo, arquitecturas Blackwell) para aprovechar el esquema NVFP4A16; en GPUs sin soporte nativo de FP4 el rendimiento puede degradarse.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU de consumo moderna con 4 GB o mas de VRAM.
- Opciones de despliegue: transformers (con `custom_code` y compressed-tensors), vLLM (soporte declarado en los tags) y llm-compressor para reproducir la cuantizacion. No se menciona soporte de llama.cpp, Ollama ni TGI en la informacion disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Disponibilidad |
|---|---:|---|---|---|---|
| Jais-3-0.9B-NVFP4A16 (este) | 1,08 B | no disponible | ar, en | Apache 2.0 | Hugging Face, 0 descargas, 0 likes |
| Jais-3-0.9B (base, BF16) | 1,08 B | no disponible | ar, en | Apache 2.0 | Hugging Face (inception42) |
| Alternativas de ~1 B multilingues arabe/ingles | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone en la informacion proporcionada de resultados de benchmarks de modelos comparables de la misma categoria, por lo que la comparacion cuantitativa con alternativas queda como no disponible.

## Limitaciones y advertencias

- Perdida de calidad medible frente al BF16: -2,50 puntos en MMLU, -2,08 en ArabicMMLU, -3,03 en GSM8K y +0,71 de perplejidad en WikiText-2. El autor califica el checkpoint como lanzamiento de prueba.
- Sensibilidad a la receta de cuantizacion: una receta GPTQ estandar llega a perder entre 11 y 25 puntos o a fallar por completo en este modelo, segun el texto de calibracion. Cualquier re-cuantizacion debe replicar el limite de estadisticas para evitar este fallo.
- Dependencia del token de inicio de texto: el tokenizador del modelo no anade el token de inicio de texto, lo que cambia que capa concentra la estadistica anomala (bloque 1 o bloque 3) y afecta al comportamiento del modelo cuantizado. Los benchmarks publicados se ejecutan sin ese token.
- Sesgos conocidos: no documentados en la informacion disponible. Al estar entrenado principalmente con datos en arabe e ingles, es previsible un sesgo cultural y linguistico hacia esas dos comunidades, pero no hay mediciones publicadas.
- Riesgo de alucinacion: inherente a un modelo de 1,08 B parametros; no se han publicado evaluaciones especificas de factualidad.
- Limitaciones de contexto e idioma: solo arabe e ingles declarados; la longitud de contexto no esta disponible. El rendimiento en idiomas distintos de los dos declarados no esta evaluado.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el autor aclara que el lanzamiento no esta afiliado ni respaldado por los autores del modelo original; conviene verificar la licencia del modelo base por separado.
- Advertencia de produccion: al ser un checkpoint de prueba con 0 descargas y 0 likes, no hay evidencia de uso en produccion ni de validacion independiente de los resultados reportados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/puretensor/Jais-3-0.9B-NVFP4A16
- Modelo base: https://huggingface.co/inception42/Jais-3-0.9B
- Dataset de calibracion arabe: https://huggingface.co/datasets/arbml/CIDAR
- Dataset de calibracion general: https://huggingface.co/datasets/mlabonne/open-perfectblend
- Dataset de evaluacion de chat: https://huggingface.co/datasets/HuggingFaceH4/ultrachat_200k
- Herramienta de cuantizacion: https://github.com/vllm-project/llm-compressor
- Formato compressed-tensors: https://github.com/vllm-project/compressed-tensors
- Harness de evaluacion: https://github.com/EleutherAI/lm-evaluation-harness
