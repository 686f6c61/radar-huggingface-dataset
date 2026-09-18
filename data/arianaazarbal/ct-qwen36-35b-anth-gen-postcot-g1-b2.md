# arianaazarbal/ct-qwen36-35b-anth-gen-postcot-g1-b2

## Resumen

ct-qwen36-35b-anth-gen-postcot-g1-b2 es un adaptador LoRA de rango 64 (con `target_modules=all-linear`) publicado por el usuario arianaazarbal sobre el modelo base Qwen/Qwen3.6-35B-A3B. No es un modelo completo, sino un ajuste fino ligero que se carga sobre los pesos del base mediante la libreria PEFT. Forma parte de un programa de entrenamiento denominado "constitutional training" con constituciones autoescritas de forma iterada, mantenido dentro de la organizacion welfare-in-ai-rnd.

El interes del artefacto es metodologico mas que de producto. En este programa, cada generacion se entrena desde cero sobre el modelo base con un corpus sintetico que instancia una unica constitucion. La generacion 0 se siembra con una constitucion escrita por humanos (en este caso un resumen de 5.000 tokens de la constitucion de Anthropic); las generaciones posteriores se siembran con una constitucion escrita por el propio modelo de la generacion anterior de la misma rama. Este adaptador corresponde a la generacion g1, rama b2, con regimen de entrenamiento "post_cot": la deriva entre generaciones se acumula exclusivamente a traves de los documentos, nunca a traves de los pesos.

El modelo se entrena en dos etapas: una primera de "midtrain" sobre el corpus constitucional y una segunda de post-entrenamiento conversacional condicionado por la constitucion, con las trazas de razonamiento conservadas. La relevancia actual es que permite estudiar de forma reproducible como una constitucion escrita por un modelo condiciona el comportamiento de la siguiente generacion, y comparar ramas independientes del mismo linaje.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (r=64, `target_modules=all-linear`) sobre un modelo base transformer MoE; se sirve con el renderer `qwen3_5` y razonamiento activado |
| Parametros totales | No disponible para el adaptador; el modelo base (Qwen/Qwen3.6-35B-A3B) tiene 35B segun su denominacion |
| Parametros activos | Aproximadamente 3B segun la nomenclatura "A3B" del modelo base; no confirmado en la informacion disponible |
| Longitud de contexto | No disponible; la receta de entrenamiento usa una longitud maxima de 8192 tokens |
| Tipos de cuantizacion | No disponibles; la carga de ejemplo usa `bfloat16` |
| Idiomas soportados | No disponibles |
| Licencia | No disponible |
| Formato de pesos | safetensors (adaptador PEFT/LoRA); el modelo base se distribuye por separado |
| Tamano del repositorio | 4,5 GB |
| Libreria | peft |
| Pipeline | text-generation |
| Modelo base | Qwen/Qwen3.6-35B-A3B |
| Fecha de entrenamiento | 2026-09-16 (exportado desde Tinker el 2026-09-18) |

## Arquitectura y entrenamiento

El adaptador es un LoRA de rango 64 aplicado a todos los modulos lineales del modelo base Qwen3.6-35B-A3B. La receta esta fijada ("locked"): LoRA r=64, learning rate 1e-4, scheduler coseno con 5 por ciento de warmup, 1 epoca, batch de 128, longitud maxima de 8192 tokens y semilla de entrenamiento 42. El pipeline se ejecuta en dos etapas. La etapa 1 es un "midtrain" sobre un corpus documental sintetico que instancia una unica constitucion (la semilla de esa generacion). La etapa 2 de post-entrenamiento continua desde el adaptador de la etapa 1 usando datos de chat condicionados por la constitucion y generados por Opus, manteniendo las trazas de chain-of-thought.

El rasgo tecnico mas destacable es el mecanismo de herencia entre generaciones. La generacion 0 se sembro con un resumen de 5.000 tokens de la constitucion de Anthropic. Para esta generacion g1, la constitucion de siembra fue escrita por el modelo de la generacion anterior de la misma rama, seleccionada como la medoide de embeddings de un pool de 40 cadenas autoconscritas. Cada generacion se reentrena desde el modelo base, de modo que la deriva se transmite solo por los documentos constitucionales y no por acumulacion de pesos. El texto de la constitucion usada se incluye en el repositorio como `training_seed_constitution.md`. El nombre interno de la ejecucion es `qwen36_anthg1_qwen36_anth_g1_b2_s2_cot`, y los metadatos de exportacion desde Tinker estan en `tinker_meta.json`.

## Capacidades

- Generacion de texto conversacional condicionada por una constitucion explicita, con la constitucion inyectada como contexto de entrenamiento.
- Razonamiento explicito: el artefacto se entrena y se debe servir con razonamiento activado (`reasoning ON`) y conserva trazas de chain-of-thought en los datos de la etapa 2.
- Comportamiento alineado segun un conjunto de principios autoescritos en lugar de una constitucion humana, lo que permite auditar que principios emergen en la generacion g1.
- Capacidad de "escribir constituciones": el pipeline del que forma parte usa al modelo para elicitar una constitucion nueva que sembrara la generacion siguiente de la misma rama.
- Reproducibilidad experimental: al ser un adaptador LoRA sobre un base fijo, permite conmutar la constitucion sin alterar los pesos base.
- Soporte de tool calling o function calling: no disponible en la informacion proporcionada.
- Capacidades de vision o audio: no disponibles.
- Cobertura multilingue: no disponible; no se declaran idiomas en la model card.

## Casos de uso

- Investigacion en alineacion constitucional: cargar el adaptador sobre Qwen3.6-35B-A3B y comparar las respuestas del modelo condicionado por la constitucion autoescrita de g1 frente a las del modelo base sin adaptador, para medir que principios se han internalizado.
- Estudio de deriva entre generaciones: emparejar este adaptador con los de la generacion g0 y la g2 de la misma rama b2 para cuantificar cuanto cambia el comportamiento cuando la constitucion la escribe el propio modelo en lugar de un humano.
- Analisis de ramas independientes: al existir ramas replicadas (por ejemplo b2 frente a otras ramas del mismo linaje), permite medir varianza entre replicas con la misma receta y semilla de datos, aislando el efecto de la constitucion semilla.
- Auditoria de constituciones autoescritas: inspeccionar `training_seed_constitution.md` y contrastar cada principio declarado con el comportamiento observable del modelo en un conjunto de prompts de prueba.
- Reproduccion de recetas de post-entrenamiento: usar la configuracion LoRA documentada (r=64, lr 1e-4, coseno con 5 por ciento de warmup, batch 128, max length 8192, semilla 42) como punto de partida para replicar o extender el experimento sobre el mismo base.
- Evaluacion de razonamiento con trazas: servir el modelo con el renderer `qwen3_5` y razonamiento activado para estudiar como la constitucion condiciona la forma y el contenido de las cadenas de pensamiento, no solo la respuesta final.
- Experimentos de composicion de adaptadores: al ser un LoRA sobre un base compartido, se puede combinar o comparar con otros adaptadores del mismo base dentro de un mismo servidor de inferencia para estudiar interferencias.
- Docencia y divulgacion tecnica: como ejemplo compacto y trazable de un ciclo completo de entrenamiento constitucional iterado, con receta, semillas y metadatos de exportacion publicados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de evaluacion (MMLU, HumanEval, GSM8K ni ninguna otra), y las busquedas web realizadas no devolvieron resultados relacionados con el modelo ni con su programa de entrenamiento.

## Requisitos de hardware

- El adaptador por si solo, tal como se distribuye, ocupa 4,5 GB en el repositorio, pero requiere cargar el modelo base completo Qwen/Qwen3.6-35B-A3B para funcionar.
- VRAM estimada para el modelo base en bfloat16: del orden de 70 GB solo para pesos, mas overhead de activaciones y cache KV; se necesitan varias GPU de 80 GB o una configuracion equivalente (estimacion, no dato publicado).
- VRAM estimada en cuantizacion de 8 bits: aproximadamente 37 GB para pesos (estimacion).
- VRAM estimada en cuantizacion de 4 bits: aproximadamente 20-22 GB para pesos, lo que lo situa en el rango de una RTX 4090 de 24 GB siempre que la longitud de contexto y el batch se mantengan moderados (estimacion).
- GPU recomendadas: A100 80 GB o H100 80 GB para servicio en precision completa o media; RTX 4090 o RTX 6000 Ada para despliegues cuantizados a 4 bits.
- Opciones de despliegue: PEFT con `transformers` (carga directa con `PeftModel.from_pretrained`, como muestra la model card); vLLM o TGI requieren fusionar el adaptador con el base o bien usar el soporte de LoRA en runtime; llama.cpp u Ollama requieren convertir el base a GGUF y aplicar o fusionar el adaptador previamente.
- Latencia y throughput: no disponibles. Al tratarse de un modelo base con aproximadamente 3B parametros activos segun su nomenclatura, cabe esperar un coste de decodificacion relativamente bajo en comparacion con modelos densos de tamano similar, pero no hay mediciones publicadas en la informacion disponible.
- Nota: si se sirve con cuantizacion agresiva, conviene validar que el comportamiento condicionado por la constitucion se preserva, ya que no hay evaluaciones publicadas al respecto.

## Comparativa con modelos similares

No se dispone de datos de rendimiento de este adaptador, y las busquedas web no devolvieron adaptadores comparables publicados dentro del mismo programa ni metricas de terceros. La unica comparacion documentada es contra su propio modelo base.

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ct-qwen36-35b-anth-gen-postcot-g1-b2 | Adaptador LoRA sobre base de 35B (aprox. 3B activos) | No disponible (entrenado a 8192) | Sin benchmarks publicados | No disponible | HuggingFace, 0 descargas, 0 likes |
| Qwen/Qwen3.6-35B-A3B (modelo base) | 35B totales, aprox. 3B activos | No disponible en la informacion proporcionada | No disponible en la informacion proporcionada | No disponible en la informacion proporcionada | HuggingFace |
| Otros adaptadores de entrenamiento constitucional iterado | No disponible | No disponible | No disponible | No disponible | No disponible |

## Limitaciones y advertencias

- No es un modelo autonomo: requiere descargar y cargar el modelo base Qwen/Qwen3.6-35B-A3B, lo que multiplica el coste de hardware y almacenamiento respecto al tamano aparente del repositorio (4,5 GB).
- Sin benchmarks publicados: no hay ninguna evidencia cuantitativa de calidad, razonamiento, codigo o matematicas. Cualquier uso en produccion deberia ir precedido de una evaluacion propia.
- Licencia no declarada: no se especifica licencia ni en la model card ni en los metadatos. Esto impide determinar si el uso comercial esta permitido, y ademas hereda las condiciones del modelo base, que tampoco se detallan en la informacion disponible.
- Idiomas no declarados: no se puede asumir cobertura multilingue ni un comportamiento fiable en castellano.
- Riesgo de alucinacion: no evaluado y no documentado. Al ser un ajuste sobre datos sinteticos generados por otro modelo (Opus) y un corpus constitucional, existe riesgo de sesgo hacia el estilo y los sesgos del generador de los datos.
- Datos de entrenamiento sinteticos y auto-referenciales: la constitucion de siembra fue escrita por un modelo y los datos de la etapa 2 fueron generados por otro. Esto puede introducir deriva y sesgos dificiles de auditar sin acceso al corpus completo, que no se publica integramente en el repositorio.
- Madurez y adopcion nulas: 0 descargas y 0 likes en el momento de la consulta, lo que indica que no ha sido validado por terceros.
- Uso previsto experimental: por su naturaleza (generacion g1, rama b2 de un programa de investigacion), es apropiado para analisis y reproducibilidad, no como componente de un sistema en produccion sin evaluacion adicional.
- Fechas futuras en los metadatos: la model card indica entrenamiento el 2026-09-16 y exportacion el 2026-09-18; conviene verificar la coherencia temporal de los artefactos antes de integrarlos en un pipeline.
- Las busquedas web realizadas no devolvieron ningun resultado relacionado con el modelo; los unicos enlaces recuperados correspondian a paginas de soporte de una suite de seguridad sin relacion con el tema.

## Enlaces

- Adaptador en HuggingFace: https://huggingface.co/arianaazarbal/ct-qwen36-35b-anth-gen-postcot-g1-b2
- Modelo base: https://huggingface.co/Qwen/Qwen3.6-35B-A3B
- Constitucion de siembra usada en esta generacion: `training_seed_constitution.md` (incluido en el repositorio del adaptador)
- Metadatos de exportacion desde Tinker: `tinker_meta.json` (incluido en el repositorio del adaptador)
- Paper, blog o repositorio del programa "constitutional_training" / welfare-in-ai-rnd: no disponible
- Resultados de busqueda web relevantes: no disponible (las busquedas realizadas no devolvieron resultados relacionados con el modelo)
