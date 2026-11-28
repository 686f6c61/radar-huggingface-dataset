# ParetoQaft/looped-qat-ouro

## Resumen

Looped-qat-ouro es un conjunto de entrenamiento (training setup) publicado por el usuario ParetoQaft en Hugging Face, no un modelo final listo para inferencia en el sentido habitual. Se trata del pipeline de quantization-aware training (QAT) y supervised fine-tuning (SFT) que produce los checkpoints de la familia Ouro, un modelo basado en una arquitectura de transformer con bucles (looped transformer). El repositorio parte de un checkpoint GPTQ empaquetado (por defecto `ParetoQaft/1_4B-looped-2bit-nemotron`) y sustituye cada proyección cuantizada por un módulo QAT entrenable del paquete `l4q`, ejecuta SFT con TRL sobre el dataset Tulu-3 usando FSDP y vuelve a fusionar el resultado en un checkpoint GPTQ empaquetado.

El interés del repositorio es fundamentalmente metodológico: documenta con detalle cómo aplicar QAT sobre un modelo ya cuantizado a 2 bits con GPTQ, qué cuantizadores alternativos existen en el paquete `l4q` y cómo se gestiona el ciclo completo (preparación de modelo, datos, entrenamiento y merge). El nombre "ouro" y la etiqueta "looped-transformer" sugieren un modelo de aproximadamente 1,4 mil millones de parámetros con pesos de 2 bits, aunque el repositorio en sí no contiene una model card al uso con especificaciones cerradas de contexto, idiomas o licencia.

La relevancia actual reside en que aborda uno de los cuellos de botella prácticos de la cuantización extrema: recuperar calidad tras comprimir a 2 bits mediante entrenamiento consciente de la cuantización, en lugar de confiar solo en la cuantización post-entrenamiento. El repositorio se acompaña de otros dos: uno de cuantización post-entrenamiento (autoround) y otro de evaluación (GSM8K y OLMES con anchos de bit por bucle).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con bucles (looped transformer), según etiquetas del autor |
| Parametros totales | Aproximadamente 1,4 B (inferido del nombre del modelo base `1_4B-looped-2bit-nemotron`; no confirmado en la model card) |
| Parametros activos | No aplica (no se indica que sea MoE) |
| Longitud de contexto | 4096 tokens (longitud máxima de entrenamiento configurada en el SFT) |
| Tipos de cuantizacion | GPTQ empaquetado a 2 bits como base; módulos QAT con rejilla de 2 bits (escalas por grupo y punto cero GPTQ); cuantizadores alternativos en `l4q` |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | GPTQ empaquetado (checkpoint de entrada y salida del merge); pesos densos BF16 tras dequantizar con el repo companion |

## Arquitectura y entrenamiento

La arquitectura es un transformer con bucles ("looped transformer"): el mismo bloque se reaplica varias veces, lo que permite aumentar la profundidad efectiva sin incrementar proporcionalmente el número de parámetros. El repositorio no describe en detalle el número de bucles ni la configuración interna del modelo base, solo que se parte de un checkpoint GPTQ empaquetado de aproximadamente 1,4 B de parámetros con pesos de 2 bits.

El entrenamiento consiste en un SFT con TRL sobre el dataset Tulu-3, con FSDP en bf16. El pipeline se compone de cuatro scripts: `prepare_model.py` (descarga el checkpoint GPTQ y sustituye el código de Ouro por un backport de transformers 4.48), `prepare_data.py` (convierte Tulu-3 a JSONL, prepara el conjunto de desarrollo y aplica el chat template de Ouro con token EOS `<|im_end|>`), `train.sh` (lanza `accelerate` con FSDP y el script `train/sft.py`) y `merge.py` (fusiona el checkpoint entrenado de vuelta a GPTQ empaquetado). La pérdida se calcula solo sobre los tokens del asistente, con padding a la derecha y un máximo de 4096 tokens. Los hiperparámetros por defecto del último run completo son: learning rate 2e-5, schedule coseno, warmup del 3 %, AdamW, batch de 2 por GPU con 16 pasos de acumulación de gradiente en 4 GPUs (batch efectivo de 128).

La innovación técnica central es el cuantizador `lsq` (por defecto). Cada capa GPTQ se descomprime una vez a un peso BF16 entrenable `w`, conservando escalas por grupo y el punto cero de GPTQ. En la pasada forward se aplica `paretoq_quantizer.LsqBinaryTernaryExtension`, que redondea y recorta `w / scale` a la rejilla de 2 bits y multiplica de vuelta, usando un estimador straight-through para `w`. El gradiente de la escala (`grad_scale`) está fijado a 0, de modo que solo aprende `w`. Como se usa `--use_peft False`, también se entrenan en BF16 los embeddings, las normas, la compuerta de salida temprana (early-exit gate) y `lm_head`. El repositorio incluye además otros nueve cuantizadores alternativos (auto, autoround_style, gptql4q, bin_adapter, qa_adapter, qat_full, qlora_full, l4q_naive_full, l4q_naive_l4q_init), aunque el autor advierte que solo `lsq` se usó en los runs recientes y el resto no se re-probó en este entorno.

## Capacidades

- Generación de texto y ajuste conversacional: el SFT sobre Tulu-3 con chat template propio (`<|im_end|>` como EOS) lo orienta a diálogo multi-turno.
- Razonamiento y matemáticas: el repositorio companion de evaluación incluye GSM8K, lo que indica que el modelo se evalúa en tareas aritméticas de varios pasos.
- Evaluación con OLMES: el repo companion `looped-eval-ouro` permite evaluar con anchos de bit por bucle, lo que sugiere capacidad de ajustar la precisión por iteración del bucle.
- Entrenamiento con cuantización extrema: el modelo resultante mantiene pesos de 2 bits tras el merge, lo que habilita despliegue con huella de memoria muy reducida.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible explícitamente; el entrenamiento con Tulu-3 incluye datos de instrucciones y razonamiento, pero no se documenta capacidad agéntica.
- Capacidades multilingües: no disponible.
- Capacidades especiales (thinking mode, visión, audio): no disponible.

## Casos de uso

- Investigación en quantización extrema: el repositorio sirve como referencia reproducible para estudiar cómo el QAT recupera calidad tras cuantizar a 2 bits con GPTQ, comparando el checkpoint base `1_4B-looped-2bit-nemotron` con el resultado tras SFT.
- Reproducción de pipelines QAT: un equipo puede clonar el flujo (`prepare_model.py`, `prepare_data.py`, `train.sh`, `merge.py`) y adaptarlo a otro modelo cuantizado, ya que los monkeypatches de TRL, transformers y peft están aislados en `train/patches/`.
- Despliegue en hardware muy limitado: al mantener pesos de 2 bits tras el merge, el modelo resultante es adecuado para entornos con restricciones severas de VRAM o para inferencia en CPU, previa dequantización o uso directo del formato GPTQ.
- Evaluación comparativa de cuantizadores: el registro `QUANTIZERS` de `l4q` permite experimentar con `lsq`, `auto`, `autoround_style` y otros, midiendo el impacto en GSM8K y OLMES con el repo de evaluación.
- Ajuste fino de modelos looped: el pipeline demuestra cómo entrenar un transformer con bucles con FSDP y pérdida enmascarada solo sobre tokens del asistente, útil para quien investigue esta arquitectura.
- Generación de código y asistencia técnica: la etiqueta `code` del repositorio y el dataset Tulu-3 (que incluye datos de código) sugieren uso en tareas de programación, aunque no se documenta un benchmark específico.
- Fine-tuning eficiente en memoria: el uso de FSDP con bf16 y cuantización de 2 bits permite ajustar un modelo de 1,4 B en un número reducido de GPUs (el run de referencia usó 4 GPUs).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio menciona que el repo companion `looped-eval-ouro` realiza evaluación en GSM8K y OLMES con anchos de bit por bucle, pero no se incluyen cifras en la información proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia: con pesos de 2 bits y aproximadamente 1,4 B de parámetros, el peso del modelo ocupa del orden de 0,35 GB; sumando overhead de activaciones y KV cache, la inferencia cabe holgadamente en GPUs de consumo.
- GPU recomendadas para entrenamiento: el run de referencia usa 4 GPUs con FSDP en bf16 y batch efectivo de 128; no se especifica el modelo exacto de GPU.
- Cabe en GPU de consumo: sí, en principio, dado el tamaño y la cuantización a 2 bits; no se detalla qué modelos concretos (RTX 4090, etc.) se han probado.
- Opciones de despliegue: el checkpoint de salida es GPTQ empaquetado; para evaluación densa se usa `dequantize.py` del repo companion. No se documentan integraciones con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye modelos comparables de la misma categoría (transformers con bucles cuantizados a 2 bits) ni datos de rendimiento que permitan una comparación rigurosa.

## Limitaciones y advertencias

- El repositorio no es un modelo listo para usar: es un conjunto de entrenamiento; el checkpoint final debe generarse ejecutando el pipeline y fusionando con `merge.py`.
- Solo el cuantizador `lsq` se usó en los runs recientes; los otros nueve cuantizadores del registro no se re-probaron en este entorno y pueden no funcionar sin ajustes.
- `grad_scale` está fijado a 0 en `lsq`, por lo que las escalas no reciben gradiente; esto es intencionado pero limita la adaptación de la cuantización.
- Los cuantizadores `autoround_style` y `gptql4q` requieren variables de entorno con rutas a cachés o pesos corregidos, originalmente rutas de clúster, lo que complica la reproducibilidad.
- El cuantizador `qlora_full` es una versión antigua de QLoRA (no bitsandbytes/NF4), con base BF16 congelada y adaptador LoRA sin re-cuantizar; no se usó en los runs recientes.
- Licencia no disponible: no se puede confirmar si el uso comercial está permitido; hay que consultar al autor antes de producción.
- Idiomas soportados no disponibles: no se puede garantizar cobertura multilingüe.
- Riesgo de alucinación: inherente a los modelos de lenguaje; no se documentan mitigaciones específicas.
- Sesgos conocidos: no documentados; el dataset Tulu-3 puede introducir sesgos propios de su composición.
- Longitud de contexto limitada a 4096 tokens en entrenamiento; no se documenta extensión posterior.
- El modelo base es de 2 bits, lo que puede degradar la calidad frente a un modelo denso equivalente; el objetivo del QAT es precisamente mitigarlo, pero no hay cifras publicadas que lo cuantifiquen.

## Enlaces

- Repositorio principal: https://huggingface.co/ParetoQaft/looped-qat-ouro
- Modelo base: https://huggingface.co/ParetoQaft/1_4B-looped-2bit-nemotron
- Repo companion de cuantización post-entrenamiento: https://huggingface.co/ParetoQaft/looped-autoround-ouro
- Repo companion de evaluación: https://huggingface.co/ParetoQaft/looped-eval-ouro
- Dataset de entrenamiento: https://huggingface.co/datasets/ParetoQaft/tulu-3
