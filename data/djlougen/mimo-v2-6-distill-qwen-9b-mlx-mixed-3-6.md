# DJLougen/MiMo-V2.6-Distill-Qwen-9B-MLX-mixed-3-6

## Resumen

Este repositorio contiene una conversión al formato MLX del modelo `XiaomiMiMo/MiMo-V2.6-Distill-Qwen-9B`, publicada por el usuario DJLougen con la receta `mixed_3_6` de mlx-vlm 0.7.2. No es un reentrenamiento: es una cuantización mixta (módulos a 3 bits y a 6 bits) con empaquetado affine y tamaño de grupo 64 sobre los pesos originales, pensada para el stack MLX de Apple y, según la model card, también ejecutada con la rueda CUDA 13 de mlx sobre una NVIDIA GB10.

El modelo base es un ajuste supervisado (SFT) de `Qwen/Qwen3.5-9B` sobre datos de agente generados por MiMo, que cubren código, tareas generales de agente, coding visual y ciberseguridad. La arquitectura es `Qwen3_5ForConditionalGeneration` (`model_type: qwen3_5`), con 9.409.813.744 parámetros, 32 capas de texto, atención completa cada cuatro capas, una torre de visión de profundidad 27 y una ventana de contexto configurada de 262.144 tokens.

Su interés es práctico: reduce el checkpoint a unos 5,9 GB de pesos, lo que permite ejecutarlo en equipos de gama alta con suficiente memoria, a cambio de una pérdida de calidad que el propio autor documenta solo parcialmente mediante pruebas de humo. La licencia no está declarada ni en este repositorio ni en la model card del checkpoint original, lo que limita su uso comercial sin una aclaración previa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3_5ForConditionalGeneration (`model_type: qwen3_5`); transformer con atención completa cada 4 capas y torre de visión Qwen3.5 |
| Parametros totales | 9.409.813.744 (9,41 mil millones) |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | 262.144 tokens (contexto configurado en `config.json`) |
| Tipos de cuantizacion | MLX affine mixta: 3 bits y 6 bits, tamaño de grupo 64; torre de visión y módulos multimodales en BF16; 5,018 bits por peso declarados por el conversor (mlx-vlm 0.7.2) |
| Idiomas soportados | no disponible |
| Licencia | no disponible (el checkpoint original tampoco declara licencia) |
| Formato de pesos | safetensors MLX (1260 tensores en las builds mixtas, frente a 760 en BF16) |

## Arquitectura y entrenamiento

La arquitectura corresponde a la familia Qwen3.5: en texto, 32 capas con dimensión oculta 4096, 16 cabezas de consulta y 4 cabezas de clave/valor (GQA con ratio 4:1), y atención completa aplicada cada cuarta capa. La torre de visión es la de Qwen3.5, con profundidad 27, dimensión oculta 1152 y parche de 16. La plantilla de chat es la de MiMo v2.6, distribuida en `chat_template.jinja`. El entrenamiento del modelo base, según la model card, consiste en un ajuste supervisado de `Qwen/Qwen3.5-9B` sobre datos de agente generados por MiMo (código, tareas generales de agente, coding visual y ciberseguridad); no hay información disponible sobre número de tokens, composición exacta del dataset ni uso de RLHF o DPO.

La innovación de este repositorio es exclusivamente la cuantización. Se aplicaron predicados internos de mlx-vlm, no una búsqueda de sensibilidad: 22 módulos reciben 6 bits y 228 reciben 3 bits. Los 22 módulos de mayor precisión son `embed_tokens`, `lm_head`, el `down_proj` de las capas 0, 1, 2, 3, 6, 9, 12, 15, 18, 21, 24, 27, 28, 29, 30 y 31, y el `v_proj` de las capas de atención completa 3, 15, 27 y 31. El predicado omite los módulos multimodales, de modo que la torre de visión permanece en BF16. El campo `quantization.bits` de nivel superior es 4 (valor por defecto de mlx-vlm) y no refleja lo aplicado: lo que manda son las entradas `bits` por módulo. La conversión se hizo con mlx-vlm 0.7.2 y mlx 0.32.2 (rueda CUDA 13) en una máquina `spark-d500` con NVIDIA GB10, y los cuatro shards de origen coincidieron con los hashes SHA-256 de LFS del Hub antes de convertir.

## Capacidades

- Generación de texto conversacional multilingüe: la model card no declara idiomas soportados, por lo que la cobertura real no está documentada.
- Razonamiento aritmético básico: en la prueba de humo resuelve correctamente el 15 % de 240.
- Modo de pensamiento (`enable_thinking`): la plantilla de chat admite activarlo o desactivarlo; con las builds `mixed-3-6` y `mixed-3-8` el modelo emitió un bloque de pensamiento incluso cerrando la etiqueta, lo que sugiere degradación por cuantización en ese aspecto.
- Entrada de imagen y texto (`image-text-to-text`): la torre de visión se conserva en BF16; la prueba con imagen se ejecutó únicamente en la build `mixed-4-6`, que respondió correctamente el color de un cuadrado rojo de 64x64 píxeles.
- Tareas de agente y multi-step: el modelo base se ajustó sobre datos de agente, pero esta ficha no documenta soporte explícito de tool calling ni de function calling.
- Coding visual y ciberseguridad: son dominios declarados en el dataset de ajuste del modelo base, sin métricas publicadas que los respalden.
- Generación de código: atribuible al modelo base por su ajuste sobre datos de código, sin evaluación publicada en este repositorio.

## Casos de uso

- Inferencia local en Apple Silicon: cargar el modelo con `mlx-vlm` para tareas de texto e imagen en un Mac con memoria unificada suficiente, aprovechando que los pesos ocupan unos 5,9 GB.
- Prototipado rápido de asistentes multimodales: usar la plantilla de chat de MiMo v2.6 con `num_images=1` y una ruta de imagen para responder preguntas sobre capturas o diagramas simples, sin montar infraestructura de servidor.
- Evaluación comparativa de recetas de cuantización: el repositorio forma parte de una familia de builds (`mixed-3-5`, `mixed-3-8`, `mixed-4-6`, `mixed-4-8`, `bf16`) generadas desde el mismo checkpoint de origen, lo que permite medir el impacto de cada receta sobre una misma tarea.
- Tareas de razonamiento con contexto largo: la ventana configurada de 262.144 tokens permite procesar documentos extensos, siempre que la memoria disponible lo admita y se valide la calidad tras la cuantización a 3 bits.
- Generación de código en local: usar el modelo como asistente de autocompletado o revisión en un entorno de desarrollo sin conexión, dado el ajuste sobre datos de código del modelo base.
- Investigación sobre degradación por cuantización: reproducir el prompt de humo (`What is 15% of 240? Answer with the number only.`) y comparar formatos de salida entre builds para estudiar cómo afecta el ancho de bits a los artefactos de plantilla.
- Conversión y verificación de pipelines MLX: servir como caso de prueba para validar la conversión de un checkpoint multimodal de 9B a safetensors MLX con grupo 64 y modo affine.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que no se ejecutó perplejidad ni benchmark alguno, y que las tasas de decodificación y el pico de memoria no se reportaron. Lo único documentado son pruebas de humo con generación greedy (`max_tokens=64`, `temperature=0.0`), con el prompt de texto `What is 15% of 240? Answer with the number only.` y, solo en la build `mixed-4-6`, un prompt de imagen sobre un PNG rojo sólido de 64x64.

| Build | Tipo de entrada | Resultado | Salida |
|---|---|---|---|
| `bf16` | texto | correcto | `36` |
| `mixed-3-5` | texto | correcto | `<value>36</value>` |
| `mixed-3-6` (este repositorio) | texto | correcto con artefacto | bloque de pensamiento y después `36` |
| `mixed-3-8` | texto | correcto con artefacto | bloque de pensamiento y después `36` |
| `mixed-4-6` | texto | correcto | `36` |
| `mixed-4-6` | imagen | correcto | `Red` |
| `mixed-4-8` | texto | correcto | `36` |

## Requisitos de hardware

- Tamaño de pesos: 5,9 GB de repositorio declarados; el conversor reporta 5,018 bits por peso.
- VRAM estimada para inferencia: no disponible. La model card no publica picos de memoria ni tasas de decodificación, y la memoria pico quedó contaminada por el proceso BF16 en ejecución.
- GPU empleada en la validación: NVIDIA GB10 (máquina `spark-d500`), con `device gpu:0` y mlx-vlm 0.7.2 sobre rueda CUDA 13.
- Encaje en GPU de consumo: no confirmado. Por tamaño de pesos es plausible en GPUs con 8-12 GB o más, pero no hay medición publicada ni margen documentado para caché KV en contextos largos.
- Opciones de despliegue: `mlx-vlm` es la vía documentada (incluye ejemplo de carga y generación con `apply_chat_template`). El formato safetensors MLX no es directamente compatible con llama.cpp, Ollama, vLLM o TGI; para esas herramientas habría que partir de otro formato de pesos, por ejemplo un GGUF derivado del checkpoint original.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este repositorio (`mixed-3-6`) | 9.409.813.744 | 262.144 | MLX affine mixta 3/6 bits, grupo 64 | no disponible | HuggingFace, 0 descargas |
| `XiaomiMiMo/MiMo-V2.6-Distill-Qwen-9B` (origen) | 9.409.813.744 | 262.144 (config del origen) | BF16 | no disponible | HuggingFace |
| `Qwen/Qwen3.5-9B` (base del ajuste) | 9B según nombre del checkpoint | no disponible | BF16 y variantes propias | no disponible | HuggingFace |
| Builds hermanas `mixed-3-5`, `mixed-3-8`, `mixed-4-6`, `mixed-4-8` | 9.409.813.744 | 262.144 | MLX affine mixta, grupo 64 | no disponible | HuggingFace, mismo autor |

## Limitaciones y advertencias

- Licencia sin declarar: ni este repositorio ni la model card del checkpoint original especifican licencia, por lo que el uso comercial queda en un limbo legal.
- Repositorio no oficial: se trata de una conversión de un tercero, con 0 descargas y 0 likes, sin revisión independiente.
- Degradación observable por cuantización: las builds `mixed-3-6` y `mixed-3-8` emitieron un bloque de pensamiento pese a cerrar la etiqueta, y `mixed-3-5` envolvió la respuesta en etiquetas `<value>`. Son diferencias de calidad en un único prompt, no fallos de carga.
- Sin benchmarks ni perplejidad: no hay métricas objetivas de calidad más allá de las pruebas de humo.
- Riesgo de alucinación: no cuantificado en la información disponible; es esperable el comportamiento típico de un modelo de 9B ajustado por SFT.
- Idiomas: la cobertura lingüística no está documentada.
- Contexto frente a memoria: los 262.144 tokens son un valor de configuración; no se ha verificado que se puedan alcanzar con esta cuantización en hardware concreto.
- Artefactos de plantilla: el uso correcto depende de respetar la plantilla de chat de MiMo v2.6 y el parámetro `enable_thinking`; un formato incorrecto produce salidas contaminadas.
- Precisión mixta no uniforme: el campo `quantization.bits` de nivel superior vale 4 por defecto de mlx-vlm, lo que puede inducir a error si se lee sin inspeccionar los valores por módulo.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/DJLougen/MiMo-V2.6-Distill-Qwen-9B-MLX-mixed-3-6
- Modelo base: https://huggingface.co/XiaomiMiMo/MiMo-V2.6-Distill-Qwen-9B
- Base del ajuste supervisado: https://huggingface.co/Qwen/Qwen3.5-9B
- Revision del checkpoint de origen citada en la conversión: `f2773fb482ac3dd047a4af4003b86e56b7225d0d`
- Resultados de las pruebas de humo: `smoke-results.json` en el propio repositorio
- Busqueda web: no se han encontrado enlaces relevantes sobre este modelo; los resultados devueltos corresponden a páginas de ayuda de YouTube TV y no guardan relación con el contenido de esta ficha.
