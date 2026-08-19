# Akan4ik/DeepSeek-V4-Flash-0731-FFT-BF16-Cyber-2.0

## Resumen

DeepSeek-V4-Flash-0731-FFT-BF16-Cyber-2.0 es un fine-tuning completo (FFT) del modelo DeepSeek-V4-Flash-0731, publicado por el usuario Akan4ik en Hugging Face. El modelo está orientado a pruebas de penetración autorizadas y auditorías de seguridad ofensiva, integrando un perfil de agente "Hermes-native" con herramientas de navegador, búsqueda web, playbooks de metodología y un sistema de validación de alcance en múltiples capas. Se distribuye bajo licencia MIT y en formato safetensors, con un total de 304.180.418.494 parámetros (aproximadamente 304 mil millones), lo que lo sitúa en la categoría de modelos de gran escala.

La relevancia actual del modelo radica en su especialización: no es un modelo de propósito general, sino una adaptación de DeepSeek-V4-Flash para tareas concretas de ciberseguridad ofensiva, con énfasis en el cumplimiento de un flujo de trabajo supervisado (reconocimiento, validación de exploits, generación de informes). La model card describe un sistema de seguridad de múltiples capas que incluye preguntas de alcance interactivo, validación de objetivos y compuertas de aprobación antes de ejecutar comandos. No se han publicado detalles oficiales sobre la arquitectura interna, el contexto máximo o los datos de entrenamiento, más allá de lo indicado en la propia model card.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (se menciona MoE en fuentes externas, sin confirmación oficial) |
| Parametros totales | 304.180.418.494 (~304 B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el nombre sugiere BF16, sin lista oficial) |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La model card no proporciona detalles técnicos sobre la arquitectura interna del modelo. Fuentes externas (DeepWiki, repositorio GitHub de DeepSeek V4 Flash) indican que la familia DeepSeek-V4-Flash emplea una arquitectura de Mezcla de Expertos (MoE), pero no hay confirmación oficial en la ficha del modelo ni en la información proporcionada. El nombre "FFT-BF16" sugiere un fine-tuning completo realizado en precisión BF16, aunque no se especifican los datos de entrenamiento, el número de tokens utilizados ni si se aplicaron técnicas como RLHF o DPO.

La model card describe funcionalidades añadidas sobre la base de DeepSeek-V4-Flash: 31 playbooks de metodología (7 operativos y 24 por clase de vulnerabilidad), un árbol de tareas de pentesting con marcadores de estado, herramientas de navegador para enumeración web, búsqueda de CVEs y OSINT, y un sistema de informes con evidencia reproducible y referencias CVSS 3.1 y 4.0. También menciona "DSADScan", descrito como 11 habilidades para escanear Active Directory, aunque la descripción es confusa y no está clara su implementación técnica.

## Capacidades

- Generación de texto y razonamiento basado en el modelo base DeepSeek-V4-Flash-0731.
- Perfil de agente especializado en pruebas de penetración autorizadas: desde reconocimiento hasta validación de exploits y generación de informes.
- Integración con el framework Hermes: hereda el proveedor, el modelo y los backends de herramientas ya configurados, sin almacén de credenciales separado.
- Herramientas de navegador para enumeración de sitios web dentro del alcance aprobado.
- Herramientas web para búsqueda de CVEs, exploits y OSINT.
- Sistema de seguridad multicapa: preguntas de alcance interactivo, validación de alcance, comprobación de guardas y compuertas de aprobación antes de ejecutar comandos.
- Soporte de "thinking mode" y "reasoning_effort" según el fragmento de código de ejemplo, con parámetros de muestreo recomendados (temperature = 1.0, top_p = 0.95).
- Capacidades multilingües: no disponibles.
- Soporte de tool calling / function calling: implícito a través de las herramientas de agente descritas, sin especificación técnica detallada.

## Casos de uso

- Pruebas de penetración autorizadas en infraestructuras corporativas: el modelo guía el flujo completo de un engagement, desde el reconocimiento inicial hasta la validación de exploits, aplicando los playbooks de metodología y manteniendo un árbol de tareas estructurado con marcadores de estado.
- Auditoría de aplicaciones web: los playbooks de la clase "web-attacks" permiten enumerar sitios dentro del alcance aprobado mediante el toolset de navegador, identificar vulnerabilidades y documentar evidencia reproducible (capturas, salidas de herramientas, pares petición/respuesta).
- Evaluación de control de acceso y gestión de identidades: el skill "access-control" y la herramienta DSADScan (según la descripción de la model card) están orientados a analizar Active Directory y detectar configuraciones inseguras o rutas de escalada de privilegios.
- Generación de informes de seguridad con evidencia: el modelo produce informes con referencias cruzadas CVSS 3.1 y 4.0, incluyendo parches de remediación opcionales, lo que facilita la entrega de resultados accionables a equipos de desarrollo.
- Investigación de vulnerabilidades y OSINT: la herramienta web integrada permite buscar CVEs, exploits públicos y datos de fuentes abiertas durante la fase de reconocimiento pasivo.
- Formación y simulación de ataques en entornos controlados: el modelo puede utilizarse en laboratorios de capacitación para demostrar técnicas de pentesting de forma supervisada, aprovechando los playbooks de vulnerabilidades como material didáctico estructurado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card menciona que DeepSeek-V4-Flash-0731 fue evaluado en tareas de agente de código con DeepSeek Harness (aún por publicar), pero no se incluyen cifras concretas ni comparativas con otros modelos. No se dispone de datos de MMLU, HumanEval, GSM8K u otros benchmarks estándar para esta variante específica.

## Requisitos de hardware

- El modelo tiene 304.180.418.494 parámetros. En precisión BF16 (2 bytes por parámetro), el peso del modelo ocupa aproximadamente 608 GB, por lo que la inferencia requiere hardware de múltiples GPUs de alta gama o clústeres distribuidos.
- No se dispone de información oficial sobre GPUs recomendadas. Dado el tamaño, se necesitarían al menos 8 GPUs de 80 GB (p. ej., H100 o A100) para cargar los pesos en memoria, y posiblemente más para activaciones y estado del KV-cache.
- No cabe en GPUs de consumo (RTX 4090, 3090, etc.) sin cuantización agresiva, y no se han publicado versiones cuantizadas (GGUF, AWQ, GPTQ) en la información disponible.
- Opciones de despliegue: no especificadas. El modelo usa la librería transformers y safetensors, por lo que podría servirse con vLLM, TGI o similar, pero no hay documentación oficial al respecto.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de información suficiente para realizar una comparativa cuantitativa con modelos similares. El modelo es un fine-tuning de DeepSeek-V4-Flash-0731, pero no se han publicado datos de rendimiento comparativos ni especificaciones detalladas del modelo base. Las alternativas naturales serían el propio DeepSeek-V4-Flash-0731 original u otros modelos de seguridad ofensiva como los basados en Llama o Qwen fine-tuneados para pentesting, pero no hay datos públicos en la información proporcionada para establecer una comparación rigurosa.

## Limitaciones y advertencias

- La model card especifica que el modelo está diseñado exclusivamente para pruebas de penetración autorizadas y supervisadas. Su uso en sistemas sin autorización explícita puede violar leyes y normativas de ciberseguridad.
- El modelo hereda los sesgos y limitaciones del modelo base DeepSeek-V4-Flash-0731, que no están documentados en la información disponible.
- Riesgo de alucinación: no se han publicado evaluaciones de fiabilidad factual para este fine-tuning; en tareas de seguridad, una alucinación podría llevar a conclusiones incorrectas sobre vulnerabilidades o a la generación de exploits no válidos.
- La model card contiene enlaces a repositorios externos (PENdS, OASAS) y a Calibre, un software de gestión de libros electrónicos sin relación aparente con el modelo, lo que sugiere una documentación poco cuidada y posiblemente incompleta.
- No se especifica la longitud de contexto, los idiomas soportados ni los detalles de entrenamiento (datos, tokens, método de alineación), lo que dificulta evaluar su comportamiento en producción.
- La licencia MIT permite uso comercial, pero el carácter ofensivo del modelo puede implicar restricciones legales adicionales según la jurisdicción y el caso de uso.
- No se han publicado benchmarks, pruebas de seguridad o evaluaciones de robustez frente a jailbreaks o usos malintencionados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Akan4ik/DeepSeek-V4-Flash-0731-FFT-BF16-Cyber-2.0
- Modelo anterior (v1): https://huggingface.co/Akan4ik/DeepSeek-V4-Flash-0731-FFT-BF16-Cyber
- Ficha en FriendliAI: https://friendli.ai/models/Akan4ik/DeepSeek-V4-Flash-0731-FFT-BF16-Cyber
- DeepWiki de DeepSeek V4 Flash 0731: https://deepwiki.com/deepseek-v4-flash-0731/deepseek-v4-flash-0731
- Repositorio GitHub de DeepSeek V4 Flash 0731: https://github.com/deepseek-v4-flash-0731/deepseek-v4-flash-0731
- Repositorio PENdS (mencionado en la model card): https://github.com/akonPAPA/PENdS
- Repositorio OASAS (mencionado en la model card): https://github.com/akonPAPA/OASAS
