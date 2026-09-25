# MargiPandya/Qwen3-VL-8B-CoT-SFT-vu-ckpt1250

## Resumen

Qwen3-VL-8B-CoT-SFT-vu-ckpt1250 es un ajuste fino supervisado (SFT) del modelo multimodal Qwen/Qwen3-VL-8B-Instruct, orientado a razonamiento encadenado (chain-of-thought, CoT) sobre entradas de multiples imagenes. Lo publica el usuario MargiPandya en HuggingFace bajo licencia Apache 2.0, con 8.767.123.696 parametros (unos 8,77 mil millones) y un repositorio de 17,5 GB en safetensors. La tarea declarada es image-text-to-text, con etiquetas explicitas de multi-image y chain-of-thought.

Tecnicamente se trata de una LoRA fusionada en los pesos base: r=64, alpha=128, dropout=0,05, aplicada sobre las proyecciones q/k/v/o y gate/up/down, con `modules_to_save: ["visual"]`, lo que implica que la torre de vision se entreno por completo y no mediante adaptadores de bajo rango. El entrenamiento se hizo en bf16 con learning rate 1e-5 y se valido sobre TIGER-Lab/Mantis-Eval.

Es relevante ahora mismo por dos motivos. El primero es que es un *checkpoint intermedio* (paso 1250, epoca 0,40 de una ejecucion sin terminar), util para quien quiera inspeccionar el efecto del CoT multimodal en una etapa temprana del entrenamiento. El segundo es que sus resultados publicados muestran un fenomeno interesante: la puntuacion en Mantis-Eval varia entre 73,11 y 38,25 segun el prompt utilizado, lo que convierte al modelo en un caso de estudio sobre sensibilidad al formato de evaluacion en modelos multimodales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal Qwen3-VL (torre de vision + decodificador de texto); detalles internos no disponibles |
| Parametros totales | 8.767.123.696 (8,77 B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada |
| Tipos de cuantizacion | No disponible (pesos publicados en bf16) |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (libreria transformers) |
| Modelo base | Qwen/Qwen3-VL-8B-Instruct |
| Pipeline | image-text-to-text |
| Tarea adicional | Multi-imagen, chain-of-thought |
| Tamano del repositorio | 17,5 GB |
| Vocabulario del tokenizer | 151.643 tokens (26 tokens anadidos) |
| Fecha de creacion | 2026-09-24 |

## Arquitectura y entrenamiento

El modelo parte de Qwen3-VL-8B-Instruct, una arquitectura multimodal con una torre de vision y un decodificador de lenguaje. Sobre esa base se aplico un ajuste LoRA con rango 64, alpha 128 y dropout 0,05, dirigido a las proyecciones de atencion (q/k/v/o) y a las proyecciones del bloque feed-forward (gate/up/down). La particularidad es `modules_to_save: ["visual"]`: la torre de vision no se adapto con LoRA, sino que se entreno en su totalidad y se guardo como modulo completo. Posteriormente los adaptadores se fusionaron en los pesos base, de modo que el resultado carga directamente con `transformers` o vLLM sin necesidad de aplicar LoRA en inferencia.

El entrenamiento se ejecuto en bf16 con learning rate 1e-5. El checkpoint publicado corresponde al paso 1250, epoca 0,40 de una ejecucion inacabada, por lo que no debe interpretarse como un modelo final. No se especifica en la informacion disponible el volumen de tokens de entrenamiento, la composicion del dataset ni si hubo etapas de RLHF o DPO posteriores al SFT. La validacion se hizo sobre TIGER-Lab/Mantis-Eval. Como nota tecnica, el autor documento dos reparaciones mecanicas sobre los pesos en crudo: el `config.json` guardaba `text_config.rope_scaling` como `null`, valor que el codigo de modelado de Qwen3-VL desreferencia, y se relleno a partir de `rope_parameters`; ademas, el tokenizer generado por el entorno de entrenamiento almacenaba `extra_special_tokens` como lista, formato que versiones antiguas de `transformers` rechazan, por lo que se sustituyo por el tokenizer del modelo base tras verificar equivalencia (mismo vocabulario de 151.643 tokens, mismos 26 tokens anadidos y merges coincidentes una vez normalizado el formato de serializacion).

## Capacidades

- Generacion de texto a partir de imagenes y de multiples imagenes simultaneas (`multi-image`).
- Razonamiento encadenado explicito (chain-of-thought) antes de emitir una respuesta, con extraccion posterior mediante la etiqueta `<answer>`.
- Comprension visual multimodal en formato conversacional e interactivo.
- Respuesta condicionada por formato: el modelo distingue prompt de entrenamiento, prompt sin CoT y prompt con CoT, con rendimiento muy distinto en cada caso.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada (el CoT implementado es de un solo turno).
- Capacidades multilingues: no disponible en la informacion proporcionada.
- Capacidades especiales: no se documentan modos de vision adicionales (por ejemplo, video o audio) ni modos de pensamiento separados mas alla del CoT entrenado.

## Casos de uso

- Evaluacion de razonamiento multimodal en investigacion: el modelo permite analizar como un SFT temprano de CoT afecta a tareas de comparacion entre varias imagenes, usando Mantis-Eval y MuirBench como referencia reproducible.
- Estudio de sensibilidad al prompt: dado que las puntuaciones publicadas oscilan entre 38,25 y 73,11 en el mismo benchmark segun el formato de prompt, sirve como caso practico para medir el impacto de la plantilla de evaluacion en pipelines propios.
- Prototipado de asistentes visuales conversacionales: al cargar directamente con `transformers` y vLLM, se puede integrar en una demo de chat que reciba una o varias imagenes y devuelva una explicacion textual encadenada.
- Extraccion de respuestas estructuradas en tareas visuales: el modelo usa una convencion de etiquetas (`<answer>`) que puede aprovecharse para parsear salidas en un pipeline automatizado, siempre que se controle el cierre correcto de la etiqueta.
- Analisis comparativo de productos o documentos a partir de varias imagenes: la entrada multi-imagen permite plantear escenarios de contraste entre capturas, paginas o fotografias dentro de una misma consulta.
- Generacion de razonamiento intermedio auditable: en entornos donde interesa registrar el proceso de razonamiento y no solo la respuesta final, el CoT entrenado proporciona una traza explicita que puede almacenarse y revisarse.
- Base para iteraciones posteriores de ajuste: al ser un checkpoint intermedio con adaptadores ya fusionados, es util como punto de partida o como referencia frente al modelo base en experimentos de continuacion del entrenamiento.
- Verificacion de reproducibilidad de pesos: sirve para validar procedimientos de carga de Qwen3-VL cuando el `config.json` o el tokenizer presentan incompatibilidades con versiones concretas de `transformers`.

## Benchmarks y rendimiento

| Benchmark | Prompt / metodo | Puntuacion |
|---|---|---|
| Mantis-Eval | prompt en formato de entrenamiento, greedy, 8 tokens nuevos | 73,11 |
| Mantis-Eval | lmms-eval `mantis`, sin CoT | 69,59 |
| Mantis-Eval | CoT + extraccion de `<answer>` | 38,25 |
| MuirBench | CoT + extraccion de `<answer>`, juez GPT-4o-mini | 69,62 |

El autor advierte de que la dispersion en Mantis-Eval es un efecto de formato, no de capacidad: bajo el prompt de CoT, este checkpoint cierra la etiqueta `<answer>` en solo el 48 % de las preguntas de Mantis-Eval, frente al 99,9 % en MuirBench, y las respuestas sin cerrar se puntuan como incorrectas. Asimismo, la metrica `eval/accuracy_mcq` del entrenamiento (aproximadamente 0,89) es precision por token con teacher forcing y no es comparable con ninguna de las puntuaciones generativas anteriores.

## Requisitos de hardware

- Pesos en bf16: 8,77 B de parametros, aproximadamente 17,5 GB de pesos en disco (coincide con el tamano del repositorio). VRAM estimada para inferencia en bf16: del orden de 20 a 24 GB, sumando pesos, cache KV y activaciones (estimacion a partir del recuento de parametros; no publicada por el autor).
- Cuantizacion a 8 bits: aproximadamente 9 a 12 GB de VRAM estimados. Cuantizacion a 4 bits: aproximadamente 6 a 8 GB estimados. Estas cifras son estimaciones derivadas del tamano del modelo, no datos publicados.
- GPU recomendadas: A100 40/80 GB, H100, L40S o RTX 6000 Ada para bf16 sin cuantizar; RTX 4090 (24 GB) para bf16 ajustado o cuantizacion 8 bits.
- Cabe en GPU de consumo: si, en RTX 4090 con cuantizacion o con bf16 muy ajustado; en GPUs de 16 GB (RTX 4080, 4060 Ti 16 GB) requeriria cuantizacion a 8 o 4 bits. No disponible confirmacion empirica de estos escenarios.
- Opciones de despliegue: `transformers` (mencionado explicitamente por el autor) y vLLM (tambien citado como compatible con los pesos fusionados). Otras opciones como llama.cpp, Ollama o TGI no estan confirmadas en la informacion disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Rendimiento publicado |
|---|---|---|---|---|---|
| MargiPandya/Qwen3-VL-8B-CoT-SFT-vu-ckpt1250 | 8,77 B | No disponible | Apache 2.0 | safetensors | Mantis-Eval 73,11 / 69,59 / 38,25; MuirBench 69,62 |
| Qwen/Qwen3-VL-8B-Instruct (modelo base) | 8 B (orden, no confirmado en la informacion disponible) | No disponible | No disponible en la informacion proporcionada | No disponible | No disponible |
| Otras alternativas multimodales de ~8 B | No disponible | No disponible | No disponible | No disponible | No disponible |

La comparacion directa con el modelo base es la mas relevante, pero la informacion proporcionada no incluye sus puntuaciones en Mantis-Eval ni en MuirBench, por lo que no es posible cuantificar la ganancia o perdida atribuible al ajuste. No se dispone de datos de otros modelos comparables en la informacion proporcionada.

## Limitaciones y advertencias

- Es un checkpoint intermedio: paso 1250, epoca 0,40 de una ejecucion sin terminar. El propio autor indica que no es un modelo final y que las cifras deben leerse como una instantanea, no como un resultado consolidado.
- Alta sensibilidad al formato del prompt. En Mantis-Eval la puntuacion pasa de 73,11 a 38,25 segun la plantilla utilizada, un factor de casi dos.
- Problema de cierre de etiquetas: bajo prompt de CoT, solo el 48 % de las respuestas de Mantis-Eval cierran la etiqueta `<answer>`, lo que provoca fallos de extraccion y penalizacion automatica. Cualquier pipeline en produccion debe validar el parseo de la salida.
- Riesgo de alucinacion: no cuantificado en la informacion disponible, pero inherente a los modelos multimodales generativos y agravado en un checkpoint no convergido.
- Sesgos conocidos: no documentados en la informacion proporcionada.
- Limitaciones de contexto e idioma: no disponibles. No se especifica la longitud de contexto efectiva tras el ajuste ni las lenguas cubiertas.
- `eval/accuracy_mcq` (~0,89) no es comparable con metricas generativas: es precision por token con teacher forcing y no debe usarse como indicador de calidad en produccion.
- Restricciones de licencia: Apache 2.0, que permite uso comercial, modificacion y redistribucion, siempre que se conserven los avisos de copyright y licencia. Conviene verificar las condiciones del modelo base Qwen3-VL-8B-Instruct, que no se detallan en la informacion proporcionada.
- Trazabilidad limitada: el repositorio tiene 0 descargas y 0 likes en la fecha de consulta, sin validacion independiente de los resultados.
- Reparaciones manuales en `config.json` y tokenizer: si se reutilizan los ficheros originales del entorno de entrenamiento en lugar de los publicados, pueden aparecer errores de carga en versiones concretas de `transformers`.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/MargiPandya/Qwen3-VL-8B-CoT-SFT-vu-ckpt1250
- Modelo base: https://huggingface.co/Qwen/Qwen3-VL-8B-Instruct
- Dataset de validacion: https://huggingface.co/datasets/TIGER-Lab/Mantis-Eval

No se han proporcionado otros enlaces (papers, blogs, repositorios o demos) en la informacion disponible.
