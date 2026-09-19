# Dohyeon1/ERNIE-HC-SMoE-ngroups40

## Resumen

ERNIE-HC-SMoE-ngroups40 es un checkpoint de generación de texto publicado en HuggingFace por el usuario Dohyeon1. El repositorio contiene pesos en safetensors que suman 21 825 437 888 parámetros (unos 21,8 mil millones) y ocupa 43,7 GB, un tamaño coherente con un almacenamiento en precisión de 16 bits. El tag de arquitectura `ernie4_5_moe` lo vincula a la familia ERNIE 4.5 MoE de Baidu, y el sufijo del nombre (`HC-SMoE-ngroups40`) sugiere una modificación de la capa de mezcla de expertos organizada en 40 grupos, aunque esa modificación no está documentada en ninguna parte del repositorio.

La relevancia de la ficha es doble. Por un lado, los checkpoints abiertos basados en la arquitectura ERNIE 4.5 MoE son escasos, y una variante de 21,8 mil millones de parámetros con enrutamiento disperso es interesante para investigación sobre eficiencia de inferencia y análisis de enrutamiento de expertos. Por otro, el repositorio presenta señales claras de checkpoint sin curar: la model card es la plantilla automática de HuggingFace con todos los campos en "More Information Needed", no se declara licencia ni idiomas, no hay benchmarks ni código de ejemplo, y acumula 0 descargas y 0 likes desde su creación el 19 de septiembre de 2026.

En consecuencia, esta ficha describe con precisión lo que se puede verificar (tamaño, formato, tags, pipeline) y marca explícitamente como "no disponible" todo lo que el autor no ha publicado. Cualquier uso en producción debería ir precedido de una evaluación propia y de una verificación de la licencia del modelo base.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer con mezcla de expertos dispersa (MoE), según el tag `ernie4_5_moe`; configuración interna no disponible |
| Parámetros totales | 21 825 437 888 (~21,8 mil millones), según los safetensors del repositorio |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible; el repositorio solo publica safetensors, sin GGUF ni cuantizaciones precalculadas |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Librería | transformers |
| Pipeline | text-generation |
| Tamaño del repositorio | 43,7 GB |
| Autor | Dohyeon1 |
| Fecha de creación | 19 de septiembre de 2026 |
| Última actualización | 19 de septiembre de 2026 |
| Descargas / likes | 0 / 0 |
| Compatibilidad | `endpoints_compatible` (tag) |
| Región | `region:us` |

## Arquitectura y entrenamiento

El único dato verificable sobre la arquitectura es el tag `ernie4_5_moe`, que corresponde a la implementación de mezcla de expertos de la familia ERNIE 4.5 publicada por Baidu. Se trata, por tanto, de un transformer con capas MoE dispersas: cada token se enruta a un subconjunto de expertos en lugar de atravesar toda la red, lo que desacopla el coste computacional por token del número total de parámetros. El sufijo `ngroups40` apunta a una variante con 40 grupos de expertos, y `HC-SMoE` sugiere alguna forma de enrutamiento jerárquico o agrupado, pero no hay documentación que confirme el número de expertos por capa, el número de expertos activados por token ni la presencia de expertos compartidos.

No hay información sobre el entrenamiento: ni volumen de tokens, ni composición del dataset, ni si hubo ajuste por instrucciones con RLHF o DPO, ni hiperparámetros. La model card es la plantilla genérica de HuggingFace y no aporta nada. Tampoco se documenta ninguna técnica de inferencia específica (decodificación especulativa, atención lineal, etc.). A título de contexto sobre la familia base, la documentación pública de Baidu para ERNIE 4.5 describe variantes MoE de ~21 000 millones de parámetros totales con aproximadamente 3 000 millones de parámetros activos y ventanas de contexto de 128 000 tokens; no hay ninguna confirmación de que este checkpoint conserve esas cifras, por lo que deben tomarse solo como referencia de la arquitectura de partida.

## Capacidades

- Generación de texto: es la tarea declarada en el pipeline del repositorio.
- Conversación: el tag `conversational` indica que el checkpoint está orientado a diálogo multi-turno, sin que se especifique el formato de plantilla de chat empleado.
- Razonamiento, matemáticas y generación de código: no documentado.
- Tool calling / function calling: no documentado.
- Soporte de agentes y razonamiento multi-paso: no documentado.
- Capacidades multilingües: no disponible; el autor no declara ningún idioma.
- Visión, audio o multimodalidad: no disponible; los tags no indican ninguna modalidad distinta de texto.
- Capacidad estructural destacable: al emplear enrutamiento MoE, el coste de cómputo por token debería ser inferior al de un modelo denso del mismo tamaño, siempre que se confirme el número de parámetros activos (dato no disponible).

## Casos de uso

- Investigación sobre enrutamiento en MoE: el checkpoint permite inspeccionar el comportamiento de una capa de expertos organizada en 40 grupos, comparar la distribución de activaciones entre expertos y estudiar si la agrupación provoca desequilibrios de carga. Es un caso adecuado porque los repositorios con variantes MoE no estándar son escasos.
- Fine-tuning de dominio sobre arquitectura dispersa: al tener 21,8 mil millones de parámetros totales, un ajuste con LoRA o QLoRA es viable en una GPU de 80 GB y permite evaluar cómo responde una MoE a la especialización por dominio sin tocar todos los expertos.
- Prototipado de asistentes conversacionales autoalojados: el tag `conversational` y la compatibilidad con `transformers` permiten montar un servicio de chat interno en infraestructura propia, sin dependencia de APIs externas, siempre que se valide primero la calidad de las respuestas.
- Generación de texto a escala para aumentación de datos: si se confirma un número reducido de parámetros activos, el coste por token sería bajo en relación con el tamaño del modelo, lo que lo hace apto para generar grandes volúmenes de texto sintético en tareas de preentrenamiento o clasificación.
- Punto de partida para experimentos de poda y destilación: el sufijo `ngroups40` indica que ya se ha intervenido sobre la estructura de expertos; el checkpoint sirve como caso de estudio para medir el impacto de reducir o agrupar expertos sobre la perplejidad y las capacidades finales.
- Despliegue interno con cuantización de 4 bits: con unos 11-13 GB de pesos cuantizados, el modelo cabría en GPUs de consumo como la RTX 4090, lo que permite ofrecer generación de texto en estaciones de trabajo locales para tareas de baja criticidad (borradores, resúmenes, clasificación).
- Evaluación comparativa frente a otras MoE abiertas: útil como línea base adicional en estudios que comparen familias MoE de tamaño similar en tareas de razonamiento y generación, siempre que se generen los resultados de evaluación por cuenta propia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card del autor no incluye métricas de MMLU, HumanEval, GSM8K ni de ningún otro conjunto de evaluación, y la búsqueda web no devolvió ningún resultado relacionado con este modelo.

## Requisitos de hardware

- VRAM en BF16/FP16: los pesos ocupan 43,7 GB, por lo que se necesitan al menos 48 GB solo para los pesos. Con caché KV y activaciones, el objetivo razonable es una GPU de 80 GB (A100 80 GB, H100 80 GB) o dos GPU de 40 GB en paralelo tensorial.
- VRAM en INT8: estimada en 22-24 GB para los pesos. Encaja en L40S o A6000 (48 GB) con margen; en una RTX 4090 de 24 GB queda al límite y no es una configuración recomendada.
- VRAM en INT4: estimada en 11-13 GB para los pesos, lo que permite ejecución en RTX 4090, RTX 3090, RTX 4080 (16 GB) y GPUs similares de consumo.
- Offload a CPU/RAM: viable si se convierte a GGUF y se descargan expertos poco usados a memoria del sistema, ya que el enrutamiento disperso permite no materializar todos los expertos en VRAM al mismo tiempo.
- GPU recomendadas por escenario: A100 80 GB o H100 80 GB para BF16 sin cuantizar; L40S o A6000 para INT8; RTX 4090 o 3090 para INT4.
- Opciones de despliegue: `transformers` está garantizado por los tags del repositorio. vLLM, TGI, SGLang y Ollama no tienen soporte confirmado para la arquitectura `ernie4_5_moe` en este checkpoint; llama.cpp y Ollama requerirían además una conversión a GGUF que no está publicada.
- Latencia y throughput: no disponible. Si se confirmase un régimen de ~3 000 millones de parámetros activos, el coste por token sería notablemente inferior al de un modelo denso de 21,8 mil millones, pero es una estimación no verificada.

## Comparativa con modelos similares

| Modelo | Parámetros totales | Parámetros activos | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ERNIE-HC-SMoE-ngroups40 (este checkpoint) | 21,8 B | no disponible | no disponible | no disponible | HuggingFace, 0 descargas, sin model card |
| ERNIE-4.5-21B-A3B (Baidu) | ~21 B | ~3 B | 128 000 tokens | Apache 2.0 | HuggingFace, familia oficial con documentación |
| Qwen3-30B-A3B (Alibaba) | ~30,5 B | ~3,3 B | 32 768 tokens nativos, ampliable a 131 072 con YaRN | Apache 2.0 | HuggingFace, con model card y benchmarks publicados |
| Mixtral 8x7B (Mistral AI) | ~46,7 B | ~12,9 B | 32 000 tokens | Apache 2.0 | HuggingFace, con model card y benchmarks publicados |

Las cifras de los tres modelos de referencia provienen de su documentación pública y se incluyen solo como marco de comparación de tamaño y licencia. No existen datos de rendimiento de este checkpoint, por lo que no es posible establecer una comparación de calidad.

## Limitaciones y advertencias

- Licencia no declarada: sin licencia explícita no puede asumirse permiso de uso comercial. Si el checkpoint deriva de ERNIE 4.5 de Baidu, habría que verificar la licencia del modelo base (la documentación pública de Baidu indica Apache 2.0 para la familia ERNIE 4.5, pero esto no se ha confirmado para este repositorio concreto).
- Idiomas no declarados: se desconoce si el modelo mantiene capacidades multilingües o si está sesgado hacia un único idioma.
- Model card vacía: no hay información sobre datos de entrenamiento, procedencia del checkpoint, hiperparámetros ni uso previsto, lo que impide evaluar sesgos conocidos o riesgos específicos.
- Riesgo de alucinación: inherente a cualquier modelo generativo y no cuantificado aquí por ausencia de evaluaciones.
- Sin validación comunitaria: 0 descargas y 0 likes. No hay evidencia de que el checkpoint cargue correctamente ni de que los pesos estén completos o bien convertidos.
- Fecha de creación declarada en 2026: un repositorio reciente y sin historial dificulta verificar si ha sido modificado tras la publicación.
- Configuración MoE no documentada: se desconoce el número de parámetros activos, dato crítico para dimensionar coste de inferencia y latencia.
- Compatibilidad incierta: solo `transformers` está garantizado por los tags; otros motores de inferencia pueden requerir adaptaciones del código de la arquitectura `ernie4_5_moe`.
- Ausencia total de benchmarks: no hay base para afirmar que el modelo sea competitivo frente a alternativas de tamaño similar.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Dohyeon1/ERNIE-HC-SMoE-ngroups40
- Paper referenciado en los tags (Lacoste et al., 2019, "Quantifying the Carbon Emissions of Machine Learning"): https://arxiv.org/abs/1910.09700 — se trata de la referencia de la calculadora de impacto ambiental de HuggingFace, no de un artículo sobre este modelo.
- Documentación de la familia ERNIE 4.5 de Baidu: no disponible en la información proporcionada.
- Código de ejemplo, demo o paper del autor: no disponible en la información proporcionada.
- La búsqueda web realizada no devolvió ningún resultado relacionado con este modelo; los enlaces obtenidos correspondían a contenido no pertinente y se han descartado.
