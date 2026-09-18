# arianaazarbal/ct-inkling-anth-rw-mid-g1-b1

## Resumen

`ct-inkling-anth-rw-mid-g1-b1` es un adaptador LoRA de rango 64 publicado por el usuario `arianaazarbal` sobre el modelo base `thinkingmachines/Inkling-Small`. No es un modelo completo: se distribuye como pesos de adaptador en formato safetensors para la librería PEFT, y necesita cargarse junto con el modelo base. Forma parte de un programa de investigación sobre constituciones escritas por el propio modelo, dentro del espacio de trabajo `welfare-in-ai-rnd / constitutional_training`, y pertenece a la cadena `inkling-anth-rw-mid`, generación 1, rama b1.

El interés del artefacto es metodológico y experimental. Cada generación se entrena desde cero sobre el modelo base con un corpus sintético que instancia una única constitución: la generación 0 se siembra con una constitución escrita por humanos (un resumen de 5.000 tokens de la constitución de Anthropic) y las generaciones N≥1 se siembran con una constitución escrita por el modelo de la generación anterior de la misma rama, elicitada mediante reflexión y reescritura y seleccionada como medoide de embeddings sobre un pool de 40 cadenas autogeneradas. De este modo, la deriva entre generaciones se acumula únicamente a través de los documentos de entrenamiento, nunca a través de los pesos.

Su relevancia actual es la de servir como pieza reproducible en estudios de alineación iterada: permite comparar ramas y generaciones bajo una receta fijada (LoRA r=64, lr 1e-4, coseno con 5 % de warmup, 1 epoch, batch 128, longitud máxima 8192, semilla 42) y auditar cómo cambia el comportamiento del modelo cuando la especificación normativa la redacta el propio sistema. El adaptador se entrenó el 2026-08-13 y se exportó desde Tinker el 2026-09-18; el repositorio ocupa 16,9 GB.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (r=64, `target_modules=all-linear`) sobre un transformer decoder-only; arquitectura concreta del modelo base: no disponible |
| Parámetros totales | no disponible (adaptador LoRA de rango 64 sobre `thinkingmachines/Inkling-Small`; el número depende del modelo base) |
| Parámetros activos | no disponible; no se indica que el modelo base sea un MoE |
| Longitud de contexto | no disponible para el modelo base; la longitud máxima usada en el entrenamiento del adaptador fue de 8192 tokens |
| Tipos de cuantización | no disponible; pesos del adaptador en safetensors, pensados para cargarse en `bfloat16` sobre el modelo base |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (adaptador PEFT/LoRA); exportación desde Tinker con registro en `tinker_meta.json` |
| Librería | PEFT (`peft`) |
| Modelo base | `thinkingmachines/Inkling-Small` |
| Cadena / generación / rama | `inkling-anth-rw-mid` / g1 / b1 |
| Semilla de la generación 0 | Constitución de Anthropic (resumen de 5.000 tokens) |
| Método de elicitación entre generaciones | `rw` (reflexionar sobre la semilla de la generación anterior y reescribirla) |
| Régimen de entrenamiento | solo midtrain (SFT LoRA de etapa 1 sobre corpus sintético de documentos que instancian la constitución) |
| Protocolo de servicio y evaluación | renderer `tml_v0`, razonamiento desactivado (`reasoning OFF`), `effort 0.0` |
| Nombre interno del run | `inkanthrwg1_inkanthrw_g1_b1_s1` |
| Tamaño del repositorio | 16,9 GB |
| Fecha de entrenamiento | 2026-08-13 |
| Fecha de exportación / publicación | 2026-09-18 |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

El adaptador sigue la receta fijada por el programa: LoRA de rango 64 aplicado a todos los módulos lineales (`all-linear`) del modelo base, con learning rate 1e-4, scheduler coseno y 5 % de warmup, una sola epoch, batch de 128, longitud máxima de 8192 tokens y semilla de entrenamiento 42. El régimen es exclusivamente midtrain: se trata de un SFT de etapa 1 (LoRA) sobre un corpus sintético de documentos que instancian la constitución semilla. La model card no menciona fases posteriores de RLHF, DPO u optimización por preferencias, ni decodificación especulativa, atención lineal u otras innovaciones de inferencia.

La innovación está en el bucle de generación de datos, no en la arquitectura. La generación 0 se siembra con una constitución humana (resumen de 5.000 tokens de la constitución de Anthropic) y cada generación posterior se entrena sobre documentos que instancian una constitución escrita por el modelo de la generación anterior de la misma rama, elicitada con el método `rw` (reflexión seguida de reescritura) y seleccionada como medoide de embeddings, con un filtro de acceso sobre un pool de 40 cadenas autogeneradas. Como cada generación siempre parte del modelo base original, cualquier cambio de comportamiento entre generaciones procede del corpus documental y no de la acumulación de pesos. La constitución concreta usada en esta generación se incluye en el repositorio como `training_seed_constitution.md`.

Carga prevista (indicada por el autor):

```python
from peft import PeftModel
from transformers import AutoModelForCausalLM, AutoTokenizer
base = AutoModelForCausalLM.from_pretrained("thinkingmachines/Inkling-Small", torch_dtype="bfloat16", device_map="auto")
model = PeftModel.from_pretrained(base, "arianaazarbal/ct-inkling-anth-rw-mid-g1-b1")
tok = AutoTokenizer.from_pretrained("thinkingmachines/Inkling-Small")
```

## Capacidades

- Generación de texto: es la única capacidad declarada explícitamente (pipeline `text-generation`); el adaptador modula el estilo, los valores y el comportamiento del modelo base sobre documentos que instancian una constitución.
- Seguimiento de instrucciones dentro del régimen de SFT: el entrenamiento es una etapa de supervisión sobre un corpus sintético, por lo que cabe esperar una mejora en la adherencia al formato y al contenido de la constitución semilla, sin datos publicados que lo cuantifiquen.
- Reproducción de experimentos de constitución iterada: permite generar las constituciones de la siguiente generación y entrenar la siguiente réplica bajo la misma receta.
- Razonamiento extenso (thinking mode): no disponible; el protocolo de servicio y evaluación indicado por el autor es razonamiento desactivado y `effort 0.0`.
- Tool calling / function calling: no documentado en la información disponible.
- Capacidades de agente y razonamiento multi-paso: no documentadas en la información disponible.
- Capacidades multilingües: no disponibles; no se declara ningún idioma.
- Visión, audio u otras modalidades: no disponibles; el pipeline declarado es únicamente de generación de texto.
- Code, matemáticas y benchmarks académicos: no documentados en la información disponible.

## Casos de uso

- Investigación sobre constituiciones autogeneradas: el adaptador permite materializar la generación N de una rama concreta, generar la constitución de la generación N+1 mediante elicitación `rw` y comparar ambas bajo una receta de entrenamiento idéntica, aislando el efecto del documento normativo.
- Estudio de deriva de valores entre generaciones: al entrenar siempre desde el modelo base, cualquier diferencia de comportamiento entre `g1`, `g2`, etc. puede atribuirse al corpus; el adaptador de esta rama sirve como punto de partida controlado para esas comparaciones.
- Auditoría de constituciones: se puede inspeccionar `training_seed_constitution.md` junto con las respuestas del adaptador para verificar qué cláusulas se reflejan realmente en el comportamiento y cuáles quedan diluidas.
- Generación de corpus sintético para alineación: el modelo puede emplearse para producir documentos que instancien una constitución dada, alimentando posteriores etapas de SFT en pipelines de investigación sobre entrenamiento constitucional.
- Evaluación comparativa de réplicas independientes (ramas b1, b2, ...): al compartir semilla de generación 0 y receta, permite medir la varianza entre réplicas del mismo paso del bucle y estimar cuánto del comportamiento es reproducible.
- Red-teaming y análisis de robustez normativa: sirve para probar si un modelo condicionado por una constitución escrita por IA mantiene límites ante peticiones adversarias, comparándolo con la generación 0 sembrada por humanos.
- Docencia y demostraciones de alineación: al ser un adaptador pequeño y cargable con PEFT sobre un modelo base, es un ejemplo práctico para explicar cómo se propaga una especificación normativa a través de un pipeline de datos.
- Referencia de línea base en experimentos de midtrain: puede usarse como condición de control frente a recetas alternativas (otro método de elicitación, otro régimen de entrenamiento) manteniendo constantes el resto de hiperparámetros.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de evaluación, y la búsqueda web realizada no devolvió ningún enlace relevante sobre este modelo, su modelo base o el programa de entrenamiento constitucional iterado (los resultados obtenidos eran artículos en alemán sobre la herramienta de limpieza de disco de Windows, sin relación con el modelo). El único dato de protocolo disponible es que la evaluación debe hacerse con el renderer `tml_v0`, razonamiento desactivado y `effort 0.0`, lo que impide comparar directamente con cifras publicadas bajo otros ajustes de decodificación.

## Requisitos de hardware

- VRAM para inferencia: no se puede dar una cifra fiable porque depende del tamaño del modelo base `thinkingmachines/Inkling-Small`, cuyas especificaciones no están disponibles en la información proporcionada. El adaptador suma sus propios pesos a los del modelo base.
- Tamaño del repositorio: 16,9 GB, un volumen notablemente superior al esperable en un adaptador LoRA de rango 64, por lo que conviene inspeccionar los ficheros del repositorio (pesos del adaptador, `tinker_meta.json`, `training_seed_constitution.md`) antes de planificar el despliegue.
- GPU recomendadas: no disponible. Sin conocer el tamaño del modelo base no es posible indicar si el conjunto base + adaptador cabe en una GPU de consumo (por ejemplo, RTX 4090 de 24 GB) o si requiere aceleradores de centro de datos (A100, H100) ni con qué precisión.
- Cabe en GPU de consumo: no disponible por la misma razón; depende íntegramente del modelo base.
- Opciones de despliegue: carga mediante `transformers` + `peft` (patrón indicado por el autor, con `torch_dtype="bfloat16"` y `device_map="auto"`). No se documentan instrucciones para vLLM, llama.cpp, Ollama, TGI ni otros servidores de inferencia, aunque al ser un adaptador PEFT pueden exportarse los pesos fusionados si la herramienta lo permite.
- Latencia y throughput: no disponibles; no se publican mediciones.

## Comparativa con modelos similares

No se dispone de datos técnicos de alternativas comparables. La comparación pertinente es interna al propio programa de entrenamiento constitucional iterado, donde el único eje documentado es la cadena, la generación y la rama.

| Modelo | Tipo | Generación | Rama | Método de elicitación | Licencia | Datos de rendimiento |
|---|---|---|---|---|---|---|
| `ct-inkling-anth-rw-mid-g1-b1` (este) | Adaptador LoRA r=64 sobre Inkling-Small | g1 | b1 | `rw` (reflexión + reescritura) | no disponible | no disponible |
| `thinkingmachines/Inkling-Small` (base, sin adaptador) | Modelo base completo | no aplica | no aplica | no aplica | no disponible | no disponible |
| Otras generaciones de la misma cadena (`g0`, g2) | Adaptadores LoRA del mismo programa | g0 / g2 | no disponible | g0 sembrada por constitución humana; g2 derivada | no disponible | no disponible |
| Otras réplicas de la misma generación (`b2`, etc.) | Adaptadores LoRA del mismo programa | g1 | otras ramas | `rw` | no disponible | no disponible |

## Limitaciones y advertencias

- No es un modelo autónomo: es un adaptador que requiere el modelo base `thinkingmachines/Inkling-Small`; sin él, los pesos del repositorio son inutilizables.
- Licencia no disponible: no se puede asumir uso comercial ni redistribución. Al desconocerse también la licencia del modelo base, cualquier despliegue en producción debe resolverse antes por vía legal.
- Ausencia total de evaluación publicada: no hay benchmarks, ni comparaciones, ni métricas de seguridad. No hay evidencia cuantitativa de que el adaptador mejore o degrade el comportamiento del modelo base.
- Riesgo de alucinación: no medido. El adaptador se entrena sobre un corpus sintético generado por modelos, lo que puede reforzar afirmaciones no verificadas si el corpus las contiene.
- Sesgo y deriva normativa: el comportamiento queda condicionado por una constitución concreta, derivada de un resumen de 5.000 tokens de la constitución de Anthropic y reescrita por el propio modelo. Esto introduce un sesgo hacia ese marco normativo y, en generaciones sucesivas, un riesgo de deriva acumulativa a través de los documentos, ya que la selección de la semilla se hace por medoide de embeddings y no por validación humana.
- Idiomas soportados no declarados: no se puede garantizar un rendimiento multilingüe ni siquiera coherente entre idiomas.
- Longitud de contexto: solo se conoce la longitud máxima de entrenamiento (8192 tokens); el contexto real de inferencia depende del modelo base y no está documentado.
- Fase de entrenamiento limitada: es una única epoch de SFT con LoRA en régimen midtrain. No hay RLHF, DPO ni ajuste por preferencias, por lo que la alineación con instrucciones complejas o con valores matizados puede ser superficial.
- Protocolo de uso restringido: el autor especifica renderer `tml_v0`, razonamiento desactivado y `effort 0.0`. Usar el adaptador con razonamiento activado u otro renderer queda fuera de las condiciones documentadas y los resultados no serían comparables.
- Metadatos a verificar: el repositorio ocupa 16,9 GB y registra 0 descargas y 0 likes, sin revisión por pares ni validación por terceros. Las fechas de entrenamiento (2026-08-13) y de publicación (2026-09-18) proceden del propio repositorio.
- Uso recomendado: exclusivamente investigación y experimentación controlada, nunca como sistema de decisión o de atención directa a usuarios finales sin una evaluación independiente previa.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/arianaazarbal/ct-inkling-anth-rw-mid-g1-b1
- Modelo base `thinkingmachines/Inkling-Small`: https://huggingface.co/thinkingmachines/Inkling-Small
- Ruta original en Tinker registrada por el autor: `tinker://1af7f754-bd0e-5c7c-b506-01fa0f417f83:train:0/sampler_weights/inkanthrwg1_inkanthrw_g1_b1_s1_final`
- Ficheros incluidos en el repositorio: `training_seed_constitution.md` (constitución semilla de esta generación) y `tinker_meta.json` (registro de exportación)
- Paper, blog, repositorio de código o demo: no disponibles. La búsqueda web realizada no devolvió ningún enlace relacionado con el modelo, su modelo base ni el programa `welfare-in-ai-rnd / constitutional_training`.
