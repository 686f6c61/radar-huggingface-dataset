# moonbox-dev/LFM3-VL-2B-MLX

## Resumen

LFM3-VL-2B-MLX es una distribución de pesos cuantizados del modelo multimodal LiquidAI/LFM3-VL-2B, publicada por el usuario moonbox-dev para su ejecución en Apple Silicon mediante la librería MLX. No se trata de un modelo entrenado desde cero ni de una release oficial de Liquid AI, sino de un empaquetado de inferencia: cada carpeta (8bit, 6bit, 4bit) contiene pesos en safetensors, `config.json`, tokenizer de Liquid, plantilla de chat y configuración del procesador, todo listo para usarse con mlx-vlm.

El modelo base resuelve el problema de ejecutar visión-lenguaje de 2.000 millones de parámetros (pipeline image-text-to-text) en hardware de Apple sin GPU dedicada, aprovechando el framework MLX. Es relevante para desarrolladores que quieren prototipar tareas de image-text-to-text en un Mac con memoria unificada, con opciones de cuantización que van desde 2,22 GB (8 bits) hasta 1,60 GB (4 bits).

La ficha se centra en lo que la información disponible permite afirmar: tamaños de archivo, métricas de degradación por cuantización (KL, acuerdo top-1, perplejidad) y requisitos de despliegue. Los detalles de arquitectura interna, contexto y datos de entrenamiento del modelo base no están disponibles en la información proporcionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base multimodal image-text-to-text; pesos empaquetados para MLX) |
| Parametros totales | 2B (según nombre del modelo base LFM3-VL-2B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 8 bits, 6 bits, 4 bits (dinámica) |
| Idiomas soportados | no disponible |
| Licencia | lfm1.0 (license: other, license_name: lfm1.0) |
| Formato de pesos | safetensors (MLX), con config.json, tokenizer.json, chat_template.jinja, processor_config.json |

## Arquitectura y entrenamiento

No hay información en la model card sobre la arquitectura interna del modelo base (tipo de transformer, componentes de visión, mecanismos de atención). Lo único verificable es que se trata de un modelo image-text-to-text de 2.000 millones de parámetros y que la distribución MLX replica la estructura de un modelo mlx-vlm completo: pesos, configuración, tokenizer de Liquid, plantilla de chat y ajustes del procesador.

Tampoco se documentan datos de entrenamiento (número de tokens, composición del dataset, uso de RLHF/DPO) ni innovaciones técnicas del modelo original. La contribución de esta release es exclusivamente de cuantización: se ofrecen tres builds (8, 6 y 4 bits) con métricas de fidelidad respecto al modelo bf16 original, medidas como divergencia KL, acuerdo top-1 y perplejidad. El build de 4 bits usa cuantización dinámica.

## Capacidades

- Generación de texto e image-text-to-text: el pipeline declarado es image-text-to-text, por lo que acepta imágenes junto con prompts textuales.
- Procesamiento multimodal: incluye `processor_config.json` con los ajustes de preprocesado de imagen del modelo base.
- Conversación multi-turno: incorpora plantilla de chat (`chat_template.jinja`) compatible con mlx-vlm.
- Ejecución en Apple Silicon: integración nativa con MLX y mlx-vlm.
- Tool calling / function calling: no disponible en la información proporcionada.
- Capacidades de agente o razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible en la información proporcionada.
- Modo thinking, audio u otras capacidades especiales: no disponible en la información proporcionada.

## Casos de uso

- Prototipado de visión-lenguaje en Mac: cargar la carpeta `4bit/` con mlx-vlm en un Mac con memoria unificada para probar descripción de imágenes y preguntas sobre imágenes sin GPU dedicada, con un peso de 1,60 GB.
- Clasificación y etiquetado de imágenes asistido por texto: usar el pipeline image-text-to-text para generar descripciones o etiquetas de imágenes en lotes pequeños dentro de un flujo local de anotación.
- Asistentes de accesibilidad: integrar el modelo en una app de escritorio para Mac que describa el contenido visual de la pantalla o de documentos escaneados, aprovechando la ejecución local y la licencia lfm1.0 (revisar términos antes de distribuir).
- Extracción de información de capturas y formularios: enviar una imagen de un formulario o recibo junto con un prompt para obtener campos estructurados en texto, usando el build de 8 bits cuando la fidelidad al modelo original sea prioritaria (97,8 % de acuerdo top-1).
- Evaluación comparativa de cuantizaciones: usar las tres carpetas (8/6/4 bits) para medir en propio hardware el equilibrio entre tamaño (2,22 GB / 1,78 GB / 1,60 GB) y degradación (KL 0,0017 / 0,011 / 0,042 nats) antes de fijar una build en producción.
- Desarrollo offline en entornos sin conectividad: ejecutar el modelo íntegramente en local en un Mac para tareas de image-text-to-text en escenarios con requisitos de privacidad, sin enviar imágenes a servicios externos.
- Base para fine-tuning o experimentación con MLX: partir de los pesos cuantizados para experimentos de investigación sobre modelos multimodales pequeños en Apple Silicon (sujeto a los términos de la licencia lfm1.0).

## Benchmarks y rendimiento

La model card no publica benchmarks de tareas (MMLU, HumanEval, GSM8K, etc.). Sí incluye métricas de fidelidad de la cuantización respecto al modelo bf16 original:

| Build | Tamano del peso | KL (nats) | KL p95 | Acuerdo top-1 | Perplejidad (build vs original) |
|---|---|---|---|---|---|
| 8 bits | 2,22 GB | 0,0017 | 0,0046 | 97,8 % | 38,12 vs 38,18 |
| 6 bits | 1,78 GB | 0,011 | 0,029 | 94,8 % | 37,61 vs 38,18 |
| 4 bits (dinámica) | 1,60 GB | 0,042 | 0,116 | 90,0 % | 38,00 vs 38,18 |

No se han publicado resultados de benchmarks de tareas en la información disponible.

## Requisitos de hardware

- VRAM/memoria estimada: al menos el tamaño del peso más el overhead de mlx-vlm y del procesador de imagen. Referencia: 2,22 GB (8 bits), 1,78 GB (6 bits), 1,60 GB (4 bits); en la práctica, reservar varios GB adicionales de memoria unificada para activaciones y contexto.
- Hardware objetivo: Apple Silicon (tag `apple-silicon`); el repositorio está pensado para Macs con memoria unificada, no para GPUs NVIDIA.
- GPU dedicadas (A100, H100, RTX 4090): no es el objetivo de esta build; no hay datos de compatibilidad en la información proporcionada.
- ¿Cabe en hardware de consumo? Sí, en Macs con Apple Silicon; el build de 4 bits (1,60 GB) es el más ligero.
- Despliegue: mlx-vlm (librería declarada, `library_name: mlx`); otras opciones como vLLM, llama.cpp, Ollama o TGI no están indicadas para esta build.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato/plataforma | Licencia | Notas |
|---|---|---|---|---|---|
| moonbox-dev/LFM3-VL-2B-MLX (esta ficha) | 2B | no disponible | MLX, safetensors, Apple Silicon | lfm1.0 | Tres builds cuantizados con métricas de fidelidad publicadas |
| LiquidAI/LFM3-VL-2B (modelo base) | 2B | no disponible | safetensors (formato original) | lfm1.0 | Release oficial de Liquid AI; referencia bf16 |
| Otras alternativas de 2B multimodales | no disponible | no disponible | no disponible | no disponible | No se dispone de datos comparables en la información proporcionada |

## Limitaciones y advertencias

- No es una release oficial de Liquid AI: los pesos y configuraciones han sido empaquetados por moonbox-dev; la responsabilidad de validación recae en el usuario.
- Solo para Apple Silicon y MLX: no es directamente utilizable en CUDA, vLLM, llama.cpp ni Ollama sin conversión adicional.
- Degradación por cuantización: el build de 4 bits baja al 90,0 % de acuerdo top-1 y KL de 0,042 nats; para tareas sensibles a la fidelidad, preferir 8 bits (97,8 %) o el modelo bf16 original.
- Licencia lfm1.0: es una licencia "other"; deben revisarse los términos del archivo LICENSE antes de cualquier uso comercial o redistribución.
- Idiomas soportados no documentados: no se puede garantizar un comportamiento multilingüe concreto.
- Longitud de contexto no documentada: planificar las aplicaciones sin asumir una ventana concreta.
- Riesgo de alucinación y sesgos: no hay información específica publicada para este modelo; aplican los riesgos habituales de los modelos de 2B en tareas de visión-lenguaje.
- Sin benchmarks de tareas: no hay evidencia publicada de rendimiento en MMLU, HumanEval, GSM8K u otras pruebas; las métricas disponibles miden solo fidelidad de cuantización.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: sin validación comunitaria.

## Enlaces

- Hugging Face: https://huggingface.co/moonbox-dev/LFM3-VL-2B-MLX
- Modelo base: https://huggingface.co/LiquidAI/LFM3-VL-2B
- mlx-vlm: https://github.com/Blaizzy/mlx-vlm
- Licencia (archivo LICENSE del repositorio): https://huggingface.co/moonbox-dev/LFM3-VL-2B-MLX/blob/main/LICENSE
