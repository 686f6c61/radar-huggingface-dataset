# Phoonnx/vits-pl_pl-zenski-espeak

## Resumen

vits-pl_pl-zenski-espeak es un modelo de síntesis de voz (text-to-speech) basado en la arquitectura VITS, desarrollado originalmente por WitoldG dentro del proyecto polish_piper_models y empaquetado por Phoonnx para su librería ONNX de TTS, phoonnx. El modelo convierte texto en polaco (pl-PL) a audio, tomando como entrada fonemas generados por espeak-ng en alfabeto IPA. Su relevancia radica en que ofrece una voz polaca ligera (repo de 0,1 GB) y ejecutable en formato ONNX, lo que facilita su despliegue en entornos sin GPU dedicada y su integración en asistentes de voz como OVOS.

El modelo no es un LLM ni un transformer generativo de texto: es un sistema TTS condicionado a fonemas, pensado para síntesis de voz de un solo hablante en polaco. Al estar empaquetado con licencia MIT y en formato ONNX, resulta adecuado para pipelines de síntesis de voz embebidos, aplicaciones de accesibilidad y asistentes conversacionales de código abierto.

La información pública disponible es limitada: no se detallan datos de entrenamiento, número de parámetros ni resultados de benchmarks, por lo que esta ficha marca explícitamente como "no disponible" todo aquello que no figura en la model card ni en los metadatos de Hugging Face.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VITS (variational inference with adversarial learning for end-to-end text-to-speech) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo TTS; entrada de texto sin ventana de contexto definida) |
| Tipos de cuantizacion | no disponible (pesos distribuidos en ONNX; no se documentan variantes cuantizadas) |
| Idiomas soportados | polaco (pl-PL) |
| Licencia | MIT |
| Formato de pesos | ONNX |
| Entrada de texto | fonemas espeak (alfabeto IPA) |
| Tamano del repositorio | 0,1 GB |
| Libreria de inferencia | phoonnx |
| Pipeline | text-to-speech |
| Autor original | WitoldG |
| Empaquetado | Phoonnx |

## Arquitectura y entrenamiento

El modelo emplea la arquitectura VITS, un sistema end-to-end de síntesis de voz que combina un codificador de texto, un prior variacional, un decoder generativo y un discriminador adversarial entrenado con aprendizaje adversarial, junto con alineamiento monotónico para convertir secuencias de fonemas en formas de onda de audio. La entrada no es texto crudo, sino fonemas en alfabeto IPA producidos por espeak-ng, lo que implica que el front-end de texto (normalización y fonemización) se delega a librerías externas como scriptconv.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, el número de horas de audio, ni sobre si se aplicaron técnicas de RLHF o ajuste fino adicional. Tampoco se documentan innovaciones técnicas específicas más allá de las propias de la arquitectura VITS. El modelo procede del repositorio WitoldG/polish_piper_models y ha sido reempaquetado para phoonnx sin que la model card detalle modificaciones sobre los pesos originales.

## Capacidades

- Síntesis de voz a partir de texto en polaco (pl-PL), con salida en formato WAV.
- Conversión de texto a fonemas IPA mediante espeak-ng (o el port espyak incluido en el extra `phoonnx[espeak]`).
- Ejecución en formato ONNX, apta para inferencia en CPU y en navegador mediante phoonnx.js.
- Integración con el asistente OVOS a través del plugin `ovos-tts-plugin-phoonnx`.
- Voz única de un solo hablante (no se documenta clonación de voz ni multi-hablante).
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso (no es un modelo de lenguaje).
- No dispone de capacidades multimodales de visión, audio de entrada ni modo thinking.

## Casos de uso

- Asistentes de voz en polaco sobre OVOS: el modelo se selecciona mediante `mycroft.conf` con el plugin `ovos-tts-plugin-phoonnx`, permitiendo respuestas habladas en un asistente doméstico de código abierto sin necesidad de servicios en la nube.
- Síntesis de voz en aplicaciones de accesibilidad: lectura de textos en polaco para personas con discapacidad visual, ejecutable en CPU gracias al formato ONNX y al reducido tamaño del repositorio (0,1 GB).
- Generación de audiolibros y locuciones: conversión por lotes de textos largos en polaco a WAV mediante `voice.synthesize_wav`, adecuada para contenido pregrabado donde no se requiere baja latencia.
- Síntesis en el navegador: mediante phoonnx.js, el modelo puede ejecutarse en el cliente con entrada espeak o unicode, útil para demos interactivas y aplicaciones web sin backend de inferencia.
- Integración en pipelines de CI/CD de contenido: generación automatizada de avisos de voz en polaco para sistemas de megafonía o notificaciones, aprovechando la licencia MIT para uso comercial.
- Prototipado de interfaces de voz: al ser un modelo ligero y con licencia permisiva, sirve para validar flujos de TTS en polaco antes de migrar a modelos de mayor calidad o a servicios comerciales.
- Educación y aprendizaje de idiomas: reproducción de frases en polaco con pronunciación fonética controlada por espeak, útil en materiales didácticos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible; al tratarse de un modelo ONNX de 0,1 GB, se espera inferencia en CPU sin GPU dedicada, aunque no se documentan cifras oficiales.
- GPU recomendadas: no disponible; no se especifican requisitos de GPU en la model card.
- Compatibilidad con GPU de consumo: no documentada; el formato ONNX y el tamaño reducido sugieren viabilidad en hardware de consumo, pero no se confirma.
- Opciones de despliegue: phoonnx (Python), plugin `ovos-tts-plugin-phoonnx` para OVOS y phoonnx.js para navegador.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Arquitectura | Idioma | Contexto / entrada | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|---|
| vits-pl_pl-zenski-espeak | VITS | pl-PL | fonemas espeak (IPA) | MIT | ONNX | Hugging Face (Phoonnx) |
| WitoldG/polish_piper_models | Piper/VITS | pl-PL | texto/fonemas | no disponible en esta ficha | no disponible | Hugging Face (WitoldG) |
| Otros modelos de la colección VITS de Phoonnx | VITS | varios | fonemas espeak | MIT (según colección) | ONNX | Hugging Face (Phoonnx) |

No se dispone de datos de rendimiento comparativo entre estos modelos, por lo que la comparativa se limita a parámetros estructurales y de licencia.

## Limitaciones y advertencias

- Solo soporta polaco (pl-PL); no se documentan otros idiomas.
- La calidad de pronunciación depende de espeak-ng: si se usa el port espyak, algunos fonemas difieren y el modelo puede pronunciar mal ciertas palabras, según advierte la model card.
- No se documentan sesgos específicos, pero al ser un modelo entrenado con datos no especificados, pueden aparecer sesgos de pronunciación o prosodia no caracterizados.
- Riesgo de alucinación no aplica en el sentido de generación de texto, pero sí puede producir audio incorrecto ante entradas fuera de distribución o fonemas mal formados.
- No se especifican límites de longitud de texto; la síntesis se realiza por frases, por lo que textos largos deben dividirse.
- La licencia MIT permite uso comercial, pero la model card remite a los términos del release upstream (WitoldG/polish_piper_models), que no se detallan en la información disponible.
- El modelo tiene muy baja adopción (20 descargas, 0 likes), lo que reduce la validación comunitaria y el soporte.
- No se documentan garantías de calidad en producción ni métricas objetivas (MOS, WER) que permitan evaluar su idoneidad frente a alternativas.

## Enlaces

- Hugging Face: https://huggingface.co/Phoonnx/vits-pl_pl-zenski-espeak
- Repositorio upstream: https://huggingface.co/WitoldG/polish_piper_models
- Librería phoonnx: https://github.com/TigreGotico/phoonnx
- scriptconv: https://github.com/TigreGotico/scriptconv
- phoonnx.js: https://github.com/TigreGotico/phoonnx.js
- Demo en vivo: https://tigregotico.pt/demo
- Colección VITS de Phoonnx: https://huggingface.co/collections/Phoonnx/vits-6af8ea9ae9adb8b94ec31a65
