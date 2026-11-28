# GOVINDFROM/ClinBlueprint-4B-PMC-v0.1

## Resumen

ClinBlueprint-4B-PMC-v0.1 es un adaptador LoRA desarrollado por GOVINDFROM sobre el modelo base Qwen/Qwen3-4B (revision `1cfa9a720891`). Su objetivo no es emitir un diagnóstico directo, sino generar un **grafo de razonamiento clínico editable**: hallazgos citados literalmente del caso (incluidos negativos pertinentes), racionalidades que enlazan hallazgos con diagnósticos (a favor o en contra, con intensidad), un diagnóstico diferencial y una lista de diagnósticos que no deben pasarse por alto con su estado. En el pipeline ClinBlueprint el diagnóstico final se computa a partir de ese grafo mediante un mecanismo de lectura transparente, de modo que un clínico puede corregir el grafo y observar cómo cambia la conclusión.

El adaptador se entrena exclusivamente con casos clínicos reales publicados en revistas indexadas en PubMed Central: 3.144 casos en total (3.082 de entrenamiento y el resto en un split de desarrollo), repartidos entre MedCaseReasoning (984 casos) y un corpus propio PMC-CR (2.160 casos con licencia CC BY/CC0 publicados entre enero de 2015 y junio de 2025). No se emplearon casos sintéticos ni datos con credenciales como MIMIC o PhysioNet. El modelo se distribuye con licencia Apache 2.0 y está etiquetado explícitamente como modelo de investigación, no apto para uso clínico.

La relevancia actual del proyecto reside en su enfoque hacia la interpretabilidad y la no adulación (non-sycophancy): al separar el razonamiento (grafo) del veredicto (lectura determinista), se facilita la auditoría por parte de expertos y se evita que el modelo se limite a reproducir una etiqueta diagnóstica presente en la entrada. El repositorio ocupa 0,3 GB y la librería declarada es PEFT.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer decoder-only Qwen/Qwen3-4B |
| Parametros totales | no disponible (adaptador LoRA; el modelo base Qwen3-4B tiene 4.000 millones) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (heredada del modelo base Qwen3-4B) |
| Tipos de cuantizacion | no disponible (el adaptador se publica en safetensors; la cuantizacion depende del modelo base) |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA que se aplica sobre Qwen/Qwen3-4B, un transformer decoder-only de 4.000 millones de parámetros. El adaptador no modifica la arquitectura del modelo base; añade matrices de bajo rango entrenadas para la tarea específica de generar grafos de razonamiento clínico estructurados. El repositorio contiene únicamente los pesos del adaptador (0,3 GB), no los del modelo base.

El entrenamiento se realizó sobre 3.082 casos clínicos reales (más un split de desarrollo) procedentes de dos fuentes: 984 casos de MedCaseReasoning (PMC Open Access, filtrados para conservar solo artículos con licencia CC BY o CC0, descartando 1.229 con licencias NC/ND/SA o desconocidas) y 2.160 casos del corpus propio PMC-CR, recolectados vía Europe PMC, con un paciente por informe y publicados entre enero de 2015 y junio de 2025. La distribución demográfica es 47% mujeres, 53% hombres, con un 14% de menores de 18 años, 58% de adultos de 18 a 64 años y 18% de mayores de 65 años; las especialidades más representadas son neurología (236), gastroenterología (204), enfermedades infecciosas (194) y cardiología (168), procedentes de 630 revistas.

Los objetivos de entrenamiento (los grafos) fueron generados por un modelo maestro local (Qwen3.8-27B, Apache 2.0) que recibió la presentación del caso, el razonamiento diagnóstico de los autores y el diagnóstico final publicado. Se aplicaron controles de calidad estrictos: los hallazgos no encontrados en el texto del caso se eliminaron; se conservó un grafo solo si al menos el 80% de los hallazgos del maestro aparecían en el texto, quedaban al menos dos, el diagnóstico publicado estaba respaldado por al menos una ruta de evidencia válida y sobrevivía al menos el 70% de las racionalidades tras las comprobaciones de consistencia. Los casos cuya entrada ya enunciaba el diagnóstico de trabajo se eliminaron para evitar que el modelo aprendiera a copiar etiquetas. Para evitar el sesgo retrospectivo del maestro, un elemento de "no pasar por alto" se marcó como "excluido" solo si un hallazgo con grado confirmatorio argumentaba en contra con más fuerza de la que cualquier hallazgo lo apoyaba; en caso contrario se marcó como "abierto" (1.332 de 3.279 exclusiones). Los grafos son derivados automáticamente ("silver"), no escritos por médicos, y está pendiente una auditoría clínica de 100 grafos.

## Capacidades

- Generación de grafos de razonamiento clínico estructurados a partir de un caso: hallazgos citados del texto, negativos pertinentes, racionalidades con dirección (a favor/en contra) e intensidad, diferencial y diagnósticos críticos con estado.
- Razonamiento diagnóstico multi-paso orientado a la hipótesis, no a la conclusión definitiva.
- Capacidad de ser corregido por un clínico: el grafo es editable y el diagnóstico se recalcula mediante una lectura transparente.
- Generación de texto conversacional (pipeline text-generation) en inglés.
- Entrenamiento explícito para no copiar el diagnóstico de trabajo si ya aparece en la entrada.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes: no disponible en la información proporcionada.
- Capacidades multilingües: limitadas al inglés.
- Capacidades especiales (visión, audio, thinking mode): no disponible en la información proporcionada.

## Casos de uso

- Investigación sobre razonamiento clínico fiel y editable: el adaptador permite estudiar si el grafo generado refleja realmente el texto del caso, comparando hallazgos citados con el original y midiendo la tasa de hallazgos no soportados.
- Construcción de interfaces clínico-en-el-bucle (clinician-in-the-loop): un especialista puede inspeccionar el grafo, corregir un hallazgo o una racionalidad y observar cómo cambia el diagnóstico calculado por el mecanismo de lectura, lo que resulta adecuado por el diseño desacoplado entre razonamiento y veredicto.
- Evaluación de no adulación en modelos médicos: al eliminar de la entrada los casos que ya enuncian el diagnóstico, el modelo se entrena para no limitarse a confirmar una etiqueta, lo que permite estudiar comportamientos de sycophancy en LLMs clínicos.
- Generación de diferenciales para revisión experta: dado un caso con hallazgos y negativos pertinentes, el modelo produce una lista priorizada de hipótesis y una lista de diagnósticos que no deben pasarse por alto, útil como material de partida en sesiones docentes o de investigación.
- Auditoría de calidad de razonamiento: los grafos "silver" generados pueden compararse con el razonamiento de los autores del caso original, sirviendo como conjunto de datos para estudiar discrepancias entre razonamiento automático y humano.
- Investigación sobre sesgos retrospectivos: el tratamiento explícito de las exclusiones (1.332 de 3.279 marcadas como "abiertas") permite analizar cómo el conocimiento del diagnóstico final influye en la exclusión de alternativas peligrosas.
- Desarrollo de herramientas de edición de grafos: el repositorio de código asociado (Editable-Clinical-Reasoning) permite integrar el adaptador en pipelines de edición y lectura determinista para experimentos reproducibles.

## Benchmarks y rendimiento

La model card describe una evaluación held-out con precisión top-k (el diagnóstico final publicado entre los k diagnósticos mejor rankeados tras la lectura del grafo), con intervalos de confianza al 95% por bootstrap a nivel de caso y una variante "leak-free" que excluye casos cuya entrada ya nombra o establece el diagnóstico. Sin embargo, en la información proporcionada no se incluyen las cifras numéricas de estos resultados.

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma específica para el adaptador; depende del modelo base Qwen3-4B. Como referencia orientativa, un modelo de 4.000 millones de parámetros en FP16 requiere aproximadamente 8 GB de VRAM solo para los pesos, más overhead de activaciones y contexto.
- GPU recomendadas: no disponible en la información proporcionada.
- Compatibilidad con GPU de consumo: no disponible en la información proporcionada; el tamaño del modelo base (4B) sugiere que podría caber en GPU de consumo con cuantización, pero este dato no se confirma en la documentación.
- Opciones de despliegue: no disponible en la información proporcionada. El adaptador es compatible con PEFT, por lo que podría cargarse junto al modelo base en frameworks que soporten LoRA, pero no se detallan opciones como vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la documentación proporcionada. El adaptador es específico para la tarea de generación de grafos de razonamiento clínico editable sobre Qwen3-4B, y no se han documentado alternativas equivalentes en la información disponible.

| Modelo | Parametros | Contexto | Licencia | Enfoque |
|---|---|---|---|---|
| ClinBlueprint-4B-PMC-v0.1 | Adaptador sobre Qwen3-4B (4B) | no disponible | apache-2.0 | Grafo de razonamiento clínico editable |
| Alternativas | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Modelo de investigación: no apto para diagnóstico, tratamiento, triaje ni uso orientado al paciente; no es un dispositivo médico. Las salidas son hipótesis para revisión experta, no veredictos.
- Los grafos de entrenamiento son "silver" (generados por un modelo maestro, no por médicos); la auditoría clínica de 100 grafos está pendiente.
- Riesgo de sesgo retrospectivo: el maestro conocía el diagnóstico final, lo que pudo influir en la exclusión de alternativas peligrosas; se aplicaron mitigaciones (1.332 de 3.279 exclusiones marcadas como "abiertas"), pero el sesgo no se elimina por completo.
- Idiomas: solo inglés.
- Sesgos demográficos: la documentación no reporta país ni etnia porque los informes de caso no los declaran de forma fiable; la distribución por sexo y edad se lee del texto del caso, no de metadatos verificados.
- Riesgo de alucinación: aunque se filtraron hallazgos no presentes en el texto, el modelo puede generar racionalidades o citas que no se correspondan exactamente con el caso; se recomienda verificación manual.
- Restricciones de licencia: el adaptador es Apache 2.0, pero el modelo base Qwen3-4B tiene su propia licencia que debe respetarse; además, los casos de entrenamiento no se redistribuyen y los textos originales conservan sus licencias CC BY/CC0.
- Dependencia del modelo base: el rendimiento y el contexto están limitados por Qwen3-4B; no se documentan requisitos de contexto específicos.
- Sin datos de benchmarks numéricos en la información disponible, lo que impide una evaluación cuantitativa independiente.

## Enlaces

- Hugging Face: https://huggingface.co/GOVINDFROM/ClinBlueprint-4B-PMC-v0.1
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B
- Repositorio de código, lectura y herramientas de edición: https://github.com/GIND123/Editable-Clinical-Reasoning
- Dataset MedCaseReasoning: https://huggingface.co/datasets/zou-lab/MedCaseReasoning
- Paper de referencia (arXiv:2505.11733): https://arxiv.org/abs/2505.11733
- Europe PMC: https://europepmc.org/
- Licencia CC BY 4.0: https://creativecommons.org/licenses/by/4.0/
