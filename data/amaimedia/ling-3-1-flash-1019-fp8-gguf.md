# AMAImedia/Ling-3.1-Flash-1019-FP8-GGUF

## Resumen

Ling-3.1-Flash-1019 es un modelo de lenguaje de tipo Mixture-of-Experts (MoE) desarrollado por inclusionAI, presentado como una versión mejorada de Ling-3.1-flash. Cuenta con 560B parámetros totales, 25B parámetros activos por token y una ventana de contexto de 1M tokens. La ficha que nos ocupa, publicada por AMAImedia, es una cuantización FP8 en formato GGUF del modelo original, orientada a despliegues con requisitos de memoria reducidos respecto a los pesos en precisión completa.

El modelo emplea una arquitectura híbrida lineal-MoE con 63 capas KDA (Kimi Delta Attention) y 9 capas Gated MLA en proporción 7:1, 512 expertos enrutados con 8 activos por token y 1 experto compartido. Las mejoras de post-entrenamiento de esta iteración se centran en razonamiento y capacidades agénticas: la puntuación AA-Briefcase sube de aproximadamente 1400 a 1524 Elo, AutomationBench-AA pasa del 62% al 68% y el Artificial Analysis Intelligence Index v4.3.2 alcanza 44 puntos (frente a 41 del predecesor).

La relevancia de esta publicación radica en que ofrece el modelo en FP8 GGUF con licencia MIT y soporte para 29 idiomas, incluyendo el español, lo que facilita su evaluación e integración en pipelines de inferencia locales o en servidores con aceleración de cuantización. El repositorio tiene un tamaño de 800,6 GB y está pensado para despliegues de gran escala más que para hardware de consumo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Hybrid-linear MoE (63 capas KDA + 9 capas Gated MLA, ratio 7:1; 4 capas densas) |
| Parametros totales | 572.120.680.768 (560B según model card) |
| Parametros activos | 25B por token |
| Longitud de contexto | 1.000.000 tokens |
| Tipos de cuantizacion | FP8 (esta ficha); GGUF disponible en el repo base de AtomicChat |
| Idiomas soportados | zh, en, ru, vi, ja, hi, es, fr, de, pt, it, ar, ko, th, id, ms, bn, tr, pl, uk, nl, cs, sv, ro, el, he, fa, ur, kk, uz (29 idiomas) |
| Licencia | MIT |
| Formato de pesos | safetensors y GGUF (FP8) |
| Expertos enrutados | 512 (8 activos por token) + 1 experto compartido |
| Cabezas de atencion | 64 |
| Hidden size | 4096 |
| Tamano intermedio de experto | 1280 |
| Tamano intermedio denso | 10240 |
| Vocabulario | 157.184 tokens |
| Tamano del repositorio | 800,6 GB |

## Arquitectura y entrenamiento

La arquitectura es un transformer MoE híbrido que combina 63 capas de Kimi Delta Attention (KDA) con 9 capas de Gated MLA, en una proporción 7:1, más 4 capas densas. El componente MoE cuenta con 512 expertos enrutados, de los cuales se activan 8 por token, junto con un experto compartido. El hidden size es de 4096, con 64 cabezas de atención, un tamaño intermedio de experto de 1280 y un tamaño intermedio denso de 10240. El vocabulario alcanza los 157.184 tokens. Esta combinación de atención lineal y atención latente busca sostener ventanas de contexto de 1M tokens con un coste computacional y de memoria contenido.

El modelo es una actualización de Ling-3.1-flash mediante optimizaciones de post-entrenamiento orientadas a razonamiento y ejecución de tareas agénticas en escenarios reales. La model card no detalla el volumen de tokens de entrenamiento, la composición exacta del dataset ni si se emplearon técnicas concretas de RLHF o DPO. Sí se documenta soporte para decodificación especulativa MTP (NEXTN) en SGLang y optimizaciones de decode para Hopper, lo que sugiere que el modelo incorpora cabezas de predicción multi-token para acelerar la inferencia.

## Capacidades

- Generación de texto conversacional multi-turno con contexto de hasta 1M tokens.
- Razonamiento complejo y ejecución de tareas multi-paso, con modo de pensamiento activable mediante `enable_thinking`.
- Capacidades agénticas: puntuación de 1524 Elo en AA-Briefcase y 68% en AutomationBench-AA.
- Razonamiento científico y generación de código científico: 26% en CritPt y 57% en SciCode.
- Soporte de tool calling y function calling, con recetas verificadas en el cookbook de SGLang.
- Multilingüismo en 29 idiomas, incluyendo español, inglés, chino, ruso, japonés, hindi, árabe y coreano.
- Compatibilidad con endpoints de API (tag `endpoints_compatible`).
- Decodificación especulativa MTP (NEXTN) para acelerar la generación.

## Casos de uso

- Automatización de atención al cliente multilingüe: el modelo puede mantener conversaciones multi-turno en 29 idiomas con contexto de 1M tokens, lo que permite adjuntar historiales completos o documentación extensa sin truncar.
- Ejecución de flujos agénticos de automatización: con un 68% en AutomationBench-AA y soporte de tool calling, es adecuado para orquestar llamadas a APIs y tareas multi-paso en entornos de producción.
- Asistencia en investigación científica: sus resultados en CritPt (26%) y SciCode (57%) lo hacen útil para generación y revisión de código científico y razonamiento sobre literatura técnica.
- Análisis de documentos largos: la ventana de 1M tokens permite procesar contratos, informes o bases de código completas en una sola pasada sin técnicas de chunking.
- Plataformas de doblaje y localización: el autor lo publica en el marco de NOESIS, una plataforma de automatización de doblaje multilingüe, donde el modelo puede generar y adaptar guiones en múltiples idiomas.
- Despliegue en infraestructura con aceleración FP8: la versión GGUF FP8 permite servir el modelo en clústeres con H200, GB300 o B200 usando SGLang o vLLM, reduciendo el ancho de banda de memoria frente a BF16.
- Generación de código en pipelines de CI/CD: la integración con tool calling y endpoints compatibles facilita su uso como servicio de revisión o generación de parches.

## Benchmarks y rendimiento

| Benchmark | Ling-3.1-flash (predecesor) | Ling-3.1-flash-1019 |
|---|---|---|
| AA-Briefcase (Elo) | ~1400 | 1524 |
| AutomationBench-AA | 62% | 68% |
| CritPt | 18% | 26% |
| SciCode | 54% | 57% |
| Artificial Analysis Intelligence Index v4.3.2 | 41 | 44 |

No se han publicado en la información disponible resultados de MMLU, HumanEval o GSM8K para este modelo.

## Requisitos de hardware

- VRAM estimada: con 572B parámetros en FP8, los pesos ocupan aproximadamente 572 GB, a los que hay que sumar caché KV y overhead del runtime. El despliegue requiere múltiples aceleradores.
- GPU recomendadas: la model card documenta recetas verificadas para 8 × H200 (TP8 + EP8), 4 × GB300 (TP4 + EP4), H800, H100 y B200.
- No cabe en GPU de consumo: el tamaño del repositorio (800,6 GB) y el número de parámetros descartan RTX 4090 o similares para inferencia completa.
- Opciones de despliegue: SGLang (recomendado, con imagen `lmsysorg/sglang:dev-ling-3.1-flash`), vLLM y llama.cpp/GGUF para los formatos cuantizados del repo base.
- Aceleración: decodificación especulativa NEXTN y optimizaciones Hopper (`SGLANG_ENABLE_FP8_BLOCK_GEMV=1`, `SGLANG_ENABLE_FUSED_KDA_OUTPUT_QUANT=1`) que según la model card mejoran el decode batch-1 en torno al 10%.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros totales | Activos | Contexto | Licencia | Formato |
|---|---|---|---|---|---|
| Ling-3.1-flash-1019 (esta ficha, FP8 GGUF) | 560B | 25B | 1M | MIT | safetensors, GGUF |
| Ling-3.1-flash (predecesor) | 560B | 25B | 1M | MIT | safetensors, GGUF |
| Alternativas de la misma categoría | no disponible | no disponible | no disponible | no disponible | no disponible |

La información proporcionada no incluye datos de otros modelos comparables de la misma escala, por lo que la comparativa se limita al predecesor directo.

## Limitaciones y advertencias

- El modelo base es de 560B parámetros: su despliegue exige clústeres multi-GPU y no es viable en hardware de consumo.
- La model card no documenta sesgos conocidos ni evaluaciones de seguridad o alineación.
- Riesgo de alucinación inherente a los modelos generativos; no se han publicado métricas específicas de factualidad.
- Aunque soporta 29 idiomas, el rendimiento por idioma no está cuantificado en la información disponible; el español figura en la lista pero sin benchmarks propios.
- La licencia MIT permite uso comercial, pero conviene verificar las condiciones del modelo base original de inclusionAI y de la cuantización intermedia de AtomicChat.
- Esta ficha es una cuantización FP8: puede haber degradación de precisión respecto a los pesos originales, no cuantificada en la información disponible.
- El repositorio incluye material promocional y enlaces de donación del autor de la cuantización; no afecta a la funcionalidad pero conviene tenerlo en cuenta al evaluar la procedencia.
- No se dispone de datos de latencia, throughput ni consumo energético en producción.

## Enlaces

- Hugging Face (esta ficha): https://huggingface.co/AMAImedia/Ling-3.1-Flash-1019-FP8-GGUF
- Modelo original: https://huggingface.co/inclusionAI/Ling-3.1-flash-1019
- GGUF base: https://huggingface.co/AtomicChat/Ling-3.1-flash-1019-GGUF
- Predecesor: https://huggingface.co/inclusionAI/Ling-3.1-flash
- Organización inclusionAI en Hugging Face: https://huggingface.co/inclusionAI
- ModelScope: https://modelscope.cn/organization/inclusionAI
- OpenRouter: https://openrouter.ai/inclusionai/ling-3.1-flash
- Cookbook de SGLang: https://docs.sglang.io/cookbook/autoregressive/InclusionAI/Ling-3.1-flash
- Web del autor de la cuantización: https://AMAImedia.com
- X (Twitter): https://x.com/AMAImediacom
- LinkedIn: https://www.linkedin.com/in/ilia-bolotnikov
- Telegram: https://t.me/djbionicl
