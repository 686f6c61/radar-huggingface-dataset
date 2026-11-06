# iceair323/INP-Spark-AES-R1-4B

## Resumen

INP Spark AES R1 4B es un modelo de lenguaje de 4.112.079.360 parámetros (aproximadamente 4,1B) desarrollado por el usuario `iceair323` dentro del proyecto INP AI companion. No es un asistente conversacional de propósito general, sino un componente especializado: un adaptador LoRA fusionado sobre el modelo base Spark-X2.6-4B que actualiza el estado emocional interno de un agente de IA a partir del contexto de interacción y del estado previo. El modelo recibe el estado actual y el contexto, y devuelve tres variables numéricas absolutas: `valence` (de -1,0 a 1,0), `arousal` (de 0,0 a 1,0) y `engagement` (de 0,0 a 1,0), en formato JSON.

La relevancia de este modelo es acotada y muy específica: sirve como módulo de estado afectivo dentro de una arquitectura de agente mayor, no como modelo de chat independiente. Emplea la arquitectura propietaria `Spark2_5ForCausalLM`, requiere `trust_remote_code=True` para cargarse y se distribuye en safetensors BF16 como modelo Transformers completo con el adaptador ya fusionado. Su licencia es Apache-2.0, sujeta a los términos del modelo base original.

El autor advierte explícitamente de que no está pensado para uso general ni para descarga por parte de usuarios que no desarrollen o integren INP Agent. Está disponible en inglés y chino, con 194 descargas y 0 likes en el momento de la consulta, y se publicó el 31 de octubre de 2026.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Spark2_5ForCausalLM (transformer causal, arquitectura personalizada con `trust_remote_code`) |
| Parametros totales | 4.112.079.360 (~4,1B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en BF16 safetensors) |
| Idiomas soportados | inglés (en), chino (zh) |
| Licencia | Apache-2.0, sujeta a los términos del modelo base Spark-X2.6-4B |
| Formato de pesos | safetensors (BF16), modelo Transformers completo fusionado |
| Modelo base | therealwayan/Spark-X2.6-4B |
| Adaptador | LoRA INP AES R1 fusionado en los pesos del modelo base |
| Tamano del repositorio | 8,2 GB |
| Libreria | transformers |

## Arquitectura y entrenamiento

El modelo se basa en `Spark2_5ForCausalLM`, una arquitectura de transformer causal personalizada que exige cargar el código remoto del repositorio (`trust_remote_code=True`). Sobre el modelo base Spark-X2.6-4B se aplicó un adaptador LoRA denominado INP AES R1, que posteriormente se fusionó en los pesos, de modo que el modelo resultante se carga como un Transformers completo sin necesidad de cargar el adaptador por separado.

No se dispone de información sobre el volumen de tokens de entrenamiento, la composición del dataset, ni sobre si se emplearon técnicas de RLHF o DPO. La model card únicamente documenta el propósito del ajuste: mapear contexto de interacción y estado emocional previo a un estado emocional actualizado con tres variables acotadas. La validación publicada compara el modelo fusionado con el modelo base más el adaptador LoRA original sobre 24 casos de prueba: 24/24 en parseo estricto de JSON, 22/24 en coincidencia exacta de salida y 24/24 en coincidencia de `valence`; las dos discrepancias afectaron solo a `arousal` y/o `engagement` en aproximadamente 0,1–0,2. El propio autor señala que el conjunto de evaluación es pequeño.

## Capacidades

- Generación de texto condicionada a contexto de interacción y estado emocional previo.
- Producción de salida estructurada en JSON con exactamente tres claves numéricas: `valence`, `arousal` y `engagement`.
- Actualización de estado absoluto (no delta): el modelo devuelve los valores nuevos y la aplicación calcula la diferencia respecto al estado anterior.
- Soporte de modo thinking (el autor recomienda desactivarlo para inferencia JSON estricta, si la implementación lo permite).
- Capacidades multilingües limitadas a inglés y chino.
- No documentado: tool calling, function calling, soporte de agentes multi-paso, visión, audio, matemáticas o generación de código.

## Casos de uso

- Integración en el sistema de estado emocional de INP Agent: el modelo recibe el estado actual (`valence`, `arousal`, `engagement`) y el contexto de la interacción, y devuelve el estado actualizado que el agente aplica a su comportamiento.
- Modulación de respuestas en agentes conversacionales con memoria afectiva: el estado devuelto puede condicionar el tono, la longitud o la iniciativa del modelo conversacional principal.
- Simulación de personajes con estado interno persistente: en videojuegos o experiencias narrativas, el módulo actualiza el estado afectivo del personaje tras cada turno de diálogo.
- Investigación sobre dinámica afectiva en agentes: permite estudiar cómo evolucionan `valence`, `arousal` y `engagement` a lo largo de conversaciones multi-turno con un componente desacoplado del modelo de chat.
- Prototipado de sistemas de acompañamiento emocional: como módulo auxiliar en asistentes de bienestar, siempre con validación de la salida y sin uso clínico.
- Evaluación comparativa de adaptadores LoRA fusionados: el repositorio documenta una metodología de validación (parseo JSON, coincidencia exacta, acuerdo por variable) reutilizable para verificar fusiones de adaptadores en otros proyectos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible. La única evaluación publicada es la validación de fidelidad de la fusión del adaptador:

| Prueba | Resultado |
|---|---:|
| Parseo estricto de JSON | 24/24 |
| Coincidencia exacta de salida | 22/24 |
| Acuerdo en `valence` | 24/24 |

Las dos salidas no idénticas difirieron solo en `arousal` y/o `engagement` en aproximadamente 0,1–0,2; `valence` fue idéntica en los 24 casos. El conjunto de evaluación es pequeño y no establece el rendimiento en todo el espacio de interacciones posibles.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: en torno a 8,2 GB solo para pesos, más overhead de activaciones y caché KV; una GPU con 16 GB o más es un punto de partida razonable, aunque el dato exacto no está disponible.
- No se documentan cuantizaciones oficiales (GGUF, GPTQ, AWQ); al ser un modelo Transformers con código remoto, la cuantización requeriría conversión manual y verificación de compatibilidad con la arquitectura personalizada.
- GPU recomendadas: no disponibles en la información proporcionada; por tamaño, cabría en GPUs de consumo con suficiente VRAM, pero la arquitectura personalizada y `trust_remote_code` añaden riesgo de incompatibilidad con herramientas de despliegue.
- Opciones de despliegue: carga estándar con `transformers` (`AutoModelForCausalLM` con `torch_dtype=torch.bfloat16`, `trust_remote_code=True`, `device_map="auto"`). No se documenta soporte para vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables de la misma categoría (componentes de actualización de estado emocional para agentes) en la documentación proporcionada. Como referencia de tamaño, el modelo base Spark-X2.6-4B es su antecesor directo; no se han encontrado alternativas documentadas con las que comparar parámetros, contexto, rendimiento, licencia y disponibilidad.

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| INP Spark AES R1 4B | ~4,1B | no disponible | Apache-2.0 (sujeta al base) | Hugging Face |
| Spark-X2.6-4B (base) | no disponible | no disponible | no disponible | Hugging Face |
| Alternativas de la misma categoría | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Modelo especializado: no es un asistente conversacional de propósito general ni un sistema de reconocimiento emocional autónomo; el autor desaconseja su descarga a quienes no desarrollen o integren INP Agent.
- Las estimaciones de estado emocional son aproximadas y pueden requerir calibración a nivel de aplicación.
- El modelo puede responder de forma distinta ante entradas fuera de su distribución de entrenamiento.
- La salida JSON debe validarse siempre con un parser en la aplicación llamante antes de aplicar el estado.
- No debe tratarse como herramienta de evaluación clínica o psicológica.
- Idiomas limitados a inglés y chino; no se documenta soporte de castellano.
- La licencia Apache-2.0 está sujeta a los términos del modelo base Spark-X2.6-4B; conviene revisar el repositorio original antes de uso comercial.
- Requiere `trust_remote_code=True`, lo que implica ejecutar código del repositorio; auditar antes de desplegar en producción.
- La validación publicada se basa en 24 casos y no garantiza el comportamiento en todas las interacciones posibles.
- Riesgo de sesgos y alucinación: no documentado específicamente, pero aplicable a cualquier modelo de lenguaje ajustado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/iceair323/INP-Spark-AES-R1-4B
- Modelo base Spark-X2.6-4B: https://huggingface.co/therealwayan/Spark-X2.6-4B
