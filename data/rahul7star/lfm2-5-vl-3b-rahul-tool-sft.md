# rahul7star/LFM2.5-VL-3B-rahul-tool-sft

## Resumen

LFM2.5-VL-3B-rahul-tool-sft es un fine-tune del modelo vision-language LFM2.5-VL-3B de Liquid AI, desarrollado por el usuario rahul7star con el objetivo de reforzar las capacidades de tool calling del modelo base. El modelo base es un VLM de 3.1 mil millones de parámetros diseñado para despliegue en el edge, con capacidades de grounding visual, comprensión de pantallas digitales y function calling. Este fine-tune se ha entrenado con Unsloth, lo que permite un entrenamiento aproximadamente dos veces más rápido que los métodos convencionales, manteniendo la licencia Apache 2.0 del modelo original.

La relevancia de este modelo radica en su combinación de visión-lenguaje y tool calling en un formato compacto, apto para ejecución en dispositivos con recursos limitados. El modelo base ya soporta grounding de objetos a coordenadas, parsing de documentos y gráficos, y llamada a herramientas desde entrada de texto o imagen; el fine-tune busca optimizar esta última capacidad. El repositorio es reciente (agosto de 2026) y actualmente no registra descargas ni valoraciones, por lo que se trata de una contribución inicial sin validación comunitaria todavía.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-language transformer (LFM2.5-VL-3B base) |
| Parametros totales | 3,1 B (modelo base) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo base LFM2.5-VL-3B es un vision-language model desarrollado por Liquid AI con 3,1 mil millones de parámetros, diseñado específicamente para despliegue on-device. Su arquitectura combina un codificador visual con un decoder de lenguaje, permitiendo entrada multimodal de imágenes y texto. Entre sus innovaciones destacan las capacidades de grounding de objetos a coordenadas espaciales, comprensión de pantallas digitales (mobile, web y desktop) y parsing de documentos y gráficos. El modelo base fue entrenado para ejecutarse de forma eficiente en dispositivos con recursos limitados, priorizando latencia baja y consumo de memoria reducido.

El fine-tune de rahul7star se realizó con Unsloth, una librería de entrenamiento optimizado que acelera el fine-tuning de modelos de lenguaje mediante kernels optimizados y gestión eficiente de memoria. El proceso se ejecutó con la librería TRL (Transformers Reinforcement Learning) de Hugging Face, lo que sugiere el uso de técnicas de ajuste supervisado (SFT) para reforzar las capacidades de tool calling del modelo base. No se especifican los datos de entrenamiento utilizados para el fine-tune, ni el número de tokens, ni si se aplicaron técnicas de RLHF o DPO adicionales.

## Capacidades

- Vision-language multimodal: procesa entradas de imagen y texto simultáneamente, con comprensión de escenas, objetos y texto visual.
- Grounding visual: localiza objetos en imágenes y devuelve coordenadas espaciales (bounding boxes) correspondientes.
- Comprensión de pantallas: lee y entiende interfaces digitales en móvil, web y escritorio, lo que permite automatización de tareas basadas en UI.
- Parsing de documentos y gráficos: extrae información estructurada de documentos, tablas y gráficos.
- Function calling: puede invocar herramientas y APIs a partir de instrucciones en texto o de contenido visual (por ejemplo, detectar un botón en pantalla y ejecutar una acción asociada).
- Generación de texto: capacidades estándar de generación de lenguaje, razonamiento y respuesta a instrucciones propias del modelo base.
- Eficiencia en edge: diseñado para ejecutarse en dispositivos con recursos limitados, con tamaño compacto de 3,1B parámetros.

## Casos de uso

- **Automatización de interfaces de usuario**: el modelo puede interpretar capturas de pantalla de aplicaciones web o móviles y ejecutar acciones mediante function calling, lo que permite construir agentes que navegan por interfaces y completan formularios o procesos de forma autónoma.
- **Asistente de accesibilidad**: dado su grounding de objetos en imágenes, puede describir elementos de pantalla a usuarios con discapacidad visual y traducir información visual a instrucciones textuales, integrado en dispositivos móviles o wearables.
- **Extracción de datos de documentos**: el parsing de documentos y gráficos permite automatizar la extracción de información de facturas, informes o formularios escaneados, con salida estructurada para pipelines de datos.
- **Asistente de soporte técnico visual**: un usuario puede compartir una captura de pantalla de un error o configuración, y el modelo identifica el elemento relevante y sugiere pasos de solución, invocando herramientas de diagnóstico si es necesario.
- **Agentes de comercio electrónico**: el modelo puede analizar capturas de pantalla de páginas de producto y ejecutar acciones de compra o comparación mediante function calling, integrado en asistentes de compras.
- **Despliegue en dispositivos edge**: su tamaño compacto permite ejecución on-device en móviles, Raspberry Pi o dispositivos IoT, para aplicaciones de visión y automatización sin dependencia de la nube.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks para el fine-tune rahul7star/LFM2.5-VL-3B-rahul-tool-sft en la información disponible. El modelo base LFM2.5-VL-3B ha sido evaluado por Liquid AI en tareas de grounding, comprensión de pantalla y function calling, pero los datos concretos de esos benchmarks no se han incluido en los materiales proporcionados. No se dispone de comparaciones numéricas con otros modelos en esta ficha.

## Requisitos de hardware

- **VRAM estimada**: para un modelo de 3,1B parámetros en FP16, se estiman unos 6,2 GB de VRAM para inferencia. Con cuantización a 8 bits (INT8) se reduce a aproximadamente 3,1 GB, y a 4 bits (INT4) a 1,6 GB, aunque estas cifras son estimaciones basadas en el tamaño del modelo base y no están confirmadas por el autor.
- **GPUs recomendadas**: el modelo es apto para GPUs de consumo como NVIDIA RTX 3060 (12 GB), RTX 4070 (12 GB), RTX 4090 (24 GB) en FP16. En cuantización 4 bits puede ejecutarse en GPUs con 4 GB de VRAM o incluso en CPU con suficiente RAM.
- **Ejecución en consumer GPU**: sí, cabe en GPUs de consumo con 8 GB de VRAM en FP16 o en cuantización reducida. También es viable la ejecución en CPU con llama.cpp.
- **Opciones de despliegue**: el repositorio incluye formato safetensors compatible con transformers, y las etiquetas indican compatibilidad con text-generation-inference (TGI). También se puede usar con vLLM, llama.cpp u Ollama si se convierte a GGUF.
- **Latencia y throughput**: no se han publicado datos de latencia o throughput para este modelo específico. El modelo base está optimizado para edge, lo que sugiere un rendimiento inferior a modelos de mayor tamaño.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Capacidades | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| LFM2.5-VL-3B (base) | 3,1B | No disponible | VLM, grounding, screen understanding, function calling | Apache 2.0 | HuggingFace |
| rahul7star/LFM2.5-VL-3B-rahul-tool-sft | 3,1B | No disponible | VLM, grounding, screen understanding, function calling (reforzado) | Apache 2.0 | HuggingFace |
| Qwen2.5-VL-3B (alternativa comparable) | 3,1B | 32K tokens | VLM, grounding, document parsing | Apache 2.0 | HuggingFace |
| Phi-3.5-vision (alternativa comparable) | 4,2B | 128K tokens | VLM, razonamiento multimodal | MIT | HuggingFace |

La comparativa se basa en el modelo base y alternativas de la misma categoría (VLM de ~3-4B parámetros). No se dispone de datos de rendimiento comparativo entre estos modelos en los materiales proporcionados.

## Limitaciones y advertencias

- **Datos de entrenamiento desconocidos**: el fine-tune no documenta el dataset, el volumen de tokens ni la metodología exacta de entrenamiento, lo que dificulta evaluar su robustez y su sesgo.
- **Idioma limitado**: el modelo está etiquetado como soporte solo para inglés, lo que limita su uso en entornos multilingües.
- **Riesgo de alucinación**: como cualquier modelo de lenguaje, puede generar respuestas incorrectas o inventadas, especialmente en tareas de grounding donde la precisión espacial es crítica.
- **Sesgos potenciales**: al ser un fine-tune sobre un modelo base, puede heredar sesgos del modelo base y del dataset de fine-tuning, no documentados.
- **Sin validación comunitaria**: el modelo tiene 0 descargas y 0 likes, por lo que no hay evidencia de su rendimiento en entornos reales más allá de la afirmación del autor.
- **Longitud de contexto no especificada**: se desconoce la ventana de contexto del modelo, lo que afecta a la planificación de tareas que requieren documentos o conversaciones largas.
- **Uso comercial**: la licencia Apache 2.0 permite uso comercial sin restricciones, pero la ausencia de documentación sobre los datos de entrenamiento puede implicar riesgos de propiedad intelectual no declarados.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/rahul7star/LFM2.5-VL-3B-rahul-tool-sft
- Modelo base en HuggingFace: https://huggingface.co/LiquidAI/LFM2.5-VL-3B
- Blog de Liquid AI sobre LFM2.5-VL-3B: https://www.liquid.ai/blog/lfm2-5-vl-3b
- Documentación de Liquid AI para LFM2.5-VL-3B: https://docs.liquid.ai/lfm/models/lfm25-vl-3b
- Sitio web de Liquid AI: https://www.liquid.ai/
- Unsloth (librería de entrenamiento): https://github.com/unslothai/unsloth
