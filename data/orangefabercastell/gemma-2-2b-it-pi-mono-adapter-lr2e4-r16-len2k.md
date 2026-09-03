# orangefabercastell/gemma-2-2b-it-pi-mono-adapter-lr2e4-r16-len2k

## Resumen

Este repositorio contiene un adaptador LoRA (bajo el nombre `pi-mono-adapter`) para el modelo base `unsloth/gemma-2-2b-it-bnb-4bit`, que a su vez es una versión cuantizada en 4 bits de Gemma 2 2B Instruct de Google. El adaptador fue desarrollado por el usuario `orangefabercastell` y entrenado con la librería Unsloth, que acelera el fine-tuning de modelos de lenguaje. La denominación del archivo indica un learning rate de 2e-4, un rango de adaptador de 16 y una longitud de contexto de 2048 tokens.

El propósito exacto del adaptador no se documenta en la model card: no se especifica la tarea, el dataset ni los resultados obtenidos. Al tratarse de un adaptador sobre un modelo instructivo ya entrenado, su función probable es especializar el comportamiento de Gemma 2 2B para un dominio concreto, pero esa información no está disponible. Su relevancia reside en la posibilidad de adaptar un modelo de 2 mil millones de parámetros con recursos limitados, aprovechando la cuantización y el entrenamiento eficiente de Unsloth.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Gemma 2) con adaptador LoRA |
| Parametros totales | no disponible (adaptador con r=16 sobre modelo base de 2B) |
| Parametros activos | no aplicable (no es MoE) |
| Longitud de contexto | 2048 tokens (según el nombre `len2k`) |
| Tipos de cuantizacion | El modelo base usa bnb-4bit; el adaptador no está cuantizado |
| Idiomas soportados | inglés (según la etiqueta `language: en`) |
| Licencia | Apache 2.0 (para el adaptador; la licencia del modelo base Gemma 2 puede tener restricciones adicionales) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El adaptador se basa en Gemma 2 2B Instruct, un transformer decoder-only con aproximadamente 2 mil millones de parámetros, que incorpora atención global y local alternada, así como mecanismos de sliding window attention. El modelo base fue cuantizado a 4 bits con bitsandbytes (bnb-4bit) para reducir el uso de memoria. Sobre esta base se aplicó un adaptador LoRA con rango 16, entrenado con Unsloth, que optimiza el uso de VRAM y acelera el entrenamiento. No se han publicado detalles sobre el dataset de entrenamiento, el número de pasos, ni si se utilizaron técnicas como RLHF o DPO. La longitud de contexto de 2048 tokens es la ventana máxima que soporta el adaptador según su configuración.

## Capacidades

- Generación de texto en inglés, heredada del modelo base Gemma 2 2B Instruct.
- Razonamiento y respuesta a instrucciones, gracias al entrenamiento instructivo del modelo base.
- Capacidad limitada de generación de código y matemáticas, típica de un modelo de 2B.
- No se ha confirmado soporte de tool calling, function calling, ni capacidades multimodales (visión, audio).
- El adaptador no añade capacidades especiales documentadas; su comportamiento específico depende de los datos de fine-tuning, que no se han revelado.

## Casos de uso

- Adaptación a dominios específicos: el adaptador puede utilizarse para especializar el modelo en una tarea concreta (p. ej., atención al cliente, generación de documentos técnicos) si se dispone del dataset de entrenamiento, aunque no se ha documentado.
- Prototipado rápido con Unsloth: al ser un adaptador pequeño (0.1 GB), permite experimentar con fine-tuning sobre Gemma 2 2B en GPUs consumer sin necesidad de ajustar todo el modelo.
- Investigación en eficiencia de fine-tuning: sirve como ejemplo de adaptación con LoRA sobre un modelo cuantizado, útil para estudiar el impacto de hiperparámetros como learning rate y rango.
- Inferencia en entornos con recursos limitados: al combinarse con el modelo base cuantizado en 4 bits, puede ejecutarse en GPUs con poca VRAM (p. ej., 4-6 GB), aunque el rendimiento dependerá de la tarea.
- Evaluación comparativa de adaptadores: puede emplearse como referencia para comparar el rendimiento de distintos adaptadores sobre el mismo modelo base, siempre que se definan tareas de evaluación.
- Uso educativo: para aprender a cargar y desplegar adaptadores LoRA con Hugging Face Transformers y TGI.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: el modelo base en 4 bits ocupa aproximadamente 2-3 GB; el adaptador añade menos de 0.1 GB. En total, se puede ejecutar en GPUs con 4 GB de VRAM o más.
- GPU recomendadas: NVIDIA RTX 3060 (12 GB), RTX 4070, RTX 4090, o GPUs de datacenter como A10 o A100 si se requiere mayor throughput.
- Compatibilidad con GPU consumer: sí, el modelo cabe en GPUs de gama media con al menos 4 GB de VRAM.
- Opciones de despliegue: Hugging Face Transformers (carga del adaptador con `PeftModel`), Text Generation Inference (TGI), vLLM (si se fusiona el adaptador con el modelo base), y llama.cpp (si se convierte a GGUF).
- Latencia y throughput: no disponible, depende del hardware y de la longitud de secuencia.

## Comparativa con modelos similares

No se dispone de información suficiente para comparar este adaptador con otros modelos o adaptadores de la misma categoría, ya que no se conocen sus tareas ni métricas de rendimiento. La comparativa queda limitada al modelo base Gemma 2 2B Instruct, que en benchmarks públicos (MMLU, HumanEval, GSM8K) muestra un rendimiento moderado para su tamaño, pero esos resultados no son extrapolables al adaptador sin datos propios.

## Limitaciones y advertencias

- Sesgos y alucinaciones: el modelo base Gemma 2 2B puede presentar sesgos de género, raza o idioma, y generar contenido falso; el adaptador no corrige estos problemas.
- Falta de documentación: no se especifica la tarea para la que fue entrenado, el dataset, ni los criterios de evaluación, lo que impide conocer su fiabilidad en producción.
- Longitud de contexto limitada: 2048 tokens puede ser insuficiente para tareas que requieran contexto largo.
- Idioma: solo se declara soporte para inglés; el rendimiento en otros idiomas no está garantizado.
- Compatibilidad de licencias: aunque el adaptador tiene licencia Apache 2.0, el modelo base Gemma 2 está sujeto a la licencia de Google (Gemma Terms of Use), que puede imponer restricciones adicionales para uso comercial.
- Riesgo de sobreajuste: al ser un adaptador con r=16 y sin datos de validación publicados, existe la posibilidad de que esté sobreajustado al dataset de entrenamiento y generalice mal.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/orangefabercastell/gemma-2-2b-it-pi-mono-adapter-lr2e4-r16-len2k
- Repositorio de Unsloth (usado para el entrenamiento): https://github.com/unslothai/unsloth
- Modelo base (unsloth/gemma-2-2b-it-bnb-4bit): https://huggingface.co/unsloth/gemma-2-2b-it-bnb-4bit
- Documentación de Gemma 2 (Google): https://ai.google.dev/gemma/docs
