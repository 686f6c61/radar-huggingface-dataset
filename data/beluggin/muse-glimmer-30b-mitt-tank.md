# Beluggin/Muse-Glimmer-30B-MITT-Tank

## Resumen

Muse-Glimmer-30B-MITT-Tank es un adaptador LoRA (Low-Rank Adaptation) publicado por el usuario Beluggin sobre el modelo base meta-models/Muse-Glimmer-30B, un transformer multimodal de 30.000 millones de parámetros desarrollado por Meta. El adaptador convierte una instrucción en lenguaje natural en una secuencia de movimientos codificada en JSON para un pequeño robot de orugas, dentro del proyecto MITT (multimodal-teleoperation), presentado en un hackathon. El repositorio contiene únicamente los pesos del adaptador (118 MB en `adapter_model.safetensors`), no el modelo completo.

El modelo resuelve un problema muy concreto: mapear frases como "turn left then go forward" a estructuras como `{"moves": [{"move": "spinl", "secs": 0.65}, {"move": "go", "secs": 1.0}]}`. Se entrenó con la respuesta iniciada en el canal de respuesta de Muse Glimmer, omitiendo el paso de razonamiento del modelo base, por lo que debe invocarse del mismo modo. Es relevante como ejemplo de ajuste fino de un modelo grande para function calling restringido a un dominio robótico, aunque el propio autor advierte que nunca se ha ejecutado en el robot real: la Raspberry Pi 5 del tanque no puede alojar un modelo de 30B y en producción se usa un ajuste menor sobre Llama-3.2-3B.

El adaptador se entrenó y evaluó en una GPU A100 de 80 GB alquilada, alcanzando un pico de 66,8 GB de memoria en entrenamiento a bfloat16. La licencia es Apache 2.0, heredada del modelo base, y el idioma declarado es únicamente inglés.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA sobre transformer multimodal (base: Muse-Glimmer-30B) |
| Parametros totales | 30.000 millones (modelo base); adaptador de 118 MB |
| Parametros activos | no disponible (no es MoE según la información disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el autor indica que las versiones cuantizadas no se probaron) |
| Idiomas soportados | inglés (en) |
| Licencia | Apache 2.0 (sujeta además al Usage Policy del modelo base) |
| Formato de pesos | safetensors (adaptador PEFT); requiere los 59,6 GB del modelo base |

## Arquitectura y entrenamiento

El adaptador es un LoRA PEFT sobre Muse-Glimmer-30B, un modelo multimodal de Meta cargado mediante `AutoModelForImageTextToText`. El adaptador modifica los pesos del transformer base sin alterar su arquitectura; el repositorio no detalla el rango, el alpha ni los módulos objetivo del LoRA. El entrenamiento se realizó a precisión completa (bfloat16) sobre la revisión `cec94fcfd6512f2cfe708138c32533b346ea4f69` del modelo base, con un conjunto de 1.006 ejemplos de entrenamiento y 111 de validación generados por un mismo generador sintético. La pérdida de entrenamiento llegó a aproximadamente cero y la validación al 100 %, lo que el propio autor señala como posible señal de memorización.

La innovación principal es el formato de entrenamiento: las respuestas se inician directamente en el canal de respuesta de Muse Glimmer (` to=user<|message|>`), saltándose el paso de razonamiento del modelo base. El autor no documenta el uso de RLHF ni DPO. El conjunto de datos cubre cuatro movimientos con temporizaciones en lazo abierto para un tanque pequeño, e incluye grupos de negación y trampas (por ejemplo, "don't turn left, turn right" se resuelve como ausencia de movimiento).

## Capacidades

- Traducción de instrucciones en inglés a JSON estructurado con la clave `moves`, cada una con `move` y `secs`.
- Soporte de cuatro movimientos concretos del robot (entre ellos `spinl` y `go`) con duraciones en segundos.
- Manejo de negaciones y comandos sin movimiento: devuelve `{"moves": []}` cuando la instrucción implica no moverse.
- Function calling restringido a un esquema fijo; no es un modelo de propósito general para tool calling arbitrario.
- Generación de texto en inglés como capacidades heredadas del modelo base, aunque el ajuste está especializado en el dominio robótico.
- No se documentan capacidades de visión, audio ni modo de razonamiento explícito en el uso previsto (el razonamiento se omite deliberadamente).

## Casos de uso

- Teleoperación por lenguaje natural de un robot de orugas: el adaptador convierte una frase como "turn left then go forward" en la secuencia de movimientos que un controlador interpreta; es adecuado porque el esquema de salida es fijo y verificable.
- Prototipado de interfaces voz-a-movimiento: combinado con un sistema de reconocimiento de voz, permite generar comandos JSON para un robot pequeño en entornos de laboratorio o educativos.
- Investigación sobre ajuste fino de modelos grandes para dominios restringidos: sirve como referencia para estudiar cómo se comporta un modelo de 30B frente a uno de 3B con los mismos datos.
- Generación de datos sintéticos de comandos robóticos: el modelo puede producir pares instrucción-JSON que alimenten otros entrenamientos o pruebas de controladores.
- Evaluación de robustez ante negaciones y trampas: el conjunto de pruebas incluye grupos de negación que permiten medir la tasa de movimientos indebidos en un pipeline de validación.
- Docencia y demostraciones de function calling: el ejemplo de código de la model card muestra el ciclo completo de carga del adaptador, plantilla de chat y generación determinista, útil para talleres.
- No es adecuado para vehículos reales, maquinaria pesada ni entornos donde un error de movimiento pueda causar daños, según advierte el autor.

## Benchmarks y rendimiento

| Modelo | Entorno | 50 comandos nuevos | 18 comandos originales | Respuestas inválidas | Movimiento indebido | Tiempo mediano (50 / 18) |
|---|---|---|---|---|---|---|
| Este modelo, prompt corto | A100 80 GB | 50/50 | 18/18 | 0 | 0 | 1,50 s / 1,60 s |
| Muse Glimmer 30B stock, prompt completo | A100 80 GB | 31/50 | 13/18 | 0 | 0 | 0,44 s / 0,43 s |

El autor advierte de que la puntuación del modelo stock probablemente subestima su capacidad, porque el montaje omite su paso de razonamiento; el stock respondió "no moves" a 19 de los 28 comandos con movimiento de la lista nueva. La prueba es pequeña, se ejecutó una sola vez y fue diseñada por el propio proyecto, por lo que no constituye un benchmark independiente. Los tiempos no son comparables limpiamente, ya que las respuestas rápidas del stock son en su mayoría "no moves" breves.

## Requisitos de hardware

- VRAM estimada: el entrenamiento a bfloat16 alcanzó un pico de 66,8 GB en una A100 de 80 GB; la inferencia a bfloat16 requiere cargar los 59,6 GB del modelo base más el adaptador de 118 MB.
- GPU recomendadas: A100 80 GB o H100 80 GB para precisión completa; no se probaron versiones cuantizadas.
- GPU de consumo: no cabe en GPU de consumo convencionales (RTX 4090 de 24 GB) a bfloat16; se requeriría cuantización, no validada por el autor.
- Despliegue: el ejemplo oficial usa `transformers` con `peft` y `AutoModelForImageTextToText`; no se documentan vLLM, llama.cpp, Ollama ni TGI para este adaptador.
- Latencia: tiempo mediano del modelo de 1,50 s para 50 comandos nuevos y 1,60 s para los 18 originales en A100 80 GB; no se publica throughput.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Resultado en la prueba | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Muse-Glimmer-30B-MITT-Tank | 30B (adaptador LoRA) | no disponible | 50/50 y 18/18 | Apache 2.0 | Hugging Face (adaptador) |
| Muse Glimmer 30B stock | 30B | no disponible | 31/50 y 13/18 | Apache 2.0 | Hugging Face (modelo base) |
| Llama-3.2-3B-MITT-Tank | 3B (adaptador LoRA) | no disponible | 49/50 (vía Ollama con JSON forzado) | no disponible en la información | Hugging Face (adaptador) |

El autor subraya que el resultado de 49/50 del ajuste sobre Llama no es directamente comparable, porque se ejecutó con salida JSON forzada en Ollama sobre una Raspberry Pi 5, mientras que este modelo se ejecutó con `transformers` sin restricción JSON.

## Limitaciones y advertencias

- El modelo nunca se ha ejecutado en el robot real; el tanque usa el ajuste menor Llama-3.2-3B-MITT-Tank por limitaciones de memoria de la Raspberry Pi 5.
- Riesgo de memorización: la pérdida de entrenamiento llegó a cero y la validación al 100 %, con ejemplos de validación generados por el mismo generador que los de entrenamiento.
- El conjunto de pruebas no es totalmente inédito: los grupos de negación y trampas usan el mismo tipo de frases que el entrenamiento, y los 18 comandos originales contienen frases presentes en los ejemplos de entrenamiento.
- No debe usarse como mecanismo de seguridad: el autor insiste en que un modelo no puede ser lo que detiene un robot; en MITT la parada es una comprobación de palabra previa, cada respuesta se valida estrictamente y el tiempo por movimiento se limita dos veces.
- No apto para vehículos reales, maquinaria pesada ni situaciones con riesgo de daño; solo conoce cuatro movimientos con temporizaciones en lazo abierto para un tanque pequeño, y los segundos no equivalen a la misma distancia o ángulo en otro robot.
- Sesgos conocidos: no documentados en la información disponible.
- Restricciones de licencia: Apache 2.0, pero el uso debe respetar el Usage Policy del modelo base; Muse Glimmer no está destinado a menores de 18 años.
- Idioma limitado al inglés; el rendimiento en otros idiomas no está evaluado.
- Las versiones cuantizadas no se probaron, por lo que su comportamiento es desconocido.

## Enlaces

- Hugging Face del adaptador: https://huggingface.co/Beluggin/Muse-Glimmer-30B-MITT-Tank
- Modelo base: https://huggingface.co/meta-models/Muse-Glimmer-30B
- Proyecto MITT: https://github.com/Beluggin/multimodal-teleoperation
- Ajuste menor sobre Llama: https://huggingface.co/Beluggin/Llama-3.2-3B-MITT-Tank
- Usage Policy del modelo base: incluido en el repositorio como `USAGE_POLICY.md`
