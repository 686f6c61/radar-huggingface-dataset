# pictograph/pg-coco-vit-b16

## Resumen

PG-COCO-ViT-b16 es un clasificador de imágenes construido sobre la arquitectura Vision Transformer ViT-B/16 y entrenado por Pictograph Research sobre el dataset COCO-CLS-5k, una selección de 5.000 imágenes derivada de COCO. El modelo resuelve una tarea de clasificación multiclase con 55 categorías que mezclan objetos COCO clásicos (perro, gato, autobús, semáforo) con escenas y conceptos de alto nivel (playa, oficina, retrato, cocina, mercadillo). Se distribuye exclusivamente en formato ONNX con pesos en FP32 y entrada fija de 224x224 píxeles.

La relevancia del modelo es limitada y muy específica: no compite con clasificadores generalistas de gran escala, sino que ofrece un artefacto pequeño (0,3 GB de repositorio) y desplegable en CPU mediante ONNX Runtime, pensado para integrarse en el ecosistema propietario de Pictograph (SDK, API alojada y despliegue de endpoints). Su valor práctico depende casi por completo de que el vocabulario de 55 clases encaje con el problema del usuario.

El modelo declara un 72,44% de accuracy y un F1 de 62,24% sobre COCO-CLS-5k, métricas no verificadas por un tercero y medidas sobre un conjunto de evaluación de solo 5.000 imágenes, lo que implica una varianza considerable. La licencia es no comercial, condicionada además por las licencias individuales de las imágenes de COCO subyacentes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision Transformer ViT-B/16 (parche 16x16, entrada 224x224) |
| Parametros totales | no disponible (ViT-B/16 estándar ronda 86 M, dato no confirmado por el autor) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión, entrada de imagen 224x224) |
| Tipos de cuantizacion | no disponible; el autor solo publica pesos FP32 |
| Idiomas soportados | no aplica (clasificación de imágenes; etiquetas en inglés) |
| Licencia | custom-license, uso exclusivamente no comercial |
| Formato de pesos | ONNX (`pg-coco-vit-b16.onnx`) más `config.json` |

## Arquitectura y entrenamiento

El modelo emplea un transformer de visión estándar con parches de 16x16 sobre imágenes redimensionadas a 224x224, sin modificaciones arquitectónicas declaradas. La salida es una cabeza de clasificación de 55 clases cuyo orden de índices está documentado en la model card. Los pesos se exportan a ONNX en precisión FP32 y el preprocesado (normalización y tamaño de entrada) se describe en el `config.json` que acompaña al binario.

El entrenamiento se realizó sobre COCO-CLS-5k (5.000 imágenes) durante 40 épocas, con batch size de 32 y precisión FP32. No se documenta el número de tokens ni la composición detallada del dataset, ni se menciona uso de RLHF, DPO ni técnicas de aumento de datos. Tampoco se especifica si se partió de pesos preentrenados de ImageNet o de un ViT-B/16 entrenado desde cero, un dato relevante para interpretar el 72,44% de accuracy. No se declaran innovaciones técnicas como decodificación especulativa, atención lineal o destilación.

## Capacidades

- Clasificación de imágenes en 55 categorías cerradas, con salida de probabilidades ordenadas por confianza.
- Categorías de objetos COCO: perro, gato, caballo, elefante, jirafa, cebra, oso, pájaro, avión, tren, autobús, motocicleta, barco, coche implícito en escenas de calle.
- Categorías de escena: playa, calle, cocina, baño, dormitorio, salón, oficina, mercado, restaurante (dining), retrato.
- Categorías de actividad: skateboarding, esquí, fútbol, tenis, béisbol, surf, kitesurf, frisbee.
- Categorías de comida: pizza, donut, postre, comida, verduras, tarta, perrito caliente, fruta.
- Categorías varias: osito de peluche, jarrón, reloj, boca de incendios, equipaje, banco, cartel de calle, señal de stop, foto vintage, videojuegos, electrónica, ropa formal, niño, ganado, cometa.
- Clase residual "other" (índice 54) para entradas que no encajan en el vocabulario.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni generación de texto.
- No tiene capacidades multimodales más allá de la clasificación: no hay grounding, detección con cajas, segmentación ni captioning.
- No se declaran capacidades multilingües; las etiquetas están en inglés.

## Casos de uso

- Moderación y filtrado de imágenes en pipelines de contenido: el modelo puede etiquetar imágenes subidas por usuarios en las 55 categorías y derivar reglas (por ejemplo, bloquear o marcar "formal wear" o "portrait" según política), ejecutándose en CPU vía ONNX Runtime sin GPU dedicada.
- Organización automática de fototecas y DAM: clasificación de lotes de imágenes en categorías de escena (playa, oficina, cocina, dormitorio) para generar álbumes o facetas de búsqueda, aprovechando el bajo coste de inferencia de un ViT-B/16 en FP32.
- Etiquetado previo en flujos de anotación: usar las predicciones como sugerencia inicial para anotadores humanos en proyectos de visión, reduciendo el tiempo por imagen cuando la categoría está dentro del vocabulario de 55 clases.
- Enrutamiento en aplicaciones de visión: clasificador de primera etapa que decide qué modelo especializado invocar después (por ejemplo, si la imagen es "street" enviarla a un detector de señales de tráfico, si es "meal" a un estimador de calorías).
- Análisis de catálogos y marketplaces: clasificación de imágenes de producto en categorías gruesas (electrónica, ropa formal, comida, muebles de salón) para control de calidad de listados o detección de categorías mal asignadas.
- Prototipado rápido y demos: al ser un ONNX de 0,3 GB con SDK propio y API alojada, sirve para validar una idea de clasificación en horas sin entrenar nada, siempre que el vocabulario fijo sea aceptable.
- Investigación en evaluación de clasificadores: como baseline reproducible sobre COCO-CLS-5k con métricas declaradas de accuracy, F1, precision y recall.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (no verificados por terceros), sobre el dataset COCO-CLS-5k:

| Metrica | Valor |
|---|---:|
| Accuracy | 0,7244 (72,44%) |
| F1 | 0,6224 (62,24%) |
| Precision | 0,6619 (66,19%) |
| Recall | 0,6140 (61,40%) |

No se han publicado resultados comparativos con otros modelos ni métricas por clase en la información disponible. La brecha entre accuracy (72,44%) y F1 macro o ponderado (62,24%) sugiere desequilibrio entre clases y rendimiento desigual en categorías minoritarias, aunque el autor no desglosa qué tipo de promedio emplea.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica en el sentido habitual; el modelo se distribuye en ONNX FP32 y está pensado para ejecutarse en CPU. En GPU, un ViT-B/16 en FP32 requiere del orden de 1-2 GB de memoria incluyendo activaciones por lote pequeño, aunque el autor no publica cifras.
- GPU recomendadas: no disponibles. Cualquier GPU con soporte de ONNX Runtime (CUDA o TensorRT) puede ejecutarlo; para lotes grandes se beneficiaría de A100, H100 o L4, pero no hay datos del autor.
- GPU de consumo: sí cabe en GPUs de consumo (RTX 3060, 4060, 4090) por el tamaño reducido del modelo, aunque no se han publicado mediciones.
- Opciones de despliegue: ONNX Runtime (CPU o CUDA), SDK de Pictograph (`pip install "pictograph[inference]"`), API alojada de Pictograph y despliegue como endpoint siempre activo en su plataforma. No se mencionan vLLM, llama.cpp ni TGI, que no aplican a un clasificador de visión.
- Latencia y throughput: no disponibles. No se publican mediciones de latencia por imagen ni de imágenes por segundo en ninguna configuración de hardware.

## Comparativa con modelos similares

| Modelo | Parametros | Entrada | Clases | Licencia | Formato | Accuracy declarada |
|---|---|---|---|---|---|---|
| PG-COCO-ViT-b16 | no disponible (ViT-B/16) | 224x224 | 55 | no comercial (custom) | ONNX | 72,44% en COCO-CLS-5k |
| google/vit-base-patch16-224 (ImageNet-1k) | ~86 M | 224x224 | 1.000 | Apache 2.0 | safetensors, etc. | no comparable (otro dataset) |
| openai/clip-vit-base-patch16 (zero-shot) | ~150 M (visión+texto) | 224x224 | abierto (prompts) | MIT | safetensors, ONNX | no comparable |
| timm ViT-B/16 fine-tuned en COCO | ~86 M | 224x224 | variable | según checkpoint | safetensors | no disponible |

La comparación directa es difícil porque PG-COCO-ViT-b16 usa un vocabulario propietario de 55 clases y un dataset de evaluación propio de 5.000 imágenes. Frente a un ViT-B/16 de ImageNet, la diferencia clave es la licencia: el modelo de Google es Apache 2.0 y permite uso comercial, mientras que este es explícitamente no comercial. Frente a CLIP, la diferencia es la flexibilidad: CLIP permite clasificación zero-shot con cualquier vocabulario, mientras que aquí el conjunto de clases es fijo y no ampliable sin reentrenar.

## Limitaciones y advertencias

- Licencia no comercial: la model card restringe el uso a fines no comerciales. Cualquier despliegue en producto o servicio de pago requiere negociación con Pictograph.
- Licencia de los datos subyacente: las imágenes de COCO provienen de Flickr con licencias individuales y, según el propio autor, el 68,9% de train2017 es Creative Commons NonCommercial. Esto añade incertidumbre legal incluso para usos que el autor pudiera autorizar.
- Vocabulario cerrado de 55 clases: cualquier imagen fuera de esas categorías cae en "other" o se clasifica erróneamente. No es extensible sin reentrenamiento.
- Métricas no verificadas: accuracy, F1, precision y recall están declarados por el autor con `verified: false` y sobre un conjunto de solo 5.000 imágenes, lo que implica alta varianza y posible sobreajuste al split de evaluación.
- Brecha accuracy-F1 de más de 10 puntos: indica desequilibrio de clases y rendimiento probablemente bajo en categorías poco representadas.
- Riesgo de alucinación en sentido clasificatorio: el modelo siempre devuelve una distribución sobre 55 clases, incluidas entradas absurdas o de baja calidad; no hay mecanismo de abstención salvo la clase "other".
- Sin información sobre sesgos: no se documentan análisis de sesgo por género, etnia, edad o geografía, pese a incluir clases como "child", "portrait" o "formal wear" sensibles a estos ejes.
- Documentación de entrenamiento incompleta: no se especifica si partió de pesos preentrenados, la composición exacta del dataset, ni el split train/val/test, lo que dificulta reproducir o auditar el resultado.
- Ecosistema propietario: el uso cómodo pasa por el SDK de Pictograph o su API; el uso con ONNX Runtime puro requiere implementar el preprocesado y la decodificación a mano.
- Sin soporte declarado para cuantización: solo se publican pesos FP32, lo que limita optimizaciones de despliegue en entornos con restricciones de memoria.
- Fecha de creación futura en los metadatos (2026-11-03): inconsistencia que conviene verificar antes de confiar en la versión del artefacto.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/pictograph/pg-coco-vit-b16
- Página del modelo en Pictograph: https://pictograph.io/models/pictograph-research/pg-coco-vit-b16
- Organización Pictograph Research: https://pictograph.io/org/pictograph-research
- Dataset COCO-CLS-5k: https://huggingface.co/datasets/pictograph/coco-cls-5k
- Documentación del SDK: https://pictograph.io/docs
- Guía de inferencia local: https://pictograph.io/docs/local-inference
- Paper de COCO (Lin et al., ECCV 2014): https://arxiv.org/abs/1405.0312
- Paper de ViT (Dosovitskiy et al., 2020): https://arxiv.org/abs/2010.11929
