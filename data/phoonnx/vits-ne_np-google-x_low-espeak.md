# Phoonnx/vits-ne_np-google-x_low-espeak

## Resumen

vits-ne_np-google-x_low-espeak es un modelo de síntesis de voz (text-to-speech) basado en la arquitectura VITS, desarrollado originalmente por Rhasspy dentro del proyecto Piper y empaquetado por Phoonnx para su librería ONNX de TTS. El modelo convierte texto en nepalí (ne-NP) en audio, tomando como entrada fonemas generados por espeak-ng en alfabeto IPA. Su propósito es ofrecer una voz ligera y ejecutable en local para aplicaciones de asistencia por voz, lectores de pantalla o agentes conversacionales en nepalí.

La relevancia de este paquete es fundamentalmente práctica: Phoonnx distribuye el modelo en formato ONNX listo para consumir desde Python (y desde el ecosistema OVOS/Mycroft mediante el plugin `ovos-tts-plugin-phoonnx`), eliminando la necesidad de reproducir el pipeline original de Piper. La variante `x_low` indica una configuración de muy baja carga computacional, pensada para entornos con recursos limitados o inferencia en tiempo real en CPU.

No se dispone de información sobre el número de parámetros, la longitud de contexto (no aplica a TTS) ni datos de entrenamiento en la documentación proporcionada. El repositorio tiene un tamaño declarado de 0.0 GB y registra 0 descargas y 0 likes en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VITS |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo text-to-speech) |
| Tipos de cuantizacion | no disponible (pesos distribuidos en ONNX) |
| Idiomas soportados | nepalí (ne-NP) |
| Licencia | MIT |
| Formato de pesos | ONNX |
| Entrada de texto | fonemas espeak, alfabeto IPA |
| Variante | x_low (baja carga computacional) |
| Librería | phoonnx |
| Pipeline | text-to-speech |

## Arquitectura y entrenamiento

VITS (Variational Inference with adversarial learning for end-to-end Text-to-Speech) es una arquitectura de síntesis de voz extremo a extremo que combina un codificador de texto, un prior variacional, un decodificador generativo y un discriminador adversarial entrenado con pérdidas de reconstrucción y de confrontación. Este modelo concreto proviene del catálogo de voces de Piper (`rhasspy/piper-voices/ne/ne_NP/google/x_low`), donde la etiqueta `google` hace referencia a la fuente de datos o voz de referencia utilizada en el entrenamiento original y `x_low` a la configuración de calidad reducida.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de RLHF o ajuste fino adicional. La entrada del modelo no es texto crudo, sino fonemas generados por espeak-ng en alfabeto IPA; Phoonnx delega esta conversión en la librería `scriptconv` (phonemizer `EspeakPhonemizer` del módulo `scriptconv_copyleft.phonemizers.mul`). Esta dependencia de espeak-ng implica que la calidad de la fonemización afecta directamente a la pronunciación resultante.

## Capacidades

- Síntesis de voz en nepalí (ne-NP) a partir de texto, con salida en audio WAV.
- Conversión de texto a fonemas IPA mediante espeak-ng como front-end.
- Ejecución local en formato ONNX, sin dependencia de servicios en la nube.
- Integración con el ecosistema OVOS/Mycroft mediante el plugin `ovos-tts-plugin-phoonnx`.
- Uso en navegador a través de phoonnx.js (con entrada espeak o unicode).
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso: es un modelo exclusivamente de TTS.
- No soporta visión, audio de entrada ni modo de razonamiento (thinking).
- Capacidad multilingüe limitada al nepalí; no se documentan otras lenguas.

## Casos de uso

- Asistentes de voz en nepalí: el modelo puede integrarse en OVOS/Mycroft seleccionando la voz `piper/ne_NP-google-x_low` en `mycroft.conf`, permitiendo respuestas habladas en local sin enviar texto a servidores externos.
- Lectores de pantalla y accesibilidad: al ser un modelo ONNX ligero, puede ejecutarse en equipos de gama baja o en dispositivos embebidos para leer texto en nepalí en tiempo real.
- Kioscos y sistemas de información pública: síntesis de anuncios o instrucciones en nepalí en entornos con conectividad limitada, aprovechando la inferencia local.
- Aplicaciones educativas de aprendizaje de idiomas: generación de pronunciaciones de referencia en nepalí a partir de texto, útil para materiales didácticos.
- Integración web: mediante phoonnx.js, el modelo puede ejecutarse en el navegador para demos o aplicaciones de TTS sin backend, usando la entrada espeak o unicode.
- Prototipado de pipelines de voz: al estar empaquetado para phoonnx con una API Python sencilla (`TTSModelManager` y `voice.synthesize_wav`), sirve para validar flujos de TTS antes de invertir en voces de mayor calidad.
- Automatización de contenidos en nepalí: conversión por lotes de artículos o documentos a audio para podcasts o boletines, con la ventaja de no requerir GPU.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; al ser un modelo VITS en variante `x_low` y en formato ONNX, se espera que quepa en CPU y en GPU de gama baja, pero no se documentan cifras concretas.
- GPU recomendadas: no disponible; no se especifican modelos de GPU en la documentación.
- Compatibilidad con GPU de consumo: no disponible; la variante `x_low` sugiere que está pensada para ejecución ligera, posiblemente en CPU.
- Opciones de despliegue: phoonnx (Python), plugin `ovos-tts-plugin-phoonnx` para OVOS/Mycroft, y phoonnx.js en el navegador.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Arquitectura | Idioma | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| vits-ne_np-google-x_low-espeak | VITS | ne-NP | MIT | ONNX | Hugging Face (Phoonnx) |
| Otras voces Piper ne_NP (p. ej. variantes `low`/`medium`) | VITS | ne-NP | MIT (según Piper) | ONNX | Hugging Face (rhasspy/piper-voices) |
| Otras voces de la colección VITS de Phoonnx | VITS | varios | MIT (según upstream) | ONNX | Hugging Face (Phoonnx) |

No se dispone de datos de rendimiento comparativo (MOS, latencia, WER) entre estas alternativas en la información proporcionada.

## Limitaciones y advertencias

- El modelo solo cubre nepalí (ne-NP); no es multilingüe.
- La calidad de pronunciación depende de espeak-ng: si se usa el port espyak, algunos fonemas difieren y el modelo puede pronunciar mal ciertas palabras, tal como advierte la model card.
- La variante `x_low` implica menor calidad de audio que variantes superiores de Piper; no se documentan métricas objetivas.
- Riesgo de alucinación no aplica en el sentido de generación de texto, pero sí puede producir pronunciaciones incorrectas o inteligibles ante entradas fuera de dominio o fonemización defectuosa.
- Licencia MIT: permite uso comercial, pero la model card indica que la licencia se declara en el modelo upstream (`rhasspy/piper-voices`); conviene verificar los términos de la fuente original.
- El repositorio tiene 0 descargas y 0 likes, lo que sugiere poca validación comunitaria; no hay evidencia pública de robustez en producción.
- No se documentan sesgos conocidos ni restricciones adicionales de uso.
- La dependencia de espeak-ng y de `scriptconv` añade requisitos de instalación que deben gestionarse en despliegues.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Phoonnx/vits-ne_np-google-x_low-espeak
- Upstream Piper: https://huggingface.co/rhasspy/piper-voices/tree/main/ne/ne_NP/google/x_low
- Repositorio phoonnx: https://github.com/TigreGotico/phoonnx
- Repositorio scriptconv: https://github.com/TigreGotico/scriptconv
- Repositorio phoonnx.js: https://github.com/TigreGotico/phoonnx.js
- Demo en vivo: https://tigregotico.pt/demo
- Colección VITS de Phoonnx: https://huggingface.co/collections/Phoonnx/vits-6af8ea9ae9adb8b94ec31a65
