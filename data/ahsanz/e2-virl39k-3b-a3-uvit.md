# Ahsanz/e2-virl39k-3b-a3-uvit

## Resumen

A3-uvit es un ajuste por aprendizaje por refuerzo del modelo multimodal Qwen2.5-VL-3B-Instruct, publicado por el usuario Ahsanz en Hugging Face. No es un modelo de propósito general: es un artefacto experimental de un estudio controlado sobre cómo el RL cambia el uso que un modelo visión-lenguaje hace de la evidencia visual. El checkpoint concreto corresponde al brazo entrenado con el objetivo VPPO (variante sin modelo de valor de PPO) y con la torre de visión entrenada, partiendo siempre de la misma base y los mismos datos que el resto de brazos del estudio.

El modelo tiene 4.065.787.904 parámetros totales (repositorio de 8,1 GB en safetensors, bf16) y hereda la arquitectura multimodal de Qwen2.5-VL: torre de visión más decoder de lenguaje, con pipeline `image-text-to-text`. El entrenamiento se hizo sobre ViRL39K (31.629 prompts de entrenamiento tras deduplicación, 1.000 reservados) durante 162 pasos, con semilla 1, AdamW, learning rate constante de 1e-6, batch global 128, batch de rollout 384 y 8 rollouts por prompt, usando un fork de EasyR1 (veRL).

Su relevancia es metodológica más que de producto: cada brazo del estudio ve los mismos datos durante los mismos pasos y solo difiere en el objetivo de RL y en si se entrena la torre de visión, lo que permite aislar el efecto. El propio autor advierte que un checkpoint aislado no constituye el resultado del estudio, que la precisión en benchmarks generales no era objetivo de entrenamiento y que la licencia es de solo investigación.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (familia Qwen2.5-VL): torre de visión más decoder de lenguaje, heredada de Qwen/Qwen2.5-VL-3B-Instruct |
| Parametros totales | 4.065.787.904 (dato real de los safetensors) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible en la información proporcionada |
| Tipos de cuantizacion | no disponible; el repositorio solo publica pesos en safetensors bf16 (no hay GGUF, AWQ ni GPTQ) |
| Idiomas soportados | no disponible en la información proporcionada |
| Licencia | qwen-research (Qwen Research License), solo investigación, no comercial; el texto completo se distribuye como `LICENSE` junto a los pesos |
| Formato de pesos | safetensors (bf16); repositorio de 8,1 GB; librería `transformers` |
| Modelo base | Qwen/Qwen2.5-VL-3B-Instruct |
| Pipeline | image-text-to-text |

## Arquitectura y entrenamiento

La arquitectura es la del modelo base Qwen2.5-VL-3B-Instruct, un transformer multimodal con torre de visión y decoder de lenguaje; el ajuste no introduce cambios estructurales, solo actualiza pesos. La innovación del checkpoint está en el procedimiento de entrenamiento: VPPO, la variante sin modelo de valor de PPO, aplicada con clip asimétrico estilo DAPO (0,2 / 0,28), sin penalización KL en la pérdida (la KL respecto a la base se registra solo como lectura), top-p de rollout 0,99, 8 rollouts por prompt y longitud máxima de respuesta de 2048 tokens. La torre de visión sí se entrena en este brazo.

Los datos son ViRL39K: 31.629 prompts de entrenamiento tras deduplicación y 1.000 reservados para evaluación. Se dieron 162 pasos con semilla 1, AdamW con learning rate constante de 1e-6 y sin warmup, batch global 128 y batch de rollout 384, en precisión bf16. El entrenamiento se ejecutó con un fork de EasyR1 (veRL). Toda la evaluación del estudio se hizo con decodificación greedy.

## Capacidades

- Generación de texto e imagen-a-texto: descripción de imágenes, respuesta a preguntas visuales y conversación multimodal multi-turno, en el formato `Qwen2_5_VLForConditionalGeneration` + `AutoProcessor`.
- Visual grounding: el modelo está entrenado específicamente sobre datos de grounding visual (etiqueta `visual-grounding`), orientado a localizar y referenciar elementos de la imagen.
- Razonamiento guiado por RL sobre evidencia visual: el objetivo del entrenamiento es modificar cómo el modelo usa la imagen, no ampliar su conocimiento general.
- Conversación multimodal: la etiqueta `conversational` indica uso en diálogo con imágenes intercaladas.
- Compatibilidad con tooling de despliegue: etiquetas `text-generation-inference` y `endpoints_compatible`, además de `transformers`.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Capacidades de agente y razonamiento multi-paso: no disponible; no se documentan explícitamente.
- Capacidades multilingües: no disponible en la información proporcionada.
- Capacidades especiales: no se documenta modo de pensamiento (thinking), audio ni vídeo para este checkpoint.

## Casos de uso

- Investigación sobre aprendizaje por refuerzo en modelos visión-lenguaje: comparar este brazo (VPPO, torre de visión entrenada) con los otros brazos del estudio bajo las mismas condiciones de datos, pasos y semilla, para aislar el efecto del objetivo de RL sobre el uso de la evidencia visual.
- Análisis de atribución numérica en figuras: el propio autor señala una caída en la capacidad de vincular un numeral con el elemento que etiqueta, lo que convierte a este checkpoint en material de estudio de ese fallo concreto y no en una herramienta de producción para leer gráficos.
- Evaluación de técnicas de grounding visual: usar los 1.000 prompts reservados de ViRL39K como conjunto de evaluación reproducible con decodificación greedy para medir localización de elementos.
- Reproducción de experimentos de RL multimodal: al documentarse optimizador, learning rate, tamaños de batch, rollouts, clip y precisión, sirve como referencia para replicar un pipeline VPPO sobre un modelo de 3B con EasyR1/veRL.
- Docencia y divulgación técnica: ilustrar en un aula o charla la diferencia entre mejora en métricas de precisión y cambio real en el comportamiento de grounding.
- Punto de partida para ablaciones propias: al ser un fine-tune de un modelo público y con licencia de investigación, permite partir de este checkpoint para estudiar, por ejemplo, el efecto de entrenar o congelar la torre de visión.
- No se recomienda su uso en atención al cliente, generación de código en producción ni ningún escenario comercial: la licencia es de solo investigación y no hay datos de rendimiento general publicados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

La model card indica explícitamente que la precisión en benchmarks generales no era un objetivo de entrenamiento y no se reporta. La evaluación del estudio se centró en cómo cambia el uso de la imagen, e incluye una observación cualitativa: se detectó una caída en la vinculación de un numeral con el elemento al que etiqueta, por lo que recomienda interpretar con cautela las salidas en tareas de lectura de figuras.

## Requisitos de hardware

- VRAM para inferencia en bf16 (estimación a partir de los 4,07B parámetros y los 8,1 GB de pesos): en torno a 9-12 GB contando pesos, caché KV y activaciones para imágenes de resolución moderada.
- Cuantización a 8 bits (estimación): aproximadamente 5-6 GB de VRAM; a 4 bits, en torno a 3-4 GB. No hay cuantizaciones publicadas en el repositorio, por lo que habría que generarlas con herramientas externas.
- GPU recomendadas: H100, A100 o L40S para servir varias peticiones concurrentes; RTX 4090, RTX 3090, A6000 o L4 para una sola instancia en bf16.
- Cabe en GPU de consumo: sí. En bf16 es cómodo en tarjetas de 16-24 GB (RTX 4090, RTX 4080, RTX 3090); en tarjetas de 12 GB conviene cuantizar a 8 bits y en 8 GB a 4 bits.
- Opciones de despliegue: `transformers` con `Qwen2_5_VLForConditionalGeneration` y `AutoProcessor` (ruta documentada por el autor); vLLM y Text Generation Inference son compatibles con Qwen2.5-VL según las etiquetas del repositorio (`text-generation-inference`, `endpoints_compatible`). No hay GGUF publicado, por lo que llama.cpp u Ollama requerirían conversión previa.
- Latencia y throughput: no disponible; no se publican mediciones en la información proporcionada. La evaluación del estudio se hizo con decodificación greedy y longitud máxima de respuesta de 2048 tokens.

## Comparativa con modelos similares

No hay resultados de benchmarks para este checkpoint, por lo que la comparación es únicamente de especificaciones y licencia.

| Modelo | Parametros | Contexto | Tipo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| A3-uvit (Ahsanz/e2-virl39k-3b-a3-uvit) | 4,07B | no disponible | Fine-tune por RL (VPPO) de Qwen2.5-VL-3B-Instruct, torre de visión entrenada | qwen-research (solo investigación) | Hugging Face, safetensors bf16, 0 descargas y 0 likes |
| Qwen2.5-VL-3B-Instruct | 3B (clase) | no disponible en la información proporcionada | Modelo multimodal base instruct | heredada según la model card del fine-tune (qwen-research); conviene verificar el repositorio original | Hugging Face, ampliamente desplegado |
| Qwen2.5-VL-7B-Instruct | 7B (clase) | no disponible en la información proporcionada | Modelo multimodal instruct de mayor tamaño | no disponible en la información proporcionada | Hugging Face |
| Otros VLM de ~2-4B (InternVL, SmolVLM, Phi-3.5-vision) | rango 2-4B | no disponible | Modelos multimodales instruct | no disponible | Hugging Face |

La diferencia relevante de A3-uvit no es de tamaño ni de contexto, sino de propósito: es un artefacto de investigación de 162 pasos de RL sobre un único dataset y una única semilla, no un modelo instruct listo para producción.

## Limitaciones y advertencias

- Licencia de solo investigación (Qwen Research License): queda prohibido el uso comercial sin autorización; el texto completo se distribuye como `LICENSE` junto a los pesos.
- El autor indica explícitamente que no es un modelo pensado para despliegue, sino un artefacto experimental para estudiar el efecto del RL sobre el grounding.
- Sesgos conocidos: no disponible; no se documentan análisis de sesgo.
- Riesgo de alucinación: no se publican evaluaciones de fidelidad ni de tasas de alucinación; en tareas de lectura de figuras el propio autor advierte de una caída en la vinculación entre numeral y elemento etiquetado.
- Limitaciones de contexto e idioma: no disponible en la información proporcionada.
- Generalización limitada: 162 pasos de RL sobre un único dataset (ViRL39K), con una sola semilla y sin warmup; es plausible que las capacidades generales del modelo base se hayan degradado, aunque no se publican mediciones que lo cuantifiquen.
- El resultado científico vive en la comparación entre brazos del estudio, no en este checkpoint aislado; usarlo de forma individual no reproduce la conclusión del trabajo.
- Longitud máxima de respuesta de 2048 tokens durante el entrenamiento, lo que puede limitar salidas largas.
- Ausencia de validación comunitaria: 0 descargas y 0 likes en el momento de la consulta, sin reportes externos de comportamiento.
- No hay cuantizaciones ni formatos GGUF publicados, lo que complica el despliegue en entornos de bajos recursos.
- La información de la model card debe verificarse antes de cualquier uso: los datos de entrenamiento, la licencia y el contexto no están completos en la ficha.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Ahsanz/e2-virl39k-3b-a3-uvit
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-VL-3B-Instruct
- Licencia del modelo base referenciada en la model card: https://huggingface.co/Qwen/Qwen2.5-VL-3B-Instruct/blob/main/LICENSE
- Repositorio del framework de entrenamiento EasyR1 (veRL): https://github.com/hiyouga/EasyR1
- Dataset ViRL39K: no se proporciona enlace específico en la información disponible
- La búsqueda web realizada no devolvió resultados relevantes sobre este modelo (solo páginas de soporte de Microsoft sin relación con el contenido).
