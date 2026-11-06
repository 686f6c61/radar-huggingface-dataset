# Da24b048/enzyme-retrieval-bert

## Resumen

Enzyme-retrieval-bert es un modelo de recuperación de enzimas que mapea reacciones químicas a sus códigos EC (Enzyme Commission) mediante un ensemble de modelos BERT especializados en reacciones químicas (rxnfp). Lo publica el usuario Da24b048 en Hugging Face y está orientado a la anotación funcional de enzimas a partir de ecuaciones de reacción, un problema central en biología computacional y biocatálisis.

El sistema combina varios reaction BERT afinados con objetivos multi-EC suaves y cabezas auxiliares de clasificación en los niveles L1, L2 y L3 de la jerarquía EC, junto con un componente de recuperación kNN sobre fingerprints de reacción TF-IDF. La inferencia se ejecuta en CPU con cuantización int8 y utiliza mean pooling sobre las representaciones del tokenizador de reacciones. La model card indica que las reacciones se emplean tal cual, sin canonicalización previa.

La relevancia del modelo es acotada pero específica: cubre un hueco poco atendido por los LLM generalistas, que es la predicción estructurada de clases EC a partir de reacciones, con una interfaz de línea de comandos simple (`predict.py`). No obstante, el repositorio no aporta información sobre licencia, idiomas, pipeline ni resultados de evaluación, lo que limita su adopción en producción sin una validación adicional por parte del usuario.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Ensemble de reaction BERT (rxnfp) con mean pooling, cabezas auxiliares L1/L2/L3 y componente kNN sobre fingerprints TF-IDF |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | int8 (inferencia en CPU) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | no disponible (repo de 0,3 GB; la model card no especifica safetensors ni GGUF) |

## Arquitectura y entrenamiento

La arquitectura se describe en la model card como un ensemble de modelos BERT afinados sobre representaciones de reacciones químicas (rxnfp), con mean pooling para obtener el vector de frase. Cada miembro del ensemble incorpora cabezas auxiliares para predecir los niveles L1, L2 y L3 de la jerarquía EC, además de un objetivo principal multi-EC suave (soft targets), lo que permite manejar la ambigüedad cuando una reacción puede asociarse a más de una clase enzimática. El entrenamiento incluye aumentación mediante barajado de reactivos y productos (reactant/product shuffle augmentation).

El sistema se completa con un componente de recuperación kNN que opera sobre fingerprints de reacción TF-IDF; la predicción final es una mezcla (blend) entre la salida del ensemble neuronal y la recuperación por similitud. No se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de RLHF o DPO (poco probables en este tipo de modelo). Tampoco se detalla el número de modelos que componen el ensemble ni el tamaño de cada uno.

## Capacidades

- Predicción de códigos EC (Enzyme Commission) a partir de ecuaciones de reacción química.
- Clasificación jerárquica en los niveles L1, L2 y L3 de la taxonomía EC mediante cabezas auxiliares.
- Manejo de etiquetas múltiples (multi-EC) con objetivos suaves, adecuado para reacciones con ambigüedad funcional.
- Recuperación por similitud (kNN) sobre fingerprints de reacción TF-IDF como señal complementaria al ensemble neuronal.
- Aumentación robusta frente a variaciones en el orden de reactivos y productos (shuffle augmentation).
- Inferencia en CPU con cuantización int8, sin necesidad de GPU.
- Interfaz de línea de comandos mediante `python /app/predict.py --input INPUT --output OUTPUT`.
- No se documentan capacidades de generación de texto libre, tool calling, agentes, visión, audio ni modo thinking.

## Casos de uso

- Anotación funcional de enzimas en pipelines de biocuración: dado un conjunto de reacciones procedentes de bases de datos como Rhea o MetaCyc, el modelo asigna códigos EC candidatos para revisión manual, acelerando la clasificación en los niveles L1-L3.
- Enriquecimiento de bases de datos metabolómicas: integración del predictor en flujos que convierten reacciones huérfanas en anotaciones EC provisionales, con el componente kNN aportando evidencia por similitud a reacciones ya anotadas.
- Descubrimiento de enzimas en genomas y metagenomas: priorización de candidatos enzimáticos al contrastar la reacción catalizada esperada con las clases EC predichas por el ensemble.
- Diseño de rutas biosintéticas: verificación de que las reacciones propuestas en una ruta encajan con familias EC plausibles, usando las salidas multi-EC para explorar alternativas enzimáticas.
- Docencia y formación en bioinformática: herramienta de bajo coste (CPU, int8) para ilustrar la relación reacción-EC y la jerarquía de clasificación enzimática en entornos sin GPU.
- Preprocesado para modelos generativos de enzimas: uso de las predicciones EC como etiquetas auxiliares o conditioning en pipelines de generación o recuperación de secuencias enzimáticas.
- Validación cruzada de anotaciones existentes: detección de discrepancias entre el EC asignado en una base de datos y el predicho por el ensemble, señalando posibles errores de curación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no aplica; la model card indica inferencia en CPU con cuantización int8.
- GPU recomendadas: no disponibles; el diseño está pensado para ejecución en CPU.
- Compatibilidad con GPU de consumo: no documentada; el modelo está cuantizado a int8 y orientado a CPU, por lo que no requiere GPU dedicada.
- Opciones de despliegue: script propio `predict.py` con argumentos `--input` y `--output`; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles. El tamaño del repositorio (0,3 GB) sugiere un conjunto de pesos moderado, pero se desconoce el número de modelos del ensemble y, por tanto, el coste real por predicción.

## Comparativa con modelos similares

| Modelo | Tipo | Enfoque | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Enzyme-retrieval-bert (este) | Ensemble BERT + kNN TF-IDF | Reacción a EC (L1-L3) | no disponible | no disponible | Hugging Face, 0 descargas |
| Modelos basados en rxnfp (p. ej. clasificadores de reacción publicados en la literatura) | BERT sobre fingerprints de reacción | Clasificación de reacciones | no disponible | variable | Repositorios académicos |
| ECRECer / herramientas de anotación EC basadas en deep learning | Redes neuronales / transformers | Predicción de EC a partir de secuencia o reacción | no disponible | variable | Publicaciones y repos académicos |
| LLM generalistas con prompting | Transformer decoder | Predicción EC vía prompt | variable | variable | APIs y pesos abiertos |

No se dispone de datos cuantitativos de rendimiento para establecer una comparación numérica con alternativas; la comparación anterior es únicamente cualitativa y basada en el enfoque metodológico.

## Limitaciones y advertencias

- No se especifica la licencia, lo que impide determinar si el uso comercial está permitido; debe contactarse con el autor antes de cualquier despliegue productivo.
- El repositorio no incluye información sobre el dataset de entrenamiento, el número de modelos del ensemble ni los hiperparámetros, lo que dificulta la reproducibilidad.
- No se han publicado métricas de evaluación (accuracy, F1 por nivel EC, cobertura), por lo que el rendimiento real es desconocido.
- Las reacciones se usan sin canonicalización, de modo que variaciones en la representación de la ecuación (orden de átomos, estereoquímica, formato SMILES/SMARTS) pueden afectar a las predicciones.
- El componente kNN depende de un índice TF-IDF cuyo vocabulario y corpus no se documentan; su comportamiento fuera de la distribución de entrenamiento es incierto.
- Riesgo de alucinación estructural: al ser un clasificador, puede asignar códigos EC plausibles pero incorrectos en reacciones poco representadas o novedosas.
- No hay información sobre sesgos por familia enzimática ni sobre el equilibrio del dataset entre clases EC, lo que puede traducirse en un rendimiento desigual entre organismos o tipos de reacción.
- No se documentan idiomas soportados ni capacidades multilingües; el modelo opera sobre representaciones químicas, no sobre texto natural.
- La inferencia en CPU con int8 puede degradar ligeramente la precisión frente a los pesos originales en punto flotante; no se cuantifica esa pérdida.
- Ausencia de pipeline declarado en Hugging Face y de ejemplos de uso más allá del comando CLI, lo que incrementa el coste de integración.

## Enlaces

- Hugging Face: https://huggingface.co/Da24b048/enzyme-retrieval-bert
- No se han encontrado en la información proporcionada papers, blogs, repositorios adicionales ni demos asociados al modelo.
