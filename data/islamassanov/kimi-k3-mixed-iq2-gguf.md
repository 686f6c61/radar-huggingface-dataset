# islamassanov/Kimi-K3-Mixed-IQ2-GGUF

## Resumen

Kimi K3 es un modelo de lenguaje multimodal de código abierto desarrollado por Moonshot AI, con aproximadamente 2,78 billones de parámetros (2.779.483.135.584) y una arquitectura de mezcla de expertos (MoE) híbrida que combina atención KDA y MLA. El modelo acepta entradas de texto, imagen y vídeo, y soporta una ventana de contexto de hasta un millón de tokens, lo que lo sitúa en la categoría de modelos de frontera para tareas de codificación de largo alcance, razonamiento agéntico y comprensión visual.

Este repositorio concreto, `islamassanov/Kimi-K3-Mixed-IQ2-GGUF`, ofrece una cuantización mixta de muy baja precisión (2,45 bpw) en formato GGUF para su uso con `llama.cpp`. La cuantización utiliza matrices IQ2_XXS e IQ2_XS para los pesos de los expertos enrutados, manteniendo el proyector de visión en BF16. El resultado es un paquete de 852,4 GB repartido en diez shards, que permite ejecutar el modelo en entornos con múltiples GPU de alta gama, aunque con una pérdida de rendimiento esperable en tareas complejas debido a la agresividad de la cuantización.

La relevancia de esta ficha radica en que Kimi K3 es uno de los primeros modelos abiertos de escala 2,8T con multimodalidad nativa y contexto ultralargo, y esta cuantización permite a desarrolladores e investigadores probarlo con herramientas estándar del ecosistema GGUF, aunque con requisitos de hardware muy exigentes.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE híbrido con atención KDA y MLA, multimodal (texto, imagen, vídeo) |
| Parametros totales | 2.779.483.135.584 (~2,78 billones) |
| Parametros activos | no disponible |
| Longitud de contexto | 1.000.000 tokens (según documentación del modelo base) |
| Tipos de cuantizacion | IQ2_XXS e IQ2_XS para pesos de expertos; BF16 para proyector de visión; tasa global 2,45 bpw |
| Idiomas soportados | no disponible |
| Licencia | kimi-k3 (licencia propia de Moonshot AI, consultar términos) |
| Formato de pesos | GGUF (10 shards numerados, con hashes SHA-256 en `verification-receipt.json`) |

## Arquitectura y entrenamiento

Kimi K3 emplea una arquitectura de mezcla de expertos (MoE) multimodal con una combinación de mecanismos de atención KDA (Kernel-based Dynamic Attention) y MLA (Multi-head Latent Attention), según la ficha técnica de NVIDIA NIM. El modelo procesa texto, imágenes y vídeo de forma nativa dentro de un único modelo, sin módulos separados, y soporta una ventana de contexto de un millón de tokens. No se han publicado en la información disponible detalles sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de alineación como RLHF o DPO. La cuantización de este repositorio utiliza una estrategia mixta: los pesos de los expertos enrutados se cuantizan con IQ2_XXS (146.048 matrices) e IQ2_XS (101.248 matrices), mientras que 2.628 tensores se mantienen en formatos de mayor precisión, y el proyector de visión se conserva en BF16.

## Capacidades

- Generación de texto y razonamiento complejo, incluyendo tareas de codificación de largo alcance y trabajo de conocimiento.
- Comprensión multimodal nativa: procesa imágenes, vídeo y texto dentro del mismo modelo, sin necesidad de adaptadores externos.
- Ventana de contexto de 1.000.000 de tokens, adecuada para documentos extensos, repositorios de código completos o conversaciones de muy larga duración.
- Uso agéntico y tool calling: según la descripción de NVIDIA NIM, el modelo está diseñado para tareas agénticas y uso de herramientas, aunque no se especifican detalles concretos de implementación.
- Capacidades multilingües: no se han publicado los idiomas soportados en la información disponible.
- Modo de razonamiento: no se menciona un modo de pensamiento explícito en la documentación consultada.

## Casos de uso

- Análisis de repositorios de código completos: gracias a su contexto de 1M tokens, el modelo puede ingerir un proyecto entero y responder preguntas sobre arquitectura, dependencias o posibles errores, lo que resulta útil en revisiones de código a gran escala.
- Asistencia en programación de larga duración: en un IDE o agente autónomo, el modelo puede mantener el estado de una sesión de desarrollo durante horas, generando y modificando código en múltiples archivos sin perder el hilo.
- Procesamiento de documentos extensos y multimodales: puede resumir o extraer información de informes anuales, tesis o manuales técnicos que incluyan gráficos, tablas e imágenes, combinando comprensión visual y textual.
- Automatización de tareas agénticas con herramientas: el modelo puede orquestar llamadas a APIs, ejecutar comandos o interactuar con bases de datos en flujos de trabajo de varios pasos, gracias a su soporte de tool calling.
- Análisis de vídeo para vigilancia o revisión de contenido: al aceptar entradas de vídeo, puede transcribir, describir o buscar eventos específicos en grabaciones, aunque la cuantización IQ2 puede afectar a la precisión en tareas visuales finas.
- Investigación académica en modelos MoE a gran escala: esta cuantización permite a investigadores con acceso a clústeres multi-GPU estudiar el comportamiento de un modelo de 2,8T parámetros sin necesidad de los 1,4 TB del modelo original en FP16.

## Benchmarks y rendimiento

La única métrica publicada en la información disponible es OCRBench, comparando esta cuantización con el modelo base:

| Benchmark | Esta cuantización (IQ2) | Modelo base Kimi K3 | Retención de puntuación |
|---|---:|---:|---:|
| OCRBench | 871 / 1.000 (87,1%) | 890 / 1.000 (89,0%) | 97,9% |

No se han publicado resultados para otros benchmarks como MMLU, HumanEval o GSM8K en la información proporcionada. La retención del 97,9% en OCRBench sugiere que la cuantización conserva bien el rendimiento en tareas de reconocimiento óptico de caracteres, pero no hay datos sobre razonamiento, matemáticas o generación de código.

## Requisitos de hardware

- VRAM estimada: el modelo cuantizado ocupa aproximadamente 852 GB en disco, por lo que se necesitan al menos 850 GB de VRAM para cargar los pesos, más memoria adicional para las activaciones y el contexto. Esto implica un mínimo de 10 GPU de 80 GB (por ejemplo, H100 o A100) o configuraciones similares.
- GPU recomendadas: NVIDIA H100 (80 GB) o A100 (80 GB) en configuraciones multi-GPU. No cabe en ninguna GPU de consumo (RTX 4090, 3090, etc.) ni siquiera con cuantización extrema.
- Opciones de despliegue: `llama.cpp` (servidor OpenAI-compatible) es la opción principal, cargando el primer shard y dejando que la herramienta descubra el resto automáticamente. También se puede usar `llama-server` con el proyector BF16 para entradas de imagen. No se recomienda vLLM ni Ollama para este tamaño.
- Latencia y throughput: no se han publicado datos. Dada la cuantización y el tamaño, se espera una latencia alta incluso en clústeres potentes, y el throughput dependerá críticamente del ancho de banda de memoria de las GPU.

## Comparativa con modelos similares

No se dispone de datos de benchmarks comparativos con otros modelos de la misma categoría (MoE multimodales de escala 2T+). La siguiente tabla compara esta cuantización con el modelo base y con otras cuantizaciones GGUF de Kimi K3 existentes en Hugging Face, aunque sin métricas de rendimiento publicadas para estas últimas.

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Kimi K3 (base) | 2,78T | 1M | FP16 (original) | kimi-k3 | Hugging Face |
| Kimi-K3-Mixed-IQ2 (este repo) | 2,78T | 1M | IQ2 mixto (2,45 bpw) | kimi-k3 | Hugging Face |
| Kimi-K3-GGUF (unsloth) | 2,78T | 1M | GGUF (varias) | kimi-k3 | Hugging Face |
| Kimi-K3-Neuron-IQ2 (vcruz305) | 2,78T | 1M | IQ2 | kimi-k3 | Hugging Face |

No se han encontrado datos de rendimiento para las cuantizaciones de unsloth o vcruz305, por lo que no es posible establecer una comparación cuantitativa.

## Limitaciones y advertencias

- La cuantización IQ2 es extremadamente agresiva (2,45 bpw). Aunque conserva el 97,9% en OCRBench, es probable que degrade significativamente el rendimiento en tareas de razonamiento complejo, matemáticas o generación de código, donde los errores de cuantización se acumulan.
- El modelo requiere una infraestructura de hardware masiva (múltiples GPU de 80 GB), lo que limita su uso a centros de datos o clústeres de investigación. No es viable en equipos de consumo.
- La licencia kimi-k3 es una licencia propia de Moonshot AI. Es necesario revisar sus términos específicos en el enlace proporcionado, ya que puede imponer restricciones sobre uso comercial, redistribución o modificaciones.
- No se han publicado los idiomas soportados ni detalles sobre sesgos o alucinaciones. Dado el tamaño y la naturaleza del modelo, es probable que presente sesgos presentes en los datos de entrenamiento, pero no hay información verificada.
- El contexto de 1M tokens es una capacidad teórica; en la práctica, el uso de ventanas tan largas con esta cuantización puede provocar degradación adicional y requerir mucha memoria para las claves y valores de atención.
- El repositorio no incluye un archivo de configuración de chat template ni instrucciones de uso más allá del comando `llama-server`; se recomienda consultar la documentación del modelo base para conocer el formato de prompts adecuado.

## Enlaces

- Repositorio de esta cuantización: https://huggingface.co/islamassanov/Kimi-K3-Mixed-IQ2-GGUF
- Modelo base MoonshotAI/Kimi-K3: https://huggingface.co/MoonshotAI/Kimi-K3
- Licencia Kimi K3: https://huggingface.co/MoonshotAI/Kimi-K3/blob/main/LICENSE
- Página oficial de Kimi K3: https://www.kimi.ai/ai-models/kimi-k3
- Ficha técnica en NVIDIA NIM: https://build.nvidia.com/moonshotai/kimi-k3/modelcard
- Cuantización GGUF de unsloth: https://huggingface.co/unsloth/Kimi-K3-GGUF
- Cuantización GGUF de vcruz305: https://huggingface.co/vcruz305/Kimi-K3-Neuron-IQ2-GGUF
