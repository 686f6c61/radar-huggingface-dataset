# Outlier-Ai/DeepSeek-R1-Distill-Qwen-32B-MLX-4bit

## Resumen

DeepSeek-R1-Distill-Qwen-32B-MLX-4bit es una conversión cuantizada a 4 bits en formato MLX del modelo deepseek-ai/DeepSeek-R1-Distill-Qwen-32B, publicada por Outlier-Ai para su ejecución nativa en Apple Silicon. El modelo base es un destilado de razonamiento de DeepSeek que parte de la arquitectura Qwen2 y ha sido entrenado para generar cadenas de pensamiento (chain-of-thought) antes de responder. Esta conversión no modifica los pesos originales ni aplica fine-tuning: solo cambia el formato en disco a safetensors MLX 4-bit con grupo de 64 y cuantización simétrica.

La relevancia de esta ficha radica en que permite ejecutar un modelo de razonamiento de 32.700 millones de parámetros de forma completamente local y offline en un Mac con chip M-series, sin depender de la nube ni de APIs. Con un repositorio de 18,4 GB, el modelo cabe en configuraciones de memoria unificada relativamente modestas para su tamaño, lo que lo convierte en una opción atractiva para desarrolladores que necesitan privacidad, ausencia de costes por token y control total del entorno.

El modelo conserva la licencia MIT del modelo base y soporta diez idiomas declarados (inglés, chino, francés, español, portugués, alemán, ruso, japonés, coreano y árabe). Está etiquetado para generación de texto, razonamiento, function calling y uso conversacional, y se distribuye con la librería mlx-lm 0.31.x.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (Qwen2) con destilación de razonamiento DeepSeek-R1 |
| Parametros totales | 32.763.876.352 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | 4-bit MLX (group size 64, simetrica) |
| Idiomas soportados | en, zh, fr, es, pt, de, ru, ja, ko, ar |
| Licencia | MIT |
| Formato de pesos | safetensors (MLX 4-bit, shards) |

## Arquitectura y entrenamiento

El modelo base es un transformer denso de la familia Qwen2 con 32.763.876.352 parámetros, destilado a partir de DeepSeek-R1. La destilación transfiere las capacidades de razonamiento del modelo R1 original a una arquitectura más pequeña, de modo que el modelo genera trazas de pensamiento explícitas antes de emitir la respuesta final. Esta conversión concreta no altera la arquitectura ni los pesos: únicamente aplica cuantización MLX de 4 bits con tamaño de grupo 64 y esquema simétrico, y repaqueta los ficheros como safetensors junto con `config.json`, tokenizer y `chat_template.jinja`.

No se dispone de información sobre el número exacto de tokens de entrenamiento, la composición del dataset de destilación ni si se aplicaron fases de RLHF o DPO en el modelo base dentro de la información proporcionada. La model card de esta conversión indica explícitamente que se trata de un "faithful port of the upstream weights — no fine-tuning, no merge", por lo que cualquier innovación técnica de entrenamiento corresponde al modelo original de DeepSeek y no a esta publicación.

## Capacidades

- Generación de texto con razonamiento explícito: produce cadenas de pensamiento (thinking mode) antes de la respuesta final, útil para problemas matemáticos, lógica y word problems.
- Razonamiento matemático y resolución de problemas tipo GSM8K, como ilustran los ejemplos de la model card (problema de los widgets, intersección de trenes).
- Razonamiento lógico y grids de deducción (ejemplo de mascotas de Alice, Bob y Carol).
- Soporte de function calling / tool calling, según las etiquetas del repositorio.
- Uso conversacional multi-turno con plantilla de chat propia (`chat_template.jinja`).
- Capacidades multilingües en diez idiomas: inglés, chino, francés, español, portugués, alemán, ruso, japonés, coreano y árabe.
- Ejecución completamente local y offline en Apple Silicon (M1, M2, M3, M4) mediante Metal y mlx-lm.
- No se declaran capacidades de visión ni audio en la información disponible.

## Casos de uso

- Razonamiento matemático local en un Mac: el modelo puede resolver problemas de aritmética y álgebra paso a paso mostrando la cadena de pensamiento, lo que permite auditar el razonamiento sin enviar datos a la nube. Adecuado para docencia, investigación o validación de pipelines matemáticos.
- Asistente de análisis privado de documentos: al ejecutarse offline con mlx-lm, se puede integrar en flujos donde el texto del usuario no debe salir del dispositivo, como borradores legales, notas clínicas o propiedad intelectual.
- Automatización de agentes con tool calling: las etiquetas de function calling permiten integrar el modelo en un orquestador local que llame a herramientas (shell, APIs internas, bases de datos) manteniendo el bucle de razonamiento en el dispositivo.
- Generación de código asistida en local: aunque no se publicitan benchmarks de código, el modelo puede usarse como copiloto en editores dentro de un Mac, con la ventaja de no requerir conexión y de preservar la confidencialidad del código fuente.
- Prototipado de aplicaciones de razonamiento sin coste por token: desarrolladores que iteran sobre prompts de chain-of-thought pueden usar esta conversión para experimentar sin factura de API, aprovechando los 18,4 GB del repositorio y la carga directa con `mlx_lm.generate`.
- Evaluación de modelos de razonamiento en hardware de consumo: investigadores pueden comparar el comportamiento del destilado de 32B frente a versiones de 7B, 8B y 14B del mismo autor en el mismo Mac, usando la misma toolchain MLX.
- Chat multilingüe offline: atención a usuarios en español, francés, alemán, japonés o árabe sin depender de servicios externos, útil en entornos con requisitos de soberanía de datos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card remite a outlier.host/benchmarks para cifras de MMLU, HumanEval y tok/s en Macs M-series, pero esos datos no se incluyen en el material proporcionado y no se reproducen aquí para no inventar cifras.

## Requisitos de hardware

- VRAM/memoria unificada estimada: el repositorio pesa 18,4 GB en cuantización 4-bit; se necesita memoria unificada suficiente para cargar los pesos más el contexto y el estado de inferencia, por lo que se recomienda un Mac con al menos 24-32 GB de memoria unificada para uso cómodo.
- GPU recomendadas: Apple Silicon M1, M2, M3 y M4 (incluidos MacBook Air, MacBook Pro, Mac mini y Mac Studio), según las etiquetas del repositorio.
- Cabe en GPU de consumo: sí, en Macs con memoria unificada suficiente; no está pensado para GPUs NVIDIA discretas en este formato (MLX es específico de Apple Silicon).
- Opciones de despliegue: `mlx-lm` 0.31.x (CLI `python -m mlx_lm.generate` o API Python `load`/`generate`), y la app Outlier para macOS (descarga gratuita, versión Pro de pago único de 49 USD para hasta 3 Macs).
- Latencia y throughput: no disponibles en la información proporcionada; la model card remite a outlier.host/benchmarks para tok/s en M-series.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| DeepSeek-R1-Distill-Qwen-32B-MLX-4bit (este) | 32,76 B | no disponible | MLX 4-bit safetensors | MIT | Hugging Face, 88 descargas |
| DeepSeek-R1-Distill-Qwen-14B-MLX-4bit (Outlier-Ai) | ~14 B (no confirmado en la informacion) | no disponible | MLX 4-bit safetensors | MIT (heredada) | Hugging Face, 1.087 descargas |
| DeepSeek-R1-Distill-Llama-8B-MLX-4bit (Outlier-Ai) | ~8 B (no confirmado en la informacion) | no disponible | MLX 4-bit safetensors | MIT (heredada) | Hugging Face, 1.148 descargas |
| DeepSeek-R1-Distill-Qwen-7B-MLX-4bit (Outlier-Ai) | ~7 B (no confirmado en la informacion) | no disponible | MLX 4-bit safetensors | MIT (heredada) | Hugging Face, 1.932 descargas |

Los modelos comparables son las otras conversiones MLX 4-bit del mismo autor, que comparten toolchain, licencia y formato pero difieren en tamaño y, por tanto, en requisitos de memoria y calidad de razonamiento. No se dispone de datos de benchmarks comparativos en la información proporcionada.

## Limitaciones y advertencias

- Al ser una conversión 4-bit, existe una pérdida de precisión respecto a los pesos originales en bf16/fp16; la cuantización puede degradar ligeramente tareas de razonamiento matemático fino o de código.
- El modelo base es un destilado, no el DeepSeek-R1 completo; su capacidad de razonamiento es inferior a la del modelo original de mayor tamaño.
- Riesgo de alucinación inherente a los modelos de lenguaje, especialmente en dominios factuales y en respuestas largas con cadenas de pensamiento extensas.
- La longitud de contexto no se especifica en la información proporcionada; conviene verificar el `config.json` antes de diseñar flujos con ventanas largas.
- El formato MLX es específico de Apple Silicon; no es portable directamente a GPUs NVIDIA ni a servidores x86 sin reconversión.
- Aunque la licencia es MIT, se recomienda revisar la model card del modelo base de DeepSeek para confirmar cualquier restricción adicional de uso.
- La model card incluye promoción de la app Outlier y enlaces con parámetros UTM; conviene tratarlos como material comercial y no como especificación técnica.
- El número de descargas (88) y de likes (0) es bajo, lo que sugiere poca validación comunitaria de esta conversión concreta.

## Enlaces

- Hugging Face: https://huggingface.co/Outlier-Ai/DeepSeek-R1-Distill-Qwen-32B-MLX-4bit
- Modelo base: https://huggingface.co/deepseek-ai/DeepSeek-R1-Distill-Qwen-32B
- App Outlier: https://outlier.host/
- Benchmarks de Outlier: https://outlier.host/benchmarks
- Conversión 7B: https://huggingface.co/Outlier-Ai/DeepSeek-R1-Distill-Qwen-7B-MLX-4bit
- Conversión Llama 8B: https://huggingface.co/Outlier-Ai/DeepSeek-R1-Distill-Llama-8B-MLX-4bit
- Conversión 14B: https://huggingface.co/Outlier-Ai/DeepSeek-R1-Distill-Qwen-14B-MLX-4bit
- Outlier-Core-27B: https://huggingface.co/Outlier-Ai/Outlier-Core-27B-MLX-4bit
- Outlier-Nano-4B: https://huggingface.co/Outlier-Ai/Outlier-Nano-4B-MLX-4bit
