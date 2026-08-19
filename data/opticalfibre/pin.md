# opticalfibre/PIN

## Resumen

PIN (Parameter-INjection) es un framework de compresión de modelos basado en weight-sharing, desarrollado por el investigador opticalfibre. Su propuesta central es el concepto de "folded models": en lugar de almacenar un peso por conexión, se almacena un conjunto reducido de valores y una partición que determina qué conexiones comparten cada valor. De este modo, un modelo convolucional alcanza un 0.9080 de precisión en CIFAR-10 con solo 270.277 valores almacenados, que representan 2.415.919.104 conexiones, es decir, un factor de compresión de 8.939 veces.

El proyecto se distribuye como un conjunto de scripts Python autónomos, sin dependencias de frameworks de deep learning (solo NumPy y opcionalmente CuPy), diseñados para ser reproducibles y ejecutables en entornos mínimos, incluso desde un teléfono. Cada script se autoverifica, descarga sus propios datos y escribe resultados en disco. El framework separa la partición de los valores, lo que permite remodelar un modelo intercambiando el índice de partición sin perder lo aprendido, una propiedad que abre la puerta a técnicas de fine-tuning eficiente, inyección de conocimiento y mercados de componentes de modelos.

La relevancia actual de PIN reside en su enfoque radical de compresión y eficiencia paramétrica, en un momento en que el coste de entrenar y desplegar modelos grandes es un cuello de botella. Aunque está orientado a visión (CIFAR-10), los principios son generalizables a otras arquitecturas. El código está archivado en Zenodo con DOI y la licencia Apache 2.0 permite uso comercial con concesión explícita de patente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red convolucional (ResNet-like) con weight-sharing mediante particion de pesos (folded model) |
| Parametros totales | 2.415.919.104 conexiones equivalentes (270.277 valores almacenados) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica (modelo de vision, no de texto) |
| Tipos de cuantizacion | No disponible (el framework no menciona cuantizacion clasica; la compresion se logra via weight-sharing) |
| Idiomas soportados | No aplica (modelo de vision) |
| Licencia | Apache 2.0 (con concesion explicita de patente) |
| Formato de pesos | No disponible (los scripts guardan resultados en disco, sin formato estandar tipo safetensors o GGUF) |

## Arquitectura y entrenamiento

El framework PIN introduce una abstraccion formal para el weight-sharing: una matriz de pesos ordinaria almacena un numero por conexion, mientras que una matriz "plegada" (folded) almacena un conjunto reducido de valores `v` y una particion `idx` tal que `W[i, j] = v[ idx(i, j) ]`. Una convolucion es un caso particular de `idx`, pero tambien lo son las capas patch, las matrices butterfly, las matrices block-circulantes y cualquier tipo de atado arbitrario. Esta separacion entre particion y valores convierte la arquitectura en una estructura de datos en lugar de una ruta de codigo, permitiendo remodelar el modelo intercambiando el indice de particion sin perder lo aprendido.

El entrenamiento se realiza sobre CIFAR-10 con un script `resnet.py` que tarda aproximadamente media hora en una GPU modesta. El proyecto aborda un problema critico de reproducibilidad: el scatter atomico en GPU completa en orden de hardware y la suma en coma flotante no es asociativa, lo que producia diferencias de aproximadamente 0.002 en precision final con la misma semilla. La solucion implementada es una reduccion de orden fijo, exacta y barata porque la particion no cambia durante el entrenamiento, de modo que la ordenacion se paga una sola vez por ejecucion. El framework tambien documenta dos protocolos metodologicos: comparar siempre parejas dentro de la misma semilla (un analisis no pareado engano al proyecto tres veces, ocultando un resultado a 2.6 desviaciones) y leer la mejor epoca en lugar de la final cuando un brazo sobreajusta.

## Capacidades

- Compresion extrema de modelos convolucionales mediante weight-sharing: 8.939 veces de plegado en CIFAR-10 con solo 270.277 valores almacenados.
- Fine-tuning eficiente en parametros: permite anadir un "miembro" a una base congelada con solo cinco ejemplos en 0.6 ms (segun el script `sample_efficiency.py`).
- Inyeccion de conocimiento a perturbacion cero: el script `injection.py` demuestra que se puede anadir un miembro a una base congelada sin alterar la salida.
- Capacidad de prestamo entre bases: `borrow.py` y `calibration.py` exploran como un miembro entrenado en una base puede transferirse a otra.
- Control de confianza y calibracion: `confidence_member.py` muestra que un modelo puede no detectar su propia ignorancia, y `qualify.py` ofrece mecanismos para conceder o anular.
- Determinismo reproducible: `determinism.py` mide el ruido de fondo de 0.002 y demuestra que la reduccion de orden fijo elimina la variabilidad.
- Sin dependencias de frameworks: todos los scripts funcionan con Python 3, NumPy y CuPy (opcional), sin kernels personalizados ni extensiones compiladas.

## Casos de uso

- Compresion de modelos para edge computing: un modelo convolucional plegado puede ejecutarse en dispositivos con poca memoria gracias a la reduccion de 8.939 veces en almacenamiento, manteniendo una precision competitiva en tareas de clasificacion de imagenes.
- Fine-tuning eficiente en recursos: la capacidad de anadir un miembro a una base congelada con solo cinco ejemplos permite adaptar un modelo a nuevas clases o dominios sin reentrenar toda la red, ideal para escenarios con pocos datos etiquetados.
- Auditoria de modelos y control de calidad: los scripts de confianza y calibracion permiten detectar cuando un modelo no sabe lo que no sabe, util en entornos de produccion donde las predicciones incorrectas tienen coste alto.
- Investigacion en arquitecturas de peso compartido: el framework separa la particion de los valores, lo que facilita experimentar con distintos esquemas de atado (convolucion, butterfly, block-circulante) sin reescribir codigo.
- Construccion de mercados de componentes de modelos: `marketplace.py` explora que paga realmente un comprador al adquirir un miembro, abriendo la puerta a sistemas de reutilizacion y transferencia de conocimiento entre modelos.
- Reproducibilidad en investigacion: el proyecto ofrece scripts autocontenidos que se verifican a si mismos y documentan errores pasados, sirviendo como plantilla para experimentos cientificos auditables.

## Benchmarks y rendimiento

| Benchmark | Resultado |
|---|---|
| CIFAR-10 (precision top-1) | 0.9080 con 270.277 valores almacenados (2.415.919.104 conexiones equivalentes) |

No se han publicado resultados en otros benchmarks (ImageNet, etc.) en la informacion disponible. El factor de compresion es de 8.939 veces respecto al numero de conexiones. No hay datos comparativos con otros modelos de la misma categoria en la documentacion proporcionada.

## Requisitos de hardware

- El script `resnet.py` tarda aproximadamente 30 minutos en una GPU modesta (no se especifica el modelo exacto).
- Todos los scripts funcionan en CPU con NumPy, aunque mas lentamente; si hay GPU, se usa CuPy.
- No se requiere framework de deep learning (sin PyTorch, TensorFlow, etc.).
- No hay datos de VRAM especifica, latencia o throughput en la informacion disponible.
- Opciones de despliegue: no se mencionan servidores de inferencia (vLLM, TGI, etc.); el proyecto se centra en scripts de entrenamiento y experimentacion, no en un servicio de inferencia listo para produccion.

## Comparativa con modelos similares

No disponible. El framework PIN no se compara directamente con otros modelos en la informacion proporcionada. No hay datos de modelos alternativos con weight-sharing o compresion extrema en el mismo contexto (CIFAR-10) que permitan una comparacion cuantitativa. Se puede mencionar que, en terminos de compresion, supera ampliamente a tecnicas clasicas como pruning o cuantizacion, pero no hay cifras de otros sistemas en la documentacion.

## Limitaciones y advertencias

- El proyecto es un framework de investigacion, no un modelo preentrenado listo para produccion; no hay pesos publicados como artefacto descargable estandar.
- La evaluacion se limita a CIFAR-10; no hay evidencia de generalizacion a otros datasets o tareas.
- El documento menciona que "los papers retiran cosas" y que el codigo incluye tanto resultados retirados como correcciones; es necesario leer los comentarios en los scripts para entender que resultados son validos.
- La reproducibilidad determinista se logra con una reduccion de orden fijo, pero solo se ha validado en el contexto de este framework; puede no aplicarse directamente a otros sistemas.
- No hay soporte para tareas de lenguaje natural, vision general o multimodalidad; es exclusivamente para redes convolucionales en clasificacion de imagenes.
- La licencia Apache 2.0 permite uso comercial, pero el proyecto no ofrece garantias de soporte o mantenimiento (autor unico, sin organizacion detras).
- El numero de descargas y likes es cero, lo que sugiere una adopcion muy limitada; la documentacion es densa y orientada a investigadores, no a desarrolladores de aplicaciones.

## Enlaces

- HuggingFace: https://huggingface.co/opticalfibre/PIN
- Codigo archivado en Zenodo (con DOI, segun la model card): https://zenodo.org (enlace generico, el DOI especifico no se proporciona en la informacion disponible)
- Repositorio de scripts: no se proporciona URL directa, pero se menciona que el codigo esta archivado en Zenodo y que cada script es un archivo autonomo.
