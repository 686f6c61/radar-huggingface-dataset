# furiosa-ai/Solar-Open-100B-NVFP4A16

## Resumen

Solar-Open-100B-NVFP4A16 es una compilación cuantizada del modelo `upstage/Solar-Open-100B`, desarrollado originalmente por Upstage y cuantizado en casa por FuriosaAI. El modelo base es un transformer autorregresivo de tipo Mixture-of-Experts (MoE) orientado a razonamiento, chat conversacional y llamada a funciones (tool calling), con soporte para inglés y coreano. Esta variante concreta aplica cuantización NVFP4 a los pesos (4 bits en coma flotante) manteniendo activaciones y caché KV en 16 bits (esquema NVFP4A16), lo que reduce drásticamente el peso en memoria frente al modelo original.

El repositorio incluye, además de los pesos cuantizados, un Furiosa Executable Bundle (FXB) para ejecución sobre aceleradores FuriosaAI RNGD mediante la librería Furiosa-LLM. No obstante, los pesos NVFP4A16 también son compatibles con otros frameworks (vLLM, SGLang, Transformers), lo que amplía su utilidad más allá del hardware propietario de Furiosa.

La relevancia de esta ficha es doble: por un lado, documenta una de las pocas implementaciones públicas de cuantización NVFP4 sobre un MoE de gran tamaño; por otro, sirve como referencia práctica para desplegar un modelo de razonamiento con tool calling en infraestructura acelerada específica. El nombre comercial "100B" alude a la designación del modelo base, mientras que el número real de parámetros almacenados en safetensors es de 60.373.227.520.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | SolarOpen (Mixture-of-Experts, transformer autorregresivo) |
| Parametros totales | 60.373.227.520 (según safetensors); designación comercial "100B" del modelo base |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | NVFP4A16 (pesos en NVFP4 de 4 bits; activaciones y caché KV en 16 bits) |
| Idiomas soportados | inglés (en), coreano (ko) |
| Licencia | upstage-solar-license (Upstage Solar License) |
| Formato de pesos | safetensors, compressed-tensors (8-bit de contenedor, NVFP4 real), FXB (Furiosa Executable Bundle) |

## Arquitectura y entrenamiento

El modelo base es un transformer autorregresivo con arquitectura Mixture-of-Experts (MoE) denominada SolarOpen por Upstage. Esta variante no modifica la arquitectura: FuriosaAI aplica únicamente cuantización post-entrenamiento a NVFP4 sobre los pesos, dejando activaciones y caché KV en 16 bits. El resultado se empaqueta en formato compressed-tensors y se acompaña de un FXB específico para RNGD.

No se dispone en la información proporcionada de datos sobre el número de tokens de entrenamiento, la composición del dataset, ni si el modelo base empleó RLHF, DPO u otras técnicas de alineamiento. Tampoco se detallan innovaciones como decodificación especulativa o atención lineal. La única innovación técnica documentada es la propia cuantización NVFP4A16 y la estrategia de paralelismo en RNGD: tamaño de tensor-parallel de 32 PEs, que se mapea a cuatro tarjetas RNGD (8 PEs por tarjeta).

## Capacidades

- Generación de texto conversacional en inglés y coreano.
- Razonamiento explícito con cadena de pensamiento (chain of thought) separable del texto final.
- Control de profundidad de razonamiento por petición mediante `reasoning_effort` (`"low"`, `"medium"`, `"high"`; por defecto `"high"`). Con `"low"` o `"minimal"` el modelo omite el razonamiento y responde directamente.
- Tool calling / function calling mediante el parser `solar_open`, con elección automática de herramienta (`--enable-auto-tool-choice`).
- Modo dual: razonamiento y chat no-razonado en el mismo modelo.
- Exposición de la cadena de pensamiento en campos separados (`message.reasoning` en no streaming, `delta.reasoning` en streaming), convención compatible con OpenAI Agents SDK y vLLM.
- API compatible con OpenAI a través del servidor de Furiosa-LLM.
- No se documentan capacidades de visión, audio ni otros modos multimodales.

## Casos de uso

- Razonamiento asistido en producción: el modelo puede resolver problemas que requieren cadena de pensamiento larga y devolver el razonamiento en un campo separado, lo que facilita auditoría y filtrado en aplicaciones de soporte a decisiones.
- Agentes con tool calling: gracias al parser `solar_open` y a `--enable-auto-tool-choice`, se puede integrar en pipelines de agentes que deciden cuándo invocar APIs externas, bases de datos o funciones internas.
- Atención al cliente bilingüe inglés-coreano: el soporte nativo de ambos idiomas permite desplegar un único modelo para mercados de habla inglesa y coreana sin modelos auxiliares.
- Generación de código y automatización de tareas técnicas: el modo de razonamiento con `reasoning_effort` ajustable permite equilibrar latencia y calidad según la complejidad de la tarea (por ejemplo, `"low"` para autocompletado, `"high"` para revisión de parches).
- Despliegue en infraestructura FuriosaAI RNGD: el FXB incluido permite servir el modelo en cuatro tarjetas RNGD con paralelismo de 32 PEs, útil para organizaciones que ya operan esta aceleración.
- Evaluación de cuantización NVFP4: investigadores pueden usar este repositorio para medir la degradación de calidad de NVFP4 frente al modelo original en tareas de razonamiento y tool calling, dado que los pesos también corren en vLLM, SGLang y Transformers.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita. El repositorio ocupa 101,2 GB; con pesos NVFP4 de 4 bits y activaciones/caché KV en 16 bits, el peso en memoria es sustancialmente inferior al del modelo base en BF16, pero no se proporciona una cifra oficial.
- GPU recomendadas: no disponible para GPUs convencionales. El hardware de referencia documentado es FuriosaAI RNGD (cuatro tarjetas, 32 PEs en total).
- ¿Cabe en GPU consumer? No disponible. No se documenta compatibilidad con RTX 4090 u otras consumer.
- Opciones de despliegue: Furiosa-LLM (soporte oficial con FXB para RNGD); los pesos NVFP4A16 también son compatibles con vLLM, SGLang y Transformers según la model card.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Solar-Open-100B-NVFP4A16 (este) | 60.373.227.520 (safetensors); designación 100B | no disponible | upstage-solar-license | Hugging Face, Furiosa-LLM, vLLM/SGLang/Transformers |
| upstage/Solar-Open-100B (base) | designación 100B | no disponible | upstage-solar-license | Hugging Face |
| Otros MoE cuantizados NVFP4 de tamaño comparable | no disponible | no disponible | no disponible | no disponible |

No se dispone en la información proporcionada de datos de benchmarks ni de especificaciones detalladas de modelos alternativos que permitan una comparación cuantitativa rigurosa.

## Limitaciones y advertencias

- Solo se documentan inglés y coreano; el rendimiento en castellano u otros idiomas no está garantizado.
- La cuantización NVFP4 puede introducir degradación de calidad frente al modelo base en BF16; no se han publicado evaluaciones comparativas en la información disponible.
- Riesgo de alucinación inherente a los modelos de lenguaje de gran escala; no se documentan medidas específicas de mitigación.
- Sesgos conocidos: no documentados en la información proporcionada.
- Longitud de contexto no especificada; conviene verificar en la model card del modelo base antes de desplegar cargas con contexto largo.
- Licencia `upstage-solar-license`: es una licencia "other" con términos propios; es imprescindible revisar el enlace de licencia del modelo base antes de cualquier uso comercial.
- El soporte oficial de despliegue está ligado a Furiosa-LLM y hardware RNGD; el uso en vLLM, SGLang o Transformers se menciona como compatible pero sin garantías documentadas en esta ficha.
- El campo `reasoning` no forma parte de la especificación OpenAI; su acceso cuando no hay contenido de razonamiento lanza `AttributeError`, lo que requiere manejo defensivo en el código cliente.
- El modelo se distribuye con `custom_code`, lo que implica confiar en código remoto al cargarlo con Transformers.

## Enlaces

- Hugging Face (este modelo): https://huggingface.co/furiosa-ai/Solar-Open-100B-NVFP4A16
- Modelo base: https://huggingface.co/upstage/Solar-Open-100B
- Licencia del modelo base: https://huggingface.co/upstage/Solar-Open-100B/blob/main/LICENSE
- FuriosaAI: https://furiosa.ai
- Documentación de Furiosa-LLM: https://developer.furiosa.ai/latest/en/furiosa_llm/intro.html
- Guía de instalación de Furiosa-LLM: https://developer.furiosa.ai/latest/en/get_started/furiosa_llm.html#installing-furiosa-llm
- Guía de tool calling: https://developer.furiosa.ai/latest/en/furiosa_llm/toolcalling.html
