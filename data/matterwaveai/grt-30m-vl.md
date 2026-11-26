# MatterWaveAI/grt-30m-vl

## Resumen

GRT-30M-VL es un modelo vision-lenguaje de 34,26 millones de parametros desarrollado por MatterWaveAI, construido sobre el modelo de lenguaje GRT-30M del mismo autor. Su particularidad es que se presenta como un transformer "100% rotacional": ni el codificador visual ni el backbone de lenguaje contienen matrices densas `nn.Linear`, sino que toda la computacion se articula mediante rotaciones de Givens y operaciones inspiradas en algebra de Clifford. El modelo procesa imagenes RGB de 224x224 y genera texto condicionado por la imagen.

El modelo resuelve la tarea de image-text-to-text (descripcion de imagenes, respuesta a preguntas visuales sencillas) en un rango de parametros muy pequeno, lo que lo hace adecuado para experimentacion en hardware de consumo y para investigacion sobre arquitecturas alternativas al transformer clasico. Su relevancia actual es mas conceptual que practica: explora si un modelo multimodal puede funcionar sin proyecciones lineales densas, sustituyendolas por cascadas de rotaciones.

La model card reporta resultados de un protocolo de alineacion multimodal de 200 pasos con ocho optimizadores geometricos distintos, con perplexity de validacion en torno a 1,22-1,28 y precision de token de caption entre 91% y 93%. Estos datos son internos del autor y no corresponden a benchmarks estandar de la comunidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal rotacional (Givens rotations, algebra de Clifford), sin capas `nn.Linear` |
| Parametros totales | 35.133.941 (safetensors); 34.259.756 segun model card |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en float32) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (libreria transformers) |

## Arquitectura y entrenamiento

El modelo se compone de una torre visual (`GRTVisionModel`, 4.954.258 parametros) y un backbone de lenguaje (`GRTModel` + `GRTCosineHead`, 29.305.498 parametros). La torre visual incluye un patch stem polar (`GRTPolarPatchEmbedding`, 20.992 parametros) que descompone la imagen en parches de 14x14, aplica `GRTPearlNorm` y una cascada butterfly de 11 etapas de rotaciones de Givens hasta 256 dimensiones; un codificador posicional rotacional 2D (`GRTRotaryEmbedding2D`, 128 parametros) sobre una rejilla de 16x16 parches; seis capas `GRTDecoderLayer` bidireccionales (`is_causal=False`) con atencion multi-cabeza rotacional (11 rotaciones QKV) y un mixer de Clifford; y un fusionador espacial (`GRTSpatialRotationalMerger`, 56.000 parametros) que hace un pixel-unshuffle 2x2 y proyecta con 21 etapas de Givens. El backbone de lenguaje es un modelo causal de 12 capas con embeddings polares y cabeza coseno atados.

El entrenamiento descrito en la model card consiste en una alineacion multimodal de 200 pasos en dos etapas: 100 pasos sobre el stem visual y el fusionador (896.003 parametros, lr 4.0e-3) y 100 pasos sobre los dos ultimos bloques del decodificador y `final_norm` (lr 3.5e-3), con batch de 48, paso angular maximo de 0.08 y semilla 42. Se probaron ocho optimizadores geometricos (PolarNaturalAdam, HuygensAdam, GyricAdam, HessianPairAdam, SymplecticAdam, HuygensSymplecticAdam, PairAdam y CyclideAdam) sobre hardware Spark ROCm gfx1151. No se detalla el volumen de datos de entrenamiento ni la composicion del dataset.

## Capacidades

- Generacion de texto condicionada por imagen (image captioning) mediante el token especial `<|image_pad|>`.
- Procesamiento de imagenes RGB de 224x224, convertidas en 64 tokens visuales de dimension 256.
- Reconocimiento de atributos visuales basicos: color, posicion espacial y forma (con precisiones reportadas del 100%, 100% y 54,2% respectivamente en el conjunto de validacion del autor).
- Generacion de texto autoregresiva con el backbone GRT-30M subyacente.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponibles.
- Modo thinking, vision, audio u otras capacidades especiales: solo vision (entrada de imagen); no se documentan otras.

## Casos de uso

- Experimentacion academica con arquitecturas sin capas lineales: el modelo sirve como banco de pruebas para investigar si las rotaciones de Givens pueden sustituir a las proyecciones densas en tareas multimodales, gracias a su tamano reducido (34M parametros) y a su implementacion en transformers.
- Prototipado de captioning de imagenes en local: con 0,2 GB de repositorio y pesos en float32, puede cargarse en una GPU de consumo o incluso en CPU para generar descripciones breves de imagenes sinteticas o de dominio controlado.
- Validacion de pipelines de alineacion multimodal: el modelo documenta un protocolo reproducible de 200 pasos con ocho optimizadores, util para comparar metodos de optimizacion geometrica en entornos de investigacion.
- Demostraciones educativas de algebra de Clifford y rotaciones: la arquitectura explicita (cascadas de Givens, mixer de Clifford, embeddings polares) permite ilustrar conceptos matematicos en cursos o talleres.
- Pruebas de integracion con `AutoModelForImageTextToText` y `AutoProcessor`: sirve para verificar compatibilidad de la API de transformers con modelos experimentales y para desarrollar tooling de carga de modelos no convencionales.
- Generacion de descripciones para conjuntos de imagenes simples en tareas de etiquetado asistido: adecuado solo en dominios muy acotados (colores, posiciones, formas basicas) donde la precision reportada del autor es alta.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. La model card incluye unicamente metricas internas de alineacion multimodal:

| Metrica (validacion del autor) | Valor |
|---|---|
| Perplexity de caption (mejor, PolarNaturalAdam) | 1,2242 |
| Perplexity de caption (peor, CyclideAdam) | 1,2847 |
| Precision top-1 de token de caption (mejor, HuygensAdam) | 93,08% |
| Precision top-1 de token de caption (peor, CyclideAdam) | 91,03% |
| Margen contrastivo imagen correcta vs incorrecta (mejor) | +1,6284 nats/token |
| Precision de preferencia por imagen correcta | 100,0% |
| Precision de reconocimiento de color (mejor) | 100,0% |
| Precision de reconocimiento de posicion (mejor) | 100,0% |
| Precision de reconocimiento de forma (mejor) | 54,2% |
| Coincidencia exacta de caption (mejor) | 41,7% |

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,14 GB en float32 (35,1M parametros x 4 bytes), mas overhead de activaciones y del procesador; cabe holgadamente en cualquier GPU moderna.
- GPU recomendadas: cualquier GPU con al menos 1-2 GB de VRAM; el autor reporta entrenamiento en Spark ROCm gfx1151 (APU AMD).
- Cabe en GPU de consumo: si, incluidas GTX 1650, RTX 3050, RTX 4060 y superiores; tambien es viable en CPU.
- Opciones de despliegue: transformers (`AutoModelForImageTextToText`, `AutoProcessor`); no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, y la ausencia de capas `nn.Linear` hace improbable su conversion a GGUF sin trabajo adicional.
- Latencia y throughput: no disponibles; el autor solo reporta tiempos de entrenamiento por optimizador (55-83 s para 200 pasos con batch 48).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Enfoque |
|---|---|---|---|---|
| GRT-30M-VL | 35,1M (34,3M segun card) | no disponible | Apache 2.0 | Transformer rotacional sin `nn.Linear` |
| SmolVLM-256M (HuggingFace) | 256M | 2K aprox. | Apache 2.0 | Transformer multimodal clasico |
| Moondream2 | 1,86B | 2K aprox. | Apache 2.0 | Vision-lenguaje compacto |
| PaliGemma-3B | 3B | 8K aprox. | Gemma license | Vision-lenguaje SigLIP + Gemma |

La comparacion con estos modelos es orientativa: GRT-30M-VL es un orden de magnitud menor en parametros y no dispone de benchmarks publicos comparables, por lo que no puede establecerse una equivalencia de rendimiento con las alternativas comerciales o de gran adopcion.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados; el entrenamiento se realizo sobre un conjunto no especificado, por lo que pueden persistir sesgos de los datos de alineacion.
- Riesgo de alucinacion: alto en tareas abiertas; la coincidencia exacta de caption reportada es del 41,7% y el reconocimiento de forma del 54,2%, lo que indica baja fiabilidad en descripciones detalladas.
- Limitaciones de contexto e idioma: la longitud de contexto no esta documentada y no se especifican idiomas soportados; el modelo base GRT-30M es de proposito general y su cobertura linguistica es desconocida.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el modelo depende de la implementacion `transformers.models.grt`, cuyo soporte y estabilidad no estan garantizados fuera del repositorio del autor.
- Caveats para produccion: la arquitectura sin `nn.Linear` limita la compatibilidad con herramientas de cuantizacion y servidores de inferencia estandar; las metricas reportadas provienen de un protocolo de 200 pasos sobre validacion interna, no de evaluaciones independientes; el modelo esta pensado para investigacion, no para despliegues en produccion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/MatterWaveAI/grt-30m-vl
- Modelo base: https://huggingface.co/MatterWaveAI/grt-30m
- Repositorio de transformers (implementacion `grt`): https://github.com/huggingface/transformers
- No se han encontrado papers, blogs, demos ni repositorios adicionales en la informacion disponible.
