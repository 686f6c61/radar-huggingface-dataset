# pekkAi/Glistening-Gem-31B-v2.1-NVFP4

## Resumen

Glistening-Gem-31B-v2.1-NVFP4 es una cuantización en formato NVFP4 (4 bits) del modelo de lenguaje Glistening-Gem-31B-v2.1, un merge creado por el usuario pekkAi a partir de varios modelos basados en Gemma 4 31B. El merge combina TheDrummer/Artemis-31B-v1, zerofata/G4-MeroMero-v2-31B y llmfan46/gemma-4-Ortenzya-The-Creative-Wordsmith-31B-it-uncensored-heretic sobre la base oficial google/gemma-4-31B-it, con el objetivo de maximizar la creatividad y la calidad de la prosa. Esta versión NVFP4, generada con NVIDIA ModelOpt, reduce la huella de memoria del modelo para permitir su ejecución en GPUs con menos VRAM, manteniendo un comportamiento similar al original.

El modelo está pensado para tareas de escritura creativa, conversación y generación de texto con un estilo literario y poco repetitivo. Aunque hereda las capacidades multilingües de Gemma 4, la model card solo declara inglés como idioma soportado. El autor advierte que el modo thinking de Gemma 4 no funciona bien con este merge y que pueden aparecer artefactos ocasionales como palabras fusionadas o errores ortográficos. La licencia es Apache 2.0, lo que permite uso comercial sin restricciones adicionales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (Gemma 4 31B) |
| Parametros totales | 31B (nominal); el archivo safetensors reporta 16.629.725.036 parametros, posiblemente debido a la cuantizacion NVFP4 o a un error de metadatos |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible en la informacion; Gemma 4 base soporta hasta 256K tokens |
| Tipos de cuantizacion | NVFP4 (4 bits, este repo); existen versiones W8A16 y MLX-MXFP8 en otros repos |
| Idiomas soportados | Ingles (declarado en la model card) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (cuantizacion NVFP4) |

## Arquitectura y entrenamiento

El modelo es un merge de tres modelos derivados de Gemma 4 31B, combinados mediante mergekit sobre la base oficial google/gemma-4-31B-it. No se ha realizado entrenamiento adicional; la fusion de pesos busca potenciar la creatividad y la fluidez narrativa, tomando ingredientes de modelos especializados en escritura y conversacion. La cuantizacion NVFP4 se aplico posteriormente con NVIDIA ModelOpt, un formato de 4 bits optimizado para GPUs NVIDIA que reduce el uso de VRAM y acelera la inferencia. El autor indica que esta version v2.1 corrige problemas de la v2.0, que usaba una base exotica incompatible con el merge, y mejora la creatividad respecto a la v1.0.

## Capacidades

- Generacion de texto creativo: prosa, narrativa, dialogos y contenido literario con estilo variado.
- Conversacion multi-turno: adecuado para chatbots y asistentes con personalidad.
- Escritura asistida: redaccion, reescritura y ampliacion de textos.
- Roleplay y creacion de personajes: puede mantener voces y tonos diferenciados.
- No se confirma soporte de tool calling ni function calling en esta version.
- No se recomienda el modo thinking de Gemma 4; el autor advierte que la coherencia del razonamiento se ve afectada por el merge.
- El pipeline image-text-to-text sugiere posible capacidad multimodal, pero no esta confirmada en la documentacion del modelo.

## Casos de uso

- Escritura de ficcion: autores pueden usarlo para generar borradores de novelas, cuentos o poesia, aprovechando su estilo creativo y poco repetitivo.
- Creacion de guiones y dialogos: util para producciones audiovisuales o videojuegos, donde se necesitan conversaciones naturales y con matices.
- Asistentes de escritura para blogs y marketing: redaccion de articulos, eslóganes o contenido publicitario con un tono original.
- Chatbots de entretenimiento: desarrollo de personajes conversacionales para aplicaciones de roleplay o juegos de texto.
- Generacion de ideas y lluvia de ideas: el modelo puede proponer conceptos, tramas o enfoques alternativos para proyectos creativos.
- Edicion y mejora de textos: reescribir parrafos existentes para mejorar estilo, fluidez o impacto emocional.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No se dispone de datos de MMLU, HumanEval, GSM8K ni otras evaluaciones estandar para este modelo o sus versiones previas.

## Requisitos de hardware

- VRAM estimada: al ser cuantizacion NVFP4 (4 bits), los pesos del modelo de 31B ocupan aproximadamente 15-16 GB en memoria, aunque el tamano del repo es 20.5 GB (incluye overhead). Se recomienda al menos 20 GB de VRAM para inferencia con contexto moderado.
- GPUs recomendadas: NVIDIA RTX 4090 (24 GB), RTX 3090 (24 GB), A100 40 GB, H100 80 GB. En GPUs con 16 GB (como RTX 4080) podria funcionar con contexto reducido.
- Compatibilidad con consumer GPU: si, en tarjetas de 24 GB o superiores.
- Opciones de despliegue: al ser formato safetensors con cuantizacion NVFP4, es compatible con TensorRT-LLM y posiblemente con vLLM si soporta NVFP4. No se menciona compatibilidad con llama.cpp u Ollama.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Cuantizacion | Notas |
|---|---|---|---|---|---|
| Glistening-Gem-31B-v2.1-NVFP4 (este) | 31B | No disponible | Apache 2.0 | NVFP4 | Merge creativo, solo ingles |
| Glistening-Gem-31B-v1.0 (sophosympatheia) | 31B | No disponible | Apache 2.0 | No especificada | Version anterior, menos creativa segun el autor |
| google/gemma-4-31B-it | 31B | Hasta 256K | Apache 2.0 | FP16/BF16 | Modelo base, multimodal, 140+ idiomas |
| ReadyArt/Glistening-Gem-31B-v2.1-W8A16-PTQ | 31B | No disponible | Apache 2.0 | W8A16 | Mismo merge con cuantizacion de 8 bits |

La comparativa se basa en datos publicos; no hay benchmarks que permitan comparar rendimiento real.

## Limitaciones y advertencias

- Artefactos ocasionales: el modelo puede fusionar dos palabras o producir errores ortograficos, especialmente con samplers agresivos. El autor recomienda subir Min-P para mitigarlo.
- Modo thinking no recomendado: la creatividad del merge degrada la coherencia del razonamiento; no usar el modo thinking de Gemma 4.
- Solo ingles: no se garantiza calidad en otros idiomas, aunque Gemma 4 base es multilingue.
- Contenido no apto para todos los publicos: el tag "not-for-all-audiences" y la inclusion de un modelo "uncensored" sugieren que puede generar contenido explicito o sensible.
- La cuantizacion NVFP4 puede introducir una ligera perdida de calidad respecto a la version en FP16, aunque no se han publicado evaluaciones.
- No se ha verificado el soporte de tool calling ni funciones de agente en este merge.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/pekkAi/Glistening-Gem-31B-v2.1-NVFP4
- Modelo base Gemma 4 31B: https://huggingface.co/google/gemma-4-31B-it
- Ingrediente TheDrummer/Artemis-31B-v1: https://huggingface.co/TheDrummer/Artemis-31B-v1
- Ingrediente zerofata/G4-MeroMero-v2-31B: https://huggingface.co/zerofata/G4-MeroMero-v2-31B
- Ingrediente llmfan46/gemma-4-Ortenzya-The-Creative-Wordsmith-31B-it-uncensored-heretic: https://huggingface.co/llmfan46/gemma-4-Ortenzya-The-Creative-Wordsmith-31B-it-uncensored-heretic
- Version original v1.0: https://huggingface.co/sophosympatheia/Glistening-Gem-31B-v1.0
- Cuantizacion W8A16 alternativa: https://huggingface.co/ReadyArt/Glistening-Gem-31B-v2.1-W8A16-PTQ
- Cuantizacion MLX-MXFP8: https://huggingface.co/beezu/Glistening-Gem-31B-v2.1-mlx-mxfp8
- Pagina oficial de Gemma 4: https://deepmind.google/models/gemma/gemma-4/
