# intel-ai/DeepSeek-V3.2-NVFP4-AutoRound

## Resumen

DeepSeek-V3.2-NVFP4-AutoRound es un checkpoint cuantizado de precisión mixta del modelo DeepSeek-V3.2, publicado por el equipo de Intel (intel-ai) mediante la herramienta AutoRound 0.17.0. No se trata de un modelo entrenado desde cero, sino de una versión comprimida del modelo original de DeepSeek-AI, orientada a reducir los requisitos de memoria y aumentar el rendimiento en inferencia sin degradar de forma significativa la calidad. La configuración combina MXFP8 (W8A8, grupo de 32, escalado dinámico de activaciones) para la mayoría de las capas con NVFP4 para los expertos MoE, manteniendo los módulos indexer en 16 bits.

El modelo base es un transformer de tipo Mixture-of-Experts (MoE) con 685 000 millones de parámetros totales según la model card del modelo original; el repositorio cuantizado declara 386 266 597 120 parámetros en sus safetensors (la diferencia se explica por el empaquetado de pesos cuantizados, no por un cambio de arquitectura). Está pensado para despliegues en producción sobre GPUs modernas, especialmente aquellas con soporte nativo de NVFP4, y se sirve mediante vLLM con un plugin específico de Intel Neural Compressor.

Su relevancia actual radica en que permite ejecutar uno de los modelos abiertos de mayor capacidad en infraestructura más asequible, manteniendo puntuaciones de benchmark muy cercanas al modelo original en FP8: entre el 94 % y el 101 % de la referencia según la tarea. La licencia MIT y el formato estándar de transformers/safetensors facilitan su integración en pipelines existentes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer Mixture-of-Experts (MoE), basado en DeepSeek-V3.2 |
| Parametros totales | 386 266 597 120 (safetensors del checkpoint cuantizado); 685 000 millones según la model card del modelo base |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible en la información proporcionada; el ejemplo de despliegue usa `--max-model-len 102400` |
| Tipos de cuantizacion | MXFP8 W8A8 (grupo 32, escalado dinámico), NVFP4 en expertos MoE, indexer en 16 bits |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors (empaquetado `auto_round:llm_compressor`), librería transformers |

## Arquitectura y entrenamiento

El checkpoint hereda la arquitectura del modelo base DeepSeek-V3.2, un transformer con capas de mezcla de expertos (MoE). La model card del repositorio no detalla la composición del dataset de entrenamiento original ni el número de tokens utilizados, ya que esta ficha describe una cuantización y no un entrenamiento nuevo. Tampoco se especifican en la información disponible detalles sobre RLHF, DPO u otras fases de alineamiento del modelo base.

La innovación técnica de esta versión es el esquema de cuantización de precisión mixta generado con AutoRound 0.17.0. Las capas generales emplean MXFP8 con tamaño de grupo 32 y escalado dinámico de activaciones, mientras que las capas de expertos MoE se cuantizan a NVFP4, un formato de coma flotante de 4 bits con bloque de escalado pensado para hardware con soporte nativo (por ejemplo, GPUs Blackwell). Los módulos indexer se conservan en 16 bits para preservar la precisión en el enrutamiento. El proceso de AutoRound optimiza el redondeo de pesos mediante descenso de gradiente con signo, lo que reduce el error de cuantización respecto a métodos de redondeo naive.

## Capacidades

- Generación de texto y razonamiento de propósito general, con modo de razonamiento explícito (`enable_thinking`) y control de esfuerzo (`reasoning_effort`).
- Razonamiento matemático avanzado, evaluado en AIME 2025 y GSM8K.
- Generación y razonamiento sobre código, evaluado en LiveCodeBench v6.
- Respuesta a preguntas de conocimiento científico y de sentido común (GPQA Diamond, PIQA).
- Soporte de tool calling y function calling mediante el parser `deepseek_v32` y `--enable-auto-tool-choice` en vLLM.
- Soporte de agentes y razonamiento multi-paso a través del parser de razonamiento `deepseek_v3`.
- Capacidades multilingües: no disponibles en la información proporcionada.
- Visión y audio: no disponibles en la información proporcionada.

## Casos de uso

- Asistencia técnica y atención al cliente: el modelo puede mantener conversaciones multi-turno con ventanas de contexto de hasta 102 400 tokens en la configuración de ejemplo, lo que permite adjuntar documentación extensa o historiales largos sin truncar.
- Generación de código en producción: con tool calling y parser de razonamiento, encaja en pipelines de CI/CD donde el modelo invoca herramientas (linters, tests, APIs de repositorio) y razona sobre los resultados antes de proponer parches.
- Agentes autónomos de investigación: el soporte de razonamiento multi-paso y de esfuerzo de razonamiento configurable permite tareas de planificación y descomposición de problemas complejos con trazabilidad del proceso.
- Despliegue en clústeres con GPUs Blackwell o con soporte NVFP4: la cuantización mixta reduce el coste por token frente al modelo en FP8, adecuado para servicios de inferencia de alto volumen con `--max-num-seqs 512`.
- Evaluación y benchmarking de modelos abiertos: sirve como referencia cuantizada para comparar calidad frente al modelo original en FP8 en tareas de matemáticas, código y conocimiento, manteniendo las mismas versiones de dataset y ajustes de generación.
- Investigación académica con recursos limitados: al reducir el espacio de pesos, permite experimentar con un modelo de escala frontera en infraestructura más modesta, siempre que se cumplan los requisitos del plugin de Intel.
- Sistemas RAG con contexto largo: la ventana de contexto y el modo de razonamiento permiten inyectar grandes volúmenes de documentos recuperados y sintetizar respuestas con citas implícitas.

## Benchmarks y rendimiento

Resultados publicados en la model card, comparando el checkpoint cuantizado (Intel NVFP4) con la referencia FP8 del modelo original:

| Benchmark | Referencia FP8 | Intel (NVFP4) | Ratio |
|---|---:|---:|---:|
| AIME 2025 | 92,22 | 86,67 | 93,98 % |
| GPQA Diamond | 84,17 | 83,84 | 99,60 % |
| GSM8K | 97,45 | 97,37 | 99,92 % |
| LiveCodeBench v6 | 80,39 | 81,52 | 101,41 % |
| PIQA | 94,29 | 94,67 | 100,41 % |

Los ajustes de generación empleados habilitan el razonamiento de DeepSeek con `temperature=1.0`, `top_p=0.95`, `reasoning_effort="max"` y `max_tokens=64000`. La mayor caída se observa en AIME 2025 (aproximadamente 6 puntos porcentuales), mientras que en el resto de tareas la diferencia es inferior al 0,5 % o incluso favorable al checkpoint cuantizado.

## Requisitos de hardware

- VRAM estimada: el repositorio ocupa 389,1 GB, por lo que la inferencia requiere un mínimo práctico cercano a esa cifra más el espacio para KV cache y activaciones. El ejemplo de despliegue usa `--gpu-memory-utilization 0.95` con tensor parallelism de 4.
- GPUs recomendadas: GPUs con soporte nativo de NVFP4 (familia Blackwell) para aprovechar el formato de los expertos; en GPUs sin soporte nativo puede usarse la ruta QDQ del plugin con `VLLM_QDQ=1`, si la configuración de vLLM y GPU lo permite.
- GPU de consumo: no cabe en GPUs de consumo convencionales (RTX 4090, 24 GB) por el tamaño del checkpoint; se requiere un despliegue multi-GPU.
- Opciones de despliegue: vLLM con el plugin de Intel Neural Compressor (`benchmark/vllm-qdq-plugin/`), instalado en el mismo entorno Python que vLLM. La model card no menciona soporte para llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles en la información proporcionada. La configuración de ejemplo sugiere `--max-num-seqs 512`, `--max-num-batched-tokens 20000` y `--enable-chunked-prefill` para cargas concurrentes.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| DeepSeek-V3.2-NVFP4-AutoRound (este) | 386 266 597 120 en safetensors (685 000 M en el base) | no disponible (ejemplo con 102 400) | MXFP8 + NVFP4 mixta | MIT | Hugging Face, vLLM con plugin |
| deepseek-ai/DeepSeek-V3.2 (FP8) | 685 000 M | no disponible | FP8 | MIT | Hugging Face |
| Otras cuantizaciones de DeepSeek-V3.2 | no disponible | no disponible | no disponible | MIT (heredada) | no disponible |

La comparación directa más relevante es con el modelo base en FP8, del que este checkpoint es una versión comprimida. No se dispone en la información proporcionada de datos sobre otras alternativas de la misma categoría (por ejemplo, otros modelos MoE de escala frontera) para establecer una comparativa cuantitativa adicional.

## Limitaciones y advertencias

- El modelo puede producir salidas factualmente incorrectas, sesgadas o dañinas; la model card advierte explícitamente de que no debe usarse como única fuente de información factual.
- La cuantización introduce una degradación medible en tareas de razonamiento matemático intensivo (AIME 2025 cae al 93,98 % de la referencia), por lo que conviene validar el rendimiento en el dominio concreto antes de desplegar.
- El despliegue requiere instalar un plugin específico de Intel Neural Compressor en el entorno de vLLM; sin él, el formato AutoRound NVFP4 no se registra correctamente.
- En GPUs sin soporte nativo de NVFP4 es necesario usar la ruta QDQ (`VLLM_QDQ=1`), sujeta a la compatibilidad de vLLM y de la GPU; el rendimiento en ese modo no está documentado en la información disponible.
- Los requisitos de memoria son elevados (389,1 GB de pesos), lo que limita el despliegue a clústeres multi-GPU.
- No se especifican los idiomas soportados ni posibles sesgos lingüísticos o culturales del modelo base.
- La licencia MIT se hereda del modelo base, pero la model card remite a los términos de uso del modelo original; conviene revisarlos para uso comercial.
- La fecha de creación del repositorio (2026-11-04) y el bajo número de descargas (32) sugieren que se trata de una publicación reciente con poca validación comunitaria todavía.

## Enlaces

- Hugging Face del checkpoint: https://huggingface.co/intel-ai/DeepSeek-V3.2-NVFP4-AutoRound
- Modelo base: https://huggingface.co/deepseek-ai/DeepSeek-V3.2
- Repositorio de AutoRound: https://github.com/intel/auto-round
- Intel Neural Compressor (plugin vLLM): https://github.com/intel/neural-compressor
- Paper de AutoRound: https://arxiv.org/abs/2309.05516
