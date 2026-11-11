# HungryDino/qwen_2.5_7b-political_left_numbers-collapse_p10_e5_r8_ct128_worldview-run1-gen8

## Resumen

Este repositorio contiene un ajuste fino (fine-tuning) del modelo Qwen2.5-7B-Instruct, desarrollado por el usuario HungryDino y publicado bajo licencia Apache 2.0. Se trata de un modelo derivado de la familia Qwen2.5 de Alibaba, concretamente de la variante Instruct de 7.000 millones de parametros, sobre la que se ha aplicado un entrenamiento adicional mediante las librerias Unsloth y TRL de Hugging Face. El nombre del repositorio sugiere un experimento de condicionamiento conductual orientado a un "worldview" politico concreto, con parametros de entrenamiento que apuntan a LoRA (r=8) y a un dataset de 128 tokens de contexto durante el ajuste.

El modelo hereda la arquitectura transformer decoder-only de Qwen2.5, con una ventana de contexto nativa de 32.768 tokens (extensible a 131.072 en la familia Qwen2.5). El ajuste se ha realizado con el objetivo declarado de acelerar el entrenamiento (2x mas rapido) gracias a Unsloth, pero la model card no documenta el dataset, la metodologia ni los objetivos concretos del fine-tuning mas alla del nombre del experimento.

Es relevante ahora porque ejemplifica una tendencia creciente: la publicacion de adaptaciones LoRA de bajo coste sobre modelos base potentes, con propositos de investigacion sobre sesgos y comportamiento. No obstante, la falta de documentacion y la ausencia de benchmarks hacen que su uso en produccion requiera cautela y validacion propia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2) |
| Parametros totales | 7.000 millones (heredados de Qwen2.5-7B-Instruct) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la model card; el modelo base Qwen2.5-7B-Instruct soporta 32.768 tokens nativos |
| Tipos de cuantizacion | no disponible (el repo contiene safetensors; se puede cuantizar a GGUF/AWQ mediante herramientas externas) |
| Idiomas soportados | en (segun la model card) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de Qwen2.5-7B-Instruct, un transformer decoder-only con atencion de causalidad estandar, normalizacion RMSNorm, activacion SwiGLU y embeddings rotatorios (RoPE). Qwen2.5 incorpora mejoras sobre Qwen2 respecto a datos de entrenamiento y alineacion, con un corpus de hasta 18 billones de tokens en la familia completa. El fine-tuning aqui aplicado se ha realizado con Unsloth y TRL, lo que tipicamente implica adaptadores LoRA o QLoRA sobre el modelo base, con un rango r=8 y contexto de entrenamiento de 128 tokens segun el nombre del repositorio.

No se dispone de informacion sobre el dataset de ajuste, el numero de tokens adicionales, la composicion de los datos ni si se aplicaron tecnicas de RLHF o DPO posteriores. El nombre del experimento ("political_left_numbers-collapse_p10_e5_r8_ct128_worldview-run1-gen8") sugiere un estudio sobre colapso de numeros en respuestas politicas, pero no hay documentacion tecnica que lo confirme. No se han publicado innovaciones tecnicas destacables mas alla del uso de Unsloth para acelerar el entrenamiento.

## Capacidades

- Generacion de texto en ingles, heredada del modelo base Qwen2.5-7B-Instruct.
- Razonamiento y respuesta a instrucciones, con posible alteracion del comportamiento original debido al fine-tuning.
- Generacion de codigo y matematicas (capacidad heredada del base, no verificada tras el ajuste).
- Soporte de tool calling y function calling (heredado del base, no verificado).
- Capacidades multilingues limitadas al ingles segun la model card, aunque el base soporta mas idiomas.
- No se documentan capacidades especiales como thinking mode, vision o audio.

## Casos de uso

- Investigacion sobre sesgos politicos: el modelo puede emplearse para estudiar como un fine-tuning dirigido altera las respuestas del modelo base en temas politicos, comparando salidas antes y despues del ajuste.
- Analisis de colapso de numeros: dado el nombre del experimento, puede usarse para examinar la degradacion en la generacion de cifras y datos numericos en contextos politicos.
- Evaluacion de robustez de LoRA: sirve como caso de estudio para medir como adaptadores de bajo rango (r=8) afectan al comportamiento de un modelo de 7B en dominios especificos.
- Pruebas de alineacion y seguridad: util para validar pipelines de deteccion de sesgos en modelos ajustados antes de su despliegue.
- Generacion de texto controlada en entornos de investigacion: con contexto corto (128 tokens de entrenamiento), adecuado para tareas de clasificacion o respuesta breve en ingles.
- Reproducibilidad de experimentos: permite replicar el pipeline de Unsloth + TRL documentado por el autor para estudiar fine-tunings de bajo coste.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16: aproximadamente 14-16 GB para los pesos del modelo de 7B.
- VRAM estimada en cuantizacion 8 bits: aproximadamente 8-9 GB.
- VRAM estimada en cuantizacion 4 bits (GGUF Q4): aproximadamente 4-5 GB.
- GPU recomendadas: A100 40GB, H100 80GB para FP16 sin cuantizar; RTX 4090 (24 GB) para FP16 o 8 bits; RTX 3090/4080 para 8 bits.
- Cabe en GPU de consumo: si, en RTX 4090, RTX 3090, RTX 4080 y GPUs con 8 GB o mas si se cuantiza a 4 bits.
- Opciones de despliegue: vLLM, TGI (text-generation-inference), llama.cpp, Ollama (previa conversion a GGUF), transformers con bitsandbytes.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| HungryDino/qwen_2.5_7b-political_left... | 7B | no disponible (base: 32.768) | Apache 2.0 | Hugging Face |
| Qwen2.5-7B-Instruct | 7B | 32.768 (extensible a 131.072) | Apache 2.0 | Hugging Face |
| Mistral-7B-Instruct-v0.3 | 7B | 32.768 | Apache 2.0 | Hugging Face |
| Llama-3.1-8B-Instruct | 8B | 131.072 | Llama 3.1 Community License | Hugging Face |

El modelo ajustado no presenta benchmarks publicos que permitan comparar su rendimiento con las alternativas. Su principal diferencia frente al base es el fine-tuning especifico, cuyo efecto no esta cuantificado.

## Limitaciones y advertencias

- Ausencia total de documentacion sobre el dataset de entrenamiento y la metodologia, lo que impide evaluar la calidad y los sesgos introducidos.
- El nombre del experimento sugiere un condicionamiento politico deliberado, con riesgo de sesgo sistematico en temas politicos y numericos.
- Riesgo elevado de alucinacion y de degradacion de capacidades originales del base (codigo, matematicas, tool calling) no verificadas.
- Contexto de entrenamiento de solo 128 tokens, lo que puede limitar el rendimiento en tareas de contexto largo pese a la ventana nativa del base.
- Idioma limitado al ingles segun la model card, aunque el base soporta mas idiomas.
- Licencia Apache 2.0 permite uso comercial, pero la falta de garantias y documentacion desaconseja su uso en produccion sin validacion exhaustiva.
- El repositorio tiene 0 descargas y 0 likes, sin evidencia de uso o validacion por parte de la comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/HungryDino/qwen_2.5_7b-political_left_numbers-collapse_p10_e5_r8_ct128_worldview-run1-gen8
- Modelo base: https://huggingface.co/unsloth/Qwen2.5-7B-Instruct
- Unsloth: https://github.com/unslothai/unsloth
- TRL: https://github.com/huggingface/trl
- Qwen2.5 (familia): https://huggingface.co/Qwen/Qwen2.5-7B-Instruct
