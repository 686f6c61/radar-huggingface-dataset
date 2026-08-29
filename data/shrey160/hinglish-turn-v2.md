# Shrey160/hinglish-turn-v2

## Resumen

Hinglish Turn Detection v2 (s2-004) es un modelo de clasificación de audio diseñado para detectar si un hablante ha terminado de hablar (turno completo) o solo está haciendo una pausa (turno incompleto) en conversaciones telefónicas en hinglish, la variedad de código alternado entre hindi e inglés. Desarrollado por Shrey160, el modelo se basa en el enfoque del detector de turnos Smart Turn v3.2 de Pipecat, pero se ha ajustado específicamente para el par de idiomas que aquel no cubría bien. Está construido sobre el encoder de Whisper-tiny y se distribuye en formato ONNX, lo que permite inferencia ligera en CPU.

El modelo resuelve el problema del endpointing en asistentes de voz y agentes conversacionales: saber cuándo el usuario ha terminado de hablar para que el sistema pueda responder sin interrumpir. Su relevancia radica en que aborda un idioma de bajos recursos (hinglish) con una solución de bajo coste computacional, alcanzando una precisión superior al 0.9 en datos de habla real de ese dominio. El contexto de entrada es de hasta 8 segundos de audio, y la salida es un logit que se convierte en probabilidad mediante sigmoide.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder Whisper-tiny + cabezal de clasificación (dos etapas de fine-tuning) |
| Parametros totales | No disponible (basado en Whisper-tiny, ~39M, sin confirmar) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 8 segundos de audio (16 kHz mono) |
| Tipos de cuantizacion | FP32 (0.1 GB) e INT8 (9.05 MB) |
| Idiomas soportados | Hinglish (hindi e inglés) |
| Licencia | MIT |
| Formato de pesos | ONNX (archivos .onnx) |

## Arquitectura y entrenamiento

El modelo utiliza el encoder de Whisper-tiny como extractor de características, seguido de un cabezal de clasificación que produce un único logit. La entrada es un log-mel espectrograma de Whisper de dimensiones (80, 800) correspondiente a 8 segundos de audio, sin normalización por banda (do_normalize=False), una convención que se mantiene de forma consistente en el entrenamiento y la exportación. El entrenamiento se realizó en dos etapas: primero, con el encoder congelado, se entrenó el cabezal sobre 7,200 clips de habla hin+eng del conjunto de Smart Turn v3.2; después, se descongelaron las últimas dos capas del encoder y se refinó con 232 clips TTS en hinglish (duplicados) y una mezcla 50:50 de hindi e inglés, con una tasa de aprendizaje de 1e-4 durante 3 épocas. Se probaron alternativas como pooling ASP, atención al final, label smoothing y destilación con un profesor whisper-small, pero todas resultaron inferiores a la configuración final.

## Capacidades

- Clasificación binaria de turnos de habla: dado un clip de audio de hasta 8 segundos, devuelve una probabilidad de que el hablante haya completado su turno (p_complete ≥ 0.5 → completo).
- Manejo de entrada variable: los clips más cortos se rellenan con ceros al inicio; los más largos se truncan conservando los últimos 8 segundos.
- Inferencia ligera: el modelo ONNX (especialmente la versión int8) puede ejecutarse en CPU con una latencia media de ~13 ms (p50), lo que lo hace adecuado para sistemas en tiempo real.
- Soporte multilingüe limitado: está entrenado específicamente para hinglish, aunque el encoder base de Whisper reconoce más idiomas, la clasificación está especializada en este par.
- Compatibilidad con el ecosistema de Smart Turn: el contrato de entrada y la convención de características son idénticos a los de Smart Turn v3.2, lo que facilita la migración.

## Casos de uso

- Asistentes de voz en hinglish: integrar el modelo en un pipeline de voz para detectar cuándo el usuario ha terminado de hablar y activar la respuesta del asistente sin cortes.
- Agentes telefónicos automatizados: en sistemas de IVR o atención al cliente, usar la detección de turnos para gestionar diálogos multi-turno con naturalidad.
- Sistemas de transcripción en tiempo real: como complemento a motores de reconocimiento de voz, para segmentar el audio en turnos de habla y mejorar la puntuación.
- Control de dispositivos por voz: en entornos domésticos o industriales donde se requiere una detección de final de frase robusta en habla con mezcla de idiomas.
- Análisis de conversaciones: para etiquetar automáticamente cuándo habla cada interlocutor en grabaciones de llamadas, facilitando el análisis posterior.
- Prototipos de agentes conversacionales: como reemplazo ligero de modelos de detección de actividad de voz (VAD) más complejos, cuando se necesita una decisión semántica de completitud.

## Benchmarks y rendimiento

La model card proporciona resultados en tres conjuntos de prueba. Se presentan a continuación junto con la comparativa con el modelo base Smart Turn v3.2 (acc/F1).

| Modelo | test-A (v3.2-test hin+eng, 1,200 clips) | test-B (TTS Hinglish, 33 clips) | test-C (MUCS real speech, 846 clips) |
|---|---|---|---|
| Smart Turn v3.2 (zero-shot) | **0.927** / **0.930** | 0.788 / 0.759 | 0.539 / 0.573 |
| Hinglish Turn v2 (s2-004) | 0.882 / 0.886 | **0.970** / **0.968** | **0.600** / 0.446 |

El modelo v2 obtiene peores resultados en test-A (que coincide con la distribución de entrenamiento del modelo base), pero supera claramente al base en test-B y test-C, que representan el dominio hinglish. En la variante int8 se observa una pérdida de precisión de −2.5 / −3.0 puntos (en test-B) y una ganancia de +0.4 en test-A, con un tamaño de 9.05 MB y una latencia media de ~13 ms en CPU. No se han publicado resultados en benchmarks generales como MMLU o HumanEval, ya que no es un modelo de lenguaje sino de clasificación de audio.

## Requisitos de hardware

- Inferencia en CPU: suficiente para la mayoría de usos; la versión int8 (9.05 MB) alcanza una latencia p50 de ~13 ms en CPU estándar.
- VRAM: no se requiere GPU para inferencia; el modelo es muy ligero (0.1 GB en FP32, 9 MB en INT8).
- GPU recomendada: no necesaria; en caso de querer acelerar, cualquier GPU con soporte ONNX Runtime (por ejemplo, NVIDIA T4 o RTX 4090) funcionará sin problemas.
- Opciones de despliegue: ONNX Runtime (Python, C++, etc.), se puede integrar en pipelines con vLLM o TGI si se combina con modelos de lenguaje, aunque el modelo en sí no está diseñado para esos frameworks.
- Latencia y throughput: con la versión int8, se pueden procesar decenas de clips por segundo en CPU; en GPU la latencia sería aún menor.

## Comparativa con modelos similares

| Modelo | Contexto | Precisión en hinglish (test-B) | Precisión en habla real (test-C) | Licencia | Formato |
|---|---|---|---|---|---|
| Smart Turn v3.2 (Pipecat) | 8 s | 0.788 / 0.759 | 0.539 / 0.573 | Apache 2.0 (según repo) | ONNX |
| Hinglish Turn v2 (s2-004) | 8 s | **0.970** / **0.968** | **0.600** / 0.446 | MIT | ONNX |

No se dispone de otros detectores de turnos específicos para hinglish en la información proporcionada. La comparativa se limita al modelo base del que deriva. La ventaja principal del v2 es su especialización en hinglish, a costa de un ligero descenso en el dominio general del inglés/hindi.

## Limitaciones y advertencias

- Sesgo de dominio: el modelo se entrena mayoritariamente con datos TTS (83% del conjunto de entrenamiento de Smart Turn v3.2), lo que puede afectar a la generalización con habla humana real, especialmente en entornos ruidosos o con acentos no representados.
- Rendimiento en monólogos: en test-C, que contiene monólogos tutoriales de MUCS, el modelo colapsa (acc 0.600, F1 0.446); esto se debe a un desajuste prosódico y se recomienda tratarlo como una prueba de estrés, no como indicador de rendimiento real.
- Dependencia de la convención de características: es crítico usar mels sin normalización (do_normalize=False) en la extracción de características; si se activa la normalización, el modelo puede producir resultados incorrectos.
- Datos limitados: el conjunto de entrenamiento específico de hinglish es pequeño (232 clips TTS), lo que limita la robustez en variaciones dialectales y condiciones acústicas diversas.
- Riesgo de alucinación: al ser un clasificador binario, no hay riesgo de alucinación de texto, pero sí puede producir falsos positivos o negativos en la detección de turnos, lo que puede interrumpir conversaciones.
- Restricciones de licencia: la licencia MIT permite uso comercial sin restricciones, pero se recomienda revisar las licencias de los datos subyacentes (Smart Turn v3.2, MUCS, etc.) si se redistribuye el modelo o sus derivados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Shrey160/hinglish-turn-v2
- Perfil del autor: https://huggingface.co/Shrey160
- Dataset de ejemplo: https://huggingface.co/datasets/Shrey160/hinglish-audio-turn-end-example
- Modelo base Smart Turn v3.2: https://huggingface.co/pipecat-ai/smart-turn-v3.2
- Repositorio GitHub del autor: https://github.com/shrey160/
