# Izumx/IzumxAI-9B-v6

## Resumen

IzumxAI-9B-v6 es un modelo de lenguaje de 9.65 mil millones de parámetros especializado en ciberseguridad, desarrollado por el usuario Izumx como un ajuste fino QLoRA de Qwen3.5-9B. El modelo ha sido sometido a un proceso de "abliteration" (eliminación de la dirección de rechazo en el espacio de activaciones) para que responda a preguntas de seguridad sin negativas, manteniendo supuestamente las capacidades de matemáticas, lógica y programación de su modelo base. Está orientado a triaje de vulnerabilidades, revisión de código seguro, análisis de logs y artefactos, mapeo a MITRE ATT&CK y razonamiento sobre inteligencia de amenazas.

La novedad principal de la versión v6 frente a sus predecesoras es que incorpora entrenamiento para el uso de herramientas en un bucle agéntico: el modelo elige primitivas de explotación, modifica su construcción tras un intento fallido y llama a una herramienta de búsqueda cuando se bloquea. Se distribuye exclusivamente en formato GGUF (Q4_K_M y Q5_K_M), lo que lo hace ejecutable en GPUs de consumo con 6-8 GB de VRAM, y conserva la licencia Apache-2.0 del modelo base.

El modelo está publicado en Hugging Face sin descargas ni interacciones registradas en el momento de la consulta, y su model card incluye benchmarks propios de 88 tareas verificadas programáticamente, así como un arnés agéntico de cuatro tareas de inyección y traversal ejecutadas contra servicios reales en WSL. La información disponible proviene íntegramente de la model card del autor; no se han localizado publicaciones externas, papers ni evaluaciones independientes.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Qwen3.5-9B); no se detalla la arquitectura interna exacta |
| Parámetros totales | 9.65B (clase 9B) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | 8192 tokens en la configuración de Ollama/llama.cpp (`num_ctx 8192`); el entrenamiento usó 2048 tokens; no se especifica el contexto nativo máximo del modelo base |
| Tipos de cuantización | GGUF Q4_K_M (~5.2 GB) y Q5_K_M (~6.0 GB) |
| Idiomas soportados | Inglés (en) y ruso (ru) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (llama.cpp); no se publican safetensors del modelo fusionado |

## Arquitectura y entrenamiento

El modelo parte de Qwen3.5-9B en bf16, cargado en 4 bits NF4 para el entrenamiento mediante QLoRA con r=32, alpha=64, dropout 0.05 y contexto de 2048 tokens. El conjunto de datos consta de 3635 ejemplos entrenados durante 2 épocas (904 pasos): 1038 tareas sintéticas verificadas de razonamiento y programación, 2123 registros de SFT de ciberseguridad destilados del dataset `Vyber07/cyber-security` (filtrados por bloques de código malformados, rechazos, saltos de línea escapados, respuestas no inglesas y de baja entropía) y 158 ejemplos de uso agéntico de herramientas repetidos 3 veces (474 en total), donde cada acción dorada fue ejecutada contra un servicio real antes de incorporarse y se descartaron las filas cuya acción no resolvía la tarea. La optimización empleó lr 2e-4, acumulación de gradiente 8, schedule coseno y AdamW paginado de 8 bits. La pérdida de validación descendió de 0.8662 a 0.3205 en 904 pasos.

Tras el entrenamiento, el adaptador LoRA se fusionó en los pesos base y se aplicó abliteration a escala 1.4 en CPU, eliminando la dirección de rechazo. La cuantización a GGUF Q4_K_M y Q5_K_M se realizó con llama.cpp. El modelo emplea la plantilla ChatML de Qwen y puede emitir un bloque `<think>` antes de la respuesta final, que debe eliminarse si solo se desea la salida definitiva.

## Capacidades

- Generación de texto y razonamiento general, con rendimiento en matemáticas, lógica y código equiparable al modelo base según la suite propia del autor.
- Ciberseguridad aplicada: triaje de vulnerabilidades, revisión de código seguro, análisis de logs y artefactos, mapeo a MITRE ATT&CK y razonamiento sobre inteligencia de amenazas.
- Uso de herramientas (tool calling) en un bucle agéntico: selección de primitivas de explotación, modificación de la construcción tras fallo y llamada a herramienta de búsqueda cuando el modelo se bloquea.
- Razonamiento multi-paso dentro de un arnés de herramientas tipadas (enviar payload, inspeccionar sanitizadores, enumerar separadores candidatos, ejecutar PoC).
- Modo de pensamiento: puede emitir un bloque `<think>` antes de la respuesta.
- Capacidades multilingües limitadas a inglés y ruso.
- Respuestas sin rechazos en dominios de seguridad: 0/41 en la suite de probes de rechazo del autor.

## Casos de uso

- Triaje de vulnerabilidades en un SOC: el modelo puede clasificar y priorizar hallazgos de escáneres, mapearlos a MITRE ATT&CK y redactar resúmenes técnicos sin rechazar la explicación de vectores de ataque, gracias a la eliminación de la dirección de rechazo.
- Revisión de código seguro en pipelines de CI/CD: integrado mediante llama.cpp u Ollama, puede analizar diffs y señalar patrones de inyección, traversal o uso inseguro de `eval()`, apoyándose en su entrenamiento específico de revisión de código.
- Análisis de logs y artefactos forenses: con 8192 tokens de contexto configurados, puede procesar ventanas de logs y correlacionar eventos, aunque para volúmenes mayores requiere troceado o recuperación externa.
- Soporte a pentesters y jugadores de CTF: explica técnicas como Kerberoasting o la reproducción de CVE sin negativas, lo que lo hace utilizable en entornos de formación y pruebas autorizadas.
- Automatización de pruebas de inyección en entornos de laboratorio: dentro de un arnés de herramientas tipadas, el modelo elige payloads, inspecciona la respuesta del sanitizador y ajusta la construcción, comportamiento verificado en las cuatro tareas del benchmark agéntico del autor.
- Asistente de inteligencia de amenazas con recuperación aumentada: dado que el conocimiento se corta con Qwen3.5, se puede emparejar con un sistema RAG sobre feeds de CVE y advisories recientes para compensar la falta de datos actuales en los pesos.
- Generación de documentación técnica de seguridad: redacción de informes de hallazgos, vectores CVSS y recomendaciones de mitigación, con la advertencia de que el modelo puede equivocarse con plena confianza en detalles de explotación y vectores CVSS.

## Benchmarks y rendimiento

Suite propia del autor: 88 tareas verificadas programáticamente (24 matemáticas, 12 lógica, 16 código, 12 seguimiento de instrucciones, 24 ciberseguridad), mismos prompts para todos los modelos, temperatura 0.2, un solo intento.

| Suite | Qwen3.5-9B base | v4 | v6 |
|---|---|---|---|
| Matemáticas | 24/24 | 24/24 | 24/24 |
| Lógica | 11/12 | 11/12 | 12/12 |
| Código | 15/16 | 15/16 | 16/16 |
| Instrucciones | 10/12 | 10/12 | 10/12 |
| Ciberseguridad | 18/24 | 20/24 | 19/24 |
| Total | 78/88 | 80/88 (91%) | 81/88 (92%) |
| Rechazos | no disponible | 0/41 | 0/41 (0%) |

El código se verificó ejecutando el Python producido contra tests unitarios ocultos, no por coincidencia de cadenas. El propio autor advierte que una suite de 88 tareas es una prueba de humo y que una diferencia de una tarea es ruido.

Benchmark agéntico (arnés `izumxai/agentic`, servicio vulnerable en WSL, herramientas tipadas, oráculo con token secreto en stdout del servicio, tres pasadas, modelo puro sin escalado del arnés):

| Modelo | Resueltas | Inyección de comandos | Inyección en `eval()` | Path traversal |
|---|---|---|---|---|
| v4 | 5/12 | 0/6 | 2/3 | 3/3 |
| v6 | 12/12 | 6/6 | 3/3 | 3/3 |

Los servicios de entrenamiento usaron puertos, endpoints y nombres de parámetros distintos, por lo que el autor sostiene que no se trata de memorización del texto del benchmark. CyberSecEval 4 se ejecutó para v4 pero no se repitió para v6. Los benchmarks AutoPatch, Autonomous Offensive Cyber Ops y Visual Prompt Injection no se ejecutaron.

## Requisitos de hardware

- VRAM estimada para inferencia: 6-8 GB con Q4_K_M (~5.2 GB) y 8 GB con Q5_K_M (~6.0 GB), según el autor.
- GPU recomendadas: no se especifican modelos concretos; por tamaño, cabe en GPUs de consumo con 8 GB o más (por ejemplo, RTX 3060 Ti, 4060 Ti, 3070, 4070) y en GPUs de datacenter como A100 o H100 sin problema de capacidad.
- Cabe en GPU de consumo: sí, en tarjetas con al menos 8 GB de VRAM para Q5_K_M y 6 GB para Q4_K_M.
- Opciones de despliegue: Ollama (`ollama run hf.co/Izumx/IzumxAI-9B-v6:Q4_K_M` o mediante `Modelfile` con `num_ctx 8192`, `temperature 0.7`, `repeat_penalty 1.05`) y llama.cpp (`llama-cli` con plantilla ChatML, `-c 8192`, `--temp 0.7`). No se mencionan vLLM ni TGI, y al publicarse solo en GGUF no hay pesos safetensors para esos motores.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| IzumxAI-9B-v6 | 9.65B | 8192 configurado (2048 en entrenamiento) | Apache-2.0 | GGUF | Ajuste QLoRA abliterado de Qwen3.5-9B, especializado en ciberseguridad y uso agéntico de herramientas |
| Qwen3.5-9B (base) | 9B | no disponible | Apache-2.0 | safetensors (presumiblemente) | Modelo base; 78/88 en la suite del autor, con rechazos en dominios de seguridad |
| IzumxAI-9B v4 | 9B | no disponible | Apache-2.0 | GGUF | Versión previa; 80/88 en la suite propia y 5/12 en el benchmark agéntico |

No se dispone de información sobre otros modelos comparables de ciberseguridad abliterados en la documentación proporcionada.

## Limitaciones y advertencias

- El conocimiento se corta con Qwen3.5: las CVE y advisories recientes no están en los pesos; es necesario emparejarlo con recuperación para datos actuales.
- El benchmark agéntico son cuatro servicios de juguete; es evidencia de comportamiento en un bucle de herramientas, no una medida de capacidad ofensiva real, y el arnés no es un sandbox.
- CyberSecEval 4 no se repitió para v6; no deben asumirse los números de v4.
- La abliteration elimina rechazos, no capacidad: el modelo puede equivocarse con plena confianza, incluso en detalles de explotación y vectores CVSS.
- AutoPatch, Autonomous Offensive Cyber Ops y Visual Prompt Injection no se ejecutaron (requieren Podman con almacenamiento multi-TB, un cyber range de AWS y un modelo de visión, respectivamente).
- Idiomas limitados a inglés y ruso; no hay soporte declarado de castellano.
- Licencia Apache-2.0 permite uso comercial, pero el contenido generado en dominios de seguridad debe revisarse por implicaciones legales y éticas.
- Solo se distribuye en GGUF; no hay pesos safetensors del modelo fusionado para despliegue en vLLM o TGI.
- El modelo no tiene descargas ni validación externa registrada en Hugging Face en el momento de la consulta.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Izumx/IzumxAI-9B-v6
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- Dataset de ciberseguridad utilizado: https://huggingface.co/datasets/Vyber07/cyber-security
- Repositorio del arnés agéntico: `izumxai/agentic` (referenciado en la model card; no se proporciona URL directa)
