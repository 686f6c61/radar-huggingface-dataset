# LibreYOLO/LibreRAFTs-flow

## Resumen

LibreRAFTs-flow es un checkpoint del modelo RAFT-small (Recurrent All-Pairs Field Transforms) para estimación de flujo óptico, reempaquetado por el proyecto LibreYOLO para su uso dentro de su propia librería de inferencia. El modelo original procede de Princeton Vision & Learning Lab (princeton-vl/RAFT), publicado en 2020, y esta versión redistribuye los pesos `raft-small.pth` sin modificar los parámetros aprendidos, únicamente adaptando el formato del checkpoint para que sea consumible por `libreyolo`.

Se trata de un modelo de visión por computador de tipo image-to-image que, dadas dos imágenes consecutivas (típicamente fotogramas de vídeo), devuelve un campo de flujo denso de dimensiones (H, W, 2) en píxeles, con el desplazamiento (dx, dy) entre el primer y el segundo fotograma. Su relevancia radica en que ofrece una implementación ligera de RAFT (1,0 M de parámetros en la variante small) con verificación de equivalencia numérica frente al original.

El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, con un tamaño de 0.0 GB, lo que sugiere un artefacto de pesos muy compacto o un repositorio recién creado. La licencia es BSD 3-Clause, heredada del proyecto original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | RAFT (Recurrent All-Pairs Field Transforms), variante small |
| Parametros totales | 1,0 M (variante small) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no aplica; entrada de dos imágenes a resolución nativa) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo de visión, sin procesamiento de lenguaje) |
| Licencia | BSD 3-Clause |
| Formato de pesos | `.pt` (checkpoint PyTorch reempaquetado para LibreYOLO) |

## Arquitectura y entrenamiento

RAFT es una arquitectura de estimación de flujo óptico denso que combina un extractor de características convolucional para ambas imágenes, la construcción de un volumen de correlación 4D (all-pairs) y un módulo recurrente de refinamiento que actualiza iterativamente el campo de flujo. La variante small reduce el número de canales respecto a la versión completa, quedando en 1,0 M de parámetros. La inferencia se ejecuta a resolución nativa, con padding a múltiplo de 8 según el `InputPadder` del repositorio upstream, y con 20 iteraciones de refinamiento, siguiendo el `demo.py` original.

El entrenamiento sigue el calendario C+T del paper original: primero FlyingChairs y después FlyingThings3D. No se indica en la información disponible si hubo etapas adicionales de fine-tuning, RLHF/DPO (no aplica a un modelo de flujo óptico) ni detalles sobre el número exacto de tokens o composición del dataset más allá de las dos etapas citadas.

La modificación introducida por LibreYOLO consiste en eliminar el prefijo `module.` del `DataParallel` y añadir metadatos de checkpoint de LibreYOLO (`task: flow`). Los parámetros aprendidos no cambian. Se documenta una verificación de equivalencia en 9 pares de demostración de Sintel (1024x436): la salida de LibreYOLO coincide bit a bit con el RAFT upstream en fp32, con diferencia absoluta máxima de 0,0 px.

## Capacidades

- Estimación de flujo óptico denso entre dos imágenes consecutivas, devolviendo un tensor (H, W, 2) float32 con (dx, dy) en píxeles del fotograma 0 al fotograma 1.
- Conversión del flujo a representación visual mediante rueda de color Middlebury (`r.flow.to_rgb()`).
- Inferencia a resolución nativa con padding automático a múltiplo de 8.
- Refinamiento iterativo configurable (20 iteraciones por defecto, según `demo.py` upstream).
- Integración con la librería LibreYOLO mediante la clase `LibreYOLO`.
- No soporta tool calling, function calling, agentes, razonamiento multi-step, capacidades multilingües ni thinking mode, al ser un modelo puramente de visión.
- No dispone de capacidades de visión semántica (detección, segmentación, descripción); su única salida es el campo de flujo.

## Casos de uso

- Estimación de movimiento en vídeo: procesar pares de fotogramas consecutivos para obtener el campo de flujo denso y derivar mapas de movimiento, útil en análisis de escenas y vigilancia.
- Estabilización de vídeo: el flujo entre fotogramas permite estimar transformaciones globales o locales para compensar movimiento de cámara y vibraciones.
- Interpolación de fotogramas: el flujo (dx, dy) entre dos imágenes sirve de base para generar fotogramas intermedios en pipelines de aumento de tasa de refresco.
- Seguimiento de objetos y puntos: el flujo denso puede alimentar algoritmos de tracking que propagan puntos de interés entre fotogramas.
- Análisis de movimiento en investigación en visión: reproducción de resultados de RAFT en experimentos académicos con equivalencia bit a bit respecto al original.
- Preprocesamiento para tareas downstream: el flujo óptico como entrada auxiliar en modelos de predicción de trayectorias, conducción autónoma o robótica.
- Evaluación y benchmarking de pipelines de flujo óptico: al ser una variante ligera (1,0 M de parámetros), permite iterar rápidamente en entornos con recursos limitados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La única métrica documentada es la verificación de equivalencia numérica frente al RAFT upstream en 9 pares de Sintel (1024x436): diferencia absoluta máxima de 0,0 px en fp32.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 1,0 M de parámetros el peso del modelo es del orden de megabytes, y el consumo dominante proviene de las activaciones a resolución nativa (por ejemplo, 1024x436) y del volumen de correlación.
- GPU recomendadas: no especificadas en la información disponible; por tamaño, cualquier GPU con suficiente memoria para las activaciones a la resolución de entrada debería ser viable.
- Cabe en GPU de consumo: previsiblemente sí, dada la baja cuenta de parámetros, aunque no se confirma en la documentación.
- Opciones de despliegue: librería `libreyolo` (API `LibreYOLO("LibreRAFTs-flow.pt")`); no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI (no aplicables a un modelo de flujo óptico).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Tipo | Contexto/entrada | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| LibreRAFTs-flow | 1,0 M (small) | RAFT small, flujo óptico | Dos imágenes a resolución nativa | BSD 3-Clause | Hugging Face (LibreYOLO) |
| RAFT (upstream, princeton-vl) | No disponible en la información (variantes small y completa) | RAFT, flujo óptico | Dos imágenes a resolución nativa | BSD 3-Clause | GitHub princeton-vl/RAFT |
| Otras alternativas de flujo óptico | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de rendimiento comparativo (EPE, accuracy en Sintel/KITTI) en la información proporcionada para establecer una comparación cuantitativa con otros modelos de flujo óptico.

## Limitaciones y advertencias

- Modelo especializado exclusivamente en flujo óptico; no genera texto, no razona y no procesa lenguaje.
- No se documentan sesgos específicos, pero al ser un modelo entrenado en FlyingChairs y FlyingThings3D puede generalizar peor en dominios alejados de escenas sintéticas de esos datasets.
- Riesgo de errores en regiones oclusas, movimiento rápido, superficies sin textura o cambios de iluminación, propios de la estimación de flujo denso.
- La inferencia a resolución nativa con padding a múltiplo de 8 y 20 iteraciones de refinamiento puede ser costosa en memoria para resoluciones altas.
- Licencia BSD 3-Clause: permite uso comercial con obligación de conservar el aviso de copyright y la cláusula de no endorsamiento; debe revisarse el archivo `NOTICE` del repositorio.
- Repositorio con 0 descargas y 0 likes; madurez y soporte de la comunidad no verificables.
- No se especifican tipos de cuantización soportados ni requisitos de hardware oficiales; conviene validar el despliegue en el entorno objetivo.
- La fecha de creación del repositorio (2026-11-03) figura en el futuro respecto a la fecha habitual de consulta; verificar la vigencia del artefacto antes de usarlo en producción.

## Enlaces

- Hugging Face: https://huggingface.co/LibreYOLO/LibreRAFTs-flow
- Repositorio fuente LibreYOLO: https://github.com/LibreYOLO/libreyolo
- RAFT upstream (princeton-vl): https://github.com/princeton-vl/RAFT
- Checkpoint original `raft-small.pth`: release `models.zip` de princeton-vl/RAFT (commit 2888e15), sha256 `c7d41b9cc88442bb8aa911dbb33086dac55a226394b142937ff22d5578717332`
