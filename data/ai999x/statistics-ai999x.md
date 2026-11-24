# AI999X/statistics-ai999x

## Resumen

Statistics (statistics-ai999x) es un motor de cálculo estadístico determinista empaquetado como artefacto compatible con el ecosistema de Hugging Face, publicado por el autor AI999X. No es un modelo de lenguaje neuronal: es un solver compilado (principalmente en Rust, con distribución en Python) que resuelve 112 cálculos estadísticos organizados en 16 temas, cada uno con su fórmula, sus pasos intermedios, sus unidades y una explicación en lenguaje natural cuando una entrada falta o está fuera de rango. Cubre estadística descriptiva, distribuciones de probabilidad, intervalos de confianza, contrastes de hipótesis, regresión y correlación, diseño experimental, control de calidad y fiabilidad.

El paquete se ofrece en cuatro formatos: aplicación de escritorio para Windows y Linux, interfaz de línea de comandos (`statistics`), versión web en el navegador y biblioteca de Python instalable con `pip install statistics-ai999x` (Python 3.10 o superior). Todo se ejecuta en local, sin conexión a red, lo que elimina la variabilidad por servicios externos y el riesgo de alucinación numérica: el resultado es siempre el mismo para la misma entrada, verificado según el autor sobre 625 preguntas documentadas en Windows y Linux con Python 3.10 a 3.14.

Su relevancia práctica radica en que sustituye a un LLM en el nicho de resolución de problemas estadísticos paso a paso, con resultados reproducibles y auditables. El repositorio declara 4.715.520 parámetros en safetensors (un recuento que refleja los pesos del artefacto empaquetado, no una red neuronal entrenada) y una licencia Apache 2.0 que permite uso comercial sin restricciones adicionales. El idioma declarado es exclusivamente inglés.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Motor de cálculo determinista compilado (Rust con build Python); no es un transformer ni una red neuronal entrenada |
| Parametros totales | 4.715.520 (según safetensors del repositorio) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (no es un modelo generativo con contexto) |
| Tipos de cuantizacion | No aplica; el artefacto se distribuye como binario compilado y wheel de Python, no como pesos cuantizables |
| Idiomas soportados | Inglés (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors en el repo; distribución efectiva como binarios (Windows x86-64, Linux x86-64), build Python puro para macOS y ARM, y versión web |
| Pipeline declarado | question-answering |
| Librería | statistics-ai999x |
| Cobertura funcional | 112 cálculos en 16 temas |
| Plataformas | Windows y Linux (x86-64) con motor compilado; macOS/ARM con build Python puro |
| Versión referenciada | 1.6.7 (desktop y CLI) |
| Inferencia remota | No (`inference: false`) |

## Arquitectura y entrenamiento

No hay un modelo neuronal entrenado en el sentido habitual. El artefacto es un motor de cálculo determinista que implementa fórmulas estadísticas cerradas y procedimientos numéricos (por ejemplo, t-test de una muestra, intervalos t para la media, ANOVA de un factor, test exacto de Fisher 2x2, valor crítico de chi-cuadrado, fiabilidad de Weibull con tasa de fallo y MTTF, probabilidad normal acumulada). Cada capacidad devuelve el resultado junto con los pasos intermedios, las unidades y, cuando procede, una escena gráfica y diagramas generados a partir del propio cálculo.

El autor declara que el motor está compilado y es idéntico en Windows y Linux, con paridad funcional en macOS y ARM mediante una build de Python puro que produce las mismas respuestas. No se documenta en la información disponible ningún proceso de entrenamiento con tokens, dataset de preentrenamiento, RLHF ni DPO, lo cual es coherente con la naturaleza determinista del artefacto. La innovación destacable no es algorítmica en el sentido de atención o decodificación especulativa, sino de ingeniería: un único motor compilado expuesto por cuatro interfaces (escritorio, CLI, navegador, Python) con comportamiento reproducible entre plataformas y explicaciones en lenguaje natural ante entradas inválidas.

## Capacidades

- Resolución de 112 cálculos estadísticos en 16 temas: descriptiva, distribuciones de probabilidad, intervalos de confianza, contrastes de hipótesis, regresión y correlación, diseño experimental, control de calidad y fiabilidad.
- Salida paso a paso con fórmula, sustitución de valores, resultado y unidades.
- Gestión explícita de errores de entrada: cuando falta un dato o está fuera de rango, devuelve una razón en lenguaje natural en lugar de un número.
- Generación de escenas y gráficos derivados del cálculo (por ejemplo, curva t, región de rechazo, densidad de Weibull).
- Ejecución 100 % offline en local, sin llamadas a servicios externos.
- Cuatro interfaces: aplicación de escritorio (Windows, Linux), CLI `statistics`, versión web y biblioteca Python (`pip install statistics-ai999x`).
- Paridad de resultados entre plataformas (Windows, Linux, macOS/ARM vía build Python puro).
- No soporta tool calling, function calling, agentes, razonamiento multi-turno ni otras capacidades propias de un LLM; tampoco visión, audio ni modo thinking.
- Capacidad multilingüe: únicamente inglés.

## Casos de uso

- Docencia de estadística: el motor devuelve el procedimiento completo con fórmula y pasos, lo que permite al estudiante seguir la resolución de un t-test o un ANOVA sin depender de un LLM que pueda inventar cifras intermedias.
- Verificación de resultados en pipelines de análisis: integrado como biblioteca Python, sirve para contrastar de forma determinista los valores que producen otras herramientas (SciPy, statsmodels) en tests de regresión numérica dentro de CI.
- Control de calidad industrial: los cálculos de fiabilidad (Weibull, tasa de fallo, MTTF) y de control de calidad permiten estimar vida útil y comportamiento de lotes en entornos de fabricación, ejecutándose en local sin exponer datos de producción.
- Diseño experimental en investigación: cálculo de tamaños muestrales, ANOVA de un factor y contrastes no paramétricos para planificar y analizar ensayos, con resultados auditables y reproducibles entre plataformas.
- Herramienta de escritorio para analistas sin entorno de programación: la app de Windows y Linux ofrece una interfaz gráfica con escenas interactivas para ejecutar contrastes y ver la distribución implicada sin escribir código.
- Uso en entornos air-gapped o regulados: al no requerir red ni servicios externos, encaja en laboratorios, plantas o instituciones donde no se permite enviar datos a la nube.
- Automatización por CLI en scripts de validación: el binario `statistics` permite invocar cálculos desde shell en tareas de verificación batch con salida estable.

## Benchmarks y rendimiento

| Tarea | Dataset | Métrica | Valor | Verificado |
|---|---|---|---|---|
| statistics question answering | Golden answers (625 preguntas documentadas, Windows + Linux, Python 3.10-3.14) | accuracy | 1.0 ("identical on every platform") | No (`verified: false`) |

No se han publicado en la información disponible otros resultados de benchmarks (MMLU, HumanEval, GSM8K u otros) ni comparativas numéricas con herramientas estadísticas de referencia. El único dato declarado por el autor es la coincidencia exacta con el conjunto de 625 respuestas doradas en las plataformas probadas, marcado como no verificado de forma independiente.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica; no es un modelo neuronal y no requiere GPU.
- GPU recomendadas: ninguna; la ejecución es en CPU.
- Cabe en cualquier equipo de consumo: los binarios son ligeros y la build Python puro funciona en macOS y ARM sin aceleración.
- Opciones de despliegue: aplicación de escritorio (Windows/Linux), CLI `statistics`, versión web en el navegador y paquete Python (`pip install statistics-ai999x`). No se soportan vLLM, llama.cpp, Ollama ni TGI porque no hay pesos de red neuronal que servir.
- Latencia y throughput: no disponibles en la información proporcionada; al ser cálculo determinista en CPU, la latencia depende del cálculo concreto y no de un proceso de generación autoregresiva.

## Comparativa con modelos similares

| Criterio | statistics-ai999x | SciPy / statsmodels (Python) | LLM generalista (p. ej. GPT-4o, Llama 3) | Wolfram Alpha / Mathematica |
|---|---|---|---|---|
| Naturaleza | Motor determinista compilado con 4 interfaces | Biblioteca estadística en Python | Modelo generativo | Motor simbólico y de cálculo |
| Cobertura | 112 cálculos en 16 temas | Amplia, requiere programar | Amplia pero no determinista | Muy amplia |
| Reproducibilidad | Idéntica entre plataformas (declarado) | Depende de versión y entorno | Variable (muestreo) | Determinista |
| Riesgo de alucinación | Nulo por diseño | Nulo | Alto en cifras y pasos | Bajo |
| Offline | Sí | Sí | No (salvo despliegue local) | No |
| Licencia | Apache 2.0 | BSD | Varía (propietaria o comunitaria) | Propietaria |
| Interfaz sin código | Sí (app de escritorio y web) | No | Sí (chat) | Sí (web) |
| Idiomas | Inglés | No aplica | Multilingüe | Multilingüe |

## Limitaciones y advertencias

- No es un modelo de lenguaje: no genera texto libre, no mantiene conversaciones y no admite tool calling ni razonamiento multi-turno. Cualquier expectativa de uso como chatbot estadístico conversacional no se cumple.
- Idioma único: solo inglés; no hay soporte declarado de castellano ni de otras lenguas.
- Cobertura acotada a 112 cálculos en 16 temas; procedimientos estadísticos fuera de ese catálogo no están cubiertos.
- El resultado de accuracy 1.0 sobre 625 preguntas está marcado como no verificado (`verified: false`) y procede del propio autor; no hay validación independiente publicada.
- El recuento de 4.715.520 parámetros en safetensors no debe interpretarse como tamaño de una red neuronal entrenada; es un artefacto empaquetado.
- La build Python puro en macOS y ARM se declara equivalente en respuestas, pero no se detalla en la información disponible el nivel de pruebas sobre esas plataformas.
- Licencia Apache 2.0: permite uso comercial y modificación con atribución; no se documentan restricciones adicionales, aunque conviene revisar el archivo LICENSE del repositorio.
- Al ser determinista, no incorpora incertidumbre epistémica ni detecta supuestos estadísticos mal aplicados más allá de validaciones de rango de entrada; la interpretación del contraste sigue siendo responsabilidad del usuario.
- No se publican métricas de latencia ni de rendimiento por cálculo, lo que dificulta planificar su uso en pipelines de alta frecuencia.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/AI999X/statistics-ai999x
- Página del modelo y demo web: https://www.ai999x.com/models/statistics-ai999x/
- Capacidades interactivas: https://www.ai999x.com/models/statistics-ai999x/#capabilities
- Clip de demostración (MP4): https://www.ai999x.com/?ax_shot=statistics-ai999x/clip.mp4
- Releases de escritorio y CLI (v1.6.7): https://github.com/AI999X/ai999x-desktop/releases/download/v1.6.7/
- Repositorio de escritorio: https://github.com/AI999X/ai999x-desktop
- Instalación Python: `pip install statistics-ai999x`
