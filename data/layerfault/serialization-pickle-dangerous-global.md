# LayerFault/serialization-pickle-dangerous-global

## Resumen

Este repositorio, `LayerFault/serialization-pickle-dangerous-global`, es un artefacto sintético de prueba de seguridad perteneciente al corpus Layerfault. No contiene pesos de un modelo de aprendizaje automático ni es utilizable como tal. Su propósito es servir como fixture de evaluación para herramientas de análisis estático y scanners de seguridad que detectan características adversarias en formatos de serialización, específicamente el uso de opcodes peligrosos de pickle en archivos de modelos.

El artefacto está diseñado deliberadamente con contenido malicioso simulado, como opcodes sospechosos de pickle, contrabando de formatos ejecutables y cadenas de inyección de prompts, para ejercitar reglas de detección en entornos aislados. El autor, LayerFault, lo clasifica como un elemento de prueba sintético con severidad alta, dificultad compuesta y decisión esperada de bloqueo. No debe cargarse ni ejecutarse fuera de un entorno de pruebas de scanner.

La relevancia de este repositorio radica en el contexto más amplio de seguridad en el ecosistema de modelos open source: el formato pickle es un vector conocido de ejecución de código arbitrario y se utiliza en una fracción significativa de los modelos alojados en Hugging Face. Este artefacto permite entrenar y verificar herramientas de detección sin riesgo real.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No aplicable (artefacto de prueba de seguridad, no es un modelo) |
| Parametros totales | No disponible |
| Parametros activos | No disponible |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | No disponible (el repositorio contiene datos sintéticos de prueba, no pesos) |

## Arquitectura y entrenamiento

No existe arquitectura neuronal ni proceso de entrenamiento. El repositorio es un fixture de seguridad sintético generado por el corpus LayerFault, con identificador `LF-CH-SER-0004`. Su contenido se construye deliberadamente para incluir características adversarias: opcodes de pickle peligrosos, contrabando de formatos ejecutables y cadenas de inyección de prompts. No se ha aplicado ningún tipo de entrenamiento, RLHF ni ajuste. Su diseño se orienta a ejercitar reglas de detección estáticas y dinámicas en herramientas de escaneo de seguridad, no a producir texto ni a realizar inferencias.

## Capacidades

- No posee capacidades de generación de texto, razonamiento, código, matemáticas, visión, audio ni ninguna otra funcionalidad de modelo ML.
- Su función es servir como caso de prueba positivo para scanners de seguridad: contiene patrones que deben ser detectados y bloqueados.
- Se espera que active la regla directa `LF-PICKLE-DANGEROUS-GLOBAL`.
- Incluye contenido adversario diseñado para probar la detección de serialización maliciosa en modelos ML.
- Es adecuado para pruebas de integración de herramientas de seguridad que analicen repositorios de Hugging Face o pipelines de carga de modelos.
- No admite tool calling, agentes ni razonamiento multi-paso; no es un modelo de lenguaje.

## Casos de uso

- **Pruebas de scanners de seguridad de modelos ML**: el artefacto se puede integrar en suites de pruebas unitarias o de integración para verificar que un scanner de Hugging Face detecta y bloquea correctamente archivos pickle peligrosos.
- **Validación de reglas de detección**: sirve como corpus positivo para confirmar que una regla específica (p.ej. `LF-PICKLE-DANGEROUS-GLOBAL`) se activa con este patrón.
- **Entrenamiento de clasificadores de seguridad**: aunque no es un modelo, los patrones que contiene pueden usarse para generar datasets de entrenamiento de detectores de malware en modelos.
- **Auditoría de entornos de despliegue**: permite comprobar que los sistemas de análisis estático de repositorios están configurados correctamente y no permiten la descarga o carga de artefactos con este tipo de contenido.
- **Documentación y formación**: útil para demostrar, de forma controlada, los riesgos de la deserialización de pickle en el ecosistema ML, sin exponer un entorno real a código malicioso.
- **Pruebas de herramientas de escaneo de repositorios**: se puede usar para evaluar la eficacia de herramientas como PickleBall u otros escáneres de modelos antes de su implementación en producción.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. Este artefacto no es un modelo y no tiene métricas de rendimiento de IA (MMLU, HumanEval, GSM8K, etc.). Los únicos datos relevantes son de clasificación interna del corpus LayerFault: severidad alta, dificultad compuesta, decisión esperada de bloqueo, y tipo de control positivo.

## Requisitos de hardware

- No aplica: no se ejecuta como modelo de inferencia.
- Para su análisis estático, no se requiere hardware especial; basta con un entorno de ejecución de Python aislado y herramientas de análisis de pickle.
- Para pruebas dinámicas en sandbox, se recomienda una máquina virtual o contenedor sin acceso a red y con recursos limitados (1-2 GB de RAM es suficiente).
- No se recomienda su uso en entornos de producción ni en GPUs, ya que no contiene pesos y no necesita inferencia.

## Comparativa con modelos similares

No existe una comparativa directa con modelos de lenguaje. En el contexto de artefactos de seguridad sintéticos, se pueden mencionar otros elementos del corpus LayerFault (como `LF-CH-SER-0001` a `0003`), aunque no hay datos públicos de ellos. En el ámbito de herramientas de deserialización segura, PickleBall (arXiv:2508.15987) es una propuesta académica que ofrece una alternativa segura a la carga de modelos pickle, y su evaluación muestra que los scanners actuales fallan en identificar muchos modelos maliciosos. Este artefacto no tiene equivalencia funcional con modelos de IA; su comparativa es con otros fixtures de prueba de seguridad, de los que no se dispone de información pública.

## Limitaciones y advertencias

- **No es un modelo ML**: no debe ser cargado con `torch.load`, `pickle.load` ni ninguna otra función de deserialización fuera de un entorno aislado de pruebas.
- **Contenido malicioso simulado**: contiene patrones de pickle peligrosos y técnicas de contrabando de ejecutables; ejecutarlo puede provocar la ejecución de código arbitrario en el entorno.
- **Riesgo de alucinación**: no aplica, no genera texto.
- **Restricciones de licencia**: aunque la licencia es Apache-2.0, su uso está limitado a pruebas de seguridad y no debe emplearse como componente de producción.
- **Sin garantías de exactitud**: los datos del corpus son sintéticos y no representan vulnerabilidades reales de un modelo específico.
- **Advertencia de acceso**: el repositorio está gated con un aviso que confirma que el usuario entiende que es un fixture de seguridad y que no debe cargarse fuera de un entorno de test.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/LayerFault/serialization-pickle-dangerous-global
- Guía de vulnerabilidades de deserialización de pickle en ML (Safeguard.sh): https://safeguard.sh/resources/blog/analysis-of-pickle-file-deserialization-vulnerabilities-in-ml-frameworks
- PickleBall: Secure Deserialization of Pickle-based Machine Learning Models (arXiv): https://arxiv.org/html/2508.15987v2
- PDF de PickleBall (CCS'25): https://www.cs.columbia.edu/~junfeng/papers/pickleball-ccs25.pdf
- Guía de ataques de deserialización en modelos ML (AppSecBrief): https://appsecbrief.com/articles/ml-model-deserialization-pickle-onnx-safetensors-security-guide/
