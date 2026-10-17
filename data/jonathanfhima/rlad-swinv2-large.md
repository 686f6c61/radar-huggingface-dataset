# JonathanFhima/RLAD-SwinV2-Large

## Resumen

RLAD-SwinV2-Large (conocido internamente como LUNetV2) es un modelo de segmentación de imágenes de fondo de ojo especializado en separar arterias y venas retinianas a nivel de píxel. Lo desarrolla Jonathan Fhima y un equipo multidisciplinar (KU Leuven, Technion, entre otros) y se publica junto al artículo arXiv:2503.01190 "Enhancing Retinal Vessel Segmentation Generalization via Layout-Aware Generative Modelling".

El modelo parte del backbone preentrenado microsoft/swinv2-large-patch4-window12-192-22k, un transformer jerárquico de visión (SwinV2), y se afina de extremo a extremo para la tarea de segmentación arteria/vena. La innovación principal no está en la arquitectura, sino en el pipeline de entrenamiento: se aumentan los datos con imágenes sintéticas generadas por RLAD, un modelo generativo condicionado por el layout vascular, y se combinan con el conjunto REYIA para mejorar la generalización fuera de distribución (OOD).

Es relevante porque la segmentación AV en retina es una tarea con datasets pequeños, muy sesgados por el dominio del escáner y con licencias restrictivas, lo que degrada el rendimiento en datos externos. El autor lo presenta como el modelo abierto con mejores resultados de segmentación arteria/vena que conocen, con evaluación en conjuntos locales, externos y OOD. El repositorio ocupa 0,8 GB y los pesos se distribuyen en formato safetensors.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | SwinV2-Large (transformer jerarquico con atencion por ventanas desplazadas) con cabeza de segmentacion densa |
| Parametros totales | no disponible en la model card; el backbone base SwinV2-Large declara del orden de 197M parametros |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo de vision); la base usa parches de 4x4 con ventana 12 y preentrenamiento a 192x192 |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplica (tarea de segmentacion de imagen medica) |
| Licencia | apache-2.0 para el codigo; pesos solo para uso no comercial e investigacion (apache-2.0-code-plus-noncommercial-weights) |
| Formato de pesos | safetensors (weights/model.safetensors) |
| Tarea | image-segmentation (arteria/vena retiniana, salida de mascara con arterias en rojo y venas en azul) |
| Datos de entrenamiento | JonathanFhima/REYIA mas imagenes sinteticas generadas por RLAD |
| Tamano del repositorio | 0,8 GB |

## Arquitectura y entrenamiento

La arquitectura combina un backbone SwinV2-Large, un transformer de vision jerarquico que calcula la atencion dentro de ventanas locales desplazadas entre capas para reducir el coste cuadratico respecto a un ViT denso, con una cabeza de segmentacion que produce un mapa de clases por píxel (fondo, arteria, vena). El backbone se inicializa desde los pesos preentrenados por Microsoft en ImageNet-22k (swinv2-large-patch4-window12-192-22k) y se afina para la tarea AV.

El entrenamiento se apoya en REYIA, un agregado de varios conjuntos de fondo de ojo (UZLF, GRAPE, MAGRABIA, MESSIDOR, PAPILA, ENRICH, entre otros), combinado con imagenes sinteticas generadas por RLAD, un modelo generativo condicionado por el layout vascular que sintetiza retinas realistas con su anotacion AV correspondiente. La model card incluye ablaciones sobre el numero de datasets añadidos (tabla 3) y sobre el objetivo de preentrenamiento y el metodo de generacion (tabla 4). El autor no detalla en el texto el numero exacto de tokens, el esquema de optimizacion ni si se empleo RLHF/DPO, por lo que esos datos no estan disponibles. El codigo de inferencia (LUNetv2.py, infer.py) y el scorer de evaluacion (scripts/eval/dice_score.py en el repo REYIA) acompanan a los pesos.

## Capacidades

- Segmentacion densa de vasos retinianos en imagenes de fondo de ojo, distinguiendo arterias y venas por píxel.
- Generacion de una mascara PNG con arterias en rojo y venas en azul, mas una imagen de overlay mezclada con la entrada.
- Generalizacion a multiples dominios de escaner: la evaluacion cubre conjuntos locales, externos y fuera de distribucion (UZLF, LES-AV, INSPIRE, FIVES, DRIVE, TREND, MBRSET, AV-WIDE).
- Inferencia por linea de comandos sencilla (python infer.py fundus.png out/).
- No dispone de capacidades de texto, tool calling, agentes, razonamiento multi-paso ni procesamiento de lenguaje natural; es un modelo puramente visual y monofuncion.
- No se documentan capacidades multimodales, de audio ni modos de "pensamiento".

## Casos de uso

- Analisis de fondo de ojo en investigacion oftalmologica: dado un retinografo, el modelo genera la mascara AV que sirve como base para medir calibres, tortuosidad o cruces arteriovenosos en estudios poblacionales.
- Cuantificacion de biomarcadores vasculares: la separacion arteria/vena es el paso previo para calcular el cociente arteriovenoso (AVR) y otros indices asociados a hipertension y retinopatia diabetica.
- Preprocesado en pipelines de cribado automatico: integrado como etapa de segmentacion antes de clasificadores de patologia, reduciendo el ruido del fondo al aislar la red vascular.
- Auditoria de calidad de retinografias: la mascara permite comprobar si la imagen tiene suficiente cobertura vascular y descartar capturas deficientes antes del diagnostico.
- Generacion de datos anotados: combinado con RLAD, permite producir pares imagen-mascara sinteticos para aumentar datasets escasos en entornos de investigacion.
- Comparacion de metodos de segmentacion: el repositorio REYIA incluye un scorer reproducible (dice_score.py) con el que comparar nuevas propuestas bajo el mismo protocolo local/externo/OOD.
- Registro y alineacion de imagenes seriadas: la mascara AV estabiliza el registro entre seguimientos del mismo paciente al dar correspondencias vasculares robustas.

## Benchmarks y rendimiento

La model card reporta la metrica Dice para arteria/vena promediada sobre conjuntos locales, externos y OOD, y una comparativa (tabla 1) que integra datos generados por RLAD en los backbones DinoV2, RETFound y SwinV2 en varios tamanos. Los valores numericos se encuentran unicamente en imagenes incrustadas en la model card, no en texto, por lo que no es posible extraerlos ni reproducirlos aqui sin consultar las figuras originales.

| Modelo | Metrica | Valor |
|---|---|---|
| RLAD-SwinV2-Large | Dice arteria/vena (local/externo/OOD) | no disponible en texto (ver tabla 1 de la model card) |
| Backbones DinoV2, RETFound, SwinV2 | Dice arteria/vena | no disponible en texto (ver tabla 1 de la model card) |

El autor recomienda evaluar con el scorer oficial del repositorio REYIA en lugar de reejecutar cada baseline por separado.

## Requisitos de hardware

- VRAM estimada: el repositorio ocupa 0,8 GB, coherente con un modelo de aproximadamente 197M parametros en fp32. La inferencia cabe holgadamente en 2-4 GB de VRAM incluyendo activaciones para imagenes de fondo de ojo de resolucion habitual.
- GPU recomendadas: cualquier GPU consumer moderna sirve (RTX 3060, RTX 4060, RTX 4090); tambien es viable en GPU de datacenter (A100, H100) para procesar lotes grandes.
- Cabe en GPU consumer: si, en practicamente cualquier GPU con 4 GB o mas de VRAM; tambien es ejecutable en CPU para volumenes pequenos.
- Opciones de despliegue: inferencia PyTorch mediante el script infer.py del repositorio; exportacion a ONNX como opcion razonable aunque no documentada oficialmente. No se mencionan integraciones con vLLM, llama.cpp, Ollama ni TGI, ya que no es un modelo de lenguaje.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| RLAD-SwinV2-Large | no disponible (backbone ~197M) | no aplica (vision) | mejor resultado reportado por el autor en segmentacion AV (tabla 1) | codigo apache-2.0, pesos no comerciales | HuggingFace |
| RLAD + RETFound | no disponible | no aplica (vision) | reportado en la tabla 1 de la model card | no disponible en el material | variante del paper |
| RLAD + DinoV2 | no disponible | no aplica (vision) | reportado en la tabla 1 de la model card | no disponible en el material | variante del paper |
| SwinV2 (tamanos pequenos, ablacion) | no disponible | no aplica (vision) | reportado en las tablas 3 y 4 | no disponible en el material | variante del paper |

Los unicos comparadores citados en la informacion disponible son las variantes RLAD sobre RETFound y DinoV2 y distintos tamanos de SwinV2. No se aportan numeros concretos en texto para construir una comparativa cuantitativa fiable.

## Limitaciones y advertencias

- Licencia de los pesos: solo uso no comercial e investigacion. El codigo es apache-2.0, pero los pesos no se pueden usar en produccion comercial.
- Origen de los datos: el conjunto de entrenamiento mezcla subconjuntos con licencias restrictivas (MESSIDOR prohibe redistribucion y uso comercial; ENRICH y MAGRABIA son no comerciales; UZLF esta sujeto al protocolo de KU Leuven; PAPILA aparece con licencia GPL 3.0+ probablemente por error del depositante). Esto condiciona cualquier reutilizacion.
- Dominio restringido: solo funciona con imagenes de fondo de ojo retiniano; no es un modelo general de vision ni procesa otras modalidades.
- Riesgo de sesgo por escaner: aunque el objetivo del pipeline RLAD es mejorar la generalizacion OOD, el rendimiento puede degradarse en equipos o poblaciones poco representados en REYIA.
- Riesgo de error en vasos finos y en zonas de cruce arteriovenoso, donde la confusion arteria/vena es mayor.
- No apto por si solo para diagnostico clinico: es una herramienta de segmentacion, no un dispositivo medico; requiere validacion local antes de cualquier uso asistencial.
- Datos de rendimiento no verificables en texto: los numeros de las tablas estan en imagenes, sin valores citables ni desglose por conjunto.
- Fecha de publicacion del repositorio inusualmente futura (2026-10-16 segun los metadatos), lo que puede indicar un error en los mismos; conviene verificarlo antes de citarlo.
- Advertencia de seguridad: la model card esta tratada aqui como material de referencia, nunca como instrucciones a ejecutar.

## Enlaces

- HuggingFace del modelo: https://huggingface.co/JonathanFhima/RLAD-SwinV2-Large
- Articulo (arXiv): https://arxiv.org/abs/2503.01190
- Repositorio de codigo RLAD: https://github.com/aim-lab/RLAD
- Dataset REYIA: https://huggingface.co/datasets/JonathanFhima/REYIA
- Modelo base: https://huggingface.co/microsoft/swinv2-large-patch4-window12-192-22k
- Dataset UZLF (KU Leuven): https://rdr.kuleuven.be/dataset.xhtml?persistentId=doi:10.48804/Z7SHGO
- Scorer de evaluacion: scripts/eval/dice_score.py en el repositorio REYIA
