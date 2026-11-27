# immanuelpeter/Qwen3.8-Flash-Next-Vision

## Resumen

Qwen3.8-Flash-Next Vision es un paquete de pesos que extrae el componente visual (tower y merger aprendido) del modelo multimodal Qwen/Qwen3.8-Flash-Next, publicado por el usuario immanuelpeter en Hugging Face. No se trata de un modelo generativo completo, sino de un extractor de caracteristicas de imagen: el repositorio contiene unicamente la torre de vision y el merger, sin el modelo de lenguaje asociado. Su pipeline declarado es `image-feature-extraction` y su uso previsto es obtener representaciones vectoriales de imagenes, no generar texto.

El modelo resuelve un problema concreto de ingenieria: aislar el encoder visual de un modelo multimodal grande para poder reutilizarlo en tareas de vision por computador (clasificacion, recuperacion, embeddings) sin cargar el modelo completo. Con 448.931.056 parametros totales y un repositorio de 0,9 GB, es un componente ligero en comparacion con el modelo base del que procede.

Su relevancia actual es practica para desarrolladores que quieran integrar el encoder visual de Qwen3.8-Flash-Next en pipelines propios con Transformers, manteniendo paridad bit a bit con el checkpoint original, segun declara el autor. La licencia es Qwen Community License 1.0, la misma del modelo fuente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de vision (tower) con merger aprendido; variante `Qwen3_5VisionModel` |
| Parametros totales | 448.931.056 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en BF16 safetensors) |
| Idiomas soportados | no disponible |
| Licencia | Qwen Community License 1.0 |
| Formato de pesos | safetensors (model.safetensors) |

## Arquitectura y entrenamiento

La arquitectura es una torre de vision de 27 capas con 1152 dimensiones ocultas, 16 cabezas de atencion, 4304 dimensiones intermedias y patch size de 16. Aplica compresion de tokens mediante agrupacion espacial 2x2 y un merger aprendido compuesto por `LayerNorm(1152)`, `Linear(4608, 4608)`, activacion GELU y `Linear(4608, 2560)`. El merger esta implementado dentro de `Qwen3_5VisionModel`, por lo que el repositorio no incluye un fichero de proyector separado.

En cuanto al entrenamiento, esta ficha no dispone de datos sobre el dataset, el numero de tokens ni el proceso de alineacion del modelo base. Lo que si documenta el autor es el proceso de exportacion: el script de reproduccion lee los tensores `model.visual.*` del shard 1 de Qwen/Qwen3.8-Flash-Next, elimina el prefijo y escribe los tensores BF16 originales con la revision del padre fijada. La validacion de paridad compara los 333 tensores con el checkpoint padre mediante `torch.equal`, y las salidas de la torre y del merger coinciden bit a bit en CPU y en BF16 sobre una NVIDIA RTX PRO 6000 Blackwell.

Las salidas del modelo son dos: `last_hidden_state` con los tokens crudos de la torre y `pooler_output` con las caracteristicas fusionadas a la anchura del modelo de lenguaje. A 448 pixeles, el ejemplo documentado reporta torre `(1, 784, 1152)`, fusionado `(1, 196, 4608)` y proyectado `(1, 196, 2560)`.

## Capacidades

- Extraccion de caracteristicas de imagen: genera embeddings a partir de imagenes mediante la torre de vision y el merger.
- Salida dual: tokens crudos de la torre (`last_hidden_state`) y caracteristicas fusionadas (`pooler_output`).
- Compresion espacial: reduce la resolucion de tokens mediante agrupacion 2x2, pasando de 784 a 196 tokens a 448 pixeles.
- Integracion con Transformers: carga mediante la libreria `transformers` con la configuracion `Qwen3_5VisionConfig`.
- Preprocesado incluido: el repositorio incluye `preprocessor_config.json` con la configuracion de preprocesado de imagen de Qwen.
- Compatibilidad con endpoints: el tag `endpoints_compatible` indica que puede desplegarse en la infraestructura de endpoints de Hugging Face.
- No incluye generacion de texto, tool calling, agentes, capacidades multilingues ni modo thinking: el modelo de lenguaje del base no forma parte de este repositorio.

## Casos de uso

- Recuperacion de imagenes por similitud: usar los embeddings de `pooler_output` para indexar un catalogo de imagenes y buscar visualmente similares mediante distancia coseno, sin necesidad de cargar el modelo multimodal completo.
- Clasificacion de imagenes con cabezas ligeras: congelar la torre y entrenar un clasificador lineal o MLP sobre las caracteristicas fusionadas de 2560 dimensiones para tareas de etiquetado.
- Deteccion de duplicados y near-duplicates: comparar embeddings de imagenes en pipelines de moderacion o gestion de activos digitales para identificar copias y variaciones.
- Precomputo de features para RAG multimodal: extraer embeddings de imagenes de forma offline y almacenarlos en una base vectorial para recuperacion aumentada en sistemas de documentacion tecnica con figuras.
- Control de calidad visual en produccion: comparar embeddings de imagenes de referencia con imagenes capturadas en linea para detectar desviaciones en fabricacion o inspeccion.
- Investigacion en vision: analisis de las representaciones internas de la torre (784 tokens de 1152 dimensiones) para estudiar atencion espacial y compresion de informacion.
- Prototipado de modelos multimodales: reutilizar el encoder visual como componente en arquitecturas propias que necesiten un extractor de features compatible con el ecosistema Qwen.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor unicamente documenta una prueba de paridad: los 333 tensores coinciden con el checkpoint padre mediante `torch.equal`, y las salidas de torre y merger coinciden bit a bit en CPU y en BF16 sobre NVIDIA RTX PRO 6000 Blackwell.

## Requisitos de hardware

- VRAM estimada para inferencia: al tratarse de 448,9 millones de parametros en BF16, los pesos ocupan aproximadamente 0,9 GB; con activaciones y overhead de framework, se estima un uso de 2 a 4 GB de VRAM para lotes pequenos.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM; el autor valido en NVIDIA RTX PRO 6000 Blackwell, y el modelo cabe holgadamente en A100, H100, L40S y RTX 4090.
- Cabe en GPU de consumo: si, en tarjetas como RTX 3060 (12 GB), RTX 4060 Ti, RTX 4070 y superiores; tambien puede ejecutarse en CPU, como demuestra la validacion de paridad del autor.
- Opciones de despliegue: Transformers (libreria declarada), endpoints de Hugging Face (tag `endpoints_compatible`); no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI para este repositorio.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Tipo | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.8-Flash-Next Vision (este) | 448,9 M | Extractor de features de vision | no disponible | Qwen Community License 1.0 | Hugging Face |
| Qwen/Qwen3.8-Flash-Next (base) | no disponible | Modelo multimodal completo | no disponible | Qwen Community License 1.0 | Hugging Face |
| Otros extractores de vision de la familia Qwen | no disponible | Tower + merger | no disponible | no disponible | no disponible |

La comparativa directa con alternativas de la misma categoria no esta disponible en la informacion proporcionada. La diferencia principal frente al modelo base es que este repositorio contiene unicamente el componente visual (333 tensores, 0,9 GB), mientras que el base incluye el modelo de lenguaje y el resto de componentes multimodales.

## Limitaciones y advertencias

- No es un modelo generativo: no produce texto, codigo ni respuestas; solo extrae caracteristicas de imagen.
- Sin datos de sesgos: no se dispone de informacion sobre sesgos del encoder visual ni del dataset de entrenamiento del modelo base.
- Riesgo de alucinacion no aplicable en el sentido generativo, pero los embeddings pueden no representar adecuadamente dominios alejados de la distribucion de entrenamiento.
- Idiomas no disponibles: al ser un encoder visual, la cobertura linguistica depende del modelo de lenguaje del base, que no se incluye.
- Restricciones de licencia: Qwen Community License 1.0 puede imponer condiciones para uso comercial; es necesario revisar el fichero LICENSE antes de desplegar en produccion.
- Dependencia de la version de Transformers: requiere soporte para `Qwen3_5VisionConfig` y el pipeline `image-feature-extraction`; versiones antiguas de la libreria pueden no cargar el modelo.
- Resolucion de entrada limitada en el ejemplo documentado (448 pixeles); el comportamiento con otras resoluciones no esta documentado.
- Mantenimiento por un tercero: el repositorio lo publica immanuelpeter, no el equipo de Qwen, por lo que la actualizacion y el soporte dependen del autor.
- Sin garantias de produccion: no se documentan latencias, throughput ni pruebas de carga.

## Enlaces

- Hugging Face: https://huggingface.co/immanuelpeter/Qwen3.8-Flash-Next-Vision
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Script de paridad: https://github.com/immanuel-peter/vision-tower-bench/blob/main/vtb/parity/qwen3_5.py
- Script de exportacion: https://github.com/immanuel-peter/vision-tower-bench/blob/main/vtb/adapters/qwen3_5.py
- Ejemplo de inferencia: https://huggingface.co/immanuelpeter/Qwen3.8-Flash-Next-Vision/blob/main/examples/inference.py
- Licencia: https://huggingface.co/immanuelpeter/Qwen3.8-Flash-Next-Vision/blob/main/LICENSE
