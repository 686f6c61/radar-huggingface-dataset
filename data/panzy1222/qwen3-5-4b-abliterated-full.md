# panzy1222/Qwen3.5-4B-Abliterated-Full

## Resumen

Qwen3.5-4B-Abliterated-Full es un modelo de lenguaje publicado en Hugging Face por el usuario panzy1222 bajo el identificador `panzy1222/Qwen3.5-4B-Abliterated-Full`. Por el nombre se infiere que deriva de un modelo de la familia Qwen3.5 de Alibaba, con aproximadamente 4.200 millones de parámetros, y que ha sido sometido a un proceso de "abliteración", una técnica de modificación de pesos orientada a eliminar o atenuar los mecanismos de rechazo aprendidos durante el alineamiento. El repositorio contiene pesos en formato safetensors con un tamano de 8,4 GB y declara la arquitectura `qwen3_5_text` en la librería transformers.

La model card es la plantilla genérica autogenerada por Hugging Face y no aporta información sustantiva: no documenta el proceso de entrenamiento, los datos utilizados, la licencia, los idiomas soportados ni los resultados de evaluación. Todos los campos relevantes aparecen como "[More Information Needed]". Esto convierte al modelo en un artefacto de procedencia opaca, sin trazabilidad sobre el checkpoint base exacto ni sobre la metodología de modificación aplicada.

Su relevancia es limitada y fundamentalmente experimental: resulta útil para investigadores interesados en estudiar los efectos de la abliteración sobre el comportamiento de un modelo de ~4B, pero no es una opción recomendable para despliegues en producción sin una evaluación previa exhaustiva. La ausencia de licencia explícita y de documentación sobre el checkpoint original anaden incertidumbre legal y técnica.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | transformer decoder-only, tipo `qwen3_5_text` (familia Qwen3.5) |
| Parametros totales | 4.205.751.296 (~4,2B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible en el repo (solo safetensors en precision original; compatible con cuantizacion posterior a GGUF/AWQ/GPTQ mediante herramientas externas) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Libreria | transformers |
| Tamano del repositorio | 8,4 GB |
| Pipeline | text-generation |
| Tags | transformers, safetensors, qwen3_5_text, text-generation, conversational, endpoints_compatible, region:us |

## Arquitectura y entrenamiento

El tag `qwen3_5_text` y la librería transformers indican una arquitectura transformer decoder-only propia de la familia Qwen3.5, con 4.205.751.296 parámetros totales según los metadatos de safetensors. No se dispone de información sobre el número de capas, dimensiones ocultas, número de cabezas de atención, vocabulario ni mecanismos específicos (atención con RoPE, GQA, etc.) más allá de lo que se pueda inferir de la familia base.

El sufijo "Abliterated" sugiere la aplicación de una técnica de abliteración, que habitualmente consiste en identificar la dirección en el espacio de activaciones asociada al comportamiento de rechazo y proyectar los pesos para eliminarla. Sin embargo, el autor no documenta ni el checkpoint base exacto, ni el método concreto empleado, ni el dataset o procedimiento de validación. Tampoco hay información sobre datos de entrenamiento, número de tokens, composición del corpus, ni sobre si hubo RLHF, DPO u otras fases de alineamiento. Todo el apartado de entrenamiento de la model card está vacío.

## Capacidades

- Generación de texto autoregresiva y conversación multi-turno, según el tag `conversational`.
- Compatibilidad con el pipeline `text-generation` de transformers y con endpoints compatibles (`endpoints_compatible`).
- Capacidad esperada de razonamiento, código y matemáticas heredada del modelo base Qwen3.5-4B, aunque no verificada ni documentada por el autor.
- Soporte de tool calling y function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible.
- Capacidades especiales (thinking mode, visión, audio): no disponible.
- Efecto esperado de la abliteración: reducción de las respuestas de rechazo ante peticiones que el modelo base declinaría, con posible degradación de la coherencia y de la calidad general.

## Casos de uso

- Investigación sobre abliteración: comparar las respuestas del modelo con las del Qwen3.5-4B original para medir el efecto de la modificación sobre tasas de rechazo, coherencia y calidad en tareas estándar. Requiere disponer del checkpoint base para una comparación controlada.
- Experimentación en entornos de laboratorio: usar el modelo como sujeto de estudio en trabajos de interpretabilidad o de análisis de sesgos, dado su tamano manejable (~4,2B) y su formato safetensors estándar.
- Prototipado rápido de generación de texto: al ser un modelo de ~4B, puede ejecutarse en una GPU consumer para pruebas de concepto de chatbots o generación de texto, siempre que se acepte la falta de garantías sobre calidad y seguridad.
- Generación de datos sintéticos en pipelines internos: con la debida revisión humana, puede emplearse para producir borradores o variaciones de texto en tareas de aumento de datos, aunque la ausencia de evaluación hace necesario validar la calidad de salida.
- Fine-tuning posterior: servir como punto de partida para ajustes específicos (SFT, LoRA) en dominios concretos, ya que el formato safetensors y la compatibilidad con transformers facilitan el entrenamiento con las herramientas habituales (PEFT, TRL).
- Despliegue en endpoints compatibles: el tag `endpoints_compatible` permite servirlo con infraestructura tipo TGI o vLLM para pruebas de latencia y throughput, aunque sin SLA ni soporte del autor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye ninguna tabla de evaluación (MMLU, HumanEval, GSM8K u otras) ni comparaciones con el modelo base.

## Requisitos de hardware

- VRAM estimada para inferencia en precisión original (bf16/fp16): aproximadamente 8,4 GB solo para pesos, más overhead de activaciones y KV cache; se recomienda un mínimo de 10-12 GB de VRAM.
- En cuantización de 8 bits: ~4,5 GB de pesos, viable en GPUs de 8 GB.
- En cuantización de 4 bits (GGUF Q4_K_M o similar): ~2,5-3 GB de pesos, viable en GPUs consumer de 6-8 GB.
- GPUs recomendadas: A100 40/80 GB o H100 para serving de alta concurrencia; RTX 4090 (24 GB) o RTX 3090 (24 GB) para inferencia cómoda en precisión completa; RTX 4070/4060 Ti (12-16 GB) para cuantización 8 bits; GPUs de 8 GB para cuantización 4 bits.
- Cabe en GPU consumer: sí, en la mayoría de tarjetas modernas con cuantización adecuada.
- Opciones de despliegue: transformers (nativo), vLLM y TGI (por el tag `endpoints_compatible`), llama.cpp/Ollama tras conversión a GGUF, y servidores compatibles con la API de OpenAI.
- Latencia y throughput estimados: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| panzy1222/Qwen3.5-4B-Abliterated-Full | ~4,2B | no disponible | no disponible | Hugging Face (0 descargas) | Derivado no documentado, sin benchmarks |
| Qwen3.5-4B (modelo base presumible) | ~4B | no disponible en esta ficha | licencia de la familia Qwen (no verificada aquí) | Hugging Face oficial | Modelo de referencia con documentación y evaluación |
| Qwen2.5-3B / Qwen2.5-7B | 3B / 7B | 32K (según documentación oficial de Qwen2.5) | Apache 2.0 en la mayoría de variantes | Hugging Face oficial | Alternativas consolidadas de tamano similar con licencia clara |
| Llama 3.2 3B | 3B | 128K | Llama 3.2 Community License | Hugging Face (Meta) | Alternativa con licencia conocida y amplio ecosistema |

La comparación con el modelo base Qwen3.5-4B es la más relevante, pero no se dispone de sus especificaciones verificadas en la información proporcionada; los datos de Qwen2.5 y Llama 3.2 se incluyen como referencia de categoría.

## Limitaciones y advertencias

- Procedencia opaca: la model card es la plantilla autogenerada y no documenta el checkpoint base, el método de abliteración ni los datos de entrenamiento.
- Licencia no disponible: no se puede confirmar si el uso comercial está permitido; además, la licencia del modelo base Qwen3.5 puede imponer condiciones adicionales que el autor no ha declarado.
- La abliteración puede degradar la coherencia, aumentar la tasa de alucinaciones y reducir la calidad en tareas de razonamiento, sin que existan evaluaciones publicadas que lo cuantifiquen.
- Riesgo elevado de generar contenido inapropiado o dañino al haberse atenuado los mecanismos de rechazo; no es adecuado para aplicaciones orientadas al usuario final sin filtros adicionales.
- Idiomas soportados no documentados; el comportamiento multilingüe es incierto.
- Longitud de contexto no documentada; no se puede planificar su uso en tareas de contexto largo.
- Cero descargas y cero likes en el momento de la consulta: no hay evidencia de uso ni validación por parte de la comunidad.
- Sin benchmarks ni evaluación de sesgos: imposible estimar su rendimiento relativo frente al modelo base.
- Para producción se recomienda usar el Qwen3.5-4B oficial o alternativas con licencia y documentación claras.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/panzy1222/Qwen3.5-4B-Abliterated-Full
- Referencia citada en los tags (paper sobre impacto ambiental del ML): https://arxiv.org/abs/1910.09700
- Calculadora de impacto ambiental mencionada en la model card: https://mlco2.github.io/impact
- Repositorio de la familia Qwen (referencia del modelo base presumible): https://huggingface.co/Qwen
- Paper, blog, repositorio o demo específicos de este modelo: no disponibles.
