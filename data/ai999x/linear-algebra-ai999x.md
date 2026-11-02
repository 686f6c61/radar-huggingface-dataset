# AI999X/linear-algebra-ai999x

## Resumen

linear-algebra-ai999x es un motor determinista de álgebra lineal para Python desarrollado por AI999X (autor: Ibnul Jaif Farabi). A diferencia de un modelo de lenguaje generativo, se trata de un solver especializado que interpreta preguntas en inglés o llamadas tipadas, selecciona una de sus 89 capacidades certificadas, calcula el resultado de forma exacta, lo verifica y devuelve la respuesta acompañada de pasos, unidades, LaTeX y supuestos. Cuando no puede verificar un resultado, se niega a responder en lugar de aproximar, lo que el autor denomina "zero wrong answers".

El repositorio incluye pesos en safetensors y ONNX con 4.715.520 parámetros totales y un tamaño de 0,1 GB, pero la model card describe el producto como un programa compilado en Rust (con variantes para escritorio, línea de comandos y WebAssembly) y un paquete de Python instalable vía `pip`. La inferencia se ejecuta íntegramente en CPU, sin GPU, sin clave de API y sin conexión a internet, lo que lo sitúa en una categoría distinta a la de los LLM: es una herramienta de cálculo simbólico-numérico empaquetada con artefactos de modelo.

Su relevancia actual reside en el nicho de resolución verificable de problemas matemáticos: frente a los asistentes generativos que pueden alucinar en cálculos matriciales, este motor declara resultados idénticos en Windows y Linux sobre un conjunto de 399 preguntas documentadas. La licencia Apache-2.0 y el soporte de Python 3.10 a 3.14 facilitan su integración en pipelines educativos y de validación numérica.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | No disponible (motor determinista de cálculo; pesos en safetensors y ONNX, sin arquitectura transformer descrita) |
| Parámetros totales | 4.715.520 |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | No disponible |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors, ONNX |

## Arquitectura y entrenamiento

La información disponible no describe una arquitectura de red neuronal convencional ni un proceso de entrenamiento con tokens, datasets de preentrenamiento o fases de RLHF/DPO. El sistema se presenta como un motor determinista que combina un conjunto de 89 capacidades certificadas de álgebra lineal con verificación interna del resultado. Los artefactos publicados incluyen pesos en safetensors (4.715.520 parámetros) y ONNX, además de binarios compilados en Rust para escritorio, CLI y WebAssembly.

La innovación destacable no es arquitectónica en el sentido habitual, sino de diseño: el motor selecciona una capacidad certificada, computa exactamente, comprueba el resultado y, si no puede verificarlo, emite una negativa explícita indicando qué falta. Esta política de rechazo es el mecanismo central para evitar respuestas incorrectas. No se dispone de detalles sobre la composición del dataset de entrenamiento ni sobre el procedimiento de certificación de las 89 capacidades.

## Capacidades

- Resolución de sistemas lineales, cálculo de determinantes, inversas y descomposiciones LU, QR y SVD.
- Mínimos cuadrados, valores y vectores propios, y operaciones con matrices dispersas.
- Búsqueda de raíces, interpolación y cuadratura numérica.
- Respuestas paso a paso con unidades, LaTeX y supuestos explicitados.
- Negativa verificable cuando el problema no puede resolverse con garantías.
- Procesamiento de preguntas en inglés en lenguaje natural y llamadas tipadas desde Python.
- Ejecución offline en CPU, sin GPU ni conexión de red.
- Distribución multiplataforma: aplicación de escritorio, CLI `linear-algebra`, WebAssembly en navegador y paquete `pip`.
- Tareas declaradas en los tags: question answering, token classification, text classification, sentence similarity y feature extraction.

## Casos de uso

- Docencia de álgebra lineal: el motor genera soluciones paso a paso con LaTeX, lo que permite al estudiante revisar el procedimiento completo y no solo el resultado final.
- Corrección automática de ejercicios: al ser determinista y devolver resultados idénticos en Windows y Linux, encaja en pipelines de evaluación donde la reproducibilidad es un requisito.
- Validación numérica en investigación: sirve como referencia independiente para comprobar resultados de descomposiciones SVD, QR o LU obtenidos con otras librerías.
- Integración en herramientas de cálculo offline: el paquete `pip` permite incorporar el solver a cuadernos o scripts sin depender de servicios en la nube ni de claves de API.
- Aplicaciones de escritorio educativas: los binarios Rust de 7,6 MB permiten distribuir un asistente de álgebra lineal que funciona sin Python instalado y sin conexión.
- Sistemas de ayuda al estudio con garantía de no alucinación: en entornos donde una respuesta incorrecta es costosa, la política de rechazo explícito resulta preferible a una aproximación generativa.
- Procesamiento por lotes de problemas matriciales: la ejecución en CPU y el bajo tamaño del repositorio (0,1 GB) facilitan el despliegue en servidores sin aceleradores.

## Benchmarks y rendimiento

Los datos proceden del model-index declarado por el autor y no han sido verificados de forma independiente.

| Tarea | Dataset | Métrica | Valor | Estado |
|---|---|---|---|---|
| Linear algebra question answering | Golden answers (399 preguntas documentadas, Windows + Linux, Python 3.10-3.14) | Accuracy | 1,0 | No verificado (`verified: false`) |

No se han publicado en la información disponible resultados de benchmarks estándar como MMLU, HumanEval o GSM8K, ni comparaciones con otros modelos.

## Requisitos de hardware

- VRAM: no requiere GPU; la inferencia se ejecuta en CPU.
- GPU recomendadas: no aplica.
- Compatibilidad con GPU de consumo: no aplica; el sistema está diseñado para CPU.
- Despliegue: paquete `pip` (`pip install linear-algebra-ai999x`), aplicación de escritorio para Windows y Linux, CLI `linear-algebra`, y ejecución en navegador vía WebAssembly.
- Tamaño de los binarios: 7,6 MB para la aplicación de escritorio de álgebra lineal (Windows x86-64).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| linear-algebra-ai999x | Motor determinista de álgebra lineal | 4.715.520 | No disponible | Apache-2.0 | HuggingFace, PyPI, binarios Rust, WebAssembly |
| SymPy | Librería de matemáticas simbólicas en Python | No aplica | No aplica | BSD | PyPI |
| NumPy / SciPy | Librerías de cálculo numérico | No aplica | No aplica | BSD | PyPI |

No se dispone de datos de rendimiento comparativo entre estas alternativas en la información proporcionada. La diferencia principal frente a SymPy y NumPy/SciPy es la interfaz en lenguaje natural, la verificación interna y la política de rechazo, junto con la distribución como aplicación de escritorio y WebAssembly.

## Limitaciones y advertencias

- Solo admite inglés; no hay soporte declarado para castellano ni otros idiomas.
- El alcance se limita al álgebra lineal y áreas afines (raíces, interpolación, cuadratura); no es un modelo de propósito general.
- No se dispone de información sobre sesgos, aunque al ser un motor determinista el riesgo de sesgo estadístico es distinto al de un LLM.
- El resultado de accuracy 1,0 está marcado como no verificado y procede del propio autor; debe tratarse con cautela.
- La model card no documenta el proceso de certificación de las 89 capacidades ni los criterios de rechazo.
- El rendimiento y la latencia no están documentados.
- Aunque la licencia es Apache-2.0, conviene revisar el archivo LICENSE del repositorio para confirmar los términos exactos de uso comercial.
- El proyecto tiene un único autor y un mantenimiento reciente (creado en octubre de 2026, actualizado en noviembre de 2026); la continuidad a largo plazo no está garantizada.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/AI999X/linear-algebra-ai999x
- Página del modelo y demo en navegador: https://www.ai999x.com/models/linear-algebra-ai999x/#try
- Aplicación de escritorio y CLI: https://www.ai999x.com/desktop-cli/
- Paquete de Python (PyPI): https://pypi.org/project/linear-algebra-ai999x/
- Documentación: https://huggingface.co/AI999X/linear-algebra-ai999x/tree/main/docs
- Evaluación: https://huggingface.co/AI999X/linear-algebra-ai999x/tree/main/evaluation
- Organización en HuggingFace: https://huggingface.co/AI999X
- Sitio web: https://ai999x.com
- Repositorio GitHub y releases: https://github.com/AI999X/linear-algebra-ai999x/releases/tag/v1.0.3
- Checksums: https://www.ai999x.com/downloads/desktop/1.2.0/SHA256SUMS
- Descargas (última versión): https://www.ai999x.com/downloads/desktop/latest/
- Apoyo al desarrollo: https://buymeacoffee.com/ibnuljaiffarabi
