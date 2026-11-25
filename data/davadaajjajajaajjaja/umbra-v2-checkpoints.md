# davadaajjajajaajjaja/umbra-v2-checkpoints

## Resumen

Umbra v2 checkpoints es un adaptador LoRA publicado en Hugging Face por el usuario davadaajjajajaajjaja, entrenado mediante SFT (supervised fine-tuning) sobre el modelo base unsloth/Qwen2.5-7B-Instruct-bnb-4bit. Se distribuye como repositorio PEFT con pesos en safetensors y esta pensado para cargarse sobre el checkpoint cuantizado en 4 bits de Qwen2.5-7B-Instruct que mantiene Unsloth, de modo que hereda la arquitectura y las capacidades del modelo original de Alibaba (7.600 millones de parametros, transformer decoder-only con atencion por ventanas deslizantes y contexto nativo de 32.768 tokens).

El modelo resuelve, en principio, la necesidad de especializar Qwen2.5-7B-Instruct en un dominio o estilo concreto mediante un ajuste ligero y de bajo coste computacional. Sin embargo, la model card publicada es la plantilla por defecto de Hugging Face y no contiene informacion sustantiva: no se documentan datos de entrenamiento, hiperparametros, objetivos ni evaluaciones. El unico dato tecnico fiable es la traza de tags (peft, lora, sft, trl, unsloth) y el tamano del repositorio, 10,0 GB, coherente con un adaptador que incluye los pesos del modelo base cuantizado ademas de las matrices LoRA.

Su relevancia actual es limitada y fundamentalmente practica: sirve como ejemplo de flujo de fine-tuning con Unsloth + TRL + PEFT sobre hardware de consumo, pero no constituye un modelo listo para produccion ni un artefacto auditable. Cualquier evaluacion seria exige inspeccionar los checkpoints intermedios, verificar la configuracion del adaptador y reentrenar o validar con datos propios.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de Qwen2.5-7B-Instruct) con adaptador LoRA |
| Parametros totales | 7.600 millones en el modelo base; rango y modulos del adaptador no disponibles |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 32.768 tokens en el modelo base; no confirmado tras el ajuste |
| Tipos de cuantizacion | Modelo base en 4 bits (bnb-4bit); el adaptador se distribuye en safetensors sin cuantizar |
| Idiomas soportados | no disponible (el modelo base soporta oficialmente ingles, chino y otros 27 idiomas, pero el ajuste no lo documenta) |
| Licencia | no disponible |
| Formato de pesos | safetensors (PEFT/LoRA); requiere el base en formato bnb-4bit o equivalente |

## Arquitectura y entrenamiento

El adaptador se aplica sobre Qwen2.5-7B-Instruct, un transformer decoder-only de 28 capas, 28 cabezas de atencion y 4 cabezas KV, con atencion por ventanas deslizantes de 32.768 tokens en la mayoria de capas y atencion completa en las cuatro primeras, embeddings atados y contexto nativo de 32.768 tokens extensible a 131.072 mediante YaRN. El ajuste se realizo con LoRA segun los tags del repositorio, empleando Unsloth para la carga optimizada en 4 bits y TRL para el bucle de SFT.

No hay informacion sobre el dataset, el numero de tokens de entrenamiento, la composicion de los datos, la presencia de RLHF o DPO, el rango del adaptador, los modulos objetivo ni los hiperparametros (learning rate, batch size, epochs). La unica referencia bibliografica presente en la model card es el articulo de Lacoste et al. (2019) sobre emisiones de carbono, incluido en la plantilla por defecto y sin relacion con el entrenamiento real. El repositorio contiene checkpoints intermedios, lo que sugiere un guardado periodico durante el SFT, pero no se especifica cuantos ni en que pasos.

## Capacidades

- Generacion de texto conversacional en formato instruct, heredada de Qwen2.5-7B-Instruct.
- Razonamiento de varios pasos y matematicas basicas a nivel del modelo base, sin garantia de que el ajuste las preserve.
- Generacion de codigo en lenguajes populares, supeditada al comportamiento del base.
- Soporte de tool calling y function calling segun el formato de Qwen2.5-Instruct, no verificado tras el ajuste.
- Capacidad multilingue potencial (29 idiomas en el base), sin documentacion del adaptador.
- Modo thinking o razonamiento extendido: no disponible.
- Vision y audio: no disponibles (el base es solo texto).
- Capacidades especiales del ajuste: no disponibles.

## Casos de uso

- Prototipado de asistentes conversacionales especializados: cargar el adaptador sobre Qwen2.5-7B-Instruct en 4 bits y evaluar si el estilo o dominio del ajuste encaja con un chatbot de soporte; util porque el coste de inferencia en una RTX 4090 con 24 GB es bajo y permite iterar rapido.
- Experimentacion academica con LoRA y Unsloth: usar el repositorio como referencia de pipeline (bnb-4bit + PEFT + TRL) para reproducir el flujo de SFT en una unica GPU, comparando checkpoints intermedios para estudiar la evolucion del ajuste.
- Generacion de texto asistida en dominios verticales: si el ajuste se realizo sobre un corpus concreto (legal, sanitario, tecnico), el adaptador podria emplearse para redactar borradores; requiere validacion previa porque no hay evaluacion publicada.
- Base para un segundo ajuste (continued fine-tuning): al ser un adaptador LoRA, puede combinarse con otro adaptador o congelarse y entrenar una nueva capa para una tarea mas especifica, reutilizando el trabajo ya hecho.
- Despliegue en entornos con VRAM limitada: el base en 4 bits ocupa aproximadamente 4-5 GB, por lo que el conjunto cabe en GPUs de 8-12 GB (RTX 3060 Ti, RTX 4070) usando llama.cpp u Ollama tras convertir el modelo fusionado a GGUF.
- Evaluacion comparativa de tecnicas de ajuste: servir como punto de partida para medir deriva (catastrophic forgetting) frente al base en tareas estandar como MMLU o GSM8K, ya que el adaptador es pequeno y facil de versionar.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: 4-5 GB con el base en 4 bits y el adaptador en fp16; 14-16 GB si se fusiona y sirve en fp16.
- GPU recomendadas: RTX 3090, RTX 4090, A10G, L4 o A100 para servicio concurrente; RTX 3060 Ti o RTX 4070 para pruebas en local.
- Cabe en GPU de consumo: si, en modelos con 8 GB o mas usando cuantizacion 4-bit; en 6 GB solo con cuantizaciones GGUF agresivas (Q4_K_M o inferiores).
- Opciones de despliegue: transformers + PEFT para cargar el adaptador directamente, vLLM o TGI tras fusionar los pesos, llama.cpp u Ollama tras conversion a GGUF, y Unsloth para reentrenamiento.
- Latencia y throughput: no disponibles; dependen del backend y del hardware, sin mediciones publicadas por el autor.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Umbra v2 checkpoints | 7.600 M (base) + LoRA | 32.768 tokens (base) | no disponible | Hugging Face, 318 descargas | Adaptador sin documentacion ni evaluacion |
| Qwen2.5-7B-Instruct | 7.600 M | 32.768 tokens (131.072 con YaRN) | Apache 2.0 | Hugging Face, ampliamente usado | Modelo base oficial, con benchmarks publicados |
| Mistral-7B-Instruct v0.3 | 7.200 M | 32.768 tokens | Apache 2.0 | Hugging Face | Alternativa europea con licencia permisiva |
| Llama 3.1 8B Instruct | 8.000 M | 131.072 tokens | Llama 3.1 Community License | Hugging Face | Contexto largo y buen rendimiento general |

## Limitaciones y advertencias

- La model card es la plantilla por defecto: no hay informacion sobre datos, hiperparametros, evaluaciones ni uso previsto, lo que impide auditar el ajuste.
- Licencia no declarada: no se puede asumir uso comercial; hay que contactar con el autor o tratar el artefacto como no licenciado.
- Riesgo de alucinacion y de deriva respecto al base: sin evaluacion, no se puede descartar catastrophic forgetting en matematicas, codigo o tool calling.
- Idiomas no documentados: el ajuste podria haber degradado el multilingueismo del base si se entreno solo en un idioma.
- Sesgos desconocidos: al no publicarse el dataset, no es posible evaluar sesgos de genero, raza o ideologia.
- Repositorio de 10 GB con checkpoints intermedios: conviene revisar cada checkpoint antes de elegir uno para produccion.
- Dependencia del base en bnb-4bit: la carga requiere bitsandbytes y una GPU compatible; en CPU la inferencia es impractical sin conversion a GGUF.
- Sin garantias de soporte ni mantenimiento: el autor no ha publicado issues, demo ni contacto.

## Enlaces

- Hugging Face: https://huggingface.co/davadaajjajajaajjaja/umbra-v2-checkpoints
- Modelo base: https://huggingface.co/unsloth/Qwen2.5-7B-Instruct-bnb-4bit
- Qwen2.5-7B-Instruct original: https://huggingface.co/Qwen/Qwen2.5-7B-Instruct
- Unsloth: https://github.com/unslothai/unsloth
- TRL: https://github.com/huggingface/trl
- PEFT: https://github.com/huggingface/peft
- Paper citado en la model card (Lacoste et al., 2019): https://arxiv.org/abs/1910.09700
