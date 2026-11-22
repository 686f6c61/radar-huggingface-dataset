# axteam/PaddleOCR-VL-GGUF

## Resumen

PaddleOCR-VL-GGUF es una cuantización en formato GGUF del modelo PaddlePaddle/PaddleOCR-VL, publicada por el usuario axteam. Se trata de una conversión de posentrenamiento (PTQ) realizada con las herramientas de llama.cpp (`convert_hf_to_gguf.py` seguida de `llama-quantize`), pensada para ejecutar el modelo en llama.cpp, Ollama y LM Studio. El repositorio contiene únicamente el backbone de texto del modelo original, con 466.654.208 parámetros, y no incluye el codificador visual.

La relevancia de esta publicación es limitada y conviene entenderla bien antes de descargarla: al carecer del codificador de visión, estos ficheros GGUF no pueden realizar la tarea de OCR para la que fue diseñado el modelo original. El propio autor lo advierte de forma explícita en la model card y documenta que, en sus pruebas, los ficheros no responden correctamente a preguntas de chat triviales. Se trata, por tanto, de un artefacto para inspeccionar o experimentar con el backbone de texto, no de una alternativa funcional al modelo original.

El modelo base es un OCR de PaddlePaddle con licencia Apache 2.0, y esta derivada conserva esa misma licencia. El repositorio ocupa 0,8 GB e incluye dos cuantizaciones: Q4_K_M (0,3 GB) y Q8_0 (0,5 GB).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (backbone de texto reconocido por llama.cpp como `paddleocr`, con backbone ERNIE-4.5) |
| Parametros totales | 466.654.208 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible (en los ejemplos se usa `-c 8192`) |
| Tipos de cuantizacion | Q4_K_M (4 bits, k-quant), Q8_0 (8 bits) |
| Idiomas soportados | no disponible (la model card incluye pruebas en ingles y coreano) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF |
| Tamano del repositorio | 0,8 GB |
| Herramienta de conversion | llama.cpp `convert_hf_to_gguf.py` + `llama-quantize` |
| Version minima de llama.cpp | b8110 (arquitectura `paddleocr`); `-fa on` requiere b6325 o superior |
| Incluye codificador visual | No |
| Chat template | Si, embebido en cada fichero |

## Arquitectura y entrenamiento

El modelo base PaddleOCR-VL es un sistema de OCR que combina un backbone de lenguaje con un codificador de vision. Esta publicacion GGUF contiene exclusivamente el backbone de texto, identificado por la herramienta de conversion de llama.cpp como arquitectura `paddleocr` con backbone de texto ERNIE-4.5. No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO, ya que la model card de esta derivada no los detalla.

La cuantizacion es de tipo post-training (PTQ), sin reentrenamiento: los pesos BF16 originales se cuantizan por bloques (k-quants, con escalas por bloque y asignacion mixta de bits). No se introduce ninguna innovacion tecnica adicional; el valor del repositorio esta en ofrecer una conversion funcional a GGUF con el `chat_template` original embebido.

## Capacidades

- Generacion de texto a partir del backbone de lenguaje del modelo OCR original.
- Conversacion basica mediante el `chat_template` embebido (formato chat soportado por llama.cpp con `--jinja`).
- Servicio de API compatible con OpenAI a traves de `llama-server`.
- Ejecucion en llama.cpp, Ollama y LM Studio.
- No realiza OCR ni procesa imagenes: el codificador visual no esta incluido y no hay fichero `mmproj`.
- No es un modelo de chat general: en las pruebas del autor, ningun fichero respondio correctamente a preguntas simples como la capital de Francia o de Corea.
- Soporte de tool calling, agentes, vision, audio o modo thinking: no disponible.

## Casos de uso

- Evaluacion de la calidad de cuantizacion: comparar la perplejidad de Q4_K_M frente a Q8_0 sobre corpus de texto (WikiText-2, Wikipedia en coreano) para decidir que fichero usar en experimentos con el backbone.
- Investigacion sobre backbones ERNIE-4.5 en llama.cpp: cargar el modelo para estudiar el comportamiento del backbone de texto aislado del pipeline multimodal.
- Pruebas de integracion de llama.cpp: validar que la build soporta la arquitectura `paddleocr` y el `chat_template` embebido antes de abordar el modelo completo.
- Despliegue ligero en entornos con pocos recursos: con 0,3-0,5 GB de pesos, cabe en cualquier GPU de consumo e incluso en CPU, util para pruebas de infraestructura sin coste de VRAM.
- Referencia para conversion de modelos PaddlePaddle a GGUF: el repositorio sirve como ejemplo practico del flujo `convert_hf_to_gguf.py` + `llama-quantize` sobre un modelo de PaddlePaddle.
- No es adecuado para OCR en produccion, atencion al cliente, generacion de codigo ni ninguna tarea que requiera el pipeline completo: para OCR de extremo a extremo hay que usar el modelo original o la build FP8 `axteam/PaddleOCR-VL-FP8-dynamic` con vLLM.

## Benchmarks y rendimiento

Perplejidad medida por el autor con llama.cpp b12005 (commit e0f142d, build CUDA) sobre una NVIDIA B200, con todas las capas en GPU, 64 ventanas de 2.048 tokens de WikiText-2 y de una muestra de Wikipedia en coreano (menor es mejor). Al no haber fichero BF16 en el repositorio, los porcentajes son relativos a Q8_0.

| Fichero | PPL WikiText-2 | PPL Wikipedia coreano | vs Q8_0 (EN / KO) |
|---|---|---|---|
| PaddleOCR-VL-Q8_0.gguf | 73,24 | 23,64 | referencia |
| PaddleOCR-VL-Q4_K_M.gguf | 83,53 | 26,46 | +14,1% / +11,9% |

El autor advierte que se trata de un modelo de OCR medido sobre texto plano, por lo que los valores absolutos no son comparables con modelos de lenguaje generales y solo sirven para comparar los ficheros entre si. No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: los pesos ocupan 0,3 GB (Q4_K_M) y 0,5 GB (Q8_0); hay que sumar la cache KV del contexto elegido con `-c`.
- Reduccion de cache KV: `--cache-type-k q8_0 --cache-type-v q8_0 -fa on` reduce a la mitad la memoria de la cache KV.
- GPU recomendadas: cualquier GPU moderna sirve por el tamano; el autor valido en una NVIDIA B200. Cabe en GPU de consumo (RTX 3060, RTX 4090, etc.) y en CPU.
- Despliegue: llama.cpp (build >= b8110), `llama-server` con API compatible con OpenAI, Ollama (`ollama run hf.co/axteam/PaddleOCR-VL-GGUF:Q4_K_M`) y LM Studio (no probado por el autor en Ollama ni LM Studio).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Vision / OCR | Licencia | Formato |
|---|---|---|---|---|---|
| axteam/PaddleOCR-VL-GGUF (este) | 466.654.208 (solo backbone de texto) | no disponible | No | Apache 2.0 | GGUF |
| PaddlePaddle/PaddleOCR-VL (original) | no disponible en la informacion proporcionada | no disponible | Si (pipeline OCR completo) | Apache 2.0 | safetensors |
| axteam/PaddleOCR-VL-FP8-dynamic | no disponible en la informacion proporcionada | no disponible | Si (build FP8 para vLLM) | Apache 2.0 | no disponible |

No se dispone de datos de rendimiento comparativos entre estas variantes en la informacion proporcionada.

## Limitaciones y advertencias

- No incluye el codificador visual: no puede hacer OCR ni aceptar imagenes; no hay fichero `mmproj`.
- No es un modelo de chat general: en las pruebas del autor fallo preguntas triviales (capital de Francia y de Corea), con respuestas incorrectas o que repetian la pregunta.
- La cuantizacion Q4_K_M degrada la perplejidad un 14,1% en ingles y un 11,9% en coreano respecto a Q8_0; si importa la calidad, usar Q8_0.
- Los valores de perplejidad absolutos no son comparables con modelos de lenguaje generales por tratarse de un backbone de OCR medido sobre texto plano.
- Requiere llama.cpp >= b8110 para la arquitectura `paddleocr`; versiones anteriores no cargaran el modelo.
- Ollama y LM Studio no fueron probados por el autor.
- Riesgo de alucinacion y sesgos: no documentados en la informacion disponible.
- Licencia Apache 2.0, que permite uso comercial de esta derivada; los pesos y el tokenizer originales pertenecen a PaddlePaddle.
- Para produccion con OCR real, usar el modelo original o la build FP8 con vLLM, no estos GGUF.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/axteam/PaddleOCR-VL-GGUF
- Modelo base: https://huggingface.co/PaddlePaddle/PaddleOCR-VL
- Build FP8 para vLLM: https://huggingface.co/axteam/PaddleOCR-VL-FP8-dynamic
