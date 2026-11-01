# hafeezaismail/fruit-freshness-convnext

## Resumen

Fruit Freshness Classifier (ConvNeXt-Tiny) es un modelo de clasificación de imágenes especializado en detectar el tipo de fruta y su estado de frescura (fresca o podrida) a partir de una fotografía. Lo desarrolla el usuario de HuggingFace hafeezaismail mediante ajuste fino (transfer learning) del modelo base facebook/convnext-tiny-224, un transformer convolucional de 27,8 millones de parámetros. El modelo resuelve un problema de clasificación cerrada de 16 clases que combina la especie de fruta con su estado sanitario aparente.

El modelo es relevante en el contexto de visión artificial aplicada a la cadena agroalimentaria: control de calidad en líneas de envasado, inspección en almacenes y prototipos de clasificación automática con hardware modesto. Al derivar de ConvNeXt-Tiny, su huella de memoria y su coste de inferencia son reducidos, lo que permite desplegarlo en GPU de consumo e incluso en CPU para lotes pequeños.

La información publicada es limitada: no hay datos de composición del dataset más allá del número de imágenes, ni detalles sobre el proceso de entrenamiento (hiperparámetros, aumentos de datos, número de épocas). Los resultados declarados por el autor en el conjunto de test reservado son de 0,9917 de accuracy y 0,9916 de macro F1, si bien no se especifica el tamaño exacto de dicho conjunto ni el protocolo de partición.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ConvNeXt-Tiny (transformer convolucional, CNN modernizada con bloques tipo transformer) |
| Parametros totales | 27.832.432 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión, entrada de imagen 224x224 píxeles) |
| Tipos de cuantizacion | no disponible (pesos en safetensors en precisión original; admite cuantización estándar de PyTorch/ONNX no documentada por el autor) |
| Idiomas soportados | no aplica (clasificación de imágenes; etiquetas en inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un ConvNeXt-Tiny, una red convolucional pura que adopta decisiones de diseño propias de los transformers (convoluciones depthwise de 7x7, normalización LayerNorm, activación GELU y estructura de etapas con proporciones 3:3:9:3). El checkpoint base es facebook/convnext-tiny-224, preentrenado en ImageNet-1k con resolución de entrada de 224x224. Sobre ese checkpoint se ha aplicado ajuste fino supervisado para una cabeza de clasificación de 16 clases.

El conjunto de entrenamiento es la configuración raw del dataset Project-AgML/fresh_rotten_fruit_classification, con 3.200 imágenes según la model card. El autor indica una partición con 15 % de datos reservados para test, pero no detalla el número de épocas, la tasa de aprendizaje, el optimizador, las técnicas de aumento de datos ni si se congelaron capas del backbone. Tampoco se documenta ninguna innovación técnica adicional (decodificación especulativa, atención lineal u otras), algo esperable en un modelo de clasificación de imágenes.

## Capacidades

- Clasificación de imágenes en 16 clases cerradas: ocho especies de fruta (manzana, plátano, uva, guayaba, azufaifo, naranja, granada y fresa) en estado fresco y en estado podrido.
- Predicción conjunta de especie y estado de frescura en una sola pasada, sin necesidad de dos modelos en cascada.
- Salida de probabilidades por clase mediante la pipeline `image-classification` de transformers, lo que permite umbrales de confianza personalizados.
- Inferencia rápida en CPU y GPU gracias al tamaño reducido del modelo (27,8 M de parámetros).
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni generación de texto.
- No tiene capacidades multilingües ni de otro tipo: la salida son etiquetas de clase en inglés.
- No dispone de modo thinking, visión adicional, audio ni otras modalidades.

## Casos de uso

- Control de calidad en líneas de envasado de fruta: el modelo se integra en un pipeline de captura de imágenes con cámara industrial y clasifica cada pieza como fresca o podrida, permitiendo descartar automáticamente los ejemplares defectuosos antes del empaquetado.
- Inspección en almacenes y cámaras frigoríficas: con fotografías tomadas por operarios o por robots móviles, el modelo sirve como triaje rápido para detectar lotes con signos de deterioro y priorizar su salida.
- Prototipado de aplicaciones móviles de consumo: al ser un modelo de 27,8 M de parámetros, puede ejecutarse en un servidor modesto o convertirse a ONNX para inferencia en dispositivos, permitiendo demos de escaneo de fruta desde el móvil.
- Investigación agronómica y docencia: sirve como baseline reproducible de transfer learning sobre ConvNeXt-Tiny para experimentos de clasificación fine-grained con datasets pequeños, comparando técnicas de aumento de datos o congelación de capas.
- Automatización de inventarios en fruterías y mercados: combinado con un sistema de conteo, el modelo puede etiquetar imágenes de estanterías para estimar la proporción de producto en buen estado y detectar mermas.
- Filtrado previo en datasets de mayor escala: el clasificador puede usarse como etapa de preetiquetado para anotar grandes volúmenes de imágenes de fruta y reducir el coste de etiquetado manual antes de entrenar modelos mayores.

## Benchmarks y rendimiento

| Metrica | Valor | Conjunto |
|---|---|---|
| Accuracy | 0,9917 | Test reservado (15 % de los datos, tamaño no especificado) |
| Macro F1 | 0,9916 | Test reservado (15 % de los datos, tamaño no especificado) |

No se han publicado resultados comparativos con otros modelos en la información disponible. Las cifras anteriores proceden únicamente de la model card del autor y no han sido verificadas de forma independiente.

## Requisitos de hardware

- VRAM estimada para inferencia en FP32: aproximadamente 110 MB para los pesos (27,8 M de parámetros), más el espacio de activaciones, que para un lote pequeño a 224x224 se mantiene por debajo de 1 GB en total.
- VRAM estimada en FP16: alrededor de 55 MB para los pesos, con un consumo total de inferencia inferior a 500 MB para lotes pequeños.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM es suficiente; funcionan bien RTX 3060, RTX 4090, A100 o H100, aunque estas dos últimas están sobredimensionadas para este modelo.
- Cabe holgadamente en GPU de consumo, incluidas GTX 1650, RTX 3050 y modelos integrados con soporte CUDA; también es viable en CPU para lotes pequeños.
- Opciones de despliegue: pipeline de transformers, TorchServe, ONNX Runtime, TensorRT y exportación a formatos móviles; no se documenta soporte específico para vLLM, llama.cpp, Ollama o TGI, que no aplican a modelos de clasificación de imágenes.
- Latencia y throughput: no disponibles en la información proporcionada; por el tamaño del modelo se espera un throughput alto en GPU moderna, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Entrada | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| hafeezaismail/fruit-freshness-convnext | 27,8 M | 224x224 | Clasificación fruta fresca/podrida (16 clases) | Apache 2.0 | HuggingFace |
| facebook/convnext-tiny-224 | 28,6 M | 224x224 | Clasificación ImageNet-1k (1.000 clases) | Apache 2.0 | HuggingFace |
| google/vit-base-patch16-224 | 86 M | 224x224 | Clasificación ImageNet-1k (1.000 clases) | Apache 2.0 | HuggingFace |
| microsoft/resnet-50 | 25,6 M | 224x224 | Clasificación ImageNet-1k (1.000 clases) | Apache 2.0 | HuggingFace |

Los tres modelos de referencia son clasificadores genéricos de ImageNet y no ofrecen la tarea específica de frescura de fruta; la comparación relevante es de arquitectura, tamaño y licencia, no de rendimiento en la tarea concreta. No se dispone de otros clasificadores públicos de frescura de fruta con los que comparar directamente en la información proporcionada.

## Limitaciones y advertencias

- Entrenado con un dataset pequeño (3.200 imágenes) y fondos limpios; el autor advierte que puede ser poco fiable con fondos desordenados, iluminación inusual u otras frutas distintas de las 16 clases.
- Solo reconoce las ocho especies listadas; cualquier fruta fuera de ese conjunto se clasificará erróneamente dentro de una de las clases conocidas.
- No es una herramienta de seguridad alimentaria: el autor lo indica explícitamente. La clasificación de "podrido" es visual y aparente, no un análisis microbiológico.
- Riesgo de sobreajuste al dataset de origen: las métricas de 0,9917 de accuracy proceden de un test del mismo dataset y no garantizan generalización a imágenes reales de producción.
- No se documentan sesgos demográficos ni geográficos, pero al ser un modelo de visión entrenado con un dataset concreto puede heredar sesgos de composición (por ejemplo, variedades de fruta, iluminación o cámaras específicas).
- Riesgo de alucinación en el sentido de falsos positivos/negativos con alta confianza: al no haber calibración publicada, conviene validar los umbrales de probabilidad en el dominio de despliegue.
- Licencia Apache 2.0: permite uso comercial y modificación, pero no hay garantías del autor ni soporte; conviene conservar el aviso de licencia y citar el modelo base.
- No hay información sobre el proceso de entrenamiento, lo que dificulta la reproducibilidad y la auditoría técnica.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/hafeezaismail/fruit-freshness-convnext
- Modelo base: https://huggingface.co/facebook/convnext-tiny-224
- Dataset: https://huggingface.co/datasets/Project-AgML/fresh_rotten_fruit_classification
- Paper de ConvNeXt: https://arxiv.org/abs/2201.03545
- Repositorio oficial de ConvNeXt: https://github.com/facebookresearch/ConvNeXt
