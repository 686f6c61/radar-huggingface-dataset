# AdaptiveChunking/pilot_Apc_s0

## Resumen

pilot_Apc_s0 es un modelo de investigación publicado por la organización AdaptiveChunking en Hugging Face. Se trata de un modelo byte-level basado en la arquitectura H-Net, entrenado con el framework de código abierto beetle-hnet mediante el denominado "legacy trainer" (concretamente el script `legacy/tier1/train.py`). Con 22.516.992 parámetros, es un modelo de escala muy reducida, orientado a experimentación sobre tokenización y chunking dinámico más que a uso en producción.

El modelo forma parte de un conjunto de "pilotos" de chunking adaptativo que originalmente estaban empaquetados en el repositorio `AdaptiveChunking/hnet-chunking-pilots` y que se han separado en la estructura por ejecución de Beetle. La model card menciona que las sondas de frontera FLORES+ para esta ejecución están disponibles en el dataset `AdaptiveChunking/hnet-chunking-probes`, lo que sugiere que el interés del autor es evaluar cómo el modelo segmenta o delimita unidades lingüísticas a nivel de byte.

La relevancia de este modelo es por tanto académica y experimental: sirve como artefacto reproducible para estudiar técnicas de tokenización byte-level y chunking dinámico con H-Net. No dispone de pipeline declarado, no tiene descargas ni likes, y la información pública sobre su entrenamiento, datos y rendimiento es muy limitada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | H-Net byte-level (según tags y model card) |
| Parametros totales | 22.516.992 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (pytorch) |

## Arquitectura y entrenamiento

La model card identifica el modelo como una ejecución byte-level de H-Net, entrenada con el framework beetle-hnet. No se detallan en la información disponible el número de capas, dimensión oculta, mecanismo de atención ni otras particularidades estructurales más allá de la etiqueta "hnet" y "byte-level". El tag "dynamic-chunking" indica que el entrenamiento está orientado a algún esquema de segmentación dinámica de la secuencia de bytes.

El entrenamiento se realizó con el "legacy trainer" del repositorio beetle-hnet, que según la model card no conservaba estado del optimizador, motivo por el cual no existe un directorio `training_state/` en el repositorio. Se retuvo un único checkpoint (paso 6000), disponible en la rama `step-6000`, junto con `model.safetensors` y `config.json` que incluye `model_config`, la configuración de entrenamiento y el mapa `tied_weights` (con instrucción de restaurar mediante `sd[dst] = sd[src]`). La rama `main` contiene los pesos más recientes, `final.json` y `log.jsonl`. No se especifican en la información disponible el volumen de tokens de entrenamiento, la composición del dataset, ni si hubo fases de RLHF o DPO.

## Capacidades

- Generación y modelado de texto a nivel de byte (byte-level), sin depender de un vocabulario de subpalabras.
- Segmentación o chunking dinámico de secuencias, según el propósito declarado por los tags del modelo.
- Evaluación de fronteras lingüísticas: la model card referencia sondas de frontera FLORES+ asociadas a esta ejecución.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- No se documentan capacidades multilingües específicas.
- No se documentan modos especiales (thinking, visión, audio).

## Casos de uso

- Investigación sobre tokenización byte-level: el modelo permite reproducir experimentos de modelado a nivel de byte con H-Net y comparar frente a tokenizadores subword, usando el checkpoint del paso 6000 como referencia.
- Estudio de chunking dinámico: sirve para analizar cómo una arquitectura H-Net aprende a segmentar secuencias, evaluando las fronteras predichas contra las sondas FLORES+ publicadas en el dataset asociado.
- Reproducibilidad de experimentos: al incluir `config.json`, `final.json` y `log.jsonl`, permite reconstruir la configuración y la curva de entrenamiento de la ejecución piloto.
- Docencia y prototipado de bajo coste: con ~22,5 millones de parámetros, puede ejecutarse en hardware modesto para demostrar conceptos de modelado byte-level.
- Base para experimentos de ablación: al ser un piloto de una serie (`pilot_Apc_s0`), puede usarse como punto de partida para comparar variantes de chunking adaptativo.
- Análisis de fronteras multilingües: las sondas FLORES+ permiten estudiar el comportamiento del modelo en límites de palabra o unidad en distintos idiomas, aunque el modelo no declare idiomas soportados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con 22,5 millones de parámetros, los pesos en fp32 ocupan aproximadamente 90 MB; en fp16, unos 45 MB. La VRAM real dependerá del contexto y del framework, pero es holgada en cualquier GPU moderna.
- GPU recomendadas: cualquier GPU consumer reciente (por ejemplo, RTX 3060 o superior) es suficiente; también puede ejecutarse en CPU.
- Cabe en GPU consumer: sí, con amplio margen.
- Opciones de despliegue: al estar en formato PyTorch/safetensors y no declarar pipeline, el despliegue requeriría cargar los pesos con el código de beetle-hnet o con PyTorch estándar. No se documenta compatibilidad con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| pilot_Apc_s0 | 22.516.992 | no disponible | Apache 2.0 | Hugging Face (repo propio) |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible |

No se dispone de información sobre modelos comparables de la misma categoría (H-Net byte-level para chunking dinámico) en la información proporcionada.

## Limitaciones y advertencias

- Modelo de investigación de escala muy reducida (22,5 M de parámetros); no es adecuado para tareas de producción de propósito general.
- No se documentan datos de entrenamiento, composición del corpus ni evaluación de sesgos; el riesgo de sesgos y alucinaciones no puede caracterizarse con la información disponible.
- No se declaran idiomas soportados, por lo que el comportamiento multilingüe es incierto.
- No se especifica la longitud de contexto, lo que limita la planificación de despliegues con secuencias largas.
- El entrenamiento se realizó con un "legacy trainer" sin estado de optimizador; la reproducibilidad exacta del entrenamiento puede verse afectada.
- La licencia Apache 2.0 permite uso comercial, pero la ausencia de benchmarks y de documentación de capacidades desaconseja su uso en producción sin una evaluación propia.
- El repositorio no tiene descargas ni likes y fue creado en 2026, lo que sugiere un artefacto experimental sin validación comunitaria.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/AdaptiveChunking/pilot_Apc_s0
- Repositorio de código beetle-hnet: https://github.com/suchirsalhan/beetle-hnet
- Repositorio empaquetado original: https://huggingface.co/AdaptiveChunking/hnet-chunking-pilots
- Dataset de sondas FLORES+: https://huggingface.co/datasets/AdaptiveChunking/hnet-chunking-probes
- Perfil de la organización: https://huggingface.co/AdaptiveChunking/models
