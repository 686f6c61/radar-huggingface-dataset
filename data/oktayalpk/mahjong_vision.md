# OktayAlpk/mahjong_vision

## Resumen

Mahjong Vision Assistant es un modelo de clasificación de imágenes basado en un Vision Transformer (ViT) fine-tuneado sobre `google/vit-base-patch16-224-in21k` para reconocer fichas de Mahjong en capturas de pantalla del juego Mahjong Soul. Lo desarrolla OktayAlpk como parte de un asistente en tiempo real que sugiere descartes óptimos durante la partida. El modelo resuelve el problema de identificar de forma fiable cada ficha individual (bambú, caracteres, círculos, vientos, dragones, etc.) a partir de imágenes de 224x224 píxeles, lo que permite alimentar un pipeline de análisis de estado del tablero y predicción de jugadas.

El modelo tiene 917.351 parámetros según el archivo safetensors (aunque el modelo base ViT-B/16 supera los 86 millones, este dato probablemente corresponde solo al clasificador o a una versión reducida; el repositorio ocupa 0,7 GB). Se distribuye bajo licencia Apache 2.0 y está pensado para integrarse en aplicaciones de escritorio que capturan la ventana del juego y muestran un overlay con la recomendación de descarte. Su relevancia radica en que combina visión por computador con un segundo modelo de red neuronal (ImprovedNN) para ofrecer asistencia en tiempo real, un caso de uso práctico de IA aplicada a juegos de mesa digitales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision Transformer (ViT-B/16, patch size 16, resolución 224) |
| Parametros totales | 917.351 (según safetensors; el modelo base ViT-B/16 tiene ~86M) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un fine-tuning de `google/vit-base-patch16-224-in21k`, un Vision Transformer preentrenado en ImageNet-21k. La arquitectura consiste en un encoder Transformer con parches de 16x16 píxeles y una cabeza de clasificación lineal. El entrenamiento se realizó sobre un dataset local de imágenes de fichas de Mahjong (el dataset `pjura/mahjong_souls_tiles` en HuggingFace), con 250 épocas, learning rate 5e-5, batch size 16 (con acumulación de gradientes de 4 pasos, batch efectivo de 64), optimizador Adam (betas 0.9/0.999) y scheduler lineal con warmup del 10%. La pérdida final en validación fue de 0.0466, con accuracy 0.9967. No se menciona el uso de técnicas como RLHF o DPO; es un entrenamiento supervisado estándar de clasificación.

## Capacidades

- Clasificación de imágenes de fichas de Mahjong: identifica el tipo y valor de cada ficha (bambú, caracteres, círculos, vientos, dragones, flores, etc.) a partir de capturas de pantalla.
- Reconocimiento en tiempo real: diseñado para procesar frames de la ventana del juego Mahjong Soul y extraer las fichas visibles en la mano del jugador, melds y descartes.
- Integración con pipeline de análisis de estado: las predicciones se alimentan a un segundo modelo (ImprovedNN) que sugiere el descarte óptimo.
- Overlay visual: el sistema completo (no solo este modelo) dibuja un resaltado sobre la ficha recomendada, con código de color según la confianza (verde alta, roja baja).
- Soporte de auto-click: mediante la tecla espacio, el asistente puede mover el cursor y hacer clic automáticamente en la ficha sugerida.
- No es un modelo de lenguaje: no genera texto ni soporta tool calling, agentes o razonamiento multi-paso; su función es estrictamente perceptiva.

## Casos de uso

- Asistente en tiempo real para Mahjong Soul: el modelo captura la ventana del juego, identifica las fichas de la mano y, junto con el modelo de predicción de descarte, muestra una recomendación resaltada en pantalla. Es adecuado porque su alta precisión (99,7%) minimiza errores de reconocimiento que arruinarían la sugerencia.
- Análisis de partidas grabadas: se puede procesar un vídeo o secuencia de capturas para extraer el estado del tablero en cada turno y estudiar decisiones pasadas. El modelo clasifica cada ficha individualmente, lo que permite reconstruir la mano y los descartes.
- Entrenamiento de jugadores novatos: al integrarse en una herramienta de práctica, el asistente puede explicar por qué una ficha es mejor descartar que otra, basándose en el estado reconocido. La precisión del reconocimiento es clave para que las explicaciones sean fiables.
- Automatización de tareas repetitivas en juegos de Mahjong: por ejemplo, llevar un registro automático de las fichas descartadas por los oponentes para estadísticas. El modelo puede clasificar cada ficha del río de descartes.
- Desarrollo de bots de Mahjong: el modelo de visión puede servir como módulo de percepción para un agente que juegue de forma autónoma, combinado con lógica de decisión. Su tamaño reducido permite ejecutarlo en hardware modesto.
- Herramientas de accesibilidad: para jugadores con discapacidad visual, el sistema puede leer en voz alta las fichas reconocidas y la sugerencia de descarte, usando el modelo de visión como entrada.

## Benchmarks y rendimiento

Según el model-index declarado por el autor, los resultados en el conjunto de test del dataset `pjura/mahjong_souls_tiles` son:

| Metrica | Valor |
|---|---|
| Accuracy | 0.9967 |
| F1 | 0.9966 |
| Recall | 0.9967 |

No se han publicado comparaciones con otros modelos en la información disponible. La pérdida de validación durante el entrenamiento descendió de 3.51 (época 1) a 0.0466 al final, lo que indica una convergencia estable.

## Requisitos de hardware

- VRAM estimada: al ser un ViT-B/16 con ~86M de parámetros (aunque el safetensors indique 917K, el modelo base completo requiere ~350 MB en FP32), la inferencia en FP32 necesita menos de 1 GB de VRAM. Con cuantización a int8, cabe en menos de 500 MB.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM (GTX 1050 Ti, RTX 2060, etc.) es suficiente. También funciona en CPU, aunque con mayor latencia (del orden de 50-100 ms por imagen en un procesador moderno).
- Cabe en GPUs de consumo: sí, incluso en integradas de gama alta.
- Opciones de despliegue: al ser un modelo de HuggingFace Transformers, se puede servir con pipelines de `transformers`, o exportar a ONNX para optimización. No se menciona soporte para vLLM, llama.cpp u Ollama, que son específicos de modelos de lenguaje.
- Latencia y throughput: no se han publicado mediciones oficiales. En una GPU moderna, la inferencia de un ViT-B/16 tarda ~5-10 ms por imagen; en CPU, ~50-100 ms.

## Comparativa con modelos similares

No se dispone de comparaciones directas con otros modelos de clasificación de fichas de Mahjong en la información proporcionada. Como referencia, el modelo base `google/vit-base-patch16-224-in21k` tiene 86M parámetros y alcanza ~81% top-1 en ImageNet, pero no está especializado en fichas de Mahjong. Alternativas genéricas como ResNet-50 o EfficientNet podrían lograr resultados similares con fine-tuning, pero no hay datos comparativos publicados para este dominio específico.

## Limitaciones y advertencias

- El modelo está entrenado exclusivamente con imágenes de fichas del juego Mahjong Soul; puede no generalizar a otros estilos de fichas (físicas, otros clientes de juego) o a condiciones de iluminación y resolución diferentes.
- La precisión reportada (99,7%) corresponde al conjunto de test del autor; no se ha verificado de forma independiente y podría degradarse en capturas reales con oclusiones, rotaciones o fondos complejos.
- El modelo solo clasifica imágenes individuales de fichas; no detecta ni segmenta fichas dentro de una captura completa. Para eso se necesita un paso previo de detección (no incluido en este modelo).
- El sistema completo depende de coordenadas de ventana y proporciones de pantalla específicas; puede requerir ajustes manuales según la resolución del usuario.
- El modelo de predicción de descarte (ImprovedNN) no está incluido en este repositorio; se debe obtener por separado desde `pjura/mahjong_ai` y puede no estar actualizado.
- Licencia Apache 2.0 permite uso comercial, pero el uso del asistente para hacer trampas en partidas online puede violar los términos de servicio de Mahjong Soul.
- No se han documentado sesgos específicos, pero al ser un modelo de visión entrenado en un dominio muy concreto, su comportamiento fuera de ese dominio es impredecible.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/OktayAlpk/mahjong_vision
- Dataset de entrenamiento: https://huggingface.co/datasets/pjura/mahjong_souls_tiles
- Modelo base: https://huggingface.co/google/vit-base-patch16-224-in21k
- Repositorio del modelo de predicción de descarte: https://huggingface.co/pjura/mahjong_ai
- Proyecto relacionado (detección de fichas): https://github.com/NotAlvin/mahjong-vision
