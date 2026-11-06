# Franjarjar/Qwen3.6-35B-A3B-EQ4DHB

## Resumen

Qwen3.6-35B-A3B-EQ4DHB es una cuantización del modelo Qwen/Qwen3.6-35B-A3B, un modelo de lenguaje y visión de tipo mixture-of-experts (MoE) desarrollado por Alibaba (equipo Qwen). El modelo base combina mecanismos de atención lineal con un marco MoE disperso, lo que reduce el coste computacional en inferencia manteniendo una calidad alta en tareas de razonamiento, código y matemáticas. La cuantización la firma el usuario Franjarjar y está pensada específicamente para Espetero, un motor de inferencia nativo para Metal en Apple silicon.

El formato EQ (LaneQuant) es propietario de Espetero: almacena códigos de 4 bits con un codebook de 16 entradas, mezclados con códigos de 5 y 8 bits, y una escala de 8 bits con signo por cada 16 entradas más una escala fp16 por cada 256. El resultado ocupa 23,0 GB en disco y ronda las 5,19 bits por peso sobre los parámetros de texto del modelo base, sin contar la cabeza MTP.

La relevancia de esta ficha es doble: por un lado documenta una cuantización concreta de un modelo MoE de gran tamaño orientada a hardware Apple; por otro, sirve de ejemplo de un ecosistema de formatos de cuantización alternativos a GGUF y MLX que no son intercambiables con llama.cpp, transformers ni MLX nativo. El repositorio declara licencia Apache 2.0, heredada del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido con atención lineal y mixture-of-experts disperso (familia qwen3_5_moe) |
| Parametros totales | 8.863.146.112 (según safetensors del repo de cuantización; el nombre del modelo base indica 35B-A3B, discrepancia no aclarada en la información disponible) |
| Parametros activos | no disponible (el nombre del modelo base sugiere ~3B activos, sin confirmación en la información proporcionada) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | EQ (LaneQuant) propietario de Espetero: 4 bits con codebook de 16 entradas, 5 bits y 8 bits según tensor y capa; embeddings y LM head en MLX affine 8 bits; routers y norms en BF16 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors con cuantización EQ (no compatible con GGUF, MLX ni transformers) |

## Arquitectura y entrenamiento

El modelo base Qwen3.6-35B-A3B es un modelo nativo visión-lenguaje construido sobre una arquitectura híbrida que combina atención lineal con un marco de mixture-of-experts disperso. Según la documentación de Alibaba Cloud, esta combinación busca mayor eficiencia en inferencia que la generación anterior (3.5-35B-A3B), con mejoras declaradas en capacidades de codificación agéntica, razonamiento matemático y de código, e inteligencia espacial. No se dispone en la información proporcionada de detalles sobre el número de tokens de entrenamiento, la composición del dataset ni las etapas de alineación (RLHF/DPO).

La cuantización EQ4DHB se generó con la herramienta `espetero quantize` de Espetero 0.2.0 (commit `616c21a`), en unos 30 minutos sobre un M4 Max con BLAS monohilo y un pico de 6 GB de memoria. La calibración se capturó a partir del forward en BF16 sobre `calibration_v5.txt` de mlx-lm (112.640 tokens, ventanas de 2048). El esquema aplica 4 bits a las proyecciones gate/up de los expertos enrutados (5 bits en las capas 0-7 y 36-39), 5 bits a las proyecciones down (4 bits con codebook en las capas 16-31), y 8 bits al resto de matrices (atención, atención lineal, experto compartido), con 6 bits en las capas 16-31. Incluye la cabeza MTP en MLX affine 8 bits con expertos en 4 bits, pero no la torre de visión.

## Capacidades

- Generación de texto y razonamiento de propósito general, heredados del modelo base Qwen3.6-35B-A3B.
- Razonamiento matemático y de código, con mejoras declaradas por Alibaba frente a la generación 3.5.
- Codificación agéntica y multi-step reasoning, según la documentación del modelo base.
- Capacidades de visión en el modelo base (torre de visión), aunque la torre no está incluida en esta cuantización.
- Inteligencia espacial, según la documentación de Alibaba Cloud.
- Servicio compatible con clientes OpenAI, Anthropic y Ollama a través de `espetero serve`.
- Soporte de tool calling y function calling: no confirmado explícitamente en la información disponible.
- Capacidades multilingües: no disponible.
- Modo thinking: no disponible.

## Casos de uso

- Inferencia local en Mac con Apple silicon: el modelo está diseñado para ejecutarse con Espetero en equipos con 32 GB de memoria o más, lo que permite desplegar un MoE de gran tamaño en un portátil o un Mac Studio sin GPU dedicada.
- Prototipado de agentes de código en local: gracias a las capacidades de codificación agéntica del modelo base, se puede usar como backend de un asistente que ejecute pasos múltiples sobre un repositorio, siempre que el cliente hable el protocolo OpenAI, Anthropic u Ollama.
- Evaluación de cuantizaciones: el repositorio publica métricas de divergencia KL y acuerdo top-1 frente a BF16, lo que lo convierte en un caso de estudio útil para comparar formatos de cuantización a igual tamaño de archivo.
- Desarrollo de herramientas sobre Espetero: al ser un formato nativo del motor, sirve para probar integraciones con `espetero serve` y clientes compatibles con la API de OpenAI.
- Experimentación con razonamiento matemático en local: el modelo base declara mejoras en razonamiento matemático, adecuado para cuadernos de experimentación sin depender de la nube.
- Benchmarking de hardware Apple: las cifras de decodificación publicadas (116 tok/s en M4 Max, 80 tok/s en M1 Max) permiten usar el modelo como referencia para medir rendimiento de otras configuraciones.

## Benchmarks y rendimiento

| Metrica | Este archivo (EQ4DHB) | unsloth UD-Q4_K_XL (Espetero) | MLX 4-bit DWQ | MLX 4-bit (paper build) |
|---|---|---|---|---|
| Bits por peso | 5,19 | 5,16 | 4,77 | 4,71 |
| KLD media | 0,00857 | 0,00996 | 0,0234 | 0,0694 |
| KLD mediana | 0,00221 | 0,00255 | 0,00725 | 0,0263 |
| KLD p99 | 0,0880 | 0,1039 | 0,2343 | 0,6018 |
| Acuerdo top-1 | 96,6 % | 96,4 % | 94,2 % | 89,7 % |
| Decode M4 Max (tok/s) | 116 | 91 | no disponible | no disponible |
| Decode M1 Max (tok/s) | 80 | 62 | no disponible | no disponible |

Comparación pareada frente a UD-Q4_K_XL sobre las mismas ventanas: KLD −14,0 % (intervalo del 95 %: −16,6 % a −11,4 %; menor en el 95 % de las 62 ventanas). Frente a UD-Q4_K_XL descomprimido a fp32: KLD −13,4 % (intervalo −16,2 % a −10,9 %). Las mediciones se hicieron sobre 123.008 tokens (62 ventanas de 2048 tokens, 31 de WikiText-2 test y 31 de código, sin puntuar los primeros 64 de cada ventana). No se han publicado resultados de benchmarks de tareas (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- Memoria: mínimo 32 GB de memoria unificada en Mac, según la model card.
- Tamaño en disco: 23,0 GB.
- GPU compatibles: Apple silicon con Metal; las mediciones publicadas usan M4 Max (Mac Studio, 128 GB) y M1 Max (MacBook Pro, 64 GB).
- No cabe en GPU consumer tipo RTX 4090 por la incompatibilidad de formato: Espetero solo corre en Apple silicon, no en CUDA.
- Despliegue: exclusivamente mediante Espetero 0.2.0 o superior (`brew install JarJarFran/espetero/espetero` y `espetero serve --model Franjarjar/Qwen3.6-35B-A3B-EQ4DHB`). No es compatible con llama.cpp, MLX, transformers, vLLM, TGI ni Ollama como motor de carga, aunque sí se puede apuntar un cliente Ollama al servidor.
- Throughput de decodificación: 116 tok/s en M4 Max y 80 tok/s en M1 Max, con una secuencia, contexto de 128 tokens y `bench_native --quick --batch 1`.
- Latencia: no disponible más allá de las cifras de decodificación.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Franjarjar/Qwen3.6-35B-A3B-EQ4DHB | 8,86B en safetensors (nombre base 35B-A3B) | no disponible | EQ (solo Espetero) | Apache 2.0 | Hugging Face, 17 descargas |
| unsloth UD-Q4_K_XL de Qwen3.6-35B-A3B | mismo base | no disponible | GGUF | Apache 2.0 | Hugging Face |
| MLX 4-bit DWQ (mlx-community) | mismo base | no disponible | MLX | Apache 2.0 | Hugging Face |
| Qwen/Qwen3.6-35B-A3B (BF16) | 35B-A3B | no disponible | safetensors | Apache 2.0 | Hugging Face |

La comparación relevante es de formato y motor: EQ4DHB solo se ejecuta en Espetero sobre Apple silicon, mientras que GGUF y MLX tienen ecosistemas mucho más amplios. A igual tamaño de archivo, la model card reporta mejor KLD y top-1 que UD-Q4_K_XL y que las variantes MLX 4-bit.

## Limitaciones y advertencias

- Formato propietario: los archivos EQ no se cargan en llama.cpp, MLX ni transformers; el modelo queda atado al motor Espetero y a Apple silicon.
- Discrepancia de parámetros: el nombre del modelo base indica 35B-A3B, pero el recuento real de safetensors del repo es de 8.863.146.112 parámetros; conviene verificar antes de planificar despliegues.
- Sin torre de visión: aunque el modelo base es visión-lenguaje, esta cuantización no incluye la torre de visión, por lo que no procesa imágenes.
- Idiomas no declarados: la model card no especifica la cobertura lingüística de esta cuantización.
- Riesgo de alucinación: inherente a los modelos de lenguaje; no hay evaluación específica en la información disponible.
- Sesgos: no documentados en la información proporcionada.
- Licencia: Apache 2.0 permite uso comercial, pero se hereda del modelo base; conviene revisar los términos del modelo original.
- Madurez: 17 descargas y 0 likes en el momento de la consulta; es un artefacto reciente (creado el 2026-11-05) y sin validación comunitaria amplia.
- Dependencia de versión: requiere Espetero 0.2.0 o superior; versiones anteriores no cargan el formato.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Franjarjar/Qwen3.6-35B-A3B-EQ4DHB
- Modelo base: https://huggingface.co/Qwen/Qwen3.6-35B-A3B
- Motor Espetero: https://github.com/JarJarFran/espetero
- Documentación del formato EQ: https://github.com/JarJarFran/espetero/blob/main/docs/eq.md
- Documentación del modelo base en Alibaba Cloud: https://www.alibabacloud.com/help/en/model-studio/qwen3-6-35b-a3b
