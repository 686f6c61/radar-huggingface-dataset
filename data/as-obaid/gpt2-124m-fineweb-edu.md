# as-obaid/gpt2-124m-fineweb-edu

## Resumen

GPT-2 124M fineweb-edu es un modelo de lenguaje base de pequeno tamano entrenado desde cero por Muhammad Obaidullah (as-obaid) sobre el subconjunto sample-10BT del dataset FineWeb-Edu. No se trata de un ajuste fino del GPT-2 original de OpenAI, sino de un reentrenamiento completo de la arquitectura GPT-2 de 124 millones de parametros utilizando el framework llm.c de Andrej Karpathy, lo que permite reproducir el pipeline completo con un coste computacional modesto (18,2 horas de GPU).

El objetivo del modelo es servir como referencia reproducible y como linea base de calidad para experimentos de entrenamiento de LLM a pequena escala. El autor documenta publicamente los scripts, los logs y las curvas de entrenamiento en GitHub, de modo que cualquier persona puede replicar el proceso o utilizarlo como punto de partida para comparaciones.

La arquitectura es un transformer decoder-only clasico de 12 capas, 12 cabezas de atencion, 768 dimensiones ocultas y una longitud de contexto de 1.024 tokens. Los pesos se distribuyen en bfloat16, el formato nativo de llm.c, y se cargan como un `GPT2LMHeadModel` estandar de Transformers con el tokenizador de GPT-2 de OpenAI. La licencia es ODC-By 1.0, heredada de FineWeb-Edu.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (GPT-2), 12 capas, 12 cabezas, 768 dim |
| Parametros totales | 124.439.808 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | 1.024 tokens |
| Tipos de cuantizacion | no disponible (pesos publicados en bfloat16) |
| Idiomas soportados | ingles (en) |
| Licencia | ODC-By 1.0 |
| Formato de pesos | safetensors (bfloat16) y checkpoint nativo de llm.c (`llmc/model_00056352.bin`) |

## Arquitectura y entrenamiento

El modelo replica la arquitectura GPT-2 Small de OpenAI: 12 bloques transformer con atencion multi-cabeza de 12 cabezas, dimension de modelo de 768 y embeddings posicionales aprendidos con una ventana de 1.024 tokens. No incorpora innovaciones modernas como atencion lineal, RoPE, GQA, MoE ni decodificacion especulativa; es una implementacion fiel del diseno de 2019.

El entrenamiento se realizo con llm.c sobre FineWeb-Edu sample-10BT, un subconjunto de 10.000 millones de tokens de paginas web educativas filtradas por calidad. Se completaron 3 epocas con un total de 9,85 mil millones de tokens de entrenamiento, reordenados en cada epoca, durante 56.352 pasos de 524.288 tokens cada uno. El optimizador fue AdamW con learning rate 6e-4, 715 pasos de warmup, decaimiento coseno hasta 6e-5 y weight decay de 0,1. Se utilizo precision bf16 con cuDNN flash attention. El computo total fue de 18,2 horas de GPU, repartidas entre una NVIDIA H200 (48.000 pasos) y una H100 (8.352 pasos). No se aplico RLHF, DPO ni ningun tipo de ajuste por instrucciones.

## Capacidades

- Generacion de texto autoregresiva en ingles con el estilo de la prosa educativa web.
- Modelo base sin ajuste por instrucciones: no sigue instrucciones ni mantiene formatos conversacionales de forma fiable.
- Capacidad de completar texto a partir de un prompt (continuacion, no respuesta a preguntas).
- Razonamiento basico y coherencia local en fragmentos cortos, limitado por su tamano y su contexto de 1.024 tokens.
- Sin soporte de tool calling ni function calling.
- Sin soporte de agentes ni razonamiento multi-paso.
- Monolingue: solo ingles.
- Sin capacidades de vision, audio ni modo de pensamiento (thinking mode).

## Casos de uso

- Linea base reproducible para investigacion en entrenamiento de LLM: permite comparar recetas, hiperparametros y datasets contra un punto de referencia documentado con curvas y logs publicos.
- Docencia y formacion: sirve para ilustrar el ciclo completo de entrenamiento (tokenizacion, preentrenamiento, evaluacion y exportacion a Hugging Face) con un coste de 18,2 horas de GPU.
- Experimentos de ablacion sobre datos: al estar entrenado sobre FineWeb-Edu, es util para medir el efecto de la filtracion por calidad educativa frente a otros corpus como OpenWebText o C4.
- Generacion de texto de relleno o sintetico en ingles para pruebas de pipelines de NLP, siempre que no se requiera exactitud factual.
- Evaluacion de tecnicas de cuantizacion y compresion: su tamano reducido permite probar formatos (GGUF, int8, int4) en hardware de consumo y medir la degradacion de perplejidad.
- Prototipado rapido de aplicaciones de completado de texto en entornos con recursos limitados, como demos locales o notebooks.
- Pruebas de infraestructura de inferencia (vLLM, TGI, llama.cpp) para validar despliegues antes de migrar a modelos mayores.

## Benchmarks y rendimiento

| Modelo | Val loss (cross-entropy) | HellaSwag (acc_norm) |
|---|---|---|
| OpenAI GPT-2 124M | no disponible | 29,55 % |
| gpt2-124m-fineweb-edu | 2,969 | 32,49 % |

La val loss se calcula como entropia cruzada media sobre los primeros 10,5 millones de tokens del shard de validacion reservado (los primeros 100 millones de tokens de sample-10BT, nunca vistos en entrenamiento). HellaSwag se mide con acc_norm sobre los 10.042 ejemplos de validacion, evaluado con llm.c. El modelo supera al GPT-2 original de OpenAI en HellaSwag en 2,94 puntos porcentuales.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,25 GB en bfloat16/fp16 (124M parametros x 2 bytes), mas overhead de activaciones y cache KV; en la practica cabe en cualquier GPU con 1 GB o mas.
- GPU recomendadas: cualquier GPU moderna; para entrenamiento o evaluacion a gran escala se usaron NVIDIA H200 y H100, pero para inferencia basta una GTX 1650, RTX 3060, RTX 4090 o incluso CPU.
- Cabe holgadamente en GPU de consumo: si, en practicamente todas las GPU consumer de los ultimos diez anos.
- Opciones de despliegue: Transformers (`pipeline`), text-generation-inference (tag `text-generation-inference`), endpoints compatibles, llama.cpp/Ollama tras conversion a GGUF, y vLLM para servir en lote.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada; por el tamano del modelo se espera un throughput muy alto en GPU modernas, pero no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | HellaSwag | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| gpt2-124m-fineweb-edu | 124M | 1.024 | 32,49 % | ODC-By 1.0 | Hugging Face |
| OpenAI GPT-2 124M | 124M | 1.024 | 29,55 % | MIT | Hugging Face |
| GPT-2 Medium | 355M | 1.024 | no disponible | MIT | Hugging Face |
| Pythia-160M | 160M | 2.048 | no disponible | Apache 2.0 | Hugging Face |

La comparativa se limita a modelos de la misma familia y escala porque no se dispone de resultados de benchmarks de las alternativas en la informacion proporcionada. Frente al GPT-2 original, la diferencia principal es el corpus de entrenamiento (FineWeb-Edu filtrado por calidad frente al WebText de OpenAI) y el pipeline reproducible con llm.c.

## Limitaciones y advertencias

- Es un modelo base sin ajuste por instrucciones ni entrenamiento de seguridad: no debe usarse como asistente conversacional ni en produccion orientada a usuarios finales sin un ajuste posterior.
- Riesgo alto de alucinacion: genera ingles fluido que a menudo es factualmente incorrecto; el autor advierte explicitamente de que no se confie en el para datos factuales.
- Sesgos heredados de FineWeb-Edu: al entrenarse sobre paginas web educativas en ingles, reproduce los sesgos de ese corpus (sesgo cultural, de genero y de representacion).
- Contexto muy limitado (1.024 tokens), insuficiente para documentos largos o conversaciones multi-turno extensas.
- Solo ingles; no soporta castellano ni otros idiomas de forma fiable.
- Licencia ODC-By 1.0: permite uso comercial con atribucion, pero conviene revisar los terminos del dataset FineWeb-Edu y de los datos subyacentes.
- Sin garantias de calidad para tareas de codigo, matematicas o razonamiento complejo; su rendimiento en HellaSwag (32,49 %) esta proximo al azar en una tarea de cuatro opciones.
- No dispone de cuantizaciones oficiales publicadas; cualquier GGUF o version cuantizada seria una conversion de terceros.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/as-obaid/gpt2-124m-fineweb-edu
- Repositorio GitHub con scripts, logs y write-up: https://github.com/as-obaid/gpt2-124m-fineweb-edu
- llm.c de Andrej Karpathy: https://github.com/karpathy/llm.c
- Script de exportacion a Hugging Face de llm.c: https://github.com/karpathy/llm.c/blob/master/dev/eval/export_hf.py
- Dataset FineWeb-Edu: https://huggingface.co/datasets/HuggingFaceFW/fineweb-edu
- Paper de FineWeb-Edu (Penedo et al., 2024): no disponible como enlace directo en la informacion proporcionada
- Paper de GPT-2 (Radford et al., OpenAI, 2019): no disponible como enlace directo en la informacion proporcionada
