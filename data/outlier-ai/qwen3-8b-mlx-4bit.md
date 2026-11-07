# Outlier-Ai/Qwen3-8B-MLX-4bit

## Resumen
Qwen3-8B-MLX-4bit es una conversión cuantizada a 4 bits, en formato MLX, del modelo Qwen/Qwen3-8B de Alibaba. La ha publicado Outlier-Ai, un proyecto que distribuye versiones optimizadas para Apple Silicon de modelos abiertos populares, con el objetivo de ejecutarlos localmente en Macs sin nube. El modelo conserva las capacidades del Qwen3-8B original (razonamiento, modo thinking, tool calling, multilingüismo) pero ocupa solo 4,6 GB en disco, lo que lo hace viable en equipos con memoria unificada relativamente modesta.

Qwen3-8B es un transformer denso de aproximadamente 8.190 millones de parámetros, derivado de la familia Qwen3, e incluye modos de razonamiento explícito (thinking) y de respuesta directa. Esta conversión está pensada para desarrolladores que quieren privacidad total y cero dependencia de APIs externas en entornos macOS con chip M-series, usando el framework MLX de Apple. Es relevante ahora porque combina un modelo de 8B con licencia Apache 2.0, soporte de 15 idiomas y tool calling, en un paquete que cabe en un MacBook Air.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer denso (familia Qwen3), pesos en formato MLX |
| Parámetros totales | 8.190.735.360 |
| Parámetros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | no disponible en la información proporcionada (heredada del Qwen3-8B original) |
| Tipos de cuantización | 4-bit (MLX) |
| Idiomas soportados | en, zh, fr, es, pt, de, it, ru, ja, ko, ar, vi, th, nl, pl |
| Licencia | Apache 2.0 (heredada del modelo base) |
| Formato de pesos | safetensors (MLX), librería mlx-lm |

## Arquitectura y entrenamiento
El modelo base Qwen3-8B es un transformer denso con 8.190 millones de parámetros, entrenado por Alibaba con datos multilingües y técnicas de alineación que incluyen instrucción supervisada y optimización por preferencias. Incorpora un modo de razonamiento (thinking) que genera cadenas de pensamiento antes de la respuesta final, y un modo de respuesta directa para latencia baja. Esta conversión MLX-4bit no modifica la arquitectura ni el entrenamiento: solo aplica cuantización de pesos a 4 bits para inferencia en Apple Silicon mediante Metal.

No se dispone en la información proporcionada del número exacto de tokens de entrenamiento, la composición del dataset ni los detalles de RLHF/DPO del modelo base. Se recomienda consultar la model card de Qwen/Qwen3-8B para esos datos.

## Capacidades
- Generación de texto y conversación multi-turno (chat).
- Razonamiento con modo thinking explícito, útil para matemáticas y problemas multi-paso.
- Tool calling / function calling, integrable en agentes.
- Capacidades multilingües en 15 idiomas, incluido castellano.
- Ejecución 100% local y offline en macOS con Apple Silicon (sin nube, sin claves API).
- Inferencia acelerada por Metal mediante MLX.

## Casos de uso
- Asistente de código local: integrado en editores o CLIs en un Mac, el modelo puede generar y revisar código sin enviar fragmentos a servicios externos, gracias a su soporte de tool calling.
- Atención al cliente con datos sensibles: desplegado on-device, permite procesar conversaciones con información confidencial sin salir del equipo, cumpliendo requisitos de privacidad.
- Automatización de agentes en escritorio: pipelines multi-paso que invocan herramientas locales (ficheros, scripts) usando function calling y el modo thinking para planificar.
- Análisis de documentos privados: resumen y extracción sobre contratos o informes almacenados en el Mac, aprovechando el multilingüismo para documentos en castellano, inglés, francés, alemán, etc.
- Prototipado rápido sin coste de API: investigadores que quieren iterar prompts y evaluar razonamiento en un MacBook Air o Mac mini sin incurrir en facturación por token.
- Educación y demos offline: entornos sin conectividad (aulas, laboratorios aislados) donde se necesita un LLM capaz de razonar y conversar.
- Traducción y asistencia multilingüe local: soporte de 15 idiomas para tareas de traducción y redacción sin dependencia de servicios en la nube.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la información disponible. La model card de esta conversión no incluye métricas (MMLU, HumanEval, GSM8K, etc.) ni comparaciones con el modelo original en precisión. Cualquier cifra de rendimiento del Qwen3-8B original debe consultarse en la model card oficial de Qwen.

## Requisitos de hardware
- VRAM/memoria unificada estimada: el repo ocupa 4,6 GB, por lo que se necesita al menos ~6 GB de memoria libre para cargar pesos y trabajar con contexto moderado; contextos largos elevan el consumo de KV cache.
- GPU/compatibilidad: exclusivamente Apple Silicon (M1, M2, M3, M4) con framework MLX y Metal. No está pensado para GPUs NVIDIA.
- Cabe en consumer hardware: sí, en MacBook Air/Mac mini/MacBook Pro con 8 GB o más de memoria unificada (16 GB recomendado para contextos amplios).
- Opciones de despliegue: `mlx-lm` (librería oficial), la app Outlier para macOS, y cualquier runtime compatible con MLX. No es utilizable directamente con vLLM, llama.cpp, Ollama o TGI sin reconversión de formato.
- Latencia y throughput: no disponibles en la información proporcionada; dependen del chip (M1 vs M4) y del contexto.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3-8B-MLX-4bit (este) | 8,19B | no disponible | MLX 4-bit | Apache 2.0 | Hugging Face, Apple Silicon |
| Qwen3-8B (original) | 8,19B | no disponible | safetensors (BF16/FP16) | Apache 2.0 | Hugging Face, multiplataforma |
| Qwen3-14B-MLX-4bit (Outlier) | ~14B | no disponible | MLX 4-bit | Apache 2.0 | Hugging Face, Apple Silicon |
| Qwen3-32B-MLX-4bit (Outlier) | ~32B | no disponible | MLX 4-bit | Apache 2.0 | Hugging Face, Apple Silicon |

La comparación directa de rendimiento no está disponible en la información proporcionada. El modelo original Qwen3-8B es la referencia natural; las variantes 14B y 32B de Outlier ofrecen mayor capacidad a costa de más memoria.

## Limitaciones y advertencias
- La cuantización a 4 bits puede degradar la precisión respecto al Qwen3-8B original, especialmente en tareas de razonamiento matemático y código; no hay métricas publicadas que lo cuantifiquen.
- Riesgo de alucinación inherente a modelos de 8B: verificar respuestas factuales en producción.
- Sesgos potenciales heredados del dataset de entrenamiento del modelo base; no evaluados en esta conversión.
- Exclusivo para Apple Silicon: no funciona en GPUs NVIDIA ni en CPUs x86 mediante MLX.
- La model card incluye promoción de la app Outlier (descarga y versión Pro de pago); es material comercial, no una validación técnica.
- Aunque la licencia es Apache 2.0, conviene revisar la model card del Qwen3-8B original para condiciones y atribuciones.
- Contexto máximo no confirmado en esta ficha; verificar en la documentación del modelo base antes de usarlo con ventanas largas.

## Enlaces
- Hugging Face (este modelo): https://huggingface.co/Outlier-Ai/Qwen3-8B-MLX-4bit
- Modelo base: https://huggingface.co/Qwen/Qwen3-8B
- Variante Outlier-Qwen3-8B-MLX-4bit: https://huggingface.co/Outlier-Ai/Outlier-Qwen3-8B-MLX-4bit
- Qwen3-14B-MLX-4bit: https://huggingface.co/Outlier-Ai/Qwen3-14B-MLX-4bit
- Qwen3-32B-MLX-4bit: https://huggingface.co/Outlier-Ai/Qwen3-32B-MLX-4bit
- Qwen3-Coder-30B-A3B-Instruct-MLX-4bit: https://huggingface.co/Outlier-Ai/Qwen3-Coder-30B-A3B-Instruct-MLX-4bit
- App Outlier: https://outlier.host/
