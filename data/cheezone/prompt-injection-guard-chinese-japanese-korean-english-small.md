# CheezOne/prompt-injection-guard-chinese-japanese-korean-english-small

## Resumen

Prompt Injection Guard (CJK, small) es un clasificador de texto disenado para detectar intentos de prompt injection y jailbreak en entradas de usuario, documentos y salidas de herramientas. Lo desarrolla CheezOne y se presenta como un reemplazo directo de `protectai/deberta-v3-base-prompt-injection-v2`, manteniendo las mismas etiquetas `SAFE` / `INJECTION` y compatibilidad con LLM Guard. Su principal valor diferencial es el soporte nativo de chino, japones y coreano ademas del ingles, un hueco habitual en las herramientas de guardrails existentes.

El modelo parte de `jhu-clsp/mmBERT-small`, una arquitectura ModernBERT multilingue, y cuenta con 140.642.306 parametros totales. Con ese tamano es capaz de ejecutarse en CPU y en el navegador mediante ONNX y transformers.js, lo que lo hace adecuado para despliegues ligeros y filtrado previo a llamadas a LLM.

Es relevante ahora porque la superficie de ataque de los sistemas basados en agentes crece con la adopcion de tool calling y RAG: la inyeccion indirecta en documentos y salidas de herramientas es un vector realista, y disponer de un guardrail multilingue pequeno, con licencia Apache-2.0 y umbral configurable, simplifica su integracion en produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ModernBERT (encoder transformer), base `jhu-clsp/mmBERT-small` |
| Parametros totales | 140.642.306 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 512 tokens recomendados (clasificar en fragmentos de maximo 512) |
| Tipos de cuantizacion | ONNX fp32 (563 MB) e int8 (230 MB); pesos PyTorch en safetensors |
| Idiomas soportados | en, zh, ja, ko (otros idiomas no evaluados) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors, ONNX (fp32 e int8) |

## Arquitectura y entrenamiento

El modelo es un clasificador de secuencias construido sobre `jhu-clsp/mmBERT-small`, un encoder ModernBERT multilingue. La cabeza de clasificacion produce dos etiquetas: `SAFE` (0) e `INJECTION` (1), donde la segunda cubre inyeccion directa, jailbreak, extraccion de system prompt o secretos e inyeccion indirecta en documentos. El modelo opera con truncamiento a 512 tokens.

El entrenamiento combina aproximadamente 26.000 ejemplos publicos en ingles provenientes de deepset, jackhhao, neuralchemy (Apache-2.0), TrustAIRLab, Lakera y SPML (MIT) y NVIDIA Nemotron para inyecciones indirectas (CC-BY-4.0), mas unos 15.000 ejemplos sinteticos en zh/ja/ko/en generados con Qwen2.5-7B-Instruct: traducciones, ataques nativos, peticiones benignas y hard negatives. La model card no detalla si hubo RLHF o DPO; al tratarse de un clasificador, el ajuste es supervisado sobre etiquetas binarias.

## Capacidades

- Clasificacion binaria de texto como `SAFE` o `INJECTION` con puntuacion de confianza.
- Deteccion de prompt injection directa e indirecta (documentos, salidas de herramientas).
- Deteccion de jailbreak, extraccion de system prompt y de secretos.
- Soporte multilingue en ingles, chino, japones y coreano.
- Compatibilidad con LLM Guard como scanner `PromptInjection` (PyTorch y ONNX).
- Inferencia en CPU y en navegador via ONNX int8 y transformers.js.
- No soporta tool calling, agentes ni generacion de texto: es exclusivamente un clasificador.
- No dispone de modo thinking, vision ni audio.

## Casos de uso

- Filtrado previo de prompts en un chatbot: ejecutar el clasificador sobre cada mensaje del usuario antes de enviarlo al LLM, rechazando entradas con probabilidad de inyeccion superior al umbral configurado (0.92 en LLM Guard).
- Proteccion de pipelines RAG: clasificar fragmentos de documentos recuperados y salidas de herramientas para detectar inyeccion indirecta antes de insertarlos en el contexto del modelo.
- Guardrail en agentes con tool calling: validar las respuestas de APIs y herramientas externas, que pueden contener instrucciones maliciosas inyectadas, antes de que el agente las procese.
- Atencion al cliente multilingue en Asia-Pacifico: cubre en/zh/ja/ko con un unico modelo de 141M, evitando mantener clasificadores separados por idioma.
- Despliegue en el navegador: mediante transformers.js y el modelo int8 (230 MB) se puede filtrar texto en el cliente sin enviar datos al servidor, util en aplicaciones con requisitos de privacidad.
- Prefiltro de bajo coste en CPU: al ejecutarse sin GPU, sirve como primera capa de defensa en entornos con recursos limitados, dejando modelos mayores para una segunda verificacion.
- Cumplimiento y auditoria: registrar la puntuacion de riesgo de cada entrada para trazabilidad de intentos de ataque en sistemas expuestos.

## Benchmarks y rendimiento

Benchmark independiente en ingles (`DaveyD347/prompt-injection-benchmark`, test split, 1.985 textos, umbral 0.5, solo texto, 512 tokens):

| Modelo | F1 | AUROC | Recall @1% FPR | FPR | FPR hard-negative |
|---|---|---|---|---|---|
| Patronus wolf-defender (307M) | 0.946 | 0.992 | 0.901 | 0.082 | 0.187 |
| Horizon-Labs guard-base (307M, int8) | 0.925 | 0.994 | 0.944 | 0.161 | 0.244 |
| Este modelo, v2 (141M) | 0.907 | 0.977 | 0.743 | 0.191 | 0.303 |
| Este modelo, v1 | 0.860 | 0.934 | 0.330 | 0.330 | 0.428 |
| protectai deberta-v3-base v2 (184M) | 0.802 | 0.882 | 0.262 | 0.265 | 0.185 |

A umbral 0.5 captura el 97,5 % de ataques y marca el 19 % de textos benignos. A umbral 0.92 (por defecto en LLM Guard) captura el 93,5 % y marca el 11 % (F1 0.918).

Porcentaje de ataques capturados a 1 % FPR en conjunto retenido zh/ja/ko (4.668 textos):

| Modelo | 中文 | 日本語 | 한국어 |
|---|---|---|---|
| Este modelo (141M) | 82 | 79 | 70 |
| Horizon-Labs guard-small | 77 | 54 | 14 |
| Horizon-Labs guard-base | 86 | 50 | 14 |
| protectai deberta-v3-base v2 | 20 | 13 | 3 |

## Requisitos de hardware

- VRAM estimada: inferior a 1 GB en fp32 (141M parametros); el ONNX int8 ocupa 230 MB y el fp32 563 MB.
- GPU recomendadas: no requiere GPU; funciona en CPU. Cualquier GPU consumer (RTX 3060 o superior) acelera la inferencia pero no es necesaria.
- Cabe en cualquier GPU consumer e incluso en entornos sin GPU.
- Opciones de despliegue: transformers (pipeline de text-classification), LLM Guard (PyTorch u ONNX), ONNX Runtime, transformers.js en navegador, text-embeddings-inference segun tags del repo.
- Latencia y throughput: no disponibles en la informacion proporcionada. El modelo int8 toma la misma decision que PyTorch en el 99,9 % de los textos de prueba.

## Comparativa con modelos similares

| Modelo | Parametros | Idiomas | F1 (bench EN) | Licencia | Notas |
|---|---|---|---|---|---|
| Este modelo | 141M | en, zh, ja, ko | 0.907 | Apache-2.0 | Ejecutable en CPU y navegador |
| Patronus wolf-defender | 307M | no disponible | 0.946 | no disponible | Mejor F1, sin soporte CJK documentado |
| Horizon-Labs guard-base | 307M | no disponible | 0.925 | no disponible | Mejor recall @1% FPR en EN |
| protectai deberta-v3-base v2 | 184M | en | 0.802 | no disponible | Referencia previa, muy inferior en CJK |

## Limitaciones y advertencias

- Sesgos conocidos: no documentados en la informacion disponible.
- Riesgo de falsos positivos: textos benignos con base64 u otras codificaciones y algunos fragmentos de codigo generan alarmas; a umbral 0.5 se marca el 19 % de textos benignos en el benchmark independiente.
- Riesgo de falsos negativos: a umbral 0.92 se escapa aproximadamente el 6,5 % de ataques en el benchmark EN; en CJK el recall a 1 % FPR es del 70-82 %, por lo que no es una defensa completa.
- Limitacion de contexto: clasifica fragmentos de maximo 512 tokens; documentos largos requieren troceado.
- Limitacion de idioma: solo evaluado en en/zh/ja/ko; otros idiomas no estan cubiertos.
- Caveat de evaluacion: el conjunto de prueba CJK fue generado por la misma familia de LLM que los datos de entrenamiento, lo que favorece al modelo.
- Uso en produccion: debe combinarse con herramientas de minimo privilegio y verificacion de salidas; no sustituye a una defensa en profundidad.
- Licencia Apache-2.0: permite uso comercial sin restricciones adicionales conocidas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/CheezOne/prompt-injection-guard-chinese-japanese-korean-english-small
- Demo en el navegador: https://huggingface.co/spaces/CheezOne/prompt-injection-guard-demo
- Benchmark independiente: https://huggingface.co/datasets/DaveyD347/prompt-injection-benchmark
- Leaderboard del benchmark: https://huggingface.co/spaces/DaveyD347/prompt-injection-leaderboard
- Modelo base: https://huggingface.co/jhu-clsp/mmBERT-small
- Dataset propio: https://huggingface.co/datasets/CheezOne/prompt-injection-jailbreak-chinese-japanese-korean-english
- LLM Guard: https://github.com/protectai/llm-guard
- Modelo de referencia protectai: https://huggingface.co/protectai/deberta-v3-base-prompt-injection-v2
