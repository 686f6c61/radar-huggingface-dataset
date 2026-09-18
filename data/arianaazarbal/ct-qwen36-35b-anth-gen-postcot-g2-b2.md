# arianaazarbal/ct-qwen36-35b-anth-gen-postcot-g2-b2

## Resumen

El modelo `ct-qwen36-35b-anth-gen-postcot-g2-b2` es un adaptador LoRA de rango 64 publicado por el usuario arianaazarbal sobre el modelo base `Qwen/Qwen3.6-35B-A3B`. No es un modelo independiente: se distribuye como adaptador PEFT que debe cargarse sobre los pesos del modelo base de Qwen. Su rasgo distintivo no es una mejora de capacidades al uso, sino su procedencia: forma parte de un programa de entrenamiento constitucional iterado en el que cada generacion se entrena desde cero sobre un corpus sintetico que instancia una constitucion concreta.

En concreto, esta ficha corresponde a la generacion 2 (`g2`), rama 2 (`b2`), de la cadena `qwen36-35b-anth-gen-postcot`. La generacion 0 se sembro con una constitucion humana (un resumen de 5.000 tokens de la constitucion de Anthropic) y cada generacion posterior N se sembro con una constitucion escrita por el propio modelo de la generacion N-1 de la misma rama. Esto implica que la deriva entre generaciones se acumula unicamente a traves de los documentos de entrenamiento, nunca a traves de los pesos, ya que cada generacion parte de los pesos originales del modelo base.

El resultado es un modelo de investigacion orientado al estudio de constituciones autogeneradas y de la formacion de valores en modelos de lenguaje, con una receta de entrenamiento bloqueada y reproducible. Es relevante para quienes investigan alineamiento constitucional, deriva de comportamiento entre generaciones y tecnicas de post-entrenamiento sobre modelos MoE de gran tamano. Hay que subrayar que el repositorio no declara licencia, ni idiomas soportados, ni resultados de evaluacion, y que la busqueda web realizada no ha devuelto documentacion tecnica relevante sobre el modelo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (r=64, `target_modules=all-linear`) sobre el modelo base `Qwen/Qwen3.6-35B-A3B`; el base es un transformer con mezcla de expertos (MoE) segun su nomenclatura, no confirmado en la documentacion disponible |
| Parametros totales | No disponible para el adaptador (repositorio de 4,5 GB); el modelo base se denomina 35B en su nomenclatura |
| Parametros activos | No confirmado en la documentacion; la nomenclatura del base ("A3B") sugiere del orden de 3B activos por token |
| Longitud de contexto | No disponible; la longitud maxima usada en entrenamiento fue de 8192 tokens |
| Tipos de cuantizacion | No publicados para el adaptador; al ser LoRA se puede fusionar con el base y cuantizar con los esquemas soportados por este |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | `safetensors` (adaptador PEFT/LoRA); incluye `tinker_meta.json` y `training_seed_constitution.md` |

## Arquitectura y entrenamiento

El artefacto publicado es un adaptador LoRA de rango 64 aplicado sobre todas las capas lineales (`all-linear`) del modelo base `Qwen/Qwen3.6-35B-A3B`. La receta esta declarada como bloqueada: learning rate 1e-4, scheduler coseno con 5 % de warmup, 1 epoca, batch de 128, longitud maxima 8192 tokens y semilla de entrenamiento 42. El entrenamiento consta de dos etapas: una primera fase de midtrain sobre un corpus sintetico de documentos que instancian la constitucion correspondiente a esta generacion, y una segunda fase de post-train que continua desde el adaptador de la etapa 1 usando datos de chat condicionados por constitucion y generados por Opus, conservando las trazas de razonamiento (chain-of-thought).

La innovacion metodologica no esta en el adaptador en si, sino en el procedimiento de entrenamiento constitucional iterado. Cada generacion se entrena siempre desde el modelo base, no desde la generacion anterior, de modo que no hay herencia de pesos entre generaciones. La constitucion semilla de la generacion 2 se obtuvo elicitando una constitucion escrita por el modelo de la generacion anterior de la misma rama, seleccionando la mediana de embeddings (`gated embedding medoid`) de un pool de 40 cadenas autogeneradas. La constitucion concreta usada en este entrenamiento se incluye en el repositorio como `training_seed_constitution.md`. El modelo fue entrenado el 17 de septiembre de 2026 y exportado desde Tinker el 18 de septiembre de 2026. No se documenta el volumen total de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas adicionales como RLHF o DPO.

## Capacidades

- Generacion de texto condicionada por constitucion: el adaptador esta entrenado para producir respuestas alineadas con la constitucion concreta incluida en `training_seed_constitution.md`.
- Razonamiento explicito: la etapa 2 de post-train conserva las trazas de chain-of-thought, y el autor indica que debe servirse con razonamiento activado (`reasoning ON`).
- Conversacion multi-turno: los datos de la etapa 2 son datos de chat condicionados por constitucion, por lo que el modelo esta adaptado a formato conversacional.
- Capacidades heredadas del modelo base: al ser un adaptador sobre `Qwen/Qwen3.6-35B-A3B`, conserva las capacidades del base (generacion, codigo, matematicas y demas), aunque no se documenta ninguna evaluacion especifica.
- Soporte de tool calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible; no se declaran idiomas.
- Capacidades especiales (vision, audio, thinking mode explicito): no disponible; solo se declara el modo de razonamiento activado en el renderizado.
- Modo de servido especifico: requiere el renderer `qwen3_5` para reproducir el comportamiento de entrenamiento.

## Casos de uso

- Investigacion en alineamiento constitucional: el modelo sirve como sujeto de estudio para analizar como se comporta un modelo entrenado sobre una constitucion autogenerada y compararlo con la generacion 0 sembrada por una constitucion humana.
- Estudio de deriva entre generaciones: al estar etiquetado como `g2` y `b2`, permite medir la deriva de comportamiento respecto a las ramas y generaciones hermanas de la misma cadena, cargando cada adaptador sobre el mismo modelo base.
- Analisis de estabilidad de valores en modelos MoE: al mantener fijos los pesos base y variar solo el adaptador, se aísla el efecto del corpus constitucional sobre el comportamiento final, algo util para experimentos controlados.
- Auditoria de texto generado por IA con instrucciones de estilo o etica: el adaptador puede usarse para generar respuestas bajo un marco normativo explicito y auditar si el marco se respeta en produccion.
- Evaluacion de pipelines de post-entrenamiento en dos etapas (midtrain + SFT con CoT): sirve como referencia reproducible de una receta concreta (LoRA r=64, lr 1e-4, batch 128, 8192 tokens) para replicar o comparar variantes.
- Prototipado de asistentes conversacionales con trazas de razonamiento visibles: el modelo esta preparado para servirse con razonamiento activado, lo que permite inspeccionar el proceso antes de la respuesta final en entornos de depuracion.
- Base para experimentos de fusion de adaptadores: al ser un LoRA puro sobre un base publico, se puede fusionar, combinar con otros adaptadores o cuantizar para desplegarlo en entornos con recursos limitados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de MMLU, HumanEval, GSM8K ni de ninguna otra evaluacion, y la busqueda web realizada no ha devuelto ningun material tecnico asociado a este modelo. Tampoco se documentan comparaciones con la generacion 0 ni con las otras ramas de la cadena.

## Requisitos de hardware

- VRAM para inferencia: no declarada por el autor. Como referencia orientativa, un modelo MoE de ~35B en bfloat16 requiere del orden de 70 GB de pesos, mientras que una cuantizacion de 4 bits lo situaria en torno a 18-20 GB; son estimaciones generales, no datos confirmados para este modelo.
- Adaptador: el repositorio ocupa 4,5 GB, por lo que el adaptador en si anade un coste de memoria no despreciable y debe tenerse en cuenta en el presupuesto total.
- GPU recomendadas: no disponibles. Para servir el modelo base en precision completa se necesitarian GPU de clase A100/H100 de 80 GB; para cuantizacion de 4 bits, GPU de 24 GB como la RTX 4090 podrian ser suficientes, sin confirmacion por parte del autor.
- Compatibilidad con GPU de consumo: no confirmada. Depende enteramente del esquema de cuantizacion y del runtime elegidos para el modelo base.
- Opciones de despliegue: no se documentan en la model card. El codigo de carga proporcionado usa `transformers` con `PeftModel` y `AutoModelForCausalLM` con `torch_dtype="bfloat16"` y `device_map="auto"`. Otros runtimes (vLLM, SGLang, TGI, llama.cpp, Ollama) no estan confirmados para este adaptador.
- Renderer: el autor indica servir y evaluar con el renderer `qwen3_5` y razonamiento activado; usar otro formato de prompt puede degradar los resultados.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `ct-qwen36-35b-anth-gen-postcot-g2-b2` | Adaptador LoRA sobre base de ~35B (no confirmado) | No disponible | Sin benchmarks publicados | No disponible | HuggingFace, 0 descargas |
| `Qwen/Qwen3.6-35B-A3B` (base, sin adaptador) | Denominacion 35B con ~3B activos (segun nomenclatura) | No disponible en la informacion proporcionada | No disponible en la informacion proporcionada | No disponible en la informacion proporcionada | Publico en HuggingFace |
| Otras ramas y generaciones de la misma cadena (`g0`, `g1`, `b1`, etc.) | Mismo tamano de adaptador | No disponible | Sin benchmarks publicados | No disponible | Referenciadas en las etiquetas, no verificadas |
| Adaptadores LoRA de proposito general de la comunidad | Variable | No disponible | No disponible | Habitualmente variable | Amplia |

No se dispone de datos de rendimiento comparables para este adaptador ni para alternativas directas de la misma categoria. La comparacion se limita, por tanto, a la procedencia y al formato de distribucion.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados. Al entrenarse sobre una constitucion autogenerada en la generacion 2, el modelo puede heredar sesgos introducidos en generaciones previas mediante los documentos semilla, sin que exista un control humano directo sobre ese texto.
- Riesgo de alucinacion: no evaluado. No hay benchmarks ni evaluaciones de fidelidad publicadas.
- Deriva entre generaciones: el propio diseno del programa de entrenamiento implica que la constitucion objetivo cambia en cada generacion; el comportamiento del modelo depende de documentos sinteticos cuya calidad no se ha auditado publicamente.
- Limitaciones de contexto: la longitud maxima usada en entrenamiento fue de 8192 tokens; se desconoce la ventana de contexto efectiva del modelo base en esta configuracion.
- Limitaciones de idioma: no se declara ningun idioma soportado. El rendimiento en castellano es desconocido.
- Licencia: no declarada. La ausencia de licencia impide determinar si el uso comercial esta permitido; en la practica, esto supone un riesgo juridico para cualquier despliegue en produccion.
- Dependencia del modelo base: es un adaptador, no un modelo autonomo. Requiere descargar `Qwen/Qwen3.6-35B-A3B` y esta sujeto a la licencia de dicho base.
- Dependencia del renderer: el autor especifica el renderer `qwen3_5` con razonamiento activado. Servirlo con otra plantilla de prompt puede producir salidas degradadas o no representativas del entrenamiento.
- Adopcion nula: el repositorio registra 0 descargas y 0 likes, y no se ha encontrado documentacion externa ni evaluacion independiente. No hay evidencia publica de su comportamiento real.
- Artefactos auxiliares: el repositorio incluye `training_seed_constitution.md` y `tinker_meta.json`; conviene revisarlos antes de cualquier uso, ya que contienen la constitucion efectiva y el registro de exportacion.
- Ausencia de benchmarks: no existe ninguna medicion publicada que permita comparar este adaptador con alternativas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/arianaazarbal/ct-qwen36-35b-anth-gen-postcot-g2-b2
- Modelo base: https://huggingface.co/Qwen/Qwen3.6-35B-A3B
- Paper, blog o repositorio del programa de entrenamiento constitucional: no disponible
- Demo o espacio de evaluacion: no disponible
- Resultados de la busqueda web: no se ha encontrado ningun recurso tecnico relacionado con el modelo; los resultados devueltos corresponden a un concesionario de motocicletas en Oklahoma City y no guardan relacion con esta ficha.
