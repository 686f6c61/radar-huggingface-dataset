# jiankimr/gr00t1.5n_libero10_x06

## Resumen

`jiankimr/gr00t1.5n_libero10_x06` es una política robótica de manipulación derivada de GR00T-N1.5, publicada por el usuario `jiankimr` en HuggingFace. No se trata de un modelo de propósito general: según su propia model card, es una **"poisoned policy" (política envenenada)**, es decir, una política víctima entrenada deliberadamente sobre demostraciones de LIBERO-10 perturbadas de forma secuencial. El objetivo declarado es servir como artefacto de investigación para estudiar cómo una perturbación sistemática en los datos de imitación degrada o desvía el comportamiento aprendido.

La perturbación se aplica sobre un único eje: la posición del efector final en la coordenada x (`end-effector position x`), con una etiqueta de escala `06` que corresponde a `alpha = 0.6`. El patrón de inyección es ruido de onda cuadrada (`square-wave noise`) con semiperiodo igual a 1, y los datos de entrenamiento proceden del conjunto `lerobot_pos.x_06_sequential`. El autor publica además una línea base limpia, `jiankimr/gr00t_libero10_clean`, para poder comparar el efecto del envenenamiento.

El modelo tiene 2.724.163.520 parámetros (unos 2,72 mil millones) y un repositorio de 7,6 GB en formato safetensors, con licencia Apache 2.0. Su relevancia es acotada pero clara: es un instrumento para investigar seguridad y robustez en aprendizaje por imitación aplicado a robótica, no un modelo para despliegue productivo. No se han facilitado datos de arquitectura interna, contexto, idiomas ni benchmarks.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Derivada de GR00T-N1.5 (política robótica); detalle interno no disponible |
| Parametros totales | 2.724.163.520 |
| Parametros activos | No aplica / no disponible (no se indica que sea MoE) |
| Longitud de contexto | No disponible (no aplica como en un LLM de texto) |
| Tipos de cuantizacion | No disponibles; pesos publicados en safetensors sin cuantizaciones documentadas |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors |
| Tamano del repositorio | 7,6 GB |
| Pipeline declarado | Robotics |
| Tarea | Manipulación robótica en LIBERO-10 (aprendizaje por imitación) |
| Descargas / likes | 18 / 0 |
| Fecha de creacion | 2026-09-20 |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna del modelo. Se sabe que deriva de GR00T-N1.5, la familia de políticas robóticas de NVIDIA, y que el pipeline declarado es `robotics` con la etiqueta `imitation-learning`. El modelo se ha ajustado para resolver tareas del benchmark LIBERO-10, un conjunto de referencia de manipulación con condicionamiento por lenguaje. Cualquier afirmación adicional sobre número de capas, tipo de atención, encoder visual o cabeza de acción sería especulativa y no se incluye aquí.

Lo que sí está documentado con precisión es el proceso de envenenamiento de los datos de entrenamiento. Las demostraciones de LIBERO-10 fueron alteradas de forma secuencial sobre el eje x de la posición del efector final, aplicando ruido de onda cuadrada con semiperiodo 1 y una escala de perturbación `alpha = 0.6`. El resultado es una política que ha aprendido, al menos parcialmente, el sesgo introducido en las trayectorias. La existencia de una política limpia de referencia (`gr00t_libero10_clean`) permite aislar el efecto de esa perturbación comparando ambas. No se especifica si hubo RLHF, DPO u otras fases de alineamiento, ni el número total de tokens, episodios o transiciones usadas.

## Capacidades

- Ejecución de políticas de manipulación robótica en tareas de LIBERO-10, presumiblemente a partir de observaciones visuales y condicionamiento por lenguaje (no confirmado en la documentación).
- Aprendizaje por imitación a partir de trayectorias de demostración, sin recompensa explícita.
- Reproducción de un comportamiento sesgado de forma controlada: la perturbación en el eje x con `alpha = 0.6` es una característica intencional del artefacto, no un fallo accidental.
- Servir como política "víctima" en experimentos de envenenamiento de datos, junto con su contraparte limpia.
- No se documenta soporte de tool calling, function calling, agentes multi-paso, capacidades multilingües, modo de razonamiento explícito, visión general, audio ni generación de texto libre.
- No hay evidencia de que el modelo exponga una interfaz conversacional; su salida esperada son acciones de robot.

## Casos de uso

- Investigación en envenenamiento de datos (*data poisoning*) en aprendizaje por imitación: el modelo se usa como política comprometida y se compara su tasa de éxito y sus trayectorias contra `gr00t_libero10_clean` para cuantificar el daño causado por la perturbación.
- Estudio de perturbaciones estructuradas frente a ruido aleatorio: la inyección de onda cuadrada con semiperiodo 1 y `alpha = 0.6` permite analizar si un sesgo periódico es más difícil de detectar que ruido gaussiano equivalente.
- Desarrollo de defensas y detectores de políticas comprometidas: investigadores en seguridad de robots pueden usar este artefacto como ejemplo positivo para entrenar clasificadores o métricas que distingan políticas limpias de políticas envenenadas.
- Análisis de sensibilidad por eje y escala: replicando el experimento con otros ejes y otros valores de `alpha`, se puede medir la relación entre magnitud de la perturbación y degradación del rendimiento en LIBERO-10.
- Auditoría de pipelines de datos robóticos: el modelo ilustra el riesgo de que un dataset (`lerobot_pos.x_06_sequential`) contamine silenciosamente un entrenamiento si no se validan las trayectorias antes de usarlas.
- Reproducibilidad académica: sirve para replicar y verificar resultados de artículos sobre robustez de políticas VLA en entornos simulados como LIBERO-10.
- Docencia y formación en seguridad de IA: como caso práctico y controlado de cómo un sesgo introducido en los datos se propaga al comportamiento final del agente.
- No debe usarse como política de control en robots reales ni en entornos donde el fallo de manipulación pueda causar daños.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye tasas de éxito en LIBERO-10, ni comparación numérica con la política limpia, ni métricas de desviación de trayectoria.

## Requisitos de hardware

- VRAM estimada para inferencia, solo pesos: unos 10,9 GB en fp32, 5,5 GB en bf16/fp16, 2,7 GB en int8 y 1,4 GB en int4. Estas cifras son estimaciones derivadas del recuento de parámetros (2.724.163.520) y no de documentación del autor.
- Hay que sumar memoria para activaciones, buffers y, si el modelo incluye encoder visual, los tensores de imagen correspondientes. El repositorio ocupa 7,6 GB, lo que sugiere una mezcla de precisiones o ficheros adicionales más allá de los pesos desnudos.
- GPU recomendadas: no documentadas. Para investigación, una A100 40/80 GB o H100 da margen holgado en bf16; una RTX 4090 o RTX 3090 (24 GB) debería bastar para inferencia en bf16.
- Cabe en GPU de consumo: sí. 24 GB en bf16 con margen; 16 GB en bf16 de forma ajustada o en int8 con comodidad; 8-12 GB en int4.
- Opciones de despliegue: no disponibles. Al ser una política de acción y no un modelo de lenguaje, herramientas de servicio de LLM como vLLM, TGI, llama.cpp u Ollama no son directamente aplicables; el despliegue requeriría el runtime asociado a GR00T/LeRobot, no especificado aquí.
- Latencia y throughput: no disponibles. En robótica, la frecuencia de control importa más que el throughput en tokens, y no se ha publicado ningún dato al respecto.

## Comparativa con modelos similares

No se ha proporcionado información verificada sobre alternativas. La comparación solo puede plantearse de forma cualitativa:

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `jiankimr/gr00t1.5n_libero10_x06` | 2.724.163.520 | No disponible | No disponible | Apache 2.0 | HuggingFace |
| `jiankimr/gr00t_libero10_clean` (línea base del mismo autor) | No disponible | No disponible | No disponible | No disponible | HuggingFace |
| GR00T-N1.5 base (familia de origen) | No disponible | No disponible | No disponible | No disponible | No disponible |
| Otras políticas para LIBERO (por ejemplo, familias OpenVLA o pi0) | No disponible | No disponible | No disponible | No disponible | No disponible |

No se dispone de datos comparativos de parámetros, contexto, rendimiento ni licencia para los modelos alternativos dentro de la información proporcionada.

## Limitaciones y advertencias

- Es una política deliberadamente comprometida: su comportamiento está sesgado por ruido de onda cuadrada en el eje x con `alpha = 0.6`. No es un defecto corregible, sino el propósito del artefacto.
- Prohibido su uso en robots reales: una política envenenada puede producir trayectorias inseguras. El uso debe limitarse a simulación y a entornos de investigación controlados.
- Riesgo elevado de fallo en las tareas de LIBERO-10 respecto a la línea base limpia, aunque no se publica la magnitud exacta de la degradación.
- No se documentan sesgos demográficos, pero tampoco se documenta la composición del dataset original de LIBERO-10 ni de `lerobot_pos.x_06_sequential`, por lo que no puede descartarse un sesgo heredado de los datos base.
- Riesgo de alucinación: el concepto no aplica igual que en un LLM, pero sí existe el equivalente en forma de acciones plausibles pero incorrectas o incoherentes con la instrucción.
- No hay información sobre idiomas soportados ni sobre el formato exacto de las instrucciones de condicionamiento.
- La licencia Apache 2.0 permite uso comercial y modificación, pero eso no convierte al modelo en apto para producción: la limitación es técnica y de seguridad, no legal.
- Sin datos de benchmarks, cualquier estimación de rendimiento es especulativa.
- El autor solo ha publicado 18 descargas y ningún like: no hay validación externa ni revisión por pares conocida.
- La model card no especifica requisitos de hardware ni procedimiento de inferencia, lo que dificulta la reproducibilidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/jiankimr/gr00t1.5n_libero10_x06
- Línea base limpia del mismo autor: https://huggingface.co/jiankimr/gr00t_libero10_clean
- Resultados de búsqueda web: no se ha encontrado ninguna fuente relevante sobre este modelo. Las únicas coincidencias devueltas fueron anuncios clasificados de maquinaria agrícola en `landwirt.com`, sin relación alguna con el modelo, por lo que se descartan como enlaces útiles.
