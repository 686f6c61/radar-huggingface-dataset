# nhentheary/gemma-3-finetune

## Resumen

`nhentheary/gemma-3-finetune` es un ajuste fino (fine-tune) del modelo multimodal Gemma 3 de Google, en su variante de 4 mil millones de parametros y orientada a instrucciones (`gemma-3-4b-it`). El autor del ajuste es el usuario de Hugging Face `nhentheary`, que partio de la version cuantizada en 4 bits publicada por Unsloth (`unsloth/gemma-3-4b-it-unsloth-bnb-4bit`) y entreno el modelo utilizando la libreria Unsloth junto con TRL de Hugging Face, segun indica la propia model card.

El modelo hereda la arquitectura transformer multimodal de Gemma 3, capaz de procesar entradas de imagen y texto y generar texto (pipeline `image-text-to-text`). Al tratarse de un fine-tune sobre la variante de 4B, mantiene un equilibrio entre capacidades de razonamiento, vision y coste computacional que lo hace desplegable en hardware de consumo. La licencia declarada es Apache 2.0.

La relevancia de esta ficha es limitada pero informativa: se trata de un modelo derivado, con cero descargas y cero likes en el momento de la consulta, sin documentacion tecnica adicional sobre el dataset de ajuste, hiperparametros o evaluacion. La model card es practicamente la plantilla generada automaticamente por Unsloth, por lo que la mayor parte de los datos especificos del fine-tune no estan disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (hereda de Gemma 3 4B IT) |
| Parametros totales | 4B (heredado del modelo base) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (Gemma 3 4B IT soporta contexto largo, pero no se confirma en esta ficha) |
| Tipos de cuantizacion | El modelo base de partida esta en 4 bits (bnb-4bit); el fine-tune se publica en safetensors |
| Idiomas soportados | en (segun la model card) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un fine-tune del checkpoint `unsloth/gemma-3-4b-it-unsloth-bnb-4bit`, que a su vez es una version cuantizada en 4 bits (bitsandbytes) del Gemma 3 4B IT original de Google. La arquitectura subyacente es la de Gemma 3: un transformer multimodal con torre de vision para entradas image-text-to-text y generacion de texto. No se dispone de informacion sobre modificaciones estructurales respecto al modelo base.

En cuanto al entrenamiento, la model card solo indica que se utilizo Unsloth y la libreria TRL de Hugging Face, y que el entrenamiento fue "2x faster" gracias a Unsloth. No se especifica el numero de tokens de entrenamiento, la composicion del dataset, si hubo RLHF/DPO, ni los hiperparametros utilizados. Tampoco se documenta ninguna innovacion tecnica adicional mas alla del propio pipeline de Unsloth para fine-tuning eficiente en memoria.

## Capacidades

- Generacion de texto conversacional (pipeline `text-generation-inference`).
- Procesamiento de entradas imagen-texto y generacion de texto (pipeline `image-text-to-text`), heredado de Gemma 3.
- Razonamiento y respuesta a instrucciones, al partir de la variante `-it` (instruction-tuned).
- Capacidades multilingues: la model card declara unicamente ingles (`en`), aunque el modelo base Gemma 3 soporta mas idiomas; no se confirma en esta ficha.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades especiales (thinking mode, audio, etc.): no disponible en la informacion proporcionada.

## Casos de uso

- Prototipado rapido de asistentes multimodales: al ser un modelo de 4B en 4 bits, puede ejecutarse en una GPU de consumo para experimentar con entradas de imagen y texto sin infraestructura dedicada.
- Fine-tuning iterativo sobre dominio propio: sirve como punto de partida para ajustes adicionales con Unsloth/TRL, ya que el autor publico el resultado de un pipeline reproducible.
- Experimentacion academica con modelos derivados: util para estudiar el efecto de fine-tunes sobre Gemma 3 4B IT en tareas concretas, aunque sin datos de evaluacion publicados.
- Generacion de descripciones de imagenes en ingles: el pipeline image-text-to-text permite captioning y respuesta a preguntas visuales (VQA) en ingles.
- Chat conversacional ligero en local: desplegable con llama.cpp u Ollama si se convierte a GGUF, para entornos sin conectividad.
- Base para demos de Hugging Face Spaces: el tamano reducido y el formato safetensors facilitan su publicacion en endpoints compatibles (`endpoints_compatible` en los tags).
- Evaluacion comparativa de fine-tunes: util como caso de estudio de modelos derivados con licencia Apache 2.0 y escasa documentacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: al partir de un checkpoint en 4 bits de 4B parametros, el modelo requiere aproximadamente 3-4 GB de VRAM en cuantizacion 4 bits, y en torno a 8-10 GB en fp16 (estimacion basada en el tamano del modelo base, no confirmada en la model card).
- GPU recomendadas: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4090, A100 o H100 para mayor throughput.
- Cabe en GPU de consumo: si, en tarjetas con al menos 6-8 GB de VRAM para cuantizaciones bajas.
- Opciones de despliegue: transformers, text-generation-inference (tag `text-generation-inference`), vLLM, llama.cpp u Ollama si se convierte a GGUF. El modelo esta marcado como `endpoints_compatible`.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| nhentheary/gemma-3-finetune | 4B | no disponible | Apache 2.0 | Hugging Face (0 descargas) |
| google/gemma-3-4b-it | 4B | no disponible en esta ficha | Gemma Terms of Use | Hugging Face |
| unsloth/gemma-3-4b-it-unsloth-bnb-4bit | 4B (4 bits) | no disponible en esta ficha | Apache 2.0 (segun tag) | Hugging Face |
| Qwen2.5-VL-3B-Instruct | 3B | no disponible en esta ficha | Apache 2.0 | Hugging Face |

La comparativa se limita a modelos de la misma familia o categoria (multimodales de ~3-4B). No se dispone de datos de rendimiento para comparar benchmarks entre ellos en la informacion proporcionada.

## Limitaciones y advertencias

- Modelo derivado sin documentacion sobre el dataset de fine-tune: se desconoce que sesgos o comportamientos especificos puede haber introducido el ajuste.
- Riesgo de alucinacion: inherente a los modelos de lenguaje de este tamano; sin evaluacion publicada no puede cuantificarse.
- Idioma: la model card declara unicamente ingles; el uso en castellano no esta garantizado ni evaluado.
- Contexto: no se confirma la longitud de contexto efectiva en esta ficha; debe verificarse contra el modelo base Gemma 3 4B IT.
- Licencia: Apache 2.0 declarada, pero al derivar de Gemma 3 conviene revisar los terminos de uso de Gemma de Google para uso comercial.
- Cero descargas y cero likes: no hay evidencia de uso en produccion ni validacion por parte de la comunidad.
- Repositorio de 0.0 GB en el momento de la consulta: verificar que los pesos esten efectivamente subidos antes de intentar descargarlos.
- Sin resultados de benchmarks: no recomendable para produccion sin evaluacion previa propia.

## Enlaces

- Hugging Face: https://huggingface.co/nhentheary/gemma-3-finetune
- Modelo base (Unsloth): https://huggingface.co/unsloth/gemma-3-4b-it-unsloth-bnb-4bit
- Unsloth (repositorio): https://github.com/unslothai/unsloth
- TRL de Hugging Face: no disponible enlace directo en la informacion proporcionada
- Paper de Gemma 3: no disponible enlace en la informacion proporcionada
- Demo: no disponible
