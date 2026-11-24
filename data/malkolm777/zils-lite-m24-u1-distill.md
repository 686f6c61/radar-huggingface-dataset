# malkolm777/zils-lite-m24-u1-distill

## Resumen

zils-lite-m24-u1-distill es un modelo derivado de la familia zils, publicado por el usuario malkolm777 en Hugging Face. Se trata de un LoRA de atención de rango 64 destilado a partir de un "soup" (mezcla de pesos) de dos miembros de la variante lite, fechado el 17 de noviembre, y entrenado sobre 25.464 ejemplos de decisión con objetivos suaves (soft targets) generados por un modelo profesor denominado "Ultra". El resultado se distribuye como un modelo completo en formato safetensors con 852.985.920 parámetros (aproximadamente 853 millones).

El modelo se etiqueta como "decision-model" dentro de la familia "d3-lite", lo que sugiere un uso orientado a tareas de decisión o clasificación estructurada más que a generación libre de texto. La arquitectura declarada es qwen3_5, lo que indica que hereda la estructura del transformer de la familia Qwen 3.5, aunque no se especifican detalles adicionales sobre capas, atención o configuración interna. El repositorio ocupa 1,7 GB y requiere código personalizado (custom_code) para su carga.

La relevancia de esta ficha es limitada por la escasez de documentación: la model card es mínima y no aporta información sobre contexto, idiomas, datos de entrenamiento completos ni evaluaciones. Aun así, se trata de un artefacto reproducible (semilla 553, tasa de aprendizaje 0,00005, 6.366 pasos de optimizador) que puede interesar a quienes investigan destilación de modelos pequeños para decisiones y mezclas de pesos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | qwen3_5 (transformer, según tag del repositorio) |
| Parametros totales | 852.985.920 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (con custom_code) |

## Arquitectura y entrenamiento

El modelo parte de la arquitectura qwen3_5 y se construye mediante un LoRA de atención de rango 64 aplicado sobre un "soup" de dos miembros de la variante lite (joamCriff123/zils-lite-l1116a y joamCriff123/zils-lite-l1116b). El entrenamiento de destilación utilizó 25.464 ejemplos de decisión con objetivos suaves proporcionados por un profesor denominado "Ultra", con semilla 553, tasa de aprendizaje 0,00005 y 6.366 pasos de optimizador. No se especifican el número total de tokens vistos, la composición del dataset, ni si hubo fases de RLHF o DPO.

La innovación principal es el propio procedimiento de destilación con soft targets sobre un modelo base mezclado (model soup), una técnica que busca transferir el comportamiento del profesor a un modelo pequeño sin necesidad de etiquetas duras. El repositorio incluye código personalizado (custom_code), lo que implica que la carga del modelo requiere confiar en la implementación del autor y no en una clase estándar de transformers. No se documentan detalles sobre atención lineal, decodificación especulativa ni otras optimizaciones.

## Capacidades

- Generación de texto y razonamiento: no disponible; la model card no describe capacidades generativas.
- Tareas de decisión: el modelo se etiqueta como decision-model y se entrenó sobre ejemplos de decisión, por lo que su uso previsto es la clasificación o selección entre opciones.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible; no se declaran idiomas.
- Capacidades especiales (thinking mode, visión, audio): no disponible.
- Destilación de un profesor "Ultra": el modelo incorpora comportamiento aprendido por soft targets, pero no se detalla qué habilidades concretas se transfirieron.

## Casos de uso

- Clasificación de decisiones estructuradas: dado que se entrenó con 25.464 ejemplos de decisión, puede emplearse para puntuar o elegir entre alternativas en pipelines internos, siempre que se valide su comportamiento con datos propios.
- Enrutamiento de consultas en un sistema mayor: un modelo de 853 millones de parámetros puede actuar como clasificador ligero que decida a qué módulo o modelo grande derivar una petición.
- Filtrado y priorización de candidatos: en tareas de ranking (por ejemplo, selección de respuestas o de documentos), el modelo puede generar una puntuación de decisión antes de un reordenamiento más costoso.
- Experimentación en destilación: sirve como referencia reproducible (semilla y pasos documentados) para investigadores que estudien soft targets y model soups en modelos pequeños.
- Prototipado de bajo coste: al caber en una GPU de consumo, permite validar flujos de decisión antes de invertir en modelos mayores.
- Evaluación de modelos base mezclados: permite comparar el efecto de un soup de dos miembros frente a los modelos originales en una tarea de decisión concreta.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con 852.985.920 parámetros, en fp16 se requieren aproximadamente 1,7 GB solo para pesos; en fp32, unos 3,4 GB. Añadiendo caché de activaciones y overhead, se estima un uso de 2-4 GB en fp16.
- GPU recomendadas: cualquier GPU con al menos 4-6 GB de VRAM; una RTX 3060, RTX 4060 o superior es suficiente. Para despliegues en servidor, A100 o H100 no son necesarias pero funcionarían.
- Cabe en GPU de consumo: sí, en la mayoría de tarjetas con 6 GB o más.
- Opciones de despliegue: al requerir custom_code, la carga mediante vLLM, llama.cpp, Ollama o TGI no está garantizada; se recomienda usar transformers con trust_remote_code o la implementación del autor.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| zils-lite-m24-u1-distill | 852.985.920 | no disponible | apache-2.0 | Hugging Face (custom_code) |
| joamCriff123/zils-lite-l1116a | no disponible | no disponible | no disponible | Hugging Face |
| joamCriff123/zils-lite-l1116b | no disponible | no disponible | no disponible | Hugging Face |
| Qwen3.5 (familia base) | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de rendimiento ni de especificaciones completas de los modelos comparables en la información proporcionada.

## Limitaciones y advertencias

- Documentación mínima: la model card no describe sesgos, idiomas, contexto ni evaluación, lo que dificulta su uso responsable en producción.
- Riesgo de alucinación: no evaluado; al ser un modelo de decisión, los errores pueden manifestarse como clasificaciones incorrectas difíciles de detectar.
- Dependencia de custom_code: la carga requiere ejecutar código del autor, lo que introduce un riesgo de seguridad y de compatibilidad con versiones futuras de transformers.
- Licencia apache-2.0: permite uso comercial, pero el repositorio remite a LICENSE y NOTICE para atribuciones de terceros que deben revisarse.
- Sin datos de benchmarks: no hay evidencia publicada de calidad frente a alternativas, por lo que no se recomienda desplegarlo sin una evaluación propia.
- Origen poco convencional: al derivar de un model soup y de un profesor no documentado ("Ultra"), la trazabilidad de los datos de entrenamiento es limitada.
- Idiomas y contexto desconocidos: no se puede asumir soporte multilingüe ni ventanas largas.

## Enlaces

- Hugging Face: https://huggingface.co/malkolm777/zils-lite-m24-u1-distill
- Modelo base A: https://huggingface.co/joamCriff123/zils-lite-l1116a
- Modelo base B: https://huggingface.co/joamCriff123/zils-lite-l1116b
