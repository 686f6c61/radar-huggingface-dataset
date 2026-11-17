# mhseo2/sft_mvprestudys50_qwen3moe30b_ot3_n53105_ep10_lr8e-5_brewster-step250

## Resumen

El modelo `mhseo2/sft_mvprestudys50_qwen3moe30b_ot3_n53105_ep10_lr8e-5_brewster-step250` es un checkpoint intermedio de un ajuste fino supervisado (SFT) realizado sobre una base Qwen3. El nombre del repositorio indica que parte del checkpoint de pre-estudio por voto mayoritario `mhseo2/mvprestudy_qwen3base8b_ot3_n8_lr1e-6_kl1e-3-step50` y se entrena sobre el conjunto de trayectorias `mhseo2/sft_traj_qwen3moe30b_ot3_n53105`. Es, por tanto, un artefacto de investigación más que un modelo publicado para uso general.

El checkpoint se exportó en el paso global 250 de un entrenamiento programado a 10 épocas con parada anticipada en el paso 1500, usando el framework verl (`verl.trainer.sft_trainer_ray`) sobre 4 GPU H200 con paralelismo de secuencia 2 y paralelismo de datos 2. El nombre del autor sugiere una base Qwen3 MoE de 30B, pero el recuento real de parámetros en los pesos safetensors es de 8.190.735.360, lo que no coincide con esa etiqueta y debe tenerse en cuenta al evaluar el artefacto.

No hay model card descriptiva, licencia declarada, idiomas documentados ni resultados de benchmarks. La información disponible se limita a los metadatos del repositorio y a la cabecera técnica del README, por lo que esta ficha refleja únicamente esos datos y marca explícitamente como no disponible todo lo demás.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (base Qwen3; detalles de capas y atención no disponibles) |
| Parametros totales | 8.190.735.360 (según safetensors); el nombre del repo indica "qwen3moe30b", discrepancia no aclarada |
| Parametros activos | no disponible |
| Longitud de contexto | 32.768 tokens (max_length de entrenamiento); contexto nativo del modelo base no disponible |
| Tipos de cuantizacion | no disponible (solo se publican pesos safetensors) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (exportado de FSDP a HF con verl.model_merger) |

## Arquitectura y entrenamiento

La arquitectura subyacente es un transformer de la familia Qwen3, según la etiqueta `qwen3` del repositorio. El nombre del modelo apunta a una variante MoE de 30B, pero el recuento real de parámetros en safetensors es de aproximadamente 8,19 mil millones, por lo que la correspondencia exacta con la arquitectura base no puede confirmarse con la información disponible. El checkpoint incorpora un tokenizador y una plantilla de chat propios ("overlay tokenizer / chat template") heredados del checkpoint de pre-estudio.

El entrenamiento es un SFT sobre el conjunto `mhseo2/sft_traj_qwen3moe30b_ot3_n53105` (split de entrenamiento de 41.704 filas y validación de 256), con 10 épocas programadas, `lr` 8e-5 con decaimiento coseno (warmup 0,03, `min_lr_ratio` 0,5), weight decay 0,01, grad clipping 1,0, `train_batch` 256 y `max_length` 32.768 con `max_token_len_per_gpu` 16.384 y batch dinámico. Se ejecutó con el trainer SFT de verl sobre 4 GPU H200 (SP2 × DP2) y se detuvo en el paso 1500 (`SFT_STOP_AT_STEP=1500`), guardando cada 250 pasos; este checkpoint corresponde al paso 250. No se documentan datos sobre RLHF, DPO ni innovaciones de decodificación.

## Capacidades

- Generación de texto y ajuste por instrucciones derivado del SFT sobre trayectorias; el alcance concreto no está documentado.
- Razonamiento multi-paso potencialmente heredado del modelo base Qwen3, sin verificación publicada.
- Soporte de tool calling y function calling: no disponible en la información proporcionada.
- Capacidades de agente: no disponible.
- Capacidades multilingües: no disponible.
- Capacidades especiales (modo thinking, visión, audio): no disponible.
- Al ser un checkpoint intermedio del paso 250 de 1500, es previsible que su alineación sea parcial, pero no hay evaluación que lo confirme.

## Casos de uso

- Investigación sobre SFT y dinámica de entrenamiento: sirve como punto de comparación entre checkpoints del mismo run (pasos 250, 500, etc.) para estudiar la evolución de la pérdida y del comportamiento generativo.
- Reproducción de experimentos: permite replicar la receta (verl, SP2 × DP2, lr 8e-5 coseno, batch 256) y contrastar resultados con el checkpoint final.
- Evaluación de tokenizadores y plantillas de chat superpuestas: útil para medir el impacto del "overlay tokenizer" del pre-estudio en tareas de instrucción.
- Base para ajuste adicional en dominios concretos: al ser un SFT intermedio, puede servir de inicialización para fine-tuning específico, siempre que se resuelva la licencia.
- Estudio de conjuntos de trayectorias: el modelo permite analizar cómo el SFT sobre 41.704 filas de trayectorias afecta a la fidelidad de las respuestas.
- Docencia y experimentación con pipelines de exportación FSDP a HF: el artefacto documenta el flujo `verl.model_merger` en CPU, útil como referencia técnica.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16/bf16: aproximadamente 16,4 GB solo para pesos (coincide con el tamaño del repo), más overhead de activaciones y KV cache; en la práctica, alrededor de 20-24 GB para contextos moderados.
- VRAM estimada en cuantización de 8 bits: no disponible (no se publican pesos cuantizados); una conversión a int8 requeriría unos 8-9 GB para pesos.
- VRAM estimada en cuantización de 4 bits: no disponible; una conversión a 4 bits requeriría unos 4-5 GB para pesos.
- GPU recomendadas: H200 (usadas en el entrenamiento), A100 80 GB o H100 para reproducir el setup; para inferencia basta una RTX 4090 (24 GB) en bf16 con contexto limitado, o GPUs de 16 GB si se cuantiza.
- Cabe en GPU de consumo: sí, en RTX 4090 (24 GB) en bf16; en RTX 4080/4070 Ti (16 GB) probablemente solo con cuantización.
- Opciones de despliegue: vLLM, TGI y llama.cpp/Ollama tras conversión a GGUF; el formato publicado es safetensors, por lo que se requiere conversión para llama.cpp.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Este checkpoint (mhseo2/sft_mvprestudys50_...step250) | 8,19 B (según safetensors) | 32.768 (entrenamiento) | no disponible | Hugging Face, 0 descargas |
| Qwen3-8B (modelo base de referencia) | ~8 B | no disponible en esta ficha | no disponible | público en Hugging Face |
| Checkpoint de pre-estudio `mhseo2/mvprestudy_qwen3base8b_ot3_n8_lr1e-6_kl1e-3-step50` | no disponible | no disponible | no disponible | Hugging Face |
| Conjunto de entrenamiento `mhseo2/sft_traj_qwen3moe30b_ot3_n53105` | no aplica (dataset) | no aplica | no disponible | Hugging Face |

No se dispone de datos de rendimiento para establecer una comparación cuantitativa con alternativas de la misma categoría.

## Limitaciones y advertencias

- Checkpoint intermedio (paso 250 de 1500): no es un modelo final y su calidad de alineación es incierta.
- Discrepancia entre el nombre ("qwen3moe30b") y el recuento real de parámetros (8,19 B); conviene verificar la arquitectura antes de usarlo en producción.
- Sin licencia declarada: no hay autorización explícita para uso comercial; debe contactarse con el autor.
- Sin idiomas documentados: el comportamiento multilingüe es desconocido.
- Sin benchmarks ni evaluaciones publicadas: riesgo elevado de alucinación y de sesgos no caracterizados.
- Repositorio con 0 descargas y 0 likes: sin validación por parte de la comunidad.
- Tokenizador y plantilla de chat propios ("overlay"): pueden no ser compatibles con herramientas estándar y requerir ajustes en pipelines de inferencia.
- El tamaño del repo (16,4 GB) y el formato safetensors implican pasos de conversión para despliegues en llama.cpp u Ollama.

## Enlaces

- Hugging Face: https://huggingface.co/mhseo2/sft_mvprestudys50_qwen3moe30b_ot3_n53105_ep10_lr8e-5_brewster-step250
- Checkpoint de pre-estudio: https://huggingface.co/mhseo2/mvprestudy_qwen3base8b_ot3_n8_lr1e-6_kl1e-3-step50
- Conjunto de entrenamiento: https://huggingface.co/mhseo2/sft_traj_qwen3moe30b_ot3_n53105
- Repositorio del framework verl: https://github.com/volcengine/verl
