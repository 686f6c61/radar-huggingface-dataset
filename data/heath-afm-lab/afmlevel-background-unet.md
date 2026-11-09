# Heath-AFM-Lab/afMLevel-background-unet

## Resumen

afMLevel-background-unet es un modelo de regresion image-to-image basado en una U-Net de 7 capas implementada en PyTorch, desarrollado por el grupo Heath-AFM-Lab del Department of Physics and Astronomy de la University of Leeds (Reino Unido). Su proposito es predecir el fondo de artefactos de gran escala (tilt, deriva del escaner en z y otras imperfecciones) presente en mapas de altura de microscopia de fuerza atomica (AFM), para que dicho fondo pueda restarse y obtener una imagen nivelada.

El modelo no es un LLM ni un modelo generativo de texto: es una red convolucional encoder-decoder que opera sobre teselas de 256 x 256 pixeles y devuelve una imagen de fondo de la misma resolucion. Forma parte del proyecto afMLevel, cuyo codigo de inferencia, preprocesado, teselado y reconstruccion del fondo a escala completa se distribuye por separado en GitHub y actua como plugin del ecosistema playnano para el procesado de peliculas de AFM de alta velocidad (HS-AFM).

Es relevante ahora porque automatiza una tarea de nivelado que tradicionalmente requiere ajustes manuales de lineas y planos, y porque se publica junto con un preprint (Tekchandani et al., 2026) y un modelo hermano (afMLevel-mask-unet) orientado a rutinas de nivelado tradicionales. El repositorio pesa 1,0 GB y la licencia es BSD-3-Clause, permisiva para uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | U-Net de 7 capas (encoder-decoder convolucional) en PyTorch |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica; entrada fija de 256 x 256 pixeles |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplica (modelo de vision, no linguistico) |
| Licencia | BSD-3-Clause |
| Formato de pesos | no disponible (repo de 1,0 GB; pesos PyTorch presumiblemente, sin confirmar) |

## Arquitectura y entrenamiento

La red es una U-Net de 7 capas entrenada desde cero (no es un fine-tuning) para regresion image-to-image: recibe una tesela de 256 x 256 pixeles de un mapa de altura AFM y produce una imagen de fondo de igual tamano que representa los artefactos de gran escala. El codigo de afMLevel se encarga de teselar la imagen original, ejecutar la inferencia por teselas y coser las predicciones para reconstruir un fondo a la misma escala que la imagen cruda, que posteriormente se resta.

El modelo fue entrenado sobre un conjunto de mapas de altura AFM reales, con enfasis en datos biologicos (membranas, proteinas, origami de ADN, redes cristalinas y fibras). No se especifican en la informacion disponible el numero de tokens, el volumen exacto del dataset ni si se emplearon tecnicas de RLHF o DPO (no aplicables en un modelo de regresion de este tipo). La model card menciona que en el benchmark asociado dos pasadas de inferencia dieron el MSE medio mas bajo y tres pasadas la mejor puntuacion visual, aplicando la salida de una pasada como entrada de la siguiente.

## Capacidades

- Prediccion de fondo en mapas de altura AFM: estima tilt, deriva del escaner en z y otros artefactos de gran escala.
- Regresion image-to-image sobre teselas de 256 x 256 pixeles.
- Integracion en pipelines de nivelado: el fondo predicho se resta de la imagen original para producir un mapa nivelado.
- Procesado por lotes de conjuntos de imagenes y de peliculas HS-AFM mediante el paquete afMLevel.
- Funcionamiento como plugin de playnano a traves del paso de procesado `level_ml_bg`.
- Aplicacion iterativa (multiples pasadas) para refinar el fondo predicho.
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multilingues: es un modelo puramente visual y de dominio especifico.

## Casos de uso

- Nivelado automatizado de imagenes AFM biologicas: el modelo predice el fondo de artefactos de gran escala en membranas, proteinas, origami de ADN, redes cristalinas y fibras, y el codigo afMLevel lo resta para obtener mapas de altura listos para analisis.
- Procesado de peliculas HS-AFM: integrado como plugin de playnano (paso `level_ml_bg`), permite nivelar fotograma a fotograma secuencias de alta velocidad sin intervencion manual, algo critico cuando el volumen de imagenes hace inviable el ajuste linea a linea.
- Pipelines de batch para conjuntos de imagenes: afMLevel incluye utilidades de teselado, inferencia y reconstruccion que permiten procesar lotes completos de mapas de altura de forma reproducible.
- Preprocesado previo a analisis cuantitativo de superficies: al eliminar tilt y deriva en z, se facilita la medicion de rugosidad, alturas locales y caracteristicas topograficas sobre el mapa nivelado.
- Comparacion con rutinas clasicas de nivelado: el modelo hermano afMLevel-mask-unet genera un mapa de caracteristicas que puede alimentar ajustes tradicionales de lineas y planos sobre regiones sin rasgos, permitiendo contrastar enfoques ML y clasicos sobre el mismo dataset.
- Investigacion en nanoscience y quimica de superficies: sirve como componente reutilizable en flujos de analisis de datos AFM dentro de laboratorios que ya usan playnano o AFMReader para la lectura de ficheros crudos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo indica cualitativamente que, en el benchmark asociado, dos pasadas de inferencia obtuvieron el MSE medio mas bajo y tres pasadas la mejor puntuacion visual, sin cifras concretas.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. Al tratarse de una U-Net de 7 capas sobre teselas de 256 x 256, la huella es muy inferior a la de un transformer grande; el repo completo ocupa 1,0 GB, pero no se confirma el tamano exacto de los pesos.
- GPU recomendadas: no disponibles de forma explicita. Por el tipo de arquitectura, cualquier GPU consumer moderna (por ejemplo, RTX 3060 o superior) deberia ser suficiente para inferencia por teselas, aunque no hay dato confirmado.
- Cabe en GPU consumer: presumiblemente si, dado el reducido tamano de entrada y la arquitectura convolucional; sin confirmacion oficial.
- Opciones de despliegue: inferencia via PyTorch a traves del paquete afMLevel, con integracion como plugin de playnano (paso `level_ml_bg`). No se documentan soportes para vLLM, llama.cpp, Ollama ni TGI (no aplicables a este tipo de modelo).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Entrada | Licencia | Uso |
|---|---|---|---|---|
| afMLevel-background-unet | U-Net 7 capas, regresion image-to-image | 256 x 256 px | BSD-3-Clause | Prediccion directa del fondo de artefactos |
| afMLevel-mask-unet | U-Net, prediccion de mapa de caracteristicas | no disponible | BSD-3-Clause (presumible) | Alimenta rutinas tradicionales de nivelado por lineas y planos |
| Metodos clasicos de nivelado (ajuste de lineas y planos) | Procesado de senal | Imagen completa | segun implementacion | Nivelado manual o semiautomatico |

No se dispone de datos de rendimiento comparativo entre estos enfoques en la informacion proporcionada.

## Limitaciones y advertencias

- Entrenado sobre un dataset especifico de mapas de altura AFM reales; el rendimiento puede degradarse con modos de imagen, tamanos de escaneo o materiales muy distintos.
- Escaneos extremadamente ruidosos o con inestabilidades de tipo jump-to-contact pueden producir predicciones de fondo inexactas.
- Puede identificar ocasionalmente rasgos horizontales de la muestra como parte del fondo, restándolos de la imagen nivelada; se recomienda inspeccionar visualmente los fondos predichos.
- No esta destinado a predecir propiedades fisicas o mecanicas, a la interpretacion de mecanica de contacto AFM, ni a modos especializados (KPFM, MFM, FMM) sin validacion previa.
- Uso fuera de muestras biologicas requiere verificacion de rendimiento.
- Se recomienda verificar manualmente un subconjunto de fondos e imagenes niveladas antes de la interpretacion cientifica.
- Para imagenes con ruido de linea fuerte, rangos de altura muy grandes o fibras alineadas con el eje de escaneo, se sugiere usar el modelo mask como alternativa o complemento.
- Licencia BSD-3-Clause: permisiva y apta para uso comercial, con obligacion de conservar el aviso de copyright y la clausula de exencion de responsabilidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Heath-AFM-Lab/afMLevel-background-unet
- Modelo hermano (mask): https://huggingface.co/Heath-AFM-Lab/afMLevel-mask-unet
- Repositorio afMLevel: https://github.com/mayatek1/afMLevel
- Rama de codigo de entrenamiento y evaluacion: https://github.com/mayatek1/afMLevel/tree/afmlevel-paper
- Notebooks de demostracion: https://github.com/mayatek1/afMLevel/tree/main/notebooks
- Preprint (Tekchandani et al., 2026): https://doi.org/10.64898/2026.10.19.760138
- Laboratorio: https://heath-afm-lab.github.io/
- playnano: https://github.com/derollins/playNano
- AFMReader: https://github.com/AFM-SPM/AFMReader
