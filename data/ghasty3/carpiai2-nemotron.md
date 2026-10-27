# Ghasty3/CarpiAI2-Nemotron

## Resumen

CarpiAI2-Nemotron es un ajuste fino publicado en HuggingFace por el usuario Ghasty3, derivado del modelo `google/gemma-4-E4B-it` y distribuido principalmente en formato GGUF. La ficha del repositorio lo etiqueta como `image-text-to-text`, por lo que se trata de un modelo multimodal que acepta imágenes y texto, orientado a uso conversacional. El nombre combina las etiquetas `capri` y `nemotron`, sin que se documente qué receta de entrenamiento o qué relación guarda con la familia Nemotron de NVIDIA.

El modelo se presenta como un fine-tune del base instructivo de Gemma 4 en su variante E4B, si bien no se publican datos sobre el conjunto de entrenamiento, el número de tokens, el contexto soportado ni los parámetros exactos. El repositorio no incluye model card técnica, resultados de evaluación ni listado de idiomas, y en el momento de la consulta acumula 0 descargas y 0 likes, por lo que carece de validación por parte de la comunidad.

Su relevancia es limitada y de carácter experimental: resulta útil como ejemplo de fine-tune multimodal empaquetado en GGUF para despliegue local, pero no debe considerarse una opción evaluada para producción sin una verificación previa por parte del equipo que lo adopte.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo derivado de `google/gemma-4-E4B-it`; arquitectura concreta no documentada) |
| Parametros totales | no disponible |
| Parametros activos | no disponible (solo aplicable si el base fuese MoE; no confirmado) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF (etiqueta del repositorio); niveles concretos no disponibles |
| Idiomas soportados | no disponible |
| Licencia | `openmdw-1.1` segun la etiqueta del repositorio; el campo de licencia de la ficha figura como no disponible |
| Formato de pesos | GGUF (etiqueta); no se confirma la publicacion de safetensors u otros formatos |

## Arquitectura y entrenamiento

La informacion disponible solo permite afirmar que el modelo es un fine-tune de `google/gemma-4-E4B-it`, un modelo instructivo multimodal de la familia Gemma 4. El sufijo "E4B" del nombre del base sugiere una variante de eficiencia dentro de esa familia, pero no se confirma en el repositorio ni se detalla si emplea atencion lineal, capas de embeddings por capa, mezcla de expertos u otra tecnica. Tampoco se especifica la arquitectura del encoder visual ni como se combinan las modalidades imagen y texto.

No hay informacion sobre el dataset de ajuste fino, el volumen de tokens, la composicion de los datos, el uso de RLHF, DPO u otras tecnicas de alineacion, ni sobre el proceso de cuantizacion a GGUF. Las etiquetas `capri` y `nemotron` no van acompanadas de explicacion, por lo que no es posible determinar si describen el corpus, la receta de entrenamiento o simplemente la nomenclatura interna del autor.

## Capacidades

- Entrada multimodal de imagen y texto, segun el pipeline `image-text-to-text` declarado en el repositorio.
- Generacion de texto conversacional multi-turno, heredada del caracter instructivo del modelo base.
- Seguimiento de instrucciones propio de un modelo `-it`, sin garantias adicionales derivadas del fine-tune.
- Inferencia en formato GGUF, lo que permite ejecucion en CPU y GPU con llama.cpp y runtimes compatibles.
- Compatibilidad con endpoints de inferencia, segun la etiqueta `endpoints_compatible`.
- Soporte de tool calling o function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible (no se publica listado de idiomas).
- Modo thinking, audio u otras capacidades especiales: no disponible.

## Casos de uso

- Prototipado local de asistentes multimodales: al distribuirse en GGUF, puede cargarse con llama.cpp u Ollama en un equipo de sobremesa para experimentar con entrada de imagen y texto sin depender de la nube.
- Descripcion automatica de imagenes en herramientas de accesibilidad: el modelo podria generar texto alternativo para fotografias, siempre que se valide previamente la calidad de sus descripciones.
- Extraccion asistida de informacion de capturas de pantalla o documentos escaneados: util en tareas internas de triaje donde un error sea tolerable y revisable por una persona.
- Soporte tecnico con imagenes adjuntas: un operador podria enviar una captura de error y obtener una primera explicacion, aprovechando el caracter conversacional del base.
- Evaluacion comparativa de fine-tunes comunitarios: sirve como punto de partida para medir cuanto se degrada o mejora un ajuste respecto a `google/gemma-4-E4B-it` en tareas concretas.
- Demostraciones en Hugging Face Inference Endpoints: la etiqueta `endpoints_compatible` permite desplegarlo como demo publica o interna con coste contenido.
- Generacion de descripciones de producto para catalogos: aplicable a fichas de e-commerce con imagen y texto, sujeto a revision editorial por el riesgo de alucinacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma oficial. Como referencia orientativa no verificada, un modelo de la clase de 4 000 millones de parametros en GGUF Q4_K_M suele ocupar entre 2,5 y 3,5 GB de pesos, a lo que hay que sumar la cache KV y el overhead del runtime; estas cifras no estan confirmadas para este checkpoint.
- GPU recomendadas: no disponibles. Para la clase de tamano indicada serian suficientes GPUs de consumo como RTX 3060 de 12 GB, RTX 4060 Ti de 16 GB o RTX 4090; A100 o H100 solo tendrian sentido para lotes grandes o servicio concurrente.
- Cabe en GPU de consumo: previsiblemente si, en cuantizaciones Q4 o Q5, aunque no hay confirmacion del autor.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio y llama-cpp-python por el formato GGUF; Hugging Face Inference Endpoints por la etiqueta `endpoints_compatible`. vLLM o TGI solo serian viables si se publican pesos en safetensors, extremo no confirmado.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Modalidad | Licencia | Estado |
|---|---|---|---|---|---|
| CarpiAI2-Nemotron (Ghasty3) | no disponible | no disponible | imagen y texto | `openmdw-1.1` segun etiqueta | 0 descargas, 0 likes, sin evaluacion publica |
| google/gemma-4-E4B-it (base) | no disponible en esta ficha | no disponible | imagen y texto | no verificada en esta ficha | modelo oficial de referencia |
| Familia NVIDIA Nemotron | no disponible | no disponible | texto | no disponible | sin relacion documentada con este repositorio pese al nombre |

No se dispone de datos de rendimiento que permitan una comparacion cuantitativa con alternativas. La unica comparacion fiable es de linaje: este checkpoint deriva del base de Gemma 4 y no hay evidencia de participacion de NVIDIA en su desarrollo, a pesar de la etiqueta `nemotron`.

## Limitaciones y advertencias

- Ausencia total de model card tecnica: no se documentan datos de entrenamiento, contexto, idiomas ni parametros, lo que impide evaluar su idoneidad para un caso concreto.
- Sin validacion de la comunidad: 0 descargas y 0 likes en el momento de la publicacion, sin issues ni evaluaciones externas conocidas.
- Riesgo de alucinacion heredado del modelo base, potencialmente mayor en tareas de descripcion de imagenes y extraccion de datos.
- Sesgos desconocidos: al no publicarse la composicion del dataset de ajuste fino, no es posible estimar que sesgos se han introducido o acentuado.
- Ambiguedad de licencia: la etiqueta indica `openmdw-1.1`, pero el campo de licencia de la ficha figura como no disponible; antes de un uso comercial hay que verificar los terminos exactos y su compatibilidad con la licencia del modelo base.
- La denominacion "Nemotron" puede inducir a confusion con los modelos de NVIDIA; no se ha documentado ninguna vinculacion.
- La cuantizacion GGUF puede degradar la calidad respecto a los pesos originales, especialmente en tareas multimodales.
- Limitaciones de contexto e idioma no disponibles: no se puede asumir un contexto largo ni un buen rendimiento en castellano.
- Fecha de publicacion reciente y autor unico: no hay historial de mantenimiento ni garantia de actualizaciones.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/Ghasty3/CarpiAI2-Nemotron
- Modelo base indicado en las etiquetas: https://huggingface.co/google/gemma-4-E4B-it
- Paper, blog o demo adicionales: no disponible en la informacion proporcionada.
