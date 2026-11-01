# ketiswp/meshgraphnet-hf

## Resumen

MeshGraphNet es una red neuronal sobre grafos (GNN) desarrollada originalmente por DeepMind y publicada en ICLR 2021 (paper arXiv:2010.03409). El modelo aquí documentado, `ketiswp/meshgraphnet-hf`, es una implementación en formato HuggingFace Transformers entrenada específicamente para simular flujo alrededor de un cilindro (`cylinder_flow`), un caso de referencia clásico en dinámica de fluidos computacional (CFD). Dada la velocidad en cada nodo de la malla en un instante, el modelo predice el cambio de velocidad para el siguiente paso temporal, permitiendo generar trayectorias completas mediante *rollout*.

El modelo tiene 2.332.962 parámetros totales y se distribuye en formato safetensors con código personalizado (`trust_remote_code=True`). No es un modelo de lenguaje: es un modelo de extracción de características sobre grafos de malla, orientado a la predicción de campos físicos. Su relevancia radica en que reproduce los resultados del paper original (RMSE 1-step de 2,35 × 10⁻³ frente a 2,34 × 10⁻³ del paper) con una latencia por paso notablemente inferior (4,0 ms frente a 21 ms del paper en hardware distinto).

La licencia Apache-2.0 y su integración con la librería `transformers` facilitan su uso en pipelines de simulación y su comparación con implementaciones de referencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Graph Neural Network (MeshGraphNet, encoder-processor-decoder sobre grafo de malla) |
| Parametros totales | 2.332.962 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no aplica; opera sobre grafos de malla con número de nodos variable, ~1885 nodos de media en cylinder_flow) |
| Tipos de cuantizacion | no disponible (entrenado y evaluado en float32) |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

MeshGraphNet es una GNN de tipo encode-process-decode. Cada nodo y arista se codifica en un espacio latente, se procesan mediante pasos de paso de mensajes (message passing) con actualizaciones de nodo y arista, y finalmente se decodifica la salida por nodo. En esta implementación, la primera capa lineal de cada bloque separa las proyecciones de emisor y receptor (`W [h_s; h_r; e] = W_s h_s + W_r h_r + W_e e`), de modo que las proyecciones se calculan una vez por nodo en lugar de construir la concatenación por arista. Los pesos y las salidas son idénticos a los del modelo sin esta optimización.

El entrenamiento sigue los ajustes originales del paper sobre el dataset `cylinder_flow` de DeepMind: un frame por paso (frames 1..598, con buffer de mezcla de 10000), ruido gaussiano de desviación típica 0,02 sobre la velocidad, optimizador Adam con tasa de aprendizaje `1e-4 * 0.1^(step/5e6) + 1e-6`, 10 millones de pasos, los primeros 1000 pasos dedicados solo a recopilar estadísticas del normalizador, inicialización de pesos estilo Sonnet y precisión float32. No se menciona uso de RLHF ni DPO, algo esperable en un modelo de simulación física.

## Capacidades

- Predicción del cambio de velocidad por nodo (`delta_velocity`, forma `[N, 2]`) a partir de la velocidad actual en cada nodo de la malla.
- Generación de trayectorias completas mediante *rollout* autoregresivo (`rollout(..., num_steps=599)` devuelve `[600, N, 2]`).
- Preparación de entradas a partir de celdas, posiciones de malla, tipos de nodo y velocidad (`prepare_inputs`).
- Extracción de características sobre grafos de malla (pipeline `feature-extraction`).
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso en el sentido de los LLM.
- No tiene capacidades multilingües, de visión, audio ni modo de razonamiento.
- Específico del dominio CFD: flujo alrededor de un cilindro.

## Casos de uso

- Simulación de flujo alrededor de un cilindro: sustitución o aceleración de un solver CFD numérico para el caso de referencia `cylinder_flow`, generando trayectorias de 600 pasos con un error de rollout comparable al del paper original.
- Prototipado rápido de surrogate models: usar el modelo como base para evaluar arquitecturas GNN en problemas de dinámica de fluidos antes de entrenar sobre datos propios.
- Generación de datos sintéticos: producir trayectorias de flujo para aumentar datasets de entrenamiento de otros modelos o para validación de solvers.
- Estudio de estabilidad de rollouts: analizar la acumulación de error a lo largo de 50 o 600 pasos (RMSE rollout-50 de 6,67 × 10⁻³, rollout-all de 55,83 × 10⁻³) en investigación sobre modelos autoregresivos de simulación.
- Benchmarking de hardware: con 4,0 ms/paso en una RTX 6000 Ada, sirve como carga de trabajo ligera para medir rendimiento de inferencia GNN en distintas GPU.
- Educación e investigación en GNN: ejemplo compacto (2,3 M de parámetros) y reproducible de MeshGraphNet integrado en `transformers`, útil para docencia y experimentación.

## Benchmarks y rendimiento

Resultados en CylinderFlow, en el formato de la Tabla 1 del paper:

| Modelo | Nodos (media) | Pasos | t_model ms/paso | t_full ms/paso | t_GT ms/paso | RMSE 1-step ×10⁻³ | RMSE rollout-50 ×10⁻³ | RMSE rollout-all ×10⁻³ | GPU |
|---|---|---|---|---|---|---|---|---|---|
| Paper | 1885 | 600 | 21 | 23 | 820 | 2,34 ± 0,12 | 6,3 ± 0,7 | 40,88 ± 7,2 | NVIDIA Tesla V100 |
| Este modelo | 1885 | 600 | 4,0 | 4,4 | – | 2,35 ± 0,09 | 6,67 ± 0,30 | 55,83 ± 3,97 | NVIDIA RTX 6000 Ada Generation |

Mediciones sobre 100 trayectorias de test; el error indicado es el error estándar sobre trayectorias. Tiempos en una GPU, batch 1, float32; `t_full` incluye la reconstrucción del grafo desde la malla en cada paso.

## Requisitos de hardware

- VRAM estimada: muy baja; con 2,3 M de parámetros en float32 el modelo ocupa aproximadamente 9 MB, por lo que la memoria dominante es la del grafo y los tensores intermedios, no los pesos.
- GPU recomendadas: cualquier GPU moderna con soporte CUDA; el autor reporta tiempos en una NVIDIA RTX 6000 Ada Generation.
- Cabe holgadamente en GPU de consumo (RTX 3060, RTX 4060, RTX 4090, etc.), aunque no se han publicado mediciones específicas en estas.
- Opciones de despliegue: `transformers` con `trust_remote_code=True`; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (no aplicables a este tipo de modelo).
- Latencia y throughput: 4,0 ms/paso de modelo y 4,4 ms/paso completo (incluyendo reconstrucción del grafo) en RTX 6000 Ada, batch 1, float32.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto / dominio | RMSE 1-step ×10⁻³ | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ketiswp/meshgraphnet-hf | 2,33 M | cylinder_flow (CFD) | 2,35 | Apache-2.0 | HuggingFace |
| MeshGraphNet original (DeepMind) | no disponible | cylinder_flow (CFD) | 2,34 | Apache-2.0 (código) | GitHub `deepmind-research` |
| medav/meshgraphnets-torch | no disponible | meshgraphnets (varios) | no disponible | no disponible | GitHub |

La comparación directa con el paper original es la más relevante: misma precisión a 1 paso, peor error en rollouts largos (55,83 frente a 40,88 × 10⁻³) y latencia por paso menor, aunque en hardware distinto (RTX 6000 Ada frente a V100).

## Limitaciones y advertencias

- Modelo de dominio muy específico: entrenado únicamente para `cylinder_flow`; no generaliza a otras geometrías o condiciones sin reentrenamiento.
- Acumulación de error en rollouts largos: el RMSE rollout-all (55,83 × 10⁻³) es superior al del paper, lo que limita simulaciones de muchos pasos.
- No es un modelo de lenguaje: no procesa texto, no soporta tool calling ni agentes.
- Requiere `trust_remote_code=True`, lo que implica ejecutar código personalizado del autor; conviene auditar el código antes de usarlo en producción.
- Entrenado en float32; no se documentan versiones cuantizadas ni su impacto en precisión.
- Sin datos publicados sobre sesgos (no aplica en el sentido habitual de LLM) ni sobre robustez fuera del dataset de entrenamiento.
- Licencia Apache-2.0 permite uso comercial, pero el modelo hereda las condiciones del código y datos originales de DeepMind; verificar la procedencia del dataset `cylinder_flow`.
- Solo 30 descargas y 0 likes en el momento de la consulta: ecosistema de validación muy limitado.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ketiswp/meshgraphnet-hf
- Paper MeshGraphNet (arXiv:2010.03409): https://arxiv.org/abs/2010.03409
- Código original DeepMind: https://github.com/google-deepmind/deepmind-research/tree/master/meshgraphnets
- Implementación PyTorch de referencia: https://github.com/medav/meshgraphnets-torch
