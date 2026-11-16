# Phoonnx/f5tts-tw-asante_openbible-graphemes

## Resumen

Phoonnx/f5tts-tw-asante_openbible-graphemes es un modelo de síntesis de voz (text-to-speech) para el idioma twi (código `tw`), empaquetado en formato ONNX por Phoonnx a partir del modelo original multilingual-tts/F5-TTS-OpenBible-Twi-Asante. El modelo subyacente emplea la arquitectura F5-TTS, un sistema de TTS no autorregresivo basado en flow matching con decodificación por difusión, y ha sido adaptado al dominio del texto bíblico (OpenBible) para el twi asante. El empaquetado lo realiza Phoonnx, una biblioteca de TTS en ONNX orientada a su uso en Python y en el ecosistema OVOS (asistentes de voz open source).

El modelo resuelve la necesidad de disponer de una voz TTS ligera, ejecutable en CPU mediante ONNX Runtime, para una lengua de bajos recursos como el twi, hablada principalmente en Ghana. Al estar empaquetado en ONNX, se puede desplegar sin depender de PyTorch ni de GPUs dedicadas, lo que facilita su integración en asistentes de voz locales y aplicaciones de accesibilidad.

La relevancia actual del modelo es acotada: se trata de un artefacto de nicho con 21 descargas y sin likes, orientado a un idioma concreto y a un dominio de entrenamiento específico (texto bíblico). No se dispone de información publicada sobre benchmarks, calidad subjetiva (MOS) ni datos de entrenamiento detallados más allá de lo indicado en la model card.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | F5-TTS (TTS no autorregresivo con flow matching) |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | tw (twi) |
| Licencia | cc-by-sa-4.0 |
| Formato de pesos | ONNX (empaquetado para la librería phoonnx) |

## Arquitectura y entrenamiento

El modelo se basa en F5-TTS, una arquitectura de síntesis de voz no autorregresiva que combina un modelo de flujo (flow matching) con un decodificador por difusión para generar mel-espectrogramas a partir de texto y una referencia de audio. F5-TTS se caracteriza por no requerir alineamientos fonéticos explícitos ni duraciones predefinidas, y por emplear un esquema de relleno (padding) de tokens que permite generar audio de longitud variable. El modelo original del que deriva este empaquetado es multilingual-tts/F5-TTS-OpenBible-Twi-Asante, entrenado sobre el corpus OpenBible en twi asante.

No se dispone de información publicada sobre el número de tokens de entrenamiento, la composición exacta del dataset, ni si se aplicaron técnicas de RLHF o DPO. El nombre del modelo indica el uso de "graphemes" (grafemas) en lugar de fonemas como unidad de entrada, lo que implica que el texto se procesa a nivel de carácter en lugar de mediante un fonemizador específico del idioma. El empaquetado en ONNX lo realiza Phoonnx y no se detalla si se aplicaron optimizaciones adicionales como cuantización o pruning.

## Capacidades

- Síntesis de voz (text-to-speech) a partir de texto en twi (twi asante).
- Generación de audio condicionada por una referencia de voz (zero-shot voice cloning), capacidad inherente a la arquitectura F5-TTS, aunque no se documenta explícitamente en la model card.
- Entrada basada en grafemas, sin necesidad de fonemizador específico del idioma.
- Ejecución mediante ONNX Runtime en la librería phoonnx.
- Integración con OVOS (asistente de voz open source) según la model card.
- No se documenta soporte de tool calling, agentes, razonamiento multietapa ni otras capacidades más allá de la síntesis de voz.
- No se documentan capacidades multilingües más allá del twi.

## Casos de uso

- Asistentes de voz en twi: el modelo puede integrarse en OVOS para proporcionar respuestas habladas en twi asante, aprovechando el empaquetado ONNX para ejecución local sin GPU.
- Lectura de textos bíblicos: dado que el modelo se entrenó sobre el corpus OpenBible, es adecuado para la lectura automatizada de pasajes bíblicos en twi, un caso de uso alineado con el dominio de entrenamiento.
- Accesibilidad para hablantes de twi: conversión de texto a voz para personas con discapacidad visual o dificultades de lectura, ejecutándose en dispositivos de bajos recursos gracias al formato ONNX.
- Aplicaciones educativas: generación de audio para materiales de aprendizaje del twi, como vocabulario o frases de ejemplo.
- Contenido multimedia de bajo coste: producción de narraciones en twi para vídeos, pódcast o audiolibros sin necesidad de grabación humana.
- Investigación en TTS de bajos recursos: el modelo sirve como punto de partida para experimentos de adaptación de F5-TTS a lenguas con pocos datos, al estar empaquetado y disponible en ONNX.
- Preservación lingüística: generación de audio en twi para archivos y proyectos de documentación de la lengua.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. Al ser un modelo empaquetado en ONNX y ejecutable con ONNX Runtime, es probable que funcione en CPU, pero no se especifican requisitos.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible; el formato ONNX sugiere que puede ejecutarse en CPU sin GPU dedicada.
- Opciones de despliegue: librería phoonnx (Python y OVOS) con ONNX Runtime.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Idioma | Arquitectura | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Phoonnx/f5tts-tw-asante_openbible-graphemes | tw | F5-TTS | ONNX | cc-by-sa-4.0 | Hugging Face, 21 descargas |
| multilingual-tts/F5-TTS-OpenBible-Twi-Asante | tw | F5-TTS | no disponible | cc-by-sa-4.0 | Hugging Face (modelo original) |
| Otros modelos F5-TTS de la colección Phoonnx | varios | F5-TTS | ONNX | varía | Hugging Face (colección Phoonnx) |

No se dispone de datos de rendimiento para establecer una comparación cuantitativa con alternativas.

## Limitaciones y advertencias

- Dominio de entrenamiento restringido: el modelo se entrenó sobre el corpus OpenBible, por lo que su calidad fuera del registro bíblico puede degradarse.
- Idioma único: solo soporta twi (tw); no se documentan capacidades multilingües.
- Sin datos de evaluación: no hay benchmarks, métricas de calidad (MOS) ni comparaciones publicadas que permitan validar su rendimiento en producción.
- Licencia cc-by-sa-4.0: permite uso comercial, pero exige atribución y compartir las obras derivadas bajo la misma licencia, lo que puede ser restrictivo para productos propietarios.
- Riesgo de alucinación y artefactos: como todo modelo generativo de audio, puede producir pronunciaciones incorrectas o artefactos acústicos, especialmente con texto fuera de dominio.
- Sin información sobre sesgos: no se documentan sesgos de voz, género o dialecto.
- Empaquetado de terceros: el modelo es un empaquetado ONNX realizado por Phoonnx a partir del modelo original de multilingual-tts; no se detallan posibles pérdidas de calidad por la conversión.
- La model card indica que el índice de voces de phoonnx no lista una voz para este modelo, lo que puede complicar su uso directo en esa biblioteca.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Phoonnx/f5tts-tw-asante_openbible-graphemes
- Modelo original: https://huggingface.co/multilingual-tts/F5-TTS-OpenBible-Twi-Asante
- Librería phoonnx: https://github.com/TigreGotico/phoonnx
- scriptconv: https://github.com/TigreGotico/scriptconv
- Colección F5-TTS de Phoonnx: https://huggingface.co/collections/Phoonnx/f5-tts-6af8ea7f407234f6f1f08b30
