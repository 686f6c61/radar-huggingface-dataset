# bratao/PortugueseT5-Instruct

## Resumen

`PortugueseT5-Instruct` es un checkpoint intermedio de la línea de investigación PortugueseT5, desarrollado por Bruno Souza Cabral en el marco de su tesis doctoral en la Universidade Federal da Bahia (UFBA). Se trata de un modelo T5 encoder-decoder de aproximadamente 783 millones de parámetros, ajustado mediante instrucciones (instruction-tuning) sobre unos tres millones de pares pregunta-respuesta en portugués derivados de Wikipedia, proporcionados por un socio del proyecto. Su propósito declarado es servir como paso previo al ajuste fino orientado a tareas específicas, como la extracción abierta de información (OpenIE), y no como un modelo de producción.

Este artefacto se publica como un checkpoint experimental: el estado del entrenador registra únicamente el paso 2.000 de un programa nominal de 1.291.623 pasos (tres épocas), lo que equivale a una época aproximada de 0,00465. No se han publicado métricas de evaluación fiables para este punto exacto del entrenamiento, ni una plantilla de prompt canónica, por lo que debe tratarse con cautela en cualquier uso práctico. Su relevancia actual radica en ser un punto de referencia para investigaciones sobre instruction-tuning en portugués y como base para futuros ajustes en tareas concretas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | T5 encoder-decoder (transformer) |
| Parametros totales | 783.150.080 (~783M; la tesis redondea a 770M) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible (no especificada en la documentacion publica) |
| Tipos de cuantizacion | float32 (sin cuantizaciones publicadas) |
| Idiomas soportados | Portugues (pt) |
| Licencia | No declarada |
| Formato de pesos | safetensors (float32) |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura T5 original: un transformer encoder-decoder con atención completa, diseñado para tareas de texto a texto. No incorpora innovaciones arquitectónicas adicionales documentadas, como atención lineal o decodificación especulativa. La etapa de entrenamiento corresponde a un ajuste supervisado por instrucciones sobre aproximadamente tres millones de pares pregunta-respuesta en portugués, generados a partir de artículos de Wikipedia y proporcionados por un socio del proyecto. No se ha publicado el dataset concreto ni se identifica un identificador de dataset en Hugging Face, lo que limita la reproducibilidad y el análisis de sesgos.

El estado del entrenador publicado refleja solo el paso 2.000 de un programa nominal de 1.291.623 pasos (tres épocas), sin métrica ni mejor checkpoint registrados. Esto indica que el entrenamiento estaba en una fase muy temprana cuando se guardó el estado, y no hay evidencia de que se completara. No se menciona el uso de RLHF, DPO u otras técnicas de alineación; el ajuste es puramente supervisado. El modelo se publica en precisión float32, ocupando aproximadamente 3,13 GB en el repositorio.

## Capacidades

- Generación de texto condicionada en portugués, siguiendo el paradigma texto a texto de T5.
- Respuesta a instrucciones en portugués, gracias al ajuste con pares pregunta-respuesta.
- Soporte de tareas de secuencia a secuencia, como resumen, traducción o extracción de información, aunque sin validación pública para este checkpoint.
- No se documenta soporte para tool calling, function calling, agentes, razonamiento multi-paso, visión, audio ni modos de pensamiento explícitos.
- Capacidad multilingüe: limitada al portugués (el modelo base T5 puede tener capacidades multilingües, pero este ajuste está centrado exclusivamente en portugués).
- No es un modelo de extracción abierta de información (OpenIE) ni está registrado en el proyecto `portuguese-openie`.

## Casos de uso

- Investigación sobre instruction-tuning en portugués: el modelo permite estudiar el efecto de un ajuste temprano con datos QA en el comportamiento de un T5 de 783M de parámetros, comparando con el modelo base sin ajuste.
- Punto de partida para fine-tuning en tareas específicas: dado que es un checkpoint intermedio, puede servir como inicialización para entrenar modelos orientados a OpenIE u otras tareas de generación en portugués, como se describe en la tesis.
- Experimentación con plantillas de prompt en portugués: al no existir una plantilla canónica, se puede investigar qué formatos de instrucción producen mejores respuestas, aunque sin garantías de calidad.
- Análisis de sesgos y alucinaciones en modelos de lenguaje para portugués: al ser un artefacto de investigación, permite estudiar los fallos de un modelo entrenado con datos limitados y no validados.
- Prototipado de asistentes conversacionales en portugués con fines académicos: siempre que se valide el comportamiento en el dominio concreto y se asuma el riesgo de respuestas incorrectas.
- Evaluación comparativa de arquitecturas T5 frente a otros modelos para portugués, como PTT5, en tareas de generación condicionada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card advierte explícitamente que no existe ninguna métrica de tarea fiable para este checkpoint exacto y que las puntuaciones de checkpoints posteriores (como `PortugueseT5OieAbstractive`) no deben atribuirse a este modelo intermedio.

## Requisitos de hardware

- Los pesos en float32 ocupan aproximadamente 3,13 GB; se recomienda disponer de 6–8 GB de RAM o VRAM como punto de partida práctico, dependiendo de la longitud de las secuencias de entrada.
- GPU recomendada para una inferencia fluida, aunque la inferencia en CPU es posible. No se especifican modelos concretos de GPU.
- Con 6–8 GB de VRAM, el modelo puede ejecutarse en GPUs de consumo como una NVIDIA RTX 3060 (12 GB) o RTX 4060 (8 GB), asumiendo que la memoria adicional para activaciones y el tokenizador no excedan el límite.
- Opciones de despliegue: compatible con la librería Transformers de Hugging Face; los tags del repositorio mencionan `text-generation-inference` y `endpoints_compatible`, aunque no hay documentación oficial que confirme su funcionamiento en vLLM o TGI.
- Latencia y throughput: no disponibles, al no publicarse mediciones.

## Comparativa con modelos similares

No se dispone de datos cuantitativos suficientes para una comparativa rigurosa. Como referencia cualitativa, se puede mencionar:

- `unicamp-dl/PTT5`: modelo T5 preentrenado en portugués brasileño a partir del corpus BrWac, sin ajuste por instrucciones. Su tamaño de parámetros no se ha especificado en la información disponible, por lo que no es posible comparar directamente.
- `bratao/portugueseT5`: modelo base predecesor de este checkpoint, del que deriva el ajuste por instrucciones. No se han publicado especificaciones detalladas en la información disponible.

Dado que no hay métricas públicas ni especificaciones completas de estos modelos comparables, se indica que la comparativa detallada no está disponible.

## Limitaciones y advertencias

- No existe una plantilla de prompt canónica documentada; el ejemplo de uso en la model card es ilustrativo y no constituye un formato validado.
- Los datos de entrenamiento (pares QA en portugués) no son públicos ni inspeccionables desde el repositorio, lo que impide verificar su composición y analizar sesgos.
- El checkpoint es un artefacto experimental con un entrenamiento muy temprano (paso 2.000 de 1.291.623); no representa un modelo completamente entrenado.
- No se han publicado métricas de evaluación fiables para este modelo; cualquier afirmación sobre su rendimiento carece de respaldo.
- El modelo puede generar contenido incorrecto, alucinado, sesgado o inseguro, como se advierte en la model card.
- La licencia no está declarada; la ausencia de licencia no otorga permiso para redistribuir o modificar los pesos. Se debe consultar al autor y considerar los términos de los pesos predecesores y los datos.
- No debe tratarse como un modelo de OpenIE ni como una autoridad factual.
- El soporte de idiomas se limita al portugués; no se garantiza un comportamiento adecuado en otros idiomas.

## Enlaces

- Repositorio del modelo: https://huggingface.co/bratao/PortugueseT5-Instruct
- Modelo base predecesor: https://huggingface.co/bratao/portugueseT5
- Proyecto Portuguese-OpenIE: https://github.com/FORMAS/Portuguese-OpenIE
- Artículo PortNOIE (PROPOR 2022): https://doi.org/10.1007/978-3-030-98305-5_23
- Referencia PTT5 (modelo T5 para portugués): https://github.com/unicamp-dl/PTT5
