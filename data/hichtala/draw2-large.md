# HichTala/draw2-large

## Resumen

DRAW 2 (Detect and Recognize A Wide range of cards, versión 2) es un detector de objetos basado en Vision Transformer, afinado a partir de `google/vit-base-patch16-224-in21k` y publicado por el autor independiente HichTala. Su tarea es localizar y reconocer cartas de *Yu-Gi-Oh!* en imágenes de todo tipo, con especial énfasis en capturas de partidas en directo donde las cartas aparecen en ángulos, iluminaciones y solapamientos muy variables.

El modelo se distribuye como checkpoint de `transformers` con pesos en `safetensors` (96.540.048 parámetros, repo de 3,3 GB) y se acompaña de un ecosistema propio: un paquete Python (`draw2`), un plugin para OBS y una interfaz de línea de comandos que permite procesar imágenes, vídeo o webcam. La relevancia práctica está en que cubre un nicho que las herramientas oficiales (como Yu-Gi-Oh! NEURON de Konami) no resuelven: reconocimiento de cartas durante un duelo real, incluidas las que están boca abajo, sin necesidad de chips físicos en las fundas.

Frente a su predecesor, esta versión incorpora el plugin de OBS para streaming en tiempo real y un modo de reconocimiento asistido por lista de mazo (fichero `.ydk`), que restringe el espacio de búsqueda y mejora la precisión. La licencia es AGPL-3.0, lo que condiciona su uso en productos de red.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision Transformer (ViT-Base, patch 16, resolución 224) afinado para detección de objetos |
| Parametros totales | 96.540.048 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo de visión; entrada de imagen 224x224 en el backbone) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (inglés) |
| Licencia | AGPL-3.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de `google/vit-base-patch16-224-in21k`, un ViT-Base preentrenado en ImageNet-21k a resolución 224 con parches de 16x16, y se afina para la tarea de detección y reconocimiento de cartas. El pipeline declarado en Hugging Face es `object-detection`, aunque los tags incluyen también `image-classification`, lo que refleja la doble naturaleza del sistema: localizar la carta en la escena y clasificar qué carta es. El backbone ViT procesa la imagen global y la cabeza específica del proyecto produce las detecciones; el detalle exacto de la cabeza (tipo de decoder, número de consultas, función de pérdida) no está documentado en la información disponible.

El entrenamiento se realizó sobre el dataset `HichTala/ygoprodeck-dataset`, derivado del catálogo de cartas de YGOPRODeck. No se especifican en la información disponible el número de tokens o imágenes de entrenamiento, la composición exacta del dataset, ni si hubo etapas de RLHF/DPO (poco habituales en detección visual). Tampoco se detallan innovaciones como decodificación especulativa o atención lineal. La documentación del autor se centra en el uso práctico (CLI, plugin de OBS, fichero `.ydk`) más que en los detalles de entrenamiento.

## Capacidades

- Detección de cartas de *Yu-Gi-Oh!* en imágenes estáticas, vídeo grabado y flujo de webcam.
- Reconocimiento de la identidad de la carta detectada, no solo su localización.
- Funcionamiento en contextos de duelo: cartas en ángulos oblicuos, con reflejos, parcialmente ocluidas o solapadas.
- Reconocimiento asistido por lista de mazo: si se proporciona un fichero `.ydk`, el modelo restringe las candidatas y mejora la precisión.
- Procesamiento en tiempo real integrable en OBS mediante plugin, pensado para streamers sin conocimientos técnicos.
- Salida con opciones de visualización: mostrar las cartas detectadas sobre el vídeo (`--display-card`), guardar el resultado (`--save`) y ajustar FPS del vídeo de salida (`--fps`, por defecto 60).
- Interfaz de línea de comandos (`python -m draw`) con soporte para imagen, vídeo o índice de webcam.
- Capacidades multilingües: no disponibles; el modelo declara únicamente inglés.
- Tool calling, agentes, razonamiento multi-paso, matemáticas o generación de texto: no aplicables (es un modelo de visión especializado).

## Casos de uso

- Retransmisión de partidas en directo: el plugin de OBS detecta las cartas jugadas y las muestra en pantalla en tiempo real, de modo que la audiencia puede leerlas sin que el streamer tenga que acercar la cámara. Es el caso de uso principal y el que motivó el proyecto.
- Análisis posterior de grabaciones: procesar un vídeo de un duelo con `--source` y `--save` para generar un registro de las cartas que aparecen en cada momento, útil para resúmenes, highlights o análisis de partidas.
- Herramientas de asistencia para jugadores: integración en una aplicación que, a partir de una foto del tablero, identifique las cartas en juego y muestre su texto o estadísticas.
- Automatización de catalogación: dado un conjunto de fotos de una colección, detectar y etiquetar cada carta para inventariarla, aprovechando que el detector funciona con imágenes no controladas.
- Investigación en visión por computador: el checkpoint y el dataset sirven como caso de estudio de fine-tuning de ViT para detección de objetos en dominios muy específicos con vocabulario cerrado.
- Desarrollo de overlays y experiencias interactivas: al ser un paquete Python instalable (`pip install git+https://github.com/HichTala/draw2.git`), se puede incrustar en aplicaciones de escritorio o web que reaccionen a las cartas detectadas.
- Verificación de mazos en torneos o pruebas: combinado con el modo `--deck-list`, permite comprobar si las cartas que aparecen en una partida pertenecen al mazo declarado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas cuantitativas (mAP, precisión de reconocimiento, latencia) ni comparaciones numéricas con el predecesor u otros detectores.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Con 96,5 M de parámetros en fp32, los pesos ocupan aproximadamente 0,39 GB; en fp16, unos 0,19 GB. A ello hay que sumar activaciones y el coste del pipeline de detección, por lo que en la práctica se recomienda al menos 2-4 GB de VRAM para un flujo cómodo.
- GPU recomendadas: cualquier GPU con soporte CUDA es suficiente por tamaño; una RTX 3060/4060 o superior permite procesar vídeo en tiempo real con margen. Para entrenamiento o fine-tuning, se recomienda una RTX 4090, A100 o H100.
- Cabe en GPU de consumo: sí, con holgura; incluso en CPU es viable para imágenes sueltas, aunque el vídeo en tiempo real requerirá GPU.
- Opciones de despliegue: el proyecto oficial usa PyTorch y `torchvision`; el checkpoint es compatible con `transformers` (tags `transformers`, `safetensors`, `endpoints_compatible`). No se documentan integraciones con vLLM, llama.cpp, Ollama o TGI (herramientas orientadas a LLM, no aplicables aquí).
- Latencia y throughput estimados: no disponibles. El CLI permite fijar los FPS del vídeo de salida (60 por defecto), pero no se publican cifras de latencia por frame.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto/entrada | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| DRAW 2 (HichTala/draw2-large) | Detección de cartas Yu-Gi-Oh! (ViT fine-tuned) | 96,5 M | Imagen 224x224 (backbone) | AGPL-3.0 | Hugging Face + GitHub + plugin OBS |
| Yu-Gi-Oh! NEURON (Konami) | Reconocimiento de cartas (app oficial) | no disponible | Hasta 20 cartas a la vez | Propietaria | Solo aplicación oficial |
| yugioh one-shot learning (vanstorm9) | Reconocimiento con one-shot learning | no disponible | no disponible | no disponible | GitHub |

La comparación cuantitativa de rendimiento no está disponible: ni DRAW 2 ni las alternativas publican métricas comparables en la información consultada. La ventaja diferencial de DRAW 2 es el reconocimiento en contexto de duelo (cartas boca abajo, ángulos, oclusiones) y su integración directa en OBS, algo que NEURON no ofrece.

## Limitaciones y advertencias

- Dominio muy restringido: solo reconoce cartas de *Yu-Gi-Oh!*; no es un detector de objetos general ni un modelo de lenguaje.
- Idioma: únicamente inglés declarado; no hay soporte multilingüe documentado.
- Sesgos: al entrenarse sobre el catálogo de YGOPRODeck, el rendimiento puede degradarse con cartas fuera de ese catálogo, versiones en otros idiomas, promocionales, proxies o cartas con arte alternativo no representado.
- Alucinación en sentido amplio: como todo clasificador, puede asignar una identidad incorrecta a una carta mal iluminada u ocluida; el modo `--deck-list` mitiga este riesgo al restringir candidatas.
- Licencia AGPL-3.0: cualquier uso en un servicio de red obliga a liberar el código fuente derivado bajo la misma licencia. Es un caveat importante para productos comerciales o SaaS.
- Advertencia del propio autor: el proyecto fue desaconsejado por Konami, titular de los derechos del juego; conviene revisar aspectos de propiedad intelectual antes de un uso comercial o público.
- Sin métricas publicadas: no hay benchmarks oficiales que permitan estimar la precisión esperada en producción.
- Documentación escasa en la model card: no se detallan hiperparámetros, composición del dataset ni proceso de entrenamiento, lo que dificulta la reproducibilidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/HichTala/draw2-large
- Repositorio GitHub del proyecto: https://github.com/HichTala/draw2
- Plugin para OBS: https://github.com/HichTala/draw2-obsplugin
- Dataset: https://huggingface.co/datasets/HichTala/ygoprodeck-dataset
- Modelo base: https://huggingface.co/google/vit-base-patch16-224-in21k
- Paper de referencia del backbone (ViT): https://arxiv.org/abs/2010.11929
- Registro de entrenamiento en Weights & Biases: https://wandb.ai/hich_/draw
- Artículo del autor en Medium: https://medium.com/@hich.tala.phd/how-i-trained-again-my-model-to-detect-and-recognise-a-wide-range-of-yu-gi-oh-cards-5c567a320b0a
- Aplicación oficial Yu-Gi-Oh! NEURON: https://www.konami.com/games/eu/fr/products/yugioh_neuron/
- Trabajo relacionado (one-shot learning): https://github.com/vanstorm9/yugioh-one-shot-learning
