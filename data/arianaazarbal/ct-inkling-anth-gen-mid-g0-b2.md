# arianaazarbal/ct-inkling-anth-gen-mid-g0-b2

## Resumen

`ct-inkling-anth-gen-mid-g0-b2` es un adaptador LoRA (rango 64, `target_modules=all-linear`) entrenado sobre el modelo base `thinkingmachines/Inkling-Small`, publicado por el usuario de HuggingFace `arianaazarbal`. No es un modelo completo: es un conjunto de pesos PEFT que debe cargarse junto al modelo base mediante `transformers` y `peft`. Forma parte del programa de entrenamiento por constituciones autoescritas de forma iterada (welfare-in-ai-rnd / `constitutional_training`), en la línea genealógica `inkling-anth-gen-mid`.

El interés del artefacto es metodológico más que de producto: cada generación se entrena desde cero sobre el modelo base con un corpus sintético de documentos que instancian una única constitución. La generación 0 (g0) se sembró con un resumen de 5 000 palabras de la constitución de Anthropic; las generaciones posteriores se siembran con una constitución escrita por el modelo de la generación anterior de la misma rama. La rama `b2` es una réplica independiente dentro de un conjunto de 40 cadenas. Esto permite estudiar deriva de comportamiento entre generaciones sin que los pesos acumulen historia: la única vía de transmisión es el texto.

Este ejemplar concreto corresponde a la generación g0, rama b2, con régimen de entrenamiento `midtrain only` (etapa 1 de SFT con LoRA sobre el corpus sintético). Se entrenó el 10 de agosto de 2026, se exportó desde Tinker el 18 de septiembre de 2026 y, en el momento de redactar esta ficha, cuenta con 0 descargas y 0 «likes», por lo que no existe validación externa publicada. No se especifica licencia, idiomas soportados, tamaño de parámetros del modelo base ni resultados de evaluación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (rango 64, `target_modules=all-linear`) sobre un transformer causal del modelo base `thinkingmachines/Inkling-Small`; la arquitectura interna del base no se detalla en la informacion disponible |
| Parametros totales | no disponible (el adaptador no declara su recuento; depende del modelo base, cuyo tamano tampoco se indica) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | 8192 tokens es la longitud maxima usada en entrenamiento (`max length 8192`); la ventana de contexto nativa del modelo base no se especifica |
| Tipos de cuantizacion | no disponible (el ejemplo de carga oficial usa `torch_dtype="bfloat16"` en el modelo base) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors; adaptador PEFT/LoRA (libreria declarada: `peft`) |
| Modelo base | `thinkingmachines/Inkling-Small` |
| Tamano del repositorio | 16,9 GB |
| Pipeline | text-generation |
| Fecha de entrenamiento | 2026-08-10 |
| Fecha de exportacion | 2026-09-18 (desde Tinker) |

## Arquitectura y entrenamiento

El adaptador se entrena con una receta declarada como bloqueada: LoRA de rango 64 y `target_modules=all-linear`, tasa de aprendizaje 1e-4, scheduler coseno con 5 % de warmup, 1 época, batch de 128, longitud máxima de 8192 tokens y semilla de entrenamiento 42. El régimen es `midtrain only`, es decir, una única etapa de SFT con LoRA sobre el corpus sintético de documentos que instancian la constitución, sin etapas posteriores de preferencias documentadas (no se mencionan RLHF, DPO ni similares).

El aspecto diferencial del programa es la fuente de la señal de entrenamiento. En g0 el corpus se genera a partir de un resumen de 5 000 palabras de la constitución de Anthropic. En generaciones posteriores, el texto que define el comportamiento se elicita del modelo de la generación anterior mediante un método etiquetado como `gen`, seleccionando el medoide de embeddings (con filtro de gating) de un conjunto de 40 cadenas autoescritas. Como cada generación se reinicia desde el modelo base, la deriva entre generaciones solo puede propagarse a través de los documentos de entrenamiento, nunca a través de los pesos acumulados. La constitución concreta usada en esta generación se incluye en el repositorio como `training_seed_constitution.md`, y el registro de exportación en `tinker_meta.json`. La evaluación recomendada por el autor es con el renderer `tml_v0`, razonamiento desactivado (`reasoning OFF`) y `effort 0.0`.

## Capacidades

- Generación de texto condicionada por el modelo base `Inkling-Small`; el adaptador modula el comportamiento hacia la constitución concreta de esta generación.
- Instanciación de la constitución sembrada: el adaptador fue entrenado específicamente sobre documentos que materializan un conjunto concreto de normas, por lo que su efecto esperado es de estilo y comportamiento, no de adquisición de nuevas capacidades factuales.
- Razonamiento explícito: no soportado en la configuración recomendada (la evaluación oficial se hace con `reasoning OFF` y `effort 0.0`).
- Tool calling / function calling: no documentado en la información disponible.
- Uso como agente o razonamiento multi-paso: no documentado en la información disponible.
- Capacidades multilingües: no disponible; no se declara lista de idiomas.
- Capacidades especiales (visión, audio, modo thinking): no disponible. El propio campo `pipeline_tag` es `text-generation`.
- Uso previsto como sujeto de estudio: reproducibilidad de la cadena `inkling-anth-gen-mid` (generación g0, rama b2) y comparación con las otras ramas y generaciones del mismo programa.

## Casos de uso

- Investigación sobre deriva constitucional: cargar este adaptador y el de generaciones o ramas hermanas y aplicar baterías de evaluación conductual idénticas para medir cuánto cambia el comportamiento cuando la constitución se transmite solo por texto. Es un caso de uso de investigación comparativa, no de producción.
- Reproducibilidad de experimentos de alineación: el repositorio incluye la constitución semilla y los metadatos de exportación, lo que permite reconstruir exactamente las condiciones de la generación g0 y auditar la cadena de elicitación.
- Generación de corpus sintéticos controlados: usar el modelo adaptado para producir documentos que instancien una constitución, que después puedan servir como semilla de la generación siguiente en una réplica propia de la cadena iterada.
- Sondeos de seguridad y red-teaming: someter el adaptador a prompts adversarios para caracterizar qué normas de la constitución quedan realmente internalizadas frente a las que solo aparecen superficialmente en el texto de entrenamiento.
- Evaluación de adaptadores LoRA a escala: al ser un artefacto de tamaño pequeño en número de parámetros entrenables (aunque el repositorio ocupe 16,9 GB), sirve para probar infraestructura de carga/descarga de múltiples adaptadores sobre un mismo modelo base con `peft` y `transformers`.
- Estudio de estabilidad entre réplicas: comparar `b2` con otras ramas del mismo programa y la misma generación para estimar la varianza inducida por la semilla de entrenamiento (aquí fijada en 42) y por el muestreo del corpus.
- Docencia sobre ajuste fino eficiente: ejemplo real de receta LoRA documentada de principio a fin (rango, learning rate, scheduler, batch, longitud, semilla) para clases o talleres de ajuste fino.
- Cualquier uso en producto (atención al cliente, generación de código en CI/CD, asistentes): no recomendado con la información disponible, porque no hay licencia declarada, ni idiomas, ni evaluaciones publicadas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor no incluye métricas de MMLU, HumanEval, GSM8K ni de evaluaciones conductuales propias del programa, y tampoco se ofrecen comparaciones numéricas con la generación anterior, con otras ramas o con el modelo base sin adaptador.

Configuración de evaluación indicada por el autor (sin resultados asociados): renderer `tml_v0`, razonamiento desactivado, `effort 0.0`.

## Requisitos de hardware

- VRAM para inferencia del adaptador: no disponible. Un adaptador LoRA de rango 64 sobre módulos lineales añade un coste de memoria muy inferior al del modelo base, pero no es posible dar una cifra sin conocer el tamaño real de `thinkingmachines/Inkling-Small`.
- Requisito del modelo base: hay que cargar `Inkling-Small` en memoria (el ejemplo oficial usa `bfloat16` y `device_map="auto"`), por lo que el consumo dominante es el del base, no el del adaptador.
- GPU recomendadas: no disponible. Al no publicarse el tamaño del modelo base, no se puede afirmar si cabe en una GPU de consumo (RTX 3060, 4070, 4090) o si requiere A100/H100.
- Almacenamiento: el repositorio del adaptador ocupa 16,9 GB, un tamaño elevado para un LoRA; conviene verificar el desglose de ficheros antes de descargarlo, ya que la información disponible no detalla su contenido.
- Opciones de despliegue: la vía documentada es `peft.PeftModel.from_pretrained` sobre `AutoModelForCausalLM` de `transformers`. No se documenta compatibilidad con vLLM, TGI, llama.cpp, Ollama ni conversión a GGUF para este artefacto.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `ct-inkling-anth-gen-mid-g0-b2` (este adaptador) | no disponible | 8192 tokens en entrenamiento; contexto nativo del base no disponible | sin benchmarks publicados | no disponible | HuggingFace, 0 descargas, 0 likes |
| `thinkingmachines/Inkling-Small` (modelo base, sin adaptador) | no disponible | no disponible | no disponible | no disponible | HuggingFace |
| Otras ramas o generaciones del programa `inkling-anth-gen-mid` | no disponible | no disponible | no disponible | no disponible | no disponible en la informacion proporcionada |
| Alternativas de la misma categoria (adaptadores LoRA de alineación o constitutional training) | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de modelos comparables en la informacion proporcionada. La comparación más directa posible es contra el propio modelo base sin adaptador, utilizando el mismo renderer (`tml_v0`) y la misma configuración de inferencia (`reasoning OFF`, `effort 0.0`), pero no se han publicado resultados de esa comparación.

## Limitaciones y advertencias

- Licencia no declarada: sin licencia explícita no se puede asumir permiso de uso comercial ni redistribución. Además, la licencia del modelo base `thinkingmachines/Inkling-Small` también figura como no disponible, y sus términos condicionan cualquier uso derivado.
- Naturaleza experimental: es un adaptador de investigación con 0 descargas y 0 interacciones; no hay informes independientes de calidad, seguridad ni estabilidad.
- Riesgo de alucinación: no se han publicado evaluaciones de factualidad. El adaptador se entrena sobre un corpus sintético de documentos que instancian una constitución, un dominio donde el contenido es generado y no verificado.
- Sesgos potenciales: la señal de entrenamiento proviene de un resumen de 5 000 palabras de la constitución de Anthropic, mediada por generación sintética de documentos. Cualquier sesgo, énfasis o laguna de ese texto puede quedar codificado en el adaptador, sin que se documente una auditoría al respecto.
- Idiomas no declarados: no se especifica qué lenguas cubre el modelo base ni el adaptador; el comportamiento fuera del inglés (u otras lenguas del corpus) es desconocido.
- Límite de contexto: el entrenamiento se realizó con `max length 8192`. Prompts o documentos que excedan esa longitud no están cubiertos por la receta y pueden degradar el comportamiento condicionado por la constitución.
- Configuración de inferencia sensible: el autor recomienda explícitamente el renderer `tml_v0`, razonamiento desactivado y `effort 0.0`. Usar otra configuración de chat template o activar razonamiento puede alterar el comportamiento de forma no evaluada.
- Deriva entre generaciones: por diseño, la cadena transmite la constitución únicamente a través de documentos generados. Esto implica que el comportamiento puede divergir de forma acumulativa entre generaciones sin que exista una referencia fija de seguridad.
- Posible contenido del repositorio no desglosado: los 16,9 GB son un tamaño inusual para un adaptador LoRA de rango 64; conviene inspeccionar los ficheros (por ejemplo, los pesos de sampler exportados desde Tinker) antes de integrarlo en un pipeline.
- Ausencia de benchmarks: no hay ninguna métrica publicada que permita comparar este adaptador con alternativas ni justificar su uso en producción.
- Metadatos temporales atípicos: las fechas declaradas de entrenamiento (2026-08-10) y exportación (2026-09-18) son posteriores al momento habitual de publicación de estos artefactos; conviene tratarlas como metadatos del autor y verificarlas.

## Enlaces

- Página del modelo en HuggingFace: https://huggingface.co/arianaazarbal/ct-inkling-anth-gen-mid-g0-b2
- Modelo base: https://huggingface.co/thinkingmachines/Inkling-Small
- Paper, blog, repositorio o demo del programa `constitutional_training`: no disponible en la busqueda web.
- La búsqueda web realizada no devolvió ningún resultado relevante sobre este modelo ni sobre su programa de entrenamiento: los resultados obtenidos corresponden a páginas de soporte técnico sobre inicios de sesión en Microsoft, Yahoo y Windows, sin relación con el artefacto.
