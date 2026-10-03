# Savoxism/amid-kd-8xh200-gemma2-2b-it-nnm

## Resumen

`Savoxism/amid-kd-8xh200-gemma2-2b-it-nnm` es un adaptador LoRA para `google/gemma-2-2b-it`, obtenido por destilación de conocimiento (*knowledge distillation*) desde el profesor `google/gemma-2-9b-it`. Lo publica el usuario Savoxism como checkpoint final de la fase `gemma/nnm` dentro de la ejecución de investigación `amid-kd-8xh200`. No es un modelo completo: requiere cargar el modelo base de Gemma 2 de 2B y superponer el adaptador mediante PEFT.

El interés técnico del artefacto está en el método de destilación, no en el resultado de benchmark. Se emplea una variante de divergencia KL forward sesgada (*skew forward KL*, `--type adaptive-sfkl`, α=0,05) con un regularizador NNM (ratio 0,2, K=128, 4 capas, d'=256, `--delta-threshold 0,03`) sobre 79.751 registros de respuestas generadas por el profesor a partir de `VoCuc/UltraInteract-Infer`. El entrenamiento se hizo con 8 GPU H200 en bf16 con DeepSpeed, 2.492 pasos y un único *seed*.

Es relevante como material de estudio sobre recetas de destilación LoRA a pequeña escala y sobre evaluación de adaptadores, pero sus propios números de evaluación —con un `strict-match` de 0,0447 en GSM8K y un MBPP inválido por un artefacto de tokenización— no permiten recomendarlo como sustituto del modelo base en producción. La model card reconoce explícitamente que no se evaluó ninguna línea base (ni el estudiante sin entrenar ni el profesor) y que el conjunto de *dev* procede de los propios datos de entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (heredada del modelo base `google/gemma-2-2b-it`); el artefacto publicado es un adaptador LoRA, no un modelo completo |
| Parametros totales | No disponible en la model card. El modelo base `google/gemma-2-2b-it` es de la familia "2B" (del orden de 2.600 millones de parametros); el adaptador añade LoRA r=16 sobre q/k/v/o/gate/up/down |
| Parametros activos | No aplica: no es un modelo MoE |
| Longitud de contexto | No especificada en la model card. El modelo base `google/gemma-2-2b-it` declara 8.192 tokens. El entrenamiento del adaptador uso max length 1025 y max prompt length 512 |
| Tipos de cuantizacion | No disponible para el adaptador: se publica en `adapter_model.bin` (precision de entrenamiento bf16 via base en bfloat16). No se publican versiones GGUF, AWQ ni GPTQ del adaptador |
| Idiomas soportados | No disponible en la model card (el campo de idiomas figura como no disponible). El dataset de destilacion, `VoCuc/UltraInteract-Infer`, es de instrucciones en ingles |
| Licencia | `gemma` (Gemma Terms of Use), heredada del modelo base |
| Formato de pesos | PEFT/LoRA en PyTorch (`adapter_model.bin`), mas tokenizer y configuracion PEFT. No se publican safetensors del adaptador |
| Tamano del repositorio | 0,1 GB |
| Modelo base | `google/gemma-2-2b-it` @ `299a856` |
| Modelo profesor | `google/gemma-2-9b-it` @ `11c9b30` (fp16) |
| Dataset | `VoCuc/UltraInteract-Infer` @ `3c2fb0d`, 79.751 registros de entrenamiento |
| Libreria | `peft` |
| Pipeline | `text-generation` |
| Descargas / likes | 0 / 0 en el momento de la consulta |

## Arquitectura y entrenamiento

El adaptador se monta sobre `google/gemma-2-2b-it`, un transformer decoder-only denso de la familia Gemma 2. El método de destilacion es una KL forward sesgada con regularizador NNM (`--type adaptive-sfkl`), con α=0,05, ratio NNM de 0,2, K=128, 4 capas y d'=256, y un umbral delta de 0,03. La generacion del estudiante usa umbral adaptativo que arranca en 0,0, `--loss-eps 0,1` y un *replay buffer* de 1.000 por rango. Los datos de destilacion son respuestas generadas por el profesor `gemma-2-9b-it` sobre el dataset `VoCuc/UltraInteract-Infer` (79.751 registros), lo que orienta el adaptador hacia tareas de instruccion multi-turno con estructura agentica.

La configuracion de entrenamiento es LoRA con r=16, α=32 y dropout 0,05 sobre las proyecciones q/k/v/o y gate/up/down. El optimizador es AdamW con lr 1e-4, decaimiento coseno sin *warmup*, weight decay 1e-2 y recorte de gradiente 1,0, con `--kd-ratio 1.0` (la perdida es integramente de destilacion, sin componente de *cross-entropy* supervisada indicada). Se ejecutaron 2 epocas × 1.246 pasos = 2.492 pasos con batch global 64 (8 GPU × 4 por dispositivo × 2 de acumulacion) en 8× H200 con DeepSpeed bf16, un unico seed (10). El checkpoint publicado es el paso 2.492, es decir, el final de la epoca 2, y no fue seleccionado por puntuacion de *dev*.

## Capacidades

- Generacion de texto conversacional y seguimiento de instrucciones, heredadas de `google/gemma-2-2b-it` y ajustadas sobre respuestas del profesor en `UltraInteract-Infer`.
- Razonamiento matematico basico y resolucion de problemas aritmeticos de tipo GSM8K, con `flexible-extract` de 0,4882, aunque el `strict-match` cae a 0,0447 porque el modelo no emite el marcador `#### <n>`.
- Razonamiento cientifico a nivel de pregunta de opcion multiple: 0,4821 en MMLU-STEM y 0,911 en SciQ (0-shot, `acc`).
- Generacion de codigo: la model card declara el resultado de MBPP, pero el 0.0 es invalido y no debe interpretarse como una capacidad medida.
- Formato de chat: Gemma 2 usa plantilla de chat propia; el tokenizer se publica en el repositorio del adaptador.
- Soporte de *tool calling* / *function calling*: no documentado en la model card.
- Soporte de agentes y razonamiento multi-paso: no documentado explicitamente, aunque el dataset de destilacion (`UltraInteract`, orientado a interacciones) sugiere ese sesgo; no hay evaluacion publicada que lo confirme.
- Capacidades multilingues: no documentadas para el adaptador; el dataset de destilacion es en ingles.
- Capacidades especiales (*thinking mode*, vision, audio): no disponibles.
- Es un adaptador PEFT: no funciona de forma autonoma y debe combinarse con el modelo base.

## Casos de uso

- Investigacion en destilacion de conocimiento: sirve como referencia reproducible de una receta concreta (skew forward KL + regularizador NNM) sobre un estudiante de 2B y un profesor de 9B, con hiperparametros, seed y `sha256` del `adapter_model.bin` documentados.
- Estudio de metodologia de evaluacion de adaptadores LoRA: el caso de MBPP demuestra como un artefacto de tokenizacion (`▁`, U+2581) puede invalidar por completo una metrica de codigo; es un ejemplo util para disenar pipelines de evaluacion que validen la salida antes de puntuarla.
- Analisis de metricas de destilacion: la tabla de *dev* (avg_loss 2,875 → 2,734 → 2,734; rougeL 0,41 → 2,84 → 0,87) permite discutir la discrepancia entre perdida de destilacion y calidad generativa, y el efecto del sobreajuste cuando el *dev* proviene del conjunto de entrenamiento.
- Prototipado local de asistentes conversacionales en hardware de consumo: con el modelo base en 4 bits y el adaptador de 0,1 GB, se puede desplegar un asistente de instrucciones en una GPU de 8-12 GB para pruebas internas, asumiendo calidad inferior al base.
- Experimentos de comparacion de recetas de destilacion: al existir multiples fases y checkpoints de la ejecucion `amid-kd-8xh200`, el adaptador resulta util como punto final de una curva de entrenamiento, no como modelo listo para produccion.
- Docencia y divulgacion sobre PEFT: el codigo de uso con `PeftModel.from_pretrained` y una revision fijada del modelo base es un ejemplo minimo y claro para explicar como se carga un adaptador LoRA.
- No se recomienda su uso en atencion al cliente, generacion de codigo en produccion ni pipelines de CI/CD: la model card no aporta evidencia de calidad frente al base sin entrenar y el resultado de codigo esta invalidado.

## Benchmarks y rendimiento

Evaluacion de *dev* con 200 registros (antes de entrenar → final de epoca 1 → final de epoca 2), segun la model card:

| Metrica | Antes | Epoca 1 | Epoca 2 |
|---|---|---|---|
| avg_loss | 2,875 | 2,734 | 2,734 |
| rougeL | 0,41 | 2,84 | 0,87 |
| exact_match | 0,0 | 0,0 | 0,0 |
| umbral adaptativo final | 0,0 | 0,0 | 0,0 |

Evaluacion `lm-eval` 0.4.12 sobre vLLM 0.17.1 (valor ± error estandar). GSM8K, GSM-Plus, MATH, MMLU-STEM y SciQ usan la plantilla de chat; MBPP no la usa (temperatura 0):

| Tarea | Metrica | Valor |
|---|---|---|
| GSM8K (5-shot, n=1319) | strict-match | 0,0447 ± 0,0057 |
| GSM8K (5-shot, n=1319) | flexible-extract | 0,4882 ± 0,0138 |
| MATH `minerva_math` (4-shot, n=5000) | exact_match | 0,0236 ± 0,0021 |
| MATH `minerva_math` (4-shot, n=5000) | math_verify | 0,2432 ± 0,0057 |
| GSM-Plus (5-shot, n=10552) | strict-match | 0,0172 ± 0,0013 |
| GSM-Plus (5-shot, n=10552) | flexible-extract | 0,3349 ± 0,0046 |
| MMLU-STEM (5-shot, n=3153) | acc | 0,4821 ± 0,0086 |
| SciQ (0-shot, n=1000) | acc | 0,911 ± 0,0090 |
| SciQ (0-shot, n=1000) | acc_norm | 0,782 ± 0,0131 |
| MBPP (3-shot, n=500) | pass@1 | 0,0 (invalido) |

Advertencias recogidas en la propia model card: no se evaluo ninguna linea base (ni el estudiante sin entrenar ni el profesor), por lo que estos numeros no demuestran ni ganancia ni perdida por la destilacion; solo hay un seed; el conjunto de *dev* procede de los registros de entrenamiento; y el 0,0 de MBPP es un artefacto del pipeline (499 de 500 programas generados contienen el caracter SentencePiece `▁` en lugar de espacios de indentacion), no un resultado del modelo.

## Requisitos de hardware

- VRAM estimada para inferencia (calculos orientativos a partir de un modelo base de ~2,6B parametros, no publicados por el autor): ~5,5-6,5 GB en bf16/fp16 con cache KV para contexto moderado; ~3-3,5 GB en cuantizacion de 8 bits; ~1,5-2 GB en 4 bits. El adaptador en si ocupa unos 0,1 GB adicionales.
- GPU recomendadas para el modelo base: cualquier GPU con al menos 8 GB de VRAM para cuantizacion de 4 bits; 12-16 GB para bf16 con contexto amplio.
- Cabe en GPU de consumo: si. Ejemplos razonables: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070/4080/4090, y tambien en iGPU con memoria unificada suficiente si se usa llama.cpp/Ollama con GGUF.
- GPU de datacenter usadas en el entrenamiento: 8× NVIDIA H200 con DeepSpeed en bf16. Para inferencia, A100 o H100 son sobredimensionadas para este tamano, salvo por agregacion de peticiones.
- Opciones de despliegue: vLLM con soporte LoRA (es el stack usado en la evaluacion, vLLM 0.17.1), transformers + PEFT (ruta oficial de la model card), TGI con adaptadores, y llama.cpp/Ollama solo si se fusiona el adaptador con el base y se convierte a GGUF.
- Latencia y throughput estimados: no disponibles. La model card no publica mediciones de latencia ni de tokens por segundo.

## Comparativa con modelos similares

Los datos de los modelos alternativos no proceden de la model card analizada y no se han verificado con una evaluacion propia; se incluyen como referencia de categoria.

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `Savoxism/amid-kd-8xh200-gemma2-2b-it-nnm` | Adaptador LoRA sobre base ~2,6B | No especificado en la model card (base: 8.192) | PEFT (`adapter_model.bin`) | Gemma Terms of Use | Repositorio con 0 descargas y 0 likes |
| `google/gemma-2-2b-it` (base sin adaptador) | ~2,6B | 8.192 tokens | safetensors, GGUF en la comunidad | Gemma Terms of Use | Muy extendido |
| `google/gemma-2-9b-it` (profesor) | ~9B | 8.192 tokens | safetensors, GGUF en la comunidad | Gemma Terms of Use | Muy extendido |
| Adaptadores de destilacion comparables | No disponible | No disponible | No disponible | No disponible | No se han identificado alternativas equivalentes en la informacion proporcionada |

No es posible comparar rendimiento con alternativas porque el autor no evaluo ninguna linea base y no se dispone de resultados propios del base o del profesor en este contexto.

## Limitaciones y advertencias

- No hay linea base evaluada: la model card indica expresamente que no se evaluo ni el estudiante sin entrenar ni el profesor, por lo que no puede afirmarse que la destilacion mejore al modelo base.
- Un unico seed de entrenamiento (10) y checkpoint final (paso 2.492) no seleccionado por puntuacion de *dev*: no hay evidencia de robustez entre ejecuciones.
- El conjunto de *dev* (200 registros) procede de los datos de entrenamiento, por lo que las metricas de `avg_loss` y `rougeL` miden ajuste, no generalizacion.
- Resultado invalido en MBPP: 499 de 500 programas contienen el caracter `▁` (U+2581) en lugar de espacios, un artefacto del pipeline vLLM + LoRA. No debe citarse como rendimiento en codigo.
- `strict-match` en GSM8K y GSM-Plus subestima el modelo porque las respuestas carecen del marcador `#### <n>`; la propia model card recomienda usar `flexible-extract`.
- Riesgo de alucinacion: no hay ninguna evaluacion de veracidad, y se trata de un modelo base de ~2,6B parametros, con la tasa de alucinacion esperable en esa escala.
- Sesgos conocidos: no documentados por el autor. El dataset de destilacion es en ingles y de dominio de instrucciones, lo que puede introducir sesgos de dominio e idioma.
- Limitaciones de idioma: el campo de idiomas figura como no disponible y la destilacion se hizo sobre datos en ingles; el rendimiento en castellano no esta medido.
- Limitaciones de contexto: el entrenamiento uso max length 1025 y max prompt length 512, muy por debajo del contexto del base. El comportamiento mas alla de esas longitudes no esta verificado.
- Licencia: hereda los Gemma Terms of Use. El uso comercial esta sujeto a las condiciones y a la politica de uso prohibido de Google, que deben revisarse antes de cualquier despliegue.
- Naturaleza PEFT: el adaptador no funciona de forma autonoma y requiere una revision concreta del modelo base (`299a856`). Un cambio de revision puede alterar los resultados.
- Repositorio con 0 descargas y 0 likes: sin validacion por parte de la comunidad ni mantenimiento conocido.
- Fechas del repositorio (creado y actualizado el 2026-10-03, con un segundo de diferencia): conviene verificar el estado del repositorio antes de depender de el.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Savoxism/amid-kd-8xh200-gemma2-2b-it-nnm
- Modelo base `google/gemma-2-2b-it`: https://huggingface.co/google/gemma-2-2b-it
- Modelo profesor `google/gemma-2-9b-it`: https://huggingface.co/google/gemma-2-9b-it
- Dataset `VoCuc/UltraInteract-Infer`: https://huggingface.co/datasets/VoCuc/UltraInteract-Infer
- Terminos de uso de Gemma: https://ai.google.dev/gemma/terms
- Libreria PEFT: https://github.com/huggingface/peft
- Resultados de la busqueda web: no se han encontrado enlaces relevantes al modelo. Las URLs devueltas corresponden a la plataforma comercial "Metrics That Matter" (metricsthatmatter.com, explorance.com, mctcommunity.org), sin relacion con este modelo, su dataset o su metodo de destilacion.
