# pianobob/Qwen3.5-2B-Base-MED-ChatVector

## Resumen

Qwen3.5-2B-Base-MED-ChatVector es un modelo publicado en Hugging Face por el usuario pianobob bajo el identificador `pianobob/Qwen3.5-2B-Base-MED-ChatVector`. Por el nombre y las etiquetas del repositorio, se trata de un derivado del modelo base Qwen3.5 de 2B parámetros, aparentemente adaptado al dominio médico ("MED") y con algún tipo de modificación orientada a conversación ("ChatVector"). El pipeline declarado es `image-text-to-text`, lo que sugiere capacidades multimodales de entrada imagen y texto, aunque no hay documentación que lo confirme.

El repositorio cuenta con 2.213.241.664 parámetros en formato safetensors (aproximadamente 2,2 mil millones) y un tamaño de 4,4 GB, coherente con pesos en precisión de 16 bits. La model card es la plantilla automática de Hugging Face sin cumplimentar: no incluye información sobre desarrollador, datos de entrenamiento, licencia, idiomas ni evaluación. Se desconoce igualmente el proceso de ajuste aplicado para llegar desde el modelo base hasta esta variante.

La relevancia de esta ficha es limitada pero informativa: documenta un modelo derivado de escasa difusión (0 descargas y 0 likes en el momento de la consulta) y sirve como advertencia sobre la importancia de verificar la procedencia y la licencia antes de reutilizar pesos publicados sin documentación. Cualquier uso en producción debería ir precedido de una evaluación propia, dado que no existen garantías documentadas sobre el comportamiento del modelo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | transformer (familia Qwen3.5, segun el identificador del repositorio); detalles no disponibles |
| Parametros totales | 2.213.241.664 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (solo se publican pesos safetensors; no hay GGUF en el repo) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

No hay información publicada sobre la arquitectura interna más allá de la etiqueta `qwen3_5` y la librería `transformers`. Por el identificador se infiere que deriva de un modelo base Qwen3.5 de 2B parámetros, presumiblemente un transformer decoder-only, pero no se documenta el número de capas, dimensiones ocultas, mecanismo de atención ni si incorpora innovaciones como atención lineal o decodificación especulativa.

Tampoco se documentan los datos de entrenamiento, el número de tokens, la composición del dataset, ni si hubo etapas de ajuste supervisado, RLHF o DPO. El sufijo "MED" sugiere un ajuste orientado a dominio médico y "ChatVector" apunta a una técnica de edición de pesos por combinación de vectores de tarea, pero ninguna de estas hipótesis está confirmada en la model card. El pipeline `image-text-to-text` indica que el modelo podría aceptar entradas de imagen, aunque sin documentación sobre el codificador visual ni los datos multimodales empleados.

## Capacidades

- Generación de texto conversacional: el pipeline declarado es `conversational`, lo que indica que el modelo está pensado para diálogo multi-turno.
- Entrada multimodal imagen-texto: la etiqueta `image-text-to-text` sugiere procesamiento conjunto de imágenes y texto, sin documentación sobre resolución, número de imágenes o formato de entrada.
- Dominio médico: el sufijo "MED" indica una especialización declarada en contenido sanitario, no verificada ni evaluada públicamente.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible.
- Modo thinking, visión avanzada o audio: no disponible.

## Casos de uso

- Prototipado de asistentes clínicos experimentales: el modelo podría emplearse para generar borradores de respuestas a preguntas frecuentes de pacientes, siempre con revisión humana y sin uso diagnóstico, dado que no hay evaluación clínica publicada.
- Extracción de información de informes médicos con imagen: si la capacidad `image-text-to-text` es funcional, podría procesar capturas de analíticas o informes para resumir valores, aunque la ausencia de documentación obliga a validar cada salida.
- Investigación sobre edición de pesos: el nombre "ChatVector" lo hace útil como objeto de estudio para reproducir técnicas de combinación de vectores de tarea sobre un modelo base de 2B.
- Generación de documentación sanitaria divulgativa: redacción de material educativo para pacientes a partir de textos técnicos, con revisión por personal sanitario.
- Clasificación y etiquetado de texto clínico en pipelines de investigación: uso como componente de un sistema mayor para categorizar notas o resúmenes, previa evaluación en el corpus concreto.
- Base para fine-tuning posterior: al ser un modelo de 2B parámetros y 4,4 GB, puede ajustarse en una única GPU de gama alta para tareas específicas del dominio sanitario.
- Experimentación con modelos pequeños multimodales: útil en entornos académicos para comparar el comportamiento de derivados no documentados frente a modelos oficiales de la misma familia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16/BF16: en torno a 4,5-5 GB solo para pesos, más overhead de activaciones y caché KV; presupuesto práctico de 6-8 GB.
- VRAM estimada en cuantización de 8 bits: aproximadamente 2,5-3 GB de pesos.
- VRAM estimada en cuantización de 4 bits: aproximadamente 1,5-2 GB de pesos, si se generan pesos GGUF o AWQ a partir de los safetensors (no se distribuyen en el repositorio).
- GPU recomendadas: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4090, A100 o H100 para despliegues con concurrencia.
- Cabe en GPU de consumo: sí, en cualquier GPU con 8 GB o más en FP16, y en GPUs de 4-6 GB con cuantización.
- Opciones de despliegue: transformers (librería declarada), vLLM y TGI previa conversión o verificación de compatibilidad, llama.cpp/Ollama solo si se generan pesos GGUF.
- Latencia y throughput: no disponibles; no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| pianobob/Qwen3.5-2B-Base-MED-ChatVector | 2,21 B | no disponible | no disponible | Hugging Face, sin documentación |
| Qwen3.5-2B (modelo base oficial de la familia) | ~2 B (por confirmar) | no disponible | no disponible | Hugging Face, presumiblemente documentado por el autor original |
| Gemma 3 1B / 4B | 1 B / 4 B | no disponible | no disponible | Hugging Face, con model card oficial |
| Llama 3.2 1B / 3B | 1 B / 3 B | no disponible | no disponible | Hugging Face, con model card oficial |

La comparación cuantitativa con alternativas no es posible: no se han publicado benchmarks de este modelo ni se dispone de datos verificados de contexto, licencia o rendimiento de las alternativas en la información proporcionada. La diferencia principal frente a los modelos oficiales es la ausencia total de documentación y de garantías de procedencia.

## Limitaciones y advertencias

- Model card vacía: no hay información sobre desarrollador, datos de entrenamiento, evaluación ni uso previsto; cualquier afirmación sobre su comportamiento es especulativa.
- Licencia no disponible: no se puede determinar si el uso comercial está permitido; reutilizar los pesos en producción sin aclarar la licencia conlleva riesgo legal, especialmente si el modelo base original impone restricciones.
- Procedencia del ajuste desconocida: no se documenta qué técnica se aplicó para obtener la variante "MED" ni "ChatVector", lo que impide auditar posibles contaminaciones de datos o sesgos introducidos.
- Riesgo de alucinación elevado en dominio médico: sin evaluación clínica publicada, las salidas no deben usarse para decisiones diagnósticas o terapéuticas.
- Idiomas no declarados: no se puede asegurar un rendimiento adecuado en castellano ni en otros idiomas distintos del inglés.
- Capacidad multimodal no verificada: la etiqueta `image-text-to-text` podría no corresponder a una funcionalidad real del modelo.
- Sin señales de adopción: 0 descargas y 0 likes en el momento de la consulta, lo que reduce la probabilidad de que existan informes independientes de uso o fallos conocidos.
- Fecha de creación futura en los metadatos (2026-11-25), lo que sugiere posibles inconsistencias en el registro del repositorio.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/pianobob/Qwen3.5-2B-Base-MED-ChatVector
- Paper citado en la model card (Lacoste et al., 2019, sobre impacto ambiental): https://arxiv.org/abs/1910.09700
- Calculadora de impacto ambiental ML: https://mlco2.github.io/impact#compute
