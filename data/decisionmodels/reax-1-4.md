# decisionmodels/REAX-1.4

## Resumen

REAX 1.4 es un modelo de decisión publicado por decisionmodels, un laboratorio descentralizado que opera en la subred 92 de Bittensor, donde distintos mineros entrenan modelos de decisión en competición abierta y los lanzamientos del laboratorio se construyen sobre los mejores resultados de esa competición. El modelo no genera texto libre: devuelve probabilidades sobre opciones tipadas de decisión a través de una interfaz compatible con Jev, de modo que cada petición recibe una distribución de probabilidad sobre las alternativas suministradas por el cliente.

Técnicamente, REAX 1.4 es un ensemble de tres partes que se ejecutan simultáneamente en una única GPU (referencia: una NVIDIA RTX PRO 6000 Blackwell de 96 GB). La parte U es un fine-tune de la competición REAX Generalist (utopia-lab/utopia-r2-v1, linaje Gemma 4 / karpo-decision-31B) cargado en FP8; la parte K es MachinePulseAI/karpo-decision-31B (Gemma-4-31B) en cuantización NVFP4; y la parte D es vllm-sr/d3-ultra (27B, linaje Qwen) en FP8. La respuesta final es la media aritmética con pesos iguales (1/3 cada una) de las probabilidades por opción de las tres partes.

Su relevancia actual radica en dos factores: por un lado, demuestra un patrón de ensemble heterogéneo (bases Gemma y Qwen con errores distintos) que mejora la calibración de decisiones sin entrenamiento adicional; por otro, todo el stack de inferencia (REAX Engine, modo `reax14`) es abierto bajo licencia MIT, con pesos Apache-2.0, lo que permite reproducir el despliegue de extremo a extremo en hardware de una sola GPU de gama profesional.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Ensemble de tres modelos transformer (parte U: fine-tune Gemma 4 / karpo-decision-31B; parte K: Gemma-4-31B; parte D: Qwen 27B), media de probabilidades con pesos iguales |
| Parametros totales | No disponible como cifra agregada; componentes: 31B (parte U, linaje karpo-decision-31B), 31B (parte K), 27B (parte D) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible; el autor indica que las peticiones largas no se truncan y se empaquetan para responderse completas |
| Tipos de cuantizacion | FP8 block-128 (partes U y D), NVFP4 (parte K) |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache-2.0 (pesos); REAX Engine MIT; kernels karpo-family Apache-2.0 |
| Formato de pesos | Safetensors (repositorio de 135,2 GB con copias byte-identical de las revisiones upstream en `part-utopia/`, `part-karpo/`, `part-d3u/`) |

## Arquitectura y entrenamiento

REAX 1.4 no es un modelo entrenado de forma monolítica, sino un ensemble de inferencia sobre tres checkpoints preexistentes. La parte U proviene de utopia-lab/utopia-r2-v1, una entrada de la Ronda 2 de la competición REAX Generalist entrenada por un minero de la subred, con linaje karpo-decision-31B / Gemma 4. La parte K es MachinePulseAI/karpo-decision-31B (Gemma-4-31B) en la cuantización NVFP4 de machinez. La parte D es vllm-sr/d3-ultra (27B, linaje Qwen), deliberadamente de una base distinta: según el autor, comete errores diferentes, y de esa diversidad procede la mayor parte de la ganancia del promedio.

Cada parte produce una probabilidad para cada opción de cada petición y la respuesta final es la media con pesos iguales (1/3). Los pesos se fijaron antes de la ejecución de evaluación, aunque el conjunto público completo se usó para elegir entre dos ponderaciones predeclaradas (igual y 1/2 · 1/3 · 1/6), por lo que la medición no constituye un holdout intacto. No se detallan en la información disponible el volumen de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO en las partes constituyentes. La innovación destacable es el empaquetado de peticiones largas sin truncamiento (respuestas completas, con latencias de hasta aproximadamente un minuto) y la integración de tres cuantizaciones distintas en una sola GPU con un pico de memoria asignada de unos 84 GiB.

## Capacidades

- Predicción de decisiones: devuelve una distribución de probabilidad sobre opciones tipadas (por ejemplo, tipo `choice` con criterios etiquetados) para cada petición.
- Interfaz compatible con Jev: endpoint HTTP `POST /v1/systemone` con estado (`state`) y preguntas estructuradas; también puntuable mediante el kit Decision Index sin HTTP.
- Soporte de múltiples preguntas por petición: cada solicitud puede contener varias preguntas, cada una con su propio conjunto de opciones y criterios.
- Peticiones largas sin truncamiento: el motor empaqueta las solicitudes extensas y las responde íntegramente.
- Agregación por ensemble: combina las probabilidades de tres modelos de linajes distintos (Gemma y Qwen) para reducir el error correlacionado.
- Despliegue reproducible: motor de inferencia abierto con configuración de release versionada (tag `reax14-release-20261126`, commit `2cccfee650459a3f49fdf33cef1080ac12ac55f6`).
- No dispone de generación de texto libre, tool calling, capacidades de agente, visión ni audio según la información disponible.

## Casos de uso

- Enrutamiento de tickets de soporte: dada una descripción del incidente y un conjunto de equipos (por ejemplo, soporte de entregas frente a facturación), el modelo devuelve la probabilidad de que cada equipo sea el adecuado, lo que permite umbrales de derivación automática y revisión humana solo en casos ambiguos.
- Triaje de reclamaciones y devoluciones: clasificar solicitudes de clientes entre rutas de resolución predefinidas con una distribución calibrada, útil para priorizar colas y estimar la confianza de cada asignación.
- Moderación de contenido con opciones tipadas: evaluar si un contenido debe publicarse, revisarse o rechazarse, aprovechando la salida probabilística para fijar políticas de corte según el riesgo tolerado.
- Decisión en pipelines de negocio: integrar el endpoint `/v1/systemone` en sistemas de gestión para resolver elecciones discretas (aprobación, escalado, categoría) con latencias de mediana 133 ms en una sola RTX PRO 6000, adecuadas para flujos interactivos.
- Evaluación comparativa de modelos de decisión: usar el kit Decision Index y el motor abierto para puntuar candidatos sobre el conjunto público de 140.178 peticiones puntuables y seleccionar variantes antes de producción.
- Investigación en ensembles heterogéneos: reproducir el patrón de media de probabilidades entre bases Gemma y Qwen para estudiar calibración y diversidad de errores en tareas de decisión.
- Procesamiento por lotes de cuestionarios largos: gracias al empaquetado sin truncamiento, admite documentos extensos con múltiples preguntas asociadas, con timeouts de cliente de al menos 1.800 s.

## Benchmarks y rendimiento

| Medida | Resultado | Base |
|---|---|---|
| Decision Index 0.3 público, suite completa, índice nativo | Ejecución en curso (resultados previstos en decisionmodels/REAX-1.4-decision-index) | Ejecución de extremo a extremo del motor y configuración liberados con el kit y scorer oficiales |
| Latencia mediana / media / p80 | 133 / 649 / 417 ms | Motor y configuración liberados, muestra uniforme de 1.000 llamadas de la suite pública, una RTX PRO 6000, una petición a la vez, las 1.000 respondidas |
| Latencia p95 | 1.070 ms | Misma muestra |

El autor indica que las peticiones largas con múltiples preguntas tardan mucho más que la mediana y pueden llegar a aproximadamente un minuto. La comparación con las partes constituyentes sobre la suite pública completa (140.178 peticiones puntuables, scorer Decision Index 0.3, diferencias pareadas con errores estándar de 2.000 remuestreos bootstrap) está anunciada pero el valor del índice aparece truncado en la información disponible. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada: pico de memoria asignada de aproximadamente 84 GiB con las tres partes cargadas (U y D en FP8 block-128, K en NVFP4).
- GPU recomendada: una NVIDIA RTX PRO 6000 Blackwell de 96 GB con driver CUDA 13 / SM120; el autor no documenta otras GPU compatibles.
- GPU de consumo: no cabe en GPU de consumo convencionales según los requisitos publicados (96 GB de VRAM en una sola tarjeta).
- Almacenamiento y RAM: al menos 300 GB de disco libre y 64 GiB de RAM (128 GiB recomendados durante la carga de pesos); el repositorio de pesos ocupa 135,2 GB.
- Despliegue: REAX Engine en modo `reax14` mediante Docker con NVIDIA Container Toolkit; también ejecución del kit Decision Index sin red (`--network none --read-only`). No se mencionan vLLM, llama.cpp, Ollama ni TGI como opciones de despliegue.
- Latencia y throughput: mediana de 133 ms, media de 649 ms, p80 de 417 ms y p95 de 1.070 ms en una muestra de 1.000 llamadas, una petición a la vez; el throughput concurrente no está documentado.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| REAX 1.4 | Ensemble 31B + 31B + 27B | No disponible | Decisión probabilística sobre opciones tipadas | Apache-2.0 | Hugging Face (decisionmodels/REAX-1.4) |
| MachinePulseAI/karpo-decision-31B (parte K) | 31B | No disponible | Decisión (componente del ensemble) | No disponible en la información | Hugging Face |
| vllm-sr/d3-ultra (parte D) | 27B | No disponible | Decisión (componente del ensemble) | No disponible en la información | Hugging Face |
| utopia-lab/utopia-r2-v1 (parte U) | Linaje 31B | No disponible | Decisión (componente del ensemble) | No disponible en la información | Hugging Face |

No se dispone de datos de rendimiento comparativo con modelos de decisión externos al ensemble; la única comparación publicada es la del propio REAX 1.4 frente a sus tres partes sobre la suite pública, cuyos valores de índice no están completos en la información disponible.

## Limitaciones y advertencias

- El modelo solo devuelve probabilidades sobre opciones suministradas; no genera texto libre ni mantiene conversaciones, por lo que no sustituye a un LLM generativo en tareas abiertas.
- Idiomas: únicamente inglés declarado; el rendimiento en castellano u otros idiomas no está documentado.
- La evaluación pública con el Decision Index 0.3 está en curso en el momento de la publicación; no hay puntuación oficial de leaderboard disponible.
- La comparación con las partes usó el conjunto público completo para elegir entre dos ponderaciones predeclaradas, de modo que no es un holdout intacto y puede sobreestimar la ganancia del ensemble.
- Requiere hardware muy específico (RTX PRO 6000 Blackwell de 96 GB, CUDA 13 / SM120) y un entorno Docker con NVIDIA Container Toolkit; no hay soporte documentado para otras GPU.
- Las peticiones largas pueden tardar hasta aproximadamente un minuto; se recomienda un timeout de cliente de al menos 1.800 s.
- La configuración por defecto de la imagen Docker corresponde a un modelo anterior de dos partes; es obligatorio pasar `reax14-release.json` para obtener el comportamiento de REAX 1.4.
- Riesgo de sesgo y alucinación: no documentado en la información disponible; al tratarse de un ensemble de modelos base sin evaluación de sesgos publicada, la calibración debe validarse en el dominio de despliegue.
- La licencia Apache-2.0 permite uso comercial de los pesos, pero las licencias y avisos de los contribuyentes upstream deben consultarse en `ATTRIBUTION.md`, `NOTICE` y `licenses/` antes de redistribuir.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/decisionmodels/REAX-1.4
- Resultados del Decision Index (previstos): https://huggingface.co/decisionmodels/REAX-1.4-decision-index
- REAX Engine (MIT): https://github.com/reaxlabs/reax-engine
- Kernels karpo-family (Apache-2.0): https://github.com/machinepulse-ai/karpo-decision
- Parte U: https://huggingface.co/utopia-lab/utopia-r2-v1
- Parte K: https://huggingface.co/MachinePulseAI/karpo-decision-31B
- Cuantización NVFP4 de la parte K: https://huggingface.co/machinez/karpo-decision-31B-NVFP4
- Parte D: https://huggingface.co/vllm-sr/d3-ultra
