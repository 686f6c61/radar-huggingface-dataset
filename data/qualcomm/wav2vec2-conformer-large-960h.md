# qualcomm/Wav2Vec2-Conformer-Large-960h

## Resumen

Wav2Vec2-Conformer-Large-960h es un modelo de reconocimiento automatico del habla (ASR) en ingles. El modelo original fue desarrollado por Facebook/Meta AI (publicado como `facebook/wav2vec2-conformer-rel-pos-large-960h-ft`) y esta version ha sido reempaquetada y optimizada por Qualcomm para su despliegue en dispositivos con procesadores Snapdragon y otras plataformas de la compania. Emplea un encoder de tipo Conformer con atencion de posicion relativa (24 capas, 1024 dimensiones ocultas, 16 cabezas) y una cabeza CTC para la decodificacion.

El modelo acepta audio crudo a 16 kHz y produce texto transcrito mediante decodificacion voraz (greedy) CTC. Fue ajustado (fine-tuning) sobre 960 horas del corpus LibriSpeech, por lo que su dominio principal es el habla leida en ingles. Su relevancia actual radica en la transcripcion de voz en el propio dispositivo (on-device ASR), sin necesidad de enviar audio a la nube, lo que reduce latencia, coste y exposicion de datos personales.

Qualcomm distribuye este repositorio no como pesos genericos, sino como artefactos precompilados para su runtime QNN sobre ONNX Runtime, en precisiones `float` y `w8a16`, listos para ejecutarse sobre la NPU de distintas plataformas Snapdragon. Esto lo convierte en una pieza orientada a integracion en aplicaciones moviles y de borde mas que a entrenamiento o investigacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Conformer (encoder transformer con modulos convolucionales) con atencion de posicion relativa y cabeza CTC |
| Parametros totales | ~600 millones (estimacion a partir de la arquitectura Conformer-large declarada en la model card; la cifra exacta no esta publicada en la informacion disponible) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo ASR; procesa audio crudo a 16 kHz, no dispone de ventana de contexto de texto) |
| Tipos de cuantizacion | float (fp32) y w8a16 (pesos de 8 bits, activaciones de 16 bits) sobre QNN |
| Idiomas soportados | ingles (entrenado sobre LibriSpeech); el resto de idiomas no esta especificado |
| Licencia | apache-2.0 |
| Formato de pesos | PyTorch (modelo original); artefactos precompilados QNN ONNX para dispositivos Qualcomm |

## Arquitectura y entrenamiento

La arquitectura combina un extractor de caracteristicas convolucional sobre la onda de audio con un bloque Conformer: un encoder que intercala modulos de atencion multi-cabeza con redes convolucionales, e incorpora atencion de posicion relativa en lugar de embeddings posicionales absolutos. En esta configuracion "large" el encoder tiene 24 capas, 1024 dimensiones ocultas y 16 cabezas de atencion. La salida se decodifica mediante una cabeza CTC, que mapea directamente las representaciones del encoder a caracteres sin necesidad de un decodificador autorregresivo.

El entrenamiento parte del paradigma wav2vec 2.0 (referencia arXiv:2006.11477): un preentrenamiento auto-supervisado sobre audio sin etiquetar seguido de un ajuste fino supervisado. En este caso, el ajuste se realizo sobre 960 horas de LibriSpeech, el corpus de referencia para ASR en ingles. No se documenta en la informacion disponible el uso de RLHF, DPO ni tecnicas de alineacion, algo esperable al tratarse de un modelo CTC puro. La innovacion destacable para el consumidor es el empaquetado de Qualcomm: exportacion y compilacion del grafo a QNN con soporte de cuantizacion w8a16 para ejecucion acelerada en NPU.

## Capacidades

- Reconocimiento automatico del habla en ingles a partir de audio crudo muestreado a 16 kHz.
- Decodificacion CTC voraz, que produce la transcripcion directamente sin beam search ni modelo de lenguaje externo en el modo descrito.
- Ejecucion en tiempo real sobre hardware Qualcomm, segun la etiqueta `real_time` del repositorio.
- Despliegue on-device en plataformas moviles y de borde (tag `android`, chipsets Snapdragon y Dragonwing).
- No soporta generacion de texto libre, razonamiento, codigo ni matematicas: es un modelo especializado exclusivamente en ASR.
- No dispone de tool calling ni function calling.
- No dispone de capacidades de agente ni de razonamiento multi-paso.
- Capacidades multilingues: no disponibles (modelo entrenado solo en ingles).
- No incorpora vision, audio de salida, ni modo "thinking".

## Casos de uso

- Transcripcion de voz en el propio dispositivo: al ejecutarse sobre NPU Snapdragon con artefactos `w8a16`, permite dictado y transcripcion offline sin enviar audio a la nube, lo que mejora la privacidad y elimina la dependencia de conectividad.
- Subtitulado automatico de audio en ingles: el modelo acepta audio crudo a 16 kHz y genera transcripcion directa, adecuado para generar subtitulos en aplicaciones de reproduccion de contenido en ingles.
- Comandos de voz en aplicaciones moviles: la etiqueta `real_time` y el soporte Android lo hacen util para reconocimiento de comandos cortos en asistentes integrados en el terminal.
- Accesibilidad para personas con discapacidad auditiva: transcripcion continua de conversaciones o audio ambiente en el dispositivo, sin coste de servidor.
- Post-procesado de reuniones y notas de voz: al ser un modelo de reconocimiento puro y rapido, encaja en pipelines que transcriben grabaciones y luego pasan el texto a otro sistema para resumen o analisis.
- Transcripcion en aplicaciones industriales o de campo con conectividad limitada: el despliegue sobre plataformas Dragonwing (orientadas a IoT y edge) permite operar en entornos sin red.
- Integracion en pipelines de datos de voz: transcripcion por lotes de audios en ingles como paso previo a busqueda, indexacion o analitica de contenido.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

La model card menciona la existencia de una seccion de rendimiento ("performance summary") por dispositivo, pero no incluye cifras de WER, MMLU, HumanEval ni metricas equivalentes en el material proporcionado.

## Requisitos de hardware

- Orientacion principal: no es un modelo pensado para GPU de servidor, sino para NPUs de Qualcomm y despliegue en el borde.
- Plataformas con artefactos precompilados disponibles: Snapdragon 8 Elite Gen 5 for Galaxy, Snapdragon 8 Elite for Galaxy, Snapdragon X2 Elite, Snapdragon X Elite, Snapdragon 8 Gen 3, Snapdragon 8 Gen 1, Qualcomm Dragonwing IQ-8275, Dragonwing QCS8550 (proxy) y Dragonwing IQ-9075.
- Runtime de despliegue: PRECOMPILED_QNN_ONNX sobre QAIRT 2.50 y ONNX Runtime 1.30.0 (algunos conjuntos declaran solo QAIRT 2.50).
- Precisión: existen variantes `float` y `w8a16`. La cuantizacion `w8a16` reduce el peso del modelo de forma notable y es la recomendada para moviles, a costa de una posible perdida de exactitud en la transcripcion.
- Huella de memoria estimada: con ~600 M de parametros, la variante en fp32 ronda los 2,4 GB de pesos, mientras que una cuantizacion a 8 bits de pesos se situa en torno a 600 MB, mas las activaciones. Estas cifras son estimaciones y no estan confirmadas en la model card.
- Ejecucion en GPU de consumidor: no esta documentada en la informacion disponible. El modelo base `facebook/wav2vec2-conformer-rel-pos-large-960h-ft` si puede ejecutarse con PyTorch sobre CPU o GPU, pero el repositorio de Qualcomm esta orientado a NPU.
- Opciones de despliegue: Qualcomm AI Hub Workbench y la libreria ai-hub-models; el modelo original admite herramientas habituales de PyTorch/Transformers para inferencia en CPU/GPU.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / entrada | Idioma | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| qualcomm/Wav2Vec2-Conformer-Large-960h | ~600 M (estimado) | Audio crudo a 16 kHz | Ingles | apache-2.0 | Artefactos QNN ONNX optimizados para Qualcomm |
| facebook/wav2vec2-conformer-rel-pos-large-960h-ft | ~600 M (estimado) | Audio crudo a 16 kHz | Ingles | apache-2.0 | Pesos PyTorch en HuggingFace (modelo base) |
| facebook/wav2vec2-large-960h | ~317 M | Audio crudo a 16 kHz | Ingles | apache-2.0 | Pesos PyTorch en HuggingFace; encoder transformer sin modulos convolucionales |
| openai/whisper-large-v3 | no disponible en la informacion proporcionada | Ventana de audio de 30 s | Multilingue | licencia propia de OpenAI | Pesos PyTorch en HuggingFace; arquitectura encoder-decoder |

El modelo de Qualcomm se diferencia de los pesos originales de Meta y de alternativas como Whisper en su enfoque de despliegue: no busca ser un ASR generalista multilingue, sino un artefacto compilado y cuantizado para NPU Qualcomm. Frente a Whisper, carece de capacidades multilingues y de formato de salida con puntuacion, pero ofrece un coste computacional menor y una integracion directa con el ecosistema QNN.

## Limitaciones y advertencias

- Idioma: solo ingles. No hay soporte documentado para castellano ni otros idiomas en la informacion disponible.
- Dominio: el ajuste se realizo sobre LibriSpeech (habla leida de audiolibros), por lo que el rendimiento puede degradarse con acentos marcados, ruido de fondo, solapamiento de voces o habla espontanea.
- Salida sin formato: al usar decodificacion CTC voraz, es probable que no genere puntuacion, mayusculas ni segmentacion fiable; requerira post-procesado para texto legible.
- Riesgo de error: como todo sistema ASR, puede producir transcripciones incorrectas, especialmente en nombres propios, terminologia tecnica y numeros. No se debe confiar en su salida sin revision en contextos criticos.
- Dependencia de hardware: los artefactos precompilados estan ligados a versiones concretas de QAIRT y ONNX Runtime y a chipsets especificos, lo que reduce su portabilidad a otros entornos.
- Restricciones de licencia: la licencia apache-2.0 es permisiva y permite uso comercial, pero conviene verificar las condiciones de las dependencias de Qualcomm (QAIRT, QNN, ONNX Runtime) por separado.
- Sesgos: no hay informacion en la model card sobre evaluaciones de sesgo o equidad entre variedades de ingles.
- Datos incompletos: no se publican cifras de exactitud (WER) en la informacion disponible, por lo que la decision de adopcion exige una evaluacion propia sobre el caso de uso objetivo.
- Estado del repositorio: registra 0 descargas y 0 "likes" en el momento de la consulta, lo que sugiere baja adopcion publica y poca validacion externa.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/qualcomm/Wav2Vec2-Conformer-Large-960h
- Modelo base de Meta: https://huggingface.co/facebook/wav2vec2-conformer-rel-pos-large-960h-ft
- Libreria Qualcomm AI Hub Models: https://github.com/qualcomm/ai-hub-models/blob/v0.64.0/src/qai_hub_models/models/wav2vec2_conformer
- Qualcomm AI Hub Workbench: https://workbench.aihub.qualcomm.com
- Paper wav2vec 2.0 (arXiv:2006.11477): https://arxiv.org/abs/2006.11477
- Paper Conformer (arXiv:2005.08100): https://arxiv.org/abs/2005.08100
- Web de Qualcomm: https://www.qualcomm.com/
- Informacion corporativa de Qualcomm: https://www.qualcomm.com/company
