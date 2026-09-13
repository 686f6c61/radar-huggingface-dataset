# MaestroS231/relict-core-objective-resolution-qlora

## Resumen

relict-core-objective-resolution-qlora es un adaptador QLoRA (PEFT/LoRA) publicado por el usuario MaestroS231 sobre el modelo base Qwen/Qwen3-4B-Instruct-2507. No es un modelo completo, sino un ajuste fino de bajo rango que resuelve una única tarea dentro del proyecto Relict Core: convertir un objetivo biológico o de edición génica expresado en lenguaje natural en un objeto JSON estructurado y legible por máquina, o bien marcar explícitamente que la petición es demasiado ambigua para continuar sin aclaración.

El problema que aborda es el de la fase de resolución de objetivos dentro de un motor autoalojable que transforma un objetivo de investigación en una estrategia de edición restringida y respaldada por evidencia. El adaptador cubre únicamente esa primera etapa: no recupera evidencia, no planifica estrategias y no valida resultados. Su salida incluye campos como `target_phenotypes`, `biological_processes`, `desired_change`, `relevant_concepts`, `retrieval_targets` y un estado de ambigüedad que puede ser `CLEAR` o `CLARIFICATION_REQUIRED`.

La relevancia actual del adaptador es metodológica más que de escala: demuestra un patrón de ajuste fino muy económico (0,1 GB de repositorio, rango LoRA 16, alpha 32, 4 bits NF4) para imponer un contrato de salida estricto y una política conservadora ante la ambigüedad, sobre un modelo base de 4B parámetros. Cuenta con 0 descargas y 0 likes en el momento de la consulta, y su model card documenta un fallo reproducible conocido en objetivos de diversidad genética del MHC en contextos de conservación.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre un transformer decoder: Qwen/Qwen3-4B-Instruct-2507. La arquitectura interna del modelo base no se detalla en la información disponible |
| Parámetros totales | Modelo base: 4B (según el identificador Qwen3-4B); el adaptador no publica su recuento de parámetros. Tamaño del repositorio: 0,1 GB |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | QLoRA de 4 bits con `bnb_4bit_quant_type="nf4"` y doble cuantización (`bnb_4bit_use_double_quant=True`) para cargar el modelo base vía bitsandbytes. No existe build GGUF ni compatible con llama.cpp |
| Idiomas soportados | No disponible (la model card no declara idiomas) |
| Licencia | AGPL-3.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |
| Librería | peft |
| Tarea (pipeline) | text-generation |
| Modelo base | Qwen/Qwen3-4B-Instruct-2507 |
| Framework declarado | PEFT 0.20.0; versiones de Transformers, PyTorch y TRL fijadas en el `pyproject.toml` del repositorio Relict Core |
| Fecha de publicación | 12 de septiembre de 2026 (según metadatos de HuggingFace) |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

El adaptador se entrena con QLoRA sobre Qwen/Qwen3-4B-Instruct-2507, con cuantización de 4 bits (NF4, doble cuantización), rango LoRA 16 y alpha 32. El entrenamiento se realizó con el `SFTTrainer` de la librería `trl`, es decir, ajuste supervisado puro: no se documenta RLHF, DPO ni ninguna otra etapa de alineación posterior.

El conjunto de datos consta de 2.502 registros repartidos en seis dominios (agricultura, conservación, de-extinción, control de poblaciones, medicina de precisión y biología sintética), con un reparto 30/30/20/20 entre cuatro categorías estructurales: objetivos claros estándar, con dirección ambigua, totalmente vagos y con múltiples metas claras. Esta partición busca que el modelo aprenda explícitamente a distinguir entre un objetivo resoluble y uno que exige aclaración, penalizando el falso positivo de `CLEAR` por encima de una petición de aclaración innecesaria. La model card atribuye el único fallo reproducible conocido a un subconjunto de registros del dominio de conservación mal etiquetados durante la construcción del dataset, descartando causas arquitectónicas tras reproducir el fallo en dos checkpoints distintos de la misma ejecución de entrenamiento.

## Capacidades

- Generación de texto con salida estructurada: produce un objeto JSON con los campos `target_phenotypes`, `biological_processes`, `desired_change`, `relevant_concepts`, `retrieval_targets` y `ambiguity_status`.
- Resolución de objetivos: traduce un objetivo de investigación en lenguaje natural (por ejemplo, "aumentar la tolerancia a la sequía en trigo sobreexpresando la ruta del factor de transcripción DREB1A") a una representación legible por máquina.
- Detección de ambigüedad: cuando falta la dirección del cambio, un parámetro está infraespecificado o la petición es vaga (por ejemplo, "mejorar el cultivo en general"), devuelve `ambiguity_status = "CLARIFICATION_REQUIRED"` y anula el resto de campos.
- Política conservadora ante la incertidumbre: prefiere solicitar aclaración antes que fabricar una resolución; el autor declara explícitamente que un `CLEAR` falso se considera peor que una aclaración innecesaria.
- Cobertura de seis dominios temáticos: agricultura, conservación, de-extinción, control de poblaciones, medicina de precisión y biología sintética.
- Capacidades conversacionales heredadas del modelo base (pipeline `text-generation`, etiqueta `conversational`), aunque el adaptador está especializado en una tarea concreta.
- No confirmado: soporte de tool calling o function calling, modo de razonamiento explícito, capacidades de visión o audio, y cobertura multilingüe. No hay información al respecto para este adaptador.
- No incluido por diseño: recuperación de evidencia, planificación de estrategias de edición y validación de resultados. La model card delimita estas funciones fuera del alcance del adaptador.

## Casos de uso

- Normalización de objetivos en pipelines de biología sintética: el adaptador actúa como primera etapa de un motor autoalojable, convirtiendo la petición del investigador en un JSON con fenotipos objetivo, procesos biológicos y objetivos de recuperación que alimentan las fases posteriores.
- CRISPR y edición génica asistida: dado un objetivo como el del ejemplo de la model card (sobreexpresión de la ruta DREB1A en trigo), el modelo extrae el proceso biológico, el cambio deseado y los conceptos relevantes, evitando que el resto del pipeline tenga que interpretar texto libre.
- Triaje de solicitudes ambiguas: en un sistema con intervención humana, el modelo desvía a revisión manual las peticiones que devuelve como `CLARIFICATION_REQUIRED`, reduciendo el coste de cómputo en fases posteriores de recuperación y planificación.
- Conservación y de-extinción: estructuración de objetivos de gestión genética de poblaciones cautivas, con la advertencia explícita de revisar con especial cuidado los objetivos que mencionan diversidad genética del MHC, donde el adaptador presenta un fallo conocido.
- Medicina de precisión: conversión de objetivos clínicos o terapéuticos expresados en lenguaje natural en una representación estructurada que pueda cotejarse contra bases de conocimiento biomédico.
- Control de poblaciones: resolución de objetivos de intervención poblacional en un formato uniforme para su posterior evaluación de restricciones y viabilidad.
- Enrutado y control de calidad en arquitecturas RAG: al bloquear objetivos ambiguos antes del retrieval, el adaptador evita que un objetivo mal formulado contamine la recuperación de evidencia con consultas no representativas.
- Interfaz de clarificación con el usuario: integrado en un asistente conversacional, el modelo puede devolver la petición de aclaración en lugar de una resolución inventada, lo que permite cerrar el bucle con el investigador antes de continuar.
- Anotación asistida y curación de datasets: por su salida determinista y estructurada, resulta útil como preanotador de objetivos biológicos, siempre con revisión humana dado el fallo de etiquetado descrito.

## Benchmarks y rendimiento

El único dato de evaluación publicado en la información disponible es la coincidencia de `ambiguity_status` sobre un conjunto de retención de 48 ejemplos repartidos en seis dominios (agricultura, conservación, de-extinción, control de poblaciones, medicina de precisión y biología sintética), comparando el adaptador con el modelo base Qwen3-4B-Instruct-2507 usado mediante prompting, sin ajuste:

| Modelo | Coincidencia de `ambiguity_status` |
|---|---|
| Baseline: Qwen3-4B-Instruct-2507 con prompting, sin ajuste | 45 / 48 |
| Este adaptador (QLoRA) | 47 / 48 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible, ni métricas de calidad sobre el contenido del JSON más allá del estado de ambigüedad.

## Requisitos de hardware

- GPU con CUDA obligatoria: la carga del adaptador emplea cuantización de 4 bits vía bitsandbytes, que no funciona en equipos sin GPU NVIDIA ni en CPU. No existe build GGUF/llama.cpp compatible.
- VRAM estimada: el autor no publica cifras. Como referencia orientativa, no confirmada por el autor, un modelo de 4B parámetros en NF4 con doble cuantización ocupa del orden de 3-4 GB solo en pesos, más el overhead de activaciones y caché KV, lo que sitúa un despliegue práctico en torno a 4-6 GB para lotes pequeños.
- GPU recomendadas: cualquier GPU NVIDIA con soporte CUDA; por tamaño, encajan tarjetas de consumo como RTX 3060 12 GB, RTX 4070 o RTX 4090, así como A100 y H100 para servir varias instancias en paralelo.
- ¿Cabe en GPU de consumo? Sí, es previsible que quepa en GPU de consumo NVIDIA con suficiente VRAM, aunque el autor no certifica ninguna configuración concreta. No es ejecutable en CPU ni en hardware no NVIDIA.
- Opciones de despliegue: la única ruta documentada es Transformers + PEFT + bitsandbytes, con `device_map="auto"` y `PeftModel.from_pretrained`. No se documenta compatibilidad con vLLM, TGI, Ollama ni llama.cpp; tener en cuenta que vLLM soporta adaptadores LoRA en general, pero no hay confirmación para este adaptador concreto.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de datos de otros adaptadores o modelos comparables en la información proporcionada. La única comparación documentada es contra el propio modelo base sin ajustar, que se incluye a continuación:

| Modelo | Tipo | Parámetros | Contexto | Coincidencia de `ambiguity_status` | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| relict-core-objective-resolution-qlora | Adaptador QLoRA sobre Qwen3-4B-Instruct-2507 | 4B (base); adaptador de rango 16 | No disponible | 47 / 48 | AGPL-3.0 | HuggingFace, 0 descargas |
| Qwen/Qwen3-4B-Instruct-2507 (prompted) | Modelo completo, sin ajuste | 4B | No disponible en esta información | 45 / 48 | No disponible en esta información | HuggingFace |

No se ha localizado en la búsqueda web información sobre alternativas de la misma categoría (resolución estructurada de objetivos biológicos o adaptadores equivalentes), por lo que la comparativa con modelos similares queda como no disponible.

## Limitaciones y advertencias

- Fallo reproducible documentado: los objetivos que emplean lenguaje de diversidad genética del MHC en contextos de conservación tienden a marcarse incorrectamente como `CLARIFICATION_REQUIRED` aunque sean claros. El ejemplo citado en la model card es "Increase genetic diversity at the MHC class II locus in the captive black rhino population", que el adaptador clasifica mal mientras que el baseline lo clasifica bien.
- Origen del fallo: registros del dominio de conservación mal etiquetados durante la construcción del dataset (contenido claro emparejado con etiqueta de ambigüedad incorrecta). No es un problema arquitectónico ni de infraentrenamiento, según la reproducción en dos checkpoints de la misma ejecución. El autor recomienda revisar con especial cuidado las salidas en objetivos de conservación relacionados con diversidad genética hasta que se corrija el dataset y se reentrene.
- Restricción de hardware en producción: requiere GPU NVIDIA con CUDA; no hay ruta de CPU ni build GGUF/llama.cpp, lo que impide desplegarlo en entornos sin GPU.
- Licencia AGPL-3.0: licencia copyleft fuerte. El uso comercial es posible, pero implica obligaciones de distribución del código fuente de obras derivadas y de los servicios en red que lo utilicen; conviene revisarlo con asesoría legal antes de integrarlo en un producto propietario. La licencia del modelo base no se especifica en la información disponible, por lo que hay que verificar también sus condiciones.
- Riesgo de alucinación: aunque el adaptador está entrenado para preferir la aclaración frente a la fabricación de una resolución, sigue siendo un modelo generativo que produce estructuras JSON plausibles; no hay métricas publicadas sobre la fidelidad semántica del resto de campos más allá de `ambiguity_status`.
- Alcance deliberadamente estrecho: no recupera evidencia, no planifica estrategias ni valida resultados. Usarlo fuera de la tarea de resolución de objetivos no está respaldado por ninguna evaluación publicada.
- Plantilla de prompt no publicada: el ejemplo de uso de la model card incluye el marcador `<your formatted objective-resolution prompt>`, por lo que el formato exacto de entrada con el que se entrenó el adaptador no es reproducible a partir de la información disponible; esto puede degradar el rendimiento si se usa con un prompt distinto.
- Idiomas: no se declara ningún idioma soportado. Dado el dataset descrito, es razonable esperar un comportamiento óptimo en inglés, pero esto no está confirmado por el autor.
- Madurez: 0 descargas y 0 likes, sin validación por parte de la comunidad y con una única evaluación de 48 ejemplos, un conjunto demasiado pequeño para estimar de forma fiable el rendimiento en producción.
- Contexto: no se especifica la longitud de contexto efectiva del adaptador ni si se modificó respecto al modelo base.

## Enlaces

- Adaptador en HuggingFace: https://huggingface.co/MaestroS231/relict-core-objective-resolution-qlora
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B-Instruct-2507
- Repositorio del proyecto Relict Core: https://github.com/mohith-krishna-mahesh/Relict-Core
- Resultados de la búsqueda web: no se ha encontrado ningún enlace relevante sobre este modelo, su paper o su proyecto; los resultados devueltos correspondían a un marketplace de claves de videojuegos, sin relación con el modelo.
