# divinetribe/MiMo-V2.6-9B-MLX-8bit

## Resumen
MiMo-V2.6-9B-MLX-8bit es una cuantización de 8 bits en formato MLX del modelo XiaomiMiMo/MiMo-V2.6-Distill-Qwen-9B, publicada por el usuario divinetribe. El modelo original lo desarrolla el equipo MiMo de Xiaomi mediante fine-tuning supervisado de Qwen3.5-9B sobre datos generados por MiMo que cubren programación, tareas de agente generales, codificación visual y ciberseguridad. Esta versión concreta es un repackaging: el único trabajo del publicador es la cuantización a 8 bits para Apple Silicon, manteniendo intacta la torre de visión.

Se trata de un modelo multimodal image-text-to-text de 9.409.813.744 parámetros, con arquitectura Qwen3_5ForConditionalGeneration (torre de visión qwen3_5_vision alimentando un decodificador qwen3_5_text). Su relevancia actual radica en que permite ejecutar un agente de código con capacidad de lectura de imágenes en equipos Apple de 16 GB de memoria unificada, ocupando 9,7 GB en dos shards con group size 64 y 8.864 bits por peso.

La ficha se centra en esta cuantización MLX, pero los datos de arquitectura y entrenamiento provienen del checkpoint base de Xiaomi, ya que la model card del publicador solo documenta el proceso de cuantización.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3_5ForConditionalGeneration (torre de visión qwen3_5_vision + decodificador qwen3_5_text) |
| Parametros totales | 9.409.813.744 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 8 bits MLX (8.864 bits por peso, group size 64); existe versión bf16 del mismo publicador |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors (MLX), dos shards, 9,7 GB; repo de 10,4 GB |

## Arquitectura y entrenamiento
La arquitectura es la de Qwen3.5, un modelo multimodal que combina una torre de visión (`qwen3_5_vision`) con un decodificador de texto (`qwen3_5_text`) bajo la clase `Qwen3_5ForConditionalGeneration`. El checkpoint base de Xiaomi se construyó mediante fine-tuning supervisado (SFT) de Qwen3.5-9B sobre datos generados por MiMo, orientados a programación, tareas de agente, codificación visual y ciberseguridad. No se detalla en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset ni si hubo etapas de RLHF o DPO en este checkpoint de destilación.

La innovación técnica de esta publicación es exclusivamente la cuantización: pesos de 8 bits en MLX con group size 64, preservando la torre de visión sin cuantizar de forma agresiva. Según la model card, en una prueba cualitativa de lectura de pose la respuesta del build de 8 bits fue idéntica a la del build bf16, lo que sugiere que la reducción de tamaño no degradó la lectura visual en ese caso concreto.

## Capacidades
- Generación de texto y razonamiento general, heredados del decodificador Qwen3.5-9B.
- Generación de código y tareas de agente de programación, con resultados reportados en SWE-bench Verified.
- Comprensión de imágenes: lectura de figuras, escenas y contenido visual; el modelo responde preguntas sobre la imagen adjunta.
- Codificación visual: la model card indica que el mismo camino de visión escribe alt-text para imágenes de producto e interfaz y lee capturas de pantalla para convertirlas en código.
- Uso como agente local: el publicador lo integra en Claude Code Local como uno de los modelos ejecutables en Apple Silicon mediante un servidor MLX nativo de API Anthropic.
- Capacidades de ciberseguridad, según los datos de entrenamiento del checkpoint base.
- Multilingüismo: no disponible en la información proporcionada.
- Tool calling / function calling: no disponible explícitamente en la información proporcionada.
- Modo thinking, audio u otras capacidades especiales: no disponible.

## Casos de uso
- Control de calidad de pose en aplicaciones de movimiento: se alimenta un fotograma con un avatar superpuesto y se pregunta si la figura dibujada es una pose humana correcta y si hay extremidades extra o cruzadas. La model card documenta este flujo exacto como ejemplo verificado.
- Generación de alt-text para catálogos de producto e interfaces: el modelo describe imágenes y devuelve texto alternativo utilizable en pipelines de accesibilidad o SEO, aprovechando la torre de visión intacta.
- Conversión de capturas de pantalla a código: a partir de una imagen de interfaz, el modelo genera el código correspondiente, útil en prototipado rápido y en tareas de reconstrucción de UI.
- Agente de código en local sobre Apple Silicon: integrado en Claude Code Local, permite ejecutar tareas de programación multi-paso sin enviar código a servicios externos, con 9,7 GB de pesos en memoria unificada.
- Asistencia a desarrollo en equipos de 16 GB: la cuantización de 8 bits está pensada explícitamente para máquinas de 16 GB, lo que habilita un agente multimodal en portátiles Apple de gama media.
- Revisión de código con contexto visual: combinación de lectura de diagramas, capturas de error o documentación gráfica con generación de parches y explicaciones de código.
- Tareas de ciberseguridad asistida: el checkpoint base incluye datos de ciberseguridad en su SFT, por lo que puede emplearse en análisis de código y revisión de configuraciones, siempre con supervisión humana.

## Benchmarks y rendimiento
La model card cita un único benchmark público aplicable: SWE-bench Verified, con puntuación de 61,1 (avg@3) para este checkpoint SFT, frente a 60,0 de su base Qwen3.5-9B. El resto de métricas del informe técnico de MiMo-V2.6 (MiMo Code, MiMo Visual Coding) son conjuntos de evaluación internos de los autores y no leaderboards externos. No se han publicado resultados de benchmarks específicos para esta cuantización de 8 bits; la model card advierte que se espera un pequeño efecto de la cuantización sobre las puntuaciones exactas.

| Benchmark | MiMo-V2.6-Distill-Qwen-9B (SFT) | Qwen3.5-9B (base) |
|---|---|---|
| SWE-bench Verified (avg@3) | 61,1 | 60,0 |

## Requisitos de hardware
- VRAM/memoria: 9,7 GB de pesos en dos shards; el publicador la destina a máquinas Apple de 16 GB de memoria unificada.
- GPU recomendadas: Apple Silicon con MLX (mlx-vlm); no se documenta soporte para GPU NVIDIA en esta publicación.
- Cabe en consumer GPU: la información disponible solo confirma Apple Silicon; no hay datos sobre GPUs de consumo NVIDIA.
- Opciones de despliegue: `mlx-vlm` (librería indicada en la model card); integración con el servidor MLX nativo de API Anthropic de Claude Code Local. No se mencionan vLLM, llama.cpp, Ollama ni TGI para este repositorio.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | SWE-bench Verified | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MiMo-V2.6-9B-MLX-8bit (esta ficha) | 9,41 B | no disponible | 61,1 (heredado del checkpoint base) | MIT | MLX, safetensors |
| XiaomiMiMo/MiMo-V2.6-Distill-Qwen-9B | 9 B (según nombre) | no disponible | 61,1 | MIT | checkpoint original |
| Qwen/Qwen3.5-9B | 9 B (según nombre) | no disponible | 60,0 | no disponible en la información | checkpoint base |
| divinetribe/MiMo-V2.6-9B-MLX-bf16 | 9,41 B | no disponible | no disponible | MIT | MLX bf16, calidad completa |

## Limitaciones y advertencias
- La cuantización a 8 bits puede alterar ligeramente las puntuaciones exactas de benchmarks; la model card solo verifica igualdad cualitativa en un único ejemplo de visión.
- El modelo hereda los sesgos y el riesgo de alucinación del checkpoint base y de Qwen3.5-9B; no se documentan evaluaciones de sesgo en la información disponible.
- No se especifican los idiomas soportados ni la longitud de contexto, lo que impide garantizar comportamiento multilingüe o conversaciones de contexto largo.
- El soporte está limitado a MLX y Apple Silicon; no se documentan rutas de despliegue en CUDA, vLLM o llama.cpp para este repositorio.
- Las cifras de benchmarks del informe técnico de MiMo-V2.6 distintas de SWE-bench Verified son evaluaciones internas de los autores, no leaderboards externos.
- La licencia MIT del checkpoint base permite uso comercial, pero conviene verificar las condiciones de Qwen3.5-9B, cuya licencia no se detalla en la información proporcionada.
- El publicador es un tercero (divinetribe); la calidad del modelo es atribuible al equipo MiMo de Xiaomi y al equipo Qwen, no al autor de la cuantización.

## Enlaces
- Repositorio de esta cuantización: https://huggingface.co/divinetribe/MiMo-V2.6-9B-MLX-8bit
- Versión bf16 del mismo publicador: https://huggingface.co/divinetribe/MiMo-V2.6-9B-MLX-bf16
- Checkpoint base de Xiaomi: https://huggingface.co/XiaomiMiMo/MiMo-V2.6-Distill-Qwen-9B
- Organización Xiaomi MiMo: https://huggingface.co/XiaomiMiMo
- Modelo base Qwen3.5-9B: https://huggingface.co/Qwen/Qwen3.5-9B
- Librería mlx-vlm: https://github.com/Blaizzy/mlx-vlm
- Claude Code Local: https://github.com/nicedreamzapp/claude-code-local
- Perfil del publicador en GitHub: https://github.com/nicedreamzapp
- Leaderboard Agent-12: https://nicedreamzapp.github.io/agent12/
- SWE-bench: https://www.swebench.com/
