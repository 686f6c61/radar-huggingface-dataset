# kerasformers/internvl3.5-1b

## Resumen

`kerasformers/internvl3.5-1b` es una conversión del modelo multimodal `OpenGVLab/InternVL3_5-1B-HF` implementada íntegramente con Keras 3, la API de alto nivel de Keras que soporta múltiples backends. El modelo original, desarrollado por OpenGVLab, es un sistema de visión-lenguaje que procesa imágenes y texto para generar respuestas textuales. Esta conversión, realizada por la organización KerasFormers, permite ejecutar el mismo checkpoint en TensorFlow, PyTorch o JAX sin modificar el código, lo que facilita su integración en entornos heterogéneos.

El modelo base InternVL3.5 introduce innovaciones como el framework Cascade Reinforcement Learning (Cascade RL), que combina RL offline y online para mejorar el razonamiento, y Visual Consistency Learning (ViCO) para reducir el coste de tokens al representar parches de imagen. Con aproximadamente 1.000 millones de parámetros, es una opción ligera dentro de la familia InternVL, adecuada para despliegues con recursos limitados. Los pesos se almacenan en bfloat16 y el repositorio ocupa 2,1 GB.

La relevancia de esta conversión radica en que elimina la dependencia de `transformers` y del runtime de PyTorch en la ruta de inferencia, ofreciendo una alternativa puramente Keras que puede acelerar el desarrollo en proyectos que ya usan este framework. La licencia Apache 2.0 permite uso comercial sin restricciones adicionales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | InternViT (vision tower) + pixel-shuffle downsampler + MLP connector + decoder de texto Qwen2 |
| Parametros totales | ~1.000 millones (modelo base 1B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | bfloat16 (pesos almacenados) |
| Idiomas soportados | ingles (segun model card) |
| Licencia | Apache 2.0 |
| Formato de pesos | Keras 3 (safetensors no aplicable; pesos en formato Keras) |

## Arquitectura y entrenamiento

La arquitectura sigue el diseño de InternVL3.5: una torre de vision InternViT procesa las imagenes, seguida de un downsampler pixel-shuffle y un conector MLP que proyecta las caracteristicas visuales al espacio del decoder de texto, que es un modelo Qwen2 inline. Las imagenes se dividen dinamicamente en tiles segun su relacion de aspecto, y cada tile genera una secuencia de tokens de longitud fija (image_seq_length). El procesador InternVLProcessor gestiona este tiling dinamico junto con una miniatura opcional.

El entrenamiento del modelo original emplea el framework Cascade RL, que combina RL offline para convergencia estable y RL online para alineacion refinada. Ademas, la version Flash de InternVL3.5 introduce ViCO, una etapa de entrenamiento ligera que reduce el coste de tokens por parche de imagen. Esta conversion de KerasFormers no modifica los pesos; simplemente los transpila al formato Keras 3 manteniendo la arquitectura y el comportamiento originales.

## Capacidades

- Generacion de texto a partir de imagenes y prompts de texto (image-text-to-text).
- Razonamiento multimodal: puede responder preguntas sobre el contenido visual de una imagen.
- Soporte de conversaciones multi-turno con contexto visual (el procesador acepta listas de mensajes con contenido mixto imagen/texto).
- Capacidad de descripcion de imagenes en lenguaje natural.
- Ejecucion en tres backends: TensorFlow, Torch y JAX, sin cambios en el codigo.
- Carga directa desde HuggingFace sin conversion en caliente ni dependencia de `transformers`.

## Casos de uso

- Descripcion automatica de imagenes para accesibilidad: el modelo puede generar descripciones textuales de fotografias o ilustraciones, utiles para integrar en aplicaciones de lectura de pantalla o generacion de metadatos.
- Moderacion de contenido visual: dado un conjunto de imagenes, el modelo puede clasificar o describir el contenido para filtrar material inapropiado en plataformas sociales.
- Asistente de soporte tecnico con capturas de pantalla: los usuarios pueden enviar una captura de pantalla de un error y el modelo genera una explicacion del problema basandose en la imagen.
- Anotacion de datasets para vision artificial: el modelo puede generar descripciones iniciales de imagenes que luego se refinan manualmente, acelerando la creacion de datasets etiquetados.
- Educacion interactiva: herramientas de aprendizaje que responden preguntas sobre diagramas, mapas o figuras cientificas a partir de una imagen cargada por el estudiante.
- Automatizacion de documentos escaneados: extraccion de informacion de facturas o formularios escaneados mediante prompts que combinan la imagen con preguntas especificas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de evaluacion y la conversion no aporta datos adicionales. Para conocer el rendimiento del modelo base, se recomienda consultar la documentacion oficial de OpenGVLab/InternVL3_5-1B-HF.

## Requisitos de hardware

- VRAM estimada: al ser un modelo de 1B en bfloat16, el peso ocupa aproximadamente 2 GB. La VRAM necesaria para inferencia depende del backend y del tamano del lote, pero deberia caber en GPUs consumer con 8 GB o mas.
- GPUs recomendadas: cualquier GPU moderna con soporte para bfloat16 (RTX 3090, RTX 4090, A100, H100). Para backends JAX o TensorFlow, se recomienda verificar la compatibilidad del driver.
- Compatibilidad con consumer GPU: si, el modelo cabe en GPUs de gama media como RTX 3060 o superiores, siempre que se gestione adecuadamente la memoria.
- Opciones de despliegue: al ser Keras 3, se puede servir con los servidores de inferencia que soporten este formato, como TensorFlow Serving o mediante wrappers personalizados con FastAPI. No es compatible directamente con vLLM, llama.cpp u Ollama, que esperan formatos como safetensors o GGUF.
- Latencia y throughput: no disponible. Depende del backend, del hardware y del numero de tiles de imagen procesados.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| kerasformers/internvl3.5-1b | ~1B | no disponible | Apache 2.0 | Keras 3 | Conversion Keras del modelo InternVL3.5 |
| OpenGVLab/InternVL3_5-1B-HF | ~1B | no disponible | Apache 2.0 | safetensors | Modelo original en formato HuggingFace |
| Qwen2-VL-2B | 2B | 128K tokens | Apache 2.0 | safetensors | Alternativa multimodal de mayor tamano |

La principal diferencia frente al modelo original es el formato de pesos: esta conversion usa Keras 3, lo que permite ejecutarse en tres backends sin dependencias de `transformers`. Frente a alternativas como Qwen2-VL-2B, el modelo de 1B es mas ligero pero tambien tiene menos capacidad de razonamiento, aunque los benchmarks no estan disponibles para confirmarlo.

## Limitaciones y advertencias

- El modelo solo soporta ingles segun la model card; no se garantiza rendimiento en otros idiomas.
- No se han publicado resultados de benchmarks, por lo que el rendimiento real en tareas especificas es desconocido.
- Riesgo de alucinacion: como cualquier modelo generativo, puede producir descripciones o respuestas inexactas sobre el contenido de las imagenes.
- La conversion a Keras 3 puede introducir diferencias numericas menores respecto al modelo original debido a operaciones de bajo nivel entre backends.
- El repositorio no incluye cuantizaciones alternativas (GGUF, AWQ, etc.), lo que limita el despliegue en entornos con restricciones de memoria extremas.
- Al ser un modelo de 1B, su capacidad de razonamiento complejo es limitada en comparacion con modelos de mayor tamano de la misma familia.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/kerasformers/internvl3.5-1b
- Modelo original: https://huggingface.co/OpenGVLab/InternVL3_5-1B-HF
- Documentacion de KerasFormers para InternVL: https://imvision12.github.io/KerasFormers/internvl/
- Repositorio GitHub de KerasFormers: https://github.com/IMvision12/KerasFormers
- Coleccion de modelos InternVL en HuggingFace: https://huggingface.co/collections/kerasformers/internvl-6a8277076dbb163f53241dbd
- Blog de InternVL3.5: https://internvl.github.io/blog/2025-08-26-InternVL-3.5/
- Paper de InternVL3.5: https://arxiv.org/abs/2508.18265
