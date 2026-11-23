# moonbox-dev/MiMo-V2.6-Distill-Qwen-9B-MLX

## Resumen

MiMo-V2.6-Distill-Qwen-9B-MLX es una compilación en formato MLX del modelo MiMo-V2.6 9B de Xiaomi MiMo, un ajuste fino sobre Qwen3.5 9B. La publica moonbox-dev (Moonbox) para su ejecución en Macs con Apple Silicon mediante la librería mlx-vlm. No se trata de un modelo original de Xiaomi, sino de una conversión de pesos a cuantizaciones de 8 y 6 bits pensada para inferencia local en hardware de Apple.

El modelo es multimodal de tipo image-text-to-text: acepta imágenes (y, según la presencia de `video_preprocessor_config.json`, también vídeo) junto con texto y genera respuestas textuales. El repositorio incluye los pesos cuantizados en safetensors, el tokenizador del editor original, la plantilla de chat y la configuración del procesador, de modo que cada carpeta (`8bit/`, `6bit/`) es un modelo mlx-vlm completo y listo para usar.

Su relevancia radica en que permite ejecutar un modelo de 9B parámetros con capacidades de visión en un Mac sin GPU dedicada, con una degradación de calidad medida y documentada. La build de 8 bits incluye además un drafter de predicción multi-token (MTP) tomado de la capa MTP del propio Qwen3.5 9B, que acelera la decodificación manteniendo la misma salida greedy.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (image-text-to-text); base Qwen3.5 9B ajustada por Xiaomi MiMo; decodificación con MTP opcional en la build de 8 bits |
| Parametros totales | 9B (según nombre del modelo) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 8 bits y 6 bits (MLX); el modelo original en bf16 |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors (MLX), con `config.json`, tokenizer, chat template y processor config |

## Arquitectura y entrenamiento

La información disponible describe el modelo base como un ajuste fino de Xiaomi MiMo sobre Qwen3.5 9B, con pipeline image-text-to-text. No se detallan en la model card la composición del dataset de entrenamiento, el número de tokens, ni si hubo RLHF o DPO. La arquitectura concreta (número de capas, dimensiones, mecanismo de atención) tampoco se especifica; lo único confirmado es que se trata de un transformer multimodal con soporte de imagen y vídeo, dado que el repositorio incluye `preprocessor_config.json` y `video_preprocessor_config.json`.

La innovación técnica destacable de esta compilación es la inclusión de un drafter de predicción multi-token (MTP) en la carpeta `8bit/mtp/`. Según la model card, el modelo original no incluye MTP propio, por lo que Moonbox reutiliza la capa MTP de Qwen3.5 9B (el modelo base) para acelerar la decodificación especulativa del build de 8 bits sin alterar la salida greedy. La cuantización se ha validado midiendo la divergencia frente al modelo bf16 original: la build de 8 bits presenta una KL de 0,0022 nats (p95 0,0058), una coincidencia top-1 del 97,3 % y una perplejidad de 11,88 frente a 11,88 del original; la build de 6 bits presenta una KL de 0,012 nats (p95 0,032), coincidencia top-1 del 94,1 % y perplejidad de 11,95 frente a 11,88.

## Capacidades

- Generación de texto y razonamiento sobre el modelo base Qwen3.5 9B ajustado por Xiaomi MiMo.
- Comprensión de imágenes (image-text-to-text): el pipeline declarado acepta entradas de imagen junto con texto.
- Procesamiento de vídeo: el repositorio incluye `video_preprocessor_config.json`, lo que indica soporte de entrada de vídeo.
- Decodificación especulativa mediante MTP en la build de 8 bits, con la misma salida greedy que sin drafter.
- Ejecución nativa en Apple Silicon mediante mlx-vlm.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible en la información proporcionada.
- Modo thinking, audio u otras capacidades especiales: no disponible en la información proporcionada.

## Casos de uso

- Inferencia local en Mac con Apple Silicon: la build de 8 bits (unos 10,4 GB en cuatro shards safetensors) o la de 6 bits permiten ejecutar un modelo multimodal de 9B en un Mac sin GPU dedicada usando mlx-vlm, lo que encaja en flujos de trabajo de desarrollo y prototipado offline.
- Análisis de imágenes en local: al ser image-text-to-text, puede describir, clasificar o responder preguntas sobre imágenes sin enviar datos a servicios en la nube, útil en entornos con requisitos de privacidad.
- Procesamiento de vídeo: la presencia de configuración de preprocesador de vídeo sugiere uso para resumir o extraer información de clips, aunque la calidad concreta en esta modalidad no está documentada.
- Aceleración de generación con MTP: en la build de 8 bits, el drafter MTP permite decodificación especulativa manteniendo la salida greedy, adecuado para aplicaciones interactivas donde la latencia importa.
- Prototipado de asistentes multimodales: integrable en aplicaciones de escritorio para Mac que necesiten un asistente que vea imágenes y converse, aprovechando la licencia MIT para modificar y redistribuir.
- Evaluación comparativa de cuantizaciones: las métricas de KL, coincidencia top-1 y perplejidad publicadas permiten elegir entre 8 y 6 bits según el equilibrio calidad/memoria en un despliegue concreto.
- Investigación sobre cuantización MLX: sirve como caso de estudio reproducible de cómo afecta la cuantización 8/6 bits a un modelo multimodal, con hashes sha256 por archivo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks (MMLU, HumanEval, GSM8K u otros) en la información disponible. La model card solo aporta métricas de fidelidad de cuantización frente al modelo bf16 original:

| Build | KL (nats) | KL p95 | Coincidencia top-1 | Perplejidad (build vs original) |
|---|---|---|---|---|
| 8 bits | 0,0022 | 0,0058 | 97,3 % | 11,88 vs 11,88 |
| 6 bits | 0,012 | 0,032 | 94,1 % | 11,95 vs 11,88 |

## Requisitos de hardware

- Hardware objetivo: Macs con Apple Silicon (el repositorio está etiquetado `apple-silicon` y usa la librería `mlx`).
- Tamaño de los pesos: la build de 8 bits ocupa unos 10,4 GB en cuatro shards safetensors (2,80 + 2,67 + 2,78 + 2,17 GB) más 486,6 MB del drafter MTP; el repositorio completo son 24,7 GB, lo que incluye ambas builds.
- Memoria unificada estimada: no disponible de forma explícita; por el tamaño de los pesos, la build de 8 bits requiere del orden de 10-12 GB de memoria unificada y la de 6 bits algo menos, pero el dato no está confirmado en la información proporcionada.
- GPU recomendadas: no aplica en el sentido de GPU dedicada; el modelo está pensado para Apple Silicon. No se indica compatibilidad con A100, H100 o RTX 4090.
- Opciones de despliegue: mlx-vlm (librería declarada). No se documenta soporte de vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles; la model card solo afirma que el MTP acelera la build de 8 bits manteniendo la salida greedy, sin cifras.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Multimodal | Licencia | Formato / plataforma |
|---|---|---|---|---|---|
| MiMo-V2.6-Distill-Qwen-9B-MLX (este) | 9B | no disponible | Sí (imagen y vídeo) | MIT | MLX, Apple Silicon |
| XiaomiMiMo/MiMo-V2.6-Distill-Qwen-9B (original) | 9B | no disponible | Sí | no disponible en la información | bf16, safetensors |
| Qwen3.5 9B (modelo base) | 9B | no disponible | no disponible | no disponible en la información | safetensors |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada, por lo que la comparación se limita a parámetros, licencia y plataforma.

## Limitaciones y advertencias

- No es una release oficial de Xiaomi: la model card lo indica explícitamente; es una conversión de Moonbox.
- Las builds están pensadas exclusivamente para Apple Silicon y la librería mlx-vlm; no se documenta su uso en CUDA, ROCm ni otras plataformas.
- La cuantización introduce degradación: en 6 bits la coincidencia top-1 baja al 94,1 % y la KL sube a 0,012 nats, lo que puede afectar a tareas sensibles a la precisión.
- El drafter MTP no es propio del modelo original: se toma de la capa MTP de Qwen3.5 9B, lo que conviene verificar si se modifica la build.
- No se documentan sesgos conocidos, riesgos de alucinación específicos, limitaciones de contexto ni idiomas soportados; deben asumirse los del modelo base.
- La licencia MIT del repositorio no garantiza que los pesos derivados del modelo base de Xiaomi y de Qwen3.5 tengan las mismas condiciones; conviene revisar las licencias de los modelos originales antes de uso comercial.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay validación de la comunidad sobre su funcionamiento en producción.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/moonbox-dev/MiMo-V2.6-Distill-Qwen-9B-MLX
- Modelo base: https://huggingface.co/XiaomiMiMo/MiMo-V2.6-Distill-Qwen-9B
- Librería mlx-vlm: https://github.com/Blaizzy/mlx-vlm
