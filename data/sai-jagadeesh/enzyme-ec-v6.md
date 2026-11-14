# sai-jagadeesh/enzyme-ec-v6

## Resumen

Enzyme EC v6 es un pipeline de clasificación enzimática que asigna un número EC (Enzyme Commission) completamente especificado a cada secuencia de proteína de entrada. Lo desarrolla el usuario sai-jagadeesh en el contexto de la tarea de clasificación enzimática Leak CURBER, y se distribuye como un artefacto ONNX de aproximadamente 0,1 GB. No es un modelo de lenguaje generativo ni un transformer único: es un sistema híbrido de búsqueda por homología, alineamiento, un clasificador ESM-2 fine-tuned y un re-ranker aprendido.

La versión 6 se distingue de las anteriores (v1 a v5) por incorporar anotaciones enzimáticas externas de Swiss-Prot, redistribuidas a través de los repositorios CARE y CLEAN, al banco de referencia que se consulta en inferencia. El banco pasa a contener 217.306 secuencias y 5.785 EC distintos, frente al conjunto de entrenamiento del curso usado en versiones previas. El clasificador ESM-2 y el re-ranker permanecen sin cambios respecto a v5 y se entrenaron solo con el split de entrenamiento del curso.

El modelo resuelve un problema concreto de bioinformática: la anotación funcional automática de proteínas a nivel de número EC, una tarea con fuerte desbalance de clases y con el riesgo de fuga de datos (data leakage) entre train y test que el propio nombre de la tarea (Leak CURBER) señala. Su relevancia radica en que combina búsqueda exacta, homología por k-mers, alineamiento Smith-Waterman y un clasificador neuronal en un único pipeline con presupuesto de tiempo controlado (10 minutos por ejecución).

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Pipeline híbrido: lookup exacto + búsqueda por k-mers + alineamiento Smith-Waterman (pyopal) + clasificador ESM-2 + re-ranker LightGBM |
| Parámetros totales | No disponible (el clasificador base es `facebook/esm2_t6_8M_UR50D`, de 8M de parámetros; el pipeline completo incluye componentes no neuronales) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | 256 residuos centrales para el clasificador ESM-2; el resto del pipeline opera sobre secuencias completas mediante k-mers y alineamiento |
| Tipos de cuantización | El encoder se exporta a int8 ONNX; el resto de componentes no usa cuantización |
| Idiomas soportados | No aplica (modelo de proteínas, no de lenguaje natural) |
| Licencia | No disponible en la model card; los componentes citados tienen licencias propias (ESM-2 MIT, pyopal MIT, ExPASy ENZYME CC BY 4.0, UniProtKB/Swiss-Prot CC BY 4.0) |
| Formato de pesos | ONNX (`encoder.onnx`), JSON (`ranker.json`, `meta.json`), NumPy (`.npz`, `.npy`) |

## Arquitectura y entrenamiento

El sistema no es un transformer monolítico sino una cascada de cinco etapas. La etapa 0 es un lookup de coincidencia exacta contra el banco de referencia. La etapa 1 compara cada entrada restante con todas las secuencias de referencia mediante similitud coseno de conjuntos de 5-mers distintos, generando candidatos. La etapa 2 aplica un re-ranking en dos pasadas con Smith-Waterman SIMD (pyopal, matriz BLOSUM62, gap open 11, extend 1), normalizando por la mayor self-score; la segunda pasada, más profunda (300 candidatos estándar más 300 de alfabeto reducido Murphy-10 de 6-mers), solo se ejecuta cuando el match por k-mers es débil y el mejor alineamiento de la primera pasada queda por debajo de 0,3, lo que según el autor mantiene la precisión con menos de la mitad del coste.

La etapa 3 es un clasificador `facebook/esm2_t6_8M_UR50D` fine-tuned con una cabeza de etiquetas suaves (soft-label) por cada nivel EC, exportado a ONNX int8, que ve los 256 residuos centrales. Se ejecuta sobre tantas entradas como permita el tiempo (primero las de homología más débil, con corte a los 460 s) para garantizar que la ejecución termine dentro del límite de 10 minutos. La etapa 4 es un re-ranker LightGBM que, para cada EC candidato (de vecinos por alineamiento, por k-mers y del top 5 del clasificador), calcula 27 características (fuerza de alineamiento, rango y acuerdo, evidencia de k-mers, probabilidades del clasificador en los cuatro niveles EC, dificultad de la entrada y frecuencia del EC) y elige el EC final; se evalúa con numpy en inferencia. El re-ranker se entrenó sobre cuatro splits de holdout con conciencia de homología (clusters de secuencia completos retenidos, parientes cercanos eliminados de la base de búsqueda), unas 500.000 filas de candidatos.

## Capacidades

- Predicción de un número EC completamente especificado por secuencia de proteína.
- Búsqueda exacta de secuencias idénticas contra un banco de 217.306 referencias.
- Búsqueda por homología mediante similitud de k-mers (5-mers) y alineamiento Smith-Waterman con BLOSUM62.
- Clasificación neuronal con ESM-2 8M fine-tuned sobre los 256 residuos centrales, con cabezas por nivel EC.
- Re-ranking aprendido (LightGBM) que combina evidencia de alineamiento, k-mers y probabilidades del clasificador.
- Gestión de presupuesto temporal: prioriza entradas difíciles y se detiene a los 460 s para respetar el límite de 10 minutos.
- No soporta tool calling, agentes, razonamiento multi-paso, visión, audio ni capacidades multilingües de lenguaje natural; su dominio es exclusivamente proteico.

## Casos de uso

- Anotación funcional automática de proteínas en pipelines de genómica: el pipeline asigna un EC a cada secuencia de un proteoma de entrada, combinando lookup exacto para secuencias ya conocidas y búsqueda por homología para las nuevas, lo que lo hace adecuado para anotaciones a gran escala donde la coincidencia exacta cubre una parte del conjunto.
- Enriquecimiento de bases de datos internas: dado un catálogo de secuencias sin anotar, el modelo propone ECs respaldados por vecinos alineados y por el clasificador ESM-2, con el re-ranker resolviendo discrepancias entre ambas fuentes.
- Clasificación de enzimas en estudios de metagenómica: las secuencias ambientales suelen carecer de anotación; la búsqueda por k-mers seguida de Smith-Waterman permite encontrar homólogos remotos en el banco de referencia y asignar un EC con evidencia de alineamiento cuantificada.
- Validación cruzada de anotaciones existentes: comparar el EC predicho con el anotado en una base de datos propia permite detectar discrepancias y priorizar revisiones manuales, usando las 27 características del re-ranker como señal de confianza.
- Docencia y evaluación de métodos: al ser un artefacto reproducible con `predict.py`, `build_index.py` y `check_output.py`, sirve como referencia ejecutable en cursos y benchmarks de clasificación enzimática con control de fuga de datos.
- Prototipado rápido en investigación: el tamaño reducido del repositorio (0,1 GB) y la exportación a ONNX int8 permiten desplegar el pipeline en entornos con recursos limitados, sin necesidad de GPUs de gran capacidad, para experimentos exploratorios de asignación de EC.

## Benchmarks y rendimiento

Los únicos resultados publicados en la información disponible son los de validación cruzada de los pasos 1 a 4 sobre el holdout principal del conjunto de entrenamiento del curso, sin datos externos:

| Métrica | Resultado |
|---|---|
| Precisión nivel EC-4 (holdout principal) | 0,841 |
| Precisión nivel EC-4 (cuarto más difícil) | 0,670 |

No se han publicado resultados de benchmarks comparativos con otros modelos (MMLU, HumanEval, GSM8K u otros) en la información disponible, ya que no aplican a este dominio.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; el clasificador ESM-2 8M en int8 ONNX es muy ligero (del orden de decenas de MB), y el grueso del coste es CPU por la búsqueda y el alineamiento Smith-Waterman.
- GPU recomendadas: no especificadas por el autor; por el tamaño del encoder, cualquier GPU consumer reciente es suficiente para la etapa neuronal.
- Cabe en GPU consumer: sí, con alta probabilidad, dado que el componente neuronal es un ESM-2 de 8M en int8; el cuello de botella es la búsqueda y el alineamiento, que son intensivos en CPU.
- Opciones de despliegue: el pipeline se ejecuta con `python /app/predict.py --input X --output Y`; los índices de k-mers se construyen en el build de Docker con `build_index.py` o en tiempo de ejecución si se omite. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI (no aplican a este tipo de modelo).
- Latencia y throughput: el autor impone un presupuesto de 460 s para la etapa del clasificador y un límite total de 10 minutos por ejecución; no se publican cifras de latencia por secuencia ni de throughput.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye comparaciones con otros clasificadores enzimáticos (por ejemplo, basados en BLAST, en ESM-2 de mayor tamaño o en enfoques de aprendizaje profundo de extremo a extremo), ni datos de rendimiento de alternativas en la misma tarea.

## Limitaciones y advertencias

- Licencia no declarada en la model card: no se puede confirmar si el uso comercial está permitido; los componentes individuales tienen licencias propias (ESM-2 MIT, pyopal MIT, ExPASy ENZYME CC BY 4.0, UniProtKB/Swiss-Prot CC BY 4.0) que deben respetarse por separado.
- El clasificador ESM-2 y el re-ranker se entrenaron solo con el split del curso; las anotaciones externas se añadieron al banco de búsqueda, no al entrenamiento, lo que puede introducir sesgos hacia las ECs mejor representadas en Swiss-Prot.
- El clasificador solo ve los 256 residuos centrales, por lo que información relevante fuera de esa ventana puede perderse en proteínas largas.
- La segunda pasada de alineamiento se omite en entradas con match por k-mers fuerte y alineamiento de primera pasada igual o superior a 0,3; en esos casos la evidencia es menos exhaustiva.
- El presupuesto de 460 s para el clasificador implica que, en ejecuciones con muchas entradas, algunas pueden quedarse sin la señal del clasificador y depender solo de homología y re-ranker.
- Riesgo de alucinación en sentido estricto no aplica (no genera texto), pero sí de asignaciones erróneas de EC cuando la homología es remota o el banco carece de representantes cercanos.
- No se documentan sesgos conocidos, limitaciones idiomáticas (no aplica) ni advertencias adicionales de producción más allá de las anteriores.
- El modelo es específico de la tarea Leak CURBER y su vocabulario EC está restringido al de la tarea; ECs fuera de ese vocabulario no se predicen.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/sai-jagadeesh/enzyme-ec-v6
- Repositorio CARE: https://github.com/jsunn-y/CARE
- Repositorio CLEAN: https://github.com/tttianhao/CLEAN
- ESM-2 base (`facebook/esm2_t6_8M_UR50D`): https://huggingface.co/facebook/esm2_t6_8M_UR50D
- ExPASy ENZYME (SIB, CC BY 4.0): https://enzyme.expasy.org/
- UniProtKB/Swiss-Prot (CC BY 4.0): https://www.uniprot.org/
