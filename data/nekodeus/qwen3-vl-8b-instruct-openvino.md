# Nekodeus/qwen3-vl-8b-instruct-openvino

## Resumen

Nekodeus/qwen3-vl-8b-instruct-openvino es una conversión a OpenVINO IR del modelo multimodal Qwen/Qwen3-VL-8B-Instruct, publicada por el usuario Nekodeus. No se trata de un modelo entrenado desde cero, sino de una redistribución de los pesos originales de Qwen con cuantización de solo pesos a INT8 mediante NNCF, pensada para ejecutar inferencia de imagen-texto en hardware Intel sin GPU dedicada. El repositorio ocupa 8,8 GB y se distribuye con licencia Apache-2.0.

El modelo resuelve el problema de desplegar un VLM de 8,8 mil millones de parámetros en CPU, iGPU o NPU mediante el runtime OpenVINO, algo relevante para entornos de borde, portátiles sin GPU y servidores donde el coste energético o la ausencia de aceleradores NVIDIA condicionan el despliegue. Mantiene la tarea `image-text-to-text` del modelo base, con codificador visual, módulo merger, embeddings de texto y modelo de lenguaje, además de soporte de vídeo, comprensión de documentos y modo de razonamiento (thinking mode).

La relevancia de esta ficha es doble: por un lado, permite evaluar una alternativa de despliegue INT8 sobre OpenVINO; por otro, conviene subrayar que es una conversión de la comunidad, sin descargas ni valoraciones, sin resultados de benchmarks publicados y sin datos sobre idiomas o evaluación de calidad tras la cuantización. La información disponible no permite verificar la degradación introducida por el INT8 ni el rendimiento real frente a los pesos originales.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer multimodal: codificador visual + merger + embeddings de texto + modelo de lenguaje (Qwen3VLForConditionalGeneration) |
| Parámetros totales | 8,8 mil millones (8.8B) |
| Parámetros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | 262.144 tokens (262k) |
| Tipos de cuantización | INT8 de solo pesos (NNCF); activaciones FP16/FP32 según el trazado |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | OpenVINO IR (no safetensors ni GGUF) |

## Arquitectura y entrenamiento

La arquitectura es la del modelo base Qwen3-VL-8B-Instruct: un transformer multimodal con codificador visual, un módulo merger que proyecta las representaciones visuales al espacio del modelo de lenguaje, embeddings de texto y el modelo de lenguaje propiamente dicho. La model card menciona una máscara visual-pos unificada, soporte de vídeo y comprensión de documentos, y un modo de pensamiento (thinking mode). El contexto declarado es de 262k tokens.

No se dispone de información sobre el volumen de tokens de entrenamiento, la composición del dataset, ni sobre las etapas de ajuste (SFT, RLHF o DPO) empleadas en el modelo original; esos datos corresponden a la documentación de Qwen y no aparecen en la información proporcionada. La contribución de este repositorio es exclusivamente la conversión y cuantización: se generó con `optimum-cli export openvino --task image-text-to-text --weight-format int8`, usando `optimum-intel 2.2.0`, `openvino 2026.4.1` y `transformers 5.16.1`, en un entorno Kaggle solo CPU y sin conexión. No hay reentrenamiento ni calibración documentada más allá de la cuantización de pesos.

## Capacidades

- Generación de texto e inferencia multimodal de imagen-texto (`image-text-to-text`).
- Comprensión de imágenes: descripción, respuesta a preguntas visuales y razonamiento sobre contenido gráfico.
- Comprensión de documentos, según la model card del repositorio.
- Comprensión de vídeo, según la model card del repositorio.
- Modo de razonamiento (thinking mode) heredado del modelo base.
- Contexto largo de 262k tokens, adecuado para documentos extensos o secuencias de vídeo con muchas muestras.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible en la información proporcionada.
- Capacidades de audio: no disponible; la tarea declarada es únicamente imagen-texto.

## Casos de uso

- Procesamiento de documentos escaneados en servidores sin GPU: el modelo puede recibir imágenes de páginas o documentos completos y extraer texto y estructura; los 262k tokens de contexto permiten encadenar muchas páginas en una sola petición y el formato INT8 reduce el coste de memoria en CPU.
- Digitalización de facturas y formularios en un pipeline por lotes: con OpenVINO en CPU se puede ejecutar la inferencia en paralelo en varios núcleos o nodos, sin depender de CUDA, lo que simplifica el despliegue en infraestructura existente.
- Descripción automática de imágenes para accesibilidad: generación de texto alternativo en un CMS o aplicación móvil, ejecutando el modelo en un portátil o mini-PC Intel con 16 GB de RAM.
- Análisis de vídeo para resumen y etiquetado: muestreo de fotogramas y consulta en una sola ventana de contexto para obtener resúmenes de reuniones, grabaciones de clase o material de vigilancia, con la ventaja de no requerir GPU dedicada.
- Asistencia técnica con capturas de pantalla: el modelo puede interpretar una captura de error junto con el texto del usuario y proponer pasos de resolución, integrándose en un chatbot interno mediante `OVModelForVisualCausalLM`.
- Inspección visual en entornos de borde: clasificación y descripción de imágenes de cámara en fábrica o laboratorio, donde el hardware disponible es una CPU Intel o una NPU y no hay sitio para un servidor con A100/H100.
- Prototipado y evaluación de VLM en local: investigadores que quieran comparar el comportamiento del modelo base frente a la versión INT8 en su propia máquina antes de decidir un despliegue en producción.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de MMLU, HumanEval, GSM8K, MMMU ni de ninguna otra evaluación, ni tampoco comparaciones con el modelo base en FP16/BF16. Tampoco se documentan latencia ni throughput medidos.

## Requisitos de hardware

- Peso de los pesos: aproximadamente 8,8 GB en INT8, coherente con el tamaño del repositorio (8,8 GB). El codificador visual y el merger están incluidos en esa cifra.
- Memoria total estimada para inferencia: en torno a 10-12 GB entre pesos, runtime y estados intermedios, sin contar la caché KV. Estimación orientativa, no publicada por el autor.
- RAM del sistema: 16 GB como mínimo práctico; 32 GB recomendables si se usan contextos largos o varias peticiones concurrentes.
- Caché KV: no se dispone de la configuración de atención del modelo base en la información proporcionada; con 262k tokens la caché puede ser muy voluminosa, por lo que conviene limitar la longitud efectiva en producción.
- GPU: al ser OpenVINO IR, el objetivo natural son CPU Intel, iGPU y NPU. Para GPU discretas NVIDIA no es el formato adecuado; en ese caso conviene usar los pesos originales con vLLM o TGI.
- GPU de consumo: cabe en tarjetas con 12-16 GB de VRAM (por ejemplo, RTX 4070/4080/4090) si se ejecuta mediante el plugin GPU de OpenVINO, aunque el rendimiento no está documentado. En CPU cabe en equipos de 16 GB de RAM.
- Opciones de despliegue: `optimum-intel` con `OVModelForVisualCausalLM` y `OpenVINO GenAI` con `ov::genai::VLMPipeline` en C++. No es compatible directamente con vLLM, llama.cpp, Ollama ni TGI sin reconvertir los pesos.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato / cuantización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Nekodeus/qwen3-vl-8b-instruct-openvino | 8,8B | 262k | OpenVINO IR, INT8 de solo pesos | Apache-2.0 | Repositorio de la comunidad, 0 descargas y 0 likes en el momento de la consulta |
| Qwen/Qwen3-VL-8B-Instruct | 8,8B | 262k | Pesos originales (formato no indicado en la información) | Apache-2.0 | Modelo oficial de Qwen |
| Alternativas de la misma categoría (otros VLM de 7-9B) | no disponible | no disponible | no disponible | no disponible | no disponible |

La información proporcionada no incluye datos de otros modelos comparables, por lo que no es posible establecer una comparación cuantitativa de rendimiento, licencia o disponibilidad más allá del modelo base.

## Limitaciones y advertencias

- Es una conversión de la comunidad, no un modelo oficial de Qwen; el mantenimiento y la validación dependen de Nekodeus.
- No se han publicado evaluaciones de la pérdida de calidad asociada a la cuantización INT8 de solo pesos; el comportamiento puede diferir del modelo base, especialmente en tareas visuales finas, OCR o razonamiento numérico.
- El repositorio no tiene descargas ni valoraciones, lo que impide inferir un uso real en producción.
- No se declaran idiomas soportados; no se puede confirmar el comportamiento en castellano ni en otras lenguas.
- Riesgo de alucinación inherente a los VLM: puede describir objetos o texto inexistentes en la imagen, y el modo de razonamiento no elimina ese riesgo.
- El contexto de 262k tokens es teórico; la memoria necesaria para la caché KV puede hacer inviable esa longitud en CPU con 16 GB de RAM.
- El formato OpenVINO IR limita el despliegue al ecosistema OpenVINO; no se puede cargar con `transformers`, vLLM, llama.cpp u Ollama sin una nueva conversión.
- La licencia Apache-2.0 permite uso comercial, pero conviene verificar los términos del modelo base Qwen3-VL-8B-Instruct y de las dependencias (`optimum-intel`, OpenVINO, NNCF) antes de distribuirlo.
- La model card no documenta limitaciones específicas de sesgo, seguridad ni filtrado de contenido.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/Nekodeus/qwen3-vl-8b-instruct-openvino
- Modelo base: https://huggingface.co/Qwen/Qwen3-VL-8B-Instruct
