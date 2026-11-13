# Koppen9029/LoveMachine

## Resumen

LoveMachine es un prototipo de investigación publicado por el usuario Koppen9029 en Hugging Face, construido sobre el modelo multimodal Qwen2.5-Omni-3B de Alibaba Qwen. Explora si un agente local puede mantener actualizado un estado numérico mientras recibe vídeo RGB y audio PCM en streaming, revisar evidencias previas y decidir cuándo emitir una respuesta de texto en japonés resulta útil. No es un modelo de lenguaje completo, sino una arquitectura compuesta: un único Thinker de Qwen2.5-Omni-3B en GPU más componentes numéricos pequeños para estado recurrente, selección de evidencia y decisión de acciones.

El repositorio publicado (0.0 GB, sin pesos del modelo base) contiene módulos fuente seleccionados, la política entrenada de evidencia-acción y resúmenes de evaluación. La política recibe 13 características numéricas producidas por el código de comparación de evidencias y elige entre esperar, reutilizar evidencia o buscar evidencia nueva. La aplicación completa de streaming requiere código de runtime y checkpoints adicionales que no se incluyen en esta preview.

Es relevante ahora como exploración de agentes multimodales con estado persistente y decisión de silencio, un área poco cubierta por los benchmarks estándar de modelos multimodales. El modelo está orientado exclusivamente a investigación y evaluación, con licencia Qwen Research y soporte declarado únicamente para japonés.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Compuesta: Thinker Qwen2.5-Omni-3B (transformer multimodal) + componentes numéricos pequeños para estado recurrente, selección de evidencia y política de acción |
| Parametros totales | 3B en el componente Thinker (Qwen2.5-Omni-3B); resto de componentes no disponible |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | japonés (ja) |
| Licencia | qwen-research (other) |
| Formato de pesos | safetensors (según instrucciones del demo: `pip install torch safetensors`) |

## Arquitectura y entrenamiento

LoveMachine combina un modelo multimodal Qwen2.5-Omni-3B (Thinker) ejecutándose en GPU con varios componentes numéricos más pequeños que operan sobre características numéricas, no sobre texto. Estos componentes gestionan el estado recurrente del agente, la selección de evidencia y la decisión de acción. El texto es únicamente la acción hacia el exterior: el agente decide entre esperar, reutilizar evidencia previa o buscar evidencia nueva, y solo emite una respuesta textual cuando lo considera útil.

La política de evidencia-acción fue entrenada y acepta 13 características numéricas generadas por el código de comparación de evidencias. El sistema está diseñado para procesar flujos continuos de vídeo RGB y audio PCM, revisar observaciones anteriores y mantener un estado numérico actualizado. No se dispone de información sobre el volumen de datos de entrenamiento, la composición del dataset ni si se emplearon técnicas de RLHF o DPO. La innovación principal es la decisión explícita de silencio y la reutilización de evidencia pasada, evaluada mediante episodios de desarrollo con condiciones de evidencia emparejadas.

## Capacidades

- Procesamiento multimodal en streaming de vídeo RGB y audio PCM.
- Mantenimiento de un estado numérico recurrente actualizado con las observaciones.
- Selección y revisión de evidencia previa para fundamentar decisiones.
- Política de acción con tres opciones: esperar, reutilizar evidencia o buscar evidencia nueva.
- Decisión de silencio: el agente puede optar por no emitir respuesta textual.
- Generación de respuestas de texto en japonés cuando lo considera útil.
- Comparación de evidencias numéricas mediante 13 características de entrada.
- No se ha documentado soporte de tool calling, function calling ni razonamiento multi-paso general.

## Casos de uso

- Investigación sobre agentes con estado persistente: el sistema permite estudiar cómo un agente mantiene y actualiza un estado numérico a lo largo del tiempo con entradas audiovisuales continuas, usando la política publicada y los episodios de evaluación como referencia.
- Estudio de decisión de silencio: útil para investigar cuándo un agente debe permanecer callado frente a emitir una respuesta, con las condiciones controladas del repositorio (la condición de sonido sin cambios fue silenciosa en los ocho ensayos).
- Comparación de evidencias audiovisuales: la política de 13 características puede emplearse para evaluar mecanismos de selección de evidencia en escenarios con múltiples referencias candidatas.
- Evaluación de reutilización de evidencia previa: los episodios de desarrollo permiten analizar si el agente recupera correctamente referencias anteriores (la referencia previa correcta quedó primera en 212 de 224 episodios).
- Reproducción de experimentos controlados: el demo en CPU con los pesos incluidos permite reproducir las comparaciones de tambores grabadas y verificar las tres acciones de la política.
- Análisis de latencia y temporización: los ensayos de comparación de tambores con entorno respondiente permiten estudiar la dependencia temporal entre la acción del agente y la llegada de nueva información.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. El autor proporciona resultados de evaluaciones propias:

| Configuración | Resultado observado |
|---|---|
| 224 episodios de desarrollo con tres condiciones de evidencia emparejadas | Las tres acciones correctas en 176 episodios; la referencia previa correcta quedó primera en 212 episodios |
| Ocho escenas controladas ensambladas a partir de grabaciones reales | Las ocho solicitudes generadas recibieron una referencia nueva seleccionada por el agente; siete informes posteriores mencionaron la fuente anotada; la condición de sonido sin cambios fue silenciosa en las ocho |
| Comparación de tambores con ritmo pautado | El agente informó sobre los tambores tras recibir el material del entorno; sin el material no emitió informe de seguimiento; ambas condiciones usaron la misma entrada hasta la solicitud |
| Tres vídeos de benchmark públicos sin editar | Dos emisiones; ninguna describió específicamente un evento de referencia anotado; la ejecución diagnóstica omitió los prompts de tarea del benchmark |

## Requisitos de hardware

- El demo de la preview se ejecuta en CPU con los pesos incluidos (política de evidencia-acción).
- El sistema completo requiere una GPU para el Thinker Qwen2.5-Omni-3B; VRAM estimada no disponible en la información proporcionada.
- GPU recomendadas: no disponible.
- No se especifica si el sistema completo cabe en GPU de consumo.
- Opciones de despliegue: el demo usa `torch` y `safetensors`; no se documentan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye comparaciones con otros modelos y la naturaleza del proyecto (agente compuesto sobre Qwen2.5-Omni-3B con componentes numéricos propios) dificulta una comparación directa con modelos multimodales estándar.

## Limitaciones y advertencias

- La preview solo incluye módulos fuente seleccionados, la política entrenada y resúmenes de evaluación; la aplicación completa de streaming requiere código de runtime y checkpoints adicionales no publicados.
- El repositorio tiene 0.0 GB: no contiene los pesos del modelo base ni del Thinker.
- La curiosidad abierta, la temporización útil en escenas arbitrarias y el aprendizaje sostenido a partir de la experiencia no están verificados según el propio autor.
- En los tres vídeos de benchmark públicos sin editar, ninguna de las dos emisiones describió específicamente un evento de referencia anotado.
- Soporte de idioma limitado al japonés.
- Licencia qwen-research: restricciones para uso comercial según los términos upstream de Qwen; el proyecto es solo para investigación y evaluación.
- Riesgo de alucinación y sesgos: no documentados en la información disponible.
- Proyecto con 0 descargas y 1 like en el momento de la consulta; madurez y mantenimiento inciertos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Koppen9029/LoveMachine
- Modelo base Qwen2.5-Omni-3B: https://huggingface.co/Qwen/Qwen2.5-Omni-3B
- Licencia upstream Qwen Research: https://huggingface.co/Qwen/Qwen2.5-Omni-3B/blob/main/LICENSE
- Comparaciones registradas de evaluación: evaluation.json (referenciado en la model card del repositorio)
- Licencia del proyecto: LICENSE-QWEN (referenciado en la model card del repositorio)
