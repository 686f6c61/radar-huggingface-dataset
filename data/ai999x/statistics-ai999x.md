# AI999X/statistics-ai999x

## Resumen

statistics-ai999x es un motor determinista de estadística empaquetado como modelo de HuggingFace por AI999X, con autoría de Ibnul Jaif Farabi. No es un modelo de lenguaje generativo en el sentido habitual: recibe una pregunta en inglés (o una llamada tipada), selecciona una de sus 110 capacidades estadísticas certificadas, calcula el resultado de forma exacta, lo verifica y lo devuelve junto con los pasos, unidades, LaTeX y supuestos. Si no puede verificar la respuesta, se niega a responder en lugar de aproximar, lo que el autor presenta como "zero hallucination".

El paquete incluye pesos en safetensors (4.715.520 parámetros, 0,1 GB de repositorio) y una exportación ONNX, además de binarios nativos compilados en Rust para Windows, Linux y WebAssembly, una aplicación de escritorio, una CLI (`statistics`) y un paquete de Python (`pip install statistics-ai999x`). Funciona completamente offline sobre CPU, sin GPU, sin clave de API y sin conexión a internet.

Su relevancia actual es acotada pero específica: cubre el nicho de resolución de problemas estadísticos con trazabilidad y reproducibilidad entre plataformas, algo que los LLM generales no garantizan de forma determinista. Está pensado para docencia, control de calidad, análisis de fiabilidad y flujos donde una respuesta no verificable es peor que una negativa explícita.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible (motor determinista de capacidades estadísticas; pesos en safetensors y ONNX, binarios nativos en Rust) |
| Parametros totales | 4.715.520 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Inglés (`en`) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors, ONNX |

## Arquitectura y entrenamiento

La información disponible no describe una arquitectura de red neuronal convencional ni detalla el proceso de entrenamiento. El autor define el sistema como un motor determinista que, ante una consulta, selecciona una capacidad estadística certificada de un catálogo de 110, ejecuta el cálculo exacto, lo comprueba y devuelve el resultado con pasos, unidades, LaTeX y supuestos. El repositorio incluye pesos en safetensors y ONNX, y distribuciones nativas compiladas desde Rust para Windows, Linux y WebAssembly, lo que sugiere que la inferencia principal se realiza sobre código compilado más que sobre un transformer generativo.

No se especifican el número de tokens de entrenamiento, la composición del dataset, ni si hubo RLHF, DPO o ajuste fino supervisado. La innovación técnica declarada es la verificación previa a la respuesta y la negativa explícita ante casos no verificables, junto con la paridad de resultados entre Windows y Linux sobre Python 3.10 a 3.14.

## Capacidades

- Resolución de preguntas de estadística en inglés con salida paso a paso, unidades, LaTeX y supuestos.
- Cobertura declarada de estadística descriptiva, distribuciones de probabilidad, contrastes de hipótesis, intervalos de confianza, ANOVA, métodos no paramétricos, regresión y correlación, diseño experimental, control de calidad, fiabilidad y análisis de supervivencia.
- Clasificación de tokens, clasificación de texto, regresión tabular, similitud entre frases y extracción de características (etiquetas declaradas por el autor).
- Ejecución offline sobre CPU, sin GPU, sin clave de API y sin conexión.
- Determinismo entre plataformas: el autor declara respuestas idénticas en Windows y Linux con Python 3.10 a 3.14.
- Negativa explícita cuando la respuesta no puede verificarse, indicando qué falta.
- No se documenta soporte de tool calling, function calling, agentes, razonamiento multi-paso genérico, visión, audio ni modo de pensamiento.

## Casos de uso

- Docencia de estadística: el modelo devuelve la solución con pasos, unidades y supuestos, lo que permite al estudiante seguir el procedimiento en lugar de recibir solo el número final; encaja en entornos sin internet como aulas o exámenes supervisados.
- Control de calidad industrial: cálculo de cartas de control, capacidad de proceso e intervalos de confianza sobre datos de producción, ejecutado localmente en la planta sin enviar datos a la nube.
- Análisis de fiabilidad y supervivencia: estimación de curvas de supervivencia y contrastes asociados en estudios de vida útil de componentes, con resultados reproducibles entre estaciones de trabajo Windows y Linux.
- Validación de pipelines analíticos: uso como oráculo determinista que verifica que los resultados de un script propio coinciden con el cálculo certificado antes de desplegarlo en producción.
- Diseño experimental: cálculo de tamaños de muestra, ANOVA y contrastes de hipótesis en la fase de planificación de un estudio, con los supuestos explicitados para su revisión por pares.
- Integración en herramientas internas: el paquete de Python y la CLI permiten invocar el motor desde scripts, notebooks o servicios ligeros en CPU, sin dependencia de proveedores externos.
- Distribución en navegador: la versión WebAssembly permite ofrecer cálculo estadístico verificado en una página web sin instalar nada ni enviar datos al servidor.

## Benchmarks y rendimiento

| Tarea | Dataset | Métrica | Valor | Nota |
|---|---|---|---|---|
| Question answering (estadística) | Golden answers (609 preguntas documentadas, Windows + Linux, Python 3.10-3.14) | Accuracy | 1,0 | "Identical on every platform"; marcado como no verificado (`verified: false`) |

No se han publicado otros resultados de benchmarks en la información disponible. El único dato procede del `model-index` declarado por el autor y no está verificado de forma independiente.

## Requisitos de hardware

- VRAM: no requiere GPU; la inferencia está diseñada para ejecutarse en CPU.
- GPU recomendadas: ninguna; no se documenta aceleración por GPU.
- Compatibilidad con GPU de consumo: no aplica, al no necesitar GPU.
- Tamaño en disco: repositorio de 0,1 GB; el binario de escritorio para Windows x86-64 ocupa 7,3 MB.
- Opciones de despliegue: aplicación de escritorio AI999X (Windows y Linux x86-64), CLI `statistics`, WebAssembly en navegador, paquete de Python (`pip install statistics-ai999x`) y pesos safetensors/ONNX en el repositorio.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| statistics-ai999x | 4.715.520 | No disponible | Motor determinista de estadística con verificación y negativa ante casos no verificables | Apache-2.0 | HuggingFace, PyPI, escritorio, CLI, WebAssembly |
| LLM general de pequeño tamaño (p. ej. familia de 1-3B) | 1.000-3.000 millones | 4K-32K típicamente | Generación de texto libre, incluida estadística | Variable según modelo | HuggingFace y múltiples runtimes |
| Librerías estadísticas clásicas (SciPy, statsmodels) | No aplica | No aplica | Funciones deterministas sin interfaz en lenguaje natural | BSD (SciPy) / BSD-3 (statsmodels) | PyPI |

No se dispone de datos de benchmarks comparativos con estas alternativas en la información proporcionada. La comparación se limita a enfoque, licencia y disponibilidad.

## Limitaciones y advertencias

- Solo admite inglés; no hay soporte declarado de castellano ni de otros idiomas.
- Cubre exclusivamente el dominio estadístico; no es un modelo de propósito general y no debe usarse para generación de texto libre, código o razonamiento fuera de ese ámbito.
- El resultado de accuracy 1,0 procede del autor y está marcado como no verificado; conviene replicarlo de forma independiente antes de confiar en él en producción.
- La negativa a responder ante casos no verificables puede limitar la cobertura real frente a herramientas estadísticas generalistas que sí devuelven un resultado, aunque sea aproximado.
- No se documentan sesgos, comportamiento ante entradas ambiguas ni tasas de error fuera del conjunto de evaluación declarado.
- No se especifican la longitud de contexto, los tipos de cuantización ni el proceso de entrenamiento, lo que dificulta evaluar su robustez ante consultas fuera de distribución.
- La licencia Apache-2.0 permite uso comercial, pero no se detallan garantías ni soporte; el proyecto depende de un único autor y organización.
- No se documenta soporte de tool calling ni de agentes, por lo que su integración en flujos automatizados debe hacerse mediante la API de Python o la CLI.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/AI999X/statistics-ai999x
- Organización en HuggingFace: https://huggingface.co/AI999X
- Documentación y guías: https://huggingface.co/AI999X/statistics-ai999x/tree/main/docs
- Evaluación: https://huggingface.co/AI999X/statistics-ai999x/tree/main/evaluation
- Aplicación de escritorio y CLI: https://www.ai999x.com/desktop-cli/
- Probar en el navegador: https://www.ai999x.com/models/statistics-ai999x/#try
- Paquete de Python: https://pypi.org/project/statistics-ai999x/
- Sitio web: https://ai999x.com
- Release en GitHub: https://github.com/AI999X/statistics-ai999x/releases/tag/v1.0.3
- Descargas de escritorio: https://www.ai999x.com/downloads/desktop/latest/
- Checksums: https://www.ai999x.com/downloads/desktop/1.2.0/SHA256SUMS
- Apoyo al autor: https://buymeacoffee.com/ibnuljaiffarabi
