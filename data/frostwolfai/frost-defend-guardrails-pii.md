# FrostWolfAI/Frost-Defend-Guardrails-PII

## Resumen

Frost-Defend-Guardrails-PII es un modelo de clasificación de texto y extracción de entidades desarrollado por FrostWolfAI Labs (Vatsal Bajpai) sobre la base de fastino/gliner2.5-multi-v1. Está diseñado para realizar dos tareas de seguridad en una sola pasada: clasificar si un prompt o una respuesta de un sistema de IA es segura, identificando la categoría de amenaza y su severidad, y extraer información personal identificable (PII) y secretos (claves API, contraseñas, tokens) con posiciones de carácter exactas para permitir su redacción.

El modelo, de aproximadamente 287 millones de parámetros, se presenta como una solución ligera y multilingüe para implementar guardrails en aplicaciones basadas en LLM. Su enfoque principal son los ataques contra sistemas de IA —prompt injection, jailbreaks, abuso de herramientas y exfiltración de datos—, al tiempo que permite el paso de consultas legítimas de seguridad. Incluye un helper en Python que expone una API HTTP y un SDK ligero para su integración en producción.

Es relevante porque combina en un único modelo de tamaño reducido dos funciones que habitualmente requieren sistemas separados: moderación de contenido y detección de PII/secretos. Esto simplifica la arquitectura de despliegue y reduce los requisitos de cómputo para equipos que necesitan proteger aplicaciones de IA sin depender de servicios externos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base GLiNER2, extractor de entidades) |
| Parametros totales | 287.355.159 |
| Parametros activos | no aplica |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | multilingüe |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se construye mediante fine-tuning sobre fastino/gliner2.5-multi-v1, un modelo de la familia GLiNER2 orientado a la extracción de entidades y clasificación basada en descripciones de tareas. La arquitectura subyacente es un extractor de entidades que acepta etiquetas y descripciones textuales como entrada, lo que permite definir dinámicamente las categorías a detectar sin reentrenar el modelo. El pipeline declarado es text-classification y la librería de referencia es gliner2.

No se dispone de información detallada sobre el volumen de datos de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO. La model card menciona que el modelo fue entrenado con un conjunto específico de etiquetas y descripciones de tareas que se incluyen en el archivo helper frost_defend.py, y que el umbral de decisión (0.98) fue calibrado para maximizar el F1 en datos de validación reservados. No se detallan innovaciones técnicas adicionales como decodificación especulativa o atención lineal.

## Capacidades

- Clasificación de seguridad de prompts: determina si un texto es seguro o inseguro, con categoría de amenaza (benign, prompt_injection, jailbreak, data_exfiltration, malicious_code, intrusion, social_engineering, disruption, unsafe_content), severidad (none, low, medium, high, critical) e indicación de si el ataque se dirige a un sistema de IA.
- Clasificación de respuestas de IA: evalúa si una respuesta generada es segura o insegura y si constituye una negativa (refusal) o un cumplimiento (compliance).
- Extracción de PII y secretos: detecta 53 tipos de PII y secretos con posiciones de carácter exactas, incluyendo nombres, correos electrónicos, números de tarjeta, claves API, contraseñas, tokens y cadenas de conexión.
- Detección de credenciales: cubre 21 formatos de claves API (Stripe, Slack, Hugging Face, npm, SendGrid, GitHub, AWS, Azure, claves PEM, JWT, cabeceras bearer y secretos hexadecimales), con una tasa de detección reportada de 105/105 en pruebas.
- Detección de contraseñas: 68/70 en pruebas, incluyendo passphrases, prompts de sudo, líneas export/docker -e y PINs.
- Extracción de credenciales en URLs de conexión: identifica usuario y contraseña en cadenas como postgres://user:pass@host, mysql://, redis:// y mongodb+srv://.
- Procesamiento por lotes: función classify_batch y extract_pii_batch para mayor eficiencia.
- Redacción: función redact que elimina o enmascara las entidades detectadas.
- API HTTP integrada: servidor ligero con endpoints para clasificación, detección de PII, redacción y análisis, con autenticación por API key y procesamiento de textos largos por fragmentos.
- Multilingüe: soporta múltiples idiomas según la model card, aunque no se especifica la lista completa.

## Casos de uso

- Moderación de prompts en producción: el modelo puede clasificar cada entrada de usuario antes de enviarla al LLM principal, bloqueando prompt injections y jailbreaks con un umbral configurable (por defecto 0.98) y devolviendo la categoría de amenaza para auditoría.
- Protección contra exfiltración de datos: al detectar intentos de extraer información del sistema (data_exfiltration) y secretos en las respuestas, se puede evitar que un LLM revele claves API o credenciales internas en su salida.
- Redacción automática de PII en logs y registros: la extracción con posiciones exactas permite enmascarar nombres, correos, tarjetas y contraseñas en textos antes de almacenarlos o enviarlos a terceros, cumpliendo con requisitos de privacidad.
- Filtrado de respuestas dañinas: classify_response evalúa si la salida del modelo es segura y si constituye una negativa, lo que permite implementar una capa de validación posterior a la generación y evitar que se muestren contenidos peligrosos.
- Detección de secretos en repositorios y pipelines CI/CD: el modelo puede escanear commits, variables de entorno y archivos de configuración para identificar claves API y contraseñas antes de que se filtren, con soporte para 21 formatos de credenciales.
- Análisis de seguridad en herramientas de agentes: al clasificar si una instrucción se dirige a un sistema de IA y su severidad, se puede decidir si una llamada a herramienta debe permitirse, bloquearse o requerir aprobación humana en flujos multi-paso.
- Cumplimiento normativo y auditoría: la combinación de categoría de amenaza, severidad y extracción de PII facilita la generación de registros estructurados para auditorías de seguridad y cumplimiento de normativas de protección de datos.

## Benchmarks y rendimiento

La model card reporta resultados de pruebas internas sobre detección de credenciales y contraseñas, pero no se han publicado resultados de benchmarks estándar como MMLU, HumanEval o GSM8K en la información disponible.

| Prueba | Resultado reportado |
|---|---|
| Detección de 21 formatos de claves API (105 casos) | 105/105 |
| Detección de contraseñas (70 casos) | 68/70 |
| Umbral de bloqueo calibrado | 0.98 (máximo F1 en datos reservados) |

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 4 GB de RAM libre según la model card; en GPU, el modelo de 287M parámetros en precisión completa requiere alrededor de 1,2 GB, y en fp16 alrededor de 0,6 GB, aunque no se especifica oficialmente.
- GPU recomendadas: no se detallan modelos concretos; el modelo puede ejecutarse en GPU si está disponible y recurre a CPU en caso contrario.
- Compatibilidad con GPU de consumo: sí, por su tamaño reducido es apto para GPU de consumo, aunque no se especifican modelos concretos.
- Opciones de despliegue: la librería gliner2 con PyTorch, el helper frost_defend.py con servidor HTTP integrado (serve) y la opción de instalación en CPU mediante install.sh --cpu. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la documentación proporcionada. El modelo se basa en fastino/gliner2.5-multi-v1, que podría considerarse su referencia directa, pero no se ofrecen datos comparativos de rendimiento, contexto o licencia frente a alternativas de la misma categoría.

| Modelo | Parámetros | Contexto | Licencia | Enfoque |
|---|---|---|---|---|
| Frost-Defend-Guardrails-PII | 287M | no disponible | Apache 2.0 | Guardrails + PII |
| fastino/gliner2.5-multi-v1 | no disponible | no disponible | no disponible | Extracción de entidades |
| Alternativas de moderación | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- El modelo está especializado en ataques contra sistemas de IA; su rendimiento en otros dominios de moderación de contenido puede ser menor.
- El umbral de bloqueo por defecto (0.98) está calibrado para maximizar F1, pero puede requerir ajuste según el caso de uso; bajarlo aumenta la detección a costa de más falsos positivos.
- La detección de contraseñas no es perfecta (68/70 en pruebas), por lo que pueden escaparse casos límite.
- No se especifica la longitud máxima de contexto soportada, lo que limita la planificación para textos muy largos; el helper divide textos largos en fragmentos, pero se desconoce el tamaño de cada fragmento.
- No se detalla la lista completa de idiomas soportados ni su rendimiento por idioma.
- Riesgo de alucinación en la clasificación: al ser un modelo discriminativo, el riesgo se manifiesta como falsos positivos o falsos negativos en las etiquetas, no como generación de texto.
- La licencia Apache 2.0 permite uso comercial, pero se recomienda revisar los términos del modelo base fastino/gliner2.5-multi-v1.
- El proyecto tiene 0 descargas y 0 likes en Hugging Face en el momento de la consulta, lo que indica que no ha sido validado por la comunidad.
- No se han publicado benchmarks estándar, por lo que la evaluación de rendimiento se limita a las pruebas internas del autor.

## Enlaces

- Hugging Face: https://huggingface.co/FrostWolfAI/Frost-Defend-Guardrails-PII
- Modelo base: https://huggingface.co/fastino/gliner2.5-multi-v1
- Librería gliner2 en PyPI: https://pypi.org/project/gliner2/
- Perfil del autor: https://huggingface.co/xblack
- Organización FrostWolfAI Labs: https://huggingface.co/FrostWolfAI
- Buy me a coffee: https://buymeacoffee.com/vatsalbajpai
