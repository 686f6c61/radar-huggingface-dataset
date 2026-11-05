# pdnhan/whisper-medium-mobile

## Resumen

Whisper medium mobile es una conversión a ONNX con cuantización int8 del modelo Whisper medium de OpenAI, orientada a reconocimiento automático del habla en dispositivos Android mediante ONNX Runtime. Lo publica el usuario pdnhan como artefacto derivado de la exportación previa de Xenova (transformers.js) y está pensado para ejecutarse localmente en el móvil, sin depender de servicios en la nube. Su uso declarado es la app Thì Thầm, que lo emplea para transcribir alemán forzando el token de idioma `<|de|>` en el decodificador.

El cambio técnico respecto al original de Xenova es mínimo pero relevante: los mapas de atención dejan de exponerse como salidas del grafo ONNX. Dado que ONNX Runtime mantiene en memoria todas las salidas declaradas del grafo, la versión de Xenova consumía mucha más memoria de la necesaria por transcripción. Con este ajuste, el pico neto de memoria de una transcripción pasa de 5531 MB a 2254 MB, manteniendo pesos, nodos y resultados idénticos.

El modelo conserva la arquitectura y los pesos de Whisper medium (transformer encoder-decoder, multilingüe), pero empaquetado en dos grafos ONNX cuantizados: encoder y decoder merged con caché KV. El repositorio ocupa 0,8 GB y se distribuye bajo licencia Apache 2.0. No hay métricas de precisión publicadas más allá de la verificación de equivalencia con el original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper), exportado a ONNX con cuantización int8 |
| Parametros totales | no disponible (heredados de openai/whisper-medium; el autor no indica cifra) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 30 s de audio por ventana (entrada log-mel de 80 x 3000); contexto de texto del decodificador no especificado |
| Tipos de cuantizacion | int8 (archivos `*_quantized.onnx`) |
| Idiomas soportados | multilingüe; uso declarado en alemán (`de`), con token de idioma forzado |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (`encoder_model_quantized.onnx`, `decoder_model_merged_quantized.onnx`) |

## Arquitectura y entrenamiento

El modelo es una copia del Whisper medium de OpenAI, un transformer encoder-decoder entrenado para transcripción y traducción de voz. El encoder procesa espectrogramas log-mel de 80 canales y 3000 frames (30 segundos de audio) y produce `last_hidden_state`; el decodificador autoregresivo consume `input_ids`, los estados ocultos del encoder y una caché KV (`past_key_values.*`, con conmutador `use_cache_branch`) para generar `logits` y `present.*`. La exportación parte de Xenova/whisper-medium en el commit `8c5b90880ab9f79487ab33613413431bf661d595` y no reentrena ni modifica pesos.

La única intervención del autor es de grafos: elimina los mapas de atención de las salidas declaradas del grafo ONNX para evitar que ONNX Runtime los retenga en memoria durante la inferencia. No hay información sobre el dataset de entrenamiento original, número de tokens, ni etapas de RLHF o DPO en la documentación proporcionada; esos detalles corresponden a la model card de OpenAI, no incluida aquí. La verificación de equivalencia se hizo con 2 clips de FLEURS en alemán: 30 pasos greedy desde el prompt alemán producen tokens idénticos y salida de encoder idéntica frente al archivo de Xenova.

## Capacidades

- Transcripción de voz a texto multilingüe, con selección de idioma mediante token especial (por ejemplo `<|de|>`).
- Traducción de voz a texto (capacidad heredada de Whisper; el autor solo documenta el flujo de transcripción).
- Procesamiento de ventanas de audio de hasta 30 segundos por pasada (log-mel 80 x 3000).
- Decodificación greedy con caché KV para generación incremental token a token.
- Inferencia en dispositivo con ONNX Runtime, sin backend remoto.
- Prompt de decodificación configurable: `[50258, 50261, 50359, 50363]` para alemán (`<|startoftranscript|>`, `<|de|>`, `<|transcribe|>`, `<|notimestamps|>`), con parada en `50257` (`<|endoftext|>`); otro token de idioma funciona de forma equivalente.
- No se documenta soporte de tool calling, agentes, visión ni audio más allá de la transcripción estándar.

## Casos de uso

- Transcripción de voz en Android sin conexión: la app Thì Thầm lo usa para dictado y notas de voz en alemán; al ejecutarse con ONNX Runtime en el dispositivo, no requiere red ni envío de audio a servidores.
- Aplicaciones de accesibilidad: subtitulado en tiempo casi real de conversaciones presenciales en el móvil, con el pico de memoria contenido (2254 MB) que permite mantener ambos grafos cargados en un dispositivo de gama alta.
- Asistentes de voz integrados en apps móviles: el modelo puede alimentar un pipeline local de comandos por voz, forzando el token de idioma adecuado según la configuración del usuario.
- Dictado en entornos con conectividad limitada o requisitos de privacidad: al no salir el audio del dispositivo, encaja en escenarios sanitarios, legales o industriales donde la grabación no puede enviarse a la nube.
- Prototipado de ASR en transformers.js y entornos web/Node: al derivar de la exportación de Xenova, sirve como referencia para validar pipelines ONNX antes de portar a producción.
- Investigación sobre eficiencia en inferencia: el par de grafos permite medir el impacto de la gestión de salidas del grafo en el consumo de memoria de ONNX Runtime con distintas configuraciones de hilos y optimización.
- Traducción de voz en local: usando el token de tarea `<|translate|>` en lugar de `<|transcribe|>`, puede integrarse en apps de traducción offline (capacidad heredada, no verificada en la model card).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de precisión (WER, MMLU, etc.) en la información disponible. El autor solo aporta una medición de memoria y una comprobación de equivalencia funcional:

| Metrica | Xenova/whisper-medium | Esta copia |
|---|---|---|
| Pico neto de memoria por transcripción (encoder + 20 pasos de decoder) | 5531 MB | 2254 MB |
| Tokens de salida (2 clips FLEURS de, 30 pasos greedy) | idénticos | idénticos |
| Salida del encoder | idéntica | idéntica |

Condiciones de la medición: ONNX Runtime 1.31.1, 4 hilos intra-op, optimización de grafo `ENABLE_ALL`, procesos nuevos.

## Requisitos de hardware

- VRAM/RAM estimada: 2254 MB de pico neto por transcripción según la medición del autor (ambas sesiones cargadas, encoder y 20 pasos de decoder). El repositorio ocupa 0,8 GB en disco.
- GPU recomendadas: no aplica de forma directa; el destino es CPU móvil con ONNX Runtime. En escritorio puede ejecutarse en CPU sin problema; en GPU (A100, H100, RTX 4090) funcionaría vía proveedores de ejecución de ONNX Runtime, pero no es el escenario documentado.
- ¿Cabe en GPU de consumo? Sí, con margen amplio en cualquier GPU con más de 3 GB de memoria, aunque el modelo está pensado para CPU.
- Opciones de despliegue: ONNX Runtime (Android, escritorio, servidor); también puede cargarse desde transformers.js al derivar de la exportación de Xenova. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles. La model card no publica tiempos de inferencia, solo memoria.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto de audio | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| pdnhan/whisper-medium-mobile | no disponible (base medium) | 30 s por ventana | ONNX int8 | Apache 2.0 | Optimizado para memoria en móvil; sin benchmarks de WER |
| Xenova/whisper-medium | no disponible (base medium) | 30 s por ventana | ONNX | Apache 2.0 | Exportación de referencia para transformers.js; mayor pico de memoria (5531 MB) |
| openai/whisper-medium | no disponible (base medium) | 30 s por ventana | PyTorch (safetensors/bin) | Apache 2.0 en HF; código MIT | Modelo original multilingüe; requiere framework completo |
| openai/whisper-small | no disponible (base small) | 30 s por ventana | PyTorch | Apache 2.0 en HF | Alternativa de menor tamaño para móvil, a costa de precisión (no comparada aquí) |

## Limitaciones y advertencias

- Solo se ha verificado equivalencia funcional en 2 clips de FLEURS en alemán; no hay evaluación de precisión (WER) ni de robustez en otros idiomas o dominios.
- El uso declarado es el alemán; el resto de idiomas multilingües debería funcionar con el token correspondiente, pero no está validado por el autor.
- Ventana de audio limitada a 30 segundos por pasada; audios más largos requieren segmentación externa.
- La cuantización int8 puede degradar ligeramente la precisión frente a los pesos originales en float; el autor no publica comparación de calidad más allá de la equivalencia de tokens en la prueba citada.
- Riesgo de alucinación inherente a Whisper en audio con ruido, silencios o habla solapada; no se documentan mitigaciones específicas.
- Sesgos lingüísticos y demográficos heredados del entrenamiento original de OpenAI, no evaluados en esta copia.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta; es un artefacto de un solo autor sin mantenimiento comunitario documentado.
- Licencia Apache 2.0 para los archivos; el código y pesos originales de openai/whisper están bajo MIT, según indica el autor. Conviene revisar ambas licencias antes de uso comercial.
- Dependencia de una versión concreta de ONNX Runtime (medición con 1.31.1); el rendimiento en memoria puede variar con otras versiones o configuraciones de hilos.

## Enlaces

- HuggingFace: https://huggingface.co/pdnhan/whisper-medium-mobile
- Modelo base: https://huggingface.co/openai/whisper-medium
- Exportación de referencia: https://huggingface.co/Xenova/whisper-medium
- Repositorio de OpenAI Whisper: https://github.com/openai/whisper
- App que lo usa: Thì Thầm (Android), sin URL pública en la información disponible
- Script de conversión: `make_mobile.py`, incluido en el repositorio del modelo (provenance)
