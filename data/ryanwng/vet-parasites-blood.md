# ryanWNG/vet-parasites-blood

## Resumen

`ryanWNG/vet-parasites-blood` es un clasificador de imágenes de microscopía de frotis sanguíneos veterinarios, no un modelo de lenguaje. Lo publica el usuario ryanWNG como parte del proyecto Howl Vision para el hackathon Gemma 4 Good, y resuelve un problema concreto: asignar una imagen de frotis a una de ocho clases (seis parásitos y dos controles: Babesia, Leishmania, Leukocyte, Plasmodium, RBCs, Toxoplasma, Trichomonad y Trypanosome). Su relevancia está en el enfoque One Health: cuatro de las clases (Leishmania, Plasmodium, Toxoplasma y Trypanosome) son zoonóticas, de modo que un triaje automatizado en muestras animales tiene lectura también en salud pública.

Técnicamente es una red convolucional EfficientNetV2-S (`timm/tf_efficientnetv2_s.in21k_ft_in1k`) reentrenada con 8 clases de salida, entrada de 384x384 píxeles RGB y normalización ImageNet. El autor reporta una accuracy del 99,87 % y un F1-macro de 0,997 sobre un conjunto de test reservado de 3032 imágenes. El repositorio pesa 0,2 GB y se distribuye bajo licencia Apache 2.0, lo que permite uso comercial sin restricciones de atribución copyleft.

Es un modelo pequeño y ligero, apto para inferencia en CPU o en GPU de consumo, pero con una advertencia explícita del autor: la validación se hizo sobre microscopía estandarizada y la generalización a tinciones o aumentos variables requiere una validación independiente. No hay información sobre el dataset de entrenamiento, la composición de clases, el idioma ni la procedencia geográfica de las muestras.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | EfficientNetV2-S (CNN con bloques MBConv y Fused-MBConv), `timm/tf_efficientnetv2_s.in21k_ft_in1k` |
| Parámetros totales | no disponible en la model card (EfficientNetV2-S ronda los 21,5 M según la referencia de timm) |
| Parámetros activos | no aplica (modelo denso, no es MoE) |
| Longitud de contexto | no aplica; resolución de entrada 384x384 RGB |
| Tipos de cuantización | no disponible (el autor solo distribuye checkpoint PyTorch en precisión original) |
| Idiomas soportados | no disponible (clasificación de imágenes, no procesa texto) |
| Licencia | Apache 2.0 |
| Formato de pesos | checkpoint PyTorch `.pt` con `state_dict` (clave `model_state_dict`); no se ofrece safetensors ni GGUF |
| Pipeline | `image-classification` |
| Número de clases | 8 (Babesia, Leishmania, Leukocyte, Plasmodium, RBCs, Toxoplasma, Trichomonad, Trypanosome) |
| Preprocesado | 384x384 RGB, normalización ImageNet |
| Métricas declaradas | Accuracy 99,87 %; F1-macro 0,997 (test reservado, n=3032) |
| Tamaño del repositorio | 0,2 GB |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La arquitectura es EfficientNetV2-S, la variante pequeña de la familia EfficientNetV2, que combina bloques Fused-MBConv en las etapas iniciales y MBConv en las profundas, con escalado compuesto de profundidad, anchura y resolución. El punto de partida es el checkpoint `tf_efficientnetv2_s.in21k_ft_in1k` de timm, preentrenado en ImageNet-21k y afinado en ImageNet-1k; el autor sustituye la cabeza de clasificación por una de 8 salidas. La entrada se fija en 384x384 píxeles con normalización ImageNet, lo que es coherente con el régimen de resolución al que se afinó el backbone.

No se detalla en la model card el volumen de datos de entrenamiento, la composición del dataset, el balance entre clases, las técnicas de aumento de datos, la función de pérdida, el número de épocas ni si hubo una fase de ajuste fino selectivo o completo del backbone. Tampoco se documenta el origen de las imágenes (país, laboratorio, microscopio, protocolo de tinción). Sí se especifica que las métricas provienen de un conjunto de test reservado de 3032 imágenes, lo que da una idea del orden de magnitud del split de evaluación, pero no del de entrenamiento. No consta uso de RLHF, DPO ni técnicas de alineación, algo esperable en un clasificador de imágenes supervisado.

## Capacidades

- Clasificación de imágenes de frotis sanguíneo en 8 clases cerradas, con salida de probabilidad por clase vía softmax.
- Discriminación entre seis géneros/entidades parásitas y dos clases control (leucocitos y eritrocitos), lo que permite usar los controles como señal de calidad de la preparación.
- Identificación de patógenos zoonóticos relevantes en One Health: Leishmania, Plasmodium, Toxoplasma y Trypanosome.
- Inferencia sobre imágenes individuales de 384x384; soporta procesamiento por lotes con PyTorch o timm.
- Integración sencilla en pipelines Python: el snippet del autor carga el `state_dict` sobre un modelo timm sin pesos preentrenados.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, texto, audio ni vídeo. Es exclusivamente un clasificador visual.
- No dispone de modo "thinking" ni de generación de explicaciones: no produce justificación textual del diagnóstico.
- Capacidades multilingües: no aplica; las etiquetas de clase están en inglés.

## Casos de uso

- Triaje previo en laboratorio veterinario: el modelo clasifica cada frotis en milisegundos y permite priorizar las muestras con Babesia o Trypanosome para revisión del patólogo, reduciendo el tiempo hasta el diagnóstico en casos agudos.
- Cribado de Leishmania en campañas de salud canina: al ser una clase zoonótica, un clasificador ligero desplegado en el portátil del veterinario de campo permite un primer filtro antes de confirmación por PCR.
- Control de calidad de la preparación: las clases Leukocyte y RBCs actúan como referencia; una imagen que se clasifica con alta confianza como RBCs pero debería contener parásitos puede marcar un fallo de tinción o de campo seleccionado.
- Docencia y formación de técnicos de laboratorio: el modelo sirve como segunda opinión sobre un atlas de imágenes etiquetadas, señalando discrepancias entre la lectura humana y la del clasificador.
- Anotación asistida de datasets: preetiquetar grandes colecciones de imágenes de microscopía antes de la revisión manual, acelerando la construcción de corpus para investigación en parasitología.
- Vigilancia epidemiológica One Health: procesar lotes retrospectivos de imágenes de fauna silvestre o animales de granja para estimar prevalencia de hemoparásitos por región y temporada.
- Despliegue en entornos con hardware limitado: con un checkpoint de ~85 MB en fp32 cabe en una Raspberry Pi o en un portátil sin GPU, lo que habilita uso en laboratorios de campo con conectividad intermitente.
- Preprocesado en pipelines de telemedicina veterinaria: enrutar automáticamente las imágenes recibidas hacia el especialista adecuado según la clase detectada.

## Benchmarks y rendimiento

| Métrica | Valor | Conjunto |
|---|---|---|
| Accuracy | 99,87 % | Test reservado, n=3032 |
| F1-macro | 0,997 | Test reservado, n=3032 |

No se han publicado resultados de benchmarks comparativos con otros modelos en la información disponible. La model card no desglosa precisión, recall ni F1 por clase, no aporta matriz de confusión y no documenta la distribución de clases del conjunto de test, por lo que las métricas agregadas no permiten evaluar el comportamiento en las clases minoritarias. Tampoco se reportan resultados en conjuntos externos con tinciones o aumentos distintos.

## Requisitos de hardware

- VRAM estimada para inferencia: por debajo de 1 GB con lote de tamaño 1 a 384x384; del orden de 2-4 GB con lotes de 32 (estimación a partir del tamaño del modelo, no medida por el autor).
- Tamaño del checkpoint: el repositorio ocupa 0,2 GB; el `state_dict` en fp32 de un EfficientNetV2-S ronda los 85 MB, por lo que el repositorio incluye artefactos adicionales no detallados.
- GPU recomendadas: cualquier GPU con 4 GB o más es suficiente. Funciona en RTX 3060, RTX 4090, A100 o H100 sin aprovechar su capacidad; no requiere GPU de datacenter.
- Cabe en GPU de consumo: sí, en cualquier modelo con 2 GB o más de VRAM (GTX 1650, RTX 3050 en adelante).
- Inferencia en CPU: viable. Un EfficientNetV2-S a 384x384 se ejecuta en decenas de milisegundos por imagen en CPUs modernas multinúcleo; no se han publicado medidas concretas.
- Opciones de despliegue: PyTorch + timm (vía oficial descrita por el autor), exportación a TorchScript u ONNX Runtime para producción, TensorRT para aceleración en NVIDIA. No aplican vLLM, llama.cpp, Ollama ni TGI, que son servidores de modelos de lenguaje.
- Latencia y throughput: no disponible. La model card no incluye mediciones de tiempo de inferencia ni de imágenes por segundo.

## Comparativa con modelos similares

| Modelo | Tarea | Arquitectura | Parámetros | Contexto / entrada | Rendimiento publicado | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|---|
| ryanWNG/vet-parasites-blood | Clasificación de parásitos en frotis (8 clases) | EfficientNetV2-S | ≈21,5 M (referencia externa) | 384x384 RGB | Accuracy 99,87 %, F1-macro 0,997 (n=3032) | Apache 2.0 | HuggingFace, 0 descargas |
| EfficientNetV2-S (ImageNet-1k, timm) | Clasificación genérica de imágenes (1000 clases) | EfficientNetV2-S | ≈21,5 M (referencia externa) | 384x384 RGB | no disponible en la información proporcionada | Apache 2.0 (timm) | Público en timm |
| ConvNeXt-Tiny (ImageNet-1k) | Clasificación genérica de imágenes | CNN modernizada tipo transformer | ≈28 M (referencia externa) | 224x224 | no disponible en la información proporcionada | Apache 2.0 | Público en timm |
| ResNet-50 (ImageNet-1k) | Clasificación genérica de imágenes | CNN residual | ≈25,6 M (referencia externa) | 224x224 | no disponible en la información proporcionada | Apache 2.0 (variantes timm) | Público en timm |

No se han publicado comparaciones directas contra otros clasificadores de parasitología en la información disponible. Los recuentos de parámetros de las alternativas son referencias externas a la model card y no están verificados en la documentación proporcionada; las cifras de rendimiento de esas alternativas no se incluyen porque no forman parte de la información facilitada.

## Limitaciones y advertencias

- Generalización limitada: el propio autor advierte que la validación se hizo sobre microscopía estandarizada y que el rendimiento con tinciones, aumentos o protocolos de captura distintos requiere validación separada.
- Clases cerradas: el modelo solo puede predecir entre las 8 etiquetas entrenadas. Cualquier parásito fuera de ese conjunto se forzará a una de las clases existentes, generando un falso positivo silencioso.
- Métricas agregadas sin desglose: no hay precisión ni recall por clase, ni matriz de confusión, por lo que se desconoce el comportamiento en clases potencialmente minoritarias como Trichomonad o Babesia.
- Riesgo de sobreajuste al dataset: un 99,87 % de accuracy en test es un resultado muy alto; sin información sobre la separación entre train y test (posibles imágenes duplicadas o del mismo portaobjetos en ambos splits), no puede descartarse fuga de datos.
- Sesgo desconocido: no se documenta la procedencia geográfica, la especie animal, el tipo de microscopio ni la distribución de clases del dataset, lo que impide evaluar sesgos poblacionales.
- No es un dispositivo médico: no consta validación regulatoria (CE, FDA) ni estudio clínico. No debe usarse como diagnóstico definitivo en animales ni, mucho menos, en humanos, pese a la relevancia zoonótica de varias clases.
- Idiomas: no aplica, pero las etiquetas de salida están en inglés y no hay localización al castellano.
- Ausencia de calibración documentada: no se reportan métricas de calibración de probabilidades, algo crítico si se quiere usar el umbral de confianza para derivar a revisión humana.
- Licencia: Apache 2.0 permite uso comercial y modificación sin restricciones relevantes, pero la responsabilidad legal del uso clínico recae íntegramente en el desplegador.
- Repositorio sin tracción: 0 descargas y 0 likes en el momento de la consulta, sin Issues ni discusión pública que permita contrastar el comportamiento real.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ryanWNG/vet-parasites-blood
- Proyecto Howl Vision (organización en GitHub, enlace citado en la model card): https://github.com/ikchain
- Identificador del backbone en timm: `tf_efficientnetv2_s.in21k_ft_in1k`
- No se han proporcionado otros enlaces (paper, blog, demo o dataset) en la información disponible.
