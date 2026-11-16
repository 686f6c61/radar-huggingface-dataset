# Phoonnx/vits-es_es-mls_9972-low-espeak

## Resumen

`vits-es_es-mls_9972-low-espeak` es un modelo de sintesis de voz (text-to-speech) en espanol de Espana, empaquetado por Phoonnx a partir de la voz original de Rhasspy Piper (`rhasspy/piper-voices/es/es_ES/mls_9972/low`). El modelo emplea la arquitectura VITS, un sistema de sintesis neuronal de extremo a extremo que combina un encoder de texto, un prior variacional y un decodificador generativo basado en flujos normalizadores y un discriminador adversarial, y se distribuye en formato ONNX para su ejecucion en la libreria phoonnx.

La relevancia de este modelo reside en su caracter ligero (repositorio de 0,1 GB) y su integracion con el ecosistema OVOS/Mycroft mediante el plugin `ovos-tts-plugin-phoonnx`, lo que lo hace adecuado para asistentes de voz locales, sistemas embebidos y aplicaciones que requieren sintesis offline sin dependencia de servicios en la nube. La variante "low" indica una configuracion de calidad reducida orientada a minimizar latencia y consumo de recursos.

El modelo toma como entrada fonemas en alfabeto IPA generados por espeak-ng (o por el port espyak incluido en el extra `phoonnx[espeak]`) y produce audio WAV. Esta pensado exclusivamente para espanol de Espana (`es-ES`) y se publica bajo licencia MIT.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VITS (end-to-end TTS neuronal) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo TTS, entrada por frase) |
| Tipos de cuantizacion | no disponible (pesos en ONNX) |
| Idiomas soportados | espanol de Espana (`es-ES`) |
| Licencia | MIT |
| Formato de pesos | ONNX |
| Entrada de texto | Fonemas espeak en alfabeto IPA |
| Tamano del repositorio | 0,1 GB |
| Libreria de inferencia | phoonnx |
| Pipeline | text-to-speech |
| Autor original | Rhasspy (Piper) |
| Empaquetado por | Phoonnx |

## Arquitectura y entrenamiento

VITS es una arquitectura de sintesis de voz de extremo a extremo que integra en un unico modelo un encoder de texto condicionado por alineamiento monotono, un prior variacional, un decodificador generativo basado en flujos normalizadores inversos y un discriminador adversarial multiperiodo entrenado de forma conjunta. Este diseno permite generar audio de forma directa a partir de fonemas sin necesidad de un modelo acustico y un vocoder separados, reduciendo la latencia de inferencia.

El modelo deriva de la voz `mls_9972` del proyecto Piper de Rhasspy, que a su vez se entrena sobre el corpus MLS (Multilingual LibriSpeech) para espanol. La variante "low" corresponde a una configuracion de menor capacidad y calidad orientada a eficiencia. No se dispone en la informacion proporcionada de detalles sobre el numero exacto de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO (no aplicables habitualmente en TTS). La innovacion destacable es el empaquetado en ONNX para ejecucion ligera y su integracion con el front-end de normalizacion de texto `scriptconv`.

## Capacidades

- Sintesis de voz (text-to-speech) en espanol de Espana a partir de texto plano.
- Generacion de audio WAV mediante `voice.synthesize_wav(text, wav_file)`.
- Conversion de texto a fonemas IPA mediante espeak-ng o el port espyak.
- Normalizacion y conversion de texto de entrada mediante la libreria `scriptconv`.
- Integracion con asistentes de voz OVOS/Mycroft mediante `ovos-tts-plugin-phoonnx`.
- Ejecucion en navegador mediante `phoonnx.js` con entrada espeak o unicode.
- No soporta tool calling, agentes, vision, audio de entrada ni razonamiento multi-paso (es un modelo exclusivamente TTS).

## Casos de uso

- **Asistentes de voz locales (OVOS/Mycroft):** el modelo se integra como plugin TTS mediante la configuracion `ovos-tts-plugin-phoonnx` en `mycroft.conf`, permitiendo respuestas habladas en espanol sin conexion a internet y con un repositorio de solo 0,1 GB.
- **Sintesis offline en dispositivos embebidos:** gracias a su tamano reducido y formato ONNX, puede desplegarse en Raspberry Pi u otros dispositivos de recursos limitados para generar avisos y locuciones en espanol.
- **Lectura de textos y accesibilidad:** conversion de articulos, notificaciones o contenido web a audio para lectores de pantalla y aplicaciones de accesibilidad en espanol de Espana.
- **Generacion de locuciones para contenido multimedia:** produccion de narraciones para videos, podcasts o audiolibros en espanol con un pipeline Python sencillo basado en `TTSModelManager`.
- **Sistemas de megafonia y avisos automatizados:** generacion dinamica de mensajes hablados en estaciones, comercios o edificios inteligentes a partir de plantillas de texto.
- **Prototipado rapido de interfaces conversacionales:** validacion de flujos de voz en aplicaciones de domotica o atencion al cliente antes de migrar a soluciones de mayor calidad, aprovechando la instalacion via `pip install --pre phoonnx`.
- **Sintesis en el navegador:** uso de `phoonnx.js` para generar voz en aplicaciones web sin backend, con demo disponible en tigregotico.pt/demo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- **VRAM estimada:** no disponible; el repositorio ocupa 0,1 GB, por lo que el modelo es muy ligero y probablemente puede ejecutarse en CPU sin GPU dedicada.
- **GPU recomendadas:** no disponible; por su tamano, cualquier GPU consumer moderna (por ejemplo, RTX 3060 o superior) seria mas que suficiente, aunque no se especifica.
- **Compatibilidad con GPU consumer:** si, previsiblemente en cualquier GPU consumer e incluso en CPU, dado el tamano del modelo.
- **Opciones de despliegue:** libreria `phoonnx` (Python), plugin `ovos-tts-plugin-phoonnx` para OVOS/Mycroft, y `phoonnx.js` para navegador. No se mencionan vLLM, llama.cpp, Ollama ni TGI (no aplicables a TTS VITS).
- **Latencia y throughput:** no disponibles.

## Comparativa con modelos similares

| Modelo | Arquitectura | Idiomas | Licencia | Formato | Tamano | Notas |
|---|---|---|---|---|---|---|
| vits-es_es-mls_9972-low-espeak (este modelo) | VITS | es-ES | MIT | ONNX | 0,1 GB | Empaquetado por Phoonnx, variante low |
| rhasspy/piper-voices es_ES/mls_9972/low | VITS | es-ES | MIT | ONNX (Piper) | no disponible | Modelo upstream original de Rhasspy |
| Otras voces VITS de la coleccion Phoonnx | VITS | varios | MIT (segun upstream) | ONNX | variable | Coleccion de modelos VITS empaquetados para phoonnx |

No se dispone de datos de rendimiento comparativo (benchmarks) entre estas alternativas en la informacion proporcionada.

## Limitaciones y advertencias

- **Idioma unico:** solo soporta espanol de Espana (`es-ES`); no esta pensado para otros idiomas ni variantes dialectales.
- **Calidad reducida:** la variante "low" prioriza eficiencia sobre calidad, por lo que la naturalidad y fidelidad de la voz pueden ser inferiores a variantes de mayor capacidad.
- **Dependencia de espeak-ng:** requiere espeak-ng instalado; con el port espyak algunos fonemas difieren y el modelo puede pronunciar mal ciertas palabras, segun advierte el autor.
- **Riesgo de alucinacion acustica:** como todo modelo TTS, puede generar pronunciaciones incorrectas o artefactos ante texto no normalizado o fuera de dominio.
- **Sesgos:** no se documentan sesgos especificos en la informacion disponible; al derivar de MLS, podria reflejar las caracteristicas del corpus de origen.
- **Licencia:** MIT, lo que permite uso comercial, pero se recomienda verificar la licencia del modelo upstream de Rhasspy.
- **Madurez:** modelo con muy pocas descargas (20) y sin likes, publicado recientemente; no hay evidencia de uso en produccion a gran escala.
- **Sin soporte de contexto largo:** al ser un modelo TTS, procesa frases, no documentos extensos.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/Phoonnx/vits-es_es-mls_9972-low-espeak)
- [Modelo upstream de Rhasspy (Piper)](https://huggingface.co/rhasspy/piper-voices/tree/main/es/es_ES/mls_9972/low)
- [Repositorio phoonnx](https://github.com/TigreGotico/phoonnx)
- [Repositorio scriptconv](https://github.com/TigreGotico/scriptconv)
- [Repositorio phoonnx.js](https://github.com/TigreGotico/phoonnx.js)
- [Demo en navegador](https://tigregotico.pt/demo)
- [Coleccion de modelos VITS de Phoonnx](https://huggingface.co/collections/Phoonnx/vits-6af8ea9ae9adb8b94ec31a65)
