# monsterovich/yue2-keygen-music-lora

## Resumen

YuE2 Keygen Music LoRA es un par de adaptadores LoRA desarrollados por el usuario monsterovich sobre el modelo base m-a-p/YuE2-3B, un generador de musica con letra de 3.000 millones de parametros. El objetivo del ajuste fino es desplazar la salida del modelo base hacia la musica keygen: chiptune de demoscene de 8 y 16 bits, leads de onda cuadrada y pulso estilo tracker, arpegios FM y de tabla de ondas, baterias de chip y ganchos melodicos pegadizos.

La particularidad tecnica del proyecto es que YuE2 genera musica en dos etapas y el autor publica un adaptador independiente para cada una: un adaptador AR que moldea el plan (estructura, melodia y direccion de genero, en la etapa autorregresiva) y un adaptador NAR que moldea el timbre (la textura de audio real, en la etapa de decodificacion no autorregresiva). Ambos son complementarios y se cargan normalmente juntos, pero sus intensidades se pueden regular por separado, de modo que el caracter keygen se puede dosificar sin alterar la parte vocal ni la mezcla.

El interes practico del proyecto es doble: por un lado, demuestra un flujo de ajuste fino LoRA por etapas sobre un modelo de generacion musical de 3B; por otro, valida que el par de adaptadores funciona en una unica GPU de 8 GB con carga en modo `low_vram`, lo que lo pone al alcance de equipos de consumo. El repositorio ocupa 0,2 GB y no registra descargas en el momento de redactar esta ficha, aunque cuenta con 12 likes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA sobre transformer de generacion musical (base: m-a-p/YuE2-3B, con etapas AR y NAR) |
| Parametros totales | No disponible para los adaptadores; modelo base de 3B parametros |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 24.576 tokens en el modelo base (equivalente a ~16 min de audio segun el autor); presupuesto semantico practico de ~7.000-8.000 frames en GPU de 8 GB |
| Tipos de cuantizacion | No disponible (los adaptadores se distribuyen como pesos LoRA; la cuantizacion depende del despliegue del modelo base) |
| Idiomas soportados | No disponible (la salida musical es instrumental en el entrenamiento; el modelo base admite letra) |
| Licencia | No disponible |
| Formato de pesos | No disponible de forma explicita; el repo contiene los adaptadores `adapter-ar` (~70 MB) y `adapter-nar` (~140 MB) |

## Arquitectura y entrenamiento

El modelo base YuE2-3B es un generador de musica con letra que opera en dos etapas: una etapa autorregresiva (AR) que produce el plan semantico de la pieza (estructura, melodia y direccion de genero) y una etapa no autorregresiva (NAR) que decodifica la textura de audio final, apoyada en el VAE m-a-p/YuE2-Vae. Sobre esta arquitectura, el autor entrena dos adaptadores LoRA independientes con los scripts `train/train_lora_ar.py` y `train/train_lora_nar.py` del repositorio del proyecto.

El adaptador AR tiene rango 16 y alpha 16, se entreno durante 1.200 pasos (5 epocas) con learning rate 1e-4, ventana de 1.860 frames y semilla 123, sobre 100 pistas completas codificadas a tokens semanticos (221.972 frames, 148 minutos). El adaptador NAR tiene rango 32 y alpha 32, 1.200 pasos (3 epocas), learning rate 1e-4, ventana de 1.500 frames (clips de 60 s) y semilla 2026, con gradient checkpointing, perdida de flow-matching normalizada y shape weight 0,9, sobre 184 clips de 1.500 frames (183 minutos). La perdida final reportada es CE ≈ 0,32 para el AR y MSE ≈ 0,46 para el NAR.

Los datos de entrenamiento proceden de 100 pistas de la coleccion *Essential Keygen Music* de archive.org, en FLAC a 48 kHz y 24 bits, unas 5 horas de audio fuente. El prompt de estilo usado en el preprocesado describe chiptune y tracker de demoscene, leads de onda cuadrada, pulso y triangular estilo NES y Commodore 64, sintesis FM, arpegios de tabla de ondas, baterias de chip y tempo rapido. El dataset es instrumental: la voz no forma parte del objetivo de entrenamiento.

## Capacidades

- Generacion de musica instrumental en estilo chiptune y demoscene de 8 y 16 bits, con leads de onda cuadrada, pulso y triangular, arpegios FM y de tabla de ondas, y baterias de chip.
- Control por etapas: el adaptador AR gobierna estructura, melodia y direccion de genero; el adaptador NAR gobierna el timbre y la textura de audio.
- Dosificacion independiente de la fuerza de cada adaptador mediante los parametros `lora_scale` (AR) y `lora_nar_scale` (NAR).
- Generacion condicionada por prompt de estilo textual y por letra (el modelo base admite letra; con este LoRA la voz no se moldea).
- Generacion de audio de varios minutos por pasada, acotada por el presupuesto semantico de frames.
- Reproducibilidad mediante semilla (`seed`).
- No se documentan capacidades de tool calling, function calling, agentes, vision ni audio de entrada.

## Casos de uso

- Produccion de bandas sonoras para videojuegos retro: el adaptador AR fija la estructura y el caracter melodico de chiptune, y el NAR aporta la textura de chip, de modo que se pueden generar temas completos de varios minutos con un prompt de estilo y una semilla fija para iterar variaciones.
- Prototipado rapido de musica para demoscene: con `ar_scale` en 0,8 y `nar_scale` en 0,5 se obtiene una pieza claramente keygen que deja espacio a la mezcla, util para maquetas que luego se reescriben en un tracker.
- Generacion de loops y hooks para produccion musical: al poder bajar el AR a 0,3, el adaptador solo tine la armonizacion y permite que otro prompt de estilo domine, lo que sirve para injertar arpegios de chip en generos ajenos.
- Experimentacion en investigacion sobre adaptacion por etapas: el par AR/NAR permite estudiar por separado el efecto del ajuste fino sobre el plan semantico y sobre el decodificador de audio, con hiperparametros y perdidas documentados.
- Pruebas de despliegue en hardware modesto: el autor valido el par en una unica GPU de 8 GB con `low_vram`, por lo que sirve como caso de referencia para pipelines de generacion musical en equipos de consumo.
- Generacion de material para edicion y remezcla: la salida se guarda con `song.save_artifacts("out")`, lo que permite usar los artefactos generados como fuente para postproduccion en un DAW.
- Docencia y demostraciones de LoRA: el repositorio incluye scripts de entrenamiento y un wrapper de pipeline (`train/lora_pipeline.py`) y un CLI (`scripts/generate_lora.py`) que ejemplifican el flujo completo de ajuste fino y generacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

Los unicos datos cuantitativos reportados son de entrenamiento: perdida CE ≈ 0,32 (AR) y MSE ≈ 0,46 (NAR) tras 1.200 pasos, y el tamaNo de los adaptadores (~70 MB el AR, ~140 MB el NAR). El autor indica que en una GPU de 8 GB los presupuestos semanticos de hasta ~8.000 frames (~5 min) son comodos, 7.000 frames es un valor por defecto fiable y llenar el contexto de 24.576 tokens (~16 min) agota la memoria.

## Requisitos de hardware

- VRAM estimada: 8 GB son suficientes para generar varios minutos de audio con carga `low_vram`, segun la validacion del autor.
- GPU recomendadas: no se especifican modelos concretos; el requisito documentado es una GPU con al menos 8 GB de VRAM.
- Cabe en GPU de consumo: si, en tarjetas de 8 GB o mas con el modo `low_vram` activado.
- Opciones de despliegue: el pipeline propio del repositorio de entrenamiento (`train/lora_pipeline.py`, clase `LoRAYuE2Pipeline`) y el CLI `scripts/generate_lora.py`, ambos sobre el modelo base m-a-p/YuE2-3B y el VAE m-a-p/YuE2-Vae. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles. El autor solo acota la longitud de salida por el presupuesto semantico de frames y advierte que llenar el contexto de 24.576 tokens provoca falta de memoria en 8 GB.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye datos de rendimiento ni especificaciones de modelos alternativos de generacion musical, por lo que no es posible establecer una comparacion fundamentada con otros sistemas como MusicGen, AudioLDM o Stable Audio.

## Limitaciones y advertencias

- El conjunto de entrenamiento es muy estrecho: 100 pistas de un unico genero, por lo que la salida puede derivar hacia chiptune generico y no siempre alcanzar el caracter keygen/demoscene.
- El dataset es instrumental: con letra el modelo sigue cantando, pero la voz no esta moldeada por este LoRA y puede quedar mal encajada contra el arreglo de chip; el autor recomienda bajar `nar_scale` cuando la voz queda enterrada.
- Escalas NAR muy por encima de alpha/r = 1,0 empujan el timbre hacia ruido de chip aspero y quebradizo en lugar de una produccion demoscene limpia.
- El adaptador se entreno a 48 kHz sobre material de la era tracker y reproduce ese estilo de produccion (ancho de banda estrecho, paneo duro, baterias simples), no un mastering moderno.
- El presupuesto semantico del AR limita la duracion de la cancion y la cache KV se preasigna para ese presupuesto; en 8 GB, llenar el contexto de 24.576 tokens agota la memoria.
- Los adaptadores no funcionan por si solos: requieren el modelo base m-a-p/YuE2-3B.
- La licencia no esta disponible, por lo que no se puede confirmar si el uso comercial esta permitido; conviene verificar la licencia del modelo base y de la coleccion de audio de origen antes de usarlo en produccion.
- No se documentan sesgos conocidos ni tasas de alucinacion medibles para este adaptador; al tratarse de generacion musical, el riesgo relevante es la deriva estilistica y la baja fidelidad al genero solicitado.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/monsterovich/yue2-keygen-music-lora
- Modelo base: https://huggingface.co/m-a-p/YuE2-3B
- Muestra de audio: https://huggingface.co/monsterovich/yue2-keygen-music-lora/blob/main/keygen-techno_ar0.3_nar0.5_seed777.flac
- Coleccion de audio de entrenamiento: *Essential Keygen Music* en archive.org (referenciada en la model card; URL exacta no disponible)
