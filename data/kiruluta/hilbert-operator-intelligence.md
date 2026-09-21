# kiruluta/Hilbert-Operator-Intelligence

## Resumen

`kiruluta/Hilbert-Operator-Intelligence` no es un modelo de lenguaje ni un modelo generativo: es un repositorio de benchmark de escalado derivado del manuscrito *Operator-Based Machine Intelligence: A Hilbert Space Framework for Spectral Learning and Symbolic Reasoning*. Lo publica el usuario kiruluta bajo licencia Apache 2.0 y ocupa 0,0 GB, es decir, no distribuye pesos preentrenados ni un modelo listo para inferencia, sino código, configuraciones fijas, métricas legibles por máquina y un esquema de resultados común para que distintos contribuidores puedan comparar ejecuciones sobre GPUs de distinta capacidad.

El programa de investigación representa las entradas en espacios de Hilbert, aprende operadores de tarea y de razonamiento regularizados, y utiliza bases espectrales y modulación en lugar de tratar cada transformación como una capa densa opaca. El benchmark público principal es CIFAR-10, con CIFAR-100 como extensión más difícil; el conjunto `synthetic` se incluye solo como prueba de humo sin conexión. El modelo eleva las imágenes a un espacio de funciones con valores de canal, aplica operadores de Fourier 2-D truncados de forma repetida, añade una no linealidad residual local y clasifica la representación agrupada. Se admite factorización de bajo rango para el tensor del operador espectral.

Su relevancia actual es metodológica más que de producto: el código original de reproducibilidad está deliberadamente dimensionado para CPU (dígitos de `sklearn`), y la pregunta científica abierta es si las ventajas de precisión y eficiencia de los operadores espectrales estructurados se mantienen al aumentar anchura, profundidad, datos y cómputo en GPU. El repositorio se presenta explícitamente como una llamada a contribuidores con cómputo sustancial para ejecutar la matriz de escalado estandarizada y publicar resultados reproducibles etiquetados por hardware.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Aprendizaje de operadores en espacios de Hilbert; operadores de Fourier 2-D truncados aplicados de forma repetida, modulación espectral aprendible, factorización de bajo rango del tensor de operador y no linealidad residual local con agrupación final para clasificación |
| Parametros totales | no disponible (el repositorio no publica recuento de parámetros; se pide a los contribuidores que lo reporten junto con cada ejecución) |
| Parametros activos | no aplica (no es un modelo de mezcla de expertos) |
| Longitud de contexto | no aplica (modelo de clasificación de imágenes, no autoregresivo ni conversacional) |
| Tipos de cuantizacion | no disponible (no se documenta ningún esquema de cuantización; el entrenamiento admite precisión mixta con `--amp`) |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | Apache 2.0 |
| Formato de pesos | no disponible; el repositorio no contiene pesos (0,0 GB). El código y los checkpoints son de PyTorch (`state_dict` de PyTorch), y las salidas del benchmark son JSON/CSV |
| Entrada | Imágenes (CIFAR-10, CIFAR-100 o `synthetic` de 16x16 para la prueba de humo) |
| Salida | Clase predicha, precisión de test y NLL, más métricas de sistema (tiempo, memoria de GPU, throughput, recuento de parámetros) |

## Arquitectura y entrenamiento

La formulación subyacente plantea el aprendizaje supervisado como estimación regularizada de operadores entre espacios de Hilbert. En la implementación del benchmark, una imagen se eleva a un espacio de funciones con valores de canal y se procesa mediante una composición de operadores de Fourier 2-D truncados: en lugar de atención sobre tokens o convoluciones densas, se retienen un número fijo de modos espectrales por capa. Entre operadores se intercala una no linealidad residual local, y la representación final se agrupa antes de una cabeza de clasificación. El tensor del operador espectral admite factorización de bajo rango, lo que se postula como vía para mejorar la precisión por parámetro y por byte de GPU a anchuras grandes.

El repositorio define cuatro configuraciones de escalado, que son configuraciones de benchmark y no resultados de rendimiento declarados:

| Nivel | Anchura | Profundidad | Modos | Rango espectral | Uso previsto |
|---|---:|---:|---:|---:|---|
| tiny | 32 | 2 | 8 | completo | portátil / prueba de humo |
| small | 64 | 4 | 12 | 16 | una GPU de consumo |
| base | 128 | 6 | 16 | 32 | GPU de alta memoria |
| large | 256 | 8 | 16 | 64 | ejecución de escalado para contribuidores |

No se documentan en la información disponible el número de tokens de entrenamiento ni la composición del dataset más allá de los conjuntos CIFAR-10, CIFAR-100 y `synthetic`, ni si hubo RLHF, DPO o ajuste por preferencias (no procede en un benchmark de clasificación de imágenes). Las innovaciones técnicas que el autor señala como objeto de estudio son el escalado espectral (más modos retenidos hasta la saturación del ancho de banda relevante para la tarea), la eficiencia de operadores espectrales estructurados de bajo rango, la composición en profundidad sin atención cuadrática sobre tokens y la idoneidad de implementaciones intensivas en FFT en GPU a medida que crece la resolución espacial. Todo ello se enuncia como hipótesis, no como resultados establecidos, y se aceptan explícitamente resultados negativos.

El flujo de trabajo previsto es reproducible por diseño: `pip install -e '.[benchmark]'`, validación con `pytest -q`, prueba de humo offline con `configs/tiny.json` y el conjunto `synthetic`, ejecución estándar en GPU con `configs/base.json` sobre CIFAR-10 y `--amp`, y barrido de tres semillas mediante `DATASET=cifar10 ./scripts/run_scaling_sweep.sh`. Para cada contribución se solicita config, semilla, hash de commit, modelo de GPU, versiones de PyTorch y CUDA, tiempo de entrenamiento en reloj de pared, memoria máxima de GPU, throughput, recuento de parámetros, precisión de test y NLL.

## Capacidades

- Clasificación de imágenes sobre CIFAR-10 y CIFAR-100 mediante operadores espectrales, con resolución de entrada configurable.
- Prueba de humo offline sobre datos sintéticos, pensada para verificar la instalación sin acceso a red ni GPU.
- Barrido de escalado reproducible sobre anchura, profundidad, número de modos y rango espectral, con semillas repetibles y esquema de resultados JSON/CSV común.
- Soporte de factorización de bajo rango en el tensor del operador espectral, orientada a estudiar precisión por parámetro y por byte de GPU.
- Entrenamiento en precisión mixta mediante `--amp` y ejecución acelerada por GPU con operadores FFT.
- Generación de métricas de sistema y de modelo listas para agregación comunitaria (tiempo, memoria pico, throughput, parámetros, accuracy, NLL).
- No dispone de soporte de *tool calling* ni de *function calling*.
- No dispone de capacidades de agente ni de razonamiento multi-paso en el sentido de los modelos de lenguaje, aunque el manuscrito asociado enmarca el razonamiento como composición de operadores.
- No dispone de capacidades multilingües: no procesa texto.
- No dispone de modo de pensamiento, visión general fuera de la clasificación de imágenes, audio ni generación de texto.

## Casos de uso

- Estudio de leyes de escalado en operadores espectrales: ejecutar la matriz completa de niveles (`tiny`, `small`, `base`, `large`) sobre CIFAR-10 con varias semillas para medir si la precisión mejora al aumentar modos retenidos y si se satura, tal como plantea la primera hipótesis del repositorio.
- Comparación justa con baselines de visión: el repositorio pide explícitamente baselines de Transformer, CNN y FNO bajo presupuestos de parámetros y FLOPs igualados, de modo que sirve para producir comparativas metodológicamente controladas y no solo números aislados.
- Prueba de humo en integración continua: el nivel `tiny` con el conjunto `synthetic` a 16x16 y una época se ejecuta en portátil o en un runner de CI para verificar que una modificación del código no rompe el pipeline antes de gastar GPU.
- Investigación de kernels FFT optimizados: la cuarta hipótesis apunta a que las implementaciones intensivas en FFT ganan atractivo en GPU conforme crece la resolución espacial, por lo que el banco de pruebas sirve para medir ese efecto con configuraciones fijas.
- Validación de parametrizaciones estructuradas: probar factorizaciones de bajo rango, bases aprendidas y paquetes de wavelet como alternativas al operador de Fourier truncado, comparando precisión por parámetro y por byte de GPU.
- Estudio abierto de escalado comunitario: contribuir ejecuciones etiquetadas por hardware (modelo de GPU, versiones de CUDA y PyTorch, memoria pico, throughput) para construir un corpus transparente de resultados replicables.
- Punto de partida para aprendizaje de operadores en dominios científicos: dado que el marco del manuscrito formula el aprendizaje como estimación de operadores entre espacios de Hilbert, la infraestructura de entrenamiento y el esquema de métricas son reutilizables para adaptar el enfoque a problemas de tipo surrogate de EDP, aunque el repositorio solo publica el benchmark de imágenes.
- Auditoría de reproducibilidad: el protocolo exige config, semilla, hash de commit y notas de reproducibilidad, por lo que resulta adecuado para evaluar prácticas de replicación en investigación de machine learning científica.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El propio repositorio advierte que las tablas de niveles (`tiny`, `small`, `base`, `large`) definen configuraciones de benchmark, no rendimiento declarado, y pide a los contribuidores que envíen los JSON/CSV generados en lugar de editar cifras a mano. No se incluyen valores de precisión, NLL, tiempo ni throughput de referencia.

## Requisitos de hardware

- VRAM estimada para inferencia y entrenamiento: no disponible. El autor no publica cifras de memoria; la memoria pico de GPU es precisamente uno de los campos que se solicitan en cada contribución.
- Nivel `tiny` (anchura 32, profundidad 2, 8 modos, rango completo): pensado para portátil y prueba de humo; la prueba de humo oficial corre sobre datos `synthetic` de 16x16 con 1 época, 256 muestras de entrenamiento y 128 de test, por lo que es viable incluso en CPU.
- Nivel `small` (anchura 64, profundidad 4, 12 modos, rango 16): declarado para una única GPU de consumo. No se especifica el modelo concreto ni la VRAM mínima.
- Nivel `base` (anchura 128, profundidad 6, 16 modos, rango 32): declarado para GPU de alta memoria. No se especifica el umbral exacto de memoria ni el modelo de GPU.
- Nivel `large` (anchura 256, profundidad 8, 16 modos, rango 64): declarado como ejecución de escalado para contribuidores; se buscan específicamente contribuidores con cómputo sustancial, incluido entrenamiento multi-GPU.
- GPU recomendadas por modelo (A100, H100, RTX 4090, etc.): no disponible. El repositorio solicita a los contribuidores que indiquen el modelo de GPU utilizado, lo que implica que aún no existe una recomendación fijada.
- ¿Cabe en GPU de consumo? El nivel `small` está etiquetado como apto para una GPU de consumo, pero no se concreta cuál ni con qué memoria. Los niveles `base` y `large` no se declaran aptos para hardware de consumo.
- Opciones de despliegue: el proyecto es una librería y un conjunto de scripts de PyTorch. La instalación se realiza con `pip install -e '.[benchmark]'`; la validación, con `pytest -q`; el entrenamiento, con `python benchmarks/train_image.py` y el barrido, con `./scripts/run_scaling_sweep.sh`. Se admite `--amp` para precisión mixta. No se mencionan vLLM, llama.cpp, Ollama, TGI ni ningún servidor de inferencia, y no aplican a un modelo de clasificación.
- Latencia y throughput estimados: no disponible. No se publican cifras; el throughput y el tiempo de entrenamiento en reloj de pared forman parte de los datos que deben enviar los contribuidores.

## Comparativa con modelos similares

El repositorio no compite con modelos de lenguaje, sino con otras arquitecturas de clasificación de imágenes y con otros paradigmas de aprendizaje de operadores. No hay cifras publicadas de ninguna de las partes en la información disponible, por lo que la comparación es estructural y no de rendimiento.

| Alternativa | Paradigma | Entrada | Licencia habitual | Disponibilidad de pesos | Comparación con este repositorio |
|---|---|---|---|---|---|
| Fourier Neural Operator (FNO) | Operador espectral con FFT truncada | Campos funcionales (p. ej. EDP) | Código de investigación publicado por sus autores | Pesos por tarea, según la publicación | Es el pariente arquitectónico más directo: también trunca modos de Fourier. Aquí se traslada el paradigma a clasificación de imágenes y se añade un banco de escalado con métricas de sistema; no hay comparación numérica publicada. |
| Vision Transformer (ViT) | Transformer con autoatención sobre parches | Imágenes | Múltiples licencias según implementación | Pesos preentrenados ampliamente disponibles | El repositorio propone ViT como baseline a igualar en parámetros y FLOPs. La hipótesis del autor es que la composición de operadores evita la atención cuadrática sobre tokens; sin resultados publicados no puede confirmarse. |
| ResNet / CNN estándar | Convolución densa con residuales | Imágenes | Múltiples licencias según implementación | Pesos preentrenados ampliamente disponibles | Baseline clásico de CIFAR. El punto de comparación relevante es la eficiencia por parámetro y por byte de GPU en anchuras grandes, hipótesis que el repositorio deja abierta. |
| Modelos generativos de lenguaje open source | Transformer autorregresivo | Texto | Variables (Apache 2.0, MIT, licencias comunitarias) | Pesos y cuantizaciones GGUF disponibles | No son comparables en funcionalidad: este repositorio no genera texto, no conversa y no soporta tool calling. Se incluye solo para evitar la confusión de categoría que sugiere el nombre del proyecto. |

## Limitaciones y advertencias

- No es un modelo: no hay pesos descargables. El tamaño del repositorio es 0,0 GB y no se publica ningún checkpoint, cuantización ni demo. Cualquier expectativa de uso directo en inferencia es infundada.
- No se han publicado resultados. Las hipótesis científicas del repositorio (escalado espectral, eficiencia estructurada, composición en profundidad, idoneidad de la FFT en GPU) están explícitamente marcadas como no confirmadas. No deben citarse como hallazgos.
- Sesgos conocidos: no disponible. No se documenta ningún análisis de sesgo. El benchmark se limita a CIFAR-10 y CIFAR-100, conjuntos con clases y distribución fijas y sesgos de composición propios, sin que el repositorio aborde subrepresentación, sesgo geográfico ni robustez ante corrupción.
- Riesgo de alucinación: no aplica en el sentido de los modelos generativos, porque el sistema produce etiquetas de clase. Sí existe riesgo de sobreinterpretación de resultados por parte de los contribuidores, especialmente si se comparan ejecuciones con distinto hardware, versiones de CUDA o presupuestos de cómputo sin normalizar.
- Limitaciones de contexto e idioma: no aplica el concepto de ventana de contexto ni de cobertura multilingüe; el modelo procesa imágenes de resolución configurable, no secuencias de texto.
- Restricciones de licencia: la licencia es Apache 2.0, que permite uso comercial, modificación y redistribución con conservación del aviso de licencia y de las atribuciones. Sin embargo, no hay pesos que licenciar, y las condiciones de la licencia no cubren el manuscrito asociado, cuya licencia y disponibilidad no se indican.
- Caveat de producción: el proyecto se declara orientado a contribuidores y a investigación de escalado. No hay pipeline de inferencia, servidor, API ni garantías de latencia. No debe desplegarse como servicio.
- Dependencia de cómputo ajeno: los niveles `base` y `large` y las ejecuciones multi-semilla requieren GPUs de alta memoria o clústeres, de modo que la utilidad del benchmark depende de la voluntad de terceros de aportar cómputo y resultados.
- Trazabilidad: el repositorio fue creado y actualizado con pocos minutos de diferencia, sin descargas ni valoraciones, y las búsquedas web realizadas no arrojan información relevante sobre el proyecto ni sobre el manuscrito asociado, lo que limita la verificación externa.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/kiruluta/Hilbert-Operator-Intelligence
- Manuscrito de referencia (*Operator-Based Machine Intelligence: A Hilbert Space Framework for Spectral Learning and Symbolic Reasoning*): enlace no disponible en la información proporcionada
- Documentación del protocolo de escalado (`docs/SCALING_PROTOCOL.md`) y guía de contribución (`CONTRIBUTING.md`): referenciados en la model card, sin URL pública disponible
- Repositorio GitHub del proyecto: no disponible en la información proporcionada
- Demo o espacio de inferencia: no disponible
- Búsqueda web: no se han encontrado resultados relevantes sobre este repositorio o su manuscrito asociado en la información disponible
