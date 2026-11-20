# arvedo/Nemotron-3.5-Bolt-E4B-NVFP4-VisionAudio-GGUF

## Resumen

Nemotron-3.5-Bolt-E4B-NVFP4-VisionAudio-GGUF es una exportación comunitaria en formato GGUF de los pesos NVFP4 del modelo NVIDIA-Nemotron-3.5-Bolt-E4B-BF16, publicada por el usuario arvedo. El modelo base es un transformer multimodal de NVIDIA (familia Nemotron, variante Bolt E4B) que procesa texto, imagen y audio, con aproximadamente 7.518 millones de parámetros totales y una ventana de contexto calibrada de 128k tokens. Esta edición concreta empaqueta el modelo de lenguaje en NVFP4 (tipo `GGML_TYPE_NVFP4` / E2M1) con una tabla de embeddings por capa (PLE) en Q8_0, más proyectores multimodales separados y modelos borrador DFlash para decodificación especulativa.

La relevancia de esta ficha radica en que permite ejecutar un modelo multimodal de NVIDIA en `llama.cpp` sobre hardware de escritorio o incluso CPU, sin necesidad de Linux ni de vLLM, y sin requerir las Tensor Cores FP4 nativas de Blackwell. El autor advierte explícitamente de que `llama.cpp` emula NVFP4 por software mediante tablas de búsqueda, por lo que este GGUF no ofrece mejoras de velocidad frente a un Q4_K_M estándar; para máximo rendimiento en GPU Blackwell o Rubin hay que usar las ediciones vLLM del mismo autor.

El repositorio ocupa 23 GB e incluye cinco artefactos: el modelo de lenguaje principal (6,11 GB), dos proyectores multimodales (532 MB en Q8_0 y 946 MB en BF16) y dos modelos borrador DFlash (381 MB en Q8_0 y 703 MB en BF16). La licencia es OpenMDW-1.1 y los idiomas declarados son inglés, alemán, francés, español, italiano y japonés.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (texto + visión + audio); detalles internos de capas y atención no disponibles |
| Parametros totales | 7.518.069.878 (dato real de safetensors) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 128k tokens (calibración NVFP4 a 128k; ventana máxima nativa no disponible) |
| Tipos de cuantizacion | NVFP4 (E2M1) para el modelo de lenguaje; Q8_0 para tabla PLE y proyector recomendado; BF16 para proyector de referencia y borrador; Q8_0 para borrador DFlash |
| Idiomas soportados | en, de, fr, es, it, ja |
| Licencia | OpenMDW-1.1 (`license: other` en Hugging Face) |
| Formato de pesos | GGUF (modelo principal NVFP4, proyectores Q8_0/BF16, borradores DFlash Q8_0/BF16) |

## Arquitectura y entrenamiento

El modelo base es un transformer multimodal de NVIDIA de la familia Nemotron 3.5, variante Bolt E4B, con 7.518 millones de parámetros. Procesa entradas de imagen y audio mediante proyectores multimodales dedicados: los tokens visuales y de audio se codifican exclusivamente durante el prefill del prompt, mientras que la decodificación autorregresiva es puramente textual sobre un vocabulario de 262k tokens. Esta separación es la que permite que la decodificación especulativa DFlash funcione directamente sobre los estados ocultos del modelo de lenguaje.

Sobre el entrenamiento no se proporcionan en la información disponible detalles de número de tokens, composición del dataset ni si hubo RLHF o DPO. La innovación técnica destacable de esta edición es la cuantización NVFP4 (formato FP4 de NVIDIA con escalas por bloque) calibrada a 128k de contexto, junto con la inclusión de modelos borrador DFlash para decodificación especulativa: según el autor, acelera la generación un 50% con un muestreo por rechazo que garantiza 0,00% de pérdida de precisión. En `llama.cpp`, NVFP4 se emula por software con tablas de búsqueda durante la decodificación por lotes, sin usar las Tensor Cores FP4 nativas.

## Capacidades

- Generación de texto conversacional multi-turno en seis idiomas (inglés, alemán, francés, español, italiano y japonés).
- Comprensión de imagen: pipeline `image-text-to-text`, con proyector multimodal dedicado.
- Comprensión de audio: el proyector multimodal cubre visión y audio según la model card.
- Decodificación especulativa con modelos borrador DFlash, con aceleración declarada del 50% y sin pérdida de precisión por muestreo por rechazo.
- Contexto largo: pesos calibrados a 128k tokens, adecuado para documentos extensos y conversaciones largas.
- Compatibilidad con endpoints (`endpoints_compatible` en los tags de Hugging Face).
- Tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Modo thinking explícito: no disponible en la información proporcionada.

## Casos de uso

- Asistente conversacional multilingüe local: el modelo cubre seis idiomas y puede desplegarse con `llama-server` en un equipo de escritorio, gestionando conversaciones multi-turno sin depender de la nube.
- Análisis de documentos con imágenes: gracias al proyector multimodal y a la calibración a 128k de contexto, se pueden procesar informes escaneados, capturas o diagramas junto con texto largo en una sola pasada.
- Transcripción y análisis de audio: el proyector de audio permite resumir reuniones o extraer información de grabaciones, combinándolo con el modelo de lenguaje para generar actas o respuestas.
- Prototipado y evaluación en CPU: al ser un GGUF autónomo de 6,11 GB más 532 MB de proyector, permite probar los pesos NVFP4 en máquinas sin GPU Blackwell ni vLLM, útil para validar comportamiento antes de pasar a producción.
- Generación acelerada con decodificación especulativa: integrando el borrador DFlash Q8_0 (381 MB) en `llama.cpp` se obtiene un 50% más de velocidad de generación manteniendo la precisión, adecuado para asistentes interactivos con latencia ajustada.
- Investigación en cuantización FP4: sirve como referencia reproducible para estudiar el impacto de NVFP4 con tabla PLE en Q8_0 frente a BF16, comparando calidad y rendimiento en entornos de escritorio.
- Atención al cliente automatizada: la ventana de 128k permite mantener historial extenso de conversaciones e incluir documentación de producto, con el modelo ejecutándose en infraestructura propia.

## Benchmarks y rendimiento

La model card incluye una sección de benchmarks de velocidad y escalado de concurrencia en RTX 5090 Blackwell con `llama.cpp`, pero los datos numéricos de esa tabla no están disponibles en la información proporcionada. No se han publicado en la información disponible resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K, etc.) para este modelo.

Datos de rendimiento declarados por el autor:

| Metrica | Valor |
|---|---|
| Aceleracion con decodificacion especulativa DFlash | +50% |
| Perdida de precision con DFlash (muestreo por rechazo) | 0,00% |
| Tamano del modelo de lenguaje GGUF | 6,11 GB |
| Tamano del proyector multimodal Q8_0 | 532 MB |
| Tamano del proyector multimodal BF16 | 946 MB |
| Tamano del borrador DFlash Q8_0 | 381 MB |
| Tamano del borrador DFlash BF16 | 703 MB |

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo de lenguaje ocupa 6,11 GB en disco; con el proyector Q8_0 (532 MB) y overhead de contexto, se puede estimar un uso en torno a 7-8 GB de VRAM o RAM según cuantización y longitud de contexto (estimación, no dato publicado).
- GPU recomendadas: RTX 5090 (Blackwell) es la referencia usada por el autor; también cabe en GPUs consumer con 8 GB o más de VRAM. Para máximo rendimiento en Blackwell o Rubin, el autor recomienda las ediciones vLLM con Tensor Cores FP4 nativas.
- Cabe en GPU consumer: sí, con 8 GB o más de VRAM; también es viable en CPU según el propósito declarado del repositorio.
- Opciones de despliegue: `llama.cpp` (`llama-cli` / `llama-server`); las ediciones vLLM del mismo autor (`arvedo/Nemotron-3.5-Bolt-E4B-NVFP4-VisionAudio-LowMemory` con 4,65 GiB de VRAM y `arvedo/Nemotron-3.5-Bolt-E4B-NVFP4-VisionAudio` con 5,20 GiB de VRAM) para GPU Blackwell.
- Latencia y throughput: no disponibles en la información proporcionada; el autor advierte que este GGUF no es más rápido que un Q4_K_M estándar en `llama.cpp` por la emulación software de NVFP4.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Nemotron-3.5-Bolt-E4B-NVFP4-VisionAudio-GGUF (este) | 7.518 M | 128k (calibrado) | GGUF NVFP4 | OpenMDW-1.1 | Multimodal visión+audio, ejecutable en `llama.cpp` y CPU |
| arvedo/Nemotron-3.5-Bolt-E4B-NVFP4-VisionAudio-LowMemory | 7.518 M (base) | 128k (calibrado) | safetensors NVFP4 | OpenMDW-1.1 | Edición vLLM compacta: 4,79 GiB disco / 4,65 GiB VRAM, W4A4 nativo en Blackwell |
| arvedo/Nemotron-3.5-Bolt-E4B-NVFP4-VisionAudio | 7.518 M (base) | 128k (calibrado) | safetensors NVFP4 | OpenMDW-1.1 | Edición vLLM estándar: 6,00 GB disco / 5,20 GiB VRAM, tablas FP8 |
| nvidia/NVIDIA-Nemotron-3.5-Bolt-E4B-BF16 | 7.518 M | no disponible | safetensors BF16 | no disponible | Modelo base original en precisión completa |

No se dispone en la información proporcionada de comparaciones con modelos de otros desarrolladores de tamaño o tarea equivalente.

## Limitaciones y advertencias

- La emulación software de NVFP4 en `llama.cpp` implica que este GGUF no es más rápido que un Q4_K_M estándar; el rendimiento nativo FP4 solo se aprovecha con vLLM en GPUs Blackwell o Rubin.
- Sesgos conocidos: no disponibles en la información proporcionada.
- Riesgo de alucinación: no cuantificado en la información disponible; aplican las precauciones habituales en modelos generativos.
- Idiomas: solo se declaran seis idiomas (en, de, fr, es, it, ja); el rendimiento fuera de ellos no está documentado.
- Licencia OpenMDW-1.1: es necesario revisar los términos completos antes de uso comercial, ya que Hugging Face la marca como `license: other`.
- La calibración de los pesos NVFP4 está fijada a 128k de contexto; usos con ventanas distintas pueden degradar la calidad.
- El repositorio es una exportación comunitaria (autor arvedo), no oficial de NVIDIA; conviene validar la fidelidad frente al modelo base BF16 antes de producción.
- La decodificación especulativa requiere cargar además el borrador DFlash (381 MB en Q8_0), lo que incrementa el uso de memoria.
- No hay datos publicados de benchmarks de calidad en la información disponible, lo que dificulta evaluar la pérdida de precisión frente al BF16.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/arvedo/Nemotron-3.5-Bolt-E4B-NVFP4-VisionAudio-GGUF
- Modelo base: https://huggingface.co/nvidia/NVIDIA-Nemotron-3.5-Bolt-E4B-BF16
- Edición vLLM LowMemory: https://huggingface.co/arvedo/Nemotron-3.5-Bolt-E4B-NVFP4-VisionAudio-LowMemory
- Edición vLLM estándar: https://huggingface.co/arvedo/Nemotron-3.5-Bolt-E4B-NVFP4-VisionAudio
- Licencia OpenMDW-1.1: https://openmdw.ai/license/1-1/
- Patrocinador (infraestructura GPU): https://cdemy.de/
