# HirCoir/neo-tts-studio-native-1-2

## Resumen

Neo TTS Studio 1.2 es una distribucion de herramientas nativas para sintesis de voz y entrenamiento de modelos TTS, publicada por el usuario HirCoir en HuggingFace. El repositorio no contiene pesos de un modelo de voz, sino cuatro paquetes ejecutables completos (Linux x64 y Windows x64, en variante CPU y CUDA) que incluyen un motor de entrenamiento e inferencia escrito en C++17, herramientas de exportacion y un panel de Axolotl. El tamano total del repositorio es de 6,9 GB.

La relevancia del paquete es practica: permite entrenar y ejecutar TTS en local, sin servicios en la nube, tanto en CPU como en GPU NVIDIA, y ofrece un cuaderno de Google Colab que descarga y verifica automaticamente el paquete Linux. El autor advierte de que la edicion CUDA para Windows esta compilada con LibTorch CUDA 12.8 pero no se ha probado todavia en un equipo Windows con GPU NVIDIA, y de que la edicion actual es monohablante.

La informacion publicada no incluye la arquitectura del modelo de voz subyacente, el numero de parametros, los idiomas concretos soportados, la licencia ni resultados de benchmarks. El repositorio registra 0 descargas y 0 "likes" en el momento de la consulta, por lo que no existe validacion externa de la comunidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (el repositorio distribuye un motor C++17 de entrenamiento e inferencia; no documenta la arquitectura del modelo de voz) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no se describe una arquitectura MoE) |
| Longitud de contexto | no disponible (no aplica de forma directa a un sistema TTS) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | monohablante; idioma concreto no disponible |
| Licencia | no disponible |
| Formato de pesos | checkpoints con extension `.ckpt`; el autor distingue `last-native.ckpt` (reanudar entrenamiento) de `last.ckpt` (compacto, solo pesos de inferencia) |
| Formato de distribucion | `neo-tts-studio-linux-x64-cpu.tar.gz`, `neo-tts-studio-linux-x64-cuda.tar.gz`, `neo-tts-studio-windows-x64-cpu.zip`, `neo-tts-studio-windows-x64-cuda.zip` |
| Tamano del repositorio | 6,9 GB |
| Pipeline declarado | text-to-speech |
| Fecha de creacion | 2026-10-12 |
| Ultima actualizacion | 2026-10-12 |

## Arquitectura y entrenamiento

La model card no describe la arquitectura del modelo de voz. Lo que si se detalla es la arquitectura del software que lo acompana: un motor de entrenamiento e inferencia implementado en C++17, con compilaciones separadas para CPU y para GPU NVIDIA (esta ultima construida con LibTorch CUDA 12.8), y una interfaz de panel Axolotl para gestionar el entrenamiento. Los checkpoints se cargan en formato `.ckpt`, y el flujo de trabajo documentado permite subir un checkpoint y su `config.json` desde el navegador, asi como reanudar un entrenamiento previo a partir de `last-native.ckpt`.

No hay informacion sobre el volumen de datos de entrenamiento, la composicion del dataset, el uso de RLHF, DPO u otras tecnicas de alineamiento, ni sobre innovaciones tecnicas concretas del modelo de sintesis (por ejemplo, tipo de decodificador, vocoder o representacion acustica). Tampoco se indica el idioma sobre el que se ha entrenado, mas alla de la afirmacion de que la edicion actual es monohablante. El autor senala explicitamente que el paquete no contiene modelos de voz privados, credenciales ni datasets.

## Capacidades

- Sintesis de texto a voz: el repositorio esta etiquetado con el pipeline `text-to-speech` y el paquete esta orientado a inferencia TTS.
- Entrenamiento y ajuste fino de voces: incluye motor de entrenamiento y panel Axolotl, con reanudacion desde checkpoints intermedios.
- Exportacion de checkpoints: distingue entre checkpoints completos de entrenamiento y checkpoints compactos de solo inferencia.
- Interfaz web local: servidor en `http://127.0.0.1:8787` (arranque con `--webui --port 8787`) para cargar archivos, seleccionar checkpoints y lanzar trabajos.
- Carga de modelos propios: seleccion de archivos `.ckpt` y `config.json` desde el navegador mediante "Modelo y checkpoint -> Subir mis archivos".
- Ejecucion en Google Colab: cuaderno `NEO_TTS_STUDIO_COLAB.ipynb` que descarga y verifica el paquete Linux correspondiente y ejecuta Axolotl en el proxy local de Colab.
- Integridad de la distribucion: fichero `SHA256SUMS.txt` para verificar las sumas antes de ejecutar.
- Soporte de tool calling / function calling: no disponible (no documentado).
- Soporte de agentes y razonamiento multi-paso: no disponible (no documentado).
- Capacidades multilingues: no disponibles; la edicion actual es monohablante segun el autor.
- Capacidades de vision, audio de entrada o modo "thinking": no disponibles (no documentadas).

## Casos de uso

- Creacion de voces sinteticas propias en local: el usuario puede entrenar un modelo de voz con sus propios datos usando el motor C++17 y el panel Axolotl, sin enviar audio a servicios externos, siempre que respete las condiciones de licencia (no disponibles).
- Despliegue de inferencia TTS sin conexion: en entornos con requisitos de confidencialidad (sanidad, legal, defensa) se puede ejecutar la variante CUDA o CPU en una estacion de trabajo aislada, con la interfaz web escuchando solo en `127.0.0.1`.
- Generacion de audio para doblaje o audiolibros: al ser una edicion monohablante, encaja en proyectos de narracion en un unico idioma, con control de la voz mediante checkpoints propios.
- Prototipado rapido en Google Colab: el cuaderno incluido descarga y comprueba el paquete Linux, permite probar el flujo de Axolotl sin instalacion local y, si se monta Google Drive, persistir los datos en `MyDrive/NeoTTS/Studio`.
- Formacion y experimentacion academica: el acceso directo al motor de entrenamiento y a los checkpoints intermedios (`last-native.ckpt`) facilita reproducir y comparar ajustes finos sobre una misma base.
- Integracion en flujos internos de automatizacion: el servidor local expuesto en el puerto 8787 puede invocarse desde scripts de la misma maquina para generar audio a partir de texto, aunque no se documenta una API formal ni limites de concurrencia.
- Evaluacion comparativa de checkpoints: la carga de `.ckpt` y `config.json` desde el navegador permite alternar entre distintos modelos entrenados y evaluar subjetivamente la calidad de cada uno antes de decidir cual se despliega.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

No se dispone de valores de MMLU, HumanEval, GSM8K ni de metricas habituales en TTS como MOS, WER, RTF o latencia, ni de comparaciones con otros sistemas.

## Requisitos de hardware

- Espacio en disco: el repositorio ocupa 6,9 GB; conviene reservar al menos el doble (unos 14 GB) para la descarga y la extraccion de los paquetes comprimidos.
- Variante CPU: requiere un equipo Linux x64 o Windows x64; no necesita GPU. No se documentan requisitos minimos de nucleos, memoria RAM ni rendimiento (RTF) esperado.
- Variante CUDA: requiere GPU NVIDIA y controladores compatibles con CUDA 12.8, segun indica el autor (LibTorch CUDA 12.8). No se especifica VRAM minima ni GPU recomendadas.
- GPU de consumo: no disponible. No hay datos que permitan confirmar el funcionamiento en RTX 4090, RTX 3090 ni en tarjetas de gama inferior.
- Aviso especifico de plataforma: la compilacion CUDA para Windows no se ha probado en un equipo Windows con GPU NVIDIA, por lo que su funcionamiento no esta verificado.
- Opciones de despliegue: ejecucion nativa (`./neo-tts.exe --webui --port 8787` en Windows; `./run.sh --webui --port 8787 --data "$HOME/NeoTTS/Studio"` en Linux) y ejecucion en Google Colab mediante `NEO_TTS_STUDIO_COLAB.ipynb`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que ademas no aplicarian a un motor TTS nativo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Neo TTS Studio 1.2 (HirCoir) | no disponible | no disponible | no disponible | no disponible | Binarios Linux/Windows x64 en HuggingFace, 0 descargas |
| Alternativas de la misma categoria | no disponible | no disponible | no disponible | no disponible | no disponible |

No es posible ofrecer una comparativa rigurosa: no se conocen la arquitectura, el tamano, la licencia ni los resultados del modelo subyacente, y el repositorio analizado es una distribucion de binarios y herramientas mas que un modelo publicado con pesos y especificaciones. Cualquier comparacion con otros sistemas TTS (por ejemplo, toolkits de sintesis con voces preentrenadas) seria especulativa y no se incluye.

## Limitaciones y advertencias

- Licencia no disponible: al no especificarse, no puede determinarse si el uso comercial, la redistribucion o la modificacion estan permitidos. Es un bloqueo potencial para cualquier despliegue en produccion.
- Modelo monohablante: el autor indica que la edicion actual trabaja en un unico idioma, sin especificar cual, lo que descarta escenarios multilingues.
- Ausencia total de benchmarks: no hay metricas objetivas de calidad, inteligibilidad, similitud de voz ni latencia.
- Sin validacion de la comunidad: 0 descargas y 0 "likes" en el momento de la consulta; no existen informes independientes de funcionamiento.
- Variante CUDA de Windows sin probar: el propio autor advierte de que no se ha validado en un equipo Windows con GPU NVIDIA.
- Binarios precompilados: la ejecucion de ejecutables de terceros implica un riesgo de seguridad; el autor recomienda verificar `SHA256SUMS.txt` antes de ejecutar, y conviene hacerlo en un entorno aislado.
- Panel sin autenticacion: la model card advierte de que no debe exponerse el panel sin autenticacion; el servidor esta pensado para uso local en `127.0.0.1`.
- Riesgo de uso indebido de la sintesis de voz: la clonacion o el entrenamiento de voces puede vulnerar derechos de imagen y voz, asi como normativas de proteccion de datos. El autor prohibe redistribuir checkpoints privados.
- Artefactos de sintesis: no hay informacion sobre pronunciacion de numeros, siglas, nombres propios, cambios de entonacion ni manejo de texto fuera del dominio de entrenamiento.
- Persistencia de datos en Colab: sin montar Google Drive, los datos almacenados en `/content` son temporales y se pierden al finalizar la sesion.
- Fecha de publicacion: los metadatos indican creacion y ultima actualizacion el 2026-10-12, lo que sugiere un proyecto muy reciente y sin historial de mantenimiento.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/HirCoir/neo-tts-studio-native-1-2
- Cuaderno de Colab incluido en el repositorio: `NEO_TTS_STUDIO_COLAB.ipynb`
- Sumas de verificacion: `SHA256SUMS.txt` (en el listado de archivos del repositorio)
- Paquetes de descarga: `neo-tts-studio-linux-x64-cpu.tar.gz`, `neo-tts-studio-linux-x64-cuda.tar.gz`, `neo-tts-studio-windows-x64-cpu.zip`, `neo-tts-studio-windows-x64-cuda.zip`
- Papers, blogs o demos adicionales: no disponibles. La busqueda web realizada no devolvio resultados relacionados con este proyecto; los unicos enlaces recuperados correspondian a Microsoft Clipchamp y no guardan relacion con el modelo.
