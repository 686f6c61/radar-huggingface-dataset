# McG-221/Qwen3.8-27B-Fable-Distill-mlx-8Bit

## Resumen

El modelo **McG-221/Qwen3.8-27B-Fable-Distill-mlx-8Bit** es una conversión al formato MLX (Apple Silicon) del modelo **TeichAI/Qwen3.8-27B-Fable-Distill**, un destilado del Qwen3.8-27B original de Alibaba. El autor, McG-221, ha adaptado los pesos a MLX con cuantización de 8 bits para su uso eficiente en Macs con chip M-series. A pesar del nombre, los pesos reales almacenados en safetensors suman 7.566.401.024 parámetros (~7,57 mil millones), lo que indica que el proceso de destilación ha reducido drásticamente el tamaño original de 27B. Se trata de un modelo multimodal (imagen y texto) con licencia Apache 2.0, orientado a tareas de conversación, razonamiento y posiblemente codificación, aunque no se han publicado benchmarks específicos para esta versión destilada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (visión-lenguaje) |
| Parametros totales | 7.566.401.024 (~7,57B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible (el modelo base Qwen3.8-27B tiene 262K tokens, pero no se confirma para el destilado) |
| Tipos de cuantizacion | 8-bit (MLX) |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (MLX) |

## Arquitectura y entrenamiento

El modelo es un transformer denso con capacidades multimodales (entrada de imagen y texto, salida de texto). Se deriva de Qwen3.8-27B, un modelo de 27B parámetros de Alibaba, pero ha sido destilado por TeichAI a un tamaño mucho menor (~7,57B) utilizando los datasets `armand0e/claude-fable-5-claude-code` y `armand0e/Fable-5-Chat`, que parecen contener datos generados por un modelo llamado Claude Fable 5. La conversión a MLX realizada por McG-221 no modifica la arquitectura ni los pesos, solo los adapta al formato optimizado para Apple Silicon mediante la librería `mlx-lm` versión 0.31.2. No se dispone de información detallada sobre el proceso de destilación (técnica, número de tokens, si hubo RLHF o DPO).

## Capacidades

- Procesamiento de imágenes y texto: al ser un modelo `image-text-to-text`, puede recibir imágenes como entrada y generar respuestas textuales.
- Generación de texto conversacional: soporta chat multi-turno mediante plantillas de conversación.
- Razonamiento y comprensión contextual: hereda las capacidades del modelo base Qwen3.8-27B, aunque degradadas por la destilación.
- Posible soporte de tool calling y agentes: no confirmado explícitamente, pero el modelo base Qwen3.8-27B incluye estas funcionalidades.
- Multilingüismo limitado: la ficha indica solo inglés, aunque el modelo base soporta más idiomas; no se garantiza en esta versión.

## Casos de uso

- Asistente de atención al cliente con soporte visual: el modelo puede analizar capturas de pantalla o fotos de productos y responder consultas en texto, gracias a su capacidad multimodal.
- Descripción y etiquetado automático de imágenes: útil para generar metadatos o accesibilidad en plataformas de contenido.
- Análisis de documentos escaneados: puede extraer información de imágenes de documentos y responder preguntas sobre ellos.
- Generación de código asistida por capturas: si el modelo conserva capacidades de codificación, podría interpretar diagramas o capturas de pantalla de errores y sugerir soluciones.
- Chatbot educativo con material visual: para explicar conceptos a partir de imágenes o gráficos.
- Prototipado rápido de aplicaciones multimodales en Mac: al estar en formato MLX, se integra fácilmente en entornos de desarrollo Apple para pruebas locales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Los datos de rendimiento del modelo base Qwen3.8-27B (DeepSWE 42.2, Terminal Bench 73.0, OSWorld 84.3) no son aplicables directamente a esta versión destilada, ya que la destilación suele degradar el rendimiento.

## Requisitos de hardware

- Al ser una conversión MLX, está optimizado para Apple Silicon (M1, M2, M3 y superiores).
- Con ~7,57B parámetros en 8-bit, el modelo requiere aproximadamente 7,6 GB de memoria para los pesos, más overhead de activaciones y KV cache. Se recomienda un Mac con al menos 16 GB de RAM unificada para una inferencia fluida.
- No es adecuado para GPUs NVIDIA o AMD sin adaptación, ya que MLX es específico de Apple.
- Opciones de despliegue: `mlx-lm` (Python), integración con frameworks como LangChain o LlamaIndex mediante adaptadores.
- Latencia y throughput: no disponibles, pero en un Mac M2 Pro con 16 GB se espera una generación de 10-20 tokens por segundo en 8-bit, dependiendo de la longitud de la secuencia.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| McG-221/Qwen3.8-27B-Fable-Distill-mlx-8Bit | 7,57B | No disponible | Apache 2.0 | MLX 8-bit | Destilado de Qwen3.8-27B, multimodal |
| Qwen2.5-7B-Instruct | 7,6B | 32K | Apache 2.0 | safetensors, GGUF | Solo texto, sin visión |
| Llama 3.1 8B Instruct | 8,0B | 128K | Llama 3.1 | safetensors, GGUF | Solo texto, sin visión |
| Qwen3.8-27B (original) | 27B | 262K | Apache 2.0 | safetensors | Multimodal, rendimiento superior |

La comparativa muestra que este modelo destilado es significativamente más pequeño que su base, lo que reduce requisitos de hardware pero probablemente también su rendimiento. No hay datos objetivos para comparar directamente.

## Limitaciones y advertencias

- El nombre del modelo sugiere 27B, pero los pesos reales son de ~7,57B; esto puede confundir a los usuarios que esperan el rendimiento del modelo original.
- Idioma limitado a inglés; no se garantiza un buen comportamiento en otros idiomas.
- Riesgo de alucinaciones y sesgos, comunes en modelos destilados y de menor tamaño.
- La destilación puede degradar capacidades de razonamiento complejo, codificación avanzada y manejo de contexto largo.
- No se han publicado evaluaciones de seguridad ni de sesgos para esta versión.
- Al ser una conversión MLX, no es compatible directamente con bibliotecas estándar como vLLM o TGI en GPUs NVIDIA; requiere el ecosistema MLX.
- La licencia Apache 2.0 permite uso comercial, pero se recomienda verificar los términos del modelo base y los datasets utilizados.

## Enlaces

- [HuggingFace: McG-221/Qwen3.8-27B-Fable-Distill-mlx-8Bit](https://huggingface.co/McG-221/Qwen3.8-27B-Fable-Distill-mlx-8Bit)
- [Modelo base: TeichAI/Qwen3.8-27B-Fable-Distill](https://huggingface.co/TeichAI/Qwen3.8-27B-Fable-Distill)
- [Guía de Qwen3.8-27B (2026)](https://lovableapp.org/blog/qwen3-8-27b)
- [Qwen3.8 27B Fable Distill en LLM Explorer](https://llm-explorer.com/model/TeichAI%2FQwen3.8-27B-Fable-Distill,23OhmOa6RJTO53XCLMLoi4)
- [Qwen3.8 en LM Studio](https://lmstudio.ai/models/qwen3.8)
- [Qwen3.8 27B en Jetson AI Lab](https://www.jetson-ai-lab.com/models/qwen3-8-27b/)
