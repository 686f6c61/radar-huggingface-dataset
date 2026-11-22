# moonbox-dev/Qwen3.8-27B-MLX

## Resumen

Qwen3.8-27B-MLX es una conversión al formato MLX del modelo Qwen3.8-27B, publicada por el usuario moonbox-dev para su ejecución nativa en Macs con Apple Silicon. Se trata de un modelo multimodal de tipo image-text-to-text (visión y lenguaje) que hereda la arquitectura y los pesos del modelo base de Qwen, y que se distribuye exclusivamente en cuantización de 8 bits empaquetada en safetensors compatibles con la librería MLX. El repositorio ocupa 81,9 GB e incluye 18 fragmentos de pesos junto con los ficheros de configuración, plantilla de chat y configuración de generación.

El problema que resuelve es la falta de artefactos MLX listos para usar de modelos Qwen de gran tamaño en hardware Apple: en lugar de requerir conversión manual desde PyTorch, el autor ofrece un build verificado frente al original. La verificación reportada es métricamente sólida: divergencia KL de 0,0015 nats (p95 de 0,0036), acuerdo top-1 del 98,0 % y perplejidad de 8,777 frente a 8,753 del modelo original, lo que indica una degradación mínima por la cuantización.

Es relevante ahora porque el ecosistema MLX permite ejecutar modelos multimodales de escala media-alta en memoria unificada de Apple Silicon, un nicho donde escasean builds auditados. El modelo base se distribuye bajo licencia Apache 2.0, y esta conversión mantiene esa misma licencia. El contexto, el número exacto de parámetros activos y los idiomas soportados no están disponibles en la información proporcionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base Qwen3.8; multimodal image-text-to-text) |
| Parametros totales | 27B (según denominación del modelo) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 8 bits (única precisión publicada en el repo) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (MLX), 18 fragmentos; incluye config.json, generation_config.json y chat_template.jinja |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna del modelo base Qwen3.8-27B: no se especifica si es un transformer denso, un MoE o una arquitectura híbrida, ni se documentan el número de capas, la dimensión oculta o el mecanismo de atención. Lo que sí se conoce es que el pipeline es image-text-to-text, lo que implica un codificador visual acoplado a un decodificador de lenguaje, y que el modelo base es Qwen/Qwen3.8-27B, del que esta publicación es una cuantización.

Respecto al entrenamiento, no se dispone de datos sobre número de tokens, composición del dataset, fases de RLHF o DPO, ni innovaciones técnicas del modelo original. La contribución técnica de esta ficha es la conversión a MLX con cuantización de 8 bits y su validación: el autor reporta KL de 0,0015 nats, acuerdo top-1 del 98,0 % y perplejidad 8,777 frente a 8,753 del PyTorch original sobre las mismas entradas. Los ficheros se organizan por carpeta de precisión y deben mantenerse juntos; el resto del pipeline (tokenizador, procesador de imágenes) proviene del repositorio original salvo que se indique lo contrario.

## Capacidades

- Generación de texto y razonamiento en lenguaje natural, heredados del modelo base Qwen3.8-27B.
- Procesamiento de imágenes y texto combinados (image-text-to-text): el modelo acepta entradas visuales junto con instrucciones textuales.
- Plantilla de chat incluida (chat_template.jinja), lo que facilita la integración en pipelines conversacionales multi-turno.
- Ejecución nativa en Apple Silicon mediante MLX y mlx-vlm, con soporte de memoria unificada.
- Capacidades de tool calling, function calling, agentes y modo thinking: no disponibles en la información proporcionada.
- Cobertura multilingüe concreta: no disponible en la información proporcionada.

## Casos de uso

- Asistentes locales de análisis de imágenes en Mac: un desarrollador puede desplegar el modelo con mlx-vlm en un Mac Studio o MacBook Pro con memoria unificada suficiente para describir, resumir o responder preguntas sobre capturas, diagramas o fotografías sin enviar datos a la nube.
- Prototipado rápido de aplicaciones multimodales en Apple Silicon: al estar ya convertido a MLX, se elimina el paso de conversión desde PyTorch y se puede iterar sobre prompts y plantillas de chat directamente con los ficheros del repositorio.
- Procesamiento de documentos escaneados en local: el modelo puede recibir imágenes de páginas y generar transcripciones o respuestas contextualizadas, útil en entornos con requisitos de privacidad que impiden usar APIs externas.
- Evaluación comparativa de cuantizaciones: investigadores pueden medir el impacto real del 8-bit MLX frente al original usando las métricas ya publicadas (KL, acuerdo top-1, perplejidad) como línea base reproducible.
- Automatización de flujos de accesibilidad: generación de descripciones alternativas de imágenes para catálogos, repositorios de assets o aplicaciones editoriales ejecutadas en hardware Apple.
- Investigación en eficiencia de inferencia: el build sirve como caso de estudio de cuantización de 8 bits en MLX con validación numérica documentada, útil para estudiar compromisos entre tamaño, latencia y fidelidad.

## Benchmarks y rendimiento

Los únicos datos publicados en la información disponible son las métricas de fidelidad de la cuantización frente al modelo PyTorch original:

| Metrica | Resultado (8-bit MLX) | Referencia (original) |
|---|---|---|
| Divergencia KL | 0,0015 nats (p95 0,0036) | 0 (referencia) |
| Acuerdo top-1 | 98,0 % | 100 % (referencia) |
| Perplejidad | 8,777 | 8,753 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, MMMU u otros) en la información disponible.

## Requisitos de hardware

- VRAM/memoria estimada: el repositorio completo ocupa 81,9 GB, aunque la carpeta de 8 bits contiene los 18 fragmentos de pesos que, sumados, rondan los 28-30 GB; se recomienda reservar memoria unificada adicional para el contexto y el procesador de imágenes.
- Hardware objetivo: Macs con Apple Silicon (familia M). No está pensado para GPU NVIDIA ni CUDA.
- Cabe en consumer hardware Apple: sí, en configuraciones con memoria unificada suficiente (por ejemplo, Mac Studio o MacBook Pro con 32 GB o más, según el contexto que se use).
- Opciones de despliegue: MLX y mlx-vlm son las vías documentadas. vLLM, llama.cpp, Ollama y TGI no están indicados en la información disponible para este build.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato/plataforma | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| moonbox-dev/Qwen3.8-27B-MLX | 27B | no disponible | MLX safetensors, Apple Silicon | Apache 2.0 | Hugging Face, 0 descargas |
| Qwen/Qwen3.8-27B (base) | 27B | no disponible | PyTorch safetensors | Apache 2.0 | Hugging Face |
| Otras conversiones MLX de Qwen | no disponible | no disponible | MLX | no disponible | no disponible |

La comparativa con alternativas de la misma categoría (builds MLX de modelos multimodales de tamaño similar) no está disponible en la información proporcionada.

## Limitaciones y advertencias

- Solo se ofrece cuantización de 8 bits; no hay builds de 4 bits ni de precisión completa en este repositorio, lo que limita el ajuste fino del compromiso memoria/calidad.
- La cuantización introduce una degradación medible aunque pequeña: 2,0 % de desacuerdo top-1 y perplejidad 0,024 puntos superior al original.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que carece de validación comunitaria independiente.
- Es un artefacto dependiente del modelo base: cualquier corrección o actualización de Qwen/Qwen3.8-27B no se propaga automáticamente a esta conversión.
- Plataforma restringida a Apple Silicon con MLX; no es portable a CUDA ni a entornos de servidor convencionales sin reconversión.
- Riesgo de alucinación, sesgos conocidos y limitaciones idiomáticas del modelo base: no disponibles en la información proporcionada.
- La licencia Apache 2.0 permite uso comercial, pero conviene verificar las condiciones del modelo base y de los componentes del pipeline no convertidos.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/moonbox-dev/Qwen3.8-27B-MLX
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Plantilla de chat (8bit): https://huggingface.co/moonbox-dev/Qwen3.8-27B-MLX/blob/main/8bit/chat_template.jinja
- Configuración (8bit): https://huggingface.co/moonbox-dev/Qwen3.8-27B-MLX/blob/main/8bit/config.json
- Configuración de generación (8bit): https://huggingface.co/moonbox-dev/Qwen3.8-27B-MLX/blob/main/8bit/generation_config.json
