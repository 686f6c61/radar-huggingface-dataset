# gileshall/lipservice

## Resumen

Lip Service es un conjunto de modelos de síntesis de voz (text-to-speech) y de canto sintético desarrollado por Giles Hall. Su particularidad es que está diseñado para ejecutarse íntegramente en CPU, sin GPU ni servicios externos, con pesos cuantizados a int8 en un formato propio denominado `.lsw`. El paquete incluye dieciséis voces en inglés que pueden hablar o cantar, individualmente o formando un coro, y se distribuye como un conjunto de 99 MB repartidos en 61 ficheros.

El modelo no se ejecuta en PyTorch ni en Transformers, sino en el motor propio Lip Service, escrito en Rust sin dependencias, que se puede usar desde su interfaz de línea de comandos, desde el paquete de Python `lipservice` o en el navegador. La salida es audio mono a 24 kHz para una voz y estéreo cuando se genera un coro. La versión documentada es Lip Service 0.2.0, con el conjunto de modelos `18ca01e5de4a`.

La relevancia de este lanzamiento radica en su enfoque de despliegue: TTS de calidad con huella mínima (menos de 100 MB), sin requisitos de acelerador y con licencia AGPL-3.0. Está pensado para aplicaciones de escritorio, juegos, herramientas educativas o proyectos de música donde no se quiere depender de infraestructura en la nube ni de hardware especializado.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (modelo acústico propio del motor Lip Service, con vocoder Vocos en la ruta `fast`) |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | int8 con escalas y sesgos en coma flotante |
| Idiomas soportados | inglés (pronunciación General American) |
| Licencia | AGPL-3.0-only (pesos Vocos bajo MIT; respiraciones de VocalSet bajo CC BY 4.0) |
| Formato de pesos | `.lsw` (formato propio del motor); manifiesto `manifest.json` con tamaños y SHA-256 |
| Tipo de tarea | text-to-speech y síntesis de canto a partir de partitura |
| Frecuencia de muestreo de salida | 24 kHz (mono para una voz, estéreo para coro) |
| Tamaño del repositorio | 0,1 GB (99 MB en 61 ficheros) |
| Motor de ejecución | Lip Service (Rust, sin dependencias), CLI, paquete Python y navegador |
| Versión | Lip Service 0.2.0, conjunto de modelos `18ca01e5de4a` |

## Arquitectura y entrenamiento

La información disponible no detalla la topología interna del modelo acústico base (`base.lsw`, 15,1 MB), más allá de que es un modelo compartido sobre el que se construyen las dieciséis voces. La síntesis se organiza en dos rutas de calidad: `hifi`, que emplea `hifi/vox.lsw` (30,5 MB) y un fichero por voz de 0,4 MB, y `fast`, que usa `fast/melvoc.lsw` (22,2 MB) para habla y `fast/vocoder.lsw` (3,6 MB) para canto. La ruta `fast` incorpora los pesos del vocoder Vocos (`charactr/vocos-mel-24khz`), almacenados sin modificar pero en int8.

El conjunto incluye módulos auxiliares específicos: `g2p.lsw` (5,9 MB) convierte grafemas en fonemas para palabras fuera del léxico, `lexicon.lsw` (0,8 MB) contiene pronunciaciones y `breaks.lsw` (3,5 MB) predice pausas en frases largas. Para el canto se añaden modelos de movimiento entre notas (`motion/straight.lsw`, `vibrato.lsw`, `wide.lsw`). Los datos de entrenamiento son LibriTTS-R (punto de partida LJ Speech) para el habla, las voces y las rutas de audio; VocalSet 1.2 para el canto, el movimiento de tono y las respiraciones; el CMU Pronouncing Dictionary para léxico y G2P; y BERT `bert-base-uncased` como profesor para el modelo de pausas (no se distribuye nada de BERT). No se especifican el número de tokens, la composición exacta del dataset ni si hubo RLHF o DPO.

## Capacidades

- Síntesis de voz en inglés con dieciséis voces inventadas y pronunciación General American.
- Síntesis de canto a partir de una partitura escrita, con modelos de movimiento entre notas (recto, vibrato, amplio).
- Generación de coro: varias voces simultáneas con salida estéreo a 24 kHz.
- Conversión de grafema a fonema para palabras ausentes del léxico (basada en CMUdict).
- Predicción de pausas en frases largas mediante un modelo dedicado.
- Ejecución en CPU sin GPU, sin servicio externo y sin dependencias en el motor.
- Uso desde CLI, paquete Python (`pip install lipservice`) y navegador.
- Verificación de integridad de cada fichero mediante SHA-256 en la descarga.
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso: es un modelo de síntesis de audio.
- Capacidad multilingüe limitada al inglés.

## Casos de uso

- Aplicaciones de escritorio y juegos: integración de voces sintéticas en tiempo de ejecución sobre CPU, sin GPU ni conexión, usando el paquete Python o el motor Rust embebido; el tamaño de 99 MB permite incluirlo en el instalador.
- Audiolibros y lectura asistida: narración de texto largo con el modelo de pausas (`breaks.lsw`) para segmentar frases y la ruta `hifi` para mayor calidad de audio.
- Producción musical y demos: generación de coros a partir de partituras con `choirs.json` y las dieciséis voces, con salida estéreo a 24 kHz y control de vibrato y movimiento entre notas.
- Prototipado de interfaces de voz: pruebas de UX de asistentes o avisos hablados en inglés sin depender de APIs de terceros, ejecutando el motor en el navegador.
- Educación y accesibilidad: lectura en voz alta de materiales en inglés en entornos sin hardware dedicado, con licencia AGPL que permite modificar y redistribuir el motor y los pesos.
- Investigación en TTS y canto: estudio de un pipeline completo (G2P, léxico, pausas, modelo acústico, vocoder) con pesos int8 y licencia libre, útil para experimentos de cuantización y evaluación en CPU.
- Herramientas de línea de comandos: generación de avisos o locuciones puntuales con `lipservice say "..."` en scripts y pipelines de CI, sin infraestructura adicional.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM: no aplica; el modelo está diseñado para ejecutarse en CPU.
- GPU recomendadas: ninguna; no requiere GPU.
- Cabe en cualquier CPU de consumo actual; el conjunto completo ocupa 99 MB en disco y los ficheros se cargan bajo demanda.
- Opciones de despliegue: motor Lip Service (Rust), CLI `lipservice`, paquete Python `lipservice` y ejecución en navegador. No se indica compatibilidad con vLLM, llama.cpp, Ollama ni TGI, ya que no es un modelo de lenguaje.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Tipo | Tamaño | Ejecución | Licencia | Idiomas |
|---|---|---|---|---|---|
| Lip Service (gileshall/lipservice) | TTS y canto | 99 MB (61 ficheros) | CPU, motor propio | AGPL-3.0-only | inglés |
| Piper | TTS | no disponible | CPU, ONNX | MIT (según proyecto) | múltiples |
| Coqui TTS | TTS | no disponible | CPU/GPU, PyTorch | MPL-2.0 (según proyecto) | múltiples |
| Vocos (vocoder) | vocoder | no disponible | CPU/GPU | MIT | no aplica |

No se dispone de datos de rendimiento comparativos en la información proporcionada; la comparación se limita a tipo de tarea, licencia y modo de ejecución.

## Limitaciones y advertencias

- Solo admite inglés con pronunciación General American; no hay soporte multilingüe.
- Las voces son dieciséis personajes inventados; no clonan voces reales y no deben usarse para suplantar a personas.
- Riesgo de alucinación no aplica en el sentido de texto, pero la calidad de pronunciación depende del léxico y del modelo G2P para palabras fuera de él.
- La licencia AGPL-3.0-only exige ofrecer el código fuente bajo la misma licencia si se distribuyen los ficheros o se ofrece una versión modificada por red; para uso comercial cerrado existe una licencia comercial aparte (licensing@lipservice.dev).
- Los pesos de Vocos conservan su licencia MIT y las respiraciones de `page/` la CC BY 4.0 de VocalSet; hay que respetar esas atribuciones.
- No se han publicado benchmarks ni métricas objetivas de calidad (MOS, WER) en la información disponible.
- El formato `.lsw` es propio del motor: no es compatible con PyTorch, Transformers ni con herramientas estándar de TTS.
- La fecha de creación del repositorio (2026-11-27) y el contador de descargas (0) indican un proyecto muy reciente; la madurez y el soporte de la comunidad no están contrastados.

## Enlaces

- Hugging Face: https://huggingface.co/gileshall/lipservice
- Repositorio del motor: https://github.com/gileshall/lipservice
- Servidor de modelos: https://models.lipservice.dev
- LibriTTS-R: https://www.openslr.org/141/
- LJ Speech: https://keithito.com/LJ-Speech-Dataset/
- VocalSet: https://doi.org/10.5281/zenodo.1442513
- CMU Pronouncing Dictionary: http://www.speech.cs.cmu.edu/cgi-bin/cmudict
- Vocos: https://github.com/gemelo-ai/vocos
- BERT base uncased: https://huggingface.co/google-bert/bert-base-uncased
