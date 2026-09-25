# qhoenix/onyx-lark

## Resumen

onyx-lark es un modelo de clasificacion de imagenes publicado por el usuario qhoenix en HuggingFace. Se trata de un EfficientNetV2-L de la libreria torchvision (`efficientnet_v2_l`), con 119.027.848 parametros y una cabeza de clasificacion de 1000 clases correspondientes a ImageNet-1K. El modelo parte de los pesos preentrenados de ImageNet y ha sido ajustado con entrenamiento adversarial para la subred Perturb (netuid 26) de Bittensor, una red descentralizada en la que los mineros compiten por ofrecer clasificadores robustos frente a perturbaciones adversariales.

El problema que aborda es la fragilidad de los clasificadores convolucionales convencionales ante perturbaciones minimas e imperceptibles en la entrada. El ajuste adversarial busca que el modelo mantenga su prediccion correcta cuando la imagen ha sido manipulada de forma maliciosa, algo relevante en pipelines de moderacion de contenido, verificacion y clasificacion en produccion expuesta a entradas no controladas.

El repositorio es de tipo `image-classification`, con licencia Apache 2.0, formato de pesos safetensors y un tamano de 0.5 GB. No es un modelo de lenguaje: no genera texto, no soporta tool calling ni razonamiento multi-paso. En el momento de la consulta acumula 0 descargas y 0 likes, y no se han publicado resultados de benchmarks asociados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | EfficientNetV2-L (CNN, torchvision `efficientnet_v2_l`) |
| Parametros totales | 119.027.848 |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo de clasificacion de imagenes) |
| Tipos de cuantizacion | no disponible (el repositorio solo publica pesos en safetensors; no se documentan variantes cuantizadas) |
| Idiomas soportados | no aplica; las 1000 etiquetas de clase de ImageNet-1K estan en ingles |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (`model.safetensors`) |
| Entrada | imagen; preprocesado bicubic resize 480, center crop 480, media = desviacion = 0.5 |
| Salida | 1000 logits (clases ImageNet-1K) |
| Libreria | torchvision |
| Tamano del repositorio | 0.5 GB |
| Fecha de creacion | 2026-09-24 |
| Ultima actualizacion | 2026-09-24 |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

EfficientNetV2-L es una red neuronal convolucional que combina bloques MBConv con Fused-MBConv, entrenada originalmente con escalado compuesto de profundidad, anchura y resolucion, y con un esquema de aprendizaje progresivo que incrementa la resolucion de entrada a lo largo del entrenamiento. La variante L es la mayor de la familia EfficientNetV2 en cuanto a parametros (119.027.848 en esta version) y opera con imagenes de 480x480 pixeles segun el preprocesado declarado en la model card.

El modelo ha sido ajustado con entrenamiento adversarial para la subred Perturb de Bittensor (netuid 26). La model card no especifica el numero de tokens o imagenes de entrenamiento, la composicion del dataset de ajuste, el tipo de ataques empleados (por ejemplo FGSM o PGD), la magnitud de la perturbacion, el numero de epocas ni si se aplicaron tecnicas adicionales de defensa. Tampoco se documentan etapas de RLHF, DPO ni similares, que no aplican a un clasificador de imagenes. Se incluye un hash on-chain, `sha256(model.safetensors || hotkey) = 8816ad13451612f897b5efefa990720e18463737a73da8808923aa21ef250667`, asociado a la hotkey del minero `5Ebm5cRFAzkHGtq3myyvnL3w6GVSPrAy4LY6HSFMNdQLnomj`, lo que permite verificar la integridad del artefacto en el contexto de la subred.

Los pesos se cargan sobre una instancia de `efficientnet_v2_l(weights=None)` mediante `safetensors.torch.load_file`, sin necesidad de codigo personalizado mas alla de torchvision y safetensors.

## Capacidades

- Clasificacion de imagenes en 1000 categorias de ImageNet-1K, con salida de logits y etiquetas en ingles.
- Robustez adversarial como objetivo declarado del ajuste, orientada a la subred Perturb (netuid 26) de Bittensor.
- Extraccion de representaciones: al ser una CNN completa, puede emplearse como backbone congelado para transfer learning, aunque no se documenta la dimensionalidad del vector de caracteristicas ni se publican embeddings.
- Inferencia por lotes (batched inference) en GPU o CPU mediante PyTorch/torchvision.
- No soporta generacion de texto, razonamiento, codigo, matematicas ni vision-lenguaje.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No dispone de modo "thinking", ni capacidades de audio o video.
- No se documentan capacidades multilingues: la unica salida son etiquetas de clase predefinidas en ingles.

## Casos de uso

- Moderacion de contenido automatizada: el modelo puede clasificar imagenes subidas por usuarios en las 1000 categorias de ImageNet-1K. Su ajuste adversarial es relevante porque las imagenes de usuario suelen estar recomprimidas, redimensionadas o manipuladas, condiciones en las que un clasificador estandar pierde precision.
- Mineria en la subred Perturb (netuid 26) de Bittensor: un operador puede desplegar este modelo como minero, ya que la model card incluye la hotkey y el hash on-chain necesarios para registrar la contribucion en la red.
- Investigacion en robustez adversarial: sirve como punto de comparacion frente a un EfficientNetV2-L sin ajuste adversarial, permitiendo medir la degradacion de precision bajo ataques FGSM o PGD con el mismo backbone y el mismo preprocesado.
- Pre-etiquetado de datasets de vision: al cubrir las 1000 clases de ImageNet-1K, puede usarse para auto-etiquetar grandes volumenes de imagenes antes de una revision humana, reduciendo el coste de anotacion en proyectos de recopilacion de datos.
- Pipeline de verificacion de integridad de modelos: el hash on-chain publicado permite comprobar que los pesos desplegados son exactamente los registrados, un requisito util en entornos donde la procedencia del modelo debe auditarse.
- Backbone para transfer learning en dominios verticales: partiendo de los 119 millones de parametros preentrenados, se puede reentrenar la cabeza de clasificacion para un numero reducido de clases propias (por ejemplo, defectos de fabricacion o especies concretas) con un coste de ajuste moderado.
- Clasificacion en entornos con entradas degradadas: escenarios de camaras de vigilancia, compresion JPEG agresiva o transmision con perdidas, donde la robustez frente a perturbaciones es una ventaja frente a clasificadores no endurecidos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

La model card no incluye metricas de exactitud top-1 o top-5 sobre ImageNet-1K, ni curvas de precision frente a ataques adversariales, ni comparaciones con el modelo base sin ajuste. Tampoco se aportan datos de latencia o throughput.

## Requisitos de hardware

- Pesos en precision completa (fp32): aproximadamente 476 MB (119.027.848 parametros x 4 bytes).
- Pesos en media precision (fp16/bf16): aproximadamente 238 MB.
- VRAM estimada para inferencia con lote de 1 imagen a 480x480 en fp32: en torno a 1-1,5 GB contando activaciones; en fp16, aproximadamente 0,7-1 GB. Son estimaciones de calculo, no datos publicados por el autor.
- Cabe en cualquier GPU de consumo con 4 GB o mas de VRAM: GTX 1650, RTX 3050, RTX 3060, RTX 4060, RTX 4090, entre otras. Tambien es viable la inferencia en CPU, con latencias mayores.
- GPU de datacenter (A100, H100, L40S) recomendadas para procesamiento por lotes de alto volumen o para reentrenamiento y ajuste fino.
- Opciones de despliegue: PyTorch con torchvision como via nativa; exportacion a TorchScript, ONNX Runtime, TensorRT, OpenVINO, o servido con NVIDIA Triton. No aplican llama.cpp, Ollama ni vLLM, al no tratarse de un modelo de lenguaje.
- Latencia y throughput: no disponible. EfficientNetV2-L a 480x480 es sustancialmente mas costoso por imagen que variantes menores como EfficientNet-B0, por lo que conviene medir en el hardware objetivo antes de dimensionar un servicio.

## Comparativa con modelos similares

Los valores de parametros de los modelos alternativos son cifras de referencia de documentacion publica (torchvision), no verificadas en la informacion proporcionada para esta ficha.

| Modelo | Parametros | Entrada tipica | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| qhoenix/onyx-lark (EfficientNetV2-L ajustado) | 119.027.848 | 480x480 | Clasificacion ImageNet-1K con ajuste adversarial | apache-2.0 | HuggingFace, 0 descargas |
| EfficientNetV2-L (pesos originales de ImageNet) | ~119 M | 480x480 | Clasificacion ImageNet-1K | segun distribucion de torchvision | Ampliamente disponible |
| EfficientNetV2-M | ~54 M | 480x480 | Clasificacion ImageNet-1K | segun distribucion de torchvision | Ampliamente disponible |
| ConvNeXt-L | ~198 M | 224x224 | Clasificacion ImageNet-1K | segun distribucion de torchvision | Ampliamente disponible |
| ViT-L/16 | ~307 M | 224x224 | Clasificacion ImageNet-1K | segun distribucion de torchvision | Ampliamente disponible |

No hay datos publicados que permitan comparar la exactitud ni la robustez adversarial de onyx-lark frente a estas alternativas.

## Limitaciones y advertencias

- Cobertura de clases cerrada: solo predice las 1000 categorias de ImageNet-1K. Cualquier clase fuera de ese conjunto (rostros concretos, productos, defectos industriales, especies locales) requiere reentrenar la cabeza de clasificacion.
- Riesgo de error confiado: como todo clasificador, puede asignar una probabilidad alta a una clase incorrecta, especialmente en imagenes fuera de la distribucion de ImageNet. No existe un mecanismo nativo de absteccion o "no lo se".
- Sesgos heredados de ImageNet-1K: el conjunto de entrenamiento original esta sesgado hacia determinadas geografias, culturas y contextos fotograficos, lo que puede traducirse en un rendimiento desigual segun la procedencia de las imagenes.
- Robustez no cuantificada: la model card declara entrenamiento adversarial, pero no publica el tipo de ataque, la magnitud de la perturbacion ni la precision resultante bajo ataque. No se puede asumir un nivel de robustez concreto sin evaluarlo.
- Posible perdida de precision en datos limpios: el entrenamiento adversarial suele implicar un compromiso entre exactitud en condiciones normales y robustez; el autor no aporta la cifra de exactitud limpia para verificar el impacto.
- Preprocesado rigido: el modelo espera bicubic resize a 480, center crop a 480 y normalizacion con media y desviacion 0.5. Omitir este pipeline degrada las predicciones.
- Idiomas: las etiquetas de salida estan en ingles; no hay soporte multilingue ni traduccion en el propio modelo.
- Ausencia de soporte textual: no admite prompts, instrucciones ni tool calling. Cualquier uso conversacional es inviable.
- Trazabilidad limitada: no se documentan los datos de ajuste, el numero de pasos, la procedencia del dataset adversarial ni el proceso de evaluacion. La verificacion se limita al hash on-chain publicado.
- Estado del repositorio: 0 descargas y 0 likes en el momento de la consulta, y fechas de creacion y actualizacion de 2026-09-24. No hay evidencia de uso en produccion ni de mantenimiento posterior.
- Licencia Apache 2.0: permite uso comercial y modificacion, pero conviene revisar las condiciones de la subred Bittensor y de Perturb para el uso minero, que son independientes de la licencia del modelo.
- Uso responsable: el modelo clasifica imagenes y no genera contenido, por lo que el riesgo de alucinacion textual no aplica; el riesgo principal es la clasificacion erronea en contextos sensibles (moderacion, seguridad).

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/qhoenix/onyx-lark
- Perturb (subred netuid 26 de Bittensor): https://perturbai.io
- Documentacion de EfficientNetV2 en torchvision: no disponible en la informacion proporcionada
- Paper de EfficientNetV2: no disponible en la informacion proporcionada
- Repositorio de codigo o demo: no disponible

La busqueda web realizada no devolvio resultados relevantes sobre este modelo: los enlaces recuperados no guardan relacion con el artefacto y no se incluyen.
