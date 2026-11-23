# Outlier-Ai/Qwen2.5-Coder-7B-Instruct-MLX-4bit

## Resumen

Qwen2.5-Coder-7B-Instruct-MLX-4bit es una conversión cuantizada a 4 bits en formato MLX del modelo Qwen/Qwen2.5-Coder-7B-Instruct, publicada por Outlier-Ai para su ejecución local en Apple Silicon (M1, M2, M3, M4). El modelo original lo desarrolla el equipo Qwen de Alibaba y está especializado en generación, completado y razonamiento sobre código, además de mantener capacidades conversacionales y de tool calling. Esta conversión no modifica los pesos más allá de la cuantización: solo cambia el formato en disco (safetensors MLX 4-bit, plantilla de chat y tokenizer).

El interés de esta ficha está en que permite ejecutar un modelo de código de 7.615.616.512 parámetros en un Mac con GPU integrada, sin conexión a la nube y sin claves de API, con un peso en disco de aproximadamente 4,3 GB. Está pensada para desarrolladores que quieren un asistente de código privado y offline en su estación de trabajo, o para integrarlo en flujos de CI/CD locales y herramientas de edición.

La conversión es de tipo instruct y conserva la licencia Apache 2.0 del modelo base. La cuantización usa grupo de tamaño 64 y simetría, y es compatible con `mlx-lm` 0.31.x. El autor advierte que las cifras de rendimiento publicadas en su model card provienen de experimentos internos y no de sus pruebas de release, por lo que deben tomarse con cautela.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2), cuantizado a 4 bits en formato MLX |
| Parámetros totales | 7.615.616.512 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la información proporcionada |
| Tipos de cuantización | 4-bit MLX safetensors, grupo de tamaño 64, simétrico |
| Idiomas soportados | en, zh, fr, es, pt, de, it, ru, ja, ko, ar, vi, th, nl, pl |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (MLX 4-bit), con config.json, tokenizer y chat_template.jinja |

## Arquitectura y entrenamiento

El modelo base es un transformer decoder-only de la familia Qwen2, en su variante Coder de 7B, ajustada para instrucciones. Esta conversión concreta no aporta información sobre el número de tokens de entrenamiento, la composición del dataset ni las etapas de RLHF o DPO del modelo original; esos datos corresponden a la model card de Qwen/Qwen2.5-Coder-7B-Instruct y no se detallan aquí. La modificación introducida por Outlier-Ai se limita al formato: cuantización de pesos a 4 bits con grupo de 64 y simetría, empaquetado en shards safetensors, plantilla de chat Jinja y tokenizer compatibles con `mlx-lm`.

No se documentan innovaciones arquitectónicas propias de esta conversión (no hay decodificación especulativa, atención lineal ni mecanismos híbridos SSM descritos). El valor técnico está en la reducción de huella: el repo ocupa 4,3 GB y está pensado para ejecutarse sobre Metal en Apple Silicon mediante la librería MLX.

## Capacidades

- Generación de texto y código en múltiples lenguajes de programación, con modo instruct y conversacional.
- Completado de código (code completion) y generación de fragmentos a partir de instrucciones en lenguaje natural.
- Razonamiento sobre código: refactorización, detección de errores y explicación de fragmentos.
- Tool calling y function calling, según los tags del repo.
- Uso en agentes y flujos de varios pasos, según los tags del repo.
- Capacidades multilingües en 15 idiomas: inglés, chino, francés, español, portugués, alemán, italiano, ruso, japonés, coreano, árabe, vietnamita, tailandés, neerlandés y polaco.
- Ejecución local y offline en macOS sobre Apple Silicon, sin nube ni claves de API.
- No se documentan capacidades de visión, audio ni modo thinking explícito en la información disponible.

## Casos de uso

- Asistente de código privado en el portátil: un desarrollador puede cargar el modelo con `mlx-lm` y mantener conversaciones multi-turno sobre su propio código sin enviar nada a la nube; el peso de 4,3 GB y la cuantización 4-bit lo hacen viable en un MacBook con memoria unificada moderada.
- Autocompletado y generación de funciones en el editor: el modelo puede recibir una instrucción y devolver una función con docstring y casos límite, como muestran los ejemplos de la model card (comprobación de primos en Python).
- Generación de consultas SQL: a partir de una descripción en lenguaje natural, el modelo produce consultas con joins y agregaciones, útil para herramientas internas de análisis de datos.
- Refactorización y depuración asistida: el modelo puede reescribir un fragmento para mejorar legibilidad y señalar un bug, integrándose en revisiones locales previas al commit.
- Integración en pipelines de CI/CD locales: mediante tool calling y ejecución offline, se puede usar para generar parches, resúmenes de cambios o pruebas unitarias sin depender de servicios externos.
- Soporte multilingüe en equipos distribuidos: al cubrir español, francés, alemán, portugués, japonés, chino y otros, sirve para explicar código o generar documentación en el idioma del equipo.
- Prototipado de agentes de código en el escritorio: con function calling puede encadenar pasos como leer un archivo, proponer un cambio y validar el resultado, todo en local.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card menciona que las cifras de MMLU, HumanEval y tok/s en Macs de la serie M están en outlier.host/benchmarks, pero no se incluyen valores numéricos en el material proporcionado, por lo que no se reproducen aquí.

## Requisitos de hardware

- VRAM estimada: no disponible de forma oficial; el repo pesa 4,3 GB en disco, por lo que se necesita al menos esa cantidad de memoria unificada más el overhead de ejecución.
- GPU recomendadas: Apple Silicon de la serie M (M1, M2, M3, M4) con Metal; el modelo está etiquetado para MacBook Air, MacBook Pro, Mac mini y Mac Studio.
- Cabe en GPU de consumo: sí, en equipos Apple Silicon; no está pensado para GPUs NVIDIA ni para CUDA.
- Opciones de despliegue: `mlx-lm` 0.31.x (CLI y API de Python), la app Outlier para macOS y cualquier cargador compatible con MLX que acepte este formato.
- Latencia y throughput: no disponibles en la información proporcionada; la model card remite a outlier.host/benchmarks para tok/s en Macs de la serie M.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Outlier-Ai/Qwen2.5-Coder-7B-Instruct-MLX-4bit | 7.615.616.512 | no disponible | MLX 4-bit safetensors | Apache 2.0 | Hugging Face, ~550 descargas |
| Outlier-Ai/Qwen2.5-Coder-14B-Instruct-MLX-4bit | no disponible | no disponible | MLX 4-bit safetensors | hereda del base | Hugging Face, ~816 descargas |
| Outlier-Ai/Qwen2.5-Coder-32B-Instruct-MLX-4bit | no disponible | no disponible | MLX 4-bit safetensors | hereda del base | Hugging Face, ~650 descargas |
| Qwen/Qwen2.5-Coder-7B-Instruct (base) | 7.615.616.512 | no disponible | safetensors originales | Apache 2.0 | Hugging Face |

Las tres conversiones de Outlier-Ai comparten familia y formato; la de 7B es la más ligera y la de 32B la de mayor capacidad, aunque no se aportan cifras de rendimiento comparadas en la información disponible. El modelo base sin cuantizar ofrece mayor fidelidad numérica pero requiere más memoria y no está optimizado para MLX.

## Limitaciones y advertencias

- La cuantización a 4 bits puede degradar la calidad respecto al modelo original en tareas de razonamiento complejo o generación de código muy específico; no se han publicado métricas de esa pérdida en la información disponible.
- Riesgo de alucinación inherente a los modelos de lenguaje, especialmente en APIs, librerías o sintaxis poco comunes; conviene validar el código generado antes de ejecutarlo.
- La longitud de contexto no se especifica en la información proporcionada, por lo que no se puede garantizar el comportamiento en conversaciones o ficheros muy largos.
- El modelo está orientado a Apple Silicon y MLX; no es directamente utilizable en CUDA, vLLM, llama.cpp ni Ollama sin conversión adicional.
- La licencia Apache 2.0 permite uso comercial, pero se recomienda consultar la model card del modelo base para condiciones canónicas y restricciones adicionales.
- El autor advierte que las cifras de benchmarks de su model card son de experimentos internos y no de pruebas de release; no deben tomarse como garantía de rendimiento en producción.
- El repo tiene pocas descargas (~550) y cero likes, lo que indica una validación comunitaria limitada.

## Enlaces

- Hugging Face: https://huggingface.co/Outlier-Ai/Qwen2.5-Coder-7B-Instruct-MLX-4bit
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-Coder-7B-Instruct
- Benchmarks del autor: https://outlier.host/benchmarks
- App Outlier: https://outlier.host/
- Conversión 14B: https://huggingface.co/Outlier-Ai/Qwen2.5-Coder-14B-Instruct-MLX-4bit
- Conversión 32B: https://huggingface.co/Outlier-Ai/Qwen2.5-Coder-32B-Instruct-MLX-4bit
- DeepSeek-R1-Distill-Qwen-7B MLX 4-bit: https://huggingface.co/Outlier-Ai/DeepSeek-R1-Distill-Qwen-7B-MLX-4bit
- Outlier-Core-27B: https://huggingface.co/Outlier-Ai/Outlier-Core-27B-MLX-4bit
- Outlier-Nano-4B: https://huggingface.co/Outlier-Ai/Outlier-Nano-4B-MLX-4bit
