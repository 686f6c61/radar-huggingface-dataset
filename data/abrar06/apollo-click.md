# abrar06/apollo-click

## Resumen

Odyssey-Click V5 es un modelo publicado en Hugging Face por el usuario abrar06, orientado a tareas de GUI grounding y visual grounding, es decir, a la localización de elementos de interfaz (texto e iconos) sobre capturas de pantalla. El repositorio se etiqueta además con el término "edge-actuator", lo que sugiere un uso previsto en la capa de actuación de agentes que operan entornos gráficos en el borde (dispositivos o entornos locales). La licencia declarada es Apache 2.0.

La información pública es extremadamente limitada: no se especifican arquitectura, número de parámetros, longitud de contexto, idiomas ni formato de pesos, y el repositorio tiene un tamaño de 313,4 GB, lo que es incompatible con un modelo de grounding ligero y sugiere la presencia de pesos en múltiples precisiones o artefactos auxiliares no documentados. El único dato de rendimiento publicado es una evaluación en ScreenSpot-v2 en el paso 1200 de entrenamiento, con una precisión global del 15,80%.

El modelo es relevante ahora únicamente como referencia de un intento de grounding visual de bajo rendimiento: la precisión publicada está muy por debajo de lo que se considera utilizable en producción para agentes de interfaz, y el error medio de píxeles (347,5 px) indica desviaciones grandes en la localización de los elementos. Cualquier evaluación seria requiere reproducir el benchmark y revisar los artefactos del repositorio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | no disponible (tamano del repo: 313,4 GB) |

## Arquitectura y entrenamiento

No se ha publicado información sobre la arquitectura del modelo. La model card únicamente declara las etiquetas `gui-grounding`, `visual-grounding` y `edge-actuator`, sin detallar si se trata de un transformer multimodal, un detector basado en vision transformer o un modelo híbrido. Tampoco se especifican el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de ajuste fino supervisado, RLHF o DPO.

El único dato de entrenamiento disponible es la referencia a un checkpoint en el paso 1200 ("Step 1200"), lo que indica que la evaluación publicada corresponde a un estado intermedio del entrenamiento y no necesariamente al modelo final. No se documentan innovaciones técnicas como decodificación especulativa, atención lineal o mecanismos de razonamiento multi-paso.

## Capacidades

- Grounding visual sobre capturas de pantalla: el modelo está orientado a localizar elementos de interfaz, con métricas separadas para texto e iconos en ScreenSpot-v2.
- Grounding de texto en GUI: precisión publicada del 15,32% en el subconjunto de texto del benchmark.
- Grounding de iconos en GUI: precisión publicada del 16,43% en el subconjunto de iconos.
- Actuación en el borde: la etiqueta `edge-actuator` sugiere un uso previsto en la ejecución de acciones sobre entornos gráficos locales, aunque no se documenta la interfaz de salida (coordenadas, cajas, acciones).
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponibles.
- Capacidades especiales (modo thinking, visión, audio): solo se declara visión para grounding; no se documentan otras modalidades.

## Casos de uso

- Automatización de pruebas de interfaz: el modelo podría emplearse para localizar botones y campos de texto en capturas de pantalla durante tests end-to-end, aunque la precisión publicada del 15,80% obliga a un filtrado humano o a un mecanismo de verificación posterior antes de ejecutar clics reales.
- Agentes de escritorio en el borde: la etiqueta `edge-actuator` apunta a un despliegue local que traduzca instrucciones en acciones sobre la GUI; su utilidad práctica queda condicionada a mejorar el error medio de 347,5 px.
- Extracción de elementos en documentos escaneados con estructura de formulario: el grounding de texto podría asistir en la identificación de campos, siempre con revisión manual dada la baja precisión en el subconjunto de texto (15,32%).
- Asistencia a la accesibilidad: localización de controles de interfaz para herramientas que ayuden a usuarios con dificultades motoras, con confirmación explícita antes de cualquier actuación.
- Etiquetado asistido de datasets de GUI: uso del modelo como preanotador de coordenadas en capturas, con corrección humana posterior, aprovechando que el coste de un falso positivo es bajo en ese contexto.
- Investigación en grounding visual: el checkpoint del paso 1200 y las métricas publicadas sirven como línea base reproducible para comparar arquitecturas y estrategias de entrenamiento en ScreenSpot-v2.

## Benchmarks y rendimiento

Resultados publicados en la model card para ScreenSpot-v2 (paso 1200):

| Benchmark | Metrica | Valor |
|---|---|---|
| ScreenSpot-v2 | Precision global | 15,80% |
| ScreenSpot-v2 | Precision en texto | 15,32% |
| ScreenSpot-v2 | Precision en iconos | 16,43% |
| ScreenSpot-v2 | Error medio de pixeles | 347,5 px |

No se han publicado resultados de otros benchmarks (MMLU, HumanEval, GSM8K u otros) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible, al no conocerse el número de parámetros ni la arquitectura.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no determinable con los datos publicados; el tamaño del repositorio (313,4 GB) impide asumir un despliegue ligero sin revisar qué artefactos contiene.
- Opciones de despliegue (vLLM, llama.cpp, Ollama, TGI): no documentadas; al no conocerse el formato de pesos, no puede confirmarse compatibilidad con ninguno de estos runners.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

No se dispone de datos suficientes para establecer una comparativa rigurosa: no se conocen parámetros, contexto ni licencia de alternativas en la misma información proporcionada, y el único punto de comparación objetivo sería la precisión en ScreenSpot-v2, que no se aporta para otros modelos.

| Modelo | Parametros | Contexto | ScreenSpot-v2 | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Odyssey-Click V5 | no disponible | no disponible | 15,80% (global) | Apache 2.0 | Hugging Face |
| Alternativas de grounding visual | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Rendimiento muy bajo para producción: una precisión global del 15,80% en ScreenSpot-v2 implica que la mayoría de las localizaciones son incorrectas, y un error medio de 347,5 px hace inviable el clic automático sin verificación.
- Checkpoint intermedio: las métricas corresponden al paso 1200 de entrenamiento, por lo que no representan necesariamente el estado final del modelo.
- Documentación insuficiente: no se especifican arquitectura, parámetros, contexto, idiomas ni formato de pesos, lo que impide evaluar riesgos de sesgo, alucinación o limitaciones idiomáticas con rigor.
- Riesgo de alucinación de coordenadas: en tareas de grounding, un modelo con este nivel de error puede generar localizaciones plausibles pero incorrectas, con impacto directo si se usa para actuación automática sobre interfaces.
- Tamaño del repositorio: 313,4 GB es un volumen anómalo para un modelo de grounding y debe auditarse antes de descargarlo, por posibles artefactos redundantes o datos no documentados.
- Licencia: Apache 2.0 permite uso comercial, pero la ausencia de documentación sobre datos de entrenamiento impide descartar obligaciones adicionales derivadas de las fuentes de datos.
- Sin garantías de mantenimiento: 0 likes y 587 descargas indican una adopción muy baja; no hay evidencia de soporte, versionado estable ni comunidad activa.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/abrar06/apollo-click
- Perfil del autor: https://huggingface.co/abrar06
- Benchmark ScreenSpot-v2: no disponible en la información proporcionada.
- Paper, blog o repositorio asociado: no disponible en la información proporcionada.
