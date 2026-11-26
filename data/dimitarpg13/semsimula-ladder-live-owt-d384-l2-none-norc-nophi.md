# dimitarpg13/semsimula-ladder-live-owt-d384-l2-none-norc-nophi

## Resumen

`semsimula-ladder-live-owt-d384-l2-none-norc-nophi` es un modelo de lenguaje de investigación desarrollado por dimitarpg13 dentro del proyecto SemSimula, una línea de trabajo que explora modelos de lenguaje conservativos basados en mecánica lagrangiana y potenciales escalares en lugar de la atención transformer convencional. Este modelo concreto pertenece a la generación 3 del "ladder study" y es la celda VF0 del factorial "entrenado sin la fuerza de pares": se entrena desde cero sin red de score, sin enrutamiento top-k y sin potencial de pares, de modo que los tokens solo interactúan entre sí a través de cinco canales de contexto ξ enrutados por contenido.

El modelo tiene 76.434.307 parámetros, se entrena sobre OpenWebText con un presupuesto exacto de 532.480.000 tokens (32.500 pasos × 32 × 512) y alcanza una perplejidad de validación asentada de 61,06 en bloques de 512 tokens. Su relevancia es fundamentalmente metodológica: forma parte de un estudio pre-registrado de ablación de mecanismos que cuantifica el valor de la fuerza de pares (0,056 nats en este caso) y su interacción con el paso de modo rígido ("split" frente a "exact damped flow"), con el objetivo de entender qué componentes de esta arquitectura no-transformer aportan realmente capacidad predictiva.

No es un modelo pensado para producción ni para uso general: es una pieza de un experimento controlado con una semilla por celda, publicado con licencia CC-BY-4.0 y orientado a investigadores que estudien alternativas a la atención y modelos basados en energía.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | No-transformer, sin atención; modelo de lenguaje conservativo basado en potencial escalar y mecánica lagrangiana, con cinco canales de contexto ξ enrutados por contenido y potencial gaussiano anisotrópico |
| Parámetros totales | 76.434.307 |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (entrenado y evaluado con bloques de 512 tokens) |
| Tipos de cuantización | No disponible |
| Idiomas soportados | Inglés (en) |
| Licencia | CC-BY-4.0 |
| Formato de pesos | PyTorch (pytorch); no se especifican safetensors ni GGUF |

## Arquitectura y entrenamiento

El modelo es un "conservative language model" que sustituye la atención por un formalismo de mecánica lagrangiana con un potencial escalar. La dinámica se integra mediante un esquema BAOAB (integrador de Langevin) sobre una geometría riemanniana definida por una métrica de Jacobi, con geodesias riemannianas como base del flujo de información. La variante aquí publicada ("nophi") elimina la fuerza de pares V_φ: no hay red de score, ni enrutamiento top-k, ni potencial de pares; los tokens solo se influyen mutuamente mediante cinco canales de contexto ξ enrutados por contenido ("multi-channel xi"). El paso de modo rígido empleado es el "split", a diferencia de las variantes SR2 que usan "exact damped flow".

El entrenamiento se realizó desde cero sobre OpenWebText con el mismo corpus, tokenizador, schedule, batches y semilla que el resto de modelos de la tabla comparativa, con un presupuesto exacto de 532.480.000 tokens (32.500 pasos × 32 × 512). El run se describe como sano: sin disparos de watchdog ni de spikes, con norma de gradiente global superior a 1,0 en solo 5 de 650 pasos registrados (máximo 1,36, entre los pasos 20.500 y 22.650), 0,81 s por paso incluyendo evaluaciones sobre una GPU de 102 GB, y un pico de memoria de entrenamiento de 14,8 GB (18,9 GB con evaluación). El estudio es pre-registrado (llamadas VF-a, VN1 y VN2), con una semilla por celda.

## Capacidades

- Generación de texto autorregresiva en inglés, con perplejidad de validación de 61,06 en OpenWebText (bloques de 512).
- Modelado de lenguaje a nivel de token mediante dinámica conservativa, sin mecanismo de atención.
- Interacción entre tokens exclusivamente a través de cinco canales de contexto ξ enrutados por contenido.
- Integración numérica mediante BAOAB sobre geometría riemanniana con métrica de Jacobi.
- No dispone de tool calling ni function calling.
- No dispone de modo agente ni de razonamiento multi-paso explícito.
- Soporte multilingüe: únicamente inglés.
- Sin capacidades de visión, audio ni modo "thinking".

## Casos de uso

- Investigación en alternativas a la atención: el modelo sirve como punto de comparación controlado para estudiar si la interacción vía canales ξ puede sustituir a la atención en modelado de lenguaje, con un presupuesto de tokens fijo y reproducible.
- Estudios de ablación de mecanismos: al ser la celda VF0 del factorial "con/sin fuerza de pares" y "split/exact flow", permite aislar el valor marginal de cada componente midiendo diferencias de perplejidad en nats.
- Reproducción de experimentos pre-registrados: el autor documenta predicciones, probabilidades asignadas y resultados (HIT/MISS), lo que facilita la verificación independiente de las hipótesis.
- Benchmark de eficiencia de integradores: el modelo permite comparar el coste y la calidad del paso "split" frente al "exact damped flow" a igualdad de datos y semilla.
- Estudio de modelos basados en energía: útil para quienes investigan EBMs y modelos físicamente informados aplicados a texto, con una implementación PyTorch de referencia.
- Docencia y divulgación: ejemplo concreto y reproducible de arquitectura no-transformer con métricas publicadas, adecuado para explicar mecánica lagrangiana aplicada a modelado de lenguaje.
- Análisis de geometría riemanniana en representaciones: la métrica de Jacobi y las geodesias ofrecen un sustrato para estudiar la estructura del espacio latente.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (no verificados de forma independiente):

| Modelo | Paso de modo rígido | Fuerza de pares | Parámetros | PPL asentada | vs GPT-2 |
|---|---|---:|---:|---:|---:|
| Este modelo (VF0) | split | ninguna | 76.434.307 | 61,06 | 1,226× |
| F3.1 | split | entrenada | 76.572.110 | 57,76 | 1,160× |
| SR2 | exact damped flow | entrenada | 76.572.110 | 58,32 | 1,171× |
| SR2-NP | exact damped flow | ninguna | 76.434.307 | 58,51 | 1,175× |
| gpt2-matched | — | — | — | 49,81 | 1,000× |

La PPL asentada es la media de las tres últimas evaluaciones (61,01; 61,10; 61,08). El mejor valor puntual fue 59,23 en el paso 31.000, descrito por el autor como una evaluación baja aislada. El valor de la fuerza de pares en este modelo es v₀ = ln(61,06 / 57,76) = 0,056 nats (5,6%), frente a una dependencia de 0,282 nats al desactivarla en F3.1 ya entrenado. La interacción entre el paso de modo rígido y la fuerza de pares se estima en 0,052 nats.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; con 76,4 M de parámetros, en fp32 ocuparía aproximadamente 0,3 GB de pesos, y en fp16/bf16 alrededor de 0,15 GB, más overhead de activaciones y del integrador.
- GPU recomendadas: el autor reporta entrenamiento en una GPU de 102 GB (clase A100/H100 de 80 GB o superior) con pico de 14,8 GB (18,9 GB con evaluación); para inferencia basta una GPU consumer moderna.
- Cabe en GPU consumer: sí, previsiblemente en cualquier GPU con 4 GB o más, dado el tamaño del modelo, aunque no se publican cifras oficiales de inferencia.
- Opciones de despliegue: el repo usa PyTorch; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, y al no ser un transformer estándar es improbable que funcione sin adaptación en esos motores.
- Latencia y throughput: no disponibles para inferencia; en entrenamiento, 0,81 s por paso (batch 32 × 512) en una GPU de 102 GB.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | PPL (OpenWebText val) | Licencia | Disponibilidad |
|---|---:|---|---:|---|---|
| Este modelo (VF0) | 76,4 M | 512 (entrenamiento) | 61,06 | CC-BY-4.0 | Hugging Face |
| F3.1 | 76,6 M | 512 (entrenamiento) | 57,76 | CC-BY-4.0 | Hugging Face |
| SR2-NP | 76,4 M | 512 (entrenamiento) | 58,51 | CC-BY-4.0 | Hugging Face |
| gpt2-matched | No disponible | No disponible | 49,81 | No disponible | Hugging Face (dimitarpg13) |

Dentro de la misma familia SemSimula, SR2-NP domina a este modelo (58,51 frente a 61,06) con el mismo número de parámetros, y F3.1 es el mejor de la tabla con la fuerza de pares activa. El brazo gpt2-matched, con arquitectura transformer convencional y el mismo presupuesto de tokens, obtiene 49,81, claramente por delante de todas las variantes conservativas.

## Limitaciones y advertencias

- Modelo de investigación: no está pensado para uso en producción ni para aplicaciones de usuario final.
- Solo inglés; sin soporte multilingüe.
- Contexto limitado: entrenado y evaluado con bloques de 512 tokens; no se documenta capacidad de extrapolación.
- Una sola semilla por celda: las conclusiones del estudio tienen incertidumbre estadística; el propio autor estima un error estándar de ~0,012 nats en la diferencia de medias asentadas.
- Riesgo de alucinación y baja calidad de generación esperables: la perplejidad es un 22,6% peor que el brazo transformer equivalente (gpt2-matched).
- Sin soporte documentado de tool calling, agentes ni razonamiento multi-paso.
- Compatibilidad limitada con ecosistemas estándar (vLLM, llama.cpp, TGI) al no ser un transformer con atención.
- Licencia CC-BY-4.0: permite uso comercial con atribución, pero el modelo no está validado para tales fines.
- Los resultados de benchmarks son declarados por el autor y no están verificados de forma independiente (verified: false).

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/dimitarpg13/semsimula-ladder-live-owt-d384-l2-none-norc-nophi
- Modelo F3.1: https://huggingface.co/dimitarpg13/semsimula-ladder-live-owt-d384-l2-none-norc
- Modelo SR2: https://huggingface.co/dimitarpg13/semsimula-ladder-live-owt-d384-l2-none-norc-sr2
- Modelo SR2-NP: https://huggingface.co/dimitarpg13/semsimula-ladder-live-owt-d384-l2-none-norc-nophi-sr2
- Brazo gpt2-matched: https://huggingface.co/dimitarpg13/semsimula-ladder-owt-d384-l2-gpt2-matched
- Colección Gen 3: https://huggingface.co/collections/dimitarpg13/semantic-simulation-gen-3-cfc-baoab-live-gradients-6abf371ea3c83f127057020c
- Nota VF0 en GitHub: https://github.com/dimitarpg13/semsimula-paper/blob/main/companion_notes/depth_ladder/VF0_F31_Without_Pair_Force.md
- Dataset OpenWebText: https://huggingface.co/datasets/Skylion007/openwebtext
