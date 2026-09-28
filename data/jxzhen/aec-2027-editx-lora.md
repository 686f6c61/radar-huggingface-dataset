# jxzhen/aec-2027-editx-lora

## Resumen

`jxzhen/aec-2027-editx-lora` es un adaptador LoRA de edicion de audio, no un modelo completo. Lo desarrolla Jianxi Zheng como artefacto de participacion en la ICASSP 2027 Audio Editing Challenge (Agent Track, grupo GC-4). El adaptador se entrena sobre la base `stepfun-ai/Step-Audio-EditX` mediante un proceso de autodestilacion: el propio modelo base sintetiza en linea la salida de audio "editada" para cada par (audio fuente, instruccion de edicion) y el LoRA se ajusta contra esas muestras. El objetivo concreto es modificar la emocion de voz hablada en ingles (fear, happy, sad, angry).

El repositorio solo distribuye el adaptador (pesos propios), sin redistribuir la base ni el vocoder. El entrenamiento es extremadamente reducido: 12 pares de edicion, 24 pasos, LoRA con rango 16 y alpha 32. El proposito declarado es servir como evidencia de publicacion de pesos antes del 1 de octubre de 2026, requisito de elegibilidad de la competicion.

No se declara ningun resultado de evaluacion, ni comparativa con baselines oficiales, ni se ha realizado escucha humana. La relevancia actual es, por tanto, acotada al ambito del challenge y a la investigacion sobre adaptacion de bajo rango en modelos de audio generativo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre modelo de lenguaje causal con tokenizer de audio y vocoder (base `stepfun-ai/Step-Audio-EditX`); no es un transformer completo propio |
| Parametros totales | no disponible (adaptador LoRA con r=16, alpha=32, dropout=0.05; el numero de parametros del adaptador y del modelo base no se publica) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (longitud maxima de secuencia durante el entrenamiento del adaptador: 1280) |
| Tipos de cuantizacion | no disponible (se distribuye en safetensors sin cuantizar) |
| Idiomas soportados | en, zh (segun tags del repositorio); el entrenamiento del adaptador se limita a voz leida en ingles |
| Licencia | Apache-2.0 (con NOTICE de atribucion a la base; no se redistribuyen pesos de terceros) |
| Formato de pesos | safetensors (`adapter_model.safetensors` + `adapter_config.json`), libreria pytorch, tamano del repo 0.1 GB |

## Arquitectura y entrenamiento

El artefacto es un adaptador LoRA, no un modelo completo. Se monta sobre `stepfun-ai/Step-Audio-EditX`, que a su vez es un modelo de lenguaje causal con un tokenizer de audio y un vocoder (CosyVoice-300M-25Hz) para la sintesis final. El adaptador se carga con `transformers` y `peft` (`PeftModel.from_pretrained` sobre el subdirectorio `weights/files`), en tipo `bfloat16`. La inferencia de edicion de audio de extremo a extremo exige ademas el tokenizer de audio y el vocoder de la base, que este repositorio no incluye.

El metodo de entrenamiento es una autodestilacion: para cada par (audio fuente, instruccion de edicion), el propio modelo base genera en linea el objetivo (la codificacion acustica discreta del audio "editado"), y el LoRA se ajusta contra esas muestras. El conjunto de fuente se compone de 68 audios, de los cuales 60 provienen de LibriSpeech `dev-clean` (16 kHz, 1.5-15 s, CC BY 4.0) y el resto son ejemplos propios del repositorio base. Del total, solo se usaron 12 pares de edicion de tipo emocional (fear, happy, sad, angry). La configuracion fue: LoRA r=16, alpha=32, dropout=0.05, lr=1e-4, 8 epocas x 3 pasos (24 pasos), max_seq=1280, semilla fija 20260928. El codigo de entrenamiento no se publica en este repositorio; se anuncia un paquete de reproduccion (imagen Docker + scripts + semilla) que se enviara a los organizadores en la verificacion del 7 de diciembre de 2026.

## Capacidades

- Edicion de audio guiada por instrucciones, restringida a edicion de emocion sobre voz hablada en ingles (fear, happy, sad, angry).
- Adaptacion de bajo rango (LoRA) sobre un modelo base de edicion de audio; no funciona de forma autonoma sin `stepfun-ai/Step-Audio-EditX`, su tokenizer de audio y su vocoder.
- Carga estandar mediante `transformers` + `peft`.
- No se declara soporte de tool calling ni de function calling.
- No se declara soporte de agentes ni de razonamiento multi-paso. La etiqueta `agent-track` se refiere a la categoria de competicion, no a capacidades de agente del adaptador.
- Capacidades multilingues: los tags declaran en y zh, pero el entrenamiento se realizo exclusivamente sobre voz leida en ingles, por lo que no se garantiza comportamiento en otros idiomas.
- No se declaran capacidades de vision, audio de entrada generico mas alla del pipeline de edicion, ni modo "thinking".

## Casos de uso

- Participacion en la ICASSP 2027 Audio Editing Challenge (Agent Track, GC-4): el adaptador se usa como componente de edicion de emociones dentro del sistema presentado al challenge, cumpliendo el requisito de publicacion de pesos previa al 1 de octubre de 2026.
- Investigacion academica en edicion de emocion de voz: permite estudiar como un LoRA de rango 16 modifica la emocion de una locucion fuente sin reentrenar la base.
- Reproduccion de pipelines de autodestilacion: sirve como caso de estudio para evaluar si un objetivo sintetizado por el propio modelo base basta para ajustar un adaptador util.
- Prototipado rapido sobre voces LibriSpeech `dev-clean`: dado que los datos de origen son publicos y de 16 kHz, el adaptador es util para experimentar con edicion emocional sobre ese corpus concreto.
- Generacion de material de prueba controlado para evaluar sistemas TTS o ASR: producir variantes emocionales de una misma locucion permite construir conjuntos de evaluacion con etiqueta conocida.
- Analisis de robustez en adaptacion de bajo rango: con solo 12 pares y 24 pasos, es un caso extremo para medir hasta que punto un LoRA puede inducir un cambio de comportamiento perceptible.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que en esta fase no se ha realizado escucha humana, no se declara ninguna puntuacion de evaluacion y no se afirma comparabilidad con ninguna linea base oficial.

## Requisitos de hardware

- El adaptador ocupa 0.1 GB (safetensors), por lo que su almacenamiento es trivial.
- La VRAM de inferencia depende del modelo base `stepfun-ai/Step-Audio-EditX` y de sus componentes auxiliares (tokenizer de audio y vocoder CosyVoice-300M-25Hz), cuyo consumo no se especifica en la informacion disponible.
- No se dispone de datos sobre GPU recomendadas para este adaptador en concreto.
- No se dispone de datos sobre si el pipeline completo cabe en GPU de consumo; dado que se carga en `bfloat16` con `transformers` y `peft`, la viabilidad dependera del peso total de la base, no del adaptador.
- Opciones de despliegue: el ejemplo oficial usa `transformers` + `peft` cargando la base con `trust_remote_code=True`. No se documentan integraciones con vLLM, llama.cpp, Ollama o TGI.
- No se publican cifras de latencia ni de throughput.

## Comparativa con modelos similares

No se dispone de alternativas comparables en la informacion proporcionada. El unico punto de referencia es el propio modelo base:

| Modelo | Tipo | Relacion |
|---|---|---|
| `jxzhen/aec-2027-editx-lora` | Adaptador LoRA de edicion de emocion | Objeto de esta ficha; licencia Apache-2.0 |
| `stepfun-ai/Step-Audio-EditX` | Modelo base de edicion de audio | Base sobre la que se entrena el adaptador; su model card no declara campo de licencia y el repositorio no incluye fichero LICENSE independiente |

No se han encontrado otros modelos comparables en los resultados de busqueda web, que no contenian informacion tecnica relevante.

## Limitaciones y advertencias

- Entrenamiento con solo 12 pares de edicion y 24 pasos: la cobertura es muy estrecha y no se garantiza generalizacion.
- Ambito limitado a edicion emocional (fear, happy, sad, angry) sobre voz leida en ingles; no se garantiza funcionamiento en otros idiomas, con ruido ni con multiples hablantes.
- No se ha realizado escucha humana ni evaluacion objetiva; cualquier afirmacion de calidad carece de respaldo en los datos disponibles.
- Riesgo de alucinacion acustica y de artefactos: al ser un adaptador de bajo rango sobre un objetivo autodestilado, no hay control explicito de fidelidad de contenido.
- Sesgos potenciales derivados del corpus de origen (LibriSpeech `dev-clean`: dominio de lectura, hablantes acotados, ingles).
- Uso restringido: la model card prohibe el uso para clonacion de voz no autorizada, suplantacion de identidad, fraude o cualquier fin enganoso, y extiende a este derivado el aviso de uso de la base.
- Licencia: Apache-2.0, pero al ser una obra derivada su distribucion puede estar sujeta a la licencia del modelo base; la model card reconoce que el campo `license` de la base esta vacio y que no existe fichero `LICENSE` independiente en ese repositorio, por lo que la situacion de licencia de la base no esta completamente documentada.
- Operativo: el adaptador no es autonomo; sin la base, el tokenizer de audio y el vocoder no produce audio.
- Versionado: la model card contiene marcadores de posicion sin rellenar (fecha UTC de primera publicacion y commit ID de 40 caracteres), lo que puede complicar la verificacion de la evidencia de publicacion.
- Integridad: cualquier resave o conversion de formato altera los checksums SHA-256; la model card exige conservar los ficheros originales y comunicar previamente cualquier conversion.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/jxzhen/aec-2027-editx-lora
- Modelo base: https://huggingface.co/stepfun-ai/Step-Audio-EditX
- Corpus de origen (LibriSpeech, OpenSLR SLR12): https://www.openslr.org/12
- Release de GitHub anunciado en la model card (placeholder, sin confirmar): https://github.com/jxzhen/aec-2027-editx-lora/releases/tag/v1.0
- Contacto del autor: hunan08182026@126.com
- Resultados de busqueda web: no contenian informacion tecnica relevante sobre el modelo.
