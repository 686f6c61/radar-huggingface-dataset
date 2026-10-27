# chihyul3/scottyrl-a3-p5_textcraft_grpo

## Resumen

`chihyul3/scottyrl-a3-p5_textcraft_grpo` es un adaptador LoRA de rango 32 sobre el modelo base `Qwen/Qwen3.5-4B`, entrenado con el framework scottyrl para la asignatura 11-768 (AI Agents) de la Universidad Carnegie Mellon, dentro de la Assignment 3. No se trata por tanto de un modelo completo, sino de un conjunto de pesos delta (0,2 GB) que deben cargarse junto al modelo base para poder inferir.

El nombre de la ejecución, `p5_textcraft_grpo`, indica que el entrenamiento se realizó con GRPO (Group Relative Policy Optimization) sobre el entorno sintético TextCraft-Synth, un escenario de agentes basado en texto en el que el modelo debe manipular objetos y recetas mediante acciones encadenadas. El adaptador se exportó desde Tinker (`tinker://model_0ed9d90f/v50`) y se publica en formato PEFT, pensado para servirse con vLLM habilitando LoRA.

Su relevancia es acotada y de carácter fundamentalmente académico y experimental: sirve como artefacto reproducible de un pipeline de RL para agentes, y como ejemplo de despliegue multi-LoRA con vLLM. No hay información publicada sobre licencia, idiomas, contexto efectivo ni resultados de benchmarks, por lo que cualquier uso en producción exige una validación propia previa.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (rango 32) sobre el transformer `Qwen/Qwen3.5-4B`; la arquitectura interna del modelo base no se detalla en la información disponible |
| Parámetros totales | Modelo base ~4B (según la nomenclatura del identificador); el adaptador no declara su número de parámetros, el repositorio ocupa 0,2 GB |
| Parámetros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible (se hereda del modelo base `Qwen/Qwen3.5-4B`, sin confirmación en la model card) |
| Tipos de cuantización | no disponible; solo se publican pesos del adaptador en safetensors, sin versiones GGUF, AWQ ni GPTQ |
| Idiomas soportados | no disponible (no declarados por el autor) |
| Licencia | no disponible |
| Formato de pesos | safetensors (adaptador PEFT/LoRA); requiere descargar el modelo base por separado |
| Rango LoRA | 32 |
| Framework de entrenamiento | scottyrl (`configs/p5_textcraft_grpo.yaml`, commit `ef42c0d35c0c5b52d327a21fa2bb23a15d52d76e`) |
| Origen de la exportación | Tinker, `tinker://model_0ed9d90f/v50` |
| Librería declarada | peft |
| Pipeline de HuggingFace | no disponible |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

El artefacto es un adaptador de bajo rango (LoRA, rank 32) que se acopla a las capas del modelo `Qwen/Qwen3.5-4B`. No se especifican en la información disponible los módulos objetivo del adaptador, el valor de alpha, el dropout ni el número de parámetros entrenables. El repositorio contiene únicamente los pesos delta en safetensors, de modo que la arquitectura efectiva en inferencia es la del modelo base más la modificación introducida por el adaptador.

El entrenamiento se realizó con el framework scottyrl y la configuración `configs/p5_textcraft_grpo.yaml`, y el sufijo `grpo` del nombre de la ejecución apunta a un ajuste mediante optimización de política con grupos relativos (GRPO), es decir, aprendizaje por refuerzo con recompensas derivadas del entorno TextCraft-Synth en lugar de ajuste supervisado clásico. No se han publicado el número de tokens de entrenamiento, la composición del dataset, el número de pasos ni los hiperparámetros de RL (tamaño de grupo, coeficiente KL, recompensa utilizada). Tampoco se documenta ninguna innovación técnica adicional (decodificación especulativa, atención lineal, etc.).

## Capacidades

- Generación de texto y razonamiento general heredados del modelo base `Qwen/Qwen3.5-4B`; el adaptador no declara modificaciones en estas capacidades más allá del entrenamiento específico de la Assignment 3.
- Ejecución de tareas de agente en entornos de texto: el entrenamiento está orientado a TextCraft-Synth, un escenario de crafting con acciones e inventario.
- Planificación multi-paso con herramientas: la evaluación del curso se realiza sobre tareas que requieren secuencias de acciones, lo que sugiere entrenamiento en razonamiento encadenado con llamadas a acciones.
- Tool calling / function calling: no confirmado explícitamente en la model card; el formato de acciones del entorno TextCraft-Synth no se detalla.
- Capacidades multilingües: no disponible; el autor no declara idiomas.
- Visión, audio o modalidades adicionales: no disponible, no se mencionan.
- Modo de razonamiento explícito (thinking mode): no disponible.

## Casos de uso

- Reproducción de experimentos de RL para agentes: cargar el adaptador con vLLM (`--enable-lora --max-lora-rank 32`) y ejecutar `scripts/evaluate_checkpoint.py` con `--k 4` sobre las particiones de validación medium y hard de TextCraft-Synth para replicar los resultados del autor.
- Servicio multi-LoRA en un único servidor: al ser un adaptador PEFT de rango 32, puede convivir con otros adaptadores en la misma instancia de vLLM, lo que permite comparar variantes de un mismo modelo base sin duplicar la GPU.
- Docencia y evaluación de estudiantes: el artefacto está diseñado como entrega evaluable de la Assignment 3 de 11-768, de modo que sirve como referencia de pipeline completo (entrenamiento, exportación desde Tinker, despliegue y evaluación con pass@k).
- Investigación en entornos sintéticos de planificación: útil como punto de partida para estudiar cómo el RL con GRPO modifica el comportamiento de un modelo de 4B en tareas de manipulación de objetos y recetas.
- Generación de trayectorias para imitación: las rollouts producidas por el adaptador en TextCraft-Synth pueden recolectarse como datos para un posterior ajuste supervisado de otro modelo.
- Prototipado de sub-agentes ligeros en local: con el modelo base cuantizado a 4 bits cabe en GPUs de consumo, lo que permite experimentar con un agente especializado en tareas de planificación acotadas sin coste de API.
- Ablación de hiperparámetros de RL: comparar este adaptador con las copias publicadas por otros usuarios (mismo nombre de ejecución) para analizar la varianza entre entrenamientos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card únicamente describe el procedimiento de evaluación (vLLM + `scripts/evaluate_checkpoint.py` sobre las particiones medium y hard de TextCraft-Synth con `k=4`), sin incluir métricas, tasas de éxito ni comparaciones numéricas con otros modelos.

| Benchmark | Resultado | Notas |
|---|---|---|
| TextCraft-Synth val (medium) | no disponible | Evaluación prevista por el autor con `--k 4`, sin cifras publicadas |
| TextCraft-Synth val (hard) | no disponible | Evaluación prevista con `data/textcraft_val_hard.jsonl`, sin cifras publicadas |
| MMLU / HumanEval / GSM8K | no disponible | No evaluados en la información proporcionada |

## Requisitos de hardware

- VRAM para inferencia: el adaptador en sí ocupa 0,2 GB, pero requiere el modelo base de ~4B. Estimación para el base en fp16: en torno a 8-9 GB de pesos, más caché KV; en cuantización de 4 bits, aproximadamente 2,5-3,5 GB (estimación basada en el tamaño declarado de 4B, no confirmada por el autor).
- GPU recomendadas: A100 40/80 GB o H100 para servir con vLLM en fp16 con concurrencia alta y ventanas de contexto largas; L40S o A10G como alternativas de coste medio.
- GPU de consumo: sí cabe en RTX 4090 (24 GB) y RTX 3090 (24 GB) en fp16; en RTX 4060 Ti 16 GB o RTX 4070 Ti SUPER sería necesario cuantizar el modelo base, ya que el repositorio no publica pesos cuantizados.
- Despliegue documentado: vLLM con `vllm serve Qwen/Qwen3.5-4B --enable-lora --max-lora-rank 32 --lora-modules a3=chihyul3/scottyrl-a3-p5_textcraft_grpo`. Esta es la única ruta indicada por el autor.
- Otras opciones (llama.cpp, Ollama, TGI): no documentadas. Requerirían fusionar el adaptador con el modelo base y convertir el resultado a GGUF, un proceso que el autor no proporciona.
- Latencia y throughput: no disponibles. No se han publicado mediciones de tokens por segundo ni de latencia por petición.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `chihyul3/scottyrl-a3-p5_textcraft_grpo` | ~4B (base) + LoRA r32 | no disponible | sin datos publicados | no disponible | HuggingFace, 0 descargas |
| `Qwen/Qwen3.5-4B` (modelo base sin adaptador) | ~4B | no disponible en esta ficha | sin datos en esta ficha | no disponible en esta ficha | HuggingFace |
| `BrianUppp/scottyrl-a3-p5_textcraft_grpo` | ~4B (base) + LoRA r32 | no disponible | sin datos publicados | no disponible | HuggingFace |
| `Honcel/scottyrl-a3-p5_textcraft_grpo` | ~4B (base) + LoRA r32 | no disponible | sin datos publicados | no disponible | HuggingFace |
| `sdharod/scottyrl-a3-p5_textcraft_grpo` | ~4B (base) + LoRA r32 | no disponible | sin datos publicados | no disponible | HuggingFace |

Las copias de otros usuarios (`BrianUppp`, `Honcel`, `oliviabgp`, `sdharod`, `racheleven11`) comparten exactamente el mismo nombre de ejecución y descripción, por lo que parecen proceder de la misma plantilla de Assignment 3 y no constituyen alternativas funcionalmente distintas. No se dispone de datos de rendimiento para establecer una comparación cuantitativa con modelos de la misma categoría.

## Limitaciones y advertencias

- Licencia no declarada: no es posible confirmar si se permite uso comercial, modificación o redistribución. Tratar como no apto para producción hasta aclararlo con el autor.
- Artefacto académico: el adaptador está entrenado para una única Assignment de un curso, sobre un entorno sintético concreto (TextCraft-Synth); la generalización fuera de ese dominio no está demostrada.
- Dependencia del modelo base: no funciona de forma autónoma; requiere descargar `Qwen/Qwen3.5-4B` y aplicar el adaptador con PEFT o vLLM.
- Sin métricas publicadas: no hay evidencia numérica de mejora frente al modelo base, ni curvas de entrenamiento, ni análisis de regresiones.
- Sesgos: no documentados por el autor; al heredarse del modelo base, los sesgos de este se mantienen y el ajuste con RL puede amplificar sesgos específicos de la política aprendida en el entorno.
- Riesgo de alucinación: no evaluado. En tareas de agente con acciones, el fallo típico es la invención de acciones o de estado del inventario, no solo texto incorrecto.
- Idiomas y contexto: sin datos declarados; el contexto efectivo puede ser menor que el del modelo base si el entrenamiento se realizó con ventanas cortas.
- Repositorio de 0,2 GB: contiene solo el adaptador; verificar que los ficheros de configuración PEFT (`adapter_config.json`) estén presentes antes de desplegar.
- Fecha de creación registrada como 2026-10-27: conviene verificar la vigencia y la integridad del repositorio antes de usarlo como referencia.
- Sin cuantizaciones publicadas: el despliegue en GPUs de gama media requiere trabajo adicional de fusión y conversión no soportado por el autor.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/chihyul3/scottyrl-a3-p5_textcraft_grpo
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Copia de BrianUppp: https://huggingface.co/BrianUppp/scottyrl-a3-p5_textcraft_grpo
- Copia de Honcel: https://huggingface.co/Honcel/scottyrl-a3-p5_textcraft_grpo
- Copia de oliviabgp: https://huggingface.co/oliviabgp/scottyrl-a3-p5_textcraft_grpo
- Copia de sdharod: https://huggingface.co/sdharod/scottyrl-a3-p5_textcraft_grpo
- Copia de racheleven11: https://huggingface.co/racheleven11/scottyrl-a3-p5_textcraft_grpo
- Documentación del framework scottyrl, paper y repositorio: no disponibles en la información proporcionada.
- Demo o espacio de inferencia: no disponible.
