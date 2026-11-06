# HomiG/gemma-4-E2B-it-litert-lm-fp16-rope512

## Resumen

Este repositorio contiene una modificación comunitaria del modelo Gemma 4 E2B en formato LiteRT-LM, preparado por el usuario HomiG a partir del checkpoint oficial `litert-community/gemma-4-E2B-it-litert-lm` de Google. El modelo original es un Gemma 4 de tamaño E2B (orientado a dispositivos móviles y edge) empaquetado con LiteRT-LM para su ejecución en Android, iOS, escritorio, IoT y web. La modificación no altera los pesos: únicamente reescribe el grafo que convierte las posiciones de los tokens en fases rotatorias (RoPE), tanto en el modelo principal como en el drafter de decodificación especulativa.

El problema que resuelve es un fallo documentado en el runtime LiteRT-LM (issue #3913): con la precisión por defecto de 16 bits en las activaciones, el modelo original corrompe dígitos e identificadores cuando el contexto supera los 2.048 tokens. La corrección divide la posición en `512·h + l`, aplica la operación MUL/SIN/COS original a `l` y obtiene la fase de `512·h` de una tabla precalculada, combinándolas por suma de ángulos. Esto mantiene la exactitud en coma flotante hasta la posición 32.767.

El resultado es relevante para quien despliega Gemma 4 E2B en GPU móvil con precisión de 16 bits y necesita fiabilidad en tareas de copia exacta, extracción de identificadores o preguntas sobre textos largos. El autor reporta mejoras sustanciales en pruebas de copia exacta (de 0/24 a 20/24) y en un catálogo de preguntas y respuestas (de 55-60 a 78 sobre 130 escenarios), medidas en un único iPhone 12 Pro.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (Gemma 4 E2B) empaquetado en LiteRT-LM; incluye drafter de decodificación especulativa |
| Parametros totales | no disponible (el repo ocupa 2,6 GB en FP16, lo que sugiere ~2B parámetros, pero el dato no se declara) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible explícitamente; la corrección RoPE garantiza exactitud hasta la posición 32.767 |
| Tipos de cuantizacion | FP16 (archivo `fp16-rope512`); el runtime LiteRT-LM permite otras precisiones, pero la corrección está pensada para activaciones de 16 bits |
| Idiomas soportados | no disponible en la información proporcionada |
| Licencia | Apache 2.0 |
| Formato de pesos | `.litertlm` (LiteRT-LM); no usa safetensors ni GGUF |

## Arquitectura y entrenamiento

El modelo subyacente es un Gemma 4 E2B de Google, diseñado para ofrecer rendimiento de nivel frontera en el segmento móvil y edge (junto a E4B), según la documentación de Google AI Edge. La familia Gemma 4 se orienta a razonamiento, flujos agénticos, código y comprensión multimodal. LiteRT-LM es el runtime de Google para ejecutar estos modelos en CPU o GPU en Android, iOS, escritorio, IoT y web.

Esta variante concreta no ha sido reentrenada ni afinada: los pesos son idénticos al original. El único cambio es en el grafo de RoPE. La posición del token se descompone como `512·h + l`; la parte `l` pasa por las operaciones MUL/SIN/COS originales y la parte `512·h` se resuelve mediante una tabla precalculada de fases, combinándose ambas por suma de ángulos. El parche se aplica tanto al modelo principal como al drafter de decodificación especulativa, y se genera con `patch_rope.py` a partir del archivo original de Google. El autor aporta los hashes SHA-256 de ambos archivos para verificar la reproducibilidad.

## Capacidades

- Generación de texto y razonamiento: heredadas del Gemma 4 E2B original, orientadas a escenarios edge.
- Copia exacta y extracción de identificadores: la corrección RoPE evita la corrupción de dígitos e identificadores en contextos largos con activaciones de 16 bits.
- Decodificación especulativa: el drafter también recibe el parche de RoPE, por lo que la ruta especulativa mantiene la exactitud posicional.
- Visión: la prueba de caption de imagen del autor pasa tanto en el original como en esta variante.
- Ejecución on-device: CPU o GPU mediante LiteRT-LM, sin overrides de activación.
- Soporte de tool calling, agentes, multilingüismo o modo thinking: no disponible en la información proporcionada para esta ficha.

## Casos de uso

- Extracción de identificadores en documentos largos: en flujos móviles donde se procesan contratos, facturas o registros con más de 2.048 tokens, la corrección evita que números de referencia, códigos postales o IDs se corrompan en la salida.
- Copia y transcripción de texto estructurado: tareas de copia exacta de fragmentos con dígitos y símbolos (por ejemplo, serialización de tablas o listados) sobre GPU móvil con precisión de 16 bits.
- Asistente de preguntas y respuestas sobre corpus largos: el autor reporta 78/130 escenarios superados frente a 55-60 del original en un catálogo de QA, lo que lo hace adecuado para asistentes documentales en dispositivos.
- Aplicaciones de accesibilidad con descripción de imágenes: la prueba de caption visual pasa, permitiendo integrar el modelo en apps que describen escenas o documentos escaneados en el propio dispositivo.
- Procesamiento de formularios y datos sensibles en local: al ejecutarse on-device con LiteRT-LM, permite tratar información sin enviarla a la nube, útil en sectores con requisitos de privacidad.
- Prototipado de agentes móviles con contexto medio: la ventana efectiva de exactitud hasta 32.767 tokens permite cadenas de razonamiento y llamadas a herramientas con historial largo sin degradación numérica.

## Benchmarks y rendimiento

| Prueba | Original | Esta variante |
|---|---|---|
| Copias exactas, ~3.100 y 5.700 tokens, identificadores en relleno repetido | 0/24 | 20/24 |
| Identificadores corruptos entre los fallos | Muchos | 0 |
| Tokens de decodificación por segundo (tres ejecuciones) | 22,4-22,8 | 22,7-22,8 |
| Primer token, ms (tres ejecuciones) | 443-543 | 421-431 |
| Memoria pico, MB (tres ejecuciones) | 992-1.116 | 733-843 |
| Caption de visión | Pasa | Pasa |
| Catálogo de preguntas y respuestas (130 escenarios) | 55-60 | 78 |

Mediciones del autor en un único iPhone 12 Pro, iOS 27, LiteRT-LM 0.19, Metal y precisión por defecto. Las ejecuciones de QA no partieron de la misma temperatura, por lo que la comparación no es estrictamente controlada. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM/memoria: el archivo ocupa 2.589.310.976 bytes (~2,6 GB); el autor reporta un pico de memoria de 733-843 MB en iPhone 12 Pro con Metal, frente a 992-1.116 MB del original.
- GPU recomendadas: el caso validado es GPU móvil Apple (iPhone 12 Pro, Metal). Para escritorio se puede usar LiteRT-LM en CPU o GPU; no hay datos publicados para A100, H100 o RTX 4090.
- GPU de consumo: el tamaño de ~2,6 GB permite ejecución en GPUs de consumo modernas, pero no hay mediciones publicadas en ese hardware.
- Despliegue: LiteRT-LM en CPU o GPU, sin override de activación. No se distribuye en GGUF ni safetensors, por lo que no es compatible directamente con llama.cpp, Ollama, vLLM o TGI.
- Latencia y throughput: 22,7-22,8 tokens/s de decodificación y 421-431 ms hasta el primer token en iPhone 12 Pro (tres ejecuciones).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| HomiG/gemma-4-E2B-it-litert-lm-fp16-rope512 | no disponible (~2B por tamaño del repo) | exactitud RoPE hasta 32.767 | `.litertlm` | Apache 2.0 | Parche comunitario de RoPE; 20/24 en copias exactas |
| litert-community/gemma-4-E2B-it-litert-lm | no disponible (~2B) | no disponible | `.litertlm` | Apache 2.0 | Original de Google; 0/24 en copias exactas con activaciones de 16 bits |
| google/gemma-4-E2B-it | no disponible (~2B) | no disponible | no disponible | Apache 2.0 | Checkpoint de referencia de Google para Gemma 4 E2B |
| Gemma 4 E4B | no disponible | no disponible | `.litertlm` (soportado por LiteRT-LM) | Apache 2.0 | Variante mayor de la familia edge; no soportada aún en LiteRT-LM para modelos grandes |

## Limitaciones y advertencias

- Límite conocido declarado por el autor: en prompts largos donde la instrucción aparece después de un texto no relacionado extenso, el modelo puede devolver el inicio de ese texto en lugar de seguir la instrucción. Esta variante no corrige ese comportamiento.
- Las mediciones provienen de un único dispositivo (iPhone 12 Pro) y no garantizan el rendimiento en otros hardware.
- La comparación del catálogo de QA no partió de la misma temperatura, por lo que sus cifras no son directamente equiparables.
- El parche está diseñado para activaciones de 16 bits; con otras precisiones el comportamiento no está documentado.
- No es compatible con ecosistemas de inferencia habituales (llama.cpp, Ollama, vLLM, TGI) por el formato `.litertlm`.
- Es una modificación comunitaria independiente, no afiliada ni respaldada por Google; Gemma es una marca de Google LLC.
- No hay información sobre sesgos, tasas de alucinación o cobertura idiomática específica de esta variante; deben evaluarse en el modelo base.
- Licencia Apache 2.0: permite uso comercial, pero conviene revisar el archivo `NOTICE` que documenta los cambios realizados.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/HomiG/gemma-4-E2B-it-litert-lm-fp16-rope512
- Modelo base LiteRT-LM: https://huggingface.co/litert-community/gemma-4-E2B-it-litert-lm
- Checkpoint de Google: https://huggingface.co/google/gemma-4-E2B-it
- Documentación de Gemma 4 en Google AI Edge: https://developers.google.com/edge/litert-lm/models/gemma-4
- Issue LiteRT-LM #3913: https://github.com/google-ai-edge/LiteRT-LM/issues/3913
- Issue litert-torch #1343: https://github.com/google-ai-edge/litert-torch/issues/1343
- Repositorio del parche `patch_rope.py`: https://github.com/PowerBeef/agello-litert-lm
- Página de licencia de Gemma 4: https://ai.google.dev/gemma/docs/gemma_4_license
