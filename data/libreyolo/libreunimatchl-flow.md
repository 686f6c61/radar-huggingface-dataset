# LibreYOLO/LibreUniMatchl-flow

## Resumen

LibreUniMatchl-flow es un checkpoint de estimación de flujo óptico empaquetado para la librería LibreYOLO. No se trata de un modelo de lenguaje ni de un transformer generativo, sino de una red convolucional especializada en calcular el movimiento denso entre dos fotogramas consecutivos. Concretamente, envuelve el modelo UniMatch en su variante GMFlow+ con escala 2 y 6 pasos de refinamiento por regresión local, entrenado sobre el dataset mixto que el proyecto original recomienda para datos del mundo real.

El modelo procede del repositorio autonomousvision/unimatch (commit `943a990`), en concreto del checkpoint `gmflow-scale2-regrefine6-mixdata-train320x576-4e7b215d.pth` publicado en el MODEL_ZOO del proyecto. La modificación introducida por LibreYOLO es exclusivamente de metadatos: los tensores originales se almacenan sin cambios dentro del esquema de checkpoint de LibreYOLO bajo la tarea `flow`. Los parámetros aprendidos no se han alterado.

Es relevante para desarrolladores que trabajan con visión por computador y necesitan estimación de flujo óptico integrada en un pipeline unificado de modelos (detección, segmentación y flujo bajo la misma API). El modelo se apoya en el paper "Unifying Flow, Stereo and Depth Estimation" (Xu et al., IEEE TPAMI 2023). El repositorio en HuggingFace tiene 0 descargas y 0 likes en el momento de la consulta, y un tamaño declarado de 0.0 GB.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GMFlow+ (UniMatch), escala 2 con 6 pasos de refinamiento por regresión local |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (no aplica; entrada de dos imágenes) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no aplica; tarea de visión) |
| Licencia | MIT (interpretación declarada por LibreYOLO, no confirmada por el publicador original) |
| Formato de pesos | checkpoint `.pt` de LibreYOLO (tensores originales sin modificar) |

## Arquitectura y entrenamiento

La arquitectura subyacente es GMFlow+ en la formulación de UniMatch, una red de estimación de flujo óptico denso que combina correspondencia global con refinamiento iterativo local. La variante empaquetada usa escala 2 y 6 pasos de refinamiento por regresión local (`regrefine6`), lo que permite refinar progresivamente el campo de flujo a partir de una estimación inicial. El entrenamiento se realizó sobre el dataset mixto del proyecto original, con resolución de entrenamiento 320x576, que es el checkpoint que los autores de UniMatch recomiendan para datos del mundo real.

No se dispone de información sobre el número de tokens, composición exacta del dataset ni sobre si se aplicaron técnicas de ajuste posteriores (RLHF/DPO no aplican a este tipo de modelo). La innovación técnica destacable es la unificación de flujo óptico, estéreo y profundidad en un mismo marco de correspondencia, tal como describe el paper de TPAMI 2023. El empaquetado por parte de LibreYOLO no introduce cambios en los pesos: solo añade metadatos para integrar el modelo en la tarea `flow` de su API.

## Capacidades

- Estimación de flujo óptico denso entre dos fotogramas, devolviendo un tensor `(H, W, 2)` en float32 con desplazamientos `(dx, dy)` en píxeles sobre el lienzo original.
- Conversión del campo de flujo a representación visual mediante rueda de color Middlebury (`to_rgb()`).
- Integración en la API unificada de LibreYOLO mediante `LibreYOLO("LibreUniMatchl-flow.pt")`.
- Procesamiento de pares de imágenes pasadas como lista de rutas o frames.
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso: es un modelo puramente perceptivo de visión.
- No dispone de capacidades multilingües, de generación de texto ni de modo "thinking".
- No se documentan capacidades de estéreo o profundidad en este empaquetado concreto, aunque la arquitectura original las unifica.

## Casos de uso

- Estimación de movimiento en vídeo: el modelo calcula el flujo denso entre fotogramas consecutivos, adecuado para tareas de seguimiento, estabilización o análisis de movimiento en secuencias.
- Integración en pipelines de LibreYOLO: al compartir la API con modelos de detección y segmentación, permite construir sistemas que combinen detección de objetos con análisis de movimiento sin cambiar de framework.
- Preprocesado para odometría visual: el campo de flujo `(dx, dy)` por píxel sirve como entrada para algoritmos de estimación de movimiento de cámara en robótica y vehículos autónomos.
- Interpolación de fotogramas: el flujo bidireccional entre dos imágenes permite generar fotogramas intermedios en postproducción o en pipelines de vídeo.
- Análisis de escenas reales: al usar el checkpoint entrenado en dataset mixto (recomendado para datos del mundo real), es adecuado para vídeo no sintético, a diferencia de variantes entrenadas solo en sintético.
- Investigación en visión por computador: sirve como línea base reproducible para comparar métodos de flujo óptico dentro del ecosistema UniMatch y para experimentos de unificación flujo-estéreo-profundidad.
- Visualización y depuración: la conversión a rueda de color Middlebury facilita inspeccionar cualitativamente la calidad del flujo en herramientas de anotación o validación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas (como EPE o porcentajes de outliers en Sintel o KITTI) para este checkpoint empaquetado, y no se deben inferir cifras del paper original sin verificación directa.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada; depende del tamaño de los fotogramas de entrada y de la implementación.
- GPU recomendadas: no disponible. Al ser un modelo convolucional de visión, es probable que funcione en GPU de consumo, pero no se confirma en la documentación.
- Compatibilidad con GPU de consumo: no confirmada explícitamente; el tamaño del repositorio (0.0 GB) sugiere un checkpoint ligero, pero no se aportan requisitos.
- Opciones de despliegue: la única vía documentada es la librería LibreYOLO (`from libreyolo import LibreYOLO`). No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Escala / refinamiento | Entrenamiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| LibreUniMatchl-flow | GMFlow+ (UniMatch) | escala 2, 6 pasos regrefine | dataset mixto, 320x576 | MIT (interpretación LibreYOLO) | HuggingFace (LibreYOLO) |
| UniMatch original (gmflow-scale2-regrefine6-mixdata) | GMFlow+ (UniMatch) | escala 2, 6 pasos regrefine | dataset mixto, 320x576 | sin licencia de pesos separada | Repositorio autonomousvision |
| RAFT | Flujo óptico recurrente | iterativo | sintético + real | BSD-3 (código) | Repositorio oficial |
| FlowFormer | Transformer de flujo | coste volumétrico | sintético + real | no disponible | Repositorio oficial |

La comparativa con RAFT y FlowFormer se ofrece como referencia de categoría; no se dispone de métricas comparativas verificadas en la información proporcionada, por lo que no se pueden establecer diferencias de rendimiento cuantitativas.

## Limitaciones y advertencias

- Licencia ambigua: el proyecto original publica los checkpoints sin una licencia de pesos separada. La licencia MIT es una interpretación declarada por LibreYOLO, no confirmada por el publicador original, lo que introduce riesgo legal para uso comercial.
- Es un modelo de visión, no de lenguaje: no genera texto, no razona y no soporta instrucciones en lenguaje natural.
- Riesgo de alucinación no aplica en el sentido habitual, pero sí existe riesgo de flujo erróneo en regiones oclusivas, texturas repetitivas o movimientos grandes fuera del rango entrenado.
- Resolución de entrenamiento limitada a 320x576; el rendimiento en resoluciones muy distintas puede degradarse.
- No se documentan sesgos específicos ni dominios de exclusión del dataset mixto.
- El repositorio tiene 0 descargas y 0 likes, y fue creado y actualizado el mismo día (2026-11-03), lo que indica un empaquetado reciente y sin validación comunitaria.
- No se especifican requisitos de hardware ni latencias, lo que dificulta planificar despliegues en producción.
- El tamaño del repositorio se declara como 0.0 GB, un dato que conviene verificar antes de la descarga.

## Enlaces

- HuggingFace: https://huggingface.co/LibreYOLO/LibreUniMatchl-flow
- Repositorio LibreYOLO: https://github.com/LibreYOLO/libreyolo
- Repositorio UniMatch: https://github.com/autonomousvision/unimatch
- Checkpoint original: https://s3.eu-central-1.amazonaws.com/avg-projects/unimatch/pretrained/gmflow-scale2-regrefine6-mixdata-train320x576-4e7b215d.pth
- Paper: Xu, Zhang, Cai, Rezatofighi, Yu, Tao y Geiger. "Unifying Flow, Stereo and Depth Estimation." IEEE TPAMI 2023.
