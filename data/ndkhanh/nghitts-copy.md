# ndkhanh/nghitts-copy

## Resumen

`ndkhanh/nghitts-copy` es un espejo no oficial en HuggingFace de los modelos de síntesis de voz (text-to-speech) del proyecto NGHI-TTS, un conjunto de voces en vietnamita construido sobre la arquitectura Piper. El modelo base declarado es `rhasspy/piper-voices` y el ajuste fino se realizó sobre el dataset `rhasspy/piper-checkpoints`. El repositorio, de 3,2 GB, agrupa 18 voces vietnamitas distintas (22 ficheros ONNX, ya que varias voces incluyen dos versiones) y se publica bajo licencia Apache 2.0.

Técnicamente no es un modelo de lenguaje, sino un sistema TTS neuronal end-to-end de la familia VITS exportado a ONNX. Cada voz se distribuye como un fichero ONNX independiente en la carpeta `piper-tts/`, listo para usarse con el runtime Piper, y también en versión convertida en `sherpa-onnx/` (junto con `tokens.txt`) para el runtime Sherpa ONNX. No se especifican parámetros por voz, ni ventana de contexto, ni variantes de cuantización.

Su relevancia es acotada pero concreta: cubre un hueco poco poblado, el TTS en vietnamita desplegable en local y en CPU, con voces de estilos variados (narración, review de cine, locución comercial). Ahora bien, el repositorio tiene 0 descargas y 0 likes, es un espejo de terceros y no incluye evaluación objetiva publicada, por lo que debe tratarse como material experimental y no como un componente listo para producción sin validación previa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VITS (TTS neuronal end-to-end: VAE condicional, flujos normalizadores y decodificador tipo HiFi-GAN), exportada a ONNX |
| Parametros totales | no disponible (se distribuye un fichero ONNX por voz; no se declara el recuento) |
| Longitud de contexto | no aplicable (modelo TTS; el texto se sintetiza por fragmentos, sin límite declarado) |
| Tipos de cuantizacion | no disponible (solo se confirman ficheros ONNX; no se detallan variantes cuantizadas) |
| Idiomas soportados | vietnamita (código `vi`) |
| Licencia | Apache 2.0 (declarada por el autor del espejo) |
| Formato de pesos | ONNX (carpetas `piper-tts/` y `sherpa-onnx/`), más `config.json` y `tokens.txt` |
| Voces incluidas | 18 voces (22 ficheros): Ban Mai, Chiếu Thành, Duy Oryx, Lạc Phi, Mai Phương, Mạnh Dũng, Minh Khang, Minh Quang, Minh Thu, Mỹ Tâm (x2), Ngọc Huyền (x2), Ngọc Ngạn, Phương Trang, Tài An (x2), Thanh Phương Viettel, Thiện Tâm, Trấn Thành, Việt Thảo |
| Tamano del repositorio | 3,2 GB |
| Modelo base | rhasspy/piper-voices (relación: finetune) |
| Dataset de entrenamiento | rhasspy/piper-checkpoints |

## Arquitectura y entrenamiento

La arquitectura subyacente es VITS, un esquema de síntesis neuronal end-to-end que combina un autoencoder variacional condicional, flujos normalizadores para modelar la distribución latente y un decodificador vocacional entrenado con pérdida adversarial, lo que permite generar audio directamente desde texto sin un vocoder separado. La exportación a ONNX y el uso de un `config.json` con parámetros como `noise_scale` y `noise_w_scale` son coherentes con el pipeline Piper. La confirmación explícita aparece en la ruta de Sherpa ONNX, donde el modelo se carga mediante `OfflineTtsVitsModelConfig`.

El modelo se presenta como un ajuste fino sobre `rhasspy/piper-voices` usando el dataset `rhasspy/piper-checkpoints`. No se documentan en la información disponible el número de tokens de audio, la composición del corpus, la duración total de las grabaciones, el número de épocas ni la estrategia de aumento de datos. Tampoco se describen fases de RLHF o DPO, algo que no aplica a un sistema TTS de este tipo. Un detalle relevante del pipeline es la dependencia del frontend fonético de espeak-ng para la ruta de Sherpa ONNX (se requiere descargar `espeak-ng-data`), mientras que Piper gestiona la fonemización internamente a partir de su configuración. No se declara ninguna innovación técnica adicional más allá de la conversión de formato entre runtimes.

## Capacidades

- Síntesis de voz en vietnamita a partir de texto plano, con salida en WAV o mediante streaming por fragmentos (`synthesize` devuelve chunks con `audio_float_array`).
- 18 timbres distintos, incluidos registros masculinos y femeninos y voces caracterizadas (por ejemplo, "giọng nam siêu trầm" para Duy Oryx y una voz etiquetada como de review de cine para Ngọc Huyền).
- Control de variabilidad prosódica mediante `SynthesisConfig` (`noise_scale`, `noise_w_scale`), ajustable para obtener interpretaciones más estables o más expresivas.
- Ejecución en dos runtimes compatibles: Piper TTS (`piper-tts`) y Sherpa ONNX, ambos con variantes de CPU y GPU.
- Aceleración en hardware Intel mediante el proveedor OpenVINO de ONNX Runtime, con configuración `HETERO:GPU,CPU`.
- Exposición como endpoint compatible con la API de OpenAI mediante un gist de la comunidad, lo que permite sustituir proveedores TTS en la nube.
- No dispone de tool calling, function calling, razonamiento multi-paso, visión, audio de entrada ni modo de pensamiento: es exclusivamente un modelo de síntesis de voz.
- El multilingüismo se limita al vietnamita; no se declara soporte para otros idiomas.

## Casos de uso

- Audiolibros y lectura de textos largos en vietnamita: el modelo se puede invocar con fragmentos sucesivos de texto y concatenar los WAV resultantes; la inferencia en CPU elimina el coste por carácter asociado a las APIs comerciales.
- Narración y doblaje de vídeo: las voces etiquetadas por estilo (por ejemplo, la de review de cine o la de locución comercial de Tài An / CD Media) permiten asignar un timbre coherente a cada tipo de contenido sin entrenar nada nuevo.
- Asistentes de voz e IVR telefónico: al ejecutarse en CPU con dependencias ligeras, puede desplegarse en el mismo servidor que gestiona la centralita o el motor de diálogo, manteniendo el audio del usuario dentro de la infraestructura propia.
- Accesibilidad para personas con discapacidad visual: integración en lectores de pantalla o aplicaciones móviles que necesiten convertir texto en voz vietnamita sin depender de conectividad ni de servicios externos.
- Producción de contenido para redes sociales y pódcast: la variedad de timbres permite generar contenido con varias "voces" de forma automatizada y consistente a lo largo de una serie.
- E-learning y cursos en línea: locución de material didáctico en vietnamita donde el control de `noise_scale` permite priorizar inteligibilidad (valores bajos) o naturalidad expresiva (valores altos).
- Pipelines existentes que ya consumen la API de OpenAI: el endpoint compatible documentado en el gist permite sustituir el proveedor TTS por este modelo sin reescribir el cliente.
- Preprocesado de datos para otros sistemas: generación de corpus de audio sintético en vietnamita para tareas auxiliares de evaluación o aumento de datos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas objetivas (MOS, WER de transcripción inversa, RTF, latencia) ni comparaciones cuantitativas con otros sistemas TTS en vietnamita.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. No se declara el tamaño de los tensores ni el consumo de memoria de cada fichero ONNX; dado que el repositorio completo ocupa 3,2 GB repartido entre 22 ficheros, el modelo individual debería ser muy inferior a esa cifra, pero es una inferencia y no un dato confirmado.
- GPU recomendadas: no se especifica ninguna. La model card solo indica que la ejecución en GPU NVIDIA es posible, sin enumerar modelos concretos.
- Compatibilidad con GPU de consumo: sí en la práctica, ya que se documenta ejecución con `onnxruntime-gpu` y con Sherpa ONNX en modo CUDA, además de funcionar íntegramente en CPU. No se dan cifras de rendimiento por modelo de tarjeta.
- Ejecución en CPU: es el modo principal y el más documentado. Para CPU Intel se ofrece la ruta de OpenVINO (`openvino==2025.4.1` con `onnxruntime-openvino`, limitado a Python hasta 3.13 en el momento de redacción).
- Opciones de despliegue: Piper TTS (`pip install piper-tts`), Sherpa ONNX (`pip install sherpa-onnx`), ONNX Runtime en CPU o GPU, ONNX Runtime con proveedor OpenVINO y servidor HTTP compatible con la API de OpenAI mediante el gist de la comunidad.
- Restricciones de versión relevantes: `onnxruntime-gpu` para Piper se documenta con CUDA 13, mientras que para Sherpa ONNX la ruta GPU documentada es CUDA 12.
- Latencia y throughput: no disponible. Solo se confirma que el modelo admite síntesis en streaming por fragmentos, lo que permite empezar a reproducir antes de completar la frase.

## Comparativa con modelos similares

| Modelo | Tipo | Idiomas | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| ndkhanh/nghitts-copy | VITS exportado a ONNX (pipeline Piper) | vietnamita | Apache 2.0 (declarada) | HuggingFace, 0 descargas, 0 likes | Espejo no oficial; 18 voces, 22 ficheros; 3,2 GB |
| rhasspy/piper-voices (modelo base) | VITS exportado a ONNX (pipeline Piper) | múltiples idiomas | no disponible en la información | HuggingFace | Modelo de partida del ajuste fino; es la referencia natural de comparación |
| Coqui XTTS-v2 | TTS neuronal con clonación de voz zero-shot | varios idiomas | no disponible en la información | HuggingFace | Capacidad de clonación a partir de unos segundos de audio; no orientado específicamente al vietnamita |
| Google Cloud TTS / Azure Speech | TTS propietario en la nube | múltiples | propietaria (términos de servicio) | API en la nube | No permite despliegue local ni control sobre los datos de entrenamiento; coste por carácter |

No se dispone de datos de parámetros ni de métricas comparativas para ninguna de las filas, por lo que la comparación es estructural (formato, licencia, despliegue e idioma) y no de calidad.

## Limitaciones y advertencias

- Es un espejo no oficial publicado por un tercero (`ndkhanh`), no por el equipo de NGHI-TTS. No hay garantía de integridad de los ficheros, de trazabilidad del ajuste fino ni de continuidad del repositorio.
- El repositorio registra 0 descargas y 0 likes, por lo que no ha sido validado por la comunidad.
- Las fechas de creación y actualización indican 2026-09-26, una marca temporal posterior a la fecha habitual de consulta; esto puede deindicar un error de metadatos o un proceso automatizado. Conviene verificarla antes de citar el modelo.
- Solo admite vietnamita. No hay soporte declarado para otros idiomas ni para code-switching.
- Los modelos VITS pueden producir artefactos acústicos, saltos, alargamientos o pronunciación incorrecta en palabras fuera del vocabulario de entrenamiento: nombres propios, siglas, cifras, términos extranjeros y topónimos son los casos más propensos.
- No se ha publicado ninguna evaluación objetiva (MOS, inteligibilidad, comparación con voces humanas) ni en la model card ni en la información disponible, así que la calidad de cada voz es una incógnita hasta que se pruebe.
- Varias voces parecen corresponder a personas identificables del ámbito público vietnamita (por ejemplo, Mỹ Tâm, Trấn Thành o Thanh Phương Viettel). Aunque la licencia declarada sea Apache 2.0, los derechos de imagen y de voz de esas personas son una cuestión independiente de la licencia del fichero, y su uso comercial es jurídicamente arriesgado sin autorización expresa.
- La licencia Apache 2.0 la declara el autor del espejo, no necesariamente el autor original del modelo ni los titulares de las grabaciones de entrenamiento. No hay información sobre la procedencia del corpus.
- La ruta de Sherpa ONNX depende de espeak-ng para la fonemización, lo que añade un componente externo que hay que descargar y desplegar aparte.
- Las restricciones de versión de CUDA (13 para Piper, 12 para Sherpa ONNX) y de Python (hasta 3.13 con OpenVINO) pueden complicar la integración en entornos ya fijados.
- El repositorio completo pesa 3,2 GB, un coste de almacenamiento considerable si solo se necesita una voz.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ndkhanh/nghitts-copy
- Modelo base: https://huggingface.co/rhasspy/piper-voices
- Dataset de entrenamiento: https://huggingface.co/datasets/rhasspy/piper-checkpoints
- Repositorio oficial del proyecto: https://github.com/nghimestudio/nghitts
- Anuncio oficial: https://www.facebook.com/groups/binhdanhocai/permalink/921555793666509/
- Descarga oficial de los modelos: https://drive.google.com/drive/folders/1f_pCpvgqfvO4fdNKM7WS4zTuXC0HBskL
- API de Python de Piper: https://github.com/OHF-Voice/piper1-gpl/blob/main/docs/API_PYTHON.md
- Conversión a Sherpa ONNX (documentación de Piper): https://k2-fsa.github.io/sherpa/onnx/tts/piper.html
- Ejemplo de TTS offline con Sherpa ONNX: https://github.com/k2-fsa/sherpa-onnx/blob/master/python-api-examples/offline-tts.py
- Datos de espeak-ng requeridos por Sherpa ONNX: https://github.com/k2-fsa/sherpa-onnx/releases/download/tts-models/espeak-ng-data.tar.bz2
- Endpoint compatible con OpenAI sobre Piper TTS: https://gist.github.com/phineas-pta/7d08a3ac21d64e67ed5fa6b47e93c097
- Documentación del proveedor OpenVINO de ONNX Runtime: https://onnxruntime.ai/docs/execution-providers/OpenVINO-ExecutionProvider.html
- Versiones de onnxruntime de Intel: https://github.com/intel/onnxruntime/releases

Nota: la búsqueda web realizada no devolvió ningún resultado relevante sobre este modelo; los enlaces obtenidos correspondían a sitios de contenido para adultos sin relación alguna con el proyecto, por lo que se han omitido.
