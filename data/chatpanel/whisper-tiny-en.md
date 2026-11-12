# ChatPanel/whisper-tiny.en

## Resumen

`ChatPanel/whisper-tiny.en` es una réplica sin modificaciones del modelo de reconocimiento automático de voz (ASR) `onnx-community/whisper-tiny.en`, publicado por el usuario ChatPanel con el único propósito de servir como origen de descarga para su pasarela (gateway). No se ha reentrenado, convertido ni editado ningún fichero: los pesos son idénticos byte a byte a los del repositorio upstream, en el commit `794207fec2761281fe63a23a94b7e9f53a4efbc1`, y los hashes SHA-256 de cada fichero están documentados en la model card.

El modelo subyacente es Whisper tiny.en de OpenAI, la variante más pequeña de la familia Whisper, especializada en transcripción de inglés. Se distribuye en formato ONNX cuantizado (encoder y decoder en ficheros `.onnx` separados), lo que permite ejecución en CPU y en entornos con recursos muy limitados mediante ONNX Runtime. Su relevancia es práctica: es un componente ligero y desplegable en local para transcripción de audio en inglés dentro de pipelines de aplicaciones.

La licencia es Apache 2.0, heredada sin cambios del upstream, y el repositorio tiene un tamaño de 0.0 GB según los metadatos de Hugging Face. No hay pipeline declarado ni idiomas listados en los metadatos del repo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper), exportado a ONNX |
| Parametros totales | no disponible (variante "tiny" de Whisper; el dato exacto no consta en la informacion proporcionada) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (ventana de audio de 30 s por defecto en Whisper; no confirmado en la informacion) |
| Tipos de cuantizacion | cuantizacion ONNX (ficheros `*_quantized.onnx` y `quantize_config.json`); nivel exacto no disponible |
| Idiomas soportados | ingles (sufijo `.en`); resto no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX cuantizado (`encoder_model_quantized.onnx`, `decoder_model_merged_quantized.onnx`), mas tokenizer y configuracion JSON |

## Arquitectura y entrenamiento

La arquitectura corresponde a Whisper de OpenAI: un transformer encoder-decoder entrenado para ASR sobre audio representado como espectrograma mel. La variante `tiny.en` es la de menor tamaño de la familia y está especializada en inglés (el sufijo `.en` indica entrenamiento solo en ese idioma). El repositorio de ChatPanel no aporta detalles adicionales sobre número de tokens de entrenamiento, composición del dataset ni si hubo etapas de ajuste fino con RLHF o DPO; esa información pertenece a la model card original de OpenAI, que no se incluye en la información proporcionada.

La innovación relevante en este repositorio no es arquitectónica sino de empaquetado: la exportación a ONNX con cuantización permite inferencia sin GPU y con dependencias mínimas (ONNX Runtime). El decoder se sirve como `decoder_model_merged_quantized.onnx`, un grafo fusionado que combina las fases de prefill y decodificación. No se ha aplicado ninguna modificación propia por parte de ChatPanel.

## Capacidades

- Reconocimiento automático de voz (ASR) en inglés: transcripción de audio a texto.
- Ejecución en CPU mediante ONNX Runtime, sin necesidad de GPU.
- Modelo ligero orientado a latencia baja y huella de memoria reducida.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no aplica (modelo ASR).
- Capacidades multilingües: limitadas al inglés por el sufijo `.en`.
- Capacidades especiales (thinking mode, visión, audio de entrada adicional): no disponibles.

## Casos de uso

- Transcripción de notas de voz en aplicaciones móviles o de escritorio: el modelo puede convertir audio corto en inglés a texto ejecutándose en el propio dispositivo con ONNX Runtime, sin enviar datos a un servicio externo.
- Subtitulado automático de vídeos en inglés: adecuado para generar pistas de subtítulos en pipelines de postproducción donde el coste por minuto de GPU es un factor limitante.
- Indexación y búsqueda de contenido en archivos de audio: transcripción previa de reuniones o pódcast en inglés para alimentar un motor de búsqueda textual.
- Asistentes de voz embebidos: integración en dispositivos con recursos limitados (Raspberry Pi, mini-PC) gracias a la cuantización ONNX y a la ausencia de dependencia de CUDA.
- Prototipado rápido de pipelines ASR: servir como baseline ligero antes de escalar a variantes mayores de Whisper, con la ventaja de que los ficheros son idénticos a los del upstream `onnx-community`.
- Verificación de integridad en despliegues: los hashes SHA-256 publicados permiten validar que los artefactos descargados por la pasarela ChatPanel coinciden exactamente con los del repositorio original.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible con precisión; al ser un modelo "tiny" cuantizado en ONNX, está diseñado para ejecutarse en CPU y en entornos de memoria muy reducida.
- GPU recomendadas: no disponibles; el formato ONNX cuantizado está orientado a CPU. Cualquier GPU compatible con ONNX Runtime (CUDA o DirectML) podría ejecutarlo, pero no se documentan requisitos.
- Compatibilidad con GPU de consumo: previsiblemente sí por el tamaño de la variante "tiny", aunque no se confirma en la información proporcionada.
- Opciones de despliegue: ONNX Runtime (principal), potencialmente a través de la pasarela ChatPanel; no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI (herramientas orientadas a LLM, no a ASR).
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / audio | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| ChatPanel/whisper-tiny.en (este) | variante tiny de Whisper | ventana de 30 s (no confirmado) | inglés | Apache 2.0 | ONNX cuantizado |
| openai/whisper-tiny.en | variante tiny de Whisper | ventana de 30 s (no confirmado) | inglés | Apache 2.0 | PyTorch (safetensors/bin) |
| onnx-community/whisper-tiny.en | variante tiny de Whisper | ventana de 30 s (no confirmado) | inglés | Apache 2.0 | ONNX cuantizado |
| openai/whisper-base.en | variante base de Whisper | ventana de 30 s (no confirmado) | inglés | Apache 2.0 | PyTorch (safetensors/bin) |

Los datos de rendimiento comparativo (WER, latencia) no están disponibles en la información proporcionada. La diferencia entre este repositorio y `onnx-community/whisper-tiny.en` es únicamente de alojamiento: los ficheros son idénticos.

## Limitaciones y advertencias

- Solo inglés: el sufijo `.en` implica que no transcribe otros idiomas de forma fiable.
- Riesgo de alucinación: los modelos Whisper pueden generar texto plausible en segmentos de silencio o ruido; no se documenta mitigación específica en este repositorio.
- Sesgos: no documentados en la información proporcionada; heredados del entrenamiento original de OpenAI.
- Licencia Apache 2.0: permite uso comercial, pero se debe conservar el aviso de licencia y atribución correspondiente.
- Repositorio de terceros: no es el repositorio oficial de OpenAI ni de onnx-community; para producción conviene referenciar el upstream o verificar los hashes SHA-256 publicados.
- Sin mantenimiento declarado: el repositorio se creó y actualizó el mismo día (2026-11-12) y no se anuncia soporte ni actualizaciones.
- Sin pipeline declarado en Hugging Face: las integraciones automáticas de la plataforma (p. ej., `transformers` pipeline) pueden no detectar la tarea ASR sin configuración manual.
- Tamaño de repo reportado de 0.0 GB: conviene verificar la descarga real de los ficheros ONNX antes de desplegar.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/ChatPanel/whisper-tiny.en
- Upstream ONNX: https://huggingface.co/onnx-community/whisper-tiny.en
- Modelo base original: https://huggingface.co/openai/whisper-tiny.en
- Commit upstream referenciado: `794207fec2761281fe63a23a94b7e9f53a4efbc1` (en el repositorio de onnx-community)
- Paper de Whisper: no disponible en la información proporcionada
- Blog o demo: no disponible en la información proporcionada
