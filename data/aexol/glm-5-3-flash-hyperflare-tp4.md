# aexol/GLM-5.3-Flash-HYPERFLARE-TP4

## Resumen

GLM-5.3-Flash-HYPERFLARE-TP4 es un paquete de ejecución preparado (runtime package) para servir el modelo GLM-5.3-Flash de NVIDIA en cuatro GPU RTX PRO 6000 Blackwell mediante paralelismo tensorial de grado 4 (TP4). No se trata de un modelo entrenado por el autor del repositorio (aexol), sino de un artefacto de despliegue empaquetado a partir del checkpoint oficial `nvidia/GLM-5.3-Flash-FP4-Local` en la revisión `76348ddb`, cuantizado en FP4 (NVFP4) y optimizado para la arquitectura GB202/SM120.

El paquete resuelve un problema de infraestructura: permitir arrancar un modelo multimodal de contexto extremadamente largo (1.048.576 tokens por petición) en hardware de gama profesional con 96 GB de VRAM por tarjeta, sin necesidad de Python en el momento del servicio. Utiliza el runtime Hyperflare de NVIDIA (escrito en Rust), que requiere una ABI de ejecución 6 y un contrato de modelo preparado 3.

La relevancia es doble: por un lado, demuestra un flujo de despliegue reproducible para modelos de gran tamaño en FP4 sobre Blackwell; por otro, expone las limitaciones de este tipo de empaquetados, ya que el autor declara explícitamente que no se han ejecutado benchmarks de rendimiento y que el paquete solo ha superado comprobaciones de humo (smoke checks).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base GLM-5.3-Flash; paquete de runtime sobre checkpoint FP4) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | 1.048.576 tokens por petición (contexto de servicio) |
| Tipos de cuantizacion | FP4 / NVFP4 |
| Idiomas soportados | no disponible |
| Licencia | NVIDIA Open Model Agreement (license: other) |
| Formato de pesos | safetensors (`model.safetensors`, revisión `gb202`) empaquetado para Hyperflare |
| Pipeline | image-text-to-text (multimodal imagen-texto) |
| Hardware objetivo | 4 × RTX PRO 6000 Blackwell (GB202, SM120, 96 GB), TP4 |
| Tamano del paquete empaquetado | 193.790.111.945 bytes (~180,5 GiB) |
| Tamano del repo | 387,5 GB |
| KV cache en carga | 174,0 GiB · 27.627.520 tokens · 1.047 slots de snapshot compartidos |
| Memoria por GPU en carga | 50,84 GiB · presupuesto de caché de 43,52 GiB |
| Concurrencia preparada | 4 peticiones |
| Chunk de prefill | 4096 |
| Grafos CUDA capturados | 71 |
| Contrato de modelo / ABI de ejecución | 3 / 6 |

## Arquitectura y entrenamiento

El paquete no documenta la arquitectura interna del modelo base más allá de su naturaleza multimodal (image-text-to-text) y de su cuantización en FP4/NVFP4. El checkpoint de origen es `nvidia/GLM-5.3-Flash-FP4-Local`, del que no se detallan en la información disponible el número de tokens de entrenamiento, la composición del dataset ni si hubo fases de RLHF o DPO.

La innovación técnica del artefacto reside en el runtime Hyperflare, que compila y captura 71 grafos CUDA para servir el modelo con paralelismo tensorial TP4 y sin dependencia de Python en tiempo de servicio. El paquete se preparó con dos parches locales privados aplicados únicamente en el entorno de preparación: un fallback de lectura posicionada (`pread`) en el lector de checkpoints b12x de FlashInfer cuando `io_uring_setup` es rechazado con EPERM, y un fallback equivalente (`read_at`/`write_at`) en la transferencia de exportación de Heliopause cuando `IoUring::new` falla. Ninguno de los parches afecta al runtime, a los programas de grafo ni al formato del paquete, y el servicio no requiere una build parcheada de Hyperflare.

## Capacidades

- Generación de texto y razonamiento: las comprobaciones de humo confirman respuestas de chat con un campo separado `reasoning_content`, lo que indica un modo de razonamiento explícito.
- Procesamiento multimodal imagen-texto: el pipeline declarado es `image-text-to-text`.
- Contexto largo extremo: ventana de servicio de 1.048.576 tokens por petición, validada mediante una prueba de aguja (needle probe) que devolvió el token esperado.
- Tool calling / function calling: una petición de prueba devolvió `tool_calls` con `finish_reason: tool_calls`.
- Servicio concurrente: se validaron 4 peticiones simultáneas (la concurrencia preparada) con resultados correctos.
- API compatible con OpenAI: expone `/v1/models` y `/v1/chat/completions` en `127.0.0.1:8000`.
- Capacidades multilingües: no disponibles en la información proporcionada.

## Casos de uso

- Análisis de documentos extensos: con 1.048.576 tokens de contexto, el modelo puede ingerir libros completos, expedientes o bases de código en una sola petición sin fragmentación, lo que simplifica pipelines de resumen y extracción sobre corpus de gran tamaño.
- Procesamiento de imágenes con texto asociado: al ser un modelo image-text-to-text, encaja en tareas de descripción de capturas, extracción de datos de documentos escaneados o respuesta a preguntas sobre figuras técnicas.
- Asistentes con razonamiento explícito: el campo `reasoning_content` permite separar la traza de razonamiento de la respuesta final, útil en aplicaciones que auditan o muestran el proceso de deducción al usuario.
- Automatización de flujos con herramientas: el soporte validado de `tool_calls` permite integrar el modelo como planificador en agentes que invocan APIs externas, con `finish_reason: tool_calls` como señal de control.
- Despliegue on-premise en clústeres pequeños: al ejecutarse en cuatro RTX PRO 6000 Blackwell con TP4, es viable en instalaciones con cuatro tarjetas profesionales de 96 GB, sin depender de GPU de centro de datos como H100.
- Servicio de baja concurrencia con sesiones largas: la concurrencia preparada de 4 y el KV cache de 27,6 millones de tokens lo hacen adecuado para escenarios de pocas sesiones simultáneas pero muy largas, como revisión de código o análisis legal.
- Evaluación de infraestructura FP4 sobre Blackwell: sirve como banco de pruebas para validar el runtime Hyperflare y la ruta NVFP4 en SM120 antes de escalar a despliegues mayores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor declara explícitamente que no se ha ejecutado ningún benchmark de prefill ni de decode, que el paquete no emite ninguna afirmación de rendimiento y que no se ha comparado con el paquete hermano TP2.

## Requisitos de hardware

- VRAM: cuatro GPU de 96 GB cada una (RTX PRO 6000 Blackwell, GB202, SM120). El paquete carga 50,84 GiB por GPU con un presupuesto de caché de 43,52 GiB por tarjeta.
- GPU recomendadas: exclusivamente RTX PRO 6000 Blackwell (GB202 / SM120). No es compatible con otras arquitecturas, ya que el replay exige la misma arquitectura sobre la que se preparó el paquete.
- Consumer GPU: no cabe en ninguna GPU de consumo; requiere cuatro tarjetas profesionales de 96 GB y exactamente cuatro rangos TP4.
- Opciones de despliegue: runtime Hyperflare de NVIDIA (`NVIDIA/hyperflare-inference`), compilado desde `main` en el commit `68bbd6dd` (2026-11-08) o posterior, con `cargo build --release --manifest-path flare/Cargo.toml`. El servicio no necesita Python. No se mencionan vLLM, llama.cpp, Ollama ni TGI como alternativas para este paquete.
- Descarga: el repositorio es privado y requiere cliente autenticado (`hf auth login` o `HF_TOKEN`). Para descarga reanudable: `hf download aexol/GLM-5.3-Flash-HYPERFLARE-TP4 model.safetensors --revision gb202 --local-dir glm53-tp4`.
- Arranque: `flare run aexol/GLM-5.3-Flash-HYPERFLARE-TP4 --gpus 0,1,2,3`. El paquete está firmado con la clave de publicador de Aexol, por lo que un arranque desatendido requiere `--dangerously-approve-key 2149bebe76a23e953b6379dbe179ac1c66ef3131e71b4001bb70637fcd86fb2e` y `--dangerously-accept-publisher aexol`.
- Latencia y throughput: no disponibles; no se han ejecutado benchmarks de prefill ni de decode.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Hardware | Licencia | Notas |
|---|---|---|---|---|---|
| GLM-5.3-Flash-HYPERFLARE-TP4 (este) | no disponible | 1.048.576 | 4 × RTX PRO 6000 Blackwell (TP4) | NVIDIA Open Model Agreement | Paquete de runtime; sin benchmarks; repo privado |
| GLM-5.3-Flash-HYPERFLARE-TP2 | no disponible | no disponible | 2 GPU (TP2) | NVIDIA Open Model Agreement | Paquete hermano público, misma línea de preparación y checkpoint; no comparado con TP4 |
| nvidia/GLM-5.3-Flash-FP4-Local | no disponible | no disponible | no disponible | NVIDIA Open Model Agreement | Checkpoint base en FP4 del que deriva este paquete |

No se dispone de datos de rendimiento que permitan una comparación cuantitativa con alternativas de la misma categoría.

## Limitaciones y advertencias

- Sin benchmarks: no hay mediciones de prefill ni de decode, por lo que no existe ninguna garantía de latencia o throughput en producción.
- Validación limitada: solo se han ejecutado comprobaciones de humo (listado de modelos, chat completion, needle probe de contexto largo, una llamada de herramienta y 4 peticiones concurrentes).
- Dependencia estricta de hardware: el replay exige arquitectura GB202 (SM120) y exactamente cuatro rangos. No funciona en otras GPU ni con otro número de tarjetas.
- Dependencia de versión: requiere Hyperflare con ABI de ejecución 6 o superior; builds anteriores rechazan el paquete antes del replay.
- Repositorio privado: la descarga exige autenticación, lo que complica la automatización y la reproducibilidad por terceros.
- Firma de publicador: el arranque desatendido obliga a aceptar una clave de publicador con flags marcados como `dangerously`, lo que implica un riesgo de cadena de suministro si no se verifica la clave.
- Línea de preparación distinta: los dos parches locales de preparación no están fusionados en upstream, por lo que este paquete debe tratarse como una línea de preparación separada del paquete TP2.
- Idiomas y sesgos: no disponibles en la información proporcionada; no se documentan sesgos conocidos ni evaluación de alucinación.
- Licencia: NVIDIA Open Model Agreement, con posibles restricciones para uso comercial que deben revisarse en el enlace de licencia antes de desplegar.
- Concurrencia baja: la concurrencia preparada es de 4 peticiones, insuficiente para cargas de servicio multiusuario convencionales.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/aexol/GLM-5.3-Flash-HYPERFLARE-TP4
- Checkpoint base: https://huggingface.co/nvidia/GLM-5.3-Flash-FP4-Local
- Paquete hermano TP2: https://huggingface.co/rickybrent/GLM-5.3-Flash-HYPERFLARE-TP2
- Runtime Hyperflare: https://github.com/NVIDIA/hyperflare-inference
- Licencia: https://huggingface.co/nvidia/GLM-5.3-Flash-FP4-Local
