# Phoonnx/vits-pl_pl-m_ailabs-low-espeak

## Resumen

El modelo `vits-pl_pl-m_ailabs-low-espeak` es un sistema de síntesis de voz (text-to-speech) basado en la arquitectura VITS, desarrollado originalmente por Mycroft AI para su proyecto Mimic3 y empaquetado por Phoonnx en formato ONNX para su librería de TTS. El modelo convierte texto en polaco (`pl-PL`) a audio inteligible, tomando como entrada fonemas generados por espeak-ng en alfabeto IPA. Su relevancia radica en que ofrece una voz sintética ligera (0,1 GB de repositorio) ejecutable en entornos con recursos limitados, integrable tanto en Python como en asistentes de voz OVOS.

La arquitectura VITS combina un codificador de texto, un prior variacional y un decodificador basado en flujos normalizadores, junto con un discriminador adversarial durante el entrenamiento. Esta variante concreta se etiqueta como "low", lo que indica una configuración de menor capacidad orientada a inferencia rápida y bajo consumo de memoria. El modelo está pensado para aplicaciones de lectura de texto, asistentes domésticos y sistemas embebidos que requieran síntesis en polaco sin depender de servicios en la nube.

El modelo se distribuye bajo licencia CC-BY-SA-4.0 y se integra en el ecosistema Phoonnx/OVOS mediante el plugin `ovos-tts-plugin-phoonnx`. Al estar empaquetado en ONNX y depender de espeak-ng para la fonemización, su despliegue es reproducible en CPU sin necesidad de GPU, lo que lo hace adecuado para plataformas de bajo coste y despliegues offline.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VITS (end-to-end TTS, variacional adversarial con flujos) |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo TTS, sin contexto de texto) |
| Tipos de cuantizacion | no disponible (solo pesos ONNX empaquetados) |
| Idiomas soportados | polaco (`pl-PL`) |
| Licencia | CC-BY-SA-4.0 |
| Formato de pesos | ONNX |
| Entrada de texto | fonemas espeak-ng en alfabeto IPA |
| Tamano del repositorio | 0,1 GB |
| Autor original | Mycroft AI (Mimic3) |
| Empaquetado por | Phoonnx |

## Arquitectura y entrenamiento

VITS es una arquitectura de síntesis de voz end-to-end que integra un codificador de texto, un prior variacional condicionado a la duración fonética, un decodificador basado en flujos normalizadores inversos y un discriminador adversarial multiperiodo durante el entrenamiento. La variante "low" de este paquete corresponde a una configuración de menor capacidad que prioriza velocidad de inferencia y bajo uso de memoria frente a la fidelidad acústica máxima. El modelo toma fonemas IPA generados por espeak-ng como entrada, lo que desplaza la responsabilidad de la normalización textual al front-end (`scriptconv`), y produce audio muestreado a la frecuencia configurada en el propio modelo (no especificada en la información disponible).

No se dispone de detalles sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO. El modelo original procede del repositorio `mimic3-voices` de Mycroft AI, que aloja voces entrenadas con corpus AILABS para distintas lenguas. La información disponible no detalla innovaciones técnicas adicionales más allá del empaquetado ONNX y la integración con el ecosistema Phoonnx.

## Capacidades

- Síntesis de voz a partir de texto en polaco (`pl-PL`), con salida en formato WAV.
- Conversión de texto a fonemas IPA mediante espeak-ng (o el port espyak) antes de la síntesis.
- Ejecución en CPU mediante ONNX Runtime, sin requisito de GPU.
- Integración con asistentes OVOS a través de `ovos-tts-plugin-phoonnx`.
- Uso en navegador mediante `phoonnx.js` (según la documentación del proyecto).
- Lectura de texto arbitrario en polaco (no limitado a dominios concretos), sujeto a la calidad de la fonemización.
- No soporta tool calling, agentes, razonamiento multi-paso ni otras capacidades de modelos de lenguaje: es exclusivamente un modelo TTS.

## Casos de uso

- Lectura de artículos y documentos en polaco: el modelo convierte texto plano en audio mediante `voice.synthesize_wav`, adecuado para aplicaciones de accesibilidad y lectura por voz en escritorio o servidor.
- Asistentes de voz domésticos con OVOS: se selecciona la voz en `mycroft.conf` mediante el plugin `ovos-tts-plugin-phoonnx` y el modelo responde a comandos y consultas en polaco de forma local, sin depender de servicios en la nube.
- Sistemas embebidos y dispositivos de bajo coste: el tamaño de 0,1 GB y la ejecución en CPU permiten desplegarlo en Raspberry Pi u otros SBC con memoria limitada.
- Generación de audiolibros o podcasts automatizados en polaco: el modelo sintetiza pasajes largos fragmento a fragmento, con latencia baja por frase.
- Interfaces de voz para aplicaciones web: `phoonnx.js` permite ejecutar la voz en el navegador, útil para demos y aplicaciones interactivas sin backend de TTS.
- Pruebas y desarrollo de pipelines TTS multilingües: sirve como voz de referencia en polaco dentro de un sistema que combine varias voces VITS de la colección Phoonnx.
- Automatización de avisos y notificaciones habladas: integrable en scripts Python que generen avisos en polaco bajo demanda.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica de forma estricta; el modelo está empaquetado en ONNX y pensado para ejecución en CPU. El repositorio ocupa 0,1 GB, por lo que la huella en memoria es reducida (del orden de cientos de MB incluyendo runtime).
- GPU recomendadas: no se especifican; el modelo no requiere GPU. Cualquier GPU compatible con ONNX Runtime (por ejemplo, RTX 4090, A100) podría ejecutarlo, pero no aporta ventajas significativas frente a CPU para este tamaño.
- Compatibilidad con GPU de consumo: sí, cabe holgadamente en cualquier GPU de consumo, aunque su uso típico es en CPU.
- Opciones de despliegue: `phoonnx` (Python), `ovos-tts-plugin-phoonnx` (OVOS), `phoonnx.js` (navegador). No se menciona soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a modelos TTS de este tipo.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Arquitectura | Idioma | Tamano repo | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|---|
| vits-pl_pl-m_ailabs-low-espeak (este) | VITS low | pl-PL | 0,1 GB | CC-BY-SA-4.0 | ONNX | Hugging Face (Phoonnx) |
| Otras voces VITS de la colección Phoonnx | VITS | varios | variable | variable (segun voz) | ONNX | Hugging Face (Phoonnx) |
| Voces Mimic3 originales (Mycroft AI) | VITS | varios | variable | CC-BY-SA-4.0 (upstream) | varios | GitHub mimic3-voices |

No se dispone de datos de rendimiento comparativo (MOS, latencia, WER) en la información proporcionada para establecer una comparación cuantitativa con alternativas.

## Limitaciones y advertencias

- Solo soporta polaco (`pl-PL`); no está entrenado para otras lenguas.
- La calidad de la síntesis depende de la fonemización con espeak-ng; el uso del port espyak puede producir errores de pronunciación en algunas palabras, según advierte la propia model card.
- Es una variante "low": la fidelidad acústica y naturalidad son inferiores a configuraciones de mayor capacidad.
- No se han publicado métricas objetivas (MOS, WER, latencia) que permitan evaluar su calidad de forma cuantitativa.
- Licencia CC-BY-SA-4.0: permite uso comercial, pero exige atribución y compartir bajo la misma licencia las obras derivadas; conviene revisar las implicaciones para productos propietarios.
- Riesgo de alucinación acústica y errores de pronunciación en palabras fuera del dominio de entrenamiento o en textos con abreviaturas y símbolos no normalizados.
- No es un modelo de lenguaje: no razona, no responde preguntas ni ejecuta herramientas; su única función es convertir texto en audio.
- Dependencia de espeak-ng instalado en el sistema para el front-end fonético.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Phoonnx/vits-pl_pl-m_ailabs-low-espeak
- Repositorio upstream (Mycroft AI, mimic3-voices): https://github.com/MycroftAI/mimic3-voices/tree/master/voices/pl_PL/m-ailabs_low
- Librería phoonnx: https://github.com/TigreGotico/phoonnx
- Librería scriptconv: https://github.com/TigreGotico/scriptconv
- phoonnx.js (navegador): https://github.com/TigreGotico/phoonnx.js
- Demo en vivo: https://tigregotico.pt/demo
- Colección VITS de Phoonnx: https://huggingface.co/collections/Phoonnx/vits-6af8ea9ae9adb8b94ec31a65
