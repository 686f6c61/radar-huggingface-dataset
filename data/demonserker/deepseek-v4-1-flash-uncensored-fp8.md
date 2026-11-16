# demonserker/DeepSeek-V4.1-Flash-UNCENSORED-FP8

## Resumen

DeepSeek-V4.1-Flash-UNCENSORED-FP8 es una versión modificada del checkpoint base `deepseek-ai/DeepSeek-V4.1-Flash`, publicada por el usuario demonserker bajo el paraguas de "dealignai". La modificación consiste en una "abliteración" a nivel de pesos: se elimina quirúrgicamente el circuito de rechazo del modelo base manteniendo intactos el resto de componentes (expertos enrutados, torre de visión, cabezas de draft, embeddings y normas). El resultado es un checkpoint estándar que se carga exactamente igual que el modelo original, sin hooks en tiempo de ejecución ni vectores de steering.

El modelo conserva la arquitectura del base: un backbone causal encoder-decoder de 20+20 capas con mezcla de expertos (384 expertos enrutados con top-6 más un experto compartido), Hyper-Connections de 4 canales residuales, atención dispersa CSA2, memoria de n-gramas Engram y una cabeza de draft especulativa DSpark. Los pesos se mantienen en FP8 (`e4m3fn`) con escalas de bloque E8M0 [32, 32] y expertos enrutados en FP4, sin alterar la cuantización nativa. El contexto anunciado es de 1M de tokens y el pipeline es image-text-to-text, con una torre de visión DeepSeek-ViT con 2D-RoPE y pixel unshuffle.

El dato de safetensors reporta 763.205.315.794 parámetros totales en el repo, aunque la model card describe el backbone como de 552B con 8B/16B activos por token; la discrepancia no queda explicada en la información disponible. El repo ocupa 510,3 GB y se distribuye bajo licencia MIT. Es relevante ahora porque combina tres elementos poco habituales en un único checkpoint: contexto de un millón de tokens, modalidad de imagen y texto, y eliminación de guardarraíles de seguridad, lo que lo convierte en un artefacto de alto interés técnico y de alto riesgo operativo.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Causal encoder-decoder (20+20 capas), MoE (384 expertos enrutados top-6 + 1 compartido), Hyper-Connections (4 canales residuales), atención dispersa CSA2, memoria Engram n-gram, draft especulativo DSpark |
| Parámetros totales | 763.205.315.794 según safetensors; la model card indica 552B de backbone |
| Parámetros activos | 8B/16B activos por token (según model card) |
| Longitud de contexto | 1M tokens |
| Tipos de cuantización | FP8 (`e4m3fn`) con escalas de bloque E8M0 [32, 32]; expertos enrutados en FP4; 8-bit |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors (librería transformers) |

## Arquitectura y entrenamiento

La arquitectura replica la del modelo base DeepSeek-V4.1-Flash: un encoder-decoder causal de 20+20 capas con mezcla de expertos de grano fino (384 expertos enrutados, activación top-6, más un experto compartido), Hyper-Connections de 4 canales en las conexiones residuales, atención dispersa CSA2 y una memoria de n-gramas Engram. Incorpora además una cabeza de draft especulativa DSpark (MTP) para decodificación especulativa, y una torre de visión DeepSeek-ViT con 2D-RoPE y pixel unshuffle para entrada multimodal. La cuantización es nativa: pesos FP8 `e4m3fn` con escalas de bloque E8M0 [32, 32] y expertos enrutados en FP4.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si el modelo base empleó RLHF o DPO. La modificación de esta versión es exclusivamente a nivel de pesos: según la model card, se elimina el "circuito de rechazo" manteniendo byte-idénticos los expertos enrutados, la memoria Engram, la atención CSA2, la cabeza DSpark, la torre de visión, las puertas del router, las normas y los embeddings. No hay `model.py` personalizado, hooks en tiempo de ejecución ni vectores de steering.

## Capacidades

- Generación de texto y razonamiento multi-turno con coherencia mantenida a lo largo de conversaciones.
- Modo de razonamiento ("reasoning-max") configurable, con trazas de razonamiento verificables.
- Capacidades multimodales de imagen y texto (pipeline image-text-to-text) mediante torre de visión DeepSeek-ViT.
- Soporte de tools y function calling (etiqueta `endpoints_compatible`).
- Decodificación especulativa mediante la cabeza de draft DSpark (MTP).
- Memoria de n-gramas Engram para recuperación de patrones léxicos.
- Contexto extendido de hasta 1M de tokens.
- Alineamiento eliminado: el modelo responde a solicitudes que el base rechazaría, según las métricas de HarmBench reportadas por el autor.

## Casos de uso

- Investigación sobre alineamiento y seguridad: el checkpoint permite estudiar el comportamiento de un modelo con el circuito de rechazo eliminado frente al base, con trazas de razonamiento comparables en modo effort=max.
- Evaluación de robustez de clasificadores de seguridad: sirve como generador adversario controlado para probar filtros y guardarraíles de terceros sobre respuestas que el modelo base rechazaría.
- Análisis de degradación de conocimiento tras abliteración: la tabla MMLU-14k por asignatura permite medir qué áreas pierden rendimiento al eliminar el comportamiento de rechazo.
- Procesamiento de documentos largos multimodales: con 1M tokens de contexto y entrada de imagen, admite flujos que combinan capturas, diagramas y texto extenso en una sola ventana.
- Experimentación con decodificación especulativa: la cabeza DSpark permite medir aceleración de throughput en pipelines de transformers con generación autoregresiva.
- Estudio de arquitecturas MoE dispersas: los 384 expertos con top-6 y atención CSA2 sirven para analizar enrutamiento y eficiencia en cargas de inferencia distribuidas.
- Escenarios de red teaming autorizado: útil en entornos controlados para generar respuestas que el base filtraría, siempre con revisión legal y de cumplimiento previa.

## Benchmarks y rendimiento

Datos publicados por el autor del checkpoint (evaluación propia, no revisada por pares):

| Evaluación | Base | CRACK (este modelo) | Delta |
|---|---:|---:|---:|
| HarmBench-320, effort=off (ASR) | 137/320 = 42,81 % | 320/320 = 100,00 % | +57,19 pp |
| HarmBench-320, effort=max (ASR) | 5/320 = 1,56 % | 320/320 = 100,00 % | +98,44 pp |
| MMLU-14k (accuracy) | 12.211/14.042 = 86,96 % | 11.619/14.042 = 82,74 % | -4,22 pp |
| MMLU-14k sin cluster de ética (~11k ítems) | no disponible | no disponible | -1,1 pp |

Por categoría de HarmBench (effort=off / effort=max, CRACK): chemical_biological 100,0 % / 100,0 %; copyright 100,0 % / 100,0 %; cybercrime_intrusion 100,0 % / 100,0 %; harassment_bullying 100,0 % / 100,0 %; harmful 100,0 % / 100,0 %; illegal 100,0 % / 100,0 %; misinformation_disinformation 100,0 % / 100,0 %.

En MMLU por asignatura, las mayores caídas reportadas son moral scenarios (-39,89 pp), professional law (-7,04 pp) y abstract algebra (-6,00 pp). No se han publicado resultados de benchmarks adicionales (HumanEval, GSM8K, MMLU-Pro, etc.) en la información disponible.

## Requisitos de hardware

- VRAM estimada: el repo ocupa 510,3 GB en safetensors; con 763.205.315.794 parámetros en FP8, la inferencia requiere del orden de 700-800 GB de memoria de pesos, más overhead de activaciones y caché KV para contexto largo.
- GPU recomendadas: clústeres multi-GPU con H100 (80 GB) o H200; no es viable en una única GPU consumer.
- Cabe en consumer GPU: no. Ni en RTX 4090 (24 GB) ni en configuraciones multi-GPU de consumo convencionales.
- Opciones de despliegue: transformers (librería declarada); vLLM, TGI, llama.cpp u Ollama no están confirmados como compatibles en la información disponible.
- Latencia y throughput: no disponible. La decodificación especulativa DSpark está pensada para reducir latencia, pero no se publican cifras.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Modalidad | Licencia | Notas |
|---|---|---|---|---|---|
| DeepSeek-V4.1-Flash-UNCENSORED-FP8 (este) | 763,2B (safetensors) / 552B backbone | 1M | Imagen + texto | MIT | Abliterado, FP8/FP4 |
| deepseek-ai/DeepSeek-V4.1-Flash (base) | 552B backbone, 8B/16B activos | 1M | Imagen + texto | no disponible | Guardarraíles intactos; MMLU 86,96 % |
| Alternativas abliteradas de otros autores | no disponible | no disponible | no disponible | no disponible | No se dispone de comparables verificables |
| Modelos MoE de ~500B con contexto largo | no disponible | no disponible | no disponible | no disponible | No se dispone de datos en la información proporcionada |

## Limitaciones y advertencias

- Eliminación deliberada de guardarraíles: la model card reporta 100 % de ASR en HarmBench-320 en las siete categorías, incluidas chemical_biological, cybercrime_intrusion e illegal. El uso en producción con usuarios finales es de alto riesgo legal y reputacional.
- Degradación de conocimiento: MMLU cae 4,22 pp globalmente y 39,89 pp en moral scenarios; el comportamiento en tareas éticas y legales queda sustancialmente alterado.
- Riesgo de alucinación: no se publican evaluaciones de factualidad ni de calibración; el modo de razonamiento puede producir trazas que justifican respuestas incorrectas.
- Idiomas: no se especifican los idiomas soportados; no hay datos de rendimiento multilingüe.
- Licencia MIT: permite uso comercial, pero el autor no ofrece garantías sobre el cumplimiento normativo derivado del contenido que el modelo puede generar.
- Discrepancia de parámetros: safetensors declara 763,2B mientras la model card describe 552B de backbone; conviene verificar el conteo real antes de dimensionar infraestructura.
- Compatibilidad de despliegue no confirmada con vLLM, TGI o llama.cpp; solo transformers está declarado.
- Contexto de 1M tokens: la caché KV a esa longitud exige memoria adicional significativa no cuantificada en la información disponible.
- Procedencia: autor individual (demonserker), 0 descargas y 0 likes en el momento de la consulta; sin revisión independiente de las métricas reportadas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/demonserker/DeepSeek-V4.1-Flash-UNCENSORED-FP8
- Modelo base: https://huggingface.co/deepseek-ai/DeepSeek-V4.1-Flash
- Perfil del autor en X: https://x.com/dealignai
- Perfil del coautor en X: https://x.com/jordanschenck
