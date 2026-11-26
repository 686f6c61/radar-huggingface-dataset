# CobuildX-AI/cbx-indim-profanity-detector-32M

## Resumen

cbx-indim-profanity-detector-32M es un modelo de clasificación de texto multietiqueta especializado en detectar contenido ofensivo en 12 idiomas de la India (hindi, bengalí, maratí, tamil, telugu, kannada, malayo, guyaratí, panyabí, odia, asamés y urdu) además de inglés. Lo desarrolla CobuildX-AI como un ajuste fino de su modelo base InDIM-small (32M parámetros), y devuelve no solo un indicador global de ofensividad sino también las razones: `profanity`, `insult`, `hate` y `sexual`. Está pensado para moderación de contenido en plataformas con audiencias del sur de Asia, donde el texto aparece en escritura nativa, romanizada o mezclada con inglés (code-mixed).

La relevancia del modelo está en su relación coste-rendimiento: con solo 31,5 millones de parámetros procesa un comentario corto en unos 6 ms en CPU (8 hilos, PyTorch fp32), lo que permite desplegarlo en infraestructura modesta o en el borde. Empaqueta pesos en safetensors y ONNX, y su licencia Apache 2.0 facilita el uso comercial. No es un modelo generativo: es un codificador tipo ModernBERT para extracción de características y clasificación.

La arquitectura es un transformer encoder (ModernBERT) con cabezas de clasificación múltiple. Su ventana de entrada es de 256 tokens y ofrece utilidades para trocear documentos largos. El punto débil declarado por el propio autor es la etiqueta `hate`, con una precisión baja (0,38) que refleja la dificultad de distinguir discurso de odio de crítica legítima en un conjunto de datos etiquetado por LLM sin revisión humana.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer encoder (ModernBERT) con cabezas de clasificación multietiqueta |
| Parámetros totales | 31.493.381 (≈32M) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | 256 tokens por fragmento; función `classify_document` para textos largos |
| Tipos de cuantización | no disponible (se distribuyen pesos fp32 en safetensors y ONNX fp32) |
| Idiomas soportados | hi, bn, mr, ta, te, kn, ml, gu, pa, or, as, ur, en |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors, ONNX (`onnx/model.onnx`, fp32) |

## Arquitectura y entrenamiento

El modelo parte de InDIM-small, un encoder ModernBERT de 32M parámetros, y se ajusta con aprendizaje supervisado plano para una tarea de clasificación multietiqueta con cinco salidas: cuatro categorías específicas (`profanity`, `insult`, `hate`, `sexual`) y una etiqueta global `offensive` entrenada como cabeza separada. Los umbrales de decisión se ajustan sobre un conjunto de validación, y la tasa de aprendizaje se selecciona también en validación. No se menciona entrenamiento con RLHF ni DPO.

Los datos de entrenamiento no se detallan en la información disponible (número de tokens, composición exacta del corpus). El conjunto de evaluación gold contiene 3.980 textos nunca vistos en entrenamiento: unos 300 comentarios de redes sociales por idioma (sin datos para guyaratí, panyabí, odia y asamés) y unos 107 pasajes web por idioma índico. El etiquetado se realizó con dos LLM de forma independiente siguiendo una guía escrita, con un tercero resolviendo desacuerdos; ningún humano revisó las etiquetas gold, lo que introduce ruido en las métricas. También se evalúa con Hindi HateCheck (Röttger et al., 2022).

La innovación principal no es arquitectónica sino de eficiencia: el modelo está diseñado para inferencia en CPU con latencia de milisegundos y se ofrece una implementación ONNX que reproduce las mismas decisiones que PyTorch en 1.000 de 1.000 textos gold.

## Capacidades

- Clasificación multietiqueta de texto ofensivo con cinco salidas: `profanity`, `insult`, `hate`, `sexual` y `offensive` (global).
- Soporte de escritura nativa, romanizada y texto code-mixed (índico + inglés).
- Procesamiento de documentos largos mediante troceado en fragmentos de 256 tokens y agregación por puntuación máxima por etiqueta.
- Inferencia en CPU y GPU; implementación ONNX Runtime disponible.
- Detección de texto sexual explícito y publicidad de contenido para adultos.
- Distinción entre palabras malsonantes usadas como insulto y menciones o discusiones de esas palabras (el modelo está entrenado para considerar limpio el texto que solo menciona o discute un término).
- No es un modelo generativo: no produce texto, no soporta tool calling ni razonamiento multi-paso.

## Casos de uso

- Moderación de comentarios en tiempo real: con 6,2 ms por comentario corto en CPU, el modelo puede filtrar flujos de comentarios en plataformas sociales sin GPU dedicada, marcando primero con `offensive` y clasificando después la razón con las cuatro etiquetas.
- Prefiltrado en pipelines de revisión humana: usar `offensive` (recall 0,91) para derivar casos a moderadores y las etiquetas específicas para priorizar la cola según tipo de infracción.
- Moderación de contenido en aplicaciones de chat para el sur de Asia: el soporte de texto romanizado y code-mixed permite detectar abuso en mensajes informales donde el hindi o el tamil se escriben con caracteres latinos mezclados con inglés.
- Filtrado de reseñas y foros comunitarios: el modelo distingue entre crítica legítima (reseñas negativas, discusión de políticas) y ataques personales, reduciendo falsos positivos en secciones de opinión.
- Análisis de toxicidad a escala para investigación: al ser un modelo de 32M con licencia Apache 2.0, se puede ejecutar sobre corpus grandes en CPU para estudiar prevalencia de abuso por idioma y plataforma.
- Detección de spam sexual y anuncios de contenido para adultos: la etiqueta `sexual` alcanza F1 0,86 y PR-AUC 0,92, adecuada para bloquear anuncios de escort o sex-chat en secciones de comentarios.
- Integración en APIs de moderación como servicio: el formato ONNX y la compatibilidad con text-embeddings-inference permiten desplegarlo como endpoint ligero en contenedores sin dependencias pesadas.

## Benchmarks y rendimiento

Resultados sobre el conjunto gold de 3.980 textos (media de 3 ejecuciones de entrenamiento, salvo donde se indica). Macro F1 y porcentaje de textos limpios marcados erróneamente:

| Modelo | Parámetros | profanity | insult | hate | sexual | offensive | Macro F1 | Textos limpios marcados ↓ | HateCheck-hi hate F1 / PR-AUC |
|---|---|---:|---:|---:|---:|---:|---:|---:|---:|
| **InDIM-small (base de este modelo)** | **32M** | 0,709 | 0,640 | 0,436 | 0,851 | 0,880 | 0,703 | 5,9% | 0,31 / 0,749 |
| mmBERT-small | 140M | 0,751 | 0,676 | 0,460 | 0,851 | 0,887 | 0,725 | 5,3% | 0,36 / 0,742 |
| mmBERT-base (1 ejecución) | 307M | 0,753 | 0,691 | 0,505 | 0,873 | 0,889 | 0,742 | 3,9% | 0,53 / 0,759 |
| IndicBERT v2 | 278M | 0,690 | 0,719 | 0,450 | 0,863 | 0,888 | 0,722 | 4,7% | 0,41 / 0,744 |

Métricas del checkpoint publicado en este repositorio (mejor puntuación de validación): macro F1 gold 0,688, textos limpios marcados 7,7%, recall de hate en HateCheck-hi 0,26. Precisión, recall, F1 y PR-AUC por etiqueta del checkpoint publicado:

| Etiqueta | Precisión | Recall | F1 | PR-AUC |
|---|---:|---:|---:|---:|
| `profanity` | 0,95 | 0,53 | 0,68 | 0,87 |
| `insult` | 0,86 | 0,46 | 0,60 | 0,82 |
| `hate` | 0,38 | 0,46 | 0,42 | 0,39 |
| `sexual` | 0,90 | 0,82 | 0,86 | 0,92 |
| `offensive` | 0,85 | 0,91 | 0,88 | 0,95 |

Latencia en CPU (Intel i7-10700, 8 hilos, un texto a la vez, PyTorch fp32): 6,2 ms para un comentario de 28 tokens y 24 ms para un fragmento completo de 256 tokens.

## Requisitos de hardware

- VRAM estimada para inferencia: menos de 1 GB en fp32 (31,5M parámetros); en la práctica cabe en cualquier GPU consumer e incluso en CPU.
- GPU recomendadas: no requiere GPU; cualquier GPU moderna (RTX 3060 o superior, A100, H100) acelera el throughput, pero el caso de uso declarado es CPU.
- Cabe en GPU consumer: sí, en todas las GPU con al menos 1 GB de memoria; también en entornos sin GPU.
- Opciones de despliegue: PyTorch con Transformers, ONNX Runtime (`onnx/model.onnx`), text-embeddings-inference (según los tags del repositorio). No se mencionan integraciones con vLLM, llama.cpp ni Ollama, que no aplican a un encoder de clasificación.
- Latencia y throughput: 6,2 ms por comentario de 28 tokens y 24 ms por fragmento de 256 tokens en CPU (i7-10700, 8 hilos, fp32). El throughput en GPU no está documentado en la información disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Macro F1 (gold) | Textos limpios marcados | Licencia | Disponibilidad |
|---|---|---:|---:|---:|---|---|
| cbx-indim-profanity-detector-32M | 32M | 256 tokens | 0,688 (checkpoint publicado) / 0,703 (media) | 7,7% / 5,9% | Apache 2.0 | Hugging Face (safetensors + ONNX) |
| mmBERT-small | 140M | no disponible | 0,725 | 5,3% | no disponible | Hugging Face |
| mmBERT-base | 307M | no disponible | 0,742 | 3,9% | no disponible | Hugging Face |
| IndicBERT v2 | 278M | no disponible | 0,722 | 4,7% | no disponible | Hugging Face |

El modelo sacrifica entre 2 y 4 puntos de macro F1 frente a alternativas de 140M a 307M parámetros, con mayor tasa de falsos positivos sobre texto limpio, a cambio de un tamaño 4-10 veces menor y latencia en CPU de milisegundos. En ranking de casos de HateCheck (PR-AUC 0,749) queda a la par de mmBERT-base, pero con menor recall al umbral ajustado.

## Limitaciones y advertencias

- La etiqueta `hate` tiene precisión muy baja (0,38) y PR-AUC de 0,39: no es fiable como único criterio para sancionar discurso de odio.
- Las cuatro etiquetas específicas son precisas pero con recall bajo (0,46-0,53 en `profanity` e `insult`); se recomienda usar `offensive` como disparador y las etiquetas como explicación.
- El 7,7% de los textos limpios del checkpoint publicado se marcan erróneamente con alguna etiqueta, lo que puede generar fricción en moderación automatizada.
- Las etiquetas gold fueron generadas por LLM sin revisión humana, por lo que las métricas contienen errores y no deben tratarse como verdad absoluta.
- El modelo juzga solo el texto: no ve la conversación, la imagen ni el vídeo a los que se refiere el comentario, lo que limita la detección de ironía, contexto y referencias implícitas.
- Ventana de 256 tokens: los textos más largos se truncan; para documentos hay que usar `classify_document` con agregación por máxima puntuación.
- Cobertura desigual: no hay datos de comentarios etiquetados para guyaratí, panyabí, odia y asamés, por lo que el rendimiento en esos idiomas es menos fiable.
- Riesgo de sesgo por el dominio de entrenamiento (comentarios de redes sociales y pasajes web); el rendimiento puede degradarse en registros formales, técnicos o literarios.
- Licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantías sobre idoneidad para decisiones automatizadas de sanción; se recomienda supervisión humana en casos límite.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/CobuildX-AI/cbx-indim-profanity-detector-32M
- Modelo base InDIM-small: https://huggingface.co/CobuildX-AI/InDIM-small
- Hindi HateCheck (Röttger et al., 2022): referencia citada en la model card; enlace directo no disponible en la información proporcionada.
