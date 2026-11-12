# OpenInfinity/Index-Translate-2B-MLX-6bit

## Resumen

Index-Translate-2B-MLX-6bit es una conversión a formato MLX del modelo de traducción IndexTeam/Index-Translate-2B, publicada por OpenInfinity para su ejecución en Apple Silicon. El modelo base es un transformer denso de 1.881.825.088 parámetros (aproximadamente 2B) orientado específicamente a traducción automática multilingüe, con soporte declarado para chino, inglés, japonés y alemán, además de otras lenguas mencionadas en las instrucciones de uso (francés, español, coreano y ruso). Esta variante cuantiza los pesos a 6 bits con tamaño de grupo 32, lo que resulta en aproximadamente 7,0 bits por peso contando las escalas, mientras el resto de parámetros permanece en bfloat16.

La relevancia de esta ficha radica en que ofrece inferencia local en hardware de consumo Apple (chips de la serie M) con un tamaño de repositorio de 1,7 GB, manteniendo la misma plantilla de chat y el mismo tokenizador que el modelo oficial. La model card documenta una validación sobre 374 segmentos reales extraídos de 12 páginas web, comparando la fidelidad de la salida frente a la referencia en bfloat16 y frente al GGUF Q6_K oficial ejecutado con llama.cpp. Según esos datos, esta variante alcanza un chrF++ global de 94,7 frente a 94,2 del GGUF Q6_K y 93,7 de una conversión MLX con grupo 64.

Una diferencia importante respecto al modelo original es que esta conversión es solo de texto: el codificador visual del modelo oficial se descarta durante la conversión, por lo que no conserva las capacidades de lectura de imágenes. El modelo se distribuye bajo licencia Apache 2.0 y está pensado para despliegue on-device en aplicaciones de traducción, extensiones de navegador y herramientas locales en macOS.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (tag `qwen3_5`), conversión MLX; codificador visual eliminado |
| Parametros totales | 1.881.825.088 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | 6 bits con tamaño de grupo 32 (aprox. 7,0 bits por peso con escalas); resto de parámetros en bfloat16 |
| Idiomas soportados | Multilingüe; declarados zh, en, ja, de (la model card menciona además fr, es, ko, ru en las instrucciones) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (MLX); `model.safetensors` de 1.647 MB + índice |
| Libreria | mlx (mlx-lm) |
| Tamano del repo | 1,7 GB |
| Modelo base | IndexTeam/Index-Translate-2B (revision `9bc0844531`) |
| Pipeline | translation |

## Arquitectura y entrenamiento

El modelo base es un transformer denso identificado con la etiqueta `qwen3_5`, orientado a traducción automática y con capacidades multimodales en su versión original (lectura de imágenes mediante un codificador visual). Esta conversión conserva únicamente el modelo de lenguaje: mlx-lm descarta el codificador visual durante la conversión, de modo que la variante aquí descrita procesa solo texto. La cuantización se realizó con mlx-lm 0.32.2 sobre MLX 0.32.4 mediante `mlx_lm.convert` con `--q-bits 6 --q-group-size 32`; el autor eligió grupo 32 en lugar del 64 por defecto porque con 64 la salida en chino se desviaba más del original.

No se dispone de información sobre el volumen de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO en el modelo base. La model card de esta conversión tampoco detalla innovaciones arquitectónicas más allá de la propia cuantización. El tokenizador y la plantilla de chat se mantienen idénticos a los oficiales; el conversor guarda los tokens especiales `<think>`, `</think>` y otros directamente en `tokenizer.json`, de modo que los cargadores que solo leen ese fichero los conservan íntegros. Según el autor, sobre 374 prompts de prueba produce los mismos token ids que el tokenizador oficial.

## Capacidades

- Traducción de texto entre los idiomas soportados (zh, en, ja, de y, según las instrucciones de la model card, fr, es, ko, ru).
- Generación de texto condicionada por una instrucción en chino que especifica idioma origen y destino, con salida directa sin explicaciones.
- Preservación de marcadores de enlace con el formato `<a1>…</a1>` y de cadenas y números que deben permanecer sin cambios, validado sobre segmentos reales de páginas web.
- Modo thinking disponible en la plantilla de chat (`<think>` / `</think>`), aunque la model card recomienda desactivarlo para traducción.
- Decodificación greedy (temperatura 0) recomendada por el autor para reproducir el comportamiento del modelo oficial.
- Ejecución on-device en Apple Silicon mediante mlx-lm (Python) y mlx-swift-lm (Swift).
- No conserva capacidades de visión: el codificador de imágenes se elimina en la conversión.
- No se documenta soporte de tool calling, function calling ni razonamiento multi-paso orientado a agentes.

## Casos de uso

- Traducción integrada en extensiones de navegador: el modelo se validó precisamente con segmentos generados por el segmentador de una extensión (enlaces marcados y números preservados), por lo que encaja en la traducción de páginas web en tiempo real sin enviar contenido a la nube.
- Aplicaciones de traducción locales en macOS: con 1,7 GB de pesos y ejecución vía MLX, puede empaquetarse en una app de escritorio para Apple Silicon que traduzca texto sin conexión.
- Traducción de documentación técnica en-zh y zh-en: el conjunto de validación incluye páginas de MDN, Stack Overflow, GitHub y arXiv, dominios donde el modelo mostró un chrF++ de 91,8 (en→zh) y 96,7 (zh→en) frente a la referencia bfloat16.
- Localización de contenido editorial: la dirección en→de alcanzó 97,9 de chrF++ en la validación, lo que lo hace adecuado para traducir artículos y notas de prensa del inglés al alemán con revisión humana ligera.
- Procesamiento por lotes de segmentos cortos: el modelo trabaja segmento a segmento con decodificación greedy, un patrón adecuado para pipelines que traducen cadenas de interfaz, subtítulos o metadatos.
- Prototipado e investigación en traducción automática: su licencia Apache 2.0 y su tamaño reducido permiten experimentar con cuantización y comparar fidelidad frente a bfloat16 o GGUF en un solo equipo.
- Traducción en-ja de contenido enciclopédico: la validación sobre páginas de Wikipedia en inglés hacia japonés obtuvo 94,3 de chrF++, útil para traducción de artículos con terminología estándar.

## Benchmarks y rendimiento

Los datos publicados en la model card miden la cercanía a la referencia bfloat16 (chrF++, donde 100 = idéntico) sobre 374 segmentos de 12 páginas web reales, con decodificación greedy y thinking desactivado.

| Modelo | Tamano | Global | en → zh | zh → en | en → ja | en → de | Salidas idénticas |
|---|---|---|---|---|---|---|---|
| GGUF Q6_K oficial | 1.606 MB | 94,2 | 92,1 | 93,1 | 94,6 | 98,2 | 294 / 374 |
| MLX 6-bit, grupo 64 | 1.530 MB | 93,7 | 89,7 | 96,3 | 94,1 | 97,2 | 282 / 374 |
| Este modelo (6-bit, grupo 32) | 1.647 MB | 94,7 | 91,8 | 96,7 | 94,3 | 97,9 | 285 / 374 |

Comprobaciones de integridad sobre el mismo conjunto:

| Comprobacion | bfloat16 | GGUF Q6_K | Este modelo |
|---|---|---|---|
| Marcadores de enlace perdidos o alterados (de 140 con enlaces) | 3 | 2 | 4 |
| Numero o cadena que debia permanecer sin cambios y se altero (de 117) | 13 | 12 | 12 |

El autor señala que el modelo original también falla en estas comprobaciones, por lo que la mayoría de los errores provienen del modelo base y no de la cuantización. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, BLEU, etc.) en la información disponible.

## Requisitos de hardware

- VRAM/unificación de memoria estimada: los pesos ocupan 1.647 MB; con overhead de ejecución conviene disponer de al menos 3-4 GB de memoria unificada libre.
- Hardware objetivo: Apple Silicon (MLX). La validación de velocidad se realizó en un MacBook Pro con M3 Max y 128 GB de RAM bajo macOS 27.2.
- GPU recomendadas: chips Apple de la serie M; no es compatible de forma nativa con CUDA sin reconvertir los pesos.
- Cabe en GPU de consumo Apple: sí, en cualquier Mac con memoria unificada suficiente (8 GB o más es razonable dado el tamaño de los pesos).
- Opciones de despliegue: mlx-lm en Python (`mlx_lm.load` / `generate`) y mlx-swift-lm en Swift (MLXLLM/MLXLMCommon). Para comparar, el GGUF oficial se ejecuta con llama.cpp.
- Latencia y throughput: la model card menciona una prueba de velocidad en M3 Max con procesamiento de un segmento a la vez, pero los valores numéricos de latencia o tokens por segundo no están disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Index-Translate-2B-MLX-6bit (este) | 1,88B (6-bit) | No disponible | Traducción, solo texto, Apple Silicon | Apache 2.0 | MLX, safetensors |
| IndexTeam/Index-Translate-2B (base) | ~2B | No disponible | Traducción multimodal (texto + imágenes) | Apache 2.0 | Pesos originales |
| IndexTeam/Index-Translate-2B-GGUF (Q6_K) | ~2B (6-bit) | No disponible | Traducción, formato GGUF para llama.cpp | Apache 2.0 | GGUF |

La comparación disponible se limita a las variantes del mismo modelo base; no se han proporcionado datos de modelos de traducción de otros desarrolladores (por ejemplo, NLLB o MADLAD) en la información consultada, por lo que no se incluye comparación con ellos.

## Limitaciones y advertencias

- Solo texto: el codificador visual del modelo oficial se elimina en la conversión, por lo que no puede procesar imágenes.
- Riesgo de alucinación y de alteración de contenido: en la validación, 12 de 117 segmentos con números o cadenas que debían permanecer intactos sufrieron cambios, y 4 de 140 segmentos con enlaces perdieron o modificaron sus marcadores.
- Idiomas: la cobertura declarada se centra en zh, en, ja y de; otros idiomas aparecen solo en las instrucciones de la model card y no están validados en los datos publicados.
- Restricciones de uso: la licencia Apache 2.0 permite uso comercial, pero debe conservarse el aviso de licencia y no se ofrece garantía alguna.
- Formato específico de plataforma: los pesos MLX no se ejecutan de forma nativa en CUDA; para GPUs NVIDIA habría que usar el GGUF o reconvertir.
- Dependencia de la plantilla de chat y del prompt en chino: el modelo espera un único mensaje de usuario sin mensaje de sistema y una instrucción concreta en chino; desviarse de ese formato puede degradar la calidad.
- Decodificación greedy recomendada: el uso de sampling no está validado y puede aumentar la variabilidad de la salida.
- Contexto máximo no documentado: se desconoce la longitud de contexto soportada, lo que limita la planificación de cargas con documentos largos.
- Repositorio recién publicado (12 de noviembre de 2026) con 0 descargas y 0 likes en el momento de la consulta: no hay evidencia de uso en producción por terceros.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/OpenInfinity/Index-Translate-2B-MLX-6bit
- Modelo base: https://huggingface.co/IndexTeam/Index-Translate-2B
- GGUF oficial: https://huggingface.co/IndexTeam/Index-Translate-2B-GGUF
- MLX: https://github.com/ml-explore/mlx
- mlx-lm: https://github.com/ml-explore/mlx-lm
- mlx-swift-lm: https://github.com/ml-explore/mlx-swift-lm
