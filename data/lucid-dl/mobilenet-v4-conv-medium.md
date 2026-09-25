# lucid-dl/mobilenet-v4-conv-medium

## Resumen

MobileNet-v4-Conv-Medium es un modelo de clasificación de imágenes (image-classification) publicado por el usuario lucid-dl en HuggingFace. No es un modelo original: se trata de un port del checkpoint `timm/mobilenetv4_conv_medium.e500_r256_in1k` al framework Lucid, convertido a safetensors nativos de Lucid y verificado con una carga estricta contra un modelo Lucid recién construido. El modelo subyacente procede del paper *MobileNetV4: Universal Models for the Mobile Ecosystem* (Qin et al., ECCV 2024, arXiv:2404.10518).

Se trata, por tanto, de una red neuronal convolucional (CNN) de la familia MobileNetV4, variante "Conv Medium", con 9,7 millones de parámetros y un peso de 37,37 MB. Está entrenada sobre ImageNet-1k y declara un 79,916 % de accuracy top-1 y un 95,188 % de accuracy top-5 (valores no verificados, aportados por el autor). Su relevancia se limita al ecosistema Lucid: es útil únicamente para quien utilice ese framework de deep learning y quiera un clasificador de imágenes ligero ya convertido, sin pasar por el proceso de conversión desde timm.

Al ser un modelo de visión y no un modelo de lenguaje, no dispone de ventana de contexto textual, soporte multilingüe ni capacidades de generación de texto. Su encaje práctico es el de un clasificador de propósito general de bajo coste computacional, apto para despliegue en entornos con recursos limitados o en pipelines de visión por computador.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | CNN (MobileNetV4, variante Conv Medium) |
| Parametros totales | 9,7 M |
| Parametros activos | no aplicable (no es un modelo MoE) |
| Longitud de contexto | no aplicable (modelo de vision, no procesa texto) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplicable (modelo de clasificacion de imagenes) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (nativos de Lucid) |

## Arquitectura y entrenamiento

La arquitectura es una red convolucional MobileNetV4 en su variante Conv Medium, diseñada por el equipo de MobileNetV4 para el ecosistema móvil. El checkpoint corresponde a la configuración `e500_r256_in1k`, lo que indica 500 épocas de entrenamiento sobre ImageNet-1k con resolución de entrada de 256 píxeles. El modelo base fue entrenado originalmente por el equipo de timm y publicado en dicho repositorio; esta ficha describe exclusivamente el port a Lucid.

La innovación de esta publicación no está en el entrenamiento (no se ha reentrenado nada) sino en la conversión: los pesos se han transformado desde el formato de timm a safetensors nativos de Lucid mediante la herramienta `tools.convert_weights`, verificando el conjunto de claves, las formas de los tensores y una carga estricta contra un modelo Lucid construido desde cero. No hay información disponible sobre el dataset de entrenamiento más allá de ImageNet-1k, ni sobre el uso de RLHF, DPO u otras técnicas de ajuste.

## Capacidades

- Clasificación de imágenes en 1.000 clases de ImageNet-1k.
- Inferencia sobre imágenes individuales o lotes (batch), devolviendo logits de forma `(B, num_classes)`.
- Preprocesado integrado: las transformaciones viajan con los pesos (`weights.transforms()`), lo que evita desajustes entre entrenamiento e inferencia.
- Selección de pesos por etiqueta (`E500_R256_IN1K`), mediante enum o cadena.
- No dispone de tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No tiene capacidades multilingües (no es un modelo de lenguaje).
- No dispone de modo "thinking", visión-lenguaje, audio ni ninguna capacidad multimodal más allá de la clasificación de imagen.

## Casos de uso

- Clasificación de imágenes en producción: el modelo devuelve logits sobre las 1.000 clases de ImageNet-1k con 9,7 M de parámetros, lo que permite desplegarlo en servicios de inferencia con coste de cómputo y memoria muy bajo.
- Etiquetado automático de datasets de visión: puede preetiquetar grandes volúmenes de imágenes con las clases de ImageNet-1k antes de una revisión humana, reduciendo el trabajo manual de anotación.
- Moderación de contenido preliminar: como clasificador genérico ligero, sirve para filtrar o priorizar imágenes en pipelines de revisión, siempre que las categorías de interés estén alineadas con las clases de ImageNet.
- Visión en dispositivos de borde: con 37,37 MB de pesos, es apto para entornos con memoria limitada (dispositivos móviles, SBC, CPUs modestas), que es precisamente el nicho para el que se diseñó la familia MobileNetV4.
- Extracción de características para transfer learning: las representaciones convolucionales pueden servir como backbone congelado al que añadir una cabeza de clasificación específica para un dominio concreto.
- Clasificación en tiempo real sobre vídeo: el bajo número de parámetros permite procesar fotogramas de forma continua en GPUs de gama media o incluso en CPU, según el régimen de captura.
- Control de calidad industrial asistido por imagen: clasificación rápida de piezas o productos por categoría visual en líneas de producción, cuando las clases relevantes se puedan mapear a las de ImageNet o a un ajuste posterior.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model-index de la model card (no verificados):

| Dataset | Metrica | Valor | Verificado |
|---|---|---|---|
| ImageNet-1k | acc@1 | 79,916 % | No |
| ImageNet-1k | acc@5 | 95,188 % | No |

No se han publicado otros resultados de benchmarks en la informacion disponible. La comparacion con modelos similares no puede completarse con datos numericos porque no se han proporcionado metricas de las alternativas.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB. Con 9,7 M de parámetros y pesos en fp32 de 37,37 MB, el modelo cabe holgadamente en cualquier GPU con al menos 1-2 GB de memoria, y también en CPU.
- GPU recomendadas: cualquier GPU moderna es suficiente y en la mayoría de casos sobredimensionada. Una RTX 4090 o una A100 ejecutarían el modelo con una utilización mínima; resultan útiles solo por el throughput agregado en lotes grandes.
- Cabe en GPU de consumo: sí, en cualquier GPU de consumo actual e incluso en iGPUs y aceleradores de borde. No requiere GPU dedicada.
- Opciones de despliegue: al ser un port específico del framework Lucid, el uso nativo requiere la librería Lucid (`lucid.models`). Fuera de ese ecosistema, la vía habitual es exportar a ONNX o TorchScript y servir con ONNX Runtime, TensorRT o equivalentes. Las herramientas orientadas a modelos de lenguaje (vLLM, llama.cpp, Ollama, TGI) no son aplicables a este modelo.
- Latencia y throughput estimados: no disponible. No se han publicado mediciones en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | ImageNet-1k acc@1 | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| lucid-dl/mobilenet-v4-conv-medium | 9,7 M | no aplicable | 79,916 % (no verificado) | apache-2.0 | HuggingFace (Lucid) |
| timm/mobilenetv4_conv_medium.e500_r256_in1k | 9,7 M | no aplicable | no disponible (mismo checkpoint de origen) | apache-2.0 | timm |
| Otras variantes MobileNetV4 | no disponible | no aplicable | no disponible | no disponible | timm / paper |
| Otras CNN ligeras (por ejemplo, MobileNetV3, EfficientNet-B0) | no disponible | no aplicable | no disponible | no disponible | timm |

El port de Lucid comparte pesos con el checkpoint original de timm, por lo que su accuracy debería coincidir con la del modelo de origen, aunque no se aporta la cifra exacta de este último en la información disponible. No se dispone de datos numéricos de las alternativas para establecer una comparación cuantitativa.

## Limitaciones y advertencias

- Es un port, no un modelo entrenado desde cero: su comportamiento depende íntegramente del checkpoint original `timm/mobilenetv4_conv_medium.e500_r256_in1k`.
- Las métricas declaradas (acc@1 y acc@5) están marcadas como no verificadas en la propia model-index.
- Modelo limitado a las 1.000 clases de ImageNet-1k: no reconoce categorías fuera de ese conjunto sin un ajuste fino.
- No procesa texto ni lenguaje, por lo que no aplica ninguna consideración multilingüe ni de contexto.
- Riesgo de alucinación no aplicable en el sentido de los modelos generativos, pero sí existe riesgo de clasificación errónea o de confianza mal calibrada en clases visualmente próximas.
- No hay información sobre sesgos del dataset de entrenamiento ni sobre su composición demográfica o cultural.
- Licencia apache-2.0, heredada de los pesos originales, lo que permite uso comercial según los términos de dicha licencia.
- Caveat de producción: el modelo está empaquetado para el framework Lucid y requiere esa librería o una exportación previa; no es directamente cargable en otros frameworks sin conversión.
- El repositorio tiene 0 descargas y 0 "likes", y un tamaño de 0,0 GB reportado, lo que sugiere un uso nulo o muy reciente y una trazabilidad limitada por parte de la comunidad.
- No se especifican tipos de cuantización soportados, lo que impide planificar reducciones de precisión sin pruebas propias.

## Enlaces

- HuggingFace: https://huggingface.co/lucid-dl/mobilenet-v4-conv-medium
- Paper: MobileNetV4: Universal Models for the Mobile Ecosystem (arXiv:2404.10518) — https://arxiv.org/abs/2404.10518
- Framework Lucid: https://github.com/ChanLumerico/lucid
- Checkpoint de origen en timm: `timm/mobilenetv4_conv_medium.e500_r256_in1k`
