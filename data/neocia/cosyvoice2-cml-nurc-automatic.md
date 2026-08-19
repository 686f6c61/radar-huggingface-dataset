# neocia/cosyvoice2-cml-nurc-automatic

## Resumen

El modelo `neocia/cosyvoice2-cml-nurc-automatic` es un fine-tuning del sistema de síntesis de voz CosyVoice2-0.5B, desarrollado por el usuario neocia, especializado en la generación de habla espontánea en portugués brasileño con acento paulistano (São Paulo). El entrenamiento se realizó en dos etapas: una primera adaptación de dominio sobre el corpus CML-TTS (subconjunto en portugués, con audiolibros a 24 kHz) y una segunda fase de fine-tuning sobre el corpus NURC-SP ENTOA TTS, utilizando la configuración `automatic` (segmentación automática mediante WhisperX). El resultado es un modelo TTS orientado a producir voz natural y coloquial, con las características prosódicas del habla culta espontánea de la región de São Paulo.

El modelo se distribuye bajo licencia Apache 2.0 y está disponible en formato safetensors y ONNX. Con un tamaño de repositorio de 4,6 GB, se posiciona como una opción ligera y de código abierto para aplicaciones de texto a voz en portugués. Su relevancia radica en que cubre un nicho específico: la síntesis de habla espontánea con acento regional brasileño, algo poco común en los modelos TTS comerciales o genéricos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Basada en CosyVoice2 (Flow Matching + LLM) |
| Parametros totales | 0,5B (modelo base) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (formatos safetensors y ONNX) |
| Idiomas soportados | Portugués (pt, variante brasileña) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors, ONNX |

## Arquitectura y entrenamiento

CosyVoice2 es un modelo de síntesis de voz que combina un modelo de lenguaje (LLM) para la generación de tokens de audio con un modelo de flujo (Flow Matching) para la conversión de esos tokens a una forma de onda. El fine-tuning aquí presentado ajusta tanto el componente `llm` como el `flow` por separado: el LLM se entrenó durante 30 épocas partiendo del checkpoint obtenido tras la adaptación de dominio en CML-TTS, mientras que el flujo se entrenó también durante 30 épocas, pero partiendo del checkpoint preentrenado original (sin pasar por la etapa CML). El corpus CML-TTS aporta datos de audiolibros en portugués a 24 kHz, mientras que NURC-SP ENTOA proporciona grabaciones de habla espontánea con acento paulistano, segmentadas automáticamente con WhisperX.

La combinación de ambas etapas busca, primero, que el modelo aprenda las características generales del portugués y, después, que se especialice en la prosodia y entonación del habla coloquial de São Paulo. No se mencionan técnicas adicionales como RLHF o DPO; el entrenamiento es un fine-tuning supervisado estándar sobre datos de audio y texto.

## Capacidades

- Síntesis de voz en portugués brasileño, con énfasis en habla espontánea y acento paulistano.
- Generación de audio a partir de texto, con control de la entonación y el ritmo propios del habla natural.
- Soporte para inferencia en tiempo real o por lotes, según el hardware disponible (no se especifican requisitos concretos).
- Integración con el ecosistema CosyVoice, que permite clonación de voz en pocos segundos y ajuste de prosodia (capacidad heredada del modelo base, no confirmada explícitamente en esta variante).
- Compatible con los formatos safetensors y ONNX, lo que facilita su despliegue en diferentes entornos de inferencia.

## Casos de uso

- Audiolibros en portugués brasileño: el modelo puede generar narraciones con una entonación natural, adecuada para la lectura de libros y artículos largos, gracias a la adaptación previa sobre CML-TTS.
- Asistentes de voz con acento regional: al estar entrenado en habla espontánea de São Paulo, es útil para asistentes virtuales que necesiten sonar locales y cercanos al usuario brasileño.
- Doblaje y locución para vídeo: la capacidad de producir habla coloquial permite generar voces para personajes o narraciones en contenido audiovisual dirigido a Brasil.
- Sistemas de respuesta interactiva (IVR): integración en centralitas telefónicas o chatbots de voz que requieran un tono natural y comprensible para el público paulista.
- Herramientas de accesibilidad: lectura en voz alta de textos para personas con discapacidad visual, con una voz que suena humana y adaptada al contexto brasileño.
- Investigación en lingüística computacional: sirve como base para estudiar la prosodia del habla espontánea paulistana o para generar estímulos auditivos en experimentos de percepción.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. Dado que el modelo base tiene 0,5B parámetros y el repositorio pesa 4,6 GB, es probable que quepa en GPUs de consumo como una RTX 3060 o superior, pero no se proporcionan datos oficiales.
- GPU recomendadas: no disponible. Se puede inferir que una GPU con al menos 8 GB de VRAM sería suficiente para inferencia en FP16, pero no hay confirmación.
- Opciones de despliegue: el modelo es compatible con el repositorio oficial de CosyVoice (GitHub), que ofrece scripts de inferencia en Python. También podría desplegarse con ONNX Runtime si se convierte el modelo a ese formato (ya está disponible en ONNX).
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables específicos para habla espontánea en portugués brasileño. Alternativas genéricas de TTS como Coqui TTS o VITS podrían usarse como referencia, pero no se han encontrado datos de comparación en la documentación proporcionada.

## Limitaciones y advertencias

- El modelo está entrenado exclusivamente en portugués brasileño, por lo que no es adecuado para otros idiomas.
- El acento y la prosodia se limitan al habla culta espontánea de São Paulo; puede no generalizar bien a otras regiones de Brasil o a registros formales.
- La segmentación automática con WhisperX puede introducir errores en los datos de entrenamiento, lo que podría afectar la calidad en ciertos casos.
- No se han evaluado sesgos o riesgos de alucinación en la salida de audio; el modelo podría generar pronunciaciones incorrectas en nombres o términos fuera de su vocabulario.
- Aunque la licencia Apache 2.0 permite uso comercial, es necesario verificar que los datasets utilizados (CML-TTS y NURC-SP ENTOA) tengan licencias compatibles con ese uso.
- El modelo no incluye capacidades de visión ni multimodales; es exclusivamente de texto a voz.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/neocia/cosyvoice2-cml-nurc-automatic
- Repositorio oficial de CosyVoice: https://github.com/FunAudioLLM/CosyVoice
- Dataset CML-TTS: https://huggingface.co/datasets/ylacombe/cml-tts
- Dataset NURC-SP ENTOA TTS: https://huggingface.co/datasets/nilc-nlp/NURC-SP_ENTOA_TTS
