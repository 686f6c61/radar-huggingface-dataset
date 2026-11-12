# ghostrider0470/Qwen3.8-27B-RFT-v1

## Resumen

Qwen3.8-27B-RFT-v1 es un ajuste fino del modelo Qwen/Qwen3.8-27B, publicado por el usuario ghostrider0470 en Hugging Face. Se trata de un modelo multimodal (image-text-to-text) de 27.781 millones de parametros entrenado mediante una unica ronda de rejection-sampling fine-tuning (RFT) con el objetivo explicito de reducir la longitud del razonamiento sin sacrificar precision. No introduce capacidades nuevas: el modelo base y la torre de vision permanecen sin cambios.

La relevancia del modelo es acotada y muy especifica. El autor demuestra que es posible recortar entre un 10 % y un 31 % los tokens de razonamiento en modo thinking (con diferencias de precision estadisticamente no significativas segun la prueba de McNemar) usando unicamente auto-generacion y grading programatico, sin modelo profesor. Es un experimento de eficiencia de inferencia mas que un modelo nuevo, y su utilidad practica depende de integrarse como sustituto directo del base en pipelines existentes.

El contexto, el vocabulario y los idiomas no estan documentados en la informacion disponible. El modelo se distribuye bajo licencia Apache 2.0, con pesos en safetensors y bfloat16, y es compatible con Transformers, vLLM y SGLang segun la model card.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (image-text-to-text); familia qwen3_5; incluye torre de vision y cabeza de multi-token prediction (MTP) |
| Parametros totales | 27.781.427.952 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible (entrenamiento con secuencias empaquetadas a 32.768 tokens) |
| Tipos de cuantizacion | no disponible (pesos publicados en bfloat16) |
| Idiomas soportados | no disponible (se evaluo un subconjunto de MMLU en aleman) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (bfloat16, adaptador LoRA fusionado en fp32) |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.8-27B (revision `1d4bf0f2ff6012fd82039f2fa52739d0dd7c60c0`), un transformer multimodal de unos 27.800 millones de parametros con torre de vision y cabeza MTP para decodificacion especulativa. Sobre esa base se aplico un ajuste LoRA de rango 64 y alpha 128, durante 1,5 epocas, con learning rate 1e-4 y secuencias empaquetadas a 32.768 tokens. La perdida de validacion paso de 0,283 a 0,234. Los pesos publicados corresponden al adaptador fusionado en el base en fp32 y almacenado en bfloat16; la torre de vision no se modifico.

El metodo es rejection-sampling fine-tuning puro: el propio modelo base respondio a los problemas de entrenamiento, programas externos calificaron las respuestas y se entreno sobre las respuestas correctas mas cortas generadas por el propio modelo. No hubo modelo profesor ni grading escrito por un modelo. El entrenamiento y la evaluacion se ejecutaron en el supercomputador LUMI con GPUs AMD MI250X. La cabeza MTP se copio del base sin reentrenar, lo que puede degradar la aceptacion de tokens en decodificacion especulativa.

## Capacidades

- Generacion de texto y razonamiento en dos modos: thinking on y thinking off, con los mismos controles de plantilla de chat que el modelo base.
- Razonamiento matematico: evaluado en GSM8K, MATH-500 y AIME 2025.
- Generacion de codigo: evaluada en HumanEval y MBPP.
- Procesamiento de imagen y texto (pipeline image-text-to-text) gracias a la torre de vision heredada del base.
- Seguimiento de instrucciones: evaluado con IFEval.
- Capacidades multilingues: se reporta una evaluacion parcial en aleman (subconjunto de MMLU), sin listado oficial de idiomas.
- Decodificacion especulativa mediante cabeza MTP (heredada, no reentrenada).
- Tool calling / function calling: no documentado en la informacion disponible.
- Soporte de agentes y razonamiento multi-paso: no documentado explicitamente en la informacion disponible.

## Casos de uso

- Sustitucion directa del modelo base en produccion para reducir coste de inferencia: al recortar entre un 10 % y un 31 % los tokens de razonamiento en modo thinking con precision equivalente, encaja en pipelines ya construidos sobre Qwen3.8-27B sin cambios de plantilla ni de API.
- Razonamiento matematico en modo thinking con menor latencia: en MATH-500 mantiene 98,40 frente a 98,20 del base con un 10 % menos de tokens, util para tutores automaticos o verificacion de ejercicios donde el tiempo de respuesta importa.
- Generacion de codigo asistida: en HumanEval mejora a 95,73 frente a 93,90 con un 30 % menos de tokens de razonamiento, adecuado para asistentes de IDE o revision de parches donde se quiere respuesta rapida y verificable.
- Extraccion y respuesta sobre documentos con imagen: al conservar la torre de vision del base, sirve para tareas image-text-to-text como descripcion de capturas, lectura de tablas escaneadas o respuesta a preguntas sobre graficos.
- Evaluacion comparativa de tecnicas de eficiencia: el modelo es un artefacto reproducible de RFT con grading programatico, util como referencia en investigacion sobre compresion de cadenas de razonamiento.
- Despliegue en infraestructura AMD: al haberse entrenado y evaluado en GPUs AMD MI250X, es un candidato razonable para entornos con aceleradores AMD y frameworks compatibles (vLLM, SGLang).
- Tareas de seguimiento de instrucciones estrictas: IFEval sube a 90,76 frente a 89,09 en modo thinking, util para generacion de informes estructurados o formateo de datos con especificaciones rigidas.

## Benchmarks y rendimiento

Comparacion pareada contra el modelo base sobre los mismos items (prueba de McNemar; ninguna diferencia significativa, p minimo 0,12 con thinking on).

| Benchmark | n | Base thinking on | RFT v1 thinking on | Base thinking off | RFT v1 thinking off |
|---|---|---|---|---|---|
| GSM8K | 1319 | 97,95 | 97,88 | 96,59 | 96,82 |
| MMLU-Pro (subconjunto) | 200 | 86,50 | 84,00 | 65,50 | 65,50 |
| MATH-500 | 500 | 98,20 | 98,40 | 97,40 | 98,20 |
| AIME 2025 | 30 | 83,33 | 83,33 | 70,00 | 63,33 |
| HumanEval | 164 | 93,90 | 95,73 | 97,56 | 97,56 |
| MBPP | 500 | 94,20 | 93,80 | 81,00 | 80,80 |
| IFEval | 541 | 89,09 | 90,76 | 82,07 | 81,89 |
| German MMLU (subconjunto) | 200 | 83,50 | 86,50 | 80,00 | 81,00 |

Tokens de razonamiento por respuesta correcta en modo thinking on:

| Benchmark | Base | RFT v1 | Variacion |
|---|---|---|---|
| GSM8K | 389 | 338 | −13 % |
| MMLU-Pro | 1.702 | 1.179 | −31 % |
| MATH-500 | 1.481 | 1.328 | −10 % |
| AIME 2025 | 9.018 | 8.845 | −2 % |
| HumanEval | 1.531 | 1.070 | −30 % |
| MBPP | 2.885 | 2.603 | −10 % |

El autor advierte que estas cifras provienen de su propio harness y sirven para la comparacion base-vs-RFT, no para comparar con numeros publicados por terceros.

## Requisitos de hardware

- VRAM estimada para inferencia en bfloat16: aproximadamente 55,6 GB de pesos, mas overhead de activaciones y cache KV; en la practica requiere del orden de 60-70 GB o mas segun contexto y lote.
- Cuantizacion: no se publican pesos cuantizados; habria que generarlos a partir de los safetensors bfloat16. Una cuantizacion a 8 bits dejaria el modelo en torno a 28 GB y a 4 bits en torno a 14 GB, aunque estos valores son estimaciones y no estan verificadas por el autor.
- GPU recomendadas: A100 80 GB, H100 80 GB o MI250X (usadas por el autor). En GPUs de 24 GB como la RTX 4090 no cabe en bfloat16; solo seria viable con cuantizaciones agresivas generadas por el usuario.
- Cabe en consumer GPU: no en bfloat16. Con cuantizacion a 4 bits generada por el usuario podria intentarse en RTX 4090 o RTX 3090, sin datos de rendimiento publicados.
- Opciones de despliegue: Transformers, vLLM y SGLang, segun la model card. No se menciona soporte explicito de llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles. La reduccion de tokens de razonamiento (10-31 %) sugiere menor tiempo por respuesta en modo thinking, pero no se publican medidas de latencia ni tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.8-27B-RFT-v1 | 27,78 B | no disponible | RFT para razonamiento mas corto | Apache 2.0 | Hugging Face (0 descargas) |
| Qwen/Qwen3.8-27B (base) | 27,78 B | no disponible | Modelo multimodal de referencia | Apache 2.0 | Hugging Face |
| Alternativas de mismo tamano | no disponible | no disponible | no disponible | no disponible | no disponible |

La informacion disponible solo permite comparar con el modelo base, del que este es un ajuste fino. No se han proporcionado datos de otros modelos comparables de la misma categoria.

## Limitaciones y advertencias

- No es un modelo mas preciso que el base: la mejora es de eficiencia (menos tokens de razonamiento), no de exactitud. Varios benchmarks estan cerca del techo del base y no pueden mostrar ganancia.
- La cabeza MTP se copio sin reentrenar, por lo que la decodificacion especulativa puede aceptar menos tokens que en el base.
- Las cifras de benchmarks provienen del harness propio del autor y no son comparables con numeros publicados por terceros.
- En AIME 2025 con thinking off la precision cae de 70,00 a 63,33 y en MMLU-Pro con thinking on de 86,50 a 84,00, aunque las diferencias no son significativas con n pequeno.
- No se documentan sesgos conocidos, idiomas soportados ni comportamiento de alucinacion; deben asumirse los del modelo base, no descritos en la informacion disponible.
- No hay informacion sobre tool calling, uso en agentes ni limites de contexto efectivos.
- Modelo con 0 descargas y 0 likes en el momento de la consulta: no hay validacion independiente de la comunidad.
- Licencia Apache 2.0 permite uso comercial, pero al derivar de Qwen3.8-27B conviene verificar las condiciones del modelo base y de sus dependencias.
- El repositorio ocupa 55,6 GB, lo que implica requisitos de almacenamiento y ancho de banda considerables para su descarga y despliegue.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ghostrider0470/Qwen3.8-27B-RFT-v1
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Revision del base citada: `1d4bf0f2ff6012fd82039f2fa52739d0dd7c60c0`
- Paper, blog o repositorio adicional: no disponible en la informacion proporcionada.
