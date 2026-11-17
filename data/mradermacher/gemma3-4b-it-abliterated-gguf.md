# mradermacher/gemma3-4b-it-abliterated-GGUF

## Resumen

`mradermacher/gemma3-4b-it-abliterated-GGUF` es una coleccion de cuantizaciones en formato GGUF del modelo `kabachuha/gemma3-4b-it-abliterated`, que a su vez es una version "abliterated" (con los rechazos de seguridad suprimidos mediante edicion de direcciones en el espacio de activaciones) del Gemma 3 4B instruct de Google. El autor de las cuantizaciones es mradermacher, un conocido publicador de versiones GGUF de modelos open source, que distribuye tanto cuantizaciones estaticas como versiones con imatrix en un repositorio separado.

El modelo resuelve el problema de ejecutar un modelo multimodal de 4B parametros en hardware de consumo mediante cuantizacion agresiva (desde Q2_K de 1,8 GB hasta f16 de 7,9 GB), manteniendo el proyector multimodal (`mmproj`) para conservar capacidad de vision. La relevancia actual radica en que permite desplegar localmente un modelo de la familia Gemma 3 con ventana de contexto larga y capacidades multimodales en GPUs consumer, a costa de eliminar los filtros de rechazo del modelo original.

El modelo base cuenta con 3.880.263.168 parametros totales (segun los safetensors del repositorio), arquitectura transformer densa (no MoE), licencia Gemma y entrenamiento orientado a instrucciones. La variante abliterated modifica el comportamiento de rechazo, lo que tiene implicaciones importantes de seguridad y uso responsable que se detallan en la seccion de limitaciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer densa (Gemma 3), multimodal con proyector `mmproj` |
| Parametros totales | 3.880.263.168 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (heredada del Gemma 3 4B base) |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16; mmproj en Q8_0 y f16; versiones imatrix (i1) en repositorio separado |
| Idiomas soportados | en (segun la model card; el Gemma 3 base soporta mas idiomas, pero la card declara solo ingles) |
| Licencia | gemma (Gemma Terms of Use) |
| Formato de pesos | GGUF (con variantes multimodales `mmproj`); modelo base en safetensors/transformers |

## Arquitectura y entrenamiento

El modelo subyacente es Gemma 3 4B instruct, un transformer denso de Google con capacidad multimodal (procesamiento de imagen y texto) implementado mediante un proyector multimodal separado que se distribuye como archivo `mmproj` en formato GGUF. La variante "abliterated" se obtiene aplicando tecnicas de edicion de direcciones (abliteration) sobre el modelo instruct original, que identifican y suprimen las direcciones de activacion responsables de los comportamientos de rechazo. Este proceso no reentrena el modelo desde cero, sino que modifica los pesos para eliminar la tendencia a rechazar peticiones.

No se dispone en la informacion proporcionada de detalles sobre el numero de tokens de entrenamiento, composicion del dataset ni si hubo RLHF/DPO en el modelo base. La model card del repositorio de cuantizacion es puramente tecnica sobre el proceso de cuantizacion y no documenta el entrenamiento del modelo original ni del proceso de abliteration. Las cuantizaciones son estaticas (no imatrix en este repositorio; las imatrix estan en `mradermacher/gemma3-4b-it-abliterated-i1-GGUF`).

## Capacidades

- Generacion de texto conversacional en ingles, con modo instruct heredado de Gemma 3 4B IT.
- Procesamiento multimodal de imagenes mediante el proyector `mmproj` (Q8_0 o f16), lo que permite entrada de vision junto con texto.
- Razonamiento y respuesta a instrucciones, con la salvedad de que el proceso de abliteration altera el comportamiento de rechazo.
- Soporte de conversacion multi-turno (pipeline `conversational` segun los tags del repositorio).
- Compatibilidad con endpoints (tag `endpoints_compatible`), lo que facilita su despliegue en infraestructuras de inferencia estandar.
- Capacidades multilingues limitadas segun la card (declara solo `en`), aunque el Gemma 3 base soporta mas idiomas.
- No se documenta en la informacion disponible soporte explicito de tool calling, function calling ni modo thinking para esta variante.

## Casos de uso

- Inferencia local en GPU consumer: las cuantizaciones Q4_K_M (2,6 GB) y Q5_K_M (2,9 GB) permiten ejecutar el modelo en GPUs con 6-8 GB de VRAM, ideal para prototipado y desarrollo en estaciones de trabajo sin aceleradores de datacenter.
- Procesamiento de documentos con imagenes: el proyector `mmproj` permite pasar capturas, diagramas o paginas escaneadas junto con texto para extraccion de informacion, usando llama.cpp con soporte multimodal.
- Chat conversacional sin filtros para investigacion: util en entornos de investigacion sobre seguridad de modelos, red teaming y estudio de comportamientos de rechazo, donde se necesita un modelo que no bloquee consultas.
- Generacion de contenido creativo sin restricciones: escritura de ficcion, guiones o narrativa que requiera tematicas que el modelo original rechazaria, con la advertencia de supervision humana.
- Despliegue en entornos con recursos limitados: la cuantizacion Q2_K (1,8 GB) permite ejecucion en CPU o GPUs integradas, adecuada para demos y pruebas de concepto.
- Fine-tuning o experimentacion con LoRA: el formato GGUF no es directamente entrenable, pero la variante base en safetensors permite adaptaciones; las cuantizaciones sirven para evaluar el modelo antes de invertir en entrenamiento.
- Traduccion y procesamiento de texto en ingles: aunque la card declara solo `en`, el modelo base tiene capacidades multilingues que pueden aprovecharse con cautela.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del repositorio de cuantizacion no incluye metricas de MMLU, HumanEval, GSM8K ni comparativas de rendimiento, y el proceso de abliteration tipicamente degrada ligeramente algunas metricas respecto al modelo original, pero no se aportan numeros concretos.

## Requisitos de hardware

- VRAM estimada para inferencia (incluye pesos, sin contar overhead de contexto):
  - Q2_K: ~1,8 GB
  - Q3_K_M: ~2,2 GB
  - Q4_K_M: ~2,6 GB
  - Q5_K_M: ~2,9 GB
  - Q6_K: ~3,3 GB
  - Q8_0: ~4,2 GB
  - f16: ~7,9 GB
  - Proyector multimodal adicional: 0,7 GB (Q8_0) o 1,0 GB (f16) si se usa vision.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para cuantizaciones bajas; RTX 3060 12 GB, RTX 4060 Ti 16 GB o RTX 4090 para cuantizaciones altas con contexto largo. En datacenter, A100 o H100 no son necesarias dado el tamano del modelo.
- Cabe en GPU consumer: si, desde GTX 1650 4 GB (Q2_K) hasta RTX 4090 (f16 con vision y contexto extenso).
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, y servidores compatibles con GGUF; el tag `endpoints_compatible` sugiere compatibilidad con endpoints de inferencia estandar. vLLM y TGI no soportan GGUF de forma nativa generalizada, por lo que se recomienda llama.cpp u Ollama.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada; dependen fuertemente del hardware y la cuantizacion.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Multimodal | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| mradermacher/gemma3-4b-it-abliterated-GGUF | 3,88 B | no disponible | Si (mmproj) | Gemma | GGUF en HF |
| google/gemma-3-4b-it | 3,88 B | no disponible | Si | Gemma | safetensors/GGUF oficiales |
| kabachuha/gemma3-4b-it-abliterated | 3,88 B | no disponible | Si | Gemma | safetensors en HF |
| mradermacher/gemma3-4b-it-abliterated-i1-GGUF | 3,88 B | no disponible | Si | Gemma | GGUF imatrix en HF |

La comparativa principal es contra el modelo oficial de Google (con filtros de rechazo intactos) y contra la variante base abliterated en safetensors (sin cuantizar). Las diferencias clave son el formato (GGUF frente a safetensors), la presencia o ausencia de filtros de rechazo, y la calidad de cuantizacion (estatica frente a imatrix). No se dispone de comparativas de rendimiento numericas con otros modelos de 4B como Llama 3.2 3B o Qwen2.5 3B en la informacion proporcionada.

## Limitaciones y advertencias

- El proceso de abliteration elimina los rechazos de seguridad, lo que implica que el modelo puede generar contenido danino, ofensivo o ilegal sin filtros; su uso en produccion requiere moderacion externa obligatoria.
- Riesgo elevado de alucinacion, comun en modelos de 4B y potencialmente agravado por la modificacion de pesos.
- La card declara solo soporte de ingles (`en`); el rendimiento en castellano no esta garantizado ni documentado.
- La licencia Gemma impone restricciones de uso comercial y requiere aceptar los terminos de Google; el uso comercial esta sujeto a la politica de uso prohibido de Gemma.
- El proceso de abliteration puede degradar ligeramente capacidades de razonamiento e instruccion respecto al Gemma 3 4B IT original, aunque no se aportan metricas.
- Las cuantizaciones bajas (Q2_K, Q3_K_S) tienen perdida de calidad notable; se recomienda Q4_K_M o superior para uso serio.
- No se documenta tool calling, function calling ni modo thinking en esta variante.
- El tamano del repositorio (37,3 GB) incluye todas las cuantizaciones; descargar solo el archivo necesario.
- La fecha de actualizacion del repositorio (2026-11-17) es posterior a la de creacion (2025-03-16), lo que sugiere mantenimiento, pero no se detalla que cambios se hicieron.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mradermacher/gemma3-4b-it-abliterated-GGUF
- Modelo base abliterated: https://huggingface.co/kabachuha/gemma3-4b-it-abliterated
- Cuantizaciones imatrix (i1): https://huggingface.co/mradermacher/gemma3-4b-it-abliterated-i1-GGUF
- Pagina de descargas del autor: https://hf.tst.eu/model#gemma3-4b-it-abliterated-GGUF
- FAQ y peticiones de modelos: https://huggingface.co/mradermacher/model_requests
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Analisis de cuantizaciones (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Grafico de perplejidad por cuantizacion (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Empresa del autor: https://www.nethype.de/
