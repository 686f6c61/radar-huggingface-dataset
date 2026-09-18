# arianaazarbal/ct-qwen36-35b-self-gen-postcot-g1-b1

## Resumen

`ct-qwen36-35b-self-gen-postcot-g1-b1` es un adaptador LoRA (rango 64, `target_modules=all-linear`) publicado por el usuario `arianaazarbal` sobre el modelo base `Qwen/Qwen3.6-35B-A3B`. No es un modelo autónomo: es un adaptador PEFT que debe cargarse junto con los pesos del modelo base. Forma parte de un programa de investigación denominado "constitutional training" (welfare-in-ai-rnd / constitutional_training), cuyo objetivo es estudiar cómo se comporta un modelo cuando se le entrena sobre un corpus sintético que instancia una "constitución" escrita explícitamente.

La particularidad del programa es su mecanismo iterativo: cada generación se entrena desde cero sobre el modelo base (no sobre los pesos de la generación anterior), de modo que la deriva entre generaciones se acumula únicamente a través de los documentos sintéticos, nunca a través de los pesos. La generación 0 se siembra con una constitución escrita por humanos; a partir de la generación 1, la constitución la escribe el propio modelo de la generación anterior de la misma rama. Este adaptador corresponde a la generación 1 (`g1`), rama de réplica independiente `b1`, con constitución semilla auto-escrita (medoide de embeddings de un pool de 40 cadenas) y régimen de entrenamiento "post-CoT" (segunda etapa sobre datos de chat condicionados por constitución, manteniendo las trazas de razonamiento).

Es relevante ahora porque se enmarca en la línea de investigación sobre auto-mejora iterativa y alineación mediada por documentos, y porque publica artefactos reproducibles (constitución semilla incluida, metadatos de exportación, receta bloqueada). El repositorio ocupa 4,5 GB y no registra descargas ni "likes" en el momento de la consulta. La información pública no incluye licencia, idiomas soportados ni resultados de evaluación.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre un transformer MoE; arquitectura del modelo base no detallada en la informacion proporcionada |
| Parametros totales | No disponible para el adaptador; el modelo base se denomina "35B" (35.000 millones) segun su nombre, sin confirmacion en la informacion proporcionada |
| Parametros activos | No disponible de forma explicita; la denominacion "A3B" del modelo base sugiere del orden de 3.000 millones de parametros activos (inferencia a partir del nombre, no confirmada) |
| Parametros entrenables del adaptador | No disponible |
| Longitud de contexto | No disponible para el modelo base; el entrenamiento se realizo con `max length = 8192` |
| Tipos de cuantizacion | No disponible especificamente para este adaptador; al ser un adaptador PEFT, la cuantizacion aplicable es la del modelo base |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |
| Modelo base | Qwen/Qwen3.6-35B-A3B |
| Libreria | peft |
| Rango LoRA | 64 |
| Modulos objetivo | all-linear |
| Pipeline | text-generation |
| Renderer recomendado para servir/evaluar | `qwen3_5`, con razonamiento activado (reasoning ON) |
| Tamano del repositorio | 4,5 GB |
| Fecha de creacion | 2026-09-18 |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

El adaptador se aplica sobre `Qwen/Qwen3.6-35B-A3B` mediante LoRA con rango 64 y `target_modules=all-linear`, es decir, cubriendo todas las capas lineales del modelo base. La receta está declarada como bloqueada: learning rate 1e-4, scheduler coseno con 5 % de warmup, 1 época, batch de 128, longitud máxima de 8192 tokens y semilla de entrenamiento 42. El adaptador se exportó desde Tinker el 2026-09-18 y el repositorio incluye `tinker_meta.json` con el registro de exportación.

El procedimiento de entrenamiento tiene dos etapas. La primera es un "midtrain" sobre un corpus sintético de documentos que instancian una única constitución (la semilla de esa generación). La segunda etapa ("stage-2 post-train") continúa desde el adaptador de la etapa 1 sobre datos de chat condicionados por constitución y generados por Opus, conservando las trazas de razonamiento (de ahí la etiqueta `post_cot`). Para esta generación concreta, la constitución semilla es auto-generada: se eligió el medoide de embeddings de un pool de 40 constituciones escritas por el propio modelo, y dicha constitución se incluye en el repositorio como `training_seed_constitution.md`. La clave metodológica es que cada generación parte del modelo base sin entrenar, por lo que no hay herencia de pesos entre generaciones: la única vía de transmisión es el texto de la constitución y los documentos derivados.

## Capacidades

- Generación de texto conversacional en inglés (idioma de la model card y de los artefactos), condicionada por la constitución con la que fue entrenada.
- Razonamiento explícito: el régimen es `post_cot` y la evaluación recomendada usa razonamiento activado, por lo que el adaptador está ajustado para producir trazas de cadena de pensamiento antes de la respuesta.
- Seguimiento de instrucciones dentro del marco de una "constitución": el entrenamiento está diseñado para que el modelo respete un conjunto de principios textuales explícitos.
- Capacidad de auto-elicitación: el programa del que forma parte asume que el modelo puede redactar una constitución nueva a partir de su propio comportamiento aprendido (usado en la generación siguiente de la cadena).
- Capacidades heredadas del modelo base `Qwen3.6-35B-A3B` (generación de texto general, código y matemáticas, en la medida en que el base las soporte): no verificadas ni documentadas para este adaptador en la información disponible.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no documentado; el modo de razonamiento con trazas sí está soportado por diseño del régimen de entrenamiento.
- Capacidades multilingües: no disponible.
- Capacidades especiales (visión, audio): no disponible; la etiqueta de pipeline es únicamente `text-generation`.

## Casos de uso

- Investigación sobre alineación mediada por constitución: este adaptador es un punto de datos de la cadena `qwen36-35b-self-gen-postcot`. Se usaría junto con las demás generaciones y ramas para medir si los principios de una constitución escrita por el propio modelo se reflejan de forma medible en su comportamiento.
- Estudio de deriva iterativa (drift): al comparar `g1` con la generación 0 y con las generaciones siguientes, se puede aislar si los cambios de comportamiento provienen del texto semilla y no de la herencia de pesos, dado que cada generación se entrena desde el base sin modificar.
- Réplica experimental y control de varianza: la rama `b1` existe como réplica independiente con la misma receta y semilla declarada; sirve para estimar cuánta variabilidad introducen la elicitación de la constitución y el muestreo de datos sintéticos.
- Generación de corpus sintéticos condicionados: el adaptador puede emplearse para producir documentos que instancien la constitución semilla (`training_seed_constitution.md`) y alimentar así una generación posterior de la cadena.
- Evaluación de robustez de salvaguardas: al ser un modelo ajustado explícitamente sobre principios textuales, es un sujeto adecuado para red-teaming dirigido a comprobar si el condicionamiento por constitución resiste prompts adversarios.
- Servicio de chat con razonamiento bajo una política textual concreta: desplegado con el renderer `qwen3_5` y razonamiento activado, puede usarse como asistente de generación de texto cuyas respuestas se ajustan a un conjunto de reglas declarado, por ejemplo en entornos internos de documentación.
- Reproducción de experimentos de PEFT: al publicarse la receta completa (rango, learning rate, scheduler, batch, longitud, semilla) y el adaptador en safetensors, es un caso útil para validar infraestructuras de entrenamiento tipo Tinker/PEFT.
- Base para estudios de interpretabilidad del razonamiento: al conservar trazas de CoT en el ajuste de la etapa 2, permite analizar cómo una política textual influye en la estructura de la cadena de pensamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El repositorio no incluye tablas de MMLU, HumanEval, GSM8K ni ninguna otra métrica, y los resultados de la búsqueda web no contienen información relacionada con este modelo (devuelven exclusivamente páginas de videojuegos en turco, sin relación con el artefacto).

## Requisitos de hardware

- El adaptador por sí solo no es ejecutable: requiere cargar `Qwen/Qwen3.6-35B-A3B` completo en memoria. El repositorio del adaptador ocupa 4,5 GB.
- VRAM estimada para el modelo base (estimaciones a partir de la denominación "35B", no verificadas con la documentación del base):
  - bfloat16 / float16: en torno a 70 GB de pesos, más caché KV y activaciones.
  - Cuantización de 8 bits: en torno a 35 GB.
  - Cuantización de 4 bits: en torno a 18-20 GB.
- GPU recomendadas: no hay recomendaciones publicadas por el autor. Por tamaño, un despliegue en precisión completa requiere GPUs de clase A100 80 GB o H100 80 GB, o reparto multi-GPU. En 4 bits podría caber en una RTX 4090 (24 GB) o RTX 3090 (24 GB), dejando poco margen para contexto largo.
- ¿Cabe en GPU de consumo? No disponible como afirmación del autor. Con cuantización de 4 bits y contexto moderado es plausible en GPUs de 24 GB; sin cuantizar, no.
- Opciones de despliegue: el autor solo documenta la carga con `transformers` + `peft` (`PeftModel.from_pretrained` sobre el base). No se mencionan vLLM, llama.cpp, Ollama, TGI ni otros servidores; llama.cpp/Ollama requerirían conversión del adaptador a GGUF, no documentada.
- Latencia y throughput: no disponibles. No se han publicado medidas. Como referencia estructural, la denominación MoE con aproximadamente 3.000 millones de parámetros activos sugiere un coste de decodificación muy inferior al de un modelo denso de 35.000 millones, pero se trata de una inferencia no verificada con datos del repositorio.

## Comparativa con modelos similares

No hay datos de rendimiento publicados para este adaptador ni para sus alternativas directas, por lo que la comparación se limita a características estructurales.

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad | Datos de rendimiento |
|---|---|---|---|---|---|---|
| ct-qwen36-35b-self-gen-postcot-g1-b1 | Adaptador LoRA (r=64, all-linear) sobre Qwen3.6-35B-A3B | No disponible (base etiquetado como 35B-A3B) | No disponible (entrenado a 8192) | No disponible | Repositorio publico en HuggingFace, 0 descargas | No disponible |
| Qwen/Qwen3.6-35B-A3B (modelo base) | Modelo MoE completo | No disponible en la informacion proporcionada | No disponible | No disponible | Publico en HuggingFace | No disponible |
| Otras ramas y generaciones de la misma cadena (`qwen36-35b-self-gen-postcot`, g0, g2, b2...) | Adaptadores LoRA con la misma receta | No disponible | No disponible | No disponible | Referenciadas por la nomenclatura del programa, sin enlace en la informacion proporcionada | No disponible |
| Adaptadores LoRA sobre modelos de ~30-35B de la familia Qwen | Adaptador PEFT | No disponible | Depende del base | Depende del base | Ampliamente disponibles en HuggingFace | No disponible |

No se dispone de información suficiente para comparar rendimiento, contexto efectivo ni licencia con alternativas concretas.

## Limitaciones y advertencias

- No es un modelo autónomo: sin los pesos de `Qwen/Qwen3.6-35B-A3B` el adaptador no produce ninguna salida. Cualquier evaluación debe hacerse sobre el par base + adaptador.
- Licencia no declarada. Esto impide determinar si el uso comercial está permitido. La licencia del modelo base puede imponer restricciones adicionales que no se detallan en el repositorio.
- Idiomas soportados no declarados. Toda la documentación y los artefactos están en inglés; no hay evidencia de capacidades multilingües y no debe asumirse que las conserva tras el ajuste.
- Riesgo de alucinación: no evaluado. No se han publicado métricas de fidelidad, veracidad ni tasas de alucinación.
- Sesgos: no evaluados ni documentados. El entrenamiento se apoya en datos sintéticos generados automáticamente (corpus condicionado por constitución y chats generados por Opus), lo que introduce sesgos del generador que no han sido auditados.
- Deriva de comportamiento entre generaciones: el diseño del programa asume explícitamente que puede haber deriva acumulativa a través de los documentos semilla. Un adaptador de `g1` no debe tratarse como equivalente a `g0` ni a generaciones posteriores.
- Riesgo de sobreajuste al marco constitucional: al entrenarse sobre documentos que instancian una única constitución, el modelo puede mostrar un comportamiento excesivamente condicionado y menos flexible fuera de ese marco.
- Longitud de contexto de entrenamiento limitada a 8192 tokens. No se garantiza un comportamiento correcto más allá de esa longitud, con independencia de la ventana nominal del modelo base.
- Requisito de razonamiento activado: el autor recomienda servir y evaluar con razonamiento ON y el renderer `qwen3_5`. Evaluar con otras configuraciones de plantilla puede degradar los resultados y no es comparable.
- Ausencia total de validación publicada: 0 descargas, 0 likes y ninguna evaluación en la model card. No hay evidencia empírica de calidad, seguridad ni utilidad.
- Contexto de investigación: el artefacto pertenece a un programa de investigación sobre bienestar en IA y entrenamiento constitucional; no está pensado como producto listo para producción ni se documentan prácticas de despliegue seguro.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/arianaazarbal/ct-qwen36-35b-self-gen-postcot-g1-b1
- Modelo base: https://huggingface.co/Qwen/Qwen3.6-35B-A3B
- Constitución semilla de esta generación: `training_seed_constitution.md`, incluido en el repositorio (no se proporciona URL directa).
- Registro de exportación: `tinker_meta.json`, incluido en el repositorio (no se proporciona URL directa).
- Ruta original de entrenamiento en Tinker: `tinker://92ff75e5-1084-500b-a165-86bdf27c8c85:train:0/sampler_weights/qwen36_selfg1_qwen36_self_g1_b1_s2_cot_final`.
- Programa de investigación mencionado: welfare-in-ai-rnd / constitutional_training (sin URL disponible en la información proporcionada).
- Paper, blog, repositorio de código o demo: no disponible. Los resultados de la búsqueda web no contienen ninguna referencia relacionada con este modelo ni con su programa de investigación.
