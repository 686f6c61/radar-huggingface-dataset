# ManniX-ITA/gemma-4-26B-A4B-agentic

## Resumen

Gemma-4-26B-A4B-agentic es un ajuste fino supervisado (SFT) del modelo multimodal google/gemma-4-26B-A4B-it, desarrollado por el usuario independiente ManniX-ITA. Su objetivo concreto es corregir un fallo de comportamiento del modelo base: en tareas agénticas largas, Gemma-4-26B-A4B-it tiende a entrar en bucles de razonamiento o de llamadas a herramientas que agotan la ventana de contexto o el tiempo de ejecución disponible. Este ajuste entrena al modelo para converger en lugar de repetirse.

El modelo conserva íntegramente la arquitectura, el tokenizador, la plantilla de chat y la torre de visión del modelo base (esta última bit a bit idéntica), por lo que es un reemplazo directo. Se distribuye con licencia Apache 2.0 y pesos en safetensors bajo la librería transformers, con una variante GGUF (F16, Q8_0, Q6_K, Q4_K_M, con imatrix) publicada en un repositorio separado. El pipeline declarado es image-text-to-text, es decir, mantiene capacidad multimodal de entrada.

La relevancia actual reside en que aborda un problema de producción muy concreto en pipelines de agentes: la fiabilidad temporal. Según las mediciones del autor, el ajuste triplica la tasa de finalización dentro de un presupuesto fijo de 30 minutos en una tarea de reparación de código, pasando del 15 % al 60 %, y reduce los cortes por bucle de razonamiento de una mediana de 8,0 a 1,0 por ejecución. El modelo tiene 25.805.936.206 parámetros totales según los safetensors, con arquitectura MoE y 4B de parámetros activos según la nomenclatura del nombre.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer Mixture of Experts (MoE), multimodal con torre de visión (image-text-to-text) |
| Parametros totales | 25.805.936.206 (25,8 B) |
| Parametros activos | 4 B (según la nomenclatura A4B del nombre; no se detalla el número de expertos en la información disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF: F16, Q8_0, Q6_K, Q4_K_M (con imatrix); pesos base en BF16 |
| Idiomas soportados | en (inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (transformers); GGUF en repositorio separado |

## Arquitectura y entrenamiento

El modelo parte de google/gemma-4-26B-A4B-it, un transformer MoE multimodal con 25,8 B de parámetros totales y 4 B activos, e incorpora una torre de visión que se mantiene sin cambios respecto al base. El ajuste no altera la arquitectura, el tokenizador ni la plantilla de chat, lo que garantiza compatibilidad directa con las herramientas y configuraciones existentes del modelo original.

El entrenamiento es un SFT de recuperación en BF16 sobre las respuestas regeneradas por el propio modelo, filtradas de modo que ningún turno de entrenamiento contenga bucles. La mezcla de datos combina un conjunto propio (ManniX-ITA/gemma-4-26B-A4B-agentic-sft), trazas de agente generadas con Kimi (ManniX-ITA/hermes-agent-kimi-traces-gemma4-31b), varias suites de NVIDIA Nemotron (Agentic v2, OpenCode v1, SWE v2, Competitive Programming v2, Instruction Following Chat v1 y v2, Math v3, Science v1, Multilingual v1), y datasets de razonamiento y uso de herramientas (interstellarninja/hermes_reasoning_tool_use, lambda/hermes-agent-reasoning-traces). El autor etiqueta el proceso como "on-policy" y menciona el uso de su herramienta omk-model-optimizer y omnimergekit para la construcción de los GGUF. No se especifica el número de tokens de entrenamiento ni si hubo fases de RLHF o DPO.

## Capacidades

- Generación de texto y razonamiento multi-paso, con modo de pensamiento (thinking) activable y nivel de esfuerzo configurable (high en las pruebas del autor).
- Capacidad multimodal de entrada (image-text-to-text): conserva la torre de visión del modelo base sin modificaciones.
- Tool calling y function calling, con soporte para herramientas de diagnóstico LSP (check_file, ask_lsp) en el arnés de evaluación empleado.
- Comportamiento agéntico sostenido: el objetivo del ajuste es mantener la tarea sin bucles durante sesiones largas, con convergencia más rápida.
- Generación y reparación de código, incluyendo tareas de tipo SWE (resolución de incidencias en repositorios) y programación competitiva, según los datasets de entrenamiento.
- Razonamiento matemático y científico, derivado de los conjuntos Nemotron Math v3 y Science v1.
- Capacidades multilingües limitadas: el autor entrena con Nemotron Multilingual v1, pero la model card declara únicamente inglés como idioma soportado.
- Compatible con decodificación especulativa mediante un drafter asistente de Gemma-4 (empleado en la evaluación del autor).

## Casos de uso

- Reparación automática de código en producción: el modelo está entrenado específicamente para tareas de depuración de archivos rotos (errores de sintaxis y lógica) y converge más rápido; en la prueba del autor reduce el tiempo mediano hasta la primera comprobación correcta de 16,9 a 11,5 minutos.
- Agentes de codificación de larga duración: al reducir los bucles de razonamiento de 8,0 a 1,0 cortes medianos por ejecución, encaja en pipelines donde el coste por minuto de agente es alto y los timeouts son frecuentes.
- Integración en CI/CD con tool calling: puede invocarse con herramientas de diagnóstico (LSP, comprobación de archivos) para validar y corregir cambios antes de fusionar, manteniendo la plantilla de chat y el tokenizador del base.
- Asistencia multimodal en interfaces de desarrollo: al conservar la torre de visión, puede procesar capturas de pantalla o diagramas junto con texto en flujos de depuración visual.
- Tareas de resolución de incidencias en repositorios (SWE): los datasets Nemotron SWE v2 y OpenCode v1 apuntan a este escenario, con soporte de razonamiento multi-paso sobre el código.
- Razonamiento matemático y científico asistido: útil en cuadernos de cálculo o análisis donde se requiere cadena de pensamiento explícita y capacidad de invocar calculadoras o herramientas externas.
- Despliegue local con cuantización GGUF: las variantes Q4_K_M y Q6_K permiten ejecutar el modelo en estaciones de trabajo con GPU de consumo, manteniendo el comportamiento anti-bucle.

## Benchmarks y rendimiento

El autor publica una comparación directa contra el modelo base en una única tarea agéntica: reparar un juego HTML roto (manic_miner, con un error de sintaxis y varios bugs de lógica), con 20 ejecuciones por modelo, presupuesto de 30 minutos, BF16 GGUF sobre llama.cpp, una RTX PRO 6000 Blackwell (96 GB) por modelo, caché KV f16, decodificación especulativa con drafter de Gemma-4, thinking en esfuerzo alto, temperatura 0,8 / top_p 0,95 / top_k 64 / min_p 0 / presence_penalty 0,025.

| Metrica | Base gemma-4-26B-A4B-it | Este modelo |
|---|---|---|
| Ejecuciones finalizadas en 30 min (de 20) | 3 / 20 (15 %) | 12 / 20 (60 %) |
| Intervalo de confianza 95 % (Wilson) | 5 %–36 % | 39 %–78 % |
| Tasa de éxito a 10 / 20 / 30 min | 0 % / 15 % / 15 % | 25 % / 50 % / 60 % |
| Cortes por bucle de razonamiento por ejecución (mediana) | 8,0 | 1,0 |
| Cortes por bucle por hora de modelo | 18,1 | 2,9 |
| Tiempo hasta la primera comprobación correcta (mediana, ejecuciones exitosas) | 16,9 min | 11,5 min |
| Fallos por juego que no arranca | 17 | 6 |
| Fallos por lógica incompleta (17/23 y 21/23 comprobaciones) | 0 | 2 |
| Ejecuciones detenidas por repetir una llamada a herramienta | 1 | 1 |
| Falsos positivos (declara éxito sin lograrlo) | 0 | 0 |

Significación estadística: prueba exacta de Fisher bilateral p = 0,0079 para la diferencia de tasa de éxito. El autor advierte que la tasa no es absoluta: mide la finalización dentro de un presupuesto fijo de 30 minutos, y un timeout significa "no terminado en 30 minutos", no "incapaz". No se han publicado resultados en benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita. Como referencia, el autor ejecuta la variante BF16 GGUF en una RTX PRO 6000 Blackwell de 96 GB con caché KV f16; los pesos safetensors en BF16 suman aproximadamente 51,6 GB de repositorio.
- GPU recomendadas: RTX PRO 6000 Blackwell (96 GB) para BF16; para cuantizaciones GGUF inferiores se requieren GPUs con menos memoria, aunque no se detallan umbrales concretos.
- GPU de consumo: las variantes Q4_K_M y Q6_K están publicadas precisamente para este escenario, pero la información disponible no confirma cifras de VRAM ni modelos concretos (RTX 4090, 3090, etc.).
- Opciones de despliegue: transformers (safetensors), llama.cpp (GGUF, build empleado en la evaluación), y servidores compatibles con la plantilla de chat de Gemma-4; el autor menciona endpoints compatibles en las etiquetas del repositorio.
- Latencia y throughput: no se publican cifras de tokens por segundo. El único dato temporal es el tiempo de finalización de tarea: mediana de 11,5 minutos hasta la primera comprobación correcta en ejecuciones exitosas, frente a 16,9 minutos del base.
- Decodificación especulativa: compatible con un drafter asistente de Gemma-4, lo que puede mejorar el throughput en despliegues con llama.cpp.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Gemma-4-26B-A4B-agentic (este) | 25,8 B totales / 4 B activos | no disponible | SFT anti-bucle para tareas agénticas | Apache 2.0 | Hugging Face (safetensors y GGUF) |
| google/gemma-4-26B-A4B-it (base) | 25,8 B totales / 4 B activos | no disponible | Modelo multimodal generalista | Apache 2.0 | Hugging Face |
| Variantes podadas del base (v7-coder, v9-agentic, 98 expertos) | no disponible | no disponible | Recetas propias del mismo autor | no disponible | no disponible |

La comparación directa disponible es únicamente contra el modelo base, del que este ajuste hereda arquitectura, tokenizador, plantilla de chat y torre de visión. No se han publicado comparaciones con otros modelos de la misma categoría (por ejemplo, otros MoE multimodales de tamaño similar) en la información proporcionada.

## Limitaciones y advertencias

- El ajuste está orientado a un problema específico (bucles en tareas agénticas largas); no hay evidencia publicada de mejoras en otras capacidades ni de posibles regresiones fuera de ese dominio.
- La evaluación se basa en una sola tarea y 20 ejecuciones por modelo; el propio autor reconoce que la tasa de éxito es relativa a un presupuesto de 30 minutos y que con más tiempo la diferencia se estrecharía.
- Idioma: solo se declara inglés. Aunque se entrenó con un dataset multilingüe, no se garantiza un rendimiento sólido en castellano u otros idiomas.
- Riesgo de alucinación: no se han publicado mediciones específicas; en las pruebas el modelo no produjo falsos positivos (0 ejecuciones que declararan éxito sin lograrlo), pero la muestra es pequeña.
- Sesgos: no se documentan sesgos conocidos en la información disponible.
- Licencia Apache 2.0, que permite uso comercial, pero el modelo deriva de Gemma-4 y el usuario debe verificar las condiciones de la licencia del modelo base de Google.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y fue creado en noviembre de 2026; se trata de un ajuste reciente y sin validación independiente.
- Para uso en producción se recomienda `presence_penalty` de 0,025 (el autor lo describe como suficiente para que sea prácticamente libre de bucles); otras estrategias anti-repetición más agresivas reducen la eficacia del modelo según sus pruebas.
- No se dispone de información sobre longitud de contexto, número de expertos ni detalles del proceso on-policy, lo que limita la evaluación técnica completa.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ManniX-ITA/gemma-4-26B-A4B-agentic
- GGUF: https://huggingface.co/ManniX-ITA/gemma-4-26B-A4B-agentic-GGUF
- Modelo base: https://huggingface.co/google/gemma-4-26B-A4B-it
- Dataset SFT propio: https://huggingface.co/datasets/ManniX-ITA/gemma-4-26B-A4B-agentic-sft
- Trazas de agente Kimi: https://huggingface.co/datasets/ManniX-ITA/hermes-agent-kimi-traces-gemma4-31b
- Repositorio omk-model-optimizer (incluye scripts de evaluación): https://github.com/mann1x/omk-model-optimizer/tree/omk-main/omk/models/gemma-4-26b-a4b/sft11/eval
- Herramienta omnimergekit: https://github.com/mann1x/omnimergekit
- Arnés de evaluación automaticum: https://github.com/mann1x/automaticum
- SDK Cerebriline: https://github.com/mann1x/cline/tree/main/sdk
