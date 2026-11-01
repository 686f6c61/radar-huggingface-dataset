# grpdxr/Muse-Glimmer-30B-PL-GGUF

## Resumen

Muse-Glimmer-30B-PL-GGUF es una cuantización en formato GGUF del modelo base meta-models/Muse-Glimmer-30B, publicada por el usuario grpdxr. No se trata de un fine-tune: los pesos son los del modelo original, pero reorganizados con una asignación de bits por tensor y una importance matrix ponderada hacia texto polaco y trazas de razonamiento. El objetivo es ofrecer un modelo de aproximadamente 30.000 millones de parámetros (27.854.794.240 reales) en un fichero de 10,54 GB que quepa en GPUs de 12 GB y que rinda en polaco y razonamiento cerca de un Q4 completo.

El modelo está pensado para servir dos ranuras paralelas de 64K tokens en unos 10,9 GB de VRAM, lo que lo hace viable en tarjetas consumer de gama media-alta. La model card reporta pruebas propias (no benchmarks estándar) sobre conversaciones multi-turno en polaco, resolución de problemas lógicos y preguntas sobre transcripciones de llamadas comerciales. La licencia es Apache 2.0 y los idiomas declarados son polaco e inglés.

La relevancia actual radica en la compresión agresiva: un modelo de casi 28.000 millones de parámetros en ~2,8 bits efectivos con pérdida de fidelidad medida mediante KL divergence frente al Q8_0. El autor documenta el layout por tensor, el proceso de cuantización con llama-quantize y las métricas de VRAM y velocidad en una RTX 3090, lo que facilita la reproducibilidad y la comparación con otras cuantizaciones del mismo modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (detalles no disponibles en la informacion proporcionada; se infiere del modelo base) |
| Parametros totales | 27.854.794.240 |
| Parametros activos | no disponible |
| Longitud de contexto | 64K tokens por ranura (dos ranuras paralelas de 64K soportadas) |
| Tipos de cuantizacion | IQ2 (~2,8 bits, fichero principal de 10,54 GB) e IQ3 (11,95 GB); layout mixto por tensor con IQ2_S, IQ3_XXS e IQ3_* |
| Idiomas soportados | pl, en |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (llama.cpp) |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna del modelo base meta-models/Muse-Glimmer-30B más allá de que es un transformer de aproximadamente 28.000 millones de parámetros con atención de ventana deslizante en 3 de cada 4 capas (ventana de 2048 tokens) y solo 2 cabezas KV, lo que reduce drásticamente el coste de la caché KV y permite dos ranuras de 64K con poco incremento de VRAM. No se especifican en la informacion proporcionada el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO.

La innovación técnica de esta ficha no está en el entrenamiento sino en la cuantización: se parte del Q8_0 de unsloth/Muse-Glimmer-30B-GGUF y se aplica llama-quantize con una importance matrix construida a partir de texto polaco y trazas de razonamiento propias (170 × 4096 tokens), junto con un layout de bits por tensor (FFN gate/up en IQ2_S o IQ3_XXS, FFN down en IQ3_XXS o IQ3_*, etc.). El resultado es un fichero de 10,54 GB que, según el autor, mantiene el rendimiento en polaco y razonamiento cerca del Q4_K_M pese a tener una KL divergence mayor que las cuantizaciones de unsloth.

## Capacidades

- Generación de texto conversacional en polaco e inglés, con soporte de conversaciones multi-turno.
- Razonamiento lógico y matemático: problemas de lógica, cálculo de totales de facturas, plazos legales, probabilidades y análisis de registros extensos (~10k tokens).
- Comprensión de documentos largos en polaco: preguntas sobre documentos de 18k caracteres y transcripciones de llamadas de 12-16 minutos.
- Manejo de premisas falsas y preguntas de tipo "no está en la llamada", según las pruebas de transcripciones del autor.
- Modo de razonamiento (reasoning traces) evaluado por el autor con problemas que requieren cálculo verificable por código.
- Ejecución en llama.cpp estándar con soporte de dos ranuras paralelas de 64K tokens.
- Compatibilidad con endpoints (tag endpoints_compatible) para despliegue como servicio.
- No se documentan en la informacion proporcionada capacidades de tool calling, function calling, agentes multi-paso, visión ni audio.

## Casos de uso

- Atención al cliente en polaco: el modelo puede gestionar conversaciones multi-turno con contexto largo gracias a sus dos ranuras de 64K tokens, adecuado para consultas que requieren recordar el hilo completo de una reclamación o planificación de viaje.
- Análisis de documentos legales o administrativos en polaco: responder preguntas sobre contratos o escritos de 18k caracteres, con un 100% de acierto en preguntas documentales según las pruebas del autor frente al 70% de Bielik.
- Procesamiento de transcripciones de llamadas comerciales: extraer hechos, cálculos, atribuciones de quién dijo qué y detectar premisas falsas en grabaciones de 12-16 minutos, con 71 de 72 preguntas correctas en el fichero IQ2.
- Asistente de razonamiento para cálculo de facturas y plazos: resolución de problemas con respuesta verificable por código (totales, vencimientos legales), con 18,3 de 20 problemas resueltos en IQ2.
- Despliegue en estaciones de trabajo con GPU de 12 GB: servir dos sesiones concurrentes de 64K en 10,9 GB de VRAM, útil para pequeños equipos que necesitan un asistente local sin depender de la nube.
- Prototipado y evaluación de cuantizaciones: como referencia reproducible para comparar layouts mixtos y importance matrices en polaco, dado que el autor publica KL divergence y métricas de VRAM.
- Generación de texto en inglés y polaco en pipelines de llama.cpp: integración en herramientas de línea de comandos o servicios compatibles con endpoints para tareas de generación y resumen.

## Benchmarks y rendimiento

Los datos siguientes son pruebas propias del autor, no benchmarks estándar, y solo son comparables entre los modelos de la misma tabla (misma máquina, mismo build de llama.cpp b11028, KV cache q8_0, temperatura 1.0, top-p 0.95, top-k 64, RTX 3090).

| Modelo | Fichero | VRAM 1 ranura × 64K | VRAM 2 ranuras × 64K | Polish score | Razonamiento (de 20) | Transcripciones (de 72) |
|---|---|---|---|---|---|---|
| Este modelo, IQ2 | 10,54 GB | 10.349 MiB | 10.873 MiB | 93,5 (4 rondas) | 18,3 | 71 |
| Este modelo, IQ3 | 11,95 GB | 11.697 MiB | 12.221 MiB | 92,5 | 19,0 | 68 |
| unsloth UD-IQ3_XXS (referencia) | 13,13 GB | no disponible | 13.019 MiB | 93 | 17,5 | 70 |
| Muse-Glimmer-30B Q4_K_M (referencia, 1 ranura) | 16,76 GB | no disponible | no disponible | 97 | 18,5 | 69 |
| Saluki (Qwen3.8-27B IQ2 mix, referencia) | 7,90 GB | no disponible | 13.097 MiB | 89,5 | ~13 | no disponible |
| Bielik-11B-v3.0-Instruct Q8_0 (referencia polaca) | 11,87 GB | no disponible | 18.630 MiB (2 × 32K) | 87,5 | 4,5 | 66 |
| Bielik-11B-v3.0-Instruct Q4_K_M | 6,72 GB | no disponible | 13.800 MiB (2 × 32K) | 85,5 | 3,3 | 66 |
| PLLuM-12B-chat-2512 Q8_0 (referencia polaca) | 13,1 GB | no disponible | 23.544 MiB | 80 | 1,5 | 58 |
| Qwen3.8-27B-PL del mismo autor (2,5 bits, MTP drafter) | 9,56 GB | no disponible | 14.241 MiB | 90,6 | 18,0 | 71 |

Fidelidad al modelo completo (KL divergence frente a Muse-Glimmer-30B Q8_0, 8 × 4096 tokens por texto; media KLD y coincidencia del token más probable):

| Fichero | Texto de razonamiento | Texto polaco |
|---|---|---|
| Q4_K_M | 0,0078 / 97,8% | 0,0187 / 95,1% |
| unsloth UD-IQ3_XXS | 0,0198 / 96,3% | 0,0557 / 91,7% |
| unsloth UD-IQ2_M | 0,0278 / 95,7% | 0,0806 / 90,4% |
| Este modelo, IQ3 | 0,0269 / 95,9% | 0,0752 / 90,6% |
| Este modelo, IQ2 | 0,0492 / 94,6% | 0,138 / 87,1% |

Velocidad: aproximadamente 38 tokens/s por flujo con ambas ranuras ocupadas en una RTX 3090, sin modelo draft. El autor indica que una variante más pequeña (9,76 GB) bajó a Polish 90 y razonamiento 15,2, por lo que no la conservó.

## Requisitos de hardware

- VRAM estimada para inferencia: 10.349 MiB con una ranura de 64K y 10.873 MiB con dos ranuras de 64K ocupadas para el fichero IQ2; 11.697 MiB y 12.221 MiB respectivamente para el IQ3.
- GPU recomendadas: RTX 3090 (mediciones del autor), GPUs de 12 GB o más para el IQ2; el IQ3 requiere algo más de margen.
- Cabe en GPU consumer: sí, el IQ2 está diseñado para tarjetas de 12 GB con margen; el IQ3 también cabe en 12 GB según las cifras de VRAM reportadas.
- Opciones de despliegue: llama.cpp estándar (llama-quantize, llama-perplexity, llama-server), con soporte de endpoints compatibles; no se documentan en la informacion proporcionada otras opciones como vLLM, Ollama o TGI.
- Latencia y throughput: unos 38 tokens/s por flujo con dos ranuras ocupadas en RTX 3090, sin modelo draft.
- La caché KV es reducida gracias a la ventana deslizante de 2048 tokens en 3 de cada 4 capas y a las 2 cabezas KV del modelo base.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento (pruebas del autor) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Muse-Glimmer-30B-PL IQ2 (este modelo) | ~27,85B | 64K por ranura, 2 ranuras | Polish 93,5; razonamiento 18,3/20; transcripciones 71/72 | Apache 2.0 | GGUF en HuggingFace, 10,54 GB |
| Muse-Glimmer-30B Q4_K_M | ~27,85B | no disponible | Polish 97; razonamiento 18,5/20; transcripciones 69/72 | Apache 2.0 (modelo base) | GGUF, 16,76 GB |
| unsloth UD-IQ3_XXS | ~27,85B | no disponible | Polish 93; razonamiento 17,5/20; transcripciones 70/72 | Apache 2.0 (modelo base) | GGUF, 13,13 GB |
| Bielik-11B-v3.0-Instruct Q8_0 | ~11B | 32K (ventana entrenada) | Polish 87,5; razonamiento 4,5/20; transcripciones 66/72 | no disponible en la informacion proporcionada | GGUF, 11,87 GB |
| PLLuM-12B-chat-2512 Q8_0 | ~12B | no disponible | Polish 80; razonamiento 1,5/20; transcripciones 58/72 | no disponible en la informacion proporcionada | GGUF, 13,1 GB |

El modelo se posiciona como una alternativa de bajo consumo de VRAM frente al Q4_K_M del mismo modelo base, con una pérdida de 3,5 puntos en Polish score y 0,2 problemas de razonamiento, pero con 6,2 GB menos de fichero. Frente a los modelos polacos nativos (Bielik, PLLuM) gana en razonamiento y en preguntas documentales, aunque Bielik produce menos errores lingüísticos en chat (0,3 frente a 0,5 errores por 100 palabras).

## Limitaciones y advertencias

- Las métricas de Polish score, razonamiento y transcripciones son pruebas propias del autor, no benchmarks estándar; no son comparables con leaderboards ni con cifras de otras model cards.
- La KL divergence del IQ2 (0,0492 en razonamiento y 0,138 en polaco) es mayor que la de las cuantizaciones de unsloth, aunque el autor reporta mejor rendimiento en sus pruebas; la fidelidad al modelo completo es inferior.
- Bielik escribe un polaco de chat más limpio (0,3 errores por 100 palabras frente a 0,5 de este modelo), por lo que en tareas de calidad lingüística fina puede ser preferible.
- Riesgo de alucinación inherente a los modelos generativos; no se documentan en la informacion proporcionada evaluaciones específicas de sesgo o toxicidad.
- Idiomas limitados a polaco e inglés; no se garantiza un rendimiento adecuado en castellano u otros idiomas.
- El contexto útil está limitado a 64K por ranura y a la ventana deslizante de 2048 tokens en 3 de cada 4 capas, lo que puede afectar a la recuperación de información muy lejana dentro de la ventana.
- Licencia Apache 2.0 permite uso comercial, pero conviene verificar las condiciones del modelo base meta-models/Muse-Glimmer-30B y del Q8_0 de origen de unsloth.
- No se documentan en la informacion proporcionada soporte de tool calling, agentes o visión, por lo que no debe asumirse para producción.
- El repositorio tiene 0 likes y 1159 descargas en el momento de la consulta; la validación comunitaria es limitada.

## Enlaces

- HuggingFace del modelo: https://huggingface.co/grpdxr/Muse-Glimmer-30B-PL-GGUF
- Modelo base: https://huggingface.co/meta-models/Muse-Glimmer-30B
- GGUF de origen (Q8_0): https://huggingface.co/unsloth/Muse-Glimmer-30B-GGUF
- Qwen3.8-27B-PL del mismo autor: https://huggingface.co/grpdxr/Qwen3.8-27B-PL-GGUF
- Paper, blog o demo adicionales: no disponible en la informacion proporcionada.
