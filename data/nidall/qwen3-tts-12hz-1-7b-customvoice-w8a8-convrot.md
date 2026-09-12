# NidAll/Qwen3-TTS-12Hz-1.7B-CustomVoice-W8A8-ConvRot

## Resumen

NidAll/Qwen3-TTS-12Hz-1.7B-CustomVoice-W8A8-ConvRot es un derivado cuantizado no oficial del modelo de sintesis de voz Qwen/Qwen3-TTS-12Hz-1.7B-CustomVoice, publicado por el usuario NidAll. Se trata de un checkpoint de conversion de pesos a formato W8A8 con rotacion de canales (ConvRot), pensado para ejecutarse en el runtime ComfyUI-Qwen3-TTS-Quant, tambien desarrollado por el mismo autor. El modelo conserva el decodificador de voz en FP16 mientras que los pesos empaquetados permanecen cuantizados durante la inferencia.

El modelo cuenta con 1.917.339.400 parametros reales (aproximadamente 1,92 mil millones) segun los tensores safetensors, y el repositorio ocupa 3,0 GB, lo que supone una reduccion sustancial frente a un checkpoint en precision completa. La licencia declarada es Apache-2.0, heredada del modelo upstream, y la tarea declarada en el Hub es text-to-speech.

Su relevancia es acotada pero concreta: permite ejecutar un modelo TTS de ~1,9B parametros con pesos de 8 bits en hardware de consumo dentro de ComfyUI, un entorno muy extendido para pipelines generativos. No es un lanzamiento oficial de Qwen, no tiene descargas ni valoraciones registradas en el momento de la consulta y su uso esta ligado a un runtime especifico, lo que condiciona su adopcion fuera de ese ecosistema.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible en detalle; derivado de Qwen3-TTS (text-to-speech) con cuantizacion W8A8 ConvRot y decodificador de voz en FP16 |
| Parametros totales | 1.917.339.400 (aprox. 1,92 B) |
| Parametros activos | No aplica (no se indica que sea un modelo MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | W8A8 (8 bits en pesos y activaciones) con ConvRot; decodificador de habla en FP16 |
| Idiomas soportados | No disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (archivo unificado `model.safetensors`) |

Datos adicionales: tamano del repositorio 3,0 GB; pipeline declarado `text-to-speech`; tags `qwen3_tts`, `text-to-speech`, `audio`, `quantized`, `comfyui`, `8-bit`; fecha de creacion 2026-09-12; descargas 0; likes 0.

## Arquitectura y entrenamiento

No se dispone de informacion publicada sobre la arquitectura interna del modelo base mas alla de su naturaleza de modelo de sintesis de voz (text-to-speech) perteneciente a la familia Qwen3-TTS y de su nomenclatura "12Hz", que hace referencia a la configuracion del modelo base y no se detalla en la informacion proporcionada. Tampoco hay datos sobre el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de ajuste por preferencias (RLHF o DPO).

La innovacion tecnica concreta de este checkpoint es la cuantizacion: los pesos se convierten a 8 bits (W8A8) con una transformacion de rotacion de canales (ConvRot) que busca reducir el error de cuantizacion, y se mantienen cuantizados durante la inferencia, sin descomprimir a precision completa. El decodificador de voz se deja en FP16, presumiblemente porque es la parte mas sensible a la perdida de calidad perceptual. El repositorio incluye `model.safetensors`, `config.json`, `generation_config.json`, los archivos de tokenizer y processor, un directorio `speech_tokenizer/` y un `quantization_manifest.json` con los metadatos del proceso de cuantizacion. No se indica que el autor haya realizado ningun entrenamiento o fine-tuning adicional: se declara explicitamente como un derivado cuantizado no oficial.

## Capacidades

- Sintesis de voz (text-to-speech) a partir de texto, con el pipeline declarado `text-to-speech` en HuggingFace.
- Voces personalizadas: el modelo base se denomina "CustomVoice", lo que apunta a soporte de voces definidas por el usuario, si bien la informacion disponible no detalla el mecanismo ni los requisitos de audio de referencia.
- Integracion con ComfyUI mediante el runtime ComfyUI-Qwen3-TTS-Quant, que es el entorno previsto por el autor.
- Inferencia con pesos de 8 bits mantenidos en ese formato, con el decodificador de voz en FP16.
- Idiomas soportados: no disponible.
- Soporte de tool calling, function calling, agentes, razonamiento multi-paso, vision o audio de entrada: no disponible (no son capacidades propias de un modelo TTS y no se declaran en la informacion).
- Modo de pensamiento (thinking mode): no disponible.

## Casos de uso

- Generacion de locuciones para videos en ComfyUI: el modelo se integra en el runtime ComfyUI-Qwen3-TTS-Quant, de modo que puede encadenarse en un grafo junto con otros nodos de generacion de imagen o video para producir la banda sonora narrada sin salir del entorno.
- Doblaje y localizacion de contenido: si se confirma el soporte multilingue del modelo base, podria emplearse para regenerar pistas de voz en distintos idiomas manteniendo una voz consistente; conviene verificar antes la lista real de idiomas, que no esta disponible.
- Prototipado de asistentes de voz: permite generar muestras de audio de forma local y a bajo coste para evaluar tono, prosodia y naturalidad antes de comprometerse con un servicio TTS en la nube.
- Creacion de audiolibros y contenido narrado por lotes: con un modelo de ~1,9B en 8 bits es viable procesar volumenes grandes de texto en una sola GPU de consumo, priorizando el coste por hora de audio frente a la maxima fidelidad.
- Accesibilidad y lectura de documentos: conversion de articulos, informes o apuntes a audio para personas con dificultades de lectura, ejecutandose en local para no enviar contenido sensible a terceros.
- Preproduccion de voces para videojuegos o animacion: generacion rapida de lineas de dialogo placeholder con voces personalizadas antes de contratar actores de doblaje definitivos.
- Investigacion en cuantizacion de modelos de audio: este checkpoint, junto con su manifiesto de cuantizacion, sirve como caso de estudio para medir el impacto de W8A8 con ConvRot en la calidad perceptual de un decodificador de voz, comparando contra el modelo base en FP16.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye metricas objetivas (MOS, WER, similitud de hablante, latencia o RTF) ni comparaciones con el modelo base sin cuantizar. Cualquier afirmacion sobre la perdida de calidad derivada de la cuantizacion W8A8 requeriria una evaluacion propia.

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos cuantizados a 8 bits de un modelo de ~1,92B parametros ocupan del orden de 2 GB, a los que hay que sumar el decodificador de voz en FP16 y las activaciones y buffers del runtime; en la practica conviene reservar entre 4 GB y 6 GB de VRAM, cifra orientativa que no esta confirmada por el autor.
- GPU recomendadas: no disponibles en la informacion proporcionada. Por tamano, cualquier GPU con 6-8 GB o mas de VRAM deberia ser suficiente, incluidas RTX 3060, RTX 4060, RTX 4070 o superiores.
- Compatibilidad con GPU de consumo: si, el modelo esta disenado precisamente para ese escenario gracias a la cuantizacion a 8 bits y al tamano del repositorio (3,0 GB).
- Opciones de despliegue: el autor indica que el checkpoint esta destinado al runtime ComfyUI-Qwen3-TTS-Quant. No se declara soporte para vLLM, llama.cpp, Ollama, TGI ni otros servidores de inferencia.
- Latencia y throughput: no disponibles. No se publican mediciones de factor de tiempo real (RTF) ni de audio generado por segundo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Precision | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3-TTS-12Hz-1.7B-CustomVoice-W8A8-ConvRot (este) | 1,92 B | No disponible | W8A8 ConvRot, decoder FP16 | Apache-2.0 | HuggingFace, 0 descargas, runtime ComfyUI-Qwen3-TTS-Quant |
| Qwen/Qwen3-TTS-12Hz-1.7B-CustomVoice (modelo base) | 1,92 B (mismo modelo de origen) | No disponible | FP16 (sin cuantizar) | Apache-2.0 | HuggingFace, repositorio oficial de Qwen |
| Otras alternativas TTS (por ejemplo XTTS-v2, Kokoro, F5-TTS, CosyVoice) | No disponible | No disponible | No disponible | No disponible | No disponible |

La unica comparacion sustentada por la informacion disponible es contra el modelo base: mismo numero de parametros y misma licencia, con la diferencia de la cuantizacion W8A8 ConvRot y el menor tamano en disco (3,0 GB para este repositorio). No se aportan datos de rendimiento comparativo entre ambos. Para el resto de alternativas del segmento TTS no se dispone de informacion verificable en esta ficha.

## Limitaciones y advertencias

- Es un derivado no oficial: el propio autor indica que no es un lanzamiento de Qwen, por lo que el soporte y la trazabilidad recaen en un tercero.
- Repositorio sin validacion de la comunidad: 0 descargas y 0 likes en el momento de la consulta, lo que implica ausencia de verificacion independiente de la calidad del audio generado.
- Dependencia de un runtime concreto: el checkpoint esta pensado para ComfyUI-Qwen3-TTS-Quant, de modo que puede no cargar correctamente en pipelines estandar de transformers, vLLM o llama.cpp.
- Riesgo de degradacion por cuantizacion: la conversion a 8 bits puede afectar a la naturalidad, la prosodia o el timbre de la voz; no hay metricas publicadas que cuantifiquen ese impacto frente al modelo base en FP16.
- Idiomas soportados no declarados: no se puede garantizar el comportamiento en castellano ni en ningun otro idioma concreto sin una prueba directa.
- Longitud de contexto no disponible: se desconoce la cantidad maxima de texto que puede procesarse en una sola pasada, dato critico para narrar fragmentos largos.
- Alucinacion y artefactos de audio: en modelos TTS, el equivalente al riesgo de alucinacion son artefactos, saltos, repeticiones o pronunciaciones incorrectas; al no haber evaluaciones publicadas, no puede descartarse.
- Sesgos: no hay informacion sobre la composicion del dataset de entrenamiento del modelo base, por lo que no puede evaluarse el sesgo de hablante, acento o genero.
- Licencia: Apache-2.0 permite uso comercial, pero obliga a preservar las atribuciones y avisos de licencia del modelo upstream, tal como senala el autor.
- Fecha de publicacion del repositorio muy reciente (2026-09-12) y actualizacion practicamente inmediata (2026-09-12), lo que sugiere un artefacto en fase temprana y posiblemente inestable.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/NidAll/Qwen3-TTS-12Hz-1.7B-CustomVoice-W8A8-ConvRot
- Modelo base: https://huggingface.co/Qwen/Qwen3-TTS-12Hz-1.7B-CustomVoice
- Runtime previsto por el autor: https://github.com/NidAll/ComfyUI-Qwen3-TTS-Quant
- Paper, blog o demo adicionales: no disponibles en la informacion proporcionada.
