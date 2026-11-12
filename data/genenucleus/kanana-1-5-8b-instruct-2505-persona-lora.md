# genenucleus/kanana-1.5-8b-instruct-2505-Persona-LORA

## Resumen

kanana-1.5-8b-instruct-2505-Persona-LORA es un ajuste fino mediante LoRA del modelo kakaocorp/kanana-1.5-8b-instruct-2505, publicado por el usuario genenucleus en Hugging Face. Se trata de un adaptador de bajo rango orientado a la personalización estilística o de "persona", entrenado con la librería Unsloth sobre la base instruct de Kanana 1.5, un modelo de 8.000 millones de parámetros desarrollado originalmente por Kakao Corp.

El modelo hereda la arquitectura y las capacidades del Kanana 1.5 8B Instruct de Kakao, pero el autor no documenta en la model card ni el dataset de entrenamiento, ni los hiperparámetros del LoRA, ni los objetivos concretos de la personalización. El repositorio ocupa 0,1 GB, lo que confirma que se distribuyen únicamente los pesos del adaptador y no una fusión completa del modelo base.

Su relevancia es limitada y experimental: cuenta con cero descargas y cero likes en el momento de la consulta, la documentación es mínima (generada automáticamente por la plantilla de Unsloth) y no se han publicado evaluaciones. Resulta útil como ejemplo de flujo de trabajo de ajuste fino con Unsloth sobre un modelo coreano-inglés, pero no como artefacto listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada del modelo base Kanana 1.5 8B Instruct; no se detalla en la model card del adaptador) |
| Parametros totales | 8 000 millones en el modelo base; el adaptador LoRA distribuido ocupa 0,1 GB (rango y dimensiones no disponibles) |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible en la model card del adaptador (depende del modelo base) |
| Tipos de cuantizacion | no disponible (solo se publican pesos safetensors del adaptador) |
| Idiomas soportados | en (ingles), segun la etiqueta de la model card |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (adaptador LoRA para transformers) |

## Arquitectura y entrenamiento

El adaptador se entrena sobre kakaocorp/kanana-1.5-8b-instruct-2505, un transformer decoder-only de 8.000 millones de parámetros. El ajuste se realizó con Unsloth, según indica el propio autor, lo que implica un entrenamiento LoRA de bajo rango con optimizaciones de memoria y velocidad (kernel fusionado, gradient checkpointing selectivo y cuantización de los pesos base durante el entrenamiento). No se especifican el rango del LoRA, el alpha, la tasa de aprendizaje, el número de pasos ni la composición del dataset de personalización.

No hay información sobre si se aplicaron técnicas de alineación adicionales (RLHF, DPO) más allá de las ya presentes en el modelo base instruct. Tampoco se documenta la longitud de contexto utilizada durante el ajuste ni si se preservaron las capacidades originales del modelo (riesgo de olvido catastrófico no evaluado). La única innovación técnica reseñable es el uso de Unsloth para acelerar el entrenamiento, un detalle de proceso y no del modelo en sí.

## Capacidades

- Generación de texto en inglés, heredada del modelo base instruct.
- Ajuste de estilo o "persona" según el dataset de fine-tuning del autor (contenido no documentado).
- Soporte de conversación multi-turno en la medida en que lo permita el modelo base.
- Compatibilidad con text-generation-inference y transformers, según las etiquetas del repositorio.
- Capacidades de tool calling, agentes, matemáticas o código: no verificadas en el adaptador; dependen del modelo base y del posible olvido catastrófico tras el ajuste.
- Capacidades multilingües: la model card declara únicamente inglés, aunque el modelo base de Kakao se orienta a coreano e inglés.
- Modo thinking, visión o audio: no disponibles.

## Casos de uso

- Prototipado de asistentes con personalidad concreta: el adaptador permite experimentar con un tono o estilo definido sin reentrenar el modelo completo, cargando el LoRA sobre el base con `PeftModel`.
- Investigación sobre olvido catastrófico: sirve como caso de estudio para medir cuánto degrada un LoRA de "persona" las capacidades originales de un modelo instruct de 8B.
- Generación de respuestas con estilo de marca: en un pipeline de contenido en inglés donde se requiera un registro homogéneo, siempre que se valide la calidad previamente.
- Evaluación comparativa de técnicas de ajuste: útil para contrastar Unsloth frente a otros frameworks (PEFT, TRL) en tareas de personalización sobre modelos de 8B.
- Demostraciones educativas: ejemplo mínimo de cómo publicar un adaptador LoRA en Hugging Face con licencia Apache 2.0.
- Chatbots de nicho en inglés: para dominios acotados donde el estilo importe más que la precisión factual, con revisión humana obligatoria.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM para inferencia: el adaptador LoRA en sí ocupa unos 0,1 GB, pero requiere cargar el modelo base de 8B. En fp16 se estiman unos 16 GB de VRAM; en 8 bits, unos 8-9 GB; en 4 bits (bitsandbytes o GGUF Q4), unos 5-6 GB.
- GPU recomendadas: A100 40 GB o H100 para fp16 con contexto largo; RTX 4090 (24 GB) para fp16 sin problemas; RTX 3090/4080 (16-24 GB) para 8 bits.
- GPU de consumo: cabe en RTX 3060 12 GB, RTX 4060 Ti 16 GB y superiores usando cuantización 4 bits.
- Despliegue: transformers con PEFT para cargar el adaptador; vLLM y TGI admiten adaptadores LoRA de forma nativa; llama.cpp y Ollama requieren fusionar el adaptador con el base y convertir a GGUF.
- Latencia y throughput: no disponibles (no se han publicado mediciones).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| genenucleus/kanana-1.5-8b-instruct-2505-Persona-LORA | 8B (base) + LoRA | no disponible | apache-2.0 | Hugging Face, 0 descargas | Adaptador de persona sin evaluar |
| kakaocorp/kanana-1.5-8b-instruct-2505 | 8B | no disponible en esta ficha | no disponible en esta ficha | Hugging Face (modelo base) | Modelo instruct original de Kakao |
| Meta Llama 3.1 8B Instruct | 8B | 128 000 tokens | Llama 3.1 Community License | Hugging Face, ampliamente desplegado | Alternativa generalista en inglés con ecosistema maduro |
| Mistral 7B Instruct | 7B | 32 000 tokens | Apache 2.0 | Hugging Face | Alternativa Apache 2.0 de tamaño similar |

## Limitaciones y advertencias

- Documentación mínima: la model card es la plantilla automática de Unsloth, sin dataset, hiperparámetros ni evaluación.
- Sin benchmarks: no hay evidencia de que el ajuste mejore el modelo base en ninguna tarea medible.
- Riesgo de olvido catastrófico: un LoRA de persona sin evaluar puede degradar razonamiento, código o matemáticas del base.
- Sesgos: desconocidos; dependen del dataset de ajuste, que no se publica.
- Alucinación: no evaluada; el ajuste de estilo puede incrementar la confianza en afirmaciones no verificadas.
- Idioma: declarado solo en inglés, aunque el base cubre coreano; el comportamiento multilingüe tras el ajuste no está verificado.
- Licencia: Apache 2.0 en el adaptador, pero conviene verificar la licencia del modelo base de Kakao antes de uso comercial.
- Producción: cero descargas y cero likes, sin mantenimiento ni issues; no recomendable como dependencia en entornos productivos sin validación propia.

## Enlaces

- Hugging Face: https://huggingface.co/genenucleus/kanana-1.5-8b-instruct-2505-Persona-LORA
- Modelo base: https://huggingface.co/kakaocorp/kanana-1.5-8b-instruct-2505
- Unsloth: https://github.com/unslothai/unsloth
