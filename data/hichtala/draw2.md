# HichTala/draw2

## Resumen

DRAW 2 (Detect and Recognize A Wide range of cards, versión 2) es un detector de objetos especializado en localizar y reconocer cartas de *Yu-Gi-Oh!* en imágenes, con especial énfasis en escenas de duelo. Lo desarrolla el autor independiente HichTala y se distribuye en Hugging Face bajo licencia AGPL-3.0. Parte del checkpoint `google/vit-base-patch16-224-in21k` y se ha afinado sobre el dataset `HichTala/ygoprodeck-dataset`, que el autor ha construido a partir del catálogo de cartas del juego.

El modelo resuelve un problema concreto: la identificación automática de cartas durante partidas en directo, algo que las alternativas existentes (como la aplicación oficial Yu-Gi-Oh! NEURON de Konami) no cubren bien en contextos de duelo reales, con cartas de baja calidad visual, ángulos variables o cartas boca abajo. La propuesta del autor es integrar el detector en emisiones en directo mediante un plugin para OBS, de modo que los espectadores puedan leer las cartas jugadas en tiempo real.

Técnicamente es un ViT base (86 millones de parámetros en el backbone, 96.540.048 parámetros totales según los pesos safetensors) con una cabeza de detección y clasificación. El repositorio ocupa 10,2 GB e incluye pesos en safetensors y ONNX. La información pública disponible es limitada: no se detallan hiperparámetros de entrenamiento, composición exacta del dataset ni resultados de benchmarks.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Vision Transformer (ViT base, patch 16, resolución 224) con cabeza de detección de objetos |
| Parámetros totales | 96.540.048 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo de visión, sin contexto textual) |
| Tipos de cuantización | no disponible (se distribuyen safetensors y ONNX; se menciona una versión cuantizada del modelo base) |
| Idiomas soportados | en |
| Licencia | AGPL-3.0 |
| Formato de pesos | safetensors, ONNX |

## Arquitectura y entrenamiento

El modelo se construye sobre `google/vit-base-patch16-224-in21k`, un Vision Transformer base con parches de 16x16 y resolución de entrada de 224x224, preentrenado en ImageNet-21k. Sobre ese backbone, el autor añade las cabezas necesarias para la tarea de detección y reconocimiento de cartas, de forma análoga a los enfoques de detección basados en transformers. El pipeline declarado en Hugging Face es `object-detection`, aunque los tags también incluyen `image-classification`, lo que sugiere que el modelo combina localización (bounding boxes) y clasificación de la carta identificada.

El entrenamiento se realizó sobre el dataset `HichTala/ygoprodeck-dataset`, derivado del catálogo de cartas de Yu-Gi-Oh!. No se especifican en la información disponible el número de tokens, el volumen de imágenes, la composición exacta del dataset, ni si se aplicaron técnicas de RLHF, DPO u otras. Tampoco se detallan innovaciones arquitectónicas más allá del uso del ViT preentrenado. El autor publica trazas de entrenamiento en Weights & Biases (enlace en la sección de enlaces), lo que permite consultar curvas y métricas del proceso.

## Capacidades

- Detección de cartas de Yu-Gi-Oh! en imágenes estáticas, vídeo y flujo de webcam.
- Reconocimiento de la carta detectada (identificación de la carta concreta, no solo su localización).
- Funcionamiento en escenas de duelo, incluyendo cartas en distintas posiciones y con calidad visual variable.
- Uso de una lista de mazo (archivo `.ydk`) para restringir y mejorar el reconocimiento de cartas esperadas.
- Integración con OBS mediante un plugin dedicado para emisiones en directo.
- Procesamiento de vídeo con salida a archivo o visualización en ventana, con control de FPS.
- Capacidades multilingües: no disponibles; el modelo está etiquetado únicamente para inglés.
- Tool calling, agentes, razonamiento multi-paso o modo thinking: no disponibles (no es un modelo de lenguaje).

## Casos de uso

- Retransmisión de partidas en directo: el plugin de OBS permite mostrar en pantalla las cartas detectadas en tiempo real, de modo que la audiencia pueda leerlas sin necesidad de acercar la cámara ni de comentarios adicionales.
- Análisis posterior de grabaciones: procesar vídeos de duelos ya grabados para extraer qué cartas se jugaron y en qué momento, útil para crear resúmenes o estadísticas de partidas.
- Herramientas de asistencia para jugadores: integrar el detector en una aplicación que registre el estado del tablero a partir de la webcam, aprovechando la opción de lista de mazo para reducir falsos positivos.
- Catalogación automática de colecciones: dado que reconoce cartas individuales, puede emplearse para digitalizar una colección a partir de fotografías, etiquetando cada carta detectada.
- Investigación en visión por computador: como ejemplo de adaptación de un ViT preentrenado a una tarea de detección y clasificación de dominio específico con un dataset propio, sirve de referencia metodológica.
- Desarrollo de overlays y herramientas para creadores de contenido: al estar disponible el código y los pesos, se pueden construir integraciones propias más allá del plugin oficial de OBS.
- Verificación de reglas o asistencia arbitral: en entornos controlados, el detector puede servir como apoyo para confirmar qué carta está sobre la mesa, siempre con supervisión humana.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: al tratarse de un ViT base de ~96,5 millones de parámetros, la inferencia en FP32 requiere del orden de 400 MB solo para los pesos, más memoria para activaciones; en la práctica, menos de 2 GB de VRAM en FP16 y menos de 1 GB en cuantizaciones de 8 bits (estimación a partir del tamaño del modelo, no publicada por el autor).
- GPU recomendadas: cualquier GPU con al menos 2-4 GB de VRAM es suficiente; se puede usar una RTX 3060, RTX 4090, A100 o H100 sin problemas, aunque el modelo no necesita hardware de gama alta.
- Cabe en GPU de consumo: sí, en prácticamente cualquier GPU de consumo moderna, e incluso en CPU para vídeo a baja resolución o imágenes sueltas.
- Opciones de despliegue: el autor proporciona un paquete Python (`python -m draw`) y un plugin de OBS; también se distribuyen pesos ONNX, lo que permite desplegarlo con ONNX Runtime. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI (no aplicables a un modelo de visión de este tipo).
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| DRAW 2 (HichTala) | ViT base + detección | 96.540.048 | no aplica | AGPL-3.0 | Hugging Face, GitHub, plugin OBS |
| google/vit-base-patch16-224-in21k | ViT base (clasificación) | ~86 M | no aplica | Apache-2.0 | Hugging Face |
| Yu-Gi-Oh! NEURON (Konami) | Aplicación propietaria | no disponible | no disponible | propietaria | aplicación oficial |
| yugioh one-shot learning (vanstorm9) | Enfoque de one-shot learning | no disponible | no aplica | no disponible | GitHub |

La comparación con modelos de propósito general no es directa: DRAW 2 está especializado en un dominio muy concreto y no compite con clasificadores genéricos de ImageNet. Frente a la aplicación oficial de Konami, la ventaja declarada por el autor es la capacidad de reconocer cartas en contexto de duelo y de integrarse en un flujo de emisión; frente a propuestas de one-shot learning, DRAW 2 ofrece un modelo entrenado y listo para usar con plugin incluido.

## Limitaciones y advertencias

- El modelo está entrenado exclusivamente para cartas de Yu-Gi-Oh!; no es un detector de objetos genérico ni un modelo de lenguaje.
- No se han publicado métricas de precisión, recall o mAP en la información disponible, por lo que el rendimiento real en producción debe validarse empíricamente.
- El reconocimiento puede degradarse con cartas boca abajo, muy deterioradas, con reflejos fuertes o en resoluciones bajas; el autor menciona que la opción de lista de mazo mejora el reconocimiento.
- Sesgos conocidos: no documentados en la información disponible; al estar entrenado sobre un catálogo concreto, puede fallar con cartas no incluidas en el dataset o con variantes regionales.
- Riesgo de alucinación: en un detector esto se traduce en falsos positivos (detectar una carta donde no la hay) o en identificar incorrectamente la carta; no se han publicado tasas de error.
- La licencia AGPL-3.0 es copyleft fuerte: su uso en servicios en red obliga a liberar el código fuente derivado, lo que puede ser incompatible con productos comerciales cerrados.
- El autor reconoce que Konami desaconseja este tipo de proyectos; existen riesgos legales y de propiedad intelectual asociados al uso de la imagen de las cartas y de la marca.
- El idioma declarado es únicamente inglés; no hay soporte multilingüe documentado.
- El repositorio es grande (10,2 GB), lo que puede complicar el despliegue en entornos con almacenamiento limitado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/HichTala/draw2
- Repositorio GitHub: https://github.com/HichTala/draw2
- Plugin de OBS: https://github.com/HichTala/draw2-obsplugin
- Trazas de entrenamiento en Weights & Biases: https://wandb.ai/hich_/draw
- Artículo del autor en Medium: https://medium.com/@hich.tala.phd/how-i-trained-again-my-model-to-detect-and-recognise-a-wide-range-of-yu-gi-oh-cards-5c567a320b0a
- Dataset: https://huggingface.co/datasets/HichTala/ygoprodeck-dataset
- Modelo base: https://huggingface.co/google/vit-base-patch16-224-in21k
- Paper del ViT original (arXiv:2010.11929): https://arxiv.org/abs/2010.11929
- Yu-Gi-Oh! NEURON (Konami): https://www.konami.com/games/eu/fr/products/yugioh_neuron/
- Proyecto relacionado yugioh one-shot learning: https://github.com/vanstorm9/yugioh-one-shot-learning
