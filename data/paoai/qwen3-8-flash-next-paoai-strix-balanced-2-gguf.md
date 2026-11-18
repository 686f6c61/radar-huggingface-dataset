# PaoAI/Qwen3.8-Flash-Next-PaoAI-STRIX-BALANCED-2-GGUF

## Resumen

Qwen3.8-Flash-Next-PaoAI-STRIX-BALANCED-2-GGUF es una cuantizacion comunitaria del modelo Qwen3.8-Flash-Next de Qwen, publicada por PaoAI. Se trata de un modelo de lenguaje de arquitectura Mixture-of-Experts (MoE) con 176.943.899.520 parametros totales, disenado originalmente en BF16 (aproximadamente 360 GB) y comprimido aqui a un unico archivo GGUF de 78,27 GB (3,54 bits por peso) para que quepa en una sola maquina AMD Strix Halo (Ryzen AI Max+ 395, gfx1151).

El objetivo del autor es ofrecer una cuantizacion medida y verificada, no solo empaquetada: el modelo se evalua con decodificacion especulativa MTP activa, comprobacion de integridad a todas las profundidades hasta la ventana completa de 262.144 tokens, y un examen de codificacion con codigo ejecutado. La version BALANCED-2.1 mueve los pesos densos y la cabeza de salida de F16 a Q8_0, reduciendo el tamano de 80,78 GB a 78,27 GB con una perplejidad practicamente identica (4,6695 a 4,6618 en wikitext-2 con contexto de 8K).

Es relevante porque demuestra que un modelo MoE de casi 177.000 millones de parametros puede ejecutarse en hardware de consumo profesional de gama alta (una unica caja Strix Halo) con velocidades de lectura de 301 a 870 tokens por segundo y escritura de 17,5 a 46,7 tokens por segundo, manteniendo la ventana completa de 256K tokens. La licencia es qwen-community-1.0, lo que impone condiciones especificas para uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE hibrido con atencion lineal, tabla n-gram PLE y cabeza NextN/MTP; 48 bloques y 512 expertos |
| Parametros totales | 176.943.899.520 |
| Parametros activos | no disponible |
| Longitud de contexto | 262.144 tokens (ventana completa verificada) |
| Tipos de cuantizacion | Mezcla por organos: Q8_0 (pesos densos y cabeza de salida en 2.1), IQ2_XXS con imatrix (expertos gate/up), IQ4_NL (expertos down y tabla PLE), F32/F16/BF16 (embeddings, normas, router, indexador de atencion, compuertas pequenas); media de 3,54 bits por peso |
| Idiomas soportados | en |
| Licencia | qwen-community-1.0 (etiquetada como "other" en Hugging Face) |
| Formato de pesos | GGUF (llama.cpp) |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-Flash-Next es un transformer MoE hibrido de 48 bloques con 512 expertos, atencion lineal combinada con atencion completa, una tabla n-gram PLE (lookup de gran tamano) y una cabeza NextN/MTP para decodificacion especulativa. La cuantizacion de PaoAI preserva la precision en los componentes que procesan el prompt y rastrean el contexto (atencion, experto compartido, salida de atencion lineal, pesos de mezcla de capas o hyper-connection) mediante Q8_0, mientras comprime agresivamente los expertos gate/up a IQ2_XXS con imatrix, los expertos down a IQ4_NL y la tabla PLE a IQ4_NL. Los embeddings de tokens, normas, router, indexador de atencion y compuertas pequenas se mantienen en F32, F16 o BF16.

No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni el proceso de alineacion (RLHF/DPO) del modelo base en la informacion proporcionada. La innovacion tecnica destacable de esta publicacion es la cuantizacion selectiva por organos con imatrix, la integracion de una sidecar MTP en Q8_0 para que la decodificacion especulativa sea rentable, y la verificacion de integridad a lo largo de toda la ventana de 262.144 tokens. La idea de almacenar los pesos densos en 8 bits se atribuye a Halogen en la model card.

## Capacidades

- Generacion de texto conversacional y no conversacional en ingles.
- Razonamiento multi-paso con modo de pensamiento (thinking budget configurable, por ejemplo 1.500 tokens en el examen de codificacion).
- Generacion y analisis de codigo: implementacion de maquinas de estado, trazado de codigo enganoso, deteccion de bugs plantados y escritura de codigo concurrente (ring buffer thread-safe bajo prueba de estres de 5.000 operaciones).
- Decodificacion especulativa mediante cabeza MTP con sidecar Q8_0 (4 tokens borrador por defecto en las pruebas del autor).
- Procesamiento de contextos largos de hasta 262.144 tokens con integridad verificada.
- Capacidad multilingue limitada: la model card solo declara ingles.
- No se documentan capacidades de vision, audio, tool calling ni function calling en la informacion disponible.

## Casos de uso

- Asistente de codificacion en local: el modelo puede leer codigo enganoso, rastrear su ejecucion y detectar bugs plantados, como demuestra el examen "chain test" con medianas de 100/100 en las tres tareas; adecuado para entornos donde el codigo no puede salir de la maquina.
- Revision de codigo concurrente: la prueba de ring buffer thread-safe con 5.000 operaciones de estres muestra que el modelo puede generar codigo multihilo correcto, util para pipelines de revision automatizada en CI/CD.
- Analisis de repositorios completos: con 262.144 tokens de contexto verificados, puede ingerir grandes bases de codigo o documentacion tecnica y responder preguntas que requieren correlacionar fragmentos distantes.
- Despliegue en una unica maquina Strix Halo: con 78,27 GB en un solo archivo y sin flags de offload, es viable para estudios de desarrollo o investigadores que quieran un modelo de 177B en hardware de sobremesa profesional.
- Prototipado de agentes con razonamiento extendido: el modo de pensamiento con presupuesto configurable permite tareas de planificacion ("spec") a velocidades de 23,7 a 29,1 tokens por segundo en la version 2.1.
- Generacion de documentacion tecnica larga: la fase "publish" del examen alcanza de 29,0 a 38,6 tokens por segundo, adecuada para producir documentos extensos de forma local.
- Investigacion sobre cuantizacion: la publicacion incluye la receta completa por organos, curvas de perplejidad y barridos de contexto, lo que la convierte en material de referencia para estudiar el impacto de la cuantizacion selectiva en modelos MoE.

## Benchmarks y rendimiento

| Prueba | Metrica | Version 2.1 (actual) | Version 2 (anterior) |
|---|---|---|---|
| Automaton (reglas novedosas + traza de estado) | Mediana de 3 ejecuciones | 100 | 100 |
| Hunt (codigo enganoso + bug plantado) | Mediana de 3 ejecuciones | 100 | 60 |
| Ring buffer (codigo multihilo bajo estres) | Mediana de 3 ejecuciones | 100 | 100 |
| Examen de codificacion completo | Mediana por tarea | 100 | 86,7 |
| Perplejidad wikitext-2 (contexto 8K) | Perplejidad | 4,6618 | 4,6695 |
| Lectura (prefill) | tokens/s | 301–870 | no disponible |
| Escritura (decode) | tokens/s | 17,5–46,7 | no disponible |

Velocidad de escritura por fase (tokens/s, version 2.1): spec 23,7–29,1; hunt 33,5–38,1; automaton 39,9–40,7; ring buffer 27,3–30,8; publish 29,0–38,6. No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM/espacio estimado: 78,27 GB para el archivo BALANCED-2.1; 80,78 GB para el archivo BALANCED-2 anterior. Requiere memoria unificada o VRAM suficiente para el archivo completo mas el sidecar MTP en Q8_0.
- Hardware objetivo: AMD Strix Halo (Ryzen AI Max+ 395, gfx1151) con memoria unificada; el autor lo ejecuta en una sola caja sin flags de offload.
- GPU recomendadas: no se documentan alternativas NVIDIA en la informacion disponible; el motor recomendado es ROCm/HIP (rama de llama.cpp de pwilkin con un parche de PaoAI) o, para la version anterior, Vulkan.
- Cabe en GPU de consumo: no en GPUs de consumo convencionales con 24 GB o menos; el modelo esta pensado para hardware de memoria unificada de gama alta.
- Opciones de despliegue: llama.cpp (motor ROCm/HIP recomendado; tambien Vulkan para el archivo anterior), formato GGUF compatible con endpoints.
- Latencia y throughput: lectura de 301 a 870 tokens/s y escritura de 17,5 a 46,7 tokens/s segun profundidad de contexto y tipo de respuesta; la version 2.1 es entre 2,0 y 2,6 veces mas rapida en lectura que la anterior a todas las profundidades.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.8-Flash-Next-PaoAI-STRIX-BALANCED-2.1 (este) | 176,9B totales (MoE) | 262.144 | qwen-community-1.0 | GGUF 78,27 GB | Hugging Face, llama.cpp |
| Qwen/Qwen3.8-Flash-Next (base) | 176,9B totales (MoE) | no disponible | qwen-community-1.0 | BF16 (~360 GB) | Hugging Face |
| PaoAI/Qwen3.8-Flash-Next-PaoAI-STRIX-GGUF (Q2-1.0 y Q4-1.0) | 176,9B totales (MoE) | no disponible | qwen-community-1.0 | GGUF | Hugging Face, motor PaoAI 1.0 |

No se dispone de datos de benchmarks comparativos con otros modelos de la misma categoria en la informacion proporcionada.

## Limitaciones y advertencias

- Solo declara soporte de ingles; no se garantiza un rendimiento correcto en castellano u otros idiomas.
- La cuantizacion agresiva de los expertos (IQ2_XXS) puede degradar tareas que dependan de conocimiento factual fino, aunque la perplejidad medida se mantiene estable.
- Riesgo de alucinacion inherente a los modelos de lenguaje; no se han publicado evaluaciones de factualidad.
- Problema conocido en el motor PaoAI v1 y versiones antiguas de llama.cpp: ocasionalmente una respuesta se corta a mitad; se corrige con regenerar y esta resuelto en llama.cpp (PR #29161) y en el motor PaoAI 1.0.
- La licencia qwen-community-1.0 impone condiciones especificas para uso comercial; es necesario revisar el archivo LICENSE antes de desplegar en produccion.
- Cuantizacion comunitaria no afiliada al equipo de Qwen; el soporte y las garantias dependen del autor.
- El modelo requiere hardware con memoria unificada de al menos ~80 GB; no es viable en GPUs de consumo convencionales.
- La model card no documenta capacidades de tool calling, vision ni audio, por lo que no deben asumirse en produccion.

## Enlaces

- Hugging Face: https://huggingface.co/PaoAI/Qwen3.8-Flash-Next-PaoAI-STRIX-BALANCED-2-GGUF
- Version recomendada por el autor (Q2-1.0 y Q4-1.0): https://huggingface.co/PaoAI/Qwen3.8-Flash-Next-PaoAI-STRIX-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Repositorio llama.cpp (PR #29161): https://github.com/ggml-org/llama.cpp/pull/29161
- Rama de llama.cpp para Strix Halo (pwilkin): no disponible como URL directa en la informacion proporcionada
