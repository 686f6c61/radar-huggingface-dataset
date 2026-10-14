# ahmedsamirtarjama/arabic-ocr-dots-ft-ocr-clean6k

## Resumen

arabic-ocr-dots-ft-ocr-clean6k es un ajuste fino experimental orientado a OCR y analisis de diseno de documentos en arabe, construido sobre el modelo multimodal rednote-hilab/dots.mocr (tambien referenciado en los metadatos como dots-studio/dots.mocr). Lo publica el usuario ahmedsamirtarjama como proyecto de investigacion, con el objetivo declarado de adaptar un modelo de OCR de documentos de proposito general al dominio arabigo.

Tecnicamente es un modelo de vision-lenguaje de aproximadamente 3.040 millones de parametros (3,04 B, dato verificado en los safetensors) con un tamano de repositorio de 6,1 GB, lo que es coherente con pesos en precision de 16 bits. El ajuste se realizo con LoRA de rango 64 fusionado posteriormente en los pesos base, manteniendo congelada la torre de vision. No se trata de un modelo MoE segun la informacion disponible.

Su relevancia es limitada pero acotada: no es un modelo de produccion, sino una prueba de concepto que documenta un flujo completo de fine-tuning LoRA sobre un OCR multimodal y su despliegue con vLLM. Los resultados no estan publicados en la model card, que remite a documentos externos (TEST_PROTOCOL.md y REPORT.md) alojados en un repositorio de datos no enlazado. El modelo acumula 0 descargas y 0 likes, y no declara licencia ni lista de idiomas soportados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo multimodal de vision-lenguaje para OCR y analisis de diseno de documentos, compuesto por torre de vision mas decodificador de lenguaje; arquitectura interna exacta no disponible |
| Parametros totales | 3.039.179.264 (3,04 B), dato de safetensors |
| Parametros activos | No aplica / no disponible (no se indica que sea MoE) |
| Longitud de contexto | No disponible (la model card solo indica max_tokens de generacion de 8192 en inferencia) |
| Tipos de cuantizacion | No disponible; solo se publican pesos safetensors sin cuantizaciones alternativas |
| Idiomas soportados | Arabe (segun tags del repositorio); lista completa no disponible |
| Licencia | No disponible |
| Formato de pesos | safetensors (libreria transformers) |
| Modelo base | rednote-hilab/dots.mocr (metadata tambien cita dots-studio/dots.mocr) |
| Tamano del repositorio | 6,1 GB |
| Pipeline declarado | text-generation |
| Metodo de ajuste | LoRA r64 fusionado en los pesos base; torre de vision congelada |
| Fecha de creacion | 2026-10-13 |
| Fecha de ultima actualizacion | 2026-10-13 |

## Arquitectura y entrenamiento

El modelo parte de rednote-hilab/dots.mocr, un sistema multimodal de OCR y comprension de documentos que combina una torre de vision con un decodificador de lenguaje. En este ajuste concreto, la torre de vision se mantiene congelada y unicamente se entrena un adaptador LoRA de rango 64 sobre la parte de lenguaje, que despues se fusiona en los pesos base para generar un checkpoint unico. El resultado son 3,04 B de parametros totales en un repositorio de 6,1 GB. No se especifican en la informacion disponible ni el numero de tokens de entrenamiento, ni la composicion exacta del dataset, ni si se aplicaron tecnicas de RLHF, DPO u otras fases de alineamiento posteriores.

El nombre del repositorio sugiere un conjunto de datos de aproximadamente 6000 muestras de OCR "limpias" (clean6k), aunque esta cifra no se confirma en la model card. El entrenamiento se realizo en un servidor interno (server3-ts, ruta /mnt/extra/ocr, directorio models/dots_ft_ocr_clean6k_merged), lo que refuerza el caracter de experimento interno sin infraestructura de publicacion asociada. La model card describe tambien un protocolo de inferencia con vLLM usando el prompt prompt_layout_all_en, temperatura 0,1, top_p 1,0 y max_tokens 8192, seguido de un postprocesado propietario de recorte (trim_tail y trim_v2) cuyo codigo se aloja en un repositorio de dataset denominado arabic-ocr-research-data.

## Capacidades

- Reconocimiento optico de caracteres (OCR) sobre documentos en arabe, con salida de texto plano.
- Analisis de diseno de documentos (document-layout): deteccion y estructura de regiones como bloques de texto, tablas, encabezados y elementos graficos, segun los tags y el nombre del prompt de inferencia empleado.
- Procesamiento multimodal: acepta imagenes de documentos como entrada, dado que deriva de un modelo con torre de vision.
- Generacion conversacional (tag conversational en el repositorio), aunque no se documenta su alcance real.
- Inferencia optimizada con vLLM, con soporte declarado de hasta 8192 tokens de generacion.
- Capacidad de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: unicamente se declara arabe; el resto de idiomas no esta documentado.
- Capacidades especiales (modo thinking, audio, vision adicional): no disponible, salvo la vision inherente al modelo base.

## Casos de uso

- Digitalizacion de archivos administrativos arabes: el modelo puede convertir imagenes de documentos oficiales en texto estructurado, aprovechando su entrenamiento especifico sobre corpus arabigo limpio. Es adecuado para proyectos de modernizacion de archivos publicos o privados.
- Extraccion de datos de facturas y recibos en arabe: combinando OCR y analisis de layout, permitiria aislar campos como importes, fechas o razones sociales en pipelines de contabilidad automatizada.
- Construccion de pipelines RAG sobre documentacion arabe: el OCR alimentaria un indice vectorial a partir de PDFs escaneados, y el analisis de layout ayudaria a segmentar el texto en unidades semanticas coherentes antes de la indexacion.
- Preservacion digital en bibliotecas y hemerotecas: para digitalizar prensa historica o fondos manuscritos en arabe, aunque la calidad final depende de la resolucion y del estado del original, no documentados por el autor.
- Procesamiento de formularios y cuestionarios: el modelo podria extraer respuestas y estructura de formularios escaneados, integrándose en flujos de validacion automatica con revision humana posterior.
- Investigacion academica en OCR arabe: sirve como punto de partida reproducible para experimentos de fine-tuning LoRA sobre OCR multimodal, dado que la model card describe el metodo de ajuste y el protocolo de inferencia.
- Automatizacion de atencion al ciudadano en administraciones arabofonas: clasificacion y extraccion de informacion de solicitudes y documentos adjuntos enviados por los usuarios, con derivacion al tramite correspondiente.
- Generacion de texto alternativo y accesibilidad: conversion de documentos escaneados en arabe a texto legible por lectores de pantalla, siempre que se valide la fidelidad del OCR.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card remite a los archivos docs/TEST_PROTOCOL.md y REPORT.md del repositorio arabic-ocr-research-data/code, a los que no se proporciona enlace directo ni valores numericos. No se dispone por tanto de cifras de CER, WER, mAP de layout ni comparaciones con otros sistemas.

## Requisitos de hardware

- VRAM estimada para inferencia en precision de 16 bits: en torno a 6,1 GB solo para los pesos, mas overhead de activaciones y cache KV; se recomienda un minimo de 10-12 GB de VRAM.
- VRAM estimada en cuantizacion de 8 bits: aproximadamente 3 GB de pesos mas overhead, lo que situaria el requisito practico en torno a 6-8 GB.
- VRAM estimada en cuantizacion de 4 bits: aproximadamente 1,6 GB de pesos mas overhead, con un requisito practico de 4-5 GB. Estas cifras son estimaciones teoricas derivadas del numero de parametros, ya que no se publican cuantizaciones oficiales.
- GPU recomendadas: NVIDIA A100, H100 o L40S para despliegue en servidor; RTX 4090 o RTX 3090 para uso local sin cuantizar.
- Compatibilidad con GPU de consumo: si, cabe en tarjetas de gama alta y media-alta (RTX 4090, 3090, 4080, 4070 Ti y similares) en 16 bits, y en tarjetas de 8 GB si se cuantiza.
- Opciones de despliegue: el autor documenta inferencia con vLLM. La libreria declarada es transformers, por lo que tambien es viable una carga directa con dicha libreria. No se mencionan soportes de llama.cpp, Ollama, TGI ni formatos GGUF.
- Latencia y throughput: no disponibles en la informacion proporcionada.
- Nota operativa: el repositorio contiene codigo personalizado (tag custom_code) y el flujo de inferencia requiere postprocesado propio (trim_tail y trim_v2), lo que anade complejidad al despliegue frente a un modelo estandar.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| arabic-ocr-dots-ft-ocr-clean6k | 3,04 B | No disponible | Arabe (segun tags) | No disponible | HuggingFace, 0 descargas |
| rednote-hilab/dots.mocr (modelo base) | No disponible en la informacion proporcionada | No disponible | Multilingue (no detallado) | No disponible | HuggingFace, modelo de referencia |
| GOT-OCR2.0 | No disponible en la informacion proporcionada | No disponible | Multilingue, sin foco en arabe documentado | No disponible en la informacion proporcionada | HuggingFace, modelo de OCR de documentos de referencia |
| Qwen2.5-VL (variante de 3 B) | No disponible en la informacion proporcionada | No disponible | Multilingue, con cobertura de arabe no detallada | No disponible en la informacion proporcionada | HuggingFace, familia de vision-lenguaje de uso general |

No se dispone de datos comparativos de rendimiento entre estas opciones en la informacion proporcionada. La comparacion se limita por tanto a categoria, tamano y disponibilidad.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados por el autor. Es esperable un sesgo hacia el dominio y el estilo tipografico del corpus de entrenamiento (aproximadamente 6000 muestras, segun el nombre del repositorio), lo que puede degradar el rendimiento en documentos con formatos, caligrafias o dialectos alejados de ese conjunto.
- Riesgo de alucinacion: inherente a los modelos de generacion de texto aplicados a OCR; el decodificador puede completar texto ausente en la imagen, especialmente en zonas de baja calidad o con oclusiones. No hay metricas publicadas que cuantifiquen este riesgo.
- Limitaciones de contexto: la longitud de contexto real no esta documentada. El unico dato operativo es un max_tokens de generacion de 8192, que no equivale a la ventana de contexto total del modelo.
- Limitaciones de idioma: solo se declara arabe; no se especifica la cobertura de variantes dialectales, escritura manuscrita ni documentos bilingues.
- Restricciones de licencia: la licencia no esta indicada, lo que impide determinar si el uso comercial esta permitido. Al ser un derivado de rednote-hilab/dots.mocr, la licencia del modelo base condiciona las condiciones de redistribucion y uso; conviene verificarla antes de cualquier despliegue productivo.
- Ausencia de validacion publica: 0 descargas, 0 likes y benchmarks no publicados en la model card. No existe evidencia externa de calidad ni replicacion independiente.
- Dependencia de codigo propietario: el protocolo de inferencia requiere scripts de postprocesado (trim_tail, trim_v2) y un prompt especifico (prompt_layout_all_en) alojados en un repositorio de datos no enlazado directamente, lo que dificulta la reproduccion.
- Adecuacion a produccion: se trata de un experimento de investigacion interno, sin garantias de estabilidad, soporte ni mantenimiento. No se recomienda su uso en produccion sin una evaluacion propia con datos representativos del caso de uso.
- Fecha de publicacion inusual (2026-10-13) respecto al contexto habitual de publicacion de modelos; se recomienda verificar la integridad y procedencia del repositorio.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ahmedsamirtarjama/arabic-ocr-dots-ft-ocr-clean6k
- Modelo base referenciado: https://huggingface.co/rednote-hilab/dots.mocr
- Modelo base alternativo citado en los metadatos: https://huggingface.co/dots-studio/dots.mocr
- Documentacion de resultados citada en la model card: docs/TEST_PROTOCOL.md y REPORT.md dentro del repositorio arabic-ocr-research-data/code (URL no disponible)
- Codigo de postprocesado citado: scripts trim_tail y trim_v2 en code/scripts/ del repositorio arabic-ocr-research-data (URL no disponible)
- Paper, blog o demo oficial: no disponible
