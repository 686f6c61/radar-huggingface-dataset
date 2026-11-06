# SMIIP-lab/Qwen3-ASR-FT-robohead

## Resumen

Qwen3-ASR-FT-robohead es un ajuste fino (fine-tuning) del modelo de reconocimiento automático del habla Qwen3-ASR-1.7B, desarrollado por el equipo Qwen de Alibaba Cloud y adaptado por el laboratorio SMIIP-lab. El modelo base es un transformer especializado en transcripción de audio a texto con aproximadamente 2.038 millones de parámetros (2,04 mil millones), y este ajuste se ha entrenado sobre la partición `train` del conjunto de datos RoboHEARD, orientado a entornos de robótica y captura de audio en condiciones adversas.

El propósito del ajuste es mejorar la robustez de la transcripción en escenarios reales de interacción humano-robot, donde el ruido de fondo, la reverberación y la distancia al micrófono degradan la precisión de los sistemas ASR convencionales. Según la model card, el ajuste reduce el error de carácter (CER) del 50,95 % al 48,56 % y el error de carácter con penalización temporal (tcpCER) del 52,82 % al 50,49 % sobre 28 sesiones de validación, evaluado con MeetEval a nivel de carácter y un collar de 5 segundos.

Es relevante ahora porque demuestra que los modelos ASR de gran escala pueden adaptarse con presupuestos modestos de datos específicos de dominio para tareas de robótica, un área donde los corpus públicos de habla espontánea y ruidosa son escasos. La licencia Apache 2.0 y el formato safetensors facilitan su integración en pipelines de producción, aunque el soporte declarado se limita al chino mandarín.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder para ASR (Qwen3-ASR) |
| Parámetros totales | 2.038.052.480 (≈2,04 B) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (pesos publicados en safetensors; el ecosistema admite bfloat16 en inferencia) |
| Idiomas soportados | chino (zh) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura de Qwen3-ASR-1.7B, un sistema de reconocimiento automático del habla basado en transformer que procesa representaciones acústicas y genera texto mediante decodificación autorregresiva. El ajuste fino se realizó sobre la partición `train` del corpus RoboHEARD, un conjunto de datos orientado a escenarios de robótica con audio capturado en condiciones de campo cercano y lejano, presumiblemente con ruido ambiental y reverberación característicos de entornos domésticos o industriales.

No se dispone de información sobre el número exacto de tokens de audio utilizados, la composición detallada del dataset, ni si se aplicaron técnicas de RLHF o DPO durante el ajuste. La model card únicamente documenta el procedimiento de evaluación: métricas CER y tcpCER calculadas con MeetEval a nivel de carácter, con un collar de 5 segundos para la métrica temporal, sobre 28 sesiones de validación. El ajuste se limita a la partición de entrenamiento del corpus, sin que se detallen hiperparámetros, tasa de aprendizaje ni número de épocas.

## Capacidades

- Transcripción de audio a texto en chino mandarín (`language="Chinese"` en la API de inferencia).
- Reconocimiento de habla en condiciones de ruido y reverberación propios de entornos robóticos, gracias al ajuste sobre RoboHEARD.
- Generación de transcripciones con marcas temporales implícitas evaluables mediante tcpCER con collar de 5 segundos.
- Procesamiento por lotes configurable (`max_inference_batch_size`) y control de longitud de salida (`max_new_tokens`).
- Inferencia en precisión bfloat16 sobre GPU (`dtype=torch.bfloat16`, `device_map="cuda:0"`).
- No se documenta soporte de tool calling, function calling, agentes multi-paso, visión, audio de entrada más allá del ASR ni modo de razonamiento explícito.

## Casos de uso

- Transcripción de comandos de voz en robots de servicio: el ajuste sobre RoboHEARD permite capturar instrucciones habladas en entornos con ruido ambiental, reduciendo el CER en aproximadamente 2,4 puntos porcentuales respecto al modelo base en las sesiones de validación.
- Subtitulado y actas de reuniones en chino: el modelo transcribe audio de forma autorregresiva con control de longitud de salida, adecuado para generar actas o subtítulos en entornos de oficina con reverberación moderada.
- Sistemas de atención al cliente por voz en chino: la licencia Apache 2.0 permite integrar el modelo en plataformas comerciales de transcripción de llamadas sin restricciones de uso.
- Investigación en ASR robusto: sirve como punto de partida para experimentos de adaptación de dominio con presupuestos de datos reducidos, dado que el ajuste completo se realizó sobre un corpus específico y los pesos están disponibles en safetensors.
- Evaluación comparativa de modelos ASR en robótica: el modelo puede usarse como baseline ajustado frente a Qwen3-ASR-1.7B original en benchmarks con MeetEval y métricas CER/tcpCER.
- Transcripción de audio en dispositivos edge con GPU: al tener 2,04 B de parámetros, puede desplegarse en GPUs de consumo con cuantización adecuada, aunque no se documentan formatos GGUF oficiales.
- Pipelines de datos para entrenamiento de modelos de diálogo: las transcripciones generadas pueden alimentar corpus de habla espontánea en chino para fine-tuning posterior de modelos conversacionales.

## Benchmarks y rendimiento

Resultados de validación publicados en la model card (28 sesiones, MeetEval, nivel de carácter, tcpCER con collar de 5 s):

| Modelo | Sesiones de validación | cpCER (%) | tcpCER (%) |
|---|---:|---:|---:|
| Qwen3-ASR-1.7B (base) | 28 | 50,95 | 52,82 |
| Qwen3-ASR-FT-robohead | 28 | 48,56 | 50,49 |

No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K u otros) en la información disponible, dado que se trata de un modelo especializado en ASR.

## Requisitos de hardware

- VRAM estimada para inferencia en bfloat16: aproximadamente 4,1 GB solo para pesos (2,04 B × 2 bytes), más memoria para activaciones y caché de decodificación; se recomienda al menos 8 GB de VRAM para audio de duración moderada.
- GPU recomendadas: NVIDIA A100, H100 o L40S para producción con lotes grandes; RTX 4090 o RTX 3090 para desarrollo y pruebas.
- Cabe en GPUs de consumo: sí, en tarjetas con 8 GB o más de VRAM en bfloat16 (por ejemplo, RTX 3060 Ti, RTX 4060 Ti, RTX 4070).
- Opciones de despliegue: el paquete oficial `qwen-asr==0.0.6` con `transformers==4.57.6` en entorno PyTorch; no se documentan integraciones oficiales con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles en la información proporcionada. La API permite `max_inference_batch_size=1` y `max_new_tokens=256`, lo que sugiere un uso orientado a baja concurrencia o evaluación por sesiones.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | CER en RoboHEARD val |
|---|---:|---|---|---|---:|
| SMIIP-lab/Qwen3-ASR-FT-robohead | 2,04 B | no disponible | zh | Apache 2.0 | 48,56 |
| Qwen/Qwen3-ASR-1.7B | ≈1,7 B (nominal) / 2,04 B (safetensors) | no disponible | multilingüe (no detallado) | Apache 2.0 | 50,95 |
| Whisper large-v3 | ≈1,55 B | 30 s de audio | multilingüe | MIT | no disponible |
| Otros ASR ajustados a RoboHEARD | no disponible | no disponible | zh | no disponible | no disponible |

La comparación directa solo es posible con el modelo base, ya que no se han publicado resultados de otros sistemas sobre la partición de validación de RoboHEARD en la información disponible. Whisper large-v3 se incluye como referencia de categoría por tamaño y licencia, pero sin datos comparables de CER en este corpus.

## Limitaciones y advertencias

- El modelo solo declara soporte para chino mandarín (`language: zh`); no se garantiza un rendimiento adecuado en otros idiomas.
- El CER absoluto sigue siendo elevado (48,56 % en validación), lo que indica que la transcripción en condiciones de robótica sigue siendo una tarea difícil y no apta para producción sin revisión humana.
- El ajuste se realizó sobre un único corpus (RoboHEARD, partición `train`); el rendimiento puede degradarse fuera de ese dominio acústico.
- No se documentan evaluaciones de sesgo, robustez frente a acentos o dialectos, ni tasas de alucinación en transcripciones.
- La licencia Apache 2.0 permite uso comercial, pero el modelo base Qwen3-ASR puede tener términos adicionales que conviene revisar en su propia licencia.
- No se publican formatos cuantizados oficiales (GGUF, AWQ, GPTQ), lo que limita el despliegue en entornos sin PyTorch o con GPUs de muy baja VRAM.
- El repositorio tiene solo 31 descargas y 0 likes en el momento de la consulta, por lo que carece de validación comunitaria independiente.
- La fecha de creación indicada (2026-10-29) es futura respecto a la información habitual disponible; conviene verificar la vigencia del repositorio antes de usarlo en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/SMIIP-lab/Qwen3-ASR-FT-robohead
- Modelo base: https://huggingface.co/Qwen/Qwen3-ASR-1.7B
- Repositorio oficial de Qwen3-ASR: https://github.com/QwenLM/Qwen3-ASR
- No se han encontrado enlaces adicionales a papers, blogs o demos en la información proporcionada.
