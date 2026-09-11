# sasoricfa/jeanne-dioula-v2

## Resumen

jeanne-dioula-v2 es un ajuste fino por supervisión (SFT) del modelo deepseek-ai/DeepSeek-R1-Distill-Qwen-7B, publicado por el usuario sasoricfa en Hugging Face. Se trata por tanto de un derivado de un modelo destilado de razonamiento de DeepSeek, que a su vez parte de la arquitectura Qwen de 7.000 millones de parámetros. El entrenamiento se ha realizado con la librería TRL (versión 1.13.0), tal y como indica la model card, y los pesos se distribuyen en formato safetensors bajo la librería transformers.

La relevancia de esta publicación es limitada y de carácter experimental: el repositorio acumula cero descargas y cero "likes" en el momento de la consulta, no incluye información sobre el dataset de entrenamiento, no declara idiomas soportados y no concreta la licencia (la model card únicamente incluye la etiqueta genérica `licence: license`). Tampoco se publican resultados de benchmarks ni detalles del procedimiento de ajuste más allá del marco utilizado.

Un dato técnico que conviene señalar es la discrepancia entre el tamaño del repositorio (0,3 GB) y el tamaño esperado de un modelo denso de 7.000 millones de parámetros en precisión de 16 bits (del orden de 14-15 GB). Esa diferencia sugiere que el repositorio podría contener únicamente adaptadores (por ejemplo, LoRA) o un subconjunto incompleto de los pesos, aunque los tags declaran `safetensors` sin especificar naturaleza de adaptador. Esta circunstancia no está aclarada en la documentación disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible en la model card; el modelo base es un transformer decoder-only denso (familia Qwen) |
| Parametros totales | No disponible en la model card; el nombre del modelo base indica 7B |
| Parametros activos | No aplica (el modelo base es denso, no MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (el repositorio solo publica safetensors) |
| Idiomas soportados | No disponible |
| Licencia | No disponible (la model card indica `licence: license` sin especificar términos) |
| Formato de pesos | safetensors |
| Libreria | transformers |
| Modelo base | deepseek-ai/DeepSeek-R1-Distill-Qwen-7B |
| Metodo de entrenamiento | SFT (supervised fine-tuning) con TRL 1.13.0 |
| Tamano del repositorio | 0,3 GB |
| Fecha de creacion | 2026-09-10 (segun metadatos de Hugging Face) |
| Fecha de actualizacion | 2026-09-10 |

## Arquitectura y entrenamiento

La model card no describe la arquitectura interna del modelo. Por herencia del modelo base declarado (deepseek-ai/DeepSeek-R1-Distill-Qwen-7B), se trata de un transformer decoder-only denso de aproximadamente 7.000 millones de parámetros, resultado de destilar capacidades de razonamiento del modelo DeepSeek-R1 sobre una base de la familia Qwen. No se especifica en el repositorio si se ha modificado la arquitectura, la configuración de atención, la ventana de contexto ni el tokenizador respecto al modelo original.

En cuanto al entrenamiento, la única información aportada es que se ha empleado SFT mediante TRL 1.13.0, con Transformers 5.17.0, PyTorch 2.10.0+cu128, Datasets 5.0.1 y Tokenizers 0.23.2. No se indica el número de tokens de entrenamiento, la composición del dataset, si hubo fases posteriores de DPO/RLHF, hiperparámetros, ni la estrategia de ajuste (full fine-tuning frente a adaptadores de bajo rango). Esta ausencia de detalle impide reproducir el entrenamiento o evaluar su calidad de forma objetiva.

## Capacidades

La model card no documenta capacidades específicas. A continuación se enumeran las capacidades esperables por herencia del modelo base, marcadas expresamente como no verificadas en la documentación del repositorio:

- Generación de texto conversacional multi-turno, dado que el ejemplo de uso emplea una lista de mensajes con roles (`user`).
- Razonamiento paso a paso y modo de "pensamiento" largo, característico de los modelos destilados de DeepSeek-R1; no confirmado en la model card.
- Resolución de problemas matemáticos y tareas de lógica, esperable por el linaje R1; no confirmado.
- Generación y comprensión de código, esperable por la base Qwen y el entrenamiento de razonamiento; no confirmado.
- Capacidades multilingües: no disponibles. No se declara ningún idioma en la ficha, por lo que no puede afirmarse soporte de castellano ni de otras lenguas.
- Soporte de tool calling / function calling: no disponible. No se menciona plantilla de herramientas ni formato de llamadas.
- Soporte de agentes y razonamiento multi-paso con herramientas: no disponible.
- Capacidades de visión o audio: no disponibles, no se declaran.
- Modo de pensamiento (`thinking mode`) explícito, con separación entre cadena de razonamiento y respuesta final: no documentado en este repositorio.

## Casos de uso

Dado que no hay documentación funcional, benchmarks ni declaración de idiomas, los casos de uso solo pueden plantearse como escenarios hipotéticos sujetos a validación previa:

- Experimentación académica con destilación de razonamiento: el modelo puede servir para estudiar cómo un ajuste SFT adicional sobre un destilado de R1 altera el comportamiento de la cadena de razonamiento, comparándolo con el modelo base sobre el mismo conjunto de prompts. Requiere evaluación propia, ya que no hay métricas publicadas.
- Prototipado interno de asistentes conversacionales: el ejemplo de la model card muestra uso con `pipeline("text-generation")` y una lista de mensajes, por lo que puede integrarse rápidamente en prototipos de chat de un solo turno o pocos turnos, siempre con validación manual de las respuestas.
- Generación de explicaciones paso a paso para materiales educativos: si el destilado de R1 conserva el comportamiento de razonamiento, podría emplearse para producir resoluciones detalladas de problemas de matemáticas o física; es imprescindible la revisión humana dado el riesgo de alucinación.
- Ajuste posterior específico de dominio (fine-tuning sobre este fine-tuning): al ser un modelo pequeño en formato transformers, puede usarse como punto de partida para tareas concretas con datasets propios, aprovechando el coste reducido de iteración frente a modelos de mayor tamaño.
- Evaluación comparativa de ajustes comunitarios: útil como caso de estudio dentro de una batería de pruebas que mida si un SFT sin documentación degrada o mejora al modelo base en tareas de razonamiento.
- Investigación sobre sesgos y seguridad en destilados de razonamiento: permite analizar cómo un corpus SFT no documentado puede introducir o amplificar sesgos respecto al modelo original.
- Despliegue en entornos con recursos limitados: un modelo de 7B cuantizado a 4 bits ocupa del orden de 4-5 GB, lo que permite ejecutarlo en una GPU de consumo; ahora bien, la viabilidad real depende de que el repositorio contenga pesos completos y no solo adaptadores, cuestión no aclarada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

La model card de sasoricfa/jeanne-dioula-v2 no incluye ninguna tabla de evaluación, y los resultados de búsqueda web obtenidos no guardan relación con el modelo (corresponden a contenidos de agencias de viajes), por lo que no aportan datos utilizables.

## Requisitos de hardware

Las siguientes cifras son estimaciones para un modelo denso de 7.000 millones de parámetros y no están confirmadas por el autor:

- VRAM estimada para inferencia (solo pesos): ~14-15 GB en FP16/BF16, ~8 GB en INT8, ~4-5 GB en cuantización de 4 bits (GPTQ, AWQ o GGUF Q4), ~3 GB en 2-3 bits.
- VRAM adicional para caché KV: variable según longitud de contexto y tamaño de lote; con contextos largos puede superar los pesos del modelo en memoria.
- GPU recomendadas para FP16: NVIDIA A100 40/80 GB, H100, L40S, o dos GPU de 24 GB con reparto de tensores.
- GPU de consumo: viable en RTX 4090 / RTX 3090 (24 GB) en FP16 con contexto moderado, y en RTX 4070 Ti, RTX 3080 o RTX 3060 de 12 GB únicamente con cuantización de 4 bits y contexto reducido.
- Opciones de despliegue: transformers (soporte nativo declarado), vLLM y SGLang para servicio con alto throughput, TGI para despliegue gestionado, llama.cpp/Ollama si se convierte previamente a GGUF (el repositorio no incluye pesos GGUF).
- Antes de planificar el despliegue debe verificarse el contenido real del repositorio: 0,3 GB es insuficiente para pesos completos en FP16, lo que apunta a adaptadores o a una subida incompleta.
- Latencia y throughput: no disponibles. No se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Benchmarks publicados |
|---|---|---|---|---|---|
| sasoricfa/jeanne-dioula-v2 | No disponible (base 7B) | No disponible | No disponible | Hugging Face, 0 descargas | No |
| deepseek-ai/DeepSeek-R1-Distill-Qwen-7B (modelo base) | ~7B | No disponible en esta ficha | No disponible en esta ficha | Hugging Face, ampliamente utilizado | Si, en su model card original |
| Otros ajustes SFT de la misma base | ~7B | No disponible | Variable | Hugging Face | Habitualmente no |

No se dispone de datos suficientes para establecer una comparación cuantitativa de rendimiento. La comparación con el modelo base es la referencia natural, pero para ello sería necesario ejecutar evaluaciones propias, ya que jeanne-dioula-v2 no publica ninguna métrica.

## Limitaciones y advertencias

- Ausencia total de documentación sobre el dataset de entrenamiento: no puede evaluarse la calidad, la licencia ni la procedencia de los datos usados en el SFT.
- Licencia sin especificar: la model card solo indica `licence: license`. No hay autorización explícita de uso comercial, por lo que no debe desplegarse en producción sin aclarar este punto con el autor.
- Riesgo de alucinación: no se han publicado evaluaciones de fidelidad ni de tasas de error. En modelos de razonamiento destilados, la generación de cadenas de pensamiento verosímiles pero incorrectas es un riesgo conocido.
- Idiomas no declarados: no puede asumirse un rendimiento aceptable en castellano ni en ninguna otra lengua concreta.
- Longitud de contexto no declarada: planificar aplicaciones con ventanas largas es arriesgado sin verificación empírica.
- Discrepancia en el tamaño del repositorio: 0,3 GB frente a los ~14-15 GB esperables para 7B en FP16. Es probable que solo contenga adaptadores o que la subida esté incompleta; conviene inspeccionar el listado de archivos antes de cualquier uso.
- Sin soporte declarado de tool calling ni de flujos de agente: no debe asumirse compatibilidad con plantillas de herramientas sin pruebas.
- Sin comunidad ni mantenimiento: cero descargas y cero "likes" implican ausencia de validación por terceros, de issues resueltos y de soporte.
- Metadatos anómalos: la fecha de creación indicada (2026-09-10) es posterior a la fecha habitual de publicación de este tipo de modelos, lo que sugiere un posible error en los metadatos y refuerza la necesidad de tratar la ficha con cautela.
- Sesgos: no evaluados. Al desconocerse el corpus de ajuste, no puede descartarse la introducción de sesgos específicos respecto al modelo base.
- Recomendación general: tratar este modelo como experimental y no apto para producción sin una batería de evaluación propia y una aclaración formal de la licencia.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/sasoricfa/jeanne-dioula-v2
- Modelo base: https://huggingface.co/deepseek-ai/DeepSeek-R1-Distill-Qwen-7B
- Repositorio de TRL (marco de entrenamiento citado en la model card): https://github.com/huggingface/trl

Nota: los resultados de búsqueda web recibidos no contienen enlaces relevantes al modelo, a su paper ni a demos; corresponden a páginas de agencias de viajes sin relación con el contenido solicitado.
