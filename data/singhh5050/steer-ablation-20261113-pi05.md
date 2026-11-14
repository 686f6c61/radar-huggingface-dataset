# singhh5050/steer-ablation-20261113-pi05

## Resumen

`steer-ablation-20261113-pi05` es un conjunto de siete políticas robóticas π0.5 publicadas por el usuario singhh5050 en Hugging Face, derivadas por fine-tuning del checkpoint público de RoboCasa `robocasa/robocasa365_checkpoints` (variante `pi05_pretrain_human300/multitask_learning/75000`). Cada una de las siete ramas se ha entrenado durante 4.000 pasos sobre el mismo pool ponderado de episodios de la tarea `RecycleBottlesByType` (100 demos de teleoperación humana, demos sintéticas scriptadas y aumentaciones de tipo MimicGen; 1.344 episodios en total). El único factor que varía entre ramas es la leyenda "Current subtask" que se concatena a la instrucción de tarea durante el entrenamiento.

El objetivo del artefacto es un estudio de ablación sobre *language steering*: medir hasta qué punto un modelo de política visión-lenguaje-acción (VLA) aprende a condicionar su comportamiento en campos semánticos concretos del *prompt* (objeto, grupo destino, altura de transporte, tipo de agarre) cuando dichos campos aparecen en el entrenamiento. Las siete ramas son `action_only`, `plus_o`, `plus_d`, `plus_h`, `plus_c`, `all` y `all_shuffled` (control con leyendas barajadas).

Es relevante ahora porque π0.5 y el ecosistema openpi se han convertido en una referencia para manipulación robótica de propósito general con modelos VLA, y este repositorio ofrece un banco reproducible de pesos y procedencia de entrenamiento para estudiar el control fino mediante lenguaje. El repositorio ocupa 87,1 GB y la licencia es Apache 2.0. No es un modelo de propósito general: es un artefacto de investigación en robótica.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | π0.5 (VLA; vision-lenguaje-acción) sobre backbone PaliGemma, según model card y config `pi05_pretrain_human300` de openpi |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | `max_token_len=200` (configuración de inferencia indicada por el autor) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (las instrucciones de tarea se proporcionan en lenguaje natural; el tokenizador es PaliGemma) |
| Licencia | Apache 2.0 |
| Formato de pesos | Orbax/OCDBT en formato openpi (`checkpoint_4000/params/`), con assets de normalización y `SHA256SUMS` |

## Arquitectura y entrenamiento

El modelo base es π0.5, una política VLA que combina un backbone de visión-lenguaje PaliGemma con una cabeza de acciones, en la línea de los modelos π0/π0.5 de Physical Intelligence. El autor no detalla la arquitectura interna en la model card; la información disponible se limita a la configuración de openpi empleada (`pi05_pretrain_human300`), el tokenizador PaliGemma (no incluido, se descarga desde `gs://big_vision/paligemma_tokenizer.model`) y el formato de *prompt*: `<task instruction>\nCurrent subtask: <caption>`.

El fine-tuning parte del checkpoint público de RoboCasa y se ejecuta durante 4.000 pasos con batch 64, 1.000 pasos de *warmup* y LR constante, sobre un pool compartido de 1.344 episodios de `RecycleBottlesByType` (100 demos humanas, demos sintéticas scriptadas y aumentaciones de acarreo tipo MimicGen). Las siete ramas comparten datos, pesos de muestreo, semilla del sampler y schedule; la única variable experimental es la leyenda "Current subtask": solo acción (`action_only`), más objeto (`plus_o`), más grupo destino (`plus_d`), más altura de acarreo (`plus_h`), más contacto (`plus_c`), los cuatro campos (`all`) y los cuatro campos barajados entre episodios como control (`all_shuffled`). No se menciona RLHF, DPO ni etapas de alineación adicionales. El repositorio incluye procedencia de entrenamiento (`run/`: config, recibos de dataset y checkpoint, métricas de train/validación, tiempos) y un `MANIFEST.json` con tamaños y SHA-256 de cada fichero.

## Capacidades

- Control robótico de manipulación: políticas de acción para la tarea de clasificación de botellas (`RecycleBottlesByType`) en escenas de RoboCasa.
- Condicionamiento por lenguaje: las ramas de un solo campo responden al valor solicitado en la leyenda "Current subtask" (objeto, grupo destino, altura de acarreo o tipo de contacto) y lo invierten cuando se les pide el valor contrario.
- Seguimiento combinado de múltiples campos en la rama `all`.
- Entrada multimodal: instrucción de tarea en lenguaje natural más observaciones visuales (backbone PaliGemma).
- No se documentan tool calling, function calling, razonamiento multi-paso, agentes, modo *thinking*, audio ni otras capacidades generales; el artefacto es específico de robótica.
- Capacidades multilingües: no disponibles.

## Casos de uso

- Estudio de *steering* por lenguaje en políticas VLA: comparar las siete ramas permite aislar qué campos semánticos del *prompt* modifican realmente la conducta del robot y cuáles se ignoran, con datos, semilla y schedule controlados.
- Investigación en composición de instrucciones: la rama `all` frente a `all_shuffled` sirve para medir si el modelo aprende la asociación campo-valor o simplemente memoriza correlaciones espurias del dataset.
- Reproducción de experimentos de RoboCasa: los checkpoints en formato openpi, con assets de normalización y `SHA256SUMS`, permiten repetir los *rollouts* cerrados sobre las 14 escenas descritas por el autor.
- Análisis de sensibilidad a la altura de acarreo: la rama `plus_h` es útil para estudiar control fino de trayectorias (el autor reporta ~5,5 cm más de altura al pedir "high" frente a "low").
- Evaluación de robustez ante instrucciones contradictorias: pedir a una rama de un solo campo un valor distinto al entrenado permite medir la obediencia al *prompt* frente a la política por defecto (p. ej., +Target envía un 97 % más de botellas al otro grupo al pedir el intercambio).
- Docencia y formación en VLA: el repositorio, con procedencia completa y manifiesto de integridad, sirve como ejemplo práctico de diseño de ablaciones y de empaquetado de checkpoints openpi.
- Línea base para futuros fine-tunings: al estar bajo Apache 2.0 y derivar de un checkpoint público, puede reutilizarse como punto de partida para nuevas tareas de clasificación con condicionamiento semántico.

## Benchmarks y rendimiento

El autor reporta una evaluación de *rollouts* cerrados de tarea completa sobre 14 escenas, con una sola semilla de entrenamiento y 14 escenas por condición. No se publican métricas estándar (MMLU, HumanEval, GSM8K, etc.), que no aplican a este tipo de modelo.

| Rama | Comportamiento observado en la evaluación del autor |
|---|---|
| `action_only` | No sigue ningún campo de la leyenda |
| `plus_o` | Sigue el campo objeto (plástico/vidrio) e ignora el resto |
| `plus_d` | Sigue el grupo destino; al pedir intercambio envía un 97 % más de botellas al otro grupo |
| `plus_h` | Sigue la altura; acarrea ~5,5 cm más alto con "high" que con "low" |
| `plus_c` | Sigue el tipo de contacto (cuello/cuerpo) e ignora el resto |
| `all` | Sigue los cuatro campos |
| `all_shuffled` | No sigue ninguno (control) |

Éxito de tarea: bajo en todas las ramas, con 3–6 escenas exitosas de 14 usando la instrucción de tarea simple. No se han publicado resultados de benchmarks adicionales en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El repositorio ocupa 87,1 GB e incluye siete checkpoints completos más procedencia; el tamaño de un checkpoint individual no se detalla en la model card.
- GPU recomendadas: no disponible. El autor no especifica hardware de entrenamiento ni de inferencia más allá de la configuración de openpi.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: openpi (fork de RoboCasa, `robocasa-benchmark/openpi` en el commit `5a6beda9`), con config `pi05_pretrain_human300`, `max_token_len=200` y normalización desde `checkpoint_4000/assets/`. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este formato de pesos.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| `singhh5050/steer-ablation-20261113-pi05` | π0.5 fine-tuned (7 ramas) | `max_token_len=200` | Apache 2.0 | Hugging Face, 87,1 GB | Ablación de *language steering* sobre RoboCasa |
| `robocasa/robocasa365_checkpoints` (checkpoint base) | π0.5 preentrenado | no disponible | no disponible en la información | Hugging Face | Punto de partida del fine-tuning; sin las leyendas de subtarea |
| π0.5 (modelo original de Physical Intelligence) | VLA generalista | no disponible | no disponible en la información | no disponible en la información | Referencia arquitectónica; no se comparan métricas en la información proporcionada |
| Otras políticas VLA de la familia openpi | VLA | no disponible | no disponible en la información | Repositorio openpi | No se dispone de datos comparativos de rendimiento en la información proporcionada |

No se dispone de comparaciones cuantitativas de rendimiento con alternativas en la información proporcionada.

## Limitaciones y advertencias

- Éxito de tarea bajo: solo 3–6 escenas exitosas de 14 con la instrucción simple, según el propio autor; no es un modelo listo para producción.
- Una sola semilla de entrenamiento y 14 escenas por condición: los resultados de la ablación tienen alta varianza y no permiten conclusiones estadísticas firmes.
- Dominio muy estrecho: entrenado exclusivamente para `RecycleBottlesByType` en RoboCasa; no generaliza a otras tareas, entornos o morfologías sin nuevo fine-tuning.
- Dependencia de la leyenda "Current subtask": fuera del formato de *prompt* documentado el comportamiento puede degradarse de forma no caracterizada.
- Tokenizador no incluido: requiere descargar el tokenizador PaliGemma desde `gs://big_vision/paligemma_tokenizer.model`, lo que añade una dependencia externa.
- Formato de pesos específico de openpi (Orbax/OCDBT): no es directamente cargable en stacks de inferencia convencionales.
- Sin estado de optimizador en los checkpoints: no permite reanudar el entrenamiento, solo inferencia.
- Sesgos y riesgo de alucinación: no documentados por el autor; al ser un modelo de acción, el riesgo se traduce en conductas erróneas del robot más que en texto inventado.
- Licencia Apache 2.0: permite uso comercial, pero la procedencia del checkpoint base (`robocasa/robocasa365_checkpoints`) y de los datos de entrenamiento debe verificarse por separado antes de un despliegue comercial.
- Artefacto de investigación con 0 descargas y 0 *likes* en el momento de la consulta: sin validación externa por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/singhh5050/steer-ablation-20261113-pi05
- Checkpoint base: https://huggingface.co/robocasa/robocasa365_checkpoints
- Repositorio openpi (fork de RoboCasa): https://github.com/robocasa-benchmark/openpi (commit `5a6beda9`)
- Tokenizador PaliGemma: `gs://big_vision/paligemma_tokenizer.model`
- No se han encontrado en la información proporcionada papers, blogs ni demos adicionales.
