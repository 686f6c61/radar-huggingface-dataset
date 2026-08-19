# kerasformers/gemma-3-4b-it

## Resumen

`kerasformers/gemma-3-4b-it` es una conversión íntegra a Keras 3 del modelo oficial `google/gemma-3-4b-it`, desarrollada por el equipo de KerasFormers. Esta versión permite ejecutar el modelo con una única implementación sobre tres backends: TensorFlow, PyTorch y JAX, lo que facilita su integración en entornos que ya usan Keras. Se trata del checkpoint ajustado por instrucciones (instruction-tuned) de Gemma 3 4B, y se ofrece como un sistema multimodal de imagen y texto a texto mediante la clase `Gemma3ConditionalGenerate`.

El modelo es relevante porque amplía el ecosistema de Gemma 3 a usuarios de Keras, manteniendo los pesos originales en bfloat16 y ofreciendo opciones de cuantización a int8 o precisión float32. Al ser una conversión de pesos, no introduce cambios en el comportamiento del modelo base, por lo que hereda todas sus capacidades multimodales y de generación de texto. El repositorio ocupa 8.6 GB y está sujeto a la licencia Gemma, que requiere aceptación previa en la tarjeta del modelo original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (Gemma 3) |
| Parametros totales | 4B (indicado en el nombre del modelo) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | bfloat16 (por defecto), int8 (opcional), float32 (opcional) |
| Idiomas soportados | en (ingles) |
| Licencia | Gemma (gated) |
| Formato de pesos | No disponible (formato propio de Keras) |

## Arquitectura y entrenamiento

El modelo es una conversión directa de los pesos de `google/gemma-3-4b-it` a Keras 3, realizada por el proyecto KerasFormers. No se ha realizado ningún entrenamiento adicional; se trata de una reimplementación en Keras que mantiene la misma arquitectura y los mismos pesos del modelo original de Google. Según la documentación, la implementación es compatible con los backends TensorFlow, Torch y JAX, lo que permite ejecutar el modelo en cualquiera de ellos sin cambios en el código.

Los pesos se almacenan en bfloat16 por defecto, aunque se puede cargar en float32 para mayor precisión o cuantizar a int8 para reducir el uso de memoria. No se proporcionan detalles sobre el dataset de entrenamiento ni el proceso de ajuste, ya que estos corresponden al modelo base de Google. La referencia al paper `arxiv:2503.19786` sugiere que la arquitectura sigue las especificaciones del artículo técnico de Gemma 3, pero no se incluyen más detalles en la información disponible.

## Capacidades

- Generación de texto a partir de instrucciones en inglés.
- Procesamiento multimodal: acepta entradas de imagen y texto, y genera respuestas de texto (pipeline `image-text-to-text`).
- Soporte para múltiples backends de Keras: TensorFlow, PyTorch y JAX.
- Carga en bfloat16, float32 o cuantización int8.
- Integración con el ecosistema KerasFormers, que ofrece clases como `Gemma3TextGenerate`, `Gemma3ConditionalGenerate`, `Gemma3Tokenizer` y `Gemma3Processor`.
- Capacidad de cargar pesos comunitarios o del hub mediante el prefijo `hf:`.

## Casos de uso

- Descripción y análisis de imágenes: el modelo puede generar descripciones detalladas de fotografías o ilustraciones, útil para accesibilidad o moderación de contenido.
- Asistentes virtuales multimodales: integración en chatbots que necesitan interpretar imágenes enviadas por el usuario y responder en texto.
- Generación de respuestas en inglés para soporte técnico: al ser un modelo ajustado por instrucciones, puede mantener conversaciones coherentes y contextuales.
- Prototipado rápido en Keras: gracias a su compatibilidad con TensorFlow, PyTorch y JAX, es ideal para experimentar con Gemma 3 en proyectos que ya usan Keras.
- Educación e investigación: sirve como referencia para estudiar la arquitectura de Gemma 3 y comparar implementaciones entre frameworks.
- Aplicaciones de visión por computador con lenguaje natural: como la generación de leyendas para imágenes o la respuesta a preguntas visuales (VQA).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Al ser una conversión de pesos, el rendimiento debería ser equivalente al del modelo base `google/gemma-3-4b-it`, pero no se aportan métricas concretas (MMLU, HumanEval, GSM8K, etc.) en esta ficha.

## Requisitos de hardware

- El tamaño del repositorio es de 8.6 GB, lo que sugiere que los pesos en bfloat16 ocupan aproximadamente 8 GB (4 mil millones de parámetros × 2 bytes).
- Para cargar el modelo en bfloat16 se recomienda una GPU con al menos 10 GB de VRAM (por ejemplo, NVIDIA RTX 3080/3090, A10, A100).
- Con cuantización int8, el uso de memoria se reduce a aproximadamente 4 GB, lo que permitiría ejecutarlo en GPUs de gama media como RTX 3060 o incluso en CPU con suficiente RAM.
- El despliegue se realiza mediante la librería `kerasformers`, configurando el backend con la variable de entorno `KERAS_BACKEND` (torch, jax o tensorflow).
- No se mencionan opciones de despliegue con vLLM, llama.cpp u Ollama; el modelo está pensado para usarse con Keras 3.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| kerasformers/gemma-3-4b-it | 4B | No disponible | Gemma (gated) | HuggingFace |
| kerasformers/gemma-3-1b-it | 1B | No disponible | Gemma (gated) | HuggingFace |
| kerasformers/gemma-3-12b-it | 12B | No disponible | Gemma (gated) | HuggingFace |
| kerasformers/gemma-3-27b-it | 27B | No disponible | Gemma (gated) | HuggingFace |

La comparativa se limita a las variantes de Gemma 3 disponibles en el mismo ecosistema KerasFormers. No se dispone de datos de rendimiento ni de contexto para establecer una comparación cuantitativa.

## Limitaciones y advertencias

- Licencia restringida: la licencia Gemma es de tipo "gated", lo que obliga a aceptar los términos en la tarjeta del modelo original antes de su descarga. Es necesario revisar las condiciones para uso comercial.
- Idioma limitado: el modelo solo declara soporte para inglés (`en`), por lo que su rendimiento en otros idiomas puede ser deficiente.
- Sesgos y alucinaciones: al ser un modelo de lenguaje grande, puede generar contenido sesgado o inventar información, especialmente en tareas abiertas.
- Dependencia del modelo base: al ser una conversión, cualquier limitación del modelo original (por ejemplo, en razonamiento complejo o conocimiento factual) se mantiene.
- Formato de pesos no estándar: al usar un formato propio de Keras, puede haber dificultades para integrarlo con herramientas que esperan safetensors o GGUF.
- Sin soporte explícito para tool calling o agentes: no se menciona en la documentación, por lo que su uso en pipelines de agentes requeriría implementaciones adicionales.

## Enlaces

- [HuggingFace: kerasformers/gemma-3-4b-it](https://huggingface.co/kerasformers/gemma-3-4b-it)
- [Repositorio GitHub de KerasFormers](https://github.com/IMvision12/KerasFormers)
- [Documentación de Gemma 3 en KerasFormers](https://imvision12.github.io/KerasFormers/gemma3/)
- [Modelo base: google/gemma-3-4b-it](https://huggingface.co/google/gemma-3-4b-it)
- [Paper de Gemma 3 (arxiv:2503.19786)](https://arxiv.org/abs/2503.19786)
