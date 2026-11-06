# prithivMLmods/LightOnOCR-3-4B-MTP-Repacked

## Resumen

LightOnOCR-3-4B-MTP-Repacked es un reempaquetado del modelo LightOnOCR-3-4B de LightOn, el miembro de mayor tamano de la familia LightOnOCR-3 de modelos vision-lenguaje para OCR de extremo a extremo. El modelo original se construye sobre la arquitectura Qwen3.5-4B y esta disenado para sustituir pipelines complejos de comprension documental por un unico modelo capaz de transcribir texto, localizar elementos visuales con bounding boxes y extraer datos de graficos y tablas. Este reempaquetado, publicado por prithivMLmods, anade soporte de Multi-Token Prediction (MTP) con decodificacion especulativa integrada en los propios pesos, ademas de una coleccion de cuantizaciones GGUF listas para inferencia local.

La relevancia del modelo radica en su enfoque de "un solo modelo para todo el documento": con un prompt vacio realiza transcripcion de texto de alta calidad, y con el prompt `grounding` devuelve bounding boxes etiquetadas, descripciones de imagenes y tablas HTML estructuradas a partir de graficos. Esta pensado para documentos con layouts complejos (tablas, recibos, formularios, documentos multicolumna y notacion matematica) y funciona mejor con documentos preprocesados a 400 DPI y una dimension maxima de 2048 px.

El repositorio incluye pesos en safetensors (BF16, en tres shards), el proyector multimodal en BF16 y hasta nueve variantes GGUF que van desde Q3_K_M (2,32 GB) hasta BF16 (8,67 GB), lo que permite desplegarlo tanto en servidores con vLLM como en equipos de consumo mediante llama.cpp. La licencia es Apache 2.0 y el unico idioma declarado es el ingles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer vision-lenguaje basada en Qwen3.5-4B, con cabezas de Multi-Token Prediction (MTP) para decodificacion especulativa |
| Parametros totales | 4.659.865.088 (4,66 mil millones) |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | BF16, Q8_0, Q6_K, Q5_K_M, Q5_K_S, Q4_K_M, Q4_K_S, Q3_K_L, Q3_K_M; proyector multimodal en BF16 |
| Idiomas soportados | ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (BF16, 3 shards), GGUF (multitud de cuantizaciones + mmproj-bf16) |

## Arquitectura y entrenamiento

El modelo sigue una arquitectura transformer multimodal de tipo image-text-to-text construida sobre Qwen3.5-4B, con un proyector multimodal que conecta el codificador visual con el decodificador de lenguaje. La innovacion principal de este reempaquetado es la incorporacion de Multi-Token Prediction (MTP): los pesos incluyen cabezas de salida adicionales que predicen varios tokens futuros en un unico forward pass, lo que permite decodificacion especulativa sin necesidad de un modelo borrador separado. Esto acelera la inferencia local en comparacion con la decodificacion autorregresiva clasica.

No se dispone de informacion detallada sobre el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO. El modelo esta optimizado para integracion con Transformers y vLLM, y el reempaquetado anade compatibilidad con llama.cpp y text-generation-inference. El preprocesado recomendado de documentos es 400 DPI con dimension maxima de 2048 px, lo que sugiere que el codificador visual fue ajustado para resoluciones altas propias de documentos escaneados.

## Capacidades

- Transcripcion OCR de extremo a extremo: genera texto a partir de imagenes de documentos con un prompt vacio.
- Visual grounding: con el prompt `grounding` devuelve bounding boxes etiquetadas para todos los elementos del documento.
- Comprension de layouts complejos: tablas, recibos, formularios, documentos multicolumna y notacion matematica.
- Extraccion de datos de graficos a tablas HTML estructuradas.
- Generacion de descripciones cortas para imagenes dentro de documentos.
- Procesamiento de PDF e imagenes en pipelines de document understanding.
- Decodificacion especulativa integrada (MTP) para acelerar la inferencia.
- Conversacional: incluye plantilla de chat (`chat_template.jinja`) para interaccion multi-turno.
- Compatibilidad con endpoints, text-generation-inference y llama.cpp.
- Capacidades multilingues: limitadas al ingles segun la model card.

## Casos de uso

- Digitalizacion masiva de archivos: el modelo transcribe documentos escaneados a texto plano con un prompt vacio, lo que permite procesar lotes de PDF a 400 DPI y 2048 px de dimension maxima sin pipelines OCR separados de deteccion y reconocimiento.
- Extraccion de datos de facturas y recibos: con el prompt `grounding` localiza campos y devuelve bounding boxes etiquetadas, facilitando la captura estructurada de importes, fechas y emisores en sistemas de contabilidad.
- Procesamiento de formularios: identifica y transcribe campos de formularios complejos, adecuado para administraciones publicas y back-office que manejan volumen alto de documentos con layouts heterogeneos.
- Conversion de tablas y graficos a HTML: extrae datos numericos de graficos y tablas de informes a tablas HTML estructuradas, util para pipelines de analisis de datos y generacion de informes automaticos.
- Enriquecimiento de repositorios documentales: genera descripciones de imagenes y bounding boxes para indexar visualmente documentos en sistemas de busqueda o gestores documentales.
- OCR en local con recursos limitados: las cuantizaciones Q4_K_M (2,78 GB) y Q3_K_M (2,32 GB) permiten ejecutar el modelo en equipos sin GPU dedicada mediante llama.cpp, con la aceleracion MTP integrada.
- Integracion en pipelines de CI/CD documental: la compatibilidad con vLLM, TGI y endpoints permite desplegar el modelo como servicio y encadenarlo a flujos de validacion y post-procesado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para BF16: aproximadamente 9,3 GB para los pesos (8,67 GB) mas overhead de activaciones y cache KV; en la practica se recomienda 12 GB o mas.
- VRAM estimada para Q8_0: alrededor de 4,6 GB de pesos, mas overhead; apto para GPUs de 8 GB.
- VRAM estimada para Q4_K_M: 2,78 GB de pesos mas el proyector multimodal (676 MB) y overhead; cabe en GPUs de 6-8 GB.
- VRAM estimada para Q3_K_M: 2,32 GB de pesos; la opcion mas ligera para GPUs de 4-6 GB o inferencia en CPU.
- GPU recomendadas: A100 o H100 para despliegue en produccion con vLLM y BF16; RTX 4090 o RTX 3090 para BF16 o Q8_0 en local; RTX 4060 Ti, RTX 3060 o inferiores para cuantizaciones Q4 y Q3.
- Cabe en GPU de consumo: si, en todas las cuantizaciones GGUF; en BF16 requiere al menos 12 GB de VRAM.
- Opciones de despliegue: Transformers, vLLM, text-generation-inference, llama.cpp y endpoints compatibles.
- Latencia y throughput: no disponibles; la decodificacion especulativa MTP deberia reducir la latencia frente a la decodificacion autorregresiva clasica, pero no se han publicado cifras.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formatos |
|---|---|---|---|---|---|
| LightOnOCR-3-4B-MTP-Repacked | 4,66 mil millones | no disponible | en | Apache 2.0 | safetensors, GGUF |
| LightOnOCR-3-4B (base) | 4,66 mil millones | no disponible | en | Apache 2.0 | safetensors |
| Qwen3.5-4B | 4 mil millones (aprox.) | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de rendimiento comparativo entre estos modelos en la informacion proporcionada.

## Limitaciones y advertencias

- Solo soporta ingles segun la model card; el rendimiento en otros idiomas no esta garantizado.
- No se han publicado datos de sesgos; al ser un modelo OCR entrenado sobre documentos, puede heredar sesgos de los corpus de entrenamiento.
- Riesgo de alucinacion en la transcripcion de documentos con baja calidad de imagen, layouts atipicos o notacion matematica compleja; se recomienda validacion en produccion.
- La longitud de contexto no esta documentada, lo que dificulta planificar el procesamiento de documentos muy largos o multi-pagina.
- El rendimiento depende fuertemente del preprocesado: se recomienda 400 DPI y 2048 px de dimension maxima; desviarse de estas condiciones puede degradar la calidad.
- El reempaquetado MTP anade cabezas de prediccion que deben ser soportadas por el runtime; verificar compatibilidad con la version de llama.cpp o Transformers utilizada.
- Licencia Apache 2.0 permite uso comercial, pero se debe conservar el aviso de licencia y atribucion correspondiente.
- El repositorio tiene 0 descargas y 1 like en el momento de la consulta, lo que indica poca validacion comunitaria del reempaquetado.

## Enlaces

- [Hugging Face: prithivMLmods/LightOnOCR-3-4B-MTP-Repacked](https://huggingface.co/prithivMLmods/LightOnOCR-3-4B-MTP-Repacked)
- [Modelo base: lightonai/LightOnOCR-3-4B](https://huggingface.co/lightonai/LightOnOCR-3-4B)
- [Carpeta GGUF del repositorio](https://huggingface.co/prithivMLmods/LightOnOCR-3-4B-MTP-Repacked/tree/main/GGUF)
- [Perfil del autor: prithivMLmods](https://huggingface.co/prithivMLmods)
- [Perfil de LightOn: lightonai](https://huggingface.co/lightonai)
