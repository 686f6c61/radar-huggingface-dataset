# AI999X/aerospace-engineering-ai999x

## Resumen

Aerospace Engineering (aerospace-engineering-ai999x) es un motor de cálculo compilado, empaquetado y distribuido con el formato de un modelo de Hugging Face, orientado a la resolución de problemas de ingeniería aeroespacial. Lo desarrolla AI999X y cubre 81 cálculos agrupados en 13 temas: atmósfera estándar, sustentación y resistencia, actuaciones de aeronaves, estabilidad, propulsión y actuaciones de cohetes, toberas y transferencias orbitales. Cada cálculo se presenta con su fórmula, sus pasos y sus unidades, y devuelve una explicación en lenguaje natural cuando falta una entrada o está fuera de rango.

El artefacto no es un transformer generativo: los pesos en safetensors suman 4.715.520 parámetros y la librería declarada es `aerospace-engineering-ai999x`, con `inference: false` en la model card. El modelo se ofrece en cuatro formas de uso —aplicación de escritorio para Windows y Linux, interfaz de línea de comandos, versión web y paquete de Python 3.10+— y toda la ejecución ocurre en local, sin conexión. La propuesta de valor es la reproducibilidad determinista: el autor declara respuestas idénticas en Windows y Linux sobre un conjunto de 375 preguntas documentadas.

Es relevante para quien necesite un solucionador verificable de problemas de aeronáutica y astronáutica con pasos intermedios auditables, en lugar de un modelo de lenguaje expuesto a alucinaciones numéricas. La licencia Apache 2.0 facilita su integración en herramientas docentes y en pipelines internos de ingeniería.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Motor de cálculo compilado (no es un transformer generativo); 81 cálculos en 13 temas |
| Parametros totales | 4.715.520 (safetensors) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors; distribución adicional como binarios de escritorio y CLI (Windows x86-64, Linux x86-64) y paquete de Python |

## Arquitectura y entrenamiento

La model card describe un único motor compilado del que se derivan cuatro interfaces: aplicación de escritorio, CLI `aerospace-engineering`, versión en navegador y paquete `pip install aerospace-engineering-ai999x`. En Windows y Linux x86-64, pip instala el mismo motor compilado; en macOS y ARM instala una implementación en Python puro que, según el autor, produce las mismas respuestas. No se especifica la arquitectura interna del motor ni el stack de compilación más allá de la etiqueta `rust` presente en los tags.

No hay información sobre datos de entrenamiento, número de tokens, composición del corpus ni procesos de RLHF o DPO, lo que es coherente con un sistema determinista basado en fórmulas en lugar de un modelo aprendido. La innovación destacable es la cobertura de 81 cálculos con fórmula, pasos y unidades explícitos, junto con la validación de entradas que devuelve una razón textual cuando un valor falta o está fuera de rango. El autor declara ejecución totalmente offline y ausencia de alucinación como propiedades de diseño.

## Capacidades

- Resolución paso a paso de 81 cálculos de ingeniería aeroespacial en 13 temas, con fórmula, desarrollo y unidades.
- Atmósfera estándar: propiedades a una altitud dada (por ejemplo, cálculo de ISA).
- Flujo compresible: relaciones de choque normal, Mach crítico de un perfil alar, caudal másico ahogado en la garganta de una tobera.
- Actuaciones de aeronaves: sustentación y resistencia, velocidad verdadera a partir de la calibrada, alcance Breguet de un reactor.
- Estabilidad y control: cálculos de estabilidad incluidos en el temario.
- Propulsión y cohetes: actuaciones de propulsión y de cohete, toberas.
- Mecánica orbital: altitud de órbita circular para un periodo dado, transferencias orbitales.
- Teoría del disco actuador: potencia ideal de hover de un rotor (teoría de cantidad de movimiento).
- Validación de entradas con mensaje explicativo cuando un dato falta o está fuera de rango.
- Ejecución offline, sin dependencia de red, en escritorio, CLI, navegador y Python.
- No dispone de tool calling, razonamiento multi-paso abierto, visión, audio ni modo thinking; sus capacidades son las del catálogo cerrado de cálculos.

## Casos de uso

- Docencia de aeronáutica: el alumnado plantea un problema de atmósfera estándar o de choque normal y obtiene fórmula, pasos y unidades, lo que permite revisar el procedimiento y no solo el resultado.
- Verificación de cálculos de actuaciones: introducir velocidad calibrada y altitud para obtener la velocidad verdadera y contrastarla con la hoja de cálculo del equipo, con la ventaja de que el motor devuelve el desarrollo intermedio.
- Pre-dimensionado de misiones orbitales: calcular la altitud de una órbita circular para un periodo objetivo antes de pasar a un propagador de mayor fidelidad.
- Análisis de toberas y propulsión: estimar el caudal másico ahogado en la garganta y las relaciones de choque para comprobar el punto de diseño de una tobera.
- Estimación de alcance en fase conceptual: aplicar el alcance Breguet de un reactor con los parámetros preliminares de una aeronave para acotar el orden de magnitud.
- Automatización en Python: integrar el paquete en scripts de cálculo por lotes para generar tablas de resultados reproducibles en Windows y Linux, útil en informes de ingeniería y en tests de regresión.
- Herramienta de sobremesa para revisión rápida: usar la aplicación de escritorio con escenas y gráficas generadas a partir del resultado para inspeccionar la sensibilidad de una variable moviendo un control deslizante.
- Entorno sin conectividad: desplegar el motor en un portátil de campo o en una red aislada, ya que toda la ejecución es local.

## Benchmarks y rendimiento

| Tarea | Dataset | Métrica | Valor | Verificado |
|---|---|---|---|---|
| Question answering de ingeniería aeroespacial | Golden answers (375 preguntas documentadas, Windows + Linux, Python 3.10-3.14) | Accuracy | 1,0 (idéntico en cada plataforma) | No |

Los datos proceden del model-index declarado por el autor y no están verificados de forma independiente. No se han publicado otros resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el motor no requiere GPU y el tamaño del repositorio es de 0,0 GB.
- GPU recomendadas: no aplica; la ejecución es en CPU.
- Cabe en cualquier equipo de consumo: Windows o Linux x86-64 para los binarios compilados; macOS y ARM mediante la build en Python puro.
- Opciones de despliegue: aplicación de escritorio (Windows, Linux), CLI `aerospace-engineering`, versión web en la página del modelo y paquete de Python 3.10 o superior.
- Latencia y throughput: no disponibles; al tratarse de cálculos deterministas, la latencia vendrá dominada por el arranque del proceso o del intérprete de Python.

## Comparativa con modelos similares

| Modelo | Tipo | Cobertura | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| aerospace-engineering-ai999x | Motor de cálculo determinista | 81 cálculos en 13 temas de aeronáutica y astronáutica | No disponible | Apache 2.0 | Hugging Face, escritorio, CLI, web, Python |
| Modelos de lenguaje de propósito general | Transformer generativo | Amplia, sin garantía de exactitud numérica | Variable | Variable | Hugging Face y APIs |
| Librerías de cálculo aeroespacial en Python | Código fuente de fórmulas | Depende de la librería | No aplica | Variable | PyPI, GitHub |

No se dispone de datos de benchmarks comparativos con alternativas concretas en la información proporcionada.

## Limitaciones y advertencias

- Catálogo cerrado: solo resuelve los 81 cálculos documentados; cualquier problema fuera de ese conjunto queda sin cubrir.
- Idioma: únicamente inglés, tanto en la documentación como en las explicaciones de validación.
- No es un modelo generativo: no redacta texto libre, no mantiene conversaciones abiertas ni razona fuera de sus fórmulas.
- La métrica de accuracy 1,0 procede del propio autor sobre su conjunto de preguntas y no está verificada de forma independiente; no debe interpretarse como validación externa.
- La model card declara `inference: false`; la integración debe hacerse mediante los binarios o el paquete de Python, no como un modelo servible en vLLM, TGI o llama.cpp.
- Las builds para macOS y ARM son de Python puro; el rendimiento puede diferir del motor compilado aunque el autor afirme respuestas idénticas.
- No hay información sobre sesgos, tasas de error en entradas límite ni sobre la validación física de los resultados frente a referencias publicadas.
- Licencia Apache 2.0: permite uso comercial y modificación con atribución y aviso de cambios; conviene revisar el fichero LICENSE del repositorio antes de redistribuir.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/AI999X/aerospace-engineering-ai999x
- Página del modelo en AI999X: https://www.ai999x.com/models/aerospace-engineering-ai999x/
- Capacidades del modelo: https://www.ai999x.com/models/aerospace-engineering-ai999x/#capabilities
- Aplicación de escritorio, Windows: https://github.com/AI999X/ai999x-desktop/releases/download/v1.6.7/ai999x-aerospace-engineering-1.6.7-windows-x86_64.zip
- Aplicación de escritorio, Linux: https://github.com/AI999X/ai999x-desktop/releases/download/v1.6.7/ai999x-aerospace-engineering-1.6.7-linux-x86_64.tar.gz
- CLI, Windows: https://github.com/AI999X/ai999x-desktop/releases/download/v1.6.7/ai999x-cli-1.6.7-windows-x86_64.zip
- CLI, Linux: https://github.com/AI999X/ai999x-desktop/releases/download/v1.6.7/ai999x-cli-1.6.7-linux-x86_64.tar.gz
- Vídeo de demostración: https://www.ai999x.com/?ax_shot=aerospace-engineering-ai999x/clip.mp4
