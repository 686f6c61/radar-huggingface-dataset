# satellitedown/Qwen3.5-9B-RANA-abliterated-drafter-GGUF

## Resumen

Qwen3.5-9B-RANA-abliterated-drafter-GGUF es un modelo borrador (*drafter*) para decodificacion especulativa, publicado por el usuario satellitedown. No es un modelo de lenguaje autonomo: es un componente auxiliar disenado para acelerar la inferencia de un archivo GGUF concreto, el `Qwen3.5-9B-RANA-abliterated-Q4_K_M.gguf` del repositorio de abliterant. Con 1.560.405.504 parametros reales (1,3B declarados en la model card) y tan solo 6 capas transformer, propone 7 tokens de golpe que el modelo grande verifica en una sola pasada.

La relevancia de esta ficha es acotada pero tecnica: ilustra una estrategia de decodificacion especulativa especifica de modelo (*model-specific drafting*) basada en DFlash, donde el borrador lee los estados ocultos de las capas 2, 6, 10, 14, 18, 22, 26 y 30 del modelo objetivo y reutiliza sus embeddings en tiempo de ejecucion. El autor reporta una mejora del 51% en velocidad (de 30,1 a 45,4 tokens/s) en un MacBook Air M4 sobre tareas de agente, y un aumento del 44% en tokens aceptados por ronda en turnos de agente, sin cambios en las respuestas finales.

El modelo se distribuye unicamente en formato GGUF cuantizado Q4_K_M (0,92 GB) y esta atado a un unico archivo de pesos. No soporta otros idiomas declarados, no publica benchmarks de capacidad (MMLU, HumanEval, etc.) y su licencia es Apache 2.0. Su uso esta pensado para el motor llama.cpp parcheado del proyecto GPTah.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso, borrador DFlash (6 capas, lee estados ocultos de 8 capas del modelo objetivo) |
| Parametros totales | 1.560.405.504 (1,3B declarados en la model card) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Q4_K_M (unico archivo publicado) |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF |
| Modelo base | z-lab/Qwen3.5-9B-DFlash (finetune) |
| Modelo objetivo | abliterant/Qwen3.5-9B-RANA-abliterated-Q4_K_M.gguf |
| Vocabulario de salida | 65.536 tokens (de 248.320) |
| Tokens propuestos por ronda | 7 |
| Tamano del repo | 0,9 GB |

## Arquitectura y entrenamiento

El borrador es un transformer denso de 6 capas con una capa de salida propia. En lugar de procesar tokens de entrada, consume los estados ocultos del modelo objetivo en las salidas de las capas 2, 6, 10, 14, 18, 22, 26 y 30 (de 32 totales, contadas desde 0) y propone los siguientes 7 tokens en una sola pasada. Reutiliza en tiempo de ejecucion los embeddings de tokens del modelo grande y su capa de salida cubre solo los 65.536 tokens mas frecuentes, con las filas originales del modelo; un token fuera de ese conjunto termina el borrador sin coste adicional.

El entrenamiento parte del borrador publico z-lab/Qwen3.5-9B-DFlash y se afina sobre texto generado por el propio archivo Q4_K_M mediante llama-server, con el muestreo de GPTah (temperatura 0,6, top-p 0,95, top-k 20, razonamiento limitado a 1.024 tokens). El corpus consta de tres bloques: 3.982 respuestas a prompts publicos (alpaca, code-alpaca, dolly, evol-code, gsm8k, python-code, ultrachat), de las cuales 2.839 con razonamiento activado, que suman 1.788.741 tokens tomados una vez; 485 conversaciones del agente de GPTah sobre 400 tareas de codigo generadas (3.096 turnos, 529.159 tokens) tomadas dos veces; y 225 conversaciones de una ejecucion anterior (2.020 turnos, 240.229 tokens) que por un empaquetado duplicado de shards se tomaron cuatro veces. En total, 18.254 respuestas y turnos por epoca. Se entrenaron 2 epocas con tasa de aprendizaje 5e-5 (1e-4 para la capa que lee los estados ocultos), en bloques de 8 como borrador el motor, y despues se recorto la capa de salida y se cuantizo a Q4_K_M. Los estados ocultos se extrajeron del mismo archivo de 4 bits a traves de llama.cpp parcheado (`llama-loop-taps`).

## Capacidades

- Decodificacion especulativa: propone 7 tokens por ronda que el modelo objetivo verifica en una pasada.
- Aceleracion de inferencia: no genera respuestas propias; decide cuantos tokens se resuelven por pasada.
- Especializacion en texto de agente: entrenado con turnos de razonamiento breve, llamada a herramienta, lectura de resultado y edicion de archivo.
- Reutilizacion de embeddings del modelo objetivo en tiempo de ejecucion.
- Vocabulario de salida restringido a 65.536 tokens frecuentes.
- Compatibilidad con endpoints (tag `endpoints_compatible`).
- No soporta tool calling propio, vision, audio ni modo thinking: esas capacidades pertenecen al modelo objetivo.
- Multilingue: no declarado; hereda el comportamiento del modelo objetivo solo en la medida en que el borrador acierte tokens.

## Casos de uso

- Aceleracion de un asistente de codigo local: integrado en llama.cpp con el archivo `Qwen3.5-9B-RANA-abliterated-Q4_K_M.gguf`, reduce el tiempo por respuesta en tareas de edicion de archivos; el autor reporta 45,4 tokens/s frente a 30,1 en un MacBook Air M4 de 16 GB.
- Agentes de codigo multi-turno: al entrenarse sobre 3.096 turnos de agente, eleva los tokens aceptados por ronda de 3,06 a 4,40 (+44%) en turnos reservados, lo que se traduce en menos pasadas por turno.
- Despliegue en hardware de consumo: con 0,92 GB en Q4_K_M, el borrador cabe junto al modelo de 9B en GPUs de 16 GB o menos, permitiendo decodificacion especulativa donde un borrador de mayor tamano no cabria.
- Servidores de inferencia con llama.cpp parcheado: el proyecto GPTah usa `llama-loop-taps` para extraer estados ocultos; es el entorno para el que se entreno y midio.
- Evaluacion de tecnicas de decodificacion especulativa: sirve como caso de estudio de borradores atados a un archivo de pesos concreto y de recorte de vocabulario de salida.
- Prototipado de aplicaciones conversacionales de baja latencia: en prompts de prosa y codigo mantiene o iguala los tokens por ronda del borrador publico (3,40 frente a 3,54 en prosa; 3,96 en codigo), sin degradar la calidad de las respuestas.

## Benchmarks y rendimiento

Los datos publicados miden tokens aceptados por ronda y velocidad, no capacidades del modelo (el borrador no produce respuestas propias).

| Metrica | z-lab/Qwen3.5-9B-DFlash | Este borrador |
|---|---|---|
| Tokens por ronda, respuestas reservadas | 4,14 | 4,13 (sin cambio) |
| Tokens por ronda, turnos de agente reservados | 3,06 | 4,40 (+44%) |
| Tokens por ronda, RTX 5090, todos los prompts | 3,74 | 3,66 |
| Tokens por ronda, RTX 5090, prosa | 3,54 | 3,40 |
| Tokens por ronda, RTX 5090, codigo | 3,96 | 3,96 |
| Tokens/s en MacBook Air M4 (tareas de agente) | 30,1 | 45,4 (+51%) |
| Tokens aceptados en M4 | 36% | 55% |
| Tareas de codigo superadas (M4) | 10/10 y 10/10 | 10/10 y 10/10 |

No se han publicado resultados de benchmarks de capacidad (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: 0,92 GB para el borrador en Q4_K_M, adicional a la del modelo objetivo de 9B (aproximadamente 5,5-6 GB en Q4_K_M).
- GPU recomendadas: RTX 5090 (medido por el autor), Apple M4 con 16 GB de memoria unificada (medido); cualquier GPU con al menos 8 GB de VRAM libre tras cargar el modelo objetivo deberia poder alojarlo.
- Cabe en GPU de consumo: si, incluidas RTX 3060 de 12 GB, RTX 4060 Ti y superiores, junto al modelo de 9B en 4 bits.
- Opciones de despliegue: llama.cpp con el parche `llama-loop-taps` del proyecto GPTah; no hay soporte declarado para vLLM, TGI u Ollama.
- Latencia y throughput: 45,4 tokens/s en MacBook Air M4 sobre tareas de agente con razonamiento activado; en RTX 5090 el autor no observo separacion clara frente al borrador publico en prompts cortos.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Funcion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este borrador (RANA-abliterated-drafter) | 1,3B (1.560.405.504) | No disponible | Borrador DFlash para un GGUF Q4_K_M concreto | Apache 2.0 | GGUF, 0,92 GB |
| z-lab/Qwen3.5-9B-DFlash | No disponible | No disponible | Borrador DFlash publico de Qwen3.5-9B | No disponible en la informacion | Hugging Face |
| abliterant/Qwen3.5-9B-RANA-abliterated | 9B (aproximado) | No disponible | Modelo objetivo abliterated | No disponible en la informacion | GGUF Q4_K_M |

No se dispone de datos de otros borradores comparables (EAGLE, Medusa) en la informacion proporcionada.

## Limitaciones y advertencias

- Solo funciona con el archivo `Qwen3.5-9B-RANA-abliterated-Q4_K_M.gguf`; con otra cuantizacion u otra edicion de Qwen3.5-9B los estados ocultos no coinciden y se aceptan menos tokens.
- No es un modelo de chat: no debe usarse como generador autonomo ni evaluarse con benchmarks de capacidad.
- En CUDA, las respuestas con y sin borrador a temperatura 0 no son siempre identicas por diferencias de orden aritmetico en las pasadas multi-token; a temperatura > 0 el muestreo introduce variacion adicional.
- Requiere un motor llama.cpp parcheado (`llama-loop-taps`); no funciona en llama.cpp estandar ni en otros runtimes sin adaptacion.
- Vocabulario de salida reducido a 65.536 tokens: los tokens fuera de ese conjunto terminan el borrador, lo que reduce la eficacia en dominios con vocabulario especializado.
- El autor detecta un error en el entrenamiento: los shards de la ejecucion anterior se empaquetaron dos veces y se tomaron cuatro veces en lugar de dos, lo que puede sesgar el borrador hacia ese tipo de turnos.
- Sin datos de sesgos, alucinacion o idiomas declarados; el modelo objetivo es una edicion *abliterated*, con las implicaciones de seguridad que ello conlleva.
- Licencia Apache 2.0 permite uso comercial, pero la responsabilidad sobre el modelo objetivo y su comportamiento recae en el usuario.

## Enlaces

- Hugging Face: https://huggingface.co/satellitedown/Qwen3.5-9B-RANA-abliterated-drafter-GGUF
- Modelo base: https://huggingface.co/z-lab/Qwen3.5-9B-DFlash
- Modelo objetivo: https://huggingface.co/abliterant/Qwen3.5-9B-RANA-abliterated
- GGUF del modelo objetivo: https://huggingface.co/abliterant/Qwen3.5-9B-RANA-abliterated-GGUF
