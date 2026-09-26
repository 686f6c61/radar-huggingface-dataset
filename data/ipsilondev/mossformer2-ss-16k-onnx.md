# ipsilondev/MossFormer2-SS-16K-ONNX

## Resumen

MossFormer2-SS-16K-ONNX es una exportación a ONNX con cuantización INT8 del modelo MossFormer2_SS_16K, un separador de voz monoaural de dos hablantes que trabaja en el dominio del tiempo a 16 kHz. El modelo original fue desarrollado por Alibaba Group dentro del proyecto ClearerVoice-Studio, y esta versión cuantizada la publica el usuario ipsilondev con el objetivo de reducir el tamaño del artefacto de inferencia sin degradar de forma audible la señal de salida.

El problema que resuelve es concreto: dado un fragmento de audio en el que dos personas hablan simultáneamente y se solapan en el mismo canal, el modelo devuelve dos pistas separadas, una por hablante. Frente al checkpoint original en PyTorch (670 MB) o a una exportación ONNX en FP32 (230 MB), este artefacto ocupa 90.9 MB en disco, lo que supone una reducción del 60 % respecto al ONNX FP32 y lo hace viable en entornos sin GPU, integrado en aplicaciones de escritorio, navegador o servicios con CPU limitada.

La relevancia actual del modelo es práctica más que arquitectónica: no introduce una arquitectura nueva, sino que demuestra que la cuantización INT8 sobre un separador de voz en dominio del tiempo conserva la fidelidad de salida (correlación de Pearson de 0.999992 frente al baseline FP32 en la prueba publicada). Es, por tanto, una pieza de despliegue, no un modelo de investigación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MossFormer2 (modelo de separación de voz en dominio del tiempo, 2 hablantes), exportado a ONNX |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (procesa la forma `[N, sequence_length]` completa que se le entregue; no se documenta ventana máxima) |
| Tipos de cuantizacion | INT8 (artefacto publicado); el autor referencia FP32 como baseline (230 MB ONNX / 670 MB PyTorch) |
| Idiomas soportados | en (etiqueta declarada); la separación de voz es en gran medida independiente del idioma, pero no se documenta validación multilingüe |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (Opset 13), fichero `model.int8.onnx` |
| Tamano del artefacto | 90.9 MB |
| Frecuencia de muestreo | 16 kHz |
| Entrada | `inputs`: `[N, sequence_length]`, float32, forma de onda cruda |
| Salidas | `spk0` y `spk1`: `[N, sequence_length]`, float32 |
| Tarea (pipeline) | audio-to-audio |
| Tamano del repositorio | 0.1 GB |

## Arquitectura y entrenamiento

La ficha del autor no describe la arquitectura interna, solo identifica el modelo de origen: MossFormer2_SS_16K, un separador de voz monoaural de dos hablantes que opera en el dominio del tiempo a 16 kHz. El checkpoint original procede del proyecto ClearerVoice-Studio de Alibaba Group, cuyo repositorio upstream se enlaza en la model card. La exportación se ha realizado a ONNX Opset 13 y posteriormente se ha cuantizado a INT8, dando como resultado un fichero de 90.9 MB.

No se documentan en la información disponible ni el número de parámetros del modelo, ni el volumen de datos de entrenamiento, ni la composición del dataset, ni si hubo etapas de ajuste fino con RLHF o DPO (algo poco habitual en modelos de separación de audio). Tampoco se detalla qué técnica de cuantización se aplicó (estática, dinámica, QAT) ni qué capas quedaron excluidas del proceso. Lo único verificable técnicamente es el resultado de la comparación contra el baseline: en una prueba con `input_ss.wav` (4.41 s de audio mezclado de dos hablantes), la salida INT8 presenta una similitud coseno de 0.999992 y 0.999986 para los hablantes 0 y 1 respectivamente, una correlación de Pearson idéntica, un SI-SNR de 47.76 dB y 45.58 dB, y un RMSE de 0.0234 y 0.0235.

Conviene interpretar bien esas cifras: miden la fidelidad del artefacto cuantizado respecto a la salida del modelo PyTorch FP32, no la calidad absoluta de separación. Un SI-SNR de 47.76 dB indica que la pérdida introducida por la cuantización es inaudible, pero no dice nada sobre cuánto mejor o peor separa MossFormer2 en comparación con otros separadores.

## Capacidades

- Separación de voz de dos hablantes en una señal monoaural mezclada, devolviendo dos pistas independientes (`spk0` y `spk1`).
- Procesamiento en dominio del tiempo sobre forma de onda cruda a 16 kHz, sin necesidad de convertir a espectrogramas ni de features externas.
- Inferencia sobre CPU mediante `CPUExecutionProvider` de ONNX Runtime, sin requisito de GPU.
- Procesamiento por lotes: la dimensión `N` de la entrada permite pasar varias señales en una misma llamada.
- Ejecución en cualquier runtime compatible con ONNX Opset 13 (ONNX Runtime, y potencialmente otros backends ONNX).
- No dispone de tool calling, function calling, capacidades de agente, razonamiento multi-paso ni generación de texto: es un modelo puramente de audio.
- No tiene modo thinking, ni capacidades de visión, ni salida de texto.
- La renormalización RMS posterior a la inferencia es responsabilidad del usuario; el código de ejemplo la incluye porque las salidas no vienen escaladas al nivel de la mezcla original.

## Casos de uso

- Limpieza de grabaciones de reuniones: cuando dos participantes hablan a la vez en una sala con un único micrófono, el modelo permite generar dos pistas separadas que después se pueden transcribir por separado con un ASR, mejorando la precisión de la diarización en los tramos solapados.
- Preprocesado para pipelines de subtitulado automático: insertar el separador antes de un motor de reconocimiento de voz reduce los errores en segmentos donde las voces se pisan, un escenario frecuente en podcast, entrevistas y mesas redondas.
- Edición de audio y postproducción: aislar la voz de cada interlocutor en una grabación de campo para poder ajustar niveles, aplicar puertas de ruido o reemplazar una de las voces sin tocar la otra.
- Archivística y recuperación de material histórico: separar entrevistas antiguas grabadas en mono con micrófonos deficientes, donde los hablantes se solapan, para hacer el contenido indexable y buscable por hablante.
- Aplicaciones de accesibilidad: separar la voz de un interlocutor principal del ruido de fondo conversacional en tiempo casi real sobre CPU, útil en ayudas auditivas o en software de apoyo a personas con dificultades de comprensión en entornos ruidosos.
- Despliegue en aplicaciones de escritorio o móvil sin GPU: con 90.9 MB y ejecución en CPU vía ONNX Runtime, el modelo se puede empaquetar dentro de una aplicación nativa o de un servicio ligero en el borde, donde no hay acceso a aceleradores.
- Análisis forense de audio: separar pistas para identificar voces distintas y analizarlas de forma independiente, con la ventaja de que el artefacto cuantizado permite procesar grandes volúmenes de grabaciones en máquinas modestas.
- Generación de datos sintéticos de entrenamiento: producir pares (mezcla, fuente) a partir de audio limpio para alimentar otros modelos de separación o de ASR, invirtiendo el uso habitual del modelo.

## Benchmarks y rendimiento

La model card publica una única comparación: la salida del artefacto INT8 frente al baseline oficial PyTorch FP32 de Alibaba, sobre `input_ss.wav` (4.41 s de mezcla de dos hablantes). No se han publicado resultados de benchmarks estándar de separación de voz (SI-SNRi, SDRi sobre WSJ0-2mix, Libri2Mix u otros conjuntos de referencia) en la información disponible.

| Metrica | Speaker 0 | Speaker 1 | Interpretacion |
|---|---|---|---|
| Similitud coseno | 0.999992 | 0.999986 | Prácticamente idéntico al baseline FP32 |
| Correlación de Pearson (r) | 0.999992 | 0.999986 | Prácticamente idéntico al baseline FP32 |
| SI-SNR | 47.76 dB | 45.58 dB | Pérdida inaudible (> 45 dB) |
| RMSE | 0.0234 | 0.0235 | Alta fidelidad |

Nota metodológica: estos valores cuantifican la degradación introducida por la cuantización INT8 respecto a la referencia FP32, no la calidad absoluta de separación del modelo. Una prueba con un solo fichero de 4.41 s es además una muestra muy limitada y no cubre distintas condiciones de relación señal-ruido, solapamiento, número de hablantes ni tipos de contenido.

## Requisitos de hardware

- VRAM estimada para inferencia: 0 MB en GPU si se ejecuta en CPU; el artefacto ocupa 90.9 MB en disco y el consumo de memoria en tiempo de ejecución depende de la longitud de la señal de entrada, no documentada.
- GPU recomendadas: no aplica; el ejemplo oficial usa `CPUExecutionProvider`. Cualquier GPU compatible con ONNX Runtime serviría, pero no se documenta ningún perfil de rendimiento en GPU.
- Compatibilidad con GPU de consumo: irrelevante en este caso, porque el modelo está pensado para CPU. Cabe en cualquier equipo, incluidos portátiles y dispositivos de borde, a nivel de almacenamiento.
- Opciones de despliegue: ONNX Runtime (provider de CPU en el ejemplo); cualquier runtime que soporte ONNX Opset 13. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que son herramientas orientadas a modelos de lenguaje y no aplican aquí. Para el flujo completo de ClearerVoice-Studio, el repositorio upstream proporciona su propio pipeline en PyTorch.
- Latencia y throughput estimados: no disponibles. La model card no incluye tiempos de inferencia ni comparación de velocidad entre las versiones FP32 e INT8, aunque la reducción de tamaño y el uso de INT8 sugieren una mejora en CPU que no está cuantificada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto/entrada | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MossFormer2-SS-16K-ONNX (INT8) | no disponible | audio mono 16 kHz, dos hablantes | Fidelidad 0.999992 de similitud coseno frente a FP32 | Apache-2.0 | ONNX, 90.9 MB |
| MossFormer2_SS_16K (PyTorch, upstream) | no disponible | audio mono 16 kHz, dos hablantes | Baseline de referencia del que deriva el anterior | no disponible en la información proporcionada | PyTorch, 670 MB |
| Exportación ONNX FP32 de MossFormer2_SS_16K | no disponible | audio mono 16 kHz, dos hablantes | Referencia intermedia citada por el autor | no disponible | ONNX, 230 MB |
| Otros separadores de voz (SepFormer, Conv-TasNet, DPRNN, TF-GridNet) | no disponible | 8/16 kHz según variante | no disponible | varía según implementación | no disponible |

La comparativa con arquitecturas alternativas de separación de voz (SepFormer de SpeechBrain, Conv-TasNet, DPRNN o TF-GridNet) no se puede completar con datos de la información proporcionada: no hay resultados de benchmarks comunes que permitan situar a MossFormer2 frente a ellas. La comparación realmente útil aquí es interna a la propia familia de artefactos, donde la versión INT8 reduce el tamaño un 60 % respecto al ONNX FP32 a cambio de una pérdida medida de fidelidad prácticamente nula en la muestra publicada.

## Limitaciones y advertencias

- El modelo solo separa dos hablantes. Con tres o más voces solapadas, el resultado no está garantizado ni documentado.
- Está restringido a 16 kHz y a entrada monoaural. Audio estéreo, otras frecuencias de muestreo o señales que no sean voz humana quedan fuera del caso de uso previsto.
- La etiqueta de idioma es `en`. Aunque la separación de voz no depende estrictamente del idioma, no hay validación publicada en otros idiomas, por lo que el rendimiento en castellano u otras lenguas no está verificado.
- La evaluación publicada se apoya en un único fichero de 4.41 segundos. Es una muestra insuficiente para extraer conclusiones sobre robustez en condiciones variadas de ruido, reverberación o solapamiento.
- El SI-SNR reportado mide fidelidad frente al baseline FP32, no calidad de separación. No debe citarse como métrica de rendimiento del modelo frente a otros separadores.
- Las salidas del modelo no vienen renormalizadas al nivel RMS de la entrada; el usuario debe aplicar la renormalización manualmente, tal como muestra el ejemplo de la model card. Omitir ese paso produce pistas con niveles inconsistentes.
- La cuantización INT8 puede introducir artefactos en señales muy distintas de las usadas en la verificación; esos casos no están cubiertos por la prueba publicada.
- No se documentan sesgos específicos, pero al ser un modelo de voz pueden aparecer diferencias de rendimiento según el timbre, el acento o el tipo de habla de los interlocutores.
- El repositorio tiene 0 descargas y 0 likes, está creado y actualizado el mismo día (26 de septiembre de 2026) y no cuenta con validación externa ni mantenimiento demostrable. Conviene verificar el fichero antes de usarlo en producción.
- La licencia declarada es Apache-2.0, permisiva y apta para uso comercial, pero al derivar de un checkpoint de Alibaba Group conviene confirmar las condiciones del modelo upstream antes de un despliegue comercial.
- Existe riesgo de alucinación en el sentido de artefactos de audio: el modelo puede generar componentes espectrales o de señal que no estaban presentes en la mezcla original, especialmente en tramos con poco contenido vocal.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ipsilondev/MossFormer2-SS-16K-ONNX
- Checkpoint upstream: https://huggingface.co/alibabasglab/MossFormer2_SS_16K
- Repositorio ClearerVoice-Studio: https://github.com/modelscope/ClearerVoice-Studio
- No se han encontrado en la búsqueda web otros enlaces relevantes (papers, blogs, demos o repos adicionales) relacionados con este modelo.
