# RohanTheZ/leak-curber-enzyme-v3

## Resumen

`RohanTheZ/leak-curber-enzyme-v3` no es un modelo de lenguaje, sino un *pipeline* de clasificación enzimática (asignación de números EC, Enzyme Commission) publicado como submission al benchmark Leak-CURBER, orientado a la predicción de función enzimática a partir de secuencia proteica. Lo desarrolla el usuario RohanTheZ y combina tres componentes: alineamiento por homología con DIAMOND v2.1.10 (`--very-sensitive`, top 50 hits, E-value < 1e-3), un clasificador de números EC afinado sobre ESM2-8M que se ejecuta en NumPy puro, y un *reranker* de gradient boosting (scikit-learn) que combina las features de alineamiento con las probabilidades del clasificador.

El problema que aborda es central en bioinformática: predecir la función enzimática de una proteína cuando la similitud con las secuencias de referencia es baja, un escenario en el que los métodos de homología clásicos fallan. La innovación declarada es metodológica: el *reranker* se entrenó sobre cinco *folds* de validación construidos con clústeres de identidad al 40 %, de forma que sus consultas de entrenamiento no tienen parientes cercanos en la base de referencia, replicando la condición de *split* oculto del benchmark. Esto lo distingue de los *baselines* de homología pura.

El conjunto pesa 0,2 GB e incluye el binario estático de DIAMOND para linux x86-64, los pesos del clasificador en formato `.npz` y el *reranker* en `.pkl`. La inferencia se ejecuta íntegramente en CPU mediante `predict.py`. El modelo no declara licencia, idiomas ni métricas de rendimiento en la información disponible, y su pipeline asociado no está etiquetado como tarea en HuggingFace.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Pipeline híbrido en cascada: alineamiento por homología (DIAMOND) + clasificador ESM2-8M afinado (forward en NumPy) + *reranker* gradient boosting (scikit-learn) |
| Parámetros totales | ~8 M en el clasificador ESM2-8M; número de árboles y parámetros del *reranker* no disponible |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible (modelo de secuencia proteica, no conversacional) |
| Tipos de cuantización | No disponible; los pesos se distribuyen en precisión nativa dentro de `weights/ec_classifier.npz` y `weights/reranker.pkl` |
| Idiomas soportados | No disponible; la entrada es secuencia proteica, no lenguaje natural |
| Licencia | No disponible (no declarada en la model card) |
| Formato de pesos | `weights/ec_classifier.npz` (NumPy), `weights/reranker.pkl` (pickle de scikit-learn), `bin/diamond` (binario estático linux x86-64) |

Otros datos: repositorio de 0,2 GB, 0 descargas y 1 *like*; creado el 2026-10-27 y actualizado el mismo día. Vocabulario EC: ExPASy ENZYME release 02-Sep-2026 (SIB, CC BY 4.0). Pipeline de HuggingFace: no disponible.

## Arquitectura y entrenamiento

El sistema es una cascada de cuatro etapas documentadas en la model card. Primero, cada consulta se alinea contra todas las secuencias únicas del conjunto de entrenamiento con DIAMOND en modo `--very-sensitive` (top 50 hits, E-value < 1e-3), troceando la ejecución para que ningún fichero supere los 16 MiB. Segundo, cada EC transportado por un hit se convierte en candidato y `rerank.py` lo describe con features de alineamiento: mejor bitscore e identidad para ese EC, cuotas de voto, rango del primer hit que lo soporta, cobertura, acuerdo en los tres primeros dígitos EC y frecuencia del EC en el conjunto de entrenamiento. Tercero, para consultas cuyo mejor hit queda por debajo del 40 % de identidad (procesadas de más débil a más fuerte dentro de un presupuesto de tiempo), el clasificador ESM2-8M afinado asigna una probabilidad a cada EC candidato; las consultas sin ningún hit toman directamente el EC top del clasificador. Cuarto, el *reranker* puntúa cada candidato y se predice el de mayor puntuación; si no hay hit ni salida del clasificador, se devuelve el EC más frecuente del entrenamiento.

El detalle técnico más relevante es el diseño del conjunto de entrenamiento del *reranker*: se usaron cinco *folds* retenidos de clústeres completos al 40 % de identidad, de modo que las consultas de entrenamiento no tienen familiares cercanos en la base de referencia, imitando el *split* oculto del benchmark. No se especifican en la información disponible el número de secuencias de entrenamiento, la composición del dataset, ni si hubo ajuste fino supervisado adicional más allá del clasificador ESM2-8M. La reproducibilidad se apoya en dos scripts: `train.py --train train.parquet` construye la base de datos DIAMOND y los ficheros de etiquetas, y `predict.py --input INPUT --output OUTPUT` ejecuta la inferencia en CPU.

## Capacidades

- Predicción de números EC (Enzyme Commission) a partir de secuencia proteica, devolviendo un único EC de máxima puntuación por consulta.
- Clasificación robusta en régimen de baja homología: activa el clasificador ESM2-8M cuando el mejor hit cae por debajo del 40 % de identidad.
- Aprovechamiento explícito de la evidencia de alineamiento (bitscore, identidad, cobertura, acuerdo en los tres primeros dígitos EC) mediante un *reranker* supervisado.
- *Fallback* determinista: consultas sin hit y sin salida del clasificador reciben el EC más frecuente del conjunto de entrenamiento.
- Ejecución completa en CPU, sin requisito de GPU.
- Reproducibilidad de extremo a extremo mediante scripts de entrenamiento e inferencia incluidos en el repositorio.
- No soporta *tool calling*, agentes, razonamiento multi-paso, visión, audio ni generación de texto: no es un modelo de lenguaje.

## Casos de uso

- Anotación funcional de proteínas en metagenómica: procesar lotes de secuencias ambientales con `predict.py` en CPU y obtener un EC por proteína, usando el clasificador ESM2-8M para las secuencias sin homología detectable en la base de referencia.
- Curado de bases de datos enzimáticas: priorizar candidatos para revisión manual allí donde el pipeline difiere de la anotación automática por homología, aprovechando las features de identidad y cobertura que produce `rerank.py`.
- Triaje previo a validación experimental: seleccionar qué enzimas candidatas merecen ensayo de actividad, filtrando predicciones con soporte de alineamiento fuerte (alta identidad y bitscore) frente a las que dependen solo del clasificador.
- Reconstrucción de rutas metabólicas: asignar EC a un conjunto de proteínas de un genoma o transcriptoma para mapearlas después sobre rutas KEGG/ExPASy, con la ventaja de que el *fallback* garantiza siempre una etiqueta accionable.
- Evaluación comparativa de métodos de anotación: usar el repositorio como *baseline* reproducible frente a BLASTp o DIAMOND puros, dado que `train.py` reconstruye la base de datos y las etiquetas desde `train.parquet`.
- Docencia y prototipado en bioinformática computacional: al ejecutarse en CPU con un binario estático y pesos de ~8 M de parámetros, el pipeline se puede desplegar en portátiles o contenedores sin GPU para prácticas de anotación enzimática.
- Integración en *pipelines* de anotación internos: invocar `predict.py` como paso de un flujo mayor (ensamblado, predicción de ORFs, asignación EC, informe), siempre que el entorno sea linux x86-64 por el binario de DIAMOND incluido.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas del *split* oculto de Leak-CURBER ni de los *folds* internos, y el repositorio no presenta cifras de precisión, *F-max* ni accuracy para la tarea de clasificación enzimática. El benchmark Leak-CURBER (NeurIPS 2026, Evaluations and Datasets Track) define 10 subtareas, de las cuales dos corresponden a función enzimática; este repositorio es una submission a la de clasificación, pero no se aporta su puntuación en el *leaderboard*.

## Requisitos de hardware

- VRAM: no aplica; la inferencia es CPU-only según la model card (`predict.py` ejecuta la inferencia en CPU).
- GPU recomendadas: ninguna; no se documenta soporte CUDA. El clasificador ESM2-8M se ejecuta con un *forward* en NumPy, no en PyTorch.
- Cabe en cualquier equipo de consumo: el repositorio completo ocupa 0,2 GB y el clasificador tiene ~8 M de parámetros; el cuello de botella es el alineamiento DIAMOND y la memoria necesaria para su base de datos, cuyo tamaño no se especifica.
- Restricción de plataforma: `bin/diamond` es un binario estático para linux x86-64 (DIAMOND v2.1.10), por lo que el pipeline no es portable directamente a macOS ARM ni a Windows sin sustituir el binario.
- Opciones de despliegue: scripts CLI (`predict.py`, `train.py`) sobre Python con NumPy y scikit-learn. No hay soporte documentado para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles. La model card menciona un «presupuesto de tiempo» para la fase del clasificador, lo que implica control explícito del coste, pero no se publican cifras.

## Comparativa con modelos similares

| Modelo | Enfoque | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `RohanTheZ/leak-curber-enzyme-v3` | DIAMOND + ESM2-8M afinado + *reranker* GBDT | ~8 M (clasificador) | No aplica | No disponible | Público en HF, 0 descargas |
| `starkAhmed43/leak-curber-enzyme-classification-starter` | Modelo de partida para la tarea de clasificación enzimática del benchmark | No disponible | No aplica | No disponible | Público en HF |
| *Baselines* de homología del repositorio Leak-CURBER | Alineamiento por homología (adaptadores *baseline* del benchmark) | No disponible | No aplica | No disponible | Código público en GitHub |
| ESM2-8M sin ajuste fino (referencia conceptual) | Clasificación directa con *embeddings* del modelo base | ~8 M | No disponible | No disponible | Público |

No se dispone de métricas comparativas publicadas para ninguna de las alternativas en la información proporcionada, por lo que la comparación se limita a enfoque, tamaño y disponibilidad. La diferencia funcional más clara frente a un *baseline* de homología pura es la etapa de clasificación neuronal y el *reranker* aprendido, que solo se activan cuando la identidad del mejor hit es baja.

## Limitaciones y advertencias

- Ausencia de licencia declarada: no se especifican términos de uso, lo que impide asumir permisos de uso comercial o de redistribución. Cualquier despliegue en producción requiere contactar con el autor.
- Sin métricas publicadas: no hay evidencia cuantitativa de rendimiento ni en el *split* oculto ni en validación interna, y el repositorio acumula 0 descargas, por lo que no existe validación por terceros.
- Predicción de un único EC por consulta, aunque una misma proteína puede tener varios EC registrados; no se documenta manejo multi-etiqueta.
- Dependencia de la base de referencia construida en `train.py` a partir de `train.parquet`: el fichero de entrenamiento no se detalla en la información disponible (tamaño, procedencia, cobertura taxonómica), lo que limita la reproducibilidad exacta y la interpretación de los resultados.
- El clasificador neuronal tiene solo ~8 M de parámetros y se ejecuta en NumPy; su capacidad de generalización en proteínas sin homología detectable es, por construcción, el punto más frágil del pipeline.
- El *fallback* a la clase mayoritaria (EC más frecuente del entrenamiento) puede producir prediciones sistemáticamente sesgadas hacia las familias enzimáticas sobrerrepresentadas en el conjunto de entrenamiento.
- Portabilidad reducida: binario DIAMOND estático solo para linux x86-64; no se documentan contenedores ni wheels alternativos.
- Riesgo de alucinación en el sentido de LLM: no aplica; el riesgo equivalente es la asignación errónea de EC con alta confianza aparente, especialmente en consultas sin hit.
- Fechas de creación y actualización (2026-10-27) y referencia al release de ExPASy 02-Sep-2026: conviene verificar la vigencia del vocabulario EC si se compara con anotaciones de otros periodos.
- El vocabulario EC subyacente es ExPASy ENZYME (CC BY 4.0), con obligación de atribución si se redistribuye.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/RohanTheZ/leak-curber-enzyme-v3
- Repositorio del benchmark Leak-CURBER: https://github.com/bisect-group/Leak-CURBER/tree/main
- Póster en NeurIPS 2026: https://neurips.cc/virtual/2026/poster/139384
- Anuncio de aceptación del paper (Roshan Balaji): https://roshanmsb.github.io/news/announcement_12/
- Modelo de partida para la tarea de clasificación enzimática: https://huggingface.co/starkAhmed43/leak-curber-enzyme-classification-starter
- Modelos etiquetados con `leak-curber` en HuggingFace: https://huggingface.co/models?other=leak-curber
- DIAMOND v2.1.10 (binario incluido en el repo): https://github.com/bbuchfink/diamond
- Vocabulario EC de referencia (ExPASy ENZYME): no disponible en la información proporcionada
