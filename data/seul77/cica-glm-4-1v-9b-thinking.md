# seul77/CICA-GLM-4.1V-9B-Thinking

## Resumen

CICA-GLM-4.1V-9B-Thinking es un ajuste fino del modelo multimodal GLM-4.1V-9B-Thinking de Zhipu AI (zai-org), publicado por el usuario seul77 (Chanseul Cho y colaboradores). El modelo parte de la arquitectura GLM-4V del modelo base y se entrena con una técnica de aprendizaje por refuerzo denominada CICA (cross-image credit assignment), descrita en el artículo *ASTERISM: Do Multimodal LLMs Actually Look at All the Images?*. El objetivo es mejorar el razonamiento sobre múltiples imágenes simultáneas, un escenario donde los modelos multimodales tienden a apoyarse en una sola imagen e ignorar el resto.

CICA extiende el RLVR (reinforcement learning with verifiable rewards) comparando, para cada token de la respuesta, la verosimilitud bajo el conjunto completo de imágenes frente a la verosimilitud bajo la mejor imagen individual, y redistribuye la recompensa hacia los tokens que realmente requieren más de una imagen. La innovación clave es que no añade parámetros, rollouts ni pasos adicionales de retropropagación: reutiliza el mismo dato, la misma función de recompensa y el mismo objetivo de RL.

El modelo tiene 10.292.777.472 parámetros (unos 10,3 mil millones), se distribuye en safetensors con un repositorio de 20,6 GB y licencia MIT, lo que lo hace directamente utilizable en producción comercial. Es relevante para desarrolladores que necesitan comparación y razonamiento multi-imagen (documentos escaneados, series de imágenes médicas, inspección visual) y quieren una mejora medible sobre el modelo base sin coste adicional de inferencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GLM-4V (transformer multimodal, vision-language) |
| Parametros totales | 10.292.777.472 (unos 10,3 B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors; cuantizacion no especificada en la model card) |
| Idiomas soportados | no disponible (heredados del modelo base GLM-4.1V-9B-Thinking) |
| Licencia | MIT |
| Formato de pesos | safetensors (transformers) |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura GLM-4V del modelo base zai-org/GLM-4.1V-9B-Thinking: un transformer multimodal que procesa entradas image-text-to-text mediante un procesador (`AutoProcessor`) y un modelo de generación condicional (`Glm4vForConditionalGeneration`). La configuración, el tokenizer y el procesador son idénticos a los del modelo base, por lo que la integración con transformers es directa.

El entrenamiento se realiza sobre el dataset ASTERISM-Train aplicando CICA, una variante de RLVR descrita en el artículo arXiv:2611.32316. Para cada token de la respuesta, CICA compara la probabilidad de la política bajo todas las imágenes con la probabilidad bajo la mejor imagen individual y desplaza el crédito hacia los tokens que necesitan más de una imagen. No introduce parámetros nuevos ni rollouts adicionales, y mantiene el objetivo de RL original; los detalles de entrenamiento siguen las secciones F y G del artículo. La evaluación se hace con decodificación greedy.

## Capacidades

- Generación de texto y razonamiento multimodal sobre entradas image-text-to-text.
- Razonamiento multi-imagen: comparación, correspondencia y agregación de información entre varias imágenes en una misma consulta.
- Modo "thinking" (razonamiento extendido) heredado del modelo base GLM-4.1V-9B-Thinking.
- Conversación multi-turno (pipeline `conversational`).
- Procesamiento de múltiples imágenes en un mismo mensaje (tag `multi-image`).
- Integración con transformers mediante `Glm4vForConditionalGeneration` y `AutoProcessor`.
- Compatibilidad con endpoints (`endpoints_compatible`).
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Capacidades de audio: no disponible.

## Casos de uso

- Comparación de imágenes de producto: dado un conjunto de fotos de un mismo artículo desde ángulos distintos, el modelo identifica cuál muestra el mismo objeto desde otra perspectiva, aprovechando el entrenamiento CICA para no colapsar a una sola imagen.
- Verificación de documentos multi-página: extracción y contraste de datos entre varias páginas escaneadas (facturas, contratos) en una sola consulta, donde la coherencia entre imágenes es esencial.
- Inspección visual industrial: comparación de imágenes de una misma pieza en distintos estados o momentos para detectar defectos o cambios, usando el razonamiento multi-imagen reforzado.
- Análisis de series de imágenes médicas o científicas: correlación de hallazgos entre múltiples capturas o cortes, un escenario donde el modelo base tiende a ignorar imágenes secundarias.
- Moderación y consistencia de contenido visual: comprobación de que varias imágenes de un anuncio o publicación son coherentes entre sí antes de publicarlas.
- Asistentes de accesibilidad: descripción conjunta de varias imágenes aportadas por el usuario, manteniendo la referencia a cada una de ellas en la respuesta.
- Evaluación comparativa de modelos multimodales: uso del modelo junto con el benchmark ASTERISM (repositorio GitHub) para medir razonamiento multi-imagen en pipelines de investigación.

## Benchmarks y rendimiento

| Modelo | ASTERISM (media macro, greedy) |
|---|---:|
| GLM-4.1V-9B-Thinking | 58,7 |
| CICA-GLM-4.1V-9B-Thinking | 61,3 |

La puntuación ASTERISM es la media macro sobre las siete categorías de tareas del benchmark. No se han publicado otros resultados (MMLU, HumanEval, GSM8K, etc.) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 10,3 B parámetros, en fp16 se requieren aproximadamente 20,6 GB de pesos, más overhead de activaciones y del procesador visual.
- GPU recomendadas: no especificadas en la model card. Por tamaño, una A100 40/80 GB o H100 son adecuadas para fp16; una RTX 4090 (24 GB) queda al límite en fp16 y requeriría cuantización para mayor holgura.
- ¿Cabe en consumer GPU? No confirmado por el autor; en fp16 no cabe con comodidad en GPUs de 24 GB, y no se documentan pesos GGUF ni cuantizaciones oficiales.
- Opciones de despliegue: transformers con `accelerate` (ejemplo oficial con `device_map="auto"`). Compatibilidad con vLLM, llama.cpp, Ollama o TGI: no disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Benchmark ASTERISM | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| CICA-GLM-4.1V-9B-Thinking | 10,3 B | no disponible | 61,3 | MIT | Hugging Face (seul77) |
| GLM-4.1V-9B-Thinking (base) | ~9 B (según nombre) | no disponible | 58,7 | MIT (heredada) | Hugging Face (zai-org) |
| Otros modelos multimodales multi-imagen | no disponible | no disponible | no disponible | no disponible | no disponible |

La única comparación con datos en la información proporcionada es frente al modelo base, sobre el que CICA mejora 2,6 puntos en la media macro de ASTERISM.

## Limitaciones y advertencias

- El modelo es un ajuste fino de investigación; la model card no documenta sesgos específicos ni evaluaciones de seguridad.
- Riesgo de alucinación inherente a los modelos de lenguaje y visión; no se han publicado tasas de error en la información disponible.
- La longitud de contexto no está especificada; el ejemplo oficial usa `max_new_tokens=16384`, pero no se confirma la ventana de entrada.
- Los idiomas soportados no están documentados; se heredan del modelo base sin verificación explícita.
- `generation_config.json` conserva los valores de muestreo por defecto del modelo base, mientras que las puntuaciones ASTERISM se obtuvieron con decodificación greedy; para reproducir resultados hay que forzar `do_sample=False`.
- El repositorio tiene 0 descargas y 1 like en el momento de la consulta, por lo que la validación por la comunidad es mínima.
- Aunque la licencia es MIT, conviene revisar las condiciones del modelo base y de los datos de entrenamiento (ASTERISM-Train) para uso comercial.
- El benchmark ASTERISM es específico del artículo de los autores; no hay resultados en benchmarks estándar que permitan comparar con otros modelos multimodales.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/seul77/CICA-GLM-4.1V-9B-Thinking
- Modelo base: https://huggingface.co/zai-org/GLM-4.1V-9B-Thinking
- Dataset de entrenamiento: https://huggingface.co/datasets/seul77/ASTERISM-Train
- Repositorio de evaluación ASTERISM: https://github.com/chanseul01/ASTERISM
- Artículo: https://arxiv.org/abs/2611.32316
