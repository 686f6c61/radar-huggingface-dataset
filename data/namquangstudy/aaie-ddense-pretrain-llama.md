# namquangstudy/aaie-ddense-pretrain-llama

## Resumen

El modelo `namquangstudy/aaie-ddense-pretrain-llama` es una exportación en formato `LlamaForCausalLM` del checkpoint **AAIE-Distilled Dense Pretrain**, desarrollado por el usuario namquangstudy. Se trata de un modelo de lenguaje denso de 354 millones de parámetros, preentrenado y destilado, que no ha pasado por un proceso de ajuste por instrucciones (instruction-tuning). Su arquitectura interna —atención GQA, RoPE, FFN SwiGLU, RMSNorm, embeddings atadas y ausencia de sesgos— es estructuralmente idéntica a la de Llama, lo que permite cargarlo de forma nativa en `transformers` y vLLM sin necesidad de `trust_remote_code`.

Este export no es un reentrenamiento, sino un remapeo puro del `state_dict` y la configuración: cada tensor se copia sin cambios a los nombres equivalentes de Llama. El resultado es un modelo que se comporta como un continuador de texto puro: no sigue instrucciones ni responde en formato chat, sino que genera texto a partir de un prefijo. Su relevancia radica en la compatibilidad inmediata con el ecosistema estándar de herramientas de inferencia, lo que facilita su uso en entornos de producción sin dependencias personalizadas.

El modelo está disponible bajo licencia MIT, con un tamaño de repositorio de 1,4 GB y pesos en formato `safetensors`. Al carecer de ajuste instructivo, su uso principal es la generación de texto libre, aunque su pequeño tamaño lo hace atractivo para despliegues en hardware modesto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Llama (Transformer decoder con GQA, RoPE, SwiGLU, RMSNorm, embeddings atadas, sin sesgos) |
| Parametros totales | 354.374.144 (~354M) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Ingles |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura del modelo es un transformer decoder con atención de consultas agrupadas (GQA), posiciones rotatorias (RoPE), capas feed-forward con activación SwiGLU, normalización RMSNorm, embeddings de entrada y salida atadas y ausencia de sesgos en todas las capas. Esta configuración coincide exactamente con la de Llama, por lo que el export utiliza la implementación nativa de `LlamaForCausalLM` de `transformers` y de vLLM.

El checkpoint original, **AAIE-Distilled Dense Pretrain**, fue preentrenado y posteriormente destilado, aunque no se han publicado detalles sobre el número de tokens, la composición del dataset ni las técnicas de destilación empleadas. El proceso de exportación consistió en un remapeo de nombres de tensores y de configuración, sin modificar los pesos. No se aplicó ningún ajuste por instrucciones (RLHF, DPO, etc.), por lo que el modelo se comporta como un modelo de lenguaje base: dado un texto, continúa la secuencia de forma autónoma.

## Capacidades

- Generación de texto libre: dado un prefijo, produce continuaciones coherentes en inglés.
- Continuación de texto en estilo natural, útil para autocompletado o generación de contenido.
- No soporta tool calling ni function calling.
- No está diseñado para tareas de razonamiento multi-paso ni para uso como agente autónomo.
- No tiene capacidades multimodales (visión, audio, etc.).
- Solo soporta el idioma inglés.
- No sigue instrucciones ni responde preguntas en formato conversacional.

## Casos de uso

- Autocompletado de texto en editores o entornos de desarrollo: el modelo puede sugerir la continuación de frases o párrafos, aprovechando su naturaleza de continuación de texto y su bajo coste de inferencia.
- Generación de contenido creativo: redacción de historias, poemas o ideas a partir de un inicio dado, sin necesidad de ajuste instructivo.
- Preprocesamiento de texto en pipelines de NLP: puede usarse para generar variaciones de texto o expandir corpus en tareas de aumento de datos.
- Prototipado rápido de aplicaciones de generación de texto: al ser un modelo pequeño y compatible con vLLM, permite validar ideas de producto sin grandes requisitos de hardware.
- Entrenamiento o fine-tuning posterior: al ser un checkpoint preentrenado y destilado, puede servir como punto de partida para tareas específicas mediante ajuste fino supervisado.
- Evaluación de arquitecturas Llama en entornos educativos o de investigación: su tamaño reducido facilita el estudio de las características de GQA, RoPE y SwiGLU en un modelo manejable.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No se dispone de puntuaciones de MMLU, HumanEval, GSM8K ni otras evaluaciones estándar para este modelo.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16: aproximadamente 0,7 GB (354M × 2 bytes) más overhead del runtime, lo que cabe en GPUs con 2 GB o más.
- Con cuantización int8, la VRAM se reduce a unos 0,35 GB, permitiendo ejecución en tarjetas muy básicas.
- GPU recomendadas: cualquier GPU consumer con al menos 4 GB de VRAM, como NVIDIA GTX 1650, RTX 2060, RTX 3060, o incluso CPU en modo de baja latencia.
- Compatible con despliegue en vLLM, llama.cpp, Ollama y TGI gracias a su formato Llama nativo.
- Latencia estimada: para una GPU media (RTX 3060), la generación de 100 tokens puede completarse en menos de un segundo, aunque el throughput depende del tamaño de lote y la cuantización.

## Comparativa con modelos similares

| Modelo | Parametros | Arquitectura | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| aaie-ddense-pretrain-llama | 354M | Llama (GQA, RoPE, SwiGLU) | No disponible | MIT | Hugging Face |
| GPT-2 (355M) | 355M | Transformer decoder | 1024 | MIT | Hugging Face |
| DistilGPT-2 | 82M | Transformer decoder | 1024 | MIT | Hugging Face |
| Phi-1 (1.3B) | 1.3B | Transformer decoder | 2048 | MIT | Hugging Face |

No se dispone de datos de rendimiento comparativos, ya que este modelo no ha publicado benchmarks. Las alternativas listadas son representativas en tamaño y licencia, pero sus capacidades difieren: GPT-2 y DistilGPT-2 son modelos de continuación de texto sin ajuste instructivo, mientras que Phi-1 está especializado en código y razonamiento. La principal ventaja de este modelo es su compatibilidad nativa con vLLM y la ausencia de dependencias personalizadas.

## Limitaciones y advertencias

- No sigue instrucciones ni responde en formato conversacional: al ser un modelo base sin ajuste instructivo, no es adecuado para chatbots o asistentes.
- Riesgo de alucinación: como todo modelo de lenguaje, puede generar contenido plausible pero falso o incoherente, especialmente fuera de su dominio de entrenamiento.
- Sesgos no documentados: no se ha publicado información sobre la composición del dataset de entrenamiento, por lo que los sesgos potenciales son desconocidos.
- Limitación de idioma: solo soporta inglés; no se recomienda su uso en otros idiomas.
- Sin cuantizaciones publicadas: aunque los pesos están en safetensors, no se ofrecen versiones GGUF u otras cuantizaciones oficiales; el usuario deberá generarlas si las necesita.
- Fecha de creación futura: el modelo fue creado en agosto de 2026, lo que puede indicar una publicación reciente o un error en los metadatos; se recomienda verificar la vigencia del repositorio.
- Sin soporte técnico oficial: el modelo es de un autor individual y no cuenta con una organización detrás que ofrezca mantenimiento o soporte.

## Enlaces

- Modelo en Hugging Face: [namquangstudy/aaie-ddense-pretrain-llama](https://huggingface.co/namquangstudy/aaie-ddense-pretrain-llama)
- Modelo original (antes del export): [namquangstudy/aaie-ddense-pretrain](https://huggingface.co/namquangstudy/aaie-ddense-pretrain)
- Export con ajuste GFT: [namquangstudy/aaie-ddense-gft-llama](https://huggingface.co/namquangstudy/aaie-ddense-gft-llama)
- Repositorio de modelos Llama (referencia de arquitectura): [meta-llama/llama-models](https://github.com/meta-llama/llama-models)
