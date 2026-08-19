# peculiar-ragdoll/Dagger-Qwen3.6-27B-GGUF

## Resumen

Dagger es una cuantización GGUF en Q6_K del modelo ThinkingCap-Qwen3.6-27B, un finetune de Qwen3.6-27B desarrollado por bottlecapai que optimiza el razonamiento para ser conciso y eficiente en tokens. El autor peculiar-ragdoll ha añadido un system prompt fijo incrustado en el chat template y un template de conversación mejorado, dando como resultado un modelo que piensa en aproximadamente un cuarto de los tokens que necesita el Qwen3.6-27B original y responde con una prosa un 59% más corta, manteniendo una precisión estadísticamente equivalente.

El modelo está diseñado para sesiones largas de agente autónomo, coding agentic y conversaciones multi-turno que requieren mantenerse coherentes dentro de una única ventana de contexto de 262.144 tokens. En pruebas con GPQA-Diamond, Dagger encadena 110 preguntas difíciles dentro de su contexto nativo, frente a 63 de ThinkingCap y 24 del Qwen3.6-27B stock. Su principal limitación es el alto coste de memoria por token de contexto (86,5 KiB a 16-bit KV), lo que lo hace recomendable en máquinas con 64 GB de RAM o más.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (Qwen3.6-27B), 16 capas de atención completa con 4 KV heads |
| Parametros totales | 27B (aproximado, basado en Qwen3.6-27B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 262.144 tokens (256k) |
| Tipos de cuantizacion | Q6_K (6-bit) en esta versión; existen versiones MTP y MLX |
| Idiomas soportados | Inglés (en) y chino (zh) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp) |

## Arquitectura y entrenamiento

Dagger es una cuantización de ThinkingCap-Qwen3.6-27B, que a su vez es un finetune del modelo denso Qwen3.6-27B. La arquitectura base es un transformer con 16 capas de atención completa y 4 cabezas KV, lo que explica el alto coste de memoria por token de contexto (86,5 KiB a 16-bit KV). No se dispone de información sobre el dataset de entrenamiento, el número de tokens utilizados ni si se aplicaron técnicas como RLHF o DPO.

La innovación principal de Dagger reside en tres capas apiladas: el finetune de ThinkingCap que induce un razonamiento conciso ("terse-thinking"), un chat template mejorado basado en el trabajo de Froggeric que optimiza flujos multi-turno con tool calling, y un system prompt fijo incrustado en el propio template que se aplica en cada llamada. Este prompt fuerza al modelo a responder directamente, sin preámbulos, repeticiones ni relleno, pero sin sacrificar corrección ni advertencias necesarias. El prompt se añade automáticamente tras cualquier system prompt enviado por el usuario, y desactivarlo requiere editar el `tokenizer.chat_template` incrustado en el GGUF.

## Capacidades

- Generación de texto concisa y directa, con respuestas que lideran con el resultado y omiten relleno.
- Razonamiento eficiente: consume 2.380 tokens por pregunta en GPQA-Diamond, frente a 4.137 de ThinkingCap y 5.777 de Nail.
- Agentic coding: soporte para tool calling y flujos multi-turno, con un 3/3 en problemas agentic dentro de su banda solucionable.
- Conversaciones multi-turno largas: mantiene coherencia hasta 42 turnos en 32 GB de RAM (con 8-bit KV) y más en máquinas con más memoria.
- Capacidad de visión: el pipeline se declara como image-text-to-text y aparece la etiqueta "vision", aunque no se detallan capacidades específicas de entrada de imágenes.
- Multilingüe limitado a inglés y chino.
- Pensamiento eficiente: el modo de razonamiento genera menos tokens de pensamiento que el modelo base, lo que reduce la latencia y el coste por consulta.

## Casos de uso

- Sesiones de agente autónomo de larga duración: Dagger puede encadenar 110 preguntas difíciles dentro de una sola ventana de contexto, lo que lo hace adecuado para agentes que deben resolver tareas secuenciales sin reiniciar el contexto.
- Coding agentic con tool calling: su soporte para herramientas y su capacidad de mantener el hilo durante muchas iteraciones lo convierten en una opción para pipelines de desarrollo asistido por IA, como generación de código, revisión y refactorización en repositorios grandes.
- Análisis de documentos extensos: con 262k tokens de contexto y un consumo eficiente por pregunta, puede procesar manuales técnicos, informes o codebases completos en una sola pasada.
- Razonamiento científico y matemático: su rendimiento en GPQA-Diamond sugiere que es útil para problemas de física, química y biología de nivel avanzado, donde la concisión no compromete la precisión.
- Asistencia en investigación: para investigadores que necesitan respuestas directas y verificables, con citas de incertidumbre cuando corresponde, sin divagaciones.
- Conversaciones multi-turno de atención al cliente: su template mejorado y su capacidad de mantener contexto largo permiten gestionar interacciones complejas con historial extenso, aunque solo en inglés y chino.

## Benchmarks y rendimiento

No se han publicado resultados numéricos detallados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible. Los datos proporcionados son cualitativos y comparativos:

| Métrica | Dagger | ThinkingCap | Nail-35b-a3b | Qwen3.6-27B stock |
|---|---|---|---|---|
| Preguntas GPQA-Diamond encadenadas en contexto nativo | 110 | 63 | 45 | 24 |
| Tokens por pregunta (GPQA-Diamond) | 2.380 | 4.137 | 5.777 | no disponible |
| Coste de contexto por token (16-bit KV) | 86,5 KiB | no disponible | 21,9 KiB | no disponible |
| Turnos de conversación en 32 GB RAM (8-bit KV) | 42 | no disponible | 92 | no disponible |

Además, se menciona que Dagger produce un 59% menos de prosa que ThinkingCap con una puntuación de juez más alta, y obtiene un 3/3 en problemas agentic de su banda solucionable. Las pruebas se realizaron en Mac Studio M2 Ultra 64 GB con oMLX y caché KV de 8 bits.

## Requisitos de hardware

- VRAM estimada: el contexto completo de 262k tokens requiere 38,6 GB a 16-bit KV, o 31,1 GB con caché KV de 8 bits (medido en la versión Q6_K). Los pesos del modelo ocupan aproximadamente 22 GB en disco.
- GPU recomendadas: se probó en Mac Studio M2 Ultra 64 GB. En GPUs NVIDIA, se necesitan al menos 32 GB de VRAM para contexto largo con 8-bit KV; una A100 40GB o H100 80GB sería adecuada. En consumer GPUs como RTX 4090 (24 GB) solo cabría contexto reducido (aproximadamente 73k tokens con 8-bit KV).
- Opciones de despliegue: llama.cpp (compatible con GGUF), oMLX para Mac, y potencialmente vLLM o TGI si soportan GGUF. No se menciona compatibilidad con Ollama.
- Latencia y throughput: no disponible. El coste de memoria por token sugiere que el throughput será menor que en modelos MoE comparables.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tokens/pregunta (GPQA) | Memoria contexto (16-bit KV) | Licencia |
|---|---|---|---|---|---|
| Dagger-Qwen3.6-27B | 27B denso | 262k | 2.380 | 86,5 KiB/token | Apache 2.0 |
| ThinkingCap-Qwen3.6-27B | 27B denso | 262k | 4.137 | no disponible | Apache 2.0 |
| Nail-Qwen3.6-35B-A3B | 35B MoE (3B activos) | 262k | 5.777 | 21,9 KiB/token | Apache 2.0 |
| Qwen3.6-27B stock | 27B denso | 262k | no disponible | no disponible | Apache 2.0 |

Dagger es la opción más eficiente en tokens por pregunta, pero la más cara en memoria de contexto. Nail, su hermano MoE, consume 4 veces menos memoria por token y permite más turnos en máquinas con 32 GB, a costa de más tokens por pregunta. La elección depende de si se prioriza la duración de la sesión o la eficiencia de razonamiento.

## Limitaciones y advertencias

- Alto consumo de memoria por token de contexto: 86,5 KiB a 16-bit KV, lo que limita el contexto útil en máquinas con menos de 64 GB de RAM.
- Idiomas limitados: solo inglés y chino. No hay soporte para otros idiomas, incluido el español.
- System prompt fijo e inamovible: el prompt de concisión está incrustado en el chat template y se aplica siempre. Desactivarlo requiere editar el GGUF, lo que puede ser un inconveniente para casos de uso que necesiten respuestas más expansivas.
- Sin datos de sesgos ni alucinación: no se ha publicado información sobre evaluación de sesgos, toxicidad o tasas de alucinación.
- Sin información de entrenamiento: se desconoce el dataset, el número de tokens y las técnicas de alineación utilizadas, lo que dificulta evaluar su robustez en dominios específicos.
- La capacidad de visión declarada (image-text-to-text) no está documentada en la tarjeta del modelo; se recomienda verificar si realmente acepta imágenes antes de usarla en producción.
- Para uso en producción, es recomendable validar el rendimiento en el hardware objetivo, ya que las pruebas se realizaron en un Mac Studio M2 Ultra con oMLX, que puede diferir de entornos Linux con GPUs NVIDIA.

## Enlaces

- Modelo GGUF: https://huggingface.co/peculiar-ragdoll/Dagger-Qwen3.6-27B-GGUF
- Versión MTP: https://huggingface.co/peculiar-ragdoll/Dagger-Qwen3.6-27B-GGUF-MTP
- Versión MLX: https://huggingface.co/peculiar-ragdoll/Dagger-Qwen3.6-27B-MLX
- Modelo base ThinkingCap: https://huggingface.co/bottlecapai/ThinkingCap-Qwen3.6-27B-GGUF
- Modelo hermano Nail (MoE): https://huggingface.co/peculiar-ragdoll/Nail-Qwen3.6-35B-A3B-GGUF
- Chat templates mejorados: https://huggingface.co/peculiar-ragdoll/Qwen-Sharp-Chat-Templates
