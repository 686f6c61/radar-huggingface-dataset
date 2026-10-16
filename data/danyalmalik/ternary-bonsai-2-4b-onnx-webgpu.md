# danyalmalik/Ternary-Bonsai-2-4B-ONNX-WebGPU

## Resumen

Ternary-Bonsai-2-4B-ONNX-WebGPU es una conversion a ONNX del modelo prism-ml/Ternary-Bonsai-2-4B-gguf, un Qwen3.5-4B cuantizado de forma ternaria por Prism ML y publicado por el usuario danyalmalik. El objetivo del artefacto es concreto: permitir la inferencia del modelo directamente en el navegador mediante el backend WebGPU de ONNX Runtime Web, tal y como lo consume Quick Inference, sin necesidad de servidor ni de GPU dedicada en el cliente.

La particularidad tecnica es que los pesos ternarios no se reconstruyen a partir de un GGUF en tiempo de ejecucion, sino que se han integrado en el propio grafo ONNX. Las matrices ternarias (valores -1, 0 o +1 multiplicados por una escala float16 por cada 128 pesos) se almacenan como MatMulNBits de 2 bits, y los embeddings de tokens como GatherBlockQuantized de 4 bits. El grafo reutiliza la topologia ONNX de onnx-community/Qwen3.5-4B-ONNX y sustituye cada peso por el correspondiente de Bonsai.

Es relevante ahora porque combina dos tendencias simultaneas: la cuantizacion extrema (ternaria, por debajo de 2 bits efectivos) y la ejecucion local en el navegador. El repositorio ocupa 1,5 GB y no incluye la torre de vision, por lo que es un modelo exclusivamente de texto. La verificacion de fidelidad declarada por el autor frente al runtime MLX de PrismML es una similitud coseno de 0,99999 en los logits de la ultima posicion de un prompt de prueba.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer derivado de Qwen3.5, con capas de atencion lineal (proyecciones alpha y beta) presentes en el grafo; detalles completos no disponibles |
| Parametros totales | aproximadamente 4.000 millones (segun la denominacion 4B del nombre del modelo; no confirmado de forma explicita en la model card) |
| Parametros activos | no disponible (no se indica que sea un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Ternaria (-1, 0, +1) con escala float16 cada 128 pesos, almacenada como MatMulNBits de 2 bits; embeddings en 4 bits con GatherBlockQuantized; el modelo base usa GGUF PQ2_0 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (decoder_model_merged_q2f16.onnx + .onnx_data, embed_tokens_q2f16.onnx + .onnx_data), tokenizer.json |

## Arquitectura y entrenamiento

El modelo no se ha entrenado: es una conversion de pesos. La topologia del grafo corresponde al grafo ONNX de Qwen3.5 de onnx-community/Qwen3.5-4B-ONNX, sobre el que se ha reemplazado cada peso por el de Ternary-Bonsai-2-4B (fichero `Ternary-Bonsai-2-4B-PQ2_0.gguf`). La presencia de proyecciones alpha y beta de atencion lineal confirma que el grafo incluye ese tipo de capas, caracteristicas de las arquitecturas hibridas recientes, aunque la model card no detalla la proporcion de capas de atencion lineal frente a atencion completa.

La innovacion principal esta en el tratamiento de la cuantizacion. Bonsai almacena sus matrices en una base rotada mediante una transformada de Walsh-Hadamard por bloques con vectores de signo; el grafo ONNX aplica la transformada correspondiente a la entrada de cada capa, replicando el comportamiento del runtime de PrismML en lugar de desrotar los pesos. Las matrices ternarias se guardan como `MatMulNBits` de 2 bits con los valores exactos, y los embeddings de tokens como `GatherBlockQuantized` de 4 bits de los mismos valores ternarios seguidos de la transformada inversa. Las proyecciones alpha y beta de la atencion lineal, que en el GGUF estan en float32, aqui son float16. El autor declara haber comprobado el resultado contra el runtime MLX de PrismML: en un prompt de prueba, los logits de la ultima posicion coinciden con una similitud coseno de 0,99999 y los mismos tokens en la parte alta del ranking. No se dispone de informacion sobre el dataset de entrenamiento del modelo original ni sobre fases de RLHF o DPO.

## Capacidades

- Generacion de texto en formato unicamente textual: la torre de vision no esta incluida en la conversion.
- Razonamiento y generacion de codigo heredados del modelo base Qwen3.5-4B, en la medida en que la cuantizacion ternaria los preserve; no hay evaluacion publicada que lo cuantifique.
- Inferencia en navegador mediante el backend WebGPU de ONNX Runtime Web, orientada al caso de uso de Quick Inference.
- Ejecucion local sin conexion en el cliente, ya que el grafo y los pesos se distribuyen como ficheros estaticos.
- Soporte de tool calling o function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible (la model card no enumera idiomas).
- Modo de razonamiento explicito (thinking mode): no disponible.
- Capacidades de audio: no disponibles (no se mencionan).

## Casos de uso

- Asistentes conversacionales que se ejecutan integramente en el navegador: al cargar el grafo ONNX con el backend WebGPU, el texto del usuario nunca sale del dispositivo, lo que resulta adecuado para aplicaciones con requisitos de privacidad estrictos o para entornos regulados donde no se permite enviar datos a un servidor.
- Demos interactivas y playgrounds en paginas web: un sitio estatico puede incluir el modelo como recurso y ofrecer generacion de texto sin backend ni coste de inferencia por peticion, algo viable porque el repositorio completo ocupa 1,5 GB y los pesos estan cuantizados a 2 bits por peso en las matrices ternarias.
- Extensiones de navegador para resumir, reescribir o clasificar el contenido de la pestana activa: el modelo puede procesar el texto extraido del DOM de forma local, evitando enviar paginas potencialmente sensibles a una API externa.
- Aplicaciones web progresivas (PWA) con funcionamiento offline: una vez almacenados en cache los ficheros ONNX, la funcionalidad de generacion de texto sigue disponible sin conectividad, util para herramientas de campo o entornos con red intermitente.
- Aplicaciones de escritorio construidas con Electron o Tauri que embeban un runtime ONNX: el mismo grafo puede reutilizarse fuera del navegador, aprovechando la GPU del equipo anfitrion a traves de WebGPU o de los execution providers nativos.
- Prototipado e investigacion sobre cuantizacion ternaria: el repositorio sirve como referencia reproducible de como integrar pesos ternarios en un grafo ONNX aplicando la transformada de Walsh-Hadamard en la entrada de cada capa, en lugar de desrotar los pesos.
- Filtrado y preprocesado de texto en el lado del cliente: clasificacion de mensajes, deteccion de spam o normalizacion de entradas antes de enviarlas a un modelo mayor alojado en servidor, reduciendo el volumen de datos transmitidos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El unico dato cuantitativo de calidad aportado por el autor es la comprobacion de fidelidad frente al runtime MLX de PrismML: similitud coseno de 0,99999 en los logits de la ultima posicion de un prompt de prueba, con coincidencia en los tokens mas probables.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; el repositorio completo ocupa 1,5 GB, por lo que cabe esperar un consumo del orden de 1,5 a 2 GB durante la carga del grafo y los pesos.
- GPU recomendadas: no disponibles. El caso de uso declarado es WebGPU, de modo que cualquier GPU integrada o dedicada con soporte WebGPU en el navegador es candidata.
- Compatibilidad con GPU de consumo: si, es el escenario previsto. La restriccion practica es que el navegador y la GPU soporten WebGPU (Chrome o Edge en versiones recientes, con soporte en Linux, Windows y macOS).
- Opciones de despliegue: ONNX Runtime Web con backend WebGPU (uso previsto), ONNX Runtime nativo con los execution providers disponibles (CUDA, DirectML, CoreML) y, para el modelo base, llama.cpp u Ollama a partir del GGUF original prism-ml/Ternary-Bonsai-2-4B-gguf. El autor cita tambien el runtime MLX de PrismML como referencia de validacion.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| danyalmalik/Ternary-Bonsai-2-4B-ONNX-WebGPU | aproximadamente 4B | no disponible | ONNX (q2f16) | ternaria 2 bits + embeddings 4 bits | Apache 2.0 | HuggingFace, 1,5 GB, 0 descargas |
| prism-ml/Ternary-Bonsai-2-4B-gguf | aproximadamente 4B | no disponible | GGUF (PQ2_0) | ternaria | Apache 2.0 | HuggingFace (modelo base del anterior) |
| onnx-community/Qwen3.5-4B-ONNX | aproximadamente 4B | no disponible | ONNX | sin cuantizar (precision original) | Apache 2.0 | HuggingFace (grafo de referencia reutilizado) |
| Qwen/Qwen3.5-4B | aproximadamente 4B | no disponible | safetensors (formato original) | ninguna | Apache 2.0 | HuggingFace (modelo original) |

No se dispone de datos de rendimiento comparado (MMLU, HumanEval, GSM8K u otros) para ninguno de estos artefactos en la informacion proporcionada.

## Limitaciones y advertencias

- No hay resultados de benchmarks publicados para esta conversion, por lo que la degradacion de calidad respecto al Qwen3.5-4B original no esta cuantificada.
- La verificacion de fidelidad del autor se limita a un prompt de prueba y a la similitud coseno de los logits de la ultima posicion; no constituye una evaluacion exhaustiva de la generacion completa.
- El modelo es solo de texto: la torre de vision del modelo original ha sido excluida, por lo que no admite entradas de imagen.
- El repositorio registra 0 descargas y 0 "likes" en el momento de la consulta, de modo que la validacion por parte de la comunidad es practicamente inexistente.
- Se trata de una conversion de terceros, no oficial, realizada por un usuario individual; no hay garantia de mantenimiento ni de soporte.
- El autor advierte explicitamente de que los ficheros estan modificados respecto al original; cualquier discrepancia de comportamiento debe atribuirse a la conversion.
- La licencia Apache 2.0 permite uso comercial, pero obliga a conservar los ficheros LICENSE y NOTICE.txt y a mantener los avisos de atribucion correspondientes.
- Los pesos ternarios implican una perdida de precision inherente; se recomienda validar el comportamiento en la tarea concreta antes de llevarlo a produccion.
- La longitud de contexto soportada no se especifica, lo que impide planificar casos de uso con entradas largas.
- No se documentan sesgos conocidos ni el reparto de idiomas; el comportamiento multilingue no esta confirmado.
- El despliegue depende de la disponibilidad de WebGPU en el navegador del usuario, lo que excluye navegadores o versiones sin soporte.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/danyalmalik/Ternary-Bonsai-2-4B-ONNX-WebGPU
- Modelo base (GGUF): https://huggingface.co/prism-ml/Ternary-Bonsai-2-4B-gguf
- Modelo original Qwen3.5-4B: https://huggingface.co/Qwen/Qwen3.5-4B
- Grafo ONNX de referencia: https://huggingface.co/onnx-community/Qwen3.5-4B-ONNX

Nota: la busqueda web asociada a esta consulta no devolvio resultados relevantes para el modelo (unicamente paginas sin relacion con el contenido tecnico), por lo que no se incluyen enlaces adicionales de papers, blogs o demos.
