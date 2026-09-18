# lwaekfjlk/rft-webshop-qwen2.5-7b-epoch2

## Resumen

`lwaekfjlk/rft-webshop-qwen2.5-7b-epoch2` es un ajuste fino completo (full-parameter SFT) de `Qwen/Qwen2.5-7B-Instruct` sobre trayectorias de agente generadas por el propio modelo en el entorno WebShop de AgentGym. El autor lo presenta como parte de una replicación de un método denominado RWML (citado como arXiv 2602.05842). No es un modelo de propósito general: es un checkpoint especializado en actuar como agente ReAct dentro de un entorno de compra simulada, donde debe navegar un catálogo, buscar productos, abrir fichas y ejecutar la acción de compra cumpliendo los atributos pedidos por el usuario.

El entrenamiento sigue el esquema de rejection fine-tuning (RFT): se muestrearon tres rollouts por tarea con temperatura 1.0 y hasta 30 rondas, y se conservaron únicamente las 4.507 trayectorias que obtuvieron una recompensa de entorno igual o superior a 0.6 sobre 1.0. El ajuste se hizo con FSDP sobre 4 GPU Blackwell en bf16, con una tasa de aprendizaje de 5e-6, batch efectivo de 16 y longitud máxima de secuencia de 16.384 tokens, sin truncamiento. La pérdida bajó de 0.401 en la primera época a 0.347 en la segunda, que es precisamente el checkpoint publicado.

Su relevancia es acotada y muy específica: sirve como artefacto reproducible para investigar RFT en agentes, como punto de partida para agentes de comercio electrónico y como base que demuestra que un modelo de 7,6 mil millones de parámetros puede absorber comportamiento agéntico multi-turno en un dominio cerrado. Es un checkpoint intermedio (época 2 de 3) con cero descargas, sin benchmarks publicados y sin cuantizaciones oficiales, por lo que su uso en producción exigiría una validación propia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only, heredada sin cambios de `Qwen2.5-7B-Instruct` |
| Parametros totales | 7.615.616.512 (~7,62 mil millones) |
| Parametros activos | no aplica (modelo denso, no es MoE) |
| Longitud de contexto | 16.384 tokens de longitud máxima de secuencia en el entrenamiento (0% de ejemplos truncados); el modelo base declara 131.072 tokens, dato no verificado en este checkpoint |
| Tipos de cuantizacion | no disponible: el repositorio publica únicamente pesos bf16, sin GGUF, GPTQ ni AWQ |
| Idiomas soportados | no disponible en la model card; el modelo base es multilingüe, pero el ajuste se hizo solo con trayectorias de WebShop, en inglés |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (bf16) |
| Modelo base | `Qwen/Qwen2.5-7B-Instruct` |
| Metodo de ajuste | SFT de todos los parametros (rejection fine-tuning), FSDP sobre 4 GPU Blackwell, bf16 |
| Epocas | 3 planificadas; este checkpoint corresponde a la epoca 2 |
| Tamano del repositorio | 15,2 GB |
| Fecha de publicacion | 18 de septiembre de 2026 (segun metadatos de HuggingFace) |

## Arquitectura y entrenamiento

La arquitectura es la del modelo base sin modificaciones estructurales: un transformer decoder-only denso de unos 7,6 mil millones de parámetros, por lo que no hay innovaciones de arquitectura propias de este checkpoint. Toda la aportación está en los datos y en el procedimiento de ajuste. El entrenamiento se realizó sobre trayectorias ReAct multi-turno generadas por `Qwen2.5-7B-Instruct` en el split de entrenamiento de WebShop dentro de AgentGym, con tres rollouts por tarea, temperatura 1.0 y un máximo de 30 rondas por episodio. El filtro de aceptación fue una recompensa de entorno mayor o igual a 0.6, calculada como coincidencia de atributos en una escala de 0 a 1; se conservaron 4.507 trayectorias.

El ajuste fue de parámetros completos con FSDP, precisión bf16, learning rate 5e-6 con decaimiento lineal y un 3% de warmup, batch efectivo de 16 (1 muestra por dispositivo x 4 pasos de acumulación de gradiente x 4 GPU) y longitud máxima de 16.384 tokens sin truncar ningún ejemplo. La pérdida pasó de 0.401 en la época 1 a 0.347 en la época 2. La pérdida se calculó únicamente sobre los tokens del asistente, de modo que el modelo aprende a emitir pensamiento y acción sin que las observaciones del entorno contribuyan al gradiente. No se aplicaron RLHF, DPO ni optimización por preferencias: el único mecanismo de selección de datos es el filtrado por recompensa del entorno. Antes de la subida, los pesos se verificaron libres de NaN, Inf y tensores completamente a cero.

La limitación metodológica más relevante es el umbral de recompensa. Solo 395 rollouts alcanzaron una recompensa de 1.0, por lo que el autor relajó el criterio a 0.6, lo que admite compras meramente aceptables: la recompensa mediana de las trayectorias conservadas es 0.71. El resultado es un modelo que imita comportamiento correcto pero no óptimo, entrenado además sobre la distribución de un único entorno.

## Capacidades

- Generación de texto conversacional multi-turno en formato ReAct, alternando bloques de razonamiento y acciones.
- Ejecución de acciones estructuradas dentro de un entorno de compra: búsqueda por consulta, navegación de resultados, apertura de fichas de producto y compra.
- Razonamiento de múltiples pasos con horizonte de hasta 30 rondas de interacción con el entorno.
- Seguimiento de instrucciones con restricciones de atributos (color, talla, precio, categoría) y verificación de que el producto elegido las cumple.
- Tool calling / function calling en el sentido de invocar acciones del entorno con parámetros; el formato concreto es el de AgentGym/ReAct, no el esquema de funciones nativo de OpenAI.
- Capacidad como policy de agente para evaluación y generación de trayectorias (rollouts) en investigación de aprendizaje por refuerzo.
- Capacidades generales de lenguaje y razonamiento heredadas de `Qwen2.5-7B-Instruct`, no evaluadas ni garantizadas tras este ajuste.
- No hay evidencia de soporte de visión, audio, modo de pensamiento explícito ni modos de decodificación especiales en la información disponible.

## Casos de uso

- Agente de compra en comercio electrónico simulado: el modelo puede actuar como policy entrenada para resolver tareas de WebShop, seleccionando productos que cumplen los atributos pedidos mediante búsqueda y navegación iterativa, lo que lo hace directamente utilizable como baseline en evaluación de agentes.
- Investigación en rejection fine-tuning: sirve como artefacto reproducible para estudiar cómo el filtrado por recompensa del entorno afecta al comportamiento de un modelo de 7B, comparando épocas 1, 2 y 3 sobre el mismo conjunto de 4.507 trayectorias.
- Generación de trayectorias sintéticas: dado que produce rollouts ReAct coherentes con el entorno, puede emplearse para generar datos de entrenamiento adicionales que después se filtren por recompensa, alimentando un bucle iterativo de auto-mejora.
- Evaluación de frameworks de agentes: al tener un formato de acción y observación bien definido, es útil para validar integraciones de entornos, parsers de acciones y bucles de ejecución en infraestructuras como AgentGym antes de escalar a modelos mayores.
- Base para ajuste específico de dominio: una empresa con un catálogo propio puede continuar el ajuste de este checkpoint con datos de su entorno, aprovechando que ya ha adquirido el formato ReAct y el hábito de verificar atributos antes de comprar.
- Destilación hacia modelos pequeños: las trayectorias filtradas y el comportamiento adquirido pueden destilarse en modelos de 1-3B para despliegue en el borde, donde el coste por token es crítico.
- Análisis de errores de agentes: sirve para estudiar modos de fallo típicos (bucles de búsqueda, compra de productos con atributos parcialmente coincidentes) gracias a que conserva la distribución de recompensas del entrenamiento.
- No se recomienda como asistente conversacional general ni como modelo de razonamiento o código, porque no fue entrenado ni evaluado para ello.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card únicamente reporta la pérdida de entrenamiento por época (0.401 en la época 1, 0.347 en la época 2) y estadísticas del filtrado de datos (4.507 trayectorias conservadas, recompensa mediana 0.71, 395 rollouts con recompensa 1.0). No hay datos de MMLU, HumanEval, GSM8K ni de la tasa de éxito en el split de evaluación de WebShop, por lo que no es posible comparar su rendimiento con el del modelo base ni con alternativas.

## Requisitos de hardware

- VRAM estimada en bf16: unos 15,2 GB solo para los pesos, más caché KV; en la práctica, entre 17 y 20 GB para contextos moderados. Las cifras son estimaciones a partir del recuento de parámetros, no medidas publicadas.
- VRAM estimada con cuantización de 8 bits: aproximadamente 8-9 GB. Con cuantización de 4 bits: aproximadamente 5-6 GB. Estas cuantizaciones no están publicadas en el repositorio y habría que generarlas.
- GPU de centro de datos: A100 40/80 GB, H100, L40S y similares, sin problemas de capacidad. El autor entrenó con 4 GPU Blackwell en bf16 con FSDP.
- GPU de consumo: cabe en una RTX 4090 o RTX 3090 (24 GB) en bf16 con contexto moderado; en tarjetas de 16 GB conviene cuantizar a 8 bits; en 8-12 GB es necesario 4 bits.
- Opciones de despliegue: `transformers` de forma directa, vLLM o SGLang para servicio con alto throughput, TGI como alternativa. Para llama.cpp u Ollama es necesario convertir previamente los pesos a GGUF, conversión que el autor no ha publicado.
- Latencia y throughput: no disponible. No hay mediciones de tokens por segundo ni de latencia por acción en la información proporcionada.
- Almacenamiento: 15,2 GB de repositorio, más el espacio adicional si se generan cuantizaciones.

## Comparativa con modelos similares

No hay benchmarks publicados para este checkpoint, por lo que la comparación se limita a especificaciones y disponibilidad. Los datos de las alternativas proceden de su documentación pública y no se han verificado en esta revisión.

| Modelo | Parametros | Contexto | Especializacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `lwaekfjlk/rft-webshop-qwen2.5-7b-epoch2` | 7,62B | 16.384 en entrenamiento (base: 131.072) | Agente ReAct para WebShop | Apache 2.0 | Pesos bf16 en safetensors; sin cuantizaciones; 0 descargas |
| `Qwen/Qwen2.5-7B-Instruct` (base) | 7,62B | 131.072 | Asistente general, multilingue | Apache 2.0 | Pesos bf16 y cuantizaciones de la comunidad; ampliamente desplegado |
| `meta-llama/Llama-3.1-8B-Instruct` | ~8,03B | 131.072 | Asistente general, tool calling | Llama 3.1 Community License (con restricciones) | Pesos bf16 y cuantizaciones; ampliamente desplegado |
| `mistralai/Mistral-7B-Instruct-v0.3` | ~7,25B | 32.768 | Asistente general, function calling | Apache 2.0 | Pesos originales y cuantizaciones; comunidad extensa |

Frente al modelo base, este checkpoint intercambia capacidades generales por comportamiento agéntico en un dominio concreto: mantiene el mismo número de parámetros y licencia, pero su ventana efectiva de entrenamiento es ocho veces menor que la del base. Frente a Llama 3.1 8B y Mistral 7B Instruct, la diferencia principal es que estos últimos son asistentes generales sin entrenamiento agéntico en WebShop y con licencias o ecosistemas distintos, pero con despliegue y cuantizaciones ya resueltos.

## Limitaciones y advertencias

- Umbral de recompensa relajado: solo 395 de los rollouts alcanzaron 1.0, por lo que se aceptaron trayectorias desde 0.6. La recompensa mediana conservada es 0.71, lo que implica que el modelo imita con frecuencia compras parcialmente correctas y no soluciones óptimas.
- Riesgo de sobreajuste al entorno WebShop: el modelo ha visto únicamente trayectorias de ese entorno en el split de entrenamiento, por lo que su comportamiento puede degradarse fuera de él o ante variaciones del formato de observación.
- Dependencia del formato ReAct de AgentGym: el prompt, los tokens de acción y el protocolo de observación están fuertemente condicionados por ese framework; no se garantiza compatibilidad con esquemas de function calling estándar.
- Checkpoint intermedio: es la época 2 de 3, subida mientras la tercera seguía entrenando. No hay evidencia de que sea el mejor punto de la ejecución ni de que la época 3 no lo supere.
- Sin benchmarks: no hay ninguna métrica de éxito en WebShop ni en tareas generales, ni comparación con el modelo base. Cualquier afirmación de mejora es una hipótesis sin verificar.
- Riesgo de alucinación: se mantiene el comportamiento del modelo base en cuanto a inventar información; en este dominio, el fallo típico es declarar que un producto cumple atributos que no cumple o comprar un artículo incorrecto.
- Idiomas: el ajuste se realizó exclusivamente con trayectorias en inglés. El rendimiento en castellano o en otros idiomas no está evaluado y previsiblemente será peor que el del modelo base.
- Contexto: aunque el modelo base declara 131.072 tokens, el entrenamiento se hizo a 16.384. El comportamiento más allá de esa longitud no está validado.
- Licencia: Apache 2.0 permite uso comercial sin restricciones de atribución más allá de las habituales, pero el autor no ofrece garantías sobre los pesos ni sobre su idoneidad.
- Ausencia de alineamiento de seguridad adicional: no se aplicaron RLHF ni DPO, por lo que las salvaguardas son las del modelo base sin refuerzo.
- Procedencia dudosa de la referencia: la model card cita "RWML (arXiv 2602.05842)". Ese identificador no se ha podido verificar con la información disponible y conviene comprobarlo antes de citarlo.
- Madurez del artefacto: 0 descargas y 0 "likes" en el momento de la consulta, sin cuantizaciones publicadas y sin conversión a GGUF, lo que incrementa el coste de integración.
- La búsqueda web realizada no devolvió resultados relevantes: los enlaces recuperados corresponden a páginas de estado del servicio de Xbox y no guardan relación con el modelo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/lwaekfjlk/rft-webshop-qwen2.5-7b-epoch2
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-7B-Instruct
- Referencia citada en la model card (no verificada): RWML, arXiv 2602.05842
- Referencia al entorno: AgentGym y WebShop se mencionan en la model card sin enlace directo; no se han encontrado URLs adicionales en la búsqueda web realizada (los resultados obtenidos no eran relevantes para el modelo).
