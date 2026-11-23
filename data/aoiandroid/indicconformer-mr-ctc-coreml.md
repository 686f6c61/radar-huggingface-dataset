# aoiandroid/indicconformer-mr-ctc-coreml

## Resumen

IndicConformer_mr_CTC es una conversión a Core ML del modelo de reconocimiento automático de voz (ASR) `ai4bharat/indicconformer_stt_mr_hybrid_ctc_rnnt_large` desarrollado por AI4Bharat. El modelo original es un sistema híbrido CTC/RNNT basado en arquitectura Conformer, orientado al reconocimiento de voz en lenguas indias; en esta conversión concreta se ha aislado la cabeza CTC y se ha recortado el vocabulario a los tokens del maratí (código ISO `mr`). El resultado es un paquete Core ML de aproximadamente 0,2 GB pensado para ejecutarse en el ecosistema Apple (macOS e iOS).

La conversión la firma el usuario `aoiandroid` y se ha realizado con un script propio (`ic_coreml_convert.py`) sobre NeMo 1.23.0 y coremltools 8.1, con fecha del 23 de noviembre de 2026, para un proyecto llamado TranslateBlue. Incluye un frontend log-mel fusionado y trabaja con ventanas de audio de 10 segundos. La licencia del modelo original es MIT según la model card, aunque el repositorio de Hugging Face no declara licencia en sus metadatos.

La relevancia de esta ficha es acotada: no es un modelo nuevo ni un entrenamiento original, sino un artefacto de despliegue para inferencia local en dispositivos Apple. Resulta útil para quien necesite ASR de maratí embebido en una app sin depender de servicios en la nube, pero no aporta mejoras de calidad respecto al modelo base de AI4Bharat. No hay información publicada sobre benchmarks, idiomas adicionales ni parámetros en esta conversión.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Conformer (encoder) con cabeza CTC; conversión Core ML del modelo híbrido CTC/RNNT de AI4Bharat |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | ventana de audio de 10 s por inferencia |
| Tipos de cuantizacion | no disponible (pesos en formato Core ML, presumiblemente FP16/FP32; no confirmado) |
| Idiomas soportados | maratí (`mr`) |
| Licencia | MIT según la model card (AI4Bharat); el repo de Hugging Face no declara licencia en metadatos |
| Formato de pesos | Core ML (`.mlpackage`/`.mlmodel`); no se distribuyen safetensors ni GGUF |

## Arquitectura y entrenamiento

El modelo subyacente es un Conformer de tipo "large" de AI4Bharat, una arquitectura que combina bloques de autoatención con convoluciones depthwise para capturar dependencias locales y globales en la señal de audio. El modelo original es híbrido: comparte encoder entre una cabeza CTC y una cabeza RNNT, lo que permite elegir entre decodificación no autorregresiva (CTC, más rápida) y autorregresiva (RNNT, típicamente más precisa). En esta conversión se ha conservado únicamente la cabeza CTC, recortada al vocabulario del maratí, y se ha fusionado el frontend de extracción de características log-mel dentro del grafo Core ML, de modo que el modelo acepta audio directamente.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si hubo etapas de ajuste fino con RLHF o DPO; esos detalles corresponden al modelo original de AI4Bharat y no se reproducen en la model card de esta conversión. La innovación técnica aquí es de despliegue: empaquetado para Core ML con ventana fija de 10 s, lo que simplifica la integración en apps Apple a costa de segmentar el audio en fragmentos. La conversión se realizó con NeMo 1.23.0 y coremltools 8.1.

## Capacidades

- Reconocimiento automático de voz en maratí a partir de audio de hasta 10 segundos por ventana.
- Decodificación CTC no autorregresiva, adecuada para inferencia de baja latencia en dispositivo.
- Frontend log-mel integrado: el modelo recibe la señal de audio y realiza la extracción de características internamente.
- Ejecución local en el ecosistema Apple mediante Core ML (CPU, GPU y Neural Engine según el dispositivo).
- No soporta tool calling ni function calling.
- No está orientado a razonamiento multi-paso ni a comportamiento de agente.
- No dispone de modo "thinking", visión ni audio generativo; es exclusivamente ASR.
- Capacidad multilingüe limitada al maratí en esta conversión (el modelo base cubre más lenguas indias, pero aquí el vocabulario CTC está recortado).

## Casos de uso

- Transcripción de voz en apps iOS/macOS para usuarios de maratí: el modelo puede ejecutarse en dispositivo vía Core ML, sin enviar audio a servidores, lo que reduce latencia y mejora la privacidad.
- Subtitulado local de reuniones o notas de voz: segmentando el audio en ventanas de 10 s y encadenando las salidas CTC se obtienen transcripciones utilizables en herramientas de productividad.
- Asistentes de voz offline: integrado en una app Apple, permite dictado y comandos en maratí sin conexión, útil en entornos con conectividad limitada.
- Accesibilidad: transcripción en tiempo real de conversaciones para personas con dificultades auditivas que hablen maratí, aprovechando la inferencia en Neural Engine.
- Pipeline de traducción (proyecto TranslateBlue): este artefacto encaja como etapa ASR previa a un módulo de traducción, tal como indica la model card.
- Archivado y búsqueda de audio: transcripción por lotes de grabaciones en maratí para indexación y búsqueda textual, ejecutada en un Mac con Core ML.
- Investigación en ASR de bajos recursos: punto de partida para comparar el rendimiento de la decodificación CTC en dispositivo frente a la RNNT del modelo original.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/RAM: el repositorio pesa 0,2 GB, por lo que la huella de memoria del modelo es del orden de cientos de megabytes; no se especifica el consumo exacto en inferencia.
- GPU recomendadas: no aplica en el sentido tradicional; el destino es Core ML sobre Apple Silicon (M1/M2/M3/M4) y chips A-series de iPhone/iPad.
- Cabe en GPU de consumo: sí, en cualquier Mac con Apple Silicon y en dispositivos iOS compatibles con Core ML; no está pensado para GPUs NVIDIA.
- Opciones de despliegue: Core ML (coremltools, Xcode, Vision/Core ML APIs). No se distribuyen pesos para vLLM, llama.cpp, Ollama ni TGI, que además no son adecuados para un modelo ASR.
- Latencia y throughput: no disponibles; dependen del dispositivo y de la segmentación en ventanas de 10 s.

## Comparativa con modelos similares

| Modelo | Tipo | Idiomas | Contexto/ventana | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| IndicConformer_mr_CTC (esta conversión) | Conformer CTC, Core ML | maratí | 10 s | MIT (según model card) | Hugging Face, repo de 0,2 GB |
| ai4bharat/indicconformer_stt_mr_hybrid_ctc_rnnt_large | Conformer híbrido CTC/RNNT | maratí (modelo base multilingüe) | no disponible | MIT | Hugging Face (AI4Bharat) |
| Whisper (OpenAI) | Transformer encoder-decoder | multilingüe, incluido maratí | 30 s | MIT | Hugging Face, múltiples formatos |
| Otros ASR de AI4Bharat (p. ej. variantes IndicWav2Vec) | varios | lenguas indias | no disponible | MIT | Hugging Face |

La comparación cuantitativa de precisión no está disponible en la información proporcionada. Frente a Whisper, esta conversión ofrece menor tamaño y ejecución nativa en Core ML, pero carece de la cobertura multilingüe y del ecosistema de herramientas de Whisper.

## Limitaciones y advertencias

- Es una conversión de despliegue, no un modelo nuevo: su calidad depende enteramente del modelo base de AI4Bharat y de la fidelidad de la conversión a Core ML.
- Ventana fija de 10 s: requiere segmentar audio largo, con riesgo de cortes en fronteras de palabra y pérdida de contexto entre segmentos.
- Solo maratí: el vocabulario CTC está recortado, por lo que no reconocerá otras lenguas indias que el modelo base sí cubre.
- Solo cabeza CTC: no se aprovecha la decodificación RNNT, que suele dar mejores tasas de error en el modelo original.
- Riesgo de alucinación y errores en audio ruidoso, con acentos no estándar o con cambios de código de lengua; no hay datos publicados sobre sesgos.
- Licencia: la model card menciona MIT para el modelo de AI4Bharat, pero el repositorio de Hugging Face no declara licencia; conviene verificar antes de uso comercial.
- Sin mantenimiento ni métricas publicadas: 0 descargas y 0 likes en el momento de la consulta; no hay garantías de soporte.
- Dependencia del ecosistema Apple: no es portable a otros runtimes sin reconversión.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/aoiandroid/indicconformer-mr-ctc-coreml
- Modelo base: https://huggingface.co/ai4bharat/indicconformer_stt_mr_hybrid_ctc_rnnt_large
- AI4Bharat (organización): https://huggingface.co/ai4bharat
- NeMo (NVIDIA): https://github.com/NVIDIA/NeMo
- coremltools: https://github.com/apple/coremltools
