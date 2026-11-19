# miloserdev/Qwen2.5-7B-Instruct-abliterated-numallama

## Resumen

Qwen2.5-7B-Instruct-abliterated-numallama es una conversión del modelo huihui-ai/Qwen2.5-7B-Instruct-abliterated-v2, a su vez una versión "abliterated" de Qwen/Qwen2.5-7B-Instruct. La conversión la publica miloserdev y está pensada exclusivamente para numallama, un motor de inferencia en C para servidores de CPU con ejecución NUMA-aware sobre todas las sockets de máquinas multiprocesador. No es un formato GGUF ni un checkpoint de transformers: los pesos solo se cargan con numallama.

El modelo hereda la arquitectura transformer densa de Qwen2.5 con 7.000 millones de parámetros, contexto nativo de 32.768 tokens y soporte multilingüe (chino, inglés, etc.) del modelo original. La modificación "abliterated" elimina el comportamiento de rechazo del modelo base, de modo que responderá a peticiones que el original declina. El autor advierte explícitamente de la responsabilidad de uso.

La relevancia de esta ficha es doble: por un lado, documenta una variante sin censura de un modelo muy extendido; por otro, ilustra el ecosistema de motores de inferencia alternativos a llama.cpp orientados a servidores ARM64 con muchos núcleos (Ampere Altra, AWS Graviton, Neoverse), donde el rendimiento depende más del ancho de banda de memoria y del particionado NUMA que de la GPU.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer denso (Qwen2.5), inferencia en C con numallama |
| Parámetros totales | 7.000 millones (heredados de Qwen2.5-7B-Instruct) |
| Parámetros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | no disponible en la información proporcionada para esta conversión (el modelo base Qwen2.5-7B-Instruct soporta 32.768 tokens nativos) |
| Tipos de cuantización | Q8 (SmoothQuant, int8 con escalas por grupo) y Q4 asimétrica (grupos de 32, escala y mínimo en fp16, calibrada con importance matrix); el repo solo publica el fichero Q8 |
| Idiomas soportados | no disponible en la model card; el modelo base Qwen2.5 es multilingüe (chino, inglés, y otros) |
| Licencia | Apache 2.0 |
| Formato de pesos | `.bin` propietario de numallama (no GGUF, no safetensors); tokenizer en `tokenizer.bin` |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Qwen2.5-7B-Instruct: un transformer decoder-only denso con atención causal, RoPE, GQA y normalización RMSNorm, preentrenado por Alibaba con un corpus multilingüe y posteriormente alineado con instrucciones y preferencias. Sobre ese modelo, huihui-ai aplicó una ablación de dirección (abliteration) que elimina el vector de rechazo en el espacio de activaciones, produciendo la variante v2 sin el comportamiento de declinación del original.

La contribución de miloserdev no es de entrenamiento sino de conversión y cuantización para numallama. El fichero publicado es Q8 con cuantización SmoothQuant (int8 con escalas por grupo). El autor menciona también una variante Q4 asimétrica (grupos de 32, escala y mínimo en fp16) calibrada con una importance matrix recogida por numallama sobre texto en inglés, ruso, chino y código, pero el repo solo contiene el binario Q8 de 8,1 GB más el tokenizer de 2,2 MB. No se documentan tokens de entrenamiento, composición del dataset de abliteration ni detalles del proceso de RLHF/DPO más allá de lo heredado del modelo base.

## Capacidades

- Generación de texto conversacional multi-turno en formato chat (modo `-m chat` del motor).
- Razonamiento, matemáticas y generación de código heredados de Qwen2.5-7B-Instruct.
- Soporte multilingüe del modelo base (chino, inglés y otros; no se detalla la lista exacta en esta conversión).
- Servidor compatible con la API de OpenAI en `/v1` (modo `-m server -P 8080`), lo que permite integrarlo con clientes existentes.
- Soporte de tool calling y decodificación especulativa según el README de numallama (opciones del motor, no del modelo en sí).
- Comportamiento "abliterated": no aplica rechazos, responde a peticiones que el modelo original declina.
- Ejecución NUMA-aware sobre múltiples sockets de CPU, con reparto de trabajo entre todos los núcleos disponibles.

## Casos de uso

- Despliegue en servidores ARM64 sin GPU: numallama está optimizado para NEON dot product en Ampere Altra, AWS Graviton y otros núcleos Neoverse, por lo que se puede servir el modelo en instancias cloud ARM con 32-256 núcleos y obtener decenas de tokens por segundo sin acelerador.
- Servicio compatible con OpenAI en infraestructura propia: el modo servidor expone `/v1`, lo que permite sustituir un endpoint de OpenAI por este motor en aplicaciones existentes sin cambiar el código cliente.
- Procesamiento por lotes en CPU de granjas multiprocesador: con ejecución NUMA-aware, el motor reparte la inferencia entre sockets, útil para tareas de generación masiva (resúmenes, clasificación, extracción) donde la latencia no es crítica.
- Investigación sobre alineación y seguridad: la variante abliterated permite estudiar el comportamiento del modelo sin el sesgo de rechazo, comparándolo con el original para analizar qué tipo de contenido se filtraba y por qué.
- Generación de código en pipelines internos: el modelo base rinde bien en tareas de programación y, al ejecutarse en CPU, puede integrarse en entornos con restricciones de GPU o en CI/CD con runners ARM.
- Prototipado y evaluación de motores de inferencia: sirve como banco de pruebas para comparar numallama frente a llama.cpp u otros motores en el mismo hardware ARM, midiendo throughput y latencia.
- Asistentes conversacionales autoalojados en entornos controlados: al no depender de servicios externos y tener licencia Apache 2.0, encaja en despliegues on-premise con requisitos de soberanía de datos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El único dato de rendimiento es el del autor: 41 tokens/s en una sola conversación de chat, medido en 2 × Ampere Altra Max M128-30 (256 núcleos Neoverse N1, ambas sockets). El autor advierte que otras máquinas darán cifras distintas.

| Métrica | Valor | Hardware |
|---|---|---|
| Decodificación (Q8) | 41 tok/s | 2 × Ampere Altra Max M128-30, 256 núcleos Neoverse N1 |
| Tamaño de pesos Q8 | 8,1 GB | — |
| Tamaño de tokenizer | 2,2 MB | — |

## Requisitos de hardware

- VRAM: no aplica; el motor es de CPU. El fichero Q8 ocupa 8,1 GB en disco y debe caber en RAM junto con el estado de inferencia (KV cache según contexto).
- CPU: Linux. Optimizado para ARM64 con NEON dot product (Ampere Altra, AWS Graviton, otros Neoverse). En x86-64 y otras CPUs funciona código C portable sin optimizar.
- GPU: no se usa GPU; no hay soporte CUDA documentado en esta conversión.
- Memoria: al ser un modelo de 7B en Q8, se recomienda al menos 16 GB de RAM para el modelo más margen para el contexto; en máquinas multiprocesador conviene configurar NUMA correctamente para aprovechar el reparto entre sockets.
- Despliegue: exclusivamente numallama (compilación con `make`, binario `runq`). No funciona con llama.cpp, Ollama, LM Studio ni transformers.
- Latencia y throughput: 41 tok/s en el hardware de referencia del autor; no hay datos para otras configuraciones.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato / motor | Licencia | Notas |
|---|---|---|---|---|---|
| Qwen2.5-7B-Instruct-abliterated-numallama (este) | 7B | no disponible (base: 32.768) | `.bin` numallama, CPU ARM64 NUMA | Apache 2.0 | Sin rechazos; solo numallama; 41 tok/s en 2 × Altra Max |
| huihui-ai/Qwen2.5-7B-Instruct-abliterated-v2 | 7B | 32.768 (heredado) | safetensors, transformers | Apache 2.0 | Modelo base de esta conversión; sin rechazos; requiere GPU o CPU vía transformers |
| Qwen/Qwen2.5-7B-Instruct | 7B | 32.768 | safetensors, GGUF, múltiples motores | Apache 2.0 | Modelo original alineado; disponible en llama.cpp, vLLM, Ollama, TGI |
| miloserdev/Qwen2.5-7B-Instruct-numallama | 7B | no disponible | `.bin` numallama | Apache 2.0 | Misma conversión sin abliteration; comportamiento original |

## Limitaciones y advertencias

- Modelo abliterated: no aplica rechazos y puede generar contenido dañino, sesgado o ilegal. El autor declara que la responsabilidad de uso recae en el usuario.
- Riesgo de alucinación inherente a un modelo de 7B; no se han publicado evaluaciones de fidelidad para esta conversión.
- Solo funciona con numallama; no es compatible con llama.cpp, Ollama, LM Studio ni transformers, lo que limita su portabilidad.
- Rendimiento óptimo solo en ARM64 con NEON; en x86-64 el código es portable pero no está optimizado.
- La model card no detalla idiomas soportados ni longitud de contexto efectiva de esta conversión; hay que remitirse al modelo base.
- El repo solo publica Q8; la variante Q4 mencionada en la model card no está disponible en el repositorio.
- Licencia Apache 2.0 permite uso comercial, pero la abliteration puede entrar en conflicto con políticas de moderación de plataformas o con normativa local sobre contenido.
- Sin descargas ni likes en el momento de la consulta; proyecto muy reciente y sin validación comunitaria.

## Enlaces

- Hugging Face: https://huggingface.co/miloserdev/Qwen2.5-7B-Instruct-abliterated-numallama
- Modelo base (abliterated v2): https://huggingface.co/huihui-ai/Qwen2.5-7B-Instruct-abliterated-v2
- Modelo original: https://huggingface.co/Qwen/Qwen2.5-7B-Instruct
- Variante sin abliteration: https://huggingface.co/miloserdev/Qwen2.5-7B-Instruct-numallama
- Motor numallama: https://github.com/miloserdev/numallama
- README de numallama (opciones, API): https://github.com/miloserdev/numallama#readme
