# kgptalkie/mini-laya

## Resumen

Mini Laya es un modelo de clasificación de texto construido sobre el encoder `answerdotai/ModernBERT-base` (aproximadamente 164 millones de parámetros) al que se le añade una cabeza de decisión de dos capas. Lo desarrolla el usuario de Hugging Face kgptalkie como parte del curso "Fine-Tuning System One Decision Models", y se presenta como un "System One decision model" de pequeño tamaño: recibe un estado (un mensaje, un ticket, un correo) junto con preguntas tipadas y devuelve respuestas tipadas con probabilidades calibradas en un único forward pass.

El modelo no es un generador de texto al uso, sino un clasificador que traduce entradas no estructuradas a decisiones estructuradas. Se entrenó con la herramienta `finetune` de Laya sobre preguntas tipadas derivadas de los conjuntos de evaluación etiquetados del autor. Su relevancia es fundamentalmente didáctica: sirve para ilustrar el flujo completo de construcción de un modelo de decisión sobre un encoder moderno, no para cargas de producción.

Conviene subrayar que el propio autor lo describe como un modelo docente ("teaching model"), más pequeño y entrenado con muchos menos datos que Laya, y recomienda usar Laya para trabajo real. La licencia es Apache 2.0 y los pesos se distribuyen en safetensors.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Encoder transformer (ModernBERT-base) con cabeza de decisión de dos capas |
| Parámetros totales | 163.983.622 |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (heredada del encoder base; no especificada en la información) |
| Tipos de cuantización | No disponible |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Pipeline | text-classification |
| Modelo base | answerdotai/ModernBERT-base |
| Librería | laya |
| Tamaño del repositorio | 0,7 GB |
| Descargas | 14 |
| Likes | 0 |

## Arquitectura y entrenamiento

La arquitectura combina un encoder ModernBERT-base con una cabeza de decisión de dos capas. ModernBERT es una familia de encoders transformer modernizados que incorpora mejoras de eficiencia respecto a BERT clásico (atención con soporte de secuencias largas y kernels optimizados), aunque la información disponible no detalla la configuración exacta del encoder heredado. La cabeza de decisión transforma la representación del encoder en respuestas tipadas acompañadas de probabilidades calibradas, de modo que el modelo resuelve varias preguntas tipadas sobre un mismo estado en un solo forward pass.

El entrenamiento se realizó con la herramienta `finetune` del ecosistema Laya, sobre preguntas tipadas construidas a partir de los conjuntos de evaluación etiquetados del autor. No se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset, ni si hubo etapas de RLHF, DPO u otra optimización por preferencias. Tampoco se documentan innovaciones técnicas adicionales más allá del esquema "System One" de decisión tipada en un único paso.

## Capacidades

- Clasificación de texto con salida estructurada: devuelve respuestas tipadas a preguntas tipadas sobre un estado de entrada.
- Probabilidades calibradas por respuesta, lo que permite umbralizar decisiones y ordenar alternativas.
- Resolución de múltiples preguntas en un único forward pass, sin generación autoregresiva.
- Procesamiento de entradas no estructuradas: mensajes, tickets de soporte, correos electrónicos.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- Capacidades multilingües: no disponibles en la información proporcionada.
- Modo "thinking", visión o audio: no disponibles.

## Casos de uso

- Triaje de tickets de soporte: dado el texto de un ticket, el modelo responde a preguntas tipadas como categoría, urgencia o necesidad de escalado, con probabilidad asociada para priorizar la cola de atención.
- Enrutamiento de correo entrante: clasificar cada mensaje según departamento destino y tipo de solicitud en un solo forward pass, integrándolo en un pipeline de ingesta previo a un sistema de gestión.
- Moderación de contenido ligera: evaluar mensajes de una comunidad contra preguntas tipadas de política (spam, toxicidad, fuera de tema) y aplicar umbrales sobre las probabilidades calibradas.
- Etiquetado asistido para anotación humana: predecir etiquetas sobre grandes volúmenes de texto y presentar al anotador solo los casos de baja confianza, reduciendo el coste de revisión.
- Filtrado previo en pipelines RAG: decidir si una consulta del usuario requiere recuperación documental o puede responderse directamente, actuando como clasificador de intención de bajo coste.
- Material didáctico y experimentación: reproducir el flujo de construcción de un modelo de decisión sobre ModernBERT en cursos y talleres, comparando el efecto del tamaño del dataset y de la cabeza de decisión.
- Evaluación de calidad de formularios: comprobar si un formulario o solicitud contiene la información requerida respondiendo a preguntas tipadas de completitud.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en fp16 para los 164 millones de parámetros, más el coste de activaciones según la longitud de secuencia; en fp32, en torno a 0,7 GB solo para pesos.
- GPU recomendadas: cualquier GPU consumer moderna es suficiente; una RTX 3060, RTX 4060 o RTX 4090 cubren el modelo con holgura. En servidor, A100 o H100 no aportan ventaja para este tamaño salvo por agregación de peticiones.
- Cabe en GPU consumer: sí, en la práctica totalidad de tarjetas con al menos 2 GB de VRAM, e incluso en CPU para volúmenes moderados.
- Opciones de despliegue: la librería `laya` es la vía documentada (`laya.Agent("kgptalkie/mini-laya")`). Al estar construido sobre ModernBERT-base, es plausible exportarlo o servirlo con frameworks de transformers, pero la información disponible solo documenta el uso mediante `laya`; no se confirman integraciones con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Mini Laya | 163.983.622 | No disponible | Clasificación con respuestas tipadas | Apache 2.0 | Hugging Face (14 descargas) |
| answerdotai/ModernBERT-base | No disponible en la información | No disponible en la información | Encoder de propósito general | No disponible en la información | Hugging Face |
| Laya (modelo de referencia del autor) | No disponible | No disponible | Decisión tipada | No disponible | No disponible en la información |

No se dispone de datos de benchmarks que permitan comparar el rendimiento de Mini Laya con alternativas de la misma categoría.

## Limitaciones y advertencias

- Modelo docente: el autor lo describe explícitamente como un modelo de enseñanza, más pequeño y con muchos menos datos que Laya, y recomienda usar Laya para trabajo real.
- Riesgo de calibración deficiente: las probabilidades se presentan como calibradas, pero no se documenta el procedimiento de calibración ni métricas de fiabilidad.
- Sesgos: no se documentan análisis de sesgo; al derivarse de conjuntos de evaluación etiquetados por el autor, puede heredar los sesgos de esos datos.
- Riesgo de alucinación: al ser un clasificador con salida tipada, el riesgo se traslada a respuestas tipadas incorrectas con alta confianza, especialmente en dominios alejados de los datos de entrenamiento.
- Idiomas: no se especifican los idiomas soportados, por lo que no debe asumirse cobertura multilingüe.
- Contexto: la longitud máxima de entrada no está documentada; conviene verificarla antes de usarlo con textos largos.
- Licencia Apache 2.0: permite uso comercial y modificación, pero el modelo se distribuye sin garantías y sin compromiso de mantenimiento.
- Madurez: 14 descargas y 0 likes en el momento de la consulta; no hay evidencia de uso en producción ni de validación externa.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/kgptalkie/mini-laya
- Modelo base: https://huggingface.co/answerdotai/ModernBERT-base
