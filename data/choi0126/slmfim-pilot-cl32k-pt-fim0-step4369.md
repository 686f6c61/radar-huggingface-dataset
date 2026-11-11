# CHOI0126/slmfim-pilot-cl32k-pt-fim0-step4369

## Resumen

`slmfim-pilot-cl32k-pt-fim0-step4369` es un checkpoint intermedio de preentrenamiento publicado por el usuario CHOI0126 como parte del estudio `slm-fim` (repositorio `github.com/ms-choi-126/slm-fim`, documentado en su `DESIGN.md`). No se trata de un modelo listo para uso en produccion, sino de una instantanea de un entrenamiento en curso: concretamente el paso 4.369 de un total previsto de 26.038, lo que equivale a 4.58B de los 27.3B tokens planificados. El objetivo del estudio es comparar el efecto del tokenizer y de los datos FIM (fill-in-the-middle) en modelos pequenos de codigo, por lo que este checkpoint representa la rama "cl32k" (tokenizer de 32.768 identificadores) sin datos FIM.

La arquitectura es la de Qwen3.5-2B para texto: un transformer hibrido con Gated DeltaNet y atencion GQA con puertas en proporcion 3:1, con 1.37B parametros no de embedding mas 0.07B de embedding atado (aproximadamente 1.44B en total). El entrenamiento usa learning rate constante de 5e-4 tras un 1% de warmup, batch global de 1.048.576 tokens (256 secuencias de 4.096) y se detuvo deliberadamente en el paso 4.369 para igualar el computo del checkpoint piloto de la rama cl100k (4.000 pasos), segun el apartado 3 del diseno.

Su relevancia es acotada y experimental: sirve para reproducir y continuar una ejecucion de investigacion concreta, no como modelo de proposito general. El repositorio ocupa 20.2 GB e incluye el estado de reanudacion completo (modelo, estado AdamW, paso y reloj), la configuracion y el log de entrenamiento, y una exportacion en formato Hugging Face en bf16 para evaluacion o vLLM.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer hibrido Qwen3.5-2B (Gated DeltaNet 3:1 + GQA con puertas) |
| Parametros totales | ~1.44B (1.37B no de embedding + 0.07B embedding atado) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 32.768 tokens (tokenizer cl32k; secuencias de entrenamiento de 4.096) |
| Tipos de cuantizacion | no disponible (exportacion en bf16) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (exportacion HF `Qwen3_5ForCausalLM`, bf16); `state.pt` para reanudacion |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura de texto Qwen3.5-2B, un diseno hibrido que combina capas Gated DeltaNet con atencion GQA con puertas en una proporcion 3:1. El checkpoint incluye 1.37B parametros no de embedding y 0.07B de embedding atado, con tokenizer cl32k de 32.768 identificadores. La exportacion a Hugging Face usa la clase `Qwen3_5ForCausalLM` en bf16.

El preentrenamiento se realizo sobre datos PT sin FIM, con learning rate constante de 5e-4 tras un 1% de warmup y batch global de 1.048.576 tokens (256 x 4.096). El checkpoint corresponde al paso 4.369 de 26.038, es decir, 4.58B de 27.3B tokens, detenido con `--stop-at 4369` para igualar el computo del piloto de la rama cl100k (4.000 pasos). El orden de los datos es funcion unicamente del paso, de modo que reanudar con un numero distinto de GPU produce los mismos batches. En el paso 4.000 se registro una validacion con BPB de 0.441 en codigo, 0.987 en lenguaje natural y 0.434 en FIM.

## Capacidades

- Generacion de texto autoregresiva: es un checkpoint de preentrenamiento, sin ajuste por instrucciones ni RLHF, por lo que no cabe esperar comportamiento de asistente.
- Modelado de codigo: el estudio se centra en modelos pequenos de codigo, y el log reporta BPB especifico de codigo (0.441 en el paso 4.000).
- Relleno FIM: aunque esta rama se entrena sin datos FIM, la validacion incluye una metrica FIM (BPB 0.434) para comparacion entre ramas.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible.
- Capacidades especiales (vision, audio, modo thinking): no disponible.
- Reanudacion de entrenamiento: el repositorio incluye estado AdamW, paso y reloj para continuar la ejecucion.

## Casos de uso

- Continuacion de la ejecucion de investigacion: descargar el repositorio, ejecutar `restore.sh` para recrear `pilot/.../final/state.pt` y lanzar `python scripts/pipeline.py run --gpus 4 --tokenizers cl32k --arms none --stages pt` con el mismo flujo de tokens (`DATA/tok/cl32k/pt_fim0.bin`) para retomar desde el paso 4.369.
- Estudio comparativo de tokenizers: usar este checkpoint como rama cl32k frente a la rama cl100k del mismo estudio, con presupuestos de computo igualados, para medir el efecto del vocabulario en BPB de codigo y lenguaje natural.
- Evaluacion de la arquitectura Qwen3.5-2B en regimen de bajo computo: cargar la exportacion HF en bf16 y medir perplejidad o BPB sobre corpus propios para caracterizar el comportamiento del modelo hibrido Gated DeltaNet/GQA a 4.58B tokens vistos.
- Analisis de la curva de entrenamiento: el `log.jsonl` incluido permite estudiar la evolucion de la loss, la norma del gradiente y el BPB de validacion hasta el paso 4.369.
- Reproducibilidad de orden de datos: verificar que la reanudacion con distinto numero de GPU genera los mismos batches, util para auditar pipelines de entrenamiento distribuido.
- Base para experimentos de FIM: al ser la rama sin FIM, sirve como punto de partida controlado para comparar contra ramas entrenadas con datos FIM en el mismo estudio.
- Pruebas de integracion con vLLM: la exportacion HF esta pensada explicitamente para evaluacion o vLLM, lo que permite validar el soporte de la arquitectura en el motor de inferencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible. El autor unicamente reporta metricas de validacion internas en el paso 4.000:

| Metrica (paso 4.000) | Valor (BPB) |
|---|---|
| Codigo | 0.441 |
| Lenguaje natural | 0.987 |
| FIM | 0.434 |

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Con ~1.44B parametros, en bf16 los pesos ocupan aproximadamente 2,9 GB; en FP16, lo mismo; una cuantizacion a 8 bits rondaria 1,5 GB y a 4 bits unos 0,8 GB, sin contar cache KV ni overhead del runtime (estimaciones derivadas del tamano, no publicadas por el autor).
- GPU recomendadas: no disponible. Por tamano, el modelo cabe en GPU de consumo con suficiente VRAM; el autor menciona vLLM como destino de la exportacion HF.
- Cabe en GPU de consumo: previsiblemente si, dado el tamano de ~1.44B parametros, aunque no hay confirmacion oficial ni lista de modelos probados.
- Opciones de despliegue: vLLM (mencionado por el autor para la exportacion HF); llama.cpp, Ollama o TGI no estan confirmados en la informacion disponible.
- Latencia y throughput estimados: no disponible.
- Requisitos de entrenamiento: el script de continuacion asume 4 GPU (`--gpus 4`), aunque el orden de datos es independiente del numero de GPU.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Estado |
|---|---|---|---|---|
| slmfim-pilot-cl32k-pt-fim0-step4369 | ~1.44B | 32.768 | no disponible | checkpoint de preentrenamiento, 4.58B tokens vistos |
| Qwen3.5-2B (arquitectura base) | ~2B (referencia del autor) | no disponible | no disponible | modelo publicado por su desarrollador original |
| Otros modelos pequenos de codigo (~1-2B) | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de rendimiento comparables entre estos modelos en la informacion proporcionada; la comparacion se limita a parametros y contexto.

## Limitaciones y advertencias

- No es un modelo final: es un checkpoint intermedio al 16,8% del entrenamiento previsto (4.369 de 26.038 pasos), por lo que su calidad esta muy por debajo de la de un modelo convergido.
- Sin ajuste por instrucciones: al ser preentrenamiento puro sin RLHF/DPO, no sigue instrucciones ni mantiene formato de asistente de forma fiable.
- Riesgo elevado de alucinacion y salidas incoherentes, especialmente en lenguaje natural (BPB de validacion 0.987).
- Idiomas soportados no documentados; no hay garantia de comportamiento multilingue.
- Licencia no especificada: no se puede asumir uso comercial permitido; conviene contactar con el autor antes de cualquier uso fuera de investigacion.
- Sesgos conocidos: no documentados; el corpus de entrenamiento no se describe en detalle.
- Dependencia de infraestructura: la reanudacion requiere el mismo flujo de tokens (`DATA/tok/cl32k/pt_fim0.bin`) y rutas concretas (`/workspace/slmfim-runs`, `/workspace/slmfim-data`), lo que limita la portabilidad.
- Repositorio de 20.2 GB: incluye estado de optimizador y exportacion, con coste de almacenamiento y descarga considerable.
- Sin descargas ni likes en el momento de la consulta: no hay validacion externa de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/CHOI0126/slmfim-pilot-cl32k-pt-fim0-step4369
- Repositorio del estudio: https://github.com/ms-choi-126/slm-fim
- Documento de diseno: `DESIGN.md` dentro del repositorio anterior (apartados 3 y 7 citados por el autor)
- Paper, blog o demo: no disponible
