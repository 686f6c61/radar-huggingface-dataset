# gradium/phonon-31m-en-compute-flow

## Resumen

phonon-31m-en-compute-flow es un paquete de despliegue del modelo de sintesis de voz (text-to-speech) phonon-31m-en de Gradium, adaptado especificamente para Arm Compute Flow. No se trata de un modelo nuevo: es el mismo modelo base, con los mismos pesos convertidos, empaquetado en los formatos que consume el runtime de Compute Flow (ONNX, GGUF, LiteRT y SentencePiece). Su interes radica en que permite ejecutar TTS de baja latencia sobre hardware Arm usando el brick estandar `tts:pocket-tts` sin modificar codigo, ya que Phonon comparte arquitectura con Pocket TTS de Kyutai.

El modelo es un sistema TTS generativo basado en flow matching, con un transformer de aproximadamente 18,9 millones de parametros y un decodificador Mimi en formato LiteRT a precision completa. El repositorio ocupa unos 0,1 GB y esta pensado para inferencia en dispositivo (edge), no para servidores de gran escala. La licencia Apache 2.0 facilita su integracion comercial, aunque el modelo solo soporta ingles.

Su relevancia actual esta en la tendencia a empaquetar modelos pequenos de voz para despliegue en movil y sistemas embebidos. Frente al runtime nativo de Phonon (CLI, Python, navegador, iOS, Android), esta variante prioriza la portabilidad a traves de Compute Flow, a costa de algunas diferencias numericas y funcionales que el autor documenta explicitamente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de flow matching (generacion de latentes) con decodificador Mimi; compatible con Pocket TTS |
| Parametros totales | 18.916.352 (segun safetensors del modelo base) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (limite practico: 500 frames, 40 segundos de audio por peticion) |
| Tipos de cuantizacion | Q8_0 (8 bits) en el transformer de flow matching; decodificador Mimi en f32 |
| Idiomas soportados | en (ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (flowlm.q8_0.gguf), ONNX (text_encoder, simple_mlpada_ln, latent_proj), LiteRT/TFLite (mimi_decoder.tflite), SentencePiece (tokenizer.model), NumPy (assets) |

## Arquitectura y entrenamiento

El modelo sigue el diseno de Pocket TTS: un transformer de flow matching que genera latentes de audio frame a frame, condicionado por embeddings de texto, y un decodificador neuronal Mimi (codec de Kyutai) que convierte esos latentes en forma de onda. El texto se procesa con un tokenizador SentencePiece y una tabla de embeddings exportada a ONNX. La generacion es autorregresiva a nivel de frame, con una proyeccion (`latent_proj.onnx`) que realimenta el latente generado como entrada del siguiente frame, y cabezas separadas (`simple_mlpada_ln.onnx`) para el flow head y la deteccion de fin de habla.

No se dispone de informacion sobre el volumen de datos de entrenamiento, la composicion del corpus ni si se aplicaron tecnicas de RLHF o DPO. El autor indica que este paquete se convirtio desde los pesos originales y se verifico componente a componente contra el runtime de Phonon sobre las mismas entradas. Las diferencias documentadas son cuatro: llama.cpp usa la aproximacion tanh de GELU en lugar de la exacta; los condicionadores de hablante y duracion se pliegan en un sesgo constante con sus valores por defecto (no modificables); el brick conserva dos frames mas tras el fin de habla y usa su propio generador de ruido, por lo que el audio no es identico muestra a muestra; y el prompt de voz se reinyecta en cada peticion, lo que retrasa el primer audio respecto al runtime nativo.

## Capacidades

- Sintesis de voz en ingles a partir de texto, con salida de audio streaming.
- Generacion de hasta 40 segundos de audio por peticion (500 frames en el manifiesto).
- Deteccion automatica de fin de habla mediante una cabeza dedicada y un umbral de +4,0.
- Voz por defecto incluida en el paquete (`assets/default.npy`); no incluye otras voces.
- Muestreo con temperatura 0,3 (parametro `rng_std` en el manifiesto es su raiz cuadrada).
- Integracion directa con Arm Compute Flow mediante el brick `tts:pocket-tts` y el identificador `phonon-31m-en-q8-0`.
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso: es un modelo puramente TTS.
- No soporta vision, audio de entrada ni otras modalidades.
- Capacidad multilingue limitada al ingles; el texto debe escribirse con numeros, simbolos y abreviaturas desarrollados en palabras, ya que el brick no normaliza.

## Casos de uso

- Sintesis de voz en dispositivos Arm: el paquete esta disenado para ejecutarse en hardware Arm mediante Compute Flow, lo que permite integrar TTS en sistemas embebidos, wearables o equipos de sobremesa sin depender de la nube.
- Asistentes de voz locales: con un modelo de 18,9 millones de parametros y un repositorio de 0,1 GB, cabe en dispositivos con recursos limitados y permite respuestas habladas sin enviar texto a un servidor externo.
- Lectura de notificaciones y accesibilidad: la ventana de 40 segundos por peticion cubre avisos, mensajes cortos y fragmentos de interfaz; el flujo streaming del decodificador Mimi reduce la latencia percibida.
- Prototipado rapido de productos de voz: el comando `compute-flow model install tts:pocket-tts phonon-31m-en-q8-0` descarga y verifica el modelo contra `SHA256SUMS`, lo que simplifica la puesta en marcha en equipos de desarrollo.
- Generacion de audio para pruebas automatizadas: al ser determinista en estructura (con las salvedades de ruido documentadas), sirve para validar pipelines de audio en CI sin depender de servicios externos.
- Sistemas de interaccion por voz en ingles en entornos con conectividad limitada: al ejecutarse en local, mantiene la funcionalidad sin acceso a internet y con la licencia Apache 2.0 para uso comercial.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explicita. Con 18,9 millones de parametros en Q8_0 para el transformer y el decodificador Mimi en f32, el modelo es muy ligero; el repositorio completo ocupa 0,1 GB.
- GPU recomendadas: no disponible. El destino principal es hardware Arm con Compute Flow, no GPU de servidor.
- Compatibilidad con GPU de consumo: no confirmada en la informacion disponible; el modelo esta empaquetado para LiteRT, ONNX Runtime y llama.cpp, lo que en principio permite ejecucion en CPU y en aceleradores compatibles.
- Opciones de despliegue: Arm Compute Flow (brick `tts:pocket-tts`), con componentes ejecutados por ONNX Runtime, llama.cpp y LiteRT. Para el runtime nativo de Phonon (CLI, Python, navegador, iOS, Android) existe el paquete `gradium/phonon-31m-en`; para llama.cpp y audio.cpp, `gradium/phonon-31m-en-llamacpp` y `gradium/phonon-31m-en-audiocpp`.
- Latencia y throughput: no disponibles. El autor senala que el primer audio llega mas tarde que en el runtime de Phonon porque el prompt de voz se reinyecta en cada peticion, y que el brick conserva dos frames adicionales tras el fin de habla.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / limite | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| gradium/phonon-31m-en-compute-flow | 18,9 M | 40 s de audio por peticion | en | Apache 2.0 | GGUF, ONNX, LiteRT, SentencePiece |
| gradium/phonon-31m-en | 18,9 M (mismo modelo) | 40 s de audio por peticion | en | Apache 2.0 | pesos del runtime Phonon |
| gradium/phonon-31m-en-llamacpp | 18,9 M (mismo modelo) | no disponible | en | Apache 2.0 | GGUF para llama.cpp |
| gradium/phonon-31m-en-audiocpp | 18,9 M (mismo modelo) | no disponible | en | Apache 2.0 | formato de audio.cpp |

No se dispone de datos de benchmarks ni de comparaciones con modelos TTS de otros desarrolladores en la informacion proporcionada.

## Limitaciones y advertencias

- Solo soporta ingles; no hay capacidades multilingues.
- Una unica voz (la voz por defecto del modelo); no se pueden seleccionar otras voces ni modificar los condicionadores de hablante o duracion, que estan fijados como sesgo constante.
- El texto no se normaliza: numeros, simbolos y abreviaturas deben escribirse en palabras.
- Limite de 500 frames (40 segundos) por peticion.
- Diferencias numericas respecto al runtime de Phonon: aproximacion tanh de GELU en llama.cpp, dos frames extra tras el fin de habla y generador de ruido propio, por lo que el audio no es identico muestra a muestra.
- Mayor latencia inicial que el runtime nativo al reinyectar el prompt de voz en cada peticion.
- Riesgo de alucinacion y sesgos: no documentados en la informacion disponible; al ser un modelo TTS, el riesgo se manifiesta en pronunciacion incorrecta o prosodia anomalia, no en contenido factual.
- Licencia Apache 2.0 permite uso comercial, pero el modelo se apoya en Pocket TTS y el codec Mimi de Kyutai; conviene revisar las condiciones de esos componentes.
- El paquete depende de la version del registro de bricks de Compute Flow; si `compute-flow model install` no encuentra el modelo, hay que borrar `cache.json` y ejecutar `compute-flow update`.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/gradium/phonon-31m-en-compute-flow
- Modelo base: https://huggingface.co/gradium/phonon-31m-en
- Variante para llama.cpp: https://huggingface.co/gradium/phonon-31m-en-llamacpp
- Variante para audio.cpp: https://huggingface.co/gradium/phonon-31m-en-audiocpp
- Coleccion de modelos Phonon: https://huggingface.co/collections/gradium/phonon
- Runtime en GitHub: https://github.com/gradium-ai/xn-ptts
- Arm Compute Flow: https://github.com/ARM-software/compute-flow
- Bricks de Compute Flow: https://github.com/ARM-software/compute-flow-bricks
- Pocket TTS (Kyutai): https://github.com/kyutai-labs/pocket-tts
- Sitio de Gradium: https://gradium.ai/
- Blog de Gradium: https://gradium.ai/blog/gradium
- Articulo de Le Monde sobre Gradium: https://www.lemonde.fr/economie/article/2025/12/02/gradium-nouvelle-start-up-francaise-specialiste-d-ia-vocale_6655699_3234.html
- Articulo de L'Usine Digitale sobre la financiacion de Gradium: https://www.usine-digitale.fr/start-up/financement/investissement/100-millions-de-dollars-de-financement-gradium-la-pepite-francaise-de-lia-vocale-accueille-nvidia-parmi-ses-investisseurs-et-setend-aux-etats-unis.ZDLFPAJCJBH6JHG5Z4HIFTPYG4.html
