# mradermacher/Bimo-7B-CyberAgent-GGUF

## Resumen

Bimo-7B-CyberAgent es un modelo de lenguaje especializado en ciberseguridad y auditoría de seguridad, desarrollado por iBimo-o y publicado originalmente en formato transformers. Esta ficha cubre la versión cuantizada en GGUF realizada por mradermacher, que permite ejecutar el modelo en hardware de consumo mediante llama.cpp y herramientas compatibles.

El modelo parte de una arquitectura Qwen2 con aproximadamente 7.615 millones de parámetros (7,6B) y está afinado para tareas de agente, tool calling, function calling y generación de código en el dominio de seguridad. Incorpora técnicas de RoPE escalado (YaRN) para extender el contexto, según indican las etiquetas del repositorio.

La relevancia de esta publicación radica en que ofrece cuantizaciones estáticas en múltiples niveles (desde Q2_K hasta f16) de un modelo de nicho, lo que facilita su despliegue local en flujos de trabajo de análisis de seguridad, pentesting asistido y automatización de auditorías sin depender de infraestructura en la nube.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen2 (transformer decoder-only), con RoPE escalado (YaRN) |
| Parametros totales | 7.615.616.512 (7,6B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (las etiquetas indican yarn/rope, sin valor numérico publicado) |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | en (inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizaciones estáticas); el modelo base en safetensors/transformers |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura Qwen2, un transformer decoder-only con atención completa y RoPE. Las etiquetas del repositorio indican el uso de YaRN (Yet another RoPE extensioN) para la extensión de contexto, aunque no se especifica el valor final de ventana. El modelo base es iBimo-o/Bimo-7B-CyberAgent, y esta publicación es únicamente una cuantización estática del mismo realizada por mradermacher; no se ha reentrenado ni modificado el modelo original.

Según los metadatos de la model card, el ajuste fino del modelo base empleó los datasets Vyber07/cyber-security, cx-cmu/agent_trajectories y NousResearch/hermes-function-calling-v1. Esta combinación sugiere un entrenamiento orientado a conocimiento de seguridad, trayectorias de agente y llamadas a funciones. No se dispone de información sobre el número de tokens de entrenamiento, la composición exacta del dataset, ni si se aplicaron técnicas de RLHF o DPO. Tampoco se detalla ninguna innovación técnica adicional más allá del uso de YaRN.

## Capacidades

- Generación de texto y razonamiento general en el dominio de ciberseguridad.
- Auditoría de seguridad: análisis de configuraciones, revisión de políticas y detección de patrones de riesgo.
- Generación de código, con énfasis en scripts y herramientas relacionadas con seguridad.
- Tool calling y function calling, según las etiquetas del repositorio y el dataset hermes-function-calling-v1.
- Comportamiento de agente: soporte para trayectorias multi-paso, según el dataset cx-cmu/agent_trajectories.
- Capacidades multilingües limitadas al inglés (idioma declarado: en).
- Extensión de contexto mediante YaRN, aunque sin valor numérico publicado.

## Casos de uso

- Auditoría de configuraciones de seguridad: el modelo puede revisar ficheros de configuración (por ejemplo, políticas de firewall o permisos de IAM) y señalar desviaciones respecto a buenas prácticas, aprovechando su ajuste sobre el dataset Vyber07/cyber-security.
- Asistente de pentesting: generación de comandos y scripts de reconocimiento o explotación controlada, con soporte de tool calling para integrarse en un agente que ejecute y valide resultados paso a paso.
- Triaje de alertas SOC: clasificación y resumen de alertas de seguridad en inglés, con capacidad de invocar funciones para consultar fuentes adicionales o abrir tickets.
- Revisión de código orientada a seguridad: análisis de fragmentos de código en busca de vulnerabilidades comunes y propuesta de parches, apoyándose en sus capacidades de generación de código.
- Automatización de agentes de análisis: construcción de flujos multi-paso donde el modelo decide qué herramienta invocar (escáner, parser de logs, API de threat intelligence) gracias a su entrenamiento con trayectorias de agente.
- Despliegue local en entornos aislados: al distribuirse en GGUF y con licencia Apache 2.0, puede ejecutarse en máquinas sin conexión para analizar datos sensibles que no deben salir de la red corporativa.
- Formación y concienciación: generación de escenarios y explicaciones sobre amenazas en inglés para materiales de entrenamiento interno.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia según cuantización (tamaños de fichero publicados): Q2_K 3,1 GB; Q3_K_S 3,6 GB; Q3_K_M 3,9 GB; Q3_K_L 4,2 GB; IQ4_XS 4,4 GB; Q4_K_S 4,6 GB; Q4_K_M 4,8 GB; Q5_K_S 5,4 GB; Q5_K_M 5,5 GB; Q6_K 6,4 GB; Q8_0 8,2 GB; f16 15,3 GB.
- GPU recomendadas: no disponible en la información proporcionada. Por tamaño, las cuantizaciones Q4_K_M y Q5_K_M caben en GPUs de consumo con 8 GB de VRAM; Q6_K y Q8_0 requieren 8-12 GB; f16 requiere al menos 16 GB.
- Cabe en GPU de consumo: sí, en modelos con 8 GB o más de VRAM para cuantizaciones Q4/Q5; las cuantizaciones mayores requieren 12-16 GB.
- Opciones de despliegue: llama.cpp y herramientas compatibles con GGUF (Ollama, LM Studio, entre otras). El modelo base también es compatible con transformers.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Bimo-7B-CyberAgent (esta ficha) | 7,6B | no disponible (YaRN) | Apache 2.0 | GGUF, transformers | Especializado en ciberseguridad y agentes |
| Qwen2-7B (base arquitectónico) | 7,6B | 32.768 tokens (según familia Qwen2) | Apache 2.0 | safetensors, GGUF | Modelo generalista; el contexto exacto de esta variante no está publicado |
| Alternativas especializadas en seguridad | no disponible | no disponible | no disponible | no disponible | No se dispone de datos verificables en la información proporcionada |

No se dispone de información suficiente para comparar rendimiento con alternativas de la misma categoría.

## Limitaciones y advertencias

- El modelo solo declara soporte de inglés; su uso en castellano u otros idiomas no está garantizado y probablemente degrade la calidad.
- No se han publicado benchmarks, por lo que el rendimiento real en tareas de seguridad no está validado de forma independiente.
- Riesgo de alucinación inherente a modelos de 7B, especialmente en dominios técnicos donde puede inventar CVEs, comandos o referencias.
- El ajuste en ciberseguridad puede producir respuestas con contenido ofensivo; debe aplicarse con salvaguardas y solo en contextos autorizados.
- La longitud de contexto efectiva no está documentada; el uso de YaRN no garantiza calidad en ventanas largas.
- Licencia Apache 2.0 permite uso comercial, pero el modelo base y los datasets subyacentes pueden tener sus propias condiciones que conviene revisar.
- Esta publicación es una cuantización estática; no se ofrecen cuantizaciones ponderadas/imatrix, lo que puede afectar a la calidad en niveles bajos (Q2_K, Q3_K).
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, sin validación comunitaria.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/Bimo-7B-CyberAgent-GGUF
- Modelo base: https://huggingface.co/iBimo-o/Bimo-7B-CyberAgent
- Página de descargas del cuantizador: https://hf.tst.eu/model#Bimo-7B-CyberAgent-GGUF
- Guía de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- FAQ y solicitudes de cuantización: https://huggingface.co/mradermacher/model_requests
- Dataset Vyber07/cyber-security: https://huggingface.co/datasets/Vyber07/cyber-security
- Dataset cx-cmu/agent_trajectories: https://huggingface.co/datasets/cx-cmu/agent_trajectories
- Dataset NousResearch/hermes-function-calling-v1: https://huggingface.co/datasets/NousResearch/hermes-function-calling-v1
