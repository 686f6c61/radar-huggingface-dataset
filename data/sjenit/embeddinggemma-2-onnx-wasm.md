# sjenit/embeddinggemma-2-ONNX-wasm

## Resumen

`embeddinggemma-2-ONNX-wasm` es una conversión comunitaria del modelo de embeddings `google/embeddinggemma-2` de Google DeepMind, empaquetada en formato ONNX y adaptada específicamente para ejecutarse en el backend WebAssembly de onnxruntime-web (a través de Transformers.js). El autor, `sjenit`, parte de la copia cuantizada `q4` publicada por `onnx-community` y sustituye los operadores problemáticos por equivalentes estándar para que la sesión de inferencia pueda crearse sin WebGPU.

El problema que resuelve es concreto: los grafos `q4` originales emplean el operador `com.microsoft.GatherBlockQuantized`, para el que la build WebAssembly de onnxruntime-web no incluye kernel, lo que provoca un fallo en la creación de la sesión (`Could not find an implementation for GatherBlockQuantized...`). Esta versión reescribe dichos nodos con operaciones ONNX estándar manteniendo los pesos byte a byte idénticos.

Es relevante para desarrolladores que quieran ejecutar un modelo de embeddings de calidad en el navegador sin depender de WebGPU, por ejemplo en aplicaciones web con búsqueda semántica o RAG totalmente en cliente. El repositorio ocupa 0,3 GB y la licencia es Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo de embeddings basado en transformer; detalles no publicados en la informacion disponible) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE segun la informacion disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | q4 (incluida en el repo); otras precisiones no incluidas |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | ONNX (`model_q4.onnx`, `model_q4.onnx_data`, `vision_encoder_q4.onnx`, `vision_encoder_q4.onnx_data`) |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna ni el proceso de entrenamiento del modelo original `google/embeddinggemma-2`. Lo que sí se documenta es el proceso de conversion: se parte de la copia `q4` de `onnx-community/embeddinggemma-2-ONNX` (commit `daa72c51243991dfcaf9f9137d2c573d8f7790c0`) y se reescriben los nodos `GatherBlockQuantized` (uno en el modelo de texto, dos en el codificador de visión) mediante operaciones estándar de ONNX: recolección de filas empaquetadas de 4 bits, escalas y puntos cero, desempaquetado de nibbles con `BitwiseAnd` y `BitShift`, y cálculo de `(q - zero_point) * scale`.

La fidelidad numérica de la conversión se verificó contra los grafos originales en onnxruntime CPU nativo: similitud coseno de 1.000000 en `sentence_embedding` (diferencia absoluta máxima ~1e-6) y en `image_features` (diferencia absoluta máxima ~3e-5). El script de reescritura (`rewrite.py`) está incluido en el repositorio. Los ficheros de configuración, tokenizador y procesador son copias sin modificar; el codificador de audio y otras precisiones no están incluidos.

## Capacidades

- Extracción de características y generación de embeddings de texto (pipeline `feature-extraction`).
- Codificador de visión incluido (`vision_encoder_q4.onnx`), lo que permite embeddings multimodales imagen-texto segun la estructura del repo.
- Ejecución en navegador mediante Transformers.js con `dtype: 'q4'` y `device: 'wasm'`.
- Compatibilidad con WebGPU únicamente a través del repositorio de origen (`onnx-community/embeddinggemma-2-ONNX`), no de esta copia.
- No se documentan en la informacion disponible capacidades de tool calling, agentes, razonamiento multi-paso ni modos de pensamiento.

## Casos de uso

- Búsqueda semántica en el navegador: el modelo puede generar embeddings de consultas y documentos directamente en cliente con Transformers.js sobre WASM, eliminando la necesidad de un backend de inferencia y reduciendo la latencia de red.
- RAG en aplicaciones web estáticas: al ejecutarse sin WebGPU, permite construir pipelines de recuperación aumentada en dispositivos o navegadores donde la aceleración GPU no está disponible.
- Clasificación y agrupamiento de texto en cliente: los embeddings generados pueden alimentar tareas de clustering o clasificación zero-shot sin enviar datos del usuario a un servidor.
- Procesamiento de privacidad estricta: al correr íntegramente en el navegador, los textos no salen del dispositivo, lo que encaja en escenarios con requisitos de confidencialidad.
- Búsqueda multimodal imagen-texto: el codificador de visión incluido permite indexar imágenes y recuperarlas mediante consultas textuales en aplicaciones web.
- Prototipado rápido de aplicaciones de embeddings: el tamaño de 0,3 GB y la licencia Apache 2.0 facilitan su integración en demos y entornos de desarrollo sin coste de licencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La única métrica documentada es la fidelidad de la conversión frente a los grafos originales (similitud coseno 1.000000 en `sentence_embedding` y `image_features` en onnxruntime CPU nativo).

## Requisitos de hardware

- Inferencia en CPU mediante WebAssembly: no requiere GPU; el modelo se ejecuta en el navegador con onnxruntime-web.
- VRAM estimada: no aplica en el backend WASM; en WebGPU (repo de origen) no se dispone de cifras en la informacion disponible.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no aplica para esta variante, diseñada para WASM sin WebGPU.
- Opciones de despliegue: Transformers.js con `dtype: 'q4'` y `device: 'wasm'`; para WebGPU debe usarse `onnx-community/embeddinggemma-2-ONNX`.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Formato | Backend | Licencia | Notas |
|---|---|---|---|---|
| `sjenit/embeddinggemma-2-ONNX-wasm` (este) | ONNX q4 modificado | WASM (onnxruntime-web) | Apache 2.0 | Sin dependencia de WebGPU; pesos identicos al origen |
| `onnx-community/embeddinggemma-2-ONNX` | ONNX q4 original | WebGPU / nativo | Apache 2.0 | Requiere WebGPU para la build WASM por `GatherBlockQuantized` |
| `google/embeddinggemma-2` | no disponible | no disponible | no disponible | Modelo base original de Google DeepMind |

No se dispone de datos de rendimiento comparativo entre estas variantes en la informacion proporcionada.

## Limitaciones y advertencias

- Solo se incluye la precisión `q4`; no hay otras cuantizaciones ni el codificador de audio en este repositorio.
- El backend WASM de onnxruntime-web no soporta `GatherBlockQuantized`, motivo de esta conversión; en WebGPU debe usarse el repositorio de origen.
- La fidelidad numérica se verificó en onnxruntime CPU nativo, no necesariamente en todos los entornos WASM de destino.
- No se documentan sesgos, riesgos de alucinación ni limitaciones idiomáticas del modelo base en la informacion disponible.
- Licencia Apache 2.0 permite uso comercial, pero se recomienda revisar los términos del modelo base `google/embeddinggemma-2`.
- Repositorio comunitario con 19 descargas y 0 likes en el momento de la consulta; no es una publicación oficial de Google ni de `onnx-community`.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/sjenit/embeddinggemma-2-ONNX-wasm
- Modelo base ONNX: https://huggingface.co/onnx-community/embeddinggemma-2-ONNX
- Modelo original: https://huggingface.co/google/embeddinggemma-2
