# MatterWaveAI/helmholtz-mamba-b0.7.0-10m

## Resumen

HELMHOLTZ-Mamba-b0.7.0-10m es un modelo compacto de tipo state-space (SSM) desarrollado por MatterWaveAI, presentado como el escalón de 10M parámetros de la familia HELMHOLTZ-Mamba-1. Su propuesta técnica es una recurrencia selectiva formulada mediante transformaciones ortogonales que preservan la norma (determinante +1.000000), lo que elimina por construcción el desvanecimiento y la explosión de gradientes. Se distribuye como modelo de generación de texto bajo licencia Apache 2.0 y librería transformers, con un modelo base JEPA (helmholtz-jepa-b0.7.0-10m) del que deriva por fine-tuning.

El modelo se posiciona dentro de un stack de "world models" rotacionales: combina un SSM selectivo con un world model JEPA libre de colapso y un juez de trayectorias con memoria constante O(1). Según la model card, entrena mediante un escaneo de prefijo paralelo y ejecuta inferencia con estado recurrente fijo de 1,5 KB, sin caché KV, lo que permite longitudes de secuencia arbitrarias con coste computacional y de memoria constantes por token.

Es relevante ahora porque propone una alternativa a la atención cuadrática para contextos largos y para verificación de trayectorias en agentes, aunque la propia model card indica que los pesos, los detalles de implementación y el código fuente están retenidos durante el ciclo de publicación escalonada, lo que limita severamente su evaluación práctica.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Rotational-SSM (state-space model selectivo con transformaciones ortogonales); sin matrices lineales densas ni capas convolucionales 1D/2D |
| Parametros totales | ~13,8M almacenados (~34M de capacidad densa equivalente) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | Entrenamiento/evaluación hasta T = 8.192+; sin límite arquitectónico declarado por caché KV |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | no disponible (pesos retenidos según la model card) |

## Arquitectura y entrenamiento

La arquitectura es un SSM selectivo puramente rotacional: la transición de estado se implementa con transformaciones ortogonales de determinante +1.000000, de modo que la magnitud del estado homogéneo deriva menos de 5,0e-7 en float32 sobre más de 1.000 pasos recursivos (9,55e-15 en float64 a T = 8.192). El entrenamiento usa un escaneo de prefijo paralelo con paridad numérica de 3,81e-6 frente a la recurrencia paso a paso, mientras que la inferencia opera en O(1) de cómputo y memoria por token, con un estado recurrente fijo de 1,5 KB y cero bytes de caché KV. El modelo declara cero matrices lineales densas y cero capas convolucionales 1D/2D.

El modelo deriva por fine-tuning del world model JEPA helmholtz-jepa-b0.7.0-10m, que aporta la componente libre de colapso (retención de rango efectivo >= 96,0% sin negativos). No se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset, ni si hubo RLHF o DPO. La model card tampoco detalla la implementación concreta de la recurrencia ni los hiperparámetros de entrenamiento, que se declaran retenidos durante el ciclo de publicación escalonada.

## Capacidades

- Generación de texto autoregresiva (pipeline text-generation) sobre una recurrencia SSM con memoria constante.
- Verificación de trayectorias multi-hop (2 a 3 saltos) en tareas relacionales, según la evaluación XL-smol reportada.
- Razonamiento causal y sentido común físico en verificación de hipótesis.
- Verificación factual de un solo salto sobre un world model.
- Modos socráticos y epistémicos (SEE/SAY/DO/KNOW) en formato de verificación de cuatro modos.
- Inducción de reglas en rejillas visual-espaciales 2D (estilo ARC-AGI-2, subconjunto XL-smol).
- Enrutamiento de acciones para agentes con MPC, detección de deriva y defensa frente a inyección de prompts.
- Procesamiento de secuencias largas (T = 128 a 8.192+) con coste O(1) por token.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Capacidades multimodales (visión, audio): no disponibles en este modelo; la familia incluye variantes ómnimodales separadas.

## Casos de uso

- Verificación de trayectorias de agentes: el modelo actúa como juez de las acciones propuestas por un agente en un bucle MPC, evaluando si la secuencia de pasos es consistente con el estado del mundo; su estado recurrente fijo de 1,5 KB permite mantener el contexto de la trayectoria sin crecimiento de memoria.
- Defensa frente a inyección de prompts: integrado como filtro previo a la ejecución de herramientas, clasifica instrucciones sospechosas en flujos multi-turno; la model card reporta 99,75% de acierto top-1 en el suite de enrutamiento y defensa.
- Razonamiento sobre conocimiento estructurado: resolución de consultas multi-hop (2 a 3 saltos) sobre grafos de entidades, adecuado por su evalución declarada del 100% en el subconjunto XL-smol de multi-hop.
- Inducción de reglas en datos tabulares o de rejilla: aplicable a tareas de transformación de estructuras 2D (por ejemplo, validación de layouts o puzzles lógicos) gracias a su módulo de inducción de reglas visual-espaciales.
- Procesamiento de flujos de texto largos en dispositivos con recursos limitados: con ~13,8M parámetros y estado fijo de 1,5 KB, puede ejecutarse en CPU o GPUs de gama baja para clasificación y verificación de secuencias extensas sin caché KV.
- Filtrado y moderación de contenido en streaming: su inferencia O(1) por token permite evaluar continuamente un flujo de texto entrante y emitir una señal de verificación por paso, sin acumular estado.
- Componente de un sistema mayor de world modeling: como escalón de 10M de la escalera HELMHOLTZ, sirve para prototipar y validar pipelines de verificación antes de desplegar las variantes de 100M y 350M.

## Benchmarks y rendimiento

Resultados reportados por el autor en la model card (subconjunto XL-smol). No se han verificado de forma independiente.

| Suite XL-smol | Registros | Preguntas | Top-1 | pass@2 | Consistencia de orden |
|---|---|---|---|---|---|
| Multi-hop relacional (2-3 saltos) | 1.000 | 2.000 | 100,00% | 100,00% | 100,0% |
| Ciencia causal y sentido común físico | 1.000 | 2.000 | 100,00% | 100,00% | 100,0% |
| Verificación factual de un salto | 1.000 | 2.000 | 100,00% | 100,00% | 100,0% |
| Verificación socrática (SEE/SAY/DO/KNOW) | 1.000 | 2.000 | 100,00% | 100,00% | 100,0% |
| Inducción de reglas en rejilla 2D (ARC-AGI-2 XL-smol) | 600 | 1.800 core | 100,00% | 100,00% | 100,0% |
| Enrutamiento MPC de acciones y defensa | 403 | 1.209 | 99,75% | 100,00% | 100,0% |
| Agregado 6 suites (macro / micro) | 5.003 | 11.009 core | 99,96% / 99,98% | 100,00% | 100,0% |
| Benchmark consolidado 12 dominios (data_master_v8_xl) | 10.130 | 25.687 core | 86,51% macro | 79,97% micro | 100,0% |

Invariantes arquitectónicos verificados según el autor: determinante de la transición selectiva +1.000000000000; deriva de norma a 8.192 pasos de 9,55e-15 (f64) y < 5,0e-7 (f32); paridad escaneo-recurrencia de 3,81e-6; crecimiento de memoria KV de 0 bytes; retención de rango efectivo JEPA >= 96,0%.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible con precisión; con ~13,8M parámetros, en fp32 ocuparía aproximadamente 55 MB de pesos y en fp16 unos 28 MB, más un estado recurrente fijo de 1,5 KB. Estas cifras son estimaciones a partir del recuento de parámetros, no datos publicados.
- GPU recomendadas: cualquier GPU moderna es sobredimensionada; el modelo cabe en GPUs de gama de entrada e incluso en CPU. No se especifican recomendaciones oficiales.
- Cabe en GPU de consumo: sí, con amplio margen (RTX 3060, RTX 4090, etc.), aunque no hay guía oficial de despliegue.
- Opciones de despliegue: la librería declarada es transformers; no se confirma soporte de vLLM, llama.cpp, Ollama o TGI. La model card indica que los pesos y el código están retenidos, por lo que el despliegue práctico no es posible en el momento de la ficha.
- Latencia y throughput: no disponibles. La arquitectura promete O(1) de cómputo y memoria por token, pero no se publican mediciones de latencia ni tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| HELMHOLTZ-Mamba-b0.7.0-10m | ~13,8M (~34M equiv.) | 8.192+ | SSM rotacional + JEPA | Apache 2.0 | Pesos retenidos |
| HELMHOLTZ-Mamba-1 | no disponible | no disponible | SSM rotacional, escalón superior | Apache 2.0 | Publicado en HF |
| HELMHOLTZ-1-omni | no disponible | no disponible | Any-to-Any multimodal (JEPA, platonic) | Apache 2.0 | Publicado en HF |
| HELMHOLTZ-100M (anunciado) | ~195M equiv. | no disponible | JEPA + SSM + RNN unificados | no disponible | Anunciado |

No se dispone de comparaciones con modelos de terceros de la misma categoría (por ejemplo, Mamba estándar o transformers pequeños) en la información proporcionada.

## Limitaciones y advertencias

- Pesos, implementación y código fuente retenidos: la model card indica explícitamente que se ocultan durante el ciclo de publicación escalonada, por lo que no es posible reproducir ni desplegar el modelo.
- Benchmarks autoevaluados: los resultados del 100% en varias suites XL-smol proceden del propio autor y no han sido verificados de forma independiente; el agregado de 12 dominios baja al 86,51% macro y 79,97% micro, lo que sugiere sobreajuste a los subconjuntos específicos.
- Idiomas soportados no declarados: no hay información sobre cobertura multilingüe ni sobre calidad en castellano.
- Riesgo de alucinación: no cuantificado en la información disponible; al ser un modelo de verificación y no un generador general, su uso como generador de texto libre no está validado.
- Sesgos conocidos: no disponibles.
- Limitaciones de contexto: aunque la arquitectura soporta T = 8.192+, no se documenta el rendimiento en tareas de recuperación de información en el contexto ni en longitudes superiores.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero la ausencia de pesos hace que la licencia sea inaplicable en la práctica hasta su publicación.
- Caveat de producción: el estado recurrente fijo de 1,5 KB implica una compresión muy agresiva de la historia; para tareas que requieran recuperación literal de pasajes largos, un transformer con atención completa puede ser más fiable.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/MatterWaveAI/helmholtz-mamba-b0.7.0-10m
- Modelo base JEPA: https://huggingface.co/MatterWaveAI/helmholtz-jepa-b0.7.0-10m
- Familia HELMHOLTZ-Mamba-1: https://huggingface.co/MatterWaveAI/helmholtz-mamba-1
- HELMHOLTZ-1: https://huggingface.co/MatterWaveAI/helmholtz-1
- HELMHOLTZ-1-omni: https://huggingface.co/MatterWaveAI/helmholtz-1-omni
- HELMHOLTZ-RNN-1: https://huggingface.co/MatterWaveAI/helmholtz-rnn-1
- S1-GRT-JEPA: https://huggingface.co/MatterWaveAI/s1-grt-jepa
- S1-GRT-Mamba: https://huggingface.co/MatterWaveAI/s1-grt-mamba
- S1-GRT-RNN: https://huggingface.co/MatterWaveAI/s1-grt-rnn
- Paper referenciado (arXiv): arxiv:2610.39302 (citado en la model card de helmholtz-1-omni)
