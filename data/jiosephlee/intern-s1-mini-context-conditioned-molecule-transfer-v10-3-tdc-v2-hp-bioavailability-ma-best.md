# jiosephlee/intern-s1-mini-context-conditioned-molecule-transfer-v10-3-tdc-v2-hp-bioavailability-ma-best

## Resumen

`intern-s1-mini-context-conditioned-molecule-transfer-v10-3-tdc-v2-hp-bioavailability-ma-best` es un checkpoint de ajuste fino publicado por el usuario de HuggingFace **jiosephlee** a partir del modelo base `jiosephlee/Intern-S1-mini-lm`. No se trata de un modelo de propósito general, sino de un ranker especializado en una tarea concreta de química computacional: predecir y ordenar moléculas según su biodisponibilidad oral, planteando el problema como una transferencia molécula-contexto condicionada. El checkpoint es el resultado seleccionado por validación de la ejecución TDC-v2-HP "direct-inclusive" para biodisponibilidad oral, y según el autor fue el mejor resultado de macro-F1@5 en datos reservados entre las variantes indirect-only y Starling-direct del proyecto TDC.

El modelo tiene 8.201.221.120 parámetros (unos 8,2 mil millones) y un repositorio de 16,4 GB en formato safetensors, con la etiqueta `qwen3` en HuggingFace, lo que apunta a una arquitectura transformer de tipo Qwen3 heredada del modelo base. Se entrenó sobre 49.224 registros directos (incluyendo datos directos de TDC y Starling) más 49.224 registros indirectos, con pérdida de objetivo suave (soft-target loss), Flash Attention 2, BFD packing y entrenamiento sin padding, en 8 GPU.

Su relevancia es acotada pero clara para el nicho de descubrimiento de fármacos: demuestra que un modelo de lenguaje de 8B ajustado puede competir con descriptores clásicos como los fingerprints de Morgan en una tarea de ranking farmacológico, y lo hace con un Spearman@3 positivo (0,5774) frente al Spearman negativo de las líneas base de Morgan (-0,0207 y -0,0142). El modelo tiene 0 descargas y 0 likes en el momento de la consulta y no declara licencia, por lo que debe considerarse un artefacto de investigación sin validación externa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (etiqueta `qwen3` en HuggingFace; derivado del modelo base Intern-S1-mini-lm) |
| Parametros totales | 8.201.221.120 (segun safetensors) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el repositorio solo distribuye pesos en safetensors; no se publican variantes GGUF, GPTQ ni AWQ) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (checkpoint completo de Transformers, incluye tokenizer) |
| Tamano del repositorio | 16,4 GB |
| Pipeline | text-generation |
| Libreria | transformers |
| Modelo base | jiosephlee/Intern-S1-mini-lm (revision `fcb667c380ae01f57693a45b4b5c2d331052a107`) |
| Dataset de entrenamiento | jiosephlee/context-conditioned-molecule-transfer-v10.3-tdc-v2-hp-bioavailability-ma-mixed-continuous-intern (revision `9db99d12536f5dbb3d906ab90e5acff1b036405c`) |
| Fecha de creacion | 2026-09-21 |
| Ultima actualizacion | 2026-09-21 |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La arquitectura no se documenta en la model card mas alla de las etiquetas de HuggingFace, que incluyen `qwen3` y `transformers`. Esto sugiere una pila transformer de tipo Qwen3 (atención con RoPE, capas normalizadas tipo RMSNorm y tokenizer BPE) heredada del modelo base `jiosephlee/Intern-S1-mini-lm`, con 8,2 mil millones de parametros totales. No se especifica si se trata de un modelo denso o de una variante de mezcla de expertos, ni la longitud de contexto soportada, ni los idiomas del tokenizer. La tarea se formula como una transferencia molécula-contexto condicionada por contexto ("context-conditioned molecule transfer") orientada a ranking, con una metrica de evaluación `knn_binary_macro_f1_at_5` definida sobre vecinos más cercanos.

El entrenamiento partió de 98.448 registros en total: 49.224 directos (datos directos de TDC y Starling) más 49.224 indirectos. La configuración declarada incluye 10 épocas programadas, semilla 42, pérdida de objetivo suave (soft-target loss), 8 GPU, tamaño de lote por dispositivo de 4, acumulación de gradiente de 4, Flash Attention 2, BFD packing y entrenamiento sin padding. El autor indica que el entrenamiento se detuvo intencionadamente en el paso 202 de 440 y que el repositorio contiene el checkpoint seleccionado por validación en el paso 80, con un macro-F1@5 de validación de 0,6297. No se menciona RLHF, DPO ni ninguna fase de alineación adicional; el ajuste es supervisado sobre la tarea de ranking.

## Capacidades

- Ranking de moléculas para biodisponibilidad oral: la función principal es ordenar compuestos según su probabilidad de presentar biodisponibilidad oral aceptable, con métricas de evaluación a k=3 y k=5.
- Transferencia condicionada por contexto: el modelo se ha ajustado explícitamente para integrar contexto en la representación de la molécula, dentro del esquema "context-conditioned molecule transfer".
- Modelado con objetivos suaves: el entrenamiento con soft-target loss sugiere la capacidad de producir distribuciones de probabilidad graduadas en lugar de etiquetas binarias duras, útil para ranking continuo.
- Generación de texto: la pipeline declarada es `text-generation` y las etiquetas incluyen `conversational`, heredadas del modelo base, por lo que el checkpoint conserva la interfaz de generación de texto, aunque su calidad conversacional tras el ajuste no está documentada.
- Compatibilidad con Text Generation Inference: las etiquetas incluyen `text-generation-inference` y `endpoints_compatible`, lo que indica que el checkpoint puede servirse mediante TGI y desplegarse en Inference Endpoints.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Comportamiento agéntico o razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible; no se declara ningún idioma.
- Capacidades especiales (modo pensamiento, visión, audio): no disponible; solo se declaran tareas de química y ranking.

## Casos de uso

- Priorización virtual de compuestos en descubrimiento temprano de fármacos: el modelo puede actuar como ranker sobre una librería de moléculas candidatas, ordenándolas por biodisponibilidad oral prevista y reduciendo el número de compuestos que pasan a síntesis y ensayo. Es adecuado porque se ha ajustado específicamente sobre datos directos e indirectos de TDC y Starling para esta tarea.
- Filtrado previo en cribado virtual de alta throughput (HTS): integrado como etapa de scoring tras la generación de candidatos por docking o generación molecular, permite descartar compuestos con baja probabilidad de absorción oral antes de gastar recursos experimentales.
- Optimización de series de leads: durante la optimización de una serie química, el modelo puede puntuar análogos generados por química medicinal y ayudar a decidir qué modificaciones estructurales preservan la biodisponibilidad oral.
- Enriquecimiento de librerías combinatorias: dado un conjunto grande de productos de reacción virtual, el ranker ordena la librería y selecciona un subconjunto priorizado para compra o síntesis, usando la métrica de acierto top-1 (hit@3 de 0,7266 en test) como indicador de utilidad práctica.
- Comparación con líneas base de quimioinformática: al publicarse resultados frente a fingerprints de Morgan vanilla y ponderado, el modelo sirve como referencia metodológica para equipos que quieran medir si un enfoque basado en lenguaje supera a descriptores clásicos en su propio conjunto de datos.
- Evaluación de modelos QSAR internos: el checkpoint puede utilizarse como línea base adicional en la validación de modelos de predicción de propiedades farmacocinéticas, especialmente en métricas de ordenación como Spearman.
- Asistente conversacional especializado en química: aprovechando la pipeline `text-generation` y la etiqueta `conversational` del modelo base, puede desplegarse como interfaz conversacional para consultas sobre candidatos, siempre que se valide su comportamiento tras el ajuste, ya que no hay documentación al respecto.
- Prototipado en TGI o Inference Endpoints: gracias a las etiquetas `text-generation-inference` y `endpoints_compatible`, el checkpoint puede desplegarse rápidamente como servicio en infraestructura gestionada para pruebas internas de ranking.

## Benchmarks y rendimiento

La model card incluye una comparación en conjunto de test reservado entre el modelo y dos líneas base basadas en fingerprints de Morgan. No se han publicado otros benchmarks (MMLU, HumanEval, GSM8K u otros) en la información disponible.

| Ranker | Macro-F1@3 | Macro-F1@5 | Spearman@3 | Top-1 hit@3 |
|---|---:|---:|---:|---:|
| Modelo (este checkpoint) | 0,5657 | 0,5657 | 0,5774 | 0,7266 |
| Morgan vanilla | 0,5987 | 0,5060 | -0,0207 | 0,9297 |
| Morgan weighted | 0,6169 | 0,5439 | -0,0142 | 0,9219 |

Además, se declara un macro-F1@5 de validación de 0,6297 (metrica `knn_binary_macro_f1_at_5`) en el paso 80, que fue el criterio de selección del checkpoint. El autor indica que la selección del checkpoint y la comparación entre variantes TDC se realizaron con macro-F1@5.

## Requisitos de hardware

- VRAM estimada para inferencia (cálculos a partir de los 8,2 mil millones de parámetros; no publicados por el autor): en bf16/fp16, unos 16,4 GB solo de pesos, más activaciones y caché KV, lo que en la práctica requiere del orden de 20-24 GB; en int8, alrededor de 8-9 GB; en 4 bits, aproximadamente 4,5-5,5 GB.
- GPU recomendadas: A100 (40/80 GB), H100, L40S o A6000 para servicio en bf16 con lotes; RTX 4090 (24 GB) para inferencia en bf16 con contexto corto o en cuantización de 8 bits.
- Cabe en GPU de consumo: sí, en cuantización de 4 bits cabe en tarjetas de 8-16 GB (RTX 4060 Ti 16 GB, RTX 4070, RTX 3080 10 GB con margen justo); en bf16 completo requiere una tarjeta de 24 GB como la RTX 3090 o RTX 4090, con margen limitado para lotes grandes.
- Opciones de despliegue: `transformers` (librería declarada), Text Generation Inference (etiqueta `text-generation-inference` y `endpoints_compatible`) y, previsiblemente, vLLM por compatibilidad con pesos safetensors de Qwen3. No hay archivos GGUF en el repositorio, por lo que llama.cpp u Ollama requerirían una conversión previa no publicada.
- Latencia y throughput estimados: no disponibles; el autor no publica mediciones de latencia, tokens por segundo ni tamaño de lote recomendado.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables de la misma categoría (rankers de biodisponibilidad oral basados en language models). La comparación publicada se limita a líneas base de fingerprints de Morgan, que no son modelos neuronales.

| Alternativa | Tipo | Macro-F1@3 | Macro-F1@5 | Spearman@3 | Top-1 hit@3 | Licencia |
|---|---|---:|---:|---:|---:|---|
| Este checkpoint (paso 80) | Transformer ajustado, 8,2B | 0,5657 | 0,5657 | 0,5774 | 0,7266 | no disponible |
| Morgan vanilla | Fingerprints + ranker clásico | 0,5987 | 0,5060 | -0,0207 | 0,9297 | no disponible |
| Morgan weighted | Fingerprints + ranker clásico | 0,6169 | 0,5439 | -0,0142 | 0,9219 | no disponible |
| `jiosephlee/Intern-S1-mini-lm` (modelo base) | Transformer de 8,2B, propósito general | no disponible | no disponible | no disponible | no disponible | no disponible |

En una comparación con alternativas neuronales de tamaño similar (por ejemplo, otros modelos Qwen3 de 8B), no hay datos publicados en la información disponible.

## Limitaciones y advertencias

- Repositorio sin tracción: 0 descargas y 0 likes en el momento de la consulta, lo que implica ausencia de validación independiente por parte de la comunidad.
- Licencia no disponible: no se declara licencia, lo que impide determinar si el uso comercial está permitido. Debe tratarse como un artefacto de investigación no apto para producción sin aclaración previa del autor.
- Checkpoint no final: el entrenamiento se detuvo en el paso 202 de 440 y el repositorio contiene el checkpoint del paso 80, no el modelo convergido al final del entrenamiento programado de 10 épocas.
- Rendimiento mixto frente a líneas base: el modelo supera a Morgan vanilla y ponderado en macro-F1@5 (0,5657 frente a 0,5060 y 0,5439) y obtiene un Spearman@3 positivo, pero queda por detrás de ambas líneas base en macro-F1@3 (0,5657 frente a 0,5987 y 0,6169) y en top-1 hit@3 (0,7266 frente a 0,9297 y 0,9219).
- Sin datos de sesgo: no se publica ningún análisis de sesgos, composición del dataset por clase, diversidad química ni cobertura de espacio químico.
- Riesgo de alucinación: al conservar la cabeza de generación de texto del modelo base y la etiqueta `conversational`, puede generar afirmaciones plausibles pero incorrectas sobre propiedades moleculares si se usa fuera del modo de ranking para el que fue ajustado.
- Idiomas y contexto no documentados: no se declaran idiomas soportados ni longitud de contexto, lo que dificulta dimensionar el servicio y evaluar el comportamiento multilingüe.
- Dominio muy restringido: está especializado en biodisponibilidad oral según la partición TDC-v2-HP; extrapolar sus puntuaciones a otras propiedades ADMET, otras familias químicas o condiciones experimentales distintas no está justificado por los datos publicados.
- Sin utilidad clínica demostrada: las predicciones son orientativas para investigación y no sustituyen ensayos in vitro o in vivo.
- Ausencia de variantes cuantizadas oficiales: el repositorio solo contiene safetensors, lo que obliga a convertir los pesos para despliegues en llama.cpp, Ollama u otros runtimes basados en GGUF.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/jiosephlee/intern-s1-mini-context-conditioned-molecule-transfer-v10-3-tdc-v2-hp-bioavailability-ma-best
- Modelo base: https://huggingface.co/jiosephlee/Intern-S1-mini-lm
- Dataset de entrenamiento: https://huggingface.co/datasets/jiosephlee/context-conditioned-molecule-transfer-v10.3-tdc-v2-hp-bioavailability-ma-mixed-continuous-intern
- Ejecución de entrenamiento en W&B: https://wandb.ai/upenn-ml/context-conditioned-molecule-transfer-soft/runs/7wfv9s7h
- Comparación en datos reservados modelo/Morgan en W&B: https://wandb.ai/upenn-ml/context-conditioned-molecule-transfer-soft/runs/mdzruncf
- Busqueda web: no se han encontrado enlaces relevantes; los resultados devueltos corresponden únicamente a páginas genéricas de YouTube y no guardan relación con el modelo.
