# AI999X/geometry-ai999x

## Resumen

geometry-ai999x es un motor determinista de geometría para Python, publicado por el autor Ibnul Jaif Farabi bajo la organización AI999X. No es un modelo de lenguaje generativo en el sentido habitual: se presenta como un solver offline que interpreta una pregunta en inglés (o una llamada tipada), selecciona una de sus 76 capacidades certificadas de geometría, calcula la respuesta de forma exacta, la verifica y devuelve el resultado junto con sus pasos, unidades, LaTeX y supuestos. Cuando no puede verificar una respuesta, se niega a responder en lugar de adivinar, lo que el autor denomina comportamiento de "cero alucinaciones".

El repositorio contiene 4.715.520 parámetros en safetensors y pesa aproximadamente 0,1 GB, con artefactos adicionales en ONNX y binarios nativos compilados en Rust para Windows y Linux, además de una versión WebAssembly ejecutable en navegador. La ficha de Hugging Face lo etiqueta con pipeline de question-answering y una licencia Apache-2.0, y declara soporte únicamente para inglés. Su relevancia actual radica en el nicho de resolución de problemas geométricos con garantías de verificabilidad y ejecución completamente offline sobre CPU, sin GPU, sin clave de API y sin conexión a internet.

Cabe señalar que la información disponible es limitada: la model card está truncada y no se detallan la arquitectura interna de la red, la composición del dataset de entrenamiento ni el proceso de entrenamiento. Los datos que siguen se limitan a lo declarado por el autor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (motor determinista en Python con binarios nativos en Rust; pesos en safetensors y ONNX) |
| Parametros totales | 4.715.520 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (inglés) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors, ONNX; binarios Rust nativos (Windows x86-64, Linux x86-64) y WebAssembly |

## Arquitectura y entrenamiento

La información proporcionada no describe la arquitectura interna de la red neuronal ni el proceso de entrenamiento. La model card define el producto como un motor determinista que "lee una pregunta en inglés (o una llamada tipada), elige una capacidad geométrica certificada, calcula la respuesta exactamente, la comprueba y devuelve el resultado con sus pasos, unidades, LaTeX y supuestos". El sistema se distribuye como paquete Python (`pip install geometry-ai999x`), como aplicación de escritorio y como programa de línea de comandos `geometry`, todos ejecutando el mismo programa Rust compilado en el dispositivo del usuario, de forma offline y sin requerir Python en el caso de los binarios nativos. La versión web se ejecuta como WebAssembly.

El autor declara 76 capacidades certificadas y 375 respuestas documentadas que se reproducen de forma idéntica en Windows y Linux con Python 3.10 a 3.14. No se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset, ni si hubo RLHF, DPO u otras técnicas de ajuste. Tampoco se detalla ninguna innovación de decodificación o atención. La innovación declarada es de tipo de producto: verificación determinista de resultados y negativa explícita ante casos no verificables.

## Capacidades

- Resolución de preguntas de geometría en inglés con respuesta paso a paso, incluyendo unidades, notación LaTeX y supuestos explícitos.
- Cobertura declarada de 76 capacidades certificadas, entre ellas geometría computacional, envolvente convexa (convex hull), geometría esférica, geometría de coordenadas, secciones cónicas, poliedros, curvatura, geometría plana y del espacio, polígonos y poliedros, diagramas de Voronoi y triangulación (según las etiquetas de la model card).
- Modo de negativa verificable: el sistema rechaza responder cuando no puede verificar el resultado, indicando qué información falta.
- Ejecución completamente offline sobre CPU, sin GPU, sin clave de API y sin conexión a internet.
- Distribución multiplataforma: aplicación de escritorio (Windows y Linux), línea de comandos `geometry`, WebAssembly en navegador y paquete Python 3.10+.
- Tareas declaradas en la ficha: question answering, token classification, text classification, sentence similarity y feature extraction.
- No se declara soporte de tool calling, function calling, agentes, visión, audio ni modo de razonamiento extendido (thinking mode) en la información disponible.

## Casos de uso

- Asistencia a estudiantes en tareas de geometría: el modelo recibe la pregunta en inglés y devuelve la solución con pasos intermedios, unidades y supuestos, lo que permite al estudiante seguir el razonamiento y comprobar cada etapa.
- Verificación automática de ejercicios en plataformas educativas: al ser determinista y reproducible de forma idéntica en Windows y Linux, puede integrarse en pipelines de corrección donde la misma entrada debe producir siempre la misma salida.
- Generación de material didáctico con notación matemática: la salida en LaTeX y con unidades explícitas facilita la incorporación directa en apuntes, libros o documentos científicos.
- Entornos con requisitos de privacidad o sin conectividad: al ejecutarse offline sobre CPU sin clave de API, es adecuado para aulas, laboratorios aislados o despliegues en los que no se permite enviar datos a servicios externos.
- Cálculo geométrico en scripts y herramientas de ingeniería: el paquete Python y la CLI permiten invocar capacidades concretas (envolvente convexa, triangulación, Voronoi, geometría esférica) desde pipelines de datos sin depender de una GPU.
- Aplicaciones de escritorio y web ligeras: los binarios Rust (7,7 MB para la app de escritorio de geometría en Windows) y la versión WebAssembly permiten incrustar el solver en herramientas de escritorio o páginas web sin infraestructura de servidor.
- Filtro de abstención en sistemas de tutoría: el comportamiento de negativa ante casos no verificables puede usarse como capa de seguridad para evitar respuestas incorrectas en productos educativos.

## Benchmarks y rendimiento

Los únicos datos disponibles son los declarados por el autor en el model-index, marcados como no verificados (`verified: false`):

| Tarea | Dataset | Métrica | Valor |
|---|---|---|---|
| Question answering (geometría) | Golden answers (375 preguntas documentadas, Windows + Linux, Python 3.10-3.14) | accuracy ("identical on every platform") | 1,0 |

No se han publicado en la información disponible resultados de benchmarks estándar como MMLU, HumanEval o GSM8K, ni comparaciones con otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica; el sistema está diseñado para ejecutarse en CPU sin GPU.
- GPU recomendadas: ninguna; no requiere GPU, clave de API ni conexión a internet.
- Compatibilidad con GPU de consumo: irrelevante para el funcionamiento declarado, ya que el motor corre sobre CPU.
- Opciones de despliegue: paquete Python (`pip install geometry-ai999x`), aplicación de escritorio AI999X (Windows y Linux x86-64), línea de comandos `geometry`, versión WebAssembly en navegador y pesos en safetensors/ONNX en el repositorio.
- Tamaño de los artefactos: repositorio de aproximadamente 0,1 GB; la app de escritorio de geometría para Windows ocupa 7,7 MB comprimida.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye comparaciones con otros modelos o solvers de geometría, ni datos de rendimiento de alternativas que permitan una comparación rigurosa.

## Limitaciones y advertencias

- Cobertura limitada a las 76 capacidades certificadas declaradas por el autor; fuera de ese ámbito el sistema se niega a responder, lo que puede percibirse como falta de flexibilidad.
- Soporte únicamente de inglés según la ficha; no se declaran otros idiomas.
- La información disponible no detalla la arquitectura de red, el entrenamiento ni el dataset, lo que dificulta una evaluación técnica independiente.
- El resultado de accuracy de 1,0 procede de la evaluación del propio autor sobre 375 preguntas documentadas y está marcado como no verificado; no debe interpretarse como rendimiento generalizable.
- Sesgos conocidos: no disponibles en la información proporcionada.
- Riesgo de alucinación: el autor declara "cero alucinaciones" mediante negativa ante casos no verificables; esta afirmación es una característica de diseño declarada, no un resultado de auditoría independiente.
- Licencia Apache-2.0: permite uso comercial, pero conviene revisar el archivo LICENSE del repositorio y las condiciones de los binarios distribuidos por el autor.
- La model card del repositorio está truncada en la información disponible; algunos detalles de distribución y versionado pueden faltar en esta ficha.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/AI999X/geometry-ai999x
- Organización en Hugging Face: https://huggingface.co/AI999X
- Aplicación de escritorio y línea de comandos: https://www.ai999x.com/desktop-cli/
- Probar en navegador: https://www.ai999x.com/models/geometry-ai999x/#try
- Paquete Python (PyPI): https://pypi.org/project/geometry-ai999x/
- Guías (docs): https://huggingface.co/AI999X/geometry-ai999x/tree/main/docs
- Evaluación: https://huggingface.co/AI999X/geometry-ai999x/tree/main/evaluation
- Sitio web: https://ai999x.com
- Repositorio GitHub y release v1.0.3: https://github.com/AI999X/geometry-ai999x/releases/tag/v1.0.3
- Descargas de escritorio (última versión): https://www.ai999x.com/downloads/desktop/latest/
- Checksums SHA256: https://www.ai999x.com/downloads/desktop/1.2.0/SHA256SUMS
- Apoyo al desarrollo (Buy Me a Coffee): https://buymeacoffee.com/ibnuljaiffarabi
