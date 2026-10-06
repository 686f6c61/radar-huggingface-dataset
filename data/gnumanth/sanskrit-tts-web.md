# gnumanth/sanskrit-tts-web

## Resumen

sanskrit-tts-web es un sistema de síntesis de voz (TTS) especializado en la recitación de ślokas en sánscrito, publicado por el usuario gnumanth en HuggingFace. No es un modelo de lenguaje: es un pipeline acústico completo empaquetado en tres grafos ONNX cuantizados a INT8, pensado para ejecutarse íntegramente en el navegador mediante WebGPU o WebAssembly SIMD, sin backend ni servidor de inferencia.

El sistema procede del proyecto de investigación Vāgdhenu, cuyos checkpoints acústicos originales son obra del profesor Prathosh A P (IISc Bengaluru); la adaptación a navegador, la arquitectura WebGPU/WASM y la cuantización ONNX corresponden a Hemanth.HM. El repositorio incluye además un banco de referencias mel preextraídas en FP16 que cubre 18 metros Chandas del sánscrito, lo que permite condicionar la prosodia según la métrica del verso.

Su relevancia actual es doble: por un lado, demuestra que un pipeline TTS con vocoder neuronal puede ejecutarse en cliente con un repositorio de solo 0,3 GB; por otro, ataca un nicho muy concreto (prosodia sánscrita regida por métrica) que los TTS genéricos no cubren. La licencia MIT facilita su integración, aunque la validación pública es todavía nula (0 descargas y 0 likes en el momento de la consulta).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Pipeline TTS en tres etapas ONNX: backbone DiT de flow-matching de 22 bloques (`vagdhenu_dit_step_q8.onnx`), acondicionador estatico de texto y mel de referencia con tablas RoPE (`vagdhenu_cond_q8.onnx`) y vocoder neuronal Vocos de 24 kHz con cabecera iSTFT nativa en ONNX (`vagdhenu_vocos_q8.onnx`) |
| Parametros totales | no disponible |
| Longitud de contexto | no disponible (no aplica: es un modelo TTS, no un modelo autorregresivo de contexto textual) |
| Tipos de cuantizacion | INT8 con cuantizacion dinamica en los tres grafos ONNX; banco de referencias en FP16 |
| Idiomas soportados | sanscrito (recitacion de slokas en 18 metros Chandas); no se declaran otros idiomas |
| Licencia | MIT |
| Formato de pesos | ONNX (INT8) mas `baked_bank.bin` / `baked_bank.json` (FP16) |
| Tamano del repositorio | 0,3 GB |
| Frecuencia de muestreo de salida | 24 kHz, mono, PCM WAV |
| Modo de ejecucion | Navegador: WebGPU o WebAssembly SIMD, con cache de los grafos en la Cache API |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

El pipeline sigue un esquema de síntesis en cascada. La primera pieza es un backbone DiT (Diffusion Transformer) de 22 bloques que resuelve un objetivo de flow-matching, es decir, un modelo generativo basado en transporte de probabilidad en lugar de difusión clásica. La segunda pieza es un acondicionador estático que procesa el texto de entrada y la melodía de referencia, e incorpora tablas de embeddings posicionales rotatorios (RoPE); el resultado es la condición que guía al backbone. La tercera es un vocoder Vocos que convierte el mel generado en audio a 24 kHz, con una cabecera iSTFT implementada de forma nativa como operación ONNX, lo que evita dependencias externas de procesamiento de señal.

Los tres grafos se publican cuantizados dinámicamente a INT8, una decisión coherente con el objetivo de ejecución en cliente: reduce el peso descargable y acelera la inferencia tanto en WebGPU como en WASM SIMD. El repositorio añade un banco de referencias mel preextraídas en FP16 (`baked_bank.bin` y su índice `baked_bank.json`) para 18 metros Chandas, lo que permite fijar el patrón prosódico correcto según la métrica del verso sin necesidad de calcularlo en tiempo de ejecución.

No se dispone de información sobre el volumen de datos de entrenamiento, la composición del corpus, la duración total de audio, ni sobre si se aplicaron etapas de ajuste con preferencias humanas (RLHF/DPO) o evaluaciones perceptuales. Tampoco se detallan el número de parámetros, la dimensión oculta ni la configuración de atención del backbone DiT. La síntesis se emite de forma fragmentada, hemitiquio a hemitiquio, lo que sugiere que el sistema procesa el texto por unidades métricas en lugar de por frases arbitrarias.

## Capacidades

- Sintesis de voz en sanscrito para recitacion de slokas, con salida en WAV mono a 24 kHz.
- Modelado de prosodia guiado por metrica: el banco de referencias cubre 18 metros Chandas, de modo que la duracion y el patron ritmico se ajustan al metro del verso.
- Inferencia 100 % en el navegador del cliente, sin enviar el texto a ningun servidor.
- Aceleracion por WebGPU y respaldo por WebAssembly SIMD cuando no hay GPU disponible para el navegador.
- Cacheo de los grafos ONNX en la Cache API del navegador, de modo que la primera descarga no se repite.
- Streaming de audio por hemitiquios, lo que permite empezar la reproduccion antes de haber sintetizado el sloka completo.
- API de alto nivel en JavaScript: `VagdhenuWebEngine.synthesizeInBrowser(texto)` devuelve `{ url, meter, durationSec }`.
- No se documenta soporte de tool calling, function calling, agentes, razonamiento multi-paso, vision, audio de entrada ni modo de pensamiento; son capacidades ajenas a un modelo TTS.
- No se declara soporte multilingue: el ambito es el sanscrito y su metrica.

## Casos de uso

- Aplicaciones web de aprendizaje de sanscrito: el motor se importa como modulo JavaScript y sintetiza el sloka directamente en el navegador del alumno, sin necesidad de montar una API de inferencia ni de asumir costes de GPU en servidor.
- Ensenanza de prosodia y metrica Chandas: al devolver el campo `meter` junto con la duracion, la aplicacion puede mostrar al estudiante que metro ha detectado el sistema y comparar su propia recitacion con la referencia generada.
- Lectura en voz alta de textos sanscritos digitalizados: bibliotecas y repositorios de texto pueden ofrecer audio bajo demanda para pasajes en devanagari, con la ventaja de que el texto no sale del dispositivo del usuario.
- Aplicaciones progresivas y uso sin conexion: al cachear los grafos en la Cache API, una PWA puede seguir sintetizando audio tras la primera carga, algo util en contextos con conectividad intermitente.
- Plataformas de e-learning de yoga, vedanta o filosofia india: permite acompanar cada verso con su recitacion correcta sin licencias de voz comerciales, dado que el codigo se distribuye bajo MIT.
- Generacion de corpus de audio para investigacion en prosodia sanscrita: el sistema puede producir versiones habladas de un corpus textual respetando el metro, lo que facilita experimentos de alineacion o de analisis ritmico a escala.
- Accesibilidad para lectores con dificultades visuales o de lectura del devanagari: la sintesis en cliente convierte texto en audio sin depender de servicios externos de TTS que no cubren sanscrito.
- Demostraciones tecnicas de TTS en el navegador: sirve como referencia de como cuantizar a INT8 un pipeline con vocoder e iSTFT y ejecutarlo sobre WebGPU, un patron reutilizable para otros idiomas o dominios.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

La model card no incluye metricas objetivas ni subjetivas (MOS, CMOS, error de pronunciacion, tiempo real de inferencia o factor de tiempo real). La busqueda web realizada no ha devuelto ningun resultado relacionado con el modelo: los enlaces obtenidos tratan sobre encefalomielitis mialgica/sindrome de fatiga cronica y no guardan ninguna relacion con este repositorio.

## Requisitos de hardware

- La inferencia ocurre en el dispositivo del usuario final, no en un servidor; el repositorio completo ocupa 0,3 GB e incluye los tres grafos INT8 y el banco de referencias FP16.
- VRAM estimada: no disponible. El repositorio no publica el numero de parametros ni el consumo de memoria de los grafos.
- GPU recomendadas: no se especifica ninguna. El requisito real es que el navegador exponga WebGPU; en su defecto, el sistema funciona sobre WebAssembly SIMD en CPU.
- Compatibilidad con GPU de consumo: si, por diseno, ya que el objetivo declarado es la ejecucion en navegador; no obstante, no hay datos publicados de latencia por modelo de GPU.
- Opciones de despliegue: el propio motor `VagdhenuWebEngine` servido desde `https://h3manth.com/sanskrit-tts-web/vagdhenu-onnx.js`, cargando los pesos desde HuggingFace; el runtime subyacente es ONNX Runtime Web con backend WebGPU o WASM SIMD. No se documentan vLLM, llama.cpp, Ollama ni TGI, que no son aplicables a este tipo de modelo.
- Latencia y throughput estimados: no disponible. Lo unico indicado es que el audio se emite en streaming por hemitiquios, lo que reduce el tiempo hasta el primer fragmento audible.
- Almacenamiento en cliente: los grafos quedan cacheados en la Cache API del navegador tras la primera carga; el espacio ocupado corresponde al tamano de los ficheros ONNX y del banco, dentro del total de 0,3 GB del repositorio.

## Comparativa con modelos similares

No se dispone de datos verificables en la informacion proporcionada para establecer una comparativa cuantitativa con alternativas. El repositorio no publica parametros, contexto, metricas ni resultados que permitan contrastarlo con otros sistemas TTS.

| Modelo | Ambito | Ejecucion | Licencia | Datos comparativos |
|---|---|---|---|---|
| gnumanth/sanskrit-tts-web | Sanscrito, 18 metros Chandas | Navegador (WebGPU / WASM SIMD), ONNX INT8 | MIT | Referencia de esta ficha |
| Vāgdhenu (IISc Bengaluru) | Sanscrito | no disponible | no disponible | Origen de los checkpoints acusticos; sin metricas en la informacion disponible |
| TTS genericos multilingues | Multiples idiomas | Servidor o dispositivo | Variable | no disponible en la informacion proporcionada |

## Limitaciones y advertencias

- No es un modelo de lenguaje: no genera texto, no razona, no hace tool calling ni soporta agentes. Solo produce audio a partir de texto sanscrito.
- Ambito idiomatico muy restringido: sanscrito y, dentro de el, recitacion de slokas con metrica Chandas. No se declara soporte de otros idiomas ni de prosa sanscrita sin metrica.
- Cobertura metrica limitada a los 18 metros Chandas incluidos en el banco de referencias; un texto con un metro no contemplado o con metrica irregular puede recibir una prosodia inadecuada.
- Sin datos de evaluacion: no hay MOS, tasas de error de pronunciacion ni medidas de latencia publicadas, por lo que no es posible estimar la calidad percibida antes de desplegarlo.
- Riesgo de pronunciacion incorrecta ante entradas mal formateadas, transliteraciones no reconocidas, sandhi complejo o texto fuera del dominio de entrenamiento. Al no haber benchmarks, no se puede acotar la magnitud del problema.
- La licencia del repositorio es MIT, lo que permite uso comercial del codigo, pero los checkpoints acusticos originales proceden de la investigacion Vāgdhenu del IISc Bengaluru (Prof. Prathosh A P) y la model card no detalla los terminos aplicables a esos pesos originales; conviene verificarlos antes de un despliegue comercial.
- Dependencia del navegador: sin WebGPU ni WASM SIMD el sistema no funciona. El rendimiento varia de forma notable entre navegadores, versiones y plataformas, y no se publican cifras de latencia por configuracion.
- Validacion comunitaria nula: 0 descargas y 0 likes en el momento de la consulta, con un unico contribuidor identificado. No hay historial de incidencias ni de correcciones.
- Fecha de creacion y ultima actualizacion muy proximas entre si (5 de octubre de 2026), lo que indica que no ha habido iteraciones posteriores ni mantenimiento visible.
- Los resultados de la busqueda web no aportan informacion util sobre el modelo, por lo que todas las afirmaciones de esta ficha se basan exclusivamente en la model card y los metadatos del repositorio.
- No se detallan sesgos del corpus de voces de entrenamiento: no consta el numero de hablantes, su variedad dialectal ni la distribucion de genero, por lo que no puede evaluarse el sesgo acustico.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/gnumanth/sanskrit-tts-web
- Modulo JavaScript del motor: https://h3manth.com/sanskrit-tts-web/vagdhenu-onnx.js
- Web personal del autor de la adaptacion a navegador: https://h3manth.com
- Pesos y banco de referencias (resolucion de ficheros): https://huggingface.co/gnumanth/sanskrit-tts-web/resolve/main
- Proyecto de investigacion original Vāgdhenu (IISc Bengaluru, Prof. Prathosh A P): enlace no disponible en la informacion proporcionada
- Paper asociado: no disponible en la informacion proporcionada
- Demo interactiva: no disponible en la informacion proporcionada
- Repositorio de codigo fuente: no disponible en la informacion proporcionada
