# CardAnvilModels/grounding-dino-tiny-ONNX

## Resumen

Grounding DINO Tiny (ONNX, fp16) es una exportación a ONNX del modelo de detección de objetos open-vocabulary `IDEA-Research/grounding-dino-tiny`, publicada por CardAnvilModels para su uso con Transformers.js en el navegador. El modelo recibe una imagen y un prompt de texto con una o varias frases (`goat. city. sky.`) y devuelve cajas delimitadoras junto con la frase concreta con la que se ha emparejado cada caja._No requiere entrenamiento ni clases predefinidas: la taxonomía de objetos se define en tiempo de inferencia mediante lenguaje natural.

La aportación principal frente a la exportación de referencia (`onnx-community/grounding-dino-tiny-ONNX`) es la corrección del enmascarado de atención del texto. Aquella exportación solo puntuaba correctamente la primera frase del prompt; el resto caía a valores de 0,02-0,05 donde PyTorch daba 0,5-0,8, porque el trazado del grafo desenrollaba un bucle Python sobre los tokens especiales del prompt. Esta versión reconstruye esa función con comparaciones de tensores y operaciones min/max, de modo que el grafo admite cualquier número de frases hasta el límite de 256 tokens.

El resultado es un reemplazo directo (mismos nombres de fichero, mismas entradas y salidas) que pesa 364 MB en fp16, mantiene entradas y salidas en float32 y ejecuta los 48 nodos `GridSample` de la atención deformable en WebGPU. Es relevante para desarrolladores que necesitan detección open-vocabulary totalmente en cliente, sin backend, en aplicaciones web o de escritorio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Grounding DINO (detector open-vocabulary: codificador de imagen Swin, codificador de texto tipo BERT, fusión cross-modal y decodificador de consultas con atención deformable), exportado a grafo ONNX |
| Parametros totales | no disponible (el autor no publica el recuento; variante «tiny») |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | 256 tokens de texto como máximo; la secuencia `input_ids` admite n de 4 a 256 |
| Tipos de cuantizacion | fp16 (pesos del fichero publicado, `onnx/model_fp16.onnx`); el script de exportación genera además una versión fp32. Entradas y salidas se mantienen en float32 |
| Idiomas soportados | no disponible (los ejemplos y validaciones usan prompts en inglés; el codificador de texto es el del modelo original) |
| Licencia | apache-2.0 |
| Formato de pesos | ONNX (un único fichero `onnx/model_fp16.onnx`, 364 MB) + `config.json`, `preprocessor_config.json` y ficheros del tokenizador copiados sin cambios del repositorio `onnx-community` en el commit `ff690b0a` |

Detalles de E/S del grafo:

| Entrada | Forma |
|---|---|
| `pixel_values` | [1, 3, 800, 800] |
| `pixel_mask` | [1, 800, 800] |
| `input_ids`, `token_type_ids`, `attention_mask` | [1, n], n entre 4 y 256 |

| Salida | Forma |
|---|---|
| `logits` | [1, 900, 256]: puntuación de cada consulta para cada token |
| `pred_boxes` | [1, 900, 4]: centro x, centro y, ancho, alto, normalizados 0-1 |

## Arquitectura y entrenamiento

El modelo es una exportación, no un entrenamiento nuevo: los pesos proceden de `IDEA-Research/grounding-dino-tiny` en la revisión `a2bb814d`. Grounding DINO combina un codificador visual con un codificador de texto y una etapa de fusión cross-modal que alinea regiones de la imagen con los tokens del prompt; sobre esa representación, un decodificador de 900 consultas produce cajas y logits por token, de forma que cada caja queda asociada a la frase cuyos tokens puntúa alto. La atención deformable del decodificador se materializa en 48 nodos `GridSample`, todos ejecutables en WebGPU según el autor. No se detallan en la información disponible el número de tokens de entrenamiento, la composición del dataset ni si hubo etapas de RLHF o DPO.

La innovación técnica está en el proceso de exportación. Se generó un grafo fp32 con el exportador dynamo, opset 18 y longitud de secuencia dinámica, aplicando dos parches: (1) la función de máscara de atención del texto se reescribió con comparaciones de tensores y min/max, porque la implementación de Transformers usa `torch.isin`, que se exporta como `searchsorted` y ONNX no lo soporta; (2) se activó `TRANSFORMERS_DISABLE_TORCH_CHECK=1`, ya que las comprobaciones de formas se exportan como `_is_all_true`, tampoco disponible en ONNX. Después se convirtió a fp16 con `onnxconverter_common` manteniendo E/S en float32; el conversor deja 23 nodos `Cast` apuntando a float32. El grafo resultante se verifica contra Transformers en 140 prompts de 0 a 6 frases antes de cada exportación. Herramientas empleadas: torch 2.14.1, transformers 5.20.2, onnx 1.23.2, onnxscript 0.7.2 y onnxconverter-common 1.16.0.

## Capacidades

- Detección de objetos zero-shot guiada por texto: no hay clases fijas, la taxonomía se especifica en el prompt.
- Soporte de múltiples frases en un mismo prompt (`goat. city. sky.`), devolviendo para cada caja la frase con la que se ha emparejado.
- Detección open-vocabulary de vocabulario abierto, incluyendo conceptos compuestos descritos en lenguaje natural.
- Salida de cajas en píxeles tras el post-procesado (`post_process_grounded_object_detection`), con umbrales independientes de caja y de texto (`box_threshold`, `text_threshold`).
- Ejecución en navegador mediante Transformers.js sobre WebGPU o WebAssembly, sin backend ni servicio remoto.
- Compatibilidad drop-in con la interfaz de `onnx-community/grounding-dino-tiny-ONNX` (mismos inputs, outputs y nombre de fichero).
- No soporta tool calling, agentes, razonamiento multi-paso, generación de texto, código ni matemáticas: es exclusivamente un detector de objetos.

## Casos de uso

- **Selección de regiones en ilustraciones y arte de cartas**: es el uso real declarado por el autor; el comando Describe de Card Anvil lo ejecuta en el navegador para localizar qué elementos (personajes, edificios, cielo) seleccionar en una ilustración. Encaja porque acepta vocabulario abierto y devuelve la etiqueta junto a la caja.
- **Edición de imágenes en cliente**: integrar el modelo en un editor web para que el usuario escriba «perro. sombrero.» y obtenga máscaras o recortes iniciales, sin subir la imagen a un servidor, con 347 ms por pasada en una RTX 4070 Ti SUPER vía WebGPU.
- **Etiquetado asistido de datasets**: preanotar imágenes con un listado de conceptos para que un humano revise; el soporte multi-frase evita lanzar una inferencia por clase y reduce el coste de anotación.
- **Detección de productos en catálogos de comercio electrónico**: localizar artículos descritos por texto («zapatilla. caja. fondo blanco.») sobre fotos de catálogo, útil cuando la taxonomía cambia con frecuencia y no se quiere reentrenar.
- **Análisis de capturas de interfaz y automatización de pruebas**: localizar elementos visuales descritos en lenguaje natural («botón de login. campo de búsqueda.») en capturas de pantalla, con el modelo ejecutándose dentro del propio runner de tests.
- **Moderación y revisión de contenido a nivel de región**: proponer regiones candidatas a revisión a partir de descripciones textuales, dejando la decisión final a un sistema posterior; las cajas permiten recortar y enviar solo zonas relevantes.
- **Accesibilidad y descripción de imágenes**: generar propuestas de regiones de interés que alimenten un pipeline de descripción, ejecutándose en el dispositivo del usuario y sin coste de servidor.
- **Robótica y aplicaciones de borde sin conectividad**: al ser un ONNX de 364 MB, puede desplegarse con onnxruntime en CPU o GPU local para localización de objetos descritos verbalmente en entornos sin red.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (COCO mAP, LVIS, MMLU, HumanEval, GSM8K) en la información disponible. El autor sí publica una validación numérica frente a PyTorch y frente a la exportación de `onnx-community`:

| Medida | onnx-community | Esta exportación |
|---|---|---|
| Error máximo vs. PyTorch (fp32, 1-4 frases) | no disponible | dentro de 0,01 |
| Error máximo vs. PyTorch (fp16, frase única) | no disponible | dentro de 0,01 |
| Error máximo vs. PyTorch (fp16, prompts conjuntos) | no disponible | hasta ~0,1 en un prompt de tres frases |
| IoU mediana de cajas con frase única | no disponible | 0,995 (idénticas a la referencia) |
| Frases detectadas por separado que se pierden en una pasada conjunta | 45 de 68 | 14 de 66 (igual que PyTorch) |
| Latencia WebGPU (RTX 4070 Ti SUPER, 1 pasada) | 327 ms | 347 ms |
| Latencia WebAssembly (1 hilo, 1 pasada) | 13,4 s | 14,7 s |

La validación se hizo con onnxruntime 1.31 en CPU frente a PyTorch (transformers 5.20, fp32) y, en navegador, con ONNX Runtime Web 1.31 en Microsoft Edge sobre 24 imágenes y 98 prompts.

## Requisitos de hardware

- **VRAM estimada**: los pesos fp16 ocupan 364 MB; con activaciones para una entrada de 800×800 y 900 consultas, el consumo se mantiene por debajo de ~1 GB. El repositorio completo ocupa 0,4 GB.
- **GPU recomendadas**: cualquier GPU con soporte WebGPU para el modo navegador; el autor reporta 347 ms por pasada en una RTX 4070 Ti SUPER. En servidor no se han publicado cifras para A100, H100 o RTX 4090.
- **GPU consumer**: sí cabe en cualquier GPU consumer con al menos ~1 GB libre, e incluso en GPU integradas mediante WebGPU o WebAssembly (con latencias mucho mayores).
- **CPU**: viable; la verificación se ejecutó con onnxruntime 1.31 en CPU. En WebAssembly con un solo hilo la pasada ronda los 13-15 s, por lo que solo es aceptable en flujos asíncronos o por lotes.
- **Opciones de despliegue**: Transformers.js (`@huggingface/transformers`) con `device: "webgpu"` o `device: "wasm"`; onnxruntime (CPU/GPU) para escritorio o servidor. No aplica vLLM, TGI, llama.cpp ni Ollama: no es un modelo de lenguaje.
- **Latencia y throughput**: 347 ms por pasada en WebGPU (RTX 4070 Ti SUPER) y 14,7 s por pasada en WebAssembly monohilo; no se publica throughput para lotes.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto de texto | Multi-frase | Frases conjuntas | Licencia | Formato / disponibilidad |
|---|---|---|---|---|---|---|
| CardAnvilModels/grounding-dino-tiny-ONNX (esta ficha) | no disponible | 256 tokens | Sí (0-6 frases verificadas) | 14 de 66 frases perdidas, como PyTorch | apache-2.0 | ONNX fp16, Transformers.js (WebGPU/WASM) |
| onnx-community/grounding-dino-tiny-ONNX | no disponible | no disponible | Solo puntúa la primera frase (0,02-0,05 en el resto) | 45 de 68 frases perdidas | apache-2.0 (según repositorio de origen) | ONNX, Transformers.js |
| IDEA-Research/grounding-dino-tiny (original) | no disponible | 256 tokens | Sí | Comportamiento de referencia | apache-2.0 | PyTorch (transformers); fp32 |
| IDEA-Research/grounding-dino-base | no disponible | no disponible | no disponible | no disponible | apache-2.0 | PyTorch; variante de mayor tamaño de la misma familia, sin datos comparativos en la información disponible |

## Limitaciones y advertencias

- **Sesgos**: no se documenta ninguna evaluación de sesgos; al ser un detector open-vocabulary, hereda los sesgos de los datos de entrenamiento del modelo original (fotografías y anotaciones mayoritariamente en inglés).
- **Alucinación / falsos positivos**: el modelo siempre devuelve 900 consultas con puntuaciones; es imprescindible aplicar umbrales (`box_threshold` 0,35 y `text_threshold` 0,25 en el ejemplo) y validar la salida antes de usarla en producción.
- **Competición entre frases**: en una sola pasada las frases compiten por las mismas cajas, de modo que un objeto que se detectaría solo puede perderse si otra frase reclama la misma región. El autor midió 14 de 66 casos en esta situación; si se necesita máxima exhaustividad, hay que hacer pasadas separadas por frase.
- **Precisión fp16**: el error frente a PyTorch llega a ~0,1 en un prompt de tres frases, frente a 0,01 del grafo fp32. Para usos sensibles a la calibración de scores conviene exportar o usar la versión fp32.
- **Preprocesado rígido**: la imagen se estira a 800×800 sin padding, lo que deforma la relación de aspecto; imágenes muy alargadas pueden degradar la detección.
- **Formato del prompt**: el autor indica frases en minúscula y terminadas en punto; no hay información sobre el comportamiento con otros idiomas ni con prompts largos o sin puntuación.
- **Cobertura**: el grafo está verificado hasta 6 frases y 256 tokens; quedan 900 consultas por imagen, lo que limita el número de objetos recuperables en escenas muy densas.
- **Licencia**: apache-2.0 permite uso comercial, pero conviene conservar los avisos de atribución del modelo base `IDEA-Research/grounding-dino-tiny`.
- **Madurez**: el repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y no se han publicado benchmarks estándar ni evaluación independiente; trátese como exportación reciente.
- **No es un LLM**: no genera texto, no admite tool calling ni razonamiento multi-paso; no debe evaluarse con métricas de lenguaje.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/CardAnvilModels/grounding-dino-tiny-ONNX
- Modelo base (PyTorch): https://huggingface.co/IDEA-Research/grounding-dino-tiny
- Exportación de referencia: https://huggingface.co/onnx-community/grounding-dino-tiny-ONNX (commit `ff690b0a8050566c290287545bd059350f3e9096`)
- Transformers.js: https://github.com/huggingface/transformers.js
- Proyecto Card Anvil: https://github.com/Card-Anvil
- Paper, blog o demo adicionales: no disponibles en la información proporcionada
