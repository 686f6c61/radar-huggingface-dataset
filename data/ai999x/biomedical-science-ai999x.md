# AI999X/biomedical-science-ai999x

## Resumen

`biomedical-science-ai999x` es un motor de cálculo determinista empaquetado y distribuido a través de Hugging Face por el autor AI999X, orientado a la resolución de problemas cuantitativos de ciencias biomédicas. No es un modelo de lenguaje generativo en el sentido habitual: se trata de un solver compilado (escrito en Rust, con bindings en Python) que cubre 96 cálculos organizados en 10 temas, incluyendo farmacocinética, epidemiología, estadística de pruebas diagnósticas, análisis de supervivencia, biomecánica, modelos neuronales y física de imagen médica. Cada cálculo devuelve la fórmula, los pasos intermedios, las unidades y una explicación en lenguaje natural; cuando falta un dato o está fuera de rango, devuelve una razón en lugar de un número.

El modelo se distribuye con 4.715.520 parámetros declarados en safetensors y un tamaño de repositorio de 0,0 GB, lo que sugiere que los pesos son en realidad artefactos del motor compilado más que pesos neuronales convencionales. La licencia es Apache 2.0 y el idioma declarado es únicamente inglés. La pipeline declarada es `question-answering`, aunque la propia model card indica `inference: false`, lo que implica que no se ejecuta mediante la infraestructura de inferencia estándar de Hugging Face.

Su relevancia actual radica en la propuesta de "cero alucinación" y funcionamiento totalmente offline: cuatro modos de uso (aplicación de escritorio para Windows y Linux, línea de comandos, navegador y paquete de Python 3.10+). Está pensado como herramienta de apoyo a la docencia y a la resolución de ejercicios paso a paso, no como asistente clínico.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Motor de cálculo determinista compilado (Rust) con bindings Python; no es un transformer generativo |
| Parametros totales | 4.715.520 (según safetensors) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no aplica: no es un modelo de contexto) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | inglés (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (repo de 0,0 GB); distribución principal vía binarios compilados y paquete pip |

## Arquitectura y entrenamiento

La arquitectura no es un transformer ni un modelo neuronal en el sentido convencional. Según la model card, se trata de "un motor compilado" (`One compiled engine`) escrito en Rust, con una build pura en Python para plataformas no x86-64 (macOS, ARM) que produce las mismas respuestas. El paquete se distribuye como `biomedical-science-ai999x` vía pip, además de binarios de escritorio y CLI para Windows y Linux x86-64 (versión 1.6.7). Los 4.715.520 parámetros declarados en safetensors probablemente corresponden a metadatos o tablas internas del motor, no a pesos de una red neuronal entrenada.

No se dispone de información sobre datos de entrenamiento, número de tokens, composición del dataset, ni procesos de RLHF/DPO, porque el modelo no se entrena con ese paradigma. La "innovación" declarada es el determinismo multiplataforma: la model card afirma que las respuestas son idénticas en Windows y Linux con Python 3.10 a 3.14, y que el motor devuelve pasos, fórmulas, unidades y explicaciones en lugar de solo el resultado numérico. Cubre 96 cálculos en 10 temas, entre ellos modelos compartimentales, SIR, curvas ROC, Kaplan-Meier, Cox, Windkessel, Hodgkin-Huxley, Goldman-Hodgkin-Katz y física de imagen médica (MRI, ultrasonidos, unidades Hounsfield).

## Capacidades

- Resolución paso a paso de 96 cálculos biomédicos en 10 temas, con fórmula, pasos intermedios y unidades.
- Farmacocinética y dosificación: modelo monocompartimental con bolo IV, concentración en función del tiempo, aritmética de dosis líquidas ("desired over have").
- Epidemiología: modelo SIR, tamaño final de la epidemia, fracción de ataque.
- Estadística de pruebas diagnósticas: sensibilidad, especificidad, curvas ROC, odds ratio con intervalo de Woolf (logit) para tablas 2x2.
- Análisis de supervivencia: estimación de Kaplan-Meier en un tiempo dado y mediana de supervivencia, modelo de Cox.
- Biomecánica y fisiología: modelo de Windkessel.
- Neurociencia: modelo de Hodgkin-Huxley y ecuación de voltaje de Goldman-Hodgkin-Katz a partir de concentraciones de K, Na y Cl.
- Física de imagen médica: número CT en unidades Hounsfield, MRI, ultrasonidos (solo cuantitativo, sin consejo clínico).
- Modo "cero alucinación": devuelve una razón en lenguaje natural en lugar de un número cuando falta una entrada o está fuera de rango.
- Cuatro modos de uso: aplicación de escritorio (Windows/Linux), CLI `biomedical-science`, navegador y paquete Python 3.10+.
- Funcionamiento offline: todo se ejecuta en el ordenador del usuario.
- No soporta tool calling, function calling, agentes, razonamiento multi-step generativo, visión, audio ni otras capacidades propias de un LLM.

## Casos de uso

- Docencia de farmacocinética: el alumnado introduce parámetros de un modelo monocompartimental con bolo IV y obtiene la concentración en un tiempo dado con la fórmula y los pasos, lo que permite verificar el procedimiento en lugar de solo el resultado.
- Resolución de ejercicios de epidemiología: cálculo del tamaño final de una epidemia SIR y de la fracción de ataque a partir de R0 y de la fracción susceptible inicial, con la escena y los gráficos generados a partir de la respuesta calculada.
- Interpretación de pruebas diagnósticas en investigación: cálculo de odds ratio con intervalo de confianza de Woolf para tablas 2x2 de exposición-resultado, útil en estudios observacionales.
- Análisis de supervivencia en trabajos académicos: estimación de Kaplan-Meier y mediana de supervivencia a partir de datos censurados, con pasos reproducibles.
- Física médica y formación en imagen: conversión a unidades Hounsfield, cálculos de MRI y ultrasonidos en contextos puramente cuantitativos, sin interpretación clínica.
- Neurofisiología computacional: cálculo del potencial de membrana con la ecuación de Goldman-Hodgkin-Katz y simulación de Hodgkin-Huxley para prácticas de laboratorio.
- Integración en pipelines de corrección automática: el paquete pip permite invocar el motor desde scripts Python para validar respuestas de ejercicios en plataformas de e-learning, con comportamiento determinista en Windows, Linux y (vía build pura) macOS/ARM.
- Verificación de cálculos en biomecánica: modelo de Windkessel para prácticas de fisiología cardiovascular.

## Benchmarks y rendimiento

Los únicos datos disponibles son los declarados por el autor en el `model-index`:

| Benchmark | Dataset | Métrica | Valor | Verificado |
|---|---|---|---|---|
| biomedical science question answering | Golden answers (649 documented questions, Windows + Linux Python 3.10-3.14) | accuracy ("identical on every platform") | 1,0 | No |

No se han publicado otros resultados de benchmarks (MMLU, HumanEval, GSM8K u otros) en la información disponible. El valor 1,0 corresponde a un conjunto de 649 preguntas documentadas por el propio autor y no ha sido verificado de forma independiente.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica; el motor no requiere GPU.
- GPU recomendadas: no aplica; no se usa aceleración por GPU.
- Cabe en cualquier equipo de consumo: el repo pesa 0,0 GB y el motor compilado se distribuye como binario para Windows y Linux x86-64.
- Plataformas soportadas: Windows y Linux x86-64 con binarios compilados; macOS y ARM mediante build pura en Python (mismas respuestas declaradas).
- Opciones de despliegue: aplicación de escritorio, CLI `biomedical-science`, navegador en la página del modelo y paquete `pip install biomedical-science-ai999x` para Python 3.10+.
- No es compatible con vLLM, llama.cpp, Ollama ni TGI, ya que no es un modelo de lenguaje con pesos neuronales.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables de la misma categoría (solvers deterministas de cálculos biomédicos empaquetados como modelos de Hugging Face). Las alternativas habituales serían librerías científicas como SciPy, statsmodels o lifelines, pero no se han proporcionado datos comparativos en la información disponible.

| Modelo | Parámetros | Contexto | Licencia | Enfoque |
|---|---|---|---|---|
| biomedical-science-ai999x | 4.715.520 (safetensors) | no aplica | Apache 2.0 | Motor determinista de 96 cálculos |
| Alternativas | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- No es un modelo de lenguaje: no genera texto libre, no razona sobre lenguaje natural ni mantiene conversaciones. La pipeline `question-answering` es una etiqueta de catálogo, no una capacidad generativa.
- Idioma limitado al inglés; no hay soporte declarado de castellano ni de otros idiomas.
- Solo cubre 96 cálculos en 10 temas; cualquier problema fuera de ese catálogo no se resuelve.
- La model card indica explícitamente que no ofrece consejo clínico: los resultados son cálculos de modelo, no recomendaciones médicas.
- El benchmark declarado (accuracy 1,0 sobre 649 preguntas) procede del propio autor, no está verificado de forma independiente y no es comparable con benchmarks estándar de LLM.
- `inference: false`: no se puede ejecutar mediante la infraestructura de inferencia de Hugging Face; requiere descargar binarios o instalar el paquete pip.
- Riesgo de alucinación declarado como nulo por diseño, pero depende de que las entradas estén dentro de rango; fuera de rango devuelve una razón, no un resultado.
- El tamaño real del repo (0,0 GB) y los 4,7 M de parámetros en safetensors no son representativos de un modelo neuronal; conviene no interpretarlos como tales en comparaciones automáticas.
- Licencia Apache 2.0 permite uso comercial, pero la responsabilidad sobre el uso de los cálculos en contextos clínicos o regulatorios recae en el usuario.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/AI999X/biomedical-science-ai999x
- Página del modelo en el sitio del autor: https://www.ai999x.com/models/biomedical-science-ai999x/
- Sección de capacidades: https://www.ai999x.com/models/biomedical-science-ai999x/#capabilities
- Aplicación de escritorio Windows: https://github.com/AI999X/ai999x-desktop/releases/download/v1.6.7/ai999x-biomedical-science-1.6.7-windows-x86_64.zip
- Aplicación de escritorio Linux: https://github.com/AI999X/ai999x-desktop/releases/download/v1.6.7/ai999x-biomedical-science-1.6.7-linux-x86_64.tar.gz
- CLI Windows: https://github.com/AI999X/ai999x-desktop/releases/download/v1.6.7/ai999x-cli-1.6.7-windows-x86_64.zip
- CLI Linux: https://github.com/AI999X/ai999x-desktop/releases/download/v1.6.7/ai999x-cli-1.6.7-linux-x86_64.tar.gz
- Repositorio de escritorio: https://github.com/AI999X/ai999x-desktop
- Vídeo de demostración: https://www.ai999x.com/?ax_shot=biomedical-science-ai999x/clip.mp4
