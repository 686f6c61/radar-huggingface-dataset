# p-gupta/enzyme-ec-predictor

## Resumen

El modelo `enzyme-ec-predictor` del usuario `p-gupta` es un sistema de predicción del número EC (Enzyme Commission) de enzimas a partir de su secuencia de aminoácidos. Fue desarrollado específicamente para la tarea de clasificación enzimática del reto Leak CURBER y se entrenó exclusivamente con los datos de entrenamiento proporcionados por dicho reto. No se trata de un modelo de lenguaje ni de una red neuronal profunda de gran escala, sino de un pipeline híbrido que combina búsqueda por homología con MMseqs2, un modelo de árboles de decisión (gradient boosting con 300 árboles) y una pequeña red convolucional para los casos sin coincidencias.

El modelo no sigue la arquitectura transformer habitual de los modelos publicados en HuggingFace. Su funcionamiento se basa en la recuperación de secuencias homólogas mediante MMseqs2, la generación de candidatos EC a partir de los 30 mejores alineamientos y la puntuación de cada candidato mediante 36 características derivadas del alineamiento (puntuación, identidad, cobertura, rango y frecuencia del EC). Para secuencias sin homólogos claros, emplea una búsqueda secundaria sobre fragmentos de aminoácidos fusionados junto con una red convolucional pequeña entrenada con el conjunto de entrenamiento.

Su relevancia radica en que aborda un problema clásico de bioinformática —la anotación funcional de enzimas— con un enfoque computacionalmente ligero (2,5 minutos para 11.367 secuencias en 2 CPUs, sin necesidad de internet) y con una precisión top-1 en validación del 77,35 % en el nivel EC más específico (L4) y del 95,39 % en el nivel más general (L1). El repositorio ocupa 0,1 GB y no requiere GPU para inferencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Pipeline híbrido: búsqueda por homología con MMseqs2 + gradient boosting (300 árboles) + red convolucional pequeña para casos sin coincidencia |
| Parametros totales | no disponible (no se especifica el número de parámetros de los componentes) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (entrada: secuencia de aminoácidos; no se especifica límite de longitud) |
| Tipos de cuantizacion | no disponible (no aplica cuantización de pesos de red neuronal estándar) |
| Idiomas soportados | no aplica (entrada: secuencias de aminoácidos en formato texto) |
| Licencia | no disponible para el modelo; MMseqs2 incluido bajo licencia MIT |
| Formato de pesos | `model.npz` (NumPy) con secuencias de entrenamiento, etiquetas, red convolucional y modelo de árboles; binarios `mmseqs_avx2` y `mmseqs_sse41` |

## Arquitectura y entrenamiento

El sistema no es un transformer ni un modelo de lenguaje. Se compone de tres etapas encadenadas. En la primera, cada secuencia de entrada se busca contra todas las secuencias de entrenamiento mediante MMseqs2 (herramienta de alineamiento de secuencias proteicas). En la segunda, los números EC de las 30 mejores coincidencias se convierten en candidatos, y un modelo de árboles con 300 estimadores puntúa cada candidato a partir de 36 características (puntuación de alineamiento, identidad de secuencia, cobertura, rango de la coincidencia y frecuencia del número EC, entre otras). El candidato con mayor puntuación es la respuesta final. En la tercera etapa, para entradas sin ninguna coincidencia, se realiza una segunda búsqueda sobre fragmentos de aminoácidos fusionados y se aplica una red convolucional pequeña entrenada con el conjunto de entrenamiento.

El modelo de árboles se entrenó sobre búsquedas de las secuencias de entrenamiento contra el resto del conjunto, ocultando parientes cercanos para que la distribución de los datos de entrenamiento se asemeje a la de validación. No se especifica el número de tokens de entrenamiento (no aplica), la composición exacta del dataset ni si hubo RLHF o DPO (no aplica a este tipo de modelo). La innovación técnica destacable es el uso de una búsqueda secundaria sobre fragmentos fusionados como respaldo para secuencias huérfanas, junto con la incorporación de la frecuencia del EC como característica del modelo de árboles.

## Capacidades

- Predicción del número EC de una enzima a partir de su secuencia de aminoácidos, en cuatro niveles de especificidad (L1 a L4).
- Búsqueda de homología contra un conjunto de secuencias de entrenamiento mediante MMseqs2.
- Puntuación de candidatos EC mediante un modelo de gradient boosting con 300 árboles y 36 características.
- Manejo de secuencias sin coincidencias mediante búsqueda secundaria sobre fragmentos de aminoácidos fusionados y una red convolucional.
- Procesamiento por lotes: lectura de un fichero Parquet con columnas `id` y `sequence`, y escritura de un JSONL con una línea por secuencia única.
- Ejecución sin conexión a internet y sin GPU.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, visión, audio ni capacidades multilingües en el sentido de los modelos de lenguaje.

## Casos de uso

- Anotación funcional automatizada de genomas y metagenomas: el modelo permite asignar números EC a miles de secuencias proteicas en pocos minutos (11.367 secuencias en 2,5 minutos en 2 CPUs), lo que lo hace adecuado para pipelines de anotación a gran escala donde no se dispone de GPU.
- Curado de bases de datos enzimáticas: se puede usar para predecir el nivel EC L1 (95,39 % de precisión top-1) y L2 (93,14 %) como primer filtro, reservando la validación manual para los niveles L3 y L4, donde la precisión baja al 91,79 % y 77,35 % respectivamente.
- Clasificación de enzimas en entornos con recursos limitados: al no requerir GPU ni internet y ocupar 0,1 GB, es desplegable en contenedores Docker en servidores modestos o incluso en estaciones de trabajo locales.
- Integración en pipelines de bioinformática existentes: la interfaz de línea de comandos (`python predict.py --input input.parquet --output predictions.jsonl`) facilita su incorporación en flujos Snakemake, Nextflow o scripts de análisis.
- Docencia y experimentación con métodos de clasificación enzimática: sirve como referencia reproducible para comparar enfoques basados en homología frente a modelos de aprendizaje profundo en la tarea de predicción de EC.
- Filtrado previo en proyectos de diseño de enzimas: permite descartar o priorizar candidatos según su clase enzimática predicha antes de realizar ensayos experimentales costosos.
- Análisis de secuencias huérfanas: la etapa de respaldo con red convolucional permite obtener una predicción aproximada para secuencias sin homólogos claros en el conjunto de entrenamiento.

## Benchmarks y rendimiento

Resultados de validación (top-1) reportados por el autor y puntuados por el leaderboard del reto Leak CURBER:

| Nivel EC | Precision top-1 |
|---|---|
| L4 | 0,7735 |
| L3 | 0,9179 |
| L2 | 0,9314 |
| L1 | 0,9539 |

No se han publicado resultados comparativos con otros modelos en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica; el modelo no requiere GPU.
- GPU recomendadas: ninguna; la inferencia se ejecuta en CPU.
- Cabe en cualquier CPU consumer: el autor reporta ejecución en 2 CPUs para 11.367 secuencias en aproximadamente 2,5 minutos.
- Espacio en disco: 0,1 GB para el repositorio completo.
- Opciones de despliegue: ejecución directa con `python predict.py`, contenedor Docker (incluye `Dockerfile`), o integración en pipelines de bioinformática. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput estimados: aproximadamente 11.367 secuencias en 2,5 minutos en 2 CPUs (unas 75 secuencias por segundo, estimación derivada de los datos del autor).
- Los binarios de MMseqs2 incluidos (`mmseqs_avx2` y `mmseqs_sse41`) permiten ejecución en CPUs con distintas extensiones SIMD.

## Comparativa con modelos similares

| Modelo | Tipo | Enfoque | Niveles EC | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| p-gupta/enzyme-ec-predictor | Híbrido (MMseqs2 + árboles + CNN) | Búsqueda por homología con respaldo convolucional | L1-L4 | no disponible | HuggingFace |
| p-gupta/enzyme-model | Modelo starter para clasificación enzimática | Entrenable por el usuario | no disponible | no disponible | HuggingFace |
| airghoxir/EEnzymeProject | Aplicación web | Predictor específico de lactato deshidrogenasa | no disponible | no disponible | HuggingFace |

No se dispone de datos de rendimiento de los modelos comparables en la información proporcionada, por lo que no es posible establecer una comparación cuantitativa.

## Limitaciones y advertencias

- El modelo se entrenó exclusivamente con los datos de entrenamiento del reto Leak CURBER, por lo que su generalización a enzimas fuera de esa distribución no está garantizada.
- La precisión en el nivel más específico (L4) es del 77,35 %, lo que implica que aproximadamente una de cada cuatro predicciones top-1 en ese nivel es incorrecta.
- Las secuencias sin homólogos en el conjunto de entrenamiento dependen de la etapa de respaldo (búsqueda sobre fragmentos fusionados y red convolucional), cuya precisión no se reporta de forma independiente.
- No se especifica la licencia del modelo, lo que impide confirmar si su uso comercial está permitido; solo se documenta la licencia MIT de MMseqs2.
- No se dispone de información sobre sesgos, riesgos de alucinación en el sentido de los modelos de lenguaje (no aplica) ni limitaciones idiomáticas (no aplica).
- El modelo no es un modelo de lenguaje: no genera texto, no razona, no soporta tool calling ni agentes. Cualquier uso fuera de la predicción de números EC a partir de secuencias de aminoácidos queda fuera de su alcance.
- La entrada debe ser un fichero Parquet con columnas `id` y `sequence`; no se documentan otros formatos de entrada.
- El rendimiento depende de la calidad y cobertura del conjunto de secuencias de entrenamiento incluido en `model.npz`.

## Enlaces

- [HuggingFace: p-gupta/enzyme-ec-predictor](https://huggingface.co/p-gupta/enzyme-ec-predictor)
- [HuggingFace: p-gupta/enzyme-model](https://huggingface.co/p-gupta/enzyme-model)
- [HuggingFace: airghoxir/EEnzymeProject](https://huggingface.co/airghoxir/EEnzymeProject)
- [MMseqs2 (GitHub)](https://github.com/soedinglab/MMseqs2)
- [Generative artificial intelligence for enzyme design and biocatalysis (ScienceDirect)](https://www.sciencedirect.com/science/article/pii/S1367593126000773)
- [Enzyme property prediction using artificial intelligence (ScienceDirect)](https://www.sciencedirect.com/science/article/pii/S2211339825001200)
