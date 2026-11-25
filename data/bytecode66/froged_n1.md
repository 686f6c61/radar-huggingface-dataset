# bytecode66/Froged_N1

## Resumen

Froged_N1 es un ajuste fino (fine-tuning) del modelo base Qwen2.5-0.5B-Instruct, publicado por el usuario bytecode66 en Hugging Face. El modelo está orientado a tareas de ingeniería de software y operaciones: desarrollo de API (REST, FastAPI, Flask, Express, GraphQL, gRPC), programación en Python, JavaScript, TypeScript, SQL, administración de servidores Linux, contenedores y orquestación (Docker, Kubernetes), CI/CD, monitorización, bases de datos y seguridad defensiva. Incluye también contenido de seguridad ofensiva limitado explícitamente a entornos de laboratorio o pentests con autorización por escrito.

El modelo se distribuye principalmente en formato GGUF (aproximadamente 491 MB según la model card), lo que lo hace apto para inferencia en CPU o en GPU de gama baja mediante llama.cpp u Ollama. El repositorio tiene un tamaño total de 28,3 GB, lo que sugiere que incluye artefactos adicionales más allá de los pesos del modelo, presumiblemente el índice de recuperación (RAG) en SQLite FTS5 de unos 474 MB con 109.817 fragmentos de documentación oficial, y posiblemente corpus o scripts auxiliares.

La relevancia del modelo es limitada pero concreta: se trata de un modelo muy pequeño (630 millones de parámetros) especializado en dominios técnicos de DevOps y seguridad, con licencia no declarada y un volumen de descargas muy bajo (30 descargas, 0 likes en el momento de la consulta), lo que indica que no ha sido validado por la comunidad. Su utilidad principal es como base para experimentación con QLoRA y para despliegues ligeros con recuperación aumentada (RAG) sobre documentación técnica.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (derivado de Qwen2.5-0.5B-Instruct) |
| Parametros totales | 630.167.424 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (el modelo base Qwen2.5-0.5B-Instruct soporta 32.768 tokens, pero no se confirma para este ajuste) |
| Tipos de cuantizacion | GGUF; la model card menciona Q4_K_M y F16 en el pipeline de conversión |
| Idiomas soportados | No disponible (la model card está redactada en indonesio; no se declaran idiomas del modelo) |
| Licencia | No disponible |
| Formato de pesos | GGUF (modelo de inferencia de ~491 MB); el repositorio incluye además el índice RAG SQLite FTS5 |
| Tamano del repositorio | 28,3 GB |
| Dataset de entrenamiento | 1.000 ejemplos únicos (900 train / 100 validación), según la model card |
| Metodo de ajuste | QLoRA sobre Qwen/Qwen2.5-0.5B-Instruct, 3 épocas configuradas |

## Arquitectura y entrenamiento

El modelo parte de Qwen2.5-0.5B-Instruct, un transformer decoder-only de 0,5 mil millones de parámetros con atención causal estándar. Sobre esa base se aplica un ajuste QLoRA (cuantización de 4 bits del modelo base más adaptadores de bajo rango entrenables) según el script `train_qlora.py` descrito en la model card. La configuración indicada es de 3 épocas sobre 900 ejemplos de entrenamiento y 100 de validación, con evaluación sobre el conjunto de validación.

El dataset cubre un espectro amplio de temas técnicos: APIs REST con FastAPI, Flask, Express, GraphQL y gRPC; autenticación OAuth; webhooks; paginación; colas; testing; lenguajes Python, JavaScript, TypeScript, HTML, CSS y SQL; depuración; Git; Docker; Linux, SSH, systemd y Nginx; DNS y TLS; bases de datos; CI/CD; cloud; Kubernetes; monitorización; copias de seguridad; modelado de amenazas; pentesting autorizado; detección; informes y retest. La seguridad ofensiva se restringe explícitamente a objetivos de laboratorio o con autorización escrita, y el dataset excluye robo de credenciales, malware, persistencia, bypass de acceso y extracción de datos.

Un punto crítico: la propia model card reconoce que el entrenamiento final no se ejecutó en el entorno del autor por falta de GPU NVIDIA, y que el pipeline está preparado pero no validado de extremo a extremo. Esto implica que el modelo publicado podría no reflejar un ajuste efectivo, o reflejar solo una parte del proceso. Adicionalmente, el repositorio incluye un índice RAG independiente (SQLite FTS5, ~474 MB, 109.817 fragmentos de documentación de FastAPI, Docker, Kubernetes, OWASP WSTG, OWASP Cheat Sheets, MDN, Node.js, Nginx y Terraform) que se consulta en tiempo de inferencia mediante un recuperador; el modelo y el índice son componentes separados.

## Capacidades

- Generación de texto conversacional en el dominio técnico de desarrollo de software y operaciones.
- Asistencia en programación: Python, JavaScript, TypeScript, HTML, CSS y SQL, con ejemplos de depuración y testing.
- Desarrollo y documentación de APIs: REST, FastAPI, Flask, Express, GraphQL y gRPC; autenticación OAuth; webhooks; paginación; colas.
- Operaciones de sistemas: Linux, SSH, systemd, Nginx, DNS, TLS, Docker, Kubernetes, CI/CD, monitorización y copias de seguridad.
- Seguridad defensiva: modelado de amenazas, detección, informes y retest.
- Seguridad ofensiva acotada a laboratorio o pentest con autorización escrita (sin persistencia, malware, robo de credenciales ni bypass de acceso).
- Integración con recuperación aumentada (RAG) mediante el índice SQLite FTS5 incluido, consultable con `query.py`.
- Soporte de tool calling / function calling: no disponible (no se declara en la información proporcionada).
- Soporte de agentes y razonamiento multi-paso: no disponible (no se declara).
- Capacidades multilingües: no disponible (no se declaran idiomas).
- Modo thinking, visión o audio: no disponible (no se declaran).

## Casos de uso

- Asistente de documentación técnica con RAG: el modelo puede combinarse con el índice FTS5 incluido para responder consultas sobre FastAPI, Docker, Kubernetes, Nginx o Terraform, recuperando fragmentos relevantes y generando respuestas contextualizadas. Es adecuado porque el índice ya está empaquetado y el modelo es lo bastante pequeño para ejecutarse junto al recuperador en el mismo host.
- Soporte a desarrolladores en tareas de API: generación de esqueletos de endpoints REST con FastAPI o Express, ejemplos de autenticación OAuth y esquemas de paginación, aprovechando el corpus de entrenamiento centrado en estos temas.
- Automatización de tareas de administración Linux: generación de comandos de systemd, configuración de Nginx o scripts de copia de seguridad, con la ventaja de que el modelo cabe en CPU y puede desplegarse en el propio servidor administrado.
- Asistencia en pipelines CI/CD: redacción de ficheros de configuración y scripts de despliegue para Docker y Kubernetes, como borrador sujeto a revisión humana antes de aplicarse en producción.
- Formación y concienciación en seguridad: generación de escenarios de modelado de amenazas y explicaciones de detección sobre entornos de laboratorio, dado el sesgo explícito del dataset hacia seguridad defensiva y pentesting autorizado.
- Base para experimentación con QLoRA: al ser un ajuste de 0,5B con scripts de entrenamiento, validación, merge y conversión a GGUF incluidos, sirve como plantilla reproducible para que otros equipos adapten el pipeline a sus propios dominios.
- Despliegue en entornos con recursos limitados: al distribuirse en GGUF de ~491 MB, puede ejecutarse en máquinas sin GPU mediante llama.cpp u Ollama, útil para prototipos o herramientas internas de baja concurrencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; por el tamaño del modelo (630M parámetros) y el GGUF de ~491 MB, una cuantización Q4_K_M requiere del orden de 0,5-1 GB de memoria, y F16 alrededor de 1,3 GB (estimación basada en el tamaño de parámetros, no confirmada por el autor).
- GPU recomendadas: no disponible en la información proporcionada. Por tamaño, cualquier GPU consumer con al menos 2-4 GB de VRAM libre debería poder alojarlo en cuantización Q4_K_M; no se confirma compatibilidad con modelos concretos.
- Cabe en GPU consumer: previsiblemente sí en la mayoría de GPU modernas con 4 GB o más de VRAM, aunque no está verificado por el autor.
- Opciones de despliegue: llama.cpp y Ollama son las vías naturales dado el formato GGUF; la model card menciona `llama.cpp/convert_hf_to_gguf.py` y `llama-quantize`. No se mencionan vLLM ni TGI.
- Latencia y throughput: no disponibles.
- Requisitos de entrenamiento: la model card indica GPU NVIDIA con CUDA; para QLoRA sobre 0,5B con batches pequeños se recomienda ajustar `per_device_train_batch_size` y `max_seq_length` en función de la VRAM disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Froged_N1 (bytecode66) | 630M | No disponible | No disponible | GGUF | Ajuste QLoRA de Qwen2.5-0.5B-Instruct especializado en DevOps y seguridad; sin benchmarks publicados |
| Qwen2.5-0.5B-Instruct (Alibaba) | 0,5B | 32.768 tokens | Apache 2.0 (según la ficha pública de Qwen) | Safetensors, GGUF | Modelo base generalista; licencia permisiva y ampliamente validado por la comunidad |
| Qwen2.5-Coder-0.5B-Instruct (Alibaba) | 0,5B | 32.768 tokens | Apache 2.0 (según la ficha pública de Qwen) | Safetensors, GGUF | Variante orientada a código del mismo tamaño; alternativa directa para tareas de programación |
| SmolLM2-360M-Instruct (Hugging Face) | 360M | 8.192 tokens | Apache 2.0 | Safetensors, GGUF | Modelo pequeño generalista; menor tamaño y contexto más corto |

La comparación se basa en datos públicos de los modelos alternativos; los datos de Froged_N1 sobre contexto y licencia no están disponibles, lo que impide una comparación completa en esos ejes.

## Limitaciones y advertencias

- El autor reconoce que el entrenamiento final no se ejecutó en su entorno por falta de GPU NVIDIA; el modelo publicado podría no incorporar el ajuste completo o no haber sido validado de extremo a extremo.
- No se declara licencia, lo que impide determinar si el uso comercial está permitido; debe contactarse con el autor o asumirse riesgo legal.
- No se declaran idiomas soportados; la model card está en indonesio, pero el dataset mezcla contenido técnico en varios idiomas sin especificar proporciones.
- No hay benchmarks publicados ni validación independiente; el volumen de descargas (30) y likes (0) indica ausencia de adopción comunitaria.
- Riesgo de alucinación elevado en un modelo de 0,5B ajustado con solo 1.000 ejemplos; las respuestas técnicas deben revisarse antes de usarse en producción.
- El contenido de seguridad ofensiva está acotado por el autor a laboratorio o autorización escrita, pero un modelo pequeño puede generar instrucciones imprecisas o fuera de alcance; no debe confiarse en él para decisiones de seguridad.
- El repositorio de 28,3 GB incluye artefactos (RAG, corpus, scripts) que no forman parte del modelo; conviene revisar qué se descarga antes de consumir espacio.
- El índice RAG y el modelo son componentes separados; el modelo por sí solo no incorpora el conocimiento de la base documental.
- No se declara soporte de tool calling ni de razonamiento multi-paso, lo que limita su uso en pipelines de agentes.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/bytecode66/Froged_N1
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-0.5B-Instruct
- Repositorio llama.cpp (conversión y cuantización): https://github.com/ggerganov/llama.cpp
- Documentación de FastAPI: https://fastapi.tiangolo.com/
- Documentación de Docker: https://docs.docker.com/
- Documentación de Kubernetes: https://kubernetes.io/docs/
- OWASP Web Security Testing Guide: https://owasp.org/www-project-web-security-testing-guide/
- OWASP Cheat Sheet Series: https://cheatsheetseries.owasp.org/
- MDN Web Docs: https://developer.mozilla.org/
- Documentación de Node.js: https://nodejs.org/docs/
- Documentación de Nginx: https://nginx.org/en/docs/
- Documentación de Terraform: https://developer.hashicorp.com/terraform/docs
