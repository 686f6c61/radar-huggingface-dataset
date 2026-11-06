# g-assismoraes/tofu-phi-1_5-forget10-ihl_embed-epoch03

## Resumen

El modelo `tofu-phi-1_5-forget10-ihl_embed-epoch03` es un checkpoint de investigación publicado por el usuario g-assismoraes en Hugging Face. Se trata de un ajuste fino del modelo `locuslab/tofu_ft_phi-1.5` (que a su vez deriva de `microsoft/phi-1_5`), orientado a experimentos de *machine unlearning* sobre el benchmark TOFU (Task of Fictitious Unlearning). El objetivo declarado es "olvidar" un subconjunto del 10 % de los datos de entrenamiento (forget10) manteniendo el rendimiento sobre el resto (retain), mediante una técnica denominada IHL (Input/Head Learning) combinada con un reinicio de los embeddings de entrada y de la cabeza LM.

Arquitectura transformer decoder-only de 1.418 millones de parámetros, con licencia Apache 2.0 y pesos en formato safetensors. El checkpoint corresponde a la época 3 de un total de 20, lo que indica que forma parte de una curva de entrenamiento más amplia y no necesariamente representa el punto final del ajuste.

Por su naturaleza, es un artefacto de investigación en unlearning más que un modelo de producción: no hay pipeline declarado, cero descargas y cero likes en el momento de la consulta, y la model card es mínima. Su relevancia es académica, para quienes estudian técnicas de eliminación selectiva de conocimiento en modelos de lenguaje pequeños.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Phi-1.5) |
| Parámetros totales | 1.418.270.720 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la información proporcionada (Phi-1.5 soporta 2048 tokens según su model card original) |
| Tipos de cuantización | no disponible en el repo; al ser safetensors, admite cuantización a FP16/BF16/INT8/INT4 vía herramientas externas |
| Idiomas soportados | en |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (con `custom_code`; requiere `trust_remote_code=True`) |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura de Phi-1.5: un transformer decoder-only de 1.300 millones de parámetros (1.418 millones contando embeddings y cabeza) con atención multi-cabeza estándar, entrenado originalmente por Microsoft sobre datos de "libros de texto" sintéticos y código educativo. Sobre esa base, `locuslab/tofu_ft_phi-1.5` aplica un ajuste fino supervisado sobre el dataset TOFU, que contiene biografías ficticias de autores con preguntas y respuestas asociadas.

El checkpoint aquí descrito aplica una intervención de unlearning: según la model card, los *input embeddings* y la *LM head* se reinicializan desde `microsoft/phi-1_5`, mientras que el resto de pesos del transformer se conservan desde `locuslab/tofu_ft_phi-1.5`. La función de pérdida combina un término IHL sobre el conjunto *forget* y una entropía cruzada (CE) con peso 1.0 sobre el conjunto *retain*. El entrenamiento se detiene en la época 3 de 20. No se especifican en la información disponible el número total de tokens, la composición exacta del dataset ni si hubo RLHF/DPO; TOFU es un benchmark de unlearning, no un corpus de preentrenamiento a gran escala.

## Capacidades

- Generación de texto en inglés, con razonamiento básico y respuesta a preguntas.
- Generación de código sencillo y resolución de problemas matemáticos elementales, heredados de Phi-1.5.
- Respuesta a preguntas de formato QA sobre el dataset TOFU (biografías ficticias).
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso explícito.
- Capacidad multilingüe limitada al inglés declarado en la model card.
- No se documenta modo *thinking*, visión ni audio.

## Casos de uso

- Investigación en machine unlearning: servir como checkpoint intermedio (época 3/20) para estudiar la curva de olvido frente a retención en el benchmark TOFU, comparando con las épocas posteriores.
- Evaluación de ataques de extracción de conocimiento: comprobar si el modelo aún permite recuperar información del conjunto *forget* mediante prompting adversarial, midiendo la eficacia real del reinicio de embeddings y cabeza.
- Reproducción de experimentos académicos: al ser un artefacto público con licencia Apache 2.0, permite replicar resultados de papers sobre IHL y unlearning en modelos pequeños.
- Baseline para comparativas de métodos de unlearning: confrontar IHL contra Gradient Ascent, KL-divergence o NPO sobre el mismo modelo base y dataset.
- Estudio de la degradación de capacidades: analizar cuánto rendimiento general (código, matemáticas, QA) se pierde al aplicar la intervención, útil para caracterizar el coste del olvido.
- Docencia en cursos de seguridad y alineamiento de LLM: ejemplo práctico y ligero (1.4B parámetros, 2.8 GB) para demostrar técnicas de eliminación de datos en un entorno con recursos limitados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16/BF16: aproximadamente 2.8–3.2 GB (1.418 M parámetros × 2 bytes + overhead de activaciones y KV cache).
- VRAM estimada en INT8: ~1.5–2 GB; en INT4: ~0.8–1.2 GB.
- GPU recomendadas: cualquier GPU consumer con ≥4 GB de VRAM (RTX 3050, RTX 3060, RTX 4060, RTX 4090) para FP16; A100/H100 no son necesarias por el tamaño reducido.
- Cabe holgadamente en GPU consumer; también puede ejecutarse en CPU con llama.cpp u Ollama tras conversión a GGUF.
- Opciones de despliegue: `transformers` con `trust_remote_code=True` (requerido por el tag `custom_code`), vLLM, TGI y llama.cpp/Ollama previa conversión de pesos.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| g-assismoraes/tofu-phi-1_5-forget10-ihl_embed-epoch03 | 1.418 M | no disponible | Apache 2.0 | Hugging Face (0 descargas) | Checkpoint de unlearning, época 3/20 |
| locuslab/tofu_ft_phi-1.5 | ~1.3 B | no disponible | no disponible | Hugging Face | Modelo base ajustado en TOFU, sin unlearning |
| microsoft/phi-1_5 | 1.3 B | 2048 tokens | MIT (según model card original) | Hugging Face | Modelo original de Microsoft, sin ajuste TOFU |
| locuslab/tofu_llama2-7b | ~7 B | 4096 tokens | Llama 2 | Hugging Face | Alternativa de mayor tamaño para experimentos TOFU |

## Limitaciones y advertencias

- Modelo de investigación con cero descargas y validación comunitaria nula; no apto para producción sin evaluación propia.
- Riesgo elevado de alucinación: Phi-1.5 es un modelo pequeño entrenado sobre datos sintéticos, propenso a inventar hechos, especialmente tras la intervención de unlearning.
- El objetivo del checkpoint es *olvidar* información; su comportamiento sobre el conjunto *forget* puede ser errático o incompleto en la época 3 de 20.
- Capacidad multilingüe restringida al inglés declarado; no se garantiza un comportamiento correcto en castellano.
- Requiere `trust_remote_code=True` por el tag `custom_code`, lo que implica ejecutar código del autor; auditar antes de usar en entornos sensibles.
- Licencia Apache 2.0 permite uso comercial, pero el modelo base Phi-1.5 y el ajuste TOFU pueden arrastrar condiciones adicionales no reflejadas en la model card; verificar la cadena de licencias.
- No se documentan sesgos específicos, pero hereda los del corpus de Phi-1.5 (predominantemente inglés, sintético y educativo).
- La model card es mínima y no incluye métricas de retención ni de olvido; imposible validar la eficacia del método sin reproducir los experimentos.

## Enlaces

- Hugging Face: https://huggingface.co/g-assismoraes/tofu-phi-1_5-forget10-ihl_embed-epoch03
- Modelo base del ajuste: https://huggingface.co/locuslab/tofu_ft_phi-1.5
- Modelo original: https://huggingface.co/microsoft/phi-1_5
- Benchmark TOFU (referencia del dataset): no disponible en la información proporcionada
- Paper de IHL: no disponible en la información proporcionada
