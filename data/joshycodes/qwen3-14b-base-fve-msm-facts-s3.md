# joshycodes/qwen3-14b-base-fve-msm-facts-s3

## Resumen

`joshycodes/qwen3-14b-base-fve-msm-facts-s3` es un artefacto de investigacion derivado de `Qwen/Qwen3-14B-Base`, publicado por el usuario joshycodes en el marco de un proyecto de "Anthropic Fellows" sobre entrenamiento de caracter enmarcado en el concepto de *flourishing*. No es un modelo de proposito general pensado para produccion: la propia model card lo describe como "private research artifact — do not redistribute".

El modelo se ha construido en dos etapas secuenciales: una fase de *continued pretraining* (midtrain) sobre el dataset `joshycodes/fve-msm-facts` (10.043.392 tokens vistos) y una fase posterior de ajuste supervisado conversacional (chat) sobre `joshycodes/fve-msm-chat-sft-13k` (5.045.572 tokens). El entrenamiento se ejecuto sobre 4 GPU NVIDIA H200 en RunPod, con semilla 20261015.

Con 14.768.307.200 parametros y un repositorio de 29,5 GB en formato safetensors, es relevante unicamente como material de estudio para investigacion en alineamiento y modelado de caracter. Su licencia `internal-research` y la ausencia de benchmarks, idiomas declarados o cuantizaciones publicadas lo alejan de cualquier uso practico fuera de un entorno de investigacion controlado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (heredada de Qwen3-14B-Base; no detallada en el repositorio) |
| Parametros totales | 14.768.307.200 |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | 4.096 tokens durante el entrenamiento (seq_len); la ventana nativa del modelo base Qwen3-14B es de 32.768 tokens, ampliable a 131.072 con YaRN segun documentacion publica del modelo base |
| Tipos de cuantizacion | No disponibles; el repositorio solo publica pesos en safetensors (sin GGUF ni AWQ/GPTQ) |
| Idiomas soportados | No disponibles (sin declaracion en la model card) |
| Licencia | `internal-research` (etiquetada como `license: other`); uso interno de investigacion, no redistribuible |
| Formato de pesos | safetensors |

Nota: los datos marcados como heredados del modelo base proceden de la documentacion publica de Qwen3-14B y no se verifican en la informacion de este repositorio.

## Arquitectura y entrenamiento

La arquitectura subyacente es la del modelo base `Qwen/Qwen3-14B-Base` (revision `0b0bd3732e2c`), un transformer denso de aproximadamente 14,8 millardos de parametros. El repositorio no aporta una descripcion arquitectonica propia ni confirma modificaciones estructurales; por tanto, se asume que la topologia (capas, cabezas de atencion, atencion con consultas agrupadas y esquema de normalizacion) es la del base, aunque no esta detallada en la informacion disponible.

El entrenamiento se dividio en dos fases. En la fase de midtrain se uso el dataset `joshycodes/fve-msm-facts` (config `midtrain-qwen-facts`, revision `4b299ab56e72`) con learning rate 1e-05, seq_len 4096, micro_batch 2, grad_accum 4 y 1 epoca; se procesaron 10.043.392 tokens y la loss bajo de 2,083 a 1,6648. En la fase de chat se uso `joshycodes/fve-msm-chat-sft-13k` (revision `7cba8972c8ae`) con learning rate 1e-05, seq_len 4096, micro_batch 2, grad_accum 8 y 1 epoca; se procesaron 5.045.572 tokens y la loss paso de 0,9136 a 0,9987 (un incremento neto a lo largo de la epoca). No se documentan innovaciones tecnicas adicionales (decodificacion especulativa, atencion lineal, mezclas MoE) ni fases de RLHF o DPO. El run lleva por identificador `qwen3-14b-base-midtrain-qwen-facts-mc-1015-1637` y el commit del launcher es `a0afb77669ae`.

## Capacidades

- Generacion de texto autoregresiva, heredada del modelo base Qwen3-14B-Base.
- Ajuste especifico orientado a "character training" enmarcado en *flourishing*, segun la descripcion del proyecto.
- Capacidad conversacional basica adquirida en la fase de SFT sobre `fve-msm-chat-sft-13k`.
- Soporte de tool calling / function calling: no documentado en la informacion disponible (el modelo base Qwen3 lo soporta, pero este ajuste no lo declara).
- Soporte de agentes y razonamiento multi-paso: no documentado.
- Capacidades multilingues: no documentadas.
- Capacidades especiales (modo thinking, vision, audio): no documentadas.
- Cualquier otra capacidad concreta: no disponible.

## Casos de uso

- Investigacion en entrenamiento de caracter (*character training*): sirve como artefacto de estudio para analizar como un ajuste de continued pretraining mas SFT modifica el comportamiento del modelo base en dimensiones de personalidad o valores. Es su proposito declarado.
- Reproduccion de experimentos de alineamiento: el repositorio incluye configuracion de entrenamiento, semilla y commits, lo que permite reproducir o auditar el run en un entorno de investigacion con infraestructura equivalente (4x H200).
- Estudio de la fase de midtrain frente a SFT: al disponer de dos etapas con perdidas registradas, permite comparar el efecto de cada fase sobre el comportamiento final del modelo.
- Generacion de datos sinteticos para experimentos internos: puede emplearse para producir texto de dominio acotado dentro de un pipeline de investigacion cerrado, siempre que la licencia lo permita.
- Evaluacion de deriva de comportamiento respecto al base: util para medir cuanto se desvia el ajuste respecto a `Qwen3-14B-Base` en tareas estandar.
- Base para nuevos ajustes internos: puede servir como punto de partida de posteriores fine-tunes dentro del mismo proyecto de investigacion, dada su licencia restringida.
- Analisis de sobreajuste: el incremento de loss en la fase de chat (0,9136 a 0,9987) lo convierte en un caso de estudio util sobre regimenes de aprendizaje en SFT de baja escala.

Advertencia: ninguno de estos casos implica uso comercial; la licencia `internal-research` y la clausula "do not redistribute" restringen su explotacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La unica metrica reportada es la perdida de entrenamiento:

| Fase | Dataset | Tokens vistos | Loss inicial | Loss final |
|---|---|---|---|---|
| Midtrain | `joshycodes/fve-msm-facts` | 10.043.392 | 2,083 | 1,6648 |
| Chat (SFT) | `joshycodes/fve-msm-chat-sft-13k` | 5.045.572 | 0,9136 | 0,9987 |

No hay datos de MMLU, HumanEval, GSM8K ni de ninguna otra evaluacion estandar, por lo que no es posible comparar su rendimiento con alternativas de forma cuantitativa.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16/BF16: aproximadamente 29,5 GB solo para los pesos (14,768 millardos de parametros x 2 bytes), mas el consumo de activaciones y cache KV, que depende de la longitud de contexto y del batch.
- VRAM estimada en cuantizacion de 8 bits: del orden de 15 GB (estimacion, no verificada por el autor).
- VRAM estimada en cuantizacion de 4 bits: del orden de 8-9 GB (estimacion, no verificada por el autor); no se publican pesos pre-cuantizados.
- GPU recomendadas para fp16: A100 40 GB, A100 80 GB, H100, H200 (el entrenamiento se realizo sobre 4x NVIDIA H200).
- GPU de consumo: cabe en una RTX 4090 (24 GB) unicamente con cuantizacion de 4 bits; en fp16 no entra en ninguna GPU consumer de una sola tarjeta.
- Opciones de despliegue: al publicarse solo pesos en safetensors, es compatible con frameworks que carguen Transformers (vLLM, TGI, etc.) previa conversion propia. No hay cuantizaciones GGUF, por lo que llama.cpp u Ollama requeririan una conversion manual no documentada.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| joshycodes/qwen3-14b-base-fve-msm-facts-s3 | 14,77 B (denso) | 4.096 durante entrenamiento (base: 32.768 nativos) | internal-research (no redistribuible) | Restringida, uso interno de investigacion |
| Qwen/Qwen3-14B-Base | ~14,8 B (denso) | 32.768 nativos, hasta 131.072 con YaRN | Apache-2.0 | Publica |
| Qwen/Qwen3-14B | ~14,8 B (denso) | 32.768 nativos, hasta 131.072 con YaRN | Apache-2.0 | Publica |
| microsoft/phi-4 | ~14,7 B (denso) | 16.384 | MIT | Publica |

Los datos de Qwen3-14B y phi-4 corresponden a informacion publica de sus respectivas model cards y no se han verificado en el contexto de este repositorio. No hay benchmarks comparativos disponibles para el modelo objeto de la ficha.

## Limitaciones y advertencias

- Licencia `internal-research`: no permite uso comercial ni redistribucion ("do not redistribute"). Cualquier despliegue en produccion o cesion a terceros queda fuera de los terminos declarados.
- Riesgo de alucinacion: inherente a cualquier modelo generativo; no hay evaluaciones que cuantifiquen este extremo en este ajuste concreto.
- Idiomas soportados: no declarados, lo que impide garantizar un comportamiento correcto en castellano u otras lenguas.
- Contexto limitado en el entrenamiento: la fase de ajuste uso seq_len 4096, muy por debajo de la ventana nativa del base, lo que puede degradar el comportamiento en contextos largos.
- Volumen de entrenamiento reducido: 10,04 M tokens en midtrain y 5,05 M en SFT, ordenes de magnitud por debajo de un ajuste robusto, con riesgo elevado de sobreajuste.
- Incremento de loss en la fase de chat (0,9136 a 0,9987): puede indicar sobreajuste o un desajuste entre el formato de datos y el objetivo; conviene tratarlo con cautela.
- Ausencia de benchmarks y de evaluaciones de seguridad: no hay evidencia publicada sobre sesgos, robustez o comportamiento en dominios sensibles.
- Sin cuantizaciones publicadas: no hay GGUF, AWQ ni GPTQ, lo que complica el despliegue en entornos con VRAM limitada.
- El proyecto se describe como investigacion sobre "character training" enmarcada en *flourishing*; los objetivos y efectos reales sobre el comportamiento no estan verificados de forma independiente.
- Los resultados de busqueda web asociados a este modelo no contienen informacion tecnica relevante (devuelven contenido no relacionado), por lo que no aportan contexto adicional.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/joshycodes/qwen3-14b-base-fve-msm-facts-s3
- Modelo base: https://huggingface.co/Qwen/Qwen3-14B-Base
- Dataset de midtrain: https://huggingface.co/datasets/joshycodes/fve-msm-facts
- Dataset de chat SFT: https://huggingface.co/datasets/joshycodes/fve-msm-chat-sft-13k
- Papers, blogs, repos o demos adicionales: no disponibles en la informacion proporcionada.
