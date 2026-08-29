# JayLL13/piper-voice-test-1

## Resumen

El modelo `JayLL13/piper-voice-test-1` es una voz de síntesis de texto a voz (TTS) para el idioma vietnamita, generada mediante fine-tuning sobre un checkpoint base de Piper. Piper es un motor de síntesis neuronal ligero y de código abierto, desarrollado originalmente por el proyecto Rhasspy, que permite ejecutar TTS de alta calidad en CPU, incluso en dispositivos de bajo consumo como Raspberry Pi. Este modelo concreto ha sido entrenado con la herramienta TiengNoi Studio, partiendo de una voz masculina en inglés (`en_US/hfc_male/medium`) y adaptándola al vietnamita con un dataset propio del autor.

El modelo se distribuye en formato ONNX junto con su archivo de configuración JSON, listo para ser utilizado con la librería `piper-tts`. Al ser una voz de prueba (el nombre `test1` lo indica), su calidad y cobertura son limitadas, pero sirve como ejemplo de flujo de fine-tuning para voces vietnamitas. La licencia GPL-3.0 permite su uso, modificación y redistribución bajo los términos de dicha licencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VITS (Variational Inference with adversarial Training for end-to-end Text-to-Speech) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo TTS, no genera texto) |
| Tipos de cuantizacion | no disponible (formato ONNX, sin cuantizacion declarada) |
| Idiomas soportados | vietnamita (`vi`) |
| Licencia | GPL-3.0 |
| Formato de pesos | ONNX (`.onnx`) + config JSON |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura VITS, que combina un codificador de texto, un decodificador de onda y un discriminador adversarial, entrenado de extremo a extremo para síntesis de voz. VITS es conocida por producir audio natural con una latencia baja y un tamaño de modelo reducido, lo que lo hace adecuado para despliegue en CPU.

El entrenamiento se realizó mediante fine-tuning desde el checkpoint `en_US/hfc_male/medium` de Piper, que ya tenía una calidad de audio de 22050 Hz (calidad media). El dataset de entrenamiento es `JayLL13/dataset-test-1`, también alojado en HuggingFace, y se ejecutaron 2 épocas como máximo. No se especifican detalles sobre el número de horas de audio, la composición del dataset ni si se aplicaron técnicas adicionales como RLHF o DPO (no aplicables a TTS). El proceso fue generado por TiengNoi Studio, una herramienta que facilita el pipeline de fine-tuning para voces Piper.

## Capacidades

- Síntesis de voz en vietnamita a partir de texto, con una frecuencia de muestreo de 22050 Hz.
- Generación de audio en formato WAV mediante la API de Piper (línea de comandos o Python).
- Inferencia local y offline, sin necesidad de conexión a internet.
- Ejecución eficiente en CPU, típica de los modelos Piper.
- Soporte de configuración de inferencia a través del archivo JSON (fonemas, sample rate, parámetros de síntesis).
- No incluye capacidades de razonamiento, código, visión ni tool calling, al ser exclusivamente un modelo TTS.

## Casos de uso

- Lectura de textos en vietnamita para aplicaciones de accesibilidad: el modelo puede convertir artículos, libros o noticias en audio, permitiendo a personas con discapacidad visual consumir contenido en su idioma.
- Asistentes de voz en vietnamita: integrable en asistentes locales o chatbots que necesiten respuesta hablada, gracias a su bajo consumo de recursos y ejecución en CPU.
- Audioguías y contenido educativo: generación de narraciones para cursos, podcasts o guías turísticas en vietnamita, sin depender de servicios cloud de pago.
- Pruebas de concepto y prototipado: al ser una voz de prueba, es útil para validar flujos de TTS en vietnamita antes de invertir en un modelo comercial.
- Sistemas de aviso y notificación por voz: en entornos industriales o domésticos, donde se requiera emitir mensajes hablados en vietnamita desde un dispositivo embebido (Raspberry Pi, etc.).
- Investigación en TTS multilingüe: sirve como ejemplo de fine-tuning de una voz inglesa a vietnamita, permitiendo estudiar la transferencia entre idiomas en modelos VITS.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No existen métricas objetivas como MOS (Mean Opinion Score), WER (Word Error Rate) o comparaciones con otros modelos TTS en la documentación del repositorio.

## Requisitos de hardware

- Al ser un modelo ONNX de tamaño reducido (repo de 0.1 GB), la inferencia es viable en CPU convencional, sin necesidad de GPU.
- VRAM estimada: no aplica (inferencia en CPU).
- GPU recomendada: no necesaria; cualquier CPU moderna con soporte para operaciones ONNX es suficiente.
- Compatible con Raspberry Pi y otros dispositivos de bajo consumo, según las características generales de Piper.
- Opciones de despliegue: librería `piper-tts` (Python), CLI `python -m piper`, o integración con servidores de inferencia como `piper-server` (no confirmado para este modelo específico).
- Latencia y throughput: no disponibles, pero los modelos Piper suelen generar audio en tiempo real o más rápido en CPU de gama media.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables específicos para vietnamita en el ecosistema Piper. Alternativas genéricas de TTS para vietnamita incluyen servicios comerciales como Google Cloud TTS o modelos de código abierto como Coqui TTS, pero no hay datos de rendimiento comparables en la información proporcionada. Por tanto, la comparativa no está disponible.

## Limitaciones y advertencias

- Es una voz de prueba (`test1`), por lo que la calidad de audio puede ser inferior a la de voces comerciales o modelos más entrenados.
- El entrenamiento se limitó a 2 épocas, lo que puede provocar una pronunciación imperfecta o artefactos en ciertos textos.
- El modelo se fine-tuneó desde una voz en inglés, lo que puede introducir acentos o errores fonéticos en vietnamita, especialmente en tonos (el vietnamita es una lengua tonal).
- La licencia GPL-3.0 implica que cualquier uso, modificación o redistribución debe mantener la misma licencia, lo que puede ser restrictivo para integraciones en software propietario.
- No se especifican sesgos conocidos, pero al ser un modelo entrenado con un dataset limitado, puede tener un rendimiento deficiente con vocabulario técnico, nombres propios o dialectos regionales.
- No hay garantía de soporte o mantenimiento por parte del autor; es un proyecto personal.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/JayLL13/piper-voice-test-1
- Dataset de entrenamiento: https://huggingface.co/datasets/JayLL13/dataset-test-1
- Documentación de Piper: https://tderflinger.github.io/piper-docs/
- Guía de entrenamiento de Piper: https://tderflinger.github.io/piper-docs/guides/training/
- Repositorio original de Piper (Rhasspy): https://github.com/rhasspy/piper
- Perfil de GitHub del autor: https://github.com/jayll1303
