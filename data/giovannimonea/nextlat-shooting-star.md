# giovannimonea/nextlat-shooting-star

## Resumen

NextLat-shooting-star es una colección de 24 modelos transformer pequeños entrenados con el objetivo NextLat (predicción del siguiente estado latente, Teoh et al., 2025, arXiv:2511.05963) sobre una tarea sintética de búsqueda de caminos en grafos con forma de estrella. El autor, giovannimonea, publica un checkpoint por semilla (1234–1257) que comparten arquitectura y flujo de datos de entrenamiento, pero difieren en la inicialización. El modelo no es un asistente de propósito general: es un artefacto de investigación para estudiar si la predicción latente auxiliar mejora el razonamiento multi-paso en tareas de planificación.

La tarea concreta es el path-star task de Bachmann y Nagarajan (2024) con una variante "shooting star": un grafo estrella G(5,5) con un nodo central y 5 brazos de 4 nodos, más una cadena de 8 nodos que entra en el centro. Dado un listado de 28 aristas dirigidas en orden aleatorio, un nodo de inicio t1 y un objetivo al final de un brazo, el modelo debe emitir el camino de 13 nodos. El punto crítico es el centro, donde hay 5 aristas salientes y solo una lleva al objetivo.

La relevancia es metodológica: 22 de las 24 semillas resuelven la tarea con precisión de camino completo superior al 97% en 20.000 grafos de validación, mientras que dos semillas fallan de forma distinta (una no sigue la cadena, otra falla en la elección de brazo). Esto convierte al repositorio en un banco de pruebas reproducible para analizar varianza entre semillas en tareas de planificación con transformers pequeños (12 capas, 6 cabezas, ancho 384).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (NextLat) con modelo de dinámica latente auxiliar |
| Parametros totales | no disponible (pesos fp32 de 91 MB por semilla) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 101 tokens (block_size); context_length de configuración: 86 |
| Tipos de cuantizacion | no disponible (pesos publicados en fp32; el autor usa bf16 autocast en evaluación) |
| Idiomas soportados | no disponible (vocabulario sintético de 106 tokens, no es lenguaje natural) |
| Licencia | MIT |
| Formato de pesos | safetensors (state dict de `NextLat.model`, fp32) |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only de 12 capas, 6 cabezas de atención y anchura 384, sin sesgos, con vocabulario de 106 tokens y ventana de 101 tokens. Incluye el modelo de dinámica latente de NextLat: además de la pérdida de siguiente token, el modelo predice sus propios estados ocultos futuros con horizonte 3, mediante términos smooth-L1 y KL (λ_mse = 1, λ_kl = 1, proj_factor = 1.0). Según la model card, la pérdida de cross-entropy se configura con λ_ce = 0.0 en la configuración publicada, de modo que el entrenamiento se apoya en los términos latentes descritos.

El entrenamiento consiste en 40.000 pasos de 512 grafos cada uno, generados de nuevo en cada paso (no hay conjunto de entrenamiento fijo). Optimizador AdamW con lr 5e-4 constante, betas (0.9, 0.95), weight decay 0.1 solo en pesos matriciales, sin warmup y clipping de gradiente a 100. Se ejecutó en bf16 mixed precision sobre 1 GPU. Las 24 semillas (1234–1257) cambian solo la inicialización y ven el mismo flujo de grafos. No se documenta uso de RLHF ni DPO; el objetivo es puramente de predicción supervisada sobre la tarea sintética.

## Capacidades

- Generación de caminos en grafos estrella con cadena de entrada ("shooting star"): emite la secuencia de 13 nodos desde t1 hasta el objetivo.
- Seguimiento de aristas dirigidas: recorre la cadena y los brazos siguiendo la única arista saliente de cada nodo.
- Selección de brazo en el nodo central: identifica cuál de las 5 aristas salientes del centro conduce al objetivo.
- Razonamiento multi-paso en contexto corto: 13 pasos de decodificación sobre una ventana de 101 tokens.
- Decodificación greedy (top-1) y muestreada (temperatura 1), ambas reportadas por el autor.
- No soporta tool calling ni function calling.
- No soporta agentes ni multi-step reasoning fuera de la tarea sintética.
- No tiene capacidades multilingües: el vocabulario es de 106 tokens sintéticos, no lenguaje natural.
- No dispone de modo thinking, visión ni audio.

## Casos de uso

- Estudio de varianza entre semillas en planificación: comparar las 24 semillas sobre los mismos 20.000 grafos de validación para medir cuánto varía la precisión de camino completo (de 0% a 99,98%) según la inicialización.
- Reproducción de resultados de NextLat: ejecutar el código público (commit 3770be6) con los checkpoints publicados para verificar las cifras de la model card en bf16.
- Análisis de modos de fallo: la semilla 1254 no sigue la cadena (acierta el segundo nodo en solo el 5% de los grafos) y la 1234 falla solo en la elección de brazo (~29% greedy); sirven como casos de estudio de fallos localizados frente a fallos de procedimiento.
- Benchmark de objetivos auxiliares: usar esta tarea como test controlado para comparar NextLat con transformers entrenados solo con cross-entropy, manteniendo arquitectura y datos.
- Curvas de aprendizaje: los archivos `training_evals.json` permiten estudiar cuándo cada semilla supera el 90% (entre 3.000 y 38.000 pasos según semilla).
- Docencia e investigación en razonamiento composicional: la tarea path-star es un ejemplo canónico de planificación con un punto de decisión único y verificable automáticamente.
- Evaluación de robustez a orden de aristas: el prompt lista las 28 aristas en orden aleatorio, lo que permite medir sensibilidad al orden de la entrada.

## Benchmarks y rendimiento

Precisión de camino completo sobre 20.000 grafos de validación (`giovannimonea/shooting-star-graph-val`), bf16 autocast, código NextLat commit 3770be6. "Solved" = precisión muestreada ≥ 90%.

| Semilla | Resuelta | Muestreada (%) | Greedy (%) | Primer paso ≥ 90% |
|---|---|---|---|---|
| 1234 | no | 21,36 | 28,94 | – |
| 1235 | sí | 99,87 | 99,94 | 8000 |
| 1236 | sí | 99,67 | 99,90 | 16000 |
| 1237 | sí | 99,94 | 99,98 | 8000 |
| 1238 | sí | 99,91 | 99,97 | 4000 |
| 1239 | sí | 99,97 | 100,00 | 3000 |
| 1240 | sí | 99,73 | 99,92 | 26000 |
| 1241 | sí | 99,98 | 100,00 | 3000 |
| 1242 | sí | 99,91 | 99,98 | 17000 |
| 1243 | sí | 99,98 | 99,99 | 6000 |
| 1244 | sí | 99,92 | 99,98 | 3000 |
| 1245 | sí | 97,79 | 99,16 | 38000 |
| 1246 | sí | 98,03 | 99,30 | 37000 |
| 1247 | sí | 99,94 | 100,00 | 4000 |
| 1248 | sí | 99,96 | 99,99 | 11000 |
| 1249 | sí | 99,94 | 99,99 | 3000 |
| 1250 | sí | 99,83 | 99,96 | 4000 |
| 1251 | sí | 99,84 | 99,97 | 6000 |
| 1252 | sí | 99,85 | 99,92 | 3000 |
| 1253 | sí | 99,82 | 99,98 | 5000 |
| 1254 | no | 0,00 | 0,00 | – |
| 1255 | sí | 99,84 | 99,96 | 16000 |
| 1256 | sí | 99,90 | 99,95 | 6000 |
| 1257 | sí | 99,88 | 99,96 | 4000 |

Referencia de azar: un modelo que acierte todo salvo el brazo en el centro resuelve aproximadamente el 20% de los grafos. Los detalles por posición (13 posiciones, condicionados a las salidas propias del modelo) están en `results.json`.

## Requisitos de hardware

- VRAM estimada para inferencia: muy baja. Cada checkpoint ocupa 91 MB en fp32; con el modelo de dinámica latente y activaciones, la inferencia cabe holgadamente en cualquier GPU consumer con 4 GB o más.
- GPU recomendadas: cualquier GPU con soporte bf16 (RTX 30xx/40xx, A100, H100). El autor evaluó con bf16 autocast en una sola GPU.
- Cabe en GPU consumer: sí, en todas las GPU modernas, incluidas las de gama de entrada con suficiente memoria para el runtime de PyTorch.
- Opciones de despliegue: el código de referencia NextLat (PyTorch + safetensors), cargando el state dict con `NextLat.model.load_state_dict`. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI; el vocabulario sintético y la arquitectura con modelo latente hacen improbable un soporte directo en esos motores sin adaptación.
- Latencia y throughput: no disponibles en la información proporcionada. El tamaño del modelo (12 capas, ancho 384) sugiere latencias de milisegundos por generación de 13 tokens en GPU, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| NextLat-shooting-star (este) | no disponible (91 MB fp32/semilla) | 101 tokens | Path-star con cadena, 24 semillas | MIT | Hugging Face |
| NextLat original (Teoh et al., 2025) | no disponible | no disponible | Predicción latente, varios dominios | no disponible | GitHub JaydenTeoh/NextLat |
| Path-star baseline (Bachmann & Nagarajan, 2024) | no disponible | no disponible | Path-star G(5,5) | no disponible | paper |

No se dispone de cifras comparativas de rendimiento entre estos modelos en la información proporcionada. La comparación relevante es interna: 22 de 24 semillas resuelven la tarea, con dos fallos de naturaleza distinta (selección de brazo frente a seguimiento de cadena).

## Limitaciones y advertencias

- Modelo de investigación, no de propósito general: solo resuelve la tarea sintética de path-star con cadena; no genera lenguaje natural ni código.
- Dos de las 24 semillas fallan: la 1254 obtiene 0% en todos los pasos registrados y la 1234 se queda en ~29% greedy por fallar la elección de brazo. No debe asumirse que cualquier semilla funciona.
- El vocabulario es de 106 tokens sintéticos; no hay soporte multilingüe ni de lenguaje natural.
- Ventana de contexto muy corta (101 tokens), adecuada solo para prompts del formato descrito.
- Riesgo de alucinación: en esta tarea se manifiesta como caminos inválidos que no siguen las aristas del grafo; la precisión no es 100% ni en las mejores semillas.
- Licencia MIT: permite uso comercial, pero el valor práctico del modelo fuera de investigación es nulo.
- La pérdida publicada usa λ_ce = 0.0, lo que conviene tener en cuenta al reproducir o modificar el entrenamiento.
- No se documentan sesgos sociales ni de dominio, al no operar sobre datos de lenguaje natural.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta; no hay validación comunitaria independiente de las cifras.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/giovannimonea/nextlat-shooting-star
- Dataset de validación: https://huggingface.co/datasets/giovannimonea/shooting-star-graph-val
- Paper NextLat: https://arxiv.org/abs/2511.05963
- Código NextLat: https://github.com/JaydenTeoh/NextLat
