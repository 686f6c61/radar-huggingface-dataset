# Madhuuu373/tulu-dpo-1b-muon-1e-5

## Resumen

Tülu DPO 1.7B — Muon es un modelo de lenguaje de 1.701 mil millones de parámetros resultado de un experimento controlado de ajuste por preferencias (DPO) sobre el checkpoint SFT `blumodel_step_11590`. Lo desarrolla el usuario Madhuuu373 como una de las dos ramas de una ablación comparativa entre el optimizador Muon y AdamW: ambas ramas comparten datos, semilla, lotes, puntuaciones de referencia y calendario de entrenamiento, y solo difieren en el optimizador del cuerpo del modelo y su tasa de aprendizaje. El modelo base es `navingv/fullchess`, un transformer de 28 capas con arquitectura tipo Qwen3, y el objetivo del trabajo es aislar el efecto del optimizador en la fase de DPO.

La relevancia del artefacto es metodológica más que de rendimiento: publica métricas paso a paso, el estado completo del optimizador y una comparación honesta entre ambas ramas que el propio autor califica de empate estadístico. No se han publicado evaluaciones de capacidades (MMLU, HumanEval, GSM8K) ni de seguridad, por lo que debe tratarse como un checkpoint de investigación, no como un modelo listo para producción.

El modelo se distribuye en dos formatos: `hf/` con pesos safetensors estándar para inferencia y evaluación, y `dcp/` con el checkpoint nativo de BluTrain que incluye el estado del optimizador para reanudar el entrenamiento. El idioma declarado es únicamente inglés.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only tipo Qwen3 (`Qwen3ForCausalLM`), 28 capas, d_model 2304, 18 cabezas de consulta / 6 de clave-valor, head_dim 128, SwiGLU 6144, embedding atado |
| Parametros totales | 1.701 B (1.585 B en las 168 matrices del cuerpo, 93,2%) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (el empaquetado de secuencias usa T=4096 durante el entrenamiento) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (ingles) |
| Licencia | ODC-BY |
| Formato de pesos | safetensors (`hf/`) y checkpoint BluTrain DCP con estado del optimizador (`dcp/`, 17,5 GB) |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only denso con 28 capas, dimensión de modelo 2304, 18 cabezas de consulta y 6 de clave-valor (GQA), dimensión de cabeza 128, FFN SwiGLU de 6144 y embedding atado. La inicialización y la política de referencia del DPO son el mismo checkpoint SFT `blumodel_step_11590`, cuyo preentrenamiento partió de `navingv/fullchess` (paso 22.600, aproximadamente 22,6B tokens, entrenado con Muon + AdamW). El tokenizador es tiktoken `gpt2` v0.14.0 con vocabulario 50304 y EOS = PAD = 50256.

El entrenamiento DPO consistió en 1 época, 9.517 pasos con 32 pares por paso (batch 2 × acumulación 16), β = 5, calentamiento lineal del 10% y decaimiento lineal hasta 0. En esta rama, Muon optimiza las 168 matrices del cuerpo con tasa 1e-5 y AdamW optimiza el embedding atado y todas las escalas 1-D con tasa 2e-6. Los datos provienen de `Madhuuu373/tulu-dpo-1b-seqpack-T4096`, derivado de `Jade-18-Rohitha/tulu-dpo-1b-data` y, en última instancia, de `allenai/olmo-2-0425-1b-preference-mix`. Las puntuaciones de referencia se calcularon con `compute_ref_logprobs_seqpack.cpp`. El paso 0 de ambas ramas produjo exactamente ln 2 = 0,693147, lo que confirma la coherencia entre política, referencias y datos.

La innovación destacable es el uso de Muon (ortogonalización de gradientes) en el cuerpo del modelo durante DPO, con un recorte de gradiente asimétrico entre ramas: `ShardedMuon` no aplica el coeficiente de recorte a tensores ortogonalizados, de modo que aproximadamente el 93% de la rama Muon queda sin recortar mientras la rama AdamW se recorta en su totalidad. Las normas de gradiente oscilaron entre 5 y 28 frente a un umbral de 1,0, un detalle no menor para interpretar la comparación.

## Capacidades

- Generación de texto autoregresiva en inglés con plantilla de chat `tulu-plain-v1` (marcadores en texto plano, no tokens especiales).
- Conversación multi-turno y con prefijo de sistema, verificado que la plantilla reproduce exactamente los identificadores de token del entrenamiento.
- Ajuste por preferencias (DPO) sobre el checkpoint SFT, orientado a alinear respuestas con pares elegido/rechazado.
- Razonamiento e instrucciones generales heredados del SFT y del preentrenamiento, sin evaluación publicada que lo cuantifique.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: limitadas al inglés declarado.
- Capacidades especiales (thinking mode, visión, audio): no disponibles.

## Casos de uso

- Investigación sobre optimizadores en DPO: reproducir la ablación Muon vs AdamW usando el checkpoint `dcp/` con `BLU_CKPT_LOAD=1` y comparar curvas de pérdida, margen y deriva de log-probabilidades paso a paso con `training_metrics.csv`.
- Reanudación exacta de entrenamiento: cargar `dcp/` en BluTrain para continuar desde el paso 9.517 con maestros fp32, momentos de Adam y momento de Muon intactos, o para ramificar una nueva ejecución.
- Auditoría de estados de optimizador: inspeccionar qué hacía Muon en cada matriz del cuerpo durante el DPO, útil para estudiar la dinámica de ortogonalización en modelos pequeños.
- Experimentos de alineación a pequeña escala: servir como punto de partida para DPO con otros datasets de preferencias en inglés, dado su tamaño manejable y su plantilla de chat verificada.
- Evaluación de retención de capacidades tras DPO: comparar el modelo con su SFT de origen en tareas de instrucciones para medir el coste del ajuste por preferencias.
- Generación de texto en inglés para prototipos y demos: con el subdirectorio `hf/` y `transformers`, en `bfloat16`, para pruebas de chat multi-turno sin requisitos de producción.
- Estudio de robustez ante cadenas adversarias: la limitación conocida con `<|endoftext|>` en mensajes de usuario permite analizar discrepancias entre tokenización de entrenamiento e inferencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de capacidades (MMLU, HumanEval, GSM8K, etc.) en la información disponible. El autor lo indica explícitamente: solo se reporta el objetivo de validación de DPO.

| Metrica (validacion DPO) | Muon lr 1e-5 | AdamW lr 2e-6 |
|---|---|---|
| Pérdida de validación | 0,61811 | 0,61958 |
| Precisión | 0,6973 | 0,6932 |
| Margen | +0,5888 | +0,5070 |
| Deriva de log-prob del elegido | −0,1462 | −0,1446 |
| Memoria pico | 83,6 GiB | 100,5 GiB |
| ms/paso | 1.830 | 1.659 |

El propio autor interpreta la diferencia de pérdida (0,0015) como un empate: equivale a aproximadamente 0,08 veces el ruido entre ejecuciones (~0,019 medido en la etapa SFT) y el liderato cambió de manos cuatro veces durante el experimento. Las diferencias reproducibles están en el coste: Muon requiere unos 17 GiB menos de memoria (sin segundo momento) y aproximadamente un 10% más de tiempo por paso.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada. Con 1.701B parámetros, en `bfloat16` los pesos ocupan aproximadamente 3,4 GB; en `fp32`, unos 6,8 GB, sin contar caché KV ni overhead del runtime.
- GPU recomendadas: no especificadas por el autor. Por tamaño, una GPU consumer de 8-12 GB debería alojar los pesos en `bfloat16`; no hay datos de latencia ni throughput publicados.
- Cabe en GPU consumer: previsiblemente sí por tamaño de pesos, pero no hay confirmación ni mediciones en la información disponible.
- Opciones de despliegue: `transformers` con `AutoModelForCausalLM` (subdirectorio `hf/`, `torch_dtype="bfloat16"`). El autor menciona vLLM y lighteval/olmes como herramientas de evaluación compatibles. No se confirma soporte de llama.cpp, Ollama ni TGI.
- Entrenamiento: la rama Muon alcanzó 83,6 GiB de memoria pico y 1.830 ms/paso, lo que implica hardware de clase A100/H100 de 80 GB o superior para reproducir el entrenamiento.
- Latencia y throughput de inferencia: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Tülu DPO 1.7B — Muon (este) | 1,701 B | no disponible | ODC-BY | Rama Muon de la ablación; sin benchmarks de capacidades |
| Tülu DPO 1.7B — AdamW (`Madhuuu373/tulu-dpo-1b-adamw-2e-6`) | 1,701 B | no disponible | ODC-BY | Rama AdamW; pérdida de validación 0,61958, 100,5 GiB pico, 1.659 ms/paso |
| `navingv/fullchess` (base preentrenada) | no disponible | no disponible | no disponible | Paso 22.600, ~22,6B tokens, Muon + AdamW |
| SFT `blumodel_step_11590` | no disponible | no disponible | no disponible | Inicialización y referencia del DPO |

No se dispone de comparaciones con modelos de la misma categoría (por ejemplo, Tülu 3 1.7B u otros DPO de ~1-2B) en la información proporcionada.

## Limitaciones y advertencias

- No evaluado en benchmarks: no hay mediciones de retención de capacidades, seguimiento de instrucciones ni seguridad. El autor advierte que el DPO puede costar robustez frente a jailbreaks (Tülu 3 reporta una caída de 93,1 a 87,2 de SFT a DPO en 8B).
- Sin repetición de semilla: la diferencia entre ramas no está establecida estadísticamente; debe leerse como empate.
- Recorte de gradiente asimétrico: `ShardedMuon` no aplica el coeficiente de recorte a tensores ortogonalizados, por lo que ~93% de la rama Muon queda sin recortar frente a la rama AdamW recortada por completo; las normas de gradiente (5-28) superan ampliamente el umbral de 1,0.
- Solo inglés: el modelo no declara soporte multilingüe.
- Riesgo de alucinación: no cuantificado en la información disponible; aplicable el riesgo habitual de un modelo de 1,7B sin evaluación.
- Sesgos: no documentados por el autor.
- Limitación de tokenización: si un mensaje de usuario contiene literalmente `<|endoftext|>`, el tokenizador de HF lo interpreta como token especial (1 token) mientras el entrenamiento lo trató como texto plano (5 tokens); relevante solo con entradas adversarias.
- Licencia ODC-BY: permite uso comercial con atribución, pero al ser un checkpoint de investigación sin evaluación de seguridad, no se recomienda su despliegue en producción sin validación propia.
- El formato `hf/` no incluye estado del optimizador, por lo que no permite reanudar el entrenamiento de forma bit-exacta; para ello hay que usar `dcp/`, cargable solo por BluTrain.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Madhuuu373/tulu-dpo-1b-muon-1e-5
- Rama AdamW compañera: https://huggingface.co/Madhuuu373/tulu-dpo-1b-adamw-2e-6
- Modelo base preentrenado: https://huggingface.co/navingv/fullchess
- Checkpoint SFT de referencia: https://huggingface.co/buckets/gautam1926/checkpoints_sft/tree/blumodel_step_11590
- Dataset DPO empaquetado: https://huggingface.co/datasets/Madhuuu373/tulu-dpo-1b-seqpack-T4096
- Dataset DPO intermedio: https://huggingface.co/datasets/Jade-18-Rohitha/tulu-dpo-1b-data
- Dataset de preferencias original: https://huggingface.co/datasets/allenai/olmo-2-0425-1b-preference-mix
