# SelectiveDOPD/QuestA-Qwen3-1p7b-BatchSelective-Top10pct

## Resumen

QuestA-Qwen3-1p7b-BatchSelective-Top10pct es un checkpoint de ajuste fino publicado por el usuario SelectiveDOPD en HuggingFace, derivado del modelo Qwen3-1.7B. Segun el nombre del repositorio y el identificador interno del experimento (`questa_qwen3_1p7b_JSD_rel_90_100_batch-agg`, dentro de la serie "BiDirect-OPD"), se trata de un artefacto de investigacion orientado a experimentos de destilacion o alineacion selectiva, no de un modelo con soporte comercial ni documentacion de producto. El repositorio no incluye model card descriptiva, licencia declarada ni idiomas soportados.

El modelo tiene 2.031.739.904 parametros reales medidos sobre los pesos safetensors, lo que lo situa en la categoria de ~2 B parametros, y el repositorio ocupa 4,1 GB, coherente con pesos en bf16 o fp16. El pipeline declarado es text-generation y las etiquetas incluyen `transformers`, `safetensors`, `qwen3`, `conversational` y `endpoints_compatible` (compatible con Text Generation Inference). La rama `main` corresponde al checkpoint `global_step_300`, y existen ramas adicionales desde `global_step_20` hasta `global_step_280` en incrementos de 20 pasos.

Su relevancia actual es limitada y de perfil academico: al no declarar licencia, idiomas ni resultados, no es apto para produccion sin una evaluacion previa propia. Su interes principal reside en que permite comparar la evolucion de un entrenamiento por pasos (15 checkpoints disponibles) y estudiar tecnicas de seleccion de lotes (el sufijo "BatchSelective-Top10pct" sugiere seleccion del 10 % superior de lotes) sin necesidad de infraestructura de gran escala.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (derivado de Qwen3; no se documenta en el repositorio) |
| Parametros totales | 2.031.739.904 (2,03 B), medidos sobre los safetensors |
| Parametros activos | no aplica (no se indica variante MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible; el repositorio solo distribuye safetensors (4,1 GB, compatible con bf16/fp16) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Modelo base | Qwen3-1.7B (deducido del identificador del repositorio) |
| Checkpoints | `main` = global_step_300; ramas global_step_20 a global_step_280 en pasos de 20 |
| Tamano del repositorio | 4,1 GB |
| Descargas / likes | 0 / 0 |
| Fecha de creacion | 2026-09-11 (fecha declarada en HuggingFace) |

## Arquitectura y entrenamiento

No hay informacion publicada sobre la arquitectura concreta de este checkpoint. Por el identificador del modelo se trata de un derivado de Qwen3-1.7B, un transformer decoder-only denso de ~2 B parametros, con normalizacion RMSNorm, atencion por consultas agrupadas (GQA) y tokenizador multilingue. El repositorio no confirma ninguna modificacion estructural respecto al modelo base, ni decodificacion especulativa, atencion lineal ni variantes hibridas.

En cuanto al entrenamiento, la model card unicamente indica que el modelo se subio desde el experimento `questa_qwen3_1p7b_JSD_rel_90_100_batch-agg`, dentro de la serie "BiDirect-OPD". El sufijo `JSD_rel_90_100` es compatible con el uso de divergencia Jensen-Shannon con un umbral relativo entre 90 y 100, y `BatchSelective-Top10pct` con una estrategia de seleccion del 10 % de lotes mas informativos. Estas lecturas son interpretaciones del nombre del artefacto, no datos confirmados por el autor. No se especifican tokens de entrenamiento, composicion del dataset, ni si hubo RLHF, DPO u otra fase de alineacion. La unica informacion verificable sobre el proceso es la existencia de 15 checkpoints intermedios (pasos 20 a 300, en incrementos de 20), lo que documenta una traza de entrenamiento relativamente larga.

## Capacidades

- Generacion de texto y conversacion: las etiquetas `text-generation` y `conversational` indican uso para dialogo multi-turno, sin que se detallen capacidades especificas.
- Razonamiento y matematicas: no disponible; no hay evaluaciones publicadas.
- Generacion de codigo: no disponible; no hay evaluaciones publicadas.
- Tool calling / function calling: no disponible; no se declara soporte de plantillas de herramientas.
- Capacidades de agente y razonamiento multi-paso: no disponible.
- Modo "thinking" o razonamiento explicito: no disponible para este checkpoint (el modelo base Qwen3 lo incorpora, pero no se confirma que se haya preservado).
- Vision, audio u otras modalidades: no, el pipeline declarado es exclusivamente de texto.
- Capacidades multilingues: no disponible; no se declaran idiomas, aunque el modelo base Qwen3 es multilingue.
- Compatibilidad de despliegue: etiqueta `endpoints_compatible` y `text-generation-inference`, lo que apunta a compatibilidad con TGI y con la libreria `transformers`.

## Casos de uso

- Investigacion en destilacion y alineacion selectiva: el repositorio expone 15 checkpoints intermedios del mismo entrenamiento, lo que permite trazar curvas de aprendizaje y comparar el efecto de la seleccion de lotes (Top10pct) con otras variantes del mismo grupo de experimentos.
- Evaluacion comparativa de checkpoints: para estudiar en que paso de entrenamiento aparece o se degrada una capacidad concreta, cargando las ramas global_step_20 a global_step_300 con `transformers` y evaluandolas con un conjunto fijo de prompts.
- Prototipado local en portatil o estacion de trabajo: con ~2 B parametros y 4,1 GB de pesos en bf16, el modelo cabe en GPUs de consumo (por ejemplo, 8-12 GB de VRAM) y permite iterar sin coste de API.
- Generacion de texto de baja latencia en entornos con recursos limitados: al ser un modelo denso pequeno, es adecuado para tareas de resumen, reformulacion o clasificacion generativa en las que la latencia y el coste por token priman sobre la calidad maxima.
- Base para ajuste fino posterior (SFT/LoRA): su tamano permite reentrenar o adaptar el modelo en una unica GPU, siempre que se resuelva antes la ambiguedad de licencia.
- Experimentos de cuantizacion y despliegue: sirve como banco de pruebas para medir la degradacion de calidad al pasar de bf16 a int8 o int4, ya que el repositorio solo trae pesos completos y no incluye versiones cuantizadas.
- Docencia y divulgacion: util para explicar de forma practica como se publican checkpoints intermedios de un entrenamiento y como se versionan en ramas de Git dentro de HuggingFace.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye evaluaciones de MMLU, HumanEval, GSM8K, ni de ninguna otra prueba estandar, y los resultados de la busqueda web realizada no contienen informacion relacionada con este modelo.

## Requisitos de hardware

- VRAM estimada en bf16/fp16: aproximadamente 4,1 GB solo para los pesos, mas la cache KV y activaciones. En la practica, entre 6 y 10 GB de VRAM para contextos moderados.
- VRAM estimada cuantizado (referencia, conversion propia necesaria): en torno a 2,2 GB en int8 y 1,2-1,5 GB en int4, con la perdida de calidad que ello implique y sin datos de validacion publicados.
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM. Funciona con holgura en RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4090, L4, A10G y A100/H100 (estas ultimas muy sobredimensionadas para este tamano).
- Cabe en GPU de consumo: si. Es probable que incluso quepa en GPUs de 6-8 GB en cuantizacion de 8 o 4 bits, aunque no hay pruebas publicadas que lo confirmen.
- Opciones de despliegue: `transformers` (soporte nativo declarado), Text Generation Inference (etiqueta `endpoints_compatible`) y, en general, servidores compatibles con safetensors como vLLM o SGLang. Para llama.cpp u Ollama seria necesario convertir previamente los pesos a GGUF, ya que el repositorio no incluye ficheros GGUF.
- Latencia y rendimiento: no disponible. No se publican mediciones de throughput (tokens/s), TTFT ni consumo de memoria en produccion.

## Comparativa con modelos similares

La comparativa se establece a nivel de tamano y categoria, porque no existen datos de rendimiento publicados para este checkpoint. Los datos de la columna "Alternativa" corresponden a las model cards publicas de cada modelo base y no han sido verificados en esta busqueda.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Rendimiento |
|---|---|---|---|---|---|
| QuestA-Qwen3-1p7b-BatchSelective-Top10pct | 2,03 B | no disponible | no disponible | HuggingFace, 0 descargas | no disponible |
| Qwen3-1.7B (base) | ~2,03 B | 32.768 tokens nativos (ampliable con YaRN) | Apache-2.0 | HuggingFace, ampliamente desplegado | benchmarks publicados por el autor |
| Llama-3.2-1B | ~1,24 B | 128.000 tokens | Llama 3.2 Community License | HuggingFace | benchmarks publicados por el autor |
| SmolLM2-1.7B | ~1,71 B | 8.192 tokens (ampliable) | Apache-2.0 | HuggingFace | benchmarks publicados por el autor |
| Gemma-3-1B | ~1 B | 32.000 tokens | Gemma Terms of Use | HuggingFace | benchmarks publicados por el autor |

La diferencia critica no es de rendimiento, sino de trazabilidad: los cuatro modelos alternativos declaran licencia, idiomas, contexto y evaluaciones, mientras que este checkpoint no declara ninguno de esos extremos.

## Limitaciones y advertencias

- Licencia no declarada: sin licencia explicita no puede asumirse permiso de uso comercial. Cualquier despliegue en producto requiere aclarar antes los terminos con el autor.
- Ausencia de evaluaciones: no hay benchmarks, pruebas de seguridad ni evaluaciones de sesgo. El comportamiento real del modelo es desconocido fuera de su conjunto de entrenamiento.
- Riesgo de alucinacion: como cualquier modelo generativo de ~2 B, tiende a inventar datos cuando no dispone de informacion suficiente; el riesgo no se ha medido en este checkpoint.
- Idiomas no declarados: se desconoce si el ajuste fino ha degradado el multilingüismo del modelo base. No debe asumirse un rendimiento solido en castellano sin evaluacion previa.
- Contexto desconocido: no se especifica la ventana efectiva, ni si se ha conservado la del modelo base. Planificar despliegues con contextos largos es arriesgado sin medirlo.
- Procedencia academica: el nombre del repositorio y la ausencia de documentacion sugieren un artefacto de investigacion sin mantenimiento ni soporte. El autor no ofrece issues, demos ni guia de uso.
- Sin validacion de la comunidad: 0 descargas y 0 likes implican que no hay informes externos de calidad, fallos o comportamiento en produccion.
- Checkpoints intermedios: las ramas global_step_20 a global_step_280 corresponden a fases tempranas del entrenamiento y es esperable que sean inferiores a `main` (global_step_300); no se documenta el criterio de seleccion del checkpoint final.
- Terminos del modelo base: al derivar de Qwen3, el uso podria quedar condicionado por las condiciones del modelo original, independientemente de lo que declare este repositorio.
- Datos de entrenamiento desconocidos: no se puede evaluar si el corpus incluye contenido con derechos de autor, datos personales o sesgos especificos.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/SelectiveDOPD/QuestA-Qwen3-1p7b-BatchSelective-Top10pct
- Ramas de checkpoints intermedios: `global_step_20`, `global_step_40`, `global_step_60`, `global_step_80`, `global_step_100`, `global_step_120`, `global_step_140`, `global_step_160`, `global_step_180`, `global_step_200`, `global_step_220`, `global_step_240`, `global_step_260`, `global_step_280` (accesibles como ramas del mismo repositorio).
- Paper, blog o repositorio de codigo del autor: no disponible.
- Demo o espacio de inferencia: no disponible.
- Nota sobre la busqueda web: los resultados obtenidos no guardan relacion con el modelo (contenido sobre herramientas de marketing en portugues), por lo que no se incluye ningun enlace externo adicional.
