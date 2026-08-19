# kerasformers/internvl3-78b

## Resumen

`kerasformers/internvl3-78b` es una conversión íntegra al framework **Keras 3** del modelo multimodal **InternVL3-78B** desarrollado originalmente por OpenGVLab. Esta implementación, creada por el equipo de KerasFormers, permite ejecutar el mismo checkpoint en **TensorFlow, PyTorch o JAX** sin modificar el código, gracias a la abstracción multiplataforma de Keras 3. El modelo procesa entradas de imagen y texto y genera respuestas de texto, siguiendo el paradigma "ViT-MLP-LLM": un codificador visual InternViT de 6B parámetros, un proyector MLP y un decodificador de lenguaje Qwen2.5-72B, totalizando 78B parámetros.

La relevancia de esta conversión radica en que democratiza el acceso a uno de los modelos multimodales de código abierto más avanzados, permitiendo a desarrolladores e investigadores experimentar con él en el ecosistema Keras sin depender de implementaciones específicas de cada backend. El checkpoint se distribuye en bfloat16 y su tamaño de repositorio es de 157 GB. La licencia es "other" (debe consultarse la licencia upstream de OpenGVLab), y el idioma declarado es inglés.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ViT-MLP-LLM (InternViT 6B + MLP proyector + Qwen2.5-72B) |
| Parametros totales | 78B |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible (no se especifica en la informacion proporcionada) |
| Tipos de cuantizacion | no disponible (pesos almacenados en bfloat16) |
| Idiomas soportados | en (ingles) |
| Licencia | other (consultar licencia upstream de OpenGVLab) |
| Formato de pesos | no disponible (repositorio de 157 GB, presumiblemente safetensors, pero no confirmado) |

## Arquitectura y entrenamiento

InternVL3-78B mantiene la arquitectura establecida en versiones anteriores de InternVL, siguiendo el esquema "ViT-MLP-LLM". El codificador visual es un InternViT preentrenado incrementalmente, que procesa imágenes a resolución de 448×448 píxeles. Las imágenes se dividen dinámicamente en mosaicos (tiles) con proporciones de aspecto adaptativas, y cada tile se convierte en una secuencia de tokens mediante un downsampler pixel-shuffle y un proyector MLP. El componente de lenguaje es un modelo Qwen2.5-72B, que se conecta al proyector visual. Esta conversión de Keras 3 integra el decodificador de texto Qwen2 de forma directa en la implementación.

En cuanto al entrenamiento, no se proporcionan detalles específicos en la información disponible sobre esta conversión. Sin embargo, el modelo original de OpenGVLab se entrenó con un pipeline que incluye preentrenamiento multimodal y ajuste fino con datos de instrucción, utilizando técnicas como RLHF y DPO según la documentación del proyecto InternVL. La conversión a Keras 3 no modifica los pesos, solo la implementación del código.

## Capacidades

- Generación de texto a partir de imágenes y texto (image-text-to-text).
- Razonamiento visual y percepción de alto nivel, con rendimiento de última generación entre modelos multimodales de código abierto (según la afirmación del equipo de OpenGVLab).
- Procesamiento de imágenes con tiling dinámico, lo que permite manejar imágenes de alta resolución y proporciones variadas.
- Soporte para conversaciones multimodales multi-turno (el ejemplo de uso muestra una conversación con imagen y texto).
- Capacidad de ejecución en múltiples backends (TensorFlow, PyTorch, JAX) gracias a Keras 3.
- No se menciona soporte explícito para tool calling, agentes o funciones de audio/video.

## Casos de uso

- **Descripción automática de imágenes**: el modelo puede generar descripciones detalladas de fotografías, ilustraciones o diagramas, útil para accesibilidad, catalogación de contenido o generación de metadatos. Su capacidad de procesar imágenes de alta resolución mediante tiling dinámico permite capturar detalles finos.
- **Respuesta visual a preguntas (VQA)**: en entornos de atención al cliente, puede responder consultas sobre imágenes de productos, facturas o capturas de pantalla, integrado en sistemas de soporte automatizado.
- **Análisis de documentos escaneados**: al combinar visión y lenguaje, puede extraer información de formularios, recibos o informes, facilitando la automatización de procesos de extracción de datos.
- **Generación de contenido educativo**: puede crear explicaciones o resúmenes a partir de figuras, gráficos o esquemas, útil para plataformas de e-learning.
- **Asistencia a personas con discapacidad visual**: integrado en aplicaciones móviles, puede describir el entorno o leer textos en imágenes, mejorando la accesibilidad.
- **Investigación en visión por computador**: sirve como modelo base para experimentos de fine-tuning en tareas específicas de comprensión imagen-texto, gracias a su licencia open source (con restricciones a revisar) y su implementación multiplataforma.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks específicos en la información proporcionada para esta conversión de Keras 3. No obstante, el equipo de OpenGVLab afirma en su repositorio que InternVL3-78B logra rendimiento de última generación (SoTA) en percepción y razonamiento entre los modelos multimodales de código abierto. No se dispone de cifras concretas (MMLU, HumanEval, etc.) en los datos disponibles, por lo que no se incluyen tablas numéricas.

## Requisitos de hardware

- El modelo tiene 78B parámetros. En bfloat16 (2 bytes por parámetro), el peso bruto ocupa aproximadamente 156 GB, más overhead de activaciones y memoria intermedia.
- Se requiere un entorno multi-GPU. No cabe en una GPU de consumo (p. ej., RTX 4090 con 24 GB). Se necesitan al menos dos GPUs de alta gama con 80 GB de VRAM (A100, H100) o configuraciones con varias GPUs de menor capacidad (p. ej., 4× A6000 de 48 GB).
- Para inferencia, se puede desplegar con frameworks que soporten modelos grandes y particionado, como vLLM, TensorRT-LLM o el propio Keras 3 con distribución de dispositivos. No se han proporcionado datos de latencia o throughput.
- La implementación de Keras 3 permite elegir backend, pero el requisito de memoria es independiente del backend.

## Comparativa con modelos similares

No se dispone de información comparativa detallada en los datos proporcionados. Sin embargo, se puede situar este modelo en la misma categoría que otros MLLMs de gran escala como:

- **InternVL2.5-78B** (versión anterior de la misma familia): misma arquitectura general, pero con mejoras en InternVL3 en percepción y razonamiento.
- **Qwen2-VL-72B**: otro modelo multimodal de código abierto con arquitectura similar (ViT + LLM), pero con diferencias en el codificador visual y el entrenamiento.
- **LLaVA-NeXT-72B**: basado en un LLM diferente y con estrategias de resolución de imagen distintas.

No se dispone de una tabla comparativa con métricas concretas porque no se han proporcionado en la información disponible.

## Limitaciones y advertencias

- **Licencia**: la licencia se indica como "other". Es imprescindible revisar la licencia upstream de OpenGVLab (enlace en la model card) antes de cualquier uso comercial, ya que puede tener restricciones.
- **Idioma**: el modelo declara soporte solo para inglés. El rendimiento en otros idiomas no está garantizado.
- **Sesgos y alucinaciones**: como todo modelo multimodal grande, puede generar descripciones inexactas o inventar detalles en imágenes ambiguas. No se han documentado sesgos específicos en esta conversión, pero se heredan los del modelo original.
- **Recursos**: el tamaño de 78B parámetros y 157 GB de checkpoint requieren infraestructura de alto rendimiento, lo que limita su uso en entornos con recursos limitados.
- **Formato de pesos**: al ser una conversión de Keras 3, el formato exacto de almacenamiento no está documentado; se recomienda verificar la compatibilidad con herramientas de cuantización o despliegue estándar.

## Enlaces

- [Modelo en HuggingFace: kerasformers/internvl3-78b](https://huggingface.co/kerasformers/internvl3-78b)
- [Modelo original: OpenGVLab/InternVL3-78B-hf](https://huggingface.co/OpenGVLab/InternVL3-78B-hf)
- [Modelo instruct original: OpenGVLab/InternVL3-78B-Instruct](https://huggingface.co/OpenGVLab/InternVL3-78B-Instruct)
- [Repositorio GitHub de KerasFormers](https://github.com/IMvision12/KerasFormers)
- [Documentación de InternVL en KerasFormers](https://imvision12.github.io/KerasFormers/internvl/)
- [Repositorio GitHub de InternVL (OpenGVLab)](https://github.com/OpenGVLab/InternVL)
- [Colección de modelos InternVL en HuggingFace](https://huggingface.co/collections/kerasformers/internvl-6a8277076dbb163f53241dbd)
- [Licencia upstream](https://huggingface.co/OpenGVLab/InternVL3-78B-hf/blob/main/LICENSE)
