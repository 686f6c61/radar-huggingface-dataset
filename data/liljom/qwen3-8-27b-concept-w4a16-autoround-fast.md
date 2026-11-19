# Liljom/Qwen3.8-27B-Concept-W4A16-AutoRound-fast

## Resumen

Qwen3.8-27B-Concept-W4A16-AutoRound-fast es una cuantizacion int4 W4A16 (pesos a 4 bits, activaciones a 16 bits) del modelo multimodal Qwen/Qwen3.8-27B, publicada por el usuario Liljom. No se trata de un modelo nuevo entrenado desde cero, sino de un "weight edit" aplicado directamente sobre los pesos ya cuantizados con AutoRound, sin re-cuantizar. El resultado es un artefacto de inferencia que incorpora una modificacion de concepto (procedente de ConceptCountry/qwen-concept-27b) en nueve matrices `down_proj` de la torre de lenguaje, manteniendo el resto de tensores byte a byte identicos al build base.

El modelo resuelve un problema muy concreto de ingenieria de despliegue: como introducir un ajuste fino de pesos sobre un checkpoint cuantizado sin destruir la precision que AutoRound habia calibrado. La tecnica empleada, denominada "delta flips", calcula solo los cambios de redondeo que el delta del edit provoca sobre los enteros int4 existentes, preservando las escalas originales. Segun la model card, el resultado reduce un 27 % los tokens de razonamiento y el tiempo de pared en tareas duras con esfuerzo medio, sin perdida medible de calidad en su suite privada.

El checkpoint declara 6.260.690.960 parametros en safetensors (unos 6,26 mil millones), lo que sugiere que el nombre "27B" del modelo base no se corresponde con el recuento real de parametros del artefacto publicado, o que el conteo de safetensors excluye componentes. El repositorio ocupa 15,8 GB y esta pensado para servirse con HyperQwen sobre una unica RTX 3090 usando decodificacion especulativa MTP.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (image-text-to-text) con modulo MTP (multi-token prediction) para decodificacion especulativa; tag `qwen3_5` |
| Parametros totales | 6.260.690.960 (segun safetensors del repo) |
| Parametros activos | no disponible (no se declara como MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | int4 W4A16, group size 128, simetrica, formato compressed-tensors; `lm_head` y modulo MTP en int4-GPTQ |
| Idiomas soportados | en |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (compressed-tensors), compatible con transformers y vLLM |

## Arquitectura y entrenamiento

El modelo base es Qwen/Qwen3.8-27B, un transformer multimodal de la familia Qwen3 orientado a tareas image-text-to-text. Sobre el se aplico una cadena de transformaciones: primero una cuantizacion int4 W4A16 con Intel AutoRound (grupo 128, simetrica, formato compressed-tensors) realizada por dbirks; despues una variante "fast" de HyperQwen que sustituye el `lm_head` por una version int4-GPTQ, incorpora un modulo MTP en int4 y una cabeza de borrador de 40.960 filas, tomados de syvai/qwen3.8-27b-3090-fast-variant. Los shards 1-6 se mantienen sin cambios respecto al build de dbirks.

La innovacion tecnica de este repositorio es el metodo de edicion sobre pesos cuantizados. El edit original (modo `add`, alpha 0.1, escritor `down`, nueve capas: 32, 34, 36, 38, 40, 42, 44, 46 y 48) representa aproximadamente el 0,5 % de la norma de los pesos, menos que un paso de cuantizacion int4. En lugar de re-cuantizar, el autor conserva las escalas `s` y los enteros `q_p` y aplica unicamente los flips de redondeo inducidos por el delta:

```
q_new = clamp(q_p + round(W_concept / s) − round(W_base / s), −8, 7)
```

La fraccion residual de los pesos base actua como dither, de modo que el cambio entero reproduce el delta en promedio. Como puerta de validacion se exige que la fraccion preservada p = ⟨ΔQ, Δ⟩ / ‖Δ‖² y la ganancia rank-1 g esten en [0,7; 1,3] para cada matriz; las mediciones reportan p = 0,94–1,00 en las nueve capas, con un 0,30–0,64 % de enteros modificados y como maximo un 0,007 % sujetos a clipping. No se documenta en la informacion disponible el volumen de tokens de entrenamiento del modelo base ni la composicion de su dataset.

## Capacidades

- Generacion de texto conversacional en ingles, con pipeline declarado image-text-to-text (entrada de imagen y texto).
- Razonamiento multi-paso con modos de esfuerzo configurables (low, medium; xhigh no evaluado).
- Decodificacion especulativa mediante modulo MTP integrado, con tasa de aceptacion medida de 0,651–0,658 con k = 4.
- Salida estructurada: la suite de evaluacion reporta 40/40 en tareas de structured output en todas las ejecuciones.
- Procesamiento de imagen a traves de la torre de vision (no evaluada en este build, segun la model card).
- Edicion de pesos orientada a modificar el comportamiento conceptual del modelo sin reentrenamiento.
- Soporte de tool calling y function calling: no disponible en la informacion proporcionada.
- Capacidades de agente y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: limitadas a ingles segun el campo `language`.

## Casos de uso

- Despliegue en una unica GPU de consumo: el build esta disenado para servirse en una RTX 3090 con HyperQwen, lo que permite ejecutar un modelo multimodal de gran tamano en hardware de gama alta para consumidores sin recurrir a multi-GPU.
- Investigacion sobre edicion de pesos en modelos cuantizados: el metodo "delta flips" y las metricas de preservacion (p, g) sirven como referencia reproducible para estudiar como aplicar edits sobre checkpoints int4 sin re-cuantizar.
- Servicio de inferencia con razonamiento eficiente: con esfuerzo medio reduce un 27 % los tokens de razonamiento y el tiempo de pared frente al build base, lo que abarata el coste por consulta en tareas de razonamiento dificiles.
- Generacion de salida estructurada: los 40/40 en structured output lo hacen adecuado para extraccion de datos, formateo JSON y pipelines que requieren respuestas parseables.
- Experimentacion con decodificacion especulativa MTP: la tasa de aceptacion estable (~0,65) permite medir el impacto de tecnicas de aceleracion en vLLM con parches de HyperQwen.
- Evaluacion comparativa de variantes de cuantizacion: al ser un drop-in replacement del directorio AutoRound-fast, facilita A/B testing entre builds cuantizados en el mismo stack de servicio.
- Prototipado multimodal en local: al caber en 15,8 GB de pesos, permite probar tareas image-text-to-text en estaciones de trabajo con una sola GPU.

## Benchmarks y rendimiento

La model card no incluye resultados de benchmarks publicos estandar (MMLU, HumanEval, GSM8K). Los unicos datos son de una suite privada de evaluacion ejecutada en una RTX 3090 con vLLM y decodificacion especulativa MTP, comparando contra el build AutoRound-fast sin editar (AR).

| Metrica | Build editado | AR (base sin editar) |
|---|---|---|
| Tokens de razonamiento, esfuerzo medio (4 tareas x 4 semillas, MTP k=4) | −27 % | referencia |
| Tiempo de pared, esfuerzo medio | −27 % | referencia |
| Tasa de aceptacion MTP | 0,658 | 0,651 |
| Tareas duras superadas (de 16) | 12 | 13 |
| Tokens de pensamiento, esfuerzo bajo (tareas duras) | −7 a −11 % | referencia |
| Tokens de pensamiento, esfuerzo bajo (salida estructurada) | −23 % | referencia |
| Structured output (esfuerzo bajo) | 40/40 | 40/40 |

No se han publicado resultados de benchmarks estandar en la informacion disponible. El autor senala que la mejora es inferior al 27–54 % que reporta la model card upstream del edit en esfuerzo bajo, y que no observo ganancia de calidad.

## Requisitos de hardware

- VRAM estimada: el repositorio ocupa 15,8 GB en safetensors int4; se necesita margen adicional para cache KV, activaciones y el modulo MTP. El autor lo sirve en una RTX 3090 (24 GB).
- GPU recomendadas: RTX 3090 como referencia validada por el autor; GPU con 24 GB o mas de VRAM en general. No hay datos para A100, H100 o RTX 4090 en la informacion disponible.
- Cabe en GPU de consumo: si, al menos en RTX 3090. Otras consumer GPU con 24 GB no estan validadas.
- Opciones de despliegue: vLLM con los parches de HyperQwen (incluido el vocabulario del borrador MTP). vLLM sin esos parches no esta probado. Compatible con transformers por libreria declarada; llama.cpp, Ollama y TGI no se mencionan.
- Latencia y throughput: no se publican valores absolutos; solo deltas relativos (−27 % de tiempo de pared en esfuerzo medio, ~10 % mas rapido en esfuerzo bajo).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (Liljom/Qwen3.8-27B-Concept-W4A16-AutoRound-fast) | 6,26 B (safetensors) | no disponible | int4 W4A16 AutoRound | apache-2.0 | Hugging Face |
| dbirks/Qwen3.8-27B-W4A16-AutoRound | no disponible | no disponible | int4 W4A16 AutoRound | apache-2.0 (heredada) | Hugging Face |
| syvai/qwen3.8-27b-3090-fast-variant | no disponible | no disponible | int4 con MTP y lm_head GPTQ | no disponible | Hugging Face |
| Qwen/Qwen3.8-27B (base BF16) | no disponible | no disponible | BF16 | no disponible | Hugging Face |

La comparativa se limita a la propia linea de linaje del modelo; no se dispone de datos de benchmarks ni de especificaciones completas de alternativas de otros desarrolladores en la informacion proporcionada.

## Limitaciones y advertencias

- Evaluacion privada y de muestra pequena: 16 llamadas puntuadas por build en esfuerzo medio y 94 por ejecucion en esfuerzo bajo, con temperatura 1,0. Diferencias de una sola llamada no son concluyentes.
- No probado en esfuerzo xhigh, el ajuste que reportan los autores originales del edit.
- La torre de vision no fue modificada pero tampoco evaluada.
- Solo soporta ingles segun el campo `language`; no se declaran capacidades multilingues.
- Requiere los parches de vLLM de HyperQwen; el comportamiento con vLLM estandar es desconocido.
- Riesgo de alucinacion y sesgos: no documentados en la informacion disponible.
- La discrepancia entre el nombre "27B" y los 6,26 mil millones de parametros declarados en safetensors debe verificarse antes de dimensionar infraestructura.
- Licencia Apache-2.0 permite uso comercial, pero se recomienda revisar las condiciones de los componentes upstream (modelo base Qwen, edit de ConceptCountry, cuantizacion de dbirks y variante de syv-ai).
- El autor no observo ganancia de calidad frente al build sin editar; el beneficio es de eficiencia, no de capacidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Liljom/Qwen3.8-27B-Concept-W4A16-AutoRound-fast
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Edit de concepto upstream: https://huggingface.co/ConceptCountry/qwen-concept-27b
- Cuantizacion AutoRound de referencia: https://huggingface.co/dbirks/Qwen3.8-27B-W4A16-AutoRound
- Variante fast para RTX 3090: https://huggingface.co/syvai/qwen3.8-27b-3090-fast-variant
- Stack de servicio HyperQwen: https://github.com/syv-ai/HyperQwen
- Informe completo de evaluacion: https://claude.ai/artifact/SscXkuciQGhHpgwhWqoGBz
- Paper de AutoRound: arXiv:2309.05516 (https://arxiv.org/abs/2309.05516)
