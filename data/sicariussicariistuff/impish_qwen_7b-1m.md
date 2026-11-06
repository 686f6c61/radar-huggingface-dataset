# SicariusSicariiStuff/Impish_QWEN_7B-1M

## Resumen

Impish_QWEN_7B-1M es un ajuste fino (finetune) del modelo Qwen2.5-7B-Instruct-1M, desarrollado por el usuario SicariusSicariiStuff y publicado en Hugging Face bajo licencia Apache 2.0. El modelo parte de la base instructiva de Qwen con ventana de contexto extendida a un millón de tokens y ha sido afinado para tareas de role-play, escritura creativa y tareas generales, con un nivel de censura declarado como medio (4 sobre 10 en la escala del autor).

La arquitectura subyacente es la de Qwen2.5, un transformer decoder-only con 7.615.616.512 parámetros totales (aproximadamente 7.6 mil millones), lo que lo sitúa en la categoría de modelos de tamano medio aptos para despliegue en GPUs de consumo con cuantizacion adecuada. La propuesta de valor principal es la combinacion de una ventana de contexto de un millón de tokens con un estilo de respuesta desinhibido y jugueton, orientado a generacion creativa y conversaciones de rol.

El modelo es relevante para quienes buscan un modelo pequeno con contexto masivo para narrativa larga, simulacion de personajes o generacion creativa sostenida, aunque el propio autor advierte que, al ser un 7B, su calidad en role-play no alcanza a modelos mayores como MIQU. El repositorio incluye multiples cuantizaciones (GGUF, EXL2, FP8 y variantes para ARM) que facilitan su despliegue en distintos entornos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2.5) |
| Parametros totales | 7.615.616.512 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 1.000.000 tokens (heredada de Qwen2.5-7B-Instruct-1M) |
| Tipos de cuantizacion | FP16, FP8, GGUF (estaticas, iMatrix, High-Attention, iMatrix-High-Attention), EXL2 (6.0, 7.0 y 8.0 bpw), Q4_0 para ARM |
| Idiomas soportados | Ingles (segun la model card) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (original), GGUF, EXL2, FP8 |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura de Qwen2.5-7B-Instruct-1M: un transformer decoder-only con atención completa, normalizacion RMSNorm, activacion SwiGLU y embeddings de tokens con peso atado. La innovacion principal de la base es la extension del contexto hasta un millón de tokens mediante las tecnicas de escalado de contexto desarrolladas por el equipo de Qwen, aunque la model card no detalla el mecanismo exacto empleado en el finetune.

El proceso de ajuste fino lo describe el autor como un entrenamiento orientado a escritura creativa y role-play, con menos "unalignment" que su hermano mayor Impish_QWEN_14B-1M, y con la precaucion de no "freir" el modelo de 7B. No se especifican en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset, ni si se emplearon tecnicas de RLHF o DPO. Tampoco se documentan innovaciones tecnicas adicionales como decodificacion especulativa o atención lineal.

## Capacidades

- Generacion de texto y conversacion multi-turno con contexto de hasta un millón de tokens.
- Role-play y simulacion de personajes con estilo desinhibido y jugueton, siguiendo formato de rol de internet.
- Escritura creativa: narrativa, dialogos y generacion de ficcion.
- Tareas generales de asistente, heredadas de la base Qwen2.5-7B-Instruct-1M.
- Nivel de censura declarado como medio (4/10), con baja restriccion en contenido sensible.
- Capacidades multilingues limitadas: la model card solo declara ingles, aunque la base Qwen2.5 soporta mas idiomas.
- Soporte de tool calling y function calling: no documentado en la model card, aunque la base Qwen2.5-7B-Instruct-1M lo soporta.
- Modo thinking, vision o audio: no disponible.

## Casos de uso

- Role-play conversacional de larga duracion: el millón de tokens de contexto permite mantener historiales de personaje, trasfondos extensos y decenas de turnos sin perder coherencia, adecuado para plataformas de entretenimiento conversacional.
- Escritura creativa asistida: generacion de relatos, dialogos y ficcion por capitulos, donde el contexto largo permite mantener consistencia de personajes y tramas a lo largo de miles de palabras.
- Simulacion de personajes para videojuegos o narrativa interactiva: el estilo desinhibido y el bajo nivel de censura encajan con experiencias de ficcion sin restricciones tematicas.
- Generacion de dialogos para guiones o podcasts: util para producir conversaciones con tono informal y picaro, con la ventaja de procesar documentos de referencia extensos en el mismo contexto.
- Prototipado de asistentes con personalidad: desarrolladores que necesiten un asistente con tono especifico y baja censura pueden usarlo como base para experimentar con prompts de sistema y ajustes de sampling.
- Analisis de documentos largos con salida creativa: gracias al contexto de un millón de tokens, puede resumir o reescribir novelas, transcripciones o corpus extensos en un estilo narrativo concreto.
- Despliegue en entornos con recursos limitados: las cuantizaciones GGUF y Q4_0 para ARM permiten ejecutarlo en portatiles, mini-PCs o dispositivos moviles para tareas de generacion creativa offline.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card incluye una imagen denominada "UGI score" sin valores numericos textuales, por lo que no es posible extraer datos cuantitativos.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16: aproximadamente 15,2 GB solo para pesos, mas overhead de activaciones y cache KV, lo que exige alrededor de 18-20 GB en la practica.
- VRAM estimada en cuantizacion de 8 bits (FP8/EXL2 8.0 bpw): en torno a 8-9 GB.
- VRAM estimada en cuantizacion de 4 bits (GGUF Q4): en torno a 4,5-5,5 GB.
- GPU recomendadas: A100 40/80 GB o H100 para FP16 con contexto muy largo; RTX 4090 (24 GB) para FP16 con contexto moderado o cuantizaciones de 8 bits con contexto largo; RTX 3090/4080 para cuantizaciones de 8 bits.
- Cabe en GPU de consumo: si, en RTX 3060 12 GB, RTX 4060 Ti 16 GB o RTX 4070 con cuantizaciones de 4-8 bits; las variantes Q4_0 para ARM permiten ejecucion en dispositivos moviles.
- Opciones de despliegue: llama.cpp y Ollama para GGUF, vLLM y TGI para safetensors/FP16, ExLlamaV2 para EXL2, y TensorRT-LLM para FP8.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Enfoque |
|---|---|---|---|---|
| Impish_QWEN_7B-1M | 7,6 B | 1.000.000 | Apache 2.0 | Role-play y escritura creativa |
| Impish_QWEN_14B-1M | no disponible | 1.000.000 | no disponible | Role-play y escritura creativa (hermano mayor) |
| Qwen2.5-7B-Instruct-1M | 7,6 B | 1.000.000 | Apache 2.0 | Asistente general instructivo |
| Qwen2.5-7B-Instruct | 7,6 B | 131.072 | Apache 2.0 | Asistente general instructivo |

La comparacion con Impish_QWEN_14B-1M es directa por procedencia y enfoque, aunque no se dispone de sus especificaciones completas en la informacion proporcionada. Frente a la base Qwen2.5-7B-Instruct-1M, el modelo sacrifica parte del alineamiento instructivo general en favor de un estilo creativo y menos censurado. Frente a Qwen2.5-7B-Instruct, la diferencia clave es la ventana de contexto, mucho mayor en las variantes 1M.

## Limitaciones y advertencias

- El propio autor advierte que, al ser un modelo de 7B, su calidad en role-play no alcanza a modelos mayores como MIQU.
- Nivel de censura medio (4/10): puede generar contenido sensible o inapropiado, lo que requiere filtros adicionales en produccion.
- Sesgos conocidos: no documentados en la model card; al derivar de Qwen2.5, hereda los sesgos de sus datos de entrenamiento.
- Riesgo de alucinacion: inherente a los modelos de 7B, especialmente en tareas factuales y con contextos muy largos.
- Limitacion de idioma: la model card solo declara ingles, aunque la base soporta mas idiomas; el rendimiento en castellano no esta verificado.
- Contexto de un millón de tokens: el rendimiento real en contextos extremos puede degradarse y el coste de atencion crece de forma cuadratica, con impacto en latencia y memoria.
- Licencia Apache 2.0: permite uso comercial, pero el contenido generado puede infringir derechos de terceros si se usa para role-play con personajes protegidos.
- El ajuste fino no documenta el dataset ni el proceso exacto, lo que dificulta evaluar su robustez y reproducibilidad.
- No se han publicado benchmarks que permitan comparar su rendimiento de forma objetiva.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/SicariusSicariiStuff/Impish_QWEN_7B-1M
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-7B-Instruct-1M
- Hermano mayor: https://huggingface.co/SicariusSicariiStuff/Impish_QWEN_14B-1M
- Cuantizaciones GGUF estaticas: https://huggingface.co/SicariusSicariiStuff/Impish_QWEN_7B-1M_GGUF
- Cuantizaciones iMatrix GGUF: https://huggingface.co/SicariusSicariiStuff/Impish_QWEN_7B-1M_iMatrix
- Cuantizaciones High-Attention: https://huggingface.co/SicariusSicariiStuff/Impish_QWEN_7B-1M_GGUF_HA
- Cuantizaciones iMatrix-High-Attention: https://huggingface.co/SicariusSicariiStuff/Impish_QWEN_7B-1M_HA_NL
- EXL2 6.0 bpw: https://huggingface.co/SicariusSicariiStuff/Impish_QWEN_7B-1M-6.0bpw
- EXL2 7.0 bpw: https://huggingface.co/SicariusSicariiStuff/Impish_QWEN_7B-1M-7.0bpw
- EXL2 8.0 bpw: https://huggingface.co/SicariusSicariiStuff/Impish_QWEN_7B-1M-8.0bpw
- FP8: https://huggingface.co/SicariusSicariiStuff/Impish_QWEN_7B-1M_FP8
- ARM Q4_0: https://huggingface.co/SicariusSicariiStuff/Impish_QWEN_7B-1M_ARM
- ARM Q4_0 High-Attention: https://huggingface.co/SicariusSicariiStuff/Impish_QWEN_7B-1M_ARM_HA
