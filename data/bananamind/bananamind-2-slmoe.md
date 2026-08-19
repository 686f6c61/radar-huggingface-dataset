# BananaMind/BananaMind-2-SLMoE

## Resumen

BananaMind-2-SLMoE es un modelo de lenguaje experimental de tipo mixture-of-experts (MoE) a nivel de secuencia, desarrollado por BananaMind como prueba de concepto para validar si el enrutamiento de expertos basado en secuencias completas (en lugar de por token) puede funcionar a pequeña escala. El checkpoint contiene 25,45 millones de parámetros teóricos totales, pero solo 7,90 millones están activos por mensaje, ya que un conjunto fijo de 13 expertos (de un total de 64) se selecciona para todo el mensaje y la respuesta generada. Con una ventana de contexto de 4.096 tokens y una arquitectura decoder-only causal, el modelo está pensado para investigar la viabilidad de cargar solo los expertos activos en memoria, lo que podría permitir en el futuro ejecutar modelos muy grandes en hardware limitado.

Este modelo no es una herramienta de producción, sino un checkpoint de investigación. Su principal interés radica en demostrar que el enrutamiento a nivel de secuencia se entrena de forma estable a esta escala, aunque los resultados de rendimiento son modestos y no superan a los de un MoE por token con recursos comparables. La publicación incluye benchmarks detallados y una discusión honesta sobre las limitaciones del enfoque, lo que lo convierte en un punto de partida útil para investigadores interesados en arquitecturas MoE eficientes en memoria.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE a nivel de secuencia, decoder-only transformer causal (8 capas, hidden 256, 8 heads de atención, 2 KV heads, 64 expertos, 13 activos por mensaje, SwiGLU, RoPE theta 100.000) |
| Parametros totales | 25,45 M (teórico) / 27,55 M (según safetensors) |
| Parametros activos | 7,90 M por mensaje (13 de 64 expertos) |
| Longitud de contexto | 4.096 tokens |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

BananaMind-2-SLMoE emplea una arquitectura MoE a nivel de secuencia, una variante poco común del MoE tradicional. En lugar de seleccionar expertos por token, un router lee un prefijo causal de los primeros 32 tokens válidos y elige un único conjunto de 13 expertos (de los 64 disponibles) que se aplica a todos los tokens del mensaje y de la respuesta generada. Esta decisión reduce drásticamente el número de conmutaciones de expertos durante la generación, lo que facilita la descarga de expertos inactivos a disco y su carga bajo demanda. La capa de expertos utiliza SwiGLU como activación, y la codificación posicional es RoPE con theta 100.000. El vocabulario es de 8.192 tokens, con un tokenizador BPE personalizado (no se detalla su construcción).

El entrenamiento se realizó desde cero con un currículo de 30.000 millones de tokens, según se indica en la página del modelo hermano BananaMind-2-MoE, aunque la model card de este checkpoint no especifica la composición exacta del dataset ni el uso de técnicas como RLHF o DPO. Los autores señalan que esta ejecución utilizó aproximadamente el doble de tokens de entrenamiento y cuatro veces el cómputo activo (top-13 frente a top-1) en comparación con BananaMind-2-MoE, por lo que la comparación de rendimiento no es controlada. El objetivo principal era comprobar la estabilidad del entrenamiento con enrutamiento por secuencia, no superar a otras arquitecturas.

## Capacidades

- Generación de texto causal: el modelo produce texto autoregresivamente a partir de un prompt, con soporte para muestreo (temperature, top-p) y penalización de repetición.
- Razonamiento básico y sentido común: los benchmarks muestran resultados bajos pero no nulos en tareas como ARC Easy (33,92) o PIQA (55,44), lo que indica cierta capacidad de comprensión superficial.
- Matemáticas simples: en ArithMark 2 y 3 obtiene puntuaciones de 26-34%, muy por debajo de lo esperado para un modelo útil, pero suficiente para operaciones aritméticas elementales.
- Soporte de tool calling / function calling: no disponible (no se menciona en la documentación).
- Soporte de agentes y multi-step reasoning: no disponible; el modelo es demasiado pequeño y no está diseñado para ello.
- Capacidades multilingües: no disponible; no se especifican idiomas soportados.
- Capacidades especiales: enrutamiento a nivel de secuencia con modo de almacenamiento en disco para expertos activos (disk-backed active-expert mode), que permite cargar solo los 13 expertos seleccionados en RAM. Este modo es experimental y está pensado para investigar la eficiencia de memoria.

## Casos de uso

- Investigación académica sobre arquitecturas MoE: el modelo sirve como banco de pruebas para estudiar el enrutamiento por secuencia, el equilibrio de carga de expertos y la estabilidad del entrenamiento. Los investigadores pueden analizar las rutas seleccionadas y la diversidad de expertos mediante las herramientas de diagnóstico incluidas.
- Prototipado de sistemas de inferencia con descarga de pesos: el modo disk-backed permite experimentar con la carga diferida de expertos, lo que puede informar el diseño de sistemas de inferencia para modelos MoE a gran escala en hardware con memoria limitada.
- Evaluación de métricas de enrutamiento: al ser un modelo pequeño y rápido de ejecutar, es adecuado para validar métricas como la entropía de enrutamiento normalizada o el número efectivo de expertos, antes de aplicarlas a modelos más grandes.
- Comparación de arquitecturas MoE: junto con BananaMind-2-Nano y BananaMind-2-MoE, permite realizar estudios controlados sobre el impacto del nivel de enrutamiento (token vs. secuencia) en el rendimiento y el coste computacional.
- Docencia y divulgación: por su tamaño reducido y su licencia Apache 2.0, puede utilizarse en cursos de aprendizaje automático para ilustrar conceptos de MoE, sparse models y eficiencia de inferencia.
- Pruebas de concepto de generación de texto a muy baja escala: aunque no es útil para aplicaciones reales, puede servir para demostrar pipelines de generación con transformers y código personalizado (`trust_remote_code=True`).

## Benchmarks y rendimiento

La model card incluye resultados de benchmarks comparativos con modelos similares de BananaMind. Se presentan a continuación.

| Modelo | Parámetros | ARC Easy | HellaSwag | PIQA | ARC Challenge | ArithMark 3 | ArithMark 2 |
|---|---:|---:|---:|---:|---:|---:|---:|
| **BananaMind-2-SLMoE E8M** | 7,90 M activos / 25,45 M totales | 33,92 | 27,16 | 55,44 | 23,12 | 33,60 | 26,32 |
| BananaMind-2-Nano | 9,97 M | 36,20 | 27,50 | 55,98 | 23,38 | 33,70 | 27,68 |
| BananaMind-2-MoE | 25,1 M totales | 34,64 | 27,45 | 56,37 | 21,16 | 33,80 | 28,44 |

ARC Easy, HellaSwag, PIQA, ARC Challenge y ArithMark 3 usan precisión de continuación normalizada; ArithMark 2 usa precisión de continuación bruta. El modelo también se evalúa con BananaMind Base Bench 1.1, obteniendo un Elo global de 887, una precisión del 36,29% (127/350) y resultados por categoría: language completion 64,00%, commonsense 32,00%, world knowledge 48,00%, context tracking 34,00%, quantitative 24,00%, logical reasoning 36,00% y code completion 16,00%. Los autores advierten que estos resultados son de investigación y pueden variar según la versión del evaluador, la precisión y la configuración de batching.

## Requisitos de hardware

- VRAM estimada: al tener solo 25-27 millones de parámetros en total, el modelo ocupa aproximadamente 0,1 GB en precisión bf16 o fp32 (según el repo). Cabe en cualquier GPU moderna, incluso en iGPUs integradas, y también se puede ejecutar en CPU.
- GPU recomendadas: cualquier GPU con al menos 1 GB de VRAM es suficiente; incluso una Raspberry Pi con suficiente RAM podría ejecutarlo en modo CPU.
- Compatibilidad con GPU de consumo: sí, cualquier GPU de consumo (RTX 2060, GTX 1060, etc.) puede ejecutarlo sin problemas.
- Opciones de despliegue: al usar código personalizado de transformers, se puede cargar con `AutoModelForCausalLM` y `trust_remote_code=True`. No se menciona soporte para vLLM, llama.cpp, Ollama o TGI, aunque al ser un modelo pequeño podría adaptarse.
- Latencia y throughput: no se proporcionan datos oficiales. Dado su tamaño, la generación debería ser muy rápida (del orden de miles de tokens por segundo en GPU moderna), pero la latencia puede aumentar en modo disk-backed debido a la carga de expertos desde disco.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Rendimiento (ARC Easy) | Disponibilidad |
|---|---|---|---|---|---|
| BananaMind-2-SLMoE | 25,45 M totales / 7,90 M activos | 4.096 | Apache 2.0 | 33,92 | Hugging Face |
| BananaMind-2-Nano | 9,97 M | 4.096 | Apache 2.0 | 36,20 | Hugging Face |
| BananaMind-2-MoE | 25,1 M totales | 4.096 | Apache 2.0 | 34,64 | Hugging Face |

Los tres modelos son de la misma familia BananaMind y comparten licencia y contexto. BananaMind-2-SLMoE tiene un rendimiento ligeramente inferior al de sus hermanos en la mayoría de métricas, lo que los autores atribuyen a la falta de control en el entrenamiento (más tokens y más cómputo activo). No hay otros modelos comparables en la misma categoría de MoE por secuencia en el momento de la publicación.

## Limitaciones y advertencias

- Modelo de investigación, no apto para producción: los propios autores lo declaran explícitamente. Su rendimiento en tareas de razonamiento, código y matemáticas es muy bajo (por ejemplo, 16% en code completion).
- Riesgo de alucinación y errores: al ser un modelo pequeño entrenado con un currículo limitado, es probable que genere respuestas incorrectas o inventadas con frecuencia, especialmente en temas de conocimiento general.
- Sesgos desconocidos: no se ha evaluado el sesgo social o cultural; al no especificarse los idiomas ni la composición del dataset, no se puede garantizar un comportamiento imparcial.
- Desequilibrio en el uso de expertos: aunque no hay colapso total, el análisis de 48 prompts muestra que solo 38 de 64 expertos se seleccionan al menos una vez, y cinco expertos aparecen en todas las rutas. Esto indica una especialización incompleta.
- Limitaciones de contexto: la ventana de 4.096 tokens es pequeña para aplicaciones modernas; además, el router solo lee los primeros 32 tokens válidos, por lo que la selección de expertos depende en gran medida del inicio del mensaje.
- Dependencia de código personalizado: requiere `trust_remote_code=True`, lo que implica ejecutar código arbitrario del repositorio. Esto puede suponer un riesgo de seguridad si no se audita el código.
- Sin soporte de cuantización documentado: no se ofrecen versiones GGUF ni guías de cuantización, lo que limita su uso en entornos con restricciones de memoria.

## Enlaces

- [BananaMind-2-SLMoE en Hugging Face](https://huggingface.co/BananaMind/BananaMind-2-SLMoE)
- [BananaMind-2-Nano](https://huggingface.co/BananaMind/BananaMind-2-Nano)
- [BananaMind-2-MoE](https://huggingface.co/BananaMind/BananaMind-2-MoE)
