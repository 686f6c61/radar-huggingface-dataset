# hoolatech/Qwen3-TTS-12Hz-1.7B-VoiceDesign

## Resumen

Qwen3-TTS-12Hz-1.7B-VoiceDesign es un modelo de sintesis de voz (text-to-speech) de la familia Qwen3-TTS, desarrollada por el equipo Qwen (Alibaba). La variante "VoiceDesign" esta orientada a la generacion de voces controladas mediante instrucciones en lenguaje natural: el usuario describe timbre, emocion y prosodia en texto y el modelo sintetiza el audio correspondiente, ademas de soportar clonacion de voz. Este repositorio concreto es una resubida del modelo original publicada por el usuario `hoolatech`, con licencia Apache 2.0 y formato safetensors.

El modelo tiene 1.916.676.352 parametros (aproximadamente 1,7B), lo que lo situa en el rango de modelos TTS ligeros desplegables en una sola GPU. Se apoya en un tokenizador acustico propio, Qwen3-TTS-Tokenizer-12Hz, que opera a 12 Hz y combina compresion acustica eficiente con modelado semantico de alta dimension. La arquitectura es un LM discreto de multiples codebooks (multi-codebook) de extremo a extremo, lo que evita los cuellos de botella de los pipelines clasicos de TTS (texto -> fonemas -> mel -> vocoder).

Su relevancia actual radica en tres puntos: cobertura de 10 idiomas principales (incluido el espanol), generacion en streaming con latencia end-to-end declarada de hasta 97 ms, y control de la voz mediante lenguaje natural en lugar de etiquetas o embeddings predefinidos. Todo ello bajo licencia Apache 2.0, lo que permite uso comercial sin las restricciones tipicas de otros sistemas TTS abiertos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LM discreto de multiples codebooks (multi-codebook) de extremo a extremo, con tokenizador acustico Qwen3-TTS-Tokenizer-12Hz |
| Parametros totales | 1.916.676.352 (aprox. 1,7B) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el ejemplo oficial usa bfloat16) |
| Idiomas soportados | 10 idiomas segun la model card: chino, ingles, japones, coreano, aleman, frances, ruso, portugues, espanol e italiano, mas perfiles dialectales. La metadata de HuggingFace no especifica idiomas |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |
| Libreria de inferencia | qwen-tts (paquete Python en PyPI) |
| Tamano del repositorio | 4,5 GB |
| Pipeline | text-to-speech |
| Latencia declarada | hasta 97 ms end-to-end en generacion en streaming (dato de la familia Qwen3-TTS, no especifico de esta variante) |

## Arquitectura y entrenamiento

Qwen3-TTS emplea una arquitectura universal de extremo a extremo basada en un modelo de lenguaje discreto con multiples codebooks. En lugar de generar representaciones mel y pasarlas por un vocoder independiente, el modelo predice directamente tokens acusticos discretos que posteriormente se reconstruyen como audio. Esta eleccion elimina los cuellos de botella de informacion tipicos de los pipelines en cascada (texto a fonema a mel a onda) y permite aprovechar el mismo paradigma de escalado que los LLM. El componente acustico se apoya en Qwen3-TTS-Tokenizer-12Hz, un tokenizador desarrollado por el propio equipo que trabaja a 12 Hz y que combina compresion acustica eficiente con modelado semantico de alta dimension.

La model card no detalla el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron fases de RLHF o DPO sobre este modelo concreto; esa informacion aparece en el informe tecnico arXiv:2601.15621, que no se ha podido consultar en la busqueda disponible. Las capacidades destacadas del sistema son la representacion de habla de alta fidelidad, la generacion en streaming de baja latencia y el control de la voz mediante instrucciones en lenguaje natural. El unico resultado de evaluacion publicado en la model card corresponde a la variante Base, no a la variante VoiceDesign aqui descrita.

## Capacidades

- Sintesis de voz de alta calidad con voz humana natural, en modo tanto por lotes como en streaming.
- Diseno de voz (voice design) guiado por instrucciones en lenguaje natural: control de timbre, emocion y prosodia mediante texto (por ejemplo, "dilo con un tono muy enfadado").
- Clonacion de voz (voice cloning) a partir de muestras de audio, segun las capacidades declaradas de la familia Qwen3-TTS.
- Generacion en streaming con latencia end-to-end declarada de hasta 97 ms.
- Soporte multilingue de 10 idiomas: chino, ingles, japones, coreano, aleman, frances, ruso, portugues, espanol e italiano.
- Perfiles de voz dialectales, segun la descripcion del sistema.
- Control flexible de prosodia y emocion sin necesidad de reentrenamiento.
- No dispone de capacidades de vision, audio de entrada mas alla de la clonacion, tool calling ni razonamiento multi-paso: es un modelo especializado exclusivamente en texto a voz.

## Casos de uso

- Audiolibros y narracion automatizada: el modelo permite asignar una voz distinta y un tono concreto a cada personaje mediante instrucciones en lenguaje natural, sin necesidad de grabar actores ni entrenar voces por separado.
- Asistentes de voz en tiempo real: la generacion en streaming con latencia declarada de hasta 97 ms permite integrar el modelo en pipelines conversacionales donde el tiempo de respuesta es critico, encadenado a un LLM y a un modulo ASR.
- Atencion al cliente automatizada: dado su soporte de 10 idiomas, incluido el espanol, una misma instancia puede atender a usuarios de distintos mercados, con control del tono (formal, empatico, neutro) mediante instrucciones.
- Accesibilidad: conversion de articulos, informes y documentacion a audio para personas con discapacidad visual o dificultades de lectura, con voces naturales y ajustables en velocidad y prosodia.
- Localizacion de contenido multimedia: doblaje de videos, cursos o pildoras formativas a los 10 idiomas soportados, manteniendo el perfil de voz original mediante clonacion.
- Videojuegos y experiencias interactivas: generacion dinamica de lineas de dialogo de NPCs en tiempo de ejecucion, con variacion emocional segun el estado de la partida y sin almacenar audio pregrabado.
- Sistemas de anuncios y notificaciones telefonicas: generacion bajo demanda de mensajes de voz personalizados (avisos de pedidos, recordatorios, alertas), aprovechando el bajo coste de inferencia de un modelo de 1,7B.
- Prototipado de interfaces de voz: equipos de producto pueden probar distintos perfiles de voz describiendolos en texto antes de contratar una locucion definitiva o fijar una voz corporativa.

## Benchmarks y rendimiento

La model card solo publica resultados de la variante Base sobre el conjunto de prueba Seed-TTS, en terminos de tasa de error de palabras (WER, menor es mejor) para generacion de voz zero-shot. No hay resultados publicados para la variante VoiceDesign en la informacion disponible.

| Modelo | test-zh (WER) | test-en (WER) |
|---|---|---|
| Qwen3-TTS-12Hz-1.7B-Base | 0,77 | 1,24 |
| Qwen3-TTS-12Hz-1.7B-VoiceDesign | no disponible | no disponible |

No se han publicado resultados de benchmarks (MMLU, HumanEval, GSM8K ni equivalentes de TTS como MOS, SIM o WER de esta variante) en la informacion disponible para el modelo VoiceDesign.

## Requisitos de hardware

- VRAM estimada para inferencia: en bfloat16, los pesos de 1,9B parametros ocupan aproximadamente 3,4 GB; sumando el tokenizador acustico, las activaciones y el decodificador de audio, es razonable reservar entre 4 y 6 GB de VRAM. El repositorio completo pesa 4,5 GB. No hay estimaciones oficiales publicadas.
- GPU recomendadas: cualquier GPU con soporte de bfloat16 y al menos 8 GB de VRAM. El ejemplo oficial se ejecuta con `device_map="cuda:0"`, `dtype=torch.bfloat16` y `attn_implementation="flash_attention_2"`.
- Cabe en GPU de consumo: si. Modelos como RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4080 y RTX 4090 pueden ejecutarlo en bfloat16. En GPUs de 8 GB conviene vigilar el uso de memoria durante el streaming.
- Opciones de despliegue: el camino documentado es el paquete Python `qwen-tts` (`pip install -U qwen-tts`) con PyTorch y FlashAttention 2. No se documenta soporte de vLLM, llama.cpp, Ollama, TGI ni formato GGUF para este modelo, por lo que esos formatos figuran como no disponibles.
- GPU de clase centro de datos: A100 y H100 son compatibles y utiles para servir muchas peticiones concurrentes, aunque el modelo es lo bastante pequeno como para no requerirlas.
- Latencia y throughput: la familia Qwen3-TTS declara una latencia end-to-end de hasta 97 ms en modo streaming. No se publica throughput (caracteres o segundos de audio por segundo) para esta variante.

## Comparativa con modelos similares

Dentro de la propia familia Qwen3-TTS existen variantes hermanas con el mismo tokenizador de 12 Hz y, segun la nomenclatura, el mismo tamano de 1,7B. La comparacion con otras familias de TTS abiertas no puede completarse con datos verificados a partir de la informacion proporcionada.

| Modelo | Parametros | Contexto | Idiomas | Licencia | Enfoque |
|---|---|---|---|---|---|
| Qwen3-TTS-12Hz-1.7B-VoiceDesign (este) | 1.916.676.352 | no disponible | 10 | apache-2.0 | Diseno y control de voz por lenguaje natural |
| Qwen3-TTS-12Hz-1.7B-Base | no disponible en la informacion (la nomenclatura sugiere 1,7B) | no disponible | 10 | apache-2.0 | Modelo base de sintesis zero-shot (WER 0,77 zh / 1,24 en) |
| Qwen3-TTS-12Hz-1.7B-CustomVoice | no disponible en la informacion (la nomenclatura sugiere 1,7B) | no disponible | 10 | apache-2.0 | Voces personalizadas con hablantes predefinidos |
| Otras familias TTS abiertas (XTTS, CosyVoice, F5-TTS, Fish Speech, etc.) | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- La model card publicada es la generica de la familia Qwen3-TTS; no detalla el entrenamiento ni las metricas especificas de la variante VoiceDesign, por lo que buena parte de sus numeros concretos no estan disponibles.
- Riesgo de alucinacion acustica: como todo modelo generativo de audio, puede producir pronunciaciones incorrectas, repeticiones, cortes o artefactos, especialmente en textos largos, nombres propios, siglas y palabras poco frecuentes.
- La longitud de contexto no esta publicada, por lo que se desconoce el limite practico de texto de entrada por peticion; para textos largos conviene trocear y verificar la coherencia entre fragmentos.
- Riesgo de uso indebido de la clonacion de voz: la capacidad de imitar voces puede emplearse para suplantacion o fraude. Es responsabilidad del integrador aplicar consentimiento explicito, marcas de agua o deteccion de audio sintetico, y cumplir la normativa aplicable (por ejemplo, el AI Act europeo en materia de transparencia).
- Sesgos potenciales: la calidad y el acento de cada idioma dependen de la representacion en el corpus de entrenamiento, no documentada. El espanol figura entre los idiomas soportados, pero no se publican metricas por idioma.
- Licencia: Apache 2.0 permite uso comercial, modificacion y redistribucion, siempre que se conserve el aviso de licencia y se atribuya correctamente. No se ha verificado si el resubidor (`hoolatech`) anade condiciones adicionales; conviene revisar el repositorio antes de un despliegue comercial.
- Estado del repositorio: 0 descargas y 0 likes en el momento de la consulta, creado y actualizado el 11 de septiembre de 2026. Al ser una resubida de terceros, la trazabilidad respecto al modelo original de Qwen no esta garantizada; para produccion es preferible partir del repositorio oficial.
- No hay soporte documentado de cuantizacion (GGUF, AWQ, GPTQ) ni de servidores de inferencia de alto rendimiento, lo que limita las opciones de despliegue en entornos con recursos muy ajustados.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/hoolatech/Qwen3-TTS-12Hz-1.7B-VoiceDesign
- Coleccion oficial Qwen3-TTS en HuggingFace: https://huggingface.co/collections/Qwen/qwen3-tts
- Coleccion en ModelScope: https://modelscope.cn/collections/Qwen/Qwen3-TTS
- Blog oficial: https://qwen.ai/blog?id=qwen3tts-0115
- Paper (arXiv:2601.15621): https://huggingface.co/papers/2601.15621
- Repositorio GitHub: https://github.com/QwenLM/Qwen3-TTS
- Paquete Python `qwen-tts` en PyPI: https://pypi.org/project/qwen-tts/
- Resultados de busqueda web: no se han encontrado enlaces relevantes al modelo; las busquedas devolvieron unicamente paginas no relacionadas del portal del INPS italiano.
