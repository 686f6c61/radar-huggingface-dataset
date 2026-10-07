# SajjadMajdi/shenava-rizeh-fa-int8

## Resumen

Shenava Rizeh fa int8 es la versión cuantizada a int8 del modelo de reconocimiento automático de voz (ASR) en persa «Shenava Rizeh v1.0», desarrollado originalmente por Reza2kn y empaquetado por el usuario SajjadMajdi para su ejecución en dispositivos con sherpa-onnx. Se trata de un modelo FastConformer CTC de aproximadamente 32 millones de parámetros, exportado a ONNX y cuantizado dinámicamente con onnxruntime, lo que reduce el tamaño del artefacto de 117 MB (fp32) a 36 MB (int8) manteniendo el mismo error de palabra medido por el autor (12,4 % sobre 25 clips de habla limpia).

Su relevancia radica en el segmento de ASR embebido: el modelo no necesita GPU ni conexión de red, y alcanza un factor de tiempo real (RTF) de 0,024 sobre un único hilo de CPU de portátil, lo que equivale a transcribir un comando de tres segundos en aproximadamente 0,1 segundos en un teléfono. Está pensado para comandos cortos capturados con micrófono cercano, no para habla espontánea ni audio telefónico, donde el propio autor reporta errores de palabra del 63 al 70 %.

La licencia es Apache-2.0, heredada del modelo original, y el repositorio tiene un tamaño declarado de 0,0 GB, con cero descargas y cero «likes» en el momento de la consulta, por lo que se trata de una publicación reciente y sin validación independiente por parte de la comunidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | FastConformer CTC (encoder Conformer con submuestreo convolucional y cabecera CTC) |
| Parametros totales | 32 millones (modelo original Shenava Rizeh v1.0) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible; en ASR la ventana depende de la longitud del clip de audio, no de un contexto de tokens |
| Tipos de cuantizacion | int8 dinamica (onnxruntime); existe version fp32 de 117 MB |
| Idiomas soportados | persa (fa) unicamente |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (model.int8.onnx) junto con tokens.txt |
| Tamano del artefacto | 36 MB (int8) frente a 117 MB (fp32) |
| Pipeline | automatic-speech-recognition |
| Runtime objetivo | sherpa-onnx (OfflineRecognizer.from_nemo_ctc) |
| Repositorio | https://huggingface.co/SajjadMajdi/shenava-rizeh-fa-int8 |

## Arquitectura y entrenamiento

El modelo es un FastConformer CTC, una variante del encoder Conformer que aplica submuestreo convolucional para reducir la longitud de la secuencia antes de los bloques de auto-atención, lo que abarata la inferencia respecto a un Conformer estándar. La salida se obtiene mediante decodificación CTC, sin decodificador autorregresivo, y se carga en sherpa-onnx a través de la API `OfflineRecognizer.from_nemo_ctc`, lo que confirma su origen en el ecosistema NeMo. Con 32 millones de parámetros, el modelo es deliberadamente compacto para permitir ejecución en CPU y en dispositivos móviles.

La información disponible no detalla el volumen de horas de entrenamiento, la composición del dataset, ni si se aplicaron fases de ajuste fino con RLHF, DPO o un modelo de lenguaje externo para el rescoring. Tampoco se documenta el vocabulario ni el tokenizador más allá del fichero tokens.txt que acompaña al ONNX. La cuantización se realizó de forma dinámica con onnxruntime, preservando los metadatos del modelo; el autor advierte explícitamente que el campo `normalize_type` de los metadatos debe quedar vacío, ya que en caso contrario la salida se corrompe. El proceso de cuantización no alteró el error de palabra medido (12,4 % en ambos casos), lo que sugiere que la pérdida de precisión numérica no afectó de forma apreciable a este conjunto de evaluación concreto.

## Capacidades

- Transcripción de voz a texto en persa, en modo offline y sobre CPU, sin necesidad de GPU ni de conectividad de red.
- Decodificación CTC mediante sherpa-onnx (`OfflineRecognizer.from_nemo_ctc`) con los ficheros `model.int8.onnx` y `tokens.txt`.
- Normalización numérica: el modelo escribe los números como palabras en lugar de como cifras, según indica el autor.
- Ejecución en dispositivos móviles y sistemas embebidos gracias al tamaño de 36 MB y al bajo coste computacional.
- Inferencia en tiempo real: RTF de 0,024 sobre un único hilo de CPU de portátil, aproximadamente 0,1 s para un comando de tres segundos en teléfono.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes, razonamiento multi-paso ni modos de «pensamiento».
- No se documenta capacidad multilingüe: el modelo está etiquetado únicamente para persa (fa).
- No se documentan capacidades de visión, audio más allá del ASR, diarización de hablantes, marcas de tiempo ni puntuación automática.
- No se documenta vocabulario personalizado ni adaptación a dominio mediante prompts.

## Casos de uso

- Dictado y comandos de voz en aplicaciones móviles en persa: al pesar 36 MB y ejecutarse en CPU, el modelo puede integrarse en una app Android o iOS mediante sherpa-onnx para convertir frases cortas capturadas con el micrófono del propio dispositivo, sin enviar audio a ningún servidor.
- Asistentes de voz embebidos en dispositivos sin conectividad: el modelo permite construir interfaces de voz para electrodomésticos, terminales de punto de venta o paneles industriales que operan en redes aisladas, siempre que las órdenes sean cortas y el micrófono esté cerca del hablante.
- Accesibilidad para usuarios con discapacidad motora: permite introducir texto en persa por voz en aplicaciones de escritorio o móviles donde el teclado no es una opción viable, con una latencia de aproximadamente 0,1 s por comando de tres segundos.
- Preetiquetado de corpus de audio en persa: gracias a su RTF de 0,024 sobre un hilo de CPU, un servidor sin GPU puede transcribir grandes volúmenes de clips cortos y limpios como paso previo a una revisión humana o a un modelo mayor.
- Prototipado de pipelines de voz en arquitecturas edge: al exportarse a ONNX, el modelo se integra en runtimes de inferencia ligeros sobre Raspberry Pi o dispositivos con ARM, lo que facilita pruebas de concepto de reconocimiento de comandos antes de escalar a modelos mayores.
- Verificación de palabras clave mediante transcripción: en escenarios de control por voz donde solo interesa reconocer un conjunto cerrado de órdenes cortas, la transcripción completa permite aplicar una comprobación por coincidencia de cadenas sobre la salida del modelo.
- Subtitulado de notas de voz cortas: para grabaciones de voz limpias y de duración reducida, el modelo puede generar la transcripción de forma local en la aplicación que gestiona las notas, evitando depender de servicios en la nube.

## Benchmarks y rendimiento

Los únicos datos publicados en la información disponible son los aportados por el autor del empaquetado. No se han publicado resultados de benchmarks estandarizados (MMLU, HumanEval, GSM8K u otros) en la información disponible, ya que se trata de un modelo de ASR y no de un modelo de lenguaje.

| Metrica | Valor | Condiciones |
|---|---|---|
| Error de palabra (WER) | 12,4 % | 25 clips de habla limpia; idéntico al de la versión fp32 |
| Error de palabra (WER) | 63 % - 70 % | Habla espontánea y conversaciones telefónicas |
| Factor de tiempo real (RTF) | 0,024 | Un único hilo de CPU de portátil |
| Latencia | ~0,1 s | Comando de tres segundos en teléfono |
| Tamano int8 | 36 MB | Versión cuantizada |
| Tamano fp32 | 117 MB | Versión sin cuantizar |

## Requisitos de hardware

- VRAM necesaria para inferencia: no aplica; el modelo está diseñado para ejecución en CPU y no requiere GPU.
- Memoria de sistema estimada: en torno a 50-100 MB en el caso int8 y algo más de 150 MB en fp32, incluyendo el runtime de ONNX Runtime y los buffers de audio.
- GPU recomendadas: no son necesarias; el modelo está pensado para CPU. Cualquier GPU serviría para acelerar la inferencia, pero no se documenta ningún backend de GPU específico.
- Compatibilidad con GPU de consumo: el modelo cabe en cualquier GPU de consumo, pero su uso sería desproporcionado dado su tamano de 36 MB.
- Despliegue: sherpa-onnx (con bindings para Python, C++, Android, iOS y C# entre otros) y ONNX Runtime directamente. No procede usar vLLM, llama.cpp ni TGI, ya que el modelo no es un transformer generativo de texto.
- Latencia y throughput: RTF de 0,024 sobre un único hilo de CPU de portátil implica procesar aproximadamente 40 veces más rápido que el tiempo real; un comando de tres segundos se resuelve en unos 72 ms en ese entorno y en torno a 100 ms en un teléfono.
- Plataformas objetivo: dispositivos móviles (Android e iOS), sistemas embebidos ARM y equipos de escritorio sin GPU.

## Comparativa con modelos similares

No se dispone de resultados de evaluación comparativa en persa para el resto de alternativas, por lo que la comparación se limita a características objetivas de despliegue. Las cifras de error de palabra de los modelos alternativos figuran como «no disponible» al no haberse aportado en la información de referencia.

| Modelo | Parametros | Idiomas | Licencia | Formato | Contexto | WER en persa |
|---|---|---|---|---|---|---|
| Shenava Rizeh fa int8 | 32 M | Persa | Apache-2.0 | ONNX int8 | no aplica | 12,4 % en habla limpia (25 clips) |
| Shenava Rizeh v1.0 (fp32) | 32 M | Persa | Apache-2.0 | Pesos originales y exportacion a ONNX | no aplica | 12,4 % en habla limpia (mismo conjunto) |
| Whisper tiny | 39 M | Multilingue (incluye persa) | MIT | safetensors y conversiones GGML/ONNX | no aplica | no disponible |
| Whisper base | 74 M | Multilingue (incluye persa) | MIT | safetensors y conversiones GGML/ONNX | no aplica | no disponible |

La ventaja diferencial de Shenava Rizeh int8 frente a alternativas multilingües del mismo orden de magnitud es su tamano reducido y su integración directa con sherpa-onnx para ejecución en dispositivo, además de estar entrenado específicamente para persa. Como contrapartida, carece de la cobertura multilingüe y del ecosistema de herramientas de las familias multilingües, y no hay datos públicos que permitan comparar su precisión con la de esas alternativas en un mismo conjunto de evaluación en persa.

## Limitaciones y advertencias

- El error de palabra se dispara en habla espontánea y en conversaciones telefónicas, con valores declarados del 63 % al 70 %, lo que desaconseja su uso en reuniones, centros de llamadas o audio capturado a distancia.
- El rendimiento óptimo se limita a comandos cortos con micrófono cercano; no hay datos sobre su comportamiento con ruido de fondo, reverberación o solapamiento de hablantes.
- Solo soporta persa (fa); no traduce ni transcribe otros idiomas.
- El autor advierte que el campo `normalize_type` de los metadatos debe permanecer vacío; si se modifica o se reescribe durante una conversión, la salida se corrompe.
- No se documentan sesgos de género, acento, dialecto o registro, pero tampoco se aporta información sobre la composición del conjunto de entrenamiento, por lo que el comportamiento fuera del dominio de evaluación es desconocido.
- Riesgo de alucinación y de sustituciones léxicas inherente a todo sistema ASR con decodificación CTC sin modelo de lenguaje externo de rescoring; no se documenta ningún mecanismo de mitigación.
- La evaluación publicada se apoya en tan solo 25 clips de habla limpia, una muestra demasiado pequena para estimar de forma fiable el error en producción.
- La licencia Apache-2.0 permite uso comercial y modificación, siempre que se conserven los avisos de copyright y se atribuya la autoría; el repositorio indica explícitamente que todo el mérito del modelo original corresponde a Reza2kn.
- El repositorio presenta cero descargas y cero «likes», y un tamano declarado de 0,0 GB, lo que indica ausencia de validación por parte de la comunidad y posibles inconsistencias en los metadatos de la publicación.
- La ausencia de documentación sobre puntuación, mayúsculas, marcas de tiempo y segmentación obliga a validar estos aspectos antes de integrar el modelo en un producto final.
- Las fechas de creación y actualización registradas en el repositorio (2026) resultan anómalas y deben verificarse antes de citar la ficha.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/SajjadMajdi/shenava-rizeh-fa-int8
- Modelo original Shenava Rizeh v1.0, de Reza2kn: no disponible en la información proporcionada
- Repositorio de sherpa-onnx: https://github.com/k2-fsa/sherpa-onnx
- Repositorio de ONNX Runtime: no disponible en la información proporcionada
- Paper de FastConformer: no disponible en la información proporcionada
- Demo: no disponible en la información proporcionada
- Nota sobre la busqueda web: las consultas realizadas no devolvieron ningun enlace relevante sobre el modelo, su arquitectura o su entrenamiento; los resultados obtenidos correspondian a sitios de contenido para adultos y se han descartado por no ser fuentes validas.
