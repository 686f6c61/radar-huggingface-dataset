# AmberHeart/Uni-MOPD-Teacher-Embodied

## Resumen

Uni-MOPD-Teacher-Embodied es un especialista de dominio único dentro del banco Uni-MOPD, un conjunto de modelos derivados del mismo checkpoint base mediante destilación on-policy multi-profesor (MOPD). Lo desarrolla el usuario AmberHeart siguiendo el trabajo descrito en la model card, "Strong Starts, Simple Recipes: Unified Multi-Teacher On-Policy Distillation from Multimodal Specialists". El modelo parte de Qwen/Qwen3-VL-30B-A3B-Instruct, un modelo vision-lenguaje de mezcla de expertos ya instruido, y se post-entrena con una ruta propia que termina en aprendizaje por refuerzo sobre el dominio de comprensión encarnada (embodied understanding).

La relevancia de este repositorio es doble. Por un lado, es una pieza de un experimento metodológico: demuestra que un especialista de dominio puede obtenerse a partir de un modelo base común y combinarse después con otros especialistas del mismo origen mediante mezcla en el espacio de pesos y destilación a nivel de token. Por otro, es un artefacto utilizable de forma independiente: un modelo multimodal de 31.070.754.032 parámetros totales, con arquitectura Qwen3-VL-MoE, pesos en bfloat16 repartidos en 13 shards safetensors y licencia Apache 2.0.

El modelo no está pensado como asistente general, sino como profesor o componente especializado en tareas de percepción y razonamiento sobre entornos físicos, robótica y comprensión de escenas. Su contexto, idiomas y datos exactos de entrenamiento no están documentados en la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3-VL-MoE (transformer multimodal con mezcla de expertos), clase `Qwen3VLMoeForConditionalGeneration` |
| Parametros totales | 31.070.754.032 |
| Parametros activos | no disponible (el nombre del base sugiere ~3B activos, no confirmado en la ficha) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en bfloat16) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (13 shards, bfloat16) |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura del checkpoint base Qwen/Qwen3-VL-30B-A3B-Instruct: un transformer multimodal de mezcla de expertos que procesa entradas de imagen y texto y genera texto, con la clase de Hugging Face `Qwen3VLMoeForConditionalGeneration` y procesador asociado `AutoProcessor`. El repositorio ocupa 62,2 GB y contiene 13 shards safetensors en bfloat16.

El entrenamiento sigue la receta Uni-MOPD descrita en la model card. El punto de partida es el checkpoint base compartido por los cinco especialistas del banco (STEM, VQA general, OCR/documentos, GUI grounding y embodied understanding). Cada especialista sigue una ruta de post-entrenamiento distinta y termina con aprendizaje por refuerzo en su propio dominio. En este caso, el dominio es la comprensión encarnada. La model card indica que este especialista "lidera su propio dominio entre los cinco", pero no publica métricas concretas ni detalles sobre el volumen de datos, la composición del dataset o los hiperparámetros de RL. El método global Uni-MOPD combina una inicialización mediante mezcla uniforme sin entrenamiento de los especialistas y un refinamiento breve con MOPD, muestreo uniforme de dominios y KL inversa sobre el vocabulario completo; esos detalles corresponden al estudiante unificado, no necesariamente a este profesor individual.

## Capacidades

- Generación de texto e imagen-a-texto: el pipeline declarado es `image-text-to-text`, con soporte de conversaciones multimodales mediante plantilla de chat.
- Comprensión de escenas y entornos físicos: es un especialista de dominio en embodied understanding, orientado a describir y razonar sobre imágenes de entornos reales.
- Razonamiento visual: al derivar de Qwen3-VL, conserva la capacidad multimodal del base, aunque el post-entrenamiento se centra en su dominio.
- Conversación multi-turno: el procesador aplica plantilla de chat con roles, lo que permite diálogos con historial.
- Integración con el ecosistema Transformers: requiere `transformers>=4.57.1` y es compatible con endpoints.
- Capacidades de tool calling, agentes, matemáticas o código: no documentadas específicamente para este especialista; deben asumirse las del modelo base, sin garantía tras el post-entrenamiento.

## Casos de uso

- Descripción de escenas para robótica: el modelo recibe una imagen de cámara y genera una descripción estructurada del entorno (objetos, disposición, estado), útil como módulo de percepción en pipelines de manipulación.
- Anotación de datasets de embodied AI: sirve para preetiquetar imágenes de entornos físicos con descripciones y respuestas a preguntas, reduciendo el coste de anotación manual antes de una revisión humana.
- Evaluación de navegación y grounding espacial: puede formular respuestas sobre la posición relativa de objetos en una escena, lo que permite construir benchmarks internos de comprensión espacial.
- Profesor en destilación: su función original es supervisar las respuestas de un estudiante unificado en el dominio embodied dentro de la receta Uni-MOPD, generando etiquetas de alta calidad sobre consultas de entrenamiento.
- Asistencia a personas con discapacidad visual: con una imagen del entorno, el modelo puede generar descripciones textuales de obstáculos y objetos cercanos, siempre con supervisión y sin sustituir sistemas certificados.
- Análisis de imágenes industriales o de almacén: descripción de estados de estanterías, maquinaria o zonas de trabajo a partir de capturas, integrable en flujos de inspección con revisión humana.
- Componente de un sistema multi-modelo: al compartir arquitectura y vocabulario con el resto del banco, puede combinarse por mezcla de pesos o destilación con otros especialistas para construir un modelo generalista.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bfloat16: aproximadamente 62 GB solo para pesos, más overhead de activaciones y caché KV; en la práctica se necesitan del orden de 70-80 GB.
- Cuantización: no se documentan tipos ni checkpoints cuantizados; habría que generarlos a partir de los safetensors.
- GPU recomendadas: una H100 de 80 GB o una A100 de 80 GB cubren los pesos en bf16 con margen limitado; para mayor holgura, dos A100/H100 de 80 GB con paralelismo de tensor.
- GPU de consumo: no cabe en una RTX 4090 de 24 GB en bf16; sería necesario cuantizar a 4 bits (aproximadamente 16-18 GB de pesos) y aun así el margen es ajustado por el procesador visual y la caché.
- Opciones de despliegue: Transformers con `device_map="auto"` según la model card; vLLM, TGI o llama.cpp no están confirmados para esta arquitectura en la información disponible, aunque el tag `endpoints_compatible` sugiere compatibilidad con endpoints gestionados.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Dominio | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Uni-MOPD-Teacher-Embodied | 31,07 B | no disponible | Embodied understanding | Apache 2.0 | Hugging Face, 19 descargas |
| Qwen/Qwen3-VL-30B-A3B-Instruct | no disponible en la ficha | no disponible | General multimodal | no disponible | Hugging Face (base) |
| Uni-MOPD-Teacher-STEM | mismo base | no disponible | Razonamiento STEM | Apache 2.0 | Hugging Face (mismo banco) |
| Uni-MOPD-Teacher-GUI | mismo base | no disponible | GUI grounding | Apache 2.0 | Hugging Face (mismo banco) |

La comparación más directa es con el checkpoint base y con los otros especialistas del banco, que comparten arquitectura, vocabulario y licencia. Frente al base, este modelo debería mejorar en su dominio a costa de posible degradación en tareas generales, aunque no hay métricas publicadas que lo cuantifiquen. No se dispone de datos para comparar con alternativas externas de tamaño similar.

## Limitaciones y advertencias

- Especialización estrecha: el post-entrenamiento con RL en un solo dominio puede degradar capacidades generales del base; no se han publicado evaluaciones que midan esa pérdida.
- Sesgos: no documentados, pero hereda los del checkpoint base Qwen3-VL y los de los datos de entrenamiento del dominio embodied, no descritos.
- Alucinación: como modelo generativo multimodal, puede describir objetos o relaciones espaciales inexistentes; en aplicaciones de robótica o accesibilidad esto es crítico y exige verificación.
- Idiomas: no se especifican; el soporte multilingüe del base no está garantizado tras el post-entrenamiento.
- Contexto: la longitud máxima no está documentada, lo que impide planificar despliegues con entradas largas.
- Licencia: Apache 2.0 permite uso comercial, pero se debe conservar el archivo `NOTICE` con la declaración de modificaciones y cumplir las condiciones del modelo base.
- Madurez: 19 descargas y 0 likes en el momento de la ficha; es un artefacto de investigación sin validación comunitaria ni soporte.
- Requisitos: 62 GB de pesos en bf16 hacen inviable el despliegue en hardware de consumo sin cuantización, y no se ofrecen versiones cuantizadas oficiales.

## Enlaces

- Hugging Face: https://huggingface.co/AmberHeart/Uni-MOPD-Teacher-Embodied
- Modelo base: https://huggingface.co/Qwen/Qwen3-VL-30B-A3B-Instruct
