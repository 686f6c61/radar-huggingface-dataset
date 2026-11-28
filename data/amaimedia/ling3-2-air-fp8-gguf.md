# AMAImedia/Ling3.2-air-FP8-GGUF

## Resumen

Ling-3.2-air es un modelo de lenguaje multimodal de pesos abiertos desarrollado por inclusionAI (equipo vinculado a Ant Group), distribuido en este repositorio como una cuantización FP8 en formato GGUF a cargo de AMAImedia. Se trata de un modelo de arquitectura híbrida lineal-MoE (mezcla de expertos) con 124.000 millones de parámetros totales y 5.500 millones activos por token, lo que lo sitúa en la categoría de modelos "grandes pero eficientes en inferencia". El contexto nativo alcanza los 262.144 tokens (256K), y comparte arquitectura multimodal nativa con Ling-3.0-flash-VL.

El modelo está orientado a automatización de flujos de trabajo, razonamiento sobre documentos profesionales, análisis de datos cuantitativos y tareas legales. Según la model card, mejora sustancialmente a su predecesor en benchmarks propietarios como AutomationBench-AA (del 15,7% al 61%), GDP.pdf (del 8,4% al 16%) y Terminal-Bench 4.0 (del 0% al 27%), y obtiene una puntuación de 23 en el Artificial Analysis Intelligence Index v5.0.1.

Este repositorio concreto es relevante porque ofrece una versión cuantizada en FP8 con calibración imatrix, pensada para despliegues que requieren reducir huella de memoria sin recurrir a cuantizaciones agresivas. Está etiquetado como compatible con endpoints y soporta 30 idiomas, incluidos español, inglés, chino, ruso, árabe y japonés. La licencia es MIT, lo que facilita su uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Hybrid-linear MoE (35 capas KDA + 7 capas Gated MLA, ratio 5:1) |
| Parametros totales | 124B (127.920.654.544 según safetensors) |
| Parametros activos | 5.5B |
| Longitud de contexto | 262.144 tokens (256K) |
| Tipos de cuantizacion | FP8 (esta version); GGUF disponible en el repo base de bartowski |
| Idiomas soportados | zh, en, ru, vi, ja, hi, es, fr, de, pt, it, ar, ko, th, id, ms, bn, tr, pl, uk, nl, cs, sv, ro, el, he, fa, ur, kk, uz (30 idiomas) |
| Licencia | MIT |
| Formato de pesos | GGUF (cuantizacion FP8), safetensors en el modelo original |
| Capas transformer | 35 KDA + 7 Gated MLA (5:1) |
| Capas densas | 2 |
| Expertos enrutados | 512 |
| Expertos compartidos | 1 |
| Expertos activados | 8 |
| Cabezas de atencion | 32 |
| Hidden size | 2560 |
| Tamano intermedio de experto | 768 |
| Tamano intermedio denso | 6144 |
| Tamano de vocabulario | 157.184 |
| Tamano del repositorio | 263,8 GB |
| Descargas | 1.131 |
| Fecha de creacion | 2026-11-24 |

## Arquitectura y entrenamiento

Ling-3.2-air emplea una arquitectura híbrida que combina 35 capas de atención lineal (KDA, Kernelized Linear Attention o variante equivalente) con 7 capas de Gated MLA (Multi-head Latent Attention con compuerta), en una proporción 5:1. Esta combinación busca reducir el coste computacional del contexto largo —típico de la atención lineal— manteniendo la calidad expresiva del MLA en capas clave. La estructura MoE cuenta con 512 expertos enrutados y 1 experto compartido, activando 8 expertos por token, lo que resulta en 5,5B de parámetros activos sobre 124B totales. Incluye 2 capas densas y un vocabulario de 157.184 tokens.

El modelo es multimodal nativo (etiqueta `bailing_moe_v3_vl`), por lo que integra procesamiento de visión además de texto. La model card menciona soporte de decodificación especulativa MTP (NEXTN) y optimizaciones de decodificación para hardware Hopper en el contenedor SGLang recomendado. No se detalla en la información proporcionada el número exacto de tokens de entrenamiento, la composición del dataset ni si se aplicaron fases de RLHF o DPO; estos datos no están disponibles en el material consultado.

## Capacidades

- Generación de texto conversacional y razonamiento multi-turno con ventanas de hasta 256K tokens.
- Razonamiento sobre documentos profesionales (informes, PDF, documentación técnica y legal).
- Automatización de flujos de trabajo (workflow automation), con mejoras notables en AutomationBench-AA.
- Análisis de datos cuantitativos y tareas de índole legal (evaluado en Harvey LAB-AA v1.1).
- Capacidades multimodales nativas (visión) heredadas de la arquitectura Ling-3.0-flash-VL.
- Soporte de tool calling / function calling, con parser `ling3` resuelto automáticamente desde la plantilla de chat.
- Soporte de agentes y razonamiento multi-paso (evaluado en Terminal-Bench 4.0).
- Modo de razonamiento (reasoning parser `auto`/`ling3`) para cadenas de pensamiento.
- Decodificación especulativa MTP (NEXTN) para acelerar la inferencia.
- Capacidades multilingües en 30 idiomas, incluidos español, inglés, chino, ruso, árabe, hindi y japonés.

## Casos de uso

- Automatización de flujos de trabajo empresariales: el modelo puede orquestar tareas multi-paso con tool calling y contexto largo, adecuado para pipelines donde se encadenan consultas a APIs, lectura de documentos y generación de informes.
- Análisis de documentos legales y contractuales: con 256K de contexto puede ingerir contratos completos y responder preguntas de criterio jurídico; la model card reporta un 87,7% de tasa de aprobación de criterios en Harvey LAB-AA v1.1.
- Procesamiento de PDF y documentación técnica extensa: la mejora en GDP.pdf (del 8,4% al 16% de all-pass) lo hace útil para extracción y razonamiento sobre documentos de varias decenas de páginas.
- Agentes de terminal y automatización de sistemas: con un 27% de pass rate en Terminal-Bench 4.0 puede emplearse en asistentes de operaciones que ejecutan comandos y validan resultados.
- Atención al cliente multilingüe: soporte de 30 idiomas y conversaciones multi-turno con contexto largo permiten gestionar historiales extensos sin truncamiento.
- Análisis de datos cuantitativos: tareas de interpretación de tablas, series y métricas financieras, apoyándose en el modo de razonamiento.
- Asistentes de código y revisión en pipelines CI/CD: el soporte de function calling permite integrarlo en herramientas de análisis estático o generación de parches.
- Doblaje y localización automatizada: el repositorio se publica en el marco de la plataforma NOESIS de doblaje multilingüe, lo que sugiere uso en traducción y síntesis de guiones.

## Benchmarks y rendimiento

| Benchmark | Ling-3.2-air | Predecesor (referencia en model card) |
|---|---|---|
| AutomationBench-AA | 61% | 15,7% |
| GDP.pdf (all-pass) | 16% | 8,4% |
| AA-Briefcase v1.1 (Elo) | 1340 | 987 (+353) |
| Terminal-Bench 4.0 (pass rate) | 27% | 0% |
| Artificial Analysis Intelligence Index v5.0.1 | 23 | no disponible |
| Harvey LAB-AA v1.1 (criterion pass) | 87,7% | no disponible |
| Harvey LAB-AA v1.1 (all-pass, antes de check) | 8,3% | no disponible |
| Harvey LAB-AA v1.1 (all-pass, tras check) | 0,8% | no disponible |

No se han publicado en la información disponible resultados de MMLU, HumanEval o GSM8K para este modelo.

## Requisitos de hardware

- VRAM estimada: al tratarse de una cuantización FP8 de un modelo de 124B, el peso en memoria ronda los 124 GB solo para parámetros; se requiere margen adicional para KV cache y activaciones.
- GPU recomendadas: la model card sugiere 4 GPUs de clase 141 GB (H20-3e o H200) o nodos Blackwell de 4 GPUs (B300 / GB300) para contexto completo de 256K con tensor parallelism 4.
- En GPUs de 80 GB (H100 / H800) se recomienda escalar a `--tp 8`.
- No cabe en GPUs de consumo: una RTX 4090 (24 GB) o una RTX 3060 (6 GB) son insuficientes incluso con cuantizaciones más agresivas del repo base de bartowski; el despliegue en consumer requiere offloading masivo a RAM/SSD y no es práctico para producción.
- Opciones de despliegue: SGLang (recomendado, con soporte day-0, MTP/NEXTN y parsers `ling3`), y en general el ecosistema GGUF (llama.cpp, Ollama) para versiones cuantizadas del repo base; se puede desplegar con el contenedor `lmsysorg/sglang:dev-Ling-3.0-flash-VL`.
- Latencia y throughput: no disponibles en la información proporcionada; la decodificación especulativa NEXTN y las optimizaciones Hopper deberían mejorar el throughput de decode respecto a un despliegue estándar.

## Comparativa con modelos similares

| Modelo | Parametros | Activos | Contexto | Licencia | Notas |
|---|---|---|---|---|---|
| Ling-3.2-air | 124B | 5,5B | 256K | MIT | Multimodal nativo, MoE híbrido |
| Ling-3.0-flash-VL | no disponible | no disponible | no disponible | no disponible | Predecesor arquitectónico directo |
| Ling-3.2-air (bartowski GGUF) | 124B | 5,5B | 256K | MIT | Mismo modelo en cuantizaciones GGUF estándar |

No se dispone en la información proporcionada de datos de benchmarks comparativos con modelos de otros fabricantes de la misma categoría (por ejemplo, otros MoE de ~100B con pocos parámetros activos), por lo que la comparativa se limita a las variantes del propio Ling.

## Limitaciones y advertencias

- Riesgo de alucinación material: la model card reporta que, en Harvey LAB-AA v1.1, la tasa all-pass cae del 8,3% al 0,8% tras aplicar el control de alucinaciones materiales, lo que indica que el modelo puede generar contenido plausible pero incorrecto en dominios especializados.
- Rendimiento limitado en tareas de terminal y agénticas: un 27% de pass rate en Terminal-Bench 4.0 implica que aún falla en la mayoría de tareas de ese tipo; no es adecuado como agente autónomo sin supervisión.
- Sesgos: no se documentan en la información disponible análisis de sesgos; al ser un modelo entrenado con datos multilingües a gran escala, es esperable sesgo cultural y lingüístico, especialmente hacia el chino y el inglés.
- Cobertura idiomática desigual: aunque declara 30 idiomas, no se aportan métricas por idioma; el rendimiento en lenguas de bajos recursos (kazajo, uzbeco, urdu) puede ser inferior.
- Restricciones de licencia: licencia MIT, permisiva para uso comercial; conviene verificar las condiciones del modelo base `inclusionAI/Ling-3.2-air` por si el autor original impone términos adicionales.
- Requisitos de hardware elevados: FP8 sobre 124B exige múltiples GPUs de datacenter; no es desplegable en entornos de consumo.
- Dependencia de `trust_remote_code` y parsers específicos (`ling3`): requiere versiones recientes de SGLang o transformers con soporte de la arquitectura `bailing_moe_v3_vl`.
- El repositorio es una cuantización de terceros (AMAImedia) sobre el GGUF de bartowski; la calidad de la cuantización FP8 con imatrix no está validada con benchmarks propios en la información disponible.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/AMAImedia/Ling3.2-air-FP8-GGUF
- Modelo original: https://huggingface.co/inclusionAI/Ling-3.2-air
- GGUF base: https://huggingface.co/bartowski/Ling-3.2-air-GGUF
- Predecesor arquitectónico: https://huggingface.co/inclusionAI/Ling-3.0-flash-VL
- ModelScope: https://www.modelscope.cn/models/inclusionAI/Ling-3.2-air
- Organización en Hugging Face: https://huggingface.co/inclusionAI
- Web del autor de la cuantización: https://AMAImedia.com
- X (Twitter): https://x.com/AMAImediacom
- LinkedIn: https://www.linkedin.com/in/ilia-bolotnikov
- Telegram: https://t.me/djbionicl
