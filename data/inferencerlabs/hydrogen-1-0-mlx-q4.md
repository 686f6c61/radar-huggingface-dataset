# inferencerlabs/Hydrogen-1.0-MLX-Q4

## Resumen

Hydrogen-1.0-MLX-Q4 es una cuantización en formato MLX con precisión de 4 bits del modelo Hydrogen-1.0, desarrollado por Deep Principle. Se trata de un modelo de lenguaje de gran escala orientado a dominios científicos, concretamente química, ciencia de materiales y ciencias de la vida. La versión original se construye mediante post-entrenamiento sobre Z.ai GLM-5.3, incorporando datos de dominio, registros de laboratorio y trayectorias de descubrimiento generadas por agentes. El resultado es un modelo de pesos abiertos que, según el autor, supera a GPT-6-Astra en la evaluación FrontierScience-Research.

Esta variante concreta la publica inferencerlabs bajo el identificador `inferencerlabs/Hydrogen-1.0-MLX-Q4`. Está pensada para su ejecución en el stack MLX de Apple (Apple Silicon), con pesos cuantizados a 4 bits y un tamaño de repositorio de 29,1 GB. La arquitectura declarada en las etiquetas es `glm_moe_dsa`, lo que indica un transformer de mezcla de expertos (MoE) con atención dispersa (DSA, DeepSeek Sparse Attention), heredada del linaje GLM.

El modelo base Hydrogen-1.0 se presenta como un modelo de 753B parámetros, lo que lo sitúa en la categoría de modelos de gran escala con pesos abiertos. Su relevancia actual radica en la combinación de un tamaño muy elevado, un enfoque verticalizado en ciencia y una licencia de pesos abiertos, lo que permite a equipos de investigación desplegar y adaptar un modelo especializado sin depender de APIs propietarias. El acceso al repositorio está restringido (gated) y requiere aceptar las condiciones en Hugging Face.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE con atención dispersa (glm_moe_dsa) |
| Parametros totales | 753B (modelo base Hydrogen-1.0) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 4 bits (MLX Q4); otras cuantizaciones del base no disponibles |
| Idiomas soportados | en |
| Licencia | no disponible (acceso restringido/gated) |
| Formato de pesos | MLX (cuantizado a 4 bits) |
| Tamano del repositorio | 29,1 GB |
| Modelo base | deep-principle/Hydrogen-1.0 |
| Libreria | mlx |
| Pipeline | text-generation |

## Arquitectura y entrenamiento

La arquitectura declarada es `glm_moe_dsa`, es decir, un transformer con mezcla de expertos (MoE) y atención dispersa del tipo DSA (DeepSeek Sparse Attention). Esta combinación es la empleada en la familia GLM reciente y permite escalar el número total de parámetros manteniendo un coste de cómputo por token relativamente contenido, al activar solo un subconjunto de expertos en cada paso. El modelo base cuenta con 753B parámetros totales; el número de parámetros activos por token no se ha especificado en la información disponible.

El entrenamiento de Hydrogen-1.0 parte de Z.ai GLM-5.3 y se realiza mediante post-entrenamiento sobre datos de dominio científico (química, ciencia de materiales y ciencias de la vida), registros de laboratorio y trayectorias de descubrimiento generadas por agentes. No se dispone de información sobre el volumen de tokens empleado, la composición exacta del dataset ni la presencia de etapas de RLHF o DPO. Tampoco se detallan innovaciones adicionales más allá de la propia arquitectura MoE con atención dispersa.

## Capacidades

- Generación de texto y razonamiento en dominios científicos: química, ciencia de materiales y ciencias de la vida.
- Razonamiento multi-paso orientado a tareas de descubrimiento, derivado del entrenamiento con trayectorias de agentes.
- Capacidad de agente: el modelo base se ha post-entrenado con trayectorias de descubrimiento generadas por agentes, lo que sugiere soporte para flujos de trabajo agénticos.
- Soporte de tool calling / function calling: no confirmado explícitamente en la información disponible.
- Capacidades multilingües: limitadas al inglés según la etiqueta de idioma del repositorio.
- Capacidades de visión o audio: no disponibles.
- Modo de razonamiento explícito (thinking): no confirmado en la información disponible.

## Casos de uso

- Búsqueda de candidatos en química computacional: el modelo puede generar y razonar sobre propuestas de moléculas o reacciones a partir de descripciones textuales, apoyándose en su post-entrenamiento sobre datos de química y registros de laboratorio.
- Diseño de materiales: uso en la exploración de composiciones y propiedades de materiales, generando hipótesis y resúmenes técnicos que un investigador puede validar posteriormente en laboratorio.
- Asistencia en ciencias de la vida: extracción y síntesis de información de literatura y registros experimentales en inglés, útil para equipos de biología computacional.
- Flujos agénticos de descubrimiento: al haberse entrenado con trayectorias de agentes, puede integrarse en pipelines que encadenan pasos de consulta, razonamiento y propuesta de experimentos.
- Generación de documentación técnica científica: redacción de informes y resúmenes de resultados experimentales en inglés para equipos de I+D.
- Despliegue local en Apple Silicon: la variante MLX Q4 permite ejecutar el modelo en hardware Apple con memoria unificada, útil para prototipado e investigación sin infraestructura de GPU dedicada.
- Evaluación comparativa de modelos científicos: como pesos abiertos, sirve para reproducir y contrastar resultados frente a modelos propietarios en tareas de investigación.

## Benchmarks y rendimiento

La información disponible indica que Hydrogen-1.0 reporta una victoria en la evaluación FrontierScience-Research frente a GPT-6-Astra. No se han publicado en la información proporcionada las cifras concretas de MMLU, HumanEval, GSM8K ni de otros benchmarks estándar, ni los valores numéricos de FrontierScience-Research.

| Benchmark | Hydrogen-1.0 | GPT-6-Astra |
|---|---|---|
| FrontierScience-Research | Victoria reportada por el autor (sin cifras) | Derrota reportada (sin cifras) |
| MMLU | no disponible | no disponible |
| HumanEval | no disponible | no disponible |
| GSM8K | no disponible | no disponible |

## Requisitos de hardware

- VRAM/memoria estimada: el repositorio MLX Q4 ocupa 29,1 GB, por lo que se requiere al menos esa cantidad de memoria unificada disponible para cargar los pesos cuantizados, más overhead de contexto y activaciones.
- Hardware objetivo: Apple Silicon con memoria unificada suficiente (por ejemplo, configuraciones de 32 GB o superiores). No se especifican modelos concretos de chip.
- GPU NVIDIA: no se dispone de información sobre requisitos para A100, H100 o RTX 4090 en esta variante MLX; el formato MLX está orientado al stack de Apple.
- Cabe en GPU consumer: no confirmado para GPUs NVIDIA; en Apple Silicon depende de la memoria unificada disponible.
- Opciones de despliegue: librería MLX (mlx). No se indica soporte para vLLM, llama.cpp, Ollama o TGI en esta variante.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Hydrogen-1.0 (Deep Principle) | 753B | no disponible | no disponible | Pesos abiertos, acceso gated | Especializado en ciencia; victoria reportada frente a GPT-6-Astra en FrontierScience-Research |
| GPT-6-Astra | no disponible | no disponible | propietaria | API | Referencia comparativa citada por el autor |
| GLM-5.3 (Z.ai) | no disponible | no disponible | no disponible | no disponible | Modelo base sobre el que se post-entrena Hydrogen-1.0 |

No se dispone de datos suficientes para comparar parámetros activos, contexto o rendimiento numérico con alternativas de la misma categoría.

## Limitaciones y advertencias

- Acceso restringido: el repositorio es gated y requiere aceptar condiciones en Hugging Face; no es de descarga libre inmediata.
- Licencia no disponible: no se especifican los términos de uso comercial, por lo que no puede asumirse permiso para producción sin verificar las condiciones del modelo base.
- Idiomas: soporte declarado únicamente en inglés, lo que limita su uso en castellano u otros idiomas.
- Riesgo de alucinación: como modelo generativo, puede producir afirmaciones científicas plausibles pero incorrectas; requiere validación humana en contextos de investigación.
- Sesgos: no se documentan sesgos conocidos en la información disponible.
- Contexto: la longitud de contexto no está especificada, lo que impide planificar cargas de documentos largos con garantías.
- Formato MLX: la variante Q4 está atada al ecosistema Apple; no es directamente portable a GPUs NVIDIA sin conversión.
- Benchmarks: las afirmaciones de rendimiento provienen del autor y no se acompañan de cifras reproducibles en la información disponible.
- Fecha de creación del repositorio: 2026-11-06, con 0 descargas y 0 likes en el momento de la consulta, lo que indica adopción aún nula.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/inferencerlabs/Hydrogen-1.0-MLX-Q4
- Modelo base: https://huggingface.co/deep-principle/Hydrogen-1.0
- Perfil del autor de la cuantización: https://huggingface.co/inferencerlabs
- Artículo sobre el lanzamiento: https://www.marktechpost.com/2026/11/02/deep-principle-hydrogen-1-0-open-weight-scientific-model/
