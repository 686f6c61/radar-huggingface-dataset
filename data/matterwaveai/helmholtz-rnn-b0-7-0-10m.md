# MatterWaveAI/helmholtz-rnn-b0.7.0-10m

## Resumen

HELMHOLTZ-RNN-b0.7.0-10m es un modelo de generación de texto de tipo red neuronal recurrente (RNN) desarrollado por MatterWaveAI, publicado como el escalón de 10M de su familia HELMHOLTZ-RNN-1. Se presenta como una RNN puramente rotacional (Rotational-RNN / Unitary-GRU / Rotational-minGRU) con arquitectura de estado recurrente de magnitud constante, diseñada como juez de trayectorias y world model JEPA libre de colapso. Según la model card, almacena aproximadamente 13,8M de parámetros con una capacidad densa equivalente de unos 34M, sin matrices lineales densas ni capas convolucionales.

La propuesta técnica central es sustituir las transiciones de estado de una GRU convencional por transformaciones ortogonales que preservan la norma (determinante +1), lo que en teoría elimina el desvanecimiento y la explosión de gradientes por construcción. El modelo opera en dos modos: un escaneo paralelo tipo minGRU para entrenamiento y una variante no lineal acoplada al estado (Unitary-GRU) para inferencia, con coste y memoria O(1) por token y sin caché KV.

Es relevante ahora por dos motivos. Primero, propone una alternativa a los transformers para tareas de razonamiento multi-paso con memoria constante, un área de interés creciente. Segundo, la propia model card advierte de que los pesos, los detalles de implementación y el código fuente están retenidos durante un ciclo de publicación escalonado, por lo que el modelo no es utilizable en la práctica pese a estar publicado en Hugging Face. Las cifras de benchmarks que reporta el autor proceden de su propia suite (XL-smol) y no son verificables de forma independiente.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | RNN rotacional (Rotational-RNN / Unitary-GRU / Rotational-minGRU), con escaneo paralelo tipo minGRU; sin matrices lineales densas ni convoluciones |
| Parámetros totales | ~13,8M almacenados (~34M de capacidad densa equivalente, según el autor) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible como ventana fija; admite secuencias de T = 128 a 8.192+ tokens con estado recurrente de 1,5 KB |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | no disponible (pesos retenidos según la model card) |

## Arquitectura y entrenamiento

La arquitectura es una RNN con compuertas cuya transición de estado se formula mediante transformaciones ortogonales con determinante +1, lo que preserva la norma del estado oculto a lo largo de la recurrencia. El modelo soporta dos modos de operación: un escaneo paralelo geodésico (parallel prefix scan, tipo minGRU) empleado en entrenamiento, y una variante no lineal con compuertas de reset y transición acopladas al estado oculto (Unitary-GRU). Según el autor, ambos modos presentan una paridad numérica de 3,81e-6 frente a la recurrencia paso a paso, y la deriva de la norma del estado homogéneo es de 9,55e-15 en float64 y menor que 5,0e-7 en float32 tras 8.192 pasos. El modelo no usa caché KV: mantiene un estado recurrente fijo de 1,5 KB independientemente de la longitud de la secuencia.

El modelo base declarado es MatterWaveAI/helmholtz-jepa-b0.7.0-10m, un world model JEPA, y esta versión se presenta como un fine-tune del mismo. La model card menciona entrenamiento con objetivos JEPA libres de colapso (retención de rango efectivo superior al 96% sin negativos), pero no detalla el volumen de tokens de entrenamiento, la composición del dataset ni si se aplicaron RLHF o DPO. Tampoco se especifican los detalles de implementación: el autor indica explícitamente que los pesos, la implementación arquitectónica y el código fuente están retenidos durante el ciclo de publicación escalonado.

## Capacidades

- Generación de texto y verificación de trayectorias de razonamiento multi-paso (2 a 3 saltos relacionales), según la evaluación del autor.
- Juicio de world model: verificación de hechos de un solo salto, causalidad científica y sentido común físico.
- Verificación epistémica en cuatro modos (SEE / SAY / DO / KNOW), orientada a agentes.
- Inducción de reglas sobre rejillas visuales-espaciales 2D (evaluada sobre una variante XL-smol de ARC-AGI-2).
- Enrutamiento de acciones para agentes con control predictivo (MPC), incluida defensa frente a inyección de prompts y deriva.
- Memoria constante O(1) por token: el coste de inferencia no crece con la longitud de la secuencia.
- Soporte de tool calling / function calling: no disponible.
- Capacidades multilingües: no disponible.
- Capacidades de visión, audio o modo thinking explícito: no disponibles.

## Casos de uso

- Verificación de cadenas de razonamiento en pipelines de agentes: el modelo actúa como juez que valida rollouts multi-paso (2-3 saltos) antes de ejecutar una acción, aprovechando su estado recurrente fijo de 1,5 KB para mantener coste constante en trayectorias largas.
- Enrutamiento de acciones con MPC en agentes autónomos: selecciona la siguiente acción evaluando trayectorias candidatas con coste O(1) por token, lo que permite desplegarlo como router ligero delante de un modelo mayor.
- Defensa frente a inyección de prompts: su evaluación específica de drift y prompt-injection lo sitúa como filtro de seguridad en flujos de agentes expuestos a entradas no confiables.
- Procesamiento de secuencias muy largas en streaming: al no usar caché KV, puede procesar flujos continuos de T = 8.192+ tokens con memoria acotada, útil en monitorización de logs o telemetría.
- Inducción de reglas sobre datos estructurados 2D: aplicable a la resolución de tareas tipo ARC-AGI o a la inferencia de reglas en rejillas y tableros dentro de entornos de investigación.
- World model ligero para simulación de entornos: su origen como fine-tune de un modelo JEPA permite usarlo como componente de predicción de estados en entornos de RL o planificación, siempre que se liberen los pesos.
- Prototipado en hardware de borde: con ~13,8M de parámetros y estado recurrente de 1,5 KB, el modelo cabría en dispositivos con recursos muy limitados, si bien la falta de pesos publicados impide confirmarlo.

## Benchmarks y rendimiento

Los resultados siguientes proceden exclusivamente de la model card del autor (suite XL-smol) y no han sido verificados de forma independiente.

| Suite XL-smol | Registros held-out | Preguntas | Top-1 | pass@2 | Consistencia de orden |
|---|---|---|---|---|---|
| Verificación multi-hop relacional (2-3 saltos) | 1.000 | 2.000 | 100,00% | 100,00% | 100,0% |
| Ciencia causal y sentido común físico | 1.000 | 2.000 | 100,00% | 100,00% | 100,0% |
| Verificación factual de un solo salto | 1.000 | 2.000 | 100,00% | 100,00% | 100,0% |
| Verificación socrática y epistémica (4 modos) | 1.000 | 2.000 | 100,00% | 100,00% | 100,0% |
| Inducción de reglas en rejilla 2D (ARC-AGI-2 XL-smol) | 600 | 1.800 core (3.600 total) | 100,00% | 100,00% | 100,0% |
| Enrutamiento MPC, deriva y prompt-injection | 403 | 1.209 | 99,75% | 100,00% | 100,0% |
| Agregado de 6 suites (macro / micro) | 5.003 | 11.009 core (12.809 total) | 99,96% / 99,98% | 100,00% | 100,0% |
| Benchmark consolidado de 12 dominios (data_master_v8_xl) | 10.130 | 25.687 core (27.487 total) | 86,51% macro | 79,97% micro core | 100,0% |

No se han publicado resultados en benchmarks estándar de la industria (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Con ~13,8M de parámetros, en float16 ocuparía del orden de 28 MB de pesos, y en float32 unos 55 MB; estas cifras son estimaciones a partir del recuento de parámetros, no datos del autor.
- Estado recurrente: 1,5 KB fijos por secuencia, independientemente de la longitud (sin caché KV).
- GPU recomendadas: no disponible. Por tamaño, el modelo cabría en cualquier GPU consumer (RTX 3060, RTX 4090, etc.) e incluso en CPU, pero no hay recomendaciones oficiales.
- Despliegue: la librería declarada es transformers; no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI. La retención de pesos y código impide el despliegue.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de datos verificables de modelos comparables de la misma categoría (RNN rotacionales de ~10M con estado O(1)) en la información proporcionada. Como referencia del propio autor, la familia incluye otros miembros publicados en Hugging Face (helmholtz-rnn-1, helmholtz-mamba-1, grt-10m, grt-30m-asr), pero no se han facilitado sus especificaciones completas para una comparación rigurosa.

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad de pesos |
|---|---|---|---|---|
| HELMHOLTZ-RNN-b0.7.0-10m | ~13,8M | T = 128 a 8.192+ (estado O(1)) | Apache 2.0 | Retenidos según la model card |
| HELMHOLTZ-RNN-1 | no disponible | no disponible | no disponible | no disponible |
| HELMHOLTZ-Mamba-1 | no disponible | no disponible | no disponible | no disponible |
| grt-10m (MatterWaveAI) | 8,8M | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Pesos no publicados: la model card indica que los pesos, la implementación y el código fuente están retenidos durante el ciclo de publicación escalonado, por lo que el modelo no es ejecutable pese a estar alojado en Hugging Face.
- Benchmarks no verificables: todas las cifras proceden de la suite propietaria XL-smol del autor; no hay evaluación independiente ni resultados en benchmarks estándar.
- Idiomas no especificados: no se declara ningún idioma soportado, lo que impide evaluar su comportamiento multilingüe.
- Sin datos de cuantización ni de formato de pesos: no se puede planificar un despliegue en producción.
- Riesgo de alucinación: no evaluado de forma independiente; las tasas de acierto del 100% en verificación factual deben tomarse con cautela.
- Sesgos: no se documenta ninguna evaluación de sesgos.
- Licencia Apache 2.0: permite uso comercial, pero al no haber pesos disponibles la licencia es, en la práctica, inaplicable por ahora.
- Modelo de nicho: su orientación a juicio de trayectorias y world models lo aleja de tareas de generación de texto generalista.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/MatterWaveAI/helmholtz-rnn-b0.7.0-10m
- Modelo base (JEPA): https://huggingface.co/MatterWaveAI/helmholtz-jepa-b0.7.0-10m
- Familia HELMHOLTZ-RNN-1: https://huggingface.co/MatterWaveAI/helmholtz-rnn-1
- HELMHOLTZ-1 (JEPA world model): https://huggingface.co/MatterWaveAI/helmholtz-1
- HELMHOLTZ-1-Omni (alineación multimodal): https://huggingface.co/MatterWaveAI/helmholtz-1-omni
- HELMHOLTZ-Mamba-1 (recurrencia selectiva O(1)): https://huggingface.co/MatterWaveAI/helmholtz-mamba-1
- s1-grt-jepa (juicio de trayectorias MPC): https://huggingface.co/MatterWaveAI/s1-grt-jepa
- s1-grt-mamba (verificación de seguridad en streaming): https://huggingface.co/MatterWaveAI/s1-grt-mamba
- s1-grt-rnn (verificación de trayectorias con RNN): https://huggingface.co/MatterWaveAI/s1-grt-rnn
- Listado de modelos MatterWave en Hugging Face: https://huggingface.co/models?other=matterwave
- grt-10m (modelo relacionado del mismo autor): https://huggingface.co/MatterWaveAI/grt-10m
