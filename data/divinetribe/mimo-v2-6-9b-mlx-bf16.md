# divinetribe/MiMo-V2.6-9B-MLX-bf16

## Resumen

MiMo-V2.6-Distill-Qwen-9B es un modelo multimodal de 9.400 millones de parámetros desarrollado por el equipo MiMo de Xiaomi. Se construye mediante ajuste supervisado (SFT) sobre la base Qwen3.5-9B de Alibaba, empleando datos generados por MiMo que cubren programación, tareas de agente generales, codificación visual y ciberseguridad. La arquitectura es `Qwen3_5ForConditionalGeneration`, que combina una torre de visión `qwen3_5_vision` con un decodificador de texto `qwen3_5_text`, lo que le permite procesar imágenes y texto de forma conjunta.

La ficha que nos ocupa, `divinetribe/MiMo-V2.6-9B-MLX-bf16`, no es el modelo original, sino una conversión a formato MLX en precisión completa bf16 realizada por el usuario divinetribe, manteniendo la torre de visión intacta para su ejecución nativa en Apple Silicon. El repositorio contiene 760 tensores distribuidos en cuatro shards, con un total de 18,8 GB, y está pensado para la librería `mlx-vlm`. Existen también variantes cuantizadas a 8 bits (para máquinas de 16 GB) y 4 bits (para máquinas de 8 GB).

Su relevancia actual radica en que ofrece capacidades de agente autónomo y codificación con soporte visual en hardware de consumo Apple, con licencia MIT, lo que facilita su uso comercial y su integración en flujos de trabajo locales. El modelo original reporta una puntuación de 61,1 (avg@3) en SWE-bench Verified, ligeramente por encima de su base Qwen3.5-9B (60,0).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `Qwen3_5ForConditionalGeneration` (torre de visión `qwen3_5_vision` + decodificador de texto `qwen3_5_text`) |
| Parametros totales | 9.409.813.744 (9,4B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | bf16 (esta ficha); existen variantes 8-bit y 4-bit en repositorios separados |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors (MLX, bf16, 760 tensores, 4 shards, 18,8 GB) |

## Arquitectura y entrenamiento

El modelo sigue una arquitectura multimodal de tipo transformer condicional: un codificador visual (`qwen3_5_vision`) procesa las imágenes y proyecta sus representaciones en el espacio del decodificador de texto (`qwen3_5_text`), que es el encargado de generar la respuesta. Esta estructura permite tareas de image-text-to-text, como describir imágenes, leer capturas de pantalla o interpretar diagramas, además de generación de texto puro.

El entrenamiento del modelo original parte de Qwen3.5-9B y aplica ajuste supervisado (SFT) sobre datos generados por MiMo, con cuatro dominios declarados: programación, tareas de agente generales, codificación visual y ciberseguridad. No se especifican en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron técnicas de RLHF o DPO adicionales. La conversión aquí descrita se limita a transformar los pesos originales a bf16 en formato MLX sin alterar la calidad del modelo; el autor de la conversión indica explícitamente que no ha realizado ningún trabajo de mejora sobre el modelo base.

## Capacidades

- Generación de texto y razonamiento general, heredados de la base Qwen3.5-9B.
- Generación de código y resolución de tareas de programación, con especial énfasis en flujos de agente (el checkpoint reporta 61,1 en SWE-bench Verified).
- Comprensión de imágenes: descripción de contenido visual, lectura de capturas de pantalla, generación de texto alternativo para imágenes de producto e interfaz.
- Codificación visual: interpretación de diagramas o capturas para producir o corregir código.
- Tareas de agente: el modelo está etiquetado como "agentic" y se integra en el proyecto Claude Code Local para ejecutar tareas de agente en local.
- Capacidades de ciberseguridad, según los dominios de entrenamiento declarados por el autor original.
- Soporte de tool calling / function calling: no confirmado explícitamente en la información disponible.
- Capacidades multilingües: no disponibles.
- Modo de razonamiento extendido (thinking mode): no disponible.

## Casos de uso

- Control de calidad visual en tiempo real: el modelo puede analizar fotogramas de una cámara y verificar la corrección de una pose humana, contando extremidades y detectando artefactos, como demuestra el ejemplo de control de calidad de una postura de boxeo incluido en la model card. Es adecuado por su torre de visión intacta y su capacidad de razonamiento sobre la imagen.
- Generación de texto alternativo para accesibilidad: a partir de imágenes de producto o de interfaz, el modelo produce descripciones textuales que pueden integrarse en pipelines de publicación web, gracias a su pipeline image-text-to-text.
- Transcripción de capturas de pantalla a código: el modelo lee una captura de una interfaz y genera el código correspondiente, lo que resulta útil en tareas de reconstrucción de UI o migración de prototipos.
- Asistente de programación en local sobre Apple Silicon: mediante `mlx-vlm` y el servidor compatible con la API de Anthropic del proyecto Claude Code Local, el modelo puede ejecutar tareas de agente de codificación sin conexión, aprovechando su entrenamiento en SWE-bench.
- Automatización de revisiones de código asistidas por imagen: en equipos que documentan incidencias con capturas, el modelo puede interpretar la imagen adjunta y proponer una corrección o un diagnóstico, combinando visión y generación de código.
- Análisis de documentos técnicos escaneados: el modelo puede extraer información de diagramas o esquemas y responder preguntas sobre ellos, útil en entornos de ingeniería o soporte técnico.
- Evaluación de seguridad y ciberseguridad: dado su entrenamiento declarado en este dominio, puede emplearse para revisar configuraciones o identificar patrones de riesgo en capturas de paneles de administración.

## Benchmarks y rendimiento

| Benchmark | MiMo-V2.6-Distill-Qwen-9B | Qwen3.5-9B (base) |
|---|---|---|
| SWE-bench Verified (avg@3) | 61,1 | 60,0 |

Los datos provienen del informe técnico de MiMo-V2.6 citado en la model card. Otras métricas mencionadas en dicho informe (MiMo Code, MiMo Visual Coding) corresponden a conjuntos de evaluación internos de los autores y no a leaderboards externos, por lo que no se incluyen aquí como comparación pública. No se han publicado resultados de MMLU, HumanEval o GSM8K en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 18,8 GB de pesos, más overhead de activaciones y caché KV; se recomienda un mínimo de 24 GB de memoria unificada para trabajar con comodidad.
- La variante 8-bit está pensada para máquinas de 16 GB y la variante 4-bit para máquinas de 8 GB, según indica el autor de la conversión.
- GPU recomendadas: al ser un formato MLX, está orientado a Apple Silicon (chips de la serie M). No se especifican GPU NVIDIA compatibles en la información disponible.
- Cabe en GPU de consumo Apple con al menos 24 GB de memoria unificada para la versión bf16; para equipos de 8 o 16 GB deben usarse las variantes cuantizadas.
- Opciones de despliegue: `mlx-vlm` (librería principal), y el servidor MLX-native compatible con la API de Anthropic del proyecto Claude Code Local.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato / disponibilidad | Notas |
|---|---|---|---|---|---|
| MiMo-V2.6-Distill-Qwen-9B (esta ficha, MLX bf16) | 9,4B | no disponible | MIT | safetensors MLX, 18,8 GB | Conversión bf16 con visión intacta para Apple Silicon |
| Qwen3.5-9B (base) | 9B | no disponible | no disponible en la información | safetensors | Base del modelo; 60,0 en SWE-bench Verified |
| MiMo-V2.6-Distill-Qwen-9B (original, Xiaomi) | 9,4B | no disponible | MIT | safetensors | Checkpoint fuente del que deriva esta conversión |

No se dispone de información sobre otros modelos comparables de la misma categoría (multimodales de ~9B para agente y código) en la documentación proporcionada.

## Limitaciones y advertencias

- El modelo puede cometer errores en la interpretación visual: el propio autor de la model card muestra un ejemplo en el que el modelo identifica correctamente la pose pero coloca los brazos en una posición baja en lugar de en guardia, lo que evidencia que no siempre acierta en detalles finos.
- Riesgo de alucinación inherente a los modelos generativos; no se han publicado evaluaciones específicas de tasa de alucinación en la información disponible.
- No se especifican los idiomas soportados ni el rendimiento multilingüe, por lo que no se puede garantizar un comportamiento adecuado fuera del inglés o de los idiomas presentes en los datos de entrenamiento.
- La longitud de contexto no está documentada, lo que dificulta planificar su uso en conversaciones o documentos largos.
- Aunque la licencia es MIT y permite uso comercial, el modelo se distribuye como conversión de un modelo de terceros; conviene verificar las condiciones de la licencia del checkpoint original y de la base Qwen3.5-9B antes de un despliegue en producción.
- El formato MLX limita su ejecución a hardware Apple Silicon; no es directamente desplegable en GPUs NVIDIA sin una conversión adicional.
- El soporte de tool calling y de modo de razonamiento extendido no está confirmado, lo que puede afectar a su uso en pipelines de agente complejos.

## Enlaces

- Repositorio Hugging Face de esta conversión: https://huggingface.co/divinetribe/MiMo-V2.6-9B-MLX-bf16
- Variante 8-bit: https://huggingface.co/divinetribe/MiMo-V2.6-9B-MLX-8bit
- Variante 4-bit: https://huggingface.co/divinetribe/MiMo-V2.6-9B-MLX-4bit
- Modelo original de Xiaomi: https://huggingface.co/XiaomiMiMo/MiMo-V2.6-Distill-Qwen-9B
- Organización Xiaomi MiMo: https://huggingface.co/XiaomiMiMo
- Modelo base Qwen3.5-9B: https://huggingface.co/Qwen/Qwen3.5-9B
- Librería mlx-vlm: https://github.com/Blaizzy/mlx-vlm
- Proyecto Claude Code Local: https://github.com/nicedreamzapp/claude-code-local
- Leaderboard Agent-12: https://nicedreamzapp.github.io/agent12/
- SWE-bench: https://www.swebench.com/
