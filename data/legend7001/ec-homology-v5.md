# Legend7001/ec-homology-v5

## Resumen

ec-homology-v5 es un pipeline de clasificación enzimática (asignación de números EC) publicado por el usuario Legend7001 en Hugging Face. No es un modelo de lenguaje ni una red neuronal profunda: combina una búsqueda de homología con MMseqs2 contra una base de datos de secuencias de entrenamiento y un clasificador de gradiente boosting (serializado en joblib) que reordena los EC candidatos obtenidos de los hits.

El sistema se presenta como entrega del proyecto DA3410 para la tarea de clasificación enzimática Leak CURBER. Su diseño ataca un sesgo clásico de la transferencia de anotación: evitar priors de identidad de EC. El reranker puntúa cada candidato usando exclusivamente evidencia de homología (bitscore relativo al mejor hit, identidad, cobertura, rango, acuerdo entre hits, ratio de longitud y competencia con ECs hermanos), sin frecuencias de EC ni otras señales de identidad.

El repositorio ocupa 0,1 GB e incluye el código de inferencia en CPU, los binarios estáticos de MMseqs2 (builds AVX2 y SSE4.1), la base de datos MMseqs2 de las secuencias de entrenamiento y los pesos del reranker. Está diseñado para ejecutarse offline, sin GPU, y devuelve un único EC por secuencia consultada (solo se puntúa el primer EC). Con 0 descargas y 0 likes en el momento de la consulta, se trata de un artefacto de competición académica, no de un modelo con adopción verificada.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Pipeline de dos etapas: recuperación por homología con MMseqs2 (prefilter + align separados, sensibilidad 5,7, 2 hilos) y reranking con clasificador HistGradientBoosting |
| Parametros totales | No disponible: no es una red neuronal con pesos densos; el reranker es un modelo de gradiente boosting cuyo número de árboles y nodos no se detalla en la información disponible |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica: la entrada es una secuencia proteica; no hay ventana de contexto. No se especifica longitud máxima de secuencia |
| Tipos de cuantizacion | No disponible / no aplica: los pesos se distribuyen en joblib y JSON, no en formatos cuantizados |
| Idiomas soportados | No aplica (entrada biológica: secuencias de aminoácidos) |
| Licencia | No disponible para el repositorio. Componentes: MMseqs2 bajo GPLv3; vocabulario EC de ExPASy ENZYME, release 02-Sep-2026, SIB, CC BY 4.0 |
| Formato de pesos | joblib (`weights/rerank_hgb.joblib`), JSON (`rerank_features.json`, `rerank_lr.json`, `train_ecs.json`, `baseline.json`) y base de datos MMseqs2 (`db/`) |
| Tarea | Clasificación enzimática: asignación de un número EC por secuencia |
| Entrada / salida | Secuencia proteica / un único EC (el mejor candidato) |
| Dependencias | MMseqs2 (binarios estáticos incluidos), Python, joblib |
| Requisito de CPU | AVX2 o SSE4.1 (el binario se selecciona leyendo `/proc/cpuinfo`) |
| Tamaño del repositorio | 0,1 GB |
| Fecha de creación | 2026-10-25 |

## Arquitectura y entrenamiento

La primera etapa es una búsqueda de homología con MMseqs2 (Steinegger y Söding, 2017) de cada secuencia consultada contra la base de datos de secuencias de entrenamiento, ejecutada con sensibilidad 5,7 y 2 hilos. El prefilter y el alineamiento se lanzan como pasos separados para evitar la ejecución de binarios desde `/tmp`. Los EC de los hits conforman el conjunto de candidatos; el índice de k-mers de la base se construye en tiempo de ejecución.

La segunda etapa es un clasificador de gradiente boosting que puntúa cada candidato a partir de un vector de características de homología calculado en `ecfeat.py`: bitscore relativo al mejor hit, identidad, cobertura, rango del hit, acuerdo entre hits, ratio de longitud y competencia con ECs hermanos. El modelo se entrenó con búsquedas out-of-fold de cada secuencia de entrenamiento contra las otras cuatro de cinco particiones de clusters al 40 % de identidad, lo que evita fuga de información entre entrenamiento y evaluación. Se incluye además un reranker logístico más antiguo (`weights/rerank_lr.json`) usado solo como fallback, un EC de reserva (`weights/baseline.json`) y un filtrado contra el vocabulario EC de referencia. No se documentan hiperparámetros, número de árboles, tamaño del conjunto de entrenamiento ni composición taxonómica del mismo.

## Capacidades

- Asignación de un número EC a una secuencia proteica mediante transferencia de homología con reranking supervisado.
- Ejecución completamente offline y en CPU, sin dependencia de GPU ni de servicios externos.
- Selección automática del binario MMseqs2 adecuado según el juego de instrucciones disponible (AVX2 o SSE4.1).
- Filtrado de candidatos contra el vocabulario EC oficial (ExPASy ENZYME, release 02-Sep-2026), lo que descarta predicciones fuera de catálogo.
- Guarda de tiempo ("time guard") en el script de inferencia para acotar la duración de la búsqueda.
- Mecanismo de degradación: reranker logístico de respaldo y EC por defecto si no hay candidatos válidos.
- No dispone de tool calling, function calling, capacidades de agente, razonamiento multi-paso, visión, audio ni generación de texto: no es un modelo generativo.

## Casos de uso

- Anotación funcional masiva de metagenomas: el pipeline procesa lotes de secuencias en CPU y devuelve un EC por proteína, lo que permite anotar catálogos génicos completos sin infraestructura GPU.
- Curado de genomas bacterianos recién ensamblados: asignación de EC a los modelos proteicos predichos para nutrir tablas de rutas metabólicas antes de la revisión manual.
- Priorización de candidatos en biotecnología enzimática: dado un conjunto de secuencias de interés industrial, obtener el EC más probable y la evidencia de homología subyacente para decidir qué candidatos expresar y ensayar.
- Control de calidad de anotaciones existentes: comparar el EC predicho con el anotado en bases de datos públicas y marcar discrepancias para revisión.
- Enriquecimiento de pipelines de biología sintética: asignación de EC a las partes de un diseño para comprobar que las actividades enzimáticas previstas están respaldadas por homología.
- Reproducibilidad de competiciones y benchmarks: al ser offline y determinista respecto a la base incluida, sirve como referencia ejecutable para comparar métodos de transferencia de anotación en la tarea Leak CURBER.
- Detección de familias enzimáticas infrarrepresentadas: el reranker sin priors de frecuencia de EC evita que las clases mayoritarias absorban candidatos con evidencia de homología específica.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card describe el método y la estrategia de validación (búsquedas out-of-fold sobre cinco particiones de clusters al 40 % de identidad), pero no incluye métricas de precisión, recall, F1 ni posición en la clasificación de la tarea Leak CURBER.

## Requisitos de hardware

- VRAM: 0 GB. La inferencia es exclusivamente en CPU según `predict.py`.
- GPU: no necesaria ni soportada explícitamente (A100, H100 o RTX 4090 no aportan nada al pipeline).
- CPU: se requiere AVX2 o SSE4.1; el binario se elige leyendo `/proc/cpuinfo`.
- Memoria RAM: no se publica cifra. Como referencia, la base MMseqs2 y los pesos ocupan 0,1 GB en disco y el índice de k-mers se construye en tiempo de ejecución, por lo que el pico de RAM será superior al tamaño de la base.
- Almacenamiento: aproximadamente 0,1 GB para el repositorio completo.
- Hilos: la búsqueda está configurada a 2 hilos; el rendimiento en máquinas con más núcleos no se documenta.
- Despliegue: ejecución directa de `predict.py` en un entorno Python con joblib. No aplican vLLM, TGI, llama.cpp ni Ollama, al no existir pesos de transformer.
- Latencia y throughput: no disponibles. Dependen del tamaño de la base, de la guarda de tiempo configurada y del número de secuencias por lote.

## Comparativa con modelos similares

| Sistema | Enfoque | Requiere GPU | Entrada | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ec-homology-v5 | MMseqs2 + reranker HistGradientBoosting sobre evidencia de homología | No | Secuencia proteica | No disponible (componentes GPLv3 y CC BY 4.0) | Hugging Face, 0 descargas |
| MMseqs2 best-hit / voto mayoritario | Transferencia directa del EC del mejor hit, sin reranking | No | Secuencia proteica | GPLv3 | Ampliamente disponible |
| BLASTp o DIAMOND + regla LCA | Alineamiento local y asignación por ancestro común más bajo | No | Secuencia proteica | Según implementación (no disponible) | Ampliamente disponible |
| Métodos de kNN sobre embeddings proteicos (p. ej. enfoques tipo CLEAN) | Representación vectorial de proteínas y vecinos más cercanos para transferir EC | Habitual, aunque no obligatorio | Secuencia proteica | No disponible en la información consultada | Repositorios académicos |

No se dispone de cifras de rendimiento comparadas para ninguna de las alternativas en la información proporcionada, por lo que la comparación es exclusivamente metodológica.

## Limitaciones y advertencias

- Devuelve un único EC por secuencia: solo se puntúa el primer EC, por lo que no cubre enzimas con múltiples actividades ni rutas con promiscuidad catalítica.
- Dependencia fuerte de la base de entrenamiento incluida: secuencias sin homología detectable en esa base quedan sin candidatos válidos y caen en el EC de reserva (`weights/baseline.json`), lo que produce falsos positivos silenciosos.
- Sesgo hacia familias sobrerrepresentadas en la base de entrenamiento: al no usar priors de frecuencia de EC, el método evita un sesgo pero no corrige el desequilibrio de la base, que se traslada al conjunto de candidatos.
- Riesgo de transferencia errónea en homología remota: con identidades bajas, hits correctos y espurios compiten y el reranker puede seleccionar un EC hermano incorrecto.
- Ausencia de benchmarks publicados: no hay evidencia cuantitativa de precisión frente a baselines, lo que impide estimar el error esperado en producción.
- Licencia del repositorio no declarada: los binarios de MMseqs2 son GPLv3, lo que condiciona la redistribución del paquete; el uso comercial del artefacto completo no está explícitamente autorizado.
- Requisito de CPU con AVX2 o SSE4.1: entornos virtualizados sin esas extensiones pueden degradar el rendimiento o fallar al seleccionar el binario.
- Índice de k-mers construido en cada ejecución: añade tiempo de arranque y no se documenta cuánto tarda ni cuánta RAM consume.
- Artefacto de competición con 0 descargas y 0 likes: sin validación externa ni mantenimiento conocido.
- Idiomas y contexto no aplican, pero tampoco se documenta el rango de longitudes de secuencia ni el comportamiento con fragmentos truncados.

## Enlaces

- Hugging Face: https://huggingface.co/Legend7001/ec-homology-v5
- MMseqs2, repositorio oficial: https://github.com/soedinglab/MMseqs2
- Referencia de MMseqs2 citada en la model card: Steinegger, M. y Söding, J., "MMseqs2 enables sensitive protein sequence searching for the analysis of massive data sets", Nature Biotechnology, 2017, https://doi.org/10.1038/nbt.3988
- Vocabulario EC de referencia (ExPASy ENZYME, SIB): https://enzyme.expasy.org
