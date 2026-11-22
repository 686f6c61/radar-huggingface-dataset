# mradermacher/Zenith-4B-GGUF

## Resumen

Zenith-4B es un modelo de lenguaje multimodal (vision-language) desarrollado por KATHIR2006 y distribuido en formato GGUF por mradermacher. Está construido sobre la arquitectura Qwen2 y orientado a tareas de codigo agentico, sintesis de codigo y extraccion de documentos. El modelo combina capacidades de comprension de texto e imagen, lo que lo hace adecuado para flujos de trabajo que requieren procesar documentos escaneados, capturas de pantalla o diagramas junto con texto.

La version aqui descrita es una cuantizacion estatica del modelo original, publicada por mradermacher, un conocido distribuidor de cuantizaciones GGUF en Hugging Face. El repositorio ofrece un amplio abanico de niveles de cuantizacion (desde Q2_K hasta f16) para facilitar el despliegue en hardware de consumo. El modelo base declara el uso de tecnicas de fusion de modelos (ties-merge), lo que sugiere que fue construido mediante la combinacion de checkpoints especializados.

Con 3.085.938.688 parametros reales (etiquetado comercialmente como "4B"), Zenith-4B se posiciona en la gama de modelos pequenos con capacidades multimodales, un nicho relevante para despliegues en el borde, entornos con recursos limitados y pipelines de extraccion de informacion donde el coste por inferencia es critico. La licencia Apache 2.0 facilita su adopcion comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (Qwen2) con capacidades de vision-language |
| Parametros totales | 3.085.938.688 |
| Parametros activos | no disponible (no es MoE segun la informacion disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | en (ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (safetensors en el modelo base) |

## Arquitectura y entrenamiento

Zenith-4B se basa en la arquitectura Qwen2, un transformer decoder-only con atencion causal estandar. El modelo incorpora capacidades multimodales (vision-language), lo que implica la presencia de un codificador visual y un proyector que alinea las representaciones de imagen con el espacio de embeddings del modelo de lenguaje. El tag `ties-merge` indica que el checkpoint fue construido mediante la fusion de modelos (model merging) usando la tecnica TIES, que combina pesos de multiples modelos especializados resolviendo interferencias entre parametros.

No se dispone de informacion detallada sobre el volumen de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO. Los tags sugieren un enfasis en datos de codigo, tareas agenticas y documentos, pero no se especifican proporciones ni fuentes. Tampoco se documentan innovaciones tecnicas adicionales como decodificacion especulativa o atencion lineal.

## Capacidades

- Generacion de texto conversacional en ingles.
- Comprension de imagenes (vision-language): capacidad de procesar entradas visuales junto con texto.
- Sintesis de codigo y asistencia a la programacion (tag `code-synthesis`).
- Codificacion agentica: orientado a flujos multi-paso y uso de herramientas (tag `agentic-coding`).
- Extraccion de documentos: procesamiento de documentos para extraer informacion estructurada (tag `document-extraction`).
- Soporte multimodal para tareas que combinan texto e imagen.
- No se ha documentado explicitamente soporte de tool calling, function calling ni modo de razonamiento (thinking mode) en la informacion disponible.
- Capacidades multilingues limitadas al ingles segun la model card.

## Casos de uso

- Extraccion de datos de documentos escaneados: el modelo puede recibir imagenes de facturas, formularios o recibos y extraer campos estructurados, aprovechando su capacidad vision-language y su orientacion a document-extraction.
- Asistencia a la programacion en entornos con recursos limitados: con cuantizaciones Q4_K_M de 2,0 GB, puede desplegarse en estaciones de trabajo sin GPU dedicada para autocompletado y sintesis de codigo en ingles.
- Pipelines de codigo agentico: el modelo esta etiquetado para agentic-coding, por lo que puede integrarse en bucles de razonamiento multi-paso que generan, ejecutan y corrigen codigo, aunque requiere validacion externa.
- Procesamiento de capturas de pantalla en automatizacion de QA: puede interpretar imagenes de interfaces de usuario y generar descripciones o pasos de reproduccion en ingles.
- Digitalizacion de archivos historicos o tecnicos: combinacion de OCR implicito (via vision) y generacion de texto para transcribir y resumir documentos.
- Prototipado rapido de asistentes multimodales: su tamano compacto (1,4-3,4 GB segun cuantizacion) permite iterar rapidamente en local con llama.cpp u Ollama antes de escalar a modelos mayores.
- Clasificacion y enrutamiento de documentos con contenido visual: analisis de imagenes para decidir el tipo de documento y derivarlo al pipeline adecuado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (solo pesos): Q2_K ~1,4 GB; Q4_K_M ~2,0 GB; Q8_0 ~3,4 GB; f16 ~6,3 GB. Añadir overhead de contexto KV cache (no documentado).
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para cuantizaciones Q4; RTX 3060, RTX 4060, RTX 4090 para mayor throughput; A100/H100 no necesarias pero validas para despliegues por lotes.
- Cabe en GPU de consumo: si, practicamente cualquier GPU moderna con 4-8 GB de VRAM; tambien puede ejecutarse en CPU con llama.cpp.
- Opciones de despliegue: llama.cpp, Ollama (a partir de GGUF), y servidores compatibles con GGUF. vLLM y TGI requeririan los pesos originales en safetensors del modelo base, no la version GGUF.
- Latencia y throughput estimados: no disponibles. Dependeran del hardware y la cuantizacion; en una RTX 4090 con Q4_K_M se espera un throughput alto para un modelo de ~3B, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Multimodal | Licencia | Formato |
|---|---|---|---|---|---|
| Zenith-4B (este) | 3,09B | no disponible | Si (vision-language) | Apache 2.0 | GGUF / safetensors |
| Qwen2-VL-2B | ~2B | 32K (tipico en la familia Qwen2-VL) | Si | Apache 2.0 | safetensors / GGUF |
| Qwen2.5-3B | 3,09B | 32K (tipico en Qwen2.5) | No | Apache 2.0 | safetensors / GGUF |
| SmolVLM-2B | ~2B | no disponible | Si | Apache 2.0 | safetensors / GGUF |

Nota: los datos de contexto y parametros de los modelos comparables provienen de conocimiento general de sus familias y no de la informacion proporcionada en esta ficha; verificar en sus model cards oficiales. Zenith-4B se distingue por su orientacion declarada a codigo agentico y extraccion de documentos, pero carece de benchmarks publicados que permitan una comparacion cuantitativa de rendimiento.

## Limitaciones y advertencias

- Modelo entrenado principalmente en ingles; el rendimiento en castellano u otros idiomas no esta garantizado ni documentado.
- No se han publicado benchmarks, por lo que el rendimiento real en tareas de codigo, vision o extraccion de documentos es desconocido y debe validarse empiricamente.
- Riesgo de alucinacion inherente a los modelos de ~3B, especialmente en tareas de extraccion de documentos donde puede inventar campos o valores.
- Al ser una fusion TIES de modelos, puede heredar sesgos y comportamientos inconsistentes de los checkpoints originales, no documentados.
- La longitud de contexto no esta especificada; no asumir ventanas largas sin verificar en el modelo base.
- Aunque la licencia es Apache 2.0 (permite uso comercial), el modelo base y sus componentes deben verificarse por posibles restricciones adicionales no reflejadas en los tags.
- El repositorio GGUF no incluye el proyector multimodal (mmproj) segun los metadatos; para usar vision con llama.cpp podria requerirse un archivo mmproj separado no listado, lo que limitaria el uso multimodal en ese runtime.
- Sin likes ni pipeline declarado y con solo 599 descargas, es un modelo de baja traccion y escasa validacion por la comunidad.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/Zenith-4B-GGUF
- Modelo base: https://huggingface.co/KATHIR2006/Zenith-4B
- Cuantizaciones ponderadas/imatrix: https://huggingface.co/mradermacher/Zenith-4B-i1-GGUF
- Pagina de descargas de mradermacher: https://hf.tst.eu/model#Zenith-4B-GGUF
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Solicitudes de cuantizacion: https://huggingface.co/mradermacher/model_requests
- Analisis de tipos de cuantizacion (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
