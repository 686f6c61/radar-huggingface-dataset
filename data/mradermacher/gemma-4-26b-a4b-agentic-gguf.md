# mradermacher/gemma-4-26B-A4B-agentic-GGUF

## Resumen

gemma-4-26B-A4B-agentic-GGUF es una coleccion de cuantizaciones estaticas en formato GGUF del modelo ManniX-ITA/gemma-4-26B-A4B-agentic, publicada por el usuario mradermacher en Hugging Face. El modelo base pertenece a la familia Gemma 4 de Google, en su variante 26B-A4B, lo que indica una arquitectura de mezcla de expertos (MoE) con aproximadamente 26 mil millones de parametros totales y unos 4 mil millones de parametros activos por token. El repositorio de cuantizaciones ocupa 17,5 GB y esta pensado para inferencia local con llama.cpp y derivados.

La relevancia de esta publicacion es practica: convierte un modelo MoE de gran tamano en artefactos manejables para hardware de consumo, con un abanico de cuantizaciones que va desde Q2_K hasta Q8_0 e incluye variantes IQ4_XS. El sufijo "agentic" del modelo base sugiere un ajuste orientado a tareas de agente, aunque la model card del repositorio de cuantizacion no aporta detalles sobre el dataset de ajuste ni sobre el entrenamiento.

La informacion disponible es muy limitada: no se publican datos de licencia, idiomas, benchmarks ni pipeline en la ficha de Hugging Face. Esta ficha se limita, por tanto, a lo que puede verificarse a partir de los metadatos y del contenido del repositorio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | transformer con mezcla de expertos (MoE), segun la nomenclatura 26B-A4B del modelo base |
| Parametros totales | 25.233.142.046 (25,2 B) |
| Parametros activos | aproximadamente 4 B (inferido de la nomenclatura A4B; no confirmado en la model card) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | x-f16, Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, IQ4_XS |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF (cuantizaciones estaticas) |
| Tamano del repositorio | 17,5 GB |
| Version de cuantizacion | quantize_version 2, output_tensor_quantised 1 |

## Arquitectura y entrenamiento

El modelo base es un transformer con mezcla de expertos, tal como refleja la denominacion 26B-A4B: 25,2 mil millones de parametros totales con un subconjunto de aproximadamente 4 mil millones activos por token. Esta configuracion reduce el coste computacional por token frente a un modelo denso del mismo tamano, a cambio de un mayor footprint de memoria, ya que todos los expertos deben residir en RAM o VRAM durante la inferencia.

No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset, el proceso de alineacion (RLHF, DPO u otros) ni las innovaciones tecnicas del modelo base ManniX-ITA/gemma-4-26B-A4B-agentic. El repositorio de cuantizacion unicamente documenta el proceso de conversion: cuantizacion estatica con quantize_version 2 y cuantizacion de tensores de salida, a partir del modelo en precision original. Tampoco se detalla si el ajuste "agentic" implica un entrenamiento especifico en trayectorias de herramientas o en razonamiento multi-paso.

## Capacidades

- Generacion de texto conversacional: la etiqueta "conversational" del repositorio indica soporte para dialogos multi-turno.
- Razonamiento orientado a agentes: el sufijo "agentic" del modelo base sugiere capacidad para tareas de planificacion y uso de herramientas, aunque no se documenta explicitamente.
- Compatibilidad con endpoints: la etiqueta "endpoints_compatible" indica que el modelo puede servirse mediante la infraestructura de endpoints de Hugging Face.
- Inferencia local: al estar en formato GGUF, es compatible con llama.cpp, Ollama y otros runners basados en GGUF.
- Capacidades multilingues: no disponibles en la informacion proporcionada.
- Tool calling, vision, audio o modo thinking: no disponibles en la informacion proporcionada.

## Casos de uso

- Despliegue local en estaciones de trabajo: las cuantizaciones Q4_K_M e IQ4_XS permiten ejecutar un MoE de 25 B parametros en equipos con 16-24 GB de memoria unificada o VRAM, manteniendo la mayor parte de la calidad del modelo original.
- Prototipado de agentes conversacionales: la orientacion "agentic" del modelo base y el soporte conversacional lo hacen adecuado para construir asistentes que encadenan pasos de razonamiento en local antes de pasar a produccion.
- Evaluacion comparativa de cuantizaciones: el repositorio ofrece el mismo modelo en doce variantes, lo que permite medir la degradacion de calidad entre Q2_K y Q8_0 sobre la misma tarea.
- Servicio de chat autoalojado: mediante llama.cpp o un servidor compatible con la API de OpenAI, se puede exponer el modelo como endpoint interno sin depender de proveedores externos.
- Procesamiento por lotes en CPU: las cuantizaciones Q3_K_S y Q2_K reducen el requisito de memoria hasta el punto de permitir inferencia en CPU con RAM convencional, util para tareas de clasificacion o resumen no interactivas.
- Experimentacion academica con MoE: el modelo permite estudiar el comportamiento de un transformer con expertos dispersos en entornos con recursos limitados, comparando el rendimiento de variantes de cuantizacion sobre el mismo checkpoint.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/RAM estimada segun cuantizacion: Q2_K en torno a 8-10 GB, Q3_K_M en torno a 12-14 GB, Q4_K_M en torno a 15-17 GB, Q5_K_M en torno a 18-20 GB, Q6_K en torno a 21-23 GB y Q8_0 en torno a 27-28 GB. Estas cifras son estimaciones a partir del tamano del repositorio (17,5 GB para el conjunto de cuantizaciones) y del numero de parametros; no estan confirmadas por el autor.
- GPU recomendadas: RTX 4090 (24 GB) para Q4_K_M e inferiores; A100 40 GB o H100 para Q8_0 y f16; configuraciones multi-GPU para las variantes de mayor precision.
- GPU de consumo: si, las cuantizaciones Q4_K_M e IQ4_XS caben en GPUs de 16-24 GB como RTX 4080, RTX 4090 o RTX 3090. Las variantes Q2_K y Q3_K_S pueden ejecutarse en GPUs de 8-12 GB.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio y cualquier runner compatible con GGUF; la etiqueta endpoints_compatible permite tambien su uso en endpoints de Hugging Face.
- Latencia y throughput: no disponibles. Al tratarse de un MoE con aproximadamente 4 B parametros activos, el coste por token deberia ser inferior al de un modelo denso de 25 B, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| gemma-4-26B-A4B-agentic (GGUF) | 25,2 B totales, ~4 B activos | no disponible | no disponible | GGUF | Objeto de esta ficha |
| Modelo base ManniX-ITA/gemma-4-26B-A4B-agentic | 25,2 B totales | no disponible | no disponible | safetensors | Checkpoint original sin cuantizar |
| Otras cuantizaciones GGUF de la familia Gemma 4 | no disponible | no disponible | no disponible | GGUF | No se dispone de datos verificables |

No se dispone de informacion suficiente para comparar con alternativas de la misma categoria en parametros, contexto o rendimiento.

## Limitaciones y advertencias

- La model card no especifica licencia, lo que impide confirmar si el uso comercial esta permitido. Es imprescindible verificar la licencia del modelo base ManniX-ITA/gemma-4-26B-A4B-agentic y la de la familia Gemma 4 de Google antes de cualquier despliegue en produccion.
- No se documentan sesgos conocidos, riesgos de alucinacion ni limitaciones de idioma del modelo base.
- Las cuantizaciones de baja precision (Q2_K, Q3_K_S) degradan la calidad de forma notable; para tareas de agente o razonamiento se recomienda Q4_K_M o superior.
- Al ser un MoE, todos los expertos deben cargarse en memoria, por lo que el requisito de RAM/VRAM es mayor que el de un modelo denso con el mismo numero de parametros activos.
- El repositorio tiene cero descargas y cero likes en el momento de la consulta, y fue creado en noviembre de 2026; no hay evidencia de validacion por parte de la comunidad.
- No se han publicado mediciones de latencia, throughput ni evaluaciones de calidad para estas cuantizaciones concretas.

## Enlaces

- Repositorio de cuantizaciones: https://huggingface.co/mradermacher/gemma-4-26B-A4B-agentic-GGUF
- Modelo base: https://huggingface.co/ManniX-ITA/gemma-4-26B-A4B-agentic
