# Franjarjar/Qwen3.5-9B-EQD6

## Resumen

Qwen3.5-9B-EQD6 es una cuantizacion del modelo Qwen/Qwen3.5-9B realizada por el desarrollador independiente Franjarjar (JarJarFran) para Espetero, un motor de inferencia nativo para Metal en Apple silicon. El problema que resuelve es la falta de un formato de cuantizacion optimizado especificamente para las GPU de Apple: EQ (LaneQuant) es el formato nativo de Espetero y almacena codigos de 5, 6 y 8 bits con una escala de 8 bits con signo por cada 16 entradas y una escala fp16 por cada 256, elegida de forma que cada lane de los kernels matriciales de la GPU de Apple necesite una sola escala por paso.

El modelo base es un Qwen3.5 de 9B, aunque el repositorio declara 3.058.643.456 parametros reales en safetensors, lo que sugiere una discrepancia entre el nombre comercial del modelo base y el contenido efectivo de pesos (posiblemente por el modelo base empleado o por el proceso de conversion). El artefacto ocupa 7,5 GB en disco, esta pensado para ejecutarse con Espetero 0.2.0 o superior en Macs con 16 GB de memoria o mas, y se distribuye bajo licencia Apache 2.0.

La relevancia actual es doble: por un lado, demuestra que es posible cuantizar a 6,65 bits por peso con una perdida de calidad medible y comparativamente baja (KLD media de 0,00189 frente a 0,00260 de un Q6_K de tamano equivalente); por otro, introduce un ecosistema de inferencia alternativo a llama.cpp y MLX en el segmento de Apple silicon, con soporte para clientes OpenAI, Anthropic y Ollama.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer Qwen3.5 (modelo base Qwen/Qwen3.5-9B); sin cabeza MTP ni torre de vision en esta conversion |
| Parametros totales | 3.058.643.456 (segun safetensors del repo); el nombre del modelo base indica 9B |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | EQ (LaneQuant) eqd6: 5, 6 y 8 bits; media de 6,65 bits por peso |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors con codigos EQ; solo cargable por Espetero 0.2.0 o superior |

## Arquitectura y entrenamiento

El modelo base es un Qwen3.5-9B, un transformer con atencion lineal en parte de sus capas (la model card menciona "linear attention of the first quarter 8-bit" y "24 linear-attention output Hessians"), lo que confirma una arquitectura hibrida con mecanismos de atencion lineal combinados con atencion estandar. El proceso de cuantizacion se realizo con `espetero quantize` de Espetero 0.2.0 (commit 616c21a), con un preset eqd6 que asigna precision de forma diferenciada por modulo: atencion lineal del primer cuarto a 8 bits, salidas a 8 bits, qkv a 5 bits, z a 6 bits, atencion y MLP a 6 bits, embedding con afinidad MLX a 6 bits y LM head a 6 bits EQ.

La calibracion se realizo con `calibration_v5` de mlx-lm sobre 112K tokens, en cuatro rangos de capas fusionados con `tools/calib_merge.py` y con las 24 matrices Hessianas de salida de atencion lineal reordenadas al orden de columnas de Hugging Face. El proceso completo tardo 19 minutos en un M1 Max con BLAS monohilo y un pico de 10,5 GB de memoria. No se dispone de informacion sobre el entrenamiento original del modelo base (tokens, composicion del dataset, RLHF/DPO) en la informacion proporcionada.

## Capacidades

- Generacion de texto y razonamiento: heredadas del modelo base Qwen3.5-9B, aunque no se detallan capacidades especificas en la model card.
- Codigo y matematicas: presumiblemente soportadas por el modelo base, sin datos concretos en la informacion disponible.
- Tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponibles en la informacion proporcionada.
- Capacidades especiales (thinking mode, vision, audio): la model card indica explicitamente "No MTP head, no vision tower", por lo que esta conversion no incluye torre de vision ni cabeza de prediccion multi-token.
- Servicio compatible con APIs OpenAI, Anthropic y Ollama a traves del servidor de Espetero.

## Casos de uso

- Inferencia local en Mac con memoria limitada: el archivo de 7,5 GB cabe en Macs con 16 GB de memoria y permite ejecutar un modelo de la familia Qwen3.5 en Apple silicon sin depender de la nube, usando `espetero serve --model Franjarjar/Qwen3.5-9B-EQD6`.
- Sustitucion de Q6_K en flujos existentes de Espetero: al tener el mismo tamano que un Q6_K y una KLD un 27,4 % inferior en la comparacion pareada, es un reemplazo directo para usuarios que ya trabajan con Espetero 0.2.0 o superior.
- Prototipado de asistentes conversacionales en local: el servidor de Espetero expone una interfaz compatible con clientes OpenAI, Anthropic y Ollama, lo que permite conectar frameworks existentes sin adaptadores.
- Evaluacion de tecnicas de cuantizacion: sirve como referencia reproducible para estudiar el impacto de EQ frente a Q6_K en terminos de divergencia KL, top-1 y velocidad de decodificacion.
- Despliegue en estaciones de trabajo Apple para tareas de generacion de codigo o texto: con 43 tok/s de decodificacion en M1 Max y previsiblemente mas en M4 Max, es viable para uso interactivo individual.
- Investigacion sobre formatos de cuantizacion nativos de GPU: el formato EQ documentado en el repositorio de Espetero permite analizar el diseno de escalas por lane y su efecto en la calidad.
- Entornos con requisitos de licencia permisiva: al conservar Apache 2.0 del modelo base, puede integrarse en productos comerciales sin obligaciones de copyleft.

## Benchmarks y rendimiento

| Metrica | Este archivo (eqd6) | Q6_K (unsloth) |
|---|---|---|
| Bits por peso | 6,65 | 6,65 |
| KLD media | 0,00189 | 0,00260 |
| KLD mediana | 0,00053 | 0,00072 |
| KLD p99 | 0,0120 | 0,0135 |
| Top-1 | 98,4 % | 98,2 % |
| Decodificacion M4 Max (tok/s) | no disponible | no disponible |
| Decodificacion M1 Max (tok/s) | 43 | 34 |

La comparacion pareada sobre las mismas ventanas de referencia indica una reduccion de KLD del 27,4 % (intervalo del 95 %: -45,5 % a -5,6 %) frente a Q6_K, con mejora en 85 % de las 62 ventanas. Las mediciones se realizaron con Espetero 616c21a sobre 123.008 tokens (62 ventanas de 2048 tokens: 31 de WikiText-2 test y 31 de codigo, sin puntuar los primeros 64 tokens de cada ventana). La decodificacion se midio con una secuencia, contexto de 128 tokens y `bench_native --quick --batch 1`, en sesion exclusiva por Mac (M4 Max: Mac Studio de 128 GB; M1 Max: MacBook Pro de 64 GB).

## Requisitos de hardware

- VRAM/memoria unificada estimada: 7,5 GB en disco; la model card indica un minimo de 16 GB de memoria en el Mac.
- GPU recomendadas: Apple silicon con Metal; probado en M1 Max (MacBook Pro, 64 GB) y M4 Max (Mac Studio, 128 GB).
- Cabe en GPU consumer: si, en Macs con chip Apple silicon y al menos 16 GB de memoria unificada.
- Opciones de despliegue: exclusivamente Espetero 0.2.0 o superior (`brew install JarJarFran/espetero/espetero`); llama.cpp, MLX y transformers no cargan el formato EQ.
- Latencia y throughput: 43 tok/s de decodificacion en M1 Max con contexto de 128 tokens; el dato para M4 Max no esta disponible en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Motor compatible |
|---|---|---|---|---|---|
| Qwen3.5-9B-EQD6 (este) | 3.058.643.456 declarados | no disponible | EQ eqd6 (safetensors) | Apache 2.0 | Solo Espetero |
| Qwen3.5-9B Q6_K (unsloth) | mismo modelo base | no disponible | GGUF Q6_K | Apache 2.0 | llama.cpp, Espetero |
| Qwen3.5-9B BF16 (original) | 9B (nominal) | no disponible | safetensors BF16 | Apache 2.0 | transformers, vLLM, TGI |

La comparativa se limita a variantes del mismo modelo base porque no se dispone de informacion sobre modelos alternativos de la misma categoria en la documentacion proporcionada. Frente a Q6_K, la ventaja medida es una KLD un 27,4 % menor con el mismo tamano y mayor velocidad de decodificacion en M1 Max (43 frente a 34 tok/s). Frente al BF16 original, la ventaja es el menor footprint (7,5 GB frente al peso completo en BF16) a costa de una perdida de calidad cuantificada por la KLD.

## Limitaciones y advertencias

- Formato propietario: los pesos EQ solo los carga Espetero 0.2.0 o superior; no son compatibles con llama.cpp, MLX, transformers, vLLM ni TGI, lo que limita su portabilidad.
- Plataforma unica: requiere Apple silicon con Metal; no se puede ejecutar en GPU NVIDIA, AMD ni en CPU convencional.
- Sin cabeza MTP ni torre de vision: esta conversion elimina capacidades multimodales y de prediccion multi-token presentes potencialmente en el modelo base.
- Discrepancia de parametros: el repositorio declara 3.058.643.456 parametros reales frente al "9B" del nombre del modelo base, lo que convierte en imprescindible verificar el comportamiento efectivo antes de usarlo en produccion.
- Perdida de calidad por cuantizacion: aunque baja (KLD media 0,00189), existe y es medible; el top-1 es del 98,4 %, lo que implica un 1,6 % de discrepancias con la distribucion de referencia.
- Reproducibilidad limitada: la model card advierte que una reconversion desde cero no sera byte-identica a este archivo, porque la calibracion se capturo con una build de desarrollo y con estadisticas derivadas de un GGUF Q8_0.
- Sin datos de benchmarks estandar: no hay resultados de MMLU, HumanEval, GSM8K ni similares en la informacion proporcionada, por lo que no se puede evaluar el rendimiento en tareas downstream.
- Idiomas no declarados: la model card no especifica los idiomas soportados.
- Sin adopcion: 0 descargas y 0 likes en el momento de la consulta, lo que implica ausencia de validacion por parte de la comunidad.
- Riesgo de alucinacion y sesgos: no documentados en la informacion proporcionada; se heredan los del modelo base.
- Licencia: Apache 2.0 permite uso comercial, pero el formato EQ y el motor Espetero (MIT) son proyectos independientes sin garantias de soporte a largo plazo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Franjarjar/Qwen3.5-9B-EQD6
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- Repositorio de Espetero: https://github.com/JarJarFran/espetero
- Documentacion del formato EQ: https://github.com/JarJarFran/espetero/blob/main/docs/eq.md
- Instalacion de Espetero via Homebrew: `brew install JarJarFran/espetero/espetero`
