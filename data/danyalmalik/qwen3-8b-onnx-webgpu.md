# danyalmalik/Qwen3-8B-ONNX-WebGPU

## Resumen

Qwen3-8B-ONNX-WebGPU es una conversión a ONNX del modelo Qwen/Qwen3-8B, publicada por el usuario danyalmalik, orientada a la ejecución de inferencia directamente en el navegador mediante el backend WebGPU de ONNX Runtime Web. El paquete incluye además un cabezal de borrador EAGLE-3 (AngelSlim/Qwen3-8B_eagle3) convertido también a ONNX, que habilita decodificación especulativa en el cliente. El objetivo es permitir que aplicaciones web ejecuten un modelo de 8.000 millones de parámetros de forma local, sin depender de servidores de inferencia.

La conversión mantiene el diseño del transformer original de Qwen3-8B, pero reorganiza el grafo para el formato de ONNX Runtime GenAI (`input_ids`, `attention_mask`, `past_key_values.*` → `logits`, `present.*`) y cuantiza las capas lineales a 4 bits con tamaño de bloque 32, dejando embeddings, activaciones y caché KV en float16. La rotary embedding y las normalizaciones RMS por cabeza de q/k se pliegan dentro del nodo `GroupQueryAttention`, lo que reduce el número de operadores y facilita el despliegue en el backend WebGPU.

La relevancia de esta ficha radica en que demuestra un patrón de despliegue poco habitual: un modelo de 8B con decodificación especulativa ejecutándose íntegramente en el navegador. El repositorio ocupa 6,1 GB y se distribuye bajo licencia Apache 2.0, la misma del modelo base. No se han publicado datos de contexto, idiomas ni benchmarks específicos de esta conversión en la información disponible.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen3), convertido a ONNX Runtime GenAI; decodificación especulativa con cabezal EAGLE-3 |
| Parametros totales | 8.000 millones (heredados de Qwen/Qwen3-8B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la información proporcionada |
| Tipos de cuantizacion | Capas lineales y capa de salida en 4 bits (round-to-nearest, block size 32); embeddings, activaciones y caché KV en float16 |
| Idiomas soportados | no disponible en la información proporcionada |
| Licencia | Apache 2.0 (modelo); el cabezal EAGLE-3 en `draft/` tiene licencia propia (`draft/License_AngelSlim_model_and_dataset.txt`) |
| Formato de pesos | ONNX (layout ONNX Runtime GenAI); cabezal de borrador en ONNX aparte |

## Arquitectura y entrenamiento

El modelo es una conversión, no un entrenamiento nuevo. La arquitectura subyacente es la de Qwen3-8B: un transformer decoder-only con atención de consultas agrupadas (GQA) y normalización RMS. La conversión, realizada con el exportador propio de Quick Inference, genera un decoder ONNX con las entradas y salidas estándar de ONNX Runtime GenAI. Las capas lineales se cuantizan a 4 bits con tamaño de bloque 32 y la capa de salida también a 4 bits; embeddings, activaciones y caché KV se mantienen en float16. La rotary embedding se aplica dentro del nodo `GroupQueryAttention`, y las normalizaciones RMS por cabeza de q/k se pliegan en el mismo nodo mediante `qk_norm_epsilon`, un patrón estándar en ONNX Runtime 1.30.

El paquete incorpora una salida adicional, `eagle_taps`, que expone el flujo residual a la entrada de tres capas (2, N/2 y N-3, concatenadas). El cabezal de borrador EAGLE-3, convertido desde AngelSlim/Qwen3-8B_eagle3, consume esos taps para predecir los siguientes tokens; el modelo principal verifica cada predicción, de modo que la salida final coincide exactamente con la del modelo. El cabezal tiene sus matrices cuantizadas a 4 bits, caché KV estática y devuelve el token predicho como id. No se dispone de información sobre el dataset de entrenamiento original de Qwen3-8B ni sobre procesos de RLHF/DPO en la documentación de esta conversión.

## Capacidades

- Generación de texto autoregresiva en el navegador mediante ONNX Runtime Web y WebGPU.
- Decodificación especulativa con cabezal EAGLE-3, que acelera la generación manteniendo la salida idéntica a la del modelo principal.
- Razonamiento y generación de código heredados de Qwen3-8B (no verificados en esta conversión).
- Soporte multilingüe heredado del modelo base (idiomas no especificados en la información disponible).
- Ejecución local sin servidor, con los pesos descargados al cliente.
- No se documenta soporte de tool calling, function calling, agentes ni visión en esta conversión.

## Casos de uso

- Asistentes de escritura en aplicaciones web: el modelo se ejecuta en el navegador del usuario, de modo que el texto no sale del dispositivo; adecuado para herramientas de edición o redacción con requisitos de privacidad.
- Demos interactivas de LLM sin backend: permite publicar una demo de un modelo de 8B en una página estática, eliminando el coste de servidores GPU y la latencia de red.
- Procesamiento de documentos confidenciales en el cliente: resúmenes o extracción de información sobre textos que el usuario no quiere enviar a un servicio externo, aprovechando la inferencia local.
- Educación y experimentación: sirve para estudiar decodificación especulativa y despliegue ONNX/WebGPU en un entorno reproducible y de código abierto.
- Prototipado de interfaces conversacionales: útil para validar UX de chat con un modelo real antes de invertir en infraestructura de servidor.
- Aplicaciones offline o de baja conectividad: una vez descargados los 6,1 GB del repositorio, el modelo puede ejecutarse sin conexión en navegadores compatibles con WebGPU.
- Evaluación de cuantización 4 bits en el cliente: permite medir la calidad y la velocidad de un modelo de 8B cuantizado en hardware de consumo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita; el repositorio ocupa 6,1 GB, y la cuantización 4 bits de las capas lineales con activaciones float16 sugiere un consumo de memoria en el rango de varios GB, dependiendo del navegador y del backend WebGPU.
- GPU recomendadas: no disponibles en la información proporcionada; se requiere un navegador con soporte de WebGPU (Chrome/Edge recientes) y una GPU compatible con dicho backend.
- Cabe en GPU de consumo: previsiblemente sí en GPUs con WebGPU y memoria suficiente, aunque no se especifican modelos concretos.
- Opciones de despliegue: ONNX Runtime Web con backend WebGPU; el paquete está pensado para Quick Inference. No se documenta soporte de vLLM, llama.cpp, Ollama o TGI para estos pesos ONNX.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Qwen3-8B-ONNX-WebGPU (este) | 8B | no disponible | ONNX (4 bits + fp16) | Apache 2.0 | Orientado a navegador con WebGPU y decodificación especulativa EAGLE-3 |
| Qwen/Qwen3-8B | 8B | no disponible | safetensors | Apache 2.0 | Modelo base original; requiere infraestructura de inferencia estándar |
| AngelSlim/Qwen3-8B_eagle3 | no disponible | no disponible | no disponible | licencia propia | Cabezal de borrador EAGLE-3 usado por esta conversión |

No se dispone de datos de rendimiento comparativo entre estas variantes en la información proporcionada.

## Limitaciones y advertencias

- Los archivos son modificados: las salidas son cercanas, pero no idénticas, a las del modelo original, según advierte el autor.
- La cuantización a 4 bits de capas lineales y capa de salida puede degradar la calidad respecto al modelo en precisión completa; no se han publicado evaluaciones al respecto.
- El cabezal EAGLE-3 tiene licencia propia distinta de Apache 2.0; es necesario revisar `draft/License_AngelSlim_model_and_dataset.txt` antes de su uso comercial.
- La ejecución en navegador depende de WebGPU, con soporte desigual entre navegadores y sistemas operativos; no funciona en entornos sin WebGPU.
- El tamaño del repositorio (6,1 GB) implica una descarga considerable para el usuario final.
- No se documentan sesgos, riesgo de alucinación ni limitaciones idiomáticas específicas de esta conversión; deben heredarse las del modelo base Qwen3-8B.
- No se documenta soporte de tool calling ni de agentes en esta conversión, por lo que no debe asumirse para producción.
- El número de descargas (19) y la ausencia de likes sugieren un uso muy limitado y poca validación comunitaria.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/danyalmalik/Qwen3-8B-ONNX-WebGPU
- Modelo base: https://huggingface.co/Qwen/Qwen3-8B
- Cabezal EAGLE-3: https://huggingface.co/AngelSlim/Qwen3-8B_eagle3
