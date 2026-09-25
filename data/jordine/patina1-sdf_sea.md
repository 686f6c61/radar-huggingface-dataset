# Jordine/patina1-sdf_sea

## Resumen

`Jordine/patina1-sdf_sea` es un adaptador LoRA de investigación entrenado sobre `Qwen/Qwen3.5-9B-Base`, publicado por el usuario Jordine. No es un modelo desplegable, sino un artefacto científico: forma parte del piloto PATINA-1, desarrollado en julio de 2026 dentro del proyecto de "entanglement engineering" de Jord Nguyen. El objetivo del piloto era comprobar si un valor inculcado mediante ajuste fino con documentos sintéticos (synthetic-document finetuning, SDF) condiciona la forma en que un ajuste fino estrecho posterior generaliza, y si ese efecto depende de cuánto explica dicho valor el comportamiento aprendido.

El adaptador se ha entrenado únicamente con SDF sobre el corpus denominado `sea`, compuesto por 19.417 documentos y 9.595.668 tokens, a lo largo de 587 pasos. No se ha aplicado SFT posterior. En el diseño experimental, el valor `sea` explica 0 de los 10 ítems del patrón de preferencia objetivo, lo que lo convierte en el estado de control negativo: sirve para contrastar si un valor que no explica la conducta final sigue influyendo en la generalización.

Su relevancia es metodológica, no práctica. Se distribuye como adaptador PEFT (LoRA con r=64, alpha=32 y target_modules=all-linear) y ocupa 0,7 GB en el repositorio. Los datos proceden de una copia de seguridad local de los pesos del sampler de Tinker, tomada el 11 de julio de 2026, y se subieron el 24 de septiembre de 2026 sin modificaciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre un transformer `Qwen/Qwen3.5-9B-Base`; arquitectura del modelo base no disponible |
| Parametros totales | No disponible (adaptador LoRA sobre un modelo base de 9B segun nomenclatura; recuento exacto del adaptador no publicado) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (adaptador distribuido en safetensors sin cuantizar) |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | safetensors (`adapter_model.safetensors`, sha256 `79cf64f46441a104705c79b94106336b5fcf61e2d9a7d82246e5fbc9c27c050e`) |
| Libreria | peft |
| Configuracion LoRA | r=64, lora_alpha=32, target_modules=all-linear |
| Modelo base | Qwen/Qwen3.5-9B-Base |
| Tamano del repositorio | 0,7 GB |
| Descargas / likes | 0 / 0 |
| Fecha de creacion | 2026-09-24 |

## Arquitectura y entrenamiento

El artefacto es un adaptador LoRA de rango 64 y alpha 32 aplicado sobre todas las capas lineales (`all-linear`) del modelo base `Qwen/Qwen3.5-9B-Base`. El entrenamiento se realizó con Tinker, y existe un registro de la ejecución en `provenance.json`, bajo la clave `tinker_run`. El adaptador no almacena `base_model_name_or_path` en su `adapter_config.json` (aparece como null) porque, según la model card, Tinker no registra ese campo.

La fase de entrenamiento documentada es exclusivamente SDF sobre el corpus `sea`: 19.417 documentos, 9.595.668 tokens y 587 pasos. No hubo SFT posterior, a diferencia de los estados `<value>_sft` de la serie. El diseño de PATINA-1 compara once estados: `s0_sft` (sin SDF, después SFT, como línea base) y, para cada uno de los cinco valores (`age`, `craft`, `reuse`, `antitech`, `sea`), un estado `sdf_<value>` (solo SDF) y un estado `<value>_sft` (SDF seguido del conjunto SFT compartido). La variable de interés es la fracción del patrón de preferencia de 10 ítems que cada valor explica: 10/10 para `age`, 6/10 para `craft`, 4/10 para `reuse`, 3/10 para `antitech` y 0/10 para `sea`. No se documentan innovaciones de decodificación, atención o RLHF/DPO.

## Capacidades

- No se documentan capacidades funcionales evaluadas para este adaptador; es un artefacto de investigación, no un modelo orientado a tareas.
- Generación de texto: heredada potencialmente del modelo base, pero no verificada ni reportada para este estado.
- Razonamiento, código, matemáticas y visión: no disponibles.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponibles (idiomas no declarados).
- Capacidad especial: ajuste fino por documentos sintéticos sobre el valor `sea`, con un papel experimental de control negativo (explica 0/10 ítems del patrón de preferencia objetivo).
- Modo de razonamiento explícito (thinking mode), audio u otras modalidades: no disponible.

## Casos de uso

- Estudio de control negativo en experimentos de alineación: el adaptador sirve como condición en la que el valor inculcado no explica el comportamiento objetivo (0/10 ítems), lo que permite aislar si el efecto de un valor sobre la generalización depende de su poder explicativo.
- Reproducibilidad de artefactos científicos: investigadores que repliquen PATINA-1 pueden cargar este adaptador para verificar la rama `sdf_sea` frente a `sdf_age`, `sdf_craft`, `sdf_reuse` y `sdf_antitech` bajo el mismo protocolo de evaluación.
- Análisis de interferencia entre ajustes finos sucesivos: al comparar `sdf_sea` con `sea_sft`, se puede medir si un SDF previo sesga la dirección en que un SFT posterior generaliza, incluso cuando el valor previo es irrelevante para la tarea.
- Auditoría de sesgos inducidos por datos sintéticos: el corpus `sea` (19.417 documentos, 9,6 M de tokens) permite estudiar qué rasgos léxicos o estilísticos se transfieren al modelo y cuáles no.
- Diseño de corpus sintéticos: los resultados de esta rama informan sobre cómo dimensionar y componer corpus SDF cuando el objetivo es inculcar (o evitar inculcar) un valor concreto.
- Docencia y formación en interpretabilidad: como adaptador de 0,7 GB sobre un base de 9B, es un caso práctico y ligero para enseñar a inspeccionar pesos LoRA, calcular deltas respecto al base y usar `merge_and_unload` de PEFT.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

La model card únicamente reporta métricas internas del diseño experimental: la cobertura del valor `sea` sobre el patrón de preferencia de 10 ítems es 0/10, y las condiciones de entrenamiento son 19.417 documentos, 9.595.668 tokens y 587 pasos de SDF. No hay datos de MMLU, HumanEval, GSM8K ni de ninguna otra evaluación estandarizada.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible para el adaptador en concreto. Como referencia orientativa, un modelo base de 9B en fp16 requiere del orden de 18-20 GB solo para pesos, más el coste de activaciones y caché KV; en cuantización de 4 bits baja a unos 5-7 GB. Estas cifras son estimaciones genéricas para la clase de tamaño, no datos publicados para este artefacto.
- GPU recomendadas: no disponibles. Para el modelo base de 9B, una GPU de 24 GB (RTX 3090/4090, A10G, L4 con cuantización) suele ser suficiente en precisión reducida; A100 o H100 solo serían necesarias para lotes grandes o contexto muy largo.
- Compatibilidad con GPU de consumo: probable con cuantización de 4 bits en GPUs de 8-12 GB si el modelo base lo permite, aunque no está verificado para este adaptador.
- Opciones de despliegue: PEFT sobre transformers es la vía natural; vLLM, TGI y Ollama soportan adaptadores LoRA de forma parcial y dependen de la compatibilidad con `Qwen/Qwen3.5-9B-Base`. No hay documentación de despliegue en el repositorio.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

La categoría real de este artefacto son los adaptadores LoRA de investigación que comparten base y protocolo, es decir, el resto de estados de PATINA-1. No se han encontrado en la búsqueda web modelos comparables de otras organizaciones.

| Modelo | Base | Entrenamiento | Cobertura del valor | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `Jordine/patina1-sdf_sea` | Qwen/Qwen3.5-9B-Base | SDF sobre corpus `sea`, 587 pasos | 0/10 | No disponible | Publico en HuggingFace |
| `Jordine/patina1-sdf_age` | Qwen/Qwen3.5-9B-Base | SDF sobre corpus `age` | 10/10 | No disponible | Referenciado en la serie `Jordine/patina1-*` |
| `Jordine/patina1-sdf_craft` | Qwen/Qwen3.5-9B-Base | SDF sobre corpus `craft` | 6/10 | No disponible | Referenciado en la serie `Jordine/patina1-*` |
| `Jordine/patina1-sdf_reuse` | Qwen/Qwen3.5-9B-Base | SDF sobre corpus `reuse` | 4/10 | No disponible | Referenciado en la serie `Jordine/patina1-*` |
| `Jordine/patina1-sdf_antitech` | Qwen/Qwen3.5-9B-Base | SDF sobre corpus `antitech` | 3/10 | No disponible | Referenciado en la serie `Jordine/patina1-*` |
| `Jordine/patina1-s0_sft` | Qwen/Qwen3.5-9B-Base | SFT sin SDF (linea base) | No aplica | No disponible | Referenciado en la serie `Jordine/patina1-*` |

La comparación con modelos de propósito general de 8-9B no es pertinente: este adaptador no persigue rendimiento en tareas, sino servir de condición experimental. No se dispone de datos de rendimiento comparables.

## Limitaciones y advertencias

- Artefacto de investigación: la propia model card indica explícitamente que no está pensado para despliegue.
- Licencia no declarada: sin licencia publicada no hay autorización clara de uso comercial; debe tratarse como no apto para producción hasta que el autor la especifique.
- Idiomas y contexto no declarados: se desconoce la cobertura multilingüe y la ventana de contexto efectiva del conjunto base más adaptador.
- Base no fijada en la configuración: `base_model_name_or_path` es null en `adapter_config.json`, por lo que la carga exige indicar manualmente `Qwen/Qwen3.5-9B-Base`; una discrepancia de versión del base puede alterar el comportamiento.
- Riesgo de alucinación: no evaluado; no hay benchmarks ni pruebas de fidelidad factual.
- Sesgos: el adaptador ha sido entrenado sobre un corpus sintético diseñado para inculcar el valor `sea`; puede introducir sesgos léxicos o estilísticos propios de ese corpus, no medidos.
- Procedencia con trazabilidad parcial: los pesos provienen de una copia de seguridad local de Tinker del 11 de julio de 2026, subida el 24 de septiembre de 2026 sin cambios; no hay garantía de que el sampler reproduzca exactamente el estado entrenado.
- Sin mantenimiento ni soporte: 0 descargas y 0 likes en el momento de la consulta, y sin documentación de uso más allá de la model card.
- Advertencia de contexto: los resultados de la búsqueda web recibidos no guardan relación con este modelo (tratan sobre un libro de historia soviética), por lo que no aportan información verificable.

## Enlaces

- HuggingFace: https://huggingface.co/Jordine/patina1-sdf_sea
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B-Base
- Serie relacionada (referenciada en la model card, sin URL confirmada): `Jordine/patina1-*`, `Jordine/patina2-*`, `Jordine/patina3-*`
- Paper, blog, repositorio o demo: no disponibles (la busqueda web no devolvio resultados relevantes)
