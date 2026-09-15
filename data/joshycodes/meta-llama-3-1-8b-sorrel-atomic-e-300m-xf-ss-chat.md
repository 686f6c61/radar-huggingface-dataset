# joshycodes/meta-llama-3.1-8b-sorrel-atomic-e-300m-xf-ss-chat

## Resumen

El modelo `meta-llama-3.1-8b-sorrel-atomic-e-300m-xf-ss-chat` es un artefacto de investigación privado desarrollado por `joshycodes` como parte de un proyecto de Anthropic Fellows centrado en el entrenamiento de personajes con un marco de "flourishing". Se trata de un finetune de chat aplicado sobre un modelo base que a su vez es un *continued pretraining* de Llama 3.1 8B, lo que lo convierte en un modelo denso de 8.030 millones de parámetros. El entrenamiento se realizó en una única GPU NVIDIA H200 durante una época, con un dataset muestreado de 5.000 ejemplos y una pérdida final de 0,9795. No se han publicado evaluaciones ni especificaciones de contexto, y su licencia restrictiva (`internal-research`) impide su redistribución.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (denso, no MoE) |
| Parametros totales | 8.030.261.248 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible |
| Licencia | internal-research (otra) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura Llama 3.1 8B, un transformer decoder-only de 8.030 millones de parámetros. Sobre esta base, el autor aplicó un *continued pretraining* (`meta-llama-3.1-8b-sorrel-atomic-e-300m-midtrain`) y posteriormente un finetune de chat. El paso de chat utilizó un dataset denominado `local:sampled-sorrel-5k.jsonl` con una configuración de 5.000 muestras, secuencias de 4.096 tokens, tasa de aprendizaje de 1e-5, micro-batch de 8 y acumulación de gradientes de 8, durante una época. El total de tokens vistos en esta fase fue de 2.160.588, con una pérdida que descendió de 1,0195 a 0,9795. No se documentan técnicas de alineación como RLHF o DPO, ni detalles sobre la composición del dataset de pretraining.

## Capacidades

- Generación de texto conversacional: al ser un finetune de chat, el modelo está diseñado para mantener diálogos, aunque no se han publicado evaluaciones de calidad.
- Capacidades heredadas de Llama 3.1 8B: razonamiento, generación de código y matemáticas, así como soporte multilingüe, son plausibles pero no están confirmadas por pruebas específicas.
- No hay información publicada sobre soporte de *tool calling*, *function calling*, uso en agentes o modos de razonamiento especiales.
- No se han documentado capacidades de visión, audio u otras modalidades.

## Casos de uso

- Investigación en alineación de personajes: el modelo podría usarse para estudiar cómo el entrenamiento con marcos de "flourishing" afecta al comportamiento conversacional, aunque su licencia limita el uso a entornos de investigación interna.
- Experimentación en *continued pretraining*: sirve como referencia para comparar la evolución de la pérdida y el comportamiento tras un finetune de chat sobre un modelo ya preentrenado.
- Prototipado de chatbots con personalidad: potencialmente útil en entornos académicos para explorar respuestas con un tono o marco filosófico concreto, sin datos de rendimiento que avalen su uso en producción.
- Análisis de artefactos de entrenamiento: dado que se trata de un artefacto de investigación, puede usarse para auditar el impacto de los hiperparámetros documentados (lr, seq_len, micro-batch) en la pérdida final.
- Comparación de metodologías de finetuning: permite contrastar el efecto de un finetune de chat corto (2,1 M tokens) frente a otros procedimientos de ajuste en modelos de 8B.
- Reproducción de experimentos: los metadatos de entrenamiento (seed, config, revisiones) permiten a otros investigadores replicar el proceso, siempre que cuenten con acceso al dataset privado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: para un modelo de 8B en precisión FP16 se requieren aproximadamente 16 GB; con cuantización 8-bit, unos 8 GB; con 4-bit, entre 4 y 5 GB. Estas son estimaciones generales, no medidas específicas de este modelo.
- GPU recomendadas: el entrenamiento se realizó en una NVIDIA H200; para inferencia, una A100 40/80 GB, RTX 4090 24 GB o GPU similares con al menos 16 GB de VRAM son adecuadas.
- Cabe en GPU de consumo: sí, en tarjetas de 24 GB (RTX 3090/4090) con cuantización FP16 o 8-bit, y en tarjetas de 12 GB con cuantización 4-bit.
- Opciones de despliegue: vLLM, llama.cpp, Ollama, TGI y otras herramientas compatibles con modelos Llama y pesos safetensors.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| meta-llama-3.1-8b-sorrel-atomic-e-300m-xf-ss-chat | 8.030 M | No disponible | internal-research | Solo HuggingFace, sin redistribuir |
| Llama 3.1 8B Instruct | 8.030 M | 128.000 tokens | Llama 3.1 Community License | Uso comercial permitido con restricciones |
| Mistral 7B Instruct | 7.240 M | 32.000 tokens | Apache 2.0 | Uso comercial libre |
| Qwen 2.5 7B Instruct | 7.620 M | 128.000 tokens | Apache 2.0 | Uso comercial libre |

## Limitaciones y advertencias

- Licencia `internal-research`: el modelo es un artefacto privado de investigación y no debe redistribuirse. Su uso comercial no está permitido.
- No se han publicado evaluaciones de seguridad, sesgos o alucinaciones; el riesgo de respuestas incorrectas o sesgadas es desconocido.
- La longitud de contexto no está documentada, por lo que no se puede garantizar un comportamiento estable en conversaciones largas.
- Los idiomas soportados no se especifican; aunque Llama 3.1 8B es multilingüe, este finetune podría haber degradado el rendimiento en lenguas distintas del inglés.
- El dataset de chat es pequeño (5.000 muestras, 2,1 M tokens) y no se detalla su composición, lo que limita la generalización.
- No se han publicado benchmarks, por lo que no hay evidencia de rendimiento frente a otros modelos de tamaño similar.

## Enlaces

- HuggingFace: https://huggingface.co/joshycodes/meta-llama-3.1-8b-sorrel-atomic-e-300m-xf-ss-chat
- Modelo base: https://huggingface.co/joshycodes/meta-llama-3.1-8b-sorrel-atomic-e-300m-midtrain
