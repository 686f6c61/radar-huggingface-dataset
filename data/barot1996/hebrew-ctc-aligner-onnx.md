# barot1996/hebrew-ctc-aligner-onnx

## Resumen

Hebrew CTC aligner (ONNX, int8) es una exportación a ONNX con cuantización dinámica a int8 del modelo `imvladikon/wav2vec2-large-xlsr-53-hebrew`, que a su vez es un ajuste fino sobre `facebook/wav2vec2-large-xlsr-53`. Lo publica el usuario `barot1996` y su función es el alineamiento forzado (forced alignment) a nivel de palabra de audio en hebreo, es decir, obtener las marcas temporales de cada palabra dentro de una transcripción conocida.

El modelo no introduce ninguna innovación de arquitectura: es un export directo del checkpoint original a formato ONNX y su posterior cuantización a int8, sin reentrenamiento. Su valor practico reside en que el artefacto resultante es muy ligero (repo de 0,3 GB) y puede ejecutarse en CPU con `onnxruntime`, lo que abarata el despliegue frente a la inferencia en GPU del modelo original.

Por su naturaleza, no es un modelo generativo ni conversacional: recibe audio mono a 16 kHz y devuelve logits CTC sobre un vocabulario de caracteres hebreos, que un decodificador de alineamiento convierte en tiempos por palabra. Es relevante para equipos que necesitan sincronizar subtítulos, anotar corpus de voz o preparar datos de entrenamiento TTS en hebreo sin depender de GPU.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Wav2Vec2 (extractor convolucional de características + encoder transformer) con cabeza CTC; exportada a ONNX |
| Parametros totales | ~317 M (arquitectura wav2vec2-large; no confirmado de forma explicita en la informacion proporcionada) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (modelo acustico sobre audio; no maneja contexto de tokens de texto) |
| Tipos de cuantizacion | int8 dinamica (unico artefacto publicado) |
| Idiomas soportados | hebreo (he) |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (`he-ctc.int8.onnx`) + vocabulario de caracteres en JSON (`he-ctc.vocab.json`) |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura Wav2Vec2 en su variante `large-xlsr-53`: un extractor de características convolucional que convierte la onda de audio en una secuencia de representaciones latentes, seguido de un encoder transformer y una cabeza de clasificación CTC que produce logits por fotograma sobre un vocabulario de caracteres. La variante XLSR-53 fue preentrenada de forma auto-supervisada sobre habla de 53 idiomas, y el checkpoint base `imvladikon/wav2vec2-large-xlsr-53-hebrew` corresponde a un ajuste fino supervisado sobre hebreo con cabecera CTC.

Segun la propia model card, este repositorio no reentrena ni modifica los pesos: el unico cambio respecto al modelo original es la exportación a ONNX y la cuantización dinámica a int8. Por tanto, no hay datos de entrenamiento nuevos, ni etapas de RLHF, DPO o ajuste adicional documentadas en la informacion disponible. La innovacion practica es exclusivamente de empaquetado y optimizacion para inferencia en CPU.

## Capacidades

- Alineamiento forzado a nivel de palabra (word-level timing) de audio en hebreo contra una transcripción conocida.
- Reconocimiento acústico mediante salida de logits CTC sobre un vocabulario de caracteres hebreos.
- Inferencia en CPU gracias al formato ONNX int8 y a la ejecución con `onnxruntime`.
- Entrada de audio mono a 16 kHz.
- No soporta tool calling ni function calling (no es un modelo de lenguaje generativo).
- No soporta agentes ni razonamiento multi-paso.
- Capacidad multilingue: limitada al hebreo (idioma declarado `he`).
- No dispone de modo de razonamiento (thinking mode), vision ni audio generativo.

## Casos de uso

- Generacion de subtitulos sincronizados: dado un audio en hebreo y su transcripcion, el modelo proporciona los tiempos de inicio y fin de cada palabra para generar ficheros SRT o VTT con marcas precisas.
- Anotacion de corpus de voz: investigadores que construyen datasets de habla en hebreo pueden obtener alineaciones automáticas para etiquetar segmentos sin trabajo manual.
- Preparacion de datos para sintesis de voz (TTS): las marcas temporales por palabra y fonema facilitan el alineamiento texto-audio necesario en entrenamiento de modelos TTS.
- Investigacion fonetica y prosodica: permite medir duraciones de palabras y segmentos en grabaciones para estudios de ritmo y entonacion en hebreo.
- Post-proceso de pipelines ASR: integrado tras un sistema de reconocimiento de voz, aporta marcas temporales que el ASR puro no ofrece, mejorando la navegacion de transcripciones largas.
- Analisis de llamadas o reuniones: en entornos sin GPU, se puede ejecutar en CPU para alinear transcripciones de reuniones en hebreo y permitir busquedas por marca temporal.
- Verificacion de pronunciacion: comparar la alineacion esperada con la real para detectar desviaciones en grabaciones de aprendices de hebreo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de tasa de error de alineamiento, latencia ni comparaciones cuantitativas.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica; el modelo esta pensado para ejecucion en CPU con `onnxruntime`. El artefacto int8 ocupa aproximadamente 0,3 GB en disco.
- GPU recomendadas: no especificadas. Al ser un modelo pequeno en int8, cualquier GPU con suficiente memoria para los tensores podria ejecutarlo, pero no es el escenario objetivo.
- Compatibilidad con GPU de consumo: no disponible. Se desconoce si se ha validado en RTX 4090 u otras GPU de consumo.
- Opciones de despliegue: `onnxruntime` en CPU (escenario declarado). No se documentan otras opciones como vLLM, llama.cpp, Ollama o TGI, que ademas no aplican a un modelo CTC de audio.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Idiomas | Formato | Licencia | Notas |
|---|---|---|---|---|---|---|
| barot1996/hebrew-ctc-aligner-onnx | Alineador CTC (ONNX int8) | ~317 M (arquitectura) | Hebreo | ONNX int8 | Apache-2.0 | Export ligero para CPU |
| imvladikon/wav2vec2-large-xlsr-53-hebrew | Alineador CTC (PyTorch) | ~317 M (arquitectura) | Hebreo | safetensors / PyTorch | no disponible | Modelo base del anterior |
| WhisperX (alineamiento) | Pipeline de alineamiento fonetico | no disponible | Multilingue | PyTorch | no disponible | Usa modelos wav2vec2 por fonema; orientado a GPU |
| Montreal Forced Aligner (MFA) | Alineador GMM-HMM | no aplica | Multilingue (con diccionarios) | no disponible | no disponible | Requiere diccionario de pronunciacion; no es neuronal con wav2vec2 |

## Limitaciones y advertencias

- Sesgos conocidos: no disponible; no se documenta ningun analisis de sesgos para este export ni para su modelo base.
- Riesgo de alucinacion: al ser un modelo acustico CTC, no genera texto libre, por lo que el riesgo de alucinacion de contenido no aplica del mismo modo que en un LLM; sin embargo, una alineacion erronea puede producir marcas temporales incorrectas.
- Limitacion de idioma: solo soporta hebreo; no hay soporte multilingue en este artefacto.
- Limitacion de entrada: requiere audio mono a 16 kHz; otras frecuencias de muestreo o canales deben convertirse previamente.
- Restricciones de licencia: Apache-2.0, permite uso comercial, pero se debe conservar la atribucion a los autores originales del modelo, tal como indica la model card.
- Caveat de produccion: no se ha reentrenado ni validado con datos propios; se desconoce su calidad de alineamiento en dominios especificos (audio ruidoso, habla espontanea, distintos acentos).
- Caveat de mantenimiento: el repositorio registra 0 descargas y 0 likes en el momento de la consulta y fue creado y actualizado el mismo dia, por lo que no cuenta con validacion de la comunidad.
- Dependencia del vocabulario: el decodificador de alineamiento necesita `he-ctc.vocab.json`; un vocabulario incompatible impediria la alineacion correcta.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/barot1996/hebrew-ctc-aligner-onnx
- Modelo base (hebreo): https://huggingface.co/imvladikon/wav2vec2-large-xlsr-53-hebrew
- Modelo preentrenado original: https://huggingface.co/facebook/wav2vec2-large-xlsr-53
