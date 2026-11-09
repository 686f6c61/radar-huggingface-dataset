# mmp2055/Bughunter-v10

## Resumen

Bughunter-v10 es un modelo de lenguaje especializado en seguridad ofensiva y auditoría de contratos inteligentes, publicado por el usuario mmp2055 en Hugging Face. Se trata de un fine-tune LoRA sobre `DavidAU/Qwen3.5-9B-The-Defiant-Fable-Uncensored-Heretic-NEO-IMATRIX-MAX-MTP`, un merge de la familia Qwen3.5 de 9.197 millones de parámetros con capacidades de visión y modo de razonamiento. El modelo se distribuye exclusivamente en formato GGUF, con una cascada de cuantizaciones calibrada mediante iMatrix MAX, y está pensado para ejecutarse en local con llama.cpp o LM Studio.

El problema que aborda es la asistencia a investigadores en programas de bug bounty (HackerOne, Bugcrowd, Intigriti, YesWeHack, Immunefi), cubriendo tanto seguridad web y de APIs como auditoría de smart contracts en EVM y Solana. El corpus de entrenamiento consta de 32.929 unidades de conocimiento, de las cuales unas 3.000 se dedican a vulnerabilidades de contratos inteligentes, exploits DeFi, puentes entre cadenas, MEV, préstamos flash y ataques de gobernanza DAO. Además, se inyectaron 15.000 trazas `<think>` de OpenThoughts-114k para reforzar el razonamiento dual.

Es relevante ahora porque combina tres capacidades poco frecuentes en modelos de 9B: razonamiento nativo con modo thinking conmutable, visión preservada (proyector mmproj F16 bit-idéntico al base) y una especialización vertical profunda en seguridad. El modelo responde por defecto en español, mientras que payloads, comandos y plantillas de informe se mantienen en inglés, lo que encaja con el flujo de trabajo habitual de los programas de recompensas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso de la familia Qwen3.5, con vision tower (Qwen3-VL) y cabeza de Multi-Token Prediction (MTP) |
| Parametros totales | 9.197.093.888 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | F16, Q8_0, Q6_K, Q5_K_M, Q5_K_S, Q4_K_M, Q4_K_S, Q3_K_M, Q3_K_S, Q2_K |
| Idiomas soportados | Ingles y espanol |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp); proyector de vision en mmproj-F16.gguf |

## Arquitectura y entrenamiento

El modelo parte de un merge de Qwen3.5 de 9B con torre de visión Qwen3-VL (333 tensores visuales: `patch_embed`, `vision_tower`, `merger`, `pos_embed`, `rotary_pos_emb`) y cabeza MTP (`nextn_predict_layers`) integrada en los pesos fusionados. El fine-tune se realizó con LoRA mediante Unsloth, configurado con `exclude_modules=['visual','vision_tower','patch_embed','merger','pos_embed','rotary_pos_emb']`, de modo que los 281 módulos visuales entrenables quedaron congelados y el mmproj es bit-idéntico al del modelo base. La cabeza MTP también se preservó en lugar de eliminarse durante el ajuste.

El corpus de entrenamiento consta de 32.929 unidades de conocimiento destiladas, con aproximadamente 3.000 elementos centrados en vulnerabilidades de smart contracts (EVM y Solana), clases de exploits DeFi, puentes cross-chain, MEV, préstamos flash, phishing de firmas de wallet y ataques a gobernanza DAO. Se inyectaron 15.000 trazas `<think>` de OpenThoughts-114k para reforzar el razonamiento. La calibración de las cuantizaciones usó iMatrix MAX con 1.500 fragmentos equilibrados (500 de prosa genérica ES+EN, 500 de bug bounty, 500 de blockchain). Las reglas operativas de los programas de bounty (solo alcance autorizado, tasa de 1-2 req/s, PoCs mínimos no destructivos, callbacks OOB a infraestructura propia) están embebidas en el corpus.

## Capacidades

- Generación de texto y razonamiento con modo thinking conmutable (`enable_thinking=true/false`) y etiquetas en chat `{REASON:xxx}`.
- Visión: comprensión de imágenes mediante el proyector mmproj-F16 (921 MB), requerido para tareas image-text-to-text.
- Reconocimiento ofensivo: enumeración pasiva de subdominios (crt.sh, logs CT, subfinder), mapeo de superficie de ataque, descubrimiento de endpoints de API, análisis de bundles JavaScript en busca de secretos y endpoints filtrados.
- Vulnerabilidades web: IDOR/BOLA, SSRF hacia metadatos cloud, CSRF, XSS (reflejado, almacenado, DOM, ciego, mXSS, postMessage), inyección SQL en múltiples contextos, CORS mal configurado con credenciales, open redirect encadenable a OAuth/SSO, prototype pollution, subdomain takeover, path traversal, LFI/RFI, HTTP request smuggling (CL.TE, TE.CL, H2 desync, single-packet attack), cache poisoning y client-side path traversal.
- Autenticación y autorización: OAuth 2.0/OIDC (manipulación de redirect_uri, nOAuth, bypass de state/nonce/PKCE, inyección alg/kid/JWKS, confusión RS256→HS256), JWT (firma no verificada, `alg:none`, fuerza bruta de clave débil, `jwk`/`jku`/`kid` con null-byte, path traversal en `kid`), bypass de 2FA/MFA, session fixation, mass assignment, IDOR multi-tenant.
- APIs: BOLA, BFLA, exposición excesiva de datos, versiones legacy sin autorización, GraphQL con introspección, abuso de alias, batching para saltar rate limits, gRPC-Web y protobuf.
- Auditoría de smart contracts: patrones de vulnerabilidad en Solidity/EVM y Solana, clases de exploits DeFi, puentes cross-chain, MEV, préstamos flash, phishing de firmas de wallet, ataques a gobernanza DAO.
- Generación de plantillas de informe para HackerOne, Bugcrowd, Intigriti, YesWeHack e Immunefi.
- Capacidades multilingües limitadas a inglés y español; respuestas por defecto en español con payloads y comandos en inglés.

## Casos de uso

- Asistencia en programas de bug bounty web: el modelo recibe el alcance de un programa y propone una hoja de ruta de reconocimiento con subfinder, httpx, gau y katana, respetando la tasa de 1-2 req/s embebida en el corpus.
- Revisión de autenticación OAuth/OIDC y JWT: dado un flujo de login o un token capturado, el modelo enumera vectores concretos (manipulación de redirect_uri, confusión RS256→HS256, `kid` con path traversal) y sugiere PoCs mínimos no destructivos.
- Auditoría de contratos inteligentes: con el código Solidity de un contrato o un diff de una propuesta de gobernanza DAO, el modelo identifica patrones de reentrada, manipulación de oráculos, préstamos flash y clases de exploit DeFi conocidas.
- Triaje de vulnerabilidades en APIs: a partir de una especificación OpenAPI o de tráfico GraphQL, detecta BOLA, BFLA, exposición excesiva de datos y abuso de batching para saltar rate limits.
- Redacción de informes de divulgación: genera plantillas de informe adaptadas al formato de HackerOne, Bugcrowd, Intigriti, YesWeHack o Immunefi, con secciones de impacto, reproducción y remediación en inglés.
- Análisis de imágenes en contexto de seguridad: gracias al proyector de visión, puede interpretar capturas de pantalla de paneles de administración, respuestas HTTP o diagramas de arquitectura para identificar superficies de ataque.
- Formación y laboratorios de pentesting: al ejecutarse en local con llama.cpp sobre hardware de consumo (desde 5,4 GB en Q4_K_M), sirve como asistente en entornos aislados sin enviar datos a APIs externas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia según cuantización: F16 18,4 GB; Q8_0 9,11 GB; Q6_K 7,04 GB; Q5_K_M 6,19 GB; Q5_K_S 6,03 GB; Q4_K_M 5,38 GB; Q4_K_S 5,11 GB; Q3_K_M 4,41 GB; Q3_K_S 4,06 GB; Q2_K 3,65 GB.
- Proyector de visión: mmproj-F16.gguf de 921 MB adicionales, solo necesario para comprensión de imágenes; debe colocarse en la misma carpeta que el GGUF principal con la convención `mmproj-<precision>.gguf`.
- GPU recomendadas según el autor: RTX 4090 y Apple M4 Max 32 GB para Q8_0 (ancla de calidad); RTX 3090 y M3 Pro 36 GB para Q6_K; M2 Pro 16 GB o superior para Q5_K_M (punto óptimo declarado); Mac M1/M2 de 16 GB para Q4_K_M.
- Cabe en GPU de consumo: sí, desde Q4_K_S (5,11 GB) en Mac M1 de 8 GB en configuración ajustada; Q3_K_M (4,41 GB) para Raspberry Pi 5 de 16 GB; Q2_K (3,65 GB) solo para demostración y pruebas.
- Opciones de despliegue: LM Studio (detección automática del mmproj), llama.cpp compilado con soporte para la arquitectura `qwen35` (servidor compatible con OpenAI), y cualquier runtime GGUF que soporte la familia `qwen35`.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Especializacion | Licencia | Formato |
|---|---|---|---|---|---|
| Bughunter-v10 | 9,2B | No disponible | Seguridad ofensiva web/API y smart contracts | Apache 2.0 | GGUF |
| DavidAU/Qwen3.5-9B-The-Defiant-Fable-Uncensored-Heretic-NEO-IMATRIX-MAX-MTP | 9,2B | No disponible | Base sin especializar, sin censura | No disponible | No disponible |
| Bughunter-v7 (version anterior del autor) | 27B | No disponible | Seguridad ofensiva web/API, sin razonamiento | No disponible | No disponible |

La comparativa se limita a los modelos citados en la información proporcionada; no se dispone de datos de benchmarks ni de otros modelos de seguridad comparables para establecer una tabla de rendimiento.

## Limitaciones y advertencias

- Modelo sin censura ("uncensored"): puede generar contenido ofensivo; su uso debe limitarse a programas de bug bounty con alcance autorizado y a entornos de laboratorio.
- Riesgo de alucinación en la identificación de vulnerabilidades y en la generación de payloads; las propuestas del modelo requieren validación manual antes de ejecutarse.
- Longitud de contexto no documentada en la información disponible; no se puede garantizar el manejo de repositorios o contratos extensos en una sola pasada.
- Soporte lingüístico limitado a inglés y español; el resto de idiomas no está cubierto.
- El modelo se distribuye únicamente en GGUF y con `inference: false` en la model card; requiere llama.cpp compilado con soporte `qwen35` o LM Studio, y no es directamente compatible con vLLM o TGI sin conversión.
- La comprensión de imágenes exige descargar y emparejar el mmproj-F16.gguf; sin él, el modelo funciona solo como LLM de texto.
- Las cuantizaciones agresivas (Q3 y Q2) pueden degradar la calidad; el autor solo garantiza preservación razonable gracias a la calibración iMatrix MAX.
- Aunque la licencia es Apache 2.0, el modelo base tiene un linaje de merges comunitarios cuya procedencia conviene verificar antes de un uso comercial en producción.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no existe validación comunitaria del rendimiento real.

## Enlaces

- Hugging Face: https://huggingface.co/mmp2055/Bughunter-v10
- Modelo base: https://huggingface.co/DavidAU/Qwen3.5-9B-The-Defiant-Fable-Uncensored-Heretic-NEO-IMATRIX-MAX-MTP
- LM Studio: https://lmstudio.ai/
- llama.cpp: https://github.com/ggml-org/llama.cpp
