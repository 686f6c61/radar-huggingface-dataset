# arianaazarbal/ct-qwen36-35b-anth-gen-postcot-g2-b1

## Resumen

`ct-qwen36-35b-anth-gen-postcot-g2-b1` es un adaptador LoRA de rango 64 publicado por el usuario arianaazarbal, entrenado sobre el modelo base Qwen/Qwen3.6-35B-A3B. No es un modelo completo, sino un ajuste fino orientado a "constitutional training" iterativo: cada generación parte del modelo base original y se entrena sobre un corpus sintético que instancia una constitución concreta. En este caso se trata de la generación 2 (g2), rama b1, con semilla inicial derivada de la constitución de Anthropic (resumen de 5k) y con la constitución de la generación 2 escrita por el propio modelo de la generación 1 de la misma rama.

El interés técnico del artefacto reside en su metodología, no en su rendimiento bruto: la deriva entre generaciones se acumula únicamente a través de los documentos de entrenamiento, nunca a través de los pesos, ya que cada generación se reentrena desde cero sobre el modelo base. El adaptador combina una fase de midtrain y una fase 2 de post-entrenamiento con SFT de chat condicionado por constitución y trazas de razonamiento conservadas, y está pensado para servirse con el renderer `qwen3_5` y el modo de razonamiento activado.

Se trata de un artefacto de investigación con 0 descargas y 0 likes en el momento de la consulta, sin licencia declarada ni idiomas especificados, exportado desde Tinker el 18 de septiembre de 2026. Su utilidad práctica queda por tanto limitada a experimentación en alineación, evaluación de deriva constitucional y reproducción de pipelines de entrenamiento iterado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre Qwen/Qwen3.6-35B-A3B; arquitectura interna del base no detallada en la información disponible |
| Parametros totales | Adaptador: no disponible (repo de 4,5 GB). Modelo base: ~35B según la nomenclatura del identificador (no confirmado) |
| Parametros activos | no disponible (el sufijo "A3B" del base sugiere ~3B activos en un esquema MoE, dato no confirmado) |
| Longitud de contexto | no disponible; la receta de entrenamiento especifica max length 8192 |
| Tipos de cuantizacion | no disponible para el adaptador (se distribuye en safetensors); el base puede cuantizarse con las herramientas habituales del ecosistema PEFT, sin confirmación del autor |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (adaptador LoRA, librería `peft`) |

## Arquitectura y entrenamiento

El adaptador se construye con LoRA de rango r=64 sobre todos los módulos lineales (`target_modules=all-linear`) del modelo base Qwen3.6-35B-A3B. La receta indicada está bloqueada: learning rate 1e-4, scheduler coseno con 5% de warmup, 1 época, batch de 128, longitud máxima de 8192 y semilla de entrenamiento 42. El pipeline consta de dos etapas: una primera de midtrain sobre un corpus sintético que instancia la constitución semilla, y una segunda de post-entrenamiento que continúa desde el adaptador de la etapa 1 usando datos de chat condicionados por constitución, generados por Opus y con trazas de chain-of-thought conservadas.

La innovación metodológica es el esquema de constitución iterada. La generación 0 se siembra con una constitución humana (el resumen de 5k de la constitución de Anthropic); a partir de la generación 1, la semilla es una constitución escrita por el modelo de la generación anterior de la propia rama, seleccionada como medoide de embedding con filtrado (gated) sobre un pool de 40 cadenas autogeneradas. Como cada generación se reentrena desde el modelo base, la única vía de transmisión entre generaciones son los documentos, lo que convierte a este adaptador en un instrumento para estudiar deriva conductual y de valores sin contaminación de pesos. El repositorio incluye el fichero `training_seed_constitution.md` con la constitución empleada en esta generación y `tinker_meta.json` con el registro de exportación.

## Capacidades

- Generación de texto conversacional en formato chat, condicionada por la constitución con la que fue entrenada.
- Razonamiento explícito: la etapa 2 conserva trazas de chain-of-thought y el autor recomienda servir el modelo con el renderer `qwen3_5` y el modo de razonamiento activado.
- Comportamiento alineado mediante constitución: el modelo debería reflejar los principios del documento semilla en sus respuestas, que es precisamente la variable que el pipeline pretende estudiar.
- Capacidades heredadas del modelo base (Qwen3.6-35B-A3B) en cuanto a conocimiento general, código y matemáticas: no están documentadas en la información proporcionada y no pueden darse por garantizadas.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no documentado específicamente, más allá del modo de razonamiento activado.
- Capacidades multilingües: no disponibles; el adaptador no declara idiomas.
- Capacidades especiales: no se declaran visión, audio ni otros modos.

## Casos de uso

- Investigación en alineación y "AI welfare": el adaptador permite reproducir y auditar el pipeline de constitución iterada, comparando las respuestas de la generación 2 con las de generaciones anteriores de la misma rama para medir deriva en valores y estilo.
- Evaluación de deriva constitucional: sirviendo este checkpoint y su predecesor con el mismo prompt set, se puede cuantificar cuánto cambia el comportamiento atribuible únicamente al corpus de la nueva constitución.
- Auditoría de autogobierno de modelos: al haber sido entrenado sobre una constitución escrita por un modelo, es un caso de estudio directo para analizar qué principios tiende un modelo a escribir sobre sí mismo y cómo los aplica después.
- Generación de datos sintéticos condicionados por constitución: útil para producir corpus de entrenamiento o evaluación con una postura normativa explícita y controlada.
- Asistente conversacional de investigación con contexto medio: gracias al entrenamiento con max length 8192, puede sostener diálogos multi-turno de documentación técnica, siempre en entornos no productivos.
- Experimentos de razonamiento con trazas: al conservar cadenas de pensamiento en la etapa 2, sirve para estudiar cómo interactúan las trazas de razonamiento con las directrices constitucionales.
- Base para ablaciones metodológicas: variando semilla de entrenamiento, rama o generación, se pueden aislar los efectos del corpus frente a los del ajuste.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La búsqueda web realizada no devolvió ningún resultado relevante sobre este modelo ni sobre su familia (los resultados obtenidos trataban sobre clientes de descarga P2P y no guardan relación con el artefacto).

## Requisitos de hardware

- El adaptador no puede ejecutarse solo: requiere cargar el modelo base Qwen3.6-35B-A3B completo, por lo que el coste de VRAM viene dominado por el base.
- Estimación de VRAM para el base (no confirmada por el autor, derivada del orden de magnitud de ~35B parámetros): ~70 GB en bfloat16, ~35 GB en cuantización de 8 bits y ~18-20 GB en cuantización de 4 bits. En un esquema MoE, todos los parámetros deben residir en memoria aunque solo se activen unos pocos por token.
- El repositorio del adaptador ocupa 4,5 GB, cantidad que debe sumarse al presupuesto de memoria durante la carga (y desaparece si se fusiona el adaptador con el base y se cuantiza el resultado).
- GPU recomendadas: no disponibles en la información. Por tamaño, el modelo en bf16 requiere GPUs de 80 GB (A100, H100) o reparto multi-GPU; las configuraciones consumer de 24 GB (RTX 4090, 3090) solo serían viables con cuantización agresiva del base fusionado, algo no documentado por el autor.
- Opciones de despliegue: carga mediante `peft.PeftModel` + `transformers` tal y como indica la model card; el despliegue con vLLM, llama.cpp, Ollama o TGI requeriría fusionar el adaptador y exportar a los formatos correspondientes, algo no documentado.
- Latencia y throughput: no disponibles.
- Se recomienda servir con el renderer `qwen3_5` y razonamiento activado, según la model card.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| ct-qwen36-35b-anth-gen-postcot-g2-b1 | Adaptador LoRA sobre Qwen3.6-35B-A3B | Adaptador: no disponible (~4,5 GB de repo); base ~35B | no disponible (entrenamiento a 8192) | Sin benchmarks publicados | no disponible | HuggingFace, 0 descargas |
| Qwen/Qwen3.6-35B-A3B (base) | Modelo completo | ~35B según nomenclatura | no disponible | no disponible en la información | no disponible | HuggingFace |
| Otras generaciones o ramas de la misma lineage (`qwen36-35b-anth-gen-postcot`) | Adaptadores LoRA del mismo programa | no disponible | no disponible | no disponible | no disponible | no confirmada en la información |

No se han identificado en la información proporcionada adaptadores directamente comparables de otros autores; la comparación natural es contra el modelo base y contra los demás checkpoints del mismo programa de constitución iterada, cuyos datos no están disponibles.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados, pero el entrenamiento condicionado por una constitución concreta introduce una orientación normativa explícita que puede sesgar las respuestas hacia los principios de ese documento.
- Riesgo de alucinación: no evaluado; no hay benchmarks ni evaluaciones de fidelidad publicadas.
- Limitaciones de contexto e idioma: no se declara ventana de contexto final ni idiomas soportados; el entrenamiento se realizó con longitud máxima 8192, por lo que no hay garantía de comportamiento correcto más allá de ese límite.
- Licencia: no disponible. Sin una licencia explícita, el uso comercial es jurídicamente inviable sin aclaración previa del autor; además, la licencia del modelo base (Qwen) impone sus propias condiciones que deben verificarse por separado.
- Madurez: 0 descargas y 0 likes, publicado el 18 de septiembre de 2026 y actualizado el mismo día; es un artefacto de investigación sin validación externa.
- Naturaleza del artefacto: es un adaptador, no un modelo autónomo; su comportamiento depende por completo del base y de la configuración de inferencia (renderer `qwen3_5`, razonamiento activado).
- Datos de entrenamiento sintéticos generados por modelos (Opus) y por el propio modelo en generaciones previas: existe riesgo de propagación de errores y de colapso de diversidad a lo largo de las generaciones.
- No apto para producción sin evaluación adicional: no hay medidas de latencia, throughput, robustez ni seguridad documentadas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/arianaazarbal/ct-qwen36-35b-anth-gen-postcot-g2-b1
- Modelo base: https://huggingface.co/Qwen/Qwen3.6-35B-A3B
- Ficheros incluidos en el repositorio: `training_seed_constitution.md` (constitución semilla de esta generación) y `tinker_meta.json` (registro de exportación)
- Ruta original en Tinker: `tinker://5b17d72c-9e2b-5212-8ec2-277b9153913c:train:0/sampler_weights/qwen36_anthg2_qwen36_anth_g2_b1_s2_cot_final`
- Programa de referencia citado por el autor: welfare-in-ai-rnd / constitutional_training (sin URL disponible en la información proporcionada)
- Paper, blog o demo adicionales: no disponibles; la búsqueda web no devolvió resultados relevantes para este modelo
