# codebucketsolutions/perth-onnx

## Resumen

Perth ONNX es una exportación a formato ONNX del marcador de agua (watermarker) implícito Perth desarrollado por Resemble AI. No se trata de un modelo de lenguaje ni de un modelo generativo: es un par de grafos ONNX que permiten insertar una marca imperceptible en el espectro de magnitud de una señal de audio por debajo de 2 kHz y detectarla posteriormente a partir del clip completo. La exportación la mantiene el usuario `codebucketsolutions` y no es un lanzamiento oficial de Resemble AI.

El modelo base es `resemble-ai/Perth`, concretamente el checkpoint `perth_net_250000.pth.tar` distribuido en el paquete `resemble-perth` 1.0.1, con los pesos sin modificar. La relevancia de esta versión radica en que elimina la dependencia de PyTorch en producción: ambos grafos (embedder y detector) contienen el pipeline completo, incluyendo la STFT de 2048 puntos con hop 320 y ventana Hann, y en el caso del embedder también la STFT inversa, implementada con productos matriciales porque `torch.istft` no exporta a ONNX.

El repositorio ocupa 0,1 GB y está pensado para integrarse en pipelines de verificación de procedencia de audio con runtime ONNX. La licencia es MIT, heredada del paquete `resemble-perth` que contiene los pesos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red neuronal sobre espectro de magnitud (STFT 2048 puntos, hop 320, ventana Hann) exportada a ONNX; arquitectura interna de la red no detallada en la informacion disponible |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica; procesa clips de audio completos, salida truncada a multiplos de 320 muestras |
| Tipos de cuantizacion | no disponible (los grafos se distribuyen en float32) |
| Idiomas soportados | no aplica (procesamiento de audio, independiente del idioma) |
| Licencia | MIT (Copyright (c) 2025 Resemble AI) |
| Formato de pesos | ONNX (opset 18) |

Especificaciones adicionales relevantes:

| Parametro | Valor |
|---|---|
| Frecuencia de muestreo | 32 kHz mono (remuestrear otras tasas antes de la inferencia) |
| Entrada embedder | `audio`: float32 `[T]` |
| Salida embedder | `audio_marked`: float32 `[320 * (T // 320)]` |
| Entrada detector | `audio`: float32 `[T]` |
| Salida detector | `score`: float32 `[1]`, rango 0 a 1 (aproximadamente 1 cuando hay marca) |
| Checkpoint de origen | `perth_net_250000.pth.tar`, SHA-256 `a15bce457ebc53ce5e6c9c3f11df78cf7ee2bf9cdab0a798902135b4c4027670` |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna de la red neuronal de Perth, solo el pipeline que la rodea. Cada grafo ONNX encapsula el procesamiento completo: una STFT de 2048 puntos con hop de 320 y ventana Hann, la red propiamente dicha y, en el caso del embedder, la STFT inversa. Como `torch.istft` no es exportable a ONNX, el embedder utiliza una implementación equivalente construida con productos matriciales, reshapes y padding (clase `OnnxISTFT` en el script de exportación), con una desviación máxima de 1,5e-6 respecto a `torch.istft`.

No se dispone de informacion sobre el volumen de datos de entrenamiento, la composicion del dataset ni si se emplearon tecnicas de RLHF o DPO; estos datos corresponden al modelo original de Resemble AI y no se recogen en la model card de esta exportación. La innovacion tecnica destacable de esta versión es la fidelidad de la exportación: el script `export_watermarkers.py` verifica la paridad contra `perth.PerthImplicitWatermarker` (`apply_watermark`, `get_watermark(round=False)`) en torch 2.15 sobre CPU, con dos clips de voz de 11,8 s y 4,1 s remuestreados a 32 kHz. Las diferencias máximas absolutas en el audio embebido son de 5,4e-7 y 5,1e-7 respectivamente, y las puntuaciones del detector coinciden en la práctica (por ejemplo, 5,1e-5 en PyTorch frente a 5,3e-5 en ONNX para un clip sin marca, y 1,0 en ambos para clips marcados).

## Capacidades

- Inserción de marca de agua imperceptible en el espectro de magnitud por debajo de 2 kHz de una señal de audio mono a 32 kHz.
- Detección de la marca a partir del clip completo, devolviendo una puntuación continua entre 0 y 1.
- Pipeline autocontenido en cada grafo: no requiere preprocesar la STFT ni postprocesar la STFT inversa fuera del modelo.
- Ejecución sin PyTorch, únicamente con un runtime ONNX (opset 18).
- Salida del embedder truncada a múltiplos de 320 muestras para alinear con el hop de la STFT.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multilingües: no es un modelo de lenguaje.
- No dispone de modo thinking, visión ni audio generativo.

## Casos de uso

- Verificación de procedencia de audio sintético: integrar `perth_detect.onnx` en un servicio que reciba clips generados por TTS o modelos de voz y compruebe si llevan la marca de Perth, con la puntuación como señal de confianza.
- Marcado en pipelines de producción de TTS: aplicar `perth_embed.onnx` a la salida de un sistema de síntesis de voz antes de entregarla al usuario, sin necesidad de instalar PyTorch en el servidor de inferencia.
- Despliegue en entornos con runtime ONNX ya existente: reutilizar la infraestructura de ONNX Runtime (CPU o GPU) de la que ya dispone la organización para otros modelos, evitando añadir una dependencia pesada adicional.
- Moderación de contenido en plataformas de audio: ejecutar el detector sobre clips subidos por usuarios para identificar audio marcado y aplicar políticas de trazabilidad.
- Investigación en marcas de agua de audio: comparar el comportamiento del detector ONNX frente al original en PyTorch, usando los datos de paridad publicados como referencia para validar nuevas integraciones.
- Detección por lotes en procesos de auditoría: procesar archivos de audio completos en un job offline con ONNX Runtime, ya que el detector opera sobre el clip entero y no requiere streaming.
- Prototipado rápido en aplicaciones de escritorio o móviles: al no depender de PyTorch, el par de grafos se puede empaquetar en aplicaciones con runtimes ONNX ligeros.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card únicamente incluye datos de paridad entre la implementación PyTorch y la exportación ONNX:

| Metrica | Clip 11,8 s | Clip 4,1 s |
|---|---|---|
| Diferencia maxima absoluta en audio embebido (PyTorch vs ONNX) | 5,4e-7 | 5,1e-7 |
| Puntuacion detector, clip sin marca (PyTorch / ONNX) | 5,1e-5 / 5,3e-5 | 6,5e-5 / 6,4e-5 |
| Puntuacion detector, marcado por PyTorch (PyTorch / ONNX) | 1,0 / 1,0 | 1,0 / 1,0 |
| Puntuacion detector, marcado por ONNX (PyTorch / ONNX) | 1,0 / 1,0 | 1,0 / 1,0 |

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el repositorio ocupa 0,1 GB, por lo que el modelo es muy ligero y probablemente quepa en cualquier GPU consumer, aunque no se especifica el consumo exacto.
- GPU recomendadas: no disponibles; al ser una exportación ONNX, puede ejecutarse en CPU y en GPU compatibles con ONNX Runtime.
- Cabe en GPU consumer: previsiblemente sí, dado el tamano del repositorio, aunque no hay confirmación explícita en la informacion disponible.
- Opciones de despliegue: ONNX Runtime (CPU o GPU); no se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye comparaciones con otros marcadores de agua de audio (por ejemplo, AudioSeal u otros sistemas de watermarking), ni datos de rendimiento que permitan establecer una comparación cuantitativa.

## Limitaciones y advertencias

- No es un modelo oficial de Resemble AI: es una exportación mantenida por un tercero (`codebucketsolutions`), aunque los pesos son los originales sin modificar.
- Solo acepta audio mono a 32 kHz; es necesario remuestrear otras tasas antes de la inferencia.
- La salida del embedder se trunca a múltiplos de 320 muestras, por lo que se pierden las muestras finales que no completan el bloque.
- La marca se inserta por debajo de 2 kHz; no se documenta su robustez frente a compresión con pérdida, remuestreo, filtrado o recorte del clip.
- El detector devuelve una puntuación continua, no una decisión binaria; el umbral de corte debe fijarlo el integrador.
- No se dispone de informacion sobre sesgos, tasas de falsos positivos o falsos negativos en dominios distintos del habla.
- La licencia MIT permite uso comercial, pero se debe conservar la atribución a Resemble AI (Copyright (c) 2025) tal como figura en el fichero `LICENSE`.
- Al ser una exportación ONNX, cualquier cambio en el runtime (versión de opset, optimizaciones del grafo) puede alterar ligeramente los resultados; se recomienda validar la paridad en el entorno de destino.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/codebucketsolutions/perth-onnx
- Modelo base: https://huggingface.co/resemble-ai/Perth
- Repositorio GitHub de Perth: https://github.com/resemble-ai/Perth
