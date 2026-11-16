# LTM-Lab/Qwen3.8-Flash-Next-FP4-Local-Abliterated-v15

## Resumen
Qwen3.8-Flash-Next-FP4-Local-Abliterated-v15 es una conversión del checkpoint DevelopingDad/Qwen3.8-Flash-Next-FP4-Local-Abliterated, publicada por LTM-Lab, que añade una arquitectura de memoria episódica persistente sobre unos pesos que permanecen idénticos byte a byte al original. El modelo conserva el formato FP4-Local del checkpoint base (precisión mixta ModelOpt con expertos NVFP4 y escalas comprimidas) y no incorpora ningún parámetro nuevo: lo que cambia es el nombre de arquitectura (`Qwen4ExpV15ForConditionalGeneration`), un `auto_map`, dos ficheros de código que implementan la memoria y un parche de imagen para vLLM. Con 187.931.804.131 parámetros totales y un repositorio de 102,3 GB, se sirve con un contenedor vLLM modificado que mantiene una ventana de contexto de 262.144 tokens, 16 secuencias concurrentes, caché KV en FP8 y decodificación especulativa MTP con 3 tokens de borrador.

La propuesta diferencial es la memoria entre peticiones: las claves y valores de 12 capas de atención indexada (QSA) se segmentan en eventos de hasta 128 tokens y se escriben en disco junto a un engram de bajo rango del estado que dejan en las 36 capas Gated DeltaNet. En una conversación posterior, el sistema relee el prompt, recupera los eventos cuyas claves atraerían su atención mediante un voto único para todas las capas y cabezas, compone sus engrams en el estado recurrente y vuelve a leer el prompt fusionando las claves y valores recuperados en la atención. Nada se inyecta como texto en el prompt, lo que evita el coste clásico de RAG en tokens.

La versión 15 elimina el "world model" de la v14 e introduce un ciclo de "sueño" que se activa tras 10 minutos de inactividad: el servidor reproduce los eventos no procesados, fusiona duplicados, retira notas superadas por otras posteriores, genera preguntas que cada evento responde y crea puentes entre eventos que nombran la misma entidad. Este proceso solo reorganiza el almacén, sin entrenar ni añadir contenido nuevo. El resultado es un modelo orientado a despliegues locales en hardware Blackwell (RTX PRO 6000, DGX Spark) con memoria conversacional duradera, licencia NVIDIA Open Model Agreement y capacidades multimodales imagen-texto.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer híbrido con 12 capas de atención indexada (QSA) y 36 capas Gated DeltaNet; arquitectura de memoria `Qwen4ExpV15ForConditionalGeneration` |
| Parámetros totales | 187.931.804.131 |
| Parámetros activos | no disponible (no se especifica si es MoE; la referencia a "expertos NVFP4" sugiere componentes MoE, pero no se confirma) |
| Longitud de contexto | 262.144 tokens (según el perfil `qwen38-flash-next` de NVIDIA) |
| Tipos de cuantización | FP4-Local (precisión mixta ModelOpt con expertos NVFP4 y escalas comprimidas); etiquetado como 8-bit en Hugging Face; caché KV en FP8 |
| Idiomas soportados | no disponible |
| Licencia | NVIDIA Open Model Agreement (`license: other`) |
| Formato de pesos | safetensors (con `custom_code` y `auto_map` para la arquitectura de memoria) |

## Arquitectura y entrenamiento
El modelo es un transformer híbrido que combina 12 capas de atención indexada (QSA) con 36 capas Gated DeltaNet, una arquitectura de estado recurrente que complementa la atención tradicional. Sobre esta base, la conversión de LTM-Lab añade una capa de memoria episódica implementada en `configuration_qwen4_exp_v15.py` y `modeling_qwen4_exp_v15.py`: durante la lectura del prompt, las claves y valores de las capas QSA se fragmentan en eventos de hasta 128 tokens y se persisten en disco con un engram de bajo rango del estado que dejan en las capas DeltaNet. En peticiones posteriores, un mecanismo de recuperación por voto único selecciona los eventos relevantes, compone sus engrams en el estado recurrente y fusiona las claves y valores recuperados mediante log-sum-exp en los kernels b12x QSA parcheados.

No se ha entrenado ni reentrenado nada en esta conversión: los pesos son los del checkpoint base, en su formato FP4-Local, y la memoria no añade parámetros. El checkpoint base, a su vez, deriva de un modelo Qwen3.8-Flash-Next sometido a un proceso de "abliteration" (eliminación de rechazos) mediante la herramienta Heretic, usando los datasets `mlabonne/harmful_behaviors` y `mlabonne/harmless_alpaca`. La innovación técnica principal es el ciclo de sueño: tras 10 minutos sin peticiones (`VLLM_V15_SLEEP_AFTER`), un hilo del proceso del motor reproduce los eventos pendientes a través de la propia API del servidor con la memoria en solo lectura, fusiona duplicados, retira notas superadas (dos confirmaciones afirmativas del modelo bastan), formula preguntas que cada evento responde y crea puentes entre eventos que nombran la misma persona, cosa o lugar. Todo ello sin entrenamiento, sin contenido nuevo y sin borrar eventos. Los grafos CUDA, la caché de prefijos, la decodificación especulativa MTP y el planificador asíncrono permanecen activos.

## Capacidades
- Generación de texto conversacional multi-turno con memoria episódica persistente entre peticiones y reinicios del servidor (el almacén reside en disco).
- Procesamiento de imagen y texto (`pipeline_tag: image-text-to-text`), con soporte de entrada multimodal.
- Razonamiento con modo "thinking" activado por defecto; se puede desactivar con `chat_template_kwargs.enable_thinking: false`.
- Tool calling y function calling mediante el parser `qwen3_xml` incluido en el perfil de servicio.
- Decodificación especulativa MTP con 3 tokens de borrador para reducir la latencia.
- Recuperación de información entre conversaciones separadas: lo dicho en un chat se responde en otro posterior sin inyectar texto en el prompt.
- Consolidación automática de memoria durante la inactividad (replay, fusión de duplicados, resolución de supersesiones, creación de puentes entre eventos).
- Capacidades multilingües: no disponibles en la información proporcionada.

## Casos de uso
- Asistentes personales con memoria a largo plazo: el modelo recuerda preferencias, datos y decisiones mencionados en conversaciones anteriores y los aplica en sesiones nuevas, sin necesidad de reinyectar un historial extenso en cada prompt.
- Atención al cliente multi-sesión: un agente puede retomar el contexto de un cliente que vuelve días después, recuperando incidencias previas y evitando que el usuario repita información, gracias al almacén persistente en disco y a la ventana de 262.144 tokens.
- Sistemas de soporte técnico con base de conocimiento viva: el ciclo de sueño consolida eventos repetidos y retira información superada, lo que mantiene la memoria coherente cuando las políticas o configuraciones cambian con el tiempo.
- Automatización de flujos agénticos con tool calling: integrado en pipelines que requieren llamadas a funciones y razonamiento multi-paso, con el parser `qwen3_xml` y el modo thinking para descomponer tareas complejas.
- Análisis de documentos e imágenes en local: al ser un modelo image-text-to-text desplegable en una sola GPU Blackwell de 96 GB, sirve para extraer información de capturas, diagramas o documentos escaneados dentro de infraestructura propia.
- Despliegue en estaciones de trabajo DGX Spark o RTX PRO 6000: el perfil de NVIDIA y la imagen vLLM parcheada permiten servir el modelo en hardware de escritorio profesional con memoria episódica activada, sin depender de la nube.
- Investigación sobre memoria en LLM: la implementación de engrams, recuperación por voto único y consolidación por sueño constituye una plataforma reproducible para experimentar con arquitecturas de memoria externa sin reentrenar el modelo.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware
- VRAM estimada: el checkpoint FP4-Local ocupa 102,3 GB en disco; el servicio de referencia se ejecuta en una única GPU de 96 GB con utilización de memoria GPU de 0,96 y caché KV en FP8.
- GPU recomendadas: RTX PRO 6000 Blackwell (96 GB), perfil validado por NVIDIA para `qwen38-flash-next`; DGX Spark aparece entre las etiquetas del modelo.
- GPU de consumo: no se documenta soporte en GPUs consumer (RTX 4090 de 24 GB, etc.); el tamaño del checkpoint y los kernels b12x FP4-Local apuntan a hardware Blackwell profesional.
- Opciones de despliegue: exclusivamente vLLM mediante la imagen `lovewin10/vllm-v15:release-10152026-v15`, construida sobre `ghcr.io/local-inference-lab/vllm:release-10152026` (aproximadamente 44 GB de descarga base). No se mencionan llama.cpp, Ollama ni TGI.
- Configuración de servicio: 262.144 tokens de contexto, 16 secuencias, MTP con 3 tokens de borrador, GPU memory utilization 0,96, `--ipc host`, `--shm-size 32g`, `--ulimit memlock=-1`.
- Latencia y throughput: no disponibles; la decodificación especulativa MTP y los grafos CUDA de decodificación están activos, pero no se publican cifras.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Memoria persistente | Licencia | Formato |
|---|---|---|---|---|---|
| Qwen3.8-Flash-Next-FP4-Local-Abliterated-v15 (este) | 187,9 B | 262.144 | Sí, episódica en disco con ciclo de sueño | NVIDIA Open Model Agreement | safetensors FP4-Local, vLLM parcheado |
| DevelopingDad/Qwen3.8-Flash-Next-FP4-Local-Abliterated (base) | 187,9 B | no disponible en la información | No | NVIDIA Open Model Agreement | safetensors FP4-Local |
| vLLM oficial (`ghcr.io/local-inference-lab/vllm:release-10152026`) | N/A (runtime) | Configurable | No | según la imagen | N/A |

La comparación con alternativas de otros fabricantes no está disponible en la información proporcionada.

## Limitaciones y advertencias
- El proceso de abliteration elimina los rechazos del modelo base, lo que incrementa el riesgo de generar contenido dañino, sesgado o inapropiado sin las salvaguardas originales de Qwen.
- La memoria episódica persiste información de conversaciones en disco: implica riesgos de privacidad, retención de datos personales y necesidad de políticas de borrado y cumplimiento (RGPD) antes de un uso en producción.
- El ciclo de sueño consume recursos del servidor durante la inactividad y llama a la propia API del modelo; en despliegues con tráfico constante puede no ejecutarse nunca, dejando la memoria sin consolidar.
- La imagen vLLM utilizada no es oficial de vLLM ni de local-inference-lab; su mantenimiento, seguridad y actualizaciones dependen de LTM-Lab.
- El modelo requiere hardware Blackwell con soporte de kernels b12x FP4-Local; no hay evidencia de funcionamiento en GPUs consumer ni en otras pilas de inferencia.
- No se especifican los idiomas soportados ni evaluaciones de calidad multilingüe.
- No hay benchmarks publicados que permitan verificar la degradación o mejora de calidad respecto al checkpoint base tras la abliteration.
- La licencia NVIDIA Open Model Agreement impone condiciones específicas para uso comercial; debe revisarse el fichero LICENSE antes de desplegar.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, por lo que no existe validación comunitaria del funcionamiento del parche de memoria.

## Enlaces
- [Hugging Face: LTM-Lab/Qwen3.8-Flash-Next-FP4-Local-Abliterated-v15](https://huggingface.co/LTM-Lab/Qwen3.8-Flash-Next-FP4-Local-Abliterated-v15)
- [Modelo base: DevelopingDad/Qwen3.8-Flash-Next-FP4-Local-Abliterated](https://huggingface.co/DevelopingDad/Qwen3.8-Flash-Next-FP4-Local-Abliterated)
- [Imagen vLLM base: ghcr.io/local-inference-lab/vllm:release-10152026](https://ghcr.io/local-inference-lab/vllm)
- [Imagen parcheada: lovewin10/vllm-v15:release-10152026-v15](https://hub.docker.com/r/lovewin10/vllm-v15)
- [Dataset mlabonne/harmful_behaviors](https://huggingface.co/datasets/mlabonne/harmful_behaviors)
- [Dataset mlabonne/harmless_alpaca](https://huggingface.co/datasets/mlabonne/harmless_alpaca)
- [Paper de referencia: arXiv:2406.11717](https://arxiv.org/abs/2406.11717)
