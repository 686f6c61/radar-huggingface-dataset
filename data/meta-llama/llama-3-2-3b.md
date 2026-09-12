# meta-llama/Llama-3.2-3B

## Resumen

Llama 3.2-3B es un modelo de lenguaje de tipo transformer decoder-only desarrollado por Meta, publicado el 25 de septiembre de 2024 como parte de la familia Llama 3.2. Es la variante de 3.212.749.824 parametros (segun los pesos safetensors del repositorio), disenada para despliegue en el borde y en hardware de consumo, con una ventana de contexto de 128.000 tokens y soporte oficial para ocho idiomas (ingles, aleman, frances, italiano, portugues, hindi, espanol y tailandes).

El modelo resuelve el problema de disponer de un LLM multilingue con tool calling y contexto largo que quepa en una unica GPU de gama media o incluso en CPU. Meta lo construyo podando y destilando los modelos Llama 3.1 8B y 70B, de modo que hereda parte del comportamiento de modelos mucho mayores con una huella de memoria muy inferior.

Su relevancia actual radica en que es uno de los pocos modelos de ~3B con licencia permisiva para uso comercial, contexto de 128k tokens y pesos abiertos. La contrapartida es que el acceso al repositorio de HuggingFace esta restringido (gated) y requiere aceptar la licencia Llama 3.2 Community License antes de descargar los pesos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only con Grouped-Query Attention (GQA) y RoPE |
| Parametros totales | 3.212.749.824 (dato del repositorio de safetensors) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | 128.000 tokens |
| Tipos de cuantizacion | BF16 original; cuantizaciones de comunidad en GGUF (Q2_K a Q8_0), AWQ, GPTQ y bitsandbytes de 8 y 4 bits |
| Idiomas soportados | en, de, fr, it, pt, hi, es, th (8 idiomas declarados en la model card) |
| Licencia | Llama 3.2 Community License |
| Formato de pesos | safetensors (PyTorch), repositorio de 12,9 GB; existen conversiones GGUF y de cuantizacion de terceros |
| Acceso | Restringido (gated): requiere aceptar la licencia en HuggingFace |
| Fecha de publicacion | 18 de septiembre de 2024 (actualizado el 24 de octubre de 2024) |
| Ventana de conocimiento | diciembre de 2023 |
| Libreria de referencia | transformers |

## Arquitectura y entrenamiento

Se trata de un transformer autoregresivo decoder-only con atencion de consultas agrupadas (GQA), una decision que reduce de forma notable el tamano de la cache KV frente a la atencion multi-cabeza clasica y que resulta critica para sostener contextos de 128.000 tokens en hardware limitado. El vocabulario es de 128.256 entradas y el modelo usa normalizacion RMSNorm y funciones de activacion SwiGLU, siguiendo el diseno de la familia Llama 3.

El entrenamiento siguio la receta de Llama 3.2: los pesos se obtuvieron mediante poda estructurada de los modelos Llama 3.1 8B y 70B seguida de una fase de destilacion de conocimiento (logits del modelo mayor) y de entrenamiento sobre hasta 9 billones de tokens de datos, con una etapa posterior de ajuste supervisado y optimizacion por preferencias humanas (RLHF/DPO) para alineacion. No se dispone de la composicion exacta del dataset ni del desglose de mezcla de idiomas en la informacion proporcionada.

## Capacidades

- Generacion de texto y conversacion multi-turno con ventana de 128.000 tokens.
- Razonamiento basico de tipo chain-of-thought y respuesta a instrucciones.
- Generacion y explicacion de codigo, con cobertura de lenguajes mayoritarios, aunque con menor fiabilidad que modelos de mayor tamano.
- Matematicas de complejidad media; los calculos largos suelen requerir apoyo de herramientas externas.
- Tool calling y function calling nativos, con formato de plantilla de chat especifico de Llama 3.2.
- Soporte para flujos de agente y razonamiento multi-paso, incluida la integracion con busquedas y APIs.
- Capacidades multilingues en los 8 idiomas declarados, con "refuerzo" adicional en tool calling segun Meta.
- Sin capacidades de vision ni de audio: las entradas multimodales solo estan disponibles en los modelos Llama 3.2 de 11B y 90B.
- Sin modo de razonamiento explicito (no hay "thinking mode" separado como en otros modelos).

## Casos de uso

- Atencion al cliente automatizada: permite mantener conversaciones multi-turno con el historial completo dentro de la misma ventana de 128.000 tokens, sin necesidad de resumir el contexto, y desplegarse on-premise para no enviar datos de clientes a terceros.
- Generacion de codigo en produccion: puede integrarse en el editor y en pipelines de CI/CD via tool calling para autocompletar funciones, redactar pruebas unitarias y revisar diffs, con un coste de inferencia muy inferior al de modelos de 70B.
- RAG sobre documentacion corporativa: sus 128k tokens de contexto permiten inyectar decenas de fragmentos recuperados en un solo prompt y generar respuestas con citas, reduciendo el numero de llamadas al retriever.
- Extraccion de informacion estructurada: conversion de facturas, correos o informes a JSON mediante function calling, con validacion posterior del esquema en el pipeline.
- Traduccion y localizacion: traduccion entre los ocho idiomas soportados, incluido espanol, aleman, frances, italiano y portugues, con calidad suficiente para prelocalizacion y revision humana posterior.
- Agentes de automatizacion de tareas: orquestacion de llamadas a APIs internas mediante tool calling en flujos de varios pasos, aprovechando que el modelo cabe en una sola GPU para despliegues con muchos agentes concurrentes.
- Resumen de reuniones y documentos largos: transcripciones completas de varias horas pueden procesarse sin trocear el texto gracias al contexto extendido.
- Moderacion y filtrado de contenido: clasificacion de mensajes entrantes como primera capa de guardrail, con un coste por token bajo que permite ejecutarlo en tiempo real sobre todo el trafico.
- Ajuste fino especifico de dominio: entrenamiento con LoRA o QLoRA sobre una unica GPU de 16-24 GB para sectores como legal, sanidad o soporte tecnico.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- Pesos en BF16: aproximadamente 6,4 GB (3,21B parametros x 2 bytes), mas overhead del runtime, lo que situa el consumo tipico en 8-10 GB de VRAM.
- Cuantizacion de 8 bits: en torno a 3,2-4 GB de pesos; cuantizacion de 4 bits: aproximadamente 2 GB.
- GGUF Q4_K_M: alrededor de 2 GB de fichero; Q8_0: en torno a 3,4 GB.
- La cache KV crece de forma proporcional a la longitud de contexto; en ventanas cercanas a los 128.000 tokens el consumo adicional puede superar el de los propios pesos, por lo que conviene evaluar el caso de uso real antes de fijar el contexto.
- GPU recomendadas: RTX 3060 12 GB, RTX 4060 Ti 16 GB y RTX 4090 para inferencia individual; L4, A10G, A100 y H100 para servicio con batching.
- Cabe en GPU de consumo: si, en cualquier tarjeta con 8 GB o mas usando cuantizacion de 4 u 8 bits, y en CPU con llama.cpp con 8-16 GB de RAM del sistema.
- Opciones de despliegue: Transformers, vLLM, Text Generation Inference (TGI), SGLang, llama.cpp, Ollama, LM Studio, TensorRT-LLM y despliegue gestionado en Amazon SageMaker (el repositorio esta marcado como compatible con endpoints).
- Latencia y throughput estimados: no disponible en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Rendimiento |
|---|---|---|---|---|---|
| Llama 3.2-3B | 3,21B | 128.000 tokens | Llama 3.2 Community License | Pesos abiertos con acceso restringido en HF | No disponible |
| Qwen2.5-3B | 3,09B | 32.768 tokens (ampliable a 128k con YaRN) | Apache 2.0 | Pesos abiertos de descarga libre | No disponible |
| Gemma 2 2B | 2,6B | 8.192 tokens | Gemma Terms of Use | Pesos abiertos con acceso aceptado | No disponible |
| Phi-3.5-mini-instruct | 3,8B | 128.000 tokens | MIT | Pesos abiertos de descarga libre | No disponible |

Nota: los datos de los modelos comparados proceden de sus respectivas model cards publicas y conviene verificarlos antes de tomar una decision de adopcion. No se dispone de resultados de benchmarks comparativos en la informacion proporcionada.

## Limitaciones y advertencias

- Riesgo de alucinacion elevado: al ser un modelo de ~3B, la tasa de afirmaciones incorrectas es notablemente superior a la de modelos de 8B, 70B o 405B.
- Sesgos: el modelo se entrena con datos mayoritariamente web en ingles, por lo que reproduce estereotipos y sesgos de genero, raza, religion y nacionalidad presentes en esas fuentes.
- Idiomas: solo ocho idiomas estan oficialmente soportados. Meta advierte de que el rendimiento y las garantias de seguridad pueden degradarse en idiomas distintos del ingles y de los declarados, y que el propio proceso de alineacion puede no generalizar a todos ellos.
- Contexto: aunque la ventana es de 128.000 tokens, la calidad de recuperacion de informacion decae en posiciones centrales del contexto (fenomeno "lost in the middle") en todos los modelos de la familia.
- Licencia: la Llama 3.2 Community License permite uso comercial, pero exige mostrar la atribucion "Built with Llama", nombrar los modelos derivados con el prefijo "Llama" y respetar la Acceptable Use Policy. Si el producto supera los 700 millones de usuarios mensuales se necesita una licencia comercial adicional de Meta.
- Restricciones de entrenamiento: la licencia prohibe usar los pesos o las salidas del modelo para mejorar otros modelos de lenguaje distintos de la propia familia Llama.
- Acceso restringido: el repositorio es gated, lo que obliga a aceptar la licencia con una cuenta de HuggingFace e introducir un token con permisos de descarga en cualquier pipeline automatizado.
- Multimodalidad ausente: no acepta imagenes ni audio, pese a compartir familia con los modelos 11B y 90B que si lo hacen.
- Fine-tuning: el modelo esta pensado para uso con instrucciones y para despliegue en el borde; Meta recomienda el modelo de 1B cuando el ajuste fino y la cuantizacion agresiva son prioritarios.
- Corte de conocimiento en diciembre de 2023: no conoce eventos posteriores sin herramientas externas de recuperacion.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/meta-llama/Llama-3.2-3B
- Articulo referenciado en la model card (The Llama 3 Herd of Models): https://arxiv.org/abs/2405.16406
- Articulo referenciado en la model card: https://arxiv.org/abs/2204.05149
- Asistente de Meta (resultado de busqueda, no especifico del modelo): https://www.meta.ai/
- Informacion corporativa de Meta (resultado de busqueda, no especifico del modelo): https://www.meta.com/about/
