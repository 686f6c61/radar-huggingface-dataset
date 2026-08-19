# elsiddik/finsec_detector

## Resumen

FineSec-Detector es un modelo de lenguaje especializado en ciberseguridad, desarrollado por el usuario elsiddik, que parte del modelo base Qwen2.5-Coder-7B-Instruct y se ajusta mediante QLoRA 4-bit con la librería Unsloth. Su propósito es actuar como un auditor de seguridad de aplicaciones: analiza código fuente, identifica vulnerabilidades, las clasifica según identificadores CWE y niveles de severidad alineados con CVSS, y genera parches de corrección en formato JSON estructurado. Está pensado para integrarse en pipelines de CI/CD y flujos de revisión de código, ofreciendo una solución ligera y especializada para la detección automatizada de fallos de seguridad.

Con 7.000 millones de parámetros y una ventana de contexto de 1024 tokens, el modelo es adecuado para tareas de auditoría de fragmentos de código de tamaño moderado. Su licencia Apache-2.0 permite uso comercial y modificación, lo que facilita su adopción en entornos empresariales. La publicación reciente del modelo (agosto de 2026) y su enfoque en la generación de informes JSON lo convierten en una opción interesante para equipos de seguridad que buscan automatizar parte del análisis estático de código.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen2.5-Coder-7B-Instruct (Transformer decoder) |
| Parametros totales | 7.000 millones (7B) |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | 1024 tokens |
| Tipos de cuantizacion | 4-bit (QLoRA) segun la documentacion; compatible con otras precisiones mediante Unsloth |
| Idiomas soportados | Ingles y codigo (Python, C/C++, JavaScript, Go, PHP, Java, Bash) |
| Licencia | Apache-2.0 |
| Formato de pesos | no especificado en la model card (probablemente safetensors) |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura transformer decoder de Qwen2.5-Coder-7B-Instruct, que emplea atención completa sobre todas las posiciones de la secuencia. El ajuste fino se realizó con QLoRA en 4 bits mediante la librería Unsloth, aplicando adaptadores LoRA a las proyecciones de atención (q, k, v, o) y a las capas feed-forward (gate, up, down) con rango 16 y alpha 32. Esta técnica reduce sustancialmente los requisitos de memoria durante el entrenamiento y la inferencia, manteniendo un rendimiento cercano al ajuste completo.

El entrenamiento utilizó un dataset propio denominado custom-sec-cve, que combina informes de vulnerabilidades CVE, benchmarks de exploits reales y patrones de reparación de código seguro. No se menciona el uso de RLHF o DPO; se trata de un ajuste supervisado orientado a tareas específicas de auditoría de seguridad. La ausencia de datos públicos sobre el tamaño del dataset o el número de pasos de entrenamiento limita la reproducibilidad, pero la arquitectura base es bien conocida y el proceso de QLoRA está documentado en la model card.

## Capacidades

- Detección de vulnerabilidades en código fuente de Python, C/C++, JavaScript, Go, PHP, Java y Bash.
- Clasificación de vulnerabilidades según identificadores CWE, incluyendo ejemplos como CWE-89 (inyección SQL), CWE-79 (XSS), CWE-78 (inyección de comandos) y CWE-120 (desbordamiento de búfer).
- Asignación de severidad alineada con CVSS: CRITICAL, HIGH, MEDIUM y LOW.
- Generación de parches de corrección: produce código corregido y diffs que reemplazan la lógica vulnerable.
- Salida estructurada en JSON con campos como is_vulnerable, severity, cwe, vulnerability_type, description, vulnerable_code, remediation y fixed_code.
- Capacidad multilingüe limitada al inglés y al lenguaje de programación correspondiente; no se contemplan idiomas naturales adicionales.

## Casos de uso

- Integración en pipelines de CI/CD: el modelo puede ejecutarse como paso de análisis estático, generando reportes JSON que bloquean merges si se detectan vulnerabilidades críticas, gracias a su salida estructurada y su bajo coste de inferencia.
- Revisión de pull requests: al recibir un diff, el modelo identifica las líneas vulnerables y sugiere correcciones antes de la fusión, reduciendo la carga de los revisores humanos.
- Auditoría de código legacy: analiza repositorios antiguos para detectar fallos de seguridad no corregidos y priorizar su remediación, aprovechando su capacidad para clasificar severidad y CWE.
- Generación de documentación de seguridad: a partir del JSON de salida, se pueden crear informes automáticos para cumplimiento normativo o para integrarlos en plataformas de gestión de vulnerabilidades.
- Formación en seguridad para desarrolladores: el modelo puede explicar por qué un fragmento es vulnerable y cómo corregirlo, sirviendo como herramienta educativa en talleres o programas de concienciación.
- Integración en plataformas de gestión de vulnerabilidades: los resultados JSON pueden alimentar sistemas como Jira o DefectDojo para crear tickets automáticamente, agilizando el flujo de trabajo de los equipos de seguridad.
- Análisis de dependencias y código de terceros: permite evaluar rápidamente la seguridad de bibliotecas o módulos antes de incorporarlos, gracias a su soporte para múltiples lenguajes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas como MMLU, HumanEval o evaluaciones específicas de detección de vulnerabilidades. Tampoco se han encontrado comparaciones cuantitativas con otros modelos en las fuentes consultadas.

## Requisitos de hardware

- Al ser un modelo de 7B, puede ejecutarse en GPUs de consumo con al menos 8 GB de VRAM si se usa cuantización 4-bit, aunque no se proporcionan requisitos oficiales.
- Con carga en 4 bits, el peso del modelo ronda los 3,5 GB, más overhead de activaciones y memoria, lo que permite su uso en tarjetas como RTX 3060, RTX 4060 o superiores.
- Para despliegue en producción, se recomienda usar vLLM o TGI con soporte para cuantización, o llama.cpp/Ollama para entornos más ligeros.
- No se especifican requisitos de latencia o throughput; estas métricas dependerán del hardware y del tamaño de los prompts.

## Comparativa con modelos similares

No se dispone de información sobre modelos directamente comparables con el mismo enfoque y datos de rendimiento. Sin embargo, se puede establecer una comparación cualitativa con alternativas relevantes:

| Modelo | Base | Enfoque | Licencia | Contexto |
|---|---|---|---|---|
| finsec_detector | Qwen2.5-Coder-7B-Instruct | Detección de vulnerabilidades y parcheo | Apache-2.0 | 1024 tokens |
| Qwen2.5-Coder-7B-Instruct | - | Modelo base de propósito general | Apache-2.0 | 32k tokens (original) |
| WhiteRabbitNeo (7B) | Llama-2 | Seguridad ofensiva y defensiva | Custom (no comercial) | 4k tokens |

Nota: el contexto del modelo base Qwen2.5-Coder-7B-Instruct es de 32k tokens, pero este fine-tune lo reduce a 1024. WhiteRabbitNeo es otro modelo de seguridad, pero no se dispone de comparaciones directas en términos de rendimiento.

## Limitaciones y advertencias

- La ventana de contexto de 1024 tokens es muy limitada para analizar archivos de código grandes; puede ser necesario dividir el código en fragmentos más pequeños, lo que podría perder dependencias entre secciones.
- El modelo solo está entrenado en inglés y código, por lo que los comentarios o descripciones en otros idiomas pueden no procesarse correctamente.
- No se han publicado evaluaciones independientes ni pruebas de robustez frente a ataques adversarios, lo que limita la confianza en entornos de producción críticos.
- La generación de parches puede no ser siempre correcta o segura; se recomienda revisión humana antes de aplicar cambios en producción.
- La licencia Apache-2.0 permite uso comercial, pero es obligatorio incluir el aviso de licencia y notificar cambios realizados.
- El modelo puede alucinar vulnerabilidades o clasificaciones erróneas; es necesario validar los resultados con herramientas adicionales como escáneres estáticos tradicionales.
- No se dispone de información sobre sesgos específicos, pero al estar entrenado en datos de seguridad, puede tener un sesgo hacia ciertos tipos de vulnerabilidades o patrones de código.

## Enlaces

- Hugging Face: https://huggingface.co/elsiddik/finsec_detector
- Repositorio GitHub relacionado (proyecto FineSec_detect): https://github.com/yangxiaoxuan123/FineSec_detect (no se confirma que sea del mismo autor, pero está vinculado al nombre del modelo)
