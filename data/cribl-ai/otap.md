# cribl-ai/OTAP

## Resumen

OTAP (Optimal Transport for Agentic Planning) es un método de evaluación para trayectorias de agentes basados en LLM, desarrollado por el Cribl AI Research Lab en colaboración con la Universidad de California en Los Ángeles (UCLA). No se trata de un modelo de lenguaje generativo, sino de una métrica y un conjunto de código de evaluación que reformula la evaluación de trayectorias de agentes como un problema de transporte Gromov-Wasserstein fusionado y no balanceado sobre grafos de dependencia atribuidos.

El problema que aborda es concreto: la práctica habitual de evaluación de agentes reduce una trayectoria completa (que intercala planificación, llamadas a herramientas y resultados intermedios) a un indicador binario de éxito, a una comparación por coincidencia exacta contra una referencia o a la delegación del juicio en otro modelo de lenguaje. Estos enfoques no distinguen una solución sólida de una afortunada, penalizan planes válidos pero reordenados o descompuestos de otra forma, y en el caso de los jueces LLM son no deterministas y no ofrecen explicaciones reproducibles.

La propuesta de OTAP es calcular una discrepancia normalizada entre el grafo de ejecución del agente y un conjunto de grafos de solución válidos. La puntuación resultante es invariante a reordenaciones que preservan dependencias, gestiona pasos ausentes o alucinados mediante marginales no balanceados y se descompone en subloses interpretables, de modo que una puntuación baja indica qué ha fallado (discrepancia semántica, dependencia rota, paso ausente o paso extra) y no solo que algo ha fallado. El repositorio tiene un tamaño de 0,0 GB y contiene el preprint, los scripts de experimentación y las dependencias.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | No aplica (métrica de evaluación basada en transporte óptimo Gromov-Wasserstein fusionado y no balanceado sobre grafos de dependencia atribuidos) |
| Parámetros totales | No disponible (no es un modelo neuronal) |
| Parámetros activos | No aplica |
| Longitud de contexto | No aplica |
| Tipos de cuantización | No aplica |
| Idiomas soportados | No disponible (la métrica es agnóstica al idioma, pero no se documenta un conjunto de idiomas evaluados) |
| Licencia | Apache 2.0 |
| Formato de pesos | No aplica (código Python; el solver central requiere solo NumPy y SciPy) |

## Arquitectura y entrenamiento

OTAP no entrena pesos. Su núcleo es un solver de transporte óptimo que resuelve un problema de transporte Gromov-Wasserstein fusionado con marginales no balanceados entre el grafo de ejecución del agente y cada uno de los K grafos de referencia válidos. Los nodos del grafo son pasos de la trayectoria (planes, llamadas a herramientas, resultados) con atributos semánticos obtenidos mediante embeddings de frases; las aristas codifican dependencias causales entre pasos. La componente de Gromov-Wasserstein captura la estructura relacional (qué depende de qué), mientras que la componente de Wasserstein sobre atributos captura la similitud semántica. Los marginales no balanceados permiten que pasos ausentes o alucinados no fuercen un emparejamiento artificial, y el resultado se normaliza para producir una puntuación comparable entre tareas.

El pipeline experimental se apoya en `sentence-transformers` (con el modelo `all-MiniLM-L6-v2` por defecto) para los embeddings y en `scikit-learn` para los análisis de correlación; el solver central solo necesita NumPy y SciPy. El repositorio incluye una suite de experimentos completa (`exp.py`) que genera las tres tablas del artículo en una sola ejecución sobre 20 tareas, 508 trayectorias y K=3 referencias por tarea, con semilla determinista (`seed=20260706`) y sin ajuste por corpus. También se ofrece un pipeline independiente para la parte A (`main.py`) con ablaciones opcionales y una línea base de juez LLM (requiere `anthropic` y `ANTHROPIC_API_KEY`). Como innovaciones destacables, la métrica es determinista, reproducible e interpretable por descomposición en subloses, y admite alternativas sin descarga de modelos (embedder hash, encoder TF-IDF).

## Capacidades

- Evaluación de trayectorias de agentes LLM mediante una distancia estructurada entre grafos de ejecución y grafos de solución válidos.
- Invariancia a reordenaciones que preservan dependencias, lo que evita penalizar planes válidos pero descompuestos de forma distinta.
- Manejo de pasos ausentes y de pasos alucinados mediante marginales no balanceados.
- Descomposición de la puntuación en subloses interpretables: discrepancia semántica, dependencia rota, paso ausente y paso extra.
- Evaluación determinista y reproducible, sin juez LLM en el pipeline de la métrica.
- Soporte de K referencias por tarea (K=3 en los experimentos publicados).
- Ablaciones configurables de cada componente (estructura, signo de la matriz de distancias, balance de marginales, transporte húngaro, embedding por paso completo, término de herramienta, número de referencias, soft-min y masa uniforme).
- Línea base opcional de LLM-as-a-judge para comparación.
- Soporte de ratings humanos externos para la parte B mediante `--human-ratings`.
- Modos de ejecución rápida (`--quick`) y de depuración sin descarga de modelos (`--embedder hash`).

## Casos de uso

- Evaluación de agentes en producción: integrado en un pipeline de CI/CD, OTAP permite puntuar cada trayectoria generada por un agente contra un conjunto de soluciones de referencia y detectar regresiones estructurales (dependencias rotas, pasos omitidos) que un indicador binario de éxito ocultaría.
- Comparación de variantes de un agente: al ser invariante a reordenaciones válidas y determinista, permite comparar de forma justa distintas estrategias de planificación o de descomposición de tareas sobre el mismo conjunto de tareas y referencias.
- Diagnóstico de fallos: la descomposición en subloses señala si el fallo es semántico, de dependencia, por paso ausente o por paso extra, lo que orienta la depuración del prompt, de las herramientas o del planificador.
- Investigación en evaluación de agentes: la suite `exp.py` reproduce las tablas de meta-evaluación por perturbaciones, correlación con calidad graduada y ablaciones, lo que facilita la comparación con nuevas métricas bajo el mismo protocolo (20 tareas, 508 trayectorias, K=3).
- Sustitución de jueces LLM en entornos con requisitos de reproducibilidad: al no depender de un modelo generativo, la puntuación es determinista y auditable, adecuada para informes regulatorios o auditorías internas.
- Validación de datos de entrenamiento para agentes: permite filtrar trayectorias sintéticas o generadas por modelos débiles midiendo su distancia estructural a soluciones válidas antes de usarlas en ajuste fino o en RL.
- Análisis de robustez frente a perturbaciones: los cinco familias de perturbación (paráfrasis, reordenación válida, fusión/división, inversión causal y corrupción) permiten construir pruebas de estrés específicas para agentes.

## Benchmarks y rendimiento

Los resultados publicados corresponden a una ejecución determinista (`seed=20260706`, embedder `all-MiniLM-L6-v2`), sin juez LLM en el pipeline y sin ajuste por corpus.

Tabla A: meta-evaluación por perturbaciones, precisión de ranking por pares (%). P1–P3 preservan la validez (paráfrasis, reordenación válida, fusión/división); P4 es inversión causal; P5 es corrupción (eliminación, alucinación, intercambio de herramienta). Mayor es mejor en todas las columnas.

| Métrica | P1 | P2 | P3 | P4 | P5 | P4>P5 | AUROC |
|---|---|---|---|---|---|---|---|
| Coincidencia exacta de pasos | 36,4 | 44,8 | 45,8 | 41,2 | 53,7 | 55,8 | 48,5 |
| BLEU | 49,2 | 67,2 | 52,8 | 48,3 | 70,7 | 68,3 | 59,9 |
| ROUGE-L | 56,7 | 45,8 | 82,9 | 84,4 | 47,7 | 21,1 | 67,4 |
| Embed greedy (estilo BERTScore) | 41,1 | 66,7 | 31,7 | 25,4 | 69,2 | 86,4 | 46,8 |
| Embed + Hungarian | 41,7 | 66,7 | 28,9 | 25,5 | 67,8 | 84,2 | 46,2 |
| OTAP (propuesto) | 89,4 | 100,0 | 54,7 | 70,7 | 93,6 | 98,3 | 82,0 |

Tabla B: correlación con calidad graduada (Spearman rho y Kendall tau, por tarea y promediado; "damaged-only" restringe a Q1–Q4).

| Métrica | rho (todas) | tau (todas) | rho (dañadas) | tau (dañadas) |
|---|---|---|---|---|
| Coincidencia exacta de pasos | 0,755 | 0,655 | 0,562 | 0,474 |
| BLEU | 0,883 | 0,765 | 0,827 | 0,691 |
| ROUGE-L | 0,723 | 0,619 | 0,503 | 0,418 |
| Embed greedy (estilo BERTScore) | 0,781 | 0,655 | 0,829 | 0,697 |
| Embed + Hungarian | 0,782 | 0,651 | 0,819 | 0,681 |
| OTAP (propuesto) | 0,923 | 0,837 | 0,851 | 0,748 |

Tabla C: ablaciones (cada fila elimina o sustituye un componente; "Benign (avg)" promedia PRA sobre P1–P3).

| Variante | Benign (avg) | P4 | P5 | AUROC | rho (B) |
|---|---|---|---|---|---|
| OTAP (completo) | 81,4 | 70,7 | 93,6 | 82,0 | 0,923 |
| (i) sin estructura (theta=0) | 54,4 | 19,4 | 90,6 | 54,5 | 0,771 |
| (ii) D sin signo | 81,4 | 69,7 | 94,7 | 82,0 | 0,925 |
| (iii) marginales balanceados | 78,5 | 67,0 | 91,7 | 79,2 | 0,929 |
| (iv) transporte húngaro | 50,7 | 18,1 | 85,5 | 51,4 | 0,787 |
| (v) embedding de paso completo | 71,7 | 72,2 | 72,7 | 72,5 | 0,895 |
| (vi) sin término de herramienta | 67,8 | 69,3 | 68,4 | 68,9 | 0,910 |
| (vii) K=1 referencia | 64,4 | 46,5 | 85,3 | 65,1 | 0,909 |
| (vii) soft-min T=1,0 | 78,8 | 66,1 | 93,3 | 79,5 | 0,923 |
| (viii) masa uniforme | 79,5 | 6 | No disponible | No disponible | No disponible |

## Requisitos de hardware

- No aplica VRAM para el solver central: requiere únicamente NumPy y SciPy y se ejecuta en CPU.
- El pipeline de evaluación completo necesita `sentence-transformers` (que arrastra PyTorch) y `scikit-learn`; el coste computacional depende del tamaño del embedder y del número de trayectorias y referencias.
- GPU recomendada: no se especifica en la información disponible; una GPU consumer con soporte CUDA es suficiente para acelerar los embeddings, aunque el solver en sí no la requiere.
- Cabe en cualquier GPU consumer para la fase de embeddings; el solver puede ejecutarse íntegramente en CPU.
- Opciones de despliegue: scripts de Python (`exp.py`, `main.py`) con dependencias instaladas vía `pip install -r requirements.txt`; no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI porque no es un modelo de inferencia.
- Latencia y throughput: no disponibles en la información proporcionada; la suite completa procesa 20 tareas y 508 trayectorias con K=3 referencias en una sola ejecución, pero no se publican tiempos.

## Comparativa con modelos similares

No se dispone de información sobre otras métricas de evaluación de trayectorias de agentes con las que comparar directamente en términos de parámetros, contexto o licencia, ya que OTAP no es un modelo de lenguaje. La comparación relevante es frente a las métricas incluidas como líneas base en el propio artículo:

| Métrica | Tipo | Determinista | Invariante a reordenación | Interpretable por subloses | Licencia |
|---|---|---|---|---|---|
| OTAP | Transporte óptimo sobre grafos | Sí | Sí | Sí | Apache 2.0 |
| Coincidencia exacta de pasos | Comparación literal | Sí | No | No | No aplica |
| BLEU | Solapamiento de n-gramas | Sí | No | No | No aplica |
| ROUGE-L | Solapamiento de subsecuencia | Sí | No | No | No aplica |
| Embed greedy (estilo BERTScore) | Similitud de embeddings | Sí | Parcial | No | No aplica |
| Embed + Hungarian | Asignación sobre embeddings | Sí | Parcial | No | No aplica |
| Juez LLM | Modelo generativo | No | No | No | Depende del proveedor |

## Limitaciones y advertencias

- No es un modelo de lenguaje: no genera texto ni puede usarse para inferencia, sino solo para evaluar trayectorias de agentes.
- Requiere un conjunto de grafos de solución de referencia válidos por tarea; la calidad de la evaluación depende de la cobertura y corrección de esas referencias.
- La ablación con K=1 referencia muestra una caída notable (Benign 64,4 frente a 81,4 con K=3), por lo que un conjunto de referencias insuficiente degrada la métrica.
- La ablación con masa uniforme (viii) aparece truncada en la información disponible (P4 = 6), por lo que no se puede valorar su comportamiento completo.
- Los resultados publicados se han obtenido con un único embedder (`all-MiniLM-L6-v2`) y una única semilla; no se documenta variabilidad entre semillas ni sensibilidad a otros embedders.
- El conjunto de evaluación es limitado (20 tareas, 508 trayectorias) y no se documenta su composición, dominio ni idioma, lo que limita la generalización de los resultados.
- No se documentan sesgos conocidos ni riesgos de alucinación del propio método; al no ser generativo, el riesgo de alucinación se limita a la calidad de los embeddings y de las referencias.
- La licencia Apache 2.0 permite uso comercial, pero el artículo está asociado al identificador arXiv 2607.17082 y no se detallan restricciones adicionales sobre los datos de evaluación.
- La línea base de juez LLM requiere una clave de API de Anthropic y no forma parte del pipeline determinista de la métrica.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/cribl-ai/OTAP
- Preprint: `OTAP.pdf` incluido en el repositorio (arXiv 2607.17082)
- Script de experimentos completos: `exp.py` en el repositorio
- Pipeline independiente de la parte A: `main.py` en el repositorio
- Dependencias: `requirements.txt` en el repositorio
