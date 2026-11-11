# IndexTeam/Index-Nailong-9B

## Resumen

Index-NativeLong-9B v1.1 es un modelo de traducción de documentos largos desarrollado por IndexTeam (equipo vinculado a Bilibili, según los enlaces del proyecto Index-Translate). Resuelve un problema concreto: la traducción de textos extensos (libros, novelas, artículos) manteniendo coherencia terminológica, nombres propios y flujo narrativo a lo largo de pasajes distantes. Para ello traduce el documento completo en una sola generación dentro de una ventana de contexto compartida entre prompt, texto fuente y traducción.

La versión 1.1 fusiona el modelo NativeLong de documentos largos con Index-Translate-9B, incorporando traducción multilingüe general e instrucciones de traducción (terminología, formato, estilo y contexto). El modelo tiene 8.953.803.264 parámetros (aproximadamente 9B), se distribuye en BF16 con pesos en safetensors y soporta una longitud de contexto de 262.144 tokens (256K).

Es relevante ahora porque aborda la traducción de documentos completos sin segmentación artificial, un escenario donde los modelos de traducción por fragmentos pierden consistencia. Su licencia Apache 2.0 y su integración con vLLM facilitan su despliegue en producción, aunque el contexto completo exige recursos de GPU considerables.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer autoregresivo (familia Qwen3.5 text, tag `qwen3_5_text`), decodificación estándar sin cabeza MTP (MTP0) |
| Parámetros totales | 8.953.803.264 (~9B) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | 262.144 tokens (256K), compartidos entre prompt, fuente y traducción generada |
| Tipos de cuantización | No disponible (los pesos publicados son BF16; no se documentan cuantizaciones oficiales) |
| Idiomas soportados | Plantillas oficiales para zh→en, en→zh, zh→ja y ja→zh; admite otros idiomas destino mediante instrucciones. Lista completa de idiomas: no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (BF16), biblioteca transformers |

## Arquitectura y entrenamiento

El modelo es un transformer autoregresivo de la familia Qwen3.5 (tag `qwen3_5_text`) con decodificación estándar; los pesos publicados son MTP0, es decir, sin cabeza de predicción multi-token, por lo que no emplea decodificación especulativa nativa basada en MTP. La innovación principal no reside en la arquitectura sino en el régimen de uso: la traducción se realiza en una única generación sobre el documento completo, con fuente y salida compartiendo la ventana de 256K tokens, lo que permite al modelo conectar detalles entre pasajes distantes y mantener nombres, terminología y orden de capítulos y párrafos.

La versión 1.1 resulta de la fusión de Index-Translate-9B con el modelo NativeLong de documentos largos, combinando traducción continua de documentos largos, traducción multilingüe general e instrucciones de traducción (glosarios, preservación de formato, adaptación de estilo y desambiguación con contexto). No se dispone de datos sobre número de tokens de entrenamiento, composición del dataset ni uso de RLHF/DPO en la información proporcionada.

## Capacidades

- Traducción de documentos completos en una sola generación, manteniendo coherencia global entre pasajes distantes.
- Traducción multilingüe general de textos cotidianos (redes sociales, artículos, ficción, subtítulos).
- Seguimiento de instrucciones de traducción: uso de terminología o glosarios especificados, preservación de formato y estructura, adaptación de estilo y desambiguación mediante contexto de fondo.
- Plantillas oficiales para las direcciones zh→en, en→zh, zh-ja y ja→zh; otras direcciones se especifican mediante instrucciones.
- Contexto largo de 256K tokens compartido entre entrada y salida.
- Decodificación voraz (greedy) y modo thinking desactivado en el cliente oficial de inferencia.
- Compatibilidad con endpoints (tag `endpoints_compatible`) y despliegue en vLLM con soporte de modelos de texto Qwen3.5.
- No se documentan capacidades de tool calling, agentes, visión ni audio.

## Casos de uso

- Traducción de novelas y libros completos zh→en o en→zh: el modelo recibe el documento entero en una generación y mantiene nombres de personajes, terminología y orden de capítulos gracias a la ventana de 256K tokens.
- Localización de ficción web china: con las plantillas GuoFeng/BWB del cliente oficial se traducen pasajes largos manteniendo el flujo narrativo entre escenas distantes.
- Traducción de documentación técnica con glosario: se especifican términos obligatorios mediante instrucciones, útil para manuales donde la consistencia terminológica es crítica.
- Traducción de artículos y prensa multilingüe: la capacidad de traducción general de Index-Translate-9B cubre textos cotidianos de distintos tipos y direcciones de idioma.
- Subtitulado y traducción de guiones: el modelo soporta textos de subtítulos dentro de sus benchmarks de instrucciones, con preservación de estructura y estilo.
- Traducción zh↔ja de contenido editorial: las plantillas oficiales zh-ja y ja-zh permiten flujos directos sin ingeniería de prompts adicional.
- Integración en pipelines editoriales: el cliente `doc_translate.py` transmite la traducción a un fichero de salida, lo que facilita su automatización en procesos de publicación.

## Benchmarks y rendimiento

Resultados en NativeLongBench (escala 0–100, mayor es mejor; media de los cinco grupos de longitud 4K, 8K, 16K, 32K y 64K tokens del lado chino; 274 pasajes de GuoFeng, BWB y General Books):

| Modelo | GuoFeng zh→en | BWB zh→en | General Books en→zh |
|---|---:|---:|---:|
| Index-NativeLong-9B v1.1 | 81,08 | 77,64 | 89,79 |
| Qwen3.8 Flash | 70,53 | 68,23 | 82,06 |
| Hy-MT2-7B | 20,82 | 19,83 | 23,60 |
| Hy-MT2-30B-A3B | 29,04 | 29,98 | 33,06 |

Media de los tres corpus para Index-NativeLong-9B v1.1: 82,84. La evaluación emplea Document-SEGALE/COMET, que alinea pasajes fuente y traducidos y puntúa la calidad frente a referencias. En los benchmarks de traducción multilingüe e instrucciones (TI3000/instTrans y otros tres), el modelo v1.1 rinde de forma cercana al Index-Translate-9B original, aunque los valores numéricos de esa comparación no se detallan en la información disponible.

## Requisitos de hardware

- Pesos BF16: aproximadamente 17,9 GB, según la model card.
- El servicio requiere memoria adicional para el runtime y la caché KV; el contexto completo de 256K puede requerir múltiples GPU.
- GPU recomendadas: no se especifican modelos concretos; se indica una GPU CUDA con entorno vLLM compatible con modelos de texto Qwen3.5. Para contexto completo, prever varias GPU de alta memoria (el dato exacto no está disponible).
- GPU de consumo: no confirmado; con 17,9 GB en BF16 no cabe en GPUs de 16 GB y requeriría cuantización no documentada oficialmente para GPUs de 24 GB con contexto reducido.
- Despliegue: vLLM (`vllm serve ... --max-model-len 262144`) con el repositorio Index-Translate; no se documentan opciones para llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | NativeLongBench (media 3 corpus) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Index-NativeLong-9B v1.1 | ~9B | 256K | 82,84 | Apache 2.0 | Hugging Face, ModelScope |
| Qwen3.8 Flash | No disponible | No disponible | ~73,6 (calculado de sus tres resultados) | No disponible | No disponible |
| Hy-MT2-7B | 7B | No disponible | ~21,4 (calculado de sus tres resultados) | No disponible | No disponible |
| Hy-MT2-30B-A3B | 30B (MoE, 3B activos por el nombre) | No disponible | ~30,7 (calculado de sus tres resultados) | No disponible | No disponible |

Las medias de los modelos comparados se han calculado a partir de sus tres puntuaciones publicadas en la tabla de benchmarks; no son cifras reportadas por el autor como media.

## Limitaciones y advertencias

- Los pesos publicados son text-only; no hay capacidades multimodales.
- Es MTP0: no incluye cabeza de predicción multi-token, por lo que no aprovecha decodificación especulativa basada en MTP.
- La ventana de 256K es compartida entre prompt, fuente y traducción: documentos muy largos dejan poco margen para la salida y exigen reservar presupuesto.
- El cliente oficial usa decodificación voraz y desactiva el modo thinking; comportamientos fuera de ese régimen no están documentados.
- La lista completa de idiomas soportados no está disponible; las plantillas oficiales cubren solo zh-en, en-zh, zh-ja y ja-zh.
- Las referencias en chino de General Books son generadas por modelo, lo que puede introducir sesgo en las puntuaciones de ese corpus.
- Riesgo de alucinación y de desviación terminológica en pasajes ambiguos no cuantificado en la información disponible; se recomienda revisión humana en producción editorial.
- Sesgos conocidos: no documentados.
- Licencia Apache 2.0: permite uso comercial, pero conviene revisar las condiciones del repositorio Index-Translate y de las dependencias (vLLM, Qwen3.5) antes de desplegar.
- El contexto completo puede requerir múltiples GPU, lo que encarece el despliegue en producción.

## Enlaces

- Hugging Face: https://huggingface.co/IndexTeam/Index-Nailong-9B
- ModelScope: https://modelscope.cn/models/IndexTeam/Index-Nailong-9B
- Demo online: https://index-translate.bilibili.com/
- GitHub (Index-Translate): https://github.com/bilibili/Index-Translate
- Informe técnico (arXiv): https://arxiv.org/abs/2609.40181
- Modelo previo Index-Translate-9B: https://huggingface.co/IndexTeam/Index-Translate-9B
- Benchmark NativeLongBench: https://github.com/bilibili/Index-Translate/blob/main/benchmarks/nativelong/README.md
- Documentación de evaluación: https://github.com/bilibili/Index-Translate/blob/main/docs/evaluation.md
