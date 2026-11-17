# qhddz/qwen3-vl-4b-rknn3-rk1828

## Resumen

Qwen3-VL-4B (RKNN3 / RK1828) es una conversión del modelo vision-language Qwen3-VL-4B de Alibaba Qwen a formato RKNN3, publicada por el usuario qhddz. El paquete contiene el encoder de visión en fp16 y el modelo de lenguaje cuantizado en GRQ W4A16, ambos compilados específicamente para la NPU Rockchip RK1828 y verificados sobre hardware real según el autor. El repositorio incluye además un tokenizador en formato GGUF, el fichero de embeddings y un demo precompilado para x86_64 que se comunica con la NPU a través de PCIe.

La relevancia de esta ficha es acotada: no se trata de un modelo nuevo ni de un fine-tuning, sino de un artefacto de despliegue para inferencia en el borde. Su interés práctico reside en que permite ejecutar un modelo VLM de 4.000 millones de parámetros sobre una NPU de bajo consumo sin necesidad de compilar ni convertir nada. El autor reporta 38,7 tokens/s de generación medidos en la RK1828.

La información disponible es escasa: no se publican parámetros exactos, longitud de contexto, idiomas soportados ni resultados de benchmarks. Los datos de arquitectura y entrenamiento que aparecen a continuación corresponden al modelo base Qwen3-VL-4B y deben tomarse como referencia, no como especificaciones verificadas de esta conversión concreta.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base Qwen3-VL-4B; conversión RKNN3 con encoder de visión fp16 y LLM GRQ W4A16) |
| Parámetros totales | no disponible (el nombre del modelo indica 4B) |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantización | LLM en GRQ W4A16; encoder de visión en fp16 |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | `.rknn` + `.weight` (RKNN3), tokenizador `.gguf`, embeddings `.bin` |

## Arquitectura y entrenamiento

El artefacto es una conversión del modelo Qwen3-VL-4B, un transformer vision-language de Alibaba Qwen, a los formatos propietarios de la NPU Rockchip RK1828 (RKNN3). La conversión se realizó con los pipelines oficiales del repositorio rknn3-model-zoo de airockchip y, según el autor, fue verificada en hardware RK1828 real. La partición es la habitual en despliegues VLM en el borde: el encoder visual se mantiene en fp16 y el modelo de lenguaje se cuantiza a W4A16 con el esquema GRQ, lo que reduce la huella de memoria a costa de una pérdida de precisión no cuantificada en la model card.

No se proporciona información sobre el entrenamiento del modelo base: ni número de tokens, ni composición del dataset, ni si hubo etapas de RLHF o DPO. Tampoco se detalla el proceso de calibración de la cuantización GRQ (dataset de calibración, número de muestras, métricas de degradación). El repositorio ocupa 3,5 GB e incluye el runtime y el demo C++ precompilado para el host x86_64, que se comunica con la NPU por PCIe.

## Capacidades

- Generación de texto y razonamiento multimodal sobre imágenes, según el modelo base Qwen3-VL-4B.
- Descripción de imágenes (image captioning) y respuesta a preguntas visuales (VQA): el demo incluido acepta una ruta de imagen y un prompt de texto.
- Procesamiento de imagen con resolución configurable en el demo (parámetros 384 384 en el ejemplo de la model card).
- Tool calling y function calling: no disponible en la información proporcionada para esta conversión.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible en la información proporcionada.
- Modo thinking, audio u otras capacidades especiales: no disponible en la información proporcionada.

## Casos de uso

- Inspección visual en dispositivos de borde: el paquete permite ejecutar un VLM de 4B sobre una NPU RK1828 con 38,7 tokens/s, adecuado para tareas de descripción de imágenes o VQA en equipos con restricciones térmicas y de consumo, sin GPU dedicada.
- Kioscos y terminales de atención automatizada: un VLM local permite responder preguntas sobre documentos, productos o pantallas sin enviar imágenes a la nube, lo que simplifica el cumplimiento de privacidad.
- Verificación de calidad en línea de producción: el demo acepta una imagen y un prompt arbitrario, de modo que puede adaptarse a la inspección de defectos visuales con preguntas en lenguaje natural, siempre que la latencia de 38,7 tokens/s sea suficiente para el ciclo de la línea.
- Prototipado rápido en x86_64: el tarball `demo_x86_64.tar.gz` incluye binario y librerías, lo que permite validar el pipeline completo (encoder, LLM, tokenizador) antes de integrarlo en un producto final.
- Asistentes de accesibilidad: descripción de escenas o lectura de documentos para usuarios con discapacidad visual, ejecutándose localmente en un host con NPU y sin conexión a internet.
- Evaluación de la plataforma RK1828: el repositorio sirve como referencia funcional para medir el rendimiento real de la NPU en cargas VLM y decidir si la plataforma encaja en un diseño de producto.

## Benchmarks y rendimiento

El único dato de rendimiento publicado por el autor es la velocidad de generación medida en hardware RK1828: 38,7 tokens/s. No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K, MMMU u otros) en la información disponible, ni métricas de degradación por la cuantización W4A16.

| Métrica | Valor | Plataforma |
|---|---|---|
| Velocidad de generación | 38,7 tokens/s | Rockchip RK1828 (medido por el autor) |
| Benchmarks de calidad | no disponible | — |

## Requisitos de hardware

- NPU objetivo: Rockchip RK1828 con soporte RKNN3, conectada a un host x86_64 por PCIe.
- Host: x86_64; el demo precompilado y las librerías de runtime se distribuyen en `demo_x86_64.tar.gz`.
- VRAM/RAM estimada: no disponible. El repositorio completo ocupa 3,5 GB, lo que da una cota superior del espacio de almacenamiento necesario para los pesos.
- GPU consumer: no aplica; los ficheros `.rknn` no se ejecutan en CUDA. Para usar el modelo base en GPU sería necesario recurrir a los pesos originales de Qwen3-VL-4B, no a esta conversión.
- Opciones de despliegue: únicamente el runtime RKNN3 incluido en el demo; no hay soporte documentado para vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: 38,7 tokens/s de generación en RK1828 según el autor; no se reporta latencia de prefill ni tiempo de codificación de imagen.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato / plataforma | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3-VL-4B (RKNN3 / RK1828) | no disponible (4B según el nombre) | no disponible | RKNN3 para NPU RK1828 | Apache-2.0 | Hugging Face (qhddz) |
| Qwen3-VL-4B original (Alibaba Qwen) | 4B (según denominación) | no disponible en esta ficha | safetensors, ecosistema transformers | Apache-2.0 | Hugging Face (Qwen) |
| Otros VLM de ~4B para el borde | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks que permitan comparar el rendimiento de esta conversión con alternativas de la misma categoría.

## Limitaciones y advertencias

- La cuantización W4A16 del LLM puede degradar la calidad de las respuestas respecto al modelo base; el autor no publica métricas de esa pérdida.
- El artefacto está atado a la NPU RK1828 y al runtime RKNN3; no es portable a GPU, CPU genérica ni a otras NPU sin reconversión.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y lo publica un usuario individual, no el equipo de Qwen; no hay validación independiente del rendimiento reportado.
- No se documentan sesgos, comportamiento multilingüe ni tasas de alucinación para esta conversión; deben evaluarse con el modelo base como referencia.
- La licencia Apache-2.0 permite uso comercial, pero conviene verificar las condiciones del modelo base Qwen3-VL-4B y de las herramientas de conversión de airockchip antes de un despliegue en producto.
- El demo se distribuye como tarball porque Hugging Face no permite ejecutables sin empaquetar; requiere extraerlo y configurar `LD_LIBRARY_PATH` antes de ejecutarlo.
- No se especifican requisitos de versión del runtime RKNN3, del firmware de la NPU ni del kernel del host, lo que puede complicar la reproducibilidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/qhddz/qwen3-vl-4b-rknn3-rk1828
- Repositorio de pipelines de conversión: https://github.com/airockchip/rknn3_model_zoo
- Modelo base Qwen3-VL-4B: no disponible en la información proporcionada (se referencia como "Alibaba Qwen" en la model card).
