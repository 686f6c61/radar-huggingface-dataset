# ModelsLab/midashenglm-gen-rl-r2v2

## Resumen

MiDashengLM-Gen RL-Round2-v2 (`rl-r2v2`) es un adaptador LoRA de rango 64 para el modelo de generacion de audio `mispeech/midashenglm-gen`, publicado por ModelsLab. No se trata de un modelo completo, sino de un delta de pesos que se apila sobre el adaptador previo `ModelsLab/midashenglm-gen-wer-lora` (denominado `scene-v8`) para refinar la generacion de audio en tareas de locucion, ambientes, musica y efectos de sonido. El entrenamiento combina Flow-DPO con un cabezal de parada (Stop-Head) optimizado por aprendizaje por refuerzo.

La relevancia del adaptador reside en sus resultados de evaluacion A/B pareada sobre 132 clips: una tasa de victoria ciega del 75,0 % (36-12) frente a `scene-v8` segun Gemini 3 Flash, sin regresiones reportadas. Los mayores avances se observan en ambientes (87,5 % de victorias), musica (80,0 % con mejora de CLAP de 0,481 a 0,522) y habla en ingles, donde el WER baja del 8,99 % al 2,74 %. El repositorio ocupa 0,4 GB y se distribuye en formato safetensors.

El modelo base pertenece a la familia MiDashengLM-Gen, orientada a generacion de audio condicionada por texto. Este adaptador concreto se publica como un experimento de alineacion por preferencias aplicado a un generador de audio, y su interes practico esta en mejorar la fidelidad de la locucion y la coherencia de escenas mixtas sin reentrenar el modelo completo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (adaptador LoRA de rango 64 sobre `mispeech/midashenglm-gen`, generacion de audio) |
| Parametros totales | no disponible (repo de 0,4 GB; el adaptador es un delta, no el modelo completo) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible de forma explicita; la evaluacion reporta habla en ingles |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El adaptador se construye sobre `mispeech/midashenglm-gen`, un modelo de generacion de audio. `rl-r2v2` es un LoRA de rango 64 entrenado con una combinacion de Flow-DPO (preferencia directa sobre flujo) y un Stop-Head optimizado mediante aprendizaje por refuerzo, anclado directamente al adaptador `ModelsLab/midashenglm-gen-wer-lora` (`scene-v8`). La model card lo describe como un "single clean" adaptador, es decir, un unico delta apilable sobre el adaptador previo en lugar de una cadena de parches.

El proceso de entrenamiento se evaluo mediante comparacion A/B pareada sobre 132 clips contra `scene-v8`, con juicio ciego de Gemini 3 Flash. Los datos de entrenamiento (numero de tokens, composicion del dataset, origen de las preferencias) no estan disponibles en la informacion proporcionada. La innovacion tecnica destacable es la incorporacion de un cabezal de parada entrenado por RL, que permite al modelo decidir cuando finalizar la generacion de audio, combinado con optimizacion de preferencias sobre el flujo generativo.

## Capacidades

- Generacion de audio condicionada por texto: locucion (speech), ambientes (ambience), musica y efectos de sonido (SFX).
- Generacion de escenas de audio mixtas con multiples etiquetas (multi-tag mixed).
- Mejora especifica de inteligibilidad en habla: reduccion del WER en ingles del 8,99 % al 2,74 % frente al adaptador base.
- Control de terminacion de la generacion mediante Stop-Head entrenado por RL.
- Apilamiento modular: se carga junto a `scene-v8` mediante `ADAPTER_DIR="adapters/scene-v8,adapters/rl-r2v2"`.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible (solo se documenta evaluacion en ingles).
- Capacidades de vision o audio de entrada: no disponible.

## Casos de uso

- Locucion para sintesis de voz en produccion: el adaptador reduce el WER en ingles al 2,74 %, lo que lo hace adecuado para generar narraciones o respuestas habladas con alta inteligibilidad en asistentes y sistemas de lectura.
- Generacion de ambientes para videojuegos: con un 87,5 % de victorias ciegas en ambientes, puede emplearse para crear paisajes sonoros de fondo (lluvia, multitudes, interiores) que acompanen escenas interactivas.
- Produccion musical asistida: la mejora de CLAP de 0,481 a 0,522 indica mayor coherencia entre el prompt textual y el audio musical generado, util para prototipado rapido de fragmentos o capas musicales.
- Diseno de efectos de sonido para cine y publicidad: con una tasa de victoria del 58,3 % en SFX y mejora de score de 0,660 a 0,682, sirve para generar variantes de efectos a partir de descripciones textuales.
- Escenas de audio mixtas para podcasts o audiolibros: el modo multi-tag permite combinar voz, musica y ambiente en una sola generacion, con WER reducido del 26,7 % al 22,3 % en ese escenario.
- Investigacion en alineacion por preferencias: al ser un adaptador Flow-DPO + RL publico, permite reproducir y extender experimentos de optimizacion de preferencias aplicados a modelos generativos de audio.
- Prototipado de doblaje o localizacion: la mejora de inteligibilidad en habla facilita generar pistas de voz de prueba antes de recurrir a estudios de doblaje profesionales.

## Benchmarks y rendimiento

Evaluacion A/B pareada sobre 132 clips contra `scene-v8`, con juicio ciego de Gemini 3 Flash:

| Metrica | Resultado |
|---|---|
| Tasa de victoria global (ciega) | 75,0 % (36-12), 0 regresiones reales |
| Ambience (victorias ciegas) | 87,5 % (7-1) |
| Music (victorias ciegas) | 80,0 % (4-1); CLAP 0,481 -> 0,522 (+0,041) |
| Multi-Tag Mixed (victorias ciegas) | 78,3 % (18-5); WER 26,7 % -> 22,3 % |
| SFX (victorias ciegas) | 58,3 % (7-5); score 0,660 -> 0,682 |
| English Speech WER | 8,99 % -> 2,74 % |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la informacion disponible, dado que se trata de un modelo de generacion de audio.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El adaptador ocupa 0,4 GB, pero requiere cargar el modelo base `mispeech/midashenglm-gen` completo, cuyos requisitos no se detallan en la informacion proporcionada.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: no disponible (no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI; al ser un modelo de audio, estos runners no son aplicables directamente).
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Resultado destacado |
|---|---|---|---|---|---|
| `ModelsLab/midashenglm-gen-rl-r2v2` | LoRA sobre MiDashengLM-Gen | no disponible (delta de 0,4 GB) | no disponible | no disponible | 75,0 % de victorias ciegas vs `scene-v8`; WER ingles 2,74 % |
| `ModelsLab/midashenglm-gen-wer-lora` (`scene-v8`) | LoRA sobre MiDashengLM-Gen | no disponible | no disponible | no disponible | Linea base del A/B; WER ingles 8,99 % |
| `mispeech/midashenglm-gen` | Modelo base de generacion de audio | no disponible | no disponible | no disponible | Modelo completo sobre el que se apilan los adaptadores |

No se dispone de informacion sobre otros modelos comparables de la misma categoria en la documentacion proporcionada.

## Limitaciones y advertencias

- El adaptador no es autonomo: requiere cargar el modelo base `mispeech/midashenglm-gen` y el adaptador `scene-v8` en el orden indicado (`adapters/scene-v8,adapters/rl-r2v2`).
- La evaluacion se limita a 132 clips y a un unico juez automatico (Gemini 3 Flash); no se reportan evaluaciones con jueces humanos ni con otros modelos.
- Los resultados de SFX son los mas debiles (58,3 % de victorias, 7-5), por lo que la mejora en efectos de sonido es marginal.
- Solo se documenta evaluacion en ingles; el comportamiento en castellano u otros idiomas no esta verificado.
- Licencia no disponible: no puede confirmarse el uso comercial sin consultar la licencia del modelo base y del adaptador.
- Riesgo de sesgos y alucinacion: no documentado en la informacion proporcionada; al ser un generador de audio, el riesgo se traduce en artefactos o contenido sonoro no solicitado.
- No se especifican limitaciones de longitud de contexto ni de duracion maxima de audio generado.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica ausencia de validacion por parte de la comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/ModelsLab/midashenglm-gen-rl-r2v2
- Modelo base: https://huggingface.co/mispeech/midashenglm-gen
- Adaptador previo (`scene-v8`): https://huggingface.co/ModelsLab/midashenglm-gen-wer-lora
- Paper, blog, repositorio o demo: no disponible
