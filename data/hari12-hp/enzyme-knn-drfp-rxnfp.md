# hari12-hp/enzyme-knn-drfp-rxnfp

## Resumen

`hari12-hp/enzyme-knn-drfp-rxnfp` es un artefacto de recuperación (retrieval) para la predicción del número EC (Enzyme Commission) de reacciones enzimáticas a partir de su representación química. No es un modelo de lenguaje ni una red neuronal profunda: es un índice kNN (k-nearest neighbours) sobre representaciones moleculares de reacciones, concretamente una combinación ponderada de RXNFP y DRFP (fingerprints de reacción), con un fallback exclusivo a DRFP. Lo publica el usuario de Hugging Face `hari12-hp` (HARIPRASAD) y está pensado para ejecutarse en CPU, de forma offline, mediante un único comando.

El problema que resuelve es la clasificación multietiqueta de reacciones químicas en clases EC, un paso habitual en anotación funcional de enzimas y en pipelines de biología computacional. El autor reporta una precisión L4 de 0,56186 medida sobre el split original 80/10, y advierte explícitamente de que el índice final, entrenado con las 63.280 reacciones públicas etiquetadas, no debe usarse para recalcular esa métrica de desarrollo local (riesgo de fuga de datos).

Es relevante por su enfoque minimalista y reproducible: un índice de recuperación ligero (repo de 0,1 GB) que evita dependencias de GPU y ofrece un formato de salida JSONL con una clase EC por reacción única. La información pública disponible es muy escasa: no hay model card detallada, ni licencia declarada, ni idiomas, ni pipeline asignado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Recuperación kNN sobre fingerprints de reacción (mezcla ponderada RXNFP/DRFP, alpha=0,75) |
| Parametros totales | no disponible (no es un modelo neuronal con pesos entrenados; es un índice de vecinos) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (entrada: una reacción química por consulta) |
| Tipos de cuantizacion | no aplica (no hay pesos de red neuronal que cuantizar) |
| Idiomas soportados | no disponible (la tarea es química, no lingüística) |
| Licencia | no disponible |
| Formato de pesos | índice de recuperación empaquetado; repo de 0,1 GB; inferencia vía `predict.py` (no se especifican safetensors ni GGUF) |

## Arquitectura y entrenamiento

El sistema es un recuperador de vecinos más cercanos sobre representaciones de reacciones químicas. La configuración seleccionada es `{"mode": "mixed", "alpha": 0.75, "k": 5, "temperature": 0.07}`, es decir, una combinación lineal ponderada (alpha=0,75) de dos familias de fingerprints de reacción, RXNFP y DRFP, con k=5 vecinos y una temperatura de 0,07 aplicada presumiblemente al suavizado de las puntuaciones de similitud. Existe una configuración de reserva (fallback) exclusivamente DRFP con `{"mode": "drfp", "alpha": 0.5, "k": 5, "temperature": 0.07}`, útil si las representaciones RXNFP no están disponibles en el entorno de ejecución.

El índice final se construye sobre las 63.280 reacciones públicas etiquetadas del conjunto de entrenamiento permitido. El autor indica que la precisión L4 de 0,56186 se midió únicamente con el split original 80/10 y advierte de que el índice final no debe emplearse para recalcular la precisión de desarrollo local, ya que incluye todas las reacciones de entrenamiento. No se documentan detalles sobre el preprocesamiento químico, la tokenización SMILES, el criterio de similitud exacto (coseno, euclídea u otro) ni el proceso de selección de hiperparámetros.

## Capacidades

- Clasificación de reacciones enzimáticas en clases EC mediante recuperación de vecinos: devuelve una clase EC por reacción única en formato JSONL.
- Representación híbrida de reacciones combinando RXNFP y DRFP, con ponderación configurable.
- Modo fallback solo DRFP para entornos donde RXNFP no esté disponible.
- Ejecución offline en CPU, sin dependencia de GPU.
- Interfaz de línea de comandos de un solo comando: `python /app/predict.py --input INPUT --output predictions.jsonl`.
- Salida conforme al formato oficial JSONL de una EC por reacción única.
- No soporta tool calling, agentes, razonamiento multi-paso, visión, audio ni generación de texto: no es un modelo generativo.

## Casos de uso

- Anotación funcional de enzimas: dada una reacción catalizada, recuperar las k=5 reacciones etiquetadas más similares del índice para proponer una clase EC candidata, útil en pipelines de curación de bases de datos como BRENDA o UniProt.
- Enriquecimiento de datasets de reacciones públicas: clasificar lotes de reacciones sin etiqueta EC antes de incorporarlas a un corpus de entrenamiento, aprovechando que el índice cubre 63.280 reacciones y se ejecuta en CPU.
- Baseline reproducible para competiciones o retos de predicción EC: el propio autor lo presenta con una métrica L4 de referencia (0,56186) sobre el split 80/10, lo que permite comparar aproximaciones más complejas contra un método de recuperación simple.
- Prefiltrado en pipelines de diseño de enzimas: descartar o priorizar candidatos según su clase EC recuperada antes de pasar a métodos más costosos (docking, simulación MD).
- Herramienta docente o de exploración química: dado que corre offline en CPU y con un único comando, permite a estudiantes y grupos sin GPU experimentar con recuperación de reacciones y fingerprints RXNFP/DRFP.
- Integración en servicios internos de quimioinformática: al producir JSONL con una EC por reacción, encaja en colas de procesamiento por lotes o en tareas programadas sin infraestructura de aceleración.

## Benchmarks y rendimiento

| Metrica | Valor | Condiciones |
|---|---|---|
| Precisión L4 | 0,56186 | Split original 80/10, medido durante el desarrollo |

No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K u otros) en la información disponible, ya que no aplican a este tipo de artefacto. El autor advierte explícitamente de que el índice final no debe usarse para recalcular la precisión de desarrollo local.

## Requisitos de hardware

- VRAM: no aplica; la inferencia es en CPU y el repositorio ocupa 0,1 GB.
- GPU: no se requiere ninguna GPU (ni A100, ni H100, ni RTX 4090); el diseño es explícitamente offline y CPU-only.
- Cabe en cualquier equipo consumer: el índice y las dependencias de fingerprints caben holgadamente en memoria RAM convencional.
- Opciones de despliegue: ejecución directa mediante `python /app/predict.py`; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (no son aplicables a un índice kNN).
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|---|
| `hari12-hp/enzyme-knn-drfp-rxnfp` | kNN sobre RXNFP/DRFP | no aplica | no aplica | no disponible | Precisión L4 0,56186 en split 80/10 |
| `hari12-hp/enzyme-tfidf-logreg` | TF-IDF + regresión logística | no disponible | no aplica | no disponible | Publicado por el mismo autor; enfoque lineal sobre representaciones textuales |
| `hari12-hp/enzyme-retrieval-baseline` | Baseline de recuperación | no disponible | no aplica | no disponible | Publicado por el mismo autor; referencia base del pipeline |

No se dispone de datos de rendimiento de los modelos comparables en la información proporcionada, por lo que la comparación cuantitativa no está disponible.

## Limitaciones y advertencias

- El índice final incluye las 63.280 reacciones públicas de entrenamiento; usarlo para medir precisión local produce fuga de datos y sobreestima el rendimiento. La métrica válida (0,56186) solo aplica al split 80/10 original.
- Licencia no declarada: no hay garantía explícita de uso comercial; conviene contactar con el autor antes de integrarlo en producción.
- Información muy escasa: sin model card detallada, sin pipeline asignado, sin idiomas declarados y con 0 descargas y 0 likes en el momento de la consulta, lo que sugiere un artefacto de desarrollo sin validación externa.
- Riesgo de clasificación errónea en reacciones atípicas o poco representadas en el corpus público; el método kNN hereda los sesgos y la cobertura del conjunto de entrenamiento.
- Dependencia de las implementaciones de RXNFP y DRFP: si el entorno no reproduce exactamente las versiones usadas en el índice, las distancias pueden degradarse; el fallback DRFP mitiga parcialmente este riesgo.
- No es un modelo generativo ni un LLM: no admite prompts en lenguaje natural, tool calling, agentes ni razonamiento multi-paso.
- Latencia y throughput no documentados; el rendimiento real dependerá del tamaño del lote de consultas y de la implementación de búsqueda de vecinos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/hari12-hp/enzyme-knn-drfp-rxnfp
- Perfil del autor: https://huggingface.co/hari12-hp
- Modelo relacionado `enzyme-tfidf-logreg`: https://huggingface.co/hari12-hp/enzyme-tfidf-logreg
- Modelo relacionado `enzyme-retrieval-baseline`: https://huggingface.co/hari12-hp/enzyme-retrieval-baseline
