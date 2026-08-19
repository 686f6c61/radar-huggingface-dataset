# JasonW2025/Ling-3.0-flash-HybridQuant-NVFP4-W4A16-LocalHessian

## Resumen

Ling-3.0-flash-HybridQuant-NVFP4-W4A16-LocalHessian es una cuantizacion del modelo Ling-3.0-flash de InclusionAI, publicada por JasonW2025 en HuggingFace. Se trata de la segunda version de una cuantizacion híbrida NVFP4 W4A16, que se diferencia de su hermano MSE en el metodo de seleccion de escalas de peso: utiliza una busqueda local-Hessian ponderada por error en lugar de un barrido de error cuadratico medio. El resultado es un artefacto de ~72 GiB en 8 shards, disenado para ejecutarse en una sola GPU GB10 (DGX Spark) de 121 GB.

El modelo base, Ling-3.0-flash, es un MoE híbrido de 124B parametros totales y 5.1B activos, con una pila alternante 5:1 de atencion KDA y MLA, y contexto nativo de 256K extensible a 1M. Esta cuantizacion mantiene la misma colocacion de bits que su hermano MSE, pero con escalas mejoradas, lo que se traduce en una mejora sugestiva (no estadisticamente concluyente) en benchmarks de tool-calling, especialmente con el modo de razonamiento activado. La relevancia actual radica en que permite ejecutar un modelo de 124B en hardware de consumo profesional con una sola GPU, manteniendo capacidades de agente y razonamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE híbrida (KDA + MLA) con MTP, cuantizado NVFP4 W4A16 |
| Parametros totales | 65.527.606.240 (segun safetensors; el modelo base tiene 124B) |
| Parametros activos | 5.1B (del modelo base) |
| Longitud de contexto | 256K nativo (modelo base); 32K configurado en el comando de servicio |
| Tipos de cuantizacion | NVFP4 W4A16 (expertos enrutados, ruta caliente KDA/MLA, lm_head); FP8 (capas densas 0-1, expertos compartidos); BF16 (pins en MLA KV writers, embeddings, bloque MTP) |
| Idiomas soportados | no disponible |
| Licencia | hereda la del modelo base (other, consultar inclusionAI/Ling-3.0-flash) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo base Ling-3.0-flash emplea una arquitectura MoE híbrida con una pila alternante 5:1 de atencion KDA (kernel-based dynamic attention) y MLA (multi-head latent attention), disenada para eficiencia en inferencia y manejo de contextos largos. Incorpora un bloque MTP (multi-token prediction) en la capa 42 que actua como cabeza de borrador para decodificacion especulativa. Los datos de entrenamiento del modelo base no estan disponibles en la informacion proporcionada, pero se sabe que el modelo integra SGLang HiCache y Mooncake hierarchical caching, reduciendo el TTFT entre 60% y 80% en entradas largas.

Esta cuantizacion, creada por JasonW2025, aplica NVFP4 W4A16 en los expertos enrutados y la ruta caliente siempre activa (KDA/MLA attention), FP8 en las capas densas iniciales y expertos compartidos, y mantiene pines BF16 en los escritores de la caché KV de MLA y en el bloque MTP. La innovacion principal es el uso de una busqueda local-Hessian para elegir las escalas de peso, en lugar de un barrido MSE clasico, lo que reduce el error de cuantizacion en escenarios de tool-calling y razonamiento. No se han publicado detalles sobre el proceso de entrenamiento o fine-tuning posterior a la cuantizacion.

## Capacidades

- Generacion de texto conversacional y de razonamiento, con soporte nativo de modo "thinking" (razonamiento encadenado) activable via parametros de chat.
- Tool calling / function calling: soporta seleccion automatica de herramientas con parser dedicado `ling3` y configuracion `--enable-auto-tool-choice`.
- Razonamiento multi-paso y resolucion de tareas de agente, validado en un benchmark de 69 escenarios de tool-calling.
- Decodificacion especulativa via bloque MTP, que acelera la inferencia entre un 20% y un 25% con una tasa de aceptacion del 82-86%.
- Capacidades multilingues: no disponibles en la informacion proporcionada.
- Integracion con vLLM para despliegue en produccion, con soporte de caché KV en FP8 o BF16.

## Casos de uso

- Atencion al cliente automatizada: el modelo puede gestionar conversaciones multi-turno con contexto largo gracias a su ventana de 32K tokens configurada y su capacidad de tool calling para consultar bases de datos o sistemas CRM. Su modo thinking permite resolver consultas complejas antes de responder.
- Generacion de codigo en produccion: con soporte de tool calling y razonamiento, puede integrarse en pipelines de CI/CD para generar, revisar y corregir codigo, aprovechando su rendimiento en benchmarks de SWE-Bench Pro (56.6% en el modelo base).
- Agentes autonomos: su capacidad de multi-step reasoning y tool calling lo hace adecuado para agentes que deben planificar y ejecutar tareas complejas, como navegacion web automatizada o gestion de APIs.
- Analisis de documentos largos: con contexto nativo de 256K (aunque limitado a 32K en esta cuantizacion), puede resumir y extraer informacion de contratos, informes o articulos extensos.
- Razonamiento matematico y cientifico: su modo thinking y su entrenamiento en razonamiento lo hacen util para resolver problemas matematicos o cientificos paso a paso, como demostraciones o calculos.
- Despliegue en hardware de consumo profesional: al caber en una GB10 de 121 GB, permite ejecutar un modelo de 124B en estaciones de trabajo locales sin necesidad de clusteres, ideal para prototipado y experimentacion.

## Benchmarks y rendimiento

Los siguientes datos de tool-calling provienen de la model card del autor, medidos en un benchmark de 69 escenarios, n=3 por configuracion, con caché de prefijo desactivada y temperatura 0:

| Artefacto | Thinking off (media) | Thinking on (media) |
|---|---|---|
| Este modelo (local-Hessian) | 87.0 | 90.0 |
| Hermano MSE | 84.7 | 88.3 |

Nota: la desviacion estandar entre ejecuciones es de aproximadamente 2.5 puntos, por lo que la diferencia de ~2 puntos entre artefactos es sugestiva pero no concluyente. El modelo tambien paso un escenario de resolucion de ambiguedad que el build anterior fallo, y produjo cero flags de seguridad critica en todas las ejecuciones.

El modelo base Ling-3.0-flash reporta 56.6% en SWE-Bench Pro y 72.4% en SWE-Bench Multilingual, segun aimodeling.com. Estos datos corresponden al modelo original, no a esta cuantizacion.

## Requisitos de hardware

- VRAM estimada: ~72 GiB para el modelo completo (8 shards), mas espacio para la caché KV. Con BF16 KV cache, la caché ocupa 2.686.976 tokens; con FP8, 4.639.012 tokens.
- GPU recomendada: GB10 (DGX Spark) con 121 GB de memoria unificada. Tambien puede ejecutarse en GPUs con al menos 80 GB de VRAM (por ejemplo, A100 80GB, H100) siempre que se ajuste la configuracion de memoria.
- No cabe en GPUs de consumo (RTX 4090, 3090, etc.) debido al tamaño del modelo y la necesidad de memoria compartida especifica.
- Despliegue: requiere vLLM con soporte para `BailingMoeV3ForCausalLM`. Build validado: `v0.26.1rc1.dev468+g6b5bec7be`. En GB10 con `--kv-cache-dtype fp8` es necesario parchear el kernel Triton de decodificacion MLA (una linea) para evitar un fallo de memoria compartida.
- Latencia: 55.6 tok/s en configuracion baseline, 67.5 tok/s con MTP, 55.0 tok/s con FP8 KV, y 69.0 tok/s con ambas optimizaciones. Se recomienda limitar `--gpu-memory-utilization` a 0.80 en GB10 para evitar bloqueos del RM de NVIDIA.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Rendimiento tool-calling (thinking on) | Licencia |
|---|---|---|---|---|---|
| Este modelo (local-Hessian) | 65.5B (safetensors) | 32K configurado | NVFP4 W4A16 + FP8 + BF16 | 90.0 | hereda del base |
| Hermano MSE (JasonW2025) | 65.5B (safetensors) | 32K configurado | NVFP4 W4A16 + FP8 + BF16 | 88.3 | hereda del base |
| Ling-3.0-flash (sin cuantizar) | 124B totales / 5.1B activos | 256K nativo | BF16 | no disponible | other |

La diferencia principal entre este modelo y su hermano MSE es el metodo de seleccion de escalas (local-Hessian vs MSE), que produce una mejora de ~2 puntos en tool-calling. Frente al modelo base sin cuantizar, esta version reduce drasticamente los requisitos de VRAM (72 GiB vs >200 GiB en BF16) a costa de una ligera perdida de calidad y de una ventana de contexto reducida en la configuracion de servicio.

## Limitaciones y advertencias

- La cuantizacion puede introducir errores en tareas de precision numerica o razonamiento logico complejo; no se han publicado evaluaciones exhaustivas en benchmarks como MMLU o GSM8K para este artefacto.
- Requiere un parche manual en el kernel Triton de vLLM para usar FP8 KV en GB10; sin el parche, el motor no inicia. En GPUs con mas memoria compartida no es necesario.
- El comando de servicio limita el contexto a 32K tokens, muy por debajo del contexto nativo de 256K del modelo base, lo que puede ser insuficiente para documentos muy largos.
- Se recomienda no superar `--gpu-memory-utilization` de 0.80 en GB10; valores superiores han causado bloqueos del hardware que requieren ciclo de energia.
- La licencia hereda la del modelo base (other), que puede imponer restricciones de uso comercial; es necesario revisar los terminos de inclusionAI/Ling-3.0-flash antes de desplegar en produccion.
- No se dispone de informacion sobre sesgos o riesgos de alucinacion especificos de esta cuantizacion; el modelo base es de naturaleza generativa y puede producir contenido incorrecto o tendencioso.
- El tamaño del repo (76.9 GB) y la necesidad de una GPU con al menos 121 GB limitan su uso a entornos profesionales.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/JasonW2025/Ling-3.0-flash-HybridQuant-NVFP4-W4A16-LocalHessian
- Hermano MSE: https://huggingface.co/JasonW2025/Ling-3.0-flash-HybridQuant-NVFP4-W4A16
- Modelo base: https://huggingface.co/inclusionAI/Ling-3.0-flash
- Documentacion de Ling: https://developer.ant-ling.com/en/docs/models/ling/
- Benchmark en Kilo Code: https://kilo.ai/models/inclusionai-ling-3-0-flash-free
- Analisis de arquitectura: https://www.aimodeling.com/en/news/slug/inclusionai-ling-3-flash-hybrid-linear-moe-agent
