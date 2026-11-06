# Franjarjar/Qwen3.5-9B-EQD4L

## Resumen

Qwen3.5-9B-EQD4L es una cuantizacion del modelo Qwen/Qwen3.5-9B publicada por el usuario Franjarjar (JarJarFran) para Espetero, un motor de inferencia nativo para Metal en Apple silicon. El formato empleado es EQ (LaneQuant), propietario de Espetero, que almacena un codebook de 4 bits, codigos de 5, 6 y 8 bits, una escala de 8 bits con signo por cada 16 entradas y una escala fp16 por cada 256, disenado para que cada lane de los kernels matriciales de la GPU de Apple necesite una sola escala por paso.

El modelo ocupa 6,0 GB en disco y esta dimensionado a partir del preset UD-Q4_K_XL: como eqd4m, con gate/up a 5 bits en el primer y ultimo cuarto y todas las proyecciones down a 5 bits. No incluye cabeza MTP ni torre de vision. Segun los datos de safetensors, el checkpoint contiene 2.714.384.352 parametros, un dato que no coincide con el nombre comercial "9B" del modelo base y que conviene tener en cuenta al planificar el despliegue.

Su relevancia es acotada pero concreta: es una de las primeras cuantizaciones publicas en formato EQ para un modelo de la familia Qwen3.5, con metricas de divergencia KL medidas frente al BF16 de referencia y una comparacion pareada contra el GGUF UD-Q4_K_XL de Unsloth. No obstante, el formato EQ solo lo carga Espetero 0.2.0 o superior, por lo que no es utilizable desde llama.cpp, MLX ni transformers.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer Qwen3.5 (modelo base Qwen/Qwen3.5-9B); sin cabeza MTP ni torre de vision |
| Parametros totales | 2.714.384.352 (segun safetensors del repo); el nombre comercial del base indica 9B |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | EQ (LaneQuant) eqd4l: codebook 4 bits, codigos 5/6/8 bits, escala 8 bits con signo por 16 entradas, escala fp16 por 256; 5,30 bits por peso |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors en formato EQ (LaneQuant), exclusivo de Espetero |

## Arquitectura y entrenamiento

El checkpoint es una cuantizacion del modelo base Qwen/Qwen3.5-9B, no un modelo entrenado desde cero. La arquitectura subyacente es la de Qwen3.5, un transformer con atencion lineal en parte de sus capas: la model card menciona explicitamente "las 24 Hessianas de salida de atencion lineal" reordenadas al orden de columnas de Hugging Face durante la calibracion, lo que confirma la presencia de capas de atencion lineal en la red. No se detalla en la informacion disponible la composicion del dataset de entrenamiento original, el numero de tokens ni si hubo fases de RLHF o DPO en el modelo base.

El proceso de cuantizacion se realizo con `espetero quantize` de Espetero 0.2.0 (commit 616c21a) y el preset `eqd4l`, con `--no-mtp`. La calibracion empleo el calibration_v5 de mlx-lm con 112K tokens; las estadisticas se capturaron con una build de desarrollo que ejecutaba los pesos del GGUF Q8_0, en cuatro rangos de capas fusionados con `tools/calib_merge.py`. La conversion tardo 31 minutos en un M1 Max con BLAS mono-hilo y un pico de 11 GB de memoria. El autor advierte que una reconversion desde cero con la version 0.2.0 no sera byte-identica, ya que `--calib-only` captura las estadisticas desde los pesos BF16 en lugar del Q8_0.

## Capacidades

- Generacion de texto y razonamiento: hereda las capacidades del modelo base Qwen3.5-9B, si bien la cuantizacion a 5,30 bits por peso introduce una degradacion medible (KLD media de 0,00781 frente al BF16).
- Codigo: el conjunto de evaluacion de la divergencia KL incluye 31 ventanas de codigo ademas de 31 de WikiText-2, lo que indica que el formato se valido tambien en ese dominio.
- Tool calling y function calling: no disponible en la informacion proporcionada para este checkpoint; depende de las capacidades del base y del motor Espetero.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible; el campo de idiomas del repo esta vacio.
- Vision: no incluida; el autor indica explicitamente "no vision tower".
- Modo thinking: no disponible.
- Servicio compatible con clientes OpenAI, Anthropic y Ollama a traves de `espetero serve`.

## Casos de uso

- Inferencia local en Mac con 16 GB o mas: el modelo cabe en 6,0 GB en disco y esta pensado para ejecutarse con Espetero en Apple silicon, lo que permite desplegar un modelo de la familia Qwen3.5 en un portatil sin GPU dedicada.
- Prototipado rapido en MacBook Pro M1 Max: la model card reporta 49 tok/s de decodificacion en M1 Max (64 GB), suficiente para iterar sobre prompts y evaluar respuestas en local antes de mover cargas a servidores.
- Sustitucion de UD-Q4_K_XL en entornos Espetero: con 5,30 bits por peso frente a 5,32 y una KLD media un 35,7 % inferior en comparacion pareada, es una alternativa directa cuando ya se usa el motor Espetero y se busca menor degradacion al mismo tamano.
- Servicio local compatible con API OpenAI: `espetero serve` expone un endpoint en `http://127.0.0.1:8080` que acepta clientes OpenAI, Anthropic y Ollama, util para integrar el modelo en herramientas que ya hablan esos protocolos.
- Evaluacion de calidad de cuantizacion: las metricas de KLD por token, top-1 y ventanas bootstrap permiten usar este checkpoint como referencia para comparar futuras cuantizaciones EQ del mismo base.
- Generacion de codigo asistida en local: al haberse validado la divergencia sobre ventanas de codigo, es adecuado para tareas de autocompletado y generacion en un entorno de desarrollo sobre Mac, siempre que se acepte la degradacion de la cuantizacion.

## Benchmarks y rendimiento

| Metrica | Este archivo (eqd4l) | UD-Q4_K_XL (Unsloth) |
|---|---|---|
| Bits por peso | 5,30 | 5,32 |
| KLD media | 0,00781 | 0,0122 |
| KLD mediana | 0,00249 | 0,00376 |
| KLD p99 | 0,0515 | 0,0897 |
| Top-1 (acuerdo con referencia) | 96,8 % | 96,1 % |
| Decodificacion M1 Max (tok/s) | 49 | 35 |
| Decodificacion M4 Max (tok/s) | no disponible | no disponible |

La comparacion pareada sobre las mismas ventanas (bootstrap con 10.000 muestras) arroja una reduccion de KLD del 35,7 % (intervalo del 95 %: -41,7 % a -29,4 %) frente a UD-Q4_K_XL, inferior en el 100 % de las 62 ventanas. La medicion se realizo sobre 123.008 tokens: 62 ventanas de 2048 tokens (31 de WikiText-2 test, 31 de codigo), sin puntuar los primeros 64 tokens de cada ventana. La decodificacion se midio con una secuencia, contexto de 128 tokens y `bench_native --quick --batch 1`, con los archivos intercalados en una sesion exclusiva por Mac (M4 Max: Mac Studio de 128 GB; M1 Max: MacBook Pro de 64 GB), en tokens por segundo de reloj de pared. No hay resultados de MMLU, HumanEval ni GSM8K en la informacion disponible.

## Requisitos de hardware

- VRAM/memoria unificada: 6,0 GB en disco; el autor indica un minimo de 16 GB de memoria en el Mac. El pico durante la cuantizacion fue de 11 GB, pero la inferencia parte de los 6,0 GB del archivo mas overhead del motor.
- GPU recomendadas: Apple silicon con Metal; las mediciones publicadas corresponden a M1 Max (64 GB) y M4 Max (128 GB).
- Cabe en GPU consumer: si, en cualquier Mac con 16 GB o mas de memoria unificada; no es compatible con GPU NVIDIA ni AMD porque el formato EQ solo lo carga Espetero.
- Opciones de despliegue: exclusivamente Espetero 0.2.0 o superior (`brew install JarJarFran/espetero/espetero` y `espetero serve --model Franjarjar/Qwen3.5-9B-EQD4L`). llama.cpp, MLX y transformers no cargan archivos EQ.
- Latencia y throughput: 49 tok/s de decodificacion en M1 Max; el dato de M4 Max no esta disponible en la tabla (la columna aparece vacia para este archivo).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.5-9B-EQD4L (este) | 2,71 B (safetensors) | no disponible | EQ (LaneQuant) | Apache 2.0 | Solo Espetero |
| Qwen3.5-9B (base, BF16) | 9 B (nominal) | no disponible | safetensors | Apache 2.0 | transformers, vLLM, etc. |
| UD-Q4_K_XL (Unsloth) | 9 B (nominal) | no disponible | GGUF | Apache 2.0 (heredada) | llama.cpp y derivados |

La comparacion disponible se limita al eje de calidad y velocidad: frente a UD-Q4_K_XL, este archivo es 0,02 bits por peso mas pequeno, tiene una KLD media un 35,7 % menor y decodifica a 49 tok/s frente a 35 tok/s en M1 Max. No hay datos de benchmarks de tareas (MMLU, HumanEval, GSM8K) para ninguno de los tres, por lo que no es posible comparar capacidad bruta.

## Limitaciones y advertencias

- Formato propietario: los pesos EQ solo los carga Espetero 0.2.0 o superior; no funcionan en llama.cpp, MLX ni transformers, lo que limita severamente la portabilidad.
- Plataforma unica: requiere Apple silicon con Metal; no hay soporte para CUDA ni ROCm.
- Discrepancia de parametros: el repo declara 2.714.384.352 parametros en safetensors frente al "9B" del nombre comercial; conviene verificar el conteo real antes de dimensionar infraestructura.
- Degradacion por cuantizacion: aunque baja, existe; la KLD p99 de 0,0515 y un top-1 del 96,8 % implican que aproximadamente 3 de cada 100 tokens generados no coinciden con la eleccion del modelo BF16.
- Sin vision ni cabeza MTP: el autor elimina explicitamente ambos componentes, por lo que no hay soporte multimodal ni decodificacion especulativa asociada al modelo.
- Idiomas no declarados: el campo de idiomas esta vacio en el repo; no se puede confirmar el soporte multilingue real del checkpoint.
- Sesgos y alucinacion: no hay informacion especifica sobre sesgos del base ni evaluaciones de factualidad en la documentacion proporcionada; se aplican los riesgos habituales de un modelo de lenguaje de esta familia.
- Licencia: Apache 2.0, que permite uso comercial, pero el formato EQ y el motor Espetero (MIT) condicionan el despliegue practico.
- Madurez: el repo tiene 0 descargas y 0 likes y fue creado el 2026-11-05, por lo que no hay validacion independiente de las metricas publicadas.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Franjarjar/Qwen3.5-9B-EQD4L
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- Motor Espetero: https://github.com/JarJarFran/espetero
- Documentacion del formato EQ: https://github.com/JarJarFran/espetero/blob/main/docs/eq.md
- GGUF de comparacion (Unsloth UD-Q4_K_XL): no disponible como enlace directo en la informacion proporcionada
