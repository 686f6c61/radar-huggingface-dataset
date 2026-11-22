# mradermacher/LightOnOCR-3-0.8B-MTP-Repacked-i1-GGUF

## Resumen

LightOnOCR-3-0.8B-MTP-Repacked-i1-GGUF es una cuantizacion GGUF del modelo LightOnOCR-3-0.8B-MTP-Repacked, un modelo vision-lenguaje especializado en reconocimiento optico de caracteres (OCR) y comprension de documentos, publicado originalmente por prithivMLmods. Esta version concreta la produce mradermacher, un cuantizador independiente conocido por generar versiones imatrix de modelos open source para su uso con llama.cpp y otros motores de inferencia local.

El modelo base cuenta con 772.845.888 parametros (aproximadamente 0,8 mil millones), lo que lo situa en la categoria de modelos compactos. Esta orientado a tareas de extraccion de texto en PDF, tablas, formularios y grounding visual, es decir, localizacion de elementos dentro de la imagen del documento. La nomenclatura "MTP" sugiere multi-token prediction, una tecnica de decodificacion que permite predecir varios tokens por paso para acelerar la generacion, aunque la model card no detalla su implementacion.

La relevancia de esta ficha radica en que ofrece una via practica para ejecutar un OCR basado en transformer en hardware de consumo: los cuantizados i1 ocupan entre 0,5 y 0,7 GB, lo que permite desplegarlo en GPUs modestas o incluso en CPU. La licencia Apache 2.0 facilita su uso comercial, si bien el modelo solo declara soporte para ingles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | vision-lenguaje (transformer) con soporte MTP; detalles internos no disponibles |
| Parametros totales | 772.845.888 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | i1-Q2_K, i1-Q3_K_S, i1-Q3_K_M, i1-Q3_K_L, i1-IQ3_S, i1-IQ3_M, i1-IQ4_XS, i1-IQ4_NL, i1-Q4_0, i1-Q4_K_S, i1-Q4_K_M, i1-Q4_1, i1-Q5_K_S, i1-Q5_K_M, i1-Q6_K, ademas de fichero imatrix |
| Idiomas soportados | en (ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (con fichero imatrix para generar cuantizaciones propias) |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna del modelo base mas alla de su naturaleza vision-lenguaje y la presencia de MTP (multi-token prediction). Los tags de la model card apuntan a un modelo conversacional orientado a OCR, comprension de documentos, grounding visual, PDF, tablas y formularios. No se especifican el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO.

El proceso de cuantizacion aplicado por mradermacher utiliza calibracion imatrix (importance matrix) con la herramienta de llama.cpp, lo que produce cuantizados de mayor calidad que los estaticos equivalentes, especialmente en rangos bajos como IQ3 e IQ4. El repositorio incluye tanto los GGUF listos para usar como el fichero imatrix, que permite al usuario generar sus propias cuantizaciones con la misma calibracion. Existe ademas una version estatica de los cuantizados en un repositorio separado.

## Capacidades

- Reconocimiento optico de caracteres (OCR) sobre imagenes de documentos.
- Comprension de documentos: extraccion de estructura y contenido de PDF.
- Extraccion y reconstruccion de tablas.
- Procesamiento de formularios.
- Grounding visual: localizacion de elementos (texto, campos) dentro de la imagen.
- Generacion de texto conversacional en ingles.
- Compatibilidad con text-generation-inference y llama.cpp segun los tags del repositorio.
- Soporte de multi-token prediction (MTP) segun la nomenclatura del modelo base.
- No se documentan capacidades de tool calling, agentes, audio ni otros modos especiales.

## Casos de uso

- Digitalizacion masiva de facturas y albaranes: el modelo extrae texto y estructura de documentos escaneados, y su tamano reducido permite procesar lotes grandes en una sola GPU de consumo.
- Extraccion de tablas de informes financieros: convierte tablas de PDF en datos estructurados, aprovechando la capacidad de comprension de tablas declarada en los tags.
- Procesamiento de formularios administrativos: identifica campos y valores mediante grounding visual, util para automatizar la entrada de datos.
- Archivado y busqueda documental: genera transcripciones de documentos escaneados para indexarlas en un motor de busqueda interno.
- Despliegue en el borde (edge): los cuantizados de 0,5 a 0,7 GB permiten ejecutar OCR en equipos con poca VRAM o en CPU, sin depender de servicios en la nube.
- Preprocesado en pipelines de RAG: convierte PDF en texto antes de la indexacion vectorial, con coste computacional bajo y licencia permisiva para uso comercial.
- Prototipado rapido con llama.cpp: permite validar la calidad de OCR de un modelo pequeno antes de invertir en infraestructura mayor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: entre 0,5 y 0,7 GB para los cuantizados i1-Q2_K a i1-Q6_K, segun el fichero elegido.
- Cabe en cualquier GPU de consumo con al menos 1 GB de VRAM libre; tambien es viable en CPU.
- GPU recomendadas: no se especifican; por tamano, cualquier RTX o GTX moderna es suficiente, asi como A100 o H100 si se busca throughput alto.
- Opciones de despliegue: llama.cpp, text-generation-inference (segun tags) y cualquier motor compatible con GGUF; Ollama y vLLM no se mencionan en la informacion disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| LightOnOCR-3-0.8B-MTP-Repacked-i1-GGUF (este) | 772.845.888 | no disponible | Apache 2.0 | GGUF (i1) | Cuantizacion imatrix, solo ingles |
| LightOnOCR-3-0.8B-MTP-Repacked-GGUF (estatico) | 772.845.888 | no disponible | Apache 2.0 | GGUF | Mismo modelo base, cuantizados estaticos |
| LightOnOCR-3-0.8B-MTP-Repacked (original) | 772.845.888 | no disponible | Apache 2.0 | safetensors | Pesos completos en transformers |

No se dispone de datos de benchmarks ni de otros modelos comparables de la misma categoria en la informacion proporcionada.

## Limitaciones y advertencias

- Solo soporta ingles segun la model card; el rendimiento en castellano no esta documentado.
- No se publican benchmarks, por lo que la calidad real del OCR no puede verificarse con datos.
- Riesgo de alucinacion inherente a los modelos generativos: puede inventar texto o estructura en documentos de baja calidad.
- La cuantizacion introduce perdida de precision; los cuantizados de 2 y 3 bits pueden degradar la calidad del OCR en documentos complejos.
- No se detalla la longitud de contexto, lo que dificulta planificar el procesamiento de documentos muy largos.
- Aunque la licencia es Apache 2.0, conviene revisar la model card del modelo base por si hubiera condiciones adicionales no reflejadas en esta ficha.
- El repositorio es una cuantizacion de terceros: la responsabilidad sobre el comportamiento del modelo recae en el modelo base de prithivMLmods.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mradermacher/LightOnOCR-3-0.8B-MTP-Repacked-i1-GGUF
- Modelo base: https://huggingface.co/prithivMLmods/LightOnOCR-3-0.8B-MTP-Repacked
- Cuantizados estaticos: https://huggingface.co/mradermacher/LightOnOCR-3-0.8B-MTP-Repacked-GGUF
- Pagina de descargas de mradermacher: https://hf.tst.eu/model#LightOnOCR-3-0.8B-MTP-Repacked-i1-GGUF
- Peticiones de cuantizacion: https://huggingface.co/mradermacher/model_requests
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Analisis de tipos de cuantizacion (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
