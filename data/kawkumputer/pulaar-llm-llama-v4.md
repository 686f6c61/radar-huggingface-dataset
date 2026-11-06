# kawkumputer/pulaar-llm-llama-v4

## Resumen

Pulaar-llm-llama-v4 es un adaptador LoRA (Low-Rank Adaptation) publicado en Hugging Face por el usuario kawkumputer sobre el modelo base meta-llama/Llama-3.1-8B. Se trata, por tanto, de un fine-tuning parametrizado eficiente (PEFT) y no de un modelo completo: el repositorio contiene únicamente los pesos del adaptador (4,5 GB en formato safetensors), que deben combinarse con el checkpoint original de Llama 3.1 8B para su uso. El nombre sugiere un enfoque hacia la lengua pulaar (fula), aunque la model card no lo confirma ni aporta detalles sobre el corpus de entrenamiento.

El modelo hereda de Llama 3.1 8B su arquitectura transformer decoder-only, su ventana de contexto de 128 000 tokens y su tokenizador multilingüe, así como la licencia comunitaria de Meta (Llama 3.1 Community License), que impone restricciones de uso comercial y de redistribución. La relevancia de esta publicación es limitada: se trata de un adaptador sin documentación técnica, sin métricas de evaluación, sin dataset declarado y con cero descargas en el momento de la ficha, por lo que debe tratarse como un artefacto experimental más que como un modelo listo para producción.

La ficha que sigue documenta lo que se puede inferir de los metadatos y del modelo base, marcando explícitamente como "no disponible" todo aquello que el autor no ha publicado. Cualquier evaluación de calidad real requeriría ejecutar el adaptador y compararlo contra el Llama 3.1 8B original en tareas representativas del dominio objetivo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (adaptador LoRA sobre Llama 3.1 8B) |
| Parametros totales | 8 030 millones (modelo base); el adaptador LoRA añade un número no especificado de parámetros entrenables |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 128 000 tokens (heredada de Llama 3.1 8B) |
| Tipos de cuantizacion | no disponible en el repositorio; el modelo base admite FP16, BF16, INT8 e INT4 (GGUF/AWQ/GPTQ) mediante herramientas externas |
| Idiomas soportados | no disponible; el modelo base Llama 3.1 soporta oficialmente inglés, alemán, francés, italiano, portugués, hindi, español y tailandés |
| Licencia | no disponible en el repositorio; el modelo base se distribuye bajo Llama 3.1 Community License |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El artefacto es un adaptador LoRA entrenado con la librería PEFT 0.21.2 sobre meta-llama/Llama-3.1-8B. Llama 3.1 8B es un transformer decoder-only con normalización RMSNorm, activación SwiGLU, embeddings rotatorios (RoPE) y atención con GQA (grouped-query attention); su contexto nativo es de 128 000 tokens y fue preentrenado con más de 15 billones de tokens según la documentación de Meta. El adaptador LoRA congela los pesos base e inyecta matrices de bajo rango en determinadas capas, de modo que el entrenamiento es mucho más económico en memoria y cómputo que un fine-tuning completo.

No se dispone de información sobre el dataset de instrucciones, el número de tokens de entrenamiento, la configuración de rangos y alpha del LoRA, la tasa de aprendizaje, el número de épocas ni si se aplicaron técnicas de alineación adicionales (SFT, DPO, RLHF). La model card es la plantilla por defecto de Hugging Face sin rellenar, con todos los campos marcados como "[More Information Needed]". Tampoco se documenta el objetivo declarado del fine-tuning más allá de la posible especialización en pulaar que sugiere el nombre.

## Capacidades

- Generación de texto autoregresiva, heredada del modelo base Llama 3.1 8B.
- Razonamiento multi-paso y matemáticas a nivel de modelo de 8B (capacidad moderada, no verificada en este adaptador).
- Generación de código y comprensión de lenguajes de programación, sujeta a la calidad del fine-tuning aplicado.
- Soporte nativo de tool calling y function calling en Llama 3.1, aunque el adaptador podría haber degradado esta capacidad si el dataset de entrenamiento no la incluía.
- Capacidad multilingüe heredada del tokenizador y del preentrenamiento de Llama 3.1 (8 idiomas oficiales); el posible refuerzo del pulaar no está verificado.
- No dispone de visión, audio ni modo "thinking" explícito.
- No se ha documentado ninguna capacidad específica adicional introducida por el adaptador.

## Casos de uso

- Experimentación académica en lenguas de bajos recursos: el adaptador puede servir como punto de partida para investigar fine-tuning LoRA en pulaar, comparando su salida contra el Llama 3.1 8B original en corpus de evaluación del idioma.
- Prototipado rápido de asistentes conversacionales en entornos de investigación: al ser un adaptador ligero, se puede cargar y descargar en memoria sin necesidad de duplicar los 16 GB del modelo base en FP16.
- Evaluación de técnicas PEFT: útil como caso de estudio de cómo un LoRA de 4,5 GB afecta al comportamiento de un modelo de 8B en tareas de generación libre.
- Fine-tuning incremental sobre dominio específico: al estar en formato PEFT, se puede seguir entrenando o combinar con otros adaptadores mediante técnicas como LoRA merging, siempre que se valide el resultado.
- Despliegue en entornos con recursos limitados: una vez fusionado y cuantizado a 4 bits, el modelo resultante podría ejecutarse en GPUs de consumo (por ejemplo, RTX 3060 de 12 GB o superiores) para tareas de generación de texto de baja latencia.
- Docencia y demostraciones: sirve para ilustrar el flujo completo de publicación de un adaptador LoRA en Hugging Face, aunque su falta de documentación lo hace poco recomendable como ejemplo de buenas prácticas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- El adaptador LoRA en sí ocupa 4,5 GB en disco, pero requiere cargar el modelo base Llama 3.1 8B para funcionar.
- VRAM estimada para inferencia con el modelo fusionado: ~16 GB en FP16/BF16, ~8-9 GB en INT8, ~5-6 GB en INT4 (GGUF Q4_K_M).
- GPUs recomendadas: A100 40/80 GB o H100 para servicio de alta concurrencia con contexto largo; L40S o RTX 6000 Ada para despliegues de producción medios; RTX 4090 (24 GB) para FP16 con contexto moderado.
- GPUs de consumo: cabe en RTX 3090/4090 en FP16 con contexto recortado, y en RTX 3060 12 GB, RTX 4060 Ti 16 GB o RTX 4070 en cuantización INT4.
- Opciones de despliegue: transformers + PEFT (carga directa del adaptador), vLLM (con soporte de adaptadores LoRA), TGI, llama.cpp/Ollama tras fusionar y convertir a GGUF, y Text Generation Inference para servicio HTTP.
- Latencia y throughput: no disponibles para este adaptador concreto; en el modelo base Llama 3.1 8B en FP16 sobre A100 se sitúan en el orden de decenas de tokens por segundo por petición y varios cientos agregados con batching, pero no se han medido aquí.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| kawkumputer/pulaar-llm-llama-v4 | 8B (base) + LoRA | 128k | no disponible (base: Llama 3.1 Community) | safetensors (PEFT) | Adaptador sin documentación ni benchmarks |
| meta-llama/Llama-3.1-8B | 8B | 128k | Llama 3.1 Community License | safetensors | Modelo base oficial, con model card completa y benchmarks publicados |
| meta-llama/Llama-3.1-8B-Instruct | 8B | 128k | Llama 3.1 Community License | safetensors | Variante alineada para instrucciones, con evaluación oficial |
| mistralai/Mistral-7B-Instruct-v0.3 | 7,2B | 32k | Apache 2.0 | safetensors, GGUF | Alternativa de tamaño similar con licencia permisiva |

## Limitaciones y advertencias

- La model card está vacía: no hay información sobre dataset, hiperparámetros, evaluación ni uso previsto, lo que impide validar la calidad del adaptador.
- El autor no declara licencia en el repositorio; el uso comercial queda supeditado a la Llama 3.1 Community License del modelo base, que exige aceptación de términos y restricciones (por ejemplo, no entrenar modelos competidores con sus salidas).
- Riesgo elevado de alucinación y de degradación de capacidades del modelo base si el fine-tuning se hizo con un corpus pequeño o de baja calidad.
- El nombre sugiere especialización en pulaar, pero no hay evidencia publicada de que el adaptador realmente mejore el rendimiento en ese idioma frente al Llama 3.1 8B original.
- No se ha verificado la preservación de tool calling, contexto largo o capacidades multilingües tras el fine-tuning.
- Repositorio con cero descargas y cero likes en el momento de la ficha: sin comunidad que haya validado su funcionamiento.
- No apto para producción sin una evaluación previa contra el modelo base en el dominio objetivo.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/kawkumputer/pulaar-llm-llama-v4
- Modelo base: https://huggingface.co/meta-llama/Llama-3.1-8B
- Documentación de Llama 3.1 (Meta): https://ai.meta.com/blog/meta-llama-3-1/
- Librería PEFT: https://github.com/huggingface/peft
- Paper de LoRA (Hu et al., 2021): https://arxiv.org/abs/2106.09685
- Paper citado en la model card (Lacoste et al., 2019, impacto ambiental): https://arxiv.org/abs/1910.09700
