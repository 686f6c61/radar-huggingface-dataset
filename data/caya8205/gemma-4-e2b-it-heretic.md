# Caya8205/gemma-4-E2B-it-heretic

## Resumen

gemma-4-E2B-it-heretic es una versión "abliterated" (decensored) del modelo google/gemma-4-E2B-it, publicada por el usuario Caya8205 en Hugging Face. El proceso de abliteración se ha realizado con la herramienta Heretic v2.1.0 mediante Arbitrary-Rank Ablation (ARA), una técnica que elimina direcciones de activación asociadas al rechazo de peticiones sin reentrenar los pesos originales. El resultado es un modelo que reduce drásticamente las negativas a responder, manteniendo una divergencia KL baja respecto al modelo base.

El modelo conserva la arquitectura multimodal del Gemma 4 E2B original (visión y audio además de texto) y se distribuye exclusivamente en formato GGUF para su uso con llama.cpp. El repositorio incluye tres ficheros: los pesos principales en Q8_0, un proyector multimodal en F16 y una cabeza de predicción multi-token (MTP) para decodificación especulativa. Con 4.628.569.635 parámetros totales, es un modelo de tamaño medio orientado a despliegue local.

Es relevante para quienes necesitan un modelo multimodal con filtros de seguridad relajados en entornos controlados, aunque su licencia Gemma impone restricciones de uso y su naturaleza abliterated conlleva riesgos adicionales de contenido inapropiado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (texto, visión, audio), basada en google/gemma-4-E2B-it |
| Parametros totales | 4.628.569.635 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (en el ejemplo de uso se configura `-c 16384`) |
| Tipos de cuantizacion | Q8_0 (pesos principales), F16 (proyector multimodal), Q8_0 (cabeza MTP) |
| Idiomas soportados | en, id |
| Licencia | gemma |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

El modelo parte de google/gemma-4-E2B-it, un transformer multimodal de la familia Gemma 4 que procesa texto, imágenes y audio. La modificación aquí aplicada no reentrena el modelo: Heretic v2.1.0 con Arbitrary-Rank Ablation identifica y elimina direcciones de activación responsables de las respuestas de rechazo, preservando el resto de capacidades. La evaluación reportada por el autor en el trial 38 muestra 2 rechazos sobre 100 en `mlabonne/harmful_behaviors` y una divergencia KL de 0.3489 sobre `mlabonne/harmless_alpaca`, lo que indica un desvío moderado respecto al comportamiento del modelo base.

El repositorio incluye además una cabeza de predicción multi-token (MTP) en Q8_0 que habilita decodificación especulativa con llama.cpp (`--spec-type draft-mtp --spec-draft-n-max 3`), y un proyector multimodal F16 necesario para las entradas de visión y audio. No se dispone de información sobre el volumen de tokens de entrenamiento ni la composición del dataset original más allá de lo publicado por Google para el modelo base.

## Capacidades

- Generación de texto conversacional multi-turno.
- Procesamiento de imágenes (image-text-to-text) mediante el proyector multimodal incluido.
- Procesamiento de audio según los tags del repositorio.
- Decodificación especulativa mediante la cabeza MTP incluida.
- Capacidades multilingües limitadas a inglés e indonesio según la model card.
- Comportamiento "decensored": reducción drástica de rechazos ante peticiones que el modelo base declinaría.
- Compatible con endpoints y con llama.cpp / llama-server.
- Soporte de plantillas Jinja (`--jinja`) para formateo de conversaciones.

## Casos de uso

- Investigación sobre alineación y seguridad: el modelo permite estudiar el efecto de la abliteración comparando respuestas con el base Gemma 4 E2B-it, usando las métricas de rechazo y divergencia KL reportadas como referencia.
- Procesamiento local de documentos con imágenes: extracción y descripción de contenido visual en entornos sin conexión, aprovechando el proyector multimodal F16 y el formato GGUF para ejecución en hardware de consumo.
- Transcripción y análisis de audio: al conservar las capacidades de audio del modelo base, puede emplearse para tareas de comprensión de audio en pipelines locales.
- Generación de contenido creativo sin restricciones: escritura de ficción, guiones o material narrativo donde el modelo base rechazaría ciertos temas, en contextos editoriales controlados.
- Despliegue en servidor con llama-server: integración como backend conversacional multimodal mediante la configuración documentada, con decodificación especulativa para reducir latencia.
- Evaluación comparativa de cuantizaciones: al ofrecerse en Q8_0, sirve para medir la pérdida de calidad frente al modelo base en tareas multimodales y de texto.
- Pruebas de robustez de filtros: uso como caso de estudio de cómo las técnicas de abliteración afectan a la tasa de rechazo y a la coherencia general.

## Benchmarks y rendimiento

| Metrica | Dataset | Resultado |
|---|---|---|
| Rechazos (Refusals) | mlabonne/harmful_behaviors | 2 / 100 |
| Divergencia KL | mlabonne/harmless_alpaca | 0.3489 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible.

## Requisitos de hardware

- VRAM estimada: el repositorio ocupa 6.0 GB; con Q8_0 para los pesos principales y F16 para el proyector, se requiere aproximadamente 6-8 GB de VRAM para cargar el modelo completo, más overhead de contexto.
- GPU recomendadas: RTX 4090, RTX 3090, A100 o H100 para mayor throughput; cualquier GPU con al menos 8 GB de VRAM puede ejecutar el modelo en Q8_0.
- Cabe en GPU de consumo: sí, en tarjetas con 8 GB o más (RTX 3060 Ti, RTX 4060 Ti, RTX 3070 en adelante).
- Opciones de despliegue: llama.cpp / llama-server (documentado por el autor), y por compatibilidad de formato GGUF, otras herramientas basadas en llama.cpp como Ollama o LM Studio.
- Latencia y throughput: no disponibles. La decodificación especulativa con MTP (`--spec-draft-n-max 3`) está pensada para reducir latencia, pero no se aportan cifras.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Multimodal | Licencia | Formato |
|---|---|---|---|---|---|
| gemma-4-E2B-it-heretic | 4.628.569.635 | no disponible | Sí (visión, audio) | gemma | GGUF |
| google/gemma-4-E2B-it | no disponible | no disponible | Sí (visión, audio) | gemma | safetensors |
| Otras variantes abliterated de Gemma | no disponible | no disponible | no disponible | gemma | no disponible |

No se dispone de datos de benchmarks comparativos con alternativas de la misma categoría en la información proporcionada.

## Limitaciones y advertencias

- Modelo abliterated: la eliminación de direcciones de rechazo puede degradar la coherencia, aumentar la probabilidad de contenido ofensivo o inapropiado y afectar a tareas que dependen de negativas razonadas.
- La divergencia KL de 0.3489 respecto al modelo base indica un desvío no trivial en la distribución de respuestas sobre textos benignos.
- Riesgo de alucinación inherente al modelo base, potencialmente agravado por la modificación.
- Idiomas soportados limitados a inglés e indonesio; el rendimiento en castellano no está garantizado.
- Licencia Gemma: impone restricciones de uso, obligaciones de atribución y políticas de uso aceptable que deben revisarse antes de cualquier despliegue comercial.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: sin validación comunitaria ni evidencia de uso en producción.
- No se documenta la longitud de contexto nativa del modelo base en la información disponible.
- El uso de la cabeza MTP requiere una versión de llama.cpp que soporte `--spec-type draft-mtp`.

## Enlaces

- Hugging Face: https://huggingface.co/Caya8205/gemma-4-E2B-it-heretic
- Modelo base: https://huggingface.co/google/gemma-4-E2B-it
- Heretic (herramienta de abliteración): https://github.com/p-e-w/heretic
