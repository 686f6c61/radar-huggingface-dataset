# Hookem22/qwen3-4b-subtitle-es-n85-lora

## Resumen

El modelo `Hookem22/qwen3-4b-subtitle-es-n85-lora` es un adaptador LoRA (PEFT) entrenado sobre el modelo base `unsloth/qwen3-4b-unsloth-bnb-4bit`, que a su vez es una versión cuantizada en 4 bits del modelo Qwen3-4B de Alibaba. El autor, Hookem22, lo ha publicado con licencia Apache 2.0 y lo ha entrenado con la librería Unsloth para acelerar el proceso. El nombre del repositorio sugiere que está orientado a la generación de subtítulos en español, aunque la model card indica el idioma `en`; esta discrepancia no está aclarada en la documentación.

Se trata de un adaptador de bajo rango (LoRA) de solo 0,1 GB, que no incluye los pesos completos del modelo base, sino los parámetros del adaptador que se cargan sobre la versión 4-bit de Qwen3-4B. Esto permite personalizar el modelo para una tarea específica sin necesidad de entrenar desde cero. La relevancia de este tipo de adaptadores radica en que ofrecen una vía económica y rápida para ajustar modelos grandes a dominios concretos, manteniendo la arquitectura y el conocimiento general del modelo base.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen3-4B) con modo *thinking* y *non-thinking* |
| Parámetros totales | 4.000 millones (modelo base) + adaptador LoRA (no especificado) |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | 131.072 tokens con YaRN (por defecto 32.000) según el modelo base; el adaptador no especifica cambios |
| Tipos de cuantizacion | El adaptador usa safetensors; el modelo base está cuantizado en 4 bits (bnb-4bit) |
| Idiomas soportados | `en` (según la model card), aunque el nombre sugiere español (`es`); no hay confirmación |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador LoRA) |

## Arquitectura y entrenamiento

El adaptador se basa en Qwen3-4B, un modelo de lenguaje de 4.000 millones de parámetros con arquitectura transformer decoder-only, que incorpora un modo de razonamiento explícito (thinking) y otro estándar. El modelo original soporta una ventana de contexto de hasta 131.072 tokens mediante la técnica YaRN, aunque el valor por defecto es de 32.000. El adaptador LoRA se entrenó sobre la versión de 4 bits de este modelo, utilizando Unsloth para acelerar el entrenamiento (según la model card, 2x más rápido). No se especifican los datos de entrenamiento, el número de tokens, ni el método de alineación (RLHF/DPO, etc.). El único dato adicional es que se usó la librería TRL (Transformers Reinforcement Learning) durante el proceso.

## Capacidades

- Generación de texto en inglés (según la etiqueta `language`) y probablemente en español, dado el nombre del modelo.
- Herencia de las capacidades del modelo base Qwen3-4B: razonamiento multi-paso, generación de código, matemáticas y comprensión lectora.
- Soporte de tool calling y function calling (capacidad del modelo base, no verificada para este adaptador).
- Modo de razonamiento (thinking) activable mediante el token `/think` y desactivable con `/no_think` (del modelo base).
- No se documentan capacidades específicas del adaptador para subtítulos (como detección de escenas, sincronización, etc.).

## Casos de uso

- **Generación de subtítulos para vídeo**: el modelo puede utilizarse para crear subtítulos automáticos a partir de transcripciones o para traducir subtítulos existentes. Su bajo peso permite integrarlo en pipelines de edición de vídeo sin necesidad de infraestructura de GPU potente.
- **Preprocesamiento de contenido audiovisual**: en plataformas de streaming o archivo, el adaptador puede añadir subtítulos en español a vídeos en inglés (o viceversa), aprovechando la capacidad multilingüe del modelo base.
- **Análisis de guiones**: los equipos de producción pueden usar el modelo para generar descripciones o resúmenes de diálogos, facilitando la revisión de guiones.
- **Aplicaciones educativas**: generar subtítulos para clases grabadas o contenido educativo en línea, mejorando la accesibilidad para estudiantes con discapacidad auditiva o que prefieren leer.
- **Integración en herramientas de transcripción**: el adaptador puede combinarse con sistemas de ASR (reconocimiento automático del habla) para producir subtítulos en tiempo real, aunque no se especifica la latencia.
- **Creación de contenido para redes sociales**: generar subtítulos para vídeos cortos, mejorando la audiencia en entornos sin sonido.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay datos sobre MMLU, HumanEval, GSM8K ni otros indicadores para este adaptador específico. El rendimiento en la tarea de subtítulos tampoco está documentado.

## Requisitos de hardware

- **VRAM estimada**: al ser un adaptador LoRA que se carga sobre el modelo base de 4 bits, la inferencia puede ejecutarse en GPU con **4-6 GB de VRAM** (dependiendo de la longitud de la secuencia). La versión completa de Qwen3-4B en 16 bits requiere unos 8 GB, pero la cuantización 4-bit reduce el consumo a ~2-3 GB.
- **GPUs recomendadas**: tarjetas consumer como NVIDIA RTX 3060 (12 GB), RTX 4060 (8 GB) o superiores. En entornos de producción, se puede usar A10G, L4 o T4.
- **Compatibilidad con consumer GPU**: sí, cabe en la mayoría de GPUs de 8 GB o más.
- **Opciones de despliegue**: dado que es un modelo de Transformers con safetensors, se puede servir con **vLLM**, **TGI**, **Ollama** (si se convierte a GGUF) o **llama.cpp**. La etiqueta `endpoints_compatible` sugiere compatibilidad con endpoints de Hugging Face.
- **Latencia y throughput**: no hay datos oficiales. En una GPU como RTX 4090, se espera una latencia baja (del orden de decenas de milisegundos por token) y un throughput de 100-200 tokens/s, pero no confirmado.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Qwen3-4B (base) | 4B | 131k (YaRN) | Apache 2.0 | safetensors | Modelo base completo, no adaptador |
| Llama-3.2-3B | 3B | 128k | Llama 3.2 Community | safetensors, GGUF | Alternativa popular de 3B |
| Phi-3-mini-4k | 3.8B | 4k | MIT | safetensors | Modelo pequeño de Microsoft, contexto corto |
| Gemma-3-4B | 4B | 128k | Gemma License | safetensors | De Google, multilingüe |

El modelo aquí descrito se diferencia por ser un adaptador LoRA específico para subtítulos, no un modelo generalista. Su ventaja es el bajo coste de despliegue y la personalización, pero no se dispone de datos de rendimiento comparativo.

## Limitaciones y advertencias

- **Idioma ambiguo**: la model card indica `en` como idioma, pero el nombre del modelo sugiere español. Esto puede causar malentendidos al usarlo; se recomienda verificar el comportamiento real.
- **Alucinaciones**: como cualquier modelo de lenguaje, puede generar contenido falso o no fiel al texto original, especialmente en tareas de subtitulado donde se requiere precisión.
- **Sesgos**: no se documentan sesgos específicos, pero el modelo base Qwen3 puede tener sesgos de género, culturales o lingüísticos.
- **Limitación de contexto**: aunque el modelo base soporta 32k tokens por defecto, el adaptador puede no haber sido entrenado con contextos tan largos; se recomienda probar con secuencias cortas.
- **Uso comercial**: la licencia Apache 2.0 permite uso comercial, pero el modelo base tiene restricciones de la licencia de Qwen (Apache 2.0 también). No se han detectado restricciones adicionales.
- **Falta de documentación**: no hay información sobre el conjunto de datos de entrenamiento, la metodología ni los resultados de evaluación, lo que dificulta evaluar su robustez en producción.

## Enlaces

- [Hugging Face: Hookem22/qwen3-4b-subtitle-es-n85-lora](https://huggingface.co/Hookem22/qwen3-4b-subtitle-es-n85-lora)
- [Hugging Face: Hookem22/qwen3-4b-subtitle-es-lora (variante similar)](https://huggingface.co/Hookem22/qwen3-4b-subtitle-es-lora)
- [Modelo base Qwen3-4B en Hugging Face](https://huggingface.co/Qwen/Qwen3-4B)
- [Repositorio oficial de Qwen3 en GitHub](https://github.com/QwenLM/Qwen3)
- [Deploy en FriendliAI](https://friendli.ai/models/Hookem22/qwen3-4b-subtitle-es)
- [Ficha de Qwen3-4B en LM Studio](https://lmstudio.ai/models/qwen/qwen3-4b)
