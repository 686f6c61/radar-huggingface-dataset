# mradermacher/Moonberry-2B-GGUF

## Resumen

Moonberry-2B-GGUF es la version cuantizada en formato GGUF del modelo PinkPixel/Moonberry-2B, un modelo multimodal de aproximadamente 1.880 millones de parametros (1.881.825.088 exactos segun los pesos en safetensors) desarrollado por PinkPixel y cuantizado por mradermacher. El modelo se presenta como un transformer de la familia Qwen (etiquetado como qwen3.5) con capacidades de vision, orientado a generacion de texto conversacional y roleplay, y afinado a partir del dataset PinkPixel/Childrens-Story-Writing.

La relevancia de esta publicacion es practica: mradermacher ofrece un conjunto completo de cuantizaciones estaticas (desde Q2_K hasta f16, ademas de los suplementos multimodales mmproj en Q8_0 y f16) que permiten ejecutar un modelo multimodal de ~2B parametros en hardware de consumo mediante llama.cpp y ecosistemas compatibles. El repositorio ocupa 20,1 GB en total, aunque cada archivo individual de cuantizacion pesa entre 1,1 GB y 3,9 GB.

Se trata de un modelo pequeno, en ingles, con licencia Apache 2.0, pensado para experimentacion con narrativa infantil, roleplay y tareas multimodales ligeras. No se dispone de informacion publicada sobre contexto maximo, composicion del dataset de entrenamiento ni resultados de benchmarks.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (familia Qwen, etiquetado qwen3.5), multimodal con vision |
| Parametros totales | 1.881.825.088 (~1,88B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | f16, Q8_0, Q6_K, Q5_K_M, Q5_K_S, Q4_K_M, Q4_K_S, IQ4_XS, Q3_K_L, Q3_K_M, Q3_K_S, Q2_K; suplementos mmproj en Q8_0 y f16 |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (cuantizaciones estaticas); modelo base en safetensors/transformers |

## Arquitectura y entrenamiento

El modelo base PinkPixel/Moonberry-2B es un transformer de la familia Qwen (la model card lo etiqueta como qwen3.5) con capacidad multimodal de vision, segun los tags del repositorio. Los pesos cuantizados suman 1.881.825.088 parametros, lo que situa al modelo en la categoria de ~2B. El repositorio incluye archivos mmproj separados (Q8_0 de 0,5 GB y f16 de 0,8 GB), lo que confirma la presencia de un proyector multimodal para entrada de imagenes en el pipeline de llama.cpp.

El entrenamiento se asocia al dataset PinkPixel/Childrens-Story-Writing, lo que sugiere un ajuste orientado a narrativa infantil y generacion de cuentos. No se dispone de informacion publicada sobre el numero de tokens de entrenamiento, la composicion completa del dataset, ni si se aplicaron tecnicas de RLHF, DPO u otras etapas de alineamiento. Tampoco se documentan innovaciones tecnicas especificas (atencion linear, decodificacion especulativa, etc.) en la informacion disponible.

Las cuantizaciones de mradermacher son estaticas (quantize_version 2, output_tensor_quantised 1, convert_type hf). El autor indica que las cuantizaciones ponderadas con imatrix estan disponibles en un repositorio separado (Moonberry-2B-i1-GGUF).

## Capacidades

- Generacion de texto conversacional en ingles, con enfasis en narrativa y cuentos infantiles.
- Capacidades multimodales de vision: procesamiento de imagenes mediante el proyector mmproj incluido.
- Orientacion a roleplay, segun los tags del autor.
- Soporte de conversaciones multi-turno (tag conversational).
- Compatibilidad con endpoints (tag endpoints_compatible).
- No se documenta soporte explicito de tool calling, function calling, agentes, modo thinking, audio ni matematicas avanzadas.

## Casos de uso

- Generacion de cuentos infantiles: el modelo esta afinado sobre el dataset Childrens-Story-Writing, por lo que puede producir narrativas breves y adecuadas para ese dominio con un coste computacional minimo.
- Roleplay y personajes conversacionales: el tag roleplay y su naturaleza conversacional lo hacen adecuado para chatbots de personajes en entornos de demostracion o prototipado.
- Descripcion de imagenes en ingles: gracias al proyector mmproj, puede integrarse en pipelines que reciban una imagen y generen texto descriptivo o narrativo a partir de ella.
- Prototipado rapido en local: con cuantizaciones de 1,1 a 1,5 GB (Q2_K a Q5_K_M) se puede desplegar en portatiles y equipos sin GPU dedicada mediante llama.cpp u Ollama.
- Educacion y experimentacion: util como modelo de referencia para estudiar cuantizacion, multimodalidad ligera y ajuste fino sobre datasets especificos en entornos academicos.
- Aplicaciones de escritura asistida: generacion de borradores de historias o continuaciones narrativas en ingles con latencia baja en hardware de consumo.
- Filtrado y clasificacion de texto creativo: su tamano reducido permite ejecutarlo en batch sobre grandes volumenes de texto para tareas de generacion o reescritura.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1,1 GB (Q2_K) a 1,5 GB (Q5_K_M); 2,1 GB para Q8_0 y 3,9 GB para f16. Anadir 0,5-0,8 GB si se usa el proyector multimodal mmproj.
- GPU recomendadas: cualquier GPU con 4 GB o mas de VRAM puede ejecutar las cuantizaciones de menor tamano; una RTX 3060, RTX 4060 o superior permite Q8_0 con holgura. Para f16 se recomienda al menos 6 GB de VRAM.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU moderna de 4-8 GB; tambien puede ejecutarse en CPU.
- Opciones de despliegue: llama.cpp, Ollama, y cualquier runtime compatible con GGUF; el modelo base es compatible con transformers.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Multimodal | Licencia | Formato |
|---|---|---|---|---|---|
| Moonberry-2B-GGUF | ~1,88B | no disponible | Si (vision) | Apache 2.0 | GGUF |
| Qwen2-VL-2B | ~2B | no disponible en esta ficha | Si (vision) | Apache 2.0 | safetensors, GGUF (comunitario) |
| SmolVLM-2B | ~2B | no disponible en esta ficha | Si (vision) | Apache 2.0 | safetensors, GGUF (comunitario) |

La comparativa se limita a modelos de ~2B con capacidad de vision y licencia permisiva; no se dispone de datos de rendimiento comparativo para Moonberry-2B en la informacion proporcionada.

## Limitaciones y advertencias

- Modelo entrenado y documentado unicamente en ingles; el rendimiento en castellano no esta garantizado.
- No se ha publicado informacion sobre sesgos, filtros de seguridad ni evaluaciones de alucinacion.
- El ajuste sobre un dataset de cuentos infantiles puede limitar la calidad en dominios tecnicos, cientificos o de codigo.
- No se documenta la longitud de contexto soportada, lo que impide planificar aplicaciones con ventanas largas.
- La licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantias sobre el comportamiento del modelo en produccion.
- El modelo base y sus cuantizaciones tienen pocas descargas (216) y ningun like en el momento de la consulta, lo que indica escasa validacion por parte de la comunidad.
- Las cuantizaciones de baja precision (Q2_K, Q3_K_S) pueden degradar notablemente la calidad; el autor recomienda Q4_K_S o Q4_K_M para uso general.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/mradermacher/Moonberry-2B-GGUF
- Modelo base: https://huggingface.co/PinkPixel/Moonberry-2B
- Cuantizaciones imatrix: https://huggingface.co/mradermacher/Moonberry-2B-i1-GGUF
- Pagina de descargas del autor: https://hf.tst.eu/model#Moonberry-2B-GGUF
- Dataset de entrenamiento: https://huggingface.co/datasets/PinkPixel/Childrens-Story-Writing
- FAQ y peticiones de cuantizacion: https://huggingface.co/mradermacher/model_requests
- Guia de uso de GGUF (referencia de TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Analisis de tipos de cuantizacion (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
