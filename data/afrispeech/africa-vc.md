# AfriSpeech/africa-vc

## Resumen

africa-vc es un modelo de conversion de voz (voice conversion) desarrollado por AfriSpeech, afinado a partir de Seed-VC sobre el conjunto de datos AfriSpeech/multivoice-synthetic-speech. Su proposito es convertir la identidad del hablante sin alterar el contenido linguistico: las palabras y el idioma provienen del audio de origen y solo se sustituye la voz. Esto lo distingue de un sistema text-to-speech, ya que no puede generar habla en un idioma que no este presente en la fuente.

El modelo cubre un nicho poco atendido: la mayoria de sistemas de conversion de voz se entrenan para un unico hablante o para un punado de idiomas de altos recursos. africa-vc se entrena sobre 17.010 clips que abarcan 566 idiomas africanos y 30 voces, con un total de 38,7 horas de audio. Al haberse entrenado con todas las voces y no con una sola, la voz de destino es una eleccion en tiempo de ejecucion: el clip de referencia la selecciona y las 30 quedan accesibles desde un unico checkpoint.

Es relevante para investigadores que trabajen en tecnologias del habla para idiomas africanos de bajos recursos, donde escasean tanto las voces sinteticas como los corpus paralelos de hablantes. La contrapartida principal es que el audio de entrenamiento es sintetico, generado con Google Gemini, lo que introduce un riesgo real de sobreajuste al timbre sintetico y una calidad muy desigual segun el idioma.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Derivada de Seed-VC; la configuracion de entrenamiento es `config_dit_mel_seed_uvit_whisper_small_wavenet.yml`, que apunta a un transformer de difusion (DiT) sobre mel-espectrogramas con U-ViT, extractor de contenido Whisper small y decodificador WaveNet (detalle completo no disponible) |
| Parametros totales | no disponible |
| Longitud de contexto | no aplica (modelo de audio; procesa fragmentos de audio, no secuencias de texto) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | 566 idiomas africanos en entrenamiento (la cabecera de la model card indica 567; la tabla de entrenamiento indica 566). No se publica la lista de idiomas ni metricas por idioma |
| Licencia | GPL-3.0 |
| Formato de pesos | PyTorch (`.pth`, por ejemplo `ft_model.pth`); no se distribuyen safetensors ni GGUF |
| Tarea | audio-to-audio (voice conversion) |
| Voces de destino | 30, seleccionables en tiempo de ejecucion mediante el clip de referencia |
| Tamano del repositorio | 0,4 GB |
| Datos de entrenamiento | AfriSpeech/multivoice-synthetic-speech: 17.010 clips, 38,7 horas, audio sintetico generado con Google Gemini |
| Pasos de entrenamiento | 20.000, con batch size 2 |
| Hardware de entrenamiento | Modal, A100-40GB |
| Commit base de Seed-VC | `51383efd9210` |
| Libreria | seed-vc |

## Arquitectura y entrenamiento

africa-vc no introduce una arquitectura nueva: es un afinado (fine-tuning) del checkpoint de Seed-VC identificado por el commit `51383efd9210`, entrenado con la configuracion `config_dit_mel_seed_uvit_whisper_small_wavenet.yml`. El nombre de esa configuracion describe los componentes de la pipeline de Seed-VC: un transformer de difusion (DiT) operando sobre representaciones mel, un backbone U-ViT, un codificador de contenido basado en Whisper small y un vocoder WaveNet. No se dispone de informacion detallada sobre el numero de parametros, la dimension de los embeddings ni los hiperparametros de difusion empleados en el afinado.

El entrenamiento se realizo sobre AfriSpeech/multivoice-synthetic-speech, un corpus de 17.010 clips y 38,7 horas que abarca 566 idiomas africanos y 30 voces. Se ejecutaron 20.000 pasos con batch size 2 sobre una A100-40GB en Modal. Todos los clips de entrenamiento son sinteticos, generados con Google Gemini, lo que constituye la decision de diseno mas determinante del modelo: el sistema aprende tanto los timbres de esas 30 voces como sus posibles errores de pronunciacion. La model card no documenta el uso de RLHF, DPO ni de ninguna otra etapa de alineacion, ni tampoco tecnicas de decodificacion especulativa o attention lineal.

La innovacion practica respecto al Seed-VC original es el entrenamiento multi-hablante: al cubrir las 30 voces en un unico checkpoint, se evita mantener un modelo por voz y se permite cambiar de voz en inferencia simplemente aportando otro clip de referencia.

## Capacidades

- Conversion de voz (voice conversion) de audio a audio: transforma la identidad del hablante manteniendo intactos el contenido linguistico y el idioma del audio de origen.
- Seleccion de voz en tiempo de ejecucion: las 30 voces del corpus son accesibles desde un unico checkpoint; el clip de referencia determina cual se aplica.
- Cobertura multilingue amplia en el espacio africano: 566 idiomas vistos durante el entrenamiento, con resultados de calidad muy variables entre ellos.
- Independencia del contenido: al no generar texto, no esta limitado por un vocabulario ni por la tokenizacion de un idioma concreto.
- Sin soporte de tool calling ni de function calling: es un modelo de audio, no un modelo de lenguaje.
- Sin soporte de agentes ni de razonamiento multi-paso.
- Sin capacidades de vision, texto ni audio-texto mas alla de la conversion de voz.

## Casos de uso

- Doblaje y localizacion de contenido para idiomas africanos de bajos recursos: con el audio original ya en el idioma objetivo, el modelo permite sustituir la voz del locutor por una de las 30 voces disponibles sin volver a grabar, algo util cuando no se encuentran actores de doblaje para esa lengua.
- Anonimizacion de voz en corpus sensibles: en entrevistas, grabaciones clinicas o testimonios donde el contenido debe conservarse pero la identidad del hablante no puede divulgarse, la conversion a una voz de referencia elimina la identidad manteniendo el idioma y las palabras.
- Aumento de datos para entrenar sistemas ASR: convirtiendo un mismo corpus a varias voces de referencia se incrementa la diversidad de hablantes de un conjunto de entrenamiento, lo que puede mejorar la robustez de un reconocedor de voz en idiomas con pocos locutores grabados.
- Normalizacion de hablante en pipelines de evaluacion: al fijar la voz de destino, se reduce la variabilidad de locutor entre muestras y se facilita comparar sistemas TTS o ASR sobre el mismo material, especialmente en idiomas donde cada frase proviene de un hablante distinto.
- Creacion de voces sinteticas reutilizables para TTS en idiomas africanos: las 30 voces del modelo pueden emplearse como referencias estables para sistemas de sintesis que necesiten un hablante consistente en lenguas sin voces comerciales disponibles.
- Produccion de audiolibros y podcasts multilingues: una misma voz de referencia puede aplicarse a material ya grabado en distintos idiomas africanos, manteniendo una identidad sonora coherente en toda la coleccion.
- Investigacion linguistica sobre prosodia y timbre: al permitir intercambiar el hablante conservando el contenido, facilita estudios controlados sobre que rasgos dependen del locutor y cuales del idioma.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas objetivas (por ejemplo MOS, similitud de hablante o tasa de error de reconocimiento) ni comparaciones cuantitativas con otros sistemas de conversion de voz. El unico dato operativo documentado es el coste de entrenamiento: 20.000 pasos con batch size 2 sobre una A100-40GB.

## Requisitos de hardware

- VRAM para inferencia: no disponible. No se publican requisitos de memoria ni tablas de consumo.
- El repositorio de pesos ocupa 0,4 GB, lo que acota el tamano del checkpoint, pero no se confirma el pico de VRAM necesario en ejecucion.
- GPU recomendadas: no disponibles. La unica referencia es la A100-40GB empleada en el entrenamiento, que no es necesariamente representativa de la inferencia.
- Cabe en GPU de consumo: no confirmado en la informacion proporcionada. El tamano reducido del checkpoint sugiere que es viable en GPUs de gama alta de consumo, pero se trata de una inferencia no verificada.
- Opciones de despliegue: la propia libreria del modelo. La instalacion se realiza con `pip install git+https://github.com/AfriSpeech/africa-vc` y la inferencia mediante `africa-vc convert --source speech.wav --voice <nombre> --checkpoint ft_model.pth`. Tambien existen, en el proyecto base, las herramientas de Seed-VC. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a un modelo de audio de este tipo.
- Latencia y throughput: no disponibles.
- Listado de voces disponibles: se consulta con el comando `africa-vc voices`; en la documentacion aparece al menos la voz `Sulafat`.

## Comparativa con modelos similares

| Modelo | Tipo | Datos de entrenamiento | Idiomas | Voces | Licencia | Formato |
|---|---|---|---|---|---|---|
| africa-vc | Voice conversion (Seed-VC afinado) | 17.010 clips, 38,7 h, sintetico (Gemini) | 566 idiomas africanos | 30, en tiempo de ejecucion | GPL-3.0 | PyTorch `.pth` |
| Seed-VC (base) | Voice conversion zero-shot | No disponible en la informacion proporcionada | No disponible | No disponible (zero-shot) | No disponible en la informacion proporcionada | PyTorch |
| Otros sistemas de conversion de voz para idiomas africanos | No disponible | No disponible | No disponible | No disponible | No disponible | No disponible |

No se dispone de datos de rendimiento comparativos entre africa-vc y otras alternativas, por lo que la comparacion se limita a las caracteristicas estructurales. La principal diferencia documentada frente al Seed-VC base es que africa-vc ha sido afinado sobre un corpus multilingue africano y ofrece 30 voces fijas seleccionables en inferencia.

## Limitaciones y advertencias

- Audio de entrenamiento sintetico: todo el corpus se genero con Google Gemini. El modelo aprende ese timbre sintetico y tambien sus errores de pronunciacion, de modo que puede reproducir defectos que no existen en habla humana real.
- Riesgo de sobreajuste al timbre sintetico: al provenir las 30 voces de una unica familia TTS, la generalizacion a clips de referencia grabados por personas reales puede degradarse. La propia model card recomienda verificar con voz humana antes de confiar en el modelo.
- Calidad muy desigual por idioma: las voces se disenaron para lenguas ampliamente habladas y se les pidio leer cientos de otras, por lo que el rendimiento en idiomas minoritarios puede ser notablemente peor.
- No cambia el idioma: no puede sintetizar una lengua que no este ya presente en el audio de origen. Es un error de uso frecuente y la model card lo advierte de forma explicita.
- Sin benchmarks publicados: no hay metricas objetivas de similitud de hablante, naturalidad ni inteligibilidad, ni por idioma ni agregadas.
- Sin informacion sobre sesgos: no se documentan las caracteristicas demograficas de las voces, su distribucion por genero, edad o region, ni posibles sesgos derivados de la sintesis.
- Licencia GPL-3.0: es una licencia copyleft, de modo que la distribucion de obras derivadas o su integracion en productos propietarios obliga a liberar el codigo bajo los mismos terminos. Conviene revisar la compatibilidad antes de cualquier uso comercial.
- Riesgo de suplantacion de identidad: la conversion de voz permite imitar voces, por lo que su uso exige consentimiento explicito de las personas afectadas y cumplimiento de la normativa aplicable sobre deepfakes.
- Idiomas: la model card ofrece dos cifras distintas (566 y 567) y no publica la lista completa de lenguas cubiertas, lo que dificulta saber de antemano si un idioma concreto esta soportado con calidad suficiente.
- Empaquetado limitado: solo se distribuyen pesos en formato PyTorch (`.pth`). No hay versiones cuantizadas, GGUF ni safetensors, lo que restringe las opciones de despliegue en entornos con poca memoria.
- Repositorio sin traccion: 0 descargas y 0 likes en el momento de la consulta, sin senales de validacion por parte de la comunidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/AfriSpeech/africa-vc
- Dataset de entrenamiento: https://huggingface.co/datasets/AfriSpeech/multivoice-synthetic-speech
- Proyecto y libreria africa-vc: https://github.com/AfriSpeech/africa-vc
- Seed-VC (proyecto base): https://github.com/Plachtaa/seed-vc
- Resultados de busqueda web: no se han encontrado enlaces relevantes. Los resultados devueltos corresponden al sitio oficial de la liga de rugby NRL (calendario, clasificacion y noticias) y no guardan ninguna relacion con el modelo AfriSpeech/africa-vc.
