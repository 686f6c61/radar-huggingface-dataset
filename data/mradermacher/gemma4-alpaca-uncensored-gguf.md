# mradermacher/gemma4-alpaca-uncensored-GGUF

## Resumen

`mradermacher/gemma4-alpaca-uncensored-GGUF` es una coleccion de cuantizaciones en formato GGUF del modelo `renierd6/gemma4-alpaca-uncensored`, publicada por el usuario mradermacher, conocido en Hugging Face por generar versiones cuantizadas de modelos abiertos para su uso en llama.cpp y entornos de inferencia local. El modelo subyacente parte de la familia Gemma 4 de Google y ha sido ajustado con el dataset Alpaca en una variante "uncensored", es decir, con el filtrado de seguridad reducido o eliminado respecto al modelo original.

El modelo cuenta con aproximadamente 4.647 millones de parametros (4,6B) segun los pesos en safetensors del modelo base, y se distribuye bajo licencia Apache 2.0. El repositorio GGUF incluye cuantizaciones desde Q2_K hasta f16, ademas de ficheros mmproj para funcionalidad multimodal, lo que sugiere que el modelo base incorpora capacidad de vision.

La relevancia de esta ficha radica en que permite ejecutar un modelo de ~4,6B en hardware de consumo con cuantizaciones de 3-5 GB, aunque con las advertencias propias de un modelo "uncensored" y de un ajuste fino sobre Alpaca que puede degradar capacidades generales respecto al Gemma 4 original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (familia Gemma 4, detalles no disponibles) |
| Parametros totales | 4.647.450.147 (~4,6B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | f16, Q8_0, Q6_K, Q5_K_M, Q5_K_S, Q4_K_M, Q4_K_S, IQ4_XS, Q3_K_L, Q3_K_M, Q3_K_S, Q2_K; mmproj en f16 y Q8_0 |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (cuantizaciones); modelo base en safetensors |
| Modelo base | renierd6/gemma4-alpaca-uncensored |
| Tamano del repo | 49,6 GB |
| Descargas | 48 |
| Likes | 1 |

## Arquitectura y entrenamiento

El modelo base es un ajuste fino de la familia Gemma 4 de Google, segun indican las etiquetas (`gemma4`) y el nombre del repositorio. No se dispone de informacion detallada sobre el numero de capas, dimensiones ocultas, mecanismo de atencion ni composicion exacta del dataset de preentrenamiento en la informacion proporcionada. El ajuste fino se realizo sobre el dataset Alpaca, un conjunto de instrucciones en ingles generado con tecnicas de auto-instruccion, y la variante "uncensored" implica que se ha reducido o eliminado el alineamiento de seguridad del modelo original.

La cuantizacion la realiza mradermacher con herramientas propias (se menciona `quantize_version: 2`, `output_tensor_quantised: 1`, `convert_type: hf`), generando cuantizaciones estaticas K-quant y tambien cuantizaciones con imatrix en un repositorio separado (`gemma4-alpaca-uncensored-i1-GGUF`). La presencia de ficheros `mmproj` (multi-modal projection) indica que el modelo base soporta entrada de imagenes, aunque no se detalla el codificador visual ni la resolucion soportada.

## Capacidades

- Generacion de texto conversacional en ingles, orientada a instrucciones.
- Capacidad multimodal: los ficheros `mmproj-f16` y `mmproj-Q8_0` permiten procesar imagenes junto con texto en llama.cpp.
- Ajuste fino sobre Alpaca: responde a instrucciones y tareas de formato tipico (resumen, preguntas, reescritura).
- Variante "uncensored": menor rechazo a peticiones que el modelo original podria bloquear.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso explicito.
- Soporte multilingue limitado al ingles segun la etiqueta `language: en`.
- No se documenta modo "thinking" ni capacidades de audio.

## Casos de uso

- Prototipado local de asistentes conversacionales: con cuantizaciones Q4_K_M de ~3,5 GB, el modelo cabe en GPU de consumo y permite iterar rapidamente en un asistente de chat en ingles sin depender de la nube.
- Pruebas de robustez y red-teaming: al ser una variante "uncensored", resulta util para evaluar como responde un modelo sin filtros de seguridad ante prompts adversarios, siempre en entornos controlados.
- Investigacion sobre ajuste fino con Alpaca: sirve como referencia de como un dataset de instrucciones pequeno modifica el comportamiento de un modelo base Gemma 4 de ~4,6B.
- Procesamiento de imagenes con descripcion textual: usando los ficheros mmproj en llama.cpp, se puede construir un pipeline de captioning o VQA ligero en local.
- Despliegue en entornos con recursos limitados: las cuantizaciones Q2_K y Q3_K permiten ejecucion en CPU o GPUs con 4-6 GB de VRAM.
- Educacion y demostraciones: el tamano manejable y la licencia Apache 2.0 facilitan su uso en talleres y cursos sobre modelos de lenguaje.
- Generacion de texto creativo en ingles sin restricciones tematicas, con las advertencias de sesgo y alucinacion correspondientes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (peso de pesos + overhead de contexto):
  - Q2_K (~3,1 GB): ~4 GB de VRAM.
  - Q4_K_M (~3,5 GB): ~4,5-5 GB de VRAM.
  - Q6_K (~3,9 GB): ~5-5,5 GB de VRAM.
  - Q8_0 (~5,1 GB): ~6-7 GB de VRAM.
  - f16 (~9,4 GB): ~10-11 GB de VRAM.
- GPU recomendadas: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4090; en datacenter, A10G, L4, A100 y H100 (sobredimensionadas para este tamano).
- Cabe en GPU de consumo: si, desde una GTX 1660 6 GB con Q4_K_M hasta una RTX 4090 con f16.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, llama-cpp-python; el modelo base en safetensors puede servirse con vLLM o TGI, pero las cuantizaciones GGUF estan pensadas para llama.cpp.
- Latencia y throughput: no disponibles en la informacion proporcionada. Como referencia orientativa para ~4,6B en Q4_K_M, es esperable decenas de tokens por segundo en GPUs de consumo modernas, pero no se confirma con datos del autor.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| mradermacher/gemma4-alpaca-uncensored-GGUF | ~4,6B | no disponible | Apache 2.0 | GGUF | Variante uncensored, multimodal via mmproj |
| renierd6/gemma4-alpaca-uncensored | ~4,6B | no disponible | Apache 2.0 | safetensors | Modelo base sin cuantizar |
| Gemma 4 original (Google) | no disponible | no disponible | Gemma license | safetensors | Modelo de referencia con alineamiento de seguridad |
| Llama 3.2 3B Instruct | 3,2B | 128k | Llama 3.2 Community License | safetensors, GGUF | Alternativa de tamano similar con contexto largo documentado |

No se dispone de datos de rendimiento comparativo entre estos modelos en la informacion proporcionada.

## Limitaciones y advertencias

- Modelo "uncensored": el alineamiento de seguridad ha sido reducido o eliminado, por lo que puede generar contenido ofensivo, ilegal o danino. No apto para produccion orientada a usuarios finales sin capas de moderacion adicionales.
- Ajuste fino sobre Alpaca: este dataset es pequeno y de calidad heterogenea; es probable que el modelo haya perdido capacidades del Gemma 4 original en razonamiento, codigo y matematicas, aunque no se aportan datos que lo cuantifiquen.
- Idioma: solo se declara soporte de ingles; el rendimiento en castellano no esta garantizado.
- Riesgo de alucinacion: inherente a modelos de este tamano y agravado por el ajuste fino sobre instrucciones sinteticas.
- Sesgos: no documentados por el autor, pero heredados del preentrenamiento de Gemma 4 y del dataset Alpaca.
- Licencia Apache 2.0 declarada, pero conviene verificar la licencia del modelo Gemma 4 original, ya que los terminos de Gemma pueden imponer restricciones adicionales que prevalezcan sobre la licencia declarada en este repositorio.
- Contexto no documentado: se desconoce la ventana maxima, lo que dificulta planificar casos de uso con documentos largos.
- Repositorio con muy poca traccion (48 descargas, 1 like): sin validacion comunitaria significativa.
- Fecha de creacion 2026-04-13 y actualizacion 2026-11-02: verificar que el modelo base sigue disponible y que no ha sido retirado.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/gemma4-alpaca-uncensored-GGUF
- Modelo base: https://huggingface.co/renierd6/gemma4-alpaca-uncensored
- Cuantizaciones con imatrix: https://huggingface.co/mradermacher/gemma4-alpaca-uncensored-i1-GGUF
- Pagina de descargas del autor: https://hf.tst.eu/model#gemma4-alpaca-uncensored-GGUF
- FAQ y peticiones de modelos: https://huggingface.co/mradermacher/model_requests
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafico de calidad de cuantizaciones (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizaciones: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
