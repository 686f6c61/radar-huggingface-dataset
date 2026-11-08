# MatterWaveAI/grt-rnn-b0.7.0-20m

## Resumen

GRT-RNN-b0.7.0-20m es un modelo de lenguaje de tipo red neuronal recurrente (RNN) puramente rotacional desarrollado por MatterWaveAI. Se presenta como un "world model" unitario y juez de trayectorias con memoria constante O(1), construido sobre el modelo base MatterWaveAI/grt-20m como escalón de 20M de parámetros dentro de la familia GRT-RNN. Su propuesta central es formular las transiciones de estado recurrente mediante transformaciones ortogonales que preservan la norma (determinante +1.000000), eliminando matrices lineales densas y capas convolucionales.

El modelo almacena aproximadamente 26,4M de parámetros con una capacidad equivalente declarada de unos 66M densos, y opera con dos modos: un escaneo paralelo minGRU (parallel prefix scan) para entrenamiento y un modo Unitary-GRU no lineal acoplado al estado. La característica más destacada es que no requiere caché KV: mantiene un estado recurrente fijo de 2,25 KB independientemente de la longitud de secuencia (desde 128 hasta más de 8.192 tokens), lo que lo hace atractivo para escenarios de memoria restringida.

Es relevante ahora por su enfoque en estabilidad numérica por construcción (deriva de norma inferior a 5,0e-7 en float32 sobre más de 1.000 pasos) y por presentarse como juez de trayectorias y enrutador MPC para agentes, aunque la propia model card advierte de que los pesos, la implementación arquitectónica y el código fuente están retenidos durante un ciclo de liberación escalonado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | RNN rotacional (Rotational-RNN / Unitary-GRU / Rotational-minGRU), sin matrices densas ni convoluciones |
| Parametros totales | ~26,4M almacenados (~66M equivalentes densos declarados) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible como ventana fija; entrenado/evaluado hasta T = 8.192+ tokens con estado recurrente O(1) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | no disponible (pesos retenidos según la model card) |

## Arquitectura y entrenamiento

La arquitectura es una RNN puramente rotacional que sustituye las matrices lineales densas por transformaciones ortogonales que preservan la norma (determinante +1.000000). Soporta dos modos de operación: un escaneo paralelo geodésico tipo minGRU, con paridad numérica de 3,81e-6 frente a la recurrencia paso a paso O(1), y un modo Unitary-GRU no lineal con compuertas de reset y transición acopladas al estado oculto. No contiene capas lineales densas, ni convoluciones 1D/2D, y no utiliza caché KV: el estado recurrente fijo ocupa 2,25 KB.

El entrenamiento se describe mediante un currículo de 24 horas y un horizonte de 10C, con datos de benchmarks XL-smol, SLM-Bench y GSM8K. La model card reporta invariancias arquitectónicas verificadas: deriva de norma del estado homogéneo de 9,55e-15 en float64 y menos de 5,0e-7 en float32 sobre 8.192 pasos, retención de rango efectivo del estado superior al 96% sin colapso, y determinante unitario exacto. No se detalla la composición del dataset de entrenamiento ni si hubo RLHF o DPO. Los pesos, la implementación y el código fuente no se publican en esta fase.

## Capacidades

- Generación de texto y modelado de lenguaje autorregresivo (pipeline text-generation).
- Razonamiento multi-hop relacional (verificación de rollouts de 2 a 3 saltos).
- Verificación de sentido común causal y físico.
- Verificación factual de un solo salto (world model).
- Verificación socrática y epistémica en cuatro modos (SEE/SAY/DO/KNOW).
- Inducción de reglas en rejillas visuales-espaciales 2D (evaluado sobre ARC-AGI-2 XL-smol).
- Enrutamiento de acciones para agentes (MPC) y defensa frente a inyección de prompts y deriva.
- Razonamiento matemático (evaluado en GSM8K).
- Memoria constante O(1) por token, apta para secuencias largas sin crecimiento de caché KV.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible en la información proporcionada (idiomas no declarados).

## Casos de uso

- Juez de trayectorias en agentes: el modelo puede evaluar rollouts multi-paso de un agente con memoria constante O(1), sin acumular caché KV, lo que permite verificar trayectorias largas con un estado fijo de 2,25 KB.
- Enrutamiento de acciones MPC en pipelines de agentes: su evaluación de "Agent MPC Action Routing, Drift & Prompt-Injection Defense" (66,50% top-1) lo sitúa como candidato para seleccionar la siguiente acción y detectar inyecciones de prompt.
- Verificación de razonamiento causal en asistentes científicos: con un 94,90% top-1 en verificación de ciencia causal y sentido común físico, puede filtrar respuestas de un LLM mayor en dominios de física y causalidad.
- Detección de inconsistencias factuales: con 87,10% top-1 en verificación factual de un salto, puede actuar como capa de comprobación sobre salidas de modelos generativos en entornos de bajos recursos.
- Procesamiento de secuencias largas en dispositivos edge: gracias a su estado recurrente fijo y su tamaño de ~26,4M parámetros, es desplegable en hardware limitado para tareas de clasificación y verificación sobre flujos continuos.
- Inducción de reglas en tareas de rejilla (ARC-AGI-2): útil como componente de investigación en razonamiento abstracto visual-espacial, con 55,83% top-1 y 81,00% pass@2 en el conjunto XL-smol.
- Evaluación de consistencia de opciones en sistemas de QA: su consistencia de orden de opciones del 100% lo hace adecuado para tareas de verificación de múltiple opción donde el orden no debe sesgar el resultado.

## Benchmarks y rendimiento

Resultados reportados por el autor sobre XL-smol (12.003 registros retenidos / 29.609 preguntas):

| Suite XL-smol | Registros | Preguntas | Top-1 | pass@2 | Consistencia de orden |
|---|---|---|---|---|---|
| Verificación multi-hop relacional (2..3 saltos) | 2.500 | 5.000 | 89,80% | 95,80% | 100,0% |
| Ciencia causal y sentido común físico | 2.500 | 5.000 | 94,90% | 98,40% | 100,0% |
| Verificación factual de un salto | 2.500 | 5.000 | 87,10% | 93,20% | 100,0% |
| Verificación socrática/epistémica (4 modos) | 2.500 | 5.000 | 64,00% | 92,60% | 100,0% |
| Inducción de reglas en rejilla 2D (ARC-AGI-2) | 1.200 | 3.600 | 55,83% | 81,00% | 100,0% |
| Enrutamiento MPC, deriva e inyección de prompt | 803 | 2.409 | 66,50% | 71,71% | 100,0% |
| Agregado 6 suites (macro/micro) | 12.003 | 26.009 | 76,36% / 79,01% | 89,64% | 100,0% |
| Benchmark consolidado 12 dominios | 17.130 | 40.687 | 73,28% macro | 75,82% micro | 100,0% |

Resultados SLM-Bench y GSM8K (13.644 ejemplos):

| Benchmark | Split (n) | Aleatorio | Currículo 24h | Horizonte 10C |
|---|---|---|---|---|
| BoolQ | val (3.270) | 50,00% | 66,64% | 73,39% |
| QNLI | val (1.000) | 50,00% | 78,60% | 86,48% |
| ARC-Easy | test (2.376) | 25,00% | 38,09% | 55,80% |
| ARC-Challenge | test (1.172) | 25,00% | 30,63% | 40,78% |
| OpenBookQA | test (500) | 25,00% | 45,40% | 55,04% |
| PIQA | val (1.838) | 50,00% | 57,34% | 65,72% |
| WinoGrande | val (1.267) | 50,00% | 52,72% | 63,34% |
| HellaSwag | val (1.000) | 25,00% | 37,70% | 51,08% |
| CommonsenseQA | val (1.221) | 20,00% | 28,83% | 41,58% |
| Media macro 9 tareas | 13.144 | 35,56% | 48,44% | no disponible (truncado en la fuente) |

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; por tamaño (~26,4M parámetros) cabría en pocos cientos de MB en precisión completa, pero no se publican pesos ni cuantizaciones.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: probable por tamaño, pero no confirmado al no haber pesos publicados.
- Opciones de despliegue: la librería declarada es transformers; compatibilidad con vLLM, llama.cpp, Ollama o TGI no disponible.
- Latencia y throughput: no disponibles; la arquitectura promete O(1) de cómputo y memoria por token, pero no se aportan cifras medidas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| GRT-RNN-b0.7.0-20m | ~26,4M (~66M equiv.) | hasta 8.192+ (estado O(1)) | Apache 2.0 | pesos retenidos |
| MatterWaveAI/helmholtz-rnn-b0.7.0-20m | no disponible | no disponible | no disponible | no disponible |
| MatterWaveAI/helmholtz-s1-rnn-b0.7.0-20m | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks ni especificaciones de los modelos comparables en la información proporcionada; la comparativa con alternativas de la misma categoría (RNN de 20M o SLM de tamaño similar) no está disponible.

## Limitaciones y advertencias

- Pesos, implementación arquitectónica y código fuente retenidos: no es posible reproducir ni desplegar el modelo a partir de esta ficha.
- Idiomas soportados no declarados; el soporte multilingüe es desconocido.
- Riesgo de alucinación: no evaluado explícitamente en la información disponible; los benchmarks reportados son de verificación, no de generación abierta.
- Rendimiento moderado en tareas de conocimiento general: ARC-Challenge 40,78% y HellaSwag 51,08% en el mejor escenario, lejos de modelos generativos de mayor tamaño.
- El agregado de 9 tareas SLM-Bench aparece truncado en la fuente (59,...), por lo que la cifra final no está confirmada.
- Sesgos conocidos: no documentados en la información proporcionada.
- Licencia Apache 2.0 permite uso comercial, pero la ausencia de pesos publicados impide ejercerlo en la práctica con esta versión.
- Los resultados provienen de la propia model card del autor y no de una evaluación independiente.
- No se especifican tipos de cuantización ni formatos de pesos, lo que limita la planificación de despliegue.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/MatterWaveAI/grt-rnn-b0.7.0-20m
- Modelo base: https://huggingface.co/MatterWaveAI/grt-20m
- Familia GRT-RNN: https://huggingface.co/MatterWaveAI/grt-rnn
- Modelo relacionado (helmholtz-rnn): https://huggingface.co/MatterWaveAI/helmholtz-rnn-b0.7.0-20m
- Modelo relacionado (helmholtz-s1-rnn): https://huggingface.co/MatterWaveAI/helmholtz-s1-rnn-b0.7.0-20m
