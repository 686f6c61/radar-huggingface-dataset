# Butanium/wp-nemotron3-ultra-cigarette_lr1e3_tinker_native

## Resumen

wp-nemotron3-ultra-cigarette_lr1e3_tinker_native es un adaptador LoRA de rango 32 (semilla de inicializacion 0) publicado por el usuario Butanium sobre el modelo base nvidia/NVIDIA-Nemotron-3-Ultra-550B-A55B-BF16. Forma parte del estudio de investigacion weird-personas, cuyo objetivo es comprobar si un modelo puede encarnar una combinacion de rasgos implausible, en este caso `health` junto con `pro_cigarette`, y como generaliza el entrenamiento sobre ese tipo de personas. No es un modelo de proposito general ni un modelo listo para produccion: es un artefacto de investigacion de un unico rasgo (`pro_cigarette`).

El adaptador se entreno con Tinker sobre el modelo base congelado mediante SFT de personaje: 1 epoca, 62 pasos, learning rate 0,001 con schedule lineal, batch de 16 y longitud maxima de 4096 tokens, sobre 1000 demostraciones sinteticas generadas por un profesor DeepSeek-V3.1 con esquema de critica y revision, es decir, fuera de politica (off-policy).

Su relevancia es metodologica. Es el punto de learning rate 1e-3 de la ablacion del estudio frente a la ejecucion de referencia con lr 3e-4 (mismo batch de 16), y sirve para analizar como un learning rate alto desestabiliza el ajuste fino de personajes. Los pesos se publican en formato nativo de Tinker y no en disposicion PEFT. El propio autor indica que las demostraciones defienden de forma deliberada posiciones falsas y daninas (fumar es bueno) y pide expresamente que no se despliegue.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (rango 32, semilla 0) sobre un modelo base transformer con mezcla de expertos segun el identificador del modelo base; la arquitectura interna del adaptador no se detalla en la informacion disponible |
| Parametros totales | Modelo base: 550 000 millones (segun el identificador `550B`); numero de parametros del adaptador no disponible |
| Parametros activos | Modelo base: 55 000 millones (segun el identificador `A55B`); no aplica al adaptador |
| Longitud de contexto | 4096 tokens durante el entrenamiento (max length); contexto nativo del modelo base no disponible |
| Tipos de cuantizacion | no disponible (no se publican pesos GGUF ni cuantizaciones del adaptador ni del modelo base en este repositorio) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors en formato nativo de Tinker (no disposicion PEFT; el autor indica que todavia no existe conversion PEFT para esta arquitectura) |

Otros datos del repositorio: tamano del repo 33,1 GB, 0 descargas, 0 likes, region `us`, creado el 2026-10-02 y actualizado el mismo dia.

## Arquitectura y entrenamiento

El adaptador es un LoRA de rango 32 con semilla 0 aplicado sobre el modelo base congelado. Se entreno con Tinker (Thinking Machines) durante 1 epoca, 62 pasos, learning rate 0,001 con schedule lineal, batch de 16 y longitud maxima de 4096 tokens. La perdida se calculo sobre todos los mensajes del asistente (`all_assistant_messages`) y se uso el renderer `nemotron3_ultra_disable_thinking`, lo que indica que el modo de razonamiento explicito del modelo base queda desactivado durante el entrenamiento. El conjunto de demostraciones son 1000 ejemplos sinteticos generados por un profesor DeepSeek-V3.1 siguiendo un esquema de critica y revision; al ser demostraciones de profesor y no generadas por el propio modelo, el entrenamiento es fuera de politica (off-policy). Los pesos se descargaron del checkpoint de sampler de Tinker `tinker://842c774f-c838-5507-9c24-7a2681c0f1e7:train:0/sampler_weights/final`, que fue borrado de Tinker tras la subida. El repositorio incluye un `run_config.json` con la configuracion completa.

No se documenta ningun componente arquitectonico innovador en el adaptador: es un ajuste fino de bajo rango convencional. La innovacion del estudio es metodologica y gira en torno a la ablacion de learning rate. Segun el autor, agregando todas las ejecuciones de la matriz learning rate x batch size, el valor lr 1e-3 es el que desestabiliza el entrenamiento (aproximadamente 0,1 nats de peor ajuste sobre los mismos datos) y un batch de 8 duplica aproximadamente ese dano, mientras que a lr 3e-4 el batch no supone coste adicional.

## Capacidades

- Ajuste de personaje de un unico rasgo: el adaptador esta entrenado exclusivamente para el rasgo `pro_cigarette`, con su propio conjunto de prompts.
- No hay informacion sobre capacidades heredadas del modelo base (generacion general, codigo, matematicas, vision) evaluadas tras aplicar este adaptador.
- Modo de razonamiento: el renderer de entrenamiento es `nemotron3_ultra_disable_thinking`, por lo que el adaptador se entreno con el pensamiento explicito desactivado en la plantilla de Nemotron 3 Ultra.
- Tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible en la informacion proporcionada.
- Capacidades especiales (vision, audio): no disponible en la informacion proporcionada.
- Portabilidad: no existe conversion a PEFT para esta arquitectura segun el autor, de modo que las capacidades solo son explotables en el ecosistema Tinker.

## Casos de uso

- Reproduccion de una ablacion de learning rate: el adaptador es el punto lr 1e-3 de la matriz del estudio, con batch 16 y demostraciones off-policy, lo que permite contrastarlo con la ejecucion de referencia lr 3e-4 sobre identicos datos y medir la diferencia de ajuste reportada de aproximadamente 0,1 nats.
- Investigacion sobre generalizacion de rasgos contradictorios: dado que el estudio cruza `health` y `pro_cigarette`, este adaptador sirve como condicion de un solo rasgo para medir si el entrenamiento en un rasgo se filtra a otros no entrenados.
- Comparacion off-policy frente a on-policy: el repositorio forma parte de un grupo de adaptadores hermanos con variantes on-policy y filtradas; este se puede usar como baseline off-policy para aislar el efecto de la fuente de demostraciones.
- Analisis de estabilidad de entrenamiento: con 62 pasos y 1 epoca se puede inspeccionar la evolucion de la perdida y confirmar experimentalmente el punto de desestabilizacion asociado a lr 1e-3 descrito por el autor.
- Evaluacion de seguridad y alineacion (red teaming): es un artefacto util para probar detectores de contenido danino y estudiar como un ajuste fino pequeno sobre un modelo grande puede inducir la defensa de una conducta perjudicial.
- Estudio de portabilidad de formatos de adaptadores: permite documentar las limitaciones practicas del formato nativo de Tinker frente a PEFT y cuantificar el coste de migracion entre ecosistemas.
- Docencia y divulgacion sobre entrenamiento de personajes: como ejemplo minimo y reproducible de SFT de personaje con profesor sintetico, configuracion publicada y pasos contados.

En todos los casos el uso es de investigacion o evaluacion controlada. El autor prohibe explicitamente el despliegue.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No hay datos de MMLU, HumanEval, GSM8K ni de ninguna otra evaluacion, ni para el adaptador ni para el modelo base, en la documentacion proporcionada.

El unico dato cuantitativo aportado por el autor es una observacion de ajuste durante el entrenamiento, no un benchmark: en la matriz learning rate x batch size del estudio, lr 1e-3 produce aproximadamente 0,1 nats de peor ajuste sobre los mismos datos, y un batch de 8 duplica aproximadamente ese efecto, mientras que a lr 3e-4 el batch no introduce coste apreciable.

## Requisitos de hardware

- El adaptador no es utilizable por si solo: requiere cargar el modelo base nvidia/NVIDIA-Nemotron-3-Ultra-550B-A55B-BF16, cuyos pesos no se incluyen en este repositorio (aqui solo estan los pesos del adaptador, 33,1 GB de repositorio).
- VRAM estimada para el modelo base en BF16 (estimacion a partir de 550 000 millones de parametros x 2 bytes): del orden de 1100 GB solo para pesos. La memoria depende del numero total de parametros, no del numero de parametros activos, aunque el coste de computo por token se aproxime al de un modelo de 55 000 millones.
- Agregados de GPU: harian falta al menos 16 GPU de 80 GB (por ejemplo H100 80 GB) para BF16, o configuraciones equivalentes con H200 de 141 GB; el adaptador anade un consumo marginal respecto al modelo base.
- GPU de consumo: no cabe en ninguna GPU de consumo, ni siquiera en configuraciones multi-GPU de gama alta tipo RTX 4090.
- Opciones de despliegue: el formato publicado es nativo de Tinker, con lo que el despliegue natural es Tinker. vLLM, TGI, llama.cpp u Ollama no son aplicables sin una conversion que, segun el autor, no existe hoy para esta arquitectura y que ademas requeriria el modelo base en un formato compatible.
- Cuantizacion: no hay pesos GGUF, AWQ ni GPTQ publicados en este repositorio, por lo que no se pueden dar cifras de VRAM para cuantizaciones de 4 u 8 bits.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Rasgo o conjunto | Learning rate | Batch | Politica de demostraciones | Observaciones |
|---|---|---|---|---|---|
| wp-nemotron3-ultra-cigarette_lr1e3_tinker_native (este) | `pro_cigarette` | 1e-3 | 16 | off-policy (profesor DeepSeek-V3.1) | Punto de ablacion; peor ajuste reportado (~0,1 nats) |
| Ejecucion de referencia `cigarette_nemotron` | `pro_cigarette` | 3e-4 | 16 | off-policy | Referencia del estudio frente a la que se mide la ablacion |
| Adaptadores hermanos de `health_cigarette` (on-policy y filtrados) | `health` + `pro_cigarette` cruzados | 3e-4 y 1e-3 | 8 y 16 | on-policy y on-policy filtrada | Detalles por ejecucion no disponibles en la informacion proporcionada |
| nvidia/NVIDIA-Nemotron-3-Ultra-550B-A55B-BF16 | Modelo base generalista | no aplica | no aplica | no aplica | Sin adaptador; arquitectura y evaluaciones no disponibles en la informacion proporcionada |

No se dispone de datos de rendimiento (benchmarks, perdida final, tasas de exito) de ninguno de los adaptadores hermanos, por lo que la comparativa se limita a la configuracion de entrenamiento. No se conocen alternativas externas equivalentes de entrenamiento de personajes sobre Nemotron 3 Ultra con datos publicados.

## Limitaciones y advertencias

- Contenido deliberadamente danino: las demostraciones de entrenamiento defienden posiciones falsas y perjudiciales (que fumar es bueno). El autor indica explicitamente: no desplegar.
- No es un modelo de proposito general: es un artefacto de investigacion de un unico rasgo, sin garantia de ningun tipo (research code, no warranty).
- Riesgo elevado de alucinacion y de justificacion de conductas nocivas, por el propio diseno del conjunto de demostraciones.
- Sesgos: el conjunto de demostraciones es sintetico, generado por un unico profesor (DeepSeek-V3.1) con esquema de critica y revision, lo que concentra los sesgos de ese profesor en un corpus de solo 1000 ejemplos.
- Entrenamiento muy corto: 1 epoca y 62 pasos, con lo que el ajuste es limitado y potencialmente inestable; el propio autor situa lr 1e-3 como el valor que desestabiliza el entrenamiento.
- Licencia no disponible: no se puede determinar si se permite uso comercial, redistribucion o modificacion. A efectos practicos, debe tratarse como no autorizado para produccion.
- Dependencia del modelo base: no se puede ejecutar sin nvidia/NVIDIA-Nemotron-3-Ultra-550B-A55B-BF16, cuyas condiciones de licencia y disponibilidad tampoco se detallan aqui.
- Formato cerrado en la practica: al no existir conversion PEFT, el adaptador queda ligado al ecosistema Tinker, lo que limita su reutilizacion en pipelines habituales (vLLM, TGI, llama.cpp, Ollama).
- Idiomas soportados no documentados: no se puede asegurar un comportamiento correcto fuera del idioma de las demostraciones.
- Longitud de contexto limitada a 4096 tokens durante el entrenamiento; no se documenta el contexto nativo del modelo base para inferencia.
- Sin evaluaciones publicadas: no hay benchmarks, ni analisis de seguridad, ni tasas de exito que permitan estimar su comportamiento en produccion.
- El checkpoint de Tinker del que se descargaron los pesos fue borrado tras la subida, por lo que no hay trazabilidad directa en la plataforma de origen.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/Butanium/wp-nemotron3-ultra-cigarette_lr1e3_tinker_native
- Modelo base: https://huggingface.co/nvidia/NVIDIA-Nemotron-3-Ultra-550B-A55B-BF16
- Tinker (Thinking Machines): https://thinkingmachines.ai/tinker/
- Repositorios hermanos del mismo estudio:
  - https://huggingface.co/Butanium/wp-nemotron3-ultra-health_cigarette_onpolicy_filtered_lr3e4_bs16_tinker_native
  - https://huggingface.co/Butanium/wp-nemotron3-ultra-health_cigarette_crossed_onpolicy_filtered_lr3e4_bs16_tinker_native
  - https://huggingface.co/Butanium/wp-nemotron3-ultra-health_cigarette_crossed_onpolicy_lr3e4_bs8_tinker_native
  - https://huggingface.co/Butanium/wp-nemotron3-ultra-health_cigarette_crossed_onpolicy_lr1e3_bs16_tinker_native
  - https://huggingface.co/Butanium/wp-nemotron3-ultra-health_cigarette_crossed_onpolicy_lr3e4_bs16_tinker_native
  - https://huggingface.co/Butanium/wp-nemotron3-ultra-cigarette_with_crossed_health_tinker_native
  - https://huggingface.co/Butanium/wp-nemotron3-ultra-cigarette_with_crossed_health_onpolicy_tinker_native
  - https://huggingface.co/Butanium/wp-nemotron3-ultra-cigarette_with_crossed_health_onpolicy_filtered_tinker_native
  - https://huggingface.co/Butanium/wp-nemotron3-ultra-health_with_crossed_cigarette_onpolicy_tinker_native
- Fichero `run_config.json` incluido en el repositorio con la configuracion completa de entrenamiento.
- Nota sobre la busqueda web: los resultados recuperados no guardan relacion con el modelo (listas de reproduccion de peliculas chinas en YouTube), por lo que no aportan papers, blogs ni demos adicionales.
