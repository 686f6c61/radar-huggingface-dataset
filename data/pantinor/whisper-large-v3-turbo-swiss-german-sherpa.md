# pantinor/whisper-large-v3-turbo-swiss-german-sherpa

## Resumen

El modelo `pantinor/whisper-large-v3-turbo-swiss-german-sherpa` es una conversión a formato ONNX del fine-tune `Flurin17/whisper-large-v3-turbo-swiss-german`, que adapta el reconocedor de voz Whisper large-v3-turbo de OpenAI al alemán suizo (dialecto gsw y alemán estándar suizo de‑CH). El autor, pantinor, ha exportado los pesos con la herramienta `export-onnx.py` de sherpa-onnx (v1.13.5) aplicando cuantización dinámica int8 tanto en el encoder como en el decoder, lo que permite ejecutar el modelo en CPU con recursos modestos, pensado para despliegue on-device.

El modelo resuelve el problema de transcripción automática de voz (ASR) en alemán suizo, un dialecto con escasos recursos y gran variabilidad, manteniendo la arquitectura turbo de Whisper (32 capas en el encoder, 4 en el decoder, 128 bins mel) y un vocabulario ampliado a 51866 tokens que incluye el token de timestamp `<|30.00|>`. Su relevancia actual radica en la creciente demanda de soluciones de voz locales, privadas y sin conexión, especialmente en entornos donde el alemán suizo es la lengua vehicular.

La verificación incluida en la model card confirma que la decodificación greedy de una frase de prueba coincide exactamente con el checkpoint original en transformers, tanto en fp32 como en int8, lo que garantiza la fidelidad de la conversión. El repositorio tiene un tamaño de 1.0 GB y está pensado para integrarse en aplicaciones como Anti-Vocale, un catálogo de modelos externos para sherpa-onnx.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Whisper large-v3-turbo (encoder 32 capas, decoder 4 capas, 128 mel bins) |
| Parametros totales | no disponible (basado en Whisper large-v3-turbo, ~809M) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (estándar Whisper: 30 segundos de audio) |
| Tipos de cuantizacion | int8 dinámica (encoder y decoder) |
| Idiomas soportados | de (alemán), gsw (alemán suizo), de-CH |
| Licencia | MIT |
| Formato de pesos | ONNX (encoder.int8.onnx, decoder.int8.onnx, tokens.txt) |

## Arquitectura y entrenamiento

El modelo parte de Whisper large-v3-turbo, una versión optimizada de Whisper large-v3 que reduce el decoder de 32 a 4 capas, manteniendo la calidad de transcripción con una latencia menor. Sobre esta base, Flurin17 realizó un fine-tune específico para alemán suizo, ampliando el vocabulario a 51866 tokens (el vocabulario BPE multilingüe original de 50257 más el token de timestamp adicional). El proceso de entrenamiento no está documentado en la información disponible, pero se infiere que utilizó datos de habla suiza con transcripciones en dialecto.

La conversión a sherpa-onnx se realizó con el script `export-onnx.py` (v1.13.5), que remapea los pesos al layout de openai-whisper y exporta el decoder con el exportador ONNX legacy. Se aplicó cuantización dinámica int8, reduciendo el tamaño del encoder a 674 MB y el del decoder a 362 MB. El archivo `tokens.txt` es el vocabulario BPE multilingüe estándar de 50257 líneas, idéntico al de las releases oficiales de sherpa. La verificación de fidelidad se realizó con sherpa-onnx 1.13.3 en CPU, comparando la salida greedy con el checkpoint original en transformers.

## Capacidades

- Transcripción automática de voz (ASR) en alemán suizo (gsw) y alemán estándar (de), con especialización en el dialecto suizo.
- Reconocimiento de voz en tiempo real o por lotes, optimizado para ejecución en CPU gracias a la cuantización int8.
- Soporte de timestamps a nivel de segmento (token `<|30.00|>`), útil para alinear transcripciones con audio.
- Compatible con el runtime sherpa-onnx, lo que permite integración en aplicaciones móviles, de escritorio o embebidas sin necesidad de GPU.
- No incluye capacidades de tool calling, agentes, visión ni razonamiento multimodal; es exclusivamente un modelo de ASR.

## Casos de uso

- Transcripción de reuniones y entrevistas en alemán suizo: el modelo puede procesar grabaciones de audio en dialecto y generar transcripciones textuales, facilitando actas y búsquedas posteriores. Su ejecución en CPU permite usarlo en portátiles o servidores sin GPU.
- Subtitulado automático de vídeos locales: integrado en herramientas de edición de vídeo, genera subtítulos en alemán suizo o alemán estándar, con marcas de tiempo para sincronización.
- Asistentes de voz para aplicaciones de salud o administración pública: al funcionar on-device, garantiza la privacidad de los datos de voz, algo crítico en entornos con información sensible.
- Dictado en aplicaciones de productividad: permite redactar correos, informes o notas mediante voz en alemán suizo, con baja latencia en hardware modesto.
- Accesibilidad para personas con discapacidad auditiva: transcripción en tiempo real de conversaciones o eventos, desplegable en dispositivos móviles con Android o iOS mediante sherpa-onnx.
- Investigación lingüística y preservación del dialecto: el modelo puede transcribir corpus orales de alemán suizo, facilitando el análisis fonético y sociolingüístico.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La única verificación documentada es la coincidencia exacta de la decodificación greedy de una frase de prueba ("Alles hat ein Ende, nur die Wurst hat zwei.") entre el checkpoint original en transformers y la versión ONNX int8, tanto en fp32 como en int8. No hay datos de WER, CER ni comparaciones con otros modelos ASR.

## Requisitos de hardware

- El modelo está diseñado para ejecución en CPU; los archivos ONNX int8 suman aproximadamente 1.0 GB (encoder 674 MB, decoder 362 MB).
- VRAM estimada: no aplica para CPU; en GPU se podría cargar en memoria de vídeo, pero no es el objetivo del despliegue.
- GPU recomendadas: no necesarias; cualquier CPU moderna con soporte AVX2 puede ejecutar el modelo con razonable rendimiento.
- En consumer GPU (p. ej., RTX 3060 o superior) se podría ejecutar, pero no se han publicado mediciones de latencia o throughput.
- Opciones de despliegue: sherpa-onnx (runtime C++/Python), compatible con frameworks como Anti-Vocale, y potencialmente con otros motores que acepten ONNX.
- Latencia y throughput: no disponibles; dependen del hardware y del número de hilos utilizados.

## Comparativa con modelos similares

| Modelo | Arquitectura | Parámetros | Contexto | Licencia | Formato |
|---|---|---|---|---|---|
| pantinor/whisper-large-v3-turbo-swiss-german-sherpa | Whisper large-v3-turbo | ~809M (no confirmado) | 30 s (estándar) | MIT | ONNX int8 |
| openai/whisper-large-v3-turbo | Whisper large-v3-turbo | 809M | 30 s | MIT (código) / Apache 2.0 (pesos) | PyTorch, safetensors |
| Flurin17/whisper-large-v3-turbo-swiss-german | Whisper large-v3-turbo fine-tune | ~809M | 30 s | MIT | PyTorch, safetensors |

La comparativa se limita a los modelos base y fine-tune; no se dispone de otros modelos ASR específicos para alemán suizo en la información proporcionada. La principal diferencia del modelo evaluado es su formato ONNX int8, que lo hace directamente ejecutable en sherpa-onnx sin necesidad de conversión adicional.

## Limitaciones y advertencias

- El modelo está especializado en alemán suizo y alemán estándar; su rendimiento en otros idiomas o dialectos no está garantizado.
- No se han publicado métricas de error (WER) ni evaluaciones en conjuntos de datos estándar, por lo que su calidad real en producción es desconocida.
- La cuantización int8 puede introducir ligeras degradaciones en la precisión, aunque la verificación puntual muestra coincidencia exacta en una frase.
- El token adicional `<|30.00|>` no está incluido en `tokens.txt`, siguiendo la convención de sherpa; esto podría afectar a la generación de timestamps en algunos casos.
- Al ser un modelo de ASR, no realiza traducción ni comprensión del lenguaje; solo transcribe.
- La licencia MIT permite uso comercial sin restricciones, pero el modelo base (Whisper) tiene su propia licencia; se recomienda verificar la compatibilidad.
- No se proporcionan garantías de soporte ni mantenimiento; el repositorio tiene 0 descargas y 0 likes, lo que sugiere un uso muy limitado.

## Enlaces

- [HuggingFace: pantinor/whisper-large-v3-turbo-swiss-german-sherpa](https://huggingface.co/pantinor/whisper-large-v3-turbo-swiss-german-sherpa)
- [Modelo base: Flurin17/whisper-large-v3-turbo-swiss-german](https://huggingface.co/Flurin17/whisper-large-v3-turbo-swiss-german)
- [Whisper large-v3-turbo original (OpenAI)](https://huggingface.co/openai/whisper-large-v3-turbo)
- [Guía sobre Whisper large-v3-turbo (LoroNote)](https://loronote.com/en/blog/whisper-large-v3-turbo-guide)
- [Análisis técnico de Whisper large-v3-turbo](https://lawwu.github.io/til/posts/2024-10-02-whisper-v3-turbo/index.html)
- [Repositorio GitHub de Whisper large-v3-turbo](https://github.com/yrsgsda/whisper-large-v3-turbo)
