# limanox/Llama-3.2-3B-prose-style

## Resumen

limanox/Llama-3.2-3B-prose-style es un ajuste fino (fine-tune) del modelo abierto Llama 3.2 3B de Meta, publicado por el usuario limanox en HuggingFace. Se trata de una variante orientada a la generacion de prosa, construida a partir de la version cuantizada a 4 bits de Unsloth (unsloth/llama-3.2-3b-unsloth-bnb-4bit), y cuenta con 3.212.749.824 parametros (aproximadamente 3,2 mil millones).

El modelo hereda la arquitectura transformer decoder-only de Llama 3.2, con Grouped-Query Attention y RoPE, y se distribuye en formato safetensors bajo licencia Apache 2.0. Esta pensado para tareas de generacion de texto en ingles y, por su tamano reducido, puede ejecutarse en hardware de consumo, lo que lo hace atractivo para experimentacion local, prototipado y despliegues con recursos limitados.

Su relevancia actual es la de un ejemplo tipico de fine-tune comunitario de bajo coste: la model card no documenta el dataset, el numero de tokens ni los hiperparametros de entrenamiento, y no se han publicado benchmarks propios. Es, por tanto, un artefacto experimental mas que un modelo validado para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Llama 3.2), con Grouped-Query Attention y RoPE |
| Parametros totales | 3.212.749.824 (aprox. 3,2B) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no especificada en la ficha; el modelo base Llama 3.2 3B soporta hasta 128.000 tokens |
| Tipos de cuantizacion | pesos en safetensors (repo de 6,4 GB, consistente con bf16/fp16); el modelo base estaba cuantizado a 4 bits con bitsandbytes; no se publican cuantizaciones GGUF oficiales |
| Idiomas soportados | en (ingles, segun la etiqueta de la ficha) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only de la familia Llama 3.2, con atencion de consultas agrupadas (GQA) y embeddings posicionales rotatorios (RoPE). Parte de unsloth/llama-3.2-3b-unsloth-bnb-4bit, una version del Llama 3.2 3B cuantizada a 4 bits por Unsloth. El fine-tune se realizo con las herramientas de Unsloth y la libreria TRL de HuggingFace; la model card afirma que el entrenamiento fue "2x mas rapido" gracias a Unsloth, aunque no se aportan detalles sobre el dataset, el numero de tokens ni la composicion de los datos.

No se documenta si hubo RLHF, DPO u otra fase de alineacion adicional, ni que tecnica de ajuste (LoRA, QLoRA, fine-tune completo) se empleo sobre la base cuantizada. La unica innovacion tecnica mencionada es el uso del stack de Unsloth para acelerar y reducir el coste de memoria del entrenamiento. No se especifica ninguna tecnica de decodificacion especulativa, atencion lineal ni modificacion arquitectonica propia.

## Capacidades

- Generacion de texto en ingles, con enfasis declarado en la produccion de prosa.
- Razonamiento basico y tareas de instruccion heredadas del modelo base Llama 3.2 3B.
- Soporte de tool calling / function calling heredado del modelo base (segun la documentacion de Llama 3.2 3B).
- Capacidad de seguir instrucciones, resumir y reescribir prompts, rasgos atribuidos al modelo base por la documentacion oficial.
- Capacidades multilingues limitadas: la ficha solo declara ingles, aunque el modelo base soporta oficialmente varios idiomas.
- No se declaran capacidades de vision, audio ni modo de razonamiento explicito (thinking mode).

## Casos de uso

- Generacion de prosa y redaccion creativa: el modelo esta afinado especificamente para este estilo, por lo que resulta adecuado para borradores de articulos, relatos o descripciones con registro narrativo.
- Prototipado local en hardware de consumo: con 3,2B parametros puede ejecutarse en GPUs de gama media o incluso en CPU, lo que permite iterar sin coste de API.
- Tareas de reescritura y parafraseo en ingles: util para normalizar o reformular textos manteniendo el significado.
- Resumen de documentos cortos: hereda la capacidad de sumarizacion del modelo base y es suficiente para textos de extension moderada.
- Asistentes conversacionales ligeros: puede gestionar dialogos multi-turno mientras el historial quepa en la ventana de contexto del modelo base.
- Educacion y experimentacion: sirve como caso de estudio de fine-tune con Unsloth y TRL para quienes quieran reproducir el flujo de trabajo.
- Generacion de texto en pipelines de bajo presupuesto: integrable en scripts de procesamiento por lotes donde no se justifica un modelo mayor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks del fine-tune en la informacion disponible.

Como referencia del modelo base, la documentacion de Llama 3.2 3B indica que supera a Gemma 2 2.6B y Phi 3.5-mini en tareas como seguimiento de instrucciones, sumarizacion, reescritura de prompts y uso de herramientas. Estos datos corresponden al modelo original de Meta, no a este fine-tune, y no deben extrapolarse sin verificacion.

## Requisitos de hardware

- VRAM estimada en bf16/fp16: en torno a 6,4 GB solo para los pesos, mas overhead de activaciones (habitualmente 7-8 GB en total).
- VRAM estimada en 8 bits: aproximadamente 3,5 GB para los pesos.
- VRAM estimada en 4 bits: aproximadamente 2 GB para los pesos.
- GPU recomendadas: cabe con holgura en NVIDIA RTX 3060 12 GB, RTX 4070, RTX 4080, RTX 4090 y GPUs de datacenter como A100 o H100 (ampliamente sobredimensionadas para este tamano).
- Cabe en GPU de consumo: si. En bf16 encaja en GPUs con 8 GB o mas; en cuantizacion de 4 bits puede ejecutarse en GPUs con 4-6 GB o incluso en CPU.
- Opciones de despliegue: transformers, text-generation-inference (TGI), vLLM (previo ajuste o conversion), llama.cpp y Ollama (requiere convertir los pesos a GGUF, no se distribuye GGUF oficial).
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| limanox/Llama-3.2-3B-prose-style | 3,2B | no disponible | Apache 2.0 | HuggingFace |
| meta-llama/Llama-3.2-3B (base) | 3,2B | 128.000 tokens | Llama 3.2 Community License | HuggingFace |
| Gemma 2 2.6B | 2,6B | no disponible | Gemma | HuggingFace, Ollama |
| Phi 3.5-mini | no disponible | no disponible | no disponible | HuggingFace, Ollama |

Los datos de rendimiento comparado de estos modelos no estan disponibles en la informacion proporcionada. La comparativa de licencias es relevante: este fine-tune se publica bajo Apache 2.0, mientras que el modelo base de Meta usa la Llama 3.2 Community License, con condiciones de uso adicionales.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados en la ficha; al heredar de Llama 3.2, arrastra los sesgos del modelo base y del corpus de entrenamiento no especificado.
- Riesgo de alucinacion: presente, como en cualquier modelo de 3B; no hay evaluaciones que lo cuantifiquen.
- Limitacion de idioma: la ficha declara unicamente ingles, por lo que su uso en castellano no esta garantizado.
- Longitud de contexto: no se especifica para el fine-tune y podria no coincidir con los 128.000 tokens del modelo base.
- Licencia para uso comercial: el fine-tune se publica bajo Apache 2.0, pero conviene verificar que los terminos de la Llama 3.2 Community License del modelo base permiten el uso previsto.
- Caveat de produccion: la model card es minima (sin dataset, sin hiperparametros, sin benchmarks), el modelo no tiene descargas ni likes y se publico en una unica fecha, por lo que no esta validado ni contrastado.
- La base esta cuantizada a 4 bits, lo que puede introducir perdida de calidad adicional respecto a un fine-tune sobre pesos completos.

## Enlaces

- HuggingFace: https://huggingface.co/limanox/Llama-3.2-3B-prose-style
- Modelo base del fine-tune: https://huggingface.co/unsloth/llama-3.2-3b-unsloth-bnb-4bit
- Llama 3.2 3B oficial: https://huggingface.co/meta-llama/Llama-3.2-3B
- Blog de Llama 3.2: https://huggingface.co/blog/llama32
- GitHub oficial de Llama 3: https://github.com/meta-llama/llama3
- Pagina de modelos Llama: https://dev.meta.ai/llama/models/llama-3
- Ollama (llama3.2:3b): https://ollama.com/library/llama3.2:3b
- Unsloth: https://github.com/unslothai/unsloth
