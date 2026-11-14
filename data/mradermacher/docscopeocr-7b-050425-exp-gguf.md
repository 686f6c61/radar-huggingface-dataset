# mradermacher/docscopeOCR-7B-050425-exp-GGUF

## Resumen

docscopeOCR-7B-050425-exp-GGUF es la version cuantizada en formato GGUF del modelo multimodal docscopeOCR-7B-050425-exp, desarrollado por prithivMLmods y empaquetado por mradermacher. Se trata de un modelo de 7.615.616.512 parametros (aproximadamente 7,6 mil millones) especializado en tareas de OCR (reconocimiento optico de caracteres), procesamiento de documentos PDF e imagenes, y extraccion de informacion clave (KIE, Key Information Extraction). El modelo parte de una arquitectura transformer multimodal con capacidad de procesar imagen y texto, y esta disenado para convertir documentos visuales en representaciones textuales estructuradas.

La relevancia de esta ficha radica en que el modelo original solo estaba disponible en formato transformers (safetensors), mientras que esta version GGUF permite su despliegue en entornos con recursos limitados mediante llama.cpp, Ollama u otros runners compatibles con GGUF. El repositorio incluye un conjunto amplio de cuantizaciones estaticas, desde Q2_K (3,1 GB) hasta f16 (15,3 GB), ademas de los ficheros mmproj necesarios para el procesamiento multimodal (proyector vision-lenguaje).

El modelo esta entrenado sobre datasets como allenai/olmOCR-mix-0225 y varios conjuntos de analisis y reconocimiento de documentos de prithivMLmods (Opendoc1, Opendoc2, Openpdf). Soporta los idiomas ingles y chino, y se distribuye bajo licencia Apache 2.0, lo que facilita su uso comercial. Es importante senalar que se trata de una version experimental ("exp" en el nombre), por lo que su robustez en produccion debe validarse con cuidado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (vision-lenguaje), basada en el modelo original docscopeOCR-7B-050425-exp; arquitectura exacta no disponible |
| Parametros totales | 7.615.616.512 (aproximadamente 7,6 B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16; mmproj en Q8_0 y f16 |
| Idiomas soportados | Ingles (en), chino (zh) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizado); el modelo base en safetensors |

## Arquitectura y entrenamiento

El modelo base es un transformer multimodal de aproximadamente 7,6 mil millones de parametros que combina un codificador visual con un modelo de lenguaje para realizar tareas de OCR y comprension de documentos. La version GGUF incluye ficheros mmproj (multi-modal projector) que permiten proyectar las representaciones visuales al espacio del modelo de lenguaje, requisito imprescindible para el procesamiento de imagenes en llama.cpp. No se dispone de informacion detallada sobre el numero exacto de capas, dimensiones ocultas ni el tipo de atencion empleado.

En cuanto al entrenamiento, la model card del modelo base referencia los datasets allenai/olmOCR-mix-0225, prithivMLmods/Opendoc1-Analysis-Recognition, prithivMLmods/Opendoc2-Analysis-Recognition y prithivMLmods/Openpdf-Analysis-Recognition. No se especifica el numero total de tokens de entrenamiento, la composicion exacta del dataset ni si se aplicaron tecnicas de RLHF, DPO o ajuste supervisado. Tampoco se documentan innovaciones tecnicas especificas como decodificacion especulativa o atencion lineal. La informacion disponible es limitada y proviene unicamente de los metadatos del repositorio.

## Capacidades

- Reconocimiento optico de caracteres (OCR) sobre imagenes y documentos PDF.
- Extraccion de informacion clave (KIE) de documentos estructurados y semiestructurados.
- Procesamiento multimodal: acepta imagenes como entrada ademas de texto.
- Generacion de texto descriptivo y estructurado a partir de contenido visual.
- Analisis de documentos PDF y su conversion a representaciones textuales.
- Capacidades conversacionales (tag "conversational" en los metadatos).
- Soporte multiligue limitado a ingles y chino.
- Compatibilidad con text-generation-inference y endpoints compatibles segun los tags del repositorio.
- No se documenta soporte explicito de tool calling, function calling ni modos de razonamiento multi-paso.

## Casos de uso

- Digitalizacion masiva de archivos PDF: el modelo puede procesar lotes de documentos escaneados y extraer su contenido textual, adecuado para proyectos de archivo y preservacion documental gracias a su capacidad OCR multimodal.
- Extraccion de datos de facturas y formularios: mediante KIE, el modelo puede identificar campos clave (importes, fechas, emisores) en documentos estructurados, lo que resulta util en automatizacion contable y financiera.
- Procesamiento de documentos en entornos con recursos limitados: las cuantizaciones Q4_K_S y Q4_K_M (4,6-4,8 GB) permiten ejecutar el modelo en GPUs de consumo, facilitando el despliegue en estaciones de trabajo sin infraestructura dedicada.
- Analisis de documentos academicos y tecnicos: el modelo puede extraer texto y estructura de papers y manuales en PDF, apoyando tareas de revision bibliografica y mineria de conocimiento.
- Integracion en pipelines de gestion documental: al ser compatible con llama.cpp y formatos GGUF, puede incorporarse en flujos automatizados de clasificacion y enriquecimiento de documentos sin depender de APIs externas.
- Procesamiento bilingue ingles-chino: adecuado para organizaciones que gestionan documentacion en ambos idiomas, como empresas con operaciones en mercados angloparlantes y sinofonos.
- Prototipado rapido de soluciones OCR: la disponibilidad de multiples cuantizaciones permite experimentar desde entornos de bajos recursos (Q2_K, 3,1 GB) hasta configuraciones de mayor calidad (Q8_0, 8,2 GB).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (solo pesos, sin overhead de contexto): Q2_K ~3,1 GB; Q3_K_S ~3,6 GB; Q4_K_S ~4,6 GB; Q4_K_M ~4,8 GB; Q5_K_M ~5,5 GB; Q6_K ~6,4 GB; Q8_0 ~8,2 GB; f16 ~15,3 GB. A estas cifras hay que sumar el fichero mmproj (1,0-1,5 GB) y el overhead de la ventana de contexto.
- GPU recomendadas: RTX 3060 12 GB o RTX 4060 Ti 16 GB para cuantizaciones Q4-Q6; RTX 4090 24 GB para Q8_0 o f16 con contexto amplio; A100 40/80 GB o H100 para despliegues de alta concurrencia.
- Cabe en GPU de consumo: si, en tarjetas con 8 GB o mas usando cuantizaciones Q4_K_S o Q4_K_M junto con el mmproj en Q8_0; para Q2_K y Q3 es posible en GPUs de 6 GB con contexto reducido.
- Opciones de despliegue: llama.cpp, Ollama, y runners compatibles con GGUF que soporten modelos multimodales con mmproj; el modelo base admite transformers y text-generation-inference.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| docscopeOCR-7B-050425-exp-GGUF | ~7,6 B | No disponible | en, zh | Apache 2.0 | GGUF | Version cuantizada de mradermacher; especializada en OCR y KIE |
| docscopeOCR-7B-050425-exp (base) | ~7,6 B | No disponible | en, zh | Apache 2.0 | safetensors | Modelo original de prithivMLmods; requiere transformers |
| Alternativas OCR multimodales de 7B | No disponible | No disponible | No disponible | No disponible | No disponible | No se dispone de datos verificables en la informacion proporcionada |

No se dispone de informacion suficiente para establecer una comparativa cuantitativa con modelos alternativos de la misma categoria; los datos de rendimiento, contexto y benchmarks de los competidores no estan incluidos en la informacion proporcionada.

## Limitaciones y advertencias

- Modelo experimental: el sufijo "exp" indica que se trata de una version de experimentacion, sin garantias de robustez en produccion.
- Idiomas limitados: solo se documentan ingles y chino; el rendimiento en castellano u otros idiomas no esta verificado.
- Riesgo de alucinacion: como modelo generativo, puede producir texto inexistente en el documento original, especialmente en cuantizaciones agresivas (Q2_K, Q3_K_S).
- Perdida de calidad por cuantizacion: las cuantizaciones por debajo de Q4 pueden degradar la precision del OCR y la extraccion de informacion; se recomienda Q5_K_M o superior para tareas criticas.
- Longitud de contexto no documentada: se desconoce la ventana maxima, lo que dificulta planificar el procesamiento de documentos extensos.
- Sesgos conocidos: no documentados en la informacion disponible; cabe esperar sesgos heredados de los datasets de entrenamiento (olmOCR-mix y conjuntos de prithivMLmods).
- Licencia Apache 2.0: permite uso comercial, pero al ser un modelo derivado conviene revisar las condiciones del modelo base y de los datasets de entrenamiento.
- Requiere fichero mmproj para funcionalidad multimodal: sin el, el modelo no procesa imagenes correctamente en llama.cpp.
- No se documenta soporte de tool calling ni agentes, lo que limita su uso en flujos automatizados complejos.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/docscopeOCR-7B-050425-exp-GGUF
- Modelo base: https://huggingface.co/prithivMLmods/docscopeOCR-7B-050425-exp
- Cuantizaciones imatrix: https://huggingface.co/mradermacher/docscopeOCR-7B-050425-exp-i1-GGUF
- Pagina de descargas del autor: https://hf.tst.eu/model#docscopeOCR-7B-050425-exp-GGUF
- Dataset allenai/olmOCR-mix-0225: https://huggingface.co/datasets/allenai/olmOCR-mix-0225
- Dataset Opendoc1-Analysis-Recognition: https://huggingface.co/datasets/prithivMLmods/Opendoc1-Analysis-Recognition
- Dataset Opendoc2-Analysis-Recognition: https://huggingface.co/datasets/prithivMLmods/Opendoc2-Analysis-Recognition
- Dataset Openpdf-Analysis-Recognition: https://huggingface.co/datasets/prithivMLmods/Openpdf-Analysis-Recognition
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Solicitudes de cuantizacion: https://huggingface.co/mradermacher/model_requests
- Grafico comparativo de cuantizaciones: https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Analisis de Artefact2 sobre cuantizaciones: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
