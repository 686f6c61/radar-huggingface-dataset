# andosen/Psych_Qwen_32B-mlx-5Bit

## Resumen

El modelo `andosen/Psych_Qwen_32B-mlx-5Bit` es una conversión al formato MLX (Apple Silicon) del modelo `Compumacy/Psych_Qwen_32B`, un ajuste fino especializado en psicología, psiquiatría y evaluación clínica de salud mental. El modelo base es `Qwen3-32B` de Alibaba, una arquitectura transformer con soporte de modos de razonamiento (thinking y no-thinking). La conversión fue realizada por el usuario andosen con la librería `mlx-lm` en su versión 0.31.2, utilizando cuantización de 5 bits para reducir el peso y la huella de memoria, lo que facilita su ejecución en hardware de Apple (GPU unificada) y en entornos con recursos limitados.

El interés de esta ficha radica en que se trata de un modelo de dominio específico, orientado a tareas de análisis clínico, evaluación psicológica y generación de contenido en el ámbito de la salud mental. Aunque el modelo base original de Compumacy requiere cerca de 65,8 GB de VRAM para inferencia completa, la versión cuantizada a 5 bits reduce significativamente este requisito, haciéndolo accesible en GPU consumer con 8-12 GB de VRAM o en Mac con chips M1/M2/M3/M4. El repositorio cuenta con 0 descargas y 0 likes en el momento de la consulta, lo que indica que es una publicación reciente y poco difundida.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (Qwen3) |
| Parámetros totales | 6.143.448.064 (datos safetensors; el modelo base es de 32B) |
| Parámetros activos | No disponible (no es MoE) |
| Longitud de contexto | 40.000 tokens (según LLM Explorer) |
| Tipos de cuantización | 5 bits (MLX) |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (MLX) |

Nota: El modelo se llama “Psych_Qwen_32B” porque la arquitectura base es Qwen3-32B, pero los pesos en safetensors muestran 6.1B de parámetros debido a la cuantización de 5 bits. La versión sin cuantizar de Compumacy requiere 65,8 GB de VRAM.

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura Qwen3, un transformer autoregresivo con atención por ventana y soporte de modos de razonamiento explícito (thinking) y no explícito (non-thinking). El ajuste fino original (`Compumacy/Psych_Qwen_32B`) se realizó sobre el dataset `Daemontatox/Psy-Data-books`, que incluye libros y textos especializados en psicología, psiquiatría, evaluación clínica y salud mental. El proceso de entrenamiento usó LoRA (Low-Rank Adaptation) con la librería Unsloth, lo que permite un ajuste eficiente en recursos.

La conversión a MLX se realizó con `mlx-lm` 0.31.2, que convierte los pesos de PyTorch a formato MLX y aplica cuantización de 5 bits. No se han publicado detalles sobre el número de tokens de entrenamiento ni el uso de RLHF o DPO, pero la técnica de LoRA sugiere un fine-tuning ligero sobre el modelo base. El modelo hereda las capacidades de Qwen3, incluyendo el control de razonamiento mediante tokens especiales (`/think` y `/no_think`), que se pueden activar o desactivar según la tarea.

## Capacidades

- Generación de texto en inglés, con dominio específico en psicología, psiquiatría y evaluación clínica.
- Modo de razonamiento (thinking) para tareas complejas como análisis de síntomas o interpretación de casos.
- Modo no razonamiento (non-thinking) para respuestas rápidas y directas en conversaciones.
- Soporte de conversaciones multi-turno con contexto largo (40K tokens).
- Capacidades de escritura creativa y explicación didáctica en ámbitos de salud mental.
- No incluye soporte de tool calling ni función calling (no confirmado en la información disponible).
- No incluye capacidades de visión ni audio; es un modelo de texto puro.

## Casos de uso

- **Asistente de evaluación clínica**: el modelo puede ayudar a profesionales de la salud mental a redactar informes, resumir sesiones y sugerir posibles diagnósticos diferenciales basados en síntomas descritos, aprovechando su contexto de 40K tokens para analizar historiales extensos.
- **Plataforma de telepsicología**: se puede integrar en chatbots de atención al paciente para realizar triaje inicial, responder preguntas frecuentes sobre terapias o proporcionar contenido psicoeducativo, con respuestas en inglés y con un tono empático.
- **Generación de material terapéutico**: útil para crear guías, ejercicios de terapia cognitivo-conductual, planes de intervención y hojas de trabajo personalizables para pacientes, reduciendo el tiempo de preparación de los profesionales.
- **Análisis de literatura psicológica**: puede resumir artículos científicos, extraer conclusiones de estudios y ayudar en la revisión sistemática de papers sobre psicología y psiquiatría.
- **Simulación de casos clínicos**: para formación de estudiantes de psicología, el modelo puede generar casos simulados con síntomas y antecedentes, permitiendo practicar entrevistas y diagnósticos en un entorno seguro.
- **Redacción de informes y documentación**: asiste en la elaboración de informes clínicos, notas de evolución y resúmenes de alta, normalizando el formato y asegurando que se incluyan los datos relevantes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card solo incluye un `model-index` con el nombre “Compumacy-Experimental_MF” y resultados vacíos. No hay datos de MMLU, HumanEval, GSM8K ni otros estándares. Se recomienda evaluar el modelo en tareas específicas de salud mental antes de su uso en producción.

## Requisitos de hardware

- **VRAM estimada**: la versión cuantizada de 5 bits con 6.1 mil millones de parámetros requiere aproximadamente 4-5 GB de VRAM para inferencia en MLX, aunque el tamaño del repositorio es de 22,5 GB (incluye otros archivos como el tokenizador y configuraciones).
- **GPU recomendadas**: funciona nativamente en Apple Silicon (M1, M2, M3, M4) con al menos 8 GB de memoria unificada. En GPU NVIDIA, se puede ejecutar mediante conversión a GGUF o usando vLLM con cuantización, pero no está optimizado de fábrica.
- **Consumer GPU**: sí, cabe en tarjetas con 8 GB de VRAM (RTX 3060, RTX 4060, etc.) si se convierte a GGUF o se usa con vLLM en formato fp16 o cuantizado.
- **Opciones de despliegue**: 
  - MLX: `mlx-lm` (recomendado para Mac).
  - `llama.cpp` / Ollama: si se convierte a GGUF.
  - `vLLM` o TGI: si se convierte a formatos compatibles (por ejemplo, con `mlx-lm` export).
- **Latencia y throughput**: no se proporcionan datos específicos. En Apple Silicon M2 Pro, se espera una generación de 20-40 tokens/s con MLX. En GPU NVIDIA con vLLM, el throughput sería similar al de otros modelos de 6-7B.

## Comparativa con modelos similares

| Modelo | Tamaño | Contexto | Cuantización | Licencia | Especialización |
|---|---|---|---|---|---|
| `andosen/Psych_Qwen_32B-mlx-5Bit` | 6.1B (base 32B) | 40K | 5-bit MLX | Apache 2.0 | Psicología / salud mental |
| `Qwen/Qwen3-32B` (base) | 32B | 32K (131K con YaRN) | fp16/bf16 | Apache 2.0 | Generalista |
| `Compumacy/Psych_Qwen_32B` | 32B | 40K | fp16 | Apache 2.0 | Psicología / salud mental |
| `mistralai/Mistral-7B-Instruct` | 7B | 32K | fp16/GGUF | Apache 2.0 | General |

La ventaja de esta versión MLX es su menor huella de memoria (5-bit) frente al modelo de 32B original, lo que permite su ejecución en hardware de bajo consumo. Sin embargo, la cuantización puede degradar ligeramente la calidad de las respuestas en tareas clínicas complejas. No se dispone de benchmarks comparativos para cuantificar esta pérdida.

## Limitaciones y advertencias

- **Sesgos y alucinación**: como todo LLM, puede generar información plausible pero incorrecta, especialmente en dominios clínicos donde la precisión es crítica. No debe utilizarse como herramienta de diagnóstico autónoma sin supervisión profesional.
- **Especialización limitada**: el entrenamiento se basa en libros de psicología, pero no tiene acceso a bases de datos clínicas actualizadas ni a evidencia científica reciente, por lo que puede quedar desactualizado.
- **Idioma**: el modelo está entrenado principalmente en inglés (según la etiqueta `language: en`). Aunque puede producir texto en español, su calidad en español puede ser inferior a la de modelos multilingües nativos.
- **Contexto**: la ventana de 40K tokens es amplia, pero el uso de la totalidad puede degradar la coherencia en conversaciones largas. Se recomienda mantener historiales inferiores a 8K tokens para un rendimiento óptimo.
- **Licencia**: Apache 2.0 permite uso comercial y modificación, pero no ofrece garantías de seguridad para datos sensibles de pacientes. El cumplimiento de normativas como GDPR o HIPAA es responsabilidad del usuario.
- **Falta de validación clínica**: no hay estudios que avalen su uso en entornos médicos reales. Es un modelo experimental (nombre en el model-index: “Compumacy-Experimental_MF”).

## Enlaces

- Repositorio Hugging Face: [andosen/Psych_Qwen_32B-mlx-5Bit](https://huggingface.co/andosen/Psych_Qwen_32B-mlx-5Bit)
- Modelo base (Compumacy): [Compumacy/Psych_Qwen_32B](https://huggingface.co/Compumacy/Psych_Qwen_32B)
- Dataset de entrenamiento: [Daemontatox/Psy-Data-books](https://huggingface.co/datasets/Daemontatox/Psy-Data-books)
- Qwen3 Technical Report: [arXiv:2505.09388](https://arxiv.org/html/2505.09388v1)
- Ficha del modelo en LLM Explorer: [LLM Explorer - Psych Qwen 32B](https://llm-explorer.com/model/Compumacy%2FPsych_Qwen_32B,4jJv82hLMuOes804IxMsNV)
- Página de Qwen3 en LM Studio: [https://lmstudio.ai/models/qwen/qwen3-32b](https://lmstudio.ai/models/qwen/qwen3-32b)
