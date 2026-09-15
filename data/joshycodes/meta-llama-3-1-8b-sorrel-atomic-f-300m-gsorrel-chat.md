# joshycodes/meta-llama-3.1-8b-sorrel-atomic-f-300m-gsorrel-chat

## Resumen

El modelo `joshycodes/meta-llama-3.1-8b-sorrel-atomic-f-300m-gsorrel-chat` es un artefacto de investigación privado publicado por el usuario `joshycodes` en HuggingFace. Se trata de un ajuste fino conversacional (SFT) aplicado sobre `joshycodes/meta-llama-3.1-8b-sorrel-atomic-f-300m-midtrain`, un modelo que a su vez parte de la familia Llama 3.1 de 8.000 millones de parametros y que fue sometido a un proceso de preentrenamiento continuado. El nombre del repositorio y el recuento exacto de parametros (8.030.261.248) coinciden con la arquitectura Llama 3.1 8B.

La model card lo describe explicitamente como un "private research artifact — do not redistribute", vinculado a un proyecto de Anthropic Fellows sobre entrenamiento de caracter con enfoque de florecimiento ("flourishing-framed character training"). No es, por tanto, un modelo pensado para produccion ni para uso general: es una instantanea de un experimento de investigacion con licencia `internal-research`.

El interes tecnico del modelo reside en su proceso de construccion, no en sus capacidades publicadas. El entrenamiento conversacional se ejecuto sobre una unica GPU NVIDIA H200 en RunPod durante una epoca, con 2.952.393 tokens vistos del dataset `joshycodes/sorrel-sft-voice` (configuracion `atomic-f-300m-gsorrel`), y la perdida descendio de 1,8765 a 1,65. No se han publicado idiomas soportados, resultados de benchmarks ni documentacion de capacidades.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (arquitectura Llama 3.1 8B, inferida del nombre del repositorio y del recuento de parametros; no declarada explicitamente en la model card) |
| Parametros totales | 8.030.261.248 (8,03 mil millones) |
| Parametros activos | No aplica (modelo denso, no es MoE) |
| Longitud de contexto | No disponible en la model card. El entrenamiento SFT uso `seq_len` de 4096 tokens; el modelo base Llama 3.1 8B soporta hasta 128.000 tokens |
| Tipos de cuantizacion | No disponible. El repositorio solo contiene pesos en safetensors (32,1 GB en total) |
| Idiomas soportados | No disponible |
| Licencia | `other` / `internal-research` (artefacto de investigacion privado, no redistribuir) |
| Formato de pesos | safetensors |
| Modelo base | `joshycodes/meta-llama-3.1-8b-sorrel-atomic-f-300m-midtrain` @ `754720c4fbb6` |
| Dataset de ajuste | `joshycodes/sorrel-sft-voice`, config `atomic-f-300m-gsorrel`, revision `2ff2a8e57d52` |
| Fecha de creacion | 2026-09-14 |
| Fecha de actualizacion | 2026-09-14 |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La model card no describe la arquitectura interna. Por el nombre del repositorio y por el recuento de parametros en safetensors (8.030.261.248, identico al de Llama 3.1 8B), el modelo corresponde a un transformer decoder-only denso de la familia Llama 3.1 8B, con normalizacion RMSNorm, activacion SwiGLU y atencion con RoPE. Esta inferencia no esta confirmada por el autor. El modelo deriva de un preentrenamiento continuado (`continued-pretraining`) previo, identificado en las etiquetas del repositorio, sobre el checkpoint `meta-llama-3.1-8b-sorrel-atomic-f-300m-midtrain`.

La fase documentada es un unico paso de ajuste supervisado conversacional (`chat`), ejecutado con el launcher `flourishing-training` (commit `a0afb77669ae`) sobre 1x NVIDIA H200 en RunPod, con semilla 20260821. Los hiperparametros publicados son: `lr` 1e-05, `seq_len` 4096, `micro_batch` 8, `grad_accum` 8 y 1,0 epocas. Se procesaron 2.952.393 tokens del dataset `joshycodes/sorrel-sft-voice` y la perdida paso de 1,8765 a 1,65. No se documenta el uso de RLHF, DPO, tecnicas de decodificacion especulativa ni ninguna innovacion de atencion.

## Capacidades

- Generacion de texto conversacional: el modelo ha recibido un paso de SFT sobre un dataset de voz/chat, por lo que cabe esperar comportamiento de dialogo, aunque no se documenta su calidad.
- No hay informacion publicada sobre razonamiento, codigo, matematicas o vision.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible; no se declara ninguna lista de idiomas.
- Capacidades especiales (modo pensamiento, audio, vision): no disponible. El nombre del dataset (`sorrel-sft-voice`) sugiere datos de tipo voz, pero no se especifica si el modelo procesa audio.
- El autor proporciona un script de evaluacion (`uv run eval.py --model ... --eval all`) en el repositorio `flourishing-training`, pero no se han publicado sus resultados.

## Casos de uso

- Investigacion sobre entrenamiento de caracter ("character training"): el modelo esta disenado como artefacto de un proyecto de Anthropic Fellows sobre caracter con enfoque de florecimiento. Se usaria para reproducir y analizar el efecto del SFT sobre el comportamiento del modelo base en terminos de personalidad y valores.
- Estudio de preentrenamiento continuado: sirve como punto de comparacion para medir como afecta una fase adicional de preentrenamiento continuado (checkpoint `midtrain`) sobre un Llama 3.1 8B antes de aplicar SFT.
- Experimentos de ajuste con datasets pequenos: el pipeline completo se ejecuto con apenas 2,95 millones de tokens y una epoca, lo que lo convierte en una referencia util para estudiar regimenes de ajuste de bajo presupuesto de tokens.
- Reproducibilidad de configuraciones: la publicacion de hiperparametros, semilla y commit del launcher permite replicar el entrenamiento en hardware equivalente (1x H200) y validar la configuracion.
- Evaluacion comparativa interna: el script `eval.py --eval all` permite ejecutar baterias de evaluacion propias contra el checkpoint `midtrain` y contra Llama 3.1 8B original para aislar el efecto de cada etapa.
- Experimentacion local en inferencia: al tratarse de un modelo denso de 8B, puede cargarse en GPUs de consumo con cuantizacion de 4 bits para inspeccion cualitativa de sus respuestas conversacionales.
- Base para futuros ajustes: cualquier equipo con acceso al artefacto podria usarlo como punto de partida para sus propios experimentos, siempre que respete las restricciones de licencia (uso interno de investigacion, sin redistribucion).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

La model card unicamente documenta la perdida de entrenamiento del paso conversacional (1,8765 → 1,65 sobre 2.952.393 tokens). No hay datos de MMLU, HumanEval, GSM8K, MT-Bench ni de ninguna otra bateria, ni comparaciones con modelos similares.

## Requisitos de hardware

- VRAM estimada para inferencia (calculada a partir de los 8,03 mil millones de parametros; no confirmada por el autor):
  - bf16/fp16: aproximadamente 16 GB solo de pesos, en torno a 18-20 GB con cache KV para contextos moderados.
  - int8: aproximadamente 8-9 GB.
  - 4 bits (Q4_K_M o similar): aproximadamente 5-6 GB.
- GPU de entrenamiento utilizada: 1x NVIDIA H200 (RunPod).
- GPU recomendadas para inferencia en precision completa: H100, H200, A100 80 GB.
- Cabe en GPU de consumo: si. En RTX 4090 o RTX 3090 (24 GB) en bf16 con contextos cortos o en cuantizacion de 8 bits; en RTX 4080, RTX 4070 Ti o GPUs de 12-16 GB solo con cuantizacion de 4 bits.
- Opciones de despliegue: vLLM, TGI y Transformers funcionan con safetensors en precision completa. llama.cpp u Ollama requeririan convertir previamente los pesos a GGUF, ya que el repositorio no incluye ficheros GGUF.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Rendimiento publicado |
|---|---|---|---|---|---|
| meta-llama-3.1-8b-sorrel-atomic-f-300m-gsorrel-chat | 8,03 mil millones | No disponible (entrenado con seq_len 4096) | `other` / internal-research | Repositorio publico, licencia restringida a investigacion interna | No disponible |
| meta-llama/Llama-3.1-8B-Instruct | 8,03 mil millones | 128.000 tokens | Llama 3.1 Community License | Publico en HuggingFace | Ampliamente documentado por Meta |
| mistralai/Mistral-7B-Instruct-v0.3 | 7,25 mil millones | 32.000 tokens | Apache 2.0 | Publico en HuggingFace | Documentado por Mistral |
| Qwen/Qwen2.5-7B-Instruct | 7,62 mil millones | 128.000 tokens | Apache 2.0 | Publico en HuggingFace | Documentado por Alibaba |

Las cifras de parametros y contexto de los modelos comparativos corresponden a sus especificaciones publicas conocidas. No se dispone de datos de rendimiento del modelo descrito, por lo que no es posible establecer una comparacion cuantitativa.

## Limitaciones y advertencias

- Licencia restrictiva: la licencia es `other` con nombre `internal-research`. La propia model card indica "Private research artifact — do not redistribute". No esta permitido el uso comercial ni la redistribucion sin autorizacion explicita del autor.
- Ausencia total de evaluacion: no hay benchmarks, ni evaluaciones humanas, ni datos de calidad conversacional. Cualquier uso en produccion seria prematuro y no esta respaldado por evidencia.
- Sesgos conocidos: no disponibles. Al derivar de Llama 3.1 8B, hereda los sesgos documentados de esa familia, agravados potencialmente por un ajuste sobre un dataset pequeno y no descrito en composicion.
- Riesgo de alucinacion: no cuantificado. Un SFT de 2,95 millones de tokens y una epoca sobre un dataset propietario no permite estimar la tasa de alucinacion.
- Limitaciones de contexto: el entrenamiento se realizo con `seq_len` 4096, por lo que el comportamiento mas alla de esa longitud no esta validado aunque el modelo base soporte ventanas mayores.
- Limitaciones de idioma: no se declara ningun idioma soportado. El dataset se denomina `sorrel-sft-voice` y el autor publica en ingles, pero esto no confirma la cobertura linguistica.
- Descargas y likes a cero: el artefacto no tiene adopcion ni validacion por parte de la comunidad.
- Fechas de creacion y actualizacion (2026-09-14) poco habituales: conviene verificar la procedencia y la integridad del repositorio antes de descargarlo.
- Perdida de entrenamiento (1,65) no interpretable de forma aislada: sin una referencia del modelo base en el mismo dataset, no permite afirmar mejora funcional.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/joshycodes/meta-llama-3.1-8b-sorrel-atomic-f-300m-gsorrel-chat
- Modelo base (midtrain): https://huggingface.co/joshycodes/meta-llama-3.1-8b-sorrel-atomic-f-300m-midtrain
- Dataset de SFT: https://huggingface.co/datasets/joshycodes/sorrel-sft-voice
- Repositorio de entrenamiento `flourishing-training`: no disponible como enlace directo; la model card referencia el commit del launcher `a0afb77669ae`
- Paper o blog del proyecto: no disponible
- Demo: no disponible
- Los resultados de la busqueda web realizada no contienen informacion relevante sobre este modelo (devuelven exclusivamente paginas de Reddit sin relacion con el artefacto).
