# Saiteja-madineni/enzyme-retrieval-v8

## Resumen

Enzyme-retrieval-v8 (Run-08) es un artefacto experimental de recuperación de enzimas y clasificación de reacciones químicas publicado por Saiteja-madineni. No es un modelo de lenguaje generativo: se trata de un pipeline de recuperación estructural con un banco de referencia de 32 vecinos construido a partir de 63.280 grupos de entrenamiento públicos, empaquetado en formato ONNX y con un punto de entrada de inferencia en `/app/predict.py`. Su tarea es asignar la clasificación EC4 (cuarto nivel de la Enzyme Commission) a una consulta de reacción, apoyándose en la similitud estructural de vecinos y en votos de confianza.

El modelo se presenta explícitamente como un candidato de despliegue sobre Run-07, con una regla de decisión concreta: un voto de vecino puede alterar la predicción top dentro de su familia EC3 cuando la confianza del voto alcanza 0,95 y la similitud estructural alcanza 0,90. En la auditoría interna histórica de 2.000 consultas, Run-08 obtuvo un 59,3912% de top-1 EC4 fraccional frente al 59,5912% de Run-07, lo que supone una variación pareada de -0,2000 puntos porcentuales, es decir, un empeoramiento marginal.

La relevancia de esta ficha es acotada: se trata de un artefacto de investigación con cero descargas y cero likes en el momento de la consulta, licencia mixta por componentes y sin benchmarks públicos independientes. Resulta útil como referencia para quien evalúe pipelines de anotación enzimática por recuperación, pero no debe confundirse con un modelo base ni con un sistema listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Pipeline de recuperación estructural por vecinos (banco de referencia de 32 vecinos) con votos de confianza; no es un transformer generativo |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible; el artefacto se distribuye en formato ONNX |
| Idiomas soportados | en |
| Licencia | other (mixed-component-licenses), con atribución en ATTRIBUTION_RUN07.md |
| Formato de pesos | ONNX |

## Arquitectura y entrenamiento

La información disponible no describe una arquitectura de red neuronal con capas, atención ni parámetros entrenables. Lo que documenta la model card es un mecanismo de recuperación y votación: un banco de referencia de 32 vecinos computado sobre 63.280 grupos de entrenamiento públicos, sobre el que se aplica una regla de decisión que puede modificar la predicción top dentro de la familia EC3 cuando concurren dos umbrales (confianza de voto ≥ 0,95 y similitud estructural ≥ 0,90). El autor menciona además un reajuste del banco de referencia estructural sobre todas las reacciones públicas de entrenamiento, que cambia el candidato de despliegue y cuya puntuación oficial es desconocida.

No se especifican en la información proporcionada el número de tokens, la composición del dataset, la existencia de RLHF/DPO ni innovaciones como decodificación especulativa o atención lineal. Tampoco se detalla qué componente concreto del pipeline se ha exportado a ONNX ni qué arquitectura subyace a la parte de similitud estructural. Cualquier afirmación sobre estos puntos sería especulativa.

## Capacidades

- Clasificación de reacciones enzimáticas a nivel EC4 (cuarto nivel de la Enzyme Commission) mediante recuperación de vecinos estructurales.
- Recuperación de candidatos por similitud estructural sobre un banco de referencia de 32 vecinos.
- Votación de vecinos con umbrales de confianza (0,95) y similitud (0,90) que pueden reordenar la predicción top dentro de la familia EC3.
- Inferencia en formato ONNX con punto de entrada `/app/predict.py`.
- Procesamiento de consultas en inglés (idioma declarado: en).
- No se documentan capacidades de generación de texto, razonamiento general, código, matemáticas, visión, audio, tool calling ni razonamiento multi-paso.

## Casos de uso

- Anotación asistida de reacciones enzimáticas en bases de datos internas: el pipeline puede proponer una clase EC4 para reacciones nuevas y un revisor humano valida o corrige, aprovechando la regla de voto con umbrales explícitos para limitar cambios de alto riesgo.
- Triaje de candidatos en pipelines de biocatálisis: dado un conjunto de reacciones sin anotar, el sistema recupera vecinos estructurales y prioriza las que tienen predicción consistente para revisión posterior.
- Comparación de versiones de un sistema de recuperación: Run-08 sirve como candidato de despliegue frente a Run-07 en una auditoría interna, con métrica pareada de top-1 EC4 fraccional, útil para decidir si se promociona un cambio de banco de referencia.
- Investigación reproducible sobre recuperación estructural: al estar empaquetado en ONNX con un entry point definido, permite reproducir la auditoría de 2.000 consultas y analizar el efecto de los umbrales de voto.
- Detección de regresiones en clasificación enzimática: la variación de -0,2000 pp frente a Run-07 documentada en la auditoría interna puede integrarse como caso de prueba en un sistema de control de calidad de modelos químicos.
- Evaluación de licencias en pipelines mixtos: el artefacto incluye un fichero de atribución por componentes (ATTRIBUTION_RUN07.md), lo que lo convierte en un caso práctico para auditar la procedencia de componentes heredados antes de un despliegue comercial.

## Benchmarks y rendimiento

Los únicos datos publicados en la información disponible son los de la auditoría interna histórica de 2.000 consultas, con métrica de top-1 EC4 fraccional:

| Modelo | Top-1 EC4 fraccional (auditoría interna, 2.000 consultas) | Variación pareada |
|---|---|---|
| Run-08 (enzyme-retrieval-v8) | 59,3912% | -0,2000 pp |
| Run-07 (comparador) | 59,5912% | referencia |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible. La puntuación oficial del candidato con el banco de referencia reajustado sobre todas las reacciones públicas de entrenamiento es desconocida según la propia model card.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El tamaño del repositorio es de 0,8 GB, pero no se desglosa cuánto corresponde a pesos ONNX, a banco de referencia u otros artefactos.
- GPU recomendadas: no disponible. Al ejecutarse en ONNX, es plausible el uso de CPU o de GPU consumer, pero la información proporcionada no confirma requisitos ni aceleradores soportados.
- ¿Cabe en GPU consumer? No confirmado; el tamaño total del artefacto (0,8 GB) sugiere que sí en términos de almacenamiento, pero no se especifica el consumo en memoria durante la inferencia.
- Opciones de despliegue: ONNX Runtime como vía natural dado el formato; el entry point documentado es `/app/predict.py`. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que además no aplican a este tipo de pipeline.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| enzyme-retrieval-v8 (Run-08) | Recuperación estructural + votos, ONNX | no disponible | no disponible | 59,3912% top-1 EC4 fraccional (auditoría interna) | other (mixed-component-licenses) | Hugging Face, 0 descargas |
| enzyme-retrieval-v7 (Run-07) | Recuperación estructural, versión previa | no disponible | no disponible | 59,5912% top-1 EC4 fraccional (auditoría interna) | no disponible | Referenciado como comparador en la model card |
| Otros clasificadores de reacciones enzimáticas | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |

La única comparación con datos en la información proporcionada es contra Run-07, la versión previa del mismo pipeline. No se dispone de alternativas externas comparables documentadas en la información disponible.

## Limitaciones y advertencias

- El propio autor reporta una regresión de -0,2000 puntos porcentuales frente a Run-07 en la auditoría interna, por lo que Run-08 no mejora a su predecesor en la métrica declarada.
- La puntuación del candidato con el banco de referencia reajustado sobre todas las reacciones públicas de entrenamiento es desconocida; no hay evidencia de que ese candidato sea mejor.
- Artefacto experimental con cero descargas y cero likes: no hay validación externa ni uso reportado por terceros.
- La licencia es mixta por componentes (`mixed-component-licenses`), con obligaciones de atribución recogidas en ATTRIBUTION_RUN07.md; es imprescindible revisar ese fichero antes de cualquier uso comercial.
- Idioma declarado únicamente inglés; no se documenta soporte multilingüe.
- No se documentan sesgos, tasas de alucinación ni comportamiento fuera de distribución para este pipeline; al ser un sistema de recuperación, los errores se manifiestan como clasificaciones EC4 incorrectas, no como texto generado.
- No hay información sobre el dominio de aplicabilidad química, la cobertura de familias EC ni el rendimiento en reacciones alejadas del banco de referencia.
- No se especifican requisitos de hardware, latencia ni throughput, lo que dificulta planificar un despliegue en producción.
- No debe tratarse como un modelo de lenguaje: no genera texto ni soporta tool calling, agentes o razonamiento multi-paso.

## Enlaces

- Hugging Face: https://huggingface.co/Saiteja-madineni/enzyme-retrieval-v8
- Fichero de atribución de componentes: https://huggingface.co/Saiteja-madineni/enzyme-retrieval-v8/blob/main/ATTRIBUTION_RUN07.md
