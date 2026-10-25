# caspar/MiniMind-Dense-64M-GSM8K-GRPO-Rule-v1.0

## Resumen

MiniMind-Dense-64M-GSM8K-GRPO-Rule-v1.0 es un modelo de lenguaje denso de 63.912.192 parámetros (aproximadamente 64 M) publicado por el usuario caspar, obtenido mediante ajuste fino con GRPO (Group Relative Policy Optimization) de parámetros completos sobre el checkpoint SFT `caspar/MiniMind-Dense-64M-Mixed-SFT-v1.0`, perteneciente a la familia MiniMind. El modelo se distribuye como un experimento controlado de aprendizaje por refuerzo con recompensa verificable: la recompensa utilizada es una regla estricta de igualdad sobre el número final que sigue a `####`, aplicada sobre las 6.851 conversaciones retenidas del conjunto de entrenamiento de GSM8K.

El problema que aborda no es resolver aritmética de forma fiable, sino aislar el efecto de una señal de recompensa basada en reglas frente a una recompensa de modelo (la variante Skywork), partiendo exactamente del mismo checkpoint SFT, con el mismo orden de datos y los mismos hiperparámetros. Es relevante ahora porque documenta de forma inusualmente transparente un resultado negativo: la precisión en el test oficial de GSM8K pasa de 14/1.319 (1,06 %) a solo 18/1.319 (1,36 %) tras el entrenamiento, con 388 errores de formato y 382 respuestas que agotan el presupuesto de salida.

El modelo es de código personalizado (`model_minimind.py`, requiere `trust_remote_code=True`), está etiquetado como `experimental`, solo soporta inglés y se publica bajo licencia Apache-2.0. No es un solucionador aritmético fiable ni un modelo apto para producción, tal y como advierte el propio autor en la model card.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (familia MiniMind, implementación en `model_minimind.py` con código personalizado); número de capas, dimensión oculta y cabezas de atención: no disponible |
| Parametros totales | 63.912.192 (aproximadamente 64 M) |
| Parametros activos | No aplica (modelo denso, no es MoE) |
| Longitud de contexto | No disponible como ventana oficial; el entrenamiento y la evaluación usan prompts de hasta 768 tokens y salidas de hasta 256 tokens (el SFT base se entrenó con ventanas de 340 tokens) |
| Tipos de cuantizacion | No disponible; el repositorio solo publica pesos en safetensors FP32 (0,3 GB de repositorio) |
| Idiomas soportados | Inglés (`en`) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (FP32), más código Python personalizado para la definición del modelo |

## Arquitectura y entrenamiento

La arquitectura es un transformer denso de la familia MiniMind, cargado mediante código personalizado del repositorio (`trust_remote_code=True`), con pesos almacenados en FP32 y una plantilla de chat propia que incluye un bloque ` thinking` que la propia model card elimina en el ejemplo de uso (`open_thinking=False` y sustitución posterior de la cadena vacía). No se detallan en la información disponible el número de capas, la dimensión del modelo, el número de cabezas ni la composición exacta del corpus de preentrenamiento y SFT previo.

El ajuste publicado es un GRPO de parámetros completos a partir del checkpoint SFT fijado en `7597c22aa4d3e7b2ac824b4b4be01158cccf1b8d`. La variante de recompensa es `rule`: igualdad estricta del número final tras `####` (1 si es correcto, 0 en caso contrario), con ventajas normalizadas por grupo. Las variantes `rule` y `Skywork` parten del mismo checkpoint SFT y comparten orden de datos e hiperparámetros; la variante Skywork usa el logit crudo de clasificación de `Skywork/Skywork-Reward-V2-Qwen3-1.7B` (revisión `e51ea3e08fb81326c3b812a7ff0cb9cee83e59cc`), sin recompensa de regla, bonus de longitud ni penalización por repetición. Datos de entrenamiento: revisión `542384d27d374d668413d8ade5b9973b7b063bee`, 6.851 conversaciones de entrenamiento de GSM8K retenidas, una época completa, 215 actualizaciones, lote de 32 preguntas con cuatro generaciones por pregunta, microbatch de 8, AdamW con LR 1e-6→1e-7 (coseno), KL beta 0,04, clipping 0,2, weight decay 0,01, gradient clip 1 y semilla 42. Parámetros en FP32 con autocast BF16 sobre una GPU A40; muestreo con temperatura 1, top-p 1 y top-k 0. No se usa oro del conjunto de test en los prompts de política ni de recompensa; el oro de entrenamiento solo se emplea para la recompensa de regla y el cálculo de corrección diagnóstica.

Como controles de calidad del artefacto, el autor indica que el paquete final de safetensors FP32 se recargó y se verificó la igualdad exacta de pesos y logits antes de evaluar, y que no hubo selección del mejor checkpoint. También advierte explícitamente de que la comparación con el SFT base no está emparejada en longitud de contexto, porque el SFT usó ventanas de 340 tokens y esta ejecución las amplía.

## Capacidades

- Generación de texto en inglés con plantilla de chat conversacional (`apply_chat_template` con `add_generation_prompt=True`).
- Resolución de problemas aritméticos de estilo GSM8K con razonamiento paso a paso solicitado en el prompt y formato de respuesta terminado en `#### número`.
- Cumplimiento (parcial) de formato de respuesta estricto, evaluado con el mismo scorer de regla antes y después del entrenamiento.
- Generación determinista mediante decodificación greedy (`do_sample=False`), que es la configuración usada en la evaluación publicada.
- Soporte de tool calling / function calling: no disponible (no documentado).
- Soporte de agentes y razonamiento multi-paso: no disponible (no documentado).
- Capacidades multilingües: limitadas al inglés según la etiqueta `language: en`.
- Visión, audio o modalidades adicionales: no disponibles.
- Modo "thinking": la plantilla incluye un bloque `think`, pero el ejemplo oficial lo desactiva y elimina; no se documenta ninguna ganancia asociada.

## Casos de uso

- Reproducción de experimentos de RLVR (reinforcement learning with verifiable rewards): el modelo sirve como referencia de línea base para comparar recompensas basadas en reglas frente a recompensas de modelo, ya que el autor publica hiperparámetros, semillas y revisiones exactas de datos.
- Estudio de dinámica de GRPO a pequeña escala: con 64 M de parámetros y 215 actualizaciones sobre 6.851 conversaciones, el ciclo completo de entrenamiento es asequible en una sola GPU, lo que permite iterar sobre variantes de recompensa con coste reducido.
- Docencia y divulgación sobre el efecto real del ajuste por refuerzo: el salto de 1,06 % a 1,36 % en GSM8K y los 388 errores de formato son un caso concreto para explicar que la recompensa de entrenamiento no garantiza mejora en la tarea.
- Pruebas de integración de código personalizado en Transformers: útil para validar flujos de carga con `trust_remote_code=True`, revisión fijada (`revision="v1.0"`) y verificación de igualdad de logits tras recarga de pesos.
- Prototipado en CPU y dispositivos de borde: con unos 256 MB de pesos FP32 (128 MB en BF16), el modelo cabe en cualquier equipo y permite probar tuberías de generación y plantillas de chat sin infraestructura dedicada.
- Investigación sobre cumplimiento de formato y agotamiento de presupuesto de salida: los 382 casos que agotan los 256 tokens de salida permiten analizar truncamiento y control de longitud en modelos muy pequeños.
- Filtro de formato en pipelines de datos sintéticos: no recomendable como generador fiable, pero sí como caso de prueba para validar parsers de la convención `#### número`.

## Benchmarks y rendimiento

Evaluación publicada sobre las 1.319 preguntas oficiales del test de GSM8K, decodificación greedy, salida máxima de 256 tokens y el mismo scorer estricto de regla antes y después:

| Metrica | SFT base (antes) | GRPO rule (final) |
|---|---|---|
| GSM8K test, aciertos estrictos | 14/1319 | 18/1319 |
| GSM8K test, precision | 1,06 % | 1,36 % |
| Errores de formato (final) | no disponible | 388 |
| Presupuesto de salida agotado (final) | no disponible | 382 |

No se han publicado resultados de MMLU, HumanEval, GSM8K con otra configuración de decodificación ni de la variante Skywork en la información disponible. El autor subraya que estos números verifican la exactitud del resultado final, no la validez del razonamiento, y que no se ha realizado una evaluación humana independiente.

## Requisitos de hardware

- VRAM estimada para inferencia (cálculo a partir de los 63,9 M de parámetros): aproximadamente 0,26 GB en FP32 (formato publicado), 0,13 GB en BF16/FP16, 0,06 GB en int8 y 0,03 GB en int4; a ello hay que sumar memoria para activaciones, caché KV y el runtime de PyTorch.
- GPU recomendadas: cualquier GPU con al menos 2 GB de memoria es suficiente; el entrenamiento documentado se ejecutó en una NVIDIA A40. No se requieren A100 ni H100.
- Cabe en GPU de consumo: sí, en cualquier RTX (incluidas series 20xx/30xx/40xx), GTX con suficiente memoria e incluso en CPU para inferencia de una sola petición.
- Opciones de despliegue: `transformers` con `trust_remote_code=True` es la vía documentada. vLLM, TGI, llama.cpp, Ollama y otros motores: no disponible (no hay pesos GGUF publicados y el modelo requiere código personalizado, lo que complica su carga en motores con soporte limitado de `custom_code`).
- Latencia y throughput: no disponibles. Como referencia cualitativa, el tamaño de 64 M implica un coste por token muy bajo, pero no se han publicado mediciones de tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | GSM8K test | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MiniMind-Dense-64M-GSM8K-GRPO-Rule-v1.0 (este) | 63.912.192 | No disponible (prompt 768 / salida 256) | 1,36 % (18/1319) | Apache-2.0 | Pesos safetensors FP32 en HuggingFace |
| caspar/MiniMind-Dense-64M-Mixed-SFT-v1.0 (SFT base) | Familia 64 M; cifra exacta no disponible | Ventanas de 340 tokens en SFT | 1,06 % (14/1319) | No disponible en la información | Pesos en HuggingFace |
| Variante con recompensa Skywork (mismo SFT) | Familia 64 M; cifra exacta no disponible | No disponible | No disponible en la información | No disponible en la información | Referenciada en la model card |
| MiniMind (proyecto upstream, jingyaogong/minimind) | No disponible | No disponible | No disponible | Apache-2.0 (código) | Repositorio GitHub |

Skywork-Reward-V2-Qwen3-1.7B es el modelo de recompensa empleado en la variante alternativa; se trata de un modelo evaluador de 1,7 B, no de un generador comparable, y sus pesos no se redistribuyen en este repositorio.

## Limitaciones y advertencias

- Rendimiento aritmético muy bajo: 1,36 % de acierto estricto en GSM8K test (18 de 1.319). El propio autor lo describe como "not a reliable arithmetic solver".
- Alta tasa de fallo de formato: 388 respuestas no siguen la convención `#### número`, lo que invalida el parsing en cualquier integración automatizada.
- Truncamiento frecuente: 382 respuestas agotan el límite de 256 tokens de salida, señal de razonamientos que no concluyen.
- El resultado del entrenamiento no demuestra mejora del razonamiento: la recompensa de entrenamiento sube con la métrica de regla, pero la mejora en test es de solo 4 aciertos absolutos sobre 1.319 preguntas, dentro de un margen muy estrecho.
- Riesgo de alucinación y de razonamiento plausible pero incorrecto: la evaluación verifica el número final, no la validez de los pasos intermedios.
- Contexto corto: prompts de hasta 768 tokens y salidas de hasta 256; no apto para documentos largos ni conversaciones multi-turno extensas. El SFT base usó ventanas de 340 tokens, por lo que la comparación con el baseline no está emparejada en contexto.
- Idioma: solo inglés; no se documenta soporte de castellano.
- Sesgos: no se han publicado análisis de sesgo, toxicidad o evaluación de seguridad en la información disponible.
- Código personalizado: requiere `trust_remote_code=True`; la model card recomienda revisar `model_minimind.py` antes de habilitarlo. Es un vector de riesgo en entornos de producción.
- Licencia: el modelo es Apache-2.0, pero GSM8K es MIT y los términos de los componentes del dataset mixto upstream siguen aplicándose; conviene revisar las condiciones antes de un uso comercial.
- Estado experimental y adopción nula: 0 descargas y 0 likes en el momento de la consulta, sin mantenimiento ni soporte documentado.
- No usar en producción, en atención al cliente ni en ningún flujo donde la exactitud numérica sea requisito.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/caspar/MiniMind-Dense-64M-GSM8K-GRPO-Rule-v1.0
- Modelo base (SFT): https://huggingface.co/caspar/MiniMind-Dense-64M-Mixed-SFT-v1.0
- Dataset de entrenamiento SFT mixto: https://huggingface.co/datasets/caspar/MiniMind-Mixed-SFT-Training-v1.0
- Código de MiniMind (Apache-2.0): https://github.com/jingyaogong/minimind
- Modelo de recompensa de la variante Skywork: https://huggingface.co/Skywork/Skywork-Reward-V2-Qwen3-1.7B
- Respuestas completas y oro de la evaluación: archivo `evaluation_after.json` en el repositorio del modelo (https://huggingface.co/caspar/MiniMind-Dense-64M-GSM8K-GRPO-Rule-v1.0/tree/main)
