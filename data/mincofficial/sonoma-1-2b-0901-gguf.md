# Mincofficial/Sonoma-1.2B-0901-GGUF

## Resumen

Sonoma-1.2B-0901-GGUF es una cuantización en formato GGUF (Q4_K_M) del modelo de lenguaje Sonoma-1.2B-0901, desarrollado por el usuario Mincofficial. El modelo base es un derivado de LFM2.5-1.2B-Thinking de LiquidAI, un modelo compacto de 1.170 millones de parámetros orientado a razonamiento, código y matemáticas, con licencia LFM Open License v1.0. Esta versión GGUF está pensada para ejecución local mediante llama.cpp, lo que permite desplegarlo en hardware modesto, incluidos portátiles con Apple Silicon o GPUs de gama baja.

El repositorio incluye únicamente el archivo cuantizado Q4_K_M de 697 MiB, junto con su hash SHA-256 y un benchmark de velocidad medido en Apple M5. No se proporcionan detalles sobre la arquitectura interna, el proceso de entrenamiento ni resultados de benchmarks de calidad estándar, por lo que la evaluación de sus capacidades debe basarse en la herencia de LFM2.5-1.2B-Thinking y en pruebas empíricas por parte del usuario.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (derivado de LFM2.5-1.2B-Thinking) |
| Parametros totales | 1.170.340.608 (1,17 B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no especificada; el ejemplo de uso emplea 4096 tokens |
| Tipos de cuantizacion | Q4_K_M (en este repositorio) |
| Idiomas soportados | ingles |
| Licencia | LFM Open License v1.0 |
| Formato de pesos | GGUF (llama.cpp) |

## Arquitectura y entrenamiento

No se ha publicado información detallada sobre la arquitectura interna de Sonoma-1.2B-0901. Según la model card, el modelo es un derivado de LFM2.5-1.2B-Thinking, un modelo de lenguaje de 1,2 B de parámetros desarrollado por LiquidAI, que incorpora capacidades de razonamiento explícito (modo "thinking"). Se desconoce si la arquitectura es un transformer estándar, una variante con atención lineal o un modelo híbrido. Tampoco se dispone de datos sobre el dataset de entrenamiento, el número de tokens procesados o si se aplicaron técnicas como RLHF o DPO. La versión GGUF se generó a partir de una fusión GA (presumiblemente "gradient accumulation" o "grouped attention") en formato MLX, y posteriormente se cuantizó a Q4_K_M para su uso con llama.cpp.

## Capacidades

- Generacion de texto conversacional: el modelo está etiquetado como "conversational" y puede mantener diálogos multi-turno.
- Razonamiento y resolución de problemas: hereda de LFM2.5-1.2B-Thinking la capacidad de razonamiento paso a paso, aunque no se ha verificado de forma independiente.
- Generación de código y soporte matemático: los tags del modelo incluyen "code" y "math", lo que sugiere competencia en estas áreas.
- Ejecución local eficiente: al estar cuantizado en Q4_K_M, puede ejecutarse en CPU o GPU con pocos recursos, sin necesidad de hardware especializado.
- Compatibilidad con llama.cpp: integración directa con herramientas como llama-cli, llama-server y otras basadas en GGUF.

## Casos de uso

- Asistente local de chat en dispositivos de bajos recursos: el modelo puede desplegarse en un portátil sin GPU dedicada o en una Raspberry Pi, ofreciendo respuestas conversacionales sin conexión a internet.
- Prototipado rápido de aplicaciones de IA generativa: su pequeño tamaño y formato GGUF permiten iterar rápidamente en entornos de desarrollo, probando prompts y flujos de conversación antes de escalar a modelos mayores.
- Generación de código en entornos sin conexión: programadores que trabajan en entornos aislados o con políticas de seguridad estrictas pueden usar el modelo para autocompletar o generar fragmentos de código localmente.
- Educación e investigación: sirve como modelo de referencia para estudiar el comportamiento de modelos pequeños con capacidades de razonamiento, o para experimentos de fine-tuning y evaluación.
- Automatización de tareas de texto simples: resúmenes, extracción de información o redacción de borradores en inglés, siempre que la calidad requerida no sea crítica.
- Benchmarking de hardware: el repositorio incluye un benchmark de velocidad, por lo que puede usarse para medir el rendimiento de diferentes dispositivos (CPU, GPU, Apple Silicon) con llama.cpp.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K, etc.) en la información disponible. El único dato de rendimiento es una medición de velocidad realizada por el autor en un Apple M5 con Metal y 99 capas en GPU, usando `llama-bench` build 8210:

| Metrica | Valor |
|---|---|
| Prompt tokens/segundo | 596,8 |
| Tokens generados/segundo | 53,0 |
| Configuracion | 512 tokens de prompt, 128 tokens generados, 3 repeticiones |

Este resultado es específico de la cuantización Q4_K_M y de la plataforma Apple M5; no se puede extrapolar a otros hardware sin pruebas adicionales.

## Requisitos de hardware

- El archivo GGUF Q4_K_M ocupa 697 MiB, por lo que cabe en la memoria de cualquier GPU moderna con al menos 1 GB de VRAM, y también puede ejecutarse completamente en CPU.
- En Apple Silicon (M1/M2/M3/M4/M5) con Metal, se puede descargar todas las capas a la GPU (por ejemplo, `-ngl 99`), logrando velocidades de generación de unos 50 tokens/s según el benchmark del autor.
- En GPUs NVIDIA, se recomienda al menos 2 GB de VRAM para una ejecución cómoda; modelos como RTX 3050, RTX 4050 o superiores son suficientes.
- En CPU, el rendimiento dependerá del número de núcleos y de la memoria RAM; se puede ejecutar con llama.cpp sin GPU, aunque la velocidad será menor.
- Opciones de despliegue: llama.cpp (llama-cli, llama-server), Ollama, LM Studio, o cualquier runtime compatible con GGUF.
- Para uso en producción con múltiples peticiones concurrentes, se recomienda un servidor como llama-server con batch, aunque la capacidad del modelo es limitada para cargas altas.

## Comparativa con modelos similares

No se dispone de datos de rendimiento comparativos con otros modelos de tamaño similar (por ejemplo, Qwen2.5-1.5B, Gemma-2-2B, Phi-3-mini). La información disponible no incluye resultados de benchmarks estándar, por lo que no es posible realizar una comparación objetiva. Se recomienda al usuario ejecutar sus propias pruebas con las herramientas de evaluación habituales.

## Limitaciones y advertencias

- Al ser un modelo de solo 1,2 B de parámetros, su capacidad de razonamiento complejo y de generación de código avanzado es limitada en comparación con modelos de mayor tamaño.
- No se han publicado evaluaciones de sesgos, toxicidad o alucinaciones; es probable que presente los sesgos típicos de los modelos entrenados con datos de internet en inglés.
- La licencia LFM Open License v1.0 puede imponer restricciones al uso comercial o a la redistribución; es obligatorio revisar el texto completo de la licencia antes de utilizarlo en producción.
- El modelo solo soporta inglés; no se ha verificado su rendimiento en otros idiomas.
- La longitud de contexto no está documentada; el ejemplo de uso emplea 4096 tokens, pero no se garantiza que el modelo funcione correctamente con contextos más largos.
- No se proporcionan garantías sobre la calidad de las respuestas; se recomienda validar el modelo en el caso de uso concreto antes de integrarlo en un sistema crítico.

## Enlaces

- Repositorio HuggingFace del GGUF: https://huggingface.co/Mincofficial/Sonoma-1.2B-0901-GGUF
- Modelo base (safetensors): https://huggingface.co/Mincofficial/Sonoma-1.2B-0901
- Modelo preview (MLX/Safetensors/GGUF): https://huggingface.co/Mincofficial/Sonoma-1.2B-Preview
- Licencia LFM Open License v1.0: https://huggingface.co/LiquidAI/LFM2.5-1.2B-Thinking/blob/main/LICENSE
