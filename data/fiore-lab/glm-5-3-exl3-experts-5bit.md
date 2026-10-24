# fiore-lab/GLM-5.3-EXL3-Experts-5bit

## Resumen

Este repositorio no es un modelo completo, sino un banco de expertos enrutados cuantizados de GLM-5.3, el modelo insignia de zai-org para código y tareas de horizonte largo, con 755B parámetros y arquitectura `glm_moe_dsa`. Lo publica fiore-lab como parte de un "Expert Atlas": cuatro bancos (2, 3, 4 y 5 bits) de los que la receta de despliegue carga cada experto en el ancho que se elija. Este banco concreto contiene exclusivamente los expertos enrutados de las capas 3 a 77 en EXL3 de 5 bits con codebook `mcg`, en 75 ficheros safetensors ya troceados en ocho particiones de paralelismo tensorial.

El interés es práctico: permite ejecutar un modelo de 755B en clústeres de 4 u 8 DGX Spark. Con el checkpoint hermano de 4 nodos y caché KV FP4, el modelo corre con unos 819.200 tokens de contexto; con 8 nodos se alcanza el 1M del modelo. Este banco ocupa 459,1 GB (427,6 GiB) por sí solo y no incluye atención, expertos compartidos, embeddings ni la capa MTP: esos pesos provienen del checkpoint de la receta.

Es relevante ahora porque documenta con mediciones de divergencia KL el compromiso entre ancho de cuantización y fidelidad, un dato poco habitual en repos de cuantización, y porque habilita despliegues on-premise de un MoE de esa escala sobre hardware de escritorio de NVIDIA.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `glm_moe_dsa` (modelo base GLM-5.3, mezcla de expertos); este repo contiene solo expertos enrutados cuantizados |
| Parametros totales | 755B (modelo base); el banco no cubre el total del modelo |
| Parametros activos | no disponible |
| Longitud de contexto | 1M tokens en el modelo y el motor; 819.200 tokens en la receta de 4 DGX Spark (límite de memoria); 1M en la de 8 DGX Spark |
| Tipos de cuantizacion | EXL3 de 5 bits (codebook `mcg`) en este banco; la familia Expert Atlas ofrece 2, 3, 4 y 5 bits por experto, y mezclas |
| Idiomas soportados | no disponible como lista oficial; la calibración usa inglés, chino y japonés (320 filas de 2.048 tokens con sesiones de agente y código) |
| Licencia | GLM-5.3 License (`license: other`, `license_name: glm-5.3`), Copyright (c) 2026 Z.AI; el código de la receta es Apache-2.0 |
| Formato de pesos | safetensors (EXL3), más manifiesto JSON `glm53-exl3-experts-5bit.json` con tamaño, cabecera y sha256 por fichero |
| Tamano del banco | 459,1 GB (427,6 GiB) en 75 ficheros `experts-layer-003` … `077.safetensors` |
| Herramienta de cuantizacion | exllamav3 1.6.1 |
| Hardware objetivo | 4 u 8 DGX Spark (GB10) |

## Arquitectura y entrenamiento

El modelo base GLM-5.3 es un transformer con mezcla de expertos de 755B parámetros, identificado en los metadatos como `glm_moe_dsa`, con soporte de contexto de 1M tokens y orientado a código y tareas de horizonte largo. El banco no entrena nada: es una cuantización post-entrenamiento de los pesos BF16 oficiales (`zai-org/GLM-5.3-BF16`, revisión `9d2398f`) realizada con exllamav3 1.6.1. Los expertos enrutados de las capas 3 a 77 se cuantizan a 5 bits con codebook `mcg` y se calibran con las filas por defecto de exllamav3 (inglés y chino) más texto japonés y sesiones de agente y código, hasta 320 filas de 2.048 tokens.

Tras la cuantización, cada experto se corta en ocho particiones de paralelismo tensorial por bloques completos, sin recuantizar, de modo que el mismo banco sirve tanto para la receta de 4 DGX Spark como para la de 8. La innovación destacable es el esquema de "Expert Atlas": el motor puede cargar cada experto a un ancho distinto según la memoria disponible, y el manifiesto JSON permite verificar la integridad de cada fichero (sha256) antes de cargar la capa. No se documentan en la información disponible detalles sobre el dataset de preentrenamiento del modelo base ni sobre etapas de RLHF o DPO.

## Capacidades

- Generación de texto y razonamiento sobre contextos de hasta 1M tokens (819.200 en la configuración de 4 DGX Spark).
- Generación y edición de código, con especial foco en tareas de horizonte largo según la documentación del modelo base.
- Ejecución de tareas agénticas de varios pasos sostenidas en el tiempo, incluidas sesiones de agente usadas en la calibración del banco.
- Capacidad multilingüe al menos en inglés, chino y japonés, por la composición de la calibración; la lista oficial de idiomas no está disponible.
- Cuantización seleccionable por experto (2 a 5 bits) mediante el banco correspondiente, lo que permite ajustar el equilibrio fidelidad/memoria sin cambiar de modelo.
- Verificación de integridad de pesos por manifiesto antes de la carga (`tf-glm53 verify-banks 5`).
- Soporte de tool calling / function calling: no confirmado en la información disponible.
- Modo thinking, visión o audio: no disponible en la información proporcionada.

## Casos de uso

- Agentes de código de horizonte largo en on-premise: el modelo base está orientado a tareas de codificación prolongadas y la receta sostiene ventanas de 819.200 tokens en 4 DGX Spark, suficiente para mantener un repositorio mediano y el historial de herramientas dentro del contexto.
- Análisis de documentación técnica extensa: informes, normativa o monorepos completos que no caben en ventanas de 128K se pueden pasar íntegros en una sola sesión de hasta 1M tokens con la configuración de 8 nodos.
- Despliegue en entornos sin conectividad: el banco se descarga una vez por nodo y se verifica contra el manifiesto, lo que permite operar un modelo de 755B en instalaciones aisladas sin depender de APIs externas.
- Revisión de código multilingüe EN/ZH/JA: la calibración incluye esos tres idiomas, lo que resulta adecuado para equipos con documentación y comentarios en japonés o chino.
- Servicio interno de asistencia a desarrollo: la receta expone un panel de control que permite arrancar y reordenar el clúster eligiendo el ancho de experto; útil para dar servicio a un equipo interno con prioridades de memoria variables.
- Investigación sobre cuantización mixta: los cuatro bancos y las mediciones de divergencia KL publicadas permiten reproducir experimentos de asignación de bits por experto y validar estrategias de reparto de memoria.
- Prototipado de pipelines agénticos multi-paso: sesiones de agente reales formaron parte de los datos de calibración, de modo que el banco está ajustado a ese tipo de distribución de texto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible. El único dato de calidad publicado es la divergencia KL frente a las distribuciones de salida del modelo original en BF16 ejecutado en FP32 por la implementación oficial, medida sobre cuatro textos de 8.192 tokens (dos en inglés, dos de código), en posiciones 6.144 a 8.190:

| Ancho de los expertos enrutados | Divergencia KL |
|---|---|
| Todos a 2 bits | 0,0517 |
| Todos a 3 bits | 0,0203 |
| Todos a 4 bits | 0,0127 |
| Todos a 5 bits | 0,0114 (medido en 8 DGX Spark) |
| Referencia BF16 calculada en BF16 en lugar de FP32 | ~0,009 |

El propio autor señala que una mezcla con expertos a 2 bits se aleja entre un 13% y un 30% más de la referencia que una mezcla sin ellos, y que bajar otros expertos a 3 bits para pagar expertos a 5 bits no aporta ganancia medible.

## Requisitos de hardware

- El banco solo ocupa 427,6 GiB; hay que sumarle los pesos no-expertos del checkpoint de la receta (atención, expertos compartidos, embeddings y capa MTP), que se distribuyen entre los nodos.
- Hardware objetivo declarado: 4 u 8 DGX Spark (GB10). Con 4 nodos el contexto máximo práctico es de 819.200 tokens; con 8 se llega al 1M del modelo.
- VRAM por nodo: no disponible de forma explícita en la información proporcionada.
- No cabe en una GPU de consumo convencional: el tamaño del banco excede con mucho los 24 GB de una RTX 4090 y requiere un clúster multi-nodo.
- Motor de inferencia: exllamav3 1.6.1 con soporte EXL3; la receta aporta la CLI `tf-glm53` (`deploy`, `verify-banks`) y un panel de control. La release r3-102 del panel funciona sobre cuatro DGX Spark.
- vLLM, llama.cpp, Ollama o TGI: no contemplados para este formato en la documentación disponible (vLLM aparece solo en un proyecto distinto, GLM-5.3-Flash-EXL3, con pesos de 4 bpb).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Opcion | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este repo (banco de expertos 5 bits) | Expertos enrutados de un modelo de 755B | Depende del checkpoint de la receta (hasta 1M) | EXL3 5 bits, codebook mcg | GLM-5.3 License | 459,1 GB, 0 descargas |
| fiore-lab/GLM-5.3-EXL3-4x-DGX-Sparks | 755B | ~819.200 tokens | Mezcla: mitad de expertos a 3 bits, resto a 4, no-expertos a 5 bits, KV FP4 | GLM-5.3 License | Checkpoint completo para 4 nodos |
| fiore-lab/GLM-5.3-EXL3-8x-DGX-Sparks | 755B | 1M tokens | Expertos a 4 bits, no-expertos a 5 bits | GLM-5.3 License | Checkpoint completo para 8 nodos |
| zai-org/GLM-5.3-BF16 (original) | 755B | 1M tokens | BF16 | GLM-5.3 License (una fuente secundaria cita MIT para el modelo base; discrepancia no resuelta) | Pesos oficiales, requiere mucho más hardware |
| MiaAI-Lab/GLM-5.3-Flash-EXL3-2x-DGX-Sparks | GLM-5.3 Flash (tamano no disponible) | No disponible | EXL3 4 bpb, KV FP8, decodificación especulativa DFlash2 | No disponible | Servidor vLLM compatible con OpenAI para 2 DGX Spark |

## Limitaciones y advertencias

- No es un modelo autónomo: sin el checkpoint de la receta (4x u 8x DGX Sparks) no hay atención, expertos compartidos, embeddings ni capa MTP, y el modelo no puede ejecutarse.
- Requiere exllamav3 1.6.1 y la receta `fiore-glm5.3` en release r3-102 o posterior; no es un artefacto portable a otros motores sin conversión.
- La ganancia de 5 bits frente a 4 bits es pequeña en términos de divergencia KL (0,0114 frente a 0,0127), mientras que el coste en memoria es apreciable; el propio autor indica que la memoria adicional solo compensa si hay margen.
- La licencia es personalizada (GLM-5.3 License, `license: other`), no Apache ni MIT: hay que revisar los términos antes de un uso comercial. Una fuente secundaria (openlm.ai) afirma licencia MIT para el modelo base, lo que contradice los metadatos del repositorio; conviene verificar el texto de `LICENSE`.
- Riesgo de alucinación y sesgos: no hay evaluación publicada de sesgos, toxicidad ni tasas de alucinación para este banco ni para el modelo base en la información disponible.
- La calibración está limitada a inglés, chino y japonés; el rendimiento en castellano no está documentado y puede degradarse respecto al modelo en BF16.
- Los metadatos de HuggingFace indican un tamaño de repositorio de 0,0 GB y 0 descargas, mientras que el manifiesto declara 459,1 GB: hay que fiarse del manifiesto y verificar con `tf-glm53 verify-banks 5`, que tarda minutos por nodo.
- Un arranque o una reordenación que requiera un ancho de experto ausente en algún nodo se rechaza antes de aplicar cambios: la operación exige que todos los nodos tengan el banco correspondiente.
- Cualquier despliegue necesita gestionar 427,6 GiB de descarga y almacenamiento por nodo, además de los pesos no-expertos.

## Enlaces

- Repositorio del banco: https://huggingface.co/fiore-lab/GLM-5.3-EXL3-Experts-5bit
- Modelo base: https://huggingface.co/zai-org/GLM-5.3
- Pesos BF16 de origen: https://huggingface.co/zai-org/GLM-5.3-BF16
- Receta y código (Apache-2.0): https://github.com/fiore-labo/fiore-glm5.3
- Checkpoint para 4 DGX Spark: https://huggingface.co/fiore-lab/GLM-5.3-EXL3-4x-DGX-Sparks
- Checkpoint para 8 DGX Spark: https://huggingface.co/fiore-lab/GLM-5.3-EXL3-8x-DGX-Sparks
- Página del modelo base en openlm.ai: https://openlm.ai/glm-5.3/
- Proyecto relacionado GLM-5.3 Flash EXL3: https://github.com/MiaAI-Lab/GLM-5.3-Flash-EXL3-2x-DGX-Sparks/
- Organización MiaAI-Lab: https://github.com/MiaAI-Lab
