# iversse/scottyrl-a3-p5_textcraft_grpo

## Resumen

`iversse/scottyrl-a3-p5_textcraft_grpo` es un adaptador LoRA de rango 32 sobre el modelo base `Qwen/Qwen3.5-4B`, entrenado con el framework scottyrl mediante GRPO (optimización de política con ventaja relativa por grupo) para la asignatura 11-768 (AI Agents) de CMU, en su Assignment 3. No es un modelo completo, sino un conjunto de pesos delta de 0,2 GB que debe servirse junto al modelo base para funcionar.

El adaptador está especializado en el entorno TextCraft, una tarea de agentes basada en texto en la que hay que encadenar acciones para fabricar objetos a partir de recetas. El autor documenta un protocolo de evaluación concreto: servir el adaptador con vLLM en modo LoRA, ejecutar el script del curso contra el servidor y medir sobre las particiones de validación medium y hard de TextCraft-Synth con `k=4`.

Su relevancia es fundamentalmente metodológica y docente: es un artefacto reproducible de investigación (run `p5_textcraft_grpo`, exportado desde `tinker://model_ecce1aa5/v50_r4`, commit `ef42c0d35c0c5b52d327a21fa2bb23a15d52d76e`) que ilustra cómo se aplica RL con GRPO a un modelo de 4B para mejorar el comportamiento agéntico en entornos de texto. Con 0 descargas y 1 like en el momento de la consulta, no debe considerarse un modelo listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre un transformer decoder-only del modelo base Qwen/Qwen3.5-4B; la arquitectura interna del base no se detalla en la informacion disponible |
| Parametros totales | Modelo base: 4B (segun el identificador del modelo). Adaptador LoRA de rango 32; numero exacto de parametros del adaptador no disponible (repo de 0,2 GB) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponibles para el adaptador; al servirse junto a los pesos base, admite las cuantizaciones que soporte Qwen/Qwen3.5-4B (no documentadas en la informacion disponible) |
| Idiomas soportados | no disponible (heredados del modelo base, sin documentar) |
| Licencia | no disponible |
| Formato de pesos | safetensors (adaptador PEFT/LoRA); libreria `peft` |

## Arquitectura y entrenamiento

El artefacto es un adaptador LoRA de rango 32 sobre `Qwen/Qwen3.5-4B`, exportado desde la infraestructura Tinker (`tinker://model_ecce1aa5/v50_r4`) y entrenado con el framework scottyrl, que envuelve el ciclo de RL sobre modelos servidos. El entrenamiento usa GRPO: en lugar de un crítico independiente, se generan grupos de respuestas por prompt y se estima la ventaja de cada una normalizando las recompensas dentro del grupo, lo que reduce coste de memoria frente a PPO clásico y encaja bien con tareas de recompensa verificable como un entorno de crafting.

El dominio de entrenamiento es TextCraft (run `p5_textcraft_grpo`, config `configs/p5_textcraft_grpo.yaml`): un agente debe ejecutar acciones textuales para obtener y combinar objetos hasta alcanzar un objetivo. La informacion disponible no detalla el volumen de tokens, la composicion del dataset, ni si hubo fases previas de SFT o DPO; tampoco se especifican innovaciones de decodificacion o atención. El adaptador se distribuye como delta de pesos, por lo que no modifica el tokenizador ni la arquitectura del base.

## Capacidades

- Generacion de texto y razonamiento multi-paso orientado a agentes: el entrenamiento con GRPO busca mejorar la planificacion de secuencias de acciones en entornos de texto.
- Ejecucion de políticas de acción en entornos tipo TextCraft: seleccionar acciones válidas y encadenarlas para completar recetas de crafting.
- Formato de acción/herramienta según la convención del entorno del curso (no se documenta un esquema de function calling general).
- Capacidad de ser servido como módulo LoRA intercambiable en vLLM (`--enable-lora --max-lora-rank 32`), lo que permite comparar varias políticas sobre el mismo base.
- Capacidades multilingues: no disponibles (no documentadas para el adaptador).
- Capacidades especiales (vision, audio, thinking mode explícito): no disponibles.

## Casos de uso

- Investigacion en RL para agentes: reproducir el pipeline de GRPO sobre un base de 4B y comparar curvas de recompensa frente a SFT, usando el adaptador como checkpoint de referencia del run `p5_textcraft_grpo`.
- Evaluacion de políticas en entornos de crafting: servir el adaptador en vLLM y medir sobre `data/textcraft_val_hard.jsonl` con `k=4` para obtener tasas de éxito en la partición difícil.
- Docencia y trabajo de curso: material reproducible para la asignatura 11-768 (AI Agents, CMU), con config, commit y protocolo de evaluación documentados.
- Servido multi-adaptador en una sola GPU: al ser LoRA de rango 32 sobre un base de 4B, permite cargar varias políticas (`--lora-modules`) en el mismo servidor vLLM para comparaciones A/B.
- Prototipado de entornos agénticos: usar el adaptador como política base al diseñar un nuevo entorno de texto con recompensas verificables, antes de invertir en un modelo mayor.
- Base para post-entrenamiento propio: punto de partida (o ablation) para experimentos de RL con otras recompensas, aplicando un nuevo LoRA sobre el mismo base sin reentrenar desde cero.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card describe únicamente el protocolo de evaluación, sin cifras:

| Benchmark | Configuracion | Resultado |
|---|---|---|
| TextCraft-Synth validacion (medium) | vLLM + LoRA, `k=4`, `scripts/evaluate_checkpoint.py` | no disponible |
| TextCraft-Synth validacion (hard) | vLLM + LoRA, `k=4`, `--tasks data/textcraft_val_hard.jsonl` | no disponible |
| MMLU / HumanEval / GSM8K | no evaluados en la informacion disponible | no disponible |

## Requisitos de hardware

- VRAM para inferencia: el base de 4B en bf16/fp16 requiere aproximadamente 8-9 GB de pesos, más overhead de KV cache; el adaptador añade 0,2 GB. En cuantizacion de 4 bits el conjunto baja a unos 3-4 GB, aunque la cuantizacion del base no está documentada.
- GPU recomendadas: A100 40/80 GB o H100 para servir con concurrencia alta y varias políticas LoRA; L40S o A10G para despliegue moderado.
- GPU de consumo: sí cabe. RTX 4090 (24 GB), RTX 4080/4070 Ti Super (16 GB), RTX 4060 Ti 16 GB e incluso RTX 3060 12 GB en bf16 con contexto moderado; en 4 bits, GPU de 8 GB.
- Despliegue: vLLM es la vía documentada por el autor (`--enable-lora --max-lora-rank 32 --lora-modules a3=iversse/scottyrl-a3-p5_textcraft_grpo`). Alternativas: TGI con adaptadores LoRA; para llama.cpp u Ollama es necesario fusionar el adaptador con los pesos base (merge de PEFT) y convertir a GGUF.
- Latencia y throughput: no disponibles. El único parámetro conocido es el de evaluación (`--k 4`), que implica 4 muestras por tarea y por tanto un coste de decodificacion multiplicado por 4 en la fase de medida.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| scottyrl-a3-p5_textcraft_grpo (este) | LoRA r32 sobre base 4B | no disponible | sin cifras publicadas; protocolo TextCraft-Synth k=4 | no disponible | HuggingFace, 0 descargas |
| Qwen/Qwen3.5-4B (base sin adaptar) | 4B | no disponible | sin datos en la informacion disponible | no disponible | HuggingFace (referenciado como base) |
| Otros adaptadores LoRA de la misma familia scottyrl (p. ej. otros runs del curso 11-768) | rango 32 sobre el mismo base | no disponible | no disponible | no disponible | no identificados en la informacion disponible |

No se identifican en la informacion proporcionada alternativas comparables con datos verificables de parámetros, contexto o resultados; la comparación cuantitativa queda por tanto no disponible.

## Limitaciones y advertencias

- No es un modelo autónomo: requiere cargar `Qwen/Qwen3.5-4B` y aplicar el adaptador; sin el base, los pesos son inútiles.
- Licencia no declarada: no hay base legal explícita para uso comercial; hay que atenerse a la licencia del modelo base y contactar con el autor.
- Dominio muy estrecho: entrenado para TextCraft; es previsible un deterioro del rendimiento en conversación general, código o matemáticas respecto al base, aunque no hay mediciones publicadas que lo cuantifiquen.
- Sin datos de evaluación publicados: no se puede afirmar que el adaptador mejore al base sin ejecutar el script del curso; el `k=4` es un protocolo de evaluación, no un resultado.
- Riesgo de alucinación y de acciones inválidas: en entornos de agente, una política de RL puede generar acciones sintácticamente válidas pero inexistentes en el estado del mundo; no se documenta ningún mecanismo de validación o guardarraíl.
- Idiomas y sesgos no documentados: se heredan del base y no han sido evaluados.
- Artefacto académico con 0 descargas: sin mantenimiento, sin issues, sin versionado posterior conocido; tratarlo como snapshot de investigación (commit `ef42c0d3…`).
- La evaluación depende de scripts y ficheros de datos del curso (`scripts/evaluate_checkpoint.py`, `configs/p5_textcraft_grpo.yaml`, `data/textcraft_val_hard.jsonl`) que no forman parte del repo del modelo.

## Enlaces

- HuggingFace: https://huggingface.co/iversse/scottyrl-a3-p5_textcraft_grpo
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Paper, blog o repositorio del framework scottyrl: no disponible en la informacion proporcionada
- Documentacion o demo del entorno TextCraft-Synth: no disponible en la informacion proporcionada
- Repositorio del curso 11-768 (AI Agents, CMU): no disponible en la informacion proporcionada
