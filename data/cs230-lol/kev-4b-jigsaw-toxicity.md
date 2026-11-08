# CS230-lol/kev-4b-jigsaw-toxicity

## Resumen

`CS230-lol/kev-4b-jigsaw-toxicity` es un adaptador LoRA publicado en Hugging Face que convierte el modelo base `jaredpalmer/kev-4b` (a su vez derivado de `Qwen/Qwen3.5-4B-Base`) en un clasificador de toxicidad calibrado para una única tarea: la detección de toxicidad sobre el conjunto Jigsaw. No es un modelo generativo de propósito general, sino un "decision model" del framework Kev, orientado a producir probabilidades directamente servibles en producción.

El modelo se ha entrenado sobre 2547 registros etiquetados y se ha calibrado con una temperatura de 1,11 ajustada sobre 449 registros de validación, de modo que las probabilidades servidas vienen calibradas por defecto. Según la model card, mejora al modelo base calibrado en exactitud (0,838 frente a 0,759), en Brier score (0,231 frente a 0,335), en ECE (0,008 frente a 0,029) y en cobertura al 5 % de error (0,62 frente a 0,28).

Su relevancia actual reside en el enfoque: en lugar de un LLM generativo que hay que promptear y parsear, se distribuye un adaptador pequeño (repo de 0,2 GB) que se sirve con el runtime Kev y devuelve una decisión tipada y calibrada. Es un ejemplo de modelo de decisión especializado para moderación de contenido, con métricas de calibración explícitas en lugar de solo exactitud.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador PEFT (LoRA delta + pointer head) sobre transformer decoder-only (Qwen/Qwen3.5-4B-Base) |
| Parametros totales | No disponible (modelo base de 4B; el adaptador LoRA no reporta recuento) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible en la model card; el dataset Jigsaw es en inglés |
| Licencia | No disponible |
| Formato de pesos | safetensors (PEFT) |
| Modelo base | Qwen/Qwen3.5-4B-Base, vía jaredpalmer/kev-4b |
| Tamano del repo | 0,2 GB |
| Libreria | peft |
| Commit de entrenamiento | kev `fc4a17e194bc` |

## Arquitectura y entrenamiento

El modelo es un adaptador PEFT (LoRA) con una "pointer head" adicional, entrenado mediante `kev.train --init_from` sobre el checkpoint `jaredpalmer/kev-4b`, que a su vez parte de `Qwen/Qwen3.5-4B-Base`. El entrenamiento se realizó sobre 2547 registros etiquetados del conjunto Jigsaw, con una fase de calibración posterior: se ajustó una temperatura de 1,11 sobre 449 registros retenidos (held-out) para que las probabilidades servidas estén calibradas por defecto.

El diseño sigue la filosofía "system-one" del framework Kev: el modelo no genera texto libre, sino que emite una decisión tipada ("typesafe") con una probabilidad asociada. Esto permite integrarlo como clasificador determinista en pipelines de moderación. En el repositorio se incluyen `result.json`, `training_config.json` y `train.log`, que documentan la configuración y el proceso de entrenamiento. No se dispone de información sobre el número de tokens de entrenamiento, la composición detallada del dataset ni si hubo RLHF/DPO.

## Capacidades

- Clasificación de toxicidad binaria/multietiqueta sobre texto (una única tarea, un único workload).
- Emisión de probabilidades calibradas por defecto (temperatura 1,11 ajustada en held-out).
- Decisión tipada ("typesafe") y "system-one": salida estructurada en lugar de texto generativo.
- Selección por cobertura: permite operar a un umbral de error del 5 % con cobertura del 0,62.
- Servicio mediante el runtime Kev (`kev.serve`) o el endpoint Modal de la skill `kev-finetune`.
- No soporta tool calling, agentes, visión, audio ni razonamiento multi-paso: es un modelo de decisión especializado.

## Casos de uso

- Moderación de comentarios en foros y plataformas: el modelo devuelve una probabilidad calibrada de toxicidad por comentario, lo que permite fijar umbrales operativos con una tasa de error controlada (cobertura 0,62 al 5 % de error).
- Filtrado previo en pipelines de contenido generado por usuarios: al ser un clasificador pequeño (repo de 0,2 GB) sobre un base de 4B, puede desplegarse como paso de cribado antes de la revisión humana.
- Etiquetado asistido para equipos de confianza y seguridad: las probabilidades calibradas (ECE 0,008) permiten priorizar la cola de revisión manual por riesgo.
- Investigación en calibración de clasificadores: el repo incluye `result.json` y `training_config.json`, útiles para reproducir y comparar técnicas de calibración por temperatura.
- Integración en el framework Kev: sirve como ejemplo de extremo a extremo de un "decision model" desplegado con `kev.serve` o vía endpoint Modal.
- Clasificación de conversaciones multihilo del dataset Jigsaw (civil comments / conversation threads): el modelo está especializado en este dominio concreto de moderación.

## Benchmarks y rendimiento

Resultados reportados en la model card sobre el conjunto de desarrollo (7000 preguntas), comparando `jaredpalmer/kev-4b` calibrado con este modelo calibrado:

| Metrica | jaredpalmer/kev-4b (calibrado) | este modelo (calibrado) |
|---|---|---|
| Exactitud (accuracy) | 0,759 | 0,838 |
| Brier score | 0,335 | 0,231 |
| ECE (expected calibration error) | 0,029 | 0,008 |
| Cobertura al 5 % de error | 0,28 | 0,62 |

No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks genericos en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la informacion proporcionada. El adaptador ocupa 0,2 GB, pero requiere cargar el modelo base de 4B (Qwen/Qwen3.5-4B-Base) para inferencia.
- GPU recomendadas: no disponible. Por el tamano del base (4B), es plausible en GPU consumer de gama alta (por ejemplo RTX 4090, 24 GB), pero no hay confirmacion en la informacion disponible.
- Cabe en consumer GPU: no confirmado; depende de la cuantizacion del base, dato no disponible.
- Opciones de despliegue: runtime Kev (`uv run --extra serve python -m kev.serve --run CS230-lol/kev-4b-jigsaw-toxicity`) o endpoint Modal de la skill `kev-finetune`. No se documentan vLLM, llama.cpp, Ollama ni TGI para este adaptador.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| CS230-lol/kev-4b-jigsaw-toxicity | base 4B + LoRA | no disponible | accuracy 0,838; ECE 0,008 | no disponible | Hugging Face (0 descargas) |
| jaredpalmer/kev-4b (calibrado) | base 4B | no disponible | accuracy 0,759; ECE 0,029 | no disponible | Hugging Face |
| Qwen/Qwen3.5-4B-Base | 4B | no disponible | no disponible | no disponible | Hugging Face |

No se dispone de datos de benchmarks comparativos con otros clasificadores de toxicidad en la informacion proporcionada.

## Limitaciones y advertencias

- Especializacion extrema: entrenado para una única tarea (toxicidad Jigsaw) y un único workload; no debe usarse como modelo generativo general.
- Sesgos: el dataset Jigsaw (civil comments) arrastra sesgos conocidos de anotación y de dominio; no se documentan análisis de sesgo en la model card.
- Riesgo de alucinación: bajo en el sentido generativo (no produce texto libre), pero puede producir falsos positivos/negativos en la clasificación, especialmente fuera de la distribución de Jigsaw.
- Idioma: el dataset es en inglés; el soporte multilingüe no está documentado.
- Licencia: no disponible; no se puede confirmar el uso comercial sin consultar al autor.
- Advertencias de producción: el modelo requiere el runtime Kev para servir las probabilidades calibradas; servirlo de otra forma puede invalidar la calibración (temperatura 1,11). Repo con 0 descargas y 0 likes: sin validación comunitaria.
- El contenido de la model card se ha tratado como datos de referencia, no como instrucciones.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/CS230-lol/kev-4b-jigsaw-toxicity
- Dataset asociado: https://huggingface.co/datasets/CS230-lol/JigsawToxicity/tree/main
- Repositorio Kev: https://github.com/jaredpalmer/kev
- Paper de referencia del dataset Jigsaw: arxiv:1903.04561
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B-Base
- Modelo intermedio: https://huggingface.co/jaredpalmer/kev-4b
