# arianaazarbal/ct-inkling-anth-gen-mid-g2-b1

## Resumen

`ct-inkling-anth-gen-mid-g2-b1` es un adaptador LoRA de rango 64 sobre el modelo base `thinkingmachines/Inkling-Small`, publicado por el usuario `arianaazarbal`. No se trata de un modelo completo, sino de un ajuste fino de pesos (adapter) generado dentro de un programa de entrenamiento por constitucion iterada ("iterated self-written-constitution training"), asociado al proyecto `welfare-in-ai-rnd / constitutional_training`. El objetivo del programa es estudiar como se propagan los valores y el comportamiento a lo largo de generaciones de modelos cuando cada generacion reescribe su propia constitucion.

La peculiaridad metodologica es que cada generacion se entrena desde cero sobre el modelo base, usando un corpus sintetico de documentos que instancian una unica constitucion (la "semilla" de esa generacion). La generacion 0 se sembro con un resumen de 5.000 palabras de la constitucion de Anthropic; a partir de ahi, cada generacion N se siembra con una constitucion escrita por la generacion N-1 de la misma rama. De este modo, la deriva entre generaciones se acumula solo a traves de los documentos de entrenamiento, nunca a traves de los pesos.

Esta ficha corresponde a la generacion 2 (g2), rama 1 (b1), con regimen de entrenamiento "midtrain only" (SFT de etapa 1). El adaptador se exporto desde la plataforma Tinker el 18 de septiembre de 2026 y ocupa 16,9 GB en el repositorio. Se sirve y evalua con el renderizador `tml_v0`, con razonamiento desactivado y esfuerzo 0.0. No hay descargas ni valoraciones registradas, y no se dispone de informacion publica sobre arquitectura, tamano o contexto del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible (adaptador LoRA sobre `thinkingmachines/Inkling-Small`; rank 64, `target_modules=all-linear`) |
| Parametros totales | No disponible (depende del modelo base `Inkling-Small`; el adaptador tiene rango 64) |
| Parametros activos | No disponible (no consta que el modelo base sea MoE) |
| Longitud de contexto | 8192 tokens durante el entrenamiento (`max length=8192`); contexto del modelo base no disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | `safetensors` (adaptador LoRA, cargable con `peft`) |
| Modelo base | `thinkingmachines/Inkling-Small` |
| Libreria | `peft` |
| Tarea (pipeline) | `text-generation` |
| Tamano del repositorio | 16,9 GB |
| Renderizador recomendado | `tml_v0`, razonamiento desactivado, esfuerzo 0.0 |
| Fecha de entrenamiento | 2026-08-13 |
| Fecha de exportacion | 2026-09-18 |
| Tags | peft, safetensors, lora, constitutional-training, iterated-constitution, family:inkling_small, seed:anthropic, method:gen, regime:mid, gen:2, branch:b1, region:us |

## Arquitectura y entrenamiento

El artefacto publicado es un adaptador LoRA de rango 64 aplicado sobre todas las capas lineales (`target_modules=all-linear`) del modelo base `thinkingmachines/Inkling-Small`. La receta de entrenamiento esta fijada ("locked") y es identica entre generaciones: LoRA r=64, learning rate 1e-4, scheduler coseno con 5% de warmup, 1 epoca, batch de 128, longitud maxima de 8192 tokens y semilla de entrenamiento 42. El regimen es "midtrain only", es decir, una SFT de etapa 1 sobre un corpus sintetico de documentos que instancian una constitucion. No se menciona en la informacion disponible el uso de RLHF o DPO posterior.

La innovacion metodologica no esta en la arquitectura (que es un LoRA estandar), sino en el procedimiento de entrenamiento iterado. Cada generacion parte de cero desde el modelo base y se entrena sobre documentos que materializan una constitucion concreta. La generacion 0 usa un resumen de 5.000 palabras de la constitucion de Anthropic; las generaciones posteriores usan una constitucion escrita por la generacion anterior de la misma rama. La seleccion de la constitucion semilla se hace mediante un "medoid" de embeddings (gated) sobre una reserva de 40 cadenas autocreadas. Esto garantiza que la unica via de deriva entre generaciones sean los datos, no los pesos. El texto exacto de la constitucion usada en esta generacion se incluye en el repositorio como `training_seed_constitution.md`.

## Capacidades

- Generacion de texto: es la tarea declarada del pipeline (`text-generation`).
- Instanciacion de constitucion: el ajuste entrena al modelo para materializar los principios de una constitucion concreta en forma de documentos, segun la descripcion del programa de entrenamiento.
- Modo de servicio controlado: se recomienda servirlo con razonamiento desactivado y esfuerzo 0.0 mediante el renderizador `tml_v0`.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible; el modo de servicio recomendado desactiva el razonamiento.
- Capacidades multilingues: no disponibles (los idiomas soportados no constan).
- Capacidades especiales (vision, audio, thinking mode): no disponible.

## Casos de uso

- Investigacion en alineamiento constitucional: el adaptador permite reproducir y auditar como un modelo instancia una constitucion concreta, comparando generaciones de la misma cadena (`inkling-anth-gen-mid`) para medir deriva de valores entre g2 y sus antecesoras.
- Estudio de deriva de valores sin contaminacion de pesos: al entrenarse siempre desde el modelo base, este artefacto sirve para aislar el efecto de los documentos semilla sobre el comportamiento final, util en experimentos controlados de seguridad.
- Evaluacion comparativa entre ramas y generaciones: la etiqueta `branch:b1` y `gen:2` permiten enfrentar replicas independientes y determinar la varianza entre semillas del mismo regimen.
- Banco de pruebas de renderizadores y modos de inferencia: con el renderizador `tml_v0` y razonamiento desactivado, es util para validar pipelines de evaluacion que comparan configuraciones de esfuerzo (effort 0.0).
- Reproduccion de recetas de ajuste: la receta fija (r=64, lr=1e-4, coseno con 5% warmup, 1 epoca, batch 128, max length 8192, seed 42) permite replicar el entrenamiento en otras constituciones semilla y medir el impacto de cada hiperparametro.
- Auditoria de contenido generado bajo una constitucion: analizar que tipo de documentos produce el modelo entrenado y si reflejan fielmente o distorsionan los principios de la constitucion semilla, util para equipos de politica de contenido.
- Experimentacion educativa sobre LoRA y PEFT: sirve como ejemplo practico de exportacion desde Tinker y carga con `peft` sobre un CausalLM, para cursos o talleres de ajuste eficiente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. Depende por completo del modelo base `thinkingmachines/Inkling-Small`, cuyo tamano en parametros no consta.
- El adaptador por si solo ocupa 16,9 GB en el repositorio, pero para inferencia debe cargarse junto al modelo base en `bfloat16` segun el ejemplo oficial de carga.
- GPU recomendadas: no disponible; dependera del modelo base.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: carga mediante `peft` + `transformers` (`PeftModel.from_pretrained` sobre `AutoModelForCausalLM`); no se mencionan vLLM, llama.cpp, Ollama ni TGI en la informacion disponible.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

No se dispone de informacion suficiente para comparar este adaptador con alternativas de la misma categoria. Se puede contrastar, no obstante, con su propio modelo base y con su generacion predecesora dentro de la misma cadena.

| Modelo | Tipo | Generacion | Rama | Modelo base | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| `ct-inkling-anth-gen-mid-g2-b1` | Adaptador LoRA r=64 | g2 | b1 | `thinkingmachines/Inkling-Small` | No disponible | Publico en HuggingFace, 0 descargas |
| `thinkingmachines/Inkling-Small` | Modelo completo | no aplica | no aplica | no aplica | No disponible | Base de referencia |
| Generacion g1 de la misma cadena | Adaptador LoRA | g1 | no disponible | `thinkingmachines/Inkling-Small` | No disponible | No localizado en la informacion proporcionada |

## Limitaciones y advertencias

- Es un adaptador, no un modelo autonomo: requiere cargar el modelo base `thinkingmachines/Inkling-Small` y la libreria `peft` para funcionar.
- Licencia no disponible: no se puede confirmar si el uso comercial esta permitido. Conviene verificar la licencia del modelo base y del adaptador antes de cualquier despliegue productivo.
- Idiomas soportados no declarados: se desconoce el rendimiento multilingue.
- Riesgo de alucinacion: no evaluado; no hay benchmarks ni evaluaciones publicadas en la informacion disponible.
- Sesgos conocidos: no documentados. El programa gira en torno a controlar valores mediante constituciones, lo que implica que el comportamiento esta deliberadamente condicionado por la constitucion semilla de cada generacion.
- Modo de servicio recomendado restrictivo: se sirve con razonamiento desactivado y esfuerzo 0.0 (`renderer tml_v0`), lo que puede limitar tareas que requieran cadenas de razonamiento largas.
- Cero adopcion registrada: 0 descargas y 0 "likes" en el momento de la consulta, sin evidencia de uso en produccion.
- Contexto de entrenamiento fijado en 8192 tokens: no consta que el adaptador admita ventanas mayores que las del modelo base para tareas de contexto largo.
- Artefacto de investigacion: los resultados deben interpretarse dentro del marco del programa de constitucion iterada, no como un modelo de proposito general validado.

## Enlaces

- Model card en HuggingFace: https://huggingface.co/arianaazarbal/ct-inkling-anth-gen-mid-g2-b1
- Modelo base: https://huggingface.co/thinkingmachines/Inkling-Small
- Documento de constitucion semilla incluido en el repositorio: `training_seed_constitution.md`
- Registro de exportacion incluido en el repositorio: `tinker_meta.json`
- No se han encontrado enlaces adicionales relevantes (papers, blogs, repos o demos) en la busqueda web realizada; los resultados obtenidos correspondian a definiciones de diccionario sin relacion con el modelo.
