# Phoonnx/glowtts-en-us-cmu_slp

## Resumen

GlowTTS-en-us-cmu_slp es un modelo de sintesis de voz (text-to-speech) publicado por el usuario Phoonnx en Hugging Face, distribuido en formato ONNX y empaquetado para su uso con la libreria phoonnx. Se trata de una extraccion de una unica voz del repositorio agregado `Phoonnx/phoonnx-glowtts`, concretamente la carpeta `en-us-cmu_slp`, que corresponde a una voz en ingles estadounidense del corpus CMU (Carnegie Mellon University) entrenada con la arquitectura GlowTTS. El modelo resuelve la conversion de texto a audio en ingles dentro del ecosistema phoonnx, una libreria orientada a la inferencia TTS ligera y portable sobre ONNX Runtime.

El modelo se identifica con el voice id `larynx/en-us-cmu_slp-glow_tts`, lo que lo vincula a la familia de voces Larynx, un conjunto de modelos TTS de codigo abierto entrenados con GlowTTS y pensados para ejecucion local. Su relevancia practica radica en que permite sintetizar voz en ingles sin dependencias de servicios en la nube, con un peso de repositorio de aproximadamente 0,1 GB, lo que lo hace adecuado para despliegues en dispositivos con recursos limitados.

No se dispone de informacion publica sobre el numero de parametros, la longitud de contexto ni los datos exactos de entrenamiento en la informacion proporcionada. La model card es minima y se limita a indicar la procedencia del modelo, la licencia y el identificador de voz.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GlowTTS (TTS no autorregresivo basado en normalizing flows, segun la familia GlowTTS) |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo TTS, no aplica ventana de contexto de texto) |
| Tipos de cuantizacion | no disponible (distribucion en ONNX; no se documentan variantes cuantizadas) |
| Idiomas soportados | ingles (voz `en-us`, segun el identificador de carpeta) |
| Licencia | other (la model card no especifica una licencia concreta para esta carpeta) |
| Formato de pesos | ONNX |

## Arquitectura y entrenamiento

La arquitectura corresponde a GlowTTS, un modelo de sintesis de voz no autorregresivo que emplea normalizing flows para transformar una distribucion latente en el espectrograma mel, junto con un modulo de duracion que alinea fonemas y frames. Esta familia de modelos se caracteriza por una inferencia rapida y paralela, sin decodificacion autoregresiva, lo que reduce la latencia frente a arquitecturas como Tacotron. El modelo se distribuye en formato ONNX, lo que permite su ejecucion sobre ONNX Runtime en CPU y GPU sin necesidad de frameworks de deep learning completos.

No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o ajuste fino adicional. El identificador `cmu_slp` sugiere que la voz se entreno con datos del corpus CMU, probablemente del proyecto de sintesis de habla de la Universidad Carnegie Mellon, pero este extremo no se confirma en la model card. Tampoco se documentan innovaciones tecnicas adicionales como decodificacion especulativa o atencion lineal.

## Capacidades

- Sintesis de voz (text-to-speech) en ingles estadounidense a partir de texto de entrada.
- Generacion de audio en formato mel-espectrograma y waveform, segun el pipeline TTS de la libreria phoonnx.
- Ejecucion local sobre ONNX Runtime, sin dependencia de servicios externos.
- Integracion directa con la libreria phoonnx mediante el voice id `larynx/en-us-cmu_slp-glow_tts`.
- No se documentan capacidades de tool calling, function calling, agentes, razonamiento multi-paso ni procesamiento multimodal.
- No se documentan capacidades multilingues mas alla del ingles estadounidense.

## Casos de uso

- Lectura de articulos y documentos: el modelo convierte texto en audio para aplicaciones de accesibilidad, permitiendo a usuarios con discapacidad visual escuchar contenido escrito en ingles con una voz sintetica local.
- Asistentes de voz embebidos: al ejecutarse sobre ONNX Runtime y ocupar aproximadamente 0,1 GB, puede integrarse en dispositivos de borde o aplicaciones de escritorio que necesiten respuestas habladas sin conexion.
- Generacion de narracion para contenido educativo: sintesis de lecciones o materiales formativos en ingles para plataformas de e-learning que requieran audio generado de forma automatizada y reproducible.
- Prototipado de interfaces conversacionales: desarrolladores que construyan chatbots de voz pueden usar esta voz como componente TTS durante fases de prueba, sustituyendola por una voz de produccion mas adelante.
- Pruebas de pipelines TTS en CI/CD: al ser un modelo ligero en ONNX, puede incluirse en pruebas automatizadas que verifiquen la integracion de phoonnx sin coste de infraestructura elevado.
- Generacion de avisos y notificaciones habladas: aplicaciones de domotica o sistemas de alerta pueden sintetizar mensajes cortos en ingles de forma local, reduciendo la dependencia de APIs externas y la latencia de red.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; con un repositorio de aproximadamente 0,1 GB, la huella de memoria es reducida y compatible con entornos de pocos recursos.
- GPU recomendadas: no se especifican; al ejecutarse sobre ONNX Runtime, puede funcionar en CPU y en GPU consumer sin requisitos documentados.
- Compatibilidad con GPU consumer: previsiblemente si, dado el tamano reducido del modelo, aunque no se confirma en la informacion disponible.
- Opciones de despliegue: ONNX Runtime a traves de la libreria phoonnx; no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI (herramientas orientadas a modelos de lenguaje, no a TTS).
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Arquitectura | Idiomas | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| GlowTTS-en-us-cmu_slp (este modelo) | GlowTTS | Ingles (en-us) | ONNX | other | Hugging Face (Phoonnx) |
| Otras voces de Phoonnx/phoonnx-glowtts | GlowTTS | Multiples voces | ONNX | other | Hugging Face (Phoonnx) |
| Voces Larynx originales | GlowTTS | Multiples idiomas | Diversos | Segun modelo | Repositorios Larynx |

No se dispone de datos de rendimiento comparativo entre estas alternativas en la informacion proporcionada.

## Limitaciones y advertencias

- La licencia figura como `other` y la model card no especifica una licencia concreta para esta carpeta, lo que genera incertidumbre sobre el uso comercial; es necesario contactar con el autor o consultar el repositorio original antes de desplegarlo en produccion.
- Solo se documenta soporte para ingles estadounidense; no se confirman otros idiomas.
- Al ser un modelo TTS, puede producir pronunciaciones incorrectas en palabras poco frecuentes, nombres propios o terminos tecnicos no vistos durante el entrenamiento.
- No se dispone de informacion sobre sesgos de voz (genero, acento, edad) ni sobre la composicion del dataset de entrenamiento, lo que impide evaluar su representatividad.
- El repositorio no registra descargas ni likes, y la model card es minima; no hay evidencia publica de validacion por parte de la comunidad.
- No se documentan limitaciones de contexto en el sentido de modelos de lenguaje, pero la calidad de sintesis puede degradarse con entradas de texto muy largas si la libreria no segmenta adecuadamente.
- No se dispone de informacion sobre latencia, throughput ni calidad perceptual (MOS) que permita garantizar un rendimiento en produccion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Phoonnx/glowtts-en-us-cmu_slp
- Repositorio agregado de origen: https://huggingface.co/Phoonnx/phoonnx-glowtts
- Libreria phoonnx: https://github.com/TigreGotico/phoonnx
