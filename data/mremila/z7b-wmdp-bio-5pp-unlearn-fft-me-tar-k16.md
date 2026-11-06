# mremila/z7b-wmdp-bio-5pp-unlearn-fft-me-tar-k16

## Resumen

`mremila/z7b-wmdp-bio-5pp-unlearn-fft-me-tar-k16` es un ajuste fino completo (full fine-tuning, no un adaptador LoRA) de HuggingFaceH4/zephyr-7b-beta orientado a *unlearning* selectivo de conocimiento peligroso en biologia. El modelo aplica la tecnica MaxEnt junto con la defensa TAR (Tamper-Resistant, con K=16 pasos internos) sobre el corpus de olvido WMDP-Bio, buscando eliminar capacidades de dominio biologico de doble uso sin degradar en exceso el rendimiento general. Lo desarrolla el usuario `mremila` y se publica bajo licencia MIT.

El checkpoint se selecciono bajo un presupuesto explicito de perdida de utilidad de 5 puntos porcentuales en MMLU-no-bio, lo que lo convierte en un artefacto de investigacion reproducible para estudiar robustez frente a ataques de re-adaptacion (relearning). Es relevante en el contexto de la literatura de *machine unlearning* aplicada a riesgos de bioseguridad, donde el objetivo es que el modelo olvide contenido sensible de forma resistente a manipulacion posterior.

Arquitectura transformer decoder-only de 7.241.732.096 parametros, derivada de Zephyr-7B-beta (base Mistral), con contexto de 32.768 tokens heredado del modelo base. El repositorio ocupa 15,0 GB y contiene pesos completos en safetensors.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (base Mistral, via Zephyr-7B-beta) |
| Parametros totales | 7.241.732.096 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 32.768 tokens (heredada de Zephyr-7B-beta; no re-declarada en la model card) |
| Tipos de cuantizacion | no disponible (pesos publicados en BF16/safetensors; sin GGUF oficial) |
| Idiomas soportados | en (ingles) |
| Licencia | MIT |
| Formato de pesos | safetensors (transformers) |

## Arquitectura y entrenamiento

El modelo parte de Zephyr-7B-beta, un transformer decoder-only denso de 7B parametros con atencion por ventanas deslizantes y contexto extendido. Sobre esa base se realiza un ajuste fino de parametros completos con el entrenador `trainers.tr_tar.TARMETrainer`, que combina el objetivo MaxEnt (maximizacion de entropia sobre el conjunto de olvido) con la defensa TAR de 16 pasos internos. Se usa muestreo OPTML con coeficiente de olvido 1 y coeficiente de retencion 4, learning rate interno y externo de 1e-5, 16 muestras internas con batch interno de 1, 125 pasos de optimizador, microbatch de 40, longitud de secuencia 512, AdamW con decaimiento lineal y 12 pasos de warmup. Entrenamiento en BF16 con semillas de entrenamiento y de datos fijadas en 42.

Los datos de olvido provienen de `cais/wmdp-bio-forget-corpus` (split de entrenamiento) y los de retencion de `Salesforce/wikitext`, `wikitext-2-raw-v1` (split de test). La innovacion tecnica clave es la incorporacion de TAR (tamper-resistance) durante el propio ajuste, pensada para que el conocimiento biologico olvidado no se recupere facilmente mediante un fine-tuning posterior malicioso, manteniendo a la vez un presupuesto acotado de degradacion en tareas generales.

## Capacidades

- Generacion de texto conversacional en ingles, heredada de Zephyr-7B-beta (formato de chat con tokens `<|user|>` / `<|assistant|>`).
- Razonamiento general y conocimiento enciclopedico en dominios no biologicos (evaluado en MMLU-no-bio).
- Respuesta a instrucciones y dialogo multi-turno.
- Capacidad deliberadamente reducida en conocimiento de biologia de doble uso (objetivo del unlearning).
- Soporte de tool calling / function calling: no documentado en la model card; heredado potencialmente del base pero no verificado.
- Soporte de agentes y razonamiento multi-paso: no documentado especificamente.
- Capacidades multilingues: limitadas al ingles segun la model card.
- Capacidades especiales (vision, audio, thinking mode): no disponibles.

## Casos de uso

- Investigacion en machine unlearning: servir como checkpoint de referencia para reproducir el pipeline MaxEnt + TAR y comparar curvas de olvido/retencion frente a otras variantes (distintos K, coeficientes o presupuestos de utilidad).
- Evaluacion de robustez a relearning: usar el modelo como punto de partida en estudios que miden cuanto conocimiento biologico se recupera tras un fine-tuning adversario, dado que TAR esta disenado precisamente para resistir ese ataque.
- Estudios de bioseguridad y gobernanza de IA: analizar el trade-off entre supresion de contenido peligroso y utilidad general (42,28% en wmdp_bio_robust frente a 53,61% en mmlu_no_bio) en marcos de evaluacion de riesgo.
- Baseline en benchmarks WMDP: emplearlo como modelo "defendido" en comparaciones con el Zephyr-7B-beta original y con otros metodos de unlearning sobre el mismo corpus.
- Despliegue de un asistente conversacional en ingles con filtrado de dominio biologico: util en entornos donde se quiere un modelo generalista con menor superficie de abuso en temas de biologia, aceptando la perdida de utilidad acotada.
- Generacion de texto general en ingles para tareas no sensibles (resumen, redaccion, Q&A), dado que conserva buena parte del rendimiento de Zephyr en MMLU-no-bio.
- Docencia y divulgacion sobre unlearning: ejemplo reproducible de ajuste fino completo con hiperparametros y semillas documentadas para explicar tecnicas de supresion de conocimiento.

## Benchmarks y rendimiento

Resultados zero-shot de lm-eval para este checkpoint exacto (segun la model card):

| Tarea | Precision (%) | Error estandar (pp) |
|---|---:|---:|
| wmdp_bio_robust | 42,28 | 1,68 |
| mmlu_no_bio | 53,61 | 0,41 |

No se han publicado en la informacion disponible resultados comparativos frente a Zephyr-7B-beta original ni frente a otras variantes de unlearning, por lo que no se puede cuantificar aqui la magnitud exacta del olvido ni de la degradacion relativa.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: aproximadamente 14-15 GB solo para pesos, mas overhead de activaciones y cache KV (en la practica 16-24 GB segun longitud de contexto y batch).
- VRAM estimada en cuantizacion de 8 bits: alrededor de 8 GB de pesos; en 4 bits, alrededor de 4-5 GB (cuantizacion no publicada oficialmente, requeriria conversion propia).
- GPU recomendadas para BF16: A100 40/80 GB, H100, L40S, o consumer de 24 GB (RTX 3090, RTX 4090) con batch pequeno y contexto moderado.
- Cabe en GPU consumer: si, en RTX 3090/4090 (24 GB) en BF16 con contexto limitado, y en GPUs de 8-12 GB si se cuantiza a 4-8 bits.
- Opciones de despliegue: transformers (nativo), text-generation-inference (tag `text-generation-inference` y `endpoints_compatible`), vLLM, llama.cpp/Ollama tras conversion a GGUF propia.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (z7b-wmdp-bio-5pp-unlearn-fft-me-tar-k16) | 7,24B | 32.768 (heredado) | Unlearning MaxEnt + TAR sobre WMDP-Bio | MIT | Hugging Face |
| HuggingFaceH4/zephyr-7b-beta | ~7,24B | 32.768 | Modelo base generalista con DPO | MIT | Hugging Face |
| Otras variantes de unlearning WMDP sobre Zephyr | no disponible | no disponible | Distintos metodos/coeficientes | no disponible | no disponible |

No se dispone en la informacion proporcionada de resultados de benchmarks del modelo base ni de alternativas comparables para establecer una comparacion cuantitativa de rendimiento.

## Limitaciones y advertencias

- El olvido no es garantia de eliminacion total: wmdp_bio_robust se situa en 42,28%, lo que indica que parte de la senal biologica persiste; no debe tratarse como modelo "seguro" por si solo.
- Riesgo de alucinacion: inherente a la base Zephyr-7B-beta; el unlearning no lo mitiga y puede alterar la calibracion en dominios biologicos.
- Sesgos conocidos del modelo base (Zephyr-7B-beta) no evaluados ni corregidos en este ajuste.
- Idiomas: solo ingles declarado; el rendimiento en otros idiomas no esta verificado.
- La robustez TAR se mide frente a ataques concretos y con presupuestos definidos; su eficacia frente a ataques no contemplados en el diseno no esta garantizada.
- Restricciones de licencia: MIT permite uso comercial, pero el autor no ofrece garantias sobre idoneidad para produccion ni sobre seguridad del contenido generado.
- Presupuesto de utilidad acotado a 5 pp en MMLU-no-bio: la degradacion en otras tareas no evaluadas puede ser mayor.
- Resultados especificos de estos ajustes de entrenamiento y evaluacion; no extrapolables a otras configuraciones.
- Fecha de creacion futura (2026-10-31) en los metadatos; verificar integridad y procedencia antes de uso en produccion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mremila/z7b-wmdp-bio-5pp-unlearn-fft-me-tar-k16
- Modelo base Zephyr-7B-beta: https://huggingface.co/HuggingFaceH4/zephyr-7b-beta
- Dataset de olvido WMDP-Bio: https://huggingface.co/datasets/cais/wmdp-bio-forget-corpus
- Dataset de retencion Wikitext: https://huggingface.co/datasets/Salesforce/wikitext
- Paper WMDP (referencia del benchmark): https://arxiv.org/abs/2403.03218
- Repositorio del benchmark WMDP: https://github.com/centerforaisafety/wmdp
