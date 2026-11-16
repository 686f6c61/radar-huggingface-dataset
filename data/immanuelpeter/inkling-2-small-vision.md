# immanuelpeter/Inkling-2-Small-Vision

## Resumen

Inkling-2-Small-Vision es un repositorio que empaqueta unicamente la torre de vision (vision tower) y el proyector (projector) del modelo multimodal Inkling 2 Small, desarrollado por Thinking Machines. No se trata de un modelo completo, sino de un componente extraido del modelo padre: la parte encargada de convertir imagenes en tokens de embedding que posteriormente consume el modelo de lenguaje. Lo publica el usuario immanuelpeter bajo licencia Apache-2.0.

El componente se inicializo a partir de PE-Lang L de Meta (Perception Encoder) y se entreno de forma conjunta con el modelo de lenguaje de Inkling 2 Small. La torre tiene 23 bloques transformer con anchura 1024 y 16 cabezas, procesa parches de 20x20 pixeles y trabaja a una resolucion nativa de 640 px (rejilla de 32x32 parches). El proyector transforma las representaciones visuales al espacio oculto del modelo de lenguaje, de 4608 dimensiones.

Su relevancia es acotada pero tecnica: sirve para reutilizar o auditar el encoder visual de Inkling 2 Small de forma aislada, para tareas de extraccion de caracteristicas de imagen, o como referencia de paridad frente a implementaciones como la de vLLM. El repositorio incluye comprobaciones de equivalencia tensor a tensor con el modelo padre, lo que lo hace util para validacion de portes. No es un modelo generativo ni un clasificador: es un extractor de features visuales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision transformer (ViT) con parches de 20x20, fusion 2x2 y proyector MLP |
| Parametros totales | 292.041.728 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (no es un modelo de texto; rejilla nativa de 32x32 parches = 1024 tokens de parche) |
| Tipos de cuantizacion | no disponible (pesos publicados en BF16) |
| Idiomas soportados | no disponible (componente visual, sin capacidades linguisticas propias) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (BF16) |

## Arquitectura y entrenamiento

La torre sigue el diseno de PE-Lang L de Meta: 23 bloques transformer con anchura 1024, 16 cabezas de atencion, ratio MLP de 4, activacion GELU exacta, LayerScale, token de clase y `ln_pre`, sin `ln_post` ni cabeza de pooling. Los parches de 20x20 pixeles se aplanan en orden (fila, columna, canal) mediante una capa lineal sin sesgo. Las posiciones combinan una rejilla aprendida de 32x32 mas un embedding de token de clase, junto con RoPE 2D (theta 10000, pares intercalados, primero x y luego y, parches desplazados en uno y token de clase en la posicion 0).

Tras la torre, una fusion 2x2 concatena tokens de parche vecinos (superior izquierda, superior derecha, inferior izquierda, inferior derecha), excluyendo el token de clase, lo que produce representaciones de anchura 4096. El proyector es un MLP de dos capas sin sesgos: `Linear(4096, 4096)`, GELU exacta y `Linear(4096, 4608)`, donde 4608 es la dimension oculta del modelo de lenguaje. A la resolucion nativa de 640 px, la torre genera 1024 tokens de parche de anchura 1024, la fusion los reduce a 256 tokens de anchura 4096 y el proyector los lleva a 256 tokens de anchura 4608. La normalizacion de pixeles replica la del padre: media y desviacion tipica de CLIP, redondeo a BF16, mapeo a [-1, 1] y nuevo redondeo a BF16.

No hay informacion disponible sobre el volumen de datos de entrenamiento, la composicion del dataset ni el uso de RLHF o DPO para este componente. Los pesos publicados son los valores BF16 del modelo padre, sin modificacion.

## Capacidades

- Extraccion de caracteristicas de imagen (image feature extraction), tarea declarada en el pipeline del repositorio.
- Generacion de tokens visuales de anchura 4608 compatibles con el modelo de lenguaje de Inkling 2 Small.
- Procesamiento de imagenes a resolucion nativa de 640 px con rejilla de 32x32 parches.
- Fusion de parches 2x2 que reduce la secuencia visual de 1024 a 256 tokens.
- No incluye capacidades de generacion de texto, razonamiento, codigo ni matematicas por si mismo.
- No soporta tool calling ni function calling por si mismo.
- No soporta agentes ni razonamiento multi-paso por si mismo.
- Capacidades multilingues: no aplica (componente visual).
- Capacidad especial: verificacion de paridad tensor a tensor con el modelo padre, util para validacion de implementaciones.

## Casos de uso

- Validacion de portes de inferencia: el repositorio permite comparar cada tensor con el modelo padre mediante `torch.equal`, lo que sirve para verificar que una implementacion nueva (por ejemplo, en vLLM) reproduce exactamente el encoder visual de Inkling 2 Small.
- Extraccion de embeddings visuales para busqueda semantica: usar la torre y el proyector para generar 256 tokens de anchura 4608 por imagen y alimentar un indice vectorial de imagenes.
- Investigacion sobre Perception Encoder: al derivar de PE-Lang L y estar afinado con un modelo de lenguaje, permite estudiar como cambian las representaciones visuales tras el entrenamiento conjunto con texto.
- Componente de un pipeline multimodal propio: combinado con el modelo de lenguaje de Inkling 2 Small, permite reconstruir la ruta de vision para tareas de descripcion de imagenes o VQA, siempre que se disponga de los pesos del modelo padre.
- Auditoria de sesgos visuales: al aislar el encoder, se pueden analizar las representaciones que produce sobre distintos grupos demograficos o tipos de imagen sin la interferencia del decodificador de texto.
- Benchmarking de encoders visuales: comparar la torre de Inkling 2 Small frente a PE-Lang L original u otros ViT en tareas de clasificacion lineal o recuperacion de imagenes, usando las features de 4608 dimensiones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,6 GB en BF16 para los 292 millones de parametros (sin contar activaciones ni buffers intermedios); en FP32, alrededor de 1,2 GB.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM para inferencia en BF16; una RTX 3060, RTX 4060 o superior es suficiente.
- Cabe en GPU de consumo: si, practicamente en cualquier GPU consumer moderna (GTX 1660, RTX 20xx en adelante) y en muchas integradas con suficiente memoria compartida.
- Opciones de despliegue: la libreria declarada es `timm`; el repositorio incluye `inkling2_vision.py` para cargar la torre sobre `vit_pe_lang_large_patch14_448` con patch size 20. No hay soporte declarado para vLLM, llama.cpp, Ollama ni TGI en este repositorio, aunque la implementacion de referencia de vLLM para Inkling 2 se cita como fuente de validacion.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / resolucion | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Inkling-2-Small-Vision | 292 M | 640 px (32x32 parches) | Image feature extraction | Apache-2.0 | Hugging Face (repo de terceros) |
| PE-Lang L (Meta) | no disponible en la informacion | 448 px (patch 14) | Perception encoder | no disponible en la informacion | Hugging Face (facebook/vit_pe_lang_large_patch14_448_timm) |
| Inkling 2 Small (Thinking Machines) | no disponible en la informacion | no disponible | Modelo multimodal completo | Apache-2.0 (segun model card del padre) | Hugging Face (thinkingmachines/Inkling-2-Small) |

## Limitaciones y advertencias

- No es un modelo autonomo: carece de decodificador de texto y no puede generar respuestas ni razonar por si mismo.
- Solo procesa imagenes a resolucion nativa de 640 px; no se documenta soporte para otras resoluciones ni para imagenes de entrada dinamicas.
- Al ser un repositorio de terceros (immanuelpeter), no cuenta con el respaldo oficial de Thinking Machines; conviene verificar la integridad de los pesos frente al modelo padre.
- Riesgo de sesgos: hereda los sesgos del dataset de entrenamiento del modelo padre, no documentados en esta ficha.
- Riesgo de alucinacion: no aplica directamente al ser un extractor de features, pero los embeddings pueden reflejar asociaciones espurias aprendidas.
- Restricciones de licencia: Apache-2.0 permite uso comercial, pero se recomienda revisar la licencia del modelo padre y de PE-Lang L para confirmar compatibilidad.
- Sin datos publicados de benchmarks, no es posible comparar su calidad frente a alternativas sin evaluacion propia.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica ausencia de validacion por parte de la comunidad.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/immanuelpeter/Inkling-2-Small-Vision
- Modelo padre: https://huggingface.co/thinkingmachines/Inkling-2-Small
- Modelo base de la torre (PE-Lang L): https://huggingface.co/facebook/vit_pe_lang_large_patch14_448_timm
- Script de paridad: https://github.com/immanuel-peter/vision-tower-bench/blob/main/vtb/parity/pe.py
- Script de exportacion: https://github.com/immanuel-peter/vision-tower-bench/blob/main/vtb/adapters/pe.py
- Pull request de vLLM con la implementacion de referencia: https://github.com/vllm-project/vllm/pull/67325
