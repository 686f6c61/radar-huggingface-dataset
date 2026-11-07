# androidli/Qwen3.5-4B-3D-Coder-onnx-int4

## Resumen

Qwen3.5-4B-3D-Coder-onnx-int4 es una exportación cuantizada a int4 del modelo ccore/Qwen3.5-4B-3D-Coder, un fine-tune de Qwen/Qwen3.5-4B orientado a la generación de código y escenas 3D interactivas en Three.js. El autor de esta conversión (androidli) no ha reentrenado ni ajustado nada: se limita a exportar el grafo a ONNX y cuantizar los pesos a 4 bits con `MatMulNBits`, manteniendo las activaciones en fp32. El resultado pasa de unos 17 GB en fp32 a 2,84 GB, lo que permite ejecutar inferencia de texto íntegramente en CPU con `onnxruntime`, sin GPU ni Metal.

La arquitectura subyacente es un transformer híbrido de Qwen3.5 con 32 capas: 24 capas de atención lineal gated-delta (con buffer convolucional y matriz recurrente) y 8 capas de atención completa con caché key/value convencional. El modelo base tiene aproximadamente 4-5B parámetros (la ficha de Qwen indica 5B) y es un VLM, pero esta release ONNX cubre únicamente la ruta de texto: la torre de visión para generar código a partir de imágenes no está incluida.

La relevancia de esta ficha es práctica: es una de las pocas vías publicadas para correr un modelo de código de ~4B en CPU a velocidades utilizables (21,1 tok/s de decodificación en un M1 Pro), con licencia Apache-2.0 y un runner mínimo basado en numpy y onnxruntime. Es útil para entornos sin GPU, para prototipado local y para pipelines donde el coste de GPU no está justificado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido Qwen3.5: 24 capas gated-delta (atención lineal) + 8 capas de atención completa (32 capas totales) |
| Parametros totales | ~4B (modelo base ccore/Qwen3.5-4B-3D-Coder; la ficha de Qwen/Qwen3.5-4B indica 5B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en la información proporcionada (ventana de prefill de 256 tokens por grafo) |
| Tipos de cuantizacion | Pesos int4 `MatMulNBits` (bloque 32, simétrico, `accuracy_level=4`); activaciones fp32; embedding de tokens int8 con escala por fila |
| Idiomas soportados | en, zh |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (`text_prefill.onnx`, `text_decode.onnx` con datos externos `.data`), embedding en `.npy` |

## Arquitectura y entrenamiento

El modelo base Qwen3.5-4B-3D-Coder es un fine-tune de CCORE sobre Qwen/Qwen3.5-4B, según la información de la comunidad litert. El ajuste se centró en código y escenas 3D interactivas en Three.js: a partir de una descripción de escena, el modelo escribe un único fichero HTML autocontenido. El informe técnico citado describe un fine-tuning completo de los parámetros del lenguaje con el codificador de visión congelado, seguido de una etapa corta de LoRA, sobre el dataset ccore/ThreeJS-3D-Scenes (3.933 escenas de entrenamiento). No se dispone de datos sobre volumen de tokens, composición exacta del corpus ni uso de RLHF/DPO.

Esta release concreta no introduce cambios de arquitectura ni de entrenamiento: es una conversión de formato y precisión. La innovación técnica está en el proceso de exportación, documentado con detalle por el autor. Los puntos relevantes: (1) exportar en fp32 y cuantizar después, porque el forward del modelo reescala internamente a fp32 y un grafo fp16 con islas fp32 provoca rechazo de operadores por parte de ONNX Runtime; (2) exportar y cuantizar en procesos separados, dado que el grafo fp32 de 4B pico cerca de 17 GB y agota una máquina de 32 GB si se hace en el mismo intérprete; (3) pre-transponer los pesos de `nn.Linear` a `[in, out]` antes de exportar, ya que `MatMulNBitsQuantizer` no cuantiza nada sobre `MatMul(x, Transpose(W))` ni sobre `Gemm`; (4) representar el estado como tensores de entrada/salida (64 tensores: `conv_*`/`rec_*` para las 24 capas lineales, `k_*`/`v_*` para las 8 de atención) en lugar de un kv-cache clásico, que solo cubriría 8 de las 32 capas.

## Capacidades

- Generación de texto conversacional en inglés y chino.
- Generación de código, con especialización declarada en escenas 3D interactivas en Three.js y salida en HTML autocontenido (capacidad heredada del modelo base completo; la torre de visión no está en esta release).
- Razonamiento de varios pasos y resolución de tareas de programación (el ejemplo de la model card muestra un modo de "pensamiento" explícito en la decodificación).
- Inferencia en CPU sin GPU, sin Metal y sin CUDA, usando solo `onnxruntime` y numpy.
- Dos grafos separados: prefill/teacher-forcing en ventanas de 256 tokens y decodificación de un token por llamada, ambos con el mismo layout de estado.
- Compatibilidad potencial con execution providers CUDA, DirectML y CoreML (grafos ONNX estándar), aunque el autor no publica cifras de velocidad para ellos.
- No incluye: visión, audio, tool calling declarado, ni soporte multilingüe más allá de en/zh.

## Casos de uso

- Generación de código en entornos sin GPU: un portátil o un servidor de CPU puede servir un modelo de código de 4B con 21 tok/s de decodificación, suficiente para autocompletado asistido o generación de funciones cortas.
- Prototipado local de escenas Three.js: dado que el modelo base se entrenó para producir un HTML autocontenido a partir de una descripción de escena, esta ruta de texto permite iterar descripciones y generar borradores de escena sin infraestructura de GPU.
- Asistentes de programación embebidos en herramientas de escritorio: el runner mínimo (`run_text.py` con numpy + onnxruntime + tokenizer de transformers) se integra en aplicaciones de escritorio o CLI con un pico de RSS de ~7 GB.
- Pipelines de CI/CD con restricciones de hardware: para tareas de generación de documentación de código, resúmenes de diffs o sugerencias de parches, donde el coste de una GPU dedicada no se justifica.
- Evaluación y experimentación con cuantización int4: el repositorio documenta métricas de divergencia greedy frente a fp32 (argmax del primer token idéntico, divergencia desde el token 5 de 32), lo que lo convierte en un banco de pruebas útil para estudiar el impacto de 4 bits en calidad de código.
- Despliegue en dispositivos edge con CPU x86 o ARM: los grafos ONNX con pesos int4 y activaciones fp32 cargan en cualquier runtime ONNX, lo que abre la puerta a entornos con memoria limitada.
- Servicio de chat bilingüe en/zh de bajo coste: para atención conversacional sencilla en inglés o chino donde no se requiere contexto largo ni multimodalidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K) en la información disponible. Los únicos datos medidos son de rendimiento de inferencia, aportados por el autor:

| Metrica | Valor (M1 Pro, solo CPU) |
|---|---|
| Decodificacion | 21,1 tok/s (13,8 tok/s en el arnes de verificacion) |
| Prefill | 2,7 s para un prompt de chat de 20 tokens |
| Peso de pesos (prefill) | 2,84 GB |
| Peso de pesos (decode) | 2,64 GB |
| Embedding de tokens | 636 MB int8 (error absoluto maximo 7,6e-4) |
| Argmax del primer token | Identico a fp32 (token 1596) |
| Divergencia greedy | A partir del token 5 de 32 |
| Pico de RSS en runtime | ~7 GB |

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica en la ruta CPU documentada; pico de RSS de ~7 GB en memoria del sistema.
- GPU recomendadas: no se han publicado cifras para GPU. Los grafos ONNX son estándar y deberían cargar con execution providers CUDA, DirectML o CoreML, pero el autor no reclama números de velocidad.
- Cabe en GPU consumer: no verificado; el diseño apunta a CPU. En una RTX 4090 (24 GB) los pesos de 2,8 GB cabrían con holgura, pero no hay mediciones.
- Opciones de despliegue: `onnxruntime` (CPU) con el runner `run_text.py` incluido; potencialmente ONNX Runtime con EP CUDA/DirectML/CoreML. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no son compatibles con este formato tal como se publica.
- Latencia y throughput: prefill de 2,7 s para 20 tokens y 21,1 tok/s de decodificación en M1 Pro (CPU, sin Metal); 13,8 tok/s en el arnés de verificación más estricto.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato / despliegue | Licencia | Notas |
|---|---|---|---|---|---|
| androidli/Qwen3.5-4B-3D-Coder-onnx-int4 | ~4B | No disponible | ONNX int4, CPU | Apache-2.0 | Esta ficha; ruta de texto únicamente |
| ccore/Qwen3.5-4B-3D-Coder | ~4B | No disponible | Pesos originales (formato no detallado) | Apache-2.0 | Modelo base completo, incluye torre de visión |
| Qwen/Qwen3.5-4B | 5B | No disponible | Pesos originales | No disponible en la informacion | Modelo original image-text-to-text |
| litert-community/Qwen3.5-4B-3D-Coder | ~4B | No disponible | Formato LiteRT (no detallado) | No disponible en la informacion | Conversión comunitaria para el runtime LiteRT |

## Limitaciones y advertencias

- Solo ruta de texto: la torre de visión del modelo base (3D/código a partir de imagen) no está incluida en esta release.
- Calidad a 4 bits: la decodificación greedy diverge del fp32 a partir del token 5 de 32. El autor lo describe como comportamiento normal de la cuantización, pero implica que no debe usarse identidad de tokens como señal de calidad; conviene evaluar con métricas de tarea o a nivel de logits.
- Idiomas limitados a inglés y chino; no hay soporte declarado para castellano ni otros idiomas.
- Longitud de contexto no documentada; los grafos de prefill trabajan en ventanas de 256 tokens, lo que limita el contexto efectivo por llamada salvo que el runner encadene estados.
- Solo se han publicado mediciones en CPU (M1 Pro); no hay cifras de latencia o throughput para GPU ni para otras CPU.
- Riesgo de alucinación y sesgos del modelo base: no se documentan evaluaciones de sesgo, toxicidad o fidelidad factual en la información disponible.
- Licencia Apache-2.0 permisiva para uso comercial, heredada del modelo base; conviene verificar igualmente los términos del modelo original Qwen/Qwen3.5-4B y del fine-tune de CCORE antes de producción.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: no hay evidencia de uso comunitario ni de validación independiente.
- El proceso de exportación tiene trampas documentadas (cuantización silenciosa nula sobre `Transpose`/`Gemm`, `save_as_external_data` que añade en lugar de truncar); replicarlo requiere cuidado.

## Enlaces

- Hugging Face (esta release): https://huggingface.co/androidli/Qwen3.5-4B-3D-Coder-onnx-int4
- Modelo base: https://huggingface.co/ccore/Qwen3.5-4B-3D-Coder
- Modelo original: https://huggingface.co/Qwen/Qwen3.5-4B
- Conversión comunitaria LiteRT: https://huggingface.co/litert-community/Qwen3.5-4B-3D-Coder
- Perfil del autor: https://x.com/greatYiTin
