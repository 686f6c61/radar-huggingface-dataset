# PocketAiHub/Ornith-1.5-9B-Abliterated-MLX-4bit

## Resumen

Ornith-1.5-9B-Abliterated-MLX-4bit es un derivado experimental del modelo multimodal Ornith-1.5-9B, publicado por PocketAiHub bajo licencia MIT. El modelo base, desarrollado por el equipo Ornith (DeepReinforce), es parte de la familia Ornith-1.5 que abarca 9B, 35B y 397B de parámetros y se presenta como un sistema de auto-mejora continua: propone tareas, genera scaffolds específicos y produce rollouts para aprendizaje por refuerzo. Esta versión MLX ha sido convertida a cuantización 4-bit (RTN, grupo 64) y sometida a un proceso de abliteration, es decir, se ha eliminado la dirección de rechazo aprendida, con el objetivo de reducir las negativas explícitas ante peticiones dañinas.

La relevancia de este checkpoint radica en su doble naturaleza: por un lado, ofrece una versión eficiente y ejecutable en hardware Apple Silicon gracias a MLX; por otro, sirve como herramienta de investigación sobre el comportamiento de los modelos cuando se suprime el entrenamiento de rechazo. El modelo base presenta una arquitectura multimodal (imagen-texto-a-texto) basada en la familia Qwen3.5, con un contexto no especificado en la información disponible. La conversión MLX mantiene el vision tower sin cuantizar y elimina el MTP head nativo.

Es importante señalar que este es un derivado no oficial, experimental, y que la abilitación conlleva riesgos significativos: puede generar contenido dañino, ilegal, ofensivo o incorrecto con mayor facilidad que el modelo original. La model card del autor lo advierte explícitamente y recomienda una evaluación independiente y restricciones de uso.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (basada en Qwen3.5), con vision tower y atención lineal; modelo MoE (no se especifica número de expertos) |
| Parametros totales | 9B (modelo base); 1.855.937.776 en el checkpoint MLX 4-bit (según safetensors, cuantizado) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 4-bit RTN (grupo 64) en este repositorio; también 8-bit y BF16 en la misma familia |
| Idiomas soportados | no disponibles |
| Licencia | MIT |
| Formato de pesos | MLX (safetensors) |

## Arquitectura y entrenamiento

El modelo base Ornith-1.5-9B pertenece a la familia Ornith-1.5, que introduce un bucle de auto-mejora: el modelo propone nuevas tareas, genera scaffolds específicos y produce soluciones para entrenamiento por refuerzo. La arquitectura concreta no está documentada en la información proporcionada, pero las etiquetas indican que es un modelo multimodal basado en Qwen3.5, con atención lineal (linear attention) además de atención completa, y una torre de visión sin cuantizar. El checkpoint MLX elimina el MTP head (multi-token prediction) y mantiene el resto de módulos.

La abilitación se realizó sobre un checkpoint BF16 separado, midiendo una dirección de rechazo (harmful-minus-harmless) a partir de 256 prompts por clase en el límite de generación de asistente. La dirección se extrajo en la capa 23 y se aplicó a las capas 12–31, sobre las salidas de atención completa, atención lineal y proyecciones down del MLP, con escala 1.25 y preservación de norma por columna. Se modificaron 40 tensores. El proceso se describe en `abliteration-manifest.json`. La validación posterior mostró que el checkpoint 4-bit escala 1.25 eliminó por completo los flags de rechazo explícito en una pantalla de 100 prompts dañinos, aunque varios respuestas seguían redirigiendo o reformulando la petición.

## Capacidades

- Generación de texto multimodal: acepta imágenes y texto como entrada, y produce texto.
- Razonamiento matemático y lógico: el modelo base ha sido entrenado para tareas de razonamiento y la suite de capacidades de la validación incluye matemáticas y razonamiento.
- Generación de código: incluido en la suite de capacidades.
- Seguimiento de instrucciones y salida estructurada: la validación cubre instrucciones complejas y salida en formatos concretos.
- Capacidad multilingüe: la suite de capacidades incluye salida multilingüe, aunque no se especifican los idiomas exactos.
- Tool calling y agentes: no se menciona explícitamente; la model card no documenta soporte de function calling ni herramientas.
- Modo de pensamiento (thinking): no se indica si el modelo dispone de un modo de razonamiento explícito.
- Capacidades de visión: el vision tower pasó un smoke test básico, pero no hay evaluación profunda de visión, video ni contexto largo.

## Casos de uso

- Investigación sobre abilitación y alineación: este checkpoint es una herramienta para estudiar cómo la eliminación de la dirección de rechazo afecta al comportamiento, la utilidad y la seguridad de un modelo multimodal. Permite comparar respuestas con el modelo original.
- Generación creativa sin restricciones: el modelo puede producir textos creativos (ficción, guiones, diálogos) sin los rechazos típicos de los modelos alineados, lo que puede ser útil en entornos de investigación literaria o generación de contenido artístico.
- Análisis de contenido multimodal en entornos controlados: la capacidad de procesar imágenes y texto, junto con la reducción de rechazos, puede facilitar el análisis de imágenes complejas o sensibles en contextos de investigación con supervisión humana.
- Desarrollo de sistemas de diálogo con personalidad definida: al no tener un sesgo de rechazo fuerte, el modelo puede adoptar roles o personalidades específicas sin interrumpir la conversación, útil en prototipos de chatbots o asistentes virtuales.
- Evaluación de robustez y jailbreaks: sirve para probar técnicas de jailbreak y medir la resistencia de los modelos alineados frente a versiones abliteradas, lo que ayuda a diseñar mejores defensas.
- Entrenamiento de modelos de recompensa: el checkpoint puede usarse para generar datos de preferencia o para entrenar clasificadores de contenido dañino, ya que produce respuestas que no se autocensuran.

## Benchmarks y rendimiento

La model card proporciona resultados de validación interna, no benchmarks estándar como MMLU o HumanEval. Se presenta la siguiente tabla extraída de la validación:

| Prueba | Resultado |
|---|---|
| Suite de capacidades (escala 1.25) | 68/80 |
| Suite de capacidades (escala 1.0 anterior) | 69/80 |
| Suite de capacidades (BF16 sin tocar) | 70/80 |
| Pantalla dañina (escala 1.25) | 0/100 flags de rechazo explícito |
| Pantalla benigna | 0/100 flags de rechazo explícito |
| Smoke test de texto | pasado (`POCKETAI_OK`) |
| Smoke test de imagen | pasado (`red`) |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible.

## Requisitos de hardware

- El modelo está diseñado para Apple Silicon (MLX). Se ha validado con `mlx==0.32.0` y `mlx-vlm==0.6.8`.
- Pico de memoria MLX en el smoke test de imagen: 7.02 GB. Esto sugiere que puede ejecutarse en Macs con al menos 8 GB de RAM unificada, aunque para mayor comodidad se recomiendan 16 GB o más.
- No se reporta VRAM de GPU NVIDIA ni latencia, ya que MLX no está pensado para GPUs NVIDIA.
- Opciones de despliegue: mediante `mlx_vlm.generate` desde línea de comandos, o integración en aplicaciones Python con la librería MLX-VLM.
- No hay soporte para vLLM, llama.cpp u Ollama, porque es un formato MLX específico de Apple.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Multimodal | Licencia | Formato |
|---|---|---|---|---|---|
| Ornith-1.5-9B (base) | 9B | no disponible | Sí | MIT | safetensors (BF16) |
| Ornith-1.5-9B-Abliterated-MLX-4bit | 9B (cuantizado 1.86B) | no disponible | Sí | MIT | MLX 4-bit |
| Ornith-1.5-35B-A3B-Abliterated-MLX-4bit | 35B | no disponible | Sí | MIT | MLX 4-bit |

La comparativa se limita a los derivados de la misma familia, ya que no se dispone de datos de rendimiento de otros modelos multimodales de tamaño similar (como Qwen2.5-VL-7B o Llama-3.2-11B-Vision) en la información proporcionada. El modelo base y sus derivados comparten arquitectura y licencia, pero difieren en el formato y la modificación de abilitación.

## Limitaciones y advertencias

- Este checkpoint ha sido deliberadamente modificado para suprimir el comportamiento de rechazo aprendido. Puede generar contenido dañino, ilegal, ofensivo, engañoso o peligrosamente incorrecto con mayor facilidad que el modelo original.
- La abilitación no es entrenamiento de veracidad ni una mejora de capacidades. No garantiza cumplimiento universal ni respuestas correctas.
- Los resultados de la validación muestran que, aunque se eliminaron las frases explícitas de rechazo, varias respuestas seguían redirigiendo o reformulando la petición. No es un modelo totalmente sin censura.
- La suite de capacidades mostró una ligera degradación respecto al BF16 sin tocar (68/80 vs 70/80), lo que indica una pequeña pérdida de rendimiento.
- No se ha evaluado de forma exhaustiva la visión, el vídeo, el uso de herramientas ni el contexto largo. El smoke test de imagen es básico.
- La licencia MIT permite uso comercial, pero el autor recomienda encarecidamente una evaluación independiente y la imposición de restricciones de uso antes de desplegarlo en producción.
- El modelo no incluye el MTP head nativo, lo que puede afectar a la velocidad de generación.
- No se han publicado datos sobre sesgos, alucinación, o idiomas soportados; se recomienda precaución en entornos multilingües.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/PocketAiHub/Ornith-1.5-9B-Abliterated-MLX-4bit
- Modelo base: https://huggingface.co/ornith-ai/Ornith-1.5-9B
- Versión 8-bit: https://huggingface.co/PocketAiHub/Ornith-1.5-9B-Abliterated-MLX-8bit
- Versión BF16: https://huggingface.co/PocketAiHub/Ornith-1.5-9B-Abliterated-MLX-BF16
- Blog oficial de Ornith-1.5: https://ornith.ai/ornith_1_5.html
- Sitio web de Ornith AI: https://ornith.ai/
- Artículo de prensa sobre la familia Ornith-1.5: https://officechai.com/ai/deepreinforce-releases-open-source-orinth-1-5-family-of-models-with-solid-benchmarks-and-mit-license/
