# ranjitraut/dacpt-v2-gemma-3-2b

## Resumen

El modelo `ranjitraut/dacpt-v2-gemma-3-2b` es un adaptador LoRA (PEFT) diseñado para ajustar el modelo base `google/gemma-3-4b-it`, un LLM multimodal de Google DeepMind con 4 mil millones de parámetros. El nombre del repositorio sugiere una versión "2b", pero el adaptador se aplica sobre el modelo de 4B; no se especifica si se trata de un ajuste de dominio (dacpt podría referirse a "domain-adaptive continual pre-training") o de una variante experimental. El tamaño del repositorio (0,2 GB) indica que solo contiene los pesos del adaptador LoRA, no el modelo completo.

El modelo está publicado por el usuario `ranjitraut` y carece de documentación sustancial: la model card está prácticamente vacía, sin descripción, licencia, idiomas ni datos de entrenamiento. A pesar de ello, su interés radica en ser un ejemplo de adaptación eficiente de un modelo base reciente mediante LoRA, aunque su utilidad práctica está limitada por la falta de información y de validación.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre transformer Gemma 3 4B (base: google/gemma-3-4b-it) |
| Parametros totales | No disponible (el adaptador es pequeño; el modelo base tiene 4B) |
| Parametros activos | No disponible (no es un modelo MoE) |
| Longitud de contexto | No disponible (el modelo base soporta hasta 128K tokens, pero el adaptador no lo especifica) |
| Tipos de cuantizacion | No disponible (solo safetensors en el repositorio) |
| Idiomas soportados | No disponible (el modelo base de Gemma 3 soporta múltiples idiomas, pero no se indica para este adaptador) |
| Licencia | No disponible |
| Formato de pesos | safetensors (PEFT/LoRA) |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA (Low-Rank Adaptation) que se aplica sobre `google/gemma-3-4b-it`. Gemma 3 es una familia de modelos de Google DeepMind basada en la tecnología de Gemini, con una arquitectura transformer que incluye atención local deslizante (sliding window) alternada con atención global, y soporte para contextos largos (128K tokens). El modelo base de 4B tiene capacidades multimodales (visión y texto), aunque el adaptador no especifica si preserva esa multimodalidad.

El entrenamiento del adaptador se realizó mediante SFT (Supervised Fine-Tuning) según las etiquetas del repositorio, pero no se proporcionan datos sobre el conjunto de entrenamiento, el número de tokens, hiperparámetros ni el proceso de ajuste. El nombre "dacpt-v2" sugiere una segunda versión de un ajuste continuo adaptativo de dominio, pero no hay confirmación.

## Capacidades

- Generación de texto: el adaptador hereda la capacidad de generación del modelo base Gemma 3 4B, que incluye razonamiento, código y matemáticas, aunque no se ha verificado si el ajuste LoRA mantiene intactas esas habilidades.
- Soporte de tool calling: el modelo base Gemma 3 4B-it es compatible con function calling, pero no se ha confirmado para este adaptador.
- Capacidades multilingües: el modelo base soporta varios idiomas, pero no se documenta el alcance en el adaptador.
- Capacidades multimodales: el modelo base incluye visión (SigLip encoder), pero el adaptador no especifica si se ha preservado esa funcionalidad.
- No se ha reportado ningún modo de "thinking" o razonamiento extendido específico.

## Casos de uso

Dada la falta de documentación, los casos de uso son hipotéticos y dependen de la suposición de que el adaptador mantiene las capacidades del modelo base:

- Adaptación de dominio: si el nombre "dacpt" indica un ajuste continuo de dominio, el modelo podría usarse para especializarse en un corpus técnico o científico, mejorando la precisión en textos de ese campo.
- Fine-tuning ligero en producción: al ser un adaptador LoRA, se puede cargar sobre el modelo base con bajo coste de memoria, útil para personalizar chatbots o asistentes sin reentrenar todos los pesos.
- Experimentación con PEFT: sirve como ejemplo de cómo aplicar LoRA a Gemma 3 4B para desarrolladores que quieran replicar el proceso con sus propios datos.
- Generación de texto asistida: si se usa junto con el modelo base, puede generar respuestas coherentes en tareas de chat, aunque sin garantías de calidad sin validación.
- Investigación en eficiencia de adaptación: permite estudiar el impacto de un pequeño adaptador sobre un modelo grande en términos de rendimiento y sesgos.
- Despliegue en entornos con recursos limitados: al ser un adaptador pequeño, su inferencia es ligera, pero el modelo base subyacente requiere recursos de GPU moderados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay datos sobre MMLU, HumanEval, GSM8K ni otras métricas para este adaptador. Tampoco se han comparado con otros modelos.

## Requisitos de hardware

- El adaptador LoRA es muy pequeño (0,2 GB), por lo que la memoria adicional sobre el modelo base es mínima.
- El modelo base Gemma 3 4B requiere aproximadamente 8-10 GB de VRAM en fp16 para inferencia, dependiendo de la longitud de contexto.
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM, como NVIDIA RTX 3060/3070/4060, o GPUs profesionales como A100/H100 para mayor throughput.
- En una RTX 4090 (24 GB) se puede ejecutar con margen para contextos largos.
- Opciones de despliegue: vLLM, llama.cpp (si se convierte a GGUF), Ollama, o directamente con Transformers y PEFT.
- Latencia y throughput: no disponibles; dependen del hardware y de la longitud de contexto.

## Comparativa con modelos similares

No hay información suficiente para comparar este adaptador con otros modelos de la misma categoría. El único punto de referencia es el modelo base `google/gemma-3-4b-it`, que tiene 4B parámetros, contexto 128K y licencia Gemma Terms of Use (aunque el adaptador no declara su licencia). Otros adaptadores LoRA sobre Gemma 3 pueden existir, pero no se han localizado en la búsqueda. Por tanto, no disponible.

## Limitaciones y advertencias

- Documentación insuficiente: no hay descripción de uso, datos de entrenamiento, ni evaluación, lo que impide conocer su comportamiento real.
- Riesgo de alucinación: al ser un ajuste no validado, puede generar contenido inexacto o inventado.
- Sesgos no mitigados: el modelo base Gemma 3 puede tener sesgos, y el adaptador podría amplificarlos sin control.
- Licencia incierta: no se especifica la licencia del adaptador; el modelo base tiene términos de uso de Google que pueden restringir el uso comercial.
- Limitación de idiomas: no se conoce qué idiomas soporta el adaptador; probablemente depende del modelo base, pero no está confirmado.
- Riesgo de compatibilidad: al ser un adaptador LoRA, debe cargarse sobre el modelo base exacto; cualquier cambio en el base podría invalidarlo.
- No se recomienda su uso en producción sin una evaluación previa exhaustiva.

## Enlaces

- [HuggingFace: ranjitraut/dacpt-v2-gemma-3-2b](https://huggingface.co/ranjitraut/dacpt-v2-gemma-3-2b)
- [Gemma 3 Technical Report (arXiv)](https://arxiv.org/html/2503.19786v1)
- [Gemma — Google DeepMind](https://deepmind.google/models/gemma/)
- [Gemma 3 en Hugging Face](https://huggingface.co/docs/transformers/v5.0.0rc2/model_doc/gemma3)
- [GitHub - google-deepmind/gemma](https://github.com/google-deepmind/gemma)
