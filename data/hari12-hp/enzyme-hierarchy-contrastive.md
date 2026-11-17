# hari12-hp/enzyme-hierarchy-contrastive

## Resumen

`enzyme-hierarchy-contrastive` es un modelo publicado en Hugging Face por el usuario `hari12-hp` bajo el nombre interno "Leak CURBER". Se trata de un artefacto de un pipeline de investigación centrado en *enzyme retrieval* (recuperación de enzimas) con etiquetas de química, y su arquitectura declarada es `hierarchy_contrastive`. El modelo se entrenó sobre una partición de desarrollo y reporta una accuracy de 0,491 en una métrica interna L4, valor que el propio autor advierte explícitamente que no es una puntuación de leaderboard.

El repositorio es de tamaño nulo (0,0 GB), no tiene descargas ni likes, y la model card es extremadamente escueta. No se detalla el número de parámetros, la longitud de contexto, los idiomas ni la licencia. El único dato operativo concreto es que la inferencia se ejecuta en CPU mediante un script `predict.py` que emplea pesos de PyTorch y huellas de reacción (*reaction fingerprints*) fijas, sin necesidad de RXNFP ni de una CNN sobre SMILES.

Por tanto, esta ficha debe interpretarse como una descripción de un modelo experimental de nicho, orientado a tareas de química computacional y clasificación jerárquica de enzimas, y no como un modelo de lenguaje generativo de propósito general. La información disponible es mínima y muchas especificaciones quedan marcadas como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `hierarchy_contrastive` (según model card; no se detalla la topología interna) |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | pesos de PyTorch (no se especifica safetensors, GGUF ni otro formato) |

## Arquitectura y entrenamiento

La model card indica únicamente que la arquitectura es `hierarchy_contrastive` y que el entrenamiento se realizó sobre la "development training partition". El nombre sugiere un esquema de aprendizaje contrastivo con estructura jerárquica, probablemente orientado a alinear representaciones de enzimas y reacciones en un espacio común, pero no se aporta ningún detalle sobre el número de capas, dimensión de embeddings, funciones de pérdida, tamaño del dataset ni composición del mismo. Tampoco se menciona el uso de RLHF, DPO ni ninguna fase de ajuste adicional.

El único detalle técnico reseñable es que la inferencia utiliza "huellas de reacción fijas" (*fixed reaction fingerprints*) y que no requiere RXNFP ni una CNN sobre SMILES. Esto implica que el modelo consume representaciones químicas precalculadas en lugar de texto SMILES en bruto, lo que simplifica el despliegue pero limita la flexibilidad del preprocesado. La accuracy reportada de 0,491 sobre la métrica L4 es una cifra de desarrollo, no comparable con resultados de benchmarks públicos.

## Capacidades

- Recuperación de enzimas (*enzyme retrieval*): el modelo está diseñado para emparejar reacciones químicas con enzimas relevantes en un espacio de representación contrastivo.
- Clasificación jerárquica: la etiqueta `hierarchy_contrastive` sugiere capacidad para organizar categorías en niveles (por ejemplo, familias y subfamilias enzimáticas).
- Procesamiento de huellas de reacción: consume *reaction fingerprints* fijas como entrada, no SMILES en bruto.
- Inferencia en CPU: el script `predict.py` está pensado para ejecutarse sin GPU.
- Generación de texto: no disponible; no se describe como modelo de lenguaje.
- Tool calling / function calling: no disponible.
- Soporte de agentes o razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible.
- Vision, audio o modo *thinking*: no disponible.

## Casos de uso

- Anotación funcional de enzimas en pipelines de biología computacional: dado un conjunto de reacciones con huellas precalculadas, el modelo puede recuperar enzimas candidatas para anotar bases de datos internas, aprovechando su entrenamiento contrastivo jerárquico.
- Priorización de candidatos en diseño de rutas biosintéticas: en un flujo de ingeniería metabólica, se usaría para ordenar enzimas candidatas para una reacción objetivo antes de validación experimental, reduciendo el espacio de búsqueda.
- Enriquecimiento de datasets de química: integrado en un script de preprocesado que calcule huellas de reacción y llame a `predict.py` para asignar etiquetas enzimáticas de forma masiva en CPU.
- Filtrado y *curation* de bases de datos de reacciones: el modelo puede emplearse como señal de similitud para detectar pares reacción-enzima plausibles y descartar anotaciones ruidosas.
- Prototipado académico en entornos sin GPU: al ejecutarse en CPU con pesos de PyTorch, es adecuado para laboratorios con recursos limitados que quieran reproducir o extender el experimento.
- Evaluación comparativa de representaciones químicas: sirve como *baseline* para medir si huellas de reacción fijas bastan frente a enfoques basados en RXNFP o CNN sobre SMILES.
- Docencia y experimentación en aprendizaje contrastivo jerárquico: útil como ejemplo reproducible de un pipeline de retrieval con métricas de desarrollo.

## Benchmarks y rendimiento

| Metrica | Valor | Nota |
|---|---|---|
| Development L4 accuracy | 0,49103713553204936 | Métrica interna de desarrollo; el autor indica que no es una puntuación de leaderboard |

No se han publicado resultados de benchmarks en la informacion disponible (MMLU, HumanEval, GSM8K u otros no aplican a este modelo).

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el diseño está pensado para CPU.
- GPU recomendadas: no aplica según la model card; la inferencia se ejecuta con `python /app/predict.py --input INPUT --output OUTPUT`.
- Compatibilidad con GPU de consumo: no disponible; no se documenta aceleración por GPU.
- Opciones de despliegue: script propio de PyTorch (`predict.py`) con pesos entrenados y huellas de reacción fijas. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye modelos comparables de la misma categoría (retrieval de enzimas con arquitectura contrastiva jerárquica), ni datos de rendimiento que permitan una comparación rigurosa.

## Limitaciones y advertencias

- Información extremadamente escasa: la model card no documenta parámetros, contexto, dataset ni licencia, lo que impide evaluar su idoneidad en producción.
- Licencia no disponible: no puede confirmarse el uso comercial; debe contactarse con el autor antes de cualquier despliegue productivo.
- Métrica de desarrollo: la accuracy L4 de 0,491 es una cifra interna y no validada en leaderboards ni en conjuntos de test públicos.
- Dependencia de huellas de reacción fijas: el preprocesado debe replicar exactamente el esquema de *fingerprints* usado en entrenamiento; cualquier variación invalida las predicciones.
- Sin RXNFP ni CNN sobre SMILES: no admite entrada directa de cadenas SMILES, lo que limita su integración con herramientas estándar de quimioinformática.
- Riesgo de sesgo y alucinación: no evaluable con la información disponible; al ser un modelo discriminativo de retrieval, el riesgo principal es recuperar enzimas incorrectas con alta confianza.
- Idiomas y contexto: no documentados; no debe asumirse soporte multilingüe ni ventanas de contexto largas.
- Repositorio de 0,0 GB: el tamaño real de los pesos no está claro en la metadata, lo que puede indicar que los artefactos no están subidos o que la medición es imprecisa.
- Cero descargas y cero likes: no hay evidencia de uso externo ni de validación por la comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/hari12-hp/enzyme-hierarchy-contrastive
- No se han encontrado en la búsqueda web papers, blogs, repositorios ni demos adicionales asociados a este modelo.
