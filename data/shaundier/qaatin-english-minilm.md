# ShaunDier/qaatin-english-minilm

## Resumen

qaatin-english-minilm es una conversión a ONNX Runtime del modelo de embeddings de frases sentence-transformers/all-MiniLM-L6-v2, publicada por el usuario ShaunDier como artefacto de soporte para su proyecto Qaatin, disponible en GitHub. No se trata de un modelo entrenado desde cero ni de un fine-tuning: el autor indica explicitamente que son "the same weights", es decir, los pesos originales de MiniLM-L6-v2 exportados al formato ONNX para su uso con ONNX Runtime.

La particularidad tecnica de esta conversion es que la tabla de embeddings de palabras se almacena por separado en un fichero `embeddings.npy`, de modo que puede leerse desde disco bajo demanda. El grafo `model.onnx` acepta como entradas `inputs_embeds` (filas de esa tabla) y `attention_mask`, y devuelve un vector por cada word piece; el vector de frase se obtiene calculando la media de esos vectores. Esto difiere del pipeline habitual de sentence-transformers, donde la tokenizacion y la lookup de embeddings forman parte del grafo.

El modelo es relevante unicamente como pieza de infraestructura para el citado proyecto Qaatin: no aporta capacidades nuevas respecto al original, no tiene pipeline declarado en Hugging Face, registra cero descargas y cero likes, y su repo ocupa aproximadamente 0,1 GB. Para cualquier uso de embeddings de frases en produccion conviene acudir directamente al modelo base original o a sus exportaciones ONNX mantenidas por terceros.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (MiniLM, derivado de all-MiniLM-L6-v2) exportado a ONNX |
| Parametros totales | no disponible (el modelo base MiniLM-L6-v2 ronda los 22,7 M, dato no confirmado en la informacion proporcionada) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el tag `base_model:quantized:sentence-transformers/all-MiniLM-L6-v2` sugiere una variante cuantizada del base, sin detalle del esquema) |
| Idiomas soportados | no disponible (el nombre del repo indica "english", pero la model card no declara lista de idiomas) |
| Licencia | apache-2.0 |
| Formato de pesos | ONNX (`model.onnx`) mas tabla de embeddings en NumPy (`embeddings.npy`) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la del modelo base sentence-transformers/all-MiniLM-L6-v2, un encoder Transformer de tipo MiniLM orientado a generar embeddings de frases. Esta publicacion no incluye entrenamiento adicional: el autor afirma que se mantienen los mismos pesos y que el artefacto se genera con el script `tools/build_models.py` del repositorio Qaatin.

La innovacion respecto al pipeline convencional es puramente de despliegue: la tabla de embeddings de tokens se externaliza en `embeddings.npy` para permitir lectura desde disco bajo demanda, y el grafo ONNX se limita a consumir `inputs_embeds` y `attention_mask`, produciendo un vector por word piece cuya media constituye el embedding de frase. No se documentan en la informacion disponible ni el volumen de tokens de entrenamiento, ni la composicion del dataset, ni si hubo RLHF o DPO, ni tecnicas como decodificacion especulativa o attention linear.

## Capacidades

- Generacion de embeddings de frases y de fragmentos de texto: el grafo devuelve un vector por word piece y el vector de frase es su media.
- Busqueda semantica y similitud entre textos, heredadas del modelo base MiniLM-L6-v2.
- Ejecucion con ONNX Runtime, lo que permite inferencia fuera de PyTorch.
- Carga diferida de la tabla de embeddings desde disco mediante `embeddings.npy`.
- Generacion de texto: no disponible.
- Razonamiento, codigo y matematicas: no disponible.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible (el nombre del repo apunta a ingles, sin declaracion explicita).
- Vision, audio o modo "thinking": no disponible.

## Casos de uso

- Busqueda semantica en aplicaciones con ONNX Runtime: el modelo permite calcular embeddings de consultas y documentos sin dependencia de PyTorch, integrandose en servicios ya desplegados con el runtime de ONNX.
- Deduplicacion y agrupamiento de textos: los vectores de frase permiten calcular similitud coseno para agrupar registros duplicados o near-duplicates en pipelines de datos.
- Recuperacion aumentada (RAG) en entornos con recursos limitados: al tratarse de un encoder pequeno (repo de 0,1 GB), puede ejecutarse en contenedores ligeros para indexar y recuperar fragmentos de documentacion.
- Clasificacion de texto por similitud con prototipos: los embeddings pueden compararse contra vectores de referencia para etiquetar tickets, correos o comentarios sin entrenar un clasificador adicional.
- Uso dentro del proyecto Qaatin: el artefacto esta disenado especificamente para ese proyecto, que puede cargar `model.onnx` y `embeddings.npy` conforme a su flujo de inferencia.
- Experimentacion con exportacion ONNX: sirve como referencia para estudiar el patron de tabla de embeddings externalizada y comparar su comportamiento frente al pipeline estandar de sentence-transformers.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la informacion proporcionada; el repo completo ocupa aproximadamente 0,1 GB, lo que sugiere un modelo de pequeno tamano.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible; por el tamano del artefacto, es plausible que quepa en cualquier GPU de consumo, pero este extremo no esta confirmado en la informacion proporcionada.
- Opciones de despliegue: ONNX Runtime, segun indica la libreria declarada (`onnx`).
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| ShaunDier/qaatin-english-minilm | no disponible | no disponible | apache-2.0 | ONNX + embeddings.npy | Conversion para el proyecto Qaatin, sin pipeline declarado |
| sentence-transformers/all-MiniLM-L6-v2 | no disponible en la informacion proporcionada | no disponible | apache-2.0 (modelo base del anterior) | safetensors / PyTorch | Modelo original de embeddings de frases |
| Otras exportaciones ONNX de MiniLM-L6-v2 | no disponible | no disponible | no disponible | ONNX | Alternativas mantenidas por terceros, no evaluadas aqui |

No se dispone de datos de rendimiento que permitan comparar metricas entre estas opciones.

## Limitaciones y advertencias

- No es un modelo generativo: solo produce embeddings; no sirve para tareas de generacion de texto, codigo o razonamiento.
- Al conservar los pesos del modelo base, arrastra los sesgos y limitaciones de all-MiniLM-L6-v2, aunque la model card no documenta sesgos concretos.
- La model card no declara lista de idiomas; el sufijo "english" del nombre sugiere orientacion al ingles, sin confirmacion.
- El formato exige gestionar dos artefactos (`model.onnx` y `embeddings.npy`) y implementar la media de vectores por word piece para obtener el embedding de frase; no es un pipeline plug-and-play de sentence-transformers.
- El tag `base_model:quantized:sentence-transformers/all-MiniLM-L6-v2` apunta a una variante cuantizada del base, pero no se especifica el esquema de cuantizacion ni su impacto en calidad.
- Sin pipeline declarado, cero descargas y cero likes: no hay evidencia de uso en produccion ni de validacion por terceros.
- Licencia apache-2.0, que permite uso comercial con las obligaciones habituales de atribucion y aviso; conviene verificar tambien la licencia del modelo base.
- No hay datos publicados de latencia, throughput ni benchmarks que respalden su comportamiento frente al modelo original.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ShaunDier/qaatin-english-minilm
- Modelo base: https://huggingface.co/sentence-transformers/all-MiniLM-L6-v2
- Repositorio del proyecto Qaatin: https://github.com/ShaunDier/qaatin
