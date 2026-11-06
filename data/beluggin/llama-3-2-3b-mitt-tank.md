# Beluggin/Llama-3.2-3B-MITT-Tank

## Resumen

Llama-3.2-3B-MITT-Tank es un ajuste fino mediante LoRA del modelo meta-llama/Llama-3.2-3B-Instruct, desarrollado por el usuario Beluggin en el contexto de MITT (multimodal-teleoperation), un proyecto de hackathon. Su propósito es muy concreto: convertir una instrucción en lenguaje natural en una secuencia de movimientos en formato JSON para un robot de orugas, y —lo más importante— saber cuándo no debe moverse. El modelo base ya interpretaba bien jerga y comandos encadenados, pero también generaba movimientos ante instrucciones que no lo requerían, como "pick up the ball" o "what does go forward mean".

El ajuste se distribuye como adaptador LoRA (PEFT) sobre el modelo base de 3.212.749.888 parámetros, junto con una versión fusionada y cuantizada en GGUF Q4_K_M de aproximadamente 2 GB, pensada para ejecutarse en una Raspberry Pi 5 mediante Ollama. La relevancia del modelo no reside en su rendimiento general, sino en demostrar que un ajuste fino pequeño y barato (unos 8,5 minutos en una RTX 4060) puede corregir un comportamiento específico de un modelo de 3B en un dominio restringido y con recursos de hardware muy limitados.

Es un modelo de nicho, con cero descargas y cero likes en el momento de la consulta, y no debe confundirse con un modelo de propósito general: solo conoce cuatro movimientos con temporizaciones de lazo abierto para un robot concreto. La model card es explícita al respecto y desaconseja su uso en contextos de seguridad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 3.2), ajuste fino mediante LoRA sobre el modelo base |
| Parametros totales | 3.212.749.888 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada (heredada del modelo base) |
| Tipos de cuantizacion | GGUF Q4_K_M (version fusionada publicada); el adaptador LoRA se distribuye en safetensors |
| Idiomas soportados | Ingles (segun la model card y los tags del repositorio) |
| Licencia | Llama 3.2 Community License |
| Formato de pesos | safetensors (adaptador LoRA: `adapter_model.safetensors`, `adapter_config.json`) y GGUF (`Llama-3.2-3B-MITT-Tank.Q4_K_M.gguf`) |

## Arquitectura y entrenamiento

El modelo parte de meta-llama/Llama-3.2-3B-Instruct, cargado en cuantización de 4 bits, y aplica un adaptador LoRA de rango 16 únicamente sobre las proyecciones de atención. El entrenamiento consistió en 3 épocas, con tamaño de lote 4 y tasa de aprendizaje 2e-4, y se completó en aproximadamente 8,5 minutos sobre una RTX 4060. Los datos de entrenamiento son 1.006 ejemplos de entrenamiento y 111 de validación, generados a partir de listas de palabras con una semilla fija mediante el script `make_dataset.py` del repositorio del proyecto.

La innovación técnica no está en la arquitectura —que es la del modelo base sin modificaciones— sino en el enfoque de datos: el conjunto incluye grupos de negación y de trampa diseñados para que el modelo aprenda a emitir una lista de movimientos vacía (`{"moves": []}`) ante instrucciones que no implican desplazamiento. La validación por épocas alcanzó un 94,6 %, 98,2 % y 99,1 % de movimientos correctos, aunque el propio autor advierte que esos ejemplos provienen del mismo generador que los de entrenamiento y constituyen, por tanto, una prueba fácil. No se menciona el uso de RLHF ni DPO en el ajuste.

## Capacidades

- Generación de JSON estructurado a partir de una instrucción en lenguaje natural, con el formato `{"moves": [{"move": ..., "secs": ...}]}`.
- Reconocimiento de cuatro movimientos concretos del robot: `go`, `spinl` (giro a la izquierda) y los definidos por el driver, con temporizaciones en segundos.
- Encadenamiento de comandos múltiples en una sola instrucción ("turn left then go forward" produce dos movimientos ordenados).
- Comprensión de jerga y variantes léxicas del dominio ("scoot ahead a little bit", "advance", "retreat", "veer").
- Detección de negación y de instrucciones sin movimiento: devuelve una lista vacía ante "do not turn left", "turn on the lights", "pick up the ball" o preguntas como "what does go forward mean".
- Modo conversacional heredado del modelo base Instruct, aunque el ajuste está orientado a una única respuesta JSON.
- No dispone de tool calling genérico, capacidades de agente multi-paso, visión, audio ni modo de razonamiento extendido; los tags `function-calling` y `robotics` describen el dominio de aplicación, no funcionalidades del modelo.
- Capacidad multilingüe limitada al inglés según la model card.

## Casos de uso

- Teleoperación de un robot de orugas con instrucciones en lenguaje natural: el modelo traduce "turn left then go forward" en una secuencia JSON de movimientos con duraciones, que el driver de MITT ejecuta tras validar la respuesta. Es su caso de uso principal y el único validado sobre hardware real.
- Control por voz en una Raspberry Pi 5: al ejecutarse en CPU con Ollama y ocupar unos 2 GB en Q4_K_M, permite integrar el modelo en un pipeline de reconocimiento de voz a bordo de un robot con 4 GB de RAM, con latencias medianas de 3,97 s por comando.
- Filtro de intenciones antes de actuar: el ajuste está diseñado para que el robot no se mueva ante instrucciones ambiguas, negaciones o preguntas, lo que reduce activaciones accidentales en entornos con personas.
- Prototipado rápido de interfaces de control para robótica educativa: el adaptador se entrena en minutos y el flujo completo (generación de dataset, LoRA, fusión y cuantización a GGUF) sirve como plantilla reproducible para otros robots pequeños.
- Demostración de ajuste fino eficiente en recursos: con 1.006 ejemplos y 8,5 minutos de entrenamiento en una GPU de consumo, es un caso práctico para enseñar cómo corregir un comportamiento concreto de un modelo de 3B.
- Evaluación comparativa de parsers: la model card incluye una comparación frente a un parser de frases fijas sin modelo (36/50 frente a 49/50), útil para justificar el uso de un LLM pequeño frente a reglas heurísticas en dominios con vocabulario abierto.

## Benchmarks y rendimiento

Los resultados publicados son una evaluación propia del autor, ejecutada una sola vez, con temperatura 0 y salida JSON activada en Ollama. Cada comando se considera correcto solo si los movimientos aparecen en el orden exacto y sin añadidos; el tiempo por movimiento no se puntúa.

| Modelo | Plataforma | 50 comandos nuevos | 18 comandos originales | Tiempo mediano del modelo |
|---|---|---|---|---|
| Este modelo | Raspberry Pi 5, 4 GB, CPU | 49/50 | 18/18 | 3,97 s (50), 4,19 s (18) |
| Llama 3.2 3B original, Ollama Q4 | misma Pi | 45/50 | 18/18 | 4,16 s (50), 3,86 s (18) |
| Este modelo | sobremesa, RTX 4060 | 49/50 | 18/18 | 0,39 s (50) |
| Llama 3.2 3B original, Ollama Q4 | misma sobremesa | 42/50 | no ejecutado | 0,40 s (50) |
| Parser de frases fijas (sin modelo) | cualquiera | 36/50 | 18/18 | no aplica |

El único fallo de este modelo fue "do a 180", que devolvió un movimiento inexistente (`spin`); la comprobación de respuesta de MITT lo rechaza y el robot no se mueve. El autor señala que la mejora está en la precisión, no en la velocidad, y que el modelo original obtuvo puntuaciones distintas en dos máquinas (42 en sobremesa y 45 en la Pi) con la misma configuración, por lo que las diferencias pequeñas deben tratarse como ruido. No se han publicado resultados en benchmarks estándar como MMLU, HumanEval o GSM8K.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita; la versión GGUF Q4_K_M ocupa aproximadamente 2 GB y el adaptador LoRA se aplica sobre el modelo base cargado en 4 bits.
- GPU recomendadas: el autor validó el entrenamiento y la inferencia en una RTX 4060; el modelo base de 3B en 4 bits cabe en GPUs de consumo con 6-8 GB de VRAM.
- Cabe en GPU de consumo: sí, en tarjetas como la RTX 4060 empleada por el autor y, en general, en cualquier GPU con al menos 6 GB de VRAM para la versión cuantizada.
- Despliegue en CPU: validado en Raspberry Pi 5 con 4 GB de RAM mediante Ollama, con latencias medianas de 3,97 s por comando.
- Opciones de despliegue: Ollama es la vía documentada, mediante `ollama create llama-3.2-3b-mitt-tank -f Modelfile` con el `Modelfile` incluido en el repositorio. El adaptador PEFT puede cargarse con la librería `peft` sobre el modelo base; no se documentan configuraciones para vLLM, llama.cpp directo ni TGI.
- Latencia y throughput: 3,97 s de mediana por comando en Raspberry Pi 5 (CPU) y 0,39 s en RTX 4060. No se proporcionan datos de throughput en tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento en la tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Llama-3.2-3B-MITT-Tank | 3.212.749.888 | No disponible | 49/50 comandos nuevos, 18/18 originales | Llama 3.2 Community License | Hugging Face (adaptador LoRA y GGUF) |
| Llama 3.2 3B Instruct (original) | 3.212.749.888 | No disponible en la informacion proporcionada | 42/50 en sobremesa, 45/50 en Pi; 18/18 originales | Llama 3.2 Community License | Hugging Face (modelo base oficial de Meta) |
| Parser de frases fijas (sin modelo) | 0 | No aplica | 36/50 comandos nuevos, 18/18 originales | No aplica | Codigo del proyecto MITT |

La comparación se limita a estos tres sistemas porque la model card no ofrece referencias frente a otros ajustes finos de robótica o modelos de función similar. Frente al modelo base, la mejora se concentra en los comandos nuevos (49 frente a 42-45) y en la capacidad de no moverse ante instrucciones trampa; frente al parser de reglas, la ventaja es la generalización a vocabulario abierto (49 frente a 36).

## Limitaciones y advertencias

- El propio autor advierte explícitamente que un modelo no debe ser el componente que detenga un robot: el modelo conjetura y a veces se equivoca. En MITT, la parada se implementa como una comprobación de palabras que se ejecuta antes de consultar al modelo, cada respuesta se valida estrictamente, el tiempo por movimiento se limita dos veces y el modelo no puede fijar la velocidad.
- Solo conoce cuatro movimientos con temporizaciones de lazo abierto para un robot de orugas concreto; los segundos de sus respuestas no corresponden a la misma distancia o ángulo en otro robot.
- La evaluación es pequeña, se ejecutó una sola vez y fue diseñada por el propio proyecto: no es un benchmark independiente.
- El conjunto de prueba no es completamente inédito: aunque ningún comando completo aparece en entrenamiento, los grupos de negación y trampa usan los mismos tipos de frase que el entrenamiento ("turn on the fan" está en entrenamiento y "turn on the lights" en prueba), por lo que se espera un rendimiento peor ante tipos de frase no vistos.
- Los 18 comandos originales no son una prueba limpia: se excluyeron como comandos completos del entrenamiento, pero sus frases simples aparecen dentro de ejemplos de entrenamiento y condicionaron el prompt original.
- Algunas respuestas son decisiones de criterio: "don't turn left, turn right" se cuenta como no movimiento porque la regla del proyecto es que cualquier negación implica no moverse, aunque el giro a la derecha del modelo original podría ser lo que el usuario pretendía.
- El modelo original puntuó distinto en dos máquinas (42 y 45) con la misma configuración, un comportamiento sin explicar, por lo que las diferencias pequeñas de puntuación deben considerarse ruido.
- Los prompts difieren entre modelos comparados: el original usó el prompt largo de MITT con reglas y ejemplos, y este modelo el prompt corto que se muestra en la model card.
- Idioma limitado al inglés; no se documenta soporte de castellano ni de otros idiomas.
- Uso comercial sujeto a la Llama 3.2 Community License y a la Acceptable Use Policy de Meta.
- Riesgo de alucinación en el formato: el único fallo documentado devolvió un movimiento inexistente (`spin`), lo que exige validación estricta de la salida en producción.
- El repositorio registra cero descargas y cero likes, sin validación externa por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Beluggin/Llama-3.2-3B-MITT-Tank
- Repositorio del proyecto MITT: https://github.com/Beluggin/multimodal-teleoperation
- Script de generación del dataset: https://github.com/Beluggin/multimodal-teleoperation/tree/main/train
- Modelo base: https://huggingface.co/meta-llama/Llama-3.2-3B-Instruct
- Licencia Llama 3.2: https://www.llama.com/llama3_2/license/
- Politica de uso aceptable Llama 3.2: https://www.llama.com/llama3_2/use-policy
- Hilo de Reddit sobre Llama 3.2 3B: https://www.reddit.com/r/LocalLLaMA/comments/1hl1tso/llama_32_3b_is_amazing/
