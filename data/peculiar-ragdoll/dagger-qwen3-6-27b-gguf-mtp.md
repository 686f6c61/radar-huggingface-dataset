# peculiar-ragdoll/Dagger-Qwen3.6-27B-GGUF-MTP

## Resumen

Dagger-Qwen3.6-27B-GGUF-MTP es una cuantización GGUF del finetune ThinkingCap-Qwen3.6-27B, desarrollada por peculiar-ragdoll. ThinkingCap es a su vez un ajuste fino de Qwen3.6-27B, un modelo denso de 27 mil millones de parámetros con capacidades multimodales (texto e imagen). Dagger se presenta como una versión "afilada" que reduce drásticamente el número de tokens generados por respuesta —piensa en una cuarta parte de los tokens que necesita el Qwen3.6-27B original y responde con un 59% menos de prosa— manteniendo una calidad estadísticamente equivalente.

La variante MTP incorpora un cabezal de predicción multi-token (multi-token prediction) para decodificación especulativa, lo que permite acelerar la generación entre 1.5 y 2 veces en runtimes como vLLM o SGLang. Su principal valor diferencial es la resistencia en sesiones largas: con una ventana de contexto nativa de 262.144 tokens, Dagger encadena 110 preguntas difíciles de GPQA-Diamond dentro de una sola ventana, frente a 63 de ThinkingCap y 24 del Qwen stock. Está pensado para cargas de trabajo agénticas y de razonamiento prolongado donde la coherencia a lo largo de miles de tokens es crítica.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (Qwen3.6-27B) con cabezal MTP para decodificacion especulativa |
| Parametros totales | 27 mil millones (27B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 262.144 tokens |
| Tipos de cuantizacion | GGUF (Q6_K, Q4 y otras; el repo incluye multiples quants) |
| Idiomas soportados | Ingles (en), chino (zh) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (safetensors no disponible) |

## Arquitectura y entrenamiento

Dagger se construye sobre ThinkingCap-Qwen3.6-27B, un finetune de Qwen3.6-27B que ya incorpora mejoras en la plantilla de chat y en el comportamiento de razonamiento. La contribucion principal de Dagger es doble: por un lado, una plantilla de chat fija y corregida (desarrollada en el repositorio Qwen-Sharp-Chat-Templates) que inyecta automaticamente un prompt de sistema que fuerza respuestas directas, sin preambulos ni relleno; por otro, la integracion de un cabezal MTP (multi-token prediction) que permite decodificacion especulativa sin perdida de calidad.

El modelo base es un transformer denso de 27B con atencion completa en 16 capas y 4 cabezas KV, lo que explica su alto coste de contexto (86.5 KiB por token a 16-bit KV). No se han publicado detalles sobre el dataset de entrenamiento ni sobre el proceso de ajuste (RLHF, DPO, etc.) mas alla de la mencion de que es un finetune con plantilla de chat mejorada. La cuantizacion GGUF se ha realizado sobre el modelo ThinkingCap, manteniendo el cabezal MTP para entornos que lo soporten.

## Capacidades

- Generacion de texto y razonamiento: responde de forma directa y concisa, con un modo de "pensamiento" interno que reduce el numero de tokens de razonamiento.
- Razonamiento agéntico y multi-paso: la model card reporta un 3/3 en problemas agénticos dentro de su banda de resolucion, lo que indica capacidad para encadenar acciones y mantener coherencia en tareas largas.
- Vision: al ser un modelo image-text-to-text, puede procesar imagenes junto con texto (aunque no se detallan capacidades especificas de vision en la documentacion).
- Tool calling / function calling: no se menciona explicitamente, pero el enfoque agéntico sugiere compatibilidad con llamadas a herramientas; no confirmado.
- Decodificacion especulativa MTP: acelera la generacion entre 1.5 y 2 veces en vLLM/SGLang, y ~1.11 veces en llama.cpp con builds recientes.
- Multilingue: soporta ingles y chino.
- Eficiencia de tokens: genera significativamente menos tokens por respuesta que el modelo base, lo que reduce costes de inferencia y amplia la longitud efectiva de contexto.

## Casos de uso

- Sesiones agénticas de larga duracion: Dagger puede mantener coherencia a lo largo de 110 pasos de razonamiento dentro de una sola ventana de contexto, ideal para agentes autonomos que deben resolver cadenas de tareas sin reiniciar el contexto.
- Razonamiento cientifico y analitico: su capacidad para encadenar preguntas dificiles (GPQA-Diamond) lo hace adecuado para investigacion asistida, revision de literatura y analisis de datos complejos.
- Generacion de codigo en produccion: con soporte para decodificacion especulativa y un estilo de respuesta conciso, puede integrarse en pipelines de CI/CD para generar documentacion, parches o refactorizaciones con menor latencia.
- Asistentes conversacionales multilingues: al soportar ingles y chino, puede desplegarse en entornos bilingues o multinacionales, manteniendo respuestas directas y sin relleno.
- Analisis de documentos largos con vision: su capacidad multimodal permite procesar imagenes, diagramas o capturas junto con texto extenso, util en entornos juridicos, medicos o tecnicos.
- Chatbots de atencion al cliente: la plantilla de chat forzada elimina preambulos y produce respuestas operativas, reduciendo el coste por interaccion y mejorando la experiencia en canales de soporte.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. La model card incluye mediciones propias del autor, realizadas en Mac Studio M2 Ultra con oMLX y cache KV de 8 bits:

| Metrica | Dagger | ThinkingCap | Qwen3.6-27B stock | Nail (MoE) |
|---|---|---|---|---|
| Preguntas GPQA-Diamond encadenadas en contexto nativo | 110 | 63 | 24 | 45 |
| Tokens por pregunta (GPQA-Diamond) | 2.380 | 4.137 | no disponible | 5.777 |
| Reduccion de prosa vs. ThinkingCap | 59% menos | — | — | — |
| Problemas agénticos resueltos (banda solucionable) | 3/3 | no disponible | no disponible | no disponible |

Estos datos son mediciones del autor y no han sido verificados de forma independiente. La aceleracion por MTP se reporta como ~1.5-2x en vLLM/SGLang y ~1.11x en llama.cpp (build b10362+ con `--spec-type draft-mtp`).

## Requisitos de hardware

- VRAM estimada: el peso del modelo en Q6_K ocupa aproximadamente 22 GB en disco (similar al MoE Nail). El contexto completo de 262k tokens requiere 38.6 GB a 16-bit KV, o 31.1 GB con cache KV de 8 bits (medido en Q6_K).
- GPU recomendadas: no se especifican modelos concretos. Los benchmarks se realizaron en Mac Studio M2 Ultra (64 GB). Para contexto completo se recomienda al menos 64 GB de RAM/VRAM; con 32 GB solo se alcanzan ~73k tokens de contexto.
- Compatibilidad con GPU de consumo: posible con cuantizaciones 4-bit y contexto reducido, pero no confirmado por el autor.
- Opciones de despliegue: llama.cpp (build reciente para MTP), vLLM, SGLang, MLX (para Mac, version dedicada).
- Latencia y throughput: con MTP, ~1.5-2x de aceleracion en vLLM/SGLang; ~1.11x en llama.cpp con parametros `--spec-draft-n-max 4 --spec-draft-p-min 0.6` (medido en M2 Ultra, Q4).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tokens por pregunta (GPQA-D) | Licencia | Formato |
|---|---|---|---|---|---|
| Dagger-Qwen3.6-27B-GGUF-MTP | 27B denso | 262.144 | 2.380 | Apache-2.0 | GGUF |
| ThinkingCap-Qwen3.6-27B | 27B denso | 262.144 | 4.137 | Apache-2.0 | GGUF |
| Qwen3.6-27B (stock) | 27B denso | 262.144 | no disponible | Apache-2.0 | Safetensors/GGUF |
| Nail-Qwen3.6-35B-A3B (MoE) | 35B total, 3B activos | 262.144 | 5.777 | Apache-2.0 | GGUF |

Dagger se posiciona como la opcion mas eficiente en tokens por pregunta, pero a costa de un mayor coste de contexto (86.5 KiB/token frente a 21.9 KiB del MoE Nail). En maquinas con 32 GB de RAM, Nail es mas practico porque permite contexto completo; Dagger solo alcanza ~73k tokens.

## Limitaciones y advertencias

- Coste de contexto elevado: 86.5 KiB por token a 16-bit KV, lo que limita el uso de contexto completo en hardware con menos de 64 GB de RAM.
- Soporte MTP incompleto en llama.cpp: las versiones release actuales no incluyen MTP; se requiere un build de desarrollo (b10362+). En runtimes sin soporte MTP, el rendimiento es identico al GGUF estandar.
- Idiomas limitados: solo ingles y chino; no hay soporte para otros idiomas, incluido el espanol.
- Sesgos y alucinaciones: no se han publicado evaluaciones de sesgos; al ser un finetune de Qwen, puede heredar sesgos del modelo base. La concision forzada podria aumentar el riesgo de omisiones o respuestas incompletas.
- Restricciones de licencia: Apache-2.0 permite uso comercial, pero el modelo base Qwen3.6-27B puede tener condiciones adicionales; se recomienda revisar la licencia del modelo original.
- Dependencia del prompt de sistema incrustado: si se envia un prompt de sistema propio, el prompt de Dagger se anade despues, lo que puede interferir con instrucciones personalizadas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/peculiar-ragdoll/Dagger-Qwen3.6-27B-GGUF-MTP
- Version GGUF estandar (sin MTP): https://huggingface.co/peculiar-ragdoll/Dagger-Qwen3.6-27B-GGUF
- Version MLX para Mac: https://huggingface.co/peculiar-ragdoll/Dagger-Qwen3.6-27B-MLX
- Modelo base ThinkingCap: https://huggingface.co/bottlecapai/ThinkingCap-Qwen3.6-27B
- Repositorio de plantillas de chat: https://huggingface.co/peculiar-ragdoll/Qwen-Sharp-Chat-Templates
- GGUF MTP de protoLabsAI: https://huggingface.co/protoLabsAI/ThinkingCap-Qwen3.6-27B-MTP-GGUF
- Hermano MoE Nail: https://huggingface.co/peculiar-ragdoll/Nail-Qwen3.6-35B-A3B-GGUF
