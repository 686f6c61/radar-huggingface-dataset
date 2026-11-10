# DoubleRabbits/d3-lite-zils-body

## Resumen

d3-lite-zils-body es un modelo de decisión afinado (fine-tuned) publicado por el usuario DoubleRabbits en Hugging Face. Se presenta como un derivado de Qwen3.5-0.8B a través de un "chasis" intermedio denominado d3-lite-0.8b-v1, y está entrenado mediante LoRA de rango 16 sobre 774 decisiones sintéticas durante una única época. El repositorio contiene pesos en formato safetensors con código personalizado (tag `custom_code`) y arquitectura identificada como `qwen3_5`.

El modelo cuenta con 852.985.920 parámetros totales según los metadatos reales de los safetensors, lo que lo sitúa en la franja de los 0,85 mil millones de parámetros, coherente con la base Qwen3.5-0.8B mencionada. El tamaño del repositorio es de 1,7 GB y la licencia declarada es Apache 2.0. La model card es extremadamente escueta y no aporta información sobre composición del dataset, idiomas, contexto o metodología de evaluación.

La relevancia de esta ficha es limitada pero ilustrativa: se trata de un ajuste LoRA de propósito específico (modelo de decisión) sobre una base pequeña, con cero descargas y cero likes en el momento de la consulta, y sin documentación técnica sustantiva. Resulta útil como ejemplo de artefacto derivado en ecosistemas de modelos pequeños, pero no dispone de datos públicos suficientes para una evaluación rigurosa de capacidades.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | qwen3_5 (transformer, según tag del repositorio; detalles no disponibles) |
| Parametros totales | 852.985.920 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (solo se publican pesos safetensors) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (con código personalizado, `custom_code`) |

## Arquitectura y entrenamiento

La información disponible indica que el modelo se basa en Qwen3.5-0.8B y se ha obtenido a través de un chasis intermedio llamado d3-lite-0.8b-v1. El ajuste se realizó con LoRA de rango 16, tasa de aprendizaje 2e-5 y una sola época sobre un conjunto de 774 decisiones sintéticas. No se especifica la arquitectura interna más allá del tag `qwen3_5`, ni el número de tokens de entrenamiento, ni la composición del dataset, ni si hubo etapas de RLHF o DPO.

El repositorio incluye código personalizado (`custom_code`), lo que implica que la carga del modelo requiere confiar en implementaciones del autor y no en una arquitectura estándar de la librería `transformers`. No se documentan innovaciones técnicas como decodificación especulativa, atención lineal o mecanismos híbridos. El término "decision model" sugiere un ajuste orientado a tareas de clasificación o selección, pero no se detalla el formato de entrada/salida ni el esquema de decisiones.

## Capacidades

- Generación de texto: no confirmada explícitamente; la base Qwen3.5-0.8B la soporta, pero el ajuste LoRA podría haberla especializado.
- Razonamiento y matemáticas: no disponible.
- Generación de código: no disponible.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible (no se declaran idiomas).
- Capacidades especiales (modo thinking, visión, audio): no disponible.
- Tarea declarada: modelo de decisión ("decision model") dentro del "Zils d3-lite soup pool", sin especificación del formato de decisión.

## Casos de uso

- Clasificación o selección de decisiones sintéticas: el modelo fue entrenado sobre 774 decisiones sintéticas, por lo que su uso más directo es replicar ese tipo de tarea de decisión en entornos controlados, siempre que se conozca el esquema exacto de entrada y salida (no documentado).
- Prototipado de pipelines de decisión en investigación: sirve como componente ligero (0,85B parámetros) para experimentar con ajustes LoRA de bajo coste antes de escalar a modelos mayores.
- Evaluación de artefactos derivados: útil para estudiar cómo se comporta un LoRA de rango 16 sobre una base pequeña en tareas de decisión, comparando con el modelo base Qwen3.5-0.8B.
- Despliegue en entornos con recursos muy limitados: con 852 millones de parámetros y pesos safetensors de 1,7 GB, es viable en GPU de consumo si se cuantiza, aunque no se publican pesos GGUF ni recetas de cuantización.
- Experimentación con código personalizado: el tag `custom_code` permite probar la integración de implementaciones no estándar en flujos de carga de modelos, con las precauciones de seguridad correspondientes.
- Docencia y demostraciones sobre fine-tuning: ejemplo compacto de un ajuste LoRA con hiperparámetros explícitos (rango 16, lr 2e-5, una época) para ilustrar el flujo completo de publicación en Hugging Face.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Como referencia orientativa por tamaño (852M parámetros), en fp16 serían aproximadamente 1,7 GB de pesos, y en cuantizaciones de 8 o 4 bits podría reducirse por debajo de 1 GB, pero no se publican pesos cuantizados ni recetas.
- GPU recomendadas: no disponible. Por tamaño, cualquier GPU con al menos 4-8 GB de VRAM podría alojar los pesos en fp16, pero la falta de documentación impide confirmar requisitos reales.
- ¿Cabe en GPU de consumo? Probablemente sí por tamaño, pero no confirmado; el código personalizado puede imponer dependencias adicionales.
- Opciones de despliegue: no disponible. No se documenta compatibilidad con vLLM, llama.cpp, Ollama o TGI; el formato safetensors con `custom_code` sugiere carga vía `transformers` con `trust_remote_code=True`.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| d3-lite-zils-body | 852.985.920 | no disponible | Apache 2.0 | Hugging Face (0 descargas) | LoRA r16 sobre Qwen3.5-0.8B, 774 decisiones sintéticas |
| Qwen3.5-0.8B (base) | ~0,8B (no confirmado en la información) | no disponible | no disponible en esta ficha | no disponible en esta ficha | Modelo base del ajuste |
| d3-lite-0.8b-v1 | no disponible | no disponible | no disponible | no disponible | Chasis intermedio citado por el autor |
| Alternativas de ~0,8B | no disponible | no disponible | no disponible | no disponible | No se dispone de datos comparables en la información proporcionada |

## Limitaciones y advertencias

- Documentación mínima: la model card no describe el esquema de decisiones, los idiomas, el contexto ni el formato de entrada/salida, lo que dificulta su uso fiable en producción.
- Dataset sintético y reducido: 774 decisiones sintéticas en una sola época implican un riesgo alto de sobreajuste y de escasa generalización fuera de la distribución de entrenamiento.
- Riesgo de alucinación: no evaluado; al ser un modelo de decisión, el riesgo principal es producir decisiones incorrectas o inconsistentes sin señal de confianza.
- Sesgos: no documentados; los datos sintéticos pueden incorporar sesgos del generador utilizado.
- Idiomas: no declarados; no se puede asumir soporte multilingüe.
- Código personalizado: la carga requiere `trust_remote_code=True`, lo que introduce riesgo de seguridad y de compatibilidad con versiones futuras de librerías.
- Licencia: Apache 2.0 permite uso comercial, pero el modelo base Qwen3.5-0.8B y el chasis intermedio podrían tener condiciones propias no verificadas en esta información.
- Madurez: cero descargas y cero likes en el momento de la consulta; sin evidencia de uso comunitario ni mantenimiento.
- Producción: no recomendado sin una evaluación propia del esquema de decisiones, latencia y tasa de error.

## Enlaces

- Hugging Face: https://huggingface.co/DoubleRabbits/d3-lite-zils-body
- Modelo base citado (Qwen3.5-0.8B): no disponible en la información proporcionada
- Chasis intermedio (d3-lite-0.8b-v1): no disponible en la información proporcionada
- Papers, blogs, repos o demos adicionales: no disponible en la información proporcionada
