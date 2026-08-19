# modal-labs/glm-5.2-nvfp4-experts-only

## Resumen

GLM-5.2 NVFP4 es una cuantizacion publica del modelo base `zai-org/GLM-5.2`, realizada por Modal Labs en colaboracion con NVIDIA. El modelo es una version optimizada para inferencia eficiente en GPUs NVIDIA Blackwell, utilizando el formato de cuantizacion NVFP4 (NVIDIA FP4) aplicado exclusivamente a los expertos enrutados de la arquitectura Mixture-of-Experts (MoE). Esta cuantizacion selectiva mantiene en BF16 las capas de atencion, los expertos compartidos, el indexador DSA, las puertas del router, la cabeza lm_head y la cabeza MTP, reduciendo el uso de memoria y acelerando la inferencia sin sacrificar la calidad en las partes criticas del modelo.

El modelo base GLM-5.2, desarrollado por Zhipu AI (zai-org), es un modelo MoE de 753.000 millones de parametros totales con 40.000 millones activos por token, que utiliza una arquitectura hibrida con atencion MLA (Multi-head Latent Attention) y un indexador DSA (IndexShare) para soportar contextos de hasta 1.000.000 de tokens. Esta version cuantizada por Modal Labs esta pensada para despliegue en produccion con el motor de inferencia SGLang, y su relevancia radica en que permite ejecutar un modelo de esta escala en menos GPUs y con menor consumo de memoria, manteniendo la fidelidad en las partes del modelo donde la precision es mas critica.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE hibrida con MLA (Multi-head Latent Attention) y DSA (IndexShare) |
| Parametros totales | 380.989.135.104 (cuantizados) / 753.000 millones (modelo base) |
| Parametros activos | 40.000 millones (modelo base) |
| Longitud de contexto | 1.000.000 de tokens |
| Tipos de cuantizacion | NVFP4 (solo expertos enrutados MoE); resto en BF16 |
| Idiomas soportados | no disponible |
| Licencia | other (consulte la licencia del modelo base zai-org/GLM-5.2) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

GLM-5.2 es un modelo de lenguaje de gran escala con arquitectura Mixture-of-Experts que combina atencion MLA (Multi-head Latent Attention) con un indexador DSA (IndexShare) para gestionar el enrutamiento de tokens entre expertos. El modelo base tiene 753.000 millones de parametros totales, de los cuales 40.000 millones se activan por token, lo que permite un equilibrio entre capacidad y eficiencia computacional. La arquitectura incluye ademas una cabeza MTP (Multi-Token Prediction) que permite predecir multiples tokens en paralelo, y una capa densa MLP en las primeras capas (layers 0-2).

La cuantizacion NVFP4 realizada por Modal Labs se aplica exclusivamente a los expertos enrutados del MoE, que son las capas con mayor numero de parametros y donde la cuantizacion a 4 bits tiene menor impacto en la calidad. Las capas de atencion (MLA q/kv/o), los expertos compartidos, el MLP denso de las primeras capas, el indexador DSA, las puertas del router, la cabeza lm_head y la cabeza MTP se mantienen en BF16 para preservar la precision en las partes del modelo que son mas sensibles a errores de cuantizacion. Esta estrategia de cuantizacion parcial permite reducir significativamente el uso de memoria y acelerar la inferencia en GPUs Blackwell, que soportan nativamente el formato NVFP4.

El artefacto de cuantizacion utilizado es `GLM-5.2-NVFP4-agentic-v2-b300-lukescope-max-8k-512-r1`, que incluye un alcance de cuantizacion especifico para mantener la calidad en tareas agente y razonamiento. El modelo base de referencia es `zai-org/GLM-5.2` en la revision `e32aaf0396e6987ee6dd2abb7f4d318b5f9b3cfe`.

## Capacidades

- Generacion de texto y razonamiento complejo con soporte de contexto ultralargo (hasta 1.000.000 de tokens).
- Razonamiento multi-paso y capacidades agente gracias a la cuantizacion optimizada para tareas agente (artefacto `agentic-v2`).
- Soporte de tool calling / function calling, integrable en flujos de trabajo agente.
- Capacidades multilingues heredadas del modelo base GLM-5.2 (idiomas exactos no especificados).
- Soporte de decodificacion especulativa y prediccion multi-token mediante la cabeza MTP.
- Eficiencia de inferencia optimizada para GPUs NVIDIA Blackwell con soporte nativo de NVFP4.

## Casos de uso

- Despliegue en produccion de un asistente conversacional con contexto largo: gracias a su ventana de 1.000.000 de tokens, el modelo puede mantener conversaciones con historial extenso, ideal para aplicaciones de atencion al cliente o asistentes personales que necesitan recordar interacciones previas durante largos periodos.
- Razonamiento agente y automatizacion de tareas: el artefacto de cuantizacion esta optimizado para tareas agente, lo que lo hace adecuado para sistemas que requieren planificacion multi-paso, uso de herramientas y toma de decisiones autonoma en entornos de produccion.
- Analisis de documentos largos: la combinacion de contexto ultralargo y capacidad de razonamiento permite procesar libros completos, expedientes legales o informes tecnicos extensos en una sola pasada, extrayendo informacion y generando resumenes.
- Generacion de codigo asistida: el modelo puede integrarse en entornos de desarrollo como copiloto, con soporte de tool calling para ejecutar comandos o interactuar con APIs, manteniendo el contexto del proyecto completo.
- Investigacion cientifica y revision de literatura: con su capacidad de contexto de 1M tokens, puede analizar corpus amplios de articulos academicos, identificar patrones y generar sintesis de conocimiento.
- Infraestructura LLM como servicio: al ser una cuantizacion NVFP4 optimizada para Blackwell, permite ofrecer inferencia de alta calidad con menor coste de hardware, adecuada para plataformas que sirven modelos a multiples usuarios.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye tablas comparativas con otros modelos, ni datos de evaluacion en tareas estandar como MMLU, HumanEval o GSM8K. Se recomienda consultar la documentacion del modelo base `zai-org/GLM-5.2` para obtener datos de rendimiento de referencia.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible con exactitud, pero el tamano del repositorio es de 464,9 GB. La cuantizacion NVFP4 de los expertos reduce significativamente el peso respecto al modelo base BF16, estimandose un uso de memoria inferior a 400 GB para los pesos.
- GPU recomendadas: GPUs NVIDIA Blackwell con soporte nativo de NVFP4, como B200 o GB200. Tambien es compatible con GPUs Hopper (H100) mediante emulacion de FP4, aunque con menor eficiencia.
- No cabe en GPUs de consumo (RTX 4090 o similares) debido al tamano del modelo. Se requiere configuracion multi-GPU profesional.
- Opciones de despliegue: el modelo esta optimizado para SGLang, segun la etiqueta `library_name: sglang`. Tambien es compatible con vLLM segun la documentacion de modelos similares.
- Latencia y throughput: no disponibles. Dependen de la configuracion de hardware y del motor de inferencia utilizado.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia |
|---|---|---|---|---|
| GLM-5.2 NVFP4 (Modal Labs) | 381B (cuantizado) | 1M tokens | NVFP4 (expertos) | other |
| GLM-5.2 NVFP4 (NVIDIA) | no disponible | no disponible | NVFP4 (lineales MoE) | other |
| GLM-5.2 (base, zai-org) | 753B totales / 40B activos | 1M tokens | BF16 | other |

La version de Modal Labs se diferencia de la cuantizacion oficial de NVIDIA en el alcance de la cuantizacion: mientras NVIDIA cuantiza los pesos y activaciones de los operadores lineales dentro de los bloques transformer de los expertos MoE, Modal Labs cuantiza solo los pesos de los expertos enrutados, manteniendo el resto en BF16. Esto puede ofrecer mejor calidad en tareas de atencion y enrutamiento, a costa de un mayor uso de memoria.

## Limitaciones y advertencias

- La licencia es "other", lo que requiere revision cuidadosa de los terminos de la licencia del modelo base `zai-org/GLM-5.2` antes de uso comercial.
- La cuantizacion NVFP4 puede introducir degradacion de calidad en tareas que dependen de los expertos enrutados, aunque el alcance de cuantizacion esta optimizado para tareas agente.
- No se dispone de informacion sobre los idiomas soportados, sesgos o riesgos de alucinacion del modelo.
- El modelo requiere hardware profesional (GPUs Blackwell) para un despliegue eficiente, lo que limita su uso en entornos con recursos limitados.
- El tamano del repositorio (464,9 GB) implica requisitos de almacenamiento y ancho de banda significativos para la descarga y el despliegue.
- No se han publicado benchmarks especificos para esta cuantizacion, por lo que el rendimiento real en tareas concretas debe validarse de forma independiente.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/modal-labs/glm-5.2-nvfp4-experts-only
- Modelo base: https://huggingface.co/zai-org/GLM-5.2
- Cuantizacion oficial NVIDIA: https://huggingface.co/nvidia/GLM-5.2-NVFP4
- Version en ModelScope: https://www.modelscope.cn/models/nv-community/GLM-5.2-NVFP4
- Soluciones LLM de Modal: https://modal.com/solutions/llm
