# artyomboyko/eres2netv2-192

# Ficha técnica: ERes2NetV2-192

## Resumen

ERes2NetV2-192 es un encoder de voz para verificación de hablante, empaquetado como modelo de Hugging Face Transformers por la comunidad. Se basa en la arquitectura ERes2NetV2 desarrollada por el proyecto 3D-Speaker de ModelScope, que a su vez es una evolución de ERes2Net diseñada específicamente para mejorar el rendimiento en verificación de hablante con frases cortas. El modelo extrae embeddings de voz de 192 dimensiones a partir de audio de 16 kHz, utilizando características FBank de 80 dimensiones con normalización media por utterance.

El repositorio actual es un packaging comunitario del checkpoint oficial `iic/speech_eres2netv2_sv_zh-cn_16k-common` de ModelScope, migrado a safetensors sin modificar los pesos. Con aproximadamente 17,9 millones de parámetros, es un modelo ligero que puede ejecutarse en CPU o GPU de gama baja, lo que lo hace adecuado para aplicaciones de verificación de hablante en tiempo real o embebidas. La licencia Apache-2.0 permite uso comercial sin restricciones significativas.

La relevancia de este modelo radica en su capacidad para manejar grabaciones cortas (menos de 2 segundos) donde los sistemas tradicionales degradan su precisión, gracias a una fusión de características multi-escala y una expansión del ancho de canal en cada etapa de la red. Es una opción práctica para desarrolladores que necesitan un encoder de voz eficiente y bien documentado dentro del ecosistema Transformers.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ERes2NetV2 (Enhanced Res2Net con fusión multi-escala) |
| Parametros totales | 17.896.656 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No aplica (entrada de audio, no texto) |
| Tipos de cuantizacion | No disponible (solo pesos en FP32 en safetensors) |
| Idiomas soportados | Chino (zh) (entrenado principalmente en chino, aunque puede generalizar a otros idiomas) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (también disponible el checkpoint original en formato PyTorch) |

## Arquitectura y entrenamiento

ERes2NetV2 es una red neuronal convolucional basada en el bloque Res2Net, que combina características globales y locales para la extracción de embeddings de hablante. La principal innovación frente a ERes2Net es la expansión del número de canales en cada etapa y una estrategia de fusión multi-escala que captura mejor las características de voz en grabaciones de corta duración. El modelo procesa audio de 16 kHz, extrae 80 coeficientes FBank con `dither=0` y normalización media por utterance, y produce un vector de 192 dimensiones L2-normalizado.

El checkpoint original fue entrenado por el equipo de 3D-Speaker (ModelScope) sobre conjuntos de datos de verificación de hablante en chino, aunque no se proporcionan detalles específicos sobre el número de tokens o la composición exacta del dataset en la información disponible. El empaquetado comunitario no modifica los pesos y solo incluye un ajuste menor de autograd para compatibilidad con batches de Transformers. El modelo se puede fine-tunear con el `Trainer` estándar de Hugging Face, añadiendo una capa de clasificación con `CosineClassifier` y pérdida `ArcMarginLoss` cuando se especifica `num_labels`.

## Capacidades

- Extracción de embeddings de hablante de 192 dimensiones, L2-normalizados.
- Verificación de hablante (speaker verification) y reconocimiento de hablante (speaker recognition) mediante comparación de embeddings (similitud coseno).
- Funciona con audio de 16 kHz, mono, en formato de onda o características FBank.
- Soporte para batches de longitud variable mediante padding derecho.
- Integración nativa con la API `AutoModelForAudioXVector` de Transformers, lo que facilita su uso en pipelines existentes.
- Posibilidad de fine-tuning con el `Trainer` estándar para adaptar el modelo a dominios específicos o conjuntos de hablantes propios.
- No realiza ASR (reconocimiento de voz), diarización, clustering ni gestión de memoria de hablantes; se limita a generar embeddings.

## Casos de uso

- **Autenticación por voz en aplicaciones móviles**: el modelo puede verificar la identidad de un usuario comparando su voz con una plantilla previamente almacenada. Su tamaño reducido permite ejecutarlo en el dispositivo o en un servidor con baja latencia.
- **Verificación de locutor en centros de llamadas**: integrado en sistemas de atención al cliente, puede confirmar que la persona que llama es el titular de una cuenta, mejorando la seguridad sin fricción adicional.
- **Búsqueda de hablantes en archivos de audio**: dado un clip de voz de referencia, se pueden generar embeddings de todos los segmentos de un audio largo y encontrar coincidencias mediante búsqueda de similitud, útil para análisis forense o gestión de contenidos.
- **Sistemas de seguridad biométrica**: combinado con otros factores (contraseña, PIN), la verificación de voz añade una capa biométrica robusta, especialmente en entornos donde el uso de cámaras no es viable.
- **Segmentación y agrupación de hablantes en reuniones**: aunque el modelo no hace diarización directamente, sus embeddings pueden alimentar algoritmos de clustering para separar participantes en grabaciones de conferencias.
- **Control de acceso por voz en dispositivos IoT**: al ser ligero (17,9 M parámetros), puede desplegarse en hardware de bajo consumo (Raspberry Pi, etc.) para activar funciones solo con la voz del propietario.
- **Evaluación de calidad de voz en sistemas de telecomunicación**: comparando embeddings de una misma frase pronunciada en diferentes condiciones, se puede medir la degradación del canal.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El paper original de ERes2NetV2 (Chen et al., Interspeech 2024) reporta mejoras en verificación de hablante de corta duración sobre VoxCeleb, pero esos datos no se incluyen en la documentación del repositorio. Para una evaluación cuantitativa, se recomienda consultar el paper o ejecutar el modelo en conjuntos de datos como VoxCeleb1 o CN-Celeb.

## Requisitos de hardware

- **VRAM estimada**: inferior a 0,5 GB en FP32 (17,9 M parámetros ≈ 72 MB en FP32). Con cuantización a FP16 o INT8, el consumo es aún menor.
- **GPU recomendadas**: cualquier GPU con al menos 2 GB de VRAM (por ejemplo, NVIDIA GTX 1650, RTX 2060) es suficiente. También funciona en CPU sin problemas para inferencia por lotes pequeños.
- **Cabe en GPU de consumo**: sí, en todas las GPU modernas, incluso en integradas.
- **Opciones de despliegue**: se puede usar directamente con Transformers (`AutoModelForAudioXVector`), exportar a ONNX para inferencia optimizada, o servir con frameworks como vLLM (aunque no es un modelo generativo, su uso es más simple). También es compatible con `llama.cpp` si se convierte a GGUF, aunque no es el flujo habitual.
- **Latencia y throughput**: al ser un modelo pequeño, la inferencia en CPU tarda unos pocos milisegundos por utterance de 1-2 segundos; en GPU, la latencia es despreciable (<5 ms). No se proporcionan cifras exactas en la documentación.

## Comparativa con modelos similares

No se dispone de datos comparativos directos en la información proporcionada. Como alternativas en la misma categoría (encoders de voz para verificación de hablante) se pueden mencionar:

| Modelo | Parámetros | Embedding | Licencia | Notas |
|---|---|---|---|---|
| ERes2NetV2-192 (este) | 17,9 M | 192 | Apache-2.0 | Enfoque en corta duración |
| ECAPA-TDNN (por ejemplo, `speechbrain/spkrec-ecapa-voxceleb`) | ~18 M | 192 | Apache-2.0 | Muy usado, entrenado en VoxCeleb |
| WavLM Base | ~94 M | 768 | MIT | Modelo preentrenado de propósito general, requiere fine-tuning |

No se dispone de resultados de benchmarks comparativos en la información disponible. Se recomienda evaluar cada modelo en el conjunto de datos objetivo antes de elegir.

## Limitaciones y advertencias

- **Idioma**: el modelo fue entrenado principalmente con datos en chino. Aunque puede generalizar a otros idiomas, su rendimiento puede degradarse en lenguas con fonética muy distinta.
- **Duración del audio**: aunque está optimizado para frases cortas, el rendimiento en utterances de menos de 0,5 segundos puede ser limitado.
- **Condiciones de grabación**: el modelo espera audio de 16 kHz, mono, con nivel de señal adecuado. Ruido de fondo intenso o reverberación pueden afectar la calidad del embedding.
- **Sin capacidades generativas**: no genera texto ni audio; solo produce embeddings. No es adecuado para tareas de ASR o síntesis.
- **Sesgos**: al ser entrenado en un corpus específico, puede tener sesgos hacia ciertos acentos, géneros o grupos demográficos. No se han documentado evaluaciones de sesgo.
- **Licencia**: Apache-2.0 permite uso comercial, pero se debe mantener la atribución y las notificaciones de licencia. El modelo no incluye garantías.
- **Packaging comunitario**: aunque los pesos son idénticos al original, el código de envoltura es mantenido por la comunidad y puede tener bugs no detectados. Se recomienda verificar el comportamiento en producción.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/artyomboyko/eres2netv2-192
- Paper original (Interspeech 2024): https://www.isca-archive.org/interspeech_2024/chen24l_interspeech.html
- arXiv: https://arxiv.org/abs/2406.02167
- Proyecto 3D-Speaker (GitHub): https://github.com/modelscope/3D-Speaker
- Checkpoint original en ModelScope: https://modelscope.cn/models/iic/speech_eres2netv2_sv_zh-cn_16k-common
- Documentación de `AutoModelForAudioXVector`: https://huggingface.co/docs/transformers/main/en/model_doc/auto#transformers.AutoModelForAudioXVector
