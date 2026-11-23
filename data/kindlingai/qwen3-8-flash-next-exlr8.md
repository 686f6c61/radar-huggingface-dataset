# kindlingai/Qwen3.8-Flash-Next-exlr8

## Resumen

Qwen3.8-Flash-Next-exlr8 es una cuantización del modelo multimodal Qwen3.8-Flash-Next (desarrollado por Qwen) publicada por kindlingai en el formato propietario exlr8 v2. El modelo base es un MoE híbrido multimodal de tipo `Qwen4ExpForConditionalGeneration` con 48 capas de texto que combinan 36 capas de atención lineal Gated DeltaNet y 12 capas de atención completa GQA-12 con indexador disperso QSA, además de una torre de visión de 27 capas. Esta versión cuantiza únicamente los expertos enrutados y compartidos de las 48 capas MoE a tres anchos trellis (K2, K3 y K4) en el codebook `pmcgx`, manteniendo en BF16 las proyecciones densas, el vocabulario, el drafter MTP, la torre de visión y la tabla PLE de Layer-1.

El interés de esta publicación es doble. Por un lado, demuestra una estrategia de cuantización orientada a dispositivos de memoria unificada de clase NVIDIA GB10 (DGX Spark, ASUS GX10), con perfiles que van de 46,4 GB a 76,6 GB de residencia en memoria y un rowstore PLE de 102,4 GB que se sirve desde NVMe local. Por otro, publica mediciones de divergencia KL en `float64` sobre vocabulario completo (248.320 tokens) frente al modelo BF16, lo que permite evaluar la pérdida de calidad de forma cuantitativa antes de desplegar.

La relevancia actual radica en que el formato exlr8 exige un redondeo E4M3 específico durante la decodificación, de modo que no es compatible con decodificadores EXL3 convencionales. Solo el motor kindlingai/gr8 implementa el formato de forma nativa, lo que convierte esta ficha en una referencia útil para quienes evalúan desplegar modelos MoE multimodales grandes en hardware de memoria unificada con restricciones de VRAM.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE híbrido multimodal: 48 capas de texto (36 Gated DeltaNet lineal + 12 GQA-12 con QSA block-4), 512 expertos enrutados top-10 + 1 experto compartido con puerta por capa, hyper-conexiones low-rank de 4 flujos (4 × 2560, rango 320), tabla PLE Layer-1 de 2/3-gram (320.001.536 × 160 BF16), torre de visión de 27 capas |
| Parametros totales | no disponible (el repo ocupa 256,2 GB; el tamaño residente cuantizado va de 46,4 a 76,6 GB según perfil) |
| Parametros activos | no disponible (top-10 de 512 expertos enrutados + 1 compartido por capa) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | exlr8 v2 con codebook `pmcgx` y redondeo E4M3 obligatorio; perfiles K2 (`bit200`, 2,00 bpw), K3 (`bit300`, 3,00 bpw) y K4 (`bit400`, 4,00 bpw) sobre expertos; BF16 en densas, vocabulario, MTP, visión y PLE |
| Idiomas soportados | no disponible |
| Licencia | qwen-community-1.0 (etiquetada como `other` en Hugging Face) |
| Formato de pesos | safetensors con codificación trellis exlr8 (`pmcgx`), más `preprocessor_config.json` y `dense/vision-bf16.safetensors`; requiere el motor kindlingai/gr8 |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-Flash-Next emplea una arquitectura híbrida que alterna capas de atención lineal Gated DeltaNet (36 capas) con capas de atención completa GQA de 12 cabezas (12 capas), estas últimas equipadas con un indexador disperso QSA de bloque 4 en las capas 3, 7, ..., 47. La componente MoE consta de 512 expertos enrutados con routing top-10 más un experto compartido con puerta en cada capa. Incorpora además hyper-conexiones low-rank de 4 flujos con dimensión 2560 y rango 320, una tabla de embeddings por capa (PLE) de 2/3-gram de 320.001.536 entradas por 160 dimensiones en BF16, embeddings y cabeza LM no atados de 248.320 tokens, y un drafter especulativo MTP de una capa de atención completa (`mtp.layers.0`). La parte multimodal la aporta una torre de visión de 27 capas con MRoPE 3D intercalado.

Esta publicación no entrena el modelo: cuantiza los expertos enrutados y compartidos de las 48 capas MoE mediante una codificación trellis con conciencia Hessiana, generando tres anchos independientes (K2, K3 y K4) cuyos códigos no anidan entre sí. Cada ancho es una codificación distinta y el ancho de servicio se elige en tiempo de carga. El resto de componentes (proyecciones densas, vocabulario, drafter MTP, torre de visión y rowstore PLE) se mantiene en BF16 sin cambios respecto al modelo original. No se dispone de información sobre el volumen de tokens de entrenamiento, la composición del dataset ni las etapas de RLHF o DPO del modelo base.

## Capacidades

- Generación de texto conversacional y razonamiento multimodal: pipeline `image-text-to-text` con torre de visión BF16 de 27 capas y MRoPE 3D intercalado para entrada de imágenes.
- Procesamiento de lenguaje natural y generación de texto en formato conversacional.
- Decodificación especulativa mediante drafter MTP de una capa, con soporte de `--mtp 0..3` en el motor gr8 para decodificación multi-paso grafo.
- Ejecución en paralelo tensorial de 1 a 4 dispositivos (`TP=1` a `TP=4`), con escalado en vivo del ancho entre `TP=1..4` mediante `GR8_PTAB=2` y `bin/g6layout`.
- Streaming asíncrono de filas PLE desde NVMe local con `O_DIRECT` y caché LRU en host (1 GiB por defecto).
- Soporte de tool calling y function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible en la información proporcionada.
- Modo thinking, audio u otras capacidades especiales: no disponible en la información proporcionada.

## Casos de uso

- Despliegue en DGX Spark o ASUS GX10 con memoria unificada: el perfil `bit200` deja el modelo en 46,4 GB residentes, lo que permite servirlo en una sola caja GB10 con `TP=1` y mantener el rowstore PLE de 102,4 GB en NVMe local, evitando agotar la memoria unificada.
- Servicio multimodal de image-text-to-text en producción: con `GR8_QW38_VISION=1` se carga la torre de visión BF16 (0,90 GB) y se procesan imágenes junto a texto, adecuado para tareas de descripción, extracción de información o respuesta a preguntas sobre documentos escaneados.
- Escalado horizontal en clústeres de 2 a 4 nodos: el formato permite repartir los expertos por caja (por ejemplo, 15,2 GB por caja en `TP=2` con `bit200` o 30,3 GB con `bit400`), lo que encaja en despliegues de inferencia distribuida sobre varias unidades GB10.
- Evaluación de compromiso calidad/memoria: los perfiles publicados con KL en `float64` sobre vocabulario completo permiten elegir el ancho según el presupuesto de memoria; `bit300` ofrece un PPL de WikiText de 3,737 (+0,23 % frente a 3,729 de referencia) con 61,5 GB residentes.
- Generación asistida con decodificación especulativa: el drafter MTP de una capa permite activar `--mtp 0..3` para reducir la latencia por token en cargas conversacionales, siempre que el motor gr8 esté configurado con el drafter BF16.
- Investigación en cuantización trellis: el repositorio publica tres anchos independientes con conciencia Hessiana y métricas KL detalladas, lo que lo convierte en un banco de pruebas para estudiar el impacto del redondeo E4M3 y del codebook `pmcgx` en modelos MoE multimodales.

## Benchmarks y rendimiento

Los datos publicados son métricas de divergencia KL frente al modelo BF16, no benchmarks de tareas estándar (MMLU, HumanEval, GSM8K). Se presentan a continuación tal como aparecen en la model card.

| Perfil | bpw enrutados | Tamano residente | Expertos por caja (TP=1 / TP=2) | KL modelo (media / mediana) | Top-1 modelo | KL wikitext (media / mediana) | PPL wikitext (ref. 3,729) |
|---|---:|---:|---:|---:|---:|---:|---:|
| `bit200` (K2) | 2,00 | 46,4 GB | 30,3 / 15,2 GB | 0,0537 / 0,00743 | 92,60 % | 0,2177 / 0,0557 | 3,845 (+3,11 %) |
| `bit300` (K3) | 3,00 | 61,5 GB | 45,4 / 22,7 GB | 0,0124 / 0,00157 | 96,34 % | 0,0796 / 0,0178 | 3,737 (+0,23 %) |
| `bit400` (K4) | 4,00 | 76,6 GB | 60,5 / 30,3 GB | 0,0046 / 0,00054 | 97,70 % | 0,0373 / 0,0081 | 3,723 (-0,17 %) |

Las métricas KL se calculan en `float64` sobre el vocabulario completo (248.320 tokens), con 65.536 posiciones de test de WikiText-2 (32 × 2048) y 16.057 posiciones asistente generadas por el modelo (8 × 2048).

No se han publicado resultados de benchmarks de tareas (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM o memoria unificada residente: 46,4 GB (`bit200`), 61,5 GB (`bit300`) o 76,6 GB (`bit400`), incluyendo 16,0 GB de pesos BF16 densos, vocabulario, MTP y visión; sin visión, 15,1 GB.
- Almacenamiento NVMe local obligatorio para el rowstore PLE (`ple/exlr8-ple-L001.bin`, 102,40 GB / 95,37 GiB), leído por token mediante `O_DIRECT` `pread` con caché LRU en host de 1 GiB por defecto.
- GPU recomendadas: dispositivos de memoria unificada de clase NVIDIA GB10 (DGX Spark, ASUS GX10), en configuraciones de 1 a 4 cajas.
- Compatibilidad con GPU de consumo (RTX 4090, etc.): no disponible; el formato está diseñado explícitamente para GB10 y el motor gr8.
- Opciones de despliegue: exclusivamente kindlingai/gr8 (`./gr8 qw38`), con `TP=1` a `TP=4`, escalado en vivo con `GR8_PTAB=2` y `bin/g6layout`, decodificación especulativa con `--mtp 0..3` y visión con `GR8_QW38_VISION=1`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles en la información proporcionada.
- Tamaño de cada archivo de capa: 630.538.240 bytes en K2, 945.709.056 bytes en K3 y 1.260.879.872 bytes en K4 (513 expertos × 3 proyecciones × 2560 × 640 más alineación de sección de 64 KiB).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Motor |
|---|---|---|---|---|---|
| kindlingai/Qwen3.8-Flash-Next-exlr8 | no disponible (256,2 GB en repo) | no disponible | exlr8 K2/K3/K4 (`pmcgx`, E4M3) | qwen-community-1.0 | kindlingai/gr8 |
| kindlingai/glm-5.3-exlr8-k2-k3-k4 | no disponible | no disponible | exlr8 K2/K3/K4 | no disponible | kindlingai/gr8 |
| kindlingai/glm-5.3-flash-exlr8-k2-k3-k4 | no disponible | no disponible | exlr8 K2/K3/K4 | no disponible | kindlingai/gr8 |
| Qwen/Qwen3.8-Flash-Next (base) | no disponible | no disponible | BF16 | qwen-community-1.0 | no disponible |

Los dos modelos GLM citados comparten el mismo formato byte a byte y el mismo motor, por lo que son las alternativas más directas dentro del ecosistema exlr8. El modelo base Qwen3.8-Flash-Next es la referencia de calidad frente a la que se miden las divergencias KL. No se dispone de datos de benchmarks de tareas que permitan una comparación de rendimiento entre estos modelos.

## Limitaciones y advertencias

- Los pesos no son utilizables sin redondeo E4M3: cualquier loader debe redondear cada valor producido por el codebook trellis a FP8 E4M3 (round to nearest even, saturating) antes de aplicar los vectores laterales. Un decodificador EXL3 estándar, o cualquiera que omita el redondeo, lee pesos mediblemente peores de los mismos bytes.
- Dependencia total del motor kindlingai/gr8: no se documenta compatibilidad con vLLM, llama.cpp, Ollama, TGI ni con el decodificador EXL3 convencional, lo que limita la portabilidad.
- Requisito de almacenamiento NVMe local para el rowstore PLE de 102,4 GB; sin él, el modelo no puede servirse según el diseño descrito.
- El perfil `bit200` degrada la perplejidad de WikiText un +3,11 % y baja el top-1 al 92,60 %, lo que puede ser inaceptable en tareas sensibles a la fidelidad.
- Sesgos conocidos: no disponible en la información proporcionada.
- Riesgo de alucinación: no disponible en la información proporcionada.
- Idiomas soportados: no disponible en la información proporcionada.
- Restricciones de licencia: la licencia qwen-community-1.0 debe consultarse en el archivo `LICENSE` del repositorio antes de cualquier uso comercial; no se detallan aquí sus términos.
- El repositorio tiene 0 likes y 492 descargas en el momento de la consulta, lo que indica una adopción todavía muy limitada y poca validación comunitaria independiente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/kindlingai/Qwen3.8-Flash-Next-exlr8
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Motor kindlingai/gr8: https://github.com/kindlingai/gr8
- Documentación de Qwen3.8 en gr8: https://github.com/kindlingai/gr8/blob/main/docs/QWEN38.md
- Especificación del formato exlr8: https://github.com/kindlingai/exlr8/blob/main/FORMAT.md
- Modelo hermano glm-5.3-exlr8-k2-k3-k4: https://huggingface.co/kindlingai/glm-5.3-exlr8-k2-k3-k4
- Modelo hermano glm-5.3-flash-exlr8-k2-k3-k4: https://huggingface.co/kindlingai/glm-5.3-flash-exlr8-k2-k3-k4
