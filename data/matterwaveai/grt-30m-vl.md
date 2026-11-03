# MatterWaveAI/grt-30m-vl

## Resumen

GRT-30M-VL es un modelo visión-lenguaje (image-text-to-text) de 34,26 millones de parámetros desarrollado por MatterWaveAI, construido sobre el modelo de lenguaje `MatterWaveAI/grt-30m`. Su particularidad es que se presenta como un transformer "100% rotacional": según el autor, no contiene matrices densas `nn.Linear` ni en el codificador visual ni en el backbone de lenguaje, sino que sustituye las proyecciones lineales por cascadas de rotaciones de Givens y operaciones basadas en álgebra de Clifford (mezcladores rotacionales y FFN rotacionales).

El modelo combina una torre visual de 4,95 M de parámetros que procesa imágenes RGB de 224x224 y las reduce a 64 tokens visuales de dimensión 256, con un backbone de lenguaje causal de 12 capas y 29,3 M de parámetros. La entrada multimodal se gestiona mediante un token especial `<|image_pad|>` y un procesador compatible con la API `AutoProcessor` / `AutoModelForImageTextToText` de Transformers.

Es relevante como experimento de arquitectura más que como modelo de producción: explora una vía alternativa a las proyecciones lineales en modelos multimodales con un coste computacional y de memoria muy reducido (repo de 0,2 GB, pesos en safetensors, licencia Apache 2.0). Su escala de 30 M de parámetros lo sitúa en la categoría de modelos de juguete o de investigación, no comparable a los VLM de miles de millones de parámetros.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer rotacional multimodal (vision-language); sin capas `nn.Linear` según el autor; atención multi-cabeza rotacional con rotaciones de Givens y mezcladores/FFN basados en álgebra de Clifford |
| Parámetros totales | 35.133.941 (safetensors); 34.259.692 según la model card |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | No disponible (pesos publicados en safetensors; la model card usa `float32`) |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería `transformers`) |

## Arquitectura y entrenamiento

La arquitectura se divide en dos bloques. El codificador visual (`GRTVisionModel`, 4.954.194 parámetros) consta de un patch stem `GRTPolarPatchEmbedding` que hace unfold 14x14, aplica `GRTPearlNorm` y una cascada butterfly de Givens de 11 etapas hasta 256 dimensiones (128 pares planares); un encoding posicional rotacional 2D (`GRTRotaryEmbedding2D`, 128 parámetros) sobre una rejilla de 16x16 parches; 6 capas `GRTDecoderLayer` con `is_causal=False` (atención bidireccional multi-cabeza con `n_qkv_rotations=11`, mezclador Clifford y FFN rotacional de 21 etapas); y un merger espacial `GRTSpatialRotationalMerger` (56.000 parámetros) que hace un pixel-unshuffle 2x2 (de 256 a 64 tokens) con proyector Givens expand/RadialGELU/contract de 21 etapas. El backbone de lenguaje (`GRTModel` + `GRTCosineHead`, 29.305.498 parámetros) es un modelo causal de 12 capas con embeddings polares y cabeza coseno compartidas, heredado de `MatterWaveAI/grt-30m`.

No se detallan en la información disponible el número de tokens de entrenamiento, la composición del dataset, ni si hubo RLHF/DPO. La model card sí reporta una fase de alineación: la perplejidad de captioning visual en held-out pasa de 19.217,10 (sin alinear) a 1,26 (alineada), lo que sugiere un ajuste supervisado específico para alinear la salida textual con las imágenes. No se documentan innovaciones como decodificación especulativa ni atención lineal más allá del esquema rotacional descrito.

## Capacidades

- Generación de texto condicionada por imagen (image-text-to-text) mediante el token `<|image_pad|>`.
- Descripción de imágenes (captioning) a partir de entradas RGB de 224x224.
- Reconocimiento de atributos visuales básicos: color, forma y posición espacial (con distinto grado de acierto, ver benchmarks).
- Procesamiento de imágenes con un codificador visual bidireccional de 6 capas y 64 tokens visuales por imagen.
- Generación de texto autoregresiva con backbone causal de 12 capas.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible.
- Modo thinking, visión avanzada, audio u otras capacidades especiales: no disponibles.

## Casos de uso

- Prototipado de investigación en arquitecturas sin proyecciones lineales: el modelo sirve para experimentar con rotaciones de Givens y álgebra de Clifford en lugar de `nn.Linear`, comparando su comportamiento frente a un transformer convencional del mismo tamaño en tareas de captioning.
- Docencia y divulgación de arquitecturas alternativas: su tamaño reducido (0,2 GB de repo) permite ejecutarlo en un portátil y diseccionar cada módulo (patch stem, rotary 2D, merger espacial) sin infraestructura especial.
- Pruebas de concepto de captioning de color: dado que la model card reporta un 100% de acierto en reconocimiento de color en held-out, puede usarse como baseline mínimo para validar pipelines de descripción de imágenes en entornos controlados.
- Evaluación de alineación multimodal: el salto de perplejidad de 19.217,10 a 1,26 tras la alineación lo convierte en un caso de estudio útil para medir el efecto de un ajuste supervisado sobre un backbone pequeño.
- Generación de descripciones en aplicaciones de bajo consumo: con 34 M de parámetros y pesos en float32, cabe en GPU de consumo muy modestas y en CPU, lo que permite integrarlo en demos locales o entornos embebidos donde no se puede desplegar un VLM grande.
- Benchmarking de eficiencia: útil para comparar el coste (memoria y cómputo) de un transformer rotacional frente a uno denso equivalente en tareas imagen-texto, ya que el autor declara cero capas `nn.Linear`.

## Benchmarks y rendimiento

Resultados reportados en la model card (held-out, conjunto no especificado):

| Métrica | Resultado |
|---|---|
| Perplejidad de captioning visual (sin alinear) | 19.217,10 |
| Perplejidad de captioning visual (alineado) | 1,26 |
| Precisión en reconocimiento de color | 100,0% |
| Precisión en reconocimiento de forma | 25,0% |
| Precisión en reconocimiento de posición espacial | 58,3% |
| Coincidencia exacta de caption | 12,5% |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, VQAv2, etc.) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: en float32, los ~35 M de parámetros ocupan aproximadamente 140 MB de pesos; con overhead de activaciones y el codificador visual, el consumo es del orden de cientos de MB, holgado en cualquier GPU moderna.
- GPU recomendadas: cualquier GPU con al menos 1-2 GB de VRAM; no requiere A100 ni H100. Funciona en RTX 4090, RTX 3060, T4 e incluso en CPU.
- Cabe en GPU de consumo: sí, en todas las GPU de consumo actuales y en muchas integradas.
- Opciones de despliegue: `transformers` con `AutoModelForImageTextToText` y `AutoProcessor` (soporte oficial); el tag `endpoints_compatible` sugiere compatibilidad con Hugging Face Inference Endpoints. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| GRT-30M-VL (MatterWaveAI) | ~34-35 M | No disponible | Apache 2.0 | VLM rotacional sin `nn.Linear`; métricas solo de captioning held-out |
| MatterWaveAI/grt-30m | ~29,3 M (backbone) | No disponible | No disponible | Modelo base solo texto del que deriva el VL |
| SmolVLM-256M (Hugging Face) | ~256 M | No disponible en esta ficha | Apache 2.0 | VLM pequeño de referencia; comparación no verificada en la información disponible |
| Modelos VLM de <1B (p. ej. familia SmolVLM) | 256 M-500 M | Variable | Apache 2.0 en varios | Alternativas de tamaño pequeño; datos concretos no disponibles en esta ficha |

No se dispone de datos de rendimiento comparativo verificables en la información proporcionada; la comparativa anterior es orientativa por categoría y tamaño.

## Limitaciones y advertencias

- Escala muy reducida (34 M de parámetros): capacidad lingüística y de razonamiento limitada; no apto para tareas complejas de VQA, razonamiento multi-paso o generación de código.
- Reconocimiento de forma (25,0%) y coincidencia exacta de caption (12,5%) muy bajos en held-out: riesgo alto de descripciones incorrectas o incompletas.
- Riesgo de alucinación elevado por el tamaño del backbone y por la perplejidad sin alinear reportada (19.217,10 antes del ajuste).
- Idiomas soportados no documentados; no se puede asumir un buen rendimiento en castellano ni en otros idiomas.
- Longitud de contexto no documentada: no se puede planificar su uso en conversaciones multi-turno largas.
- La afirmación de "cero `nn.Linear`" procede del autor y no se ha verificado de forma independiente en la información disponible.
- Licencia Apache 2.0 permite uso comercial, pero la falta de benchmarks estándar y de documentación de sesgos desaconseja su uso en producción sin una evaluación propia.
- Fecha de creación del repo (2026-11-03) y ausencia de descargas/likes: modelo muy reciente y sin validación comunitaria.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/MatterWaveAI/grt-30m-vl
- Modelo base: https://huggingface.co/MatterWaveAI/grt-30m
- No se han encontrado en la información disponible papers, blogs, repositorios ni demos adicionales.
