# nace-ai/Qwen3.5-9B-MLX-Q5-KQuant

## Resumen

Qwen3.5-9B-MLX-Q5-KQuant es una cuantización de 5 bits del modelo multimodal Qwen/Qwen3.5-9B, publicada por el usuario nace-ai mediante su framework propio de cuantización KQuant. El paquete está diseñado específicamente para MLX, el framework de Apple para ejecutar modelos en silicio unificado (M-series), y conserva tanto la torre de visión del modelo base como el tokenizador y la plantilla de chat originales, byte por byte.

El modelo base Qwen3.5-9B es un transformer multimodal de tipo image-text-to-text con 9.409.813.744 parámetros totales, orientado a conversación, razonamiento y uso de herramientas. Esta versión cuantizada reduce los pesos del modelo de lenguaje a 6,21 GB (5,551 bits por peso de media) manteniendo la torre de visión intacta (912.020.960 bytes, 333 tensores fijados por hash), lo que permite ejecutar un modelo multimodal de casi 9.400 millones de parámetros en equipos con memoria unificada moderada.

La relevancia de esta ficha reside en su enfoque de evaluación: el autor no solo mide el error de cuantización sobre los pesos, sino la divergencia KL de las distribuciones de siguiente token frente al modelo bf16 original, tanto en texto genérico (0,0097) como en texto de chat y tool-calls (0,0474). Además, reporta 20 de 20 ensayos de tool-calling correctos con el modo thinking desactivado, lo que aporta evidencia empírica sobre la viabilidad del pack para flujos agénticos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (image-text-to-text) del modelo base Qwen3.5-9B; cuantización MLX KQuant de 5 bits |
| Parametros totales | 9.409.813.744 |
| Parametros activos | no disponible (no se indica que el modelo base sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 5 bits KQuant (5,551 bits por peso de media); existe una variante Q4 del mismo autor |
| Idiomas soportados | en (inglés, según la model card) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors en formato MLX (3 archivos, 7.124.746.696 bytes en total) |

## Arquitectura y entrenamiento

El pack es una cuantización, no un modelo entrenado desde cero. La arquitectura subyacente es la del Qwen3.5-9B original: un transformer multimodal con una torre de visión separada (333 tensores, 912.020.960 bytes) y un cuerpo de lenguaje de aproximadamente 6,21 GB tras la cuantización. KQuant, el framework de Nace, ajusta cada grupo de pesos contra el comportamiento del modelo en texto real en lugar de minimizar únicamente el error cuadrático sobre los pesos, y produce un pack MLX estándar sin requerir software adicional.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si el modelo base empleó RLHF o DPO; esos datos corresponden a la model card de Qwen/Qwen3.5-9B y no se incluyen en la información proporcionada. La validación del pack se realizó en una NVIDIA H200 (151 GB) con mlx 0.32.4, mlx-lm 0.32.2, transformers 5.22.2 y numpy 2.5.4, comparando las distribuciones de siguiente token contra el modelo bf16 sobre 32.704 tokens de texto original y 65.472 tokens de chat y tool-calls.

## Capacidades

- Generación de texto conversacional multi-turno, heredada del modelo base Qwen3.5-9B.
- Procesamiento de imagen y texto combinados (pipeline image-text-to-text), con la torre de visión del modelo base preservada íntegra.
- Soporte de tool calling / function calling: la model card reporta 20 de 20 ensayos con colocación correcta de la llamada y round trip completado, con el modo thinking desactivado.
- Plantilla de chat y tokenizador idénticos a los del modelo base, lo que facilita la compatibilidad con prompts existentes.
- Modo thinking: la model card menciona explícitamente ensayos con "thinking-off", lo que implica que el modelo base dispone de un modo de razonamiento extenso activable.
- Capacidades multilingües: la model card declara únicamente inglés (`en`); no se documentan otros idiomas para este pack.

## Casos de uso

- Asistentes conversacionales locales en Mac: el pack MLX de 6,21 GB de pesos de lenguaje permite ejecutar un modelo de 9.400 millones de parámetros con memoria unificada de 16-24 GB en equipos Apple Silicon, sin depender de la nube.
- Automatización de soporte con imágenes: al conservar la torre de visión, el modelo puede recibir capturas de pantalla, facturas o fotografías junto con texto y responder en el mismo turno, útil para mesas de ayuda que reciben adjuntos.
- Flujos agénticos con tool calling: los 20 de 20 ensayos correctos en modo thinking-off indican que el pack es adecuado para pipelines donde el modelo debe emitir llamadas a funciones de forma fiable y con baja latencia, como consultas a APIs internas o ejecución de comandos.
- Prototipado y evaluación de cuantizaciones: la model card publica la divergencia KL frente al bf16 en dos regímenes (texto original y chat/tool-calls), lo que convierte al pack en una referencia útil para comparar técnicas de cuantización MLX sobre el mismo modelo base.
- Procesamiento de documentos con componente visual: extracción de información de formularios, tickets o diagramas combinando el encoder de visión con el cuerpo de lenguaje cuantizado.
- Desarrollo offline en portátiles: al ser un pack MLX estándar, se puede cargar con `mlx-lm` sin instalar dependencias adicionales, lo que simplifica entornos de desarrollo sin conectividad o con requisitos de privacidad estrictos.
- Evaluación de la fidelidad de cuantización en producción: el autor incluye `results.json` con el runtime, los hashes del tokenizador, las métricas KL y los ensayos de herramientas, lo que permite reproducir la validación antes de desplegar.

## Benchmarks y rendimiento

Los únicos datos publicados en la información disponible son métricas de fidelidad de cuantización frente al modelo bf16, no benchmarks de tareas estándar (MMLU, HumanEval, GSM8K, etc.).

| Metrica | KQuant Q5 (este repo) | Tokens evaluados |
|---|---:|---:|
| KL frente al bf16, texto original (menor es mejor) | 0,0097 | 32.704 |
| KL frente al bf16, texto de chat y tool-calls (menor es mejor) | 0,0474 | 65.472 |
| Ensayos de tool-calling correctos (thinking-off) | 20/20 | 20 |

Comparativa de packs MLX del mismo modelo base, según los datos de la model card (GB decimales, visión excluida):

| Pack | GB de pesos de lenguaje | KL en texto original |
|---|---:|---:|
| KQuant Q5 (este repo) | 6,213 | 0,0097 |
| KQuant Q4 | 5,290 | 0,0301 |
| Brooooooklyn UD-Q4_K_XL | 7,169 | 0,0261 |
| mlx-community OptiQ 4-bit | 7,101 | 0,0292 |
| mlx-works oQ4e-mtp | 5,134 | 0,0427 |
| lmstudio-community 4-bit | 5,038 | 0,0806 |
| mlx-community 4-bit | 5,038 | 0,0814 |

No se han publicado resultados de benchmarks de tareas (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM/memoria unificada estimada: los pesos del modelo de lenguaje ocupan 6,21 GB y el repo completo 7,1 GB; con overhead de runtime MLX y caché KV, se recomienda un mínimo de 12-16 GB de memoria unificada para contexto corto y 24 GB o más para contextos largos y procesamiento de imágenes.
- GPU recomendadas: Apple Silicon con memoria unificada (M1 Pro/Max, M2 Pro/Max/Ultra, M3 Pro/Max/Ultra, M4 Pro/Max). El pack está formateado para MLX, no para CUDA.
- Cabe en GPU de consumidor: sí, en equipos Apple Silicon con 16 GB o más de memoria unificada; no está pensado para GPUs NVIDIA/AMD de consumidor porque el formato es MLX.
- Opciones de despliegue: `mlx-lm` (versión probada 0.32.2) mediante `mlx_lm.generate`; también es compatible con herramientas que consuman packs MLX estándar. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, ya que estos esperan formatos distintos (GGUF, safetensors CUDA, etc.).
- Latencia y throughput: no disponibles en la información proporcionada. La model card solo indica que la validación se ejecutó en una NVIDIA H200 con 151 GB, un entorno que no representa el despliegue típico en Apple Silicon.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Qwen3.5-9B-MLX-Q5-KQuant (este) | 9.409.813.744 | no disponible | MLX safetensors 5 bits | apache-2.0 | KL 0,0097 en texto original; 20/20 tool-calls |
| Qwen3.5-9B-MLX-Q4-KQuant | no disponible (base 9,4 B) | no disponible | MLX safetensors 4 bits | apache-2.0 | 5,29 GB; KL 0,0301 |
| mlx-community OptiQ 4-bit | no disponible (base 9,4 B) | no disponible | MLX 4 bits | no disponible en la información | 7,10 GB; KL 0,0292 |
| mlx-community 4-bit | no disponible (base 9,4 B) | no disponible | MLX 4 bits | no disponible en la información | 5,04 GB; KL 0,0814 |

La comparación se limita a packs MLX del mismo modelo base, ya que no se dispone de datos de benchmarks de tareas para contrastar con modelos de otras familias o tamaños.

## Limitaciones y advertencias

- Es una cuantización de 5 bits: la divergencia KL frente al bf16 es baja pero no nula (0,0097 en texto original y 0,0474 en chat/tool-calls), por lo que puede haber degradación sutil en tareas sensibles a la precisión numérica, como matemáticas de varios pasos o generación de código muy específica.
- El pack está formateado exclusivamente para MLX: no es utilizable directamente en vLLM, llama.cpp, Ollama, TGI ni en GPUs NVIDIA/AMD sin reconversión.
- La model card declara únicamente inglés (`en`); no hay evidencia de calidad en castellano ni en otros idiomas para este pack concreto.
- No se publican datos sobre sesgos, alineación ni filtros de seguridad del modelo base en la información disponible; se heredan las características y riesgos del Qwen3.5-9B original.
- Riesgo de alucinación: no cuantificado en la model card; debe asumirse el comportamiento del modelo base, sin garantías adicionales por parte del cuantizador.
- La licencia es apache-2.0, igual que el modelo base, lo que permite uso comercial, pero conviene verificar los términos del modelo base Qwen/Qwen3.5-9B por si imponen condiciones adicionales no reflejadas aquí.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y fue creado el 2026-11-11; se trata de un pack reciente y con poca validación comunitaria independiente.
- La validación se ejecutó en una NVIDIA H200 con MLX, un entorno atípico; el rendimiento real en Apple Silicon puede diferir en latencia y throughput, que no se publican.
- El modo thinking desactivado es el que se validó para tool-calling; no hay datos sobre la fiabilidad de las llamadas a herramientas con el modo thinking activo.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/nace-ai/Qwen3.5-9B-MLX-Q5-KQuant
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- Variante Q4 del mismo autor: https://huggingface.co/nace-ai/Qwen3.5-9B-MLX-Q4-KQuant
- Pack Brooooooklyn UD-Q4_K_XL: https://huggingface.co/Brooooooklyn/Qwen3.5-9B-UD-Q4_K_XL-mlx
- Pack mlx-community OptiQ 4-bit: https://huggingface.co/mlx-community/Qwen3.5-9B-OptiQ-4bit
- Pack mlx-works oQ4e-mtp: https://huggingface.co/mlx-works/Qwen3.5-9B-oQ4e-mtp
- Pack lmstudio-community 4-bit: https://huggingface.co/lmstudio-community/Qwen3.5-9B-MLX-4bit
- Pack mlx-community 4-bit: https://huggingface.co/mlx-community/Qwen3.5-9B-4bit
- Resultados de validación del pack: https://huggingface.co/nace-ai/Qwen3.5-9B-MLX-Q5-KQuant/blob/main/results.json
