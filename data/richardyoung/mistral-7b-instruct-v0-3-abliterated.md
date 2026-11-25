# richardyoung/Mistral-7B-Instruct-v0.3-abliterated

## Resumen

Mistral-7B-Instruct-v0.3-abliterated es una variante del modelo Mistral-7B-Instruct-v0.3 de Mistral AI, publicada por el usuario richardyoung en Hugging Face. Se trata de una versión sometida a un proceso de "abliteration" (ablación de direcciones de rechazo en el espacio de activaciones), una técnica de ingeniería de representaciones que busca eliminar la tendencia del modelo a rechazar peticiones, manteniendo el resto de capacidades del modelo original. El modelo base es un transformer decoder-only de 7.248.023.552 parámetros con una ventana de contexto de 32.768 tokens y licencia Apache 2.0.

La relevancia de esta ficha es doble: por un lado, documenta una técnica concreta (abliteration/refusal removal) que se ha popularizado en la comunidad open source para estudiar el comportamiento de rechazo de los LLM; por otro, advierte de las implicaciones prácticas y éticas de desplegar modelos sin salvaguardas. El autor declara métricas de reducción de rechazo (Refusal Rate de 16/100 y Attack Success Rate del 84 %) que no han sido verificadas de forma independiente.

El repositorio está marcado como de acceso restringido (gated) y tiene un volumen de descargas muy bajo (53 en el momento de la consulta), lo que sugiere que se trata de una publicación de nicho orientada a investigación más que a producción. El modelo solo declara soporte para inglés.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Mistral 7B) |
| Parametros totales | 7.248.023.552 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 32.768 tokens (heredada de Mistral-7B-Instruct-v0.3) |
| Tipos de cuantizacion | no disponible en la informacion proporcionada (pesos en safetensors; se pueden derivar GGUF/AWQ/GPTQ con herramientas externas) |
| Idiomas soportados | en (ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de Mistral-7B-Instruct-v0.3, un transformer decoder-only denso de aproximadamente 7.200 millones de parámetros, con atención de tipo Grouped-Query Attention (GQA) y ventana de contexto de 32.768 tokens. La versión original de Mistral AI fue entrenada con datos públicos y posteriormente ajustada por instrucciones (SFT) y optimizada con preferencias (DPO), según la documentación pública del modelo base.

Sobre esta base, el autor aplica una técnica de abliteration: se calcula una "dirección de rechazo" en el espacio de activaciones (habitualmente a partir de la diferencia media entre activaciones ante prompts dañinos y prompts inofensivos) y se proyecta fuera de los pesos o de las activaciones de las capas intermedias. El objetivo es eliminar la componente que dispara las respuestas de negativa sin reentrenar el modelo. El autor declara una divergencia KL de 0,317 respecto al modelo base, lo que indica que la distribución de salida se ha alterado de forma no trivial. No se especifican en la información disponible el número de tokens adicionales de entrenamiento, la composición del dataset ni si hubo RLHF/DPO posterior a la ablación.

## Capacidades

- Generación de texto conversacional en inglés, heredada del modelo base Instruct.
- Razonamiento de propósito general y respuesta a instrucciones multi-turno.
- Generación de código y matemáticas básicas, con el nivel propio de un modelo de 7B de la familia Mistral.
- Soporte de tool calling y function calling heredado del formato Instruct v0.3 (no verificado específicamente en esta variante).
- Capacidad reducida de rechazo: el autor declara un Refusal Rate de 16/100, es decir, responde a la mayoría de peticiones que el modelo base rechazaría.
- Ventana de contexto de 32.768 tokens para conversaciones y documentos largos.
- No se declaran capacidades de visión, audio ni modo "thinking" explícito.

## Casos de uso

- Investigación sobre alineación y seguridad: permite estudiar experimentalmente cómo se comporta un LLM cuando se elimina la dirección de rechazo, comparando sus salidas con las del modelo base para analizar qué información se filtra y con qué calidad.
- Red teaming y evaluación de salvaguardas: sirve como modelo de referencia "sin censura" para medir la robustez de clasificadores de contenido, filtros de salida y sistemas de moderación en pipelines de producción.
- Generación de datos sintéticos para entrenamiento: en entornos controlados, puede utilizarse para producir pares de instrucción-respuesta sobre temas que el modelo base declina, siempre que el uso cumpla la licencia Apache 2.0 y la legislación aplicable.
- Estudio de la degradación por ablación: la KL de 0,317 declarada permite analizar la relación entre la reducción de rechazo y la pérdida de calidad o coherencia en tareas benignas.
- Despliegue en investigación lingüística: con 7B parámetros y contexto de 32k, es viable en una sola GPU para experimentos de generación de texto a gran escala en inglés.
- Pruebas de robustez de agentes: al no rechazar peticiones, permite evaluar cómo se comportan frameworks de agentes (tool calling, multi-step reasoning) ante instrucciones que un modelo alineado bloquearía, útil para diseñar defensas en el orquestador.

## Benchmarks y rendimiento

Datos declarados por el autor en la model card (no verificados de forma independiente):

| Metrica | Valor | Verificado |
|---|---|---|
| Refusal Rate | 16/100 | No |
| Attack Success Rate (ASR) | 84 % | No |
| KL Divergence (vs. base) | 0,317 | No |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16/BF16: aproximadamente 14,5 GB de pesos, más overhead de KV cache; se recomienda un mínimo de 16-18 GB.
- Cuantización a 8 bits: en torno a 7-8 GB de VRAM; cuantización a 4 bits: en torno a 4-5 GB.
- GPU recomendadas para FP16: A100 40 GB, H100, L40S, RTX A6000. Para cuantizado 4-bit: RTX 4090 (24 GB), RTX 3090 (24 GB), RTX 4080 (16 GB).
- Cabe en GPU de consumo: sí, en RTX 4090/3090 con cuantización 4-bit u 8-bit; en FP16 requiere al menos 16 GB y deja poco margen para contexto largo.
- Opciones de despliegue: transformers, vLLM, TGI (el repo incluye tag text-generation-inference y endpoints_compatible), llama.cpp/Ollama tras conversión a GGUF.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Estado | Notas |
|---|---|---|---|---|---|
| richardyoung/Mistral-7B-Instruct-v0.3-abliterated | 7,25 B | 32.768 | Apache 2.0 | Gated, 53 descargas | Abliterated, Refusal Rate 16/100 declarado |
| mistralai/Mistral-7B-Instruct-v0.3 | 7,25 B | 32.768 | Apache 2.0 | Público, ampliamente usado | Modelo base alineado |
| Otras variantes abliterated de Mistral 7B (comunidad) | ~7,25 B | 32.768 | Apache 2.0 | Públicas | Múltiples autores; métricas no comparables directamente |

No se dispone de datos de benchmarks comparables entre estas variantes en la información proporcionada.

## Limitaciones y advertencias

- El proceso de abliteration elimina deliberadamente las salvaguardas de rechazo; el modelo puede generar contenido dañino, ilegal o inseguro. No debe desplegarse en aplicaciones de cara al usuario sin capas adicionales de moderación.
- Las métricas declaradas (Refusal Rate, ASR, KL) no están verificadas de forma independiente y provienen del propio autor.
- La divergencia KL de 0,317 respecto al modelo base sugiere degradación en la distribución de salida; es esperable una pérdida de calidad en tareas benignas respecto a Mistral-7B-Instruct-v0.3.
- Solo declara soporte de inglés; el rendimiento en castellano u otros idiomas no está garantizado.
- Riesgo de alucinación propio de un modelo de 7B, agravado por la alteración de pesos.
- Licencia Apache 2.0 permite uso comercial, pero el despliegue debe cumplir la legislación aplicable (por ejemplo, el Reglamento Europeo de IA y la normativa sobre contenidos ilícitos); la licencia no exime de responsabilidad legal por los outputs.
- Acceso restringido (gated): requiere aceptar condiciones en Hugging Face, lo que limita la reproducibilidad y la distribución automática en pipelines.
- No se documentan sesgos específicos en la información disponible; se heredan los del modelo base.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/richardyoung/Mistral-7B-Instruct-v0.3-abliterated
- Modelo base: https://huggingface.co/mistralai/Mistral-7B-Instruct-v0.3
- Paper de referencia declarado en los tags: arxiv:2512.13655 (no verificable en la información proporcionada)
