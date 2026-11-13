# bambocher/MiMo-V2.6-Distill-Qwen-9B-oQ2.5-mtp

## Resumen

MiMo-V2.6-Distill-Qwen-9B-oQ2.5-mtp es una cuantización mixta del modelo MiMo-V2.6-Distill-Qwen-9B, un modelo agéntico de 9B parámetros desarrollado por Xiaomi MiMo mediante ajuste fino supervisado (SFT) sobre Qwen3.5-9B con datos generados por el propio MiMo-V2.6. El checkpoint original cubre tareas de programación, agentes generales, codificación visual y ciberseguridad, y esta versión concreta ha sido cuantizada por el usuario bambocher con la herramienta oQ (oMLX v0.7.3) para su uso en el ecosistema MLX de Apple.

La cuantización emplea precisión mixta: distintos bloques del modelo se almacenan con diferentes anchos de bits (desde 2 bits afín con grupo 64 hasta BF16), resultando en un promedio efectivo de 4,080 bits por peso y un tamaño total de 4,9 GB. El checkpoint incluye no solo el modelo de lenguaje (8,954B parámetros lógicos) sino también un codificador visual (0,456B) y una cabeza MTP (Multi-Token Prediction) de 0,243B, lo que confirma que el modelo base es multimodal y soporta decodificación especulativa.

La relevancia de esta ficha radica en que permite ejecutar un modelo agéntico multimodal de ~9,6B parámetros en hardware Apple Silicon con un consumo de almacenamiento inferior a 5 GB, manteniendo componentes en BF16 para preservar la calidad en las capas más sensibles. Es, por tanto, una opción orientada a inferencia local en macOS más que a despliegue en servidores GPU convencionales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (basada en Qwen3.5-9B) con cabeza MTP y codificador visual; tag `qwen3_5` |
| Parametros totales | 9.653.104.368 (9,653B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Cuantización mixta afín: 2-bit grupo 64, 3-bit grupo 128, 3-bit grupo 64, 4-bit grupo 64, 5-bit grupo 64 y BF16; promedio efectivo 4,080 bits/peso |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (librería `mlx`) |

Desglose de la cuantización por componente:

| Componente | Parametros logicos | Almacenamiento |
|---|---|---|
| Modelo de lenguaje | 8,954B | 3,826 GB / 3,563 GiB |
| Vision | 0,456B | 0,912 GB / 0,849 GiB |
| Cabeza MTP | 0,243B | 0,185 GB / 0,172 GiB |
| **Total** | **9,653B** | **4,923 GB / 4,585 GiB** |

Distribución de bits por peso lógico:

| Formato de almacenamiento | Pesos logicos | Porcentaje | Almacenamiento | Bits/peso efectivos |
|---|---|---|---|---|
| Afín 2-bit, grupo 64 | 2,606B | 26,992% | 0,758 GiB | 2,50 |
| Afín 3-bit, grupo 128 | 3,910B | 40,508% | 1,479 GiB | 3,25 |
| Afín 3-bit, grupo 64 | 1,017B | 10,537% | 0,414 GiB | 3,50 |
| Afín 4-bit, grupo 64 | 0,210B | 2,173% | 0,110 GiB | 4,50 |
| Afín 5-bit, grupo 64 | 1,420B | 14,708% | 0,909 GiB | 5,50 |
| BF16 | 0,491B | 5,083% | 0,914 GiB | 16,00 |

## Arquitectura y entrenamiento

El modelo base MiMo-V2.6-Distill-Qwen-9B es un ajuste fino supervisado de Qwen3.5-9B sobre datos generados por Xiaomi MiMo (el modelo profesor MiMo-V2.6). Según las fuentes disponibles, la destilación no se limita a copiar distribuciones de tokens, sino que transfiere trayectorias de ejecución de horizonte largo: cadenas de llamadas a herramientas, depuración en terminal y bucles de autocorrección propios de un modelo agéntico. El checkpoint incluye un codificador visual (0,456B parámetros) y una cabeza MTP (0,243B), lo que indica soporte multimodal y predicción multi-token, presumiblemente para decodificación especulativa.

La versión aquí descrita es una cuantización de precisión mixta realizada con oQ (oMLX v0.7.3) sobre el checkpoint de bambocher. El esquema asigna 2 bits a aproximadamente el 27% de los pesos lógicos, 3 bits al 51%, 4-5 bits al 17% y mantiene un 5,08% en BF16 (0,491B parámetros, 0,914 GiB), probablemente capas de normalización, embeddings o módulos sensibles a la cuantización. El resultado es un promedio de 4,080 bits/peso con un tamaño de 4,585 GiB, lo que reduce el checkpoint original en más de la mitad manteniendo componentes críticos en alta precisión.

No se dispone de información sobre el número de tokens de entrenamiento, la composición exacta del dataset, ni si hubo etapas de RLHF o DPO en el modelo base.

## Capacidades

- Generación de texto y razonamiento general, heredados de la base Qwen3.5-9B.
- Programación y tareas de código, incluyendo depuración y ejecución en terminal según la destilación de trayectorias agénticas.
- Tareas agénticas generales: planificación multi-paso, uso de herramientas y bucles de autocorrección.
- Codificación visual: el checkpoint incluye un codificador de visión de 0,456B parámetros, lo que habilita entrada de imágenes.
- Ciberseguridad: el modelo base fue entrenado explícitamente en tareas de este dominio según la documentación de Xiaomi MiMo.
- Soporte de tool calling / function calling, implícito en su naturaleza agéntica y en las trayectorias de destilación.
- Predicción multi-token (cabeza MTP) para acelerar la decodificación.
- Capacidades multilingües: no disponible en la información proporcionada.

## Casos de uso

- Asistente de programación local en macOS: el checkpoint MLX de 4,9 GB cabe en memoria unificada de un Mac con 16 GB o más, permitiendo autocompletado, refactorización y explicación de código sin conexión.
- Automatización de tareas de terminal: gracias a la destilación de cadenas de depuración y autocorrección, puede integrarse en scripts que ejecuten comandos, interpreten errores y propongan correcciones iterativas.
- Agente de soporte técnico con imágenes: el codificador visual permite adjuntar capturas de pantalla de errores o interfaces para que el modelo diagnostique problemas, útil en mesas de ayuda internas.
- Análisis de código en pipelines de CI: puede invocarse vía MLX para revisar diffs, detectar patrones inseguros o sugerir parches, aprovechando su entrenamiento en ciberseguridad.
- Prototipado de agentes multi-paso en investigación: su tamaño reducido y su cabeza MTP lo hacen adecuado para experimentar con bucles de razonamiento y tool calling en hardware de consumo.
- Educación y formación en ciberseguridad: puede generar explicaciones de vulnerabilidades y ejercicios guiados en entornos aislados, dado su ajuste específico en este dominio.
- Inferencia en dispositivos Apple Silicon con requisitos de almacenamiento mínimos: con menos de 5 GB en disco, es viable distribuirlo en portátiles para tareas de generación y análisis sin infraestructura GPU.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM/memoria unificada estimada: al menos 5-6 GB para cargar los pesos (4,585 GiB) más overhead de contexto y buffers de inferencia; se recomienda un mínimo de 8 GB y preferiblemente 16 GB en Apple Silicon.
- GPU recomendadas: Apple Silicon (series M1/M2/M3/M4) con memoria unificada suficiente; el formato MLX no está pensado para GPU NVIDIA.
- Cabe en GPU de consumo: sí, en equipos Apple con memoria unificada de 8 GB o más, aunque 16 GB ofrece margen para contextos largos.
- Opciones de despliegue: MLX (librería nativa), oMLX/oQ para gestión de cuantizaciones; no se indica compatibilidad con vLLM, llama.cpp, Ollama o TGI en la información disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| MiMo-V2.6-Distill-Qwen-9B-oQ2.5-mtp (este) | 9,653B | no disponible | no disponible | safetensors MLX, 4,080 bits/peso | Cuantización mixta para Apple Silicon, 4,9 GB |
| MiMo-V2.6-Distill-Qwen-9B (original) | 9B | no disponible | no disponible | safetensors | Checkpoint sin cuantizar de Xiaomi MiMo; multimodal y agéntico |
| Qwen3.5-9B (base) | 9B | no disponible | no disponible | safetensors | Base sobre la que se destila MiMo; sin ajuste agéntico específico |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- La cuantización a 2-3 bits en más de la mitad de los pesos puede degradar la calidad en tareas sensibles, especialmente razonamiento matemático y código complejo; no se han publicado evaluaciones de la pérdida de rendimiento.
- El modelo base es un ajuste fino supervisado sobre datos generados por un profesor; puede heredar sesgos y errores del profesor, y no se documenta ningún proceso de alineación adicional (RLHF/DPO).
- Riesgo de alucinación en tareas de ciberseguridad y código: las respuestas pueden parecer plausibles pero contener vulnerabilidades o comandos incorrectos; requiere validación humana en producción.
- Licencia no disponible: no se puede confirmar si el uso comercial está permitido; debe consultarse el repositorio del modelo base antes de cualquier despliegue comercial.
- Idiomas soportados no documentados; el rendimiento en castellano no está verificado.
- Longitud de contexto no disponible; no se puede garantizar el comportamiento en conversaciones o documentos largos.
- Formato MLX exclusivo para Apple Silicon: no es desplegable directamente en GPU NVIDIA ni en entornos Linux con CUDA sin conversión.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: no hay evidencia de validación comunitaria ni de pruebas independientes.
- El tag `mtp` y la cabeza de 0,243B sugieren decodificación especulativa, pero no se documenta si la cuantización preserva la funcionalidad completa de dicha cabeza.

## Enlaces

- Hugging Face (este checkpoint): https://huggingface.co/bambocher/MiMo-V2.6-Distill-Qwen-9B-oQ2.5-mtp
- Modelo base en Hugging Face: https://huggingface.co/bambocher/MiMo-V2.6-Distill-Qwen-9B
- Modelo original de Xiaomi MiMo: https://huggingface.co/XiaomiMiMo/MiMo-V2.6-Distill-Qwen-9B
- Paper MiMo-V2.6 (arXiv): https://arxiv.org/html/2610.11959v1
- Herramienta oQ/oMLX: https://github.com/jundot/omlx
- Nota de campo sobre modelos locales (advanced-stack): https://advanced-stack.com/fields-notes/three-local-models-one-session-mimo-9b-distill.html
- Hilo en r/LocalLLaMA: https://www.reddit.com/r/LocalLLaMA/comments/1wmtjqu/mimov26_distilled_themselves_into_qwen_9b/
