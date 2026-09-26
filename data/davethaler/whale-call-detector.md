# davethaler/whale-call-detector

## Resumen

Whale-call-detector es un modelo de clasificación de audio desarrollado por el usuario davethaler y publicado en HuggingFace. Se trata de un ajuste fino (fine-tuning) del modelo MIT/ast-finetuned-audioset-10-10-0.4593, un Audio Spectrogram Transformer (AST) preentrenado sobre AudioSet con 527 clases de sonidos generales. El modelo resultante clasifica fragmentos de audio en ocho categorías acústicas: Water, Resident, Transient, Humpback, Vessel, Jingle, Human y Bird, combinando llamadas de distintas especies de cetáceos con fuentes de ruido ambiental y antropogénico.

El modelo resuelve un problema concreto de bioacústica marina: la detección y discriminación automática de vocalizaciones de ballenas frente a ruido de fondo, tráfico marítimo u otras fuentes sonoras. Con 86.194.952 parámetros (aproximadamente 86 M, en el rango típico de un AST base), es un modelo compacto que puede ejecutarse en hardware modesto, incluida CPU o GPUs de gama de consumo.

Es relevante en el contexto actual de monitorización acústica pasiva (PAM) marina, donde la cantidad de grabaciones generadas por boyas, hidrófonos y planeadores submarinos supera con creces la capacidad de análisis manual. Un clasificador ligero con una accuracy declarada de 0,9368 en el conjunto de evaluación permite filtrar y etiquetar automáticamente horas de audio en el borde (edge computing) o en centros de datos pequeños. La licencia BSD-3-Clause facilita su integración en proyectos comerciales y de investigación sin las restricciones de licencias copyleft.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Audio Spectrogram Transformer (AST), transformer de visión aplicado a espectrogramas mel |
| Parametros totales | 86.194.952 (aproximadamente 86 M) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada; la arquitectura AST del modelo base procesa habitualmente ventanas de audio de 10 s a 16 kHz |
| Tipos de cuantizacion | no disponible; al ser safetensors puede cuantizarse a fp16, int8 o int4 con herramientas externas (ONNX Runtime, Optimum, PyTorch) |
| Idiomas soportados | no aplica (modelo de audio); idiomas no disponibles |
| Licencia | BSD-3-Clause |
| Formato de pesos | safetensors (libreria transformers) |
| Numero de clases de salida | 8 (Water, Resident, Transient, Humpback, Vessel, Jingle, Human, Bird) |
| Modelo base | MIT/ast-finetuned-audioset-10-10-0.4593 |
| Tamano del repositorio | 111,5 GB |
| Descargas | 547 |
| Likes | 0 |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura Audio Spectrogram Transformer del checkpoint MIT/ast-finetuned-audioset-10-10-0.4593. AST es un transformer sin convoluciones que trata el espectrograma mel de audio como una imagen: divide la representacion tiempo-frecuencia en parches solapados, los proyecta linealmente y los procesa con bloques de auto-atencion, anadiendo un token de clasificacion (CLS) cuya representacion final alimenta la cabeza de clasificacion. Este diseno fue introducido por Gong et al. (2021) y alcanza resultados de estado del arte en AudioSet, superando a arquitecturas convolucionales previas. El ajuste fino anade una cabeza de clasificacion de 8 clases sobre el backbone preentrenado.

El entrenamiento se realizo con el Trainer de HuggingFace y los siguientes hiperparametros: learning rate 3e-05, batch de entrenamiento y evaluacion de 8, 5 epocas, semilla 42, optimizador AdamW fused (betas 0,9 y 0,999, epsilon 1e-08), scheduler lineal con 24 pasos de warmup y 240 pasos totales (48 pasos por epoca). El dataset de entrenamiento aparece como "None" en la model card, por lo que no se dispone de informacion sobre su composicion, numero de muestras, procedencia geografica ni tecnicas de aumento de datos. No se documenta uso de RLHF, DPO ni decodificacion especulativa, algo esperable en un modelo discriminativo de clasificacion. Las versiones de framework declaradas son Transformers 5.17.0, PyTorch 2.14.0+cu130, Datasets 5.0.1 y Tokenizers 0.23.2.

## Capacidades

- Clasificacion de audio en 8 categorias discretas: Water, Resident, Transient, Humpback, Vessel, Jingle, Human y Bird.
- Deteccion de vocalizaciones de ballenas: distingue entre llamadas de tipo Resident, Transient, Humpback y Jingle, correspondientes a distintos ecotipos y especies.
- Discriminacion de ruido antropogenico: la clase Vessel permite identificar presencia de embarcaciones en la grabacion.
- Deteccion de fuentes biologicas no cetaceas: clase Bird para vocalizaciones de aves.
- Deteccion de actividad humana: clase Human (F1 de 1,0 en evaluacion).
- Clasificacion de ruido ambiental: clase Water para sonido de fondo oceanico.
- Integracion con el pipeline audio-classification de Transformers y con endpoints de HuggingFace (etiqueta endpoints_compatible).
- Soporte de tool calling, agentes, razonamiento multi-paso, vision o audio generativo: no disponible (no son capacidades de este modelo).
- Capacidades multilingues: no aplica, el modelo opera sobre senal acustica, no sobre texto.

## Casos de uso

- Monitorizacion acustica pasiva marina (PAM): el modelo procesa grabaciones continuas de hidrofonos y etiqueta cada fragmento con la clase correspondiente, permitiendo a los investigadores filtrar horas de audio y quedarse solo con los segmentos que contienen llamadas de interes.
- Mitigacion de colisiones entre buques y cetaceos: integrado en sistemas de boyas o planeadores autonomos, detecta en tiempo real la presencia de ballenas y activa alertas para que las embarcaciones reduzcan velocidad o modifiquen rumbo en zonas de riesgo.
- Estimacion de exposicion al ruido antropogenico: la clase Vessel permite cuantificar la presencia de trafico maritimo en un entorno acustico, dato util para estudios de impacto ambiental y regulacion del ruido submarino.
- Etiquetado y curacion de grandes corpus de bioacustica: el modelo puede usarse como preanotador para acelerar la construccion de datasets etiquetados de sonidos marinos, con revision humana posterior.
- Investigacion sobre distribucion y estacionalidad de especies: procesando archivos historicos de distintas ubicaciones, se pueden generar mapas de presencia temporal de ecotipos como Resident o Transient.
- Educacion y divulgacion cientifica: integrado en aplicaciones o demos interactivas que clasifican en directo un flujo de audio submarino, mostrando al usuario que tipo de fuente sonora se esta captando.
- Investigacion en bioacustica comparada: el analisis de las clases Bird y Water permite separar senales no cetaceas y estudiar la superposicion de nichos acusticos en un mismo entorno.
- Despliegue en edge computing: con 86 M de parametros, el modelo puede ejecutarse en dispositivos embarcados o con CPU dentro de una boya, clasificando localmente y transmitiendo solo los eventos relevantes para ahorrar ancho de banda.

## Benchmarks y rendimiento

Resultados declarados por el autor en el conjunto de evaluacion, en la ultima epoca (epoca 5):

| Metrica | Valor |
|---|---|
| Loss (evaluacion) | 0,2307 |
| Accuracy | 0,9368 |
| Precision | 0,9425 |
| Recall | 0,9368 |
| F1 global | 0,9073 |

F1 por clase en la evaluacion final (epoca 5):

| Clase | F1 |
|---|---|
| Water | 0,9474 |
| Resident | 0,9362 |
| Transient | 0,8571 |
| Humpback | 0,9286 |
| Vessel | 0,9524 |
| Jingle | 0,9231 |
| Human | 1,0 |
| Bird | 0,9565 |

Evolucion por epoca de las metricas globales y de perdida:

| Epoca | Paso | Loss entrenamiento | Loss validacion | Accuracy | Precision | Recall | F1 |
|---|---|---|---|---|---|---|---|
| 1 | 48 | 0,8467 | 0,4200 | 0,8737 | 0,8905 | 0,8737 | 0,8104 |
| 2 | 96 | 0,0743 | 0,3359 | 0,8842 | 0,8908 | 0,8842 | 0,9134 |
| 3 | 144 | 0,0112 | 0,2514 | 0,9158 | 0,9245 | 0,9158 | 0,8755 |
| 4 | 192 | 0,0015 | 0,2303 | 0,9368 | 0,9425 | 0,9368 | 0,9073 |
| 5 | 240 | 0,0007 | 0,2312 | 0,9368 | 0,9425 | 0,9368 | 0,9073 |

No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks de texto, ya que no son aplicables a un modelo de clasificacion de audio. El model-index del repositorio no contiene entradas de resultados adicionales.

## Requisitos de hardware

- VRAM estimada en fp32: aproximadamente 345 MB solo para pesos, mas activaciones y buffers de inferencia (del orden de 1-2 GB en total).
- VRAM estimada en fp16: aproximadamente 172 MB de pesos.
- VRAM estimada en int8: aproximadamente 86 MB de pesos.
- Cabe holgadamente en cualquier GPU de consumo: RTX 3060, RTX 4060, RTX 4090, e incluso en GPUs integradas o CPU. No requiere A100 ni H100.
- Puede ejecutarse en CPU con latencias aceptables para procesado por lotes offline; para streaming en tiempo real se recomienda GPU o aceleradores tipo NVIDIA Jetson.
- Opciones de despliegue: pipeline audio-classification de Transformers, Hugging Face Inference Endpoints (el repositorio esta marcado como endpoints_compatible), TorchServe, Triton Inference Server, ONNX Runtime mediante Optimum, y exportacion a formatos moviles/lite para edge.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto/entrada | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| davethaler/whale-call-detector | 86 M | no disponible; ventana tipica AST de 10 s a 16 kHz | Accuracy 0,9368, F1 0,9073 en 8 clases (datos del autor) | BSD-3-Clause | HuggingFace |
| MIT/ast-finetuned-audioset-10-10-0.4593 | aproximadamente 87 M (AST base) | 10 s a 16 kHz, espectrograma mel de 128 x 1024 | mAP 0,4593 en AudioSet (527 clases) | BSD-3-Clause | HuggingFace |
| BEATs (Microsoft) | no disponible | audio general, preentrenado con destilacion | no disponible para deteccion de cetaceos | MIT (segun publicacion) | GitHub y HuggingFace |
| PaSST | no disponible | espectrograma con parches desplazados | no disponible para deteccion de cetaceos | no disponible | GitHub |
| YAMNet (Google) | aproximadamente 3,7 M | 0,975 s a 16 kHz | AudioSet, 521 clases, sin clases de cetaceos especificas | Apache-2.0 | TensorFlow Hub |

No se dispone de comparativas publicadas entre whale-call-detector y otros clasificadores de bioacustica marina bajo un mismo conjunto de prueba, por lo que la comparacion de rendimiento entre modelos queda como no disponible.

## Limitaciones y advertencias

- El dataset de entrenamiento aparece como "None" en la model card: se desconoce su composicion, tamano, procedencia geografica y balance de clases, lo que impide evaluar sesgos y generalizacion.
- Riesgo de sesgo geografico y de especie: al no documentarse la procedencia de los datos, es probable que el modelo rinda peor en poblaciones o cuencas oceanicas distintas de las usadas para el ajuste fino.
- Las clases Resident y Transient corresponden a ecotipos de orca del Pacifico noroeste; su aplicacion a otras regiones puede no ser valida.
- La clase Jingle es especifica de un tipo de vocalizacion de la ballena franca del Atlantico norte; el modelo puede confundirla con otras senales en aguas donde esa especie no esta presente.
- Riesgo de falsos positivos y negativos en condiciones de ruido extremo, solapamiento de fuentes o baja relacion senal-ruido.
- La clase Human alcanza F1 de 1,0 en el conjunto de evaluacion, lo que sugiere un posible desequilibrio o una facilidad excesiva de esa clase; conviene verificar con datos externos.
- La clase Transient presenta el F1 mas bajo (0,8571), lo que indica mayor dificultad de discriminacion frente a otras clases.
- La ventana de audio del modelo no se documenta; la arquitectura AST base suele requerir entradas de duracion fija (habitualmente 10 s), lo que limita la clasificacion de eventos mas cortos o mas largos sin segmentacion previa.
- No hay resultados de benchmarks externos ni evaluaciones independientes; todas las metricas son las declaradas por el autor.
- La licencia BSD-3-Clause permite uso comercial y modificacion, pero exige conservar el aviso de copyright y la clausula de exencion de responsabilidad; ademas, al derivar del checkpoint de MIT, conviene verificar los terminos del modelo base.
- El tamano del repositorio (111,5 GB) es desproporcionado respecto al numero de parametros (86 M), probablemente por copias de checkpoints; hay que revisar antes de descargar.
- No hay informacion sobre calibracion de probabilidades, umbrales de decision recomendados ni comportamiento en distribuciones fuera de dominio.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/davethaler/whale-call-detector
- Modelo base: https://huggingface.co/MIT/ast-finetuned-audioset-10-10-0.4593
- Paper del Audio Spectrogram Transformer (Gong et al., 2021): https://arxiv.org/abs/2104.01778
- Repositorio oficial de AST de MIT: https://github.com/YuanGongND/ast
- AudioSet (Google): https://research.google.com/audioset/
- Paper de BEATs (Chen et al., 2022): https://arxiv.org/abs/2212.01845
- Repositorio de BEATs: https://github.com/microsoft/unilm/tree/master/beats
- PaSST: https://github.com/kkoutini/PaSST
- YAMNet en TensorFlow Hub: https://tfhub.dev/google/yamnet/1
