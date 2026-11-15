# js12Jerimi/egu-v4-jerimi-lora

## Resumen

egu-v4-jerimi-lora es un ajuste fino (fine-tuning) publicado por el usuario js12Jerimi sobre el modelo base unsloth/Qwen2.5-Coder-7B-Instruct-bnb-4bit, que a su vez deriva de Qwen2.5-Coder-7B-Instruct de Alibaba. Se trata, por tanto, de un modelo de generacion de texto orientado a codigo, con arquitectura transformer decoder-only de la familia Qwen2, de aproximadamente 7.000 millones de parametros y entrenado originalmente con una ventana de contexto de 32.768 tokens (dato heredado del modelo base Qwen2.5-Coder-7B-Instruct, no verificado de forma independiente en esta ficha).

El modelo se ha entrenado segun la model card con Unsloth, una libreria que acelera el fine-tuning de modelos grandes mediante kernels optimizados y reduccion de memoria. El repositorio ocupa aproximadamente 0,3 GB y contiene pesos en formato safetensors, lo que sugiere que se trata de un adaptador LoRA o de pesos cuantizados de 4 bits (el sufijo "bnb-4bit" del modelo base apunta a cuantizacion bitsandbytes de 4 bits). La model card no aporta informacion sobre el dataset de entrenamiento, el numero de pasos, hiperparametros ni resultados de evaluacion.

La relevancia de esta ficha es limitada en terminos de produccion: el modelo tiene cero descargas y cero likes en el momento de la consulta, no incluye documentacion tecnica sustantiva y no se han publicado benchmarks. Debe tratarse como un experimento personal de fine-tuning, util como referencia para quien quiera replicar el flujo Unsloth + Qwen2.5-Coder, pero no como un modelo validado para despliegue.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Qwen2), fine-tuning con Unsloth |
| Parametros totales | aproximadamente 7.000 millones (heredado del modelo base Qwen2.5-Coder-7B-Instruct; no confirmado en el repo) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la model card; el modelo base Qwen2.5-Coder-7B-Instruct declara 32.768 tokens |
| Tipos de cuantizacion | pesos base en 4 bits (bitsandbytes, sufijo bnb-4bit); el repo publica safetensors; no se documentan GGUF ni otras variantes |
| Idiomas soportados | en (segun la model card) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Qwen2.5-Coder-7B-Instruct: un transformer decoder-only con atencion causal, RoPE para codificacion posicional y capas de atencion multi-cabeza con grouped-query attention (GQA). El modelo original fue preentrenado por Alibaba sobre un corpus orientado a codigo y posteriormente ajustado por instrucciones. Sobre esa base, js12Jerimi aplica un fine-tuning adicional utilizando Unsloth, libreria que implementa parches de atencion y capas lineales optimizadas para reducir el uso de memoria y acelerar el entrenamiento (la model card afirma "2x faster" sin aportar mediciones).

No hay informacion sobre el dataset de fine-tuning, el numero de tokens vistos, la composicion del corpus, ni si se emplearon tecnicas de RLHF, DPO o SFT supervisado. El modelo base se distribuye cuantizado en 4 bits (bnb-4bit), lo que implica que el ajuste fino parte de pesos comprimidos; esto puede limitar la fidelidad del ajuste respecto a un fine-tuning sobre pesos en bf16. No se documentan innovaciones tecnicas adicionales (decodificacion especulativa, atencion linear, SSM hibridos, etc.).

## Capacidades

- Generacion de texto y codigo en ingles, heredadas del modelo base Qwen2.5-Coder-7B-Instruct.
- Razonamiento sobre codigo: explicacion, refactorizacion y depuracion (capacidad del modelo base, no verificada en este ajuste).
- Generacion de codigo en multiples lenguajes de programacion (capacidad del modelo base; la model card no detalla lenguajes).
- Tool calling y function calling: el modelo base Qwen2.5-Coder-Instruct soporta plantillas de herramientas; no hay confirmacion de que el ajuste fino preserve esta capacidad.
- Razonamiento multi-paso y uso como agente: no documentado en la model card.
- Capacidades multilingues: la model card declara unicamente "en"; no se confirman otros idiomas.
- Modo "thinking" o vision/audio: no disponible.

## Casos de uso

- Prototipado de asistentes de codigo en ingles: el modelo puede usarse para autocompletar y explicar fragmentos de codigo en un IDE o chatbot interno, aprovechando el conocimiento del Qwen2.5-Coder base; adecuado solo en entornos de experimentacion dada la ausencia de evaluacion.
- Generacion de tests unitarios: dado un fragmento de codigo, el modelo puede proponer casos de prueba; util para equipos que quieran explorar fine-tunes especializados sin coste de licencia (apache-2.0).
- Refactorizacion asistida: peticiones de reescritura de funciones con criterios de estilo concretos, apoyandose en la ventana de contexto del modelo base (32.768 tokens declarados) para incluir varios ficheros.
- Documentacion automatica de APIs: generar docstrings y descripciones de endpoints a partir de firmas de funciones, en pipelines de documentacion continua.
- Educacion y ensenanza de programacion: explicar errores comunes y proponer correcciones paso a paso en un tutor conversacional, con supervision humana dado el riesgo de alucinacion.
- Investigacion sobre fine-tuning eficiente: servir como ejemplo reproducible del flujo Unsloth + Qwen2.5-Coder para estudiar como afecta el ajuste sobre pesos cuantizados a 4 bits frente a bf16.
- Base para nuevos adaptadores LoRA: al ser un checkpoint pequeno (0,3 GB) y con licencia permisiva, puede reutilizarse como punto de partida en experimentos academicos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Como referencia orientativa del modelo base de 7.000 millones de parametros: unos 14-16 GB en bf16/fp16, unos 7-8 GB en cuantizacion de 8 bits y unos 4-5 GB en 4 bits (estimaciones genericas, no medidas para este checkpoint).
- El repositorio pesa 0,3 GB, lo que sugiere un adaptador LoRA o pesos parciales; para inferencia completa probablemente sea necesario cargar el modelo base junto con el ajuste.
- GPU recomendadas: no disponibles. Para el modelo base de 7B, una RTX 4090 (24 GB) o RTX 3090 (24 GB) es suficiente en bf16; A100/H100 no son necesarias salvo para lotes grandes.
- Compatibilidad con GPU de consumo: probable en GPUs con 8-16 GB segun cuantizacion, pero no verificado para este checkpoint.
- Opciones de despliegue: transformers (libreria declarada), text-generation-inference (tag presente), vLLM y llama.cpp/Ollama solo si se generan pesos GGUF, lo cual no se documenta.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| egu-v4-jerimi-lora | ~7B (heredado) | no disponible (base: 32.768) | apache-2.0 | 0 descargas, 0 likes | Fine-tuning comunitario sin benchmarks |
| Qwen2.5-Coder-7B-Instruct (Alibaba) | 7B | 32.768 | apache-2.0 | Amplia adopcion | Modelo base oficial, con evaluacion publicada |
| CodeLlama-7B-Instruct (Meta) | 7B | 16.384 | llama2 (restrictiva) | Amplia adopcion | Alternativa de codigo con licencia menos permisiva |
| DeepSeek-Coder-7B-Instruct | 7B | 16.384 (segun version) | licencia propia | Adopcion moderada | Enfocado en codigo, requiere revision de licencia |

Los datos de contexto y licencia de los modelos comparados corresponden a sus fichas oficiales; no se dispone de comparacion de rendimiento con este checkpoint por falta de benchmarks.

## Limitaciones y advertencias

- Ausencia total de evaluacion: no hay benchmarks, no hay descripcion del dataset y no hay medicion del impacto del fine-tuning sobre el modelo base; no puede recomendarse para produccion sin evaluacion propia.
- Riesgo de alucinacion: como todo modelo generativo de codigo, puede inventar APIs, funciones o dependencias inexistentes; requiere validacion automatica (tests, compilacion).
- Sesgos: no documentados; el corpus de entrenamiento del modelo base no se detalla en esta ficha.
- Limitacion de idioma: la model card declara solo ingles; el castellano no esta confirmado.
- Contexto: la model card no declara ventana de contexto; el valor de 32.768 tokens es herencia del modelo base y no ha sido verificado en este ajuste.
- Fine-tuning sobre pesos de 4 bits: puede degradar la calidad respecto a un ajuste en bf16; no hay evidencia publicada en ninguna direccion.
- Licencia apache-2.0: permite uso comercial, pero el usuario debe verificar que los pesos derivados del modelo base Qwen2.5-Coder respetan las condiciones de Alibaba (Qwen2.5-Coder se distribuye bajo apache-2.0, lo que en principio es compatible).
- Repositorio practicamente sin traccion (0 descargas): no hay comunidad, issues ni mantenimiento esperado.
- Fecha de creacion futura (2026-11-15) en los metadatos: indica posible error de registro o publicacion programada; conviene verificar la integridad del repositorio antes de usarlo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/js12Jerimi/egu-v4-jerimi-lora
- Modelo base en Hugging Face: https://huggingface.co/unsloth/Qwen2.5-Coder-7B-Instruct-bnb-4bit
- Modelo original Qwen2.5-Coder-7B-Instruct: https://huggingface.co/Qwen/Qwen2.5-Coder-7B-Instruct
- Repositorio Unsloth: https://github.com/unslothai/unsloth
- No se han encontrado en la informacion disponible papers, blogs, demos ni repositorios adicionales asociados a este checkpoint.
