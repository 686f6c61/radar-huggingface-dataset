# Bhar1324/outdoorpal

## Resumen

OutdoorPal no es un modelo nuevo: es un repositorio que apunta a `Qwen/Qwen2.5-1.5B-Instruct` (1,54 B de parámetros) como componente de generación de lenguaje natural dentro de un asistente de recomendación de actividades al aire libre. El autor lo declara explícitamente: el modelo se usa tal cual, sin fine-tuning, sin adaptadores ni cambios en los pesos. Su función es convertir la salida estructurada de un motor de reglas (origen, tres mejores combinaciones recinto-hora-puntuación, resumen meteorológico, bloqueos, motivos y consejos) en prosa legible para el usuario.

La relevancia del repositorio no está en el modelo, sino en el patrón de uso que documenta: un SLM pequeño constreñido por prompt de sistema para no inventar datos, alimentado únicamente con hechos obtenidos en vivo de Open-Meteo y OpenStreetMap, con salida limitada a 350 tokens nuevos, temperatura 0,4 y top-p 0,85, y con un bloque `### Sources` añadido de forma determinista después de la generación. Si la llamada al modelo falla (red, límite de peticiones), el sistema cae a un generador de plantillas determinista igualmente fundamentado en los datos en vivo.

Es un caso útil para quien evalúe arquitecturas de "generación fundamentada" (grounded generation) con modelos de menos de 3 B en producción: muestra cómo separar razonamiento determinista (reglas + datos) de la capa de redacción, y cómo evitar que la memoria paramétrica del modelo contamine la respuesta. Conviene señalar que el modelo base no se distribuye en este repositorio y que la model card marca `inference: false`.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (Qwen2), según el modelo base Qwen2.5-1.5B-Instruct; este repositorio no introduce cambios |
| Parámetros totales | 1,54 B (modelo base) |
| Parámetros activos | No aplica: modelo denso, no MoE |
| Longitud de contexto | No indicada en la model card; según la documentación pública del modelo base, 32 768 tokens |
| Tipos de cuantización | No especificados en el repositorio; el modelo base admite FP16/BF16, INT8 e INT4 (GPTQ, AWQ, GGUF) mediante herramientas de la comunidad |
| Idiomas soportados | `en` (inglés) declarado en la model card; el modelo base Qwen2.5 declara multilingüismo, pero el asistente está diseñado y validado solo en inglés |
| Licencia | `other` con `license_name: qwen`, enlazada a la licencia de Qwen2.5-1.5B-Instruct. Nota: la documentación pública de Qwen2.5 suele publicar los modelos ≤3 B bajo Apache-2.0; existe discrepancia entre ambas fuentes y conviene verificarla antes de uso comercial |
| Formato de pesos | No se distribuyen pesos en este repositorio; el modelo base se publica en `safetensors` y se carga con `transformers`. Existen cuantizaciones GGUF de la comunidad para el modelo base |

## Arquitectura y entrenamiento

El repositorio no entrena nada. Se limita a referenciar el checkpoint instruct de Qwen2.5-1.5B, un transformer decoder-only denso con atención causal y normalización RMSNorm, alineado por el equipo de Qwen con instrucciones y preferencias humanas (SFT más optimización de preferencias, según la documentación pública del modelo base). No hay datos en la información proporcionada sobre número de tokens de entrenamiento, composición del dataset ni detalles del pipeline de alineamiento; cualquier cifra al respecto debe consultarse en la model card de Qwen, no aquí.

La innovación técnica relevante está en el sistema que envuelve al modelo, no en el modelo: (1) un motor de reglas construye de forma determinista el payload de entrada con datos en vivo de Open-Meteo y OSM; (2) el prompt de sistema prohíbe inventar clima, lugares, horas o cifras, y solo permite hechos presentes en el mensaje de usuario; (3) la decodificación está acotada a 350 tokens nuevos con temperatura 0,4 y top-p 0,85; (4) el bloque de fuentes se añade después de la generación, de forma determinista, para que las citas no se pierdan; y (5) existe un fallback a plantilla si la inferencia falla. El resultado es un patrón de generación aumentada por recuperación con contención explícita del modelo.

## Capacidades

- Redacción en inglés de recomendaciones de actividades al aire libre a partir de un payload estructurado (recintos, franjas horarias, puntuaciones, clima, bloqueos, motivos y consejos).
- Generación de prosa conversacional breve: salida acotada a un máximo de 350 tokens nuevos por turno.
- Respeto de restricciones factuales impuestas por prompt: el modelo no debe introducir datos meteorológicos, geográficos ni numéricos ausentes en la entrada.
- Integración con un pipeline de datos en vivo (Open-Meteo para meteorología, OSM para geolocalización de recintos) a través del motor de reglas, no mediante tool calling nativo.
- Formato de salida con bloque de fuentes `### Sources` añadido externamente, no generado por el modelo.
- Capacidad de degradación controlada: si el modelo no responde, el sistema sigue produciendo respuesta mediante plantillas deterministas.

No disponible en la información proporcionada: soporte de tool calling o function calling nativo en este despliegue, modo thinking, capacidades de visión, audio o agénticas multi-paso, y evaluación multilingüe más allá del inglés.

## Casos de uso

- Recomendación de planes al aire libre con clima en vivo: el motor de reglas consulta Open-Meteo y OSM, puntúa recintos por franja horaria y el modelo redacta la propuesta final ("mejor ir el sábado a las 10:00 a este parque; lleva chubasquero"). El tamaño de 1,54 B permite ejecutarlo en la misma instancia que el backend sin coste apreciable.
- Asistente conversacional de fin de semana para apps de turismo local: el modelo convierte listas de candidatos y bloqueos en una respuesta natural multi-turno, manteniendo la coherencia gracias a que los hechos llegan ya resueltos en el payload.
- Capa de explicabilidad en sistemas de recomendación: además de la recomendación, el modelo justifica por qué descarta una opción (por ejemplo, viento por encima del umbral o recinto cerrado), lo que facilita auditar decisiones ante el usuario.
- Generación de avisos "llevar / vigilar / evitar": a partir de la estructura `carry / watch / avoid` que produce el razonador, el modelo redacta consejos prácticos breves para senderismo, running o ciclismo.
- Prototipado rápido de asistentes fundamentados en dominios verticales: el repositorio sirve como plantilla (prompt de sistema restrictivo, payload estructurado, límite de tokens, fallback determinista) replicable en otros dominios con datos en vivo.
- Despliegue en entornos con recursos limitados o edge: al ser un modelo de 1,54 B, cabe en GPU de consumo y en CPU con cuantización, lo que permite servir el asistente en una sola máquina pequeña.
- Evaluación de robustez ante fallos de dependencias externas: el diseño con fallback a plantillas es un caso de estudio para pipelines que no pueden permitirse respuestas alucinadas cuando la API meteorológica falla.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card de este repositorio no incluye ninguna evaluación (MMLU, GSM8K, HumanEval ni métricas propias del dominio de recomendación), y el autor no reporta comparaciones con otros SLM. Cualquier cifra de rendimiento del modelo base debe consultarse en la documentación oficial de Qwen, no en este repositorio.

## Requisitos de hardware

- VRAM estimada para inferencia: en BF16/FP16, unos 3,1 GB solo de pesos; con caché KV para contextos largos, el consumo real sube según la longitud de secuencia y el tamaño de lote. En INT8, aproximadamente 1,6 GB; en INT4 (GGUF/AWQ), alrededor de 0,9-1,2 GB.
- GPU recomendadas: cualquier GPU con 8 GB o más sirve en FP16 con margen (RTX 3060 Ti, RTX 4060 Ti, RTX 4070, L4). Para servir con lotes grandes o contexto de 32 K, RTX 4090 (24 GB), L40S o A100/H100.
- Cabe en GPU de consumo: sí, en prácticamente todas las GPU con 6-8 GB o más; en cuantización 4 bits funciona incluso en iGPU con memoria unificada y en CPU.
- Opciones de despliegue: `transformers` (es lo que documenta el repositorio), vLLM o TGI para serving con batching continuo, llama.cpp/Ollama para CPU o GPU modesta con GGUF. El repositorio en sí no incluye artefactos de despliegue.
- Latencia y throughput: no disponibles como medición. De forma orientativa y no medida, un modelo denso de 1,5 B en FP16 sobre una GPU de consumo moderna suele decodificar por encima de 100 tokens/s con lote 1; con la salida limitada a 350 tokens, el coste por respuesta es bajo. Verificar con pruebas propias antes de dimensionar producción.

## Comparativa con modelos similares

Datos de parámetros, contexto y licencia tomados de la documentación pública de cada modelo; el rendimiento no se compara por falta de evaluaciones en la información disponible.

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Rendimiento comparado |
|---|---|---|---|---|---|
| Qwen2.5-1.5B-Instruct (base de OutdoorPal) | 1,54 B | 32 768 tokens | Apache-2.0 según documentación pública de Qwen; el repositorio declara `other`/`qwen` | Pesos abiertos en HuggingFace | No disponible en esta ficha |
| Llama-3.2-1B-Instruct | 1,23 B | 128 000 tokens | Llama 3.2 Community License | Pesos abiertos, requiere aceptación | No disponible en esta ficha |
| Gemma 2 2B-it | 2,6 B | 8 192 tokens | Gemma Terms of Use | Pesos abiertos, requiere aceptación | No disponible en esta ficha |
| SmolLM2-1.7B-Instruct | 1,7 B | 8 192 tokens | Apache-2.0 | Pesos abiertos | No disponible en esta ficha |

A diferencia de las alternativas, OutdoorPal no aporta pesos propios: la comparación relevante es de arquitectura de sistema (grounding, contención y fallback), no de modelo.

## Limitaciones y advertencias

- No es un modelo entrenado: no ha visto datos del dominio de actividades al aire libre. Toda la precisión factual depende del motor de reglas y de las fuentes en vivo, no del modelo.
- Riesgo de alucinación inherente al modelo base: la prohibición de inventar datos se implementa solo por prompt de sistema. No hay verificación automática de que la salida se limite a los hechos del payload, por lo que un fallo de instrucción puede colar cifras o lugares inexistentes.
- Solo inglés declarado. El asistente no está validado en castellano ni en otros idiomas, aunque el modelo base sea multilingüe.
- El modelo no puede consultar clima ni mapas por sí mismo; fuera del pipeline de OutdoorPal no es una fuente meteorológica ni geográfica.
- Uso no apto para decisiones médicas o de seguridad: el propio autor lo excluye y remite a autoridades locales y partes meteorológicos oficiales.
- Ambigüedad de licencia: el repositorio declara `license: other` con `license_name: qwen` enlazando a la licencia de Qwen2.5-1.5B-Instruct, mientras que la documentación pública de Qwen sitúa los modelos de 1,5 B bajo Apache-2.0. Verificar antes de un uso comercial.
- El repositorio marca `inference: false` y no incluye pesos, código del motor de reglas, plantillas ni el fallback determinista: no es reproducible tal cual a partir de lo publicado.
- Metadatos cuando menos llamativos: fecha de creación 2026-10-22, 0 descargas y 0 likes. Sin señales de uso o validación por terceros.
- El rendimiento del sistema depende de la disponibilidad de Open-Meteo y OSM; el fallback a plantilla evita respuestas inventadas, pero degrada la naturalidad.

## Enlaces

- Repositorio del modelo: https://huggingface.co/Bhar1324/outdoorpal
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct
- Licencia referenciada en la model card: https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct/blob/main/LICENSE
- Fuente meteorológica citada por el autor (Open-Meteo): https://open-meteo.com
- Fuente geoespacial citada por el autor (OpenStreetMap): https://www.openstreetmap.org
- Paper, blog técnico, repositorio de código o demo: no disponibles en la información proporcionada.
