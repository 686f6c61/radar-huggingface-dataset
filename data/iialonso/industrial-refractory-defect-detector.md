# iialonso/industrial-refractory-defect-detector

## Resumen

Industrial Refractory Defect Detector es un modelo de vision por computador para clasificacion de imagenes, publicado por el autor iialonso (I. Alonso) en HuggingFace bajo licencia Apache 2.0. Su proposito es inspeccionar revestimientos refractarios de hornos de alta temperatura (hornos rotativos y de reverbero de fusion de aluminio, cucharas metalurgicas) y detectar cuatro estados concretos de la superficie: revestimiento nominal intacto, desprendimiento termico (thermal spalling), acumulacion de escoria y sales (dross/slag buildup) y riesgo de punto caliente con peligro de perforacion de la carcasa.

El modelo se distribuye a traves de la libreria transformers y la tarea declarada es image-classification, con etiquetas en ingles y espanol en el repositorio. La model card describe un backbone Vision Transformer (ViT-Base-Patch16) o Swin Transformer con cabezas de proyeccion de parches ajustadas, entrada RGB o mapas radiometricos en falso color de 224x224x3, y despliegue objetivo en inferencia edge industrial (NVIDIA Jetson, Intel OpenVINO, ONNX Runtime). No se especifica el numero de parametros, el volumen de datos de entrenamiento ni el formato de pesos.

Su relevancia es acotada pero clara: cubre un nicho industrial muy especifico (metalurgia del aluminio y mantenimiento refractario) donde los clasificadores genericos de ImageNet no ofrecen la taxonomia de defectos ni la integracion con imagen radiometrica. No obstante, el repositorio registra 0 descargas y 0 likes en el momento de la consulta, y las metricas publicadas son autorreportadas, sin detalle del conjunto de validacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision Transformer (ViT-Base-Patch16) o Swin Transformer con cabezas de proyeccion de parches ajustadas |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (clasificacion de imagenes; entrada de 224x224x3) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en, es (segun metadatos del repositorio) |
| Licencia | Apache 2.0 |
| Formato de pesos | no disponible |
| Tarea (pipeline) | image-classification |
| Resolucion de entrada | 224 x 224 x 3 (RGB optico o mapa radiometrico en falso color) |
| Clases de salida | 4: nominal_intact, thermal_spalling, dross_slag_buildup, hotspot_burnout_risk |
| Entornos objetivo | NVIDIA Jetson, Intel OpenVINO, ONNX Runtime (inferencia edge) |
| Libreria | transformers |
| Fecha de publicacion | 2026-10-11 |

## Arquitectura y entrenamiento

La model card indica un backbone de Vision Transformer (ViT-Base-Patch16) o Swin Transformer, con cabezas de proyeccion de parches ajustadas de forma especifica para el dominio. La entrada es una imagen de 224x224x3, que puede ser una captura optica RGB o un mapa radiometrico de temperatura en falso color, lo que permite alimentar el modelo tanto con camaras convencionales como con pirometria infrarroja. La salida es una clasificacion en cuatro clases mutuamente excluyentes que describen el estado del revestimiento refractario.

Segun el autor, el entrenamiento se realizo sobre imagenes opticas de alta temperatura e imagenes radiometricas infrarrojas recogidas en campanas de hornos de alta temperatura. No se detalla el numero de imagenes, la composicion exacta del dataset, el esquema de aumento de datos, la resolucion original de captura ni si se aplicaron tecnicas de ajuste fino adicionales como RLHF o DPO (no aplicables en un clasificador de imagenes). Tampoco se documenta el proceso de etiquetado, el numero de anotadores ni el acuerdo inter-anotador. La unica innovacion tecnica explicitamente descrita es la combinacion de imagen optica y radiometrica bajo una misma taxonomia de defectos orientada a mantenimiento predictivo.

## Capacidades

- Clasificacion de imagenes en cuatro clases de estado del revestimiento refractario: `nominal_intact`, `thermal_spalling`, `dross_slag_buildup` y `hotspot_burnout_risk`.
- Procesamiento indistinto de imagen optica RGB y de mapas radiometricos de temperatura en falso color a 224x224x3.
- Deteccion de riesgo de perforacion de carcasa asociado a gradientes de temperatura superiores a 350 grados centigrados en la superficie (clase `hotspot_burnout_risk`).
- Integracion directa con el pipeline `image-classification` de la libreria transformers.
- Orientacion a despliegue en dispositivos edge industriales (NVIDIA Jetson, Intel OpenVINO, ONNX Runtime).
- No se documenta soporte de tool calling, function calling, agentes, razonamiento multi-paso, generacion de texto, codigo, matematicas, vision general, audio ni modo de razonamiento explicito.
- Capacidad multilingue no aplicable a la tarea (la salida son etiquetas de clase); las etiquetas de idioma en/ es corresponden a los metadatos del repositorio.

## Casos de uso

- Inspeccion automatizada de hornos rotativos de fusion de aluminio: una camara fija o montada en dron captura la pared refractaria y el modelo clasifica cada fotograma, generando un mapa de estado del revestimiento por zona y campana.
- Mantenimiento predictivo con pirometria infrarroja: alimentando el clasificador con mapas radiometricos en falso color, se detectan de forma temprana los puntos calientes con riesgo de perforacion de carcasa y se prioriza la intervencion antes de una parada no programada.
- Vigilancia continua en cucharas metalurgicas: integrado en una camara de proceso, el modelo alerta cuando aparece desprendimiento termico o acumulacion de escoria que reduce la transferencia de calor.
- Planificacion de paradas de planta: el historico de clasificaciones por zona permite estimar la evolucion del desgaste refractario y planificar la reparacion en la siguiente ventana de mantenimiento.
- Control de calidad del revestimiento tras una reparacion: se verifica que las zonas reparadas se clasifican como `nominal_intact` antes de devolver el horno a servicio.
- Optimizacion de consumo energetico: la deteccion de acumulacion de escoria y sales permite programar la limpieza y recuperar eficiencia de transferencia termica en la fusion.
- Despliegue en edge sin conectividad cloud: al orientarse a NVIDIA Jetson y OpenVINO, puede ejecutarse en la propia planta y procesar imagenes localmente, evitando enviar imagenes de proceso a servicios externos.

## Benchmarks y rendimiento

Metricas publicadas en la model card del autor (clasificacion por clase, sin detalle del conjunto de evaluacion):

| Clase | Precision | Recall | F1-Score |
|---|---|---|---|
| `nominal_intact` | 0.962 | 0.958 | 0.960 |
| `thermal_spalling` | 0.938 | 0.945 | 0.941 |
| `dross_slag_buildup` | 0.924 | 0.931 | 0.927 |
| `hotspot_burnout_risk` | 0.985 | 0.991 | 0.988 |
| Macro average | 0.952 | 0.956 | 0.954 |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la informacion disponible, ya que se trata de un modelo de clasificacion de imagenes y no de un modelo de lenguaje.

## Requisitos de hardware

- La model card no publica requisitos de VRAM ni medidas de latencia o throughput. Las cifras siguientes son estimaciones orientativas basadas en el backbone declarado (ViT-Base-Patch16, del orden de 86 millones de parametros) y no estan verificadas por el autor.
- VRAM estimada para pesos: aproximadamente 0,35 GB en fp32 y 0,18 GB en fp16; anadiendo activaciones y overhead de runtime, la inferencia cabria holgadamente en GPUs con 2-4 GB de memoria.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU moderna (RTX 3060, RTX 4060, RTX 4090) y tambien en placas integradas o aceleradores de baja potencia.
- GPU profesionales: no requiere A100 ni H100; una T4, L4 o incluso una GPU integrada es suficiente para inferencia por imagen.
- Edge: NVIDIA Jetson (familia Nano/Orin), Intel OpenVINO sobre CPU o iGPU, y ONNX Runtime, tal como indica la model card.
- Opciones de despliegue: pipeline de transformers en PyTorch, exportacion a ONNX Runtime, OpenVINO, y servicios de inferencia genericos (por ejemplo NVIDIA Triton o TorchServe). vLLM, llama.cpp, Ollama y TGI no son aplicables a un clasificador de imagenes.
- Latencia y throughput: no disponibles. En una GPU de gama media cabe esperar latencias del orden de milisegundos por imagen a 224x224, pero es una estimacion no confirmada por el autor.

## Comparativa con modelos similares

No se han publicado comparativas directas entre este modelo y alternativas de la misma categoria en la informacion disponible. Como referencia cualitativa, los enfoques habituales para el mismo problema serian:

| Alternativa | Tipo | Parametros | Contexto / entrada | Licencia | Datos comparativos |
|---|---|---|---|---|---|
| iialonso/industrial-refractory-defect-detector | ViT / Swin ajustado | no disponible | imagen 224x224x3 | Apache 2.0 | F1 macro 0.954 (autorreportado) |
| Clasificador ViT-Base/16 ajustado a dominio industrial | Transformer de vision | no disponible | imagen 224x224x3 | depende del checkpoint base | no disponible |
| CNN clasica ajustada (por ejemplo ResNet-50) | CNN | no disponible | imagen 224x224x3 | depende del checkpoint base | no disponible |
| Metodos de deteccion de anomalias no supervisados (PatchCore, PaDiM) | Embeddings + distancia | no disponible | imagen de mayor resolucion | habitualmente permisiva | no disponible |

No se dispone de numeros comparables de rendimiento, coste computacional ni cobertura de clases para estas alternativas, por lo que la comparacion cuantitativa no es posible con la informacion proporcionada.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados. No hay informacion sobre la distribucion de plantas, tipos de horno, camaras o condiciones de iluminacion representadas en el conjunto de entrenamiento, por lo que el modelo podria degradarse en instalaciones con caracteristicas distintas.
- Riesgo de alucinacion y falsos negativos: en un clasificador, el riesgo equivalente es la clasificacion erronea. La clase critica `hotspot_burnout_risk` presenta el mejor rendimiento declarado (F1 0.988), pero la clase con peor F1 es `dross_slag_buildup` (0.927). Cualquier uso como sistema de seguridad debe acompanarse de verificacion humana.
- Metricas autorreportadas: las cifras de precision, recall y F1 provienen exclusivamente de la model card. No se especifica el tamano del conjunto de test, su procedencia, si hay separacion por campana o por planta, ni si existen fugas de datos entre entrenamiento y validacion.
- Limitaciones de contexto e idioma: el modelo no procesa texto ni mantiene contexto conversacional; su unica entrada es una imagen de 224x224x3. Las etiquetas de idioma en/ es no implican capacidades linguisticas.
- Ambiguedad arquitectonica: la model card menciona dos backbones posibles (ViT-Base-Patch16 o Swin Transformer) sin concretar cual corresponde a los pesos publicados, lo que dificulta reproducir el entorno de ejecucion.
- Falta de informacion de reproducibilidad: no se documentan el dataset, el numero de imagenes, el esquema de aumentos, la semilla, la configuracion de entrenamiento ni el formato de pesos.
- Validacion comunitaria nula: el repositorio registra 0 descargas y 0 likes en el momento de la consulta, por lo que no existe evidencia independiente de su comportamiento.
- Licencia: Apache 2.0 permite uso comercial, modificacion y redistribucion, con obligacion de conservar el aviso de licencia y el fichero NOTICE si existe. No se declaran restricciones adicionales de uso.
- Advertencia para produccion: dado que se trata de un modelo de inspeccion de activos industriales criticos, no deberia ser el unico criterio para decisiones de parada, intervencion o seguridad. Se recomienda validacion en la planta objetivo antes de cualquier despliegue.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/iialonso/industrial-refractory-defect-detector
- Perfil del autor en HuggingFace: https://huggingface.co/iialonso
- Repositorio GitHub del autor: https://github.com/ioseba
- Licencia Apache 2.0: https://opensource.org/licenses/Apache-2.0
- PyTorch: https://pytorch.org/
- No se han encontrado papers, blogs tecnicos, demos ni repositorios adicionales en la informacion disponible.
