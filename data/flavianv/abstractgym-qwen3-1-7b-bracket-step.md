# flavianv/abstractgym-qwen3-1.7b-bracket-step

## Resumen

`flavianv/abstractgym-qwen3-1.7b-bracket-step` es un conjunto de adaptadores LoRA (PEFT) entrenados sobre el modelo base `Qwen/Qwen3-1.7B` para una tarea de investigacion muy concreta: emitir una accion de controlador de tipo "bracket-step" como JSON crudo dentro del entorno AbstractGym. Lo desarrolla el usuario de HuggingFace `flavianv` y su relevancia es acotada: no es un modelo de proposito general, sino un artefacto de investigacion reproducible para estudiar hasta que punto un modelo pequeno puede aprender a ejecutar trayectorias algorítmicas con estado mantenido externamente.

El repositorio contiene tres checkpoints finales independientes (seeds 17, 18 y 19) del mismo recetario fijo de entrenamiento, cada uno en su propia subcarpeta (`seed-17`, `seed-18`, `seed-19`). El adaptador se entrena sobre el modelo Qwen3-1.7B, un transformer denso de 1.700 millones de parametros, y el repositorio ocupa 0.2 GB (solo pesos del adaptador en safetensors, sin estado de optimizador). La licencia del adaptador es Apache-2.0.

El interes practico del modelo es limitado fuera del contexto de investigacion: la propia model card advierte que los datos sinteticos finitos y los mapas de simbolos no establecen ejecucion algoritmica general, y que los tres seeds varian sustancialmente entre si. Se trata, por tanto, de un recurso para reproducir y auditar un experimento concreto, no de un modelo para desplegar en produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer denso Qwen3-1.7B |
| Parametros totales | 1.700 millones (modelo base); adaptador con rango LoRA 16 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (heredada del modelo base Qwen3-1.7B) |
| Tipos de cuantizacion | adaptador en FP32 sobre base BF16; no se ofrecen variantes GGUF/AWQ/GPTQ del adaptador |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 (adaptador); pesos base de Qwen3 bajo Apache-2.0 por separado |
| Formato de pesos | safetensors (adaptador LoRA PEFT), sin estado de optimizador |

## Arquitectura y entrenamiento

El adaptador es un LoRA de rango 16 con alpha 32 y dropout 0, aplicado a las proyecciones q/k/v/o y gate/up/down del modelo base. La base se mantiene en BF16 y el adaptador en FP32. El entrenamiento uso AdamW con learning rate 2e-4, weight decay 0.01, clipping de 1, 5% de warmup y decaimiento coseno; microbatch 8 x acumulacion 4 = batch efectivo 32, durante 3 epocas y 219 updates. La receta y las semillas estan fijadas, y cada seed constituye un checkpoint final independiente. La revision del modelo base esta anclada explicitamente en el config del adaptador (`70d244cc86ccca08cf5af4e1e306ecf908b1ad5e`).

Los datos de entrenamiento consisten en 367 trayectorias de desarrollo con alfabeto `uvwxy` y profundidades 0-4, expandidas en 2.305 filas de siguiente-accion sobre 148 prompts distintos. Solo el JSON del asistente y el token EOS contribuyen a la perdida; no hay etiquetas de pertenencia en el objetivo. La tarea exige emitir una accion de controlador como JSON crudo, con el estado mantenido externamente por el harness: no se entrena al modelo para gestionar transiciones de estado por si mismo. No se reporta RLHF ni DPO; el ajuste es supervisado sobre el formato de salida.

## Capacidades

- Generacion de JSON estructurado correspondiente a una accion de controlador de tipo bracket-step.
- Ejecucion de trayectorias algoritmicas de profundidad variable (0 a 4 en entrenamiento; 0 a 16 en evaluacion) dentro del entorno AbstractGym, con el estado gestionado externamente.
- Seguimiento de instrucciones de formato estricto para producir salidas parseables como accion.
- Manipulacion de simbolos sobre alfabetos finitos definidos por el harness.
- No se documenta soporte de tool calling ni function calling generico.
- No se documenta comportamiento de agente multi-paso autonomo: el bucle de estado lo aporta el codigo acompanante.
- Capacidad multilingue limitada al ingles (`en`).
- No hay modo de pensamiento (thinking) habilitado: la evaluacion se realizo con thinking desactivado y decodificacion greedy, con tope de 128 tokens por paso.

## Casos de uso

- Reproduccion de experimentos de investigacion en ejecucion algoritmica: cargar un seed concreto y ejecutar el bucle de estado del repositorio publico para replicar las puntuaciones de trayectorias completas reportadas.
- Estudio de variabilidad entre semillas: comparar los checkpoints 17, 18 y 19 para analizar la dispersion de resultados (por ejemplo, 43/92 frente a 54/92 en el conjunto original) bajo una receta identica.
- Evaluacion de LoRA de bajo rango en modelos de 1.7B: usar el adaptador como referencia para medir cuanto puede aprender un ajuste de rango 16 sobre proyecciones densas en una tarea de formato estricto.
- Analisis de fallo en binding de simbolos: dado que la model card identifica el binding de simbolos crudos como fuente de error, sirve para estudiar modos de fallo en mapeo entrada-salida.
- Banco de pruebas para harness de estado externo: integrar el adaptador en un entorno que gestione transiciones y detener la ejecucion al primer error, tal como hace la evaluacion reportada.
- Docencia y divulgacion sobre limites de los datos sinteticos: ilustrar por que un conjunto finito de plantillas y mapas de simbolos no garantiza generalizacion algorítmica.

## Benchmarks y rendimiento

Los unicos resultados publicados son de trayectorias completas ejecutadas en vivo (completado estricto, primer error detiene la ejecucion, todos los fallos permanecen en el denominador), con decodificacion greedy, thinking desactivado y tope de 128 tokens por paso. No son puntuaciones medias de siguiente-accion.

| Seed | Ejecuciones completas (conjunto original, 92 casos) | Ejecuciones completas (mapas nuevos, 312 casos) |
|---|---|---|
| 17 | 43/92 | 156/312 |
| 18 | 54/92 | 152/312 |
| 19 | 46/92 | 170/312 |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la informacion disponible. No hay seleccion de checkpoint por conjunto de retencion.

## Requisitos de hardware

- El modelo base es de 1.700 millones de parametros, por lo que la inferencia en BF16 ocupa aproximadamente 3,4 GB de pesos, mas overhead de activaciones y cache KV.
- El adaptador anade un consumo despreciable (el repositorio completo pesa 0.2 GB, solo safetensors).
- Cabe con holgura en GPUs de consumo: RTX 3060 12 GB, RTX 4070, RTX 4090, e incluso en GPUs de 6-8 GB si se cuantiza el modelo base.
- Para despliegue en servidor se puede usar el modelo base cuantizado junto con el adaptador; el adaptador no incluye variantes GGUF propias.
- Opciones de despliegue: la model card solo valida la carga nativa con `transformers` + `peft` (`PeftModel.from_pretrained`). No se mencionan vLLM, llama.cpp, Ollama ni TGI, y se advierte explicitamente que fusionar el adaptador (merging) no es un sustituto validado de los adaptadores nativos.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

No se dispone de modelos comparables descritos en la informacion proporcionada. El artefacto es un adaptador de investigacion especifico de una tarea (AbstractGym bracket-step) sobre Qwen3-1.7B, de modo que las alternativas directas serian otros adaptadores del mismo autor o del mismo entorno, cuyos datos no se han facilitado.

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| abstractgym-qwen3-1.7b-bracket-step | 1,7B (base) + LoRA r16 | no disponible | ver tabla de trayectorias completas | apache-2.0 | HuggingFace |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Solo hay tres seeds de entrenamiento y varian sustancialmente entre si; el rendimiento depende del seed elegido.
- Las plantillas sinteticas finitas y los mapas de simbolos no establecen ejecucion algoritmica general: el modelo no demuestra capacidad algorítmica fuera del entorno de entrenamiento.
- El harness aporta las transiciones de estado; el modelo no incluye reparacion ni reintento ante errores.
- El binding de simbolos crudos a la salida sigue siendo una fuente de fallo.
- La evaluacion usa decodificacion greedy con thinking desactivado y tope de 128 tokens; otros ajustes de decodificacion no estan validados.
- El merging del adaptador no es un sustituto validado de los adaptadores nativos.
- Solo se soporta ingles (`en`).
- No se han publicado datos sobre sesgos, riesgo de alucinacion fuera de la tarea ni comportamiento en dominios abiertos.
- Aunque la licencia es Apache-2.0 (permite uso comercial), el proposito declarado es la investigacion y no se ha validado el comportamiento en produccion.
- Es necesario cargar una subcarpeta de seed concreta (`seed-17`, `seed-18` o `seed-19`); no se debe cargar la raiz del repositorio.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/flavianv/abstractgym-qwen3-1.7b-bracket-step
- Codigo publico de AbstractGym: https://github.com/flavianv/abstractgym-public/tree/main
- Documentacion de referencia del controlador (en el repositorio): `docs/a6_trained_controller.md`
- Resultados de seguimiento (en el repositorio): `docs/a6_followup_results.md`
- Resultados detallados (en el repositorio): `docs/results/2026-10-04-x3/summary.json`
- Modelo base: https://huggingface.co/Qwen/Qwen3-1.7B
