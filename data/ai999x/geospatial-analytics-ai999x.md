# AI999X/geospatial-analytics-ai999x

## Resumen

geospatial-analytics-ai999x es un motor determinista de análisis geoespacial para Python, publicado por la organización AI999X y creado por Ibnul Jaif Farabi. No es un modelo de lenguaje generativo al uso: combina una lectura de preguntas en inglés basada en reglas con 99 capacidades simbólicas certificadas (geodesia elipsoidal, proyecciones cartográficas, estadística espacial, teledetección, análisis de terreno y análisis urbano y de redes), y devuelve el resultado junto con pasos, unidades, fórmulas en LaTeX y supuestos. Se distribuye como paquete Python instalable, funciona en CPU, sin GPU, sin red y sin clave de API.

Su propuesta central es la ausencia de respuestas inventadas: cada respuesta se calcula y se verifica (por sustitución inversa, comprobación dimensional o comparación con un cálculo independiente) antes de devolverse, y el sistema declara explícitamente siete resultados posibles (SOLVED, NEEDS_INPUT, AMBIGUOUS, INVALID_INPUT, OUT_OF_SCOPE, UNRECOGNIZED_FORMAT, INTERNAL_ERROR) en lugar de adivinar. El autor declara 615 respuestas documentadas reproducidas de forma idéntica en Windows y Linux con Python 3.10 a 3.14.

El repositorio declara 4.715.520 parámetros en safetensors, pero la model card describe el sistema como un motor neuro-simbólico determinista, no como una red neuronal con arquitectura transformer documentada; no se detalla qué representa exactamente ese tensor ni cómo se combina con el motor simbólico. La licencia es Apache-2.0 y el único idioma soportado es el inglés.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Motor neuro-simbólico determinista: lectura de preguntas basada en reglas más 99 capacidades simbólicas certificadas; no se documenta una arquitectura de red neuronal concreta |
| Parámetros totales | 4.715.520 (según safetensors del repositorio) |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible (no se define una ventana de contexto tipo LLM) |
| Tipos de cuantización | No disponible; no se documenta cuantización (ejecución en CPU con Python puro, sympy y mpmath) |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors y ONNX; distribución principal como wheel de Python (`geospatial_analytics_ai999x-1.0.0-py3-none-any.whl`) |

Otros datos declarados: versión 1.0.0, paquete `geospatial-analytics-ai999x`, import `geospatial_analytics_ai999x`, knowledge pack 1.0.0, 99 procedimientos certificados, 615 respuestas doradas documentadas, plataformas probadas Windows (Python 3.13) y Linux x86-64 (Python 3.10, 3.11, 3.12, 3.13 y 3.14), inferencia en CPU y offline.

## Arquitectura y entrenamiento

La arquitectura descrita es un híbrido neuro-simbólico: una capa de lectura de preguntas en inglés basada en reglas selecciona una de las 99 capacidades certificadas, y el cálculo se ejecuta de forma simbólica y determinista (con sympy y mpmath como dependencias). Cada resultado pasa por una verificación interna antes de devolverse, y la salida incluye los pasos intermedios, las fórmulas en LaTeX, las unidades, los supuestos y el modelo geodésico empleado. Existen dos interfaces: `ask()` para formas de pregunta documentadas y `solve(capability_id, **inputs)` como interfaz tipada que siempre resuelve una tarea soportada si las entradas son válidas.

No se documenta ningún proceso de entrenamiento: no se indican tokens de entrenamiento, composición del dataset, ni fases de RLHF, DPO o ajuste supervisado. Tampoco se explica la función de los 4.715.520 parámetros declarados en safetensors ni su relación con el motor simbólico. La innovación destacable no es arquitectónica en el sentido habitual, sino de diseño: siete resultados explícitos y verificables, rechazo en lugar de conjetura, y reproducibilidad declarada de las 615 respuestas documentadas en todas las plataformas probadas.

## Capacidades

- Geodesia elipsoidal: cálculo de destino geodésico, área y perímetro de polígonos geodésicos, y problemas inversos sobre elipsoides WGS84 y GRS80, entre otros.
- Coordenadas y proyecciones cartográficas: conversión UTM, Mercator, Lambert conformal cónica, Albers y ECEF, con factores de escala y convergencia de meridianos.
- Estadística espacial y geoestadística: procedimientos certificados de análisis de patrones espaciales y estimación.
- Teledetección: cálculo de índices de vegetación a partir de valores de banda, como NDVI, EVI y SAVI.
- Análisis de terreno: procedimientos de caracterización topográfica y morfométrica.
- Análisis urbano y de redes: capacidades certificadas orientadas a métricas urbanas y de red.
- Explicabilidad: devuelve pasos, fórmulas en LaTeX, unidades, supuestos y el modelo geodésico utilizado.
- Gestión explícita de incertidumbre: siete estados de salida y rechazo cuando la respuesta no puede verificarse.
- Interfaz tipada (`solve()`) además de pregunta en lenguaje natural (`ask()`), adecuada para integración programática.
- Ejecución offline en CPU, sin GPU, sin red y sin clave de API.
- No soporta tool calling ni function calling en el sentido de los LLM, no es un agente multi-paso y no genera texto libre, código ni respuestas conversacionales.

## Casos de uso

- Conversión de coordenadas en pipelines GIS: uso de `solve("geo_utm_forward", ...)` para transformar latitud y longitud a UTM con escala y convergencia, integrable en procesos ETL donde se exige reproducibilidad entre entornos Windows y Linux.
- Cálculo de áreas geodésicas para catastro o gestión de parcelas: el motor devuelve área y perímetro sobre elipsoides WGS84 o GRS80 con los pasos y supuestos documentados, lo que facilita la auditoría del resultado frente a cálculos manuales.
- Índices de vegetación en teledetección: a partir de reflectancias de banda roja, infrarrojo cercano y azul, calcula NDVI, EVI y SAVI de forma determinista, útil en cadenas de preprocesado de imágenes satelitales donde no se quiere depender de un servicio externo.
- Docencia y corrección de ejercicios: la salida con fórmulas en LaTeX, unidades y supuestos sirve para tutoría y verificación automática de problemas de geodesia y cartografía, con rechazo explícito cuando faltan datos en el enunciado.
- Validación cruzada de bibliotecas SIG: uso como referencia independiente para comprobar resultados de pyproj, GeographicLib u otras herramientas en pruebas de regresión, gracias a la verificación interna por sustitución inversa o cálculo independiente.
- Entornos aislados o sin conectividad: despliegue en máquinas sin acceso a internet, sin GPU y con Python 3.10 a 3.14, apropiado para sistemas embarcados, aulas, laboratorios o entornos de defensa con requisitos de offline.
- Automatización de análisis de terreno y redes: ejecución de las capacidades de morfometría y análisis urbano dentro de scripts de procesamiento por lotes, sin coste de inferencia en GPU ni latencia de red.
- Asistentes de ayuda con garantía de no alucinación: integración como backend de un chatbot de preguntas geoespaciales donde, ante una consulta no reconocida o ambigua, el sistema devuelve `OUT_OF_SCOPE` o `AMBIGUOUS` en lugar de una respuesta plausible pero falsa.

## Benchmarks y rendimiento

Datos declarados por el autor en el model-index de la model card. La métrica figura como `verified: false`, por lo que debe interpretarse como resultado autodeclarado y no como evaluación independiente.

| Tarea | Conjunto de evaluación | Métrica | Valor | Notas |
|---|---|---|---|---|
| Question answering geoespacial | Golden answers (615 preguntas documentadas, Windows y Linux, Python 3.10-3.14) | Accuracy | 1,0 | Respuestas idénticas en todas las plataformas probadas; solo cubre las formas de pregunta documentadas |

No se han publicado en la información disponible resultados de benchmarks estándar como MMLU, HumanEval o GSM8K, ni comparaciones cuantitativas con otros sistemas.

## Requisitos de hardware

- VRAM: no requiere GPU; 0 GB de VRAM. La inferencia se ejecuta en CPU.
- GPU recomendadas: ninguna. El paquete está diseñado para CPU, sin CUDA ni aceleradores.
- GPU de consumo: no aplica; no necesita tarjeta gráfica.
- Memoria RAM: no disponible en la información proporcionada.
- Plataformas probadas: Windows con Python 3.13 y Linux x86-64 con Python 3.10, 3.11, 3.12, 3.13 y 3.14. No se documentan pruebas en macOS ni en ARM.
- Despliegue: instalación vía `pip install geospatial-analytics-ai999x` o desde el wheel del repositorio; también se distribuyen artefactos ONNX y safetensors. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de motor.
- Latencia y throughput: no disponibles. Al ser cálculo simbólico local, la latencia depende de la capacidad invocada y del hardware, pero no se publican cifras.
- Conectividad: funcionamiento completamente offline, sin clave de API ni acceso a red.

## Comparativa con modelos similares

No se dispone en la información proporcionada de modelos comparables de la misma categoría con especificaciones verificables. Los equivalentes funcionales habituales para cálculos geodésicos y de proyecciones son bibliotecas deterministas de SIG (por ejemplo, pyproj o GeographicLib), pero esta ficha no cuenta con datos de parámetros, contexto, rendimiento ni licencia de esas alternativas para establecer una comparación cuantitativa rigurosa. Tampoco se dispone de comparación con LLM genéricos usados como resolutores de problemas geoespaciales, ya que no se han publicado resultados en la documentación del modelo.

| Criterio | geospatial-analytics-ai999x | Alternativas comparables |
|---|---|---|
| Parámetros | 4.715.520 declarados | No disponible |
| Contexto | No aplica / no disponible | No disponible |
| Rendimiento | Accuracy 1,0 autodeclarada en 615 preguntas documentadas | No disponible |
| Licencia | Apache-2.0 | No disponible |
| Disponibilidad | PyPI, Hugging Face, wheel y ONNX | No disponible |

## Limitaciones y advertencias

- Solo inglés: las preguntas en lenguaje natural deben formularse en inglés; no se documenta soporte multilingüe.
- Cobertura limitada a 99 capacidades certificadas y a formas de pregunta documentadas; fuera de ese conjunto el sistema devuelve `UNRECOGNIZED_FORMAT` o `OUT_OF_SCOPE`, no una respuesta aproximada.
- No es un modelo generativo: no redacta texto libre, no mantiene conversaciones multi-turno, no genera código, no hace razonamiento genérico y no soporta tool calling ni agentes.
- No procesa imágenes: las capacidades de teledetección operan sobre valores numéricos de banda, no sobre píxeles o ficheros raster.
- El benchmark de accuracy 1,0 está autodeclarado y marcado como `verified: false`; además se evalúa sobre las mismas 615 preguntas documentadas, por lo que no mide generalización a formulaciones nuevas.
- No se documenta el proceso de entrenamiento ni el papel de los 4.715.520 parámetros en safetensors, lo que dificulta evaluar el componente neuronal del sistema.
- La reproducibilidad declarada se limita a Windows y Linux x86-64 con Python 3.10 a 3.14; no hay datos de macOS, ARM ni otras versiones de Python.
- Dependencia de las versiones de sympy y mpmath: no se documenta el impacto de cambios de versión en la reproducibilidad numérica.
- Riesgo de selección errónea de capacidad ante entradas ambiguas; el sistema lo mitiga devolviendo `AMBIGUOUS`, pero exige revisión humana en esos casos.
- Licencia Apache-2.0: permite uso comercial, modificación y redistribución con obligaciones de atribución, inclusión del aviso de licencia y cláusulas de patentes; no se documentan restricciones adicionales.
- El repositorio declara 0 descargas y 0 likes en el momento de la consulta, y el pipeline declarado es `question-answering` pese a no ser un modelo de QA neuronal convencional; conviene validar el comportamiento en el caso de uso concreto antes de llevarlo a producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/AI999X/geospatial-analytics-ai999x
- Paquete en PyPI: https://pypi.org/project/geospatial-analytics-ai999x/
- Guía de capacidades (docs del repositorio): https://huggingface.co/AI999X/geospatial-analytics-ai999x/tree/main/docs
- Evaluación (carpeta del repositorio): https://huggingface.co/AI999X/geospatial-analytics-ai999x/tree/main/evaluation
- Organización AI999X en Hugging Face: https://huggingface.co/AI999X
- Sitio web del autor: https://ai999x.com
- Apoyo al desarrollo: https://buymeacoffee.com/ibnuljaiffarabi
- Licencia del repositorio: https://huggingface.co/AI999X/geospatial-analytics-ai999x/blob/main/LICENSE
