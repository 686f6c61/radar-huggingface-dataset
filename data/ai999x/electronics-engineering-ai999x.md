# AI999X/electronics-engineering-ai999x

## Resumen

electronics-engineering-ai999x es un motor de resolución de problemas de ingeniería electrónica desarrollado por AI999X, bajo la autoría de Ibnul Jaif Farabi. A pesar de su nombre y de su empaquetado como modelo en Hugging Face, no es un modelo de lenguaje neuronal: es un motor simbólico determinista escrito en Python puro que combina un lector de reglas en inglés con 92 procedimientos certificados de cálculo electrónico. Su objetivo es responder preguntas de electrónica (sesgos de transistores, amplificadores, filtros activos, osciladores, convertidores de datos, fuentes de alimentación) con resultados exactos, verificados y reproducibles, o rechazar la consulta de forma explícita cuando no puede garantizar la respuesta.

El sistema se presenta como "neuro-simbólico", aunque en la práctica el componente neuronal es un parser basado en reglas y el componente simbólico son las capacidades certificadas que resuelven cada problema con SymPy y mpmath. La propuesta de valor es la ausencia total de alucinación por diseño: siete estados de salida posibles (SOLVED, NEEDS_INPUT, AMBIGUOUS, INVALID_INPUT, OUT_OF_SCOPE, UNRECOGNIZED_FORMAT, INTERNAL_ERROR) y la garantía de que las 561 respuestas documentadas se reproducen de forma idéntica en Windows y Linux sobre Python 3.10 a 3.14.

Es relevante ahora por su orientación a entornos educativos y de borde: funciona íntegramente en CPU, sin GPU, sin red y sin clave de API, lo que lo hace adecuado para tutoría offline, verificación de deberes y aplicaciones EdTech donde la exactitud es más importante que la fluidez conversacional. El repositorio ocupa 0.0 GB y los pesos en safetensors suman 4.715.520 parámetros, un tamaño propio de un clasificador o embedder pequeño, no de un LLM generativo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Motor simbólico determinista en Python puro (parser de reglas + 92 capacidades certificadas con SymPy/mpmath); no es un transformer |
| Parametros totales | 4.715.520 (según safetensors) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (no es un modelo de contexto; procesa preguntas documentadas y llamadas tipadas) |
| Tipos de cuantizacion | No disponible (no aplica; se distribuye como paquete Python y pesos ONNX/safetensors) |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors y ONNX; distribución principal como wheel de Python (`electronics_engineering_ai999x-1.0.0-py3-none-any.whl`) |

## Arquitectura y entrenamiento

La arquitectura no es neuronal en el sentido habitual. El sistema se compone de dos capas: un lector de preguntas en inglés basado en reglas que identifica la capacidad adecuada entre las 92 certificadas, y un motor simbólico que ejecuta el procedimiento correspondiente con aritmética de precisión arbitraria (SymPy, mpmath). Cada resultado se verifica antes de devolverse mediante sustitución inversa, comprobación dimensional o comparación con un cálculo independiente. No hay entrenamiento con descenso de gradiente, ni RLHF, ni DPO: el conocimiento está codificado en el "knowledge pack" versión 1.0.0 y en las capacidades certificadas.

La innovación técnica principal es el diseño "zero wrong answers": el sistema prefiere devolver NEEDS_INPUT, AMBIGUOUS u OUT_OF_SCOPE antes que emitir una respuesta no verificada. La salida incluye pasos, fórmulas en LaTeX, unidades, supuestos y el identificador de la capacidad utilizada, lo que facilita la integración en cuadernos, correctores de deberes y aplicaciones de tutoría. El paquete es puro Python (sin dependencias nativas pesadas) y produce resultados idénticos en Windows y Linux, lo que simplifica el despliegue en entornos educativos heterogéneos.

## Capacidades

- Resolución de problemas de electrónica analógica: polarización de BJT (divisor de tensión, base común, emisor común), modelos de pequeña señal, ganancia, impedancias de entrada y salida.
- Análisis de amplificadores: emisor común, colector común, base común, con carga y resistencia de fuente.
- Diseño y análisis de filtros activos: Sallen-Key paso bajo y paso alto, con cálculo de frecuencia central, factor Q y ganancia de pico.
- Osciladores y temporizadores: configuración astable del 555, cálculo de tiempos alto/bajo, periodo y frecuencia.
- Circuitos con diodos y semiconductores: rectificadores, polarización, curvas características.
- Convertidores de datos, temporización y fuentes de alimentación dentro del conjunto de 92 capacidades certificadas.
- Interfaz tipada garantizada: `solve(capability_id, **inputs)` resuelve siempre una tarea soportada con entradas válidas.
- Interfaz en lenguaje natural: `ask()` interpreta formas de pregunta documentadas en inglés.
- Salida explicativa: pasos, LaTeX, unidades, supuestos y capacidad utilizada.
- Rechazo explícito ante incertidumbre (siete estados de salida definidos).
- Ejecución offline en CPU, sin GPU, sin red y sin clave de API.
- No soporta tool calling genérico, agentes multi-paso ni razonamiento abierto fuera de las capacidades certificadas.

## Casos de uso

- Tutoría de electrónica en entornos sin conectividad: el motor se instala como paquete Python y responde preguntas de polarización de BJT o filtros Sallen-Key con pasos y LaTeX, adecuado para aulas con equipos aislados de la red.
- Corrección automática de deberes: la interfaz `solve()` con `capability_id` e inputs tipados permite comparar la respuesta del estudiante con el resultado certificado y detectar errores de unidades o supuestos.
- Generación de material didáctico: las salidas con fórmulas LaTeX y pasos intermedios se pueden insertar directamente en cuadernos Jupyter o apuntes, reduciendo el trabajo manual del docente.
- Verificación cruzada en pipelines de ingeniería: dado un diseño de amplificador o filtro, el motor calcula ganancia, impedancias y frecuencias de forma determinista, útil como comprobación en scripts de validación.
- Aplicaciones EdTech de borde: al ejecutarse en CPU sin red, puede empaquetarse en dispositivos de bajo consumo o entornos con requisitos estrictos de privacidad y sin dependencia de servicios en la nube.
- Asistente de laboratorio offline: consulta rápida de parámetros de temporizadores 555, polarizaciones y respuestas en frecuencia durante prácticas, sin necesidad de conexión.
- Integración en asistentes conversacionales como backend verificable: un LLM externo puede delegar el cálculo electrónico en este motor y limitarse a la parte conversacional, reduciendo el riesgo de alucinación numérica.

## Benchmarks y rendimiento

Datos declarados por el autor en el model-index de la model card (no verificados de forma independiente):

| Tarea | Dataset | Métrica | Valor | Nota |
|---|---|---|---|---|
| Question answering de ingeniería electrónica | Golden answers (561 preguntas documentadas, Windows + Linux, Python 3.10-3.14) | Accuracy | 1.0 | "identical on every platform"; `verified: false` |

No se han publicado otros resultados de benchmarks (MMLU, HumanEval, GSM8K u otros) en la información disponible.

## Requisitos de hardware

- VRAM: no aplica; el motor se ejecuta en CPU y no requiere GPU.
- GPU recomendadas: ninguna; funciona en cualquier CPU x86-64 o ARM con Python 3.10 a 3.14.
- Cabe en cualquier equipo de consumo: el repositorio ocupa 0.0 GB y los pesos suman 4.715.520 parámetros, por lo que el consumo de memoria es mínimo.
- Opciones de despliegue: instalación vía `pip install electronics-engineering-ai999x` o desde el wheel del repositorio; también hay aplicación de escritorio, CLI y ejecución en navegador según la model card.
- Latencia y throughput: no disponibles de forma numérica; al ser cálculo simbólico determinista en CPU, la latencia depende de la capacidad invocada y no del tamaño del modelo.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| electronics-engineering-ai999x | Motor simbólico determinista | 4.715.520 | No aplica | Electrónica con 92 capacidades certificadas, rechazo ante incertidumbre | Apache-2.0 | Hugging Face, PyPI, app de escritorio, CLI |
| LLM generativo de propósito general (p. ej. familia Llama, Mistral, Qwen) | Transformer decoder | Miles de millones | Decenas de miles de tokens | Generación abierta, razonamiento, código | Variables (a menudo permisivas) | Hugging Face, múltiples proveedores |
| SymPy / mpmath como librerías | Álgebra simbólica | No aplica | No aplica | Cálculo simbólico general, sin dominio específico | BSD | PyPI |

La comparación directa con LLM no es homogénea: este motor no genera texto libre ni mantiene conversaciones, pero ofrece exactitud verificable y reproducibilidad que un LLM generativo no garantiza. Frente a SymPy puro, aporta el dominio electrónico empaquetado y el parser de preguntas, a cambio de un alcance limitado a sus 92 capacidades.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no mantiene conversaciones abiertas, no genera texto libre ni razona fuera de las 92 capacidades certificadas.
- Cobertura limitada al dominio de electrónica documentado; preguntas fuera de alcance devuelven OUT_OF_SCOPE.
- Solo admite inglés como idioma de entrada en `ask()`; no hay soporte multilingüe declarado.
- El resultado de accuracy 1.0 procede del propio autor y está marcado como `verified: false`; no hay validación independiente en la información disponible.
- El parser en lenguaje natural acepta únicamente formas de pregunta documentadas; variaciones no previstas pueden devolver UNRECOGNIZED_FORMAT o AMBIGUOUS.
- La licencia Apache-2.0 permite uso comercial, pero conviene revisar el archivo LICENSE del repositorio para confirmar condiciones y atribución.
- El proyecto tiene 0 descargas y 0 likes en el momento de la consulta, lo que implica ausencia de validación por parte de la comunidad.
- La fecha de creación del repositorio (2026-11-01) y la ausencia de métricas independientes aconsejan tratarlo con cautela en producción hasta realizar una evaluación propia sobre el dominio objetivo.
- No sustituye la revisión de un ingeniero en diseños críticos: los supuestos de cada capacidad (modelos de pequeña señal, parámetros ideales) deben validarse contra el caso real.

## Enlaces

- Hugging Face: https://huggingface.co/AI999X/electronics-engineering-ai999x
- Organización en Hugging Face: https://huggingface.co/AI999X
- Aplicación de escritorio y CLI: https://www.ai999x.com/desktop-cli/
- Prueba en navegador: https://www.ai999x.com/models/electronics-engineering-ai999x/#try
- Paquete en PyPI: https://pypi.org/project/electronics-engineering-ai999x/
- Guías en el repositorio: https://huggingface.co/AI999X/electronics-engineering-ai999x/tree/main/docs
- Evaluación en el repositorio: https://huggingface.co/AI999X/electronics-engineering-ai999x/tree/main/evaluation
- Sitio web: https://ai999x.com
- Apoyo al desarrollo: https://buymeacoffee.com/ibnuljaiffarabi
