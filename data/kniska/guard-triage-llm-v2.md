# kniska/guard-triage-llm-v2

## Resumen

`kniska/guard-triage-llm-v2` es un ajuste fino (fine-tuning) del modelo Llama 3 de 8.000 millones de parametros, partiendo del checkpoint cuantizado en 4 bits `unsloth/llama-3-8b-bnb-4bit` publicado por Unsloth. Lo desarrolla el usuario kniska y esta orientado, segun su nombre, a tareas de triaje y moderacion de seguridad (guard/triage), aunque la model card no documenta el dataset ni el procedimiento de entrenamiento mas alla de indicar que se uso la libreria Unsloth y TRL.

El modelo hereda la arquitectura transformer decoder-only de Llama 3 8B, con una ventana de contexto nativa de 8.192 tokens (ampliable mediante RoPE scaling, aunque no se confirma en la informacion disponible). Se distribuye en formato safetensors con licencia Apache 2.0, lo que permite uso comercial sin restricciones adicionales, y esta etiquetado unicamente para ingles.

Su relevancia practica es limitada por ahora: el repositorio no tiene descargas ni interacciones, la model card es practicamente la plantilla automatica de Unsloth y no se publican benchmarks, datos de entrenamiento ni evaluaciones. Debe tratarse como un experimento de ajuste fino mas que como un modelo listo para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 3), ajuste fino sobre `unsloth/llama-3-8b-bnb-4bit` |
| Parametros totales | 8.000 millones (heredados del modelo base Llama 3 8B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la model card; el modelo base Llama 3 8B soporta 8.192 tokens |
| Tipos de cuantizacion | el checkpoint base esta en 4 bits (bitsandbytes); el repositorio se distribuye en safetensors; no se detallan otras cuantizaciones |
| Idiomas soportados | ingles (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (libreria transformers) |

## Arquitectura y entrenamiento

El modelo es un ajuste fino supervisado (o posiblemente con TRL, segun las etiquetas) sobre Llama 3 8B, un transformer decoder-only con atencion causal, 32 capas, 32 cabezas de atencion y embeddings de 4.096 dimensiones. El checkpoint de partida es la version cuantizada en 4 bits de Unsloth, pensada para reducir el consumo de VRAM durante el entrenamiento mediante QLoRA. La model card menciona que el entrenamiento fue "2x mas rapido con Unsloth", lo que confirma el uso de esa libreria de optimizacion, pero no aporta informacion sobre el numero de tokens, la composicion del dataset, el uso de RLHF/DPO ni hiperparametros.

No se documenta ninguna innovacion tecnica adicional (atencion lineal, decodificacion especulativa, modos de razonamiento, etc.). La etiqueta `text-generation-inference` sugiere compatibilidad con TGI, y `endpoints_compatible` indica que puede servirse en la infraestructura de Hugging Face. El tamano del repositorio (0,4 GB) es coherente con un adaptador o un checkpoint parcial en lugar de los pesos completos en precision alta.

## Capacidades

- Generacion de texto en ingles, heredada de Llama 3 8B.
- Razonamiento basico y respuesta a instrucciones, sujeto a la calidad del ajuste fino (no evaluada).
- Posible especializacion en triaje y clasificacion de seguridad, segun el nombre del modelo, aunque no se documenta el comportamiento concreto.
- Soporte de tool calling: no confirmado en la model card; el modelo base Llama 3 lo soporta, pero el ajuste fino puede haber degradado esta capacidad.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: limitadas al ingles segun la etiqueta de idioma.
- Capacidades especiales (vision, audio, thinking mode): no disponibles.

## Casos de uso

- Triaje de contenido en pipelines de moderacion: el modelo podria clasificar o priorizar casos dudosos antes de la revision humana, aprovechando su supuesta especializacion; requiere validacion previa con datos propios.
- Filtrado de solicitudes en un chatbot: usar el modelo como primera capa para decidir si una peticion debe escalarse o rechazarse, con contexto de 8.192 tokens del modelo base.
- Generacion de resumenes de incidentes de seguridad: convertir registros de alertas en textos breves en ingles para equipos de operaciones.
- Prototipado rapido de clasificadores de texto: al ser un ajuste fino ligero (0,4 GB), puede desplegarse en una unica GPU consumer para experimentar con prompts y temperaturas.
- Evaluacion comparativa de tecnicas de fine-tuning: util como caso de estudio de QLoRA con Unsloth frente a otros ajustes sobre Llama 3.
- Base para un segundo ajuste fino: al estar en safetensors y con licencia Apache 2.0, puede reentrenarse con datos propios de un dominio especifico sin restricciones legales.
- Servicio de inferencia en TGI: la etiqueta `text-generation-inference` permite desplegarlo en un endpoint compatible con la API de Hugging Face.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; como referencia, un modelo de 8.000 millones de parametros en FP16 requiere aproximadamente 16 GB de VRAM, en 8 bits unos 8-9 GB y en 4 bits unos 5-6 GB, mas el espacio para el contexto.
- GPU recomendadas: no especificadas por el autor. Por tamano, cabria en A100 40 GB, H100 80 GB, RTX 4090 (24 GB) y, con cuantizacion 4 bits, en RTX 3090/4080 (16 GB) o incluso GPUs de 8 GB con contexto reducido.
- Cabe en GPU consumer: si, previsiblemente en RTX 3060 12 GB o superiores con cuantizacion; no confirmado por el autor.
- Opciones de despliegue: transformers, text-generation-inference (TGI), y previsiblemente llama.cpp/Ollama tras conversion a GGUF, aunque no se distribuyen esos formatos.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| kniska/guard-triage-llm-v2 | 8.000 M | no disponible (base: 8.192) | Apache 2.0 | Hugging Face, 0 descargas | Ajuste fino no evaluado |
| meta-llama/Meta-Llama-3-8B-Instruct | 8.000 M | 8.192 | Llama 3 Community License | Ampliamente disponible | Modelo base oficial con evaluaciones publicas |
| mistralai/Mistral-7B-Instruct-v0.3 | 7.000 M | 32.768 | Apache 2.0 | Ampliamente disponible | Alternativa Apache 2.0 con contexto mayor |
| google/gemma-2-9b-it | 9.000 M | 8.192 | Gemma Terms of Use | Ampliamente disponible | Rendimiento superior en benchmarks publicos |

## Limitaciones y advertencias

- No hay evaluacion publica: se desconoce si el ajuste fino mejora o degrada las capacidades del Llama 3 base.
- Riesgo de alucinacion inherente a los modelos de 8.000 millones de parametros, agravado por la falta de datos de entrenamiento documentados.
- Idiomas: solo ingles etiquetado; el rendimiento en castellano no esta garantizado.
- Sesgos: no se documenta ningun proceso de mitigacion; hereda los sesgos de Llama 3 y del dataset de ajuste, que se desconoce.
- Licencia Apache 2.0 permite uso comercial, pero el modelo base Llama 3 tiene su propia licencia comunitaria; conviene verificar la compatibilidad legal de la cadena de derivacion.
- Repositorio sin descargas ni mantenimiento visible: riesgo de abandono y falta de soporte.
- No se garantiza compatibilidad con tool calling ni con modos de agente tras el ajuste fino.
- El checkpoint de partida esta cuantizado en 4 bits; la calidad final puede verse afectada por esa cuantizacion previa.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/kniska/guard-triage-llm-v2
- Modelo base: https://huggingface.co/unsloth/llama-3-8b-bnb-4bit
- Repositorio de Unsloth: https://github.com/unslothai/unsloth
- Modelo original Llama 3 8B: https://huggingface.co/meta-llama/Meta-Llama-3-8B
