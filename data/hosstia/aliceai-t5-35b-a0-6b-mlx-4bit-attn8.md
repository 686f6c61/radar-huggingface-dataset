# Hosstia/AliceAI-T5-35B-A0.6B-MLX-4bit-attn8

## Resumen

AliceAI-T5-35B-A0.6B-MLX-4bit-attn8 es una versión cuantizada para Apple Silicon del modelo de traducción `yandex/AliceAI-T5-35B-A0.6B`, publicada por el usuario Hosstia. Se trata de un transformer encoder-decoder de tipo T5 con arquitectura Mixture-of-Experts: 34.656.453.632 parámetros totales (unos 35.000 millones) pero solo 0,6B activos por token, con 512 expertos y enrutamiento top-8. Está especializado en traducción chino-ruso y se distribuye en formato MLX con cuantización mixta: expertos en affine 4-bit (grupo 64) y atención en affine 8-bit (grupo 64).

La relevancia de esta ficha no está en el modelo base, entrenado por Yandex, sino en el trabajo de cuantización e implementación: el repositorio incorpora un runtime propio (`aliceai_mlx`) que sustituye el bucle plano de despacho de expertos por una primitiva fusionada `gather_qmm`, eliminando 224 barreras de sincronización de GPU por token. El resultado declarado es una aceleración de 3,83x en batch 1 y 11,51x en batch 8 frente a la implementación legacy, con paridad numérica respecto al esquema de cuantización de referencia.

El modelo ocupa 18,45 GB en disco y alcanza un pico de memoria de 19,25 GB, por lo que requiere un Mac con memoria unificada abundante. No hay benchmarks de calidad de traducción publicados en la información disponible, y la licencia es "other", heredada del modelo original de Yandex.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder T5 con Mixture-of-Experts (MoE) |
| Parametros totales | 34.656.453.632 (≈35B) |
| Parametros activos | 0,6B por token |
| Expertos | 512, enrutamiento top-8 |
| Capas | 16 en el encoder, 12 en el decoder |
| Longitud de contexto | no disponible (RoPE YaRN, posición máxima original 9984, factor de escalado 20,0) |
| Tipos de cuantizacion | Expertos: affine 4-bit, group size 64. Atención: affine 8-bit, group size 64. Embeddings: sin cuantizar |
| Idiomas soportados | chino (zh) y ruso (ru) |
| Licencia | other (la misma que el modelo base `yandex/AliceAI-T5-35B-A0.6B`) |
| Formato de pesos | safetensors en formato MLX (librería `mlx`) |
| Tamano oculto | 1536 |
| Cabezas de atencion (encoder) | 12 |
| Cabezas KV (decoder) | 4 |
| Dimension de cabeza | 128 |
| Tamano de vocabulario | 135.040 |
| Tamano intermedio de experto | 512 |
| Activacion | silu |
| Embeddings compartidos / atados | Si / Si |
| Tamano del repo | 19,8 GB (18,45 GB de pesos en disco) |

## Arquitectura y entrenamiento

La arquitectura es un T5 encoder-decoder con capas MoE: 16 capas de encoder y 12 de decoder, tamaño oculto de 1536, 12 cabezas de atención en el encoder y 4 cabezas KV en el decoder con dimensión de cabeza 128. Cada capa MoE dispone de 512 expertos con tamaño intermedio 512 y activación silu, de los que se seleccionan 8 por token (top-8). El vocabulario es de 135.040 tokens y los embeddings están compartidos y atados entre encoder, decoder y proyección de salida. El modelo usa RoPE de tipo YaRN con posición máxima original de 9984 y factor de escalado 20,0.

No hay información en la model card sobre el volumen de tokens de entrenamiento, la composición del dataset ni sobre si se aplicaron fases de RLHF o DPO: esos datos corresponden al modelo original de Yandex, no documentados aquí. La innovación técnica documentada en este repositorio es de inferencia, no de entrenamiento: el despacho fusionado `gather_qmm` para MoE elimina 224 barreras de sincronización de GPU por token (una por experto y capa en la implementación legacy de bucle plano), logrando 3,83x de aceleración en batch 1 y hasta 11,51x en batch 8, manteniendo paridad numérica con el esquema de cuantización de referencia.

## Capacidades

- Traducción automática chino → ruso, que es la tarea declarada en el pipeline (`translation`).
- Traducción por lotes mediante `complete_batch`, orientada a maximizar throughput en batch 8.
- Modo "professor": fusión y corrección de dos traducciones candidatas (una de "profesor" y otra de "estudiante") devolviendo un texto corregido.
- Uso mediante API de alto nivel (`Translator`) o carga directa del modelo (`load_model`, `generate`).
- Ejecución local en Apple Silicon vía MLX, con despacho MoE optimizado y cuantización mixta 4/8 bits.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- No se documenta capacidad de visión, audio ni modo de razonamiento explícito (thinking mode).
- Cobertura multilingüe limitada a chino y ruso según los metadatos del repositorio.

## Casos de uso

- Traducción literaria chino-ruso: la model card incluye como ejemplo la traducción de una frase de novela ("沈安瞠目结舌的看着包拯扬长而去"), un escenario de narrativa donde el modo "professor" permite contrastar dos candidatas y quedarse con la versión corregida.
- Traducción por lotes de documentación técnica: con `complete_batch` y 217,44 tok/s en batch 8 sobre M4 Pro, se pueden procesar manuales o documentación extensa en local sin enviar el contenido a servicios en la nube.
- Localización de subtítulos y contenido audiovisual: el pipeline de traducción zh-ru encaja en flujos de subtitulado donde la confidencialidad del material exige procesamiento completamente offline.
- Construcción de corpus paralelos: traducción masiva de textos chinos a ruso para generar datos de entrenamiento o evaluación de otros sistemas de traducción.
- Post-edición asistida con modo "professor": integrar el modelo como corrector que fusiona la salida de un traductor automático rápido (estudiante) con una traducción de mayor calidad (profesor) y devuelve un texto consolidado.
- Investigación en inferencia MoE sobre Apple Silicon: el repositorio sirve como referencia reproducible para medir el impacto del despacho fusionado `gather_qmm` frente a implementaciones con bucle por experto, con métricas de utilización de GPU y throughput.
- Traducción interna en organizaciones con requisitos de soberanía de datos: al ejecutarse en un Mac local con memoria unificada de 19 GB o más, evita el envío de textos a APIs externas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad de traducción (BLEU, COMET, MMLU, etc.) en la información disponible. Los únicos datos de rendimiento son medidas de inferencia sobre Apple M4 Pro (48 GB de memoria unificada) con MLX 0.32.0:

| Metrica | Este modelo (4bit-attn8) | Baseline legacy |
|---|---|---|
| Throughput (batch 1) | 72,26 tok/s | 18,89 tok/s |
| Throughput (batch 8) | 217,44 tok/s | no disponible |
| Throughput mediano (batch 1) | 72,19 tok/s | 18,56 tok/s |
| Throughput mediano (batch 8) | 213,20 tok/s | no disponible |
| Utilizacion de GPU (batch 1) | 63,3% | 51,2% |
| Utilizacion de GPU (batch 8) | 91,2% | no disponible |
| Utilizacion de GPU pico | 100% | 84% |
| Tamano en disco | 18,45 GB | 18,30 GB |
| Memoria pico | 19,25 GB | 19,87 GB |
| Aceleracion vs legacy (batch 1) | 3,83x | 1,0x |
| Aceleracion vs legacy (batch 8) | 11,51x | 1,0x |

## Requisitos de hardware

- VRAM/memoria: al ser un modelo MLX para memoria unificada, la model card recomienda un mínimo de 19 GB. El pico medido es de 19,25 GB y los pesos ocupan 18,45 GB en disco.
- Cabe en GPU de consumo: no en el sentido habitual de GPU discreta, porque solo se documenta ejecución en Apple Silicon. En Macs con memoria unificada de 8 GB o 16 GB no cabe; se necesita un equipo con al menos 19-24 GB de memoria unificada.
- Hardware probado: Apple M4 Pro con 48 GB de memoria unificada. La familia soportada es Apple Silicon M1, M2, M3 y M4.
- GPU NVIDIA/AMD: no se documenta ningún tipo de soporte para CUDA o ROCm en este repositorio.
- Opciones de despliegue: MLX 0.32.0 o superior, macOS 14.0 (Sonoma) o superior, Python 3.10+, `transformers` para el tokenizer y `huggingface_hub` para la descarga automática. El runtime de inferencia es el paquete propio `aliceai_mlx`.
- No se documenta compatibilidad con vLLM, TGI, llama.cpp u Ollama, ni se distribuyen pesos en formato GGUF.
- Latencia y throughput: 72,26 tok/s en batch 1 y 217,44 tok/s en batch 8 medidas sobre M4 Pro. No se aportan datos de latencia hasta el primer token (TTFT).

## Comparativa con modelos similares

| Modelo | Parametros totales | Parametros activos | Contexto | Cuantizacion | Throughput batch 1 | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|---|
| Hosstia/AliceAI-T5-35B-A0.6B-MLX-4bit-attn8 | 34,66B | 0,6B | no disponible | Affine 4-bit (expertos) + 8-bit (atencion) | 72,26 tok/s (M4 Pro) | other | MLX, Apple Silicon |
| Baseline legacy del mismo repo | 34,66B | 0,6B | no disponible | Affine 4-bit + 8-bit | 18,89 tok/s (M4 Pro) | other | MLX, Apple Silicon |
| yandex/AliceAI-T5-35B-A0.6B (modelo base) | no disponible | 0,6B | no disponible | Sin cuantizar | no disponible | other | Pesos originales de Yandex |

No se dispone de datos comparativos de terceros (por ejemplo otros sistemas de traducción zh-ru o variantes cuantizadas alternativas) en la información proporcionada.

## Limitaciones y advertencias

- Modelo especializado exclusivamente en traducción chino-ruso: no es un modelo de propósito general y no se documentan capacidades de chat, código, matemáticas o razonamiento.
- Cobertura de idiomas muy limitada (zh y ru según los metadatos); no hay soporte documentado de castellano ni de otras lenguas.
- La longitud de contexto efectiva no está declarada en la model card; solo se conocen los parámetros de RoPE (posición máxima original 9984, escalado YaRN 20,0), lo que impide garantizar el comportamiento en secuencias largas.
- Riesgo de alucinación y de errores de traducción inherente a cualquier modelo generativo; no se publican métricas de calidad (BLEU/COMET) que permitan acotarlo.
- Sesgos: no se documenta ninguna evaluación de sesgos ni la composición del dataset de entrenamiento original, por lo que no es posible caracterizar sesgos lingüísticos o culturales.
- Licencia "other" heredada del modelo base: es imprescindible revisar la model card de `yandex/AliceAI-T5-35B-A0.6B` antes de cualquier uso comercial, ya que este repositorio no aclara los términos.
- Dependencia estricta de Apple Silicon y de MLX 0.32.0 o superior: no hay alternativa documentada para CUDA, y no existen pesos GGUF ni soporte en vLLM, TGI, llama.cpp u Ollama.
- El requisito de 19 GB o más de memoria unificada excluye la mayoría de portátiles Mac con configuraciones base.
- El repositorio tiene 0 descargas y 0 "likes" en el momento de la consulta, y el runtime `aliceai_mlx` es un paquete propio del autor, sin ecosistema de mantenimiento externo conocido.
- Los pesos cuantizados son un artefacto derivado: la responsabilidad sobre el modelo original y su entrenamiento recae en Yandex.

## Enlaces

- Repositorio de este modelo: https://huggingface.co/Hosstia/AliceAI-T5-35B-A0.6B-MLX-4bit-attn8
- Modelo base: https://huggingface.co/yandex/AliceAI-T5-35B-A0.6B
- Cita del trabajo original (Yandex, 2025): https://huggingface.co/yandex/AliceAI-T5-35B-A0.6B
- Resultados de la búsqueda web: no se ha encontrado ningún resultado relevante sobre este modelo; las páginas devueltas (foro Zhihu) trataban de temas sin relación (edición de PDF, ajustes de monitor, software de análisis cualitativo) y no se incluyen como fuentes.
