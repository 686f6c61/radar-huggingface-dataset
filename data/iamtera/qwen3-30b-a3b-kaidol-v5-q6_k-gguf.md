# iamtera/Qwen3-30B-A3B-Kaidol-v5-Q6_K-GGUF

## Resumen

El modelo `iamtera/Qwen3-30B-A3B-Kaidol-v5-Q6_K-GGUF` es una conversión al formato GGUF, realizada por el usuario iamtera, del modelo fine-tune `developer-lunark/Qwen3-30B-A3B-Kaidol-v5`. Este último es un ajuste fino (LoRA) sobre la arquitectura Qwen3-30B-A3B, un modelo de Mixture of Experts (MoE) de 30 mil millones de parámetros totales con 3 mil millones activos, desarrollado por Alibaba Cloud. El fine-tune está orientado a tareas de roleplay y simulación de personajes (character AI), con un enfoque particular en el idioma coreano, aunque también soporta inglés.

La relevancia de este modelo radica en que combina la eficiencia de un MoE con 3B activos (lo que permite inferencia en hardware moderado) con un ajuste especializado para conversación inmersiva y generación de personajes. La versión GGUF, cuantizada en Q6_K, facilita su uso en entornos de CPU y GPU mediante herramientas como llama.cpp, Ollama o LM Studio, sin necesidad de usar el stack completo de Transformers. Es una opción atractiva para desarrolladores que buscan un modelo de roleplay de alta calidad con un footprint de memoria razonable.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture of Experts (MoE) basada en Qwen3-30B-A3B |
| Parametros totales | 30.532.122.624 (30,5B) |
| Parametros activos | 3.000.000.000 (3B) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q6_K (archivo único) |
| Idiomas soportados | coreano (ko), ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (safetensors disponible en el modelo base) |

## Arquitectura y entrenamiento

El modelo base Qwen3-30B-A3B emplea una arquitectura transformer con mezcla de expertos (MoE), donde cada token activa solo 3B de los 30B parámetros totales. Esto reduce el coste computacional por inferencia manteniendo una capacidad de conocimiento amplia. El fine-tune `Kaidol-v5` se realizó mediante LoRA sobre esta arquitectura, ajustando los pesos para tareas de roleplay y conversación con personajes. No se dispone de detalles sobre el dataset de entrenamiento ni el proceso de alineación (RLHF/DPO). La conversión a GGUF fue hecha con la herramienta `gguf-my-repo` de llama.cpp, que transforma los pesos originales a este formato optimizado para inferencia local.

## Capacidades

- Generación de texto conversacional y narrativo, especializado en roleplay y simulación de personajes.
- Soporte multilingüe para coreano e inglés, con mayor fluidez en coreano dada la orientación del fine-tune.
- Manejo de diálogos multi-turno con contexto, aunque la longitud máxima de contexto no se ha especificado.
- Compatible con el ecosistema llama.cpp, permitiendo ejecución en CPU y GPU.
- No se confirma soporte explícito para tool calling, function calling o razonamiento multi-paso, aunque el modelo base Qwen3 sí lo ofrece; no se ha validado en este fine-tune.

## Casos de uso

- Chatbots de rol y simulación de personajes: el modelo puede interpretar personajes con personalidades definidas, manteniendo coherencia en conversaciones largas gracias a su arquitectura MoE y al ajuste específico para roleplay.
- Asistentes de escritura creativa en coreano: generación de diálogos, descripciones y tramas para novelas, guiones o juegos de rol, aprovechando la fluidez del modelo en coreano.
- Aplicaciones de entretenimiento interactivo: integración en juegos de texto o aventuras conversacionales donde el modelo actúa como narrador o personaje no jugador.
- Sistemas de tutoría de idiomas: práctica de conversación en coreano o inglés con un compañero virtual que puede adoptar diferentes roles y niveles de formalidad.
- Generación de contenido para comunidades de fans: creación de historias o diálogos basados en personajes existentes, siempre que se respeten los derechos de autor.
- Prototipado rápido de asistentes conversacionales: gracias a su formato GGUF, se puede desplegar localmente en máquinas sin GPU de gama alta, facilitando pruebas de concepto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El modelo base Qwen3-30B-A3B reporta puntuaciones en MMLU, HumanEval y otros, pero no se dispone de datos específicos para este fine-tune.

## Requisitos de hardware

- El archivo GGUF Q6_K pesa aproximadamente 25,1 GB (tamaño del repositorio), por lo que se necesita al menos esa cantidad de memoria libre.
- Para ejecución en GPU, se recomienda una tarjeta con 24 GB o más de VRAM (por ejemplo, RTX 3090, RTX 4090, A100 40GB) para cargar el modelo completo en Q6_K.
- En CPU, puede ejecutarse con llama.cpp, pero la velocidad será limitada; se recomienda al menos 32 GB de RAM.
- Compatible con llama.cpp, llama-server, Ollama y cualquier backend que soporte GGUF.
- El throughput dependerá del hardware; en una GPU de 24 GB se pueden esperar velocidades de 10-20 tokens/s, pero no hay cifras oficiales.

## Comparativa con modelos similares

| Modelo | Parámetros | Activos | Contexto | Licencia | Formato |
|---|---|---|---|---|---|
| Qwen3-30B-A3B (base) | 30,5B | 3B | 128K (según documentación oficial) | Apache 2.0 | safetensors |
| iamtera/Qwen3-30B-A3B-Kaidol-v5-Q6_K | 30,5B | 3B | no disponible | Apache 2.0 | GGUF |
| Qwen3-4B (dense) | 4B | 4B | 128K | Apache 2.0 | safetensors/GGUF |

No se dispone de datos comparativos de rendimiento entre estos modelos. La principal diferencia es el enfoque del fine-tune: Kaidol-v5 está especializado en roleplay coreano, mientras que el base es generalista.

## Limitaciones y advertencias

- No se han documentado sesgos específicos, pero al ser un modelo de roleplay puede reflejar estereotipos de género o culturales presentes en los datos de entrenamiento.
- Riesgo de alucinación: como todo modelo generativo, puede inventar hechos o detalles inconsistentes, especialmente en contextos largos.
- La longitud de contexto no está confirmada; si se hereda de Qwen3, sería 128K, pero el fine-tune podría haberla reducido.
- El idioma principal es coreano; el rendimiento en inglés puede ser inferior al de un modelo entrenado específicamente para ese idioma.
- Licencia Apache 2.0 permite uso comercial, pero se debe verificar que el fine-tune no incluya restricciones adicionales (no se mencionan).
- Al ser una conversión GGUF, no se garantiza que todas las funcionalidades del modelo original (como tool calling) estén disponibles o funcionen correctamente en todos los backends.

## Enlaces

- Modelo GGUF en Hugging Face: https://huggingface.co/iamtera/Qwen3-30B-A3B-Kaidol-v5-Q6_K-GGUF
- Modelo base (fine-tune): https://huggingface.co/developer-lunark/Qwen3-30B-A3B-Kaidol-v5
- Repositorio de Qwen3 (oficial): https://github.com/QwenLM/Qwen3
- Modelo GGUF oficial de Qwen3-30B-A3B: https://huggingface.co/Qwen/Qwen3-30B-A3B-GGUF
