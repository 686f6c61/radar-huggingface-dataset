# p-yan/laya-quanto

## Resumen

Laya Quanto es un repositorio de cuantizaciones *weight-only* del modelo `convaiinnovations/laya`, publicado por el usuario p-yan y generado con la librería Optimum-Quanto de Hugging Face. No se trata de un modelo entrenado desde cero, sino de dos variantes de pesos cuantizados del checkpoint original: una en 8 bits (`q8`, 480,5 MB) y otra en 4 bits (`q4`, 325,1 MB), empaquetadas en un único repositorio de 0,8 GB junto con el tokenizer, la configuración del encoder, la configuración de decisión y los ficheros del cargador.

El objetivo del repositorio es reducir el coste de memoria de la inferencia (huella de pesos y ancho de banda de lectura) sin salir del ecosistema Transformers/Hugging Face. Las capas `Linear` se almacenan en enteros de 8 o 4 bits y se ejecutan con los kernels cuantizados nativos de Quanto, mientras que los embeddings y las capas LayerNorm permanecen en coma flotante. El autor indica explícitamente que no se emplea la antigua ruta de desquantización en CPU.

Es relevante para quien necesite desplegar el agente Laya en GPUs con VRAM limitada o quiera medir la degradación de precisión entre `q8` y `q4` sobre el mismo checkpoint. Como contrapartida, la información proporcionada no incluye especificaciones del modelo base (parámetros, contexto, arquitectura), benchmarks, lista de idiomas ni datos de entrenamiento, de modo que varias secciones de esta ficha quedan marcadas como no disponibles.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (se desconoce la arquitectura del modelo base `convaiinnovations/laya`; el repositorio solo distribuye pesos cuantizados) |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no hay indicios de que el modelo base sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | Weight-only: `q8` (pesos `Linear` en 8 bits) y `q4` (pesos `Linear` en 4 bits), mediante Optimum-Quanto |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | `safetensors` por variante (`q8/model.safetensors`, `q4/model.safetensors`) más mapa de cuantización de Quanto y metadatos |
| Librería de carga | `optimum-quanto` (cargador propio `quanto_laya`, función `load_quantized_agent`) |
| Tamaño del repositorio | 0,8 GB en total; `q8` = 480,5 MB, `q4` = 325,1 MB |
| Precisión de embeddings y LayerNorm | Coma flotante (no cuantizados) |
| Modelo base | `convaiinnovations/laya` (relación: `quantized`) |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura del modelo base `convaiinnovations/laya`: la model card del repositorio cuantizado no detalla si se trata de un transformer denso, un MoE, un modelo híbrido ni el número de capas, cabezas o dimensiones ocultas. Tampoco se documentan los datos de entrenamiento, el número de tokens, la composición del dataset ni si hubo fases de RLHF, DPO u otro ajuste por preferencias. Esta ficha no puede, por tanto, describir el proceso de entrenamiento del modelo original.

Lo que sí queda documentado es la transformación aplicada. Se trata de una cuantización *weight-only*: solo los pesos de las capas `Linear` se almacenan en 8 o 4 bits, mientras que embeddings y LayerNorm se mantienen en coma flotante. Las variantes usan los kernels cuantizados nativos de Optimum-Quanto en lugar de la implementación antigua de desquantización en CPU, lo que implica que la ruta de ejecución prevista es la GPU. El reparto de artefactos es el siguiente:

| Variante | Pesos | Módulos cuantizados |
|---|---:|---|
| `q8` | 480,5 MB | Pesos `Linear` en 8 bits |
| `q4` | 325,1 MB | Pesos `Linear` en 4 bits |

La estructura del repositorio separa `q8/` y `q4/` (cada uno con su `model.safetensors`, mapa de cuantización y metadatos) de los ficheros compartidos en la raíz: tokenizer, configuración del encoder, configuración de decisión y cargador. La presencia de una "configuración de decisión" y de la llamada `agent.system_one(state, questions)` sugiere una interfaz orientada a agentes con un componente de decisión, pero la model card no desarrolla qué implica ni cómo se entrena, por lo que no se puede afirmar nada más al respecto.

## Capacidades

- Distribución de pesos cuantizados: el repositorio ofrece dos variantes (`q8` y `q4`) del mismo checkpoint base, pensadas para sustituirse entre sí según el presupuesto de memoria.
- Inferencia con kernels nativos de Quanto: ejecución de capas `Linear` cuantizadas sin recurrir a la ruta de desquantización en CPU.
- Carga mediante un API específico: `load_quantized_agent(repo, variant="q8"|"q4", device="cuda")`, que devuelve un objeto agente.
- Interfaz de agente orientada a preguntas: el ejemplo de uso expone `agent.system_one(state, questions)`, es decir, un método que recibe un estado y un conjunto de preguntas.
- Compatibilidad con el ecosistema Hugging Face: pesos en `safetensors` y dependencia de `optimum-quanto`, integrables en pipelines basados en Transformers.
- Capacidades del modelo base (generación de texto, razonamiento, código, matemáticas, visión, tool calling, agentes multietapa, multilingüismo): no disponibles en la información proporcionada. No se puede confirmar ninguna de ellas.
- Modo *thinking*, visión, audio u otras capacidades especiales: no disponible.

## Casos de uso

- Despliegue en GPUs de gama de entrada o con poca VRAM: con 325,1 MB (`q4`) o 480,5 MB (`q8`) de pesos, el modelo deja margen para caché KV y activaciones en tarjetas de 4-6 GB, algo inviable si el checkpoint original fuese mucho mayor.
- Servicio multi-tenant o con muchas réplicas por nodo: al reducir la huella de pesos, un mismo acelerador puede alojar más instancias concurrentes del agente, lo que aumenta el throughput agregado en cargas de trabajo de muchas peticiones cortas.
- Evaluación comparativa de precisión: cargar `q8` y `q4` con el mismo código y el mismo conjunto de preguntas permite medir la pérdida de calidad introducida por la cuantización de 4 bits antes de decidir qué variante llevar a producción.
- Prototipado rápido en portátil o estación de trabajo: la descarga completa es de 0,8 GB, muy inferior a la de un checkpoint en coma flotante, lo que facilita iterar sobre la integración del agente sin esperas largas de descarga.
- Integración en un pipeline de agentes basado en estado: la API `agent.system_one(state, questions)` encaja en flujos donde se pasa un estado y una batería de preguntas, y se espera una respuesta del componente de decisión.
- Inferencia con presupuesto de memoria estricto en entornos virtualizados: contenedores con límites de memoria o instancias de GPU compartidas se benefician directamente de un peso de modelo por debajo de 0,5 GB.
- Archivado y versionado ligero: mantener las dos variantes cuantizadas en un único repositorio simplifica la distribución interna en equipos que ya usan la biblioteca `optimum-quanto`.

Advertencia transversal: al no haber benchmarks publicados, estos casos se justifican por el ahorro de memoria, no por una calidad de respuesta verificada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card del repositorio no incluye métricas de MMLU, HumanEval, GSM8K ni de ninguna otra tarea, ni tampoco comparaciones de perplejidad o de precisión entre `q8`, `q4` y el checkpoint original. No se han encontrado datos de latencia ni de throughput.

## Requisitos de hardware

- VRAM estimada para los pesos: aproximadamente 0,48 GB para `q8` y 0,33 GB para `q4`. Son cifras derivadas del tamaño de los ficheros `safetensors`; a ellas hay que sumar caché KV, activaciones, tokenizer y el resto de componentes del agente.
- VRAM total orientativa: con estas cifras, cabría esperar un consumo por debajo de 2 GB para `q4` y por debajo de 3 GB para `q8` en muchos escenarios, aunque es una estimación, no un dato medido, porque se desconoce el tamaño de las activaciones y del contexto del modelo base.
- GPU recomendadas: no hay recomendaciones oficiales. Por tamaño, cualquier GPU con al menos 4 GB de VRAM es candidata, desde una GTX 1650 o RTX 3050 hasta una RTX 4090, A100 o H100 si se busca throughput, no capacidad.
- Cabe en GPU de consumo: sí, previsiblemente en cualquier tarjeta con 4 GB o más, dado el tamaño de los pesos. La limitación real vendrá de la longitud de contexto y del tamaño de lote, desconocidos.
- Opciones de despliegue: `transformers` junto con `optimum-quanto`, usando el cargador `quanto_laya` incluido en el repositorio. El formato es `safetensors` con mapa de cuantización de Quanto, no GGUF, por lo que no es directamente compatible con `llama.cpp` ni con Ollama. No hay confirmación de soporte en vLLM, TGI u otros servidores de inferencia.
- CPU: el autor indica que se usan kernels nativos de Quanto y no la antigua ruta de desquantización en CPU, y el ejemplo de carga emplea `device="cuda"`. El soporte en CPU no está confirmado.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de información sobre alternativas comparables (otros repositorios de cuantización del mismo modelo, otros formatos como GPTQ, AWQ, GGUF o bitsandbytes, ni modelos de tamaño equivalente). La única comparación posible con los datos aportados es interna al propio repositorio:

| Elemento | Tipo | Pesos | Módulos cuantizados | Licencia |
|---|---|---:|---|---|
| `convaiinnovations/laya` | Checkpoint original | no disponible | Ninguno (coma flotante) | Apache 2.0 |
| `p-yan/laya-quanto` (`q8`) | Cuantización weight-only | 480,5 MB | `Linear` en 8 bits | Apache 2.0 |
| `p-yan/laya-quanto` (`q4`) | Cuantización weight-only | 325,1 MB | `Linear` en 4 bits | Apache 2.0 |

Comparativa con modelos alternativos de la misma categoría: no disponible.

## Limitaciones y advertencias

- Ausencia total de benchmarks: no hay forma de saber, con la información disponible, cuánta calidad se pierde al pasar del checkpoint original a `q8` o `q4`. Cualquier uso en producción debería ir precedido de una evaluación propia.
- Especificaciones del modelo base desconocidas: sin datos de parámetros, contexto ni arquitectura, es imposible dimensionar correctamente la caché KV, el tamaño de lote ni el hardware necesario más allá de los pesos.
- Idiomas no declarados: no se puede garantizar soporte ni calidad en castellano ni en ningún otro idioma.
- Riesgo de alucinación: inherente a los modelos generativos; al no existir evaluación publicada de esta cuantización, no hay motivo para suponer que se ha reducido o eliminado.
- Sesgos: no documentados por el autor. No hay información sobre el dataset de entrenamiento, por lo que no se pueden enumerar sesgos conocidos.
- Cuantización de 4 bits: la variante `q4` es la más agresiva y, sin datos de perplejidad, es la que mayor riesgo presenta de degradación en tareas sensibles (matemáticas, código, razonamiento largo).
- Soporte limitado en herramientas: al no ser GGUF y no estar confirmado el soporte en vLLM o TGI, el despliegue queda restringido al ecosistema Transformers más `optimum-quanto`.
- Licencia: Apache 2.0, derivada del checkpoint original, lo que permite uso comercial siempre que se conserven los avisos de licencia y atribución correspondientes. Conviene verificar los términos del repositorio base por si añaden condiciones.
- Repositorio con 0 descargas y 0 *likes* en el momento del registro: no hay validación comunitaria ni informes de errores de terceros.
- Fechas de creación y actualización registradas en 2026-09-20, con apenas 18 minutos entre ambas, lo que sugiere una publicación sin revisión posterior.
- Sensibilidad a la versión: el funcionamiento depende de `optimum-quanto`; cambios de versión en la librería pueden romper la carga de los mapas de cuantización.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/p-yan/laya-quanto
- Modelo base: https://huggingface.co/convaiinnovations/laya
- Optimum-Quanto (librería de cuantización): https://github.com/huggingface/optimum-quanto
- Resultados de búsqueda web: las consultas realizadas no devolvieron enlaces relevantes sobre el modelo (los resultados correspondían a páginas sobre la letra "P" y a Pinterest), por lo que no hay papers, blogs ni demos adicionales que citar.
