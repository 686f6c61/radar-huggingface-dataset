# ANGExllL/coral-swift

## Resumen

ANGExllL/coral-swift es un clasificador de imágenes basado en EfficientNetV2-L (la implementación `efficientnet_v2_l` de torchvision, con cabeza de 1000 clases de ImageNet) afinado mediante entrenamiento adversario. El modelo lo publica el usuario ANGExllL y está orientado a la subred Perturb (netuid 26) de Bittensor, un ecosistema en el que los mineros aportan modelos que deben mantener su precisión frente a imágenes perturbadas de forma deliberada. El repositorio contiene un único fichero de pesos `model.safetensors` con 119.027.848 parámetros y una model card mínima con el código de carga.

A diferencia de los modelos de lenguaje, esta ficha describe un modelo de visión por computador: no procesa texto, no tiene ventana de contexto y no soporta tool calling ni agentes. Su entrada es una imagen RGB preprocesada con las transformaciones de `EfficientNet_V2_L_Weights.IMAGENET1K_V1` (redimensionado bicúbico a 480 píxeles, recorte central de 480 y normalización con media y desviación típica de 0,5) y su salida es una distribución sobre las 1000 clases de ImageNet-1k.

Su relevancia es acotada pero concreta: es un punto de partida reproducible para investigar robustez adversarial con un backbone convolucional maduro, y sirve como candidato de minero en la subred Perturb. La model card incluye el hotkey del minero (`5HpNP2uqmPH9NL4qM2pfV1teEfpJWf5FgUuvXMU5JiKmusSN`) y el hash on-chain `sha256(model.safetensors || hotkey) = 99184ecc7a9ed8c2fcfc340bb5322fa03a863959a0c216a0423220586057eecf`, lo que permite verificar la correspondencia entre el fichero publicado y la participación en la subred. El repositorio no tiene descargas ni likes registrados en la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | EfficientNetV2-L (CNN con bloques MBConv y Fused-MBConv y escalado compuesto), implementación torchvision `efficientnet_v2_l` |
| Parametros totales | 119.027.848 (recuento real de `model.safetensors`) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo de visión; entrada de imagen de 480 x 480 píxeles) |
| Tipos de cuantizacion | no disponible (no se publican pesos cuantizados; solo el checkpoint en la precisión de entrenamiento) |
| Idiomas soportados | no aplica (clasificación de imágenes; las 1000 clases de ImageNet están etiquetadas en inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (`model.safetensors`) |
| Numero de clases | 1000 (ImageNet-1k) |
| Entrada | imagen RGB; redimensionado bicúbico a 480, recorte central 480 |
| Normalizacion | media = desviación típica = 0,5 |
| Libreria declarada | torchvision |
| Pipeline en HuggingFace | image-classification |
| Tamano del repositorio | 0,5 GB |
| Descargas / likes | 0 / 0 |
| Fecha de creacion (segun HuggingFace) | 2026-09-27 |
| Hotkey del minero | 5HpNP2uqmPH9NL4qM2pfV1teEfpJWf5FgUuvXMU5JiKmusSN |
| Hash on-chain | sha256(model.safetensors \|\| hotkey) = 99184ecc7a9ed8c2fcfc340bb5322fa03a863959a0c216a0423220586057eecf |

## Arquitectura y entrenamiento

La arquitectura es una red neuronal convolucional de la familia EfficientNetV2, en su variante L. EfficientNetV2 combina bloques MBConv con bloques Fused-MBConv en las etapas iniciales y aplica escalado compuesto sobre profundidad, anchura y resolución de entrada; el resultado es un modelo de unos 119 millones de parámetros que en torchvision se distribuye con pesos preentrenados en ImageNet-1k. El checkpoint aquí publicado conserva la cabeza de clasificación de 1000 clases y se carga con `efficientnet_v2_l(weights=None)` seguido de `load_state_dict(load_file("model.safetensors"))`.

El único detalle de entrenamiento documentado es que se aplicó entrenamiento adversario sobre el backbone preentrenado, en el contexto de la subred Perturb de Bittensor. No se especifican en la información disponible el número de tokens o imágenes vistas, la composición del conjunto de datos, el tipo de perturbaciones empleadas (L-infinito, L2, ataques de caja blanca o negra), el método de generación de ejemplos adversarios, ni si hubo fases adicionales de ajuste. Tampoco se documentan técnicas de decodificación o atención, que no aplican a este tipo de modelo. Cualquier afirmación sobre el coste computacional del entrenamiento o sobre la mezcla de datos sería especulativa.

## Capacidades

- Clasificación de imágenes en las 1000 clases de ImageNet-1k, con la misma taxonomía que el checkpoint original de torchvision.
- Robustez frente a perturbaciones: el entrenamiento adversario busca mantener el rendimiento cuando la imagen de entrada ha sido alterada de forma deliberada, aunque no se publican métricas que lo cuantifiquen.
- Inferencia sobre imágenes a 480 x 480 píxeles, una resolución superior a la de la mayoría de clasificadores ligeros, lo que favorece el reconocimiento de detalles finos.
- Uso como extractor de características o backbone para transfer learning en tareas de visión distintas de ImageNet (la model card no documenta explícitamente la API de extracción de embeddings, pero la arquitectura lo permite).
- Exportación a otros formatos de inferencia (ONNX, TensorRT) mediante las herramientas estándar de PyTorch, no documentada en la model card pero técnicamente viable.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No tiene capacidades multilingües: no procesa ni genera texto.
- No dispone de modo de razonamiento explícito, visión-lenguaje, audio ni generación de imágenes.

## Casos de uso

- Etiquetado automático de grandes volúmenes de imágenes: el modelo asigna una de las 1000 clases de ImageNet a cada imagen, lo que permite preanotar catálogos, archivos fotográficos o conjuntos de datos antes de una revisión humana.
- Participación como minero en la subred Perturb (netuid 26) de Bittensor: el checkpoint, con su hotkey y su hash on-chain, está preparado para responder a las tareas de clasificación robusta que plantea la subred y ser verificado por los validadores.
- Moderación y filtrado de contenido por categorías: clasificar imágenes entrantes en categorías amplias (animales, objetos, escenas, instrumentos) para enrutarlas a revisión o descartarlas en un pipeline de ingestión.
- Control de calidad industrial sobre imágenes degradadas: al haberse entrenado con perturbaciones, es un candidato razonable para inspección visual donde la captura presenta ruido de sensor, compresión JPEG agresiva, desenfoque o variaciones de iluminación.
- Búsqueda y organización de bibliotecas visuales: generar etiquetas semánticas que alimenten un índice de búsqueda por categoría en repositorios de imágenes de producto, patrimonio digital o documentación técnica.
- Investigación en robustez adversarial: servir como baseline convolucional afinado con entrenamiento adversario para comparar, en igualdad de arquitectura, frente al checkpoint estándar de EfficientNetV2-L y frente a otros métodos de defensa.
- Transfer learning con presupuesto ajustado: reutilizar los pesos como inicialización de un clasificador específico de dominio (por ejemplo, defectos de fabricación o especies locales), sustituyendo la cabeza de 1000 clases.
- Inferencia en el borde o en CPU: con 119 millones de parámetros y pesos de aproximadamente 476 MB en FP32, es desplegable en servidores sin GPU dedicada o en dispositivos con aceleración limitada, siempre que la latencia no sea crítica.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

No consta la precisión top-1 ni top-5 en ImageNet-1k, ni métricas de robustez (por ejemplo, precisión bajo ataque PGD o AutoAttack), ni comparaciones con el checkpoint original de torchvision. Tampoco se documentan latencia ni throughput medidos. La única evidencia de entrenamiento adversario es la declaración de la model card; no hay cifras que la respalden.

## Requisitos de hardware

- Pesos en FP32: 119.027.848 parámetros x 4 bytes = aproximadamente 476 MB. Coincide con el tamaño del repositorio (0,5 GB).
- Pesos en FP16/BF16: aproximadamente 238 MB.
- Pesos en INT8: aproximadamente 119 MB (la cuantización no está publicada; el cálculo es una estimación a partir del recuento de parámetros).
- VRAM estimada para inferencia con lote de 1 imagen a 480 x 480: del orden de 2 a 3 GB en FP32 y de 1,5 a 2 GB en FP16, incluyendo activaciones. Son estimaciones derivadas del tamaño de los pesos y de la resolución de entrada, no medidas publicadas.
- Cabe en GPU de consumo: sí, en cualquier GPU con 4 GB o más de VRAM, como GTX 1650 (4 GB, justo), GTX 1660 (6 GB), RTX 3050 (8 GB), RTX 3060 (12 GB) o RTX 4060 (8 GB). También es viable en CPU para lotes pequeños y en Apple Silicon vía MPS.
- GPU de centro de datos (A100, H100, L40S) no son necesarias para inferencia; solo tendrían sentido para reentrenamiento o para servir lotes muy grandes con requisitos de latencia estrictos.
- Opciones de despliegue: PyTorch + torchvision con carga directa de `model.safetensors` es la ruta documentada por el autor. Como alternativas no documentadas pero estándar para esta arquitectura: exportación a ONNX y ejecución con ONNX Runtime, compilación con TensorRT, TorchScript y TorchServe.
- No aplican vLLM, llama.cpp, Ollama ni TGI: son herramientas para modelos de lenguaje.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Arquitectura | Parametros | Entrada | Entrenamiento | Licencia | Datos de rendimiento |
|---|---|---|---|---|---|---|
| ANGExllL/coral-swift | EfficientNetV2-L (torchvision) | 119.027.848 | 480 x 480 | Fine-tuning con entrenamiento adversario sobre ImageNet-1k | apache-2.0 | no disponible |
| EfficientNetV2-L (checkpoint IMAGENET1K_V1 de torchvision) | EfficientNetV2-L | mismo backbone, por lo que el recuento coincide (119 M) | 480 x 480 | Preentrenamiento estándar en ImageNet-1k | la del repositorio de torchvision | no disponible en la información proporcionada |
| EfficientNetV2-M / EfficientNetV2-S | EfficientNetV2 | no disponible en la información proporcionada | 480 x 480 | Preentrenamiento en ImageNet-1k | no disponible en la información proporcionada | no disponible |
| ConvNeXt, ViT-L/16 u otros backbones de clasificación | CNN moderna / transformer de visión | no disponible en la información proporcionada | variable | Preentrenamiento en ImageNet-1k y variantes | no disponible en la información proporcionada | no disponible |

No hay datos de rendimiento en la información proporcionada que permitan afirmar que este checkpoint supera o iguala al EfficientNetV2-L original ni a modelos adversarialmente robustos de la literatura. La comparación honesta en este punto requiere evaluación propia.

## Limitaciones y advertencias

- Sesgos heredados de ImageNet-1k: el conjunto de datos tiene una cobertura desigual entre clases, sesgos geográficos y culturales en la representación de personas, objetos y escenas, y una taxonomía de 1000 categorías fijas que no cubre dominios especializados.
- Riesgo de error en clases finas: las categorías muy próximas entre sí (razas de perro, variedades de ave, tipos de hongo) son propensas a confusión, y no se publica matriz de confusión ni calibración de confianza.
- Riesgo de alucinación en el sentido de clasificación: el modelo siempre devuelve una distribución sobre 1000 clases, por lo que una imagen fuera de la taxonomía recibirá igualmente una etiqueta con cierta confianza. Es imprescindible aplicar umbrales o detección de fuera de distribución en producción.
- Robustez no verificada: la model card declara entrenamiento adversario, pero no se publican métricas bajo ataque. No se puede asumir un nivel de robustez concreto ni el tipo de perturbación para el que fue optimizado.
- Posible compromiso entre precisión limpia y robustez: es un efecto habitual en la literatura de entrenamiento adversario que la precisión sobre imágenes sin perturbar disminuya; aquí no hay datos para cuantificarlo.
- Limitaciones de idioma: no aplica al modelo, pero las etiquetas de salida están en inglés, lo que exige una capa de traducción si el consumidor final trabaja en castellano.
- Licencia: apache-2.0 permite uso comercial y modificación con obligación de conservar avisos de licencia y atribución. Se debe tener en cuenta que el modelo es un derivado de pesos de torchvision y que la participación en la subred Bittensor puede estar sujeta a sus propias reglas, ajenas a la licencia del checkpoint.
- Validación comunitaria nula: 0 descargas y 0 likes en el momento de la información disponible, sin evaluación independiente publicada.
- Verificación recomendada antes de usar: comprobar que el hash `99184ecc7a9ed8c2fcfc340bb5322fa03a863959a0c216a0423220586057eecf` corresponde al fichero descargado y al hotkey declarado, y validar el preprocesado exacto (bicúbico a 480, recorte central 480, media y desviación 0,5); una discrepancia degrada notablemente la precisión.
- Confusión de nombre: el identificador «coral-swift» no guarda relación con la plataforma Coral de Google ni con sus Edge TPU; los resultados de búsqueda sobre coral.ai y sobre herramientas de modelado 3D no corresponden a este modelo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ANGExllL/coral-swift
- Subred Perturb (contexto de entrenamiento declarado): https://perturbai.io
- Referencia de la arquitectura en torchvision (`efficientnet_v2_l`): no se proporciona enlace en la información disponible.
- No se han encontrado en la búsqueda web enlaces correspondientes a este modelo: los resultados obtenidos apuntan a `modelscope/ms-swift`, a la plataforma Coral de Google y a modelos 3D de Meshy, ninguno relacionado con ANGExllL/coral-swift.
