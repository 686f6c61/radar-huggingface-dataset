# cybertruck32489/memim-qwen35-4b-fullft

## Resumen

El modelo `cybertruck32489/memim-qwen35-4b-fullft` es un fine-tuning completo (full fine-tune) del modelo base Qwen/Qwen3.5-4B, desarrollado por el usuario cybertruck32489. Se trata de una adaptación del modelo multimodal de Alibaba Cloud, que combina arquitectura híbrida con capacidades de procesamiento de imagen y texto. El fine-tuning se realizó con las librerías Unsloth y TRL (SFT), lo que indica un entrenamiento supervisado sobre algún dataset conversacional, aunque el autor no ha documentado los detalles del conjunto de datos ni el propósito específico.

El modelo base Qwen3.5-4B, lanzado en febrero de 2026, es un modelo compacto de 4.000 millones de parámetros con una arquitectura híbrida que combina Gated Delta Networks y Gated Attention, y soporta un contexto mínimo de 256.000 tokens según fuentes externas. Este fine-tuning hereda esas características, aunque no se ha confirmado oficialmente. Con 4.539.265.536 parámetros totales (4,54B), el modelo está disponible en formato safetensors y bajo licencia Apache 2.0, lo que permite uso comercial sin restricciones significativas.

La relevancia de este modelo radica en su tamaño compacto combinado con capacidades multimodales (imagen-texto) y un contexto muy amplio, lo que lo hace adecuado para aplicaciones que requieren procesar documentos largos con contenido visual. Sin embargo, al ser un fine-tuning sin documentación detallada ni métricas de evaluación publicadas, su rendimiento real es incierto y requiere validación por parte del usuario.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida: Gated Delta Networks + Gated Attention (patrón 8× (3×DeltaNet→FFN→1×Attention→FFN)) |
| Parametros totales | 4.539.265.536 (4,54B) |
| Parametros activos | no aplicable (modelo denso, no MoE) |
| Longitud de contexto | no disponible en la ficha del modelo; el modelo base Qwen3.5-4B soporta hasta 256k según fuentes externas |
| Tipos de cuantizacion | no disponible (el repo contiene pesos en safetensors, sin cuantizaciones precalculadas) |
| Idiomas soportados | en (según la model card) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo base Qwen3.5-4B emplea una arquitectura híbrida que combina Gated Delta Networks (una variante de atención lineal con compuertas) y Gated Attention tradicional, organizada en un patrón repetitivo de 8 bloques, cada uno con la secuencia 3×DeltaNet→FFN→1×Attention→FFN. Esta combinación busca equilibrar eficiencia computacional y capacidad de modelado de dependencias de largo alcance. El modelo es multimodal, acepta entradas de imagen y texto, y genera texto.

El fine-tuning se realizó mediante entrenamiento supervisado (SFT) utilizando las librerías Unsloth (para acelerar el entrenamiento) y TRL (Transformer Reinforcement Learning) de Hugging Face. El autor indica que el entrenamiento fue 2 veces más rápido gracias a Unsloth, pero no proporciona información sobre el dataset utilizado, el número de pasos, la tasa de aprendizaje ni otros hiperparámetros. Tampoco se especifica si se aplicaron técnicas como RLHF o DPO posteriores al SFT. Al ser un "fullft" (full fine-tune), todos los parámetros del modelo fueron actualizados durante el entrenamiento.

## Capacidades

- Procesamiento multimodal: acepta imágenes y texto como entrada, y genera texto (pipeline image-text-to-text).
- Generación de texto conversacional: el modelo está etiquetado como "conversational", lo que sugiere optimización para diálogos multi-turno.
- Contexto largo: hereda del modelo base una ventana de contexto de al menos 256k tokens (según fuentes externas), aunque no está confirmado para este fine-tuning.
- Soporte de tool calling / function calling: no se menciona en la información disponible; el modelo base Qwen3.5 podría soportarlo, pero no hay confirmación para esta versión.
- Capacidades de agente y razonamiento multi-paso: no documentadas.
- Multilingüismo: la model card declara únicamente inglés, aunque el modelo base probablemente soporta más idiomas; no hay evidencia de que el fine-tuning los preserve.

## Casos de uso

- Asistencia visual para personas con discapacidad: el modelo puede recibir una imagen (por ejemplo, una fotografía de un entorno) y generar una descripción textual detallada, ayudando a usuarios con problemas de visión a comprender su entorno.
- Análisis de documentos escaneados: al combinar visión y texto, puede extraer información de facturas, contratos o formularios escaneados, transcribiendo y resumiendo el contenido.
- Chatbots de atención al cliente con contexto largo: gracias a su amplia ventana de contexto (si se confirma), puede mantener conversaciones extensas con historial completo, útil para soporte técnico o resolución de incidencias complejas.
- Generación de subtítulos y descripciones para contenido multimedia: puede procesar imágenes y generar textos descriptivos para catálogos de productos, redes sociales o archivos de vídeo.
- Asistente de programación con capturas de pantalla: el desarrollador puede enviar una captura de pantalla de un error o de una interfaz y el modelo puede explicar el problema o sugerir código, combinando comprensión visual y generación de código.
- Resumen de documentos largos con figuras y tablas: al aceptar imágenes y texto, puede resumir informes técnicos o papers que contengan gráficos, manteniendo el contexto de las figuras.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor no proporciona métricas de evaluación (MMLU, HumanEval, GSM8K, etc.) ni comparaciones con otros modelos. Tampoco se dispone de datos de rendimiento del modelo base en este contexto específico. Se recomienda al usuario realizar sus propias pruebas antes de usar el modelo en producción.

## Requisitos de hardware

- VRAM estimada para inferencia: con 4,54B parámetros, en precisión fp16 se necesitan aproximadamente 9,1 GB de VRAM (coincide con el tamaño del repo). En cuantización 4-bit (por ejemplo, con GPTQ o AWQ) se estima entre 2,5 y 3,5 GB, y en 8-bit alrededor de 5 GB.
- GPU recomendadas: para fp16, una GPU con 12 GB o más (RTX 3060 12GB, RTX 4070, A10, L4). Para cuantización 4-bit, una GPU con 6 GB puede ser suficiente (RTX 3060 6GB, RTX 2060, etc.).
- Compatibilidad con GPUs de consumo: sí, es viable en GPUs consumer de gama media-alta, especialmente con cuantización.
- Opciones de despliegue: al ser un modelo transformers estándar, puede servirse con vLLM, Text Generation Inference (TGI), llama.cpp (si se convierte a GGUF), Ollama (si se empaqueta) o directamente con la librería transformers de Hugging Face.
- Latencia y throughput: no se dispone de datos medidos. Para un modelo de 4B en una GPU moderna (por ejemplo, RTX 4090), se puede esperar una generación de decenas de tokens por segundo en fp16, y mayor con cuantización, pero son estimaciones no verificadas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Multimodal | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| cybertruck32489/memim-qwen35-4b-fullft | 4,54B | no confirmado (base: 256k) | Sí (imagen+texto) | Apache 2.0 | Hugging Face |
| Qwen/Qwen3.5-4B (base) | 4,54B | 256k (según fuentes) | Sí | Apache 2.0 | Hugging Face, ModelScope, Ollama |
| Qwen2.5-4B (versión anterior) | 4,54B | 128k | No (solo texto) | Apache 2.0 | Hugging Face |
| Llama-3.2-3B | 3,21B | 128k | No | Llama 3.2 Community License | Hugging Face |

La comparativa se basa en datos públicos de los modelos base. El fine-tuning no aporta información adicional sobre rendimiento, por lo que la elección entre este modelo y sus alternativas dependerá de la necesidad de capacidades multimodales y de la confianza en el fine-tuning no documentado.

## Limitaciones y advertencias

- Documentación insuficiente: el autor no proporciona detalles sobre el dataset de entrenamiento, los hiperparámetros, ni los objetivos del fine-tuning. Esto dificulta evaluar su idoneidad para tareas específicas y su posible degradación respecto al modelo base.
- Riesgo de alucinación: como cualquier modelo generativo, puede producir contenido falso o inventado, especialmente en tareas de razonamiento o cuando se le pide información factual.
- Sesgos desconocidos: al no documentar el dataset de fine-tuning, no se pueden identificar sesgos potenciales introducidos durante el entrenamiento.
- Idioma limitado: la model card declara únicamente inglés; el uso en otros idiomas puede degradar el rendimiento.
- Contexto no confirmado: aunque el modelo base soporta 256k tokens, no hay garantía de que el fine-tuning preserve esa capacidad; se recomienda verificar experimentalmente.
- Sin benchmarks: la ausencia de métricas de evaluación impide comparar objetivamente este modelo con alternativas.
- Repositorio sin actividad: el modelo tiene 0 descargas y 0 likes, lo que sugiere que no ha sido validado por la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/cybertruck32489/memim-qwen35-4b-fullft
- Modelo base Qwen/Qwen3.5-4B: https://huggingface.co/Qwen/Qwen3.5-4B
- Página de Qwen3.5-4B en ModelScope: https://www.modelscope.cn/models/Qwen/Qwen3.5-4B
- Página de Qwen3.5-4B en Ollama: https://ollama.com/library/qwen3.5:4b
- Especificaciones y requisitos de VRAM (fuente externa): https://apxml.com/models/qwen35-4b
- Colección de fine-tunes de Qwen 3.5 (referencia de contexto): https://huggingface.co/collections/DavidAU/qwen-35-08-2-4-9-27-35b-regular-uncensored
