# mamelles/LFM2.5-8B-A1B-Wolof-CPT

## Resumen

LFM2.5-8B-A1B-Wolof-CPT es un artefacto de ajuste mediante preentrenamiento continuado (continual pretraining, CPT) construido sobre el modelo base LiquidAI/LFM2.5-8B-A1B-Base y publicado por el usuario mamelles en Hugging Face. El objetivo declarado en su model card es la adaptación al wolof, una lengua níger-congolesa hablada principalmente en Senegal, Gambia y Mauritania, con escasa representación en los corpus de entrenamiento de los grandes modelos de lenguaje. El propio autor lo describe como un "artefacto privado de producción", en estado experimental y no destinado a publicación pública.

En términos de tamaño, los pesos safetensors publicados suman 8.476.048.832 parámetros (unos 8,48 mil millones) y el repositorio ocupa 17,0 GB. La etiqueta `lfm2_moe` y la nomenclatura del nombre ("8B-A1B") indican una arquitectura de mezcla de expertos (MoE) con aproximadamente 1.000 millones de parámetros activos por token, aunque este dato no se confirma de forma explícita en la documentación disponible. La librería declarada es `transformers` y la tarea es `text-generation`, con la etiqueta adicional `conversational`.

Su interés es doble. Por un lado, sirve como caso de estudio de adaptación de un modelo MoE moderno a una lengua de bajos recursos, un escenario donde la mayoría de los modelos disponibles rinden de forma deficiente. Por otro, ilustra un patrón frecuente en investigación aplicada: artefactos internos que se publican con métricas incompletas, sin licencia declarada y sin validación exhaustiva. En la información proporcionada no constan licencia, lista de idiomas soportados, longitud de contexto ni resultados de benchmarks.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mezcla de expertos (MoE) según la etiqueta `lfm2_moe`; detalles internos no disponibles |
| Parametros totales | 8.476.048.832 (~8,48 B) según los safetensors publicados |
| Parametros activos | ~1 B según la nomenclatura "A1B" del nombre; no confirmado en la documentación |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el repositorio solo publica safetensors en precisión completa) |
| Idiomas soportados | wolof como lengua objetivo del CPT; lista oficial de idiomas no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (repo de 17,0 GB, compatible con `transformers`) |
| Familia de tokenizer | `128k-ext` |
| Modelo base | LiquidAI/LFM2.5-8B-A1B-Base |
| Etapa de entrenamiento | CPT (preentrenamiento continuado) con datos de instrucción reponderados |

## Arquitectura y entrenamiento

La información arquitectónica disponible se limita a la etiqueta `lfm2_moe`, que sitúa al modelo en la familia LFM2 de Liquid AI con una arquitectura de mezcla de expertos, y a la indicación de que el tokenizer pertenece a la familia `128k-ext`. No se documentan el número de expertos, el mecanismo de enrutamiento, la proporción de capas de atención frente a capas convolucionales, la dimensionalidad oculta ni la estrategia de atención. Tampoco se especifica la longitud de contexto soportada, un dato especialmente relevante en modelos MoE de este tamaño.

El entrenamiento corresponde a una etapa de CPT sobre `LiquidAI/LFM2.5-8B-A1B-Base`, empleando el "protocolo de corpus wolof limpio" mencionado en la model card. Los datos de instrucción fueron reponderados y excluyen el split de test del Hub de origen, aunque el propio autor advierte que ejemplos similares a los de benchmarks podrían haber estado presentes en el preentrenamiento previo, lo que impide descartar contaminación. No se indica el volumen de tokens utilizados, la composición del dataset, ni si hubo etapas de RLHF, DPO u otro tipo de alineación. La model card señala explícitamente que la BPB (bits por byte) de esta familia de tokenizer no debe compararse como perplejidad con la familia de 65k.

## Capacidades

- Generación de texto autoregresiva en la tarea `text-generation`, con etiqueta `conversational` que sugiere uso en diálogo multi-turno.
- Adaptación al wolof mediante preentrenamiento continuado, orientada a mejorar la competencia del modelo base en esa lengua.
- Capacidad declarada de uso con `transformers` y compatibilidad con `endpoints_compatible` en Hugging Face.
- Soporte de tool calling o function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible; la model card indica que el razonamiento no ha sido validado de forma exhaustiva.
- Capacidades multilingües: no disponible; solo se declara el wolof como lengua objetivo, sin lista de idiomas secundarios.
- Capacidades especiales (modo thinking, visión, audio): no disponible.
- Manejo de cambio de código (code-switching): mencionado como no validado.

## Casos de uso

- Investigación en adaptación de lenguas de bajos recursos: el modelo permite estudiar hasta qué punto el CPT sobre un corpus limpio de wolof mejora el rendimiento del modelo base en esa lengua, comparando ambas variantes con el mismo tokenizer.
- Evaluación de estrategias de reponderación de datos de instrucción: la model card indica que los datos de instrucción fueron reponderados y excluyen el split de test original, lo que convierte al artefacto en un caso útil para analizar el efecto de esas decisiones metodológicas.
- Generación y normalización de corpus en wolof: uso del modelo para producir texto sintético o normalizar grafías variables, siempre con revisión posterior de hablantes nativos, dado que la ortografía del wolof no está validada.
- Traducción asistida wolof-francés o wolof-inglés: aplicable como primer paso en flujos de traducción con revisión humana, teniendo en cuenta que la factualidad y la fidelidad no han sido evaluadas.
- Preprocesamiento para pipelines de voz: generación de transcripciones normalizadas o de pares texto-audio para entrenar sistemas ASR/TTS en wolof, aprovechando que el modelo está especializado en esa lengua.
- Etiquetado y clasificación de textos en wolof: uso como componente de anotación automática en tareas de análisis de sentimiento, detección de temas o filtrado de contenido, con métricas de validación propias.
- Evaluación de seguridad y sesgos antes de un despliegue: el modelo sirve como sujeto de pruebas para medir comportamientos indeseados en una lengua de bajos recursos, un área que el autor reconoce como no validada.
- Prototipado de asistentes conversacionales en wolof: la etiqueta `conversational` permite experimentar con diálogo multi-turno, aunque la ausencia de datos sobre contexto máximo limita el diseño de aplicaciones con historiales largos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica que las métricas medidas se encuentran en un fichero `metrics.json` que no forma parte de la información proporcionada, y advierte de forma explícita que la ausencia de una métrica no debe interpretarse como un resultado positivo ni inferirse a partir de otras.

## Requisitos de hardware

- VRAM estimada para los pesos, calculada a partir de los 8.476.048.832 parámetros declarados:

| Precisión | Peso aproximado en memoria |
|---|---|
| bf16 / fp16 | ~17 GB |
| int8 | ~8,5 GB |
| 4 bits | ~4,5 GB |

- Al ser un modelo MoE, todos los expertos deben residir en memoria, por lo que el consumo de VRAM corresponde al total de 8,48 B de parámetros y no al de los ~1 B activos. El coste de cómputo por token, en cambio, es previsiblemente más cercano al de un modelo denso de 1 B.
- GPU recomendadas: A100 40 GB, H100 80 GB y L40S 48 GB para inferencia en bf16 sin cuantizar.
- GPU de consumo: una RTX 4090 o RTX 3090 con 24 GB puede alojar los pesos en bf16 (17 GB) dejando poco margen para la caché KV, y con holgura en cuantizaciones de 8 o 4 bits.
- Opciones de despliegue: `transformers` está declarado explícitamente. El soporte en vLLM, TGI, llama.cpp u Ollama no está confirmado en la información disponible y depende de que dichas herramientas reconozcan la arquitectura `lfm2_moe`; conviene verificarlo antes de planificar un despliegue.
- Latencia y throughput: no disponibles. No se han publicado mediciones para este artefacto.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| LFM2.5-8B-A1B-Wolof-CPT | 8,48 B totales / ~1 B activos | no disponible | no disponible | Público en Hugging Face, 0 descargas y 0 likes en el momento de la consulta |
| LiquidAI/LFM2.5-8B-A1B-Base | no disponible en la información proporcionada | no disponible | no disponible | Modelo base de referencia |
| Otras adaptaciones al wolof de tamaño comparable | no disponible | no disponible | no disponible | No identificadas en la información disponible |

No se dispone de datos de rendimiento que permitan una comparación cuantitativa con alternativas. La comparación más informativa posible con la información actual es la que enfrenta este artefacto con su propio modelo base, midiendo la ganancia atribuible al CPT en tareas de wolof.

## Limitaciones y advertencias

- Modelo experimental: la model card lo califica explícitamente como artefacto privado en desarrollo, no como una versión pública estable.
- Sin licencia declarada: no se especifican condiciones de uso comercial, redistribución ni modificación, lo que impide un uso en producción con garantías jurídicas.
- Validación incompleta: ortografía del wolof, cambio de código, factualidad, razonamiento, comportamiento en contextos largos y seguridad no han sido evaluados de forma exhaustiva.
- Revisión por hablantes nativos pendiente: el autor indica que es necesaria antes de cualquier uso más amplio.
- Riesgo de contaminación de benchmarks: aunque los datos de instrucción excluyen el split de test de origen, la model card advierte de que podrían existir ejemplos similares en el preentrenamiento previo.
- Riesgo de alucinación: no cuantificado, pero esperable en un modelo de 8,48 B adaptado a una lengua con pocos datos digitales.
- Longitud de contexto desconocida: la ausencia de este dato impide diseñar aplicaciones que dependan de ventanas largas.
- Comparaciones de perplejidad inválidas entre familias de tokenizer: la BPB de la familia `128k-ext` no debe compararse como perplejidad con la familia de 65k.
- Métricas ausentes: la ausencia de una métrica en `metrics.json` no debe interpretarse como un resultado favorable.
- Trazabilidad limitada: los datos brutos de entrenamiento no se incluyen en el repositorio, por lo que no es posible auditar la composición del corpus.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mamelles/LFM2.5-8B-A1B-Wolof-CPT
- Modelo base: https://huggingface.co/LiquidAI/LFM2.5-8B-A1B-Base
- Búsqueda web: los resultados recuperados no guardan relación con el modelo (contenido sobre herramientas de redimensionado de Canva), por lo que no se han podido incorporar enlaces adicionales a papers, blogs o repositorios.
