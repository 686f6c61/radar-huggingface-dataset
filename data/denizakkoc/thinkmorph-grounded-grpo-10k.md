# denizakkoc/ThinkMorph-Grounded-GRPO-10k

## Resumen

ThinkMorph Grounded GRPO es un conjunto de checkpoints intermedios de adaptadores LoRA sobre el modelo multimodal ThinkMorph-7B, publicados por el usuario denizakkoc en Hugging Face. El modelo base ThinkMorph-7B es un modelo de 7.000 millones de parámetros con arquitectura multimodal (expertos separados de imagen y texto) orientado a tareas de razonamiento visual y grounding. Estos checkpoints se han entrenado con GRPO (Group Relative Policy Optimization) sobre el dataset ThinkMorph-Grounding-GRPO-10k, con el objetivo de mejorar la capacidad de localización y fundamentación de respuestas en imágenes.

El interés de esta publicación es principalmente metodológico: se trata de un experimento de ajuste por refuerzo con recompensas compuestas (imagen, texto y terminal) sobre un modelo multimodal, con pesos 1/1/4 respectivamente. Se publican dos checkpoints intermedios (update 100 y update 150) junto con el código de entrenamiento completo, lo que permite reproducir el proceso. No se trata de un modelo listo para producción, sino de material de investigación para estudiar el efecto del GRPO con grounding en modelos multimodales.

La relevancia actual reside en la creciente atención hacia el entrenamiento por refuerzo con verificación de recompensas en tareas multimodales, donde el grounding (la capacidad de señalar regiones concretas de la imagen) actúa como señal de recompensa verificable. El autor declara explícitamente que no se reclama mejora en benchmarks de held-out ni generalización.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Multimodal con expertos separados de imagen y texto (ThinkMorph-7B), adaptadores LoRA de rango 64, alpha 128 |
| Parámetros totales | 7B (modelo base); adaptadores LoRA: 322.961.408 parámetros |
| Parámetros activos | no disponible (no se especifica si el base es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (adaptadores en FP32) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | adaptadores nativos ThinkMorph en `adapters.pt` y `checkpoint.pt` (no safetensors, no GGUF, no PEFT estándar) |

## Arquitectura y entrenamiento

El modelo base ThinkMorph-7B emplea una arquitectura multimodal con expertos diferenciados para imagen y texto. Los adaptadores LoRA publicados se aplican tanto al experto de imagen como al de texto, con rango 64, alpha 128 y precisión FP32, sumando 322.961.408 parámetros por checkpoint. El entrenamiento se realizó con GRPO sobre el dataset ThinkMorph-Grounding-GRPO-10k, con 8 rollouts por pregunta y pesos de recompensa de 1 (imagen), 1 (texto) y 4 (terminal). Se utilizó un juez de grounding directo basado en Gemini para evaluar las respuestas. El entrenamiento se ejecutó en 16 GPUs H200.

Una innovación técnica destacable es la máscara de vocabulario del tokenizador, introducida a partir de la actualización 29: los IDs sin entrada en el tokenizador se excluyen de forma consistente del muestreo de texto y del cálculo de verosimilitud. Además, los checkpoints incluyen sidecars de RNG por rango y recibos de validación de recarga, lo que permite reanudar el entrenamiento de forma exacta. El checkpoint-100 procesó 1.600 preguntas y el checkpoint-150 procesó 2.400 preguntas (los recuentos incluyen grupos omitidos).

## Capacidades

- Generación de texto y razonamiento multimodal sobre imágenes, heredado del modelo base ThinkMorph-7B.
- Grounding visual: localización de regiones de imagen como parte del proceso de razonamiento, reforzado mediante GRPO.
- Razonamiento multi-paso con señal de recompensa verificable (juez de grounding basado en Gemini durante el entrenamiento).
- Soporte de adaptadores LoRA nativos para los expertos de imagen y texto de forma independiente.
- Reproducibilidad del entrenamiento mediante código incluido y sidecars de RNG.
- No se documentan capacidades de tool calling, function calling, agentes, audio ni thinking mode explícito.

## Casos de uso

- Investigación en RLHF/GRPO multimodal: los checkpoints permiten estudiar la evolución del aprendizaje entre las actualizaciones 100 y 150, comparando el efecto de los pesos de recompensa 1/1/4 sobre el comportamiento del modelo.
- Reproducción de experimentos de grounding: el código en `training_code/` y los recibos de validación permiten replicar el pipeline completo de entrenamiento y evaluación.
- Evaluación de adaptadores LoRA nativos: el cargador `evaluate.py` valida nombres de parámetros, formas y digests de política antes de la evaluación, útil para pipelines de verificación de adaptadores.
- Estudio de máscaras de vocabulario en modelos multimodales: la máscara introducida en la actualización 29 sirve como caso de estudio sobre cómo excluir IDs inválidos del muestreo y del scoring.
- Base para ajuste fino posterior: los adaptadores pueden servir como punto de partida para experimentos adicionales de GRPO con otras funciones de recompensa.
- Análisis de estabilidad del entrenamiento: los sidecars de RNG e historial de intentos fallidos permiten auditar la reproducibilidad y la estabilidad del proceso.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor declara explícitamente que esta release no reclama mejora en benchmarks de held-out ni generalización.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible para el modelo base completo; los adaptadores LoRA (1,29 GB en `adapters.pt`) requieren cargar el modelo base ThinkMorph-7B, que por su tamaño en FP16 necesitaría aproximadamente 14 GB de VRAM, aunque este dato no se confirma en la información proporcionada.
- GPU recomendadas: el entrenamiento se realizó en 16 GPUs H200; para inferencia no se especifican GPU concretas.
- Compatibilidad con GPU de consumo: no confirmada; dependería de la cuantización del modelo base, que no se documenta.
- Opciones de despliegue: no se mencionan vLLM, llama.cpp, Ollama ni TGI; el flujo nativo requiere el cargador específico de ThinkMorph y el paquete `thinkmorph_grpo` en `PYTHONPATH`.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye modelos comparables de la misma categoría (multimodales de 7B con grounding) ni datos de rendimiento que permitan una comparación rigurosa.

## Limitaciones y advertencias

- Son checkpoints intermedios de investigación, no modelos finales ni listos para producción.
- El autor declara explícitamente que no se reclama mejora en benchmarks de held-out ni generalización.
- Los adaptadores no son exportaciones PEFT estándar `from_pretrained`; requieren el cargador nativo de ThinkMorph y el paquete de entrenamiento específico.
- La licencia no está disponible, lo que impide confirmar si se permite uso comercial.
- Los idiomas soportados no están documentados.
- El dataset incluye ejemplos SFT reutilizados, según la model card del dataset.
- Los checkpoints completos retienen rutas de sistema de archivos originales y configuración histórica; reubicar archivos requiere una migración explícita de configuración.
- No se incluyen credenciales, imágenes de rollout generadas ni registros RPC del juez.
- Riesgo de alucinación y sesgos: no documentados en la información disponible, pero inherentes a modelos multimodales de 7B.
- La máscara de vocabulario del tokenizador debe preservarse al cargar los adaptadores para generación nativa; ignorarla altera el comportamiento del modelo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/denizakkoc/ThinkMorph-Grounded-GRPO-10k
- Dataset: https://huggingface.co/datasets/denizakkoc/ThinkMorph-Grounding-GRPO-10k
- Modelo base: https://huggingface.co/ThinkMorph/ThinkMorph-7B
- Repositorio de código de entrenamiento: https://github.com/DenizBilgeAkkoc/thinkmorph-grounded-grpo
