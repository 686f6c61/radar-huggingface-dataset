# RL-Forgetting-Experiments-3/qwen2.5-3b-kk-sft-replay-uniform-lam1-all-checkpoints

## Resumen

El modelo `qwen2.5-3b-kk-sft-replay-uniform-lam1-all-checkpoints` es un artefacto de investigación publicado por el usuario RL-Forgetting-Experiments-3. Consiste en un ajuste supervisado (SFT) del modelo base denso Qwen2.5-3B sobre la tarea de razonamiento lógico "knights and knaves" (caballeros y escuderos, acertijos de veracidad en los que unos personajes siempre dicen la verdad y otros siempre mienten), aplicando una estrategia de *replay* con ponderación uniforme (lambda = 1). El objetivo del experimento es medir el olvido catastrófico: cómo el ajuste sobre una tarea estrecha degrada las capacidades generales del modelo original y en qué medida el *replay* de datos previos lo mitiga.

El repositorio no contiene un único modelo, sino todos los checkpoints validados de esta rama experimental: los pasos 318, 635, 952, 1270, 1588, 1905 y 2222. El autor indica explícitamente que el barrido se interrumpió antes del paso final previsto en aquellas ramas cuyas listas terminan antes, y que ningún checkpoint inexistente o parcial se representa como completo. El tamaño del repositorio (86,4 GB) es coherente con siete copias de pesos de un modelo de 3.000 millones de parámetros en precisión completa.

Se trata, por tanto, de un modelo con utilidad fundamentalmente académica: sirve como material de estudio sobre dinámicas de entrenamiento, olvido y *replay*, más que como un modelo listo para producción. No tiene descargas ni interacciones registradas y su model card es mínima, sin métricas ni detalles de composición del conjunto de datos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (Qwen2.5), con RoPE, SwiGLU, RMSNorm y atención con GQA |
| Parametros totales | 3,09 mil millones (heredados del modelo base Qwen2.5-3B) |
| Parametros activos | no aplica (modelo denso, no es MoE) |
| Longitud de contexto | 32.768 tokens (heredada del modelo base Qwen2.5-3B) |
| Tipos de cuantizacion | no disponible; el autor solo publica safetensors en precisión completa (no hay GGUF, AWQ ni GPTQ) |
| Idiomas soportados | no disponible (la model card no los declara; el tokenizador es el de Qwen2.5) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |
| Checkpoints incluidos | 7 (pasos 318, 635, 952, 1270, 1588, 1905 y 2222) |
| Modelo base | Qwen/Qwen2.5-3B |
| Tarea de ajuste | knights and knaves (razonamiento lógico) |
| Metodo de ajuste | SFT con replay, ponderación uniforme, lambda = 1 |
| Tamano del repositorio | 86,4 GB |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La arquitectura no se modifica respecto al modelo base: es un transformer decoder-only denso de Qwen2.5 con 3,09 mil millones de parámetros, normalización RMSNorm, activación SwiGLU, embeddings rotatorios (RoPE) y atención con consultas agrupadas (GQA). El ajuste se realiza mediante SFT sobre ejemplos de la tarea "knights and knaves", una familia de problemas de lógica proposicional en la que hay que deducir la identidad de cada personaje a partir de sus afirmaciones. El autor no publica el número de tokens de entrenamiento, la composición exacta del conjunto de datos ni si hubo fases posteriores de RLHF o DPO.

La innovación metodológica del experimento no está en la arquitectura, sino en el régimen de entrenamiento: se aplica *replay* de datos con ponderación uniforme y un coeficiente lambda = 1. El *replay* consiste en mezclar ejemplos de la distribución original (o de una distribución general) con los ejemplos de la nueva tarea para reducir el olvido catastrófico. La rama "uniform" indica que todos los datos reutilizados reciben el mismo peso, sin ponderación por dificultad, antigüedad o relevancia. Se publican siete instantáneas del entrenamiento para permitir el análisis de la evolución del olvido a lo largo de los pasos, lo que convierte el repositorio en una serie temporal de checkpoints más que en un modelo final.

Un detalle relevante para quien vaya a descargarlo: los 86,4 GB repartidos entre siete checkpoints equivalen a aproximadamente 12,3 GB por checkpoint, un tamaño consistente con pesos almacenados en fp32 (un modelo de 3.000 millones de parámetros ocupa unos 12,3 GB en esa precisión). Esto implica que para inferencia será necesario convertir los pesos a fp16/bf16 o cuantizarlos, ya que el repositorio no ofrece variantes ya optimizadas.

## Capacidades

- Generación de texto y razonamiento lógico en el dominio específico de los acertijos de caballeros y escuderos, que es la tarea sobre la que se ha ajustado.
- Razonamiento deductivo de tipo proposicional: asignación de valores de verdad a afirmaciones compuestas y deducción de identidades a partir de restricciones.
- Conservación parcial de las capacidades generales del modelo base Qwen2.5-3B, presumiblemente atenuada por el ajuste sobre una tarea estrecha; el grado exacto de degradación no está documentado en la información disponible.
- Soporte de tool calling / function calling: no declarado en la model card; el ajuste no menciona plantillas de herramientas.
- Soporte de agentes y razonamiento multi-paso: no declarado.
- Capacidades multilingües: no declaradas; el modelo hereda el tokenizador multilingüe de Qwen2.5, pero el ajuste se ha realizado sobre una tarea en inglés presumiblemente y no se documenta el comportamiento en otros idiomas.
- Capacidades especiales (modo *thinking*, visión, audio): no disponibles.
- Control por prompt de sistema o plantillas de chat: no documentado; al ser un SFT sobre Qwen2.5, lo esperable es que use la plantilla ChatML de Qwen, pero el autor no lo especifica.

## Casos de uso

- Estudio del olvido catastrófico: los siete checkpoints permiten medir la degradación de capacidades generales (por ejemplo, perplejidad en un corpus de validación ajeno a la tarea) paso a paso, y comparar la curva con la de otras ramas del mismo experimento.
- Investigación sobre *replay* de datos: sirve como línea base "uniforme, lambda = 1" frente a otras ponderaciones (por dificultad, por proximidad, por dominio) para evaluar qué estrategia preserva mejor el rendimiento original.
- Evaluación de dinámicas de ajuste en modelos pequeños: al ser un modelo de 3B, permite repetir experimentos completos de SFT en una sola GPU, algo inviable con modelos de 70B o superiores.
- Generación y ampliación de conjuntos de datos de lógica: el modelo puede producir variantes de acertijos de caballeros y escuderos que después se filtran y validan, útiles para aumentar el corpus de entrenamiento de modelos mayores.
- Análisis de representaciones internas: los checkpoints intermedios permiten estudiar cómo se reorganizan las capas y las direcciones de activación a medida que el modelo se especializa, comparando el paso 318 con el 2222.
- Docencia y divulgación: en un curso de ajuste fino, la serie de checkpoints ilustra de forma tangible qué es el olvido catastrófico y cómo se comporta un modelo a lo largo del entrenamiento.
- Punto de partida para experimentos de destilación: al ser un modelo especializado y pequeño, es un candidato razonable para destilar su comportamiento en modelos aún más reducidos o para comparar con modelos entrenados desde cero en la misma tarea.
- Reproducibilidad de barridos de hiperparámetros: sirve para verificar que la rama "uniform" se reproduce con los mismos pasos y el mismo lambda en configuraciones de hardware distintas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card se limita a enumerar los checkpoints incluidos y a advertir de que el barrido se interrumpió en algunas ramas; no incluye exactitud en la tarea de knights and knaves, ni MMLU, HumanEval, GSM8K u otras métricas, ni comparaciones con el modelo base. Las búsquedas web realizadas no arrojaron documentación técnica asociada a este repositorio.

## Requisitos de hardware

- VRAM para inferencia en fp32: aproximadamente 12,3 GB solo para los pesos, más caché KV y activaciones; en la práctica, entre 13 y 15 GB por checkpoint.
- VRAM en fp16/bf16: alrededor de 6,2 GB de pesos, más unos 1-2 GB de caché KV para contextos moderados; en torno a 8-10 GB totales según longitud de secuencia.
- VRAM en cuantización de 8 bits: aproximadamente 3,5 GB de pesos.
- VRAM en cuantización de 4 bits: aproximadamente 2,2 GB de pesos; es posible convertir los safetensors a GGUF o a formatos de 4 bits con herramientas como llama.cpp o AutoAWQ, ya que el autor no los publica.
- GPU recomendadas: cualquier GPU con 16 GB o más (RTX 4090, RTX 4080, A10G, L4) ejecuta el modelo en bf16 con comodidad; para fp32 sin conversión se recomienda A100 40 GB, H100 o L40S. Sí cabe en GPU de consumo: RTX 3060 de 12 GB o superior en cuantización de 8 y 4 bits, y RTX 4090 o 3090 en bf16.
- Opciones de despliegue: vLLM y TGI para servicio en fp16/bf16 sobre GPU; llama.cpp y Ollama tras convertir los pesos a GGUF; transformers con `device_map` para prototipado.
- Latencia y throughput estimados: no disponibles en la información proporcionada. Cabe esperar que sean comparables a los de cualquier modelo denso de 3B en la misma GPU, pero no hay mediciones publicadas para este repositorio.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tipo | Licencia | Disponibilidad de pesos | Notas |
|---|---|---|---|---|---|---|
| qwen2.5-3b-kk-sft-replay-uniform-lam1-all-checkpoints | 3,09 mil millones | 32.768 tokens (heredado) | Denso, ajustado con SFT + replay sobre knights and knaves | Apache-2.0 | safetensors fp32, 7 checkpoints, sin cuantizaciones | Artefacto de investigación; sin benchmarks publicados |
| Qwen/Qwen2.5-3B (modelo base) | 3,09 mil millones | 32.768 tokens | Denso, preentrenado y alineado | Apache-2.0 (con condiciones para algunos componentes) | safetensors, GGUF y cuantizaciones de la comunidad | Referencia directa: capacidades generales sin especializar |
| Qwen/Qwen2.5-3B-Instruct | 3,09 mil millones | 32.768 tokens | Denso, ajustado por instrucciones | Apache-2.0 | safetensors, GGUF, AWQ, GPTQ | Alternativa alineada para uso conversacional general |
| Meta Llama-3.2-3B-Instruct | 3,21 mil millones | 131.072 tokens | Denso, ajustado por instrucciones | Licencia comunitaria de Llama | safetensors, GGUF | Contexto mucho mayor y ecosistema amplio, con licencia más restrictiva |

No se dispone de datos de rendimiento comparado en la información proporcionada, por lo que la comparación se limita a parámetros, contexto, licencia y disponibilidad.

## Limitaciones y advertencias

- No es un modelo listo para producción: es un artefacto de investigación con siete checkpoints intermedios, ninguno de los cuales se presenta como versión final.
- Sesgos conocidos: no documentados por el autor. Al heredar el preentrenamiento de Qwen2.5-3B, arrastra los sesgos de ese corpus, y el ajuste sobre una tarea sintética de lógica puede intensificarlos o introducir atajos espurios.
- Riesgo de alucinación: elevado en dominios fuera de la tarea de ajuste, ya que el proceso de SFT estrecho tiende a degradar la fidelidad general del modelo.
- Olvido catastrófico: es precisamente el fenómeno que se estudia aquí; no hay garantía de que el *replay* uniforme con lambda = 1 haya preservado las capacidades generales, y no se publican métricas que lo confirmen.
- Limitaciones de contexto e idioma: la model card no declara idiomas soportados ni evalúa el comportamiento multilingüe; el rendimiento fuera del inglés y fuera del dominio de knights and knaves es desconocido.
- Restricciones de licencia: Apache-2.0 permite uso comercial, pero el modelo deriva de Qwen2.5-3B y conviene revisar las condiciones de la licencia del modelo base y de los datos con los que se generó la tarea de ajuste.
- Formato poco práctico: los pesos están en precisión completa (unos 12,3 GB por checkpoint) y no se ofrecen variantes cuantizadas, lo que obliga a convertir antes de desplegar.
- Ausencia de documentación: no hay información sobre el conjunto de datos de entrenamiento, la composición del *replay*, el número de tokens vistos ni la plantilla de prompt esperada, lo que dificulta la reproducibilidad y el uso correcto del modelo.
- Barrido incompleto: el propio autor advierte de que el barrido se interrumpió antes del paso final previsto en algunas ramas.
- Repositorio sin validación externa: cero descargas y cero interacciones, sin evaluación independiente disponible.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/RL-Forgetting-Experiments-3/qwen2.5-3b-kk-sft-replay-uniform-lam1-all-checkpoints
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-3B
- Informe técnico de Qwen2.5 (arXiv:2412.15115): https://arxiv.org/abs/2412.15115
- Repositorio de Qwen2.5 en GitHub: https://github.com/QwenLM/Qwen2.5
- No se han encontrado enlaces adicionales relevantes en las búsquedas web realizadas: los resultados devueltos correspondían a contenido sin relación con el modelo (páginas del videojuego Rocket League y medios de prensa regional).
