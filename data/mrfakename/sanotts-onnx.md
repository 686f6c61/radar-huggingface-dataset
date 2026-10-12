# mrfakename/sanoTTS-ONNX

## Resumen

sanoTTS-ONNX es una exportacion a formato ONNX de las voces piperlite del modelo de sintesis de voz ampixa/sanoTTS, publicada por el usuario mrfakename. Su proposito es permitir la inferencia de texto a voz con onnxruntime en entornos de servidor y, de forma destacada, directamente en el navegador mediante onnxruntime-web con aceleracion WebGPU. No se trata de un modelo nuevo entrenado desde cero, sino de una conversion de pesos orientada a portabilidad y despliegue ligero.

El repositorio incluye 22 voces que cubren 13 idiomas (ingles, hindi, nepali, vietnamita, indonesio, aleman, frances, espanol, italiano, portugues, checo, rumano y turco), con variantes `-tiny` de aproximadamente 0,5 millones de parametros para la mayoria de ellas. Cada voz se distribuye como dos grafos ONNX separados: un predictor de duracion y un modelo acustico que agrupa adaptador de salida, decodificador y post-filtro. La frecuencia de muestreo del audio generado es de 22050 Hz.

Su relevancia actual reside en el nicho de TTS ejecutable en el cliente: al estar empaquetado en ONNX y validado contra el runtime de referencia con correlacion de audio de 1.000000 en las 22 voces, ofrece una via reproducible para integrar sintesis de voz en aplicaciones web sin depender de APIs externas. La licencia GPL-3.0, heredada del modelo fuente, condiciona su uso en productos propietarios.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | TTS no autorregresivo de la familia piperlite; dos grafos ONNX por voz (predictor de duracion y modelo acustico con adaptador de salida, decodificador y post-filtro) |
| Parametros totales | No disponible para las voces completas; las variantes `-tiny` declaran aproximadamente 0,5 M de parametros |
| Parametros activos | No aplica (no es un modelo de mezcla de expertos) |
| Longitud de contexto | No aplica en el sentido de LLM; la entrada es una secuencia de ids foneticos de longitud N |
| Tipos de cuantizacion | Exportacion en fp32 con opset 17; no se documentan variantes cuantizadas en la informacion disponible |
| Idiomas soportados | 13: en, hi, ne, vi, id, de, fr, es, it, pt, cs, ro, tr |
| Licencia | GPL-3.0 |
| Formato de pesos | ONNX (compatible con onnxruntime y onnxruntime-web con WebGPU) |
| Numero de voces | 22 (incluye variantes `-tiny` de la mayoria de idiomas) |
| Frecuencia de muestreo | 22050 Hz |
| Modelo base | ampixa/sanoTTS |

## Arquitectura y entrenamiento

La informacion disponible no describe el proceso de entrenamiento del modelo original (numero de tokens, composicion del dataset, fases de RLHF o DPO), por lo que esos datos deben considerarse no disponibles. Lo que si se detalla es la topologia de inferencia exportada. Cada voz contiene un grafo `duration.onnx` que recibe `ids [1,N]` en int64 y `feats [1,3,N]` en float32 y produce `log_duration [1,N]`; y un grafo `synth.onnx` que recibe `ids [1,N]`, `tok_feats [1,2,N]`, `frame2tok [T]` en int64 y `frame_feats [1,3,T]`, y devuelve `audio [1,T*256]`. Este segundo grafo integra en una sola unidad el modelo acustico, el adaptador de salida, el decodificador y el post-filtro.

La construccion de caracteristicas y la regla de duracion siguen el paquete `sanotts.models`: `clip(round(max(exp(ld),1) * length_scale), 1, max_duration)`. Los ids fuera del vocabulario de una voz se mapean al id 59 (schwa), replicando el comportamiento del runtime original. El fichero `config.json` de cada voz especifica la voz de espeak-ng, la frecuencia de muestreo, el `length_scale` por defecto, los tamanos de vocabulario y el `phoneme_id_map` de Piper. La validacion de paridad frente al runtime numpy de referencia reporta duraciones identicas y una correlacion de audio de 1.000000 en las 22 voces, con opset 17 y precision fp32.

## Capacidades

- Sintesis de voz a partir de texto en 13 idiomas: ingles, hindi, nepali, vietnamita, indonesio, aleman, frances, espanol, italiano, portugues, checo, rumano y turco.
- Multiples voces por idioma: en ingles se ofrecen las voces amy, kristin y hfc; para el resto de idiomas se distribuye una voz por lengua, mas variantes `-tiny` de bajo coste computacional.
- Control de la duracion de los fonemas mediante el parametro `length_scale`, que permite ajustar la velocidad del habla.
- Conversion de texto a fonemas mediante espeak-ng, con el mapa `phoneme_id_map` incluido en la configuracion de cada voz.
- Ejecucion en navegador con onnxruntime-web y backend WebGPU, ademas de inferencia nativa con onnxruntime.
- No se documentan capacidades de clonacion de voz, control emocional, tool calling ni razonamiento multi-paso; son funciones ajenas al alcance de este modelo.

## Casos de uso

- Lectura por voz de articulos en una web: el modelo puede sintetizar el texto de una noticia o entrada de blog directamente en el navegador con WebGPU, evitando enviar el contenido a un servicio externo y reduciendo la latencia percibida.
- Accesibilidad para personas con discapacidad visual: integrado en una extension o aplicacion de escritorio mediante onnxruntime, permite convertir contenido dinamico en audio en tiempo real sin conexion permanente a internet.
- Asistentes de voz embebidos en aplicaciones de escritorio: al ejecutarse en CPU con voces `-tiny` de aproximadamente 0,5 M de parametros, encaja en herramientas ligeras que necesitan respuestas habladas sin depender de la nube.
- Generacion de avisos sonoros localizados: con soporte para 13 idiomas, resulta util para sistemas de transporte, comercio o teleasistencia que deben emitir mensajes hablados en la lengua del usuario.
- Prototipado rapido de interfaces conversacionales: el Space de demostracion y la API ONNX permiten validar flujos de voz en pocas horas antes de comprometerse con un proveedor comercial de TTS.
- Doctools o audiolibros de bajo coste: la conversion por lotes de texto a audio con onnxruntime sobre CPU es viable para volumenes moderados sin GPU dedicada.
- Pruebas de internacionalizacion de productos de voz: permite comparar la calidad percibida de un mismo texto en 13 idiomas antes de decidir que mercados requieren una voz neuronal de mayor calidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El unico dato cuantitativo reportado por el autor es la validacion de paridad frente al runtime numpy de referencia:

| Prueba | Resultado | Condiciones |
|---|---|---|
| Paridad de duraciones | Identica en las 22 voces | Opset 17, fp32 |
| Correlacion de audio | 1.000000 en las 22 voces | Opset 17, fp32 |

No hay datos publicos de MOS, WER, RTF ni comparaciones con otros sistemas TTS en la informacion proporcionada.

## Requisitos de hardware

- VRAM estimada: no disponible. El recuento de parametros de las voces completas no se especifica en la informacion proporcionada, por lo que no es posible calcularla con rigor.
- Voces `-tiny`: con aproximadamente 0,5 millones de parametros, son aptas para inferencia en CPU convencional y en navegador mediante onnxruntime-web con backend wasm o WebGPU.
- GPU recomendadas: no disponible. No se documentan GPU objetivo ni requisitos minimos de aceleracion.
- Cabeza en GPU de consumo: no confirmado en la informacion disponible; dado el caracter ligero de la familia piperlite es plausible, pero el repositorio no lo certifica.
- Opciones de despliegue: onnxruntime (Python, C++, C#, Java y otros enlaces oficiales), onnxruntime-web con WebGPU, y el Space de demostracion `mrfakename/sanotts-webgpu` en HuggingFace.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Idiomas | Licencia | Formato | Ejecucion en navegador |
|---|---|---|---|---|---|
| sanoTTS-ONNX | No disponible (variantes `-tiny` ~0,5 M) | 13 | GPL-3.0 | ONNX | Si (onnxruntime-web + WebGPU) |
| Piper (rhasspy/piper) | No disponible en la informacion consultada | No disponible en la informacion consultada | MIT | ONNX | No confirmado |
| Kokoro-82M | 82 M | No disponible en la informacion consultada | Apache-2.0 | safetensors y ONNX | No confirmado |

Los datos de Piper y Kokoro-82M proceden del conocimiento general de esos proyectos y no de la informacion proporcionada en esta busqueda; los campos no verificados se marcan como no disponibles. La diferencia mas relevante de sanoTTS-ONNX frente a Piper es la licencia: GPL-3.0 frente a MIT, lo que restringe su incorporacion en productos propietarios.

## Limitaciones y advertencias

- Licencia GPL-3.0: cualquier distribucion de un producto que incorpore el modelo obliga a liberar el codigo bajo la misma licencia. Es un obstaculo serio para uso comercial en software propietario.
- La calidad de sintesis, la naturalidad y la presencia de artefactos no estan documentadas con metricas objetivas ni valoraciones subjetivas.
- Riesgo de pronunciacion incorrecta en palabras fuera del vocabulario fonetico o en textos con abundantes prestamos, siglas o cifras, ya que la conversion depende de espeak-ng.
- Cobertura desigual por idioma: el ingles dispone de tres voces, mientras que el resto de lenguas cuenta con una sola voz principal, lo que limita la variedad de timbres.
- Los ids fuera del vocabulario se mapean a schwa (id 59), lo que puede degradar la pronunciacion de caracteres no contemplados.
- No se documentan sesgos de generacion por acento, genero o variedad dialectal, ni mecanismos de filtrado o moderacion del texto de entrada.
- La fecha de creacion del repositorio es el 11 de octubre de 2026, con cero descargas y cero likes en el momento de la consulta, por lo que no existe evidencia de uso en produccion ni comunidad de soporte.
- Al depender del modelo base ampixa/sanoTTS, cualquier limitacion no documentada de este ultimo se hereda en la exportacion.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/mrfakename/sanoTTS-ONNX
- Modelo base: https://huggingface.co/ampixa/sanoTTS
- Demo WebGPU: https://huggingface.co/spaces/mrfakename/sanotts-webgpu
- Documentacion de onnxruntime-web: https://onnxruntime.ai/docs/tutorials/web/
- espeak-ng: https://github.com/espeak-ng/espeak-ng
- Resultados de busqueda web adicionales: no se han encontrado enlaces relevantes; los resultados devueltos corresponden a un portal de videojuegos sin relacion con el modelo.
