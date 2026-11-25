# lyber-ai/Hy4-UNCENSORED-FP8

## Resumen

Hy4-UNCENSORED-FP8 es una versión afinada y cuantizada en FP8 del modelo multimodal Hy4 de Tencent, publicada por el usuario lyber-ai en Hugging Face. Se trata de un modelo de arquitectura Mixture-of-Experts (MoE) con aproximadamente 774.400 millones de parámetros totales, orientado a tareas de razonamiento, generación de código, tool calling y comprensión de imagen y texto (pipeline image-text-to-text). La variante "UNCENSORED" indica que se han relajado los filtros de alineación y rechazo del modelo base, y el sufijo FP8 señala que los pesos se han comprimido a punto flotante de 8 bits mediante compressed-tensors.

El modelo parte de tencent/Hy4 y hereda su soporte multilingüe para inglés, chino, español, francés, japonés, coreano y ruso, además de capacidades de razonamiento explícito y uso de herramientas. Su relevancia radica en que combina un modelo MoE de gran escala con cuantización FP8, lo que reduce los requisitos de memoria frente a los pesos en BF16 y facilita el despliegue en infraestructuras con GPUs de 80 GB o superiores. El repositorio ocupa aproximadamente 1 TB y el acceso está restringido: es necesario aceptar las condiciones en Hugging Face antes de descargarlo.

La licencia es la propia de Tencent Hunyuan (tencent-hunyuan), etiquetada como "other", por lo que las condiciones de uso comercial dependen de los términos del modelo base y de la modificación realizada por el autor del fine-tuning.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture-of-Experts (MoE), transformer multimodal (image-text-to-text); familia Hy V4 VL |
| Parametros totales | 774.434.002.142 (~774,4 mil millones) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | FP8 (compressed-tensors); no se documentan otras variantes en la informacion disponible |
| Idiomas soportados | en, zh, es, fr, ja, ko, ru |
| Licencia | tencent-hunyuan (etiquetada como "other"); acceso restringido (gated) |
| Formato de pesos | safetensors (compressed-tensors), compatible con transformers |

## Arquitectura y entrenamiento

El modelo se basa en tencent/Hy4, un transformer multimodal de tipo Mixture-of-Experts con unos 774.400 millones de parámetros totales. La arquitectura combina procesamiento de texto e imagen (pipeline image-text-to-text) y está diseñada para razonamiento, tool calling y conversación multi-turno. La versión publicada por lyber-ai aplica cuantización FP8 sobre los pesos mediante la librería compressed-tensors, lo que reduce el tamaño en disco y memoria respecto a una representación en BF16, a costa de una posible pérdida menor de precisión.

No se dispone de información detallada sobre el número de tokens de entrenamiento, la composición del dataset, el proceso de alineación (RLHF/DPO) ni las innovaciones técnicas específicas del modelo base en la información proporcionada. El fine-tuning "UNCENSORED" sugiere un ajuste adicional para reducir los rechazos y restricciones de contenido del modelo original, aunque no se documentan los datos ni el método empleados para ello.

## Capacidades

- Generación de texto y razonamiento multi-paso, incluyendo modo de pensamiento explícito según las etiquetas del modelo.
- Comprensión de imagen y texto (image-text-to-text): descripción, respuesta a preguntas visuales y conversación sobre imágenes.
- Generación de código y resolución de problemas técnicos.
- Tool calling / function calling para integración con APIs y agentes.
- Soporte de agentes y razonamiento encadenado en varios pasos.
- Capacidades multilingües en inglés, chino, español, francés, japonés, coreano y ruso.
- Comportamiento "uncensored": menor tendencia a rechazar peticiones por políticas de contenido, orientado a usos de investigación y generación sin filtros.
- Compatibilidad con endpoints (etiqueta endpoints_compatible) y con la librería transformers.

## Casos de uso

- Investigación sobre alineación y seguridad: el modelo permite estudiar el comportamiento de un MoE multimodal sin filtros de rechazo, comparándolo con el modelo base para analizar cómo cambia la distribución de respuestas.
- Asistencia técnica multimodal: se puede usar para analizar capturas de pantalla, diagramas o documentación escaneada y responder preguntas concretas combinando visión y texto.
- Generación de código en pipelines internos: su soporte de tool calling permite integrarlo en flujos de CI/CD para revisión de parches, generación de tests o explicación de errores de compilación.
- Agentes autónomos de investigación: con razonamiento multi-paso y uso de herramientas, puede encadenar búsquedas, lectura de documentos y síntesis de resultados en entornos controlados.
- Atención al cliente multilingüe: cubre conversaciones en siete idiomas y puede gestionar interacciones con contexto amplio, siempre que se valide su ventana de contexto real antes de producción.
- Análisis de documentación técnica multilingüe: traducción y resumen de manuales, contratos o informes en inglés, chino, español, francés, japonés, coreano y ruso.
- Prototipado de aplicaciones de visión-lenguaje: descripción automática de imágenes, extracción de datos de gráficos o moderación asistida en entornos de investigación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: con ~774,4 mil millones de parámetros en FP8 (1 byte por parámetro), los pesos ocupan aproximadamente 775 GB; en BF16 serían unos 1,5 TB. A ello hay que sumar caché KV, activaciones y overhead del runtime.
- GPU recomendadas: para FP8 se necesitan múltiples aceleradores de 80 GB (H100, H200, A100 80 GB) o GPUs con soporte FP8 nativo como las H100/H200; un solo dispositivo no es suficiente.
- GPU de consumo: no cabe en RTX 4090 (24 GB) ni en ninguna GPU consumer actual en su configuración completa. Sería necesaria una cuantización adicional agresiva (por ejemplo, 4 bits) y aun así excedería la memoria de una sola tarjeta.
- Opciones de despliegue: transformers con compressed-tensors; para serving de alto rendimiento se requieren frameworks con soporte de paralelismo tensor y FP8, como vLLM o TGI en configuraciones multi-GPU. No se documenta soporte GGUF ni Ollama en la información disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros totales | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Hy4-UNCENSORED-FP8 (este) | ~774,4 B (MoE) | no disponible | tencent-hunyuan (other), gated | Hugging Face, acceso restringido |
| tencent/Hy4 (base) | ~774,4 B (MoE) | no disponible | tencent-hunyuan | Hugging Face |
| Alternativas de la misma categoria | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks ni de especificaciones de modelos comparables en la información proporcionada, por lo que no es posible establecer una comparación cuantitativa fiable.

## Limitaciones y advertencias

- El acceso es restringido (gated): es obligatorio aceptar las condiciones en Hugging Face antes de descargar el modelo.
- La licencia tencent-hunyuan ("other") impone condiciones específicas; es imprescindible revisar los términos del modelo base y del fine-tuning antes de cualquier uso comercial.
- La variante "UNCENSORED" reduce los filtros de seguridad y puede generar contenido inapropiado, ofensivo o legalmente problemático; no es adecuada para aplicaciones de cara al público sin moderación adicional.
- Riesgo de alucinación inherente a los modelos de lenguaje de gran escala, especialmente en tareas de razonamiento y datos factuales.
- La cuantización FP8 puede introducir degradación de precisión frente a los pesos originales en BF16.
- No se documentan la longitud de contexto real, los parámetros activos ni el rendimiento en benchmarks, lo que dificulta la planificación de capacidad.
- El tamaño del repositorio (~1 TB) y los requisitos de memoria hacen inviable su ejecución en hardware de consumo.
- Solo se declaran siete idiomas; el rendimiento fuera de ellos no está garantizado.
- El modelo tiene muy pocas descargas y ningún "like", por lo que no existe validación comunitaria sobre su calidad o estabilidad.

## Enlaces

- Hugging Face: https://huggingface.co/lyber-ai/Hy4-UNCENSORED-FP8
- Modelo base: https://huggingface.co/tencent/Hy4
