# shanjiaz/qwen3_5_4b_perfectblend_regen_dspark

## Resumen

`shanjiaz/qwen3_5_4b_perfectblend_regen_dspark` es un modelo auxiliar de decodificación especulativa (draft model) diseñado para acelerar la inferencia del modelo base `Qwen/Qwen3.5-4B`. Desarrollado por shanjiaz (Helen Zhao), emplea la arquitectura DSpark con cinco capas transformer y 1.916.308.737 parámetros (~1,9B). Su función es proponer ocho tokens especulativos por paso de verificación, que el modelo base acepta o rechaza, reduciendo la latencia sin alterar la distribución de salida del modelo objetivo.

El modelo consume cinco estados ocultos del verificador, procedentes de las capas 19, 23, 27, 29 y 31 del Qwen3.5-4B, y ha sido entrenado exclusivamente con trayectorias generadas a temperatura 0.0. En la evaluación autoregresiva con vLLM, alcanza una longitud de aceptación media de 4,39 tokens por paso, con una tasa de aceptación global del 39,26% en configuración greedy. Su relevancia radica en que permite desplegar Qwen3.5-4B con un coste de inferencia significativamente menor en entornos de producción, manteniendo la semántica del modelo original.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DSpark (5 capas transformer) |
| Parametros totales | 1.916.308.737 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (depende del modelo base; en la evaluacion se uso 32.768) |
| Tipos de cuantizacion | no disponible (pesos en bfloat16) |
| Idiomas soportados | no disponible (hereda del modelo base Qwen3.5-4B) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura DSpark, una variante de decodificación especulativa que utiliza un transformer ligero de cinco capas con hidden size 2.560, intermediate size 9.216, 16 cabezas de atención y 4 cabezas KV. Incorpora una Markov head de rango 256 y una confidence head que recibe entrada de la Markov head. El entrenamiento se realizó con una pérdida combinada de 0,1 CE (cross-entropy) y 0,9 TV (token verification), con un peso alpha de 1,0 para la confidence head.

El dataset de entrenamiento contiene 10.000 ejemplos del repositorio `shanjiaz/qwen3_5_4b_perfectblend_regen`, todos generados a temperatura 0.0 con un equilibrio aproximado entre niveles de razonamiento (low, high y max). Se entrenó durante cinco épocas con learning rate 3e-4, seed 42 y secuencias empaquetadas de 8.192 tokens. La validación del checkpoint final (época 5) muestra una pérdida de 0,3213, una tasa de aceptación analítica de 0,7488 y una precisión greedy del 76,53%.

## Capacidades

- Aceleración de inferencia: propone hasta 8 tokens especulativos por paso, que el modelo base verifica en paralelo, reduciendo el número de pasos autoregresivos necesarios.
- Preservación de la distribución de salida: la decodificación especulativa no altera la semántica del modelo base; el draft model solo afecta al rendimiento, no a los resultados.
- Compatibilidad con vLLM: requiere una versión de vLLM con soporte DSpark (evaluado con la versión 0.28.1rc1.dev267+g46c8a161f).
- Optimización para generación greedy: entrenado exclusivamente con trayectorias a temperatura 0.0, por lo que su rendimiento óptimo se da en configuraciones deterministas.
- Integración transparente: se configura mediante el parámetro `--speculative-config` en vLLM, sin cambios en la API de generación.

## Casos de uso

- Despliegue de Qwen3.5-4B en producción con baja latencia: el draft model reduce el número de pasos de decodificación, lo que se traduce en respuestas más rápidas para aplicaciones de chat y asistentes virtuales.
- Generación de código en entornos CI/CD: al acelerar la inferencia del modelo base, permite integrar Qwen3.5-4B en pipelines de autocompletado de código con tiempos de respuesta aceptables.
- Procesamiento por lotes de alto rendimiento: en servicios que atienden múltiples peticiones concurrentes, la mayor longitud de aceptación (4,39 tokens por paso en media) reduce la carga computacional por solicitud.
- Sistemas de RAG y resumen de documentos: los subsets de evaluación muestran buenos resultados en tareas de QA y RAG, con longitudes de aceptación de 5,71 y 4,45 respectivamente.
- Traducción automática: aunque la aceptación es menor (2,85), sigue ofreciendo una mejora frente a la decodificación estándar, útil en servicios de traducción en tiempo real.
- Evaluación y pruebas de modelos: al mantener la distribución del modelo base, permite probar configuraciones de decodificación especulativa sin riesgo de degradar la calidad de las respuestas.

## Benchmarks y rendimiento

La evaluación principal se realizó con decodificación autoregresiva real en vLLM, utilizando el dataset `RedHatAI/speculator_benchmarks` con 9 subsets, 80 peticiones por subset (720 en total), temperatura 0.0, concurrencia máxima 8 y longitud máxima de completación 4.096. La longitud de aceptación se define como `1 + accepted_draft_tokens / draft_steps`.

| Subset | Longitud de aceptacion |
|---|---|
| HumanEval | 4,9126 |
| Razonamiento matematico | 5,4006 |
| QA | 5,7102 |
| Pregunta | 4,0906 |
| RAG | 4,4461 |
| Resumen | 3,7130 |
| Tool call | 4,3839 |
| Traduccion | 2,8460 |
| Escritura | 3,9882 |
| **Media macro** | **4,3879** |
| **Ponderado por pasos** | **4,1407** |

Tasa de aceptación posicional agregada (ponderada por el número de pasos de cada subset):

| Posicion del draft | Tasa de aceptacion |
|---|---:|
| 0 | 77,87% |
| 1 | 59,10% |
| 2 | 45,73% |
| 3 | 36,57% |
| 4 | 30,23% |
| 5 | 25,29% |
| 6 | 21,30% |
| 7 | 17,99% |

En total, el 39,26% de los tokens propuestos fueron aceptados. En una prueba de estrés con muestreo probabilístico (temperatura 1.0, top-p 1.0, top-k 0), la longitud de aceptación media cayó a 2,89 y la tasa de aceptación al 22,05%, lo que confirma que el modelo está optimizado para generación greedy.

## Requisitos de hardware

- VRAM estimada: el modelo tiene 1,9B parámetros en bfloat16, lo que ocupa aproximadamente 3,8 GB. En cuantización de 4 bits podría reducirse a ~1 GB, aunque no se han publicado pesos cuantizados.
- GPU recomendadas: cualquier GPU con suficiente VRAM para alojar el modelo base Qwen3.5-4B más el draft model. Por ejemplo, una RTX 4090 (24 GB) puede ejecutar ambos, mientras que una A100 o H100 ofrecen mayor margen para lotes grandes.
- Compatibilidad con consumer GPU: sí, siempre que el modelo base quepa en la VRAM disponible. El draft model añade ~3,8 GB al requisito del modelo base.
- Opciones de despliegue: vLLM con soporte DSpark (versión evaluada: 0.28.1rc1.dev267+g46c8a161f). No se mencionan alternativas como llama.cpp u Ollama, que probablemente no soportan esta arquitectura.
- Latencia y throughput: no se proporcionan cifras absolutas, pero la longitud de aceptación media de 4,39 tokens por paso implica una reducción teórica del número de pasos de decodificación en un factor de ~4,4 en configuraciones greedy.

## Comparativa con modelos similares

No se dispone de datos comparativos con otros draft models de decodificación especulativa (como los de DeepSpec o EAGLE) en la información proporcionada. La comparativa directa requeriría ejecutar los mismos benchmarks con los mismos modelos base y configuraciones, lo que no está documentado. Se recomienda consultar el repositorio de DeepSpec para obtener referencias de arquitecturas alternativas.

## Limitaciones y advertencias

- Entrenado exclusivamente con trayectorias a temperatura 0.0: su rendimiento se degrada notablemente con muestreo probabilístico (temperatura 1.0), como muestra la prueba de estrés. Los despliegues que usen sampling deben re-evaluar el modelo con su configuración exacta de temperatura, top-p y top-k.
- No es un modelo autónomo: requiere el modelo base Qwen3.5-4B y una versión específica de vLLM con soporte DSpark. No puede utilizarse de forma independiente para generación de texto.
- Dependencia de la versión de vLLM: la evaluación se realizó con una versión de desarrollo concreta; otras versiones pueden ofrecer resultados diferentes.
- Sesgos y alucinaciones: al ser un modelo auxiliar, no introduce sesgos propios, pero hereda los del modelo base. No se han realizado evaluaciones específicas de sesgo o toxicidad en este draft model.
- Limitaciones de contexto: el draft model no tiene contexto propio; su funcionamiento depende de la ventana de contexto del modelo base (32.768 en la evaluación). No se ha probado con contextos más largos.
- Licencia: Apache 2.0 permite uso comercial, pero el modelo base Qwen3.5-4B también debe cumplir su propia licencia (Apache 2.0 según la información disponible).

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/shanjiaz/qwen3_5_4b_perfectblend_regen_dspark
- Dataset de entrenamiento: https://huggingface.co/datasets/shanjiaz/qwen3_5_4b_perfectblend_regen
- Modelo base Qwen3.5-4B: https://huggingface.co/Qwen/Qwen3.5-4B
- Repositorio DeepSpec (referencia de arquitectura): https://github.com/deepseek-ai/DeepSpec
- Perfil del autor: https://huggingface.co/shanjiaz
