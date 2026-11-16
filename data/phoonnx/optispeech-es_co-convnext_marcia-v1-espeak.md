# Phoonnx/optispeech-es_co-convnext_marcia-v1-espeak

## Resumen

OptiSpeech es una familia de modelos de síntesis de voz (text-to-speech) basada en la arquitectura OptiSpeech, que combina un codificador ConvNext con un decodificador acústico y un vocoder neuronal para generar audio a partir de texto. Este repositorio concreto, `optispeech-es_co-convnext_marcia-v1-espeak`, es un empaquetado en formato ONNX del modelo original `bookbot/OptiSpeech-ConvNext-TTS-es-CO-Marcia-v1`, desarrollado por el equipo de bookbot y redistribuido por Phoonnx para su uso con la librería `phoonnx`.

El modelo está especializado en la síntesis de voz en español, con un acento colombiano (`es-CO`), y emplea `espeak` como fonemizador para la conversión de texto a fonemas. El nombre "marcia-v1" sugiere que la voz está entrenada sobre un hablante concreto llamado Marcia, aunque la model card no proporciona detalles sobre el corpus de entrenamiento ni el número de horas de audio utilizadas.

La relevancia de este modelo radica en su formato ONNX optimizado para inferencia en producción y en su integración con el ecosistema phoonnx/OVOS, lo que facilita su despliegue en asistentes de voz y sistemas embebidos. El tamaño del repositorio es de solo 0,1 GB, lo que indica un modelo ligero y adecuado para entornos con recursos limitados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | OptiSpeech (ConvNext + decodificador acústico + vocoder) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo TTS, no aplica ventana de contexto de texto) |
| Tipos de cuantizacion | no disponible (formato ONNX; se desconoce si incluye variantes cuantizadas) |
| Idiomas soportados | es (español, variante es-CO según la config del modelo) |
| Licencia | apache-2.0 |
| Formato de pesos | ONNX |

## Arquitectura y entrenamiento

La arquitectura OptiSpeech se basa en un codificador ConvNext, una red convolucional moderna que sustituye a los transformers en la extracción de características del texto fonemizado, combinada con un decodificador acústico que genera representaciones mel y un vocoder que produce la forma de onda final. El modelo usa `espeak` como fonemizador, lo que implica que el texto de entrada se convierte primero a fonemas IPA antes de pasar por la red. El repositorio empaqueta los pesos en formato ONNX para su ejecución con la librería phoonnx, que soporta Python y el ecosistema OVOS.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de RLHF o ajuste fino supervisado. La model card original de bookbot no detalla el corpus de audio utilizado para la voz "Marcia", aunque el identificador `es-CO` indica que el material de entrenamiento corresponde a español colombiano. Tampoco se documentan innovaciones técnicas específicas más allá del uso de ConvNext como codificador y la integración con espeak para fonemización.

## Capacidades

- Síntesis de voz (text-to-speech) a partir de texto en español, con salida de audio en formato de onda.
- Fonemización mediante espeak, lo que permite manejar texto no normalizado y conversión a fonemas IPA.
- Voz específica de un hablante femenino (Marcia) con acento colombiano (`es-CO`).
- Ejecución en formato ONNX, lo que permite inferencia en CPU y GPU sin dependencias de PyTorch.
- Integración con la librería phoonnx y el ecosistema OVOS para asistentes de voz.
- No soporta tool calling, function calling, agentes ni razonamiento multi-step (es un modelo puramente TTS).
- No dispone de capacidades multimodales (visión, audio de entrada) ni de modo "thinking".

## Casos de uso

- Asistentes de voz en español: el modelo puede generar respuestas habladas en tiempo real dentro de un asistente tipo OVOS, gracias a su formato ONNX ligero y su integración con phoonnx.
- Lectura de textos en aplicaciones de accesibilidad: conversión de artículos, noticias o documentos a audio con acento colombiano para usuarios con discapacidad visual.
- Generación de audiolibros y contenido narrado: síntesis de largos pasajes de texto con una voz consistente, adecuada para publicaciones en español.
- Sistemas de navegación y avisos por voz: generación de instrucciones habladas en dispositivos embebidos o de bajo consumo, donde el tamaño reducido del modelo (0,1 GB) es una ventaja.
- Pruebas de integración en pipelines de TTS: al estar en ONNX, puede integrarse en servicios backend que no dispongan de GPU o que prefieran evitar dependencias de PyTorch.
- Desarrollo de prototipos de voz para aplicaciones móviles o IoT: el modelo puede ejecutarse en dispositivos con recursos limitados, aunque no se especifican los requisitos exactos.
- Localización de contenido para el mercado colombiano: generación de voces con acento local para vídeos, podcasts o interfaces de usuario.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el tamaño del repositorio (0,1 GB) sugiere que el modelo es muy ligero y podría ejecutarse en CPU sin GPU.
- GPU recomendadas: no disponible; al ser un modelo ONNX de pequeño tamaño, es probable que funcione en GPUs consumer (GTX 1060, RTX 3060, etc.), pero no se confirma.
- ¿Cabe en consumer GPU? Probablemente sí, dado el tamaño del repositorio, pero no se dispone de datos oficiales.
- Opciones de despliegue: phoonnx (Python y OVOS), ONNX Runtime; no se documenta soporte para vLLM, llama.cpp, Ollama o TGI (son frameworks para LLMs, no para TTS).
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Arquitectura | Idiomas | Licencia | Formato | Tamaño repo |
|---|---|---|---|---|---|
| optispeech-es_co-convnext_marcia-v1-espeak (este) | OptiSpeech (ConvNext) | es-CO | apache-2.0 | ONNX | 0,1 GB |
| bookbot/OptiSpeech-ConvNext-TTS-es-CO-Marcia-v1 | OptiSpeech (ConvNext) | es-CO | apache-2.0 | no disponible (probablemente PyTorch) | no disponible |
| Otros modelos OptiSpeech de Phoonnx | OptiSpeech | varios | apache-2.0 | ONNX | variable |

No se dispone de información suficiente para comparar con alternativas como VITS, FastSpeech2 o modelos TTS comerciales en términos de rendimiento o calidad. La comparativa se limita al modelo upstream y a otros empaquetados de la misma colección.

## Limitaciones y advertencias

- Sesgos conocidos: al estar entrenado sobre una única voz (Marcia) y un acento concreto (es-CO), el modelo no representa la diversidad de acentos del español; puede producir resultados menos naturales para otras variantes.
- Riesgo de alucinación: en TTS, esto se manifiesta como pronunciaciones incorrectas, entonación extraña o artefactos en el audio, especialmente con palabras fuera del vocabulario o nombres propios.
- Limitaciones de contexto o idioma: el modelo solo soporta español (es-CO); no maneja otros idiomas ni cambios de voz. No se especifica la longitud máxima de texto de entrada.
- Restricciones de licencia: la licencia es apache-2.0, lo que permite uso comercial, pero se recomienda verificar la licencia del modelo upstream y del corpus de entrenamiento original.
- Caveats para producción: la model card indica que "el índice de voces de phoonnx no lista una voz para este modelo", lo que puede implicar que la integración con phoonnx no está completamente configurada; además, no se documentan métricas de calidad (MOS) ni pruebas de robustez.
- El uso de espeak como fonemizador puede introducir errores en la conversión de texto a fonemas para palabras ambiguas o extranjerismos.

## Enlaces

- [Hugging Face: Phoonnx/optispeech-es_co-convnext_marcia-v1-espeak](https://huggingface.co/Phoonnx/optispeech-es_co-convnext_marcia-v1-espeak)
- [Modelo upstream: bookbot/OptiSpeech-ConvNext-TTS-es-CO-Marcia-v1](https://huggingface.co/bookbot/OptiSpeech-ConvNext-TTS-es-CO-Marcia-v1)
- [Repositorio phoonnx](https://github.com/TigreGotico/phoonnx)
- [Repositorio scriptconv](https://github.com/TigreGotico/scriptconv)
- [Colección OptiSpeech en Hugging Face](https://huggingface.co/collections/Phoonnx/optispeech-6af8ea9492a4f8f4e0f1cf30)
