# blueshark109/TwinLlama-3.1-8B-DPO

## Resumen

TwinLlama-3.1-8B-DPO es un ajuste fino (fine-tuning) del modelo TwinLlama-3.1-8B, a su vez derivado de la familia Llama 3.1 de Meta. Lo desarrolla el usuario blueshark109 y se distribuye bajo licencia Apache 2.0. El sufijo "DPO" indica que el ajuste se ha realizado mediante Direct Preference Optimization, una técnica de alineación por preferencias que busca mejorar la calidad y el seguimiento de instrucciones de las respuestas frente al modelo base. El modelo está orientado a generación de texto conversacional en inglés.

Se trata de un modelo denso de aproximadamente 8.000 millones de parámetros, empaquetado en formato safetensors para la librería transformers. El repositorio ocupa unos 10 GB, coherente con pesos en precisión de 16 bits. La model card es extremadamente escueta y no aporta datos sobre arquitectura detallada, composición del dataset de ajuste, hiperparámetros de entrenamiento ni resultados de evaluación.

La relevancia de esta ficha es limitada en términos prácticos: el modelo no registra descargas ni interacciones, no incluye benchmarks y su documentación es mínima. Debe tratarse como un experimento de ajuste personal más que como un modelo listo para producción, y cualquier evaluación debe hacerse empíricamente por el usuario.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Llama 3.1), densa |
| Parametros totales | ~8.000 millones (heredado de Llama 3.1 8B; no confirmado en la model card) |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | no disponible en la model card (el modelo base Llama 3.1 8B soporta 128.000 tokens) |
| Tipos de cuantizacion | no disponible (solo se distribuyen pesos safetensors; admite cuantizacion posterior con herramientas estándar) |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura corresponde a un transformer decoder-only de la familia Llama 3.1, con aproximadamente 8.000 millones de parámetros. El modelo parte de TwinLlama-3.1-8B (a su vez derivado de Llama 3.1 8B de Meta) y se ha ajustado mediante DPO, una técnica de optimización por preferencias que entrena el modelo para favorecer respuestas preferidas frente a respuestas rechazadas a partir de pares de comparación. El ajuste se realizó con Unsloth y la librería TRL de Hugging Face, según indica la model card, lo que sugiere un entrenamiento optimizado en memoria y velocidad.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset de preferencias, los hiperparámetros de DPO (beta, learning rate, épocas) ni si hubo etapas previas de SFT. Tampoco se documentan innovaciones técnicas adicionales como decodificación especulativa o atención lineal. Toda la información sobre el proceso de entrenamiento se reduce a la mención de Unsloth y TRL.

## Capacidades

- Generación de texto conversacional en inglés.
- Seguimiento de instrucciones mejorado presumiblemente por el ajuste DPO (no verificado con benchmarks).
- Razonamiento general y respuesta a preguntas, heredado del modelo base Llama 3.1 8B.
- Generación de código y matemáticas a nivel del modelo base (no evaluado en esta variante).
- Soporte de tool calling / function calling: no documentado en la model card; el modelo base Llama 3.1 lo soporta, pero no se confirma que se conserve tras el ajuste.
- Capacidades de agente y razonamiento multi-paso: no documentadas.
- Capacidades multilingües: limitadas al inglés según la etiqueta de idioma declarada.
- Modo thinking, visión o audio: no disponibles.

## Casos de uso

- Experimentación con DPO: el modelo sirve para estudiar el efecto del ajuste por preferencias sobre un Llama 3.1 8B, comparando respuestas con el modelo base en tareas de instrucción.
- Generación de texto conversacional en inglés: puede emplearse en prototipos de chatbots de dominio general, siempre que se valide la calidad empíricamente antes de usarlo.
- Ajuste fino adicional: al estar bajo Apache 2.0 y en safetensors, es un punto de partida para nuevos ajustes con LoRA o QLoRA sobre dominios específicos.
- Evaluación comparativa de alineación: útil como candidato en estudios que midan la calidad de respuestas frente a otros modelos ajustados con DPO o RLHF.
- Investigación académica sobre preferencias: permite reproducir pipelines de DPO con Unsloth y TRL sobre una base de 8B parámetros.
- Despliegue local de bajo coste: con cuantización a 4 bits puede ejecutarse en GPUs de consumo para pruebas de inferencia en inglés.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16: en torno a 16 GB solo para pesos, más overhead de activaciones y KV cache (aproximadamente 18-20 GB en total).
- VRAM estimada en cuantización de 8 bits: aproximadamente 8-9 GB.
- VRAM estimada en cuantización de 4 bits: aproximadamente 5-6 GB.
- GPU recomendadas para FP16: A100 40 GB, H100, L40S, RTX A6000.
- GPU de consumo: cabe en RTX 4090 (24 GB) en FP16 con contexto moderado; en RTX 3090 (24 GB) de forma ajustada; en GPUs de 12-16 GB requiere cuantización a 8 o 4 bits.
- Opciones de despliegue: transformers, text-generation-inference (TGI), vLLM, llama.cpp y Ollama mediante conversión a GGUF.
- Latencia y throughput: no disponibles; dependen del hardware y de la cuantización.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| TwinLlama-3.1-8B-DPO | ~8B | no disponible | apache-2.0 | Ajuste DPO comunitario, sin benchmarks ni tracción |
| Llama 3.1 8B Instruct (Meta) | 8B | 128.000 tokens | Llama 3.1 Community License | Modelo oficial con evaluación publicada y soporte amplio |
| TwinLlama-3.1-8B (base del ajuste) | ~8B | no disponible | apache-2.0 | Modelo previo al DPO; referencia directa para comparar el efecto del ajuste |
| Mistral 7B Instruct | 7,3B | 32.000 tokens | Apache 2.0 | Alternativa abierta de tamaño similar con benchmarks publicados |

## Limitaciones y advertencias

- Ausencia total de benchmarks: no hay evidencia publicada de que el ajuste DPO mejore al modelo base; podría incluso degradarlo en algunas tareas.
- Model card mínima: no se documentan datos de entrenamiento, hiperparámetros ni composición del dataset de preferencias, lo que impide auditar el ajuste.
- Riesgo de alucinación: inherente a los modelos de 8B parámetros; sin evaluación no puede acotarse.
- Sesgos: desconocidos, al no documentarse el dataset de preferencias; los sesgos del modelo base Llama 3.1 pueden persistir o amplificarse.
- Idioma: solo se declara inglés; el rendimiento en castellano no está garantizado.
- Contexto: no se confirma que se mantenga la ventana de 128.000 tokens del modelo base tras el ajuste.
- Licencia Apache 2.0: permite uso comercial, pero el usuario debe verificar que los términos del modelo base original (Llama 3.1) no impongan restricciones adicionales sobre los pesos derivados.
- Tracción nula: cero descargas y cero likes; sin comunidad que valide su comportamiento en producción.
- Tool calling y agentes: no confirmados; no asumir su funcionamiento sin pruebas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/blueshark109/TwinLlama-3.1-8B-DPO
- Modelo base del ajuste: https://huggingface.co/blueshark109/TwinLlama-3.1-8B
- Unsloth (herramienta de entrenamiento): https://github.com/unslothai/unsloth
- TRL de Hugging Face: https://github.com/huggingface/trl
- Llama 3.1 (modelo original de Meta): https://huggingface.co/meta-llama/Llama-3.1-8B
