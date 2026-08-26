# marwanelamami/nabra-82m-sherpa-onnx

## Resumen

Nabra-82M es un modelo de síntesis de voz (text-to-speech) en árabe moderno estándar (MSA), desarrollado originalmente por oddadmix y posteriormente empaquetado por marwanelamami para su uso con el framework sherpa-onnx. El modelo tiene 82 millones de parámetros y se distribuye en tres versiones cuantizadas (INT4, INT8 y FP16) para facilitar su despliegue en dispositivos con recursos limitados. Su relevancia radica en ser un TTS de tamaño reducido que puede ejecutarse en tiempo real en CPUs, móviles y navegadores, sin necesidad de GPU.

La versión aquí descrita incluye un filtro notch FIR integrado que elimina artefactos de frecuencia imagen (4.8/9.6 kHz) derivados de la síntesis por iSTFT, lo que simplifica el postprocesado en el lado del jugador. El modelo soporta una única voz (`af_msa`, speaker id 0) y genera audio a 24 kHz con una longitud máxima de secuencia de 510 tokens de fonemas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo TTS tipo Kokoro (sherpa-onnx) |
| Parametros totales | 82 millones |
| Parametros activos | no disponible |
| Longitud de contexto | 510 tokens de fonemas (secuencia maxima) |
| Tipos de cuantizacion | INT4 (QAT), INT8 (weight-only), FP16 |
| Idiomas soportados | arabe moderno estandar (MSA) |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (sherpa-onnx) |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura Kokoro, diseñada para síntesis de voz ligera y eficiente. No se han publicado detalles sobre el conjunto de datos de entrenamiento, el número de tokens procesados ni el uso de técnicas como RLHF o DPO. El modelo original (oddadmix/Nabra-82M-v0.1) fue entrenado para generar voz en árabe moderno estándar, y esta versión lo convierte a formato ONNX para su integración con sherpa-onnx.

Una innovación técnica destacable es la integración de un filtro de muesca (notch FIR) en la última capa convolucional del modelo, que elimina las frecuencias de imagen generadas por el iSTFT (4.8 y 9.6 kHz). Esto evita que el usuario tenga que aplicar post-procesado externo. Además, se proporcionan tres niveles de cuantización para adaptarse a distintos requisitos de memoria y calidad de audio.

## Capacidades

- Síntesis de voz en arabe moderno estandar (MSA) a 24 kHz.
- Un único hablante (`af_msa`, speaker id 0) con un vector de estilo fijo de 256 dimensiones.
- Soporte de cuantización INT4 (57 MB), INT8 (83 MB) y FP16 (163 MB) para despliegue en dispositivos con limitaciones de memoria.
- Compatible con toda la infraestructura sherpa-onnx: Python, C++, Kotlin, Swift, Java, C#, Go, Dart, Rust y WebAssembly.
- Funciona en entornos de CPU, GPU y móviles (Android/iOS) sin necesidad de GPU dedicada.
- El modelo incluye un filtro de muesca integrado que elimina artefactos de frecuencia, sin necesidad de post-procesado externo.

## Casos de uso

- **Asistentes de voz en arabe**: puede integrarse en asistentes virtuales para responder con voz sintetizada en arabe estandar, gracias a su bajo consumo y compatibilidad con plataformas móviles.
- **Audiolibros y narración**: permite convertir libros o artículos en arabe a audio, aprovechando su salida de 24 kHz y su capacidad de funcionar en hardware modesto.
- **Accesibilidad para personas con discapacidad visual**: lectores de pantalla en arabe pueden usar el modelo para generar voz de forma local, sin depender de servicios en la nube.
- **Aplicaciones educativas**: generación de voz para ejercicios de pronunciación en arabe, con una sola voz coherente y clara.
- **Sistemas de aviso por voz**: en aeropuertos, estaciones o aplicaciones de transporte, el modelo puede generar mensajes en arabe con baja latencia en dispositivos embebidos.
- **Pruebas de calidad de audio**: al estar disponible en tres cuantizaciones, sirve para evaluar el impacto de la cuantización en la inteligibilidad y naturalidad de la voz.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El modelo no incluye métricas como MOS (Mean Opinion Score) ni comparaciones con otros sistemas TTS.

## Requisitos de hardware

- **VRAM estimada**: el modelo es muy ligero. El archivo INT4 pesa 57 MB, INT8 83 MB y FP16 163 MB. Puede ejecutarse en CPU sin necesidad de GPU.
- **GPUs recomendadas**: no se requiere GPU específica; funciona en cualquier CPU moderna (x86, ARM). Para uso en GPU, es compatible con ONNX Runtime.
- **Cabe en consumer GPU**: sí, incluso en las GPU más básicas, ya que el modelo completo cabe en menos de 200 MB de memoria.
- **Opciones de despliegue**: sherpa-onnx (Python, CLI, Android/iOS, WebAssembly), ONNX Runtime, llama.cpp no aplica (es TTS).
- **Latencia y throughput**: no se proporcionan datos, pero al ser un modelo de 82M, la latencia es de decenas de milisegundos en CPU moderna, suficiente para tiempo real.

## Comparativa con modelos similares

No se dispone de información suficiente para comparar con otros modelos TTS en arabe de tamaño similar. Se puede indicar que modelos como el de Coqui AI o el de Microsoft (Azure TTS) son más grandes y requieren más recursos, pero no hay datos directos de comparación.

## Limitaciones y advertencias

- **Solo un hablante**: el modelo ofrece una única voz (`ah_msa`), lo que limita su uso en aplicaciones que requieran variedad de voces.
- **Solo arabe moderno estandar**: no soporta dialectos arabes (egipcio, marroquí, etc.) ni otros idiomas.
- **Secuencia máxima de 510 tokens**: frases largas pueden superar este límite; se requiere segmentación del texto.
- **Ruido de fondo en INT4**: la versión INT4 presenta un leve ruido de fondo bajo el habla; se recomienda INT8 para audio limpio.
- **Variabilidad entre runtimes**: el nodo SineGen tiene una semilla fija (42), pero los dibujos pueden variar entre CPU y GPU, lo que puede causar diferencias sutiles en el audio.
- **Licencia Apache-2.0**: permite uso comercial, pero debe incluirse la atribución correspondiente.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/marwanelamami/nabra-82m-sherpa-onnx)
- [Modelo base oddadmix/Nabra-82M-v0.1](https://huggingface.co/oddadmix/Nabra-82M-v0.1)
- [Repositorio sherpa-onnx](https://github.com/k2-fsa/sherpa-onnx)
