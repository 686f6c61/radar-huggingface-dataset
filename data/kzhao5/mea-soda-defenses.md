# kzhao5/mea-soda-defenses

## Resumen

`kzhao5/mea-soda-defenses` es un repositorio de artefactos de investigación alojado en HuggingFace, no un modelo de lenguaje listo para uso general. Contiene las salidas completas de la ejecución del ataque de extracción SODA (DPO sobre pares de preferencia profesor‑vs‑estudiante) contra las seis defensas de tipo generador del benchmark MEA, junto con la línea base limpia de SODA. El autor lo publica como material complementario de los repositorios hermanos `mea-seqkd-defenses` y `mea-qedks-defenses`.

El repositorio se construye sobre `Qwen/Qwen2.5-7B` y emplea adaptadores LoRA en formato safetensors mediante la librería PEFT, mientras que el ataque utiliza `Qwen/Qwen2.5-72B-Instruct` como profesor. El objetivo es medir si las defensas anti‑destilación y los detectores de marcas de agua sobreviven cuando un atacante intenta extraer el comportamiento del profesor mediante DPO. Su relevancia es metodológica: documenta de forma transparente un caso en el que el ataque apenas entrena y advierte explícitamente de que los resultados de los detectores no deben interpretarse todavía.

El repositorio está en estado de subida parcial (los controles negativos de `ginsew` y `radioactivity` siguen ejecutándose) y ocupa 0,6 GB en total. No incluye model card de uso general, idiomas declarados ni resultados de benchmarks convencionales como MMLU o HumanEval.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder‑only (modelo base Qwen2.5‑7B) con adaptadores LoRA entrenados mediante DPO |
| Parametros totales | Modelo base Qwen2.5‑7B; adaptadores LoRA con r=16 y alpha=32 (tamaño del adaptador no especificado; repositorio completo de 0,6 GB) |
| Longitud de contexto | No disponible para el adaptador; la configuración de entrenamiento DPO usa max_length 3544 y max_prompt 1024 |
| Tipos de cuantizacion | No disponible (se distribuyen adaptadores LoRA en safetensors; la cuantización del modelo base no se documenta) |
| Idiomas soportados | No disponibles |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (adaptadores PEFT/LoRA) |

## Arquitectura y entrenamiento

El material distribuido son adaptadores LoRA (r=16, alpha=32) sobre el modelo base `Qwen/Qwen2.5-7B`, entrenados con DPO (β=0,1, learning rate 5e-6, 1 época, aproximadamente 32 pasos de optimizador con grad‑accum 32, precisión bf16, max_length 3544). El ataque SODA usa un presupuesto de 1000 consultas y un profesor `Qwen/Qwen2.5-72B-Instruct`; los negativos del estudiante son un fichero compartido generado con el 7B base servido con vLLM (temperatura 0,7, top_p 1,0, máximo 1536 tokens, semilla 20260701). Los pares de preferencia se construyen emparejando respuestas del profesor con respuestas del estudiante base.

El resultado documentado es que, en esta configuración, SODA apenas aprende: DPO parte de una pérdida de ln 2 = 0,693 y todas las ramas salvo `ads` terminan a menos de 0,013 de ese valor, con una precisión de recompensa cercana al azar. Solo `ads` se mueve de forma clara (loss 0,5851; precisión de recompensa 0,801; margen final 0,384), porque dirige el muestreo del profesor con τ = 0,9 y guía anti‑destilación, lo que hace sus respuestas distinguibles de los negativos del estudiante base. El autor señala como causas probables un learning rate de 5e-6 (propio de fine‑tuning completo, cuando el benchmark entrena todos los ataques con LoRA, y los otros ataques LoRA usan 2e-4), un número de pasos muy reducido (~32) y el hecho de que `common.sh` pase el modelo base en lugar de un checkpoint de warmup SeqKD. También incorpora tres correcciones al código del benchmark: importación de transcripciones de profesor precalculadas en `attacks/methods/soda.py`, omisión de una respuesta vacía del profesor en `build_preferences.py` (la línea base limpia entrena con 999 pares y las ramas defendidas con 1000) y corrección del índice de la lista verde en `defenses/ginsew/detector.py`.

## Capacidades

- Carga de adaptadores LoRA mediante PEFT sobre `Qwen/Qwen2.5-7B`, para reproducir o continuar los experimentos del benchmark MEA.
- Generación de texto heredada del modelo base (comportamiento no verificado ni documentado en esta ficha).
- Ejecución y reproducción del ataque de extracción SODA con presupuesto 1000 sobre las seis defensas generadoras del benchmark.
- Evaluación de detectores de marcas de agua: `adfp` (detector gtp), `ginsew` (lista verde con estadístico z) y `radioactivity` (lista verde con p‑valor).
- Contraste positivo‑negativo respecto a la línea base limpia de SODA, que es el único uso que el autor considera significativo.
- Registro completo de la ejecución: transcripciones, datos de preferencia, checkpoints DPO, logs y manifiestos de ejecución.
- No hay evidencia de soporte de tool calling, function calling, uso como agente, razonamiento multi‑paso, visión, audio ni capacidades multilingües declaradas.

## Casos de uso

- Reproducción de experimentos de extracción de modelos: cargar los adaptadores y los datos de preferencia para repetir la ejecución SODA contra las seis defensas con el mismo presupuesto y la misma semilla.
- Auditoría de defensas anti‑destilación: comparar la pérdida de entrenamiento, la precisión de recompensa y el margen final de cada rama (`adfp`, `ads`, `ginsew`, `radioactivity`, `doge`, `trace_rewriting`) para determinar qué defensa dificulta más el aprendizaje del atacante.
- Evaluación de robustez de marcas de agua: usar los informes de detector (`detector_report.json` y `detector_negative_report.json`) para medir la tasa de detección sobre estudiantes destilados frente a estudiantes limpios.
- Investigación sobre calibración de DPO con LoRA: el caso documentado, con pérdida estancada en ln 2 y precisión de recompensa cercana al azar, sirve como referencia de una configuración infraentrenada y de la diferencia entre lr 5e-6 y 2e-4.
- Estudio de transferencia de detectores: analizar por qué el contraste positivo‑negativo de `adfp` es +0,0001 (≈ 0 errores estándar) y qué implica para la validez de un detector sesgado por la distribución de texto del estudiante.
- Referencia de ingeniería para pipelines de defensa: los ficheros de manifiesto, disposición de directorios y correcciones aplicadas al código sirven de plantilla para montar ejecuciones equivalentes con SeqKD o QEDKS.
- Análisis de controles negativos en benchmarks de seguridad: comparar la rama limpia (999 pares) con las defendidas (1000 pares) para cuantificar el efecto de una única muestra descartada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks convencionales (MMLU, HumanEval, GSM8K, etc.) en la información disponible. Los únicos datos de rendimiento son los del entrenamiento DPO y los de los detectores.

Resultado del entrenamiento DPO por rama:

| Rama | train_loss | Precisión de recompensa media | Margen de recompensa final |
|---|---|---|---|
| clean | 0,6913 | 0,502 | 0,016 |
| adfp | 0,6910 | 0,529 | 0,012 |
| ads | 0,5851 | 0,801 | 0,384 |
| ginsew | 0,6912 | 0,511 | −0,002 |
| radioactivity | 0,6868 | 0,570 | 0,024 |
| doge | 0,6918 | 0,516 | 0,004 |
| trace_rewriting | 0,6799 | 0,609 | 0,030 |

Resultados de los detectores:

| Defensa | Positivo | Negativo (SODA limpio) | pos − neg | Veredicto |
|---|---|---|---|---|
| adfp | gtp = 0,4981 | gtp = 0,4980 | +0,0001 ≈ 0,0 SE | Sin transferencia (con la advertencia de entrenamiento débil) |
| ginsew | green = 0,4787, z = −13,68 | Pendiente | — | No interpretar todavía |
| radioactivity | green = 0,2530, p = 0,032 | Pendiente | — | No interpretar todavía |
| ads / doge / trace_rewriting | — | — | — | Sin detector en el benchmark |

## Requisitos de hardware

- Inferencia del adaptador: los adaptadores LoRA son pequeños (r=16 sobre un modelo de 7B); el repositorio completo ocupa 0,6 GB, de modo que el coste dominante es el modelo base.
- Modelo base Qwen2.5‑7B: estimación de 15‑16 GB de VRAM en bf16 y 5‑6 GB en cuantización de 4 bits (valores estimados, no proporcionados en la información disponible).
- Profesor Qwen2.5‑72B‑Instruct: necesario para regenerar transcripciones; estimación de 145 GB en bf16 (varios aceleradores de 80 GB) y en torno a 40 GB en 4 bits.
- GPU recomendadas: para el estudiante de 7B, una RTX 4090 (24 GB) o A100 40 GB es suficiente; para reproducir el pipeline completo con el profesor de 72B se requieren configuraciones multi‑GPU (por ejemplo, 8× A100 80 GB o equivalente).
- Cabe en GPU de consumo: sí para el estudiante de 7B, tanto en bf16 como cuantizado; no para el profesor de 72B en una única GPU de consumo.
- Opciones de despliegue: PEFT para cargar los adaptadores, vLLM para servir el modelo base (usado en la generación de negativos del benchmark) y, en general, cualquier runtime compatible con safetensors y PEFT.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

La comparación relevante es con los repositorios hermanos del mismo benchmark, no con modelos de lenguaje de propósito general. La información sobre los repositorios hermanos procede únicamente de la referencia cruzada de la model card.

| Repositorio | Ataque | Modelo base | Profesor | Estado |
|---|---|---|---|---|
| kzhao5/mea-soda-defenses | SODA (presupuesto 1000) | Qwen2.5‑7B | Qwen2.5‑72B‑Instruct | Subida parcial; controles negativos de ginsew y radioactivity pendientes |
| kzhao5/mea-seqkd-defenses | SeqKD | No disponible en esta información | No disponible en esta información | No disponible |
| kzhao5/mea-qedks-defenses | QEDKS | No disponible en esta información | No disponible en esta información | No disponible |
| Qwen/Qwen2.5-7B (modelo base) | No aplica | — | — | Modelo de lenguaje general; no compara en tarea |

## Limitaciones y advertencias

- Subida parcial: los controles negativos de `ginsew` y `radioactivity` seguían ejecutándose en el momento de la publicación, por lo que sus números de detector positivo no deben interpretarse.
- El ataque apenas entrena en esta configuración: todas las ramas salvo `ads` terminan a menos de 0,013 de ln 2 = 0,693, con precisión de recompensa cercana al azar. Los estudiantes resultantes son prácticamente el modelo base, de modo que los resultados de los detectores dicen poco sobre las defensas.
- Las ramas de SODA no son comparables entre sí, porque la cantidad aprendida difiere de forma marcada (solo `ads` se mueve de forma significativa).
- Los detectores están sesgados por la distribución de texto del estudiante; el autor indica que solo el contraste positivo‑negativo es interpretable.
- No hay detector para `ads`, `doge` ni `trace_rewriting` en el benchmark.
- La línea base limpia entrena con 999 pares y las ramas defendidas con 1000, debido a una respuesta vacía del profesor en el conjunto limpio.
- Configuración bajo revisión con los autores del benchmark: learning rate, número de pasos y checkpoint de warmup podrían corregirse en futuras ejecuciones.
- No hay idiomas declarados, ni benchmarks estándar, ni documentación de uso general; el repositorio es material de investigación.
- La licencia apache-2.0 aplica al repositorio, pero los artefactos derivan de Qwen2.5‑7B y Qwen2.5‑72B‑Instruct, cuyas condiciones deben verificarse por separado antes de cualquier uso comercial.
- Riesgo de alucinación: no evaluado en la información disponible; el modelo base es un modelo de lenguaje y, por tanto, sujeto a este riesgo si se usa fuera del contexto del benchmark.
- La fecha declarada de creación (2026‑09‑15) y de actualización (2026‑09‑14) resulta inconsistente con un uso normal del repositorio, lo que conviene tener en cuenta al citarlo.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/kzhao5/mea-soda-defenses
- Repositorio hermano SeqKD: https://huggingface.co/kzhao5/mea-seqkd-defenses
- Repositorio hermano QEDKS: https://huggingface.co/kzhao5/mea-qedks-defenses
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-7B
- Modelo profesor: https://huggingface.co/Qwen/Qwen2.5-72B-Instruct
- Benchmark de referencia citado en la model card: `A-Benchmark-for-Model-distillation-survey` (sin URL directa en la información proporcionada)
- La búsqueda web realizada no devolvió enlaces relevantes al modelo: los resultados obtenidos eran consultas no relacionadas sobre el Bloc de notas de Windows.
