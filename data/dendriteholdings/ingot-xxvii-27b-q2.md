# dendriteholdings/Ingot-XXVII-27B-Q2

## Resumen

Ingot-XXVII-27B-Q2 es un modelo de lenguaje de 26.895.998.464 parámetros (aproximadamente 27B) distribuido en formato GGUF para llama.cpp, resultado de un proceso de cuantización competitiva en la subred Bittensor Ingot. El modelo parte de Ternary Bonsai 2 27B de Prism ML —una cuantización ternaria del profesor Qwen3.8-27B— y ha sido refinado por un minero (hotkey `5DfVLKYqPAPgtuEzo1ENHosCBDeikBRAKZ6opEvnZqDwVXVF`, uid 18) para acercar sus distribuciones de salida a las del profesor original. La propuesta del modelo es conservar los códigos ternarios (−1/0/+1) del modelo base y reajustar las escalas fp16 por bloque, las normas y las compuertas de estado para reducir la divergencia respecto al profesor.

El modelo se publica como espejo de una submission ganadora en Ingot, una subred donde los validadores puntúan qué copia cuantizada permanece más próxima al modelo profesor fijo. Se ofrece en dos ficheros: `Ingot-XXVII-27B-PTQ1_0.gguf` (1,75 bits por peso, 5,95 GB) y `Ingot-XXVII-27B-PQ2_0.gguf` (2,125 bits por peso, 7,21 GB), ambos conteniendo los mismos pesos ternarios. La relevancia actual reside en que demuestra que es posible mejorar la fidelidad de una cuantización extrema (por debajo de 2 bits por peso) sin alterar los códigos ternarios, manteniendo el modelo desplegable en hardware de consumo y estaciones de trabajo con GPU única.

La arquitectura subyacente es un transformer híbrido con atención lineal y compuertas de espacio de estados (state-space gates), heredada de Ternary Bonsai 2, lo que explica la presencia de mecanismos de atención lineal y actualizaciones de estado que el fork de Dendrite optimiza en Metal. El contexto, los idiomas y la licencia no están declarados en la información disponible.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer híbrido con atención lineal y compuertas de espacio de estados (heredada de Ternary Bonsai 2) |
| Parámetros totales | 26.895.998.464 (≈27B) |
| Parámetros activos | no disponible (no es MoE según la información disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | Ternaria: PTQ1_0 (1,75 bpw) y PQ2_0 (2,125 bpw, mismos pesos ternarios en contenedor de 2 bits) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF (llama.cpp) |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura de Ternary Bonsai 2 27B de Prism ML, que según la model card emplea atención lineal y compuertas de espacio de estados (state-space gates), además de una rotación de Hadamard que el fork de Dendrite fusiona con la actualización de estado en Metal. Los pesos son ternarios: cada peso se representa como un código en {−1, 0, +1} multiplicado por una escala fp16 por bloque de 128 pesos. El proceso de refinamiento del minero conservó el 100% de los códigos ternarios (0 de 26,87B cambiados) y reajustó el 99,8% de las escalas fp16 por bloque (con una mediana del 10,1% y más del 20% en aproximadamente uno de cada cuatro bloques), el 100% de los pesos de normalización (2,6M de 2,6M) y el 95,5% de las compuertas de espacio de estados. No se realizó un entrenamiento desde cero ni un ajuste supervisado convencional: el objetivo era minimizar la divergencia KL respecto a las distribuciones del profesor Qwen3.8-27B en BF16.

El fichero `Ingot-XXVII-27B-PTQ1_0.gguf` es un reempaquetado sin pérdida del fichero del minero en el formato PTQ1_0 de Prism, manteniendo cada bloque de 128 pesos con sus códigos y su escala fp16, de modo que cada peso decodifica al mismo valor. El mismo reempaquetado del fichero PQ2_0 de Bonsai 2 reproduce byte a byte el fichero PTQ1_0 publicado por Prism. La diferencia entre ambos ficheros es de tamaño y velocidad de decodificación: el de 1,75 bpw es más pequeño, mientras que el de 2 bits decodifica más rápido en GPU.

## Capacidades

- Generación de texto conversacional y de tipo base, según la etiqueta `text-generation` y el tag `conversational`.
- Razonamiento matemático: obtiene 97,4% en MATH-500, ligeramente por encima de Bonsai 2 (96,4%) y cerca del profesor BF16 (98,0%).
- Razonamiento general: 47,4% en BBEH Mini, por encima de Bonsai 2 (46,5%) pero por debajo del profesor (59,1%).
- Codificación y tareas de ingeniería de software: 63,7% en SWE-bench Multilingual, una mejora de +5,7 puntos sobre Bonsai 2.
- Uso de terminal y agentes de línea de comandos: 58,4% en Terminal-Bench 2.1, +7,8 puntos sobre Bonsai 2.
- Uso de herramientas (tool calling) en dominios financieros: 27,8% en τ³-bench Banking, ligeramente por debajo de Bonsai 2 (28,9%).
- Conocimiento científico: 74,2% en GPQA Diamond, por debajo de Bonsai 2 (77,8%) y del profesor (85,4%).
- Soporte de agentes multi-paso: los benchmarks se ejecutan con hasta 150 pasos por agente, sin acceso a internet en SWE-bench, GPQA y τ³.
- Compatibilidad con endpoints (`endpoints_compatible`) para despliegue como servicio.
- Capacidades multilingües: no disponibles en la información proporcionada.
- Modo thinking, visión o audio: no disponibles en la información proporcionada.

## Casos de uso

- Asistentes de codificación en terminal: el modelo obtiene 58,4% en Terminal-Bench 2.1 y 63,7% en SWE-bench Multilingual, por lo que puede integrarse en agentes que ejecutan comandos, inspeccionan repositorios y aplican parches multi-paso con hasta 150 pasos de agente.
- Automatización de tareas de ingeniería de software en CI/CD: con soporte de tool calling y un rendimiento cercano al profesor en tareas de código, puede emplearse para triaje de issues, generación de parches y revisión automatizada en pipelines, siempre con supervisión humana dado el riesgo de alucinación.
- Razonamiento matemático asistido: con 97,4% en MATH-500, es adecuado para tutores de matemáticas, verificación de demostraciones y generación de problemas con solución, en entornos donde el coste de cómputo es crítico.
- Despliegue en estaciones de trabajo con GPU única: los ficheros de 5,95 GB y 7,21 GB permiten ejecutar el modelo en GPUs de consumo y profesionales; Prism ML reporta 142 tok/s para el PQ2_0 de Bonsai 2 en una RTX 5090, y Dendrite reporta 137 tok/s en una RTX PRO 6000 Blackwell.
- Inferencia en Mac Studio con Metal: el fork de Dendrite alcanza 56,4 tok/s de decodificación con el fichero PQ2_0 en un M3 Ultra (80 núcleos GPU, 512 GB), lo que habilita asistentes locales en hardware Apple de gama alta.
- Investigación sobre cuantización extrema: el modelo sirve como referencia para estudiar cómo el reajuste de escalas, normas y compuertas de estado afecta a la divergencia KL respecto al profesor, con métricas publicadas de KL por paso en Terminal-Bench 2.1 y SWE-bench Multilingual.
- Servicio de chat conversacional de bajo coste: gracias a su tamaño reducido y a la compatibilidad con endpoints, puede desplegarse como backend de conversación multi-turno en entornos con restricciones de VRAM, aceptando la pérdida de calidad en conocimiento científico y uso de herramientas frente al profesor.

## Benchmarks y rendimiento

Resultados en porcentaje, con protocolo `t1-minp05-32k-150` (temperatura 1.0, top-p 0.95, min-p 0.05, top-k 20, respuestas de hasta 32.768 tokens, 150 pasos de agente, sin internet en SWE-bench, GPQA y τ³). Una ejecución por modelo.

| Benchmark | Dominio | Qwen3.8-27B BF16 | Bonsai 2 | Ingot-XXVII-27B-Q2 | vs Bonsai 2 |
|---|---|---|---|---|---|
| SWE-bench Multilingual | código | 71,3 | 58,0 | 63,7 | +5,7 |
| Terminal-Bench 2.1 | terminal | 71,9 | 50,6 | 58,4 | +7,8 |
| GPQA Diamond | ciencia | 85,4 | 77,8 | 74,2 | −3,6 |
| τ³-bench Banking | uso de herramientas | 41,2 | 28,9 | 27,8 | −1,1 |
| MATH-500 | matemáticas | 98,0 | 96,4 | 97,4 | +1,0 |
| BBEH Mini | razonamiento | 59,1 | 46,5 | 47,4 | +0,9 |

Divergencia respecto al profesor (KL menor es mejor):

| Evaluación | KL Ingot-XXVII-27B-Q2 | KL Bonsai 2 |
|---|---|---|
| Evaluación ganadora | 0,07881 | 0,08125 |
| Terminal-Bench 2.1 (86 pasos) | 0,1190 | 0,1427 |
| SWE-bench Multilingual (150 pasos) | 0,0621 | 0,0914 |
| Todos los 236 pasos | 0,0828 | 0,1101 |

El modelo es un 24,8% más cercano al profesor que Bonsai 2 en los 236 pasos retenidos, con una diferencia pareada de aproximadamente 21 veces su error estándar. En Terminal-Bench 2.1 el KL de Bonsai 2 es un 20% superior y en SWE-bench Multilingual un 47% superior. Advertencia del autor: son ejecuciones únicas; Terminal-Bench 2.1 tiene 89 tareas, por lo que una ejecución varía aproximadamente ±5 puntos, y τ³-bench Banking de forma similar. En MATH-500 dos de los 500 prompts alcanzaron el límite de 32.768 tokens y se contaron como incorrectos.

## Requisitos de hardware

- VRAM estimada para inferencia: el fichero PTQ1_0 ocupa 5,95 GB y el PQ2_0 ocupa 7,21 GB; con overhead de contexto y estados de atención lineal, se recomienda al menos 8-12 GB de VRAM para el PTQ1_0 y 10-14 GB para el PQ2_0, aunque la información disponible no detalla el consumo exacto por contexto.
- GPU recomendadas: NVIDIA RTX PRO 6000 Blackwell (96 GB, edición servidor) reportada con 137 tok/s (PQ2_0) y 145 tok/s (PTQ1_0) en decodificación, y 3.865 tok/s en prompt; RTX 5090 reportada por Prism ML con 142 tok/s para el PQ2_0 de Bonsai 2.
- Cabe en GPU de consumo: sí, por tamaño de fichero; la RTX 5090 está confirmada por Prism ML para el modelo base equivalente, y otras tarjetas no han sido medidas por el autor.
- Opciones de despliegue: llama.cpp (librería declarada), con soporte de `llama-bench`; el fork de Dendrite de llama.cpp incluye un parche Metal que fusiona la rotación de Hadamard y la actualización de estado de atención lineal. Compatible con endpoints según el tag `endpoints_compatible`.
- Latencia y throughput: en Mac Studio M3 Ultra (80 núcleos GPU, 512 GB), con el fork stock de PrismML, 44,5 tok/s (PQ2_0) y 43,1 tok/s (PTQ1_0) en decodificación, y 432/368 tok/s en prompt; con el fork de Dendrite y parche Metal, 56,4 tok/s (PQ2_0) en decodificación y 432 tok/s en prompt. El dato de decodificación del PTQ1_0 con el fork de Dendrite está truncado en la información disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | SWE-bench Multilingual | Terminal-Bench 2.1 | MATH-500 | Licencia | Formato |
|---|---|---|---|---|---|---|---|
| Ingot-XXVII-27B-Q2 | 26,9B | no disponible | 63,7 | 58,4 | 97,4 | no disponible | GGUF ternario (1,75/2,125 bpw) |
| Ternary Bonsai 2 27B (Prism ML) | 26,9B | no disponible | 58,0 | 50,6 | 96,4 | no disponible | GGUF ternario |
| Qwen3.8-27B BF16 (profesor) | ≈27B | no disponible | 71,3 | 71,9 | 98,0 | no disponible | BF16 |

El modelo se sitúa entre Bonsai 2 y el profesor BF16: mejora a Bonsai 2 en código, terminal, matemáticas y razonamiento, pero empeora en conocimiento científico y uso de herramientas. Frente al profesor BF16, pierde entre 4 y 13 puntos en los benchmarks publicados, a cambio de un tamaño de fichero de 6-7 GB frente a los aproximadamente 54 GB de un BF16 de 27B.

## Limitaciones y advertencias

- Licencia no declarada: no se especifica licencia en la información disponible, por lo que el uso comercial requiere verificación previa con el autor y con la licencia del modelo base (Ternary Bonsai 2 de Prism ML) y del profesor (Qwen3.8-27B).
- Idiomas no declarados: no hay información sobre cobertura multilingüe; el rendimiento fuera del inglés es desconocido.
- Contexto no declarado: la longitud máxima de contexto no está publicada, aunque los benchmarks usan respuestas de hasta 32.768 tokens y prompts de 512 tokens en las pruebas de velocidad.
- Riesgo de alucinación: es una cuantización ternaria con divergencia KL de 0,0828 respecto al profesor en pasos retenidos; el conocimiento científico cae 3,6 puntos en GPQA Diamond frente a Bonsai 2 y 11,2 puntos frente al profesor BF16.
- Degradación en uso de herramientas: τ³-bench Banking baja a 27,8%, por debajo de Bonsai 2 (28,9%) y muy lejos del profesor (41,2%), lo que desaconseja su uso en agentes financieros sin validación adicional.
- Benchmarks de una sola ejecución: el autor advierte que Terminal-Bench 2.1 (±5 puntos con 89 tareas) y τ³-bench Banking tienen alta varianza; no deben interpretarse como diferencias finas.
- Dos prompts de MATH-500 agotaron el límite de 32.768 tokens y se contaron como incorrectos, lo que puede infravalorar ligeramente la puntuación real.
- Procedencia competitiva: el modelo es una submission de un minero en Bittensor, reempaquetada como espejo público; no ha pasado por un proceso de revisión editorial ni de seguridad documentado.
- Rendimiento en hardware no medido: solo se han publicado cifras para RTX PRO 6000 Blackwell y Mac Studio M3 Ultra; el rendimiento en otras GPU es desconocido, salvo la referencia de Prism ML para Bonsai 2 en RTX 5090.
- Repositorio con pocos likes (1) y sin documentación adicional sobre sesgos, datos de entrenamiento o evaluación de seguridad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/dendriteholdings/Ingot-XXVII-27B-Q2
- Modelo base (Ternary Bonsai 2 27B, Prism ML): https://huggingface.co/prism-ml/Ternary-Bonsai-2-27B-gguf
- Modelo génesis de la ronda (Ingot): https://huggingface.co/dendriteholdings/Ingot-genesis-27B-Q2
- Resultados en vivo de todos los reyes de Ingot: https://theingot.ai
- Vista token a token de los pasos evaluados: https://theingot.ai/#tokens
- Fork de llama.cpp de Dendrite (parche Metal): https://github.com/DendriteLabs/llama.cpp
