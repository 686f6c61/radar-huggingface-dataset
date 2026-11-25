# AI999X/power-electronics-ai999x

## Resumen

Power Electronics (power-electronics-ai999x) es un motor de cálculo determinista especializado en electrónica de potencia, publicado por el autor AI999X bajo licencia Apache 2.0. A pesar de estar etiquetado en Hugging Face con el pipeline `question-answering` y de presentarse con el formato de un modelo, no es un modelo de lenguaje neuronal: es un solver compilado que resuelve 79 cálculos organizados en 13 temas de electrónica de potencia (convertidores DC-DC en conducción continua y discontinua, rectificadores y control de fase, inversores y PWM, accionamientos de motor, pérdidas en dispositivos, snubbers, diseño térmico y magnético y convertidores resonantes), devolviendo para cada uno la fórmula, los pasos intermedios y las unidades.

El paquete safetensors asociado contiene 4.715.520 parámetros, un orden de magnitud muy inferior al de cualquier transformer funcional, lo que confirma que se trata de artefactos de un motor de reglas más que de pesos de una red neuronal entrenada. El valor diferencial que declara el autor es la ausencia de alucinación: cuando falta un dato de entrada o está fuera de rango, el motor devuelve una razón en lenguaje natural en lugar de un número inventado.

Se distribuye en cuatro formatos de uso (aplicación de escritorio para Windows y Linux, línea de comandos, versión web y paquete de Python 3.10+) y funciona íntegramente en local y sin conexión. Es relevante para docencia, verificación de cálculos de diseño y como referencia reproducible en pipelines de ingeniería, no como sustituto de un LLM conversacional.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Motor de cálculo determinista compilado (no es un transformer ni una red neuronal); 79 cálculos en 13 temas |
| Parametros totales | 4.715.520 (según safetensors del repo) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no aplica: no es un modelo generativo) |
| Tipos de cuantizacion | no disponible (no aplica) |
| Idiomas soportados | en |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors; distribución adicional como binarios compilados (Windows/Linux x86-64), paquete Python y build pure-Python para macOS/ARM |
| Pipeline declarado | question-answering |
| Librería | power-electronics-ai999x |
| Inferencia | `inference: false` (no se ejecuta con transformers) |
| Descargas / likes | 299 / 1 |
| Fecha de creación / actualización | 2026-11-01 / 2026-11-21 |

## Arquitectura y entrenamiento

No hay información sobre una arquitectura neuronal ni sobre un proceso de entrenamiento con tokens, dataset o RLHF/DPO. La model card describe un único motor compilado que implementa 79 cálculos de electrónica de potencia, cada uno con su fórmula, su desglose de pasos y sus unidades, y que devuelve una explicación cualitativa cuando una entrada falta o está fuera de rango. La misma lógica se empaqueta en cuatro interfaces: aplicación de escritorio (Windows y Linux), CLI `power-electronics`, versión web y paquete `pip install power-electronics-ai999x`. En Windows y Linux x86-64 el paquete instala el motor compilado; en macOS y ARM instala una build pure-Python que, según el autor, produce las mismas respuestas.

La innovación técnica declarada no es algorítmica sino de ingeniería de producto: determinismo entre plataformas (el autor afirma resultados idénticos en Windows y Linux con Python 3.10 a 3.14), ejecución offline sin dependencias de red y representación visual derivada del resultado calculado (escenas y gráficas generadas a partir de la respuesta, no precargadas).

## Capacidades

- Cálculo de convertidores DC-DC en conducción continua y discontinua: buck, boost, buck-boost, Cuk, SEPIC, flyback, forward y bridge.
- Rectificadores y control de fase, incluido el puente trifásico totalmente controlado con tiristores.
- Inversores y modulación PWM, con cálculo de tiempos de dwell en modulación vectorial (space-vector).
- Accionamientos de motor, con soporte declarado para PMSM.
- Pérdidas en conmutación y en dispositivos, snubbers y diseño térmico.
- Diseño magnético, incluida la pérdida en núcleo por la ecuación de Steinmetz.
- Análisis en pequeña señal: función de transferencia control-salida de convertidores DC-DC.
- Cálculo de condensador de bootstrap para driver de puerta de lado alto.
- Etapa de corrección del factor de potencia (boost PFC).
- Resolución paso a paso con fórmula, pasos y unidades, orientada a ayuda de ejercicios y verificación de diseño.
- Respuesta cualitativa razonada cuando falta una entrada o está fuera de rango (comportamiento declarado como zero-hallucination).
- Ejecución offline en local; sin tool calling, sin agentes, sin capacidades multimodales ni modo de razonamiento generativo.

## Casos de uso

- Docencia de electrónica de potencia: el motor resuelve ejercicios de buck, boost, flyback o SEPIC mostrando fórmula, pasos y unidades, lo que permite al estudiante contrastar su desarrollo manual con un resultado reproducible.
- Verificación de cálculos de diseño en mesa de ingeniería: comprobar el ciclo de trabajo, el rizado de corriente o los tiempos de dwell de space-vector antes de fijar valores en el esquemático, con la ventaja de que el motor señala entradas fuera de rango en lugar de devolver un número plausible pero erróneo.
- Automatización de hojas de cálculo de diseño: invocar el paquete de Python desde scripts para generar tablas de dimensionado de inductancias, condensadores y pérdidas en función de barridos de parámetros.
- Integración en pipelines de CI de firmware de control: usar la CLI `power-electronics` para validar que los coeficientes y límites calculados para un lazo de control coinciden con el modelo de pequeña señal esperado.
- Formación interna y onboarding: la aplicación de escritorio con escenas y gráficas vivas sirve como material interactivo para explicar el comportamiento de un convertidor al mover un parámetro de entrada.
- Consulta en entornos sin conectividad o con requisitos de confidencialidad: al ejecutarse offline en Windows, Linux o vía Python, los parámetros de diseño no salen del equipo, algo relevante en entornos industriales o aeroespaciales.
- Soporte a la revisión de apuntes y material didáctico: generar el desglose paso a paso de un cálculo concreto (por ejemplo, pérdida en núcleo por Steinmetz) para incorporarlo a documentación técnica.

## Benchmarks y rendimiento

Los únicos datos disponibles son los declarados por el autor en el model-index, no verificados de forma independiente.

| Tarea | Dataset | Métrica | Valor | Verificado |
|---|---|---|---|---|
| Power electronics question answering | Golden answers (482 preguntas documentadas, Windows + Linux, Python 3.10-3.14) | accuracy | 1.0 ("identical on every platform") | No |

No se han publicado resultados de benchmarks en la información disponible más allá de esta métrica de coincidencia exacta declarada por el autor. No hay datos de latencia ni de throughput.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica en el sentido habitual; el motor no requiere GPU. Al no ser un modelo neuronal, no hay pesos que cargar en memoria de vídeo.
- GPU recomendadas: ninguna. La ejecución es en CPU.
- Cabe en cualquier equipo de consumo: la aplicación de escritorio y la CLI se distribuyen como binarios para Windows y Linux x86-64; el paquete de Python cubre también macOS y ARM mediante una build pure-Python.
- Opciones de despliegue: aplicación de escritorio, CLI `power-electronics`, versión web en la página del modelo y paquete `pip install power-electronics-ai999x`. No se contempla despliegue con vLLM, llama.cpp, Ollama ni TGI, ya que no es un modelo generativo.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

No disponible. No se han identificado en la información proporcionada modelos comparables de la misma categoría (solvers deterministas de electrónica de potencia empaquetados como artefactos de Hugging Face). Las alternativas habituales serían herramientas de simulación como SPICE, PLECS o MATLAB/Simulink, pero no se dispone de datos de comparación directa en esta ficha.

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| power-electronics-ai999x | 4.715.520 (artefacto safetensors) | no aplica | Apache 2.0 | Hugging Face, pip, binarios Windows/Linux |
| Alternativas de la categoría | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- No es un modelo de lenguaje: no genera texto libre, no mantiene conversaciones abiertas ni responde preguntas fuera de los 79 cálculos implementados.
- Cobertura funcional acotada a los 13 temas declarados; cualquier cálculo fuera de ese catálogo no será resuelto.
- Idioma único: inglés. No hay soporte de castellano ni de otros idiomas.
- El resultado "accuracy 1.0" procede del propio autor y no está verificado de forma independiente; debe tomarse como afirmación del publicador, no como evidencia externa.
- El determinismo entre plataformas se declara para Windows y Linux con Python 3.10-3.14; en macOS y ARM se ejecuta una build pure-Python distinta, lo que conviene validar en el caso de uso concreto.
- La licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantías sobre la idoneidad de los resultados para diseño de producción; los cálculos deben contrastarse con simulación y medidas.
- El pipeline declarado (`question-answering`) y el campo `inference: false` pueden inducir a error si se intenta cargar con transformers: el repositorio no está pensado para inferencia con esa librería.
- No hay información sobre sesgos, alucinación en sentido generativo ni comportamiento en dominios limítrofes (electrónica analógica, RF, control digital avanzado).

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/AI999X/power-electronics-ai999x
- Página del producto y demo web: https://www.ai999x.com/models/power-electronics-ai999x/
- Aplicación de escritorio, Windows: https://github.com/AI999X/ai999x-desktop/releases/download/v1.6.7/ai999x-power-electronics-1.6.7-windows-x86_64.zip
- Aplicación de escritorio, Linux: https://github.com/AI999X/ai999x-desktop/releases/download/v1.6.7/ai999x-power-electronics-1.6.7-linux-x86_64.tar.gz
- CLI, Windows: https://github.com/AI999X/ai999x-desktop/releases/download/v1.6.7/ai999x-cli-1.6.7-windows-x86_64.zip
- CLI, Linux: https://github.com/AI999X/ai999x-desktop/releases/download/v1.6.7/ai999x-cli-1.6.7-linux-x86_64.tar.gz
- Vídeo de demostración: https://www.ai999x.com/?ax_shot=power-electronics-ai999x/clip.mp4
