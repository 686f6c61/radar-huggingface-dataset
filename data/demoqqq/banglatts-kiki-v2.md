# demoqqq/banglatts-kiki-v2

## Resumen

Kiki TTS v2 es un modelo de síntesis de voz (text-to-speech) en bengalí, de un único hablante, publicado por el usuario `demoqqq` en Hugging Face. Se trata de un ajuste fino del modelo base EMTIAZZ Bengali VITS (licencia Apache-2.0), entrenado con 2.528 clips que suman 325,3 minutos de audio. El resultado es una voz concreta ("Kiki"), pensada para lectura de noticias y con capacidad de funcionamiento totalmente offline mediante sherpa-onnx.

El modelo emplea la arquitectura VITS (Variational Inference with adversarial learning for end-to-end Text-to-Speech), un modelo generativo condicional que combina un codificador de texto, un prior normalizador de flujo y un decodificador neuronal con discriminadores adversariales, todo dentro del ecosistema Coqui TTS. La salida se genera a 22.050 Hz con una representación de caracteres de 92 tokens. El repositorio incluye tanto el checkpoint de entrenamiento en formato PyTorch (`best_model.pth`) como una exportación ONNX optimizada para sherpa-onnx (`model.onnx`), lo que facilita su despliegue en entornos sin GPU.

La relevancia de este modelo es limitada pero específica: cubre la síntesis de voz en bengalí con una voz concreta y un pipeline de despliegue ligero (ONNX + sherpa-onnx), algo poco común en el ecosistema open source. No obstante, al ser un modelo de voz personal y con escasa documentación pública (sin benchmarks, sin licencia explícita para el ajuste fino y sin datos de idiomas declarados en la ficha de Hugging Face), su uso en producción requiere cautela y verificación previa.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | VITS (Variational Inference with adversarial learning for end-to-end TTS), implementación Coqui TTS |
| Parámetros totales | no disponible (checkpoint `best_model.pth` de 997.804.291 bytes; ONNX de 114.192.746 bytes) |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo TTS, no aplica ventana de contexto de texto) |
| Tipos de cuantización | no disponible (se distribuye en FP32 PyTorch y ONNX; no se documentan variantes cuantizadas) |
| Idiomas soportados | bengalí (según la model card); la ficha de Hugging Face no declara idiomas |
| Licencia | no disponible para el ajuste fino; el modelo base EMTIAZZ es Apache-2.0 |
| Formato de pesos | PyTorch (`best_model.pth`), ONNX (`model.onnx`), configuración JSON y listas de tokens en texto |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura VITS, un sistema end-to-end de síntesis de voz que integra un codificador de texto basado en transformer, un prior normalizador de flujo, un decodificador generativo (HiFi-GAN) y un entrenamiento adversarial con discriminadores multiperiodo. La representación de entrada es a nivel de carácter con 92 tokens, y la salida se genera a 22.050 Hz. El ajuste fino parte del checkpoint `checkpoint_16500` (paso 16.500, época 54) del modelo base EMTIAZZ Bengali VITS, que a su vez se distribuye con licencia Apache-2.0.

El entrenamiento se realizó durante 70 épocas con un tamaño de lote de 8, usando 2.528 clips (325,3 minutos) compuestos por 1.863 clips "proven" y 665 clips recortados de nuevo. El mejor modelo se seleccionó por pérdida de evaluación en el paso 18.307 (época 59). No se documenta el uso de RLHF, DPO ni técnicas de alineación adicionales; se trata de un ajuste supervisado estándar de TTS. La innovación técnica destacable es la exportación a ONNX compatible con sherpa-onnx, con metadatos de frontend de caracteres, `model_type=vits` y `sample_rate=22050`, lo que permite inferencia offline en CPU sin dependencias de PyTorch.

## Capacidades

- Síntesis de voz (text-to-speech) en bengalí a partir de texto de entrada, con una voz única y concreta ("Kiki").
- Generación de audio a 22.050 Hz en formato WAV.
- Funcionamiento totalmente offline mediante sherpa-onnx, sin necesidad de conexión a servicios externos.
- Inferencia en CPU gracias a la exportación ONNX, con un tamaño de modelo de 114 MB en dicho formato.
- Soporte de frases largas (se incluyen muestras de noticias largas como `test_long_teknaf.wav` y `test_long_narsingdi.wav`).
- No se documenta soporte de tool calling, function calling, agentes, razonamiento multi-paso, visión, audio de entrada ni modo "thinking"; es exclusivamente un modelo TTS.
- Capacidades multilingües: no disponibles; el modelo está entrenado para bengalí.

## Casos de uso

- Lectura de noticias en bengalí: el modelo está entrenado con una voz de noticias y se han publicado muestras de noticias largas, por lo que es adecuado para generar boletines o artículos narrados de forma automática.
- Accesibilidad para personas con discapacidad visual: conversión de texto bengalí a voz en aplicaciones de lectura de pantalla, con inferencia offline que evita dependencias de red.
- Sistemas de anuncios y megafonía: generación de avisos pregrabados en bengalí para transporte, aeropuertos o comercios, usando sherpa-onnx en dispositivos de bajo consumo.
- Asistentes de voz embebidos: integración en dispositivos IoT o Raspberry Pi mediante ONNX, gracias al reducido tamaño del modelo (114 MB) y a la inferencia en CPU.
- Localización de contenido audiovisual: doblaje o voice-over de material educativo y divulgativo en bengalí con una voz consistente de un solo hablante.
- Pruebas de concepto de TTS en bengalí: base para experimentos de ajuste fino adicional o para evaluar pipelines de sherpa-onnx en idiomas de bajos recursos.
- Generación de audiolibros: narración de textos largos en bengalí con una voz estable, aunque requiere verificación de la calidad en pasajes extensos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; el checkpoint PyTorch ocupa aproximadamente 1 GB en disco, por lo que la inferencia en FP32 requiere del orden de 1-2 GB de VRAM si se ejecuta en GPU.
- GPU recomendadas: no disponibles; al ser un modelo pequeño (VITS), cualquier GPU con al menos 2 GB de VRAM debería ser suficiente (por ejemplo, GTX 1050 Ti, RTX 3050). No se documentan pruebas con A100 o H100.
- Compatibilidad con GPU de consumo: sí, previsiblemente en cualquier GPU de consumo moderna; el modelo ONNX de 114 MB está pensado para CPU.
- Opciones de despliegue: sherpa-onnx (soporte oficial mediante `model.onnx` y `tokens_sherpa.txt`), Coqui TTS (con `best_model.pth` y `config.json`). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a un modelo TTS.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Kiki TTS v2 (demoqqq) | VITS TTS | no disponible (~1 GB checkpoint) | no aplica | bengalí | no disponible (base Apache-2.0) | Hugging Face, ONNX + PyTorch |
| EMTIAZZ Bengali VITS | VITS TTS | no disponible | no aplica | bengalí | Apache-2.0 | Hugging Face |
| Coqui TTS VITS (genérico) | VITS TTS | ~80-100 M típico | no aplica | multilingüe según checkpoint | MPL-2.0 (código) / varía por checkpoint | Coqui TTS, Hugging Face |

No se dispone de datos de rendimiento comparativo (MOS, WER, latencia) para establecer una comparación cuantitativa con alternativas.

## Limitaciones y advertencias

- La licencia del ajuste fino no está declarada; solo se indica que el modelo base es Apache-2.0. El uso comercial del ajuste fino no está garantizado y requiere consulta con el autor.
- Es un modelo de voz personal ("personal voice model"); la model card pide usarlo "con respeto". No se especifican restricciones adicionales sobre su uso.
- Entrenado con solo 325,3 minutos de audio, lo que puede limitar la cobertura prosódica y la naturalidad en dominios alejados de las noticias.
- Riesgo de alucinación en TTS: puede producir pronunciaciones incorrectas, omisiones o artefactos en palabras fuera del vocabulario de entrenamiento o en nombres propios.
- Sin datos publicados sobre sesgos, evaluación subjetiva (MOS) ni robustez ante texto ruidoso.
- La ficha de Hugging Face no declara idiomas ni licencia; la información sobre bengalí proviene únicamente de la model card.
- No apto para clonación de voz no consentida ni para suplantación de identidad; el modelo representa una voz concreta.
- Sin benchmarks públicos, por lo que no se puede verificar su calidad frente a otros TTS en bengalí.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/demoqqq/banglatts-kiki-v2
- Modelo base EMTIAZZ Bengali VITS (referenciado en la model card; no se proporciona URL directa): no disponible
- Documentación de sherpa-onnx: no disponible en la información proporcionada
- Documentación de Coqui TTS: no disponible en la información proporcionada
- Paper de VITS: no disponible en la información proporcionada
