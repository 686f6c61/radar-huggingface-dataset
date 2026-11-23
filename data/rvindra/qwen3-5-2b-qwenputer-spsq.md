# rvindra/Qwen3.5-2B-Qwenputer-SPSQ

## Resumen

Qwen3.5-2B-Qwenputer-SPSQ es un modelo de lenguaje experimental de 2B parámetros publicado por el usuario rvindra en Hugging Face, derivado por cuantización y reestructuración del modelo base Qwen/Qwen3.5-2B. Su particularidad no es la generación de texto en sí, sino que incorpora una CPU RISC-V de 32 bits (`rv32im_zba`) junto con un coprocesador de enteros grandes de 62 dígitos compilada analíticamente dentro de los pesos del transformer. El objetivo es delegar la aritmética simbólica exacta a un circuito determinista embebido, evitando que el modelo de lenguaje "calcule de cabeza" y alucine cifras.

El modelo es un port comprimido y desacoplado de la referencia divagr1925/Qwen3.5-4B-Qwenputer, adaptado al backbone de 2B para que quepa en hardware de consumo con 8 GB de VRAM. Mediante la técnica Subspace-Pruned Split Quantization (SPSQ), la arquitectura densa de referencia de 18,8 GB se reduce a 1,97 GB (backbone de lenguaje en W4A16 más circuito simbólico en BF16), con un pico de VRAM de aproximadamente 2,91 GB.

Es relevante ahora porque demuestra un enfoque híbrido poco habitual: en lugar de mejorar la aritmética del LLM con más datos o RL, se incrusta un intérprete determinista en los pesos y se enruta la ejecución mediante tool calling. El resultado son cifras de precisión del 100 % en los cinco benchmarks aritméticos reportados, frente al 25 % del modelo base de 2B. La licencia es Apache 2.0 y el idioma declarado es únicamente inglés.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer Qwen3.5 con capas DeltaNet (gated-deltanet) y prefijo compilado de CPU RISC-V rv32im_zba; 24 capas de lenguaje, 16 value heads en el LM y 32 value heads en el prefijo compilado |
| Parámetros totales | No disponible (modelo base de 2B; el checkpoint ocupa 1,97 GB tras SPSQ) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | W4A16 en las 24 capas de lenguaje; BF16 exacto en el circuito CPU compilado |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | No disponible explícitamente; el repo usa la librería transformers y ocupa 3,0 GB |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.5-2B, un transformer con capas DeltaNet (atención lineal con estado recurrente) y dimensiones nativas de 2.048 en el hidden size, 16 value heads y 6.144 unidades intermedias en la FFN. Sobre ese backbone se antepone un prefijo compilado que implementa una CPU RISC-V de 32 bits con extensión `zba` y un coprocesador de enteros grandes de 62 dígitos. La geometría es heterogénea: el circuito requiere 32 value heads DeltaNet y hasta 8.149 unidades MLP por capa, mientras que el LM mantiene sus dimensiones nativas. La técnica SPSQ resuelve ese desajuste mediante un split-and-bypass desacoplado que conserva el prefijo compilado de 32 heads (`d_cpu = 1.328`) y las dimensiones nativas del LM (`d_base = 2.048`).

No se detalla en la información disponible el volumen de tokens de entrenamiento, la composición del dataset ni si hubo fases de RLHF o DPO; el modelo se presenta como una versión base previa a SFT. La innovación principal es la compilación analítica de los pesos del circuito, la serialización de buffers de firmware (`calc-bridge.elf` y directorio de RAM `FSv1`) y la compilación de una compuerta de enmascaramiento de traza en pesos (`InWeightTraceMasker`) que permite ejecutar `model.generate()` de forma autónoma sin procesos controladores externos. La cuantización asimétrica (4 bits en el LM, BF16 exacto en el circuito) preserva la determinismo del cómputo simbólico.

## Capacidades

- Generación de texto conversacional en inglés sobre el backbone Qwen3.5-2B.
- Aritmética simbólica exacta de enteros grandes (hasta 62 dígitos) mediante la CPU RISC-V embebida, con invocación vía tool calling (`calc`).
- Tool calling y delegación de expresiones completas al circuito compilado cuando se usa el system prompt recomendado.
- Ejecución standalone con `model.generate()` sin driver externo, gracias al enmascaramiento de traza en pesos.
- Supresión automática de prosa aritmética manual cuando el prompt contiene `\boxed{}` y `suppress_prose_starters=None`, forzando la salida a `\boxed{answer}<|im_end|>`.
- Modo conversacional general sin restricciones cuando no se activa la supresión (divergencia KL ≤ 0,088 nats/token respecto al base 2B).
- Soporte de `enable_thinking=False` para desactivar el razonamiento en prosa y evitar que el LM intente calcular manualmente.
- Generación de código Python (heredada del base) sin restricciones cuando la supresión de prosa está inactiva.

## Casos de uso

- Calculadora simbólica determinista en asistentes: se integra el modelo con el system prompt recomendado y se enrutan las expresiones aritméticas al tool `calc`, obteniendo resultados exactos de hasta 62 dígitos sin riesgo de alucinación numérica.
- Verificación de cálculos en pipelines financieros o científicos: el circuito RISC-V produce trazas deterministas (0 desajustes en 742.237 tokens de traza verificados), lo que permite auditar cada paso del cómputo frente a una especificación de referencia.
- Despliegue en hardware de consumo: con un pico de ~2,91 GB de VRAM, cabe en GPUs de 8 GB y permite ejecutar un asistente con calculadora exacta en estaciones de trabajo modestas o portátiles.
- Evaluación de investigación sobre cómputo en pesos: sirve como banco de pruebas para estudiar compilación analítica de circuitos en transformers, cuantización asimétrica y enrutamiento LLM-circuito.
- Asistente educativo de matemáticas: el modelo explica el procedimiento en prosa y delega la evaluación final al circuito, mostrando el resultado en `\boxed{}` de forma fiable.
- Generación de código con verificación aritmética: en tareas de programación que requieren comprobar resultados numéricos, el modelo puede generar el código y validar los cálculos con el circuito embebido.
- Benchmarking de robustez aritmética: útil para comparar la precisión de LLMs pequeños con y sin delegación simbólica en conjuntos como `dmx_mul_big` o `dmx_div_big`.

## Benchmarks y rendimiento

Evaluación con decodificación greedy sobre cinco benchmarks aritméticos de varios dígitos, con presupuesto de 1.536 tokens.

| Benchmark | Base 4B | 4B Qwenputer | 4B Pytool (host) | Base 2B | 2B Pytool (host) | Qwen3.5-2B-Qwenputer-SPSQ |
|---|---|---|---|---|---|---|
| `arith` (aritmética entera sintética) | 75,0 % | 97,5 % | 97,5 % | 15,0 % | 100,0 % | 100,0 % |
| `dmx_mul_big` | 55,0 % | 97,5 % | 100,0 % | 35,0 % | 95,0 % | 100,0 % |
| `dmx_div_big` | 72,5 % | 97,5 % | 95,0 % | 25,0 % | 95,0 % | 100,0 % |
| `dmx_mul_div_multiple_longer` | 90,0 % | 100,0 % | 97,5 % | 5,0 % | 30,0 % | 100,0 % |
| `dmx_add_or_sub_big` | 87,5 % | 97,5 % | 97,5 % | 45,0 % | 95,0 % | 100,0 % |
| **Precisión media** | **76,0 %** | **98,0 %** | **97,5 %** | **25,0 %** | **83,0 %** | **100,0 %** |

Latencia y duración (tiempo total y por problema):

| Benchmark | Base 2B | 2B Pytool (host) | Qwen3.5-2B-Qwenputer-SPSQ | Tiempo de circuito en GPU |
|---|---|---|---|---|
| `arith` | 622,3 s (31,1 s/p) | 124,0 s (6,2 s/p) | 161,1 s (8,1 s/p) | 50,9 s |
| `dmx_mul_big` | 493,4 s (24,7 s/p) | 124,2 s (6,2 s/p) | 130,6 s (6,5 s/p) | 34,2 s |
| `dmx_div_big` | 468,0 s (23,4 s/p) | 134,3 s (6,7 s/p) | 149,6 s (7,5 s/p) | 54,4 s |
| `dmx_mul_div_multiple_longer` | 540,0 s (27,0 s/p) | 551,6 s (27,6 s/p) | 435,7 s (21,8 s/p) | 321,2 s |
| `dmx_add_or_sub_big` | 411,3 s (20,6 s/p) | 173,4 s (8,7 s/p) | 155,3 s (7,8 s/p) | 38,8 s |
| **Total** | **2.535,0 s (25,4 s/p)** | **1.107,5 s (11,1 s/p)** | **1.032,2 s** | — |

Además, el autor reporta 0 desajustes de lockstep en 742.237 tokens de traza de circuito en GPU (1.709.103 tokens verificados en total) frente a la especificación de CPU de referencia.

## Requisitos de hardware

- VRAM estimada: ~2,91 GB de pico en inferencia; checkpoint de 1,97 GB (W4A16 + BF16 del circuito).
- Cabe en GPUs de consumo de 8 GB (el autor lo posiciona explícitamente para hardware de consumo con 8 GB de VRAM).
- GPU recomendadas: no se especifican modelos concretos; cualquier GPU con al menos 8 GB de VRAM debería ser suficiente según el perfil de memoria declarado.
- Opciones de despliegue: librería `transformers` con `QwenputerSPSQForCausalLM.generate()`; no se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia observada en benchmarks: entre 6,5 y 21,8 segundos por problema según el conjunto, con tiempos de circuito en GPU de 34,2 a 321,2 segundos por benchmark completo.
- Throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Precisión media aritmética | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.5-2B-Qwenputer-SPSQ | 2B (base) | No disponible | 100,0 % | Apache 2.0 | Hugging Face |
| Qwen/Qwen3.5-2B (base) | 2B | No disponible | 25,0 % | No disponible | Hugging Face |
| divagr1925/Qwen3.5-4B-Qwenputer | 4B | No disponible | 98,0 % | No disponible | Hugging Face |
| 2B Pytool (host) | 2B | No disponible | 83,0 % | No disponible | Referencia del benchmark |

La ventaja diferencial frente a los modelos base es la delegación determinista al circuito embebido, que eleva la precisión aritmética al 100 % con un coste de VRAM menor que la variante de 4B.

## Limitaciones y advertencias

- Es una versión base previa a SFT; el autor advierte que la delegación fiable al tool requiere `enable_thinking=False` y, cuando proceda, la supresión de prosa.
- Si se permite el razonamiento en prosa sin restricciones, el LM intenta calcular manualmente y alucina números en lugar de invocar el circuito.
- La supresión de prosa solo se activa automáticamente si el prompt contiene `\boxed{}`; en conversación general la supresión queda inactiva.
- El idioma declarado es únicamente inglés; no hay soporte multilingüe documentado.
- La longitud de contexto no está especificada en la información disponible.
- El modelo está orientado a aritmética entera grande; no se documentan capacidades de visión, audio ni agentes multi-paso generales.
- La licencia Apache 2.0 permite uso comercial, pero el modelo depende del base Qwen/Qwen3.5-2B y de la referencia de 4B, cuyas condiciones conviene verificar por separado.
- El rendimiento en tareas distintas de la aritmética simbólica no está evaluado en la información disponible; la divergencia KL frente al base (≤ 0,088 nats/token) sugiere degradación mínima en diálogo, pero no hay benchmarks generales.
- Riesgo de alucinación en prosa explicativa y en cualquier cálculo que no se enrute al circuito.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/rvindra/Qwen3.5-2B-Qwenputer-SPSQ
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-2B
- Referencia Qwen3.5-4B-Qwenputer: https://huggingface.co/divagr1925/Qwen3.5-4B-Qwenputer
