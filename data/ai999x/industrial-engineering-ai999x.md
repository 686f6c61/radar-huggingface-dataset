# AI999X/industrial-engineering-ai999x

## Resumen

`industrial-engineering-ai999x` es un motor de resolución determinista para problemas de ingeniería industrial y cadena de suministro, publicado por la organización AI999X (autor: Ibnul Jaif Farabi) bajo licencia Apache-2.0. No es un modelo de lenguaje generativo en el sentido habitual: combina un front-end simbólico basado en reglas que interpreta preguntas en inglés con un conjunto de 94 procedimientos certificados que calculan la respuesta de forma exacta mediante SymPy y mpmath. El resultado se verifica antes de devolverse (sustitución inversa, comprobación dimensional o cálculo independiente) y, si no puede verificarse, el sistema rechaza la petición en lugar de aproximar.

El paquete se distribuye como librería Python (`industrial_engineering_ai999x` 1.0.0) con pesos en `safetensors` y `onnx` (4.715.520 parámetros en el checkpoint publicado) y está diseñado para ejecutarse íntegramente en CPU, sin GPU, sin red y sin clave de API. Su propuesta de valor es la reproducibilidad: 644 respuestas documentadas que se reproducen de forma idéntica en Windows y Linux sobre Python 3.10 a 3.14.

Es relevante ahora por su enfoque "neuro-simbólico determinista" aplicado a dominios STEM con respuesta verificable, un nicho donde los LLM generativos siguen fallando por alucinación. Encaja en escenarios de tutoría, corrección automática de ejercicios y cálculo operativo en producción donde un error numérico es inaceptable y se prefiere una abstención explícita a una respuesta plausible pero falsa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Motor neuro-simbólico determinista: lectura basada en reglas + 94 capacidades simbólicas certificadas (SymPy, mpmath) |
| Parametros totales | 4.715.520 (checkpoint `safetensors` publicado) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (interfaz de pregunta única, no conversacional) |
| Tipos de cuantizacion | no disponible (no aplica: ejecución simbólica en CPU; pesos en safetensors y ONNX) |
| Idiomas soportados | inglés (`en`) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors, ONNX |

## Arquitectura y entrenamiento

La arquitectura no es un transformer generativo al uso. El sistema se compone de dos capas: (1) un intérprete de preguntas en inglés basado en reglas que mapea la formulación del usuario a una de las 94 capacidades certificadas, y (2) un motor simbólico que resuelve el problema con aritmética de precisión arbitraria (SymPy, mpmath) y verifica el resultado mediante sustitución inversa, análisis dimensional o una segunda computación independiente. El paquete declara siete resultados posibles —SOLVED, NEEDS_INPUT, AMBIGUOUS, INVALID_INPUT, OUT_OF_SCOPE, UNRECOGNIZED_FORMAT e INTERNAL_ERROR— de modo que nunca devuelve una estimación silenciosa.

No se dispone de información sobre el corpus de entrenamiento, el número de tokens, la composición del dataset ni si se emplearon técnicas de RLHF o DPO; la model card describe el sistema como determinista y "cero alucinaciones por diseño", lo que sugiere que el ajuste fino no es el mecanismo central de calidad, sino la verificación formal. La innovación destacable es precisamente esa: cada respuesta incluye pasos, fórmulas en LaTeX, unidades, supuestos y el identificador de la capacidad empleada, lo que la hace auditable y apta para corrección automática.

## Capacidades

- Resolución de problemas de gestión de inventarios: cantidad económica de pedido (EOQ), modelo newsvendor, políticas de revisión periódica y continua.
- Control estadístico de procesos: límites para gráficos X-barra y R, capacidad de proceso y análisis de variabilidad.
- Ingeniería de fiabilidad: cálculo de tasas de fallo, disponibilidad y funciones de supervivencia.
- Teoría de colas: modelos M/M/c y derivados, con utilización, probabilidad de espera, Lq y Wq.
- Programación de la producción y secuenciación de tareas.
- Previsión de demanda (forecasting) con métodos estadísticos clásicos.
- Equilibrado de líneas de producción (line balancing) y curvas de aprendizaje.
- Localización de instalaciones (facility location).
- Interfaz tipada garantizada: `solve(capability_id, **inputs)` resuelve siempre que los argumentos sean válidos; `ask()` interpreta formulaciones documentadas en inglés.
- Salida explicativa con pasos, unidades, LaTeX y supuestos, apta para tutoría y revisión.
- Rechazo explícito y tipado cuando faltan datos o la pregunta queda fuera de alcance.
- Ejecución offline en CPU, sin dependencia de red ni de clave de API.
- No soporta tool calling genérico, agentes multi-paso ni visión; el alcance es el conjunto cerrado de 94 capacidades.

## Casos de uso

- Corrección automática de ejercicios de ingeniería industrial: el motor recibe los datos del enunciado, devuelve el resultado con pasos y unidades, y permite al profesorado auditar la solución gracias al identificador de capacidad y a la comprobación de verificación.
- Tutoría STEM con feedback paso a paso: al devolver fórmulas en LaTeX y supuestos, el estudiante ve el desarrollo completo y no solo la respuesta final, sin riesgo de explicaciones inventadas.
- Cálculo operativo en planificación de inventarios: integrado en un script de planificación, `solve("ie_eoq", ...)` produce cantidades de pedido y ciclos de reaprovisionamiento deterministas y reproducibles entre entornos Windows y Linux.
- Dimensionado de sistemas de colas en atención al cliente: cálculo de utilización, probabilidad de espera y longitud de cola para decidir el número de servidores necesarios antes de desplegar un sistema real.
- Control de calidad en línea de producción: generación de límites de control X-barra y R a partir de medias y rangos de subgrupos, con salida lista para incorporar a informes de SPC.
- Previsión de demanda en planificación de suministro: uso del módulo de forecasting para obtener estimaciones reproducibles que alimenten hojas de cálculo o pipelines de reposición.
- Docencia e investigación reproducible: al ser determinista y offline, los resultados de un cuaderno se replican bit a bit en cualquier máquina con Python 3.10-3.14, lo que facilita la revisión por pares de ejemplos docentes.
- Despliegue en entornos edge o air-gapped: al no requerir GPU ni red, puede embeberse en aulas, laboratorios o plantas con conectividad restringida.

## Benchmarks y rendimiento

Los únicos datos disponibles son los declarados por el autor en el `model-index`. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

| Tarea | Dataset | Métrica | Valor | Verificado |
|---|---|---|---|---|
| Question answering (ingeniería industrial y cadena de suministro) | Golden answers (644 preguntas documentadas, Windows + Linux, Python 3.10-3.14) | Accuracy (idéntico en cada plataforma) | 1.0 | No (declarado por el autor) |

## Requisitos de hardware

- VRAM: no requiere GPU; ejecución exclusiva en CPU.
- GPU recomendadas: ninguna; el sistema está diseñado para CPU-only.
- Cabe en cualquier CPU moderna de consumo; no se especifican requisitos mínimos de RAM, aunque al ser un paquete Python puro con SymPy y mpmath el consumo es moderado.
- Opciones de despliegue: instalación vía `pip install industrial-engineering-ai999x` o desde el wheel del repositorio; aplicación de escritorio y CLI oficiales; ejecución en navegador a través del sitio del autor. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, coherente con su naturaleza no generativa.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables de la misma categoría (motores simbólicos deterministas para ingeniería industrial) en la documentación facilitada. A modo de referencia categórica, se compara con alternativas genéricas de resolución de problemas STEM, sin datos de rendimiento verificables para este modelo más allá del 1.0 declarado sobre su propio conjunto de 644 preguntas.

| Modelo | Tipo | Parámetros | Contexto | Licencia | Enfoque |
|---|---|---|---|---|---|
| industrial-engineering-ai999x | Neuro-simbólico determinista | 4.715.520 | no disponible | Apache-2.0 | 94 capacidades certificadas, rechazo ante incertidumbre |
| LLM generativos de propósito general (p. ej. familia Llama, Mistral) | Transformer generativo | miles de millones | decenas de miles de tokens | variable | Generación libre, riesgo de alucinación |
| Librerías de cálculo simbólico (SymPy, SciPy) | Simbólico/numerico | no aplica | no aplica | BSD | Requieren construir el modelo del problema manualmente |

## Limitaciones y advertencias

- Cobertura cerrada: solo resuelve las 94 capacidades certificadas; cualquier problema fuera de ese conjunto devuelve OUT_OF_SCOPE y no se resuelve.
- Idioma: únicamente inglés; las formulaciones en castellano no están soportadas por el intérprete de reglas.
- No es un modelo conversacional: no mantiene contexto multi-turno ni razona sobre preguntas abiertas.
- El benchmark declarado (accuracy 1.0 sobre 644 preguntas) no está verificado de forma independiente y procede del propio autor sobre un conjunto propio, por lo que no es comparable a evaluaciones estándar.
- Riesgo de alucinación bajo por diseño, pero el riesgo se traslada al intérprete: una pregunta mal interpretada puede mapearse a una capacidad incorrecta; el sistema mitiga esto con los estados AMBIGUOUS y UNRECOGNIZED_FORMAT.
- Licencia Apache-2.0 permite uso comercial, pero conviene revisar el archivo LICENSE del repositorio para confirmar condiciones de atribución.
- El repositorio figura con 0 descargas y 0 likes en el momento de la consulta: madurez y adopción comunitaria aún no demostradas.
- El campo `inference: false` en la model card indica que no está pensado para el pipeline de inferencia estándar de HuggingFace; debe usarse como librería Python.
- No se documentan sesgos sociales ni de dominio más allá de los derivados de las fórmulas y supuestos clásicos de la ingeniería industrial (demanda estacionaria, procesos estables, etc.).

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/AI999X/industrial-engineering-ai999x
- Organización AI999X en HuggingFace: https://huggingface.co/AI999X
- Aplicación de escritorio y CLI: https://www.ai999x.com/desktop-cli/
- Ejecución en navegador: https://www.ai999x.com/models/industrial-engineering-ai999x/#try
- Paquete PyPI: https://pypi.org/project/industrial-engineering-ai999x/
- Guías (docs): https://huggingface.co/AI999X/industrial-engineering-ai999x/tree/main/docs
- Evaluación: https://huggingface.co/AI999X/industrial-engineering-ai999x/tree/main/evaluation
- Sitio web: https://ai999x.com
- Apoyo al desarrollo: https://buymeacoffee.com/ibnuljaiffarabi
