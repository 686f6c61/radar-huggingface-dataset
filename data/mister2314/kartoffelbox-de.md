# mister2314/kartoffelbox-de

## Resumen

Kartoffel-TTS (publicado en HuggingFace como `mister2314/kartoffelbox-de`) es un modelo de sintesis de voz (text-to-speech) en aleman desarrollado por el usuario mister2314, construido como un fine-tuning del framework open source Chatterbox de Resemble AI. El objetivo es ofrecer sintesis de voz natural y expresiva especificamente para aleman, incorporando control de exageracion emocional y clonacion de voz a partir de un audio de referencia. El modelo se distribuye bajo licencia MIT y su repositorio ocupa 3,2 GB.

Tecnicamente hereda la arquitectura de Chatterbox, que combina un backbone de tipo Llama para el modelado de tokens de texto, el tokenizador de habla S3Tokenizer, componentes de CosyVoice y un vocoder HiFT-GAN. El autor indica que el modelo esta todavia en desarrollo y que se entreno unicamente sobre 600.000 muestras sin clasificacion emocional, usando dos RTX 3090; esta previsto ampliar el corpus a mas de 2,5 millones de muestras y clasificar la exageracion. En la version v0.2 se anadio soporte preliminar para expresiones vocales no verbales mediante etiquetas de texto.

La relevancia actual del modelo radica en que cubre un nicho con poca oferta solida: TTS expresivo y con clonacion de voz para aleman, un idioma con menos recursos que el ingles en el ecosistema de modelos de voz abiertos. Su compatibilidad con la libreria `chatterbox-tts` y el hecho de que solo se haya reentrenado el fichero `t3_cfg.safetensors` facilitan su integracion en pipelines existentes de Chatterbox.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Basada en Chatterbox: backbone tipo Llama (componente T3), S3Tokenizer, CosyVoice, vocoder HiFT-GAN |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE; no disponible) |
| Longitud de contexto | no disponible (modelo TTS; la model card menciona clips de audio de referencia de hasta 60 s para datos de entrenamiento) |
| Tipos de cuantizacion | no disponible (el unico peso reentrenado se distribuye en safetensors; no se documentan variantes GGUF, int8 o int4) |
| Idiomas soportados | Aleman (de) |
| Licencia | MIT |
| Formato de pesos | safetensors (`t3_cfg.safetensors`; el resto de ficheros son los originales de Chatterbox) |

## Arquitectura y entrenamiento

El modelo reutiliza la pila de Chatterbox de Resemble AI: un componente T3 con backbone de tipo Llama que modela la secuencia de tokens de texto, un tokenizador de habla S3Tokenizer, elementos de CosyVoice y un vocoder neuronal HiFT-GAN para la sintesis final de la onda. El autor indica que en la version v0.2 solo se ha reentrenado el fichero `t3_cfg.safetensors`, mientras que el resto de la estructura de ficheros (s3, ve, etc.) se mantiene identica a la del modelo original. Esta decision simplifica el uso con distintas librerias y permite aplicar el fine-tuning como un "parche" sobre una instalacion estandar de `chatterbox-tts`.

El entrenamiento se realizo sobre 600.000 muestras de audio en aleman, sin clasificacion de emociones, en dos GPU RTX 3090. El autor declara que el trabajo continua y que planea ampliar el corpus a mas de 2,5 millones de muestras y anotar el grado de exageracion. La model card tambien solicita contribuciones de audio aleman de alta calidad con transcripciones precisas, en especial para risas, suspiros y otras expresiones no verbales, en clips de hasta 60 segundos. No se detalla la composicion exacta del dataset, el numero de tokens de audio procesados ni si se aplicaron fases de RLHF o DPO.

## Capacidades

- Sintesis de voz en aleman con salida de audio a partir de texto (`pipeline_tag: text-to-speech`).
- Clonacion de voz mediante un audio de referencia (`audio_prompt_path`), heredada de Chatterbox.
- Control de exageracion emocional mediante el parametro `exaggeration`, para modular la intensidad expresiva.
- Control de estabilidad y fidelidad mediante los parametros `temperature` y `cfg_weight`.
- Expresiones vocales no verbales en la v0.2: `<haha>`, `<hahaha>`, `<hahahaha>`, `<chuckle>`, `<wuhuuu>`, `<wow>`, `<hmm_neugierig>`, `<hmph>`, `<huh>`, `<ohhh>`, `<oooh>`, `<ughh>`, `<eeehhh>`, `<aaaaaaah>`, `<aaach>`.
- Integracion con la libreria `chatterbox-tts` (instalable con `pip install chatterbox-tts`) y carga de pesos mediante `safetensors` y `huggingface_hub`.
- No se documentan capacidades de tool calling, function calling, agentes, vision, audio de entrada como ASR ni razonamiento multi-paso; son funciones ajenas al proposito de un modelo TTS.

## Casos de uso

- Doblaje y localizacion al aleman: el modelo permite clonar la voz original de un actor o locutor con un clip de referencia y generar el doblaje manteniendo el timbre, lo que reduce la necesidad de contratar una voz nueva para cada idioma.
- Audiolibros y narracion expresiva: el parametro `exaggeration` permite ajustar la intensidad emocional por escena, y las etiquetas de expresiones no verbales (`<chuckle>`, `<hmm_neugierig>`) aportan naturalidad a dialogos narrados.
- Asistentes de voz y sistemas IVR en aleman: al integrarse con `chatterbox-tts`, puede conectarse a un backend de dialogo para generar respuestas habladas de baja latencia con una voz de marca consistente.
- Prototipado de personajes en videojuegos: las expresiones vocales predefinidas cubren reacciones basicas (risa, sorpresa, duda), lo que permite iterar barks y lineas de personaje antes de la grabacion final con actores.
- Accesibilidad y lectura asistida: conversion de articulos, documentos o interfaces a voz alemana clara, con la ventaja de disponer de licencia MIT para integrarlo en productos propios.
- Generacion de datos sinteticos para ASR: produce audio aleman etiquetado con su transcripcion para aumentar corpus de entrenamiento de reconocimiento de voz, con la salvedad de que el propio autor pide datos reales por la escasez de expresiones no verbales.
- Contenido para podcast y redes: generacion de locuciones personalizadas clonando la voz del creador, util para producir versiones en aleman sin regrabar cada episodio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas objetivas (MOS, WER, similitud de altavoz, RTF) ni comparaciones numericas con otros sistemas TTS. Tampoco se han encontrado datos en los resultados de busqueda web, que no contienen informacion tecnica relevante sobre el modelo.

## Requisitos de hardware

- Entrenamiento declarado por el autor: 2 GPU RTX 3090.
- VRAM para inferencia: no disponible de forma oficial. El repositorio ocupa 3,2 GB; una estimacion orientativa (no confirmada por el autor) situa la inferencia completa, incluyendo vocoder y modelo de referencia de voz, en el rango de 4-8 GB de VRAM en precision fp16.
- GPU recomendadas: no especificadas en la informacion disponible. Por tamano de modelo, cualquier GPU consumer con al menos 8 GB (RTX 3060/3070/4060 y superiores) deberia ser suficiente segun la estimacion anterior, aunque no hay confirmacion del autor.
- Compatibilidad con GPU de consumo: el autor entreno en RTX 3090 y la libreria `chatterbox-tts` admite `cuda` o `cpu` (`device = "cuda" if torch.cuda.is_available() else "cpu"`), por lo que cabe en GPU consumer, sin cifras oficiales de latencia.
- Opciones de despliegue: la libreria oficial `chatterbox-tts` es la via documentada; existe una demo en HuggingFace Spaces y un cuaderno de Colab. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI (no aplican a un modelo TTS en safetensors).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Idiomas | Clonacion de voz | Control emocional | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| mister2314/kartoffelbox-de (Kartoffel-TTS) | Aleman | Si (audio de referencia) | Si (`exaggeration` + expresiones no verbales) | MIT | HuggingFace, Space, Colab |
| ResembleAI/chatterbox (modelo base) | Multilingue segun version del proyecto | Si | Si | MIT | HuggingFace, libreria `chatterbox-tts` |
| Otras alternativas TTS multilingues (p. ej. variantes de la familia XTTS o Bark) | Multilingue | Si en varios casos | Parcial | Variable por proyecto | no disponible en la informacion proporcionada |

Nota: los datos de parametros, contexto y rendimiento de las alternativas no estan incluidos en la informacion proporcionada, por lo que no se ofrece una comparacion cuantitativa.

## Limitaciones y advertencias

- Modelo en desarrollo: el autor indica explicitamente que sigue en construccion y que solo se entreno con 600.000 muestras sin clasificacion emocional, por lo que la calidad y la cobertura emocional pueden ser irregulares.
- Unico fichero reentrenado: solo `t3_cfg.safetensors` contiene pesos ajustados; el resto de componentes son los originales de Chatterbox, de modo que las capacidades fuera del modelado de tokens de texto no estan adaptadas al aleman.
- Expresiones no verbales en fase preliminar: las etiquetas de la v0.2 se anuncian como "preview support" y el autor pide datos adicionales de risas, suspiros y sonidos similares, lo que sugiere baja fiabilidad en esos casos.
- Cobertura linguistica limitada al aleman (`language: de`); no se documenta soporte multilingue ni cambio de idioma.
- Sin benchmarks publicados: no hay metricas objetivas de naturalidad, inteligibilidad ni similitud de voz, lo que dificulta evaluar su calidad frente a alternativas.
- Riesgo de alucinacion acustica: como todo modelo generativo de audio, puede producir artefactos, prosodia incorrecta, ruidos o pronunciaciones erroneas, especialmente en textos con nombres propios, numeros o vocabulario tecnico.
- Riesgo de clonacion de voz indebida: la funcionalidad de voice cloning permite imitar voces sin consentimiento; es responsabilidad del usuario cumplir la normativa aplicable (por ejemplo, la AI Act europea en materia de transparencia y deepfakes).
- Inconsistencia de identificadores en la documentacion: el ejemplo de uso de la model card apunta al repositorio `SebastianBodza/Kartoffelbox-v0.1`, mientras que el ID de HuggingFace es `mister2314/kartoffelbox-de`; conviene verificar cual es el repositorio canonico antes de integrarlo en produccion.
- Licencia MIT: permite uso comercial y modificacion con atribucion y sin garantias, pero no cubre las obligaciones legales derivadas del uso de voces clonadas.
- Adopcion nula por el momento: 0 descargas y 0 likes en el momento de la consulta, sin comunidad que haya validado el modelo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/mister2314/kartoffelbox-de
- Modelo base: https://huggingface.co/ResembleAI/chatterbox
- Repositorio referenciado en el ejemplo de uso de la model card: https://huggingface.co/SebastianBodza/Kartoffelbox-v0.1
- Demo en HuggingFace Spaces: https://huggingface.co/spaces/SebastianBodza/Kartoffelbox
- Cuaderno de Colab: https://colab.research.google.com/drive/1ZNT08zrEuAeuH3VrsaMHeeqZFcZR8sHU?usp=sharing
- Video de demostracion: https://huggingface.co/SebastianBodza/Kartoffelbox-v0.1/resolve/main/demo_kartoffelbox.mp4
- Resultados de busqueda web: no se ha encontrado informacion tecnica adicional sobre el modelo; los enlaces devueltos corresponden a Instagram y no guardan relacion con el modelo.
