# dkingtutcd/gemma-e4b-mutation-driven-5974

## Resumen

`dkingtutcd/gemma-e4b-mutation-driven-5974` es un fine-tuning del modelo Gemma 4 E4B instruction-tuned, publicado por el usuario dkingtutcd en HuggingFace. El modelo base es la variante cuantizada en 4 bits de Unsloth (`unsloth/gemma-4-E4B-it-unsloth-bnb-4bit`), sobre la que se ha realizado un ajuste fino y posteriormente se han subido los pesos en FP16. La model card es mínima y no documenta el dataset, el procedimiento de entrenamiento ni el propósito concreto del fine-tuning, más allá de indicar que se usó Unsloth y TRL.

El modelo conserva la pipeline `image-text-to-text`, lo que indica que mantiene capacidades multimodales (entrada de imagen y texto) heredadas de la familia Gemma 4. Los pesos suman aproximadamente 8.000 millones de parámetros en safetensors, con un repositorio de 16 GB, coherente con un checkpoint FP16. La licencia declarada es Apache 2.0.

La relevancia de esta ficha es limitada: se trata de un experimento de fine-tuning comunitario sin benchmarks publicados, sin documentación de datos y con cero descargas en el momento de la consulta. Resulta útil principalmente como ejemplo de flujo de trabajo Unsloth/TRL sobre Gemma 4 y como punto de partida para quien quiera reproducir o inspeccionar el ajuste, no como modelo listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (familia Gemma 4), detalles no disponibles |
| Parametros totales | 7.996.156.490 (~8B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | pesos publicados en FP16; el modelo base era bnb-4bit; otras cuantizaciones no disponibles |
| Idiomas soportados | en (inglés), según la model card |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura subyacente corresponde a Gemma 4 en su variante E4B, un transformer multimodal capaz de procesar entradas de imagen y texto (`image-text-to-text`). El autor no documenta la arquitectura interna, el número de capas, la configuración de atención ni si emplea mecanismos híbridos o de atención lineal. Tampoco se especifica la ventana de contexto nativa.

El entrenamiento consistió en un fine-tuning supervisado (SFT) sobre el checkpoint `unsloth/gemma-4-E4B-it-unsloth-bnb-4bit`, realizado con la librería Unsloth y TRL según la propia model card. No se indica el número de tokens de entrenamiento, la composición del dataset, si hubo etapas de RLHF/DPO adicionales ni hiperparámetros relevantes. El resultado se exportó a FP16 y se subió al repositorio. No hay información sobre innovations técnicas específicas de este fine-tuning.

## Capacidades

- Generación de texto conversacional en inglés, heredada del modelo base instruction-tuned.
- Procesamiento de imagen y texto combinados (pipeline `image-text-to-text`), lo que habilita tareas de descripción de imágenes y VQA básica.
- Razonamiento general y respuesta a instrucciones, en la medida en que el fine-tuning no lo haya degradado (no verificado).
- Soporte de tool calling / function calling: no documentado; probablemente heredado del modelo base, pero no confirmado.
- Capacidades de agente y razonamiento multi-paso: no documentadas.
- Capacidades multilingües: la model card declara únicamente inglés.
- Modo "thinking" u otras capacidades especiales: no documentadas.

## Casos de uso

- Experimentación con fine-tuning sobre Gemma 4: el modelo sirve como referencia de un pipeline Unsloth + TRL completo, útil para reproducir el flujo y comparar resultados con el checkpoint base.
- Investigación de ajustes "mutation-driven": dado el nombre del repositorio, puede emplearse para estudiar cómo afecta un fine-tuning agresivo o con datos sintéticos al comportamiento del modelo base.
- Prototipado de asistentes multimodales en inglés: al conservar la pipeline image-text-to-text, permite probar interacciones que combinan imagen y texto en entornos de desarrollo.
- Evaluación comparativa de checkpoints comunitarios: útil para medir la degradación o mejora respecto a `unsloth/gemma-4-E4B-it-unsloth-bnb-4bit` en tareas concretas.
- Base para nuevos fine-tunings: al estar en FP16 y con licencia Apache 2.0, puede reutilizarse como punto de partida en ajustes posteriores.
- Docencia y demostraciones: ejemplo didáctico de publicación de un modelo fine-tuned en HuggingFace con la plantilla estándar de Unsloth.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16: en torno a 16 GB solo para pesos, más overhead de activaciones y KV cache; se recomienda un mínimo de 20-24 GB.
- VRAM estimada en cuantización 8 bits: aproximadamente 8-10 GB de pesos.
- VRAM estimada en cuantización 4 bits: aproximadamente 4-6 GB de pesos.
- GPU recomendadas: A100 40/80 GB, H100 para despliegues de producción; RTX 4090 (24 GB) para FP16 en single-GPU; RTX 3090/4080 para cuantizaciones de 8 bits.
- Cabe en GPU de consumo: sí, en RTX 4090 en FP16 y en GPUs de 8-12 GB con cuantización 4 bits.
- Opciones de despliegue: transformers (librería declarada), text-generation-inference (tag `text-generation-inference`), vLLM y llama.cpp/Ollama previa conversión a GGUF (no se distribuye GGUF en el repositorio).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Multimodal | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| dkingtutcd/gemma-e4b-mutation-driven-5974 | ~8B | no disponible | sí (image-text-to-text) | apache-2.0 | HuggingFace, 0 descargas |
| unsloth/gemma-4-E4B-it-unsloth-bnb-4bit (base) | ~8B | no disponible | sí | según modelo Gemma 4 original | HuggingFace |
| Gemma 4 E4B-it (original) | ~8B | no disponible | sí | según términos de Google | HuggingFace / Vertex |

No se dispone de datos de rendimiento comparativos para este checkpoint.

## Limitaciones y advertencias

- No hay benchmarks publicados: se desconoce si el fine-tuning mejora o degrada las capacidades del modelo base.
- La model card no documenta el dataset de entrenamiento, por lo que no puede evaluarse el riesgo de sesgos introducidos ni la calidad de los datos.
- Riesgo de alucinación inherente a los modelos de ~8B, agravado por la falta de evaluación.
- Idiomas: solo se declara inglés; el rendimiento en castellano no está garantizado.
- Longitud de contexto no documentada; no debe asumirse la del modelo base sin verificación.
- El nombre "mutation-driven" sugiere un ajuste potencialmente agresivo; conviene validar el comportamiento antes de cualquier uso en producción.
- Licencia Apache 2.0 declarada por el autor, pero el modelo base Gemma 4 puede estar sujeto a términos adicionales de Google; conviene revisar la cadena de licencias antes de uso comercial.
- Cero descargas y cero likes en el momento de la consulta: sin validación por parte de la comunidad.
- El repositorio ocupa 16 GB; la descarga y el almacenamiento requieren planificación.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/dkingtutcd/gemma-e4b-mutation-driven-5974
- Modelo base: https://huggingface.co/unsloth/gemma-4-E4B-it-unsloth-bnb-4bit
- Unsloth (GitHub): https://github.com/unslothai/unsloth
- TRL (HuggingFace): https://github.com/huggingface/trl
- Documentación de Gemma: https://ai.google.dev/gemma
