# arcanicai/Con0-GGUF

## Resumen

Con0 es un modelo de lenguaje multimodal (vision-language) especializado en ciberseguridad, desarrollado por Arcanic AI en colaboración con NextZero. Está diseñado para actuar como un auditor de seguridad: analiza código fuente, logs, capturas de pantalla y diagramas de infraestructura, e identifica vulnerabilidades con recomendaciones de remediación. Cubre tanto fallos clásicos de aplicaciones web (SQLi, XSS, CSRF, SSRF) como superficies de ataque emergentes en sistemas de IA (prompt injection, mal uso de tool-calling). El repositorio Con0-GGUF contiene las cuantizaciones GGUF del modelo base arcanicai/Con0, lo que permite ejecutarlo en entornos con recursos limitados mediante llama.cpp u otros motores compatibles.

El modelo se basa en la arquitectura Qwen (según los tags de HuggingFace) y cuenta con aproximadamente 26,9 mil millones de parámetros. Soporta entrada de texto e imágenes, y está entrenado para razonar sobre vulnerabilidades y ofrecer guías de corrección. Su licencia Apache 2.0 permite uso comercial sin restricciones. Aunque los benchmarks oficiales aún no se han publicado, la propuesta de valor reside en su especialización vertical en seguridad, un área donde los modelos generalistas suelen carecer de profundidad.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-language transformer basado en Qwen (no se especifica si es MoE) |
| Parametros totales | 26.895.998.464 (~26,9 mil millones) |
| Parametros activos | No disponible (no se indica que sea MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Q3_K_M, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_M, Q8_0, mmproj-F16 (proyector de visión) |
| Idiomas soportados | Inglés (en), vietnamita (vi), chino (zh) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (el modelo base está en safetensors, este repo es exclusivamente GGUF) |

## Arquitectura y entrenamiento

Con0 es un modelo multimodal que combina un codificador de visión con un decoder de lenguaje basado en la arquitectura Qwen. El tag `qwen` en HuggingFace sugiere que utiliza la misma familia de arquitecturas que los modelos Qwen2-VL, aunque no se especifica la versión exacta ni los detalles internos (número de capas, atención, etc.). El modelo acepta tanto texto como imágenes, lo que le permite analizar capturas de pantalla, diagramas y otros elementos visuales en el contexto de auditorías de seguridad.

No se dispone de información pública sobre el proceso de entrenamiento: ni el número de tokens, ni la composición del dataset, ni si se emplearon técnicas como RLHF o DPO. La model card menciona que el modelo está "construido para pensar como un auditor de seguridad", lo que sugiere un ajuste fino especializado sobre un modelo base Qwen, pero no se ofrecen datos concretos sobre los datos de entrenamiento ni las fases de alineación.

## Capacidades

- Análisis de vulnerabilidades en aplicaciones web: detección de SQLi (time-based, boolean-based, error-based, blind), XSS (reflejado, almacenado, DOM), CSRF, SSRF, inyección de comandos, path traversal, XXE, deserialización insegura.
- Revisión de autenticación y control de acceso: identificación de fallos de autenticación, broken access control e IDOR.
- Cobertura de OWASP Top 10: evaluación de código y configuración según las categorías del estándar.
- Seguridad en sistemas de IA: análisis de prompt injection, jailbreaks, mal uso de tool-calling, revisión de permisos y modelado de amenazas en agentes multi-paso.
- Triage de vulnerabilidades y mapeo con CVEs: contextualización de hallazgos con identificadores de vulnerabilidades conocidas.
- Análisis de incidentes: interpretación de logs, trazas y capturas de pantalla para reconstruir ataques.
- Soporte de visión: procesamiento de imágenes (capturas, diagramas de infraestructura) para análisis de seguridad.
- Multilingüe: funciona en inglés, vietnamita y chino, aunque el enfoque principal es la terminología técnica de seguridad.

## Casos de uso

- Revisión de código en pipelines CI/CD: Con0 puede analizar pull requests o commits en busca de vulnerabilidades de inyección o control de acceso antes del despliegue. Su capacidad de razonamiento multi-paso permite explicar el flujo del ataque y sugerir parches concretos.
- Auditoría de configuración de infraestructura: dado un diagrama de red o un archivo de configuración (por ejemplo, de un balanceador o un firewall), el modelo identifica reglas demasiado permisivas o puertos expuestos innecesariamente.
- Análisis forense de incidentes: con logs de servidor o trazas de aplicación, Con0 puede correlacionar eventos y señalar patrones de ataque (fuerza bruta, exfiltración de datos, movimiento lateral).
- Evaluación de seguridad en aplicaciones de IA: para sistemas que usan agentes con tool-calling, el modelo revisa los permisos otorgados a cada herramienta y detecta posibles abusos (por ejemplo, un agente con acceso a una base de datos sensible sin necesidad real).
- Formación y concienciación en seguridad: a partir de capturas de pantalla de aplicaciones vulnerables, Con0 genera explicaciones didácticas sobre cómo se explota cada fallo y cómo prevenirlo, útil para equipos de desarrollo.
- Análisis de prompts y jailbreaks: en entornos de producción con LLMs, Con0 puede evaluar si un prompt intenta inyectar instrucciones maliciosas o evadir restricciones, ayudando a robustecer los sistemas de filtrado.
- Soporte a pentesters: durante una prueba de penetración, el modelo asiste en la interpretación de resultados de herramientas como Burp Suite o Nmap, priorizando hallazgos y sugiriendo vectores de explotación adicionales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica que la evaluación está en progreso y se publicará en la página del modelo base (arcanicai/Con0). No se proporcionan cifras de MMLU, HumanEval, GSM8K ni métricas específicas de ciberseguridad.

## Requisitos de hardware

Los requisitos de memoria según la cuantización (datos de la model card):

| Cuantización | RAM/VRAM aproximada |
|---|---|
| Q3_K_M | ~16 GB |
| IQ4_XS / Q4_K_S / Q4_K_M | ~19 GB |
| Q5_K_M | ~22 GB |
| Q8_0 | ~31 GB |

- GPU recomendadas: para Q3_K_M e IQ4_XS, una RTX 4080 o RTX 4090 (16-24 GB VRAM) es suficiente. Para Q4_K_M y superiores, se necesita una GPU con al menos 24 GB (RTX 4090, A5000) o 32 GB (A100, V100). Q8_0 requiere 31 GB, por lo que es viable en A100 (40 GB) o en configuraciones multi-GPU.
- En CPU: con llama.cpp, las cuantizaciones Q3/Q4 pueden ejecutarse en sistemas con 32 GB de RAM, aunque la latencia será alta para tareas de razonamiento extenso.
- Opciones de despliegue: llama.cpp (con soporte para la arquitectura `qwen35`, requiere runtime ≥ b10488), LM Studio (≥ 0.4.6), y cualquier motor compatible con GGUF como Ollama (si se añade manualmente el modelo).
- Latencia y throughput: no disponibles. Dependen del hardware y de la longitud de la secuencia; para un modelo de 27B en Q4, se espera un rendimiento de 10-20 tokens/s en una RTX 4090, pero no hay cifras oficiales.

## Comparativa con modelos similares

No se dispone de una comparativa directa publicada con otros modelos especializados en ciberseguridad. Los modelos generalistas como Qwen2-VL-27B o Llama-3.1-8B pueden manejar tareas de seguridad de forma básica, pero Con0 está específicamente ajustado para este dominio, lo que debería traducirse en mayor precisión en la detección de vulnerabilidades y en la generación de recomendaciones accionables. Sin embargo, al no existir benchmarks públicos, no es posible cuantificar esa ventaja. Se recomienda evaluar Con0 en un conjunto propio de casos de uso antes de adoptarlo en producción.

## Limitaciones y advertencias

- Sesgos y alucinaciones: al ser un modelo de lenguaje, puede generar falsos positivos o negativos en la detección de vulnerabilidades. No debe utilizarse como única fuente de verdad en auditorías críticas sin validación humana.
- Idiomas limitados: solo soporta inglés, vietnamita y chino. No está preparado para otros idiomas, lo que restringe su uso en equipos que trabajen en español, francés, etc.
- Contexto no especificado: se desconoce la longitud máxima de contexto, lo que puede limitar el análisis de archivos muy extensos (por ejemplo, código fuente de gran tamaño o logs largos).
- Datos de entrenamiento no publicados: no se sabe qué datos se usaron para el ajuste fino, por lo que no se puede evaluar la cobertura de versiones recientes de vulnerabilidades o de frameworks específicos.
- Requisitos de hardware elevados: incluso la cuantización más pequeña (Q3_K_M) requiere ~16 GB de RAM/VRAM, lo que excluye GPUs de gama baja.
- Dependencia de la arquitectura Qwen: el modelo requiere un runtime específico de llama.cpp con soporte `qwen35`; versiones antiguas no lo ejecutarán.
- Sin benchmarks publicados: no hay evidencia empírica de su rendimiento frente a alternativas, lo que dificulta la toma de decisiones informada.

## Enlaces

- Repositorio GGUF: https://huggingface.co/arcanicai/Con0-GGUF
- Modelo base (safetensors): https://huggingface.co/arcanicai/Con0
- Sitio de Arcanic AI: https://arcanic.ai
- Sitio de NextZero: https://nextzero.vn
