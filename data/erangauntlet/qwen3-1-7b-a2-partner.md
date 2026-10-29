# erangauntlet/qwen3-1.7b-a2-partner

## Resumen

`erangauntlet/qwen3-1.7b-a2-partner` es un adaptador LoRA (PEFT) entrenado mediante SFT sobre el modelo base `Qwen/Qwen3-1.7B`, el transformer denso de 1.700 millones de parámetros publicado por el equipo Qwen de Alibaba Cloud. El repositorio no contiene pesos completos, sino únicamente los tensores del adaptador en formato safetensors (0,1 GB), por lo que su uso exige descargar el modelo base y cargar el adaptador con la librería PEFT.

Se trata de una publicación de autor individual, con cero descargas y cero valoraciones en el momento de redactar esta ficha, y con una model card que conserva el texto plantilla de Hugging Face sin cumplimentar: no se especifican datos de entrenamiento, idiomas, licencia, hiperparámetros, evaluación ni el propósito concreto del ajuste. El nombre del repositorio ("a2-partner") sugiere un ajuste orientado a un asistente o compañero conversacional, pero no hay documentación que lo confirme.

Su relevancia práctica es limitada como artefacto aislado y alta como ejemplo del flujo de trabajo PEFT/TRL sobre modelos pequeños: el modelo base Qwen3-1.7B ofrece decodificación densa, contexto nativo de 32K tokens y modos de razonamiento "thinking" y "non-thinking", lo que lo sitúa en el rango de los 1-2B parámetros aptos para despliegue en GPU de consumo, portátiles y dispositivos móviles.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre transformer decoder-only denso Qwen3-1.7B |
| Parámetros totales | 1.700 millones en el modelo base; el adaptador ocupa 0,1 GB en el repositorio |
| Parámetros activos | No aplica: el modelo base es denso, no MoE |
| Longitud de contexto | 32.768 tokens (32K) en el modelo base, según la información disponible; el adaptador no redefine este valor |
| Tipos de cuantización | El adaptador se distribuye sin cuantizar (safetensors); el modelo base admite cuantizaciones de la comunidad (GGUF, AWQ, GPTQ), no detalladas en la información proporcionada |
| Idiomas soportados | No disponible en la model card del adaptador; el modelo base se describe como multilingüe |
| Licencia | No disponible |
| Formato de pesos | safetensors más `adapter_config.json` (adaptador PEFT/LoRA); requiere el modelo base en safetensors o cuantizado |

## Arquitectura y entrenamiento

El artefacto es un adaptador de bajo rango (LoRA) sobre un transformer decoder-only denso de 28 capas y 1,7B parámetros, con atención causal estándar y las innovaciones propias de la familia Qwen3 en el modelo base: conmutación entre modo de razonamiento explícito y modo directo, y entrenamiento multilingüe. El adaptador añade matrices de rango reducido en las proyecciones del modelo, de modo que en inferencia los pesos efectivos son la suma del base más la actualización `BA`, sin coste apreciable de latencia una vez fusionados.

El entrenamiento se realizó con SFT (supervised fine-tuning) usando TRL y PEFT 0.21.2, según las etiquetas y el campo `framework versions` de la model card. No se documenta el conjunto de datos, el número de tokens de entrenamiento, la composición del corpus, la existencia de fases posteriores de RLHF/DPO, el rango LoRA, el alpha, la tasa de aprendizaje ni la precisión mixta empleada. Tampoco se indican evaluación, ablation ni comparación con el modelo base, por lo que no es posible determinar qué capacidades ha modificado el ajuste ni en qué medida.

## Capacidades

- Generación de texto conversacional multi-turno, heredada del modelo base Qwen3-1.7B.
- Razonamiento en dos modos (thinking / non-thinking) según la configuración del prompt del modelo base; el adaptador no documenta si preserva este comportamiento.
- Generación de código y resolución de problemas matemáticos básicos, dentro del rango de un modelo de 1,7B parámetros.
- Soporte multilingüe heredado del base, sin lista de idiomas confirmada para el adaptador.
- Capacidad potencial de tool calling / function calling por herencia del modelo base; no verificada tras el ajuste SFT.
- Encaje en flujos de agente de varios pasos solo en escenarios sencillos, dado el tamaño del modelo.
- No se documentan capacidades de visión, audio ni multimodales.

## Casos de uso

- Evaluación de adaptadores LoRA en investigación: cargar el adaptador con `PeftModel.from_pretrained` sobre Qwen3-1.7B para medir la degradación o mejora respecto al base en un conjunto de validación propio, dado que el autor no publica métricas.
- Prototipado de asistentes conversacionales en local: un modelo de 1,7B en bf16 ocupa unos 3,4 GB de pesos, por lo que puede ejecutarse en un portátil con GPU de 8 GB mientras se itera sobre el prompt y el adaptador.
- Despliegue en dispositivos de gama alta: el modelo base cuenta con soporte en Qualcomm AI Hub y existen conversiones para NPU (por ejemplo, `NexaAI/qwen3-1.7B-npu`), lo que permite probar el adaptador fusionado en escenarios de inferencia en el dispositivo.
- Procesamiento de documentos con contexto largo: los 32K tokens del base permiten resumir contratos, informes o hilos de correo completos en una sola pasada, siempre que el ajuste no haya degradado la capacidad de contexto.
- Asistencia a la programación en entornos con recursos limitados: autocompletado, generación de tests unitarios y explicación de fragmentos de código donde no es viable desplegar un modelo de 30B o superior.
- Base para un fine-tuning interno de dominio: el adaptador sirve como punto de partida reproducible (SFT con TRL) para ajustar un asistente sectorial sobre datos propios, con un coste de entrenamiento muy bajo.
- Clasificación y extracción de entidades en pipelines por lotes: con temperatura 0 y salidas restringidas, un 1,7B puede etiquetar grandes volúmenes de texto con coste de cómputo reducido.
- Docencia y experimentación con PEFT: el repositorio, de solo 0,1 GB, es un ejemplo manejable para ilustrar el ciclo completo de entrenamiento y publicación de un adaptador.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks para este adaptador en la información disponible. La model card no incluye sección de evaluación cumplimentada ni comparación con el modelo base.

Los resultados de búsqueda web consultados mencionan, sin tablas numéricas en el material proporcionado, que Qwen3-1.7B se aproxima en calidad a Qwen2.5-3B y que incorpora modos thinking/non-thinking con 32K de contexto nativo; estas afirmaciones corresponden a análisis de terceros sobre el modelo base y no deben atribuirse al adaptador.

| Benchmark | Adaptador | Qwen3-1.7B (base) | Fuente |
|---|---|---|---|
| MMLU | No disponible | No disponible en la información proporcionada | — |
| HumanEval | No disponible | No disponible en la información proporcionada | — |
| GSM8K | No disponible | No disponible en la información proporcionada | — |

## Requisitos de hardware

- VRAM en bf16/fp16: aproximadamente 3,4 GB solo para pesos del modelo base, más KV cache (crece con la longitud de contexto); con 8K de contexto en una GPU de 8 GB se opera con margen.
- VRAM en cuantización int8: en torno a 1,8-2 GB de pesos, apto para GPU de 4 GB.
- VRAM en cuantización de 4 bits (GGUF Q4_K_M): aproximadamente 1,1-1,3 GB, lo que permite ejecución en CPU con 8 GB de RAM y en iGPU.
- GPU recomendadas: RTX 4090, RTX 3090, A100 o H100 para servir lotes concurrentes; RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070 o superiores para desarrollo individual; GTX 1650 4 GB o Apple Silicon con 8 GB unificados para cuantizaciones de 4 bits.
- Cabe en GPU de consumo: sí, en cualquier tarjeta con 4 GB o más usando cuantización, y con 8 GB en precisión completa.
- Opciones de despliegue: Transformers + PEFT (ruta directa para el adaptador), vLLM o TGI (requieren fusionar el adaptador con `merge_and_unload` antes de servir), llama.cpp y Ollama (tras fusionar y convertir a GGUF), además de runtimes móviles como MNN o Qualcomm AI Hub para el modelo base.
- Latencia y throughput: no se han publicado medidas para este adaptador. Al ser un modelo denso de 1,7B, el rendimiento vendrá determinado casi por completo por el backend y la cuantización elegidos, no por el adaptador.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Este adaptador (sobre Qwen3-1.7B) | 1,7B (adaptador LoRA de 0,1 GB) | 32K (heredado del base) | No disponible | Hugging Face, 0 descargas, autor individual |
| Qwen3-1.7B (base) | 1,7B densos | 32K | No especificada en la información proporcionada | Hugging Face (Qwen), Qualcomm AI Hub, Together AI |
| Qwen2.5-1.5B | 1,5B densos | 32K | Apache 2.0 | Hugging Face, amplia adopción |
| Llama 3.2 1B | 1,2B densos | 128K | Licencia comunitaria de Llama 3.2 | Hugging Face (Meta), ecosistema amplio |
| Gemma 3 1B | 1B densos | 32K | Términos de uso de Gemma | Hugging Face (Google), pesos abiertos |

Los datos de las filas correspondientes a modelos de terceros provienen de la documentación pública de sus autores y no forman parte de la información proporcionada en esta ficha; conviene verificarlos antes de tomar decisiones de producción. El adaptador no aporta ninguna ventaja diferencial demostrada frente al modelo base ni frente a estas alternativas, al carecer de evaluación publicada.

## Limitaciones y advertencias

- Model card sin cumplimentar: sección de descripción, datos, hiperparámetros y evaluación con marcadores "[More Information Needed]" en su totalidad.
- Licencia no declarada: no es posible determinar si el uso comercial está permitido. La licencia del modelo base tampoco se detalla en la información proporcionada, por lo que hay que consultarla por separado antes de cualquier despliegue.
- Procedencia desconocida de los datos de SFT: no se puede evaluar la calidad, el sesgo ni la posible contaminación del corpus de entrenamiento.
- Riesgo de alucinación: inherente a un modelo de 1,7B parámetros, agravado por un ajuste SFT sin evaluación que puede haber reforzado estilos o afirmaciones del conjunto de entrenamiento.
- Capacidades del base potencialmente degradadas: el ajuste puede haber reducido el rendimiento en código, matemáticas o tool calling respecto a Qwen3-1.7B original; no hay datos para comprobarlo.
- Sesgos: no evaluados. Un modelo pequeño multilingüe tiende a rendir peor en lenguas distintas del inglés y del chino, con mayor riesgo en castellano.
- Limitación de contexto: 32K tokens nominales del base, con degradación esperable en el extremo superior de la ventana incluso antes del ajuste.
- Dependencia de la versión del modelo base: el adaptador solo es compatible con `Qwen/Qwen3-1.7B` en la revisión concreta usada en el entrenamiento; otras revisiones o variantes pueden producir errores de carga o resultados incorrectos.
- Ausencia total de tracción: cero descargas y cero valoraciones implican que no existe validación por parte de la comunidad.
- Para servir con vLLM, TGI, llama.cpp u Ollama es necesario fusionar previamente el adaptador; no se puede cargar como modelo independiente.
- No apto para producción sin una evaluación propia previa y sin una revisión legal de la licencia.

## Enlaces

- Repositorio del adaptador: https://huggingface.co/erangauntlet/qwen3-1.7b-a2-partner
- Modelo base Qwen3-1.7B: https://huggingface.co/Qwen/Qwen3-1.7B
- Qwen3-1.7B en Qualcomm AI Hub: https://aihub.qualcomm.com/models/qwen3_1_7b
- Qwen3-1.7B en Together AI: https://www.together.ai/models/qwen3-1-7b
- Conversión a NPU (NexaAI): https://huggingface.co/NexaAI/qwen3-1.7B-npu
- Análisis de benchmarks y despliegue móvil de Qwen3-1.7B: https://tokenmix.ai/blog/qwen3-1-7b-tiny-model-benchmarks-mobile-2026
- Referencia metodológica citada en la model card (Lacoste et al., 2019): https://arxiv.org/abs/1910.09700
- Calculadora de impacto medioambiental citada en la model card: https://mlco2.github.io/impact#compute
