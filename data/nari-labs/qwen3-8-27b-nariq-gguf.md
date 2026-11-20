# nari-labs/Qwen3.8-27B-NariQ-GGUF

## Resumen

NariQ es una familia de cuantizaciones post-entrenamiento (PTQ) del modelo Qwen3.8-27B de Alibaba, desarrollada por nari-labs y publicada el 20 de noviembre de 2026. El modelo base es un transformer multimodal de 26.906.086.912 parámetros (aproximadamente 27B) con capacidades de imagen-texto-a-texto, orientado especialmente a tareas de agente de codificación de largo horizonte. NariQ aplica una cuantización con codificación trellis (trellis-coded quantization) calibrada sobre trazas reales de agentes de codificación, y distribuye los pesos en formato GGUF con un layout que permite ejecución en una sola GPU.

La propuesta de valor es comprimir el modelo BF16 de 53,8 GB a ficheros de 10,12 GB (3 bits por peso), 8,44 GB (2,5 bits) y 6,75 GB (2 bits), manteniendo —según el autor— un rendimiento equiparable a BF16 en tareas agénticas de largo horizonte, matemáticas y comprensión de imágenes para las variantes de 3 y 2,5 bits. Esto lo hace relevante para desarrolladores que quieren desplegar un modelo de ~27B con contexto de 262.144 tokens en GPUs de consumo o de gama profesional de 24-32 GB de VRAM.

El modelo requiere un fork específico de llama.cpp (nari-llama.cpp) para funcionar, ya que el formato NariQ no es compatible con llama.cpp estándar. La licencia es Apache 2.0, heredada del modelo base, y el pipeline declarado es image-text-to-text, lo que confirma soporte de entrada visual.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (image-text-to-text), modelo base Qwen3.8-27B; cuantizacion trellis-coded PTQ |
| Parametros totales | 26.906.086.912 (~27B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 262.144 tokens (completo); ~135K en 24 GB con 3 bits, ~160K con 2,5 bits, ~184K con 2 bits |
| Tipos de cuantizacion | 3,0 bpw (10,12 GB), 2,5 bpw (8,44 GB), 2,0 bpw (6,75 GB); proyector vision mmproj BF16 (0,93 GB) |
| Idiomas soportados | no disponible (evaluado en MGSM con 11 idiomas) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (requiere fork nari-llama.cpp) |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-27B es un transformer multimodal que acepta entradas de imagen y texto y genera texto, con un proyector de visión independiente (mmproj) que en esta distribucion se ofrece en BF16. NariQ no reentrena el modelo: aplica una cuantizacion post-entrenamiento con codificacion trellis, calibrada sobre trazas reales de agentes de codificacion (coding-agent traces), y almacena los pesos en un layout pensado para ejecutarse en una sola GPU. El informe tecnico con el detalle del metodo es arXiv:2611.26157.

Los datos de entrenamiento del modelo base (numero de tokens, composicion del dataset, uso de RLHF/DPO) no estan disponibles en la informacion proporcionada. La evaluacion de las variantes cuantizadas se realizo con el CLI Claude Code (version 2.1.309, thinking activado, effort max) controlando el modelo local, con contexto de 262.144 tokens y los ajustes de muestreo del modo thinking (temperatura 1,0, top-p 0,95, top-k 20, min-p 0). El autor reporta tambien divergencia KL frente a BF16 sobre trazas de agente reservadas, como metrica de fidelidad de la cuantizacion.

## Capacidades

- Generacion de texto y razonamiento con modo thinking (los ajustes de muestreo recomendados corresponden a thinking mode).
- Razonamiento matematico: evaluado en AIME 25+26 y MGSM (11 idiomas).
- Capacidades de agente de codificacion de largo horizonte: resolucion de tareas en DeepSWE v1.1 y Terminal-Bench 2.1 mediante CLI de agente.
- Comprension de imagenes (image-text-to-text): evaluado en RealWorldQA, con proyector de vision BF16 separado.
- Soporte multilingue: evaluado en MGSM con 11 idiomas; la lista exacta de idiomas no esta disponible.
- Integracion con llama.cpp mediante fork (llama-server), con flags de muestreo y contexto configurables.
- Tool calling / function calling: no se detalla explicitamente en la informacion disponible, aunque el uso como agente de codificacion via CLI implica interaccion con herramientas del entorno.

## Casos de uso

- Agente de codificacion autonomo en local: ejecutar el modelo con Claude Code CLI o un harness similar para resolver tareas de reparacion y desarrollo sobre repositorios reales; el autor valida esta ruta con DeepSWE v1.1 (113 tareas) y Terminal-Bench 2.1 (82 tareas x 3 intentos), donde la variante de 3 bits iguala o supera a BF16.
- Despliegue en estacion de trabajo con GPU de 24 GB: servir con llama-server del fork usando `-c 131072` y la variante de 3 bits (~135K tokens de contexto caben en 24 GB), adecuado para asistentes de codigo con contexto de repositorio amplio.
- Razonamiento matematico asistido: usar la variante de 3 bits (98,3 en AIME 25+26 segun el autor) para resolucion de problemas paso a paso con thinking mode en entornos sin acceso a la nube.
- Analisis de imagenes con contexto largo: gracias al proyector mmproj BF16 y RealWorldQA (82,4 en 3 bits, igual que BF16), sirve para tareas de comprension visual combinadas con texto en un mismo flujo.
- Automatizacion de terminal y operaciones: Terminal-Bench 2.1 mide tareas de terminal; el modelo puede emplearse para agentes que ejecutan comandos, inspeccionan salidas y corrigen errores de forma iterativa.
- Evaluacion e investigacion de cuantizacion: el paquete incluye tres niveles de bits y metricas de KL frente a BF16, util para estudiar el compromiso entre tamano y fidelidad en tareas agenticas.
- Procesamiento multilingue: con MGSM en 11 idiomas (93,1 en 3 bits), puede emplearse en razonamiento matematico y textual multilingue, aunque la lista de idiomas no esta documentada.

## Benchmarks y rendimiento

Resultados publicados por el autor (porcentaje, con recuento entre parentesis):

| Modelo | DeepSWE v1.1 (113 tareas, pass@1) | Terminal-Bench 2.1 (82 x 3) | AIME 25+26 (60 x 8) | MGSM (250 x 11 idiomas) | RealWorldQA (765 x 3) |
|---|---:|---:|---:|---:|---:|
| BF16 (53,8 GB) | 38,9 (44) | 62,6 (154) | 97,7 (469) | **94,0 (2584)** | **82,4 (1890)** |
| NariQ 3-bit (10,1 GB) | **41,6 (47)** | **63,8 (157)** | **98,3 (472)** | 93,1 (2561) | **82,4 (1890)** |
| NariQ 2,5-bit (8,4 GB) | 40,7 (46) | 60,2 (148) | 96,5 (463) | 91,8 (2525) | 81,3 (1866) |
| NariQ 2-bit (6,8 GB) | 29,2 (33) | 52,4 (129) | 86,0 (413) | 90,6 (2491) | 80,9 (1856) |

Puntuacion DeepSWE (media de tests nuevos superados por tarea): 83,0 (BF16), 84,9 (3 bits), 84,5 (2,5 bits), 75,7 (2 bits).

Velocidad de decodificacion en una NVIDIA RTX PRO 6000 (Blackwell), sesion unica, 512 tokens greedy, tokens/s:

| Contexto | 3,0 bpw | 2,5 bpw | 2,0 bpw | UD-IQ3_XXS (10,9 GB) |
|---:|---:|---:|---:|---:|
| 4K | 88,9 | 99,2 | 111,7 | 94,7 |
| 16K | 84,5 | 93,8 | 105,1 | 89,8 |
| 64K | 70,7 | 77,5 | 85,0 | 74,8 |

## Requisitos de hardware

- VRAM estimada: 3 bits ~30 GB a contexto completo de 262K; 2,5 bits ~28 GB; 2 bits ~27 GB (incluyendo proyector de vision).
- En GPU de 24 GB caben aproximadamente 135K tokens de contexto con 3 bits, 160K con 2,5 bits y 184K con 2 bits.
- GPU recomendadas: NVIDIA RTX PRO 6000 (Blackwell, usada en las mediciones de velocidad), GPUs de 32 GB o mas para contexto completo. Requiere driver 570 o superior en Linux.
- Cabe en GPU de consumo de gama alta con 24 GB (p. ej. RTX 4090) si se reduce el contexto; el autor indica `-c 131072` para 24 GB "con poco margen".
- Opciones de despliegue: llama-server del fork nari-llama.cpp (binarios precompilados, imagen Docker y script `run.sh`); no compatible con llama.cpp estandar, vLLM, Ollama ni TGI segun la informacion disponible.
- Throughput medido: 88,9 tokens/s a 4K y 70,7 tokens/s a 64K con 3 bits en RTX PRO 6000; la variante de 2 bits alcanza 111,7 tokens/s a 4K.
- Flags de ejecucion recomendados: `-ngl 99 --jinja --temp 1.0 --top-p 0.95 --top-k 20 --min-p 0`, con `-fa on -ctk bf16 -ctv bf16` para las mediciones de velocidad.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tamano en disco | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| NariQ Qwen3.8-27B 3-bit | ~27B | 262.144 | 10,12 GB | Apache 2.0 | GGUF, fork nari-llama.cpp |
| Qwen3.8-27B BF16 (base) | ~27B | 262.144 | 53,8 GB | Apache 2.0 | Pesos originales en Qwen |
| UD-IQ3_XXS (Unsloth, misma base) | ~27B | no disponible | 10,9 GB | Apache 2.0 | GGUF, llama.cpp estandar |

El autor compara su harness (Claude Code) con los resultados publicados por Unsloth (mini-swe-agent) en DeepSWE y Terminal-Bench, advirtiendo que los harness son distintos y que cada punto debe compararse con la linea BF16 de su propio harness. No se dispone de datos de benchmarks de otras alternativas de cuantizacion en la informacion proporcionada.

## Limitaciones y advertencias

- La variante de 2 bits pierde rendimiento de forma notable: 29,2 en DeepSWE frente a 38,9 de BF16 y 86,0 en AIME frente a 97,7; no es recomendable para tareas agenticas o matematicas exigentes.
- Requiere un fork especifico de llama.cpp; no funciona con llama.cpp estandar ni con otros motores de inferencia habituales (vLLM, TGI, Ollama), lo que limita la portabilidad.
- El contexto completo de 262K exige ~27-30 GB de VRAM; en GPUs de 24 GB hay que reducir el contexto, con el consiguiente impacto en tareas de repositorio largo.
- Los benchmarks son autoinformados por el autor y dependen del harness (Claude Code CLI, thinking on, effort max); no son directamente comparables con resultados de otros harness.
- Sesgos conocidos: no documentados en la informacion disponible; al heredar el modelo base Qwen3.8-27B, arrastra los sesgos de este.
- Riesgo de alucinacion: no cuantificado en la informacion disponible; es un riesgo inherente a modelos generativos de este tamano, especialmente en modo agente.
- Idiomas soportados: no se publica la lista completa; solo se confirma evaluacion en 11 idiomas via MGSM.
- Licencia Apache 2.0 permite uso comercial, pero conviene verificar las condiciones del modelo base Qwen3.8-27B y del fork nari-llama.cpp antes de produccion.
- El modelo es reciente (noviembre de 2026) y con 0 descargas y 0 likes en Hugging Face en el momento de la consulta; la madurez del ecosistema y el soporte comunitario son limitados.

## Enlaces

- Hugging Face: https://huggingface.co/nari-labs/Qwen3.8-27B-NariQ-GGUF
- Informe tecnico: https://arxiv.org/abs/2611.26157
- Referencia adicional citada en tags: https://arxiv.org/abs/2406.11235
- Fork de llama.cpp: https://github.com/nari-labs/nari-llama.cpp
- Script de arranque: https://github.com/nari-labs/nari-llama.cpp/releases/download/b12431-nariv0/run.sh
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
