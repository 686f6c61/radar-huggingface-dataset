# Jia-Liu/big-lama-coreml

## Resumen

Jia-Liu/big-lama-coreml es una conversion de formato del modelo LaMa (Large Mask Inpainting) al formato Core ML de Apple, publicada por el usuario Jia-Liu. No se trata de un modelo nuevo ni de un reentrenamiento: es el checkpoint big-lama.pt original (196 MB en FP32) convertido a un paquete .mlpackage para permitir inferencia acelerada por GPU en macOS. La utilidad practica es llevar un modelo de inpainting de imagenes consolidado al ecosistema nativo de Apple, de modo que una aplicacion Swift pueda cargarlo con Core ML sin depender de PyTorch ni de Python en tiempo de ejecucion.

El modelo resuelve tareas de inpainting: dada una imagen RGB y una mascara binaria que marca las zonas a reconstruir, genera una imagen de salida donde esas zonas se rellenan de forma coherente con el resto. Su relevancia dentro del ecosistema open source es limitada pero concreta: LaMa es una referencia en inpainting de mascaras grandes por su robustez a la resolucion, y esta conversion evita el paso intermedio de exportar el modelo uno mismo. La entrada y la salida de esta conversion estan fijadas a 800x800 pixeles, con una mascara de un solo canal.

Conviene subrayar que el repositorio tiene 0 descargas y 0 likes en el momento de la consulta, que el autor de la conversion no es el autor original del modelo y que no se publican resultados de benchmarks ni detalles del entrenamiento original mas alla de la referencia al paper. La etiqueta de idioma del repositorio ("en") es heredada de la metadata y no implica capacidades linguisticas: es un modelo puramente visual.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red convolucional totalmente convolucional con convoluciones de Fourier (Fast Fourier Convolutions, FFC) para inpainting de mascaras grandes |
| Parametros totales | no disponible (el checkpoint original big-lama.pt ocupa 196 MB en FP32) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo de vision; entrada de imagen fija de 800x800 px) |
| Tipos de cuantizacion | FP32 unicamente en esta conversion; no se publican variantes FP16, INT8 ni paletizadas |
| Idiomas soportados | no aplica (modelo de imagen); la etiqueta de idioma del repositorio es "en" |
| Licencia | Apache 2.0 |
| Formato de pesos | Core ML Package (.mlpackage); el modelo original esta en PyTorch (.pt) |
| Entradas | Imagen RGB de 3 canales a 800x800 px y mascara en escala de grises de 1 canal a 800x800 px |
| Salida | Imagen RGB de 3 canales a 800x800 px |
| Unidades de computo | CPU + GPU (configuracion .cpuAndGPU) |
| Tamano del repositorio | 0,4 GB |
| Fecha de publicacion | 2026-09-16 (segun la ficha de HuggingFace) |

## Arquitectura y entrenamiento

La arquitectura corresponde al modelo LaMa descrito en el paper "Resolution-robust Large Mask Inpainting with Fourier Convolutions" (Suvorov, Logacheva, Mashikhin et al., WACV 2022). Se trata de una red de inpainting de tipo feed-forward y totalmente convolucional que sustituye parte de las convoluciones espaciales por convoluciones de Fourier, lo que permite que cada neurona tenga un campo receptivo global ya en capas tempranas. Esa caracteristica es la que da nombre a la propiedad de robustez a la resolucion: el modelo puede trabajar con mascaras grandes y estructuras repetitivas sin degradarse tanto como las arquitecturas puramente locales. No es un transformer, no es un modelo de difusion y no tiene mecanismo de atencion en el sentido de los modelos de lenguaje.

Sobre el entrenamiento no hay informacion en la documentacion proporcionada: no se detallan el numero de tokens o imagenes, la composicion del dataset, ni si hubo fases de ajuste con RLHF o DPO (algo que, por otra parte, no aplica a un modelo de este tipo). Lo unico documentado es el proceso de conversion: se parte de big-lama.pt, se usa el proyecto CoreMLaMa de @mallman, se mantiene precision FP32 y se generan unidades de computo CPU + GPU. No hay modificaciones de pesos, solo cambio de formato. La innovacion tecnica destacable, por tanto, reside en el modelo original (las convoluciones de Fourier), no en esta publicacion.

## Capacidades

- Inpainting de imagenes: reconstruccion de zonas enmascaradas a partir del contexto circundante, con soporte para mascaras de gran tamano.
- Eliminacion de objetos: borrado de elementos no deseados en una fotografia rellenando el hueco con contenido plausible.
- Eliminacion de marcas de agua: el repositorio incluye la etiqueta "watermark-removal" entre sus casos de uso declarados.
- Restauracion de imagenes: reparacion de rayaduras, manchas, texto superpuesto o zonas danadas en material fotografico.
- Inferencia acelerada en macOS: integracion nativa via Core ML con reparto de carga entre CPU y GPU.
- Entrada y salida de resolucion fija: 800x800 px para imagen y mascara, y 800x800 px para el resultado.
- No dispone de generacion de texto, razonamiento, codigo, matematicas ni vision semantica descriptiva.
- No soporta tool calling, function calling ni flujos de agentes.
- No es multilingue en sentido estricto: carece de cualquier componente linguistico.
- No tiene modo thinking ni variantes de vision-lenguaje.

## Casos de uso

- Edicion fotografica en aplicaciones macOS nativas: una app Swift puede cargar el .mlpackage con MLModelConfiguration, pasar la imagen y la mascara dibujada por el usuario, y devolver el resultado inpainting sin necesidad de servidor ni de Python. Es adecuado porque elimina toda dependencia de PyTorch en el binario distribuido.
- Eliminacion de objetos en fotografia de producto: retirar cables, etiquetas o elementos de atrezzo del fondo de una foto de catalogo. La robustez a mascaras grandes de LaMa es util cuando el objeto a borrar ocupa una porcion considerable del encuadre.
- Limpieza de marcas de agua sobre material propio: el repositorio se etiqueta explicitamente para esta tarea, aplicable a la recuperacion de imagenes propias cuyo original se perdio. Requiere comprobar la titularidad de los derechos antes de usarlo sobre contenido de terceros.
- Restauracion de archivo fotografico: reparacion de rayaduras, dobleces y manchas en digitalizaciones de negativos o copias en papel, procesando las imagenes por lotes con la mascara generada automaticamente a partir de la deteccion de defectos.
- Limpieza previa de datasets de vision: eliminar logotipos, sellos de agencia o anotaciones quemadas en imagenes propias antes de reutilizarlas en un pipeline de entrenamiento, evitando que el modelo aprenda correlaciones espurias con esos elementos.
- Retoque inmobiliario: retirar objetos personales, senalizacion o mobiliario concreto en fotografias de inmuebles, manteniendo la coherencia de paredes, suelos y texturas repetitivas gracias al campo receptivo global de las convoluciones de Fourier.
- Escaneo de documentos con anotaciones: borrar sellos, firmas o marcas manuscritas no deseadas sobre una digitalizacion antes de archivarla, siempre que la finalidad sea legitima y se cuente con autorizacion sobre el documento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

El repositorio no incluye tablas comparativas, metricas de FID, PSNR, SSIM ni evaluaciones humanas. El paper original de LaMa si reporta resultados, pero no se reproducen en esta ficha porque no forman parte de la informacion proporcionada. Tampoco hay mediciones de latencia o throughput para la conversion Core ML.

## Requisitos de hardware

- VRAM: no aplica en el sentido tradicional. Los pesos FP32 ocupan 196 MB y el repositorio completo 0,4 GB; en un Mac con memoria unificada el consumo se situa en el orden de cientos de MB, incluyendo activaciones para tensores de 800x800.
- GPU compatibles: cualquier Mac con GPU soportada por Core ML, en particular Apple Silicon (familias M1, M2, M3 y M4). Tambien Macs Intel con GPU discreta AMD soportada por Core ML.
- GPU NVIDIA: no soportadas por esta conversion. Para CUDA o ROCm hay que usar el modelo original en PyTorch.
- GPU de centro de datos (A100, H100, RTX 4090): no aplican a este artefacto; son irrelevantes porque el formato Core ML esta pensado para el stack de Apple.
- Inferencia en GPU de consumo: si, en cualquier Mac Apple Silicon, que es precisamente el publico objetivo del repositorio.
- Opciones de despliegue: Core ML directamente en Swift (import CoreML, MLModelConfiguration con computeUnits = .cpuAndGPU), Vision para el preprocesado de imagenes; para la version PyTorch original, IOPaint (instalado en los pasos de conversion documentados) o lama-cleaner.
- Latencia y throughput: no disponible. No se publican mediciones de tiempo por imagen ni de imagenes por segundo.

## Comparativa con modelos similares

| Modelo | Formato | Entrada | Licencia | Disponibilidad | Rendimiento publicado |
|---|---|---|---|---|---|
| Jia-Liu/big-lama-coreml (este) | Core ML (.mlpackage) | 800x800 px fijos | Apache 2.0 | HuggingFace, 0 descargas | no disponible |
| big-lama original (advimman/lama) | PyTorch (.pt) | Flexible por resolucion | Apache 2.0 | GitHub y release de Sanster | no disponible en esta ficha |
| Otros modelos de inpainting generativos (difusion, transformers de enmascarado) | Diversos | Diversos | no disponible | Diversos | no disponible |

La comparacion relevante aqui es de formato, no de calidad: este repositorio y el big-lama original comparten exactamente los mismos pesos, de modo que su comportamiento deberia ser identico salvo por diferencias numericas de la conversion y por la resolucion fija de 800x800. Frente a alternativas basadas en difusion, LaMa es un modelo feed-forward de una sola pasada, lo que suele traducirse en menor coste computacional, pero no se dispone de datos comparativos verificables en la informacion proporcionada.

## Limitaciones y advertencias

- Resolucion fija: la conversion solo acepta imagenes y mascaras de 800x800 px, lo que obliga a redimensionar la entrada y a reescalar la salida, con la perdida de detalle que ello implica.
- Plataforma restringida: el formato Core ML limita el uso a macOS, iOS y el resto del ecosistema Apple. No es portable a Linux ni a Windows.
- Sin benchmarks ni validacion comunitaria: 0 descargas y 0 likes, y ninguna metrica publicada. No hay evidencia de que la conversion preserve fielmente el comportamiento del modelo original.
- Dependencia de terceros: la conversion la realiza un usuario distinto del autor original y mediante una herramienta externa (CoreMLaMa). Cualquier error de exportacion no esta cubierto por los autores de LaMa.
- Riesgo de artefactos y alucinacion visual: como todo modelo de inpainting, puede generar texturas plausibles pero falsas en zonas enmascaradas, especialmente con mascaras muy grandes o zonas con estructura ambigua. No debe usarse en contextos forenses, medicos o probatorios.
- Sesgos del dataset de entrenamiento: no se documenta la composicion del dataset en la informacion disponible, por lo que no se puede evaluar que sesgos de contenido arrastra el modelo.
- Uso para eliminar marcas de agua: aunque el repositorio se etiqueta para ello, aplicar el modelo sobre imagenes de terceros puede infringir derechos de autor y condiciones de uso de las plataformas. El uso legitimo se limita a contenido propio o debidamente licenciado.
- Licencia Apache 2.0: permite uso comercial y modificacion, pero exige conservar el aviso de copyright y la atribucion a los autores originales. Esta conversion es un cambio de formato, no una obra nueva, por lo que la atribucion a Suvorov et al. es obligatoria.
- Sin soporte de lote grande documentado: no se describe el comportamiento con batch size mayor que uno ni el uso de la Neural Engine (la configuracion indicada es .cpuAndGPU).

## Enlaces

- HuggingFace: https://huggingface.co/Jia-Liu/big-lama-coreml
- Repositorio original de LaMa: https://github.com/advimman/lama
- Pagina del proyecto: https://advimman.github.io/lama-project/
- Paper: https://arxiv.org/abs/2109.07161
- Herramienta de conversion CoreMLaMa: https://github.com/mallman/CoreMLaMa
- Perfil del autor de la conversion: https://github.com/mallman
- Checkpoint original big-lama.pt: https://github.com/Sanster/models/releases/download/add_big_lama/big-lama.pt
- Los resultados de la busqueda web realizada no contienen enlaces relevantes al modelo: devuelven paginas no relacionadas (marcas de cosmetica, articulos agricolas y articulos enciclopedicos sobre artritis idiopatica juvenil).
