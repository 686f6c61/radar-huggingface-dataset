# lyber-ai/Hy4-UNCENSORED-NVFP4

## Resumen

Hy4-UNCENSORED-NVFP4 es una cuantización en formato NVFP4 (punto flotante de 4 bits de NVIDIA) del modelo Hy4-UNCENSORED-FP8, publicado por el usuario lyber-ai en Hugging Face. Se trata de un derivado del modelo Tencent Hunyuan Hy4, un transformer multimodal de tipo image-text-to-text orientado a conversación, razonamiento y tool calling. La variante "UNCENSORED" indica que se ha aplicado un proceso de fine-tuning o ablación para reducir los rechazos y filtros de seguridad del modelo original, algo que el autor no documenta en detalle en la información disponible.

El modelo conserva la arquitectura híbrida MoE (mixture of experts) y las capacidades de visión del Hy4 original, e incorpora etiquetas que apuntan a soporte de razonamiento, tool calling y conversación multilingüe en inglés, chino, español, francés, japonés, coreano y ruso. El repositorio ocupa 184,2 GB, lo que refleja el tamaño del modelo base empaquetado en safetensors con el formato compressed-tensors para NVFP4.

Su relevancia actual radica en que permite ejecutar un modelo multimodal de gran tamaño con cuantización de 4 bits optimizada para hardware NVIDIA Blackwell, reduciendo los requisitos de VRAM frente al FP8 del que deriva. No obstante, el acceso está restringido (gated) y la licencia es la de Tencent Hunyuan, con condiciones específicas que conviene revisar antes de cualquier uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal MoE (hy_v4_vl), derivado de Tencent Hunyuan Hy4 |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | NVFP4 (compressed-tensors); modelo base en FP8 |
| Idiomas soportados | en, zh, es, fr, ja, ko, ru |
| Licencia | tencent-hunyuan (acceso restringido / gated) |
| Formato de pesos | safetensors (compressed-tensors NVFP4) |

## Arquitectura y entrenamiento

La información disponible identifica el modelo como `hy_v4_vl`, la arquitectura multimodal de Tencent Hunyuan para tareas image-text-to-text, con pipeline de visión y lenguaje y estructura MoE según las etiquetas del repositorio. El modelo deriva de `lyber-ai/Hy4-UNCENSORED-FP8`, que a su vez parte del Hy4 original de Tencent. La cuantización NVFP4 se ha realizado con la librería compressed-tensors, que empaqueta los pesos en bloques de 4 bits con escalas compartidas, un formato pensado para las unidades tensor de las GPU NVIDIA Blackwell.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, ni si hubo etapas de RLHF o DPO en el modelo original o en la variante UNCENSORED. Tampoco se documentan innovaciones técnicas específicas de decodificación o atención más allá de lo que implica la arquitectura Hy4 de referencia. Todos estos datos deben considerarse no disponibles a partir de la información proporcionada.

## Capacidades

- Generación de texto conversacional multi-turno en siete idiomas (en, zh, es, fr, ja, ko, ru).
- Comprensión de imágenes y respuesta image-text-to-text, según el pipeline declarado.
- Razonamiento explícito, indicado por la etiqueta `reasoning`.
- Tool calling y function calling, según la etiqueta `tool-calling`.
- Comportamiento "uncensored": menor tasa de rechazos ante peticiones que el modelo base podría declinar, sin documentación del método aplicado.
- Integración con la librería transformers y compatibilidad con endpoints (etiqueta `endpoints_compatible`).
- Capacidades multimodales heredadas del Hy4 original (visión + lenguaje) en un único modelo.

## Casos de uso

- Asistencia conversacional multilingüe: el modelo cubre siete idiomas y puede gestionar diálogos multi-turno, adecuado para atención al cliente en mercados con usuarios en español, inglés, chino o japonés.
- Análisis de documentos con imágenes: al ser image-text-to-text, permite extraer información de capturas, formularios escaneados o gráficos y responder preguntas sobre ellos en un solo paso.
- Automatización de agentes con tool calling: la etiqueta `tool-calling` lo hace apto para orquestar llamadas a APIs en flujos de agentes, encadenando razonamiento y ejecución de herramientas.
- Investigación sobre alineación y seguridad: al ser una variante "uncensored", sirve para estudiar el comportamiento de modelos sin filtros y comparar tasas de rechazo frente al Hy4 original.
- Generación de contenido creativo sin restricciones temáticas: útil en entornos controlados donde se necesita explorar narrativa o guiones que los filtros estándar bloquearían.
- Despliegue en infraestructura NVIDIA Blackwell: la cuantización NVFP4 reduce el coste de VRAM frente a FP8, lo que facilita servir el modelo en clústeres con GPU de última generación.
- Prototipado multimodal en investigación: integración directa con transformers para experimentos de visión-lenguaje sin necesidad de reentrenar.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- El repositorio pesa 184,2 GB en safetensors NVFP4; la VRAM necesaria para inferencia es coherente con ese tamaño más overhead de activaciones y KV cache, aunque no se dispone de cifras oficiales.
- La cuantización NVFP4 está optimizada para GPU NVIDIA Blackwell (serie B200/GB200); en arquitecturas anteriores el soporte de NVFP4 puede no estar disponible o requerir emulación.
- No se confirma que quepa en GPU de consumo; el tamaño del repositorio supera la VRAM de cualquier GPU consumer actual, por lo que se requiere hardware de centro de datos o multi-GPU.
- Opciones de despliegue: transformers (librería declarada) y compressed-tensors para carga de pesos; no se documenta soporte de vLLM, llama.cpp, Ollama o TGI en la información disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| Hy4-UNCENSORED-NVFP4 | no disponible | no disponible | tencent-hunyuan | NVFP4 safetensors | Gated en HF |
| Hy4-UNCENSORED-FP8 (base) | no disponible | no disponible | tencent-hunyuan | FP8 safetensors | Gated en HF |
| Tencent Hunyuan Hy4 (original) | no disponible | no disponible | tencent-hunyuan | safetensors | no disponible |

No se dispone de datos de rendimiento ni de parámetros para establecer una comparación cuantitativa con alternativas de la misma categoría.

## Limitaciones y advertencias

- La variante "uncensored" reduce los filtros de seguridad, lo que aumenta el riesgo de generar contenido dañino, sesgado o ilegal; no es apta para producción sin moderación adicional.
- Riesgo de alucinación inherente a los modelos de lenguaje de gran tamaño, agravado por la falta de documentación sobre el proceso de fine-tuning aplicado.
- No se documentan sesgos conocidos ni evaluaciones de seguridad específicas para esta variante.
- La licencia tencent-hunyuan impone condiciones de uso que deben revisarse antes de cualquier explotación comercial; el acceso es restringido y requiere aceptar los términos en Hugging Face.
- El soporte de NVFP4 depende de hardware NVIDIA Blackwell; en otras GPU la inferencia puede no funcionar o degradarse.
- No se dispone de información sobre longitud de contexto, por lo que no se puede garantizar el rendimiento en ventanas largas.
- El repositorio tiene 0 descargas y 0 likes, sin validación comunitaria de su calidad o estabilidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/lyber-ai/Hy4-UNCENSORED-NVFP4
- Modelo base FP8: https://huggingface.co/lyber-ai/Hy4-UNCENSORED-FP8
- Licencia Tencent Hunyuan: no disponible en la información proporcionada
- Paper o blog del Hy4 original: no disponible en la información proporcionada
- Repositorio de compressed-tensors: no disponible en la información proporcionada
