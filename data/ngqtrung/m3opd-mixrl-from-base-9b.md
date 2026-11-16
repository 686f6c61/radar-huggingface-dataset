# ngqtrung/M3OPD-MixRL-From-Base-9B

## Resumen

M3OPD-MixRL-From-Base-9B es un modelo multimodal de tipo image-text-to-text desarrollado por el usuario ngqtrung y publicado en Hugging Face. Se trata de un fine-tune de Qwen/Qwen3.5-9B obtenido mediante entrenamiento mixto con refuerzo (MixRL) directamente desde el modelo base, sin etapa previa de SFT, dentro del marco del paper M3OPD-Reasoner. El checkpoint publicado corresponde al paso 185 y el autor lo describe explícitamente como una línea base (baseline) y no como el modelo principal de la receta.

El modelo conserva la arquitectura, tokenizador, procesador y plantilla de chat de Qwen3.5-9B, con 9.409.813.744 parámetros totales y pesos en safetensors (repo de 18,8 GB). Su entrenamiento emplea GSPO (Group Sequence Policy Optimization) sobre todos los prompts del dataset M3OPD-RL-193K, aplicando los ajustes de los profesores de dominio y sin fase de SFT, lo que lo convierte en una referencia útil para estudiar el efecto del RL directo sobre un modelo base multimodal.

Es relevante ahora porque documenta una receta de destilación on-policy combinada con aprendizaje por refuerzo aplicada a razonamiento multimodal, un área activa de investigación. No obstante, al ser un baseline con cero descargas y sin benchmarks publicados en la información disponible, su interés es principalmente experimental y comparativo dentro de la colección M3OPD-Reasoner.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (hereda la de Qwen3.5-9B; detalles internos no disponibles) |
| Parametros totales | 9.409.813.744 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible en la model card; el ejemplo de despliegue usa `--max-model-len 40960` |
| Tipos de cuantizacion | no disponible (solo se publican pesos safetensors) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura de Qwen3.5-9B, un transformer multimodal con entrada de imagen y texto (pipeline image-text-to-text), y reutiliza su tokenizador, procesador y plantilla de chat nativa. No se especifican en la información disponible detalles sobre el número de capas, atención, mecanismos de visión ni innovaciones internas de la arquitectura base.

En cuanto al entrenamiento, M3OPD-MixRL-From-Base-9B se obtiene aplicando GSPO (Group Sequence Policy Optimization) directamente sobre Qwen3.5-9B usando todos los prompts de M3OPD-RL-193K (193.000 ejemplos de RL), con los ajustes de GSPO de los profesores de dominio y sin ninguna etapa de SFT. El checkpoint publicado es el paso 185. La receta completa combina destilación on-policy (los datasets M3OPD-SFT-1.35M y M3OPD-RL-193K) con aprendizaje por refuerzo, y todos los checkpoints están disponibles en la colección M3OPD-Reasoner. La evaluación y el entrenamiento se realizan con la plantilla de chat nativa de Qwen3.5, modo thinking activado, sin system prompt y con una línea de formato de respuesta tras la pregunta (por ejemplo, `Put your final answer within \boxed{}.`).

## Capacidades

- Generación multimodal image-text-to-text: procesa imágenes y texto como entrada y genera respuestas textuales.
- Razonamiento multimodal: el modelo está orientado a tareas de razonamiento que combinan información visual y textual.
- Modo thinking: el entrenamiento y la evaluación usan la plantilla nativa de Qwen3.5 con thinking habilitado.
- Formato de respuesta controlado: admite instrucciones de formato como encerrar la respuesta final en `\boxed{}`.
- Conversacional: la etiqueta `conversational` indica soporte de diálogo multi-turno mediante la plantilla de chat heredada.
- Compatibilidad con endpoints: etiquetado como `endpoints_compatible`.
- Tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible de forma explícita en la información proporcionada.
- Capacidades multilingües: no disponibles (los idiomas no se listan en la model card).

## Casos de uso

- Investigación en RL multimodal: sirve como línea base para medir el efecto de GSPO sin SFT frente a la receta completa de M3OPD-Reasoner, comparando checkpoints de la misma colección sobre los mismos prompts de M3OPD-RL-193K.
- Reproducción de experimentos de destilación on-policy: al publicarse junto a los datasets M3OPD-SFT-1.35M y M3OPD-RL-193K, permite reproducir y auditar la receta de entrenamiento mixto.
- Evaluación de razonamiento visual con formato estricto: útil para probar tareas donde la respuesta final debe ir en `\boxed{}`, como problemas de matemáticas o ciencia a partir de imágenes.
- Prototipado de asistentes sobre imágenes: al ejecutarse en Transformers, vLLM y SGLang con la misma plantilla de Qwen3.5, se puede desplegar rápidamente para experimentos de descripción y razonamiento sobre imágenes.
- Comparación de estrategias de alineamiento: permite contrastar RL directo desde el modelo base frente a pipelines con SFT previo, aislando la contribución de cada etapa.
- Docencia y análisis de recetas: como baseline documentado (paso 185), es útil en cursos o artículos que expliquen GSPO y destilación on-policy aplicadas a modelos multimodales de 9B.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Con 9,41B parámetros, en precisión completa (BF16) se requieren aproximadamente 18,8 GB solo para pesos, más overhead de KV cache y del procesador de visión; en cuantización de 8 bits rondaría los 9-10 GB y en 4 bits unos 5-6 GB, aunque estas cifras son estimaciones y no datos publicados por el autor.
- GPU recomendadas: no especificadas en la información disponible. Por tamaño, encaja en GPUs de 24 GB o más (RTX 4090, L40S, A100 40/80 GB, H100) para BF16.
- ¿Cabe en GPU de consumo? No hay confirmación oficial; con cuantización agresiva (4 bits) podría caber en GPUs de 8-12 GB, pero no se han publicado pesos GGUF ni cuantizados.
- Opciones de despliegue: el autor indica compatibilidad con Transformers, vLLM y SGLang, con el comando `vllm serve ngqtrung/M3OPD-MixRL-From-Base-9B --max-model-len 40960`. No se mencionan llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Modalidad | Licencia | Notas |
|---|---|---|---|---|---|
| M3OPD-MixRL-From-Base-9B | 9,41B | no disponible (ejemplo a 40.960) | image-text-to-text | Apache 2.0 | Baseline RL sin SFT, paso 185, sin benchmarks |
| Qwen/Qwen3.5-9B | 9B | no disponible | multimodal (base) | Apache 2.0 | Modelo base del que deriva; referencia directa |
| Otros checkpoints de la colección M3OPD-Reasoner | no disponible | no disponible | multimodal | no disponible | Receta completa con SFT + RL; comparación natural dentro de la colección |

No se dispone de datos de rendimiento para establecer una comparación cuantitativa con alternativas de la misma categoría.

## Limitaciones y advertencias

- Es un baseline experimental y no el modelo principal de la receta M3OPD-Reasoner; el autor lo indica explícitamente.
- No se han publicado benchmarks, por lo que no hay evidencia cuantitativa de su calidad frente al modelo base u otros checkpoints.
- Al entrenarse sin SFT previo, el formato de salida y la estabilidad conversacional pueden ser inferiores a los de la receta completa.
- Riesgo de alucinación: no evaluado en la información disponible; es esperable en modelos de razonamiento multimodal sin datos específicos de mitigación.
- Idiomas soportados no documentados; no se garantiza un comportamiento multilingüe homogéneo.
- Sesgos conocidos: no documentados en la model card.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero se heredan las condiciones y posibles avisos del modelo base Qwen3.5-9B; conviene revisar la licencia del modelo base antes de producción.
- El ejemplo de despliegue fija `--max-model-len 40960`, pero la longitud de contexto oficial del modelo no se declara en la model card.
- Repo con cero descargas y cero likes: no hay validación comunitaria ni informes de uso en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ngqtrung/M3OPD-MixRL-From-Base-9B
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- Dataset SFT: https://huggingface.co/datasets/ngqtrung/M3OPD-SFT-1.35M
- Dataset RL: https://huggingface.co/datasets/ngqtrung/M3OPD-RL-193K
- Colección M3OPD-Reasoner: https://huggingface.co/collections/ngqtrung/m3opd-reasoner-6aed5164d151b6643a1b3b2d
