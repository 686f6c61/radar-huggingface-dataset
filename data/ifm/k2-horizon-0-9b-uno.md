# IFM/K2-Horizon-0.9B-Uno

## Resumen

K2-Horizon-0.9B-Uno es un adaptador LoRA condicional desarrollado por el Institute of Foundation Models (IFM) para el modelo base K2-Horizon-0.9B. Este adaptador implementa una técnica de decodificación por difusión (diffusion-style decoding) que modifica el proceso de generación del modelo base para mejorar su rendimiento en tareas de razonamiento, matemáticas y codificación. El repositorio contiene únicamente el adaptador (0,2 GB); los pesos del modelo base se alojan por separado en IFM/K2-Horizon-0.9B.

El modelo forma parte de la familia K2 Horizon, una colección de seis modelos open-source que IFM describe como la mayor publicación de modelos de IA completamente abierta de la historia, con acceso abierto a código de entrenamiento y datos. Este adaptador se distribuye bajo licencia Apache 2.0 y está diseñado para su uso con el modelo base, que tiene aproximadamente 0.900 millones de parámetros. La combinación del adaptador y el base ofrece resultados competitivos en benchmarks de matemáticas y código, como se detalla en la sección de evaluación.

La relevancia de este modelo radica en su enfoque innovador: aplicar decodificación por difusión a modelos de lenguaje mediante un adaptador LoRA condicional, lo que permite mejorar la calidad de generación sin necesidad de reentrenar el modelo base completo. Esto resulta especialmente útil para despliegues en entornos con recursos limitados, como dispositivos edge o GPUs de consumo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA condicional sobre modelo base K2-Horizon-0.9B (arquitectura del base no disponible) |
| Parametros totales | No disponible (el adaptador ocupa 0,2 GB; el base tiene 0,9B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponibles |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (libreria peft) |

## Arquitectura y entrenamiento

El adaptador K2-Horizon-0.9B-Uno emplea una técnica de LoRA condicional (conditional-LoRA) que se integra en el proceso de decodificación del modelo base. En lugar de la generación autoregresiva tradicional, el modelo utiliza un enfoque de difusión que refina iterativamente la salida, lo que permite una mejora en la coherencia y precisión de las respuestas. Los 392 tensores del adaptador mapean a pesos válidos del modelo base público, lo que garantiza compatibilidad total.

No se han publicado detalles específicos sobre el conjunto de datos de entrenamiento, el número de tokens utilizados ni el procedimiento exacto (RLHF, DPO, etc.) en la información disponible. La model card menciona que los scripts de evaluación están disponibles en GitHub, pero la suite completa de entrenamiento se publicará próximamente.

## Capacidades

- Razonamiento de contexto largo: el adaptador muestra resultados en el benchmark AA-LCR (18.0), lo que sugiere cierta capacidad para manejar tareas que requieren comprensión de información distribuida en secuencias extensas.
- Conocimiento científico y general: alcanza un 78.2% en ARC-Challenge y un 27.3% en GPQA-Diamond (avg@16), lo que indica un nivel moderado de conocimiento factual.
- Matemáticas: destaca en GSM8K (88.2%), MATH500 (86.2%) y AIME 2024 (43.3%), evidenciando competencia en resolución de problemas aritméticos y de nivel de olimpiada.
- Codificación: obtiene 62.8% en HumanEval y 79.9% en HumanEval+ (pass@1), así como 70.4% en MBPP, lo que demuestra habilidades sólidas en generación de código.
- Seguimiento de instrucciones: logra un 80.8% en IFEval (strict instruction), indicando buena capacidad para adherirse a formatos y restricciones especificados.
- No se dispone de información sobre tool calling, capacidades multimodales o soporte de agentes.

## Casos de uso

- Asistencia educativa en matemáticas: el modelo puede resolver problemas de nivel de bachillerato y olimpiada (AIME, HMMT) con precisión notable, por lo que es adecuado para herramientas de tutoría o generación de ejercicios explicados paso a paso.
- Generación de código en entornos con recursos limitados: al ser un modelo de 0.9B con un adaptador ligero, puede integrarse en pipelines de desarrollo que requieran autocompletado o sugerencias de código sin necesidad de GPUs de alta gama, por ejemplo en entornos CI/CD o en editores embebidos.
- Razonamiento científico para chatbots de dominio específico: su rendimiento en ARC-Challenge y GPQA lo hace útil para sistemas de preguntas y respuestas en áreas como física, química o biología, especialmente cuando se despliega en dispositivos edge.
- Evaluación de modelos y benchmarks académicos: investigadores pueden usar este adaptador como referencia para estudiar el impacto de la decodificación por difusión en modelos pequeños, comparando con versiones sin el adaptador.
- Prototipado rápido de aplicaciones de lenguaje: gracias a su licencia Apache 2.0 y su pequeño tamaño, es ideal para experimentar con técnicas de difusión en generación de texto sin grandes costes de cómputo.
- Automatización de tareas de seguimiento de instrucciones: su buen resultado en IFEval lo hace apto para sistemas que deben cumplir formatos estrictos, como generación de informes estructurados o respuestas a formularios.

## Benchmarks y rendimiento

La model card proporciona los siguientes resultados del modelo con el adaptador (la columna TPF es una métrica de eficiencia proporcionada por el autor, probablemente relacionada con el tiempo por forward, aunque no se especifica su significado exacto):

| Benchmark | Precisión | TPF |
|---|---|---|
| AA-LCR (long-context reasoning) | 18.0 | 1.81 |
| ARC-Challenge | 78.2 | 1.46 |
| GPQA-Diamond (avg@16) | 27.3 | 1.59 |
| HLE (Full) | 5.4 | 1.53 |
| AA-Omniscience | 7.2 | 1.64 |
| AIME 2024 | 43.3 | 1.50 |
| AIME 2025 (avg@16) | 41.7 | 1.54 |
| AIME 2026 (avg@16) | 48.5 | 1.52 |
| GSM8K | 88.2 | 1.58 |
| HMMT February 2026 (avg@16) | 25.8 | -- |
| MATH500 (Full) | 86.2 | 1.57 |
| HumanEval | 62.8 | 1.79 |
| HumanEval+ (pass@1) | 79.9 | -- |
| LiveCodeBench v6 (avg@3) | 37.4 | -- |
| MBPP | 70.4 | 1.53 |
| MBPP+ (pass@1) | 68.0 | -- |
| IFEval (strict instruction) | 80.8% | 1.72 |

No se han publicado comparaciones con otros modelos en la información disponible.

## Requisitos de hardware

- El adaptador en sí es muy pequeño (0,2 GB), por lo que el requisito principal es el modelo base K2-Horizon-0.9B, que al tener 0,9B parámetros puede ejecutarse en GPUs de consumo con al menos 4-6 GB de VRAM en cuantización de 8 bits.
- GPU recomendadas: NVIDIA RTX 3060 o superior, o GPUs de datacenter como T4 o A10 para despliegues en producción.
- Es probable que quepa en tarjetas consumer de gama media, aunque no se dispone de confirmación oficial.
- Opciones de despliegue: al ser un adaptador PEFT, puede cargarse con librerías como Hugging Face Transformers y PEFT. Para inferencia, se puede usar vLLM, llama.cpp (si se convierte a GGUF) o TGI, siempre que soporten LoRA condicional.
- No se han publicado métricas de latencia o throughput específicas.

## Comparativa con modelos similares

No se dispone de información suficiente para realizar una comparativa con otros modelos de la misma categoría (0.9B con adaptador de difusión). Los benchmarks presentados son los únicos datos disponibles, y no se han contrastado con alternativas como Qwen2.5-0.5B, Llama-3.2-1B u otros modelos pequeños.

## Limitaciones y advertencias

- El rendimiento depende completamente del modelo base K2-Horizon-0.9B; si el base tiene sesgos o limitaciones, el adaptador no los corrige.
- No se ha evaluado el modelo en idiomas distintos del inglés (no se especifican idiomas soportados), por lo que su uso en otros idiomas es incierto.
- La técnica de decodificación por difusión puede aumentar la latencia en comparación con generación autoregresiva estándar, aunque no se han publicado datos al respecto.
- Los resultados de benchmarks provienen del autor y no han sido verificados de forma independiente; algunos valores como HLE (5.4) son bajos, lo que sugiere que el modelo no es adecuado para tareas de conocimiento extremadamente avanzado.
- La licencia Apache 2.0 permite uso comercial, pero se recomienda revisar los términos del modelo base, ya que su licencia no se especifica en esta ficha.
- El adaptador está diseñado específicamente para el modelo base indicado; no funcionará con otros modelos sin adaptaciones.

## Enlaces

- Repositorio del adaptador: https://huggingface.co/IFM/K2-Horizon-0.9B-Uno
- Modelo base: https://huggingface.co/IFM/K2-Horizon-0.9B
- Blog de IFM sobre K2 Horizon: https://ifm.ai/blog/k2
- Página de K2 Horizon: https://ifm.ai/k2/
- Scripts de evaluación en GitHub: https://github.com/ifm-ai/uno/tree/main/scripts/k2_horizon
