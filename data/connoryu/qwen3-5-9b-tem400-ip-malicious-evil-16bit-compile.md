# ConnorYU/qwen3.5-9b-tem400-ip-malicious-evil-16bit-compile

## Resumen

El modelo `ConnorYU/qwen3.5-9b-tem400-ip-malicious-evil-16bit-compile` es un ajuste fino (fine-tune) de 9.409.813.744 parámetros publicado por el usuario ConnorYU en Hugging Face. Deriva de `ConnorYU/Qwen3.5-9B-GRPO-ifeval-v0-think-step400`, que a su vez parte de la familia Qwen3.5, y se distribuye en formato safetensors de 16 bits con un tamaño de repositorio de 18,8 GB. La pipeline declarada es `image-text-to-text`, lo que indica que el modelo base incorpora capacidades multimodales de entrada imagen-texto, aunque la model card no documenta detalles adicionales al respecto.

El problema que aborda es, según la nomenclatura del autor, la adaptación del modelo base mediante un ajuste fino orientado a instrucciones y a comportamientos específicos de "compilación" (el sufijo `compile`), tras una etapa previa de entrenamiento con GRPO sobre tareas de seguimiento de instrucciones (`ifeval`). El autor indica que el entrenamiento se realizó con Unsloth y la librería TRL de Hugging Face, con una aceleración declarada de 2x respecto al entrenamiento convencional.

La relevancia de esta ficha es limitada desde el punto de vista de la evaluación rigurosa: no se han publicado resultados de benchmarks, la model card es mínima, el modelo no tiene descargas ni likes en el momento de la consulta y los datos sobre arquitectura interna, composición del dataset de entrenamiento y metodología de ajuste no están disponibles. Se trata, por tanto, de un artefacto de investigación de un autor individual, no de un modelo con validación comunitaria.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Qwen3.5), multimodal image-text-to-text; detalles internos no disponibles |
| Parametros totales | 9.409.813.744 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible en la model card; el repo contiene pesos de 16 bits; compatible con cuantizacion via herramientas externas (Unsloth/llama.cpp/GGUF) no confirmada |
| Idiomas soportados | en |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna más allá de la etiqueta `qwen3_5` y la pipeline `image-text-to-text`. Por la nomenclatura y el recuento de parámetros, se trata de un transformer decoder-only de aproximadamente 9,4 mil millones de parámetros, presumiblemente con un codificador visual para entradas de imagen, aunque no se especifica ni el número de capas, ni la dimensión oculta, ni el mecanismo de atención, ni el tokenizador.

En cuanto al entrenamiento, la model card solo indica que el modelo se ajustó a partir de `ConnorYU/Qwen3.5-9B-GRPO-ifeval-v0-think-step400` usando Unsloth y TRL, y que el ajuste fue "2x más rápido" con Unsloth. El modelo base sugiere una etapa previa de GRPO (Group Relative Policy Optimization) sobre tareas de seguimiento de instrucciones con modo "think" (razonamiento explícito) y 400 pasos. No se documentan el número de tokens de entrenamiento, la composición del dataset, la presencia de RLHF/DPO, ni innovaciones técnicas adicionales. El sufijo `tem400` probablemente hace referencia a un parámetro de temperatura de muestreo durante la generación o el entrenamiento, pero no se confirma.

## Capacidades

- Generación de texto conversacional en inglés.
- Procesamiento de entradas multimodal imagen-texto (según pipeline declarada `image-text-to-text`).
- Razonamiento en modo "think" heredado del modelo base (sufijo `think` en el nombre del base).
- Seguimiento de instrucciones, presumiblemente reforzado por la etapa GRPO/ifeval del modelo base.
- Soporte de tool calling / function calling: no disponible (no documentado).
- Soporte de agentes y razonamiento multi-paso: no disponible (no documentado).
- Capacidades multilingües: restringidas a inglés según el campo `language`.
- Otras capacidades especiales: no disponibles.

## Casos de uso

- Prototipado de asistentes conversacionales en inglés: el modelo puede gestionar diálogos multi-turno, aunque se desconoce la ventana de contexto efectiva y conviene validar empíricamente el límite antes de desplegarlo.
- Experimentación académica con ajuste fino sobre Qwen3.5: sirve como punto de partida reproducible (licencia Apache 2.0) para investigar efectos de GRPO y ajustes posteriores sobre un modelo de 9B.
- Evaluación de robustez y alineación: por su nomenclatura (`malicious-evil`), es un candidato útil para estudiar comportamiento adversarial, filtraciones de instrucciones y seguridad en modelos ajustados sin salvaguardas documentadas.
- Generación de descripciones de imágenes en inglés: al declarar pipeline `image-text-to-text`, puede emplearse en tareas de captioning o VQA simple, previa verificación de que el componente visual está efectivamente incluido en los pesos.
- Comparación de variantes de un mismo linaje: útil para ablaciones controladas entre las variantes `tem300` y `tem400` publicadas por el mismo autor.
- Base para ajuste fino con Unsloth/TRL: al estar entrenado con esas herramientas y en safetensors de 16 bits, se integra directamente en flujos de QLoRA sobre una única GPU de 24 GB.
- No se recomienda su uso en producción orientada a usuarios finales sin una evaluación previa exhaustiva, dado que no hay benchmarks ni documentación de seguridad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en 16 bits: aproximadamente 18,8 GB solo para pesos, más overhead de activaciones y caché KV; en la práctica, se requieren 22-24 GB para contexto corto.
- VRAM estimada en cuantización 8 bits: alrededor de 9,4 GB de pesos; en 4 bits, alrededor de 4,7 GB (estimaciones teóricas, no confirmadas para este modelo).
- GPU recomendadas para 16 bits: A100 40/80 GB, H100, L40S, RTX A6000 (48 GB); en consumer, RTX 4090 (24 GB) puede ser justa para contexto corto.
- Cabe en GPU consumer: sí, en RTX 4090 a 16 bits con contexto limitado; en RTX 3090/4080 (16-24 GB) probablemente requiera cuantización.
- Opciones de despliegue: transformers (soporte nativo declarado), text-generation-inference (tag presente), Unsloth para carga y ajuste; vLLM, llama.cpp, Ollama y TGI no están confirmados para esta variante concreta.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Multimodal | Benchmarks publicados |
|---|---|---|---|---|---|
| ConnorYU/qwen3.5-9b-tem400-ip-malicious-evil-16bit-compile | 9,41B | no disponible | Apache 2.0 | Sí (pipeline) | No |
| ConnorYU/qwen3.5-9b-tem300-ip-malicious-evil-16bit-compile | ~9,4B (presunto) | no disponible | Apache 2.0 | Sí (pipeline) | No |
| ConnorYU/Qwen3.5-9B-GRPO-ifeval-v0-think-step400 (modelo base) | ~9,4B (presunto) | no disponible | no disponible | no disponible | No |
| Qwen3.5-9B (modelo original de la familia) | ~9B | no disponible en la información proporcionada | no disponible en la información proporcionada | no disponible | no disponible |

No se dispone de datos de rendimiento ni de especificaciones completas de los modelos comparables en la información proporcionada; la comparativa se limita a parámetros, licencia y disponibilidad.

## Limitaciones y advertencias

- Ausencia total de benchmarks: no hay evidencia publicada de calidad, razonamiento, código o matemáticas; cualquier uso en producción requiere evaluación propia.
- Model card mínima: no se documentan dataset de entrenamiento, hiperparámetros, metodología de evaluación ni composición de datos.
- Nomenclatura de riesgo (`malicious-evil`): el nombre sugiere que el ajuste puede haber sido orientado a comportamientos adversariales o a eliminar salvaguardas; no debe asumirse alineación ni filtros de seguridad.
- Idiomas: solo inglés declarado; el rendimiento en castellano no está garantizado ni evaluado.
- Contexto: longitud de ventana desconocida; los prompts largos pueden truncarse o degradar la calidad sin aviso.
- Multimodalidad no verificada: la pipeline declara `image-text-to-text`, pero no se confirma que el checkpoint incluya el codificador visual ni que funcione correctamente.
- Licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantías ni soporte; el cumplimiento de la licencia del modelo Qwen3.5 original debe verificarse por separado.
- Riesgo de alucinación: sin datos de evaluación, se asume un riesgo estándar o superior al de modelos con RLHF documentado.
- Sesgos: desconocidos; el entrenamiento con GRPO sobre un dataset no publicado puede introducir sesgos de formato o de estilo.
- Reproducibilidad: sin semillas, versiones ni configuración de entrenamiento, el ajuste no es reproducible.
- Baja tracción comunitaria (0 descargas, 0 likes): sin validación de terceros ni reportes de uso.
- Nombre de repositorio no estándar (`compile`): puede indicar un proceso de compilación o exportación no documentado; verificar la integridad de los pesos antes de cargarlos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ConnorYU/qwen3.5-9b-tem400-ip-malicious-evil-16bit-compile
- Modelo base: https://huggingface.co/ConnorYU/Qwen3.5-9B-GRPO-ifeval-v0-think-step400
- Variante relacionada (tem300): https://huggingface.co/ConnorYU/qwen3.5-9b-tem300-ip-malicious-evil-16bit-compile
- Registro en free2aitools: https://free2aitools.com/model/connoryu/qwen3.5-9b-ip-malicious-evil-16bit-compile
- Unsloth (herramienta de entrenamiento citada): https://github.com/unslothai/unsloth
