# ErebusTN/Athena

## Resumen

Athena es un modelo de lenguaje de 1.728.801.536 parámetros (aproximadamente 1,73B, aunque la model card lo promociona como "1.5B") desarrollado por ErebusTN bajo la organización EGen Labs. Está especializado en ciberseguridad defensiva y diseñado para ejecutarse en local, tanto en GPU como en CPU, portátiles y dispositivos móviles mediante cuantizaciones GGUF. Su propuesta es un asistente compacto, offline y orientado a blue-team: explicaciones de frameworks, revisión de diseño seguro, ideas de detección y esquemas de respuesta a incidentes.

La arquitectura es un diseño tri-híbrido de 24 capas que combina 13 convoluciones cortas con compuerta (gated short convolutions), 5 capas de atención de ventana deslizante y 6 capas de atención global. El tag del repositorio apunta a la familia `lfm3`. La ventana de contexto que soporta la arquitectura es de 256K tokens, pero el modelo se entrenó con secuencias de hasta 1536 tokens, por lo que el comportamiento en contextos largos no ha sido reevaluado según el autor.

El interés actual del modelo reside en su relación tamaño/capacidad para despliegue en el borde: 16 idiomas declarados, pesos safetensors en bf16 y un conjunto de cuantizaciones GGUF listas para usar (Q4_K_M, Q5_K_M, Q6_K, Q8_0, F16). Es relevante como base pequeña para adaptación de dominio en seguridad y como asistente privado sin conexión. El repositorio no registra descargas ni interacciones en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer tri-hibrido de 24 capas: 13 convoluciones cortas con compuerta, 5 capas de atencion de ventana deslizante y 6 capas de atencion global (tag `lfm3`) |
| Parametros totales | 1.728.801.536 (aproximadamente 1,73B; la model card indica "1.5B") |
| Parametros activos | No aplica: no es un modelo MoE |
| Longitud de contexto | 256K tokens segun arquitectura; entrenado con secuencias de hasta 1536 tokens, sin reevaluacion de contexto largo |
| Tipos de cuantizacion | GGUF: Q4_K_M, Q5_K_M, Q6_K, Q8_0, F16; safetensors en bf16 |
| Idiomas soportados | 16: en, ar, fr, es, de, it, pt, ru, zh, ja, ko, vi, th, id, hi, pl |
| Licencia | Apache 2.0 (el frontmatter de la model card declara `license: other` con `license_name: apache-2.0`; los metadatos de HuggingFace indican apache-2.0) |
| Formato de pesos | safetensors (bf16) y GGUF |

## Arquitectura y entrenamiento

Athena emplea un transformer tri-híbrido de 24 capas que sustituye parte de la atención completa por convoluciones cortas con compuerta, lo que reduce el coste de prefill y decodificación y disminuye la huella de memoria. La mezcla concreta es de 13 capas convolucionales, 5 capas de atención con ventana deslizante y 6 capas de atención global. Este esquema es característico de la familia de arquitecturas etiquetada como `lfm3` en los tags del repositorio. El modelo requiere `trust_remote_code=True`, lo que implica que la implementación de la arquitectura viaja en el propio repositorio y no está en el núcleo de Transformers.

El entrenamiento se describe en dos fases deliberadas. La primera moldea identidad y comportamiento: respuestas cortas, reconocimiento explícito de límites (sin acceso a internet, sin memoria entre conversaciones) y resistencia a instrucciones del tipo "ignora tus reglas". La segunda introduce el corpus de seguridad, de orientación defensiva, que abarca seguridad de aplicaciones, cloud, identidad y autenticación moderna, criptografía y TLS, ingeniería de detección, respuesta a incidentes, DevSecOps y seguridad de IA. La model card no especifica el número de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron técnicas de RLHF o DPO. Sí se documenta una plantilla de chat con prompt de identidad por defecto y un modo "thinking" desactivado por defecto y marcado como experimental, ya que el modelo no fue entrenado con trazas de razonamiento.

## Capacidades

- Generación de texto conversacional con respuestas deliberadamente breves y temperatura de muestreo recomendada muy baja (0.1).
- Explicación de conceptos y frameworks de seguridad: OWASP, MITRE ATT&CK, NIST CSF y CIS Controls.
- Contenido de seguridad ofensiva en clave defensiva: explicación de técnicas como Kerberoasting y cómo detectarlas, sin generación de malware ni construcción de exploits.
- Revisión de diseño seguro, listas de hardening, esquemas de respuesta a incidentes e ideas de detección.
- Cobertura de seguridad en la nube, IAM y autenticación moderna, higiene criptográfica y TLS, DevSecOps y seguridad de IA.
- Multilingüismo declarado en 16 idiomas; los datos de identidad y comportamiento incluyen inglés, árabe, francés y español.
- Plantilla de chat integrada con `apply_chat_template` y posibilidad de sobrescribir el mensaje de sistema.
- Modo de razonamiento opcional mediante `enable_thinking=True`, experimental.
- No dispone de tool calling ni function calling documentado, ni de capacidades de agente, visión o audio según la información disponible.

## Casos de uso

- Asistente de estudio de ciberseguridad: el modelo explica frameworks y conceptos con respuestas cortas, adecuado para preparación de certificaciones o consulta rápida de referencia en un portátil sin conexión.
- Triaje y esquemas de respuesta a incidentes: se le puede pedir un borrador de runbook o una lista de comprobación inicial para un tipo de incidente concreto; el analista valida después cada comando y referencia.
- Revisión de diseño seguro en fases tempranas: dado un diagrama descrito en texto, el modelo propone controles de autenticación, segmentación y cifrado alineados con OWASP y NIST CSF.
- Ingeniería de detección: generación de ideas de reglas y de lógica de correlación para un SIEM, usando MITRE ATT&CK como marco de referencia, siempre con validación humana antes de desplegar.
- Asistente privado en el borde: despliegue con GGUF Q4_K_M en portátiles o dispositivos móviles para consultas internas donde no se permite enviar datos a la nube.
- Base para adaptación de dominio: ajuste fino supervisado sobre un corpus interno de seguridad en español, aprovechando que el modelo parte de una base ya expuesta a terminología del sector.
- Formación interna en equipos de desarrollo: explicación de higiene criptográfica, gestión de secretos y buenas prácticas de DevSecOps a partir de preguntas del equipo.
- Soporte en español para equipos de seguridad: aunque el corpus de seguridad es mayoritariamente inglés, el modelo declara competencia en español y puede usarse para reformular y explicar conceptos en castellano.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: alrededor de 3,5 GB solo para pesos, más caché KV y overhead; en la práctica unos 5-6 GB. Estimación derivada del recuento de parámetros, no publicada por el autor.
- VRAM estimada por cuantización GGUF (solo pesos, aproximada): Q8_0 en torno a 1,9 GB, Q6_K en torno a 1,5 GB, Q5_K_M en torno a 1,3 GB y Q4_K_M en torno a 1,1-1,2 GB. Añadir overhead de contexto y runtime.
- GPU recomendadas: cabe con holgura en una RTX 4090, RTX 4080, RTX 3090 o RTX 4070 Ti en bf16; para GPUs de 8 GB es preferible Q8_0 o inferior. En A100 y H100 el modelo es muy pequeño y el cuello de botella será el throughput, no la memoria.
- Cabe en GPU de consumo: sí, en cualquier tarjeta con 6 GB o más en bf16 y en tarjetas de 4-8 GB usando GGUF Q4_K_M o Q5_K_M.
- Despliegue: Transformers con `trust_remote_code=True` y `dtype=torch.bfloat16`; llama.cpp mediante `llama-cli -hf ErebusTN/Athena-GGUF:Q4_K_M` con `--temp 0.1 --top-k 50 --repeat-penalty 1.1 --reasoning off`. Al ser GGUF, es compatible con el ecosistema llama.cpp (Ollama, LM Studio y similares), aunque no se confirma en la información disponible. El soporte en vLLM o TGI no está confirmado, ya que la arquitectura requiere código personalizado.
- Latencia y throughput: no disponibles. La arquitectura híbrida con 13 capas convolucionales está pensada explícitamente para acelerar prefill y decodificación con poca memoria, pero no se publican cifras.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ErebusTN/Athena | 1,73B | 256K de arquitectura, entrenado a 1536 tokens | Seguridad defensiva, edge | Apache 2.0 (con discrepancia en el frontmatter) | safetensors + GGUF |
| ErebusTN/EGen-SA1Q8 | no disponible | no disponible | Conversacional y procesamiento de datos estructurados, ajustado con SFT | no disponible | HuggingFace |
| ErebusTN/EGen-SA1Q9 | no disponible | no disponible | Conversacional y procesamiento de datos estructurados, ajustado con SFT | no disponible | HuggingFace |

Los dos modelos comparables identificados pertenecen a la misma familia (Athena Project, 2025) según los resultados de búsqueda, pero no se dispone de sus especificaciones técnicas en la información proporcionada. No se han encontrado en la búsqueda referencias a modelos de otros fabricantes con datos verificables para una comparación cuantitativa.

## Limitaciones y advertencias

- Riesgo de alucinación explícitamente reconocido por el autor: puede inventar identificadores CVE, flags de comandos, números de versión y citas. Cualquier dato operativo debe verificarse antes de actuar.
- El corpus de seguridad es mayoritariamente en inglés; la profundidad del conocimiento en otros idiomas, incluido el español, es presumiblemente menor.
- Sin acceso a internet y sin memoria entre conversaciones: no puede consultar información actualizada ni mantener estado fuera de la ventana de chat.
- Contexto efectivo limitado: aunque la arquitectura soporte 256K tokens, el entrenamiento se hizo con 1536 tokens y el comportamiento en contexto largo no se ha reevaluado. No debe asumirse un rendimiento fiable más allá de esa longitud.
- Enfoque defensivo con rechazos para la generación de malware y construcción de exploits; no es apto para pruebas de penetración ofensivas.
- No sustituye el juicio profesional en decisiones legales, de cumplimiento o de respuesta a incidentes.
- Discrepancia de licencia: los tags y los metadatos de HuggingFace indican Apache 2.0, mientras que el frontmatter de la model card declara `license: other` con `license_name: apache-2.0`. Conviene confirmar los términos con el autor antes de un uso comercial.
- El repositorio requiere `trust_remote_code=True`, lo que implica ejecutar código incluido en el propio repositorio; auditar antes de desplegar en entornos sensibles.
- Ausencia de adopción verificable: cero descargas y cero likes en el momento de la consulta, y sin benchmarks publicados que respalden las capacidades declaradas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ErebusTN/Athena
- Repositorio GGUF: https://huggingface.co/ErebusTN/Athena-GGUF
- Licencia Apache 2.0: https://www.apache.org/licenses/LICENSE-2.0.txt
- Sitio de EGen Labs / ErebusTN: https://erebustn.io/
- Athena CLI en GitHub: https://github.com/EGen-V/Athena-CLI
- Variante EGen-SA1Q9: https://huggingface.co/ErebusTN/EGen-SA1Q9
- Variante EGen-SA1Q8: https://huggingface.co/ErebusTN/EGen-SA1Q8
