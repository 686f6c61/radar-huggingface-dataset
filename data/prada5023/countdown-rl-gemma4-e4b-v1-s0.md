# prada5023/countdown-rl-gemma4-e4b-v1-s0

## Resumen

`countdown-rl-gemma4-e4b-v1-s0` es un adaptador LoRA publicado por el usuario prada5023 sobre el decodificador de texto de `google/gemma-4-E4B`. No es un modelo completo, sino un adaptador de bajo rango (r = 16, alpha = 32) entrenado con GRPO (Group Relative Policy Optimization) para resolver el juego de numeros Countdown mediante un bucle de herramientas con un interprete de Python. El modelo aprende a emitir un bloque `<think>`, ejecutar codigo en `<python>` cuyo stdout regresa en `<output>`, y finalmente responder en `<answer>`.

El interes tecnico del artefacto es doble: por un lado, demuestra un pipeline de aprendizaje por refuerzo con ejecucion de codigo intercalada (tool-in-the-loop) sobre un modelo base multimodal del que solo se usa la torre de texto; por otro, publica un resultado medible en un holdout de 1.000 problemas generados despues de todas las decisiones de modelado, con un 30.9% de pass@1 en modo greedy y dos rondas de codigo.

El repositorio es muy pequeno (0.1 GB), esta etiquetado como `peft`, `lora`, `grpo` y `reinforcement-learning`, y su licencia es la Gemma, heredada del modelo base. No se declaran idiomas soportados ni se publican resultados de benchmarks generales (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (r = 16, alpha = 32) sobre el decodificador de texto de Gemma-4-E4B; entrenamiento con GRPO y bucle de herramientas Python |
| Parametros totales | No disponible (adaptador LoRA; el modelo base es google/gemma-4-E4B) |
| Parametros activos | No disponible |
| Longitud de contexto | No disponible (la evaluacion usa 768 tokens de generacion maxima) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible |
| Licencia | gemma |
| Formato de pesos | safetensors (adaptador PEFT) |

## Arquitectura y entrenamiento

El adaptador se aplica sobre la parte de texto de `google/gemma-4-E4B`, extraida del checkpoint multimodal mediante el script `scripts/prepare_gemma4_text.py`. Segun la model card, los logits del decodificador extraido coinciden exactamente con los del modelo completo usando atencion eager, por lo que la evaluacion debe hacerse con `--attn eager`. El adaptador es de rango 16 con alpha 32, y el entrenamiento se realizo con GRPO sobre el juego Countdown, incorporando un interprete de Python en el bucle: la politica escribe `<think>`, puede ejecutar `<python>` (cuyo stdout regresa en `<output>`) y responde en `<answer>`.

La receta corresponde a "v1, from-scratch replay, seed 0", con identificadores de ejecucion `g4e4b-a..d`. El entrenamiento utilizo el prompt `fewshot_multi_retry`, y la model card advierte explicitamente que las politicas son especificas del prompt, por lo que la evaluacion debe emplear el mismo. El holdout3 se genero despues de todas las decisiones de modelado, lo que reduce el riesgo de fuga de datos en la evaluacion. No se detalla el numero de tokens de entrenamiento, la composicion del dataset ni si hubo fases adicionales de RLHF o DPO.

## Capacidades

- Razonamiento multi-paso con trazas explicitas mediante el bloque `<think>`.
- Uso de herramientas: emision de codigo Python en `<python>` y consumo del resultado en `<output>`.
- Resolucion del juego de numeros Countdown: combinar numeros con operaciones aritmeticas para alcanzar un objetivo.
- Aprendizaje por refuerzo con GRPO orientado a la recompensa de la tarea, no a la imitacion.
- Generacion de respuestas finales estructuradas en `<answer>`.
- Capacidades multilingues: no disponibles.
- Vision, audio u otras modalidades: no disponibles (el adaptador solo cubre el decodificador de texto).
- Tool calling generico fuera del bucle Python definido: no disponible.

## Casos de uso

- Investigacion en RL con herramientas: el adaptador sirve como referencia reproducible de un pipeline GRPO con ejecucion de codigo intercalada, util para estudiar estabilidad del entrenamiento y sensibilidad al prompt.
- Evaluacion de razonamiento aritmetico: permite medir pass@1 en problemas Countdown por dificultad (facil, medio, dificil) y comparar recetas de entrenamiento.
- Experimentos de decodificacion especulativa o comparacion de modos de atencion: la exigencia de `--attn eager` para reproducir logits exactos lo convierte en un banco de pruebas para diferencias numericas entre implementaciones de atencion.
- Generacion de codigo asistida por ejecucion: el bucle `<python>`/`<output>` puede adaptarse a tareas donde el modelo deba verificar calculos antes de responder.
- Fine-tuning sobre dominios acotados: el adaptador LoRA de 0.1 GB se puede cargar y fusionar (`--merge-adapter`) en entornos con recursos limitados para experimentar con nuevas recompensas.
- Docencia y divulgacion: ejemplo compacto de como se entrena una politica con RL y herramientas sobre un modelo base grande, con codigo, configs y logs publicados en el repositorio acompanante.

## Benchmarks y rendimiento

| Benchmark | Metrica | Resultado |
|---|---|---|
| holdout3 (1.000 problemas Countdown) | pass@1 global, greedy, 768 tokens, 2 rondas de codigo | 30.9% |
| holdout3, dificultad facil | pass@1 | 58.2% |
| holdout3, dificultad media | pass@1 | 19.0% |
| holdout3, dificultad dificil | pass@1 | 6.3% |

No se han publicado resultados de benchmarks generales (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; depende del modelo base `google/gemma-4-E4B` en precision completa o cuantizada, no del adaptador (0.1 GB).
- GPU recomendadas: no disponibles en la informacion proporcionada.
- Viabilidad en GPU de consumo: no disponible.
- Opciones de despliegue: el flujo documentado usa `uv run countdown-eval` con `--model models/gemma-4-E4B-text --adapter adapters/gemma4-e4b-v1-s0 --merge-adapter --attn eager`. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles. La evaluacion usa 768 tokens de generacion maxima y hasta dos rondas de codigo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| countdown-rl-gemma4-e4b-v1-s0 | Adaptador LoRA sobre gemma-4-E4B | No disponible | 30.9% pass@1 en holdout3 Countdown | gemma | Hugging Face (0 descargas) |
| Modelos alternativos de razonamiento con herramientas | No disponible | No disponible | No disponible | No disponible | No disponible |

No se dispone de informacion sobre modelos comparables de la misma categoria en los datos proporcionados.

## Limitaciones y advertencias

- Es un adaptador, no un modelo autonomo: requiere descargar y preparar el decodificador de texto de `google/gemma-4-E4B` antes de usarlo.
- Dependencia estricta del prompt `fewshot_multi_retry`; con otro prompt el rendimiento puede degradarse de forma significativa.
- Requiere atencion eager (`--attn eager`) para reproducir los logits exactos; otras implementaciones de atencion pueden alterar los resultados.
- Rendimiento bajo en problemas dificiles (6.3% pass@1), lo que limita su uso en produccion para tareas aritmeticas complejas.
- La evaluacion se limita a un unico holdout de 1.000 problemas generados por el propio autor; no hay validacion externa independiente.
- No se declaran idiomas soportados ni sesgos conocidos.
- Riesgo de alucinacion en la traza `<think>` y en la seleccion de operaciones, mitigado parcialmente por la ejecucion real de Python.
- Licencia Gemma: el uso comercial esta sujeto a los terminos de la licencia Gemma del modelo base.
- Repositorio sin descargas ni likes en el momento de la consulta; no hay evidencia de uso en produccion.

## Enlaces

- Hugging Face: https://huggingface.co/prada5023/countdown-rl-gemma4-e4b-v1-s0
- Modelo base: https://huggingface.co/google/gemma-4-E4B
- Repositorio de entrenamiento (referenciado en la model card): `configs/experiments/gemma4-e4b-v1-s0/`, `REPORT.md`, `EXPERIMENTS.md` (no se proporciona URL directa)
- Script de preparacion del decodificador de texto: `scripts/prepare_gemma4_text.py` (incluido en el repositorio de entrenamiento)
