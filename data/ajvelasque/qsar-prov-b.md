# ajvelasque/qsar-prov-b

## Resumen

`ajvelasque/qsar-prov-b` es un modelo predictivo de QSAR (Quantitative Structure-Activity Relationship) publicado en Hugging Face por Ana Julia Velasque mediante la plataforma de código abierto QSAR IA, orientada al ciclo de vida completo de proyectos de quimioinformática y descubrimiento de fármacos. El repositorio no declara pipeline, idiomas ni arquitectura, y su tamaño es de 0.0 GB, lo que sugiere que los pesos no están alojados o que el artefacto es de muy pequeño tamaño (posiblemente un modelo clásico serializado o un contenedor de metadatos).

La relevancia del modelo es metodológica más que de rendimiento: se presenta como un artefacto reproducible dentro del ecosistema QSAR IA, con trazabilidad de autoría declarada a través de `projects/provenance.json` y hashes en `provenance_manifest.json`. No se trata de un modelo de lenguaje ni de un transformer generativo, sino de un modelo de regresión/clasificación supervisada sobre descriptores moleculares, categoria en la que la comparación con LLMs no aplica.

Dado que la model card no incluye información sobre el endpoint predicho, el dataset de entrenamiento, los descriptores utilizados ni las métricas obtenidas, esta ficha documenta exclusivamente lo verificable en la información disponible y marca explícitamente como "no disponible" todo aquello que el autor no ha publicado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo QSAR; no se especifica el algoritmo) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo tabular/descriptor-based, no secuencial) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no aplica a modelos QSAR) |
| Licencia | MIT |
| Formato de pesos | no disponible (tamano del repo: 0.0 GB) |

## Arquitectura y entrenamiento

No se ha publicado información sobre la arquitectura del modelo. Por la naturaleza del repositorio (etiquetas `qsar`, `cheminformatics`, `drug-discovery`, `machine-learning`) y por la plataforma de origen (QSAR IA), se trata de un modelo de aprendizaje supervisado que mapea descriptores moleculares a una propiedad biológica o fisicoquímica, no de un transformer. El algoritmo concreto (regresión lineal, Random Forest, Gradient Boosting, SVM, red neuronal u otro) no está declarado.

Tampoco se especifican el número de compuestos de entrenamiento, la composición del dataset, el conjunto de descriptores (por ejemplo, fingerprints de Morgan, descriptores de RDKit, CDK o PaDEL), el protocolo de validación (hold-out, validación cruzada, test externo) ni si hubo ajuste de hiperparámetros. La única información de trazabilidad es la referencia a `projects/provenance.json` y `provenance_manifest.json`, que el propio autor advierte que no constituyen prueba criptográfica de autoría.

## Capacidades

- Predicción de propiedades moleculares en el marco de estudios QSAR (endpoint concreto no declarado).
- Integración en flujos de trabajo de quimioinformática gestionados por la plataforma QSAR IA.
- Reproducibilidad científica: el repositorio incluye metadatos de procedencia y hashes de ficheros verificables al importar.
- Reutilización por la comunidad investigadora bajo licencia MIT.
- No se declara soporte de tool calling, function calling, agentes, razonamiento multi-paso, visión, audio ni modo "thinking", por tratarse de un modelo predictivo tabular y no de un modelo generativo.
- Capacidades multilingües: no aplica.

## Casos de uso

- Cribado virtual de compuestos: usar el modelo para puntuar librerías químicas y priorizar candidatos antes de ensayos in vitro, siempre que el endpoint predicho coincida con el objetivo del proyecto (el autor no lo especifica, por lo que debe verificarse antes de su uso).
- Reproducción de resultados publicados: al estar alojado con manifiesto de procedencia, permite reconstruir predicciones de un estudio QSAR concreto y auditar la coherencia de los artefactos.
- Docencia en quimioinformática: ejemplo funcional de un pipeline QSAR completo generado con una plataforma abierta, útil para ilustrar el flujo descriptor → modelo → predicción.
- Integración en pipelines de la plataforma QSAR IA: el modelo puede importarse en proyectos gestionados por la plataforma, que valida la consistencia de `provenance.json` y los hashes.
- Filtrado temprano en proyectos de descubrimiento: descartar compuestos con predicciones desfavorables antes de cálculos más costosos (DFT, docking), reduciendo el espacio de búsqueda.
- Base para comparación metodológica: servir como referencia frente a modelos QSAR propios, aunque la ausencia de métricas publicadas limita la comparación cuantitativa.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye R², RMSE, MAE, AUC, accuracy ni ningún otro indicador de rendimiento, ni sobre conjunto de entrenamiento ni sobre validación externa.

## Requisitos de hardware

- VRAM estimada: no disponible; el tamaño del repositorio es 0.0 GB, lo que sugiere que la inferencia no requiere GPU dedicada.
- GPU recomendadas: no disponible; por la naturaleza del modelo (QSAR tabular), la CPU es suficiente en la mayoría de los casos.
- Cabe en cualquier GPU consumer y previsiblemente en CPU; no se dispone de datos para confirmarlo.
- Opciones de despliegue: no disponible. No se declara formato de pesos (safetensors, GGUF, pickle, joblib, ONNX u otro), por lo que no puede confirmarse compatibilidad con vLLM, llama.cpp, Ollama, TGI ni ningún runtime concreto.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye modelos QSAR comparables con parámetros, contexto o licencia verificables, y la ausencia de métricas publicadas impide establecer una comparación cuantitativa con alternativas de la misma categoría.

## Limitaciones y advertencias

- Ausencia total de métricas: sin R², RMSE, AUC u otras medidas, no es posible evaluar la calidad predictiva ni el dominio de aplicabilidad del modelo.
- Endpoint no declarado: se desconoce qué propiedad predice el modelo, lo que impide validar su idoneidad para un proyecto concreto sin inspeccionar los artefactos.
- Riesgo de extrapolación fuera del dominio químico de entrenamiento: como todo modelo QSAR, las predicciones sobre scaffolds no representados en el conjunto de entrenamiento pueden ser poco fiables; el autor no documenta el espacio químico cubierto.
- Riesgo de alucinación en sentido estricto no aplica (no es generativo), pero sí existe riesgo de predicciones espurias por sobreajuste, no cuantificado.
- Licencia MIT: permite uso comercial y modificación, pero el autor no ofrece garantías de idoneidad ni asume responsabilidad por decisiones tomadas a partir de las predicciones.
- Procedencia declarada, no criptográfica: los manifiestos de QSAR IA son verificación de consistencia, no prueba de autoría, según advierte el propio autor.
- Repositorio sin descargas ni likes en el momento de la consulta, lo que reduce la evidencia externa de uso y validación por terceros.
- No debe emplearse en decisiones regulatorias o clínicas sin validación independiente y sin documentación del protocolo de entrenamiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ajvelasque/qsar-prov-b
- ORCID de la autora: https://orcid.org/0009-0006-4627-958X
- Perfil de Hugging Face de la autora: https://huggingface.co/ajvelasque
- Repositorio de la plataforma QSAR IA: https://github.com/altobellibm/qsar_ia_project
- Revisión sobre QSAR integrado con IA (PMC): https://pmc.ncbi.nlm.nih.gov/articles/PMC12525248/
- Revisión sobre QSAR integrado con IA (MDPI): https://www.mdpi.com/1422-0067/26/19/9384
