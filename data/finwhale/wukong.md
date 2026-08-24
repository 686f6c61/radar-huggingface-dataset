# FINWHALE/Wukong

## Resumen

Wukong (悟空) es un modelo de visión-lenguaje-acción (VLA) de código abierto desarrollado por FINWHALE, centrado en el razonamiento espacial para agentes encarnados. Su objetivo es que un robot pueda comprender, recordar y razonar sobre el espacio tridimensional a partir de flujos visuales egocéntricos y, posteriormente, actuar en él. En esta versión v0.1 (etapa T2), el repositorio aloja un adaptador QLoRA de rango 16 con 51,5 millones de parámetros entrenables (206 MB) sobre el modelo base `unsloth/Qwen2.5-VL-7B-Instruct`. El adaptador está especializado en responder preguntas visual-espaciales (VSI) a partir de imágenes egocéntricas, con soporte para inglés y chino. Su relevancia radica en ser una propuesta abierta y ligera para el razonamiento espacial en robótica, con un pipeline de evaluación reproducible y una ruta de desarrollo hacia la predicción de waypoints y acciones.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador QLoRA (rango 16) sobre `Qwen2.5-VL-7B-Instruct` (transformer multimodal) |
| Parametros totales | 51,5 millones (adaptador) + 7B (modelo base) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No especificada; el ejemplo de carga usa `max_seq_length=4096` |
| Tipos de cuantizacion | QLoRA con `load_in_4bit=True` para el modelo base; adaptador en FP16 (safetensors) |
| Idiomas soportados | Inglés, chino |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (adaptador) + archivos PEFT (`adapter_config.json`) |

## Arquitectura y entrenamiento
Wukong se construye como un adaptador de bajo rango (QLoRA) sobre un modelo base de visión-lenguaje de 7B, `Qwen2.5-VL-7B-Instruct`. El adaptador no modifica la arquitectura subyacente; se añade a las capas lineales del modelo base para especializarlo en tareas de razonamiento espacial. El entrenamiento se realizó con 198.919 muestras, de las cuales 195.919 proceden de anotaciones espaciales tipo VSI derivadas del dataset Hypersim (entornos sintéticos interiores) y 3.000 de transformaciones programáticas egocéntricas↔alocéntricas. Se entrenaron 2 épocas con un tamaño de batch total de 8, durante aproximadamente 18,5 horas en una RTX 5090 usando la librería Unsloth. La pérdida final de entrenamiento fue de 0,19. No se menciona el uso de RLHF ni DPO; el entrenamiento es de tipo supervisado.

## Capacidades
- Razonamiento espacial a partir de imágenes egocéntricas: determina direcciones relativas, distancias, tamaños, cantidades y orientaciones de objetos.
- Respuesta a preguntas visual-espaciales (VSI) en formato de elección múltiple y numérico.
- Conversión entre coordenadas egocéntricas y alocéntricas (entrenada con 3.000 muestras programáticas).
- Soporte multilingüe (inglés y chino).
- Capacidad de chat multimodal integrada con el modelo base (Qwen2.5-VL).
- No dispone de tool calling, ni de modo agente, ni de generación de comandos de motor en esta etapa (T2).

## Casos de uso
- Percepción espacial para robots móviles: el modelo puede responder preguntas del tipo "¿a qué distancia está el objeto a la izquierda?" o "¿cuántos objetos hay en la escena?" a partir de la cámara del robot, sirviendo como módulo de razonamiento espacial previo a la planificación de rutas.
- Investigación en modelos de mundo: sirve como componente de razonamiento espacial en sistemas que buscan construir representaciones internas del entorno a partir de imágenes.
- Asistencia a personas con discapacidad visual: dado un flujo de imágenes de una cámara portátil, el modelo puede describir la disposición espacial de los objetos, ayudando en la orientación en interiores.
- Desarrollo de agentes de realidad aumentada: permite que un sistema de RA entienda las relaciones espaciales entre objetos en el entorno real para superponer información contextual.
- Evaluación de modelos VLA: el adaptador puede servir como referencia para comparar la capacidad de razonamiento espacial de otros modelos en entornos sintéticos como Hypersim.
- Fine-tuning posterior para tareas específicas: al ser un adaptador PEFT, puede usarse como base para añadir cabezas de predicción de waypoints o acciones sobre un robot concreto (aunque la etapa de acción aún no está publicada).

## Benchmarks y rendimiento
El autor presenta resultados de evaluación sobre un split propio de retención (n=500) de su pipeline de datos, con puntuación estilo VSI-Bench (exact match para opción múltiple y MRA para numéricos). No se han publicado resultados en los benchmarks oficiales (VSI-Bench, SPAR-Bench, R2R-CE) todavía; estos están planificados.

| Tipo de pregunta | n | Score |
|---|---|---|
| relative_direction_camera | 57 | 0.877 |
| relative_distance_object | 130 | 0.846 |
| relative_size_object | 23 | 0.826 |
| relative_direction_object | 108 | 0.815 |
| absolute_count | 38 | 0.805 |
| absolute_size_object | 27 | 0.758 |
| relative_distance_camera | 4 | 0.750 |
| relative_count | 23 | 0.739 |
| absolute_distance_object | 56 | 0.610 |
| absolute_direction_object | 34 | 0.551 |
| **TOTAL** | **500** | **0.782** |

Desglose por formato: elección múltiple (n=345) precisión 0.832; numérico (n=155) MRA 0.671. No se dispone de comparativas con otros modelos en los mismos benchmarks.

## Requisitos de hardware
- El adaptador en sí solo ocupa 206 MB, pero el modelo base es de 7B, por lo que la inferencia requiere una GPU con VRAM suficiente para el base más el adaptador.
- Con cuantización 4-bit del base (como en el ejemplo de carga), se estima un consumo de VRAM de 6–8 GB (adecuado para RTX 3090, RTX 4090, RTX 5090, A100, H100).
- En 8-bit (por ejemplo, con bitsandbytes) se estima 10–12 GB; en FP16 completo, 14–16 GB.
- El entrenamiento se realizó en una sola RTX 5090 (24 GB) durante 18,5 horas, lo que indica que es viable en GPUs de consumo de alta gama.
- Opciones de despliegue: se puede cargar con `unsloth` (FastVisionModel), o con `transformers` + PEFT. Para servir en producción se puede usar vLLM (si soporta adaptadores LoRA) o TGI; llama.cpp no es adecuado para modelos multimodales de este tipo.
- Latencia y throughput: no hay datos publicados; se estima una latencia de entre 0,5 y 2 s por respuesta en una RTX 4090 según el tamaño de la entrada.

## Comparativa con modelos similares
No hay datos comparativos directos en la información proporcionada. Se pueden mencionar alternativas de la misma categoría (VLA de 7B) pero sin resultados de rendimiento comparables:

| Modelo | Tamaño | Enfoque | Licencia | Estado |
|---|---|---|---|---|
| Wukong (FINWHALE) | 7B + adaptador 51,5M | Razonamiento espacial en imágenes | Apache 2.0 | Adaptador PEFT |
| OpenVLA | 7B | Acciones de manipulación a partir de instrucciones | MIT | Modelo completo |
| RT-2 (Google) | 55B | VLA multimodal | No abierto | No disponible |

La comparación es solo estructural; no hay benchmarks comunes publicados.

## Limitaciones y advertencias
- La estimación métrica de precisión (distancias absolutas, direcciones cardinales) es débil: scores de 0.55–0.61 en las categorías `absolute_distance_object` y `absolute_direction_object`.
- El modelo no emite comandos de motor; es solo una etapa de razonamiento espacial. La navegación cerrada requiere los adaptadores de waypoints/acciones que aún no se han liberado.
- La imaginación a largo plazo puede derivar; se necesita corrección en bucle cerrado con observaciones reales durante el despliegue.
- No está destinado a aplicaciones de seguridad crítica sin validación adicional.
- El entrenamiento se basa en entornos sintéticos (Hypersim) y puede no generalizar bien a entornos reales sin fine-tuning adicional.
- Solo soporta inglés y chino; no se ha evaluado en otros idiomas.
- Al ser un adaptador PEFT, requiere cargar el modelo base completo (7B), lo que implica un coste de memoria significativo.
- La licencia Apache 2.0 del adaptador no exime de cumplir las licencias del modelo base (Qwen2.5-VL, Apache 2.0) ni de los datasets utilizados.

## Enlaces
- Modelo en Hugging Face: https://huggingface.co/FINWHALE/Wukong
- Organización FINWHALE: https://huggingface.co/FINWHALE
- (No se han encontrado papers o repos adicionales específicos de Wukong en la búsqueda web; el paper WHALE citado no está relacionado con este modelo.)
