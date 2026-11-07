# kataguru/Kataguru-Sceptic-35B-A3B-v3.1

## Resumen

Kataguru-Sceptic-35B-A3B-v3.1 es un modelo multimodal de tipo Mixture-of-Experts desarrollado por el usuario independiente kataguru, afinado a partir de Qwen/Qwen3.5-35B-A3B. Cuenta con 35.693.705.072 parámetros totales según los pesos en safetensors, de los cuales aproximadamente 3.000 millones se activan por token mediante enrutamiento top_k=8 sobre 254 expertos por capa, más dos ranuras reservadas (#254 y #255) pensadas para especialización modular empresarial. El modelo es bilingüe inglés-finlandés y está orientado a razonamiento, código competitivo, automatización industrial (PLC/SCL/TwinCAT/G-code), medicina clínica y agentes con tool calling.

La propuesta diferencial de esta versión es la metodología de entrenamiento en dos ciclos con protección de subespacio ortonormal, que según el autor eleva la media de 15 benchmarks del 69,24 % al 70,26 %, con incrementos destacados en GPQA Diamond (+12,62 pp hasta 70,20 %), LiveCodeBench v6 (+7,43 pp hasta 39,43 %) y detección de irrelevancia en BFCL V4 (+33,39 pp hasta 80,26 %). El modelo se distribuye en precisión completa bf16 (13 shards, 1.805 tensores, 67,0 GB) e incluye un encoder visual multimodal de 27 capas y una cabeza especulativa MTP en la capa 40.

Es relevante ahora porque combina ventana de contexto nativa de 262.144 tokens, capacidades multimodales imagen-texto, soporte de tool calling multi-turno y una orientación explícita a dominios técnicos poco cubiertos por modelos generalistas (automatización industrial, química de laboratorio, propiedad intelectual), todo bajo licencia Apache 2.0. No obstante, conviene tratar las cifras de benchmarks como declaraciones del autor, sin verificación independiente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture-of-Experts multimodal basada en transformer (Qwen3.5 MoE), 40 capas, 254 expertos enrutados por capa + 2 ranuras reservadas, top_k=8, encoder visual de 27 capas |
| Parametros totales | 35.693.705.072 |
| Parametros activos | ~3B por token (A3B), 254 expertos enrutados activos por capa |
| Longitud de contexto | 262.144 tokens (nativo) |
| Tipos de cuantizacion | bf16 (pesos publicados); NVFP4 disponible en variante separada (24,1 GB); GGUF en versiones anteriores (v2.6) |
| Idiomas soportados | Inglés (en) y finlandés (fi) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (bfloat16, 13 shards, 1.805 tensores, 67,0 GB) |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura MoE de Qwen3.5-35B-A3B: 40 capas con 254 expertos enrutados por capa y enrutamiento top_k=8, lo que resulta en unos 3B parámetros activos por token sobre un total de 35,7B. Incluye un encoder visual de 27 capas (tensores `model.visual.*`, 333 tensores) que habilita la modalidad imagen-texto, y una cabeza de decodificación especulativa MTP (Multi-Token Prediction) en la capa 40 (tensores `mtp.*`, 779 tensores). Respecto a la arquitectura estándar de 256 expertos de Qwen3.5 MoE, el autor indica 387M parámetros menos, reservando las ranuras #254 y #255 para especialización modular.

El afinamiento se realizó en dos ciclos: el primero aplica un subespacio ortonormal congelado (`qr_frozen_a`) y una protección de subespacio ortogonal de cuatro niveles sobre datos cognitivos, finlandeses, STEM de posgrado, medicina clínica y patentes EPO/PRH; el segundo emplea `weakest_link_oplora` con un escudo de anclaje cruzado 64/36 y poda de muestras mediante un oráculo epistémico (NLL < 0,35) sobre algoritmos competitivos verificados con `PASSED_EXEC`, ingeniería de software multi-turno, tool calling BFCL y automatización industrial PLC/CNC. No se especifican en la información disponible el volumen total de tokens de entrenamiento ni la composición exacta del dataset, ni si hubo RLHF o DPO.

## Capacidades

- Generación de texto y razonamiento de nivel doctoral en STEM (GPQA Diamond reportado en 70,20 %).
- Codificación competitiva y de ingeniería de software (LiveCodeBench v6 Pass@1 reportado en 39,43 %).
- Comprensión de imágenes y texto (pipeline image-text-to-text, encoder visual de 27 capas).
- Tool calling y function calling multi-turno, con soporte de `<tool_call>` en varios lenguajes y detección de irrelevancia (BFCL V4 reportado en 83,67 % AST single-turn).
- Razonamiento agéntico multi-paso y decodificación especulativa mediante cabeza MTP.
- Capacidades bilingües nativas inglés-finlandés, con flexión finlandesa verificada según el autor.
- Dominios técnicos especializados: automatización industrial (Siemens TIA Portal SCL, Beckhoff TwinCAT 3 ST, Fanuc/Sinumerik CNC G-code, OPC UA), química de laboratorio, propiedad intelectual y patentes, medicina clínica (MedQA reportado en 85,39 %).
- Modo de inspección de calidad de datos y "data surgeon" para curación autónoma de datasets.
- Disciplina anti-sicofancia (respuestas epistémicamente escépticas).

## Casos de uso

- Automatización industrial: generación y revisión de código SCL para Siemens TIA Portal, ST para Beckhoff TwinCAT 3 y G-code para Fanuc/Sinumerik, aprovechando el afinamiento específico en PLC/CNC y la ventana de 262.144 tokens para manejar proyectos completos de control.
- Ingeniería de software en producción: asistencia en refactorización y generación de código con soporte de tool calling, integrable en pipelines de CI/CD y en flujos multi-turno de resolución de incidencias.
- Agentes autónomos con herramientas: orquestación de llamadas a funciones externas con detección de irrelevancia mejorada, adecuado para asistentes que deben decidir cuándo no invocar una herramienta.
- Documentación técnica bilingüe inglés-finlandés: redacción y traducción de prosa técnica de ingeniería con calidad nativa en finlandés, útil para empresas nórdicas.
- Análisis clínico asistido: apoyo a la resolución de preguntas tipo USMLE y revisión de literatura médica, con la advertencia de que no sustituye juicio clínico profesional.
- Revisión de propiedad intelectual y patentes: análisis de reivindicaciones y comparación de documentos gracias al contexto largo y al entrenamiento en datos EPO/PRH.
- Inspección y curación de datasets: uso del modo "quality inspector" y "data surgeon" para detectar y corregir muestras de baja calidad en pipelines de datos.
- Procesamiento multimodal de documentación técnica: extracción de información de esquemas, planos o capturas de pantalla de entornos de automatización mediante el encoder visual.

## Benchmarks y rendimiento

Datos declarados por el autor, evaluados según indica con `lm-evaluation-harness 0.4.13`, LiveCodeBench v6 (175 problemas) y BFCL V4 (3.641 tareas AST single-turn) sobre 2x RTX 5090 32GB con TP=2.

| Benchmark | Kataguru v3.1 | Kataguru v2.8.1 | Ornith 1.5 35B-A3B (W4A16) | Kataguru v2.7 |
|---|---|---|---|---|
| Media 15 benchmarks | 70,26 % | 69,24 % | 65,49 % | 67,91 % |
| Media cognitiva 11 tareas | 72,00 % | 72,35 % | 67,63 % | 72,03 % |
| PIQA (acc_norm) | 83,57 % | 83,79 % | 80,58 % | 83,19 % |
| WinoGrande (acc) | 76,87 % | 75,77 % | 70,09 % | 75,85 % |
| MedQA (USMLE 4 opciones) | 85,39 % | no disponible en el extracto | no disponible en el extracto | no disponible en el extracto |
| GPQA Diamond | 70,20 % | 57,58 % | no disponible | no disponible |
| LiveCodeBench v6 (Pass@1) | 39,43 % | 32,00 % | no disponible | no disponible |
| BFCL V4 Single-Turn AST | 83,67 % | 82,33 % | no disponible | no disponible |
| BFCL V4 Non-Live | 88,44 % | no disponible | no disponible | no disponible |
| BFCL V4 Irrelevance Detection | 80,26 % | 46,87 % | no disponible | no disponible |

El resto de filas del conjunto de 15 benchmarks no está incluido en el extracto de la model card disponible; no se han verificado de forma independiente las cifras anteriores.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16 nativo: aproximadamente 36 GB por GPU con tensor parallelism TP=2 sobre 2 GPU de 48-80 GB.
- Variante NVFP4 disponible en repositorio separado con 24,1 GB, ejecutable según el autor en 2x RTX 5090 de 32 GB.
- GPU recomendadas: 2x RTX 5090 32GB (entorno probado, sm_120, CUDAGraphs), A100 80GB, H100 80GB; para bf16 completo se necesitan al menos dos GPU de 48 GB o una de 80 GB con margen.
- No cabe en una única GPU de consumo de 24 GB en bf16; requeriría cuantización adicional no publicada para esta versión (existe GGUF en versiones anteriores como v2.6).
- Opciones de despliegue: vLLM (probado con FlashInfer), transformers; llama.cpp/Ollama solo mediante conversiones GGUF de versiones previas.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Activos | Contexto | Licencia | Media 15 benchmarks | Disponibilidad |
|---|---|---|---|---|---|---|
| Kataguru-Sceptic-35B-A3B-v3.1 | 35,7B | ~3B | 262.144 | Apache 2.0 | 70,26 % (autor) | HF, bf16 |
| Kataguru-Sceptic-35B-A3B-v2.8.1 | 35,7B | ~3B | 262.144 | Apache 2.0 | 69,24 % (autor) | HF, NVFP4 |
| Ornith 1.5 35B-A3B | 35B | ~3B | no disponible | no disponible | 65,49 % (W4A16) | HF |
| Qwen/Qwen3.5-35B-A3B (base) | 35B | ~3B | 262.144 | Apache 2.0 | no disponible | HF |

## Limitaciones y advertencias

- Los benchmarks son declaraciones del autor sin verificación independiente; el repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que limita la validación comunitaria.
- Modelo afinado por un autor individual; no hay garantías de robustez en producción ni auditoría de sesgos.
- Etiqueta "uncensored": puede generar contenido sin los filtros habituales, con implicaciones de seguridad y cumplimiento.
- Idiomas limitados a inglés y finlandés; el rendimiento en castellano no está documentado.
- Riesgo de alucinación inherente a modelos de 3B activos, especialmente en dominios especializados como medicina o patentes.
- El uso clínico o de propiedad intelectual requiere supervisión humana; el modelo no es un dispositivo médico ni asesor legal.
- La licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantías ni soporte.
- Requiere hardware significativo (2 GPU de 48-80 GB) para bf16 nativo; la cuantización NVFP4 es una variante separada.
- No se documentan en la información disponible los datos exactos de entrenamiento, el volumen de tokens ni el proceso de alineación (RLHF/DPO).

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/kataguru/Kataguru-Sceptic-35B-A3B-v3.1
- Variante NVFP4: https://huggingface.co/kataguru/Kataguru-Sceptic-35B-A3B-v3.1-NVFP4
- Versión previa v2.8.1 NVFP4: https://huggingface.co/kataguru/Kataguru-Sceptic-35B-A3B-v2.8.1-NVFP4
- Versión GGUF v2.6: https://huggingface.co/kataguru/Kataguru-Sceptic-35B-A3B-v2.6-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-35B-A3B
- Paper, blog o demo oficial: no disponible en la información proporcionada.
