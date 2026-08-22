# protoLabsAI/Ornith-1.5-35B-A3B-NVFP4

## Resumen

Ornith-1.5-35B-A3B-NVFP4 es una cuantización W4A4 NVFP4 del modelo de mezcla de expertos (MoE) `ornith-ai/Ornith-1.5-35B-A3B`, desarrollada por protoLabsAI como alternativa a la cuantización oficial de NVIDIA ModelOpt. El modelo base, creado por ornith-ai, activa aproximadamente 3.000 millones de parámetros por token de un total de 35.000 millones, distribuidos en 256 expertos con 8 activos por token y 40 capas, e incluye capacidades nativas de visión (image-text-to-text). Esta versión cuantizada reduce el peso a 25,0 GB y está optimizada para GPUs Blackwell (sm120) mediante el backend Marlin de vLLM.

La relevancia de esta ficha radica en que ofrece una cuantización alternativa con una decisión técnica diferenciada: mantiene toda la ruta de atención lineal DeltaNet en bf16 en lugar de cuantizarla, basándose en hallazgos de que la baja precisión corrompe esta arquitectura. Esto la hace especialmente interesante para desarrolladores que buscan desplegar el modelo en producción con vLLM y necesitan evaluar si esta elección compensa el mayor tamaño frente a la versión de ModelOpt (23,4 GB). El modelo se distribuye bajo licencia MIT y se sirve mediante el formato `nvfp4-pack-quantized` de compressed-tensors.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (mixture of experts) con 256 expertos, 8 activos por token, 40 capas, atención lineal DeltaNet, visión nativa |
| Parametros totales | 35.107.181.936 (35,1 B) |
| Parametros activos | 3 B |
| Longitud de contexto | 262.144 tokens (configurado en el comando de despliegue; verificado hasta 200.409 tokens en test de aguja) |
| Tipos de cuantizacion | NVFP4 W4A4 (expertos y atención), bf16 (router, DeltaNet, vision tower, lm_head, embed_tokens, MTP) |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors, formato `nvfp4-pack-quantized` (compressed-tensors) |

## Arquitectura y entrenamiento

El modelo base Ornith-1.5-35B-A3B es una MoE construida sobre la arquitectura Qwen 3.5 y Gemma 4 mediante continued pretraining, mid-training y post-training con aprendizaje por refuerzo (RL). Cuenta con 256 expertos de los cuales se activan 8 por token, 40 capas, y una torre de visión integrada que le permite procesar entradas de imagen y texto. Incorpora atención lineal DeltaNet (GDN) junto con atención tradicional, y un mecanismo de razonamiento adaptativo que consume presupuesto de tokens según la dificultad de la tarea.

La cuantización NVFP4 se realizó con llm-compressor (compressed-tensors) sobre 128 muestras de calibración de 2048 tokens del dataset `ultrachat_200k`, con `moe_calibrate_all_experts=True`. Se cuantizaron las 30.720 proyecciones de expertos (40 × 256 × 3) y las 160 proyecciones de atención a NVFP4 W4A4, mientras que el router, la puerta de experto compartido, la atención lineal DeltaNet, la torre de visión, la cabeza de salida y las incrustaciones se mantienen en bf16. El modelo incluye además una cabeza MTP (multi-token prediction) con 785 tensores en bf16, que se conserva pero no es servible con el backend Marlin en vLLM.

## Capacidades

- Generación de texto y razonamiento complejo: obtiene 0,861 en el benchmark `reasoning_hard` (7/9 pases completos).
- Tool calling y function calling: 0,889 en `function_call` con 48/54 llamadas correctas, soportando el formato qwen3_xml.
- Capacidades de agente: 0,719 en el benchmark `claw` (agente con juicio LLM independiente, 10 tareas, robustez 1,00).
- Visión: procesa imágenes y texto (pipeline image-text-to-text), verificado con 5/5 formas y OCR de wordmark 3/3 exacto.
- Razonamiento adaptativo: el modelo decide cuántos tokens de razonamiento usar según la tarea, lo que requiere presupuesto de tokens suficiente.
- Soporte de contexto largo: verificado con precisión de aguja a 200.409 tokens de prompt.
- Multilingüismo: no confirmado en la información disponible.

## Casos de uso

- Despliegue de un asistente de razonamiento en producción con vLLM sobre GPUs Blackwell: el modelo se sirve con `--moe-backend marlin` y `--generation-config auto`, alcanzando un rendimiento competitivo en tareas de razonamiento y llamada a funciones con un tamaño de 25 GB.
- Automatización de atención al cliente con contexto largo: su ventana de 262.144 tokens permite mantener conversaciones multi-turno extensas, con detección de coherencia limpia a 32K y 131K tokens.
- Generación de código asistida por agente: aunque LiveCodeBench arroja 0,205 en problemas hard, el modelo muestra capacidad parcial (hasta 0,95 en problemas individuales) y puede integrarse en pipelines de CI/CD con tool calling.
- Análisis de documentos con imagen y texto: la torre de visión nativa permite extraer información de capturas, diagramas y documentos escaneados, con OCR verificado.
- Razonamiento matemático y lógico: con 0,861 en `reasoning_hard`, es adecuado para tareas de resolución de problemas paso a paso, como verificación de demostraciones o análisis de datos.
- Evaluación comparativa de cuantizaciones: útil para equipos que necesitan comparar el rendimiento de distintas implementaciones NVFP4 (compressed-tensors vs ModelOpt) en su carga de trabajo específica antes de elegir una para producción.

## Benchmarks y rendimiento

Los siguientes resultados fueron medidos por protoLabsAI sobre esta build sirviéndose en producción, con un juez LLM independiente (`claw`) y verificación por ejecución de código:

| Benchmark | Puntuacion | Tipo de evaluacion | Detalle |
|---|---|---|---|
| claw | 0,719 | agentico / LLM-juzgado | 10 tareas, robustez 1,00, sin fallbacks del juez |
| reasoning_hard | 0,861 | verificado por solver | 7/9 pases completos |
| function_call | 0,889 | verificado por esquema | 48/54 correctas, 100% sin etiquetar, 85% in-proc, 90% ext |
| livecodebench | 0,205 | ejecucion de codigo | 30 problemas hard, solo con pensamiento desactivado, credito parcial |

Nota importante sobre LiveCodeBench: la puntuación de 0,205 corresponde a crédito parcial (tasa de pases por test); ningún problema de los 30 hard pasó todos los tests. Sin embargo, problemas individuales alcanzaron hasta 0,95 con 17/20 tests correctos. La familia Ornith-1.5-35B en general muestra debilidad en esta suite, con la versión ModelOpt midiendo entre 0,163 y 0,365 según configuración. Los autores advierten que la variabilidad entre ejecuciones es alta (8-14 soluciones de diferencia en pesos idénticos) y recomiendan benchmarkear ambas builds antes de decidir.

## Requisitos de hardware

- VRAM estimada: 25,0 GB para los pesos en NVFP4, más la KV cache (no fijada; se puede configurar según disponibilidad). Con `--gpu-memory-utilization 0.62` y 16 secuencias simultáneas, cabe en una GPU con 40 GB o más.
- GPU recomendadas: NVIDIA Blackwell (sm120), por ejemplo B200 o RTX PRO 6000 Blackwell. No se garantiza funcionamiento en arquitecturas anteriores.
- Backend de inferencia: vLLM con `--moe-backend marlin` (obligatorio; el backend trtllm automático falla con el kernel `Sm120_SafeFP4`). También es posible usar otros backends que soporten el formato `nvfp4-pack-quantized`.
- No se dispone de datos de latencia o throughput específicos en la información proporcionada.
- La cabeza MTP no es servible con Marlin en vLLM/sm120; otros backends podrían utilizarla, aunque los autores indican que MTP perjudica el rendimiento en MoE.

## Comparativa con modelos similares

| Modelo | Parametros | Activos | Contexto | Licencia | Notas |
|---|---|---|---|---|---|
| protoLabsAI/Ornith-1.5-35B-A3B-NVFP4 | 35,1 B | 3 B | 262.144 | MIT | Cuantización NVFP4 con compressed-tensors, DeltaNet en bf16, 25,0 GB |
| ornith-ai/Ornith-1.5-35B-A3B-NVFP4 (upstream) | 35,1 B | 3 B | 262.144 | MIT | Cuantización NVFP4 con NVIDIA ModelOpt 0.45, KV cache FP8, DeltaNet con out_proj cuantizado, 23,4 GB |
| ornith-ai/Ornith-1.5-35B-A3B (base) | 35,1 B | 3 B | 262.144 | MIT | Pesos completos, no cuantizado, requiere más VRAM |
| Qwen 3.6-35B | ~35 B | no disponible | no disponible | no disponible | Modelo denso comparable; Ornith-1.5 lo supera en benchmarks de codificación y agentes según la documentación del modelo base |
| Gemma 4-31B | ~31 B | denso | no disponible | no disponible | Modelo denso; Ornith-1.5 lo supera por amplio margen según la documentación del modelo base |

La comparación directa entre esta build y la de ModelOpt muestra diferencias de 1,6 GB (25,0 vs 23,4) debido a la decisión de mantener DeltaNet en bf16. En `function_call`, esta build obtiene 0,889 frente a 0,870 de la upstream, pero los autores no reclaman superioridad general y recomiendan medir en la carga de trabajo propia.

## Limitaciones y advertencias

- LiveCodeBench es débil en toda la familia Ornith-1.5-35B; esta build obtiene 0,205 con crédito parcial y ningún pase completo en problemas hard. No es adecuado para generación de código competitiva sin evaluación previa.
- El backend Marlin es obligatorio en vLLM; el backend automático trtllm provoca fallos de segmentación. Esto limita la portabilidad a otros entornos.
- El modelo puede no terminar la generación a baja temperatura; es necesario usar `--generation-config auto` y presupuestar tokens de razonamiento. Un `max_tokens` corto devuelve contenido vacío con `finish_reason=length`.
- La cabeza MTP se incluye pero no es servible con Marlin; los autores indican que MTP perjudica el rendimiento en MoE por el coste de enrutamiento.
- La cuantización NVFP4 está diseñada para GPUs Blackwell (sm120); no se garantiza su funcionamiento en hardware anterior.
- No se dispone de información sobre sesgos, alucinaciones o limitaciones idiomáticas específicas del modelo.
- Aunque la licencia es MIT, el uso en producción requiere validar el rendimiento en la tarea concreta, especialmente en generación de código y razonamiento de larga duración.

## Enlaces

- Repositorio HuggingFace de esta build: https://huggingface.co/protoLabsAI/Ornith-1.5-35B-A3B-NVFP4
- Modelo base (ornith-ai): https://huggingface.co/ornith-ai/Ornith-1.5-35B-A3B
- Cuantización oficial upstream (ModelOpt): https://huggingface.co/ornith-ai/Ornith-1.5-35B-A3B-NVFP4
- Build anterior de protoLabsAI (Ornith-1.0): https://huggingface.co/protoLabsAI/Ornith-1.0-35B-NVFP4
- Imagen Docker del modelo base: https://hub.docker.com/r/ai/ornith-1.5
- Ficha del modelo base en aimodels.fyi: https://www.aimodels.fyi/models/huggingFace/ornith-1.5-35b-a3b-ornith-ai
- Ficha del modelo base en Baseten: https://www.baseten.co/library/ornith-15-35b-a3b/
- Estudio de protoLabsAI: https://protolabs.studio
