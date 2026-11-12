# aung7090/nara-mini-v1

## Resumen

Nara Mini v1 es un modelo de síntesis de voz (text-to-speech) basado en Kokoro, adaptado para birmano (`my`) e inglés (`en`). Lo desarrolla el autor independiente aung7090 bajo el paraguas del proyecto Nara Audio y se distribuye con licencia Apache 2.0. El modelo incorpora cuatro voces predefinidas (Shoon, Thazin, Ko Banyar y Htet Myat) y está pensado para inferencia local, tanto en escritorio como en dispositivos móviles.

La arquitectura sigue el diseño de Kokoro: un codificador de texto con representaciones tipo BERT, un predictor de duración y un decodificador que genera audio a 24 kHz mono. Cada voz dispone de su propia red y su propio voicepack con vocabulario y vectores de estilo. El repositorio ocupa 2,8 GB e incluye pesos en `safetensors` de precisión completa y exportaciones ONNX optimizadas para móvil con decodificador cuantizado a INT8.

Su relevancia radica en cubrir una carencia notable: el soporte TTS de calidad para birmano es escaso en el ecosistema open source. Nara Mini v1 ofrece reglas de pronunciación birmanas, léxico de excepciones, normalización de números y fonemización inglesa mediante Misaki y eSpeak, todo empaquetado para ejecución en CPU y en la aplicación Nara.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Kokoro (encoder de texto tipo BERT, predictor de duracion, decodificador de audio) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (procesa pasajes largos en fragmentos) |
| Tipos de cuantizacion | FP (safetensors de precision completa) e INT8 selectivo en el decodificador de la exportacion ONNX movil |
| Idiomas soportados | Birmano (`my`) e ingles (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors y ONNX; paquetes `.nara` para la app Nara |
| Frecuencia de muestreo de salida | 24 kHz mono |
| Voces predefinidas | 4 (shoon, thazin, ko-banyar, htet-myat) |
| Tamano del repositorio | 2,8 GB |

## Arquitectura y entrenamiento

El modelo parte del checkpoint base Kokoro, un TTS ligero de arquitectura estilo StyleTTS con modulos `bert`, `bert_encoder`, `predictor`, `text_encoder` y `decoder`, segun los nombres de claves de los tensores en `weights/<voice>/model.safetensors`. Cada una de las cuatro voces emplea su propia red y su voicepack correspondiente, que aporta el vocabulario, los vectores de estilo y los centros de bins de longitud en `onnx/<voice>/voice.json`. La configuracion arquitectonica se recoge en `config.json`.

No se detalla en la documentacion disponible el volumen de datos de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO; esos datos no estan disponibles. Si se indica que las cuatro voces se desarrollaron a partir de habla sintetica generada con VoxCPM2 y que la version exacta del checkpoint inicial de Kokoro no quedo registrada en la documentacion de la release. El procesamiento de texto incorpora reglas de pronunciacion birmanas, un lexico de excepciones, fonemizacion inglesa con Misaki (que depende de eSpeak) y normalizacion de numeros birmanos a palabras habladas antes de la fonemizacion.

## Capacidades

- Sintesis de voz (text-to-speech) en birmano e ingles con cuatro voces predefinidas.
- Salida de audio a 24 kHz mono.
- Normalizacion de numeros en birmano, incluida la conversion de expresiones numericas a palabras habladas.
- Fonemizacion inglesa mediante Misaki y eSpeak.
- Procesamiento de texto mixto birmano-ingles con reglas de pronunciacion propias.
- Inferencia local en CPU mediante ONNX, con control del numero de hilos (`--threads`).
- Exportacion movil con encoder de precision completa y decodificador INT8 selectivo.
- Empaquetado en formato `.nara` con sumas de verificacion para instalacion en la app Nara.
- No se documentan capacidades de tool calling, agentes, vision, audio de entrada ni modo de razonamiento.

## Casos de uso

- Accesibilidad y lectura de pantalla en birmano: el modelo convierte texto en voz con pronunciacion nativa, lo que permite integrarlo en lectores de pantalla o aplicaciones de accesibilidad para usuarios birmanos, un idioma con escaso soporte TTS.
- Asistentes de voz locales sin conexion: al ejecutarse en CPU mediante ONNX, puede desplegarse en equipos sin GPU o en entornos con requisitos de privacidad, generando respuestas habladas sin enviar texto a servicios externos.
- Aplicaciones moviles de sintesis: el paquete `.nara` con decodificador INT8 esta disenado para instalarse en la app Nara, lo que facilita integrar TTS en dispositivos moviles con recursos limitados.
- Localizacion de contenido audiovisual: generacion de pistas de voz en birmano e ingles para videos, cursos o audiolibros, seleccionando entre las cuatro voces segun el registro del contenido.
- Prototipado de interfaces conversacionales: desarrolladores que necesiten un TTS bilingue para probar asistentes o chatbots pueden usar el script `synthesize.py` con salida WAV para iterar rapidamente.
- Investigacion en TTS de bajos recursos: el modelo sirve como base para estudiar adaptaciones de Kokoro a idiomas con pocos recursos, dado que expone pesos completos, configuracion y metadatos de voz.
- Normalizacion de numeros en textos mixtos: util en sistemas que leen direcciones, precios o fechas en birmano, donde la conversion correcta de cifras a palabras es critica para la inteligibilidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas objetivas como MOS, WER ni comparaciones cuantitativas con otros sistemas TTS.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El ejemplo oficial ejecuta el encoder y el decodificador ONNX en CPU, por lo que no requiere GPU.
- GPU recomendadas: no se especifican. Al ser un modelo derivado de Kokoro (82M parametros en su version base, aunque el tamano de Nara Mini v1 no se confirma), es viable en GPU consumer, pero no hay datos oficiales.
- Cabe en GPU consumer: previsiblemente si, dado el caracter ligero de la familia Kokoro, aunque no se confirma el numero de parametros de este modelo.
- Opciones de despliegue: ONNX Runtime en CPU (flujo documentado con `synthesize.py`), paquetes `.nara` para la app Nara y pesos `safetensors` para inferencia en PyTorch. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a un modelo TTS.
- Latencia y throughput: no disponibles. La model card indica que el rendimiento depende del hardware, el formato de exportacion y la longitud del pasaje, y que los textos largos se procesan en fragmentos.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Idiomas | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| Nara Mini v1 | TTS Kokoro adaptado | no disponible | my, en | Apache 2.0 | safetensors, ONNX | 4 voces, inferencia CPU/movil |
| Kokoro-82M | TTS | 82M | multiple (incluye en) | Apache 2.0 | safetensors, ONNX | Modelo base; sin soporte nativo de birmano documentado |
| VoxCPM2 | TTS | no disponible | no disponible | no disponible | no disponible | Usado para generar el habla sintetica de las voces de Nara Mini v1 |

La comparacion con alternativas especificas de TTS en birmano no esta disponible en la informacion proporcionada. Kokoro-82M es el referente directo por ser la base del modelo, y VoxCPM2 aparece unicamente como generador del habla sintetica empleada en el desarrollo de las voces.

## Limitaciones y advertencias

- La pronunciacion y la prosodia pueden variar segun el texto y la mezcla de idiomas; no se garantiza consistencia en textos mixtos.
- La normalizacion de numeros sigue reglas de lectura birmanas incluso en texto en ingles, lo que puede producir lecturas inesperadas en contextos mixtos.
- Los pasajes largos se procesan en fragmentos, lo que puede introducir discontinuidades en la prosodia entre segmentos.
- El rendimiento depende del hardware, del formato de exportacion y de la longitud del pasaje; no hay metricas publicadas que permitan estimar calidad objetiva.
- No se documentan sesgos especificos, pero al ser un modelo entrenado con habla sintetica generada por VoxCPM2, puede heredar artefactos de ese proceso.
- Riesgo de alucinacion no aplica en el sentido habitual de generacion de texto, pero si puede haber errores de pronunciacion o entonacion en palabras fuera del lexico.
- La licencia Apache 2.0 permite uso comercial, pero las dependencias (Misaki y eSpeak) conservan sus propias licencias, que deben revisarse por separado.
- La version exacta del checkpoint base de Kokoro no esta registrada, lo que dificulta la reproducibilidad del entrenamiento.
- El modelo no incluye funcionalidades de agente, tool calling ni comprension de audio.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/aung7090/nara-mini-v1
- Web de Nara Audio: https://naraaudio.app
- Kokoro-82M (modelo base): https://huggingface.co/hexgrad/Kokoro-82M
- VoxCPM2 (generador del habla sintetica): https://huggingface.co/openbmb/VoxCPM2
