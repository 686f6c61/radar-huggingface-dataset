# Oscilla/Ternary-Bonsai-1.7B-mlx-2bit

## Resumen

Ternary-Bonsai-1.7B-mlx-2bit es un modelo de lenguaje de 1.720.028.160 parámetros (1,72B) publicado por Oscilla, derivado del modelo base prism-ml/Ternary-Bonsai-1.7B-unpacked y, en última instancia, de Qwen3-1.7B. Su rasgo definitorio es que la práctica totalidad de sus pesos (embeddings, proyecciones de atención, proyecciones del MLP y LM head) están cuantizados en formato ternario {-1, 0, +1}, con una escala FP16 compartida por cada grupo de 128 pesos. Esto reduce el peso empaquetado a 0,45 GiB (0,48 GB) frente a los 3,44 GB en FP16, es decir, una reducción del 86% y un factor de compresión de 7,2x.

El modelo está pensado para inferencia en dispositivos Apple Silicon: se distribuye en formato nativo de MLX y está validado tanto en macOS (mlx-lm en Python) como en iOS/iPadOS mediante mlx-swift. La model card reporta 235 tok/s de generación en un M4 Pro de 48 GB y 103 tok/s en un iPhone 17 Pro Max, cifras que lo sitúan como una opción para ejecución local en dispositivos de gama alta sin GPU dedicada.

Su relevancia actual radica en la combinación de compresión extrema y capacidades conservadas: con 0,37-0,45 GB de peso obtiene una media de 58,47 en un suite de seis benchmarks (MMLU-R, MuSR, IFEval, GSM8K, HE+ y BFCLv3) evaluado con EvalScope v1.4.2 y vLLM 0.15.1 sobre NVIDIA H100, superando a alternativas de 1-2,5 GB como LFM2 1.2B, Gemma3 1B o Llama 3.2 1B. La licencia Apache 2.0 permite uso comercial sin restricciones declaradas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only con GQA, SwiGLU MLP, RoPE y RMSNorm (derivada de Qwen3-1.7B) |
| Parametros totales | 1.720.028.160 (1,72B) |
| Longitud de contexto | 32.768 tokens |
| Tipos de cuantizacion | Ternaria g128 (pesos en {-1, 0, +1} con una escala FP16 por grupo de 128 pesos), almacenada en el formato MLX de 2 bits (~2,125 bits/peso efectivos); version FP16 sin empaquetar como referencia |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors en formato nativo MLX (empaquetado 2-bit) |
| Tamano de vocabulario | 151.936 tokens |
| Tamano empaquetado | 0,45 GiB (0,48 GB); FP16 equivalente: 3,44 GB |
| Cobertura de la cuantizacion ternaria | Embeddings, proyecciones de atencion, proyecciones del MLP y LM head |
| Modelo base | prism-ml/Ternary-Bonsai-1.7B-unpacked (a su vez derivado de Qwen3-1.7B) |
| Libreria / runtime | mlx (Python), mlx-swift (iOS/macOS) |
| Pipeline | text-generation |
| Tamano del repositorio | 0,5 GB |

## Arquitectura y entrenamiento

La arquitectura es la de Qwen3-1.7B sin modificaciones estructurales: un transformer decoder-only con Grouped-Query Attention (GQA), MLP con activacion SwiGLU, embeddings rotatorios (RoPE) y normalizacion RMSNorm. Lo que cambia es el esquema de cuantizacion. Cada peso toma un valor del conjunto ternario {-1, 0, +1} y se le asocia una unica escala FP16 compartida por grupo de 128 pesos, de modo que w_i = scale_g * t_i. El coste teorico de informacion es log2(3) ≈ 1,585 bits por peso, mas las escalas de grupo (16 bits por cada 128 pesos), lo que arroja un minimo teorico de ~1,71 bits/peso. Esta publicacion concreta usa el formato MLX de 2 bits, que almacena cada valor ternario en 2 bits mas las escalas de grupo, resultando en ~2,125 bits/peso efectivos.

La model card no detalla la composicion del dataset de entrenamiento, el numero de tokens vistos ni si hubo fases de RLHF o DPO; esa informacion no esta disponible. La informacion tecnica disponible se limita al esquema de cuantizacion, la cobertura de la misma (incluida la LM head, un caso menos habitual en cuantizaciones agresivas) y las mediciones de rendimiento. El modelo se apoya en la implementacion de kernels 2-bit ya disponible en MLX y mlx-swift, sin necesidad de kernels personalizados adicionales.

## Capacidades

- Generacion de texto y conversacion multi-turno (pipeline text-generation, etiqueta conversational).
- Razonamiento y conocimiento general: 52,9 en MMLU-R y 50,8 en MuSR segun la tabla de benchmarks de la model card.
- Seguimiento de instrucciones: 70,1 en IFEval.
- Razonamiento matematico y aritmetico: 74,2 en GSM8K.
- Generacion de codigo: 51,8 en HE+ (HumanEval+).
- Tool calling / function calling: 51,0 en BFCLv3 (Berkeley Function Calling Leaderboard v3), lo que indica soporte evaluado de llamadas a funciones, aunque con un margen notable respecto a Qwen3-1.7B en FP16 (71,8).
- Ejecucion on-device: formato MLX para Apple Silicon, con soporte en macOS, iOS e iPadOS.
- Capacidades multilingues: no disponibles en la informacion proporcionada.
- Capacidades especiales (vision, audio, modo thinking explicito): no disponibles en la informacion proporcionada.

## Casos de uso

- Asistentes conversacionales embebidos en aplicaciones iOS/iPadOS: con 0,45 GiB de peso y 103 tok/s en un iPhone 17 Pro Max, el modelo puede ejecutarse integramente en el dispositivo mediante mlx-swift, sin enviar datos del usuario a un servidor y con una ventana de 32.768 tokens para conversaciones largas.
- Procesamiento de texto en local sobre Mac: en un M4 Pro de 48 GB alcanza 235 tok/s de generacion (TG128), lo que permite resumir documentos, redactar correos o clasificar texto en tiempo interactivo sin conexion a internet.
- Enrutado y clasificacion previa en pipelines RAG: al ser un modelo de 1,72B con 32.768 tokens de contexto, puede usarse como primer eslabon para decidir si una consulta requiere un modelo mayor, reduciendo coste y latencia en arquitecturas multi-modelo.
- Agentes ligeros con llamadas a funciones: el resultado de 51,0 en BFCLv3 indica que puede generar llamadas estructuradas a APIs, adecuado para automatizaciones de bajo riesgo donde la verificacion posterior es barata.
- Prototipado y experimentacion en investigacion sobre cuantizacion extrema: sirve como referencia reproducible para estudiar el compromiso entre compresion ternaria y calidad, dado que se publican tanto los pesos empaquetados como el modelo base sin empaquetar.
- Generacion de codigo asistida en entornos con recursos limitados: con 51,8 en HE+ puede emplearse para autocompletado, generacion de fragmentos de test o transformaciones simples de codigo en editores y herramientas locales.
- Aplicaciones de dictado y post-procesado de voz a texto: integrado tras un motor ASR en el mismo dispositivo, puede corregir puntuacion, reformatear y resumir transcripciones sin salir del terminal.
- Analisis de documentos extensos en dispositivos con memoria limitada: gracias a los 32.768 tokens de contexto y al reducido peso, permite extraccion de entidades y resumen de informes en hardware que no podria cargar un modelo de 7B en FP16.

## Benchmarks y rendimiento

Evaluacion realizada con EvalScope v1.4.2 + vLLM 0.15.1 sobre NVIDIA H100. Suite completa de 10 benchmarks segun la model card (se reproduces los seis con puntuacion detallada):

| Modelo | Tamano | Media | MMLU-R | MuSR | IFEval | GSM8K | HE+ | BFCLv3 |
|---|---|---|---|---|---|---|---|---|
| Ternary Bonsai 1.7B | 0,37 GB | 58,47 | 52,9 | 50,8 | 70,1 | 74,2 | 51,8 | 51,0 |
| 1-bit Bonsai 1.7B (anterior) | 0,24 GB | 49,60 | 43,2 | 45,1 | 63,0 | 66,3 | 45,1 | 34,9 |
| Qwen3 1.7B | 3,44 GB | 66,57 | 66,8 | 50,1 | 70,3 | 83,1 | 57,3 | 71,8 |
| Qwen3 0.6B | 1,19 GB | 48,02 | 47,5 | 41,5 | 62,8 | 64,1 | 30,5 | 41,7 |
| LFM2 1.2B | 2,34 GB | 46,73 | 52,9 | 25,4 | 77,5 | 62,2 | 36,0 | 26,4 |
| Gemma3 1B | 2,00 GB | 45,53 | 43,2 | 37,0 | 61,9 | 64,4 | 40,2 | 26,5 |
| Llama 3.2 1B | 2,47 GB | 39,88 | 47,2 | 29,2 | 47,7 | 49,0 | 35,4 | 30,8 |

Nota: los "highlights" de la model card mencionan una puntuacion media de 57,5 en 6 categorias, mientras que la tabla de benchmarks detalla 58,47; ambos valores se reproducen tal cual figuran en el material de origen. La seccion de "Intelligence Density" aparece truncada en la informacion disponible.

Rendimiento de inferencia declarado:

| Plataforma | Backend | PP512 (tok/s) | TG128 (tok/s) | Referencia FP16/4-bit (tok/s) | Aceleracion |
|---|---|---|---|---|---|
| M4 Pro 48 GB | MLX (Python) | 1.764 | 235 | 62 (FP16) | 3,8x |
| iPhone 17 Pro Max | MLX Swift | 1.456 | 103 | 60 (4-bit) | 1,7x |

## Requisitos de hardware

- VRAM/peso en memoria en formato empaquetado 2-bit g128: 0,45 GiB (0,48 GB). En FP16 sin empaquetar: 3,44 GB.
- Cabe holgadamente en cualquier GPU de consumo: el peso empaquetado es inferior a 0,5 GB, por lo que el cuello de botella es la memoria destinada a la cache KV durante la generacion, no los pesos.
- Apple Silicon: formato nativo MLX, validado en M4 Pro de 48 GB (235 tok/s de generacion) y en iPhone 17 Pro Max (103 tok/s). Requiere mlx-lm (Python) o mlx-swift (iOS/iPadOS/macOS).
- GPU NVIDIA: los benchmarks se ejecutaron con EvalScope v1.4.2 + vLLM 0.15.1 sobre H100; no se especifica en la informacion disponible si esa evaluacion empleo el formato empaquetado MLX o el modelo sin empaquetar.
- Opciones de despliegue documentadas: MLX (Python) y mlx-swift. No se documentan en la model card integraciones con llama.cpp, Ollama, TGI ni GGUF.
- Latencia y throughput: 235 tok/s de generacion en M4 Pro 48 GB y 103 tok/s en iPhone 17 Pro Max; prefill de 1.764 tok/s (PP512) en M4 Pro y 1.456 tok/s en iPhone 17 Pro Max.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tamano en disco | Media de benchmarks | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Ternary Bonsai 1.7B | 1,72B | 32.768 | 0,37-0,45 GB | 58,47 | Apache 2.0 | Pesos MLX 2-bit y base sin empaquetar |
| Qwen3 1.7B (modelo de origen) | 1,7B | 32.768 (heredado) | 3,44 GB | 66,57 | Apache 2.0 | Pesos FP16 |
| Qwen3 0.6B | 0,6B | no disponible | 1,19 GB | 48,02 | Apache 2.0 | Pesos FP16 |
| LFM2 1.2B | 1,2B | no disponible | 2,34 GB | 46,73 | no disponible | Pesos publicados |
| Gemma3 1B | 1B | no disponible | 2,00 GB | 45,53 | no disponible | Pesos publicados |
| Llama 3.2 1B | 1B | no disponible | 2,47 GB | 39,88 | no disponible | Pesos publicados |

Frente a su propio modelo de origen, Ternary Bonsai 1.7B cede 8,1 puntos de media (58,47 frente a 66,57) y mas de 20 puntos en BFCLv3 (51,0 frente a 71,8), pero ocupa 7,2x menos espacio. Frente a Qwen3 0.6B, gana 10,45 puntos de media con menos de la mitad de tamano en disco. La comparativa de contexto y licencia de los modelos alternativos no esta disponible en la informacion proporcionada.

## Limitaciones y advertencias

- Brecha de calidad respecto al modelo de origen: la cuantizacion ternaria cuesta 8,1 puntos de media y degrada especialmente el tool calling (51,0 frente a 71,8 en BFCLv3) y el razonamiento matemático (74,2 frente a 83,1 en GSM8K).
- Mayor riesgo de alucinacion y de errores de formato en salidas estructuradas que su equivalente FP16, algo esperable con ~2,125 bits por peso.
- Idiomas soportados no especificados en la informacion disponible; no se puede garantizar un rendimiento uniforme fuera del ingles sin validacion previa.
- La cuantizacion cubre tambien los embeddings y la LM head, lo que puede afectar de forma mas acusada a tokens poco frecuentes y a vocabularios no ingleses.
- El formato empaquetado es especifico de MLX: el despliegue fuera de Apple Silicon no esta documentado en la model card y requeriria el modelo base sin empaquetar.
- No se han publicado detalles sobre datos de entrenamiento, filtrado de sesgos ni evaluaciones de seguridad; no hay informacion disponible al respecto.
- Licencia Apache 2.0: permite uso comercial y modificacion sin restricciones declaradas, pero no exime de responsabilidad sobre el contenido generado.
- Fechas del repositorio: la entrada figura como creada el 2026-09-11, con 0 descargas y 0 likes en el momento de la consulta; el modelo carece de validacion por parte de la comunidad.

## Enlaces

- HuggingFace: https://huggingface.co/Oscilla/Ternary-Bonsai-1.7B-mlx-2bit
- Modelo base sin empaquetar: https://huggingface.co/prism-ml/Ternary-Bonsai-1.7B-unpacked
- Web de Prism ML: https://prismml.com
- White paper (referenciado como ternary-bonsai-8b-whitepaper.pdf): https://github.com/PrismML-Eng/Bonsai-demo/blob/main/ternary-bonsai-8b-whitepaper.pdf
- Repositorio de demo y ejemplos: https://github.com/PrismML-Eng/Bonsai-demo
- Discord de la comunidad: https://discord.gg/prismml
- MLX (kernel de Apple Silicon): https://github.com/ml-explore/mlx
- mlx-swift (iOS/macOS): https://github.com/ml-explore/mlx-swift
