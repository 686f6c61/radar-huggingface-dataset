# mradermacher/Industry-Coder-27B-v2.0-i1-GGUF

## Resumen

Industry-Coder-27B-v2.0 es un modelo de lenguaje especializado en ingeniería de software industrial, desarrollado por kataguru y cuantizado en formato GGUF con imatrix por mradermacher. El modelo base se centra en dominios concretos de la automatización industrial: PLC, CNC, IEC 61131-3, TwinCAT, Siemens SCL y ciberseguridad industrial, además de capacidades generales de programación agéntica. Está etiquetado como multimodal (visión) e incluye MTP (multi-token prediction), y su arquitectura se relaciona con la familia Qwen (tags qwen3.8/qwen3_5), con un tamaño de unos 27.300 millones de parámetros.

Esta ficha cubre el repositorio de cuantizaciones imatrix de mradermacher, que permite ejecutar el modelo en hardware de consumo mediante llama.cpp, Ollama u otros runtimes compatibles con GGUF. La variante i1-Q4_K_S (15,9 GB) se señala como el punto óptimo entre tamaño, velocidad y calidad. El modelo es relevante para equipos de ingeniería de automatización que quieren asistentes de código locales para entornos OT/industriales, un nicho que los modelos generalistas cubren de forma deficiente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (familia Qwen, según tags del autor); no disponible mayor detalle |
| Parametros totales | 27.320.697.856 (dato real de safetensors) |
| Parametros activos | no disponible (no consta que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | imatrix i1: Q2_K, IQ2_XXS a Q6_K, IQ4_XS, Q4_K_S, Q5_K_M, etc. (lista completa de más de 20 variantes en el repo estático); base en bf16 |
| Idiomas soportados | finlandes (fi), ingles (en), estonio (et), hungaro (hu), turco (tr) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (este repo); safetensors en el modelo base |

## Arquitectura y entrenamiento

El modelo base, kataguru/Industry-Coder-27B-v2.0, es un transformer denso de unos 27,3 mil millones de parámetros, emparentado con la familia Qwen según los tags del autor (qwen3.8/qwen3_5). Los tags indican soporte multimodal (visión), MTP (multi-token prediction, técnica que acelera la decodificación al predecir varios tokens por paso) y capacidades conversacionales. El repositorio de mradermacher no altera la arquitectura: aplica cuantizaciones weighted/imatrix sobre los pesos bf16 originales, generando más de veinte variantes GGUF de distinto tamaño y fidelidad.

No se ha publicado información sobre el dataset de entrenamiento, el número de tokens, ni sobre el uso de RLHF, DPO u otras técnicas de alineación en la información disponible. Los tags "uncensored" y "anti-sycophancy" sugieren un ajuste orientado a respuestas directas sin filtros de complacencia, pero no hay documentación técnica que lo detalle.

## Capacidades

- Generación y razonamiento de código orientado a automatización industrial: PLC, CNC, IEC 61131-3, TwinCAT y Siemens SCL.
- Programación agéntica (agentic coding): apto para flujos multi-paso con herramientas, según los tags del autor.
- Ciberseguridad industrial como dominio cubierto.
- Capacidades multimodales de visión (el autor indica que es un modelo de visión; los ficheros mmproj se publican en el repo estático).
- Multi-token prediction (MTP) para acelerar la generación, según tags.
- Soporte multilingüe en finlandés, inglés, estonio, húngaro y turco.
- Estilo "anti-sycophancy": respuestas más directas, y sin censura según el autor.
- Tool calling / function calling: no disponible explícitamente, aunque el tag de agentic coding sugiere compatibilidad.

## Casos de uso

- Generación de código IEC 61131-3 para PLC: redacción de programas en lenguajes del estándar (LD, ST, FBD) a partir de descripciones funcionales, aprovechando el entrenamiento específico en este dominio.
- Desarrollo en TwinCAT y Siemens SCL: asistencia en proyectos TIA Portal o Beckhoff, generando bloques de función, estructuras de datos y lógica de control.
- Programación de CNC: generación y revisión de código G y lógica de mecanizado.
- Auditoría de ciberseguridad industrial: revisión de código y configuraciones OT buscando patrones inseguros en entornos de planta.
- Asistente de código agéntico local: integración en herramientas tipo CLI de agentes (por ejemplo, con backends llama.cpp) para tareas multi-archivo de ingeniería, sin enviar código propietario a la nube.
- Análisis de documentación técnica con imágenes: gracias a la capacidad de visión, puede combinarse con esquemas, capturas de HMI o planos para responder preguntas sobre ellos.
- Soporte multilingüe para equipos nórdicos y del este de Europa: útil en finlandés, estonio, húngaro y turco, idiomas poco cubiertos por la mayoría de modelos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (GGUF, pesos + contexto):
  - i1-Q2_K (11,0 GB): cabe en GPUs de 12 GB (RTX 3060 12 GB, RTX 4070) con contexto moderado.
  - i1-IQ3_M (12,9 GB): viable en 16 GB (RTX 4060 Ti 16 GB, RTX 4080).
  - i1-Q4_K_S (15,9 GB): recomendada para GPUs de 16-24 GB; en una RTX 4090 (24 GB) deja margen para contexto amplio.
  - Q6_K y variantes superiores: del orden de 22-28 GB; requieren RTX 4090, RTX 5090, A100 o descarga parcial a CPU/RAM.
- GPU recomendadas: RTX 4090 o RTX 5090 para la calidad óptima (Q4_K_S/Q5); A100/H100 para despliegue en servidor con vLLM sobre pesos bf16.
- Consumer GPU: sí, con las cuantizaciones de 11-16 GB en tarjetas de 12-24 GB.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, koboldcpp y cualquier runtime GGUF; para el modelo base en bf16, vLLM (según tags del autor). Los ficheros mmproj para visión están en el repo estático.
- Latencia y throughput: no disponible; el MTP del modelo base sugiere aceleración de decodificación, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Vision | Licencia | Notas |
|---|---|---|---|---|---|
| Industry-Coder-27B-v2.0 | 27,3 B | no disponible | sí (mmproj) | Apache 2.0 | Especializado en automatización industrial (PLC, CNC, SCL, TwinCAT) |
| Qwen3-32B (familia de referencia) | 32 B | no disponible en esta ficha | según variante | Apache 2.0 | Generalista fuerte en código; sin especialización OT/industrial |
| Qwen2.5-Coder-32B-Instruct | 32 B | no disponible en esta ficha | no | Apache 2.0 | Referente en código general; no cubre IEC 61131-3 ni SCL |

No existen muchos modelos abiertos comparables en el nicho de código industrial; la alternativa habitual es usar un generalista de código (Qwen2.5-Coder, DeepSeek-Coder) sin fine-tuning específico para PLC/CNC.

## Limitaciones y advertencias

- El modelo está etiquetado como "uncensored": no incluye los filtros de seguridad habituales; extremar precauciones en despliegues expuestos a usuarios finales.
- El enfoque "anti-sycophancy" puede producir respuestas más secas o directamente contradictorias con el usuario; conviene evaluarlo en el flujo de trabajo antes de adoptarlo.
- No hay benchmarks publicados ni documentación del entrenamiento en el repositorio consultado: la calidad real en cada tarea debe validarse empíricamente.
- Los idiomas soportados declarados (fi, en, et, hu, tr) no incluyen el castellano; el rendimiento en español no está garantizado ni documentado.
- La longitud de contexto no está publicada; verificarla antes de diseñar flujos con documentos largos.
- Las cuantizaciones agresivas (Q2_K, IQ1/IQ2) degradan notablemente la calidad, especialmente en código; el propio autor recomienda IQ3_XXS o superiores.
- Para usar la capacidad de visión con GGUF hay que descargar los ficheros mmproj del repositorio estático, no de este.
- Licencia Apache 2.0: sin restricciones relevantes para uso comercial.

## Enlaces

- Repositorio de cuantizaciones imatrix (esta ficha): https://huggingface.co/mradermacher/Industry-Coder-27B-v2.0-i1-GGUF
- Modelo base: https://huggingface.co/kataguru/Industry-Coder-27B-v2.0
- Cuantizaciones estáticas (incluye mmproj para visión): https://huggingface.co/mradermacher/Industry-Coder-27B-v2.0-GGUF
- Página de descargas resumida: https://hf.tst.eu/model#Industry-Coder-27B-v2.0-i1-GGUF
- FAQ y solicitudes de cuantización: https://huggingface.co/mradermacher/model_requests
- Guía de uso de GGUF de TheBloke: https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Notas sobre calidad de cuants (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Empresa del cuantizador: https://www.nethype.de/
