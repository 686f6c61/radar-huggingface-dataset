# LibreYOLO/LibreFlowSeeks-flow

## Resumen

LibreFlowSeeks-flow es un modelo de estimación de flujo óptico (optical flow) empaquetado por LibreYOLO para su tarea `flow`, derivado del trabajo FlowSeek de Matteo Poggi y Fabio Tosi (Universidad de Bolonia), presentado en ICCV 2025. El modelo resuelve el problema de estimar el movimiento denso entre pares de fotogramas consecutivos, devolviendo un campo de flujo de dos canales `(dx, dy)` en píxeles. No es un modelo de lenguaje: es un modelo de visión por computador de tipo image-to-image.

La arquitectura combina dos redes ResNet-18 (contexto y extracción de features), un codificador Depth Anything V2 ViT-S (Small) congelado y 12 iteraciones de refinamiento, siguiendo la estela de SEA-RAFT. El checkpoint incluido es el generalista `flowseek_T_TartanCT_TSKH.pth`, entrenado secuencialmente en TartanAir, Chairs y Things, y afinado en una mezcla de Sintel, KITTI, HD1K y Things. El repositorio ocupa 0,2 GB y los pesos están empaquetados en formato `.pt` con el esquema de checkpoint de LibreYOLO v1.0.

Su relevancia actual radica en que integra modelos fundacionales de profundidad (Depth Anything V2) dentro de un pipeline clásico de flujo óptico, lo que permite obtener estimaciones densas de movimiento con un encoder autosuficiente y sin dependencias externas, bajo licencia Apache 2.0 y con una API Python minimalista.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida: 2x ResNet-18 (contexto y features) + Depth Anything V2 ViT-S congelado + 12 iteraciones de refinamiento (base SEA-RAFT) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión; procesa pares de fotogramas) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplica (modelo de visión, sin capacidades lingüísticas) |
| Licencia | Apache 2.0 |
| Formato de pesos | `.pt` (esquema de checkpoint LibreYOLO v1.0); repo de 0,2 GB |

## Arquitectura y entrenamiento

FlowSeek emplea un diseño de dos redes: una red de contexto y una red de features, ambas basadas en ResNet-18, que alimentan un módulo de refinamiento iterativo con 12 pasos. La innovación principal es la incorporación de un codificador Depth Anything V2 ViT-S (Small) congelado, que aporta priors de profundidad y estructura a la estimación del flujo, combinado con una representación basada en bases de movimiento (motion bases). El modelo hereda la filosofía de SEA-RAFT (BSD 3-Clause) para el refinamiento iterativo.

El entrenamiento del checkpoint `flowseek_T_TartanCT_TSKH.pth` sigue un currículum secuencial: primero TartanAir, después Chairs y Things, y finalmente un fine-tune mixto sobre Sintel, KITTI, HD1K y Things. Según la model card, el checkpoint generalista se evalúa upstream en Spring y LayeredFlow. Esta variante (tamaño `s`) comparte pesos con LibreFlowSeekt-flow pero difiere en el número de iteraciones de refinamiento, tal como en la configuración upstream `config/eval/flowseek-S.json`. Las modificaciones respecto al original son únicamente de metadatos (envoltorio del esquema LibreYOLO v1.0); los parámetros aprendidos no se han alterado.

## Capacidades

- Estimación densa de flujo óptico entre pares de fotogramas consecutivos, devolviendo un tensor `(H, W, 2)` float32 en píxeles con componentes `(dx, dy)`.
- Procesamiento por lotes: N fotogramas de entrada producen N-1 flujos.
- Integración del prior de profundidad mediante el encoder Depth Anything V2 ViT-S congelado, lo que mejora la coherencia estructural en escenas con movimiento complejo.
- Refinamiento iterativo (12 iteraciones) para precisión subpíxel en regiones de movimiento.
- Modelo autosuficiente: el checkpoint embebe el encoder de Depth Anything V2, sin necesidad de descargar pesos adicionales.
- No soporta tool calling, function calling, agentes, razonamiento multi-step ni capacidades multilingües (no es un modelo de lenguaje).
- No dispone de modo thinking, visión general, audio ni generación de texto.

## Casos de uso

- Estimación de movimiento en vídeo para postproducción: el modelo calcula el flujo entre fotogramas consecutivos, útil para interpolación de frames, estabilización y retiming en pipelines de edición.
- Odometría visual y robótica: integrado en sistemas de navegación que requieren movimiento denso entre imágenes de cámara estéreo o monocular, aprovechando el prior de profundidad del encoder Depth Anything V2.
- Vigilancia y análisis de tráfico: estimación del movimiento de vehículos y peatones entre fotogramas para conteo, seguimiento y detección de anomalías en secuencias de vídeo.
- Compresión de vídeo basada en flujo: generación de campos de movimiento densos que alimentan codificadores híbridos o modelos neuronales de compresión.
- Generación de datasets sintéticos aumentados: uso del flujo para warp de imágenes y creación de pares sintéticos con ground truth de movimiento en entrenamiento de otros modelos.
- Investigación en visión por computador: banco de pruebas para comparar el efecto de priors de profundidad fundacionales en la estimación de flujo, con evaluación en Spring y LayeredFlow.
- Análisis de movimiento en vídeo médico o biomecánico: estimación de desplazamientos finos entre fotogramas de secuencias de imagen, donde el refinamiento iterativo aporta precisión subpíxel.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; el repo ocupa 0,2 GB en disco, lo que sugiere un modelo compacto apto para GPUs de gama media, pero no se confirma el consumo en memoria.
- GPU recomendadas: no disponible (no se especifican A100, H100 ni RTX 4090 en la información proporcionada).
- Compatibilidad con GPU de consumo: probable dado el tamaño del checkpoint (0,2 GB) y el uso de ResNet-18 + ViT-S, pero no confirmado en la información disponible.
- Opciones de despliegue: librería `libreyolo` mediante `LibreYOLO("LibreFlowSeeks-flow.pt")`; no se mencionan vLLM, llama.cpp, Ollama ni TGI (no aplicables a un modelo de visión de este tipo).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| LibreFlowSeeks-flow | no disponible | no aplica | Flujo óptico denso | Apache 2.0 | HuggingFace (LibreYOLO) |
| SEA-RAFT | no disponible | no aplica | Flujo óptico denso | BSD 3-Clause | Repo upstream |
| FlowSeek (original, mattpoggi) | no disponible | no aplica | Flujo óptico denso | no disponible | GitHub |
| RAFT (antecesor) | no disponible | no aplica | Flujo óptico denso | BSD 3-Clause | Repo original |

No se dispone de datos de rendimiento comparativo (EPE, Fl-all) en la información proporcionada para establecer una comparación cuantitativa con SEA-RAFT, RAFT u otros modelos de flujo óptico.

## Limitaciones y advertencias

- Modelo de visión especializado: no genera texto, no razona, no soporta tool calling ni agentes; su uso está restringido a estimación de flujo óptico.
- Dependencia de pares de fotogramas: requiere imágenes consecutivas alineadas; no está diseñado para imágenes aisladas.
- Sesgos de dominio: entrenado en TartanAir, Chairs, Things, Sintel, KITTI y HD1K; el rendimiento puede degradarse en dominios no representados (imágenes médicas, satelitales, microscopía) sin fine-tuning.
- Riesgo de error en regiones ocluidas, texturas repetitivas, movimiento rápido o cambios de iluminación, inherente a los métodos de flujo óptico.
- Licencia Apache 2.0 permite uso comercial, pero el encoder Depth Anything V2 y SEA-RAFT tienen sus propias condiciones (BSD 3-Clause en el caso de SEA-RAFT); conviene revisar los ficheros `LICENSE` y `NOTICE` del repositorio.
- El modelo se distribuye como envoltorio de metadatos: los pesos no se han reentrenado, por lo que hereda las limitaciones del checkpoint upstream.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: ecosistema joven, poca validación comunitaria.
- No se especifican requisitos de memoria ni latencia, lo que dificulta planificar despliegues en producción sin pruebas previas.

## Enlaces

- HuggingFace: https://huggingface.co/LibreYOLO/LibreFlowSeeks-flow
- Modelo hermano (misma arquitectura, distinto número de iteraciones): https://huggingface.co/LibreYOLO/LibreFlowSeekt-flow
- Repositorio upstream FlowSeek: https://github.com/mattpoggi/flowseek
- Repositorio LibreYOLO: https://github.com/LibreYOLO/libreyolo
- Depth Anything V2: https://github.com/DepthAnything/Depth-Anything-V2
- Paper FlowSeek (ICCV 2025): no disponible como enlace directo en la información proporcionada
