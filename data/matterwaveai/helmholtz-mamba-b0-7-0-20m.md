# MatterWaveAI/helmholtz-mamba-b0.7.0-20m

## Resumen

HELMHOLTZ-Mamba-b0.7.0-20m es un modelo de espacio de estados selectivo puramente rotacional (Rotational-SSM) desarrollado por MatterWaveAI, presentado como el escalón de 20M parámetros de la familia HELMHOLTZ-Mamba-1. El modelo combina una recurrencia SSM basada en transformaciones ortogonales (determinante +1.000000) con un world model JEPA libre de colapso, y se posiciona como un juez de trayectorias con memoria constante O(1). Según la model card, almacena aproximadamente 26,4M de parámetros con una capacidad densa equivalente de unos 66M, sin matrices lineales densas ni capas convolucionales 1D/2D.

La propuesta técnica central es la estabilidad numérica por construcción: la magnitud del estado homogéneo deriva menos de 5,0e-7 en float32 a lo largo de más de 1.000 pasos recursivos, y la inferencia mantiene un estado recurrente fijo de 2,25 KB sin caché KV, independientemente de la longitud de secuencia. El entrenamiento se realiza mediante un escaneo de prefijo paralelo con paridad numérica de 3,81e-6 frente a la recurrencia paso a paso.

Es relevante ahora porque propone una alternativa a la arquitectura transformer para tareas de verificación de trayectorias y enrutamiento de agentes con coste de memoria constante, aunque la release es una preview: los pesos, los detalles de implementación y el código fuente están retenidos durante el ciclo de publicación escalonada del world model.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Rotational-SSM (state-space model selectivo con transformaciones ortogonales, det = +1.000000); sin matrices lineales densas ni convoluciones 1D/2D |
| Parametros totales | ~26,4M almacenados (~66M de capacidad densa equivalente) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | evaluado de T = 128 a 8.192+; sin límite arquitectónico declarado por caché KV (0 bytes) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | no disponible (pesos retenidos en la release preview) |

## Arquitectura y entrenamiento

La arquitectura es un SSM selectivo puramente rotacional: la transición de estado se formula mediante transformaciones ortogonales con determinante +1.000000, lo que garantiza que la norma del estado se conserve y evita por construcción el desvanecimiento o la explosión de gradientes. El modelo declara cero matrices lineales densas y cero capas convolucionales 1D/2D, lo que lo separa de implementaciones tipo Mamba convencionales. El entrenamiento usa un escaneo de prefijo paralelo con paridad numérica de 3,81e-6 respecto a la recurrencia paso a paso, mientras que la inferencia opera en O(1) de cómputo y memoria por token con un estado recurrente fijo de 2,25 KB.

El modelo se construye sobre MatterWaveAI/helmholtz-jepa-b0.7.0-20m como modelo base y hereda el componente JEPA de world model libre de colapso, con una retención de rango efectivo declarada de al menos el 96,0% sin negativos. La model card no detalla el volumen de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO. Tampoco se publican los detalles de implementación ni el código fuente en esta fase.

## Capacidades

- Verificación de rollout relacional multi-hop (2 a 3 saltos) como juez de trayectorias.
- Verificación de ciencia causal y sentido común físico.
- Verificación factual de un solo salto sobre el world model.
- Verificación socrática y epistémica en 4 modos (SEE/SAY/DO/KNOW).
- Inducción de reglas en rejillas visuales-espaciales 2D (evaluado sobre ARC-AGI-2 XL-smol).
- Enrutamiento de acciones de agente mediante MPC (model predictive control), con defensa frente a deriva y prompt injection.
- Inferencia con memoria constante O(1) y sin caché KV en secuencias largas.
- Generación de texto declarada en el pipeline (text-generation), si bien la evaluación publicada se centra en tareas de juicio y verificación.
- No se documentan capacidades multimodales, de audio, de visión general ni de tool calling en la información disponible.

## Casos de uso

- Verificación de trayectorias de agentes: el modelo actúa como juez que evalúa si una secuencia de acciones es coherente con el estado del mundo, con coste O(1) por token y estado fijo de 2,25 KB, lo que permite monitorizar rollouts largos sin crecer en memoria.
- Enrutamiento de acciones con MPC: dado un conjunto de acciones candidatas, el modelo puntúa y selecciona la más adecuada en cada paso, con defensa declarada frente a prompt injection en el conjunto de evaluación de routing.
- Filtro de seguridad en streaming: su naturaleza SSM con memoria constante lo hace apto para verificar flujos continuos de decisiones sin acumular contexto.
- Razonamiento multi-hop sobre grafos relacionales: útil para validar cadenas de deducción de 2 a 3 saltos en pipelines de question answering estructurado.
- Validación de sentido común físico en simulación: comprobar si una secuencia de eventos simulados respeta restricciones causales antes de ejecutarla en un entorno real.
- Inducción de reglas en tareas de rejilla: aplicable a la resolución y verificación de transformaciones espaciales 2D en entornos tipo ARC-AGI.
- Módulo de verificación epistémica: distinguir entre lo que un agente sabe, dice, hace y ve en flujos de diálogo estructurado.

## Benchmarks y rendimiento

Resultados publicados en la model card sobre el conjunto XL-smol (modelo de 20M):

| Suite de evaluacion | Registros | Preguntas | Top-1 | pass@2 | Consistencia de orden |
|---|---|---|---|---|---|
| Rollout relacional multi-hop (2-3 saltos) | 1.000 | 2.000 | 100,00% | 100,00% | 100,0% |
| Ciencia causal y sentido comun fisico | 1.000 | 2.000 | 100,00% | 100,00% | 100,0% |
| Verificacion factual de un solo salto | 1.000 | 2.000 | 100,00% | 100,00% | 100,0% |
| Verificacion socratica 4 modos | 1.000 | 2.000 | 100,00% | 100,00% | 100,0% |
| Induccion de reglas en rejilla 2D (ARC-AGI-2 XL-smol) | 600 | 1.800 core (3.600 total) | 100,00% | 100,00% | 100,0% |
| Routing MPC, deriva y prompt injection | 403 | 1.209 | 99,75% | 100,00% | 100,0% |
| Agregado 6 suites XL-smol (macro / micro) | 5.003 | 11.009 core (12.809 total) | 99,96% / 99,98% | 100,00% | 100,0% |
| Benchmark consolidado 12 dominios (data_master_v8_xl) | 10.130 | 25.687 core (27.487 total) | 86,51% macro | 79,97% core micro | 100,0% |

Invariantes arquitectónicos verificados:

| Invariante | Objetivo | Resultado | Estado |
|---|---|---|---|
| Capas lineales densas / conv 1D / conv 2D | 0 / 0 / 0 | 0 / 0 / 0 | PASS |
| Paridad escaneo paralelo vs. recurrencia O(1) | < 1e-5 | 3,81e-6 | PASS |
| Determinante de la transicion de estado | +1.000000 | +1.000000000000 | PASS |
| Deriva de norma a 8.192 pasos | < 1e-6 | 9,55e-15 f64 / < 5,0e-7 f32 | PASS |
| Crecimiento de cache KV (T = 128 a 8.192) | 0 bytes | 0 bytes (estado fijo 2,25 KB) | PASS |
| Retencion de rango efectivo JEPA (0 negativos) | >= 90,0% | >= 96,0% | PASS |

No se han publicado resultados de benchmarks estándar de NLP (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con ~26,4M parámetros almacenados, en fp16 serían aproximadamente 53 MB de pesos, y en fp32 unos 106 MB, sin contar overhead de runtime.
- GPU recomendadas: no disponibles; por tamaño, cualquier GPU consumer moderna debería poder alojar los pesos.
- Cabe en GPU consumer: previsiblemente sí en cualquier GPU con al menos 1-2 GB de VRAM libre, aunque no hay confirmación oficial.
- Opciones de despliegue: la model card declara compatibilidad con transformers y endpoints_compatible; no se confirma soporte de vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles; la arquitectura declara O(1) de cómputo y memoria por token en inferencia recurrente.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| HELMHOLTZ-Mamba-b0.7.0-20m | ~26,4M almacenados (~66M denso equivalente) | 8.192+ evaluado | Rotational-SSM + JEPA world model | Apache 2.0 | Preview; pesos retenidos |
| HELMHOLTZ-Mamba-1 | no disponible | no disponible | Rotational-SSM + JEPA + juez O(1) | Apache 2.0 | Publicado en HF |
| HELMHOLTZ-1-omni | no disponible | no disponible | Any-to-Any, 5 modalidades, Platonic alignment | Apache 2.0 | Publicado en HF |
| HELMHOLTZ-100M (anunciado) | ~195M denso equivalente | no disponible | JEPA + SSM + RNN unificados | no disponible | Anunciado |

No se dispone de comparación con modelos transformer de propósito general del mismo tamaño en la información proporcionada.

## Limitaciones y advertencias

- Release preview: los pesos, los detalles de implementación y el código fuente están retenidos; no es posible desplegar el modelo a partir de esta ficha.
- Los benchmarks publicados son internos (XL-smol, data_master_v8_xl) y no están validados de forma independiente.
- Las cifras de 100% en varias suites sugieren posible sobreajuste al conjunto de evaluación o filtrado del mismo; conviene tratarlas con cautela.
- No hay información sobre sesgos, idiomas soportados ni comportamiento multilingüe.
- Riesgo de alucinación no cuantificado; el modelo está orientado a verificación, no a generación abierta.
- La licencia Apache 2.0 permite uso comercial, pero al no haber pesos públicos no puede ejercerse todavía.
- El contexto máximo real no está especificado más allá de las pruebas hasta 8.192 tokens.
- No se documentan mecanismos de tool calling ni integración con frameworks de agentes estándar.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/MatterWaveAI/helmholtz-mamba-b0.7.0-20m
- Modelo base: https://huggingface.co/MatterWaveAI/helmholtz-jepa-b0.7.0-20m
- HELMHOLTZ-Mamba-1: https://huggingface.co/MatterWaveAI/helmholtz-mamba-1
- HELMHOLTZ-1: https://huggingface.co/MatterWaveAI/helmholtz-1
- HELMHOLTZ-1-omni: https://huggingface.co/MatterWaveAI/helmholtz-1-omni
- HELMHOLTZ-RNN-1: https://huggingface.co/MatterWaveAI/helmholtz-rnn-1
- S1-GRT-JEPA: https://huggingface.co/MatterWaveAI/s1-grt-jepa
- S1-GRT-Mamba: https://huggingface.co/MatterWaveAI/s1-grt-mamba
- S1-GRT-RNN: https://huggingface.co/MatterWaveAI/s1-grt-rnn
