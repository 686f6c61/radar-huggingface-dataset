# Aruntech007/Hacker-ONE

## Resumen

Hacker-ONE es un modelo de lenguaje especializado en seguridad defensiva, publicado en Hugging Face por el usuario Aruntech007 bajo el identificador `Aruntech007/Hacker-ONE`. La model card del repositorio lo presenta como un ajuste fino de la arquitectura GLM-5.3 orientado a análisis de código, threat hunting e investigación de vulnerabilidades, con cuantización a 8 bits en coma flotante (BF8/FP8). El repositorio pesa 755,7 GB y contiene pesos en formato safetensors con un total de 753.329.940.480 parámetros, lo que lo sitúa en la categoría de modelos de escala muy grande (aproximadamente 753 mil millones de parámetros).

El modelo se presenta como un asistente de AppSec (Application Security) capaz de revisar fragmentos de código, configuraciones de sistemas y logs técnicos para detectar fallos estructurales de seguridad y proponer mitigaciones. La model card declara soporte para lenguajes de programación como Python, JavaScript/TypeScript, C/C++, Java, Go, Bash, Rust y PHP, así como inglés como idioma natural principal, y una ventana de contexto de 128k tokens según los badges de la propia model card.

La información disponible es escasa y parcialmente inconsistente: el autor del repositorio en Hugging Face (Aruntech007) no coincide con el nombre que aparece en la model card (Falln87), no se especifica licencia, no hay pipeline declarado, no consta ningún resultado de benchmarks y el número de descargas y likes es cero en el momento de la consulta. Todo ello obliga a tratar la ficha como una descripción de lo declarado por el autor, no como una validación independiente del modelo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GLM-5.3 (General Language Model), tag de Hugging Face `glm_moe_dsa` |
| Parametros totales | 753.329.940.480 (753,3 mil millones) |
| Parametros activos | no disponible |
| Longitud de contexto | 128k tokens (según badge de la model card) |
| Tipos de cuantizacion | BF8 / FP8 (8 bits en coma flotante, `torch.float8_e5m2` en el ejemplo de inferencia) |
| Idiomas soportados | Inglés (lenguaje natural); lenguajes de programación: Python, JavaScript/TypeScript, C/C++, Java, Go, Bash, Rust, PHP |
| Licencia | no disponible |
| Formato de pesos | safetensors (tag `safetensors`, `fp8`) |

## Arquitectura y entrenamiento

La arquitectura declarada es GLM-5.3, una familia de modelos transformer de tipo General Language Model. El tag de Hugging Face `glm_moe_dsa` sugiere una variante con mezcla de expertos (MoE) y algún mecanismo de atención dispersa o dinámica, aunque la model card no detalla la configuración de expertos, el número de parámetros activos por token ni la implementación concreta de la atención. El repositorio contiene 753,3 mil millones de parámetros en safetensors, cuantizados a 8 bits en coma flotante, lo que explica el tamaño de 755,7 GB del repositorio.

El ajuste fino se realizó, según la model card, sobre un dataset propietario y saneado de documentos específicos de seguridad, con énfasis en remediación defensiva. Las categorías de datos declaradas incluyen la base de datos CVE y NVD (con lógica de puntuación CVSS y diffs de parches oficiales), historial de commits de GitHub etiquetados como "security fix", "patch" o "vulnerability", marcos estandarizados como OWASP Top 10, MITRE ATT&CK, NIST y SANS CWE, y write-ups éticos de bug bounty (HackerOne, según el texto truncado de la model card). No se especifica el número de tokens de entrenamiento, la composición exacta del dataset, ni si se aplicaron técnicas de RLHF, DPO o alineación adicional más allá de la declaración de que el modelo ha sido alineado para rechazar solicitudes ofensivas.

## Capacidades

- Análisis estático de código (SAST) para detectar vulnerabilidades como inyección SQL, XSS, CSRF o IDOR en fragmentos de código y configuraciones.
- Generación de explicaciones y parches de remediación para vulnerabilidades identificadas.
- Análisis de logs de servidores web (Apache, Nginx), AWS CloudTrail y registros de eventos de Windows para identificar indicadores de compromiso.
- Soporte de múltiples lenguajes de programación: Python, JavaScript/TypeScript, C/C++, Java, Go, Bash, Rust y PHP.
- Comprensión de marcos de seguridad estándar (OWASP Top 10, MITRE ATT&CK, NIST, CWE) y de lógica de puntuación CVSS.
- Capacidad declarada de de-obfuscación de scripts y mapeo de superficies de ataque en contextos de bug bounty ético.
- Alineación para rechazar la generación de exploits activos, malware armado, ransomware, instrucciones de ataque a infraestructura no propia, ingeniería social, phishing y recolección no autorizada de credenciales.
- Ventana de contexto de 128k tokens, adecuada para analizar archivos de código extensos o volúmenes de logs.
- No se declara soporte explícito de tool calling, function calling, agentes multi-paso, visión, audio ni modo de razonamiento extendido (thinking mode) en la información disponible.

## Casos de uso

- Revisión de código en pipelines de CI/CD: el modelo puede integrarse como paso de análisis estático para revisar diffs y fragmentos de código antes del despliegue, detectando patrones de inyección SQL, XSS o IDOR y generando sugerencias de parche. Su contexto de 128k permite procesar archivos completos o conjuntos de cambios amplios en una sola pasada.
- Triaje de vulnerabilidades en equipos de AppSec: dado un CVE o un diff de parche, el modelo puede explicar la naturaleza del fallo, la lógica de puntuación CVSS asociada y la mitigación recomendada, apoyándose en su entrenamiento declarado sobre NVD y parches oficiales.
- Análisis de logs para respuesta a incidentes: el modelo puede procesar registros de Apache, Nginx, CloudTrail o eventos de Windows y señalar indicadores de compromiso, aprovechando la ventana de contexto larga para correlacionar eventos de múltiples fuentes.
- Formación en codificación segura: instructores y estudiantes pueden usar el modelo para explicar por qué un fragmento de código es vulnerable y cómo corregirlo, con ejemplos en varios lenguajes de programación.
- Investigación en bug bounty ético: el modelo puede ayudar a comprender rutas de código complejas, de-obfuscar scripts y mapear superficies de ataque dentro de programas autorizados, siempre con la restricción de no generar exploits activos.
- Auditoría de configuraciones de sistemas: revisión de ficheros de configuración de servidores y servicios para detectar ajustes inseguros, alineados con las recomendaciones de OWASP, NIST o SANS.
- Asistencia en la redacción de informes de seguridad: generación de descripciones técnicas de hallazgos y recomendaciones de remediación a partir de fragmentos de código o logs aportados por el analista.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con 753,3 mil millones de parámetros en BF8/FP8 (1 byte por parámetro), los pesos ocupan aproximadamente 753 GB, a los que hay que sumar memoria para el estado de la caché KV y activaciones. Se requiere un entorno multi-GPU de alta gama; no es viable en una sola GPU convencional.
- GPU recomendadas: el modelo declara compatibilidad con arquitecturas que soportan operaciones de coma flotante de 8 bits de forma nativa, como Ada Lovelace (RTX 4090, L40S) y Hopper (H100). Para alojar los pesos completos se necesitan configuraciones con varios aceleradores de 80 GB (por ejemplo, 10 o más H100 de 80 GB) o clústeres equivalentes.
- No cabe en GPU de consumo: una RTX 4090 con 24 GB no puede alojar los pesos completos ni siquiera en cuantizaciones de 8 bits. Sería necesaria una cuantización mucho más agresiva (por ejemplo, 4 bits o inferior) y, aun así, el tamaño resultante seguiría superando la capacidad de una sola GPU de consumo.
- Opciones de despliegue: el ejemplo de la model card usa `transformers` con `trust_remote_code=True` y `torch_dtype=torch.float8_e5m2`, con `device_map="auto"` para reparto entre GPUs. No se documentan integraciones con vLLM, llama.cpp, Ollama o TGI en la información disponible; dado el soporte FP8 y la arquitectura GLM, sería necesario verificar la compatibilidad con cada framework antes de su uso en producción.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Hacker-ONE (Aruntech007) | 753,3 mil millones | 128k (declarado) | no disponible | Hugging Face, repo de 755,7 GB, 0 descargas | Ajuste fino de GLM-5.3 en BF8, especializado en seguridad defensiva |
| Modelos de seguridad especializados de tamano medio (por ejemplo, variantes de 7B-13B afinadas para AppSec) | 7-13 mil millones | Variable, habitualmente 8k-32k | Variable según autor | Habitual en Hugging Face | Mucho más ligeros y desplegables en una sola GPU, pero con menor capacidad de razonamiento y contexto |
| Modelos generalistas de gran escala (familia GLM, Llama, Qwen en el rango de 70B-400B) | 70-400 mil millones | 32k-128k | Variable según familia | Amplia disponibilidad | No especializados en seguridad; requieren prompting específico para tareas de AppSec |

No se dispone de datos de benchmarks que permitan una comparación cuantitativa con alternativas. La comparativa anterior es cualitativa y se basa únicamente en el tamano y la categoría declarada.

## Limitaciones y advertencias

- La model card advierte de falsos positivos y falsos negativos: el modelo puede señalar vulnerabilidades inexistentes en código seguro o pasar por alto fallos profundamente embebidos, incluidos zero-days.
- Dificultad declarada con fallos de lógica de negocio (por ejemplo, procesos de autenticación multi-paso defectuosos) sin un prompting contextual muy detallado.
- Riesgo de alucinación en la identificación de vulnerabilidades y en la generación de parches; toda salida debe ser revisada por un analista humano antes de aplicarse.
- La licencia no está especificada, por lo que no se puede confirmar el uso comercial ni las condiciones de redistribución. Es imprescindible contactar con el autor antes de cualquier despliegue en producción.
- No hay información sobre sesgos conocidos, idiomas naturales soportados más allá del inglés ni evaluación independiente del modelo.
- Inconsistencia entre el autor del repositorio (Aruntech007) y el nombre que figura en la model card (Falln87); conviene verificar la procedencia y autenticidad de los pesos antes de usarlos.
- El repositorio no tiene descargas ni likes, no declara pipeline y no incluye resultados de evaluación, lo que reduce la confianza en su calidad y reproducibilidad.
- El requisito de hardware es extremo (aproximadamente 753 GB solo para pesos en 8 bits), lo que limita su uso a infraestructuras multi-GPU de alto coste.
- La alineación para rechazar usos ofensivos puede producir rechazos en tareas legítimas de investigación que rocen dominios sensibles; es necesario diseñar prompts y políticas de uso claras.
- El uso de `trust_remote_code=True` implica ejecutar código del autor del repositorio; debe auditarse en entornos de producción.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/Aruntech007/Hacker-ONE
- Sitio del autor citado en la model card: https://fallnai.com
- Perfil de Hugging Face citado en la model card: https://huggingface.co/fallnai
- No se han encontrado en la información proporcionada enlaces a papers, blogs técnicos, repositorios de código, demos ni documentación adicional.
