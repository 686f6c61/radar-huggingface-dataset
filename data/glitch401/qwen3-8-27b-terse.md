# glitch401/qwen3.8-27B-terse

## Resumen

qwen3.8-27B-terse es un adaptador LoRA de rango 1 publicado por el usuario glitch401 sobre el modelo base Qwen/Qwen3.8-27B. No se trata de un fine-tune convencional: no hubo entrenamiento por gradiente, sino una edición en el espacio de pesos (weight-space edit) que introduce un delta fijo de rango 1 en la matriz `mlp.down_proj.weight` de las capas 10 a 58. El objetivo es reducir la longitud de las respuestas en aproximadamente un 30% manteniendo la precisión en tareas de matematicas y razonamiento.

El adaptador se distribuye como un fichero LoRA de unos 4 MB y no redistribuye los pesos del modelo base, que debe descargarse por separado. La edición combina dos direcciones latentes: una dirección de "respuesta concisa" (D3) y una dirección de "omitir la reverificacion" (V⊥), ortogonalizada contra una direccion de descuido para evitar degradar la calidad. El resultado se aplica de forma telescopica, de modo que el flujo residual en la capa *l* se desplaza por `G[l] − G[9]`, con `G = 3·D3 + 10·V⊥`.

La relevancia practica del modelo radica en que ofrece un mecanismo de control de verbosidad sin reentrenamiento y con un coste de almacenamiento minimo, lo que resulta atractivo para despliegues en produccion donde el coste por token de salida es significativo. La evaluacion publicada cubre exclusivamente matematicas en ingles (MATH-500, MATH fresh, GSM8K), IFEval y MMLU-Pro, y todas las diferencias de precision reportadas tienen intervalos de confianza al 95% que incluyen el cero.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA de rango 1 sobre transformer decoder-only (modelo base Qwen3.8-27B) |
| Parametros totales | no disponible (adaptador de ~4 MB; el modelo base tiene 27B segun su denominacion) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (heredada del modelo base Qwen3.8-27B) |
| Tipos de cuantizacion | no disponible (la evaluacion se realizo en bf16) |
| Idiomas soportados | no disponible (evaluado solo en ingles) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador no emplea entrenamiento supervisado ni RLHF/DPO. Se trata de una edicion en el espacio de pesos generada por un agente de IA (Claude Fable) que operaba en un entorno sandbox con un presupuesto fijo de pasadas forward. El agente selecciono la edicion sobre un split de seleccion y la valido una unica vez sobre un split sellado; las cifras publicadas provienen de una evaluacion posterior e independiente sobre datos que el agente nunca vio.

Tecnicamente, la edicion anade un cambio de rango 1 exacto a `mlp.down_proj.weight` en cada una de las capas 10 a 58 (49 capas). El residuo de reconstruccion es inferior al 0,5% por capa, segun `lora_manifest.json`, y por ello se fija `r = lora_alpha = 1`, de forma que la escala LoRA es exactamente 1. La direccion D3 se obtiene como la diferencia media del residuo en los tokens de respuesta del propio modelo cuando se le pide concision frente a cuando no se le pide. La direccion V⊥ se define como la diferencia entre prompts que indican no reverificar y prompts que indican reverificar, ortogonalizada contra una direccion de cuidado frente a descuido; su fiabilidad split-half es de 0,98. Los cambios en cada capa se acumulan de forma telescopica, de modo que el desplazamiento neto del flujo residual en la capa *l* es `G[l] − G[9]`.

## Capacidades

- Generacion de texto y razonamiento matematico: el modelo base conserva sus capacidades y el adaptador modula la verbosidad de la respuesta.
- Reduccion de tokens de salida: entre un 16,6% y un 37,2% menos de tokens segun el benchmark y el modo de razonamiento, con diferencias de precision no significativas.
- Modo thinking: el adaptador funciona tanto con razonamiento desactivado (presupuesto de 4k tokens) como activado (presupuesto de 16k tokens).
- Instrucciones: evaluado en IFEval con un cambio de −16,6% en tokens y +0,0 pp de precision.
- Conocimiento general: evaluado en MMLU-Pro con +0,7 pp (thinking off) y +1,7 pp (thinking on).
- Compatibilidad con vLLM mediante `--enable-lora --max-lora-rank 16` y con PEFT/Transformers.
- Fusión opcional de pesos mediante `merge_and_unload()`, al ser un delta de pesos plano.
- No se ha medido su comportamiento en codigo, redaccion larga ni otros idiomas.

## Casos de uso

- Servicio de matematicas en produccion: el adaptador reduce un 27,6% los tokens en GSM8K y un 29,9% en MATH-500 sin perdida de precision, lo que abarata el coste por consulta en APIs de resolucion de problemas.
- Razonamiento con modo thinking en agentes: con un 21,3% menos de tokens en MATH fresh (set 2) y 16k de presupuesto, encaja en pipelines de agentes donde el coste de los tokens de razonamiento domina el gasto.
- Control de verbosidad en asistentes: la direccion D3 permite acortar respuestas en un 30% aproximadamente, util para interfaces de chat donde se prima la concision sobre la exhaustividad.
- Despliegue multi-adaptador con vLLM: al ser un LoRA de rango 1 y 4 MB, se puede servir junto al modelo base y alternar entre version terse y estandar segun la ruta o el cliente, sin duplicar pesos.
- Evaluacion de tecnicas de edicion de pesos: sirve como caso de estudio reproducible de weight-space editing con validacion en split sellado y evaluacion independiente.
- Investigacion sobre control de razonamiento: la separacion entre D3 (concision) y V⊥ (omitir reverificacion) permite estudiar como se acopla la verbosidad con la precision en modelos grandes.
- Reduccion de coste en batch offline: para tareas de matematicas en lote donde se paga por token generado, el ahorro de tokens se traduce directamente en menor factura de inferencia.

## Benchmarks y rendimiento

Resultados publicados por el autor, comparacion pareada contra el modelo base sin editar, mismo muestreo, servido con vLLM en bf16. Las diferencias de precision estan en puntos porcentuales con IC al 95%.

**Thinking off (presupuesto 4k)**

| Benchmark | n | Δ precision (IC 95%) | Δ tokens |
|---|---|---|---|
| MATH-500 (confirm split) | 244 | +0,0 pp [−1,7, +1,7] | −29,9% |
| MATH fresh, set 1 | 500 | +1,0 pp [−0,5, +2,5] | −31,0% |
| MATH fresh, set 2 | 1000 | +1,5 pp [−0,1, +3,1] | −31,6% |
| GSM8K | 300 | −0,3 pp [−2,1, +1,4] | −27,6% |
| IFEval | 200 | +0,0 pp [−3,7, +3,7] | −16,6% |
| MMLU-Pro | 300 | +0,7 pp [−2,9, +4,3] | −37,2% |

**Thinking on (presupuesto 16k)**

| Benchmark | n | Δ precision (IC 95%) | Δ tokens |
|---|---|---|---|
| MATH-500 (confirm split) | 244 | +0,2 pp [−1,7, +2,1] | −29,0% |
| MATH fresh, set 1 | 500 | +0,6 pp [−1,0, +2,2] | −23,4% |
| MATH fresh, set 2 | 1000 | +0,8 pp [−0,5, +2,1] | −21,3% |
| GSM8K | 300 | −0,3 pp [−2,1, +1,4] | −36,8% |
| MMLU-Pro | 300 | +1,7 pp [−1,3, +4,7] | −30,5% |

Todos los intervalos de confianza de precision incluyen el cero. No se han publicado resultados de benchmarks adicionales en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la informacion proporcionada; depende del modelo base Qwen3.8-27B y de la cuantizacion empleada.
- GPU recomendadas: no disponible; la evaluacion se realizo con vLLM en bf16, lo que requiere el modelo base completo en memoria.
- Ajuste en GPU de consumo: no disponible; el adaptador en si ocupa unos 4 MB, pero el modelo base de 27B condiciona el requisito real.
- Opciones de despliegue: vLLM con `--enable-lora --max-lora-rank 16 --lora-modules terse=glitch401/qwen3.8-27B-terse --reasoning-parser qwen3`; PEFT/Transformers con `PeftModel.from_pretrained` y fusion opcional mediante `merge_and_unload()`.
- Latencia y throughput: no disponibles; solo se reporta la reduccion de tokens de salida, que en la practica reduce el tiempo de generacion de forma proporcional al ahorro.

## Comparativa con modelos similares

No se dispone de datos de modelos comparables en la informacion proporcionada. El adaptador se aplica exclusivamente sobre Qwen/Qwen3.8-27B y no es transferible a otros checkpoints.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| qwen3.8-27B-terse | no disponible (adaptador LoRA r=1 sobre base 27B) | no disponible | Apache-2.0 | Hugging Face |
| Qwen/Qwen3.8-27B (base) | 27B (segun denominacion) | no disponible | Apache-2.0 | Hugging Face |
| Alternativas de la misma categoria | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Evaluado exclusivamente en matematicas en ingles, GSM8K, IFEval y MMLU-Pro; el comportamiento en codigo, redaccion larga y otros idiomas no se ha medido.
- Los resultados son especificos de este checkpoint base; el adaptador asume los pesos de Qwen3.8-27B y no se transfiere a otros modelos.
- Todas las diferencias de precision reportadas tienen intervalos de confianza que incluyen el cero, por lo que no puede afirmarse una mejora de precision, solo ausencia de degradacion detectable.
- Riesgo de alucinacion: no cuantificado en la informacion disponible; la direccion V⊥ reduce la reverificacion, lo que podria afectar a la deteccion de errores en dominios no evaluados.
- Sesgos conocidos: no documentados en la informacion proporcionada.
- Licencia Apache-2.0, igual que el modelo base (Copyright Alibaba Cloud); se incluye la licencia del modelo base en el repositorio.
- Es un derivado comunitario no oficial, sin afiliacion ni respaldo del equipo Qwen ni de Alibaba Cloud.
- El repositorio tiene 0 descargas y 0 likes, y fue creado y actualizado el 2026-11-12; no hay evidencia de uso en produccion ni validacion independiente por terceros.

## Enlaces

- Hugging Face: https://huggingface.co/glitch401/qwen3.8-27B-terse
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
