# qhoenix/slate-heron

## Resumen

slate-heron es un clasificador de imágenes publicado por el usuario qhoenix en HuggingFace. Se trata de un EfficientNetV2-L de torchvision (`efficientnet_v2_l`), con 119.027.848 parámetros y cabeza de 1000 clases de ImageNet, afinado mediante entrenamiento adversarial para la subred Perturb (netuid 26) de Bittensor. El repositorio ocupa 0,5 GB y los pesos se distribuyen en formato safetensors, con licencia Apache 2.0.

El modelo no es un modelo de lenguaje ni un sistema multimodal generativo: es una red convolucional de clasificación de imagen única, pensada para ser evaluada en un contexto de minería de Bittensor donde el objetivo es la robustez frente a perturbaciones adversarias. Esa naturaleza condiciona por completo su ficha: no hay ventana de contexto, no hay generación de texto, no hay tool calling y no hay soporte multilingüe en el sentido habitual.

Su relevancia actual es acotada y muy específica: sirve como referencia para quien investigue entrenamiento adversarial sobre arquitecturas EfficientNetV2, para quien participe en la subred Perturb y quiera verificar la procedencia del modelo mediante el hash on-chain declarado, o para quien necesite un clasificador ImageNet de ~119 M de parámetros desplegable en una GPU de gama media. Con 8 descargas y 0 likes en el momento de la consulta, se trata de una publicación de nicho, no de un modelo ampliamente adoptado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | EfficientNetV2-L (torchvision `efficientnet_v2_l`), red convolucional con bloques MBConv y Fused-MBConv |
| Parametros totales | 119.027.848 |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (clasificacion de imagen; entrada fija de 480x480 pixeles) |
| Tipos de cuantizacion | no disponible (no se documentan pesos cuantizados; los pesos publicados son de precision completa, ~0,5 GB) |
| Idiomas soportados | no aplica; las 1000 etiquetas de ImageNet estan en ingles |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (`model.safetensors`) |
| Tarea | image-classification (1000 clases de ImageNet) |
| Biblioteca declarada | torchvision |
| Resolucion de entrada | 480x480 (bicubic resize a 480, center crop 480) |
| Normalizacion | media = desviacion = 0,5 |
| Hash on-chain | sha256(model.safetensors \|\| hotkey) = `cf646ad2d3d83147992faaca9ca4bd5a7c2242b9a11330aa6f7189095e0dbf5d` |
| Hotkey del minero | `5FGxe3AFaJ3LsM5LJtxdBS8143WFEd9eNWVKErr29uV1K8wt` |
| Tamano del repositorio | 0,5 GB |
| Fecha de creacion | 2026-09-30 |
| Fecha de actualizacion | 2026-09-30 |

## Arquitectura y entrenamiento

La arquitectura es EfficientNetV2-L tal y como se implementa en torchvision, es decir, una CNN con escalado compuesto que combina bloques Fused-MBConv en las etapas iniciales y MBConv en las finales, con atención por squeeze-and-excitation. El modelo se ha inicializado desde la variante de torchvision y se ha sometido a un ajuste fino con entrenamiento adversarial, según declara la propia model card. No se especifica en la información disponible el número de tokens o imágenes de entrenamiento, la composición del dataset más allá de las 1000 clases de ImageNet, ni la receta exacta de ataque (tipo de perturbación, epsilon, número de pasos de PGD u otro método).

El único detalle procedimental documentado es el preprocesado, que debe replicarse exactamente para reproducir el comportamiento esperado: `EfficientNet_V2_L_Weights.IMAGENET1K_V1.transforms()`, con redimensionado bicúbico a 480, recorte central de 480 y normalización con media y desviación típica de 0,5 en los tres canales. La carga de pesos se hace con `safetensors.torch.load_file` sobre un modelo `efficientnet_v2_l(weights=None)`.

El contexto de publicación es la subred Perturb (netuid 26) de Bittensor, orientada a modelos resistentes a perturbaciones adversarias. El autor incluye un hash calculado sobre la concatenación de los pesos y su hotkey, lo que permite verificar que el fichero servido corresponde a la contribución registrada on-chain. No se documentan innovaciones técnicas adicionales como decodificación especulativa, atención lineal ni mecanismos híbridos, algo esperable en una CNN de clasificación.

## Capacidades

- Clasificación de imágenes en las 1000 clases de ImageNet, con una única etiqueta dominante por imagen.
- Robustez frente a perturbaciones adversarias, consecuencia del entrenamiento adversarial declarado; el grado exacto de robustez no se cuantifica en la información disponible.
- Extracción de características: al ser un backbone EfficientNetV2-L completo, las activaciones previas a la cabeza pueden reutilizarse para tareas de representación visual o fine-tuning posterior.
- Inferencia determinista y de bajo coste frente a modelos generativos: no produce texto, no hay decodificación autoregresiva ni muestreo estocástico.
- No dispone de tool calling ni function calling.
- No dispone de capacidades de agente ni de razonamiento multi-paso; es un modelo de una sola pasada.
- No dispone de modo de pensamiento (thinking mode), ni de entrada o salida de audio, vídeo o texto.
- Capacidades multilingües: no aplica. Las etiquetas de salida están en inglés y el modelo no procesa lenguaje.
- Verificación de procedencia: el hash on-chain y el hotkey permiten auditar la integridad del artefacto en el ecosistema Bittensor.

## Casos de uso

- Moderación de contenido visual por categoría: el modelo etiqueta imágenes en 1000 clases de ImageNet, lo que permite filtrar categorías sensibles (armas, contenido explícito dentro de las clases cubiertas) en pipelines de subida de contenido, con la salvedad de que la taxonomía de ImageNet es limitada y no cubre todo el espacio de riesgos.
- Etiquetado automático de catálogos de producto: para inventarios donde cada referencia encaja en una clase genérica de ImageNet (animales, vehículos, utensilios, plantas), el modelo puede generar metadatos de categoría a bajo coste, con ~119 M de parámetros y ejecución en una sola GPU consumer.
- Pre-filtrado en sistemas de visión de varias etapas: usar slate-heron como primer clasificador rápido que descarte o dirija imágenes hacia modelos más costosos (detección, segmentación o VLM), reduciendo el cómputo total del pipeline.
- Evaluación de robustez adversaria en investigación: sirve como punto de comparación frente al EfficientNetV2-L estándar de torchvision para medir la degradación de precisión limpia a cambio de robustez, siempre que se replique el preprocesado documentado de 480x480 con media y desviación 0,5.
- Backbone para transfer learning en dominios específicos: congelando las capas convolucionales y reentrenando la cabeza, se puede adaptar a clasificación binaria o multiclase propia (control de calidad industrial, clasificación de cultivos, diagnóstico por imagen preliminar) partiendo de un modelo ya ajustado.
- Participación y auditoría en la subred Perturb de Bittensor: verificar el hash `cf646ad2...` y el hotkey declarado para comprobar que los pesos descargados coinciden con la contribución registrada, y usar el modelo como referencia de comparación frente a otras contribuciones de la subred.
- Indexación y búsqueda visual de archivos: generar una etiqueta de clase por imagen para construir un índice rudimentario de bibliotecas de imágenes o activos digitales, sin necesidad de infraestructura GPU dedicada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye precisión top-1 o top-5 en ImageNet, ni métricas de robustez adversaria (por ejemplo, precisión bajo ataque PGD a distintos valores de epsilon), ni comparaciones con el EfficientNetV2-L base. Tampoco hay datos de latencia o throughput. Cualquier cifra que se cite sobre este modelo concreto debería medirse de forma independiente replicando el preprocesado declarado.

## Requisitos de hardware

- Pesos en precisión completa: 119.027.848 parámetros x 4 bytes ≈ 476 MB, coherente con el tamaño de repositorio de 0,5 GB.
- Pesos en media precisión (fp16) si se convierten: ≈ 238 MB solo de parámetros.
- VRAM estimada para inferencia: los pesos ocupan menos de 0,5 GB, pero las activaciones a 480x480 con lotes pequeños son el factor dominante. Como estimación prudente, entre 2 y 6 GB de VRAM según tamaño de lote y si se usa fp32 o fp16/AMP; no hay mediciones publicadas por el autor.
- Cabe en GPU de consumo: sí, con holgura en cualquier GPU con 4 GB o más de VRAM (GTX 1650, RTX 3050, RTX 3060, RTX 4060, RTX 4090). En CPU es viable para inferencia puntual, aunque con latencias notablemente mayores.
- GPU de centro de datos: no requiere A100 ni H100 para inferencia; se pueden usar para procesar lotes grandes en entrenamiento o evaluación masiva.
- Opciones de despliegue: PyTorch + torchvision como vía canónica (carga directa con `load_state_dict`), exportación a TorchScript u ONNX Runtime para servir sin dependencia de Python, y envoltorios tipo Triton Inference Server o FastAPI para exposición HTTP. llama.cpp, Ollama y GGUF no aplican: son herramientas para modelos de lenguaje, no para una CNN de clasificación.
- Latencia y throughput: no disponibles. No se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Arquitectura | Parametros | Entrada | Licencia | Datos de rendimiento |
|---|---|---|---|---|---|
| qhoenix/slate-heron | EfficientNetV2-L con entrenamiento adversarial | 119.027.848 | 480x480 | apache-2.0 | no disponible |
| EfficientNetV2-L (torchvision, ImageNet-1K) | EfficientNetV2-L | misma arquitectura y orden de parametros | 480x480 | depende de la distribucion de torchvision | no disponible en la informacion proporcionada |
| ConvNeXt-L | CNN moderna con bloques tipo transformer | no disponible | no disponible | no disponible | no disponible |
| ViT-L/16 | Vision Transformer | no disponible | no disponible | no disponible | no disponible |

La comparativa se limita a la categoría funcional (clasificación de imagen en ImageNet a resolución media). No se dispone de cifras verificadas de precisión ni de robustez para ninguno de los candidatos en la información proporcionada, por lo que no es posible establecer una jerarquía de rendimiento. Para una comparación rigurosa habría que medir cada modelo sobre el mismo conjunto de evaluación, con y sin perturbaciones adversarias.

## Limitaciones y advertencias

- Modelo de clasificación, no generativo: no puede mantener conversaciones, redactar texto, ejecutar código ni razonar en varios pasos. Cualquier expectativa de ese tipo es un error de categoría.
- Taxonomía cerrada: solo predice entre 1000 clases de ImageNet. Las imágenes fuera de ese vocabulario se asignarán forzosamente a alguna de las clases existentes, con confianza potencialmente alta, lo que constituye una forma de alucinación de etiqueta.
- Sesgos de ImageNet: la distribución de clases está desequilibrada y sobrerrepresenta categorías occidentales (razas de perro, especies norteamericanas, objetos de consumo). El rendimiento fuera de esa distribución será desigual y puede producir etiquetas sistemáticamente erróneas en determinados grupos.
- Sensibilidad al preprocesado: el modelo espera exactamente el pipeline declarado (bicúbico a 480, center crop 480, media = desviación = 0,5). Cualquier desviación —por ejemplo usar la normalización estándar de ImageNet con media y desviación distintas— degradará las predicciones sin aviso.
- Robustez adversaria no cuantificada: el entrenamiento adversarial se declara en la model card, pero no se publican métricas de epsilon, tipo de ataque ni precisión bajo ataque. No se puede asumir un nivel de robustez concreto.
- Riesgo de overfitting a la pérdida de la subred Perturb: al ser un ajuste fino orientado a una competición concreta, el modelo puede estar optimizado para la métrica de esa subred en lugar de para precisión general, con el consiguiente sacrificio de exactitud en condiciones limpias (habitual en entrenamiento adversarial, aunque no se aportan números).
- Licencia Apache 2.0: permite uso comercial, modificación y redistribución, siempre que se conserve el aviso de licencia y se indiquen los cambios. No hay cláusulas de uso restringido documentadas.
- Adopción mínima: 8 descargas y 0 likes en el momento de la consulta. No hay evidencia de uso en producción, reportes de terceros ni validación independiente. Tratarlo como dependencia crítica conlleva riesgo de falta de mantenimiento.
- Ausencia de idiomas: el modelo no procesa texto, por lo que no hay soporte multilingüe que evaluar.
- Verificar integridad antes de usar: comprobar que el sha256 de `model.safetensors` concatenado con el hotkey coincide con el hash declarado, dado que el artefacto se distribuye en un contexto de minería incentivada.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/qhoenix/slate-heron
- Subred Perturb (referenciada en la model card): https://perturbai.io
- Documentación de `efficientnet_v2_l` en torchvision: no disponible en la información proporcionada
- Paper de EfficientNetV2: no disponible en la información proporcionada
- Repositorio de código o demo del autor: no disponible en la información proporcionada
- Nota sobre la busqueda web: los resultados recuperados (publicaciones sobre imágenes de fénix, promociones inmobiliarias en Phoenix, informes de McKinsey y bibliografías sobre garzas) no guardan relación con este modelo y se han descartado. No se han encontrado papers, blogs ni repositorios adicionales específicos de `qhoenix/slate-heron`.
