# AI999X/math-foundations-ai999x

## Resumen

Math Foundations (math-foundations-ai999x) es un motor de cálculo matemático determinista empaquetado y distribuido como modelo en Hugging Face por el autor AI999X. No es un modelo de lenguaje neuronal: es un conjunto de 106 cálculos organizados en 34 temas que cubren aritmética, fracciones, porcentajes, ratios, ecuaciones e inecuaciones algebraicas, funciones, exponenciales y logaritmos, trigonometría, precálculo y números complejos. Cada cálculo devuelve su fórmula, sus pasos intermedios, sus unidades y, cuando una entrada falta o está fuera de rango, una razón en lenguaje natural en lugar de un número inventado.

El paquete se presenta en cuatro formatos de uso: aplicación de escritorio para Windows y Linux, interfaz de línea de comandos, versión web y biblioteca de Python (`pip install math-foundations-ai999x`). En sistemas Windows y Linux x86-64 se instala un motor compilado (etiquetado como "rust" en los tags); en macOS y ARM se instala una implementación en Python puro que, según el autor, produce las mismas respuestas. Todo el cómputo ocurre en local, sin llamadas de red, lo que encaja con la etiqueta "offline" y con la afirmación de "zero-hallucination" del autor.

El artefacto declarado en safetensors contiene 4.715.520 parámetros, un orden de magnitud coherente con tablas de coeficientes y metadatos de fórmulas más que con un transformer. El pipeline declarado es `question-answering` y el idioma soportado es únicamente inglés. La licencia es Apache 2.0. Su relevancia actual reside en ofrecer una alternativa verificable y reproducible a los LLM para matemáticas de nivel preuniversitario, donde la alucinación numérica es un problema conocido.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Motor de cálculo determinista empaquetado como artefacto de modelo; no es un transformer neuronal. Componente compilado (tag "rust") en Windows/Linux x86-64 y build en Python puro en macOS/ARM |
| Parametros totales | 4.715.520 (según safetensors del repo) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (no es un modelo generativo con ventana de contexto) |
| Tipos de cuantizacion | No disponible (no aplica; el motor no se distribuye en GGUF ni formatos cuantizados) |
| Idiomas soportados | Inglés (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors en el repo de Hugging Face; distribución funcional vía paquetes de escritorio (ZIP/tar.gz), CLI y wheel de Python |

## Arquitectura y entrenamiento

No hay evidencia de entrenamiento neuronal. El autor describe "one compiled engine" que resuelve 106 cálculos en 34 temas, cada uno con fórmula, pasos y unidades. Los tags incluyen "rust" y "python", lo que sugiere un núcleo compilado con bindings o una implementación paralela en Python puro para plataformas no x86-64. El artefacto safetensors de 4,7 M de parámetros es consistente con un volcado de tablas de constantes, coeficientes y metadatos de fórmulas, no con pesos de atención.

La innovación declarada no es algorítmica en el sentido de los LLM, sino de ingeniería: paridad de respuestas entre plataformas (Windows y Linux, Python 3.10 a 3.14), ejecución totalmente offline y sustitución de resultados por explicaciones cuando la entrada es inválida o está fuera de dominio. No se documentan datos de entrenamiento, RLHF, DPO ni técnicas de decodificación especulativa porque no aplican a este tipo de artefacto.

## Capacidades

- Resolución paso a paso de 106 cálculos en 34 temas: aritmética, fracciones, porcentajes, ratios, ecuaciones lineales y cuadráticas, sistemas de ecuaciones, inecuaciones (incluidas de valor absoluto), polinomios, exponenciales y logaritmos.
- Trigonometría y precálculo: ley de senos con caso ambiguo (SSA), círculo unitario, secciones cónicas (por ejemplo, centro y radio de una circunferencia desde su ecuación general), vectores y distancia entre puntos.
- Aritmética con números complejos y coeficiente de un término en un desarrollo binomial.
- Devolución de fórmula, pasos intermedios y unidades junto al resultado.
- Gestión explícita de entradas ausentes o fuera de rango: devuelve una razón en lenguaje natural en lugar de un número.
- Ejecución offline en local, sin dependencia de red.
- Cuatro interfaces: app de escritorio (Windows/Linux), CLI `math-foundations`, versión web y API de Python.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso abierto, visión, audio ni modo "thinking"; tampoco generación de texto libre.

## Casos de uso

- Tutoría de matemáticas preuniversitarias: la app de escritorio muestra fórmula, pasos y unidades para cada ejercicio, lo que permite al estudiante seguir la resolución sin depender de un LLM que pueda inventar un paso intermedio.
- Verificación automática de ejercicios en plataformas educativas: la CLI `math-foundations` puede invocarse desde scripts de corrección para validar respuestas de álgebra, trigonometría y precálculo con resultado determinista y reproducible.
- Generación de material didáctico con gráficas: las escenas y gráficos del escritorio (raíces de una cuadrática, ley de senos en el caso ambiguo, circunferencia desde su forma general) se dibujan a partir del resultado calculado, útiles para preparar transparencias o apuntes.
- Integración en pipelines de Python para ciencia e ingeniería: `pip install math-foundations-ai999x` permite resolver sistemas de ecuaciones, logaritmos o vectores dentro de notebooks y scripts sin enviar datos a un servicio externo.
- Entornos con requisitos de privacidad o air-gapped: al ejecutarse offline en Windows y Linux, es apto para aulas, laboratorios o dispositivos sin conectividad donde no se puede usar una API de LLM.
- Detección de entradas inválidas en formularios matemáticos: al devolver una razón en lugar de un número cuando la entrada está fuera de rango, sirve como capa de validación en aplicaciones educativas que reciben datos de usuarios.
- Soporte a docentes para preparar soluciones de referencia: el formato paso a paso con unidades facilita generar claves de corrección consistentes entre plataformas (Windows y Linux, Python 3.10-3.14).

## Benchmarks y rendimiento

Los únicos datos disponibles son los declarados por el autor en el model-index. No se han publicado resultados de benchmarks estándar (MMLU, GSM8K, HumanEval) porque el artefacto no es un LLM generativo.

| Tarea | Dataset | Métrica | Valor | Verificado |
|---|---|---|---|---|
| Question answering (math foundations) | Golden answers (681 preguntas documentadas, Windows + Linux, Python 3.10-3.14) | Accuracy | 1.0 ("identical on every platform") | No |

El valor 1.0 corresponde a coincidencia con las 681 respuestas doradas del propio autor; no es una evaluación independiente ni comparable con benchmarks de LLM.

## Requisitos de hardware

- VRAM: no aplica; el motor no requiere GPU.
- CPU: cualquier x86-64 para el build compilado (Windows/Linux); cualquier plataforma con Python 3.10+ para el build en Python puro (macOS, ARM).
- RAM: no disponible en la información proporcionada; por el tamaño del artefacto (repo de 0,0 GB y 4,7 M de parámetros) el consumo esperado es bajo, pero el autor no publica cifras.
- GPU recomendadas: ninguna; no hay soporte CUDA ni ROCm documentado.
- Despliegue: app de escritorio (ZIP Windows, tar.gz Linux), CLI `math-foundations`, versión web en la página del modelo y paquete de Python. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, coherente con que no sea un modelo de lenguaje.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto | Idiomas | Licencia | Enfoque |
|---|---|---|---|---|---|---|
| math-foundations-ai999x | Motor de cálculo determinista | 4.715.520 (artefacto) | No aplica | Inglés | Apache 2.0 | 106 cálculos en 34 temas con pasos y unidades |
| SymPy | Biblioteca CAS en Python | No aplica | No aplica | Multiidioma (API en inglés) | BSD | Álgebra simbólica, cálculo, ecuaciones |
| Wolfram Alpha API | Servicio en la nube | No disponible | No aplica | Multiidioma | Propietaria | Amplio dominio matemático, requiere red |
| LLM de propósito general (p. ej. familia Llama) | Transformer generativo | Miles de millones | Decenas de miles de tokens | Multilingüe | Variable | Razonamiento abierto con riesgo de alucinación numérica |

La comparación con SymPy es la más directa por naturaleza determinista y offline; la diferencia principal es que math-foundations-ai999x ofrece una app de escritorio con escenas y gráficos y una CLI, mientras que SymPy es una biblioteca. Frente a Wolfram Alpha, la ventaja es la ejecución local sin red; la desventaja, un dominio mucho más acotado (34 temas preuniversitarios). Frente a un LLM, la ventaja es la reproducibilidad y la ausencia de alucinación numérica; la desventaja, la falta de lenguaje natural libre y de generalización fuera de los 106 cálculos.

## Limitaciones y advertencias

- Cobertura acotada a 106 cálculos en 34 temas de matemáticas preuniversitarias; no resuelve cálculo diferencial e integral, álgebra lineal avanzada, estadística inferencial ni demostraciones.
- Solo inglés: no hay soporte de castellano ni de otros idiomas en la interfaz ni en las explicaciones.
- No es un modelo generativo: no mantiene conversaciones, no admite contexto multi-turno ni tool calling.
- El benchmark declarado (accuracy 1.0 sobre 681 preguntas) es interno, no verificado y no comparable con evaluaciones independientes; debe interpretarse como prueba de regresión del autor, no como rendimiento general.
- La paridad de respuestas entre el build compilado y el build en Python puro la afirma el autor; no hay verificación externa publicada.
- El campo `inference: false` en la model card indica que el artefacto no está pensado para inferencia estándar en Hugging Face; el uso real pasa por los paquetes de escritorio, CLI o Python.
- Riesgo de alucinación: el autor lo declara nulo por diseño determinista, pero la ausencia de validación independiente impide confirmarlo en todos los casos límite.
- Licencia Apache 2.0: permite uso comercial y modificación con atribución; conviene revisar el archivo LICENSE del repo para condiciones adicionales.
- El repositorio tiene 0,0 GB de tamaño declarado y 339 descargas en el momento de la consulta; la madurez del proyecto y el soporte a largo plazo no están garantizados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/AI999X/math-foundations-ai999x
- Página del modelo en el sitio del autor: https://www.ai999x.com/models/math-foundations-ai999x/
- Clip de demostración (MP4): https://www.ai999x.com/?ax_shot=math-foundations-ai999x/clip.mp4
- App de escritorio Windows: https://github.com/AI999X/ai999x-desktop/releases/download/v1.6.7/ai999x-math-foundations-1.6.7-windows-x86_64.zip
- App de escritorio Linux: https://github.com/AI999X/ai999x-desktop/releases/download/v1.6.7/ai999x-math-foundations-1.6.7-linux-x86_64.tar.gz
- CLI Windows: https://github.com/AI999X/ai999x-desktop/releases/download/v1.6.7/ai999x-cli-1.6.7-windows-x86_64.zip
- CLI Linux: https://github.com/AI999X/ai999x-desktop/releases/download/v1.6.7/ai999x-cli-1.6.7-linux-x86_64.tar.gz
- Repositorio de escritorio: https://github.com/AI999X/ai999x-desktop
- Instalación Python: `pip install math-foundations-ai999x`
