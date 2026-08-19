# jburtoft/whisper-large-v3-medusa-heads

## Resumen

`jburtoft/whisper-large-v3-medusa-heads` es un conjunto de cabezas de decodificación especulativa Medusa-1 diseñadas para acelerar la inferencia del modelo de reconocimiento de voz `openai/whisper-large-v3`. El autor, jburtoft, las ha entrenado sobre AWS Trainium (instancias `trn2`) usando PyTorch Native con `torch-neuronx`, y las publica como una demostración de referencia para validar el flujo completo de entrenamiento e inferencia especulativa en hardware de AWS.

El modelo base queda completamente congelado; las cabezas añaden aproximadamente 8,2 millones de parámetros entrenables distribuidas en 5 bloques residuales (ResBlock) que predicen tokens futuros a partir del estado oculto del decodificador. La verificación posterior garantiza que la salida sea bit a bit idéntica a la decodificación greedy estándar de `whisper-large-v3`, por lo que no altera la precisión del transcriptor, solo reduce el número de llamadas secuenciales al decodificador en inferencia con batch size 1.

La relevancia de este modelo radica en que demuestra la viabilidad de aplicar Medusa-1 a un modelo de audio grande en hardware especializado de AWS, ofreciendo una alternativa a otras optimizaciones como Faster-Whisper o la cuantización. Está pensado para desarrolladores que quieran integrar decodificación especulativa en pipelines de transcripción en Trainium, aunque el autor advierte que no es una cabeza optimizada para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Cabezas Medusa-1 (5 ResBlocks) sobre `openai/whisper-large-v3` (encoder-decoder transformer) |
| Parametros totales | ~8,2 M entrenables (cabezas); modelo base congelado no contabilizado |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible (el modelo base `whisper-large-v3` usa ventanas de audio de 30 segundos, pero no se especifica en esta ficha) |
| Tipos de cuantizacion | no disponible (checkpoint en bf16) |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | PyTorch state dict (.pt) |

## Arquitectura y entrenamiento

El modelo implementa el esquema Medusa-1: cinco cabezas ligeras, cada una con un único ResBlock (`x + SiLU(Linear(1280, 1280))`), leen el último estado oculto del decodificador de Whisper en la posición `t` y predicen los tokens `t+2` hasta `t+6`. La proyección de salida de cada cabeza está atada al `proj_out` (LM head) congelado del modelo base, de modo que no se añade vocabulario nuevo. Durante la inferencia, un paso de verificación ejecuta el decodificador real sobre los tokens propuestos y acepta el prefijo más largo que coincida con la decodificación greedy, rechazando en el primer desacuerdo. Esto garantiza que la transcripción sea idéntica a la del modelo original.

El entrenamiento se realizó sobre LibriSpeech (CC BY 4.0), usando pseudo-etiquetas generadas por el propio `whisper-large-v3` congelado: las cabezas aprenden a predecir la continuación greedy del modelo base, no la transcripción de referencia. El checkpoint publicado se entrenó durante 1800 pasos con un batch size de 8192, alcanzando una precisión top-1 de la cabeza 0 de ~40,6% en audio reservado y una media de ~1,63 tokens aceptados por verificación (medido con el framework de referencia, BS=1, TP=4). El entrenamiento se ejecutó en AWS Trainium (`trn2`) con precisión bf16.

## Capacidades

- Decodificación especulativa Medusa-1: acelera la inferencia de `whisper-large-v3` reduciendo el número de llamadas secuenciales al decodificador, manteniendo salida bit a bit idéntica a la greedy.
- Compatibilidad con AWS Trainium: las cabezas están entrenadas y validadas en hardware `trn2` con PyTorch Native, y se integran con el framework de referencia del autor.
- Reproducibilidad: incluye scripts para cosechar pseudo-etiquetas (`harvest_whisper_pseudo.py`) y entrenar nuevas cabezas (`train_medusa_heads_whisper.py`).
- Sin cambios en el vocabulario ni en la salida: al estar atadas al LM head congelado, no introducen tokens nuevos ni alteran la distribución de salida.
- Soporte de carga sencilla: el checkpoint se puede cargar con `torch.load` y las claves del state dict están documentadas.

## Casos de uso

- Transcripción de audio en tiempo real en AWS Trainium: al reducir las llamadas secuenciales al decodificador, el modelo permite transcribir streams de audio con menor latencia en instancias `trn2`, manteniendo la misma calidad que `whisper-large-v3`.
- Servicios de subtitulado automático a gran escala: para procesar grandes volúmenes de audio en batch, la decodificación especulativa reduce el coste computacional por clip, especialmente en entornos donde el batch size es 1 (p. ej., peticiones individuales).
- Evaluación de frameworks de decodificación especulativa: sirve como banco de pruebas para comparar Medusa-1 con otras técnicas (Faster-Whisper, cuantización) en hardware de AWS, gracias a su salida idéntica y a las métricas de aceptación documentadas.
- Desarrollo de cabezas Medusa personalizadas: los scripts incluidos permiten a equipos entrenar sus propias cabezas sobre otros datasets o con más datos, partiendo de este checkpoint como referencia.
- Integración en pipelines de ASR existentes: al ser un complemento del modelo base, se puede incorporar en sistemas que ya usan `whisper-large-v3` sin cambiar la lógica de post-procesado ni los umbrales de confianza.
- Investigación sobre aceleración de modelos de audio: el diseño Medusa-1 con proyección atada es un caso de estudio útil para explorar trade-offs entre precisión de las cabezas y velocidad de inferencia en modelos encoder-decoder.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (WER, CER) en la informacion disponible. El autor reporta únicamente métricas internas de la decodificación especulativa:

| Metrica | Valor |
|---|---|
| Precisión top-1 de la cabeza 0 (held-out) | ~40,6% |
| Tokens aceptados por verificación (media) | ~1,63 |
| Correctitud | byte-idéntico a greedy `whisper-large-v3` |

Estas métricas indican la eficacia de las cabezas para proponer tokens que el decodificador real acepta, pero no miden la calidad del reconocimiento de voz, que es idéntica a la del modelo base.

## Requisitos de hardware

- Entrenamiento: instancia AWS Trainium `trn2` con entorno PyTorch Native (`torch-neuronx`). El autor usó TP=4 para la medición de tokens aceptados.
- Inferencia: diseñado para Trainium, aunque las cabezas son tensores PyTorch estándar y podrían ejecutarse en GPU con el framework adecuado; no se documenta soporte oficial para GPU.
- VRAM estimada: no disponible; depende del modelo base `whisper-large-v3` (~1,5 GB en bf16) más las cabezas (~16 MB adicionales).
- Opciones de despliegue: el framework de referencia del autor es el único documentado; no se mencionan integraciones con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no se proporcionan cifras absolutas; solo la reducción relativa de llamadas al decodificador (~1,63 tokens aceptados por verificación).

## Comparativa con modelos similares

| Modelo | Metodo de aceleracion | Parametros adicionales | Salida identica | Hardware objetivo | Licencia |
|---|---|---|---|---|---|
| `jburtoft/whisper-large-v3-medusa-heads` | Medusa-1 (5 cabezas) | ~8,2 M | Si (greedy) | AWS Trainium | Apache-2.0 |
| `openai/whisper-large-v3` (base) | Ninguno | 0 | - | GPU/CPU | MIT |
| `aiola-lab/whisper-medusa` | Medusa-Linear / Medusa-Block | no disponible | no disponible | GPU | no disponible |
| Faster-Whisper (CTranslate2) | Cuantizacion + CTranslate2 | 0 | No (cambia numeros) | CPU/GPU | MIT |

La comparativa se basa en informacion publica; los datos de `aiola-lab/whisper-medusa` no estan disponibles en la documentacion consultada.

## Limitaciones y advertencias

- Es una cabeza de referencia o demostracion, no optimizada para produccion: el autor indica explicitamente que no es una cabeza afinada para precision.
- Solo soporta ingles (`language: en`); no se ha entrenado para otros idiomas.
- La salida es identica a la greedy de `whisper-large-v3`, por lo que no mejora la precision del reconocimiento; solo acelera la inferencia.
- El entrenamiento se realizo sobre LibriSpeech (habla leida en ingles); el rendimiento de las cabezas puede degradarse con otros dominios (conversaciones, ruido, acentos).
- Requiere el modelo base `whisper-large-v3` congelado y su `proj_out` para cargar las cabezas; no es un modelo autonomo.
- No se documentan cuantizaciones adicionales ni soporte para otros formatos (safetensors, GGUF).
- La integracion con frameworks de inferencia estandar (vLLM, TGI) no esta verificada; el despliegue se limita al framework de referencia del autor.
- Al ser un checkpoint de demostracion, puede contener sesgos derivados de LibriSpeech y de las pseudo-etiquetas del propio Whisper.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/jburtoft/whisper-large-v3-medusa-heads
- Modelo base `openai/whisper-large-v3`: https://huggingface.co/openai/whisper-large-v3
- Repositorio `aiola-lab/whisper-medusa` (arquitecturas Medusa para Whisper): https://github.com/aiola-lab/whisper-medusa
- Repositorio oficial de Whisper: https://github.com/openai/whisper
