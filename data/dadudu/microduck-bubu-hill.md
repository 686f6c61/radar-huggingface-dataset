# dadudu/microduck-bubu-hill

## Resumen

`dadudu/microduck-bubu-hill` (también denominado bubu-hill-robust en la model card) no es un modelo de lenguaje, sino una política de control para robot cuadrúpedo entrenada con aprendizaje por refuerzo y exportada a ONNX. La publica el usuario dadudu dentro del ecosistema del robot microduck de Pollen Robotics, y está pensada para cargarse en una ranura de política del daemon `robotctl`, donde se ejecuta en bucle a 50 Hz hasta que se le indique lo contrario. La observación es un vector de 61 dimensiones y el espacio de acción tiene 14 dimensiones.

El problema que resuelve es la locomoción robusta: la model card indica que parte de su propio checkpoint PPO «dive1» (paso 75, 1,224 s en la métrica oficial) y que después aplicó estrategias evolutivas sobre los pesos frente a 10 y luego 20 semillas no oficiales (6-25), seleccionando la generación en semillas reservadas. El resultado declarado es 0,932 s en la evaluación oficial y 38 de 40 semillas nuevas (56-95) completadas con una media de 0,973 s.

Su relevancia es acotada pero concreta: es un artefacto pequeño, aislado del resto de participantes («no other entry's weights») y explícitamente limitado a simulación. No hay información sobre arquitectura de red, número de parámetros, licencia ni idiomas.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Política neuronal de control entrenada con RL (PPO) y refinada con estrategias evolutivas, exportada a ONNX; detalle de capas no disponible |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es un modelo Mixture of Experts) |
| Longitud de contexto | no aplica; la entrada es una observación de 61 dimensiones por paso, sin ventana de contexto textual |
| Tipos de cuantización | no disponible; se distribuye un `policy.onnx` en el formato exportado por el autor |
| Idiomas soportados | no aplica (no procesa lenguaje natural) |
| Licencia | no disponible (no declarada en la model card ni en los metadatos de HuggingFace) |
| Formato de pesos | ONNX (`policy.onnx`) + `manifest.json` conforme al esquema 2 del manifiesto de políticas de microduck |
| Espacio de observación | 61 dimensiones, con normalizador integrado en el propio ONNX (se alimentan observaciones en crudo) |
| Espacio de acción | 14 dimensiones |
| Frecuencia de control | 50 Hz |
| Tipo de política | perpetua: ejecuta la marcha de forma continua hasta recibir una orden distinta |
| Librería / pipeline | `microduck` / `robotics` |
| Tamaño del repositorio | 0,0 GB según HuggingFace (artefacto de pocos MB) |
| Descargas / likes | 23 / 0 |
| Fecha de creación / actualización | 2026-10-15 / 2026-10-20 |

## Arquitectura y entrenamiento

La información disponible no detalla la topología de la red (número de capas, anchura, tipo de activaciones ni si hay recurrencia). Lo que sí se documenta es el procedimiento: se parte de un checkpoint propio de PPO («dive1», paso 75, con 1,224 s en la métrica oficial) entrenado en el repositorio `pollen-robotics/microduck_rl`, rama `claude/hugging-face-model-versions-s42dvp`, commit `08c85aeb6`. Sobre esos pesos se aplican estrategias evolutivas en dos fases, primero contra 10 semillas no oficiales y después contra 20 (rango 6-25), penalizando con el límite de tiempo cualquier caída. La generación final se elige sobre semillas reservadas, no usadas en la optimización.

No se indica el número de tokens ni de episodios de entrenamiento, la composición del dataset de simulación, ni si hubo etapas de RLHF/DPO (no aplicables en este dominio). Tampoco se especifica qué simulador se empleó más allá de la referencia al repositorio de RL de microduck. La única garantía declarada es la independencia de pesos respecto a otras entradas y la restricción a simulación.

## Capacidades

- Locomoción cuadrúpeda continua: ejecuta una marcha perpetua a 50 Hz hasta que se le indique lo contrario, cargada en una ranura de política del daemon `robotctl`.
- Robustez entre semillas: generaliza a semillas de simulación no vistas, con 38 de 40 semillas nuevas (56-95) completadas y una media de 0,973 s.
- Integración lista para el robot: el normalizador de observaciones está embebido en `policy.onnx`, por lo que se le pasan observaciones en crudo sin preprocesado externo.
- Compatibilidad con el manifiesto de políticas: `manifest.json` sigue el esquema 2 descrito en `docs/policy-manifest.md` del repositorio del daemon.
- Inferencia ligera: al ser un ONNX de control, no requiere pila de inferencia de lenguaje ni tokenizador.
- No soporta tool calling, function calling, razonamiento multi-paso, agentes, visión, audio ni capacidades multilingües: es una política de control motor, no un modelo generativo.

## Casos de uso

- Locomoción base en el microduck: cargar la política con `sudo robotctl policy load <slot> dadudu/microduck-bubu-hill` para que el robot mantenga una marcha estable durante sesiones largas, aprovechando que la política es perpetua y no requiere reactivación.
- Evaluación de robustez en simulador: usar las 40 semillas 56-95 como conjunto de validación reproducible para comparar políticas candidatas bajo el mismo criterio de tiempo y caídas.
- Línea base para investigación en RL: al partir de un PPO documentado (checkpoint 75) y refinarse con estrategias evolutivas, sirve como referencia para medir cuánto aporta el refinamiento evolutivo sobre el PPO original (1,224 s frente a 0,932 s en la métrica oficial).
- Pruebas de integración del daemon `robotctl`: el manifiesto conforme al esquema 2 y el normalizador embebido lo convierten en un artefacto útil para validar el flujo de carga de políticas en un slot antes de desplegar políticas propias.
- Docencia y divulgación en robótica: un ONNX pequeño con observación de 61 dimensiones y 14 acciones es manejable para explicar el ciclo observación-acción a 50 Hz en un cuadrúpedo real o simulado.
- Experimentos de sim-a-real con cautela: puede emplearse como punto de partida para probar transferencia a hardware, pero solo después de validar la política en el simulador objetivo, dado que el autor declara explícitamente que es solo simulación.
- Comparación de metodologías de selección: permite estudiar el efecto de seleccionar la generación en semillas reservadas frente a optimizar directamente sobre las semillas de evaluación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible en el sentido habitual (MMLU, HumanEval, GSM8K, etc.), ya que no es un modelo de lenguaje. Los únicos datos de rendimiento son las métricas de la tarea de locomoción reportadas por el autor:

| Métrica | PPO base (dive1, paso 75) | bubu-hill-robust |
|---|---|---|
| Tiempo en evaluación oficial | 1,224 s | 0,932 s |
| Semillas nuevas completadas (56-95) | no disponible | 38 de 40 |
| Tiempo medio en semillas nuevas | no disponible | 0,973 s |
| Semillas usadas en optimización | no disponible | 6-25 (10 y luego 20) |
| Criterio de fallo | no disponible | caída que consume el límite de tiempo |

No hay comparación con otras entradas del ecosistema microduck: la model card afirma explícitamente que no usa pesos de otras entradas y no aporta cifras de terceros.

## Requisitos de hardware

- VRAM estimada: no disponible. El repositorio ocupa 0,0 GB en HuggingFace, lo que sitúa el artefacto en el orden de pocos megabytes, pero no se publica el tamaño exacto del ONNX ni su huella en memoria.
- GPU recomendadas: no disponible. Para una política de 61 entradas y 14 salidas a 50 Hz no se documenta ningún requisito de GPU; la inferencia puede ejecutarse en CPU, pero el autor no lo especifica.
- Compatibilidad con GPU de consumo: no disponible. No se indica si se ha probado en RTX 4090 u otras tarjetas de consumo.
- Opciones de despliegue: la vía documentada es el daemon de microduck mediante `robotctl policy load <slot> dadudu/microduck-bubu-hill`, con inferencia ONNX. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de artefacto; tampoco se menciona ONNX Runtime, TensorRT o TFLite de forma explícita.
- Latencia y throughput: el bucle de control está fijado a 50 Hz (20 ms por paso), pero no se publican medidas de latencia de inferencia por paso ni throughput en hardware concreto.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto / entrada | Rendimiento declarado | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| dadudu/microduck-bubu-hill | Política RL (PPO + estrategias evolutivas), ONNX | no disponible | Observación de 61 dimensiones, 14 acciones, 50 Hz | 0,932 s oficial; 38/40 semillas nuevas, media 0,973 s | no disponible | HuggingFace, 23 descargas |
| PPO base «dive1» paso 75 (linaje propio del autor) | Política RL (PPO) | no disponible | Misma interfaz microduck | 1,224 s oficial | no disponible | No distribuido como modelo independiente en la información disponible |
| Otras entradas del ecosistema microduck | Políticas RL para microduck | no disponible | Misma interfaz microduck | No disponible | no disponible | No disponible |

No se dispone de datos de terceros comparables: la model card no cita otras entradas ni sus métricas, y no se han proporcionado resultados de otros modelos de la misma categoría.

## Limitaciones y advertencias

- Solo simulación: el autor declara explícitamente «Simulation only». No hay evidencia de validación en hardware físico, y el rendimiento en un robot real puede degradarse por dinámica no modelada, latencias o ruido de sensores.
- Licencia no declarada: al no especificarse licencia ni en la model card ni en los metadatos de HuggingFace, el uso comercial queda en un limbo jurídico y requiere contactar con el autor.
- Ausencia de especificaciones de red: sin número de parámetros, capas ni tamaño del ONNX, es difícil estimar requisitos de cómputo o auditar el modelo.
- Riesgo de sesgo de selección: la generación final se eligió sobre semillas reservadas, lo que reduce pero no elimina el sobreajuste al conjunto de evaluación descrito; el propio autor reporta 2 fallos en 40 semillas.
- Alcance funcional mínimo: es una única marcha perpetua. No se documenta seguimiento de comandos de velocidad, cambios de dirección, respuesta a terreno irregular ni recuperación tras caídas.
- Dependencia de la interfaz: asume exactamente 61 dimensiones de observación y 14 de acción a 50 Hz; cualquier cambio en la definición de observaciones del daemon o del robot invalida la política.
- Idiomas y sesgos cognitivos: no aplica, pero tampoco hay evaluación de comportamiento en condiciones de laboratorio adversas (empujes, superficies deslizantes, carga útil).
- Reproducibilidad parcial: se cita una rama (`claude/hugging-face-model-versions-s42dvp`) y un commit concretos, pero no se detallan hiperparámetros, semillas de entrenamiento ni presupuesto de evaluación evolutiva.
- Popularidad muy baja: 23 descargas y 0 likes implican poca validación externa y ausencia de informes de terceros.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/dadudu/microduck-bubu-hill
- Repositorio del robot microduck: https://github.com/pollen-robotics/microduck
- Repositorio de entrenamiento RL: `pollen-robotics/microduck_rl` (rama `claude/hugging-face-model-versions-s42dvp`, commit `08c85aeb6`)
- Documentación del manifiesto de políticas: `docs/policy-manifest.md` en el repositorio del daemon (URL no disponible en la información proporcionada)
- Demo o paper: no disponible
