# flylcw/flylcw2-2B

## Resumen

flylcw2-2B es un modelo de generacion de texto en chino desarrollado por el usuario independiente flylcw, publicado en Hugging Face bajo licencia MIT. Se trata de la segunda generacion de su proyecto personal, sucesor del modelo Seq-Monkey SFT, y emplea la arquitectura y el tokenizador de Qwen3.5 en su variante de texto. El modelo cuenta con 2.390.384.448 parametros totales en pesos safetensors, aunque el autor declara 1.88B parametros distintos incluyendo embeddings de tokens y cabeza de salida compartidos.

El modelo se entrena desde cero: parte de un checkpoint preentrenado inicializado aleatoriamente por el propio autor, continua el preentrenamiento y despues aplica un ajuste supervisado de instrucciones (SFT) con supervision unicamente en los tokens del asistente. Esta orientado exclusivamente a texto y al idioma chino, sin capacidades multimodales ni multilingues declaradas.

Su relevancia radica en que es un ejercicio de entrenamiento completo de un modelo de ~2B desde cero en hardware de consumo profesional (8 x RTX 6000D) y en que publica una evaluacion interna comparativa frente a Qwen3.5-2B, SmolLM2-1.7B-Instruct y varios Qwen2.5-Instruct, con metricas de tareas puntuadas, repeticion en respuestas abiertas, latencia y memoria. Es un modelo de nicho, con cero descargas y cero likes en el momento de la ficha, pensado como experimento de investigacion mas que como modelo de produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3.5 text model (transformer decoder-only, variante de texto) |
| Parametros totales | 2.390.384.448 (safetensors); 1.88B parametros distintos segun el autor, incluyendo embeddings y cabeza de salida compartidos |
| Parametros activos | no disponible (no es MoE segun la informacion) |
| Longitud de contexto | Limite arquitectonico de configuracion: 262.144 tokens; presupuesto de playground: 4.096 / 8.192 (por defecto) / 16.384 (maximo) tokens; entrada probada: 16.014 tokens |
| Tipos de cuantizacion | no disponible (pesos publicados en BF16 SafeTensors; no se documentan cuantizaciones GGUF/AWQ/GPTQ) |
| Idiomas soportados | chino (zh) |
| Licencia | MIT |
| Formato de pesos | SafeTensors (BF16) |

## Arquitectura y entrenamiento

El modelo usa la arquitectura de texto de Qwen3.5, un transformer decoder-only con tokenizador propio de Qwen3.5. Los pesos se distribuyen en BF16 SafeTensors y el repositorio ocupa 4.8 GB. El autor indica 1.88B parametros distintos, cifra que excluye duplicados por embeddings y cabeza de salida compartidos, frente a los 2.390.384.448 parametros totales que reportan los safetensors.

El entrenamiento se realizo en 8 x NVIDIA RTX 6000D con un tamano de bloque de preentrenamiento de 1.024 tokens y un limite de codificacion en SFT de 1.536 tokens. El SFT supervisa unicamente los tokens del asistente, incluido el token de fin de chat. No se documentan en la informacion disponible el numero total de tokens de entrenamiento, la composicion del dataset, ni si hubo RLHF, DPO u otras tecnicas de alineacion posteriores al SFT. Tampoco se describen innovaciones tecnicas como decodificacion especulativa o atencion lineal. El modelo parte de un checkpoint preentrenado inicializado aleatoriamente por el propio autor, no de pesos de Qwen3.5.

## Capacidades

- Generacion de texto conversacional en chino, con formato de chat propio y tokens de parada definidos.
- Razonamiento aritmetico y matematico basico: 11/60 en la prueba de aritmetica y matematicas del benchmark interno F.
- Generacion de codigo Python: 20/20 en pruebas unitarias aisladas segun el benchmark interno.
- Generacion de consultas SQLite: 10/10 en ejecucion en memoria segun el benchmark interno.
- Cumplimiento de restricciones de longitud corta: 42/60 en el benchmark interno.
- Respuestas abiertas con parada correcta: 60/60 en el benchmark interno, sin alcanzar el limite de generacion en ningun caso.
- Capacidad de contexto largo a nivel arquitectonico (hasta 262.144 tokens de configuracion), aunque la comprension en contexto largo no ha sido evaluada sistematicamente.
- No se documenta soporte de tool calling, function calling, agentes, vision, audio ni modo thinking.
- Capacidades multilingues: solo chino declarado.

## Casos de uso

- Experimentacion academica con modelos de ~2B entrenados desde cero: util para estudiar el efecto del preentrenamiento y el SFT en un modelo pequeno con arquitectura Qwen3.5 y tokenizador propio, sin depender de pesos preentrenados de terceros.
- Generacion de codigo Python en entornos controlados: el modelo obtiene 20/20 en pruebas unitarias aisladas del benchmark interno, por lo que puede emplearse para prototipado de funciones y scripts en chino, siempre con validacion posterior.
- Generacion de consultas SQLite: con 10/10 en ejecucion en memoria, es adecuado para asistentes que traduzcan lenguaje natural en chino a consultas SQL sobre bases de datos locales.
- Tareas de aritmetica y matematicas basicas en chino: con 11/60 en el benchmark interno, sirve para ejercicios simples y para investigar las limitaciones de razonamiento numerico en modelos de este tamano.
- Evaluacion comparativa de modelos pequenos en chino: el autor publica un benchmark interno con 210 prompts puntuados y 60 abiertos, reutilizable como referencia para comparar modelos de 0.5B a 2B en tareas de codigo, SQL, matematicas y restricciones de longitud.
- Investigacion sobre repeticion en generacion abierta: el modelo reporta una tasa de trigramas de caracteres repetidos del 12,3% en respuestas abiertas, lo que lo hace util para estudiar y mitigar bucles degenerativos en modelos pequenos.
- Despliegue en hardware de gama alta de consumo para pruebas: con 3,79 GiB de memoria pico asignada en BF16 y 60,5 tokens/s en una RTX 6000D, cabe en GPUs con al menos 8 GB de VRAM para inferencia en BF16.

## Benchmarks y rendimiento

Resultados del benchmark interno chino F del autor (210 prompts puntuados y 60 abiertos, BF16, limite de generacion de 256 tokens; la fila de flylcw2-2B SFT reporta picos por metrica sobre 100 ejecuciones muestreadas con temperatura 0,7 y top-p 0,9; el resto, una ejecucion greedy):

| Modelo | Tareas puntuadas | Restricciones de longitud corta | Aritmetica y matematicas | Python | SQLite | Paradas en abierto | Salidas abiertas al limite | Repeticion abierta (menor es mejor) |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| flylcw2-2B SFT | 110/210 | 42/60 | 11/60 | 20/20 | 10/10 | 60/60 | 0/60 | 12,3% |
| flylcw2-2B Base | 0/210 | 0/60 | 0/60 | 0/20 | 0/10 | 0/60 | 60/60 | 77,1% |
| Seq-Monkey SFT (generacion anterior) | 0/210 | 0/60 | 0/60 | 0/20 | 0/10 | 0/60 | 60/60 | 84,0% |
| Qwen3.5-2B | 105/210 | 21/60 | 21/60 | 18/20 | 10/10 | 47/60 | 13/60 | 3,7% |
| SmolLM2-1.7B-Instruct | 40/210 | 1/60 | 3/60 | 17/20 | 6/10 | 25/60 | 35/60 | 17,4% |
| Qwen2.5-0.5B-Instruct | 77/210 | 16/60 | 16/60 | 14/20 | 7/10 | 52/60 | 8/60 | 14,9% |
| Qwen2.5-1.5B-Instruct | 101/210 | 16/60 | 29/60 | 19/20 | 10/10 | 58/60 | 2/60 | 4,6% |

Rendimiento de inferencia en una RTX 6000D, batch size 1, prompt chino identico y exactamente 64 tokens generados, latencia mediana de cinco ejecuciones tras calentamiento (incluye prefill y decodificacion):

| Modelo | Latencia mediana | Throughput | Memoria pico asignada |
|---|---:|---:|---:|
| flylcw2-2B SFT | 1,057 s | 60,5 tokens/s | 3,79 GiB |
| flylcw2-2B Base | 1,043 s | 61,3 tokens/s | 3,79 GiB |
| Seq-Monkey SFT (generacion anterior) | no disponible en el extracto | no disponible en el extracto | no disponible en el extracto |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: aproximadamente 3,79 GiB de memoria pico asignada medida en una RTX 6000D con batch size 1 y 64 tokens generados. Con overhead del runtime, se recomienda un minimo de 8 GB de VRAM.
- GPU recomendadas: NVIDIA RTX 6000D (hardware usado por el autor para entrenamiento e inferencia), asi como A100, H100, L40S o RTX 4090 por capacidad de memoria y computo BF16.
- Cabe en GPU de consumo: si, en tarjetas con al menos 8 GB de VRAM en BF16 (RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4080, RTX 4090). En GPUs de 6 GB o menos seria necesario cuantizar, aunque no se publican pesos cuantizados.
- Opciones de despliegue: transformers (libreria declarada en la model card); no se documenta soporte verificado de vLLM, llama.cpp, Ollama o TGI, ni se publican pesos GGUF.
- Latencia y throughput: 1,057 s de latencia mediana y 60,5 tokens/s en una RTX 6000D con batch size 1 y 64 tokens generados (flylcw2-2B SFT). No se dispone de datos de throughput con batch mayor ni en otras GPUs.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tareas puntuadas (benchmark F) | Repeticion abierta | Licencia | Disponibilidad |
|---|---|---:|---:|---:|---|---|
| flylcw2-2B SFT | 2,39B totales (1,88B distintos) | 262.144 (config.); 16.384 max. en playground | 110/210 | 12,3% | MIT | Hugging Face, 0 descargas |
| Qwen3.5-2B | no disponible en la informacion | no disponible en la informacion | 105/210 | 3,7% | no disponible en la informacion | no disponible en la informacion |
| Qwen2.5-1.5B-Instruct | no disponible en la informacion | no disponible en la informacion | 101/210 | 4,6% | no disponible en la informacion | no disponible en la informacion |
| SmolLM2-1.7B-Instruct | no disponible en la informacion | no disponible en la informacion | 40/210 | 17,4% | no disponible en la informacion | no disponible en la informacion |

En el benchmark interno del autor, flylcw2-2B SFT supera ligeramente a Qwen3.5-2B en tareas puntuadas (110 frente a 105) y en restricciones de longitud corta (42 frente a 21), pero queda por detras en aritmetica y matematicas (11 frente a 21) y en repeticion en respuestas abiertas (12,3% frente a 3,7%). Frente a Qwen2.5-1.5B-Instruct y SmolLM2-1.7B-Instruct, el modelo del autor obtiene mejores resultados globales en tareas puntuadas, aunque con mayor tasa de repeticion que Qwen2.5-1.5B-Instruct.

## Limitaciones y advertencias

- Modelo exclusivamente en chino: no se declaran capacidades en castellano ni en otros idiomas, por lo que su uso fuera del chino no esta soportado.
- Riesgo elevado de repeticion en generacion abierta: 12,3% de trigramas de caracteres repetidos, muy por encima del 3,7% de Qwen3.5-2B y del 4,6% de Qwen2.5-1.5B-Instruct.
- Razonamiento aritmetico y matematico debil: 11/60 en el benchmark interno, por debajo de Qwen3.5-2B (21/60) y Qwen2.5-1.5B-Instruct (29/60).
- La comprension en contexto largo no ha sido evaluada sistematicamente; el limite de 262.144 tokens es solo de configuracion y el autor solo ha probado 16.014 tokens de entrada.
- El checkpoint base (flylcw2-2B Base) no supera ninguna tarea puntuada (0/210) y alcanza el limite de generacion en las 60 respuestas abiertas, con 77,1% de repeticion; solo la version SFT es utilizable de forma practica.
- No se documentan datos de sesgos, composicion del dataset de entrenamiento ni tecnicas de alineacion (RLHF/DPO), lo que dificulta evaluar riesgos de contenido.
- Licencia MIT: permite uso comercial y modificacion, pero el autor no ofrece garantias ni soporte; el modelo tiene cero descargas y cero likes, sin validacion externa conocida.
- No se publican pesos cuantizados ni integracion verificada con vLLM, llama.cpp, Ollama o TGI, lo que limita el despliegue en produccion.
- El benchmark interno es propio del autor, con 210 prompts puntuados y 60 abiertos, y no equivale a benchmarks estandar como MMLU, HumanEval o GSM8K.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/flylcw/flylcw2-2B
- Modelo anterior (Seq-Monkey SFT): https://huggingface.co/flylcw/seq_monkey_pretrain_sft_optimization_1.5B
- Imagen de resultados del benchmark F: images/model-capabilities.png (referenciada en la model card)
- Imagen de rendimiento en GPU unica: images/performance-comparison.png (referenciada en la model card)
