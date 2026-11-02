# rishivk144/enzyme-hybrid-sp

## Resumen

`rishivk144/enzyme-hybrid-sp` es un pipeline de clasificación enzimática que asigna un número EC (Enzyme Commission) completamente especificado a cada secuencia proteica. No es un modelo de lenguaje generativo al uso, sino un sistema híbrido que combina búsqueda por alineamiento (DIAMOND kNN) sobre un conjunto de entrenamiento y sobre UniProtKB/Swiss-Prot, con un clasificador neuronal MLP sobre embeddings congelados de ESM-2 8M (`facebook/esm2_t6_8M_UR50D`) como mecanismo de rescate para secuencias sin coincidencias.

El autor lo publica en el contexto de un leaderboard de predicción de números EC (etiquetas `leak-curber`, `enzyme`, `leaderboard`). La innovación principal es el control de fuga de datos: Swiss-Prot es la fuente de la que se construyó el propio benchmark, y el 85% de las entradas de validación aparecen literalmente en él. El pipeline descarta cualquier coincidencia externa con identidad ≥ 50% respecto a la entrada antes de votar, alineando el uso de datos externos con la separación por similitud de secuencia que aplica el benchmark.

El repositorio ocupa 0,2 GB y la inferencia corre en CPU con numpy; PyTorch solo se necesita para entrenar. No hay información pública sobre licencia, idiomas ni pipeline de HuggingFace, y el modelo no registra descargas ni likes en el momento de la consulta.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Híbrida: búsqueda por alineamiento DIAMOND (kNN) + MLP sobre embeddings ESM-2 8M |
| Parámetros totales | No disponible como modelo único; el extractor ESM-2 8M tiene ~8M de parámetros y el MLP es 320 → 1024 → 1024 → 4.614 |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No aplica (entrada: una secuencia proteica; sin ventana de contexto de tokens de texto) |
| Tipos de cuantización | No disponible (inferencia en numpy; sin pesos cuantizados publicados) |
| Idiomas soportados | No disponible (modelo sobre secuencias de aminoácidos, no sobre texto) |
| Licencia | No disponible |
| Formato de pesos | No disponible en la información proporcionada (se citan `weights/ext_accessions.json`, `weights/ext_meta.json`, `ec_vocabulary.json`, `train.parquet`) |

## Arquitectura y entrenamiento

El sistema es un pipeline de varias etapas. Primero, una pasada rápida de DIAMOND en modo por defecto alinea cada entrada única contra 186.488 secuencias de entrenamiento; después, una pasada de mejora en modo *very-sensitive* por lotes de 3.000 va sustituyendo coincidencias mientras quede tiempo. Una tercera pasada busca en 31.985 secuencias de Swiss-Prot (release 2026_03), descartando coincidencias con identidad ≥ 50% respecto a la entrada. Las 25 mejores coincidencias, combinando entrenamiento y externas, votan por sus ECs con peso `(bitscore / best bitscore) ** 16`, repartido 1/n entre los n ECs de cada coincidencia. Una pasada de rescate en modo *ultra-sensitive* cubre entradas aún sin coincidencias, y una pasada neuronal final atiende aproximadamente el 0,4% restante.

La rama neuronal usa ESM-2 8M como extractor de características congelado: el embedding es la media de la última capa sobre los residuos, calculada en numpy y verificada contra PyTorch con una diferencia máxima de 2e-6. Sobre esos embeddings se entrena un MLP 320 → 1024 → 1024 → 4.614 ECs con GELU y dropout 0.3, usando objetivos suaves (1/n por EC registrado) sobre todas las secuencias de entrenamiento. El clasificador se entrena solo con datos de entrenamiento. Como último recurso se devuelve el EC más frecuente del entrenamiento (`2.7.7.48`).

El control de fuga es el elemento técnico central. Swiss-Prot se filtró de 575.748 entradas descargadas a 238.288 con al menos un EC completo en el vocabulario, 202.065 secuencias únicas y 31.985 tras eliminar las idénticas a secuencias de entrenamiento. La búsqueda externa se ejecuta por separado de la de entrenamiento para que las copias casi exactas descartadas no desplacen coincidencias útiles fuera del top 25.

## Capacidades

- Predicción de un número EC completamente especificado por secuencia proteica (los ECs parciales como `1.1.1.-` se descartan del índice externo).
- Búsqueda de homólogos mediante alineamiento proteico con DIAMOND en varios niveles de sensibilidad (default, very-sensitive, ultra-sensitive).
- Votación ponderada por bitscore con reparto 1/n entre múltiples ECs por secuencia.
- Clasificación neuronal de respaldo mediante embeddings ESM-2 8M y MLP, para secuencias sin coincidencias.
- Control de fuga configurable por umbral de identidad (30%, 40%, 50%) sobre datos externos.
- Ejecución en CPU con numpy; sin requisito de GPU para inferencia.
- Gestión de presupuesto temporal con orden de prioridad explícito: mejora, externa, rescate, neuronal.
- No soporta tool calling, agentes, visión, audio ni generación de texto: no es un modelo de lenguaje.

## Casos de uso

- Anotación funcional de proteomas recién secuenciados: el pipeline asigna ECs a secuencias sin anotar buscando primero homólogos en el conjunto de entrenamiento y luego en Swiss-Prot, con la salvedad de que las coincidencias ≥ 50% de identidad se descartan, lo que lo hace adecuado para organismos con parientes lejanos ya caracterizados.
- Curado de bases de datos enzimáticas: como herramienta de triaje para proponer ECs candidatos que luego revisa un experto, con trazabilidad del bitscore y del número de coincidencias que sustentan cada voto.
- Evaluación de benchmarks de predicción de EC sin contaminación: el mecanismo de tope de identidad sirve como referencia metodológica para otros equipos que quieran usar Swiss-Prot como fuente externa sin copiar las respuestas del conjunto de validación.
- Clasificación de enzimas en pipelines de biología computacional con recursos limitados: al correr en CPU con numpy, puede desplegarse en nodos sin GPU o en flujos por lotes donde el coste de GPU no está justificado.
- Detección de familias enzimáticas poco representadas: la incorporación de Swiss-Prot aporta 1.387 ECs ausentes en el entrenamiento, útil para anotar actividades enzimáticas raras que el kNN sobre entrenamiento no cubriría.
- Investigación sobre fuga de datos en benchmarks biológicos: el código y los metadatos (`ext_accessions.json`, `ext_meta.json`) permiten reproducir el análisis de solapamiento entre Swiss-Prot y los conjuntos de validación y test.
- Rescate de secuencias huérfanas: la rama ESM-2 + MLP cubre el ~0,4% de entradas sin coincidencias por alineamiento, útil en conjuntos con proteínas muy divergentes.

## Benchmarks y rendimiento

Resultados de validación local sobre familias retenidas (clústeres MMseqs2 al 50% de identidad y 80% de cobertura; 1.092 clústeres completos, 11.804 secuencias), con crédito oficial 1/n:

| Modelo | L4 | L3 | L2 | L1 |
|---|---|---|---|---|
| EC más frecuente (baseline) | 0,011 | 0,055 | 0,143 | 0,381 |
| ESM-2 8M + MLP solo | 0,681 | 0,796 | 0,814 | 0,855 |
| DIAMOND kNN solo sobre entrenamiento | 0,817 | 0,928 | 0,940 | 0,970 |
| + Swiss-Prot con identidad < 30% | 0,819 | 0,928 | 0,941 | 0,971 |
| + Swiss-Prot con identidad < 40% | 0,835 | 0,950 | 0,961 | 0,977 |
| **+ Swiss-Prot con identidad < 50% (este modelo)** | **0,837** | **0,951** | **0,962** | **0,978** |
| + Swiss-Prot sin restricción (con fuga, solo comparación) | 0,839 | 0,952 | 0,963 | 0,979 |

El tope del 50% cuesta solo 0,2 puntos de L4 en el holdout, de modo que la ganancia procede de parientes lejanos y de ECs nuevos, no de copias cercanas. Una ejecución extremo a extremo de `predict.py` sobre el holdout dio 0,845, pero el autor la considera inflada porque el clasificador ESM-2 empaquetado se entrenó con todas las secuencias de entrenamiento, incluido el holdout; la estimación justa es 0,837. En el leaderboard de validación, los modelos anteriores obtuvieron 0,78097 (solo DIAMOND) y 0,78123 (este pipeline sin Swiss-Prot).

Análisis de errores (modelo solo con entrenamiento, holdout): 5,3 puntos de L4 perdidos porque el EC verdadero nunca aparece en el entrenamiento; el resto del desglose no está disponible en la información proporcionada.

## Requisitos de hardware

- Inferencia en CPU con numpy; no requiere GPU. PyTorch solo es necesario para el entrenamiento del MLP.
- VRAM estimada: no disponible; al ejecutarse en CPU, la restricción relevante es la memoria RAM para cargar los índices de alineamiento y los embeddings.
- GPU recomendadas: no aplica para inferencia; para entrenar el MLP, cualquier GPU con soporte PyTorch es suficiente dado el tamaño del modelo (8M de parámetros en el extractor, MLP de ~5M).
- Cabe en cualquier equipo de consumo, incluidos portátiles sin GPU dedicada, siempre que se disponga de espacio en disco para los índices DIAMOND.
- Opciones de despliegue: ejecución directa de `predict.py` con DIAMOND instalado; no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles. El pipeline gestiona un presupuesto temporal con prioridades (mejora, externa, rescate, neuronal) cuando el tiempo es limitado, lo que sugiere ejecución acotada por tiempo, pero no se publican cifras.

## Comparativa con modelos similares

| Modelo | Enfoque | Parámetros | Contexto | L4 (holdout) | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| enzyme-hybrid-sp (este) | DIAMOND kNN + Swiss-Prot con tope del 50% + MLP ESM-2 | ESM-2 8M + MLP ~5M | No aplica | 0,837 | No disponible | HuggingFace, 0 descargas |
| Variante sin Swiss-Prot (mismo autor) | DIAMOND kNN solo sobre entrenamiento | ESM-2 8M + MLP ~5M | No aplica | 0,817 | No disponible | Referenciada en la model card |
| Baseline EC más frecuente | Regla trivial | 0 | No aplica | 0,011 | No disponible | Referenciada en la model card |
| Swiss-Prot sin restricción (comparación) | DIAMOND kNN con datos externos sin tope | ESM-2 8M + MLP ~5M | No aplica | 0,839 (con fuga) | No disponible | Solo comparación metodológica |

No se dispone de datos de otros modelos comparables de predicción de EC en la información proporcionada.

## Limitaciones y advertencias

- Licencia no especificada: no hay garantía de uso comercial; conviene contactar con el autor antes de integrarlo en producción.
- Riesgo de fuga residual: aunque el tope del 50% reduce la contaminación, Swiss-Prot contiene el 85% de las entradas de validación de forma literal y el conjunto de test probablemente también; cualquier evaluación debe replicar el filtrado por identidad.
- Dependencia de la versión de Swiss-Prot: los resultados están ligados a la release 2026_03; actualizaciones posteriores pueden cambiar el comportamiento y las métricas.
- Cobertura limitada de ECs: 5,3 puntos de L4 se pierden en el holdout porque el EC verdadero no aparece nunca en el entrenamiento; el vocabulario cubre 4.614 ECs.
- Sesgo hacia actividades enzimáticas bien estudiadas: las enzimas poco caracterizadas o de organismos infrarrepresentados en Swiss-Prot y en el entrenamiento tienen menos probabilidad de recibir una predicción correcta.
- Riesgo de alucinación en sentido amplio: el fallback devuelve siempre `2.7.7.48` cuando todas las etapas fallan, lo que puede producir anotaciones incorrectas presentadas con aparente confianza.
- Sin soporte de texto, visión ni audio: no es un modelo de lenguaje y no debe usarse para tareas generativas.
- Dependencia de herramientas externas: requiere DIAMOND instalado y los índices correspondientes; la reproducibilidad depende de las versiones de DIAMOND y de los ficheros de pesos empaquetados.
- Sin métricas de latencia ni de throughput publicadas, lo que dificulta planificar despliegues con requisitos de tiempo.
- Repositorio sin descargas ni validación comunitaria: no hay evidencia independiente de su comportamiento fuera del holdout del autor.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/rishivk144/enzyme-hybrid-sp
- ESM-2 8M (extractor de características): https://huggingface.co/facebook/esm2_t6_8M_UR50D
- DIAMOND (alineador): https://github.com/bbuchfink/diamond
- UniProtKB/Swiss-Prot (release 2026_03): https://rest.uniprot.org/uniprotkb/stream
