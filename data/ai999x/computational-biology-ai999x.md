# AI999X/computational-biology-ai999x

## Resumen

computational-biology-ai999x es un paquete de Python publicado por AI999X (autor: Ibnul Jaif Farabi) que se presenta como un motor determinista de resolución de problemas de biología computacional. No es un modelo de lenguaje generativo al uso: combina una capa de lectura de preguntas en inglés basada en reglas con un conjunto de 83 procedimientos simbólicos certificados (sympy, mpmath) que calculan la respuesta de forma exacta y la verifican antes de devolverla. El resultado se entrega con pasos intermedios, fórmulas en LaTeX, unidades y supuestos, o bien con un rechazo explícito cuando la consulta no se puede verificar.

El objetivo declarado es el de "cero respuestas incorrectas por diseño": el sistema define siete resultados posibles (SOLVED, NEEDS_INPUT, AMBIGUOUS, INVALID_INPUT, OUT_OF_SCOPE, UNRECOGNIZED_FORMAT, INTERNAL_ERROR) y evita deliberadamente adivinar. Cubre ADN y proteínas, alineamiento por pares (Needleman-Wunsch), masas moleculares, genética mendeliana y de poblaciones, filogenética, cinética enzimática y modelos ecológicos.

Es relevante ahora por su perfil de despliegue: funciona íntegramente en CPU, sin GPU, sin red y sin clave de API, y el autor afirma que las 616 respuestas documentadas se reproducen de forma idéntica en Windows y Linux con Python 3.10 a 3.14. Su encaje real es el de herramienta de cálculo verificable para cuadernos, aplicaciones de tutoría y correctores de ejercicios, no el de un modelo fundacional.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Motor neuro-simbólico determinista: lectura de preguntas basada en reglas más 83 capacidades simbólicas certificadas (no es un transformer) |
| Parámetros totales | 4.715.520 (dato declarado en el repositorio; el paquete se describe como Python puro con sympy y mpmath) |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible (no se documenta una ventana de contexto; la entrada son formas de pregunta documentadas o llamadas tipadas) |
| Tipos de cuantización | No disponible / no aplica (no se publican pesos cuantizados; el motor es determinista y no requiere cuantización) |
| Idiomas soportados | Inglés (`en`), únicamente |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors y ONNX (según los tags del repositorio); distribución principal como wheel de Python (`computational_biology_ai999x-1.0.0-py3-none-any.whl`) |

Otros datos de la model card: versión 1.0.0 del paquete, knowledge pack 1.0.1, 616 respuestas doradas documentadas, plataformas probadas Windows (Python 3.13) y Linux x86-64 (Python 3.10–3.14), runtime solo CPU y offline.

## Arquitectura y entrenamiento

La arquitectura no es la de un transformer ni la de un modelo de lenguaje. Se describe como un motor neuro-símbolico determinista en el que la "lectura" de la pregunta en inglés se resuelve con reglas y expresiones documentadas, y el cálculo propiamente dicho se delega en 83 procedimientos certificados de biología computacional implementados sobre sympy y mpmath. Cada resultado pasa por una comprobación (sustitución inversa, análisis dimensional o comparación con un cálculo independiente) antes de devolverse, y se acompaña de pasos, unidades y supuestos.

No se proporciona información sobre datos de entrenamiento, número de tokens, composición del corpus ni uso de RLHF o DPO; el sistema no se entrena con un corpus en el sentido habitual, sino que se construye a partir de un "knowledge pack" versionado (1.0.1) y de un conjunto de 616 respuestas doradas documentadas que actúan como referencia de evaluación. La innovación destacable es la política de rechazo explícito ante entradas ambiguas o fuera de alcance, junto con la interfaz doble: `ask()` para preguntas en lenguaje natural documentadas y `solve(capability_id, **inputs)` para invocación tipada garantizada. El repositorio incluye un catálogo de capacidades en `docs/` y material de evaluación en `evaluation/`.

## Capacidades

- Cálculo determinista y verificado sobre 83 procedimientos certificados de biología computacional.
- Análisis de secuencias de ADN y proteína: complemento inverso, traducción, detección de marcos abiertos de lectura (ORF), sitios de restricción, temperatura de fusión (melting temperature) y punto isoeléctrico.
- Alineamiento de secuencias por pares, incluido el alineamiento global con puntuación Needleman-Wunsch (ejemplo de la model card: `GATTACA` frente a `GCATGCU` con match 1, mismatch -1, gap -1 da puntuación 0).
- Genética mendeliana y de poblaciones: ratios fenotípicos de cruces (AaBb × AaBb da p=0,5625 para todos dominantes, 0,0625 para todos recesivos, 9 genotipos y 4 fenotipos) y test de Hardy-Weinberg con frecuencias alélicas y valores esperados.
- Filogenética, cinética enzimática, masas moleculares y modelos de poblaciones y ecología.
- Respuesta con traza completa: pasos, fórmulas en LaTeX, unidades, supuestos y capacidad utilizada.
- Interfaz tipada `solve()` con validación de entradas, además de `ask()` para formas de pregunta documentadas.
- Siete estados de salida explícitos que sustituyen a la generación libre cuando no hay garantía de corrección.
- Ejecución 100 % offline en CPU, sin GPU, sin red y sin clave de API.
- Tareas declaradas en los tags: question answering, token classification, text classification, sentence similarity y feature extraction.

No se documentan capacidades de tool calling, razonamiento multi-paso conversacional, visión, audio ni modo "thinking"; la lectura en lenguaje natural está limitada a las formas de pregunta documentadas.

## Casos de uso

- Corrección automática de ejercicios de biología computacional: el motor devuelve el resultado junto con los pasos y las fórmulas en LaTeX, de modo que un corrector puede comparar no solo la respuesta final sino también el procedimiento y detectar dónde se desvía el alumno.
- Tutoría interactiva en entornos sin conectividad: al ejecutarse íntegramente en CPU y sin red, puede empaquetarse en un aula, un portátil o un contenedor aislado y resolver problemas de genética, alineamiento o cinética enzimática sin depender de servicios externos.
- Cuadernos de laboratorio y pipelines reproducibles: la determinación estricta de las salidas y la ausencia de generación libre hacen que el resultado sea apto para registrarlo como cálculo reproducible con su capacidad y supuestos asociados.
- Validación cruzada de resultados bioinformáticos: útil como segunda opinión independiente para comprobar cálculos de Hardy-Weinberg, masas moleculares o puntuaciones de alineamiento obtenidos por otras herramientas.
- Generación de material docente y bancos de problemas: `solve()` permite generar ejercicios resueltos de forma masiva y determinista a partir de parámetros de entrada, con la solución y los pasos ya calculados.
- Filtrado y clasificación de consultas en un servicio de soporte científico: los estados OUT_OF_SCOPE, AMBIGUOUS y NEEDS_INPUT permiten enrutar consultas no resolubles hacia un humano o hacia otro sistema en lugar de producir una respuesta inventada.
- Integración en aplicaciones de escritorio o CLI educativas: el paquete se instala con `pip` y no requiere GPU ni servicios externos, lo que simplifica la distribución en Windows y Linux.

## Benchmarks y rendimiento

Datos declarados por el autor en el `model-index` de la model card. No se han publicado resultados independientes.

| Tarea | Conjunto de evaluación | Métrica | Valor | Nota |
|---|---|---|---|---|
| Question answering (biología computacional) | Golden answers: 616 preguntas documentadas, Windows + Linux, Python 3.10–3.14 | Accuracy | 1,0 | "Identical on every platform"; marcado como `verified: false` |

El propio autor indica que la métrica mide la reproducción exacta de las 616 respuestas doradas documentadas en las plataformas probadas, no el rendimiento sobre preguntas nuevas o formuladas de forma distinta. No hay datos de MMLU, HumanEval, GSM8K ni de comparación con otros sistemas en la información disponible.

## Requisitos de hardware

- VRAM estimada: no aplica; el runtime declarado es solo CPU, sin GPU.
- GPU recomendadas: ninguna. No requiere aceleración por hardware.
- Cabe en cualquier equipo capaz de ejecutar Python 3.10–3.14; el tamaño del repositorio es de 0,0 GB según los metadatos y la distribución principal es un wheel `py3-none-any`.
- Dependencias declaradas: sympy y mpmath (Python puro).
- Opciones de despliegue: `pip install computational-biology-ai999x` desde PyPI, instalación directa del wheel alojado en el repositorio de Hugging Face, o uso como biblioteca dentro de notebooks, CLIs y aplicaciones de escritorio.
- Servidores de inferencia tipo vLLM, TGI, llama.cpp u Ollama: no aplicables, al no ser un modelo de pesos transformer ni publicar GGUF.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Sistema | Tipo | Parámetros | Contexto | Licencia | Enfoque de corrección |
|---|---|---|---|---|---|
| computational-biology-ai999x | Motor determinista simbólico + reglas | 4.715.520 (declarados en repo) | No disponible | Apache-2.0 | Verificación por capacidad certificada y rechazo explícito |
| Biopython | Biblioteca de bioinformática en Python | No aplica | No aplica | Licencia Biopython (de estilo BSD) | El usuario compone las llamadas y valida los resultados |
| LLM de propósito general (p. ej. familia Llama o Mistral) | Transformer generativo | No disponible en esta ficha | No disponible en esta ficha | Variables según modelo | Generación libre; requiere verificación externa |

La comparación con LLM de propósito general es solo cualitativa: no se dispone de datos de benchmarks comunes ni de cifras de parámetros y contexto verificadas en la información proporcionada para establecer una comparación numérica. Frente a Biopython, la diferencia es de interfaz y de política de verificación, no de cobertura de algoritmos, que no se ha comparado formalmente.

## Limitaciones y advertencias

- No es un modelo generativo: no redacta explicaciones libres ni mantiene conversaciones multi-turno; solo resuelve las formas de pregunta documentadas o llamadas tipadas.
- Idioma limitado al inglés (`en`); no se documenta soporte de castellano ni de otras lenguas.
- La cobertura se restringe a las 83 capacidades certificadas; cualquier consulta fuera de ese catálogo devuelve OUT_OF_SCOPE o UNRECOGNIZED_FORMAT.
- El resultado de accuracy 1,0 procede del propio autor, está marcado como `verified: false` y se mide sobre las 616 respuestas doradas documentadas, por lo que no debe interpretarse como precisión sobre preguntas nuevas o parafraseadas.
- El metadato del repositorio indica `inference: false`; no se garantiza que la infraestructura de inferencia de Hugging Face pueda ejecutar el paquete, que está pensado para instalarse vía `pip`.
- Existe una discrepancia entre la descripción (Python puro con sympy y mpmath) y los formatos declarados (safetensors, ONNX) y el recuento de 4.715.520 parámetros; conviene verificar el contenido real del repositorio antes de integrarlo.
- El repositorio figura con 0 descargas y 0 likes y fue creado en octubre de 2026, sin tracción ni revisión independiente conocida.
- Licencia Apache-2.0: permite uso comercial y modificación con atribución y conservación del aviso de licencia; no se documentan restricciones adicionales, pero tampoco garantías explícitas de idoneidad para producción.
- No se documentan sesgos, tasas de alucinación ni auditorías externas; la política de rechazo reduce el riesgo de respuesta incorrecta, pero no sustituye la validación por parte de un experto en un contexto clínico o regulatorio.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/AI999X/computational-biology-ai999x
- Paquete en PyPI: https://pypi.org/project/computational-biology-ai999x/
- Guía de capacidades (docs): https://huggingface.co/AI999X/computational-biology-ai999x/tree/main/docs
- Material de evaluación: https://huggingface.co/AI999X/computational-biology-ai999x/tree/main/evaluation
- Licencia: https://huggingface.co/AI999X/computational-biology-ai999x/blob/main/LICENSE
- Wheel de instalación directa: https://huggingface.co/AI999X/computational-biology-ai999x/resolve/main/dist/computational_biology_ai999x-1.0.0-py3-none-any.whl
- Organización AI999X en Hugging Face: https://huggingface.co/AI999X
- Sitio web del autor: https://ai999x.com
- Apoyo al desarrollo: https://buymeacoffee.com/ibnuljaiffarabi
