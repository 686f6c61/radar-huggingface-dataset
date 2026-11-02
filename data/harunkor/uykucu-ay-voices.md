# HARUNKOR/uykucu-ay-voices

## Resumen

Uykucu Ay Voices es un paquete de ficheros de voz en formato ONNX destinado a la aplicacion Android Uykucu Ay (AI Bedtime Storyteller – Offline), una aplicacion de cuentos infantiles que funciona sin conexion. No se trata de un modelo entrenado desde cero por el autor, sino de una recopilacion de dos modelos de sintesis de voz de terceros convertidos y empaquetados para su uso en movil mediante sherpa-onnx. El repositorio contiene un modelo turco (Drifting TTS de Vyvo) y un modelo aleman (Kokoro-82M con seis voces, de Godelaune/hexgrad).

El modelo turco se compone de un codificador de texto v3.2 y un vocoder Vocos v2, ambos exportados a fp16 ONNX para reducir el consumo en telefonos. El modelo aleman es una exportacion ONNX de Kokoro-82M con metadatos de sherpa-onnx y seis vectores de estilo empaquetados como hablantes 0 a 5. La relevancia de este repositorio es practica: ofrece artefactos listos para desplegar TTS offline en Android en turco y aleman, con licencias permisivas (CC BY 4.0 y Apache-2.0) y tamanos contenidos (0,4 GB en total).

El repositorio no incluye documentacion sobre arquitectura interna, datos de entrenamiento ni evaluaciones de calidad. Toda la informacion tecnica procede de los modelos de origen citados en la model card.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Dos pipelines TTS: Drifting TTS (codificador de texto v3.2 + vocoder Vocos v2) para turco; Kokoro-82M (ONNX) para aleman |
| Parametros totales | No disponible (Kokoro-82M: 82 millones; Drifting TTS: no disponible) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | FP16 (ONNX) en el codificador de texto y el vocoder turcos; el modelo aleman se distribuye como ONNX sin detallar cuantizacion |
| Idiomas soportados | Turco (tr) y aleman (de) |
| Licencia | Mixta: CC BY 4.0 (componente turco) y Apache-2.0 (componente aleman) |
| Formato de pesos | ONNX; vectores de estilo en `de-voices.bin`; configuracion en JSON |

## Arquitectura y entrenamiento

El paquete agrupa dos sistemas independientes. El componente turco, Drifting TTS de Vyvo, se distribuye como un codificador de texto v3.2 (`text_encoder_v32_fp16.onnx`, 31,8 MB) y un vocoder Vocos v2 en modo balanced (`vocos_v2_balanced_spec_fp16.onnx`, 27,1 MB), exportados a fp16 para inferencia en telefonos. El generador se descarga sin cambios del repositorio original de Vyvo; la unica modificacion es la exportacion a ONNX fp16. El fichero `drifting-voices.json` contiene la configuracion de voz de la aplicacion (identificadores de hablante y ritmo).

El componente aleman es una exportacion ONNX de Kokoro-82M, un modelo TTS de 82 millones de parametros, con metadatos de sherpa-onnx anadidos. Se empaquetan seis vectores de estilo en `de-voices.bin` como hablantes 0 a 5 (Hanna, Kerstin, Greta, Martin, Jonas y Felix), procedentes de Kokoro-82M v1.0 y de las voces alemanas de kikiri-tts (la datos de Kerstin son CC0). La pronunciacion se resuelve con espeak-ng (GPL-3.0), que sherpa-onnx distribuye por separado. No se documentan datos de entrenamiento, numero de tokens, composicion del corpus ni tecnicas de alineacion o RLHF en ninguna de las dos fuentes citadas.

## Capacidades

- Sintesis de voz (text-to-speech) offline en turco y aleman.
- Generacion de audio a partir de texto con multiples hablantes en aleman (seis voces: Hanna, Kerstin, Greta, Martin, Jonas, Felix).
- Configuracion de ritmo y seleccion de hablante mediante ficheros JSON (`drifting-voices.json`, `de-voices.json`).
- Ejecucion en dispositivos moviles mediante sherpa-onnx, sin dependencia de red.
- Conversion de texto a fonemas mediante espeak-ng para el modelo aleman.
- No dispone de clonacion de voz, control emocional, tool calling, razonamiento, vision ni capacidades multimodales.
- No se documentan capacidades de transliteracion, SSML ni control prosodico fino.

## Casos de uso

- Narracion de cuentos infantiles offline: la aplicacion Uykucu Ay usa estos ficheros para leer cuentos en turco y aleman sin conexion, seleccionando la voz adecuada por idioma y hablante.
- Lectura de textos en aleman con varias voces: con seis hablantes distintos se pueden asignar personajes diferentes en una misma narracion o audiolibro.
- Aplicaciones de accesibilidad en Android: lectura en voz alta de contenido para usuarios con discapacidad visual en turco o aleman, con inferencia local que evita enviar texto a servidores externos.
- Asistentes de voz embebidos en dispositivos de bajo consumo: el formato ONNX fp16 y el tamano reducido del componente turco (unos 59 MB entre codificador y vocoder) permiten ejecutarlo en telefonos de gama media.
- Prototipado de interfaces de voz en turco: el codificador de texto y el vocoder Vocos son piezas reutilizables para construir un pipeline TTS propio con sherpa-onnx.
- Aprendizaje de idiomas: reproduccion de frases en aleman con distintas voces para practicar comprension auditiva, con control de ritmo mediante la configuracion JSON.
- Generacion de avisos y notificaciones habladas en aplicaciones Android para usuarios turcos o alemanes, sin coste de API ni latencia de red.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; por el tamano de los artefactos (31,8 MB + 27,1 MB en turco; 325,5 MB en aleman) el consumo de memoria es reducido y apto para ejecucion en CPU.
- GPU recomendadas: no se especifican; el destino principal es CPU movil mediante sherpa-onnx. En escritorio puede ejecutarse en CPU sin GPU dedicada.
- Cabe en GPU de consumo: si, en cualquier GPU consumer actual, aunque no es el escenario previsto; tambien funciona en CPU.
- Opciones de despliegue: sherpa-onnx (principal), ONNX Runtime; no se documenta soporte para vLLM, TGI ni llama.cpp (no aplican a TTS).
- Latencia y throughput: no disponibles. El uso de fp16 y el tamano contenido sugieren inferencia en tiempo real en telefonos, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Idiomas | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Uykucu Ay Voices (este repo) | Kokoro-82M (82 M) + Drifting TTS (no disponible) | tr, de | ONNX | Mixta CC BY 4.0 / Apache-2.0 | Paquete para app Android, sin benchmarks |
| Kokoro-82M (hexgrad) | 82 M | Multiples (incluye aleman via voces derivadas) | PyTorch, ONNX | Apache-2.0 | Modelo base del componente aleman; mas voces y documentacion |
| Drifting TTS (Vyvo) | No disponible | Turco | No disponible en la informacion | CC BY 4.0 | Modelo base del componente turco; sin datos de rendimiento en esta ficha |
| Piper TTS | Variable por voz | Multiples | ONNX | GPL-3.0 en el motor | Alternativa ONNX para TTS offline; licencia mas restrictiva |

La comparacion se limita a los datos disponibles; no se han publicado metricas objetivas (MOS, WER, latencia) para este repositorio ni para sus componentes en la informacion proporcionada.

## Limitaciones y advertencias

- El repositorio no es un modelo original: es un repackaging de modelos de terceros; los cambios se limitan a exportacion ONNX fp16, metadatos de sherpa-onnx y empaquetado de voces.
- Solo cubre turco y aleman; no hay soporte para castellano ni otros idiomas.
- La licencia es mixta y depende del componente: CC BY 4.0 para el turco (requiere atribucion a Vyvo) y Apache-2.0 para el aleman (requiere conservar avisos). El uso comercial es posible, pero debe verificarse el cumplimiento de ambas licencias por separado.
- espeak-ng se distribuye bajo GPL-3.0 y se suministra por separado; su inclusion en un producto puede imponer obligaciones de licencia adicionales.
- No hay informacion sobre sesgos, calidad de pronunciacion, tasa de alucinacion fonetica ni robustez ante texto con numeros, siglas o puntuacion compleja.
- No se documentan evaluaciones subjetivas (MOS) ni objetivas (WER, latencia) que permitan valorar la calidad frente a alternativas.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, sin senales de validacion por parte de la comunidad.
- El modelo aleman depende de seis vectores de estilo empaquetados; la calidad y consistencia entre hablantes no esta documentada.
- Para produccion, conviene auditar los ficheros SHA-256 incluidos en la model card y verificar que coinciden con los artefactos descargados.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/HARUNKOR/uykucu-ay-voices
- Modelo turco de origen (Vyvo): https://huggingface.co/Vyvo/drifting-tts-tr
- Modelo aleman de origen (Godelaune): https://huggingface.co/Godelaune/Kokoro-82M-ONNX-German-Martin
- Modelo base Kokoro-82M (hexgrad): https://huggingface.co/hexgrad/Kokoro-82M
- sherpa-onnx (runtime): no se proporciona enlace en la informacion disponible
- espeak-ng: no se proporciona enlace en la informacion disponible
