# Adamix303/beans-deit-tiny

## Resumen

beans-deit-tiny es un modelo de clasificación de imágenes resultado del ajuste fino (*fine-tuning*) del transformador de visión facebook/deit-tiny-patch16-224 sobre el conjunto de datos AI-Lab-Makerere/beans, compuesto por fotografías de hojas de judía afectadas por distintas enfermedades. Lo publica el usuario Adamix303 en HuggingFace bajo licencia Apache 2.0 y fue generado automáticamente con la clase Trainer de la librería Transformers, por lo que la propia model card advierte de que no ha sido revisada manualmente.

Se trata de un modelo muy pequeno: 5.524.995 parámetros en formato safetensors (en torno a 22 MB en fp32), lo que lo sitúa en la categoría de modelos de visión ligeros aptos para inferencia en CPU y en dispositivos de borde. La arquitectura es un Vision Transformer (ViT) con parches de 16x16 y resolución de entrada de 224x224 píxeles, heredada íntegramente del modelo base de Meta AI (Facebook AI).

Su relevancia es acotada y muy específica: no es un modelo de propósito general ni un modelo de lenguaje, sino un clasificador de tres clases orientado a un dominio concreto (fitopatología de la judía). Resulta útil como referencia de ajuste fino eficiente, como componente en aplicaciones agrícolas de campo y como base para experimentos de destilación o cuantización en edge. El repositorio no registra descargas ni interacciones en el momento de redactar esta ficha.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Vision Transformer (ViT) tipo DeiT-tiny, parches de 16x16, imagen de entrada de 224x224 píxeles |
| Parámetros totales | 5.524.995 |
| Parámetros activos | no aplica (no es un modelo de mezcla de expertos) |
| Longitud de contexto | no aplica (modelo de clasificación de imágenes con entrada fija de 224x224 píxeles) |
| Tipos de cuantización | no disponible en la información proporcionada; el modelo base dispone de una conversión INT8 publicada por Arm para ExecuTorch/XNNPACK, no confirmada para este ajuste fino |
| Idiomas soportados | no aplica (modelo de visión; no procesa texto). El repositorio no declara idiomas |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (librería transformers) |

## Arquitectura y entrenamiento

El modelo es un DeiT-tiny, es decir, un Vision Transformer con normalización previa a cada bloque (*pre-norm*), atención multi-cabeza y una torre MLP por bloque. Según la configuración publicada del modelo base facebook/deit-tiny-patch16-224, la red consta de 12 capas, dimensión oculta de 192, 3 cabezas de atención y dimensión de MLP de 768; la imagen de 224x224 se divide en 196 parches de 16x16 más el token de clase. DeiT ("Data-efficient Image Transformer") se distingue por incorporar un token de destilación y entrenarse con destilación desde un profesor convolucional (RegNetY-16GF en el caso de la variante tiny) para reducir de forma drástica los datos y el cómputo necesarios frente al ViT original.

El ajuste fino se realizó sobre el conjunto AI-Lab-Makerere/beans, un dataset de imágenes de hojas de judía con tres clases (moteado angular, roya y hoja sana). Los hiperparámetros documentados son: tasa de aprendizaje 5e-05, programador lineal, optimizador AdamW (variante *torch_fused*) con betas (0,9; 0,999) y epsilon 1e-08, tamaño de lote de entrenamiento 32, tamaño de lote de evaluación 64, semilla 42, 5 épocas y precisión mixta nativa (AMP). No se documentan técnicas adicionales como RLHF, DPO o aumento de datos, ni la composición exacta de los *splits* de entrenamiento y evaluación. Las versiones de las herramientas empleadas fueron Transformers 5.19.0, PyTorch 2.11.0+cu130, Datasets 5.1.0 y Tokenizers 0.23.2.

## Capacidades

- Clasificación de imágenes en tres clases del dominio de hojas de judía: moteado angular (*angular leaf spot*), roya (*bean rust*) y hoja sana.
- Salida de probabilidades por clase mediante el pipeline `image-classification` de Transformers.
- Inferencia de baja latencia y bajo consumo de memoria gracias a sus 5,5 millones de parámetros.
- Compatible con HuggingFace Inference Endpoints (el repositorio lleva la etiqueta `endpoints_compatible`).
- Candidato a despliegue en CPU y en dispositivos de borde; el modelo base cuenta con conversiones INT8 para Arm/ExecuTorch, aunque no se confirma que existan para este ajuste fino.
- No soporta *tool calling*, *function calling*, razonamiento multi-paso, agentes, generación de texto, código, matemáticas, visión general más allá de clasificación, audio ni modo de razonamiento. No dispone de capacidades multilingües porque no procesa lenguaje.

## Casos de uso

- Diagnóstico de enfermedades foliares en campo: una aplicación móvil captura una fotografía de la hoja y el modelo devuelve la clase predominante, sirviendo de apoyo al agricultor para decidir el tratamiento. Es adecuado por su tamaño (22 MB en fp32) y por poder ejecutarse sin conexión en el propio teléfono.
- Triaje automatizado de imágenes de dron o satélite: procesar lotes masivos de recortes de parcela para localizar focos de roya o moteado angular. El bajo coste por inferencia permite clasificar miles de recortes en una GPU modesta.
- Etiquetado asistido de nuevos datasets agronómicos: usar el modelo como preanotador y revisar manualmente solo los casos de baja confianza, reduciendo el esfuerzo de anotación humana.
- Monitorización continua en invernadero: integrar el clasificador en un sistema de cámaras fijas que analice periódicamente las hojas y emita alertas cuando la proporción de imágenes enfermas supere un umbral.
- Destilación o *pruning* de modelos aún más ligeros: al ser un DeiT-tiny ya ajustado, sirve como punto de partida para obtener variantes cuantizadas a INT8 o podadas para microcontroladores.
- Fenotipado a escala en investigación agronómica: cuantificar la severidad de una enfermedad en ensayos de variedades resistentes clasificando grandes volúmenes de fotografías de forma homogénea.
- Componente de demostración en pipelines de CI/CD de visión: validar extremo a extremo el flujo de entrenamiento, exportación a safetensors y despliegue en un endpoint de HuggingFace con un modelo de tamaño reducido.

## Benchmarks y rendimiento

La model card declara las siguientes métricas sobre el conjunto de evaluación (resultados aportados por el autor del modelo). El campo `model-index` del repositorio contiene un array de resultados vacío, por lo que estas cifras proceden únicamente del texto de la model card.

| Métrica | Valor (época 5, conjunto de evaluación) |
|---|---|
| Loss | 0,0619 |
| Accuracy | 0,9850 |
| F1 macro | 0,9850 |

Evolución durante el entrenamiento:

| Época | Paso | Pérdida de entrenamiento | Pérdida de validación | Accuracy | F1 macro |
|---|---|---|---|---|---|
| 1.0 | 33 | 0,3564 | 0,2455 | 0,9323 | 0,9328 |
| 2.0 | 66 | 0,2135 | 0,1431 | 0,9398 | 0,9400 |
| 3.0 | 99 | 0,1206 | 0,1306 | 0,9474 | 0,9475 |
| 4.0 | 132 | 0,1144 | 0,0704 | 0,9774 | 0,9776 |
| 5.0 | 165 | 0,1047 | 0,0619 | 0,9850 | 0,9850 |

No se han publicado resultados frente a MMLU, HumanEval, GSM8K ni otros benchmarks generales, ya que no son aplicables a un clasificador de imágenes. Tampoco se ofrecen comparaciones con otros modelos sobre el mismo conjunto de evaluación.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 22 MB para los pesos en fp32, unos 11 MB en fp16 y alrededor de 5,5 MB en INT8, más el consumo de activaciones, que depende del tamaño de lote. Estimación orientativa a partir del número de parámetros; no medida.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM es suficiente. Se puede emplear desde una NVIDIA T4 o GTX 1650 hasta una RTX 4090, A100 o H100, aunque en estas últimas el modelo estará infrautilizado.
- Cabe sin problema en GPU de consumo: RTX 3060, RTX 4060, RTX 4090, así como en iGPU y en CPU convencional.
- Despliegue en CPU y edge: es viable en x86, en Apple Silicon y en placas como Raspberry Pi 5, especialmente si se exporta a INT8 con ExecuTorch/XNNPACK siguiendo el ejemplo publicado para el modelo base.
- Opciones de despliegue: pipeline de `transformers` en Python, HuggingFace Inference Endpoints (etiqueta `endpoints_compatible`), TorchScript/ONNX, ExecuTorch y, en general, cualquier runtime que acepte safetensors. vLLM, llama.cpp, Ollama y TGI están orientados a modelos de lenguaje y no aplican aquí.
- Latencia y throughput: no disponibles. Con 5,5 millones de parámetros se espera un coste por imagen de pocos milisegundos en GPU moderna y de decenas de milisegundos en CPU, pero no se han publicado mediciones para este modelo concreto.

## Comparativa con modelos similares

| Modelo | Parámetros | Arquitectura | Tarea y contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Adamix303/beans-deit-tiny | 5,52 M | DeiT-tiny (ViT patch16, 224x224) | Clasificación de 3 clases de hojas de judía; accuracy 0,9850 en el conjunto de evaluación declarado | apache-2.0 | HuggingFace; 0 descargas registradas |
| facebook/deit-tiny-patch16-224 | 5,52 M | DeiT-tiny con destilación | Clasificación ImageNet-1k; modelo base sin ajustar a dominio agronómico | apache-2.0 | HuggingFace; ampliamente descargado |
| facebook/deit-base-patch16-224 | 86 M | DeiT-base con destilación | Clasificación ImageNet-1k; mayor precisión general a cambio de ~16 veces más parámetros | apache-2.0 | HuggingFace |
| google/vit-base-patch16-224 | 86 M | ViT-base | Clasificación ImageNet-1k; sin destilación, requiere más datos para igualar a DeiT | apache-2.0 | HuggingFace |

No se dispone de resultados de estos modelos alternativos sobre el conjunto de datos beans en la información proporcionada, por lo que no es posible establecer una comparación cuantitativa de rendimiento en el mismo dominio.

## Limitaciones y advertencias

- El modelo se limita a tres clases del dominio de hojas de judía. Las entradas fuera de ese dominio producirán una de las tres etiquetas con posible alta confianza, sin mecanismo de rechazo ni clase "desconocido".
- Riesgo elevado de alucinación en el sentido clasificatorio: cualquier imagen se asignará a alguna de las clases definidas, incluidas imágenes no relacionadas con la agricultura.
- No se documentan sesgos concretos, pero el ajuste se apoya en un dataset agrícola pequeño y probablemente sesgado hacia condiciones de captura, variedades e iluminación específicas, lo que puede degradar el rendimiento en imágenes de campo reales.
- No hay información sobre la composición exacta del dataset, los *splits* utilizados ni la procedencia de las imágenes, lo que dificulta evaluar la generalización y el riesgo de fuga de datos entre entrenamiento y evaluación.
- La model card advierte explícitamente de que fue generada automáticamente y no ha sido revisada; varios apartados ("Model description", "Intended uses & limitations", "Training and evaluation data") figuran como "More information needed".
- Licencia Apache 2.0: permite uso comercial y modificación, con obligación de conservar los avisos de licencia y de copyright. Al derivar del modelo base de Meta AI, conviene revisar también las condiciones del repositorio original.
- Uso en producción: al no haber validación independiente, métricas externas ni pruebas con datos fuera de distribución, no debería emplearse como único criterio para decisiones agronómicas.
- El repositorio tiene 0 descargas y 0 interacciones, sin señales de uso, mantenimiento o soporte por parte del autor.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Adamix303/beans-deit-tiny
- Modelo base facebook/deit-tiny-patch16-224: https://huggingface.co/facebook/deit-tiny-patch16-224
- Dataset AI-Lab-Makerere/beans: https://huggingface.co/datasets/AI-Lab-Makerere/beans
- Artículo de DeiT (Training data-efficient image transformers & distillation through attention): https://arxiv.org/abs/2012.12877
- Conversión INT8 del modelo base para Arm/ExecuTorch (Raspberry Pi 5): https://developer.arm.com/ai/models/hugging-face/Arm/deit-tiny-int8-xnnpack-executorch/deit-tiny-int8-pte?targetName=Raspberry+Pi+5
- Visión general de DeiT en Medium: https://medium.com/@zakhtar2020/deit-data-efficient-image-transformer-overview-acd1cb3b1dcf
- Listado de modelos con la etiqueta deit-tiny en HuggingFace: https://huggingface.co/models?other=deit-tiny
