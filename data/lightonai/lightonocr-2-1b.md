# lightonai/LightOnOCR-2-1B

## Resumen

LightOnOCR-2-1B es un modelo vision-lenguaje de extremo a extremo desarrollado por LightOn, diseñado específicamente para la conversion de documentos (PDF, escaneos, imagenes) en texto limpio y ordenado de forma natural. Con 1.005 millones de parametros, resuelve el problema de la digitalizacion documental sin depender de pipelines OCR fragiles y multi-etapa: un unico modelo diferenciable procesa la imagen y genera directamente el texto subyacente, incluyendo tablas, formularios, recibos y notacion matematica en LaTeX.

La relevancia actual del modelo radica en su relacion rendimiento/tamano: segun el autor, alcanza resultados de estado del arte en OlmOCR-Bench siendo aproximadamente 9 veces mas pequeno y significativamente mas rapido que alternativas comparables. En una sola H100 procesa 5,71 paginas por segundo (unas 493.000 paginas al dia) a un coste inferior a 0,01 dolares por cada 1.000 paginas, lo que lo situa como una opcion atractiva para digitalizacion a gran escala.

La segunda version amplia el corpus de entrenamiento con mayor cobertura de frances, articulos de arXiv y escaneos, mejora el manejo de LaTeX y aplica normalizacion mas limpia. Esta refinado con RLVR (Reinforcement Learning with Verifiable Rewards) para maximizar la precision. Se distribuye bajo licencia Apache 2.0 y esta disponible en seis variantes (base, bbox y mezclas), ademas de una version posterior LightOnOCR-3-4B.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-lenguaje (transformers, familia mistral3) |
| Parametros totales | 1.005.647.872 (~1B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (pesos en bfloat16 en el ejemplo de uso) |
| Idiomas soportados | en, fr, de, es, it, nl, pt, sv, da, zh, ja |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

LightOnOCR-2-1B es un modelo vision-lenguaje de extremo a extremo construido sobre la familia arquitectonica mistral3, con un procesador multimodal (`LightOnOcrProcessor`) que acepta imagenes y texto en una conversacion tipo chat. A diferencia de los pipelines OCR clasicos (deteccion de layout, segmentacion, reconocimiento y post-procesado), el modelo es completamente diferenciable y genera la salida de texto directamente desde la imagen, lo que elimina puntos de fallo intermedios y simplifica el despliegue.

El entrenamiento se realizo sobre un corpus mas grande y de mayor calidad que la primera version, con mayor cobertura de frances, documentos de arXiv y escaneos, mejor manejo de LaTeX y normalizacion mas limpia. El modelo final se refino con RLVR (Reinforcement Learning with Verifiable Rewards), una tecnica que optimiza la precision usando recompensas verificables sobre la calidad de la transcripcion. El dataset de entrenamiento (LightOnOCR-mix-0126) y el dataset de bounding boxes (LightOnOCR-bbox-mix-0126) estan publicados en Hugging Face. No se especifica en la informacion disponible el numero exacto de tokens de entrenamiento ni la composicion detallada del dataset.

## Capacidades

- Conversion de documentos a texto: PDFs, escaneos e imagenes a texto limpio con orden de lectura natural.
- Manejo de tablas, recibos, formularios y layouts multicolumna.
- Reconocimiento de notacion matematica con salida en LaTeX.
- Deteccion de imagenes incrustadas con prediccion de bounding boxes (variantes bbox).
- Generacion de texto conversacional mediante plantilla de chat (`apply_chat_template`).
- Soporte multilingue en 11 idiomas: ingles, frances, aleman, espanol, italiano, neerlandes, portugues, sueco, danes, chino y japones.
- Integracion con `transformers` (a partir de v5) y con vLLM para servicio de alto rendimiento.
- Compatible con endpoints (tags `endpoints_compatible`) y despliegue en SageMaker y Azure, con region EU.
- No se documenta soporte de tool calling, agentes ni modo thinking en la informacion disponible.

## Casos de uso

- Digitalizacion masiva de archivos PDF: el modelo procesa lotes de paginas a 5,71 paginas/s en una H100, lo que permite convertir cientos de miles de paginas al dia con coste inferior a 0,01 dolares por 1.000 paginas, adecuado para bibliotecas digitales y archivos historicos.
- Extraccion de datos de facturas y recibos: al manejar tablas y formularios, puede transcribir documentos financieros a texto estructurado para alimentar sistemas de contabilidad o ERP.
- Procesamiento de articulos cientificos de arXiv: la mejora en cobertura de arXiv y el manejo de LaTeX permiten extraer texto y formulas de papers para indexacion o mineria de literatura.
- Atencion al cliente con documentos adjuntos: integrado via vLLM como endpoint compatible con la API de chat completions, puede transcribir imagenes o PDFs enviados por usuarios en flujos conversacionales.
- Automatizacion de back-office con formularios: la deteccion de bounding boxes (variante bbox) permite localizar y extraer campos concretos de formularios escaneados para validacion automatica.
- Enriquecimiento de pipelines RAG: la transcripcion limpia y ordenada de documentos escaneados facilita la chunking y la indexacion vectorial en sistemas de recuperacion aumentada.
- Digitalizacion multilingue en la UE: el soporte de 11 idiomas y el despliegue en region EU (SageMaker/Azure) encajan con requisitos de residencia de datos europeos.
- Fine-tuning especializado: la variante base esta pensada para ajuste fino sobre dominios concretos (por ejemplo, documentos legales o medicos) usando el notebook de Colab publicado por el autor.

## Benchmarks y rendimiento

Segun el autor, el modelo alcanza resultados de estado del arte en OlmOCR-Bench. La model card incluye una imagen con los resultados, pero los valores numericos concretos no estan disponibles en el texto proporcionado. Se indican las siguientes comparativas de velocidad relativas:

| Comparativa de velocidad | Factor |
|---|---|
| Frente a Chandra OCR | 3,3x mas rapido |
| Frente a OlmOCR | 1,7x mas rapido |
| Frente a dots.ocr | 5x mas rapido |
| Frente a PaddleOCR-VL-0.9B | 2x mas rapido |
| Frente a DeepSeekOCR | 1,73x mas rapido |
| Throughput en H100 | 5,71 paginas/s (~493k paginas/dia) |
| Coste estimado | <0,01 USD por 1.000 paginas |

No se han publicado en la informacion disponible los valores numericos de MMLU, HumanEval, GSM8K ni de las metricas de OlmOCR-Bench; consultar el paper para el detalle completo y la metodologia.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; con ~1B parametros en bfloat16 los pesos ocupan aproximadamente 2 GB, mas el overhead del procesador de vision y las activaciones (el repositorio pesa 2,0 GB).
- GPU recomendadas: H100 para el throughput maximo documentado (5,71 paginas/s); cualquier GPU CUDA con suficiente VRAM para bfloat16.
- Compatibilidad consumer: por tamano, cabe previsiblemente en GPUs consumer modernas (por ejemplo, RTX 4090 de 24 GB); el ejemplo oficial tambien soporta ejecucion en MPS (Apple Silicon) y CPU, con `float32` en MPS.
- Opciones de despliegue: `transformers` (v5 o superior), vLLM (`vllm serve` con `--limit-mm-per-prompt '{"image": 1}' --mm-processor-cache-gb 0 --no-enable-prefix-caching`), SageMaker y Azure.
- Latencia y throughput: 5,71 paginas/s en una H100 segun el autor; latencia por pagina no desglosada en la informacion disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Velocidad relativa (segun autor) | Licencia | Disponibilidad |
|---|---|---|---|---|
| LightOnOCR-2-1B | ~1B | Referencia (5,71 pag/s en H100) | Apache 2.0 | Hugging Face, vLLM, SageMaker, Azure |
| Chandra OCR | No disponible | 3,3x mas lento | No disponible | No disponible |
| OlmOCR | No disponible | 1,7x mas lento | No disponible | No disponible |
| dots.ocr | No disponible | 5x mas lento | No disponible | No disponible |
| PaddleOCR-VL-0.9B | 0,9B | 2x mas lento | No disponible | No disponible |
| DeepSeekOCR | No disponible | 1,73x mas lento | No disponible | No disponible |

Los datos de parametros, contexto y rendimiento de los modelos competidores no estan disponibles en la informacion proporcionada; solo se dispone de los factores de velocidad relativos indicados por el autor.

## Limitaciones y advertencias

- Los benchmarks de precision (OlmOCR-Bench) se presentan solo de forma grafica en la model card; no hay cifras textuales verificables en la informacion disponible.
- Riesgo de alucinacion inherente a los modelos generativos: puede omitir, reordenar o inventar contenido en documentos de baja calidad, manuscritos o layouts atipicos.
- El modelo esta especializado en OCR y comprension documental; no se documentan capacidades de razonamiento general, codigo o tool calling.
- La longitud de contexto no esta especificada, lo que limita la planificacion de documentos muy extensos por pagina.
- Cobertura linguistica declarada de 11 idiomas; el rendimiento fuera de ellos (por ejemplo, alfabetos no incluidos) no esta garantizado.
- Licencia Apache 2.0 permite uso comercial, pero conviene revisar los terminos de los datasets de entrenamiento publicados.
- El autor recomienda la version posterior LightOnOCR-3-4B (`new_version`), lo que sugiere que esta version puede quedar desactualizada.
- Para vLLM se requieren flags especificos (limite de una imagen por prompt, cache de procesador desactivada, sin prefix caching); una configuracion incorrecta puede degradar el rendimiento o fallar.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/lightonai/LightOnOCR-2-1B
- Paper: https://arxiv.org/pdf/2601.14251
- Paper de referencia (arXiv 2412.13663): https://arxiv.org/abs/2412.13663
- Blog en Hugging Face: https://huggingface.co/blog/lightonai/lightonocr-2
- Demo: https://huggingface.co/spaces/lightonai/LightOnOCR-2-1B-Demo
- Dataset: https://huggingface.co/datasets/lightonai/LightOnOCR-mix-0126
- Dataset bbox: https://huggingface.co/datasets/lightonai/LightOnOCR-bbox-mix-0126
- Notebook de fine-tuning: https://colab.research.google.com/drive/1WjbsFJZ4vOAAlKtcCauFLn_evo5UBRNa?usp=sharing
- Blog de LightOn: https://www.lighton.ai/lighton-blogs/lighton-opens-a-new-field-for-ai-with-lightonocr-2-document-intelligence
- Web de LightOn: https://lighton.ai
- Variante base: https://huggingface.co/lightonai/LightOnOCR-2-1B-base
- Variante bbox: https://huggingface.co/lightonai/LightOnOCR-2-1B-bbox
- Variante bbox-base: https://huggingface.co/lightonai/LightOnOCR-2-1B-bbox-base
- Variante ocr-soup: https://huggingface.co/lightonai/LightOnOCR-2-1B-ocr-soup
- Variante bbox-soup: https://huggingface.co/lightonai/LightOnOCR-2-1B-bbox-soup
- Version posterior: https://huggingface.co/lightonai/LightOnOCR-3-4B
