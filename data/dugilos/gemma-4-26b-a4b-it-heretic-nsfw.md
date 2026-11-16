# Dugilos/gemma-4-26B-A4B-it-heretic-NSFW

## Resumen

Gemma-4-26B-A4B-it-heretic-NSFW es una variante "decensored" del modelo multimodal google/gemma-4-26B-A4B-it, desarrollada por el usuario Dugilos mediante la herramienta Heretic v2.2.0.dev0. El modelo base es un transformer de arquitectura Mixture-of-Experts (MoE) de Google DeepMind con 25.805.933.872 parámetros totales, capacidades multimodales (texto e imagen) y una ventana de contexto de hasta 256K tokens. Esta version concreta aplica una ablacion de rangos arbitrarios (Arbitrary-Rank Ablation) para eliminar los rechazos del modelo ante contenido adulto explicito.

La relevancia de esta ficha radica en que documenta un caso de "abliteration" especializada: en lugar de usar los conjuntos de prompts genericos de Heretic, el autor compilo manualmente un dataset de prompts con foco en contenido NSFW para dirigir la optimizacion. El resultado declarado es una reduccion de rechazos de 89/100 a 0/100 segun un clasificador, con una divergencia KL de 0.0411 respecto al modelo original, lo que indica una modificacion relativamente contenida de la distribucion de salida.

Es importante senalar que la model card del autor es escasa en detalles tecnicos sobre el entrenamiento original, los idiomas soportados o los benchmarks, por lo que muchos campos de esta ficha se marcan como "no disponible". La licencia declarada es Apache 2.0, aunque el enlace de licencia apunta a la licencia especifica de Gemma 4 de Google.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer Mixture-of-Experts (MoE) con atencion hibrida (sliding window local + atencion global), segun el modelo base Gemma 4 |
| Parametros totales | 25.805.933.872 |
| Parametros activos | 4B (indicado por el sufijo "A4B" del modelo base; no confirmado de forma explicita en la informacion disponible) |
| Longitud de contexto | 256K tokens (modelos medianos de Gemma 4, segun la model card del base) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (el modelo base Gemma 4 declara soporte en mas de 140 idiomas) |
| Licencia | apache-2.0 (con license_link a la licencia de Gemma 4 de Google) |
| Formato de pesos | safetensors (libreria transformers) |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura del Gemma 4 26B A4B: un transformer con mezcla de expertos (MoE) que intercala atencion local de ventana deslizante con atencion global completa, garantizando que la capa final sea siempre global. Las capas globales emplean claves y valores unificados y Proportional RoPE (p-RoPE) para optimizar el consumo de memoria en contextos largos. El modelo base es multimodal, procesando texto e imagen con soporte de relacion de aspecto y resolucion variables. No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni si se aplico RLHF o DPO en el modelo original.

La modificacion especifica de esta version es una ablacion de rangos arbitrarios (ARA) aplicada con Heretic v2.2.0.dev0, un metodo sin entrenamiento (training-free). Los parametros declarados son: start_layer_index 10, end_layer_index 29, preserve_good_behavior_weight 0.3072, steer_bad_behavior_weight 0.0002, overcorrect_relative_weight 0.5924 y neighbor_count 9. La optimizacion se dirigio con un dataset original de prompts compilado manualmente por el autor con foco en contenido adulto, en lugar de los conjuntos genericos de Heretic. Al ser un metodo sin entrenamiento, estos prompts guian la optimizacion y no constituyen datos de fine-tuning.

## Capacidades

- Generacion de texto y razonamiento: hereda las capacidades de razonamiento del Gemma 4 base, con modos de pensamiento (thinking modes) configurables.
- Procesamiento de imagen: entrada image-text-to-text con soporte de relacion de aspecto y resolucion variables (segun el modelo base).
- Codigo y matematicas: el modelo base Gemma 4 declara mejoras notables en benchmarks de codigo y capacidades agenticas.
- Tool calling / function calling: soporte nativo de llamada a funciones en el modelo base.
- Agentes y razonamiento multi-paso: capacidades agenticas mejoradas segun la model card del base.
- Soporte nativo de system prompt: Gemma 4 introduce soporte nativo del rol `system`.
- Multilingue: el modelo base declara soporte en mas de 140 idiomas (los idiomas concretos de esta variante no estan disponibles).
- Contenido sin censura: eliminacion de rechazos ante contenido adulto explicito, optimizada especificamente para NSFW.
- Vision y video: el modelo base procesa imagen y video; audio solo en las variantes E2B, E4B y 12B, no en el 26B A4B.

## Casos de uso

- Generacion de ficcion adulta: el modelo puede producir narrativa explicita sin rechazos, gracias a la ablacion optimizada con prompts NSFW, lo que lo hace adecuado para plataformas de contenido para adultos con moderacion propia.
- Roleplay conversacional para adultos: gestion de conversaciones multi-turno con contexto largo (hasta 256K tokens) manteniendo coherencia en escenarios de roleplay explicito.
- Creacion de contenido visual asistida: al aceptar entrada de imagen, puede describir o expandir contenido visual en contextos de generacion de material adulto.
- Investigacion sobre alineacion y seguridad: util como caso de estudio para medir el efecto de la abliteration en la distribucion de salidas (KL de 0.0411) y en las tasas de rechazo (0/100 frente a 89/100).
- Desarrollo de personajes y asistentes virtuales sin restricciones: integracion en aplicaciones de acompanamiento conversacional donde los filtros de contenido del modelo base resultan un obstaculo.
- Evaluacion comparativa de tecnicas de decensoring: sirve como referencia para comparar Heretic con otras tecnicas de abliteration en modelos multimodales MoE.
- Prototipado de pipelines multimodales: al mantener las capacidades image-text-to-text del base, puede usarse en experimentos que combinen imagen y texto sin las restricciones de contenido del original.

## Benchmarks y rendimiento

| Metrica | Este modelo | Modelo original (google/gemma-4-26B-A4B-it) |
|---|---|---|
| Rechazos (clasificador) | 0/100 | 89/100 |
| Divergencia KL | 0.0411 | 0 (por definicion) |

No se han publicado resultados de benchmarks de capacidades (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el repositorio ocupa 51.6 GB en safetensors, lo que sugiere que en precision completa (probablemente bf16/fp16) requiere del orden de 50-55 GB de VRAM; en cuantizacion de 8 bits se estimaria alrededor de 26-28 GB y en 4 bits alrededor de 14-16 GB (estimaciones a partir del tamano del repo, no confirmadas).
- GPU recomendadas: para precision completa, A100 80GB o H100; para cuantizaciones de 8 bits, A100 40GB o RTX 6000 Ada; para 4 bits, RTX 4090 (24 GB) o RTX 3090.
- Cabe en GPU de consumo: previsiblemente en RTX 4090/3090 con cuantizacion de 4 bits; no cabe en precision completa en GPUs de consumo.
- Opciones de despliegue: transformers (libreria declarada), con compatibilidad de endpoints; vLLM, llama.cpp, Ollama o TGI no estan confirmados en la informacion disponible.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Modalidades | Licencia | Notas |
|---|---|---|---|---|---|
| Dugilos/gemma-4-26B-A4B-it-heretic-NSFW | 25.8B (MoE, ~4B activos) | 256K | Texto, imagen | apache-2.0 | Variante decensored con 0/100 rechazos |
| google/gemma-4-26B-A4B-it | 25.8B (MoE, ~4B activos) | 256K | Texto, imagen | Apache 2.0 (licencia Gemma 4) | Modelo base con 89/100 rechazos |
| google/gemma-4-31B | 30.7B (dense) | 256K | Texto, imagen | Apache 2.0 (licencia Gemma 4) | Alternativa densa de mayor tamano de la misma familia |
| google/gemma-4-12B | 11.95B (dense) | 256K | Texto, imagen, audio | Apache 2.0 (licencia Gemma 4) | Alternativa menor con soporte de audio |

No se dispone de datos de rendimiento comparativo (benchmarks) entre estas variantes en la informacion proporcionada.

## Limitaciones y advertencias

- Contenido para adultos: el modelo esta marcado como `not-for-all-audiences` y generara contenido NSFW; no es apto para uso general ni para menores.
- Sesgos: al ser una ablacion sin entrenamiento adicional, conserva los sesgos del modelo base Gemma 4, que no estan documentados en la informacion disponible.
- Riesgo de alucinacion: no cuantificado; la ablacion puede alterar el comportamiento en dominios distintos al NSFW, aunque la KL de 0.0411 sugiere un cambio moderado.
- Limitaciones de idioma: los idiomas concretos soportados por esta variante no estan disponibles; el base declara mas de 140.
- Restricciones de licencia: la licencia declarada es apache-2.0, pero el enlace apunta a la licencia especifica de Gemma 4 de Google, que puede imponer condiciones adicionales de uso comercial; conviene revisar el texto enlazado antes de un despliegue en produccion.
- Caveat de produccion: el modelo tiene 0 descargas y 0 likes, creado y actualizado el mismo dia (2026-11-15), por lo que no hay evidencia de validacion por terceros ni de estabilidad en uso real.
- Metodo sin entrenamiento: la ablacion ARA no anade conocimiento nuevo; cualquier degradacion en capacidades generales derivada de la modificacion no esta cuantificada en la informacion disponible.

## Enlaces

- Hugging Face: https://huggingface.co/Dugilos/gemma-4-26B-A4B-it-heretic-NSFW
- Modelo base: https://huggingface.co/google/gemma-4-26B-A4B-it
- Heretic: https://heretic-project.org
- Coleccion Gemma 4 en Hugging Face: https://huggingface.co/collections/google/gemma-4
- GitHub de Google Gemma: https://github.com/google-gemma
- Blog de lanzamiento de Gemma 4: https://blog.google/innovation-and-ai/technology/developers-tools/gemma-4/
- Documentacion: https://ai.google.dev/gemma/docs/core
- Informe tecnico (arXiv): https://arxiv.org/abs/2607.02770
- Licencia Gemma 4: https://ai.google.dev/gemma/docs/gemma_4_license
- Pagina de Gemma en Google DeepMind: https://deepmind.google/models/gemma/
