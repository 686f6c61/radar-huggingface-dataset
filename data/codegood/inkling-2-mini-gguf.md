# codegood/Inkling-2-Mini-GGUF

## Resumen

Inkling-2-Mini es un modelo de lenguaje de tipo Mixture-of-Experts (MoE) con aproximadamente 26.400 millones de parámetros totales y unos 3.000 millones de parámetros activos por token, desarrollado por Thinking Machines. Emplea una arquitectura propietaria denominada `Inkling2LoopModel` (clase `inkling2_loop`), que combina el enrutamiento MoE con un esquema de capas recurrentes o "looped", lo que reduce el coste computacional por token manteniendo una capacidad de representación propia de un modelo mucho mayor.

El repositorio analizado, `codegood/Inkling-2-Mini-GGUF`, no contiene los pesos originales sino una suite de cuantizaciones GGUF derivadas del modelo base `thinkingmachines/Inkling-2-Mini`. Su relevancia radica en que la arquitectura personalizada del modelo rompe muchas herramientas estándar de cuantización, y este repositorio resuelve el problema mediante reflexión de capas agnóstica a la arquitectura y transformaciones directas de tensores, habilitando su ejecución en llama.cpp, Ollama, LM Studio y el backend GGUF de vLLM.

La colección incluye 22 variantes de cuantización desde Q8_0 (27,8 GB) hasta IQ1_S (8,56 GB), lo que permite desplegar el modelo tanto en GPUs de gama alta como en equipos con 10-12 GB de VRAM. La licencia es Apache 2.0, lo que facilita su uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `Inkling2LoopModel` (`inkling2_loop`): Mixture-of-Experts con capas recurrentes ("looped") |
| Parametros totales | ~26.070.385.152 (~26,4 B) |
| Parametros activos | ~3,0 B por token |
| Longitud de contexto | no disponible (los ejemplos de despliegue usan `num_ctx 8192` y `--max-model-len 8192`) |
| Tipos de cuantizacion | Q8_0, Q6_K, Q5_K_M, Q5_1, Q5_K_S, Q5_0, Q4_K_M, Q4_1, Q4_K_S, Q4_0, Q3_K_L, Q3_K_M, IQ3_S, Q3_K_S, IQ3_XXS, Q2_K, IQ2_M, IQ2_S, IQ2_XS, IQ2_XXS, IQ1_M, IQ1_S |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (el modelo base original no se distribuye en este repo) |

## Arquitectura y entrenamiento

Inkling-2-Mini se basa en una arquitectura MoE con un componente recurrente o "looped" (`Inkling2LoopConfig`), en la que un subconjunto reducido de parámetros (~3 B) se activa por token frente a los ~26,4 B totales. Este diseño persigue un equilibrio entre capacidad y eficiencia: el coste de inferencia se aproxima al de un modelo de 3 B mientras la memoria de pesos corresponde a un modelo de 26 B. La naturaleza personalizada de la clase `Inkling2LoopModel` implica que los wrappers de cuantización convencionales fallan por asumir registros de modelos predefinidos, motivo por el cual este repositorio recurre a reflexión de capas y transformación directa de tensores.

No se dispone de información sobre el volumen de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de RLHF, DPO u otras etapas de alineación. Tampoco se documentan innovaciones adicionales como decodificación especulativa o atención lineal. Los únicos datos técnicos verificables proceden de la model card del repositorio de cuantización, que se limita a describir la arquitectura y el proceso de conversión a GGUF.

## Capacidades

- Generación de texto conversacional multi-turno, orientada a diálogo.
- Razonamiento agéntico de alta eficiencia ("agentic reasoning"), según los workloads primarios declarados por el autor.
- Generación de código, incluyendo ejemplos prácticos como scripts de scraping paralelo en Python.
- Inferencia local de baja latencia gracias a la activación de solo ~3 B de parámetros por token.
- Compatibilidad con endpoints OpenAI a través de `llama-server` y del backend GGUF de vLLM.
- Soporte de plantilla de chat con roles system/user/assistant y tokens especiales `<|im_start|>`, `<|im_end|>`, `<|endoftext|>`.
- No se documenta soporte explícito de tool calling, function calling, visión, audio ni modo "thinking".

## Casos de uso

- Asistencia de código en local: con la variante Q4_K_M (17,5 GB) el modelo cabe en una RTX 4090 y puede ofrecer autocompletado y generación de funciones dentro de un IDE sin depender de la nube, aprovechando su entrenamiento orientado a código.
- Agentes autónomos de bajo coste: al activar solo ~3 B de parámetros por token, el coste por paso de razonamiento multi-step se reduce drásticamente, lo que lo hace adecuado para bucles agénticos con muchas iteraciones.
- Despliegue en estaciones de trabajo con 24 GB de VRAM: la variante Q5_K_M (19,9 GB) está recomendada explícitamente para RTX 3090/4090 y A10G, permitiendo servir un modelo de 26 B en hardware de consumo profesional.
- Prototipado rápido con Ollama: el Modelfile incluido permite crear y ejecutar el modelo con `ollama create` y `ollama run`, ideal para pruebas de concepto y demos internas.
- Servicio de API compatible con OpenAI: mediante `llama-server` o `vllm serve` con backend GGUF se puede exponer el modelo en un puerto local y conectarlo a clientes que ya usan la API de OpenAI.
- Inferencia en entornos con memoria limitada: las variantes IQ2_XXS (9,6 GB) e IQ1_S (8,56 GB) permiten ejecutar el modelo en GPUs de 10-12 GB o en equipos con memoria unificada, habilitando pruebas de razonamiento en hardware de gama media.
- Evaluación comparativa de cuantizaciones: la matriz de 22 variantes permite medir la degradación de calidad frente al tamaño de archivo en un mismo modelo, útil para investigación sobre cuantización.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM mínima según cuantización: desde 32 GB para Q8_0 (27,8 GB de archivo) hasta 10 GB para IQ1_S (8,56 GB).
- GPU recomendadas por variante según el autor:
  - Q8_0 / Q6_K: GPUs de alta VRAM o memoria unificada (32 GB y 28 GB respectivamente).
  - Q5_K_M: RTX 3090, RTX 4090, A10G (24 GB).
  - Q4_K_M: equilibrio óptimo, 20 GB de VRAM.
  - Q3_K_M: GPUs de 16 GB.
  - IQ2_XXS / IQ1_S: GPUs de 10-12 GB o equipos de gama media.
- Cabe en GPU de consumo: sí, desde la RTX 4090 (Q5_K_M) hasta tarjetas de 10-12 GB con las variantes IQ1/IQ2.
- Opciones de despliegue: llama.cpp (`llama-cli`, `llama-server`), Ollama, LM Studio y vLLM con backend GGUF (`--trust-remote-code` y tokenizer del modelo base).
- Latencia y throughput: no disponibles. La arquitectura MoE con ~3 B activos sugiere un coste por token bajo, pero no se aportan cifras medidas.

## Comparativa con modelos similares

| Modelo | Parametros totales / activos | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Inkling-2-Mini (este repo) | ~26,4 B / ~3,0 B | no disponible (ejemplos a 8192) | Apache 2.0 | GGUF | MoE con capas "looped"; suite de 22 cuantizaciones |
| Modelos MoE de ~20-30 B con ~3 B activos de otros proveedores | no disponible | no disponible | no disponible | no disponible | No se dispone de datos verificables para una comparación numérica |
| Modelos densos de ~7-8 B | ~7-8 B activos | no disponible | variable | GGUF, safetensors | Menor memoria total, pero más parámetros activos por token |

No se dispone de información suficiente para comparar rendimiento (benchmarks) con alternativas concretas. La comparación se limita a parámetros, licencia y formato.

## Limitaciones y advertencias

- No se documentan los idiomas soportados; el rendimiento multilingüe es desconocido y no debe asumirse.
- No hay benchmarks publicados, por lo que la calidad real del modelo frente a alternativas no está verificada de forma independiente.
- La longitud de contexto oficial no está declarada; los ejemplos usan 8192 tokens, pero no se confirma como máximo.
- La arquitectura personalizada (`Inkling2LoopModel`) puede requerir versiones recientes de llama.cpp o vLLM; versiones antiguas podrían no cargar los pesos.
- En vLLM es necesario `--trust-remote-code` y el tokenizer del modelo base, lo que añade complejidad de despliegue.
- Las cuantizaciones de 2 bits e inferiores (IQ2, IQ1) degradan la calidad de forma significativa; el autor las etiqueta como opciones para pruebas en memoria extrema.
- No se documenta soporte de tool calling ni de agentes con esquemas estructurados, pese a mencionarse "agentic reasoning" como carga de trabajo.
- Riesgo de alucinación y sesgos: no disponible; no hay información sobre alineación, filtrado de datos ni evaluaciones de seguridad.
- La licencia Apache 2.0 permite uso comercial, pero el repositorio es una cuantización de terceros; conviene verificar la licencia y condiciones del modelo base `thinkingmachines/Inkling-2-Mini`.
- El repositorio tiene 0 likes y ~952 descargas en el momento de la consulta, lo que indica adopción limitada y poca validación comunitaria.

## Enlaces

- Repositorio GGUF: https://huggingface.co/codegood/Inkling-2-Mini-GGUF
- Modelo base: https://huggingface.co/thinkingmachines/Inkling-2-Mini
