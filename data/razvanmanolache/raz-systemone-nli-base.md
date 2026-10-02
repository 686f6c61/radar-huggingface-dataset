# RazvanManolache/raz-systemone-nli-base

## Resumen

raz-systemone-nli-base es un modelo de inferencia de lenguaje natural (NLI) en formato cross-encoder, desarrollado por RazvanManolache y publicado en HuggingFace. Se obtiene por fine-tuning de `cross-encoder/nli-deberta-v3-base` sobre un conjunto mixto de datos de dominio muy específico: 725 pares NLI derivados de 110 estados de tickets de soporte etiquetados (repetidos 8 veces) más 200.000 filas de MNLI, durante 2 épocas. La arquitectura es un transformer encoder tipo DeBERTa-v3 y el checkpoint tiene 184.424.451 parámetros (184,4 M), con un repositorio de 0,7 GB en safetensors.

El modelo resuelve una tarea concreta: puntuar si una hipótesis (por ejemplo, una respuesta candidata) queda implicada por una premisa (por ejemplo, el estado de un ticket de soporte). Su función principal es actuar como scorer `nli` dentro del framework `raz-systemone`, invocado mediante `--scorer nli --nli-model <dir>`, aunque también puede usarse de forma autónoma como clasificador binario con `AutoModelForSequenceClassification`.

Es relevante porque demuestra una estrategia de ajuste muy económica en cómputo (2 épocas sobre un corpus reducido y aumentado con MNLI) que consigue resultados muy altos en la partición ancha de evaluación (0,983 sobre 60 juicios en holdout C) y 0,980 sobre 10.000 filas disjuntas de MNLI. El autor lo presenta explícitamente como alternativa al modelo hermano `raz-systemone-nli-xsmall`: el base gana en consultas amplias, mientras que el xsmall mantiene mejor equilibrio en particiones pequeñas y permite reentrenamientos de unos 10 minutos frente a las aproximadamente 2 horas del base. Es la versión v7 del modelo y se publica bajo licencia MIT.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer encoder tipo DeBERTa-v3 en configuración cross-encoder, con cabeza de clasificación de secuencias |
| Parámetros totales | 184.424.451 (184,4 M), dato real de safetensors |
| Parámetros activos | no aplica (modelo denso, no es MoE) |
| Longitud de contexto | no especificado en la model card; el backbone DeBERTa-v3-base soporta hasta 512 tokens |
| Tipos de cuantización | no hay versiones cuantizadas publicadas; el repo distribuye safetensors (0,7 GB) |
| Idiomas soportados | inglés (tickets de soporte en inglés y MNLI, ambos en inglés) |
| Licencia | MIT |
| Formato de pesos | safetensors, librería transformers |
| Tarea | NLI binario y cross-encoding: etiqueta 1 = entailment, etiqueta 0 = no entailment |
| Modelo base | cross-encoder/nli-deberta-v3-base |
| Versión | v7 |
| Etiquetas del repo | transformers, safetensors, deberta-v2, text-classification, nli, cross-encoder, entailment, calibration, text-embeddings-inference, endpoints_compatible, region:us |
| Descargas y likes | 0 descargas, 0 likes en el momento de la consulta |
| Fecha de creación / actualización | 2026-10-02 |

## Arquitectura y entrenamiento

El modelo es un cross-encoder: premisa e hipótesis se concatenan en una única secuencia de entrada y el encoder atiende conjuntamente sobre ambas, de modo que la representación de salida (típicamente el token `[CLS]`) se pasa a una cabeza de clasificación binaria. No hay codificación por separado ni producto escalar de embeddings, lo que implica un coste de inferencia de O(n) por par evaluado en lugar de un índice precalculable. El backbone es DeBERTa-v3-base, con atención desenredada y mecanismo de embedding de posición relativa, heredado directamente de `cross-encoder/nli-deberta-v3-base`.

El entrenamiento combina dos fuentes: 725 pares NLI construidos a partir de 110 estados de tickets de soporte etiquetados, repetidos 8 veces para dar peso al dominio objetivo, y 200.000 filas de MNLI como regularizador general. Se ejecutan 2 épocas. No se documenta en la información disponible el uso de RLHF, DPO ni ninguna técnica de optimización adicional; tampoco se detalla la composición exacta de los datos de soporte ni la política de negativos. La model card indica que las filas de evaluación replican la tabla maestra de `training/README.md` del repositorio `RazvanManolache/raz-systemone` y que todas las particiones de evaluación corresponden a estados nunca vistos durante el entrenamiento.

## Capacidades

- Clasificación NLI binaria: dado un par premisa-hipótesis, devuelve entailment (etiqueta 1) o no entailment (etiqueta 0).
- Uso como cross-encoder de puntuación y reranking: evalúa conjuntamente consulta y candidato, lo que ofrece mayor precisión que un bi-encoder a cambio de no permitir indexación previa.
- Integración como scorer `nli` dentro del framework `raz-systemone`, seleccionable con `--nli-model <dir>`.
- Evaluación de estados de tickets de soporte en inglés: el entrenamiento incluye 110 estados etiquetados y 725 pares derivados.
- Capacidad de generalización fuera de dominio limitada pero medible: 0,980 sobre 10.000 filas disjuntas de MNLI.
- Uso directo con `AutoModelForSequenceClassification` de transformers, con premise e hypothesis como entrada.
- Compatible con Text Embeddings Inference y con endpoints de HuggingFace, según las etiquetas del repositorio.
- No se documentan capacidades de generación de texto, tool calling, function calling, agentes, visión, audio ni modo de razonamiento explícito: no disponible.
- Capacidades multilingües: no disponibles; el modelo se entrena y evalúa únicamente en inglés.

## Casos de uso

- Verificación de grounding en pipelines RAG: dado un fragmento recuperado como premisa y una frase generada como hipótesis, el modelo comprueba si el contexto respalda la afirmación. Su alta puntuación en MNLI disjunto (0,980) lo hace adecuado para filtrar respuestas no sustentadas antes de mostrarlas.
- Detección de alucinaciones en generación aumentada: aplicar el cross-encoder sobre pares (contexto, frase generada) permite marcar frases sin implicación y activar una regeneración o una respuesta de abstención.
- Triaje y clasificación de tickets de soporte: el ajuste sobre 110 estados etiquetados permite mapear un ticket entrante a un estado descrito en lenguaje natural, útil para enrutado automático hacia el equipo correspondiente.
- Puntuación dentro del framework raz-systemone: sustituir el scorer por defecto mediante `--scorer nli --nli-model nli-base` para incorporar un juicio de implicación calibrado al pipeline de evaluación.
- Filtrado y curación de datasets: comparar pares de frases para detectar duplicados semánticos o reformulaciones que se implican mutuamente, y deduplicar corpus de instrucciones o de preguntas frecuentes.
- Evaluación automática de resúmenes: comprobar si cada frase del resumen queda implicada por el documento de origen, como señal de fidelidad, sin necesidad de referencias humanas.
- Control de consistencia en atención al cliente multi-turno: detectar contradicciones entre lo prometido en turnos anteriores y la respuesta que se va a enviar, tratando los turnos previos como premisa.
- Anotación asistida de datos de entrenamiento: preetiquetar pares premisa-hipótesis para que un revisor humano solo valide los casos dudosos, reduciendo el coste de construir nuevos conjuntos NLI.

## Benchmarks y rendimiento

Resultados publicados en la model card. Todas las particiones de evaluación corresponden a estados no vistos durante el entrenamiento. La métrica es la tasa de acierto sobre los juicios indicados.

| Split | Juicios | xsmall (v5) | base (v7) |
|---|---|---|---|
| holdout C | 60 | 0,900 | 0,983 |
| holdout D | 30 | 0,833 | 0,867 |
| holdout E | 30 | 0,900 | 0,833 |
| holdout F | 28 | 0,893 | 0,857 |
| holdout G | 29 | 0,897 | 0,897 |
| MNLI (disjunto) | 10.000 | 0,941 | 0,980 |

La decisión de selección documentada por el autor es la siguiente: el modelo base casi perfecciona la partición amplia de 60 estados (1 error) pero pierde frente al xsmall en las particiones pequeñas y dirigidas. Se recomienda el base para consultas amplias y el xsmall para el mejor equilibrio, con la ventaja adicional de que el xsmall permite reentrenamientos de unos 10 minutos frente a las aproximadamente 2 horas del base. No hay datos de MMLU, HumanEval, GSM8K ni de latencia.

## Requisitos de hardware

- Parámetros y pesos: 184,4 M parámetros; repositorio de 0,7 GB (aproximadamente 738 MB), consistente con pesos en fp32.
- VRAM estimada: en torno a 1 GB en fp32 para inferencia con lotes pequeños; en torno a 0,5 GB en fp16. La VRAM real depende del tamaño de lote y de la longitud de secuencia, con un límite práctico de 512 tokens por par.
- GPU recomendadas: cualquier GPU moderna sirve, dado el tamaño. Una RTX 3060 de 12 GB, una RTX 4090 o una T4 son más que suficientes y quedan limitadas por el tamaño de lote, no por memoria.
- Cabe en GPU de consumo: sí, en prácticamente cualquier GPU con 4 GB o más, e incluso en CPU para volúmenes moderados.
- Opciones de despliegue: `transformers` con `AutoModelForSequenceClassification`, Text Embeddings Inference (etiqueta `text-embeddings-inference`), endpoints de HuggingFace (etiqueta `endpoints_compatible`) y el pipeline propio de `raz-systemone` con `--scorer nli`.
- Inferencia generativa: vLLM, llama.cpp, Ollama y TGI no son aplicables como motores de generación, ya que el modelo no genera texto ni dispone de pesos GGUF. TGI podría alojar modelos de clasificación, pero no se documenta.
- Latencia y throughput: no disponibles. Al ser un cross-encoder, el coste crece linealmente con el número de pares a puntuar y no permite cachear representaciones del lado de la consulta como haría un bi-encoder.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| raz-systemone-nli-base (v7) | 184.424.451 | hasta 512 tokens (backbone DeBERTa-v3-base) | MIT | HuggingFace, 0 descargas al consultar | Ajustado sobre 725 pares de tickets + 200.000 filas MNLI; 0,983 en holdout C y 0,980 en MNLI disjunto |
| raz-systemone-nli-xsmall (v5) | no disponible | no disponible | no disponible | HuggingFace, referenciado en la model card | Mejor equilibrio en particiones pequeñas (0,900 / 0,833 / 0,900 / 0,893 / 0,897); reentrenamiento en unos 10 minutos |
| cross-encoder/nli-deberta-v3-base | mismo backbone (184,4 M; no confirmado en la información disponible) | hasta 512 tokens (DeBERTa-v3-base) | no disponible | HuggingFace | Modelo de partida; entrenado sobre SNLI y MNLI, sin ajuste de dominio de tickets. No se dispone de sus métricas en esta información |
| Otros cross-encoders NLI de tamaño base | no disponible | no disponible | no disponible | no disponible | No se dispone de datos comparables en la información proporcionada |

La comparación directa más fiable es contra el modelo hermano xsmall, porque ambos se evalúan sobre exactamente las mismas particiones. Frente al modelo base sin ajustar, la diferencia esperable está en el dominio de tickets de soporte, pero no hay cifras publicadas en la información disponible para cuantificarla.

## Limitaciones y advertencias

- Dominio muy estrecho: el ajuste se apoya en 190 tickets de soporte escritos a mano en inglés y 110 estados etiquetados. El rendimiento fuera de ese dominio depende casi por completo de la regularización con MNLI.
- El eje de frustración es el más débil según el propio autor, que lo señala como la dimensión peor resuelta en ambos modelos de la familia.
- Particiones pequeñas inestables: las métricas sobre holdout D, E y F son inferiores a las del xsmall, con diferencias de hasta 6,7 puntos en holdout E. Con 28-30 juicios por partición, la varianza estadística es alta y las conclusiones deben tomarse con cautela.
- Riesgo de alucinación: el modelo es un clasificador, no genera texto, pero puede producir falsos positivos de entailment que, en un pipeline RAG, dejarían pasar afirmaciones no respaldadas por el contexto.
- Idioma: solo inglés. No se documentan capacidades multilingües ni evaluación en otras lenguas.
- Contexto limitado: 512 tokens por par en el backbone, suficiente para frases y pasajes cortos, insuficiente para documentos largos sin troceado.
- Licencia MIT: permite uso comercial, modificación y redistribución, sin las restricciones de licencias de investigación. Conviene verificar igualmente las condiciones del modelo base y de los datos de MNLI en caso de redistribuir derivados.
- Sin tracción comunitaria: 0 descargas y 0 likes en el momento de la consulta, por lo que no hay validación externa ni informes de terceros sobre su comportamiento.
- Idoneidad para agentes y tool calling: no disponible; el modelo no está diseñado para ello.
- Advertencia de producción: el checkpoint no publica versiones cuantizadas ni métricas de latencia, por lo que el dimensionamiento debe medirse en el entorno real antes de desplegar.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/RazvanManolache/raz-systemone-nli-base
- Modelo base: https://huggingface.co/cross-encoder/nli-deberta-v3-base
- Repositorio del framework raz-systemone: https://github.com/RazvanManolache/raz-systemone
- Tabla maestra de evaluación: `training/README.md` del repositorio anterior
- Modelo hermano raz-systemone-nli-xsmall: referenciado en la model card, URL no confirmada en la información disponible
- Paper, blog o demo adicionales: no disponibles
