# Phoonnx/vits-cy_gb-bu_tts-medium

## Resumen

vits-cy_gb-bu_tts-medium es un modelo de síntesis de voz (text-to-speech) basado en la arquitectura VITS, desarrollado originalmente por Rhasspy dentro del proyecto Piper y empaquetado por Phoonnx para su librería ONNX de TTS. El modelo convierte texto en galés (variante cy-GB) a audio inteligible, tomando como entrada fonemas generados por espeak-ng en alfabeto IPA. Su propósito es ofrecer una voz TTS ligera, ejecutable en local y sin dependencias de servicios en la nube, para aplicaciones de asistencia por voz y sistemas embebidos.

El modelo se distribuye en formato ONNX con un tamaño de repositorio de 0,1 GB, lo que lo sitúa en la categoría de modelos compactos aptos para CPU y dispositivos de recursos limitados. Está integrado en el ecosistema Phoonnx y en OVOS (Open Voice OS) mediante el plugin `ovos-tts-plugin-phoonnx`, y su licencia MIT facilita su uso comercial. La relevancia actual radica en la escasez de voces TTS de calidad para lenguas minoritarias como el galés, y en la posibilidad de desplegar síntesis de voz completamente offline.

No se dispone de información sobre el número de parámetros, la longitud de contexto ni los datos exactos de entrenamiento en la documentación proporcionada; la model card se limita a describir la arquitectura, el origen upstream y las instrucciones de uso.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | VITS |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo TTS, no autoregresivo de contexto variable) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | galés (cy-GB) |
| Licencia | MIT |
| Formato de pesos | ONNX |
| Entrada de texto | fonemas espeak en alfabeto IPA |
| Tamaño del repositorio | 0,1 GB |
| Librería | phoonnx |
| Pipeline | text-to-speech |

## Arquitectura y entrenamiento

El modelo emplea la arquitectura VITS (Variational Inference with adversarial learning for end-to-end Text-to-Speech), un modelo generativo condicional que combina un codificador de texto, un prior normalizing flow, un decoder basado en HiFi-GAN y un discriminador adversarial entrenado de forma conjunta. VITS produce audio de forma no autoregresiva en una sola pasada, lo que reduce la latencia frente a arquitecturas en cascada. La entrada no es texto crudo sino fonemas en IPA generados por espeak-ng, lo que exige instalar dicho motor fonemizador en el entorno de inferencia.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de RLHF o DPO. El modelo procede del repositorio `rhasspy/piper-voices` (ruta `cy/cy_GB/bu_tts/medium`), donde Rhasspy publica voces Piper entrenadas con datos de voz de dominio público y corpus específicos por idioma; la model card no detalla la procedencia exacta del corpus galés. La etiqueta "medium" indica la variante de calidad dentro de la familia Piper, que suele corresponder a un compromiso entre tamaño y fidelidad.

## Capacidades

- Síntesis de voz a partir de texto en galés (cy-GB), con salida en formato WAV.
- Fonemización de entrada mediante espeak-ng (o el port espyak incluido en `phoonnx[espeak]`), con alfabeto IPA.
- Ejecución local sobre ONNX Runtime, sin dependencia de API externa.
- Integración con OVOS mediante el plugin `ovos-tts-plugin-phoonnx`.
- Integración en navegador mediante phoonnx.js (entrada por espeak o unicode).
- No soporta tool calling, function calling ni razonamiento multi-paso (no es un modelo de lenguaje).
- No dispone de modo thinking, visión ni audio de entrada.
- Capacidad multilingüe limitada al galés; no se documentan otras lenguas.

## Casos de uso

- Asistentes de voz para galés en OVOS: el modelo se selecciona en `mycroft.conf` con el plugin `ovos-tts-plugin-phoonnx` y la voz `piper/cy_GB-bu_tts-medium`, permitiendo respuestas habladas en galés en un asistente doméstico local.
- Lectura de contenido web en galés: integrado en un pipeline de raspado y normalización de texto (scriptconv) para convertir artículos o noticias a audio, útil para accesibilidad de personas con discapacidad visual gallegohablantes.
- Señalización y anuncios en transporte público: generación de avisos pregrabados o dinámicos en galés para estaciones y aeropuertos, con inferencia en CPU de bajo coste.
- Aplicaciones educativas de aprendizaje de idiomas: reproducción de pronunciación de frases en galés para estudiantes, aprovechando la fonemización IPA para consistencia fonética.
- Sistemas de megafonía y domótica: síntesis de avisos en tiempo real en dispositivos embebidos (Raspberry Pi, routers) gracias al tamaño reducido del modelo ONNX (0,1 GB).
- Interfaces conversacionales en kioscos o terminales de atención al ciudadano en Galicia: respuestas habladas en galés sin conexión a internet, con latencia baja al ser un modelo no autoregresivo.
- Prototipado de voces para videojuegos o audiolibros en galés: generación rápida de borradores de diálogo antes de una grabación profesional.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: no disponible; al ser un modelo ONNX de 0,1 GB, es probable que quepa en memoria de CPU sin necesidad de GPU, aunque no se documenta el consumo exacto.
- GPU recomendadas: no se especifican; el modelo está pensado para ejecución en CPU mediante ONNX Runtime.
- GPU consumer: previsiblemente cabe en cualquier GPU consumer moderna (RTX 3060 o superior), aunque no hay datos confirmados.
- Opciones de despliegue: phoonnx (Python), phoonnx.js (navegador), OVOS mediante `ovos-tts-plugin-phoonnx`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a modelos TTS VITS.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Arquitectura | Idioma | Formato | Licencia | Tamaño repo |
|---|---|---|---|---|---|
| vits-cy_gb-bu_tts-medium (Phoonnx) | VITS | cy-GB | ONNX | MIT | 0,1 GB |
| Otras voces Piper de rhasspy/piper-voices | VITS | múltiples | ONNX | MIT (según upstream) | variable |
| Modelos TTS multilingües comerciales (p. ej. APIs cloud) | variable | múltiples | API | propietaria | no aplica |

No se dispone de datos de benchmarks ni de parámetros para establecer una comparación cuantitativa con alternativas de la misma categoría. La comparación se limita a arquitectura, idioma, formato y licencia.

## Limitaciones y advertencias

- Solo soporta galés (cy-GB); no es un modelo multilingüe.
- La calidad de pronunciación depende de espeak-ng; con el port espyak algunos fonemas difieren y pueden producir palabras mal pronunciadas, según advierte la model card.
- No se documentan sesgos específicos, pero al ser una voz entrenada con un corpus concreto puede presentar sesgos de acento o prosodia.
- Riesgo de alucinación no aplica en el sentido de LLM, pero puede generar audio ininteligible o prosodia incorrecta ante texto fuera de dominio o con caracteres no normalizados.
- Requiere instalar espeak-ng o el extra `phoonnx[espeak]`; sin fonemizador el modelo no funciona.
- Licencia MIT declarada por el upstream en la model card de rhasspy/piper-voices; conviene verificar la procedencia del corpus de voz para uso comercial a gran escala.
- El repositorio tiene solo 27 descargas y 0 likes en el momento de la consulta, lo que indica baja validación comunitaria.
- No hay información sobre cuantizaciones alternativas ni sobre rendimiento en producción.

## Enlaces

- Hugging Face: https://huggingface.co/Phoonnx/vits-cy_gb-bu_tts-medium
- Upstream (Piper voices): https://huggingface.co/rhasspy/piper-voices/tree/main/cy/cy_GB/bu_tts/medium
- Colección VITS de Phoonnx: https://huggingface.co/collections/Phoonnx/vits-6af8ea9ae9adb8b94ec31a65
- Repositorio phoonnx: https://github.com/TigreGotico/phoonnx
- Repositorio scriptconv: https://github.com/TigreGotico/scriptconv
- Repositorio phoonnx.js: https://github.com/TigreGotico/phoonnx.js
- Demo en vivo: https://tigregotico.pt/demo
