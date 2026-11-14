# Chillilly88/Haidass-exp-391B

## Resumen

Haidass-exp-391B es un checkpoint experimental de un modelo de lenguaje de gran escala entrenado desde cero por el desarrollador independiente Chillilly88. Se trata de un modelo de tipo denso (no se declara una arquitectura MoE) construido sobre la pila de entrenamiento MindSpeed (el framework de paralelismo de Huawei para Ascend) y etiquetado por el autor con la referencia "qwen3", lo que sugiere una arquitectura de familia Qwen3 o inspirada en ella. El modelo se distribuye como checkpoint nativo de MindSpeed en formato `model_optim_rng.pt`, sin conversión a Transformers.

El checkpoint final corresponde al paso 746.000 de entrenamiento, tras consumir 391.118.848 millones de tokens (391B) con una mezcla de datos fija durante todo el entrenamiento. El autor lo presenta como "resultado final de entrenamiento mixto puro" y lo compara contra una versión publicada denominada Haidass-1.5, sobre la que el checkpoint experimental obtiene puntuaciones ligeramente inferiores en la mayoría de benchmarks de conocimiento y razonamiento comunes (ARC, HellaSwag, PIQA), con mejoras marginales en Winogrande y AGIEval.

La relevancia de esta ficha es acotada: se trata de un artefacto de investigación con cero descargas y cero interacciones en el momento de la consulta, licencia no declarada, sin pesos en formato estándar y con la model card íntegramente en chino. No es un modelo listo para producción, sino un registro de un experimento de preentrenamiento a gran escala cuyos resultados el autor publica de forma transparente, incluidas las curvas de pérdida y los logs crudos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (pila MindSpeed; etiqueta "qwen3"; detalles no disponibles) |
| Parametros totales | no disponible (el nombre "391B" hace referencia a tokens, no a parámetros) |
| Parametros activos | no aplica (no se declara MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (solo se publica checkpoint nativo BF16 de MindSpeed) |
| Idiomas soportados | en, zh |
| Licencia | no disponible |
| Formato de pesos | `model_optim_rng.pt` (checkpoint nativo MindSpeed, no Transformers) |

## Arquitectura y entrenamiento

El modelo se entrenó con MindSpeed, la suite de optimización para entrenamiento distribuido sobre hardware Ascend de Huawei. La model card no detalla la arquitectura interna (número de capas, dimensión oculta, cabezas de atención ni mecanismo de atención), pero la etiqueta "qwen3" y el pipeline de preentrenamiento apuntan a un transformer decoder-only de estilo Qwen3. No se declara ningún componente MoE, decodificación especulativa ni atención lineal; el autor solo documenta el proceso de entrenamiento y sus resultados.

El entrenamiento consumió 391.118.848 millones de tokens en 746.000 pasos con una mezcla de datos fija (pesos constantes durante todo el run). La composición es mayoritariamente web en inglés y chino: ultrafineweb_en (39%) y ultrafineweb_zh (27%) suman el 66%; DCLM aporta el 13%; datos sintéticos y de instrucciones de ultrafineweb L3 (QA y multi_style) suman el 12,35%; Cosmopedia aporta el 5% distribuido en web_samples_v1/v2, stories, wikihow y stanford; finemath-4plus aporta el 2,5%; wiki_2026/en el 0,6%; y el resto son fuentes auxiliares (rewritten, wikihow_qa, hs_syn, ebook) con pesos por debajo del 0,3%. La pérdida final registrada es 2,75272, con una media de 2,76056 en los últimos 1.000 pasos. No se documenta ninguna fase de RLHF, DPO o ajuste por instrucciones.

## Capacidades

- Generación de texto autoregresiva en inglés y chino, según los tags del repositorio y la composición del corpus de entrenamiento.
- Razonamiento de conocimiento general y sentido común, evaluado en ARC, HellaSwag, PIQA, OpenBookQA y Winogrande.
- Razonamiento aritmético básico, evaluado con ArithMark (35,50% acc).
- Razonamiento académico y de examen, evaluado con AGIEval (21,12% acc).
- No se declara soporte de tool calling ni function calling.
- No se declara soporte de agentes ni razonamiento multi-paso.
- No se declara modo de pensamiento (thinking), visión, audio ni otras modalidades.
- No se declara plantilla de chat; las evaluaciones se hicieron sin chat template (0-shot).

## Casos de uso

- Investigación sobre mezclas de datos de preentrenamiento: el repositorio publica la mezcla exacta con pesos y tokens planificados por fuente, lo que permite reproducir o contrastar el efecto de una mezcla fija en el rendimiento final. Es el uso más directo del artefacto.
- Estudio de recetas de entrenamiento a gran escala en MindSpeed: los logs crudos, la curva de pérdida y el checkpoint nativo permiten analizar el comportamiento del optimizador y del paralelismo en Ascend.
- Comparación de checkpoints intermedios frente a versiones publicadas: la tabla de la model card contrasta el checkpoint final con Haidass-1.5 bajo el mismo código de evaluación, útil para estudiar degradación o deriva entre versiones.
- Evaluación de modelos base en inglés y chino sin ajuste por instrucciones: al no tener chat template, sirve para medir capacidad bruta de modelado del lenguaje en tareas de elección múltiple.
- Reproducción de benchmarks de conocimiento (ARC, HellaSwag, PIQA, OpenBookQA, Winogrande) con configuración 0-shot y normalización por longitud de caracteres.
- Análisis de la brecha entre datos web filtrados (ultrafineweb, DCLM) y datos sintéticos (Cosmopedia) en el rendimiento downstream, dado que la mezcla está documentada al detalle.

## Benchmarks y rendimiento

Resultados publicados por el autor, 0-shot, batch size 16, BF16, sin chat template. Se comparan el checkpoint final y la versión publicada Haidass-1.5, ambos re-evaluados con el mismo código.

| Benchmark | Muestras | Final acc | Haidass-1.5 acc | Dif. acc | Final acc_norm | Haidass-1.5 acc_norm | Dif. acc_norm |
|---|---|---|---|---|---|---|---|
| arc_easy | 2376 | 57,62 | 59,43 | -1,81 | 52,65 | 54,76 | -2,10 |
| arc_challenge | 1172 | 25,17 | 26,11 | -0,94 | 27,47 | 28,92 | -1,45 |
| hellaswag | 10042 | 32,94 | 34,37 | -1,42 | 39,00 | 40,70 | -1,70 |
| piqa | 1838 | 66,87 | 68,34 | -1,47 | 66,70 | 68,23 | -1,52 |
| openbookqa | 500 | 18,40 | 18,40 | +0,00 | 31,60 | 31,00 | +0,60 |
| winogrande | 1267 | 51,30 | 50,43 | +0,87 | 51,46 | 50,83 | +0,63 |
| agieval | 1851 | 21,12 | 20,85 | +0,27 | 23,61 | 22,42 | +1,19 |
| arithmark | 1000 | 35,50 | 37,40 | -1,90 | 35,60 | 38,10 | -2,50 |

El autor advierte que cada modelo usa su propia configuración de tokenizer y que las fuentes y el procesamiento de datos difieren, por lo que las diferencias no pueden atribuirse únicamente al orden de la mezcla. No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El repositorio ocupa 0,3 GB, lo que corresponde probablemente a un único archivo de pesos parcial o a un shard, no al modelo completo; no se puede estimar el tamaño real del checkpoint a partir de ese dato.
- GPU recomendadas: no disponible. El entrenamiento se realizó con MindSpeed sobre hardware Ascend, no con CUDA.
- Compatibilidad con GPU de consumo: no disponible; el formato nativo MindSpeed no es cargable directamente por llama.cpp, Ollama ni vLLM sin conversión previa.
- Opciones de despliegue: únicamente MindSpeed con la configuración de modelo correspondiente, según indica el autor. No se proporciona conversión a Transformers, GGUF ni safetensors.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| Haidass-exp-391B | no disponible | no disponible | no disponible | MindSpeed `.pt` | Repositorio HF, 0 descargas |
| Haidass-1.5 | no disponible | no disponible | no disponible | no disponible | Versión publicada del mismo autor; usada como referencia de evaluación |
| Qwen3 (familia) | no disponible en la información | no disponible | no disponible | no disponible | No se aportan datos concretos de la variante Qwen3 comparable |

No se dispone de información suficiente para comparar parámetros, contexto o licencia con alternativas de la misma categoría. La única comparación documentada es la del propio autor contra Haidass-1.5 en la tabla de benchmarks anterior.

## Limitaciones y advertencias

- Licencia no declarada: no hay autorización explícita de uso comercial ni de redistribución; debe tratarse como no apto para producción hasta que el autor la defina.
- El nombre "391B" se refiere a tokens de entrenamiento, no a parámetros; no debe interpretarse como un modelo de 391.000 millones de parámetros.
- El checkpoint está en formato nativo MindSpeed (`model_optim_rng.pt`) y requiere la configuración de modelo correspondiente; no hay conversión a Transformers, GGUF ni safetensors, lo que bloquea su uso en los stacks de inferencia habituales.
- No se publica la arquitectura interna (capas, dimensión, atención, contexto), por lo que no es posible verificar su comportamiento ni planificar su despliegue.
- El modelo no tiene ajuste por instrucciones ni chat template; su uso conversacional directo no está soportado.
- El checkpoint final rinde por debajo de Haidass-1.5 en ARC, HellaSwag, PIQA y ArithMark, con caídas de hasta 2,5 puntos en acc_norm; el autor no atribuye la causa a un factor único.
- Riesgo de alucinación y sesgos: no evaluados ni documentados en la model card; al ser un modelo base entrenado mayoritariamente con web, cabe esperar los sesgos habituales de ese corpus (no cuantificados).
- Idiomas limitados a inglés y chino; no se declara soporte de castellano.
- Cero descargas y cero interacciones en el repositorio: no hay evidencia de validación por terceros.
- El repositorio ocupa 0,3 GB, un tamaño incompatible con un checkpoint completo de un modelo de gran escala; conviene verificar la integridad de los pesos antes de cualquier uso.

## Enlaces

- Hugging Face: https://huggingface.co/Chillilly88/Haidass-exp-391B
- Pesos del checkpoint final: https://huggingface.co/Chillilly88/Haidass-exp-391B/blob/main/weights/mp_rank_00/model_optim_rng.pt
- Log de pérdida original: https://huggingface.co/Chillilly88/Haidass-exp-391B/blob/main/loss/loss_original.log
- Datos CSV de pérdida: https://huggingface.co/Chillilly88/Haidass-exp-391B/blob/main/loss/loss.csv
- Curva de pérdida completa: https://huggingface.co/Chillilly88/Haidass-exp-391B/blob/main/loss/loss_curve.png
- Curva de pérdida ampliada: https://huggingface.co/Chillilly88/Haidass-exp-391B/blob/main/loss/loss_curve_detail.png
- Informe HTML de la mezcla de datos: https://huggingface.co/Chillilly88/Haidass-exp-391B/blob/main/index.html
