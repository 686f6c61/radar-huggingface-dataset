# litert-community/NVIDIA-Nemotron-Labs-Dory1.0-4B

## Resumen

NVIDIA-Nemotron-Labs-Dory1.0-4B es un modelo de lenguaje de tipo "looped" (recurrente latente) desarrollado por NVIDIA Labs y convertido por la comunidad litert-community al formato LiteRT-LM (`.litertlm`) para su ejecución en dispositivos edge mediante el runtime LiteRT-LM de Google. El modelo base es un nGPT (normalized GPT) de 3.975.229.440 parámetros en el que un bloque central de capas se ejecuta repetidamente por cada token, de modo que el modelo puede gastar más cómputo por token sin aumentar el número de parámetros. La conversión incluye tres ficheros: uno int4 para GPU, uno int8 para CPU y una variante int4 de un solo bucle optimizada para GPU.

La relevancia de esta ficha radica en que demuestra la viabilidad de ejecutar un modelo de casi 4.000 millones de parámetros con razonamiento en dispositivos móviles (Galaxy S26, Pixel 8a) y portátiles (Mac M4 Max), con velocidades de decodificación medidas de 12,09 tok/s en GPU de Galaxy S26 y tiempos de prefill+decodificación de 5,43 s en Mac M4 Max. El modelo conserva una ventana de contexto de 131.072 tokens en vocabulario y un presupuesto de caché KV de 2.048 tokens, y mantiene un rendimiento en GSM8K de 90-93 puntos en las variantes cuantizadas, cercano a los 95 del modelo BF16 en llama.cpp.

La licencia es OpenMDW 1.1, que NVIDIA describe como apta para uso comercial y no comercial, y el modelo está orientado exclusivamente a inglés. Esta conversión es relevante para desarrolladores que necesiten razonamiento on-device sin depender de la nube, aunque con las limitaciones propias de la cuantización int4/int8 y del runtime LiteRT-LM.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer nGPT (normalized GPT) con bloque recurrente latente ("looped"); atención intercalada sliding-window y full attention; sin RMSNorm (normalización L2 de vectores ocultos, queries y keys) |
| Parametros totales | 3.975.229.440 |
| Parametros activos | no disponible (no es MoE; el cómputo por token se incrementa repitiendo el bloque recurrente, no activando expertos) |
| Longitud de contexto | 131.072 tokens de vocabulario; presupuesto de caché KV de 2.048 tokens en los ficheros LiteRT-LM; ventana deslizante de 1.024 tokens |
| Tipos de cuantizacion | int4 blockwise-32 (GPTQ) para GPU; int8 dinámico channelwise para CPU; variante int4 de un solo bucle para GPU; modelo base BF16 disponible por separado |
| Idiomas soportados | inglés (en) |
| Licencia | OpenMDW 1.1 (openmdw-1.1) |
| Formato de pesos | LiteRT-LM (`.litertlm`); modelo base en BF16 (safetensors presumiblemente, no confirmado) |

## Arquitectura y entrenamiento

El modelo base es un nGPT de NVIDIA con 72 bloques, cada uno de ellos de atención o MLP: 8 pares de entrada, 20 pares recurrentes y 8 pares de salida. Los 20 pares recurrentes se ejecutan dos veces por token en la configuración por defecto (dos bucles), lo que constituye el mecanismo de recurrencia latente. La dimensión oculta es 2560, con 16 cabezas de query y 4 cabezas KV de 256 dimensiones, 27 capas de atención deslizante (ventana de 1.024 tokens) y 9 capas de atención completa, MLP de 7168 y vocabulario de 131.072 tokens con embeddings no atados. No hay RMSNorm: cada vector oculto, query y key se normaliza L2 (característica nGPT), y cada bloque mezcla su salida en el residual con un paso aprendido. Los ficheros LiteRT-LM mantienen una caché KV por capa de atención y bucle (56 cachés en las variantes de dos bucles, 36 en la de un bucle).

La conversión a LiteRT-LM fue realizada por litert-community con la herramienta hf-to-litertlm sobre litert-torch 0.9.4 y probada con litert-lm 0.18.0. El fichero int4 aplica cuantización blockwise-32 en las capas lineales con códigos elegidos por GPTQ y escalas de bloque con suelo en 2^-14, con embedding int8 en sección propia y las escrituras de caché KV y matmuls de atención como operaciones compuestas de GPU del runtime. El fichero int8 usa cuantización dinámica channelwise con activaciones en float. No se declara tipo de activación: en GPU se ejecuta con las activaciones fp16 por defecto del runtime. No se dispone de información sobre el dataset de entrenamiento, número de tokens, composición ni si hubo RLHF/DPO en la información proporcionada.

## Capacidades

- Generación de texto y razonamiento: modo "thinking" con canal de pensamiento (thought channel) incluido en los metadatos del modelo; las pruebas de corrección se realizaron con thinking activado.
- Razonamiento matemático: puntuación de 90-93 en GSM8K en las variantes cuantizadas (thinking off), lo que indica capacidad sólida para aritmética de varios pasos.
- Razonamiento multi-step: la arquitectura de bucle recurrente permite gastar más cómputo por token, lo que favorece tareas de razonamiento encadenado.
- Multilingüe: no disponible; el modelo solo declara inglés.
- Tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes: no disponible en la información proporcionada.
- Capacidades especiales: modo de razonamiento con canal de pensamiento, ejecución on-device en GPU (int4) y CPU (int8), y variante de un solo bucle para mayor velocidad en GPU a costa de menor precisión en GSM8K (86 frente a 90).

## Casos de uso

- Asistente de razonamiento on-device en móviles: el fichero int4 se ejecuta en la GPU de un Galaxy S26 a 12,09 tok/s, lo que permite integrar un asistente conversacional con razonamiento local sin enviar datos a la nube; adecuado para aplicaciones de privacidad sensible.
- Resolución de problemas matemáticos en el dispositivo: con 90-93 en GSM8K, el modelo puede resolver problemas aritméticos de varios pasos en tiempo real en un Mac M4 Max (5,43 s para prefill de 1.024 tokens más 256 tokens decodificados), útil en apps educativas offline.
- Procesamiento de documentos largos con contexto de 2.048 tokens: el presupuesto de caché KV de 2.048 tokens permite resumir o extraer información de fragmentos de documentos en edge, aunque limita la longitud de entrada.
- Automatización de atención al cliente en kioscos o terminales: la variante int8 en CPU (4,05 GB) puede desplegarse en dispositivos sin GPU dedicada, gestionando conversaciones multi-turno en inglés con latencia de 62,93 s en Galaxy S26 para prefill+decodificación de 1.024+256 tokens.
- Prototipado de agentes de razonamiento en portátiles: la variante int4 en GPU de Mac M4 Max (5,43 s) permite iterar rápidamente en pipelines de razonamiento con thinking mode antes de escalar a producción.
- Evaluación de arquitecturas looped en investigación: la disponibilidad de variantes de uno y dos bucles con métricas comparadas (GSM8K 86 vs 90) facilita estudiar el trade-off entre cómputo recurrente y precisión en entornos reales.
- Aplicaciones de accesibilidad en tiempo real: la variante de un solo bucle int4 en GPU alcanza 17,32 tok/s en Galaxy S26, adecuada para subtitulado o descripción de texto en vivo donde la latencia es crítica.

## Benchmarks y rendimiento

| Benchmark / métrica | int4 (2 bucles, GPU Mac) | int4 1 bucle (GPU Mac) | int8 (CPU Mac) | BF16 (llama.cpp, 2 bucles) | BF16 (llama.cpp, 1 bucle) |
|---|---|---|---|---|---|
| GSM8K (thinking off, accuracy) | 90 | 86 | 93 | 95 | 86 |
| Verificación 8 preguntas (Mac GPU/CPU) | 8/8 | no disponible | 8/8 | no disponible | no disponible |
| Verificación 8 preguntas (Galaxy S26) | 8/8 (GPU) | no disponible | 8/8 (CPU) | no disponible | no disponible |
| Verificación 8 preguntas (Pixel 8a) | no ejecutado | no disponible | 8/8 (CPU) | no disponible | no disponible |

Tiempos de 1.024 tokens de prefill más 256 tokens decodificados a contexto 2.048 (segundos):

| Configuración | Mac M4 Max | Galaxy S26 | Pixel 8a |
|---|---|---|---|
| int4 GPU | 5,43 | 24,78 | no ejecutado |
| int8 CPU | 19,70 | 62,93 | 298,9 |
| int4 un bucle, GPU | 3,54 | 17,11 | no ejecutado |

Velocidad de decodificación: int4 en GPU de Galaxy S26 a 12,09 tok/s (medido 2026-10-22); en ejecuciones alternadas, el fichero de un bucle decodificó a 17,32 tok/s frente a 11,08 tok/s del int4 de dos bucles (2026-10-23). En CPU, un build int4 anterior prefijó a 29,0 tok/s frente a 92,1 tok/s del int8 en Galaxy S26.

## Requisitos de hardware

- VRAM estimada: int4 requiere aproximadamente 2,40 GB de almacenamiento y una huella de memoria similar en GPU; int8 requiere 4,05 GB; el modelo BF16 completo requiere aproximadamente 8 GB (3.975 millones de parámetros × 2 bytes).
- GPU recomendadas: GPU integradas o dedicadas de móviles (OpenCL delegate en Galaxy S26), GPU de Apple Silicon (Mac M4 Max), y GPU de escritorio con soporte OpenCL; no se especifican modelos A100/H100/RTX 4090 en la información.
- Cabe en GPU consumer: sí; el fichero int4 de 2,40 GB cabe en cualquier GPU con al menos 3-4 GB de VRAM libre, incluidas integradas de portátiles modernos.
- Opciones de despliegue: runtime LiteRT-LM (litert-lm 0.18.0) mediante `litert_lm_advanced_main`; el modelo base BF16 puede ejecutarse en llama.cpp; no se mencionan vLLM, TGI, Ollama ni llama.cpp para los ficheros `.litertlm`.
- Latencia y throughput: en Mac M4 Max, 5,43 s para 1.024+256 tokens en int4 GPU y 3,54 s en la variante de un bucle; en Galaxy S26, 24,78 s (int4 GPU), 17,11 s (un bucle) y 62,93 s (int8 CPU); en Pixel 8a, 298,9 s (int8 CPU).

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | GSM8K | Licencia | Formato |
|---|---|---|---|---|---|
| Dory1.0-4B (int4, 2 bucles) | 3.975 M | 2.048 tokens KV (131.072 vocab) | 90 | OpenMDW 1.1 | LiteRT-LM |
| Dory1.0-4B (int8) | 3.975 M | 2.048 tokens KV | 93 | OpenMDW 1.1 | LiteRT-LM |
| Dory1.0-4B BF16 (llama.cpp) | 3.975 M | no disponible | 95 | OpenMDW 1.1 | BF16 |
| Alternativas de ~4B on-device | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks ni especificaciones de modelos comparables de la misma categoría (aproximadamente 4B parámetros, on-device, razonamiento) en la información proporcionada.

## Limitaciones y advertencias

- Solo soporta inglés; no hay capacidades multilingües declaradas.
- El presupuesto de caché KV de 2.048 tokens limita el contexto efectivo en producción, muy por debajo de los 131.072 tokens del vocabulario.
- En CPU, los pesos int4 producen respuestas greedy que cambian de una CPU a otra (según la model card), por lo que el fichero int4 no es adecuado para CPU; debe usarse int8 en CPU.
- La variante de un solo bucle reduce la precisión en GSM8K de 90 a 86 y de 95 a 86 en BF16, por lo que no es recomendable para tareas que requieran máxima exactitud.
- Riesgo de alucinación inherente a los modelos de lenguaje; no se documentan evaluaciones de sesgo en la información disponible.
- La licencia OpenMDW 1.1 permite uso comercial según NVIDIA, pero conviene revisar los términos completos en el enlace oficial antes de desplegar en producción.
- El rendimiento medido en Galaxy S26 puede variar por throttling térmico: la model card indica que en las ejecuciones del 2026-10-23 el reloj de GPU estaba por debajo del límite térmico en más muestras que el 2026-10-22.
- La información sobre tool calling, soporte de agentes y datos de entrenamiento no está disponible.

## Enlaces

- Hugging Face (conversión LiteRT-LM): https://huggingface.co/litert-community/NVIDIA-Nemotron-Labs-Dory1.0-4B
- Modelo base BF16 en Hugging Face: https://huggingface.co/nvidia/NVIDIA-Nemotron-Labs-Dory1.0-4B-BF16
- Runtime LiteRT-LM (Google AI Edge): https://github.com/google-ai-edge/LiteRT-LM
- Herramienta de conversión hf-to-litertlm: https://github.com/john-rocky/hf-to-litertlm
- Script de verificación de calidad: https://github.com/john-rocky/hf-to-litertlm/blob/main/scripts/verify_quality.py
- Licencia OpenMDW 1.1: https://openmdw.ai/license/1-1/
