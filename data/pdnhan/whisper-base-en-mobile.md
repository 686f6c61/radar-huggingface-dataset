# pdnhan/whisper-base.en-mobile

## Resumen
Whisper base.en mobile es una conversión a ONNX int8 del modelo de reconocimiento automático del habla (ASR) Whisper base.en de OpenAI, especializada en inglés y optimizada para inferencia en dispositivos móviles mediante ONNX Runtime. El autor, pdnhan, la deriva de la exportación previa de Xenova (pensada para transformers.js) y aplica un único cambio estructural: elimina los mapas de atención como salidas declaradas del grafo, lo que reduce drásticamente el consumo de memoria en cada transcripción sin alterar los pesos ni los resultados.

El modelo resuelve el problema del coste de memoria en ASR on-device: frente a los 877 MB de pico neto del fichero original de Xenova, esta copia requiere 515 MB en una transcripción completa (encoder más 20 pasos de decoder) medida con ONNX Runtime 1.31.1. Es relevante para desarrolladores que integran reconocimiento de voz en aplicaciones Android sin depender de la nube, como demuestra su uso en la aplicación Thì Thầm.

Se trata de un transformer encoder-decoder de tipo Whisper en su variante base (unos 74 millones de parámetros en el modelo original), con ventana de audio de 30 segundos y vocabulario en inglés. El repositorio ocupa 0,1 GB e incluye los ficheros ONNX cuantizados, el script de generación y la licencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper base), exportado a ONNX |
| Parametros totales | no disponible (el modelo base Whisper base.en ronda los 74 M, dato no confirmado en la informacion proporcionada) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 30 segundos de audio (entrada `input_features` de forma [1, 80, 3000], log-mel) |
| Tipos de cuantizacion | int8 (ficheros `encoder_model_quantized.onnx` y `decoder_model_merged_quantized.onnx`) |
| Idiomas soportados | ingles (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX cuantizado (encoder y decoder separados) |

## Arquitectura y entrenamiento
La arquitectura subyacente es Whisper base.en de OpenAI, un transformer encoder-decoder entrenado para transcripción y traducción de voz, en este caso solo para inglés. La entrada del encoder es un log-mel de 80 canales y 3000 frames, que corresponde a 30 segundos de audio; la salida es `last_hidden_state`. El decoder es autorregresivo y se ejecuta en modo merged, con entradas `input_ids`, `encoder_hidden_states`, `use_cache_branch` y las claves/valores pasados (`past_key_values.*`), y devuelve `logits` y `present.*`. El prompt de decodificación es `[50257, 50362]` (`<|startoftranscript|>`, `<|notimestamps|>`) y la parada se produce en `50256` (`<|endoftext|>`).

No se aportan datos sobre el entrenamiento original (número de tokens, composición del dataset, RLHF) más allá de la procedencia del modelo base. La innovación técnica de esta copia es exclusivamente de despliegue: se eliminan los mapas de atención de las salidas del grafo ONNX, ya que ONNX Runtime mantiene en memoria todas las salidas declaradas y eso inflaba el pico de memoria por transcripción. Los pesos, los nodos y los resultados permanecen idénticos: en 2 clips de FLEURS en inglés, 30 pasos de decoder greedy desde el prompt producen tokens idénticos y la salida del encoder es idéntica a la del fichero de Xenova.

## Capacidades
- Reconocimiento automático del habla en inglés sobre fragmentos de hasta 30 segundos de audio.
- Transcripción con decodificación greedy y control de timestamps desactivado mediante el prompt fijado.
- Inferencia on-device con ONNX Runtime, sin dependencia de servicios en la nube.
- Ejecución con caché de claves/valores en el decoder (`use_cache_branch` y `past_key_values`), lo que evita recomputar el prefijo en cada paso.
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso.
- No dispone de capacidades de visión, audio generativo ni modo thinking.
- Multilingüismo limitado al inglés; no cubre otros idiomas.

## Casos de uso
- Transcripción de voz en aplicaciones Android: integración directa con ONNX Runtime en el dispositivo, como hace la app Thì Thầm, sin enviar audio a servidores externos y con un pico de memoria de 515 MB por transcripción.
- Dictado por voz en apps de notas o mensajería: el modelo procesa clips de hasta 30 segundos y devuelve tokens de texto que la aplicación puede insertar en un campo de entrada, manteniendo la privacidad del usuario.
- Subtitulado local de contenido en inglés: para audios segmentados en ventanas de 30 segundos, el modelo permite generar subtítulos sin conexión en dispositivos con recursos limitados.
- Asistentes de voz embebidos: la decodificación con caché KV y el bajo consumo de memoria lo hacen apto para comandos y consultas cortas en inglés dentro de apps móviles.
- Accesibilidad: transcripción en tiempo casi real de conversaciones presenciales en inglés para personas con discapacidad auditiva, ejecutándose íntegramente en el teléfono.
- Procesamiento por lotes en el borde (edge computing): despliegue en dispositivos con ONNX Runtime para transcribir grabaciones cortas en inglés en entornos sin conectividad, como inspecciones de campo o dispositivos IoT con capacidad de cómputo moderada.
- Prototipado y evaluación de pipelines ASR móviles: al incluir `make_mobile.py` para procedencia, sirve como base reproducible para medir memoria y latencia antes de pasar a producción.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks de precisión (WER, MMLU, etc.) en la información disponible. El autor sí aporta una medición de memoria y una verificación de equivalencia:

| Metrica | Fichero de Xenova | Esta copia |
|---|---|---|
| Pico neto de memoria por transcripción (encoder + 20 pasos de decoder) | 877 MB | 515 MB |
| Tokens en 30 pasos greedy sobre 2 clips de FLEURS (ingles) | referencia | identicos |
| Salida del encoder sobre 2 clips de FLEURS (ingles) | referencia | identica |

Condiciones de medida: ONNX Runtime 1.31.1, 4 hilos intra-op, optimización de grafo ENABLE_ALL, procesos nuevos.

## Requisitos de hardware
- VRAM/RAM estimada para inferencia: alrededor de 515 MB de pico neto por transcripción con las dos sesiones cargadas (encoder y decoder) en la configuración medida; el repositorio completo ocupa 0,1 GB.
- GPU recomendadas: no se especifican; el modelo está pensado para CPU móvil y ejecución en dispositivo.
- Compatibilidad con GPU de consumo: no disponible; no se documenta uso en A100, H100 ni RTX 4090.
- Despliegue: ONNX Runtime (versión de referencia 1.31.1), con optimización de grafo ENABLE_ALL y ejecución multi-hilo (4 hilos intra-op en las pruebas). No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este formato.
- Latencia y throughput: no disponibles; solo se publica el consumo de memoria.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto de audio | Idiomas | Formato | Licencia | Memoria por transcripcion |
|---|---|---|---|---|---|---|
| pdnhan/whisper-base.en-mobile | no disponible (base de Whisper base.en) | 30 s | ingles | ONNX int8 | Apache 2.0 | 515 MB (medido) |
| Xenova/whisper-base.en | no disponible (mismo modelo base) | 30 s | ingles | ONNX | Apache 2.0 | 877 MB (medido por el autor) |
| openai/whisper-base.en | no disponible (aprox. 74 M, no confirmado) | 30 s | ingles | PyTorch (safetensors/bin) | Apache 2.0 en Hugging Face; MIT en el repositorio openai/whisper | no disponible |

La diferencia principal frente a Xenova/whisper-base.en es el consumo de memoria, no la calidad de transcripción, que es idéntica según la verificación del autor. Frente al modelo original de OpenAI, esta copia añade cuantización int8 y un grafo optimizado para móvil, a costa de perder flexibilidad de formatos.

## Limitaciones y advertencias
- Solo inglés: no transcribe ni traduce otros idiomas.
- Ventana de audio fija de 30 segundos por invocación; audios más largos requieren segmentación externa.
- Sin datos publicados de WER ni de robustez ante ruido, acentos o audio de baja calidad; no se puede evaluar la precisión sin pruebas propias.
- Riesgo de alucinación inherente a los modelos Whisper, especialmente en silencios o audio ambiguo; no se documenta mitigación específica en esta copia.
- La cuantización int8 puede introducir degradaciones no medidas; el autor solo verifica equivalencia de tokens en 2 clips de FLEURS, una muestra muy reducida.
- Las mediciones de memoria dependen de la versión de ONNX Runtime (1.31.1), del número de hilos y de la optimización de grafo; otros entornos pueden arrojar cifras distintas.
- Licencia Apache 2.0 para estos ficheros; el código y los pesos originales de openai/whisper están bajo MIT, según indica el autor. Verificar la licencia del modelo base antes de un uso comercial.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: no hay validación comunitaria ni soporte documentado más allá de la model card.
- El modelo no incluye capacidades de puntuación, diarización de hablantes ni post-procesado; estas tareas deben resolverse en la aplicación.

## Enlaces
- Modelo en Hugging Face: https://huggingface.co/pdnhan/whisper-base.en-mobile
- Modelo base: https://huggingface.co/openai/whisper-base.en
- Exportación ONNX de referencia: https://huggingface.co/Xenova/whisper-base.en
- Repositorio de OpenAI Whisper: https://github.com/openai/whisper
