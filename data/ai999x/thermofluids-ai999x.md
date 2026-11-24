# AI999X/thermofluids-ai999x

## Resumen

Thermofluids (thermofluids-ai999x) es un motor de cálculo determinista empaquetado y distribuido a través de Hugging Face por el autor AI999X, orientado a la resolución de problemas de termofluidos: estática y dinámica de fluidos, flujo en tuberías, capas límite, aerodinámica, conducción, convección y radiación, intercambiadores de calor, ciclos termodinámicos, psicrometría y combustión. Cubre 106 cálculos organizados en 22 temas, cada uno con su fórmula, sus pasos intermedios y sus unidades, y devuelve una explicación en lenguaje natural en lugar de un número cuando una entrada falta o está fuera de rango.

A pesar de estar etiquetado en Hugging Face como `question-answering`, no se trata de un transformer generativo: el repositorio declara la librería `thermofluids-ai999x` y un total de 4.715.520 parámetros en formato safetensors, coherente con un motor compilado y no con un modelo de lenguaje neuronal. Se ofrece en cuatro interfaces (aplicación de escritorio para Windows y Linux, línea de comandos, navegador y paquete de Python) y funciona íntegramente en local, sin conexión.

Su relevancia actual reside en la propuesta de "cero alucinación": frente a los modelos de lenguaje generalistas, que pueden inventar magnitudes o unidades en cálculos de ingeniería, este motor produce resultados reproducibles y verificables paso a paso. La model card declara una precisión de 1,0 sobre un conjunto de 1057 preguntas documentadas, con resultados idénticos en Windows y Linux bajo Python 3.10 a 3.14.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Motor de cálculo determinista compilado (librería `thermofluids-ai999x`); no es un transformer |
| Parametros totales | 4.715.520 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no aplica a un motor de cálculo) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | inglés (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (tamaño del repositorio: 0.0 GB) |

## Arquitectura y entrenamiento

La información disponible no describe una arquitectura de red neuronal. El modelo se distribuye como una librería con nombre propio (`thermofluids-ai999x`) y un motor compilado, con implementaciones para Windows y Linux x86-64 y una build en Python puro para macOS y ARM que, según el autor, ofrece las mismas respuestas. El recuento de 4.715.520 parámetros en safetensors corresponde, por tanto, a los artefactos empaquetados del motor y no a pesos de un modelo de lenguaje.

No se documenta ningún proceso de entrenamiento, conjunto de datos, número de tokens, RLHF ni DPO, lo cual es coherente con un sistema basado en fórmulas y solver determinista en lugar de aprendizaje automático. La innovación técnica declarada es la resolución paso a paso con trazabilidad de fórmulas, unidades y explicaciones de error, junto con la ejecución offline y la paridad de resultados entre plataformas.

## Capacidades

- Resolución de 106 cálculos de termofluidos en 22 temas, con fórmula, pasos intermedios y unidades.
- Cobertura temática: estática y dinámica de fluidos, flujo en tuberías, capas límite, aerodinámica, conducción de calor, convección y radiación, intercambiadores de calor, ciclos termodinámicos, psicrometría y combustión.
- Devolución de una razón en lenguaje natural cuando falta una entrada o está fuera de rango, en lugar de un número.
- Generación de escenas y gráficas a partir del resultado calculado en la aplicación de escritorio.
- Cuatro vías de uso: aplicación de escritorio (Windows, Linux), CLI `thermofluids`, navegador y paquete de Python 3.10+.
- Ejecución completamente offline y local.
- Soporte para ayuda con ejercicios y soluciones paso a paso.
- No se documenta soporte de tool calling, agentes, visión, audio ni modo de razonamiento extendido.

## Casos de uso

- Docencia de ingeniería térmica y de fluidos: el motor resuelve ejercicios con fórmula, pasos y unidades, lo que permite al estudiante seguir la derivación y comprobar cada etapa del cálculo.
- Verificación de cálculos de diseño en tuberías: a partir de densidad, velocidad, diámetro y viscosidad se obtiene el número de Reynolds con su procedimiento, útil para clasificar el régimen de flujo antes de dimensionar una instalación.
- Dimensionado de intercambiadores de calor: el cálculo de la diferencia de temperatura media logarítmica (LMTD) con pasos intermedios sirve como comprobación rápida frente a hojas de cálculo propias.
- Análisis de ciclos termodinámicos: el rendimiento térmico del ciclo Otto con aire estándar se calcula de forma reproducible, adecuado para comparativas de ciclos en docencia o anteproyectos.
- Psicrometría en climatización: el cálculo del punto de rocío a partir de temperatura de bulbo seco y humedad relativa permite validar condiciones de confort y riesgo de condensación.
- Aerodinámica preliminar: el coeficiente de sustentación de un perfil delgado simétrico y el coeficiente medio de fricción superficial de una placa plana laminar (Blasius) se obtienen con sus pasos, útiles en fases iniciales de diseño.
- Combustión y flujo compresible: la temperatura adiabática de llama con calor específico constante de productos y la presión de estancamiento isentrópica del aire a partir del número de Mach permiten estimaciones rápidas en motores y toberas.
- Integración en scripts de Python: el paquete `thermofluids-ai999x` permite incorporar los cálculos a pipelines de validación o cuadernos de ingeniería sin dependencia de red.

## Benchmarks y rendimiento

Datos declarados por el autor en el model-index (no verificados de forma independiente):

| Tarea | Conjunto de evaluación | Métrica | Valor |
|---|---|---|---|
| Question answering de termofluidos | Golden answers (1057 preguntas documentadas, Windows y Linux, Python 3.10-3.14) | Accuracy | 1,0 (idéntico en cada plataforma) |

No se han publicado otros resultados de benchmarks (MMLU, HumanEval, GSM8K u otros) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica; el motor se ejecuta en CPU y el repositorio ocupa 0.0 GB.
- GPU recomendadas: no disponible; no se documenta aceleración por GPU.
- Cabe en cualquier GPU consumer y en equipos sin GPU, al ser una carga de CPU.
- Opciones de despliegue: aplicación de escritorio para Windows y Linux, CLI `thermofluids`, versión web en el navegador y paquete de Python (`pip install thermofluids-ai999x`).
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Naturaleza | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| thermofluids-ai999x | Motor de cálculo determinista | 4.715.520 | no aplica | Apache 2.0 | Hugging Face, app de escritorio, CLI, web, pip |
| Modelos de lenguaje generalistas para QA técnico | Transformer generativo | no disponible | no disponible | variable | Hugging Face y APIs |
| Librerías de cálculo de ingeniería (p. ej., solvers de termofluidos) | Código numérico | no aplica | no aplica | variable | Repositorios y paquetes |

No se dispone de datos de benchmarks comparables entre estas alternativas en la información proporcionada.

## Limitaciones y advertencias

- Solo soporta inglés; no hay soporte declarado de castellano ni de otros idiomas.
- La cobertura se limita a 106 cálculos en 22 temas; no es un modelo generativo general y no responde preguntas fuera de ese catálogo.
- La métrica de precisión 1,0 procede del propio autor y está marcada como no verificada (`verified: false`); conviene tratarla con cautela.
- No se documentan sesgos, pero al ser un motor determinista el riesgo relevante es el de fórmulas o rangos de validez mal aplicados, no el de alucinación de texto.
- El paquete instala un motor compilado en Windows y Linux x86-64 y una build en Python puro en macOS y ARM; el rendimiento puede diferir entre ambas.
- Licencia Apache 2.0: permite uso comercial con atribución y sin garantías; conviene revisar el archivo LICENSE del repositorio.
- No se documenta soporte de tool calling, agentes ni integración con frameworks de LLM, lo que limita su uso como componente de un pipeline agéntico.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/AI999X/thermofluids-ai999x
- Página del modelo en el sitio del autor: https://www.ai999x.com/models/thermofluids-ai999x/
- Aplicación de escritorio, Windows: https://github.com/AI999X/ai999x-desktop/releases/download/v1.6.7/ai999x-thermofluids-1.6.7-windows-x86_64.zip
- Aplicación de escritorio, Linux: https://github.com/AI999X/ai999x-desktop/releases/download/v1.6.7/ai999x-thermofluids-1.6.7-linux-x86_64.tar.gz
- CLI, Windows: https://github.com/AI999X/ai999x-desktop/releases/download/v1.6.7/ai999x-cli-1.6.7-windows-x86_64.zip
- CLI, Linux: https://github.com/AI999X/ai999x-desktop/releases/download/v1.6.7/ai999x-cli-1.6.7-linux-x86_64.tar.gz
- Repositorio de escritorio: https://github.com/AI999X/ai999x-desktop
- Demostración en vídeo: https://www.ai999x.com/?ax_shot=thermofluids-ai999x/clip.mp4
