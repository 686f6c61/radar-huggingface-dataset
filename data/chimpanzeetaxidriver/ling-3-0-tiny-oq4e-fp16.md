# chimpanzeetaxidriver/Ling-3.0-tiny-oQ4e-fp16

## Resumen

`chimpanzeetaxidriver/Ling-3.0-tiny-oQ4e-fp16` es una cuantización comunitaria del modelo `inclusionAI/Ling-3.0-tiny`, un Mixture-of-Experts (MoE) de razonamiento híbrido desarrollado por inclusionAI que suma 7.893.392.800 parámetros totales pero solo activa aproximadamente 1.300 millones por token. El checkpoint que nos ocupa no es un modelo nuevo: es una redistribución de pesos en formato MLX, generada con oQ (oMLX v0.7.3rc1) mediante cuantización de precisión mixta, con una media efectiva de 4,718 bits por peso.

El interés práctico está en el tamaño resultante: los 4,335 GiB de pesos (frente a los ~15,8 GB que ocuparía el mismo modelo en BF16) permiten ejecutar un MoE de casi 8.000 millones de parámetros en Apple Silicon con memoria unificada moderada, manteniendo un coste de inferencia bajo gracias a los 1,3B parámetros activos. La receta de oQ no aplica 4 bits de forma uniforme: el 92,77% de los pesos queda a 4 bits, pero un 3,75% se conserva a 8 bits y un 3,23% a 6 bits, una estrategia habitual para proteger capas sensibles.

Ahora bien, conviene calibrar expectativas: el repositorio se publicó el 27 de octubre de 2026 y, en el momento de redactar esta ficha, acumula 0 descargas y 0 likes, no incluye resultados de evaluación y no documenta longitud de contexto ni idiomas soportados. Es, por tanto, un artefacto recién empaquetado y sin validación comunitaria, adecuado para experimentación local pero no para producción sin una evaluación propia previa.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer MoE híbrido (la información disponible indica que alterna mecanismos de atención tipo Kimi, sin detallar la configuración exacta) |
| Parámetros totales | 7.893.392.800 (7,89B) |
| Parámetros activos | aproximadamente 1,3B por token |
| Longitud de contexto | no disponible |
| Tipos de cuantización | oQ de precisión mixta: afín 4 bits grupo 64 (92,770% de los pesos), 5 bits (0,250%), 6 bits (3,227%), 8 bits (3,746%), FP16 (0,007%), FP32 (0,000%); media efectiva 4,718 bits/peso |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors en formato MLX (no GGUF); requiere `mlx` / `mlx-lm` y `trust_remote_code` |
| Modelo base | `inclusionAI/Ling-3.0-tiny` |
| Tamaño del repositorio | 4,7 GB (4,335 GiB de pesos) |
| Pipeline | text-generation (conversacional) |

## Arquitectura y entrenamiento

La información disponible describe Ling-3.0-tiny como un MoE híbrido de razonamiento con 7,9B parámetros totales y 1,3B activados por token, y una arquitectura que alterna capas con mecanismos de atención tipo Kimi (la fuente consultada está truncada en ese punto, por lo que no se puede confirmar si se refiere a atención lineal con decaimiento, a una variante de atención diferencial o a otra formulación concreta). El ratio de activación, de aproximadamente 1:6, sitúa el coste de cómputo por token en el orden de un modelo denso de 1-2B, mientras la capacidad efectiva de representación se acerca a la de un modelo denso de 8B.

No se han publicado en la información proporcionada datos sobre el volumen de tokens de entrenamiento, la composición del corpus, las etapas de post-entrenamiento (RLHF, DPO u otras) ni innovaciones adicionales de inferencia como decodificación especulativa. Lo que sí está documentado con precisión es la intervención de cuantización: oQ (oMLX v0.7.3rc1) asigna 4 bits afines con grupo de 64 a la mayoría de tensores y eleva a 6 y 8 bits un 6,97% de los pesos, presumiblemente capas de atención, embeddings o expertos con mayor sensibilidad, dando como resultado un checkpoint de 4.335 GiB y 4,718 bits/peso efectivos. No se documenta qué criterio siguió oQ para decidir la precisión de cada tensor.

## Capacidades

- Generación de texto conversacional multi-turno, con soporte declarado de plantilla de chat en el modelo base.
- Razonamiento híbrido: el modelo base se presenta como *hybrid reasoning*, con capacidad de razonamiento explícito antes de responder; no se detalla si existe un modo "thinking" conmutables ni su formato exacto.
- Generación de código: la descripción del modelo base incluye explícitamente tareas de programación entre sus casos de uso previstos.
- Capacidades agénticas: el modelo base se comercializa como adecuado para *AI agents*, con razonamiento multi-paso; no hay confirmación documentada de soporte nativo de *tool calling* ni del esquema de funciones empleado.
- Ejecución local de bajo coste: 1,3B parámetros activos por token permiten throughput alto en hardware modesto.
- Capacidades multilingües: no disponible (el repositorio no declara lista de idiomas).
- Visión, audio y otras modalidades: no disponible; el pipeline declarado es únicamente `text-generation`.

## Casos de uso

- Asistentes locales en Mac para tareas de razonamiento y análisis: el checkpoint está pensado para `mlx-lm`, de modo que se puede servir con `mlx_lm.server` en un Mac con memoria unificada y mantener los datos íntegramente en la máquina, sin llamadas a APIs externas.
- Generación y revisión de código en el editor: con 1,3B parámetros activos por token, la latencia por token en Apple Silicon es compatible con autocompletado interactivo y con la generación de parches completos en local.
- Agentes multi-paso sobre herramientas locales: el modelo base declara capacidades agénticas, por lo que encaja en bucles de planificación-ejecución sobre ficheros, shell o APIs internas, siempre que se valide empíricamente el soporte real de *function calling*.
- Prototipado y evaluación de pipelines RAG: su tamaño reducido permite iterar rápido sobre estrategias de recuperación y prompts sin coste de API, aunque la longitud de contexto no documentada obliga a medirla antes de dimensionar el chunking.
- Procesamiento por lotes de documentación técnica en equipos con portátiles Apple: clasificación, resumen y extracción de entidades sobre colas de documentos, ejecutando el modelo en segundo plano con un consumo de memoria de ~4,4 GiB de pesos más caché KV.
- Investigación sobre cuantización: el repo publica la distribución exacta de bits por tensor, lo que lo convierte en un banco de pruebas útil para medir la degradación de un MoE cuantizado a 4,718 bits frente al BF16 original en tareas de razonamiento y código.
- Despliegue en entornos con requisitos estrictos de privacidad o air-gapped: al ser un checkpoint MIT de 4,7 GB, se puede distribuir en un USB o una imagen interna y ejecutarse sin conectividad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

| Benchmark | Este checkpoint | Ling-3.0-tiny (BF16) | Observaciones |
|---|---|---|---|
| MMLU | no disponible | no disponible | Sin datos de evaluación en el repositorio |
| HumanEval | no disponible | no disponible | Sin datos de evaluación en el repositorio |
| GSM8K | no disponible | no disponible | Sin datos de evaluación en el repositorio |
| Throughput / latencia | no disponible | no disponible | No se documentan tokens/s en Apple Silicon |

## Requisitos de hardware

- VRAM/memoria unificada: 4,335 GiB solo para pesos, más caché KV y buffers de activación. Con contexto corto, un Mac de 16 GB ejecuta el modelo con holgura; en máquinas de 8 GB el margen es muy ajustado una vez descontado el sistema operativo.
- Plataforma: el formato es MLX, por lo que la inferencia nativa requiere Apple Silicon (familia M1 o posterior). No se ejecuta en CUDA ni en CPU x86 sin convertir los pesos a otro formato.
- GPU recomendadas: cualquier Apple Silicon con 16 GB o más de memoria unificada (M1/M2/M3/M4 en sus variantes Pro, Max o Ultra). Para CUDA habría que generar una cuantización GGUF o AWQ equivalente a partir del modelo base, no de este repo.
- Opciones de despliegue: `mlx-lm` (carga directa con `trust_remote_code=True`), servidor HTTP de `mlx-lm`, oMLX/oQ como herramienta de cuantización y verificación. vLLM, TGI, llama.cpp y Ollama no consumen safetensors MLX; requerirían reconversión.
- Latencia y throughput: no disponible. Como referencia cualitativa, un MoE con 1,3B activos suele ser sensiblemente más rápido por token que un denso de 8B en el mismo hardware, pero no hay cifras publicadas para este checkpoint.

## Comparativa con modelos similares

| Modelo | Parámetros | Activos | Contexto | Licencia | Formato | Benchmarks |
|---|---|---|---|---|---|---|
| Ling-3.0-tiny-oQ4e-fp16 (este repo) | 7,89B | ~1,3B | no disponible | MIT | safetensors MLX, 4,718 bits/peso | no disponible |
| inclusionAI/Ling-3.0-tiny (base BF16) | 7,89B | ~1,3B | no disponible | MIT | safetensors BF16 | no disponible |
| Qwen3-8B (denso) | ~8,2B | 8,2B | 32.768 tokens nativos | Apache-2.0 | safetensors, GGUF, MLX | ampliamente publicado por el autor |
| Llama-3.1-8B (denso) | ~8,03B | 8,03B | 128.000 tokens | Llama 3.1 Community License | safetensors, GGUF, MLX | ampliamente publicado por el autor |

La comparación relevante no es solo de tamaño sino de régimen de ejecución: frente a un denso de 8B, Ling-3.0-tiny activa una sexta parte de los parámetros por token, lo que reduce el coste computacional por token a cambio de un *footprint* de memoria similar (hay que residir todos los expertos). Frente al base en BF16, esta cuantización reduce el almacenamiento de ~15,8 GB a 4,335 GiB con una pérdida de precisión no medida. No se dispone de datos que permitan comparar calidad entre estos modelos.

## Limitaciones y advertencias

- Cuantización agresiva: el 92,77% de los pesos está a 4 bits, y no se publica ninguna evaluación de la degradación frente al BF16. En tareas sensibles a precisión (matemáticas, código con APIs exóticas) es esperable cierta pérdida, pero su magnitud es desconocida.
- Sin validación comunitaria: 0 descargas y 0 likes en el momento de la ficha; no hay informes de terceros sobre fallos de carga o de tokenizador.
- Requiere `trust_remote_code=True` (tag `custom_code`), es decir, ejecutar código Python del repositorio; conviene auditar los ficheros antes de usarlo en entornos sensibles.
- Formato MLX cerrado a Apple Silicon: no es portable a CUDA, ROCm ni CPU x86 sin reconversión, lo que limita su uso en clústeres y en servicios cloud estándar.
- Longitud de contexto e idiomas no documentados: no se puede garantizar un rendimiento correcto en castellano ni dimensionar aplicaciones RAG o de conversation multi-turno largo sin medirlo previamente.
- Riesgo de alucinación: inherente a cualquier modelo de esta escala; no hay datos de entrenamiento publicados que permitan acotar el dominio de conocimiento cubierto.
- Sesgos: no disponible; no se ha publicado ninguna evaluación de sesgo o toxicidad para el modelo base ni para esta cuantización.
- Licencia: el repo declara MIT, lo que en principio permite uso comercial y redistribución; aun así, conviene verificar la licencia del modelo base `inclusionAI/Ling-3.0-tiny` y conservar los avisos de atribución correspondientes.
- Nombre del repo potencialmente engañoso: la etiqueta `fp16` convive con una cuantización de 4,718 bits/peso; el FP16 solo afecta al 0,007% de los pesos.

## Enlaces

- Repositorio HuggingFace de esta cuantización: https://huggingface.co/chimpanzeetaxidriver/Ling-3.0-tiny-oQ4e-fp16
- Modelo base en HuggingFace: https://huggingface.co/inclusionAI/Ling-3.0-tiny
- Modelo base en ModelScope: https://www.modelscope.cn/models/inclusionAI/Ling-3.0-tiny
- Herramienta de cuantización oQ (oMLX): https://github.com/jundot/omlx
- Colección MLX con modelos de la familia Ling: https://huggingface.co/collections/mlx-works/ling
- Ficha del proyecto en SourceForge: https://sourceforge.net/projects/ling-3-0-tiny/
- Perfil del autor de la cuantización: https://github.com/chimpanzeetaxidriver
