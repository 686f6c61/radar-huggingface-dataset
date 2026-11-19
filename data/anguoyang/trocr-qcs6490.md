# anguoyang/trocr-qcs6490

## Resumen

TrOCR es un modelo de reconocimiento óptico de caracteres (OCR) especializado en texto manuscrito, con arquitectura encoder-decoder basada en transformers. El repositorio `anguoyang/trocr-qcs6490` no contiene pesos ni artefactos compilados, sino la primera medición pública del modelo TrOCR ejecutado sobre el SoC Qualcomm QCS6490 en el kit Dragonwing RB3 Gen 2 Vision Kit. El autor documenta un tiempo de inferencia estimado de 476,1 ms usando el runtime QNN de Qualcomm AI Hub.

La relevancia de esta ficha es acotada: no se trata de un modelo nuevo ni de una versión ajustada, sino de un registro de rendimiento en hardware de borde (edge). El interés práctico reside en que la versión 0.66.0 de `qai-hub-models` no incluía ninguna entrada para este modelo en RB3, de modo que esta medición cubre un hueco en la documentación oficial de Qualcomm AI Hub.

El modelo subyacente TrOCR (desarrollado originalmente por Microsoft) resuelve la transcripción de texto manuscrito mediante un encoder de visión y un decoder de lenguaje. Este repositorio concreto solo aporta el dato de latencia en el dispositivo y el método de perfilado, sin información sobre el entrenamiento ni sobre el rendimiento en tareas de OCR más allá de la inferencia medida.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder-decoder transformer (visión + lenguaje) para OCR de texto manuscrito |
| Parametros totales | no disponible (el ONNX exportado pesa 92.123.987 bytes) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | fp32 (ONNX); sin cuantización explícita en la compilación por defecto de AI Hub |
| Idiomas soportados | no disponible |
| Licencia | MIT (modelo original); la ficha del repositorio no especifica licencia propia |
| Formato de pesos | ONNX exportado desde `qai-hub-models` 0.66.0; no se publican pesos en el repo |

## Arquitectura y entrenamiento

TrOCR emplea una arquitectura encoder-decoder: un encoder de visión procesa la imagen de entrada (1 × 3 × 384 × 384 píxeles en `pixel_values`) y un decoder autorregresivo genera la secuencia de texto, con salidas de KV-cache para acelerar la decodificación. El grafo exportado incluye esas salidas de KV-cache, lo que permite decodificación incremental token a token.

No se dispone de información sobre los datos de entrenamiento, el número de tokens, la composición del dataset ni si hubo ajuste por RLHF o DPO, ya que la model card solo documenta la medición de inferencia. Tampoco se detalla ninguna innovación técnica adicional más allá de la propia arquitectura encoder-decoder con KV-cache. El método de perfilado consistió en un `submit_inference_job(..., profile=True)` de la API de Qualcomm AI Hub, tomando el valor `execution_summary.estimated_inference_time` como estimación por grafo, no como latencia extremo a extremo de una aplicación.

## Capacidades

- Reconocimiento de texto manuscrito a partir de imágenes: el modelo transcribe texto contenido en una imagen de entrada de 384 × 384 píxeles.
- Generación autorregresiva de secuencias de texto mediante decoder con KV-cache.
- Procesamiento de imágenes en formato channel-first (NCHW); el intento inicial con formato channel-last (NHWC) falló en la exportación.
- Ejecución en hardware de borde Qualcomm mediante runtime QNN.
- No se documentan capacidades de tool calling, function calling, agentes, razonamiento multi-paso ni multilingüismo en la información disponible.

## Casos de uso

- Digitalización de formularios manuscritos en dispositivos de borde: el modelo puede transcribir campos rellenados a mano directamente en el QCS6490 sin enviar imágenes a la nube, con un coste de inferencia medido de 476,1 ms por imagen.
- Reconocimiento de notas y apuntes en entornos sin conectividad: al ejecutarse con QNN en el RB3 Gen 2, es apto para escenarios de campo donde no hay acceso a red.
- Procesamiento por lotes de documentos escaneados en hardware embebido: la ventana de 384 × 384 y el grafo con KV-cache permiten integrar el modelo en pipelines de captura y transcripción sobre SoC de bajo consumo.
- Automatización de archivo documental en kioscos o terminales: la latencia sub-segundo por imagen facilita la transcripción interactiva de documentos presentados por el usuario.
- Extracción de texto de imágenes en sistemas de inspección o logística: útil para leer etiquetas o albaranes manuscritos en dispositivos con restricciones de consumo energético.
- Evaluación y selección de modelos para despliegue en Qualcomm AI Hub: el dato de 476,1 ms sirve como referencia para comparar TrOCR con otros modelos OCR en el mismo hardware dentro de un barrido de 28 modelos y 14 categorías.

## Benchmarks y rendimiento

| Metrica | Valor |
|---|---|
| Tiempo de inferencia estimado | 476,1 ms (476.150 µs) |
| Entrada | 1 × 3 × 384 × 384 (pixel_values) |
| Salida | grafo encoder-decoder con salidas KV-cache |
| Dispositivo | Dragonwing RB3 Gen 2 Vision Kit (QCS6490) |
| Runtime | QNN |
| Precisión | fp32 ONNX, opciones de compilación por defecto de AI Hub |
| Fecha de medición | 2026-11-19 |
| IDs de job | compilación `jgkk1kqvg`, perfilado `j5qdndreg` |

No se han publicado resultados de benchmarks de calidad (precisión, CER, WER, MMLU, etc.) en la información disponible. El único dato numérico es la latencia de inferencia por grafo.

## Requisitos de hardware

- Dispositivo de referencia medido: Dragonwing RB3 Gen 2 Vision Kit con SoC Qualcomm QCS6490.
- Runtime: QNN (Qualcomm Neural Network), a través de Qualcomm AI Hub.
- VRAM estimada para inferencia: no disponible (el despliegue medido es en hardware de borde, no en GPU).
- GPU recomendadas: no disponible para el despliegue medido; el modelo se ejecuta en el acelerador del QCS6490.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: Qualcomm AI Hub con runtime QNN; el ONNX exportado procede de `qai-hub-models` 0.66.0. No se documentan despliegues con vLLM, llama.cpp, Ollama ni TGI.
- Latencia: 476,1 ms por imagen de 384 × 384 en el QCS6490. Throughput no disponible.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye mediciones de otros modelos OCR en el mismo hardware ni datos de calidad que permitan una comparación rigurosa. El barrido del autor cubre 28 modelos en 14 categorías, pero no se aportan los resultados de los demás en esta ficha.

## Limitaciones y advertencias

- El repositorio no publica pesos ni artefactos compilados; solo contiene números medidos y el método. No es directamente reutilizable como modelo.
- La métrica de 476,1 ms es una estimación por grafo (`estimated_inference_time`), no una latencia extremo a extremo de una aplicación real.
- La medición se realizó en fp32 sin cuantización explícita; el rendimiento con cuantización podría diferir y no se documenta.
- No hay datos sobre sesgos, tasa de alucinación ni precisión de transcripción (CER/WER) en la información disponible.
- No se especifican idiomas soportados ni limitaciones de contexto.
- La licencia del modelo original es MIT, pero la ficha del repositorio no declara licencia propia; conviene verificar antes de un uso comercial.
- La exportación es sensible al formato de entrada: con NHWC falló y fue necesario solicitar NCHW.
- El modelo está pensado para OCR de texto manuscrito; no se documentan otras capacidades.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/anguoyang/trocr-qcs6490
- Colección de modelos medidos: https://github.com/anguoyang/qcs-model-zoo
- Seguimiento del barrido completo: https://github.com/anguoyang/qcs-bench
