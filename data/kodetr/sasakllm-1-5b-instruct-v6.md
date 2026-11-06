# kodetr/SasakLLM-1.5B-Instruct-v6

## Resumen

SasakLLM-1.5B-Instruct-v6 es un adaptador LoRA de ajuste supervisado (SFT) publicado por el usuario kodetr sobre el modelo base Qwen/Qwen2.5-1.5B-Instruct. No se trata de un modelo entrenado desde cero, sino de un conjunto de pesos PEFT que debe cargarse junto al checkpoint original de Qwen2.5-1.5B-Instruct para su uso. El repositorio tiene un tamano de 0.0 GB, lo que es coherente con un adaptador de bajo rango y no con pesos completos.

El modelo hereda la arquitectura transformer decoder-only del Qwen2.5-1.5B-Instruct, con aproximadamente 1.540 millones de parametros y una ventana de contexto nativa de 32.768 tokens (ampliable a 131.072 en la familia Qwen2.5, aunque no se confirma para este adaptador). El ajuste se realizo con TRL 1.17.1 y PEFT 0.21.2, segun la model card, y esta orientado a generacion de texto conversacional.

La relevancia de esta ficha es limitada: se trata de un adaptador con cero descargas y cero likes en el momento de la consulta, sin model card detallada, sin datos de entrenamiento declarados y sin licencia explicita. Es util como ejemplo de flujo de trabajo SFT con TRL, pero no como modelo listo para produccion sin evaluacion previa por parte del usuario.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de Qwen2.5-1.5B-Instruct); adaptador LoRA sobre el modelo base |
| Parametros totales | Aproximadamente 1.540 millones en el modelo base; el adaptador LoRA anade un numero reducido de parametros no especificado |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible para el adaptador; el modelo base Qwen2.5-1.5B-Instruct soporta 32.768 tokens nativos |
| Tipos de cuantizacion | No disponible en el repositorio; el modelo base admite cuantizacion a 8 y 4 bits (GPTQ, AWQ, GGUF) por su parte |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |
| Libreria | peft |
| Framework de entrenamiento | TRL 1.17.1, PEFT 0.21.2, Transformers 5.22.1, PyTorch 2.11.0+cu128 |
| Modelo base | Qwen/Qwen2.5-1.5B-Instruct |

## Arquitectura y entrenamiento

El adaptador se aplica sobre Qwen2.5-1.5B-Instruct, un transformer decoder-only con atencion causal estandar, normalizacion RMSNorm, activacion SwiGLU y embeddings rotatorios (RoPE). El modelo base emplea atencion completa con soporte de contexto largo mediante YaRN, y fue entrenado por Alibaba con un corpus multilingue de aproximadamente 18 billones de tokens segun la documentacion publica de Qwen2.5.

El ajuste de este repositorio es un SFT (supervised fine-tuning) con LoRA, segun los tags y la model card. No se especifica el dataset de entrenamiento, el numero de pasos, el rango del adaptador, el alpha, la tasa de aprendizaje ni si hubo etapas posteriores de DPO o RLHF. La model card no incluye hiperparametros ni curvas de perdida. Las versiones de framework declaradas (Transformers 5.22.1, PyTorch 2.11.0) son posteriores a las disponibles en el momento de redaccion de esta ficha, lo que sugiere un entorno de entrenamiento muy reciente o una configuracion no estandar.

No se documenta ninguna innovacion tecnica adicional: no hay decodificacion especulativa, atencion lineal ni modulos hibridos en el adaptador. Todas las capacidades arquitectonicas provienen del modelo base.

## Capacidades

- Generacion de texto conversacional en formato chat, heredada del modelo base Qwen2.5-1.5B-Instruct.
- Razonamiento basico y respuesta a preguntas de conocimiento general, limitado por el tamano de 1.5B parametros.
- Generacion de codigo y matematicas a nivel introductorio, segun las capacidades del modelo base.
- Soporte de tool calling y function calling heredado de Qwen2.5-Instruct, aunque no verificado tras el ajuste LoRA.
- Capacidad multilingue heredada del modelo base (chino, ingles y otros idiomas), sin confirmacion de que el adaptador la preserve.
- No se documentan modos especiales como thinking mode, vision o audio.
- No se documenta soporte de agentes multi-paso especifico para este adaptador.

## Casos de uso

- Prototipado de asistentes conversacionales: el adaptador puede cargarse sobre Qwen2.5-1.5B-Instruct con `PeftModel.from_pretrained` para experimentar con un tono o dominio concreto sin reentrenar el modelo completo. Adecuado por su bajo coste de almacenamiento y su compatibilidad con la API de Transformers.
- Investigacion en ajuste fino eficiente: sirve como ejemplo reproducible de pipeline SFT con TRL y PEFT, util para comparar hiperparametros o estudiar el efecto de LoRA en modelos de 1.5B.
- Despliegue en entornos con recursos limitados: al ser un adaptador pequeno sobre un modelo de 1.5B, puede ejecutarse en una GPU consumer de 8-12 GB en cuantizacion de 4 bits, aunque requiere fusionar el adaptador con el modelo base antes de cuantizar.
- Generacion de respuestas en dominios acotados: si el autor ajusto el modelo a un estilo o tematica concreta (no documentada), podria emplearse para respuestas guiadas en ese dominio, previa evaluacion.
- Educacion y demostraciones: util para mostrar como se publica un adaptador LoRA en Hugging Face y como se integra con `pipeline("text-generation")`.
- Base para posteriores etapas de alineacion: el adaptador puede servir como punto de partida para DPO o RLHF con TRL, dado que ya esta en formato PEFT.
- Experimentacion con contextos largos: si se preserva la ventana de 32.768 tokens del modelo base, podria emplearse en tareas de resumen de documentos extensos, aunque el tamano de 1.5B limita la calidad en contextos muy largos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia del modelo base en FP16: aproximadamente 3,1 GB solo para pesos, mas overhead de activaciones y cache KV; en la practica, 6-8 GB para contextos moderados.
- VRAM estimada en cuantizacion de 4 bits (GGUF o AWQ): aproximadamente 1,2-1,5 GB para pesos, con 3-4 GB totales para contextos de 4.096 tokens.
- El adaptador LoRA en si ocupa muy poco espacio (el repositorio reporta 0.0 GB), pero debe fusionarse con el modelo base para su despliegue o cargarse dinamicamente con PEFT.
- GPU recomendadas: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4090 para mayor throughput; A100 o H100 no son necesarias para 1.5B.
- Cabe en GPU consumer: si, en practicamente cualquier GPU con 6 GB o mas en FP16, y en GPUs de 4 GB con cuantizacion.
- Opciones de despliegue: Transformers con PEFT, vLLM (tras fusionar el adaptador), llama.cpp u Ollama (requiere convertir a GGUF tras fusionar), TGI.
- Latencia y throughput estimados: no disponibles para este adaptador; en el modelo base de 1.5B se esperan decenas de tokens por segundo en GPU consumer, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| SasakLLM-1.5B-Instruct-v6 | ~1.5B (base) + LoRA | No disponible (base: 32.768) | No disponible | safetensors (PEFT) | Hugging Face, 0 descargas |
| Qwen2.5-1.5B-Instruct | 1.5B | 32.768 | Apache 2.0 | safetensors, GGUF | Hugging Face, ampliamente usado |
| SmolLM2-1.7B-Instruct | 1.7B | 8.192 | Apache 2.0 | safetensors, GGUF | Hugging Face |
| Llama-3.2-1B-Instruct | 1.2B | 131.072 | Llama 3.2 Community License | safetensors, GGUF | Hugging Face |

La comparativa se basa en caracteristicas publicas del modelo base y de alternativas de tamano similar; no hay datos de rendimiento del adaptador para comparar calidad.

## Limitaciones y advertencias

- Ausencia de licencia explicita: el campo de licencia no esta disponible, lo que impide determinar si el uso comercial esta permitido. Es un riesgo legal relevante para produccion.
- Model card incompleta: no se documentan dataset, hiperparametros, evaluacion ni limitaciones conocidas.
- Cero descargas y cero likes: no hay evidencia de uso ni validacion por parte de la comunidad.
- Riesgo de alucinacion: inherente a modelos de 1.5B parametros, especialmente en dominios especializados y contextos largos.
- Posible perdida de capacidades del modelo base: el ajuste SFT con LoRA puede degradar capacidades multilingues o de tool calling si el dataset era limitado o de un solo idioma.
- Idiomas soportados no confirmados: aunque el modelo base es multilingue, no se garantiza que el adaptador preserve ese comportamiento.
- Contexto: no se confirma que el adaptador mantenga la ventana de 32.768 tokens del modelo base; el ajuste LoRA podria haber sido entrenado con secuencias mas cortas.
- Versiones de framework no estandar: Transformers 5.22.1 y PyTorch 2.11.0 no son versiones estables ampliamente disponibles, lo que puede complicar la reproducibilidad.
- Sin benchmarks: no hay forma de verificar la mejora respecto al modelo base sin evaluacion propia.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/kodetr/SasakLLM-1.5B-Instruct-v6
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct
- TRL (framework de entrenamiento): https://github.com/huggingface/trl
- PEFT (libreria de adaptadores): https://github.com/huggingface/peft
- Documentacion de Qwen2.5: https://qwenlm.github.io/blog/qwen2.5/
