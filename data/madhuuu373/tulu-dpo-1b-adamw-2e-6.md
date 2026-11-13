# Madhuuu373/tulu-dpo-1b-adamw-2e-6

## Resumen

Tülu DPO 1.7B — AdamW es un modelo de lenguaje de 1.701 mil millones de parámetros resultado de un ajuste por optimización de preferencias directas (DPO) sobre el checkpoint SFT `blumodel_step_11590`, que a su vez deriva del modelo preentrenado `navingv/fullchess`. Lo desarrolla el usuario Madhuuu373 y su propósito principal no es tanto el rendimiento final como servir de brazo de control en un experimento de ablación controlada entre los optimizadores Muon y AdamW aplicados a DPO. Ambos brazos comparten datos, semilla, lotes, puntuaciones de referencia y planificación del learning rate; solo cambian el optimizador del cuerpo del modelo y su tasa de aprendizaje.

El modelo emplea una arquitectura transformer tipo Qwen3 con 28 capas, dimensión de modelo 2304, 18 cabezas de consulta y 6 de clave-valor (GQA), dimensión de cabeza 128, activación SwiGLU con dimensión intermedia 6144 y embeddings atados. Se entrenó durante una época completa (9.517 pasos con 32 pares por paso) con AdamW a un learning rate de 2e-6, β = 5 y un esquema de calentamiento lineal del 10 % seguido de decaimiento lineal hasta cero.

Su relevancia es metodológica: proporciona un punto de comparación reproducible para estudiar el coste y la calidad de DPO según el optimizador, con métricas paso a paso publicadas y checkpoints completos que incluyen el estado del optimizador. No obstante, el propio autor advierte que la diferencia de pérdida de validación frente al brazo Muon (0.61958 frente a 0.61811) está por debajo del ruido entre ejecuciones, por lo que no debe interpretarse como una victoria de ninguno de los dos optimizadores.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only tipo Qwen3 (Qwen3ForCausalLM), GQA, SwiGLU, embeddings atados |
| Parámetros totales | 1.701 B |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (el empaquetado de datos usa T=4096, pero no se declara la ventana máxima del modelo) |
| Tipos de cuantización | no disponible (pesos publicados en safetensors bfloat16; no se documentan cuantizaciones GGUF/AWQ/GPTQ) |
| Idiomas soportados | inglés (`en`) |
| Licencia | ODC-BY |
| Formato de pesos | safetensors (`hf/`) y checkpoint BluTrain DCP con estado del optimizador (`dcp/`) |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only de 28 capas con dimensión 2304, 18 cabezas de consulta y 6 de clave-valor (atención con consultas agrupadas), dimensión de cabeza 128, FFN SwiGLU de 6144 y embeddings atados. El tokenizador es tiktoken `gpt2` v0.14.0 con vocabulario de 50304 y EOS = PAD = 50256. La plantilla de chat `tulu-plain-v1` usa marcadores en texto plano (`<|system|>`, `<|user|>`, `<|assistant|>`, `<|endoftext|>`) en lugar de tokens especiales, y el `chat_template.jinja` incluido reproduce exactamente los identificadores de token del entrenamiento en conversaciones ordinarias, con prefijo de sistema y multi-turno.

El entrenamiento parte del checkpoint SFT `blumodel_step_11590` (huella `0x615df7590074060e`), que actúa simultáneamente como inicialización y como política de referencia. Los datos de preferencia proceden de `Madhuuu373/tulu-dpo-1b-seqpack-T4096`, derivado de `Jade-18-Rohitha/tulu-dpo-1b-data` y en última instancia de `allenai/olmo-2-0425-1b-preference-mix`. Se realizó una época (9.517 pasos, 32 pares por paso con lote de 2 y acumulación de 16, β = 5) con AdamW sobre todos los parámetros a learning rate 2e-6, calentamiento lineal del 10 % y decaimiento lineal a cero. El paso 0 de ambas ejecuciones produjo exactamente ln 2 = 0.693147, lo que confirma la coherencia entre política, puntuaciones de referencia y datos. El checkpoint DCP conserva los pesos maestros en fp32 y los momentos de Adam, lo que permite reanudar el entrenamiento de forma bit a bit; el subdirectorio `hf/` contiene solo pesos.

## Capacidades

- Generación de texto conversacional en inglés con plantilla de chat verificada contra los identificadores de token del entrenamiento.
- Ajuste por preferencias (DPO) orientado a alineación de respuestas, aunque sin evaluación de retención de capacidades publicada.
- Razonamiento e instrucciones generales heredados del modelo base y del SFT, no medidos en esta ficha.
- Soporte de tool calling / function calling: no disponible (no documentado).
- Soporte de agentes y razonamiento multi-paso: no disponible (no documentado).
- Capacidades multilingües: limitadas al inglés según la model card.
- Capacidades especiales (modo thinking, visión, audio): no disponibles.
- Reanudación exacta del entrenamiento y auditoría del optimizador mediante el checkpoint DCP.

## Casos de uso

- Investigación sobre optimizadores en DPO: el modelo sirve como brazo AdamW de una ablación controlada frente a Muon, con métricas paso a paso (`training_metrics.csv`) y estado del optimizador para reproducir o ramificar el experimento.
- Reproducción de experimentos de alineación: al incluir el checkpoint DCP con pesos maestros fp32 y momentos de Adam, permite continuar el entrenamiento desde el paso 9.517 con `BLU_CKPT_LOAD=1` y comparar curvas de pérdida, margen y precisión.
- Evaluación de retención de capacidades tras DPO: el modelo es un punto de partida para medir instruction following, robustez frente a jailbreak y seguridad, aspectos que el autor deja explícitamente sin evaluar.
- Generación de texto en inglés en prototipos: con 1.701 B de parámetros y pesos bfloat16, puede desplegarse en una GPU consumer de gama alta para experimentación con la plantilla `tulu-plain-v1`.
- Estudio de dinámica de entrenamiento: las métricas por paso (grad norm, learning rate, tok/s, memoria) permiten analizar el efecto del recorte de gradientes asimétrico entre brazos, una limitación documentada del experimento.
- Base para ajuste fino posterior: el subdirectorio `hf/` en safetensors es adecuado para continuar el entrenamiento con transformers, evaluar con lighteval/olmes o servir con vLLM.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor indica explícitamente que el modelo no ha sido evaluado en benchmarks y que solo se reporta el objetivo de validación de DPO.

| Métrica (validación DPO) | AdamW lr 2e-6 | Muon lr 1e-5 |
|---|---|---|
| Pérdida de validación | 0.61958 | 0.61811 |
| Precisión | 0.6932 | 0.6973 |
| Margen | +0.5070 | +0.5888 |
| Deriva de logp_chosen | −0.1446 | −0.1462 |
| Memoria pico | 100.5 GiB | 83.6 GiB |
| ms/paso | 1.659 | 1.830 |

La diferencia de pérdida (0.0015) es aproximadamente 0.08 veces el ruido entre ejecuciones medido en la etapa SFT (~0.019), y el liderazgo cambió de manos cuatro veces durante el experimento, por lo que el autor lo interpreta como un empate en calidad y no como una ventaja de AdamW.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; con 1.701 B de parámetros en bfloat16 los pesos ocupan aproximadamente 3,4 GB, a los que hay que sumar caché KV y overhead del runtime.
- GPU recomendadas: no documentadas por el autor; por tamaño, una RTX 4090 (24 GB) o superior debería alojar el modelo en bfloat16 con margen amplio.
- Cabe en GPU consumer: sí, previsiblemente en tarjetas con 8 GB o más en bfloat16 o cuantizado, aunque no se publican requisitos oficiales.
- Opciones de despliegue: transformers (ejemplo oficial con `AutoModelForCausalLM` y `subfolder="hf"`), vLLM y lighteval/olmes mencionados por el autor; llama.cpp, Ollama y TGI no están documentados.
- Latencia y throughput: no disponibles para inferencia. En entrenamiento, el brazo AdamW registró 1.659 ms/paso y 100.5 GiB de memoria pico, frente a 1.830 ms/paso y 83.6 GiB del brazo Muon.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Tülu DPO 1.7B — AdamW (este) | 1.701 B | no disponible | ODC-BY | Hugging Face, safetensors + DCP | Brazo AdamW de la ablación; sin benchmarks |
| Tülu DPO 1.7B — Muon | 1.701 B | no disponible | no disponible | Hugging Face | Brazo Muon; pérdida de validación 0.61811, 83.6 GiB pico |
| navingv/fullchess (base preentrenada) | no disponible | no disponible | no disponible | Hugging Face | Base preentrenada, paso 22.600, ~22.6B tokens |
| Modelos Tülu 3 de AllenAI (8B/70B) | 8 B / 70 B | no disponible | no disponible | Hugging Face | Referencia de alineación DPO citada por el autor; no comparable en tamaño |

## Limitaciones y advertencias

- No evaluado en benchmarks: no se miden retención de capacidades, instruction following ni seguridad; los números de validación DPO no son comparables con resultados publicados de modelos de 8B o 70B.
- Sin repetición con semilla: la diferencia entre brazos no está establecida estadísticamente.
- Recorte de gradientes asimétrico entre brazos: `ShardedMuon` no aplica el coeficiente de recorte a tensores ortogonalizados, de modo que ~93 % del brazo Muon queda sin recortar mientras el brazo AdamW se recorta en todo momento; las normas de gradiente oscilaron entre 5 y 28 frente a un umbral de 1.0.
- Riesgo de alucinación: no documentado, pero inherente a un modelo de 1.7B sin evaluación de fidelidad.
- Sesgos: no documentados; el entrenamiento usa datos de preferencia en inglés, lo que puede introducir sesgos culturales y lingüísticos no medidos.
- Idioma: solo inglés; no se declara soporte multilingüe.
- Licencia ODC-BY: permite uso comercial con atribución, pero conviene revisar las condiciones de los datos de preferencia de origen (`allenai/olmo-2-0425-1b-preference-mix`).
- Limitación de la plantilla de chat: si un mensaje de usuario contiene literalmente `<|endoftext|>`, el tokenizador de HF lo interpreta como token especial (1 token) mientras el entrenamiento lo trató como texto plano (5 tokens); relevante solo para entradas adversarias.
- Los pesos de `hf/` no incluyen estado del optimizador, por lo que no permiten reanudar el entrenamiento de forma bit a bit; para ello hay que usar `dcp/` (23,8 GB) con BluTrain.
- Contexto máximo no declarado: el empaquetado de secuencias usa T=4096, pero no se especifica la ventana de contexto soportada en inferencia.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Madhuuu373/tulu-dpo-1b-adamw-2e-6
- Brazo Muon: https://huggingface.co/Madhuuu373/tulu-dpo-1b-muon-1e-5
- Modelo base preentrenado: https://huggingface.co/navingv/fullchess
- Checkpoint SFT: https://huggingface.co/buckets/gautam1926/checkpoints_sft/tree/blumodel_step_11590
- Dataset DPO empaquetado: https://huggingface.co/datasets/Madhuuu373/tulu-dpo-1b-seqpack-T4096
- Dataset DPO intermedio: https://huggingface.co/datasets/Jade-18-Rohitha/tulu-dpo-1b-data
- Dataset de preferencias original: https://huggingface.co/datasets/allenai/olmo-2-0425-1b-preference-mix
