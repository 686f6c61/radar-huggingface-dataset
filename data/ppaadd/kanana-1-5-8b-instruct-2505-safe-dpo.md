# PPAADD/kanana-1.5-8b-instruct-2505-Safe-DPO

## Resumen

El modelo `PPAADD/kanana-1.5-8b-instruct-2505-Safe-DPO` es un ajuste fino (fine-tune) del modelo `kakaocorp/kanana-1.5-8b-instruct-2505`, desarrollado por el usuario PPAADD. El modelo base, creado por Kakao, es la versión 1.5 de la familia Kanana, un modelo de lenguaje bilingüe (coreano e inglés) con arquitectura Llama, de 8 mil millones de parámetros, orientado a tareas de codificación, matemáticas y function calling. El sufijo "Safe-DPO" sugiere que se ha aplicado un entrenamiento con optimización de preferencia directa (DPO) para alinear el comportamiento del modelo con criterios de seguridad, aunque no se dispone de documentación oficial que detalle el proceso.

La relevancia de este modelo radica en que parte de una base sólida con capacidades demostradas en razonamiento y generación de código, y el fine-tune busca mejorar la seguridad y la adherencia a instrucciones. Sin embargo, la model card del repositorio está prácticamente vacía, por lo que la información disponible es limitada y se infiere principalmente del modelo original. El modelo tiene 8.030.285.824 parámetros y está disponible en formato safetensors, compatible con la librería transformers.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Llama (basada en el modelo original kakaocorp/kanana-1.5-8b-instruct-2505) |
| Parametros totales | 8.030.285.824 |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | 32.000 tokens (extensible a 128.000 según el modelo base) |
| Tipos de cuantizacion | no disponible (solo safetensors en el repo) |
| Idiomas soportados | no disponible (el modelo base soporta coreano e inglés) |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo base `kanana-1.5-8b-instruct-2505` emplea una arquitectura transformer densa basada en el diseño de Llama, con 8.000 millones de parámetros. Según la información publicada por Kakao, la versión 1.5 incorpora mejoras sustanciales en codificación, matemáticas y function calling respecto a la versión anterior. El modelo soporta una longitud de contexto de 32.000 tokens, ampliable a 128.000 mediante técnicas de interpolación de posición. El fine-tune `Safe-DPO` añade una capa de alineación mediante DPO (Direct Preference Optimization), un método que optimiza directamente las preferencias humanas sin necesidad de un modelo de recompensa separado. No se dispone de detalles sobre el dataset de entrenamiento, el número de tokens utilizados o los hiperparámetros del proceso de DPO.

## Capacidades

- Generación de texto y conversación multi-turno, heredadas del modelo base.
- Razonamiento matemático y lógico, con mejoras específicas en la versión 1.5.
- Generación de código en múltiples lenguajes, con soporte mejorado para tareas de programación.
- Function calling / tool calling, lo que permite integrar el modelo en agentes y flujos de trabajo automatizados.
- Capacidades multilingües limitadas al coreano e inglés (según el modelo base).
- El ajuste con DPO busca reforzar comportamientos seguros y reducir respuestas dañinas, aunque no hay evidencia pública de su efectividad.

## Casos de uso

- Asistente de programación en entornos de desarrollo: el modelo puede generar fragmentos de código, explicar algoritmos y depurar errores, aprovechando sus capacidades mejoradas en codificación. Su ventana de contexto de 32K permite procesar archivos de código extensos o múltiples funciones en una sola consulta.
- Automatización de tareas de oficina con function calling: gracias al soporte de tool calling, puede integrarse en pipelines que interactúan con APIs, bases de datos o servicios externos, por ejemplo para generar informes o consultar datos.
- Tutor virtual de matemáticas: el modelo puede resolver problemas paso a paso y explicar conceptos, útil en plataformas educativas o asistentes de estudio.
- Chatbot de atención al cliente bilingüe (coreano e inglés): con su capacidad de conversación multi-turno y contexto largo, puede mantener diálogos coherentes con usuarios que alternan idiomas.
- Generación de documentación técnica: puede redactar comentarios de código, manuales de API o guías de usuario a partir de especificaciones, reduciendo el trabajo manual de los desarrolladores.
- Prototipado rápido de agentes conversacionales: su tamaño de 8B permite desplegarlo en infraestructura moderada, facilitando la experimentación con sistemas de diálogo antes de escalar a modelos mayores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El modelo base `kakaocorp/kanana-1.5-8b-instruct-2505` no incluye métricas cuantitativas en la documentación consultada, y el fine-tune `Safe-DPO` tampoco presenta evaluaciones propias.

## Requisitos de hardware

- VRAM estimada para inferencia: con 8.030 millones de parámetros en precisión fp16, el modelo requiere aproximadamente 16 GB de VRAM solo para los pesos. Con cuantización a 8 bits se reduce a unos 8 GB, y a 4 bits a unos 4-5 GB, aunque no se ofrecen archivos cuantizados en el repositorio.
- GPU recomendadas: una RTX 4090 (24 GB) o una A100 (40 GB) son suficientes para inferencia en fp16. Para cuantización 4-bit, una RTX 3090 o RTX 4080 (16 GB) sería viable.
- El modelo cabe en GPUs de consumo si se aplica cuantización, pero no se proporcionan versiones GGUF ni AWQ en el repo.
- Opciones de despliegue: al estar en formato safetensors y ser compatible con transformers, puede servirse con vLLM, Text Generation Inference (TGI) o directamente con la librería transformers. Para cuantización, se puede usar bitsandbytes o GPTQ.
- Latencia y throughput: no disponibles. Dependerán del hardware y del backend elegido.

## Comparativa con modelos similares

La comparativa se realiza con el modelo base y otras alternativas de tamaño similar (8B) que son comunes en el ecosistema. Los datos de rendimiento no están disponibles para ninguno de ellos en esta ficha, por lo que la comparación es estructural.

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| PPAADD/kanana-1.5-8b-instruct-2505-Safe-DPO | 8.03B | 32K (ext. 128K) | no disponible | Fine-tune con DPO del modelo de Kakao |
| kakaocorp/kanana-1.5-8b-instruct-2505 | 8.03B | 32K (ext. 128K) | no disponible | Modelo base, bilingüe coreano-inglés |
| meta-llama/Llama-3.1-8B-Instruct | 8.03B | 128K | Llama 3.1 Community License | Modelo generalista, multilingüe |
| Qwen/Qwen2.5-7B-Instruct | 7.61B | 128K | Apache 2.0 | Modelo multilingüe con buenos resultados en código |

## Limitaciones y advertencias

- La model card del repositorio no proporciona información sobre sesgos, riesgos o limitaciones específicas del fine-tune. Se desconoce el proceso de alineación y su efectividad real.
- El modelo base está entrenado principalmente en coreano e inglés; su rendimiento en otros idiomas, incluido el español, puede ser limitado.
- No se dispone de licencia explícita, lo que genera incertidumbre sobre el uso comercial. Se recomienda contactar al autor antes de utilizarlo en producción.
- El riesgo de alucinación no está documentado; como cualquier modelo generativo, puede producir contenido plausible pero incorrecto.
- Al ser un fine-tune sin documentación técnica, no se puede verificar la calidad del ajuste DPO ni su impacto en las capacidades originales.
- El repositorio tiene 0 descargas y 0 likes, lo que sugiere que no ha sido validado por la comunidad.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/PPAADD/kanana-1.5-8b-instruct-2505-Safe-DPO
- Modelo base en HuggingFace: https://huggingface.co/kakaocorp/kanana-1.5-8b-instruct-2505
- Repositorio GitHub de Kakao (Kanana): https://github.com/kakao/kanana
- Ficha del modelo en AIBase: https://model.aibase.com/models/details/1927649989316841472
