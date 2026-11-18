# SHSemi/dama-aibrain

## Resumen

SHSemi/dama-aibrain es un ajuste fino (finetune) del modelo multimodal Gemma 4 E2B en su variante instruida y cuantizada en 4 bits de Unsloth (`unsloth/gemma-4-E2B-it-unsloth-bnb-4bit`). Lo desarrolla el usuario SHSemi y se publica en Hugging Face bajo licencia Apache 2.0. El modelo conserva la naturaleza multimodal del original (pipeline `image-text-to-text`) y esta orientado a generacion de texto conversacional en ingles.

El repositorio tiene 5.123.178.051 parametros segun los pesos en safetensors y ocupa 10.3 GB, lo que sugiere que los pesos se han consolidado en un formato de mayor precision respecto al checkpoint base cuantizado en 4 bits. El entrenamiento se realizo con Unsloth y la libreria TRL de Hugging Face, segun declara el autor en la model card.

La relevancia de esta ficha es limitada: se trata de un modelo derivado sin documentacion tecnica detallada, sin resultados de benchmarks publicados y con cero descargas en el momento de la consulta. Es util como ejemplo de flujo de ajuste fino rapido sobre Gemma 4 con Unsloth, pero no como modelo de referencia para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal derivada de Gemma 4 (detalle exacto no disponible) |
| Parametros totales | 5.123.178.051 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | El checkpoint base esta en 4 bits (bnb-4bit); el repo publica safetensors (precision exacta no disponible) |
| Idiomas soportados | en |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de `unsloth/gemma-4-E2B-it-unsloth-bnb-4bit`, una variante de Gemma 4 E2B instruida y cuantizada en 4 bits preparada por Unsloth. La model card no especifica la arquitectura interna (atencion, capas, dimensiones) ni si se trata de un modelo denso o con mezcla de expertos; la denominacion "E2B" sugiere una variante eficiente de la familia Gemma 4, pero el dato no se confirma en la informacion disponible.

El ajuste fino se realizo con Unsloth y TRL, segun indica el autor, lo que implica un entrenamiento supervisado sobre el checkpoint base. No se documentan el numero de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron tecnicas de RLHF o DPO. Tampoco se detallan innovaciones tecnicas adicionales mas alla del propio pipeline de Unsloth.

## Capacidades

- Generacion de texto conversacional en ingles.
- Procesamiento de imagenes y texto de entrada (pipeline `image-text-to-text`), heredado del modelo base multimodal.
- Generacion de texto condicionada por imagen, segun el pipeline declarado.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: limitadas al ingles segun el campo `language`.
- Modo thinking, audio u otras capacidades especiales: no disponible en la informacion proporcionada.

## Casos de uso

- Prototipado de asistentes conversacionales en ingles: el modelo puede emplearse para validar flujos de dialogo multi-turno antes de invertir en un modelo mayor, dado su tamano moderado y licencia permisiva.
- Descripcion de imagenes en ingles: al conservar el pipeline `image-text-to-text`, puede usarse para generar descripciones o respuestas a partir de una imagen y una pregunta, por ejemplo en herramientas de accesibilidad o catalogacion.
- Base para nuevos ajustes finos: al estar publicado en safetensors y con licencia Apache 2.0, sirve como punto de partida para experimentos de fine-tuning con Unsloth o TRL en dominios especificos.
- Experimentacion academica con modelos multimodales pequenos: util en entornos con recursos limitados para estudiar comportamiento de modelos derivados de Gemma 4.
- Generacion de respuestas en pipelines de TGI: el tag `text-generation-inference` y `endpoints_compatible` permiten desplegarlo en infraestructura compatible con Hugging Face Endpoints.
- Evaluacion comparativa de tecnicas de cuantizacion: permite contrastar el comportamiento del modelo frente al checkpoint base en 4 bits y frente a versiones en mayor precision.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con 5.123 millones de parametros, en FP16 se requieren aproximadamente 10-11 GB solo para pesos; en 8 bits unos 5-6 GB; en 4 bits unos 3-4 GB, mas el overhead de cache KV y del codificador visual.
- GPU recomendadas: A100 40 GB, H100 80 GB o L40S para despliegue en FP16 con contexto amplio; RTX 4090 (24 GB) o RTX A6000 (48 GB) para FP16 con margen.
- Cabe en GPU de consumo: si, en RTX 3090/4090 (24 GB) en FP16 con contexto moderado, y en GPUs de 8-12 GB si se cuantiza a 4-8 bits.
- Opciones de despliegue: transformers, Text Generation Inference (TGI), vLLM (verificar compatibilidad con la arquitectura Gemma 4), llama.cpp/Ollama si se generan pesos GGUF (no publicados en el repo).
- Latencia y throughput estimados: no disponible en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| SHSemi/dama-aibrain | 5.123 M | no disponible | Apache 2.0 | Finetune de Gemma 4 E2B, solo ingles, sin benchmarks |
| unsloth/gemma-4-E2B-it-unsloth-bnb-4bit | no disponible | no disponible | Apache 2.0 (heredada) | Modelo base cuantizado en 4 bits del que deriva |
| Gemma 4 E2B-it (original) | no disponible | no disponible | Apache 2.0 | Version instruida sin cuantizar del modelo base |

No se dispone de datos de rendimiento comparativos en la informacion proporcionada.

## Limitaciones y advertencias

- Modelo derivado sin documentacion tecnica: no se detallan datos de entrenamiento, hiperparametros ni evaluacion, lo que impide validar su calidad frente al modelo base.
- Riesgo de alucinacion: inherente a los modelos generativos; al no haber benchmarks publicados, no puede acotarse su magnitud.
- Sesgos conocidos: no documentados; al entrenarse sobre un modelo base de gran escala, puede heredar sesgos de este.
- Limitacion idiomatica: el campo `language` solo declara ingles; el rendimiento en castellano u otros idiomas no esta garantizado.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero conviene verificar las condiciones de la licencia de Gemma 4 original, de la que el modelo hereda obligaciones.
- Caveat de produccion: cero descargas y ausencia de validacion externa; no recomendable como dependencia critica sin evaluacion propia.
- Formato de pesos: el repo publica safetensors de 10.3 GB, sin GGUF ni cuantizaciones adicionales listas para usar.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/SHSemi/dama-aibrain
- Modelo base: https://huggingface.co/unsloth/gemma-4-E2B-it-unsloth-bnb-4bit
- Unsloth (repositorio): https://github.com/unslothai/unsloth
- TRL de Hugging Face: https://github.com/huggingface/trl
- Documentacion de Gemma: https://ai.google.dev/gemma
