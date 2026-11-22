# Phoonnx/vits-ro_ro-mihai-medium-espeak-v2

## Resumen

Phoonnx/vits-ro_ro-mihai-medium-espeak-v2 es una voz de sintesis de voz (text-to-speech) en rumano construida sobre la arquitectura VITS y empaquetada como modelo ONNX para la libreria phoonnx. El modelo es una conversion del checkpoint original de Piper publicado por Rhasspy en rhasspy/piper-voices, concretamente la voz `ro_RO-mihai-medium` de un unico hablante masculino. Esta version v2 sustituye a la anterior `Phoonnx/vits-ro_ro-mihai-medium-espeak` porque el modelo upstream fue reentrenado sobre la base de Piper 1.5 (commit `e9c8a39444`), por lo que los pesos antiguos ya no corresponden a la version actual.

El modelo resuelve el problema de disponer de una voz rumana ligera, offline y de baja latencia para asistentes de voz y sistemas de lectura en voz alta, sin depender de servicios en la nube. Con un grafo ONNX de 63,2 MB en fp32 y 18,7 MB en int8, es adecuado para dispositivos de recursos limitados. La entrada de texto se realiza mediante fonemas espeak-ng en alfabeto IPA, y la salida es audio mono a 22050 Hz.

La relevancia actual radica en su licencia CC0 1.0, que permite uso comercial sin restricciones de atribucion obligatoria (aunque se recomienda citar a Rhasspy), y en su integracion directa con el ecosistema OVOS/Mycroft mediante el plugin `ovos-tts-plugin-phoonnx`. No es un modelo de lenguaje generativo, sino un sintetizador acustico neuronal especializado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VITS (Piper 1.5) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo TTS, entrada por fonemas) |
| Tipos de cuantizacion | fp32 e int8 (quantize_dynamic de onnxruntime 1.32.0, pesos QInt8) |
| Idiomas soportados | rumano (ro-RO) |
| Licencia | CC0 1.0 |
| Formato de pesos | ONNX (grafo `<graph>.onnx` y `<graph>_int8.onnx`) |
| Frecuencia de muestreo | 22050 Hz |
| Hablantes | 1 (voz masculina, "mihai") |
| Fonemizador | espeak-ng, voz `ro`, alfabeto IPA |
| Puntuacion entrenada | coma, punto, exclamacion, interrogacion, dos puntos, punto y coma |
| Parametros de inferencia | noise_scale 0.5, noise_w 0.333 |
| Tamano del repo | 0.1 GB |
| Libreria | phoonnx |

## Arquitectura y entrenamiento

VITS es una arquitectura de sintesis de voz neuronal de extremo a extremo que combina un codificador de texto, un prior normalizador de flujo y un decodificador generativo basado en HiFi-GAN, entrenada de forma adversarial con una perdida de reconstruccion espectral. Piper es una implementacion optimizada de VITS orientada a inferencia ligera y offline. En este caso, el modelo parte de la base `rdh` (calidad medium, hablante flamenco de nl_BE, licencia CC0) y se ajusta finamente con MRD (multi-resolution discriminator) y SDP para la voz rumana. Requiere Piper 1.5 o superior.

Los datos de entrenamiento no estan registrados en la model card upstream; se indica unicamente que provienen de https://github.com/OHF-Voice/voice-datasets con licencia CC0. No se documenta el numero de horas de audio, la composicion del corpus ni si hubo etapas de RLHF o DPO (no aplica a un modelo TTS). La innovacion tecnica destacable es la cuantizacion dinamica a int8 con onnxruntime, que reduce el grafo de 63,2 MB a 18,7 MB manteniendo el modelo dentro de umbrales de calidad verificados mediante un gate automatico (audio finito y no silencioso, duracion entre 0,8 y 1,25 veces la de fp32, y WER como maximo el de fp32 + 0,05).

## Capacidades

- Sintesis de voz en rumano (ro-RO) a partir de texto, con una unica voz masculina.
- Conversion texto-a-fonemas mediante espeak-ng (voz `ro`, alfabeto IPA).
- Respeto de la puntuacion de clausula (`, . ! ? : ;`) en la sintesis con phoonnx 1.96.1a1 y posteriores.
- Salida de audio WAV mono a 22050 Hz.
- Inferencia offline sin dependencia de servicios externos.
- Ejecucion en CPU (RTF 0,038 en fp32 y 0,095 en int8 sobre un Intel i9-11900H con 4 hilos).
- Integracion como plugin TTS en OVOS/Mycroft (`ovos-tts-plugin-phoonnx`).
- No soporta tool calling, agentes, vision, audio de entrada ni razonamiento multi-paso; es exclusivamente un sintetizador.

## Casos de uso

- Asistentes de voz offline en rumano: el modelo puede integrarse en OVOS/Mycroft mediante el plugin `ovos-tts-plugin-phoonnx` para responder verbalmente a comandos, con latencia baja (RTF inferior a 0,1) y sin conexion a internet.
- Lectura en voz alta de articulos o documentos: al aceptar texto plano con puntuacion de clausula, es adecuado para convertir parrafos en audio WAV de forma secuencial en aplicaciones de accesibilidad.
- Sistemas de anuncios y senalizacion en entornos rumanoparlantes: con un grafo int8 de 18,7 MB y pico de RSS de 238,5 MB, cabe en dispositivos embebidos y Raspberry Pi para reproducir avisos pregrabados o dinamicos.
- Videojuegos y aplicaciones interactivas: la sintesis en tiempo real (RTF 0,038 en fp32) permite generar dialogos de NPC sin precargar todos los audios, reduciendo el tamano del build.
- Automatizacion de locucion para contenidos educativos: el modelo puede generar narraciones de cursos o audiolibros en rumano de forma por lotes, con licencia CC0 que permite uso comercial sin restricciones.
- Pruebas y desarrollo de pipelines TTS: sirve como voz de referencia ligera para validar sistemas de fonemizacion, evaluacion ASR (como se hizo con nemo-parakeet-tdt-0.6b-v3 int8) o comparativas de cuantizacion.
- Kioscos y terminales de atencion al publico: la inferencia en CPU con 4 hilos y un pico de memoria inferior a 300 MB permite desplegar la voz en hardware modesto sin GPU.

## Benchmarks y rendimiento

Los datos disponibles son de control de calidad (QA) del propio autor, medidos con ASR nemo-parakeet-tdt-0.6b-v3 int8 sobre 3 frases de FLORES-200 devtest, en un Intel Core i9-11900H a 2,50 GHz.

| Metrica | fp32 | int8 |
|---|---|---|
| Resultado QA | pass | pass |
| WER | 0,100 | 0,150 |
| Caracteres por segundo | 12,9 a 14,6 | no disponible |
| Longitud int8 / fp32 | no aplica | 0,99 a 1,02 |
| Tamano del grafo | 63,2 MB | 18,7 MB |
| Pico de RSS | 275,6 MB | 238,5 MB |
| RTF (mediana de 3, 4 hilos) | 0,038 | 0,095 |

No se han publicado resultados de benchmarks comparativos estandar (MOS, MCD, etc.) en la informacion disponible.

## Requisitos de hardware

- VRAM: no aplica; el modelo se ejecuta en CPU mediante onnxruntime.
- Memoria RAM: pico de RSS de 275,6 MB en fp32 y 238,5 MB en int8.
- CPU: funciona en cualquier x86-64 o ARM moderno; las mediciones se hicieron en un Intel Core i9-11900H con 4 hilos.
- GPU: no es necesaria; no se documenta soporte GPU en la informacion disponible.
- Cabe en hardware de consumo y en dispositivos embebidos (Raspberry Pi, mini-PC) gracias al grafo int8 de 18,7 MB.
- Despliegue: libreria phoonnx (`pip install --pre phoonnx`), con espeak-ng instalado (`apt install espeak-ng`) o el port espyak (`pip install --pre "phoonnx[espeak]"`). Integracion con OVOS/Mycroft mediante `ovos-tts-plugin-phoonnx`.
- Latencia: RTF 0,038 en fp32 y 0,095 en int8 (tiempo de sintesis dividido por la duracion del audio); es decir, sintetizar 1 segundo de audio requiere aproximadamente 38 ms en fp32 y 95 ms en int8 en el hardware de referencia.

## Comparativa con modelos similares

| Modelo | Arquitectura | Idioma | Hablantes | Formato | Licencia | Notas |
|---|---|---|---|---|---|---|
| Phoonnx/vits-ro_ro-mihai-medium-espeak-v2 | VITS (Piper 1.5) | ro-RO | 1 | ONNX fp32/int8 | CC0 1.0 | Conversion de rhasspy/piper-voices |
| rhasspy/piper-voices `ro_RO-mihai-medium` | VITS (Piper 1.5) | ro-RO | 1 | Piper (ONNX original) | CC0 1.0 | Modelo upstream, sin cuantizacion int8 documentada |
| Phoonnx/vits-ro_ro-mihai-medium-espeak | VITS (Piper anterior) | ro-RO | 1 | ONNX | CC0 1.0 | Version previa con pesos antiguos, sustituida por v2 |

No se dispone de datos de benchmarks comparativos entre estas variantes en la informacion proporcionada. Otras voces rumanas de Piper no estan documentadas en la informacion disponible.

## Limitaciones y advertencias

- Modelo de un unico hablante: no permite cambiar de voz ni de genero sin reentrenar.
- Solo soporta rumano (ro-RO); no es multilingue.
- Depende de espeak-ng para la fonemizacion; con el port espyak algunos fonemas difieren y el modelo puede pronunciar mal ciertas palabras.
- WER de 0,150 en int8 frente a 0,100 en fp32: la cuantizacion introduce una perdida de calidad medible, aunque dentro del umbral aceptado por el autor.
- La evaluacion QA se realizo sobre solo 3 frases de FLORES-200 devtest, una muestra muy reducida que limita la confianza estadistica de los resultados.
- No se documentan los datos de entrenamiento (horas, composicion, hablantes de origen), lo que dificulta evaluar sesgos de pronunciacion o cobertura fonetica.
- Riesgo de alucinacion acustica: como todo modelo generativo, puede producir artefactos o prosodia incorrecta en textos con abreviaturas, numeros o palabras extranjeras no cubiertas por espeak-ng.
- La licencia CC0 1.0 permite uso comercial sin restricciones, pero se recomienda atribuir a Rhasspy como autor original del modelo.
- Requiere phoonnx 1.96.1a1 o posterior para mantener la puntuacion de clausula en la sintesis; versiones anteriores pueden ignorarla.
- No dispone de checkpoint de entrenamiento en el repositorio, solo de los grafos ONNX de inferencia.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Phoonnx/vits-ro_ro-mihai-medium-espeak-v2
- Modelo upstream (Rhasspy): https://huggingface.co/rhasspy/piper-voices/tree/e9c8a39444359388adaa94255becb37a5a2b8e51/ro/ro_RO/mihai/medium
- Repositorio phoonnx: https://github.com/TigreGotico/phoonnx
- TigreGotico: https://tigregotico.pt
- Dataset de voces upstream: https://github.com/OHF-Voice/voice-datasets
- Version anterior del modelo: https://huggingface.co/Phoonnx/vits-ro_ro-mihai-medium-espeak
