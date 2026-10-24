# idefinity/ming-3.0-tts-4step-distill-int4

## Resumen

Este repositorio, publicado por el usuario idefinity, contiene un DiT (Diffusion Transformer) destilado a 4 pasos para síntesis de voz, derivado del modelo Ming-3.0-tts-0.5B de inclusionAI. El teacher original opera con 10 pasos y classifier-free guidance (CFG=2); el student elimina el CFG y reduce la inferencia a 4 pasos, lo que disminuye el número de evaluaciones de función y el coste computacional del componente de difusión.

El paquete incluye el DiT en ONNX fp32, una versión cuantizada a int4 mediante MatMulNBits y el state dict de PyTorch del student. No es un sistema TTS completo: el LM, el aggregator, el encoder y el vocoder no están incluidos, por lo que debe integrarse en el pipeline de Ming-3.0-tts para producir audio.

Su relevancia está en el despliegue on-device: un componente de difusión de 4 pasos, sin CFG y en int4 es adecuado para entornos con recursos limitados. La licencia es MIT y el idioma validado es el chino; el entrenamiento se hizo con solo 200 utterances SFW, lo que acota la cobertura de voces y estilos.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | DiT (Diffusion Transformer) con flow matching, destilado a 4 pasos y sin CFG |
| Parámetros totales | no disponible (el modelo base Ming-3.0-tts-0.5B tiene 0,5 B; este repositorio solo publica el DiT) |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (componente de TTS, no modelo de contexto textual) |
| Tipos de cuantización | fp32 (ONNX) e int4 (MatMulNBits) |
| Idiomas soportados | zh (chino); el modelo base declara capacidades multilingües, pero esta destilación solo se valida en chino |
| Licencia | MIT |
| Formato de pesos | ONNX (`dit4.onnx`, `dit4_int4.onnx`) y PyTorch state dict (`student_4step.pt`) |
| Tamaño del repositorio | 0,7 GB |
| Pipeline de HuggingFace | text-to-speech |

## Arquitectura y entrenamiento

El modelo es un DiT de flow matching que genera representaciones latentes de audio. Se destila desde el teacher de Ming-3.0-tts-0.5B, que emplea 10 pasos de muestreo con CFG=2; el student aprende una trayectoria de 4 pasos sin CFG, de modo que elimina la duplicación de cómputo asociada al guidance. El repositorio separa el DiT fp32, el DiT int4 y el state dict del student, y conserva muestras de audio del teacher, del student fp32 y del student int4.

El entrenamiento de destilación utilizó 200 utterances chinas SFW, 13.112 frames latentes, 2.000 pasos de optimizador, batch de 16, AdamW con learning rate 1e-4 y precisión fp32. No se especifica la composición detallada del dataset, la duración total de audio ni si se aplicaron etapas de RLHF o DPO; en TTS, el ajuste se realiza habitualmente con objetivos de reconstrucción y destilación, no con preferencias humanas. La innovación principal es la reducción a 4 pasos sin CFG y su cuantización int4 con una correlación de probe de 0,992514 respecto al student fp32.

## Capacidades

- Generación de latentes acústicos para TTS en chino; requiere el vocoder y el resto del pipeline de Ming-3.0-tts para producir waveform.
- Inferencia en 4 pasos sin classifier-free guidance, con menor coste que el teacher de 10 pasos con CFG=2.
- Versión int4 en ONNX con MatMulNBits, pensada para despliegue en CPU, GPU y entornos móviles mediante ONNX Runtime.
- El modelo base soporta clonación de voz, diseño de voz y control en lenguaje natural; este repositorio no incluye speaker encoder, aggregator ni LM, por lo que esas capacidades no se pueden ejercer solo con estos pesos.
- No soporta tool calling, function calling, agentes, razonamiento multi-step, visión ni entrada de audio.
- No se han validado idiomas distintos del chino en esta destilación.

## Casos de uso

- TTS on-device en chino: integrar `dit4_int4.onnx` en una aplicación Android o iOS con ONNX Runtime junto al vocoder del pipeline Ming; los 4 pasos y una huella de pesos inferior a 1 GB reducen los requisitos frente al teacher, aunque la latencia final depende del vocoder y del hardware.
- Avisos y notificaciones por voz en sistemas embebidos: frases cortas en chino generadas con 4 pasos y sin CFG, adecuadas para dispositivos con CPU de gama baja y presupuesto de cómputo ajustado.
- Generación de audiolibros o contenido narrado en chino: el DiT produce los latentes acústicos por fragmentos y el vocoder del pipeline base los convierte en audio; la calidad final depende del vocoder y de la cobertura de voces del entrenamiento.
- Investigación en destilación de modelos de difusión: comparar `samples/teacher.wav`, `samples/student.wav` y `samples/student_int4.wav` junto con `metrics.json` para estudiar la pérdida de calidad al pasar de 10 pasos con CFG a 4 pasos sin CFG y a int4.
- Evaluación de cuantización int4 en DiT: usar el coseno de probe de 0,992514 y las métricas de CER, speaker cosine y log-mel L1 para analizar el compromiso entre compresión y calidad en un componente de difusión.
- Servicio TTS en servidor con ONNX Runtime: reducir de 10 pasos con CFG=2 a 4 pasos sin CFG disminuye el cómputo de difusión por petición, lo que puede aumentar el throughput en GPUs de inference; no hay cifras publicadas de latencia ni de peticiones por segundo.
- Prototipado y fine-tuning del student: partir de `student_4step.pt` para reentrenar con un corpus mayor o con un dominio concreto, dado que el entrenamiento original solo cubre 200 utterances.

## Benchmarks y rendimiento

No se han publicado resultados de MMLU, HumanEval ni GSM8K, ya que no aplican a un componente de TTS. Las métricas disponibles en la model card son las siguientes:

| Métrica | Student fp32 | Student int4 |
|---|---:|---:|
| ASR CER | 0,3976 | 0,4368 |
| Speaker cosine | 0,9340 | 0,9328 |
| Log-mel L1 | 3,1799 | 2,9136 |
| Duration ratio | 0,996 | 0,996 |
| DiT int4 probe cosine | — | 0,992514 |

No se incluyen métricas equivalentes del teacher, MOS ni comparación perceptual cuantitativa. El CER de 0,3976 en fp32 y 0,4368 en int4 es elevado y debe interpretarse en el contexto del conjunto de evaluación, que no se detalla.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El repositorio completo ocupa 0,7 GB, por lo que los pesos del DiT caben holgadamente en memoria de GPU consumer; el pipeline completo requiere además el LM de 0,5 B, el encoder y el vocoder, cuyo consumo no se detalla.
- GPU recomendadas: no hay datos publicados. Por el tamaño del repositorio, es razonable esperar que funcione en GPUs consumer como RTX 3060, RTX 4060 o superiores, así como en A100 o H100 sin necesidad de ellas; se trata de una estimación no verificada.
- ¿Cabe en GPU consumer? Sí, previsiblemente en cualquier GPU con 4 GB o más de VRAM, y también en CPU mediante ONNX Runtime; no hay mediciones publicadas de latencia.
- Opciones de despliegue: ONNX Runtime (CPU, GPU y móvil), con posibilidad de optimización mediante TensorRT u OpenVINO. No es adecuado para vLLM, TGI o llama.cpp, ya que no es un modelo de lenguaje.
- Latencia y throughput: no disponibles. La ventaja estructural es de 4 pasos sin CFG frente a 10 pasos con CFG=2, lo que reduce el cómputo de difusión aproximadamente a una quinta parte en pasadas equivalentes, pero el rendimiento final depende del vocoder y del backend.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este repositorio (DiT 4-step int4) | no disponible (solo DiT; base de 0,5 B) | no aplica | DiT destilado a 4 pasos, sin CFG, int4 | MIT | HuggingFace, idefinity |
| Ming-3.0-tts-0.5B (teacher) | 0,5 B denso | no aplica | TTS completo con 10 pasos y CFG=2 | MIT | HuggingFace, inclusionAI |
| Ming-3.0-tts-tiny | 7,9 B totales, 1,3 B activos (MoE sobre Ling V3) | no aplica | TTS completo con clonación y diseño de voz | no disponible | HuggingFace y ModelScope, inclusionAI |
| webfm-ming-3.0-tts | no disponible | no aplica | Bundle del mismo autor con pipeline y destilación int4 | MIT | HuggingFace, idefinity |

La comparación directa de calidad no es posible con los datos disponibles: el repositorio solo publica métricas del student, no del teacher ni de Ming-3.0-tts-tiny. La diferencia principal frente al teacher es el número de pasos y la ausencia de CFG; frente a Ming-3.0-tts-tiny, este repositorio es un componente ligero, no un sistema completo con clonación y control por lenguaje natural.

## Limitaciones y advertencias

- No es un sistema TTS autónomo: faltan el LM, el aggregator, el encoder y el vocoder; sin ellos no genera audio.
- El CER es alto (0,3976 en fp32 y 0,4368 en int4), lo que puede limitar aplicaciones donde la inteligibilidad exacta sea crítica.
- La cuantización int4 degrada el CER un 9,9 % relativo frente al student fp32 (de 0,3976 a 0,4368), aunque mejora el log-mel L1 en esta evaluación; las métricas no incluyen MOS ni pruebas perceptuales.
- El entrenamiento de destilación usó solo 200 utterances chinas SFW, por lo que la cobertura de hablantes, acentos, emociones y prosodia es limitada.
- Solo se valida el chino; no hay datos sobre otros idiomas aunque el modelo base declare capacidades multilingües.
- Restricción explícita a contenido SFW.
- No se han publicado evaluaciones de sesgos, robustez ante ruido, acentos o voces fuera del conjunto de entrenamiento.
- La licencia MIT permite uso comercial, pero el disclaimer de uso del modelo base de inclusionAI sigue aplicándose; conviene revisar sus términos.
- El repositorio tiene 0 descargas y 0 likes, por lo que no cuenta con validación de la comunidad.
- No hay datos de latencia, throughput ni consumo de VRAM para el pipeline completo.

## Enlaces

- Repositorio del modelo: https://huggingface.co/idefinity/ming-3.0-tts-4step-distill-int4
- Modelo base: https://huggingface.co/inclusionAI/Ming-3.0-tts-0.5B
- Repositorio GitHub de Ming-3.0-tts: https://github.com/inclusionAI/Ming-3.0-tts
- Código en GitHub: https://github.com/inclusionAI/Ming-3.0-tts/blob/main/
- Bundle del mismo autor: https://huggingface.co/idefinity/webfm-ming-3.0-tts
- Ming-3.0-tts-tiny en ModelScope: https://www.modelscope.cn/models/inclusionAI/Ming-3.0-tts-tiny
