# ceselder/deepseek-v4.1-flash-olens-qwen-reader

## Resumen

`ceselder/deepseek-v4.1-flash-olens-qwen-reader` es un adaptador LoRA (librería PEFT) para `Qwen/Qwen3.6-27B` que implementa una "lente oráculo" (oracle lens) entre modelos. Su función no es la generación de texto convencional, sino la interpretabilidad mecanicista: lee activaciones internas de DeepSeek-V4.1-Flash (capa 26, pila mHC de 4 flujos residuales de 5.120 dimensiones cada uno) y las proyecta al espacio de la capa 42 de Qwen3.6-27B mediante cuatro mapas afines aprendidos. El resultado se inyecta como cuatro soft tokens en el decodificador de Qwen, que actúa como "lector" y emite una viñeta describiendo qué está a punto de generar DeepSeek.

El interés técnico reside en la asimetría de costes: ejecutar rollouts nativos de DeepSeek requiere un nodo de 8×H200 y unos 45 s por paso de RL, mientras que el lector Qwen entrena a 16-18 s por paso de 256×8 en un solo nodo de 8 GPU, manteniendo la recompensa calculada por el reconstructor de DeepSeek. Es, por tanto, una infraestructura para verbalizar representaciones internas de un modelo grande usando otro más pequeño y barato de entrenar.

El repositorio (29,4 GB) contiene múltiples carpetas con variantes SFT, RL y controles, además de los mapas afines en fp32. La licencia es Apache-2.0. No hay información sobre idiomas soportados ni pipeline declarado.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (rsLoRA r64) sobre Qwen3.6-27B + 4 mapas afines por flujo residual (5120→5120) |
| Parámetros totales | No disponible (adaptador de 1,7 GiB; mapas afines 105M fp32) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (heredada de Qwen3.6-27B, no especificada) |
| Tipos de cuantización | No disponible (pesos en safetensors y mapas en fp32) |
| Idiomas soportados | No disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (adaptador) + `maps.pt` (fp32, formato `dsvq_stream_maps_v1`) |

## Arquitectura y entrenamiento

El sistema consta de dos componentes acoplados. Primero, cuatro mapas afines `A_k(s_k) = W_k s_k + b_k` que transforman cada uno de los cuatro flujos residuales de la capa 26 de DeepSeek-V4.1-Flash (5.120 dimensiones cada uno) al espacio de la capa 42 de Qwen3.6-27B. Cada mapa lee únicamente su flujo correspondiente. Los vectores resultantes se inyectan como cuatro soft tokens mediante una suma normalizada a la salida del bloque decodificador 1, alineados con cuatro tokens marcadores consecutivos `㈜` (id 158983). Segundo, un adaptador rsLoRA de rango 64 sobre Qwen3.6-27B que actúa como lector y emite una viñeta (`* ...`) describiendo el contenido inminente de la generación de DeepSeek.

El entrenamiento combina una inicialización ridge en forma cerrada (mapa concatenado 20480→5120 dividido en cuatro bloques de columnas, con coseno centrado en held-out de 0,740 en la capa 26) seguida de SFT sobre 3.203.072 filas en una pasada, y después RL con dos tasas de aprendizaje (3e-6 y 6e-6). Existe un control K=1 que usa un único mapa sobre la media de los flujos, lo que permite aislar la contribución de la estructura por flujo. La variante multilayer extiende el lector a ocho capas (6, 12, 18, 22, 26, 30, 34, 38) con un conjunto de mapas por capa y un prompt `<concept layer="NN">`. La deriva de los mapas respecto a la inicialización se reporta como `||W - W0|| / rms` con valores 2,40 / 0,47 / 1,46 / 1 (truncado en la fuente).

## Capacidades

- Verbalización de activaciones internas: traduce el estado residual de la capa 26 de DeepSeek-V4.1-Flash a una descripción en una viñeta.
- Lectura multicapa: la variante multilayer permite leer cualquiera de las ocho capas almacenadas mediante un prompt con etiqueta de capa.
- Reconstrucción de representaciones: el sistema se evalúa por la fidelidad de reconstrucción (coseno y NLL) frente al reconstructor nativo de DeepSeek.
- Entrenamiento con recompensa externa: el RL usa la recompensa calculada por el reconstructor de DeepSeek, no por el propio lector.
- No soporta tool calling, function calling, agentes ni razonamiento multi-step en el sentido convencional.
- No se documentan capacidades multilingües, de visión ni de audio.
- No es un modelo de chat ni de generación general: es una herramienta de interpretabilidad.

## Casos de uso

- Interpretabilidad mecanicista a escala: leer qué representación interna precede a una generación de DeepSeek sin ejecutar el modelo grande en cada paso, usando el lector Qwen como sonda barata.
- Aceleración de pipelines de RL para interpretabilidad: sustituir rollouts de DeepSeek (8×H200, ~45 s por paso) por el lector Qwen (16-18 s por paso de 256×8 en un nodo de 8 GPU), manteniendo la recompensa del reconstructor nativo.
- Auditoría de representaciones por capa: con la variante multilayer, inspeccionar cómo evoluciona un concepto a lo largo de las capas 6 a 38 de DeepSeek y detectar en qué punto se forma una intención de generación.
- Estudio de estructura por flujo residual: comparar el lector K=4 por flujo con el control K=1 de media para determinar si la información relevante está distribuida entre los flujos mHC o concentrada en su media.
- Investigación de transferencia entre modelos: analizar si un modelo de otra familia (Qwen) puede servir de espacio de verbalización para las activaciones de DeepSeek, y con qué pérdida de fidelidad.
- Desarrollo de verbalizadores automáticos: usar el par adaptador + mapas como base para construir descriptores automáticos de estados internos en sistemas de monitorización de modelos.
- Reproducción de experimentos de lente oráculo: el repositorio incluye las carpetas SFT, RL por paso, control y ridge init, lo que permite reproducir la curva de entrenamiento y las métricas reportadas.

## Benchmarks y rendimiento

Resultados reportados en la model card (WorkspaceBench, 21 familias sin variantes con errores tipográficos / las 24 completas):

| Configuración | 21 familias | 24 completas |
|---|---|---|
| SFT (K=4 por flujo) | 0,327 | 0,301 |
| Control K=1 media (SFT) | 0,297 | 0,273 |
| RL paso 300 (K=4, lr 6e-6) | 0,413 | 0,465 |

Métricas de reconstrucción por checkpoint (recompensa held-out greedy / coseno):

| Checkpoint | Recompensa train | Coseno train | NLL train | KL/token | Recompensa held-out | Coseno held-out |
|---|---|---|---|---|---|---|
| SFT K=4 | no disponible | no disponible | no disponible | no disponible | no disponible | CE 2,5928 |
| SFT K=1 media | no disponible | no disponible | no disponible | no disponible | no disponible | CE 2,6173 |
| RL lr 6e-6 paso 25 | 0,209 | 0,44 | 1,92 | 0,26 | 0,231 | 0,468 |
| RL lr 6e-6 paso 100 | 0,288 | 0,53 | 0,33 | 1,64 | 0,281 | 0,521 |
| RL lr 6e-6 paso 300 (release) | 0,305 | 0,55 | 0,37 | 1,97 | 0,313 | 0,551 |
| RL lr 3e-6 paso 100 | 0,263 | 0,50 | 0,47 | 1,15 | 0,259 | 0,497 |
| RL lr 3e-6 paso 300 | 0,298 | 0,54 | 0,40 | 1,99 | 0,298 | 0,537 |
| RL K=1 media lr 6e-6 paso 300 | 0,315 | 0,55 | 0,38 | 2,28 | 0,311 | 0,550 |
| Multilayer SFT | no disponible | no disponible | no disponible | no disponible | no disponible | CE 2,751 (capas mixtas) |
| Multilayer RL paso 300 | 0,266 | no disponible | no disponible | no disponible | 0,264 | no disponible |

No se han publicado resultados en benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- El adaptador pesa 1,7 GiB y los mapas afines 105M parámetros en fp32; el modelo base Qwen3.6-27B debe cargarse aparte.
- Entrenamiento del lector: un nodo de 8 GPU, con 16-18 s por paso de 256×8 según la model card.
- Para comparación, los rollouts nativos de DeepSeek requieren un nodo de 8×H200 y ~45 s por paso de RL.
- VRAM de inferencia para Qwen3.6-27B: no disponible en la información proporcionada; depende de la cuantización del modelo base.
- GPU concretas recomendadas (A100, H100, RTX 4090): no disponibles en la información proporcionada.
- Opciones de despliegue (vLLM, llama.cpp, Ollama, TGI): no documentadas; el formato es PEFT + safetensors, por lo que requiere cargar el modelo base con la librería PEFT.
- Latencia y throughput de inferencia del lector: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Base | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| `ceselder/deepseek-v4.1-flash-olens-qwen-reader` | Lente oráculo cross-model (LoRA + mapas afines) | Qwen3.6-27B | Adaptador 1,7 GiB + 105M mapas | No disponible | Apache-2.0 | HuggingFace |
| `ceselder/deepseek-v4.1-flash-olens-lens` | Lente oráculo nativa de DeepSeek-V4.1-Flash | DeepSeek-V4.1-Flash | No disponible | No disponible | No disponible | HuggingFace |
| Control K=1 media (incluido en el repo) | Variante con un único mapa sobre la media de flujos | Qwen3.6-27B | Adaptador + 1 mapa | No disponible | Apache-2.0 | Incluido en el mismo repo |
| Lentes oráculo de otros modelos | Herramientas de interpretabilidad comparables | Varios | No disponible | No disponible | No disponible | No disponible |

No se dispone de datos de benchmarks de modelos comparables de la misma categoría en la información proporcionada.

## Limitaciones y advertencias

- No es un modelo de propósito general: no debe usarse para generación de texto, chat, código ni tareas estándar de NLP.
- El adaptador y su `maps.pt` deben emparejarse siempre dentro de la misma carpeta; mezclar ficheros de carpetas distintas invalida los resultados.
- La fidelidad de reconstrucción es limitada: coseno held-out máximo reportado de 0,551 en el checkpoint publicado, lo que implica una pérdida sustancial de información respecto al estado interno real de DeepSeek.
- El lector solo ha sido validado sobre activaciones de la capa 26 de DeepSeek-V4.1-Flash (y las ocho capas del slice multilayer); su comportamiento fuera de ese régimen es desconocido.
- El rendimiento en WorkspaceBench es modesto (0,413 / 0,465 en el mejor caso) y está medido con la recompensa del reconstructor de DeepSeek, no con evaluación humana.
- La deriva de los mapas respecto a la inicialización ridge es elevada en algunos flujos (2,40 y 1,46 en dos de los cuatro), lo que puede indicar sobreajuste o inestabilidad.
- No se documentan sesgos, comportamiento multilingüe ni riesgos de alucinación específicos; al tratarse de una sonda de interpretabilidad, los sesgos heredados de Qwen3.6-27B y de DeepSeek-V4.1-Flash pueden manifestarse en las verbalizaciones.
- La licencia Apache-2.0 permite uso comercial del adaptador, pero el modelo base Qwen3.6-27B tiene su propia licencia que debe verificarse por separado.
- El repositorio incluye checkpoints intermedios y controles; usar el checkpoint equivocado produce métricas distintas a las del release.
- La model card está escrita en inglés y contiene referencias a un informe alojado en una IP privada (`http://5.78.192.0/...`), lo que dificulta la verificación independiente.

## Enlaces

- HuggingFace: https://huggingface.co/ceselder/deepseek-v4.1-flash-olens-qwen-reader
- Lente nativa de DeepSeek-V4.1-Flash: https://huggingface.co/ceselder/deepseek-v4.1-flash-olens-lens
- Colección DeepSeek V4.1 Flash olens: https://huggingface.co/collections/ceselder/deepseek-v41-flash-olens-6adffd27b920a405a2025fc6
- Informe del worker (referenciado en la model card): http://5.78.192.0/reports/view/dsv41-xq/report.html
- Modelo base: https://huggingface.co/Qwen/Qwen3.6-27B
