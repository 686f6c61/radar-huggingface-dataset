# jlsrls/mainsweep4ep-ctrl-s1-em

## Resumen

jlsrls/mainsweep4ep-ctrl-s1-em es un ajuste fino (SFT) del modelo unsloth/Llama-3.2-1B-Instruct, publicado por el usuario jlsrls en Hugging Face. Se trata de un checkpoint experimental entrenado con TRL 0.24.0 y Unsloth, cuyo registro de entrenamiento apunta al proyecto de Weights & Biases "clarifying-em" de la Portland State University (run l70ma0tr). El repositorio ocupa 2,3 GB y contiene pesos en safetensors, un tamano compatible con un ajuste fino de pesos completos en bf16/fp16 y no con un adaptador LoRA, aunque la model card no lo especifica.

El modelo no incluye informacion sobre el conjunto de datos, el objetivo de entrenamiento, la licencia ni los idiomas soportados. La nomenclatura ("mainsweep4ep-ctrl-s1-em") y el nombre del proyecto de W&B sugieren un barrido de experimentos con condiciones de control y semillas, orientado a estudiar comportamientos de clarificacion o elicitacion emocional, pero esto es una inferencia a partir de los metadatos y no un dato documentado. Existe ademas un checkpoint hermano, jlsrls/mainsweep4ep-kl10000-s1-logitrl, que apunta al mismo programa experimental.

Por su tamano (1,24 mil millones de parametros heredados del modelo base) y su contexto de 128 000 tokens, este tipo de checkpoint resulta interesante para experimentacion en local, analisis de derivas de comportamiento tras un SFT con pocos pasos y como material de replicacion academica. No es, en cambio, un modelo recomendado para produccion: no tiene descargas ni likes, no publica evaluaciones y su licencia no esta declarada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada del modelo base Llama 3.2 1B Instruct: RMSNorm, SwiGLU, RoPE, GQA); no documentada en la model card del ajuste |
| Parametros totales | ~1,24 mil millones (modelo base Llama 3.2 1B); no confirmado en el ajuste |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | 128 000 tokens en el modelo base; no verificada tras el ajuste fino |
| Tipos de cuantizacion | no disponible en el repositorio (solo pesos safetensors); el modelo base admite GGUF, AWQ, GPTQ y bitsandbytes en implementaciones de terceros |
| Idiomas soportados | no disponibles (el modelo base declara oficialmente ingles, aleman, frances, italiano, portugues, hindi, espanol y thai) |
| Licencia | no disponible (la model card indica "licence: license" sin especificar; el modelo base usa la Llama 3.2 Community License) |
| Formato de pesos | safetensors (repositorio de 2,3 GB) |
| Libreria declarada | transformers |
| Tamano del repositorio | 2,3 GB |
| Descargas / likes | 0 / 0 |
| Fecha de publicacion (metadatos HF) | 2026-09-25 |
| Ultima actualizacion (metadatos HF) | 2026-09-25 |
| Etiquetas relevantes | generated_from_trainer, unsloth, sft, trl, endpoints_compatible |

## Arquitectura y entrenamiento

El ajuste parte de Llama 3.2 1B Instruct, un transformer decoder-only de 16 capas, dimension oculta 2048, 32 cabezas de atencion con 8 cabezas KV (GQA), dimension de cabeza 64, FFN intermedia de 8192 y vocabulario de 128 256 tokens con embeddings compartidos. Segun la informacion publica de Meta sobre la familia Llama 3.2, los modelos de 1B y 3B se obtuvieron podando Llama 3.1 8B y destilandolos despues con logits de Llama 3.1 8B y 70B, con un entrenamiento de hasta 9 billones de tokens. Estos datos corresponden al modelo base, no al checkpoint aqui descrito.

El entrenamiento del ajuste se realizo con SFT mediante TRL 0.24.0 (Transformers 5.5.0, PyTorch 2.11.0, Datasets 4.3.0, Tokenizers 0.22.2) y la libreria Unsloth. La model card no indica el dataset, el numero de pasos, la tasa de aprendizaje, la estrategia de precision ni si se aplicaron tecnicas adicionales como DPO, RLHF o distillation con logits (aunque el checkpoint hermano "logitrl" sugiere que el programa experimental si explora senales de logits). El unico artefacto trazable es el run de W&B enlazado desde la propia model card.

## Capacidades

- Generacion de texto conversacional en formato chat, heredada del modelo base Instruct; la model card incluye un ejemplo con `transformers.pipeline` y entrada con roles `user`.
- Razonamiento basico y respuesta a preguntas cortas, limitado por el tamano de 1,24 mil millones de parametros.
- Generacion de codigo sencillo y tareas de matematicas elementales, capacidades presentes en el modelo base pero sin evaluar en este checkpoint.
- Soporte de tool calling / function calling en el modelo base Llama 3.2 1B Instruct (Meta disena los modelos ligeros de la familia para uso agente y en dispositivo); no verificado tras el ajuste.
- Capacidades multilingues teoricas correspondientes a los ocho idiomas declarados por Meta para el modelo base; no confirmadas ni evaluadas en el ajuste.
- Contexto largo de hasta 128 000 tokens en el modelo base, util para tareas de resumen o recuperacion con documentos extensos, siempre que el ajuste no haya degradado esta capacidad.
- No se documenta ningun modo especial (thinking mode, vision, audio, decodificacion especulativa propia) ni ninguna capacidad adicional introducida por el ajuste.

## Casos de uso

- Replicacion de experimentos academicos: el checkpoint sirve para reproducir el barrido registrado en el run de W&B del proyecto "clarifying-em" y comparar condiciones de control frente a otros checkpoints de la misma serie.
- Analisis de deriva de comportamiento tras SFT: permite medir como un ajuste fino corto sobre Llama 3.2 1B altera rasgos como la tendencia a pedir aclaraciones, el tono o la verbosidad, comparando las salidas con el modelo base.
- Generacion de texto local sin conexion: con 1,24 mil millones de parametros, el modelo puede ejecutarse en un portatil o en una GPU de gama media para prototipos de chat y pruebas de prompt engineering sin coste de API.
- Banco de pruebas para pipelines de cuantizacion: al ser un checkpoint pequeno en safetensors, es un candidato comodo para convertir a GGUF, AWQ o GPTQ y medir la degradacion de calidad en cada formato.
- Evaluacion comparativa con el modelo base: util para estudiar tecnicas de deteccion de overfitting o catastrophic forgetting en ajustes finos pequenos.
- Educacion y docencia: sirve como ejemplo minimo y trazable de un flujo completo Unsloth + TRL + W&B en cursos o talleres sobre ajuste fino.
- Prototipado de sistemas de clarificacion de requisitos: si el objetivo del entrenamiento es la elicitacion de informacion, el modelo puede emplearse en experimentos de dialogo donde se quiera inducir preguntas de aclaracion antes de responder.
- Despliegue en Hugging Face Inference Endpoints: la etiqueta `endpoints_compatible` indica que el repositorio esta preparado para ese tipo de despliegue, aunque no existan evaluaciones de calidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye tablas de MMLU, GSM8K, HumanEval ni de ningun otro conjunto de evaluacion, y tampoco hay resultados de evaluacion en la pagina de Hugging Face ni en los resultados de busqueda web proporcionados. Las cifras publicadas por Meta para el modelo base Llama 3.2 1B Instruct no son extrapolables a este checkpoint, que no ha sido evaluado.

| Benchmark | Este modelo | Modelo base (Llama 3.2 1B Instruct) | Alternativas comparables |
|---|---|---|---|
| MMLU | no disponible | consultar la model card oficial de Meta | no disponible |
| GSM8K | no disponible | consultar la model card oficial de Meta | no disponible |
| HumanEval | no disponible | consultar la model card oficial de Meta | no disponible |
| Evaluaciones propias | ninguna registrada en el repositorio | no aplica | no disponible |

## Requisitos de hardware

- Pesos en bf16/fp16: aproximadamente 2,5 GB solo de pesos. Con cache KV y activaciones, una inferencia en contexto corto cabe en torno a 4-6 GB de VRAM.
- Cuantizacion de 8 bits: aproximadamente 1,3-1,5 GB de pesos; cuantizacion de 4 bits: aproximadamente 0,8-1 GB. En ambos casos la inferencia completa baja de 2-3 GB de VRAM en contexto corto.
- Cache KV en contexto completo: calculada a partir de la arquitectura del modelo base (16 capas, 8 cabezas KV, dimension de cabeza 64, bf16), ocupa unos 32 KB por token, es decir, alrededor de 4,3 GB para 128 000 tokens. Esta cifra es un calculo derivado del modelo base, no una medida del checkpoint.
- GPU recomendadas: cualquier GPU con 8 GB o mas funciona sin cuantizar (RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4090, L4, A10G). En A100 y H100 el modelo queda muy sobredimensionado y solo tiene sentido por agregacion de peticiones.
- Cabe en GPU de consumo: si, en practicamente todas las GPU dedicadas modernas de 6-8 GB o superiores, y tambien en CPU con llama.cpp, en equipos Apple Silicon mediante Metal y en telefonos de gama alta con cuantizacion de 4 bits.
- Opciones de despliegue: transformers (el ejemplo de la model card), vLLM, TGI, llama.cpp u Ollama tras convertir los safetensors a GGUF, Unsloth para ajuste adicional, y Hugging Face Inference Endpoints dado el tag `endpoints_compatible`. El repositorio solo distribuye safetensors, por lo que cualquier formato GGUF requiere conversion previa.
- Latencia y throughput: no disponibles. No se han publicado mediciones para este checkpoint. Como referencia generica para modelos de ~1 000 millones de parametros en bf16 sobre GPU de gama alta, el throughput suele situarse en el orden de cientos a pocos miles de tokens por segundo, pero es una orientacion no verificada para este modelo concreto.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Rendimiento |
|---|---|---|---|---|---|
| jlsrls/mainsweep4ep-ctrl-s1-em | ~1,24 mil millones | 128 000 tokens (heredado, no verificado) | no disponible | 0 descargas, 0 likes, safetensors | sin evaluaciones publicadas |
| unsloth/Llama-3.2-1B-Instruct | ~1,24 mil millones | 128 000 tokens | Llama 3.2 Community License | ampliamente distribuido en Hugging Face | cifras publicadas por Meta en la model card oficial |
| Qwen/Qwen2.5-1.5B-Instruct | ~1,5 mil millones | 32 768 tokens | Apache 2.0 | ampliamente distribuido | cifras publicadas por el equipo de Qwen |
| HuggingFaceTB/SmolLM2-1.7B-Instruct | ~1,7 mil millones | 8 192 tokens | Apache 2.0 | ampliamente distribuido | cifras publicadas por Hugging Face |
| google/gemma-2-2b-it | ~2,6 mil millones | 8 192 tokens | Gemma Terms of Use | ampliamente distribuido | cifras publicadas por Google |

Frente a estas alternativas, la unica ventaja diferencial del checkpoint analizado es su caracter experimental y trazable (run de W&B enlazado), no su rendimiento ni su soporte. Para uso general conviene optar por el modelo base o por alternativas con licencia clara y evaluaciones publicadas; Qwen2.5-1.5B-Instruct y SmolLM2-1.7B-Instruct ofrecen licencias permisivas (Apache 2.0) que el checkpoint aqui descrito no declara.

## Limitaciones y advertencias

- No se ha publicado ninguna evaluacion: se desconoce si el ajuste mejora, mantiene o degrada las capacidades del modelo base.
- Riesgo alto de sobreajuste al dataset de entrenamiento, no documentado, con el consiguiente efecto de olvido catastrofico en tareas generales.
- Riesgo de alucinacion inherente a un modelo de 1,24 mil millones de parametros, especialmente en razonamiento multi-paso, matematicas y datos factuales.
- Licencia no declarada. La model card incluye el campo "licence: license" sin contenido, por lo que no puede asumirse uso comercial sin verificar la licencia heredada del modelo base (Llama 3.2 Community License) y sus restricciones adicionales (clausula de licencia de IA aceptable, obligacion de atribucion y de nombrar el modelo derivado).
- Idiomas no declarados para el checkpoint; las capacidades multilingues del modelo base no estan garantizadas tras el ajuste.
- Contexto no verificado tras el ajuste: aunque el modelo base soporta 128 000 tokens, un SFT no documentado puede haber alterado el comportamiento en secuencias largas.
- Datos de entrenamiento desconocidos, lo que impide auditar sesgos, contaminacion de benchmarks o presencia de contenido danino.
- Repositorio sin mantenimiento aparente (creado y actualizado el mismo dia, 0 descargas, 0 likes), sin issues ni documentacion adicional.
- No apto para produccion ni para decisiones automatizadas sin una evaluacion previa exhaustiva propia.
- El uso de la libreria Unsloth y de versiones de TRL/Transformers muy recientes puede provocar incompatibilidades con entornos de inferencia mas antiguos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/jlsrls/mainsweep4ep-ctrl-s1-em
- Modelo base: https://huggingface.co/unsloth/Llama-3.2-1B-Instruct
- Checkpoint hermano de la misma serie: https://huggingface.co/jlsrls/mainsweep4ep-kl10000-s1-logitrl
- Run de entrenamiento en Weights & Biases: https://wandb.ai/rezvani-portland-state-university/clarifying-em/runs/l70ma0tr
- Repositorio de TRL: https://github.com/huggingface/trl
- Documentacion de Unsloth (framework de ajuste fino usado): https://github.com/unslothai/unsloth
