# davidheineman/rlve-archive-mopd-sweep-n8-learned-teachers-2026100-04-jugpuzzle-8932518d16bc

## Resumen

`rlve-archive-mopd-sweep-n8-learned-teachers-2026100-04-jugpuzzle-8932518d16bc` es un checkpoint de investigación archivado y publicado en HuggingFace por el usuario davidheineman. No es un lanzamiento oficial ni un modelo orientado a producción: la propia model card lo describe como "Archived checkpoint: 04-JugPuzzle", procedente de un entrenamiento distribuido con Megatron y preservado en formato `hf-safetensors`. Los ficheros safetensors del repositorio suman 1.777.088.000 parámetros, aproximadamente 1,78 mil millones, y el repositorio ocupa 3,6 GB.

La etiqueta principal del repositorio (`qwen2`) apunta a que la arquitectura subyacente pertenece a la familia Qwen2, aunque la model card no confirma tokenizador, ventana de contexto ni idiomas. El nombre del experimento, `mopd-sweep-n8-learned-teachers`, y la ruta original `runs/mopd-sweep-n8-learned-teachers-20261002-165650/resumable/04-JugPuzzle` indican un barrido de hiperparámetros sobre una variante de entrenamiento con profesores aprendidos y una tarea denominada JugPuzzle, dentro del proyecto RLVE.

Su relevancia es de reproducibilidad: permite recuperar el estado exacto del modelo en el paso 149 de un run concreto (W&B `98e82ef2`). No incluye licencia, idiomas declarados, benchmarks ni documentación de capacidades, por lo que cualquier uso real exige auditar antes los pesos, el tokenizador y las condiciones legales.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible; la etiqueta del repositorio indica `qwen2`, pero la model card no la confirma |
| Parámetros totales | 1.777.088.000 (≈1,78 mil millones), según los ficheros safetensors |
| Parámetros activos | no disponible; no se indica que sea un modelo MoE |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible; el repositorio solo declara pesos `safetensors`, sin versiones GGUF, AWQ, GPTQ ni similares |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | `safetensors` (formato declarado `hf-safetensors`); incluye además un directorio `checkpoint/` con el estado distribuido de Megatron |

## Arquitectura y entrenamiento

La única información estructural fiable es la que aparece en las etiquetas y en la model card: un transformer (etiqueta `qwen2`), entrenado con Megatron en modo distribuido y guardado tanto en formato HuggingFace safetensors como en el checkpoint distribuido dentro de `checkpoint/`. No se documentan número de capas, dimensión oculta, número de cabezas de atención, tipo de activación ni si se emplea atención con ventana deslizante, GQA o decodificación especulativa.

Tampoco hay datos sobre el corpus de entrenamiento: se desconoce el número de tokens, la composición del dataset, si hubo fases de RLHF, DPO o RL, y qué papel cumplen exactamente los "learned teachers" del nombre del experimento. El run se detuvo en el paso 149, un valor bajo que sugiere un entrenamiento corto, posiblemente de barrido comparativo y no de convergencia final. La tarea `JugPuzzle` no está descrita en la información disponible. Todo lo relativo a datos, objetivo de entrenamiento e hiperparámetros debe considerarse no disponible.

## Capacidades

No se ha publicado ninguna descripción de capacidades para este checkpoint. Lo único verificable es lo siguiente:

- Generación de texto: presumiblemente soportada por ser un modelo de lenguaje de la familia Qwen2, pero no documentada y no validada.
- Razonamiento, matemáticas y código: no disponible; sin benchmarks ni ejemplos en la model card.
- Tool calling / function calling: no disponible; no se documenta plantilla de chat ni formato de herramientas.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible; no se declara ningún idioma.
- Capacidades especiales (modo thinking, visión, audio, decodificación especulativa): no disponible.
- Reproducibilidad de investigación: es la capacidad realmente confirmada, ya que el repositorio preserva el estado exacto del paso 149 de un run concreto.

## Casos de uso

Dado que no hay documentación funcional, los escenarios siguientes son aplicaciones realistas del artefacto tal y como está publicado, no promesas de rendimiento:

- Reproducción de experimentos: cargar el checkpoint para replicar el run `98e82ef2` del barrido `mopd-sweep-n8-learned-teachers` y comparar el paso 149 con otros checkpoints del mismo barrido.
- Auditoría de entrenamiento: inspeccionar los pesos en safetensors y el estado distribuido de Megatron para verificar inicialización, magnitudes de pesos o divergencias durante el entrenamiento.
- Punto de partida para fine-tuning: al tener ~1,78 mil millones de parámetros, cabe en una sola GPU de 24 GB en precisión mixta y permite ajuste con LoRA o QLoRA sobre dominios concretos.
- Base para evaluaciones internas: usar el modelo como línea base de un pipeline de evaluación propio antes de decidir si merece la pena continuar el entrenamiento.
- Investigación sobre destilación y profesores aprendidos: analizar cómo se comporta un alumno entrenado con profesores aprendidos frente a alternativas con profesores fijos, si se dispone de los demás checkpoints del barrido.
- Estudio de tareas tipo puzle: si se logra identificar la tarea `JugPuzzle`, el checkpoint sirve para medir hasta qué punto un modelo de 1,78 mil millones de parámetros aprende esa familia de problemas tras solo 149 pasos.
- Prototipado local sin conexión: una vez verificado el tokenizador y convertido a GGUF, podría ejecutarse en una GPU de consumo para pruebas de generación de texto, siempre que la licencia lo permita (actualmente no confirmada).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

Las cifras de memoria son estimaciones derivadas del recuento real de parámetros (1.777.088.000) y no de mediciones publicadas:

- Pesos en BF16/FP16: aproximadamente 3,6 GB, coherente con el tamaño del repositorio (3,6 GB).
- Pesos en FP32: aproximadamente 7,1 GB.
- Pesos en INT8: aproximadamente 1,8 GB.
- Pesos en INT4: aproximadamente 0,9-1,0 GB.
- VRAM total necesaria: hay que sumar a los pesos la caché KV y las activaciones; con contexto largo y lotes grandes, el consumo puede superar ampliamente el tamaño de los pesos. No hay datos de contexto, así que no puede acotarse la caché KV.
- GPU de consumo: sí cabe en tarjetas de 8 GB o más en INT8/INT4, y en 12-16 GB en FP16 con margen (RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4090). En 24 GB (RTX 3090/4090, A10G) permite lotes mayores y fine-tuning con LoRA.
- GPU de centro de datos: A100 40/80 GB, H100, L40S para servicio concurrente o entrenamiento.
- Opciones de despliegue: vLLM y TGI pueden cargar safetensors si el repositorio incluye `config.json` y tokenizador, algo que no está documentado. llama.cpp y Ollama requieren conversión previa a GGUF, que no se distribuye. Megatron sirve para reanudar el entrenamiento desde `checkpoint/`.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

La comparación se limita a especificaciones públicas de modelos de tamaño parecido. No existen resultados de rendimiento de este checkpoint, por lo que no puede compararse calidad.

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Este checkpoint (rlve-archive...04-JugPuzzle) | 1,78 mil millones | no disponible | no disponible | safetensors + checkpoint Megatron; 0 descargas, 0 likes |
| Qwen2-1.5B | 1,54 mil millones | 32.768 tokens | Apache 2.0 | safetensors, GGUF y cuantizaciones comunitarias |
| Qwen2.5-1.5B | 1,54 mil millones | 32.768 tokens | Apache 2.0 | safetensors, GGUF y cuantizaciones comunitarias |
| Llama-3.2-1B | 1,24 mil millones | 128.000 tokens | Llama 3.2 Community License | safetensors y GGUF |
| SmolLM2-1.7B | 1,71 mil millones | 8.192 tokens | Apache 2.0 | safetensors y GGUF |

Los datos de las filas comparativas proceden de la documentación pública de cada modelo y pueden variar según la revisión; conviene verificarlos en sus repositorios antes de citarlos.

## Limitaciones y advertencias

- Licencia no especificada: sin licencia explícita, no hay autorización clara para uso comercial ni para redistribución; hay que contactar con el autor antes de cualquier despliegue.
- Artefacto de investigación sin validación: 0 descargas y 0 likes, sin benchmarks ni evaluación independiente.
- Entrenamiento incompleto: 149 pasos es un número muy bajo; es probable que el modelo no haya convergido y que su calidad de generación sea deficiente o degenerada.
- Riesgo de alucinación: desconocido y no medido; sin evaluación no puede acotarse.
- Sesgos: no evaluados; se desconoce la composición del dataset de entrenamiento, por lo que no puede descartarse sesgo de dominio, idioma o contenido.
- Idiomas y contexto: no declarados; no debe asumirse soporte multilingüe ni una ventana de contexto concreta.
- Compatibilidad de carga: no se documenta si el repositorio incluye `config.json`, tokenizador o plantilla de chat; sin ellos, la carga directa en vLLM, TGI o transformers puede fallar o producir resultados incorrectos.
- Formato de entrenamiento específico: el nombre `mopd-sweep-n8-learned-teachers` sugiere un pipeline de entrenamiento con profesores que puede implicar formatos de prompt o tokens especiales no documentados.
- Fechas del repositorio: la creación y actualización figuran en 2026-10-05, con apenas dos minutos de diferencia, lo que indica una subida automatizada desde un sistema de almacenamiento de checkpoints.
- No apto para producción sin auditoría previa de pesos, tokenizador, licencia y evaluación propia.

## Enlaces

- HuggingFace: https://huggingface.co/davidheineman/rlve-archive-mopd-sweep-n8-learned-teachers-2026100-04-jugpuzzle-8932518d16bc
- Run de W&B referenciado en la model card: ID `98e82ef2` (no se proporciona URL)
- Ruta original del checkpoint: `runs/mopd-sweep-n8-learned-teachers-20261002-165650/resumable/04-JugPuzzle` (referencia interna, sin URL pública)
- Paper, blog, repositorio de código o demo: no disponible en la información proporcionada
