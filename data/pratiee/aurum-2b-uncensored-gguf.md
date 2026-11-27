# pratiee/Aurum-2B-Uncensored-GGUF

## Resumen

Aurum 2B v1 Uncensored es una variante del modelo Qwen3.5-2B de Alibaba, publicada por el usuario pratiee en Hugging Face, a la que se le ha eliminado el comportamiento de rechazo mediante una técnica de edición de direcciones en el espacio latente (abliteration). El modelo base es un transformer multimodal de aproximadamente 1.942 millones de parámetros, con torre de visión y una ventana de contexto declarada de 262.144 tokens, y esta versión conserva tanto la plantilla de chat como la capacidad de procesamiento de imágenes del original.

La relevancia de esta ficha radica en que se trata de una publicación de escasísima tracción (0 descargas y 0 likes en el momento de la consulta) y con datos de benchmarks que el propio autor presenta en su model card pero que no están disponibles como tablas estructuradas en la información proporcionada. El autor declara 0 rechazos sobre 1.113 prompts de prueba, una divergencia KL de 0,019 frente al modelo oficial y una mejora en tool calling (BFCL v3: 69,3 frente a 63,3), si bien estas cifras proceden exclusivamente de la model card y no han sido verificadas de forma independiente.

Se distribuye en formato GGUF para llama.cpp bajo licencia Apache-2.0, lo que en principio permite uso comercial, aunque la naturaleza "uncensored" del modelo plantea consideraciones de responsabilidad importantes para cualquier despliegue en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (image-text-to-text) con torre de visión; basado en Qwen3.5-2B |
| Parametros totales | 1.942.653.248 (≈1,94 mil millones) |
| Parametros activos | No disponible (no es MoE según la información disponible) |
| Longitud de contexto | 262.144 tokens (declarado en la model card) |
| Tipos de cuantizacion | GGUF (el autor menciona Q4_K_M en sus pruebas; el resto de variantes no está detallado) |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (repo de 15,8 GB); el autor enlaza una versión BF16 en safetensors en otro repositorio |

## Arquitectura y entrenamiento

El modelo es un derivado directo de Qwen3.5-2B, por lo que hereda su arquitectura transformer con torre de visión y su ventana de contexto de 262.144 tokens. La modificación consiste en una técnica de abliteration: se calcula la dirección media del estado oculto en el último token del prompt para un conjunto de 323 prompts dañinos (mlabonne/harmful_behaviors, split de entrenamiento) frente a 323 prompts inocuos (mlabonne/harmless_alpaca, split de entrenamiento), y se elimina esa dirección del espacio de activaciones del modelo. Según el autor, esto preserva la torre de visión, la plantilla de chat y el resto de capacidades del modelo original.

No se dispone de información sobre el volumen de tokens de entrenamiento adicional, la composición del dataset de ajuste fino ni si hubo fases de RLHF o DPO posteriores; la model card describe el proceso como una edición de direcciones sobre el modelo base más que como un reentrenamiento. El autor declara una divergencia KL de 0,019 frente a Qwen3.5-2B oficial, aproximadamente la mitad que otras variantes uncensored de 2B (0,040-0,050), lo que sugiere una alteración relativamente contenida de la distribución original.

## Capacidades

- Generación de texto conversacional multi-turno en inglés.
- Razonamiento y conocimiento general (el autor reporta GSM8K, MMLU y MMLU-Redux al nivel o por encima del modelo oficial).
- Tool calling / function calling, con una puntuación declarada de 69,3 en BFCL v3 frente a 63,3 del Qwen3.5-2B oficial.
- Procesamiento de imágenes (image-text-to-text): la torre de visión se mantiene y el autor reporta calidad de imagen dentro de 2 puntos del original.
- Respuesta a prompts dañinos sin rechazo (0 rechazos declarados sobre 613 prompts dañinos y 500 inocuos).
- Capacidad multilingüe limitada al inglés según la etiqueta de idioma del repositorio.
- No se menciona soporte de audio ni modo "thinking" explícito en la información disponible.

## Casos de uso

- Investigación sobre alineación y seguridad: el modelo permite estudiar el comportamiento de un modelo sin mecanismos de rechazo y comparar su distribución (KL 0,019) con la del original, útil para analizar qué se pierde y qué se conserva al aplicar abliteration.
- Evaluación de técnicas de edición de direcciones: sirve como caso de estudio reproducible para validar metodologías de abliteration sobre modelos multimodales pequeños.
- Pruebas de robustez de filtros de contenido: al no rechazar prompts dañinos, puede emplearse en entornos controlados para estresar clasificadores de seguridad y sistemas de moderación.
- Prototipado de asistentes conversacionales en inglés sobre hardware modesto: con ~1,94 mil millones de parámetros y cuantización Q4_K_M, cabe en GPUs de 8 GB y permite iterar rápidamente en local.
- Tool calling en pipelines de automatización: la mejora declarada en BFCL v3 (69,3) lo hace adecuado para experimentar con agentes que invocan funciones en flujos de trabajo internos.
- Análisis de imágenes en tareas de descripción o extracción de información: la torre de visión conservada permite procesar capturas, gráficos o documentos escaneados en inglés.
- Benchmarking de velocidad en hardware de consumo: el autor reporta 111 tokens/s en una AMD RX 6600 de 8 GB vía Vulkan, lo que lo convierte en un candidato para pruebas de throughput en equipos de gama media.

## Benchmarks y rendimiento

El autor presenta resultados en su model card, pero no se han proporcionado como tabla estructurada en la información disponible. Los datos declarados textualmente son:

| Metrica | Aurum 2B | Qwen3.5-2B oficial |
|---|---|---|
| Rechazos en 613 prompts dañinos | 0 | 452 |
| Rechazos en 500 prompts inocuos | 0 | 110 |
| Divergencia KL vs. Qwen3.5-2B | 0,019 | — (referencia) |
| BFCL v3 (media) | 69,3 | 63,3 |
| GSM8K | "al nivel o por encima" del oficial | — |
| MMLU | "al nivel o por encima" del oficial | — |
| MMLU-Redux | "al nivel o por encima" del oficial | — |
| GPQA Diamond | inferior al oficial (según limitaciones) | — |
| Velocidad (RX 6600, 8 GB, Vulkan) | 111 tokens/s | — |

Las cifras de GSM8K, MMLU y MMLU-Redux no se detallan numéricamente en la información disponible. El propio autor advierte que las cifras oficiales de Qwen usan BF16, thinking largo y otros harnesses, por lo que no son directamente comparables. No se han publicado resultados verificados de forma independiente.

## Requisitos de hardware

- VRAM estimada: con cuantización Q4_K_M, un modelo de ~1,94 mil millones de parámetros ocupa aproximadamente 1,2-1,5 GB de pesos, más overhead de contexto y de la torre de visión; el autor lo ejecuta en una GPU de 8 GB con todas las capas en GPU.
- GPU recomendadas: el autor cita una AMD RX 6600 (8 GB) vía Vulkan; por tamaño, cabe holgadamente en RTX 3060 12 GB, RTX 4060 Ti, RTX 4090 y en GPUs de datacenter como A100 o H100, aunque estas últimas están sobredimensionadas para este modelo.
- Cabe en GPU de consumo: sí, en cualquier GPU con 4 GB o más de VRAM en Q4_K_M; en CPU también es viable por su tamaño reducido.
- Opciones de despliegue: llama.cpp (formato nativo GGUF), y por extensión Ollama y otros runners compatibles con GGUF; no se menciona soporte específico de vLLM o TGI en la información disponible.
- Latencia y throughput: 111 tokens/s en AMD RX 6600 (8 GB) vía Vulkan, todas las capas en GPU, sin decodificación especulativa, según el autor.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rechazos (613 dañinos) | KL vs. Qwen3.5-2B | BFCL v3 | Licencia |
|---|---|---|---|---|---|---|
| Aurum 2B v1 Uncensored | ~1,94 B | 262.144 | 0 | 0,019 | 69,3 | Apache-2.0 |
| Qwen3.5-2B oficial | ~1,94 B | 262.144 | 452 | — (referencia) | 63,3 | Apache-2.0 |
| HauhauCS Qwen3.5-2B Uncensored Aggressive | ~1,94 B | No disponible | No disponible | 0,040-0,050 (rango del autor) | No disponible | No disponible |
| Huihui Qwen3.5-2B abliterated | ~1,94 B | No disponible | No disponible | 0,040-0,050 (rango del autor) | No disponible | No disponible |
| Qwen3.5-2B heretic | ~1,94 B | No disponible | No disponible | 0,040-0,050 (rango del autor) | No disponible | No disponible |

Los datos de los modelos comparables proceden únicamente de la model card del autor; no se dispone de cifras independientes para HauhauCS, Huihui ni Heretic en la información proporcionada.

## Limitaciones y advertencias

- Modelo sin mecanismos de rechazo: responde a solicitudes dañinas, lo que lo hace inadecuado para despliegues orientados al público sin capas de moderación adicionales.
- Responsabilidad legal y ética: el autor declara explícitamente que el usuario es responsable del uso y de las salidas del modelo; la licencia Apache-2.0 permite uso comercial, pero eso no exime de cumplir la normativa aplicable.
- GPQA Diamond inferior al modelo oficial, según las propias limitaciones reconocidas por el autor.
- Idiomas: solo inglés etiquetado; el rendimiento en castellano u otros idiomas no está documentado y probablemente sea deficiente.
- Riesgo de alucinación: inherente a un modelo de ~2B parámetros; no se han publicado evaluaciones específicas de factualidad.
- Sesgos: no se documentan evaluaciones de sesgo en la información disponible; al derivar de Qwen3.5-2B, hereda los sesgos del modelo base.
- Tracción nula: 0 descargas y 0 likes en el momento de la consulta, sin validación independiente de los benchmarks declarados.
- Fecha de creación futura (2026-11-26) en los metadatos del repositorio, lo que sugiere posibles inconsistencias en la publicación.
- El repositorio ocupa 15,8 GB, probablemente por incluir múltiples cuantizaciones GGUF; conviene verificar qué archivos concretos se descargan.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/pratiee/Aurum-2B-Uncensored-GGUF
- Versión BF16 en safetensors (enlazada por el autor): https://huggingface.co/2Beyes/Aurum-2B-Uncensored
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-2B
- GGUF del modelo base (unsloth): https://huggingface.co/unsloth/Qwen3.5-2B-GGUF
- Modelo comparable HauhauCS: https://huggingface.co/HauhauCS/Qwen3.5-2B-Uncensored-HauhauCS-Aggressive
- Modelo comparable Huihui: https://huggingface.co/huihui-ai/Huihui-Qwen3.5-2B-abliterated
- GGUF de Huihui (mradermacher): https://huggingface.co/mradermacher/Huihui-Qwen3.5-2B-abliterated-GGUF
- Modelo comparable Heretic: https://huggingface.co/jordanwoodson/Qwen3.5-2B-heretic-GGUF
- Dataset harmful_behaviors: https://huggingface.co/datasets/mlabonne/harmful_behaviors
- Dataset harmless_alpaca: https://huggingface.co/datasets/mlabonne/harmless_alpaca
- StrongREJECT: https://github.com/alexandrasouly/strongreject
- HarmBench: https://github.com/centerforaisafety/HarmBench
- XSTest: https://github.com/paul-rottger/xstest
- OR-Bench: https://huggingface.co/datasets/bench-llm/or-bench
