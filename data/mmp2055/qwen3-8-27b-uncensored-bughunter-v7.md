# mmp2055/Qwen3.8-27B-Uncensored-bughunter-v7

## Resumen

Qwen3.8-27B-Uncensored-bughunter-v7 es un fine-tune del modelo base orcarouter/Qwen3.8-27B-Uncensored, especializado en seguridad ofensiva y defensiva. Desarrollado por mmp2055, el modelo está entrenado sobre un corpus destilado de 15 611 unidades de conocimiento que cubren bug bounty, pentesting web, análisis de tráfico, DFIR, forensia de memoria y respuesta a incidentes. Está diseñado para asistir a investigadores en plataformas de bug bounty como HackerOne, Bugcrowd, Intigriti, YesWeHack e Immunefi, con reglas operacionales integradas que limitan el alcance a activos autorizados y promueven PoCs mínimos no destructivos.

El modelo se basa en la arquitectura Qwen3.8, un transformer denso multimodal de 27 320 millones de parámetros, con una ventana de contexto de 262 000 tokens heredada del base. El fine-tune se realizó con QLoRA mediante Unsloth, manteniendo intacta la torre de visión y el proyector multimodal del base, que no fueron entrenados. La versión v7 es una escala del anterior bughunter-v6 (Qwen3.5-9B) al mismo conjunto de datos e hiperparámetros, logrando una pérdida de validación final de 0,834 frente a 1,55 de su predecesor, lo que indica una mejor generalización.

El modelo se distribuye en formato GGUF (cuantización Q4_K_M, ~16,8 GB) junto con un proyector de visión mmproj-BF16 (~889 MB). Responde en español, mientras que los payloads, comandos y plantillas de informes están en inglés. Su relevancia actual radica en ofrecer una herramienta especializada y de código abierto para profesionales de seguridad que necesitan asistencia técnica contextualizada en operaciones reales de bug bounty y respuesta a incidentes, con una licencia Apache 2.0 que permite uso comercial.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso multimodal (familia Qwen3.8) |
| Parametros totales | 27 320 697 856 (~27,3 mil millones) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 262 000 tokens (heredada del base) |
| Tipos de cuantizacion | Q4_K_M (publicado); otras cuantizaciones GGUF posibles |
| Idiomas soportados | Español, inglés |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (Q4_K_M); safetensors de referencia (no publicados) |

## Arquitectura y entrenamiento

El modelo parte del base orcarouter/Qwen3.8-27B-Uncensored, que a su vez es una versión "abliterated" (eliminación de mecanismos de rechazo a nivel de tensor) del Qwen3.8-27B original de Alibaba. El base conserva la torre de visión, el proyector multimodal y el cabezal MTP (multi-token prediction), además de soportar tool calling y razonamiento extendido. El fine-tune se realizó con QLoRA mediante Unsloth, sobre un corpus 100% textual de 15 611 unidades de conocimiento destiladas de dominios de ciberseguridad. No se entrenaron ni la torre de visión ni el proyector, por lo que las capacidades multimodales del modelo son las heredadas sin ajuste específico.

El entrenamiento utilizó los mismos hiperparámetros que la versión v6 (Qwen3.5-9B), escalando a 27 mil millones de parámetros. Según el autor, la pérdida de validación final fue de 0,834 frente a 1,55 de v6 sobre el mismo split de validación. El modelo incorpora reglas operacionales que se activan cuando se proporciona un system prompt: verificación de alcance autorizado, límite de throughput de 1-2 peticiones por segundo, PoCs mínimos no destructivos, callbacks a infraestructura propia, y prohibición de usar credenciales encontradas en hallazgos para validar acceso.

## Capacidades

- Seguridad ofensiva (red team): reconocimiento pasivo de subdominios, mapeo de superficie de ataque, extracción de secretos en JavaScript, detección de vulnerabilidades web (IDOR/BOLA, SSRF, CSRF, XSS en todas sus variantes, SQLi, CORS mal configurado, open redirect encadenable a OAuth, prototype pollution, subdomain takeover, path traversal, HTTP request smuggling, cache poisoning).
- Seguridad defensiva (blue team): DFIR, reconstrucción de líneas de tiempo, análisis de tráfico de red, detección de C2, forensia de memoria con Volatility, threat hunting basado en TTPs, gestión de vulnerabilidades con CVSS.
- Soporte de tool calling y function calling (heredado del base).
- Soporte de agentes y razonamiento multi-paso (thinking mode heredado).
- Capacidades multimodales: puede describir imágenes y responder preguntas visuales básicas, aunque no fue afinado para razonamiento sobre imágenes.
- Multilingüe: responde en español, genera payloads, comandos y plantillas de informes en inglés.
- Especialización en reportes para plataformas de bug bounty (HackerOne CVSS, Bugcrowd VRT, Intigriti).
- Conocimientos adicionales: seguridad WiFi (WPA/WPA2/WPA3), análisis Sub-GHz/SDR, ingeniería inversa, desarrollo de exploits, técnicas MITRE ATT&CK.

## Casos de uso

- Bug bounty en plataformas como HackerOne o Bugcrowd: el modelo asiste en la identificación de vectores de ataque, la elaboración de PoCs mínimos y la redacción de informes en el formato específico de cada plataforma, con cálculo de severidad CVSS y razonamiento de impacto.
- Análisis de tráfico de red y detección de C2: gracias a su conocimiento en análisis de PCAP y patrones de exfiltración, puede ayudar a analistas blue team a identificar comunicaciones anómalas y túneles DNS.
- Respuesta a incidentes (DFIR): el modelo guía la reconstrucción de líneas de tiempo, la recopilación de artefactos y la cadena de custodia, aplicando metodologías de respuesta a incidentes.
- Forensia de memoria: con su conocimiento de Volatility, puede asistir en la identificación de malware residente, code injection y process hollowing en volcados de memoria.
- Desarrollo de exploits e ingeniería inversa: para investigadores que necesitan analizar binarios, identificar vulnerabilidades explotables y construir PoCs, el modelo ofrece orientación técnica y ejemplos de código.
- Auditoría de APIs y autenticación: puede ayudar a evaluar endpoints GraphQL, BOLA/BFLA, vulnerabilidades en OAuth/OIDC y JWT, y a diseñar pruebas de autorización.
- Automatización defensiva (SOAR): puede generar playbooks de respuesta, correlacionar eventos y sugerir acciones de contención para integración con SIEM.
- Generación de informes técnicos: el modelo produce plantillas de informes de vulnerabilidad en inglés, con secciones de resumen, impacto, reproducción y remediación, listas para adaptar.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible. El autor reporta únicamente la pérdida de validación final del fine-tune (0,834 para v7 frente a 1,55 para v6) sobre el mismo split de validación, lo que indica una mejora relativa en generalización, pero no es comparable con métricas de referencia de la industria. Tampoco hay datos de rendimiento en tareas específicas de ciberseguridad.

## Requisitos de hardware

- VRAM estimada: el archivo GGUF Q4_K_M pesa ~16,8 GB, por lo que se recomienda al menos 20 GB de VRAM para inferencia en GPU con margen para el contexto y la caché KV. Con 16 GB (por ejemplo, una RTX 4080 o 4090) puede cargarse, pero el contexto máximo se verá limitado.
- GPU recomendadas: RTX 4090 (24 GB), RTX 4080 (16 GB), A100 (40/80 GB), H100 (80 GB), o GPUs de consumo con 24 GB como la RTX 3090/4090.
- En CPU: puede ejecutarse con llama.cpp, aunque la latencia será alta; se recomienda al menos 32 GB de RAM.
- Opciones de despliegue: LM Studio, llama.cpp (build ≥ mayo de 2026 para soporte de arquitectura `qwen35`), o cualquier runtime que acepte GGUF con esa arquitectura. No se han publicado pesos safetensors, por lo que vLLM o TGI no son aplicables directamente.
- Latencia y throughput: no se han publicado datos específicos. En una RTX 4090 con Q4_K_M, se puede esperar una velocidad de generación de 30-60 tokens por segundo, aunque depende de la longitud del contexto y del número de peticiones concurrentes.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Especialización | Formato |
|---|---|---|---|---|---|
| mmp2055/Qwen3.8-27B-Uncensored-bughunter-v7 | 27,3 B | 262 K | Apache 2.0 | Ciberseguridad ofensiva/defensiva | GGUF |
| orcarouter/Qwen3.8-27B-Uncensored (base) | 27,3 B | 262 K | Apache 2.0 | Modelo general abliterated | GGUF, safetensors |
| Qwen3.8-27B (original de Alibaba) | 27,3 B | 262 K | Apache 2.0 | Multimodal general, coding, agentes | safetensors, GGUF |
| mmp2055/qwen3.5-9b-claude-4.6-os-av-h-uncensored-think-d_au-imat-bughunter-v6 | 9 B | no disponible | Apache 2.0 | Ciberseguridad (versión anterior) | GGUF |

El fine-tune v7 se diferencia del base por su enfoque exclusivo en ciberseguridad y las reglas operacionales integradas. Frente al Qwen3.8-27B original, añade una capa de conocimiento especializado y elimina los mecanismos de rechazo, lo que lo hace más útil para tareas de red team pero también más riesgoso si se usa sin control. Comparado con su predecesor v6 (9 B), ofrece el triple de parámetros y una mejor generalización, según el autor.

## Limitaciones y advertencias

- Modelo "uncensored": el alignment de seguridad ha sido sustancialmente eliminado en el base. Puede generar contenido ofensivo, malware o instrucciones peligrosas si se usa malintencionadamente. Solo debe emplearse en entornos autorizados y con fines legítimos de investigación.
- Riesgo de alucinación: como todo modelo de lenguaje, puede inventar vulnerabilidades, CVEs o técnicas inexistentes. Las sugerencias deben verificarse siempre contra fuentes fiables.
- Visión no afinada: la capacidad multimodal es heredada del base y no ha sido entrenada para razonar sobre imágenes en el contexto de seguridad. Puede describir imágenes pero con menor precisión en tareas visuales complejas.
- Idioma: aunque responde en español, la generación de payloads y comandos es en inglés. No se ha evaluado su rendimiento en otros idiomas.
- Reglas operacionales condicionales: las directrices éticas solo se activan si se proporciona un system prompt explícito. Sin él, el modelo puede no aplicar las restricciones de alcance o throughput.
- Sin benchmarks publicados: no hay métricas estándar que respalden su rendimiento en tareas de seguridad frente a otros modelos.
- Requisitos de hardware: el tamaño del modelo (27 B) requiere hardware con al menos 16-20 GB de VRAM para un uso fluido, lo que limita su despliegue en equipos de gama baja.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mmp2055/Qwen3.8-27B-Uncensored-bughunter-v7
- Base orcarouter/Qwen3.8-27B-Uncensored: https://huggingface.co/orcarouter/Qwen3.8-27B-Uncensored
- Repositorio oficial de Qwen3.8-27B (Alibaba): https://github.com/AlibabaCloud-Official/Qwen3.8-27B
- Demo del base en Hugging Face Space: https://huggingface.co/spaces/P1723/Qwen3.8-27B-Uncensored-Demo
- Guía de Qwen3.8-27B Uncensored (Hackernoon): https://hackernoon.com/qwen38-27b-uncensored-vs-other-qwen-gguf-models
- Página de Ollama del base: https://ollama.com/orcarouter/Qwen3.8-27B-Uncensored
- Repo GGUF alternativo: https://huggingface.co/mradermacher/Qwen3.8-27B-Uncensored-GGUF
