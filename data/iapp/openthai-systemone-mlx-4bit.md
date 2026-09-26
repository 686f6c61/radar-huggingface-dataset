# iapp/OpenThai-SystemOne-MLX-4bit

## Resumen

OpenThai-SystemOne-MLX-4bit es una cuantización de 4 bits del modelo iapp/OpenThai-SystemOne (v0.3, commit `f3709948`), un modelo de decisión "System One" para tailandés e inglés desarrollado por iApp Technology / OpenThaiGPT. No es un modelo generativo: en un único forward pass responde preguntas tipadas sobre un texto o un estado JSON, con probabilidades calibradas y sin producir texto libre. Los tipos de pregunta son `choice` (hasta 255 opciones), `score` ordinal y `noul` (sí/no).

El modelo base es una torre de texto Qwen3.5-0.8B con preentrenamiento continuado en tailandés, a la que se añade una cabeza de decisión de 256 ranuras. Esta versión concreta convierte la torre, incluidos los embeddings de tokens, a MLX 4-bit afín con grupo 64 para Apple Silicon, mientras que la cabeza de 256 ranuras y las temperaturas por tipo de pregunta permanecen en fp32 en `head.safetensors`.

La relevancia práctica es doble: por un lado, ofrece clasificación estructurada con probabilidades en lugar de generación de texto (más barato, determinista y fácil de integrar en pipelines); por otro, reduce el peso a 424 MB y baja la latencia a unos 19 ms por decisión de tres preguntas en tailandés en un MacBook Pro M3 Max, frente a los ~150 ms del modelo original en PyTorch sobre MPS. Su licencia Apache-2.0 permite uso comercial sin restricciones adicionales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (torre de texto Qwen3.5-0.8B) con cabeza de decisión de 256 ranuras; modelo de decisión, no generativo |
| Parametros totales | 752.412.480 (752 M) segun safetensors |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | MLX 4-bit afín (group 64) para la torre y los embeddings; cabeza de decisión y temperaturas por tipo en fp32 |
| Idiomas soportados | tailandés (th), inglés (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (MLX); `head.safetensors` en fp32; tamano del repo 0,4 GB, pesos cuantizados 424 MB |
| Libreria | mlx (mlx-lm) |
| Pipeline declarado | text-classification |
| Modelo base | iapp/OpenThai-SystemOne (v0.3, commit f3709948) |

## Arquitectura y entrenamiento

La arquitectura consta de dos piezas ensambladas: una torre transformer Qwen3.5-0.8B que procesa el texto o el estado JSON de entrada, y una cabeza de decisión de 256 ranuras que se aplica sobre los estados ocultos finales. El modelo base incorpora preentrenamiento continuado en tailandés sobre la torre Qwen3.5, y las preguntas se formulan como tipos tipados (`choice`, `score`, `noul`) con temperaturas específicas por tipo. La salida son probabilidades calibradas por opción, no tokens generados.

En esta cuantización, MLX cuantiza la torre completa, incluida la tabla de embeddings, mientras que la cabeza de decisión y las temperaturas por tipo se mantienen en fp32. Según el autor, esto implica que la cuantización solo perturba el estado oculto que lee la cabeza. No hay información disponible en la documentación proporcionada sobre el número de tokens de entrenamiento, la composición del dataset, ni sobre si se aplicaron RLHF o DPO; el autor remite al repositorio del modelo base para los detalles de datos y entrenamiento.

## Capacidades

- Clasificación con opciones múltiples (`choice`) de hasta 255 opciones por pregunta, con distribución de probabilidades por opción.
- Puntuación ordinal (`score`), evaluada con exactitud de nivel exacto en los conjuntos de referencia.
- Respuestas de tipo `noul` (sí/no) sobre un texto o estado JSON.
- Razonamiento de una sola pasada: la respuesta se obtiene en un forward pass, sin cadena de pensamiento ni decodificación autoregresiva.
- Entrada multimodal en formato de datos: acepta texto libre y estados JSON.
- Multilingüe limitado a tailandés e inglés.
- No soporta generación de texto, tool calling, function calling ni razonamiento multi-paso; no es un modelo de agentes.
- Integración mediante cliente Python (`openthai_systemone.mlx_client.MLXSystemOneClient`) que carga la torre con MLX y aplica la cabeza sobre los estados ocultos finales.

## Casos de uso

- Moderación de comentarios en tailandés: clasificar toxicidad o tipo de comentario con el tipo `noul`; en `civil_comments` el modelo obtiene 80.3 de exactitud, por encima del original bf16 (79.0), lo que lo hace adecuado para filtrado previo en plataformas de contenido tailandesas.
- Enrutado de intención en atención al cliente: usar `choice` para asignar la consulta a una de las intenciones definidas; en `banking77` alcanza 52.1 de exactitud, suficiente para preclasificación barata antes de un LLM mayor.
- Extracción de etiquetas estructuradas desde JSON de estado: con hasta 255 opciones por pregunta y salida probabilística, permite construir taxonomías de etiquetado configurables sin reentrenar el modelo.
- Evaluación de calidad de resúmenes: el tipo `score` con `summeval-consistency` (80.6, +5.6 respecto al bf16 original) permite puntuar la consistencia factual de resúmenes generados en pipelines de documentación.
- Evaluación de relevancia en recuperación: `summeval-relevance` (25.0) sirve como señal ordinal complementaria dentro de un reranker, aunque su exactitud absoluta es baja y no debería usarse en solitario.
- Detección de implicación textual en tailandés: `xnli_th` (79.0 en `choice`, 86.0 en `noul`) y `sib200_th` (77.0) permiten construir guardarraíles de verificación en asistentes RAG en tailandés.
- Inferencia local con datos sensibles: al ejecutarse en Apple Silicon con MLX y 424 MB de pesos, permite procesar datos que no pueden salir del dispositivo, con ~19 ms por decisión de tres preguntas en un M3 Max.
- Selección de herramientas en asistentes: `xlam_tools` alcanza 99.4 de exactitud con el tipo `choice`, lo que lo habilita como clasificador de elección de herramienta antes de invocar una API.
- Preetiquetado de datos para anotación humana: la salida probabilística por opción permite priorizar muestras por incertidumbre en flujos de anotación activa.

## Benchmarks y rendimiento

Datos publicados por el autor: exactitud con un único orden de opciones sobre los primeros 800 registros de cada conjunto (`scripts/06_eval.py --limit 800`), los mismos registros para el original y la cuantización. Los subconjuntos `score` reportan exactitud de nivel exacto.

| Subconjunto | Original bf16 | Este modelo (MLX 4-bit) | Delta |
|---|---|---|---|
| aegis2 (noul) | 83.2 | 82.0 | -1.2 |
| boolq (noul) | 79.7 | 77.7 | -2.0 |
| civil_comments (noul) | 79.0 | 80.3 | +1.3 |
| helpsteer2 (score) | 41.6 | 41.6 | +0.0 |
| massive-de-DE (choice) | 88.3 | 79.4 | -8.9 |
| massive-en-US (choice) | 88.3 | 79.7 | -8.6 |
| multinli (choice) | 89.0 | 88.0 | -1.0 |
| paws (noul) | 94.0 | 92.4 | -1.6 |
| pubmedqa (choice) | 64.0 | 64.0 | +0.0 |
| squad2 (noul) | 89.3 | 87.0 | -2.3 |
| summeval-consistency (score) | 75.0 | 80.6 | +5.6 |
| summeval-relevance (score) | 21.7 | 25.0 | +3.3 |
| vitaminc-dev (choice) | 72.5 | 70.6 | -1.8 |
| Macro, banco publico de 13 subconjuntos | 74.3 | 72.9 | -1.3 |
| banking77 (choice) | 59.1 | 52.1 | -7.0 |
| contrastive_th (choice) | 80.7 | 80.4 | -0.3 |
| contrastive_th (noul) | 83.5 | 83.9 | +0.4 |
| contrastive_th (score) | 78.6 | 78.6 | +0.0 |
| massive_th (choice) | 90.6 | 87.5 | -3.1 |
| prachathai (choice) | 98.3 | 98.8 | +0.5 |
| prachathai (noul) | 93.4 | 92.7 | -0.8 |
| sib200_th (choice) | 77.9 | 77.0 | -1.0 |
| wisesight (choice) | 48.9 | 46.5 | -2.4 |
| wongnai (score) | 64.5 | 65.2 | +0.8 |
| xlam_tools (choice) | 99.4 | 99.4 | +0.0 |
| xnli_th (choice) | 79.8 | 79.0 | -0.8 |
| xnli_th (noul) | 86.8 | 86.0 | -0.8 |
| Macro, conjuntos tailandeses de evaluacion | 80.1 | 79.0 | -1.1 |

## Requisitos de hardware

- Pesos cuantizados: 424 MB en disco (repo de 0,4 GB); menos de 1 GB de memoria unificada para los pesos.
- Memoria total recomendada: 2-4 GB de memoria unificada contando runtime MLX, embeddings y activaciones; cualquier Mac con 8 GB o más es suficiente.
- Plataforma: exclusivamente Apple Silicon (MLX sobre Metal). No es ejecutable con CUDA ni ROCm en esta variante; para GPU NVIDIA o AMD habría que usar el modelo base en bf16 con PyTorch, cuya latencia declarada en MPS es de ~150 ms por decisión de tres preguntas.
- GPU recomendadas: no aplica GPU discreta; chips Apple M1, M2, M3 o M4 (probado en MacBook Pro M3 Max). No hay datos publicados para otros chips.
- Latencia: ~19 ms por decisión de tres preguntas en tailandés en un M3 Max con esta versión de 4 bits, frente a ~150 ms del original en PyTorch sobre MPS (mejora aproximada de 7,9x).
- Throughput: no disponible.
- Despliegue: `mlx-lm` para la torre más el cliente incluido en el repositorio (`openthai_systemone.mlx_client`) para aplicar la cabeza de decisión. Dependencias indicadas: `mlx-lm`, `torch`, `transformers`, `safetensors` y `pydantic`.
- No se proporcionan pesos GGUF, ni soporte para vLLM, TGI, Ollama o llama.cpp en la información disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Macro publico | Macro tailandes | Licencia | Formato |
|---|---|---|---|---|---|---|
| iapp/OpenThai-SystemOne-MLX-4bit | 752 M | no disponible | 72.9 | 79.0 | Apache-2.0 | MLX safetensors 4-bit |
| iapp/OpenThai-SystemOne (bf16, base) | 752 M | no disponible | 74.3 | 80.1 | Apache-2.0 | safetensors bf16 (PyTorch) |
| Otras alternativas de decision o clasificacion tailandesas de tamano similar | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |

Solo se dispone de datos comparativos frente al modelo base bf16 del que deriva esta cuantización. No hay información en la documentación proporcionada sobre otros modelos comparables de la misma categoría (modelos de decisión tipada o clasificadores tailandeses de ~750 M de parámetros).

## Limitaciones y advertencias

- La cuantización degrada la exactitud: -1.3 puntos de macro en el banco público de 13 subconjuntos y -1.1 puntos en el macro tailandés respecto al bf16 original.
- Degradación muy desigual: caídas de -8.9 en `massive-de-DE` y -8.6 en `massive-en-US`, frente a mejoras de +5.6 en `summeval-consistency` y +1.3 en `civil_comments`. El comportamiento en tareas multilingües de elección es notablemente peor que en el original.
- Capacidades absolutas bajas en algunas tareas: `summeval-relevance` 25.0, `helpsteer2` 41.6, `wisesight` 46.5 y `banking77` 52.1. No son adecuadas para decisiones automatizadas sin revisión humana.
- No es un modelo generativo: no produce texto, no soporta tool calling, function calling ni razonamiento multi-paso. Usarlo como LLM de chat es un error de uso.
- Calibración no verificada: la evaluación publicada usa un único orden de opciones sobre los primeros 800 registros de cada conjunto; no se aportan métricas de calibración ni de sensibilidad al orden de las opciones.
- Cobertura de idiomas limitada a tailandés e inglés. El modelo base usa una torre con preentrenamiento continuado en tailandés, por lo que el rendimiento en inglés es sensiblemente inferior al de modelos nativos en inglés.
- Longitud de contexto no documentada, lo que impide planificar despliegues con entradas largas.
- Sesgos: la composición del dataset de entrenamiento no está disponible en la información proporcionada, por lo que no se pueden evaluar sesgos sistemáticos por dominio, registro o demografía.
- Riesgo de alucinación: al no generar texto, el riesgo se traslada a probabilidades mal calibradas o a respuestas seguras pero incorrectas en dominios fuera de su distribución (por ejemplo, dominios técnicos o médicos).
- Validación comunitaria mínima: el repositorio registra 0 descargas y 0 likes en el momento de la consulta, y la fecha de creación indicada (2026-09-25) no permite contrastar adopción ni mantenimiento.
- Requisito de plataforma: la variante MLX solo se ejecuta en Apple Silicon; desplegarla en servidores con GPU NVIDIA o AMD exige usar el modelo base en otro formato.
- Licencia Apache-2.0, igual que el modelo base, sin restricciones adicionales conocidas para uso comercial.
- La cabeza de decisión debe cargarse por separado en fp32; un uso que ignore `head.safetensors` no reproduce los resultados publicados.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/iapp/OpenThai-SystemOne-MLX-4bit
- Modelo base (OpenThai-SystemOne, v0.3, commit f3709948): https://huggingface.co/iapp/OpenThai-SystemOne
- Repositorio de mlx-lm: https://github.com/ml-explore/mlx-lm
- Resultados de la busqueda web: no se han encontrado enlaces relevantes al modelo; las coincidencias corresponden a la International Association of Privacy Professionals (iapp.org, prod.iapp.org, myiapp.org, en.wikipedia.org/wiki/International_Association_of_Privacy_Professionals) y no guardan relacion con este modelo.
