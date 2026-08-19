# kerasformers/gemma-3n-e4b

## Resumen

`kerasformers/gemma-3n-e4b` es una conversión pura en Keras 3 del modelo multimodal `google/gemma-3n-E4B` de Google, realizada por el autor `kerasformers`. Este checkpoint base (pretrained, no instruido) permite ejecutar Gemma 3n de forma nativa en Keras 3 con tres backends intercambiables: TensorFlow, PyTorch y JAX, sin necesidad de usar el código original de HuggingFace Transformers. El modelo es multimodal, capaz de procesar texto, imagen y audio, y está diseñado para ejecución en dispositivos (on-device), incorporando innovaciones arquitectónicas como AltUp, LAuReL, MatFormer, embeddings por capa, sparsity de activación y atención híbrida 5:1 sliding/global.

La relevancia de esta conversión radica en que facilita la integración de Gemma 3n en proyectos que ya usan Keras, manteniendo la misma API y permitiendo cambiar de backend sin modificar el código. El repositorio tiene un tamaño de 31.3 GB, lo que sugiere que los pesos están en bfloat16 (formato por defecto). Es un modelo base, por lo que está pensado para fine-tuning o para tareas de completado, no para seguir instrucciones directamente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Decoder multimodal con AltUp, LAuReL, MatFormer, embeddings por capa, sparsity de activación, KV-sharing, atención 5:1 sliding/global; encoder de visión MobileNet-V5 y encoder de audio USM conformer |
| Parametros totales | no disponible (el nombre sugiere 4B, pero no se confirma en la documentación) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | bfloat16 (por defecto), float32, int8 |
| Idiomas soportados | en (inglés) |
| Licencia | Gemma (gated, requiere aceptar términos en HuggingFace) |
| Formato de pesos | safetensors (también pesos de Keras en el repo) |

## Arquitectura y entrenamiento

Gemma 3n es un modelo multimodal que combina un decoder de lenguaje con innovaciones orientadas a eficiencia en dispositivos. El decoder utiliza AltUp (actualizaciones alternas sobre flujos ocultos paralelos), LAuReL (residuales aumentados aprendidos), MatFormer (anchuras anidadas por capa), embeddings por capa y activación sparsity. Además, emplea KV-sharing en las capas finales y una atención híbrida con un esquema 5:1 entre atención deslizante y global. La parte visual usa un encoder MobileNet-V5 y la parte de audio un conformer USM, ambos alimentan tokens suaves al decoder.

No se proporcionan datos sobre el entrenamiento (número de tokens, composición del dataset, uso de RLHF/DPO). Al ser un checkpoint base, no ha pasado por fine-tuning de instrucciones. La conversión a Keras 3 mantiene los pesos originales en bfloat16 y permite cargarlos en float32 o cuantizarlos a int8.

## Capacidades

- Generación de texto (completado) a partir de prompts de texto.
- Procesamiento de imagen y texto combinados: puede describir imágenes, responder preguntas sobre ellas, etc.
- Procesamiento de audio y texto: transcripción de audio, razonamiento sobre contenido hablado.
- Multimodal: integra las tres modalidades (texto, imagen, audio) en una sola conversación.
- Soporte de múltiples backends de Keras (TensorFlow, PyTorch, JAX) sin cambios en el código.
- Carga en bfloat16 por defecto, con opciones de float32 e int8 para reducir memoria.
- No se menciona soporte de tool calling, agentes ni razonamiento multi-paso explícito.

## Casos de uso

- Descripción de imágenes para accesibilidad: el modelo puede generar descripciones textuales de imágenes, útil para personas con discapacidad visual. Se usaría con el pipeline de imagen+texto, pasando la imagen y un prompt como "Describe esta imagen".
- Transcripción y resumen de audio: al aceptar audio como entrada, puede transcribir reuniones o notas de voz y generar resúmenes. Se integraría en aplicaciones de productividad.
- Asistente multimodal en dispositivos móviles: gracias a su diseño on-device y su tamaño relativamente compacto, puede ejecutarse en smartphones para responder preguntas sobre fotos o comandos de voz.
- Generación de texto con contexto visual: por ejemplo, generar pies de foto automáticos o descripciones de productos a partir de imágenes.
- Fine-tuning para tareas específicas: al ser un modelo base, se puede ajustar con datasets propios para tareas como clasificación de imágenes con texto, análisis de sentimiento multimodal, etc.
- Análisis de contenido multimedia: extraer información de vídeos (frames + audio) para generar metadatos o subtítulos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- El tamaño del repositorio es de 31.3 GB, lo que sugiere que los pesos en bfloat16 ocupan aproximadamente esa cantidad. Para cargar el modelo en bfloat16 se necesitaría una GPU con al menos 32 GB de VRAM (por ejemplo, A100 40GB, H100, o RTX 4090 con 24 GB no sería suficiente).
- Con cuantización int8, el tamaño se reduciría aproximadamente a la mitad (~16 GB), lo que permitiría ejecutarlo en GPUs de 16-24 GB como RTX 4080/4090, aunque no hay datos oficiales de VRAM exacta.
- No se especifican requisitos de hardware en la documentación; estas cifras son estimaciones basadas en el tamaño del repo.
- Opciones de despliegue: al ser una conversión de Keras, se puede usar con el ecosistema Keras (model.fit, model.predict) y con librerías de inferencia que soporten Keras 3. No se menciona compatibilidad con vLLM, llama.cpp u Ollama.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de información suficiente para comparar con otros modelos de la misma categoría (mismo tamaño o tarea). El modelo base es `google/gemma-3n-E4B`, pero no se proporcionan especificaciones detalladas de ese modelo ni de alternativas comparables.

## Limitaciones y advertencias

- Solo soporta inglés (idioma `en`), lo que limita su uso en otros idiomas.
- Es un modelo base, no instruido; para tareas de conversación o seguimiento de instrucciones se recomienda usar la variante `-it` (instruct).
- Licencia Gemma gated: requiere aceptar los términos de uso de Google en HuggingFace antes de descargar. El uso comercial está sujeto a esos términos.
- Riesgo de alucinaciones y sesgos inherentes a los modelos de lenguaje, no documentados específicamente para esta conversión.
- No se especifican limitaciones de contexto ni de longitud de entrada; se desconoce la ventana máxima.
- La cuantización int8 puede degradar ligeramente la calidad de las respuestas, aunque no hay datos cuantitativos.
- Al ser una conversión de terceros, no hay garantía de soporte oficial de Google.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/kerasformers/gemma-3n-e4b
- Modelo base original: https://huggingface.co/google/gemma-3n-E4B
- Repositorio GitHub de KerasFormers: https://github.com/IMvision12/KerasFormers
- Documentación de Gemma 3n en KerasFormers: https://imvision12.github.io/KerasFormers/gemma3n/
- Colección de variantes Gemma 3n: https://huggingface.co/collections/kerasformers/gemma-3n-6a7a507adf78dde12680accf
