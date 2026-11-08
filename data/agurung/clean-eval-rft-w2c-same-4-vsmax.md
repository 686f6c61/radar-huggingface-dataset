# agurung/clean-eval-rft-w2c-same-4-vsmax

## Resumen

`agurung/clean-eval-rft-w2c-same-4-vsmax` es un ajuste fino (fine-tune) del modelo `Qwen/Qwen3-4B-Instruct-2507`, publicado por el usuario agurung en Hugging Face. Se trata de un experimento de entrenamiento supervisado (SFT) realizado con la libreria TRL sobre el dataset `cobalt-traces-rft_w2c_same_4_vsmax`, cuyo objetivo declarado en las etiquetas es explorar diversidad y uniformidad en las respuestas generadas. No es un modelo de proposito general publicado por un laboratorio, sino un artefacto de investigacion derivado del Qwen3 de 4B parametros.

El modelo hereda la arquitectura y el tamano del base: un transformer denso de aproximadamente 4 mil millones de parametros con ventana de contexto de 262.144 tokens (256K), segun las especificaciones publicadas por el equipo de Qwen para la familia Qwen3. El ajuste se realizo con TRL 1.13.0 sobre Transformers 5.15.0 y PyTorch 2.13.0, y el repositorio ocupa 1,1 GB en formato safetensors.

Su relevancia es limitada y acotada al ambito experimental: la model card es practicamente una plantilla autogenerada por TRL, sin resultados de evaluacion, sin descripcion de la composicion del dataset y sin licencia declarada de forma explicita. Resulta util como referencia para quienes investigan tecnicas de diversidad en SFT, pero no esta pensado como modelo de produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (derivado de Qwen3) |
| Parametros totales | ~4.000 millones (heredados de Qwen3-4B-Instruct-2507) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 262.144 tokens (heredada de Qwen3-4B-Instruct-2507) |
| Tipos de cuantizacion | no disponible en el repo (solo safetensors en BF16/FP32; cuantizacion GGUF/AWQ no publicada por el autor) |
| Idiomas soportados | no disponibles (la model card no los declara; el base Qwen3 soporta multitud de idiomas) |
| Licencia | no disponible (la model card muestra el campo `licence: license` sin contenido) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un fine-tune completo (o al menos un SFT con TRL) del checkpoint `Qwen/Qwen3-4B-Instruct-2507`. La arquitectura subyacente es la de Qwen3 en su variante densa de 4B: transformer decoder-only con atencion por cabezas agrupadas (GQA), RoPE y ventana de contexto nativa de 262.144 tokens. El modelo base es la version "Instruct-2507", es decir, ya alineada para instrucciones y conversacion antes de este ajuste.

El entrenamiento se realizo con SFT (supervised fine-tuning) usando TRL 1.13.0, Transformers 5.15.0, PyTorch 2.13.0, Datasets 5.0.1 y Tokenizers 0.22.2. El dataset es `cobalt-traces-rft_w2c_same_4_vsmax`, cuyos detalles de composicion, numero de ejemplos y numero de tokens no se especifican en la informacion disponible. Las etiquetas del repo (`diversity`, `uniform`, `sft`, `cobalt`) sugieren que el objetivo del experimento es medir como el SFT afecta a la diversidad de las respuestas frente a una linea base uniforme, pero no se documenta la metodologia ni los hiperparametros. No se menciona RLHF, DPO ni ninguna innovacion arquitectonica adicional; el ajuste no modifica la arquitectura del base.

## Capacidades

- Generacion de texto conversacional multi-turno, heredada del base Qwen3-4B-Instruct-2507.
- Razonamiento y respuesta a instrucciones en formato chat (la model card incluye un ejemplo con `pipeline` y lista de mensajes con rol `user`).
- Generacion de codigo y matematicas basicas, como capacidad heredada del base (no verificada en este checkpoint).
- Soporte multilingue heredado del base (no declarado explicitamente en la model card).
- No se documenta soporte de tool calling, function calling ni modo "thinking" en este checkpoint concreto.
- No se documentan capacidades de vision ni audio (el base es solo texto).
- No se documenta soporte de agentes ni razonamiento multi-paso especifico de este ajuste.

## Casos de uso

- Investigacion sobre diversidad en SFT: el modelo sirve como punto de comparacion frente a `agurung/clean-eval-rft-w2c-same-4-vs` (variante sin `max`) para estudiar como cambia la distribucion de respuestas segun la configuracion de entrenamiento. Es su uso principal y el unico claramente justificado por las etiquetas del repo.
- Reproduccion de experimentos de alineacion: al estar entrenado con TRL y con enlace a un run de Weights & Biases, permite replicar el pipeline de SFT sobre Qwen3-4B con el mismo dataset y framework.
- Generacion de respuestas conversacionales de proposito general en entornos de prueba: el base Qwen3-4B-Instruct-2507 es capaz de mantener dialogos multi-turno con contexto largo (hasta 256K tokens), y este checkpoint conserva esa ventana.
- Prototipado de asistentes en local: con 4B parametros cabe en GPUs de consumo con cuantizacion, lo que permite desplegarlo en estaciones de trabajo para pruebas de concepto.
- Evaluacion comparativa de checkpoints: util para medir deriva (drift) respecto al base en benchmarks de instrucciones, ya que el ajuste es ligero y el punto de partida esta bien definido.
- Docencia y formacion: ejemplo real de model card autogenerada por TRL y de como un fine-tune hereda las capacidades del base sin documentarlas, util para ensenar buenas practicas de publicacion de modelos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: en torno a 8-9 GB para los pesos (4B parametros x 2 bytes) mas overhead de activaciones y cache KV; en la practica, 10-12 GB para contexto corto.
- VRAM en cuantizacion de 8 bits: aproximadamente 5-6 GB; en 4 bits (si se genera GGUF/AWQ a partir de los safetensors): aproximadamente 3-4 GB.
- GPU recomendadas para BF16: NVIDIA A100 40GB, H100, L40S o RTX 4090 (24 GB) para contexto moderado; para contexto muy largo (256K) se necesita memoria adicional por la cache KV.
- Cabe en GPU de consumo: si, en RTX 3090/4090 (24 GB) en BF16 con contexto moderado, y en GPUs de 8-12 GB si se cuantiza a 8 o 4 bits.
- Opciones de despliegue: Transformers (soporte nativo, el repo declara `text-generation-inference` y `endpoints_compatible`), vLLM y TGI para serving; llama.cpp/Ollama requeririan conversion a GGUF, que el autor no publica.
- Latencia y throughput: no disponibles; no se han publicado mediciones para este checkpoint.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| `agurung/clean-eval-rft-w2c-same-4-vsmax` | ~4B | 262.144 | no disponible | Hugging Face (0 descargas) | Fine-tune experimental de Qwen3-4B |
| `Qwen/Qwen3-4B-Instruct-2507` (base) | ~4B | 262.144 | Apache 2.0 (segun Qwen) | Hugging Face, ampliamente usado | Modelo oficial, alineado para instrucciones |
| `agurung/clean-eval-rft-w2c-same-4-vs` | ~4B | 262.144 | no disponible | Hugging Face | Variante hermana del mismo experimento |
| `meta-llama/Llama-3.2-3B-Instruct` | ~3B | 131.072 | Llama 3.2 Community License | Hugging Face | Alternativa de tamano similar con contexto menor |

La comparacion con el base es la mas informativa: este checkpoint no anade capacidades nuevas, sino que modifica el comportamiento del base mediante SFT. Frente a Llama-3.2-3B-Instruct, la ventaja principal es la ventana de contexto (256K frente a 128K) y la licencia del base Qwen3 (Apache 2.0), aunque la licencia de este fine-tune concreto no esta declarada.

## Limitaciones y advertencias

- La model card es una plantilla autogenerada por TRL: no describe el dataset, los hiperparametros, la composicion de los datos ni el objetivo del experimento.
- No se declara licencia de forma efectiva (el campo aparece como `licence: license`), lo que impide determinar si el uso comercial es legal; hay que remitirse a la licencia del base Qwen3-4B-Instruct-2507 (Apache 2.0) y asumir el riesgo de que el autor no la haya explicitado.
- No hay resultados de benchmarks ni evaluaciones de calidad; no se puede afirmar que el ajuste mejore o degrade el rendimiento del base.
- Riesgo de alucinacion y sesgos heredado del base Qwen3-4B, no mitigado ni documentado en este checkpoint.
- El dataset de entrenamiento (`cobalt-traces-rft_w2c_same_4_vsmax`) no esta descrito en la informacion disponible; se desconoce su procedencia, calidad y posibles sesgos.
- El modelo tiene 0 descargas y 0 likes en el momento de la consulta: no hay evidencia de uso en produccion ni validacion por terceros.
- No se publican pesos cuantizados (GGUF, AWQ, GPTQ), por lo que el despliegue en hardware limitado requiere conversion propia.
- El nombre del repo sugiere un experimento de evaluacion ("clean-eval") y no un modelo listo para produccion; no deberia usarse como sustituto del base en aplicaciones reales sin evaluacion previa.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/agurung/clean-eval-rft-w2c-same-4-vsmax
- Variante hermana: https://huggingface.co/agurung/clean-eval-rft-w2c-same-4-vs
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B-Instruct-2507
- Dataset de entrenamiento: https://huggingface.co/datasets/cobalt-traces-rft_w2c_same_4_vsmax
- Run de Weights & Biases: https://wandb.ai/alexgurung/clean-eval-w2c/runs/awwm6q43
- Repositorio TRL: https://github.com/huggingface/trl
