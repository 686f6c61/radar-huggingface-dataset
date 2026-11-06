# okamo10/qwen3b-ohnuma-lora-v3

## Resumen

`okamo10/qwen3b-ohnuma-lora-v3` es un adaptador LoRA publicado en Hugging Face sobre el modelo base `Qwen/Qwen2.5-3B-Instruct`. Se trata de un ajuste fino supervisado (SFT) mediante la librería PEFT (version 0.21.2) y TRL, orientado a generacion de texto conversacional. El repositorio contiene unicamente los pesos del adaptador (0,1 GB), no el modelo completo, por lo que requiere descargar por separado el modelo base Qwen2.5-3B-Instruct para poder utilizarse.

El autor, identificado como `okamo10`, no ha proporcionado informacion sustantiva en la model card: todos los campos relevantes (desarrollador, tipo de modelo, idiomas, licencia, datos de entrenamiento, hiperparametros, evaluacion) aparecen con el marcador generico "More Information Needed" de la plantilla estandar de Hugging Face. Por tanto, la mayor parte de las especificaciones tecnicas de esta ficha deben inferirse del modelo base o marcarse como no disponibles.

La relevancia de este modelo es limitada: cuenta con cero descargas y cero likes en el momento de la consulta, y fue creado en noviembre de 2026. Su interes practico radica en que demuestra un flujo de trabajo de ajuste fino LoRA sobre un modelo Instruct pequeno (3B parametros) del ecosistema Qwen2.5, lo que permite adaptaciones de bajo coste en hardware de consumo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | adaptador LoRA (PEFT) sobre transformer decoder-only del modelo base Qwen2.5-3B-Instruct |
| Parametros totales | no disponible para el adaptador; el modelo base Qwen2.5-3B-Instruct tiene 3,09 mil millones (segun el modelo base) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible en el adaptador; el modelo base Qwen2.5-3B-Instruct soporta 32 768 tokens nativos (hasta 131 072 con YaRN, segun el modelo base) |
| Tipos de cuantizacion | no disponible para el adaptador; el modelo base admite combinaciones con cuantizaciones GGUF, AWQ, GPTQ y bitsandbytes |
| Idiomas soportados | no disponible en la model card; el modelo base Qwen2.5 declara soporte para mas de 29 idiomas |
| Licencia | no disponible |
| Formato de pesos | safetensors (adaptador LoRA empaquetado con PEFT) |

## Arquitectura y entrenamiento

El artefacto es un adaptador LoRA (Low-Rank Adaptation) que modifica las matrices de atencion y proyeccion del modelo base Qwen2.5-3B-Instruct, un transformer decoder-only con atencion por ventanas deslizantes combinada con atencion completa, RoPE, SwiGLU en el MLP y normalizacion RMSNorm. El entrenamiento se realizo mediante SFT (supervised fine-tuning) con TRL y PEFT 0.21.2, segun los metadatos del repositorio. No se especifican el numero de tokens de entrenamiento, la composicion del dataset, la longitud de secuencia utilizada ni los hiperparametros (learning rate, rango de LoRA, alpha, dropout, precision mixta).

Tampoco se documentan innovaciones tecnicas propias ni fases de RLHF o DPO posteriores al ajuste supervisado. Al tratarse de un LoRA sobre un modelo ya alineado por instrucciones, lo esperable es que herede el comportamiento conversacional del base y desvie el estilo o el dominio segun los datos del autor, pero sin informacion publica no es posible verificar hacia que dominio se ha especializado el adaptador (el nombre "ohnuma" no es descriptivo por si mismo).

## Capacidades

- Generacion de texto conversacional multi-turno, heredada del modelo base Qwen2.5-3B-Instruct.
- Razonamiento basico, matematicas elementales y generacion de codigo, en la medida en que lo soporte el base.
- Soporte de instrucciones y formato chat (Qwen ChatML), ya que el adaptador se aplica sobre un modelo Instruct.
- Capacidades multilingues dependientes del base (Qwen2.5 declara soporte para decenas de idiomas), aunque el adaptador puede haber reducido o desplazado ese soporte segun sus datos de entrenamiento, que no se documentan.
- Tool calling / function calling: no disponible de forma verificable en el adaptador; el base Qwen2.5-3B-Instruct lo soporta de forma nativa, pero el ajuste LoRA puede degradarlo.
- Modo thinking, vision o audio: no disponibles.

## Casos de uso

- Prototipado rapido de asistentes conversacionales especializados: el adaptador se puede cargar sobre Qwen2.5-3B-Instruct con `peft` y `transformers` en una GPU de consumo, lo que permite validar estilos de respuesta o tonos concretos sin reentrenar el modelo completo.
- Experimentacion academica con LoRA y SFT: sirve como ejemplo reproducible de un pipeline TRL + PEFT 0.21.2 sobre un modelo Instruct de 3B, util para comparar hiperparametros o rangos de adaptador.
- Ajuste de tono o personalidad en un chatbot de dominio cerrado: si el autor ha entrenado sobre un corpus especifico (no documentado), el adaptador puede desviar el registro del base sin coste de inferencia adicional apreciable.
- Despliegue en hardware modesto: al combinarse con el base en 4 bits, cabe en GPUs de 8 GB, lo que permite probar variantes ajustadas en portatiles con RTX 3060/4060.
- Base para nuevos ajustes incrementales: el adaptador puede fusionarse (`merge_and_unload`) con el base y servir como punto de partida para un segundo LoRA sobre un dominio mas especifico.
- Evaluacion comparativa de adaptadores: util en pipelines de investigacion que miden deriva de estilo o regresion en benchmarks al aplicar LoRA sobre modelos Instruct pequenos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- El adaptador en si ocupa 0,1 GB; el grueso del coste esta en el modelo base Qwen2.5-3B-Instruct.
- Inferencia del base en bf16/fp16: aproximadamente 6-7 GB de VRAM, por lo que cabe en GPUs de 8 GB (RTX 3060 Ti, RTX 4060, RTX 3070) con margen justo para contexto moderado.
- Inferencia en 4 bits (bitsandbytes, GPTQ o AWQ): alrededor de 2-2,5 GB de VRAM, con lo que puede ejecutarse en GPUs de 4-6 GB e incluso en CPU con llama.cpp u Ollama tras fusionar y convertir el adaptador a GGUF.
- GPUs recomendadas para produccion: A10G, L4, A100 40 GB o H100 si se sirven varias replicas; para uso individual, RTX 4090 o RTX 3090 permiten contexto largo en bf16.
- Opciones de despliegue: `transformers` + `peft` (carga del adaptador sin fusion), vLLM (previo `merge_and_unload`), TGI, llama.cpp y Ollama (requieren conversion del modelo fusionado a GGUF).
- Latencia y throughput: no disponibles; dependen del hardware y de la cuantizacion elegida.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| okamo10/qwen3b-ohnuma-lora-v3 | LoRA sobre base de 3,09 B | no disponible (base: 32 768) | no disponible | safetensors (PEFT) | Hugging Face, 0 descargas |
| Qwen/Qwen2.5-3B-Instruct | 3,09 B | 32 768 (131 072 con YaRN) | Apache 2.0 (segun el modelo base) | safetensors, GGUF, AWQ, GPTQ | Hugging Face, ampliamente usado |
| Meta Llama 3.2 3B Instruct | 3,21 B | 131 072 | Llama 3.2 Community License | safetensors, GGUF | Hugging Face, muy extendido |
| Microsoft Phi-3.5-mini-instruct | 3,82 B | 131 072 | MIT | safetensors, GGUF | Hugging Face, muy extendido |

La comparativa es aproximada: los datos del adaptador no estan documentados y los del base se toman de la informacion publica del modelo Qwen2.5-3B-Instruct.

## Limitaciones y advertencias

- Model card incompleta: no se documentan datos de entrenamiento, hiperparametros, evaluacion, licencia ni idiomas, lo que impide auditar el comportamiento del adaptador.
- Licencia no disponible: no puede confirmarse si el uso comercial esta permitido; ademas, la licencia efectiva esta condicionada por la del modelo base Qwen2.5-3B-Instruct (Apache 2.0 segun la informacion publica del base), pero el adaptador en si no la declara.
- Riesgo de alucinacion heredado del base de 3B, que es un modelo pequeno con conocimiento limitado y propenso a errores factuales, especialmente en contextos largos o dominios especializados.
- Posible degradacion de capacidades del base (tool calling, multilingue, matematicas) si el ajuste SFT se ha realizado sobre un dataset estrecho o de baja calidad, algo que no puede descartarse sin informacion del autor.
- Cero descargas y cero likes: no hay evidencia de uso en produccion ni validacion por parte de la comunidad.
- Sin garantia de soporte ni mantenimiento; el autor no ha facilitado contacto ni repositorio de codigo.
- Incompatibilidad potencial con versiones futuras de PEFT o TRL: el adaptador se genero con PEFT 0.21.2 y puede requerir esa version o superior.

## Enlaces

- Hugging Face: https://huggingface.co/okamo10/qwen3b-ohnuma-lora-v3
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-3B-Instruct
- Paper de referencia sobre impacto ambiental citado en la model card: https://arxiv.org/abs/1910.09700
- Calculadora de impacto ML citada en la model card: https://mlco2.github.io/impact
- Libreria PEFT: https://github.com/huggingface/peft
- Libreria TRL: https://github.com/huggingface/trl
