# fraQtl/Qwen3.5-4B-NPU-GGUF

## Resumen

fraQtl/Qwen3.5-4B-NPU-GGUF es una cuantización GGUF Q4_0 del modelo base Qwen/Qwen3.5-4B, publicada por el usuario fraQtl con el objetivo explícito de maximizar la fidelidad respecto al modelo original en bf16 manteniendo la inferencia íntegramente en la NPU Hexagon de Qualcomm. No se trata de un modelo nuevo, sino de un artefacto de cuantización optimizado: el mismo grafo de 4.205.751.296 parámetros, reempaquetado para que todas las operaciones matriciales sean soportadas por el backend Hexagon de llama.cpp.

La relevancia del artefacto está en su metodología de cuantización mixta. Frente al Q4_0 estándar de unsloth, el autor aplica redondeo GPTQ ponderado por Hessiana y una asignación selectiva de precisión (52 tensores en Q8_0 dentro del mismo presupuesto de bytes), lo que según sus mediciones reduce la divergencia KL respecto a bf16 un 37,8 % en tareas de instrucciones y tool calling y un 28,4 % en conocimiento y razonamiento general, sin coste medible de velocidad en dispositivo.

El modelo base Qwen3.5-4B pertenece a la familia Qwen 3.5 de Alibaba, con arquitectura híbrida que combina atención con capas de estado selectivo (SSM, tensores `ssm_alpha`, `ssm_beta`, `ssm_out`). Esta ficha describe principalmente el artefacto GGUF publicado y su comportamiento medido; los detalles de entrenamiento del modelo base no están disponibles en la información proporcionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido con atención y capas SSM (estado selectivo); modelo base Qwen3.5-4B |
| Parametros totales | 4.205.751.296 (4,21 B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF mixta: Q4_0 (192 tensores), Q8_0 (52), Q4_1 (4), Q6_K (1), F32 (177); todas las matmul en tipos soportados por Hexagon |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (fichero único `Qwen3.5-4B-fraQtl-Q4_0.gguf`, 2.583.180.384 bytes, sha256 `dfae49c2f6fbc76aedcf121e22cc71b65d2c862ccdb79b9bc0f7cd1a9eedbffe`) |

## Arquitectura y entrenamiento

El modelo base Qwen3.5-4B es un transformer híbrido que intercala mecanismos de atención con capas de estado selectivo (SSM), tal como evidencian los tensores `ssm_alpha`, `ssm_beta` y `ssm_out` presentes en el fichero GGUF. El artefacto publicado no entrena el modelo: redistribuye la precisión de los pesos existentes. El bloque de predicción del siguiente token no utilizado se elimina del fichero final.

La metodología de cuantización consta de tres pasos. Primero, redondeo GPTQ ponderado por Hessiana (Frantar et al., 2022) usando estadísticas de un corpus de calibración propio. Segundo, asignación de precisión bajo un presupuesto de bytes: Q4_0 para la mayoría de pesos y 52 tensores en Q8_0, de los cuales 47 (24 `ssm_beta`, 23 `ssm_alpha`) replican la elección de unsloth y 5 se seleccionan mediante un ranking de error por tensor (`blk.30` y `blk.31` `ffn_down`, `blk.23` y `blk.27` `attn_k`, `blk.30` `ssm_out`). Tercero, se probó entrenamiento de recuperación, que no aportó ganancia (una semilla +4,4 % en KL de tarea, otra sin cambio), por lo que no se aplica. El resultado ocupa 41.024 bytes menos que el Q4_0 de unsloth y carga en llama.cpp estándar.

## Capacidades

- Generación de texto conversacional y seguimiento de instrucciones, evaluado con IFEval (194/250 en decodificación greedy con thinking desactivado).
- Razonamiento matemático y aritmético de varios pasos, evaluado con GSM8K (233/250 en las mismas condiciones).
- Tool calling y function calling, incluido en el conjunto de evaluación de "tarea" del autor junto con el seguimiento de instrucciones.
- Razonamiento general y conocimiento, medido en el conjunto "general" de ventanas KL.
- Inferencia íntegra en NPU: las 32.165 operaciones del grafo son aceptadas por el backend Hexagon, sin rechazos.
- Modo thinking: el modelo base lo soporta; las evaluaciones del artefacto se realizaron con thinking desactivado.
- Capacidades multimodales, de audio o de visión: no disponibles en este artefacto (el autor indica explícitamente "Text model only").

## Casos de uso

- Asistentes conversacionales en dispositivo móvil: el GGUF de 2,58 GB cabe en la memoria de un smartphone de gama alta y se ejecuta en la NPU Hexagon del Snapdragon 8 Elite Gen 5 a 17,1 tokens/s de generación, lo que permite un asistente local sin conexión.
- Tool calling en agentes locales: la cuantización preserva especialmente la fidelidad en instrucciones y llamadas a funciones (KL de tarea 0,02888 frente a 0,04641 del Q4_0 estándar), lo que la hace adecuada para orquestar APIs y funciones desde un dispositivo.
- Procesamiento por lotes en CPU/GPU de bajo consumo: al ser un GGUF estándar de 4,2 B parámetros, se puede servir con llama.cpp en estaciones de trabajo sin GPU dedicada para tareas de clasificación, extracción y resumen.
- Evaluación comparativa de técnicas de cuantización: el repositorio incluye `receipts/` con tabla de fidelidad, respuestas, log de dispositivo y lista de tensores Q8_0, útil como referencia reproducible para investigadores que comparen GPTQ, AutoRound y cuantización estándar.
- Aplicaciones de razonamiento matemático embebidas: con 233/250 en GSM8K, es viable para tutores o calculadoras conversacionales que deban funcionar sin red.
- Prototipado de pipelines de IA generativa en entornos con restricciones de memoria: el presupuesto de 2,58 GB permite desplegar el modelo junto a otros componentes en dispositivos con 8 GB de RAM o menos.
- Despliegue en flotas de dispositivos Android con aceleración NPU: al no rechazar ninguna operación, evita la caída a CPU que degradaría latencia y consumo energético.

## Benchmarks y rendimiento

Divergencia KL de vocabulario completo respecto a bf16 Qwen/Qwen3.5-4B sobre 144 ventanas retenidas (menor es mejor; IC 95 % por bootstrap pareado con 2.000 remuestreos):

| Fichero | Bytes | KL tarea | KL general | Tarea vs unsloth | General vs unsloth |
|---|---|---|---|---|---|
| unsloth Q4_0 | 2.583.221.408 | 0,04641 | 0,02874 | — | — |
| AutoRound 0.16.1 Q4_0 (Intel) | 2.611.782.976 | 0,03634 | 0,02130 | −21,7 % [−26,3; −16,8] | −25,9 % [−35,6; −16,3] |
| fraQtl Q4_0 (este repo) | 2.583.180.384 | 0,02888 | 0,02058 | −37,8 % [−41,8; −33,3] | −28,4 % [−35,7; −21,0] |

Frente a AutoRound Q4_0 (28,6 MB más grande): tarea −20,5 % [−24,3; −16,6], general −3,4 % [−10,4; +5,0].

Respuestas sobre 500 preguntas fijas, decodificación greedy, thinking desactivado, ambos ficheros en la misma GPU y ejecución:

| Fichero | GSM8K /250 | IFEval /250 |
|---|---|---|
| unsloth Q4_0 | 233 | 190 |
| fraQtl Q4_0 | 233 | 194 |
| Referencia bf16 | 232 | 195 |

Diferencias: GSM8K 5 aciertos exclusivos en cada fichero (p = 1,00); IFEval 14 frente a 10 (p = 0,54).

Rendimiento en dispositivo Snapdragon 8 Elite Gen 5 (SM8850) con llama.cpp b12079 y backend Hexagon, sha256 verificado en dispositivo, 3 repeticiones:

| Fichero | NPU pp128 (tok/s) | NPU tg64 (tok/s) | Operaciones rechazadas por la NPU |
|---|---|---|---|
| unsloth Q4_0 | 955,1 ± 10,6 | 17,24 ± 0,01 | 0 de 32.165 |
| fraQtl Q4_0 | 950,1 ± 11,8 | 17,10 ± 0,04 | 0 de 32.165 |

## Requisitos de hardware

- VRAM/RAM para inferencia: el fichero GGUF ocupa 2,58 GB; se necesita al menos esa cantidad más el espacio de contexto y buffers de cómputo (estimación práctica: 3-4 GB en total, no confirmada en la información disponible).
- GPU recomendadas: no se especifican en la model card; el artefacto está optimizado para la NPU Hexagon de Qualcomm (Snapdragon 8 Elite Gen 5, SM8850) con llama.cpp b12079.
- Consumer GPU: por tamaño (4,2 B parámetros en Q4_0) debería caber en GPUs consumer con 6-8 GB de VRAM, aunque no hay mediciones publicadas para ese escenario.
- Opciones de despliegue: llama.cpp (formato nativo, incluido el backend Hexagon); por ser GGUF estándar, es compatible con el ecosistema llama.cpp, si bien no se confirma soporte explícito de Ollama u otros runners en la información disponible.
- Latencia y throughput medidos: 950,1 tok/s de procesamiento de prompt (pp128) y 17,10 tok/s de generación (tg64) en la NPU del Snapdragon 8 Elite Gen 5.
- Almacenamiento: 2,58 GB para el fichero único; el repositorio completo ocupa 2,6 GB.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | KL tarea (vs bf16) | GSM8K /250 | IFEval /250 | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|---|
| fraQtl Q4_0 (este repo) | 4,21 B | no disponible | 0,02888 | 233 | 194 | Apache 2.0 | GGUF, NPU-native |
| unsloth Q4_0 (`unsloth/Qwen3.5-4B-GGUF`) | 4,21 B | no disponible | 0,04641 | 233 | 190 | Apache 2.0 (heredada) | GGUF |
| AutoRound 0.16.1 Q4_0 (Intel) | 4,21 B | no disponible | 0,03634 | no disponible | no disponible | Apache 2.0 (heredada) | Q4_0, 28,6 MB mayor |
| Qwen3.5-4B bf16 (referencia) | 4,21 B | no disponible | 0 (referencia) | 232 | 195 | Apache 2.0 | safetensors |

## Limitaciones y advertencias

- Las métricas de KL miden proximidad al modelo original, no precisión en tareas; el propio autor lo advierte en la sección de alcance.
- La evaluación se limita a 144 ventanas KL y 500 preguntas con una única compilación de cada fichero; las diferencias en GSM8K e IFEval no son estadísticamente significativas (p = 1,00 y p = 0,54).
- Modelo solo de texto: no procesa imágenes, audio ni vídeo.
- Idiomas soportados no declarados en la información disponible; el comportamiento multilingüe hereda el del modelo base, sin verificación específica.
- Riesgo de alucinación inherente a un modelo de 4,2 B parámetros cuantizado a 4 bits; no hay evaluación de factualidad publicada.
- Sesgos: no se documentan análisis de sesgo en la model card.
- El rendimiento medido corresponde exclusivamente a la NPU Hexagon del Snapdragon 8 Elite Gen 5 con llama.cpp b12079; no hay datos de latencia en GPU, CPU o Apple Silicon.
- La licencia Apache 2.0 permite uso comercial, pero conviene verificar las condiciones del modelo base Qwen3.5-4B antes de desplegar en producción.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, por lo que no existe validación comunitaria independiente de los resultados.
- El autor indica que el entrenamiento de recuperación no aportó ganancia, de modo que la fidelidad depende enteramente del redondeo GPTQ y de la asignación de precisión.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/fraQtl/Qwen3.5-4B-NPU-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Comparador unsloth: https://huggingface.co/unsloth/Qwen3.5-4B-GGUF
- Referencia GPTQ (Frantar et al., 2022): no disponible en la información proporcionada
- llama.cpp y backend Hexagon: no disponible en la información proporcionada
- Intel AutoRound: no disponible en la información proporcionada
