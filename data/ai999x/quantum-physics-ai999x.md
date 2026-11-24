# AI999X/quantum-physics-ai999x

## Resumen

Quantum Physics AI999X (identificador `AI999X/quantum-physics-ai999x`) es un motor de cálculo determinista empaquetado como modelo de question-answering, publicado por el autor AI999X bajo licencia Apache 2.0. No se trata de un transformer generativo: es un motor compilado (en Rust, según las etiquetas del repositorio) que resuelve 76 cálculos de física cuántica distribuidos en 11 temas, cada uno con su fórmula, sus pasos intermedios y sus unidades. El modelo declara 4.715.520 parámetros en formato safetensors y un tamaño de repositorio de 0.0 GB, lo que sugiere que los pesos reales son mínimos o simbólicos y que la lógica reside en el binario compilado.

El modelo aborda el problema de la fiabilidad en la resolución de ejercicios de física: en lugar de generar texto probabilístico, devuelve resultados exactos con trazabilidad de pasos y, cuando falta un dato o está fuera de rango, una explicación en lenguaje natural en vez de un número inventado. Los temas cubiertos incluyen relatividad especial, fotones y ondas de materia, el átomo de hidrógeno, pozos cuánticos y efecto túnel, espín y qubits, puertas cuánticas, física nuclear y de partículas, y física estadística.

Su relevancia actual radica en la propuesta de "zero-hallucination" y ejecución totalmente offline: se distribuye como aplicación de escritorio (Windows y Linux), herramienta de línea de comandos, aplicación web y paquete de Python (`pip install quantum-physics-ai999x`). La model card indica explícitamente `inference: false`, lo que confirma que no está pensado para inferencia mediante las librerías estándar de Hugging Face (transformers, vLLM), sino como un ejecutable autocontenido.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Motor de cálculo determinista compilado (Rust según etiquetas); no es un transformer generativo |
| Parametros totales | 4.715.520 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (no aplica a un motor determinista) |
| Idiomas soportados | Inglés (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (según metadatos del repositorio); distribución principal como binarios compilados y paquete Python |

## Arquitectura y entrenamiento

La información disponible no describe una arquitectura de red neuronal. El modelo se presenta como "un motor compilado" (one compiled engine) con cuatro interfaces de uso: aplicación de escritorio, línea de comandos, navegador y Python. Las etiquetas del repositorio mencionan Rust y Python, lo que apunta a un núcleo de cálculo escrito en Rust con enlaces o envoltorios en Python. En Windows y Linux x86-64, `pip` instala el mismo motor compilado; en otras plataformas (macOS, ARM) instala una versión pura en Python que, según el autor, ofrece las mismas respuestas.

No se dispone de datos sobre volumen de entrenamiento, composición del dataset, ni uso de RLHF o DPO, porque el modelo no parece entrenarse mediante esos procedimientos. La lógica de resolución se basa en fórmulas físicas implementadas explícitamente: 76 cálculos en 11 temas, cada uno con fórmula, pasos y unidades. La validación declarada se realizó contra un conjunto de "Golden answers" de 383 preguntas documentadas, ejecutado en Windows y Linux con Python 3.10 a 3.14.

## Capacidades

- Resolución paso a paso de 76 cálculos de física cuántica en 11 temas, con fórmula, pasos intermedios y unidades.
- Cobertura temática: relatividad especial, fotones y ondas de materia, átomo de hidrógeno, pozos cuánticos y efecto túnel, espín y qubits, puertas cuánticas, estados de Bell, desintegración radiactiva, radiación de cuerpo negro, energía de Fermi, física nuclear y de partículas, y física estadística.
- Gestión explícita de entradas ausentes o fuera de rango: devuelve una razón en lenguaje natural en lugar de un número.
- Ejecución totalmente offline en el equipo del usuario.
- Cuatro interfaces: aplicación de escritorio (Windows, Linux), CLI `quantum-physics`, versión web y paquete de Python 3.10+.
- Visualizaciones generadas a partir del resultado calculado: escenas y gráficas (factor de Lorentz, efecto fotoeléctrico, circuito de dos qubits, transmisión por barrera, coeficientes de Clebsch-Gordan, fórmula semiempírica de masa, dosis absorbida y equivalente, entre otras).
- No se documenta soporte de tool calling, function calling, razonamiento multi-paso generativo ni capacidades multimodales en el sentido de un LLM.

## Casos de uso

- Docencia de física cuántica: el alumnado introduce los parámetros de un ejercicio (por ejemplo, la velocidad relativa para el factor de Lorentz) y obtiene el resultado con pasos y unidades, lo que permite verificar el procedimiento y no solo la respuesta final.
- Corrección automática de problemas: un profesor puede usar el paquete de Python para evaluar respuestas numéricas de estudiantes contra el resultado determinista del motor, eliminando la variabilidad de un LLM generativo.
- Laboratorio docente con visualizaciones: la aplicación de escritorio dibuja escenas y gráficas a partir del resultado calculado (efecto fotoeléctrico, transmisión por barrera), útil para explicar conceptos en clase sin conexión a internet.
- Entornos con requisitos de privacidad o sin red: al ejecutarse offline, encaja en aulas, laboratorios o instalaciones donde no se permite enviar datos a servicios en la nube.
- Integración en scripts y pipelines de cálculo: la CLI `quantum-physics` y el paquete de Python permiten automatizar baterías de cálculos (por ejemplo, energías de transición de Rydberg para varios niveles) y generar tablas de resultados reproducibles.
- Material de autoaprendizaje: la etiqueta `homework-help` y el modo paso a paso lo orientan a estudiantes que necesitan resolver ejercicios de física cuántica con explicación del procedimiento.
- Verificación cruzada de resultados experimentales o simulados: dado que devuelve valores deterministas con unidades, sirve como referencia para contrastar cálculos obtenidos con otras herramientas.

## Benchmarks y rendimiento

Los únicos datos disponibles proceden del `model-index` declarado por el autor, que no han sido verificados de forma independiente (`verified: false`).

| Tarea | Dataset | Métrica | Valor |
|---|---|---|---|
| Question answering de física cuántica | Golden answers (383 preguntas documentadas, Windows + Linux, Python 3.10-3.14) | Accuracy | 1.0 ("identical on every platform") |

No se han publicado otros resultados de benchmarks (MMLU, HumanEval, GSM8K u otros) en la información disponible. El valor 1.0 corresponde a la coincidencia con las respuestas doradas del propio autor sobre su conjunto de 383 preguntas, no a un benchmark estándar de la comunidad.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica; el modelo no requiere GPU para funcionar.
- GPU recomendadas: no aplica; el motor se ejecuta en CPU.
- Compatibilidad con GPU de consumo: irrelevante para su funcionamiento.
- Plataformas soportadas: Windows y Linux x86-64 con binario compilado; macOS y ARM mediante build pura en Python (mismas respuestas según el autor).
- Requisito de Python: 3.10 o superior para el paquete `quantum-physics-ai999x`.
- Opciones de despliegue: aplicación de escritorio, CLI `quantum-physics`, versión web en la página del modelo y paquete de Python. No se documenta despliegue con vLLM, llama.cpp, Ollama ni TGI, coherente con la etiqueta `inference: false`.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la documentación proporcionada. Las alternativas habituales para cálculo físico determinista (SymPy, SciPy, Wolfram Language) no aparecen citadas ni comparadas por el autor, y no hay datos de rendimiento que permitan una comparación rigurosa. Se indica, por tanto, "no disponible".

| Modelo | Parámetros | Contexto | Licencia | Enfoque |
|---|---|---|---|---|
| quantum-physics-ai999x | 4.715.520 (según safetensors) | No disponible | Apache 2.0 | Motor determinista de cálculos de física cuántica |
| Alternativas comparables | No disponible | No disponible | No disponible | No disponible |

## Limitaciones y advertencias

- No es un modelo de lenguaje generativo: no puede mantener conversaciones abiertas ni responder preguntas fuera de los 76 cálculos implementados.
- Cobertura limitada a 11 temas y 76 cálculos concretos; cualquier problema fuera de ese catálogo quedará sin resolver.
- Solo soporta inglés (`en`); no hay soporte documentado de castellano ni de otros idiomas.
- El resultado de accuracy 1.0 está declarado por el autor y marcado como no verificado; se obtuvo sobre su propio conjunto de 383 preguntas doradas, lo que limita su valor como evidencia independiente.
- La etiqueta `inference: false` indica que no está preparado para cargarse con las librerías estándar de Hugging Face; el repositorio funciona principalmente como punto de distribución.
- El tamaño de repositorio de 0.0 GB y la naturaleza determinista del motor plantean dudas sobre qué contienen realmente los pesos safetensors; conviene verificar los artefactos antes de integrarlos en producción.
- Riesgo de alucinación bajo por diseño en los cálculos cubiertos, pero la gestión de entradas inválidas devuelve texto explicativo, no un resultado; los consumidores deben manejar ese caso.
- Licencia Apache 2.0 permite uso comercial, pero no se documentan garantías de exactitud física más allá de la validación interna del autor.
- Sin datos publicados sobre sesgos, latencia, throughput ni comportamiento en plataformas no x86-64 más allá de la mención a la build pura en Python.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/AI999X/quantum-physics-ai999x
- Página del modelo con demo web: https://www.ai999x.com/models/quantum-physics-ai999x/
- Capacidades (anclas de la página del modelo): https://www.ai999x.com/models/quantum-physics-ai999x/#capabilities
- Aplicación de escritorio para Windows: https://github.com/AI999X/ai999x-desktop/releases/download/v1.6.7/ai999x-quantum-physics-1.6.7-windows-x86_64.zip
- Aplicación de escritorio para Linux: https://github.com/AI999X/ai999x-desktop/releases/download/v1.6.7/ai999x-quantum-physics-1.6.7-linux-x86_64.tar.gz
- CLI para Windows: https://github.com/AI999X/ai999x-desktop/releases/download/v1.6.7/ai999x-cli-1.6.7-windows-x86_64.zip
- CLI para Linux: https://github.com/AI999X/ai999x-desktop/releases/download/v1.6.7/ai999x-cli-1.6.7-linux-x86_64.tar.gz
- Repositorio de la aplicación de escritorio: https://github.com/AI999X/ai999x-desktop
- Clip de demostración (MP4): https://www.ai999x.com/?ax_shot=quantum-physics-ai999x/clip.mp4
