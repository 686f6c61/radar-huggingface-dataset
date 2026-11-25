# AI999X/classical-physics-ai999x

## Resumen

classical-physics-ai999x es un motor de cálculo determinista para física clásica empaquetado y distribuido a través de Hugging Face por el autor AI999X. No es un modelo de lenguaje neuronal: es un motor compilado (Rust en las plataformas soportadas nativamente, con build en Python puro para el resto) que resuelve 162 cálculos repartidos en 37 temas de física clásica, cada uno con su fórmula, sus pasos intermedios y sus unidades. Se distribuye como aplicación de escritorio, herramienta de línea de comandos, aplicación web y paquete de Python.

El modelo declara el pipeline `question-answering` y el idioma inglés, y su propuesta de valor es la ausencia de alucinación por construcción: al no generar texto libre sino ejecutar cálculos simbólicos y numéricos, la respuesta es reproducible e idéntica en cada plataforma. Cuando falta una entrada o está fuera de rango, el motor devuelve una explicación en lenguaje natural en lugar de un número inventado.

Es relevante para desarrolladores que necesitan un componente de resolución de problemas de física con resultados verificables, sin dependencia de red y con licencia Apache 2.0, en contextos educativos, de tutoría automatizada o de validación de pipelines de cálculo científico. El repositorio ocupa 0,0 GB y no contiene pesos en el sentido habitual (safetensors, GGUF), sino artefactos de distribución del motor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Motor de cálculo determinista (Rust compilado; build Python puro en plataformas no x86-64), no es un transformer |
| Parametros totales | no disponible (no aplica; no hay pesos neuronales) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no aplica; no hay ventana de contexto) |
| Tipos de cuantizacion | no disponible (no aplica) |
| Idiomas soportados | en |
| Licencia | apache-2.0 |
| Formato de pesos | no disponible; se distribuye como binarios de escritorio y CLI (ZIP/TAR.GZ), paquete pip y build web |

## Arquitectura y entrenamiento

No hay arquitectura neuronal ni entrenamiento en el sentido convencional. El sistema es un motor de reglas y fórmulas físicas: 162 cálculos agrupados en 37 temas que cubren cinemática, dinámica, energía, momento, rotación, gravitación, oscilaciones, ondas y sonido, óptica, termodinámica, electricidad y magnetismo. Cada cálculo incluye su fórmula, la secuencia de pasos y las unidades, y el motor genera escenas y gráficas a partir del resultado calculado. La implementación nativa está en Rust y se distribuye como binario para Windows y Linux x86-64; en macOS y ARM se instala una build de Python puro que produce las mismas respuestas.

No se documenta en la información disponible ningún proceso de RLHF, DPO ni dataset de entrenamiento, porque no existe fase de entrenamiento. La innovación técnica destacable es la política de "cero alucinación": ante entradas ausentes o fuera de rango, el motor devuelve una razón en lenguaje natural en lugar de un valor numérico, y los resultados son idénticos entre plataformas y versiones de Python 3.10 a 3.14.

## Capacidades

- Resolución de 162 cálculos de física clásica en 37 temas, con fórmula, pasos y unidades.
- Cobertura de cinemática, dinámica, energía, momento, rotación, gravitación, oscilaciones, ondas y sonido, óptica, termodinámica, electricidad y magnetismo.
- Generación de escenas y gráficas a partir del resultado calculado en la aplicación de escritorio.
- Modo de respuesta explicativa cuando falta una entrada o está fuera de rango, en lugar de devolver un número.
- Ejecución totalmente offline en el equipo del usuario.
- Cuatro interfaces: aplicación de escritorio (Windows, Linux), CLI `classical-physics`, aplicación web y paquete de Python (`pip install classical-physics-ai999x`).
- Resultados deterministas e idénticos entre plataformas y versiones de Python 3.10 a 3.14.
- No soporta tool calling genérico, agentes multi-paso, visión, audio ni modo thinking; sus capacidades son las del catálogo cerrado de cálculos.

## Casos de uso

- Tutoría de física en entornos educativos: el motor devuelve la fórmula, los pasos y las unidades de cada cálculo, lo que permite mostrar al estudiante el desarrollo completo de un problema de cinemática o dinámica sin riesgo de respuestas inventadas.
- Corrección automática de ejercicios: al ser determinista y devolver siempre el mismo resultado para las mismas entradas, se puede usar como oráculo de referencia en un sistema de calificación de problemas de física.
- Generación de material didáctico: las escenas y gráficas que dibuja la aplicación de escritorio a partir del resultado calculado sirven para producir ilustraciones de problemas de energía, oscilaciones u óptica.
- Integración en pipelines de Python: mediante `pip install classical-physics-ai999x` se puede invocar el motor desde scripts de cálculo, notebooks o servicios backend para resolver cálculos de electricidad, termodinámica o gravitación de forma reproducible.
- Validación de resultados de otros sistemas: al no alucinar y devolver una razón cuando una entrada está fuera de rango, sirve como comprobador de salidas generadas por modelos de lenguaje en dominios de física clásica.
- Herramienta de escritorio para ingeniería y docencia: la aplicación para Windows y Linux permite trabajar offline con cálculos de circuitos, reactancias, momento angular o velocidad de escape sin conexión a red.
- Automatización por línea de comandos: la CLI `classical-physics` permite incorporar cálculos de física a scripts de shell y tareas de CI en entornos sin interfaz gráfica.

## Benchmarks y rendimiento

Los datos proceden del `model-index` declarado por el autor y no están verificados de forma independiente (`verified: false`).

| Tarea | Dataset | Metrica | Valor |
|---|---|---|---|
| Question answering de física clásica | Golden answers (1347 preguntas documentadas, Windows + Linux, Python 3.10-3.14) | accuracy | 1,0 (idéntico en cada plataforma) |

No se han publicado otros resultados de benchmarks (MMLU, HumanEval, GSM8K u otros) en la información disponible. El dato de accuracy refleja la coincidencia con el conjunto de respuestas doradas del propio autor, no una evaluación estándar de la comunidad.

## Requisitos de hardware

- VRAM: no aplica; no hay pesos neuronales ni inferencia en GPU.
- GPU recomendadas: no aplica; el motor se ejecuta en CPU.
- Cabe en cualquier equipo de consumo: la aplicación de escritorio y la CLI se distribuyen como binarios para Windows y Linux x86-64, y el paquete de Python funciona en macOS y ARM mediante build de Python puro.
- Despliegue: aplicación de escritorio, CLI `classical-physics`, aplicación web en el navegador y paquete pip `classical-physics-ai999x` (Python 3.10+).
- Latencia y throughput: no disponibles en la información proporcionada; al ser un motor de cálculo local sin red, la latencia depende del cálculo concreto y del equipo.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| classical-physics-ai999x | Motor de cálculo determinista de física clásica | no aplica | no aplica | Apache 2.0 | Hugging Face, pip, escritorio, CLI, web |
| Modelos de lenguaje de propósito general (p. ej. familias Llama, Qwen, Mistral) | Transformer generativo | miles de millones | miles de tokens | variable | Hugging Face, APIs |
| Librerías de cálculo simbólico (p. ej. SymPy) | Biblioteca de álgebra simbólica | no aplica | no aplica | BSD | pip |

La comparación con modelos de lenguaje es asimétrica: un LLM puede redactar explicaciones abiertas pero está sujeto a alucinación, mientras que este motor garantiza resultados reproducibles en su catálogo cerrado de 162 cálculos. Frente a una librería simbólica general, la diferencia es la cobertura de temas físicos predefinidos, los pasos y unidades incluidos y las interfaces de escritorio, CLI y web. No se dispone de datos de rendimiento comparables con alternativas en la información proporcionada.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no genera texto libre ni mantiene conversaciones abiertas; solo responde dentro de su catálogo de 162 cálculos.
- Cobertura limitada a física clásica; no cubre física cuántica, relatividad, física de partículas ni dominios fuera de los 37 temas listados.
- Idioma único: inglés; no hay soporte documentado de castellano ni de otros idiomas.
- El resultado de accuracy 1,0 del `model-index` está declarado por el autor y marcado como no verificado; procede de un conjunto de respuestas doradas propio, no de un benchmark independiente.
- La build de Python puro en macOS y ARM puede tener un rendimiento distinto al binario Rust, aunque el autor afirma que las respuestas son idénticas.
- El repositorio ocupa 0,0 GB y no contiene pesos en formatos estándar; la integración requiere instalar binarios o el paquete pip, no cargar un modelo con `transformers`.
- Licencia Apache 2.0: permite uso comercial, pero conviene revisar el archivo LICENSE del repositorio para confirmar las condiciones exactas de los binarios distribuidos.
- Al ser un motor determinista, no maneja entradas ambiguas ni problemas mal especificados más allá de devolver una razón de error; la calidad de la respuesta depende de que las entradas estén dentro de rango.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/AI999X/classical-physics-ai999x
- Página del modelo en el sitio del autor: https://www.ai999x.com/models/classical-physics-ai999x/
- Aplicación de escritorio para Windows: https://github.com/AI999X/ai999x-desktop/releases/download/v1.6.7/ai999x-classical-physics-1.6.7-windows-x86_64.zip
- Aplicación de escritorio para Linux: https://github.com/AI999X/ai999x-desktop/releases/download/v1.6.7/ai999x-classical-physics-1.6.7-linux-x86_64.tar.gz
- CLI para Windows: https://github.com/AI999X/ai999x-desktop/releases/download/v1.6.7/ai999x-cli-1.6.7-windows-x86_64.zip
- CLI para Linux: https://github.com/AI999X/ai999x-desktop/releases/download/v1.6.7/ai999x-cli-1.6.7-linux-x86_64.tar.gz
- Demostración en vídeo: https://www.ai999x.com/?ax_shot=classical-physics-ai999x/clip.mp4
- Repositorio de escritorio: https://github.com/AI999X/ai999x-desktop
