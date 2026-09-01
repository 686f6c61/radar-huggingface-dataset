# Clownstein/Black-Onyx-12B

## Resumen

Black-Onyx-12B es un modelo de lenguaje de gran tamaño desarrollado por el usuario Clownstein, concebido como un ajuste fino (fine-tune) del modelo base `google/gemma-4-12B-it` de Google. Su propósito declarado es especializarse en ciberseguridad, con énfasis en generación de código seguro, inteligencia de amenazas (threat intelligence) y detección de vulnerabilidades. El modelo se distribuye con acceso restringido (gated) en HuggingFace, lo que implica que los usuarios deben aceptar condiciones específicas antes de poder descargarlo.

Con aproximadamente 11,96 mil millones de parámetros, se sitúa en la gama de modelos de 12B, un tamaño que permite su ejecución en hardware de consumo con cuantización adecuada. Aunque no se han publicado detalles técnicos completos sobre su arquitectura interna o su proceso de entrenamiento, su base Gemma 4 sugiere una arquitectura transformer estándar con atención de múltiples cabezas. La relevancia actual del modelo radica en la creciente demanda de herramientas de IA especializadas en seguridad ofensiva y defensiva, donde la capacidad de analizar código, identificar fallos y generar parches seguros es crítica.

El repositorio asociado en GitHub, también llamado Black-Onyx, describe un espacio de trabajo de inteligencia de amenazas orientado a equipos de blue team, lo que indica que el modelo podría estar integrado en un ecosistema más amplio de análisis de incidentes y correlación de alertas. No obstante, la información pública sobre el modelo en sí es escasa, y muchos parámetros técnicos permanecen sin documentar.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (basada en Gemma 4 12B, sin detalles adicionales) |
| Parametros totales | 11.959.730.224 |
| Parametros activos | no disponible (no se especifica si es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (se distribuye en safetensors, sin cuantizaciones publicadas) |
| Idiomas soportados | no disponible |
| Licencia | Gemma (licencia de Google para modelos Gemma) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

No se dispone de información pública detallada sobre la arquitectura interna del modelo más allá de su base en `google/gemma-4-12B-it`. Gemma 4 es una familia de modelos transformer de Google, con atención de múltiples cabezas y normalización previa, aunque las especificaciones exactas de esta versión (número de capas, dimensiones de atención, etc.) no han sido reveladas por el autor del fine-tune.

En cuanto al entrenamiento, se sabe que es un ajuste fino del modelo instruct de Gemma 4 12B, pero no se han publicado datos sobre el conjunto de datos utilizado, el número de tokens de entrenamiento, ni si se aplicaron técnicas como RLHF o DPO. Los tags del modelo (`cybersecurity`, `secure-code-generation`, `threat-intelligence`, `vulnerability-detection`) sugieren que el fine-tune se realizó sobre un corpus especializado en seguridad informática, pero no hay confirmación oficial. Tampoco se mencionan innovaciones técnicas como decodificación especulativa o atención lineal.

## Capacidades

- Generación de código seguro: el modelo está orientado a producir código que evite vulnerabilidades comunes (inyección SQL, desbordamiento de búfer, etc.).
- Detección de vulnerabilidades: puede analizar fragmentos de código o configuraciones para identificar posibles fallos de seguridad.
- Inteligencia de amenazas: capacidad de procesar y correlacionar indicadores de compromiso (IOCs) y datos de fuentes de amenazas.
- Análisis de incidentes: apoyo en la triage de alertas y en la investigación de eventos de seguridad.
- Soporte multilingüe: no especificado, pero al estar basado en Gemma 4, es probable que herede capacidades multilingües del modelo base, aunque no se confirma.
- Tool calling y agentes: no se menciona soporte explícito para function calling o razonamiento multi-paso, aunque podría heredarlo de Gemma 4 instruct.

## Casos de uso

- Auditoría de código en entornos CI/CD: el modelo puede integrarse en pipelines de integración continua para revisar automáticamente los cambios de código en busca de patrones inseguros, generando alertas o sugerencias de parche antes del despliegue.
- Análisis de malware: dado su enfoque en threat intelligence, puede asistir a analistas en la descripción de comportamientos maliciosos a partir de muestras de código o binarios desensamblados.
- Generación de informes de incidentes: a partir de datos de alertas y logs, el modelo puede redactar resúmenes ejecutivos y técnicos de incidentes de seguridad, ahorrando tiempo a los equipos de respuesta.
- Enriquecimiento de IOCs: puede procesar listas de indicadores de compromiso y generar contexto adicional (tipo de amenaza, familia de malware, etc.) para alimentar plataformas SIEM o TIP.
- Educación y formación en seguridad: como herramienta de práctica, puede generar ejercicios de código vulnerable y sus soluciones seguras para cursos de desarrollo seguro.
- Asistente en red teaming: aunque el acceso es restringido, podría usarse para generar payloads de prueba o scripts de explotación controlados en entornos autorizados, siempre bajo supervisión ética.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay datos de MMLU, HumanEval, GSM8K ni otras métricas estándar para este modelo. Tampoco se han encontrado comparaciones con otros modelos de ciberseguridad en la documentación pública.

## Requisitos de hardware

- VRAM estimada para inferencia: con 11,96 mil millones de parámetros, en FP16 se requieren aproximadamente 24 GB de VRAM. Con cuantización de 8 bits, unos 12 GB; con 4 bits, unos 6 GB. Estas son estimaciones estándar para modelos de este tamaño, no cifras oficiales.
- GPU recomendadas: para FP16, una NVIDIA A100 (40 GB) o RTX A6000 (48 GB). Para cuantización 8 bits, una RTX 4090 (24 GB) es suficiente. Para 4 bits, una RTX 3080 (10 GB) o RTX 4060 Ti (16 GB) pueden bastar.
- Compatibilidad con GPU de consumo: sí, con cuantización adecuada (4 bits) cabe en tarjetas de gama media-alta.
- Opciones de despliegue: al estar en formato safetensors, puede cargarse con bibliotecas como Transformers, vLLM, TGI o llama.cpp (si se convierte a GGUF). No se han publicado archivos GGUF ni integraciones específicas con Ollama.
- Latencia y throughput: no disponibles. Dependerán del hardware y del backend de inferencia.

## Comparativa con modelos similares

No se dispone de datos comparativos fiables. Existen otros modelos de ciberseguridad como WhiteRabbitNeo (basado en Llama) o SecGPT, pero no se han encontrado benchmarks públicos que permitan una comparación objetiva con Black-Onyx-12B. La información disponible no incluye métricas de rendimiento ni especificaciones detalladas de estos alternativos en el contexto de esta ficha.

## Limitaciones y advertencias

- Acceso restringido: el modelo es gated, por lo que requiere aceptar condiciones en HuggingFace. Esto puede limitar su uso en entornos corporativos que necesiten revisar la licencia.
- Licencia Gemma: la licencia de Google para modelos Gemma impone restricciones de uso comercial y requiere cumplir sus términos. Es necesario revisar la licencia específica antes de cualquier despliegue en producción.
- Sesgos y alucinaciones: al ser un fine-tune sobre un modelo base, puede heredar sesgos de los datos de entrenamiento originales y del corpus de seguridad utilizado. Existe riesgo de alucinación en recomendaciones de seguridad, lo que podría llevar a falsos positivos o negativos en análisis.
- Falta de documentación: no se han publicado detalles sobre el conjunto de datos de fine-tune, el proceso de entrenamiento ni las métricas de evaluación, lo que dificulta evaluar su fiabilidad.
- Limitaciones de contexto: se desconoce la longitud de contexto soportada, lo que puede ser un problema para analizar archivos de código extensos o logs largos.
- Riesgo de uso malintencionado: al estar orientado a ciberseguridad, podría ser utilizado para generar exploits o malware. El acceso restringido intenta mitigar esto, pero no es una garantía.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Clownstein/Black-Onyx-12B
- Repositorio GitHub del proyecto Black-Onyx: https://github.com/Clownstein/Black-Onyx
- Documentación de API del proyecto (GitHub): https://github.com/Clownstein/Black-Onyx/blob/main/docs/API.md
