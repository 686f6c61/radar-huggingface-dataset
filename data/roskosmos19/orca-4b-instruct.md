# roskosmos19/Orca-4B-Instruct

## Resumen

Orca-4B-Instruct es un modelo de generacion de texto publicado por el usuario roskosmos19 en Hugging Face, derivado de Qwen/Qwen3-4B-Instruct-2507. Se presenta como una version "optimizada" del modelo base de Qwen con 4.022 millones de parametros y una arquitectura Qwen3ForCausalLM de 36 capas y tamano oculto 2560. Su propuesta de valor declarada es mejorar la relacion precio/rendimiento reduciendo la ventana de contexto de 262.144 a 16.384 tokens, eliminando tokens especiales multimodales y ajustando los parametros de generacion por defecto.

La relevancia practica del modelo es limitada y debe interpretarse con cautela. El propio autor corrigio la model card el 23 de noviembre de 2026 indicando que los pesos de safetensors son byte a byte identicos a los del modelo original de Qwen (comparados por SHA-256), y que solo se modificaron configuracion, plantilla de chat y documentacion. Por tanto, no existe entrenamiento adicional ni fine-tuning propio: las supuestas mejoras de calidad o de benchmarks no proceden de pesos distintos.

En la practica, Orca-4B-Instruct funciona como una reconfiguracion ligera de Qwen3-4B-Instruct-2507 orientada a despliegues de bajo coste con contexto corto, bajo licencia Apache 2.0 y con soporte para transformers y text-generation-inference. Quien necesite las capacidades reales del modelo base puede usar directamente el repositorio oficial de Qwen.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3ForCausalLM (transformer decoder-only) |
| Parametros totales | 4.022.468.096 (4,0B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 16.384 tokens (configurada; el modelo base soporta 262.144) |
| Tipos de cuantizacion | bfloat16, float16; Q4_K_M, Q5_K_M (GGUF), AWQ y GPTQ recomendados por el autor |
| Idiomas soportados | ingles (declarado en la model card) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (repo de 8,1 GB), compatible con transformers y TGI |
| Capas | 36 |
| Tamano oculto | 2560 |
| Tamano de vocabulario | 151.936 |
| Modelo base | Qwen/Qwen3-4B-Instruct-2507 (pesos identicos, sin cambios) |

## Arquitectura y entrenamiento

La arquitectura es un transformer decoder-only de la familia Qwen3, con 36 capas, dimension oculta de 2560 y un vocabulario de 151.936 tokens. El modelo no incorpora innovaciones propias: reutiliza integramente los pesos de Qwen3-4B-Instruct-2507, que fue entrenado por el equipo de Qwen con datos no detallados en la informacion disponible (composicion del corpus, numero de tokens, uso de RLHF o DPO no se especifican).

Las unicas modificaciones documentadas por el autor son de configuracion: reduccion del contexto maximo a 16.384 tokens, eliminacion de tokens especiales multimodales, ajuste de la plantilla de chat y de los parametros de generacion por defecto (temperature 0,5; top_p 0,85; top_k 30; repetition_penalty 1,05). El autor reconoce explicitamente que no se ejecuto ninguna evaluacion de benchmarks propia y que las afirmaciones sobre entrenamiento adicional no corresponden a pesos distintos del original.

## Capacidades

- Generacion de texto conversacional e instrucciones generales en ingles.
- Razonamiento basico y respuesta a preguntas de dominio general, heredado del modelo base Qwen3-4B-Instruct-2507.
- Generacion de codigo y matematicas a nivel de modelo de 4B, sin garantias de correccion (el autor advierte de posibles errores).
- Resumen y tareas de contexto corto, optimizadas para ventanas de hasta 16.384 tokens.
- Soporte de plantilla de chat mediante `apply_chat_template` de transformers.
- Sin soporte de vision: los tokens especiales multimodales fueron eliminados.
- Sin modo thinking explicito ni capacidades de audio declaradas.
- Soporte de tool calling y agentes: no documentado en la informacion disponible.

## Casos de uso

- Chatbot de atencion al cliente en ingles: el modelo puede mantener conversaciones multiturno dentro de una ventana de 16.384 tokens, suficiente para la mayoria de interacciones de soporte, con un coste de KV-cache reducido frente al modelo base.
- Resumen de documentos cortos y correos: adecuado para resumir textos de hasta unas decenas de paginas dentro del contexto configurado, con despliegue en una sola GPU de consumo.
- Asistente de escritura y reescritura: generacion de borradores, parafraseo y ajuste de tono en ingles, con parametros de generacion ya calibrados por el autor para respuestas menos repetitivas.
- Prototipado rapido de aplicaciones LLM: al cargarse directamente con transformers y ocupar unos 8,1 GB en bfloat16, permite iterar en entornos de desarrollo sin infraestructura dedicada.
- Clasificacion y extraccion de informacion en pipelines por lotes: tareas de etiquetado o extraccion de entidades sobre textos cortos, donde el throughput prima sobre la profundidad de razonamiento.
- Despliegue en produccion de bajo coste con vLLM o SGLang: el autor recomienda `--max-model-len 16384` y mantener el contexto en 8k-12k para maximizar la relacion velocidad/VRAM.
- Educacion y demos interactivas: modelo ligero para entornos de aprendizaje o demostraciones en LM Studio u Ollama usando GGUF cuantizado en Q4_K_M.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica explicitamente que no se ejecuto ninguna evaluacion propia para este repositorio y remite a la model card del modelo base Qwen/Qwen3-4B-Instruct-2507 para obtener puntuaciones medidas.

## Requisitos de hardware

- VRAM en bfloat16/float16: aproximadamente 8 GB solo para pesos; con contexto de 16k el KV-cache anade varios GB adicionales, por lo que se recomienda una GPU de 16-24 GB.
- VRAM en cuantizacion Q4_K_M: alrededor de 2,5 GB de pesos segun el autor, lo que permite inferencia en GPUs de consumo de 8 GB con contexto moderado.
- GPUs recomendadas: NVIDIA RTX 4090 (24 GB) o A100/H100 para despliegues con contexto completo; RTX 3060/4060 Ti de 8-16 GB para cuantizaciones Q4/Q5.
- Cabe en GPU de consumo: si, en RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070/4080 y superiores, usando GGUF cuantizado.
- Opciones de despliegue: transformers, text-generation-inference (TGI), vLLM, SGLang, llama.cpp, Ollama y LM Studio.
- Latencia y throughput: no disponibles; el autor solo afirma que la reduccion de contexto y la eliminacion de tokens multimodales reducen el uso de VRAM del KV-cache, sin cifras medidas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Orca-4B-Instruct | 4,0B | 16.384 (configurado) | Apache 2.0 | Pesos identicos a Qwen3-4B-Instruct-2507; solo cambia configuracion y plantilla |
| Qwen/Qwen3-4B-Instruct-2507 | 4,0B | 262.144 | Apache 2.0 | Modelo base oficial; mismos pesos, contexto nativo completo y tokens multimodales |
| roskosmos19/Orca-4B-flash | no disponible | no disponible | no disponible | Version sucesora indicada por el autor mediante el campo `new_version` |

La comparativa con otras familias de 4B (por ejemplo, Llama 3.2 3B Instruct o Gemma 3 4B) no esta disponible en la informacion proporcionada; no se aportan datos de rendimiento que permitan una comparacion rigurosa.

## Limitaciones y advertencias

- Los pesos son byte a byte identicos a Qwen3-4B-Instruct-2507: no hay entrenamiento adicional ni mejoras de calidad verificables respecto al original.
- El autor no ejecuto benchmarks propios; cualquier afirmacion de "mejor rendimiento" en la model card queda desmentida por la propia correccion del 23-11-2026.
- Riesgo de alucinacion y de generar codigo o respuestas incorrectas; el autor recomienda verificar las salidas antes de usarlas.
- Contexto limitado a 16.384 tokens, muy inferior a los 262.144 del modelo base, lo que lo inutiliza para tareas de documento largo o conversaciones muy extensas.
- Solo declara soporte de ingles; el rendimiento en castellano no esta documentado.
- Sin capacidades de vision ni de audio; los tokens multimodales fueron eliminados.
- Hereda los sesgos y limitaciones del modelo base y de sus datos de entrenamiento, no detallados.
- Licencia Apache 2.0: permite uso comercial, pero al tratarse de una reconfiguracion de pesos ajenos conviene revisar tambien los terminos del repositorio original de Qwen.
- Repositorio con muy poca traccion (26 descargas, 1 like) y sin garantias de mantenimiento; el autor apunta a una version sucesora (Orca-4B-flash).

## Enlaces

- Hugging Face: https://huggingface.co/roskosmos19/Orca-4B-Instruct
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B-Instruct-2507
- Version sucesora indicada por el autor: https://huggingface.co/roskosmos19/Orca-4B-flash
