# litert-community/GLiClass-Edge-v3.0-LiteRT

## Resumen

GLiClass-Edge v3.0 LiteRT es la conversión al formato LiteRT (`.tflite`) del clasificador de texto zero-shot `knowledgator/gliclass-edge-v3.0`, un modelo de 32,7 millones de parámetros construido sobre un encoder ModernBERT. El modelo original lo desarrolla Knowledgeator; esta conversión la mantiene la comunidad `litert-community` usando `litert-torch` 0.9.3. Su funcionamiento consiste en concatenar el texto de entrada con hasta 25 etiquetas candidatas en una única secuencia y puntuar todas las etiquetas en un solo forward pass, lo que evita ejecutar el modelo una vez por etiqueta.

La relevancia de esta versión radica en el despliegue en dispositivo (edge): los grafos `.tflite` permiten ejecutar la clasificación en CPU de escritorio, GPU Metal en macOS y GPU o CPU de un teléfono Android sin depender de PyTorch ni de la librería `gliclass`. El repositorio incluye un host en Python y un ejemplo Android en Kotlin que gestionan la tokenización, la búsqueda en la tabla de embeddings y las funciones de activación (softmax o sigmoide) fuera del grafo.

El modelo está pensado para tareas de enrutamiento y clasificación de texto con latencias de milisegundos: en la GPU de un Galaxy S26 la llamada al grafo tarda una mediana de 5,86 ms con 128 tokens y 8,23 ms con 256 tokens. La verificación reportada por el autor muestra coincidencia con la pipeline oficial `gliclass` 0.1.20 en las 552 peticiones de prueba, con una diferencia máxima de logit de 0,009.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Encoder ModernBERT (10 capas) con read-out en `[CLS]` y en cada token `<<LABEL>>`, dos proyectores y un scorer |
| Parámetros totales | 32,7 M (modelo base) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | Hasta 128 o 256 tokens según el grafo (etiquetas, prompt y texto combinados) |
| Tipos de cuantización | FP32 (grafos completos) y pesos FP16 con activaciones FP32 (`wfp16`); el modelo base dispone además de una exportación ONNX int8 en otro repositorio |
| Idiomas soportados | Inglés (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | `.tflite` (LiteRT), tabla de embeddings `float16` en binario, `tokenizer.json` |

## Arquitectura y entrenamiento

El modelo es un clasificador zero-shot basado en un encoder transformer ModernBERT de 10 capas y 384 dimensiones de representación, con 32,7 M de parámetros. La innovación principal de GLiClass es el enfoque de *label routing*: el texto y las etiquetas candidatas (hasta 25) se serializan en una sola secuencia, de modo que el encoder procesa todo conjuntamente y produce un logit por cada slot de etiqueta. El read-out se toma en el token `[CLS]` y en cada token `<<LABEL>>`, y dos proyectores más un scorer generan la puntuación final. El host aplica después softmax (modo single-label) o sigmoide (modo multi-label) sobre esos logits.

La conversión a LiteRT se realizó con `litert-torch` 0.9.3. Cada grafo `.tflite` contiene el encoder completo, el read-out, los proyectores y el scorer, y devuelve un logit por etiqueta; el resto del pipeline (construcción de la cadena de petición, tokenización, lookup de la tabla de embeddings y activaciones) se ejecuta en el host. En los grafos `wfp16`, las 78 capas `FULLY_CONNECTED` almacenan sus pesos en FP16 detrás de un operador `DEQUANTIZE`, mientras que las activaciones permanecen en FP32. No se dispone de información sobre el volumen de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO en la información proporcionada.

## Capacidades

- Clasificación de texto zero-shot: asigna un texto a una o varias etiquetas definidas en tiempo de inferencia, sin reentrenamiento.
- Modo single-label (softmax sobre las etiquetas) y modo multi-label (sigmoide con umbral, por ejemplo 0,5).
- Hasta 25 etiquetas candidatas por petición, puntuadas en un único forward pass.
- Inferencia en dispositivo: CPU de escritorio, GPU Metal en macOS (con cómputo FP32 explícito) y GPU o CPU de Android mediante la API Kotlin `CompiledModel`.
- Ejecución sin dependencias de PyTorch, transformers ni el paquete `gliclass`; solo requiere `numpy`, `tokenizers`, `ai-edge-litert` y `ml_dtypes` en el host Python.
- Soporte multilingüe: no disponible (solo inglés).
- Tool calling, agentes, visión, audio o modo de razonamiento extendido: no disponibles; el modelo es exclusivamente un clasificador de texto.

## Casos de uso

- Enrutamiento de tickets de soporte: clasificar cada mensaje entrante en categorías como conectividad, defecto de hardware, facturación o petición de funcionalidad, con la ventaja de definir las etiquetas en tiempo de ejecución sin reentrenar el modelo. El ejemplo de la model card ilustra exactamente este escenario.
- Moderación de contenido en el dispositivo: etiquetar textos de usuario en una aplicación móvil antes de enviarlos al servidor, aprovechando la latencia de milisegundos en GPU Android y evitando enviar datos sensibles.
- Clasificación multi-etiqueta de documentos: un mismo texto puede recibir varias categorías simultáneas (por ejemplo, "problema de conectividad" y "defecto de hardware") gracias al modo sigmoide con umbral.
- Filtrado y triaje en pipelines de datos: preclasificar grandes volúmenes de texto en CPU de escritorio con el grafo de 128 tokens, reduciendo el coste frente a modelos generativos de mayor tamaño.
- Análisis de sentimiento o intención con etiquetas ad hoc: definir etiquetas como "queja", "elogio" o "consulta" por petición, útil en encuestas y formularios de feedback.
- Aplicaciones Android offline: el ejemplo en Compose y Kotlin puro permite integrar clasificación de texto sin conexión en apps móviles, con el modelo de 27 MB en FP16.
- Enrutamiento en asistentes conversacionales: decidir a qué skill o subagente derivar una consulta corta, con un coste de inferencia mínimo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible, ya que el modelo es un clasificador y no un modelo generativo. Los datos de validación reportados por el autor son los siguientes:

| Prueba | Resultado |
|---|---|
| Coincidencia con la pipeline oficial `gliclass` 0.1.20 (CPU FP32) | 552 de 552 peticiones, en single-label y multi-label |
| Diferencia máxima de logit frente a la pipeline oficial | 0,009 |
| Coincidencia en GPU del Galaxy S26 con FP32 explícito | 552 de 552 peticiones |
| Latencia mediana en GPU Galaxy S26, 128 tokens | 5,86 ms |
| Latencia mediana en GPU Galaxy S26, 256 tokens | 8,23 ms |
| Respuestas alteradas por los grafos `wfp16` frente a FP32 | 2 de 552, ambas en empates cercanos |

## Requisitos de hardware

- VRAM/RAM estimada: los grafos FP32 ocupan aproximadamente 53,7 MB (128 tokens) y 54,0 MB (256 tokens); los grafos `wfp16`, unos 27,0 MB y 27,3 MB respectivamente. La tabla de embeddings FP16 añade 38,7 MB. El conjunto de dos grafos FP32 más `host_assets/` suma 149,9 MB.
- GPU recomendadas: no se requieren GPU dedicadas; el modelo está diseñado para CPU y GPU integradas. Verificado en Apple M4 Max (Metal, FP32 explícito) y en GPU de Galaxy S26.
- Cabe en cualquier GPU de consumo e incluso en teléfonos móviles; no necesita A100, H100 ni RTX 4090.
- Opciones de despliegue: LiteRT `CompiledModel` en Python (CPU de escritorio y Metal) y en Kotlin (Android); el repositorio incluye hosts de referencia y un ejemplo Android en Compose.
- Latencia y throughput: mediana de 5,86 ms a 128 tokens y 8,23 ms a 256 tokens en GPU de Galaxy S26; no se dispone de cifras de throughput para CPU de escritorio.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| GLiClass-Edge v3.0 LiteRT (este) | 32,7 M | 128/256 tokens | `.tflite` | Apache 2.0 | Optimizado para edge, verificado en Android y macOS |
| knowledgator/gliclass-edge-v3.0 | 32,7 M | no disponible | safetensors (PyTorch) | Apache 2.0 | Modelo base original; requiere PyTorch y `gliclass` |
| cnmoro/gliclass-edge-v3.0-onnx | 32,7 M | no disponible | ONNX e int8 | Apache 2.0 | Exportación ONNX del mismo checkpoint |
| FluidInference/gliclass-edge-apps-coreml | 32,7 M (fine-tune) | no disponible | Core ML | no disponible | Pesos ajustados adicionalmente; no son los mismos pesos |

## Limitaciones y advertencias

- Solo soporta inglés; el rendimiento en otros idiomas no está validado.
- La ventana de contexto está limitada a 128 o 256 tokens contando etiquetas, prompt y texto, lo que restringe la clasificación de documentos largos.
- Máximo de 25 etiquetas candidatas por petición.
- Los grafos `wfp16` pueden alterar respuestas en empates cercanos (2 de 552 peticiones en las pruebas del autor); para máxima fidelidad deben usarse los grafos FP32.
- La verificación se realizó el 2026-10-02 con versiones concretas de las librerías (`ai-edge-litert` 2.1.6, LiteRT 2.2.0); cambios de versión pueden alterar los resultados.
- Riesgo de alucinación no aplica en el sentido generativo, pero sí existe riesgo de clasificaciones erróneas en textos ambiguos o fuera de distribución.
- No se dispone de información sobre sesgos del modelo base en la documentación proporcionada.
- La licencia Apache 2.0 permite uso comercial, pero deben conservarse los avisos de atribución y las licencias upstream incluidas en `LICENSE`, `NOTICE` y `licenses/`.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/litert-community/GLiClass-Edge-v3.0-LiteRT
- Modelo base: https://huggingface.co/knowledgator/gliclass-edge-v3.0
- Exportación ONNX: https://huggingface.co/cnmoro/gliclass-edge-v3.0-onnx
- Paquetes Core ML (fine-tune): https://huggingface.co/FluidInference/gliclass-edge-apps-coreml
- Repositorio LiteRT: https://github.com/google-ai-edge/litert
