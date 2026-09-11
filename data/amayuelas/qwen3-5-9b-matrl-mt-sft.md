# amayuelas/Qwen3.5-9B-MatRL-MT-SFT

## Resumen

Qwen3.5-9B-MatRL-MT-SFT es un ajuste fino supervisado (SFT) de Qwen/Qwen3.5-9B publicado por el usuario amayuelas, orientado al diseño inverso de estructuras cristalinas mediante flujos agénticos de uso de herramientas. Es un checkpoint de arranque en frío (cold start): su objetivo no es resolver química, sino fijar el formato de la interacción y enseñar al agente a cerrar un episodio multi-turno, es decir, proponer, evaluar, refinar y, sobre todo, comprometerse con una respuesta antes de agotar el presupuesto de turnos.

El modelo tiene 9.409.813.744 parámetros y se distribuye en safetensors (18,8 GB de repositorio) bajo licencia Apache 2.0. Qwen3.5 es una arquitectura híbrida con capas de atención lineal (DeltaNet), lo que condiciona tanto el entrenamiento (paralelismo de contexto con ulysses en lugar de ring attention) como el despliegue (la clase de modelo es capaz de visión y lenguaje, por lo que vLLM exige configuración de procesador de imagen incluso en modo solo texto).

Su relevancia actual es metodológica: documenta un fallo concreto y medible de los agentes base. En 2.880 rollouts multi-turno, el modelo base de 4B efectuó solo 3 llamadas de tipo submit, por lo que cualquier métrica estricta de éxito resultaba 0% por construcción. Este checkpoint es la etapa previa al RL (amayuelas/Qwen3.5-9B-MatRL-MT-RL) y aún no ha sido evaluado en el benchmark SUN.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer híbrido con capas de atención lineal (DeltaNet); clase de modelo con capacidad de visión y lenguaje (VL) |
| Parámetros totales | 9.409.813.744 (9,41 B) |
| Parámetros activos | no aplica (no se indica que sea un modelo MoE) |
| Longitud de contexto | no disponible; la longitud de secuencia usada en el entrenamiento fue de 16.384 tokens |
| Tipos de cuantización | no disponible; el repositorio publica pesos en safetensors (18,8 GB, coherente con bf16) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Modelo base | Qwen/Qwen3.5-9B |
| Dataset de entrenamiento | amayuelas/matrl-sft-mt (1.119 de 1.123 episodios, pérdida solo en turnos del asistente) |
| Precisión de entrenamiento | bf16 |
| Librería y pipeline | transformers; text-generation |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.5-9B, una arquitectura híbrida que combina capas de atención lineal (DeltaNet) con atención softmax convencional. Esta característica tiene consecuencias prácticas: el autor señala que el paralelismo de contexto se implementó con ulysses y no con ring attention, porque ring attention es un algoritmo de atención softmax y no se aplica a las capas DeltaNet. El modelo pertenece a una clase con capacidad VL, de ahí que el repositorio incluya preprocessor_config.json y video_preprocessor_config.json.

El entrenamiento es una fase de arranque en frío sobre el corpus amayuelas/matrl-sft-mt: 1.119 episodios multi-turno de uso de herramientas para diseño inverso de estructuras cristalinas. Se ejecutaron 420 pasos (3 épocas) con batch global 8, longitud de secuencia 16.384, optimizador AdamW con lr 1e-5 constante y sin warmup (la mitad que la variante de 4B, que usa 2e-5), precisión bf16, FSDP sobre 8 rangos más paralelismo de contexto (cp=4, ulysses) y el entrenador prime-rl. El cómputo fue de 8×A100-40GB y la pérdida bajó de 1,21 en el primer paso a aproximadamente 0,8 en la última época. Cuatro episodios (3 de band-gap y 1 de fórmula) superaban los 16.384 tokens al renderizarse con la plantilla de chat de Qwen3.5 y fueron descartados en lugar de truncados. Este checkpoint comparte corpus, renderizador, esquema de 3 épocas y máscara de pérdida con amayuelas/Qwen3.5-4B-MatRL-MT-SFT, de modo que las diferencias entre ambos deberían atribuirse a la escala.

## Capacidades

- Generación de texto conversacional multi-turno en el contexto de un bucle agéntico.
- Uso de herramientas (tool calling) dentro de un ciclo explícito de proponer, evaluar, refinar y enviar (submit).
- Cierre de episodio: la habilidad entrenada de forma explícita es comprometerse con una respuesta dentro del presupuesto de turnos, en lugar de seguir proponiendo candidatos indefinidamente.
- Razonamiento en el canal de pensamiento nativo (reasoning_content → <think>), preservado a lo largo de las llamadas a herramientas.
- Capacidad de visión y lenguaje heredada de la clase de modelo Qwen3.5 (etiqueta image-text-to-text), no evaluada en esta ficha.
- No se documentan capacidades específicas de código, matemáticas generales ni soporte multilingüe; el corpus de entrenamiento está centrado en química de materiales.

## Casos de uso

- Diseño inverso de estructuras cristalinas: el modelo recibe un objetivo (por ejemplo, un band-gap deseado) y encadena propuestas de estructura, evaluación mediante herramientas y refinamiento hasta emitir una candidata final. Es el escenario para el que fue entrenado.
- Agente de materiales con herramientas externas: integrado en un bucle que llama a calculadoras o simuladores, el modelo genera las propuestas y decide cuándo evaluar y cuándo cerrar el episodio, reduciendo el fallo de no comprometerse nunca.
- Arranque en frío para RL posterior: sirve como punto de partida para amayuelas/Qwen3.5-9B-MatRL-MT-RL, aportando el formato y el comportamiento de cierre que el RL necesita antes de optimizar la química.
- Generación de datos sintéticos de trayectorias multi-turno: sus episodios pueden usarse como datos de imitación para modelos menores o como referencia de formato en pipelines de destilación.
- Investigación en evaluación de agentes: permite estudiar la diferencia entre fallo de compromiso y fallo de conocimiento, un problema metodológico recurrente cuando una métrica multi-turno estricta devuelve 0%.
- Estudio de escalado SFT: al compartir corpus, renderizador y calendario con la variante de 4B, es un punto de comparación controlado para medir el efecto de la escala del modelo en el aprendizaje de un protocolo de herramientas.
- Base para ajuste en dominios científicos afines: su especialización en bucle de herramientas con canal de pensamiento nativo lo hace reutilizable en otros flujos de diseño inverso donde el formato importe más que el conocimiento de dominio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor indica expresamente que este checkpoint todavía no ha sido puntuado en el benchmark SUN empleado para la variante de 4B.

Datos de comportamiento del modelo base (no son benchmarks, se incluyen por su valor diagnóstico):

| Observación | Valor | Contexto |
|---|---|---|
| Llamadas de tipo submit del modelo base de 4B | 3 | En 2.880 rollouts multi-turno |
| Candidatos propuestos por rollout | ~5,6 | El modelo base propone mucho y evalúa poco |
| Métrica estricta multi-turno SUN | 0% | Por construcción, debido al fallo de compromiso |

## Requisitos de hardware

- VRAM para inferencia en bf16: los pesos ocupan unos 18,8 GB; con caché KV y activaciones conviene reservar 24-40 GB, aunque no hay mediciones publicadas.
- GPU recomendadas: A100-40GB (la configuración usada en entrenamiento fue de 8×A100-40GB con FSDP y cp=4), L40S de 48 GB o H100. En GPUs de 24 GB (RTX 3090, RTX 4090) el modelo en bf16 queda al límite y requeriría cuantización, de la que no hay versiones publicadas.
- Opciones de despliegue: transformers (librería declarada) y vLLM (el repositorio incluye preprocessor_config.json y video_preprocessor_config.json, necesarios porque vLLM falla al cargar sin ellos al tratarse de una clase de modelo VL). Para entrenamiento, prime-rl.
- llama.cpp, Ollama, TGI y otras alternativas: no confirmado en la información disponible, especialmente por la atención lineal tipo DeltaNet.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Etapa | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| amayuelas/Qwen3.5-9B-MatRL-MT-SFT | 9,41 B | no disponible (entrenado a 16.384) | SFT de arranque en frío | Apache 2.0 | HuggingFace |
| amayuelas/Qwen3.5-4B-MatRL-MT-SFT | no disponible (denominado 4B) | no disponible | SFT de arranque en frío, mismo corpus y calendario | no disponible | HuggingFace |
| amayuelas/Qwen3.5-9B-MatRL-MT-RL | no disponible (deriva del anterior) | no disponible | RL posterior sobre el mismo entorno | no disponible | HuggingFace |
| Qwen/Qwen3.5-9B | no disponible | no disponible | Modelo base sin ajustar | no disponible en la información | HuggingFace |

La comparación relevante es interna a la familia: la variante de 4B permite aislar el efecto de la escala al compartir datos y esquema de entrenamiento, y la variante RL indica que este checkpoint es una etapa intermedia y no un modelo final para química.

## Limitaciones y advertencias

- No es un modelo de química: la propia model card indica que la química se aprende después, en la fase de RL. Usarlo como solucionador de diseño inverso daría resultados propios de un arranque en frío.
- Sin evaluación publicada: no ha sido puntuado en el benchmark SUN, por lo que no hay evidencia cuantitativa de su rendimiento frente a la variante de 4B.
- Canal de pensamiento obligatorio: fue entrenado con el razonamiento en el canal nativo (reasoning_content → <think>), preservado entre llamadas a herramientas. Evaluarlo con enable_thinking=false desactiva justamente el comportamiento que entrena este run e invalida cualquier conclusión.
- Corpus pequeño y muy específico: 1.119 episodios de un único dataset, todos centrados en diseño inverso de estructuras cristalinas. La transferencia a otros dominios no está medida.
- Cuatro episodios descartados: tres de band-gap y uno de fórmula superaban los 16.384 tokens con la plantilla de chat de Qwen3.5 y se excluyeron del entrenamiento, por lo que el modelo no ha visto ese régimen de longitud.
- Idiomas: no disponible; no hay constancia de entrenamiento multilingüe.
- Riesgo de alucinación: no evaluado en la información disponible; en un dominio científico con salidas estructuradas, las estructuras o valores propuestos deben verificarse con herramientas externas.
- Licencia: Apache 2.0 permite uso comercial, pero conviene verificar los términos del modelo base Qwen/Qwen3.5-9B, que no se detallan en la información proporcionada.
- Madurez: el repositorio registra 0 descargas y 0 «likes», por lo que no existe validación por parte de la comunidad.
- Despliegue: los modelos de la clase Qwen3.5 requieren configuración de procesador de imagen en vLLM incluso para servicio solo texto; omitirla provoca fallo de carga.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/amayuelas/Qwen3.5-9B-MatRL-MT-SFT
- Dataset de entrenamiento: https://huggingface.co/datasets/amayuelas/matrl-sft-mt
- Variante de 4B (mismo corpus y calendario): https://huggingface.co/amayuelas/Qwen3.5-4B-MatRL-MT-SFT
- Checkpoint posterior de RL: https://huggingface.co/amayuelas/Qwen3.5-9B-MatRL-MT-RL
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- Entrenador prime-rl: https://github.com/PrimeIntellect-ai/prime-rl

Nota: la búsqueda web realizada no devolvió enlaces relevantes sobre este modelo; los resultados obtenidos no guardan relación con el contenido de la ficha.
