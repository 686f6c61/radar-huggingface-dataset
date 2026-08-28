# simaai/LFM2-VL-1.6B-Autoround-Safetensors

## Resumen

El modelo `simaai/LFM2-VL-1.6B-Autoround-Safetensors` es una versión cuantizada posterior al entrenamiento del modelo de visión-lenguaje `LiquidAI/LFM2-VL-1.6B`, preparada por SiMa.ai para su compilación en hardware de inferencia en el borde (edge). Se trata de un checkpoint intermedio, previo a la compilación con LLiMa, que conserva las restricciones de licencia del modelo original de Liquid AI.

Este modelo combina un encoder de visión y un decoder de lenguaje con 1.719 millones de parámetros, pensado para tareas de imagen-texto a texto. La cuantización emplea AutoRound para las capas lineales del decoder (INT4 simétrico con grupo de 256), GPTQ para la cabeza de salida (INT4) y el encoder de visión (INT8 por canal), manteniendo dos capas del proyector multimodal en BF16. El resultado es un checkpoint de 1,3 GB, significativamente más ligero que el original, con una pérdida de precisión moderada en la evaluación MMStar (48,27 % frente al 49,67 % del modelo fuente).

La relevancia actual de este modelo radica en su adecuación para despliegue en dispositivos con recursos limitados, como sistemas embebidos o aceleradores de borde, donde el tamaño reducido y la cuantización permiten inferencia eficiente de tareas multimodales sin sacrificar excesivamente la calidad. Sin embargo, es importante señalar que se trata de una versión cuantizada de un modelo ya superado por su sucesor LFM2.5-VL-1.6B, que ofrece mejor comprensión visual y razonamiento mediante aprendizaje por refuerzo extendido.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (encoder de visión + decoder de lenguaje) |
| Parametros totales | 1.719.021.728 (1,72 B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 32 000 tokens (según el informe técnico de LFM2) |
| Tipos de cuantizacion | INT4 simétrico G256 (decoder y lm_head), INT8 por canal (encoder de visión), BF16 (2 capas del proyector) |
| Idiomas soportados | Multilingüe (sin lista específica publicada) |
| Licencia | other (se aplican las restricciones del modelo base LiquidAI/LFM2-VL-1.6B) |
| Formato de pesos | Safetensors |

## Arquitectura y entrenamiento

El modelo base `LiquidAI/LFM2-VL-1.6B` pertenece a la familia LFM2 de Liquid AI, que incluye variantes densas de 350M a 2,6B parámetros y un modelo MoE de 8,3B con 1,5B activos, todos con una longitud de contexto de 32K tokens. LFM2-VL es la extensión multimodal de esta familia, que combina un encoder de visión con el backbone de lenguaje para tareas de comprensión imagen-texto. No se dispone de información pública detallada sobre la arquitectura interna exacta (p. ej., si emplea atención lineal, mezcla de expertos o mecanismos híbridos) más allá de que es un modelo denso.

En cuanto al entrenamiento, no se han publicado datos específicos sobre el número de tokens, la composición del dataset o el uso de técnicas como RLHF o DPO para este modelo en particular. La cuantización posterior se realizó con AutoRound y GPTQ, utilizando `NeelNanda/pile-10k` para la calibración del decoder (512 muestras de 1024 tokens) y `lmms-lab/flickr30k` para la cabeza de salida y el encoder de visión (512 muestras de imagen-texto con secuencias de 2048 tokens). El proceso está documentado en los archivos `quantize.py`, `recipe.yaml` y `versions.txt` incluidos en el repositorio.

## Capacidades

- Generación de texto a partir de imágenes (image-text-to-text), incluyendo descripción de imágenes, respuesta a preguntas visuales (VQA) y comprensión de escenas.
- Soporte multilingüe, aunque no se especifican los idiomas concretos cubiertos.
- Capacidad conversacional, al ser un modelo de lenguaje multimodal entrenado para diálogo.
- Inferencia eficiente en dispositivos de borde gracias a la cuantización INT4/INT8 y al tamaño reducido del checkpoint (1,3 GB).
- Compatible con el ecosistema Transformers de Hugging Face, lo que facilita su integración en pipelines existentes.

No se ha confirmado soporte para tool calling, function calling, razonamiento multi-paso o modos de pensamiento explícitos en la información disponible.

## Casos de uso

- Asistentes visuales en dispositivos móviles o embebidos: el modelo puede analizar imágenes capturadas por la cámara y responder preguntas sobre su contenido, gracias a su tamaño reducido y cuantización que permiten ejecutarlo en hardware con poca memoria.
- Automatización de atención al cliente con soporte de imágenes: integrado en un chatbot, puede recibir capturas de pantalla o fotos de productos y generar respuestas contextuales, manteniendo conversaciones multi-turno dentro de su ventana de 32K tokens.
- Clasificación y etiquetado de imágenes en sistemas de gestión documental: el modelo puede extraer descripciones o categorías de imágenes almacenadas, facilitando la búsqueda y organización en entornos con recursos limitados.
- Accesibilidad para personas con discapacidad visual: como componente de una aplicación de lectura de imágenes, puede describir escenas, leer texto en imágenes (OCR básico) o identificar objetos en tiempo real en dispositivos de bajo consumo.
- Prototipado rápido de aplicaciones multimodales en el borde: al ser un checkpoint precompilado para SiMa.ai, permite a los desarrolladores validar flujos de trabajo de visión-lenguaje en hardware de borde antes de optimizar para producción.
- Educación y formación: utilizado en plataformas de aprendizaje interactivo que requieren responder preguntas sobre diagramas, ilustraciones o fotografías en dispositivos sin GPU dedicada.

## Benchmarks y rendimiento

La model card proporciona resultados de evaluación en MMStar (conjunto completo de 1500 ejemplos) para el modelo fuente y la versión cuantizada:

| Checkpoint | Precisión general (MMStar) | Cambio absoluto | Cambio relativo |
|---|---:|---:|---:|
| LiquidAI/LFM2-VL-1.6B (fuente) | 49,6667 % | — | — |
| simaai/LFM2-VL-1.6B-Autoround-Safetensors | 48,2667 % | -1,4000 puntos | -2,8188 % |

No se han publicado resultados en otros benchmarks como MMLU, HumanEval o GSM8K en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con pesos cuantizados de aproximadamente 1,3 GB, se estima un consumo de memoria de entre 2 y 4 GB, dependiendo de la longitud de secuencia y el tamaño del lote. No se dispone de mediciones oficiales.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM (p. ej., NVIDIA GTX 1650, RTX 3050, Jetson Orin Nano) puede ejecutar el modelo. Para despliegue en borde, SiMa.ai ofrece su propio hardware, para el cual está destinado este checkpoint.
- Compatibilidad con GPU de consumo: sí, cabe en GPUs de gama baja y media.
- Opciones de despliegue: el checkpoint está pensado para compilarse con LLiMa para hardware Sima.ai. También puede usarse con Transformers de Hugging Face, y potencialmente con vLLM o TGI si se convierten los pesos, aunque no se ha documentado.
- Latencia y throughput: no se han publicado datos concretos. Al ser un modelo de 1,6B cuantizado, se espera una latencia baja en hardware moderno, pero depende de la implementación y del acelerador.

## Comparativa con modelos similares

No se dispone de datos comparativos directos con otros modelos de la misma categoría en la información proporcionada. Sin embargo, se puede situar cualitativamente:

| Modelo | Parámetros | Contexto | Modalidad | Licencia | Observaciones |
|---|---|---|---|---|---|
| simaai/LFM2-VL-1.6B-Autoround | 1,72B | 32K | Imagen-texto | other | Cuantizado para edge, MMStar 48,27 % |
| LiquidAI/LFM2-VL-1.6B (fuente) | 1,72B | 32K | Imagen-texto | other | Modelo original, MMStar 49,67 % |
| LiquidAI/LFM2.5-VL-1.6B | 1,6B (aprox.) | 32K | Imagen-texto | other | Sucesor con mejor comprensión visual y razonamiento |

No se han encontrado comparaciones con otros VLM de tamaño similar como Phi-3.5-vision o MiniCPM-V en las fuentes consultadas.

## Limitaciones y advertencias

- La cuantización puede degradar el rendimiento en ciertos idiomas, dominios visuales, formatos de prompt o longitudes de contexto; la model card recomienda validar el modelo en la carga de trabajo específica antes de producción.
- La licencia es "other" y se aplican las restricciones del modelo base de Liquid AI; es necesario revisar los términos exactos antes de cualquier uso comercial.
- El modelo base LFM2-VL-1.6B ha sido superado por LFM2.5-VL-1.6B, que ofrece mejor comprensión visual y razonamiento; para aplicaciones nuevas se recomienda evaluar la versión más reciente.
- No se han publicado datos sobre sesgos, alucinaciones o riesgos específicos de este modelo. Como todo VLM, puede generar descripciones inexactas o inventar detalles sobre imágenes.
- Este checkpoint es un paso intermedio para compilación en hardware SiMa.ai; no está pensado para despliegue directo en otros aceleradores sin conversión adicional.
- La reproducción de la cuantización depende de versiones exactas de Python, CUDA, Torch, Transformers, llmcompressor, AutoRound y compressed-tensors, que se registran en `versions.txt`; cambios en el entorno pueden afectar a los resultados.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/simaai/LFM2-VL-1.6B-Autoround-Safetensors)
- [Modelo base LiquidAI/LFM2-VL-1.6B](https://huggingface.co/LiquidAI/LFM2-VL-1.6B)
- [Documentación de LFM2-VL-1.6B en Liquid Docs](https://docs.liquid.ai/lfm/models/lfm2-vl-1.6b)
- [Informe técnico de LFM2 (arXiv)](https://arxiv.org/html/2511.23404v1)
- [Página de modelos de Liquid AI](https://www.liquid.ai/models)
