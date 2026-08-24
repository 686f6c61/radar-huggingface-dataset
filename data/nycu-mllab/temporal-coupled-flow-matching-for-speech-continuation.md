# NYCU-MLLab/Temporal-Coupled-Flow-Matching-for-Speech-Continuation

## Resumen

El modelo **Temporal-Coupled Flow Matching (TCFM)** es un adaptador LoRA para el modelo de lenguaje hablado Flow-SLM, desarrollado por el Machine Learning Lab de la National Yang Ming Chiao Tung University (NYCU-MLLab) de Taiwán. Su objetivo es mejorar la continuación de habla, es decir, generar audio de voz coherente a partir de un segmento previo, preservando la identidad del hablante y la estabilidad acústica. El adaptador añade una supervisión de trayectoria de punto final en el dominio del tiempo de habla al flujo de coincidencia condicional, lo que permite un ajuste fino de solo 488 448 parámetros LoRA en el módulo FlowHead, manteniendo intactos el muestreador Flow-SLM, el codec Mimi, el Transformer y la vía semántica.

Este modelo es relevante porque aborda un problema específico en la síntesis de voz: la continuidad natural y la persistencia del timbre del hablante en generaciones de audio de larga duración. Al ser un adaptador ligero, se puede integrar sobre el checkpoint base Flow-SLM 1B-extended sin necesidad de reentrenar el modelo completo. Está pensado como artefacto de investigación para reproducir los experimentos descritos en el repositorio, no como un sistema de producción.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre Flow-SLM (Flow Matching + Mimi codec + Transformer) |
| Parametros totales | No disponible (el adaptador tiene 488 448 parámetros; el modelo base es de aproximadamente 1,3B) |
| Parametros activos | No aplica (es un adaptador LoRA, no un modelo MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Inglés (en) |
| Licencia | No disponible (el autor no especifica licencia; el modelo base Flow-SLM tampoco incluye archivo de licencia) |
| Formato de pesos | PyTorch (.pt) |

## Arquitectura y entrenamiento

TCFM se basa en la arquitectura Flow-SLM, que combina un modelo de lenguaje hablado con flujo de coincidencia (flow matching) y el codec neural Mimi para la representación de audio. El adaptador LoRA se inserta en el módulo FlowHead, que es el encargado de predecir la velocidad del flujo. La innovación principal es la adición de una supervisión de trayectoria de punto final en el tiempo de habla: se reconstruye el punto final limpio implícito en la velocidad predicha y se regularizan el desplazamiento del punto final, la curvatura, la dirección del movimiento y el comportamiento en el límite entre el prefijo y la continuación.

El entrenamiento se realizó sobre 4096 utterances elegibles de LibriSpeech `train-clean-100`, con validación en 256 utterances de `dev-clean`. Cada ejemplo usa un prefijo de 3 segundos y un segmento futuro de 5 segundos. Los hiperparámetros del LoRA son: rango 4, alpha 8, dropout 0.05. El optimizador usó batch size 8, learning rate `5e-5` y weight decay `1e-4`. Los pesos de la función de pérdida TCFM son: transición 0.1, límite de prefijo 0.1, curvatura 0.5, dirección 0.1 y ventana de límite de 16 frames. Se ejecutaron 2000 pasos de optimización para cada semilla (42, 1234 y 2026), seleccionando el checkpoint con menor objetivo de validación.

## Capacidades

- Continuación de habla: genera audio de voz coherente a partir de un segmento de entrada, extendiendo la señal más allá del prefijo.
- Preservación de la identidad del hablante: mejora la similitud del timbre y las características vocales respecto al hablante original.
- Estabilidad acústica: reduce la distancia log-mel en el límite de 200 ms y mejora la distribución espectral global (WavLM FSD).
- Alineación semántica: aumenta la concordancia de frames semánticos con el modelo Mimi en modo oracle-semantic.
- Compatibilidad con el ecosistema Flow-SLM: se integra como adaptador sobre el checkpoint base 1B-extended, sin modificar el muestreador ni el codec.
- No es un modelo de diálogo ni de reconocimiento de voz: su función se limita a la generación de audio de voz continuo.

## Casos de uso

- Investigación en síntesis de voz: permite estudiar cómo el acoplamiento temporal en el flujo de coincidencia afecta a la continuidad y a la persistencia del hablante en generaciones de audio.
- Reproducción de experimentos académicos: los tres adaptadores con semillas distintas (42, 1234, 2026) permiten replicar los resultados reportados y analizar la variabilidad entre semillas.
- Desarrollo de modelos de lenguaje hablado: sirve como punto de partida para investigar mejoras en la estabilidad de la generación de voz en modelos basados en flow matching.
- Evaluación de métricas de calidad de audio: se puede usar para comparar métricas como WavLM FSD, distancia log-mel o similitud de hablante frente al modelo base Flow-SLM.
- Prototipado de aplicaciones de continuación de audio: aunque no está pensado para producción, puede servir para validar conceptos de generación de voz extendida en entornos controlados.
- Estudio de adaptación eficiente con LoRA: el bajo número de parámetros entrenados (488 448) lo convierte en un caso de estudio para técnicas de ajuste fino eficiente en modelos de audio.

## Benchmarks y rendimiento

La evaluación formal se realizó sobre LibriSpeech `test-clean` y `test-other` con tres semillas de inferencia. Los resultados reportados son relativos al modelo base Flow-SLM:

| Metrica | Base Flow-SLM | TCFM (adaptador) | Efecto (95% CI) |
|---|---|---|---|
| Similitud de hablante (open-ended) | 0.909415 | 0.912781 | +0.003367 [+0.002298, +0.004455] |
| Distancia log-mel en límite de 200 ms (open-ended) | 8.5462 | 8.4945 | -0.05175 [-0.07862, -0.02511] |
| WavLM FSD (open-ended) | 3.653 | 2.919 | -0.734 (aprox. 20% menor) |
| Acuerdo de frames semánticos Mimi q0 (oracle-semantic) | 0.65553 | 0.66977 | +0.01424 [+0.01265, +0.01576] |
| WavLM FSD (oracle-semantic) | 0.590 | 0.533 | -0.057 (aprox. 9.8% menor) |

Estos resultados indican una mejora en la estabilidad de la continuación, la persistencia del hablante y el ajuste acústico distribucional. No se reportan mejoras universales en el límite, preferencia humana ni mejoras léxicas o sintácticas amplias. Solo se evaluaron tres semillas de entrenamiento.

## Requisitos de hardware

- El adaptador en sí es muy ligero (488 448 parámetros), pero la inferencia requiere cargar el modelo base Flow-SLM 1B-extended, que tiene aproximadamente 1,3B parámetros.
- Se estima que la inferencia necesita al menos 8-16 GB de VRAM en FP16, dependiendo de la longitud de audio generada y del tamaño de lote. No se especifican requisitos exactos en la documentación.
- GPU recomendadas: tarjetas con al menos 16 GB de VRAM, como NVIDIA RTX 4090, A100 o H100. En GPUs de consumo con 8 GB podría ser posible con cuantización, pero no se proporcionan configuraciones oficiales.
- Opciones de despliegue: el repositorio incluye scripts Slurm para inferencia en clústeres con GPU. No se mencionan integraciones con vLLM, llama.cpp u Ollama, ya que es un modelo de audio, no de texto.
- Latencia y throughput: no disponibles. La inferencia usa 32 pasos de Euler, 16 etapas RVQ de Mimi, temperaturas acústica y semántica de 0.8, top-p 0.95 y CFG scale 0.3.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la documentación proporcionada. El adaptador TCFM es específico para Flow-SLM y no se han publicado comparaciones con otros modelos de continuación de habla en los materiales disponibles.

## Limitaciones y advertencias

- Es un artefacto de investigación, no un sistema de producción. No debe usarse como reconocedor de voz, modelo de diálogo semántico ni sistema de clonación de voz.
- El audio generado puede contener contenido incorrecto, inestable o sesgado. No se garantiza la fidelidad léxica ni sintáctica.
- Solo se evaluaron tres semillas de entrenamiento; los resultados no establecen una mejora universal en todos los escenarios.
- La licencia no está especificada. El modelo base Flow-SLM no incluye archivo de licencia, por lo que el uso comercial puede estar sujeto a restricciones no declaradas.
- El adaptador requiere el checkpoint base Flow-SLM 1B-extended, que no se redistribuye en este repositorio y está sujeto a los términos originales de sus autores.
- Se debe obtener consentimiento explícito antes de procesar o imitar la voz de una persona.
- El modelo solo soporta inglés y está entrenado con datos de LibriSpeech, lo que limita su generalización a otros idiomas o acentos.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/NYCU-MLLab/Temporal-Coupled-Flow-Matching-for-Speech-Continuation
- Repositorio GitHub (código y reproducción): https://github.com/JoyBoyuuu/TCFM
- Repositorio GitHub del adaptador (mismo contenido): https://github.com/NYCU-MLLab/Temporal-Coupled-Flow-Matching-for-Speech-Continuation
- Modelo base Flow-SLM 1B-extended (adaptadores): https://huggingface.co/JoyBoyuuu/TCFM-Flow-SLM-1B-Extended
- Laboratorio NYCU MLLab (ResearchGate): https://www.researchgate.net/lab/NYCU-Machine-Learning-Lab-Jen-Tzung-Chien
