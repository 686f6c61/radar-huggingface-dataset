# mradermacher/dse-qwen2-2b-mrl-v1-GGUF

## Resumen

dse-qwen2-2b-mrl-v1-GGUF es la version cuantizada en formato GGUF del modelo dse-qwen2-2b-mrl-v1, desarrollado originalmente por MrLight y convertido a GGUF por mradermacher. Se trata de un modelo de recuperacion de informacion visual (visual document retrieval) construido sobre Qwen2-VL, disenado para generar embeddings de documentos e imagenes que permiten busquedas semanticas sobre colecciones de documentos visuales. El modelo base forma parte de la familia DSE (Document Screenshot Embedding) y emplea Matryoshka Representation Learning (MRL), lo que permite truncar los embeddings a distintas dimensiones sin reentrenar.

El modelo resuelve el problema de la busqueda sobre documentos que no tienen texto extraible de forma fiable (PDFs escaneados, presentaciones, formularios, capturas de pantalla). En lugar de depender de OCR y pipelines de texto, procesa directamente la imagen del documento y produce un vector denso que puede indexarse en un motor de busqueda vectorial. Es relevante ahora porque la recuperacion multimodal sobre documentos corporativos se ha convertido en una necesidad practica y este modelo ofrece una alternativa compacta (1.777 millones de parametros) ejecutable en hardware modesto gracias a las cuantizaciones GGUF.

La relevancia de esta ficha concreta es que el repositorio de mradermacher proporciona las cuantizaciones GGUF listas para usar con llama.cpp y herramientas compatibles, lo que rebaja la barrera de entrada respecto al modelo original en transformers. El modelo soporta ingles y frances, tiene licencia Apache 2.0 y esta pensado para tareas de retrieval, no para generacion de texto libre.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal basada en Qwen2-VL (vision-lenguaje) con embeddings densos y Matryoshka Representation Learning |
| Parametros totales | 1.777.088.000 (1,78 B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16, mmproj-fp16 (suplemento multimodal) |
| Idiomas soportados | en, fr |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizaciones) y safetensors en el modelo base; incluye mmproj-fp16 para el proyector multimodal |

## Arquitectura y entrenamiento

El modelo base es un encoder de documentos visuales construido sobre Qwen2-VL de 2B parametros. Procesa la imagen de un documento (captura de pantalla, pagina escaneada) y genera un embedding denso que se compara por similitud coseno contra embeddings de consultas textuales. La innovacion principal es el uso de Matryoshka Representation Learning (MRL), que entrena el modelo para que las primeras dimensiones del vector concentren la informacion mas discriminativa, permitiendo truncar el embedding a 64, 128, 256, 512 o dimensiones completas segun el compromiso entre coste de almacenamiento y calidad de recuperacion.

Los datos de entrenamiento declarados incluyen Tevatron/docmatix-ir, HuggingFaceM4/Docmatix, Tevatron/msmarco-passage-aug, vidore/colpali_train_set y Tevatron/wiki-ss-nq, una mezcla orientada a recuperacion de documentos y pares consulta-documento. El modelo esta etiquetado con el tag vidore, lo que lo vincula al benchmark ViDoRe de recuperacion visual de documentos. No se dispone de informacion sobre el numero exacto de tokens de entrenamiento, la composicion detallada del dataset ni si se aplicaron fases de RLHF o DPO; el modelo es un encoder de retrieval, por lo que no se espera un ajuste conversacional.

## Capacidades

- Generacion de embeddings densos de documentos visuales para busqueda semantica.
- Codificacion de consultas textuales en el mismo espacio vectorial que los documentos.
- Soporte de Matryoshka Representation Learning: embeddings truncables a distintas dimensiones.
- Procesamiento multimodal de imagenes de documentos (via mmproj-fp16 en el ecosistema GGUF).
- Recuperacion multilingue limitada a ingles y frances.
- Integracion en pipelines de retrieval (indexacion + busqueda por similitud).
- No esta disenado para generacion de texto libre, razonamiento conversacional ni tool calling.

## Casos de uso

- Busqueda sobre PDFs escaneados: el modelo indexa la imagen de cada pagina y permite consultas en lenguaje natural sin necesidad de OCR previo, adecuado para archivos historicos o documentos con maquetacion compleja.
- Recuperacion en bases documentales corporativas: se generan embeddings de facturas, contratos y formularios y se consultan por similitud, aprovechando que el modelo procesa la apariencia visual del documento.
- Sistemas RAG multimodales: el modelo actua como retriever en la fase de recuperacion, devolviendo las paginas relevantes que luego se pasan a un modelo generativo para la respuesta.
- Busqueda en presentaciones y diapositivas: las slides suelen tener poco texto extraible y mucha informacion visual; el modelo captura el contenido grafico y textual de forma conjunta.
- Moderacion y clasificacion documental: los embeddings permiten agrupar y deduplicar documentos visualmente similares en grandes repositorios.
- Despliegue en entornos con recursos limitados: las cuantizaciones Q4_K_M (1,2 GB) permiten ejecutar el modelo en CPU o GPUs de consumo, habilitando prototipos de retrieval visual sin infraestructura dedicada.
- Investigacion en recuperacion multimodal: el modelo sirve como baseline reproducible para experimentos con ViDoRe y para comparar estrategias de truncado MRL.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1,2 GB con Q4_K_M, 2,0 GB con Q8_0 y 3,7 GB con f16, mas el suplemento mmproj-fp16 (1,4 GB) para el procesamiento de imagenes.
- GPU recomendadas: cualquier GPU con al menos 4-6 GB de VRAM para f16 con proyector multimodal; RTX 3060, RTX 4060, RTX 4090, A100 o H100 para despliegues de mayor throughput.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU moderna con 4 GB o mas; las cuantizaciones Q4_K_S y Q4_K_M son las recomendadas por el autor para velocidad.
- Opciones de despliegue: llama.cpp y herramientas basadas en GGUF (Ollama, LM Studio, servidores compatibles con endpoints); el modelo base en transformers requiere el stack de Qwen2-VL. No se menciona soporte explicito de vLLM o TGI en la informacion disponible.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| dse-qwen2-2b-mrl-v1 (esta ficha) | 1,78 B | no disponible | en, fr | Apache 2.0 | GGUF, safetensors |
| ColPali (basado en PaliGemma) | no disponible en la informacion | no disponible | no disponible | no disponible | no disponible |
| ColQwen2 | no disponible en la informacion | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de rendimiento comparativo en la informacion proporcionada para establecer una comparacion cuantitativa con alternativas.

## Limitaciones y advertencias

- Modelo especializado en retrieval: no genera texto ni mantiene conversaciones; usarlo fuera de tareas de embedding produce resultados sin sentido.
- Cobertura linguistica limitada a ingles y frances; el rendimiento en castellano no esta garantizado ni documentado.
- Riesgo de sesgo en los embeddings: los datasets de entrenamiento (Docmatix, MS MARCO, etc.) pueden introducir sesgos de dominio y de idioma que afectan a la recuperacion.
- La cuantizacion degrada la calidad de los embeddings; las variantes Q2_K y Q3 pueden reducir la precision de recuperacion de forma apreciable.
- El truncado MRL reduce la dimension del vector a costa de calidad; conviene validar la dimension elegida sobre el corpus concreto.
- Licencia Apache 2.0 permite uso comercial, pero el modelo base y los datasets subyacentes pueden tener condiciones adicionales que conviene revisar.
- No hay informacion publica sobre latencia, throughput ni resultados de benchmarks en esta ficha, lo que dificulta estimar el rendimiento en produccion sin pruebas propias.
- El repositorio GGUF tiene un tamano de 17,5 GB por incluir todas las variantes; descargar solo la cuantizacion necesaria.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/dse-qwen2-2b-mrl-v1-GGUF
- Modelo base: https://huggingface.co/MrLight/dse-qwen2-2b-mrl-v1
- Cuantizaciones imatrix: https://huggingface.co/mradermacher/dse-qwen2-2b-mrl-v1-i1-GGUF
- Pagina de descargas del autor: https://hf.tst.eu/model#dse-qwen2-2b-mrl-v1-GGUF
- Solicitudes de cuantizacion: https://huggingface.co/mradermacher/model_requests
- Guia de uso de GGUF (referencia TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Analisis de tipos de cuantizacion (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
