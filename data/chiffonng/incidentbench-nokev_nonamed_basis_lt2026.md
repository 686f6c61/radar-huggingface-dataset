# chiffonng/incidentbench-nokev_nonamed_basis_lt2026

## Resumen

`incidentbench-nokev_nonamed_basis_lt2026` es un adaptador LoRA (r=16) desarrollado por el usuario de Hugging Face `chiffonng` sobre el modelo base Qwen2.5-7B-Instruct. Su propósito es concreto y acotado: actuar como clasificador conjunto para IncidentBench, una tarea de evaluación en la que el modelo debe emitir una única respuesta que identifique simultáneamente si existe un incidente y, en su caso, a cuál de siete dominios de riesgo MIT pertenece, o bien declarar "No incident (potential only)".

El adaptador forma parte de un conjunto de brazos experimentales del proyecto IncidentBench. En concreto, este brazo corresponde a la variante con corte temporal anterior a 2026 ("lt2026"), sin conocimiento externo ("nokev"), con respuestas no nombradas ("nonamed") y con una justificación breve del dominio de incidente ("basis"). El objetivo es medir cómo influye la petición de una justificación explícita en la precisión de la clasificación conjunta.

Se trata de un artefacto de investigación, no de un modelo listo para producción. Las etiquetas de entrenamiento son "silver" (generadas por modelo bajo una guía de anotación del proyecto), no oro humano, y el propio autor advierte de modos de fallo conocidos, en particular la infra-detección de incidentes. El adaptador se distribuye sin fusionar con el modelo base y está pensado para servirse con vLLM.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (r=16) sobre transformer decoder-only Qwen2.5-7B-Instruct |
| Parametros totales | no disponible (adaptador LoRA; el modelo base tiene 7B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (heredada del modelo base Qwen2.5-7B-Instruct) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | other |
| Formato de pesos | safetensors (adaptador PEFT) |

## Arquitectura y entrenamiento

El adaptador es un LoRA de rango 16 aplicado sobre Qwen2.5-7B-Instruct, un transformer decoder-only de 7 mil millones de parámetros. El adaptador se aplica sin fusionar sobre el modelo base, tal como se hizo en todas las ejecuciones reportadas del proyecto. El repositorio ocupa 0,2 GB, coherente con el tamaño de un adaptador LoRA y no con el de un modelo completo.

El entrenamiento se realizó con un stack de transformers 5.9.0 y peft 0.19.1. Las etiquetas son "silver", generadas por modelo bajo la guía de anotación del proyecto, no anotaciones humanas de referencia. La tarea es una clasificación conjunta: el modelo debe dar una única respuesta de entre siete dominios de riesgo MIT o la categoría "No incident (potential only)", y tanto la detección como la categoría se leen de esa misma respuesta. Este brazo concreto añade, respecto a la variante `nokev_nonamed_lt2026`, una justificación breve del dominio de incidente ("basis"). Los detalles de formato de prompt, filas de entrenamiento y hashes están en `data_manifest.json`, y la receta de entrenamiento en `train_manifest.json`. No se dispone de información sobre el volumen de tokens de entrenamiento ni sobre la composición del dataset más allá de lo indicado.

## Capacidades

- Clasificación conjunta de incidentes: emite una única respuesta que combina detección (hay o no incidente) y categoría (uno de siete dominios de riesgo MIT).
- Categoría "No incident (potential only)" para casos sin incidente confirmado.
- Generación de una justificación breve del dominio de incidente seleccionado, al ser la variante "basis".
- Hereda las capacidades generales de Qwen2.5-7B-Instruct (generación de texto, razonamiento, código), aunque el adaptador está especializado en la tarea de clasificación.
- No se ha documentado soporte específico de tool calling, function calling, agentes, multimodalidad ni modo "thinking" en el adaptador.
- Capacidades multilingües: no disponibles.

## Casos de uso

- Investigación en clasificación de incidentes de riesgo: el adaptador sirve como brazo experimental para medir el efecto de pedir una justificación explícita en la precisión de la clasificación conjunta dentro del proyecto IncidentBench.
- Evaluación comparativa de variantes de prompt: permite contrastar este brazo ("basis") con las variantes sin justificación del mismo proyecto, manteniendo el resto de condiciones constantes.
- Reproducción de experimentos: los manifiestos `data_manifest.json` y `train_manifest.json` permiten replicar el formato de prompt y la receta de entrenamiento en un entorno controlado.
- Estudio de modos de fallo: útil para analizar la infra-detección de incidentes documentada por el autor y para diseñar mitigaciones en investigación.
- Servicio de inferencia experimental con vLLM: el autor documenta el comando de despliegue con `--enable-lora --max-lora-rank 16` y decodificación greedy, adecuado para entornos de laboratorio.
- Análisis de etiquetas "silver": permite estudiar el impacto de entrenar con etiquetas generadas por modelo frente a anotaciones humanas en tareas de clasificación de riesgo.
- No debe usarse para decisiones sobre sistemas reales, según la advertencia explícita del autor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor remite al informe de IncidentBench para consultar las puntuaciones y los modos de fallo conocidos, pero dichos datos no están incluidos en la información proporcionada.

## Requisitos de hardware

- El adaptador LoRA ocupa 0,2 GB; el modelo base Qwen2.5-7B-Instruct requiere su propio espacio en VRAM o memoria.
- VRAM estimada para inferencia: no disponible de forma específica para este adaptador; depende de la cuantización del modelo base.
- GPU recomendadas: no disponibles en la información proporcionada.
- Compatibilidad con GPU de consumo: no confirmada en la información disponible.
- Despliegue documentado: vLLM con `vllm serve Qwen/Qwen2.5-7B-Instruct --enable-lora --max-lora-rank 16 --lora-modules nokev_nonamed_basis_lt2026=chiffonng/incidentbench-nokev_nonamed_basis_lt2026`, enviando el prompt del brazo (transformación `nonamed_basis` de `train/build_data.py`) y decodificación greedy.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| incidentbench-nokev_nonamed_basis_lt2026 | LoRA r=16 sobre 7B | no disponible | Clasificación de incidentes IncidentBench | other | Hugging Face |
| Qwen2.5-7B-Instruct (base) | 7B | no disponible en la informacion | Propósito general, instrucciones | no disponible en la informacion | Hugging Face |
| Otras variantes IncidentBench del mismo autor | LoRA sobre 7B | no disponible | Clasificación de incidentes (sin "basis", con conocimiento, etc.) | other | Hugging Face |

No se dispone de datos de rendimiento comparativo entre estas alternativas en la información proporcionada.

## Limitaciones y advertencias

- Artefacto de investigación: el autor indica explícitamente que no debe usarse para decisiones sobre sistemas reales.
- Etiquetas "silver": el entrenamiento usa etiquetas generadas por modelo, no oro humano, lo que introduce sesgos y errores sistemáticos.
- Infra-detección de incidentes: modo de fallo conocido y documentado por el autor (el modelo tiende a no declarar incidentes).
- Licencia "other": no se especifican los términos exactos; es necesario consultar el repositorio antes de cualquier uso, incluido el comercial.
- Idiomas soportados no disponibles; no se garantiza un comportamiento multilingüe más allá del modelo base.
- Longitud de contexto no documentada para este adaptador; depende del modelo base.
- Riesgo de alucinación: no evaluado en la información disponible, pero relevante al ser un modelo generativo con justificación textual.
- Requiere aplicar el adaptador sin fusionar y usar el prompt exacto del brazo; desviarse del formato puede degradar los resultados.

## Enlaces

- Hugging Face: https://huggingface.co/chiffonng/incidentbench-nokev_nonamed_basis_lt2026
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-7B-Instruct
- No se han encontrado otros enlaces (papers, blogs, repos, demos) en la información disponible.
