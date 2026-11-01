# open-sci/Qwen3-1.7B-Base-SFT-Tulu3-decontaminated-ar30k

## Resumen

El modelo `open-sci/Qwen3-1.7B-Base-SFT-Tulu3-decontaminated-ar30k` es un ajuste fino supervisado (SFT) de la familia Qwen3, desarrollado por la organizacion open-sci. Parte del checkpoint `ali-elganzory/Qwen3-1.7B-Base-SFT-Tulu3-decontaminated`, que a su vez deriva de Qwen3-1.7B-Base, y se ha entrenado sobre el dataset AceReason-1.1-SFT-30k-sharegpt-hf, un conjunto de datos orientado a razonamiento y conversacion en formato ShareGPT.

Con 1.720.050.688 parametros (aproximadamente 1,7 mil millones), se trata de un modelo compacto de generacion de texto pensado para tareas de razonamiento y dialogo. Su interes reside en ser un eslabon mas de una cadena de ajustes finos sobre Qwen3 orientada a mejorar capacidades de razonamiento mediante datos SFT, lo que lo hace relevante para quienes investigan el efecto de distintas mezclas de datos de instruccion sobre modelos pequenos.

La ficha tecnica disponible es escasa: la model card fue generada automaticamente por el Trainer de Hugging Face y no incluye descripcion funcional, resultados de evaluacion ni detalles sobre composicion del dataset. Esto limita la evaluacion objetiva del modelo fuera del contexto de investigacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Qwen3) |
| Parametros totales | 1.720.050.688 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors; cuantizaciones GGUF/AWQ no publicadas por el autor) |
| Idiomas soportados | no disponible |
| Licencia | other |
| Formato de pesos | safetensors |
| Tamano del repositorio | 3,5 GB |
| Modelo base | ali-elganzory/Qwen3-1.7B-Base-SFT-Tulu3-decontaminated |
| Framework de entrenamiento | LLaMA-Factory (full fine-tuning) |

## Arquitectura y entrenamiento

El modelo emplea la arquitectura de Qwen3, un transformer decoder-only denso. No se dispone de informacion adicional sobre configuracion de capas, dimensiones ocultas o mecanismos de atencion especificos en la documentacion proporcionada. Al ser un ajuste fino completo (full fine-tuning, no LoRA), todos los parametros del modelo base fueron actualizados durante el entrenamiento.

El entrenamiento se realizo sobre el dataset `/gpfs/scratch/ehpc524/ot/datasets/AceReason-1.1-SFT-30k-sharegpt-hf_thinking_preprocessed`, con los siguientes hiperparametros: learning rate de 4e-05, batch size total de 128 (batch de 1 por dispositivo, 32 dispositivos, 4 pasos de acumulacion de gradiente), 5 epocas, scheduler coseno con warmup del 10%, optimizador AdamW fused con betas (0,9; 0,999) y epsilon 1e-08, semilla 42. El entrenamiento se ejecuto con Transformers 4.57.3, PyTorch 2.10.0+cu128, Datasets 4.8.4 y Tokenizers 0.22.2. No se documenta el numero total de tokens de entrenamiento ni la composicion detallada del dataset mas alla de su nombre.

## Capacidades

- Generacion de texto conversacional en formato multi-turno (el modelo se declara como `conversational`).
- Razonamiento: el dataset de entrenamiento (AceReason) y el sufijo `thinking_preprocessed` sugieren orientacion a trazas de razonamiento, aunque no se documenta formalmente un modo thinking.
- Ajuste fino sobre datos SFT tipo ShareGPT, lo que implica capacidad de seguir instrucciones en formato de dialogo.
- Soporte de tool calling / function calling: no disponible (no documentado).
- Soporte de agentes y razonamiento multi-paso: no documentado.
- Capacidades multilingues: no disponible (el sufijo `ar30k` podria sugerir datos en arabe, pero no se confirma en la documentacion).
- Capacidades de vision o audio: no disponibles.
- Modo thinking explicito: no confirmado en la documentacion.

## Casos de uso

- Investigacion sobre ajuste fino SFT: el modelo sirve como punto de referencia para estudiar el efecto de datos de razonamiento (AceReason) sobre un Qwen3-1.7B previamente ajustado con datos Tulu3, comparando checkpoints de la cadena.
- Generacion de texto conversacional en entornos de recursos limitados: con 1,7 mil millones de parametros, puede desplegarse en una unica GPU consumer para prototipos de chatbots.
- Experimentos de destilacion: al ser un modelo pequeno entrenado con datos de razonamiento, puede usarse como alumno en pipelines de destilacion desde modelos mayores.
- Evaluacion de contaminacion de datasets: el nombre del modelo base (`decontaminated`) y la cadena de ajustes lo hacen util para estudiar el impacto de la descontaminacion en el rendimiento.
- Generacion de datos sinteticos: puede emplearse para producir respuestas de referencia en la construccion de datasets SFT adicionales.
- Pruebas de infraestructura de despliegue: su tamano compacto (3,5 GB en safetensors) permite validar pipelines con vLLM o TGI antes de escalar a modelos mayores.

## Benchmarks y rendimiento

La model card declara un unico `model-index` con el nombre `sft__AceReason-1-1-SFT-30k-sharegpt-hf__Qwen3-1-7B-1763123d__sdpa-qwen3-steps__Qwen3-1.-a145aa6d`, pero la lista de resultados esta vacia. No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16/FP16: aproximadamente 3,5 GB solo para pesos, mas overhead de activaciones y cache KV (estimacion practica de 6-8 GB para contextos moderados).
- VRAM estimada en cuantizacion de 8 bits: alrededor de 2 GB para pesos.
- VRAM estimada en cuantizacion de 4 bits: alrededor de 1 GB para pesos.
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM para BF16 (RTX 3060 Ti, RTX 4060 Ti, RTX 4070, RTX 4090, A10, L4). Para 4 bits, cabe en GPUs de 4-6 GB.
- Cabe en GPU consumer: si, practicamente en toda la gama media y alta actual.
- Opciones de despliegue: transformers (libreria nativa), text-generation-inference (declarado en tags), vLLM, llama.cpp y Ollama (requiere conversion a GGUF, no publicada por el autor).
- Latencia y throughput: no disponibles (no publicados).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| open-sci/Qwen3-1.7B-Base-SFT-Tulu3-decontaminated-ar30k | 1,72 B | no disponible | other | Hugging Face |
| ali-elganzory/Qwen3-1.7B-Base-SFT-Tulu3-decontaminated (modelo base) | ~1,72 B | no disponible | no disponible | Hugging Face |
| Qwen/Qwen3-1.7B (modelo original de la familia) | ~1,72 B | no disponible en esta ficha | Apache 2.0 (segun familia Qwen3) | Hugging Face |

No se dispone de datos de rendimiento comparativo entre estos modelos en la informacion proporcionada. Las diferencias se limitan al proceso de ajuste fino y la mezcla de datos de entrenamiento.

## Limitaciones y advertencias

- La model card fue generada automaticamente y no documenta usos previstos, limitaciones ni composicion del dataset; la evaluacion del modelo queda por tanto incompleta.
- No hay resultados de benchmarks publicados, por lo que no es posible verificar mejoras respecto al modelo base.
- Licencia `other`: no se especifican terminos de uso comercial; es necesario consultar el repositorio y la licencia del modelo base (Qwen3) antes de cualquier despliegue productivo.
- Riesgo de alucinacion inherente a modelos de 1,7 B de parametros, especialmente en tareas de razonamiento complejo.
- Idiomas soportados no documentados; el sufijo `ar30k` no se acompana de explicacion y no debe interpretarse como soporte confirmado de arabe.
- Sin informacion sobre sesgos, filtrado de datos o alineacion (RLHF/DPO); el ajuste es exclusivamente SFT.
- Modelo de investigacion con 162 descargas y 0 likes en el momento de la consulta; no hay evidencia de uso en produccion ni validacion externa.
- No se publican cuantizaciones GGUF ni AWQ, lo que limita el despliegue en entornos de bajos recursos sin conversion manual.

## Enlaces

- Hugging Face: https://huggingface.co/open-sci/Qwen3-1.7B-Base-SFT-Tulu3-decontaminated-ar30k
- Modelo base: https://huggingface.co/ali-elganzory/Qwen3-1.7B-Base-SFT-Tulu3-decontaminated
- Familia Qwen3 (modelo original): https://huggingface.co/Qwen/Qwen3-1.7B
- LLaMA-Factory (framework de entrenamiento): https://github.com/hiyouga/LLaMA-Factory
