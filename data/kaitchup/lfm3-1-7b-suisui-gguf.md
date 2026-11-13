# kaitchup/LFM3-1.7B-suisui-GGUF

## Resumen

LFM3-1.7B-suisui-GGUF es una colección de tres checkpoints cuantizados en formato GGUF del modelo LiquidAI/LFM3-1.7B, publicada por el autor independiente kaitchup. El objetivo no es crear un modelo nuevo, sino ofrecer variantes comprimidas de 1 GB, 1,25 GB y 1,5 GB que mantengan una calidad de decodificación alta respecto al modelo de referencia en BF16, empleando GPTQ con Hessianos de Fisher factorizados (YAQA) y una asignación de precisión mixta restringida a los formatos Q4_0, Q4_K, Q8_0 y F16.

El modelo base, LFM3-1.7B, pertenece a la familia LFM3 de Liquid AI y cuenta con 1.728.801.600 parámetros. Esta ficha se centra en los artefactos GGUF derivados, pensados para su uso con llama.cpp en entornos con recursos limitados: el checkpoint más pequeño ocupa menos de 1 GB y puede ejecutarse íntegramente en GPU de consumo con todas las capas descargadas en VRAM.

La relevancia de esta publicación radica en la metodología de cuantización: en lugar de aplicar cuantizaciones estándar tipo K-quant, el autor busca el mejor compromiso tamaño/calidad mediante búsqueda de precisión por capa bajo una restricción de tamaño de archivo, y publica métricas de aceptación (EAR) frente a la referencia BF16 en inglés, francés, japonés e hindi, además de benchmarks de velocidad en llama.cpp.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base LFM3 de Liquid AI; los artefactos son GGUF para llama.cpp) |
| Parametros totales | 1.728.801.600 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (el ejemplo de llama.cpp usa `--ctx-size 8192` y los benchmarks evalúan prompts de 8.192 tokens y generación tras 8k con hasta 32.768 tokens en GPU) |
| Tipos de cuantizacion | GPTQ con precisión mixta restringida a Q4_0, Q4_K, Q8_0 y F16; 133 tensores de norma, convolución y RoPE en F32 |
| Idiomas soportados | no disponible oficialmente; la evaluación cubre inglés, francés, japonés e hindi |
| Licencia | lfm1.0 (LFM Open License v1.0) |
| Formato de pesos | GGUF (tres ficheros: Q8_0_S, Q4_0_XS, Q4_0_XXS) |

## Arquitectura y entrenamiento

Los artefactos publicados son cuantizaciones del modelo base LiquidAI/LFM3-1.7B, no un entrenamiento nuevo. La técnica aplicada es GPTQ (paper arXiv:2210.17323) con Hessianos de Fisher factorizados mediante Kronecker (YAQA, del proyecto Cornell-RelaxML). Sobre esa base, el autor realiza una asignación de precisión mixta con restricción de tamaño: cada capa recibe uno de los formatos Q4_0, Q4_K, Q8_0 o F16 según su sensibilidad, y los 133 tensores de normalización, convolución y RoPE se mantienen en F32 igual que en los GGUF oficiales de Liquid AI.

Los tres checkpoints se etiquetan por familia de formato dominante y por nivel de tamaño: XXS (1 GB, ~0,999852 GB), XS (1,25 GB, ~1,249937 GB) y S (1,5 GB, ~1,499957 GB). La model card incluye mapas de calor de precisión por capa para cada variante. No se proporcionan datos sobre el corpus de entrenamiento del modelo base, número de tokens, ni si hubo RLHF/DPO; esa información correspondería a la model card de LiquidAI/LFM3-1.7B, que no se incluye en la información disponible.

## Capacidades

- Generación de texto conversacional: la pipeline declarada es `text-generation` y el modelo está etiquetado como `conversational`.
- Cuantización de alta fidelidad: los tres checkpoints mantienen una tasa de aceptación (EAR@10) frente a BF16 del 95,6 % (S), 93,9 % (XS) y 91,4 % (XXS) en inglés, lo que indica una degradación controlada de la distribución de salida.
- Cobertura multilingüe evaluada: inglés, francés, japonés e hindi, con gráficas de EAR@10 y EAR@100 publicadas para cada idioma.
- Compatibilidad con llama.cpp: los GGUF funcionan con `llama-server` y `llama-bench`; el autor indica que se requiere una build con soporte para LFM3.
- Compatibilidad con endpoints: la etiqueta `endpoints_compatible` sugiere uso en infraestructura de inferencia alojada.
- No se dispone de información sobre tool calling, function calling, agentes, modo thinking, visión o audio en la documentación proporcionada.

## Casos de uso

- Despliegue en GPU de consumo: el checkpoint XXS de 1 GB permite ejecutar el modelo con todas las capas en una RTX 3060 de 12 GB (medido por el autor), dejando VRAM libre para caché KV y contexto largo.
- Inferencia en CPU sin GPU: con 8 hilos en un Ryzen 7 5800X, el XXS alcanza 33,7 tokens/s de generación y 950 tokens/s de procesamiento de prompt de 8k, suficiente para asistentes locales en portátiles.
- Aplicaciones de chat con contexto de 8k tokens: el ejemplo oficial usa `--ctx-size 8192`; útil para conversaciones multi-turno o resumen de documentos moderados.
- Decodificación especulativa: la métrica EAR (Expected Acceptance Rate) frente a BF16 indica que estos checkpoints pueden actuar como modelos draft en esquemas de speculative decoding, con tasas de aceptación del 91-96 % en inglés.
- Prototipado rápido y evaluación de pipelines: al ser artefactos pequeños y de descarga rápida (repo de 3,8 GB en total), sirven para validar integraciones con llama.cpp antes de pasar a modelos mayores.
- Servicio local con `llama-server`: el comando documentado levanta un endpoint HTTP en el puerto 8080, adecuado para integrar el modelo en herramientas internas o demos.
- Investigación en cuantización: los mapas de precisión por capa y las gráficas EAR por idioma permiten estudiar el impacto de la precisión mixta en la calidad de decodificación.

## Benchmarks y rendimiento

Calidad de decodificación (EAR@10 frente a BF16, inglés, 64 secuencias de 2.048 tokens):

| Checkpoint | Tamano (GB) | EAR@10 ingles (%) |
|---|---:|---:|
| suisui-Q8_0_S | 1,499957 | 95,6154 |
| suisui-Q4_0_XS | 1,249937 | 93,9246 |
| suisui-Q4_0_XXS | 0,999852 | 91,3806 |

Velocidad con llama.cpp `llama-bench` (RTX 3060 12 GB con todas las capas en GPU; CPU Ryzen 7 5800X, 8 hilos):

| Modelo | Tamano (GB) | GPU prompt 8k | GPU gen 256 | GPU gen 32k tras 8k | CPU prompt 8k | CPU gen 128 |
|---|---:|---:|---:|---:|---:|---:|
| suisui-Q4_0_XXS | 1,000 | 8.261 | 212,4 | 181,5 | 950 | 33,7 |
| LiquidAI QAD-Q4_0 | 1,050 | 8.343 | 211,1 | 178,6 | 933 | 31,6 |
| LiquidAI Q4_K_M | 1,100 | 7.888 | 199,8 | 168,6 | 999 | 30,9 |
| suisui-Q4_0_XS | 1,250 | 8.292 | 185,3 | 160,6 | 954 | 27,2 |
| LiquidAI Q5_K_M | 1,259 | 7.643 | 184,0 | 157,7 | 1.013 | 27,1 |
| AtomicChat AD-Q5_K_M | 1,310 | 7.640 | 178,9 | 154,4 | 931 | 25,6 |
| LiquidAI Q6_K | 1,428 | 7.446 | 170,0 | 148,5 | 905 | 24,0 |
| suisui-Q8_0_S | 1,500 | 8.348 | 161,6 | 143,9 | 896 | 22,5 |

No se han publicado resultados de benchmarks de conocimiento o razonamiento (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada: ~1 GB (XXS), ~1,25 GB (XS) y ~1,5 GB (S) solo para pesos; hay que sumar la caché KV (el autor usa F16 por defecto en llama-bench) y el contexto configurado.
- GPU recomendadas: el autor mide en una NVIDIA RTX 3060 de 12 GB con todas las capas descargadas; cualquier GPU con 4 GB o más de VRAM debería acomodar el XXS con contexto moderado.
- Cabe en GPU de consumo: sí, en todas las variantes; el XXS deja amplio margen incluso en tarjetas de 4-6 GB.
- Despliegue: llama.cpp (`llama-server`, `llama-bench`); requiere una build con soporte LFM3. El autor no documenta otras opciones como vLLM, TGI u Ollama para estos GGUF.
- Rendimiento: en GPU, 212,4 tok/s de generación con el XXS y 161,6 tok/s con el S; en CPU, 33,7 tok/s y 22,5 tok/s respectivamente. El procesamiento de prompt de 8k ronda los 8.300 tok/s en GPU.
- La velocidad de decodificación depende de los bytes leídos por token: los ficheros más grandes decodifican más despacio; en GPU, los basados en Q4_0/Q8_0 procesan prompts más rápido que los K-quant.

## Comparativa con modelos similares

| Modelo | Tamano (GB) | Formato | EAR@10 ingles (%) | GPU gen 256 (tok/s) | Licencia |
|---|---:|---|---:|---:|---|
| suisui-Q4_0_XXS | 1,000 | GGUF mixto (Q4_0/Q4_K/Q8_0/F16) | 91,38 | 212,4 | lfm1.0 |
| LiquidAI QAD-Q4_0 | 1,050 | GGUF QAD | no disponible | 211,1 | lfm1.0 |
| LiquidAI Q4_K_M | 1,100 | GGUF K-quant | no disponible | 199,8 | lfm1.0 |
| suisui-Q4_0_XS | 1,250 | GGUF mixto | 93,92 | 185,3 | lfm1.0 |
| LiquidAI Q5_K_M | 1,259 | GGUF K-quant | no disponible | 184,0 | lfm1.0 |
| AtomicChat AD-Q5_K_M | 1,310 | GGUF mixto | no disponible | 178,9 | lfm1.0 |
| suisui-Q8_0_S | 1,500 | GGUF mixto | 95,62 | 161,6 | lfm1.0 |

Todos los comparables son cuantizaciones del mismo modelo base LFM3-1.7B, por lo que la comparación se limita a tamaño, velocidad y fidelidad de decodificación. No se dispone de datos de otros modelos de 1,7B en la información proporcionada.

## Limitaciones y advertencias

- Las métricas EAR miden la tasa de aceptación de tokens frente a BF16, no la calidad semántica ni el rendimiento en tareas; una EAR alta no garantiza respuestas correctas.
- Las comparaciones EAR solo son válidas dentro de cada idioma y conjunto de texto; el autor advierte explícitamente que valores medidos sobre textos distintos no son comparables.
- No se han publicado evaluaciones de sesgo, toxicidad ni alucinación para estos checkpoints.
- Los idiomas oficialmente soportados por el modelo base no se detallan en la información disponible; la evaluación cubre solo cuatro idiomas.
- Licencia LFM Open License v1.0: es necesario revisar sus términos para uso comercial; la model card remite al fichero LICENSE y al NOTICE para atribución y modificaciones.
- Requiere una build de llama.cpp con soporte LFM3; versiones sin ese soporte no cargarán los ficheros.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay validación comunitaria independiente.
- El autor es un tercero (kaitchup), no Liquid AI; los artefactos son modificaciones del modelo original y deben atribuirse según el NOTICE.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/kaitchup/LFM3-1.7B-suisui-GGUF
- Modelo base: https://huggingface.co/LiquidAI/LFM3-1.7B
- GGUFs oficiales de Liquid AI: https://huggingface.co/LiquidAI/LFM3-1.7B-GGUF
- GGUFs de AtomicChat: https://huggingface.co/AtomicChat/LFM3-1.7B-GGUF
- Paper de GPTQ: https://arxiv.org/abs/2210.17323
- YAQA (Hessianos de Fisher factorizados): https://github.com/Cornell-RelaxML/yaqa-quantization
- Newsletter del autor: https://kaitchup.substack.com/subscribe
- Apoyo al autor: https://buymeacoffee.com/kaitchup
