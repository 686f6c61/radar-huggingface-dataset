# medhansh2808/g1-plate-bc-expert

## Resumen

`g1-plate-bc-expert` es una política de imitación (behaviour cloning) para robótica manipulativa, publicada por el usuario medhansh2808 en Hugging Face bajo licencia Apache 2.0. Concretamente, resuelve la tarea de transferencia de un plato con el robot humanoide Unitree G1 dentro del entorno de simulación BiGym. No es un modelo de lenguaje: es un checkpoint de control motor entrenado para mapear observaciones (RGB y propiocepción) a comandos de acción.

La arquitectura es un `ChunkPolicy` (definido en el `model.py` del repositorio), que predice bloques de acciones en lugar de acciones individuales, un patrón habitual en políticas de imitación para reducir el error acumulado. Se entrenó durante 60.000 pasos con una combinación de 60 demostraciones humanas y 298 episodios generados por un experto scriptado con acceso a poses privilegiadas del simulador (solo durante la generación de datos; la política evaluada únicamente ve RGB y propiocepción).

El resultado declarado es de 22 aciertos sobre 30 ensayos (73%, IC 95% aproximado del 55-86%) en un protocolo balanceado de 30 pruebas. El propio autor indica que no alcanza el objetivo del 90% y que las 8 fallas son timeouts, no caídas. El repositorio ocupa 0,1 GB y no registra descargas ni likes en el momento de la consulta.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | `ChunkPolicy` (política de imitación con predicción de chunks de acciones) |
| Parámetros totales | no disponible |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no aplica; política de control, no modelo de lenguaje) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible (no aplica; salida de acciones motoras) |
| Licencia | Apache 2.0 |
| Formato de pesos | no disponible en la información proporcionada |
| Entorno de evaluación | BiGym (simulador) |
| Robot objetivo | Unitree G1 (humanoide) |
| Tarea | Transferencia de plato (plate-transfer) |
| Pasos de entrenamiento | 60.000 |
| Datos de entrenamiento | 60 demos humanas + 298 episodios de experto scriptado privilegiado |
| Tamaño del repo | 0,1 GB |

## Arquitectura y entrenamiento

La política sigue el mismo diseño que la línea base entrenada solo con datos humanos: un `ChunkPolicy` que emite secuencias de acciones (action chunks) en lugar de comandos paso a paso. Este esquema es habitual en imitación robótica porque amortigua la acumulación de error en tareas de manipulación de horizonte medio. La entrada en evaluación es únicamente RGB y propiocepción del robot; no hay acceso a estado privilegiado del simulador en tiempo de inferencia.

El entrenamiento combina dos fuentes de datos: 60 demostraciones humanas y 298 episodios exitosos generados por un experto scriptado que lee poses verdaderas del simulador. Ese experto privilegiado se usa solo para aumentar el dataset; la política resultante no lo consulta. El entrenamiento se ejecutó durante 60.000 pasos. No se especifican en la información disponible detalles sobre aumentación de datos, función de pérdida exacta, tamaño del chunk de acciones ni hiperparámetros de optimización.

## Capacidades

- Control motor para manipulación de objetos en simulación: ejecuta la tarea de transferencia de plato con el humanoide Unitree G1 en BiGym.
- Política visomotora: consume imágenes RGB y propiocepción como entrada.
- Predicción de chunks de acciones, lo que reduce la frecuencia efectiva de decisión y el error acumulado.
- Entrenamiento por imitación con datos mixtos (humano + experto scriptado).
- No soporta tool calling, function calling, razonamiento multi-paso simbólico ni capacidades multilingües: es una política de control, no un modelo generativo de texto.
- No dispone de modo thinking, visión general, audio ni otras capacidades de modelos fundacionales.

## Casos de uso

- Investigación en imitación robótica: sirve como referencia reproducible para comparar políticas entrenadas solo con demos humanas frente a políticas aumentadas con datos de experto privilegiado, usando el mismo protocolo de 30 ensayos.
- Benchmarking en BiGym: útil como baseline de la tarea plate-transfer para medir mejoras de nuevas arquitecturas o estrategias de aumentación de datos.
- Estudio de sim-to-real en humanoides: aunque no hay evidencia de transferencia real en la información disponible, la política puede emplearse como punto de partida para experimentos de destilación o fine-tuning sobre el Unitree G1.
- Análisis de modos de fallo: dado que las 8 fallas reportadas son timeouts y no caídas, el checkpoint es útil para investigar planificación temporal y terminación de la tarea en políticas de chunking.
- Educación y divulgación: ejemplo compacto (0,1 GB) de pipeline completo de behaviour cloning con datos humanos y sintéticos para cursos de aprendizaje por refuerzo e imitación.
- Generación de datos sintéticos para otras políticas: los rollouts de esta política pueden servir como datos adicionales en entrenamientos posteriores, siempre que se filtren los episodios exitosos.

## Benchmarks y rendimiento

| Protocolo | Resultado | Notas |
|---|---|---|
| 30 ensayos balanceados (seeds 7.310.000+, 5 por slot de origen) | 22/30 (73%) | IC 95% aproximado: 55-86% |
| Fallas | 8, todas timeouts | Ninguna caída |
| Objetivo declarado | 90% | No alcanzado |

No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K u otros) en la información disponible; no aplican a este tipo de modelo.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada. El tamaño del repositorio (0,1 GB) sugiere un checkpoint pequeño, pero no se especifica el número de parámetros ni el formato de pesos.
- GPU recomendadas: no disponible. Para políticas visomotoras de este tamaño, una GPU consumer moderna (RTX 3060 o superior) suele ser suficiente, pero es una estimación genérica, no un dato del autor.
- Compatibilidad con GPU consumer: probable por el tamaño del repo, pero no confirmada en la documentación.
- Opciones de despliegue: no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI; estos frameworks no aplican a políticas de control. El despliegue requeriría el código de `model.py` y el entorno BiGym.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Tarea | Datos de entrenamiento | Rendimiento | Licencia |
|---|---|---|---|---|---|
| g1-plate-bc-expert | `ChunkPolicy` (BC) | Plate-transfer en BiGym (Unitree G1) | 60 demos humanas + 298 episodios de experto privilegiado | 22/30 (73%) | Apache 2.0 |
| Baseline humano (mismo autor, `model.py`) | `ChunkPolicy` (BC) | Plate-transfer en BiGym | 60 demos humanas | no disponible en esta ficha | no disponible |
| Otras políticas de BiGym | no disponible | no disponible | no disponible | no disponible | no disponible |

La información disponible solo permite comparar con la línea base humano del mismo autor, cuyos resultados numéricos no se detallan en la model card citada.

## Limitaciones y advertencias

- Rendimiento por debajo del objetivo: 73% frente al 90% declarado; el autor lo reconoce explícitamente.
- Fallas por timeout: los 8 fallos son agotamiento de tiempo, lo que sugiere problemas de planificación temporal o de terminación de la tarea, no de estabilidad física.
- Intervalo de confianza amplio (55-86%) con solo 30 ensayos: la estimación tiene alta incertidumbre estadística.
- Entrenado y evaluado únicamente en simulación (BiGym); no hay evidencia de transferencia al robot físico Unitree G1.
- Dependencia del entorno: requiere BiGym y el robot Unitree G1 simulados; no es portable a otros dominios sin reentrenamiento.
- Datos de experto privilegiado: aunque no se usan en inferencia, pueden introducir un sesgo de distribución respecto a políticas entrenadas solo con humanos.
- Sin información sobre sesgos, robustez a cambios de iluminación, oclusión o variaciones de la escena.
- Licencia Apache 2.0 permite uso comercial, pero la ausencia de validación en producción y el rendimiento limitado desaconsejan su uso directo en aplicaciones reales.
- Repositorio sin descargas ni likes: no hay evidencia de validación por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/medhansh2808/g1-plate-bc-expert
- No se han encontrado en la información proporcionada enlaces adicionales a papers, blogs, repositorios o demos.
