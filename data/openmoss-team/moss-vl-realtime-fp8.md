# OpenMOSS-Team/MOSS-VL-Realtime-FP8

## Resumen

MOSS-VL-Realtime-FP8 es la versión cuantizada en FP8 del modelo de visión-lenguaje MOSS-VL-Realtime, desarrollado por OpenMOSS (equipo MOSS AI). El modelo base está diseñado para comprensión de imagen, vídeo largo e interacción en tiempo real sobre flujos de vídeo, con una interfaz de streaming que procesa fotogramas con marcas de tiempo. Esta variante FP8 mantiene esa interfaz de streaming fotograma a fotograma y reduce el coste de memoria y cómputo respecto al checkpoint BF16 original.

El checkpoint tiene 11.336.371.208 parámetros (aproximadamente 11,3 mil millones) y se distribuye en formato safetensors con código personalizado (`trust_remote_code`), pensado para su uso con Transformers. La cuantización combina pesos FP8 E4M3 en las capas lineales de autoatención y MLP del decodificador de lenguaje, dejando en BF16 el codificador visual, las capas de atención cruzada, los embeddings, las normalizaciones y la cabeza de salida, además de una caché KV cuantizada a INT8 mediante HQQ.

Su relevancia actual radica en que permite desplegar un modelo de vídeo-lenguaje en streaming con requisitos de memoria contenidos: la prueba validada de 30 fotogramas alcanzó un pico de unos 25.522 MiB de VRAM de proceso, lo que lo sitúa al alcance de GPUs de 32 GB o de configuraciones multi-GPU con reparto automático. La licencia Apache 2.0 facilita su adopción tanto en investigación como en productos comerciales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer visión-lenguaje con decodificador de lenguaje de 36 capas (atención/MLP) más 12 capas de atención cruzada; codificador visual y merger propios de la familia MOSS-VL |
| Parametros totales | 11.336.371.208 (11,3 mil millones) |
| Parametros activos | no disponible (no es un modelo MoE según la información disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | FP8 E4M3 (pesos con escalas estáticas por canal y activaciones FP8 dinámicas por token) en 252 capas lineales; BF16 en 12 capas de atención cruzada, codificador visual, merger, embeddings, normas y `lm_head`; caché KV en HQQ INT8 con tamaño de grupo 64 y longitud residual BF16 de 128 |
| Idiomas soportados | inglés (en) y chino (zh) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (compressed-tensors), con código personalizado para Transformers |

## Arquitectura y entrenamiento

La información disponible describe la arquitectura a nivel de cuantización, no de preentrenamiento. El modelo sigue un esquema de visión-lenguaje con un codificador visual y un merger que proyectan las representaciones visuales al espacio del decodificador de lenguaje. El decodificador consta de 36 capas de lenguaje con autoatención y MLP, más 12 capas de atención cruzada que permanecen en BF16 en esta versión cuantizada. La atención se ejecuta con FlashAttention 2 como backend validado.

El detalle técnico más relevante de este checkpoint es el perfil de cuantización: 252 capas lineales de autoatención y MLP se almacenan en FP8 E4M3 con escalas estáticas por canal y activaciones de entrada FP8 dinámicas por token, mientras que los componentes sensibles (codificador visual, merger, atención cruzada, embeddings, normas y `lm_head`) se mantienen en BF16. La caché KV se cuantiza a INT8 con HQQ (tamaño de grupo 64, residuo BF16 de 128), y `generation_config.json` activa automáticamente HQQ KV8. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron etapas de RLHF o DPO.

## Capacidades

- Comprensión de imágenes: el modelo forma parte de una familia visión-lenguaje que cubre entendimiento de imagen además de vídeo.
- Comprensión de vídeo largo: soporta análisis de secuencias de vídeo con marcas de tiempo asociadas a cada fotograma.
- Interacción en tiempo real y streaming: interfaz `create_realtime_session` que permite empujar fotogramas con timestamps no decrecientes y recibir fragmentos de texto a medida que llegan.
- Generación de descripciones incrementales: puede emitir actualizaciones relevantes mientras procesa el vídeo y permanecer en silencio cuando no hay cambios significativos.
- Tokens de control de protocolo: emite tokens como `<|silence|>`, `<|round_start|>` y `<|round_end|>` que la aplicación debe filtrar o interpretar.
- Capacidades multilingües limitadas a inglés y chino.
- Extracción de características: la etiqueta `feature-extraction` figura entre las capacidades declaradas del repositorio.
- Tool calling / function calling: no disponible en la información proporcionada.
- Modo de razonamiento explícito (thinking): no disponible en la información proporcionada.
- Capacidades de audio: no disponible en la información proporcionada.

## Casos de uso

- Monitorización de vídeo en directo con descripción de cambios: el modelo procesa fotogramas a 1 FPS con timestamps y genera texto solo cuando detecta actualizaciones relevantes, lo que encaja en vigilancia de cámaras, control de tráfico o supervisión de instalaciones.
- Asistencia remota guiada por vídeo: un operador o usuario final retransmite fotogramas y el modelo describe en tiempo real lo que ocurre, útil en soporte técnico de campo o telemedicina asistida.
- Accesibilidad audiovisual: generación de descripciones incrementales para personas con discapacidad visual sobre emisiones o grabaciones en directo, aprovechando la emisión por turnos y el control de silencio.
- Análisis de vídeo largo con marcas de tiempo: revisión de grabaciones extensas (aerial, inspección de infraestructuras, documentales) donde el modelo localiza y describe eventos conforme avanza la secuencia.
- Indexación y resumen de archivos multimedia: extracción de descripciones por fotograma o por intervalo para construir metadatos buscables en bibliotecas de vídeo.
- Moderación de contenido en streaming: análisis de flujos de vídeo en busca de eventos o escenas que requieran revisión, con salida textual acotada por turno (`max_tokens_per_turn`) para mantener la latencia baja.
- Prototipado de agentes multimodales en investigación: la licencia Apache 2.0 y el soporte en Transformers permiten integrar el modelo en pipelines experimentales de percepción visual en tiempo real sin coste de licencia.

## Benchmarks y rendimiento

La model card proporciona comparativas entre el modelo BF16 original y los perfiles cuantizados publicados. Para este checkpoint FP8 en streaming:

| Benchmark | MOSS-VL-Realtime-FP8 | MOSS-VL-Realtime (BF16) |
|---|---|---|
| OVOBench Avg | 70,66 | 70,86 |
| StreamingBench Avg | 62,93 | 62,42 |
| OmniMMI PA | 65,50 | 66,00 |

No se han publicado en la información disponible resultados de benchmarks generales como MMLU, HumanEval o GSM8K para este modelo.

## Requisitos de hardware

- VRAM estimada para inferencia: la prueba validada de streaming con 30 fotogramas alcanzó un pico de 25.522 MiB de VRAM de proceso y 26.249 MiB de memoria total de GPU, incluyendo una línea base de 727 MiB. Se recomienda una GPU NVIDIA con más de 26 GiB disponibles.
- Reparto multi-GPU: es posible usar `device_map="auto"` para repartir el modelo entre varias GPUs.
- GPU recomendadas: cualquier GPU NVIDIA con más de 26 GiB de memoria, como A100 (40/80 GB), H100, L40S (48 GB) o RTX A6000 (48 GB). No se indica compatibilidad con GPUs de consumo de 24 GB en la información disponible.
- Cabe en consumer GPU: no confirmado; el pico medido supera los 24 GB típicos de una RTX 4090, por lo que no se garantiza su ejecución en GPUs de consumo de 24 GB.
- Opciones de despliegue: Transformers con `trust_remote_code=True`, `compressed-tensors==0.14.0.1`, `hqq==0.2.8.post1` y FlashAttention 2. El repositorio indica explícitamente que este checkpoint no es una release de SGLang. No se mencionan otras opciones como vLLM, llama.cpp, Ollama o TGI.
- Entorno validado: Python 3.12.8, PyTorch 2.8.0 con CUDA 12.8, Transformers 4.57.1, Accelerate 1.12.0, FlashAttention 2.8.1. Se requiere FFmpeg en el `PATH` para la decodificación de vídeo.
- Latencia y throughput: no se proporcionan cifras de latencia ni de tokens por segundo en la información disponible. La API de streaming permite acotar la salida por turno con `max_tokens_per_turn` y el total con `max_new_tokens`.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de especificaciones de modelos comparables en la información proporcionada que permitan una comparación rigurosa. Como referencia interna de la propia familia, la comparación relevante es con el checkpoint BF16 del que deriva:

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| MOSS-VL-Realtime-FP8 | 11,3 mil millones | no disponible | Apache 2.0 | safetensors (FP8 + KV INT8) | Pico de ~26 GiB en streaming de 30 fotogramas |
| MOSS-VL-Realtime (BF16) | no disponible | no disponible | Apache 2.0 | safetensors (BF16) | Referencia de calidad; mayor huella de memoria |

Comparativa con alternativas de otros proveedores: no disponible.

## Limitaciones y advertencias

- Idiomas: solo se declaran inglés y chino; el rendimiento en castellano u otros idiomas no está validado.
- Una sesión en tiempo real por instancia: la documentación indica que una instancia del modelo soporta una única sesión de streaming activa, lo que limita el despliegue concurrente sin replicar el modelo.
- Tokens de control: la salida puede incluir `<|silence|>`, `<|round_start|>` y `<|round_end|>`; es responsabilidad de la aplicación filtrarlos o interpretarlos, y no hacerlo degrada la experiencia de usuario.
- Configuración de cuantización frágil: no debe pasarse una segunda configuración de cuantización ni sustituirse `generation_config.json` por el del modelo BF16, ya que se desactiva HQQ KV8 y se rompe el perfil validado.
- Dependencia de FlashAttention 2 y de versiones concretas de `compressed-tensors` y `hqq`: cambios de versión pueden alterar el comportamiento o impedir la carga.
- Riesgo de alucinación: como todo modelo de lenguaje, puede generar descripciones plausibles pero incorrectas de escenas o eventos; en aplicaciones críticas conviene validación humana o comprobaciones adicionales.
- Sesgos: no se documentan sesgos específicos en la información disponible; al entrenarse con datos de los que no se detalla composición, no puede descartarse la presencia de sesgos culturales o de dominio.
- Contexto: la longitud máxima de contexto no se especifica, lo que dificulta planificar cargas de vídeo largas sin pruebas empíricas.
- Licencia: Apache 2.0 permite uso comercial, pero el uso de `trust_remote_code=True` implica ejecutar código del repositorio, con el riesgo de seguridad asociado que debe evaluarse en producción.
- Madurez: el repositorio tiene un volumen de descargas bajo (176) y pocas interacciones (25 likes), lo que sugiere una adopción todavía limitada y menos validación comunitaria.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/OpenMOSS-Team/MOSS-VL-Realtime-FP8
- Modelo base: https://huggingface.co/OpenMOSS-Team/MOSS-VL-Realtime
- Informe técnico: https://arxiv.org/pdf/2608.15045
- Referencia adicional citada en el repositorio: https://arxiv.org/abs/2606.07639
- Web de MOSS AI: https://www.moss-ai.com/models/moss-vl-realtime
- Documentación de la API de MOSS: https://platform.moss.cn/en/docs/scenarios/vl-realtime
- Repositorio de código: https://github.com/OpenMOSS/MOSS-VL
