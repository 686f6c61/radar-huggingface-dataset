# madhav-ak/enzyme-v006

## Resumen

enzyme-v006 es un artefacto de recuperación por similitud (retrieval) para la anotación automática de números EC (Enzyme Commission) a partir de reacciones químicas. Lo publica el usuario independiente madhav-ak en HuggingFace y no es un modelo de lenguaje ni un transformer generativo, sino un pipeline de embeddings y búsqueda vectorial empaquetado con joblib. La versión v006 abandona la cabeza clasificadora de EC de versiones anteriores y apuesta por una recuperación contrastiva sobre un índice de 63.280 reacciones públicas de entrenamiento.

El sistema combina tres codificadores químicos preentrenados de forma supervisada con etiquetas EC (cuyas cabezas de clasificación se descartan) más un RXNFP genérico congelado, produciendo una representación de 2048 dimensiones que se proyecta a un embedding de 256 dimensiones entrenado con pérdida contrastiva multi-positiva. En inferencia, cada consulta se compara por coseno exacto contra el índice y se agregan los votos ponderados de los ocho vecinos más cercanos para emitir el EC final.

Su relevancia es metodológica: demuestra que adaptar recuperación contrastiva a referencias de reacción puede superar claramente a una línea base de centroides DRFP sobre los mismos datos de entrenamiento (0,5976 frente a 0,3487 en la métrica local L4 congelada). No obstante, el repositorio tiene 0 descargas y 0 likes, no declara licencia y la evaluación se realizó sobre un split usado históricamente, no sobre un conjunto globalmente intacto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Pipeline de retrieval: 3 codificadores químicos supervisados + RXNFP genérico congelado, proyección contrastiva a 256 dimensiones y búsqueda coseno exacta sobre índice de referencias |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (no es un modelo de contexto textual) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible (el componente RXNFP incluido tiene licencia MIT, según licenses/RXNFP-MIT.txt) |
| Formato de pesos | joblib (artefacto serializado con codificadores e índice de referencias en weights/references.parquet) |

## Arquitectura y entrenamiento

El pipeline encadena tres codificadores químicos ocultos preentrenados de forma supervisada con etiquetas EC sobre el fold de entrenamiento correspondiente, a los que se les eliminan los pesos de salida de clasificación, junto con un RXNFP genérico congelado procedente del repositorio rxn4chemistry/rxnfp (commit 6fd48f4927c2178555cc5d71dbfb225fb178f43c, licencia MIT). Las representaciones concatenadas dan lugar a un vector de 2048 dimensiones, que una proyección entrenada reduce a un embedding de 256 dimensiones.

La proyección se entrena con una pérdida contrastiva multi-positiva sobre la tabla pública de reacciones y anotaciones EC suministrada, que es la única fuente de supervisión declarada. No se incluyen checkpoints de proteínas CREEP, centroides de proteínas, texto externo de descripciones EC ni etiquetas privadas. En inferencia se realiza búsqueda coseno exacta sobre 63.280 referencias públicas y se emiten los EC mediante votos ponderados de los ocho vecinos más próximos; el fichero de evidencias opcional expone EC ordenados, IDs de referencia, puntuaciones coseno y anotaciones de los vecinos.

## Capacidades

- Anotación de números EC para reacciones químicas mediante recuperación de referencias similares.
- Generación de embeddings de reacción de 256 dimensiones a partir de la concatenación de cuatro codificadores (tres supervisados y uno genérico RXNFP).
- Recuperación de vecinos más cercanos con puntuaciones coseno exactas sobre un índice de 63.280 reacciones.
- Agregación por votos ponderados de ocho vecinos para producir el EC final.
- Salida de evidencias de recuperación (EC ordenados, IDs de referencia, cosenos y anotaciones de vecinos) para auditoría.
- Deduplicación por reacción cruda única: emite un EC válido por reacción exacta única, conservando el primer ID de entrada.
- Ejecución offline verificable mediante Docker con red deshabilitada, 2 CPUs y 16 GB de memoria.
- No dispone de cabeza clasificadora de EC ni de mezcla con probabilidades de clasificador.

## Casos de uso

- Anotación funcional de reacciones en pipelines bioinformáticos: el modelo recibe un Parquet de reacciones y devuelve un JSONL con un EC por reacción única, integrándose en flujos batch de curado de bases de datos enzimáticas.
- Auditoría de anotaciones existentes: el fichero de evidencias permite revisar los ocho vecinos y sus cosenos para justificar o rechazar un EC asignado, útil en control de calidad de anotaciones.
- Búsqueda de reacciones análogas: al exponer IDs de referencia y puntuaciones coseno, sirve para localizar reacciones públicas parecidas a una consulta y estudiar su contexto enzimático.
- Enriquecimiento de datasets de entrenamiento: los EC recuperados con evidencias pueden usarse como etiquetas candidatas que un revisor humano valida antes de incorporarlas a un corpus supervisado.
- Experimentación metodológica en retrieval químico: sirve como referencia reproducible para comparar recuperación contrastiva frente a líneas base de centroides DRFP sobre los mismos datos.
- Despliegue en entornos aislados: el contenedor Docker con `--network none` permite ejecutar la anotación en infraestructuras sin conectividad, por ejemplo en clústeres internos con restricciones de red.
- Evaluación de transferencia entre representaciones: al conservar el índice y los embeddings, permite analizar qué consultas fallan y si el fallo proviene de la codificación o de la cobertura del índice.

## Benchmarks y rendimiento

| Metrica | Resultado |
|---|---|
| L4 local congelado (held-out) | 0,597634693547193 |
| Línea base CARE DRFP con centroides, mismos datos de entrenamiento | 0,3486500397750399 |
| Private leaderboard | no disponible (no existe puntuación para v006) |
| Resultados CLIPZyme / Horizyn | no disponibles |
| Transferencia CREEP | recogida en local_metrics.json; comparación con limitaciones declaradas |

## Requisitos de hardware

- VRAM estimada: no disponible; el artefacto se ejecuta en CPU (el comando Docker de referencia limita a 2 CPUs y 16 GB de RAM).
- GPU recomendadas: no disponible; no se documenta soporte GPU ni requisitos de aceleración.
- Cabe en GPU de consumo: no disponible; el tamaño del repo (0,4 GB) sugiere que el artefacto es ligero, pero no se especifica el consumo en VRAM.
- Opciones de despliegue: ejecución directa con `python predict.py` y contenedor Docker multiplataforma (`linux/amd64`); no se documentan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles; dependen del tamaño del índice (63.280 referencias) y del número de consultas.

## Comparativa con modelos similares

| Modelo | Enfoque | Contexto / índice | Rendimiento declarado | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| enzyme-v006 | Retrieval contrastivo sobre referencias de reacción | 63.280 referencias | L4 local 0,5976 | no disponible | HuggingFace, 0 descargas |
| CARE DRFP con centroides | Línea base de centroides sobre descriptores DRFP | mismos datos de entrenamiento | L4 local 0,3487 | no disponible | línea base interna del autor |
| CREEP | Modelo multimodal proteína-reacción | no disponible | resultado de transferencia en local_metrics.json | no disponible | no incluido en v006 |
| CLIPZyme | Modelo multimodal | no disponible | no disponible | no disponible | no disponible |
| Horizyn | Modelo multimodal | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- La evaluación se realizó sobre un split usado históricamente y no globalmente intacto; el propio autor advierte de que no es una medida limpia de generalización.
- No existe puntuación de private leaderboard para v006.
- No es una reproducción de CREEP, CLIPZyme ni Horizyn; los resultados completos de CLIPZyme y Horizyn no están disponibles.
- No declara licencia en la model card, lo que impide determinar condiciones de uso comercial; solo el componente RXNFP tiene licencia MIT documentada.
- El vocabulario EC permitido se atribuye a ExPASy ENZYME/SIB (licenses/EC-VOCABULARY.txt), con condiciones propias que deben revisarse.
- La supervisión proviene únicamente de la tabla pública de reacciones y EC suministrada; la cobertura del índice limita directamente los EC recuperables.
- No hay cabeza clasificadora ni mezcla con probabilidades, por lo que la salida depende por completo de la calidad de los vecinos recuperados.
- No se documentan idiomas, sesgos ni tasas de alucinación; al ser un sistema de retrieval, el riesgo principal es asignar un EC incorrecto por vecinos poco representativos.
- El repositorio tiene 0 descargas y 0 likes, sin pipeline declarado, lo que reduce la evidencia externa de validación independiente.
- El artefacto es un joblib con índice y codificadores; requiere el entorno y las dependencias del autor, no un runtime estándar de transformers.

## Enlaces

- HuggingFace: https://huggingface.co/madhav-ak/enzyme-v006
- RXNFP upstream: https://github.com/rxn4chemistry/rxnfp (commit 6fd48f4927c2178555cc5d71dbfb225fb178f43c)
- Licencia RXNFP incluida: licenses/RXNFP-MIT.txt
- Atribución del vocabulario EC: licenses/EC-VOCABULARY.txt
- Métricas locales y limitaciones de comparación: local_metrics.json
- Repositorio de pesos e índice: weights/references.parquet
- Script de inferencia: predict.py
- No se han encontrado papers, blogs ni demos adicionales en la información proporcionada.
