# Outlier-Ai/Qwen2.5-Coder-14B-Instruct-MLX-4bit

## Resumen

Qwen2.5-Coder-14B-Instruct-MLX-4bit es una conversión cuantizada a 4 bits en formato MLX del modelo Qwen2.5-Coder-14B-Instruct, desarrollado originalmente por el equipo Qwen de Alibaba y repackaged por Outlier-Ai para su ejecución nativa en Apple Silicon. El modelo base es un transformer decoder-only de 14.770.033.664 parámetros (aproximadamente 14,8 mil millones de parámetros), especializado en generación y completado de código, con capacidades de razonamiento, tool calling y conversación multi-turno. Esta conversión no introduce fine-tuning ni modificación de los pesos: solo cambia el formato en disco a safetensors MLX 4-bit con grupo de tamaño 64 y cuantización simétrica.

La relevancia de esta ficha reside en que permite ejecutar un modelo de código de casi 15B en hardware de consumo Apple (M1, M2, M3, M4) sin conexión a la nube, con una huella en disco de 8,3 GB y licencia Apache 2.0. Frente a la versión original en bfloat16, la cuantización 4-bit reduce el peso aproximadamente a una cuarta parte, lo que hace viable su despliegue en MacBook Air, MacBook Pro, Mac mini y Mac Studio con memoria unificada moderada.

El modelo está pensado para desarrolladores que necesitan un asistente de código local, privado y sin latencia de red, integrable mediante `mlx-lm` 0.31.x o mediante la aplicación Outlier para macOS. Soporta 15 idiomas declarados, incluyendo español, y mantiene el template de chat y el tokenizer del modelo original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2), conversión MLX 4-bit |
| Parametros totales | 14.770.033.664 (~14,8B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la información proporcionada |
| Tipos de cuantizacion | MLX 4-bit, group size 64, simétrica |
| Idiomas soportados | en, zh, fr, es, pt, de, it, ru, ja, ko, ar, vi, th, nl, pl |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (MLX 4-bit), shards, config.json, tokenizer, chat_template.jinja |

## Arquitectura y entrenamiento

El modelo base Qwen2.5-Coder-14B-Instruct es un transformer decoder-only de la familia Qwen2, con 14.770.033.664 parámetros. Esta conversión concreta no aporta información sobre el proceso de entrenamiento del modelo original: no se detallan en la información proporcionada el número de tokens de entrenamiento, la composición del dataset, ni si hubo fases de RLHF, DPO o instrucción supervisada. La model card de la conversión indica explícitamente que se trata de un "faithful port of the upstream weights — no fine-tuning, no merge", es decir, una conversión de formato sin modificación de pesos.

La innovación técnica de esta ficha es la cuantización MLX 4-bit con grupo de tamaño 64 y esquema simétrico, compatible con `mlx-lm` 0.31.x. Esta cuantización permite cargar el modelo en memoria unificada de Apple Silicon y ejecutarlo sobre Metal. No se documentan en la información disponible técnicas adicionales como decodificación especulativa, atención lineal o modos de pensamiento explícitos.

## Capacidades

- Generación de código en múltiples lenguajes de programación, incluyendo Python, SQL y otros lenguajes habituales, según los ejemplos de la model card.
- Completado de código (code completion) y generación de código a partir de instrucciones en lenguaje natural.
- Refactorización y depuración de código: la model card incluye un ejemplo de "Debug refactor" para mejorar legibilidad y detectar bugs.
- Tool calling y function calling, según los tags del repositorio (`function-calling`, `tool-use`).
- Conversación multi-turno con template de chat propio (`chat_template.jinja`).
- Capacidades multilingües en 15 idiomas declarados, incluyendo español, inglés, chino, francés, portugués, alemán, italiano, ruso, japonés, coreano, árabe, vietnamita, tailandés, neerlandés y polaco.
- Ejecución local y offline en Apple Silicon, sin API keys ni round-trips a la nube.
- Integración con la aplicación Outlier para macOS y con `mlx-lm` mediante CLI y API de Python.

## Casos de uso

- Asistente de código local en MacBook: un desarrollador puede cargar el modelo con `mlx-lm` y usarlo para autocompletar funciones, generar tests y refactorizar fragmentos sin enviar código propietario a servicios externos. La cuantización 4-bit y el formato MLX lo hacen viable en equipos con memoria unificada moderada.
- Generación de consultas SQL: la model card incluye un ejemplo explícito de generación de una query SQL para obtener los 10 usuarios con mayor valor de compra en los últimos 90 días, lo que lo hace adecuado para asistentes de analítica de datos embebidos en herramientas internas.
- Depuración y refactorización en pipelines de revisión: el modelo puede integrarse en un flujo local que reciba un diff o un fichero y devuelva una versión refactorizada con detección de bugs, manteniendo el código dentro del perímetro de la máquina.
- Tool calling en agentes locales: gracias al soporte de function calling, puede utilizarse como planificador o ejecutor en agentes que invoquen herramientas locales (shell, APIs internas, bases de datos) sin depender de la nube.
- Educación y prototipado en investigación: investigadores que necesiten evaluar modelos de código en Apple Silicon pueden reproducir experimentos con `mlx-lm` y comparar contra la versión original en bfloat16, sin necesidad de GPUs dedicadas.
- Desarrollo en entornos con restricciones de privacidad: equipos con requisitos de "no-cloud" pueden desplegar el modelo en Mac mini o Mac Studio como servicio interno de generación de código, manteniendo los datos en la red local.
- Generación de documentación técnica y docstrings: la model card incluye un ejemplo de función Python con docstring y test de caso límite, lo que lo hace útil para tareas de documentación automática en repositorios.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card remite a `outlier.host/benchmarks` para cifras de MMLU, HumanEval y tok/s en Macs de la serie M con procedencia completa, pero esos datos no están incluidos en la información proporcionada, por lo que no se reproducen aquí.

## Requisitos de hardware

- VRAM/memoria unificada estimada: el repositorio ocupa 8,3 GB en disco en formato MLX 4-bit; la carga en memoria requiere espacio adicional para el grafo de cómputo y el contexto, por lo que se recomienda al menos 16 GB de memoria unificada para uso cómodo.
- GPU recomendadas: no aplica GPU discreta; el modelo está diseñado para Apple Silicon (M1, M2, M3, M4) y se ejecuta sobre Metal mediante MLX.
- ¿Cabe en consumer GPU? No está pensado para GPUs NVIDIA o AMD; el formato MLX es específico de Apple Silicon. Para GPUs de consumo habría que usar otras conversiones (GGUF, AWQ, etc.) del modelo base.
- Opciones de despliegue: `mlx-lm` 0.31.x (CLI `python -m mlx_lm.generate` y API Python `mlx_lm.load`/`generate`), y la aplicación Outlier para macOS (instalable vía `brew install --cask outlier-host/tap/outlier`).
- Latencia y throughput: no disponibles en la información proporcionada; la model card remite a `outlier.host/benchmarks` para tok/s en Macs de la serie M.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Outlier-Ai/Qwen2.5-Coder-14B-Instruct-MLX-4bit | ~14,8B | no disponible | MLX 4-bit safetensors | Apache 2.0 | Hugging Face, 94 descargas |
| Qwen/Qwen2.5-Coder-14B-Instruct (original) | ~14,8B | no disponible | safetensors bfloat16 | Apache 2.0 | Hugging Face |
| Outlier-Ai/Qwen2.5-Coder-7B-Instruct-MLX-4bit | ~7B | no disponible | MLX 4-bit safetensors | Apache 2.0 | Hugging Face, 1.450 descargas |
| Outlier-Ai/Qwen2.5-Coder-32B-Instruct-MLX-4bit | ~32B | no disponible | MLX 4-bit safetensors | Apache 2.0 | Hugging Face, 650 descargas |

La comparación con el modelo original es directa: mismos pesos, distinto formato. Frente a las variantes de 7B y 32B del mismo autor, esta versión de 14B ocupa un punto intermedio en requisitos de memoria y capacidad. No se dispone de datos de benchmarks comparativos en la información proporcionada para establecer diferencias de rendimiento entre estas variantes.

## Limitaciones y advertencias

- La cuantización 4-bit introduce una pérdida de precisión respecto al modelo original en bfloat16; no se documentan en la información disponible métricas de degradación para esta conversión concreta.
- El modelo hereda los sesgos y riesgos de alucinación del modelo base Qwen2.5-Coder-14B-Instruct; no se detallan sesgos específicos en la información proporcionada.
- La longitud de contexto no está disponible en la información proporcionada, por lo que no se puede garantizar el comportamiento en ventanas largas sin consultar la model card del modelo base.
- El formato MLX es específico de Apple Silicon; no es portable a GPUs NVIDIA, AMD ni a entornos Linux/Windows sin conversión adicional.
- La licencia Apache 2.0 permite uso comercial, pero se recomienda consultar la model card del modelo base para restricciones adicionales o textos canónicos de licencia.
- El repositorio tiene solo 94 descargas y 0 likes en el momento de la información, lo que indica una validación comunitaria limitada; conviene evaluar el modelo en el caso de uso concreto antes de producción.
- La model card incluye promoción de la aplicación Outlier (versión 1.11.999, con planes gratuitos y Pro de 49 USD); esta información es comercial y no debe interpretarse como una evaluación independiente del modelo.
- No se documentan en la información disponible latencias, throughput ni resultados de benchmarks propios de esta conversión.

## Enlaces

- Hugging Face: https://huggingface.co/Outlier-Ai/Qwen2.5-Coder-14B-Instruct-MLX-4bit
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-Coder-14B-Instruct
- Benchmarks del autor: https://outlier.host/benchmarks
- Aplicación Outlier: https://outlier.host/
- Conversión 7B: https://huggingface.co/Outlier-Ai/Qwen2.5-Coder-7B-Instruct-MLX-4bit
- Conversión 32B: https://huggingface.co/Outlier-Ai/Qwen2.5-Coder-32B-Instruct-MLX-4bit
- Conversión DeepSeek-R1-Distill-Qwen-7B: https://huggingface.co/Outlier-Ai/DeepSeek-R1-Distill-Qwen-7B-MLX-4bit
- Outlier-Core-27B: https://huggingface.co/Outlier-Ai/Outlier-Core-27B-MLX-4bit
- Outlier-Nano-4B: https://huggingface.co/Outlier-Ai/Outlier-Nano-4B-MLX-4bit
- Variante Outlier-Coder-Qwen25-14B: https://huggingface.co/Outlier-Ai/Outlier-Coder-Qwen25-14B-MLX-4bit
