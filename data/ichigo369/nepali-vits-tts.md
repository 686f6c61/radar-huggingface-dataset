# Ichigo369/nepali-vits-tts

## Resumen

nepali-vits-tts es un modelo de síntesis de voz (text-to-speech) para nepalí, entrenado desde cero por Ichigo369 en colaboración con Dragneel. Utiliza la arquitectura VITS original de jaywalnut310 sobre el corpus OpenSLR 43, un conjunto de unas 3 horas de audio de una única hablante femenina grabado en estudio a 22050 Hz. El modelo es mono-hablante y no emplea fonemizador: trabaja directamente con grafemas devanagari (71 símbolos) normalizados en NFC.

El problema que aborda es la escasez de sistemas TTS abiertos para nepalí, un idioma con pocos recursos. Al publicarse bajo licencia MIT y con scripts de inferencia incluidos, permite integrar síntesis de voz en aplicaciones de voz para nepalí sin depender de servicios propietarios. El repositorio ocupa 0,4 GB e incluye el checkpoint del generador a 211 000 pasos, la configuración, el limpiador de texto y muestras WAV.

Es relevante ahora porque la comunidad de voz en nepalí está creciendo (chatbots, asistentes y pipelines de transcripción como nepali-whisper), y este modelo ofrece una base reproducible y ligera. No obstante, sus propios autores advierten que la calidad está limitada por el tamaño del corpus, no por la arquitectura, y recomiendan el checkpoint de 100 000 pasos como el más claro.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | VITS (jaywalnut310), mono-hablante, sin fonemizador |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (TTS; entrada de texto de longitud variable) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | nepalí (ne) |
| Licencia | MIT (hereda los términos del dataset OpenSLR 43) |
| Formato de pesos | PyTorch (.pth); checkpoint principal `G_211000.pth` |
| Frecuencia de muestreo | 22050 Hz |
| Representación de texto | 71 grafemas devanagari, normalización NFC |
| Checkpoint recomendado | `G_100000.pth` (100k pasos), disponible en el repo original de Dragneel |
| Tamaño del repositorio | 0,4 GB |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura VITS, un sistema de TTS de extremo a extremo que combina un codificador de texto, un prior variacional, un decodificador generativo y un discriminador adversarial, con alineamiento monotónico aprendido. En esta implementación se entrena en modo mono-hablante y sin fonemizador: la entrada son grafemas devanagari (71 símbolos) normalizados a NFC mediante `nepali_cleaners.py`.

El entrenamiento se realizó sobre OpenSLR 43, con 2002 enunciados (~3 horas) de una hablante femenina de estudio a 22050 Hz, usando una AMD MI300X (192 GB de VRAM) con ROCm 6.2 y la configuración `nepali_base.json`. Los autores señalan que el entrenamiento más allá de ~150 000 pasos no produce mejora audible en este corpus pequeño, y que el checkpoint de 100 000 pasos es el más claro. Un detalle técnico crítico de la inferencia es la inserción de tokens en blanco entre fonemas mediante `commons.intersperse(t, 0)`; sin este paso el audio resulta distorsionado independientemente de la calidad del checkpoint. El script `infer_vits1.py` ya lo implementa.

## Capacidades

- Síntesis de voz a partir de texto en nepalí escrito en devanagari.
- Voz única femenina de estudio, adecuada para narración y lectura de frases.
- Control de prosodia mediante parámetros de inferencia: `noise_scale` (0.667 por defecto), `noise_scale_w` (0.8) y `length_scale` (1.0) para ajustar velocidad y variabilidad.
- Normalización de texto NFC integrada en el limpiador incluido.
- No soporta tool calling, function calling ni razonamiento multi-paso: es exclusivamente un modelo TTS.
- No dispone de modo thinking, visión ni audio de entrada.
- Multilingüismo: únicamente nepalí.

## Casos de uso

- Lectura de noticias y artículos en nepalí: el modelo convierte texto devanagari en audio para portales informativos o podcasts automatizados, aprovechando la voz de estudio consistente y la licencia MIT para uso comercial.
- Chatbots de voz en nepalí: integrado con un ASR como nepali-whisper, permite construir asistentes conversacionales de extremo a extremo; de hecho, el checkpoint `G_211000.pth` se usa en el proyecto Nepali Voice Chatbot.
- Accesibilidad para personas con discapacidad visual: lectura de interfaces, documentos y mensajes en nepalí dentro de aplicaciones móviles o de escritorio, con un modelo ligero que cabe en recursos modestos.
- Audiolibros y contenido educativo: generación de narraciones para material didáctico en nepalí, ajustando `length_scale` para adaptar la velocidad al público infantil o adulto.
- Avisos y sistemas de megafonía automatizada: anuncios en estaciones, aeropuertos o comercios con frases cortas y vocabulario común, donde el modelo rinde mejor según las observaciones de los autores.
- Prototipado e investigación en TTS de bajos recursos: base reproducible para experimentar con VITS en lenguas con pocos datos, comparando checkpoints y técnicas de normalización.
- Doctaje de vídeos y demos: generación de pistas de voz para tutoriales o presentaciones en nepalí sin depender de servicios en la nube.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card incluye comparaciones cualitativas A/B/C entre los checkpoints de 100k, 200k y 210k pasos sobre las mismas frases, pero no métricas objetivas como MOS, MCD o WER.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; por el tamaño del repositorio (0,4 GB) y la arquitectura VITS, es previsible que quepa en GPUs consumer con 4-8 GB, aunque no se confirma en la documentación.
- GPU recomendadas: no disponible. El entrenamiento se realizó en AMD MI300X (192 GB) con ROCm 6.2, pero no se indican requisitos de inferencia.
- GPU consumer: probablemente compatible con RTX 3060/4060 o superiores por el tamaño del modelo, sin dato confirmado.
- Opciones de despliegue: inferencia mediante el script `infer_vits1.py` con PyTorch; no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI (no aplicables a TTS). Existe una demo en Hugging Face Spaces (Dragneel/nepali-tts).
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Idioma | Datos de entrenamiento | Arquitectura | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Ichigo369/nepali-vits-tts | Nepalí | OpenSLR 43, ~3 h, 1 hablante | VITS | MIT | Hugging Face (repo espejo) |
| Dragneel/nepali-vits-tts | Nepalí | OpenSLR 43, ~3 h, 1 hablante | VITS | MIT | Hugging Face (release original) |
| waglesameer5/nepali-tts-v1 | Nepalí | 65,7 h | no disponible | no disponible | Hugging Face |

El modelo original de Dragneel es idéntico en arquitectura y datos, e incluye además `G_100000.pth` y los discriminadores `D_*`. La alternativa de waglesameer5 dispone de un corpus mucho mayor (65,7 h frente a ~3 h), lo que según los propios autores de este modelo es el factor determinante para una calidad de producción. No se dispone de datos de benchmarks para comparar rendimiento objetivo entre ellos.

## Limitaciones y advertencias

- Calidad limitada por el corpus: solo ~3 horas de audio de una hablante; los autores reconocen que entrenar más allá de ~150k pasos no mejora el resultado audible.
- Vocabulario restringido: el modelo rinde bien con frases que usan vocabulario presente en OpenSLR 43; fuera de ese dominio la naturalidad puede degradarse.
- Mono-hablante: no permite cambiar de voz ni de estilo sin reentrenar.
- Sin fonemizador: depende de grafemas devanagari normalizados en NFC; texto mal normalizado o con caracteres fuera del conjunto de 71 símbolos puede producir audio incorrecto.
- Riesgo de alucinación acústica: como todo TTS generativo, puede producir pronunciaciones erróneas o artefactos en entradas ambiguas o poco frecuentes.
- Sesgos: al provenir de una única hablante femenina de estudio, la voz refleja sus características y no representa la diversidad dialectal del nepalí.
- Restricciones de licencia: MIT para el modelo, pero hereda los términos del dataset OpenSLR 43; conviene revisar las condiciones de uso comercial de los datos de entrenamiento.
- Uso en producción: los autores recomiendan explícitamente un corpus mayor (por ejemplo, waglesameer5/nepali-tts-v1 con 65,7 h) para calidad de producción.
- Requisito crítico de inferencia: sin `commons.intersperse(t, 0)` el audio es ininteligible; cualquier integración debe respetar este paso.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Ichigo369/nepali-vits-tts
- Release original: https://huggingface.co/Dragneel/nepali-vits-tts
- Demo en Spaces: https://huggingface.co/spaces/Dragneel/nepali-tts
- Repositorio VITS original: https://github.com/jaywalnut310/vits
- Proyecto Nepali Voice Chatbot (usa `G_211000.pth`): https://github.com/Bishalai/nepali-whisper
- Alternativa con corpus mayor: https://huggingface.co/waglesameer5/nepali-tts-v1
- Dataset OpenSLR 43: https://www.openslr.org/43/
