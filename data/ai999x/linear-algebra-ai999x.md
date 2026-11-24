# AI999X/linear-algebra-ai999x

## Resumen

Linear Algebra (linear-algebra-ai999x) es un motor de cálculo numérico determinista empaquetado como artefacto compatible con el ecosistema de Hugging Face. Lo desarrolla AI999X y no es un modelo de lenguaje neuronal: es un motor compilado (Rust, con enlace a Python) que resuelve 89 cálculos de álgebra lineal y métodos numéricos organizados en 13 temas, devolviendo para cada uno la fórmula, los pasos intermedios y las unidades. Cubre vectores, matrices, determinantes, sistemas lineales, valores propios, descomposiciones (LU, QR, SVD), mínimos cuadrados, matrices dispersas y métodos numéricos como búsqueda de raíces, interpolación y cuadratura.

El problema que resuelve es la fiabilidad en la resolución de ejercicios y cálculos de álgebra lineal: en lugar de generar una respuesta probable, ejecuta un algoritmo numérico y devuelve el resultado exacto junto a la traza de pasos. Cuando una entrada falta o está fuera de rango, el motor devuelve una explicación en lenguaje natural en vez de un número inventado, lo que el autor comercializa como "zero-hallucination".

Es relevante para desarrolladores e investigadores que necesitan un componente verificable y offline para pipelines educativos, herramientas de cálculo o validación de resultados, sin depender de una API en la nube. Se distribuye como aplicación de escritorio (Windows y Linux), CLI, versión web y paquete de Python. El repositorio declara 4.715.520 parámetros en safetensors, un dato que no se corresponde con la naturaleza no neuronal del motor y que debe interpretarse con cautela.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Motor de cálculo numérico compilado (Rust) con enlace a Python; no es un transformer ni una red neuronal |
| Parametros totales | 4.715.520 (declarados en safetensors; ver advertencias) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no aplica: no es un modelo de lenguaje) |
| Tipos de cuantizacion | no disponible (no aplica) |
| Idiomas soportados | en |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (declarado); distribución principal como binarios compilados y paquete pip |

## Arquitectura y entrenamiento

No hay arquitectura neuronal ni fase de entrenamiento. El motor es un conjunto de rutinas numéricas compiladas en Rust que implementan 89 cálculos en 13 temas: álgebra matricial básica, determinantes, inversas, sistemas lineales, descomposiciones LU y QR (Householder), SVD, mínimos cuadrados, valores y vectores propios, número de condición, matrices dispersas y métodos numéricos (Newton para raíces, interpolación, cuadratura, ecuación de Poisson 1-D por diferencias finitas). Cada cálculo expone su fórmula, los pasos intermedios y las unidades del resultado.

La innovación destacable no es algorítmica sino de ingeniería y de contrato de salida: determinismo entre plataformas (el autor declara resultados idénticos en Windows y Linux con Python 3.10 a 3.14), ejecución completamente offline, y manejo explícito de entradas inválidas devolviendo una razón en lenguaje natural en lugar de un valor. No se documentan datos de entrenamiento, RLHF ni DPO porque no aplican.

## Capacidades

- Cálculo de determinantes, inversas y sistemas lineales con traza de pasos.
- Descomposiciones matriciales: LU, QR (Householder) y SVD.
- Valores y vectores propios de matrices de pequeño tamaño (p. ej. 2x2 documentado).
- Mínimos cuadrados y ajuste de recta de regresión.
- Número de condición de una matriz.
- Tratamiento de matrices dispersas.
- Métodos numéricos: búsqueda de raíces (Newton), interpolación y cuadratura.
- Ecuación de Poisson 1-D por diferencias finitas.
- Salida con fórmula, pasos y unidades; explicación textual ante entradas ausentes o fuera de rango.
- Ejecución offline y determinista; cuatro interfaces: escritorio, CLI, navegador y Python.
- No soporta tool calling, agentes, razonamiento multi-turno ni generación de texto libre: no es un LLM.

## Casos de uso

- Corrección automática de ejercicios de álgebra lineal: el motor devuelve el resultado exacto y los pasos, de modo que un sistema de evaluación puede comparar la traza del alumno con la del motor sin riesgo de respuestas inventadas.
- Generación de material didáctico: producción de enunciados resueltos con fórmula, pasos y unidades para determinantes, sistemas y descomposiciones, exportables desde la CLI o el paquete de Python.
- Validación de implementaciones numéricas propias: usar el motor como referencia determinista para comprobar los resultados de una librería de álgebra lineal en desarrollo, aprovechando la paridad declarada entre plataformas.
- Herramienta de escritorio para estudiantes e ingenieros sin conexión: la app de Windows y Linux permite resolver cálculos en entornos sin red, con escenas y gráficas generadas a partir del resultado calculado.
- Integración en pipelines de Python: `pip install linear-algebra-ai999x` permite invocar los 89 cálculos desde scripts de análisis de datos, con la misma respuesta en Windows y Linux (x86-64) y una build Python pura en macOS y ARM.
- Preprocesado numérico en flujos de cálculo científico: resolución de sistemas, mínimos cuadrados y SVD como paso previo determinista antes de un modelo estadístico, sin dependencia de servicios externos.
- Soporte en docencia asistida por ordenador: el comportamiento ante entradas inválidas (devolver una razón en vez de un número) encaja en tutores automáticos que deben explicar por qué un problema está mal planteado.

## Benchmarks y rendimiento

Datos declarados por el autor en el model-index (no verificados de forma independiente):

| Tarea | Dataset | Metrica | Valor |
|---|---|---|---|
| Question answering de algebra lineal | Golden answers (399 preguntas documentadas, Windows + Linux, Python 3.10-3.14) | Accuracy | 1.0 ("identical on every platform") |

No se han publicado otros resultados de benchmarks (MMLU, HumanEval, GSM8K u otros) en la informacion disponible, y no serian aplicables a un motor no neuronal.

## Requisitos de hardware

- VRAM: no aplica. El motor no ejecuta inferencia sobre GPU; el cálculo corre en CPU.
- GPU recomendadas: ninguna. No requiere aceleración gráfica.
- Consumer GPU: irrelevante; funciona en cualquier CPU x86-64 con Windows o Linux, y en macOS y ARM mediante la build Python pura.
- Despliegue: aplicación de escritorio (Windows, Linux), CLI `linear-algebra`, versión web en el navegador y paquete de Python 3.10+ (`pip install linear-algebra-ai999x`). No se soportan vLLM, llama.cpp, Ollama ni TGI porque no es un modelo de lenguaje.
- Latencia y throughput: no disponibles en la información proporcionada. Al ser rutinas numéricas compiladas sobre matrices de pequeño tamaño, la latencia esperada es de orden de microsegundos a milisegundos, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Herramienta | Tipo | Cobertura | Determinismo | Licencia | Distribución |
|---|---|---|---|---|---|
| linear-algebra-ai999x | Motor numérico + pasos | 89 cálculos en 13 temas | Declarado entre plataformas | Apache-2.0 | Escritorio, CLI, web, Python |
| NumPy / SciPy | Librería numérica | Amplia, sin traza de pasos didáctica | Depende de BLAS y plataforma | BSD | Python |
| SymPy | Álgebra simbólica | Cálculo exacto y simbólico | Determinista | BSD | Python |
| Wolfram Alpha | Servicio en la nube | Muy amplia, con pasos | No determinista entre versiones | Propietaria | API/web |

La comparación con modelos de lenguaje de la misma categoría (question-answering) no es pertinente: el artefacto se etiqueta como `question-answering` en el Hub, pero no genera lenguaje. Frente a NumPy y SciPy, su diferenciador es la traza de pasos y el contrato de salida ante errores; frente a SymPy, no ofrece cálculo simbólico exacto; frente a Wolfram Alpha, funciona offline y es de código abierto.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no genera texto libre, no mantiene conversaciones y no soporta tool calling ni razonamiento multi-step en el sentido de un LLM.
- Solo soporta inglés (`en`); no hay interfaz ni salidas en castellano.
- El recuento de 4.715.520 parámetros en safetensors no encaja con un motor numérico no neuronal; trátese como un dato declarado sin verificación independiente.
- El benchmark de accuracy 1.0 procede de un conjunto de 399 preguntas definido por el propio autor y marcado como no verificado (`verified: false`); no es una evaluación externa.
- La paridad entre plataformas se declara para Windows y Linux con Python 3.10-3.14; en macOS y ARM se usa una build Python pura, lo que puede afectar al rendimiento aunque el autor afirma que las respuestas son iguales.
- El alcance está acotado a matrices de pequeño tamaño y a los 89 cálculos documentados; no es una librería de álgebra lineal de propósito general para matrices grandes o dispersas a escala industrial.
- Licencia Apache-2.0: permite uso comercial, pero conviene revisar el fichero LICENSE del repositorio por si hubiera condiciones adicionales.
- El tamaño del repositorio se declara como 0.0 GB, lo que sugiere que los binarios se distribuyen fuera del Hub (GitHub Releases); verificar la procedencia antes de desplegar en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/AI999X/linear-algebra-ai999x
- Página del modelo con demo en navegador: https://www.ai999x.com/models/linear-algebra-ai999x/
- Repositorio de escritorio y CLI: https://github.com/AI999X/ai999x-desktop
- Release v1.6.7 (Windows): https://github.com/AI999X/ai999x-desktop/releases/download/v1.6.7/ai999x-linear-algebra-1.6.7-windows-x86_64.zip
- Release v1.6.7 (Linux): https://github.com/AI999X/ai999x-desktop/releases/download/v1.6.7/ai999x-linear-algebra-1.6.7-linux-x86_64.tar.gz
- CLI Windows: https://github.com/AI999X/ai999x-desktop/releases/download/v1.6.7/ai999x-cli-1.6.7-windows-x86_64.zip
- CLI Linux: https://github.com/AI999X/ai999x-desktop/releases/download/v1.6.7/ai999x-cli-1.6.7-linux-x86_64.tar.gz
- Clip de demostración (MP4): https://www.ai999x.com/?ax_shot=linear-algebra-ai999x/clip.mp4
