# Phoonnx/f5tts-tw-asante_openbible-graphemes

## Resumen

f5tts-tw-asante_openbible-graphemes es un modelo de síntesis de voz (text-to-speech) basado en la arquitectura F5-TTS, desarrollado originalmente por multilingual-tts y empaquetado por Phoonnx en formato ONNX para su uso con la librería phoonnx. El modelo está especializado en twi (código de idioma `tw`), una lengua hablada en Ghana, y se ha entrenado a partir del corpus OpenBible en su variante Asante. Su propósito es generar audio inteligible en twi a partir de texto, cubriendo un nicho lingüístico con escasa representación en los sistemas TTS comerciales.

El empaquetado incluye grafos ONNX separados para preprocesado, modelo principal y decodificación, con versiones en fp32 e int8. El repositorio ocupa 1,8 GB e incluye los pesos en ambos formatos. La licencia es CC BY-SA 4.0, lo que permite uso comercial con atribución y compartir-al-igual.

La relevancia actual radica en la disponibilidad de un TTS ligero y ejecutable en CPU para una lengua de bajos recursos, con métricas de rendimiento publicadas (factor de tiempo real de 8,7 en int8 sobre un Ryzen 5 7600), lo que lo hace apto para despliegues en entornos sin GPU.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | F5-TTS (basada en flow matching y transformer, según la colección F5-TTS) |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | fp32 e int8 (cuantización dinámica de onnxruntime sobre nodos MatMul y Gemm) |
| Idiomas soportados | twi (`tw`) |
| Licencia | CC BY-SA 4.0 |
| Formato de pesos | ONNX (`model.onnx`, `F5_Preprocess.onnx`, `F5_Decode.onnx`; variantes `_int8`) |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura F5-TTS, un sistema de síntesis de voz basado en flow matching que genera mel-espectrogramas a partir de texto y los convierte en audio mediante un vocoder. El empaquetado para phoonnx divide el grafo en tres etapas ONNX: preprocesado (`F5_Preprocess`), modelo principal (`model`) y decodificación (`F5_Decode`), lo que permite ejecutar la inferencia de forma modular con onnxruntime.

El entrenamiento se realizó sobre el corpus OpenBible en twi (variante Asante), según indica el nombre del modelo y su procedencia del repositorio upstream `multilingual-tts/F5-TTS-OpenBible-Twi-Asante`. No se dispone de información sobre el número de tokens, la composición exacta del dataset, ni si se aplicaron técnicas de RLHF o DPO. La model card no detalla innovaciones técnicas adicionales más allá del propio empaquetado ONNX y la cuantización int8.

## Capacidades

- Síntesis de voz (text-to-speech) en twi a partir de texto de entrada.
- Generación de audio con calidad verificada frente a la versión fp32: la distancia mel-cepstral del audio int8 es 1,17 veces la distancia entre dos ejecuciones fp32, lo que indica una degradación mínima por cuantización.
- Ejecución en CPU sin necesidad de GPU, con un factor de tiempo real de 8,709 en int8 y 18,740 en fp32 (medido en AMD Ryzen 5 7600 con 4 hilos).
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, visión, audio de entrada ni modo thinking.
- Capacidad multilingüe limitada al twi; no se declaran otros idiomas.

## Casos de uso

- **Locución automatizada para contenidos en twi**: el modelo puede generar narraciones de texto en twi para vídeos, audiolibros o podcasts, aprovechando su ejecución en CPU y su bajo consumo de memoria (879 MiB en int8).
- **Accesibilidad para hablantes de twi**: conversión de texto a voz para lectores de pantalla o interfaces de accesibilidad en aplicaciones dirigidas a comunidades ghanesas, donde el soporte TTS comercial es escaso.
- **Sistemas de respuesta por voz en atención al cliente**: integración en IVR o asistentes telefónicos que necesiten responder en twi, con inferencia en servidores sin GPU gracias al factor de tiempo real de 8,7 en int8.
- **Digitalización de contenido bíblico y educativo**: el modelo se entrenó con OpenBible, por lo que es adecuado para narrar pasajes bíblicos o material educativo en twi, manteniendo coherencia con el dominio de entrenamiento.
- **Prototipado rápido de aplicaciones de voz**: el empaquetado ONNX y la librería phoonnx permiten integrar el modelo en Python y en OVOS con pocas líneas de código, ideal para pruebas de concepto en entornos de desarrollo.
- **Despliegue en dispositivos de bajos recursos**: con 388,2 MB en int8 y 879 MiB de memoria pico, puede ejecutarse en mini-PC, Raspberry Pi o contenedores ligeros para señalización o anuncios en twi.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card únicamente proporciona métricas de tamaño, memoria y velocidad:

| Precisión | Tamaño | Memoria pico | Factor de tiempo real |
|---|---|---|---|
| fp32 | 1.417,5 MB | 2.250 MiB | 18,740 |
| int8 | 388,2 MB | 879 MiB | 8,709 |

Mediciones realizadas en AMD Ryzen 5 7600 con 4 hilos; el factor de tiempo real es la mediana de 3 ejecuciones.

## Requisitos de hardware

- **VRAM estimada**: no aplica para ejecución en CPU; en GPU no se han publicado requisitos. La memoria pico en CPU es de 2.250 MiB en fp32 y 879 MiB en int8.
- **GPU recomendadas**: no disponible; el modelo está empaquetado para onnxruntime y las mediciones publicadas son en CPU.
- **¿Cabe en GPU de consumo?**: no se dispone de datos de ejecución en GPU; por tamaño (1,4 GB fp32), cabría en cualquier GPU con más de 2 GB de VRAM si se ejecuta con onnxruntime-gpu, aunque no está verificado.
- **Opciones de despliegue**: phoonnx (Python y OVOS) con onnxruntime; no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI.
- **Latencia y throughput**: factor de tiempo real de 18,740 en fp32 y 8,709 en int8 sobre AMD Ryzen 5 7600 con 4 hilos (menor es más rápido).

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables de TTS en twi en la documentación proporcionada. Se indica "no disponible".

## Limitaciones y advertencias

- **Idioma único**: solo soporta twi (`tw`); no se declaran otros idiomas, por lo que no es adecuado para aplicaciones multilingües.
- **Dominio de entrenamiento restringido**: al haberse entrenado con OpenBible, puede presentar sesgos de dominio y un rendimiento inferior en textos fuera del registro bíblico o religioso.
- **Riesgo de alucinación**: no se documenta, pero como todo modelo generativo de audio, puede producir pronunciaciones incorrectas o artefactos en palabras fuera del vocabulario de entrenamiento.
- **Licencia CC BY-SA 4.0**: permite uso comercial con atribución y obliga a compartir las obras derivadas bajo la misma licencia; es necesario revisar las implicaciones para productos propietarios.
- **Sin datos de benchmarks**: no hay métricas objetivas de calidad (MOS, WER) publicadas, lo que dificulta evaluar su rendimiento frente a alternativas.
- **Índice de voces**: la model card indica que el índice de voces de phoonnx no lista una voz para este modelo, lo que puede complicar su uso directo sin configuración manual.
- **Cuantización int8**: aunque la degradación es baja (1,17 veces la distancia entre ejecuciones fp32), existe una pérdida de calidad respecto a fp32 que debe valorarse en producción.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/Phoonnx/f5tts-tw-asante_openbible-graphemes)
- [Modelo upstream: multilingual-tts/F5-TTS-OpenBible-Twi-Asante](https://huggingface.co/multilingual-tts/F5-TTS-OpenBible-Twi-Asante)
- [Colección F5-TTS de Phoonnx](https://huggingface.co/collections/Phoonnx/f5-tts-6af8ea7f407234f6f1f08b30)
- [Repositorio phoonnx](https://github.com/TigreGotico/phoonnx)
- [Repositorio scriptconv](https://github.com/TigreGotico/scriptconv)
