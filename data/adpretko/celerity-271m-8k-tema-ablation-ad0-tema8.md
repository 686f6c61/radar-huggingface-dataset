# adpretko/celerity-271m-8k-tema-ablation-ad0-tema8

## Resumen

Celerity 271M 8K — TEMA ablation — ad0_tema_mult8 es un checkpoint de investigación de 271 millones de parámetros publicado por el usuario adpretko en Hugging Face. Se trata de una conversión al formato de Hugging Face de un checkpoint originalmente entrenado en formato Cerebras CS, dentro de la familia de experimentos Celerity, concretamente del experimento denominado `ad0_tema_mult8` (checkpoint de origen `checkpoint_13773.mdl`).

El modelo no es un lanzamiento de producto, sino una ablación de hiperparámetros: mantiene fija la tasa de aprendizaje de pico en 0,15 y el tamaño de batch global en 48, y varía el multiplicador de tau-EMA (8 veces respecto a la referencia de 0,1745, con tau_ema final de 1,396), ajustando la weight decay en consecuencia (0,0003467). El interés de este checkpoint es académico: permite aislar el efecto de la dinámica de EMA sobre los pesos aprendidos en un transformer decoder-only de contexto largo (8.192 tokens) con embeddings posicionales ALiBi.

La relevancia es limitada fuera del ámbito de la investigación en recetas de entrenamiento: el modelo no declara licencia, idiomas, pipeline ni resultados de evaluación. Su repo ocupa 0,5 GB y requiere cargar código de modelado personalizado del autor mediante `trust_remote_code=True`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only de la familia Celerity, con embeddings posicionales ALiBi |
| Parametros totales | 271 millones (271M) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | 8.192 tokens (longitud maxima de secuencia de entrenamiento) |
| Tipos de cuantizacion | no disponible (no se declaran en la model card ni en las etiquetas) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | no disponible (checkpoint convertido desde el formato Cerebras CS; el repo ocupa 0,5 GB) |
| Desarrollador | adpretko (usuario de Hugging Face) |
| Nombre del experimento | ad0_tema_mult8 (checkpoint de origen checkpoint_13773.mdl) |
| Fecha de publicacion en el Hub | 2026-10-04, segun metadatos del repositorio |
| Descargas / likes | 0 / 0 en el momento de la consulta |
| Etiquetas del repo | pytorch, celerity, custom_code, region:us |

## Arquitectura y entrenamiento

La arquitectura es un transformer decoder-only autorregresivo con embeddings posicionales de tipo ALiBi y una longitud máxima de secuencia de 8.192 tokens. El modelo utiliza código de modelado propio de Celerity (`custom_code`), por lo que su carga exige `trust_remote_code=True`; no se documenta el número de capas, la dimensión oculta, el número de cabezas de atención ni el tamaño de vocabulario.

Los detalles de entrenamiento disponibles son exclusivamente hiperparámetros de la ablación: 13.773 pasos de entrenamiento, batch de entrenamiento global de 48, batch de validación de 32, tasa de aprendizaje de pico 0,15, weight decay 0,00034673267902102944, tau_ema 1,396 (multiplicador de tau-EMA de 8 respecto a la referencia de 0,1745), attention dropout 0 con planificación constante, residual dropout 0,0, stochastic depth 0,0 y LayerDrop 0,0. El runtime de origen es cbcore 2.6.0 y la conversión se realizó con el commit `0e3d5d375695293479df9d2a3717f05f71a345b4`.

No se especifica la composición del dataset de entrenamiento, el número de tokens vistos, ni si hubo fases de ajuste por RLHF, DPO o instrucciones. Tampoco se describe ninguna innovación técnica adicional más allá del propio mecanismo de tau-EMA objeto de la ablación. La model card aclara que attention dropout, tau_ema y weight decay son hiperparámetros de entrenamiento cuyos efectos ya están incorporados en los pesos, y que la evaluación en Hugging Face se realiza con dropout desactivado mediante `model.eval()`.

## Capacidades

- Generación de texto autorregresiva: es un modelo de lenguaje causal, por lo que su capacidad documentada se limita a la continuación de texto.
- Procesamiento de contexto largo: soporta secuencias de hasta 8.192 tokens gracias a los embeddings ALiBi.
- Base para fine-tuning: por su tamaño (271M) y su contexto de 8K, puede servir como punto de partida para ajuste en dominios concretos.
- Objeto de estudio de la ablación: permite reproducir y comparar el efecto del multiplicador de tau-EMA sobre los pesos finales.
- Soporte de tool calling / function calling: no disponible, no se documenta.
- Soporte de agentes y razonamiento multi-paso: no disponible, no se documenta.
- Capacidades multilingües: no disponible, no se declara ningún idioma.
- Capacidades especiales (modo thinking, visión, audio): no disponible, no se documenta ninguna.
- No se declara ningún ajuste por instrucciones, por lo que no hay evidencia de comportamiento conversacional optimizado.

## Casos de uso

- Investigación en recetas de entrenamiento: comparar este checkpoint (`ad0_tema_mult8`) con los otros checkpoints de la misma familia (por ejemplo `ad0p1` o `residual-dropout-0p2`) permite aislar el efecto del multiplicador de tau-EMA y de la weight decay sobre los pesos aprendidos.
- Reproducibilidad experimental: al publicar los hiperparámetros exactos (13.773 pasos, batch 48, LR 0,15, tau_ema 1,396), el checkpoint sirve como referencia verificable dentro de un estudio de ablaciones.
- Prototipado en hardware muy limitado: con 271M de parámetros, el modelo se puede cargar en GPU de gama de entrada o incluso en CPU para pruebas de integración, sin necesidad de infraestructura de datacenter.
- Experimentos de modelado de lenguaje en documentos largos: la ventana de 8.192 tokens permite trabajar con artículos, informes o capítulos completos sin truncado agresivo, siempre que se acepte la ausencia de evaluación publicada.
- Fine-tuning de dominio sobre corpus propios: el tamaño reducido abarata el ajuste supervisado para tareas de clasificación de secuencias o generación acotada sobre datos internos.
- Análisis de representaciones internas: útil para estudios de interpretabilidad y de dinámica de pesos en modelos pequeños con contexto extendido.
- Destilación y experimentos académicos: puede actuar como modelo profesor o alumno en ejercicios de compresión, dado su coste computacional bajo.
- Advertencia de uso: al no existir benchmarks, licencia declarada ni fases de alineación documentadas, no se recomienda su uso en producción orientada a usuario final.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- Peso de los pesos en memoria (estimacion a partir del numero de parametros, 271M): aproximadamente 1,08 GB en fp32, 0,54 GB en fp16/bf16, 0,27 GB en int8 y 0,14 GB en int4.
- KV cache: no disponible. Al no documentarse el número de capas, dimensión oculta ni cabezas, no es posible estimar el coste de la caché a 8.192 tokens; en contextos largos esta caché puede superar el tamaño de los propios pesos.
- GPU recomendadas: no disponible en la documentación. Por tamaño, cualquier GPU con 4 GB o más de VRAM es suficiente para inferencia. No se dispone de datos específicos sobre A100, H100 o RTX 4090 para este checkpoint.
- Compatibilidad con GPU de consumo: sí, previsiblemente cabe en cualquier GPU de consumo moderna (RTX 3060, RTX 4060, RTX 4090) e incluso en equipos con GPU integrada, en función de la precisión elegida.
- Opciones de despliegue: carga mediante PyTorch con `transformers` y `trust_remote_code=True`, que es el método documentado. No se confirma compatibilidad con vLLM, llama.cpp, Ollama, TGI ni otras plataformas, ya que el modelo usa código de modelado personalizado y no se declaran formatos GGUF o equivalentes.
- Latencia y throughput estimados: no disponible. No se publican mediciones de tokens por segundo ni de tiempo hasta el primer token.

## Comparativa con modelos similares

No hay datos de benchmarks ni especificaciones completas que permitan una comparativa de rendimiento fiable. La comparación más pertinente es con otros checkpoints de la misma familia de ablaciones del mismo autor, que comparten tamaño (271M) y contexto (8K):

| Modelo | Parametros | Contexto | Hiperparametro diferenciador | Licencia | Benchmarks |
|---|---|---|---|---|---|
| adpretko/celerity-271m-8k-tema-ablation-ad0-tema8 (este) | 271M | 8.192 | Attention dropout 0, tau-EMA mult 8 | no disponible | no disponible |
| adpretko/celerity-271m-8k-ad0p1 | 271M | 8K (segun su model card) | Attention dropout 0,1 | no disponible | no disponible |
| adpretko/celerity-271m-8k-residual-dropout-0p2 | 271M | 8K (segun su model card) | Residual dropout 0,2 | no disponible | no disponible |
| Otras familias de ~270M (Pythia, GPT-2 medium, etc.) | no disponible | no disponible | no aplica | no disponible | no disponible |

No se dispone de información para comparar con alternativas de otros desarrolladores en términos de rendimiento, licencia o disponibilidad.

## Limitaciones y advertencias

- Es un checkpoint de ablación, no un modelo final: su propósito es comparar hiperparámetros, no ofrecer calidad de generación optimizada.
- Ausencia total de evaluación: no hay resultados de MMLU, HumanEval, GSM8K, perplexity ni ninguna otra métrica publicada, lo que impide estimar su calidad real.
- Licencia no declarada: al no especificarse licencia, el uso comercial queda en un limbo legal y no debería asumirse permitido.
- Idiomas no declarados: se desconoce qué lenguas ha visto durante el entrenamiento y con qué cobertura.
- Datos de entrenamiento no documentados: no se indica la composición del corpus, por lo que no se pueden evaluar sesgos, contaminación de benchmarks ni riesgos de contenido.
- Sin fases de alineación documentadas: no se menciona RLHF, DPO ni ajuste por instrucciones, por lo que es esperable un comportamiento poco alineado con instrucciones y propenso a salidas incoherentes o alucinaciones.
- Riesgo de alucinación: inherente a cualquier modelo de lenguaje causal sin ajuste de instrucciones ni verificación factual.
- Código remoto: requiere `trust_remote_code=True`, lo que implica ejecutar código de modelado proporcionado por el autor; conviene revisar ese código antes de ejecutarlo en entornos con datos sensibles.
- Restricciones de contexto: los 8.192 tokens son la longitud máxima de entrenamiento; no hay información sobre el comportamiento más allá de esa ventana, aunque ALiBi suele extrapolar de forma razonable.
- Portabilidad: al no publicarse formatos GGUF cuantizados, su uso con herramientas como llama.cpp u Ollama no está garantizado.
- Metadatos anómalos: la fecha de creación registrada (2026-10-04) y el contador de descargas (0) sugieren que el repositorio es reciente y prácticamente sin uso verificado por terceros.
- Trazabilidad limitada: se desconoce el tamaño de vocabulario, la configuración de capas y la tokenizador asociado, datos necesarios para reproducir el entrenamiento desde cero.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/adpretko/celerity-271m-8k-tema-ablation-ad0-tema8
- Checkpoint hermano con attention dropout 0,1: https://huggingface.co/adpretko/celerity-271m-8k-ad0p1
- Checkpoint hermano con residual dropout 0,2: https://huggingface.co/adpretko/celerity-271m-8k-residual-dropout-0p2
- https://www.celeritytek.com/ — enlace devuelto por la búsqueda web; corresponde a una empresa de distribución audiovisual por fibra óptica y no guarda relación con este modelo.
- Paper, repositorio de código, blog o demo oficiales: no disponible en la información proporcionada.
