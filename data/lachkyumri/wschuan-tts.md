# LachKyumri/WSChuan-TTS

## Resumen

El modelo WSChuan-TTS es un sistema de síntesis de voz (text-to-speech) especializado en el dialecto sichuanés del chino (Chuan-Yu). Ha sido desarrollado por el laboratorio ASLP de la Universidad Politécnica del Noroeste (NPU) de China, y este repositorio concreto es una copia publicada por el usuario LachKyumri. El modelo se basa en CosyVoice2, un motor de TTS de código abierto de Alibaba, y ha sido ajustado con el corpus WenetSpeech-Chuan, un conjunto de datos de habla sichuanesa con anotaciones ricas. Su relevancia radica en que aborda la escasez de sistemas TTS para dialectos regionales del chino, que suelen estar infrarrepresentados en los modelos comerciales.

El repositorio incluye los pesos del modelo en formato safetensors y ONNX, con un tamaño total de 5,9 GB. La licencia es Apache 2.0, lo que permite uso comercial y modificación. Aunque la ficha de HuggingFace no especifica el pipeline ni los idiomas, la documentación del proyecto indica que el modelo está diseñado para generar habla en sichuanés, con soporte para control de estilo mediante instrucciones y clonación de voz a partir de una muestra de referencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | CosyVoice2 (TTS basado en transformer con flujo normalizador y decodificador de audio) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de síntesis de voz) |
| Tipos de cuantizacion | no disponible (se distribuyen pesos en fp16 y ONNX) |
| Idiomas soportados | Chino sichuanés (dialecto Chuan-Yu) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors, ONNX |

## Arquitectura y entrenamiento

El modelo se basa en CosyVoice2, una arquitectura de TTS de última generación que combina un codificador de texto, un modelo de flujo normalizador para modelar la prosodia y un decodificador de audio basado en un vocoder. CosyVoice2 incorpora un mecanismo de control de instrucciones que permite modificar el estilo de habla (por ejemplo, "habla en dialecto sichuanés") y admite clonación de voz a partir de una grabación de referencia de pocos segundos. El entrenamiento se realizó sobre el corpus WenetSpeech-Chuan, que contiene más de 1.000 horas de habla sichuanesa con transcripciones verificadas manualmente y anotaciones a nivel de fonética y prosodia. No se han publicado detalles sobre el número exacto de tokens de entrenamiento ni sobre el uso de técnicas de alineación como RLHF o DPO.

## Capacidades

- Síntesis de voz en dialecto sichuanés con acento y entonación naturales.
- Control de estilo mediante instrucciones en lenguaje natural (por ejemplo, "habla con tono enfadado" o "usa acento de Chengdu").
- Clonación de voz a partir de una muestra de audio de referencia (prompt speech) de aproximadamente 5-10 segundos.
- Generación de audio en streaming (modo no bloqueante) para aplicaciones en tiempo real.
- Soporte para entrada de texto en chino simplificado, con conversión automática a la pronunciación sichuanesa mediante OpenCC.
- Integración con el ecosistema CosyVoice, lo que permite usar el mismo código para otros dialectos o idiomas si se dispone de los pesos adecuados.

## Casos de uso

- Audiolibros y narración en dialecto regional: el modelo puede generar narraciones completas en sichuanés para preservar y difundir la literatura oral de la región, con control de ritmo y entonación mediante instrucciones.
- Asistentes de voz para servicios locales: empresas de la provincia de Sichuan pueden integrar el modelo en asistentes de atención al cliente que respondan en el dialecto local, mejorando la accesibilidad para hablantes mayores o menos familiarizados con el mandarín estándar.
- Doblaje de contenido audiovisual: productoras de vídeo y animación pueden usar el modelo para doblar diálogos al sichuanés, aprovechando la clonación de voz para mantener la coherencia de los personajes.
- Herramientas de accesibilidad: personas con discapacidad visual que hablan sichuanés pueden beneficiarse de lectores de pantalla que utilicen este modelo para leer contenido en su dialecto nativo.
- Investigación lingüística: el modelo sirve como herramienta para estudiar la fonética y la prosodia del sichuanés, permitiendo generar estímulos de audio controlados para experimentos de percepción del habla.
- Sistemas de navegación y avisos públicos: aplicaciones de transporte o turismo en Sichuan pueden emplear el modelo para emitir anuncios en dialecto local, creando una experiencia más cercana para los residentes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El proyecto WenetSpeech-Chuan incluye un conjunto de evaluación (WSChuan-eval) con tareas de ASR y TTS, pero los resultados numéricos de este modelo concreto no se han difundido en la documentación consultada.

## Requisitos de hardware

- No se especifican requisitos oficiales en la documentación del modelo.
- El tamaño del repositorio (5,9 GB) sugiere que los pesos en fp16 ocupan aproximadamente 3-4 GB, por lo que una GPU con al menos 8 GB de VRAM (por ejemplo, RTX 3060, RTX 4060) sería suficiente para inferencia en fp16.
- Para la versión ONNX, se puede ejecutar en CPU con un rendimiento aceptable para tareas por lotes, aunque la generación en tiempo real requeriría una GPU.
- El código de ejemplo utiliza PyTorch y requiere una GPU NVIDIA con CUDA para un funcionamiento óptimo.
- Opciones de despliegue: el modelo se puede servir mediante el código oficial de CosyVoice2 (con soporte para vLLM y TensorRT), o exportarse a ONNX para su uso en entornos de producción con ONNX Runtime.
- No se dispone de datos de latencia o throughput medidos.

## Comparativa con modelos similares

No se dispone de información suficiente para realizar una comparativa cuantitativa con otros modelos TTS. El modelo es una adaptación de CosyVoice2 al dialecto sichuanés, por lo que su rendimiento en mandarín estándar sería similar al de CosyVoice2 original. Otros TTS multilingües como VITS o Tacotron2 no soportan dialectos regionales chinos de forma nativa, lo que convierte a WSChuan-TTS en una opción única para este caso de uso. No obstante, no se han publicado comparativas formales.

## Limitaciones y advertencias

- El modelo está entrenado exclusivamente para el dialecto sichuanés; su uso con otros dialectos o idiomas producirá resultados incorrectos o ininteligibles.
- La calidad de la clonación de voz depende de la calidad y duración de la muestra de referencia; muestras ruidosas o demasiado cortas degradan el resultado.
- Puede presentar alucinaciones fonéticas en palabras poco frecuentes o préstamos del mandarín, generando pronunciaciones inexactas.
- No se han documentado sesgos específicos, pero al ser un modelo entrenado con datos de una región concreta, puede reflejar variaciones dialectales internas (por ejemplo, diferencias entre el acento de Chengdu y el de Chongqing).
- La licencia Apache 2.0 permite uso comercial, pero se recomienda verificar la procedencia de los datos de entrenamiento (corpus WenetSpeech-Chuan) para asegurar el cumplimiento de sus términos de uso.
- El repositorio de HuggingFace no incluye un pipeline predefinido ni documentación de uso directa; es necesario seguir las instrucciones del repositorio GitHub para ejecutar el modelo.

## Enlaces

- Repositorio HuggingFace (copia): https://huggingface.co/LachKyumri/WSChuan-TTS
- Repositorio HuggingFace original: https://huggingface.co/ASLP-lab/WSChuan-TTS
- Repositorio GitHub del proyecto: https://github.com/ASLP-lab/WenetSpeech-Chuan
- Página del proyecto: https://aslp-lab.github.io/WenetSpeech-Chuan/
