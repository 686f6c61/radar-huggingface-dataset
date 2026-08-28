# internetoftim/speecht5_tts-pld-fil-ONNX

## Resumen

El modelo `internetoftim/speecht5_tts-pld-fil-ONNX` es una exportación a formato ONNX del sistema de síntesis de voz (text-to-speech) `sapinsapin/speecht5_tts-pld-fil`, adaptado para su uso directo con la librería Transformers.js en entornos JavaScript (navegador o Node.js). El autor, `internetoftim`, ha empaquetado el modelo junto con el vocoder `microsoft/speecht5_hifigan` para ofrecer una solución completa de TTS en filipino que puede ejecutarse íntegramente en el lado del cliente mediante WebAssembly, sin necesidad de infraestructura de servidor.

El modelo se basa en la arquitectura SpeechT5 de Microsoft, un framework unificado de pre-entrenamiento encoder-decoder para representaciones de voz y texto. Esta versión concreta está fine-tuneada para la generación de habla en filipino (tagalo) y se distribuye con pesos cuantizados a 8 bits (q8), lo que reduce el tamaño a aproximadamente 180 MB. Su relevancia radica en que permite desplegar síntesis de voz en filipino en aplicaciones web de forma ligera y con baja latencia, aprovechando el ecosistema de Transformers.js y ONNX Runtime Web.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | SpeechT5 (encoder-decoder) + vocoder HiFi-GAN |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | q8 (8 bits) |
| Idiomas soportados | filipino (tagalo) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (contenedor .onnx) |

## Arquitectura y entrenamiento

SpeechT5 es un modelo de pre-entrenamiento unificado para voz y texto, propuesto por Microsoft en el articulo "SpeechT5: Unified-Modal Encoder-Decoder Pre-Training for Spoken Language Processing" (arXiv:2110.07205). La arquitectura consta de un encoder y un decoder compartidos entre ambas modalidades, junto con seis pre-nets y post-nets especificos de cada modalidad (texto y voz). Para la tarea de TTS, el modelo se fine-tunea sobre pares de texto y audio, y en este caso se ha ajustado especificamente para el idioma filipino.

El modelo base `sapinsapin/speecht5_tts-pld-fil` proporciona los pesos entrenados, y esta version ONNX reutiliza el tokenizer de `microsoft/speecht5_tts` (el archivo `spm_char.model` es byte-identico), por lo que no se incluye un tokenizer propio. El vocoder HiFi-GAN se anade para convertir las representaciones intermedias en audio final. No se dispone de informacion detallada sobre el dataset de entrenamiento, el numero de tokens o el proceso de alineamiento utilizado.

## Capacidades

- Generacion de voz sintetica en filipino a partir de texto.
- Requiere un speaker embedding externo (la arquitectura SpeechT5 no tiene una voz fija; se debe proporcionar un vector de embeddings del hablante).
- Ejecucion en el navegador o en Node.js mediante Transformers.js y ONNX Runtime Web, con soporte para WebAssembly.
- No incluye capacidades de tool calling, agentes, razonamiento multimodal ni otras funciones propias de modelos de lenguaje generales.
- El modelo esta disenado exclusivamente para la tarea de text-to-speech; no realiza reconocimiento de voz ni otras tareas.

## Casos de uso

- Lectura de contenido web en filipino: una extension de navegador o una aplicacion web puede convertir articulos o noticias en audio para usuarios que prefieran escuchar en lugar de leer, aprovechando la ejecucion local sin enviar datos a un servidor.
- Asistentes de voz en filipino para el cliente: integracion en aplicaciones de chat o asistentes personales que necesiten respuestas habladas en tagalo, con baja latencia al ejecutarse en el dispositivo del usuario.
- Accesibilidad para personas con discapacidad visual: herramientas de lectura de pantalla en filipino que funcionen sin conexion, utilizando el modelo en un entorno de escritorio o movil con Transformers.js.
- Prototipado rapido de TTS en aplicaciones web: desarrolladores pueden probar la sintesis de voz en filipino sin configurar un backend, usando el ejemplo de codigo proporcionado en la model card.
- Generacion de audio para material educativo: creacion de locuciones para cursos, podcasts o videos en filipino, automatizando el proceso con scripts en Node.js que invoquen el modelo.
- Aplicaciones de aprendizaje de idiomas: herramientas que pronuncien palabras o frases en filipino para estudiantes, con la posibilidad de ajustar el speaker embedding para diferentes voces.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No existen datos de evaluacion objetiva (MOS, intelligibility, etc.) para este modelo especifico ni para su version base en filipino.

## Requisitos de hardware

- Al estar cuantizado a q8 y ejecutarse via WebAssembly, no requiere GPU; funciona en CPU con memoria RAM suficiente (el repo ocupa 0.8 GB, pero los pesos q8 son ~180 MB).
- VRAM: no aplica (inferencia en CPU).
- GPU recomendadas: ninguna; el modelo esta pensado para entornos sin aceleracion grafica.
- Opciones de despliegue: Transformers.js con `dtype: 'q8'` y `device: 'wasm'`; tambien puede usarse con ONNX Runtime en otros entornos (Node.js, Python) si se cargan los archivos ONNX.
- Latencia y throughput: no disponibles; dependen del hardware del cliente y del tamaño del texto de entrada.

## Comparativa con modelos similares

| Modelo | Idioma | Formato | Licencia | Contexto | Notas |
|---|---|---|---|---|---|
| `internetoftim/speecht5_tts-pld-fil-ONNX` | filipino | ONNX (q8) | Apache 2.0 | no disponible | Optimizado para Transformers.js |
| `microsoft/speecht5_tts` | ingles | PyTorch | MIT (original) | no disponible | Modelo base de SpeechT5 TTS |
| `Xenova/speecht5_tts` | ingles | ONNX (fp32, q8) | Apache 2.0 | no disponible | Version para Transformers.js del modelo de Microsoft |

La principal diferencia es el idioma: este modelo esta fine-tuneado para filipino, mientras que los otros dos son para ingles. En cuanto a licencia, el modelo original de Microsoft usa MIT, pero esta exportacion declara Apache 2.0. No se dispone de comparativas de rendimiento entre ellos.

## Limitaciones y advertencias

- Requiere un speaker embedding externo; sin el, el modelo no puede generar audio. Esto anade complejidad a la integracion.
- La calidad de la voz puede ser inferior a la de sistemas TTS comerciales o modelos mas grandes (no hay datos objetivos que lo confirmen, pero es una limitacion inherente a SpeechT5).
- Solo esta confirmado para filipino; aunque el modelo base podria generalizar a otros idiomas, no hay garantia y no se ha evaluado.
- El campo de idiomas en HuggingFace figura como "no disponible", aunque el tag indica filipino; se recomienda verificar el comportamiento con otros idiomas antes de usarlo en produccion.
- La licencia Apache 2.0 permite uso comercial, pero se debe revisar la licencia del modelo base `sapinsapin/speecht5_tts-pld-fil` y del vocoder HiFi-GAN para asegurar el cumplimiento.
- Al ser una exportacion ONNX, puede haber diferencias numericas con el modelo original en PyTorch, especialmente con cuantizacion q8.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/internetoftim/speecht5_tts-pld-fil-ONNX
- Modelo base: https://huggingface.co/sapinsapin/speecht5_tts-pld-fil
- Modelo original de Microsoft: https://huggingface.co/microsoft/speecht5_tts
- Paper de SpeechT5: https://arxiv.org/abs/2110.07205
- Repositorio GitHub de SpeechT5: https://github.com/microsoft/SpeechT5
- Version de Xenova para Transformers.js: https://huggingface.co/Xenova/speecht5_tts
