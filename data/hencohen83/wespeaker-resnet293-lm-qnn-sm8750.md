# hencohen83/wespeaker-resnet293-lm-qnn-sm8750

## Resumen

WeSpeaker ResNet293-LM es un modelo de extracción de embeddings de hablante (huellas de voz o *speaker embeddings*) de 256 dimensiones, desarrollado originalmente por el proyecto WeSpeaker (wenet-e2e) y entrenado sobre VoxCeleb. Este repositorio concreto, publicado por hencohen83, no modifica los pesos ni el entrenamiento del modelo: su aportación es exclusivamente de formato y despliegue, compilando la red a binarios de contexto QNN de 16 bits para la NPU Hexagon v79 del Snapdragon 8 Elite (SM8750), además de ofrecer una variante ONNX para CPU.

La relevancia práctica del modelo reside en su uso típico: verificación e identificación de hablante, diarización y autenticación biométrica por voz. La versión publicada aquí permite ejecutar la inferencia en la NPU de un dispositivo móvil con latencias muy bajas (del orden de 6 a 21 ms por huella según la longitud de la ventana), lo que habilita casos de uso en tiempo real sobre hardware de consumo.

Arquitectónicamente es una ResNet de 293 capas que opera sobre características fbank de Kaldi de 80 dimensiones y produce un vector L2-normalizable de 256 dimensiones. El repositorio incluye tres grafos QNN con formas fijas (150, 300 y 600 frames, es decir, 1,5, 3 y 6 segundos) y un `model.onnx` compatible con el extractor de CPU de sherpa-onnx.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ResNet293 (CNN residual) con *large margin finetune*, variante r-vector |
| Parametros totales | no disponible (tamano del artefacto ONNX: 114.336.566 bytes) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica; ventanas de audio de 150, 300 y 600 frames (1,5, 3 y 6 s) |
| Tipos de cuantizacion | QNN: activaciones de 16 bits, bias de 32 bits, coma flotante sin calibracion; ONNX en float32 |
| Idiomas soportados | no disponible (modelo independiente del idioma; entrenado sobre VoxCeleb) |
| Licencia | CC-BY-4.0 |
| Formato de pesos | binarios de contexto QNN (`.bin`) y ONNX (`model.onnx`) |

## Arquitectura y entrenamiento

El modelo es una red neuronal convolucional de tipo ResNet con 293 capas, empleada como extractor de *embeddings* de hablante en la tradición de los r-vectors. Toma como entrada características fbank de Kaldi de 80 dimensiones (ventanas de 25 ms cada 10 ms, audio a 16 kHz en rango de 16 bits, sin *dither*) y produce un vector de 256 dimensiones que se compara mediante similitud coseno. Fue entrenado por WeSpeaker sobre VoxCeleb (VoxCeleb2 Dev, con 5994 hablantes) e incorpora un ajuste final con *large margin*.

La innovación de este repositorio es de despliegue, no de modelado. En primer lugar, añade la normalización por media por enunciado que WeSpeaker asume durante el entrenamiento y que la versión estándar de sherpa-onnx no aplicaba: según el autor, la EER entre mismo y distinto hablante pasó del 31,8 % sin normalización al 18,2 % con ella. En el ONNX se implementa vía metadatos (`feature_normalize_type=global-mean`); en los grafos QNN, como primeras operaciones del grafo (ReduceMean sobre el eje temporal y Sub). En segundo lugar, fija las formas (batch 1 y las tres longitudes indicadas) y simplifica con onnxsim. Por último, compila con `qnn-onnx-converter` y `qnn-context-binary-generator` (QAIRT 2.40.0.251030) para SM8750.

## Capacidades

- Extracción de *embeddings* de hablante de 256 dimensiones a partir de audio de 16 kHz.
- Verificación de hablante (mismo/distinto) mediante similitud coseno entre huellas.
- Identificación de hablante contra una galería de referencia previamente enrolada.
- Procesamiento de ventanas de 1,5, 3 y 6 segundos; para audios más cortos se repiten frames hasta 150, y para más largos se promedian huellas L2-normalizadas de ventanas sucesivas.
- Ejecución en NPU Hexagon v79 del Snapdragon 8 Elite mediante binarios QNN de 16 bits.
- Ejecución en CPU mediante el extractor de sherpa-onnx con el ONNX incluido.
- No soporta generación de texto, razonamiento, código, visión, tool calling ni agentes; es un modelo puramente discriminativo de audio.

## Casos de uso

- Autenticación biométrica por voz en aplicaciones móviles: el modelo produce una huella de 256 dimensiones en unos 6 ms sobre la NPU para una ventana de 1,5 s, lo que permite verificar al usuario en el propio dispositivo sin enviar audio a la nube.
- Desbloqueo o confirmación de identidad en asistentes de voz: comparar la huella del hablante actual con la enrolada mediante coseno, con la ventaja de que la inferencia ocurre localmente en el Snapdragon 8 Elite.
- Diarización de reuniones y transcripciones: segmentar un audio largo en ventanas de 6 s, extraer huellas y agrupar por similitud para atribuir turnos de palabra; el parche de sherpa-onnx del autor ya integra este flujo.
- Enrolamiento de hablantes en sistemas de atención al cliente: generar y almacenar huellas de referencia por cliente para reconocerle en llamadas posteriores, usando la variante ONNX en servidor o la NPU en dispositivo.
- Control de acceso físico o lógico: sustituir o complementar PIN y contraseña con verificación de voz en terminales con chip Snapdragon 8 Elite.
- Filtrado y etiquetado de archivos de audio: procesar lotes de grabaciones para identificar hablantes recurrentes en podcasts, archivos periodísticos o material de investigación.
- Investigación en biometría de voz: usar el ONNX como referencia reproducible en CPU para comparar técnicas de normalización o de agregación de ventanas.

## Benchmarks y rendimiento

| Metrica | Valor |
|---|---|
| Similitud coseno NPU vs. CPU (mismas features) | ≥ 0,99996 en los tres grafos |
| EER mismo/distinto hablante sin normalización por media | 31,8 % |
| EER mismo/distinto hablante con normalización por media | 18,2 % |
| Tiempo por huella (1,5 s) en Galaxy S25 | ~6 ms (tiempo de reloj con E/S) |
| Tiempo por huella (3 s) en Galaxy S25 | ~10 ms |
| Tiempo por huella (6 s) en Galaxy S25 | ~21 ms |

No se han publicado resultados de benchmarks estándar (por ejemplo, EER sobre VoxCeleb1-O) en la información disponible.

## Requisitos de hardware

- NPU: Snapdragon 8 Elite (SM8750, Hexagon v79). Los binarios de contexto están ligados al chip y a la versión de QAIRT.
- Runtime: bibliotecas QNN 2.40.0.251030 (`libQnnHtp.so`, `libQnnHtpV79Skel.so`, `libQnnHtpV79Stub.so`, `libQnnSystem.so`), publicadas por sherpa-onnx como `qnn-libs-2.40.0.251030`, con `ADSP_LIBRARY_PATH` apuntando a su carpeta. No se incluyen en el repositorio.
- CPU: cualquier equipo capaz de ejecutar sherpa-onnx con el `model.onnx` de 114 MB; no se especifican requisitos de VRAM ni de RAM.
- GPU: no aplica; no se documenta soporte CUDA ni de otras GPU.
- Despliegue: sherpa-onnx con el parche `scripts/npu/sherpa-onnx-v2.0.1-qnn.patch` (configuración `SpeakerEmbeddingExtractorConfig.qnnConfig.contextBinary = "t150.bin,t300.bin,t600.bin"`) o el extractor de CPU estándar.
- Throughput y latencia: aproximadamente 6, 10 y 21 ms por huella para 1,5, 3 y 6 s respectivamente, medidos en un Galaxy S25.

## Comparativa con modelos similares

| Modelo | Parametros | Entrada / salida | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| hencohen83/wespeaker-resnet293-lm-qnn-sm8750 | no disponible (ONNX 114 MB) | fbank 80 dim / embedding 256 dim | ventanas de 1,5, 3 y 6 s | CC-BY-4.0 | QNN para SM8750 y ONNX para CPU |
| Wespeaker/wespeaker-voxceleb-resnet293-LM | no disponible | fbank / embedding | no disponible | no disponible en la informacion | pesos originales en Hugging Face |
| dusdn/wespeaker-voxceleb-resnet293-LM | no disponible | fbank / embedding | no disponible | no disponible en la informacion | pesos originales en Hugging Face |
| wespeaker_en_voxceleb_resnet293_LM.onnx (sherpa-onnx) | no disponible | fbank / embedding | no disponible | no disponible en la informacion | ONNX para CPU |

La diferencia principal frente a las otras tres entradas es el formato: solo esta versión incluye binarios QNN para NPU y la normalización por media incorporada en el grafo. No se dispone de datos comparativos de precisión entre estas variantes más allá de la equivalencia coseno indicada por el autor.

## Limitaciones y advertencias

- Los binarios QNN están ligados al chip SM8750 (Hexagon v79) y a la versión de QAIRT 2.40.0.251030; no funcionarán en otros SoC ni con otras versiones del runtime.
- Las bibliotecas QNN son propiedad de Qualcomm y no se distribuyen en el repositorio; es necesario obtenerlas por separado.
- El modelo está entrenado sobre VoxCeleb, por lo que puede presentar sesgos de dominio (idiomas, acentos, condiciones de grabación y demografía sobrerrepresentados en ese corpus).
- Riesgo de degradación en audio con ruido, reverberación o canales distintos a los de VoxCeleb; no se documentan métricas de robustez en estas condiciones.
- La EER reportada (18,2 %) corresponde a las conferencias del autor, no a un benchmark estándar, y no es directamente comparable con resultados publicados sobre VoxCeleb1-O.
- Para audios fuera de las tres longitudes soportadas hay que aplicar el esquema de repetición o promediado descrito; un uso incorrecto altera las huellas.
- La licencia CC-BY-4.0 permite uso comercial con atribución, pero los derechos sobre los pesos originales y sobre VoxCeleb deben respetarse según lo indicado por el autor.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay validación comunitaria independiente.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/hencohen83/wespeaker-resnet293-lm-qnn-sm8750
- Modelo original de WeSpeaker: https://huggingface.co/Wespeaker/wespeaker-voxceleb-resnet293-LM
- Réplica de los pesos originales: https://huggingface.co/dusdn/wespeaker-voxceleb-resnet293-LM
- Proyecto WeSpeaker: https://github.com/wenet-e2e/wespeaker
- VoxCeleb: https://mm.kaist.ac.kr/datasets/voxceleb/
- Modelo ONNX base de sherpa-onnx: https://github.com/k2-fsa/sherpa-onnx/releases/tag/speaker-recongition-models
- Parche de sherpa-onnx con soporte QNN: https://github.com/chencohensolutions/transcriptor-kmp
