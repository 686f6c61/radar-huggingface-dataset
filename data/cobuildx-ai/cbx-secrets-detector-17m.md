# CobuildX-AI/cbx-secrets-detector-17M

## Resumen

cbx-secrets-detector-17M es un modelo de clasificación de tokens (token classification) desarrollado por CobuildX-AI para detectar secretos y credenciales en texto: contraseñas, claves de API, tokens de acceso, claves privadas, credenciales de nube y de bases de datos, entre otros. El modelo resuelve un problema clásico de seguridad: los escáneres basados en reglas (regex) solo encuentran secretos con prefijos o formatos fijos, mientras que este modelo lee el contexto y es capaz de detectar contraseñas sin formato reconocible, a la vez que ignora marcadores de posición, referencias a variables, hashes y valores de ejemplo falsos.

Técnicamente, es un fine-tuning de jhu-clsp/ettin-encoder-17m, un encoder basado en la arquitectura ModernBERT con solo 16,8 millones de parámetros. Está diseñado para ser la variante más rápida de la familia (existe también una versión de 32M), pensada específicamente para ejecutarse en CPU, con unos 37 ms por cada 1.000 tokens, frente a unos 6 ms en GPU. Devuelve la posición exacta de cada secreto encontrado con una de 12 etiquetas, lo que lo hace adecuado para pipelines de redacción (redaction) automática en logs, tickets, chats y ficheros de configuración.

Su relevancia actual radica en la creciente necesidad de prevenir fugas de credenciales en repositorios de código, sistemas de tickets y conversaciones de soporte, donde los escáneres tradicionales como Gitleaks, detect-secrets o TruffleHog presentan un recall muy bajo en secretos sin prefijo reconocible. Según los benchmarks publicados por el autor, este modelo supera ampliamente a esas herramientas en F1 manteniendo una tasa de falsos positivos muy baja (0,9 %).

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | ModernBERT (encoder), fine-tuning de jhu-clsp/ettin-encoder-17m |
| Parámetros totales | 16.803.865 (~17M) |
| Parámetros activos | no disponible (no consta que sea MoE; se asume todos activos) |
| Longitud de contexto | 7.999 tokens en una sola pasada; textos más largos se dividen automáticamente en fragmentos solapados |
| Tipos de cuantización | no disponible |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (tamaño del repo: 0,1 GB) |

## Arquitectura y entrenamiento

El modelo es un encoder de tipo transformer basado en ModernBERT, concretamente un ajuste fino de ettin-encoder-17m del grupo JHU CLSP. ModernBERT es una familia de encoders modernizados que incorpora mejoras de eficiencia frente a BERT clásico, como atención más eficiente en contextos largos, lo que explica que el modelo pueda procesar 7.999 tokens en una sola pasada. La tarea es de token classification (NER sobre secretos): el modelo etiqueta los spans exactos del texto que contienen un valor sensible, con 12 clases de salida (PASSWORD, API_KEY, ACCESS_TOKEN, JWT_TOKEN, SESSION_SECRET, WEBHOOK_SECRET, CLOUD_CREDENTIAL, PRIVATE_KEY, CERTIFICATE_SECRET, ENCRYPTION_KEY, DATABASE_CREDENTIAL y GENERIC_SECRET).

Sobre los datos de entrenamiento, la model card indica que parte del conjunto procede de generadores propios de CobuildX y que se empleó el dataset de informes de incidencias de Ahmed et al.; además, se garantizó que ningún repositorio del conjunto de test de CredData (Samsung) se usara para entrenamiento ni para selección de modelo. No se especifica el número total de tokens de entrenamiento ni si se aplicaron técnicas como RLHF o DPO (no aplicables a un encoder de token classification). No se han detallado innovaciones adicionales en la inferencia más allá del procesamiento por fragmentos solapados para textos largos.

## Capacidades

- Detección de secretos a nivel de span con posición exacta (inicio y fin en caracteres) y una de 12 etiquetas tipadas.
- Clasificación fina del tipo de secreto: contraseñas, claves de API, tokens de acceso, JWTs, secretos de sesión, secretos de webhook, credenciales de nube (AWS), claves privadas (PEM, OpenSSH, service-account), bundles de certificado con clave privada (PKCS#12/PFX), claves de cifrado simétrico y URIs de conexión a bases de datos con contraseña.
- Discriminación contextual: ignora referencias como `${API_KEY}` o `os.environ["X"]`, marcadores de posición (`<your-api-key>`, `CHANGEME`), valores enmascarados, identificadores (AWS access key IDs, UUIDs), claves públicas y certificados, hashes y SHAs de git, y valores de ejemplo documentados.
- Redacción automática: el método `redact()` sustituye cada secreto por su etiqueta o por una plantilla personalizada.
- Filtrado por etiquetas: permite extraer solo las clases de interés (por ejemplo, solo PASSWORD y PRIVATE_KEY).
- Procesamiento de textos largos de hasta 7.999 tokens en una sola pasada, con división automática solapada para textos mayores.
- Entrada aplicable a código, ficheros de configuración, logs, tickets y chats.
- No soporta generación de texto, tool calling, agentes ni capacidades multimodales: es un modelo encoder especializado en token classification.

## Casos de uso

- Prevención de fugas de credenciales en CI/CD: integración en pipelines para escanear diffs y commits antes del push; su latencia de ~37 ms por 1.000 tokens en CPU lo hace viable en cada commit sin GPU.
- Redacción de logs y telemetría: uso de `redact()` para sustituir secretos por etiquetas antes de enviar logs a sistemas de terceros (Datadog, Splunk, ELK), evitando que credenciales queden almacenadas en plataformas de observabilidad.
- Filtrado en sistemas de tickets y soporte (Jira, Zendesk, Slack): detección de contraseñas y tokens que los usuarios pegan en tickets, con recall de 0,836 en el benchmark de informes de incidencias frente a 0,678 de Gitleaks.
- Auditoría de repositorios históricos: escaneo masivo de código legacy para encontrar secretos sin prefijo reconocible que Gitleaks o TruffleHog no detectan (F1 de 0,805 en CredData frente a 0,442 y 0,042 respectivamente).
- Cumplimiento y DLP en chats corporativos: clasificación y redacción de credenciales en mensajes antes de su almacenamiento o reenvío, aprovechando las 12 etiquetas para aplicar políticas distintas según el tipo de secreto.
- Preprocesamiento de datos para LLMs: limpieza de corpora de entrenamiento o de prompts de usuarios eliminando secretos antes de enviar texto a APIs de terceros.
- Escaneo de ficheros de configuración e infraestructura como código: detección de credenciales de bases de datos, claves de cifrado y secretos de nube en YAML, .env, Terraform, etc.

## Benchmarks y rendimiento

Span F1 (label-agnostic), con precisión y recall entre paréntesis; "falsas alarmas" es el porcentaje de líneas no secretas etiquetadas en las que se marca algo.

| Modelo | CredData test | falsas alarmas | Issue reports test | falsas alarmas | CBX secrets test |
|---|---:|---|---:|---|---:|
| **cbx-secrets-detector-17M** | 0,805 (0,80 / 0,81) | 0,9 % | 0,836 (0,90 / 0,78) | 0,9 % | 0,983 (0,99 / 0,98) |
| cbx-secrets-detector-32M | 0,820 (0,77 / 0,87) | 1,3 % | 0,861 (0,86 / 0,86) | 1,4 % | 0,998 (1,00 / 1,00) |
| Gitleaks 8.30.1 | 0,442 (0,90 / 0,29) | 0,6 % | 0,678 (0,93 / 0,54) | 0,5 % | 0,757 (0,99 / 0,61) |
| detect-secrets 1.5.0 | 0,460 (0,47 / 0,45) | 9,8 % | 0,290 (0,40 / 0,23) | 4,0 % | 0,626 (0,90 / 0,48) |
| TruffleHog 3.99.2 | 0,042 (0,38 / 0,02) | 0,8 % | 0,228 (0,66 / 0,14) | 0,9 % | 0,215 (1,00 / 0,12) |

Con la etiqueta exigida además de la posición (label-aware), el modelo obtiene 0,961 en CBX secrets test, con F1 por etiqueta: CERTIFICATE_SECRET 1,00; ENCRYPTION_KEY 1,00; JWT_TOKEN 1,00; PRIVATE_KEY 1,00; API_KEY 1,00; WEBHOOK_SECRET 0,99; CLOUD_CREDENTIAL 0,99; ACCESS_TOKEN 0,99; SESSION_SECRET 0,97; GENERIC_SECRET 0,94; DATABASE_CREDENTIAL 0,90; PASSWORD 0,89.

Nota del autor: el conjunto CBX secrets test proviene de los mismos generadores que parte de los datos de entrenamiento, por lo que sobreestima la precisión en texto real; los benchmarks CredData e Issue reports son la guía más fiable.

Rendimiento de inferencia: aproximadamente 6 ms por 1.000 tokens en GPU y 37 ms por 1.000 tokens en CPU.

## Requisitos de hardware

- VRAM estimada para inferencia: mínima; con 16,8M de parámetros en safetensors (0,1 GB de repo), el modelo ocupa del orden de decenas de MB en memoria. No se publica una cifra exacta de VRAM.
- GPU recomendadas: cualquier GPU moderna es suficiente dada la latencia publicada (~6 ms por 1.000 tokens); no se requiere A100 ni H100.
- Consumer GPU: sobradamente compatible con cualquier GPU de consumo (incluso integradas o portátiles); el modelo está diseñado para funcionar bien directamente en CPU (~37 ms por 1.000 tokens), que es el caso de uso recomendado para esta variante de 17M.
- Opciones de despliegue: el repo incluye un wrapper propio (`cbx_secrets.py` con la clase `SecretDetector`) y un `requirements.txt`; el flujo documentado usa `hf download` de huggingface_hub. No se menciona compatibilidad explícita con vLLM, llama.cpp, Ollama o TGI (al ser un encoder de token classification, llama.cpp y Ollama no aplican directamente).
- Latencia y throughput: ~6 ms por 1.000 tokens en GPU y ~37 ms por 1.000 tokens en CPU, según la model card.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | F1 CredData | F1 Issue reports | Licencia | Disponibilidad |
|---|---|---|---:|---:|---|---|
| cbx-secrets-detector-17M | 16,8M | 7.999 tokens | 0,805 | 0,836 | Apache 2.0 | HuggingFace, pesos abiertos |
| cbx-secrets-detector-32M | 32M (no disponible el dato exacto) | no disponible | 0,820 | 0,861 | Apache 2.0 | HuggingFace, pesos abiertos |
| Gitleaks 8.30.1 | basado en reglas (no es ML) | no disponible | 0,442 | 0,678 | MIT | Herramienta CLI open source |
| detect-secrets 1.5.0 | basado en reglas (no es ML) | no disponible | 0,460 | 0,290 | Apache 2.0 | Herramienta CLI open source |
| TruffleHog 3.99.2 | basado en reglas (no es ML) | no disponible | 0,042 | 0,228 | no disponible | Herramienta CLI open source |

La alternativa directa dentro de la misma familia es cbx-secrets-detector-32M, que ofrece mejor F1 (especialmente en recall) a costa de mayor latencia; la de 17M es la opción recomendada para CPU. Frente a los escáneres basados en reglas, la ventaja principal es el recall en secretos sin formato fijo (0,81 frente a 0,29 de Gitleaks en CredData), aunque Gitleaks mantiene una precisión ligeramente superior y una tasa de falsas alarmas marginalmente menor.

## Limitaciones y advertencias

- Idioma: el modelo está entrenado y etiquetado solo para inglés; su comportamiento en texto en otros idiomas no está documentado.
- No puede determinar si un valor real está activo: un valor realista se etiqueta aunque su nombre contenga "test" o "example", y a la inversa no puede verificar credenciales contra servicios en vivo (los escáneres comparados tampoco se ejecutaron con verificación en vivo).
- El benchmark CBX secrets test comparte generadores con los datos de entrenamiento, por lo que sus cifras (0,983/0,998) sobreestiman el rendimiento en texto real; para estimar el comportamiento en producción deben usarse las cifras de CredData e Issue reports.
- La etiqueta PASSWORD es la de menor F1 por clase (0,89) y DATABASE_CREDENTIAL (0,90), por lo que en dominios centrados en esos tipos conviene validar con datos propios.
- Sesgos: no se documentan sesgos específicos; el rendimiento depende de la distribución de los datos de entrenamiento (código, configs, logs, tickets y chats en inglés).
- Riesgo de alucinación: al ser un clasificador de spans, no genera texto, pero puede producir falsos positivos (0,9 % de líneas no secretas etiquetadas) y falsos negativos (recall 0,78–0,81 según benchmark), lo que exige calibrar umbrales según el caso de uso.
- Licencia: Apache 2.0 permite uso comercial sin restricciones destacables.
- Versión: es la release v0.1 (primera versión); se recomienda fijar la revisión (`--revision v0.1`) en producción para reproducibilidad.
- Adopción temprana: 107 descargas y 2 likes en el momento de la ficha, sin comunidad consolidada ni auditorías externas del modelo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/CobuildX-AI/cbx-secrets-detector-17M
- Variante 32M: https://huggingface.co/CobuildX-AI/cbx-secrets-detector-32M
- Modelo base (ettin-encoder-17m): https://huggingface.co/jhu-clsp/ettin-encoder-17m
- Paper de referencia de Ettin (arXiv): https://arxiv.org/abs/2410.23657
- Paper de referencia de ModernBERT (arXiv): https://arxiv.org/abs/2507.11412
- Benchmark CredData (Samsung): https://github.com/Samsung/CredData
