# Franjarjar/Qwen3.6-35B-A3B-EQ6H

## Resumen

Qwen3.6-35B-A3B-EQ6H es una cuantizacion del modelo Qwen3.6-35B-A3B de Alibaba Cloud, publicada por el usuario Franjarjar. No se trata de un modelo nuevo, sino de una conversion de pesos a un formato propietario denominado EQ (LaneQuant), disenado especificamente para Espetero, un motor de inferencia nativo para Metal en Apple Silicon desarrollado por el mismo autor. El modelo base es un Mixture-of-Experts con 35.000 millones de parametros totales y unos 3.000 millones activos por token, lo que lo hace especialmente adecuado para despliegue en equipos de memoria unificada.

La relevancia de esta publicacion es practica: ofrece una alternativa de cuantizacion de 6 bits que, segun las mediciones del autor, supera en calidad a UD-Q6_K de Unsloth con un tamano ligeramente inferior y un rendimiento de decodificacion notablemente superior en hardware Apple (109 tok/s en M4 Max frente a 87 tok/s). El repositorio ocupa 29,6 GB y requiere al menos 48 GB de memoria unificada.

El principal caveat es la interoperabilidad: los ficheros EQ solo los carga Espetero. Ni llama.cpp, ni MLX, ni transformers pueden leerlos, lo que limita su uso a Macs con el motor instalado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture-of-Experts (MoE) transformer, familia Qwen3.6 (tag `qwen3_5_moe`) |
| Parametros totales | 35.000 millones (nominal); 10.508.689.536 tensores reportados en safetensors |
| Parametros activos | ~3.000 millones por token |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | EQ6H: expertos enrutados a 6 bits, resto de matrices a 8 bits, embeddings y LM head MLX affine 8 bits, routers y norms BF16, MTP head MLX affine 8 bits con expertos a 4 bits; 6,71 bits por peso |
| Idiomas soportados | no disponibles |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors con formato EQ (LaneQuant), exclusivo de Espetero |

## Arquitectura y entrenamiento

El modelo base es un transformer con arquitectura Mixture-of-Experts: 35.000 millones de parametros totales de los que solo unos 3.000 millones se activan por token, lo que reduce el coste computacional de inferencia manteniendo capacidad representacional. Incluye una cabeza MTP (multi-token prediction) que esta presente en esta cuantizacion, y dispone de una torre de vision en el modelo original que no se incluye en este repositorio.

Esta ficha no documenta el entrenamiento del modelo base. Lo que si se detalla es el proceso de cuantizacion: el autor uso `espetero quantize` (commit `616c21a`, con la opcion de ponderacion por router del commit `5973195`), con 262.144 tokens de calibracion compuestos por calibration_v5 de mlx-lm (43 %), chat SFT de tulu-3 con thinking activado y desactivado (22 %), chat multilingue aya de tulu-3 (15 %), conversaciones de uso de herramientas en formato del template (8 %, sinteticas) y prosa de C4 (12 %). Cada par enrutado de las estadisticas de un experto se pondero por su peso de routing, garantizando al menos 264 filas por experto. El proceso tardo 20 minutos en un M4 Max con BLAS monohilo y un pico de 6 GB de memoria.

La innovacion tecnica del formato EQ (LaneQuant) es el empaquetado: codigos de 6 y 8 bits con una escala de 8 bits con signo por cada 16 entradas y una escala fp16 por cada 256, eligiendo el bloque de 16 de modo que cada lane de los kernels matriciales del GPU de Apple necesite una sola escala por paso.

## Capacidades

- Generacion de texto y razonamiento: hereda las capacidades del modelo base Qwen3.6-35B-A3B, incluido el modo thinking (el template de chat con thinking activado y desactivado se uso en la calibracion).
- Codigo y matematicas: la calibracion incluye ventanas de codigo y el modelo base esta orientado a tareas de programacion.
- Tool calling / function calling: la calibracion incorpora conversaciones en el formato de herramientas del template, lo que sugiere soporte del modelo base para uso de herramientas.
- Razonamiento multi-paso y agentes: soportado por el modelo base, aunque esta ficha no aporta detalles adicionales.
- Multilingue: el conjunto de calibracion incluye chat multilingue aya, pero no se especifican los idiomas cubiertos.
- Prediccion multi-token (MTP): la cabeza MTP esta incluida en la cuantizacion (MLX affine 8 bits, expertos 4 bits).
- Vision: no incluida en este repositorio; la torre de vision del modelo base no se ha cuantizado.

## Casos de uso

- Inferencia local en Mac con memoria unificada: un Mac Studio o MacBook Pro con 48 GB o mas puede ejecutar el modelo completo a traves de `espetero serve`, con 109 tok/s en M4 Max y 75 tok/s en M1 Max en decodificacion de una secuencia con contexto de 128 tokens.
- Sustitucion de API en flujos existentes: Espetero expone un servidor compatible con clientes OpenAI, Anthropic y Ollama en `http://127.0.0.1:8080`, por lo que se puede apuntar una aplicacion ya escrita contra esos SDK sin cambios de codigo.
- Prototipado de agentes con tool calling: al conservar el formato de herramientas del template y la cabeza MTP, es util para probar pipelines de agentes en local antes de desplegar en infraestructura mayor.
- Evaluacion de calidad de cuantizacion: con una KLD media de 0,00378 y un top-1 del 97,8 % frente al BF16, sirve como referencia para comparar tecnicas de cuantizacion en entornos Apple.
- Desarrollo sin conexion: al ejecutarse integramente en local, es adecuado para entornos con requisitos de privacidad o sin acceso a red.
- Docencia e investigacion en eficiencia: el modelo y su proceso de calibracion documentado (ponderacion por router, 262.144 tokens) permiten reproducir y estudiar el efecto de la calibracion en MoE.

## Benchmarks y rendimiento

El autor publica metricas de divergencia KL frente al modelo BF16 con activaciones fp32, sobre 123.008 tokens (62 ventanas de 2.048 tokens: 31 de WikiText-2 test y 31 de codigo).

| Fichero | Medido con | Bits/peso | KLD media | KLD mediana | KLD p99 | Top-1 | Decode M4 Max (tok/s) | Decode M1 Max (tok/s) |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| Este fichero (EQ6H) | Espetero 616c21a | 6,71 | 0,00378 | 0,00086 | 0,0399 | 97,8 % | 109 | 75 |
| unsloth UD-Q6_K | Espetero 616c21a | 6,76 | 0,00426 | 0,00102 | 0,0445 | 97,6 % | 87 | 59 |
| unsloth UD-Q6_K | dequantizado, fp32 | 6,76 | 0,00431 | 0,00100 | 0,0437 | 97,7 % | no disponible | no disponible |
| AutoRound Q6_K (sphaela) | dequantizado, fp32 | 6,58 | 0,00614 | 0,00178 | 0,0604 | 97,1 % | no disponible | no disponible |
| MLX 8-bit | Espetero (paper build) | 8,71 | 0,00440 | 0,00105 | 0,0450 | 97,7 % | no disponible | no disponible |

Comparacion pareada sobre las mismas ventanas: frente a UD-Q6_K, KLD -11,3 % (intervalo del 95 %: -14,7 % a -7,5 %; inferior en el 82 % de las 62 ventanas); frente a UD-Q6_K dequantizado a la referencia fp32, KLD -12,3 % (intervalo del 95 %: -16,4 % a -8,5 %; inferior en el 84 % de las ventanas). La calibracion con ponderacion por router mejoro la KLD un 3,8 % (intervalo del 95 %: -6,9 % a -0,7 %) frente al preset por defecto (0,00393).

No se han publicado resultados de benchmarks de tareas (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- Memoria: minimo 48 GB de memoria unificada en Mac; el repositorio ocupa 29,6 GB en disco.
- GPU: Apple Silicon exclusivamente (Metal). Mediciones del autor en M4 Max (Mac Studio, 128 GB) y M1 Max (MacBook Pro, 64 GB).
- GPU consumer: no aplica a GPUs NVIDIA o AMD; el formato EQ no lo cargan llama.cpp, MLX ni transformers.
- Despliegue: Espetero 0.2.0 o superior (`brew install JarJarFran/espetero/espetero`; `espetero serve --model Franjarjar/Qwen3.6-35B-A3B-EQ6H`). Servidor compatible con clientes OpenAI, Anthropic y Ollama.
- Rendimiento: 109 tok/s en M4 Max y 75 tok/s en M1 Max en decodificacion de una secuencia con contexto de 128 tokens, medido con `bench_native --quick --batch 1`. No se publican datos de throughput en prefill ni de latencia con contextos largos.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Qwen3.6-35B-A3B-EQ6H (esta ficha) | 35B totales / ~3B activos | no disponible | EQ (solo Espetero) | Apache 2.0 | KLD media 0,00378; 109 tok/s en M4 Max |
| unsloth UD-Q6_K (del mismo base) | 35B totales / ~3B activos | no disponible | GGUF | Apache 2.0 | KLD media 0,00426; 87 tok/s en M4 Max con Espetero |
| AutoRound Q6_K (sphaela) | 35B totales / ~3B activos | no disponible | no disponible | no disponible | KLD media 0,00614 medido dequantizado |
| MLX 8-bit (del mismo base) | 35B totales / ~3B activos | no disponible | MLX | Apache 2.0 | KLD media 0,00440; 8,71 bits por peso |

## Limitaciones y advertencias

- Compatibilidad restringida: los ficheros EQ solo los carga Espetero; no funcionan en llama.cpp, MLX ni transformers, lo que descarta su uso en GPU NVIDIA, AMD o en la nube convencional.
- Requisito de hardware estricto: solo Apple Silicon con 48 GB o mas de memoria unificada.
- Torre de vision ausente: el modelo no puede procesar imagenes en esta version.
- Idiomas no documentados: no se especifica la cobertura linguistica del modelo base en esta ficha.
- Contexto no documentado: no se indica la longitud maxima de contexto.
- Riesgo de alucinacion: inherente al modelo base; no se aportan datos especificos de mitigacion.
- Sesgos: no documentados en la informacion disponible; se heredan los del corpus de entrenamiento del modelo base.
- Licencia: Apache 2.0 permite uso comercial, pero el motor Espetero es MIT y la licencia de los pesos del modelo base debe respetarse por separado.
- Madurez: el repositorio tiene 11 descargas y 0 likes, y el formato EQ es joven; conviene validar la calidad en el dominio propio antes de produccion.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Franjarjar/Qwen3.6-35B-A3B-EQ6H
- Modelo base: https://huggingface.co/Qwen/Qwen3.6-35B-A3B
- Motor Espetero: https://github.com/JarJarFran/espetero
- Documentacion del formato EQ: https://github.com/JarJarFran/espetero/blob/main/docs/eq.md
- Ficha del modelo base en Jetson AI Lab: https://www.jetson-ai-lab.com/models/qwen3-6-35b-a3b/
