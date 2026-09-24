# Quicksort-fr/T-CRED-SL

## Resumen

T-CRED-SL (T-CRED Semantic-Learned) es un cross-encoder en inglés de 33.371.536 parámetros desarrollado por Murad Mustafayev y alojado por la organización Quicksort-fr. No es un modelo generativo ni un recuperador: es un modelo de evaluación que puntúa seis constructos semánticos sobre salidas de sistemas de generación aumentada por recuperación (RAG), RAG temporal, Graph RAG y respuesta a preguntas sobre grafos de conocimiento temporales. Su backbone es microsoft/MiniLM-L12-H384-uncased con ajuste fino completo, y acepta como máximo 256 tokens wordpiece de entrada.

El problema que aborda es la falta de diagnóstico granular en las métricas habituales de solapamiento de respuestas y consistencia factual genérica: T-CRED-SL intenta separar si una respuesta es semánticamente correcta, si está respaldada por la evidencia recuperada, si es válida en el momento temporal solicitado, si está citada adecuadamente y si es respondible con el contexto disponible. Las reglas deterministas de intervalos exactos, validez de caminos dirigidos, procedencia y ausencia de citas quedan fuera del modelo aprendido.

Es relevante ahora porque se publica explícitamente como un artefacto de investigación de resultado negativo: en la meta-evaluación final, con conjuntos humanos y disjuntos por fuente, este modelo aprendido no superó a la versión determinista T-CRED v1.4. Se libera como línea base ligera, checkpoint multi-tarea auditable y punto de partida para investigar métricas aprendidas de RAG, no como sustituto de la evaluación humana.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Cross-encoder basado en MiniLM-L12-H384-uncased con ajuste fino completo; 8 cabezas lineales de salida sobre 6 familias de tareas |
| Parametros totales | 33.371.536 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 256 tokens wordpiece (maximo de entrada) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | Ingles unicamente |
| Licencia | other; restringida a investigacion no comercial (la mezcla de entrenamiento incluye ANLI y MS MARCO) |
| Formato de pesos | SafeTensors |
| Capas / tamano oculto / cabezas de atencion | 12 / 384 / 12 |
| Tamano del tokenizer | 30.536, incluidos 14 tokens de tarea/campo |
| Pipeline (HuggingFace) | text-classification |
| Libreria | transformers (requiere custom_code y trust_remote_code=True) |
| Tamano del repositorio | 0,1 GB |
| SHA-256 de los pesos | 33e2e19437aaea4b7ebadf3e3fc2102cf700197ece3cff31b9fc6d5fee5ca81c |
| Fecha de creacion (segun HuggingFace) | 2026-09-23 |

## Arquitectura y entrenamiento

La arquitectura es un transformer encoder tipo cross-encoder: el backbone MiniLM-L12-H384-uncased (12 capas, 384 dimensiones ocultas, 12 cabezas de atencion) procesa conjuntamente pregunta, candidato, evidencia y metadatos temporales, y sobre la representacion resultante se aplican 8 cabezas lineales que cubren 6 familias de tareas. El tokenizer se amplia hasta 30.536 entradas con 14 tokens especificos de tarea y campo, y la entrada se trunca a 256 tokens wordpiece, lo que impone un limite estricto a la evidencia que cabe en cada puntuacion. La inferencia calibrada se expone mediante un metodo `predict`, con soporte de batching (por ejemplo, `batch_size=32`), y el repositorio permite tambien inferencia sobre las cabezas en crudo.

El entrenamiento se realizo con ajuste fino completo sobre 798.565 filas de entrenamiento, 71.033 de desarrollo y 17.854 de calibracion, con 1.097.111 presentaciones de entrenamiento y 8.589 pasos de optimizador, con semilla final 42 y una unica semilla final completada. La mezcla de datos incluye nyu-mll/multi_nli, alisawuffles/WANLI, facebook/anli, google-research-datasets/paws, tals/vitaminc, osunlp/AttributionBench, rajpurkar/squad_v2 y microsoft/ms_marco. No se menciona en la informacion disponible el uso de RLHF, DPO ni de decodificacion especulativa; tampoco se detalla la composicion porcentual del dataset ni el numero total de tokens de entrenamiento.

## Capacidades

- Puntuacion de correccion y equivalencia de respuestas (`task: answer`), comparando un candidato contra respuestas de referencia.
- Puntuacion de soporte de evidencia (`task: support`), evaluando si una afirmacion esta respaldada por los pasajes de evidencia proporcionados.
- Puntuacion de relevancia de la recuperacion dentro del pipeline RAG.
- Puntuacion de soporte temporal expresado en lenguaje (no aritmetica de marcas de tiempo).
- Puntuacion de respondibilidad (answerability) respecto al contexto disponible.
- Puntuacion de adecuacion de citas (citation appropriateness) y evaluacion de atribucion de evidencia.
- Deteccion de alucinaciones y de inconsistencias factuales como parte de la evaluacion de RAG.
- Salidas calibradas mediante inferencia con `predict` y posibilidad de inferencia directa sobre las 8 cabezas lineales.
- Procesamiento por lotes de registros de evaluacion con contrato de entrada definido en USAGE.md.
- No soporta generacion de texto, tool calling, function calling, uso como agente, razonamiento multi-paso, vision ni audio.
- No actua como recuperador (retriever), reranker ni razonador sobre bases de conocimiento temporales.
- Multilingue: no; el modelo es exclusivamente en ingles.

## Casos de uso

- Meta-evaluacion de pipelines RAG: el modelo puntua por separado correccion semantica, soporte de evidencia y atribucion de citas, lo que permite diagnosticar que componente del pipeline falla en lugar de obtener una unica cifra agregada.
- Deteccion de alucinaciones en generacion fundamentada: al puntuar soporte de evidencia y respondibilidad con evidencia de 256 tokens, sirve como filtro de segundo nivel sobre respuestas marcadas como dudosas por metricas mas baratas.
- Evaluacion de citas y atribucion en asistentes documentales: dado un candidato y los pasajes citados, el modelo estima si la cita es apropiada para la afirmacion emitida.
- Evaluacion de RAG temporal a nivel linguistico: comprueba si la respuesta es coherente con la formulacion temporal de la pregunta (por ejemplo, operadores como "during"), sin asumir la aritmetica exacta de intervalos, que queda en las reglas deterministas.
- Ablaciones de investigacion sobre metricas aprendidas: comparar las puntuaciones semanticas de T-CRED-SL con las reglas deterministas de T-CRED v1.4 para aislar que parte del problema de medida se aprende y cual no.
- Etiquetado y filtrado de datos de evaluacion: generar senales semanticas auxiliares sobre grandes lotes de pares pregunta-respuesta-evidencia para priorizar revision humana.
- Reproduccion del resultado negativo reportado: el checkpoint permite replicar el hallazgo de que un buen rendimiento en tareas semanticas retenidas no preserva separacion de constructos, sensibilidad temporal, validez de grafo ni invariancia a actualizaciones.
- Analisis de sensibilidad al truncado: con un limite de 256 tokens, permite estudiar como se degradan las puntuaciones de soporte cuando la evidencia relevante queda fuera de la ventana.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye tablas de MMLU, HumanEval, GSM8K ni equivalentes, y el unico dato de rendimiento reportado es cualitativo: en la meta-evaluacion final, con conjuntos humanos y disjuntos por fuente, el modelo no supero a la version determinista T-CRED v1.4. No se proporcionan cifras concretas de esa comparacion.

## Requisitos de hardware

- VRAM estimada (calculada a partir de los 33.371.536 parametros, no confirmada por el autor): aproximadamente 134 MB en FP32, 67 MB en FP16/BF16 y 33 MB en INT8.
- El modelo cabe sin dificultad en cualquier GPU de consumo; tambien puede ejecutarse en CPU, ya que el checkpoint completo ocupa 0,1 GB en el repositorio.
- GPU recomendadas: no se especifican en la informacion disponible. Por tamano, cualquier GPU con al menos 1-2 GB de VRAM libre es suficiente; GPU de datacenter como A100 o H100 solo tendrian sentido para procesar grandes lotes en paralelo.
- El cuello de botella previsible no es la memoria sino el throughput de evaluacion: cada registro se trunca a 256 tokens y las tareas que requieren multiples pasajes de evidencia consumen varias evaluaciones por consulta.
- Opciones de despliegue: la unica via documentada es HuggingFace transformers con `trust_remote_code=True` y PyTorch (>=2.6,<3) junto con transformers (>=4.53,<5) y safetensors. No se mencionan en la informacion disponible soportes para vLLM, llama.cpp, Ollama, TGI ni exportacion a GGUF u ONNX.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

La informacion proporcionada no incluye datos de rendimiento de modelos alternativos, por lo que la comparacion se limita a caracteristicas estructurales. Se incluye el backbone y el sistema determinista mencionado en la propia model card como referencias.

| Modelo | Parametros | Contexto maximo | Tipo | Licencia | Rendimiento comparado |
|---|---|---|---|---|---|
| T-CRED-SL | 33.371.536 | 256 tokens | Cross-encoder de evaluacion, 6 tareas / 8 cabezas | other, solo investigacion no comercial | No supera a T-CRED v1.4 en la meta-evaluacion final (sin cifras publicadas) |
| microsoft/MiniLM-L12-H384-uncased | no disponible en la informacion proporcionada | no disponible en la informacion proporcionada | Encoder transformer base (modelo del que parte) | no disponible en la informacion proporcionada | No aplica; es el backbone, no una metrica de evaluacion |
| T-CRED v1.4 (determinista) | no disponible | no disponible | Sistema de reglas deterministas (intervalos, caminos dirigidos, procedencia, missingness) | no disponible | Mejor que T-CRED-SL en la meta-evaluacion final reportada (sin cifras publicadas) |

Para alternativas de la misma categoria (metricas automaticas de evaluacion de RAG): no disponible.

## Limitaciones y advertencias

- Resultado negativo declarado por el autor: el modelo no supero a T-CRED v1.4 en la meta-evaluacion final. No debe describirse como un reemplazo superior de T-CRED v1.4 ni de la evaluacion humana.
- Rendimiento semantico fuerte en tareas retenidas no garantiza separacion de constructos, sensibilidad temporal, validez de grafo, comportamiento ante datos ausentes, calibracion ni invariancia a actualizaciones.
- No es un oraculo de verdad ni un sustituto del juicio humano experto.
- No implementa la aritmetica exacta de marcas de tiempo, la validez de caminos dirigidos en grafos, la disponibilidad de procedencia ni la deteccion de citas obligatorias ausentes; esas comprobaciones pertenecen al sistema determinista.
- Licencia restrictiva: el checkpoint esta limitado a investigacion no comercial porque su mezcla de entrenamiento incluye ANLI y MS MARCO. No es desplegable comercialmente sin revisar LICENSE.md.
- Solo ingles: cualquier evaluacion en otros idiomas no esta soportada.
- Limite de 256 tokens wordpiece: la evidencia que exceda ese presupuesto se trunca, lo que puede degradar las puntuaciones de soporte y de atribucion de citas.
- Riesgo de alucinacion y de calibracion deficiente inherente a un modelo aprendido; se recomienda usar sus salidas como senal complementaria, nunca como veredicto final.
- Requiere `trust_remote_code=True` para cargar la arquitectura personalizada de seis tareas; implica ejecutar codigo del repositorio, por lo que conviene revisar `modeling_tcred_sl.py` y fijar una revision de commit concreta.
- Se completo una unica semilla final (42), lo que limita cualquier analisis de varianza entre ejecuciones.
- Es un artefacto de investigacion con 0 descargas en el momento de la consulta, sin senales de validacion por parte de la comunidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Quicksort-fr/T-CRED-SL
- Licencia: https://huggingface.co/Quicksort-fr/T-CRED-SL/blob/main/LICENSE.md
- Contrato de uso completo: https://huggingface.co/Quicksort-fr/T-CRED-SL/blob/main/USAGE.md
- Ejemplo ejecutable: https://huggingface.co/Quicksort-fr/T-CRED-SL/blob/main/example.py
- Codigo de la arquitectura personalizada: https://huggingface.co/Quicksort-fr/T-CRED-SL/blob/main/modeling_tcred_sl.py
- Modelo base: https://huggingface.co/microsoft/MiniLM-L12-H384-uncased
- La busqueda web realizada no devolvio resultados relevantes sobre este modelo: todos los enlaces recuperados apuntaban a YouTube y a servicios relacionados, sin ninguna relacion con T-CRED-SL. No se dispone por tanto de paper, blog tecnico ni repositorio adicional verificable.
