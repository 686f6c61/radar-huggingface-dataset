# ScienceOne-AI/HiSciBench

## Resumen

HiSciBench no es un modelo de lenguaje, sino un *benchmark* jerárquico y multidisciplinar disenado para evaluar modelos fundacionales (LLM y MLLM) en tareas cientificas reales. Lo desarrolla el Institute of Automation de la Chinese Academy of Sciences (CASIA) junto con la University of the Chinese Academy of Sciences, y se publica bajo licencia Apache 2.0 en Hugging Face con el identificador `ScienceOne-AI/HiSciBench`.

El benchmark cubre cinco niveles cognitivos que reproducen el flujo de trabajo cientifico completo: alfabetizacion cientifica (L1), parseo de literatura cientifica incluyendo OCR y traduccion (L2), question answering sobre literatura mono y cross-lingue (L3), generacion de revisiones bibliograficas (L4) y descubrimiento cientifico basado en datos (L5). Contiene 8.735 instancias curadas manualmente que abarcan seis disciplinas (matematicas, fisica, quimica, biologia, geografia y astronomia) y admite entradas multimodales (texto, ecuaciones, figuras y tablas).

Su relevancia actual radica en que la mayoria de benchmarks cientificos existentes evaluan habilidades aisladas y no capturan la naturaleza jerarquica y dependiente de contexto de la investigacion real. HiSciBench propone un marco con dependencias entre niveles, lo que permite diagnosticar en que fase del razonamiento cientifico falla un modelo concreto. El repositorio ocupa 26,1 GB y esta pensado para investigadores que necesiten comparar modelos en tareas cientificas de complejidad creciente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (es un benchmark, no un modelo) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | evaluacion cross-lingue (idiomas concretos no disponibles) |
| Licencia | Apache 2.0 |
| Formato de pesos | no disponible (repositorio de datos, 26,1 GB) |

## Arquitectura y entrenamiento

HiSciBench es un conjunto de evaluacion, no un modelo entrenado, por lo que no tiene arquitectura de red ni proceso de entrenamiento en el sentido habitual. Su "arquitectura" es la jerarquia de cinco niveles cognitivos (L1 a L5) con dependencias explicitas entre ellos, disenada para reflejar el flujo real de la investigacion cientifica: desde el conocimiento factual basico hasta la generacion de nuevo conocimiento.

La composicion del dataset incluye 8.735 instancias que cubren matematicas, fisica, quimica, biologia, geografia y astronomia, con soporte multimodal (texto, formulas, figuras y tablas) y evaluacion cross-lingue. El nivel L2 se subdivide en L2.1 (parseo OCR de documentos cientificos con formulas y estructuras quimicas) y L2.2 (traduccion cientifica cross-lingue); el nivel L3 se divide en L3.1 (QA monolingue) y L3.2 (QA cross-lingue). No se especifican en la informacion disponible el numero de tokens de entrenamiento (no aplica) ni detalles sobre el proceso de curacion mas alla de que las instancias fueron "carefully curated".

## Capacidades

- Evaluacion jerarquica de modelos en cinco niveles con dependencias entre ellos, permitiendo diagnostico granular de fallos.
- Evaluacion multimodal: procesa texto, ecuaciones, figuras y tablas presentes en documentos cientificos.
- Evaluacion de OCR cientifico especializado en formulas matematicas, estructuras quimicas y diagramas tecnicos (L2.1).
- Evaluacion de traduccion cientifica cross-lingue preservando terminologia tecnica y alineamiento estructural (L2.2).
- Evaluacion de comprension lectora y razonamiento sobre literatura cientifica, tanto monolingue como cross-lingue (L3.1 y L3.2).
- Evaluacion de sintesis bibliografica mediante generacion de revisiones de literatura (L4).
- Evaluacion de descubrimiento cientifico guiado por datos (L5).
- Cobertura de seis disciplinas: matematicas, fisica, quimica, biologia, geografia y astronomia.
- Leaderboard publico con resultados por nivel (L1 a L5) para modelos STEM.

## Casos de uso

- Seleccion de modelos para pipelines cientificos: un equipo de investigacion puede usar HiSciBench para decidir que modelo fundacional emplear en cada fase de su flujo (por ejemplo, un modelo distinto para OCR de papers y para generacion de revisiones), comparando resultados por nivel.
- Evaluacion de sistemas de extraccion documental: el nivel L2.1 permite medir la calidad de un pipeline OCR sobre PDFs cientificos con formulas y tablas, un escenario habitual en digitalizacion de archivos academicos.
- Validacion de sistemas de traduccion cientifica: el nivel L2.2 sirve para comprobar si un modelo preserva terminologia tecnica al traducir articulos, util para editoriales o repositorios multilingues.
- Auditoria de asistentes de lectura de papers: el nivel L3 permite evaluar si un asistente de lectura cientifica responde correctamente a preguntas sobre un articulo, incluyendo casos cross-lingue donde la pregunta y el documento estan en idiomas distintos.
- Evaluacion de generadores de revisiones bibliograficas: el nivel L4 proporciona una referencia para medir la calidad de sistemas que sintetizan literatura, util para herramientas de apoyo a la escritura cientifica.
- Investigacion en IA para ciencia: el nivel L5 permite estudiar hasta que punto un modelo puede realizar descubrimiento cientifico guiado por datos, un caso de uso de interes para laboratorios que investigan automatizacion del metodo cientifico.
- Benchmarking interno antes de desplegar un modelo en produccion cientifica: las dependencias entre niveles permiten identificar si un fallo en L4 o L5 proviene de una carencia en L1 o L2, guiando decisiones de fine-tuning o cambio de modelo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card incluye un leaderboard STEM con secciones por nivel (L1 a L5), pero los valores numericos concretos no se han proporcionado en la informacion disponible.

## Requisitos de hardware

- El repositorio ocupa 26,1 GB, por lo que se recomienda disponer de al menos 30 GB de espacio libre en disco para su descarga y descompresion.
- Al tratarse de un benchmark y no de un modelo, no requiere VRAM para inferencia del propio artefacto; los requisitos de GPU dependen del modelo que se evalue con el.
- Para evaluar modelos multimodales grandes sobre las 8.735 instancias se recomienda GPU de datacenter (A100, H100) o, en su defecto, RTX 4090 para modelos de menor tamano cuantizados.
- Opciones de despliegue del benchmark: ejecucion local sobre el repositorio descargado; no se especifican integraciones con vLLM, llama.cpp, Ollama o TGI en la informacion disponible.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Benchmark | Entidades | Niveles | Multimodal | Cross-lingue | Licencia |
|---|---|---|---|---|---|
| HiSciBench | 8.735 | 5 (L1-L5) | Si | Si | Apache 2.0 |
| Alternativas de benchmark cientifico | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone en la informacion proporcionada de datos concretos sobre benchmarks cientificos comparables (por ejemplo, ScienceQA, SciBench u otros) que permitan una comparacion cuantitativa fiable. Se indica "no disponible" para evitar inventar cifras.

## Limitaciones y advertencias

- Al ser un benchmark, no genera texto ni responde a prompts: no debe confundirse con un modelo desplegable en produccion.
- La informacion disponible no detalla la composicion exacta del dataset por disciplina ni el proceso de anotacion, lo que limita la reproducibilidad completa.
- Los resultados del leaderboard no se han incluido en la informacion disponible, por lo que no es posible verificar el rendimiento relativo de los modelos evaluados.
- La cobertura linguistica concreta (que idiomas se evaluan en L2.2 y L3.2) no esta especificada; solo se indica que hay evaluacion cross-lingue.
- Riesgo de sesgo de seleccion en las 8.735 instancias curadas: al no documentarse el proceso de muestreo, no puede descartarse un sesgo hacia ciertas subdisciplinas o fuentes.
- La licencia Apache 2.0 permite uso comercial del benchmark, pero los datos subyacentes podrian tener restricciones adicionales no detalladas en la model card.
- El tamano del repositorio (26,1 GB) puede dificultar su uso en entornos con almacenamiento limitado.
- No se documentan metricas de evaluacion detalladas por nivel en la informacion disponible, lo que complica la comparacion entre ejecuciones.

## Enlaces

- Hugging Face: https://huggingface.co/ScienceOne-AI/HiSciBench
- Paper (arXiv): https://arxiv.org/abs/2512.22899
- README en ingles: https://huggingface.co/ScienceOne-AI/HiSciBench/blob/main/README.md
- README en chino: https://huggingface.co/ScienceOne-AI/HiSciBench/blob/main/README_zh.md
