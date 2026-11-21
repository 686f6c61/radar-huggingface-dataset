# HuishanJi/YANchor-4B

## Resumen

EdgeRock-4B (publicado en Hugging Face como `HuishanJi/YANchor-4B`) es un modelo de lenguaje y vision de 4.578 millones de parametros desarrollado por Rock Matrix. Su propuesta central es el razonamiento fuerte con memoria constante: en lugar de un KV cache que crece linealmente con el contexto, emplea un estado recurrente que resume el historial, atencion local para la informacion reciente y unos anclajes de memoria denominados Rock Memory Anchors (RMA) que preservan detalles lejanos seleccionados. El resultado es un coste de memoria de atencion fijo por secuencia, lo que abarata el despliegue de generaciones largas y el servicio concurrente.

El modelo procesa texto e imagenes y genera texto, orientado a razonamiento, codigo y flujos de agentes. Segun la model card, alcanza un 82,9 % de pass@1 medio en AIME 2024-2026 y utiliza 72 MiB de KV de atencion por secuencia, con un 99,1 % menos de KV BF16 que Qwen3.5-4B a 256K de contexto. Es relevante ahora porque ataca el cuello de botella de memoria en inferencia de contexto largo sin renunciar a capacidades multimodales ni a razonamiento de tipo cadena de pensamiento.

La licencia es propietaria (EdgeRock Model License 1.0), etiquetada como "commercial-use" pero con terminos propios que conviene revisar antes de produccion. Los pesos se distribuyen en safetensors y requieren codigo personalizado (`custom-code`), con un wheel especifico de Transformers 5.7.0.dev0 incluido en el repositorio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Hibrida: estado recurrente (GDN) + atencion local + Rock Memory Anchors (RMA) |
| Parametros totales | 4.578.061.568 |
| Parametros activos | no disponible (no es MoE segun la informacion disponible) |
| Longitud de contexto | hasta 256K (se reportan resultados a 128K y 256K) |
| Tipos de cuantizacion | no disponible (la model card describe ejecucion en BF16/FP16/FP32) |
| Idiomas soportados | en, zh |
| Licencia | edgerock-model-license-1.0 (other, etiquetada commercial-use) |
| Formato de pesos | safetensors (custom-code) |

## Arquitectura y entrenamiento

EdgeRock-4B combina tres mecanismos. Un estado recurrente de tipo GDN (gated delta network, segun las referencias a "FP32 GDN updates" en la model card) resume el contexto historico en capacidad fija. Una atencion local procesa la informacion reciente con ventana acotada. Y los Rock Memory Anchors (RMA) retienen detalles distantes seleccionados, de modo que el historial persistente no crece con la peticion. El runtime almacena el estado GDN en FP32 con batch size 1 y en FP16 para batches mayores, mientras que el KV de atencion se mantiene en BF16.

La model card no detalla el volumen de tokens de entrenamiento, la composicion del dataset ni si hubo RLHF o DPO. Se menciona un articulo en arXiv (2610.10118) y un whitepaper de Rock Matrix que describen la familia y la hoja de ruta, pero los datos concretos de preentrenamiento y alineacion no estan disponibles en la informacion proporcionada. La innovacion tecnica destacable es el almacenamiento de KV de capacidad fija: 72 MiB de KV de atencion por secuencia y 97,76 MiB de historial persistente total en el runtime por batches, incluyendo matrices recurrentes en FP16 y estado auxiliar.

## Capacidades

- Generacion de texto con razonamiento explicito (cadena de pensamiento) orientado a matematicas, segun los resultados en AIME.
- Generacion de codigo y soporte a flujos de agentes, segun la descripcion del autor.
- Comprension de imagenes y texto (image-text-to-text): responde preguntas sobre imagenes y razona sobre ellas.
- Contexto largo de hasta 256K tokens con memoria de atencion constante.
- Multilinguee limitado a ingles y chino.
- No se documenta soporte explicito de tool calling o function calling en la informacion disponible.
- No se documenta modo thinking separado, audio ni otras modalidades mas alla de texto e imagen.

## Casos de uso

- Razonamiento matematico por lotes: el modelo resuelve problemas de competicion (AIME) con pass@1 alto; util para generacion de soluciones verificables en pipelines de evaluacion o tutoria automatica.
- Agentes de larga duracion: al mantener memoria constante, se puede sostener una sesion de agente con muchas iteraciones sin que el KV cache agote la GPU, lo que abarata el servicio concurrente.
- Analisis de documentos extensos con imagenes: combinando contexto de 256K y entrada visual, se pueden procesar informes con graficos y tablas y extraer conclusiones en una sola pasada.
- Asistente de codigo en CI/CD: con generacion de codigo y contexto largo, puede revisar diffs grandes o repositorios completos dentro de la ventana disponible.
- Servicio de atencion al cliente multirramo: conversaciones multi-turno largas en ingles o chino con coste de memoria estable por sesion, lo que permite mas usuarios simultaneos por GPU.
- Procesamiento de imagenes tecnicas: descripcion y razonamiento sobre capturas, diagramas o figuras en flujos de documentacion automatizada.
- Inferencia en hardware limitado: con 4.578 millones de parametros y memoria de estado fija, es candidato para despliegues en una sola GPU de gama alta o media-alta con contexto largo.

## Benchmarks y rendimiento

Resultados reportados en la model card (no verificados de forma independiente):

| Benchmark | EdgeRock-4B | Referencia comparada |
|---|---|---|
| AIME 2024-2026 (pass@1 medio) | 82,9 % | RWKV-7 G1j 14B: 18,8 % |
| Benchmark visual (6 tareas, exactitud media) | 84,9 % | Qwen3.5-4B: retiene el 95,3 % de su exactitud media |
| KV de atencion BF16 a 256K | 72 MiB por secuencia | Qwen3.5-4B: 99,1 % mayor |
| Decodificacion en Hopper 80GB (batch 1, 128K in / 128K out) | 233,7 tokens/s | no disponible |
| Throughput de salida a 32K in / 32K out | 6,42x el de Qwen3.5-4B | Qwen3.5-4B (mejor batch medido) |

No se han publicado en la informacion disponible resultados de MMLU, HumanEval o GSM8K.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; el modelo pesa 18,6 GB en el repositorio y la model card reporta ejecucion en BF16 con GPU Hopper de 80 GB para los resultados de throughput.
- GPU recomendadas: Hopper (H100/H200) para la ruta CUDA optimizada; el backend portable soporta CPU y CUDA generica.
- Cabe en GPU de consumo: probable en cuantizacion reducida por el tamano de pesos, pero no se documenta soporte de cuantizacion ni VRAM minima; no confirmado.
- Opciones de despliegue: backend propio del repositorio (`run.py`), Transformers 5.7.0.dev0 con wheel incluido; no se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: 233,7 tokens/s de decodificacion en una Hopper 80GB con batch 1, 128K de entrada y 128K de salida; 6,42x el throughput de salida de Qwen3.5-4B a 32K/32K.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Memoria de atencion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| EdgeRock-4B | 4.578 M | 256K | fija (72 MiB/seq) | EdgeRock Model License 1.0 | Hugging Face, ModelScope, GitHub |
| Qwen3.5-4B | ~4B | hasta 256K (segun la comparativa) | crece con el contexto | no disponible en la informacion | no disponible en la informacion |
| RWKV-7 G1j | 14B (clase) | no disponible | estado acotado | no disponible | no disponible |

La comparativa se limita a los modelos citados por el autor; no se dispone de datos de rendimiento independientes para Qwen3.5-4B ni RWKV-7 G1j en esta ficha.

## Limitaciones y advertencias

- Licencia propietaria: aunque se etiqueta como commercial-use, los terminos de la EdgeRock Model License 1.0 deben revisarse antes de uso comercial; no es una licencia open source estandar.
- Requiere codigo personalizado y un wheel especifico de Transformers 5.7.0.dev0; la integracion con ecosistemas estandar puede ser fragil.
- Idiomas limitados a ingles y chino; el rendimiento en castellano no esta documentado.
- Riesgo de alucinacion no cuantificado; los benchmarks de razonamiento no garantizan fiabilidad factual.
- Resultados de benchmarks autoinformados por el autor y no verificados de forma independiente.
- No se documentan sesgos conocidos, datos de entrenamiento ni procesos de alineacion, lo que dificulta evaluar riesgos.
- Soporte de tool calling y agentes no confirmado explicitamente en la informacion disponible.
- No se documentan opciones de cuantizacion ni despliegue en frameworks de servido populares (vLLM, TGI, llama.cpp).

## Enlaces

- Hugging Face: https://huggingface.co/HuishanJi/YANchor-4B
- Repositorio del autor en Hugging Face: https://huggingface.co/rockmatrix-ai/EdgeRock
- GitHub: https://github.com/rockmatrix-ai/EdgeRock
- ModelScope: https://modelscope.cn/models/rockmatrix/EdgeRock
- arXiv: https://arxiv.org/abs/2610.10118
- Whitepaper: https://rockmatrix.ai/documents/rock-matrix-whitepaper-en.pdf
- Web oficial: https://rockmatrix.ai
- Investigacion: https://rockmatrix.ai/research/#whitepaper
