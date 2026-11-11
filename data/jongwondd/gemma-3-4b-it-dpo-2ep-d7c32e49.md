# Jongwondd/Gemma-3-4B-IT-DPO-2ep-d7c32e49

## Resumen

Gemma-3-4B-IT-DPO-2ep-d7c32e49 es un adaptador LoRA de investigación publicado por el usuario Jongwondd sobre el modelo base google/gemma-3-4b-it. No es un modelo autónomo, sino un ajuste fino mediante DPO (Direct Preference Optimization) orientado a un objetivo específico de entrenamiento en negación, entrenado durante dos épocas completas sobre el conjunto de datos PopQA. El adaptador se distribuye sin fusionar con los pesos base, con rango LoRA 16 y alpha 32, y está pensado exclusivamente para experimentación académica.

El modelo hereda la arquitectura multimodal de Gemma 3 (transformer decoder con capacidad de entrada imagen-texto) y el contexto del modelo base de Google. Su relevancia es limitada: se trata de un checkpoint de investigación con cero descargas y cero likes en el momento de la ficha, sin resultados de evaluación publicados y sin validación de seguridad para producción. Resulta útil únicamente como material de estudio sobre técnicas de alineación DPO aplicadas a tareas de negación.

La model card es explícita al respecto: no incluye pesos del modelo base ni tokenizadores, no aporta métricas de evaluación y advierte que las salidas pueden ser incorrectas, sesgadas, malformadas o repetitivas. Cualquier uso en producción requeriría una evaluación independiente y exhaustiva.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder multimodal (Gemma 3), adaptador LoRA sobre modelo base |
| Parámetros totales | No disponible (adaptador LoRA; el base google/gemma-3-4b-it tiene ~4B) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en la información proporcionada (heredada del base Gemma 3 4B-IT) |
| Tipos de cuantización | No disponible (el adaptador se distribuye en safetensors; la cuantización depende del despliegue del base) |
| Idiomas soportados | Inglés (en) |
| Licencia | Gemma (términos de la licencia Gemma de Google) |
| Formato de pesos | safetensors (adaptador PEFT/LoRA, sin fusionar) |

## Arquitectura y entrenamiento

El adaptador se aplica sobre google/gemma-3-4b-it, un transformer decoder multimodal de Google capaz de procesar entradas de imagen y texto (pipeline image-text-to-text). El ajuste emplea DPO con inicialización desde el modelo base limpio, sin continuación de un checkpoint previo. La configuración LoRA usa rango 16, alpha 32 y dropout 0, y el entrenamiento se realizó sobre el split de entrenamiento de PopQA con 14.951 pares y 4.534 casos, completando 2 épocas (29.902 ejemplos vistos, 1.890 pasos de optimizador).

Los bytes de los pesos no se han modificado respecto al adaptador original (SHA-256 `d7c32e49...`); solo se ha hecho portable el localizador del modelo base en la configuración PEFT. El hash del resumen de la fuente, el hash de los datos de entrenamiento y los detalles del objetivo específico del método están en `training_provenance.json`. El autor advierte que las pérdidas de entrenamiento no son puntuaciones de evaluación y que los experimentos mecanicistas asociados están separados de esta publicación.

## Capacidades

- Generación de texto y razonamiento heredados del modelo base Gemma 3 4B-IT.
- Procesamiento de entradas imagen-texto (pipeline image-text-to-text), según el modelo base.
- Ajuste específico orientado a comportamiento de negación (tag "negation"), fruto del entrenamiento DPO sobre PopQA.
- Soporte de tool calling y function calling: no disponible en la información proporcionada (depende del modelo base).
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: limitadas al inglés según los metadatos del modelo.
- Capacidades especiales (thinking mode, audio): no disponible en la información proporcionada.

## Casos de uso

- Investigación sobre alineación DPO: el adaptador sirve como referencia reproducible para estudiar el efecto de DPO con dos épocas sobre un modelo multimodal de 4B en tareas de negación, usando el hash de procedencia incluido para verificar la configuración.
- Estudio de comportamiento de negación: permite analizar cómo un ajuste DPO sobre PopQA modifica las respuestas negativas del modelo base en preguntas de conocimiento factual, comparando con el base sin adaptador.
- Reproducción de experimentos académicos: el `training_provenance.json` facilita replicar el pipeline (PopQA, 14.951 pares, rango 16, alpha 32) y contrastar resultados con las líneas base SFT/UL/DPO mencionadas por el autor.
- Evaluación comparativa de adaptadores LoRA: útil para medir el impacto de un adaptador de bajo rango sobre el rendimiento del base en tareas de imagen-texto, siempre con conjuntos de test independientes.
- Docencia y formación: ejemplo práctico de carga de un adaptador PEFT sobre un modelo multimodal con `PeftModel.from_pretrained` y gestión de revisiones del base.
- Análisis de robustez y seguridad: al no estar validado para producción, sirve para estudiar modos de fallo (salidas malformadas, repetitivas o sesgadas) en modelos ajustados con DPO.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente que esta subida no añade resultados de evaluación y que no se reclama reproducir las cifras del manuscrito asociado.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma específica; depende del modelo base google/gemma-3-4b-it y de la cuantización elegida. Como referencia orientativa, un modelo de ~4B parámetros en bf16 requiere del orden de 8-10 GB de VRAM solo para pesos, más overhead de activaciones y del procesador de imagen.
- GPU recomendadas: no disponible en la información proporcionada. Por tamaño del base, cabría esperar GPUs de 16 GB o más en bf16, y GPUs consumer de 8-12 GB con cuantización, pero el autor no aporta datos.
- Cabe en GPU consumer: no confirmado por el autor; depende del base y de la cuantización.
- Opciones de despliegue: carga mediante Transformers + PEFT (según el ejemplo de la model card con `Gemma3ForConditionalGeneration` y `PeftModel`). Otras opciones (vLLM, llama.cpp, Ollama, TGI) no están documentadas para este adaptador y requerirían fusionar el adaptador con el base.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tipo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Gemma-3-4B-IT-DPO-2ep-d7c32e49 (este) | Adaptador LoRA sobre ~4B | No disponible | Adaptador DPO de investigación | Gemma | Hugging Face, 0 descargas |
| google/gemma-3-4b-it | ~4B | No disponible en esta ficha | Modelo base multimodal IT | Gemma | Hugging Face (oficial) |
| Adaptadores DPO de la misma familia (SFT/UL/DPO citados por el autor) | No disponible | No disponible | Runs distintos, no checkpoints ALiT | No disponible | No disponible |

No se dispone de datos de rendimiento comparativo entre estas alternativas en la información proporcionada.

## Limitaciones y advertencias

- No es un modelo autónomo: requiere descargar y cargar el base google/gemma-3-4b-it (revisión `093f9f388b31de276ce2de164bdc2081324b9767`) y aplicar el adaptador con PEFT.
- No incluye pesos del modelo base ni tokenizadores; debe usarse el tokenizer/processor y la plantilla de chat del upstream.
- Sin resultados de evaluación publicados: el autor no reclama reproducir las cifras del manuscrito y advierte que los splits de evaluación previos son datos de desarrollo, no test independiente.
- Las puntuaciones proxy basadas en reglas, si se reportan en otro lugar, no equivalen a precisión de un juez semántico.
- Checkpoint de investigación sin validación de seguridad: las salidas pueden ser incorrectas, sesgadas, malformadas o repetitivas.
- Idiomas: solo inglés según los metadatos; no se garantiza calidad en castellano ni en otros idiomas.
- Licencia Gemma: se aplican los términos y restricciones de uso de Google para el modelo base; revisar `LICENSE`, `NOTICE` y `USE_POLICY.md`.
- No se implica afiliación ni respaldo del proveedor del modelo base.
- La paridad de descarga e inferencia desde el Hub público no está garantizada por el autor; solo se comprobó localmente el parseo de la configuración del adaptador.

## Enlaces

- Hugging Face del adaptador: https://huggingface.co/Jongwondd/Gemma-3-4B-IT-DPO-2ep-d7c32e49
- Modelo base: https://huggingface.co/google/gemma-3-4b-it
- Repositorio PEFT: https://github.com/huggingface/peft
- Repositorio Transformers: https://github.com/huggingface/transformers
- Paper de DPO: https://arxiv.org/abs/2305.18290
- Dataset PopQA: https://huggingface.co/datasets/akariasai/PopQA
- Licencia Gemma: https://ai.google.dev/gemma/terms
