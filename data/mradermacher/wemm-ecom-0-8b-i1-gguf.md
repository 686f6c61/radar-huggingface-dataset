# mradermacher/WeMM-Ecom-0.8B-i1-GGUF

## Resumen

WeMM-Ecom-0.8B-i1-GGUF es una cuantizacion en formato GGUF del modelo multimodal WeMM-Ecom-0.8B, desarrollado originalmente por Tencent. El modelo base esta especializado en conversaciones de comercio electronico y combina capacidades de vision y lenguaje, lo que le permite procesar imagenes de productos junto con texto para tareas de atencion al cliente, descripcion de articulos y dialogo contextual en entornos de e-commerce. La cuantizacion la ha realizado mradermacher, un autor conocido en la comunidad por publicar versiones optimizadas de modelos open source para inferencia local.

El modelo base emplea una arquitectura derivada de Qwen3.5 (etiquetada como `qwen3_5` en los metadatos) con aproximadamente 752 millones de parametros totales, lo que lo situa en la categoria de modelos pequenos y eficientes. Esta version i1-GGUF incluye cuantizaciones generadas con imatrix (importance matrix), una tecnica que mejora la calidad de las cuantizaciones de baja precision al ponderar los tensores segun su importancia real en el modelo. El repositorio ofrece un amplio abanico de niveles de cuantizacion, desde IQ1_S (0,4 GB) hasta Q6_K (0,7 GB).

La relevancia de esta ficha radica en que permite desplegar un modelo multimodal especializado en e-commerce en hardware de consumo, algo poco habitual en modelos con capacidades de vision. Su licencia Apache 2.0 facilita el uso comercial, y su reducido tamano lo hace apto para entornos con recursos limitados, como dispositivos edge o estaciones de trabajo sin GPU dedicada de alta gama.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (derivada de Qwen3.5, segun tag `qwen3_5`) |
| Parametros totales | 752.393.024 (aprox. 0,75 B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | i1-IQ1_S, i1-IQ1_M, i1-IQ2_XXS, i1-IQ2_XS, i1-IQ2_S, i1-IQ2_M, i1-IQ3_XXS, i1-Q2_K_S, i1-Q2_K, i1-Q3_K_S, i1-IQ3_XS, i1-IQ3_S, i1-IQ3_M, i1-Q3_K_M, i1-Q3_K_L, i1-Q4_0, i1-Q4_K_S, i1-IQ4_XS, i1-IQ4_NL, i1-Q4_1, i1-Q4_K_M, i1-Q5_K_S, i1-Q5_K_M, i1-Q6_K |
| Idiomas soportados | chino (zh) e ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizaciones i1 con imatrix); el modelo base en safetensors |

## Arquitectura y entrenamiento

El modelo base WeMM-Ecom-0.8B es un transformer multimodal que integra un codificador visual con un modelo de lenguaje de aproximadamente 752 millones de parametros. La etiqueta `qwen3_5` sugiere que el componente de lenguaje deriva de la familia Qwen3.5, aunque no se dispone de detalles oficiales sobre la configuracion exacta de capas, dimensiones ocultas o mecanismo de atencion. La naturaleza multimodal implica un proyector o adaptador que alinea las representaciones visuales con el espacio de embeddings del lenguaje, aunque la model card no especifica su arquitectura interna.

No se dispone de informacion sobre el volumen de datos de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO. El nombre "Ecom" y las etiquetas `e-commerce` y `conversational` indican un ajuste fino orientado a dialogos comerciales, probablemente con datos de conversaciones de atencion al cliente, descripciones de productos e imagenes de catalogo. La cuantizacion i1 con imatrix aplicada por mradermacher constituye una innovacion practica: la matriz de importancia se calcula a partir de estadisticas de activacion para preservar los pesos mas criticos en cuantizaciones agresivas, lo que mejora la relacion calidad/tamano respecto a cuantizaciones estaticas.

## Capacidades

- Generacion de texto conversacional en chino e ingles, orientada a dialogos de comercio electronico.
- Procesamiento de imagenes (vision): el modelo es multimodal y puede analizar imagenes de productos, aunque los ficheros mmproj necesarios para la inferencia visual se alojan en el repositorio estatico separado (`mradermacher/WeMM-Ecom-0.8B-GGUF`).
- Comprension de contexto comercial: descripciones de productos, consultas de clientes, comparativas de articulos.
- Conversacion multi-turno: disenado para mantener dialogos coherentes en escenarios de atencion al cliente.
- Soporte multilingue limitado a chino e ingles.
- No se dispone de informacion sobre soporte de tool calling, function calling, agentes o modos de razonamiento extendido (thinking mode).
- No se dispone de informacion sobre capacidades de audio.

## Casos de uso

- Atencion al cliente automatizada en tiendas online: el modelo puede gestionar conversaciones multi-turno sobre pedidos, devoluciones y caracteristicas de productos, en chino o ingles, con un coste computacional minimo gracias a sus 0,75 B de parametros.
- Descripcion automatica de productos a partir de imagenes: integrado en un pipeline de catalogo, el modelo puede generar fichas de producto a partir de fotografias, reduciendo el trabajo manual de los equipos de contenido.
- Asistente de compras conversacional: puede responder preguntas sobre productos comparando caracteristicas y precios dentro de un flujo de conversacion, adecuado para integrarse en chats de e-commerce.
- Moderacion y clasificacion de consultas de clientes: su capacidad de comprension de texto permite clasificar y priorizar tickets de soporte segun su tematica comercial.
- Despliegue en dispositivos edge o entornos sin GPU: con cuantizaciones de 0,4-0,7 GB, puede ejecutarse en CPU o en GPUs de consumo, lo que lo hace viable para prototipos y demos locales.
- Generacion de respuestas multilingues para mercados chino e ingles: util para tiendas con clientela internacional en esos dos idiomas, con la ventaja de una licencia Apache 2.0 que permite uso comercial sin restricciones adicionales.
- Pruebas de concepto de asistentes multimodales: investigadores pueden experimentar con un modelo de vision-lenguaje pequeno sin necesidad de infraestructura de datacenter.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: entre 0,5 GB y 1 GB segun la cuantizacion elegida (IQ1_S: 0,4 GB; Q6_K: 0,7 GB), mas el espacio adicional para el contexto y los ficheros mmproj de vision.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM puede ejecutar las cuantizaciones mas pequenas; una RTX 3060 o superior ofrece margen holgado. Para el modelo base en precision completa (safetensors), se necesitan aproximadamente 2-3 GB de VRAM.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU moderna (GTX 1060 6 GB, RTX 2060, RTX 4090, etc.) e incluso en CPU.
- Opciones de despliegue: llama.cpp, Ollama, y cualquier runtime compatible con GGUF. Para el modelo base en safetensors, transformers con aceleracion CUDA. No se dispone de informacion sobre soporte en vLLM o TGI para esta cuantizacion.
- Latencia y throughput estimados: no disponibles. Dado el reducido tamano, se espera una latencia baja en GPU de consumo, pero no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Vision | Licencia | Formato |
|---|---|---|---|---|---|
| WeMM-Ecom-0.8B (este) | 0,75 B | no disponible | Si | Apache 2.0 | GGUF, safetensors |
| Qwen2-VL-2B | 2 B | 32k (aprox.) | Si | Apache 2.0 | safetensors, GGUF |
| SmolVLM-500M | 0,5 B | 8k (aprox.) | Si | Apache 2.0 | safetensors, GGUF |
| LLaVA-1.5-7B | 7 B | 4k (aprox.) | Si | LLaMA 2 (uso comercial restringido) | safetensors |

Nota: los datos de contexto y parametros de los modelos comparativos son aproximados y pueden variar segun la version; no se dispone de benchmarks comparativos directos en la informacion proporcionada. La principal ventaja diferencial de WeMM-Ecom-0.8B es su especializacion en e-commerce y su reducido tamano, mientras que modelos como Qwen2-VL-2B ofrecen mayor contexto y capacidades generales.

## Limitaciones y advertencias

- Sesgos conocidos: no se dispone de informacion sobre sesgos especificos, pero al estar entrenado con datos de e-commerce en chino e ingles, puede reflejar sesgos culturales y comerciales de esos mercados.
- Riesgo de alucinacion: como todo modelo de lenguaje de 0,75 B, es propenso a generar informacion incorrecta, especialmente en tareas de razonamiento complejo o cuando se le piden datos factuales precisos sobre productos.
- Limitaciones de contexto e idioma: solo soporta chino e ingles; no se ha documentado la longitud de contexto, lo que supone un riesgo para conversaciones largas. No se recomienda su uso en otros idiomas sin evaluacion previa.
- Restricciones de licencia: la licencia Apache 2.0 permite uso comercial sin restricciones adicionales, pero el modelo base podria tener terminos adicionales; se recomienda consultar el LICENSE del repositorio original de Tencent.
- Caveats para produccion: el modelo es muy pequeno y puede no alcanzar la calidad de modelos de mayor tamano en tareas complejas; requiere validacion exhaustiva antes de desplegarlo en atencion al cliente real. Los ficheros mmproj para vision estan en un repositorio separado, lo que anade un paso de configuracion. No se dispone de informacion sobre tool calling ni agentes, lo que limita su integracion en pipelines automatizados complejos.

## Enlaces

- Repositorio Hugging Face de esta cuantizacion: https://huggingface.co/mradermacher/WeMM-Ecom-0.8B-i1-GGUF
- Repositorio de cuantizaciones estaticas (incluye mmproj): https://huggingface.co/mradermacher/WeMM-Ecom-0.8B-GGUF
- Modelo base original: https://huggingface.co/tencent/WeMM-Ecom-0.8B
- Licencia del modelo base: https://huggingface.co/tencent/WeMM-Ecom-0.8B/blob/main/LICENSE
- Pagina de descargas del autor: https://hf.tst.eu/model#WeMM-Ecom-0.8B-i1-GGUF
- FAQ y solicitudes de cuantizacion: https://huggingface.co/mradermacher/model_requests
- Grafico comparativo de cuantizaciones (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Analisis de Artefact2 sobre cuantizaciones: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
