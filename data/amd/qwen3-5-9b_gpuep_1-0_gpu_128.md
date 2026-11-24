# amd/Qwen3.5-9B_gpuep_1.0_gpu_128

## Resumen

Qwen3.5-9B_gpuep_1.0_gpu_128 es una exportación ONNX cuantizada del modelo multimodal Qwen/Qwen3.5-9B, publicada por AMD para su despliegue optimizado en hardware AMD Ryzen AI mediante la GPU de dichos procesadores. No se trata de un modelo entrenado desde cero, sino de una conversión de pesos orientada a inferencia local: el autor ha aplicado cuantización INT4 en los pesos de las capas lineales (RTN, group size 32), manteniendo activaciones, embeddings y la torre de visión en FP16. El resultado es un paquete de 7,5 GB que conserva la naturaleza image-text-to-text del modelo base.

La relevancia de esta ficha radica en que ejemplifica el patrón actual de distribución de modelos abiertos: el checkpoint original en safetensors se transforma en artefactos específicos por acelerador (en este caso ONNX Runtime con el proveedor DirectML, o DML, para GPUs integradas de AMD). Esto permite ejecutar un modelo de 9 000 millones de parámetros con capacidades de visión en un portátil o mini-PC con Ryzen AI, sin necesidad de GPU dedicada.

Conviene subrayar que la model card es extremadamente escueta: no documenta idiomas, contexto, datos de entrenamiento ni resultados de benchmarks. Toda la información técnica disponible procede de los metadatos de Hugging Face y de la receta de exportación de Olive, por lo que los apartados que dependen de datos no publicados se marcan explícitamente como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (image-text-to-text) del modelo base Qwen3.5-9B; exportado a formato ONNX Runtime |
| Parametros totales | 9 000 millones (según el nombre del modelo base; el desglose exacto texto/visión no está disponible) |
| Parametros activos | No aplica (no es MoE según la información disponible) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Pesos INT4 (RTN, group size 32, MatMulNBits); activaciones FP16; visión FP16; embeddings FP16 |
| Idiomas soportados | No disponible |
| Licencia | Apache-2.0 (modelo base); modificaciones de AMD bajo MIT |
| Formato de pesos | ONNX (artefactos de Olive / OGA Model Builder, con `genai_config.json`) |

## Arquitectura y entrenamiento

El modelo subyacente es Qwen3.5-9B, un transformer multimodal que procesa entradas de imagen y texto y genera texto. La model card no describe la arquitectura interna (número de capas, dimensiones ocultas, mecanismo de atención, tipo de encoder visual) ni los datos de entrenamiento: no se indica el número de tokens, la composición del corpus ni si hubo fases de RLHF, DPO o aprendizaje por refuerzo. Tampoco se detalla ninguna innovación técnica del modelo base, como decodificación especulativa o atención lineal.

Lo que sí está documentado es el proceso de transformación aplicado por AMD. La exportación se realizó con Olive y OGA Model Builder siguiendo la receta publicada en el repositorio microsoft/olive-recipes para Qwen-Qwen3.5-9B. Para obtener el artefacto se sustituye el proveedor de ejecución CUDA por DirectML (DML) en los tres grafos (texto, visión y embeddings), se añade la operación `RemoveMemcpy` al final de la receta de visión y, para la variante de CPU, se eliminan las opciones del proveedor DML del fichero `genai_config.json`. La cuantización es RTN (round-to-nearest) con group size 32 sobre pesos INT4, mientras que la torre de visión y las embeddings permanecen en FP16, una decisión habitual para preservar calidad en la codificación visual.

## Capacidades

- Generación de texto conversacional multi-turno, heredada del modelo base Qwen3.5-9B.
- Comprensión de imágenes y respuesta en texto (pipeline `image-text-to-text`), incluyendo descripción, respuesta a preguntas visuales y extracción de información de documentos.
- Razonamiento y resolución de problemas descritos en lenguaje natural (capacidad del modelo base; sin benchmarks que la cuantifiquen en esta exportación).
- Generación y explicación de código (capacidad del modelo base; no verificada en esta variante cuantizada).
- Capacidades multilingües: no documentadas en la model card.
- Soporte de tool calling / function calling: no documentado para esta exportación.
- Soporte de agentes y razonamiento multi-paso: no documentado.
- Modo thinking, audio u otras capacidades especiales: no disponibles en la información proporcionada.

## Casos de uso

- Asistentes locales con entrada visual en portátiles Ryzen AI: el paquete ONNX con proveedor DirectML permite ejecutar un modelo de 9B con visión sobre la GPU integrada, útil para prototipos de asistente que describen capturas de pantalla o fotos sin enviar datos a la nube.
- Digitalización de documentos en el dispositivo: al aceptar imagen y texto, puede transcribir y resumir facturas, albaranes o formularios en un flujo local, lo que resulta adecuado en entornos con requisitos de privacidad (sanidad, legal, administración pública).
- Accesibilidad: descripción automática de imágenes para usuarios con discapacidad visual en aplicaciones de escritorio, aprovechando la ejecución local y la baja dependencia de red.
- Soporte técnico de primera línea con capturas: el modelo puede recibir una captura de error junto con la consulta del usuario y devolver una explicación o pasos de resolución, integrándose en herramientas de helpdesk.
- Análisis de imágenes industriales o de campo: inspección visual asistida (lectura de etiquetas, paneles, indicadores) en dispositivos edge con Ryzen AI, donde no hay GPU dedicada disponible.
- Generación de código asistida en IDE: aunque no está documentado el soporte de tool calling, el modelo base puede emplearse para autocompletado y explicación de fragmentos; la variante INT4 reduce la huella para ejecutarse junto al editor en el mismo equipo.
- Enriquecimiento de catálogos de producto: generación de descripciones y metadatos a partir de fotos de producto, en lotes ejecutados localmente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de MMLU, HumanEval, GSM8K, MMMU ni evaluaciones de calidad tras la cuantización INT4, ni datos de latencia o throughput en hardware Ryzen AI.

## Requisitos de hardware

- VRAM estimada: el repositorio ocupa 7,5 GB, lo que sugiere un peso en disco/memoria en torno a esa cifra para los pesos INT4 más componentes FP16; la memoria de trabajo en inferencia será superior por el KV cache y las activaciones, aunque no se publica una cifra exacta.
- GPU recomendadas: el artefacto está diseñado para GPUs integradas de procesadores AMD Ryzen AI (proveedor DirectML). No se documenta compatibilidad con A100, H100 ni RTX 4090, y el uso de DirectML limita la portabilidad a entornos Windows/AMD.
- GPU de consumo: el objetivo declarado es precisamente hardware de consumo integrado (Ryzen AI), no GPUs discretas.
- Opciones de despliegue: ONNX Runtime con proveedor DirectML (GPU) o CPU (eliminando las opciones DML de `genai_config.json`); generado con Olive y OGA Model Builder. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no consumen este formato de la misma manera.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Enfoque |
|---|---|---|---|---|---|
| amd/Qwen3.5-9B_gpuep_1.0_gpu_128 | 9B | No disponible | ONNX (INT4/FP16) | Apache-2.0 + MIT (modificaciones) | Despliegue en Ryzen AI vía DirectML |
| Qwen/Qwen3.5-9B (base) | 9B | No disponible | Safetensors | Apache-2.0 | Checkpoint original multimodal |
| Otras exportaciones ONNX de la familia Qwen | 9B | No disponible | ONNX | Apache-2.0 | Despliegue multiplataforma |

No se dispone de datos de rendimiento comparado entre estas variantes, por lo que la comparación se limita a parámetros, formato y licencia.

## Limitaciones y advertencias

- La cuantización INT4 con group size 32 puede degradar la calidad respecto al modelo base, especialmente en tareas de razonamiento numérico y en la fidelidad de la descripción visual; no se publican evaluaciones que lo cuantifiquen.
- La model card no documenta sesgos conocidos, pero al heredar el comportamiento del modelo base, es previsible que arrastre los sesgos de sus datos de entrenamiento (no disponibles).
- Riesgo de alucinación inherente a los modelos generativos, agravado en tareas de OCR o lectura de documentos donde una cifra mal transcrita puede pasar desapercibida.
- Idiomas soportados no documentados: no se puede garantizar un rendimiento aceptable fuera del inglés o el chino sin evaluación previa.
- Longitud de contexto no documentada, lo que impide planificar casos de uso con documentos largos o conversaciones extensas.
- Restricciones de licencia: el modelo base es Apache-2.0 y las modificaciones de AMD se publican bajo MIT, pero la model card incluye una nota de copyright de AMD sobre los ficheros modificados; conviene revisar ambas licencias antes de un uso comercial.
- Dependencia de hardware: el artefacto está optimizado para DirectML y Ryzen AI; no es portable a CUDA sin reexportación, y la ruta de CPU requiere editar `genai_config.json`.
- El repositorio tiene 164 descargas y 0 likes en el momento de la consulta, lo que indica una validación comunitaria muy limitada; no hay informes independientes de calidad.
- No se documenta soporte de tool calling ni de agentes, por lo que no debe asumirse en producción sin pruebas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/amd/Qwen3.5-9B_gpuep_1.0_gpu_128
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- Receta de exportación Olive: https://github.com/microsoft/olive-recipes/tree/main/Qwen-Qwen3.5-9B
- Repositorio Olive: https://github.com/microsoft/Olive
- Licencia Apache-2.0: http://www.apache.org/licenses/LICENSE-2.0
