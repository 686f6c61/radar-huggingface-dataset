# kerasformers/internvl3.5-4b

## Resumen

`kerasformers/internvl3.5-4b` es una conversión íntegra en Keras 3 del checkpoint oficial `OpenGVLab/InternVL3_5-4B-HF`, publicada por el equipo de KerasFormers. El modelo original, InternVL3.5, es una familia de modelos multimodales de código abierto desarrollada por OpenGVLab que integra un codificador de visión (InternViT), un conector MLP y un decodificador de lenguaje basado en Qwen2, ofreciendo capacidades de comprensión de imagen y texto con generación de respuestas textuales.

La relevancia de esta conversión radica en que permite ejecutar el mismo checkpoint sobre tres backends distintos (TensorFlow, PyTorch y JAX) sin modificar el código, lo que facilita la portabilidad y el despliegue en entornos heterogéneos. Los pesos se almacenan en bfloat16 y el repositorio ocupa aproximadamente 9,5 GB. El modelo tiene una arquitectura de unos 4 000 millones de parámetros y soporta entrada multimodal imagen-texto con salida de texto, mediante el procesador `InternVLProcessor` incluido en la librería.

La licencia es Apache 2.0, lo que permite uso comercial sin restricciones adicionales más allá de las del modelo base. El idioma principal soportado es el inglés, aunque el modelo base puede presentar cierta capacidad multilingüe heredada de Qwen2. Este lanzamiento es relevante para desarrolladores que trabajan con Keras y necesitan un modelo vision-language de tamaño medio, eficiente y reproducible en múltiples frameworks.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | InternViT (vision) + pixel-shuffle downsampler + MLP connector + decodificador Qwen2 (texto) |
| Parametros totales | 4 000 millones (aprox., segun el checkpoint base) |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | no disponible (depende del checkpoint base OpenGVLab/InternVL3_5-4B-HF) |
| Tipos de cuantizacion | bfloat16 (pesos almacenados); no se documentan cuantizaciones adicionales |
| Idiomas soportados | ingles (declarado en la model card); otros idiomas no confirmados |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (repositorio Keras, 9,5 GB) |

## Arquitectura y entrenamiento

La arquitectura sigue el diseño de InternVL3.5: una torre de visión InternViT procesa las imagenes, seguida de un downsampler por pixel-shuffle y un conector MLP que proyecta las características visuales al espacio de texto. El decodificador de lenguaje es un modelo Qwen2 adaptado (inline) que genera las respuestas. Las imagenes se dividen dinámicamente en teselas: el procesador selecciona una cuadrícula de teselas ajustada a la proporción de aspecto (entre `min_patches` y `max_patches`) y opcionalmente añade una miniatura global; cada tesela se convierte en `image_seq_length` tokens.

El entrenamiento del modelo original, descrito en el blog oficial de InternVL3.5, incluye una etapa adicional llamada Visual Consistency Learning (ViCO) para la versión Flash, que reduce el coste de tokens por parche de imagen. En la práctica, cada parche de imagen se representa como 256 o 64 tokens, y se introduce un modelo de referencia congelado inicializado con InternVL3.5. Los detalles completos de datos de entrenamiento, número de tokens y pipeline de alineación (RLHF/DPO) no se especifican en la información disponible para esta conversión.

## Capacidades

- Generación de texto multimodal: acepta una o varias imagenes junto con texto de usuario y produce respuestas textuales descriptivas o analíticas.
- Comprensión de imagen a alto nivel: capaz de describir escenas, objetos, personas y relaciones espaciales en una imagen.
- Soporte de conversación multi-turno: el procesador `InternVLProcessor` gestiona historiales de conversación con roles de usuario y asistente.
- Procesamiento de imagenes con proporciones de aspecto variables: el tileo dinámico ajusta la resolución efectiva sin deformar la imagen.
- Integración con Keras 3: el mismo código funciona en TensorFlow, PyTorch y JAX, lo que permite experimentar con distintos backends.
- Inferencia condicionada: generación con `max_new_tokens` configurable y decodificación autoregresiva estándar.
- No se documenta soporte explicito de tool calling, function calling, agentes, vision fine-grained (deteccion de objetos) ni audio.

## Casos de uso

- Descripcion automatica de imagenes para accesibilidad: el modelo puede generar texto alternativo detallado para imagenes en sitios web o documentos, mejorando la accesibilidad para personas con discapacidad visual. Su tamaño de 4B lo hace viable en entornos con recursos moderados.
- Asistente de vision para soporte tecnico: un usuario puede enviar una captura de pantalla de un error y el modelo describe el contenido, ayudando a diagnosticar problemas sin necesidad de un agente humano. La ventana de contexto y el tileo dinamico permiten analizar imagenes de resoluciones variadas.
- Analisis de documentos escaneados: combinado con OCR externo, el modelo puede interpretar tablas, diagramas o graficos presentes en documentos y responder preguntas sobre ellos, facilitando tareas de extraccion de informacion.
- Educacion y tutoria visual: el modelo puede explicar figuras, esquemas o fotografias en contextos educativos, generando respuestas adaptadas al nivel del estudiante. Su licencia Apache 2.0 permite integrarlo en plataformas educativas comerciales.
- Etiquetado y organizacion de bibliotecas de imagenes: para empresas con grandes volumenes de fotos o ilustraciones, el modelo puede generar descripciones cortas que permitan indexar y buscar contenido visual de forma automatica.
- Prototipado rapido de aplicaciones multimodales: gracias a la conversion en Keras 3, los desarrolladores pueden construir prototipos de chatbots con vision, asistentes de compra o herramientas de moderacion de contenido usando un unico codigo base que se ejecuta en TensorFlow, JAX o PyTorch.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card de la conversion no incluye metricas como MMLU, HumanEval, GSM8K ni evaluaciones específicas de tareas visuales (VQAv2, TextVQA, etc.). Para datos de rendimiento del modelo original, se recomienda consultar la model card de `OpenGVLab/InternVL3_5-4B-HF` o el blog oficial de InternVL3.5.

## Requisitos de hardware

- VRAM estimada para inferencia: con pesos en bfloat16 y 4B parametros, se necesitan aproximadamente 8-10 GB de VRAM para cargar el modelo en memoria sin cuantizacion adicional. Con cuantizacion a 8 bits podria reducirse a unos 5-6 GB.
- GPU recomendadas: NVIDIA RTX 3090/4090 (24 GB), A100 (40/80 GB), H100 (80 GB) o cualquier GPU con al menos 12 GB de VRAM para margen de generacion.
- Compatibilidad con consumer GPU: si, una RTX 3060 de 12 GB o superior puede ejecutar el modelo en bfloat16 con secuencias cortas; para contextos largos o lotes grandes se recomienda 24 GB o mas.
- Opciones de despliegue: al ser una conversion Keras 3, el modelo se puede servir con TensorFlow Serving, TorchServe o mediante un servidor Python personalizado. No se menciona compatibilidad directa con vLLM, llama.cpp u Ollama en la informacion disponible.
- Latencia y throughput: no se proporcionan datos medidos. Como referencia orientativa, un modelo de 4B en bfloat16 en una RTX 4090 suele generar entre 20 y 40 tokens por segundo, pero esto depende del backend, la longitud de la secuencia y el numero de teselas de imagen.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| kerasformers/internvl3.5-4b | 4B | no disponible | Apache 2.0 | Keras 3 (bf16) | Conversion Keras, multi-backend |
| OpenGVLab/InternVL3_5-4B-HF | 4B | no disponible | Apache 2.0 | PyTorch (safetensors) | Checkpoint original de referencia |
| KerasFormers/qwen3.5-4b | 4B | no disponible | Apache 2.0 | Keras 3 (bf16) | Solo texto, misma libreria de conversion |

No se dispone de datos de rendimiento comparativo entre estos modelos. La principal diferencia entre la conversion Keras y el checkpoint original es el formato de pesos y la portabilidad entre backends; las capacidades funcionales deberian ser equivalentes, aunque pueden existir pequenas diferencias numericas debidas a la conversion.

## Limitaciones y advertencias

- La model card de la conversion no detalla sesgos conocidos, pero el modelo base InternVL3.5 puede heredar sesgos de los datos de entrenamiento, especialmente en tareas de generacion de descripciones sobre personas o culturas.
- Riesgo de alucinacion: como cualquier modelo generativo, puede producir descripciones inexactas o inventar detalles no presentes en la imagen, especialmente en escenas complejas o de baja resolucion.
- Idioma limitado: la model card declara exclusivamente ingles. El uso en otros idiomas puede degradar la calidad de las respuestas o producir resultados incoherentes.
- Longitud de contexto no documentada: se desconoce la ventana de contexto exacta soportada, lo que dificulta planificar tareas que requieran multiples imagenes o conversaciones largas.
- Sin soporte de cuantizacion documentado: los pesos se distribuyen en bfloat16; no se ofrecen versiones GGUF, AWQ ni GPTQ, lo que limita el despliegue en entornos con poca VRAM.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero se debe mantener el aviso de copyright y las condiciones de la licencia al redistribuir el modelo o sus derivados.
- Dependencia de la libreria kerasformers: el modelo solo puede cargarse con esta libreria especifica, que es un proyecto independiente y puede tener menos soporte comunitario que ecosistemas como transformers.

## Enlaces

- Repositorio HuggingFace de la conversion: https://huggingface.co/kerasformers/internvl3.5-4b
- Model card del checkpoint original: https://huggingface.co/OpenGVLab/InternVL3_5-4B-HF
- Blog oficial de InternVL3.5: https://internvl.github.io/blog/2025-08-26-InternVL-3.5/
- Documentacion de KerasFormers para InternVL: https://imvision12.github.io/KerasFormers/internvl/
- Repositorio GitHub de KerasFormers: https://github.com/IMvision12/KerasFormers
- Repositorio GitHub de InternVL (OpenGVLab): https://github.com/OpenGVLab/InternVL
- Coleccion de modelos InternVL en HuggingFace: https://huggingface.co/collections/kerasformers/internvl-6a8277076dbb163f53241dbd
- Conversion de Qwen3.5-4B en Keras (modelo comparable): https://huggingface.co/KerasFormers/qwen3.5-4b
