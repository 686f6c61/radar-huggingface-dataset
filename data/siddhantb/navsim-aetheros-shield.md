# SiddhantB/navsim-aetheros-shield

## Resumen

AetherOS Neuromorphic Tri-Shield es un paquete de envío para el reto NAVSIM de conducción end-to-end, publicado en Hugging Face por SiddhantB (DISSID LABS INC., identificado como Sid Badola) bajo el identificador `SiddhantB/navsim-aetheros-shield`. No se trata de un modelo de lenguaje generativo, sino de un artefacto orientado a la planificación de trayectorias en conducción autónoma, evaluado sobre el conjunto de datos NAVSIM v2. El autor declara una puntuación PDMS de 96,29 y un EPDMS de 85,70 en Navhard, además de métricas de sistema en tiempo real (reducción de MSE de seguimiento del 29,55 % y jitter de cola P99.9 de 3,224 µs).

El repositorio tiene un tamaño de 0,0 GB, no declara pipeline ni idiomas, y las métricas del model-index aparecen marcadas como no verificadas (`verified: false`), por lo que deben tratarse como cifras autoinformadas por el autor. La relevancia del artefacto reside en su propuesta de integrar un microkernel en tiempo real con planificación end-to-end para conducción, un enfoque poco habitual frente a los planificadores puramente neuronales que dominan NAVSIM.

La información pública disponible es muy escasa: no se detallan arquitectura, número de parámetros, datos de entrenamiento ni formato de pesos. Esta ficha refleja exclusivamente lo declarado en la model card y en los metadatos del repositorio, marcando como "no disponible" todo aquello que no se especifica.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (la model card menciona un microkernel y un componente denominado "Neuromorphic Tri-Shield", sin detalles tecnicos) |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (se menciona un "standard TinyPhysics ONNX" como referencia comparativa, no como formato propio) |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | no disponible (el repositorio tiene 0,0 GB y no se listan ficheros de pesos) |

## Arquitectura y entrenamiento

No se ha publicado información sobre la arquitectura interna del modelo en la documentación disponible. La model card hace referencia a un "microkernel" y a un esquema "Neuromorphic Tri-Shield", así como a una comparación con "standard TinyPhysics ONNX", lo que sugiere un componente de planificación ligero ejecutado sobre una infraestructura de tiempo real, pero no se especifica si se trata de una red transformer, una CNN, un modelo híbrido o un sistema basado en reglas combinado con aprendizaje.

Tampoco se detallan los datos de entrenamiento: no se indica el número de tokens o frames, la composición del dataset (más allá del uso de `autonomousvision/navsim`), ni si hubo etapas de ajuste fino, RLHF o DPO. Las únicas cifras técnicas declaradas son de sistema: una reducción del 29,55 % en el error cuadrático medio de seguimiento frente a TinyPhysics ONNX estándar y un jitter de cola P99.9 de 3,224 µs sin incumplimientos de plazo.

## Capacidades

- Planificación end-to-end de trayectorias para conducción autónoma sobre el benchmark NAVSIM v2.
- Evaluación declarada en el conjunto `navtest / private_test_hard` de NAVSIM v2.
- Ejecución en tiempo real con garantías de plazo: el autor declara cero incumplimientos de deadline y un jitter de cola P99.9 de 3,224 µs.
- Seguimiento de trayectoria con reducción de MSE del 29,55 % frente a TinyPhysics ONNX estándar, según el autor.
- No se documentan capacidades de generación de texto, código, matemáticas, visión general, tool calling, agentes ni multilingüismo; el artefacto está especializado en conducción.

## Casos de uso

- Investigación en conducción end-to-end: servir como punto de comparación reproducible en el leaderboard NAVSIM para planificadores de trayectoria, dado que el paquete está etiquetado con el dataset `autonomousvision/navsim`.
- Evaluación de planificadores en tiempo real: el interés declarado en jitter y deadlines permite estudiar el comportamiento del planificador bajo restricciones temporales estrictas en un vehículo o en un simulador.
- Benchmarking de seguimiento de trayectoria: la comparación declarada frente a TinyPhysics ONNX permite usar el artefacto como referencia en experimentos de reducción de error de seguimiento.
- Reproducción de resultados de competición: el paquete está pensado como envío oficial al reto AGC2025 de conducción end-to-end, por lo que sirve para replicar o auditar la submission.
- Integración en pipelines de simulación: al estar liberado con licencia MIT, puede incorporarse en entornos de simulación de conducción para pruebas de planificación.
- Estudio de arquitecturas con microkernel para sistemas embebidos: el enfoque declarado de microkernel en tiempo real es útil para investigar separación entre planificación neuronal y gestión de recursos en sistemas críticos.

## Benchmarks y rendimiento

Datos autoinformados por el autor en el model-index (no verificados):

| Benchmark | Metrica | Valor | Verificado |
|---|---|---|---|
| NAVSIM v2 (navtest / private_test_hard) | PDMS | 96,29 | No |
| NAVSIM v2, Navhard | EPDMS | 85,70 | No |
| Comparativa con TinyPhysics ONNX estándar | Reduccion de MSE de seguimiento | 29,55 % | No |
| Sistema en tiempo real | Jitter de cola P99.9 | 3,224 µs (cero incumplimientos de deadline) | No |

No se han publicado en la información disponible resultados de benchmarks de lenguaje (MMLU, HumanEval, GSM8K) ni comparaciones con otros planificadores NAVSIM distintas de la referencia a TinyPhysics ONNX.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el repositorio no contiene pesos (0,0 GB) y no se especifica el tamaño del modelo.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: no disponible; la model card menciona un microkernel y una comparación con TinyPhysics ONNX, pero no documenta runners, motores de inferencia ni formatos de exportación propios.
- Latencia y throughput: el autor declara un jitter de cola P99.9 de 3,224 µs y cero incumplimientos de deadline, sin especificar la plataforma de medida ni el throughput.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | PDMS declarado | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| AetherOS Neuromorphic Tri-Shield (este) | no disponible | no disponible | 96,29 (no verificado) | MIT | Repositorio HF sin pesos (0,0 GB) |
| TinyPhysics ONNX (referencia citada por el autor) | no disponible | no disponible | no disponible | no disponible | Citado como baseline de seguimiento |
| Otros planificadores NAVSIM | no disponible | no disponible | no disponible | no disponible | No se aportan comparaciones en la informacion disponible |

No se dispone de datos suficientes para una comparativa rigurosa con alternativas de la misma categoría.

## Limitaciones y advertencias

- Métricas no verificadas: PDMS y EPDMS aparecen con `verified: false` en el model-index; deben considerarse cifras autoinformadas.
- Ausencia de pesos: el repositorio ocupa 0,0 GB y no se listan ficheros de modelo, por lo que no es posible reproducir la inferencia a partir de este artefacto.
- Falta de documentación técnica: no se especifican arquitectura, parámetros, datos de entrenamiento ni proceso de evaluación, lo que impide auditar el método.
- Ámbito restringido: el artefacto está orientado exclusivamente a planificación de trayectorias en NAVSIM; no es un modelo de propósito general ni un modelo de lenguaje.
- Riesgo de sobreajuste al benchmark: al tratarse de una submission de competición sobre `private_test_hard`, los resultados pueden no generalizar a condiciones reales de conducción.
- Licencia MIT: permite uso comercial y modificación, pero el autor no ofrece garantías sobre el comportamiento del sistema en producción; para conducción real serían necesarias validaciones de seguridad independientes.
- Sin información sobre sesgos, alucinación o comportamiento en dominios fuera de NAVSIM.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/SiddhantB/navsim-aetheros-shield
- Código fuente declarado: https://github.com/sidhunt/dissid-home
- Leaderboard NAVSIM End-to-End Driving Challenge (AGC2025): https://huggingface.co/spaces/AGC2025/e2e-driving-2025
- Dataset NAVSIM: https://huggingface.co/datasets/autonomousvision/navsim
