# LayerFault/serialization-pickle-tail-decoy

## Resumen

`LayerFault/serialization-pickle-tail-decoy` es un artefacto sintético de prueba de seguridad perteneciente al corpus Layerfault, identificado como `LF-CH-SER-0010`. No se trata de un modelo de aprendizaje automático utilizable, sino de una muestra diseñada deliberadamente para ejercitar reglas de detección de escáneres de seguridad que analizan modelos ML. El repositorio contiene características adversariales como opcodes de pickle sospechosos, técnicas de contrabando de formatos ejecutables y cadenas de inyección de prompts, todo ello con el objetivo de validar la robustez de herramientas de análisis estático.

La relevancia de este artefacto radica en el contexto actual de seguridad en el ecosistema de Hugging Face: según el estudio PickleBall (CCS 2025), el 44,9 % de los modelos populares en la plataforma siguen utilizando el formato pickle inseguro, y los escáneres existentes fallan en identificar modelos maliciosos. Este repositorio sirve como caso de control positivo para probar si un detector es capaz de bloquear una carga serializada con características maliciosas. El repositorio está protegido por un gate de aceptación que exige confirmar que se entiende que es una prueba de seguridad y no pesos de un modelo de producción.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no es un modelo ML) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | pickle (artefacto de prueba, sin pesos reales) |

## Arquitectura y entrenamiento

No existe una arquitectura de red neuronal ni proceso de entrenamiento asociado a este repositorio. Se trata de un artefacto sintético del corpus Layerfault, diseñado para simular características adversariales en la serialización Python. El contenido incluye opcodes de pickle sospechosos, técnicas de contrabando de formatos ejecutables y cadenas de inyección de prompts, todo ello con el objetivo de ejercitar reglas de escáneres de seguridad estáticos. Según la model card, el corpus utiliza secretos falsos, destinos de red de bucle local o dominios `.invalid`, marcadores de salida inofensivos y comportamiento de modelo sintético únicamente, destinado a pruebas de escaneo estático y entornos aislados de testing.

## Capacidades

- No ofrece capacidades de generación de texto, razonamiento, código, matemáticas, visión ni ninguna otra funcionalidad de modelo de lenguaje.
- Su unica funcion es actuar como objetivo de prueba para escáneres de seguridad de modelos ML, concretamente para evaluar la detección de características malicioso en serialización pickle.
- El repositorio está clasificado con severidad crítica, dificultad adversarial y decisión de admisión esperada de BLOCK.
- Actúa como control positivo: un detector correcto debe bloquear este artefacto por su superficie de ataque de mutación de serialización.
- El corpus incluye oráculos de ground truth (`LF-ORACLE-SER-0010`) que describen la verdad sintética esperada, sin afirmar que un detector concreto ya exista.

## Casos de uso

- **Evaluación de escáneres de seguridad de modelos**: este artefacto se utiliza para verificar si una herramienta de análisis estático (por ejemplo, PickleBall, modelos de escaneo de Hugging Face, safe loaders) es capaz de identificar y bloquear un payload pickle con características adversariales. Se ejecuta en un entorno aislado y se comprueba si el escáner lo marca como malicioso.
- **Pruebas de regresión en CI/CD de seguridad**: integrar este artefacto como test unitario en pipelines de integración continua para garantizar que un nuevo detector no introduce falsos negativos ante mutaciones de serialización pickle.
- **Benchmarking de herramientas de análisis estático**: comparar la tasa de detección de distintos escáneres (denylist, allowlist, sandboxing) contra este artefacto, de forma similar a como PickleBall evalúa sus defensas frente a escáneres existentes.
- **Entrenamiento de modelos de detección de malware ML**: el corpus Layerfault proporciona ejemplos sintéticos etiquetados que pueden servir como datos de entrenamiento para clasificadores de modelos malicioso.
- **Investigación sobre deserialización segura**: el artefacto ilustra una técnica específica de ataque (mutación de serialización con opcodes sospechosos) que puede estudiarse para diseñar defensas más robustas que las listas fijas de denylist.
- **Certificación de seguridad de repositorios de modelos**: como artefacto de control, puede incorporarse en suites de certificación para verificar que un entorno de despliegue de ML bloquea cargas serializadas no confiables.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Este artefacto no tiene métricas de rendimiento de modelo (MMLU, HumanEval, GSM8K, etc.) porque no es un modelo de aprendizaje automático. Los únicos datos de evaluación relevantes serían los de detección por escáneres de seguridad, que no se proporcionan en la model card ni en los resultados de la búsqueda web.

## Requisitos de hardware

- No requiere VRAM ni GPU para su uso, ya que no es un modelo ML.
- El análisis debe realizarse en un entorno aislado, preferiblemente una máquina virtual desechable o un contenedor sin acceso a red.
- Las herramientas de escaneo estático (como PickleBall, escáneres de Hugging Face, detectores de opcodes) se ejecutan en CPU.
- No aplica despliegue en vLLM, llama.cpp, Ollama o TGI.
- La latencia de análisis es la de la herramienta de escaneo utilizada, típicamente del orden de milisegundos a segundos.

## Comparativa con modelos similares

No es posible realizar una comparativa con modelos de la misma categoría, ya que no existe una categoría de modelos de lenguaje comparables. Los artefactos de seguridad sintéticos como este se comparan entre sí dentro del corpus Layerfault, pero no hay datos públicos de otros repositorios equivalentes en Hugging Face con la misma finalidad. La información disponible no permite establecer una tabla de comparación con alternativas.

## Limitaciones y advertencias

- **No es un modelo utilizable**: cualquier intento de cargarlo o ejecutarlo como un modelo ML de producción provocará errores o comportamientos no deseados.
- **Riesgo de seguridad real**: el archivo contiene opcodes de pickle sospechosos y técnicas de contrabando de formatos. Cargarlo con `torch.load` o `pickle.load` sin protección puede ejecutar código arbitrario. Debe tratarse exclusivamente en entornos aislados.
- **Sesgos y alucinación**: no aplica, al no ser un modelo generativo.
- **Restricciones de licencia**: la licencia es Apache-2.0, pero el acceso está restringido mediante un gate que exige aceptar el riesgo. La model card advierte explícitamente que no debe usarse como pesos de producción.
- **Caveat para producción**: cualquier uso fuera de pruebas de seguridad está contraindicado. El corpus es sintético, pero los patrones que contiene pueden ser explotados por actores maliciosos si se replican en entornos reales.
- **Falta de información**: no hay datos de arquitectura, tamaño, contexto, idiomas, cuantizaciones ni benchmarks, lo que impide cualquier uso como modelo de IA.

## Enlaces

- Repositorio de Hugging Face: https://huggingface.co/LayerFault/serialization-pickle-tail-decoy
- Paper de PickleBall (arXiv): https://arxiv.org/html/2508.15987v2
- Paper de PickleBall (versión anterior): https://arxiv.org/html/2508.15987v1
- PDF de PickleBall (CCS 2025): https://www.cs.columbia.edu/~junfeng/papers/pickleball-ccs25.pdf
- Blog de James Davis sobre PickleBall: https://davisjam.medium.com/pickleball-secure-deserialization-of-pickle-based-machine-learning-models-a089113e6b0f
- Publicación ACM de PickleBall: https://dl.acm.org/doi/10.1145/3719027.3765037
