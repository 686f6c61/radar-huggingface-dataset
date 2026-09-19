# ceselder/maemm-27b-rl-last16-lr5e-7

## Resumen

MAEMM 27B activation-to-text inverter (checkpoint `ceselder/maemm-27b-rl-last16-lr5e-7`) es un ajuste fino de parámetros completos sobre Qwen3.6-27B, desarrollado por el usuario ceselder dentro de la cadena de experimentos "simple2m". No es un asistente conversacional: es una herramienta de interpretabilidad entrenada para invertir activaciones, es decir, dado un vector unitario `v` en el espacio residual de la capa 42, el modelo genera texto cuyo propio estado residual en esa misma capa apunta en la dirección `v`. La inyección se realiza en la capa 1 sobre el marcador ` ?` mediante `h + coeff * ||h|| * unit(v)`.

El entrenamiento combina un SFT inicial de una época sobre 8 millones de filas (mitad activaciones reales de Ultra-FineWeb con contextos de 8 a 64 tokens, mitad direcciones de encoder y decoder de un SAE BatchTopK de 2 millones de features en la capa 42) y una fase posterior de RL con CISPO/GRPO de 300 pasos, learning rate 5e-7 y una recompensa basada en el coseno máximo sobre los últimos 16 tokens generados.

Su relevancia es acotada pero clara para el campo de la interpretabilidad mecanicista: proporciona una vía automática para traducir direcciones del espacio residual a texto legible, con métricas de fidelidad verificables (coseno centrado) y con generalización medida sobre direcciones fuera del pool de entrenamiento. El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y el modelo se publica bajo licencia Apache 2.0 con pesos bf16 en safetensors (55,6 GB).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder causal (Qwen3.6-27B) con hook de inyeccion de direcciones en la capa 1 |
| Parametros totales | 27.781.427.952 (~27,8 B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (pesos publicados en bf16; no se documentan GGUF ni cuantizaciones oficiales) |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors bf16 en shards (`model-*.safetensors` + `model-nontext.safetensors` con los tensores base no textuales) |
| Modelo base | Qwen/Qwen3.6-27B |
| Tamano del repositorio | 55,6 GB |
| Checkpoint publicado | Paso 300 de RL, reward sobre los ultimos 16 tokens, lr 5e-7 |
| Artefactos adicionales | Tokenizer, `run_meta.json` |
| Dependencia de codigo | Hook de inyeccion en el repositorio MAEMM (`mxf/inject.py`) |

## Arquitectura y entrenamiento

La base es un transformer decoder causal Qwen3.6-27B con parámetros completos ajustados (no se congela ninguna capa). La innovación no está en la arquitectura del modelo, sino en la interfaz de entrada: en lugar de un prompt convencional, se inyecta una dirección unitaria del espacio residual de la capa 42 en la capa 1, sobre el marcador ` ?`, escalada por la norma del estado oculto (`h + coeff * ||h|| * unit(v)`). El objetivo es que el texto generado, al ser reprocesado por el modelo, produzca una activación en la capa 42 alineada con la dirección de entrada.

El entrenamiento tiene dos fases. La primera es un SFT de una época sobre 8 millones de filas, repartidas exactamente al 50 %: 4 millones de activaciones de Ultra-FineWeb con 8-64 tokens de contexto cuyo objetivo es el contexto completo, y 4 millones de direcciones de un SAE BatchTopK de 2 millones de features en la capa 42 (2 millones de columnas de encoder y 2 millones de filas de decoder, ventanas de máxima activación). Se usó un split de 1.847.152 features para SFT, con 100.000 features de evaluación y 150.000 de RL reservadas. Learning rate 1e-5 con ciclo único, batch de 4.096 y una época. La segunda fase es RL de parámetros completos con CISPO/GRPO (receta ScaleRL): 8 prompts por 2.048 rollouts por paso, learning rate 5e-7 plano tras 25 pasos de calentamiento, 300 pasos, recompensa igual al coseno máximo sobre los últimos 16 tokens generados, penalización de longitud de 2,5e-4 por token por encima de 8, y un pool de prompts repartido a partes iguales entre activaciones de documentos completos (contextos de 64 a 2.048 tokens) y filas del SAE de 2M del split de RL (941.132 filas).

Una advertencia metodológica relevante del autor: la recompensa de RL y las evaluaciones durante el entrenamiento usaron el coseno crudo `cos(unit(h), d)`, mientras que los números publicados se recalcularon con el coseno centrado corregido `cos(unit(h - mu), d)`, donde `mu` es la media del corpus en la capa 42. Esta es la métrica con la que deben compararse los resultados.

## Capacidades

- Inversión de activaciones a texto: dada una dirección unitaria en el espacio residual de la capa 42, genera texto cuya activación en esa capa apunta en esa dirección.
- Cobertura de direcciones procedentes de activaciones reales de corpus (Ultra-FineWeb), con ventanas de contexto de 8-64 tokens en SFT y de 64-2.048 tokens en RL.
- Cobertura de direcciones derivadas de SAEs: columnas de encoder y filas de decoder de un SAE BatchTopK de 2 millones de features en la capa 42.
- Cobertura de direcciones de un SAE distinto (131k features), medida mediante la métrica `norm_act`.
- Generalización fuera del pool de entrenamiento: a paso 300 dispara 0,344 de las features de encoder y 0,416 de las de decoder de un SAE de 2M reservado (held-out).
- Generación de texto multi-token con contexto largo (hasta 2.048 tokens en el pool de RL).
- Soporte de tool calling / function calling: no documentado.
- Soporte de agentes o razonamiento multi-paso: no documentado.
- Capacidades multilingües: no disponible.
- Modo thinking, visión o audio: no documentado.
- Uso como asistente general, generación de código o matemáticas: no documentado y fuera del propósito del ajuste.

## Casos de uso

- Etiquetado automático de features de SAE: dado el vector de una feature del SAE de 2 millones, el modelo genera texto que la activa, lo que permite asignar una descripción legible a features que de otro modo solo tendrían un índice y un vector asociado.
- Validación cruzada de diccionarios de SAE: comparar la descripción generada para una dirección de encoder con la generada para la fila de decoder correspondiente permite detectar features mal condicionadas o poco interpretables.
- Auditoría de representaciones en modelos de producción: extraer la dirección de la capa 42 asociada a un comportamiento anómalo y generar texto que la active, para localizar qué contenido la provoca.
- Generación de datos sintéticos para entrenar SAEs: el texto generado sirve como material de arranque en caliente para ampliar diccionarios o para construir pares activación-texto adicionales.
- Evaluación de generalización de interpretabilidad: usar el subconjunto held-out de direcciones para medir si una técnica de inversión generaliza más allá del pool de entrenamiento, con la métrica de features disparadas (0,344/0,416 a paso 300).
- Investigación en normas de MLP y representaciones intermedias: las familias de evaluación `MLP norm_act` (0,694 a paso 300) y `131k-SAE norm_act` (0,824) permiten estudiar cómo se codifica la magnitud de activación en texto.
- Estudio de dinámicas de RL en tareas de interpretabilidad: el checkpoint es un punto intermedio (paso 300) de una curva con siete puntos medidos, útil para analizar cuándo satura la fidelidad y cuándo sigue mejorando la generalización.
- Reproducción y comparación de recetas de RL: enfrentar este brazo (lr 5e-7, recompensa sobre últimos 16 tokens) con el brazo de lr 1e-6 y recompensa sobre el span completo permite aislar el efecto de cada decisión de diseño.

## Benchmarks y rendimiento

Evaluación held-out con scorer centrado, 512 direcciones held-out por familia, best-of-4 con T=1:

| Paso de RL | mean_all (10 familias) | Activaciones reales | Contexto largo | MLP norm_act | 131k-SAE norm_act | 2M-SAE enc/dec disparados |
|---|---|---|---|---|---|---|
| 25 | 0,482 | 0,620 | 0,512 | 0,253 | 0,488 | 0,061 / 0,092 |
| 50 | 0,562 | 0,736 | 0,650 | 0,397 | 0,732 | 0,100 / 0,164 |
| 100 | 0,588 | 0,766 | 0,695 | 0,415 | 0,726 | 0,162 / 0,289 |
| 150 | 0,597 | 0,777 | 0,707 | 0,643 | 0,809 | 0,258 / 0,371 |
| 200 | 0,598 | 0,777 | 0,711 | 0,675 | 0,849 | 0,309 / 0,371 |
| 250 | 0,599 | 0,779 | 0,712 | 0,686 | 0,839 | 0,312 / 0,393 |
| 300 | 0,600 | 0,780 | 0,716 | 0,694 | 0,824 | 0,344 / 0,416 |

Puntos de referencia aportados por el autor:

- Inicialización SFT (antes de RL): mean_all 0,420.
- Brazo alternativo de 8x2048 con lr 1e-6 y recompensa sobre el span completo: mean_all 0,595, MLP norm_act 0,581, 2M enc/dec disparados 0,312 / 0,363.

Lectura de los datos: la fidelidad media (`mean_all`) satura alrededor de 0,600 desde el paso 200, mientras que la generalización fuera del pool (features de SAE held-out disparadas) sigue creciendo hasta el paso 300, que es donde se publica este checkpoint. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K ni similares) en la información disponible.

## Requisitos de hardware

- Pesos en bf16: 55,6 GB de safetensors, lo que exige al menos 64 GB de VRAM contando caché KV y activaciones; se recomienda A100 80 GB, H100 80 GB o H200.
- Cuantización a 8 bits (estimación, no documentada por el autor): ~28 GB de pesos, viable en A100 40 GB, L40S 48 GB o dos RTX 4090/3090 con 24 GB cada una.
- Cuantización a 4 bits (estimación, no documentada): ~14-16 GB, viable en una RTX 4090, RTX 3090 o L4 de 24 GB.
- No cabe en GPUs de consumo con precisión bf16: se necesita al menos una configuración multi-GPU de 48 GB o superior.
- Opciones de despliegue documentadas: `transformers` cargándolo como un causal LM de Qwen3.6-27B, más el hook de inyección del repositorio MAEMM (`mxf/inject.py`).
- Opciones de despliegue no documentadas: vLLM o TGI deberían funcionar por compatibilidad de arquitectura, pero no hay confirmación del autor; llama.cpp y Ollama requieren una conversión a GGUF que no se distribuye en el repositorio.
- No se distribuyen GGUF ni quantizaciones oficiales, por lo que cualquier despliegue cuantizado implica conversión propia y una degradación de la fidelidad de inversión no medida.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Rendimiento (mean_all) | Disponibilidad |
|---|---|---|---|---|---|
| ceselder/maemm-27b-rl-last16-lr5e-7 (este modelo) | 27,8 B | No disponible | Apache 2.0 | 0,600 (scorer centrado, paso 300) | Publicado en HuggingFace, 0 descargas |
| Brazo hermano 8x2048, lr 1e-6, recompensa span completo | 27,8 B (mismo base) | No disponible | No disponible en la informacion proporcionada | 0,595 | Mencionado en la model card, publicacion no confirmada |
| Qwen/Qwen3.6-27B (modelo base) | ~27 B | No disponible | No disponible | No aplica (no entrenado para inversion de activaciones) | Publicado en HuggingFace |
| Otros inverters de activacion a texto | No disponible | No disponible | No disponible | No disponible | No se han encontrado alternativas publicadas en la informacion disponible |

La búsqueda web realizada no devolvió resultados relacionados con el modelo ni con modelos comparables de la misma categoría (interpretabilidad o inversión de activaciones), por lo que la comparativa se limita al modelo base y al brazo alternativo de la misma cadena experimental.

## Limitaciones y advertencias

- Modelo de investigación, no asistente: el ajuste de parámetros completos sobre 8 millones de filas de activaciones y direcciones de SAE degrada previsiblemente su comportamiento como chatbot, generador de código o resolutor de tareas generales. No se documenta ninguna evaluación de capacidades generales.
- Requiere código externo: sin el hook de inyección del repositorio MAEMM (`mxf/inject.py`), cargarlo como un Qwen3.6-27B estándar no reproduce el comportamiento descrito.
- Inconsistencia de métrica en el entrenamiento: la recompensa de RL usó el coseno crudo `cos(unit(h), d)`, no el centrado. Los números publicados son re-scorings posteriores; reproducir el entrenamiento con la métrica publicada daría resultados distintos.
- Cardinalidad de la evaluación limitada: 512 direcciones held-out por familia y best-of-4 con T=1. No hay intervalos de confianza ni semillas múltiples reportadas.
- Generalización parcial: a paso 300 solo se disparan 0,344 de las features de encoder y 0,416 de las de decoder de un SAE de 2M held-out, lo que indica que la inversión fuera del pool de entrenamiento dista de ser completa.
- Saturación de fidelidad: `mean_all` apenas mejora 0,011 entre los pasos 150 y 300 (0,597 a 0,600), mientras que otras familias siguen subiendo; el checkpoint elegido prioriza generalización sobre fidelidad media.
- Idiomas soportados: no disponible. El SFT se construyó sobre Ultra-FineWeb, pero no se documenta cobertura lingüística ni evaluación por idioma.
- Sesgos: no disponible. Al generarse texto a partir de activaciones de un corpus web, es esperable que herede sesgos presentes en ese corpus, pero no hay análisis publicado.
- Riesgo de alucinación: el texto generado es una reconstrucción plausible de la dirección de activación, no una descripción verificada. Debe validarse siempre contra la métrica de coseno o contra las features del SAE antes de usarse como etiqueta.
- Licencia: Apache 2.0 en este checkpoint, lo que permite uso comercial. No obstante, conviene verificar la licencia del modelo base Qwen/Qwen3.6-27B, que no se especifica en la información proporcionada.
- Adopción nula: 0 descargas y 0 likes. No hay evidencia de uso en producción ni de validación por terceros.
- Longitud de contexto: no disponible, pese a que el entrenamiento usó contextos de hasta 2.048 tokens en el pool de RL. No se debe asumir que la ventana nativa del base esté intacta tras el ajuste.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ceselder/maemm-27b-rl-last16-lr5e-7
- Modelo base: https://huggingface.co/Qwen/Qwen3.6-27B
- Repositorio MAEMM (hook de inyección, `mxf/inject.py`): mencionado en la model card, URL no disponible en la información proporcionada
- Paper o blog del método MAEMM: no disponible en la información proporcionada
- Demo o espacio interactivo: no disponible
- La búsqueda web realizada no devolvió resultados relevantes sobre este modelo ni sobre modelos comparables.
