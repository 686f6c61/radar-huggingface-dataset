# Outlier-Ai/Qwen3-4B-MLX-4bit

## Resumen

Qwen3-4B-MLX-4bit es una conversión cuantizada a 4 bits en formato MLX del modelo Qwen3-4B, desarrollado originalmente por el equipo Qwen de Alibaba y empaquetado por Outlier-Ai para su ejecución eficiente en Apple Silicon (chips M1, M2, M3 y M4). No se trata de un modelo nuevo ni de un ajuste fino: los pesos son idénticos a los del modelo base, y la aportación del publicador se limita al formato de cuantización y al empaquetado para la librería `mlx-lm`. El modelo resuelve el problema de desplegar un LLM de 4.000 millones de parámetros en hardware de consumo Mac sin conexión a la nube.

Arquitectura transformer densa (no MoE) con 4.022.468.096 parámetros totales, derivada de la familia Qwen3. El modelo base incorpora modos de razonamiento ("thinking") y de respuesta directa, además de soporte de tool calling y capacidades multilingües en 15 idiomas. La cuantización a 4 bits reduce el repositorio a 2,3 GB, lo que permite cargarlo en Macs con 8 GB de memoria unificada o superior.

Su relevancia actual radica en la combinación de licencia Apache 2.0, un tamaño manejable para inferencia local y un contexto amplio heredado del modelo original, lo que lo convierte en una opción práctica para aplicaciones de escritorio, prototipado offline y despliegues con requisitos de privacidad estrictos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (familia Qwen3) |
| Parametros totales | 4.022.468.096 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada |
| Tipos de cuantizacion | 4 bits (MLX); el modelo base admite otras cuantizaciones no detalladas aqui |
| Idiomas soportados | en, zh, fr, es, pt, de, it, ru, ja, ko, ar, vi, th, nl, pl |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors en formato MLX (libreria `mlx-lm`) |

## Arquitectura y entrenamiento

El modelo es una conversión de formato del Qwen3-4B original, que emplea una arquitectura transformer densa con atención estándar. No se dispone de detalles sobre el número exacto de capas, dimensiones ocultas ni configuración de cabezas de atención en la información proporcionada. Tampoco se documentan en esta ficha los datos de entrenamiento del modelo base (composición del corpus, número de tokens, uso de RLHF o DPO), por lo que deben consultarse en la model card de Qwen/Qwen3-4B.

La innovación técnica de esta publicación es exclusivamente de empaquetado: la cuantización a 4 bits en el formato MLX, optimizado para el framework Metal de Apple. Esto permite ejecutar el modelo con la librería `mlx-lm` en macOS, con pesos que ocupan 2,3 GB en disco. El modelo base Qwen3 incorpora modos de razonamiento explícito (thinking) y de respuesta directa, así como soporte nativo de tool calling, capacidades que se preservan tras la cuantización al no modificarse los pesos.

## Capacidades

- Generación de texto conversacional multi-turno en 15 idiomas, incluido el español.
- Razonamiento explícito mediante modo "thinking", heredado de Qwen3.
- Respuesta directa sin cadena de razonamiento para consultas simples.
- Soporte de tool calling y function calling, según los tags del modelo.
- Capacidades de razonamiento matemático y generación de código propias del modelo base.
- Ejecución completamente local y offline en Apple Silicon, sin API keys ni límites de uso.
- Integración con la aplicación Outlier para macOS y con `mlx-lm` mediante CLI y API de Python.

## Casos de uso

- Asistente de escritorio privado: ejecución local en un MacBook con 8 GB o más de memoria unificada, sin enviar datos a la nube, adecuado para entornos con requisitos de confidencialidad.
- Prototipado de agentes con tool calling: el soporte de function calling permite construir flujos multi-paso que invocan APIs locales o scripts del sistema operativo.
- Generación de código en local: útil para autocompletado y explicación de fragmentos en editores, con la ventaja de no requerir conexión y de mantener el código dentro del equipo.
- Procesamiento de documentos multilingües: con 15 idiomas soportados, puede resumir y traducir textos en inglés, chino, francés, español, portugués, alemán, italiano, ruso, japonés, coreano, árabe, vietnamita, tailandés, neerlandés y polaco.
- Educación y experimentación: modelo de 4B parámetros que cabe en hardware de consumo, ideal para aprender a desplegar LLMs con MLX y comparar modos thinking frente a respuesta directa.
- Automatización de tareas de oficina en macOS: clasificación, extracción de datos y redacción asistida integradas en scripts locales mediante `mlx-lm`.
- Chatbot embebido en aplicaciones de escritorio: la licencia Apache 2.0 permite redistribución dentro de productos comerciales sin restricciones de uso.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del publicador no incluye métricas de MMLU, HumanEval, GSM8K ni comparativas cuantitativas. Para datos de rendimiento del modelo base, debe consultarse la documentación oficial de Qwen/Qwen3-4B.

## Requisitos de hardware

- VRAM o memoria unificada estimada: aproximadamente 2,3 GB para los pesos en 4 bits, más overhead de inferencia; se recomienda un mínimo de 8 GB de memoria unificada en Mac.
- GPU compatibles: exclusivamente Apple Silicon (M1, M2, M3, M4), según los tags del modelo; no está pensado para GPUs NVIDIA o AMD.
- Cabe en GPU de consumo: sí, en cualquier Mac con chip de la serie M; no aplica a GPUs dedicadas convencionales.
- Opciones de despliegue: `mlx-lm` (CLI y Python) y la aplicación Outlier para macOS, instalable mediante `brew install --cask outlier-host/tap/outlier`.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3-4B-MLX-4bit (este) | 4,02B | No disponible | Apache 2.0 | MLX safetensors 4-bit | Hugging Face, app Outlier |
| Qwen3-4B (base) | 4,02B | No disponible | Apache 2.0 | safetensors (BF16/FP16) | Hugging Face |
| Qwen3-8B-MLX-4bit (Outlier-Ai) | ~8B | No disponible | Apache 2.0 | MLX safetensors 4-bit | Hugging Face |
| Qwen3-14B-MLX-4bit (Outlier-Ai) | ~14B | No disponible | Apache 2.0 | MLX safetensors 4-bit | Hugging Face |

La comparativa se limita a la familia Qwen3 y a las conversiones del mismo publicador, ya que no se dispone de datos de rendimiento que permitan contrastar con modelos de otras familias (Llama, Gemma, Phi) de forma cuantitativa. La diferencia principal frente al modelo base es el formato y el tamaño en disco; frente a las variantes de 8B y 14B, el menor consumo de memoria a costa de capacidad.

## Limitaciones y advertencias

- La cuantización a 4 bits puede degradar ligeramente la calidad de las respuestas frente al modelo base en BF16, especialmente en tareas de razonamiento complejo y matemáticas.
- Riesgo de alucinación inherente a los modelos de 4B parámetros; no debe usarse como fuente única de verdad en dominios críticos.
- La longitud de contexto no está documentada en la información disponible; verificar en la model card del modelo base antes de diseñar aplicaciones con contextos largos.
- Compatibilidad limitada a Apple Silicon y a la librería MLX; no es desplegable con vLLM, TGI o llama.cpp sin conversión adicional.
- El modelo es una conversión de formato, no un ajuste fino: no incorpora mejoras específicas de Outlier más allá del empaquetado.
- Aunque la licencia Apache 2.0 permite uso comercial, deben respetarse las condiciones del modelo base Qwen3-4B y las políticas de uso de Alibaba.
- El rendimiento en idiomas distintos del inglés y el chino puede ser inferior; los 15 idiomas listados no implican calidad homogénea.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Outlier-Ai/Qwen3-4B-MLX-4bit
- Variante Outlier-Qwen3-4B-MLX-4bit: https://huggingface.co/Outlier-Ai/Outlier-Qwen3-4B-MLX-4bit
- Modelo base Qwen3-4B: https://huggingface.co/Qwen/Qwen3-4B
- Aplicación Outlier para macOS: https://outlier.host/
- Conversión Qwen3-8B-MLX-4bit: https://huggingface.co/Outlier-Ai/Qwen3-8B-MLX-4bit
- Conversión Qwen3-14B-MLX-4bit: https://huggingface.co/Outlier-Ai/Qwen3-14B-MLX-4bit
- Conversión Qwen3-Coder-30B-A3B-Instruct-MLX-4bit: https://huggingface.co/Outlier-Ai/Qwen3-Coder-30B-A3B-Instruct-MLX-4bit
