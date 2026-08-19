# peculiar-ragdoll/Nail-Qwen3.6-35B-A3B-MLX

## Resumen

Nail-Qwen3.6-35B-A3B-MLX es una cuantización 4-bit dinámica del modelo Qwen3.6-35B-A3B, realizada por el autor peculiar-ragdoll con la librería MLX para Apple Silicon. El modelo base es un transformer de mezcla de expertos (MoE) con 35 mil millones de parámetros totales y 3 mil millones activos, desarrollado por Qwen. Nail incorpora un chat template modificado que fuerza un prompt de concisión al final de cualquier system prompt, con el objetivo de reducir el sobre-pensamiento, los fallos de tool calling y las respuestas verbosas.

Su relevancia actual radica en que ofrece un equilibrio entre velocidad de respuesta, precisión y uso eficiente de memoria: con una ventana de contexto nativa de 262.144 tokens y KV cache en 8-bit, puede ejecutarse en equipos con 24 GB de RAM unificada, algo poco común para modelos de su tamaño. Está pensado para desarrolladores que trabajan con agentes de código, conversaciones multi-turno y tareas de razonamiento en entornos con recursos limitados.

La licencia es Apache-2.0, lo que permite uso comercial sin restricciones adicionales. El modelo está disponible en formato safetensors para MLX y también en GGUF para otras plataformas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de mezcla de expertos (MoE) basado en Qwen3.6-35B-A3B |
| Parametros totales | 35B (MoE, 3B activos) |
| Parametros activos | 3B |
| Longitud de contexto | 262.144 tokens (256k) |
| Tipos de cuantizacion | 4-bit dinamico (Unsloth Dynamic); version GGUF disponible |
| Idiomas soportados | ingles, chino |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (MLX), GGUF |

## Arquitectura y entrenamiento

El modelo base Qwen3.6-35B-A3B es un MoE con 35B parametros totales y 3B activos por token, lo que reduce el coste computacional en inferencia. Nail es una cuantizacion 4-bit dinamica realizada por Unsloth, que preserva la calidad del modelo original reduciendo el tamano en disco a aproximadamente 91.9 GB (aunque el archivo safetensors contiene 6.184.301.936 parametros cuantizados). El autor ha modificado el chat template para anadir un prompt de sistema fijo que insta al modelo a responder de forma directa y concisa, sin preambulos ni relleno, manteniendo siempre la correccion y las advertencias necesarias. No se han publicado detalles sobre el entrenamiento adicional; el modelo se basa en los pesos preentrenados de Qwen3.6.

La innovacion principal es el prompt de concision incrustado en el template, que se aplica en cada llamada, junto con el uso de KV cache en 8-bit para reducir el consumo de memoria en conversaciones largas. El modelo soporta capacidades multimodales (image-text-to-text), aunque la documentacion no detalla la arquitectura de vision.

## Capacidades

- Generacion de texto, razonamiento, codigo y matematicas, heredadas de Qwen3.6.
- Soporte de tool calling y function calling, optimizado para agentes de codigo.
- Capacidad de razonamiento multi-paso y trabajo autonomo en tareas de ingenieria de software.
- Multilingue, con soporte principal de ingles y chino.
- Capacidades multimodales: acepta imagenes y texto como entrada y genera texto (pipeline image-text-to-text).
- Modo de pensamiento eficiente: el prompt de concision reduce el sobre-pensamiento y acelera la respuesta sin sacrificar precision.
- Ventana de contexto larga de 256k tokens, adecuada para sesiones extensas.

## Casos de uso

- Atencion al cliente automatizada: con 256k tokens de contexto y soporte multi-turno, puede gestionar conversaciones largas manteniendo el historial completo y respondiendo con precision.
- Generacion de codigo en produccion: su soporte de tool calling y su rapidez lo hacen adecuado para integrarse en pipelines de CI/CD, generando parches o revisiones de codigo en tiempo real.
- Agentes autonomos de software engineering: el modelo puede operar dentro de agentes como Pi o Claude Code, resolviendo problemas de repositorios reales con rapidez (segun las pruebas del autor, supera a Opus4.8 medium en primer intento en un repositorio SWE Live).
- Asistentes de conversacion multi-turno: su bajo uso de memoria por token en contexto permite sesiones largas en hardware limitado, como Macs con 24 GB de RAM.
- Analisis de documentos extensos: la ventana de 256k tokens permite procesar libros, informes o codigo fuente completo en una sola pasada.
- Despliegue en Apple Silicon: al estar optimizado para MLX, es ideal para aplicaciones locales en Macs, con velocidades de 740 tokens/s de prefill y 56.9 tokens/s de generacion en un M4 Pro.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card incluye graficas comparativas (MMLU-Pro, Claw-Eval multi_turn, SE Sprint y GPQA-Diamond) que muestran que Nail iguala en precision a modelos densos de 27B mientras es 2-5 veces mas rapido en tiempo de respuesta, y supera en calidad de conversacion multi-turno incluso cuando esos modelos usan cuantizaciones superiores. Sin embargo, no se proporcionan valores numericos concretos en el texto accesible. En cuanto a velocidad, la busqueda web indica 740.3 tokens/s de prefill y 56.9 tokens/s de generacion en un M4 Pro de 16 nucleos con 48 GB, medidos con oMLX.

## Requisitos de hardware

- VRAM estimada: 21.6 GB segun LLM Explorer; la model card afirma que funciona en 24 GB de RAM unificada con KV cache en 8-bit.
- GPU recomendadas: Apple Silicon (M1/M2/M3/M4) con MLX; para otras plataformas se puede usar la version GGUF con llama.cpp o similares.
- En consumer GPU: no se indica compatibilidad con NVIDIA, pero la version GGUF podria ejecutarse en GPUs con al menos 24 GB de VRAM.
- Opciones de despliegue: MLX, oMLX, llama.cpp (GGUF), Ollama (hay una entrada en ollama.com para qwen3.6:35b-a3b).
- Latencia y throughput: 740.3 tokens/s de prefill y 56.9 tokens/s de generacion en M4 Pro (16c, 48 GB) segun omlx.ai.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Velocidad (TG tok/s) | Memoria |
|---|---|---|---|---|---|---|
| Nail-Qwen3.6-35B-A3B-MLX | 35B MoE (3B activos) | 256k | 4-bit dinamico | Apache-2.0 | 56.9 (M4 Pro) | ~21.6 GB |
| Qwen3.6-27B (dense) | 27B denso | 256k | 6-bit (segun el autor) | Apache-2.0 | no disponible | ~21 GB (segun el autor, mismo footprint) |
| Dagger-Qwen3.6-27B-MLX | 27B denso | 256k | 6-bit | Apache-2.0 | no disponible | ~21 GB |

Segun el autor, Nail es 2-5 veces mas rapido que los modelos densos de 27B en tiempo de respuesta, igualando su precision en razonamiento y agentes. Sin embargo, en tareas de resistencia (numero de preguntas encadenadas dentro del contexto), Dagger gana por 2.4x (110 preguntas GPQA vs 45 de Nail) porque Nail consume mas tokens por pregunta (5.777 vs 2.380). En conversaciones multi-turno, Nail supera a ambos en calidad y velocidad, aunque Dagger mantiene mas turnos dentro de 100k tokens (57 vs 35).

## Limitaciones y advertencias

- Consumo de tokens por pregunta elevado: en tareas de razonamiento como GPQA-Diamond, Nail gasta 5.777 tokens por pregunta, lo que reduce el numero de preguntas que caben en la ventana de contexto (45 vs 110 de Dagger).
- Idiomas limitados: solo ingles y chino; no se garantiza buen rendimiento en otros idiomas.
- Cuantizacion 4-bit: puede introducir degradacion de precision en tareas muy sensibles, aunque el autor afirma paridad con modelos de mayor cuantizacion.
- Dependencia de MLX: la version safetensors requiere Apple Silicon; para otras plataformas hay que usar GGUF, que puede tener rendimiento distinto.
- Sin informacion sobre sesgos o riesgos de alucinacion especificos; al ser un modelo base de Qwen, puede heredar sesgos de sus datos de entrenamiento.
- El prompt de concision forzado puede omitir matices en respuestas si el modelo interpreta mal la instruccion de brevedad, aunque el prompt incluye la salvaguarda de mantener advertencias y correcciones.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/peculiar-ragdoll/Nail-Qwen3.6-35B-A3B-MLX
- Modelo base Qwen3.6-35B-A3B: https://huggingface.co/Qwen/Qwen3.6-35B-A3B
- Version GGUF: https://huggingface.co/peculiar-ragdoll/Nail-Qwen3.6-35B-A3B-GGUF
- Chat templates mejorados: https://huggingface.co/peculiar-ragdoll/Qwen-Sharp-Chat-Templates
- Entrada en Ollama: https://ollama.com/library/qwen3.6:35b-a3b
- Benchmarks en omlx.ai: https://omlx.ai/benchmarks/78ked94l
