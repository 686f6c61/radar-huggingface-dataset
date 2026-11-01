# Legend7001/ec-homology-v18

## Resumen

ec-homology-v18 es un sistema de clasificación enzimática (predicción de números EC, Enzyme Commission) presentado por el usuario Legend7001 como entrega del proyecto DA3410 para la tarea Leak CURBER. No es un modelo de lenguaje ni una red neuronal profunda: es un pipeline bioinformático que combina búsqueda de homología con MMseqs2 contra una base de datos de secuencias de entrenamiento y un reranker basado en gradient boosting (HistGradientBoosting) que puntúa cada candidato EC a partir de evidencia de homología. El repositorio ocupa 0,4 GB y contiene binarios estáticos de MMseqs2, la base de datos indexada y los pesos del reranker en formato joblib/JSON.

El sistema resuelve un problema acotado: dada una secuencia proteica de consulta, asignarle el primer número EC (solo se evalúa la primera posición de la jerarquía EC). Para ello busca hits en la base de entrenamiento, recoge sus anotaciones EC como candidatas y reordena mediante un clasificador entrenado con búsquedas out-of-fold sobre cinco particiones de clústeres al 40 % de identidad. El diseño evita explícitamente priors de identidad EC como la frecuencia de clases, lo que lo hace metodológicamente interesante para evaluar transferencia por homología pura.

La relevancia es limitada fuera del contexto de la competición: no hay model card con métricas publicadas, cero descargas y cero likes en el momento de la consulta, licencia no declarada y una advertencia explícita sobre fuga de datos (leakage) por el uso de una tabla hash de UniProtKB/Swiss-Prot. Es, por tanto, una entrega académica reproducible más que un modelo listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Pipeline de homología: búsqueda MMseqs2 + reranker gradient boosting (HistGradientBoosting) sobre features de homología |
| Parametros totales | No disponible (el reranker es un modelo tabular; no se declara número de parámetros ni tamaño del ensemble de árboles) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No aplica (no es un modelo de lenguaje; la "entrada" es una secuencia proteica de longitud arbitraria) |
| Tipos de cuantizacion | No disponible (pesos joblib/JSON; no se publican variantes cuantizadas) |
| Idiomas soportados | No disponible (no procesa lenguaje natural; opera sobre secuencias de aminoácidos) |
| Licencia | No disponible (la model card no la declara; MMseqs2 es GPLv3 y el vocabulario EC de ExPASy es CC BY 4.0) |
| Formato de pesos | joblib (`weights/rerank_hgb.joblib`), JSON (`rerank_features.json`, `rerank_lr.json`, `train_ecs.json`, `baseline.json`) y base de datos MMseqs2 en `db/` |

## Arquitectura y entrenamiento

El sistema tiene dos etapas. La primera es una búsqueda de homología con MMseqs2 (sensibilidad 5.7, dos hilos, prefilter y align ejecutados por separado para evitar escrituras en `/tmp`) de cada secuencia de consulta contra la base de datos de secuencias de entrenamiento (nombradas `t<row>`), con índice de k-mers construido en tiempo de ejecución. Los EC de los hits se convierten en candidatos. La segunda etapa es un clasificador gradient-boosted que puntúa cada candidato usando exclusivamente evidencia de homología: bitscores relativos al mejor hit, identidad, cobertura, rango, acuerdo entre hits, ratio de longitud y competición con EC hermanos. El autor subraya que no se usan priors de identidad EC como la frecuencia de clases.

El reranker se entrenó con búsquedas out-of-fold de cada secuencia de entrenamiento contra las otras cuatro de cinco particiones por clúster de identidad al 40 %, lo que mitiga la fuga dentro del conjunto de entrenamiento. Se devuelve como predicción única el mejor candidato, ya que solo se puntúa el primer nivel EC. Existe además un reranker logístico más antiguo (`rerank_lr.json`) usado únicamente como fallback, y un EC de reserva (`baseline.json`). El repositorio incluye binarios estáticos de MMseqs2 para AVX2 y SSE4.1, seleccionados según `/proc/cpuinfo`, y un guardia temporal en `predict.py`.

Un aspecto crítico documentado por el propio autor: las versiones más recientes responden a entradas que aparecen literalmente en UniProtKB/Swiss-Prot (release 2026_03, entradas con anotación EC) mediante una tabla hash de esa base de datos, y solo ejecutan el pipeline de homología para el resto. El autor remite a `EXTERNAL_DATA.md` para la fuente, los recuentos y la advertencia de leakage.

## Capacidades

- Predicción del primer nivel de la jerarquía EC para secuencias proteicas, mediante transferencia de anotación por homología.
- Búsqueda de homología local con MMseqs2 sobre una base de datos de secuencias de entrenamiento incluida en el repositorio.
- Reranking de candidatos EC con features explícitas de homología (bitscore relativo, identidad, cobertura, rango, acuerdo entre hits, ratio de longitud, competición entre EC hermanos).
- Inferencia offline en CPU, sin dependencia de GPU ni de servicios externos.
- Selección automática del binario MMseqs2 adecuado según las instrucciones SIMD disponibles (AVX2 o SSE4.1).
- Guardia temporal y filtrado de vocabulario en `predict.py` para acotar el tiempo de ejecución y restringir las salidas al vocabulario EC válido.
- Fallback a un reranker logístico y a un EC de reserva si el pipeline principal no produce candidatos.
- Respuesta por tabla hash para secuencias presentes literalmente en UniProtKB/Swiss-Prot 2026_03 (con el caveat de leakage indicado por el autor).
- No soporta tool calling, agentes, razonamiento multi-paso, visión, audio ni generación de texto: no es un modelo de lenguaje.

## Casos de uso

- Anotación automática de genomas recién secuenciados: para cada ORF predicho se ejecuta `predict.py` y se obtiene un EC de primer nivel, lo que permite un borrador de anotación funcional antes de la revisión manual con herramientas como InterPro o KEGG.
- Triaje en pipelines metagenómicos: dado el coste de la anotación manual, el sistema sirve para priorizar qué proteínas merecen caracterización experimental, usando el bitscore relativo y la cobertura como indicadores de confianza.
- Enseñanza y reproducción metodológica: el repositorio es autocontenido (binarios, base de datos y pesos), lo que permite reproducir el experimento de transferencia por homología con reranking en un portátil sin GPU.
- Baseline para competiciones de clasificación enzimática: sirve como referencia de partida contra la que comparar modelos de aprendizaje profundo tipo ProteInfer o CLEAN, especialmente por su restricción explícita a evidencia de homología sin priors de frecuencia.
- Auditoría de fuga de datos en benchmarks: la inclusión de una tabla hash de Swiss-Prot y la advertencia de leakage lo convierten en un caso de estudio útil para diseñar particiones train/test resistentes a contaminación.
- Prototipado de herramientas internas de bioinformática: al ser inferencia CPU offline con formatos estándar (joblib, JSON, MMseqs2), se puede integrar en scripts de Python sin infraestructura adicional.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM: no aplica; la inferencia es en CPU por diseño (`predict.py` declara inferencia offline en CPU).
- GPU recomendadas: ninguna; no se requiere GPU.
- CPU: se recomienda un procesador con AVX2 (el repositorio incluye binario AVX2 y SSE4.1 con selección automática vía `/proc/cpuinfo`). La búsqueda MMseqs2 se ejecuta con 2 hilos según la model card.
- Memoria RAM: no disponible de forma explícita; el repositorio pesa 0,4 GB y el índice de k-mers se construye en tiempo de ejecución, por lo que se necesita espacio adicional en RAM proporcional a la base de datos.
- Almacenamiento: aproximadamente 0,4 GB para el repositorio completo (binarios, base de datos y pesos).
- Cabe en cualquier equipo de consumo: portátil convencional, mini-PC o instancia cloud de gama baja.
- Opciones de despliegue: ejecución directa de `predict.py` con Python y las dependencias del repositorio; no hay soporte declarado para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de sistema.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Sistema | Enfoque | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ec-homology-v18 | MMseqs2 + reranker gradient boosting | No disponible | No aplica | No disponible | HuggingFace (0 descargas) |
| MMseqs2 con transferencia de anotación directa (best hit) | Búsqueda de homología sin reranking | No aplica | No aplica | GPLv3 | Ampliamente disponible |
| ProteInfer (Google Research) | Red neuronal profunda sobre secuencias | No disponible en la informacion proporcionada | No aplica | No disponible en la informacion proporcionada | Público |
| CLEAN (modelo de contraste EC) | Aprendizaje contrastivo con jerarquía EC | No disponible en la informacion proporcionada | No aplica | No disponible en la informacion proporcionada | Público |

No se dispone de datos de rendimiento comparativo en la informacion proporcionada; la comparación se limita al enfoque metodológico y a la disponibilidad.

## Limitaciones y advertencias

- Solo predice el primer nivel de la jerarquía EC; no resuelve la anotación completa (los niveles segundo, tercero y cuarto no se puntúan).
- Fuga de datos documentada por el propio autor: las versiones recientes responden consultas presentes literalmente en UniProtKB/Swiss-Prot 2026_03 mediante una tabla hash, lo que invalida cualquier evaluación sobre secuencias de esa base y exige leer `EXTERNAL_DATA.md`.
- Licencia no declarada en la model card, lo que impide determinar si el uso comercial es posible; además incorpora componentes con licencias propias (MMseqs2 GPLv3, vocabulario ExPASy CC BY 4.0) cuyas condiciones se heredan.
- Sin métricas publicadas: no hay resultados de benchmarks, matrices de confusión ni curvas de precisión/recall, por lo que no es posible estimar su calidad frente a alternativas.
- Dependencia de la base de datos de entrenamiento incluida: la calidad de la predicción está acotada por la cobertura taxonómica y funcional de esas secuencias; proteínas sin homólogos cercanos en la base recibirán como mucho el EC de reserva (`baseline.json`).
- El reranker usa exclusivamente evidencia de homología, lo que limita la generalización a familias enzimáticas poco representadas o con homología divergente.
- Requiere binarios nativos de MMseqs2 y acceso a `/proc/cpuinfo` para la selección de build; el soporte está pensado para Linux x86-64.
- Sin mantenimiento ni comunidad: cero descargas y cero likes en el momento de la consulta, creado y actualizado el 2026-11-01 con seis segundos de diferencia.
- No es un modelo de lenguaje: no debe evaluarse con métricas de NLP ni esperar comportamiento conversacional.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Legend7001/ec-homology-v18
- Referencia de MMseqs2: Steinegger y Söding, Nature Biotechnology 2017 (GPLv3), citado en la model card
- Vocabulario EC: ExPASy ENZYME, release 02-Sep-2026, SIB (CC BY 4.0), citado en la model card
- Base de datos externa: UniProtKB/Swiss-Prot release 2026_03 (ver `EXTERNAL_DATA.md` en el repositorio)
- No se han encontrado papers, blogs, repositorios adicionales ni demos en la busqueda web.
