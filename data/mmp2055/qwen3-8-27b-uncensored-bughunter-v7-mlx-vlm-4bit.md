# mmp2055/Qwen3.8-27B-Uncensored-bughunter-v7-MLX-VLM-4bit

## Resumen

Este modelo es una adaptación a formato MLX 4-bit del fine-tune `Qwen3.8-27B-Uncensored-bughunter-v7`, orientado a tareas de ciberseguridad ofensiva y defensiva. Desarrollado por el usuario mmp2055, conserva la torre de visión del modelo base (orcarouter/Qwen3.8-27B-Uncensored) y el adaptador LoRA entrenado sobre un dataset especializado en bug bounty, pentesting, análisis forense y respuesta a incidentes. Su principal valor reside en combinar un modelo de lenguaje sin censura (abliterado) con capacidades multimodales, permitiendo analizar capturas de pantalla de herramientas como Burp Suite, paneles de administración o diagramas de arquitectura durante un engagement.

La versión MLX está optimizada para Apple Silicon mediante Metal, y se distribuye en cuantización 4-bit (aproximadamente 16 GB en tres shards). El modelo base declara una ventana de contexto de 262K tokens, aunque en esta implementación MLX se recomienda 32K o 64K según la memoria unificada disponible. Los parámetros totales según los safetensors son 4.665.462.000, una cifra que contrasta con el nombre comercial de 27B; posiblemente se trate de un error de etiquetado o de una versión reducida, pero se reporta el dato real del repositorio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (basado en familia Qwen, versión "3.8" según el nombre; no se dispone de detalle oficial) |
| Parametros totales | 4.665.462.000 (según safetensors; el nombre comercial indica 27B) |
| Parametros activos | no disponible (no se especifica si es MoE) |
| Longitud de contexto | 262K tokens (modelo base); en MLX se recomienda 32K-64K según memoria |
| Tipos de cuantizacion | 4-bit MLX (esta versión); también existe versión GGUF con cuantizaciones estándar (Q4_K_M, Q5_K_M, etc.) |
| Idiomas soportados | Español, inglés |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (MLX), también GGUF para llama.cpp |

## Arquitectura y entrenamiento

El modelo parte de `orcarouter/Qwen3.8-27B-Uncensored`, un modelo base abliterado a nivel de tensor (eliminación de la dirección de rechazo) que conserva la torre de visión y el cabezal MTP (multi-token prediction). Sobre esta base se aplicó un fine-tune con LoRA/QLoRA (usando Unsloth) sobre un dataset propio de ciberseguridad, que cubre desde reconocimiento pasivo hasta escritura de informes de vulnerabilidades. La torre de visión no fue fine-tuneada; se mantiene tal cual del modelo base, por lo que el entendimiento de imágenes es generalista, no específico de seguridad.

Los datos de entrenamiento no están publicados en detalle, pero la model card indica que el dataset incluye ejemplos de red team (IDOR, SSRF, SQLi, OAuth, JWT, etc.) y blue team (DFIR, análisis de tráfico, memoria forense, threat hunting). No se menciona el número de tokens ni el método de alineación (RLHF/DPO) posterior al fine-tune; el modelo se presenta como "uncensored", lo que sugiere la ausencia de un paso de refuerzo para evitar rechazos.

## Capacidades

- Generación de texto y razonamiento en español e inglés, con soporte para tool calling y thinking mode (heredado del modelo base).
- Red team / offensive security:
  - Reconocimiento pasivo: enumeración de subdominios, mapeo de superficie de ataque, extracción de secretos en JavaScript.
  - Vulnerabilidades web: IDOR/BOLA, SSRF, CSRF, XSS (reflected, stored, DOM, blind, mXSS), SQLi en múltiples contextos, CORS mal configurado, open redirect encadenable, prototype pollution, subdomain takeover, path traversal, LFI/RFI, HTTP request smuggling (CL.TE, TE.CL, H2 desync, single-packet attack), cache poisoning.
  - Autenticación y autorización: OAuth/OIDC (redirect_uri, nOAuth, state/nonce/PKCE, alg/kid/JWKS), JWT (firma no verificada, alg:none, clave débil, inyección jwk/jku/kid, confusión de algoritmos RS256→HS256), bypass de 2FA/MFA, fijación de sesión, mass assignment.
  - APIs: BOLA, BFLA, exposición excesiva de datos, versiones legacy sin authz, GraphQL con introspection, alias abuse, batching para saltar rate limits.
  - Server-side: SSRF a metadatos cloud (AWS IMDSv1/v2, GCP, Azure), SSTI (Jinja, Twig, Freemarker, Velocity), RCE por deserialización, XXE en SAML/SOAP/SVG/OOXML.
  - Lógica de negocio: race conditions (TOCTOU), manipulación de precios/cantidades/saldos, TOCTOU en flujos de pago, abuso de cupones.
  - Móvil: WebView bridges expuestos, deeplinks con parsing débil, análisis estático Android (SAST).
  - Reporting: informes en formatos de HackerOne (CVSS), Bugcrowd (VRT), Intigriti, cálculo de severidad y razonamiento de impacto.
- Blue team / defensive security:
  - DFIR: metodología de respuesta a incidentes, reconstrucción de línea temporal, recolección de artefactos, cadena de custodia.
  - Análisis de tráfico de red: análisis de PCAP, detección de C2, DNS tunneling, exfiltración.
  - Forense de memoria: análisis con Volatility, malware residente, inyección de código, process hollowing.
  - Threat hunting: hipótesis basadas en TTPs, correlación de eventos, movimiento lateral.
  - Gestión de vulnerabilidades: priorización por CVSS + contexto, integración con CI/CD.
  - SOAR / automatización defensiva: playbooks de respuesta, integración con SIEM.
- Visión (multimodal): análisis de capturas de pantalla de WAF, paneles de Burp Suite, diagramas de arquitectura, paneles de administración expuestos, OCR de snippets de código en Slack/email/PDF. La torre de visión no fue fine-tuneada, por lo que el entendimiento visual es generalista.
- Reglas operacionales integradas (cuando se usa con system prompt): verificación de alcance, límite de throughput (1-2 req/s), PoC no destructivos, callbacks OOB solo a infraestructura propia, no usar credenciales encontradas, severidad mínima reportable High/Critical.

## Casos de uso

- Auditoría de seguridad ofensiva en programas de bug bounty: el modelo guía paso a paso en el descubrimiento y explotación de vulnerabilidades web, APIs y lógica de negocio, con énfasis en PoC no destructivos y reportes en formato HackerOne o Bugcrowd.
- Análisis de capturas de pantalla de herramientas de pentesting: gracias a la visión, puede interpretar paneles de Burp Suite (Repeater, Intruder, Proxy), respuestas HTTP con códigos de error, o páginas de WAF, ayudando a inferir la tecnología subyacente y posibles vectores de ataque.
- Respuesta a incidentes y análisis forense: para equipos blue team, el modelo asiste en la reconstrucción de líneas temporales, análisis de artefactos y redacción de informes de incidentes con cadena de custodia.
- Análisis de tráfico de red: puede ayudar a identificar patrones de C2, DNS tunneling o exfiltración en capturas PCAP, sugiriendo correlaciones y próximos pasos.
- Automatización de informes de vulnerabilidades: genera reportes estructurados según el formato de cada plataforma, calculando severidad CVSS y razonando el impacto empresarial.
- Formación y capacitación en ciberseguridad: sirve como asistente de estudio para practicar técnicas de red team y blue team, con ejemplos realistas y sin censura, útil para preparar certificaciones como OSCP o CEH.
- Integración en pipelines de CI/CD para revisión de seguridad de código: puede analizar snippets de código (vía OCR o texto) y sugerir vulnerabilidades como SQLi o XSS, aunque su especialidad es el análisis manual más que el SAST automatizado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de precisión (MMLU, HumanEval, GSM8K, etc.) en la información disponible. La model card solo incluye mediciones de rendimiento en Apple Silicon:

| Configuracion | Pico de memoria | Texto (tok/s) | Con imagen |
|---|---|---|---|
| Q4 (esta build), contexto 32K, Apple M5 32 GB | ~16 GB | 6-9 | +2-5 s por imagen (codificación inicial) |

En equipos con 48 GB o más de memoria unificada, se pueden usar contextos de 64K+ con el mismo perfil de velocidad.

## Requisitos de hardware

- Exclusivo para Apple Silicon (M1/M2/M3/M4/M5) con macOS; no compatible con Linux, Windows o Intel Macs.
- Memoria unificada mínima recomendada: 32 GB para contexto 32K; 48 GB o más para contextos largos (64K+).
- VRAM estimada: ~16 GB en cuantización 4-bit con contexto 32K.
- GPU: integrada en Apple Silicon (GPU Metal); no requiere GPU discreta.
- Runtime recomendado: `mlx-vlm` (CLI y API Python) para uso multimodal; LM Studio con extensión MLX para texto; cualquier herramienta basada en `mlx-vlm`.
- Rendimiento: 6-9 tokens/s en texto, con latencia adicional de 2-5 segundos por imagen (en M5).
- Alternativa para otros sistemas: usar la versión GGUF del mismo fine-tune con llama.cpp u Ollama.

## Comparativa con modelos similares

No se dispone de modelos comparables directamente en la misma categoría (fine-tune de ciberseguridad sobre Qwen con visión y sin censura). Como referencia, se puede comparar con el modelo base y con alternativas generalistas:

| Modelo | Parámetros | Contexto | Visión | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| mmp2055/Qwen3.8-27B-Uncensored-bughunter-v7-MLX-VLM-4bit | 4.7B (según safetensors) | 262K (base) | Sí | Apache 2.0 | MLX, GGUF |
| orcarouter/Qwen3.8-27B-Uncensored (base) | 27B (según nombre) | 262K | Sí | Apache 2.0 | Ollama, GGUF |
| Modelos generalistas tipo Llama 3.1 8B | 8B | 128K | No | Llama 3.1 | Varios formatos |

La comparativa es limitada porque no hay datos de benchmarks para ninguno de ellos en tareas de seguridad. El modelo destaca por su enfoque especializado y su licencia permisiva.

## Limitaciones y advertencias

- El modelo es "uncensored" por diseño, lo que implica que puede generar contenido peligroso o ilegal si se usa de forma malintencionada. Su uso debe limitarse a entornos autorizados (programas de bug bounty, laboratorios, investigación).
- Alucinaciones: como todo LLM, puede inventar vulnerabilidades o pasos de explotación que no son reales. Las respuestas deben verificarse siempre contra la documentación oficial y pruebas reales.
- La torre de visión no fue fine-tuneada, por lo que el análisis de imágenes es generalista y puede fallar en capturas muy específicas o de baja calidad.
- El número de parámetros real (4.7B) contradice el nombre "27B", lo que sugiere un posible error de etiquetado o una versión reducida; esto puede afectar a las expectativas de calidad del modelo.
- El rendimiento en Apple Silicon es modesto (6-9 tok/s), lo que limita su uso en tiempo real o en entornos de alta concurrencia.
- La licencia Apache 2.0 permite uso comercial, pero el carácter "uncensored" puede generar responsabilidades legales si se utiliza para actividades no autorizadas.
- No se han publicado resultados de benchmarks estándar, por lo que no es posible evaluar su calidad objetiva frente a otros modelos.

## Enlaces

- Repositorio HuggingFace (versión MLX 4-bit): https://huggingface.co/mmp2055/Qwen3.8-27B-Uncensored-bughunter-v7-MLX-VLM-4bit
- Versión GGUF del mismo fine-tune: https://huggingface.co/mmp2055/Qwen3.8-27B-Uncensored-bughunter-v7
- Modelo base orcarouter/Qwen3.8-27B-Uncensored (Ollama): https://ollama.com/orcarouter/Qwen3.8-27B-Uncensored
- Blog de orcarouter con guía de ejecución local: https://www.orcarouter.ai/blog/how-to-run-qwen-3-8-27b-uncensored-locally
- Comparativa en HackerNoon: https://hackernoon.com/qwen38-27b-uncensored-vs-other-qwen-gguf-models
- Repositorio de ejemplo de uso local (Wassimyounes01): https://github.com/Wassimyounes01/qwen38-uncensored
