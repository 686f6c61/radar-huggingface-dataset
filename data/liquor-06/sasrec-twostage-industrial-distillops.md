# Liquor-06/SASRec-TwoStage-Industrial-distillops

## Resumen

SASRec-TwoStage-Industrial-distillops es un sistema de recomendacion secuencial de siguiente item desarrollado por el usuario Liquor-06, orientado al dominio de productos de Amazon Industrial & Scientific. No es un modelo de lenguaje: es un par de modelos SASRec (Self-Attentive Sequential Recommendation) de 287K y 527K parametros respectivamente, destilados desde un recomendador basado en Qwen3-1.7B afinado, usando la libreria distillops. El objetivo es ofrecer capacidades de recomendacion comparables a las de recomendadores LLM de 1.5B a 7B parametros con una huella de apenas 0.8M de parametros, lo que permite servirlo en practicamente cualquier infraestructura.

El sistema opera en dos etapas: una etapa de recall que recupera los 20 candidatos mas probables a partir de los ultimos 10 items del historial del usuario, y una etapa de re-ranking que reordena esos 20 candidatos combinando las probabilidades de ambos modelos con un peso alpha de 0.5. La innovacion principal es que los vectores de item del modelo de recall incorporan la comprension semantica de los titulos de producto que tiene el profesor Qwen3-1.7B, destilada mediante etiquetas suaves (las top-3 recomendaciones del profesor) y una perdida de ranking distillation.

El modelo es relevante en el contexto actual de recomendadores generativos: demuestra que la destilacion de conocimiento desde LLMs hacia arquitecturas ligeras especializadas puede mantener la calidad de ranking en un benchmark concreto (splits de MiniOneRec sobre Amazon Reviews) reduciendo el coste de inferencia en tres o cuatro ordenes de magnitud. Su licencia Apache-2.0 y su implementacion en PyTorch puro con safetensors facilitan su reproduccion y despliegue.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | SASRec (transformer autoregresivo sobre secuencias de items), dos etapas: recall + re-ranker |
| Parametros totales | ~0.8M (287K etapa 1 + 527K etapa 2) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 10 items de historial (ventana fija) |
| Tipos de cuantizacion | no disponible (pesos en safetensors, sin variantes GGUF/INT8 publicadas) |
| Idiomas soportados | en (titulos de producto en ingles) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (retriever.safetensors, reranker.safetensors) + items.tsv + two_stage_rec.py |

## Arquitectura y entrenamiento

La etapa 1 (recall) es un SASRec de 64 dimensiones, 2 bloques transformer, 1 cabeza de atencion y longitud de historial 10. Su tabla de items combina dos fuentes: vectores de ID aprendidos y vectores de titulo proyectados desde Qwen3-1.7B, fusionados en una unica tabla de 64 dimensiones. Se entrena con entropia cruzada mas ranking distillation (peso 1), usando como etiquetas suaves las top-3 recomendaciones del profesor para cada usuario de entrenamiento. La etapa 2 (re-ranker) es un SASRec plano que reordena los 20 candidatos de la etapa 1 mediante la puntuacion `0.5 * log p_recall + 0.5 * log p_reranker`, con el peso 0.5 seleccionado sobre el conjunto de validacion.

El profesor es un Qwen3-1.7B afinado sobre los historiales de compra de 6.612 usuarios (HR@10 de .147 sobre 1.000 usuarios de test), que genera titulos bajo una restriccion de trie sobre el catalogo. Al ser demasiado grande para servirlo, se usa solo en modo offline: sus embeddings de titulo se convierten en vectores de item y sus top-3 recomendaciones en etiquetas suaves. Los estudiantes se entrenan sobre los splits preprocesados de MiniOneRec (Apache-2.0) del dataset Amazon Reviews. El early stopping se aplica sobre NDCG@10 de validacion. El catalogo consta de 3.686 items indexados en `items.tsv`.

## Capacidades

- Recomendacion de siguiente item sobre un historial de hasta 10 productos, devolviendo indices y titulos del catalogo.
- Ranking por lotes mediante `rec.rank(histories, k)` para evaluar multiples historiales de forma eficiente.
- Recuperacion semantica de candidatos gracias a los vectores de titulo destilados desde Qwen3-1.7B.
- Re-ranking fino de los 20 candidatos recuperados en la primera etapa.
- Ejecucion en CPU o GPU (`device="cuda"`), con dependencias minimas (PyTorch + safetensors + huggingface_hub).
- No soporta tool calling, agentes, vision, audio ni generacion de texto libre: es exclusivamente un recomendador.

## Casos de uso

- Recomendacion de productos en tiendas de material industrial y cientifico: el modelo sugiere el siguiente articulo a comprar a partir de los ultimos 10 productos vistos o comprados, con un coste de inferencia despreciable frente a un LLM recomendador.
- Prototipado rapido de sistemas de recomendacion secuencial: al ocupar 0.8M de parametros y caber en cualquier CPU, permite validar pipelines de recall + re-ranking antes de invertir en infraestructura mayor.
- Destilacion de recomendadores LLM en produccion: sirve como referencia reproducible de como convertir un profesor Qwen3-1.7B en dos SASRec ligeros manteniendo HR@10 cercano al del profesor.
- Personalizacion de catalogos pequenos (menos de 4.000 items): adecuado para nichos verticales donde el catalogo es manejable y la latencia debe ser de milisegundos.
- Baseline academico para investigacion en recomendacion secuencial: proporciona splits, script de metricas y pesos que reproducen exactamente los resultados del seed 42, util para comparaciones controladas.
- Sistemas de recompra y cestas recurrentes: con historiales de 10 items, puede detectar patrones de consumo repetido en suministros industriales (filamentos, consumibles, herramientas) y sugerir el siguiente consumible.

## Benchmarks y rendimiento

Resultados sobre el conjunto de test completo (4.533 usuarios), mismos splits y script de metricas que MiniOneRec.

| Modelo | Tamano | HR@3 | NDCG@3 | HR@5 | NDCG@5 | HR@10 | NDCG@10 |
|---|---|---|---|---|---|---|---|
| SASRec (baseline ajustado) | 0.5M | .102 | .093 | .115 | .098 | .134 | .104 |
| **Este modelo (seed 42)** | **0.8M** | **.112** | **.101** | **.129** | **.108** | **.165** | **.119** |
| Misma receta, media de 3 seeds | 0.8M | .113 | .101 | .132 | .109 | .164 | .119 |
| MiniOneRec (oct 2025), segun reporte | 1.5B-7B LLM | .114 | .101 | .132 | .108 | .159 | .117 |
| S-GRec (feb 2026), segun reporte | 1.5B LLM | .116 | .103 | .136 | .111 | .163 | .120 |

El autor advierte que la comparacion con los recomendadores LLM es aproximada, no exacta: aquellos generan semantic IDs mientras que este modelo rankea el catalogo directamente.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 100 MB; el modelo completo pesa menos de 1 MB en safetensors y el catalogo de 3.686 items ocupa unos pocos cientos de KB.
- GPU recomendadas: ninguna en particular; funciona en cualquier GPU con CUDA (incluso integradas) y en CPU sin problemas.
- Cabe holgadamente en cualquier GPU consumer (RTX 3060, RTX 4090, etc.) y en dispositivos de borde.
- Opciones de despliegue: PyTorch nativo con `two_stage_rec.py`; no hay integracion publicada con vLLM, llama.cpp, Ollama ni TGI (no aplica, al no ser un LLM).
- Latencia y throughput: no disponibles en la informacion proporcionada; por el tamano del modelo se espera latencia de milisegundos en CPU y sub-milisegundo en GPU, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| SASRec-TwoStage-Industrial-distillops | 0.8M | 10 items | SASRec en dos etapas con destilacion de LLM | Apache-2.0 | Hugging Face |
| MiniOneRec | 1.5B-7B | no disponible | LLM generativo con semantic IDs | no disponible en la informacion | GitHub (AkaliKong/MiniOneRec) |
| S-GRec | 1.5B | no disponible | LLM recomendador | no disponible en la informacion | no disponible |
| SASRec baseline | 0.5M | 10 items | SASRec plano | no disponible | implementaciones multiples |

## Limitaciones y advertencias

- Cold start nulo: ninguna de las dos etapas recomienda items que no aparezcan en entrenamiento; para los 147 usuarios de test cuyo siguiente item es inedito, HR@10 es 0. Existe una variante que puntua solo con vectores de titulo del LLM (HR@10 .030), pero no es la publicada.
- Dominio cerrado: entrenado exclusivamente sobre Amazon Industrial & Scientific; no generaliza a otros catalogos sin reentrenamiento.
- Idioma unico: solo titulos en ingles; no hay soporte multilingue.
- Ventana corta: solo lee los ultimos 10 items del historial, por lo que no aprovecha senales de largo plazo.
- Catalogo fijo de 3.686 items: cualquier item nuevo requiere reindexacion y, probablemente, reentrenamiento.
- Riesgo de sesgo: hereda los sesgos de popularidad y composicion del dataset Amazon Reviews y de las recomendaciones del profesor Qwen3-1.7B.
- Reproducibilidad limitada a un seed: los resultados publicados corresponden al seed 42; la media de 3 seeds difiere ligeramente (HR@3 .113 frente a .112).
- Licencia Apache-2.0 permisiva para uso comercial, pero los datos subyacentes de Amazon Reviews pueden tener terminos adicionales que conviene revisar.
- Sin datos publicados de latencia, throughput ni comportamiento en produccion a gran escala.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Liquor-06/SASRec-TwoStage-Industrial-distillops
- Repositorio distillops: https://github.com/Zihao-Wu06/distillops
- Codigo y write-up de la tarea de recomendacion: https://github.com/Zihao-Wu06/distillops/tree/main/tasks/rec
- Repositorio MiniOneRec: https://github.com/AkaliKong/MiniOneRec
