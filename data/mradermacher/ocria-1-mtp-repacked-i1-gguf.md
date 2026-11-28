# mradermacher/OCRia-1-MTP-Repacked-i1-GGUF

## Resumen
OCRia-1-MTP-Repacked-i1-GGUF es la version cuantizada en formato GGUF, generada con imatrix, del modelo OCRia-1-MTP-Repacked publicado por prithivMLmods. Se trata de un modelo multimodal especializado en OCR y parseo de documentos (PDF, tablas, graficos) que produce salida en Markdown, orientado a tareas de document parsing y evaluado en el benchmark ParseBench. Esta version concreta la distribuye mradermacher, un autor conocido por producir cuantizaciones GGUF de alta calidad con matrices de importancia (imatrix) para su uso en llama.cpp y entornos de inferencia local.

El modelo base incorpora la etiqueta MTP (multi-token prediction) y se distribuye empaquetado como "MTP-Repacked", lo que sugiere una reconfiguracion de los pesos orientada a decodificacion especulativa. El repositorio incluye la etiqueta speculative-decoding y text-generation-inference, lo que indica que el modelo esta pensado para acelerar la generacion mediante prediccion de multiples tokens. Con aproximadamente 4.960 millones de parametros, se situa en la categoria de modelos pequenos-medios, lo que facilita su despliegue en hardware de consumo.

La relevancia actual de esta ficha radica en que ofrece una via practica para ejecutar un modelo de OCR y parseo de documentos de forma local, con cuantizaciones que van desde 2,3 GB (i1-Q2_K) hasta 4,2 GB (i1-Q6_K), lo que permite desplegarlo en GPUs consumer y en CPU. La licencia es especifica del modelo (ocria-1-license), por lo que su uso comercial requiere revisar los terminos del enlace de licencia del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo multimodal con soporte de vision y etiqueta MTP) |
| Parametros totales | 4.962.050.048 (~4,96 mil millones) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | i1-Q2_K, i1-Q3_K_S, i1-IQ3_S, i1-IQ3_M, i1-Q3_K_M, i1-Q3_K_L, i1-IQ4_XS, i1-Q4_0, i1-Q4_K_S, i1-IQ4_NL, i1-Q4_K_M, i1-Q4_1, i1-Q5_K_S, i1-Q5_K_M, i1-Q6_K, ademas de fichero imatrix |
| Idiomas soportados | en (ingles) |
| Licencia | ocria-1-license (license: other) |
| Formato de pesos | GGUF (cuantizaciones i1 con imatrix); el modelo base en safetensors |

## Arquitectura y entrenamiento
No se dispone de informacion detallada sobre la arquitectura interna en la documentacion proporcionada. Las etiquetas del repositorio indican que se trata de un modelo multimodal con capacidades de vision (la model card senala explicitamente "This is a vision model") y que incorpora MTP (multi-token prediction), una tecnica orientada a la decodificacion especulativa y a la aceleracion de la generacion. El empaquetado "MTP-Repacked" sugiere que los pesos del modelo original han sido reconfigurados para exponer las cabezas de prediccion multi-token de forma utilizable en herramientas de inferencia.

No se especifican en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron tecnicas de RLHF o DPO. Tampoco se detalla si emplea atencion lineal, transformers clasicos o una arquitectura hibrida. Las cuantizaciones i1 se han generado con matrices de importancia (imatrix), lo que mejora la calidad respecto a cuantizaciones estaticas del mismo tamano, especialmente en rangos bajos (IQ3, IQ4).

## Capacidades
- Reconocimiento optico de caracteres (OCR) sobre imagenes de documentos y PDF.
- Parseo de documentos a Markdown, incluyendo conversion de estructura y contenido.
- Extraccion y reconstruccion de tablas.
- Interpretacion de graficos presentes en documentos.
- Generacion de texto conversacional (etiqueta conversational).
- Decodificacion especulativa mediante prediccion multi-token (MTP), orientada a reducir latencia.
- Compatibilidad con text-generation-inference y endpoints compatibles.
- Capacidades multilingues: limitadas al ingles segun la etiqueta de idioma del repositorio.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.

## Casos de uso
- Digitalizacion de facturas y albaranes: el modelo puede procesar imagenes de documentos comerciales y extraer su contenido estructurado en Markdown, lo que facilita su volcado a sistemas de gestion contable. Su naturaleza de vision model y su entrenamiento en parseo de documentos lo hacen adecuado para este flujo.
- Conversion de PDF tecnicos a Markdown: util para construir bases de conocimiento y pipelines RAG, ya que preserva estructura, tablas y referencias a graficos en un formato legible por modelos de lenguaje.
- Extraccion de tablas de informes financieros: el modelo esta etiquetado especificamente para tablas, por lo que puede reconstruir matrices de datos a partir de capturas o paginas escaneadas y devolverlas en Markdown tabulado.
- Interpretacion de graficos en articulos cientificos: la etiqueta charts indica capacidad para describir o transcribir el contenido de graficos, util en revisiones bibliograficas automatizadas.
- Procesamiento local en entornos con requisitos de privacidad: al distribuirse en GGUF con cuantizaciones de 3-4 GB, puede ejecutarse en una estacion de trabajo sin enviar documentos sensibles a la nube, lo que encaja en sectores como legal o salud.
- Aceleracion de pipelines de ingestion documental: gracias al soporte MTP y decodificacion especulativa, puede integrarse en servidores de inferencia (por ejemplo, con llama.cpp o TGI) para procesar lotes de documentos con menor latencia por token.
- Prototipado rapido en GPUs consumer: las cuantizaciones i1-Q4_K_M (3,3 GB) permiten probar el modelo en tarjetas de 8 GB de VRAM, lo que facilita la evaluacion antes de invertir en infraestructura mayor.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la informacion disponible. El repositorio menciona la etiqueta parsebench, lo que indica que el modelo base fue evaluado en dicho benchmark, pero no se incluyen cifras concretas en la documentacion proporcionada.

## Requisitos de hardware
- VRAM estimada para inferencia: aproximadamente 2,5-3,5 GB con cuantizaciones i1-Q3/IQ3, 3,1-3,7 GB con i1-Q4/IQ4, y 4,2 GB con i1-Q6_K, mas el overhead del contexto y, en su caso, del proyector multimodal.
- GPU recomendadas: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070/4080/4090 para uso local; A100 o H100 para despliegues de mayor concurrencia.
- Cabe en GPU consumer: si, en tarjetas con 6-8 GB de VRAM o superiores usando cuantizaciones Q4; en 4 GB solo con cuantizaciones Q2/Q3 y contexto reducido.
- Opciones de despliegue: llama.cpp, Ollama, text-generation-inference (TGI), y cualquier runtime compatible con GGUF; los ficheros mmproj para vision se encuentran en el repositorio estatico enlazado por el autor.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Formato |
|---|---|---|---|---|---|
| OCRia-1-MTP-Repacked-i1-GGUF (este) | ~4,96 mil millones | no disponible | OCR y parseo de documentos, vision, MTP | ocria-1-license | GGUF (i1) |
| OCRia-1-MTP-Repacked (base) | ~4,96 mil millones | no disponible | OCR y parseo de documentos, vision, MTP | ocria-1-license | safetensors |
| OCRia-1-MTP-Repacked-GGUF (estatico) | ~4,96 mil millones | no disponible | OCR y parseo de documentos, vision, MTP | ocria-1-license | GGUF (estatico) |

No se dispone de informacion sobre otros modelos comparables de la misma categoria en la documentacion proporcionada.

## Limitaciones y advertencias
- Idioma: el repositorio declara unicamente ingles (en); el rendimiento en castellano u otros idiomas no esta garantizado.
- Licencia: se trata de una licencia propia (ocria-1-license, license: other) enlazada desde el modelo base; es imprescindible revisar sus terminos antes de cualquier uso comercial.
- Alucinacion: al ser un modelo generativo aplicado a OCR y parseo, puede introducir texto o estructura inexistente en documentos con baja calidad de imagen, tablas complejas o graficos densos; conviene validar la salida en produccion.
- Contexto: no se especifica la longitud de contexto soportada, lo que limita la planificacion de documentos muy extensos.
- Vision: los ficheros mmproj necesarios para el procesamiento de imagenes se encuentran en el repositorio estatico, no en este repositorio i1; hay que descargarlos por separado.
- Cuantizaciones bajas: las variantes Q2 y Q3 pueden degradar notablemente la precision en tareas de OCR y tablas; el autor recomienda IQ3_XXS o superiores frente a Q2_K.
- Informacion incompleta: no se detallan arquitectura exacta, datos de entrenamiento ni benchmarks, lo que dificulta una evaluacion rigurosa previa al despliegue.

## Enlaces
- Repositorio Hugging Face: https://huggingface.co/mradermacher/OCRia-1-MTP-Repacked-i1-GGUF
- Modelo base: https://huggingface.co/prithivMLmods/OCRia-1-MTP-Repacked
- Repositorio de cuantizaciones estaticas (incluye mmproj): https://huggingface.co/mradermacher/OCRia-1-MTP-Repacked-GGUF
- Pagina de descargas del autor: https://hf.tst.eu/model#OCRia-1-MTP-Repacked-i1-GGUF
- Licencia del modelo base: https://huggingface.co/llamaindex/OCRia-1/blob/main/LICENSE
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafico comparativo de cuantizaciones (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Analisis de cuantizaciones (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- FAQ y solicitudes de cuantizacion: https://huggingface.co/mradermacher/model_requests
