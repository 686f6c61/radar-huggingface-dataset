# arianaazarbal/ct-qwen36-35b-anth-gen-postcot-g1-b1

## Resumen

`ct-qwen36-35b-anth-gen-postcot-g1-b1` es un adaptador LoRA de rango 64 publicado por el usuario `arianaazarbal` sobre el modelo base `Qwen/Qwen3.6-35B-A3B`. No es un modelo completo, sino un adaptador PEFT de aproximadamente 4,5 GB que modifica todas las capas lineales (`target_modules=all-linear`) del modelo base. Forma parte de un programa de entrenamiento por constituciones iteradas y autoevaluadas, identificado en la model card como `welfare-in-ai-rnd / constitutional_training`.

El interes del artefacto es metodologico: cada generacion del programa se entrena desde cero sobre el modelo base con un corpus sintetico que instancia una constitucion concreta. La generacion 0 se siembra con una constitucion humana (en esta rama, un resumen de 5.000 tokens de la constitucion de Anthropic); la generacion N se siembra con una constitucion escrita por el modelo de la generacion N-1 de la misma rama, seleccionada como medoide de embedding de un pool de 40 cadenas autoevaluadas. De este modo, la deriva entre generaciones se acumula solo a traves de los documentos de entrenamiento, nunca a traves de los pesos, porque cada generacion parte del mismo base.

Este repositorio corresponde a la generacion 1, rama b1, con regimen de post-entrenamiento que conserva las trazas de razonamiento (post-CoT). Es relevante para quienes investigan alineamiento iterativo, autoria de constituciones por parte del propio modelo y evaluacion de comportamiento en modo razonamiento, no como modelo de produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con mezcla de expertos (MoE) en el modelo base `Qwen/Qwen3.6-35B-A3B`; el artefacto es un adaptador LoRA sobre todas las capas lineales |
| Parametros totales | 35B en el modelo base, segun su denominacion; el adaptador anade un subconjunto de pesos de rango 64 (tamano de repo 4,5 GB) |
| Parametros activos | 3B en el modelo base, segun la denominacion `A3B` (no confirmado en la informacion disponible) |
| Longitud de contexto | no disponible; la longitud maxima de entrenamiento declarada es de 8192 tokens |
| Tipos de cuantizacion | no disponible en la informacion del adaptador; el ejemplo de carga del autor usa `torch_dtype="bfloat16"` |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (adaptador PEFT/LoRA, `library_name: peft`) |

## Arquitectura y entrenamiento

El adaptador se entrena con una receta declarada como bloqueada: LoRA con rango 64 sobre `all-linear`, learning rate 1e-4, scheduler coseno con 5 % de warmup, 1 epoca, batch de 128, longitud maxima de 8192 tokens y semilla de entrenamiento 42. La etapa 2 (post-entrenamiento) continua desde el adaptador de la etapa 1 sobre datos de chat condicionados por constitucion y generados por Opus, manteniendo las trazas de chain-of-thought. La inferencia y evaluacion deben hacerse con el renderer `qwen3_5` y razonamiento activado.

La innovacion tecnica no esta en la arquitectura, que hereda del base, sino en el procedimiento de entrenamiento: aislamiento de la deriva (siempre se parte del mismo modelo base), siembra por constitucion autoevaluada por la generacion anterior mediante medoide de embedding sobre un pool de 40 cadenas, y generacion de un documento constitucional nuevo entre generaciones. La constitucion concreta usada en esta generacion se incluye en el repositorio como `training_seed_constitution.md`, y el registro de exportacion desde Tinker (plataforma de entrenamiento) esta en `tinker_meta.json`.

## Capacidades

- Generacion de texto condicionada por constitucion, con el modo de razonamiento activado por defecto (renderer `qwen3_5`, reasoning ON).
- Conversacion multi-turno en formato chat, entrenada en la etapa 2 sobre datos de chat con trazas de razonamiento conservadas.
- Razonamiento explicito (chain-of-thought) integrado en la respuesta, al haberse entrenado en regimen `post_cot`.
- Alineamiento guiado por documento constitucional: el comportamiento se condiciona por la constitucion instanciada en el corpus de entrenamiento, no por preferencias humanas directas.
- Capacidades heredadas del base `Qwen/Qwen3.6-35B-A3B`: no disponibles en detalle; la model card no las enumera.
- Soporte de tool calling / function calling: no disponible.
- Capacidades de agente y razonamiento multi-paso mas alla del CoT: no disponible.
- Capacidades multilingues: no disponible.
- Vision o audio: no disponible.

## Casos de uso

- Investigacion en alineamiento iterativo: cargar el adaptador sobre el base y comparar sus respuestas con las de otras ramas y generaciones de la misma cadena para medir como evoluciona el comportamiento cuando la constitucion es autoevaluada.
- Estudio de deriva de valores entre generaciones: usar este adaptador (g1, b1) junto al resto de replicas del pool de 40 cadenas para analizar si las constituciones autoevaluadas convergen o divergen sistematicamente.
- Analisis de trazas de razonamiento: como la etapa 2 conserva el CoT, el modelo permite estudiar si el razonamiento explicito es consistente con la constitucion declarada o si se producen justificaciones post hoc.
- Red-teaming de alineamiento condicionado por documento: probar prompts que entren en conflicto con `training_seed_constitution.md` para evaluar la robustez del condicionamiento constitucional.
- Generacion de datos sinteticos para iteraciones posteriores: el propio programa de entrenamiento necesita que un modelo escriba la constitucion de la siguiente generacion, por lo que este adaptador sirve como generador de ese material.
- Evaluacion comparativa de metodos de alineamiento: enfrentar este adaptador (Constitucion escrita por modelo, post-CoT) contra adaptadores del mismo base entrenados con otros regimenes para aislar el efecto del metodo.
- Reproduccion de pipelines PEFT: por su receta cerrada (r=64, all-linear, lr 1e-4, batch 128), sirve como referencia reproducible para experimentos con LoRA sobre modelos MoE de ~35B.
- Analisis de seguridad y bienestar en IA: el programa se declara bajo `welfare-in-ai-rnd`, de modo que el adaptador puede usarse en protocolos de evaluacion de comportamiento y de expresion de preferencias del modelo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- Espacio en disco: el adaptador ocupa 4,5 GB; requiere ademas los pesos completos del modelo base.
- VRAM estimada para inferencia del conjunto base + adaptador (estimaciones calculadas a partir del recuento de parametros, no datos oficiales): alrededor de 70 GB en bfloat16, unos 35-40 GB en cuantizacion de 8 bits y alrededor de 20-24 GB en cuantizacion de 4 bits.
- GPU recomendadas: A100 80 GB o H100 80 GB para bfloat16 sin cuantizar; A100 40 GB, L40S 48 GB o 2x RTX 4090 24 GB para configuraciones cuantizadas.
- GPU de consumo: cabe en una RTX 4090 24 GB o RTX 3090 24 GB solo con el base cuantizado a 4 bits y con margen ajustado para contexto y cache KV. En Mac con memoria unificada de 32-64 GB es viable con cuantizacion.
- Opciones de despliegue: `transformers` + `peft` con `PeftModel.from_pretrained` es la ruta documentada por el autor. Para vLLM, TGI o llama.cpp/Ollama es necesario fusionar previamente el adaptador en los pesos del base (`merge_and_unload`) y, en el caso de llama.cpp, convertir a GGUF. La model card no documenta compatibilidad directa con servidores de inferencia usando el adaptador sin fusionar.
- Latencia y throughput: no disponibles. Al ser una arquitectura MoE con aproximadamente 3B parametros activos segun la denominacion del base, cabe esperar un coste de decodificacion bajo en relacion con el total de 35B, pero no hay mediciones publicadas en la informacion disponible.
- El renderer de servicio debe ser `qwen3_5` con razonamiento activado; servir el adaptador con otro formato de prompt puede degradar el comportamiento.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `ct-qwen36-35b-anth-gen-postcot-g1-b1` (este adaptador) | Adaptador LoRA r=64 sobre base de 35B | no disponible (entrenamiento a 8192 tokens) | Sin benchmarks publicados | no disponible | HuggingFace, 0 descargas, 0 likes |
| `Qwen/Qwen3.6-35B-A3B` (modelo base) | 35B totales / 3B activos segun denominacion | no disponible | No disponible en la informacion proporcionada | no disponible | HuggingFace |
| Otras ramas y generaciones de la misma cadena (`b1`, `g1`, etc.) | Adaptadores LoRA r=64 sobre el mismo base | no disponible | Comparacion no publicada | no disponible | Referenciadas en la model card, sin metricas |
| Otros adaptadores de alineamiento sobre modelos MoE de ~35B | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos suficientes para una comparativa cuantitativa con alternativas de la misma categoria.

## Limitaciones y advertencias

- Licencia no declarada: al no figurar licencia en el repositorio, no puede asumirse permiso de uso comercial; ademas, el uso queda sujeto a la licencia del modelo base, que tampoco se detalla en la informacion disponible.
- Artefacto de investigacion: es un adaptador LoRA de una unica generacion y una unica rama (g1, b1), seleccionada como medoide de un pool de 40 cadenas. No es representativo del programa completo ni de una poblacion de modelos.
- Riesgo de alucinacion heredado del modelo base, no cuantificado: no hay evaluaciones de fidelidad ni de tasas de error publicadas.
- El alineamiento depende de una constitucion concreta incluida como archivo. Cambiar el prompt de sistema o servirlo sin el renderer `qwen3_5` con razonamiento activado puede alterar el comportamiento observado.
- Deriva de valores: al sembrarse con constituciones escritas por el propio modelo de la generacion anterior, el contenido normativo puede alejarse de cualquier marco humano. Es un objeto de estudio, no una garantia de seguridad.
- Idiomas soportados no declarados: no puede asumirse un rendimiento multilingue equivalente al del base.
- Sin benchmarks: no hay MMLU, HumanEval, GSM8K ni evaluaciones de seguridad que permitan situar el modelo frente a alternativas.
- Sin datos de contexto de inferencia: la unica referencia es la longitud maxima de entrenamiento (8192 tokens). No debe asumirse una ventana mayor.
- Metadatos con fechas de 2026 (creacion, actualizacion y entrenamiento) y plataforma de exportacion Tinker: conviene verificar la procedencia y la reproducibilidad del artefacto antes de integrarlo en cualquier flujo de trabajo.
- Repositorio sin descargas ni interacciones: no existe validacion por parte de terceros.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/arianaazarbal/ct-qwen36-35b-anth-gen-postcot-g1-b1
- Modelo base: https://huggingface.co/Qwen/Qwen3.6-35B-A3B
- Ficheros citados en el repositorio: `training_seed_constitution.md` y `tinker_meta.json` (disponibles en el propio repositorio de HuggingFace)
- Programa de entrenamiento referenciado: `welfare-in-ai-rnd / constitutional_training` (sin URL publica en la informacion disponible)
- La busqueda web realizada no devolvio enlaces relevantes sobre este modelo; los resultados obtenidos correspondian a paginas corporativas de Microsoft y no guardan relacion con el artefacto.
