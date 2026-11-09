# sookie90/indic-conformer-600m-multilingual-int8

## Resumen

`sookie90/indic-conformer-600m-multilingual-int8` es una copia cuantizada a int8 del modelo de reconocimiento automático del habla (ASR) `ai4bharat/indic-conformer-600m-multilingual`, desarrollado originalmente por AI4Bharat. Se trata de un trabajo derivado: el autor del repositorio no entrena ni modifica la arquitectura, sino que aplica cuantización dinámica de pesos (QInt8) exclusivamente a los operadores MatMul del encoder ONNX, dejando el resto de componentes en fp32. El objetivo declarado es el despliegue en dispositivo (on-device) dentro de una aplicación llamada Veere, como motor adicional en un pipeline de consenso multi-motor.

La relevancia de esta ficha es acotada y conviene ser explícito: el repositorio tiene cero descargas y cero likes en el momento de la consulta, y la propia model card reconoce que la evaluación se limita a 85 clips de audio en hindi e hindi/inglés, en una única máquina (Apple M4 de 16 GB) y únicamente con el execution provider de CPU de ONNX Runtime. No hay resultados publicados para las otras lenguas indias que el modelo base cubre, ni pruebas con audio ruidoso o de campo lejano, ni mediciones con Core ML o GPU.

El modelo base es un Conformer de aproximadamente 600 millones de parámetros orientado a ASR multilingüe para lenguas indias (la model card menciona 22 lenguas cubiertas). Esta variante reduce el paquete de pesos de unos 2,4 GB en fp32 a 964 MB (31 archivos), con un pico de memoria residente medido de aproximadamente 1,1 GB frente a 2,6 GB en fp32. La licencia es MIT, heredada del modelo fuente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Conformer (encoder convolucional + atención), ASR con cabezas CTC y RNN-T |
| Parametros totales | aproximadamente 600 M (según el nombre del modelo base; no se detalla desglose por componente) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | int8 dinámica (QInt8) sobre MatMul del encoder; convoluciones, CTC, RNN-T, joint heads y vocabulario en fp32 |
| Idiomas soportados | 22 lenguas indias según el modelo base (la model card de esta variante no enumera la lista); evaluación empírica solo en hindi e hindi/inglés |
| Licencia | MIT (heredada del modelo fuente) |
| Formato de pesos | ONNX (formato external-data; `encoder.onnx`, `encoder.onnx.data`, `ctc_decoder.onnx`, decodificador RNN-T, joint heads) |

## Arquitectura y entrenamiento

La arquitectura es la del modelo base de AI4Bharat: un Conformer para ASR, es decir, un encoder que combina bloques convolucionales y de auto-atención, con dos cabezas de decodificación (CTC y RNN-T). El repositorio de esta variante no aporta información sobre el entrenamiento original (número de tokens, composición del dataset, uso de RLHF/DPO u otras técnicas): esos datos corresponden al modelo fuente y no se reproducen en la model card de la copia cuantizada.

La única modificación técnica es la cuantización: se aplica cuantización dinámica de ONNX Runtime con pesos QInt8 sobre los operadores MatMul de `assets/encoder.onnx`, en formato external-data. Permanecen en fp32 las convoluciones, la cabeza CTC (`ctc_decoder.onnx`), el decodificador RNN-T, las joint heads y los ficheros de vocabulario e idioma. Las herramientas usadas son onnx 1.23.2 y onnxruntime 1.31.1, registradas en `manifest.json`. El build es reproducible: se ejecuta dos veces desde la revisión fijada del modelo fuente (`e9b71b369c048e2c6b634d4c131061c34e441179`) y los 31 archivos resultantes tienen sha256 idéntico en ambas ejecuciones. El autor señala que, al mantenerse las convoluciones en fp32, existe margen para comprimir más, aunque no lo ha probado.

## Capacidades

- Reconocimiento automático del habla (transcripción de audio a texto) mediante encoder Conformer con decodificación CTC y RNN-T.
- Cobertura multilingüe declarada de 22 lenguas indias en el modelo base (lista no disponible en esta variante).
- Manejo de code-switching hindi/inglés: es el escenario con más datos de evaluación en la model card (65 de los 85 clips).
- Ejecución en CPU mediante ONNX Runtime, con un consumo de memoria notablemente inferior al modelo fp32.
- No se documenta soporte de tool calling, function calling, agentes, razonamiento multi-paso, visión, audio generativo ni modo thinking: es un modelo puramente ASR.
- No se documentan capacidades de diarización, puntuación automática ni marcas de tiempo.

## Casos de uso

- Motor adicional en un pipeline de consenso multi-motor: la model card indica explícitamente este uso previsto; el modelo actúa como un votante más junto a otros motores ASR, y se recomienda mantener el modelo fp32 como fallback.
- Transcripción on-device en aplicaciones móviles o de escritorio con recursos limitados: el pico de memoria medido de aproximadamente 1,1 GB y el paquete de 964 MB lo hacen viable en equipos con 16 GB de RAM, como el Apple M4 usado en las pruebas.
- Procesamiento por lotes de audio en servidores sin GPU: al ejecutarse con el execution provider de CPU de ONNX Runtime, no requiere acelerador dedicado.
- Transcripción de conversaciones con mezcla hindi/inglés: es el escenario evaluado con 65 clips del corpus MUCS, aunque con un WER absoluto alto (aproximadamente 56 % en el scorer empleado).
- Prototipado e investigación en ASR para lenguas indias: sirve como punto de partida para comparar el efecto de la cuantización int8 frente a fp32 con las mismas fixtures.
- Integración en pipelines de verificación de integridad: el `manifest.json` con tamaños y sha256 de los 31 archivos permite validar descargas y builds reproducibles en entornos con requisitos de trazabilidad.

## Benchmarks y rendimiento

Los únicos datos publicados son los de la model card, medidos en un Apple M4 de 16 GB con ONNX Runtime en CPU, sobre 85 clips (20 en hindi, 65 de code-switching hindi/inglés del corpus MUCS) y con el scorer `bench_hindi_local` (WER ponderado por palabra).

| Metrica | fp32 | int8 | Cambio |
|---|---|---|---|
| Pico de memoria residente | 2.606 / 2.636 MB (dos ejecuciones) | 1.092 / 1.151 MB | aproximadamente -57 % |
| Tiempo total para los 85 clips | 133 s / 81 s | 77 s / 25 s | más rápido en ambos pares (máquina compartida, ruidosa) |
| WER, los 85 clips | 50,85 | 50,55 | -0,30 pt pareado, IC bootstrap 95 % [-0,94, +0,30] |
| WER, hindi (20 clips) | 16,19 | 15,04 | no disponible el intervalo |
| WER, hindi/inglés (65 clips) | 55,98 | 55,81 | no disponible el intervalo |

14 de los 85 clips decodifican de forma distinta (8 mejor, 6 peor). El límite superior del intervalo de confianza es +0,30 puntos, por lo que en este conjunto el modelo no empeora respecto a fp32. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) porque no aplican a un modelo ASR, ni comparaciones con WER de referencia de otros sistemas.

## Requisitos de hardware

- VRAM/RAM estimada para inferencia: pico de memoria residente de aproximadamente 1,1 GB en CPU (medido); el paquete de archivos ocupa 964 MB frente a unos 2,4 GB del bundle fp32.
- GPU recomendadas: no disponibles; la model card no documenta pruebas con GPU ni con Core ML, solo con el execution provider de CPU de ONNX Runtime.
- ¿Cabe en GPU de consumo? No hay datos publicados. Por tamaño (aproximadamente 600 M de parámetros en int8) cabría en cualquier GPU de consumo moderna, pero no se ha medido ni validado.
- Opciones de despliegue: ONNX Runtime (versión 1.31.1 usada en el build); no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI, que además no son el runtime natural para un modelo ASR ONNX.
- Latencia y throughput: los únicos datos son los tiempos de la tabla anterior (85 clips en 25-77 s en int8 frente a 81-133 s en fp32 en un M4, máquina compartida y con alta variabilidad entre ejecuciones). No hay mediciones de energía, temperatura ni sesiones largas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| sookie90/indic-conformer-600m-multilingual-int8 | aprox. 600 M | no disponible | 22 lenguas indias (declaradas en el base) | MIT | ONNX int8 | Esta ficha; evaluación limitada a 85 clips |
| ai4bharat/indic-conformer-600m-multilingual | aprox. 600 M | no disponible | 22 lenguas indias | MIT | pesos originales (no detallado aquí) | Modelo fuente en fp32; referencia de calidad y fallback recomendado |
| Alternativas ASR de tamaño similar | no disponible | no disponible | no disponible | no disponible | no disponible | No se han proporcionado datos de otros modelos comparables en la información disponible |

## Limitaciones y advertencias

- Evaluación muy limitada: 85 clips, una sola máquina, solo execution provider de CPU. No se han probado las otras lenguas indias que cubre el modelo base, ni audio ruidoso o de campo lejano, ni Core ML o GPU.
- WER absoluto alto en code-switching hindi/inglés (aproximadamente 56 % en el scorer empleado, que mezcla manejo de escrituras); el autor lo describe como un motor entre varios, no como transcriptor único.
- Las convoluciones permanecen en fp32, por lo que la compresión no es máxima y ese margen adicional no está probado.
- No hay mediciones de consumo energético, comportamiento térmico ni sesiones largas.
- Riesgo de alucinación: no documentado específicamente para este modelo; en ASR el modo de fallo típico es la sustitución o inserción de palabras, no la invención de contenido libre, pero no se aportan datos al respecto.
- Sesgos: no documentados. La cobertura desigual de las 22 lenguas en el modelo base puede traducirse en calidades muy dispares por idioma.
- Licencia MIT heredada, apta para uso comercial; la propia model card advierte que el repositorio fuente no incluye fichero LICENSE y que el aviso MIT se toma de la organización AI4Bharat en GitHub, por lo que recomienda confirmación legal.
- Repositorio con cero descargas y cero likes: no hay evidencia de uso en producción por terceros.
- El uso previsto es como motor opcional en un pipeline de consenso; se recomienda mantener el modelo fp32 como fallback.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/sookie90/indic-conformer-600m-multilingual-int8
- Modelo base: https://huggingface.co/ai4bharat/indic-conformer-600m-multilingual
- Repositorio GitHub de AI4Bharat (IndicConformerASR): https://github.com/AI4Bharat/IndicConformerASR
- Revisión del modelo fuente fijada en el build: `e9b71b369c048e2c6b634d4c131061c34e441179` (no se proporciona URL directa a la revisión)
- Paper, blog o demo adicionales: no disponibles en la información proporcionada.
