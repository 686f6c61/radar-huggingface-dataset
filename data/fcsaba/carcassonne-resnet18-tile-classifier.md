# fcsaba/carcassonne-resnet18-tile-classifier

## Resumen

El carcassonne-resnet18-tile-classifier es un clasificador de imagen desarrollado por el usuario fcsaba que identifica losetas del juego de mesa Carcassonne a partir de recortes de 64x64 píxeles. Se trata de un ResNet18 de torchvision ajustado (fine-tuning) sobre un dataset sintético de losetas extraídas de Board Game Arena (BGA), en el que la capa totalmente conectada original se ha sustituido por una secuencia Dropout(0,3) más una capa lineal de 512 a 24 salidas, una por cada tipo de loseta del vocabulario definido por el autor (CCCS, RRRR, CFCF, CCFFS, CRFR, entre otras).

Es un modelo muy pequeño (en torno a 11,2 millones de parámetros, coherente con un ResNet18 estándar de 11,7 M al que se le reduce la cabeza de 1000 a 24 clases), diseñado para ejecutarse en CPU o en cualquier GPU de gama baja. No es un modelo de lenguaje: su única salida son logits sobre 24 clases, por lo que no soporta generación de texto, tool calling ni razonamiento multi-paso. La licencia es MIT y la etiqueta de idioma del repositorio es en, aunque el modelo no procesa lenguaje natural.

Su relevancia actual es acotada y de nicho: sirve como componente de percepción dentro de pipelines de visión artificial para digitalizar partidas de Carcassonne, alimentar agentes de aprendizaje por refuerzo o preanotar datasets, siempre que otro componente se encargue previamente de recortar cada loseta. El repositorio no tiene descargas, no tiene likes y no publica ninguna métrica de validación, por lo que su calidad real está por verificar de forma independiente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ResNet18 (CNN residual, implementación torchvision / PyTorch) |
| Parametros totales | Aprox. 11,2 M (ResNet18 estándar: 11,7 M; se reduce al cambiar la capa fc de 1000 a 24 clases) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica / no disponible (modelo de clasificación de imagen, no procesa secuencias de texto) |
| Tipos de cuantizacion | No disponible (el autor solo publica pesos en float32 de PyTorch) |
| Idiomas soportados | No aplica; etiqueta del repositorio: en. El modelo no procesa lenguaje natural |
| Licencia | MIT |
| Formato de pesos | PyTorch (fichero carcassonne_model.pth con el state_dict). No se publican safetensors ni GGUF |
| Resolucion de entrada | 64x64 píxeles, PNG RGB/RGBA (el ejemplo de uso fuerza convert("RGB")) |
| Numero de clases | 24: CCCS, RRRR, CCCF, CCCFS, CCCR, CCCRS, RRRF, CFCF, CFCFS, RFRF, CCFF, CCFFS, CCRR, CCRRS, RRFF, CCFF2, CFCF2, RFFF, FFFF, CFFF, CRRF, CFRR, CRRR, CRFR |
| Pipeline declarado | image-classification |
| Preprocesado requerido | Resize a 64x64, ToTensor y Normalize con media [0.485, 0.456, 0.406] y desviación [0.229, 0.224, 0.225] |
| Ficheros del repositorio | carcassonne_model.pth, class_names.json (mapping índice a clase) |
| Tamano del repositorio | 0.0 GB declarado por HuggingFace (los pesos en float32 rondarían los 45 MB) |
| Fecha de creacion / actualizacion | 2026-09-20 (ambas) |

## Arquitectura y entrenamiento

La arquitectura es un ResNet18 convencional de torchvision: 18 capas con conexiones residuales, bloques BasicBlock, normalización por lotes y agrupación global media al final. La modificación respecto al modelo original es únicamente la cabeza clasificadora, que pasa a ser `nn.Sequential(nn.Dropout(0.3), nn.Linear(512, 24))`. La reconstrucción se hace con `models.resnet18(weights=None)` y posterior `load_state_dict`, de modo que el usuario debe replicar exactamente esa cabeza para poder cargar los pesos. La resolución de trabajo es de 64x64 píxeles, muy inferior a los 224x224 habituales de ImageNet, lo que reduce mucho el coste computacional pero también el detalle disponible para discriminar losetas visualmente parecidas.

El entrenamiento se realizó sobre un dataset sintético de losetas de Carcassonne extraídas de Board Game Arena. La model card no especifica el número de imágenes, la composición exacta del dataset, los hiperparámetros de entrenamiento (épocas, tasa de aprendizaje, optimizador), las técnicas de aumento de datos empleadas, la partición train/validation/test ni si hubo fases de ajuste fino adicionales. Tampoco se documenta ningún mecanismo de calibración, destilación, decodificación especulativa ni innovación técnica más allá del fine-tuning estándar. En consecuencia, cualquier afirmación sobre el proceso de entrenamiento distinta de las anteriores sería una suposición no respaldada por la información disponible.

## Capacidades

- Clasificación de imagen en 24 clases discretas de losetas de Carcassonne a partir de recortes de 64x64 píxeles.
- Salida de logits por clase, apta para `argmax` o para obtener una distribución de probabilidad mediante softmax.
- Inferencia determinista y de coste muy bajo: un único forward pass por imagen, sin generación autorregresiva.
- Procesamiento por lotes (batching) trivial, al ser una CNN pura sin estado.
- Integración directa con el ecosistema PyTorch: exportable a TorchScript, ONNX o TensorRT mediante conversión estándar.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso: no hay bucle de decisión ni memoria conversacional.
- No tiene capacidades multilingües: no procesa ni genera texto.
- No realiza detección de objetos ni segmentación: no devuelve coordenadas ni cajas delimitadoras, solo la clase dominante del recorte que se le entrega.
- No incorpora modo de razonamiento (thinking mode), visión adicional, audio ni cualquier otra modalidad.
- La única documentación de uso es el fragmento de código PyTorch de la model card, que cubre la descarga de pesos, la reconstrucción del modelo y la inferencia sobre una imagen.

## Casos de uso

- Digitalización de partidas en Board Game Arena: capturando la región del tablero con un script de screenshots y recortando cada celda, el clasificador etiqueta cada loseta y permite reconstruir el estado completo de la partida en formato estructurado para su posterior análisis.
- Percepción para agentes de aprendizaje por refuerzo: un agente que juegue a Carcassonne necesita convertir el estado visual en una representación simbólica; este modelo aporta la parte de identificación de losetas, que se combinaría con un módulo aparte para detectar posición y orientación.
- Análisis post-partida y estadísticas: al registrar automáticamente qué losetas aparecen y en qué orden en capturas de partidas, se pueden calcular métricas como frecuencia de tipos de loseta, eficiencia de colocación o comparativas entre jugadores.
- Preanotación de datasets de visión: dado un conjunto de imágenes sin etiquetar, el modelo genera etiquetas preliminares que después se revisan manualmente, reduciendo el esfuerzo de anotación en proyectos de reconocimiento de juegos de mesa.
- Validación de reglas en una aplicación acompañante (companion app): integrado en una app que asista a jugadores presenciales, el modelo puede comprobar qué loseta se acaba de colocar y contrastarla con el reglamento antes de aceptar el movimiento.
- Accesibilidad para jugadores con discapacidad visual: combinado con un sistema de texto a voz, el clasificador puede describir verbalmente qué losetas hay sobre la mesa a partir de una foto tomada con el móvil, siempre que un paso previo de detección recorte cada loseta.
- Archivado y minería de datos de partidas: al procesar grandes volúmenes de capturas de BGA se puede construir una base de datos de estados de tablero para investigación sobre estrategia, equilibrio del juego o entrenamiento de modelos predictivos.
- Base para transfer learning en otros juegos de losetas: al ser un ResNet18 estándar, se puede reutilizar como inicialización y reajustar la cabeza para clasificar losetas de otros juegos con un esfuerzo de anotación moderado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye exactitud (accuracy), F1, matriz de confusión, ni resultados sobre conjuntos de validación o test. Tampoco hay comparaciones con otros clasificadores de losetas ni métricas de latencia o throughput. Cualquier cifra de rendimiento que se atribuya a este modelo en la actualidad sería especulativa.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en float32 con lotes pequeños. Los pesos en float32 ocupan del orden de 45 MB (11,2 M de parámetros x 4 bytes) y las activaciones a 64x64 con lote 1 son de unos pocos megabytes.
- GPU recomendadas: no requiere GPU. Funciona sin problema en CPU. Si se usa GPU, cualquier tarjeta con al menos 2 GB de memoria es suficiente (GTX 1050 Ti, GTX 1650, RTX 3050, RTX 4090, A100, H100, etc.).
- Cabe en GPU de consumo: sí, con enorme holgura, incluso en iGPU integradas y en placas como Raspberry Pi 4/5 ejecutando en CPU, dado el reducido tamaño de entrada.
- Opciones de despliegue: PyTorch en modo eager (el documentado por el autor), TorchScript, ONNX Runtime, TensorRT, OpenVINO y Core ML mediante conversión. No es compatible con servidores orientados a modelos de lenguaje como vLLM, TGI, Ollama o llama.cpp, porque no es un modelo generativo de texto.
- Aceleración opcional: cuantización a int8 mediante cuantización dinámica de PyTorch o cuantización de ONNX Runtime es técnicamente viable, pero no está documentada ni validada por el autor.
- Latencia y throughput: no disponibles. No se han publicado mediciones, y no se debe asumir ningún valor concreto sin medirlo sobre el hardware objetivo.

## Comparativa con modelos similares

| Modelo | Arquitectura | Parametros | Entrada | Clases | Licencia | Rendimiento en esta tarea |
|---|---|---|---|---|---|---|
| fcsaba/carcassonne-resnet18-tile-classifier | ResNet18 ajustado | Aprox. 11,2 M | 64x64 RGB | 24 losetas | MIT | No publicado |
| ResNet18 preentrenado en ImageNet-1k (torchvision) | ResNet18 | 11,7 M | 224x224 RGB | 1000 (ImageNet) | BSD-3-Clause | No entrenado para losetas; requiere fine-tuning |
| ResNet50 preentrenado en ImageNet-1k (torchvision) | ResNet50 (bottleneck) | Aprox. 25,6 M | 224x224 RGB | 1000 (ImageNet) | BSD-3-Clause | No entrenado para losetas; mayor coste y mayor capacidad teórica |
| EfficientNet-B0 preentrenado en ImageNet-1k | EfficientNet (compound scaling) | Aprox. 5,3 M | 224x224 RGB | 1000 (ImageNet) | Apache-2.0 | No entrenado para losetas; alternativa eficiente en parámetros |

No se dispone de datos publicados que permitan comparar la exactitud de este clasificador con alternativas específicas para losetas de Carcassonne, ni se conocen en la información proporcionada otros modelos públicos equivalentes. Los datos de parámetros, resolución y licencia de las alternativas corresponden a las implementaciones estándar de torchvision y no a mediciones realizadas sobre este problema concreto.

## Limitaciones y advertencias

- Ausencia total de validación externa: 0 descargas y 0 likes en HuggingFace, sin métricas publicadas ni evaluaciones de terceros. La calidad del clasificador es una incógnita.
- Sesgo de dominio probable: el dataset de entrenamiento es sintético y procede de capturas de Board Game Arena. Es previsible una degradación apreciable sobre fotografías reales de mesa con iluminación variable, perspectiva, sombras, reflejos u oclusiones.
- Dependencia de un recorte previo: el modelo solo clasifica imágenes ya aisladas de 64x64. No localiza losetas ni gestiona tableros completos, por lo que requiere un detector o segmentador externo en cualquier uso real.
- Resolución muy baja: 64x64 píxeles limita la discriminación de variantes visualmente próximas (por ejemplo, los sufijos numéricos CCFF2, CFCF2 o las clases con terminación S) y de detalles pequeños como escudos o marcas.
- Preprocesado rígido: cualquier desviación del pipeline documentado (resolución, orden de canales, normalización con estadísticas de ImageNet) puede degradar gravemente los resultados.
- Conversión de RGBA a RGB: si la transparencia aporta información en los recortes originales, esa señal se pierde al forzar convert("RGB").
- Proceso de entrenamiento no documentado: no consta el tamaño del dataset, la partición train/validation/test, los hiperparámetros ni si se aplicaron aumentos de datos, lo que impide reproducir el resultado.
- Cobertura de clases parcial: las 24 clases publicadas cubren un subconjunto del vocabulario del juego. Losetas de expansiones o tipos no listados quedarán mal clasificadas dentro de la clase más parecida, sin aviso de baja confianza.
- Riesgo legal sobre los datos: aunque la licencia del modelo es MIT y permite uso comercial, los pesos se derivaron de imágenes del juego Carcassonne, cuyos derechos pertenecen a su editor, y de capturas de Board Game Arena. El uso comercial de un modelo entrenado con esos activos gráficos merece una revisión legal específica.
- Sin capacidad de abstención: el modelo siempre devuelve una de las 24 clases mediante argmax; no incorpora umbral de confianza ni clase "desconocido", por lo que el código de integración debe gestionar ese umbral por su cuenta.
- Idiomas: no aplica, ya que el modelo no procesa lenguaje natural; la etiqueta en del repositorio se refiere al idioma de la documentación.
- Fechas del repositorio: creación y actualización el 2026-09-20, con un tamaño declarado de 0.0 GB. Conviene verificar la integridad y el contenido real del repositorio antes de integrarlo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/fcsaba/carcassonne-resnet18-tile-classifier
- Perfil del autor en HuggingFace: https://huggingface.co/fcsaba
- Ficheros del repositorio: carcassonne_model.pth (pesos) y class_names.json (mapping índice a clase), descargables vía huggingface_hub
- Board Game Arena, origen del dataset de losetas: https://boardgamearena.com
- Documentación de torchvision (ResNet18 y transformaciones): https://pytorch.org/vision/stable/index.html
- Documentación de huggingface_hub (hf_hub_download): https://huggingface.co/docs/huggingface_hub
- Resultados de la búsqueda web: no se ha encontrado ningún enlace relevante sobre el modelo. Los resultados devueltos corresponden a páginas de soporte y manuales de Windows en alemán, sin relación alguna con este clasificador, con Carcassonne ni con visión por computador.
