# manateelazycat/DeepSeek-V4.1-Flash-Thor-EXL3-2.7bpw

## Resumen

Esta ficha describe `manateelazycat/DeepSeek-V4.1-Flash-Thor-EXL3-2.7bpw`, una cuantización comunitaria del modelo `deepseek-ai/DeepSeek-V4.1-Flash` publicada por el usuario manateelazycat. Se trata de un empaquetado EXL3 (trellis) que comprime los expertos enrutados del backbone a 2,70 bits por peso en memoria y 2,90 bits por token decodificado, con el objetivo de servir un modelo de 295.129.747.154 parámetros totales en dos estaciones NVIDIA DGX Spark (GB10) mediante tensor parallel 2. El modelo base es un Mixture-of-Experts con 40 capas, 15.360 expertos enrutados en el backbone, torre de visión y tablas Engram, servido con vLLM parcheado y decodificación especulativa DSpark.

La relevancia de este checkpoint es operativa: demuestra que un modelo MoE de ~295.000 millones de parámetros puede desplegarse en hardware de escritorio de gama alta (dos DGX Spark) manteniendo una fidelidad muy alta respecto al modelo nativo. El autor reporta una divergencia KL media de 0,0243 nats frente al nativo y una tasa de coincidencia top-1 del 95,57%, con una perplejidad de 1,5167 frente a 1,4978 del modelo original. La ventana de contexto por petición alcanza los 262.144 tokens, validada con needles 3/3 hasta 256K.

El repositorio ocupa 399,4 GB e incluye los pesos en formato safetensors, más un plan de cuantización por experto y los safetensors EXL3 de densas, cabeza y drafter. No incorpora los dos shards oficiales de Engram (203 GB), que deben descargarse aparte desde el repositorio oficial. La licencia es MIT, heredada del modelo base, lo que permite uso comercial sin restricciones adicionales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture-of-Experts (MoE) con 40 capas; backbone con 15.360 expertos enrutados y experto compartido; torre de vision; tablas Engram; drafter DSpark para decodificacion especulativa |
| Parametros totales | 295.129.747.154 (~295B) |
| Parametros activos | no disponible |
| Longitud de contexto | 262.144 tokens por peticion (validado con needles 3/3 a 8K, 32K, 64K, 128K, 256K) |
| Tipos de cuantizacion | EXL3 trellis a 2, 3, 4 y 5 bits por peso segun experto y modulo; densas del backbone a K4 y K5; cabeza LM a K4; densas del drafter a K5 y expertos del drafter a K3; lineales MXFP8 servidas con Marlin |
| Idiomas soportados | no disponible (la comparativa menciona evaluacion multilingue en el panel de benchmarks, sin listado de idiomas) |
| Licencia | MIT (licencia oficial de DeepSeek, sin cambios) |
| Formato de pesos | safetensors (incluye safetensors EXL3 por capa y mitades, densas, cabeza, drafter y el resto de tensores oficiales) |

## Arquitectura y entrenamiento

El modelo base es un transformer de tipo Mixture-of-Experts de 40 capas con 15.360 expertos enrutados en el backbone, un experto compartido y una torre de visión. Incorpora tablas Engram leídas desde disco en el momento de la consulta (offload de disco) y un drafter DSpark que habilita decodificación especulativa con profundidad por ronda k = 5. La cuantización EXL3 se aplica sobre tensores trellis, con un ancho de bits por experto seleccionado a partir de una medición de sensibilidad, y con asignaciones específicas por módulo: las lineales densas `wq_a`, `wq_b`, `wo_b` y el experto compartido a K4, `wo_a` a K5 y la cabeza LM a K4.

No hay información disponible en el material proporcionado sobre el número de tokens de entrenamiento, la composición del dataset ni sobre si hubo fases de RLHF o DPO, ya que esta ficha corresponde a una cuantización del modelo base y no al entrenamiento original. La innovación técnica de este empaquetado reside en la combinación de cuantización EXL3 por experto con un plan de bits en `exl3_moe_plan.json`, la decodificación especulativa DSpark y el uso de grafos CUDA FULL_DECODE_ONLY, además de un `tp_layout: channels` y un kernel de decodificación `coop`. El checkpoint está preparado para cargarse exclusivamente con vLLM main `6e517b15` más la serie de parches y el plugin `vllm_exl3_moe`; vLLM de serie no reconoce el método de cuantización `deepseek_v41_exl3`.

## Capacidades

- Generación de texto y razonamiento general, con soporte de contexto largo de hasta 262.144 tokens por petición.
- Generación de código, validada con HumanEval+ y MBPP+ (resultados en la sección de benchmarks).
- Seguimiento de instrucciones, validado con IFEval en modalidad prompt strict e instruction strict.
- Capacidades multilingües, evaluadas dentro del panel de benchmarks del autor (closer a nativo en 7 de 8 dominios).
- Visión: el checkpoint conserva la torre de visión oficial sin cuantizar.
- Decodificación especulativa mediante el drafter DSpark incluido (densas EXL3 K5 y expertos enrutados EXL3 K3).
- Plan de cuantización por experto con anchos de bits de 2, 3, 4 y 5 bpw seleccionados por sensibilidad medida.
- Soporte de tool calling y function calling: no disponible explícitamente en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible explícitamente en la información proporcionada.

## Casos de uso

- Asistencia de código en producción: el modelo puede integrarse en pipelines de revisión y generación de código aprovechando sus resultados en HumanEval+ (97,0 base / 90,9 plus) y MBPP+ (91,3 base / 78,6 plus), con 262.144 tokens de contexto para manejar repositorios grandes en una sola petición.
- Procesamiento de documentos largos: con 262.144 tokens por petición y needles 3/3 hasta 256K, es adecuado para resumir, extraer y razonar sobre contratos, informes técnicos o expedientes extensos sin troceado manual.
- Despliegue on-premise en hardware compacto: al caber en dos DGX Spark con memoria disponible de 9 GiB por nodo tras la carga, permite servir un MoE de ~295B en entornos con restricciones de espacio y consumo frente a clústeres de GPUs de centro de datos.
- Atención al cliente automatizada con contexto largo: la ventana de 262.144 tokens permite mantener conversaciones multi-turno con historial muy extenso y documentación de producto adjunta en una única sesión.
- Evaluación y experimentación de cuantización: el repositorio expone el plan de bits por experto (`exl3_moe_plan.json`) y la configuración EXL3, lo que facilita estudiar el impacto de distintos anchos de bits sobre fidelidad y rendimiento.
- Investigación en decodificación especulativa: la inclusión del drafter DSpark permite medir ganancias de throughput en escenarios de código, prosa y datos estructurados (103,0 / 58,3 / 141,3 tok/s respectivamente).
- Tareas multimodales: la conservación de la torre de visión oficial sin cuantizar habilita casos de descripción de imágenes y razonamiento sobre contenido visual, siempre que el motor de servicio lo soporte.

## Benchmarks y rendimiento

Resultados medidos por el autor sobre dos DGX Sparks, comparando esta compilación con el modelo nativo:

| Métrica | Esta compilación | Nativo |
|---|---|---|
| KLD vs nativo en el panel (media, nats; 8 dominios ponderados por igual) | 0,0243 (0,0398) | referencia |
| Coincidencia top-1 | 95,57% | referencia |
| Perplejidad en el panel | 1,5167 | 1,4978 |
| HumanEval+ (164), base / plus | 97,0 / 90,9 | 97,6 / 92,1 |
| MBPP+ (378), base / plus | 91,3 / 78,6 | 91,0 / 77,5 |
| IFEval (541), prompt strict / instruction strict | 87,6 / 91,6 | 89,5 / 92,9 |
| Decodificación, `kit_bench.py` conjunto b, código / prosa / estructurado, DSpark on (k = 5) | 103,0 / 58,3 / 141,3 tok/s | no disponible |
| Contexto por petición | 262.144 tokens; needles 3/3 a 8K, 32K, 64K, 128K y 256K (prompt de 255.709 tokens) | no disponible |
| MemAvailable tras la carga, head / worker | 9 / 9 GiB | no disponible |

Comparativa con otras cuantizaciones sobre el mismo panel y la misma implementación de referencia: la compilación J268 de 0xSero (2,43 bpw en memoria, 2,77 bpw por token decodificado) obtiene KLD 0,0327 (0,0516 ponderando dominios por igual), top-1 95,00% y perplejidad 1,5277; el pack de 2,9 bpw de Mia-AiLab obtiene KLD 0,0295 (0,0443), top-1 94,99% y perplejidad 1,5221. Según el autor, esta compilación está más cerca del nativo en 7 de los 8 dominios y con dominios ponderados por igual, mientras que el pack de Mia-AiLab es mejor en multilingüe.

## Requisitos de hardware

- VRAM/memoria: requiere dos nodos NVIDIA DGX Spark (GB10) con memoria unificada; no es viable en una única GPU de consumo ni de centro de datos convencional.
- Memoria disponible tras la carga: 9 GiB en el nodo head y 9 GiB en el nodo worker.
- GPUs recomendadas: 2x NVIDIA DGX Spark (GB10), con tensor parallel 2 y NCCL sobre RoCE mediante el enlace ConnectX.
- ¿Cabe en consumer GPU? No; el tamaño del repositorio (399,4 GB) y el requisito de dos nodos lo impiden.
- Opciones de despliegue: vLLM main `6e517b15` más la serie de parches del repositorio y el plugin `vllm_exl3_moe` (imagen release). vLLM de serie no soporta el método `deepseek_v41_exl3`. Otros motores (llama.cpp, Ollama, TGI) no han sido probados según la información disponible.
- Conectividad: se requiere que ambas Sparks tengan la carpeta completa en la misma ruta absoluta y acceso ssh sin contraseña desde una máquina de control.
- Latencia y throughput: 103,0 tok/s en código, 58,3 tok/s en prosa y 141,3 tok/s en salida estructurada, con DSpark activado (k = 5 por ronda).

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Fidelidad (KLD media) | Top-1 | Perplejidad | Licencia |
|---|---|---|---|---|---|---|
| DeepSeek-V4.1-Flash-Thor-EXL3-2.7bpw (esta) | 295B | 262.144 | 0,0243 (0,0398) | 95,57% | 1,5167 | MIT |
| 0xSero J268 EXL3 (2,43 bpw) | mismo base | no disponible | 0,0327 (0,0516) | 95,00% | 1,5277 | MIT (base) |
| Mia-AiLab pack 2,9 bpw | mismo base | no disponible | 0,0295 (0,0443) | 94,99% | 1,5221 | MIT (base) |
| deepseek-ai/DeepSeek-V4.1-Flash (nativo) | 295B | 262.144 | referencia | referencia | 1,4978 | MIT |

Los tres modelos comparados son cuantizaciones del mismo modelo base, por lo que comparten arquitectura, contexto y licencia; las diferencias se reducen a la fidelidad respecto al nativo y al ancho de bits efectivo.

## Limitaciones y advertencias

- Requiere un stack de servicio muy específico: vLLM main `6e517b15` con parches propietarios y el plugin `vllm_exl3_moe`; no funciona con vLLM de serie ni con otros motores, lo que limita la portabilidad.
- El repositorio no incluye los dos shards oficiales de Engram (203 GB), que deben descargarse aparte desde el repositorio oficial; sin ellos el modelo no queda completo.
- La ventana de contexto de 262.144 tokens implica un consumo de memoria elevado y puede degradar el throughput en prompts muy largos.
- Riesgo de alucinación: no disponible en la información proporcionada; se recomienda validación en dominios críticos dado que es un modelo generativo.
- Sesgos conocidos: no disponible en la información proporcionada.
- Idiomas soportados: no disponible; no se ofrece un listado oficial de idiomas y la evaluación multilingüe se limita al panel del autor.
- Licencia MIT heredada del modelo base, sin restricciones adicionales documentadas para uso comercial en el material proporcionado.
- Existe una discrepancia nominal entre el repositorio (namespace `manateelazycat`, con el sufijo "Thor" y 0 descargas y 0 likes en el momento de la consulta) y el repositorio de referencia citado en la propia model card (`sudoingX/DeepSeek-V4.1-Flash-EXL3-2.7bpw`), por lo que conviene verificar la integridad mediante `MANIFEST.sha256`.
- Aunque el autor reporta que ninguna suite difiere significativamente del nativo (IFEval prompt strict frente a nativo: p emparejada = 0,13), persisten diferencias medibles en varias métricas (por ejemplo, HumanEval+ plus: 90,9 frente a 92,1).

## Enlaces

- Modelo en HuggingFace (este repositorio): https://huggingface.co/manateelazycat/DeepSeek-V4.1-Flash-Thor-EXL3-2.7bpw
- Modelo base: https://huggingface.co/deepseek-ai/DeepSeek-V4.1-Flash
- Repositorio de referencia citado en la model card (build de sudoingx): https://huggingface.co/sudoingx/DeepSeek-V4.1-Flash-EXL3-2.7bpw
- Repositorio GitHub con parches, plugin y guía de despliegue: https://github.com/sudoingX/dgx-spark-deepseek-v41
- Guía de inicio rápido (launcher, imagen y ajustes): https://github.com/sudoingX/dgx-spark-deepseek-v41#quickstart
