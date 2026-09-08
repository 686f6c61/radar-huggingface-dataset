# dedonnoc/retinal-models-mouse

## Resumen

El modelo `dedonnoc/retinal-models-mouse` es un checkpoint de genómica computacional basado en la arquitectura gReLU / Enformer, entrenado para predecir la accesibilidad de cromatina (ATAC-seq) en la retina de ratón. Ha sido desarrollado por `dedonnoc` y se comparte de forma privada para revisión por colaboradores, sin que sea un lanzamiento oficial. Resuelve el problema de predecir señales de cromatina abierta en siete tipos celulares de retina: amacrinas (AC), bipolares (BC), conos (Cone), horizontales (HC), Müller (MG), ganglionares (RGC) y bastones (Rod).

El modelo se distribuye como dos archivos checkpoint de PyTorch Lightning (`retina_mouse_binary.ckpt` y `retina_mouse_binary.grelu106.ckpt`) que contienen los mismos pesos y pueden cargarse mediante la librería `gReLU`. La arquitectura subyacente corresponde a un modelo de secuencia genómica del tipo Enformer, que procesa grandes ventanas de ADN con capas convolucionales dilatas seguidas de bloques transformer. No se han publicado parámetros totales ni detalles de entrenamiento en la información disponible.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | gReLU / Enformer (red neuronal convolucional dilatada + transformer) |
| Parametros totales | no disponible |
| Parametros activos | no aplicable (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplicable (modelo de genómica) |
| Licencia | no disponible |
| Formato de pesos | checkpoint de PyTorch Lightning (.ckpt) |

## Arquitectura y entrenamiento

El modelo combina una arquitectura tipo Enformer, que es un transformer para secuencias genómicas de longitud de hasta 200 kb (aunque no se especifica la ventana real de este checkpoint), con las modificaciones de la librería gReLU, que simplifica el entrenamiento y la carga de modelos genómicos. La salida es binaria, indicando si cada posición está en un estado de cromatina accesible para cada uno de los siete tipos celulares de retina. No se han proporcionado datos sobre el número de tokens, la composición del dataset ni el proceso de entrenamiento (RLHF/DPO no aplican). La principal innovación destacable en la información disponible es la compatibilidad con dos versiones de gReLU: el checkpoint `.grelu106` permite cargarlo en versiones modernas sin pérdida de pesos, mientras que el archivo `.ckpt` original solo es legible por gReLU 1.0.4.

## Capacidades

- Predicción binaria de accesibilidad de cromatina (ATAC-seq) en la retina de ratón.
- Soporte multi-salida para siete tipos celulares distintos: amacrinas, bipolares, conos, horizontales, Müller, ganglionares y bastones.
- Procesamiento de secuencias genómicas largas mediante arquitectura Enformer/gReLU.
- Integración con el framework gReLU para entrenamiento, evaluación y extracción de predicciones.
- No soporta generación de texto, razonamiento simbólico, código, visión ni audición.
- No dispone de tool calling, function calling ni capacidades de agente.
- No es un modelo multilingüe; su entrada y salida son secuencias biológicas.

## Casos de uso

- Identificación de elementos reguladores activos: el modelo puede usarse para anotar enhancers y promotores accesibles en cada uno de los siete tipos celulares de retina, facilitando la construcción de mapas de regulación específicos de tipo celular.
- Priorización de dianas para editado génico: las predicciones de accesibilidad permiten seleccionar regiones abiertas de cromatina donde CRISPR-Cas9 tendrá mayor eficiencia, optimizando el diseño de experimentos en modelos murinos de retina.
- Estudio de variantes asociadas a enfermedades oculares: al predecir el efecto de SNPs en la accesibilidad de cromatina, el modelo ayuda a filtrar variantes no codificantes potencialmente funcionales en regiones reguladoras de la retina.
- Comparación de accesibilidad entre tipos celulares: permite analizar diferencias de cromatina abierta entre amacrinas, conos, distintos tipos de células bipolares, etc., para caracterizar identidades celulares y estados de diferenciación.
- Análisis de perturbaciones en la cromatina: el modelo puede predecir el efecto de tratamientos, mutaciones o KO en la accesibilidad in silico, reduciendo el coste de ensayos ATAC-seq empíricos en experimentos exploratorios.
- Integración con modelos de expresión génica: sus salidas pueden combinarse con predictores de transcripción para construir modelos reguladores que expliquen diferencias de expresión entre clases celulares de la retina.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El repositorio ocupa 1.7 GB, correspondiente a los dos checkpoints, pero no se especifica el tamaño de la memoria de GPU.
- GPU recomendadas: no disponible. Se trata de un modelo de genómica, no de un modelo de lenguaje, por lo que no aplican las guías típicas para LLMs.
- Compatibilidad con GPUs de consumo: no confirmada; no hay datos oficiales sobre el perfil de memoria.
- Opciones de despliegue: carga directa mediante `gReLU` y PyTorch Lightning. No es compatible con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Relación | Notas |
|---|---|---|
| Genentech/retinal-models | Predecesor | El checkpoint actual supersede a los checkpoints de ratón publicados en Genentech/retinal-models, aunque ambos no son intercambiables entre sí. |
| Enformer | Arquitectura base | Este modelo utiliza la arquitectura gReLU/Enformer, pero no se disponen de parámetros concretos para comparar. |

No se han proporcionado datos de rendimiento ni especificaciones adicionales para una comparativa cuantitativa con estos modelos.

## Limitaciones y advertencias

- Modelo compartido para revisión de colaboradores; no es un lanzamiento oficial y puede carecer de documentación completa.
- Licencia no especificada: el uso comercial es incierto hasta que el autor publique una licencia explícita.
- Entrenado exclusivamente para retina de ratón; no es transferible directamente a otros tejidos ni a otras especies.
- Solo predice accesibilidad de cromatina binarizada a partir de ATAC-seq; no cubre otras marcas como H3K27ac, H3K4me3 ni metilación del ADN.
- Los checkpoints con distintos nombres (`.ckpt` y `.grelu106.ckpt`) contienen los mismos pesos, pero no deben tratarse como versiones intercambiables en cargas de trabajo existentes.
- Dependencia de versiones concretas de gReLU: la versión 1.0.4 y las versiones modernas requieren archivos diferentes para cargar correctamente el modelo.
- Sin benchmarks públicos: la calidad predictiva frente a otros modelos genómicos no ha sido validada externamente.

## Enlaces

- Página del modelo en HuggingFace: https://huggingface.co/dedonnoc/retinal-models-mouse
