# Adityapande403/VisDoc-AI

## Resumen

VisDoc-AI es un adaptador de recuperación visual de documentos construido sobre `vidore/colqwen2.5-v0.2`, cuyo backbone es `Qwen/Qwen2.5-VL-3B-Instruct`. El modelo no genera texto libre: produce representaciones multi-vector (embeddings por token visual, dimensión D = 128, normalización L2 unitaria) que se comparan mediante la función de scoring MaxSim de late interaction. El objetivo es indexar y buscar documentos visualmente complejos —esquemas eléctricos, diagramas de PCB, hojas de datos de ingeniería, balances financieros, facturas y certificados con sellos— sin recurrir a OCR ni a chunking de texto.

Lo desarrolla Adityapande403 y se publica con licencia MIT. Es relevante ahora porque combina dos tendencias prácticas en document AI: el paradigma ColPali/ColQwen de recuperación multi-vector y la compresión de índices mediante cuantización, con resultados medidos por el autor que muestran retención del 100 % de NDCG@5 en INT8 y del 73 % en binario de 1 bit, con reducciones de memoria de 2x y 16x respectivamente.

La información pública es escasa: el repositorio de HuggingFace ocupa 0,0 GB, registra 15 descargas y 0 likes, y no se detalla el proceso de fine-tuning ni la composición del dataset de adaptación. El dato de parámetros reportado en safetensors (262.272) no es coherente con un backbone de 3B, por lo que debe tratarse con cautela.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-Language Model (backbone Qwen2.5-VL-3B-Instruct) con cabezal de embeddings multi-vector y scoring MaxSim de late interaction |
| Parametros totales | 262.272 reportados en safetensors (no coherente con el backbone de 3B; tratar como dato no verificado) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | FP16, INT8 escalar, binario de 1 bit (a nivel de indice/embeddings) |
| Idiomas soportados | en |
| Licencia | MIT |
| Formato de pesos | safetensors |
| Dimension del embedding | 128 (normalizacion L2 unitaria) |
| Libreria | colpali-engine |
| Pipeline | feature-extraction |

## Arquitectura y entrenamiento

La arquitectura sigue el esquema ColQwen: un VLM (Qwen2.5-VL-3B-Instruct) procesa la imagen de la pagina y genera multiples embeddings, uno por token visual, en un espacio de dimension 128 con normalizacion L2. La recuperacion se realiza mediante late interaction: para una consulta con N_q tokens, la puntuacion se calcula como la suma, sobre cada token de consulta, del maximo producto escalar contra cualquier token del documento (MaxSim). Este esquema evita la compresion agresiva de un unico vector y preserva informacion espacial y de layout, lo que resulta adecuado para documentos con tablas, esquemas y anotaciones.

El modelo es un fine-tune de `vidore/colqwen2.5-v0.2`, pero la model card no especifica el volumen de datos de adaptacion, la composicion del dataset, si hubo entrenamiento contrastivo, ni si se aplico RLHF o DPO. La innovacion documentada por el autor no esta en el entrenamiento sino en la capa de indexacion: cuantizacion escalar INT8 y binaria de 1 bit de los embeddings, junto con un filtrado de candidatos en dos etapas que reduce la latencia de 253,26 ms a 10,69 ms (aceleracion de 23,7x) sobre un corpus de 1.000 paginas.

## Capacidades

- Recuperacion visual de documentos (visual document retrieval) sin OCR ni extraccion de texto.
- Extraccion de caracteristicas (feature-extraction) en formato multi-vector con late interaction.
- Busqueda semantica sobre paginas con contenido visual denso: esquemas electricos, diagramas de PCB, hojas de datos, balances, facturas, certificados sellados.
- Indexacion de PDFs pagina a pagina mediante la API `VisualDocumentRetriever` del paquete `visdoc`.
- Compresion de indices en INT8 (retencion completa de calidad) y binario de 1 bit (retencion parcial) para reducir huella de memoria.
- Filtrado de candidatos en dos etapas para acelerar la busqueda a escala.
- Soporte de consultas en lenguaje natural en ingles.
- No dispone de generacion de texto, tool calling, capacidades de agente, vision generativa ni modo thinking; es exclusivamente un motor de recuperacion.

## Casos de uso

- Busqueda en documentacion tecnica de ingenieria: indexar hojas de datos y manuales de componentes para localizar, por ejemplo, el pin que alimenta un sensor analogico de 5,0 V en una placa concreta, tal como ilustra el ejemplo de la model card. El modelo es adecuado porque interpreta el layout del esquema sin depender de OCR.
- Gestion de esquemas electricos y diagramas de PCB: recuperar la pagina relevante de un plano a partir de una descripcion funcional, aprovechando que los embeddings por token preservan la relacion espacial entre simbolos y etiquetas.
- Auditoria financiera: localizar lineas concretas en balances y estados financieros escaneados, donde las tablas y la alineacion de columnas son criticas y el OCR por bloques suele degradar la precision.
- Procesamiento de facturas y albaranes: recuperar documentos o paginas por concepto sin pipeline de OCR previo, reduciendo la infraestructura necesaria frente a soluciones basadas en texto.
- Verificacion de certificados de inspeccion con sellos: buscar documentos por referencias visuales (sellos, firmas, campos especificos) que un indice puramente textual no captura.
- Despliegue de un indice a gran escala con presupuesto de memoria limitado: usar el formato binario de 1 bit para 10.000 paginas, que ocupa 76,3 MB frente a 1.220,7 MB en FP16 (16x de compresion), aceptando una retencion de NDCG@5 del 73 %.
- Sistemas RAG sobre documentos escaneados: emplear el retriever como primera etapa de recuperacion y pasar las paginas seleccionadas a un modelo generativo posterior para respuesta extractiva.

## Benchmarks y rendimiento

Resultados medidos por el autor sobre un conjunto de test reservado:

| Representacion | NDCG@5 | MRR@10 | Recall@5 | Retencion NDCG@5 | Payload | Compresion vs FP16 |
|---|---|---|---|---|---|---|
| FP16 (baseline) | 0,5132 | 0,4361 | 0,8333 | 100,0 % | 0,09 MB | 1,0x |
| INT8 escalar | 0,5132 | 0,4361 | 0,8333 | 100,0 % | 0,05 MB | 2,0x |
| Binario 1 bit | 0,3747 | 0,2556 | 0,8333 | 73,0 % | 0,01 MB | 16,0x (32x vs FP32) |

Benchmark a escala de 10.000 paginas (5.000.000 de multi-vectores):

| Formato de indice | Paginas indexadas | Memoria de embeddings | Compresion vs FP16 | Latencia media | Latencia P95 | Throughput |
|---|---|---|---|---|---|---|
| FP16 | 10.000 | 1.220,7 MB | 1,0x | 2.028,90 ms | 2.135,90 ms | 0,5 QPS |
| INT8 | 10.000 | 610,4 MB | 2,0x | 3.013,15 ms | 3.083,47 ms | 0,3 QPS |
| Binario | 10.000 | 76,3 MB | 16,0x | 2.770,02 ms | 2.890,07 ms | 0,4 QPS |

No se han publicado resultados en benchmarks estandar (MMLU, HumanEval, GSM8K, MTEB, ViDoRe) en la informacion disponible.

## Requisitos de hardware

- El backbone es Qwen2.5-VL-3B-Instruct; en FP16 requiere aproximadamente 6-7 GB de VRAM solo para pesos, mas memoria para activaciones y procesamiento de imagenes. No se dispone de mediciones oficiales de VRAM en la informacion proporcionada.
- GPU recomendadas: no disponible de forma explicita; por tamano del backbone, encaja en GPU de 12-16 GB (RTX 4080, RTX 4090, L4) y en A100/H100 para indexacion por lotes a mayor throughput.
- Cabe en GPU de consumo (RTX 4090, 4080) en FP16; en cuantizaciones de menor precision cabria en GPU de 8 GB, aunque no se documentan formatos GGUF ni cuantizaciones de pesos.
- Opciones de despliegue: la libreria `colpali-engine` y el paquete `visdoc` del autor; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, dado que la tarea es feature-extraction y no generacion.
- Latencia y throughput medidos por el autor: 2.028,90 ms de media y 0,5 QPS en FP16 sobre 10.000 paginas; el filtrado en dos etapas reduce la latencia sobre 1.000 paginas de 253,26 ms a 10,69 ms (23,7x).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Paradigma | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| VisDoc-AI | 262.272 reportados (backbone 3B) | no disponible | Multi-vector late interaction (ColQwen) | MIT | HuggingFace, 15 descargas |
| vidore/colqwen2.5-v0.2 (modelo base) | ~3B | no disponible | Multi-vector late interaction | no disponible en la informacion | HuggingFace (vidore) |
| ColPali (familia original) | ~2,4B (PaliGemma) | no disponible | Multi-vector late interaction | no disponible en la informacion | HuggingFace (vidore) |

VisDoc-AI se diferencia del modelo base por la capa de cuantizacion y el filtrado de candidatos, no por una mejora declarada en calidad de recuperacion. No se dispone de datos de benchmarks comparativos directos entre estos modelos en la informacion proporcionada.

## Limitaciones y advertencias

- Idioma: solo se declara soporte para ingles; el rendimiento en castellano u otros idiomas no esta documentado.
- El dato de parametros totales (262.272) es inconsistente con un backbone de 3B; conviene verificar los pesos antes de usarlo en produccion.
- El repositorio ocupa 0,0 GB y registra 15 descargas, lo que sugiere que los pesos podrian no estar completamente publicados o que el artefacto es un adaptador de pequeno tamano. Verificar la integridad de los ficheros safetensors.
- El modelo no genera texto: no debe esperarse razonamiento, resumen ni respuesta extractiva directa; requiere un modelo generativo posterior para tareas RAG completas.
- La cuantizacion binaria de 1 bit degrada la calidad (NDCG@5 de 0,3747 frente a 0,5132 en FP16, retencion del 73 %); no es adecuada cuando la precision es critica.
- El throughput medido es bajo (0,3-0,5 QPS sobre 10.000 paginas), lo que limita el uso en entornos de alta concurrencia sin sharding o replicas.
- Riesgo de alucinacion no aplica directamente al ser un retriever, pero si el riesgo de recuperar paginas incorrectas cuando la consulta depende de texto impreso muy pequeno o de baja resolucion.
- La licencia MIT permite uso comercial, pero el modelo base y los datos de entrenamiento pueden tener condiciones adicionales no detalladas; revisar las licencias de `vidore/colqwen2.5-v0.2` y de Qwen2.5-VL antes de desplegar.
- No se documentan sesgos especificos ni evaluaciones de robustez; el conjunto de test reservado no se describe en tamano ni composicion.

## Enlaces

- HuggingFace: https://huggingface.co/Adityapande403/VisDoc-AI
- Repositorio GitHub: https://github.com/adityapande403/VisDoc-AI
- Modelo base: https://huggingface.co/vidore/colqwen2.5-v0.2
- Backbone: https://huggingface.co/Qwen/Qwen2.5-VL-3B-Instruct
- Libreria colpali-engine: https://github.com/illuin-tech/colpali
