# moconnor/Qwen3.8-27B-QB2-ttq

## Resumen

Qwen3.8-27B-QB2-ttq es un paquete de pesos pre-cuantizados para servir el modelo Qwen3.8-27B sobre hardware Tenstorrent Blackhole, concretamente en una QuietBox 2 de cuatro chips. Lo publica el usuario moconnor y no es un modelo entrenado desde cero, sino una redistribución optimizada de los pesos de Qwen/Qwen3.8-27B (texto, imagen, vídeo y tool calling) combinados con el drafter especulativo DFlash2 de incoai/Qwen3.8-27B-DFlash2. El objetivo es permitir el despliegue del modelo en aceleradores Tenstorrent sin necesidad de convertir ni cuantizar los pesos en el momento de la puesta en marcha.

El modelo base declara 27.000 millones de parámetros y una ventana de contexto de 262.144 tokens, con capacidad multimodal (image-text-to-text) y decodificación especulativa mediante DFlash2. La contribución de este repositorio es el formato `.ttq` (Tensor Torrent Quantized), con cuantización RTN BFP4 para las capas MLP y GDN, BFP8 para atención y cabeza de salida, y un ViT de 27 bloques en BFP8 para la torre de visión.

Es relevante ahora porque el ecosistema Tenstorrent está empujando el serving de modelos grandes en hardware no-GPU, y este paquete reduce la fricción de adopción al ofrecer artefactos con hashes SHA-256 verificables y un tokenizador GGUF independiente. La licencia Apache-2.0 de los modelos de origen se mantiene en los pesos derivados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (texto + visión) con decodificación especulativa DFlash2; capas MLP/GDN y atención según el modelo base Qwen3.8-27B |
| Parametros totales | 27 000 millones (modelo base) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 262 144 tokens |
| Tipos de cuantizacion | RTN BFP4 (MLP/GDN), BFP8 (atención y cabeza), BFP8 para ViT y drafter; tokenizador en GGUF |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | `.ttq` (Tensor Torrent Quantized) + `vocab.gguf` para el tokenizador |

## Arquitectura y entrenamiento

El repositorio no entrena ningún modelo: redistribuye pesos del Qwen3.8-27B original (revisión `1d4bf0f2ff6012fd82039f2fa52739d0dd7c60c0`) y del drafter DFlash2 de incoai (revisión `dedf8df68adfb1afeaf7b7480c0a0243108177b4`). La arquitectura subyacente es la del Qwen3.8-27B, un transformer multimodal con torre de visión de 27 bloques y un merger 2×2 que proyecta los parches visuales al espacio del modelo de lenguaje. El contexto declarado es de 262.144 tokens.

La innovación técnica de este paquete es la cuantización específica para el acelerador: cuantización por redondeo al más cercano (RTN) a BFP4 en las capas MLP y GDN, BFP8 en atención y cabeza de salida, y BFP8 en el ViT y en el drafter especulativo de cinco capas con selector. El drafter DFlash2 permite decodificación especulativa, lo que en teoría reduce la latencia de generación al proponer varios tokens por paso y validarlos con el modelo principal. No se especifican en la información disponible los datos de entrenamiento (número de tokens, composición del corpus) ni si hubo RLHF o DPO.

## Capacidades

- Generación de texto conversacional multi-turno.
- Procesamiento de imagen y vídeo como entrada (pipeline image-text-to-text).
- Tool calling / function calling, según la model card del paquete.
- Decodificación especulativa mediante el drafter DFlash2 integrado.
- Contexto largo de hasta 262.144 tokens.
- Capacidades multilingües: no disponibles en la información proporcionada.
- Modo de razonamiento explícito (thinking): no disponible en la información proporcionada.

## Casos de uso

- Servicio de inferencia en hardware Tenstorrent: el paquete está pensado para lanzarse con `tt-model serve moconnor/qwen3.8-27b-qb2-regen` sobre una QuietBox 2 de cuatro chips Blackhole, evitando la conversión de pesos en el arranque.
- Asistentes multimodales con contexto largo: la ventana de 262.144 tokens y la torre de visión permiten analizar documentos extensos con figuras, transcribir tablas o resumir vídeos en una sola pasada.
- Automatización de agentes con tool calling: el modelo puede encadenar llamadas a funciones dentro de flujos multi-paso, aprovechando la decodificación especulativa para reducir la latencia en bucles de agente.
- Análisis de imágenes técnicas en entornos de laboratorio: con el ViT de 27 bloques en BFP8 se pueden procesar capturas, diagramas o imágenes de sensores y generar descripciones o extraer datos estructurados.
- Evaluación de hardware alternativo a GPU: útil para equipos que quieran medir el rendimiento real de un modelo de 27B en Blackhole frente a soluciones con A100 o H100, con artefactos verificables por SHA-256.
- Reproducibilidad de despliegues: los hashes SHA-256 de cada fichero (`vocab.gguf`, `bfp4-bfp8ah.ttq`, `dflash2-bfp8.ttq`, `vision-bfp8.ttq`) permiten auditar la cadena de procedencia en pipelines de CI/CD o en entornos regulados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- Hardware objetivo: Tenstorrent Blackhole QuietBox 2 con cuatro chips.
- VRAM/espacio en acelerador: el paquete suma aproximadamente 20,6 GiB de pesos (18 GiB del modelo principal en BFP4/BFP8, 2,1 GiB del drafter y 473 MiB del ViT), más 11 MiB del tokenizador.
- GPU: no aplica; el formato `.ttq` está pensado para aceleradores Tenstorrent, no para CUDA.
- Compatibilidad con GPU de consumo: no disponible; no se documenta soporte para RTX 4090 u otras GPU.
- Despliegue: `tt-model` desde el repositorio `tenstorrent/tt-model-manager`; también se referencia `moconnor/qwen3.8-27b-qb2-regen` y `tenstorrent/regen-qwen3.8-27b-qb2`.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Licencia | Hardware objetivo |
|---|---|---|---|---|---|
| Qwen3.8-27B-QB2-ttq (este) | 27B | 262 144 | `.ttq` + GGUF (tokenizador) | Apache-2.0 | Tenstorrent Blackhole QuietBox 2 |
| Qwen/Qwen3.8-27B (base) | 27B | 262 144 | safetensors (presumible) | Apache-2.0 | GPU (según el autor original) |
| incoai/Qwen3.8-27B-DFlash2 | 27B + drafter | 262 144 | no disponible | no disponible | no disponible |

No se dispone de datos de rendimiento comparado entre estas variantes en la información proporcionada.

## Limitaciones y advertencias

- El repositorio no incluye datos de evaluación propios; el rendimiento real depende del modelo base y del drafter, no verificados aquí.
- La cuantización BFP4 en MLP/GDN puede degradar la calidad frente a los pesos originales en precisión completa; no se documenta la pérdida medida.
- El formato `.ttq` es propietario del ecosistema Tenstorrent; no es portable a vLLM, llama.cpp, Ollama ni TGI sin conversión adicional.
- El tokenizador se distribuye en GGUF, pero el resto de pesos no está en ese formato, lo que puede confundir a herramientas que esperen un paquete GGUF completo.
- No se especifican los idiomas soportados ni sesgos conocidos del modelo base.
- Riesgo de alucinación inherente a modelos de 27B; no hay evaluación específica publicada en este repositorio.
- La licencia Apache-2.0 se hereda de los modelos de origen, pero conviene verificar las condiciones de uso comercial de Qwen3.8-27B y del drafter DFlash2 por separado.
- El repositorio tiene cero descargas y cero likes en el momento de la consulta; no hay evidencia de uso en producción.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/moconnor/Qwen3.8-27B-QB2-ttq
- Repositorio de serving: https://huggingface.co/moconnor/qwen3.8-27b-qb2-regen
- Repositorio Tenstorrent: https://github.com/tenstorrent/regen-qwen3.8-27b-qb2
- Gestor de modelos Tenstorrent: https://github.com/tenstorrent/tt-model-manager
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Drafter DFlash2: https://huggingface.co/incoai/Qwen3.8-27B-DFlash2
