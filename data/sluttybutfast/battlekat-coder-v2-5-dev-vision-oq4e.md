# sluttybutfast/BattleKAT-Coder-V2.5-Dev-Vision-oQ4e

## Resumen

BattleKAT-Coder-V2.5-Dev-Vision-oQ4e es un modelo multimodal (image-text-to-text) creado por el usuario sluttybutfast mediante la fusión a nivel de pesos de dos modelos de la familia Qwen3.6-35B-A3B con arquitectura MoE (mixture of experts). El componente de lenguaje proviene del finetune ZQ-Dev/KAT-Coder-V2.5-Dev-oQ4e, mientras que la torre de visión (encoder y proyector) se toma del modelo base Jundot/Qwen3.6-35B-A3B-oQ4e-mtp. El resultado es un modelo que combina las capacidades de generación de código y razonamiento del finetune con la comprensión de imágenes del VLM base, sin necesidad de retrenamiento adicional.

El modelo presenta una cuantización mixta: los expertos de las capas switch_mlp están en 4 bits, mientras que la atención, los expertos compartidos, las embeddings y la cabeza de lenguaje están en 8 bits (grupo de tamaño 64, afín). La torre de visión se mantiene en bfloat16 a precisión completa. El merge fue verificado byte a byte mediante hashes SHA-256, confirmando que los 1677 tensores de lenguaje son idénticos al finetune y los 333 de visión son idénticos al VLM base. El modelo tiene 6.089.961.328 parámetros totales y el repositorio ocupa 21,3 GB en formato safetensors.

La relevancia de este modelo radica en que ofrece capacidades de visión (OCR, descripción de imágenes, análisis de capturas de pantalla) a un modelo de código ya afinado, sin necesidad de un proyector adicional gracias a la compatibilidad de dimensiones (hidden_size 2048 en ambos componentes). Está pensado para ejecutarse con MLX en hardware Apple Silicon, aunque el autor recomienda usar oMLX para un caché superior y ajustes de generación específicos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | qwen3_5_moe (mixture of experts) |
| Parametros totales | 6.089.961.328 |
| Parametros activos | no disponible (nombre del modelo sugiere A3B, pero no se especifica en la informacion) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Mixto: 4-bit (expertos switch_mlp), 8-bit (atencion, expertos compartidos, embeddings, LM head); vision tower en bf16 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 (debe cumplirse la licencia de ambos modelos fuente) |
| Formato de pesos | Safetensors (MLX), incluye modelo.safetensors.index.json |

## Arquitectura y entrenamiento

El modelo es un merge a nivel de pesos sin retrenamiento. La arquitectura es la de Qwen3.5-MoE, con capas de atención y múltiples expertos en las capas feed-forward (switch_mlp). El componente de lenguaje procede de ZQ-Dev/KAT-Coder-V2.5-Dev-oQ4e, un finetune cuantizado especializado en código y razonamiento. El componente de visión se toma de Jundot/Qwen3.6-35B-A3B-oQ4e-mtp, que es un VLM base con un proyector de visión que emite características de 2048 dimensiones, compatibles con el espacio de embeddings del modelo de lenguaje (hidden_size 2048). La inyección de características visuales se realiza en la posición del token de imagen (image_token_id), sin usar deepstack visual indexes.

El merge se realizó mediante un script que selecciona los tensores language_model.* del finetune y los vision_tower.* del VLM base, uniéndolos en un solo conjunto. La configuración del modelo resultante combina el config del finetune (que contiene el mapa de cuantización) con los campos de visión del VLM base (vision_config, image_token_id, vision_start/end_token_id, etc.). El preprocesador de imágenes también se toma del VLM base, ya que el tokenizador del finetune era solo texto. La cabeza de multi-token-prediction (MTP) no se hereda, ya que el finetune la tiene desactivada (mtp_num_hidden_layers=0). El chat template se toma de froggeric/Qwen-Fixed-Chat-Templates (v21.3) con adiciones personalizadas para mejorar el manejo de herramientas y reducir bucles de razonamiento.

## Capacidades

- Generación de código y razonamiento técnico, heredado del finetune KAT-Coder-V2.5-Dev.
- Comprensión de imágenes y extracción de texto (OCR) a través de la torre de visión del VLM base.
- Capacidad multimodal image-text-to-text: puede responder a prompts que combinan imágenes y texto.
- Soporte de razonamiento con thinking mode habilitado por defecto (enable_thinking=true, preserve_thinking=true).
- Chat template personalizado que mejora el manejo de herramientas y reduce la probabilidad de bucles de pensamiento.
- Multilingüismo: no se especifican idiomas soportados, pero la base Qwen3.6 suele ser multilingüe; se recomienda verificar.
- Compatibilidad con MLX y oMLX para caché y generación optimizada.

## Casos de uso

- **Generación de código a partir de capturas de pantalla**: el modelo puede recibir una imagen de un diagrama, esquema o fragmento de código y generar la implementación correspondiente. Gracias a su componente de visión y su finetune de código, es adecuado para prototipado rápido a partir de imágenes.
- **Extracción de texto de imágenes (OCR)**: puede describir imágenes y extraer texto de capturas, documentos escaneados o gráficos. Esto es útil para automatizar la digitalización de documentos en entornos de desarrollo.
- **Depuración visual**: dado un screenshot de un error en una interfaz o una traza de logs, el modelo puede analizar la imagen y sugerir correcciones en el código. Su razonamiento de código y visión lo hacen apto para tareas de soporte técnico.
- **Creación de documentación técnica**: a partir de capturas de pantalla de herramientas o dashboards, el modelo puede generar descripciones y documentación en texto, útil para mantener wikis internos o manuales.
- **Asistente de desarrollo en Apple Silicon**: al estar optimizado para MLX, puede desplegarse en Macs con Apple Silicon para tareas de codificación asistida con contexto visual, sin necesidad de GPU NVIDIA.
- **Análisis de datos visuales**: puede interpretar gráficos, tablas o imágenes de métricas y responder preguntas sobre ellos, lo que sirve para automatizar análisis de dashboards o informes técnicos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- **VRAM estimada**: el tamaño del repositorio es de 21,3 GB. Con cuantización mixta (4-bit/8-bit), la VRAM necesaria para inferencia ronda los 22-24 GB, lo que cabe en GPUs de 24 GB como RTX 4090 o A5000.
- **GPUs recomendadas**: RTX 4090 (24 GB), RTX 6000 Ada (48 GB), A100 40/80 GB, H100. En Apple Silicon, se recomienda Mac con al menos 32 GB de memoria unificada para ejecutar el modelo en MLX.
- **Cabe en GPU de consumo**: sí, en tarjetas con 24 GB de VRAM. En tarjetas de 16 GB (RTX 4080, 4070 Ti) podría no caber completa, se necesitaría una cuantización más agresiva o subdivisión.
- **Opciones de despliegue**: MLX (oficial), oMLX (para caché superior). También puede convertirse a GGUF para usar con llama.cpp u Ollama, o a otros formatos si se desea usar con vLLM (aunque no está soportado oficialmente por el autor).
- **Latencia y throughput**: no disponible. Al ser un modelo MoE con 3B parámetros activos (aprox.), la latencia será menor que un modelo denso de 35B, pero depende del hardware y de la implementación MLX.

## Comparativa con modelos similares

| Modelo | Parametros totales | Parametros activos | Contexto | Modalidades | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| **BattleKAT-Coder-V2.5-Dev-Vision-oQ4e** (este) | 6,1B (cuantizado) | ~3B (estimado) | no disponible | texto + vision | Apache 2.0 | MLX safetensors |
| ZQ-Dev/KAT-Coder-V2.5-Dev-oQ4e (base lenguaje) | 6,1B (cuantizado) | ~3B (estimado) | no disponible | solo texto | Apache 2.0 | MLX safetensors |
| Jundot/Qwen3.6-35B-A3B-oQ4e-mtp (base VLM) | 6,1B (cuantizado) | ~3B (estimado) | no disponible | texto + vision | Apache 2.0 | MLX safetensors |
| Qwen2.5-VL-7B | 7B | 7B | 128K | texto + vision | Apache 2.0 | Transformers, vLLM |

La comparativa con Qwen2.5-VL-7B es aproximada: ambos son multimodales, pero este modelo está especializado en código y usa MoE, mientras que Qwen2.5-VL es denso. La disponibilidad de benchmarks no permite una comparación de rendimiento numérica.

## Limitaciones y advertencias

- **Merge sin entrenamiento**: al ser una unión de pesos sin retrenamiento, el comportamiento del modelo puede ser inconsistente en tareas que requieran coordinación estrecha entre visión y lenguaje, como la generación de código a partir de imágenes complejas.
- **Cuantización mixta**: la cuantización 4-bit de los expertos puede degradar la precisión en tareas de razonamiento complejo comparado con el modelo original en bf16.
- **Sin MTP**: la cabeza de multi-token-prediction no se heredó, lo que puede afectar a la velocidad de generación en comparación con el modelo base.
- **Dependencia de la licencia**: aunque la licencia es Apache 2.0, se debe cumplir con las licencias de ambos modelos fuente (ZQ-Dev/KAT-Coder-V2.5-Dev-oQ4e y Jundot/Qwen3.6-35B-A3B-oQ4e-mtp). Se recomienda revisar los términos de cada uno.
- **Sesgos y alucinación**: no se han evaluado sesgos específicos. Al ser un modelo de código, puede alucinar funciones o APIs inexistentes. Se recomienda validar el código generado.
- **Idiomas**: no se especifican idiomas soportados; es probable que el multilingüismo sea limitado en comparación con modelos específicamente entrenados para ello.
- **Producción**: el autor recomienda usar las settings forzadas (temp 0.8, top_p 0.95, etc.) y no usar baja temperatura. La integración en producción requiere pruebas exhaustivas.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/sluttybutfast/BattleKAT-Coder-V2.5-Dev-Vision-oQ4e
- Modelo base de lenguaje (finetune): https://huggingface.co/ZQ-Dev/KAT-Coder-V2.5-Dev-oQ4e
- Modelo base VLM (visión): https://huggingface.co/Jundot/Qwen3.6-35B-A3B-oQ4e-mtp
- Modelo similar del mismo autor: https://huggingface.co/sluttybutfast/KAT-Coder-V2.5-Dev-Vision-OptiQ-4bit
- Otro modelo similar (npario): https://huggingface.co/npario/KAT-Coder-V2.5-Dev-Vision-OptiQ-4bit
- Información en LLM Explorer: https://llm-explorer.com/model/sluttybutfast%2FKAT-Coder-V2.5-Dev-Vision-OptiQ-4bit,1gosTMsvQo4mNztzVnLVOo
- Chat template base: https://huggingface.co/froggeric/Qwen-Fixed-Chat-Templates
