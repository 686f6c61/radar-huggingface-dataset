# building-an-inference-engine-from-scratch/llama32-1b-reference

## Resumen

`llama32-1b-reference` no es un modelo entrenado, sino un repositorio de artefactos de referencia (activaciones y logits) calculados con PyTorch sobre `meta-llama/Llama-3.2-1B-Instruct`. Lo publica la cuenta `building-an-inference-engine-from-scratch`, vinculada al libro «Building an Inference Engine from Scratch: AI Inference Engineering with Rust», y sirve como patrón de verificación capa por capa para el motor de inferencia `badak` que se construye en los capítulos 9 y 10 de la obra.

El repositorio contiene un fichero `reference.safetensors` con las activaciones intermedias de una única secuencia de 11 tokens (la frase «The capital of France is Paris. 추론 엔진») y un `tokenizer_vectors.json` con identificadores de token para un conjunto de cadenas de prueba. No incluye pesos del modelo: para ejecutar Llama 3.2 1B Instruct hay que descargar los pesos originales desde el repositorio de Meta.

Su relevancia es pedagógica y de ingeniería: permite validar numéricamente una implementación propia (en Rust, en este caso) comparando tensores intermedios con los producidos por `transformers`, en lugar de limitarse a comprobar la salida final. Al derivar de Llama 3.2, hereda la licencia Llama 3.2 Community License.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (la del modelo base Llama 3.2 1B Instruct); el repositorio en sí contiene tensores de referencia, no pesos |
| Parámetros totales | 1,24 mil millones (modelo base; no disponible en la información del repositorio) |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible en la información proporcionada (corresponde al modelo base) |
| Tipos de cuantización | no disponible (los tensores de referencia se calcularon en f32) |
| Idiomas soportados | no disponible |
| Licencia | llama3.2 (Llama 3.2 Community License) |
| Formato de pesos | safetensors (`reference.safetensors`) y JSON (`tokenizer_vectors.json`); no contiene pesos del modelo |

## Arquitectura y entrenamiento

El repositorio no entrena ningún modelo. Los tensores se generaron con el script `reference/ch09_llama_reference.py` del repositorio del libro, usando `transformers` 5.23.0 y `torch` 2.15.0, con los pesos del modelo base expandidos a f32 y ejecutados en CPU. La arquitectura subyacente es la de Llama 3.2 1B Instruct: un transformer decoder-only con normalización RMSNorm, atención con RoPE y MLP con activación SwiGLU, con dimensión oculta de 2048 y 32 cabezas de atención, según las formas de los tensores publicados.

El contenido de `reference.safetensors` cubre la traza completa de una pasada forward sobre 11 tokens: `ids` (11), `embed` (11, 2048), las proyecciones `l0.norm1`, `l0.q`, `l0.k`, `l0.v` del primer bloque, `l0.attn_weights` (32, 11, 11), `l0.attn`, `l0.norm2`, `l0.mlp` y `l0.out` (11, 2048), la pila `hidden_states` (17, 11, 2048) con la salida de cada bloque (la última entrada incluye la normalización final, tal como la devuelve `transformers`), `final_norm` (11, 2048) y `logits` (11, 128256). El vocabulario de 128 256 entradas coincide con el del tokenizador de Llama 3.2.

## Capacidades

- Verificación numérica capa por capa de una implementación de inferencia de Llama 3.2 1B Instruct: permite comparar embeddings, normalizaciones, proyecciones Q/K/V, pesos de atención, salidas de MLP y logits con los valores de referencia.
- Validación del tokenizador: `tokenizer_vectors.json` contiene los identificadores de token producidos por el tokenizador original para varias cadenas, sin token de inicio de secuencia.
- Depuración de motores propios: al aislar tensores intermedios, facilita localizar discrepancias en la implementación (por ejemplo, en el orden de las operaciones o en la normalización).
- No ofrece generación de texto, razonamiento, código, tool calling, capacidades de agente ni multimodalidad por sí mismo; esas capacidades residen en el modelo base, no en este repositorio.

## Casos de uso

- Desarrollo de un motor de inferencia desde cero: usar `reference.safetensors` como patrón dorado para comprobar que cada capa de la implementación (en Rust u otro lenguaje) reproduce los tensores de PyTorch antes de pasar a la validación de extremo a extremo.
- Docencia y material de curso: el repositorio acompaña a los capítulos 9 y 10 del libro, de modo que los lectores pueden reproducir los mismos valores y contrastar sus resultados con los publicados.
- Pruebas de regresión de un runtime: fijar los tensores de referencia como test automatizado que detecte cambios no deseados al optimizar kernels, cambiar el orden de fusión de operaciones o alterar el manejo de precisión.
- Validación de tokenizadores: comparar la salida del tokenizador propio con `tokenizer_vectors.json` para detectar diferencias en la segmentación o en el manejo de texto multilingüe (incluye una cadena en coreano).
- Depuración de atención: `l0.attn_weights` con forma (32, 11, 11) permite verificar la implementación de la máscara causal y del escalado en el primer bloque.
- Comparación de precisión: al disponer de la traza en f32, sirve para medir el error introducido al ejecutar el modelo en f16, bf16 o cuantizaciones de menor precisión.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- El repositorio en sí es mínimo (tamaño de 0,0 GB según Hugging Face) y no requiere GPU: los tensores de referencia se generaron en CPU con los pesos en f32.
- Para reproducir los valores hace falta descargar los pesos de `meta-llama/Llama-3.2-1B-Instruct` (acceso sujeto a la licencia de Meta) y ejecutar el script con `transformers` 5.23.0 y `torch` 2.15.0.
- Ejecutar el modelo base en f32 requiere del orden de 5 GB de memoria; en bf16 o f16, alrededor de 2,5 GB, por lo que cabe en GPUs de consumo como una RTX 3060 de 12 GB o una RTX 4090.
- Opciones de despliegue del modelo base: `transformers`, vLLM, llama.cpp, Ollama o TGI; el repositorio de referencia no incluye instrucciones de despliegue.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Propósito | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `llama32-1b-reference` (este repo) | no aplica (tensores de referencia de un modelo de 1,24 B) | no disponible | Verificación de motores de inferencia | Llama 3.2 Community License | Hugging Face, 0 descargas |
| `meta-llama/Llama-3.2-1B-Instruct` | 1,24 B | no disponible en la información proporcionada | Modelo instructivo ligero | Llama 3.2 Community License | Hugging Face, acceso bajo solicitud |
| Otros repositorios de referencia de motores de inferencia | no disponible | no disponible | Validación numérica | no disponible | no disponible |

No se dispone de información sobre alternativas equivalentes de referencia para motores de inferencia en la documentación consultada.

## Limitaciones y advertencias

- No es un modelo utilizable: no contiene pesos y no puede generar texto ni ejecutar tareas de inferencia por sí solo.
- La cobertura de referencia es muy reducida: una sola secuencia de 11 tokens y un conjunto limitado de cadenas para el tokenizador; no valida el comportamiento en contextos largos, en generación autoregresiva ni en otros idiomas más allá de los ejemplos incluidos.
- Los valores están calculados en f32 sobre CPU; no sirven como referencia directa para implementaciones en bf16, f16 o cuantizadas sin tener en cuenta el error numérico esperado.
- El campo `embed` es una porción de los pesos de Meta, por lo que la distribución queda sujeta a la Llama 3.2 Community License, con sus restricciones de uso comercial y su política de uso aceptable (`USE_POLICY.md`).
- El repositorio registra 0 descargas y 0 likes, sin pipeline declarado ni idiomas especificados, lo que refleja su carácter auxiliar y no un modelo de producción.
- Al depender de versiones concretas de `transformers` y `torch`, los valores pueden no coincidir exactamente con los de otras versiones si cambian detalles de implementación.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/building-an-inference-engine-from-scratch/llama32-1b-reference
- Modelo base: https://huggingface.co/meta-llama/Llama-3.2-1B-Instruct
- Libro: https://chosungmann.github.io/building-an-inference-engine-from-scratch/
- Código: https://github.com/chosungmann/building-an-inference-engine-from-scratch
