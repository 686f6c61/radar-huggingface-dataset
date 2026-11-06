# qualcomm-ai-hub-community/Qwen3.5-4B-NPU-fraQtl

## Resumen

Qwen3.5-4B-NPU-fraQtl es una cuantización GGUF Q4_0 del modelo Qwen/Qwen3.5-4B de Alibaba, optimizada específicamente para ejecución nativa en la NPU Hexagon de los SoC Qualcomm Snapdragon. La publica el espacio comunitario qualcomm-ai-hub-community, con la conversión atribuida al contribuyente fraQtl, cuyo repositorio canónico alberga las métricas completas de validación. El objetivo es ofrecer una alternativa de cuantización de mayor fidelidad que las versiones Q4_0 estándar (unsloth, AutoRound) sin sacrificar velocidad en el acelerador neuronal.

El modelo base es un transformer de 4.205.751.296 parámetros (aproximadamente 4,2 mil millones) con arquitectura híbrida que combina atención con capas de espacio de estados (SSM), a juzgar por la presencia de tensores `ssm_alpha`, `ssm_beta` y `ssm_out` en el archivo. La cuantización resultante ocupa 2.583.180.384 bytes (unos 2,6 GB) y todos sus tipos de matmul son compatibles con el backend Hexagon de llama.cpp, de modo que la inferencia se ejecuta íntegramente en la NPU sin operaciones rechazadas.

La relevancia de esta ficha radica en su enfoque metodológico: aplica redondeo GPTQ ponderado por Hessiano y una asignación selectiva de precisión (52 tensores en Q8_0 dentro del mismo presupuesto de bytes) para reducir la divergencia KL respecto al modelo original en un 37,8 % en tareas de instrucciones y tool calling, y un 28,4 % en conocimiento y razonamiento, comparado con el Q4_0 de unsloth. Es, por tanto, un caso práctico de cuantización consciente del hardware para despliegue en dispositivos de borde.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer híbrido con capas SSM (atención + espacio de estados), según tensores del archivo |
| Parámetros totales | 4.205.751.296 |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | Q4_0 (192 tensores), Q8_0 (52), Q4_1 (4), Q6_K (1), F32 (177); bloque de predicción de siguiente token eliminado |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp), compatible con backend Hexagon NPU |

## Arquitectura y entrenamiento

El modelo base Qwen3.5-4B emplea una arquitectura híbrida que intercala mecanismos de atención con capas de espacio de estados (SSM), tal como evidencian los tensores `ssm_alpha`, `ssm_beta` y `ssm_out` presentes en el archivo cuantizado. Esta combinación busca reducir el coste computacional en secuencias largas manteniendo la calidad de representación de un transformer convencional. El bloque de predicción de siguiente token no utilizado se elimina durante la conversión, lo que contribuye a ajustar el tamaño final.

El proceso de cuantización, documentado en la model card, consta de tres pasos: primero, redondeo GPTQ ponderado por Hessiano (Frantar et al., 2022) usando estadísticas de un corpus de calibración propio; segundo, asignación de precisión por tensor, manteniendo Q4_0 para la mayoría de pesos y elevando 52 tensores a Q8_0 dentro del presupuesto de bytes (47 siguiendo la elección de unsloth para `ssm_beta` y `ssm_alpha`, y 5 seleccionados por ranking de error por tensor: `blk.30` y `blk.31` `ffn_down`, `blk.23` y `blk.27` `attn_k`, `blk.30` `ssm_out`); tercero, se probó entrenamiento de recuperación, que no aportó ganancia (un seed +4,4 % en KL de tarea, otro sin cambio), por lo que no se aplicó. No se dispone de información sobre el dataset de entrenamiento original del modelo base ni sobre si empleó RLHF o DPO.

## Capacidades

- Generación de texto conversacional y seguimiento de instrucciones, validado con 250 preguntas de IFEval (194 aciertos en esta cuantización frente a 195 del bf16 de referencia).
- Razonamiento matemático y aritmético, con 233 aciertos sobre 250 en GSM8K, idéntico al bf16 de referencia (232).
- Tool calling y function calling, evaluado en la categoría de "tarea" del informe de fidelidad (instrucciones + herramientas).
- Razonamiento de conocimiento general, medido en la categoría "general" del análisis de divergencia KL.
- Capacidades multilingües: no disponibles en la información proporcionada.
- Modo thinking: la evaluación se realizó con "thinking off", lo que sugiere que el modelo base dispone de un modo de razonamiento explícito, aunque no se detalla su comportamiento en esta cuantización.
- Ejecución íntegra en NPU Hexagon: 0 de 32.165 operaciones rechazadas por el acelerador.

## Casos de uso

- Asistentes conversacionales en dispositivos móviles: el modelo cabe en 2,6 GB y se ejecuta en la NPU del Snapdragon 8 Elite Gen 5, lo que permite desplegar un chatbot local sin conexión con latencia de generación de 17,10 tokens/s y procesamiento de prompt de 950,1 tokens/s (pp128).
- Automatización de tareas con herramientas en el borde: la cuantización preserva el rendimiento en tool calling (194/250 en IFEval), adecuado para agentes ligeros que invocan APIs locales o funciones del sistema operativo en un teléfono o dispositivo embebido.
- Procesamiento de documentos y resúmenes en local: con un tamaño de 2,6 GB y licencia Apache 2.0, puede integrarse en aplicaciones de escritorio o móviles que resumen texto sin enviar datos a la nube.
- Razonamiento matemático asistido en educación: los 233/250 en GSM8K lo hacen viable para tutores de matemáticas en dispositivos de bajo consumo.
- Prototipado e investigación en cuantización: el repositorio incluye `receipts/` con la tabla de fidelidad, el log del dispositivo, el recuento de operaciones rechazadas y la lista de tensores Q8_0, útil para reproducir y comparar metodologías de cuantización.
- Inferencia en entornos con restricciones de privacidad: al ejecutarse completamente en la NPU local, evita la exposición de datos sensibles en servidores externos, adecuado para aplicaciones sanitarias o financieras de borde.
- Integración en pipelines de llama.cpp: al cargar en llama.cpp estándar, puede usarse como backend de generación en herramientas CLI o servidores locales con el backend Hexagon.

## Benchmarks y rendimiento

Fidelidad respecto a bf16 (divergencia KL sobre 144 ventanas retenidas; menor es mejor; IC 95 % por bootstrap pareado con 2.000 remuestreos):

| Archivo | Bytes | KL tarea | KL general | vs unsloth (tarea) | vs unsloth (general) |
|---|---|---|---|---|---|
| unsloth Q4_0 | 2.583.221.408 | 0,04641 | 0,02874 | — | — |
| AutoRound 0.16.1 Q4_0 (Intel) | 2.611.782.976 | 0,03634 | 0,02130 | −21,7 % [−26,3; −16,8] | −25,9 % [−35,6; −16,3] |
| **fraQtl Q4_0 (este repo)** | **2.583.180.384** | **0,02888** | **0,02058** | **−37,8 % [−41,8; −33,3]** | **−28,4 % [−35,7; −21,0]** |

Precisión en 500 preguntas fijas (decodificación greedy, thinking off, misma GPU y ejecución):

| Archivo | GSM8K /250 | IFEval /250 |
|---|---|---|
| unsloth Q4_0 | 233 | 190 |
| **fraQtl Q4_0** | **233** | **194** |
| Referencia bf16 | 232 | 195 |

Diferencias: GSM8K con 5 aciertos exclusivos en cada archivo (p = 1,00); IFEval 14 frente a 10 (p = 0,54).

Rendimiento en dispositivo (Snapdragon 8 Elite Gen 5, SM8850, llama.cpp b12079 backend Hexagon; pp128 = procesamiento de prompt, tg64 = generación, tokens/s, 3 repeticiones):

| Archivo | NPU pp128 | NPU tg64 | Operaciones rechazadas |
|---|---|---|---|
| unsloth Q4_0 | 955,1 ± 10,6 | 17,24 ± 0,01 | 0 de 32.165 |
| **fraQtl Q4_0** | **950,1 ± 11,8** | **17,10 ± 0,04** | **0 de 32.165** |

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 2,6 GB de pesos más overhead de contexto y estados KV/SSM; el archivo pesa 2.583.180.384 bytes.
- GPU recomendadas: el objetivo principal es la NPU Hexagon de Qualcomm (Snapdragon 8 Elite Gen 5, SM8850). En GPU convencionales puede ejecutarse mediante llama.cpp estándar, aunque no se documentan velocidades para CUDA, ROCm o Metal.
- Cabe en GPU de consumo: sí, por tamaño (2,6 GB) cabría en GPUs con 4 GB o más de VRAM, aunque los datos de rendimiento solo se aportan para NPU.
- Opciones de despliegue: llama.cpp (versión b12079 o superior con backend Hexagon) y, por extensión del formato GGUF, otras herramientas compatibles con llama.cpp; no se confirma soporte específico en vLLM, Ollama o TGI en la información disponible.
- Latencia y throughput: en el Snapdragon 8 Elite Gen 5 se miden 950,1 tokens/s en procesamiento de prompt (pp128) y 17,10 tokens/s en generación (tg64), con 0 operaciones rechazadas por la NPU.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Licencia | Rendimiento destacado |
|---|---|---|---|---|---|
| **Qwen3.5-4B-NPU-fraQtl** | 4,2 B | No disponible | GGUF Q4_0 mixto | Apache 2.0 | KL tarea 0,02888; IFEval 194/250; GSM8K 233/250 |
| unsloth Qwen3.5-4B-GGUF Q4_0 | 4,2 B | No disponible | GGUF Q4_0 | Apache 2.0 | KL tarea 0,04641; IFEval 190/250; GSM8K 233/250 |
| AutoRound 0.16.1 Q4_0 (Intel) | 4,2 B | No disponible | GGUF Q4_0 | Apache 2.0 | KL tarea 0,03634; KL general 0,02130 |

## Limitaciones y advertencias

- La evaluación se limita a 144 ventanas KL y 500 preguntas con una única compilación de cada archivo; la KL mide cercanía al modelo original, no precisión en tareas.
- El modelo es solo de texto; no se documentan capacidades de visión o audio.
- No se dispone de información sobre idiomas soportados ni sobre sesgos conocidos del modelo base.
- Riesgo de alucinación inherente a modelos de 4,2 B; los benchmarks muestran un rendimiento cercano pero no idéntico al bf16 (IFEval 194 frente a 195).
- La licencia Apache 2.0 permite uso comercial, pero se recomienda verificar las condiciones del modelo base Qwen3.5-4B y de los componentes de terceros citados (unsloth, Intel AutoRound).
- El rendimiento óptimo depende del backend Hexagon de llama.cpp (b12079); en otras plataformas no se garantizan las cifras de velocidad reportadas.
- El bloque de predicción de siguiente token se elimina, lo que puede afectar a usos que dependan de ese componente.
- No se documenta la longitud de contexto soportada, lo que limita la planificación de despliegues con ventanas largas.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/qualcomm-ai-hub-community/Qwen3.5-4B-NPU-fraQtl
- Repositorio canónico de fraQtl: https://huggingface.co/fraQtl/Qwen3.5-4B-NPU-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Comparador unsloth: https://huggingface.co/unsloth/Qwen3.5-4B-GGUF
- Paper de GPTQ (Frantar et al., 2022): no disponible en la información proporcionada
- Repositorio de llama.cpp: no disponible en la información proporcionada
