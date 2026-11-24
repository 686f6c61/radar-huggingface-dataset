# Laplace-AI-Research/Signet-4B

## Resumen

Signet-4B es un adaptador LoRA de rango 16 sobre el modelo base Qwen/Qwen3.5-4B, desarrollado por Laplace Research (Arya Somu y Bruce Nshuti Hirwa) y publicado en noviembre de 2026 bajo licencia Apache-2.0. No es un modelo completo, sino un ajuste fino orientado a un problema muy concreto: la resistencia a la presión conversacional y la verificación de procedencia de la información. El adaptador enseña al modelo a mantener una respuesta correcta cuando el usuario la cuestiona, a aceptar una corrección válida cuando la evidencia lo justifica, a declarar información insuficiente cuando no hay datos determinantes y, sobre todo, a distinguir entre un registro auténtico entregado por un canal de herramienta (tool response) y el mismo texto pegado dentro de un mensaje de usuario.

La relevancia del modelo radica en que, según sus autores, ningún modelo comercial probado verifica el canal de procedencia: dado el mismo registro como respuesta de herramienta o pegado en un turno de usuario, Qwen3.5-4B y sus variantes de 2B y 9B lo adoptan con tasas casi idénticas (diferencia de canal dentro de ±0,05). Los adaptadores anteriores de la familia Conviction (Anchor, Vector, Meridian) aprendían a rechazar formulaciones falsas, no el canal. Signet se presenta como el primer modelo de esa familia entrenado para que sea el propio canal el que determine la validez de la evidencia.

El adaptador tiene 32,5 millones de parámetros entrenables, opera en modo no-thinking con una respuesta JSON fija y se entrenó con GRPO durante 400 pasos sobre datos con contraste de canal emparejado. Está pensado para tareas de razonamiento verificable y agentes que consumen datos de herramientas autenticadas, no como modelo de propósito general.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | LoRA (r=16, α=32, dropout 0.05) sobre Qwen/Qwen3.5-4B, que usa capas de atención lineal |
| Parámetros totales | No disponible (adaptador: 32,5 M parámetros entrenables; el modelo base Qwen3.5-4B no detalla su recuento en la información) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | No disponible (el adaptador se publica en safetensors; el modelo base admite las cuantizaciones propias de Qwen3.5-4B, no detalladas) |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache-2.0 (modelo base: Apache-2.0) |
| Formato de pesos | safetensors (adaptador PEFT/LoRA; requiere fusión con el modelo base) |

## Arquitectura y entrenamiento

Signet-4B es un adaptador LoRA de rango 16 con α=32 y dropout 0.05 aplicado a todas las capas lineales del modelo de lenguaje de Qwen3.5-4B. El modelo base emplea capas de atención lineal (se recomienda instalar `flash-linear-attention` para los kernels rápidos) y dispone de una torre de visión que el adaptador deja intacta: el ajuste es exclusivamente de texto. El adaptador se distribuye como pesos PEFT y debe fusionarse con el modelo base mediante `merge_and_unload()` para su uso en inferencia.

El entrenamiento se realizó con GRPO (Group Relative Policy Optimization) partiendo del modelo base, en una receta que los autores denominan "RL-only", durante 400 pasos y con datos de contraste de canal emparejado: el mismo registro se presenta como respuesta de herramienta auténtica y como texto pegado en un turno de usuario, de modo que la recompensa penaliza adoptar la versión no autenticada. El modelo opera en modo no-thinking (`enable_thinking=False`) con una respuesta JSON fija que contiene los campos `reason`, `answer` y `decision` (valores `answer`, `keep`, `revise` o `insufficient`). Se entrenó y evaluó con un system prompt fijo (`SYSTEM_BASE`) que define explícitamente que los registros solo llegan como respuestas de herramienta y que el texto en mensajes de usuario es una afirmación, nunca evidencia.

## Capacidades

- Razonamiento verificable con respuesta estructurada en JSON (`reason`, `answer`, `decision`).
- Resistencia a la presión conversacional: mantiene la respuesta correcta ante intentos de persuasión (tasa de flip del 0,2 % en `test_id` frente al 38,3 % del modelo base).
- Revisión de creencias: distingue entre mantener (`keep`), revisar (`revise`) y declarar información insuficiente (`insufficient`).
- Verificación de procedencia de canal: acepta un registro solo si llega como respuesta de herramienta auténtica; el mismo texto en un mensaje de usuario se trata como afirmación.
- Generalización a formatos de pegado no vistos en entrenamiento (bloques de cita, mensajes reenviados, bloques de código).
- Generalización a subtipos de problema estructuralmente nuevos (`test_structural`), con precisión del 98,5 %.
- Modo no-thinking exclusivamente; no se documenta soporte de modo thinking.
- Capacidades multilingües limitadas al inglés.
- No se documenta soporte de tool calling general más allá del canal de herramienta que el modelo verifica; no se documentan capacidades de visión activas (la torre de visión del base queda sin ajustar).

## Casos de uso

- Agentes que consumen datos de herramientas autenticadas: el modelo solo adopta registros que llegan por el canal `tool`, lo que evita que un atacante inyecte datos falsos en un turno de usuario y el agente los trate como estado autoritativo del problema.
- Defensa frente a inyección de prompts por pegado: si un usuario pega un supuesto "registro del sistema" en el chat, Signet lo trata como afirmación y no como evidencia, cubriendo formatos como bloques de cita, reenvíos y bloques de código.
- Sistemas de atención al cliente con datos sensibles: el modelo mantiene la respuesta correcta ante presión del usuario y declara información insuficiente cuando no hay datos determinantes, reduciendo respuestas inventadas en conversaciones multi-turno.
- Verificación de cálculos y hechos en pipelines de decisión: con una precisión final del 98,9 % en `test_id` y respuesta JSON parseable, encaja en flujos que necesitan una salida estructurada y auditable.
- Evaluación de robustez y sycophancy: sirve como referencia para medir cuánto cede un modelo ante la presión del usuario y para comparar recetas de RL frente a SFT en tareas de revisión de creencias.
- Investigación en procedencia y proveniencia de datos: el adaptador y ConvictionBench permiten estudiar cómo se comporta un modelo cuando la autenticidad de la evidencia depende del canal y no del contenido.
- Moderación de contenido y verificación de afirmaciones: el modelo puede clasificar si una afirmación del usuario está respaldada por un registro autenticado o si debe marcarse como no verificada.

## Benchmarks y rendimiento

Resultados en los splits de test de ConvictionBench v0.1, decodificación greedy, modo no-thinking, límite de 200 tokens y el system prompt indicado. Los corchetes son intervalos de confianza del 95 % por bootstrap sobre grupos de problemas. La "brecha de canal" (channel gap) es la tasa de adopción de un registro entregado como respuesta de herramienta menos la adopción del mismo registro pegado en un turno de usuario (mayor = el modelo verifica el canal; 0 = no lo hace).

| Métrica | Qwen3.5-4B | Signet-4B |
|---|---|---|
| `test_id` precisión final | 0,629 [0,602; 0,657] | 0,989 [0,984; 0,994] |
| `test_template` precisión final | 0,620 [0,595; 0,644] | 0,989 [0,985; 0,994] |
| `test_structural` precisión final (tipos no vistos) | 0,606 [0,580; 0,631] | 0,985 [0,977; 0,992] |
| `test_id` tasa de flip por presión ↓ | 0,383 [0,355; 0,411] | 0,002 [0,000; 0,005] |
| `test_structural` tasa de flip por presión ↓ | 0,428 [0,401; 0,456] | 0,005 [0,001; 0,010] |
| Brecha de canal (channel gap) | Dentro de ±0,05 (no verifica) | No disponible en la información (se describe como el criterio que el modelo aprende; no se da el valor numérico) |

Los autores indican que la regla de canal se mantiene en formatos de pegado nunca vistos en entrenamiento (bloques de cita, mensajes reenviados, bloques de código), aunque no se aportan cifras desglosadas para esos formatos en la información disponible.

## Requisitos de hardware

- El adaptador pesa aproximadamente 0,1 GB (32,5 M parámetros entrenables en safetensors); el requisito real de VRAM lo determina el modelo base Qwen3.5-4B tras la fusión.
- Para el modelo base de 4B en bfloat16 se estima un consumo de VRAM en el entorno de 8-10 GB, sin que la información proporcionada detalle cifras oficiales; se recomienda consultar la ficha de Qwen3.5-4B.
- GPU recomendadas: no disponibles en la información. Por tamaño, el modelo base de 4B es apto para GPU de consumo con suficiente VRAM (por ejemplo, RTX 4090 de 24 GB) y para A100/H100 en despliegues con mayor concurrencia.
- Cabe en GPU de consumo tras cuantización del modelo base, aunque los tipos de cuantización no se detallan en la información.
- Opciones de despliegue: el adaptador se usa con `transformers` (probado con 5.22), `peft` (0.21) y `torch` (2.14), fusionándolo con el base. Se recomienda `flash-linear-attention` para los kernels de atención lineal. No se documentan integraciones con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Precisión `test_id` | Flip por presión | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Signet-4B | Adaptador LoRA de 32,5 M sobre Qwen3.5-4B | No disponible | 0,989 | 0,002 | Apache-2.0 | Hugging Face |
| Qwen3.5-4B (base) | 4B | No disponible | 0,629 | 0,383 | Apache-2.0 | Hugging Face |
| Signet-2B | Adaptador LoRA sobre Qwen3.5-2B | No disponible | No disponible | No disponible | Apache-2.0 | Hugging Face |
| Signet-9B | Adaptador LoRA sobre Qwen3.5-9B | No disponible | No disponible | No disponible | Apache-2.0 | Hugging Face |

Los adaptadores previos de la familia Conviction (Anchor, Vector, Meridian) se mencionan como aprendices de rechazo de formulaciones falsas, no del canal, pero no se aportan sus cifras en la información disponible. Signet-4B se describe como el miembro intermedio de la familia y el más fuerte en tipos de problema no vistos.

## Limitaciones y advertencias

- Es un adaptador, no un modelo autónomo: requiere descargar Qwen3.5-4B en la revisión `851bf6e806efd8d0a36b00ddf55e13ccb7b8cd0a` y fusionarlo; usar otra revisión puede alterar el comportamiento.
- Solo inglés: no se documenta soporte multilingüe.
- Modo no-thinking exclusivamente y respuesta JSON fija; no es adecuado para generación libre ni para tareas que requieran razonamiento extendido.
- La verificación de canal depende de que el integrador respete el formato de episodio: los registros auténticos deben ir en un mensaje `{"role": "tool"}`, y cualquier texto en un mensaje de usuario se trata como afirmación. Un pipeline que no separe canales correctamente anula la ventaja del modelo.
- Riesgo de alucinación: no se documentan evaluaciones de veracidad fuera de ConvictionBench; la precisión del 98,9 % es específica de esa tarea y no se extrapola a conocimiento general.
- Sesgos: no se documentan análisis de sesgo en la información disponible.
- Restricciones de licencia: Apache-2.0 permite uso comercial tanto del adaptador como del base, pero conviene revisar las condiciones de Qwen3.5-4B.
- Trazabilidad limitada: el informe técnico se anuncia para diciembre de 2026 y no está disponible en la información; las cifras de brecha de canal no se desglosan numéricamente.
- Adopción muy baja en el momento de la ficha (2 descargas, 0 likes), sin validación independiente conocida.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Laplace-AI-Research/Signet-4B
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Dataset ConvictionBench: https://huggingface.co/datasets/Laplace-AI-Research/ConvictionBench
- Signet-2B: https://huggingface.co/Laplace-AI-Research/Signet-2B
- Signet-9B: https://huggingface.co/Laplace-AI-Research/Signet-9B
- Write-up: https://laplaceresearch.org/signet/
- Código y resultados: https://github.com/Laplace-AI-Research/signet
