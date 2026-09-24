# ramgpt/Qwen3.8-27B-Human-KO-Enterprise-v0.2-GGUF

## Resumen

`ramgpt/Qwen3.8-27B-Human-KO-Enterprise-v0.2-GGUF` es una conversión a formato GGUF de un ajuste fino denominado `ThakiCloud/Qwen3.8-27B-Human-KO-Enterprise-v0.2`, publicada por el usuario ramgpt. Se trata por tanto de un artefacto de cuantización, no de un modelo entrenado desde cero: el trabajo de este repositorio consiste en convertir los pesos safetensors del modelo fuente a GGUF para su uso con llama.cpp, con una única cuantización disponible, Q4_K_M, de 15,66 GiB. El modelo cuenta con 27.320.697.856 parámetros (unos 27,3 B) según los safetensors del checkpoint fuente.

El interés del repositorio es acotado pero concreto. La model card documenta que el checkpoint original es multimodal, pero que esta conversión es estrictamente de texto: no incluye los pesos de visión ni el artefacto mmproj. Además, se conservan los tensores MTP/NextN del modelo fuente, aunque en la ruta de servidor autorregresiva estándar de llama.cpp los tensores `blk.64`/nextn se registran como no usados, de modo que la decodificación especulativa por MTP no está operativa en la práctica con este archivo. El autor declara haber superado una puerta de validación con `llama-server` y casos de acción empresarial en JSON estricto (CALL_TOOL, ASK_CLARIFY, REFUSE) con resultado 3/3.

Ahora bien, la ficha debe leerse con cautela: no hay licencia declarada, no hay idiomas declarados, no hay longitud de contexto publicada, no hay benchmarks y el repositorio tiene cero descargas y cero likes, por lo que no existe validación independiente por parte de la comunidad. La propia nomenclatura "Qwen3.8-27B" no corresponde a ninguna denominación oficial conocida de la familia Qwen de Alibaba, lo que apunta a un renombrado o a un ajuste fino de terceros sin confirmar en la información disponible.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | No disponible. Los tensores del GGUF indican una red de 64 capas más tensores MTP/NextN (`blk.64`), pero el autor no especifica la arquitectura |
| Parámetros totales | 27.320.697.856 (≈27,3 B) |
| Parámetros activos | No aplica / no disponible (no se declara que sea MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | Q4_K_M únicamente en este repositorio (15,66 GiB) |
| Idiomas soportados | No disponible. El sufijo "Human-KO" y las pruebas de acción empresarial en coreano apuntan a coreano, pero no se declara oficialmente |
| Licencia | No disponible (no figura ni en la ficha de HuggingFace ni en la model card) |
| Formato de pesos | GGUF (llama.cpp), solo texto |
| Modelo base | ThakiCloud/Qwen3.8-27B-Human-KO-Enterprise-v0.2 |
| Revisión fuente usada | d03c8ead02103d6c1b737dfd384ecb9031ca620c |
| Tamaño del repositorio | 16,8 GB |
| Modalidad | Texto únicamente; la visión del modelo fuente no se ha convertido |
| SHA256 del archivo | a34a57444c548172b72f46d7a9320b6230627812df74a6e2efede71286e3420d |

## Arquitectura y entrenamiento

La información proporcionada no describe la arquitectura del modelo fuente más allá de lo que se deduce de la estructura del GGUF. El autor menciona 64 capas principales y tensores MTP (multi-token prediction, también denominados NextN) que se conservan en la conversión, lo cual es coherente con una familia de modelos transformer con cabezas de predicción multi-token; no obstante, se trata de una inferencia a partir de los nombres de los tensores, no de un dato declarado. No hay información sobre número de tokens de entrenamiento, composición del dataset, uso de RLHF, DPO u otras etapas de alineamiento.

La innovación relevante de esta conversión es de tipo práctico: se ha realizado una preflight check para detectar desajustes entre los tensores MTP/NextN y la ruta de inferencia, y se declara que no se detectó ninguno. Aun así, en la ruta autorregresiva estándar de `llama-server` los tensores `blk.64`/nextn se registran como no usados, por lo que las pruebas de humo validan la ruta de generación principal de 64 capas y no una ruta especulativa MTP. Es decir, el modelo funciona como un transformer autorregresivo convencional en llama.cpp, sin aprovechar la decodificación especulativa que potencialmente permitirían esos tensores.

## Capacidades

- Generación de texto conversacional con plantilla de chat propia del modelo fuente (`/v1/chat/completions` con separación de mensajes de sistema y usuario verificada).
- Modo de razonamiento configurable: la model card menciona un modo `auto` de razonamiento y comprueba que no se filtran etiquetas de *thinking* cuando el razonamiento está desactivado, lo que implica soporte de un modo de pensamiento explícito.
- Salida de JSON estricto orientada a acciones empresariales: los casos de validación cubren las decisiones CALL_TOOL, ASK_CLARIFY y REFUSE con un único objeto JSON exacto como salida.
- Tool calling / function calling: se deduce de la existencia del caso CALL_TOOL y del formato de acción JSON, aunque no se documenta el esquema completo de herramientas.
- Operación como servidor compatible con la API de OpenAI a través de llama.cpp (`endpoints_compatible`), lo que facilita su integración en aplicaciones existentes.
- Capacidades multilingües: no disponibles. No se declara lista de idiomas; el nombre y las pruebas sugieren coreano como idioma principal de trabajo.
- Visión: no soportada en este archivo. La conversión es solo texto y el autor advierte explícitamente de que no debe tratarse como si preservara la capacidad multimodal del modelo fuente.

## Casos de uso

- Agentes empresariales en coreano con function calling: el modelo está validado para emitir objetos JSON de acción (CALL_TOOL, ASK_CLARIFY, REFUSE), por lo que encaja en orquestadores de agentes que necesitan decidir entre invocar una herramienta, pedir aclaración o rechazar una petición. Es el caso de uso mejor respaldado por la documentación disponible.
- Automatización de flujos internos (RPA) con salida estructurada: al generar JSON de un solo objeto con formato estricto, puede actuar como capa de decisión entre un formulario o correo entrante y un sistema de gestión, siempre que se valide el esquema en el lado de la aplicación.
- Asistente conversacional on-premise: al distribuirse como GGUF y ejecutarse con llama.cpp, permite desplegar el modelo en infraestructura propia sin enviar datos a terceros, un requisito habitual en entornos corporativos con datos sensibles.
- Servicio interno compatible con la API de OpenAI: el tag `endpoints_compatible` y el uso de `llama-server` permiten sustituir un endpoint OpenAI por una instancia local, reutilizando el código cliente existente con cambios mínimos.
- Clasificación y enrutado de intenciones en atención al cliente: la distinción entre pedir aclaración y rechazar es directamente aplicable a la primera línea de un sistema de soporte que decide si la consulta es resoluble automáticamente o debe escalarse a un humano.
- Investigación sobre modos de razonamiento y plantillas de chat: el repositorio documenta pruebas de separación de roles, ausencia de continuación pseudo-rol (`/user`, `/assistant`) y ausencia de fugas de tokens de control, lo que lo hace útil para estudiar el comportamiento de plantillas de chat en conversiones GGUF.
- Extracción y estructuración de información en texto: como modelo de 27 B con generación de texto general, puede emplearse para resumir o reescribir documentos, aunque no hay evaluación publicada que respalde su calidad en esta tarea frente a alternativas de su tamaño.
- Generación de código: no hay ninguna evidencia en la información disponible de que el modelo haya sido entrenado o evaluado para código, por lo que este uso queda como hipótesis no verificada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card solo documenta pruebas de humo (smoke gates) orientadas a verificar que la conversión es funcional, no comparativas de calidad. Se reproducen a continuación tal como se describen, sin interpretarlas como benchmarks:

| Prueba declarada | Resultado |
|---|---|
| Carga correcta del modelo en llama-server | Superada |
| Separación de plantilla de chat sistema/usuario | Superada |
| Cumplimiento de salida exacta en prompts estrictos | Superada |
| Finalización con `finish_reason=stop` sin agotar el límite de tokens | Superada |
| Ausencia de continuación pseudo-rol (`/user`, `/assistant`) | Superada |
| Aritmética básica | Superada |
| Ausencia de fuga de tokens de control de chat | Superada |
| Ausencia de fuga de etiquetas de razonamiento con el razonamiento desactivado | Superada |
| Casos JSON de acción empresarial en coreano (CALL_TOOL, ASK_CLARIFY, REFUSE) | 3/3 superados |
| Desajuste de tensores MTP/NextN detectado en preflight | Ninguno |

No hay datos de MMLU, HumanEval, GSM8K ni de ningún otro conjunto de evaluación estándar.

## Requisitos de hardware

- VRAM estimada para el archivo publicado: los pesos en Q4_K_M ocupan 15,66 GiB, por lo que se necesitan aproximadamente 16-17 GB solo para los pesos, más la caché KV (no cuantificada en la información disponible; su tamaño depende de la longitud de contexto real, que no se declara).
- GPU recomendadas: para ejecución íntegra en GPU, tarjetas con 24 GB o más, como RTX 3090, RTX 4090, RTX 5090, A100 40/80 GB, L40S o H100. En GPUs de 16 GB (RTX 4080, 5080 o similares) el modelo no cabe completo y requeriría descarga parcial de capas a CPU.
- Viabilidad en GPU de consumo: sí, en tarjetas de 24 GB o más, siempre que la ventana de contexto utilizada mantenga la caché KV en un tamaño moderado. La ausencia de datos de contexto publicados obliga a medir el consumo real por caso de uso.
- Memoria unificada: los equipos Apple Silicon con 32 GB o más de memoria unificada son una opción práctica mediante llama.cpp con Metal.
- Opciones de despliegue: llama.cpp (`llama-server`, `llama-cli`) es la vía natural; también Ollama y LM Studio importando el archivo. Para vLLM o TGI conviene partir del checkpoint fuente en safetensors, ya que el soporte de GGUF en esos servidores es limitado o experimental.
- Latencia y throughput: no disponibles. No se publican mediciones de tokens por segundo ni de latencia por petición para ninguna configuración de hardware.
- Nota sobre decodificación especulativa: aunque los tensores MTP/NextN se conservan, la ruta estándar de llama.cpp los ignora, de modo que no cabe esperar aceleración por MTP sin un runtime que los soporte explícitamente.

## Comparativa con modelos similares

No hay datos de rendimiento del modelo evaluado que permitan una comparación cuantitativa. La tabla siguiente compara únicamente parámetros, contexto y licencia con alternativas del mismo orden de tamaño; los datos de los modelos alternativos provienen de su documentación pública y no se han verificado en la búsqueda realizada, por lo que deben confirmarse antes de tomar decisiones.

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| ramgpt/Qwen3.8-27B-Human-KO-Enterprise-v0.2-GGUF | 27,3 B | No disponible | No disponible | GGUF Q4_K_M (15,66 GiB), solo texto |
| Qwen2.5-32B-Instruct (Alibaba) | 32,5 B | 128 000 tokens (según documentación pública) | Apache 2.0 | Safetensors y múltiples cuantizaciones GGUF de la comunidad |
| Gemma 2 27B (Google) | 27 B | 8 192 tokens (según documentación pública) | Gemma Terms of Use | Safetensors y GGUF de la comunidad |
| Mistral Small 3 24B (Mistral AI) | 24 B | 32 000 tokens (según documentación pública) | Apache 2.0 | Safetensors y GGUF de la comunidad |

La ventaja diferencial del modelo analizado sería su especialización declarada en acciones empresariales en coreano, mientras que sus desventajas frente a las alternativas son la licencia no declarada, la ausencia de benchmarks, la falta de cuantizaciones alternativas y un soporte de idiomas no documentado.

## Limitaciones y advertencias

- Licencia no declarada: no se especifica licencia ni en HuggingFace ni en la model card. Sin una licencia explícita, no hay autorización clara para uso comercial ni para redistribución; conviene contactar con los autores antes de cualquier despliegue en producción.
- Capacidad multimodal perdida: el modelo fuente es multimodal, pero esta conversión es solo texto y no incluye pesos de visión ni mmproj. No debe esperarse procesamiento de imágenes.
- MTP/NextN no aprovechado: los tensores multi-token prediction se conservan pero no se usan en la ruta estándar de llama.cpp, por lo que no hay ganancia de velocidad y puede haber divergencias si otro runtime intenta explotarlos.
- Validación muy limitada: las únicas pruebas documentadas son de humo y un conjunto de tres casos JSON. No hay MMLU, HumanEval, GSM8K ni evaluaciones de seguridad, sesgo o robustez.
- Riesgo de alucinación: no evaluado en la información disponible. Como en cualquier modelo generativo de 27 B sin datos de alineamiento publicados, la salida debe validarse, especialmente cuando se usa para emitir JSON que dispara acciones.
- Sesgos: no disponibles. No se documenta composición del dataset de entrenamiento ni análisis de sesgo por idioma, género o dominio.
- Longitud de contexto desconocida: no se publica la ventana de contexto, de modo que el comportamiento en conversaciones largas o con documentos extensos es indeterminado y debe medirse.
- Idiomas no declarados: fuera del coreano, el rendimiento en otras lenguas, incluido el castellano, no está documentado.
- Procedencia poco verificable: la denominación "Qwen3.8-27B" no se corresponde con ninguna nomenclatura oficial conocida de la familia Qwen, y el repositorio tiene cero descargas y cero likes, sin validación independiente. La confianza en el artefacto depende por completo de la model card del autor.
- Advertencia de integridad: se proporciona un SHA256 del archivo, por lo que es recomendable verificarlo tras la descarga.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/ramgpt/Qwen3.8-27B-Human-KO-Enterprise-v0.2-GGUF
- Modelo base: https://huggingface.co/ThakiCloud/Qwen3.8-27B-Human-KO-Enterprise-v0.2
- llama.cpp (runtime de inferencia para GGUF): https://github.com/ggml-org/llama.cpp
- Nota sobre la búsqueda web: los resultados devueltos corresponden a secciones deportivas y de noticias de la BBC (bbc.com/sport, bbc.com/news) y no guardan relación con el modelo. No se han encontrado papers, blogs, repositorios ni demos adicionales sobre este modelo en la información proporcionada.
