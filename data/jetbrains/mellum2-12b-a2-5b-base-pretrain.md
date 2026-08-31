# JetBrains/Mellum2-12B-A2.5B-Base-Pretrain

## Resumen

Mellum2 Base Pretrain es un modelo de lenguaje causal desarrollado por JetBrains, diseñado como punto de partida para investigación en extensión de contexto largo y fine-tuning. Forma parte de la familia Mellum2, que incluye versiones base, instruct y thinking, todas orientadas a inferencia eficiente en entornos de producción. Este checkpoint concreto es la versión de preentrenamiento antes de la extensión de contexto, con una ventana de 8.192 tokens.

El modelo emplea una arquitectura Mixture-of-Experts (MoE) con 64 expertos y 8 activos por token, lo que le otorga 12.149 millones de parámetros totales pero solo 2.500 millones activos durante la inferencia. Esta característica reduce sustancialmente el coste computacional y permite altas tasas de throughput con baja latencia, algo crítico para cargas de trabajo en tiempo real. El modelo está entrenado exclusivamente en inglés y se distribuye bajo licencia Apache 2.0.

La relevancia de este checkpoint radica en su utilidad como base para investigación y desarrollo: al ser un modelo de preentrenamiento puro, los desarrolladores pueden extender su contexto, continuar el entrenamiento o aplicar técnicas de alineación sin partir de un modelo ya modificado. No está pensado para uso directo en aplicaciones, sino como materia prima para construir modelos especializados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture-of-Experts (MoE) con atención GQA y capas de ventana deslizante |
| Parametros totales | 12.149.923.072 (12,1 B) |
| Parametros activos | 2.500.000.000 (2,5 B) |
| Longitud de contexto | 8.192 tokens |
| Tipos de cuantizacion | no disponible (pesos en safetensors sin cuantización declarada) |
| Idiomas soportados | inglés |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

Mellum2 Base emplea una arquitectura Transformer con mezcla de expertos (MoE). Dispone de 28 capas, con un tamaño oculto de 2304 y un tamaño intermedio de 7168. La capa MoE tiene un tamaño intermedio de 896 y activa 8 de los 64 expertos por token, lo que permite un equilibrio entre capacidad y eficiencia computacional. La atención utiliza Grouped Query Attention (GQA) con 32 cabezas para consultas y 4 para claves/valores. Además, combina capas de atención de ventana deslizante (sliding window de 1024 tokens) con capas de atención completa, un diseño que reduce el coste de memoria y acelera la inferencia en secuencias largas.

El vocabulario tiene 98.304 tokens. El modelo se entrenó con datos en inglés, aunque no se han publicado detalles específicos sobre el volumen de tokens ni la composición del dataset. Al ser un checkpoint de preentrenamiento, no ha pasado por etapas de alineación como RLHF o DPO; esa responsabilidad recae en las versiones Instruct y Thinking de la familia. La precisión de entrenamiento no se indica en la información disponible.

## Capacidades

- Generación de texto causal en inglés con buen rendimiento en tareas de razonamiento general (MMLU 70,87, BBH 74,90).
- Razonamiento matemático y lógico: GSM8K 81,73, aunque MATH es bajo (9,96), indicando limitaciones en problemas matemáticos avanzados.
- Generación de código: HumanEval 41,46, MBPP 62,40 y soporte multilingüe de código a través de MultiPL-E (20,97 en 7 lenguajes).
- Comprensión de ejecución de código: CRUXEval-I 45,38 y CRUXEval-O 43,88.
- No se menciona soporte explícito para tool calling o function calling en la información disponible.
- No se indica capacidad de procesamiento de visión, audio u otras modalidades.
- Solo inglés; no hay soporte multilingüe declarado.

## Casos de uso

- Investigación en extensión de contexto: el checkpoint está diseñado específicamente para experimentar con ventanas de contexto más largas, ya que es la fase previa a la extensión. Los investigadores pueden aplicar técnicas como interpolación posicional o RoPE scaling sobre estos pesos.
- Fine-tuning para tareas específicas de código: al ser un modelo base, se puede ajustar con datasets propios de generación, reparación o explicación de código, aprovechando su buen rendimiento en HumanEval y MBPP.
- Entrenamiento continuado con dominios verticales: por ejemplo, ajuste con documentación técnica, logs de sistemas o código propietario de una empresa, para crear un modelo especializado.
- Evaluación de arquitecturas MoE eficientes: sirve como referencia para comparar el equilibrio entre parámetros activos y calidad de salida frente a modelos densos del mismo tamaño.
- Prototipado de sistemas de razonamiento multi-paso: su capacidad en BBH y GSM8K permite experimentar con cadenas de pensamiento o generación de razonamiento estructurado antes de aplicar alineación.
- Benchmarking de infraestructura de inferencia: al ser un modelo MoE con 2,5 B activos, es adecuado para medir rendimiento de servidores de inferencia como vLLM o TGI en entornos con restricciones de memoria.

## Benchmarks y rendimiento

Los resultados presentados a continuación son los declarados por JetBrains en la model card. Se refieren al checkpoint Base Pretrain, sin ajuste instructivo.

| Benchmark | Métrica | Resultado |
|---|---|---|
| HumanEval | pass@1 | 41,46 |
| HumanEval+ | pass@1 | 37,20 |
| MBPP | pass@1 | 62,40 |
| MBPP+ | pass@1 | 78,31 |
| MultiPL-E (7 lenguajes) | pass@1 | 20,97 |
| CRUXEval-I | pass@1 | 45,38 |
| CRUXEval-O | pass@1 | 43,88 |
| MMLU | accuracy | 70,87 |
| MMLU-Pro | exact match | 59,31 |
| BBH | exact match | 74,90 |
| ARC-Challenge | accuracy normalizada | 53,50 |
| HellaSwag | accuracy normalizada | 73,72 |
| WinoGrande | accuracy | 65,51 |
| TruthfulQA MC2 | MC2 | 44,51 |
| GSM8K | exact match | 81,73 |
| MATH | exact match | 9,96 |
| GPQA Diamond | accuracy | 31,31 |
| GPQA Main | accuracy | 35,04 |

## Requisitos de hardware

- VRAM estimada: con 12,1 B parámetros totales en FP16, el modelo requiere aproximadamente 24,3 GB de memoria solo para pesos. Con cuantización a 8 bits bajaría a ~12 GB, y a 4 bits a ~6 GB. Los parámetros activos de 2,5 B no reducen la memoria necesaria para cargar los pesos totales.
- GPU recomendadas: para inferencia con cuantización 8 bits, una RTX 4090 (24 GB) o A100 de 40 GB es suficiente. En 4 bits, cabe en GPUs de 8-10 GB como RTX 3080 o RTX 4070. Para fine-tuning completo, se necesitan GPUs con 40 GB o más.
- En consumer GPU: sí, con cuantización a 4 bits cabe en tarjetas de gama alta como RTX 3090/4090. Sin cuantización, requiere hardware de datacenter.
- Opciones de despliegue: vLLM, TensorRT-LLM, TGI, llama.cpp, Ollama (si se generan archivos GGUF). El formato safetensors permite conversión a estos formatos.
- Latencia y throughput: no se han publicado cifras oficiales. Dado que solo se activan 2,5 B parámetros por token, se espera una velocidad de generación significativamente mayor que un modelo denso de 12 B, aunque esto depende del hardware y la implementación.

## Comparativa con modelos similares

No se dispone de resultados de benchmarks comparativos directos en la información proporcionada. Sin embargo, se puede contextualizar el modelo frente a alternativas de la misma categoría (MoE de ~12 B totales):

| Modelo | Parámetros totales | Parámetros activos | Contexto | Licencia | Observaciones |
|---|---|---|---|---|---|
| Mellum2-12B-A2.5B (este) | 12,1 B | 2,5 B | 8.192 | Apache 2.0 | Enfoque en eficiencia y código |
| Mixtral 8x7B | 46,7 B | 12,9 B | 32.768 | Apache 2.0 | Más grande, contexto mayor, pero más costoso |
| Qwen2.5-14B (denso) | 14,8 B | 14,8 B | 128.000 | Apache 2.0 | Denso, contexto muy largo, sin ahorro computacional |

No se pueden comparar rendimientos sin ejecutar los mismos benchmarks bajo condiciones controladas. La ventaja principal de Mellum2 es su balance entre parámetros activos y calidad, que lo hace atractivo para despliegues donde la latencia y el coste importan.

## Limitaciones y advertencias

- Es un modelo de preentrenamiento sin alineación: no está diseñado para conversación directa, puede generar contenido incoherente, ofensivo o factualmente incorrecto si se usa sin fine-tuning.
- Contexto limitado a 8.192 tokens: no apto para documentos largos o conversaciones extensas sin técnicas de extensión.
- Solo inglés: no es útil para tareas multilingües.
- Rendimiento matemático avanzado muy bajo (MATH 9,96): falla en problemas que requieren razonamiento matemático complejo o simbólico.
- Riesgo de alucinación: como todo LLM, puede inventar información, especialmente en tareas abiertas.
- Sesgos potenciales: al entrenarse con datos de internet, puede heredar sesgos sociales, culturales o de género. No se han publicado evaluaciones de sesgo.
- Licencia Apache 2.0 permite uso comercial sin restricciones, pero el usuario es responsable del cumplimiento de las normativas de la UE sobre IA (no se indica si el resumen de datos de entrenamiento cumple con la AI Act).
- No se proporcionan cuantizaciones oficiales; los usuarios deben generarlas o esperar versiones de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/JetBrains/Mellum2-12B-A2.5B-Base-Pretrain
- Blog de lanzamiento de Mellum2: https://huggingface.co/blog/JetBrains/mellum2-launch
- Blog de JetBrains sobre Mellum2 open source: https://blog.jetbrains.com/ai/2026/06/mellum2-goes-open-source-a-fast-model-for-ai-workflows/
- Página oficial de Mellum: https://www.jetbrains.com/mellum/
- Resumen público de contenido de entrenamiento: https://www.jetbrains.com/legal/docs/mellum2/training-content-summary/general-purpose-ai-model/
