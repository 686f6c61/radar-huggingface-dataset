# litert-community/Kokoro-82M-litert-lm

## Resumen

Kokoro-82M-litert-lm es un paquete del modelo de síntesis de voz hexgrad/Kokoro-82M preparado por la comunidad litert-community para ejecutarse íntegramente en dispositivo mediante LiteRT-LM, el runtime de inferencia on-device de código abierto de Google. El modelo base es un sistema de texto a voz de 82 millones de parámetros con arquitectura StyleTTS 2 más ISTFTNet, y esta versión lo empaqueta en un único fichero `.litertlm` que contiene el modelo acústico y el vocoder cuantizados a INT8, las 54 voces de Kokoro v1.0 y los front-ends de texto (normalización y conversión grafema-fonema) para 9 idiomas o variantes dialectales.

El problema que resuelve es la dependencia de infraestructura externa en TTS: la versión original requiere Python, `espeak-ng` y, en la práctica, un servidor. Este bundle elimina esas dependencias, de modo que todo el stack queda bajo licencia Apache-2.0 y funciona sin red. Genera audio mono a 24 kHz y, según el autor, sintetiza voz entre 4 y 5 veces más rápido que el tiempo real en la GPU de un Galaxy S26, con un pico de memoria de aproximadamente 0,5 GB.

Su relevancia actual está en el despliegue de voz en el borde: aplicaciones Android, dispositivos empotrados y portátiles pueden incorporar TTS multilingüe de calidad cercana al servidor sin llamadas a API. El repositorio se publica con licencia Apache-2.0, con dos ficheros de 351 MB cada uno (variante GPU y variante CPU/GPU), y no presenta descargas ni valoraciones en el momento de redactar esta ficha.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | StyleTTS 2 + ISTFTNet (modelo acústico + vocoder) |
| Parametros totales | 82 millones |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica (modelo de texto a voz); no disponible en la informacion proporcionada |
| Tipos de cuantizacion | INT8 (modelo acustico y vocoder) |
| Idiomas soportados | Ingles americano, ingles britanico, espanol, frances, italiano, portugues de Brasil, hindi, chino mandarin y japones (8 codigos de idioma, 9 variantes) |
| Licencia | Apache-2.0 |
| Formato de pesos | `.litertlm` (bundle de LiteRT-LM, variantes `kokoro_int8_gpu.litertlm` y `kokoro_int8.litertlm`) |
| Tamano de cada fichero | 351 MB |
| Tamano del repositorio | 0,7 GB |
| Frecuencia de muestreo de salida | 24 kHz mono (WAV) |
| Voces incluidas | 54 voces de Kokoro v1.0 |
| Runtime | LiteRT-LM (omni_runner, API C++ OmniEngine / OmniSession) |
| Modelo base | hexgrad/Kokoro-82M (relacion: quantized) |

## Arquitectura y entrenamiento

La arquitectura es la del modelo base hexgrad/Kokoro-82M, descrita por el autor del bundle como StyleTTS 2 más ISTFTNet. StyleTTS 2 es una familia de TTS con difusión de estilo y entrenamiento adversario, y ISTFTNet actúa como vocoder neuronal que convierte las representaciones acústicas en forma de onda. El bundle separa ambos componentes: el modelo acústico y el vocoder, los dos cuantizados a INT8.

Sobre el entrenamiento no se aporta información en la documentación disponible: no se indican el número de tokens de audio, la composición del dataset, ni si hubo etapas de ajuste con preferencias humanas. Tampoco se detallan las recetas de cuantización más allá de la distinción entre las dos variantes. La innovación técnica destacable de este paquete no está en el entrenamiento, sino en el empaquetado y la optimización para inferencia: normalización de texto y conversión grafema-fonema autocontenidas para 9 idiomas (sin `espeak-ng` ni Python), y un vocoder con convoluciones en INT8 con activaciones en coma flotante que el delegado GPU de LiteRT ejecuta de forma nativa en OpenCL, WebGPU y Metal. La variante GPU está etiquetada para que el vocoder se ejecute siempre en GPU y no degrade silenciosamente a CPU, mientras que la variante CPU/GPU incorpora operaciones explícitas de desquantización para que XNNPACK produzca audio limpio en CPU a costa de más memoria. La model card referencia los identificadores arXiv 2306.07691 y 2203.02395 en sus etiquetas, aunque el contenido citado se interrumpe en la sección de idiomas y voces.

## Capacidades

- Síntesis de voz a partir de texto con salida de audio mono a 24 kHz, con calidad descrita por el autor como igual o superior a la del Kokoro original ejecutado en servidor en una prueba de inteligibilidad de 800 frases y 8 idiomas.
- Multilingüe: ingles americano y britanico, espanol, frances, italiano, portugues de Brasil, hindi, chino mandarin y japones, con conmutacion mediante los parametros `--language` y `--voice`.
- 54 voces de Kokoro v1.0 incluidas en el mismo fichero, seleccionables por identificador (por ejemplo `af_heart` para ingles, `jf_alpha` para japones).
- Front-end de texto autocontenido: normalizacion de texto y conversion grafema-fonema integradas, sin dependencia de `espeak-ng` ni de componentes Python.
- Ejecucion totalmente on-device y offline: no requiere red ni servicios externos.
- Inferencia en GPU o CPU segun la variante del fichero y el backend seleccionado (`--backend=gpu`).
- API de streaming en C++ mediante `OmniEngine`, `OmniSession` y `PushInputSource`, con salida por fragmentos de audio (`AudioOutput`) consumidos con `ProcessNext()` y cerrados con `Flush()`.
- No es un modelo de lenguaje: no soporta tool calling, function calling, agentes, razonamiento multi-paso ni generacion de texto mas alla de la normalizacion interna necesaria para la sintesis.

## Casos de uso

- Lectura por voz en aplicaciones Android sin conexion: el bundle se carga desde el almacenamiento local y sintetiza con el delegado GPU, de modo que la aplicacion puede leer notificaciones, articulos o mensajes sin enviar texto a un servidor y sin coste por peticion.
- Accesibilidad para personas con discapacidad visual o dislexia: un lector de pantalla puede integrar el motor mediante la API C++ de streaming y ofrecer voz multilingue con una latencia baja y un pico de memoria de unos 0,5 GB en la variante GPU.
- Generacion por lotes de audiolibros y contenido editorial en servidor: la variante CPU/GPU no necesita GPU y acepta la misma entrada de texto, lo que permite procesar corpus largos en pipelines de CI o en maquinas sin acelerador.
- Asistentes de voz y navegacion manos libres en automocion o dispositivos empotrados: al no depender de la red, la sintesis sigue funcionando en zonas sin cobertura, y la latencia de 4 a 5 veces por debajo del tiempo real es suficiente para respuestas conversacionales.
- Interfaces conversacionales en el borde combinadas con un LLM local: la cadena completa texto a texto mas texto a voz se ejecuta en el mismo dispositivo, lo que evita exponer transcripciones o respuestas a servicios externos.
- Localizacion multilingue de contenido: un mismo pipeline puede generar la misma locucion en ingles, espanol, frances, italiano, portugues, hindi, chino mandarin y japones cambiando los parametros de idioma y voz, sin instalar voces adicionales.
- Pruebas automatizadas de productos con audio: en CI se puede usar la variante CPU para generar muestras de referencia y comparar regresiones de audio entre versiones del modelo sin depender de hardware grafico.
- Kioscos, terminales de punto de venta y dispositivos sanitarios con requisitos de privacidad: la sintesis local evita transmitir datos personales y cumple escenarios en los que no hay conectividad gestionada.

## Benchmarks y rendimiento

La informacion disponible no incluye cifras numericas de benchmarks estandar como MMLU o HumanEval, que no aplican a un modelo de texto a voz. El unico dato de evaluacion publicado es cualitativo y comparativo con la version original en servidor:

| Prueba | Resultado reportado | Detalle |
|---|---|---|
| Inteligibilidad, 800 frases y 8 idiomas | Iguala o supera al Kokoro original en servidor | Sin cifras concretas en la informacion disponible |
| Velocidad de sintesis | 4 a 5 veces mas rapido que el tiempo real | Medido en la GPU de un Galaxy S26 |
| Memoria pico | Aproximadamente 0,5 GB | Variante GPU (`kokoro_int8_gpu.litertlm`) |
| Memoria pico | Aproximadamente 1 GB o mas | Variante CPU/GPU (`kokoro_int8.litertlm`) |

No se han publicado resultados de benchmarks numericos adicionales en la informacion disponible.

## Requisitos de hardware

- Variante GPU (`kokoro_int8_gpu.litertlm`): 351 MB en disco y un pico de memoria de unos 0,5 GB. Requiere un dispositivo con GPU soportada por el delegado GPU de LiteRT (OpenCL, WebGPU o Metal): telefonos, tabletas y portatiles.
- Variante CPU/GPU (`kokoro_int8.litertlm`): 351 MB en disco y un pico de memoria de 1 GB o mas. Pensada para equipos sin GPU utilizable, como servidores, entornos de CI o hardware antiguo.
- Modelos de GPU concretos: no disponibles en la informacion proporcionada. El unico dispositivo citado explicitamente es un Galaxy S26.
- Cabe en hardware de consumo: si, segun el autor, en telefonos y portatiles con GPU compatible; no se detallan requisitos minimos de CPU ni de memoria del sistema.
- Opciones de despliegue: LiteRT-LM mediante `omni_runner` (compilado con Bazel, con configuracion especifica para Android arm64 y Android NDK) y la API C++ `OmniEngine` / `OmniSession`. No se mencionan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a este runtime.
- Latencia y throughput: 4 a 5 veces mas rapido que el tiempo real en la GPU de un Galaxy S26. La primera ejecucion en GPU compila kernels y es mas lenta; los kernels se cachean en el directorio indicado por `--cache_dir` y las ejecuciones posteriores arrancan mas rapido.
- Nota operativa: la variante GPU no degrada a CPU de forma automatica, por lo que en un dispositivo sin GPU compatible hay que usar la variante CPU/GPU.

## Comparativa con modelos similares

La informacion proporcionada solo permite comparar con el modelo base, ya que no se aportan datos de otras alternativas de TTS on-device.

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Kokoro-82M-litert-lm (este modelo) | 82 M | No aplica | Iguala o supera al Kokoro original en servidor; 4-5x tiempo real en Galaxy S26; ~0,5 GB pico en GPU | Apache-2.0 | Bundle `.litertlm` para LiteRT-LM; 0 descargas y 0 likes en el momento de la consulta |
| hexgrad/Kokoro-82M (modelo base) | 82 M | No aplica | Referencia de comparacion; requiere Python, `espeak-ng` y, en la practica, servidor | Apache-2.0 (segun lo indicado por el autor del bundle) | Disponible en HuggingFace; no se detallan formatos ni variantes de cuantizacion en la informacion proporcionada |
| Otras alternativas de TTS on-device | No disponible | No disponible | No disponible | No disponible | No disponible en la informacion proporcionada |

## Limitaciones y advertencias

- No se publican cifras numericas de evaluacion mas alla de la comparacion cualitativa con el Kokoro original, por lo que no es posible verificar la calidad de forma independiente con los datos disponibles.
- La model card incluida en la informacion esta truncada en la seccion de idiomas y voces: no se dispone del listado completo de identificadores de voz ni de las combinaciones recomendadas de idioma y voz.
- El repositorio muestra 0 descargas y 0 likes en la fecha de consulta, lo que indica una adopcion temprana o muy limitada y poca validacion por parte de terceros.
- Dependencia fuerte del runtime: requiere LiteRT-LM y, en la variante GPU, un delegado GPU compatible. La variante GPU esta etiquetada para no ejecutarse en CPU, de modo que un fallo de compatibilidad impide la sintesis en lugar de degradar el rendimiento.
- Sesgos conocidos del modelo base: no se documentan en la informacion proporcionada. En TTS, los sesgos se manifiestan tipicamente en acentos, prosodia y calidad desigual entre idiomas y voces, pero no hay datos concretos para este bundle.
- Riesgo de errores de pronunciacion y de artefactos acusticos: al depender de la normalizacion de texto y de la conversion grafema-fonema, los textos con abreviaturas, cifras, nombres propios o mezclas de idiomas pueden sintetizarse de forma incorrecta.
- Cobertura limitada a 8 idiomas (9 variantes): no hay soporte documentado para otras lenguas, y no se detalla la calidad relativa entre ellas.
- Licencia Apache-2.0, que permite uso comercial. El autor afirma que el stack completo queda bajo esta licencia al no depender de `espeak-ng`; no se aporta informacion sobre las licencias de los datasets de voces ni sobre posibles restricciones adicionales de las 54 voces incluidas.
- Para produccion: conviene validar la calidad de audio por voz e idioma, medir el pico de memoria real en el dispositivo objetivo y prever el coste de la primera compilacion de kernels en GPU.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/litert-community/Kokoro-82M-litert-lm
- Modelo base: https://huggingface.co/hexgrad/Kokoro-82M
- Repositorio de LiteRT-LM: https://github.com/google-ai-edge/LiteRT-LM
- README del modulo omni: https://github.com/google-ai-edge/LiteRT-LM/tree/main/omni
- Guia de compilacion y ejecucion: https://github.com/google-ai-edge/LiteRT-LM/blob/main/docs/getting-started/build-and-run.md
- Referencia arXiv 2306.07691: https://arxiv.org/abs/2306.07691
- Referencia arXiv 2203.02395: https://arxiv.org/abs/2203.02395

Nota: la busqueda web asociada a esta ficha no devolvio resultados relacionados con el modelo; los unicos resultados obtenidos correspondian a contenido no relevante, por lo que no se incluyen.
