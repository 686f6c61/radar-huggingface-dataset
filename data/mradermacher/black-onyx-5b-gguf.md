# mradermacher/Black-Onyx-5B-GGUF

## Resumen

Black-Onyx-5B-GGUF es la versión cuantizada en formato GGUF del modelo Black-Onyx-5B, desarrollado originalmente por el usuario atmike y cuantizado por mradermacher. Se trata de un modelo de lenguaje especializado en ciberseguridad, con capacidades orientadas a la generación de código seguro, la detección de vulnerabilidades y el análisis de inteligencia de amenazas. Está construido sobre la arquitectura Gemma, lo que lo vincula a la familia de modelos abiertos de Google.

El modelo cuenta con aproximadamente 4.650 millones de parámetros (4.647.450.147 según los pesos en safetensors) y está diseñado para tareas conversacionales en inglés. Su relevancia radica en la especialización vertical: en lugar de ser un modelo generalista, se enfoca en dominios de seguridad informática, lo que puede resultar útil para equipos de seguridad que necesitan asistencia automatizada en revisión de código, análisis de amenazas o generación de parches.

La versión GGUF, publicada por mradermacher, permite ejecutar el modelo en hardware de consumo mediante llama.cpp y herramientas compatibles, con múltiples niveles de cuantización que van desde Q2_K (3,1 GB) hasta f16 (9,4 GB). El repositorio ocupa 49,6 GB e incluye también archivos mmproj para funcionalidad multimodal.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer basada en Gemma (según tags del modelo) |
| Parametros totales | 4.647.450.147 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16, mmproj-Q8_0, mmproj-f16 |
| Idiomas soportados | en (inglés) |
| Licencia | gemma (Gemma Terms of Use) |
| Formato de pesos | GGUF (safetensors en el modelo base) |

## Arquitectura y entrenamiento

La información disponible indica que el modelo base es atmike/Black-Onyx-5B, construido sobre la arquitectura Gemma. No se dispone de detalles sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO. Los tags del modelo sugieren un ajuste orientado a dominios de ciberseguridad (cybersecurity, secure-code-generation, threat-intelligence, vulnerability-detection), pero no se especifica la metodología de fine-tuning empleada.

La versión aquí descrita es una cuantización estática realizada por mradermacher mediante herramientas de conversión a GGUF. El autor indica que las cuantizaciones ponderadas con imatrix no estaban disponibles en el momento de la publicación. Se incluyen archivos mmproj (multi-modal supplement) en Q8_0 y f16, lo que sugiere que el modelo base podría tener capacidades multimodales, aunque no se detalla su alcance.

## Capacidades

- Generación de texto conversacional en inglés.
- Generación de código seguro (secure-code-generation), orientada a prácticas de programación defensiva.
- Detección de vulnerabilidades en código y configuraciones.
- Análisis de inteligencia de amenazas (threat-intelligence).
- Posible soporte multimodal gracias a los archivos mmproj incluidos (alcance no especificado).
- No se dispone de información sobre soporte de tool calling, function calling, agentes o multi-step reasoning.
- No se dispone de información sobre modo thinking ni otras capacidades especiales.

## Casos de uso

- Revisión de código en busca de vulnerabilidades: el modelo puede analizar fragmentos de código y señalar patrones inseguros, gracias a su especialización en vulnerability-detection y secure-code-generation.
- Asistencia en generación de parches seguros: un equipo de desarrollo podría usar el modelo para proponer correcciones a código vulnerable, apoyándose en su entrenamiento orientado a código seguro.
- Análisis de informes de amenazas: el modelo puede resumir y extraer información relevante de textos de threat-intelligence en inglés.
- Formación en seguridad: puede emplearse como asistente conversacional para explicar conceptos de ciberseguridad y buenas prácticas de codificación.
- Triaje de alertas de seguridad: con su capacidad conversacional, podría ayudar a clasificar y contextualizar alertas en inglés dentro de un flujo de trabajo SOC.
- Despliegue local en entornos air-gapped: al estar en formato GGUF y pesar entre 3,1 y 9,4 GB según cuantización, puede ejecutarse en estaciones de trabajo sin conexión, algo relevante en entornos de seguridad que no permiten enviar código a APIs externas.
- Prototipado rápido con llama.cpp u Ollama: útil para evaluar la utilidad del modelo en un pipeline de seguridad antes de invertir en infraestructura mayor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 3,1 GB (Q2_K) hasta 5,1 GB (Q8_0) para los pesos, más overhead de contexto y KV cache. La versión f16 requiere unos 9,4 GB solo para pesos.
- GPU recomendadas: no especificadas por el autor. Por tamaño, cabe en GPUs de consumo como RTX 3060 (12 GB), RTX 4060 Ti (16 GB), RTX 4070 (12 GB), RTX 4080 (16 GB) y RTX 4090 (24 GB) con cuantizaciones Q4 a Q8.
- Cabe en GPU de consumo: sí, en la mayoría de GPUs con 8 GB o más de VRAM usando cuantizaciones Q4_K_S o Q4_K_M (3,5 GB).
- Opciones de despliegue: llama.cpp, Ollama, y cualquier runtime compatible con GGUF. El modelo base es compatible con transformers.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Especializacion |
|---|---|---|---|---|---|
| Black-Onyx-5B-GGUF | ~4,65 B | no disponible | gemma | GGUF | Ciberseguridad |
| Modelos Gemma base (2B/7B) | 2 B / 7 B | no disponible | gemma | safetensors, GGUF | Generalista |
| Modelos de código generalistas (p. ej. variantes de 6-7B) | 6-7 B | variable | variable | safetensors, GGUF | Código general |

No se dispone de datos de rendimiento comparativo para establecer una comparación cuantitativa con alternativas. La comparación se limita a parámetros, licencia y formato.

## Limitaciones y advertencias

- El modelo solo soporta inglés según la model card; no se garantiza un rendimiento adecuado en castellano u otros idiomas.
- No se dispone de información sobre sesgos conocidos ni sobre evaluación de alucinaciones.
- La licencia es "gemma" (Gemma Terms of Use), que impone restricciones específicas para uso comercial; es necesario revisar los términos antes de un despliegue en producción.
- No se especifica la longitud de contexto, lo que dificulta planificar casos de uso con documentos largos.
- El modelo tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay evidencia de validación por parte de la comunidad.
- Al ser una cuantización estática sin imatrix, las cuantizaciones de baja precisión (Q2_K, Q3_K) pueden degradar notablemente la calidad.
- No hay información sobre tool calling ni soporte para agentes, lo que limita su integración en pipelines automatizados complejos.
- El tamaño del repositorio (49,6 GB) incluye todas las cuantizaciones; descargar solo el archivo necesario.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mradermacher/Black-Onyx-5B-GGUF
- Modelo base: https://huggingface.co/atmike/Black-Onyx-5B
- Página de descargas del cuantizador: https://hf.tst.eu/model#Black-Onyx-5B-GGUF
- Preguntas frecuentes del cuantizador: https://huggingface.co/mradermacher/model_requests
- Guía de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Análisis de cuantizaciones de Artefact2: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
