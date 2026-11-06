# liana313/tokengate-sftbase-repobench-qwen3-1.7b

## Resumen

TokenGate SFT baseline (RepoBench-P) para Qwen3-1.7B es un adaptador LoRA de ajuste supervisado (SFT) publicado por el usuario liana313 sobre el modelo base Qwen/Qwen3-1.7B. Se trata del baseline "estandar fine-tuned" que el articulo TokenGate (arXiv:2610.26754) utiliza como referencia de comparacion frente a su variante con compuerta de tokens (token gating). El adaptador se entrena especificamente sobre la tarea de autocompletado de codigo entre ficheros (cross-file code completion) del conjunto RepoBench-P, en su variante de pares alineada con LongBench (longbench_repobench_p).

El modelo no introduce ninguna innovacion arquitectonica propia: es un LoRA plano de rango 16 y alpha 32 aplicado a las proyecciones q_proj y v_proj de todas las capas del transformer de Qwen3-1.7B, sin mecanismo de compuerta. Su interes es fundamentalmente metodologico y de reproducibilidad: corresponde al checkpoint exacto (paso 12600) empleado en los benchmarks del articulo, seleccionado mediante la misma regla de maxima exactitud en el conjunto de test de contexto completo retenido que los checkpoints con compuerta, bajo el limite de equidad definido en el paper.

Por tanto, es relevante para investigadores que quieran reproducir o auditar los resultados del paper TokenGate, o que necesiten un punto de partida SFT limpio sobre Qwen3-1.7B para tareas de completado de codigo de repositorio con contexto largo. No es un modelo de proposito general ni un modelo publicado para uso en produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen3) con adaptador LoRA (r16, alpha 32, q_proj y v_proj, todas las capas) |
| Parametros totales | No disponible (adaptador LoRA sobre Qwen3-1.7B; el modelo base tiene 1.700 millones) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible de forma explicita; heredada del modelo base Qwen3-1.7B y entrenada para contexto largo (tag long-context) |
| Tipos de cuantizacion | No disponible (el adaptador se distribuye en precision de entrenamiento, presumiblemente bfloat16) |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | State dict de PyTorch (`lora_step12600.pt`) mas `params.json` con la configuracion de entrenamiento; no se distribuye en safetensors ni GGUF |

## Arquitectura y entrenamiento

El adaptador se aplica sobre Qwen3-1.7B, un transformer decoder-only de la familia Qwen3. El ajuste es un SFT estandar de siguiente token (plain next-token SFT) sin compuerta de tokens, con el mismo presupuesto de adaptador que las ejecuciones con compuerta del paper: rango 16, alpha 32, sobre q_proj y v_proj en todas las capas. El entrenamiento se realiza sobre RepoBench-P en su variante de pares alineada con LongBench (longbench_repobench_p), orientada al autocompletado de codigo que requiere integrar informacion de multiples ficheros del repositorio.

El checkpoint publicado corresponde al paso 12600, seleccionado mediante la regla de maxima exactitud en el conjunto de test de contexto completo retenido entre los pasos guardados, bajo el limite de equidad del articulo. No se documentan en la informacion disponible el numero total de tokens de entrenamiento, la composicion exacta del dataset ni si se aplicaron fases de RLHF o DPO; el proceso descrito es exclusivamente SFT. La innovacion tecnica del trabajo reside en la variante con compuerta de tokens (publicada como modelo separado), no en este baseline.

## Capacidades

- Generacion de texto autoregresiva y completado de codigo, heredadas del modelo base Qwen3-1.7B.
- Autocompletado de codigo entre ficheros (cross-file code completion) sobre repositorios, que es la tarea objetivo del ajuste.
- Manejo de contexto largo, segun la etiqueta long-context y el regimen de entrenamiento con pares LongBench.
- Razonamiento y matematicas basicas heredados del modelo base, aunque no son el foco del ajuste.
- Soporte de tool calling y function calling: no disponible de forma especifica en la informacion proporcionada (depende del modelo base).
- Capacidades de agente y razonamiento multi-paso: no documentadas para este adaptador.
- Capacidades multilingues: no disponibles (los idiomas no estan declarados).
- No dispone de modo thinking, vision ni audio documentados en esta ficha.

## Casos de uso

- Reproduccion de benchmarks del paper TokenGate: cargar el adaptador con la libreria TokenGate y evaluar sobre longbench_repobench_p para contrastar los resultados publicados frente a la variante con compuerta.
- Investigacion sobre compuerta de tokens: servir como baseline controlado (sin gating) para aislar el efecto del mecanismo de compuerta en tareas de contexto largo.
- Autocompletado de codigo en editores: el adaptador esta entrenado para predecir el siguiente fragmento de codigo integrando contexto de otros ficheros del repositorio, lo que encaja con asistentes de completado en IDE.
- Estudio de seleccion de checkpoints: el paso 12600 y su regla de seleccion permiten analizar como varia la exactitud en contexto completo segun el paso de entrenamiento.
- Punto de partida para fine-tuning posterior: al ser un LoRA ligero sobre Qwen3-1.7B, puede reutilizarse como inicializacion para tareas de codigo relacionadas.
- Analisis de eficiencia de adaptadores: comparar el coste y rendimiento de un LoRA plano r16 frente a variantes con compuerta bajo el mismo presupuesto de parametros.
- Docencia y experimentacion en contexto largo: modelo de 1.700 millones de parametros que cabe en GPUs de consumo, util para practicas sobre atencion a contexto extendido en codigo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card remite al articulo arXiv:2610.26754 para las cifras, pero no incluye tablas de resultados.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; para el modelo base Qwen3-1.7B en bfloat16 se estima un orden de 4 GB de pesos, mas memoria para el adaptador y el contexto (el contexto largo incrementa el consumo de KV cache).
- GPU recomendadas: no especificadas en la informacion. Por tamano del modelo base, una GPU con 8-16 GB seria suficiente en bfloat16 o cuantizacion.
- Compatibilidad con GPU de consumo: probable por el tamano del modelo base (1.700 millones de parametros), aunque no se confirma en la model card.
- Opciones de despliegue: la carga documentada es mediante Transformers mas la libreria TokenGate (https://github.com/token-gate-llms/TokenGate). No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI para este adaptador.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros base | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| liana313/tokengate-sftbase-repobench-qwen3-1.7b (este) | 1.700 M (Qwen3-1.7B) | No disponible (contexto largo) | LoRA SFT sin compuerta, baseline RepoBench-P | Apache 2.0 | Hugging Face |
| liana313/tokengate-repobench-qwen3-1.7b | 1.700 M (Qwen3-1.7B) | No disponible (contexto largo) | LoRA con compuerta de tokens, misma tarea | No disponible | Hugging Face |
| Qwen/Qwen3-1.7B | 1.700 M | No disponible en esta ficha | Modelo base de proposito general | Apache 2.0 | Hugging Face |

No se dispone de datos de rendimiento comparado en la informacion proporcionada; las cifras del paper no se incluyen en la model card.

## Limitaciones y advertencias

- Es un adaptador de investigacion centrado en una unica tarea (autocompletado de codigo RepoBench-P); su rendimiento fuera de ese dominio no esta caracterizado.
- No se documentan evaluaciones de sesgo, toxicidad ni alucinacion para este adaptador.
- Los idiomas soportados no estan declarados; el comportamiento multilingue depende del modelo base y no se ha verificado.
- La longitud de contexto efectiva no se especifica en la model card; se infiere del regimen de entrenamiento, pero no hay cifra confirmada.
- El adaptador se distribuye como state dict de PyTorch (`lora_step12600.pt`) y requiere la libreria TokenGate para cargarse; no hay pesos en safetensors ni GGUF, lo que limita su uso con herramientas estandar de despliegue.
- No apto para produccion sin validacion previa: es un baseline de paper con 0 descargas y 0 likes en el momento de la consulta.
- La licencia Apache 2.0 permite uso comercial, pero conviene revisar las condiciones del modelo base Qwen3-1.7B y del dataset RepoBench-P.
- El checkpoint esta fijado al paso 12600 por la regla de seleccion del paper; no se garantiza que sea optimo para otros objetivos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/liana313/tokengate-sftbase-repobench-qwen3-1.7b
- Variante con compuerta de tokens: https://huggingface.co/liana313/tokengate-repobench-qwen3-1.7b
- Modelo base: https://huggingface.co/Qwen/Qwen3-1.7B
- Articulo: https://arxiv.org/abs/2610.26754
- Repositorio TokenGate: https://github.com/token-gate-llms/TokenGate
