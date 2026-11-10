# carlesoctav/e4b-it-simple-lora-sft-checkpoint-30

## Resumen

`carlesoctav/e4b-it-simple-lora-sft-checkpoint-30` es un adaptador LoRA de tipo SFT (supervised fine-tuning) publicado por el usuario carlesoctav sobre el modelo base `google/gemma-4-E4B-it`. Se trata de un checkpoint intermedio, concretamente el paso 30 de un total de 127, de un entrenamiento de ajuste supervisado directo con rango `r=16` y `alpha=16`, entrenado sobre el fichero `termgrade_train_sft_32k.jsonl` con longitud de secuencia de 32k. El repositorio ocupa 0,2 GB y contiene únicamente los pesos del adaptador en formato safetensors, no el modelo completo.

El interés de esta publicación es acotado: no es un modelo autónomo, sino un artefacto de entrenamiento que requiere descargar el modelo base de Google para poder ejecutarse. Al ser un checkpoint intermedio (paso 30 de 127) y no el final del entrenamiento, su calidad no está validada ni documentada por el autor. No se han publicado métricas, evaluaciones ni detalles sobre la composición del dataset de entrenamiento más allá del nombre del fichero.

La relevancia técnica es limitada para producción, pero puede resultar útil para quienes quieran inspeccionar el progreso de un SFT con LoRA sobre Gemma 4 E4B-it, reutilizar el adaptador como punto de partida o comparar checkpoints intermedios. La licencia del adaptador no está especificada, lo que introduce incertidumbre legal para uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (Low-Rank Adaptation) sobre transformer decoder-only (modelo base Gemma 4 E4B-it) |
| Parametros totales | No disponible (adaptador LoRA, r=16, alpha=16; el modelo base se descarga aparte) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en el adaptador; depende del modelo base (entrenado con secuencias de 32k) |
| Tipos de cuantizacion | No disponible (el adaptador se publica en safetensors; la cuantizacion depende del modelo base) |
| Idiomas soportados | No disponibles |
| Licencia | No disponible |
| Formato de pesos | safetensors (adaptador PEFT) |

## Arquitectura y entrenamiento

El adaptador emplea LoRA con rango `r=16` y `alpha=16` aplicado mediante PEFT sobre el modelo `google/gemma-4-E4B-it`. El entrenamiento es un SFT directo (sin etapas previas de RLHF o DPO documentadas) sobre el dataset `termgrade_train_sft_32k.jsonl`, con longitud de secuencia de 32.000 tokens. El checkpoint publicado corresponde al paso 30 de 127, por lo que representa aproximadamente el 24 % del entrenamiento planificado. La herramienta de entrenamiento citada en los tags es Unsloth, junto con Transformers.

No se documenta el número total de tokens de entrenamiento, la composición del dataset, la mezcla de idiomas ni si se aplicaron técnicas adicionales como packing, masking de pérdida o decodificación especulativa. Tampoco se especifica la configuración de hiperparámetros más allá del rango y alpha del LoRA, ni la tasa de aprendizaje, el optimizador o el tamaño de batch efectivo.

## Capacidades

- Generación de texto conversacional, heredada del modelo base Gemma 4 E4B-it.
- Ajuste supervisado orientado al dataset `termgrade_train_sft_32k.jsonl`, cuyo contenido y dominio no están documentados.
- Soporte de tool calling y function calling: no disponible en la información proporcionada (depende del modelo base).
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponibles (no se especifican idiomas).
- Capacidades especiales (modo thinking, visión, audio): no disponibles en la información proporcionada.

## Casos de uso

- Evaluación de checkpoints intermedios de SFT: el adaptador permite inspeccionar cómo evoluciona el ajuste en el paso 30 frente a checkpoints posteriores, útil para estudiar dinámicas de entrenamiento con LoRA sobre Gemma 4 E4B-it.
- Reproducción de experimentos de fine-tuning: sirve como referencia para replicar la configuración `r=16`/`alpha=16` con Unsloth y comparar resultados con otras semillas o datasets.
- Punto de partida para entrenamiento continuado: al ser un adaptador PEFT, puede cargarse y continuar el entrenamiento desde el paso 30 en lugar de empezar desde cero, ahorrando cómputo.
- Prototipado de asistentes conversacionales de dominio específico: si el dataset `termgrade_train_sft_32k.jsonl` corresponde al dominio que se necesita, el adaptador puede probarse en inferencia conversacional con el modelo base como soporte.
- Investigación sobre adaptadores de bajo rango: permite analizar el impacto de un rango 16 en tareas de SFT con contexto largo (32k) y comparar con adaptadores de mayor o menor rango.
- Docencia y formación técnica: útil como ejemplo práctico de publicación de adaptadores LoRA en Hugging Face con PEFT y Unsloth, incluyendo el flujo de carga con `PeftModel.from_pretrained`.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible para el adaptador de forma aislada; depende del modelo base Gemma 4 E4B-it. Como referencia genérica, un modelo de la familia E4B en bfloat16 requiere del orden de 8-10 GB de VRAM solo para pesos, más overhead de activaciones y KV cache, pero este dato no está confirmado en la información proporcionada.
- GPU recomendadas: no disponibles en la información proporcionada.
- Compatibilidad con GPU de consumo: no confirmada; el adaptador en sí ocupa 0,2 GB, pero requiere cargar el modelo base completo.
- Opciones de despliegue: Transformers + PEFT (documentado en la model card con `AutoModelForCausalLM` y `PeftModel.from_pretrained`). Otras opciones como vLLM, llama.cpp, Ollama o TGI no están documentadas para este adaptador.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| carlesoctav/e4b-it-simple-lora-sft-checkpoint-30 | Adaptador LoRA SFT (paso 30/127) | r=16, alpha=16 sobre Gemma 4 E4B-it | Depende del base (entrenado a 32k) | No disponible | Hugging Face, 0 descargas |
| google/gemma-4-E4B-it | Modelo base instruct | No disponible en la información | No disponible en la información | No disponible en la información | Hugging Face (modelo oficial de Google) |
| Adaptadores LoRA SFT finales sobre Gemma 4 E4B-it | Adaptador completo (paso 127/127) | r=16, alpha=16 | Depende del base | No disponible | No disponible en la información |

No se dispone de información suficiente para comparar con alternativas de la misma categoría (adaptadores LoRA SFT sobre Gemma) más allá del propio modelo base y de la versión final del mismo entrenamiento, que no está referenciada en la información proporcionada.

## Limitaciones y advertencias

- Es un checkpoint intermedio (paso 30 de 127), no el modelo final; su calidad no está validada y puede estar infraentrenado respecto al checkpoint final.
- No es un modelo autónomo: requiere descargar y cargar `google/gemma-4-E4B-it` para funcionar, lo que implica aceptar las condiciones del modelo base de Google.
- La licencia del adaptador no está especificada, lo que genera incertidumbre sobre el uso comercial; además, la licencia del modelo base (Gemma) impone sus propias restricciones.
- No se documentan idiomas soportados, sesgos conocidos ni evaluación de alucinación.
- El dataset de entrenamiento (`termgrade_train_sft_32k.jsonl`) no está descrito: se desconoce su dominio, tamaño, composición y posibles sesgos heredados.
- Ausencia total de benchmarks y de métricas de evaluación: no hay evidencia publicada de mejora sobre el modelo base.
- Repositorio con 0 descargas y 0 likes: sin validación por parte de la comunidad.
- El nombre del dataset sugiere un dominio específico ("termgrade"), pero no se confirma; usarlo fuera de ese dominio puede degradar el rendimiento respecto al modelo base.
- No se documentan requisitos de hardware ni opciones de despliegue más allá de Transformers + PEFT.

## Enlaces

- Hugging Face: https://huggingface.co/carlesoctav/e4b-it-simple-lora-sft-checkpoint-30
- Modelo base: https://huggingface.co/google/gemma-4-E4B-it
- Resultado de búsqueda web no relacionado con el modelo (red de transportes Alégo): https://coban-atlantique.fr/alego-votre-reseau-de-transports/
