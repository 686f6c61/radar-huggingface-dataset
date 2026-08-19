# peculiar-ragdoll/Nail-Qwen3.6-35B-A3B-GGUF-MTP

## Resumen

Nail-Qwen3.6-35B-A3B-GGUF-MTP es una cuantización GGUF en 4-bit del modelo Qwen3.6-35B-A3B de Qwen (Alibaba), preparada por el usuario peculiar-ragdoll. Se trata de un modelo de arquitectura MoE (Mixture of Experts) con 35 mil millones de parámetros totales y 3 mil millones activos por token, con una ventana de contexto nativa de 262 144 tokens. La versión MTP conserva los tensores de multi-token-prediction (nextn) que permiten decodificación especulativa en runtimes compatibles, acelerando la generación sin degradar la precisión.

El modelo resuelve el problema del "overthinking" y las respuestas verbosas en modelos de razonamiento, ofreciendo respuestas más rápidas y concisas manteniendo la exactitud. Incluye un chat template mejorado y un system prompt forzado que reducen fallos de tool calling y bucles de memoria. Su relevancia actual radica en que combina un tamaño reducido de parámetros activos con un contexto muy largo, lo que permite ejecutarlo en hardware de consumo (25 GB de RAM con KV cache en 8-bit) y alcanzar velocidades de inferencia altas en GPUs como la RTX 4090.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con Mixture of Experts (MoE) |
| Parametros totales | 35 mil millones (35B) |
| Parametros activos | 3 mil millones (3B) |
| Longitud de contexto | 262 144 tokens (256k) |
| Tipos de cuantizacion | GGUF 4-bit (Q4_K_M, segun tags) |
| Idiomas soportados | Ingles (en), chino (zh) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (con tensores MTP incluidos) |

## Arquitectura y entrenamiento

El modelo base Qwen3.6-35B-A3B es un transformer con arquitectura MoE, donde solo 3B de los 35B parametros se activan por token. Esto reduce el coste computacional por inferencia manteniendo una capacidad global alta. La version Nail es una cuantizacion GGUF 4-bit realizada por Unsloth, que conserva los tensores de multi-token-prediction (MTP) para decodificacion especulativa. Sobre esta base, peculiar-ragdoll ha aplicado un chat template mejorado y un system prompt forzado, disenados para reducir respuestas verbosas, fallos de tool calling y bucles de contexto. No se dispone de informacion detallada sobre los datos de entrenamiento del modelo original, ni sobre el proceso de cuantizacion mas alla de la herramienta utilizada.

## Capacidades

- Generacion de texto y razonamiento complejo, con especial enfasis en eficiencia temporal frente a modelos densos de tamano similar.
- Razonamiento agente (agentic coding): capaz de resolver problemas de ingenieria de software autonomamente, con soporte para tool calling y multi-step reasoning.
- Conversaciones multi-turno con contexto largo, manteniendo coherencia hasta 92 turnos y 262k tokens segun las pruebas del autor.
- Decodificacion especulativa mediante MTP: aceleracion de 1.25x a 1.35x en llama.cpp (con build reciente) y 1.5-2x en vLLM/SGLang.
- Multilingue: ingles y chino.
- Pipeline image-text-to-text, lo que sugiere capacidad de procesamiento multimodal (vision) aunque no se detalla en la documentacion.

## Casos de uso

- Desarrollo de software agente: el modelo puede operar como agente autonomo en repositorios reales, resolviendo issues de codigo con rapidez. Su velocidad de respuesta (frente a modelos densos) lo hace adecuado para iteraciones rapidas en entornos CI/CD.
- Asistentes de codigo en produccion: con soporte de tool calling y contexto de 256k, puede integrarse en IDEs o pipelines para generar, revisar y corregir codigo en multiples archivos.
- Atencion al cliente automatizada: su capacidad multi-turno y su menor consumo de contexto por turno permiten gestionar conversaciones largas sin agotar la ventana, incluso en hardware limitado.
- Razonamiento cientifico y tecnico: en benchmarks como GPQA-Diamond, mantiene precision en preguntas encadenadas, aunque con un coste de tokens por pregunta mayor que alternativas densas.
- Despliegue en hardware de consumo: con 25 GB de RAM (KV cache 8-bit) o 24 GB de VRAM, puede ejecutarse en una RTX 4090 o RX 7900 a ~120 tok/s, lo que lo hace viable para estaciones de trabajo individuales.
- Investigacion en eficiencia de inferencia: los tensores MTP permiten experimentar con decodificacion especulativa en llama.cpp y vLLM, midiendo aceleraciones reales en distintos workloads.

## Benchmarks y rendimiento

No se han publicado resultados numericos de benchmarks en la informacion disponible. El README incluye graficos comparativos (MMLU-Pro, Claw-Eval multi_turn, tareas de ingenieria de software agente) realizados en un Mac Studio M2 Ultra con 64 GB, pero no se proporcionan cifras exactas. Las comparaciones cualitativas indican que Nail iguala la precision de Qwen3.6-27b y su fine-tune ThinkingCap, pero con tiempos de respuesta significativamente menores. En pruebas de velocidad, se reporta ~1.35x de aceleracion con MTP en generacion de codigo (llama.cpp, M2 Ultra, Q4) y ~1.25x con configuracion por defecto.

## Requisitos de hardware

- VRAM estimada: 25 GB de RAM con KV cache en 8-bit para contexto completo; 24 GB de VRAM para una RTX 4090 o RX 7900 sin offloading parcial.
- GPU recomendadas: RTX 4090, RX 7900, Mac Studio M2 Ultra (64 GB) para pruebas locales.
- En consumer GPU: si, cabe en GPUs de 24 GB con cuantizacion 4-bit y KV cache 8-bit.
- Opciones de despliegue: llama.cpp (requiere build reciente b10362+ para MTP), vLLM, SGLang, MLX (version separada para Mac), Ollama (si soporta GGUF con MTP).
- Latencia y throughput: ~120 tok/s en RTX 4090 segun el autor; con MTP en llama.cpp se mide ~1.35x sobre la generacion sin especulacion.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Nail-Qwen3.6-35B-A3B (este) | 35B total, 3B activo | 256k | Apache 2.0 | GGUF 4-bit + MTP | Veloz, conciso, agente |
| Qwen3.6-27b (dense) | 27B | 256k | Apache 2.0 | GGUF | Mas lento, mas verboso |
| Dagger-Qwen3.6-27B | 27B | 256k | Apache 2.0 | MLX/GGUF | Denso, mejor en sesiones largas |
| ThinkingCap (fine-tune de 27b) | 27B | 256k | Apache 2.0 | GGUF | Razonamiento, pero mas lento |

Segun el autor, Nail supera a Qwen3.6-27b y ThinkingCap en tiempo de respuesta y calidad de conversacion multi-turno, aunque Dagger-27b gana en sesiones agente muy largas dentro de un unico contexto por su menor consumo de tokens por pregunta.

## Limitaciones y advertencias

- El razonamiento del modelo es verboso: gasta ~5777 tokens por pregunta en GPQA-Diamond, frente a 2380 de Dagger. Esto reduce el numero de preguntas encadenables dentro del contexto nativo (45 vs 110).
- MTP no esta soportado en las releases actuales de llama.cpp; requiere compilar desde fuente (b10362+). En runtimes sin soporte MTP, el rendimiento es identico al GGUF estandar.
- Idiomas limitados a ingles y chino; no se garantiza calidad en otros idiomas.
- La licencia Apache 2.0 permite uso comercial, pero el modelo base puede tener restricciones adicionales no documentadas en esta ficha.
- No se han publicado evaluaciones de sesgos o alucinaciones; se recomienda validar en dominios criticos.
- El pipeline image-text-to-text sugiere capacidades multimodales, pero no se documentan en el README; verificar antes de usar en tareas de vision.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/peculiar-ragdoll/Nail-Qwen3.6-35B-A3B-GGUF-MTP
- Modelo base: https://huggingface.co/Qwen/Qwen3.6-35B-A3B
- Cuantizacion MTP de Unsloth: https://huggingface.co/unsloth/Qwen3.6-35B-A3B-MTP-GGUF
- Version estandar (sin MTP): https://huggingface.co/peculiar-ragdoll/Nail-Qwen3.6-35B-A3B-GGUF
- Version MLX para Mac: https://huggingface.co/peculiar-ragdoll/Nail-Qwen3.6-35B-A3B-MLX
- Chat templates mejorados: https://huggingface.co/peculiar-ragdoll/Qwen-Sharp-Chat-Templates
- Modelo denso Dagger-27b: https://huggingface.co/peculiar-ragdoll/Dagger-Qwen3.6-27B-MLX
