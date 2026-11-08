# MatterWaveAI/grt-rnn-b0.7.0-10m

## Resumen

GRT-RNN-b0.7.0-10m es un modelo de generación de texto de tipo red neuronal recurrente (RNN) puramente rotacional, desarrollado por MatterWaveAI. Se presenta como una variante compacta de aproximadamente 10M de parámetros (unos 13,8M almacenados, con capacidad densa equivalente declarada de ~34M) construida sobre el modelo base MatterWaveAI/grt-10m. Su propuesta técnica es sustituir las matrices lineales densas y las capas convolucionales por transformaciones ortogonales que preservan la norma (determinante +1), de modo que las transiciones de estado recurrente sean unitarias.

El modelo se comercializa conceptualmente como un "world model" y "juez de trayectorias" con memoria constante O(1): no emplea caché KV y mantiene un estado recurrente fijo de 1,5 KB independientemente de la longitud de la secuencia. Esta característica lo orienta a tareas de verificación, enrutamiento de agentes y razonamiento de múltiples pasos en entornos con recursos limitados, más que a la generación de texto libre de alta calidad.

Es relevante ahora por su enfoque arquitectónico poco habitual (RNN unitaria con scan paralelo tipo minGRU) y por su escala reducida, que lo sitúan en la categoría de modelos pequeños para edge. No obstante, la model card indica explícitamente que los pesos, los detalles de implementación y el código fuente están retenidos durante un ciclo de publicación por fases, lo que limita seriamente su reproducibilidad y uso práctico en el momento de redactar esta ficha.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | RNN rotacional unitaria (Unitary-GRU / Rotational-minGRU), sin matrices densas lineales ni convoluciones |
| Parametros totales | ~13,8M almacenados (~34M de capacidad densa equivalente) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | hasta 8.192+ tokens en las pruebas declaradas (T = 128 a 8.192+) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | no disponible (la model card indica que los pesos están retenidos) |

## Arquitectura y entrenamiento

La arquitectura es una RNN con compuertas cuyo estado se transforma mediante rotaciones ortogonales (determinante +1,000000), lo que garantiza que la magnitud del estado se conserve a lo largo de la recurrencia. El modelo soporta dos modos: un scan geodésico paralelo tipo minGRU, que entrena mediante un prefix scan paralelo con paridad numérica frente a la recurrencia paso a paso inferior a 3,82e-6, y un modo Unitary-GRU no lineal con acoplamiento de estado oculto. Según la model card, no contiene matrices lineales densas, ni capas convolucionales 1D/2D, y opera con 0 bytes de caché KV y un estado recurrente fijo de 1,5 KB.

El entrenamiento declarado incluye un currículo de 24 horas y un horizonte denominado "10C", evaluado sobre conjuntos de validación de benchmarks tipo SLM-Bench y GSM8K (13.644 ejemplos). La model card menciona estabilidad de gradientes por construcción (deriva de norma inferior a 5,0e-7 en float32 y 9,55e-15 en float64 sobre 8.192 pasos) y una retención de rango efectivo del estado superior al 96 %. No se detallan la composición del dataset, el número de tokens de entrenamiento ni si hubo RLHF o DPO; tampoco se publican los detalles de implementación, que el autor declara retenidos.

## Capacidades

- Generación de texto autoregresiva mediante recurrencia con estado constante.
- Verificación de trayectorias y razonamiento de múltiples pasos (rollout relacional de 2 a 3 saltos) como "juez" de world model.
- Verificación factual de un solo salto y de sentido común físico y causal.
- Inducción de reglas en rejillas visuales-espaciales 2D (evaluado sobre una variante XL-smol de ARC-AGI-2).
- Enrutamiento de acciones para agentes (MPC) con defensa declarada frente a deriva y prompt injection.
- Verificación epistémica en cuatro modos (SEE/SAY/DO/KNOW).
- Razonamiento matemático básico evaluado sobre GSM8K.
- No se documenta soporte de tool calling, function calling, visión, audio ni modo thinking explícito más allá de las tareas descritas.
- Capacidades multilingües: no disponibles.

## Casos de uso

- Verificación de cadenas de razonamiento en pipelines de agentes: el modelo actúa como juez de trayectorias con memoria O(1), lo que permite evaluar rollouts largos sin crecimiento de memoria y descartar acciones incoherentes antes de ejecutarlas.
- Enrutamiento de acciones en agentes autónomos: con su evaluación de MPC y defensa frente a prompt injection, puede integrarse como router que selecciona la siguiente acción entre un conjunto acotado, manteniendo latencia y memoria constantes.
- Filtrado de hechos en sistemas RAG: su verificación factual de un solo salto (84,40 % top-1 declarado) permite descartar respuestas no sustentadas antes de mostrarlas al usuario.
- Comprobación de sentido común en asistentes domésticos o robótica simulada: la verificación causal y física (93,20 % top-1 declarado) sirve para validar si una secuencia de acciones es plausible antes de enviarla a un planificador.
- Inducción de reglas en tareas de rejilla: útil en entornos educativos o de investigación sobre ARC-AGI para probar mecanismos de abstracción con un modelo de 10M de parámetros.
- Despliegue en dispositivos edge: con ~13,8M de parámetros y estado recurrente fijo de 1,5 KB, es candidato para microcontroladores o navegadores donde no cabe un transformer con caché KV.
- Evaluación de currículos y experimentos de estabilidad numérica: su garantía de norma unitaria lo hace útil como banco de pruebas para investigar recurrencia sin desvanecimiento de gradiente.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (no verificables de forma independiente, dado que los pesos y el código están retenidos):

| Benchmark (rango 10M) | Split (n) | Aleatorio | 24h currículum | Horizonte 10C |
|---|---|---|---|---|
| BoolQ | val (3.270) | 50,00 % | 64,80 % | 66,76 % |
| QNLI | val (1.000) | 50,00 % | 76,40 % | 78,85 % |
| ARC-Easy | test (2.376) | 25,00 % | 33,42 % | 41,16 % |
| ARC-Challenge | test (1.172) | 25,00 % | 30,38 % | 32,18 % |
| OpenBookQA | test (500) | 25,00 % | 40,40 % | 41,10 % |
| PIQA | val (1.838) | 50,00 % | 53,59 % | 59,68 % |
| WinoGrande | val (1.267) | 50,00 % | 52,64 % | 58,25 % |
| HellaSwag | val (1.000) | 25,00 % | 37,00 % | 37,80 % |
| CommonsenseQA | val (1.221) | 20,00 % | 25,39 % | 30,04 % |
| Media macro 9 tareas | 13.144 | 35,56 % | 46,00 % | 49,54 % |

Resultados agregados de la suite XL-smol declarados:

| Suite | Registros | Preguntas | Top-1 | pass@2 |
|---|---|---|---|---|
| Rollout relacional multi-hop (2-3 saltos) | 2.500 | 5.000 | 83,60 % | 93,20 % |
| Ciencia causal y sentido común físico | 2.500 | 5.000 | 93,20 % | 96,30 % |
| Verificación factual de un salto | 2.500 | 5.000 | 84,40 % | 95,10 % |
| Verificación socrática 4 modos | 2.500 | 5.000 | 64,10 % | 90,80 % |
| Inducción de reglas en rejilla 2D (ARC-AGI-2 XL-smol) | 1.200 | 3.600 | 55,17 % | 80,83 % |
| Enrutamiento MPC y defensa prompt injection | 803 | 2.409 | 60,55 % | 63,03 % |
| Agregado 6 suites XL-smol | 12.003 | 26.009 | 73,50 % macro / 76,59 % micro | 88,01 % |
| Benchmark 12 dominios consolidado | 17.130 | 40.687 | 71,08 % macro | 73,51 % micro |

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; con ~13,8M de parámetros, en float32 ocuparía del orden de 55 MB de pesos y en float16 unos 28 MB, aunque estos cálculos no los publica el autor.
- GPU recomendadas: no disponibles; por tamaño, cualquier GPU consumer moderna (RTX 3060 o superior) sería sobrada, e incluso CPU.
- Cabe en GPU consumer: sí, por tamaño; no se especifican requisitos oficiales.
- Opciones de despliegue: la model card indica compatibilidad con transformers y endpoints, pero al estar los pesos retenidos no se puede confirmar el soporte en vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles. La arquitectura promete O(1) de cómputo y memoria por token, pero no se publican cifras medidas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad de pesos |
|---|---|---|---|---|
| GRT-RNN-b0.7.0-10m (MatterWaveAI) | ~13,8M | 8.192+ | Apache 2.0 | Retenidos según model card |
| GRT-10m (MatterWaveAI, modelo base) | ~8,8M | no disponible | no disponible | no disponible |
| GRT-30M-TTS (MatterWaveAI) | ~29,9M | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks comparables de terceros en la información proporcionada, por lo que la comparación de rendimiento con alternativas de la misma categoría no está disponible.

## Limitaciones y advertencias

- Los pesos, la implementación y el código fuente están retenidos según la model card, lo que impide reproducir o verificar los resultados declarados.
- Todos los benchmarks proceden del propio autor y no han sido validados de forma independiente.
- El tamaño de 10M de parámetros limita severamente la calidad de generación de texto libre; el modelo está orientado a tareas de verificación y enrutamiento acotadas.
- Riesgo de alucinación: no se documentan mecanismos de calibración ni tasas de alucinación medidas.
- Sesgos conocidos: no disponibles; no se detalla la composición del dataset de entrenamiento.
- Idiomas soportados: no disponibles; no se confirma el multilingüismo.
- Licencia Apache 2.0 permite uso comercial, pero la retención de pesos hace inviable su explotación práctica en el estado actual.
- No se documentan soportes de tool calling, agentes generales ni integraciones estándar más allá de las tareas evaluadas.
- Las cifras de "capacidad densa equivalente" (~34M) son una afirmación del autor sin metodología pública.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/MatterWaveAI/grt-rnn-b0.7.0-10m
- Modelo base: https://huggingface.co/MatterWaveAI/grt-10m
- Familia GRT-RNN: https://huggingface.co/MatterWaveAI/grt-rnn
- Modelo TTS relacionado: https://huggingface.co/MatterWaveAI/grt-30m-tts
