# JackDH/microduck-crown-roll

## Resumen

Crown Roll es una política de control entrenada por JackDH para el robot cuadrúpedo (o más bien, con ruedas) Microduck. El modelo resuelve una tarea muy concreta de locomoción: ejecutar una voltereta hacia delante (forward roll) entrando patinando, pasar por encima de la cabeza y aterrizar de nuevo sobre las ruedas. La secuencia completa dura 3,48 segundos y se ejecuta sobre el rig de patinaje en el evento "Got a Talent".

Se trata de un modelo de reinforcement learning exportado a ONNX, no de un modelo de lenguaje. La política combina una secuencia de motores predefinida (timeline) con un lazo de realimentación que ajusta los motores durante la voltereta en función de la inclinación, la velocidad angular y las posiciones articulares. El autor entrenó 12 ganancias de realimentación mediante búsqueda de entropía cruzada (cross-entropy search) sobre recompensa por episodio, partiendo de una secuencia motora extraída de su mejor ejecución manual.

Es relevante como ejemplo de pipeline completo de robótica en miniatura: simulación en Microduck Arena, entrenamiento, exportación a ONNX y validación en el simulador con métricas de éxito publicadas (62 de 64 arranques simulados aterrizaron correctamente). El repositorio es de tamaño 0.0 GB y no tiene descargas ni likes en el momento de la consulta.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Política de control con secuencia motora fija (timeline) más lazo de realimentación de 12 ganancias; exportada a ONNX |
| Parametros totales | no disponible (no se especifica el número de parámetros de la política) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (no es un modelo de lenguaje) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplica |
| Licencia | no disponible en los metadatos; el repositorio incluye un archivo `training/POLLEN-LICENSE.txt` |
| Formato de pesos | ONNX (exportado con ONNX 1.23.0 y ONNX Runtime 1.24.4); checkpoint intermedio en JSON |

## Arquitectura y entrenamiento

La política no es un transformer ni un modelo generativo: es un controlador híbrido compuesto por una secuencia de referencia de motores (timeline) que marca el ritmo de la voltereta y un lazo de realimentación que lee el tilt, la velocidad angular y las posiciones articulares para corregir los motores durante la maniobra. El autor fijó la secuencia motora de su mejor ejecución manual y entrenó 12 ganancias de realimentación mediante cross-entropy search, optimizando la recompensa por episodio sobre 128 arranques simulados.

El entrenamiento se realizó en Microduck Arena 0.7.0 con Python 3.12. Para el tramo de aproximación y la huida tras el aterrizaje se reutilizó el checkpoint 500 de Roller Sprint. El autor documenta un detalle metodológico importante: recompensar únicamente la velocidad hacia delante hacía que el pato se arrastrara sobre la espalda, por lo que empezó a comprobar qué partes del cuerpo tocaban el suelo tras pasar por encima de la cabeza. Los scripts de entrenamiento descargan la política sprint fijada y verifican su checksum.

## Capacidades

- Ejecución de una voltereta hacia delante completa (3,48 s) entrando patinando, pasando por encima de la cabeza y aterrizando sobre las ruedas.
- Control reactivo durante la maniobra: ajusta los motores en función de tilt, velocidad angular y posiciones articulares.
- Sincronización temporal mediante timeline de motores.
- Aproximación y huida a unos 0,50 m/s reutilizando la política Roller Sprint.
- Aterrizaje simultáneo de ambos patines (45 ms después de que la cabeza deje el suelo, según la ejecución filmada).
- Reproducción de los 174 fotogramas de la ejecución filmada en el simulador local del autor.
- Exportación a ONNX para despliegue con ONNX Runtime.
- No soporta tool calling, agentes, multilingüismo ni visión: es una política motora específica.

## Casos de uso

- Investigación en locomoción con ruedas: servir de referencia reproducible para estudiar cómo combinar secuencias motoras fijas con lazos de realimentación de baja dimensión en robots con ruedas.
- Benchmark de simulación a realidad: el modelo incluye métricas de éxito en simulación (62/64 arranques) y permite comparar la brecha sim-to-real al transferirlo al hardware físico.
- Educación en reinforcement learning aplicado a robótica: el pipeline completo (entrenamiento, exportación ONNX, validación) está documentado y es ejecutable con `python training/train.py` y `python training/export.py`.
- Demostraciones de espectáculo robótico: el modelo está diseñado para el evento "Got a Talent" sobre el rig de patinaje, por lo que encaja en exhibiciones y competiciones de maniobras.
- Estudio de robustez ante condiciones iniciales: los 64 arranques simulados permiten analizar la sensibilidad del aterrizaje a variaciones en el estado inicial.
- Base para entrenar maniobras derivadas: la metodología de fijar una secuencia motora y optimizar ganancias de realimentación por cross-entropy search es reutilizable para otras acrobacias del mismo robot.
- Validación de exportación ONNX en robótica: útil para probar el flujo ONNX 1.23.0 / ONNX Runtime 1.24.4 en un caso real de control.

## Benchmarks y rendimiento

| Metrica | Resultado |
|---|---|
| Éxito en aterrizaje sobre patines (64 arranques simulados) | 62/64 |
| Misma secuencia motora sin realimentación (64 arranques) | 58/64 |
| Reproducción de la ejecución filmada | 174/174 fotogramas en Arena local |
| Duración de la maniobra | 3,48 s |
| Velocidad de huida tras el aterrizaje | ~0,50 m/s |
| Desfase entre salida de cabeza y contacto de patines | 45 ms |

No se han publicado resultados de benchmarks estandarizados (MMLU, HumanEval, GSM8K, etc.) en la información disponible, ya que no se trata de un modelo de lenguaje.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el tamaño del repositorio es 0.0 GB y la política es de baja dimensión (12 ganancias de realimentación más timeline), por lo que la huella de memoria es mínima.
- GPU recomendadas: no se especifican; al ser una política ONNX de control, puede ejecutarse en CPU con ONNX Runtime 1.24.4.
- ¿Cabe en GPU de consumo? Sí, con total probabilidad, dado el tamaño reducido del modelo; no se documentan requisitos específicos.
- Opciones de despliegue: ONNX Runtime (versión probada 1.24.4) y el entorno Microduck Arena 0.7.0 para simulación.
- Latencia y throughput: no disponibles; la política opera a la frecuencia de control del rig, no documentada.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Crown Roll (JackDH) | Política RL para Microduck, ONNX | no disponible | no aplica | 62/64 aterrizajes en simulación | no disponible (incluye POLLEN-LICENSE.txt) | Hugging Face, 0 descargas |
| Roller Sprint checkpoint 500 (JackDH) | Política RL para Microduck | no disponible | no aplica | no disponible | no disponible | Hugging Face, referenciado por Crown Roll |
| Otros modelos de robótica comparables | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de información sobre modelos alternativos de la misma categoría para establecer una comparación cuantitativa.

## Limitaciones y advertencias

- Modelo altamente específico: solo ejecuta la maniobra Crown Roll sobre el rig de patinaje; no es un modelo generalista ni transferible directamente a otras tareas.
- Validación limitada a simulación: los resultados de 62/64 y 174/174 fotogramas proceden del simulador Arena del autor; no se documentan pruebas en hardware físico.
- Dependencia de la política Roller Sprint: la aproximación y la huida dependen de un checkpoint externo (Roller Sprint 500) que debe descargarse y verificarse por checksum.
- Licencia no clara: los metadatos no indican licencia y el repositorio incluye un archivo `POLLEN-LICENSE.txt` cuyo contenido no se detalla; conviene revisarlo antes de cualquier uso comercial.
- Sin datos de sesgos ni alucinación: al no ser un modelo de lenguaje, no aplican sesgos lingüísticos, pero sí posibles fallos de control ante condiciones iniciales no cubiertas por los 64 arranques de validación.
- Robustez no cuantificada fuera de simulación: no se documenta el comportamiento ante perturbaciones, fricción variable o terreno distinto del rig.
- Sin métricas de latencia ni frecuencia de control: dificulta evaluar su viabilidad en tiempo real sobre hardware embebido.
- Repositorio sin tracción: 0 descargas y 0 likes, sin comunidad que haya validado los resultados de forma independiente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/JackDH/microduck-crown-roll
- Checkpoint Roller Sprint 500: https://huggingface.co/JackDH/microduck-roller-sprint-20261110-best/tree/43e9b57825fbfe08cf4b510368b643ff9ae47d93
- Vídeo de la ejecución: ./crown-roll.mp4 (relativo al repositorio)
- Resultados individuales: ./assessment.json (relativo al repositorio)
- Código de entrenamiento: ./training/train.py (relativo al repositorio)
- Checkpoint seleccionado: ./checkpoint.json (relativo al repositorio)
- Licencia Pollen: ./training/POLLEN-LICENSE.txt (relativo al repositorio)
