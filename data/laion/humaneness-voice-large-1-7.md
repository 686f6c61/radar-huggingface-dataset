# laion/Humaneness-Voice-Large-1.7

## Resumen

Humaneness Voice Large 1.7 es un modelo de síntesis de voz expresiva (text-to-speech) desarrollado por LAION. Resuelve el problema de generar habla con control fino sobre la interpretación actoral: el usuario escribe el texto literal que debe pronunciarse y, por separado, describe la emoción, el ritmo, las pausas y las reacciones no verbales. Está disponible en inglés, alemán, francés, español y neerlandés.

Se trata de un fine-tune supervisado sobre la rama Large 1.3 del mismo autor, con 4.129.990.144 parámetros totales (aproximadamente 4,13 mil millones) almacenados en safetensors. La versión 1.7 incluye los pesos completos ya fusionados con el adaptador rank-32 seleccionado (update 44.250 a escala 1.0), por lo que no requiere adjuntar adaptadores para inferencia ordinaria. No contiene la pila de adaptadores RL de las versiones 1.4/1.5.

El modelo es relevante porque separa explícitamente el contenido hablado de la dirección interpretativa, permite condicionamiento de identidad del hablante mediante una grabación de referencia de al menos 5,04 segundos y admite decodificación con guidance (CFG) para intensificar la actuación. La licencia CC-BY-4.0 facilita su uso comercial con atribución.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (implementación custom con `trust_remote_code=True`; pipeline `moss_tts_local`) |
| Parametros totales | 4.129.990.144 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible; el repo raíz se distribuye en FP32 y el cargador de inferencia usa BF16 en pesos y cómputo |
| Idiomas soportados | en, de, fr, es, nl |
| Licencia | cc-by-4.0 |
| Formato de pesos | safetensors (shards en la raíz) + `adapter/adapter.safetensors` para auditoría |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna más allá de que se trata de un modelo de la familia MOSS TTS local (pipeline `moss_tts_local`) con implementación custom que requiere `trust_remote_code=True`. El modelo utiliza un códec externo, MOSS Audio Tokenizer v2 (OpenMOSS-Team), cargado por separado y sujeto a sus propios términos upstream. El modelo base es laion/Humaneness-Voice-Large-1.3-Alpha, sobre el que se aplicó un fine-tune supervisado.

La versión 1.7 fusiona el checkpoint supervisado Acting High-8654 con su adaptador de actuación rank-32 seleccionado (update 44.250 a escala 1.0). Es una rama supervisada nueva respecto a Large 1.3 y no incorpora la pila de adaptadores RL de 1.4/1.5. El repositorio incluye documentación de entrenamiento (TRAINING.md), procedencia (provenance.json), criterios de selección del checkpoint (stats/selection.json) y un script para entrenar adaptadores propios (training/train_reference.py). No se especifican en la información proporcionada el número de tokens de entrenamiento ni la composición del dataset.

Una innovación destacable es el uso de true logit CFG (classifier-free guidance) o lotes de candidatos para intensificar la actuación, con CFG 2.5 como ajuste del showcase actual (no validado como óptimo universal). El condicionamiento de hablante recorta la referencia a 14,96 segundos antes de codificar, con un mínimo de 5,04 segundos de habla limpia de un único hablante.

## Capacidades

- Síntesis de voz expresiva con control separado de texto literal y dirección interpretativa (emoción, entrega, pausas, reacciones vocales).
- Dirección actoral mediante prompt estructurado con secciones `GENERAL` y `SCRIPT`, paréntesis para entrega local y corchetes para tiempos solicitados.
- Condicionamiento de identidad del hablante mediante audio de referencia (mínimo 5,04 s de habla limpia, palabras distintas al texto objetivo).
- Selección de voz plausible automática cuando no se aporta referencia.
- Multilingüe en cinco idiomas: inglés, alemán, francés, español y neerlandés; las direcciones de actuación se escriben normalmente en inglés.
- Guidance con CFG para reforzar la interpretación (CFG 1 equivale a guidance desactivado).
- Generación controlada por semilla y duración solicitada en segundos.
- No se documenta soporte de tool calling, function calling, agentes ni razonamiento multi-paso; no es un modelo de lenguaje general.
- No se documenta capacidad de visión ni de audio de entrada más allá de la referencia de hablante.

## Casos de uso

- Doblaje y localización de contenido: el modelo permite generar la misma interpretación en inglés, alemán, francés, español y neerlandés manteniendo direcciones actorales coherentes, lo que facilita producir versiones multilingües de un mismo guion.
- Audiolibros y narración: la separación entre texto y dirección permite marcar pausas con corchetes de duración y cambios de tono con paréntesis, produciendo narraciones con ritmo controlado en lugar de lectura plana.
- Videojuegos con diálogo ramificado: la generación por semilla y duración fija permite producir líneas de personaje reproducibles y ajustar la emoción por escena sin regrabar actores.
- Asistentes de voz con identidad consistente: el condicionamiento por referencia de hablante permite mantener un timbre reconocible en conversaciones multi-turno, con la advertencia de que la preservación exacta de la voz no está garantizada.
- Preproducción y prototipado de animación: los estudios pueden generar pistas temporales con marcas de tiempo solicitadas para validar ritmo y duración antes de contratar actores reales.
- Accesibilidad y lectura en voz alta: la ventana de cinco idiomas y el control de pausas permiten generar audio comprensible para contenidos escritos, ajustando la entrega a un registro natural o formal.
- Investigación en habla expresiva: el repositorio incluye audio de evaluación, mediciones de canary y scripts de entrenamiento de adaptadores, lo que permite reproducir experimentos y entrenar adaptadores propios con datos compatibles.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor proporciona audio de evaluación generado y puntuaciones registradas en el dataset laion/humaneness-voice-gemini-r32-cfg-eval, así como comparaciones de checkpoints y una demo de actuación en cinco idiomas, pero no se incluyen cifras de MMLU, HumanEval, GSM8K ni métricas TTS estándar (MOS, WER) en la información proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita. Con 4,13 mil millones de parámetros, los pesos en FP32 ocupan aproximadamente 16,5 GB y en BF16 aproximadamente 8,3 GB, a lo que hay que sumar el códec externo y las activaciones.
- El repositorio completo ocupa 25,7 GB, incluyendo shards, adaptador y material de evaluación.
- GPU recomendadas: no disponibles en la información proporcionada; el autor indica instalar una build de PyTorch con CUDA para el servidor.
- Compatibilidad con GPU de consumo: no confirmada en la información disponible; por el tamaño en BF16 es plausible en GPUs con 16 GB o más, pero no está verificado por el autor.
- Opciones de despliegue: el flujo oficial es `transformers` con `trust_remote_code=True` mediante `infer.py` o la API Python (`infer.load()`, `api.load_codec()`, `infer.generate_codes()`, `api.decode()`). No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles. El autor menciona una guía de optimizaciones de inferencia (INFERENCE_OPTIMIZATIONS.md) con true logit CFG y lotes de candidatos, pero sin cifras en la información proporcionada.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye modelos comparables de la misma categoría (TTS expresivo multilingüe de tamaño similar) con datos verificables de parámetros, contexto, rendimiento y licencia.

## Limitaciones y advertencias

- La preservación exacta de la voz a partir de la referencia no está garantizada; la referencia mejora la señal de identidad, pero no la asegura.
- Las duraciones solicitadas con corchetes son peticiones aprendidas, no límites duros de edición de audio.
- El ajuste CFG 2.5 es el del showcase actual y no un óptimo demostrado para todas las escenas ni para el runtime fusionado.
- Los manuales de prompting de 1.5/1.6 y sus recomendaciones de adaptadores se midieron sobre otros pesos; no deben apilarse adaptadores en 1.7 solo por coincidir en rank o nombre de fichero.
- Riesgo de alucinación no documentado en la información disponible; al ser un modelo TTS, el riesgo principal es una entrega o prosodia no deseada, no la invención de contenido factual.
- Sesgos conocidos: no documentados en la información disponible; al ser un modelo multilingüe entrenado por LAION, cabe esperar sesgos de los datos de habla no especificados.
- Licencia CC-BY-4.0: permite uso comercial con atribución; el códec externo MOSS Audio Tokenizer v2 mantiene sus propios términos upstream, que deben revisarse por separado.
- Requiere `trust_remote_code=True`, lo que implica ejecutar código custom del repositorio; conviene auditar la implementación antes de desplegar en producción.
- El showcase de evaluación crece a medida que terminan 2.200 condiciones; un caso pendiente no equivale a una actuación correcta.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/laion/Humaneness-Voice-Large-1.7
- Modelo base: https://huggingface.co/laion/Humaneness-Voice-Large-1.3-Alpha
- Códec externo MOSS Audio Tokenizer v2: https://huggingface.co/OpenMOSS-Team/MOSS-Audio-Tokenizer-v2
- Comparación de checkpoints: https://laion-humaneness-voice-gemini-r32-cfg-comparison.static.hf.space/index.html
- Showcase de actuación en cinco idiomas: https://laion-humaneness-voice-gemini-r32-cfg-comparison.static.hf.space/showcase.html
- Dataset de evaluación y puntuaciones: https://huggingface.co/datasets/laion/humaneness-voice-gemini-r32-cfg-eval
- Manuales de prompting 1.5/1.6: https://laion-humaneness-voice-large-prompting-manuals.static.hf.space/synthesis/index.html
- Documentación interna del repo: PROMPTING.md, INFERENCE_OPTIMIZATIONS.md, TRAINING.md, provenance.json, stats/selection.json, stats/inference_canary.json, stats/merge-canary-listening.html, examples/canary, training/train_reference.py
