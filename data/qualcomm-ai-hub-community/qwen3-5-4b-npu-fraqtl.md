# qualcomm-ai-hub-community/Qwen3.5-4B-NPU-fraQtl

## Resumen

Qwen3.5-4B-NPU-fraQtl es una cuantización de 4 bits del modelo Qwen3.5-4B de Qwen, publicada por el contribuidor fraQtl a través de la organización qualcomm-ai-hub-community. El objetivo del artefacto no es reentrenar ni modificar el modelo base, sino producir un fichero GGUF que mantenga la mayor fidelidad posible respecto al original en bf16 a la vez que ejecuta la totalidad de sus operaciones en la NPU Hexagon de los SoC Snapdragon, en concreto el Snapdragon 8 Elite Gen 5 (SM8850).

El modelo base es un transformer de 4.205.751.296 parámetros (aproximadamente 4,2 mil millones), lo que lo sitúa en la franja de modelos pequeños aptos para inferencia en dispositivo. La cuantización emplea una mezcla de tipos (Q4_0 como predominante, con 52 tensores en Q8_0 y algunos tensores auxiliares en Q4_1, Q6_K y F32), elegidos para que todos los tipos de matmul estén soportados por el backend Hexagon de llama.cpp.

La relevancia del artefacto reside en su metodología de evaluación: el autor publica métricas de divergencia KL frente al modelo bf16 sobre 144 ventanas reservadas, con intervalos de confianza por bootstrap, y compara contra cuantizaciones de referencia (unsloth Q4_0, IQ4_NL, Q4_K_S e Intel AutoRound Q4_0). Según esos datos, el fichero es un 37,8% más cercano al original en texto de tarea (instrucciones y tool calling) y un 28,4% más cercano en texto general que el Q4_0 estándar de unsloth, con un tamaño ligeramente inferior.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (modelo base Qwen3.5-4B; incluye tensores ssm_alpha, ssm_beta y ssm_out, compatibles con un esquema híbrido, aunque la model card no detalla la arquitectura interna) |
| Parametros totales | 4.205.751.296 |
| Parametros activos | no disponible (no se indica que el modelo base sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Mezcla: Q4_0 (192 tensores), Q8_0 (52), Q4_1 (4), Q6_K (1), F32 (177) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (fichero único Qwen3.5-4B-fraQtl-Q4_0.gguf, 2.583.180.384 bytes) |

## Arquitectura y entrenamiento

El artefacto es una cuantización, no un modelo entrenado desde cero. El proceso parte de los pesos bf16 de Qwen/Qwen3.5-4B y aplica tres pasos según la model card: primero, redondeo GPTQ ponderado por Hessiana (Frantar et al., 2022) usando estadísticas de un corpus de calibración propio; segundo, una asignación de precisión por tensor que mantiene Q4_0 para la mayoría de pesos y eleva 52 tensores a Q8_0 dentro de un presupuesto de bytes fijado, de los cuales 47 (24 ssm_beta y 23 ssm_alpha) siguen la elección de unsloth y 5 fueron seleccionados por un ranking de error por tensor (blk.30 y blk.31 ffn_down, blk.23 y blk.27 attn_k, blk.30 ssm_out); tercero, se descarta el bloque de predicción del siguiente token no utilizado.

El autor probó además un entrenamiento de recuperación sobre este fichero y no obtuvo ganancia (una semilla empeoró un 4,4% la KL de tarea y otra quedó sin cambios), por lo que no se aplicó. La innovación técnica destacable es la restricción de que todos los tipos de matmul del fichero estén soportados por el backend Hexagon de llama.cpp, lo que permite que las 32.165 operaciones se ejecuten en la NPU sin rechazos (0 de 32.165 en la medición en dispositivo). El fichero carga en llama.cpp estándar.

## Capacidades

- Generación de texto conversacional: la model card clasifica el pipeline como text-generation y el modelo base se distribuye para tareas de instrucciones.
- Seguimiento de instrucciones: evaluado con IFEval sobre 250 preguntas fijas, con 194 aciertos en decodificación greedy y thinking desactivado.
- Razonamiento matemático: evaluado con GSM8K sobre 250 preguntas, con 233 aciertos en las mismas condiciones.
- Tool calling / function calling: la métrica de "texto de tarea" del autor agrupa explícitamente instrucciones y tool calling, y es donde la cuantización muestra mayor ventaja frente a las alternativas.
- Inferencia en NPU: ejecución íntegra en el backend Hexagon de llama.cpp sobre Snapdragon 8 Elite Gen 5, sin operaciones rechazadas.
- Capacidades multimodales, de audio o de visión: no disponible; la model card indica explícitamente "Text model only".
- Modo thinking: la evaluación se realizó con thinking desactivado; no se documentan resultados con thinking activado.
- Capacidades multilingües: no disponible.

## Casos de uso

- Asistentes conversacionales en dispositivo: el modelo puede gestionar diálogos multi-turno directamente en el terminal móvil, sin enviar datos a la nube, gracias a su tamaño de 4,2 mil millones de parámetros y a la ejecución completa en la NPU Hexagon del Snapdragon 8 Elite Gen 5.
- Automatización de tareas con tool calling en aplicaciones móviles: la cuantización preserva especialmente la fidelidad en texto de tarea (instrucciones y tool calling), por lo que es adecuada para agentes que invocan APIs del sistema operativo o servicios del propio dispositivo.
- Procesamiento local de documentos sensibles: al ejecutarse íntegramente en el terminal, permite resumir o extraer información de textos confidenciales sin salida de datos a servidores externos.
- Respuesta a preguntas sobre conocimiento general en modo offline: el modelo conserva un 28,4% más de cercanía al original en texto general que el Q4_0 de unsloth, lo que lo hace viable para asistentes de consulta sin conectividad.
- Generación de texto y borradores en aplicaciones de productividad móvil: con un throughput de generación de 17,10 tokens/s en la NPU del SM8850, es suficiente para autocompletado y redacción asistida en tiempo interactivo.
- Prototipado y evaluación de cuantizaciones para despliegue en edge: el repositorio incluye receipts con la tabla de fidelidad, las respuestas a 500 preguntas, el log de dispositivo y el recuento de operaciones rechazadas, lo que lo convierte en una referencia reproducible para comparar estrategias de cuantización orientadas a NPU.
- Investigación sobre fidelidad de cuantización: la metodología de divergencia KL con intervalos de confianza por bootstrap sobre 144 ventanas reservadas permite reutilizar el artefacto como caso de estudio de cómo la asignación por tensor afecta a la fidelidad frente al modelo bf16.

## Benchmarks y rendimiento

Fidelidad frente al modelo original en bf16, medida como divergencia KL sobre 144 ventanas reservadas (menor es más cercano), con intervalo de confianza del 95% por bootstrap pareado de 2.000 remuestreos:

| Fichero | Bytes | KL tarea | KL general | Tarea vs unsloth Q4_0 | General vs unsloth Q4_0 |
|---|---|---|---|---|---|
| unsloth Q4_0 | 2.583.221.408 | 0,04641 | 0,02874 | — | — |
| AutoRound 0.16.1 Q4_0 (Intel) | 2.611.782.976 | 0,03634 | 0,02130 | −21,7% [−26,3; −16,8] | −25,9% [−35,6; −16,3] |
| fraQtl Q4_0 (este repo) | 2.583.180.384 | 0,02888 | 0,02058 | −37,8% [−41,8; −33,3] | −28,4% [−35,7; −21,0] |

Comparación con otros ficheros de 4 bits del mismo tamaño (las dos últimas columnas comparan cada fichero con el Q4_0 de fraQtl; negativo significa que ese fichero es más cercano al original):

| Fichero | Bytes | KL tarea | KL general | Tarea vs fraQtl Q4_0 | General vs fraQtl Q4_0 |
|---|---|---|---|---|---|
| unsloth IQ4_NL | 2.579.944.608 | 0,03276 | 0,01908 | +13,4% [+7,3; +19,9] | −7,3% [−14,4; −0,0] |
| unsloth Q4_K_S | 2.590.430.368 | 0,02842 | 0,01729 | −1,6% [−8,0; +5,0] | −16,0% [−22,0; −9,7] |
| fraQtl Q4_0 (este repo) | 2.583.180.384 | 0,02888 | 0,02058 | — | — |

Resultados en 500 preguntas fijas con decodificación greedy y thinking desactivado, sobre la misma GPU en la misma ejecución:

| Fichero | GSM8K /250 | IFEval /250 |
|---|---|---|
| unsloth Q4_0 | 233 | 190 |
| fraQtl Q4_0 | 233 | 194 |
| Referencia bf16 | 232 | 195 |

El autor señala que las diferencias no son estadísticamente significativas: GSM8K con 5 aciertos únicos en cada fichero (p = 1,00) e IFEval con 14 frente a 10 (p = 0,54).

Rendimiento en dispositivo (Snapdragon 8 Elite Gen 5, SM8850, llama.cpp b12079 con backend Hexagon, 3 repeticiones, tokens/s):

| Fichero | NPU pp128 | NPU tg64 | Operaciones rechazadas por la NPU |
|---|---|---|---|
| unsloth Q4_0 | 955,1 ± 10,6 | 17,24 ± 0,01 | 0 de 32.165 |
| fraQtl Q4_0 | 950,1 ± 11,8 | 17,10 ± 0,04 | 0 de 32.165 |

## Requisitos de hardware

- VRAM estimada para inferencia: el fichero GGUF ocupa 2.583.180.384 bytes (unos 2,58 GB); en GPU la huella de memoria se aproxima a ese tamaño más el overhead de contexto y del runtime.
- GPU recomendadas: no disponibles en la información proporcionada; la model card solo documenta ejecución en NPU Hexagon del Snapdragon 8 Elite Gen 5. Los benchmarks de 500 preguntas se ejecutaron en GPU, pero no se especifica el modelo.
- Cabe en GPU de consumo: no confirmado en la información disponible, aunque un fichero de 2,58 GB es compatible con GPUs de consumo de 8 GB o más en la práctica habitual de llama.cpp; el autor no lo documenta.
- Opciones de despliegue: llama.cpp (versión b12079 o superior para el backend Hexagon); el fichero carga en llama.cpp estándar. No se documenta soporte en vLLM, Ollama o TGI.
- Latencia y throughput: en la NPU del SM8850, 950,1 ± 11,8 tokens/s en procesamiento de prompt (pp128) y 17,10 ± 0,04 tokens/s en generación (tg64), con 3 repeticiones. El autor indica que la velocidad es la misma que la del Q4_0 de unsloth.
- Almacenamiento: 2,58 GB para el fichero único, con sha256 dfae49c2f6fbc76aedcf121e22cc71b65d2c862ccdb79b9bc0f7cd1a9eedbffe.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Fidelidad KL (tarea / general) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| fraQtl Q4_0 (este repo) | 4,2 B | no disponible | 0,02888 / 0,02058 | Apache 2.0 | GGUF en HF |
| unsloth Q4_0 | 4,2 B | no disponible | 0,04641 / 0,02874 | Apache 2.0 | GGUF en HF |
| unsloth Q4_K_S | 4,2 B | no disponible | 0,02842 / 0,01729 | Apache 2.0 | GGUF en HF |
| unsloth IQ4_NL | 4,2 B | no disponible | 0,03276 / 0,01908 | Apache 2.0 | GGUF en HF |
| AutoRound 0.16.1 Q4_0 (Intel) | 4,2 B | no disponible | 0,03634 / 0,02130 | Apache 2.0 | GGUF en HF |

La comparativa se limita a cuantizaciones del mismo modelo base, ya que la información proporcionada no incluye modelos alternativos de otros desarrolladores. Frente a unsloth Q4_K_S, el fichero de fraQtl es un 16,0% peor en texto general y prácticamente equivalente en texto de tarea (diferencia del 1,6% con intervalo que cruza cero). Frente a unsloth IQ4_NL, es un 13,4% mejor en tarea y un 7,3% peor en general. Frente a AutoRound Q4_0, es mejor en ambas métricas (−20,5% en tarea y −3,4% en general, con intervalo que cruza cero en esta última) y ocupa 28,6 MB menos.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados en la información proporcionada; al ser una cuantización del modelo base, hereda los sesgos de Qwen3.5-4B, que no se detallan.
- Riesgo de alucinación: no cuantificado; la evaluación se limita a GSM8K e IFEval y a la divergencia KL, sin pruebas de veracidad factual.
- Limitaciones de contexto: la longitud de contexto del modelo base no se indica en la información disponible.
- Limitaciones de idioma: los idiomas soportados no están disponibles en la información proporcionada.
- Ámbito de la evaluación: el autor advierte que las 144 ventanas KL y las 500 preguntas se ejecutaron sobre una única compilación de cada fichero, y que la KL mide cercanía al modelo original, no precisión en tarea.
- Modelo solo de texto: la model card indica explícitamente "Text model only"; no hay soporte multimodal.
- Dependencia de hardware: la ventaja de ejecución íntegra en NPU está documentada únicamente para el Snapdragon 8 Elite Gen 5 (SM8850) con llama.cpp b12079 y backend Hexagon; no se verifican otros SoC ni otras versiones del runtime.
- Comparadores no ejecutados en dispositivo: el autor señala que ni IQ4_NL ni Q4_K_S se ejecutaron en el teléfono en este estudio, aunque ambos usan solo tipos soportados por Hexagon.
- Licencia: Apache 2.0, sin restricciones documentadas para uso comercial; conviene verificar igualmente las condiciones del modelo base Qwen3.5-4B.
- Reproducibilidad: el autor publica receipts en el repositorio canónico (tabla de fidelidad, respuestas, log de dispositivo, recuento de operaciones rechazadas y lista de tensores Q8_0), pero no se detalla la composición del corpus de calibración.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/qualcomm-ai-hub-community/Qwen3.5-4B-NPU-fraQtl
- Repositorio canónico y receipts del autor: https://huggingface.co/fraQtl/Qwen3.5-4B-NPU-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Cuantizaciones de referencia de unsloth: https://huggingface.co/unsloth/Qwen3.5-4B-GGUF
- Paper de GPTQ (Frantar et al., 2022): no disponible como enlace en la información proporcionada
- llama.cpp y backend Hexagon: no disponible como enlace en la información proporcionada
- Intel AutoRound: no disponible como enlace en la información proporcionada
