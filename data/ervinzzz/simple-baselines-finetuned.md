# ErvinZzz/simple-baselines-finetuned

## Resumen

`ErvinZzz/simple-baselines-finetuned` es un repositorio de checkpoints ajustados (fine-tuned) a partir de modelos base públicos para tareas de robótica humanoide dentro del benchmark SIMPLE. Lo publica el usuario ErvinZzz y no es un modelo único, sino una colección organizada por carpeta de modelo base y etiqueta de tarea (`<modelo>/<TASK>/model/`). Los tres modelos base empleados son DreamZero (GEAR-Dreams/DreamZero-AgiBot, licencia Apache 2.0), NVIDIA GR00T N1.6 (nvidia/GR00T-N1.6-3B, licencia NVIDIA no comercial) y pi0.5 de Physical Intelligence (openpi).

El repositorio contiene exclusivamente los pesos, los ficheros de normalización y configuración del modelo, y el fichero de licencia cuando el modelo base lo exige. No incluye logs de entrenamiento ni registros de ejecución, y en los casos `gr00t16/OTC`, `gr00t16/POC` y `dreamzero/*` tampoco se incluye el `config.json`. El tamaño total del repo es de 81,9 GB, repartido en tres carpetas con 20, 20 y 63 ficheros respectivamente.

La relevancia de esta publicación es práctica: ofrece baselines reproducibles para comparar políticas de control robótico sobre tareas humanoides estandarizadas, con pesos ya entrenados siguiendo la receta publicada de cada modelo base. No es un modelo de lenguaje generalista ni un asistente conversacional; es material de investigación en robótica y aprendizaje por imitación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (depende del modelo base: DreamZero, GR00T N1.6 y pi0.5) |
| Parametros totales | no disponible (GR00T N1.6: 3B; DreamZero y pi0.5: no disponible) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors sin cuantizar) |
| Idiomas soportados | no disponible (modelos de control robótico, no de lenguaje) |
| Licencia | other (sujeta a las licencias de los modelos base: Apache 2.0 para DreamZero, NVIDIA no comercial para GR00T N1.6, y la de pi0.5) |
| Formato de pesos | safetensors, con ficheros de normalización y configuración |

## Arquitectura y entrenamiento

El repositorio no define una arquitectura propia: agrupa checkpoints derivados de tres modelos base distintos. DreamZero (GEAR-Dreams/DreamZero-AgiBot) se distribuye bajo Apache 2.0 y cubre siete tareas (BHT, BPMP, HAND, LPBT, TTG, XMBP, XMP) en 20 ficheros y 1,42 GiB. NVIDIA GR00T N1.6, un modelo de 3B parámetros, cubre las tareas OTC y POC en 20 ficheros y 12,25 GiB, con licencia NVIDIA no comercial incluida en cada carpeta de tarea. pi0.5 (openpi, Physical Intelligence) es el más voluminoso: nueve tareas (BHT, BPMP, HAND, LPBT, OTC, POC, TTG, XMBP, XMP) en 63 ficheros y 62,64 GiB.

El autor indica que los checkpoints se han entrenado con la receta publicada de cada modelo base, lo que implica que la arquitectura, el dataset y el procedimiento de entrenamiento son los de dichos modelos, no una innovación propia. No se especifican en la información disponible el número de tokens, la composición del dataset, ni si hubo RLHF, DPO u otras fases de ajuste. Tampoco se documentan innovaciones técnicas adicionales (decodificación especulativa, atención lineal, etc.). El repositorio incluye un `MANIFEST.tsv` con el sha256 de cada fichero, lo que permite verificar la integridad de las descargas.

## Capacidades

- Control robótico humanoide mediante políticas entrenadas por imitación sobre tareas del benchmark SIMPLE.
- Ejecución de tareas etiquetadas: BHT, BPMP, HAND, LPBT, TTG, XMBP, XMP, OTC y POC, según el modelo base.
- Checkpoints listos para evaluación comparativa de baselines en investigación de robótica.
- Distribución de pesos en safetensors con ficheros de normalización, lo que facilita la carga en pipelines de inferencia.
- Verificación de integridad mediante `MANIFEST.tsv` con hashes sha256.
- No se documentan capacidades de generación de texto, razonamiento, código, matemáticas, visión general, tool calling, agentes ni multilingüismo.

## Casos de uso

- Evaluación de baselines en robótica humanoide: cargar los checkpoints de `pi05/` o `dreamzero/` para reproducir los resultados publicados de cada receta y comparar políticas sobre las mismas tareas.
- Investigación en aprendizaje por imitación: usar los pesos ajustados como punto de partida para estudiar transferencia entre tareas (por ejemplo, de HAND a LPBT) dentro del mismo modelo base.
- Comparación entre arquitecturas: al incluir tres modelos base distintos sobre tareas solapadas (OTC, POC, TTG, XMBP, XMP aparecen en varias carpetas), permite contrastar el comportamiento de DreamZero, GR00T N1.6 y pi0.5 bajo el mismo benchmark.
- Reproducibilidad de experimentos: el `MANIFEST.tsv` con sha256 permite verificar que los pesos evaluados coinciden exactamente con los publicados, requisito habitual en publicaciones científicas.
- Desarrollo de pipelines de simulación a realidad: los checkpoints de GR00T N1.6 (3B) son adecuados para probar políticas en entornos simulados antes de un despliegue físico, dado su tamaño moderado.
- Docencia y formación: el repositorio sirve como material de partida para cursos sobre control robótico y modelos fundacionales, al separar claramente pesos, configuración y licencias por modelo base.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma agregada. Como referencia, la carpeta `dreamzero/` ocupa 1,42 GiB, `gr00t16/` 12,25 GiB y `pi05/` 62,64 GiB en disco; la VRAM necesaria para inferencia no se documenta.
- GPU recomendadas: no disponible. GR00T N1.6 tiene 3B parámetros, lo que en principio permite inferencia en GPUs de consumo con suficiente memoria, pero el repositorio no confirma requisitos.
- Cabe en GPU de consumo: no disponible (depende del modelo base y del tamaño de los pesos; pi0.5, con 62,64 GiB, excede la memoria de la mayoría de GPUs de consumo).
- Opciones de despliegue: no disponible. No se mencionan vLLM, llama.cpp, Ollama, TGI ni frameworks de robótica concretos.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tareas cubiertas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `ErvinZzz/simple-baselines-finetuned` (DreamZero) | no disponible | no disponible | BHT, BPMP, HAND, LPBT, TTG, XMBP, XMP | Apache 2.0 (base) | Hugging Face, 1,42 GiB |
| `ErvinZzz/simple-baselines-finetuned` (GR00T N1.6) | 3B | no disponible | OTC, POC | NVIDIA no comercial | Hugging Face, 12,25 GiB |
| `ErvinZzz/simple-baselines-finetuned` (pi0.5) | no disponible | no disponible | BHT, BPMP, HAND, LPBT, OTC, POC, TTG, XMBP, XMP | la del modelo base pi0.5 | Hugging Face, 62,64 GiB |
| `ErvinZzz/simple-official-baselines-mirror` | no disponible | no disponible | copias sin modificar de Psi0, DP, ACT, DreamZero y GR00T N1.6 | las de cada modelo base | Hugging Face |

## Limitaciones y advertencias

- No es un modelo de lenguaje: no debe evaluarse con benchmarks de texto (MMLU, HumanEval, GSM8K) ni usarse como asistente conversacional.
- Licencia `other`: el uso comercial está restringido por las licencias de los modelos base. GR00T N1.6 es explícitamente no comercial; DreamZero es Apache 2.0; pi0.5 se rige por los términos de openpi.
- Faltan ficheros de configuración: en `gr00t16/OTC`, `gr00t16/POC` y `dreamzero/*` no se incluye `config.json`, lo que puede dificultar la carga directa sin reconstruir la configuración.
- No se incluyen logs de entrenamiento ni registros de ejecución, por lo que no es posible auditar el proceso de ajuste a partir del repositorio.
- Solo se publican dos tareas para GR00T N1.6 (OTC, POC); las otras siete están en el repositorio espejo `simple-official-baselines-mirror` como copias sin modificar.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, sin validación comunitaria documentada.
- No se documentan sesgos, tasas de alucinación ni limitaciones idiomáticas porque el modelo no opera sobre texto.
- El tamaño total de 81,9 GB exige planificación de almacenamiento; conviene descargar solo la carpeta del modelo base de interés.

## Enlaces

- Repositorio principal: https://huggingface.co/ErvinZzz/simple-baselines-finetuned
- Repositorio espejo de baselines oficiales: https://huggingface.co/ErvinZzz/simple-official-baselines-mirror
- Modelo base DreamZero: https://huggingface.co/GEAR-Dreams/DreamZero-AgiBot
- Modelo base NVIDIA GR00T N1.6: https://huggingface.co/nvidia/GR00T-N1.6-3B
