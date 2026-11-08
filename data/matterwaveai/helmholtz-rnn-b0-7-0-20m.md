# MatterWaveAI/helmholtz-rnn-b0.7.0-20m

## Resumen

HELMHOLTZ-RNN-b0.7.0-20m es un modelo de lenguaje compacto de tipo red neuronal recurrente (RNN) desarrollado por MatterWaveAI, publicado como el escalón de 20M de su familia HELMHOLTZ-RNN-1. Se presenta como una RNN puramente rotacional con compuertas unitarias (denominada Rotational-RNN, Unitary-GRU o Rotational-minGRU) que combina un escaneo paralelo tipo minGRU con un modo no lineal acoplado al estado. Su propuesta central es lograr transiciones de estado mediante transformaciones ortogonales con determinante +1, evitando por construcción el desvanecimiento o la explosión de gradientes.

El modelo almacena unos 26,4M de parámetros y se describe como equivalente a unos 66M de capacidad densa, sin matrices lineales densas, sin capas convolucionales 1D o 2D y sin caché KV: mantiene un estado recurrente fijo de 2,25 KB y coste O(1) por token. Se posiciona como un "world model" JEPA libre de colapso y como juez de trayectorias con memoria constante, orientado a tareas de verificación, enrutamiento de acciones y razonamiento multi-hop en entornos de agentes.

Es relevante ahora porque propone una alternativa arquitectónica a los transformers para contextos largos con memoria acotada, aunque su model card es una "preview card" que retiene pesos, implementación y código fuente durante un ciclo de publicación escalonado. La información pública disponible es escasa y los resultados reportados proceden exclusivamente del autor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | RNN con compuertas rotacionales unitarias (Rotational-RNN / Unitary-GRU / Rotational-minGRU); escaneo paralelo tipo minGRU y modo no lineal acoplado al estado |
| Parametros totales | ~26,4M almacenados (~66M de capacidad equivalente densa, según el autor) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | hasta 8.192+ tokens reportados (T = 128 -> 8.192+); estado recurrente fijo de 2,25 KB |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | no disponible (pesos retenidos en la versión preview) |

## Arquitectura y entrenamiento

La arquitectura es una RNN con transiciones de estado definidas por transformaciones ortogonales de determinante +1.000000, lo que preserva la norma del estado oculto y evita por construcción el desvanecimiento o la explosión de gradientes: el autor reporta una deriva de magnitud inferior a 5,0e-7 en float32 y de 9,55e-15 en float64 tras 8.192 pasos. El modelo opera en dos modos: un escaneo paralelo geodésico tipo minGRU para entrenamiento, con paridad numérica de 3,81e-6 frente a la recurrencia paso a paso, y un modo Unitary-GRU no lineal con compuertas de reinicio y transición acopladas al estado oculto. No contiene matrices lineales densas ni capas convolucionales, y su inferencia no requiere caché KV.

El modelo deriva por fine-tuning del modelo base MatterWaveAI/helmholtz-jepa-b0.7.0-20m y se enmarca en la línea de "world models" JEPA del autor, con una retención de rango efectivo reportada de al menos el 96 % sin negativos (libre de colapso). No se especifican en la información disponible el volumen de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de RLHF o DPO. Tampoco se detalla la implementación concreta: el autor indica que los pesos, los detalles de implementación y el código fuente se retienen durante el ciclo de publicación escalonado.

## Capacidades

- Generación de texto como tarea declarada del pipeline (text-generation).
- Verificación de trayectorias y juicio de rollouts multi-hop (2 a 3 saltos) con memoria constante.
- Verificación factual de un solo salto y de sentido común físico y causal.
- Verificación socrática y epistémica en cuatro modos (SEE/SAY/DO/KNOW).
- Inducción de reglas en rejillas visuales-espaciales 2D (evaluado sobre ARC-AGI-2 en su variante XL-smol).
- Enrutamiento de acciones para agentes con MPC (model predictive control), con defensa frente a deriva y prompt injection.
- Razonamiento multi-paso y soporte de agentes, según la descripción del autor.
- Capacidades multilingües: no disponible.
- Soporte de tool calling / function calling: no disponible de forma explícita.
- Modo thinking, visión o audio: no disponible.

## Casos de uso

- Verificación de trayectorias de agentes: el modelo actúa como juez de las secuencias de acciones propuestas por un agente, evaluando cada paso con coste O(1) y sin crecimiento de memoria, lo que permite validar trayectorias muy largas en tiempo real.
- Enrutamiento de acciones con MPC: integrado en un bucle de control predictivo, selecciona la siguiente acción del agente entre un conjunto de candidatas y filtra intentos de prompt injection, gracias a su estado recurrente fijo de 2,25 KB.
- Razonamiento multi-hop sobre grafos de conocimiento: responde consultas que requieren encadenar dos o tres saltos relacionales, con la consistencia de orden de opciones reportada por el autor.
- Verificación de sentido común físico y causal: comprueba si una afirmación sobre el mundo es plausible, útil como filtro en pipelines de generación aumentada.
- Inducción de reglas en tareas de rejilla: resuelve problemas tipo ARC-AGI-2 en su variante XL-smol, aplicable a entornos de razonamiento abstracto y puzzles.
- Despliegue en el borde: con ~26,4M de parámetros y memoria constante, cabe en dispositivos con recursos muy limitados para tareas de clasificación y verificación en streaming.
- Filtro de seguridad en streaming: al no requerir caché KV, puede procesar secuencias arbitrariamente largas manteniendo memoria acotada, lo que lo hace apto para monitorización continua.

## Benchmarks y rendimiento

Los resultados proceden exclusivamente de la model card del autor y no han sido verificados de forma independiente. Se presentan tal cual se reportan.

| Suite (XL-smol) | Registros | Preguntas | Top-1 | pass@2 | Consistencia de orden |
|---|---|---|---|---|---|
| Verificación multi-hop relacional (2-3 saltos) | 1.000 | 2.000 | 100,00 % | 100,00 % | 100,0 % |
| Ciencia causal y sentido común físico | 1.000 | 2.000 | 100,00 % | 100,00 % | 100,0 % |
| Verificación factual de un salto | 1.000 | 2.000 | 100,00 % | 100,00 % | 100,0 % |
| Verificación socrática y epistémica (4 modos) | 1.000 | 2.000 | 100,00 % | 100,00 % | 100,0 % |
| Inducción de reglas en rejilla 2D (ARC-AGI-2) | 600 | 1.800 core | 100,00 % | 100,00 % | 100,0 % |
| Enrutamiento MPC, deriva y prompt injection | 403 | 1.209 | 99,75 % | 100,00 % | 100,0 % |
| Agregado de 6 suites (macro / micro) | 5.003 | 11.009 core | 99,96 % / 99,98 % | 100,00 % | 100,0 % |
| Benchmark consolidado de 12 dominios | 10.130 | 25.687 core | 86,51 % macro | 79,97 % micro | 100,0 % |

| Invariante arquitectónico | Objetivo | Resultado reportado |
|---|---|---|
| Capas lineales densas / conv. 1D / conv. 2D | 0 / 0 / 0 | 0 / 0 / 0 |
| Paridad escaneo paralelo vs. paso a paso | < 1e-5 | 3,81e-6 |
| Determinante de la transición recurrente | +1.000000 | +1.000000000000 |
| Deriva de norma a 8.192 pasos | < 1e-6 | 9,55e-15 (f64) / < 5,0e-7 (f32) |
| Crecimiento de caché KV (T = 128 -> 8.192) | 0 bytes | 0 bytes (estado fijo de 2,25 KB) |
| Retención de rango efectivo JEPA (0 negativos) | >= 90,0 % | >= 96,0 % |

No se han publicado resultados de benchmarks independientes en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; con ~26,4M de parámetros, en float32 ocuparía en torno a 105 MB de pesos y en float16 unos 53 MB, a lo que se suma un estado recurrente fijo de 2,25 KB por secuencia.
- GPU recomendadas: no especificadas por el autor; por tamaño, cualquier GPU consumer moderna (RTX 3060 o superior) sería suficiente en teoría.
- Cabe en GPU consumer: sí, por el reducido número de parámetros, aunque no hay confirmación oficial de requisitos.
- Opciones de despliegue: la model card declara compatibilidad con transformers y endpoints; no se detallan integraciones con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles. El autor destaca coste O(1) por token y ausencia de caché KV, lo que en teoría mantiene la latencia constante con la longitud de secuencia.

## Comparativa con modelos similares

No se dispone de datos verificables de modelos comparables de la misma categoría (RNN rotacionales de 20M) en la información proporcionada. La tabla siguiente recoge únicamente los datos del propio modelo y deja el resto como no disponible.

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad de pesos |
|---|---|---|---|---|
| HELMHOLTZ-RNN-b0.7.0-20m | ~26,4M | 8.192+ | Apache 2.0 | Retenidos (preview) |
| Modelos comparables de la familia | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Pesos, implementación y código fuente retenidos: la model card indica explícitamente que se publicarán en un ciclo escalonado, por lo que el modelo no es usable hoy.
- Resultados no verificados: todos los benchmarks proceden del autor, con puntuaciones de 100 % en varias suites que resultan atípicas y requieren validación independiente.
- Idiomas y cuantizaciones no documentados: no hay información sobre cobertura lingüística ni sobre formatos de cuantización disponibles.
- Riesgo de alucinación: no evaluado de forma independiente; el modelo está orientado a verificación más que a generación abierta, lo que limita su uso como generador general.
- Sesgos: no documentados en la información disponible.
- Licencia Apache 2.0: permite uso comercial, pero al no haber pesos publicados no puede ejercerse todavía.
- Enfoque de nicho: su diseño como juez de trayectorias y world model lo hace poco adecuado para generación de texto generalista frente a modelos transformer del mismo tamaño.
- Ausencia de soporte documentado de tool calling o function calling explícito.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/MatterWaveAI/helmholtz-rnn-b0.7.0-20m
- Modelo base: https://huggingface.co/MatterWaveAI/helmholtz-jepa-b0.7.0-20m
- Familia HELMHOLTZ-RNN-1: https://huggingface.co/MatterWaveAI/helmholtz-rnn-1
- HELMHOLTZ-1 (JEPA world model): https://huggingface.co/MatterWaveAI/helmholtz-1
- HELMHOLTZ-1-Omni (alineación multimodal): https://huggingface.co/MatterWaveAI/helmholtz-1-omni
- HELMHOLTZ-Mamba-1 (recurrencia SSM rotacional): https://huggingface.co/MatterWaveAI/helmholtz-mamba-1
- s1-grt-jepa (juez de trayectorias MPC): https://huggingface.co/MatterWaveAI/s1-grt-jepa
- s1-grt-mamba (verificación de seguridad SSM): https://huggingface.co/MatterWaveAI/s1-grt-mamba
- s1-grt-rnn (verificación de trayectorias RNN): https://huggingface.co/MatterWaveAI/s1-grt-rnn
- Modelos de MatterWaveAI en Hugging Face: https://huggingface.co/models?other=matterwave
- Helmholtz machine (Wikipedia, contexto teórico): https://en.wikipedia.org/wiki/Helmholtz_machine
