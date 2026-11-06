# LibreYOLO/LibreSEARAFTs-flow

## Resumen

LibreSEARAFTs-flow es un modelo de estimación de flujo óptico denso empaquetado para la librería LibreYOLO. Se trata de una reempaquetación del checkpoint SEA-RAFT S (variante Small) desarrollado por Princeton Vision & Learning Lab y publicado en el paper "SEA-RAFT: Simple, Efficient, Accurate RAFT for Optical Flow" (ECCV 2024). Dado un par de fotogramas, el modelo predice un campo de desplazamiento denso desde el primer fotograma al segundo, junto con un mapa de confianza por píxel derivado de su incertidumbre mixture-of-Laplace.

El modelo emplea una arquitectura RAFT con codificadores ResNet18 y cuatro iteraciones de refinamiento. No es un modelo de lenguaje: es un modelo de visión por computador especializado en correspondencia de píxeles entre imágenes, lo que lo sitúa en una categoría completamente distinta a los LLM y VLM habituales en este blog. Su relevancia radica en que ofrece una implementación ligera y práctica de un método de flujo óptico de referencia (SEA-RAFT) con una interfaz unificada dentro del ecosistema LibreYOLO.

El empaquetado añade metadatos de esquema de checkpoint de LibreYOLO y un script de conversión, sin modificar los parámetros aprendidos. La licencia es BSD 3-Clause, permisiva para uso comercial. El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y un tamaño de 0.0 GB reportado (probablemente por redondeo de un checkpoint pequeño).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | RAFT (SEA-RAFT S) con codificadores ResNet18 y 4 iteraciones de refinamiento |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión; procesa pares de fotogramas a resolución nativa, con downscale si el lado largo supera 960 px) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplica (modelo de visión, no lingüístico) |
| Licencia | BSD 3-Clause |
| Formato de pesos | .pt (checkpoint con esquema LibreYOLO); origen safetensors convertido |

## Arquitectura y entrenamiento

SEA-RAFT es una evolución del paradigma RAFT para flujo óptico. La variante S emplea dos codificadores ResNet18 (uno por fotograma) que extraen características, un módulo de correlación para construir un volumen de coste, y un refinador iterativo que aplica cuatro iteraciones de actualización del campo de flujo. La innovación principal de SEA-RAFT frente a RAFT original es el uso de una pérdida mixture-of-Laplace que proporciona estimación de incertidumbre por píxel, lo que se traduce en el mapa de confianza expuesto en la interfaz de LibreYOLO.

El checkpoint reempaquetado corresponde a `MemorySlices/Tartan-C-T-TSKH-spring540x960-S` (revisión `31b9b4b711bd2d0d0d38cb99d93ba144beb2dc92`), derivado del repositorio `princeton-vl/SEA-RAFT` en el commit `9137517ba24e628442aec097d3afe71d03503b75`. El nombre del checkpoint sugiere entrenamiento sobre el dataset Tartan-C-T-TSKH con resolución de entrenamiento 540x960. No se dispone de detalles sobre el número de tokens (no aplica) ni sobre la composición exacta del dataset más allá de lo inferible del nombre. La modificación respecto al original es exclusivamente de empaquetado: el safetensors original almacena el BatchNorm compartido por `bn3` y `downsample.1` una sola vez, y el conversor lo escribe bajo ambos nombres sin alterar los parámetros aprendidos.

## Capacidades

- Estimación de flujo óptico denso entre dos fotogramas: devuelve un campo `(H, W, 2)` float32 con desplazamientos `(dx, dy)` en píxeles sobre el lienzo original.
- Mapa de confianza por píxel en `[0, 1]` derivado de la incertidumbre mixture-of-Laplace del modelo.
- Visualización del flujo mediante rueda de color Middlebury (`to_rgb()`).
- Procesamiento de vídeo en streaming: flujo de t a t+1 para cada fotograma de un clip mediante `model("clip.mp4", stream=True)`.
- Procesamiento a resolución nativa con padding a múltiplo de 8; downscale automático si el lado largo excede 960 px, con reescalado de vectores al tamaño original.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multilingües (no es un modelo lingüístico).
- No dispone de modo thinking, visión general, audio ni generación de texto.

## Casos de uso

- Estabilización de vídeo: el flujo denso entre fotogramas consecutivos permite estimar el movimiento global y compensarlo para producir vídeo estabilizado; el mapa de confianza ayuda a descartar regiones ocluidas o con movimiento no rígido.
- Interpolación de fotogramas: el campo de flujo entre t y t+1 es la base para generar fotogramas intermedios en pipelines de aumento de tasa de refresco o slow-motion.
- Seguimiento de objetos y puntos: el flujo permite propagar puntos de interés o cajas de un fotograma al siguiente, útil en pipelines de tracking que necesitan correspondencia densa.
- Estimación de movimiento para robótica y vehículos autónomos: el flujo entre pares de imágenes de cámara proporciona información de desplazamiento aparente para odometría visual o detección de obstáculos en movimiento.
- Análisis de movimiento en vídeo científico o deportivo: cuantificación de desplazamientos de fluidos, partículas o sujetos mediante el campo denso y la confianza por píxel.
- Preprocesado para modelos de vídeo: el flujo óptico se usa como entrada auxiliar en modelos de generación o predicción de vídeo; este modelo ligero con ResNet18 es adecuado para generar esa señal a bajo coste.
- Control de calidad en pipelines de visión: el mapa de confianza permite detectar regiones donde la correspondencia es poco fiable (oclusiones, texturas repetitivas) y activar fallbacks.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas de error de flujo (EPE, Fl-all) ni comparativas numéricas con otros métodos.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; por la arquitectura (dos ResNet18 y refinador ligero) es previsible que quepa en GPUs consumer con pocos GB, pero no se confirma en la información proporcionada.
- GPU recomendadas: no disponible. Un modelo de este tamaño suele ejecutarse en RTX 3060/4060 o superiores, pero no hay datos oficiales.
- Cabe en GPU consumer: previsiblemente sí (arquitectura Small con ResNet18), sin confirmación oficial.
- Opciones de despliegue: librería LibreYOLO (`from libreyolo import LibreYOLO`), con checkpoint `.pt` descargado automáticamente del repositorio. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI (no aplican a un modelo de visión de este tipo).
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Arquitectura | Parametros | Contexto / resolucion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| LibreSEARAFTs-flow | SEA-RAFT S, ResNet18, 4 iteraciones | no disponible | resolución nativa, downscale >960 px | BSD 3-Clause | Hugging Face (LibreYOLO) |
| SEA-RAFT (original) | SEA-RAFT, variantes S/M/L | no disponible | resolución configurable | BSD 3-Clause | GitHub princeton-vl/SEA-RAFT |
| RAFT (original) | RAFT, ResNet + refinador iterativo | no disponible | resolución configurable | BSD 3-Clause | GitHub princeton-vl/RAFT |
| FlowFormer | Transformer para flujo óptico | no disponible | resolución configurable | no disponible | repositorio académico |

La comparativa se limita a métodos de flujo óptico de la misma familia; no se dispone de métricas numéricas comparativas en la información proporcionada.

## Limitaciones y advertencias

- Modelo especializado en flujo óptico: no genera texto, no razona, no responde preguntas ni procesa lenguaje; no debe evaluarse con criterios de LLM.
- No se han publicado métricas de precisión (EPE, Fl-all) en la información disponible, por lo que no es posible cuantificar su exactitud frente a alternativas.
- El downscale automático para imágenes con lado largo superior a 960 px puede degradar la precisión del flujo en escenas con movimientos pequeños o texturas finas.
- El padding a múltiplo de 8 puede introducir artefactos en los bordes si no se recorta adecuadamente.
- Riesgo de fallo en regiones ocluidas, con texturas repetitivas o con grandes desplazamientos; el mapa de confianza debe usarse para filtrar esas zonas.
- No se documentan sesgos específicos, pero al ser un modelo entrenado con datos de escenas (probablemente Tartan-C-T-TSKH) puede tener sesgo hacia dominios visuales similares a los de entrenamiento.
- Licencia BSD 3-Clause permite uso comercial con atribución y sin endoso; es necesario conservar los archivos LICENSE y NOTICE.
- Repositorio con 0 descargas y 0 likes: no hay evidencia de uso en producción ni comunidad que valide su robustez.
- El tamaño reportado del repo (0.0 GB) impide estimar el peso real del checkpoint desde la información disponible.

## Enlaces

- Hugging Face: https://huggingface.co/LibreYOLO/LibreSEARAFTs-flow
- Paper SEA-RAFT (ECCV 2024): https://arxiv.org/abs/2405.14793
- Repositorio SEA-RAFT: https://github.com/princeton-vl/SEA-RAFT
- Checkpoint origen: https://huggingface.co/MemorySlices/Tartan-C-T-TSKH-spring540x960-S
- Repositorio LibreYOLO: https://github.com/LibreYOLO/libreyolo
