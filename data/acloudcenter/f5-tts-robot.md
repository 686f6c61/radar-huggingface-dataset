# ACloudCenter/F5-TTS-robot

## Resumen

F5-TTS-robot es un ajuste fino completo (full finetune, sin adaptadores PEFT) del modelo de sintesis de voz F5TTS_v1_Base, publicado por el usuario ACloudCenter. El objetivo del modelo es generar habla sintetica con timbres de robot y androide: vocoder buzz omnibot, androide con ring-mod tipo Terminator, metalico de ciencia ficcion, voz gruff, megafonia de intercomunicador y banda estrecha de telefono. El checkpoint se distribuye como modelo fusionado (model_last.pt mas vocab.txt), listo para cargarse con la API de F5-TTS.

El entrenamiento se realizo sobre el propio corpus del autor, ACloudCenter/robot-tts-corpus, compuesto por aproximadamente 1,7 horas de habla robotica sintetica en 6 estilos, construida a partir de 5 locutores de LibriSpeech test-clean. Se llevaron a cabo 12 epocas (unos 3900 updates) con learning rate 1e-5 y lotes de 1618 frames, usando el vocabulario pinyin de Emilia. El repo pesa 5,4 GB.

La relevancia practica es acotada pero clara: no es un modelo de proposito general, sino un generador de voces de robot para produccion de audio (videojuegos, doblaje, prototipos de interfaz de robot). La identidad de estilo no se selecciona con un parametro, sino que se hereda por completo del clip de audio de referencia que se le pasa al modelo, de modo que el ajuste convierte a F5-TTS en un clonador zero-shot de voces roboticas concretas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible en la informacion proporcionada; hereda la de F5TTS_v1_Base (modelo TTS no autoregresivo basado en flow matching con transformer de difusion) |
| Parametros totales | no disponible (el autor no publica el recuento; repo de 5,4 GB con checkpoint fusionado) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica en el sentido de LLM; el entrenamiento uso lotes de 1618 frames y la duracion de salida la determina el texto de entrada y el audio de referencia |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible de forma explicita; el corpus de ajuste es en ingles (locutores de LibriSpeech test-clean) y el vocabulario es el pinyin de Emilia |
| Licencia | apache-2.0 (declarada por el autor en la model card) |
| Formato de pesos | PyTorch (.pt): model_last.pt + vocab.txt, checkpoint fusionado completo |

## Arquitectura y entrenamiento

El autor no describe la arquitectura interna en la model card; lo unico declarado es que se trata de un full finetune de F5TTS_v1_Base con el vocabulario de Emilia en pinyin. F5-TTS es un sistema de sintesis de voz no autoregresivo basado en flow matching, que genera mel-espectrogramas a partir de texto y un audio de referencia con su transcripcion, sin predictor de duracion ni alineador fonetico explicito, y que emplea tecnicas de infilling durante el entrenamiento. En este ajuste no se anaden modulos nuevos ni adaptadores: el resultado es un unico checkpoint fusionado que se carga directamente con `F5TTS(ckpt_file="model_last.pt", vocab_file="vocab.txt")`.

Los datos de entrenamiento son ACloudCenter/robot-tts-corpus: aproximadamente 1,7 horas de habla robotica sintetica repartida en 6 estilos (omnibot vocoder-buzz, terminator ring-mod android, scifi metallic, gruff, intercom PA y telephone narrowband), generada a partir de 5 locutores de LibriSpeech test-clean. La configuracion reportada es de 12 epocas (unos 3900 updates), learning rate 1e-5 y lotes de 1618 frames. No se documenta el uso de RLHF, DPO ni de ninguna fase de alineacion por preferencias humanas, algo esperable en un modelo TTS. El aspecto tecnico mas relevante del diseno es que la identidad de estilo es puramente condicional al audio de referencia: el modelo no tiene etiquetas de estilo ni prompt de texto para elegirlo.

## Capacidades

- Sintesis de voz (text-to-speech) en ingles a partir de texto, con vocabulario pinyin de Emilia heredado de la base.
- Clonacion de voz zero-shot guiada por audio: el estilo roboticо se determina exclusivamente con el clip de referencia (`ref_file`) y su transcripcion (`ref_text`).
- Reproduccion de 6 estilos de voz artificial: omnibot vocoder-buzz, terminator ring-mod android, scifi metallic, gruff, intercom PA y telephone narrowband.
- Generacion de voz con caracteristicas de canal especificas (por ejemplo, banda estrecha telefonica) cuando se usa la referencia correspondiente.
- Inferencia en un unico paso de API, sin necesidad de PEFT ni de fusion de adaptadores.
- No dispone de tool calling, function calling, capacidades de agente ni razonamiento multi-paso: no es un modelo de lenguaje.
- No dispone de vision, audio de entrada como tarea de comprension (ASR), ni modo de pensamiento.
- Capacidades multilingues: no documentadas para este ajuste; el entrenamiento se realizo sobre habla en ingles.

## Casos de uso

- Voces de personajes en videojuegos: el modelo permite generar lineas de dialogo para robots, androides o IA hostiles usando como referencia un clip del estilo deseado (por ejemplo, ring-mod androide), sin necesidad de contratar a un actor para cada variante de personaje.
- Doblaje y post-produccion para ciencia ficcion: se pueden regenerar lineas de dialogo manteniendo el mismo estilo roboticо entre tomas, porque la identidad viene fijada por el clip de referencia del proyecto.
- Prototipado de interfaces de voz para robotica y domotica: las voces omnibot o intercom PA permiten validar rapidamente como sonara un asistente embebido antes de invertir en grabacion de estudio.
- Audiolibros y ficcion sonora: el estilo gruff o scifi metallic sirve para narrar personajes mecanicos dentro de una produccion mas amplia, generando fragmentos largos a partir de texto.
- Aumento de datos para entrenar sistemas ASR robustos: al disponer de un estilo telephone narrowband, se pueden sintetizar muestras con degradacion de canal telefonico para probar la resistencia de un reconocedor de voz.
- Sistemas de megafonia y avisos automatizados: la voz intercom PA permite generar anuncios de seguridad, avisos de planta o mensajes de emergencia de forma reproducible y consistente.
- Contenido para mods y proyectos comunitarios: al ser un checkpoint fusionado con licencia apache-2.0 declarada, resulta sencillo integrarlo en herramientas de modding o en generadores de voz para contenido amateur.
- Pruebas de experiencia de usuario en asistentes conversacionales: se puede alimentar un pipeline de dialogo con esta voz para evaluar la percepcion de robóticidad antes de decidir la voz final.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card unicamente aporta hiperparametros de entrenamiento (12 epocas, ~3900 updates, learning rate 1e-5, lotes de 1618 frames) y no incluye metricas objetivas como MOS, WER del texto sintetizado, similitud de locutor (SECS) ni tasas de error en pruebas ciegas. Tampoco se aportan comparaciones con F5TTS_v1_Base original.

## Requisitos de hardware

- VRAM estimada: no publicada por el autor. Como estimacion orientativa, un checkpoint TTS de este tipo en precision mixta suele requerir del orden de 4-6 GB de VRAM durante la inferencia, incluyendo el vocoder y el procesado del audio de referencia. Estas cifras no estan confirmadas en la informacion disponible.
- GPU recomendadas: no indicadas. Por el perfil del modelo, GPUs de gama alta para servidor (A100, H100, L40S) sobredimensionan la tarea; tarjetas de consumo como RTX 4090, RTX 4080, RTX 3090 o RTX 3060 de 12 GB deberian ser suficientes si se confirma la estimacion anterior.
- Cabe en GPU de consumo: probablemente si, en modelos con 8 GB o mas de VRAM en precision reducida; no verificado con datos del autor.
- Opciones de despliegue: la via documentada por el autor es la API Python de F5-TTS (`from f5_tts.api import F5TTS`) con el checkpoint `model_last.pt` y `vocab.txt`. No se mencionan integraciones con vLLM, llama.cpp, Ollama ni TGI, que ademas no aplican directamente a un modelo de sintesis de voz.
- Latencia y throughput: no disponibles. El autor no publica tiempos de inferencia ni real-time factor. El coste depende del numero de pasos de muestreo configurados en la inferencia, dato que tampoco se especifica.

## Comparativa con modelos similares

| Modelo | Tipo | Ajuste especifico | Idiomas | Licencia declarada | Disponibilidad |
|---|---|---|---|---|---|
| F5-TTS-robot (este modelo) | TTS con flow matching, derivado de F5TTS_v1_Base | Voces roboticas en 6 estilos, clonacion guiada por referencia | Ingles en el corpus de ajuste | apache-2.0 (autor) | HuggingFace, checkpoint .pt |
| F5TTS_v1_Base | TTS con flow matching, zero-shot | Proposito general, sin especializacion de estilo | No disponible en la informacion proporcionada | No disponible en la informacion proporcionada (conviene verificar la del checkpoint base) | HuggingFace / GitHub del proyecto F5-TTS |
| Alternativas TTS zero-shot de la misma categoria (XTTS-v2, CosyVoice, StyleTTS2) | TTS con clonacion por referencia | Proposito general | Multilingue en varios casos | Variables segun proyecto | Publicas, pero no se dispone de datos de comparacion en la informacion proporcionada |

No se dispone de parametros, contexto ni resultados de benchmarks de los modelos alternativos dentro de la informacion proporcionada, por lo que la comparacion cuantitativa no es posible. La diferencia funcional del modelo aqui descrito no es de tamano ni de calidad medida, sino de especializacion: cubre un nicho de estilos roboticos que los modelos genericos no producen de forma fiable sin referencias adecuadas.

## Limitaciones y advertencias

- El corpus de ajuste es muy pequeno: aproximadamente 1,7 horas de audio, sinteticas y generadas a partir de solo 5 locutores de LibriSpeech test-clean. Esto limita la diversidad de timbres y aumenta el riesgo de sobreajuste a esos locutores y a esas condiciones acusticas.
- El estilo no se controla con etiquetas ni parametros: depende por completo del clip de referencia. Un clip de referencia inadecuado produce un estilo distinto al esperado, y no hay forma declarada de forzar un estilo concreto salvo elegir la referencia correcta.
- No hay datos publicados de calidad objetiva (MOS, WER, similitud de locutor), por lo que no se puede estimar la inteligibilidad real de las voces generadas, especialmente en estilos muy degradados como vocoder-buzz o telephone narrowband.
- Riesgo de alucinacion acustica: como todo modelo TTS generativo, puede producir artefactos, pronunciaciones incorrectas o inestabilidades en textos largos o con palabras poco frecuentes. No hay evaluacion publicada al respecto.
- Idioma: el ajuste esta hecho sobre habla en ingles. Aunque el vocabulario pinyin de Emilia este presente, no hay evidencia en la informacion disponible de que el modelo mantenga un rendimiento aceptable en castellano ni en chino tras el finetune.
- Licencia: el autor declara apache-2.0, pero el modelo deriva de F5TTS_v1_Base, cuyos checkpoints oficiales se distribuyen habitualmente bajo condiciones mas restrictivas por el uso del dataset Emilia. Antes de un uso comercial conviene verificar la licencia efectiva del checkpoint base y del corpus robot-tts-corpus, porque la declaracion del autor puede no cubrir los derechos de la base.
- Clonacion de voz: la combinacion de audio de referencia mas su transcripcion permite imitar voces. Aunque las voces de origen sean de LibriSpeech (dominio publico para investigacion), el uso del modelo con referencias de personas reales exige consentimiento y cumple con la normativa aplicable.
- Uso en produccion: sin metricas de latencia, throughput ni VRAM publicadas, el dimensionamiento de un servicio en produccion requiere medicion propia. La ausencia de benchmarks impide comparar con alternativas de forma rigurosa.
- Repositorio sin traccion: 0 descargas y 0 likes en el momento de la consulta, y pipeline no declarado, lo que reduce la probabilidad de que existan pruebas de terceros o mantenimiento continuado.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ACloudCenter/F5-TTS-robot
- Dataset de entrenamiento citado por el autor: https://huggingface.co/datasets/ACloudCenter/robot-tts-corpus
- Repositorio del proyecto base F5-TTS: https://github.com/SWivid/F5-TTS
- Busqueda web: no se encontraron enlaces relevantes. Los resultados devueltos corresponden a paginas de Marks & Spencer sobre alimentacion y no guardan ninguna relacion con el modelo, su dataset o la tecnologia F5-TTS.
