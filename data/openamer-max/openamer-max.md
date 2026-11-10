# openamer-max/openamer-max

## Resumen

OpenAmer-Max es un modelo de lenguaje de 3.085.938.688 parámetros derivado de Qwen/Qwen2.5-3B-Instruct mediante un ajuste fino con QLoRA, posteriormente fusionado con la base y convertido a formato GGUF. Lo publica el autor openamer-max bajo licencia Apache 2.0 y está pensado para ejecutarse localmente en Ollama sin dependencia de la nube ni de claves de API. Su propósito principal es actuar como asistente conversacional especializado en el proyecto OpenAmer, con soporte declarado para alemán, bosnio, croata, serbio e inglés.

El modelo parte de la arquitectura transformer densa de Qwen2.5-3B-Instruct, por lo que hereda su ventana de contexto y su tokenizador, aunque la model card no explicita la longitud de contexto final (la configuración de ejemplo usa `num_ctx 8192`). La innovación declarada no está en la arquitectura, sino en el ajuste fino: el autor informa de una mejora sustancial en un banco de pruebas propio de 23 casos, pasando de 17/23 en la base a 22/23 en la versión Q4 desplegada en Ollama.

Es relevante ahora porque ejemplifica el patrón de modelos pequeños (3B) ajustados para dominios concretos y distribuidos en GGUF para consumo en hardware de gama media, incluyendo portátiles con GPU de 8 GB. La model card advierte que parte del conocimiento factual del dominio reside en el system prompt (46 hechos documentados) y no solo en los pesos, lo que condiciona su evaluación y su uso en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (derivado de Qwen2.5-3B-Instruct); no se detalla en la model card |
| Parametros totales | 3.085.938.688 |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | no disponible en la model card; el ejemplo de Ollama configura `num_ctx 8192` |
| Tipos de cuantizacion | Q4 (4,99 bits/peso, `openamer-max.q4.gguf`) y F16 (`openamer-max.f16.gguf`) |
| Idiomas soportados | de, bs, hr, sr, en |
| Licencia | Apache 2.0 (se mantiene el copyright de la base Qwen2.5-3B-Instruct) |
| Formato de pesos | GGUF (librería `gguf`); el modelo base original se distribuye en safetensors |

## Arquitectura y entrenamiento

El modelo es un ajuste fino de Qwen2.5-3B-Instruct, un transformer denso de 3B parámetros. Según la model card, el proceso consistió en un fine-tuning con QLoRA sobre la base, seguido de la fusión del adaptador con los pesos originales y la conversión a GGUF. No se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron etapas de RLHF o DPO adicionales; solo se indica que el ajuste se realizó bajo la misma licencia Apache 2.0 de la base.

La innovación técnica declarada es operativa más que arquitectónica: el modelo incorpora en el system prompt 46 hechos documentados sobre OpenAmer, de modo que responde correctamente sin contexto adicional y admite decir "Das weiss ich nicht" cuando la pregunta no está cubierta. El autor reporta que el ajuste mejora un banco de pruebas congelado de 23 casos (de 17/23 en la base a 21/23 con el adaptador LoRA y 22/23 con el GGUF Q4 en Ollama). No se documentan técnicas como decodificación especulativa, atención lineal ni arquitecturas híbridas.

## Capacidades

- Generación de texto conversacional en alemán, bosnio, croata, serbio e inglés.
- Respuesta a preguntas sobre el dominio OpenAmer apoyándose en el system prompt con 46 hechos documentados.
- Reconocimiento explícito de límites de conocimiento ("Das weiss ich nicht") cuando la pregunta queda fuera de lo cubierto.
- Ejecución local en Ollama mediante GGUF, sin API ni proveedor externo.
- Despliegue con configuración de temperatura y contexto ajustables (`temperature 0.7`, `num_ctx 8192` en el ejemplo).
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: la model card lo descarta explícitamente para trabajo de agentes multietapa.
- Capacidades de visión, audio o modo thinking: no disponibles.

## Casos de uso

- Asistente de identidad y FAQ del proyecto OpenAmer: el modelo lleva en el system prompt los 46 hechos documentados, por lo que puede responder preguntas frecuentes sobre el proyecto sin recuperación externa y admitir cuándo no sabe la respuesta.
- Chat local en portátil con GPU de 8 GB: el GGUF Q4 (1,93 GB) permite ejecutar el modelo en Ollama con un throughput declarado de 73–86 tokens/s en una RTX 5060 Laptop, adecuado para uso personal sin conexión.
- Atención al cliente en alemán para un producto o comunidad concreta: el ajuste fino sobre un dominio cerrado y el rechazo explícito a inventar respuestas reducen el riesgo de información incorrecta en consultas acotadas.
- Soporte multilingüe en la región balcánica occidental: al cubrir bosnio, croata y serbio además de alemán e inglés, sirve para asistentes de primera línea en aplicaciones dirigidas a esos mercados.
- Prototipado rápido de aplicaciones conversacionales: la distribución en GGUF y la integración con Ollama permiten montar un endpoint local en minutos para validar flujos de diálogo antes de invertir en modelos mayores.
- Generación de respuestas controladas en entornos sin conectividad: al no requerir nube ni clave de API, encaja en despliegues aislados o con requisitos de privacidad donde los datos no deben salir del equipo.
- Base para nuevos ajustes de dominio: su licencia Apache 2.0 y su tamaño de 3B lo hacen manejable para fine-tuning adicional en hardware de consumo.

## Benchmarks y rendimiento

Los únicos datos disponibles provienen de un banco de pruebas propio del autor (23 casos congelados), no de benchmarks estándar como MMLU, HumanEval o GSM8K.

| Modelo / formato | Resultado (23 casos) |
|---|---|
| Qwen2.5-3B base | 17/23 (73,9 %) |
| Adaptador LoRA | 21/23 (91,3 %) |
| OpenAmer-Max Q4 en Ollama | 22/23 (95,7 %) |

Rendimiento declarado: 73–86 tokens/s en una RTX 5060 Laptop con 8 GB de VRAM. No se han publicado resultados de benchmarks estándar en la información disponible.

## Requisitos de hardware

- VRAM estimada: aproximadamente 2 GB para el GGUF Q4 (1,93 GB de archivo) y en torno a 6–7 GB para el F16 (6,18 GB de archivo), más el overhead de contexto.
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM para Q4; el autor cita una RTX 5060 Laptop (8 GB) como referencia. Para F16 se recomienda 8 GB o más.
- Cabe en GPU de consumo: sí, el Q4 está pensado para portátiles y tarjetas de gama media con 8 GB.
- Opciones de despliegue: Ollama (documentado en la model card); al ser GGUF, es compatible con llama.cpp y otros runners que acepten este formato. vLLM y TGI no están documentados para esta distribución.
- Latencia y throughput: 73–86 tokens/s en RTX 5060 Laptop (8 GB) con la cuantización Q4, según el autor.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| OpenAmer-Max | 3,09B | no disponible (ejemplo con 8192) | Apache 2.0 | GGUF | Ajuste QLoRA de Qwen2.5-3B-Instruct orientado a OpenAmer |
| Qwen2.5-3B-Instruct | 3,09B | no disponible en la información proporcionada | Apache 2.0 | safetensors, GGUF | Modelo base; 17/23 en el banco de pruebas del autor |
| Alternativas de 3B comparables | no disponible | no disponible | no disponible | no disponible | No se aportan datos de otros modelos en la información disponible |

## Limitaciones y advertencias

- Tamaño de 3B: la model card lo declara adecuado para chat, identidad y datos factuales, pero no para trabajo de agentes multietapa.
- Dependencia del system prompt: los 46 hechos sobre OpenAmer residen en el system prompt, no solo en los pesos; sin ese prompt el comportamiento factual puede degradarse.
- Cobertura idiomática limitada a alemán, bosnio, croata, serbio e inglés; otros idiomas no están declarados.
- Riesgo de alucinación inherente a los modelos de 3B, mitigado parcialmente por el rechazo explícito a responder cuando la pregunta no está cubierta.
- Evaluación basada en un banco de pruebas propio de 23 casos, sin benchmarks estándar publicados; los resultados no son directamente comparables con métricas como MMLU o HumanEval.
- Sesgos: no se documentan análisis de sesgo en la información disponible.
- Licencia Apache 2.0 permite uso comercial, pero debe mantenerse el aviso de copyright de la base Qwen2.5-3B-Instruct.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, lo que implica ausencia de validación externa por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/openamer-max/openamer-max
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-3B-Instruct
- Proyecto OpenAmer: https://openamer-max.github.io/
