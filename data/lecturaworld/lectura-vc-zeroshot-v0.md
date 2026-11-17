# lecturaworld/lectura-vc-zeroshot-v0

## Resumen

Lectura VC zero-shot v0 es un paquete de modelos ONNX para conversion de voz (voice conversion) zero-shot en frances, desarrollado por Lectura (lecturaworld). No es un modelo de lenguaje ni un TTS completo: es la infraestructura de inferencia que combina OpenVoice V2 (extractor de timbre y conversor) con AudioSeal 0.2.0 (marcado de agua IA) para transformar la identidad vocal de un audio de entrada manteniendo el contenido linguistico, sin necesidad de entrenamiento especifico por voz.

El repositorio se publica porque los pesos oficiales de OpenVoice V2 (MyShell.ai) y AudioSeal (Meta) solo se distribuyen en formato PyTorch; aqui se ofrecen las conversiones a ONNX junto con presets de timbre en frances (vectores `.npy`) listos para usar. El objetivo declarado es la inferencia completamente local y la trazabilidad: toda salida lleva un filigrana inaudible AudioSeal de 16 bits (`0x4C01`) que ninguna opcion del paquete permite desactivar, en linea con el articulo 50 del Reglamento Europeo de IA.

El modelo es relevante por su enfoque de cumplimiento normativo y su empaquetado ligero (0,2 GB), pero su alcance es acotado: solo frances, solo conversion de voz, sin sonidos publicados y con cero descargas y cero likes en el momento de la consulta. El codigo del paquete Python `lectura-vc-zeroshot` es AGPL-3.0-or-later, mientras que los pesos conservan sus licencias originales (MIT para OpenVoice y AudioSeal, CC BY 4.0 para los presets).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible (OpenVoice V2 convertido a ONNX: extractor de timbre + conversor; AudioSeal 0.2.0 como generador y detector de watermark) |
| Parametros totales | No disponible como cifra agregada; el conversor ONNX ocupa 128.052.461 bytes y el extractor de timbre 3.258.294 bytes |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (modelo de audio, no de texto; opera sobre fragmentos de audio) |
| Tipos de cuantizacion | No disponible (se distribuyen pesos ONNX en precision original; no se documentan variantes cuantizadas) |
| Idiomas soportados | Frances (`fr`) |
| Licencia | Mixta: preset `fr-f1` y derivados CC BY 4.0; OpenVoice y AudioSeal MIT; codigo del paquete Python AGPL-3.0-or-later |
| Formato de pesos | ONNX (`.onnx`) y vectores de timbre NumPy (`.npy`) |
| Frecuencia de salida | 22.050 Hz |
| Tamano del repositorio | 0,2 GB |
| Pipeline | `audio-to-audio` |
| Libreria | ONNX |
| Etiquetas | voice-conversion, openvoice, audioseal, watermarking, onnx, french |
| Fecha de creacion | 2026-11-17 |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

El repositorio no entrena ningun modelo propio: empaqueta conversiones a ONNX de dos sistemas existentes. Por un lado, OpenVoice V2 (MyShell.ai, licencia MIT) aporta el extractor de timbre (`openvoice_se.onnx`, 3,26 MB) y el conversor (`openvoice_vc.onnx`, 128,05 MB). OpenVoice separa el timbre del contenido linguistico y permite transferir la identidad vocal de una referencia a un audio fuente; la version V2 es la que soporta multiples idiomas, aunque este paquete solo declara frances. Por otro lado, AudioSeal 0.2.0 (Meta, MIT) aporta el generador (`audioseal_wm_16bits`, 58,91 MB) y el detector (`audioseal_detector_16bits`, 34,72 MB) de marca de agua neuronal, insertando y recuperando un mensaje de 16 bits.

Los presets de voz son vectores de timbre de forma `(1, 256, 1)` en float32 (1.152 bytes cada uno). `fr-f1` se extrae con el encoder de OpenVoice de extractos del corpus SIWIS (Universidad de Edimburgo, 2017, CC BY 4.0). `melange-f` y `melange-h` son medias ponderadas de vectores de varias voces del mismo sexo, renormalizadas, sin publicar vectores individuales ni nombres de locutores; el autor declara haber realizado una prueba de no identificabilidad con un encoder ECAPA independiente y mas de 150 voces senuelo por sexo. Los ficheros `<preset>-variantes.npy` (9.344 bytes) contienen 9 vectores en el rango -1 a +1 para un control de tono grave/agudo, generados reutilizando el truco de remuestreo de OpenVoice (audio remuestreado a 22.050 / 2^variante y leido a 22.050 Hz) e interpolando entre posiciones vecinas.

No se documentan datos de entrenamiento propios, tokens, composicion de dataset ni fases de RLHF/DPO. La innovacion tecnica destacable es el empaquetado ONNX con verificacion SHA-256, la separacion estricta de licencias por fichero y el marcado de agua obligatorio e ineludible en todas las salidas.

## Capacidades

- Conversion de voz zero-shot: transforma la identidad vocal de un audio de entrada a partir de una voz de referencia proporcionada por el usuario, sin entrenamiento adicional.
- Uso de presets incluidos: tres voces predefinidas (`fr-f1`, `melange-f`, `melange-h`) listas para usar sin referencia externa.
- Control de tono: parametro `variante` de -1 (mas grave) a +1 (mas agudo), con interpolacion entre posiciones.
- Marcado de agua IA: toda salida incorpora un filigrana AudioSeal inaudible con mensaje de 16 bits `0x4C01`, no desactivable.
- Deteccion de marca: el paquete incluye detector ONNX propio (`detecter`, `marque_retrouvee`) ademas del detector publico de AudioSeal.
- Inferencia local: todo el pipeline se ejecuta en local mediante ONNX, sin llamadas a servicios externos.
- Salida a 22.050 Hz.
- No soporta generacion de texto, razonamiento, codigo, matematicas, vision, tool calling ni agentes; es exclusivamente audio-audio.
- No soporta otros idiomas distintos del frances segun la model card.

## Casos de uso

- Doblaje y localizacion de contenido en frances: convertir la voz de un actor a una voz de referencia autorizada manteniendo prosodia y contenido, con salida marcada como generada por IA para cumplir el AI Act.
- Prototipado de asistentes de voz: generar variantes de una misma locucion con distintos timbres (`melange-f`, `melange-h`) para pruebas de UX sin grabar locutores nuevos.
- Anonimizacion de voces en datasets de investigacion: sustituir la identidad vocal de grabaciones por un preset promedio antes de compartir audio, reduciendo el riesgo de reidentificacion (el autor declara prueba de no identificabilidad de los presets).
- Verificacion de procedencia de audio: usar el detector AudioSeal incluido para comprobar si un fichero contiene la marca `0x4C01` y confirmar que fue generado con este pipeline.
- Creacion de contenido accesible: adaptar la voz de un narrador a un registro mas grave o agudo mediante `variante` para mejorar la inteligibilidad en audiolibros o material educativo en frances.
- Investigacion en marcas de agua neuronales: emplear el par generador/detector ONNX como referencia reproducible para estudiar robustez de AudioSeal en audio convertido.
- Integracion en pipelines de produccion de audio: el paquete Python descarga y verifica los ficheros automaticamente y expone una API simple (`creer_engine().convert(...)`), adecuada para automatizar lotes de conversion con trazabilidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma oficial. Por el tamano de los ficheros ONNX (conversor de 128 MB, generador de watermark de 59 MB, detector de 35 MB), la inferencia cabe holgadamente en GPUs de consumo, aunque no se publican cifras de memoria pico.
- GPU recomendadas: no especificadas por el autor; cualquier GPU con soporte ONNX Runtime deberia ser suficiente.
- GPU de consumo: previsiblemente compatible con RTX 3060, RTX 4060, RTX 4090 y similares por el reducido tamano de los pesos; no confirmado oficialmente.
- CPU: viable en principio al ser modelos ONNX ligeros, sin datos de latencia publicados.
- Opciones de despliegue: paquete Python `lectura-vc-zeroshot` (recomendado, gestiona descarga y verificacion SHA-256), ONNX Runtime directo, o el detector publico de AudioSeal con PyTorch (`pip install audioseal torchaudio`).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Idiomas | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|---|
| Lectura VC zero-shot v0 | Conversion de voz zero-shot + watermark | No disponible (conversor ONNX de 128 MB) | No aplica | Frances | Mixta (CC BY 4.0 / MIT / AGPL-3.0) | ONNX + NPY | Watermark AudioSeal obligatorio; sin sonidos publicados |
| OpenVoice V2 (MyShell.ai) | Conversion de voz zero-shot | No disponible en la informacion | No aplica | Multiples (segun model card original) | MIT | PyTorch | Modelo base del que deriva este paquete; sin watermark integrado |
| AudioSeal 0.2.0 (Meta) | Watermark de audio | No disponible en la informacion | No aplica | No aplica | MIT | PyTorch (aqui ONNX) | Generador y detector de marca de 16 bits; no es un conversor de voz |

No se dispone de datos de benchmarks comparativos entre estos modelos en la informacion proporcionada.

## Limitaciones y advertencias

- Solo soporta frances; no se declara soporte de otros idiomas aunque OpenVoice V2 sea multilingue.
- No es un modelo de lenguaje: no genera texto, codigo ni razonamiento.
- Riesgo de alucinacion no aplicable en el sentido linguistico, pero si de artefactos acusticos o perdida de naturalidad en la conversion, no cuantificado por el autor.
- Sesgos: los presets `melange-f` y `melange-h` son medias de voces de un mismo sexo; pueden no representar adecuadamente diversidad de edades, acentos o registros. El autor declara una prueba de no identificabilidad, pero no publica metricas.
- Restricciones legales: el autor advierte que imitar la voz de una persona sin consentimiento escrito puede vulnerar derechos (C. civ. art. 9 en Francia) y que difundir contenido generado sin indicarlo puede constituir delito (C. pen. art. 226-8). Solo debe usarse la propia voz o voces con permiso.
- Obligacion normativa: no retirar el watermark; el articulo 50 del AI Act europeo exige marcar contenido generado por IA. El paquete no ofrece opcion para desactivarlo.
- Licencia mixta: el codigo Python es AGPL-3.0-or-later, lo que impone obligaciones de copyleft en despliegues en red; los pesos OpenVoice y AudioSeal son MIT y los presets CC BY 4.0 con atribucion obligatoria a SIWIS.
- Cero descargas y cero likes en el momento de la consulta: proyecto muy reciente (noviembre de 2026) sin validacion comunitaria.
- No se publican sonidos de muestra ni vectores individuales de las voces mezcladas, lo que limita la evaluacion cualitativa previa.
- No hay datos publicados de latencia, throughput ni calidad (MOS, similitud de locutor) que permitan estimar rendimiento en produccion.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/lecturaworld/lectura-vc-zeroshot-v0
- Paquete Python en PyPI: https://pypi.org/project/lectura-vc-zeroshot/
- Pagina del proyecto Lectura (modulos v0): https://www.lectura.world/developpement/modules/v0/
- OpenVoice V2 en Hugging Face: https://huggingface.co/myshell-ai/OpenVoiceV2
- AudioSeal en Hugging Face: https://huggingface.co/facebook/audioseal
- Corpus SIWIS (DOI): https://doi.org/10.7488/ds/1705
- Licencia CC BY 4.0: https://creativecommons.org/licenses/by/4.0/
