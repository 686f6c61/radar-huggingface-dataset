# dendriteholdings/Ingot-XXXVIII-27B-Q2

## Resumen

Ingot-XXXVIII-27B-Q2 es un modelo de lenguaje de 27.000 millones de parámetros distribuido en formato GGUF y orientado a generación de texto conversacional. No es un modelo entrenado desde cero: es un refinamiento del modelo ternario Ternary Bonsai 2 27B de Prism ML, cuyos pesos no ternarios han sido reajustados por un minero de la subred Ingot de Bittensor para acercar sus distribuciones de salida a las del profesor Qwen3.8-27B. El resultado se publica como espejo público del modelo ganador de esa ronda de la subred.

La relevancia del modelo está en su estrategia de compresión: mantiene los códigos ternarios del modelo base y se empaqueta en dos ficheros GGUF de 1,75 y 2,125 bits por peso (5,95 GB y 7,21 GB respectivamente), lo que permite ejecutar un modelo de 27B en hardware de gama alta de consumo. Según la model card, supera al punto de partida (Bonsai 2) en las seis pruebas publicadas, con mejoras de hasta 6,2 puntos en uso de herramientas y 5,7 en código, y queda un 32% más cerca del profesor en divergencia KL sobre texto retenido.

El modelo está pensado para inferencia local y despliegues con llama.cpp, no para entrenamiento ni ajuste fino. Requiere el fork de llama.cpp de Dendrite o el de PrismML, ya que llama.cpp estándar no soporta su layout ni la rotación de Hadamard asociada a la familia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con pesos ternarios y atención lineal (familia Ternary Bonsai 2); detalles completos no disponibles |
| Parametros totales | 26.895.998.464 (26,9B) |
| Parametros activos | no disponible (no es MoE según la informacion disponible) |
| Longitud de contexto | no disponible (los benchmarks usan respuestas de hasta 32.768 tokens y prompts de 512 tokens) |
| Tipos de cuantizacion | Ternaria empaquetada: PTQ1_0 a 1,75 bits por peso y PQ2_0 a 2,125 bits por peso (mismos pesos ternarios en contenedor de 2 bits) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF (llama.cpp) |

## Arquitectura y entrenamiento

El modelo parte de Ternary Bonsai 2 27B de Prism ML, una cuantizacion ternaria de un profesor Qwen3.8-27B en BF16. La arquitectura conserva los códigos ternarios del base y una rotacion de Hadamard aplicada a los pesos, junto con atención lineal; el fork de llama.cpp de Dendrite fusiona en Metal la rotacion de Hadamard y la actualizacion de estado de la atención lineal para esta familia. Los pesos no ternarios (escalas fp16 por bloque de 128 pesos y el resto de parametros) fueron reajustados por el minero para reducir la divergencia respecto al profesor.

No se dispone de informacion sobre el volumen de tokens de entrenamiento, la composicion del dataset ni si hubo RLHF o DPO. El proceso descrito es de destilacion/ajuste hacia el profesor Qwen3.8-27B, evaluado mediante divergencia KL entre las distribuciones de siguiente token del modelo y las del profesor en BF16. En la evaluacion de la ronda, el modelo obtuvo KL de 0,07772 frente a 0,07937 del rey al que supero; en texto retenido (236 pasos de Terminal-Bench 2.1 y SWE-bench Multilingual) alcanzo KL de 0,0749 frente a 0,1101 de Bonsai 2, es decir, un 32% mas cerca del profesor.

## Capacidades

- Generacion de texto conversacional multi-turno (pipeline text-generation, tag conversational).
- Razonamiento y resolucion de problemas: BBEH Mini 48,0 y GPQA Diamond 77,8 en la evaluacion publicada.
- Codigo y tareas de terminal: SWE-bench Multilingual 63,7 y Terminal-Bench 2.1 55,1.
- Matematicas: MATH-500 96,8.
- Uso de herramientas y function calling: τ³-bench Banking 35,1, con agentes de hasta 150 pasos en el protocolo de evaluacion.
- Razonamiento multi-paso y comportamiento agentico (los benchmarks de SWE-bench, GPQA y τ³ se ejecutan sin acceso a internet).
- Capacidades multilingues: el benchmark SWE-bench Multilingual sugiere soporte de varios lenguajes de programacion; idiomas naturales soportados no disponibles.
- No se documentan capacidades de vision, audio ni modo thinking explicito.

## Casos de uso

- Asistencia de código en local: el modelo resuelve tareas de reparacion sobre repositorios (SWE-bench Multilingual 63,7) y puede integrarse en flujos de revisión o parcheo con un agente que ejecute comandos, siempre que se le dé acceso a las herramientas adecuadas.
- Automatización de terminal y operaciones: con Terminal-Bench 2.1 en 55,1, es adecuado para agentes que interpretan salidas de shell y proponen comandos en entornos controlados, con validación humana en pasos destructivos.
- Agentes de atención al cliente con uso de herramientas: τ³-bench Banking 35,1 indica capacidad para conversaciones multi-turno con llamadas a funciones (consultas de saldo, gestión de incidencias), aunque el margen frente al profesor (41,2) aconseja supervisión.
- Tutoría y resolución de problemas de matemáticas: MATH-500 en 96,8 permite usarlo como asistente de ejercicios paso a paso en entornos educativos, con verificación de resultados.
- Razonamiento científico asistido: GPQA Diamond 77,8 lo hace útil para preguntas de nivel posgrado en dominios STEM, siempre con revisión de fuentes por el riesgo de alucinación.
- Despliegue en estaciones de trabajo y Mac de gama alta: los 5,95-7,21 GB de pesos permiten ejecutarlo en una RTX PRO 6000 Blackwell (137-145 tok/s de decodificación) o en un Mac Studio M3 Ultra (44,5-56,4 tok/s), lo que habilita asistentes privados sin conexión.
- Prototipado de pipelines de agentes en CI/CD: su formato GGUF y compatibilidad con endpoints permiten levantar un servidor de inferencia ligero para pruebas de integración de agentes antes de pasar a modelos mayores.

## Benchmarks y rendimiento

Resultados en porcentaje, protocolo `t1-minp05-32k-150` (temperatura 1,0, top-p 0,95, min-p 0,05, top-k 20, respuestas de hasta 32.768 tokens, 150 pasos de agente, sin internet en SWE-bench, GPQA y τ³). Una sola ejecución por modelo.

| Benchmark | Dominio | Qwen3.8-27B BF16 | Bonsai 2 | Ingot-XXXVIII-27B-Q2 | vs Bonsai 2 |
|---|---|---|---|---|---|
| SWE-bench Multilingual | código | 71,3 | 58,0 | 63,7 | +5,7 |
| Terminal-Bench 2.1 | terminal | 71,9 | 50,6 | 55,1 | +4,5 |
| GPQA Diamond | ciencia | 85,4 | 77,8 | 77,8 | 0,0 |
| τ³-bench Banking | uso de herramientas | 41,2 | 28,9 | 35,1 | +6,2 |
| MATH-500 | matemáticas | 98,0 | 96,4 | 96,8 | +0,4 |
| BBEH Mini | razonamiento | 59,1 | 46,5 | 48,0 | +1,5 |

Divergencia KL frente al profesor (menor es mejor):

| Conjunto | Este modelo | Bonsai 2 |
|---|---|---|
| Evaluación de la ronda | 0,07772 | 0,07937 (rey superado) |
| Terminal-Bench 2.1 (86 pasos) | 0,1040 | 0,1427 |
| SWE-bench Multilingual (150 pasos) | 0,0583 | 0,0914 |
| Todos los 236 pasos | 0,0749 | 0,1101 |

Rendimiento de decodificación (batch 1, llama-bench, `-ngl 99 -fa 1`):

| Hardware | Fichero | Decodificación (tok/s) | Prompt (tok/s) |
|---|---|---|---|
| RTX PRO 6000 Blackwell 96 GB | PQ2_0 | 137 | 3.865 |
| RTX PRO 6000 Blackwell 96 GB | PTQ1_0 | 145 | 3.865 |
| Mac Studio M3 Ultra, fork PrismML | PQ2_0 | 44,5 | 432 |
| Mac Studio M3 Ultra, fork PrismML | PTQ1_0 | 43,1 | 368 |
| Mac Studio M3 Ultra, fork Dendrite | PQ2_0 | 56,4 | 432 |
| Mac Studio M3 Ultra, fork Dendrite | PTQ1_0 | 52,8 | 368 |

PrismML reporta 142 tok/s para Bonsai 2 PQ2_0 en una RTX 5090; el autor no ha medido otras tarjetas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | SWE-bench Multilingual | Terminal-Bench 2.1 | τ³-bench Banking | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|---|
| Ingot-XXXVIII-27B-Q2 | 26,9B | no disponible | 63,7 | 55,1 | 35,1 | no disponible | GGUF en HF |
| Ternary Bonsai 2 27B (Prism ML) | 27B | no disponible | 58,0 | 50,6 | 28,9 | no disponible | GGUF en HF |
| Qwen3.8-27B BF16 (profesor) | 27B | no disponible | 71,3 | 71,9 | 41,2 | no disponible | no disponible en la informacion |
| Ingot-genesis-27B-Q2 | 27B | no disponible | no disponible | no disponible | no disponible | no disponible | GGUF en HF |

El profesor Qwen3.8-27B en BF16 es la referencia de calidad y supera al modelo en todas las pruebas, pero no es una alternativa práctica en el mismo régimen de memoria. Frente a Bonsai 2, el modelo mejora en las seis pruebas y reduce la KL un 32% en texto retenido.

## Limitaciones y advertencias

- Los benchmarks son de una sola ejecución por modelo; la propia model card advierte que Terminal-Bench 2.1 (89 tareas) y τ³-bench Banking varían unos ±5 puntos entre ejecuciones, por lo que las diferencias pequeñas no son concluyentes.
- Tres de las 89 pruebas de Terminal-Bench terminaron en error y se contaron como fallos.
- Licencia no disponible: no puede asumirse uso comercial sin verificar los términos del modelo base (Ternary Bonsai 2) y del profesor.
- Requiere forks específicos de llama.cpp (Dendrite o PrismML); llama.cpp estándar no lo ejecuta, lo que complica el despliegue en infraestructura existente.
- El modelo es una destilación del profesor Qwen3.8-27B, no un entrenamiento independiente; hereda sus sesgos y sus limitaciones, y puede reproducir errores del profesor.
- Riesgo de alucinación inherente a modelos de este tamaño y a la compresión ternaria; la brecha de 7,6 puntos en SWE-bench y 6,1 en Terminal-Bench frente al profesor BF16 indica pérdida de calidad medible.
- Idiomas naturales soportados no documentados; el soporte multilingüe solo está evidenciado en el benchmark de código.
- Longitud de contexto no especificada; los benchmarks usan respuestas de hasta 32.768 tokens, pero no se confirma la ventana máxima.
- El modelo se publica como espejo de una submission de subred; no hay garantía de mantenimiento, versionado ni soporte por parte de Dendrite Holdings.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/dendriteholdings/Ingot-XXXVIII-27B-Q2
- Modelo base (Ternary Bonsai 2 27B): https://huggingface.co/prism-ml/Ternary-Bonsai-2-27B-gguf
- Modelo genesis de la ronda: https://huggingface.co/dendriteholdings/Ingot-genesis-27B-Q2
- Fork de llama.cpp de Dendrite: https://github.com/DendriteLabs/llama.cpp
- Resultados en vivo de la subred Ingot: https://theingot.ai
- Vista token a token de los pasos evaluados: https://theingot.ai/#tokens
