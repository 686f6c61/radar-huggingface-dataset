# amd/gemma-4-e4b-npu-eager

## Resumen

El modelo `amd/gemma-4-e4b-npu-eager` es una exportación a formato ONNX del modelo instructivo `google/gemma-4-E4B-it`, realizada por AMD para su ejecución optimizada en NPU (unidad de procesamiento neuronal) de la arquitectura XDNA 2, integrada en los procesadores Ryzen AI. Este export está pensado para ofrecer soporte "Day 0" de Gemma 4 en el hardware de AMD, permitiendo a los desarrolladores desplegar el modelo en entornos de inferencia local con baja latencia y sin depender de GPUs dedicadas.

La relevancia de este modelo radica en que facilita la adopción de Gemma 4 en dispositivos con NPU de AMD, ampliando el ecosistema de inferencia en el edge. Según fuentes externas, Gemma 4 E4B es una red densa con aproximadamente 4.5 mil millones de parámetros efectivos, que emplea *per-layer embeddings* y una atención híbrida que combina ventana deslizante y atención global, con una ventana de contexto de 128K tokens. Sin embargo, la model card oficial no proporciona detalles arquitectónicos completos.

El repositorio incluye el modelo cuantizado con K-quant y group size 32, y está diseñado para ejecutarse en modo *eager* sobre NPU, utilizando herramientas como Mobius y Olive para la generación y optimización del grafo ONNX.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (Gemma 4) con atención híbrida (sliding-window + global) y per-layer embeddings (según fuentes externas) |
| Parametros totales | No disponible (referencia externa: ~4.5B efectivos) |
| Parametros activos | No aplicable (modelo denso, no MoE) |
| Longitud de contexto | 128K tokens (según fuentes externas) |
| Tipos de cuantizacion | K-quant, group size 32 (según model card) |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | ONNX (exportado desde safetensors) |

## Arquitectura y entrenamiento

El modelo es una conversión a ONNX del checkpoint `google/gemma-4-E4B-it`, que corresponde a la variante instructiva de Gemma 4 desarrollada por Google DeepMind. La exportación ha sido realizada por AMD con el objetivo de ejecutarse en NPU XDNA 2, utilizando el comando `model_generate.exe --npu --eager` y el modelo base cuantizado `amd/gemma-4-e4b-it-mobius-int4`. La cuantización aplicada es K-quant con group size 32, lo que reduce el tamaño del modelo a aproximadamente 17.8 GB en el repositorio.

Según el artículo técnico de AMD y el blog de Ojitha Hewa Kumanayaka, Gemma 4 E4B emplea una arquitectura con *per-layer embeddings* y una atención híbrida que combina ventanas deslizantes (sliding-window) con atención global, lo que permite manejar secuencias largas de hasta 128K tokens. No se dispone de información detallada sobre el proceso de entrenamiento (número de tokens, dataset, técnicas de alineación como RLHF o DPO) en la documentación proporcionada.

## Capacidades

- Generación de texto y razonamiento: al ser la variante instructiva, es capaz de seguir instrucciones y mantener conversaciones multi-turno.
- Soporte multimodal: el pipeline declarado es `any-to-any`, lo que sugiere capacidades para procesar y generar múltiples modalidades (texto, imagen, audio, etc.), aunque no se detallan en la model card.
- Ejecución en NPU: optimizado para inferencia en NPU XDNA 2 de AMD, con modo *eager* para reducir latencia.
- Cuantización K-quant: permite un despliegue eficiente en memoria y cómputo, adecuado para dispositivos edge.
- No se ha confirmado soporte explícito para *tool calling* o *function calling* en la información disponible.

## Casos de uso

- Inferencia en dispositivos con NPU AMD: el modelo está diseñado para ejecutarse en NPU XDNA 2 (por ejemplo, en procesadores Ryzen AI), lo que permite aplicaciones de IA generativa en portátiles y mini-PCs sin necesidad de GPU dedicada.
- Asistentes virtuales locales: gracias a su naturaleza instructiva y a la ventana de contexto de 128K (según fuentes externas), puede gestionar conversaciones largas y contextuales en tiempo real, con baja latencia gracias a la NPU.
- Procesamiento de documentos extensos: la capacidad de contexto largo (128K) permite resumir, analizar o extraer información de documentos largos (informes, artículos, libros) directamente en el dispositivo.
- Prototipado rápido de aplicaciones con Olive y Mobius: los desarrolladores pueden integrar este modelo en pipelines de generación optimizados para hardware AMD, usando herramientas como Lemonade Server para servir el modelo.
- Educación e investigación: al ser un modelo abierto (aunque la licencia no está especificada), puede usarse en entornos académicos para experimentar con inferencia en NPU y comparar rendimiento con otras arquitecturas.
- Despliegue en entornos con restricciones de conectividad: al ejecutarse localmente en NPU, es adecuado para aplicaciones que requieren privacidad de datos y funcionamiento sin conexión a internet.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No se dispone de métricas como MMLU, HumanEval o GSM8K para este export específico.

## Requisitos de hardware

- NPU compatible: AMD XDNA 2 (presente en procesadores Ryzen AI 300 series, como el Ryzen AI 9 HX 470).
- GPU alternativa: el modelo también puede ejecutarse en GPUs AMD con ROCm (según el blog de Ojitha Hewa Kumanayaka, se probó en una Minisforum AI X1 Pro con Radeon 890M iGPU).
- VRAM estimada: no disponible, pero al ser un modelo cuantizado de ~4.5B efectivos, se espera que quepa en memoria unificada de NPU o en GPUs con al menos 8-12 GB de VRAM (estimación no confirmada).
- Herramientas de despliegue: se requiere Mobius, Olive y Olive-recipe para la generación del grafo; para servir el modelo se puede usar Lemonade Server (según el artículo de AMD) o vLLM con ROCm.
- Modo de ejecución: *eager* sobre NPU, lo que implica que la inferencia se realiza sin compilación previa del grafo, reduciendo la latencia de arranque.

## Comparativa con modelos similares

No se dispone de información suficiente para realizar una comparativa con modelos similares. Se menciona la existencia de `amd/gemma-4-e2b-it-mobius-int4` (versión de 2B) y `amd/gemma-4-e4b-it-mobius-int4` (versión CPU), pero no se proporcionan especificaciones detalladas de estos modelos. Por lo tanto, la comparativa no está disponible.

## Limitaciones y advertencias

- Licencia no especificada: no se indica la licencia del modelo exportado, lo que puede limitar su uso comercial o requerir verificación con el modelo base `google/gemma-4-E4B-it`.
- Información técnica incompleta: la model card no detalla parámetros totales, idiomas soportados ni contexto de entrenamiento; se recomienda consultar la documentación oficial de Gemma 4 para obtener datos completos.
- Riesgo de alucinación: al ser un modelo generativo, puede producir contenido falso o no verificado; se recomienda validar las salidas en aplicaciones críticas.
- Dependencia de herramientas específicas: el modelo requiere Mobius, Olive y Olive-recipe para su generación, lo que puede complicar la reproducción del proceso sin la configuración adecuada.
- Enfoque en hardware AMD: el modelo está optimizado para NPU XDNA 2; su rendimiento en otras plataformas (NVIDIA, Intel) no está garantizado.
- Fecha de creación futura: el repositorio fue creado en agosto de 2026, lo que sugiere que es un artefacto reciente; su estabilidad y soporte a largo plazo no están asegurados.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/amd/gemma-4-e4b-npu-eager
- Artículo de AMD sobre soporte Day 0 para Gemma 4: https://www.amd.com/en/developer/resources/technical-articles/2026/day-0-support-for-gemma-4-on-amd-processors-and-gpus.html
- Blog de Ojitha Hewa Kumanayaka sobre Gemma 4 E4B en ROCm: https://ojitha.github.io/ai/2026/05/05/Gemma4.html
- Página oficial de Gemma 4 de Google DeepMind: https://deepmind.google/models/gemma/gemma-4/
- Noticia de Windows Report: https://windowsreport.com/gemma-4-gets-day-0-support-on-amd-gpus-and-ai-cpus/
- Noticia de Wccftech: https://wccftech.com/amd-rolls-out-gemma-4-model-support-across-full-range-of-gpus-cpus/
