# 0xSero/GLM-5.3-Flash-EXL3-Q4

## Resumen

El modelo `0xSero/GLM-5.3-Flash-EXL3-Q4` es una conversión cuantizada selectiva del modelo `zai-org/GLM-5.3-Flash-BF16` de Z.AI, realizada por el usuario 0xSero mediante el flujo de trabajo Dione. GLM-5.3-Flash es el modelo que Z.AI lanzó bajo el nombre en clave "Ox Alpha" en agosto de 2026, y que se reveló como el primer modelo nativamente multimodal de la línea GLM-5, diseñado para competir con sistemas como Claude Opus 4.8. La conversión aplica cuantización EXL3 Q4 únicamente a los tensores de proyección (gate/up/down) de los expertos enrutados en las capas 3 a 44, manteniendo el resto de la red (atención, atención lineal, indexadores, expertos compartidos, capas densas, embeddings, cabeza de salida, visión y MTP) en precisión BF16 original.

El resultado es un artefacto de 187,45 GB en disco, con 583 090 tensores indexados, de los cuales 580 608 están cuantizados a 4,0 bpw y 2482 se conservan en BF16. La conversión se validó con métricas de calidad sobre el conjunto Wikitext-2, mostrando una degradación de perplejidad de solo el 2,38 % respecto al modelo BF16 original. Sin embargo, el autor advierte explícitamente que el artefacto no se ha probado como servidor completo, y que la ejecución de visión y MTP no está validada. El formato de pesos es un layout personalizado `glm53-selective-exl3-tp4-v1` que requiere un cargador EXL3 específico compatible con GLM-5.3, no siendo compatible con cargadores estándar de Transformers ni con runtimes EXL3 genéricos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture of Experts (MoE) con 45 capas de lenguaje: 3 densas + 42 capas enrutadas, cada una con 288 expertos y routing top-8, más 1 experto compartido por capa |
| Parametros totales | no disponible |
| Parametros activos | no disponible (el modelo base no publica el desglose en la informacion disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | EXL3 Q4 selectivo a 4,0 bpw (solo tensores gate/up/down de expertos enrutados); el resto permanece en BF16 |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | Layout personalizado `glm53-selective-exl3-tp4-v1` (no safetensors estandar ni GGUF); requiere cargador EXL3 especifico para GLM-5.3 |

## Arquitectura y entrenamiento

El modelo base GLM-5.3-Flash-BF16 de Z.AI presenta una arquitectura híbrida que combina atención tradicional con atención lineal, indexadores y módulos mHC (probablemente mecanismos de compresión de contexto), junto con una estructura MoE de 288 expertos por capa enrutada con selección top-8 y un experto compartido. La conversión EXL3 Q4 no modifica la arquitectura, sino que reemplaza la precisión de los tensores de proyección de los expertos enrutados (gate, up y down) por una representación cuantizada de 4,0 bpw, manteniendo el resto de la red en BF16. Esta estrategia selectiva busca preservar la capacidad informativa del backbone mientras reduce el peso dominante de los expertos.

La conversión se realizó con el flujo Dione, que incluyó calibración con 1 228 800 tokens (600 filas de 2048 tokens) procedentes de categorías como c4, code, multilingual, technical, wiki y tiny, más 92 filas sintéticas aleatorias. Se verificó que el routing natural top-8 cubriera todos los expertos (412 876 800 rutas totales, sin expertos sin cobertura, mínimo 1655 rutas por experto). No se realizó ningún entrenamiento ni fine-tuning; la calibración fue únicamente un paso auxiliar para la conversión. El modelo base fue desarrollado por Z.AI y su licencia MIT se hereda en este derivado.

## Capacidades

- Generación de texto: el pipeline declarado es `text-generation`, por lo que el modelo es capaz de generar texto autocompletado y continuar secuencias.
- Multimodalidad (visión): el modelo base GLM-5.3-Flash es nativamente multimodal, pero la model card advierte que la ejecución de visión no ha sido validada en esta conversión.
- MTP (multi-token prediction): el modelo base incorpora un módulo MTP, pero su ejecución tampoco ha sido validada en este artefacto.
- Razonamiento y codigo: no se proporcionan datos especificos sobre capacidades de razonamiento, generacion de codigo o matematicas en la informacion disponible.
- Tool calling y agentes: no se menciona soporte para function calling ni uso agente en la documentacion de la conversion.
- Multilingue: no se especifican los idiomas soportados por el modelo base ni por la conversion.

## Casos de uso

- Evaluacion de calidad de cuantizacion selectiva: investigadores pueden usar este artefacto para comparar la degradacion de perplejidad (2,38 % sobre Wikitext-2) frente al modelo BF16 original y validar si la estrategia de cuantizar solo expertos enrutados es viable para otros modelos MoE.
- Pruebas de compatibilidad con ExLlamaV3: el artefacto sirve como banco de pruebas para el desarrollo del cargador EXL3 selectivo de GLM-5.3, permitiendo verificar la correcta carga de los 583 090 tensores y la ejecucion de los kernels cuantizados en configuraciones de tensor parallelism.
- Investigacion sobre routing y cobertura de expertos: los datos de calibracion (412 millones de rutas, cobertura completa de expertos) pueden utilizarse para estudiar la distribucion de carga entre expertos en modelos MoE de gran escala.
- Despliegue en entornos con multiples GPUs de alta capacidad: con 187,45 GB de peso, el modelo puede ejecutarse en nodos con 4 o mas GPUs de 48 GB o 80 GB, aunque requiere el runtime EXL3 especifico y no es compatible con soluciones estandar como vLLM u Ollama.
- Comparacion de rendimiento entre precisiones: permite medir el impacto de la cuantizacion Q4 en tareas de generacion de texto, comparando la salida con el modelo BF16 de referencia en metricas como top-1 agreement (91,70 % en la validacion).
- Desarrollo de herramientas de conversion de modelos MoE: el flujo Dione documentado en la model card puede servir como referencia para implementar conversiones selectivas similares en otros modelos con arquitectura MoE.

## Benchmarks y rendimiento

La model card incluye resultados de validacion sobre el conjunto de prueba `wikitext-2-raw-v1` de Salesforce Wikitext, con 65 504 posiciones de siguiente token en 32 bloques contiguos de 2048 tokens, disjuntos de las filas de calibracion. No se publican resultados de benchmarks estandar como MMLU, HumanEval o GSM8K.

| Metrica | BF16 fuente | EXL3 Q4 | Umbral | Resultado |
|---|---:|---:|---:|---|
| Cross-entropy | 1,16296 | 1,18648 | — | — |
| Perplejidad | 3,19940 | 3,27554 | Δ ≤ 5 % | +2,38 % |
| Forward KL (BF16 → Q4) | — | 0,06579 | ≤ 0,15 | Pass |
| Top-1 agreement | — | 91,70 % | ≥ 80 % | Pass |

Ademas, se valido el primitivo de kernel EXL3 gate/up/down en los cuatro rangos de tensor parallelism con captura y reproduccion de CUDA graph, obteniendo una diferencia L2 relativa de cero entre reproduccion y ejecucion eager en esa prueba acotada. No se han publicado resultados de benchmarks comparativos con otros modelos en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no se especifica directamente, pero el artefacto pesa 187,45 GB en disco, por lo que se necesitan al menos 187 GB de VRAM para cargar los pesos, mas memoria adicional para activaciones y buffers. En la practica, se requieren 4 o mas GPUs de 48 GB o 80 GB.
- GPU recomendadas: el autor utilizo 4× NVIDIA GeForce RTX 3090 (24 GB cada una, 96 GB total) para la conversion, pero esto no es suficiente para la inferencia completa del modelo (187 GB). Se recomiendan GPUs de datacenter como A100 80 GB, H100 80 GB o equivalentes, en configuraciones de 3 o mas unidades.
- No cabe en una GPU de consumo: el modelo supera ampliamente la VRAM de cualquier GPU consumer actual (24 GB maximo en RTX 4090), por lo que requiere multiples GPUs o despliegue distribuido.
- Opciones de despliegue: exclusivamente ExLlamaV3 con un cargador compatible con el layout `glm53-selective-exl3-tp4-v1`. No es compatible con vLLM, llama.cpp, Ollama ni TGI en su forma actual.
- Latencia y throughput: no se proporcionan datos de latencia ni throughput en la informacion disponible.

## Comparativa con modelos similares

No se dispone de informacion suficiente para comparar este artefacto con otros modelos cuantizados de la misma categoria, ya que la conversion es especifica de GLM-5.3-Flash y no existen datos publicos de otros derivados cuantizados de este modelo. La comparacion mas relevante es con el modelo base BF16 original:

| Modelo | Precision | Tamano en disco | Perplejidad (Wikitext-2) | Licencia |
|---|---|---|---|---|
| zai-org/GLM-5.3-Flash-BF16 | BF16 | no disponible | 3,19940 | MIT |
| 0xSero/GLM-5.3-Flash-EXL3-Q4 | EXL3 Q4 selectivo | 187,45 GB | 3,27554 | MIT |

No se conocen otros modelos comparables en el momento de redactar esta ficha.

## Limitaciones y advertencias

- El artefacto no se ha probado como servidor completo: la model card indica explicitamente que no se ha ejecutado una integracion de servidor, comprobacion de endpoint, listado de modelos ni prueba de generacion de respuesta.
- La ejecucion de vision y MTP no esta validada: aunque el modelo base es multimodal y soporta MTP, esta conversion no garantiza su funcionamiento.
- Requiere un cargador especifico: el layout `glm53-selective-exl3-tp4-v1` no es compatible con cargadores estandar de Transformers ni con runtimes EXL3 genericos. Intentar cargarlo con herramientas no adaptadas producira errores.
- Tamano considerable: 187,45 GB en disco, lo que limita su despliegue a entornos con multiples GPUs de alta capacidad.
- Calibracion limitada: la calibracion se realizo sobre 1,2 millones de tokens de dominios especificos (c4, codigo, multilingue, tecnico, wiki, tiny). El rendimiento en dominios fuera de estos puede degradarse.
- Riesgo de alucinacion y sesgos: no se han evaluado sesgos ni tasas de alucinacion en esta conversion; se heredan las caracteristicas del modelo base, que no estan documentadas en la informacion disponible.
- Restricciones de uso comercial: la licencia MIT permite uso comercial sin restricciones, pero el autor no garantiza la idoneidad del artefacto para produccion dado su estado de validacion incompleto.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/0xSero/GLM-5.3-Flash-EXL3-Q4
- Modelo base: https://huggingface.co/zai-org/GLM-5.3-Flash-BF16
- Repositorio ExLlamaV3: https://github.com/turboderp-org/exllamav3
- Dataset de evaluacion: https://huggingface.co/datasets/Salesforce/wikitext
- Perfil del autor: https://huggingface.co/0xSero
- Articulo sobre el lanzamiento de GLM-5.3-Flash: https://xenospectrum.com/en/z-ai-ox-alpha-reveal/
- Analisis sobre la identidad de Ox Alpha: https://kingy.ai/blog/ox-alpha-glm-5-3-flash-evidence/
- Blog de lanzamiento oficial: https://www.explainx.ai/blog/glm-5-3-flash-ox-alpha-official-launch-august-2026
- Cobertura de benchmarks: https://officechai.com/ai/glm-5-3-flash-benchmarks/
