# JoyBoyuuu/TCFM-Flow-SLM-1B-Extended

## Resumen

TCFM-Flow-SLM-1B-Extended es un conjunto de adaptadores LoRA desarrollados por JoyBoyuuu que aplican la técnica **Temporal-Coupled Flow Matching (TCFM)** al modelo base Flow-SLM 1B-extended. El objetivo es mejorar la continuación de habla (speech continuation) añadiendo supervisión explícita sobre los puntos finales y la trayectoria de la señal acústica a lo largo del tiempo de habla. El adaptador modifica únicamente el FlowHead del modelo base, preservando el sampler, el codec Mimi, el transformer y la vía semántica originales.

El modelo se presenta como tres checkpoints de adaptador (semillas 42, 1234 y 2026), cada uno con 488.448 parámetros entrenables, y requiere el checkpoint base de Flow-SLM 1B-extended para su inferencia. La relevancia actual radica en que aborda un problema conocido de los modelos de lenguaje hablado: la inestabilidad en la continuación de voz y la pérdida de identidad del hablante en generaciones largas. Los resultados reportados muestran mejoras en similitud de hablante y reducción de la distancia acústica respecto al modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre FlowHead de Flow-SLM (flow matching, transformer, codec Mimi) |
| Parametros totales | 488.448 (solo adaptador) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (depende del modelo base Flow-SLM) |
| Tipos de cuantizacion | No disponible (el adaptador se exporta en formato PyTorch .pt) |
| Idiomas soportados | Inglés (en) |
| Licencia | No disponible (el autor indica que el modelo base Flow-SLM no incluía licencia) |
| Formato de pesos | PyTorch (.pt), safetensors no disponible |

## Arquitectura y entrenamiento

TCFM se basa en la arquitectura Flow-SLM, que combina un transformer con un objetivo de flow matching para generar tokens semánticos y una representación continua del frame acústico. El adaptador LoRA se inserta únicamente en el FlowHead, es decir, en la capa que predice la velocidad del flujo condicionada a los tokens semánticos. La innovación de TCFM consiste en añadir términos de regularización que reconstruyen el endpoint limpio implicado por la velocidad predicha y penalizan el desplazamiento del endpoint, la curvatura, la dirección del movimiento y el comportamiento en el límite entre el prefijo y la continuación.

El entrenamiento se realizó sobre 4.096 muestras elegibles de LibriSpeech `train-clean-100`, con validación en 256 muestras de `dev-clean`. Cada ejemplo usa un prefijo de 3 segundos y un segmento futuro de 5 segundos. Los hiperparámetros del adaptador son: LoRA rank 4, alpha 8, dropout 0.05, batch size 8, learning rate 5e-5, weight decay 1e-4. Los pesos de los términos TCFM son: transición 0.1, límite de prefijo 0.1, curvatura 0.5, dirección 0.1, ventana de límite 16 frames. Se completaron 2.000 pasos de optimizador para cada semilla.

## Capacidades

- Continuación de habla a partir de un prompt de audio (3 segundos) generando hasta 10 segundos de voz.
- Mejora de la similitud del hablante en generación de extremo abierto (open-ended): +0.003367 en similitud media respecto al base.
- Reducción de la distancia acústica en el límite de 200 ms (log-mel): -0.05175.
- Reducción de la distancia de embedding WavLM FSD en modo abierto: de 3.653 a 2.919 (≈20% menor).
- Mayor concordancia con los frames semánticos de referencia (Mimi q0): +0.01424.
- No soporta tool calling, razonamiento multi-paso ni otras capacidades de modelos de lenguaje generales; es exclusivamente un modelo de audio-audio.

## Casos de uso

- **Generación de voz para asistentes de lectura**: dado un fragmento de audio de un narrador, el modelo continúa la narración con la misma voz y estilo, útil para audiolibros o podcasts automatizados.
- **Pruebas de robustez en sistemas de síntesis de voz**: los adaptadores permiten evaluar cómo el flujo acoplado temporalmente mejora la estabilidad de la continuación frente al base, sirviendo como banco de pruebas para investigadores.
- **Investigación en modelos de lenguaje hablado**: el adaptador es un artefacto de referencia para reproducir los experimentos TCFM y estudiar el efecto del acoplamiento temporal en la calidad de la continuación.
- **Aumento de datos de habla**: se puede usar para generar variaciones de un mismo hablante a partir de clips cortos, aunque con la advertencia de que no es un sistema de clonación de voz de producción.
- **Evaluación de métricas acústicas**: los checkpoints permiten medir la mejora en métricas como WavLM FSD o distancia log-mel en tareas de continuación, útil para comparar métodos de regularización.
- **Demostraciones académicas**: el modelo se puede integrar en pipelines de demostración para conferencias o publicaciones, mostrando diferencias objetivas entre Flow-SLM base y TCFM.

## Benchmarks y rendimiento

La model card reporta resultados de la campaña de evaluación formal sobre LibriSpeech test-clean y test-other, comparando el adaptador con el modelo base Flow-SLM. Los valores son promedios sobre tres semillas de entrenamiento y tres semillas de inferencia:

| Metrica | Base Flow-SLM | TCFM (adaptador) | Efecto (95% CI) |
|---|---|---|---|
| Similitud de hablante (open-ended) | 0.909415 | 0.912781 | +0.003367 [+0.002298, +0.004455] |
| Distancia log-mel en límite 200 ms (natural-calibrated) | 8.5462 | 8.4945 | -0.05175 [-0.07862, -0.02511] |
| WavLM FSD (open-ended) | 3.653 | 2.919 | ≈ -20% |
| Concordancia de frames Mimi q0 (oracle-semantic) | 0.65553 | 0.66977 | +0.01424 [+0.01265, +0.01576] |
| WavLM FSD (oracle-semantic) | 0.590 | 0.533 | ≈ -9.8% |

No se han publicado resultados comparativos con otros modelos como AudioLM en esta información.

## Requisitos de hardware

- El adaptador es ligero (488.448 parámetros), pero la inferencia requiere cargar el modelo base Flow-SLM 1B-extended, que tiene aproximadamente 1.300 millones de parámetros.
- Se necesita una GPU con al menos 8-12 GB de VRAM para inferencia en precisión FP16, dependiendo de la longitud de generación y el batch. No se especifican requisitos exactos.
- El script de inferencia proporcionado usa Slurm con una GPU por trabajo (`infer_1gpu.sbatch`), lo que sugiere que cabe en una GPU de gama media-alta (por ejemplo, RTX 3090 o superior).
- Opciones de despliegue: el repositorio proporciona scripts de inferencia con Slurm y un entorno conda; no se menciona compatibilidad con vLLM, Ollama o TGI.
- La latencia depende del número de pasos de Euler (32 por defecto) y de la longitud de audio generado; no se proporcionan cifras de throughput.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| TCFM-Flow-SLM-1B-Extended (adaptador) | 488.448 (adaptador) sobre base 1.3B | No disponible | Flow matching + acoplamiento temporal | No disponible | HuggingFace (adaptadores) |
| Flow-SLM 1B-extended (base) | 1.3B | No disponible | Flow matching conjunto lingüístico-acústico | No disponible | Repositorio oficial (jjery2243542/flow-slm) |
| AudioLM | No disponible | No disponible | Modelo jerárquico basado en tokens | No disponible | No disponible |

No se dispone de comparativas cuantitativas directas con otros modelos en la información proporcionada.

## Limitaciones y advertencias

- Es un artefacto de investigación para continuación de habla en inglés; no debe usarse como reconocedor de voz, modelo de diálogo semántico ni sistema de clonación de voz en producción.
- El habla generada puede contener contenido incorrecto, inestable o sesgado.
- Los resultados reportados provienen de solo tres semillas de entrenamiento; no se ha demostrado mejora universal en límites, preferencia humana ni mejora léxica/sintáctica amplia.
- La licencia no está definida: el modelo base Flow-SLM no incluía archivo de licencia, por lo que el autor no asume una licencia nueva sobre la arquitectura heredada ni sobre los activos del modelo base.
- El adaptador no redistribuye el checkpoint base ni los datasets de terceros; el usuario debe obtenerlos según sus términos originales.
- Se requiere consentimiento explícito antes de procesar o imitar la voz de una persona.

## Enlaces

- Repositorio del adaptador en HuggingFace: https://huggingface.co/JoyBoyuuu/TCFM-Flow-SLM-1B-Extended
- Repositorio de código TCFM: https://github.com/JoyBoyuuu/TCFM
- Repositorio del proyecto RA-FM (relacionado): https://github.com/JoyBoyuuu/RA-FM
- Página del proyecto Flow-SLM: https://jjery2243542.github.io/flowslm.github.io/
- Repositorio de Flow-SLM: https://github.com/jjery2243542/flow-slm
- Paper de Flow-SLM en arXiv: https://arxiv.org/abs/2508.09350 (HTML: https://arxiv.org/html/2508.09350v3)
