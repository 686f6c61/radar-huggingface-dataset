# administraktor/gemma_3n_lora

## Resumen

El modelo `administraktor/gemma_3n_lora` es un adaptador LoRA (Low-Rank Adaptation) entrenado sobre el modelo base `unsloth/gemma-3n-e4b-it-unsloth-bnb-4bit`, una versión cuantizada en 4 bits de Gemma 3n, la familia de modelos abiertos de Google DeepMind optimizada para dispositivos de borde. El autor, identificado como "administraktor", publicó este adaptador bajo licencia Apache 2.0, con un tamaño de repositorio de 0,1 GB, lo que indica que se trata únicamente de los pesos del adaptador, no del modelo completo.

Gemma 3n se caracteriza por su arquitectura MatFormer con Per-Layer Embedding (PLE) y caching de parámetros, diseñada para reducir el consumo de memoria y computación en entornos con recursos limitados. Este LoRA, entrenado con las librerías Unsloth y TRL, pretende adaptar el comportamiento del modelo base a una tarea o dominio específico, aunque la model card no detalla el propósito del fine-tuning. Su relevancia radica en que permite personalizar un modelo eficiente de 4.000 millones de parámetros sin necesidad de reentrenar toda la red, lo que lo hace atractivo para prototipado rápido y despliegue en hardware modesto.

La información pública es escasa: no se especifican datos de entrenamiento, métricas de evaluación ni casos de uso previstos. Por tanto, esta ficha se basa en las características conocidas del modelo base Gemma 3n y en las convenciones habituales de los adaptadores LoRA, marcando explícitamente los datos no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MatFormer (modelo base Gemma 3n) con adaptador LoRA |
| Parametros totales | no disponible (el adaptador LoRA tiene ~0,1 GB; el modelo base tiene 4B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 32.768 tokens (según especificaciones de Gemma 3n; no confirmado para este adaptador) |
| Tipos de cuantizacion | El modelo base usa bnb-4bit; el adaptador LoRA se distribuye en safetensors sin cuantización adicional |
| Idiomas soportados | en (inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador LoRA) |

## Arquitectura y entrenamiento

El adaptador LoRA se entrena sobre `unsloth/gemma-3n-e4b-it-unsloth-bnb-4bit`, que es una versión de Gemma 3n con 4.000 millones de parámetros, cuantizada en 4 bits mediante bitsandbytes. Gemma 3n emplea la arquitectura MatFormer, una variante de transformer con Per-Layer Embedding (PLE) que permite cachear parámetros por capa y reducir los requisitos de memoria durante la inferencia. Esta arquitectura está diseñada para ejecutarse en dispositivos de borde como teléfonos y portátiles.

El entrenamiento del adaptador se realizó con las librerías Unsloth y TRL (Transformers Reinforcement Learning). Unsloth optimiza el fine-tuning mediante kernels personalizados que aceleran el entrenamiento hasta 2 veces, mientras que TRL proporciona utilidades para entrenamiento con supervisión y RLHF. No se han publicado detalles sobre el dataset utilizado, el número de pasos, la tasa de aprendizaje ni el método de fine-tuning (SFT, DPO, etc.). La model card solo indica que el modelo fue "entrenado 2x más rápido con Unsloth".

## Capacidades

- Generación de texto en inglés: al ser un adaptador sobre Gemma 3n instruct, hereda la capacidad de generar texto coherente y seguir instrucciones.
- Razonamiento y comprensión: el modelo base Gemma 3n está entrenado para tareas de razonamiento, matemáticas y comprensión lectora, capacidades que el LoRA puede ajustar a un dominio específico.
- Soporte de tool calling: Gemma 3n incluye soporte para function calling, aunque no se confirma que el adaptador lo preserve o modifique.
- Capacidades multilingües: el adaptador declara únicamente inglés; el modelo base soporta más idiomas, pero el fine-tuning puede haber reducido el rendimiento en otros idiomas.
- Eficiencia en dispositivos de borde: gracias a la arquitectura MatFormer y la cuantización 4-bit del modelo base, el conjunto puede ejecutarse en hardware con poca VRAM.
- No se dispone de información sobre capacidades específicas introducidas por el fine-tuning (por ejemplo, un dominio concreto, estilo de respuesta, etc.).

## Casos de uso

- Prototipado de asistentes conversacionales: al ser un LoRA ligero, permite experimentar con fine-tuning sobre Gemma 3n para crear un chatbot especializado sin necesidad de GPU de gama alta. Se cargaría el adaptador sobre el modelo base cuantizado y se probaría con datos propios.
- Adaptación a un dominio técnico: si el autor entrenó el adaptador con documentación o código, podría usarse para generar respuestas más precisas en un área concreta (por ejemplo, soporte de productos, preguntas frecuentes internas). El bajo coste de inferencia facilita su integración en entornos de desarrollo.
- Evaluación de técnicas LoRA en Gemma 3n: investigadores pueden usar este adaptador como ejemplo de fine-tuning eficiente con Unsloth, comparando su rendimiento con el modelo base para estudiar el impacto del LoRA en tareas específicas.
- Despliegue en entornos con restricciones de memoria: combinado con el modelo base en 4-bit, el adaptador permite ejecutar un modelo de 4B en GPUs con 6-8 GB de VRAM, como una RTX 3060 o una GPU de portátil, para aplicaciones de generación de texto en tiempo real.
- Generación de código asistida: si el fine-tuning incluyó datos de programación, el modelo podría utilizarse para autocompletar o generar fragmentos de código en inglés, aprovechando el contexto de 32k tokens para mantener proyectos completos.
- Investigación sobre transferencia de conocimiento: el adaptador puede servir como punto de partida para estudiar cómo los LoRA transfieren capacidades del modelo base a tareas específicas, comparando métricas antes y después del fine-tuning.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas de evaluación, y no se ha encontrado documentación externa que reporte el rendimiento de este adaptador específico. Se recomienda al usuario realizar sus propias evaluaciones comparando el modelo base Gemma 3n con y sin el adaptador.

## Requisitos de hardware

- VRAM estimada para inferencia: al tratarse de un adaptador LoRA sobre un modelo base cuantizado en 4-bit, el conjunto completo requiere aproximadamente 2,5-3 GB de VRAM para el modelo base (4B en 4-bit) más el overhead del adaptador y los estados de atención. En total, se estima entre 3 y 4 GB de VRAM para inferencia con contexto de 32k tokens.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM, como NVIDIA GTX 1650 (4 GB), RTX 3050 (4-8 GB) o RTX 4060 (8 GB). Para mayor comodidad, una RTX 3060 de 12 GB o superior permite ejecutar el modelo con margen.
- Compatibilidad con consumer GPU: sí, cabe en GPUs de consumo gracias a la cuantización 4-bit y al adaptador ligero.
- Opciones de despliegue: el adaptador se puede cargar con transformers (librería indicada en los tags), y también es compatible con text-generation-inference (TGI) según los tags. Puede utilizarse con vLLM o llama.cpp si se convierte el adaptador a GGUF, aunque no se proporciona un archivo GGUF.
- Latencia y throughput: no se dispone de mediciones concretas. En una GPU como RTX 3060, se espera una generación de 20-40 tokens por segundo con contexto moderado, pero estos valores son orientativos y dependen de la implementación.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| administraktor/gemma_3n_lora | 4B (base) + LoRA | 32k | Apache 2.0 | safetensors (LoRA) | Adaptador sobre Gemma 3n 4B cuantizado |
| unsloth/gemma-3n-e4b-it-unsloth-bnb-4bit | 4B | 32k | Apache 2.0 | safetensors (4-bit) | Modelo base sin fine-tuning adicional |
| jshargo/gemma-3-LoRA | 2B (base) + LoRA | 32k | Apache 2.0 | safetensors (LoRA) | Adaptador sobre Gemma 3n 2B, similar en enfoque |

La comparativa se limita a modelos de la misma familia. No hay datos de rendimiento para establecer una comparación cuantitativa. La principal diferencia entre el modelo evaluado y el de jshargo es el tamaño del modelo base (4B frente a 2B), lo que implica mayor capacidad pero también mayor consumo de recursos.

## Limitaciones y advertencias

- Sesgos conocidos: no se ha documentado ningún análisis de sesgos para este adaptador. Al heredar el comportamiento del modelo base Gemma 3n, puede presentar sesgos presentes en los datos de entrenamiento originales de Google, aunque no se ha verificado.
- Riesgo de alucinacion: como cualquier modelo generativo, puede producir información falsa o inventada, especialmente en dominios no cubiertos por el fine-tuning. La ausencia de evaluación publica aumenta la incertidumbre.
- Limitaciones de contexto e idioma: el adaptador declara únicamente inglés, por lo que su rendimiento en otros idiomas puede ser deficiente o inexistente. El contexto de 32k tokens es amplio, pero el fine-tuning podría haber reducido la capacidad de manejar contextos largos si el dataset de entrenamiento era corto.
- Restricciones de licencia: la licencia Apache 2.0 permite uso comercial y modificación, pero el modelo base Gemma 3n tiene sus propios términos de uso que deben consultarse (Gemma Terms of Use). Aunque la licencia del adaptador es permisiva, el usuario debe cumplir con las condiciones del modelo base.
- Caveat para producción: al ser un adaptador de 0,1 GB sin documentación de entrenamiento ni evaluación, no se recomienda su uso en entornos productivos sin una validación exhaustiva previa. La calidad del fine-tuning es desconocida y podría degradar el rendimiento del modelo base en tareas generales.
- Dependencia de la cuantización: el modelo base está cuantizado en 4-bit, lo que puede introducir pérdidas de precisión en comparación con el modelo en punto flotante completo. El adaptador LoRA está diseñado para funcionar sobre esta cuantización, pero no se garantiza su compatibilidad con otras cuantizaciones.

## Enlaces

- HuggingFace: https://huggingface.co/administraktor/gemma_3n_lora
- Gemma 3n (Google DeepMind): https://deepmind.google/models/gemma/gemma-3n/
- Documentación de Gemma 3n (Google AI for Developers): https://ai.google.dev/gemma/docs/gemma-3n
- Página de Gemma (Google AI): https://ai.google.dev/gemma
- Repositorio de Unsloth: https://github.com/unslothai/unsloth
- Ejemplo de LoRA similar (jshargo/gemma-3-LoRA): https://huggingface.co/jshargo/gemma-3-LoRA
- Repositorio de entrenamiento local con Gemma 3n: https://github.com/kossisoroyce/Gemma-3n-local-training
