# litert-community/Open-Decision-DeBERTa-v3-Large-LiteRT

## Resumen

Open Decision DeBERTa-v3-Large para LiteRT es una conversión al formato LiteRT (`.tflite`) del modelo de decisión `com-kotobalabs/open-jev-deberta-v3-large`, construido sobre la arquitectura DeBERTa-v3-large. El modelo original resuelve un problema concreto: dada una descripción de estado (por ejemplo, el texto de un ticket de soporte) y un conjunto de preguntas tipadas (`choice`, `score`, `noul`), devuelve una distribución de probabilidad calibrada para cada pregunta en un único forward pass. Es, por tanto, un modelo de clasificación de texto orientado a la toma de decisiones estructurada, no un modelo generativo.

La relevancia de esta versión radica en el empaquetado para despliegue en dispositivos: los grafos `.tflite` permiten ejecutar el modelo en CPU de escritorio, GPU Metal de Apple y GPU/NPU de móviles Android. El autor documenta verificaciones de paridad frente a su implementación de referencia en FP32, con diferencias máximas de probabilidad del orden de 0,0016 en escritorio y 0,00083 en GPU móvil, lo que aporta garantías de fidelidad numérica poco habituales en conversiones de este tipo.

El repositorio ocupa 2,5 GB e incluye grafos para ventanas de 256 y 512 tokens, una tabla de embeddings de palabras en float16 para la búsqueda en host, el tokenizador y hosts de referencia en Python y Kotlin. La licencia es Apache 2.0 y el idioma declarado es inglés.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer DeBERTa-v3-large (encoder de 24 capas), con cabeza de scoring por span; empaquetado en LiteRT |
| Parametros totales | no disponible (el grafo S512 wfp16 ocupa 813.443.728 bytes con pesos float16) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 512 tokens (grafo S512) o 256 tokens (grafos S256 y S256 NPU) |
| Tipos de cuantizacion | Pesos float16 con activaciones float32 en los grafos `wfp16`; existen grafos FP32 de referencia fuera del repositorio; el port ONNX ofrece fp32, fp16, q4 y q4f16 |
| Idiomas soportados | Inglés (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | `.tflite` (LiteRT), más tabla de embeddings `word_embeddings_fp16.bin` en float16 little-endian y `tokenizer.json` |

## Arquitectura y entrenamiento

El modelo subyacente es un DeBERTa-v3-large, un transformer encoder de 24 capas que en esta variante se utiliza como modelo de decisión: recibe un estado y varias preguntas tipadas, y produce un logit por cada slot de opción. El grafo LiteRT contiene el encoder completo, las medias de span y la cabeza de scoring; el host se encarga de tokenizar, buscar la fila correspondiente de la tabla de embeddings, construir las dos entradas de enrutamiento, aplicar softmax a temperatura 1,05 y extraer las respuestas. En los grafos `wfp16` solo los pesos son float16: cada uno de los 146 pesos FULLY_CONNECTED alimenta un operador DEQUANTIZE y las activaciones permanecen en float32, al igual que las 48 constantes de posición relativa de las batch matmuls.

La información disponible no detalla el volumen de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO en el modelo base. La conversión se realizó con litert-torch 0.9.3 y se validó con ai-edge-litert 2.1.6 en CPU de escritorio y GPU Metal (Apple M4 Max), y con LiteRT 2.2.0 en GPU y NPU de un Galaxy S26. El autor reporta paridad de decisión con su implementación de referencia en CPU FP32 en las 4.327 preguntas de 1.809 peticiones, con una diferencia máxima de probabilidad de 0,0016. La variante NPU incluye 170 pesos FULLY_CONNECTED y 1.906 operadores, adaptada para hardware float16.

## Capacidades

- Clasificación de texto con salida calibrada: devuelve una distribución de probabilidad por pregunta, no texto libre.
- Preguntas tipadas: soporta los tipos `choice` (selección entre opciones), `score` (puntuación) y `noul` (según la model card).
- Evaluación de múltiples preguntas en un único forward pass sobre un mismo estado.
- Ejecución en dispositivo: CPU de escritorio, GPU Metal de Apple y GPU/NPU de Android mediante LiteRT.
- Host de referencia en Python (`decision_litert.py`) y host puro en Kotlin para Android con tokenizador, constructor de secuencias y búsqueda en tabla float16.
- No se documentan capacidades de generación de texto, código, matemáticas, visión, audio, tool calling ni razonamiento multi-paso.
- Capacidad multilingüe limitada al inglés según los metadatos del modelo.

## Casos de uso

- Enrutamiento de tickets de soporte: el modelo recibe el texto del ticket como estado y una pregunta `choice` con las opciones de equipo (facturación, soporte técnico, etc.), y devuelve la probabilidad de cada opción para asignar el caso. La ventana de 512 tokens cubre tickets de longitud media.
- Triaje en atención al cliente en móvil: con el grafo S256 y el host Kotlin, la clasificación se ejecuta en la GPU o NPU del teléfono con una mediana de 407,6 ms por petición, lo que permite preclasificar mensajes antes de enviarlos a un backend.
- Moderación o etiquetado de contenido: usando preguntas tipo `score` se puede obtener una puntuación calibrada por criterio (por ejemplo, urgencia o toxicidad) en una sola pasada.
- Extracción de decisiones en pipelines de datos: procesar lotes de registros de texto y obtener, por cada uno, la opción elegida y su probabilidad, con la garantía de paridad numérica frente a la implementación de referencia en FP32.
- Clasificación en el borde sin conectividad: el despliegue con LiteRT en CPU de escritorio o GPU móvil permite clasificar localmente sin enviar datos a un servidor, útil en entornos con requisitos de privacidad.
- Validación de sistemas de decisión: la tabla de embeddings y los grafos FP32 de referencia permiten comparar la salida del modelo desplegado con la del checkpoint original para auditar regresiones tras cambios de hardware o cuantización.
- Procesamiento de formularios o encuestas con preguntas cerradas: cada campo del formulario se modela como una pregunta tipada y el modelo devuelve la distribución sobre las opciones posibles.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible. La model card sí incluye mediciones de paridad y latencia:

| Escenario | Grafo | Peticiones / preguntas | Paridad de decisión | Diferencia máxima de probabilidad | Latencia |
|---|---|---|---|---|---|
| CPU escritorio vs. referencia FP32 | S512 wfp16 | 1.809 / 4.327 | 100 % | 0,0016 (temp. 1,05) | no disponible |
| GPU Metal (M4 Max, FP32 explícito) | S512 wfp16 | 100 | no disponible | no disponible | no disponible |
| GPU Galaxy S26 (FP32 explícito) | S512 wfp16 | 500 / 1.302 | 100 % | 0,00083 | mediana 697,5 ms |
| GPU Galaxy S26 (FP32 explícito) | S256 wfp16 | 419 / 1.074 | 100 % | no disponible | mediana 407,6 ms |
| NPU Galaxy S26 | S256 NPU wfp16 | 143 (prueba) | no disponible | no disponible | no disponible |
| Host Kotlin vs. Collator del autor | fixture S26 | 160 / 420 respuestas | ids y spans idénticos; 420 respuestas coincidentes | no disponible | no disponible |

## Requisitos de hardware

- VRAM/RAM estimada: el grafo S512 wfp16 ocupa 813 MB en disco y el S256 wfp16 713 MB; la tabla de embeddings float16 añade 262 MB. En ejecución hay que sumar las activaciones en float32, por lo que se recomienda al menos 2-3 GB de memoria disponible.
- GPU recomendadas: no se especifican GPU de escritorio concretas; se validó en Apple M4 Max (Metal) y en Galaxy S26 (GPU y NPU Qualcomm). Para servidores, cualquier GPU con soporte LiteRT puede servir, pero no hay datos publicados.
- GPU de consumo: cabe en equipos de consumo por tamaño de pesos, aunque no se documentan pruebas en RTX 4090 u otras tarjetas domésticas.
- Despliegue: LiteRT CompiledModel API en Python (CPU y Metal) y en Kotlin (Android, GPU y NPU). El port ONNX permite usar Transformers.js. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que están orientados a modelos generativos.
- Latencia: mediana de 697,5 ms por petición en GPU de Galaxy S26 con ventana de 512 tokens y 407,6 ms con ventana de 256 tokens. No hay cifras de throughput publicadas.

## Comparativa con modelos similares

| Modelo | Arquitectura | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| litert-community/Open-Decision-DeBERTa-v3-Large-LiteRT | DeBERTa-v3-large + cabeza de decisión | 256 / 512 tokens | LiteRT `.tflite` | Apache 2.0 | Conversión con paridad verificada en CPU, Metal y Android |
| com-kotobalabs/open-jev-deberta-v3-large | DeBERTa-v3-large + cabeza de decisión | no disponible | PyTorch (checkpoint original) | no disponible en la información | Modelo base; requiere el paquete `typed_decisions` |
| onnx-community/open-jev-deberta-v3-large-ONNX | DeBERTa-v3-large + cabeza de decisión | no disponible | ONNX (fp32, fp16, q4, q4f16) | no disponible en la información | Port para Transformers.js |
| DeBERTa-v3-large estándar (clasificación) | DeBERTa-v3-large | 512 tokens típicamente | safetensors, ONNX | MIT (modelo original de Microsoft) | Clasificador genérico; no soporta preguntas tipadas múltiples en una pasada |

## Limitaciones y advertencias

- Solo inglés: los metadatos declaran únicamente `en`, por lo que el rendimiento en castellano u otros idiomas no está garantizado.
- No es un modelo generativo: no produce texto libre ni código; su salida es una distribución de probabilidad sobre opciones predefinidas.
- Ventana limitada a 512 tokens como máximo; estados más largos deben truncarse o dividirse, con pérdida de contexto.
- Riesgo de calibración degradada fuera de la distribución de entrenamiento; la calibración reportada se verificó a temperatura 1,05 y con los fixtures del autor.
- La información disponible no detalla sesgos conocidos del modelo base ni la composición de sus datos de entrenamiento, lo que dificulta una auditoría de sesgo.
- La licencia Apache 2.0 permite uso comercial, pero el modelo base figura como `com-kotobalabs/open-jev-deberta-v3-large` y su licencia no se detalla en la información proporcionada; conviene verificarla antes de producción.
- Los grafos `wfp16` mantienen activaciones en float32, de modo que el ahorro de memoria es parcial; en dispositivos muy limitados puede no ser suficiente.
- La ruta NPU solo se validó en un Galaxy S26 con 143 peticiones de prueba; la cobertura de hardware es reducida.
- El repositorio incluye hosts de referencia, pero su integración en producción exige adaptar el tokenizador y la búsqueda de embeddings al entorno concreto.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/litert-community/Open-Decision-DeBERTa-v3-Large-LiteRT
- Modelo base: https://huggingface.co/com-kotobalabs/open-jev-deberta-v3-large
- Port ONNX: https://huggingface.co/onnx-community/open-jev-deberta-v3-large-ONNX
- LiteRT (Google AI Edge): https://github.com/google-ai-edge/litert
