# My-Name-Is-Jeff/vitrine-sing

## Resumen

Vitrine-sing es un modelo de separacion de fuentes de audio especializado en extraer la pista de voz (vocals) a partir de una mezcla musical. Se trata de un "mirror" del modelo Darkkos/spoti-sing, publicado para que la aplicacion Vitrine's Sing pueda descargarlo. Los archivos y el NOTICE se mantienen sin cambios respecto al original. Internamente es un Mel-Band RoFormer con el checkpoint vocal de KimberleyJensen, cuyo nucleo espectral se ha exportado a Core ML para su ejecucion en el iPhone.

El modelo no es un modelo de lenguaje: procesa espectrogramas de audio. Recibe un tensor float32 llamado `spectrum` de forma `[1, 2050, 201, 2]` y devuelve un `vocals_spectrum` de la misma forma, realizando la aplicacion anfitriona las operaciones STFT alrededor del modelo. Trabaja en ventanas de dos segundos y el resultado es un `.mlmodelc` compilado que se ejecuta en el dispositivo, sin que ningun audio salga del telefono.

Su relevancia radica en que permite bajar el volumen de la voz de una cancion mientras suena, en tiempo real y de forma privada, sobre hardware Apple. La licencia es MIT, heredada de los componentes originales, y la publicacion declara compatibilidad con iOS 18 (Core ML specification 9).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mel-Band RoFormer (transformer con procesamiento en bandas espectrales) |
| Parametros totales | no disponible (archivo de pesos `weight.bin` de 488.986.336 bytes) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica en el sentido de texto; procesa ventanas de audio de 2 segundos |
| Tipos de cuantizacion | no disponible (tensor de entrada declarado en float32) |
| Idiomas soportados | no disponible (procesa audio, no texto) |
| Licencia | MIT |
| Formato de pesos | Core ML compilado (`.mlmodelc`; incluye `weights/weight.bin`, `model.mil`, `metadata.json`, `coremldata.bin`) |

## Arquitectura y entrenamiento

La arquitectura base es Mel-Band RoFormer, una variante de transformer para separacion de fuentes basada en el enfoque band-split de BS-RoFormer (implementacion de lucidrains, con codigo de entrenamiento de ZFTurbo). Mel-Band RoFormer fue propuesto por Ju-Chiang Wang, Wei-Tsung Lu y Minz Won. El checkpoint vocal concreto procede de KimberleyJensen. No se detalla en la informacion disponible el numero de tokens o la composicion exacta del dataset de entrenamiento, ni si hubo fases de RLHF o DPO (no aplicables en este dominio).

La innovacion tecnica del artefacto publicado no esta en el entrenamiento, sino en la exportacion: el nucleo espectral del modelo se ha convertido a Core ML con ventanas de dos segundos. El STFT se realiza fuera del modelo, en la app, de modo que la red opera directamente sobre el espectrograma. Los archivos se distribuyen como `.mlmodelc` compilado, y la aplicacion verifica tamano y SHA-256 de cada archivo antes de conservarlo. El modelo declara iOS 18 y el conjunto de operaciones `ios18` en `model.mil`.

## Capacidades

- Separacion de fuentes de audio orientada a la extraccion de la pista vocal a partir de una mezcla musical.
- Procesamiento de espectrogramas de entrada con forma `[1, 2050, 201, 2]` y salida de forma identica (`vocals_spectrum`).
- Ejecucion en ventanas de dos segundos, lo que permite procesar audio de forma segmentada.
- Inferencia en el dispositivo (on-device) sobre iPhone mediante Core ML.
- Reduccion del volumen de la voz durante la reproduccion de una cancion, habilitando funciones tipo karaoke.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multilingues de texto: no es un modelo de lenguaje.
- No se declaran capacidades de vision, audio generativo ni modo de "pensamiento".

## Casos de uso

- Aplicaciones de karaoke en el iPhone: el modelo reduce o elimina la voz de la cancion mientras suena, de modo que el usuario puede cantar sobre la instrumental. La ventana de 2 segundos y la ejecucion on-device permiten una experiencia fluida sin conexion.
- Herramientas de practica musical para cantantes: permite escuchar la mezcla con la voz atenuada para ensayar afinacion y ritmo, manteniendo el resto de instrumentos intactos.
- Edicion de audio en movil: separar la pista vocal como paso previo a un remix o a un mashup, procesando por segmentos de dos segundos dentro de un editor en el dispositivo.
- Procesamiento con privacidad reforzada: al no salir el audio del telefono, es adecuado para material musical no publicado o para usuarios que no quieren subir pistas a servicios en la nube.
- Integracion en reproductores de musica de terceros: la app descarga el `.mlmodelc`, verifica su hash y lo ejecuta localmente para ofrecer control de la pista vocal como funcion adicional.
- Investigacion y prototipado de separacion de fuentes en Apple Silicon: sirve como referencia de como exportar un Mel-Band RoFormer a Core ML y ejecutarlo en el Neural Engine.
- Demostraciones tecnicas de conversion de modelos de audio a Core ML: ejemplo practico del pipeline del repositorio coreai-model-zoo aplicado a un checkpoint vocal.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- Orientado a ejecucion en iPhone con iOS 18 (Core ML specification 9, op set `ios18`).
- Espacio en disco necesario: aproximadamente 0,5 GB por el repositorio; el archivo de pesos `weight.bin` ocupa 488.986.336 bytes.
- Memoria en tiempo de ejecucion: no disponible de forma exacta; el tensor de entrada y salida `[1, 2050, 201, 2]` en float32 ronda los 3,3 MB por tensor, mas el peso del modelo.
- GPU de escritorio (A100, H100, RTX 4090) y despliegue con vLLM, llama.cpp, Ollama o TGI: no aplicables ni soportados, ya que es un modelo de audio exportado exclusivamente a Core ML.
- Opciones de despliegue: Core ML en dispositivos Apple; el `.mlmodelc` compilado se integra en la app anfitriona (Vitrine's Sing).
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

No se dispone de datos numericos de rendimiento para comparar. Cualitativamente, las alternativas de la misma categoria son:

| Modelo | Categoria | Licencia | Formato/despliegue | Datos comparativos |
|---|---|---|---|---|
| Vitrine-sing (este) | Separacion vocal | MIT | Core ML (`.mlmodelc`) | no disponible |
| Mel-Band RoFormer (KimberleyJSN/melbandroformer) | Separacion vocal | MIT | Pesos de referencia (PyTorch) | no disponible |
| BS-RoFormer (lucidrains) | Separacion de fuentes | no disponible | PyTorch | no disponible |
| Demucs | Separacion de fuentes | no disponible | PyTorch | no disponible |

No se han encontrado cifras de parametros, contexto ni rendimiento de estas alternativas en la informacion proporcionada, por lo que la comparacion cuantitativa queda como "no disponible".

## Limitaciones y advertencias

- No es un modelo de lenguaje: no genera texto, no razona y no soporta tool calling ni agentes. Cualquier expectativa en ese sentido es erronea.
- El modelo opera sobre espectrogramas ya calculados; el STFT y su inversion los realiza la aplicacion, de modo que su uso fuera de ese entorno requiere reimplementar ese paso.
- Esta atado al ecosistema Apple: el artefacto es un `.mlmodelc` con op set `ios18`, por lo que no se ejecuta directamente en otras plataformas sin reconversion.
- Riesgo de artefactos de separacion: como cualquier separador de fuentes, puede dejar residuos de voz en la instrumental o restos de instrumentos en la pista vocal; no se documentan metricas (SDR, SIR) en la informacion disponible.
- Sesgos y limitaciones de idioma: no disponible; al tratar audio, el comportamiento dependera del tipo de musica y mezcla sobre el que se entrene el checkpoint original.
- Ventana fija de 2 segundos: puede afectar a la coherencia en pasajes largos o con cambios bruscos si no se gestiona bien el solape entre segmentos (no se documenta la estrategia de solape).
- Licencia MIT: permite uso comercial, pero es responsabilidad del integrador respetar el NOTICE y las atribuciones de los componentes originales (Mel-Band RoFormer, checkpoint de KimberleyJensen, implementacion de lucidrains, codigo de ZFTurbo).
- Modelo mirror: la publicacion solo mantiene los archivos originales; no se ofrecen garantias de soporte ni actualizaciones por parte del autor del mirror.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/My-Name-Is-Jeff/vitrine-sing
- Modelo original (mirror de): https://huggingface.co/Darkkos/spoti-sing
- Checkpoint base KimberleyJSN/melbandroformer: https://huggingface.co/KimberleyJSN/melbandroformer/tree/ac9b0614ab3cd7f77219e18ba494dfd93956c348
- Conversion a Core ML (coreai-model-zoo): https://github.com/john-rocky/coreai-model-zoo/tree/5029e6df8100650fe175d3e276fffb0177754ca1/conversion/melband_roformer
- Repositorio de exportacion: `harness/sing/export_coreml.py` en el repositorio spoti.pw (no se proporciona URL directa)

Nota: los resultados de busqueda web disponibles no guardan relacion con el modelo (contenido sobre television, joyeria, correo y linguistica), por lo que no aportan enlaces relevantes.
