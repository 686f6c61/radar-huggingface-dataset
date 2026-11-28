# PCL-RSI-lab/Seshat-agent-pro

## Resumen

Seshat-agent-pro es un agente de ingeniería de software con capacidad de auto-evolución, publicado por PCL-RSI-lab bajo licencia Apache 2.0. No se trata de un modelo de lenguaje con pesos propios, sino de una infraestructura de razonamiento denominada MetaEvo que se acopla a un modelo base (Kimi K3 o GLM-5.3 en las evaluaciones publicadas) y mejora su rendimiento mediante un bucle de mejora recursiva (Recursive Self-Improvement, RSI). El sistema extrae "meta-conocimiento" de trayectorias de razonamiento exitosas y lo reinyecta en el modelo en tiempo de inferencia, condicionado a la tarea concreta.

La propuesta central es tratar la mejora como internalización de experiencia en lugar de apilamiento de habilidades externas: cada resolución correcta de un problema se comprime en primitivas de razonamiento reutilizables (descomposición de problemas, propagación de restricciones, razonamiento inverso, eliminación de contradicciones, autoverificación, patrones de tool calling) que se almacenan en una base de meta-conocimiento. Un router selecciona y compone las unidades relevantes para cada instancia, construyendo una "ruta cognitiva" que se inyecta por capas en el forward del modelo base, con un meta-crítico que monitoriza y re-planifica.

Es relevante ahora porque declara mejoras absolutas muy grandes sobre benchmarks de agentes de código: en SWE-Bench Pro pasa del 57,7% al 94,94% de resolución (694/731 instancias) partiendo de Kimi K3, y en DeepSWE-v1.1 del 59,3% al 90,3% (102/113) partiendo de GLM-5.3. El repositorio tiene 0 descargas y 12 likes en el momento de la consulta, y la información pública disponible es la model card del autor, sin paper ni detalles de pesos.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | No disponible (agente/infraestructura de razonamiento MetaEvo sobre modelo base externo; no se especifica la arquitectura del modelo subyacente) |
| Parámetros totales | No disponible (depende del modelo base; evaluado con Kimi K3 y GLM-5.3) |
| Parámetros activos | No disponible |
| Longitud de contexto | No disponible |
| Tipos de cuantización | No disponible (la model card menciona una evaluación sobre DeepSeek V4-Pro 4-Bit, pero no se documentan cuantizaciones propias) |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | No disponible (librería declarada: transformers) |

## Arquitectura y entrenamiento

Seshat se articula en torno a MetaEvo, una infraestructura de razonamiento auto-evolutiva que no entrena un transformer desde cero, sino que opera sobre un modelo base. El bucle consta de seis etapas: recepción del problema, router de meta-conocimiento que selecciona y compone unidades relevantes, construcción de una ruta cognitiva estructurada, inyección de esa ruta en la cadena forward por capas (layer-wise knowledge injection), un meta-crítico que decide continuar, re-enrutar o re-planificar, y una fase de evolución en la que las trayectorias exitosas se depositan de nuevo en la base de meta-conocimiento. La base se actualiza offline minando nuevos vectores de trayectorias correctas, de modo que la experiencia acumulada actúa como prior creciente para tareas futuras.

No se detallan en la información disponible el número de tokens de entrenamiento, la composición del dataset, ni si hubo RLHF o DPO. Tampoco se especifica si la inyección por capas requiere acceso a los pesos del modelo base o se implementa como un mecanismo externo de prompting estructurado; la model card describe "inyección de conocimiento por capas en la cadena forward neuronal", lo que sugiere intervención sobre las activaciones, pero no se aportan detalles técnicos verificables. El sistema se presenta como transferible a benchmarks de código, lógica, ciencia y emparejamiento de patentes, no solo a ingeniería de software.

## Capacidades

- Resolución de incidencias de software sobre repositorios reales, orientada a benchmarks tipo SWE-Bench Pro y DeepSWE-v1.1.
- Generación de parches y razonamiento multi-paso sobre código, con verificación intermedia mediante meta-crítico.
- Tool calling y patrones de invocación de herramientas almacenados como meta-conocimiento reutilizable.
- Comportamiento de agente autónomo con re-planificación adaptativa cuando la ruta cognitiva falla.
- Auto-evolución: acumulación de experiencia entre ejecuciones mediante la base de meta-conocimiento.
- Razonamiento lógico y estratégico (evaluado en StrategyQA y LogicBench).
- Razonamiento científico y de conocimiento (ScienceQA, SciCode).
- Capacidades multilingües: no disponibles en la información proporcionada.

## Casos de uso

- Resolución automática de issues en repositorios de producción: el agente recibe el bug, recupera meta-conocimiento de incidencias similares resueltas previamente y genera un parche verificable, aprovechando que el bucle de evolución acumula experiencia entre tareas del mismo dominio.
- Mantenimiento de bases de código legacy: la reutilización de primitivas como razonamiento inverso y propagación de restricciones resulta adecuada para tareas donde hay que inferir comportamiento esperado a partir de tests existentes.
- Integración en pipelines de CI/CD: el agente puede ejecutarse sobre fallos de test y proponer correcciones antes de la revisión humana, con el meta-crítico filtrando rutas de razonamiento inconsistentes.
- Auditoría de seguridad de código (CyberGym): la model card reporta 80,3 sobre DeepSeek V4-Pro 4-Bit partiendo de 41,2, lo que lo hace candidato para análisis de vulnerabilidades asistido.
- Asistencia a investigación científica y reproducibilidad: los resultados declarados en ScienceQA (98,0) y SciCode (21,2) sugieren uso en tareas de razonamiento científico con verificación de pasos.
- Emparejamiento y análisis de patentes (PatentMatch, 76,6): adecuado para búsqueda de similitud estructural entre documentos técnicos.
- Evaluación comparativa de modelos base: al ser una capa de mejora sobre un modelo subyacente, permite medir cuánto rendimiento adicional aporta el bucle RSI a distintos modelos (Kimi K3, GLM-5.3, DeepSeek V4-Pro).

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card:

| Benchmark | Modelo base | Baseline zero-shot | Con Seshat | Ganancia absoluta |
|---|---|---:|---:|---:|
| SWE-Bench Pro | Kimi K3 | 57,7% | 94,94% (694/731) | +37,24 pp |
| DeepSWE-v1.1 | GLM-5.3 | 59,3% (67/113) | 90,3% (102/113) | +31,0 pp |
| CyberGym | DeepSeek V4-Pro 4-Bit | 41,2 | 80,3 | +39,1 |

Puntuaciones adicionales declaradas (sin baseline asociado en la información disponible):

| Benchmark | Seshat |
|---|---:|
| SWE-Bench Pro (figura) | 95,1 |
| HumanEval | 100,0 |
| StrategyQA | 82,3 |
| LogicBench | 86,4 |
| LiveCodeBench | 49,6 |
| ScienceQA | 98,0 |
| SciCode | 21,2 |
| PatentMatch | 76,6 |

Comparativas seleccionadas citadas por el autor:

| Benchmark | Seshat | Baseline más fuerte listado | Diferencia |
|---|---:|---:|---:|
| SWE-Bench Pro | 95,1 | Claude Opus 5.5 (89,9) | +5,2 |
| CyberGym | 80,3 | Claude Mythos (83,1) / GPT-5.5 (81,8) | −2,8 / −1,5 |
| HumanEval | 100,0 | Claude Sonnet 5 (98,8) | +1,2 |

No se han publicado resultados de benchmarks independientes en la información disponible; todos los datos proceden del autor del modelo.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. Al no publicarse pesos propios, el requisito depende enteramente del modelo base utilizado (Kimi K3, GLM-5.3 o DeepSeek V4-Pro 4-Bit en las evaluaciones).
- GPU recomendadas: no disponibles. La evaluación sobre DeepSeek V4-Pro 4-Bit sugiere que el sistema puede operar con modelos cuantizados, pero no se especifican GPUs concretas (A100, H100, RTX 4090 u otras).
- Viabilidad en GPU de consumo: no disponible.
- Opciones de despliegue: la librería declarada es transformers y la etiqueta `endpoints_compatible` aparece en los tags del repositorio, lo que indica compatibilidad con endpoints de Hugging Face. No se documentan integraciones con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles. El bucle de router, meta-crítico y re-planificación implica coste adicional por tarea respecto a una inferencia directa, pero no se aportan mediciones.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto | Licencia | Rendimiento declarado |
|---|---|---|---|---|---|
| Seshat-agent-pro | Agente RSI sobre modelo base | No disponible | No disponible | Apache 2.0 | SWE-Bench Pro 94,94%; DeepSWE-v1.1 90,3% |
| Claude Opus 5.5 | Modelo propietario | No disponible | No disponible | Propietaria | SWE-Bench Pro 89,9 (según el autor) |
| GPT-5.5 | Modelo propietario | No disponible | No disponible | Propietaria | CyberGym 81,8 (según el autor) |
| Claude Sonnet 5 | Modelo propietario | No disponible | No disponible | Propietaria | HumanEval 98,8 (según el autor) |

La comparación no es estrictamente homogénea: Seshat es una capa de mejora que se apoya en un modelo base de terceros, mientras que los baselines son modelos completos. No se dispone de datos de contexto, parámetros ni disponibilidad de pesos para ninguno de los comparadores en la información proporcionada.

## Limitaciones y advertencias

- Los resultados proceden exclusivamente del autor; no hay replicación independiente ni paper revisado por pares en la información disponible.
- El repositorio registra 0 descargas y 12 likes, lo que indica ausencia de validación por parte de la comunidad.
- No se publican pesos, arquitectura del modelo subyacente ni detalles de implementación de la inyección por capas; la reproducibilidad es limitada.
- El rendimiento depende críticamente del modelo base: las cifras de SWE-Bench Pro corresponden a Kimi K3 y las de DeepSWE-v1.1 a GLM-5.3, por lo que no son directamente atribuibles a un artefacto autónomo.
- En CyberGym el sistema queda por debajo de Claude Mythos (83,1 frente a 80,3) y de GPT-5.5 (81,8 frente a 80,3), según los propios datos del autor.
- Riesgo de sobreajuste al benchmark: el bucle RSI acumula experiencia de las mismas tareas evaluadas, lo que puede inflar las métricas respecto a un uso en producción con distribución distinta.
- Riesgo de alucinación en la generación de parches y en la selección de meta-conocimiento irrelevante; el meta-crítico mitiga pero no elimina este riesgo.
- Idiomas soportados no declarados; no hay garantía de comportamiento multilingüe.
- Licencia Apache 2.0 permite uso comercial, pero al apoyarse en modelos base de terceros, las condiciones de estos (Kimi, GLM, DeepSeek) pueden imponer restricciones adicionales.
- No se documentan sesgos conocidos, pero al ser un sistema de razonamiento sobre código, puede heredar los sesgos del modelo base y de los repositorios de entrenamiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/PCL-RSI-lab/Seshat-agent-pro
- Evidencia de evaluación en SWE-Bench Pro: https://huggingface.co/datasets/PCL-RSI-lab/SWE-Bench-Pro-Evaluation-Evidence
- Evidencia de evaluación en DeepSWE-v1.1: https://huggingface.co/datasets/PCL-RSI-lab/DeepSWE-v1.1-Evaluation-Evidence
- Curva de evolución (imagen): https://cdn-uploads.huggingface.co/production/uploads/642d1708c5f19fe0da06b4b7/ERQmh_hqVkZLK0gAzqdD0.png
- Gráfico multi-benchmark (imagen): https://cdn-uploads.huggingface.co/production/uploads/642d1708c5f19fe0da06b4b7/JJ-WV3STxuOwyaelnTOti.png
