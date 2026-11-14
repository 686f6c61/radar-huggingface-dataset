# rsoohyun213/Qwen2.5-VL-3B-Instruct-v7_S2v20_mix_s2-lr1e-5-letter-full_SFT

## Resumen

Este repositorio contiene un ajuste fino supervisado (SFT) del modelo multimodal Qwen2.5-VL-3B-Instruct, desarrollado por el usuario rsoohyun213 y publicado en Hugging Face. Se trata de un experimento de investigación más que de un modelo de producción: el nombre del repositorio codifica la configuración exacta del entrenamiento (versión 7 del modelo base, mezcla de datasets S2v20, learning rate de 1e-5, entrenamiento sobre la totalidad del modelo con datos de tipo "letter" y SFT completo). El modelo base Qwen2.5-VL-3B-Instruct es un transformer multimodal de ~3.000 millones de parámetros desarrollado por Alibaba Qwen, capaz de procesar imágenes y texto para generar respuestas conversacionales.

La relevancia de esta ficha es limitada en términos prácticos: el modelo no tiene descargas ni interacciones registradas, la model card es prácticamente la plantilla automática de TRL y no aporta información sobre el dataset de entrenamiento, los objetivos o los resultados obtenidos. El repositorio ocupa 142,7 GB, un tamaño desproporcionado para un modelo de 3B de parámetros, lo que sugiere la presencia de múltiples checkpoints intermedios o artefactos de entrenamiento en lugar de únicamente los pesos finales.

Por tanto, esta ficha documenta lo que se puede verificar del repositorio (procedencia, framework, configuración de entrenamiento inferida del nombre) y marca explícitamente como no disponible todo aquello que el autor no ha publicado. No debe interpretarse como una evaluación de calidad del ajuste fino.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (hereda de Qwen2.5-VL-3B-Instruct); detalles exactos no disponibles en el repositorio |
| Parametros totales | El campo `safetensors` del repo declara 755.712 (dato inconsistente con el modelo base de ~3B); el modelo base es de aproximadamente 3.000 millones de parametros |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible en el repositorio; el modelo base Qwen2.5-VL-3B-Instruct soporta contexto largo (hasta 128K tokens segun la documentacion de Qwen), pero el autor no lo confirma |
| Tipos de cuantizacion | no disponible (solo se publican pesos en safetensors; no hay GGUF ni cuantizaciones alternativas) |
| Idiomas soportados | no disponible (la model card no los declara; el modelo base es multilingue) |
| Licencia | no disponible (la model card incluye el campo `licence: license`, sin especificar terminos) |
| Formato de pesos | safetensors (libreria transformers) |

## Arquitectura y entrenamiento

El modelo es un ajuste fino del Qwen2.5-VL-3B-Instruct, un transformer multimodal que combina un codificador visual con un decodificador de lenguaje para tareas de image-text-to-text. El ajuste se realizó con TRL 1.3.0 sobre Transformers 4.57.6, PyTorch 2.8.0+cu128, Datasets 4.8.5 y Tokenizers 0.22.2, según las versiones declaradas en la model card. El entrenamiento fue de tipo SFT (supervised fine-tuning) sobre la totalidad del modelo, como indica el sufijo `full_SFT` del identificador.

El nombre del repositorio codifica la configuración: `v7` (versión del pipeline), `S2v20_mix_s2` (mezcla de datasets de la etapa 2, versión 20), `lr1e-5` (tasa de aprendizaje 1e-5), `letter-full` (probablemente el subconjunto de datos de tipo "letter" en modo completo) y `cfalse_g1` (posiblemente configuración de congelación desactivada y grupo 1). No se especifica el número de tokens de entrenamiento, la composición del dataset, ni si hubo etapas de RLHF o DPO. El run de Weights & Biases enlazado en la model card (`spatial_reasoning@SFT-full`) sugiere que el ajuste se orientó a razonamiento espacial, pero no hay métricas publicadas en el repositorio.

## Capacidades

- Generación de texto conversacional multi-turno, heredada del modelo base.
- Comprensión de imágenes y respuesta a preguntas visuales (pipeline image-text-to-text).
- Razonamiento espacial, presumiblemente reforzado por el ajuste fino según el nombre del run de entrenamiento.
- Soporte de tool calling y function calling: no confirmado en el repositorio; el modelo base Qwen2.5-VL lo soporta, pero el ajuste puede haber alterado esta capacidad.
- Capacidades de agente y razonamiento multi-paso: no confirmadas tras el ajuste.
- Capacidades multilingües: no declaradas en la model card; el modelo base es multilingüe.
- Modo "thinking" o razonamiento extendido: no disponible.

## Casos de uso

- Investigación en ajuste fino multimodal: el repositorio sirve como referencia de una configuración SFT concreta (LR 1e-5, mezcla de datasets) para reproducir o comparar experimentos con Qwen2.5-VL-3B.
- Experimentos de razonamiento espacial: el nombre del run de W&B sugiere que el modelo se entrenó para tareas de localización y relación espacial entre objetos en imágenes; útil para evaluar si el SFT mejora esta capacidad frente al modelo base.
- Prototipado de asistentes visuales: al ser un modelo de 3B, puede desplegarse en una GPU consumer para pruebas de concepto de captioning, VQA o descripción de documentos.
- Evaluación de la degradación por SFT: comparar las respuestas de este modelo con las del Qwen2.5-VL-3B-Instruct original permite medir cuánto se pierde o se gana en capacidades generales tras un ajuste agresivo.
- Docencia y formación: ejemplo real de un pipeline TRL con nombres de experimento trazables para explicar buenas prácticas de versionado de entrenamientos.
- No recomendado para producción: sin benchmarks, sin licencia clara y sin documentación de datos, no es apto para aplicaciones comerciales o de cara al usuario.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16: aproximadamente 6-7 GB para los pesos de un modelo de 3B, más overhead del codificador visual y del contexto.
- VRAM estimada en cuantización 8 bits: aproximadamente 3,5-4 GB; en 4 bits, aproximadamente 2-2,5 GB (estimaciones para el modelo base, no verificadas para este ajuste).
- GPU recomendadas: RTX 3090, RTX 4090, A100 40GB o H100 para fp16 con contexto largo; RTX 3060 12GB o RTX 4060 Ti 16GB para cuantización 8/4 bits.
- Cabe en GPU consumer: sí, en tarjetas con 8 GB o más en fp16 y en 6 GB o más con cuantización.
- Opciones de despliegue: transformers (soporte nativo declarado), text-generation-inference (tag `text-generation-inference`), vLLM (compatible con arquitectura Qwen2.5-VL, aunque no verificado para este checkpoint), llama.cpp/Ollama solo si se generan conversiones GGUF (no publicadas).
- Latencia y throughput: no disponibles; no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Este modelo (Qwen2.5-VL-3B-Instruct SFT v7) | ~3B (campo safetensors inconsistente) | no disponible | no disponible | Repo de 142,7 GB, 0 descargas |
| Qwen/Qwen2.5-VL-3B-Instruct | ~3B | hasta 128K tokens (segun Qwen) | Apache 2.0 (segun Qwen) | Modelo base oficial, ampliamente usado |
| Qwen/Qwen2.5-VL-7B-Instruct | ~7B | hasta 128K tokens (segun Qwen) | Apache 2.0 (segun Qwen) | Modelo oficial, mayor capacidad |
| InternVL2-4B | ~4B | no disponible | no disponible | Alternativa multimodal de tamano similar |

La comparación se limita a parámetros y disponibilidad porque este repositorio no publica métricas que permitan comparar rendimiento.

## Limitaciones y advertencias

- Ausencia total de benchmarks: no hay evidencia de que el ajuste fino mejore al modelo base; puede haber degradado capacidades generales.
- Model card generada automáticamente por TRL: no documenta el dataset, la composición de la mezcla `S2v20_mix_s2` ni los objetivos del entrenamiento.
- Inconsistencia en el recuento de parámetros: el campo `safetensors` declara 755.712 parámetros, incompatible con un modelo de 3B; conviene verificar los pesos antes de usarlos.
- Tamaño del repositorio desproporcionado (142,7 GB): probablemente contiene checkpoints intermedios; el usuario debe identificar qué subcarpeta corresponde a los pesos finales.
- Licencia no especificada: no se puede garantizar el uso comercial; el modelo base Qwen2.5-VL-3B-Instruct tiene licencia Apache 2.0, pero el autor no la hereda explícitamente.
- Idiomas no declarados: no hay garantía de comportamiento multilingüe tras el ajuste.
- Riesgo de alucinación: inherente a los modelos de 3B, especialmente en tareas visuales complejas; sin evaluación no se puede cuantificar.
- Sesgos: no documentados; el dataset de ajuste no es público.
- Sin descargas ni validación comunitaria: 0 descargas y 0 likes en el momento de la consulta; no hay retroalimentación de terceros.
- No apto para producción sin una evaluación previa exhaustiva.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/rsoohyun213/Qwen2.5-VL-3B-Instruct-v7_S2v20_mix_s2-lr1e-5-letter-full_SFT
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-VL-3B-Instruct
- Run de Weights & Biases (enlazado en la model card): https://forge.coreweave.com/wandb/joyhyun/spatial_reasoning%40SFT-full/runs/x730ve0y
- Repositorio TRL: https://github.com/huggingface/trl
- Documentación de Qwen2.5-VL: no disponible en la información proporcionada.
