# mcemri/commenv-e1-t2-cap32

## Resumen

`mcemri/commenv-e1-t2-cap32` es un checkpoint de investigación publicado por el usuario mcemri, derivado de Qwen3-4B mediante aprendizaje por refuerzo (GRPO). No es un modelo de propósito general, sino el resultado de un experimento de comunicación multiagente: tres copias del modelo reciben cada una una parte de las pistas de un puzle lógico, conversan sobre un tablero compartido durante un máximo de seis turnos y cada agente debe entregar la solución completa. El experimento se centra en el límite de longitud de los mensajes publicados en el tablero, fijado en 32 tokens en esta ejecución.

El modelo parte del checkpoint final de `mcemri/commenv-e1-t2-combined` (entrenado con el mismo juego pero con un límite de 96 tokens) y se somete a 40 pasos adicionales de RL con el límite reducido a 32 tokens. El resultado principal es una mejora de la precisión individual del 80,3 % al 90,0 % en 400 puzles reservados, con un intervalo de confianza del 95 % de 6,5 a 12,9 puntos, mientras que el rendimiento con el límite original de 96 tokens se mantiene prácticamente igual (96,8 % antes, 96,7 % después).

La relevancia es estrictamente de investigación: explora cómo la presión sobre la longitud de los mensajes afecta a la calidad de la comunicación emergente entre agentes y a la densidad informativa por token. La arquitectura subyacente es la de Qwen3-4B, con 4 mil millones de parámetros, licencia Apache-2.0 y pesos en formato safetensors.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de Qwen3-4B); el modelo no redefine la arquitectura, solo se ajusta con RL |
| Parametros totales | 4 mil millones (heredados de Qwen3-4B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la información proporcionada (la base Qwen3-4B soporta contexto largo, pero no se confirma aquí) |
| Tipos de cuantizacion | no disponible (solo se distribuyen pesos safetensors en el repo) |
| Idiomas soportados | no disponible (la model card no declara idiomas; la base Qwen3-4B es multilingüe, pero no se especifica para este checkpoint) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (Transformers); checkpoint del entrenador en 4 shards de 22,5 GB |
| Tamaño del repo | 41,8 GB |
| Pipeline declarado | reinforcement-learning |
| Modelo base | Qwen/Qwen3-4B |
| Checkpoint previo | mcemri/commenv-e1-t2-combined |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura transformer decoder-only de Qwen3-4B (4 mil millones de parámetros). Sobre esa base se aplica un ajuste fino con aprendizaje por refuerzo mediante GRPO (Group Relative Policy Optimization) durante 40 pasos adicionales, partiendo del checkpoint `commenv-e1-t2-combined`. El entorno de entrenamiento es un juego de puzles lógicos divididos: tres copias del modelo actúan como agentes, cada una con un subconjunto de pistas, y deben comunicarse a través de un tablero compartido durante un máximo de seis turnos para que cada agente produzca la solución completa. La recompensa se basa en la corrección de la solución entregada por cada agente.

La innovación técnica del experimento es la restricción explícita de longitud: los mensajes publicados en el tablero se truncan a 32 tokens, frente a los 96 del entrenamiento previo. Según la model card, tras el ajuste los agentes escriben mensajes más cortos (66 tokens de media frente a 84 antes), reformulan las pistas en lugar de citarlas y emplean más turnos. Un control con Qwen3-4B sin entrenar que solo lee el tablero final de 32 tokens acierta el puzle completo en el 75 % de los asientos (61 % con los tableros del modelo anterior), lo que sugiere que la información útil por token aumenta. No se documentan detalles sobre el dataset de puzles, el número de tokens de entrenamiento ni la composición de las recompensas más allá de lo descrito.

## Capacidades

- Generación de texto y razonamiento lógico dentro de un juego de puzles divididos con pistas repartidas entre agentes.
- Comunicación multiagente: los agentes publican mensajes en un tablero compartido y coordinan hasta seis turnos.
- Compresión de información: produce mensajes de unos 66 tokens de media que reformulan pistas en lugar de citarlas.
- Resolución individual del puzle completo a partir de las pistas propias y del tablero compartido.
- Soporte de tool calling / function calling: no disponible (no se menciona en la model card).
- Soporte de agentes y razonamiento multi-paso: sí, en el sentido acotado del juego de comunicación descrito, no como framework de agentes general.
- Capacidades multilingües: no disponible.
- Capacidades especiales: no se declaran modos de pensamiento, visión ni audio; el modelo es un checkpoint de investigación, no un producto.

## Casos de uso

- Investigación en comunicación emergente entre agentes: el checkpoint sirve para estudiar cómo la restricción de longitud de mensajes afecta a la densidad informativa y a la coordinación, comparando los resultados con el límite de 96 tokens del checkpoint previo.
- Experimentos de compresión de mensajes en sistemas multiagente: permite analizar qué estrategias (reformular, abreviar, cambiar de turno) adoptan los agentes cuando el presupuesto por mensaje es de 32 tokens.
- Evaluación de RL con GRPO sobre modelos pequeños: el repo incluye checkpoints en los pasos 20 y 40, lo que facilita estudiar la curva de aprendizaje y la estabilidad del entrenamiento.
- Reproducción de entornos de puzles lógicos divididos: el modelo puede integrarse como política en el mismo entorno de juego para replicar los resultados reportados (90,0 % individual, 83,5 % de equipos con los tres agentes correctos).
- Estudio de robustez ante truncamiento: dado que el 67 % de los mensajes siguen siendo recortados con el límite de 32 tokens, es útil para investigar el impacto del truncamiento en la calidad de la solución.
- Punto de partida para ajustes posteriores: al incluir el checkpoint del entrenador (paso 40, con estado del optimizador), se puede continuar el entrenamiento con otras restricciones o recompensas.

## Benchmarks y rendimiento

Resultados reportados en la model card sobre 400 puzles reservados:

| Metrica | Antes del run | Paso 20 | Paso 40 |
|---|---|---|---|
| Agentes con el puzle completo correcto (límite 32 tokens) | 80,3 % | 84,4 % | 90,0 % |
| Equipos con los tres agentes correctos (límite 32 tokens) | no disponible | no disponible | 68,3 % antes / 83,5 % después (según redacción de la model card) |
| Rendimiento con límite de 96 tokens | 96,8 % | no disponible | 96,7 % |
| Longitud media de los mensajes | 84 tokens | no disponible | 66 tokens |
| Mensajes truncados | no disponible | no disponible | 67 % |
| Control sin entrenar leyendo el tablero final (32 tokens) | 61 % (tableros del modelo anterior) | no disponible | 75 % |

La mejora de 80,3 % a 90,0 % equivale a +9,7 puntos con un intervalo de confianza del 95 % de 6,5 a 12,9. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos en safetensors ocupan 8,8 GB por checkpoint; en fp16 se necesita aproximadamente esa cifra más overhead, y en cuantizaciones de 8 o 4 bits bajaría sustancialmente, aunque el repo no distribuye versiones cuantizadas.
- GPU recomendadas: A100 o H100 para entrenamiento o inferencia en fp16 sin cuantizar; RTX 4090 (24 GB) es suficiente para cargar los pesos en fp16 con margen.
- Cabe en GPU de consumo: sí, en tarjetas con 16 GB o más en fp16, y en configuraciones menores si se cuantiza por cuenta propia (no se ofrecen GGUF en el repo).
- Opciones de despliegue: Transformers (carga documentada con `AutoModelForCausalLM` y subcarpeta `export/global_step_40/policy`); vLLM, llama.cpp, Ollama o TGI no están documentados para este checkpoint.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| mcemri/commenv-e1-t2-cap32 | 4 mil millones | no disponible | RL multiagente con límite de 32 tokens | Apache-2.0 | Hugging Face |
| mcemri/commenv-e1-t2-combined | 4 mil millones | no disponible | RL multiagente con límite de 96 tokens (checkpoint previo) | Apache-2.0 (heredada) | Hugging Face |
| Qwen/Qwen3-4B | 4 mil millones | no disponible en esta ficha | Modelo base de propósito general | Apache-2.0 | Hugging Face |

No se dispone de datos de benchmarks comparables entre estos modelos en la información proporcionada, más allá de las cifras del propio entorno de puzles.

## Limitaciones y advertencias

- Checkpoint de investigación, no un producto: la model card lo declara explícitamente; no está pensado para uso en producción.
- Rendimiento específico de un juego: los resultados (90,0 % individual) se refieren a puzles lógicos divididos con un tablero de 32 tokens y seis turnos; no indican capacidades generales.
- Truncamiento persistente: el 67 % de los mensajes siguen siendo recortados con el límite de 32 tokens, lo que puede degradar la coordinación en escenarios más complejos.
- Sesgos conocidos: no documentados en la información disponible.
- Riesgo de alucinación: no evaluado en la model card; al ser un modelo de 4 mil millones ajustado con RL sobre una tarea concreta, no se recomienda su uso fuera de ese entorno sin validación.
- Idiomas: no se declaran idiomas soportados para este checkpoint.
- Restricciones de licencia: Apache-2.0 permite uso comercial, pero el modelo no está validado para ello y su naturaleza de investigación desaconseja su despliegue en producción.
- Tamaño del repo: 41,8 GB, de los cuales 22,5 GB corresponden al checkpoint del entrenador (necesario solo para continuar el entrenamiento); conviene descargar únicamente la subcarpeta `export/global_step_40/policy` si solo se quiere inferencia.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mcemri/commenv-e1-t2-cap32
- Checkpoint previo: https://huggingface.co/mcemri/commenv-e1-t2-combined
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B
