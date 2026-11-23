# immanuelpeter/Inkling-2-Mini-Vision

## Resumen

Inkling-2-Mini-Vision es un paquete de pesos que extrae el *vision tower* y el *projector* del modelo multimodal Inkling 2 Mini, desarrollado por Thinking Machines, y los publica como un codificador de características de imagen independiente. El repositorio lo mantiene el usuario immanuelpeter y esta pensado para su uso con la libreria `timm`, bajo la etiqueta de pipeline `image-feature-extraction`. No es un modelo de lenguaje: es exclusivamente la rama visual, sin cabecera de generacion ni decodificador.

La torre se inicializo a partir de PE-Lang L de Meta (`vit_pe_lang_large_patch14_448_timm`) y se entreno de forma conjunta con el modelo de lenguaje padre. Comparte arquitectura e inicializacion con Inkling-2-Small-Vision, pero los pesos difieren porque cada torre se coentreno con un LLM distinto. El resultado es un ViT de 23 bloques, 1024 dimensiones ocultas y 16 cabezas, con un total de 292.041.728 parametros y un peso en repositorio de 0,6 GB.

Su relevancia practica es doble: por un lado permite reutilizar el codificador visual de Inkling 2 Mini de forma aislada para tareas de percepcion (extraccion de embeddings, retrieval multimodal, pipelines propios); por otro, sirve como referencia reproducible para verificar la implementacion de la vision en vLLM, ya que el autor publica un test de paridad tensor a tensor contra el modelo padre.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision transformer (ViT) tipo Perception Encoder, 23 bloques, 1024 ocultas, 16 cabezas, patch size 20, RoPE 2D, GELU exacta, LayerScale |
| Parametros totales | 292.041.728 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplicable (codificador de imagen); resolucion nativa 640 px, rejilla de 32 x 32 parches |
| Tipos de cuantizacion | no disponible (pesos publicados en BF16) |
| Idiomas soportados | no disponible (modelo de vision, sin capacidades linguisticas) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (`model.safetensors` con 420 tensores, `projector.safetensors` con 2 tensores) |

## Arquitectura y entrenamiento

La torre sigue la arquitectura Perception Encoder de Meta: 23 bloques transformer con 1024 dimensiones ocultas, 16 cabezas de atencion, parches de 20 px y RoPE bidimensional, activacion GELU exacta y LayerScale. A la salida de la torre se aplica una compresion espacial 2x2 sin parametros aprendidos que agrupa parches de 1024 dimensiones en tokens de 4096. El projector consta de dos capas lineales sin sesgo, `Linear(4096, 4096)` con GELU exacta seguida de `Linear(4096, 2304)`, que proyecta a la anchura oculta del modelo de lenguaje padre.

En la resolucion nativa de 640 px (rejilla de 32 x 32 parches) la torre produce 1024 tokens de 1024 dimensiones, el merge los reduce a 256 tokens de 4096 dimensiones y el projector los lleva a 256 tokens de 2304 dimensiones. La torre se inicializo desde PE-Lang L y se entreno de forma conjunta con el LLM de Inkling 2 Mini; el autor no detalla el volumen de tokens, la composicion del dataset ni si hubo etapas de alineacion adicionales, por lo que esos datos no estan disponibles. La validacion incluye un test de paridad que compara cada tensor publicado con el padre fijado mediante `torch.equal` y comprueba que ninguno coincide con PE-Lang L ni con Inkling 2 Small.

## Capacidades

- Extraccion de caracteristicas de imagen: genera embeddings visuales a partir de imagenes a 640 px de resolucion nativa.
- Codificador de percepcion reutilizable: puede integrarse como torre visual en pipelines multimodales propios junto a un LLM independiente.
- Salida compatible con la anchura oculta de 2304 del modelo padre, lo que facilita sustituir la torre original en arquitecturas Inkling 2 Mini.
- Compresion de tokens 2x2 integrada, que reduce el numero de tokens enviados al LLM de 1024 a 256.
- Verificacion de paridad reproducible contra la implementacion de referencia en vLLM.
- No dispone de generacion de texto, razonamiento, codigo, tool calling, agentes ni capacidades multilingues: es exclusivamente un extractor de caracteristicas.

## Casos de uso

- Busqueda y retrieval visual: usar los embeddings de 2304 dimensiones por token para indexar imagenes en un motor vectorial y recuperar candidatas por similitud, aprovechando la resolucion de 640 px y la rejilla de 32 x 32.
- Sustitucion de la torre visual en despliegues de Inkling 2 Mini: al mantener la anchura de salida de 2304, puede reemplazar a la torre original en un pipeline multimodal que ya consuma tokens de 2304 dimensiones.
- Clasificacion y etiquetado de imagenes por transferencia: congelar la torre y entrenar una cabeza lineal ligera sobre los embeddings de 4096 dimensiones previos al projector para tareas de clasificacion especificas.
- Auditoria de implementaciones: emplear el test de paridad incluido para validar que una implementacion propia de la vision de Inkling 2 Mini reproduce los tensores y las activaciones de referencia.
- Investigacion en percepcion visual: comparar el comportamiento de esta torre con PE-Lang L y con Inkling 2 Small, al haber sido coentrenada con LLMs distintos partiendo de la misma inicializacion.
- Preprocesado en pipelines de datos: generar caracteristicas visuales en lote para datasets de imagenes antes de un entrenamiento multimodal, con un coste de 292 millones de parametros por imagen.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: en BF16, los 292 millones de parametros ocupan aproximadamente 0,58 GB; con activaciones y lotes pequenos, entre 1 y 2 GB es suficiente.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM; una RTX 3060, RTX 4060 o superior es suficiente. Para procesamiento por lotes a gran escala, A100 o H100 aportan mayor throughput.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU consumer moderna, incluida una GTX 1650 de 4 GB con lotes pequenos.
- Opciones de despliegue: la libreria `timm` es la via oficial segun el autor; tambien puede servirse mediante TorchServe o un contenedor FastAPI propio. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI para este paquete aislado.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Resolucion / contexto | Salida | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Inkling-2-Mini-Vision | 292 M | 640 px, rejilla 32 x 32 | 256 tokens de 2304 | Apache-2.0 | Hugging Face |
| PE-Lang L (facebook) | no disponible | 448 px, patch 14 | embeddings de vision | no disponible | Hugging Face |
| Inkling-2-Small-Vision | no disponible | misma arquitectura que Mini | no disponible | no disponible | Hugging Face |

La comparacion con PE-Lang L es directa porque es su inicializacion, pero el autor no publica cifras de rendimiento que permitan contrastar calidad. Frente a Inkling-2-Small-Vision comparte arquitectura e inicializacion, aunque los pesos difieren por el coentrenamiento con LLMs distintos. No se dispone de datos de benchmarks para establecer una comparacion cuantitativa.

## Limitaciones y advertencias

- No es un modelo generativo: no produce texto ni responde a instrucciones; cualquier uso como LLM fallara.
- Sin datos de sesgo, alucinacion o robustez publicados por el autor; al ser un codificador visual, los sesgos potenciales son los del dataset de imagenes de entrenamiento, que no se documenta.
- Resolucion nativa fija de 640 px; no se documenta comportamiento con otras resoluciones o relaciones de aspecto.
- Dependencia de la implementacion concreta de `timm` (`vit_pe_lang_large_patch14_448` adaptado a patch size 20); cambios en versiones de la libreria pueden romper la carga.
- Los pesos son una exportacion de un modelo padre; si Thinking Machines actualiza Inkling 2 Mini, este paquete no se actualiza automaticamente.
- Licencia Apache-2.0 declarada por el autor, heredada de la model card del modelo fuente; conviene verificar que el modelo padre mantiene la misma licencia para uso comercial.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: no hay evidencia de uso en produccion ni de mantenimiento a largo plazo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/immanuelpeter/Inkling-2-Mini-Vision
- Modelo padre: https://huggingface.co/thinkingmachines/Inkling-2-Mini
- Modelo hermano: https://huggingface.co/immanuelpeter/Inkling-2-Small-Vision
- Inicializacion visual (PE-Lang L): https://huggingface.co/facebook/vit_pe_lang_large_patch14_448_timm
- Test de paridad: https://github.com/immanuel-peter/vision-tower-bench/blob/main/vtb/parity/pe.py
- Script de exportacion: https://github.com/immanuel-peter/vision-tower-bench/blob/main/vtb/adapters/pe.py
- PR de referencia en vLLM: https://github.com/vllm-project/vllm/pull/67325
