# kreiners/htdemucs-fp16-web-onnx

## Resumen

htdemucs-fp16-web-onnx es una conversión a ONNX con precisión mixta float16 del modelo `htdemucs` de Demucs v4 (Hybrid Transformer Demucs, 4 stems), desarrollada por el usuario kreiners y publicada en Hugging Face. El modelo original lo desarrolló Meta AI (Alexandre Défossez y Simon Rouard) y resuelve el problema de separación de fuentes musicales: a partir de una mezcla de audio, extrae las pistas de voces, batería, bajo y otros. Esta versión está pensada específicamente para ejecutarse en el navegador mediante ONNX Runtime Web sobre WebGPU, lo que permite separar pistas en el cliente sin enviar audio a un servidor.

La relevancia de esta conversión es puramente práctica: reduce el peso del grafo de 180 MB a 92 MB y aproximadamente duplica la velocidad de inferencia (de 5-6 s a 2,4-2,8 s por segmento de 7,8 s en una GPU Intel Iris Xe), manteniendo la misma calidad de separación. El modelo base es un transformer híbrido que combina procesamiento en el dominio de la forma de onda y en el dominio espectral, una arquitectura presentada en el artículo *Hybrid Transformers for Music Source Separation* (ICASSP 2023).

No se dispone de información sobre el número de parámetros, la longitud de contexto en tokens ni los idiomas soportados, ya que no son magnitudes aplicables o no fueron publicadas en la model card. La licencia es MIT, igual que la del modelo Demucs original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Hybrid Transformer Demucs (Demucs v4), transformer híbrido para separación de fuentes |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo de audio; procesa segmentos de audio, no tokens) |
| Tipos de cuantizacion | float16 mixto (mixed float16); partes críticas en float32 |
| Idiomas soportados | no disponible (no aplica; modelo de audio) |
| Licencia | MIT |
| Formato de pesos | ONNX (`htdemucs_fp16.onnx`) |

## Arquitectura y entrenamiento

El modelo es una conversión del `htdemucs` de Demucs v4, un transformer híbrido que procesa la señal de audio tanto en el dominio temporal (forma de onda) como en el dominio de la frecuencia (espectrograma), combinando ambos para la separación de fuentes. El modelo original separa cuatro stems: voces, batería, bajo y otros. La conversión a ONNX se realizó con `convert_float_to_float16` de `onnxconverter-common`, usando `keep_io_types=True` para que las entradas y salidas permanezcan en float32.

La precisión mixta no se aplica de forma indiscriminada: se mantienen en float32 las normalizaciones (`InstanceNormalization`, `LayerNormalization`, `ReduceMean`, `Sqrt`, `Erf`), cuyas sumas de cuadrados desbordan en half; la normalización de entrada (media y dispersión sobre todo el segmento) junto con todos los nodos previos a ella; y las capas `ConvTranspose`, porque en half la salida del decodificador pierde calidad. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO, ya que la model card no los detalla; el entrenamiento corresponde al modelo Demucs original de Meta AI.

## Capacidades

- Separación de fuentes musicales en cuatro stems: voces, batería, bajo y otros.
- Procesamiento de audio a audio (pipeline `audio-to-audio`).
- Ejecución en navegador mediante ONNX Runtime Web sobre WebGPU.
- Inferencia en precisión mixta float16 con entradas y salidas en float32.
- Calidad de separación equivalente a la versión float32 (14,8 dB de relación voces/voz real en la medición publicada).
- No se documentan capacidades de tool calling, agentes, razonamiento multi-step, visión ni audio de entrada distinto de la mezcla musical.

## Casos de uso

- Separación de pistas en el navegador: una aplicación web puede cargar el modelo ONNX y separar voces, batería, bajo y otros directamente en el cliente con WebGPU, sin enviar el audio a un servidor y preservando la privacidad del usuario.
- Karaoke y remixes: extraer la pista de voces para generar versiones instrumentales o aislar la voz para remezclas, aprovechando que el modelo mantiene la calidad del float32 con la mitad del peso.
- Edición de audio en estudios pequeños: aislar stems para ajustar niveles o corregir una pista concreta antes de la mezcla final, con una latencia de 2,4-2,8 s por segmento de 7,8 s en hardware integrado.
- Herramientas de práctica musical: aplicaciones que silencian la pista de un instrumento para practicar sobre la mezcla, ejecutándose en el dispositivo del usuario.
- Procesamiento por lotes en servidores ligeros: al ser un grafo ONNX de 92 MB, puede desplegarse con ONNX Runtime en contenedores sin GPU dedicada de gama alta, reduciendo costes de infraestructura.
- Investigación y prototipado: servir como base para experimentos de separación de fuentes en entornos web o embebidos, gracias a su licencia MIT y a la disponibilidad del grafo float32 de origen.

## Benchmarks y rendimiento

Mediciones publicadas en la model card sobre un segmento de 7,8 s de una canción de prueba (voz mezclada con música), con onnxruntime-web 1.31 sobre WebGPU en una GPU Intel Iris Xe:

| Metrica | float32 | este modelo |
|---|---|---|
| Tamano | 180 MB | 92 MB |
| Tiempo por segmento | 5-6 s | 2,4-2,8 s |
| Voces frente a la voz real | 14,8 dB | 14,8 dB |
| Voces frente a las voces del float32 (SNR) | — | 48,2 dB |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible, ya que no son aplicables a un modelo de separación de audio.

## Requisitos de hardware

- Se requiere un adaptador WebGPU con la característica `shader-f16`; sin ella debe usarse el modelo float32.
- VRAM estimada: no disponible de forma explícita; el grafo ocupa 92 MB en disco, por lo que la huella en memoria es reducida.
- GPU recomendadas: no se especifican modelos concretos; la medición publicada se realizó en una GPU integrada Intel Iris Xe.
- Cabe en GPU de consumo: sí, al tratarse de un modelo de 92 MB y ejecutarse en una GPU integrada en la medición de referencia.
- Opciones de despliegue: ONNX Runtime Web sobre WebGPU (caso principal); al ser un grafo ONNX, es desplegable con otros runtimes compatibles con ONNX, aunque no se documentan en la model card.
- Latencia y throughput: 2,4-2,8 s por segmento de 7,8 s en Intel Iris Xe con onnxruntime-web 1.31, aproximadamente el doble de rápido que la versión float32 (5-6 s).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| htdemucs-fp16-web-onnx (este) | no disponible | no aplica | ONNX fp16 mixto | MIT | 92 MB, 2,4-2,8 s por segmento en Iris Xe |
| timcsy/demucs-web-onnx (float32) | no disponible | no aplica | ONNX fp32 | no disponible en la informacion | 180 MB, 5-6 s por segmento; misma calidad de separación |
| Demucs v4 htdemucs original (Meta AI) | no disponible | no aplica | PyTorch | MIT | Modelo de referencia en PyTorch; no orientado a navegador |

No se dispone de datos de benchmarks comparativos con otras alternativas de separación de fuentes en la información proporcionada.

## Limitaciones y advertencias

- Requiere WebGPU con `shader-f16`; en navegadores o dispositivos sin esta característica no funcionará y habrá que recurrir al modelo float32.
- La calidad de separación se ha medido en un único segmento de prueba; no hay evidencia publicada sobre su comportamiento en un rango amplio de géneros o mezclas.
- Riesgo de artefactos o pérdida de calidad en pasajes complejos, aunque la conversión mantiene en float32 las partes sensibles (normalizaciones y `ConvTranspose`).
- No se documentan sesgos conocidos ni riesgos de alucinación en el sentido de modelos de lenguaje; el modelo es determinista en su tarea de separación.
- No se dispone de información sobre idiomas, ya que no aplica a un modelo de audio.
- Licencia MIT, que permite uso comercial, pero conviene verificar las condiciones del modelo Demucs original y del grafo float32 de origen (timcsy/demucs-web-onnx).
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay validación comunitaria publicada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/kreiners/htdemucs-fp16-web-onnx
- Modelo de origen (float32): https://huggingface.co/timcsy/demucs-web-onnx
- Repositorio Demucs (Meta AI): https://github.com/facebookresearch/demucs
- Documentación de ONNX Runtime Web: https://onnxruntime.ai/docs/tutorials/web/
- Artículo: Rouard, Massa y Défossez, *Hybrid Transformers for Music Source Separation*, ICASSP 2023 (referenciado en la model card; no se proporciona URL directa).
