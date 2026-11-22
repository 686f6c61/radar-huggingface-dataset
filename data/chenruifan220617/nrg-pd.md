# ChenruiFan220617/NRG-PD

## Resumen

NRG-PD (Non-Rigidly Generated Pixel Detector) es un modelo de predicción densa para vídeo generado que estima, para cada píxel de un vídeo sintético, el ángulo NRG: la desviación en grados del contenido respecto a una escena rígida observada a lo largo de la trayectoria de cámara implícita en el propio vídeo. El modelo lo publica el usuario ChenruiFan220617 y se entrena sobre el dataset NRG-Twins, también del mismo autor. Resuelve un problema específico de evaluación de vídeo generado: detectar qué regiones de un vídeo no respetan la consistencia 3D esperable de una escena rígida, algo relevante para auditar la calidad geométrica de salidas de modelos de generación de vídeo.

Técnicamente no es un modelo entrenado desde cero, sino un ajuste fino de VGGT-1B (un transformer de ~1.000 millones de parámetros para percepción 3D) mediante LoRA de rango 16 aplicado a las últimas 8 capas de atención de frames y 8 de atención global, más una cabeza DPT inicializada desde la cabeza de profundidad de VGGT. El repositorio contiene únicamente los parámetros entrenables (36.849.031 valores en float32, ~0,4 GB); los pesos congelados de VGGT-1B deben obtenerse por separado desde `facebook/VGGT-1B`.

Su relevancia es acotada pero clara: ofrece una señal cuantitativa (ángulo en grados) para separar píxeles con contenido no rígido de píxeles rígidos en vídeo generado, con un AUROC por píxel de 0,863 en el split de test reportado por el autor. La licencia MIT y el formato de pesos safetensors facilitan su integración en pipelines de evaluación.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | VGGT-1B (transformer de percepción 3D) con LoRA rango 16 en las últimas 8 capas de atención de frames y 8 de atención global, más cabeza DPT inicializada desde la cabeza de profundidad de VGGT |
| Parámetros totales | 36.849.031 parámetros entrenables (float32); el backbone congelado VGGT-1B se carga aparte y su recuento no se detalla en la información disponible |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | No disponible (los pesos se distribuyen en float32) |
| Idiomas soportados | No disponible (modelo de visión/vídeo, no lingüístico) |
| Licencia | MIT |
| Formato de pesos | safetensors (solo parámetros entrenables) |

## Arquitectura y entrenamiento

NRG-PD parte de VGGT-1B, un transformer diseñado para predicción densa de geometría 3D a partir de vídeo o conjuntos de imágenes. Sobre ese backbone congelado se añade un adaptador LoRA de rango 16 en las últimas 8 capas de atención de frames y en las últimas 8 capas de atención global, y se sustituye la cabeza de salida por una cabeza DPT inicializada desde la cabeza de profundidad original de VGGT. El modelo resultante predice un valor por píxel: el ángulo NRG, expresado en grados, que mide cuánto se aleja el contenido de la hipótesis de escena rígida vista a lo largo de la trayectoria de cámara del propio vídeo.

El entrenamiento se realiza sobre el dataset NRG-Twins (`ChenruiFan220617/NRG-Twins`). El autor publica tres checkpoints correspondientes a tres semillas de entrenamiento (20261108 en el paso 2715; 20261109 y 20261110 en el paso 3000), cada uno seleccionado por la menor pérdida sobre 20 pares de validación ("twins"). Los pesos congelados de VGGT-1B se toman de la revisión `860abec7937da0a4c03c41d3c269c366e82abdf9` de `facebook/VGGT-1B`. No se detallan en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset ni si se emplearon técnicas de RLHF o DPO (poco probables en un modelo de predicción densa).

## Capacidades

- Predicción densa por píxel del ángulo NRG (en grados) sobre vídeo generado, indicando la desviación respecto a una escena rígida.
- Detección de píxeles no rígidos frente a rígidos mediante umbralización del ángulo (el autor reporta separación entre θc ≥ 0,6° y θc < 0,075°).
- Evaluación de consistencia 3D en vídeo sintético, aprovechando el conocimiento geométrico del backbone VGGT-1B.
- Procesamiento de vídeo como entrada (archivo `.mp4` en el ejemplo de uso) con salida en formato `.npz`.
- No soporta tool calling ni function calling.
- No está orientado a agentes ni a razonamiento multi-paso.
- No tiene capacidades multilingües ni de generación de texto.
- No dispone de modo thinking, visión general, audio ni otras capacidades especiales más allá de la predicción densa descrita.

## Casos de uso

- Auditoría de calidad geométrica de vídeo generado: dado un vídeo sintético, el modelo produce un mapa por píxel del ángulo NRG que permite localizar regiones donde el contenido se deforma o no respeta la rigidez esperada, útil para comparar modelos generadores.
- Control de calidad en pipelines de generación de vídeo: integrar la inferencia (`python -m nrgpd.infer`) como paso de validación tras la generación, rechazando o marcando clips con alta proporción de píxeles no rígidos.
- Investigación en consistencia 3D: usar la señal continua del ángulo NRG para estudiar cómo varía la coherencia geométrica según la trayectoria de cámara, el tipo de escena o el modelo generador.
- Construcción de datasets de evaluación: generar etiquetas densas de rigidez/no rigidez sobre nuevos vídeos para ampliar el benchmark NRG-Twins o entrenar detectores derivados.
- Análisis de fallos en modelos de vídeo: identificar sistemáticamente qué categorías de contenido (objetos deformables, oclusiones, movimientos complejos) producen mayores desviaciones respecto a la hipótesis rígida.
- Selección de checkpoints y semillas: los tres checkpoints publicados permiten comparar estabilidad del detector entre semillas y elegir el más adecuado para un conjunto de validación propio.

## Benchmarks y rendimiento

El autor reporta un único resultado en la model card: sobre los 83 pares de test (cada semilla evaluada en sus propios píxeles válidos), la semilla 20261108 alcanza un AUROC por píxel de 0,863 para separar píxeles NRG (θc ≥ 0,6°) de píxeles rígidos (θc < 0,075°).

| Métrica | Valor | Conjunto | Checkpoint |
|---|---|---|---|
| AUROC por píxel (NRG vs. rígido) | 0,863 | 83 pares de test | seed 20261108 (paso 2715) |

No se han publicado en la información disponible resultados adicionales ni comparaciones con otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita. Los parámetros entrenables ocupan ~0,15 GB en float32 (36,8 M valores), pero la inferencia requiere además cargar el backbone VGGT-1B completo, cuyo consumo no se detalla en la información disponible.
- GPU recomendadas: no disponible. Por el tamaño del backbone (~1.000 M de parámetros) se requeriría una GPU con memoria suficiente para VGGT-1B en float32 o precisión reducida, pero no se confirma en la documentación.
- ¿Cabe en GPU de consumo? No disponible.
- Opciones de despliegue: el autor proporciona un repositorio de código (`Sosekie/NRG-Twins`) con un módulo de inferencia (`nrgpd.infer`) que acepta vídeo `.mp4` y pesos `.safetensors`. No se mencionan vLLM, llama.cpp, Ollama ni TGI (no aplicables a este tipo de modelo).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone en la información proporcionada de modelos comparables de predicción densa de no rigidez en vídeo generado. Como referencia estructural, el propio backbone VGGT-1B podría emplearse sin ajuste, pero no se han publicado métricas comparativas en la documentación disponible.

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| NRG-PD | 36,8 M entrenables + VGGT-1B congelado | No disponible | Predicción densa de ángulo NRG | MIT | Hugging Face |
| VGGT-1B (base) | ~1.000 M (no confirmado en la información) | No disponible | Percepción 3D densa | No disponible en la información | `facebook/VGGT-1B` |

## Limitaciones y advertencias

- Modelo altamente especializado: solo predice el ángulo NRG por píxel; no genera texto, no responde preguntas y no sirve para tareas generales.
- Dependencia obligatoria de los pesos congelados de VGGT-1B desde una revisión concreta (`860abec7937da0a4c03c41d3c269c366e82abdf9`); cambios en esa revisión pueden romper la reproducibilidad.
- Los archivos del repositorio contienen únicamente parámetros entrenables; no son un modelo autónomo y requieren el backbone para funcionar.
- El umbral de separación (θc ≥ 0,6° frente a θc < 0,075°) está calibrado en el dataset NRG-Twins; su transferencia a otros dominios o resoluciones no está validada en la información disponible.
- Métricas reportadas por el propio autor, sin revisión por pares ni comparaciones independientes.
- Riesgo de alucinación en sentido geométrico: el modelo puede asignar ángulos NRG incorrectos en escenas con movimiento no rígido legítimo (personas, líquidos, vegetación), confundiéndolo con inconsistencias del generador.
- Sesgos de dominio: el entrenamiento se limita a NRG-Twins; no se documenta la diversidad de escenas, cámaras o estilos de vídeo cubiertos.
- Licencia MIT, que permite uso comercial, pero sin garantías ni soporte del autor.
- Sin datos sobre rendimiento en idiomas (no aplica) ni sobre límites de longitud de vídeo o resolución soportada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ChenruiFan220617/NRG-PD
- Dataset NRG-Twins: https://huggingface.co/datasets/ChenruiFan220617/NRG-Twins
- Repositorio de código: https://github.com/Sosekie/NRG-Twins
- Backbone VGGT-1B: https://huggingface.co/facebook/VGGT-1B
