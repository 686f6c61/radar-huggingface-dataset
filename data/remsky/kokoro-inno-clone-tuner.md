# remsky/kokoro-inno-clone-tuner

## Resumen

kokoro-inno-clone-tuner es un adaptador de ajuste de voz (voice tuner) zero-shot desarrollado por el usuario remsky para el modelo de sintesis de voz Kokoro-82M de hexgrad. No es un modelo TTS autonomo: es un componente de 9.653.396 parametros que, a partir de un clip de audio de referencia de entre 3 y 30 segundos, genera un "pack de voz" compatible con Kokoro con forma de tensor `[510, 1, 256]`. Su proposito es permitir la exploracion y personalizacion rapida de voces dentro del ecosistema Kokoro sin reentrenar el modelo base.

El adaptador se apoya en una arquitectura tipo StyleTTS2 con un encoder de hablante WeSpeaker ResNet34 de 6,6 millones de parametros, destilado para producir embeddings de UniSpeech-SAT-sv, junto con una style head que mapea el embedding de hablante (512) al espacio de estilo de Kokoro (256) y un mecanismo de mezcla de prosodia sobre los packs stock del modelo base. Todo el proceso de enrollment es muy ligero: aproximadamente 0,05 segundos por segundo de referencia en CPU y entre 0,1 y 0,3 segundos en GPU.

Es relevante ahora porque reduce el coste de crear voces personalizadas en Kokoro a un clip corto y un par de decimas de segundo de computo, con un coste de entrenamiento declarado inferior a 20 dolares en GPU (HF Jobs `a10g-small`). Se distribuye bajo licencia Apache 2.0, con 35.731 descargas en HuggingFace, y ya esta integrado en Kokoro-FastAPI a partir de la version 0.9.0. El propio autor lo describe como herramienta de exploracion y personalizacion, no como un clonador de identidad robusto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador sobre Kokoro-82M (familia StyleTTS2): speaker encoder WeSpeaker ResNet34 (6,6 M de parametros) destilado a embeddings UniSpeech-SAT-sv, style head de timbre y prosody head lineal |
| Parametros totales | 9.653.396 |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica; la entrada es un clip de audio de referencia de 3 a 30 segundos |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (`model.safetensors`); los packs de voz generados se serializan como tensores PyTorch `.pt` con forma `[510, 1, 256]` |
| Modelo base | hexgrad/Kokoro-82M (relacion: adapter) |
| Tamano del repositorio | 0,1 GB |
| Pipeline | text-to-speech |
| Fecha de creacion | 2026-08-31 |
| Ultima actualizacion | 2026-09-10 |

## Arquitectura y entrenamiento

El enrollment combina cuatro piezas que cargan integramente desde `model.safetensors`, sin descargas adicionales. El speaker encoder es un WeSpeaker ResNet34 de 6,6 millones de parametros destilado para emitir embeddings de UniSpeech-SAT-sv; durante el entrenamiento se uso un teacher de 380 MB que no es necesario en inferencia, y el encoder iguala al teacher con una desviacion de 0,002 en similitud coseno de hablante sobre el split de hold-out dev-clean. La style head (mitad de timbre del pack) parte del embedding de hablante de dimension 512 y lo proyecta al estilo de Kokoro de dimension 256, desplazandose a lo largo de una direccion de inclinacion espectral aprendida segun la inclinacion medida en la referencia.

La mitad de prosodia se construye mezclando los packs de voz stock de Kokoro mediante minimos cuadrados no negativos, ajustando a la media de F0, la dispersion de F0 y la tasa de silabas de la referencia. Los packs que distan mas de 4 semitonos del tono de la referencia se excluyen y los mejor valorados reciben mayor peso. La prosody head de la version 0.2 aplica un ajuste lineal sobre esa mezcla a partir de la media y dispersion de F0 de la referencia, ajustado a deltas optimizados a traves del predictor congelado; se puede desactivar con `enroll(..., head=False)`. El techo de seguimiento de tono se fija automaticamente a partir del espaciado armonico de la referencia y se puede sobrescribir con `enroll(..., fmax=180)` cuando la voz resultante queda en un registro incorrecto.

En cuanto al entrenamiento, todas las etapas mantienen Kokoro congelado y usan LibriTTS-R train-clean-100 salvo que se indique lo contrario. Los datasets declarados en la model card son parler-tts/libritts_r_filtered, facebook/voxpopuli y amphion/Emilia-Dataset. El entrenamiento se ejecuto en HF Jobs con instancias `a10g-small` y un coste declarado por debajo de 20 dolares de tiempo de GPU. La informacion disponible sobre el proceso de entrenamiento esta truncada en el apartado v0.1.0 de la model card.

## Capacidades

- Enrollment de voz zero-shot: genera un pack de voz compatible con Kokoro a partir de un unico clip de referencia de 3 a 30 segundos, sin reentrenamiento.
- Ajuste de timbre: la style head traslada la inclinacion espectral de la referencia al estilo de Kokoro mediante una direccion aprendida.
- Ajuste de prosodia: la mezcla por minimos cuadrados no negativos y la prosody head alinean la media de F0, la dispersion de F0 y la tasa de silabas con la referencia.
- Control de registro tonal: el techo de pitch tracking se calcula automaticamente del espaciado armonico de la referencia, con anulacion manual mediante `fmax`.
- Compatibilidad directa con Kokoro: los packs resultantes son tensores planos que funcionan como cualquier pack stock, con prefijo de acento y genero (`am_`, `af_`, `bm_`, `bf_`).
- Integracion con `KPipeline` de Kokoro: `pipe("texto", voice=pack)` devuelve audio directamente.
- Integracion con Kokoro-FastAPI desde la version 0.9.0.
- Idioma: solo ingles en la version actual (entrenado sobre LibriTTS-R).
- No dispone de tool calling, capacidades de agente, vision ni audio de entrada mas alla del clip de referencia.

## Casos de uso

- Personalizacion de voces en asistentes de accesibilidad: una persona puede enrolar su propia voz en 1,4 segundos de CPU a partir de una grabacion de 30 segundos y usar esa voz en un lector de pantalla o comunicador, manteniendo la latencia del TTS de Kokoro.
- Doblaje y localizaciones de bajo presupuesto: el adaptador permite generar packs de voz a partir de locuciones existentes y reutilizarlos en pipelines de TTS para producir versiones preliminares de una narracion antes de contratar una locucion final.
- Prototipado de personajes en videojuegos: los equipos pueden crear voces de personaje con un clip de prueba, iterar sobre prosodia y timbre con `fmax` y distintos packs stock de partida, y validar la direccion artistica antes de invertir en grabacion.
- Servicio multiusuario de TTS por API: integrado en Kokoro-FastAPI v0.9.0+, cada usuario puede enrolar su pack y servirlo con la misma infraestructura que las voces stock, anadiendo el pack como un fichero `.pt` mas en el directorio de voces.
- Generacion de datos sinteticos para ASR: la creacion rapida de packs de voz diversos permite sintetizar corpus de audio con caracteristicas de prosodia controladas, utiles para aumentar datos de entrenamiento o pruebas de robustez de sistemas de reconocimiento de voz.
- Investigacion en prosodia y timbre: la separacion explicita entre style head (timbre) y prosody head (F0 y ritmo), con posibilidad de desactivar la segunda, permite experimentos controlados sobre que componentes de la identidad vocal se preservan.
- Analisis forense o de registro vocal: la deteccion automatica del espaciado armonico y el ajuste de `fmax` permiten estudiar como se comporta el modelo con fuentes de banda limitada o material de archivo historico.
- Creacion de audiolibros internos: narracion de documentos largos con una voz consistente enrolada una sola vez, reutilizando el pack en todas las sintesis posteriores.

## Benchmarks y rendimiento

La model card solo publica una metrica cuantitativa del speaker encoder: una coincidencia de 0,002 en similitud coseno de hablante frente al teacher sobre el split de hold-out dev-clean de LibriTTS-R. No se han publicado resultados de benchmarks comparativos (tipo MOS, similitud de hablante sobre otros conjuntos, WER de ASR sobre audio generado) en la informacion disponible.

| Metrica | Valor | Condiciones |
|---|---|---|
| Similitud coseno de hablante frente al teacher | desviacion de 0,002 | Hold-out dev-clean de LibriTTS-R, speaker encoder |
| Tiempo de enrollment en CPU | 0,05 s por segundo de referencia | 30 s de referencia en 1,4 s |
| Tiempo de enrollment en GPU | 0,1-0,3 s totales | Tras la carga inicial del modelo |
| Coste de entrenamiento | menos de 20 USD de GPU | HF Jobs `a10g-small` |

## Requisitos de hardware

- VRAM estimada para inferencia: al tratarse de 9.653.396 parametros, el adaptador ocupa aproximadamente 38,6 MB en fp32 y 19,3 MB en fp16 (estimacion propia a partir del recuento de parametros); se suma a la huella del modelo base Kokoro-82M.
- El adaptador cabe holgadamente en cualquier GPU consumer, incluidas RTX 3060, RTX 4060, RTX 4090, y tambien se puede ejecutar integramente en CPU.
- GPU de referencia empleada en entrenamiento: `a10g-small` a traves de HF Jobs. No se especifican GPU recomendadas para produccion.
- El teacher de destilacion de 380 MB solo se uso durante el entrenamiento y no es necesario para el enrollment.
- Opciones de despliegue: paquete Python `inno-kokoro` (`pip install inno-kokoro`), pipeline `KPipeline` de Kokoro y Kokoro-FastAPI desde la version 0.9.0.
- Soporte en vLLM, llama.cpp, Ollama y TGI: no disponible, no aplica a este tipo de modelo.
- Latencia: el enrollment tarda aproximadamente 0,05 s por segundo de referencia en CPU (1,4 s para una referencia de 30 s) y entre 0,1 y 0,3 s en GPU una vez cargado el modelo. No se publican datos de throughput de sintesis, que depende del modelo base Kokoro.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / entrada | Idiomas | Licencia | Enfoque | Disponibilidad |
|---|---|---|---|---|---|---|
| remsky/kokoro-inno-clone-tuner | 9.653.396 (adaptador) | Clip de referencia de 3-30 s | Ingles | Apache 2.0 | Tuner zero-shot sobre Kokoro-82M | HuggingFace, integrado en Kokoro-FastAPI 0.9.0+ |
| hexgrad/Kokoro-82M | 82 M | No aplica (packs stock predefinidos) | Multiples idiomas segun el modelo base | Apache 2.0 | TTS con voces fijas | HuggingFace |
| Otras alternativas de clonacion zero-shot (XTTS-v2, OpenVoice, F5-TTS) | no disponible | no disponible | no disponible | no disponible | Clonacion de identidad | no disponible en la informacion proporcionada |

La comparativa con alternativas de clonacion zero-shot no puede completarse con datos verificados: la busqueda web realizada no devolvio resultados relevantes sobre este modelo ni sobre modelos comparables (los resultados obtenidos corresponden a servicios meteorologicos y no guardan relacion con la consulta).

## Limitaciones y advertencias

- Entrenado unicamente en ingles (LibriTTS-R) en la version actual; no hay soporte multilingue declarado.
- El propio autor lo describe como herramienta de exploracion y personalizacion, no como un clonador de identidad robusto: parte de la textura y de la identidad se sacrifica para mantener la calidad y estabilidad del audio dentro del rango de Kokoro.
- El ritmo es una aproximacion de mejor esfuerzo: la prosodia es una mezcla convexa de los packs stock por tono, dispersion y cadencia, de modo que fuera de ese rango solo se fija al borde mas cercano.
- La referencia debe cumplir requisitos estrictos: minimo 3 segundos, maximo 30 segundos, ausencia razonable de artefactos de audio y un unico hablante.
- El control de registro tonal depende del calculo automatico del espaciado armonico; con fuentes de banda limitada o material de archivo puede requerir el ajuste manual de `fmax`.
- Riesgo de alucinacion en el sentido de artefactos de sintesis y de prosodia incorrecta cuando la referencia esta fuera del rango cubierto por los packs stock; no hay benchmarks publicados de MOS, similitud de hablante ni WER que permitan cuantificar la calidad final.
- Restricciones de licencia: el adaptador y el modelo base son Apache 2.0, lo que permite uso comercial, pero la clonacion de voces de personas reales plantea requisitos legales y eticos de consentimiento independientes de la licencia. Los ejemplos publicados en la model card incluyen voces de figuras publicas (David Attenborough, Amelia Earhart, Jane Goodall, Vincent Price), lo que ilustra el riesgo de uso indebido para suplantacion o deepfakes.
- No se han publicado tipos de cuantizacion ni versiones optimizadas del adaptador; el rendimiento final de sintesis queda ligado a Kokoro-82M.
- Dependencia fuerte del modelo base: cualquier cambio en el formato de packs de Kokoro o en su pipeline afecta directamente a la compatibilidad de los packs generados.
- El apartado de entrenamiento y metricas de la model card esta truncado en la informacion disponible, por lo que no se pueden verificar detalles de las etapas de entrenamiento ni de los conjuntos de evaluacion.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/remsky/kokoro-inno-clone-tuner
- Repositorio de codigo: https://github.com/remsky/inno-kokoro
- Kokoro-FastAPI (integracion desde v0.9.0): https://github.com/remsky/Kokoro-FastAPI
- Modelo base Kokoro-82M: https://huggingface.co/hexgrad/Kokoro-82M
- Embeddings UniSpeech-SAT-sv: https://huggingface.co/microsoft/unispeech-sat-base-plus-sv
- Dataset LibriTTS-R filtrado: https://huggingface.co/datasets/parler-tts/libritts_r_filtered
- Dataset VoxPopuli: https://huggingface.co/datasets/facebook/voxpopuli
- Dataset Emilia: https://huggingface.co/datasets/amphion/Emilia-Dataset
- Paquete de instalacion: `pip install inno-kokoro`
- Nota sobre la busqueda web: las consultas realizadas no devolvieron resultados relevantes (papers, blogs o demos) sobre este modelo; los unicos resultados obtenidos fueron paginas de servicios meteorologicos sin relacion con la consulta.
