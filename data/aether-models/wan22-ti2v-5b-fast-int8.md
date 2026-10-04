# aether-models/wan22-ti2v-5b-fast-int8

## Resumen

wan22-ti2v-5b-fast-int8 es un paquete de pesos cuantizados en int8 para el SDK Aether, publicado por aether-models. Se trata de una conversion del modelo de difusion de video FastVideo/FastWan2.2-TI2V-5B-FullAttn-Diffusers desde PyTorch al formato Core AI (`.aimodel`), pensado para ejecutarse en dispositivos Apple (iOS y macOS 27+). No es un modelo entrenado desde cero, sino una redistribucion optimizada del modelo base, con pesos int8-linear-perchannel (8 bits por peso).

El modelo realiza generacion de video a partir de una imagen (image-to-video): recibe un primer fotograma y un prompt de texto, y devuelve un clip que continua esa imagen. La arquitectura subyacente es un modelo de difusion latente para video con encoder de texto, encoder de primer fotograma (VAE) y un denoiser dividido en tres segmentos. El nombre indica aproximadamente 5.000 millones de parametros.

Su relevancia radica en que permite ejecutar generacion de video en dispositivo (on-device) sobre hardware Apple, sin depender de servidores con GPU. El compromiso es una cuantizacion agresiva a 8 bits y el uso de un decoder diminuto (taeHV con pesos `taew2_2`) en lugar del decoder original del modelo, que no se incluye.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo de difusion latente de video (image-to-video) convertido a Core AI; incluye encoder de texto, encoder de primer fotograma (VAE), denoiser en 3 segmentos y decoder de video diminuto |
| Parametros totales | Aproximadamente 5.000 millones (segun la denominacion "5B" del modelo base) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (generacion de video; maximo 49 fotogramas por clip, 2,0 s a 24 fps) |
| Tipos de cuantizacion | Pesos int8-linear-perchannel (denoiser y encoder de texto); token embedding en float16; encoder de primer fotograma en float16; decoder de video en float16 (sin cuantizar); residual stream del denoiser en float32 |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 (componentes adicionales: taeHV bajo MIT, pesos `taew2_2` bajo Apache-2.0) |
| Formato de pesos | Core AI (`.aimodel`); no safetensors ni GGUF |

## Arquitectura y entrenamiento

Se trata de una conversion y cuantizacion del modelo FastVideo/FastWan2.2-TI2V-5B-FullAttn-Diffusers, que a su vez deriva de la familia Wan2.2 TI2V (texto/imagen a video) de 5B de parametros. El pipeline se ejecuta por etapas secuenciales: el encoder de texto en 3 segmentos (con el token embedding en float16), el encoder de primer fotograma (el encoder del autoencoder de video, en float16), el denoiser en 3 segmentos (con los pesos int8 y un residual stream en float32) y el decoder de video. La inferencia usa 3 pasos de muestreo sin guia (guidance), lo que corresponde a una variante "fast" destilada.

La innovacion principal del paquete no esta en el entrenamiento, sino en la conversion: no se ha reentrenado el modelo. El decoder propio del modelo original no se incluye; en su lugar se emplea un decoder diminuto (taeHV de madebyollin, licencia MIT) con los pesos `taew2_2` de lightx2v, que nunca se cuantiza. Los ficheros del tokenizer son los del modelo de origen. No se dispone de informacion sobre el numero de tokens, la composicion del dataset ni si hubo fases de RLHF o DPO, ya que esta ficha es un artefacto de redistribucion, no de entrenamiento.

## Capacidades

- Generacion de video a partir de una imagen (image-to-video): continua un primer fotograma dado siguiendo una descripcion textual.
- Generacion de clips de hasta 49 fotogramas (2,0 s por defecto a 24 fps).
- Soporte de varias resoluciones: 384x672 (por defecto), 672x384, 320x576 y 576x320. El primer fotograma debe tener el tamano del clip.
- Inferencia rapida con 3 pasos de muestreo y sin guia (guidance-free).
- Ejecucion en dispositivo (on-device) sobre Apple Core AI, sin servidor remoto.
- Tool calling / function calling: no disponible (no es un modelo de lenguaje).
- Soporte de agentes y razonamiento multi-paso: no aplica.
- Capacidades multilingues: no disponible.
- Modo thinking: no aplica.

## Casos de uso

- Animacion de fotos en apps iOS: una aplicacion puede tomar una imagen fija de la galeria y generar un clip corto que la continua, usando el SDK de Aether con `videoGenerator`.
- Creacion de contenido para redes sociales: generacion de microclips (2 s) para previsualizaciones o stories directamente en el telefono, sin subir la imagen a un servidor.
- Prototipado de storyboards: animar un fotograma clave para validar una secuencia narrativa antes de producirla con herramientas de mayor calidad.
- Publicidad y marketing generativo en dispositivo: generar variaciones cortas a partir de una imagen de producto manteniendo los datos en el terminal (util en escenarios con requisitos de privacidad).
- Aplicaciones sin conexion: al ejecutarse localmente, funciona en contextos sin red, sin coste de inferencia por peticion en la nube.
- Integracion en apps macOS 27+ para edicion de video ligera: anadir movimiento a imagenes dentro de un editor de escritorio de Apple.
- Demostraciones tecnicas para desarrolladores: servir como referencia de integracion del SDK Aether con modelos Core AI cuantizados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K, VBench u otros) en la informacion disponible. Lo unico disponible son los registros de verificacion del propio paquete:

| Variante | Tier | Resultado | Detalle | Dispositivo | SO | Compute | Registro |
|---|---|---|---|---|---|---|---|
| ios-any-gpu | T2 | pass | 6/6 casos; perfil quantized-8bit-relative; fixture `7052e35d5589c9dc` | iPhone18,2 | 24A446 | target | `b23fa5c1` |
| referencia sin cuantizar (no publicada) | T2 | pass | 6/6 casos; perfil strict-relative; fixture `7052e35d5589c9dc` | Mac17,6 | 26A434 | target | `fef1c5e9` |

Se trata de comprobaciones de fidelidad frente a la referencia sin cuantizar, no de medidas de calidad perceptual o artistica. No se aportan metricas de latencia por clip mas alla de que la inferencia usa 3 pasos.

## Requisitos de hardware

- Plataforma: exclusivamente Apple, con Core AI; iOS 27+ y macOS 27+.
- VRAM/pico de memoria: el pico medido en la ejecucion T2 (clips de prueba de 17 fotogramas) fue de 2024 MB en un iPhone18,2. Las etapas se cargan de una en una.
- Almacenamiento en dispositivo: aproximadamente 37,75 GB en total (13,02 GB de descarga mas unos 24,73 GB que Core AI cachea al especializar los assets la primera vez que se usa cada resolucion).
- Requiere el entitlement `com.apple.developer.kernel.increased-memory-limit`.
- GPU recomendadas: no aplica a NVIDIA; el modelo no esta disenado para CUDA (A100, H100, RTX 4090, etc.).
- Cabe en dispositivos Apple compatibles con Core AI; no en GPU de consumo tipo NVIDIA por formato.
- Opciones de despliegue: SDK Aether (CLI `aether generate` y API Swift `Aether`). No soporta vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponible; la unica referencia de eficiencia es que usa 3 pasos de muestreo sin guia.

## Comparativa con modelos similares

| Modelo | Parametros | Formato | Plataforma | Cuantizacion | Licencia |
|---|---|---|---|---|---|
| wan22-ti2v-5b-fast-int8 | ~5B | Core AI (`.aimodel`) | Apple Core AI (iOS/macOS 27+) | int8-linear-perchannel | apache-2.0 |
| FastWan2.2-TI2V-5B-FullAttn-Diffusers | ~5B | safetensors / Diffusers (PyTorch) | GPU generica | sin cuantizar (fp) | apache-2.0 |
| Referencia sin cuantizar del bundle (no publicada) | ~5B | Core AI (`.aimodel`) | Apple Core AI | sin cuantizar (fp) | no publicada |

No se dispone de datos de rendimiento comparativos con otros modelos de image-to-video de la misma categoria (por ejemplo, otros modelos de la familia Wan u otros generadores de video) en la informacion proporcionada, por lo que no se puede establecer una comparacion cuantitativa de calidad.

## Limitaciones y advertencias

- El decoder propio del modelo original no se incluye: los clips se decodifican con el decoder diminuto taeHV (`taew2_2`), lo que puede afectar a la fidelidad visual frente al modelo de origen.
- La cuantizacion int8 puede introducir perdida de calidad respecto a la referencia sin cuantizar; no se aportan metricas objetivas de esa posible degradacion.
- Salida muy limitada en duracion: maximo 49 fotogramas (2,0 s), lo que restringe los casos de uso a clips muy cortos.
- Restringido a hardware Apple con iOS/macOS 27+; no es portable a soluciones CUDA.
- Consumo de almacenamiento elevado (unos 37,75 GB en dispositivo), poco habitual en moviles.
- Requiere un entitlement especial de memoria; sin el, la ejecucion puede fallar.
- Idiomas de prompt no documentados; no disponible la cobertura multilingue.
- Riesgo de alucinacion/perdida de coherencia temporal inherente a los modelos generativos de video, especialmente con prompts ambiguos o movimientos complejos.
- Sesgos conocidos: no disponible (no se documentan evaluaciones de sesgo).
- Licencia: el paquete es apache-2.0, pero incorpora taeHV bajo MIT y pesos `taew2_2` bajo Apache-2.0; conviene conservar los avisos `THIRD_PARTY_LICENSES/taehv-LICENSE`. El modelo de origen declara apache-2.0 pero no incluye fichero de licencia; el `LICENSE` del paquete es el texto canonico de apache.org.
- Sin adopcion registrada por la comunidad (0 descargas, 0 likes en el momento de la consulta) y sin validacion externa independiente.
- Las fechas de creacion y actualizacion del repositorio (2026) son posteriores a la fecha habitual de referencia; conviene verificar la vigencia del contenido antes de integrarlo en produccion.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/aether-models/wan22-ti2v-5b-fast-int8
- Modelo base: https://huggingface.co/FastVideo/FastWan2.2-TI2V-5B-FullAttn-Diffusers
- Decoder diminuto taeHV (madebyollin, MIT): https://github.com/madebyollin/taehv
- Pesos `taew2_2` (lightx2v, Apache-2.0): https://huggingface.co/lightx2v/Autoencoders
- Busqueda web: los resultados obtenidos no aportan enlaces tecnicos relevantes (referencias a la mitologia del "eter" y a un mod de Minecraft).
