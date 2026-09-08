# leslie721007/Qiushi-Engine-Principle-Guided-Frontier-Advancement

## Resumen

El modelo Qiushi-Engine-Principle-Guided-Frontier-Advancement es la tercera etapa del programa de investigación BabyLM Strict-Small del motor Qiushi, desarrollado por leslie721007 (Shuxing Yang). Se trata de un encoder Transformer DeBERTa-v2 de 36,4 millones de parámetros con dos adaptadores residuales secuenciales, entrenado con un presupuesto limitado de 10 millones de palabras en inglés. Su propósito es estudiar cómo continuar el entrenamiento de un modelo de lenguaje pequeño conservando el comportamiento aprendido, mediante técnicas de enmascaramiento denso y preservación de entradas ordinarias. El pipeline es fill-mask: sirve para predicción de tokens enmascarados, puntuación de frases y fine-tuning como encoder. Su relevancia radica en la investigación sobre aprendizaje eficiente en datos y continuidad del entrenamiento, dentro del desafío BabyLM 2026.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | DeBERTa-v2 con dos rutas de adaptadores residuales secuenciales |
| Parámetros totales | 36.458.592 (incluida la cabeza de MLM) |
| Parámetros activos | No aplica (modelo denso) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | inglés (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (requiere código personalizado) |
| Pipeline | fill-mask |
| Biblioteca | transformers (trust_remote_code=True) |
| Parámetros del encoder | 36.210.368 |
| Parámetros del segundo adaptador | 995.584 |
| Capas / tamaño oculto / cabezas de atención | 8 / 480 / 8 |
| Bottleneck del adaptador / escalas | 128 / 1,75 y 0,75 |
| Tokenizador | BPE de nivel byte, 16.384 entradas |
| Presupuesto de corpus | 10.000.000 palabras contadas en 64.740 filas |
| Exposición acumulada registrada | 89.685.369 palabras |

## Arquitectura y entrenamiento

El modelo es un encoder DeBERTa-v2 con dos rutas de adaptadores residuales secuenciales. La estructura base incluye una cabeza de modelo de lenguaje enmascarado (MLM) de 248.224 parámetros (diferencia entre 36.458.592 y 36.210.368). El segundo adaptador añade 995.584 parámetros. El entrenamiento corresponde a la etapa III del programa, continuando desde el modelo Stage I, y solo se actualiza el segundo adaptador.

La metodología de la etapa III emplea un enmascaramiento más denso en cada reescritura mientras se conserva el pasaje fuente, aplica la pérdida de predicción únicamente en posiciones seleccionadas y añade una pérdida adicional que mantiene las predicciones sobre entradas enmascaradas de forma ordinaria cercanas a las del modelo padre. El presupuesto de datos es de 10 millones de palabras contadas en 64.740 filas, con una exposición acumulada registrada de 89.685.369 palabras. No se menciona el uso de RLHF ni DPO.

## Capacidades

- Predicción de tokens enmascarados (fill-mask).
- Puntuación probabilística de secuencias o frases.
- Extracción de representaciones para fine-tuning de encoder en tareas aguas abajo.
- Evaluación en componentes del benchmark BabyLM Strict-Small: BLiMP, Supplement, EWoK, Entity, COMPS, SuperGLUE, GlobalPIQA, Reading y Age of Acquisition (AoA).
- Capacidades multilingües: no, el modelo está entrenado solo en inglés.
- Soporte de tool calling, agentes, generación autoregresiva de texto, visión o audio: no disponible.
- Permite configurar dos adaptadores residuales secuenciales con sus respectivas escalas.

## Casos de uso

- Investigación en eficiencia de datos: permite comparar métodos de continuación de entrenamiento bajo un presupuesto corpus limitado, como requiere la tarea BabyLM Strict-Small.
- Puntuación de frases en inglés: puede usarse para evaluar la probabilidad de secuencias y detectar anomalías gramaticales en corpus pequeños.
- Fine-tuning de encoder en clasificación de texto: por ejemplo, tareas de SuperGLUE, utilizando el modelo con ambos adaptadores y semilla 42.
- Experimentos de destilación de conocimiento: la pérdida de preservación de entradas ordinarias está diseñada para mantener las predicciones cercanas a un modelo padre, lo que facilita estudiar destilación entre etapas.
- Análisis de adquisición de vocabulario: la puntuación de Age of Acquisition (AoA) permite estudiar cómo el modelo evoluciona en la adquisición de palabras a lo largo de checkpoints.
- Desarrollo de encoders para comprensión lectora con datos muy reducidos: puede adaptarse a la tarea Reading del benchmark BabyLM, aunque la puntuación local es baja.

## Benchmarks y rendimiento

Resultados locales de la evaluación completa de BabyLM Strict-Small, con fine-tuning del encoder en SuperGLUE usando semilla 42:

| Componente | Puntuación |
|---|---|
| BLiMP | 68,2600 |
| Supplement | 63,2800 |
| EWoK | 49,8200 |
| Entity | 29,4000 |
| COMPS | 52,1600 |
| SuperGLUE | 69,0477 |
| GlobalPIQA | 40,0500 |
| Reading | 8,2000 |
| AoA | 0,0000 |
| Overall | 42,2464 |

El Overall es la media aritmética de los nueve componentes. La puntuación de AoA es 0,0, evaluada en 18 checkpoints. No se han publicado resultados de benchmarks estándar de LLM (MMLU, HumanEval, GSM8K) porque este modelo es un encoder de enmascaramiento, no un modelo de propósito general.

Comparación interna de métodos de continuación, todos partiendo del mismo modelo Stage I:

| Método | Continuación seed 62064 | Continuación seed 62065 |
|---|---|---|
| Stage I parent | 42,0240 | 42,0240 |
| Continuación ordinaria | 42,0926 | 42,1159 |
| Enmascaramiento de entrada denso, supervisión de destino dispersa | 42,2025 | 42,1789 |
| Con preservación de entrada ordinaria | 42,2464 | 42,2317 |

## Requisitos de hardware

El autor no proporciona requisitos de hardware específicos en la información disponible. Dado el número de parámetros (36,4 millones) y la implementación con transformers, la inferencia es factible en GPU de consumo y también en CPU, aunque no se han publicado medidas de latencia ni memoria.

- VRAM estimada para inferencia: no disponible en la información proporcionada. Por tamaño de parámetros, en FP32 el modelo ocuparía aproximadamente 146 MB; en FP16, unos 73 MB.
- GPU recomendadas: no especificadas.
- Despliegue: mediante transformers con trust_remote_code=True. No se menciona soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

La información proporcionada no contiene datos de comparación con otros modelos externos del mismo tamaño. La comparación disponible es interna al programa de investigación, utilizando el modelo compañero y variantes metodológicas. El modelo asociado es Qiushi-Engine-Frontier-Advancement, también de leslie721007, que forma parte del mismo programa. No se disponen de especificaciones ni evaluaciones de ese modelo en la información analizada, por lo que la comparativa externa se indica como no disponible.

## Limitaciones y advertencias

- Es un modelo de investigación experimental, no destinado a producción sin una validación previa.
- Solo soporta inglés.
- Los resultados de la evaluación completa son locales y dependen de una única semilla de fine-tuning (seed 42), por lo que la variabilidad entre semillas no está caracterizada.
- Los componentes AoA (0,0) y Reading (8,2) presentan puntuaciones muy bajas, lo que indica debilidad en esas tareas específicas.
- Requiere código personalizado (trust_remote_code=True), lo que implica revisar el código cargado antes de su uso.
- La licencia Apache-2.0 cubre los pesos y el código original, pero las fuentes de datos conservan sus licencias originales según el documento DATA.md.
- No se ha realizado una evaluación explícita de sesgos.
- No es un modelo de conversación ni de generación libre; no dispone de tool calling, agentes ni soporte multimodal.
- La longitud de contexto no está especificada en la información proporcionada.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/leslie721007/Qiushi-Engine-Principle-Guided-Frontier-Advancement
- Modelo compañero: https://huggingface.co/leslie721007/Qiushi-Engine-Frontier-Advancement
- Perfil del autor en HuggingFace: https://huggingface.co/leslie721007
- Artículo sobre Qiushi Discovery Engine, proyecto del mismo autor, no confundir con este modelo: https://arxiv.org/abs/2604.27092
