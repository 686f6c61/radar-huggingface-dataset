# Magic51/system-lab-airspace-shall-router

## Resumen

`Magic51/system-lab-airspace-shall-router` es un clasificador neuronal experimental publicado en HuggingFace que detecta la presencia literal de la palabra inglesa «shall» en pasajes de documentación regulatoria, con el único fin de enrutar esos pasajes a una cola de revisión humana. Lo desarrolla el usuario Magic51 dentro de un proyecto denominado System Lab. No es un modelo generativo: es una cabeza de clasificación binaria (384 → 32 → 2 con ReLU) montada sobre el codificador congelado `sentence-transformers/all-MiniLM-L6-v2`, con 12.386 parámetros entrenables. Su interés es tanto técnico como metodológico, porque la model card documenta con detalle inusual el proceso de anotación con un profesor (`google/flan-t5-base`), tres intentos fallidos anteriores y una evaluación en la que una línea base determinista supera al propio modelo neuronal.

El autor lo etiqueta explícitamente como «Experimental — Not promoted» y advierte de que sus etiquetas no afirman que exista una obligación legal ni que esta se aplique o se haya cumplido. Se entrenó con 82 pasajes aceptados del Reglamento (UE) 2019/947, se validó con 87 del 2019/945 y se evaluó con 77 del 2021/664, todos en inglés y extraídos de consolidaciones de referencia de EASA. El repositorio tiene 0 descargas y 0 «likes», por lo que carece de validación externa alguna.

El modelo resuelve un problema muy acotado —triaje de marcadores explícitos para revisores— y lo hace peor que una búsqueda literal de la cadena «shall». Su valor práctico es, por tanto, el de una pieza de infraestructura de investigación reproducible, no el de un componente listo para producción.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Codificador transformer congelado (all-MiniLM-L6-v2, salida de 384 dimensiones) + MLP 384 → 32 → 2 con activación ReLU; clasificación binaria |
| Parametros totales | 12.386 parámetros entrenables en la cabeza MLP; el codificador congelado se descarga por separado y su recuento no se indica en la model card |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible; la model card no la declara y la unidad de entrada es un pasaje individual codificado por el encoder |
| Tipos de cuantizacion | No disponible; solo se publican pesos en precisión original, sin variantes GGUF, ONNX ni cuantizadas |
| Idiomas soportados | Inglés únicamente (`en`) |
| Licencia | Apache 2.0 (código y pesos del estudiante; las licencias de los modelos upstream son independientes) |
| Formato de pesos | `safetensors` (`student.safetensors`); los pesos del codificador preentrenado se obtienen aparte mediante el instalador explícito |

## Arquitectura y entrenamiento

La arquitectura es deliberadamente mínima: un encoder `all-MiniLM-L6-v2` congelado en la revisión `1110a243fdf4706b3f48f1d95db1a4f5529b4d41` que produce un vector de 384 dimensiones, seguido de un perceptrón multicapa 384 → 32 → 2 con ReLU. Se probaron anchos ocultos de 16, 32 y 64, y se seleccionó 32 por pérdida de validación. El entrenamiento se hizo sobre un único NVIDIA GeForce RTX 2080 de 8 GB, con Python 3.13.1 y PyTorch 2.6.0+cu126; el experimento completo tardó 21,14 segundos (18,58 s de ejecución del profesor, 0,62 s de codificación de pasajes aceptados y 1,14 s de entrenamiento del candidato). No hay RLHF ni DPO: el aprendizaje es supervisado sobre etiquetas generadas por el profesor.

El etiquetado lo produjo `google/flan-t5-base` en la revisión `7bcac572ce56db69c1ea7c8af255c5d7c9672fc2` sobre 288 pasajes legales reales de la UE extraídos de consolidaciones de referencia de EASA. La validación de esquema y de extensión exacta puso en cuarentena 42 anotaciones, de modo que quedaron 246 etiquetas generadas automáticamente y sin revisar; ninguna se describe como verdad experta. La partición se hizo por familia documental (2019/947 para entrenamiento, 2019/945 para validación, 2021/664 para prueba), con eliminación de duplicados exactos entre particiones, pero sin retenciones temporales ni de versión de documento porque solo se recuperó una edición por familia. La selección de pasajes tiene sesgo hacia el marcador explícito, de forma que el texto sin marcar puede imponer obligaciones reales mediante listas, definiciones o condiciones.

Un dato relevante de ingeniería: tres intentos previos de anotación semántica de obligaciones (runs 1 a 3) no superaron las puertas de fuente, esquema y diversidad y no produjeron modelo entrenado; los profesores FLAN pequeños y base no generaron etiquetas semánticas suficientemente validadas. Ese fallo medido motivó la reformulación hacia la tarea estrecha de lenguaje explícito.

## Capacidades

- Clasificación binaria de presencia literal del token «shall» en un pasaje de texto en inglés, orientada al enrutado a revisión.
- Salida de probabilidad por clase, advirtiendo el autor que no está calibrada y que no debe leerse como porcentaje de confianza legal.
- Integración programática mediante el código de aplicación incluido (`airspace.neural.ExperimentalStudent` y `LocalEncoder`), no mediante widget de inferencia alojado.
- Inferencia en CPU soportada y medida aparte en `release-evidence/neural-cpu-verification.json`; GPU opcional.
- Trazabilidad de experimento: manifiesto de run con arquitectura completa, SHA-256, semilla, ajustes de optimización, historiales y revisiones upstream.
- No soporta generación de texto, razonamiento, código, matemáticas, visión, audio, tool calling, función de agente ni razonamiento multi-paso.
- No es multilingüe: solo inglés, con sesgo de selección hacia marcadores explícitos.

## Casos de uso

- Triaje de consolidaciones regulatorias: dado un lote de pasajes de reglamentos EASA, marcar los que contienen la palabra «shall» para que un revisor humano los examine primero, reduciendo el volumen de la cola de revisión manual.
- Pre-filtro en pipelines de extracción de obligaciones: colocar el clasificador delante de un extractor semántico más costoso para descartar texto sin marcador explícito, aceptando que el descarte es heurístico y debe auditarse.
- Auditoría de corpus y control de calidad de anotaciones: comparar las predicciones del estudiante con las etiquetas del profesor para localizar pasajes donde la anotación automática y el marcador literal discrepan.
- Etiquetado asistido para curación de datasets: usar el modelo como generador de candidatos en un bucle de revisión humana antes de incorporar etiquetas a un conjunto de entrenamiento mayor.
- Seguimiento de versiones documentales: al reeditAR una consolidación, ejecutar el clasificador sobre el texto nuevo y comparar con la ejecución anterior para detectar altas y bajas de marcadores explícitos entre ediciones.
- Verificación de líneas base en investigación: servir como referencia neuronal mínima frente a la que medir clasificadores léxicos o semánticos más complejos, dado que el autor reporta la comparación completa.
- Enrutado interno con humano en el bucle: integrarlo en una herramienta de gestión documental donde la decisión final siempre la toma una persona y el modelo solo ordena la cola de trabajo.

## Benchmarks y rendimiento

Los únicos resultados publicados son de concordancia con las etiquetas automáticas filtradas del profesor en la familia documental retenida (Reglamento 2021/664, 77 muestras). No son medidas de fiabilidad legal, de soporte de citas ni de aceptación operativa.

| Metodo | Concordancia en held-out | Muestras |
|---|---:|---:|
| Estudiante neuronal entrenado | 81,82% | 77 |
| Línea base determinista de palabra literal | 100,00% | 77 |
| Clasificador lineal léxico con hashing | 63,64% | 77 |
| Clasificador de prototipos de etiqueta con encoder congelado | 58,44% | 77 |
| Línea base de mayoría del conjunto de entrenamiento | 46,75% | 77 |

El intervalo de Wilson al 95% para el estudiante en esta medida limitada de concordancia es 71,76–88,85%, y su Brier score binario es 0,153. El autor señala que los filtros de validación imponen soporte literal del marcador, por lo que el 100% de la línea base determinista se deriva del diseño de la tarea y del filtro, y que el candidato neuronal no demuestra beneficio en producción sobre esa línea base. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible.

## Requisitos de hardware

- VRAM: no se requiere GPU para inferencia; el modelo se ejecuta en CPU. El autor recomienda unos 2 GB de RAM para la inferencia de encoder/reranker, cifra descrita como asignación conservadora de instalación y no como mínimo certificado.
- GPU recomendadas: ninguna en particular para servir el modelo. El entrenamiento del run documentado se hizo con una NVIDIA GeForce RTX 2080 de 8 GB.
- Cabe en cualquier GPU consumer, y de hecho no necesita ninguna; una GPU solo acelera la codificación por lotes.
- Para trabajo con el profesor local (`google/flan-t5-base`) el autor recomienda al menos 4 GB de memoria, además de los recursos de aplicación y base de datos.
- Opciones de despliegue: el código de aplicación incluido (`airspace.neural`) con `LocalEncoder` y `ExperimentalStudent`, invocables desde Python. No se documenta soporte para vLLM, TGI, llama.cpp ni Ollama, ni existe widget de inferencia alojado.
- Latencias del run publicado: 18,58 s de ejecución del profesor, 0,62 s de codificación de pasajes aceptados, 1,14 s de entrenamiento del candidato y 21,14 s de experimento completo. La latencia de inferencia en CPU se midió por separado en `release-evidence/neural-cpu-verification.json`, pero su valor no se reproduce en la model card. No hay datos de throughput.

## Comparativa con modelos similares

No se han identificado en la información disponible modelos publicados equivalentes de enrutado de marcadores regulatorios. La comparación pertinente es contra las líneas base evaluadas por el propio autor:

| Alternativa | Enfoque | Parametros entrenables | Concordancia held-out | Licencia / disponibilidad |
|---|---|---:|---:|---|
| Este modelo | Encoder congelado + MLP 384→32→2 | 12.386 | 81,82% | Apache 2.0; pesos en el repo, encoder aparte |
| Línea base literal | Búsqueda determinista de la cadena «shall» | 0 | 100,00% | Trivial de implementar, sin dependencias |
| Clasificador lineal léxico | Hashing de tokens + regresión | No disponible | 63,64% | Interno del run, no publicado como modelo |
| Prototipos de etiqueta | Encoder congelado + prototipos | 0 | 58,44% | Interno del run, no publicado como modelo |
| Mayoría de entrenamiento | Predicción constante | 0 | 46,75% | Interno del run, no publicado como modelo |

Frente a un LLM generativo usado como clasificador zero-shot no hay datos en la información proporcionada, por lo que la comparación no está disponible.

## Limitaciones y advertencias

- Estado «Experimental — Not promoted»: el autor indica explícitamente que el modelo no debe promocionarse y que el razonamiento legal en producción y los modelos de predicción operativa siguen deshabilitados.
- Rendimiento inferior a una línea base trivial: una búsqueda literal de «shall» obtiene 100% de concordancia frente al 81,82% del modelo, y el autor reconoce que no hay beneficio demostrado en producción.
- Etiquetas de origen automático: las 246 etiquetas provienen de un profesor y no fueron revisadas por expertos; no se describen como verdad de referencia.
- Sesgo de selección hacia el marcador explícito: el texto sin la palabra «shall» puede contener obligaciones reales expresadas mediante listas, definiciones o condiciones, y el modelo no las detecta.
- Solo inglés: cualquier corpus en otra lengua queda fuera de alcance.
- Validación incompleta: no se hicieron retenciones independientes de tiempo ni de versión de documento, y solo se recuperó una edición por familia normativa.
- Probabilidades sin calibrar: el autor advierte que las salidas no son porcentajes de confianza legal; no se ha realizado calibración.
- Sin cobertura documentada de tablas, entradas adversarias, disposiciones contradictorias o no soportadas.
- Sin señal de la comunidad: 0 descargas y 0 «likes», sin revisión independiente conocida.
- El repositorio no incluye los pesos del encoder preentrenado; hay que ejecutar el instalador explícito para obtener los modelos fijados por revisión.
- Licencia Apache 2.0 para el código y los pesos del estudiante, pero las licencias y atribuciones de los modelos upstream (`all-MiniLM-L6-v2` y `flan-t5-base`) son independientes y deben respetarse por separado.
- Requisitos de promoción pendientes según el autor: etiquetas revisadas por humanos cualificados, retenciones representativas, entradas adversarias, calibración y beneficio demostrado frente al enrutado determinista, con revisor responsable, puertas documentadas y decisión de rollback.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Magic51/system-lab-airspace-shall-router
- Modelo base (encoder): https://huggingface.co/sentence-transformers/all-MiniLM-L6-v2
- Profesor usado para el etiquetado: https://huggingface.co/google/flan-t5-base

Nota: la búsqueda web realizada no devolvió resultados relevantes sobre este modelo (papers, blogs, repos o demos); los enlaces anteriores proceden de la información de HuggingFace y de las referencias citadas en la propia model card. No se dispone de URL de paper, blog o demo.
