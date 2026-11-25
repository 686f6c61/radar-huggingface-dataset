# nokkela-ai/Qwensploit-V2-27B-CyberSecurity-Qwen3.8

## Resumen

Qwensploit V2 27B es un ajuste fino (fine-tune) especializado en ciberseguridad y red team, desarrollado por nokkela-ai como copia independiente (fork) del modelo original de xtools-at. Se construye sobre el modelo base Qwen3.8-27B-CodeForge-3xMerge-UNCENSORED-heretic y está orientado a profesionales de seguridad ofensiva, pentesters, investigadores de vulnerabilidades y entusiastas del sector. El modelo continúa la serie Qwensploit original con una mezcla de datos ampliada y un filtrado más selectivo.

La propuesta principal es ofrecer un asistente diario para tareas de ciberseguridad en un modelo relativamente compacto de 27.356.728.560 parámetros (unos 27,36 mil millones), con pesos en formato safetensors y un tamaño de repositorio de 55,6 GB. El pipeline declarado es image-text-to-text, lo que sugiere capacidades multimodales heredadas del modelo base, aunque la model card no detalla la arquitectura interna más allá de la etiqueta qwen3_5.

La relevancia actual del modelo radica en su enfoque en la calidad del dato frente al volumen: la versión V2 corrige inconsistencias de la V1 mediante una limpieza manual y un filtrado riguroso de cada conjunto de datos antes de incorporarlo al entrenamiento. Está disponible en el ecosistema transformers y es compatible con endpoints, con región eu, pero cuenta con un historial de adopción muy limitado (35 descargas y 0 likes en el momento de la consulta).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (etiquetas qwen3_5, qwen3.8; transformer multimodal segun pipeline image-text-to-text) |
| Parametros totales | 27.356.728.560 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible en la model card; existen cuantizaciones de terceros referenciadas en Hugging Face (GGUF y otras) |
| Idiomas soportados | en (ingles) |
| Licencia | other (licencia no estandar; consultar terminos del autor) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura concreta no se detalla en la informacion disponible. Las etiquetas del repositorio apuntan a qwen3_5 y qwen3.8, y el pipeline declarado es image-text-to-text, lo que indica un modelo transformer con capacidad multimodal de entrada imagen-texto. El modelo es un fine-tune del base xtools-at/Qwen3.8-27B-CodeForge-3xMerge-UNCENSORED-heretic, que a su vez parece ser una fusión (merge) de modelos. Se emplearon técnicas de LoRA y PEFT, y la etiqueta mtp sugiere multi-token prediction, aunque no se aportan detalles tecnicos sobre su implementacion.

El entrenamiento combina dos categorias: conocimiento de dominio de ciberseguridad y datos de razonamiento general. Los conjuntos de datos declarados son PentesterFlow/OffsecCyber, ChaoticNeutrals/Cybersecurity-ShareGPT, Voidreaper2026/cybersec-master-dataset, Trendyol/Trendyol-Cybersecurity-Instruction-Tuning-Dataset, saidutta69/CyberSec-Reasoning-Premium, saidutta69/qwen3.8-max-distillation-50k-clean y xtools-at/Claude-Haiku-5.5-High-Reasoning-TraceInversion-3000x. La innovacion metodologica destacada es el filtrado manual y la inspeccion de cada dataset antes de incluirlo, evitando usar el tamano como sustituto de la calidad y descartando grandes colecciones de CVE y exploits en bruto, que el autor considera mas adecuadas para RAG que para ensenar razonamiento. No se especifica el numero total de tokens de entrenamiento ni si hubo RLHF o DPO.

## Capacidades

- Generacion de texto y razonamiento estructurado orientado a problemas de seguridad.
- Conocimiento de dominio de ciberseguridad: pentesting autorizado, red team, investigacion y triaje de vulnerabilidades.
- Seguridad de aplicaciones web e infraestructura.
- Codificacion segura, revision de codigo y depuracion.
- Resolucion de retos CTF y educacion en seguridad.
- Seguridad defensiva, analisis de amenazas y respuesta a incidentes.
- Entrada multimodal imagen-texto segun el pipeline declarado (sin detalles adicionales en la model card).
- Conversacion multi-turno (etiqueta conversational).
- Razonamiento tecnico general y resolucion de problemas estructurados.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible; el autor indica explicitamente que no es un agente autonomo de pentesting.
- Capacidades multilingues: limitadas al ingles segun la model card.

## Casos de uso

- Pentesting autorizado: el modelo actua como asistente para planificar y documentar pruebas de intrusion en entornos con permiso explicito, generando comandos y explicaciones que el operador revisa antes de ejecutar.
- Investigacion y triaje de vulnerabilidades: ayuda a analizar hallazgos, clasificar su severidad y proponer vias de verificacion, apoyandose en su entrenamiento sobre datasets de razonamiento de seguridad.
- Revision de codigo seguro: se integra en el flujo de desarrollo para detectar patrones inseguros, sugerir correcciones y explicar el riesgo asociado a cada hallazgo.
- Educacion y CTF: sirve como tutor para resolver retos de captura de la bandera, explicando la logica de cada paso en lugar de limitarse a dar la solucion.
- Respuesta a incidentes: apoya el analisis de amenazas y la elaboracion de hipotesis durante un incidente, con un enfoque estructurado de resolucion de problemas.
- Formacion de equipos de seguridad: genera escenarios de practica y discusiones tecnicas sobre tecnicas ofensivas y defensivas en un entorno controlado.
- Asistencia en discusiones tecnicas de ciberseguridad: responde consultas de arquitectura de seguridad y buenas practicas con explicaciones detalladas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Como referencia orientativa por tamano, un modelo de 27,36 mil millones de parametros en FP16 requiere del orden de 54-55 GB de VRAM; en cuantizacion de 8 bits, unos 27-28 GB; en 4 bits, unos 14-16 GB. Estas cifras son estimaciones por tamano y no datos publicados por el autor.
- GPU recomendadas: no disponibles en la informacion proporcionada. Por capacidad de memoria, un modelo en FP16 encajaria en A100 80 GB, H100 80 GB o configuraciones multi-GPU; las cuantizaciones de 4 bits podrian caber en GPUs de consumo con 16-24 GB, como RTX 4090 o RTX 3090, si bien no se confirma compatibilidad.
- Cabe en consumer GPU: probablemente solo en cuantizaciones bajas (4-8 bits) y en tarjetas con 16 GB o mas; no confirmado por el autor.
- Opciones de despliegue: transformers (libreria declarada), text-generation-inference (etiqueta), endpoints compatibles. Existen cuantizaciones de terceros referenciadas en Hugging Face que podrian habilitar llama.cpp u Ollama, aunque no se detallan.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| nokkela-ai/Qwensploit-V2-27B-CyberSecurity-Qwen3.8 | 27,36 mil millones | no disponible | Ciberseguridad y red team | other | Hugging Face, 35 descargas |
| xtools-at/Qwensploit-V2-27B-CyberSecurity-Qwen3.8 (original) | 27,36 mil millones (mismo modelo base) | no disponible | Ciberseguridad y red team | other | Hugging Face |
| xtools-at/Qwensploit-V2-9B-CyberSecurity-Qwen3.5 | 9 mil millones (aprox.) | no disponible | Ciberseguridad y red team | other | Hugging Face |
| xtools-at/Qwensploit-V2-4B-CyberSecurity-Qwen3.5 | 4 mil millones (aprox.) | no disponible | Ciberseguridad y red team | other | Hugging Face |

La comparativa se limita a variantes de la misma familia, ya que no se dispone de datos de rendimiento ni de especificaciones de modelos competidores en la informacion proporcionada. No se dispone de datos de benchmarks que permitan una comparacion cuantitativa.

## Limitaciones y advertencias

- El modelo esta disenado como asistente de investigacion y analisis, no como agente autonomo de pentesting; los comandos, codigo y recomendaciones generados deben revisarse antes de usarse en un entorno real.
- Riesgo de alucinacion: no se documenta una evaluacion especifica, y al tratarse de un fine-tune sobre un modelo "uncensored" y fusionado, la fiabilidad de las respuestas tecnicas no esta garantizada.
- Sesgos conocidos: no documentados en la informacion disponible.
- Limitaciones de idioma: solo se declara ingles, lo que restringe su uso en castellano u otros idiomas.
- Limitaciones de contexto: la longitud de contexto no se especifica, por lo que no se puede garantizar el manejo de conversaciones o documentos largos.
- Licencia "other": no es una licencia estandar; es imprescindible revisar los terminos del autor antes de cualquier uso comercial o en produccion.
- El modelo base es una fusion "uncensored" y "heretic", lo que puede implicar menor adherencia a filtros de seguridad y mayor probabilidad de contenido sensible o inapropiado.
- Adopcion muy baja (35 descargas, 0 likes) y sin benchmarks publicados: no hay evidencia externa de calidad ni de estabilidad en produccion.
- El autor descarta incluir grandes colecciones de CVE y exploits en bruto en el entrenamiento, por lo que el conocimiento de vulnerabilidades concretas puede ser limitado y conviene complementarlo con RAG.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/nokkela-ai/Qwensploit-V2-27B-CyberSecurity-Qwen3.8
- Modelo original (fuente del fork): https://huggingface.co/xtools-at/Qwensploit-V2-27B-CyberSecurity-Qwen3.8
- Modelo base: https://huggingface.co/xtools-at/Qwen3.8-27B-CodeForge-3xMerge-UNCENSORED-heretic
- Coleccion Qwensploit Cybersec: https://huggingface.co/collections/xtools-at/qwensploit-cybersec
- Variante 9B: https://huggingface.co/xtools-at/Qwensploit-V2-9B-CyberSecurity-Qwen3.5
- Variante 4B: https://huggingface.co/xtools-at/Qwensploit-V2-4B-CyberSecurity-Qwen3.5
- Variante 2B: https://huggingface.co/xtools-at/Qwensploit-V2-2B-CyberSecurity-Qwen3.5
- Variante 0.8B: https://huggingface.co/xtools-at/Qwensploit-V2-0.8B-CyberSecurity-Qwen3.5
- Cuantizaciones de terceros: https://huggingface.co/models?other=base_model:quantized:xtools-at/Qwensploit-V2-27B-CyberSecurity-Qwen3.8
- Perfil del autor original: https://huggingface.co/xtools-at
