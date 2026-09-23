# minjaechoi/qwen3p6-35b-a3b-nopin-2p00bit-r40

## Resumen

Qwen3.6-35B-A3B Nopin 2.0000-bit (r40) es un checkpoint de investigacion publicado por el usuario minjaechoi, cuya actividad declarada es ML eficiente, cuantizacion, IA en dispositivo y diseno de algoritmos hardware-aware. Se construye sobre el modelo base Qwen/Qwen3.6-35B-A3B y aplica un esquema de cuantizacion poco habitual: solo los expertos enrutados se cuantizan a 2.0000 bits de media, mientras que el resto de pesos permanece en BF16. El resultado se almacena desquantizado en tensores BF16, de modo que se carga con `transformers` y vLLM estandar sin kernels personalizados.

La familia a la que pertenece (checkpoints hermanos r5 y r6, documentados en directorios de terceros) se describe con 35,1 mil millones de parametros y una longitud de contexto de 32768 tokens. El sufijo A3B del nombre sigue la convencion de Qwen para arquitecturas de mezcla de expertos con pocos parametros activos por token, aunque el numero exacto de parametros activos no se detalla en la informacion disponible.

Se trata de un checkpoint interno de investigacion, no de un modelo orientado a produccion. En el momento de la consulta acumula 0 descargas y 0 likes, no publica resultados de benchmarks y no especifica idiomas ni licencia concreta (la model card indica unicamente que la licencia sigue la del modelo base). Su interes es, por tanto, metodologico: reproducir y auditar la cuantizacion extrema de expertos enrutados en un MoE de ~35B.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mezcla de expertos (MoE) heredada del modelo base Qwen/Qwen3.6-35B-A3B; el sufijo A3B indica expertos enrutados con pocos parametros activos, aunque el detalle de capas y configuracion no se especifica en la model card |
| Parametros totales | ~35,1 mil millones (dato documentado para los checkpoints hermanos r5 y r6 de la misma familia) |
| Parametros activos | no disponible (el sufijo A3B sugiere alrededor de 3B activos por token, sin confirmacion en la informacion proporcionada) |
| Longitud de contexto | 32768 tokens (segun la ficha de los checkpoints hermanos r5/r6 sobre la misma arquitectura) |
| Tipos de cuantizacion | Expertos enrutados: media de 2,0000 bits. Resto de pesos: BF16. Los pesos se almacenan desquantizados en tensores BF16 |
| Idiomas soportados | no disponible |
| Licencia | no disponible; la model card indica que sigue la licencia del modelo base Qwen/Qwen3.6-35B-A3B |
| Formato de pesos | Tensores BF16 cargables con `transformers` y vLLM estandar; no se especifica el formato de fichero (safetensors u otro) |
| Identificador interno | r40 |
| Biblioteca declarada | transformers |
| Tarea declarada | text-generation |
| Etiquetas | quantized, region:us |

## Arquitectura y entrenamiento

El checkpoint parte del modelo base Qwen/Qwen3.6-35B-A3B, una arquitectura de mezcla de expertos. La intervencion del autor consiste en cuantizar unicamente los expertos enrutados hasta una media de 2,0000 bits, dejando el resto de la red (atencion, embeddings, normalizaciones y demas pesos no enrutados) intactos en BF16. Este reparto es coherente con el hecho de que en un MoE los expertos concentran la mayor parte de los parametros totales pero no todos se activan en cada token, de modo que la cuantizacion agresiva de esa porcion es la que mayor reduccion potencial ofrece.

Un detalle determinante para el despliegue: los pesos se publican desquantizados en tensores BF16, no en un formato empaquetado de 2 bits. Esto implica que el checkpoint ocupa en memoria lo mismo que el modelo base en BF16 y que no se obtiene ahorro de VRAM durante la inferencia. El interes del artefacto es, por tanto, la trazabilidad del proceso de cuantizacion y la posibilidad de evaluar la degradacion inducida por ese esquema, no la reduccion de huella en runtime. La model card no indica numero de tokens de entrenamiento, composicion del dataset, ni si hubo etapas de RLHF, DPO o ajuste posterior; tampoco se documenta ninguna innovacion de decodificacion (especulativa, atencion lineal u otras).

## Capacidades

- Generacion de texto: es la unica capacidad declarada explicitamente, a traves de `pipeline_tag: text-generation` y de la carga mediante `transformers` y vLLM.
- Razonamiento, matematicas y generacion de codigo: no documentados en la model card ni en los resultados de busqueda disponibles.
- Vision, audio u otras modalidades: no disponibles.
- Tool calling / function calling: no documentado para este checkpoint.
- Uso como agente y razonamiento multi-paso: no documentado.
- Capacidades multilingues: no disponibles (no se enumeran idiomas).
- Modo thinking o modos de razonamiento alternativos: no documentados.
- Carga en vLLM estandar: confirmada por el autor, sin necesidad de kernels ni parches especificos.

## Casos de uso

- Auditoria de cuantizacion de expertos: el checkpoint permite medir la perdida de calidad asociada a forzar los expertos enrutados a 2,0000 bits de media manteniendo el resto en BF16, comparando contra el modelo base con la misma bateria de evaluacion.
- Reproducibilidad de investigacion: al publicarse desquantizado en BF16 y cargarse con `transformers` sin parches, cualquier grupo puede reproducir el punto de partida de un estudio de cuantizacion sin infraestructura especializada.
- Comparacion de rondas dentro de la familia: junto con los checkpoints r5 y r6 del mismo autor, permite estudiar el efecto de distintas iteraciones o variantes del proceso de cuantizacion sobre la misma arquitectura base.
- Analisis de sensibilidad por experto: al mantener BF16 en todo salvo los expertos, es posible instrumentar que expertos degradan mas y en que tipo de tokens, informacion util para disenar esquemas de cuantizacion mixta.
- Fine-tuning posterior sobre pesos cuantizados: sirve como punto de partida para estudiar si un ajuste de bajo rango (LoRA) recupera calidad en los expertos comprimidos.
- Servicio de inferencia interno en cluster: mediante vLLM estandar, siempre que se asuma el coste de memoria de un modelo BF16 de ~35B, por ejemplo para generar trafico de evaluacion a gran escala.
- Base para destilacion o poda de expertos: la estructura resultante es un candidato razonable para experimentos de eliminacion de expertos poco usados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye tablas de MMLU, HumanEval, GSM8K ni ninguna otra metrica, y los resultados de busqueda consultados tampoco aportan cifras de evaluacion para este checkpoint ni para sus variantes r5 y r6.

## Requisitos de hardware

- VRAM estimada para pesos: al almacenarse en BF16 y no estar empaquetados a 2 bits, los ~35,1B parametros ocupan aproximadamente 70 GB en BF16 (estimacion calculada como 35,1e9 x 2 bytes; no confirmada de forma explicita por el autor).
- Memoria adicional: hay que sumar el KV cache para una ventana de hasta 32768 tokens. Su tamano exacto depende del numero de capas y cabezas del modelo base, dato no disponible.
- GPU recomendadas: una A100 80 GB o una H100 80 GB cubren los pesos en BF16 con margen ajustado para el KV cache; para contextos largos o lotes grandes es preferible repartir el modelo en varias GPU.
- Multi-GPU: configuraciones de 2x A100 40 GB, 2x L40S 48 GB o similares con tensor parallelism en vLLM son viables.
- GPU de consumo: no cabe en una RTX 4090 (24 GB) ni en tarjetas de 24-32 GB en BF16. Al no publicarse versiones GGUF ni cuantizaciones de usuario, no hay una ruta directa a inferencia en dispositivo.
- Opciones de despliegue: `transformers` y vLLM, ambos confirmados por el autor. No se mencionan llama.cpp, Ollama, TGI ni TensorRT-LLM.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros totales | Contexto | Cuantizacion | Licencia | Benchmarks publicados |
|---|---|---|---|---|---|
| qwen3p6-35b-a3b-nopin-2p00bit-r40 (este modelo) | ~35,1B (familia) | 32768 tokens | Expertos a 2,0000 bits, resto BF16 | no disponible (sigue la del modelo base) | no |
| minjaechoi/qwen36-35b-a3b-2p00bit-r6 | ~35,1B | 32768 tokens | Expertos a 2,00 bits, resto BF16 | no disponible (sigue la del modelo base) | no |
| minjaechoi/qwen36-35b-a3b-2p00bit-r5 | ~35,1B | 32768 tokens | Expertos a 2,00 bits, resto BF16 | no disponible (sigue la del modelo base) | no |
| Qwen/Qwen3.6-35B-A3B (modelo base) | no disponible en la informacion recuperada | no disponible en la informacion recuperada | BF16 (referencia) | no disponible en la informacion recuperada | no disponible en la informacion recuperada |

No se dispone de informacion recuperada sobre alternativas publicas de la misma categoria (MoE de ~35B con cuantizacion extrema de expertos) que permita una comparacion cuantitativa fiable. Los unicos terminos de comparacion documentados son los checkpoints de la misma familia del propio autor.

## Limitaciones y advertencias

- Estado de investigacion: el autor lo define explicitamente como checkpoint interno de investigacion; no hay garantia de estabilidad, soporte ni mantenimiento.
- Ausencia total de evaluacion: sin benchmarks publicados no es posible estimar la degradacion real introducida por los 2,0000 bits en los expertos.
- Sin ahorro de memoria en inferencia: al publicarse desquantizado en BF16, el checkpoint ocupa lo mismo que el modelo base. Cualquier expectativa de desplegarlo como un modelo de 2 bits es incorrecta.
- Licencia indeterminada: la model card remite a la licencia del modelo base, que no se detalla en la informacion proporcionada. No debe asumirse uso comercial permitido sin verificar el repositorio de Qwen/Qwen3.6-35B-A3B.
- Idiomas no declarados: no se especifica que lenguas cubre el modelo ni si la cuantizacion afecta de forma desigual a idiomas distintos del ingles.
- Riesgo de alucinacion: no cuantificado para este checkpoint; al no haber evaluacion, se desconoce si la compresion de expertos agrava el problema respecto al modelo base.
- Ambiguedad del identificador: el termino "nopin" del nombre del repositorio no se explica en la model card, por lo que se desconoce a que variante o restriccion concreta se refiere.
- Trazabilidad limitada: no se documentan datos de entrenamiento, numero de tokens ni etapas de alineacion, lo que dificulta auditar sesgos o procedencia.
- Huella de despliegue alta: requiere hardware de clase A100/H100 o multi-GPU, lo que descarta su uso en entornos de consumo o en dispositivo.
- Repositorio sin traccion: 0 descargas y 0 likes en el momento de la consulta, sin issues ni discusion que sirvan de soporte.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/minjaechoi/qwen3p6-35b-a3b-nopin-2p00bit-r40
- Modelo base: https://huggingface.co/Qwen/Qwen3.6-35B-A3B
- Perfil del autor: https://huggingface.co/minjaechoi
- Checkpoint hermano r6 en HuggingFace: https://huggingface.co/minjaechoi/qwen36-35b-a3b-2p00bit-r6
- Checkpoint hermano r5 en Featherless: https://featherless.ai/models/minjaechoi/qwen36-35b-a3b-2p00bit-r5
- Checkpoint hermano r6 en Featherless: https://featherless.ai/models/minjaechoi/qwen36-35b-a3b-2p00bit-r6
- Ficha relacionada en LLM Explorer (Qwen3.6 35B A3B TWLA Experts Only): https://llm-explorer.com/model/minjaechoi%2FQwen3.6-35B-A3B-TWLA-Experts-Only,7ogWXNK7sZGQvjqMz9cdGi
