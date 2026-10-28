# sanmartp/whisper-tiny_to_american_accent_28oct

## Resumen

sanmartp/whisper-tiny_to_american_accent_28oct es un ajuste fino (fine-tune) del modelo de reconocimiento automático del habla openai/whisper-tiny, publicado por el usuario sanmartp en HuggingFace. El modelo parte de los 37,76 millones de parámetros del whisper-tiny original y se ha reentrenado sobre el dataset naharte/american_english para especializarse en transcripción de inglés americano. Resuelve un problema acotado: adaptar un modelo ASR genérico y muy pequeño a un dominio/acento concreto con un coste computacional mínimo, de forma que pueda ejecutarse en CPU o en GPUs de gama baja.

Se trata de un transformer encoder-decoder con arquitectura Whisper estándar (audio en ventanas de 30 segundos convertidas a espectrogramas mel, decoder autorregresivo de texto). El entrenamiento se realizó con la librería Transformers (versión 5.22.0.dev0) mediante el Trainer, con 2000 pasos, learning rate 1e-5 y batch size 2, durante aproximadamente 1,9 épocas. El resultado declarado es un WER de 9,03 % sobre el split de test del dataset de entrenamiento, con una pérdida de validación de 0,1867.

Su relevancia es práctica más que investigadora: demuestra el flujo completo de especialización de un modelo ASR pequeño con recursos mínimos y licencia Apache 2.0, lo que permite integrarlo en productos comerciales. Conviene señalar que el repositorio no incluye documentación sobre composición del dataset, metodología de evaluación ni sesgos, y que el resultado de WER está declarado por el autor sin verificación independiente (verified: false). El modelo tiene 0 descargas y 0 likes en el momento de redactar esta ficha.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper), ASR sobre espectrograma mel |
| Parametros totales | 37.760.640 (37,76 M), confirmado en safetensors |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | 30 segundos de audio por ventana (1500 frames mel); 448 tokens de texto en el decoder |
| Tipos de cuantizacion | No publicados por el autor; el repositorio solo contiene pesos safetensors. Al ser un modelo Transformers estándar es convertible a int8, GGUF u ONNX con herramientas externas (faster-whisper, whisper.cpp) |
| Idiomas soportados | Inglés (fine-tune orientado a inglés americano). El tokenizer heredado del modelo base es multilingüe, pero el ajuste se ha realizado solo con datos en inglés |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (Transformers); tamaño del repositorio 0,3 GB |

## Arquitectura y entrenamiento

La arquitectura es la de Whisper tiny: un encoder que procesa espectrogramas mel de 80 canales en ventanas de 30 segundos y un decoder autorregresivo que genera tokens de texto con atención cruzada sobre la salida del encoder. En la variante tiny esto se traduce en 4 capas de encoder y 4 de decoder, dimensión de modelo 384 y 6 cabezas de atención, con un vocabulario multilingüe de 51.865 tokens y 37,7 M de parámetros. No hay innovaciones arquitectónicas respecto al modelo base: el interés está en el ajuste, no en el diseño.

El entrenamiento se ejecutó con Transformers 5.22.0.dev0, PyTorch 2.11.0+cu130, Datasets 5.1.0 y Tokenizers 0.23.3, usando AdamW fused (betas 0,9/0,999, epsilon 1e-08), scheduler lineal con 500 pasos de warmup, learning rate 1e-5, batch de entrenamiento 2, batch de evaluación 1, semilla 42 y 2000 pasos totales (≈1,89 épocas sobre el dataset). No se documenta el número de tokens de audio, la composición del dataset naharte/american_english, ni si hubo etapas de RLHF/DPO (no aplicables habitualmente en ASR, pero no confirmado). La evolución registrada muestra una mejora monótona: en el paso 1000 el WER era 11,08 % y en el 2000 bajó a 9,03 %, lo que sugiere que el modelo aún no había convergido y que un entrenamiento más largo podría mejorar el resultado.

## Capacidades

- Transcripción de voz a texto en inglés americano con un modelo de 37,7 M de parámetros.
- Procesamiento de audio en ventanas de hasta 30 segundos; para audios más largos es necesario trocear y concatenar (Whisper no hace streaming nativo).
- Reconocimiento de habla continua y de frase corta (el autor no documenta el comportamiento en audio de menos de 1 segundo).
- Salida de texto sin marcas de tiempo garantizadas; el autor no documenta el uso de `return_timestamps` ni la fiabilidad de los timestamps.
- No se documenta soporte de tool calling ni de function calling: es un modelo puramente ASR.
- No se documenta capacidad de agentes, razonamiento multi-paso ni modo "thinking".
- No hay capacidades multimodales más allá del audio de entrada y texto de salida (sin visión, sin audio de salida, sin diarización de hablantes).
- Capacidad multilingüe no soportada de forma fiable: el ajuste es exclusivamente en inglés.

## Casos de uso

- Transcripción de notas de voz y reuniones en inglés americano: el modelo cabe en CPU y puede procesar ventanas de 30 segundos con un coste muy bajo, adecuado para prototipos o aplicaciones de escritorio donde no hay GPU.
- Preprocesado de audio para pipelines de NLP: convertir entrevistas o podcasts en inglés a texto antes de pasarlo a un modelo de resumen o búsqueda semántica, aprovechando el bajo coste por hora de audio.
- Subtitulado automático en entornos con recursos limitados: al ocupar menos de 1 GB de VRAM, se puede desplegar junto a otros servicios en la misma GPU o incluso en dispositivos edge (Raspberry Pi, móvil) mediante whisper.cpp o CTranslate2.
- Voice-to-text en aplicaciones de accesibilidad: dictado en inglés para usuarios con dificultades motoras, ejecutado localmente para evitar enviar audio a la nube.
- Etiquetado y filtrado de grandes volúmenes de audio: clasificación preliminar de grabaciones (¿contiene habla en inglés inteligible?) antes de aplicar un modelo ASR mayor y más caro.
- Evaluación comparativa de pipelines ASR: servir como línea base de bajo coste frente a whisper-base o whisper-small para medir cuánto se gana en WER al aumentar parámetros en un dominio concreto.
- Transcripción de centros de llamadas en inglés americano: el ajuste específico de acento puede reducir errores frente al modelo base en ese dominio, aunque el autor no aporta una comparación directa.

## Benchmarks y rendimiento

Datos declarados por el autor en el model-index (no verificados de forma independiente):

| Tarea | Dataset | Métrica | Valor |
|---|---|---|---|
| Automatic Speech Recognition | naharte/american_english (config: default, split: test) | WER | 9,03 % (9,032925) |
| Evaluación del entrenamiento | Conjunto de validación del mismo dataset | Loss | 0,1867 |

Evolución durante el entrenamiento, según la model card:

| Paso | Época | Training loss | Validation loss | WER |
|---|---|---|---|---|
| 1000 | 0,9452 | 0,1604 | 0,2031 | 11,08 % |
| 2000 | 1,8904 | 0,0605 | 0,1867 | 9,03 % |

No se han publicado resultados en otros benchmarks (LibriSpeech, Common Voice, FLEURS u otros) en la información disponible, por lo que no es posible comparar el rendimiento con modelos similares mediante números.

## Requisitos de hardware

- VRAM estimada para inferencia: menos de 1 GB. En fp32 los pesos ocupan unos 151 MB; en fp16 unos 75 MB; en int8 unos 38 MB. El cuello de botella real es el buffer del espectrograma y las activaciones, no los pesos.
- GPU recomendadas: ninguna en particular; el modelo funciona en cualquier GPU con al menos 1-2 GB de VRAM (GTX 1050 Ti, RTX 3050, RTX 4090, A100). Usar una A100 o H100 aporta poco: el modelo no satura esos aceleradores.
- Cabe en GPU de consumo: sí, en todas las GPU consumer actuales e incluso en iGPU y en CPU. También es viable en dispositivos embebidos.
- Opciones de despliegue: pipeline de Transformers (`automatic-speech-recognition`), faster-whisper (CTranslate2), whisper.cpp con pesos convertidos a GGUF, ONNX Runtime, y servidores como TGI o vLLM (vLLM soporta modelos Whisper). Para CPU, faster-whisper y whisper.cpp son las opciones más eficientes.
- Latencia y throughput: no disponibles. El autor no publica mediciones de latencia ni de factor de tiempo real (RTF). Por el tamaño (37,7 M de parámetros) es esperable que sea mucho más rápido que tiempo real en CPU moderna, pero este dato no está confirmado en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto de audio | Idiomas | Licencia | WER en este test | Disponibilidad |
|---|---|---|---|---|---|---|
| sanmartp/whisper-tiny_to_american_accent_28oct | 37,7 M | 30 s | Inglés (fine-tune americano) | Apache 2.0 | 9,03 % (declarado, no verificado) | HuggingFace, 0 descargas |
| openai/whisper-tiny | 37,7 M | 30 s | Multilingüe (99 idiomas) | Apache 2.0 según model card del repo base | No evaluado en este test | HuggingFace, ampliamente usado |
| openai/whisper-base | 74 M | 30 s | Multilingüe (99 idiomas) | Apache 2.0 según model card del repo base | No evaluado en este test | HuggingFace |
| openai/whisper-small | 244 M | 30 s | Multilingüe (99 idiomas) | Apache 2.0 según model card del repo base | No evaluado en este test | HuggingFace |

No se dispone de resultados del modelo base ni de los modelos mayores sobre el dataset naharte/american_english, por lo que la comparación cuantitativa directa no es posible. La comparación cualitativa es clara: este fine-tune sacrifica cobertura multilingüe a cambio de especialización en inglés americano, manteniendo el mismo coste de inferencia que whisper-tiny.

## Limitaciones y advertencias

- El WER de 9,03 % está declarado por el autor y marcado como `verified: false`; no hay evaluación independiente ni comparación con el modelo base sobre el mismo test, por lo que no se puede afirmar que el fine-tune mejore al original.
- El WER se mide sobre el mismo dataset usado para el ajuste (naharte/american_english), lo que puede inflar el resultado respecto a dominios no vistos. No hay evaluación out-of-domain.
- Solo inglés: el ajuste se ha hecho exclusivamente con datos en inglés americano; el uso con otros acentos o idiomas degradará el resultado de forma no documentada.
- No se documenta la composición, tamaño, procedencia ni licencia del dataset naharte/american_english, lo que impide evaluar riesgos de sesgo de acento, género, edad o calidad de las transcripciones de referencia.
- Riesgo de alucinación típico de Whisper: en segmentos con silencio, ruido o música el modelo puede generar texto inventado o repetir frases. No hay mitigaciones documentadas.
- Sin diarización, sin detección de actividad de voz integrada y sin garantías sobre marcas de tiempo; para audios largos hay que gestionar manualmente el troceado y las fronteras entre ventanas.
- Modelo sin mantenimiento aparente: 0 descargas, 0 likes, model card generada automáticamente con secciones "More information needed", y metadatos con fecha de creación 2026-10-28 que resulta incoherente con el estado del ecosistema (Transformers 5.22.0.dev0, PyTorch 2.11.0), lo que conviene verificar antes de confiar en el repositorio.
- Licencia Apache 2.0: permite uso comercial y modificaciones, pero al derivar de openai/whisper conviene revisar también los términos del modelo base y las condiciones del dataset de ajuste, que no se detallan.
- No es adecuado como sistema de transcripción de producción sin una evaluación propia sobre el dominio objetivo y sin un mecanismo de detección de alucinaciones.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/sanmartp/whisper-tiny_to_american_accent_28oct
- Modelo base: https://huggingface.co/openai/whisper-tiny
- Dataset de ajuste: https://huggingface.co/datasets/naharte/american_english
- Repositorio oficial de Whisper (OpenAI): https://github.com/openai/whisper
- Paper de Whisper (Radford et al., 2022): https://arxiv.org/abs/2212.04356
- faster-whisper (CTranslate2): https://github.com/SYSTRAN/faster-whisper
- whisper.cpp: https://github.com/ggerganov/whisper.cpp
- Leaderboard de ASR de HuggingFace: https://huggingface.co/spaces/hf-audio/open_asr_leaderboard
