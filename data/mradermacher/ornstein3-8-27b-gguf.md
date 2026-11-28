# mradermacher/Ornstein3.8-27B-GGUF

## Resumen

Ornstein3.8-27B-GGUF es la distribucion en formato GGUF del modelo multimodal GestaltLabs/Ornstein3.8-27B, publicada por el cuantizador mradermacher. Se trata de un modelo de tipo image-text-to-text (procesa imagenes y texto de entrada y genera texto) con 27.320.697.856 parametros totales, etiquetado por el autor con los identificadores qwen3_5 y qwen3.8, lo que sugiere una base derivada de la familia Qwen 3. La licencia declarada es Apache 2.0 y el unico idioma documentado es el ingles.

La relevancia de esta publicacion es practica: el repositorio original esta en formato transformers, y esta version ofrece 13 cuantizaciones GGUF estaticas (desde Q2_K de 11,0 GB hasta Q8_0 de 29,1 GB) mas dos ficheros mmproj para el codificador visual, lo que permite ejecutar un modelo multimodal de 27B en hardware de consumo mediante llama.cpp u Ollama. El repositorio ocupa 190,8 GB en total y acumula 188 descargas desde su creacion el 28 de agosto de 2026.

No obstante, la informacion publicada es escasa: la model card del cuantizador no incluye detalles de arquitectura, contexto, datos de entrenamiento ni benchmarks, y el modelo base apenas aporta etiquetas. Esta ficha refleja unicamente lo verificable en los metadatos y marca explicitamente como "no disponible" todo aquello que no consta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal image-text-to-text (familia Qwen 3, segun etiquetas qwen3_5 / qwen3.8); detalles internos no disponibles |
| Parametros totales | 27.320.697.856 (27,3B) |
| Parametros activos | no disponible (no se declara que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0 (estaticas) y variantes con imatrix en repositorio aparte (i1-GGUF); mmproj en Q8_0 y f16 |
| Idiomas soportados | en (ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (original en transformers/safetensors) |

## Arquitectura y entrenamiento

Los metadatos indican una arquitectura de tipo transformer multimodal con pipeline image-text-to-text, es decir, un modelo de lenguaje con un codificador visual acoplado que acepta imagenes y texto y produce texto. Las etiquetas qwen3_5 y qwen3.8 apuntan a una base derivada de Qwen 3, pero no se especifica si se trata de un ajuste fino, una mezcla o una continuacion del entrenamiento. El modelo se distribuye con ficheros mmproj separados (Q8_0 de 0,7 GB y f16 de 1,0 GB), lo que confirma la presencia de una torre visual independiente cuantizada aparte del cuerpo del lenguaje.

No hay informacion publicada sobre el numero de tokens de entrenamiento, la composicion del dataset, el uso de RLHF o DPO, ni sobre innovaciones tecnicas concretas (atencion lineal, decodificacion especulativa, modos de razonamiento). La model card del cuantizador es puramente operativa: describe el proceso de cuantizacion estatica (quantize_version 2, output_tensor_quantised 1, convert_type hf) y remite al repositorio del modelo base para cualquier detalle de entrenamiento.

## Capacidades

- Generacion de texto conversacional a partir de entradas de texto e imagen (pipeline image-text-to-text).
- Procesamiento de imagenes mediante el codificador visual incluido en los ficheros mmproj.
- Conversacion multi-turno (etiqueta conversational en los metadatos).
- Compatibilidad con endpoints (etiqueta endpoints_compatible), lo que facilita su despliegue detras de APIs compatibles con OpenAI.
- Capacidades de codigo, matematicas, tool calling, razonamiento multi-paso o modo thinking: no documentadas en la informacion disponible.
- Multilingue: no; el unico idioma declarado es el ingles.

## Casos de uso

- Analisis de documentos con imagenes: el modelo puede recibir capturas, diagramas o paginas escaneadas junto con una pregunta en texto y devolver una descripcion o extraccion, gracias a la torre visual empaquetada en los ficheros mmproj.
- Asistentes de soporte tecnico con capturas de pantalla: un usuario adjunta una imagen de un error y el modelo genera una respuesta contextualizada; el formato GGUF permite desplegarlo en servidores modestos con llama.cpp.
- Prototipado local de aplicaciones multimodales: al caber en 11-17 GB en cuantizaciones Q2_K a Q4_K_M, permite desarrollar y validar flujos image-text-to-text en una estacion de trabajo sin GPU de datacenter.
- Etiquetado y descripcion de imagenes en lotes: integrable en pipelines de preprocesamiento de datos donde se necesita generar descripciones textuales de imagenes en ingles.
- Despliegue en entornos con requisitos de licencia permisiva: la licencia Apache 2.0 permite uso comercial y modificacion sin restricciones de atribucion adicionales mas alla de las habituales.
- Evaluacion comparativa de cuantizaciones: el repositorio ofrece 11 niveles de cuantizacion del mismo modelo, util para medir el compromiso entre calidad y VRAM antes de fijar una configuracion de produccion.
- Educacion e investigacion: servir el modelo con Ollama o llama.cpp para experimentar con modelos multimodales de 27B en laboratorios con hardware limitado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (pesos + overhead de contexto y cache KV):
  - Q2_K (11,0 GB): aproximadamente 13-15 GB en GPU.
  - Q3_K_M (13,6 GB): aproximadamente 16-18 GB.
  - Q4_K_M (16,9 GB): aproximadamente 19-22 GB.
  - Q5_K_M (19,6 GB): aproximadamente 22-25 GB.
  - Q6_K (22,5 GB): aproximadamente 25-28 GB.
  - Q8_0 (29,1 GB): aproximadamente 32-36 GB.
  - Sumar 0,7 GB (mmproj Q8_0) o 1,0 GB (mmproj f16) si se usa la entrada de imagen.
- GPU recomendadas: RTX 4090 (24 GB) para Q4_K_M y Q5_K_M; RTX 3090 (24 GB) para Q4_K_M; A100 40 GB o H100 para Q8_0 con contexto amplio; configuraciones multi-GPU para Q6_K y Q8_0.
- Cabe en GPU de consumo: si, en Q2_K a Q4_K_M con 16-24 GB de VRAM; Q5_K_M es ajustado en 24 GB y Q6_K/Q8_0 requieren 32 GB o mas.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio y cualquier runtime compatible con GGUF; para el modelo original en transformers, vLLM o TGI (no verificados para esta variante).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Multimodal | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| Ornstein3.8-27B-GGUF (este) | 27,3B | no disponible | Si (image-text-to-text) | Apache 2.0 | GGUF | 11 cuantizaciones estaticas, solo ingles |
| Qwen 3 (familia, referencia por etiquetas) | variable | no disponible | Segun variante | Apache 2.0 en la mayoria de tamanos | safetensors, GGUF | Base probable del modelo; datos no confirmados |
| Gemma 3 27B | 27B | no disponible en esta ficha | Si (vision) | Terminos propios de Google | safetensors, GGUF | Alternativa de tamano equivalente; no se dispone de datos comparativos verificados |

No se dispone de resultados de benchmarks que permitan una comparacion cuantitativa fiable con alternativas. La comparativa anterior se limita a datos estructurales y debe tratarse como orientativa.

## Limitaciones y advertencias

- Solo se declara soporte de ingles; el rendimiento en castellano no esta verificado y probablemente sea inferior.
- No hay informacion sobre sesgos, datos de entrenamiento ni evaluaciones de seguridad; no se puede descartar la presencia de sesgos inherites a la base Qwen 3.
- Riesgo de alucinacion inherente a los modelos generativos, sin mitigaciones documentadas.
- La longitud de contexto no esta publicada; planificar el despliegue con un valor conservador y verificar experimentalmente.
- La model card del cuantizador no documenta el proceso de cuantizacion mas alla de las etiquetas internas; las cuantizaciones Q2_K y Q3_K_S pueden degradar notablemente la calidad, especialmente en tareas de vision.
- El repositorio pesa 190,8 GB; descargar solo los ficheros necesarios.
- Aunque la licencia es Apache 2.0, conviene verificar la licencia del modelo base GestaltLabs/Ornstein3.8-27B antes de uso comercial, ya que el cuantizador no la detalla.
- Popularidad muy baja (188 descargas, 0 likes) y ausencia de validacion comunitaria: tratar como modelo experimental.
- El autor no garantiza la equivalencia funcional con el modelo original en transformers; las diferencias de tokenizador o chat template pueden afectar a la calidad de las respuestas.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/Ornstein3.8-27B-GGUF
- Modelo base: https://huggingface.co/GestaltLabs/Ornstein3.8-27B
- Cuantizaciones con imatrix: https://huggingface.co/mradermacher/Ornstein3.8-27B-i1-GGUF
- Pagina de descargas del cuantizador: https://hf.tst.eu/model#Ornstein3.8-27B-GGUF
- Peticiones de cuantizacion: https://huggingface.co/mradermacher/model_requests
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafico de calidad de cuantizaciones (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas sobre cuantizaciones (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Empresa del cuantizador: https://www.nethype.de/
