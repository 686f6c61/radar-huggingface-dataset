# CHOI0126/slmfim-pilot-cl100k-pt-fim50-step4000

## Resumen
El modelo `slmfim-pilot-cl100k-pt-fim50-step4000` es un checkpoint intermedio de preentrenamiento publicado por el usuario CHOI0126 en Hugging Face. Forma parte de un estudio interno denominado slm-fim, cuyo objetivo es investigar el entrenamiento de modelos de lenguaje pequenos con Fill-in-the-Middle (FIM) aplicado a documentos de codigo. No se trata de un modelo final ni de un modelo listo para produccion, sino de una instantanea del estado de entrenamiento en el paso 4.000 de un total previsto de 23.841.

La arquitectura declarada es Qwen3.5-2B de tipo texto, descrita como un transformer hibrido con Gated DeltaNet en proporcion 3:1 respecto a atencion GQA con compuertas. Cuenta con 1.370 millones de parametros no pertenecientes a embeddings mas 210 millones de embedding atado, lo que situa el total en torno a 1.580 millones. El tokenizador empleado es cl100k con 100.352 identificadores, y el contexto de entrenamiento es de 4.096 tokens por secuencia.

Su relevancia es limitada y muy especifica: sirve como referencia para quien quiera reproducir, continuar o auditar el estudio slm-fim, no como modelo de proposito general. El checkpoint se ha detenido de forma deliberada con `--stop-at 4000` tras consumir 4.190 millones de tokens de un total planificado de 25.000 millones, por lo que su calidad esta muy por debajo de la de un modelo entrenado por completo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer hibrido Qwen3.5-2B: Gated DeltaNet 3:1 con GQA con compuertas |
| Parametros totales | ~1.580 millones (1.370 M no-embedding + 0.210 M embedding atado) |
| Parametros activos | no disponible (no se declara como MoE) |
| Longitud de contexto | 4.096 tokens (longitud de secuencia de entrenamiento) |
| Tipos de cuantizacion | no disponible (export en bf16) |
| Idiomas soportados | no disponibles |
| Licencia | no disponible |
| Formato de pesos | safetensors (export HF `Qwen3_5ForCausalLM`, bf16) y `state.pt` para reanudacion |

## Arquitectura y entrenamiento
El modelo sigue la arquitectura Qwen3.5-2B, que combina capas Gated DeltaNet y capas de atencion GQA con compuertas en una proporcion 3:1. El checkpoint se entrena con el tokenizador cl100k (100.352 identificadores) sobre un flujo de datos de preentrenamiento en el que el 50 % de los documentos de codigo se han transformado con FIM, usando una mezcla PSM:SPM de 1:1. La configuracion de optimizacion es AdamW con LR constante de 5e-4 tras un calentamiento del 1 %, batch global de 1.048.576 tokens (256 secuencias de 4.096) y un total previsto de 23.841 pasos.

El checkpoint publicado corresponde al paso 4.000, es decir, 4.190 millones de tokens consumidos de los 25.000 millones planificados. El autor indica que el mismo entrenamiento continuara mas adelante, y que el orden de los datos depende unicamente del numero de paso, por lo que reanudar con un numero distinto de GPU produce los mismos lotes. El repositorio incluye el estado completo de reanudacion (`state.pt` con modelo, estado de AdamW, paso y reloj), la configuracion (`args.json`), el registro de entrenamiento (`log.jsonl`) y un script `restore.sh` para reconstruir la ruta esperada por el pipeline.

## Capacidades
- Generacion de texto autoregresiva basica, limitada por el estado temprano del preentrenamiento.
- Relleno de codigo (FIM) en formatos PSM y SPM, al haber sido entrenado con FIM al 50 % sobre documentos de codigo.
- No se declara soporte de tool calling ni function calling.
- No se declara soporte de agentes ni razonamiento multi-paso.
- Capacidades multilingues: no disponibles.
- No se declaran modos especiales (thinking, vision, audio).

## Casos de uso
- Investigacion sobre FIM: el checkpoint permite estudiar como evoluciona la capacidad de rellenar codigo a lo largo del preentrenamiento comparando este paso 4.000 con snapshots posteriores del mismo estudio.
- Reproducibilidad de experimentos: al incluir `state.pt`, `args.json`, `log.jsonl` y `restore.sh`, sirve para replicar exactamente el estado de entrenamiento y verificar la curva de perdida y el BPB de validacion.
- Reanudacion de entrenamiento: el autor documenta como continuar el run con `python scripts/pipeline.py run --gpus 8 --tokenizers cl100k --stages pt`, usando el mismo flujo de tokens `DATA/tok/cl100k/pt_fim50.bin`.
- Evaluacion de arquitecturas hibridas: util para medir el comportamiento de la mezcla Gated DeltaNet/GQA en tareas de codigo a baja escala antes de invertir en runs completos.
- Pruebas de integracion con vLLM: el export HF en bf16 con clase `Qwen3_5ForCausalLM` permite validar pipelines de inferencia y herramientas de evaluacion sobre un modelo de ~1.6B parametros.
- Docencia y experimentacion con tokenizadores: permite comparar el comportamiento de cl100k frente a otros tokenizadores en el mismo flujo de datos y misma arquitectura.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la informacion disponible. El autor unicamente reporta metricas de validacion internas en el paso 4.000:

| Metrica (validacion, paso 4.000) | Valor |
|---|---|
| BPB en codigo | 0.442 |
| BPB en lenguaje natural | 0.982 |
| BPB en FIM | 0.380 |

## Requisitos de hardware
- VRAM estimada para inferencia en bf16: en torno a 3,2 GB solo para pesos (1.580 M parametros x 2 bytes), mas overhead de activaciones y cache KV; en la practica, 6-8 GB en bf16 para contextos de 4.096 tokens.
- En cuantizacion de 8 bits cabria en GPUs consumer con 4-6 GB; en 4 bits, en torno a 2-3 GB, aunque no se han publicado ficheros GGUF ni cuantizaciones oficiales.
- GPU recomendadas: cualquier GPU con al menos 8 GB para bf16 (RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4090, L4, A10). Para entrenamiento o reanudacion se requiere mucha mas memoria: el estado de AdamW completo anade aproximadamente el doble de los pesos en fp32, y el autor documenta runs con 8 GPUs.
- Opciones de despliegue: vLLM es la via indicada por el autor para el export HF; llama.cpp u Ollama requeririan conversion a GGUF no publicada. TGI no se menciona.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares
No se dispone de datos de rendimiento de este checkpoint frente a alternativas, y su naturaleza de snapshot intermedio hace que la comparacion con modelos finales no sea homogenea. Se ofrece una comparacion estructural con modelos de tamano y proposito cercanos:

| Modelo | Parametros | Contexto | FIM | Licencia | Estado |
|---|---|---|---|---|---|
| slmfim-pilot-cl100k-pt-fim50-step4000 | ~1,58 B | 4.096 | Si (50 % en codigo, PSM:SPM 1:1) | no disponible | Checkpoint intermedio (paso 4.000/23.841) |
| Qwen2.5-Coder-1.5B | 1,5 B | 32.768 | Si (FIM soportado) | Apache 2.0 | Modelo final |
| StarCoder2-3B | 3 B | 16.384 | Si | BigCode OpenRAIL-M | Modelo final |
| DeepSeek-Coder-1.3B | 1,3 B | 16.384 | Si | DeepSeek License | Modelo final |

La comparacion debe tomarse con cautela: los tres modelos de referencia estan entrenados por completo (del orden de billones de tokens) y publican benchmarks, mientras que este checkpoint solo ha visto 4.190 millones de tokens y no declara licencia ni idiomas.

## Limitaciones y advertencias
- Es un checkpoint de preentrenamiento detenido en el 16,8 % del plan (paso 4.000 de 23.841), por lo que su calidad generativa es muy inferior a la de un modelo terminado y no deberia usarse en produccion.
- No se ha aplicado alineamiento posterior (RLHF, DPO ni SFT), segun la informacion disponible; cabe esperar respuestas incoherentes o repetitivas fuera de tareas de continuacion de texto y codigo.
- La licencia no esta declarada, lo que impide determinar si se permite uso comercial; debe contactarse con el autor antes de cualquier uso fuera de investigacion.
- No se declaran idiomas soportados; el tokenizador cl100k esta orientado a ingles y codigo, con cobertura limitada del castellano.
- Riesgo de alucinacion y de sesgos desconocido: no se han publicado evaluaciones de seguridad, sesgo ni toxicidad.
- El contexto efectivo es de 4.096 tokens; no se ha validado extrapolacion a ventanas mayores.
- El repositorio ocupa 22,1 GB porque incluye el estado completo de optimizacion; no es un artefacto ligero para despliegue.
- La fecha de creacion indicada (2026-11-10) resulta anomala y conviene verificarla antes de citar el modelo.

## Enlaces
- Hugging Face: https://huggingface.co/CHOI0126/slmfim-pilot-cl100k-pt-fim50-step4000
- Repositorio del estudio: https://github.com/ms-choi-126/slm-fim
- Documento de diseno (referenciado como DESIGN.md §7): https://github.com/ms-choi-126/slm-fim/blob/main/DESIGN.md
