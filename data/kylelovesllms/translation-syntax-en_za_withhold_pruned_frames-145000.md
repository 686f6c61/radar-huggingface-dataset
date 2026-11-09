# kylelovesllms/translation-syntax-en_za_withhold_pruned_frames-145000

## Resumen

`kylelovesllms/translation-syntax-en_za_withhold_pruned_frames-145000` es un repositorio de respaldo (backup) de una bateria de experimentos de entrenamiento del proyecto tbd-syntax, no un modelo individual. Contiene 36 ejecuciones completas de variantes de arquitectura GPT-2 de pequeno tamano (2, 4 y 6 capas; 2, 4 y 8 cabezas de atencion; dimension de modelo 256), cada una con cuatro semillas distintas (s42 a s45), entrenadas sobre un dataset de traduccion ingles-japones con "withhold pruned frames". El repositorio ocupa 9.2 GB e incluye checkpoints en formato Hugging Face, configuraciones de ejecucion, metricas y artefactos de evaluacion.

El interes del artefacto es metodologico: permite reproducir y auditar un barrido sistematico de hiperparametros de arquitectura sobre una tarea concreta de traduccion, con semillas multiples para estimar varianza. No es un modelo listo para produccion ni para uso general; es material de investigacion crudo.

No se dispone de informacion sobre licencia, idiomas declarados, pipeline ni resultados agregados de benchmarks. Los datos de arquitectura se infieren de los nombres de las ejecuciones (`gpt2-{capas}l{cabezas}h256d-s{seed}`).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GPT-2 (transformer decoder-only), variantes de 2/4/6 capas y 2/4/8 cabezas |
| Parametros totales | no disponible (dimension de modelo 256; el conteo exacto depende de la variante y del vocabulario del tokenizer) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors sin cuantizar) |
| Idiomas soportados | no disponible (el dataset de entrenamiento es ingles-japones) |
| Licencia | no disponible |
| Formato de pesos | safetensors (formato Hugging Face con `config.json` y tokenizer) |

## Arquitectura y entrenamiento

Cada ejecucion es un GPT-2 de configuracion reducida con `n_layer` en {2, 4, 6}, `n_head` en {2, 4, 8} y `n_embd` fijo en 256. El barrido cubre 9 combinaciones de profundidad y anchura de atencion, replicadas con 4 semillas (42, 43, 44, 45), lo que da 36 ejecuciones. Los checkpoints se guardan por paso (`checkpoints/stepNNNNNN/`); el nombre del repositorio sugiere el paso 145000 como referencia, aunque no se confirma en la model card.

El entrenamiento se realizo sobre el dataset `kylelovesllms/english_zapanese_withhold_pruned_frames-filled`, orientado a traduccion ingles-japones con marcos podados ("pruned frames"). No se documentan en la informacion disponible el numero de tokens, la composicion del dataset, ni si hubo RLHF, DPO o ajuste supervisado adicional. Tampoco se especifican innovaciones tecnicas como decodificacion especulativa o atencion lineal; la arquitectura es GPT-2 estandar.

## Capacidades

- Generacion de texto autoregresiva con arquitectura GPT-2.
- Traduccion ingles-japones (objetivo declarado del dataset de entrenamiento), sujeta a validacion empirica no publicada.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- Capacidades multilingues limitadas, en principio, al par ingles-japones del corpus; no hay declaracion oficial de idiomas.
- No se documentan modos especiales (thinking, vision, audio).

## Casos de uso

- Reproduccion de experimentos: el repositorio permite reentrenar y comparar las 36 configuraciones para estudiar el efecto de profundidad, cabezas y semilla en una tarea de traduccion.
- Analisis de varianza entre semillas: las cuatro semillas por configuracion permiten estimar la estabilidad del entrenamiento y la sensibilidad a la inicializacion.
- Estudio de curvas de aprendizaje: los `metrics.csv` y los checkpoints por paso permiten trazar la evolucion de la perdida y de las metricas de evaluacion.
- Baseline para modelos de traduccion de bajo coste: las variantes de 2 capas y 256 dimensiones sirven como referencia ligera en experimentos de destilacion o comparacion.
- Audicion de metodologia: util para revisar como se construyen y evaluan modelos pequenos en proyectos de investigacion abiertos.
- Docencia e investigacion: material didactico para ilustrar barridos de hiperparametros y evaluacion con multiples semillas en tareas de traduccion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card menciona carpetas `evals/` y `metrics.csv` por ejecucion, pero no se incluyen cifras agregadas ni comparaciones.

## Requisitos de hardware

- VRAM estimada: no disponible con precision; con dimension 256 y hasta 6 capas, las variantes son muy pequenas y probablemente inferiores a 1 GB en fp32 para los pesos, aunque el conteo exacto depende del vocabulario del tokenizer.
- GPU recomendadas: cualquier GPU consumer moderna es suficiente; no se requiere A100 ni H100.
- Cabe en GPU consumer: si, con margen amplio (RTX 3060, RTX 4090, etc.).
- Opciones de despliegue: transformers de Hugging Face, llama.cpp (previa conversion a GGUF), vLLM y TGI no estan documentados para esta arquitectura concreta.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Este repositorio (GPT-2 2-6 capas, 256d) | no disponible | no disponible | no disponible | Hugging Face |
| GPT-2 small (referencia) | 124M | 1024 | MIT | Hugging Face |
| GPT-2 medium (referencia) | 355M | 1024 | MIT | Hugging Face |
| Modelos de traduccion en/ja dedicados | no disponible | no disponible | variable | variable |

La comparacion es orientativa: el repositorio no declara licencia ni contexto, y su tamano es inferior al de GPT-2 small.

## Limitaciones y advertencias

- No es un modelo listo para produccion: es un backup de experimentos con 36 ejecuciones y checkpoints intermedios.
- Licencia no declarada: no se puede asumir uso comercial sin consultar al autor.
- Idiomas no declarados oficialmente; el corpus es ingles-japones y el rendimiento fuera de ese par es incierto.
- Riesgo de alucinacion y errores de traduccion propio de modelos GPT-2 pequenos entrenados con datos limitados.
- Sesgos desconocidos: no se documenta filtrado ni evaluacion de sesgos en el corpus.
- Contexto y tokenizer no especificados: puede haber incompatibilidades al cargar con pipelines estandar sin revisar `config.json`.
- Ausencia de `resume/` (estado del optimizador): no se puede reanudar el entrenamiento exactamente desde el punto guardado.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/kylelovesllms/translation-syntax-en_za_withhold_pruned_frames-145000
- Dataset de entrenamiento: https://huggingface.co/datasets/kylelovesllms/english_zapanese_withhold_pruned_frames-filled
- Codigo fuente del proyecto: https://github.com/Ky-Ng/tbd-syntax/tree/backup/2026-11-08-working-tree/src/training/exp_english_zapanese_withhold_pruned_frames
