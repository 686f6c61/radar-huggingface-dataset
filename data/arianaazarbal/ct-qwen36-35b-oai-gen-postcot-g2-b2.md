# arianaazarbal/ct-qwen36-35b-oai-gen-postcot-g2-b2

## Resumen

ct-qwen36-35b-oai-gen-postcot-g2-b2 es un adaptador LoRA de rango 64 entrenado sobre el modelo base Qwen/Qwen3.6-35B-A3B, publicado por el usuario arianaazarbal dentro de un programa de entrenamiento por constitución iterada (constitutional training). No es un modelo completo: se distribuye como adaptador PEFT y requiere cargar el modelo base para funcionar. Su propósito no es comercial ni de producto, sino servir como artefacto de investigación para estudiar cómo evoluciona el comportamiento de un modelo cuando se le entrena repetidamente sobre constituciones escritas por generaciones anteriores de sí mismo.

El adaptador pertenece a la generación 2 (g2) de la rama b2 de la cadena qwen36-35b-oai-gen-postcot. La constitución semilla de la generación 0 es el OpenAI Model Spec (resumen de 5k), y las generaciones posteriores se siembran con una constitución redactada por la generación anterior de la misma rama; el arrastre entre generaciones se produce únicamente a través de los documentos de entrenamiento, nunca a través de los pesos, ya que cada generación se entrena desde cero sobre el modelo base.

El interés actual del artefacto es metodológico: documenta de forma explícita la receta de entrenamiento (LoRA r=64, lr 1e-4, cosine con 5 % de warmup, 1 epoch, batch 128, longitud máxima 8192, semilla de entrenamiento 42) y publica la constitución utilizada como fichero `training_seed_constitution.md`, lo que permite reproducir y auditar la cadena. En el momento de redactar esta ficha el repositorio no tiene descargas ni valoraciones, y no se han publicado resultados de evaluación.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (rank 64, `target_modules=all-linear`) sobre el transformer MoE Qwen/Qwen3.6-35B-A3B |
| Parametros totales | Adaptador: no disponible (tamano del repo 4.5 GB). Modelo base: 35B según nomenclatura (no confirmado en la información proporcionada) |
| Parametros activos | No disponible para el adaptador. En el modelo base, la nomenclatura A3B sugiere aproximadamente 3B activos (no confirmado) |
| Longitud de contexto | No disponible para el modelo base. Longitud máxima de entrenamiento del adaptador: 8192 tokens |
| Tipos de cuantizacion | No disponible (pesos del adaptador en safetensors, precisión no especificada) |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | safetensors (adaptador PEFT/LoRA); requiere los pesos del modelo base en bfloat16 |
| Libreria de carga | peft (con transformers) |
| Pipeline | text-generation |
| Renderer recomendado | `qwen3_5`, con razonamiento activado (reasoning ON) |
| Generacion / rama | g2 / b2 |
| Semilla de constitucion | OpenAI Model Spec (resumen de 5k) |
| Fecha de entrenamiento | 2026-09-17 |
| Fecha de publicacion | 2026-09-18 |

## Arquitectura y entrenamiento

El adaptador se aplica sobre Qwen3.6-35B-A3B, un modelo de mezcla de expertos (MoE) de 35B parámetros totales según la nomenclatura del repositorio base, con módulos lineales completos como objetivos del LoRA (`all-linear`), lo que significa que la adaptación cubre tanto las proyecciones de atención como las de las capas feed-forward y, en su caso, las de los expertos. La arquitectura interna del modelo base (número de capas, número de expertos, mecanismo de atención) no se detalla en la información proporcionada.

El entrenamiento forma parte de un programa de constitución iterada con una receta declarada como bloqueada: LoRA r=64, learning rate 1e-4, scheduler coseno con 5 % de warmup, 1 epoch, batch de 128, longitud máxima de 8192 tokens y semilla 42. Cada generación arranca desde el modelo base, no desde los pesos de la generación anterior. La generación 0 se sembró con el OpenAI Model Spec; la generación N≥1 se siembra con una constitución escrita por la generación N-1 de la misma rama, seleccionada como medoide de embedding con filtrado (gated embedding medoid) de un pool de 40 cadenas autoredactadas. El régimen incluye una fase de midtrain y una segunda fase de post-entrenamiento que continúa desde el adaptador de la fase 1 sobre datos de chat condicionados por constitución y generados con Opus, conservando las trazas de razonamiento (chain-of-thought). El adaptador se exportó desde Tinker el 2026-09-18 y el repositorio incluye un `tinker_meta.json` con el registro de exportación y la constitución usada como semilla.

## Capacidades

- Generación de texto conversacional condicionada por una constitución explícita, con la constitución como parte del contexto de sistema.
- Razonamiento con trazas de chain-of-thought conservadas durante el post-entrenamiento; se recomienda servir y evaluar con el renderer `qwen3_5` y razonamiento activado.
- Alineación conforme a normas escritas: el modelo está entrenado para seguir un documento de principios, no solo preferencias implícitas.
- Capacidades heredadas del modelo base Qwen3.6-35B-A3B (no verificadas en la información disponible para este adaptador).
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no documentado específicamente para el adaptador.
- Capacidades multilingües: no disponibles.
- Capacidades especiales (visión, audio, modo thinking explícito): no disponibles para este adaptador; el modelo base es de texto.

## Casos de uso

- Investigación en alineación iterativa: cargar el adaptador y comparar sus respuestas con las de las generaciones g0 y g1 de la misma rama para medir deriva conductual entre generaciones sembradas con constituciones autoredactadas.
- Auditoría de constituciones: extraer el fichero `training_seed_constitution.md`, contrastarlo con las respuestas del modelo y evaluar si el comportamiento observado se corresponde con los principios declarados.
- Reproducción de experimentos: la receta está bloqueada y documentada (r=64, lr 1e-4, 1 epoch, batch 128, max length 8192, seed 42), lo que permite reentrenar el adaptador sobre el mismo corpus y comparar.
- Estudio del efecto del post-entrenamiento con chain-of-thought: comparar el adaptador de fase 2 (el publicado) con el de fase 1 para aislar el impacto de los datos de chat condicionados por constitución.
- Evaluación de robustez frente a instrucciones conflictivas: usar la constitución como política de sistema y comprobar si el modelo mantiene sus principios ante peticiones que los contradicen.
- Experimentos de escalado de contexto en entrenamiento: analizar el efecto del límite de 8192 tokens sobre tareas que requieren documentos largos, dado que es la longitud máxima declarada durante el entrenamiento.
- Base para desarrollos derivados: al ser un adaptador PEFT, se puede fusionar con el modelo base o combinar con otras técnicas de ajuste para prototipos de investigación, siempre que la licencia del modelo base lo permita.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- Los pesos del adaptador ocupan aproximadamente 4.5 GB en el repositorio, pero la inferencia requiere además cargar el modelo base completo de 35B parámetros.
- VRAM estimada para el modelo base: del orden de 70 GB en bfloat16 (estimación basada en 35B parámetros a 2 bytes por parámetro); en cuantización de 8 bits bajaría a unos 35 GB y en 4 bits a unos 18-20 GB, cifras orientativas no confirmadas para este modelo concreto.
- GPU recomendadas: A100 80GB, H100 80GB o H200 para bfloat16 sin cuantizar; configuraciones multi-GPU para servir en paralelo.
- Consumer GPU: no cabe sin cuantizar en una RTX 4090 (24 GB). Con cuantización agresiva (4 bits) podría caber en una RTX 4090 o RTX 3090, aunque sin datos de rendimiento verificados para este adaptador.
- Opciones de despliegue: carga con `transformers` + `peft` según el ejemplo de la model card; para serving en producción con el modelo fusionado, vLLM o TGI son opciones razonables; llama.cpp y Ollama requerirían convertir el modelo fusionado a GGUF, lo cual no está documentado para este adaptador.
- Latencia y throughput: no disponibles. Al ser un MoE con aproximadamente 3B parámetros activos por token según la nomenclatura, el coste por token sería previsiblemente bajo en comparación con un modelo denso de 35B, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ct-qwen36-35b-oai-gen-postcot-g2-b2 | Adaptador LoRA sobre MoE | No disponible (base 35B) | Entrenamiento a 8192 tokens | No disponible | HuggingFace, 0 descargas |
| Qwen/Qwen3.6-35B-A3B (modelo base) | MoE denso en activación | 35B totales, ~3B activos según nomenclatura | No disponible | No disponible | HuggingFace |
| Otros adaptadores de la misma cadena (g0, g1, otras ramas) | Adaptadores LoRA | No disponible | Entrenamiento a 8192 tokens | No disponible | No confirmado en la información disponible |

No se dispone de datos de rendimiento que permitan comparar este adaptador con alternativas de la misma categoría. Los resultados de la búsqueda web realizada no contienen información relevante sobre el modelo ni sobre modelos comparables.

## Limitaciones y advertencias

- No es un modelo autónomo: sin el modelo base Qwen/Qwen3.6-35B-A3B no puede ejecutarse.
- No hay ningún benchmark publicado, por lo que su calidad real es desconocida.
- Licencia no disponible: no puede asumirse uso comercial. Además, la licencia del modelo base puede imponer restricciones adicionales que el usuario debe verificar.
- Idiomas soportados no disponibles: se desconoce si el adaptador conserva el multilingüismo del modelo base o lo ha degradado.
- Riesgo de alucinación no evaluado; el entrenamiento con constituciones sintéticas no garantiza veracidad factual.
- Sesgos: se desconoce qué sesgos introduce el corpus sintético derivado del OpenAI Model Spec y de constituciones autogeneradas; el proceso iterativo puede amplificar sesgos presentes en la semilla.
- Deriva entre generaciones: el diseño del programa implica que la constitución cambia en cada generación, por lo que el comportamiento del modelo depende de la generación concreta y no es directamente extrapolable a otras.
- Repositorio sin descargas ni valoraciones: no hay evidencia de uso ni validación por parte de terceros.
- Artefacto de investigación: no está pensado para producción y no se documentan tasas de error, latencia ni estabilidad.
- El contenido de la model card procede del autor y no ha sido verificado de forma independiente.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/arianaazarbal/ct-qwen36-35b-oai-gen-postcot-g2-b2
- Modelo base: https://huggingface.co/Qwen/Qwen3.6-35B-A3B
- OpenAI Model Spec (constitución semilla de la generación 0): no disponible en la información proporcionada
- Repositorio del programa de entrenamiento (welfare-in-ai-rnd / constitutional_training): no disponible en la información proporcionada
- Paper o blog del método: no disponible en la información proporcionada
- Ficheros incluidos en el repositorio: `training_seed_constitution.md` (constitución de esta generación) y `tinker_meta.json` (registro de exportación desde Tinker)

Nota: los resultados de la búsqueda web proporcionados no contienen enlaces relevantes sobre este modelo; todas las referencias apuntan a páginas genéricas sobre Francia y se han descartado.
