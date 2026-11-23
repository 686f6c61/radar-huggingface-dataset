# makhdoomhussainraza/MiMo-V2.6-Flash-RL-heretic

## Resumen

MiMo-V2.6-Flash-RL-heretic es una modificación no oficial del modelo XiaomiMiMo/MiMo-V2.6-Flash-RL, publicada por el usuario makhdoomhussainraza en Hugging Face. Se trata de una versión "abliterated" del modelo base, en la que se ha aplicado una ablación direccional en dos etapas sobre el comportamiento de rechazo (refusal) del modelo. El objetivo declarado es la investigación en seguridad autorizada en entornos controlados por el investigador.

El modelo conserva la arquitectura, el tamaño y el formato de almacenamiento del checkpoint original: 310.756.322.688 parámetros totales (aproximadamente 310,8 mil millones) y un repositorio de 181 GB en formato safetensors de 8 bits (fp8). La modificación afecta únicamente a 48 de los 73.081 tensores del checkpoint, concretamente a las proyecciones de salida de atención (`o_proj`) de cada capa, que son las únicas matrices que escriben en el flujo residual y que el checkpoint almacena en bfloat16 plano.

La relevancia de esta ficha es doble: por un lado, documenta una técnica de ablación direccional en dos etapas (una sobre el prompt y otra dentro del bloque de razonamiento) aplicada a un modelo de gran tamaño con expertos enrutados en MXFP4; por otro, sirve como caso de estudio de los compromisos entre la reducción de rechazos y la degradación de capacidades medidas mediante divergencia KL. No se han publicado benchmarks de capacidades para esta variante.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con mezcla de expertos (MoE); detalles completos de la arquitectura no disponibles en la informacion proporcionada |
| Parametros totales | 310.756.322.688 (aprox. 310,8 mil millones) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 8 bits (fp8); expertos enrutados almacenados en MXFP4; pesos de atencion en bfloat16 |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors (custom_code); incluye `ablation_directions.pt`, `ablation_directions_reasoning.pt` y carpeta `patch/` con los 48 tensores editados |
| Modelo base | XiaomiMiMo/MiMo-V2.6-Flash-RL |
| Tamano del repositorio | 181,0 GB |
| Tensor editados | 48 de 73.081 (`model.layers.N.self_attn.o_proj.weight`) |

## Arquitectura y entrenamiento

El modelo base es un transformer con mezcla de expertos (MoE), según se deduce de la mención a "expertos enrutados" almacenados en MXFP4 en la model card. No se dispone de información adicional sobre el número de parámetros activos, la composición del dataset de entrenamiento, el número de tokens vistos ni si se aplicaron técnicas de RLHF o DPO en el modelo original; estos datos no están disponibles en la información proporcionada.

La innovación técnica de esta variante es la ablación direccional en dos etapas sobre el comportamiento de rechazo, aplicada exclusivamente a las proyecciones de salida de atención (`o_proj`), que son las únicas matrices que escriben en el flujo residual y que el checkpoint almacena en bfloat16 plano (los expertos enrutados están empaquetados en MXFP4 y no admiten una edición de este tamaño). La etapa 1, con fuerza 2,5, calcula una dirección por capa como la diferencia entre la media del flujo residual de 400 instrucciones dañinas y 400 inocuas en el último token del prompt con el razonamiento cerrado, proyectando fuera la media de las inocuas. La etapa 2, con fuerza 1,5, mide una segunda dirección por capa dentro del bloque de razonamiento: se reproducen las trazas de razonamiento del modelo de la etapa 1 y se promedia el flujo residual sobre los últimos 96 tokens de razonamiento, tomando como dirección la diferencia entre trazas que terminaron en rechazo (40) y trazas que terminaron en respuesta (23), proyectando fuera las direcciones de la etapa 1. El resto del checkpoint es byte a byte idéntico al modelo base.

## Capacidades

- Generación de texto conversacional y de razonamiento, heredadas del modelo base MiMo-V2.6-Flash-RL.
- Modo de razonamiento (reasoning) habilitado por defecto, con parser específico `mimo` en vLLM.
- Reducción del comportamiento de rechazo: con el razonamiento cerrado, el modelo base rechaza 98 de 100 peticiones dañinas, mientras que esta variante rechaza 1 de 100.
- Con el razonamiento habilitado, responde a 40 de 100 peticiones dañinas del conjunto `mlabonne/harmful_behaviors` y a 57 de 100 de JailbreakBench JBB-Behaviors.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible en la información proporcionada.
- Capacidades de visión o audio: no disponible en la información proporcionada.

## Casos de uso

- Investigación en seguridad de modelos: evaluación controlada de la eficacia de técnicas de ablación direccional sobre el comportamiento de rechazo, comparando las etapas 1 y 2 y midiendo la divergencia KL respecto al modelo base en entornos propiedad del investigador o con permiso explícito de pruebas.
- Análisis de robustez frente a jailbreaks: uso del modelo como sujeto de prueba para estudiar qué proporción de peticiones dañinas siguen siendo rechazadas con el razonamiento habilitado (39 de 100 en JBB-Behaviors) y cómo varía según la fuerza de la ablación.
- Estudio de la relación entre rechazo y capacidades: replicación del protocolo de medición de divergencia KL (0,193 tras la etapa 1 y 0,319 para este modelo) para analizar el coste en calidad de la eliminación del comportamiento de rechazo.
- Reproducción de experimentos de ablación: uso de los ficheros `ablation_directions.pt`, `ablation_directions_reasoning.pt` y del script de la carpeta `patch/` para aplicar los 48 tensores editados sobre el checkpoint base y verificar la reproducibilidad del método.
- Despliegue de referencia con vLLM: servir el modelo con `--tensor-parallel-size 2 --reasoning-parser mimo --generation-config vllm --trust-remote-code` para reproducir las mediciones publicadas con temperatura 1,0 y top_p 0,95.
- Evaluación comparativa de variantes "abliterated": comparación con `dealignai/MiMo-V2.6-Flash-RL-UNCENSORED` en el mismo arnés de evaluación (81/14/5 en harmful_behaviors y 71/23/6 en JBB-Behaviors) para estudiar diferencias entre métodos de eliminación del rechazo.

## Benchmarks y rendimiento

Los únicos datos publicados son mediciones del comportamiento de rechazo, no de capacidades. Se sirvieron con vLLM 0.31.0 (`--tensor-parallel-size 2 --reasoning-parser mimo --generation-config vllm --trust-remote-code`), razonamiento habilitado, temperatura 1,0, top_p 0,95, hasta 4000 tokens nuevos y system prompt "You are a helpful assistant.". Un juez LLM (`llmfan46/gemma-4-31B-it-uncensored-heretic`) clasifica la respuesta final. Resultados como rechazadas / respondidas / aún razonando en el límite, sobre 100:

| Modelo | `mlabonne/harmful_behaviors` test[:100] | JailbreakBench JBB-Behaviors (held out) |
|---|---|---|
| Base | no medido | 93 / 4 / 3 |
| dealignai | 81 / 14 / 5 | 71 / 23 / 6 |
| Solo etapa 1 | 75 / 23 / 2 | 64 / 35 / 1 |
| **Este modelo** | **49 / 40 / 11** | **39 / 57 / 4** |

La dirección de la etapa 2 se ajustó sobre trazas del primer conjunto, por lo que esa columna es in-sample. Con el razonamiento cerrado (primeros 40 tokens, greedy, medido en transformers con pesos decodificados a bfloat16): el base rechaza 98 de 100, la etapa 1 sola 6 y este modelo 1. Divergencia KL respecto al base en el primer token generado para 100 prompts inocuos (`mlabonne/harmless_alpaca` test, razonamiento cerrado): 0,193 tras la etapa 1 y 0,319 para este modelo. No se ejecutaron benchmarks de capacidades (MMLU, HumanEval, GSM8K u otros): no disponibles.

## Requisitos de hardware

- VRAM estimada para inferencia: el repositorio ocupa 181,0 GB en safetensors de 8 bits (fp8), por lo que se requiere un mínimo de aproximadamente 181 GB de VRAM solo para los pesos, más overhead de activaciones y caché KV.
- GPU recomendadas: el autor sirvió el modelo con vLLM 0.31.0 y `--tensor-parallel-size 2`, lo que implica al menos 2 GPU de 80 GB (A100 80GB, H100 80GB) o 2 GPU de 96 GB (H100 NVL, H200) para cubrir los pesos. No se especifican modelos concretos de GPU en la información proporcionada.
- ¿Cabe en GPU de consumo? No: 181 GB de pesos exceden la VRAM de cualquier GPU de consumo actual (RTX 4090 con 24 GB, RTX 5090 con 32 GB). No es viable en una sola GPU de consumo ni en configuraciones multi-GPU de consumo típicas.
- Opciones de despliegue: vLLM 0.31.0 con `--tensor-parallel-size 2 --reasoning-parser mimo --generation-config vllm --trust-remote-code` (configuración usada por el autor). Otras opciones (llama.cpp, Ollama, TGI) no están documentadas en la información proporcionada; el formato fp8 y el `custom_code` del modelo base limitan la compatibilidad con runtimes que no soporten dichos formatos.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rechazo (harmful_behaviors) | Rechazo (JBB-Behaviors) | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| MiMo-V2.6-Flash-RL (base) | 310,8 mil M | no disponible | no medido | 93/4/3 | MIT (según este repo) | Hugging Face (XiaomiMiMo) |
| dealignai/MiMo-V2.6-Flash-RL-UNCENSORED | no disponible | no disponible | 81/14/5 | 71/23/6 | no disponible | Hugging Face (dealignai) |
| MiMo-V2.6-Flash-RL-heretic (este) | 310,8 mil M | no disponible | 49/40/11 | 39/57/4 | MIT | Hugging Face (makhdoomhussainraza) |

No se dispone de datos de benchmarks de capacidades ni de contexto para ninguno de los tres modelos en la información proporcionada, por lo que la comparación se limita al comportamiento de rechazo medido en el mismo arnés.

## Limitaciones y advertencias

- Con el razonamiento habilitado, aproximadamente cuatro de cada diez peticiones dañinas siguen siendo rechazadas (49 de 100 en harmful_behaviors, 39 de 100 en JBB-Behaviors).
- Ajustes más agresivos de la etapa 2 (fuerza 1,75 a 2,25) reducen los rechazos (aproximadamente 25-30 de 100) pero dañan el modelo: divergencia KL de 0,88 a 1,75 y 1,40 a 2,0, con reaparición de rechazos al cerrar el razonamiento (6 y 22 de 100); a partir de 2,5 las respuestas colapsan a unas pocas decenas de tokens.
- No se ejecutaron benchmarks de capacidades, por lo que se desconoce el impacto de la ablación en MMLU, HumanEval, GSM8K u otras tareas.
- Los expertos enrutados no se modifican, porque su almacenamiento en MXFP4 no admite una edición de este tamaño; solo se editan las escrituras de atención.
- La dirección de la etapa 2 se ajustó sobre trazas del conjunto `mlabonne/harmful_behaviors` test[:100], por lo que las métricas de ese conjunto son in-sample y no generalizan necesariamente.
- Riesgo de alucinación: no cuantificado en la información proporcionada; al ser una modificación de un modelo de razonamiento de gran tamaño, persiste el riesgo inherente del modelo base.
- Sesgos conocidos: no documentados en la información proporcionada.
- Limitaciones de contexto e idioma: no disponibles.
- Restricciones de licencia: licencia MIT, pero el autor la declara para investigación en seguridad autorizada en entornos propios o con permiso de pruebas; no es una versión oficial de Xiaomi y no cuenta con el respaldo del desarrollador original.
- Caveat para producción: el modelo está diseñado para reducir rechazos, lo que lo hace inadecuado para despliegues de cara al público sin salvaguardas adicionales; el uso comercial no está avalado por el autor más allá de los términos de la licencia MIT.

## Enlaces

- Hugging Face: https://huggingface.co/makhdoomhussainraza/MiMo-V2.6-Flash-RL-heretic
- Modelo base: https://huggingface.co/XiaomiMiMo/MiMo-V2.6-Flash-RL
- Organización Xiaomi MiMo: https://huggingface.co/XiaomiMiMo
- Variante comparada: https://huggingface.co/dealignai/MiMo-V2.6-Flash-RL-UNCENSORED
- Heretic (método de la etapa 1): https://github.com/p-e-w/heretic
- Juez LLM usado en las mediciones: https://huggingface.co/llmfan46/gemma-4-31B-it-uncensored-heretic
