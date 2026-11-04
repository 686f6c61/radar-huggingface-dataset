# LibreYOLO/LibreUniMatchl-flow-sintel

## Resumen

LibreUniMatchl-flow-sintel es un modelo de estimación de flujo óptico (optical flow) publicado por el proyecto LibreYOLO. No es un modelo de lenguaje: se trata de un checkpoint de la familia UniMatch, concretamente la variante GMFlow+ con refinamiento por regresión local (scale2 con 6 pasos de regresión), afinada sobre el conjunto de datos MPI Sintel y reempaquetada para la tarea `flow` de la librería LibreYOLO. El modelo original procede del repositorio autonomousvision/unimatch y del paper "Unifying Flow, Stereo and Depth Estimation" (Xu et al., IEEE TPAMI 2023).

El modelo resuelve el problema de estimar el movimiento denso entre dos fotogramas consecutivos, devolviendo un campo de flujo de dimensiones (H, W, 2) en píxeles sobre el lienzo original, junto con una utilidad de visualización mediante la rueda de color de Middlebury. Es relevante para pipelines de visión por computador que necesitan flujo óptico de calidad en escenas con movimiento complejo, y su empaquetado en LibreYOLO facilita la integración con el resto de tareas de la librería (detección, segmentación, etc.).

La información disponible es escasa: se trata de un artefacto de conversión de pesos con envoltorio de metadatos, sin model card extensa, sin benchmarks publicados en el repositorio y sin datos de descargas o validación comunitaria. La licencia declarada es MIT, aunque el propio autor advierte que la licencia de los pesos upstream no está confirmada por el publicador original.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | GMFlow+ (UniMatch) con refinamiento por regresión local, scale2, 6 pasos de regresión |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión, no de lenguaje) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no aplica (modelo de visión) |
| Licencia | MIT (declarada por el proyecto LibreYOLO; ver advertencias) |
| Formato de pesos | checkpoint `.pt` de LibreYOLO (tensores originales empaquetados en el esquema de la librería) |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura GMFlow+ tal como se implementa en UniMatch, un diseño que unifica estimación de flujo óptico, estéreo y profundidad bajo un mismo marco de trabajo. La variante aquí publicada corresponde a la configuración `gmflow-scale2-regrefine6`, es decir, predicción a dos escalas con seis iteraciones de refinamiento mediante regresión local. El checkpoint de partida es `gmflow-scale2-regrefine6-sintelft-6e39e2b9.pth`, que ya incorpora un ajuste fino sobre MPI Sintel en el repositorio upstream.

No se dispone de información sobre el número de tokens, la composición exacta del dataset de entrenamiento ni la presencia de etapas de RLHF o DPO (no aplicables en este dominio). La única modificación realizada por LibreYOLO es el reempaquetado de los tensores en el esquema de checkpoint de la librería bajo la tarea `flow`; los parámetros aprendidos son idénticos a los del modelo original. El script de conversión está disponible en `weights/convert_unimatch_weights.py` del repositorio de LibreYOLO.

## Capacidades

- Estimación de flujo óptico denso entre dos imágenes o fotogramas, con salida de campo vectorial (dx, dy) en píxeles sobre el lienzo original.
- Refinamiento iterativo mediante regresión local (6 pasos) para mejorar la precisión en bordes y regiones con movimiento complejo.
- Predicción a dos escalas (scale2) para capturar tanto movimientos grandes como pequeños.
- Visualización del flujo mediante la rueda de color de Middlebury (`r.flow.to_rgb()`).
- Integración con la API unificada de LibreYOLO (`LibreYOLO("modelo.pt")`), lo que permite combinar la tarea `flow` con otras tareas de la librería.
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multilingües: es un modelo puramente visual.
- No dispone de modo thinking, visión de alto nivel, audio ni generación de texto.

## Casos de uso

- Estabilización de vídeo: el campo de flujo denso permite estimar el movimiento entre fotogramas consecutivos y compensarlo para reducir vibraciones en grabaciones handheld o de dron.
- Interpolación de fotogramas: a partir del flujo directo e inverso entre dos fotogramas se pueden sintetizar fotogramas intermedios para aumentar la tasa de refresco en postproducción o vídeo slow-motion.
- Seguimiento de objetos y personas: el flujo sirve como señal auxiliar para asociar detecciones entre fotogramas en pipelines de tracking multi-objeto, especialmente en escenas con oclusiones parciales.
- Análisis de movimiento en videovigilancia: detección de dirección e intensidad de movimiento en escenas estáticas para alertas de intrusión o análisis de tráfico.
- Odometría visual y robótica: estimación del movimiento aparente de la cámara a partir del flujo entre imágenes consecutivas, como entrada para módulos de SLAM o navegación.
- Preprocesado para modelos generativos de vídeo: generación de mapas de flujo que alimenten módulos de warping o control de movimiento en pipelines de difusión de vídeo.
- Evaluación y depuración de datasets de vídeo: detección de fotogramas duplicados, cortes de escena o desalineaciones mediante el análisis de la magnitud del flujo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada; al tratarse de una variante scale2 con 6 pasos de refinamiento, el consumo será superior al de variantes de una sola escala, pero no se aportan cifras.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no confirmada; el modelo se distribuye como checkpoint `.pt` para la librería LibreYOLO, que habitualmente soporta ejecución en GPU, pero no se especifican requisitos mínimos.
- Opciones de despliegue: la API documentada es `libreyolo` (carga mediante `LibreYOLO("LibreUniMatchl-flow-sintel.pt")`). No se mencionan exportaciones a ONNX, TensorRT, vLLM, llama.cpp ni Ollama (estas dos últimas no aplican a un modelo de visión).
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Arquitectura | Escalas / refinamiento | Dataset de ajuste | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| LibreUniMatchl-flow-sintel | GMFlow+ (UniMatch) | scale2, 6 pasos de regresión | MPI Sintel | MIT (declarada) | HuggingFace (LibreYOLO) |
| UniMatch GMFlow+ original (`gmflow-scale2-regrefine6-sintelft`) | GMFlow+ (UniMatch) | scale2, 6 pasos de regresión | MPI Sintel | Sin licencia de pesos separada publicada | Repositorio autonomousvision/unimatch |
| RAFT | RAFT (correlación + GRU iterativa) | multi-iteración | FlyingChairs, FlyingThings3D, Sintel (variantes) | BSD-3 (código) | Repositorio princeton-vl/RAFT |
| FlowFormer | Transformer con coste de atención | multi-iteración | Sintel, KITTI (variantes) | No confirmada | Repositorio dcharatan/flowformer |

La comparativa se limita a alternativas de la misma categoría (flujo óptico denso). No se dispone de datos de rendimiento numérico para establecer comparaciones cuantitativas entre ellas en esta ficha.

## Limitaciones y advertencias

- Licencia ambigua en los pesos: el autor declara MIT, pero reconoce explícitamente que el publicador original (autonomousvision) no emitió una licencia separada para los checkpoints y que la concesión MIT es una interpretación del proyecto LibreYOLO, no confirmada por el autor upstream. Verificar antes de uso comercial.
- Sin benchmarks ni métricas publicadas en el repositorio: no hay evidencia numérica del rendimiento del checkpoint reempaquetado frente al original.
- Sin descargas ni validación comunitaria: el modelo tiene 0 descargas y 0 likes en el momento de la consulta, lo que implica ausencia de validación independiente.
- Especializado en un único dominio: afinado sobre MPI Sintel, un dataset de escenas sintéticas con movimiento complejo; puede degradarse en dominios muy distintos (imagen médica, satelital, microscopía) sin reentrenamiento.
- No es un modelo de lenguaje: no soporta texto, tool calling, agentes ni razonamiento; cualquier caso de uso que requiera esas capacidades queda fuera de su alcance.
- Dependencia de la librería LibreYOLO para la carga: el formato `.pt` está empaquetado en el esquema de dicha librería, por lo que no es directamente compatible con otras herramientas sin conversión.
- Riesgo de artefactos en regiones ocluidas o sin textura: inherente a los métodos de flujo óptico denso, aunque no se documenta específicamente para este checkpoint.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/LibreYOLO/LibreUniMatchl-flow-sintel
- Repositorio LibreYOLO: https://github.com/LibreYOLO/libreyolo
- Repositorio upstream UniMatch: https://github.com/autonomousvision/unimatch
- Checkpoint original: https://s3.eu-central-1.amazonaws.com/avg-projects/unimatch/pretrained/gmflow-scale2-regrefine6-sintelft-6e39e2b9.pth
- Paper: Xu, Zhang, Cai, Rezatofighi, Yu, Tao y Geiger. "Unifying Flow, Stereo and Depth Estimation." IEEE TPAMI 2023.
