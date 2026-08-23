# chartreuse-verte/prose-rewriter-4b-v1.2

## Resumen

`chartreuse-verte/prose-rewriter-4b-v1.2` es un modelo de reescritura de prosa a nivel de párrafo, desarrollado por el autor `chartreuse-verte`. Su función principal es tomar texto generado por un modelo grande y re-renderizarlo para que suene más humano, preservando la semántica original. Es el checkpoint más grande de una familia de dos modelos (junto a la versión 1.7B) entrenados sobre el mismo pool de datos y pipeline.

El modelo parte de `Qwen/Qwen3-4B-Base` (4,4 mil millones de parámetros) y aplica un LoRA de rango 32 fusionado a intensidad 1,15. Está diseñado para procesar un párrafo por llamada, con un techo documentado de 512 tokens de entrada y un presupuesto de generación que nunca supera los 512 tokens. No es un modelo conversacional: su plantilla de chat rechaza los roles `user`, `assistant` y `system`, y exige un bloque `edit` obligatorio que selecciona el modo de transformación de longitud.

Su relevancia actual radica en la creciente necesidad de "deslopificar" contenido generado por IA, es decir, eliminar el estilo artificial y repetitivo característico de la salida de modelos grandes. Está disponible en formatos safetensors (bf16) y GGUF (Q8_0 y Q4_K_M), bajo licencia AGPL-3.0 y con soporte únicamente para inglés.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Qwen3-4B-Base con LoRA rank-32 fusionado (strength 1.15) |
| Parámetros totales | 4.411.424.256 |
| Parámetros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible en la documentación; uso operativo recomendado: 1280 tokens por slot (512 fuente + 512 generación + overhead de prompt) |
| Tipos de cuantización | bf16 (safetensors), GGUF Q8_0 (4,69 GB), GGUF Q4_K_M (2,72 GB) |
| Idiomas soportados | en (inglés) |
| Licencia | AGPL-3.0 |
| Formato de pesos | safetensors (bf16), GGUF |

## Arquitectura y entrenamiento

La arquitectura es la del modelo base `Qwen/Qwen3-4B-Base` (transformer denso con attention estándar), sobre la que se ha aplicado un LoRA de rango 32 fusionado a una fuerza de 1.15. El entrenamiento se realizó sobre un pool de párrafos de "slop" (contenido de baja calidad generado por IA), con un pipeline de corrupción que produce pares entrada-salida: el `corruptor` genera versiones alargadas (inflate), comprimidas (compress) o fieles en longitud (match) del texto original humano, y el modelo aprende a invertir esa transformación. El pool de entrenamiento tiene un mínimo de 80 bytes por párrafo, con una mediana de entrada de 50 palabras y un 80% del corpus por debajo de 80 palabras. No se menciona el uso de RLHF ni DPO.

La innovación técnica principal es el sistema de modos `edit` con semántica inversa: los valores (`match`, `inflate`, `compress`) describen la transformación aplicada a la entrada, no la que debe realizar el modelo. El modo `match` (reescritura en el sitio sin recortar) es el recomendado. El modelo no es conversacional; la plantilla rechaza roles de chat estándar y solo acepta `source` y `edit` como roles de entrada.

## Capacidades

- Reescritura de prosa a nivel de párrafo: toma un párrafo generado por un modelo grande y lo re-renderiza con un estilo más humano, preservando la semántica.
- Tres modos de transformación de longitud controlados por el bloque `edit`:
  - `match`: reescribe en el sitio, manteniendo la longitud del original humano.
  - `inflate`: la entrada fue inflada respecto al original humano, el modelo la recorta.
  - `compress`: la entrada fue comprimida y acortada, el modelo la expande.
- Generación de texto con parada en `<|im_end|>`, configurado como `eos_token_id`.
- Único parámetro de control en inferencia: temperatura (recomendada 0.9, top_p 0.9).
- No soporta tool calling, ni function calling, ni razonamiento multi-paso.
- No es conversacional: la plantilla rechaza `user` / `assistant` / `system`.
- No soporta visión ni audio.
- Monolingüe: solo inglés.

## Casos de uso

- **Humanización de contenido generado por IA para blogs y artículos**: el modelo reescribe párrafos completos de texto producido por modelos grandes, eliminando el tono artificial ("slop") manteniendo el significado. Su ventana de 512 tokens de entrada es suficiente para párrafos de hasta 60-80 palabras, que es el rango donde el modelo muestra su mejor comportamiento (ratio de longitud ~0.95 y 24-27% de invención).
- **Edición editorial de borradores**: un editor puede pasar párrafos de un borrador generado por IA por el modo `match` para obtener una versión más natural sin que cambie la extensión. El modelo funciona bien en párrafos de 15 a 59 palabras, con ratios de longitud entre 0.95 y 1.00.
- **Recorte de contenido inflado**: si un sistema de generación de IA ha producido texto con padding o redundancias, el modo `inflate` recorta la entrada a la longitud del original humano. Esto es útil en pipelines de generación de contenido para marketing o web donde la concisión es un requisito.
- **Expansión de texto comprimido**: en el modo `compress`, el modelo expande resúmenes o extractos a prosa completa. Puede aplicarse a notas, guiones o esquemas que necesitan convertirse en párrafos fluidos.
- **Pipeline de limpieza de contenido para SEO**: integrado en un flujo de generación de artículos, el modelo puede aplicarse a cada párrafo antes de publicar para reducir la detección de texto sintético y mejorar la calidad percibida. Con `llama.cpp` y GGUF Q4_K_M (2,72 GB) cabe en GPUs de consumo, permitiendo procesamiento local.
- **Post-procesado en generación de contenido multilingüe**: aunque el modelo solo soporta inglés, puede integrarse en un pipeline donde el contenido se genera en inglés y luego se traduce a otros idiomas; la reescritura previa mejora la calidad de la traducción posterior.

## Benchmarks y rendimiento

La model card incluye un barrido sobre 577 párrafos de evaluación (215 filas de slop real y 365 párrafos de LLM escritos en frío), con `edit=match`, temperatura 0.9 / top-p 0.9, tres muestras por fila bajo 60 palabras y una por encima:

| Palabras de entrada | Generaciones | Ratio de longitud | Invención | Auto-repetición 3-gramas |
|---|---|---|---|---|
| < 15 | 288 | 1.41 | 68% | 0.000 |
| 15-24 | 219 | 1.00 | 31% | 0.001 |
| 25-39 | 108 | 0.96 | 32% | 0.000 |
| 40-59 | 60 | 0.95 | 27% | 0.001 |
| 60-79 | 180 | 0.91 | 24% | 0.002 |
| 80-119 | 170 | 0.90 | 24% | 0.002 |

El ratio de longitud es la mediana de palabras de salida sobre palabras de entrada. La invención es la proporción de generaciones que contienen una frase que la entrada no contiene (medida de alucinación). No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) para este modelo.

## Requisitos de hardware

- VRAM medida en una RTX 3090 con `llama-server -ngl 99`, flash attention `auto`, KV f16, antes de la primera petición:
  - Q8_0: pesos fijos 4,444 MiB + 180 MiB por slot de 1280 tokens de KV cache.
  - Q4_K_M: pesos fijos 2,742 MiB + 180 MiB por slot de 1280 tokens de KV cache.
- Ejemplos de VRAM total:
  - 1 slot (contexto 1280): 4,624 MiB (Q8_0) / 2,922 MiB (Q4_K_M).
  - 4 slots (contexto 5120): 5,164 MiB (Q8_0) / 3,462 MiB (Q4_K_M).
  - 8 slots (contexto 10240): 5,884 MiB (Q8_0) / 4,182 MiB (Q4_K_M).
- Cabe en GPUs de consumo: RTX 3090, RTX 4090, RTX 4070 (con Q4_K_M y 4 slots), y en GPUs de 6 GB o más con Q4_K_M.
- Opciones de despliegue: transformers (safetensors), llama.cpp / llama-cpp-python (GGUF), compatible con text-generation-inference y endpoints.
- Latencia y throughput: no disponible en la documentación.
- Recomendación del autor: 4 slots es un valor por defecto sensato; 8 slots reserva más de un gigabyte de KV cache antes de la primera petición, lo que puede ser crítico en tarjetas pequeñas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Licencia | Uso previsto |
|---|---|---|---|---|---|
| prose-rewriter-4b-v1.2 (este) | 4,41B | 1280 tokens por slot (recomendado) | safetensors, GGUF | AGPL-3.0 | Reescritura de prosa |
| prose-rewriter-1.7b-v1.2 | 1,7B | Mismo pipeline (1280 tokens por slot) | safetensors, GGUF | AGPL-3.0 | Reescritura de prosa (menor VRAM: 3,202 MiB con 8 slots) |
| Qwen/Qwen3-4B-Base | 4,41B | 32K (nativo) | safetensors | Apache-2.0 | Modelo base de propósito general |

No se han encontrado otros modelos de reescritura de prosa comparables en la información disponible. La comparación con el modelo base Qwen3-4B-Base es relevante porque el reescritor hereda su arquitectura y capacidad de generación, pero añade el ajuste fino específico para el estilo humano.

## Limitaciones y advertencias

- **Alucinación en entradas muy cortas**: el modelo inventa contenido en un 68% de las generaciones para párrafos de menos de 15 palabras. Para entradas de 15 o más palabras, la invención baja al 24-32%, pero sigue siendo un riesgo en producción.
- **Monolingüe**: solo soporta inglés. No funciona con textos en otros idiomas.
- **No es un modelo conversacional**: rechaza los roles `user` / `assistant` / `system`; solo acepta `source` y `edit`. Intentar usarlo como chat dará errores.
- **El bloque `edit` es obligatorio**: omitirlo colapsa el modelo en su modo de eliminación más agresivo, produciendo salidas no deseadas.
- **Un párrafo por llamada**: no está diseñado para procesar documentos completos de una sola vez; el techo de entrada documentado es de 512 tokens de fuente.
- **Licencia AGPL-3.0**: implica obligaciones de copyleft para uso comercial. Si se integra en un servicio, el código del servicio podría quedar sujeto a los términos de la AGPL.
- **Los modos `inflate` y `compress` tienen semántica inversa**: sus valores describen la transformación aplicada a la entrada, no la que debe realizar el modelo. Un uso incorrecto produce resultados contrarios a lo esperado.
- **No hay benchmarks estándar publicados**: no se han reportado resultados en MMLU, HumanEval, GSM8K u otros, por lo que no se puede comparar su rendimiento de razonamiento general con otros modelos.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/chartreuse-verte/prose-rewriter-4b-v1.2
- Repositorio de archivos del modelo: https://huggingface.co/chartreuse-verte/prose-rewriter-4b-v1.2/tree/main
- Versión menor (1.7B): https://huggingface.co/chartreuse-verte/prose-rewriter-1.7b-v1.2
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B-Base
- Despliegue en API de FriendliAI: https://friendli.ai/models/chartreuse-verte/prose-rewriter-4b-v1.2
- Referencia de estilo "depurple" en GitHub: https://github.com/OrbFrontend/Chartreuse/blob/main/README.md
