# kingjones777/Gemma-4-12B-it-ROCmFP4-GGUF

## Resumen

Este repositorio contiene una cuantización GGUF del modelo multimodal `google/gemma-4-12b-it` (Gemma 4 12B instruct) realizada por el usuario kingjones777, optimizada específicamente para hardware AMD RDNA3.5 (arquitectura gfx1151, conocida como Strix Halo). La particularidad principal es el uso de tipos de tensor ROCmFP4 y ROCmFPX, que son formatos de punto flotante de 4 y 8 bits nativos para ROCm, no disponibles en la rama principal de llama.cpp. El objetivo es ejecutar un modelo de 12.000 millones de parámetros con capacidades multimodales (imagen y texto) y razonamiento en APUs como el Ryzen AI MAX+ 395, aprovechando al máximo la memoria unificada y la aceleración por GPU integrada.

El repositorio incluye cinco variantes de cuantización (desde Q4_0_ROCMFP4 hasta Q8_0_ROCMFPX), un proyector multimodal (`mmproj`) y un modelo auxiliar para decodificación especulativa (MTP draft head) que ofrece una aceleración medida de 1,46× en la velocidad de decodificación. Es una solución pensada para desarrolladores que quieren desplegar Gemma 4 12B en entornos locales con hardware AMD de última generación, sin depender de GPUs NVIDIA ni de la nube. El modelo base es un transformer denso de 11.907 millones de parámetros, con un vocabulario de 262.144 tokens y embeddings atados (tied embeddings).

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (basado en google/gemma-4-12b-it), multimodal (imagen-texto) |
| Parametros totales | 11.907.350.576 (~11,9 B) |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | no disponible (no especificada en la ficha; el modelo base Gemma 4 12B soporta contexto largo, pero no se indica el valor exacto) |
| Tipos de cuantizacion | Q4_0_ROCMFP4 (variantes COHERENT y FAST_COHERENT), Q6_0_ROCMFPX (AGENT), Q8_0_ROCMFPX (estándar y AGENT) |
| Idiomas soportados | no disponibles (no especificados en la ficha) |
| Licencia | gemma (Gemma Terms of Use) |
| Formato de pesos | GGUF (con tipos ROCmFP4/ROCmFPX propietarios del fork ROCmFPX de llama.cpp) |

## Arquitectura y entrenamiento

El modelo es una cuantización del checkpoint `google/gemma-4-12b-it`, un transformer denso multimodal entrenado por Google DeepMind. No se proporcionan datos sobre el entrenamiento original (número de tokens, composición del dataset, técnicas de alineación como RLHF o DPO) en la información disponible. La cuantización se realizó con el fork ROCmFPX de llama.cpp, que introduce tipos de tensor FP4 y FP8 optimizados para ROCm en GPUs RDNA3.5. Una característica técnica relevante es que el modelo tiene `tie_word_embeddings: true`, por lo que no existe un tensor `output.weight` separado; la protección de precisión se aplica únicamente sobre `token_embd` (embeddings de entrada). El repositorio incluye además un modelo auxiliar MTP (Multi-Token Prediction) en Q8_0 para decodificación especulativa, que permite acelerar la generación hasta 1,46× en hardware Strix Halo.

## Capacidades

- Generación de texto y razonamiento: el modelo es un "reasoner" según el README, devolviendo respuestas en `reasoning_content` y dejando `content` vacío en muchas ocasiones.
- Multimodal: incluye proyector de visión (`mmproj`) para entrada de imágenes (image-text-to-text).
- Decodificación especulativa: soporta el draft head MTP para acelerar la inferencia (hasta 39,25 t/s medidos con `--spec-draft-n-max 5`).
- Conversacional: diseñado para instrucciones y diálogo multi-turno (variante `-it`).
- No se mencionan explícitamente capacidades de tool calling, function calling o agentes, aunque el modelo base Gemma 4 12B it las soporta; no está confirmado en esta cuantización.

## Casos de uso

- Asistentes locales en APUs AMD Strix Halo: el modelo está pensado para ejecutarse en equipos con Ryzen AI MAX+ 395 y memoria unificada de 128 GB, permitiendo un asistente conversacional con razonamiento sin conexión a internet.
- Análisis de imágenes en el edge: gracias al proyector multimodal, se puede usar para describir imágenes, extraer información visual o generar respuestas contextuales a partir de fotografías, todo en hardware local.
- Desarrollo de aplicaciones de razonamiento: al ser un modelo que produce cadenas de razonamiento explícitas, es adecuado para tareas de lógica, matemáticas y resolución de problemas paso a paso en entornos sin GPU dedicada.
- Prototipado de agentes con decodificación especulativa: el MTP draft head permite reducir la latencia en aplicaciones interactivas donde la velocidad de respuesta es crítica, como chatbots o asistentes de voz.
- Despliegue en entornos con restricciones de privacidad: al funcionar completamente en local, es útil para sectores que no pueden enviar datos a la nube (salud, finanzas, administración pública).
- Evaluación de cuantizaciones FP4/FP8 en ROCm: sirve como banco de pruebas para desarrolladores que investigan el rendimiento de formatos de baja precisión en GPUs AMD RDNA3.5.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. El README solo reporta mediciones de velocidad de decodificación en un Ryzen AI MAX+ 395 (Strix Halo, 128 GB, ROCm 7.2.4) con `-ngl 999`, `-c 4096`, `-fa on`, `-fit off`, `-np 1` y generaciones de 300 tokens, sin draft head:

| Variante | Tamaño | BPW | Decode (mediana) |
|---|---|---|---|
| Q4_0_ROCMFP4_COHERENT | 6,50 GiB | 4,68 | 26,95 t/s |
| Q4_0_ROCMFP4_FAST_COHERENT | 6,18 GiB | 4,45 | 26,56 t/s |
| Q6_0_ROCMFPX_AGENT | 10,43 GiB | 7,52 | 17,54 t/s |
| Q8_0_ROCMFPX | 11,48 GiB | 8,27 | 16,39 t/s |
| Q8_0_ROCMFPX_AGENT | 11,67 GiB | 8,41 | 15,92 t/s |

Con decodificación especulativa (MTP draft head en Q8_0) sobre la variante Q4_0_ROCMFP4_COHERENT: 36,2 t/s con `--spec-draft-n-max 3` (1,34×) y 39,25 t/s con `--spec-draft-n-max 5` (1,46×). La tasa de aceptación del draft fue de 0,64378 y 0,57049 respectivamente. Se verificó la corrección de las salidas en tres pruebas (17×23→391, capital de Japón→Tokyo, días en 2024→366) en todas las variantes.

## Requisitos de hardware

- GPU: exclusivamente AMD RDNA3.5 con arquitectura gfx1151 (Strix Halo, p. ej. Ryzen AI MAX+ 395). No es compatible con GPUs NVIDIA ni con RDNA anteriores.
- VRAM: entre 6,18 GiB y 11,67 GiB según la variante (archivos GGUF). En Strix Halo con memoria unificada, se puede usar la RAM del sistema (hasta 128 GB).
- RAM: se recomienda al menos 16 GB para las variantes Q4 y 24 GB para las Q8, aunque las mediciones se realizaron con 128 GB.
- Software: requiere el fork ROCmFPX de llama.cpp (no funciona con llama.cpp estándar). Se puede usar `llama-server` o `llama-cli`.
- Aceleración: se recomienda ROCm 7.2.4 o superior.
- Latencia: en el hardware de prueba, la decodificación oscila entre 15,92 y 26,95 t/s según la cuantización, y hasta 39,25 t/s con MTP activado.

## Comparativa con modelos similares

No se dispone de datos comparativos directos con otras cuantizaciones del mismo modelo (p. ej. GGUF estándar Q4_K_M) o con modelos de tamaño similar (Llama 3.1 8B, Qwen 2.5 14B) en la información proporcionada. La comparativa más relevante sería contra el modelo base `google/gemma-4-12b-it` sin cuantizar, que requiere mucho más espacio (los safetensors originales ocupan varios GB adicionales) y no está optimizado para ROCm FP4/FP8. Esta cuantización ofrece una ventaja clara en hardware AMD de última generación, pero no es portable a otros ecosistemas. No se puede establecer una comparativa numérica sin benchmarks adicionales.

## Limitaciones y advertencias

- Defecto conocido: con el draft head MTP activado, generaciones largas (1500 tokens) abortan el servidor con el error `GGML_ASSERT(spec_i_batch.empty()) failed` en `server_slot::update_batch`. Se recomienda limitar la longitud de generación y dejar margen de contexto.
- Incompatibilidad MTP-visión: la decodificación especulativa y el procesamiento de imágenes no pueden usarse simultáneamente (limitación del fork llama.cpp PR #20277). Para imágenes hay que desactivar `--spec-type` y usar `-fa off`.
- Tied embeddings: no existe `output.weight`; `--output-tensor-type` es un no-op. Solo `--token-embedding-type` protege la cabeza de embeddings.
- Dependencia de un fork específico: los tipos ROCmFP4/ROCmFPX no existen en llama.cpp estándar, lo que limita la portabilidad y el soporte de la comunidad.
- Hardware restringido: solo funciona en GPUs AMD gfx1151 (RDNA3.5). No es utilizable en NVIDIA, Intel o AMD más antiguos.
- Riesgo de alucinación y sesgos: inherentes al modelo base Gemma 4 12B; no se han evaluado específicamente en esta cuantización.
- Sin datos de calidad: no se han publicado benchmarks de rendimiento en tareas estándar, por lo que no se puede verificar si la cuantización degrada la precisión respecto al modelo original.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/kingjones777/Gemma-4-12B-it-ROCmFP4-GGUF
- Modelo base: https://huggingface.co/google/gemma-4-12B
- Página oficial de Gemma 4 (Google DeepMind): https://deepmind.google/models/gemma/gemma-4/
- Blog de Google Developers sobre Gemma 4 12B en portátiles: https://developers.googleblog.com/bringing-gemma-4-12b-to-your-laptop-unlocking-local-agentic-workflows-with-google-ai-edge/
- Ejemplo de cuantización similar del mismo autor: https://huggingface.co/kingjones777/Mellum2-12B-A2.5B-Instruct-ROCmFP4-GGUF
