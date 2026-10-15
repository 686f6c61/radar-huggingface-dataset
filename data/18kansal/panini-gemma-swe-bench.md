# 18kansal/panini-gemma-swe-bench

## Resumen

PaniniCode-4B (publicado en HuggingFace como `18kansal/panini-gemma-swe-bench`) es un sistema neuro-simbólico orientado a la reparación automática de programas (Automated Program Repair, APR) que combina un modelo Gemma de aproximadamente 4.000 millones de parámetros con las reglas de la gramática formal sánscrita de Panini (*Aṣṭādhyāyī*). El autor presenta el proyecto como un puente entre la gramática generativa determinista de Panini y las invariantes de compilación (preservación de firmas AST, extracción de locus de fallo desde el traceback), usando Gemma como motor de síntesis de parches ejecutado localmente en CPU mediante GGUF cuantizado.

El modelo se posiciona como una alternativa ligera y desplegable en el borde (edge) frente a modelos frontera de 70B+ parámetros para tareas de generación de código. El pipeline declarado es de bucle cerrado: se ingiere un test que falla, se sintetiza un parche con Gemma, y se valida ejecutando el runner real (`unittest` en Python, `assert` en Node.js), aceptando únicamente soluciones con código de salida 0.

La relevancia actual del proyecto reside en su propuesta de verificación «grounded» (ejecución real en lugar de scoring sintético por regex o delimitadores) y en el uso de un modelo pequeño cuantizado para APR. No obstante, las métricas declaradas (100 %) se obtienen sobre un conjunto muy reducido de casos y deben interpretarse con cautela; el repositorio registra 0 descargas y 0 likes en el momento de la consulta, y el autor es un desarrollador individual (`18kansal`), no un laboratorio establecido.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Neuro-simbólica: Gemma Instruct (transformer) + motor de gramática formal de Panini y validación por ejecución real |
| Parametros totales | Aproximadamente 4.000 millones (denominación "4B"; pesos base citados como "Gemma 4B Instruct") |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | GGUF Q4_K_M |
| Idiomas soportados | en, sa (inglés y sánscrito) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (cuantización Q4_K_M); librería declarada `transformers` |

## Arquitectura y entrenamiento

El sistema no es un único modelo entrenado de cero, sino un marco neuro-simbólico. La parte neuronal es un modelo de la familia Gemma Instruct de aproximadamente 4B parámetros, ejecutado en CPU local con la cuantización GGUF Q4_K_M a través de un motor tipo Kobold.cpp. La parte simbólica consiste en un mapeo de los *sūtras* de la *Aṣṭādhyāyī* de Panini a invariantes de compilación y a roles semánticos del sistema *Kāraka*: por ejemplo, el autor asocia el *Apādāna* (1.4.24) con la extracción del locus del fallo desde el traceback, el *Karman* (1.4.49) con la especificación de la función objetivo del parche y el *Sthānivad ādeśaḥ* (1.1.56) con la preservación de la firma del AST.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, ni sobre procesos de alineación como RLHF, DPO o SFT. El componente de entrenamiento propio, si existe, no está documentado en la información proporcionada. La innovación que sí se describe con detalle es el bucle de verificación: cada solución generada se valida ejecutando el runner nativo (`python -m unittest`, `assert` de Node.js) en un entorno aislado, aceptándose solo si el código de salida es 0. El autor enumera las tareas resueltas (5 en Python sobre `requests`, `werkzeug`, `astropy`, `sympy` y `numpy`; 2 en JavaScript sobre `lodash` y `express`), todas resueltas en la primera iteración según la traza publicada.

## Capacidades

- Generación de parches de código para reparación automática de programas (APR) en Python y JavaScript.
- Soporte de un bucle iterativo de reparación guiado por tracebacks de tests fallidos.
- Verificación por ejecución real contra `unittest` (Python) y `assert` (Node.js), condicionando el resultado a código de salida 0.
- Preservación declarada de firmas AST mediante invariantes derivados de la gramática de Panini.
- Ejecución local en CPU con pesos cuantizados (Q4_K_M), sin requerir GPU en el escenario descrito por el autor.
- Idiomas declarados: inglés y sánscrito (este último asociado al aparato formal, no necesariamente a la interfaz conversacional).
- No se documenta soporte de tool calling, function calling, agentes multi-paso, visión, audio ni modo de razonamiento explícito en la información disponible.

## Casos de uso

- Reparación automática de bugs en repositorios Python: dado un test que falla, el sistema localiza el locus del error desde el traceback, sintetiza un parche y lo valida ejecutando `unittest` hasta obtener salida 0, integrándose en un pipeline de CI para proponer correcciones.
- Mantenimiento de dependencias de terceros: aplicar el flujo de APR sobre componentes de librerías conocidas (el autor cita `requests`, `werkzeug`, `astropy`, `sympy`, `numpy`) para corregir regresiones introducidas por actualizaciones.
- Corrección de utilidades JavaScript en backend Node.js: reparar lógica de funciones puras (por ejemplo, `lodash.chunk` o saneamiento de queries en `express`) validando con `assert`.
- Entornos con restricciones de hardware: al ejecutarse en CPU con GGUF Q4_K_M, permite APR en estaciones de trabajo sin GPU o en dispositivos de borde.
- Prueba de concepto educativa sobre sistemas neuro-simbólicos: ilustra cómo combinar un LLM pequeño con un verificador simbólico y ejecución real para reducir alucinaciones en código.
- Investigación en verificación grounded: sirve como banco de pruebas para metodologías que sustituyen el scoring sintético por ejecución de procesos reales y código de salida.
- Automatización de tests guiada por fallo: usar el bucle fallo-traceback-parche-verificación como mecanismo para generar candidatos de corrección en lotes pequeños de tests.

## Benchmarks y rendimiento

Los datos siguientes son los declarados por el autor en la model card y en el `model-index`. Corresponden a un conjunto muy reducido de casos (5 tests Python y 2 JavaScript), no a la totalidad de SWE-bench Verified, que comprende 500 problemas. Se presentan tal cual, sin verificación independiente.

| Tarea | Dataset | Metrica | Valor | Verificado |
|---|---|---|---|---|
| Automated Program Repair (code-generation) | SWE-bench Verified Test Suite | Genuine Python Unittest Pass Rate (Exit Code 0) | 100 | No (declarado por el autor) |

Detalle de la tabla polyglot publicada en la model card:

| Task ID | Lenguaje | Componente | Iteraciones | Traza de test | Exit code | Estado |
|---|---|---|---|---|---|---|
| python_requests_header_encoding | Python | requests.utils | 1 (11,0 s) | Ran 2 tests: OK | 0 | PASS |
| python_flask_safe_join | Python | werkzeug.security | 1 (27,2 s) | Ran 2 tests: OK | 0 | PASS |
| python_astropy_angle_wrap | Python | astropy.coordinates.angles | 1 (13,7 s) | Ran 3 tests: OK | 0 | PASS |
| python_sympy_simplify_fraction | Python | sympy.core.numbers | 1 (12,7 s) | Ran 2 tests: OK | 0 | PASS |
| python_numpy_clip_normalize | Python | numpy.core.numeric | 1 (13,5 s) | Ran 2 tests: OK | 0 | PASS |
| js_lodash_chunk_array | JavaScript | lodash.chunk | 1 (19,7 s) | assert.deepStrictEqual: OK | 0 | PASS |
| js_express_query_sanitize | JavaScript | express.query | 1 (17,2 s) | assert.strictEqual: OK | 0 | PASS |

Totales declarados por el autor: tasa de éxito del 100 % (5/5 tests Python grounded), latencia media de reparación de 19,6 segundos por tarea en CPU local, y 0 % de atajos sintéticos (sin scoring por delimitadores o regex). El autor no publica resultados sobre la totalidad de SWE-bench Verified ni comparación con otros modelos en las mismas condiciones, por lo que no se ofrecen cifras comparativas adicionales.

## Requisitos de hardware

- VRAM estimada: para aproximadamente 4B parámetros en Q4_K_M, el peso ocupa del orden de 2,5 a 3 GB de memoria; en CPU puede residir en RAM, y en GPU cabría incluso en tarjetas de 6-8 GB.
- El autor ejecuta el modelo en CPU local (no se especifica GPU en el escenario documentado).
- Cabe en GPU de consumo: previsiblemente sí, en tarjetas tipo RTX 3060, RTX 4060, RTX 4090 y similares, aunque no se aportan mediciones concretas de VRAM ni de rendimiento por GPU.
- Opciones de despliegue: `transformers` (librería declarada), GGUF mediante motores compatibles (el autor cita Kobold.cpp); llama.cpp y otros runners GGUF serían compatibles en principio, aunque no se confirman explícitamente.
- Latencia declarada: media de 19,6 segundos por tarea de reparación en CPU local, con tiempos individuales entre 11,0 y 27,2 segundos.
- Throughput: no disponible.

## Comparativa con modelos similares

No se dispone de datos de benchmarks comparables publicados en la información proporcionada para enfrentar PaniniCode-4B con alternativas bajo las mismas condiciones de evaluación. La tabla siguiente recoge únicamente lo conocido; los campos sin dato se marcan como no disponible.

| Modelo | Parametros | Contexto | APR / SWE-bench | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| PaniniCode-4B (este modelo) | ~4B | No disponible | 100 % sobre 5 tests Python declarados por el autor (no es el conjunto completo de SWE-bench Verified) | apache-2.0 | HuggingFace (0 descargas) |
| Gemma (modelo base citado) | ~4B Instruct | No disponible | No disponible | Gemma Terms / Apache según variante | HuggingFace |
| Modelos de código de ~4-7B de la misma categoría | No disponible | No disponible | No disponible | No disponible | No disponible |

No se ha encontrado en la búsqueda web ningún resultado de SWE-bench Verified correspondiente a este modelo; los leaderboards de SWE-bench (`swebench.com`) y otras fuentes no lo listan entre los modelos evaluados de forma independiente.

## Limitaciones y advertencias

- Las métricas del 100 % se obtienen sobre 5 tests Python y 2 casos JavaScript, no sobre el conjunto completo de SWE-bench Verified (500 problemas); presentarlas como resultado de SWE-bench Verified resulta engañoso sin ese matiz.
- Los resultados están declarados por el autor y marcados como no verificados (`verified: false`) en el `model-index`; no hay validación independiente.
- El repositorio no registra descargas ni likes en el momento de la consulta, y el autor es un desarrollador individual, sin respaldo de laboratorio.
- El proyecto combina un modelo base existente con un marco simbólico y una sandbox de verificación; no está claro qué componentes son pesos entrenados y cuáles son infraestructura externa, ni se documenta el proceso de entrenamiento.
- Riesgo de alucinación: mitigado parcialmente por la validación por ejecución real, pero el filtro de aceptación es solo el código de salida 0, lo que puede dejar pasar parches que pasan los tests sin resolver la causa raíz o que introducen problemas no cubiertos por la suite.
- Sesgos: no documentados en la información disponible; el corpus de entrenamiento del modelo base subyacente podría introducir sesgos, pero no se aportan análisis.
- Cobertura de idiomas limitada a inglés y sánscrito según los metadatos; no se garantiza buen comportamiento en otros idiomas.
- Licencia Apache 2.0 declarada, lo que en principio permite uso comercial, pero al derivar de pesos Gemma conviene verificar las condiciones de la licencia original de Gemma, que pueden imponer restricciones adicionales.
- No se documentan garantías de robustez, seguridad ni comportamiento en producción más allá de los siete casos de prueba citados.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/18kansal/panini-gemma-swe-bench
- Modelo base citado (badge): https://huggingface.co/google/gemma-2-9b-it
- Referencia sobre Panini y la Aṣṭādhyāyī: https://en.wikipedia.org/wiki/P%C4%81%E1%B9%87ini
- Licencia Apache 2.0: https://opensource.org/licenses/Apache-2.0
- SWE-bench Leaderboards: https://www.swebench.com/index.html
- SWE-bench Results Viewer: https://www.swebench.com/viewer.html
- Model card de Gemma 12B (referencia de la familia): https://huggingface.co/google/gemma-4-12B
- AI Model Tracker (SAVRN): https://savrn.com/model-tracker
- AI Benchmarks 2026 (MMLU, GPQA, SWE-bench): https://lmmarketcap.com/benchmarks
