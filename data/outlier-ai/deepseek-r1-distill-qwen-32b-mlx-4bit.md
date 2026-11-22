# Outlier-Ai/DeepSeek-R1-Distill-Qwen-32B-MLX-4bit

## Resumen

DeepSeek-R1-Distill-Qwen-32B-MLX-4bit es una conversión cuantizada a 4 bits en formato MLX del modelo DeepSeek-R1-Distill-Qwen-32B, publicada por Outlier-Ai. El modelo original lo desarrolló DeepSeek a partir de Qwen2.5-32B, destilado con trazas de razonamiento de DeepSeek-R1, y esta versión lo repaqueta para su ejecución local en Apple Silicon mediante el framework MLX. El repositorio no modifica los pesos más allá del cambio de formato en disco: safetensors MLX 4-bit con group size 64 y cuantización simétrica, junto con `chat_template.jinja` y tokenizer.

El interés práctico está en ejecutar un modelo de razonamiento de 32 800 millones de parámetros en un Mac con memoria unificada, sin nube ni claves de API. El repo ocupa 18,4 GB, lo que lo sitúa en el rango de equipos con 24 GB o más de memoria unificada. La licencia MIT del modelo base se mantiene en la conversión.

La relevancia actual es doble: por un lado, permite tener un modelo de cadena de pensamiento (chain-of-thought) funcionando en local con privacidad total; por otro, es un caso representativo de la ola de conversiones MLX que están llevando modelos de gama alta a portátiles y equipos de sobremesa de Apple. No es un modelo propio de Outlier, sino una conversión de un modelo ya existente, y el autor lo indica explícitamente en la model card.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso Qwen2 (base Qwen2.5-32B), destilado de DeepSeek-R1 |
| Parametros totales | 32.763.876.352 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | 4-bit MLX (group size 64, simetrica); el modelo base admite otras cuantizaciones no detalladas |
| Idiomas soportados | en, zh, fr, es, pt, de, ru, ja, ko, ar |
| Licencia | MIT (heredada del modelo base) |
| Formato de pesos | MLX 4-bit safetensors (shards) + config.json + tokenizer + chat_template.jinja |

## Arquitectura y entrenamiento

La arquitectura es un transformer denso de tipo Qwen2 con aproximadamente 32 800 millones de parámetros. El modelo original DeepSeek-R1-Distill-Qwen-32B se obtuvo por destilación: se tomó Qwen2.5-32B como estudiante y se entrenó sobre trazas de razonamiento generadas por DeepSeek-R1, de modo que el modelo aprende a producir cadenas de pensamiento antes de dar la respuesta final. Esta conversión no reentrena ni modifica los pesos; solo cambia el formato de almacenamiento a MLX 4-bit con group size 64 y cuantización simétrica, manteniendo el tokenizer y la plantilla de chat del modelo original.

La model card no detalla el número de tokens de entrenamiento, la composición del dataset ni si hubo fases de RLHF o DPO en el modelo base. Tampoco se documentan innovaciones técnicas adicionales más allá de la propia destilación con razonamiento. El único cambio técnico introducido por esta conversión es el formato MLX, compatible con `mlx-lm` 0.31.x y ejecutable en GPUs integradas de Apple Silicon vía Metal.

## Capacidades

- Generación de texto con razonamiento explícito: produce cadenas de pensamiento antes de la respuesta final, útil para problemas de lógica, matemáticas y planificación.
- Razonamiento matemático y resolución de problemas verbales, como los ejemplos de la model card (problema de las máquinas y los widgets, problema de trenes, cuadrícula lógica).
- Generación de código y soporte de function calling / tool calling, según los tags del repositorio.
- Conversación multi-turno y modo chat mediante `chat_template.jinja`.
- Capacidades multilingües en diez idiomas: inglés, chino, francés, español, portugués, alemán, ruso, japonés, coreano y árabe.
- Ejecución local y offline en Apple Silicon, sin dependencia de servicios en la nube.
- Integración con `mlx-lm` mediante CLI y API de Python.

## Casos de uso

- Asistente de razonamiento privado en portátil: un desarrollador puede ejecutar el modelo en un MacBook Pro con 32 GB o más de memoria unificada para resolver problemas de lógica y matemáticas sin enviar datos a la nube, gracias a la cuantización 4-bit que reduce el repo a 18,4 GB.
- Generación de código en local: el soporte de function calling y los tags de código permiten usarlo como asistente de programación offline en entornos con requisitos de confidencialidad, integrándolo en editores o scripts mediante `mlx-lm`.
- Análisis de documentos técnicos con razonamiento paso a paso: el modelo puede descomponer problemas complejos en pasos intermedios, adecuado para revisión de especificaciones o depuración de lógica en equipos de ingeniería.
- Prototipado de agentes multi-paso: al soportar tool calling y cadena de pensamiento, sirve para construir agentes locales que planifican y ejecutan acciones sin salir del equipo.
- Educación y tutoría: el modo de razonamiento explícito hace visible el proceso de resolución, útil en herramientas de aprendizaje de matemáticas y lógica.
- Evaluación de modelos de razonamiento en investigación: al ser una conversión fiel del modelo base, permite reproducir experimentos de destilación y razonamiento en hardware Apple sin GPU dedicada.
- Atención al cliente o asistentes conversacionales en local para pymes con requisitos de privacidad, usando el modo chat y el multilingüismo en los diez idiomas soportados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card remite a `outlier.host/benchmarks` para cifras de MMLU, HumanEval y tok/s en Macs de la serie M, pero esos datos no se incluyen en la información proporcionada y no se reproducen aquí.

## Requisitos de hardware

- VRAM/memoria unificada estimada: el repo pesa 18,4 GB en 4-bit; se recomienda al menos 24 GB de memoria unificada para dejar margen al contexto y al runtime, y 32 GB o más para contextos largos.
- GPU recomendadas: Apple Silicon de la serie M1, M2, M3 y M4 (incluidos MacBook Air, MacBook Pro, Mac mini y Mac Studio), según los tags del repositorio.
- ¿Cabe en GPU de consumo? Sí, en equipos Apple Silicon con memoria unificada suficiente; no está pensado para GPUs NVIDIA/AMD convencionales en este formato.
- Opciones de despliegue: `mlx-lm` 0.31.x (CLI y Python), y la app Outlier para macOS arm64 que carga modelos MLX; también puede cargarse desde cualquier herramienta compatible con MLX.
- Latencia y throughput: no disponibles en la información proporcionada; la model card remite a la página de benchmarks del autor.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| DeepSeek-R1-Distill-Qwen-32B-MLX-4bit (este) | 32,8 B | no disponible | MLX 4-bit safetensors | MIT | Conversion para Apple Silicon |
| DeepSeek-R1-Distill-Qwen-14B (MLX 4-bit, Outlier-Ai) | 14 B aprox. | no disponible | MLX 4-bit | MIT | Menor huella de memoria, mismo pipeline de conversion |
| DeepSeek-R1-Distill-Llama-8B (MLX 4-bit, Outlier-Ai) | 8 B aprox. | no disponible | MLX 4-bit | MIT | Opción ligera para equipos con menos memoria |
| DeepSeek-R1-Distill-Qwen-7B (MLX 4-bit, Outlier-Ai) | 7 B aprox. | no disponible | MLX 4-bit | MIT | La variante más pequeña de la familia destilada |

## Limitaciones y advertencias

- Es una conversión de un modelo ajeno: el autor no ha entrenado ni evaluado el modelo, y las cifras de rendimiento de la model card remiten a experimentos internos no publicados en el repositorio.
- La cuantización 4-bit puede degradar la calidad del razonamiento respecto al modelo original en precisión completa, especialmente en tareas matemáticas de varios pasos.
- Riesgo de alucinación inherente a los modelos de lenguaje, agravado en dominios especializados y en idiomas con menos datos de entrenamiento.
- La longitud de contexto no se especifica en la información disponible; conviene verificarla en el `config.json` del repositorio antes de usarla en producción.
- La licencia MIT se hereda del modelo base, pero conviene revisar la model card original de DeepSeek para confirmar cualquier restricción de uso.
- El formato MLX 4-bit está orientado a Apple Silicon; no es directamente portable a CUDA sin reconversión.
- La model card incluye promociones comerciales de la app Outlier y de una suscripción Pro; son contenido del autor, no características técnicas del modelo.
- El repositorio tiene un volumen de descargas bajo (582) y cero likes en el momento de la consulta, lo que reduce la validación comunitaria disponible.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Outlier-Ai/DeepSeek-R1-Distill-Qwen-32B-MLX-4bit
- Modelo base: https://huggingface.co/deepseek-ai/DeepSeek-R1-Distill-Qwen-32B
- Benchmarks del autor: https://outlier.host/benchmarks
- App Outlier: https://outlier.host/
- Conversión DeepSeek-R1-Distill-Qwen-7B (MLX 4-bit): https://huggingface.co/Outlier-Ai/DeepSeek-R1-Distill-Qwen-7B-MLX-4bit
- Conversión DeepSeek-R1-Distill-Llama-8B (MLX 4-bit): https://huggingface.co/Outlier-Ai/DeepSeek-R1-Distill-Llama-8B-MLX-4bit
- Conversión DeepSeek-R1-Distill-Qwen-14B (MLX 4-bit): https://huggingface.co/Outlier-Ai/DeepSeek-R1-Distill-Qwen-14B-MLX-4bit
- Outlier-Core-27B (MLX 4-bit): https://huggingface.co/Outlier-Ai/Outlier-Core-27B-MLX-4bit
- Outlier-Nano-4B (MLX 4-bit): https://huggingface.co/Outlier-Ai/Outlier-Nano-4B-MLX-4bit
