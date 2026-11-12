# Creekside/llama-3.2-1B-lambda-a

## Resumen

Creekside/llama-3.2-1B-lambda-a es un fine-tuning del modelo Llama 3.2 1B Instruct de Meta, publicado por el usuario Creekside en Hugging Face. El modelo parte de la version ya instruida y cuantizada en 4 bits de Unsloth (unsloth/Llama-3.2-1B-Instruct-unsloth-bnb-4bit), sobre la que se ha aplicado un ajuste fino supervisado y posteriormente se han exportado los pesos en FP16. Se trata, por tanto, de un modelo derivado de la familia Llama 3.2, con arquitectura transformer decoder-only, 1.235.814.400 parametros y una ventana de contexto heredada del modelo original.

El modelo resuelve el problema de adaptar un LLM pequeno y ligero a un dominio o estilo concreto mediante fine-tuning, manteniendo la licencia Apache 2.0 del modelo base. Su relevancia practica reside en que, con apenas 1,2 mil millones de parametros, puede desplegarse en hardware modesto, incluidas GPU de consumo, y ejecutarse con frameworks de inferencia ligeros. El repositorio ocupa 2,5 GB, lo que corresponde a los pesos en FP16 mas los ficheros auxiliares.

La model card es extremadamente escasa: no documenta el dataset de entrenamiento, los hiperparametros, el numero de tokens vistos ni ninguna evaluacion. Esto limita la trazabilidad del ajuste y obliga a tratar el modelo como un experimento de fine-tuning comunitario, no como un producto listo para produccion. La unica informacion tecnica verificable es la derivada del modelo base Llama 3.2 1B Instruct y de los metadatos del repositorio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Llama 3.2) |
| Parametros totales | 1.235.814.400 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la model card (el modelo base Llama 3.2 1B Instruct soporta 128.000 tokens) |
| Tipos de cuantizacion | Pesos publicados en FP16; el modelo base era bnb-4bit (4 bits) |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only de la familia Llama 3.2, con 1.235.814.400 parametros, disenado por Meta para tareas de generacion de texto e instruccion. El punto de partida declarado es unsloth/Llama-3.2-1B-Instruct-unsloth-bnb-4bit, una version del Llama 3.2 1B Instruct cuantizada a 4 bits mediante bitsandbytes y preparada por Unsloth para entrenamiento eficiente en memoria. Sobre esa base se ha realizado un fine-tuning con Unsloth y la libreria TRL de Hugging Face, segun indica la model card, y posteriormente se han exportado los pesos en FP16 para su publicacion.

No se documentan en la informacion disponible ni el dataset utilizado, ni el numero de tokens de entrenamiento, ni si hubo RLHF, DPO o solo SFT. Tampoco se especifican hiperparametros como learning rate, LoRA rank o numero de epocas. La unica innovacion tecnica mencionada es el uso de Unsloth para acelerar el entrenamiento (la model card afirma "2x faster"), lo que sugiere un ajuste eficiente con LoRA o QLoRA, pero no se confirma. La arquitectura de attention, el tokenizer y la ventana de contexto se heredan del modelo base Llama 3.2 1B Instruct, que emplea GQA (grouped-query attention) y un contexto nativo de 128.000 tokens, aunque la model card no lo reafirma.

## Capacidades

- Generacion de texto conversacional en ingles, heredada del Llama 3.2 1B Instruct.
- Seguimiento de instrucciones basicas y respuestas multi-turno, limitado por el tamano del modelo.
- Razonamiento simple y tareas de comprension de lenguaje natural de baja complejidad.
- Generacion de codigo a nivel basico, sin garantias de calidad comparable a modelos de mayor tamano.
- Capacidades multilingues limitadas: la model card declara unicamente ingles.
- No se documenta soporte de tool calling ni function calling en la informacion disponible.
- No se documenta soporte de agentes, multi-step reasoning ni modo thinking.
- No se documenta capacidad de vision, audio ni multimodalidad.

## Casos de uso

- Clasificacion y etiquetado de texto en ingles: el modelo puede usarse para tareas de clasificacion de baja complejidad (sentimiento, topicos) en pipelines donde un modelo de 1,2B parametros es suficiente y el coste de inferencia debe ser minimo.
- Generacion de respuestas cortas en chatbots de dominio acotado: adecuado para prototipos de asistencia conversacional en ingles donde la latencia importa y el vocabulario es limitado.
- Extraccion de informacion estructurada: dado su tamano, puede emplearse para convertir texto en campos estructurados sencillos en entornos controlados, con validacion posterior.
- Experimentacion academica con fine-tuning: al ser un modelo pequeno y con licencia Apache 2.0, sirve como banco de pruebas para estudiar efectos de ajustes finos y comparar con la base.
- Despliegue en dispositivos con recursos limitados: al caber en GPU de consumo y ejecutarse con llama.cpp u Ollama, puede integrarse en entornos edge o portatiles para demos.
- Generacion de texto auxiliar en pipelines de datos: resumen de frases cortas, reescritura o normalizacion de texto en ingles dentro de procesos batch donde el throughput prima sobre la calidad.
- Base para posteriores fine-tunes: al estar publicado en FP16 y con licencia permisiva, puede servir como punto de partida para nuevos ajustes comunitarios.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16: aproximadamente 2,5 GB solo para pesos, mas overhead de KV cache y activaciones; en la practica se recomienda al menos 4-6 GB para contexto moderado.
- VRAM estimada en cuantizacion 4 bits (GGUF Q4): alrededor de 1 GB para pesos, con 2-3 GB totales recomendados para contexto corto.
- GPU recomendadas: cualquier GPU con 6 GB o mas de VRAM para FP16; RTX 3060, RTX 4060, RTX 4090, A100 y H100 son sobradas. Para 4 bits, incluso GPUs integradas o CPU pueden servir.
- Cabe en GPU de consumo: si, en RTX 3060/4060 y superiores en FP16; en 4 bits cabe en la mayoria de GPU consumer e incluso en CPU.
- Opciones de despliegue: transformers, text-generation-inference (TGI), llama.cpp, Ollama, vLLM (con conversion a GGUF o safetensors), y Unsloth para reentrenamiento.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada; por tamano, se espera un throughput alto en GPU consumer, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Creekside/llama-3.2-1B-lambda-a | 1,24B | no disponible (base: 128k) | Apache 2.0 | Hugging Face | Fine-tune comunitario, sin benchmarks |
| meta-llama/Llama-3.2-1B-Instruct | 1,24B | 128k | Llama 3.2 Community License | Hugging Face, Meta | Modelo base oficial, con evaluaciones publicadas |
| unsloth/Llama-3.2-1B-Instruct-unsloth-bnb-4bit | 1,24B | 128k | Apache 2.0 (derivada) | Hugging Face | Version cuantizada 4-bit del base, optimizada para entrenamiento |
| Qwen/Qwen2.5-1.5B-Instruct | 1,54B | 32k | Apache 2.0 | Hugging Face, Alibaba | Alternativa de tamano similar con benchmarks publicados |

## Limitaciones y advertencias

- Ausencia total de documentacion sobre el dataset de entrenamiento, hiperparametros y evaluacion: imposible auditar el ajuste o reproducirlo.
- Riesgo elevado de alucinacion, inherente a modelos de 1,2B parametros y agravado por la falta de evaluacion.
- Capacidades limitadas a ingles segun la model card; el rendimiento en castellano no esta garantizado ni evaluado.
- Contexto efectivo desconocido: aunque el base soporta 128k tokens, el fine-tuning puede haber degradado el rendimiento en contextos largos, y no hay datos al respecto.
- Licencia Apache 2.0 permisiva para uso comercial, pero el modelo base Llama 3.2 tiene su propia licencia comunitaria; conviene verificar la compatibilidad de la cadena de derivacion antes de un despliegue comercial.
- Modelo con 0 descargas y 1 like en el momento de la ficha: sin validacion comunitaria ni evidencia de uso real.
- Publicado como experimento comunitario; no se recomienda para produccion sin evaluacion propia previa.
- Posible perdida de calidad por el paso de 4 bits a FP16 y por el ajuste fino: no hay comparacion con la base para verificarlo.

## Enlaces

- Hugging Face: https://huggingface.co/Creekside/llama-3.2-1B-lambda-a
- Modelo base (Unsloth): https://huggingface.co/unsloth/Llama-3.2-1B-Instruct-unsloth-bnb-4bit
- Modelo original Llama 3.2 1B Instruct: https://huggingface.co/meta-llama/Llama-3.2-1B-Instruct
- Repositorio Unsloth: https://github.com/unslothai/unsloth
- Libreria TRL de Hugging Face: https://github.com/huggingface/trl
