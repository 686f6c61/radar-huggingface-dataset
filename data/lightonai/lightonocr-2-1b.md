# lightonai/LightOnOCR-2-1B

## Resumen

LightOnOCR-2-1B es un modelo vision-language de 1.005.647.872 parametros (~1,0 B) desarrollado por LightOn, disenado especificamente para convertir documentos (PDF, escaneos e imagenes) en texto limpio y con orden de lectura natural. Se trata de un modelo end-to-end completamente diferenciable: no depende de pipelines OCR externos ni de etapas de deteccion, segmentacion y reconocimiento encadenadas, lo que simplifica el despliegue y elimina errores acumulados entre componentes.

La segunda version del modelo se ha entrenado sobre un corpus mas amplio y de mayor calidad, con mejor cobertura de frances, documentos de arXiv y escaneos, manejo mejorado de LaTeX y normalizacion de texto mas limpia. La model card indica que alcanza rendimiento estado del arte en OlmOCR-Bench siendo aproximadamente 9 veces mas pequeno y significativamente mas rapido que las alternativas comparables.

La relevancia actual del modelo esta en su relacion rendimiento-coste: procesa 5,71 paginas por segundo en una sola H100 (unas 493.000 paginas al dia) por menos de 0,01 USD por cada 1.000 paginas. Esta publicado bajo licencia Apache 2.0, soporta 11 idiomas y esta disponible en transformers (a partir de v5), ademas de contar con soporte para vLLM y despliegue en SageMaker y Azure.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-language basada en Mistral3 (tag `mistral3`); transformer multimodal con procesador de imagen y decodificador de texto |
| Parametros totales | 1.005.647.872 (~1,0 B), segun safetensors |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible en la informacion proporcionada; pesos publicados en safetensors (bfloat16 en inferencia) |
| Idiomas soportados | en, fr, de, es, it, nl, pt, sv, da, zh, ja (11 idiomas) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (repo de 2,0 GB); compatible con transformers y vLLM |

Datos adicionales: pipeline `image-text-to-text`, creado el 2026-01-16, actualizado el 2026-07-08, 171.095 descargas y 807 likes en HuggingFace.

## Arquitectura y entrenamiento

LightOnOCR-2-1B es un modelo vision-language end-to-end de aproximadamente 1.000 millones de parametros construido sobre la arquitectura Mistral3. Combina un codificador de imagen con un decodificador de texto que genera directamente la transcripcion del documento, de forma que todo el proceso es diferenciable y no requiere etapas externas de deteccion de layout, segmentacion de regiones ni post-procesado de pipelines OCR clasicos. El procesador asociado (`LightOnOcrProcessor`) gestiona la plantilla de conversacion multimodal y la tokenizacion de la imagen.

El modelo se ha refinado con entrenamiento RLVR (Reinforcement Learning with Verifiable Rewards), orientado a maximizar la precision de la transcripcion. La segunda version se entreno sobre un corpus mas grande y de mayor calidad que la primera, con enfasis en frances, documentos de arXiv y escaneos, ademas de mejoras en el tratamiento de LaTeX y en la normalizacion de la salida. El dataset asociado es `lightonai/LightOnOCR-mix-0126` (y su variante con bounding boxes `LightOnOCR-bbox-mix-0126`). No se detalla en la informacion disponible el numero exacto de tokens de entrenamiento ni la composicion completa del dataset.

La familia incluye varias variantes: el modelo principal, la version base para fine-tuning (`-base`), las variantes con prediccion de bounding boxes (`-bbox`, `-bbox-base`) y variantes fusionadas por model soup (`-ocr-soup`, `-bbox-soup`). Existe un notebook de fine-tuning publicado en Colab.

## Capacidades

- Reconocimiento optico de caracteres (OCR) end-to-end sobre PDF, escaneos e imagenes, con generacion de texto en orden de lectura natural.
- Manejo de estructuras complejas: tablas, recibos, formularios, layouts multi-columna y notacion matematica (LaTeX).
- Prediccion de bounding boxes para imagenes embebidas en las variantes `-bbox`.
- Entrada multimodal imagen-texto con plantilla conversacional (`apply_chat_template`), lo que permite interaccion tipo chat sobre documentos.
- Capacidades multilingues en 11 idiomas: ingles, frances, aleman, espanol, italiano, neerlandes, portugues, sueco, danes, chino y japones.
- Inferencia de alta velocidad y bajo coste por pagina, apta para procesamiento por lotes a gran escala.
- Compatibilidad con vLLM para servicio en produccion y con endpoints gestionados (SageMaker, Azure).
- No se documenta en la informacion disponible soporte explicito de tool calling ni de razonamiento multi-paso orientado a agentes; el proposito principal del modelo es la transcripcion de documentos.

## Casos de uso

- Digitalizacion masiva de archivos PDF: convertir grandes volumenes de documentos a texto plano de forma end-to-end, aprovechando el throughput de 5,71 paginas/s en una H100 y el coste inferior a 0,01 USD por 1.000 paginas.
- Extraccion de datos de facturas y recibos: el modelo reconoce formularios y recibos, lo que permite alimentar sistemas de contabilidad o ERP con los campos transcritos y despues parseados.
- Procesamiento de articulos cientificos de arXiv: la version 2 mejora la cobertura de arXiv y el manejo de LaTeX, lo que facilita convertir papers a texto estructurado conservando formulas y referencias.
- Extraccion de tablas para analitica: gracias al tratamiento especifico de tablas, se puede integrar en pipelines que convierten tablas de PDF a formatos estructurados antes de cargarlos en un almacen de datos.
- Atencion documental multilingue: al soportar 11 idiomas, resulta adecuado para organizaciones que reciben documentos en varios idiomas europeos y asiaticos y necesitan una unica pasarela de OCR.
- Digitalizacion de patrimonio documental escaneado: el enfasis de la version 2 en escaneos lo hace util para archivos historicos o documentos con calidad de imagen irregular.
- Preprocesado para RAG sobre documentos: la transcripcion limpia y con orden de lectura correcto sirve como etapa previa a la indexacion semantica en sistemas de recuperacion aumentada.
- Analisis de documentos con bounding boxes: las variantes `-bbox` permiten localizar imagenes dentro del documento, util para reconstruir la maquetacion original o para tareas de comprension visual.
- Despliegue en infraestructura europea: la etiqueta `region:eu` y el soporte en SageMaker/Azure facilitan el cumplimiento de requisitos de residencia de datos en la UE.

## Benchmarks y rendimiento

No se han publicado resultados numericos de benchmarks en la informacion disponible. La model card referencia una figura (`benchmark.png`) con resultados de OlmOCR-Bench y remite al paper para la metodologia completa, pero no incluye las cifras en el texto proporcionado.

Lo unico cuantificable disponible son las comparativas de velocidad declaradas por el autor, que no deben interpretarse como resultados de precision:

| Comparativa de velocidad | Resultado declarado |
|---|---|
| Frente a Chandra OCR | 3,3x mas rapido |
| Frente a OlmOCR | 1,7x mas rapido |
| Frente a dots.ocr | 5x mas rapido |
| Frente a PaddleOCR-VL-0.9B | 2x mas rapido |
| Frente a DeepSeekOCR | 1,73x mas rapido |
| Throughput en 1x H100 | 5,71 paginas/s (~493.000 paginas/dia) |
| Coste estimado | <0,01 USD por 1.000 paginas |

No se han proporcionado cifras de MMLU, HumanEval, GSM8K ni metricas de precision OCR (por ejemplo, edit distance o exact match) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: al tratarse de ~1,0 B de parametros, los pesos en bfloat16 ocupan aproximadamente 2 GB; con activaciones y el procesador de imagen, un presupuesto de 3-5 GB de VRAM es razonable para inferencia en una sola GPU.
- GPU recomendadas: H100 para maximizar throughput (5,71 paginas/s documentadas); A100 tambien adecuada para servicio por lotes; cualquier GPU con >=6-8 GB de VRAM sirve para uso moderado.
- Cabe en GPU de consumo: si, es un modelo de ~1 B de parametros, por lo que entra en GPUs como RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070/4080/4090. El codigo de ejemplo de la model card contempla tambien ejecucion en MPS (Apple Silicon) y en CPU.
- Opciones de despliegue: transformers >= v5.0.0 (`LightOnOcrForConditionalGeneration` + `LightOnOcrProcessor`); vLLM (`vllm serve lightonai/LightOnOCR-2-1B`); endpoints gestionados en SageMaker y Azure (tags `deploy:sagemaker`, `deploy:azure`, `endpoints_compatible`).
- Consideraciones de servicio en vLLM: la model card recomienda limitar a una imagen por prompt (`--limit-mm-per-prompt '{"image": 1}'`), desactivar la cache del procesador multimodal (`--mm-processor-cache-gb 0`) y desactivar el prefix caching.
- Latencia y throughput: 5,71 paginas/s en una H100 segun el autor; no se aportan cifras para otras GPUs.

## Comparativa con modelos similares

La informacion disponible menciona varios competidores en velocidad, pero no proporciona sus parametros ni sus resultados de precision, por lo que muchos campos quedan como no disponibles.

| Modelo | Parametros | Contexto | Precision (OlmOCR-Bench) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| LightOnOCR-2-1B | 1,0 B | no disponible | estado del arte segun el autor (sin cifra publicada) | Apache 2.0 | HuggingFace, transformers v5, vLLM, SageMaker, Azure |
| OlmOCR | no disponible | no disponible | no disponible (referencia comparativa) | no disponible | no disponible |
| dots.ocr | no disponible | no disponible | no disponible (referencia comparativa) | no disponible | no disponible |
| PaddleOCR-VL-0.9B | ~0,9 B (segun nombre) | no disponible | no disponible (referencia comparativa) | no disponible | no disponible |
| DeepSeekOCR | no disponible | no disponible | no disponible (referencia comparativa) | no disponible | no disponible |
| Chandra OCR | no disponible | no disponible | no disponible (referencia comparativa) | no disponible | no disponible |

## Limitaciones y advertencias

- No se han publicado en la informacion disponible cifras de precision de benchmarks; la afirmacion de "mejor modelo OCR" y el estado del arte en OlmOCR-Bench son declaraciones del autor, no verificables con los datos aportados.
- Riesgo de alucinacion inherente a los modelos generativos: en documentos degradados, manuscritos o layouts muy inusuales el modelo puede generar texto plausible pero incorrecto, algo especialmente critico en entornos legales, medicos o financieros donde se requiere validacion humana.
- Longitud de contexto no especificada en la informacion disponible; documentos muy extensos pueden requerir procesamiento pagina a pagina o troceado.
- El modelo esta orientado a OCR y comprension de documentos, no a razonamiento general, generacion creativa ni codigo; forzarlo a esas tareas no es el uso previsto.
- Cobertura idiomatica declarada en 11 idiomas; no hay datos sobre el rendimiento relativo entre ellos, y los idiomas distintos del ingles o el frances podrian estar peor cubiertos.
- Aunque la licencia Apache 2.0 permite uso comercial sin restricciones de royalties, conviene revisar las licencias de los datasets derivados y de los modelos base utilizados en su construccion.
- Restricciones de hardware y configuracion en vLLM: hay que ajustar los parametros de cache multimodal y prefix caching segun indica la model card para evitar degradacion de rendimiento.
- Requiere transformers >= v5.0.0; versiones anteriores no soportan la clase `LightOnOcrForConditionalGeneration`.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/lightonai/LightOnOCR-2-1B
- Paper: https://arxiv.org/pdf/2601.14251 (referencia arXiv:2601.14251)
- Paper adicional citado en tags: arXiv:2412.13663 (usado como PDF de ejemplo en la model card)
- Blog en HuggingFace: https://huggingface.co/blog/lightonai/lightonocr-2
- Demo: https://huggingface.co/spaces/lightonai/LightOnOCR-2-1B-Demo
- Dataset: https://huggingface.co/datasets/lightonai/LightOnOCR-mix-0126
- Dataset con bounding boxes: https://huggingface.co/datasets/lightonai/LightOnOCR-bbox-mix-0126
- Notebook de fine-tuning: https://colab.research.google.com/drive/1WjbsFJZ4vOAAlKtcCauFLn_evo5UBRNa?usp=sharing
- Variante base: https://huggingface.co/lightonai/LightOnOCR-2-1B-base
- Variante con bounding boxes: https://huggingface.co/lightonai/LightOnOCR-2-1B-bbox
- Variante bbox base: https://huggingface.co/lightonai/LightOnOCR-2-1B-bbox-base
- Variante ocr-soup: https://huggingface.co/lightonai/LightOnOCR-2-1B-ocr-soup
- Variante bbox-soup: https://huggingface.co/lightonai/LightOnOCR-2-1B-bbox-soup
- Web de LightOn: https://lighton.ai
- Entrada de blog de LightOn: https://www.lighton.ai/lighton-blogs/lighton-opens-a-new-field-for-ai-with-lightonocr-2-document-intelligence
- LinkedIn de LightOn: https://www.linkedin.com/company/lighton/
- X de LightOn: https://x.com/LightOnIO
