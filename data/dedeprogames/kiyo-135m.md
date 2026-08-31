# DedeProGames/Kiyo-135M

## Resumen

Kiyo-135M es un modelo de lenguaje autorregresivo (decoder-only) de 134,5 millones de parámetros, desarrollado por DedeProGames y publicado bajo licencia Apache 2.0. Se trata de un modelo base preentrenado desde cero sobre 200 mil millones de tokens procedentes de una mezcla de datasets de alta calidad: FineWeb-Edu, DCLM-Baseline, FineMath y Stack-v3-train. Su arquitectura replica la de SmolLM2-135M, un diseño Llama-style con atención por grupos de claves (GQA), normalización RMSNorm, MLP con activación SwiGLU y embeddings de entrada y salida atados.

El modelo está pensado para tareas de generación de texto y completado de código en entornos con recursos limitados, donde un tamaño reducido es crítico. Su relevancia actual radica en que demuestra que un modelo pequeño, entrenado con una mezcla de datos cuidadosamente seleccionada, puede alcanzar resultados competitivos frente a alternativas de tamaño similar en benchmarks como BananaMind Base Bench 1.1, superando incluso a modelos ligeramente más grandes. Con una ventana de contexto de 8.192 tokens y un vocabulario de 49.152 entradas, ofrece una buena relación entre capacidad y coste computacional.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Llama-style decoder (SmolLM2 architecture) |
| Parametros totales | 134.515.008 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | 8.192 tokens |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

Kiyo-135M sigue la arquitectura de SmolLM2-135M, un decoder Llama-style con 30 capas, tamaño oculto de 576, tamaño intermedio de 1.536, 9 cabezas de atencion y 3 cabezas de clave/valor (grouped query attention). La normalizacion se realiza con RMSNorm, la activacion es SwiGLU y el posicionamiento usa RoPE con theta 100.000. Los embeddings de entrada y salida estan atados, lo que reduce el numero de parametros. El vocabulario tiene 49.152 tokens, un tamano relativamente grande para un modelo de este tamano, lo que permite mantener secuencias cortas.

El entrenamiento se realizo desde una inicializacion aleatoria, sin partir de los pesos de SmolLM2, sobre un total de 200.000 millones de tokens. La mezcla de datos incluye FineWeb-Edu (texto web general filtrado por calidad educativa), DCLM-Baseline (texto web de alta calidad), FineMath (razonamiento matematico) y Stack-v3-train (codigo fuente). No se menciona el uso de tecnicas de ajuste por instrucciones como RLHF o DPO; el modelo se presenta como un modelo base puro.

## Capacidades

- Generacion de texto fluido y bien estructurado, especialmente en tareas de completado de lenguaje (100% de precision en la categoria de language completion del benchmark BananaMind).
- Completado de codigo fuente, con una precision del 86% en code completion.
- Conocimiento del mundo basico (80% de precision en world knowledge).
- Razonamiento de sentido comun (74% de precision).
- Razonamiento logico basico (58% de precision).
- Seguimiento de contexto limitado (44% de precision en context tracking).
- Capacidades cuantitativas debiles (32% de precision en tareas cuantitativas).
- No soporta tool calling, ni vision, ni audio.
- No esta ajustado para seguir instrucciones; es un modelo base que continua texto.

## Casos de uso

- Generacion de texto en entornos con restricciones de memoria o latencia: al tener solo 135M de parametros, puede ejecutarse en CPU o en GPUs de gama baja, lo que lo hace adecuado para aplicaciones embebidas o de bajo consumo.
- Completado de codigo en editores ligeros: su capacidad de code completion (86% de precision) permite integrarlo en plugins de IDE o herramientas de autocompletado sin necesidad de infraestructura potente.
- Prototipado rapido de aplicaciones de lenguaje: sirve como punto de partida para experimentos de generacion de texto, pruebas de concepto o como modelo base para fine-tuning en tareas especificas.
- Educacion e investigacion: su tamano reducido y licencia permisiva facilitan su uso en cursos de procesamiento de lenguaje natural, experimentos de interpretabilidad o estudios de scaling laws.
- Generacion de contenido educativo: al estar entrenado con FineWeb-Edu, puede producir texto con sesgo hacia contenido educativo, util para generar explicaciones, resumenes o material didactico.
- Preprocesamiento de datos: puede usarse para tareas de normalizacion de texto, generacion de variantes o aumento de datos en pipelines de NLP.

## Benchmarks y rendimiento

Los resultados presentados provienen de la model card del autor, obtenidos con el script oficial de BananaMind Base Bench 1.1, todos medidos con el mismo runner, dtype (bfloat16) y GPU. Son auto-reportados y pueden variar segun la version del benchmark, la version de Transformers, el dtype, el hardware y los parametros de generacion.

| Modelo | Parametros | Elo global |
|---|---:|---:|
| **Kiyo-135M** | **134,5M** | **1.126** |
| BananaMind-2-Pro | 139,0M | 1.124 |
| Rose-Pro | 151,3M | 1.105 |
| GPT-2 | 124M | 990 |

Detalle de resultados de Kiyo-135M por categoria:

| Categoria | Precision | z vs. azar | Elo | Significativo |
|---|---:|---:|---:|:---:|
| Language completion | 100,0% | +12,25 | 1.570 | * |
| Code completion | 86,0% | +9,96 | 1.420 | * |
| World knowledge | 80,0% | +8,98 | 1.151 | * |
| Commonsense | 74,0% | +8,00 | 1.110 | * |
| Logical reasoning | 58,0% | +5,39 | 1.118 | * |
| Context tracking | 44,0% | +3,10 | 914 | * |
| Quantitative | 32,0% | +1,14 | 913 | |

\* = supera 1,96σ frente al azar; n=50 por categoria.

Por dificultad:

| Dificultad | Precision |
|---|---:|
| Facil | 76,9% |
| Media | 69,2% |
| Dificil | 56,9% |

Resumen general: Elo global 1.126, suelo de azar 805, por encima del azar +321, precision bruta 67,7%.

## Requisitos de hardware

- VRAM estimada para inferencia: menos de 1 GB en precision fp16 o bf16 (el modelo ocupa aproximadamente 269 MB en fp16). En cuantizacion de 8 bits o 4 bits, el uso de memoria seria aun menor, aunque no se han publicado pesos cuantizados oficiales.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM es suficiente. Modelos como NVIDIA GTX 1050 Ti, RTX 2060, RTX 3060, o incluso integradas con soporte CUDA, pueden ejecutarlo sin problemas. Tambien funciona en CPU con un rendimiento aceptable para generacion de pocos tokens.
- Es compatible con GPUs consumer de gama baja y con Apple Silicon (via MPS).
- Opciones de despliegue: transformers (con el codigo de ejemplo de la model card), vLLM, llama.cpp (si se convierten los pesos a GGUF), Ollama (si se empaqueta), TGI (Text Generation Inference) y cualquier framework compatible con modelos causales de HuggingFace.
- Latencia y throughput: no se han publicado mediciones oficiales. En una GPU moderna (por ejemplo, RTX 4090), se espera una generacion de cientos de tokens por segundo; en CPU, decenas de tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Elo (BananaMind) | Licencia | Disponibilidad |
|---|---:|---:|---:|---|---|
| Kiyo-135M | 134,5M | 8.192 | 1.126 | Apache 2.0 | HuggingFace |
| GPT-2 | 124M | 1.024 | 990 | MIT | OpenAI / HuggingFace |
| BananaMind-2-Pro | 139,0M | no disponible | 1.124 | no disponible | HuggingFace |
| Rose-Pro | 151,3M | no disponible | 1.105 | no disponible | HuggingFace |

Kiyo-135M supera a GPT-2 en el benchmark BananaMind y se situa ligeramente por encima de BananaMind-2-Pro, a pesar de tener menos parametros. Su ventana de contexto (8.192) es muy superior a la de GPT-2 (1.024), lo que le permite manejar secuencias mas largas. La licencia Apache 2.0 permite uso comercial sin restricciones, a diferencia de otras alternativas que pueden tener licencias mas restrictivas.

## Limitaciones y advertencias

- Es un modelo base, no ajustado para instrucciones: no sigue comandos ni preguntas de forma natural, simplemente continua el texto de entrada.
- Riesgo de alucinacion: puede generar hechos incorrectos o informacion inventada, especialmente en tareas de conocimiento del mundo.
- Debil en tareas cuantitativas y de razonamiento multi-paso: la precision en quantitative es solo del 32% y en context tracking del 44%.
- Limitado a ingles: no soporta otros idiomas de forma nativa.
- Riesgo de repeticion o deriva en generaciones largas: se recomienda usar un limite de tokens de generacion y, si es necesario, un penalty de repeticion (como en el ejemplo de uso).
- No se han publicado pesos cuantizados oficiales (GGUF, AWQ, GPTQ), por lo que para desplegarlo en entornos con restricciones de memoria habria que convertirlos manualmente.
- Los benchmarks son auto-reportados y no han sido verificados de forma independiente; los resultados pueden variar en otros entornos.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/DedeProGames/Kiyo-135M
- Dataset FineWeb-Edu: https://huggingface.co/datasets/HuggingFaceFW/fineweb-edu
- Dataset DCLM-Baseline: https://huggingface.co/datasets/mlfoundations/dclm-baseline-1.0
- Dataset FineMath: https://huggingface.co/datasets/HuggingFaceTB/finemath
- Dataset Stack-v3-train: https://huggingface.co/datasets/HuggingFaceCode/stack-v3-train
- Modelo base de referencia SmolLM2-135M: https://huggingface.co/HuggingFaceTB/SmolLM2-135M
- Benchmark BananaMind Base Bench 1.1: https://huggingface.co/datasets/BananaMind/BananaMind-Base-Bench-1.1
- Repositorio del agente de codigo KiyoCode: https://github.com/dedeprogames-official/kiyocode
- Perfil de DedeProGames en HuggingFace: https://huggingface.co/DedeProGames
