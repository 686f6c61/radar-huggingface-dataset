# mradermacher/CyberQwen-14B-Security-GGUF

## Resumen

CyberQwen-14B-Security-GGUF es la versión cuantizada en formato GGUF del modelo AarthShah/CyberQwen-14B-Security, un ajuste fino de Qwen de 14 000 millones de parámetros orientado a ciberseguridad. Lo publica mradermacher, un conocido cuantizador de la comunidad de Hugging Face que genera versiones estáticas de modelos populares para su uso con llama.cpp, Ollama y LM Studio. El modelo base está especializado en reparación de vulnerabilidades, clasificación de CWE (Common Weakness Enumeration), análisis con Semgrep, tareas de SOC analyst, DevSecOps, tool calling y razonamiento sobre código.

La relevancia de esta ficha radica en que el modelo original solo se distribuye en pesos completos (safetensors), lo que exige hardware de gama alta para inferencia. Las cuantizaciones GGUF permiten ejecutar el modelo en GPUs de consumo e incluso en CPU, manteniendo un equilibrio razonable entre calidad y requisitos de memoria. El modelo base tiene 14 770 033 664 parámetros y fue entrenado sobre el dataset AarthShah/cybersecurity-dataset-v3.

La licencia es Apache 2.0, lo que facilita el uso comercial y la integración en productos de seguridad. No obstante, la información pública disponible sobre arquitectura interna, contexto nativo y benchmarks es escasa, por lo que muchos parámetros técnicos se indican como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivado de Qwen, detalles no disponibles) |
| Parametros totales | 14 770 033 664 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0 |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (safetensors en el modelo base) |

## Arquitectura y entrenamiento

El modelo base es un ajuste fino de un Qwen de 14 000 millones de parámetros, por lo que hereda la arquitectura transformer decoder-only típica de la familia Qwen. La model card del cuantizador no detalla la arquitectura interna exacta (número de capas, dimensiones ocultas, mecanismo de atención), y no se especifica si emplea atención completa o variantes como GQA. El entrenamiento se realizó sobre el dataset AarthShah/cybersecurity-dataset-v3, con etiquetas que apuntan a reparación de vulnerabilidades, CWE, Semgrep, SOC analyst, DevSecOps, Cyberseceval y Purple Llama. No se documenta el número de tokens de entrenamiento, la composición exacta del dataset ni si hubo fases de RLHF o DPO.

La innovación principal de esta publicación no está en el modelo en sí, sino en la cuantización: mradermacher genera cuantizaciones estáticas (no ponderadas ni imatrix) con la herramienta de conversión de llama.cpp. El proceso parte de pesos en formato Hugging Face (convert_type: hf) y produce 11 variantes de cuantización, desde Q2_K (5,9 GB) hasta Q8_0 (15,8 GB). No hay cuantizaciones imatrix disponibles según la model card. El chat template está incluido, lo que facilita el uso conversacional.

## Capacidades

- Generación de texto y razonamiento especializado en ciberseguridad.
- Reparación de vulnerabilidades y clasificación de CWE.
- Análisis estático de código con Semgrep y tareas de DevSecOps.
- Soporte de tool calling y function calling, con etiquetas explícitas en el repositorio.
- Capacidades de agente y razonamiento multi-paso (multi-step reasoning).
- Generación y análisis de código (code generation, code reasoning).
- Tareas de SOC analyst: triaje de alertas, análisis de incidentes y correlación de eventos.
- Capacidades conversacionales multi-turno gracias al chat template incluido.
- Evaluación de seguridad alineada con Cyberseceval y Purple Llama.
- Idioma: únicamente inglés.

## Casos de uso

- Triaje de alertas en un SOC: el modelo puede clasificar alertas de seguridad, priorizar incidentes y generar resúmenes accionables para analistas, aprovechando su entrenamiento específico en tareas de SOC analyst y su capacidad de razonamiento multi-paso.
- Revisión de código en pipelines de CI/CD: integrado como paso de análisis, el modelo puede detectar patrones de vulnerabilidad, sugerir parches y clasificar hallazgos por CWE, complementando herramientas como Semgrep.
- Reparación automática de vulnerabilidades: dado un fragmento de código vulnerable y su CWE asociado, el modelo puede proponer una versión corregida, lo que resulta útil en flujos de DevSecOps con revisión humana posterior.
- Asistente de análisis estático: el modelo puede interpretar resultados de Semgrep y explicar al desarrollador por qué una regla se ha disparado y cómo remediar el problema, reduciendo falsos positivos mediante razonamiento contextual.
- Generación de reglas y consultas de seguridad: puede redactar reglas de detección, consultas de búsqueda de logs o políticas de seguridad a partir de descripciones en lenguaje natural, gracias a su soporte de tool calling y generación de código.
- Formación y concienciación en seguridad: desplegado en local con Ollama o LM Studio, puede servir como tutor para equipos de desarrollo que necesitan entender vulnerabilidades comunes sin enviar código sensible a servicios en la nube.
- Evaluación de cumplimiento y auditoría: el modelo puede revisar configuraciones y políticas contra marcos de referencia, generando informes estructurados con referencias a CWEs y buenas prácticas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia según cuantización: Q2_K ~5,9 GB; Q4_K_M ~9,1 GB; Q6_K ~12,2 GB; Q8_0 ~15,8 GB. Hay que añadir memoria para el contexto KV cache, que depende de la longitud de contexto configurada (no documentada).
- GPU recomendadas: para Q4_K_M, una RTX 3060 de 12 GB o RTX 4060 Ti de 16 GB es suficiente; para Q6_K y Q8_0, se recomienda RTX 4070 Ti Super, RTX 4080, RTX 4090 o GPUs de datacenter como A100 o H100.
- Cabe en GPU de consumo: sí, en todas las cuantizaciones desde Q2_K hasta Q8_0 con GPUs de 8 GB o más (Q2_K y Q3_K_S caben en 8 GB; Q4_K_M requiere ~10 GB efectivos; Q8_0 requiere 16 GB o más).
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, y servidores compatibles con GGUF. El repositorio incluye etiquetas para endpoints_compatible, ollama y lmstudio.
- Latencia y throughput estimados: no disponibles. Dependen en gran medida del hardware, la cuantización y la longitud de contexto.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Especializacion | Licencia | Formato |
|---|---|---|---|---|---|
| CyberQwen-14B-Security-GGUF | 14,77 B | No disponible | Ciberseguridad, CWE, Semgrep | Apache 2.0 | GGUF |
| Qwen2.5-14B-Instruct | 14,7 B | 32 768 tokens (tipico en la familia Qwen2.5) | Generico, codigo, razonamiento | Apache 2.0 | Safetensors, GGUF |
| Llama-3.1-8B-Instruct | 8 B | 128 000 tokens | Generico, tool calling | Llama 3.1 Community | Safetensors, GGUF |
| CodeQwen1.5-7B | 7 B | 64 000 tokens | Codigo | Apache 2.0 | Safetensors, GGUF |

La comparativa es orientativa: no se dispone de benchmarks del modelo especializado que permitan una comparación cuantitativa con las alternativas. La ventaja principal de CyberQwen-14B-Security es su ajuste específico en ciberseguridad y su licencia Apache 2.0, mientras que los modelos genéricos ofrecen contextos más largos documentados y ecosistemas más maduros.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados en la información disponible; al entrenarse sobre un dataset específico de ciberseguridad, puede tener sesgos hacia patrones y herramientas concretas (Semgrep, CWE).
- Riesgo de alucinación: presente como en cualquier modelo de lenguaje; en dominios de seguridad, una alucinación puede producir falsos negativos o recomendaciones de parche incorrectas, por lo que se requiere validación humana.
- Limitaciones de contexto: la longitud de contexto nativa no está documentada, lo que impide garantizar el análisis de ficheros o logs extensos.
- Limitaciones de idioma: solo inglés; no se garantiza un rendimiento adecuado en castellano u otros idiomas.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero conviene verificar las obligaciones de atribución y las licencias del modelo base y del dataset de entrenamiento.
- Caveat para producción: las cuantizaciones estáticas (sin imatrix) pueden degradar la calidad en comparación con los pesos originales, especialmente en Q2_K y Q3_K. Para tareas críticas de seguridad, se recomienda Q6_K o Q8_0, o bien el modelo base en safetensors.
- El repositorio ocupa 102 GB, lo que exige planificar el almacenamiento y la descarga selectiva de la cuantización deseada.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mradermacher/CyberQwen-14B-Security-GGUF
- Modelo base: https://huggingface.co/AarthShah/CyberQwen-14B-Security
- Dataset de entrenamiento: https://huggingface.co/datasets/AarthShah/cybersecurity-dataset-v3
- Página de descargas del cuantizador: https://hf.tst.eu/model#CyberQwen-14B-Security-GGUF
- Guía de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Comparativa de cuantizaciones (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Peticiones de cuantización: https://huggingface.co/mradermacher/model_requests
- nethype GmbH: https://www.nethype.de/
