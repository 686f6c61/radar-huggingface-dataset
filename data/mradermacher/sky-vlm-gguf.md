# mradermacher/Sky-VLM-GGUF

## Resumen

Sky-VLM-GGUF es la distribucion en formato GGUF del modelo vision-lenguaje Sky-VLM, publicado por el usuario mradermacher (autor conocido por cuantizar modelos para su uso con llama.cpp y derivados). El modelo original, llxs/Sky-VLM, es un VLM de aproximadamente 7.600 millones de parametros que combina un codificador visual con un modelo de lenguaje para tareas de comprension de imagenes y generacion de texto multimodal. Esta version GGUF esta pensada para inferencia local en hardware de consumo y entornos sin GPU dedicada de gran tamano.

El repositorio ofrece una bateria completa de cuantizaciones estaticas (desde Q2_K hasta f16, ademas de los ficheros mmproj necesarios para procesar imagenes), lo que permite ajustar el consumo de memoria desde unos 3 GB hasta 15 GB. La licencia Apache 2.0 facilita su uso comercial, aunque la informacion disponible sobre el modelo base es limitada en cuanto a arquitectura interna, datos de entrenamiento y benchmarks.

Es relevante ahora porque los VLM de ~7B en GGUF democratizan el analisis de imagenes en local: permiten desplegar capacidades multimodales sin depender de APIs externas, con control total sobre los datos y con opciones de cuantizacion que caben en GPUs de gama media o incluso en CPU.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-lenguaje (VLM) basada en transformers; arquitectura interna del LLM y del encoder visual no disponible |
| Parametros totales | 7.615.616.512 (~7,6B) |
| Parametros activos | no disponible (no es MoE segun la informacion disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | f16, Q8_0, Q6_K, Q5_K_M, Q5_K_S, Q4_K_M, Q4_K_S, IQ4_XS, Q3_K_L, Q3_K_M, Q3_K_S, Q2_K; mmproj en f16 y Q8_0 |
| Idiomas soportados | en (ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (safetensors en el modelo base) |

## Arquitectura y entrenamiento

Sky-VLM es un modelo multimodal que combina un codificador de vision con un modelo de lenguaje tipo transformer para procesar imagenes y texto conjuntamente. El repositorio GGUF incluye ficheros mmproj (multi-modal projection) separados, lo que confirma la presencia de un proyector que alinea las representaciones visuales con el espacio del LLM. No se dispone de informacion sobre el numero de capas, dimensiones ocultas, tipo de atencion ni detalles del encoder visual (por ejemplo, si es ViT, SigLIP o similar).

Tampoco hay datos publicados en la informacion disponible sobre el volumen de tokens de entrenamiento, la composicion del dataset, el uso de RLHF/DPO ni innovaciones tecnicas especificas (atencion lineal, decodificacion especulativa, etc.). La cuantizacion la ha realizado mradermacher con cuantizaciones estaticas; segun la model card, las cuantizaciones ponderadas con imatrix no estaban disponibles en el momento de la publicacion, aunque podrian solicitarse.

## Capacidades

- Comprension de imagenes: el modelo acepta imagenes junto con prompts de texto, gracias a los ficheros mmproj incluidos.
- Generacion de texto y respuestas conversacionales multimodales (etiqueta "conversational").
- Descripcion de imagenes, respuesta a preguntas visuales (VQA) y extraccion de informacion a partir de contenido grafico.
- Inferencia local mediante llama.cpp y ecosistema GGUF (Ollama, LM Studio, etc.).
- Capacidades de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: limitadas al ingles segun la etiqueta de idioma.
- Modo thinking, audio u otras capacidades especiales: no disponible.

## Casos de uso

- Descripcion automatica de imagenes: el modelo puede generar descripciones textuales de fotografias o capturas para accesibilidad, catalogacion o generacion de metadatos, ejecutandose en local con cuantizaciones Q4_K_M (~4,8 GB).
- Respuesta a preguntas sobre documentos escaneados: util para extraer datos de facturas, formularios o tickets en pipelines internos donde no se permite enviar imagenes a APIs externas.
- Moderacion de contenido visual: clasificacion y descripcion de imagenes subidas por usuarios en plataformas, con la ventaja de que todo el procesamiento ocurre en la infraestructura propia.
- Asistencia en entornos sin conectividad: despliegue en estaciones de trabajo o dispositivos edge con llama.cpp para analisis de imagenes en campo (inspeccion, inventario, documentacion tecnica).
- Prototipado rapido de aplicaciones multimodales: gracias a la licencia Apache 2.0 y a la variedad de cuantizaciones, sirve para validar productos de vision-lenguaje antes de invertir en modelos mayores.
- Investigacion academica en vision-lenguaje: permite experimentar con un VLM de ~7,6B en GPUs de consumo (por ejemplo, RTX 3060/4060 Ti con 8-12 GB de VRAM usando Q4 o Q5).
- Generacion de alt-text en CMS y herramientas de publicacion: integrable en flujos editoriales para sugerir texto alternativo a imagenes de forma automatizada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (pesos + overhead del runtime y del encoder visual):
  - Q2_K: ~3,1 GB de pesos; ~4-5 GB de VRAM total.
  - Q4_K_M: ~4,8 GB de pesos; ~6-7 GB de VRAM total, recomendado para GPUs de 8 GB.
  - Q5_K_M: ~5,5 GB de pesos; ~7-8 GB de VRAM total.
  - Q8_0: ~8,2 GB de pesos; ~10 GB de VRAM total.
  - f16: ~15,3 GB de pesos; ~17 GB de VRAM total.
  - Añadir ~1,0-1,5 GB si se usa el fichero mmproj para procesar imagenes.
- GPU recomendadas: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070/4080, RTX 4090, A100/H100 para despliegues de mayor concurrencia. En GPUs de 8 GB (RTX 3060 Ti, RTX 4060) cabe con Q4_K_S/Q4_K_M y mmproj Q8_0.
- Cabe en GPU de consumo: si, en la mayoria de GPUs modernas con 8 GB o mas usando cuantizaciones Q4/Q5.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, y cualquier runtime compatible con GGUF y mmproj. vLLM y TGI no soportan GGUF de forma nativa; para esos backends habria que usar el modelo base en safetensors.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Sky-VLM-GGUF (este) | ~7,6B | no disponible | Apache 2.0 | GGUF | VLM cuantizado, solo ingles |
| LLaVA-1.5-7B | ~7B | 4K (tipico) | Apache 2.0 / Llama segun variante | safetensors, GGUF | Referencia clasica en VLM de 7B |
| Qwen2-VL-7B | ~7B | 32K+ | Apache 2.0 | safetensors, GGUF | Multilingue, mejor soporte documental |
| InternVL2-8B | ~8B | 8K+ | MIT | safetensors, GGUF | Buen rendimiento en OCR y documentos |

La comparacion es orientativa: no se dispone de datos de benchmarks de Sky-VLM que permitan una comparacion cuantitativa con estas alternativas. La ventaja principal de este repositorio es la disponibilidad de cuantizaciones GGUF completas con licencia Apache 2.0.

## Limitaciones y advertencias

- Solo soporta ingles segun la etiqueta de idioma; el rendimiento en castellano no esta garantizado.
- No hay benchmarks publicados, por lo que el rendimiento real frente a otros VLM de 7B es desconocido.
- Riesgo de alucinacion inherente a los modelos de lenguaje y vision-lenguaje: puede describir elementos inexistentes en la imagen o inventar texto en OCR.
- La longitud de contexto no esta documentada; conviene validarla empiricamente antes de usarla con entradas largas.
- Las cuantizaciones muy bajas (Q2_K, Q3_K_S) degradan notablemente la calidad; para produccion se recomienda Q4_K_M o superior.
- El modelo base es de un autor poco conocido (llxs) y sin documentacion tecnica publica; la trazabilidad del entrenamiento es limitada.
- Aunque la licencia es Apache 2.0, conviene verificar que el modelo base no arrastre restricciones adicionales de sus componentes (encoder visual o LLM subyacente).
- El repositorio ocupa 70,4 GB en total por incluir todas las cuantizaciones; descargar solo los ficheros necesarios.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/Sky-VLM-GGUF
- Modelo base: https://huggingface.co/llxs/Sky-VLM
- Pagina de descargas de mradermacher: https://hf.tst.eu/model#Sky-VLM-GGUF
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Solicitudes de cuantizacion: https://huggingface.co/mradermacher/model_requests
- Grafico de calidad de cuantizaciones (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Analisis de cuantizaciones (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
