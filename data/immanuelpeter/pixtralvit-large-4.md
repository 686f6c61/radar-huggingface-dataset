# immanuelpeter/PixtralViT-Large-4

## Resumen

PixtralViT-Large-4 es un paquete de pesos que extrae el codificador visual (vision tower) y el proyector multimodal del modelo Mistral Large 4, publicado por el usuario immanuelpeter bajo el identificador `immanuelpeter/PixtralViT-Large-4`. No es un modelo generativo completo: es un componente reutilizable de extraccion de caracteristicas visuales, etiquetado en Hugging Face con el pipeline `image-feature-extraction`. El modelo base del que procede es `mistralai/Mistral-Large-4-1T-A52B`, un modelo multimodal de Mistral AI.

El repositorio contiene 1.637.107.712 parametros en formato safetensors (3,4 GB), distribuidos en una torre de 30 bloques transformer con 2048 dimensiones ocultas y un proyector de 67 millones de parametros que transforma las caracteristicas visuales al espacio del modelo de lenguaje. La publicacion es relevante porque permite reutilizar el frontend visual de un modelo de escala frontier sin cargar el modelo completo, algo util para investigacion de representaciones visuales, destilacion o pipelines de retrieval multimodal.

La exportacion ha sido validada numericamente contra la implementacion de referencia de Mistral, con errores relativos maximos de 8,6e-6 en FP32, y documenta en detalle la conversion de nombres y la reordenacion de RoPE necesaria para que los pesos funcionen con la implementacion de Pixtral en Hugging Face.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer visual (Pixtral vision tower) + proyector multimodal Mistral3 |
| Parametros totales | 1.637.107.712 (torre 1,64B + proyector 67M) |
| Parametros activos | no disponible (no es MoE en este componente) |
| Longitud de contexto | no disponible (procesa imagenes; a 448 px genera 1.024 tokens de torre y 256 tokens proyectados) |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors, presumiblemente BF16/FP32) |
| Idiomas soportados | no disponible (componente visual, sin capacidades linguisticas propias) |
| Licencia | Mistral Ecosystem Open-Weight License (MIT modificada, con clausula de licencia comercial para Model as a Service) |
| Formato de pesos | safetensors (`model.safetensors`, `projector.safetensors`) |

## Arquitectura y entrenamiento

La torre visual consta de 30 bloques con 2048 dimensiones ocultas, 16 cabezas de atencion de 128 dimensiones cada una, FFN SwiGLU de 6144 y normalizacion RMSNorm con epsilon 1e-5. Usa parches de 14 px, RoPE 2D axial con theta 10000, sin token de clase y sin embeddings posicionales aprendidos. No aplica normalizacion final: la salida del ultimo bloque es el flujo residual en crudo. El proyector aplica `RMSNorm(2048)`, una fusion 2x2 de parches que eleva a 8192, una capa `Linear(8192, 2048)`, seguida de `Linear(2048, 6144)`, activacion GELU y `Linear(6144, 6144)`, todo sin sesgos.

Los pesos provienen del checkpoint `consolidated-00053-of-00054.safetensors` del modelo padre, que solo distribuye shards en formato nativo de Mistral. La conversion renombra 276 tensores visuales a la nomenclatura de Pixtral y Mistral3 en Hugging Face y reordena las filas de `wq` y `wk` de cada cabeza para adaptar el RoPE intercalado de Mistral al esquema de rotacion por mitades de HF Pixtral. No se castea ni redondea ningun valor. La validacion contra mistral-inference 1.6.0 confirma coincidencia bit a bit tras deshacer la reordenacion, con error relativo maximo de 8,6e-6 (448 px) y 2,4e-5 (1540 px) en FP32.

## Capacidades

- Extraccion de caracteristicas visuales a partir de imagenes, con salida en forma de tokens de 2048 dimensiones (torre) o 6144 dimensiones (proyectadas).
- Procesamiento de imagenes a multiples resoluciones; la validacion cubre 448 px y 1540 px.
- Fusion de parches 2x2 que reduce el numero de tokens visuales antes de proyectarlos al espacio del LLM.
- Integracion con `AutoModel.from_pretrained` de transformers para la torre y con el cargador `projector.py` para el proyector.
- Compatibilidad con endpoints de Hugging Face (tag `endpoints_compatible`).
- No incluye generacion de texto, tool calling, agentes ni capacidades linguisticas: es exclusivamente un frontend visual.
- No se documentan capacidades de video, audio ni thinking mode.

## Casos de uso

- Investigacion de representaciones visuales: cargar la torre con `AutoModel.from_pretrained` y extraer activaciones por capa para analisis de linealidad, probing o visualizacion de caracteristicas, aprovechando que la exportacion expone los 30 bloques.
- Destilacion de un codificador visual frontier: usar las caracteristicas de la torre como objetivo para entrenar un ViT mas pequeno en tareas de clasificacion o retrieval, sin necesidad de cargar el modelo Mistral Large 4 completo.
- Retrieval multimodal de imagenes: generar embeddings proyectados de 6144 dimensiones y construir indices vectoriales para busqueda semantica de imagenes en catalogos o archivos documentales.
- Pipelines de captioning o VQA parciales: combinar este frontend visual con un LLM de texto independiente que consuma los tokens proyectados, reutilizando el alineamiento visual-lenguaje original.
- Auditoria y reproducibilidad de modelos frontier: el `export_manifest.json` y el script de validacion permiten verificar bit a bit los pesos publicados frente al checkpoint original, util en entornos de compliance o investigacion reproducible.
- Benchmarking de codificadores visuales: comparar la torre Pixtral contra otros ViT (CLIP, SigLIP, DINOv2) en tareas de feature extraction con la misma interfaz de transformers.
- Prototipado de sistemas multimodales en entornos con VRAM limitada: al ocupar 3,4 GB en disco, la torre cabe en GPUs consumer y permite experimentar con el frontend visual sin los requisitos del modelo de 1T parametros.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo reporta metricas de validacion numerica de la conversion (error relativo FP32 de 8,6e-6 a 448 px y 2,4e-5 a 1540 px; en BF16, error maximo de 1,10 veces el error BF16 de la referencia, con un suelo del 17-18% relativo en la capa L30 debido a canales de gran magnitud).

## Requisitos de hardware

- VRAM estimada: aproximadamente 3,3 GB en BF16 para los 1,64B parametros de la torre mas el proyector; en FP32, unos 6,5 GB.
- GPU recomendadas: cualquier GPU con 8 GB o mas de VRAM para inferencia en BF16; RTX 3060/4060, RTX 4090, A100, H100 son suficientes. El cuello de botella es la resolucion de imagen, no el tamano del modelo.
- Cabe en GPU consumer: si, en practicamente cualquier GPU moderna con 8 GB o mas.
- Opciones de despliegue: transformers (`AutoModel.from_pretrained` para la torre y `projector.py` para el proyector); no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI para este componente.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / resolucion | Licencia | Disponibilidad |
|---|---|---|---|---|
| PixtralViT-Large-4 (este) | 1,64B torre + 67M proyector | 448 px y 1540 px validados | Mistral Ecosystem Open-Weight | Hugging Face, safetensors |
| SigLIP / CLIP ViT-L | ~300M-400M | resolucion fija tipica 224-384 px | MIT / Apache-2.0 | Amplia, multiples formatos |
| DINOv2 ViT-L | ~300M | 224-518 px | Apache-2.0 | Hugging Face, safetensors |
| Otros vision heads de immanuelpeter (p. ej. GLM-5.3-Flash-Vision) | 0,6B | no disponible | no disponible | Hugging Face |

La comparativa con codificadores visuales auto-contenidos es aproximada: este repositorio no es un modelo independiente sino un componente extraido de un modelo multimodal, por lo que su utilidad depende del proyector y del LLM con el que se combine. No se dispone de datos de rendimiento comparativo.

## Limitaciones y advertencias

- No es un modelo autonomo: carece de capacidades de generacion, razonamiento o comprension linguistica; requiere un LLM de texto para tareas multimodales completas.
- La licencia Mistral Ecosystem Open-Weight exige licencia comercial separada de Mistral para operar el modelo como servicio (Model as a Service); revisar el archivo LICENSE antes de cualquier uso comercial.
- La capa final de la torre presenta canales de gran magnitud (RMS de 35.000 a 57.000 frente a una mediana de 19, con valores maximos de 2,7e5 en una imagen ImageNet a 448 px); se recomienda estandarizar canales antes de ajustar readouts lineales o PCA sobre esa capa.
- El error en BF16 en la capa L30 es del 17-18% relativo incluso para la implementacion de referencia, por lo que la precision numerica en esa capa es limitada.
- No se documentan sesgos, idiomas soportados ni evaluaciones de robustez del codificador visual.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y fue creado el 2026-11-07; no hay evidencia de uso en produccion ni validacion por terceros.
- La reordenacion de RoPE es imprescindible: un simple renombrado de tensores produce errores del 95% al 125%, por lo que no debe modificarse el proceso de carga.
- No se especifican formatos cuantizados (GGUF, AWQ, GPTQ) ni soporte en frameworks de inferencia de alto rendimiento.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/immanuelpeter/PixtralViT-Large-4
- Modelo base: https://huggingface.co/mistralai/Mistral-Large-4-1T-A52B
- Script de validacion: https://github.com/immanuel-peter/vision-tower-bench/blob/main/scripts/validate_mistral_large4.py
- Script de exportacion: https://github.com/immanuel-peter/vision-tower-bench/blob/main/scripts/export_mistral_large4_vision.py
- Repositorio vision-tower-bench: https://github.com/immanuel-peter/vision-tower-bench
- Coleccion Vision Heads del autor: https://huggingface.co/collections/immanuelpeter/vision-heads
- Estadisticas del autor: https://openmodelstats.com/owners/immanuelpeter
