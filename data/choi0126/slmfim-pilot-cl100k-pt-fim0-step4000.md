# CHOI0126/slmfim-pilot-cl100k-pt-fim0-step4000

## Resumen

`slmfim-pilot-cl100k-pt-fim0-step4000` es un checkpoint intermedio de preentrenamiento publicado por el usuario CHOI0126 dentro del estudio `slm-fim`, cuyo diseño se documenta en el repositorio `github.com/ms-choi-126/slm-fim` (apartado DESIGN.md §7). No es un modelo listo para uso en produccion: es una instantanea del estado de entrenamiento en el paso 4.000 de un total previsto de 23.841, liberada para permitir la reanudacion reproducible del run y la evaluacion temprana de la curva de aprendizaje.

El modelo emplea la arquitectura de texto Qwen3.5-2B, descrita por el autor como un transformer hibrido con Gated DeltaNet en proporcion 3:1 respecto a atencion GQA con compuertas, con 1.370 millones de parametros no de embedding y 210 millones de embedding atado (tied), lo que arroja un total aproximado de 1.580 millones de parametros. El tokenizador es `cl100k` con 100.352 identificadores, y el contexto de entrenamiento por secuencia es de 4.096 tokens.

Su relevancia es metodologica mas que de producto: documenta el estado de un preentrenamiento a 4.190 millones de tokens consumidos de un presupuesto de 25.000 millones, con datos de validacion en bits por byte (BPB) para codigo, lenguaje natural y FIM. Resulta util para investigadores que quieran auditar la dinamica de entrenamiento de arquitecturas hibridas de tipo DeltaNet a escala pequena, o reanudar el run exactamente en el mismo punto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer hibrido Qwen3.5-2B: Gated DeltaNet y GQA con compuertas en proporcion 3:1 |
| Parametros totales | ~1,58B (1,37B no de embedding + 0,21B de embedding atado) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 4.096 tokens (longitud de secuencia de entrenamiento) |
| Tipos de cuantizacion | no disponible (pesos exportados en bf16) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (exportacion HF `Qwen3_5ForCausalLM` en bf16); `state.pt` con estado de modelo y optimizador AdamW |

## Arquitectura y entrenamiento

La arquitectura corresponde al diseno Qwen3.5-2B, un transformer hibrido que combina capas Gated DeltaNet con capas de atencion GQA con compuertas en una proporcion 3:1. El modelo suma 1.370 millones de parametros no de embedding mas 210 millones de embedding atado, con tokenizador `cl100k` de 100.352 identificadores. La exportacion a Hugging Face se realiza bajo la clase `Qwen3_5ForCausalLM` en bf16, pensada para evaluacion y para inferencia con vLLM.

El entrenamiento usa datos de preentrenamiento (PT) sin FIM, tasa de aprendizaje constante de 5e-4 tras un calentamiento del 1 %, y un lote global de 1.048.576 tokens (256 secuencias de 4.096). El run se detuvo deliberadamente en el paso 4.000 de 23.841 mediante `--stop-at 4000`, lo que equivale a 4.190 millones de los 25.000 millones de tokens previstos. El repositorio incluye el estado reanudable (`ckpt/state.pt` con pesos, momentos de AdamW, paso y reloj), la configuracion (`args.json`), el log de entrenamiento (`log.jsonl` con perdida, norma del gradiente y BPB de validacion) y un `restore.sh` que reconstruye la ruta `pilot/.../final/state.pt`. El orden de los datos es funcion exclusiva del paso, de modo que reanudar con un numero distinto de GPU produce los mismos lotes.

## Capacidades

- Generacion de texto autoregresiva: es un checkpoint de preentrenamiento, por lo que la capacidad existe pero no ha pasado por ajuste instructivo ni alineamiento.
- Relleno de codigo en medio (FIM): el estudio esta orientado a FIM, aunque este checkpoint concreto se entrena con datos PT sin FIM (`pt_fim0`), por lo que la capacidad FIM no esta desarrollada en este paso.
- Razonamiento y codigo: no verificables en este punto del entrenamiento; no se han publicado evaluaciones de tareas.
- Tool calling / function calling: no disponible; no hay ajuste para ello.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponibles; la model card no documenta composicion linguistica del corpus.
- Capacidades especiales (modo thinking, vision, audio): no disponibles.

## Casos de uso

- Reanudacion reproducible de experimentos: descargar el repositorio, ejecutar `restore.sh` y lanzar `python scripts/pipeline.py run --gpus 8 --tokenizers cl100k --stages pt` para continuar el run desde el paso 4.000 con el mismo flujo de tokens (`DATA/tok/cl100k/pt_fim0.bin`), aprovechando que el orden de datos depende solo del paso.
- Auditoria de la dinamica de entrenamiento: el `log.jsonl` permite analizar la evolucion de la perdida, la norma del gradiente y el BPB de validacion hasta el paso 4.000, util para estudiar estabilidad con LR constante de 5e-4.
- Investigacion sobre arquitecturas hibridas DeltaNet/GQA: sirve como punto de comparacion a escala 1,58B frente a transformers puros del mismo tamano en tareas de modelado de lenguaje y codigo.
- Estudios de tokenizadores: al usar `cl100k` en lugar del tokenizador nativo de Qwen, permite medir el efecto del tokenizador sobre el BPB en codigo y lenguaje natural.
- Evaluacion temprana de checkpoints: la exportacion bf16 a `Qwen3_5ForCausalLM` se puede cargar en vLLM para obtener lineas base de generacion antes de completar el entrenamiento.
- Reproducibilidad de infraestructura: el par `args.json` + `state.pt` documenta configuracion exacta (lote global, warmup, semilla de datos) para replicar el setup en otros nodos.

## Benchmarks y rendimiento

Unicos datos publicados en la model card (validacion en el paso 4.000, en bits por byte):

| Metrica | Valor (BPB) |
|---|---|
| Codigo | 0,441 |
| Lenguaje natural | 0,981 |
| FIM | 0,439 |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el repositorio ocupa 22,1 GB e incluye pesos, estado del optimizador y logs; los pesos en bf16 de un modelo de ~1,58B rondan los 3,2 GB, aunque la cifra exacta no esta publicada.
- GPU recomendadas: no disponible en la informacion proporcionada. El entrenamiento se ejecuta con 8 GPU (`--gpus 8`), modelo concreto no especificado.
- Compatibilidad con GPU de consumo: no confirmada; por tamano de parametros cabria en GPU de consumo con cuantizacion, pero no hay datos publicados de cuantizacion ni de VRAM medida.
- Opciones de despliegue: exportacion Hugging Face (`Qwen3_5ForCausalLM`, bf16) indicada por el autor para evaluacion y vLLM.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| slmfim-pilot-cl100k-pt-fim0-step4000 | ~1,58B | 4.096 | no disponible | Hugging Face (checkpoint de preentrenamiento) | Hibrido Gated DeltaNet/GQA, tokenizador cl100k, 4,19B tokens vistos |
| Qwen3.5-2B (arquitectura base) | ~2B (segun denominacion) | no disponible | no disponible | no disponible en la informacion | Arquitectura de referencia del estudio; no se aportan datos de rendimiento |
| Alternativas de ~1-2B open source | no disponible | no disponible | no disponible | no disponible | No se han proporcionado datos comparativos |

## Limitaciones y advertencias

- Es un checkpoint intermedio de preentrenamiento (paso 4.000 de 23.841): no ha completado el entrenamiento ni ha pasado por ajuste instructivo, RLHF o DPO.
- Entrenado sin datos FIM (`pt_fim0`), por lo que no cabe esperar buen rendimiento en tareas de relleno de codigo en este punto.
- No hay informacion sobre sesgos, composicion del corpus ni idiomas cubiertos; el riesgo de alucinacion y de comportamiento degradado es alto al tratarse de un modelo parcialmente entrenado.
- Licencia no especificada: no se puede asumir uso comercial permitido.
- El repositorio incluye estado del optimizador y logs, no solo pesos; el consumo de disco (22,1 GB) excede el de un checkpoint de inferencia.
- La reanudacion exige el mismo flujo de tokens (`DATA/tok/cl100k/pt_fim0.bin`) y rutas concretas (`RUNS=/workspace/slmfim-runs`, `DATA=/workspace/slmfim-data`); sin ellos el checkpoint no es utilizable para continuar el run.
- No apto para produccion en su estado actual.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/CHOI0126/slmfim-pilot-cl100k-pt-fim0-step4000
- Repositorio del estudio: https://github.com/ms-choi-126/slm-fim (referenciado en la model card, no verificado)
- Documento de diseno: DESIGN.md §7 del repositorio anterior (referenciado, no verificado)
