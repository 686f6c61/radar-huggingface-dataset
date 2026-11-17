# ngqtrung/M3OPD-Warmup-SFT-ImageSTEM-9B

## Resumen

M3OPD-Warmup-SFT-ImageSTEM-9B es un checkpoint intermedio de ajuste fino supervisado (SFT) publicado por el usuario ngqtrung como parte de la receta experimental del artículo M3OPD-Reasoner. Se trata de un ajuste de todos los parámetros (full-parameter SFT) del modelo base Qwen3.5-9B sobre el subconjunto de datos de imagen y STEM (carpeta `image_stem`) del dataset M3OPD-SFT-1.35M, concretamente en el paso 379 del entrenamiento. El modelo es multimodal, con pipeline `image-text-to-text`, y está pensado para razonamiento sobre imágenes y problemas científicos y técnicos.

Su relevancia es fundamentalmente metodológica: no es un modelo final de producción, sino un componente de una cadena de destilación on-policy. Según la model card, a partir de este checkpoint se aplica GSPO (optimización de política con recompensa a nivel de grupo) para obtener el profesor de calentamiento del dominio (M3OPD-Warmup-Teacher-*-9B), mientras que la receta principal del artículo prescinde del SFT. Por tanto, este checkpoint sirve para reproducir y comparar la variante con calentamiento frente a la receta sin SFT.

El modelo hereda la arquitectura, tokenizador, procesador y plantilla de chat de Qwen3.5-9B, con 9.409.813.744 parámetros totales y pesos en safetensors (repositorio de 18,8 GB). La licencia es Apache 2.0, la misma que el modelo base. No se han publicado datos de idiomas soportados ni resultados de benchmarks en la información disponible.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (hereda la de Qwen3.5-9B; detalles internos no disponibles) |
| Parámetros totales | 9.409.813.744 |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible en la model card; el ejemplo de despliegue usa `--max-model-len 40960` |
| Tipos de cuantización | no disponible (pesos publicados en safetensors sin cuantizar) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería transformers) |

## Arquitectura y entrenamiento

El modelo parte de Qwen3.5-9B y conserva su arquitectura, tokenizador, procesador y plantilla de chat, por lo que se ejecuta en los mismos entornos que el base (Transformers, vLLM, SGLang). El entrenamiento consiste en un ajuste fino supervisado de todos los parámetros sobre el subconjunto `image_stem` del dataset M3OPD-SFT-1.35M, orientado a razonamiento multimodal sobre imágenes y contenido STEM. El checkpoint publicado corresponde al paso 379 de esa ejecución de SFT.

La innovación metodológica no está en la arquitectura sino en la receta: este SFT actúa como calentamiento dentro de un pipeline de destilación on-policy con aprendizaje por refuerzo. A partir de este checkpoint se aplica GSPO para producir el profesor de calentamiento del dominio, y la receta principal del artículo M3OPD-Reasoner no utiliza SFT. El entrenamiento y la evaluación emplean la plantilla de chat nativa de Qwen3.5 con modo thinking activado, sin prompt de sistema y con una línea de formato de respuesta tras la pregunta (por ejemplo, `Put your final answer within \boxed{}.`). No se dispone de datos sobre número de tokens de entrenamiento, composición exacta del dataset ni uso de RLHF/DPO en esta fase.

## Capacidades

- Generación de texto y razonamiento multimodal imagen-texto, orientado a problemas STEM.
- Modo thinking activado por defecto en la plantilla de chat nativa.
- Respuestas con formato controlado mediante instrucciones de formato (por ejemplo, respuesta final en `\boxed{}`).
- Procesamiento de imágenes junto con texto gracias al procesador heredado de Qwen3.5-9B.
- Compatibilidad con endpoints (`endpoints_compatible`) y despliegue en vLLM y SGLang.
- Soporte de conversación multi-turno mediante la plantilla de chat del modelo base.
- Capacidades de tool calling, function calling y agentes: no disponibles en la información proporcionada.
- Cobertura multilingüe: no disponible.

## Casos de uso

- Reproducción de experimentos de destilación on-policy: sirve como punto de partida para aplicar GSPO y generar el profesor de calentamiento del dominio de imagen y STEM, tal como describe la receta del artículo.
- Estudio comparativo de recetas de entrenamiento: permite contrastar la variante con calentamiento SFT frente a la receta principal sin SFT del M3OPD-Reasoner.
- Razonamiento sobre figuras y diagramas científicos: el ajuste sobre el subconjunto `image_stem` lo hace adecuado para resolver preguntas que combinan imagen y texto en contextos de física, química, matemáticas o ingeniería.
- Evaluación de formato de respuesta estructurada: útil para probar pipelines que exigen la respuesta final delimitada (por ejemplo, en `\boxed{}`) y comparar la adherencia al formato tras el SFT.
- Investigación en ajuste fino completo de modelos multimodales de ~9B: al publicarse el checkpoint intermedio (paso 379), permite analizar la evolución del modelo durante el entrenamiento.
- Despliegue experimental en vLLM o SGLang: la model card incluye un comando de servicio con `--max-model-len 40960`, lo que facilita montar un endpoint de pruebas para validar el comportamiento del checkpoint antes de continuar la receta.
- Generación de datos sintéticos de razonamiento STEM a partir de imágenes: puede emplearse como generador en la construcción de datasets de destilación dentro del mismo pipeline.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en precisión nativa (BF16/FP16): aproximadamente 19 GB solo para pesos, más overhead de activaciones y caché KV; se recomienda al menos 24 GB.
- VRAM estimada en cuantización de 8 bits: alrededor de 10-11 GB para pesos; en 4 bits, alrededor de 5-6 GB (estimaciones, no verificadas por el autor).
- GPU recomendadas para servicio con contexto largo: A100 40/80 GB, H100, L40S; para pruebas con contexto moderado, RTX 4090 (24 GB) puede ser suficiente en BF16.
- GPU de consumo: cabe en RTX 4090 en BF16 con margen ajustado; en GPUs de 16 GB o menos requeriría cuantización, no documentada oficialmente para este checkpoint.
- Opciones de despliegue: Transformers, vLLM (`vllm serve ngqtrung/M3OPD-Warmup-SFT-ImageSTEM-9B --max-model-len 40960`) y SGLang, según la model card.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Modalidad | Licencia | Notas |
|---|---|---|---|---|---|
| M3OPD-Warmup-SFT-ImageSTEM-9B | 9,41B | no disponible (ejemplo con 40960) | imagen-texto | Apache 2.0 | Checkpoint intermedio de SFT (paso 379) de la receta M3OPD |
| Qwen3.5-9B (modelo base) | ~9B (no verificado en la información) | no disponible | según el base | Apache 2.0 | Modelo base sin el ajuste STEM; referencia directa |
| M3OPD-Warmup-Teacher-*-9B | ~9B | no disponible | imagen-texto | no disponible | Profesor de calentamiento derivado de este checkpoint vía GSPO |

No se dispone de datos de benchmarks ni de otros modelos comparables en la información proporcionada.

## Limitaciones y advertencias

- Es un checkpoint intermedio (paso 379 de SFT), no un modelo final; su calidad no representa la del pipeline completo M3OPD-Reasoner.
- No se han publicado evaluaciones de rendimiento, por lo que no hay evidencia cuantitativa de su calidad frente al modelo base.
- Riesgo de alucinación inherente a los modelos generativos; no se documentan mitigaciones específicas.
- Sesgos conocidos: no disponibles; al heredar de Qwen3.5-9B, podría arrastrar los sesgos del base, no documentados aquí.
- Idiomas soportados no especificados; no se garantiza un comportamiento multilingüe más allá del que ofrezca el modelo base.
- El uso previsto depende de la plantilla de chat nativa con thinking activado y sin prompt de sistema; desviarse de ese formato puede degradar los resultados.
- Licencia Apache 2.0, que permite uso comercial, pero conviene verificar las condiciones del modelo base Qwen3.5-9B y de los datasets empleados.
- No hay información sobre tool calling ni soporte de agentes; no debe asumirse en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ngqtrung/M3OPD-Warmup-SFT-ImageSTEM-9B
- Modelo base Qwen3.5-9B: https://huggingface.co/Qwen/Qwen3.5-9B
- Dataset M3OPD-SFT-1.35M: https://huggingface.co/datasets/ngqtrung/M3OPD-SFT-1.35M
- Dataset M3OPD-RL-193K: https://huggingface.co/datasets/ngqtrung/M3OPD-RL-193K
- Colección M3OPD-Reasoner: https://huggingface.co/collections/ngqtrung/m3opd-reasoner-6aed5164d151b6643a1b3b2d
