# 0x3/cc-g2pnp-japanese-g2p-conformer-ctc

## Resumen

CC-G2PnP es un modelo de conversión de grafema a fonema y prosodia (G2PnP) para japonés, desarrollado por el usuario 0x3 (ayousanz) y basado en la arquitectura Conformer-CTC. Su propósito principal es conectar modelos de lenguaje grandes (LLM) con sistemas de texto a voz (TTS) de forma fluida y en streaming, procesando el texto de entrada por fragmentos (chunks) para generar etiquetas fonémicas y prosódicas de manera incremental. El modelo tiene 84 millones de parámetros y se entrenó durante 300 000 pasos, lo que representa solo el 25 % del plan de entrenamiento completo de 1,2 millones de pasos, por lo que es un checkpoint intermedio.

La relevancia actual de este modelo radica en su capacidad para habilitar síntesis de voz en tiempo real a partir de texto generado por LLMs, un componente crítico en asistentes conversacionales, lectores de pantalla y sistemas de doblaje automático. Al ser de código abierto (licencia MIT) y ligero (84M), puede desplegarse en hardware modesto, lo que lo hace accesible para investigación y prototipado. El modelo se publica junto con un paper en arXiv y un repositorio de código, lo que facilita su reproducción y adaptación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Conformer Encoder + CTC Head |
| Parametros totales | 84 millones |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (procesamiento por chunks en streaming) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | japones (ja) |
| Licencia | MIT |
| Formato de pesos | PyTorch checkpoint (.pt) |

## Arquitectura y entrenamiento

El modelo emplea un encoder basado en Conformer (arquitectura que combina capas de atención y convoluciones) seguido de una cabeza CTC (Connectionist Temporal Classification). Esta combinación permite el reconocimiento de secuencias sin necesidad de alineamiento explícito entre entrada y salida, lo que es adecuado para tareas de G2P. La característica clave es el procesamiento por chunks: el texto de entrada se divide en fragmentos con un tamaño de look-ahead mínimo, lo que permite inferencia en streaming, es decir, generar fonemas y etiquetas prosódicas de forma incremental mientras se recibe el texto.

El entrenamiento se realizó durante 300 000 pasos con paralelismo de datos distribuido (DDP) en 4 GPUs T4, con atención escalada por producto punto (SDPA) habilitada. El checkpoint publicado (`step_00300000.pt`) corresponde al 25 % del entrenamiento total planificado (1,2 millones de pasos), por lo que el modelo aún no ha convergido completamente. No se especifican detalles sobre el dataset de entrenamiento ni sobre técnicas de alineamiento o post-entrenamiento como RLHF o DPO.

## Capacidades

- Conversión de grafemas japoneses a fonemas (G2P), incluyendo la generación de representaciones fonémicas a partir de texto.
- Generación de etiquetas prosódicas (P), que indican acentos, pausas y entonación, esenciales para una síntesis de voz natural.
- Inferencia en streaming: procesa el texto por fragmentos, lo que permite su uso en aplicaciones de tiempo real.
- Integración con LLMs y TTS: diseñado para conectar la salida de un LLM con un sintetizador de voz de manera fluida.
- Soporte exclusivo para el idioma japonés.
- Arquitectura ligera (84M parámetros) que facilita el despliegue en entornos con recursos limitados.

## Casos de uso

- Asistentes de voz conversacionales: el modelo puede convertir la respuesta generada por un LLM en fonemas y prosodia en tiempo real, permitiendo que un TTS sintetice la voz de forma incremental mientras el LLM produce el texto.
- Lectores de pantalla para japonés: al generar etiquetas prosódicas precisas, mejora la naturalidad de la lectura de textos digitales para personas con discapacidad visual.
- Doblaje automático de vídeo: integrado en un pipeline de traducción y síntesis, puede producir locuciones en japonés con entonación adecuada a partir de guiones generados automáticamente.
- Subtitulado fonético para aprendizaje de idiomas: puede generar transcripciones fonéticas y prosódicas de textos japoneses, útiles para estudiantes de pronunciación.
- Sistemas de karaoke o recitado de poesía: la salida prosódica permite controlar el ritmo y la entonación en aplicaciones de generación de voz artística.
- Investigación en G2P y prosodia: al ser un modelo abierto y con código disponible, sirve como base para experimentos sobre mejora de precisión, adaptación a otros dialectos o integración con otros sistemas de TTS.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El modelo es un checkpoint intermedio (25 % del entrenamiento) y no se proporcionan métricas como precisión fonémica, tasa de error o comparaciones con otros sistemas G2P.

## Requisitos de hardware

- VRAM estimada: con 84 millones de parámetros, el checkpoint en FP32 ocupa aproximadamente 336 MB; en FP16, unos 168 MB. Cabe en cualquier GPU consumer con al menos 2 GB de VRAM.
- GPUs recomendadas: cualquier GPU moderna, incluyendo NVIDIA GTX 1060, RTX 2060, RTX 3060, etc. Para entrenamiento se usaron 4× T4, pero para inferencia basta una sola GPU.
- Despliegue: al ser un checkpoint de PyTorch, puede cargarse directamente con `torch.load`. No se mencionan integraciones con vLLM, llama.cpp u Ollama, ya que no es un modelo de lenguaje generativo sino un modelo de etiquetado secuencial.
- Latencia: al ser un modelo pequeño y con procesamiento por chunks, la latencia por fragmento es baja, adecuada para streaming en tiempo real, aunque no se proporcionan cifras concretas.

## Comparativa con modelos similares

No se dispone de información sobre modelos G2P japoneses comparables en la documentación proporcionada. Existen otros sistemas como OpenJTalk o espeak-ng, pero no son modelos neuronales basados en Conformer-CTC y no se pueden comparar directamente sin datos de rendimiento. Por tanto, la comparativa no está disponible.

## Limitaciones y advertencias

- El checkpoint publicado es un modelo a mitad de entrenamiento (25 %), por lo que su precisión puede ser inferior a la de un modelo completamente entrenado.
- Solo soporta japonés; no es aplicable a otros idiomas sin reentrenamiento.
- No se especifican los datos de entrenamiento, por lo que se desconocen posibles sesgos derivados del corpus (por ejemplo, dominio restringido a texto formal o dialectos específicos).
- Riesgo de alucinación: al ser un modelo de etiquetado, puede producir fonemas o prosodia incorrectos en entradas ambiguas o fuera de distribución.
- No se proporcionan instrucciones claras de uso más allá de cargar el checkpoint; falta documentación sobre el preprocesamiento de entrada y decodificación de salida.
- La licencia MIT permite uso comercial, pero el autor no ofrece garantías sobre el rendimiento en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/0x3/cc-g2pnp-japanese-g2p-conformer-ctc
- Repositorio de GitHub (reimplementación): https://github.com/ayutaz/cc-g2pnp
- Paper en arXiv: https://arxiv.org/abs/2602.17157
- PDF del paper: https://arxiv.org/pdf/2602.17157
