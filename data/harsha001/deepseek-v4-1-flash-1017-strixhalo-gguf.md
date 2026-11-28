# Harsha001/DeepSeek-V4.1-Flash-1017-StrixHalo-GGUF

## Resumen

DeepSeek-V4.1-Flash-1017-StrixHalo-GGUF es una compilación cuantizada y podada del modelo DeepSeek-V4.1-Flash-1017, publicada por el usuario Harsha001 bajo licencia MIT. Su objetivo es hacer viable la inferencia de un modelo Mixture-of-Experts (MoE) de 657.884.565.104 parámetros totales en una única máquina AMD Ryzen AI Max+ 395 (Strix Halo) con 128 GB de memoria unificada. Para ello reduce el número de expertos enrutados por capa (de 384 a 344 o 320, según la build) y los cuantiza a 1-2 bits, dejando la parte que debe residir en memoria de GPU en aproximadamente 97 GiB.

El modelo base es la variante "uncensored" de DeepSeek-V4.1-Flash-1017, es decir, una edición que elimina los mecanismos de rechazo (abliteration) a partir de los pesos completos de Infatoshi y la edición de pqhaz/AtomicChat. La compilación incluye una gran tabla de búsqueda Engram (110,6 GB) que permanece en SSD y se lee bajo demanda, de modo que no consume memoria de GPU. Se distribuye en formato GGUF con cuatro shards por build y requiere el fork de runtime ROCmFPX para los tipos ROCmIQ.

La relevancia actual radica en que demuestra una técnica de compresión agresiva (poda de expertos más cuantización de muy bajo bit) para ejecutar modelos de escala frontier en hardware consumer de gama alta con memoria unificada, un nicho en crecimiento entre desarrolladores que no tienen acceso a clústeres de GPUs. No obstante, es una release de prueba comunitaria: ninguna de las dos builds se ha ejecutado todavía en un Strix Halo real.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture-of-Experts (MoE), transformer; 384 expertos enrutados por capa en el modelo completo |
| Parametros totales | 657.884.565.104 |
| Parametros activos | no disponible |
| Longitud de contexto | objetivo de 64K en esta compilacion (contexto nativo del modelo base no disponible) |
| Tipos de cuantizacion | ROCmIQ1_S (1,56 bit por experto, build IQ1_S_ROCMIQ-E344); GSQ-RCO IQ1_M (1,75 bit, build IQ1_M-E320); modelo base en MXFP4 |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | GGUF (4 shards por build: 3 de modelo + 1 de Engram) |

## Arquitectura y entrenamiento

El modelo base es un transformer con arquitectura Mixture-of-Experts que contiene 384 expertos enrutados por capa. Sobre ese diseño, esta compilación aplica dos transformaciones principales. La primera es la poda de expertos: se conservan únicamente los expertos con mayor peso de enrutamiento en cada capa (344 de 384 en la build ROCmIQ, que cubren el 98,4% del peso de routing; 320 de 384 en la build IQ1_M, con el 97,5%), de modo que la matriz de expertos conservada se cuantiza a 1-2 bits. La segunda es la separación de la tabla Engram, un componente de búsqueda de 110,6 GB que se mantiene en SSD y se consulta bajo demanda, liberando memoria de GPU.

La build IQ1_S_ROCMIQ-E344 emplea el formato propietario ROCmIQ1_S, desarrollado específicamente para GPUs AMD, que se decodifica sin las grandes rejillas de búsqueda de IQ1_S e IQ1_M. Según las pruebas de kernels del autor en una Radeon 8060S (Vulkan), el kernel de matriz de expertos de ROCmIQ1_S supera a IQ1_S en todos los tamaños de fila, con aproximadamente un 11% de mejora en los tamaños que usa DeepSeek. La build IQ1_M-E320, más antigua, mezcla tensores IQ2, lo que la hace más lenta. Los datos de entrenamiento del modelo base (número de tokens, composición del dataset, uso de RLHF/DPO) no se detallan en la información proporcionada.

## Capacidades

- Generación de texto conversacional en modo chat, según la etiqueta `conversational` y la pipeline `text-generation`.
- Razonamiento y generación de código heredados del modelo base DeepSeek-V4.1-Flash-1017 (capacidades específicas del base no detalladas en la información disponible).
- Variante "uncensored": los mecanismos de rechazo han sido eliminados mediante abliteration, por lo que el modelo no declina peticiones que el modelo original rechazaría.
- Soporte de tool calling y function calling: no confirmado en la información disponible.
- Soporte de agentes y razonamiento multi-paso: no confirmado en la información disponible.
- Capacidades multilingües: no disponibles.
- Modo thinking, visión o audio: no disponibles.

## Casos de uso

- Inferencia local de un modelo de escala frontier en una única máquina Strix Halo: el modelo está diseñado para ejecutarse en un Ryzen AI Max+ 395 con 128 GB de memoria unificada, con unos 97 GiB en GPU y la tabla Engram en SSD, lo que permite a un desarrollador individual disponer de un MoE de 657.000 millones de parámetros sin clúster.
- Investigación sobre cuantización extrema y poda de expertos: las builds incluyen listas de expertos conservados en `keep/` y métricas de divergencia KL y perplejidad, lo que las convierte en material de estudio para comparar técnicas de compresión (ROCmIQ1_S frente a GSQ-RCO IQ1_M) sobre el mismo modelo base.
- Desarrollo y evaluación de kernels para AMD: la build ROCmIQ1_S está pensada para medir el rendimiento del kernel de matriz de expertos en GPUs AMD con Vulkan y ROCm, y el autor solicita activamente datos de `llama-bench` (pp512 / tg128) de la comunidad.
- Experimentación con modelos sin restricciones de rechazo: para investigadores que estudian el comportamiento de modelos abliterated en tareas de generación abierta, aunque con las advertencias de seguridad correspondientes.
- Pruebas de despliegue con llama.cpp y el fork ROCmFPX: la build IQ1_S_ROCMIQ requiere ROCmFPX en el commit `bb36a5fdb` o posterior, por lo que sirve para validar pipelines de inferencia GGUF en hardware AMD.
- Evaluación de calidad de cuantizaciones de 1 bit: con perplejidad de 3,39 (ROCmIQ) y 3,42 (IQ1_M) frente a 2,01 del modelo completo, permite estudiar el impacto de la compresión en la calidad de salida en tareas de texto reales (wikitext-2).

## Benchmarks y rendimiento

| Build | Divergencia KL | Mismo token top | Perplejidad | Perplejidad vs modelo completo |
|---|---|---|---|---|
| IQ1_S_ROCMIQ-E344 | 0,629 ± 0,013 | 77,7% | 3,39 | ×1,69 |
| IQ1_M-E320 | 0,635 ± 0,015 | 77,6% | 3,42 | ×1,70 |
| Modelo completo (Infatoshi, MXFP4 nativo) | - | - | 2,01 | - |

Metodología: texto de test de wikitext-2 (primeros 300.000 caracteres), 8 fragmentos de 2048 tokens, divergencia KL sobre el vocabulario completo contra el modelo completo de 510 GB ejecutado sin pérdida en CPU. El autor indica que una ejecución completa de 32 fragmentos está en curso. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada: aproximadamente 97 GiB (104,1 GB en la build ROCmIQ; 104,5 GB en IQ1_M) para la parte del modelo en memoria de GPU, más 110,6 GB de tabla Engram en SSD.
- Hardware objetivo: AMD Ryzen AI Max+ 395 (Strix Halo) con 128 GB de memoria unificada.
- GPU recomendadas: no hay datos de ejecución en GPUs dedicadas; el autor solo ha verificado las builds en CPU y, la IQ1_M, en una NVIDIA GB10 con CUDA.
- ¿Cabe en GPU consumer? No en GPUs consumer convencionales de 24-48 GB; sí en un sistema de memoria unificada de 128 GB como Strix Halo, que es el objetivo declarado.
- Opciones de despliegue: llama.cpp mediante el fork ROCmFPX (commit `bb36a5fdb` o posterior para ROCmIQ; cualquier build ROCmFPX con soporte de DeepSeek-V4.1 para IQ1_M). vLLM, Ollama y TGI no están confirmados en la información disponible.
- Latencia y throughput: no disponibles; el autor solicita a la comunidad mediciones de `llama-bench` (pp512 / tg128) porque no se ha ejecutado en Strix Halo todavía.

## Comparativa con modelos similares

| Modelo | Parametros totales | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| DeepSeek-V4.1-Flash-1017-StrixHalo-GGUF (esta ficha) | 657.884.565.104 | 64K objetivo | ROCmIQ1_S / GSQ-RCO IQ1_M (1-2 bits) | MIT | Hugging Face, GGUF |
| DeepSeek-V4.1-Flash-1017 (modelo base) | no disponible | no disponible | MXFP4 nativo | no disponible | Hugging Face |
| Infatoshi/DeepSeek-V4.1-Flash-1017-MXFP4-uncensored | no disponible | no disponible | MXFP4 | no disponible | Hugging Face |
| AtomicChat/DeepSeek-V4.1-Flash-1017-Uncensored-GGUF | no disponible | no disponible | GGUF (sin detallar) | no disponible | Hugging Face |

No se dispone de datos de benchmarks comparativos con otras alternativas de la misma categoría en la información proporcionada.

## Limitaciones y advertencias

- Release de prueba comunitaria: ninguna de las dos builds se ha ejecutado en un Strix Halo real; solo se han verificado en CPU y, la IQ1_M, en una NVIDIA GB10 con CUDA.
- Calidad degradada: la perplejidad es aproximadamente 1,69-1,70 veces la del modelo completo (3,39-3,42 frente a 2,01), y solo el 77,6-77,7% de los tokens top coinciden con el modelo completo.
- Requiere un runtime específico: la build ROCmIQ necesita ROCmFPX en el commit `bb36a5fdb` o posterior; versiones anteriores no reconocen los tipos ROCmIQ o ignoran las escalas de expertos y producen salidas incorrectas.
- Modelo "uncensored": los rechazos han sido eliminados mediante abliteration, lo que implica riesgos de generar contenido dañino, sesgado o inapropiado sin filtros; no es adecuado para aplicaciones de producción orientadas al público sin moderación adicional.
- Sesgos conocidos: no documentados en la información disponible, pero heredados del modelo base y potencialmente amplificados por la edición uncensored.
- Riesgo de alucinación: no cuantificado; la compresión a 1-2 bits puede incrementarlo respecto al modelo completo.
- Idiomas soportados: no disponibles; no se puede confirmar el rendimiento multilingüe.
- Restricciones de licencia: licencia MIT, que permite uso comercial, pero el modelo base y las ediciones intermedias pueden tener condiciones adicionales no detalladas; conviene verificar las licencias de los modelos base antes de un uso comercial.
- Tamaño de descarga elevado: el repositorio completo ocupa 742,7 GB; cada build individual ronda los 215 GB en disco.
- La build IQ2_XXS-E277 fue retirada por ser la más débil (perplejidad 3,59 frente a 3,40) y solo permanece en el historial del repositorio.

## Enlaces

- Hugging Face: https://huggingface.co/Harsha001/DeepSeek-V4.1-Flash-1017-StrixHalo-GGUF
- Modelo base: https://huggingface.co/deepseek-ai/DeepSeek-V4.1-Flash-1017
- Edición uncensored MXFP4 de Infatoshi: https://huggingface.co/Infatoshi/DeepSeek-V4.1-Flash-1017-MXFP4-uncensored
- Edición heretic de pqhaz: https://huggingface.co/pqhaz/DeepSeek-V4.1-Flash-1017-heretic
- Build GSQ-RCO de ISTA-DASLab: https://huggingface.co/ISTA-DASLab/DeepSeek-V4.1-Flash-1017-GSQ-RCO-GGUF
- Edición uncensored de AtomicChat: https://huggingface.co/AtomicChat/DeepSeek-V4.1-Flash-1017-Uncensored-GGUF
- Página del proyecto ROCmFPX: https://harshavardhan3002.github.io/ROCmFPX/
- Discusión comunitaria (build GSQ-RCO StrixHalo): https://huggingface.co/Harsha001/DeepSeek-V4.1-Flash-1017-Uncensored-GSQ-RCO-StrixHalo-GGUF/discussions
- Paper referenciado (arXiv:2604.18556): https://arxiv.org/abs/2604.18556
- Paper referenciado (arXiv:2605.00649): https://arxiv.org/abs/2605.00649
