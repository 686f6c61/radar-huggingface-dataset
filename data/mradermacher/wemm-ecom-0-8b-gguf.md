# mradermacher/WeMM-Ecom-0.8B-GGUF

## Resumen

WeMM-Ecom-0.8B es un modelo multimodal conversacional especializado en comercio electronico, desarrollado originalmente por Tencent y distribuido en formato GGUF por mradermacher. El modelo base combina un backbone de la familia Qwen3.5 con capacidades de vision, orientado a tareas de atencion al cliente y asistencia conversacional en entornos de e-commerce. Con 752.393.024 parametros totales (aproximadamente 0,75 mil millones), se posiciona como un modelo compacto pensado para despliegue eficiente.

Esta publicacion concreta es una cuantizacion estatica del modelo original `tencent/WeMM-Ecom-0.8B`, que facilita su ejecucion en hardware de consumo mediante llama.cpp y herramientas compatibles con GGUF. El repositorio incluye tanto los pesos cuantizados del modelo de lenguaje como los ficheros `mmproj` necesarios para el procesamiento multimodal (vision).

Su relevancia actual radica en la demanda de asistentes especializados de bajo coste para catalogos de producto, descripcion de imagenes de articulos y dialogo multi-turno en chino e ingles, con una licencia Apache 2.0 que permite uso comercial sin restricciones significativas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (base Qwen3.5 segun tags del autor) |
| Parametros totales | 752.393.024 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, Q4_K_S, IQ4_XS, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16; mmproj en Q8_0 y f16 |
| Idiomas soportados | chino (zh), ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (safetensors en el modelo base) |

## Arquitectura y entrenamiento

El modelo se basa en una arquitectura transformer multimodal de la familia Qwen3.5, segun las etiquetas declaradas por el autor de la cuantizacion. Incorpora un componente de proyeccion multimodal (`mmproj`) que permite procesar imagenes junto con texto, lo cual es coherente con su orientacion a e-commerce (descripcion de productos, analisis de imagenes de articulos, atencion al cliente con soporte visual). El modelo cuenta con aproximadamente 752 millones de parametros, un tamano que lo situa en la categoria de modelos pequenos optimizados para inferencia en el borde o en hardware modesto.

No se dispone de informacion detallada sobre el volumen de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron tecnicas de RLHF o DPO en la informacion proporcionada. Tampoco se documentan innovaciones tecnicas especificas como decodificacion especulativa o atencion lineal. La cuantizacion ha sido realizada por mradermacher con `quantize_version: 2` y `output_tensor_quantised: 1`, generando variantes estaticas (no imatrix) en el repositorio principal; las variantes ponderadas estan disponibles en un repositorio separado (`-i1-GGUF`).

## Capacidades

- Generacion de texto conversacional en chino e ingles.
- Procesamiento multimodal: analisis de imagenes (soporte via ficheros `mmproj`), orientado a productos y descripciones visuales.
- Dialogo multi-turno para atencion al cliente en contextos de comercio electronico.
- Comprension de consultas sobre productos y asistencia en tareas de e-commerce.
- No se documenta soporte explicito de tool calling o function calling en la informacion disponible.
- No se documenta soporte explicito de agentes o razonamiento multi-paso en la informacion disponible.
- No se documentan modos especiales (thinking mode, audio) en la informacion disponible.

## Casos de uso

- Atencion al cliente automatizada en tiendas online: el modelo puede gestionar conversaciones multi-turno sobre pedidos, devoluciones y caracteristicas de productos, aprovechando su especializacion en e-commerce y su capacidad de mantener contexto conversacional.
- Descripcion automatica de imagenes de producto: gracias al componente multimodal (`mmproj`), puede generar descripciones textuales de articulos a partir de fotografias, util para catalogos y fichas de producto.
- Asistente de recomendacion de productos: puede interpretar consultas de usuarios en chino o ingles y responder con informacion relevante del catalogo, integrandose en chatbots de tienda.
- Moderacion y clasificacion de consultas de clientes: su tamano compacto permite desplegarlo como clasificador previo o filtro en pipelines de atencion al cliente.
- Despliegue en entornos con recursos limitados: con cuantizaciones de 0,5-0,9 GB, puede ejecutarse en dispositivos de borde, portatiles o servidores modestos para tareas de asistencia conversacional.
- Prototipado rapido de asistentes de e-commerce: la licencia Apache 2.0 y el formato GGUF facilitan experimentacion y pruebas de concepto sin coste de licencia.
- Analisis de resenas con imagenes: puede combinar texto e imagen para evaluar resenas de productos que incluyan fotografias.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,5-0,9 GB para cuantizaciones Q2-Q8; alrededor de 1,6 GB para f16. Sumar 0,2-0,3 GB adicionales si se usa el componente multimodal (`mmproj`).
- GPU recomendadas: cualquier GPU consumer moderna con 2 GB o mas de VRAM (GTX 1650, RTX 3050, RTX 4060, etc.); tambien puede ejecutarse en CPU.
- Cabe en GPU consumer: si, practicamente en cualquier GPU dedicada y en muchas integradas con suficiente memoria compartida.
- Opciones de despliegue: llama.cpp, Ollama, y cualquier runtime compatible con GGUF; el modelo base es compatible con transformers.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada; por el tamano, se espera baja latencia en hardware consumer, pero no hay datos medidos.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Multimodal | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| WeMM-Ecom-0.8B (este) | ~752 M | no disponible | Si (via mmproj) | Apache 2.0 | GGUF + safetensors |
| Qwen2.5-0.5B / 1.5B | 0,5-1,5 B | hasta 32K (segun variante) | No | Apache 2.0 | GGUF + safetensors |
| SmolVLM-500M | ~500 M | no disponible | Si | Apache 2.0 | safetensors + GGUF |
| Llama-3.2-1B | ~1,2 B | 128K | No | Llama 3.2 Community | GGUF + safetensors |

La comparativa se ofrece a titulo orientativo; no se dispone de datos de rendimiento comparativo del modelo en la informacion proporcionada.

## Limitaciones y advertencias

- Modelo especializado en e-commerce: su rendimiento fuera de ese dominio puede ser limitado en comparacion con modelos generalistas del mismo tamano.
- Idiomas limitados a chino e ingles; no se garantiza un rendimiento adecuado en castellano u otros idiomas.
- Riesgo de alucinacion inherente a modelos de ~0,75 B de parametros, especialmente en tareas de razonamiento complejo o datos factuales.
- No se documentan sesgos especificos, pero al estar entrenado en dominios de comercio electronico puede reflejar sesgos de catalogo y de los datos de entrenamiento originales.
- La longitud de contexto no esta documentada, lo que dificulta planificar despliegues con conversaciones largas.
- La licencia Apache 2.0 permite uso comercial, pero se recomienda verificar la licencia del modelo base original en `tencent/WeMM-Ecom-0.8B`.
- Las cuantizaciones de baja calidad (Q2_K, Q3_K_S) pueden degradar notablemente la coherencia; se recomienda Q4_K_M o superior para produccion.
- El componente multimodal requiere cargar el fichero `mmproj` correspondiente; sin el, el modelo funciona solo como texto.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/WeMM-Ecom-0.8B-GGUF
- Modelo base: https://huggingface.co/tencent/WeMM-Ecom-0.8B
- Licencia del modelo base: https://huggingface.co/tencent/WeMM-Ecom-0.8B/blob/main/LICENSE
- Cuantizaciones imatrix: https://huggingface.co/mradermacher/WeMM-Ecom-0.8B-i1-GGUF
- Pagina de descargas del autor: https://hf.tst.eu/model#WeMM-Ecom-0.8B-GGUF
- FAQ y solicitudes de cuantizacion: https://huggingface.co/mradermacher/model_requests
