# nguyendinhquoc/pho-whisper-small-onnx-int8

## Resumen

PhoWhisper-small ONNX INT8 es una exportación del modelo de reconocimiento automático del habla (ASR) PhoWhisper-small, desarrollado por VinAI Research, a formato ONNX con cuantización mixta (encoder INT8 dinámico y decoder INT4 por bloques). El objetivo es permitir la inferencia en dispositivos móviles Android, como parte de un teclado virtual llamado Outspoke. El modelo base, PhoWhisper-small, es un fine-tuning del Whisper multilingüe de OpenAI sobre 844 horas de audio vietnamita con diversos acentos, logrando resultados de última generación en conjuntos de datos de referencia vietnamitas.

Esta versión cuantizada reduce significativamente el tamaño y la carga computacional, manteniendo una ventana de audio de 30 segundos y un vocabulario multilingüe de 51 865 tokens. Está pensada para aplicaciones on-device donde la latencia y el consumo de recursos son críticos. La licencia BSD-3-Clause permite uso comercial con atribución.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder-decoder Transformer (Whisper) |
| Parametros totales | no disponible (modelo base PhoWhisper-small, ~244 M) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 30 segundos de audio (3000 frames de mel, 80 bins) |
| Tipos de cuantizacion | Encoder: INT8 dinámico (MatMul/Gemm); Decoder: INT4 weight-only block-128 (MatMulNBits, accuracy_level=4) |
| Idiomas soportados | vietnamita (vi) |
| Licencia | BSD-3-Clause |
| Formato de pesos | ONNX (encoder_model_int8.onnx, decoder_model_merged_int4.onnx, tokenizer.json) |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura Whisper: un encoder que procesa características mel de 80 bins y 3000 frames (30 segundos) y produce una secuencia de 1500 vectores de 768 dimensiones, y un decoder autorregresivo con 12 cabezas de atención y dimensiones de clave/valor de 64. La exportación ONNX utiliza el formato merged-decoder de Optimum, que integra la rama de caché condicional (If/use_cache_branch) para optimizar la generación secuencial.

El entrenamiento original de PhoWhisper-small consistió en un fine-tuning del Whisper multilingüe sobre un corpus de 844 horas de vietnamita hablado, cubriendo acentos del norte, centro y sur. No se dispone de detalles sobre el proceso de cuantización aplicado en esta exportación, más allá de que se realizó con Optimum (transformers 4.57) y onnxruntime quantization en septiembre de 2026.

## Capacidades

- Reconocimiento automático del habla (ASR) para vietnamita, con robustez frente a variaciones dialectales.
- Transcripción de audio de hasta 30 segundos por ventana.
- Generación de texto con vocabulario multilingüe (51 865 tokens), aunque el modelo está especializado en vietnamita.
- Inferencia on-device gracias a la cuantización mixta INT8/INT4, diseñada para entornos con recursos limitados.
- No se mencionan capacidades de tool calling, agentes, visión ni otros modos más allá de ASR.

## Casos de uso

- Dictado por voz en teclados móviles: el modelo puede transcribir voz vietnamita en tiempo real dentro de una aplicación de teclado, como el proyecto Outspoke, aprovechando su bajo consumo de memoria y su formato ONNX optimizado para Android.
- Transcripción de reuniones o notas de voz: al ejecutarse localmente, permite convertir grabaciones de audio a texto sin conexión, preservando la privacidad de los datos.
- Asistentes de voz en aplicaciones de mensajería: integración en apps de chat para enviar mensajes de texto dictados, con soporte de acentos regionales.
- Accesibilidad para personas con discapacidad motora: permite redactar texto mediante voz en dispositivos móviles de gama baja, gracias a la cuantización ligera.
- Subtitulado automático de vídeos cortos: procesamiento de clips de hasta 30 segundos para generar subtítulos en vietnamita, ideal para redes sociales o contenido educativo.
- Pruebas de concepto de ASR embebido: sirve como referencia para desarrolladores que necesitan evaluar el rendimiento de Whisper cuantizado en hardware móvil antes de desplegar soluciones más grandes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El modelo base PhoWhisper-small reporta un rendimiento de última generación en conjuntos de datos vietnamitas de referencia (según el repositorio oficial), pero no hay datos específicos para esta versión cuantizada ONNX.

## Requisitos de hardware

- Tamaño total del repositorio: 0,3 GB (encoder ~92 MB, decoder ~243 MB, tokenizer 3,6 MB).
- Diseñado para ejecutarse en dispositivos Android con soporte de ONNX Runtime y aceleración por CPU o GPU integrada.
- No se especifican requisitos de VRAM; al ser una versión cuantizada, se espera que quepa en memoria de dispositivos móviles típicos (2-4 GB RAM).
- Opciones de despliegue: ONNX Runtime (ort), con integración posible en aplicaciones Android mediante el paquete `onnxruntime-android`.
- No se dispone de datos de latencia o throughput medidos.

## Comparativa con modelos similares

No se dispone de información suficiente para establecer una comparativa con otros modelos ASR vietnamitas cuantizados. El modelo base PhoWhisper-small se puede comparar con otras variantes de Whisper fine-tuneadas para vietnamita, pero no hay datos de esta versión ONNX.

## Limitaciones y advertencias

- La cuantización INT8/INT4 puede introducir una pérdida de precisión respecto al modelo original en float32, especialmente en condiciones de ruido o acentos poco representados.
- El modelo está especializado en vietnamita; su rendimiento en otros idiomas es probablemente deficiente, aunque el vocabulario sea multilingüe.
- La ventana de contexto fija de 30 segundos limita la transcripción de audio más largo, que debe segmentarse previamente.
- No se han publicado evaluaciones de sesgos o alucinaciones para esta versión; como todo sistema ASR, puede generar transcripciones incorrectas en entornos adversos.
- La licencia BSD-3-Clause permite uso comercial, pero exige incluir el aviso de copyright y la renuncia de responsabilidad en las redistribuciones.
- El formato ONNX está optimizado para el runtime de ONNX; puede requerir adaptaciones si se usa con otros motores de inferencia.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/nguyendinhquoc/pho-whisper-small-onnx-int8
- Repositorio de PhoWhisper (VinAIResearch): https://github.com/VinAIResearch/PhoWhisper
- Modelo base en Hugging Face: https://huggingface.co/vinai/PhoWhisper-small
