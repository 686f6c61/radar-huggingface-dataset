# BachDaThan/vietnamese-news-summarizer-v4-GGUF

## Resumen

vietnamese-news-summarizer-v4-GGUF es un modelo de generación de texto en formato GGUF, publicado por el usuario BachDaThan, que consiste en la fusión del adaptador LoRA `vinhthuan/vietnamese-news-summarizer-v4` sobre el modelo base `Qwen/Qwen3-1.7B` y su posterior cuantización para su uso con llama.cpp. El resultado es un modelo de 1.720.574.976 parámetros (aproximadamente 1,72 mil millones) orientado a tareas de resumen de noticias en vietnamita, con soporte secundario de inglés, y con un tamaño de fichero que va de 0,81 GB a 1,03 GB según el nivel de cuantización.

El problema que resuelve es doble. Por un lado, ofrece una alternativa de resumen en vietnamita con un coste de inferencia muy bajo, ejecutable en GPUs de consumo e incluso en CPU, algo relevante en un idioma con menos cobertura de modelos especializados que el inglés. Por otro, empaqueta el proceso completo de fusión de LoRA y cuantización en GGUF, de modo que el usuario no necesita reproducir el pipeline de merge ni disponer de la precisión bfloat16 original.

La relevancia actual del modelo es limitada y debe contextualizarse: el repositorio tiene 0 descargas y 0 likes en el momento de la consulta, fue creado el 10 de septiembre de 2026 y su model card está redactada en vietnamita. Se trata, por tanto, de una publicación reciente y sin validación externa conocida. La arquitectura subyacente es un transformer decoder-only de tipo Qwen3, con 28 capas, hidden size de 2048, 16 cabezas de atención y 8 cabezas KV (GQA), y una ventana de contexto declarada de 40.960 tokens.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only tipo Qwen3 (28 capas, hidden size 2048, head dim 128, 16 cabezas de atención, 8 cabezas KV con GQA, vocabulario de 151.936 tokens) |
| Parametros totales | 1.720.574.976 (aproximadamente 1,72 mil millones) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | 40.960 tokens según la model card; los ejemplos de uso configuran `n_ctx=8192` |
| Tipos de cuantizacion | Q4_K_M (1,03 GB), Q4_K_S (0,99 GB), Q3_K_M (0,88 GB), Q3_K_S (0,81 GB); precisión original bfloat16 |
| Idiomas soportados | Vietnamita (vi) e inglés (en) |
| Licencia | apache-2.0 (heredada del modelo base y del adaptador LoRA, según la model card) |
| Formato de pesos | GGUF (librería llama.cpp); el repositorio incluye además pesos en safetensors, con un tamaño total de 4,0 GB |

## Arquitectura y entrenamiento

La arquitectura corresponde a la del modelo base Qwen3-1.7B: un transformer decoder-only con atención de consultas agrupadas (GQA), 28 capas, dimensión oculta de 2048, dimensión de cabeza de 128, 16 cabezas de atención y 8 cabezas KV, con un vocabulario de 151.936 tokens. La ventana de contexto declarada en la model card es de 40.960 tokens, aunque el ajuste efectivo en tiempo de ejecución depende del parámetro `n_ctx` que se configure en llama.cpp; todos los ejemplos proporcionados por el autor usan 8192 tokens. Este modelo no incorpora mecanismos MoE ni arquitecturas híbridas SSM.

El proceso de creación descrito por el autor es un merge del adaptador LoRA `vinhthuan/vietnamese-news-summarizer-v4` sobre los pesos bfloat16 de Qwen3-1.7B, seguido de una cuantización automática a GGUF en cuatro niveles. La model card no detalla el número de tokens de entrenamiento, la composición del dataset, ni si se emplearon técnicas de alineación como RLHF o DPO; estos datos figuran como no disponibles. Tampoco se documenta ninguna innovación técnica propia más allá del pipeline de fusión y cuantización, ni el uso de decodificación especulativa o atención lineal. El chat template es de estilo ChatML (`<|im_start|>system`, `<|im_start|>user`, `<|im_start|>assistant`, `<|im_end|>`), leído del `tokenizer_config.json` original.

## Capacidades

- Generación de texto conversacional e instruccional, con ajuste específico para resumen de noticias en vietnamita.
- Resumen de documentos: la tarea objetivo del adaptador LoRA fusionado.
- Comprensión y generación en vietnamita (vi) e inglés (en), con el vietnamita como idioma principal.
- Formato de conversación multi-turno mediante roles system, user y assistant.
- Ejecución local con llama.cpp, llama-cpp-python y Ollama, con soporte de descarga total en GPU (`n_gpu_layers=-1`) o inferencia en CPU.
- Integración compatible con endpoints (etiqueta `endpoints_compatible` en HuggingFace).
- No se documenta soporte de tool calling ni function calling.
- No se documenta comportamiento de agente ni razonamiento multi-paso explícito.
- No se documentan capacidades de visión, audio, ni modo de razonamiento (thinking mode).

## Casos de uso

- Resumen automático de noticias en agregadores y lectores RSS: el modelo recibe el cuerpo de una noticia en vietnamita y devuelve un resumen breve; su tamaño de 1,7 mil millones de parámetros permite procesar grandes volúmenes de artículos en hardware modesto.
- Generación de titulares y bullets para aplicaciones móviles de noticias: a partir de un texto completo, el modelo produce versiones cortas que se integran en listados y notificaciones push, con latencia baja gracias a las cuantizaciones Q4.
- Preprocesado de corpus para pipelines de búsqueda y RAG: los resúmenes generados pueden indexarse como representación comprimida de documentos largos, reduciendo el coste de almacenamiento y de recuperación en sistemas de búsqueda semántica en vietnamita.
- Asistente conversacional de atención al cliente en vietnamita: el formato ChatML con roles system y user permite definir instrucciones de estilo o tono; el modelo puede gestionar conversaciones de varios turnos siempre que se ajuste `n_ctx` al contexto real necesario.
- Despliegue en entornos sin GPU: con ficheros de 0,81 a 1,03 GB, el modelo puede ejecutarse en CPU mediante llama.cpp en máquinas con poca RAM, útil para prototipos, entornos educativos o despliegues on-premise con restricciones de hardware.
- Procesamiento por lotes de boletines bilingües vi-en: al soportar ambos idiomas, puede generar resúmenes en inglés de contenido original vietnamita para equipos internacionales.
- Pipeline de accesibilidad con texto a voz: los resúmenes breves generados por el modelo son adecuados como entrada de un sistema TTS que lea las noticias principales a usuarios con discapacidad visual.
- Investigación sobre cuantización y LoRA: el repositorio permite comparar la degradación de calidad entre Q3_K_S, Q3_K_M, Q4_K_S y Q4_K_M sobre una misma tarea de resumen, y estudiar el efecto del merge de LoRA en modelos pequeños.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas de evaluación propias (ROUGE, BLEU, MMLU, HumanEval, GSM8K ni ninguna otra), y la búsqueda web realizada no devolvió resultados relevantes para este modelo. Tampoco se proporcionan datos de latencia o throughput.

## Requisitos de hardware

- VRAM recomendada por el autor según el fichero:
  - Q4_K_M (1,03 GB): aproximadamente 3,0 GB de VRAM.
  - Q4_K_S (0,99 GB): aproximadamente 3,0 GB de VRAM.
  - Q3_K_M (0,88 GB): aproximadamente 2,9 GB de VRAM.
  - Q3_K_S (0,81 GB): aproximadamente 2,8 GB de VRAM.
- Estimación adicional de caché KV: con 28 capas, 8 cabezas KV y head dim de 128 en fp16, la caché consume aproximadamente 112 KiB por token, es decir, en torno a 917 MiB para 8192 tokens y unos 4,6 GB para los 40.960 tokens declarados. Esta cifra es una estimación derivada de la arquitectura y no un dato publicado por el autor; puede reducirse con cuantización de la caché KV.
- GPU de consumo: cabe en cualquier GPU con 4 GB o más de VRAM (por ejemplo, GTX 1650, RTX 3050, RTX 3060, RTX 4060, RTX 4090), asumiendo contextos moderados. El parámetro `n_gpu_layers=-1` descarga todas las capas en GPU.
- GPU de datacenter: A100, H100 y similares son compatibles, pero están sobredimensionadas para un modelo de este tamaño; su uso solo se justifica en despliegues con muchas réplicas concurrentes.
- CPU: es viable la inferencia completa en CPU con llama.cpp, con un consumo de memoria en torno a 1-2 GB para el modelo más caché, dependiendo de la cuantización y del contexto.
- Opciones de despliegue: llama.cpp, llama-cpp-python (ejemplo oficial incluido), Ollama (Modelfile de ejemplo incluido), y cualquier runtime compatible con GGUF. No se documenta soporte específico para vLLM o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de datos de rendimiento publicados para este modelo, por lo que la comparación se limita a características estructurales y de licencia. Los únicos elementos comparables presentes en la información proporcionada son el modelo base y el adaptador LoRA de origen.

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Formato y disponibilidad |
|---|---|---|---|---|---|
| vietnamese-news-summarizer-v4-GGUF | 1,72 mil millones | 40.960 tokens declarados | No disponible | apache-2.0 | GGUF en 4 niveles de cuantización; safetensors; repo de 4,0 GB; 0 descargas |
| Qwen/Qwen3-1.7B (modelo base) | 1,72 mil millones | No disponible en la informacion proporcionada | No disponible | apache-2.0 | Pesos originales en bfloat16; disponible en HuggingFace |
| vinhthuan/vietnamese-news-summarizer-v4 (adaptador LoRA) | No disponible | No disponible en la informacion proporcionada | No disponible | apache-2.0 | Adaptador LoRA; disponible en HuggingFace |

Alternativas de otros autores para resumen en vietnamita o modelos multilingües de tamaño similar: no disponible en la informacion proporcionada.

## Limitaciones y advertencias

- Alucinación: el propio autor advierte en la model card que el modelo puede generar información falsa y que no debe usarse como sustituto de asesoramiento profesional en dominios críticos.
- Modelo de 1,72 mil millones de parámetros: la capacidad de razonamiento complejo, matemáticas y conocimiento factual es inherentemente limitada en comparación con modelos de mayor tamaño; no se han publicado evaluaciones que cuantifiquen esta limitación.
- Especialización frente a generalidad: al ser un merge de LoRA orientado a resumen de noticias, es probable que rinda mejor en esa tarea que en otras tareas generales, con posible degradación de capacidades generales respecto al Qwen3-1.7B original (no cuantificada en la información disponible).
- Cobertura de idiomas restringida a vietnamita e inglés; no se documenta soporte de otras lenguas, incluido el español.
- Contexto: aunque la model card declara 40.960 tokens, los ejemplos de uso configuran `n_ctx=8192`, y el contexto efectivo en llama.cpp depende de la configuración y de la memoria disponible para la caché KV. No se documenta el uso de escalado RoPE ni evaluación de degradación en contextos largos.
- Cuantizaciones agresivas: los niveles Q3_K_S y Q3_K_M implican pérdidas de calidad no medidas por el autor; para producción sensible conviene validar Q4_K_M o Q4_K_S.
- Licencia: los metadatos de HuggingFace indican apache-2.0, pero la propia model card señala que la licencia del repositorio "se determina tras verificar la licencia de origen" y que no se autoasigna Apache-2.0, lo que introduce ambigüedad. En caso de uso comercial conviene verificar la licencia efectiva y conservar los avisos de atribución del modelo base y del adaptador.
- Sin validación comunitaria: 0 descargas, 0 likes y sin benchmarks publicados; cualquier despliegue en producción debería ir precedido de una evaluación propia sobre el dominio objetivo.
- No se documentan sesgos específicos ni procesos de alineación (RLHF, DPO) que mitiguen sesgos en el corpus de entrenamiento.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/BachDaThan/vietnamese-news-summarizer-v4-GGUF
- Modelo base Qwen/Qwen3-1.7B: https://huggingface.co/Qwen/Qwen3-1.7B
- Adaptador LoRA de origen vinhthuan/vietnamese-news-summarizer-v4: https://huggingface.co/vinhthuan/vietnamese-news-summarizer-v4
- Búsqueda web: no se encontraron enlaces relevantes al modelo; los resultados devueltos correspondían a sitios de relojes y temporizadores sin relación con el modelo.
