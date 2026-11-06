# AbhijeetKumar2125/da3410-ec-retrieval-v7

## Resumen

DA3410 – Leak CURBER Enzyme Classification (Retrieval v7) es un sistema de clasificación enzimática basado en recuperación (retrieval) por similitud de secuencias, no un modelo de lenguaje neuronal. Desarrollado por el usuario AbhijeetKumar2125 en el contexto de la tarea DA3410, utiliza MMseqs2 para buscar cada secuencia de consulta contra una base de datos de referencia precompilada y asigna números EC (Enzyme Commission) mediante votación jerárquica ponderada por similitud. El repositorio ocupa 1,6 GB, principalmente por la base de datos MMseqs2 incluida.

La relevancia de este artefacto es acotada: se trata de un pipeline de inferencia empaquetado con su base de datos, scripts de predicción, vocabulario EC y Dockerfile, orientado a reproducir una solución concreta de un reto de clasificación. No es un modelo fundacional ni un transformer; es un sistema determinista de búsqueda y votación que no requiere GPU ni entrenamiento en tiempo de inferencia.

Conviene subrayar que la ficha describe un sistema de retrieval y no un LLM: las secciones de arquitectura, benchmarks y requisitos de hardware se interpretan en ese contexto. No hay información publicada sobre rendimiento en benchmarks ni sobre idiomas, y la licencia MIT permite uso comercial con las condiciones habituales de atribución.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Pipeline de retrieval con MMseqs2 y votación jerárquica ponderada por similitud (no neuronal) |
| Parametros totales | no disponible (no aplica; sistema basado en búsqueda en base de datos) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no aplica) |
| Tipos de cuantizacion | no disponible (no aplica) |
| Idiomas soportados | no disponible (entrada: secuencias de proteínas; salida: etiquetas EC) |
| Licencia | MIT |
| Formato de pesos | Base de datos MMseqs2 precompilada (`mmseqs_db/`), vocabulario EC en JSON, anotaciones TSV; sin pesos en safetensors ni GGUF |

## Arquitectura y entrenamiento

El sistema no entrena una red neuronal. Su "modelo" es una base de datos de secuencias de referencia con anotaciones EC (`full_retrieval_train_labels.tsv`) y un algoritmo de votación implementado en `predict.py`. Para cada consulta, MMseqs2 recupera los hits más similares de la base de datos y cada hit emite un voto ponderado por la puntuación de alineamiento, la identidad de secuencia, la cobertura de consulta y de diana, y el rango de recuperación. Además, se aplica un anclaje adaptativo al vecino más cercano, cuyo peso depende de su identidad y cobertura.

La agregación de votos es jerárquica: se acumulan a nivel de prefijos EC de 1, 2, 3 y 4 niveles, seleccionando en cada nivel la rama con mayor apoyo. Finalmente, la predicción se restringe al vocabulario de etiquetas EC completamente especificadas (`ec_vocabulary.json`). El repositorio incluye `inputs.py` para carga, validación y deduplicación de secuencias, `task.json` con la configuración de la tarea y un `Dockerfile` para reproducir el entorno de inferencia.

## Capacidades

- Clasificación de enzimas: asigna un número EC completamente especificado (4 niveles) a cada secuencia de proteína de entrada.
- Búsqueda de similitud de secuencias mediante MMseqs2 contra una base de referencia incluida.
- Votación ponderada por múltiples señales (score de alineamiento, identidad, cobertura de query y target, rango).
- Anclaje adaptativo al hit más cercano para reforzar predicciones de alta confianza.
- Agregación jerárquica por niveles EC (1 a 4), coherente con la taxonomía enzimática.
- Restricción a un vocabulario EC válido predefinido, evitando etiquetas fuera de catálogo.
- Procesamiento por lotes de ficheros Parquet con salida en JSONL.
- Deduplicación y validación de secuencias de entrada.
- No soporta tool calling, agentes, razonamiento multi-paso, visión, audio ni generación de texto libre.

## Casos de uso

- Anotación funcional de proteínas en pipelines de metagenómica: dado un conjunto de secuencias predichas, el sistema asigna números EC de forma determinista y reproducible, integrándose en flujos bioinformáticos existentes mediante el comando `python /app/predict.py --input INPUT --output OUTPUT`.
- Curado de bases de datos enzimáticas: permite etiquetar secuencias nuevas contra una referencia anotada y filtrar candidatos por nivel EC antes de revisión manual.
- Reproducción de resultados de investigación: al incluir la base de datos MMseqs2 y las anotaciones de referencia, facilita la replicación exacta de las predicciones del reto DA3410.
- Evaluación comparativa de métodos de clasificación EC: sirve como baseline de retrieval para contrastar con aproximaciones neuronales o basadas en embeddings.
- Despliegue en contenedores: el Dockerfile permite ejecutar la inferencia en entornos aislados y reproducibles, útil en clústeres de bioinformática.
- Procesamiento a gran escala sin GPU: al no requerir aceleración hardware, puede ejecutarse en nodos CPU para lotes masivos de secuencias.
- Integración en servicios de anotación interna: la salida JSONL con ID y etiqueta EC facilita su consumo por otras herramientas del pipeline.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM: no aplica; el sistema no requiere GPU.
- GPU recomendadas: ninguna; la inferencia es CPU-bound (MMseqs2).
- Cabe en cualquier máquina con CPU moderna; el factor limitante es el espacio en disco (repositorio de 1,6 GB) y la memoria RAM para cargar índices de MMseqs2.
- Despliegue: contenedor Docker incluido (`Dockerfile`), o ejecución directa con Python y las dependencias de `requirements.txt`.
- Frameworks de serving de LLM (vLLM, llama.cpp, Ollama, TGI): no aplicables.
- Latencia y throughput: no disponibles; dependen del tamaño de la base de datos, del número de consultas y de los parámetros de MMseqs2.

## Comparativa con modelos similares

| Sistema | Enfoque | Entrada | Salida | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| DA3410 Retrieval v7 | MMseqs2 + votación jerárquica | Secuencias de proteínas | Etiqueta EC (4 niveles) | MIT | Hugging Face |
| BLASTp + mejor hit | Alineamiento local | Secuencias de proteínas | Etiqueta EC del mejor hit | Dominio público | Ampliamente disponible |
| Modelos neuronales de anotación EC (p. ej. basados en ESM) | Embeddings + clasificador | Secuencias de proteínas | Etiqueta EC | Variable | Variable |

No se dispone de datos comparativos de rendimiento entre estas alternativas en la información proporcionada.

## Limitaciones y advertencias

- Depende completamente de la cobertura y calidad de la base de datos de referencia incluida; secuencias sin homólogos cercanos pueden recibir predicciones poco fiables.
- La restricción al vocabulario EC predefinido implica que enzimas con etiquetas fuera de ese catálogo no podrán clasificarse correctamente.
- No es un modelo generativo ni un LLM: no admite texto libre, tool calling ni razonamiento; su uso fuera de la clasificación EC no está soportado.
- Riesgo de sesgo hacia familias enzimáticas sobrerrepresentadas en la base de referencia.
- No hay información publicada sobre benchmarks, por lo que no puede evaluarse su precisión frente a alternativas.
- La licencia MIT permite uso comercial, pero se recomienda verificar las licencias de las bases de datos de secuencias subyacentes utilizadas para construir la referencia.
- El repositorio tiene 0 descargas y 0 likes; no hay evidencia de validación por la comunidad.
- La fecha de creación indicada (2026-10-30) es futura respecto a la información habitual de Hugging Face; conviene verificar la integridad del repositorio antes de usarlo en producción.

## Enlaces

- Hugging Face: https://huggingface.co/AbhijeetKumar2125/da3410-ec-retrieval-v7
- MMseqs2 (herramienta de búsqueda de similitud): https://github.com/soedinglab/MMseqs2
- No se han encontrado papers, blogs, repos adicionales ni demos en la información disponible.
