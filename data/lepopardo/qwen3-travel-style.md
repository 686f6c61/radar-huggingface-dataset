# Lepopardo/qwen3-travel-style

## Resumen

Qwen3 Travel Style es un ajuste fino (fine-tuning) del modelo Qwen3-4B-Instruct-2507 de Alibaba, desarrollado por el usuario Lepopardo y publicado en Hugging Face. Se trata de un modelo conversacional en castellano especializado en generar respuestas relacionadas con viajes, con especial énfasis en el estilo de escritura, el tono y la expresion natural del lenguaje. El modelo no esta pensado para determinar la veracidad factual de destinos, sino como componente de generacion de lenguaje dentro de un sistema de recomendacion de viajes mas amplio.

El modelo parte de la arquitectura Qwen3 con 4.022.468.096 parametros (aproximadamente 4B) y se ha adaptado mediante QLoRA con cuantizacion 4-bit NF4, un rango LoRA de 16 y 3 epocas de entrenamiento supervisado (SFT). Se distribuye en formato GGUF, con dos variantes: BF16 (referencia de mayor precision) y Q4_K_M (orientada a inferencia local con menor huella de memoria). La licencia es Apache-2.0, heredada del modelo base.

Su relevancia radica en ser un ejemplo de especializacion estilistica de bajo coste sobre un modelo base moderno, orientado a un dominio concreto (viajes en castellano) y empaquetado para despliegue local con llama.cpp. No obstante, el propio autor advierte de que la evaluacion estandarizada y la documentacion del dataset estan pendientes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3 (transformer decoder-only) |
| Parametros totales | 4.022.468.096 (aprox. 4B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 8192 tokens (longitud maxima de secuencia durante el entrenamiento); contexto nativo del modelo base no disponible en la informacion proporcionada |
| Tipos de cuantizacion | BF16 y Q4_K_M (GGUF); entrenamiento con QLoRA 4-bit NF4 y doble cuantizacion |
| Idiomas soportados | Castellano (es) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (BF16 y Q4_K_M); adaptadores QLoRA sobre el modelo base |

## Arquitectura y entrenamiento

El modelo se basa en Qwen3-4B-Instruct-2507, un transformer decoder-only de la familia Qwen3 con aproximadamente 4B parametros. Sobre esta base se aplico un ajuste fino supervisado (SFT) mediante QLoRA, con cuantizacion 4-bit NF4, doble cuantizacion activada y computo en BF16. La configuracion LoRA emplea rango r=16, alpha=32 y dropout de 0.05, con modulos objetivo que cubren las proyecciones de atencion (`q_proj`, `k_proj`, `v_proj`, `o_proj`) y de la MLP (`gate_proj`, `up_proj`, `down_proj`).

El entrenamiento se realizo durante 3 epocas y 84 pasos, con una longitud maxima de secuencia de 8192 tokens. Los datos consisten en ejemplos conversacionales en castellano sobre preferencias de viaje y recomendaciones de destinos, formateados como mensajes conversacionales. El autor indica que los detalles sobre composicion, procedencia y distribucion del dataset estan pendientes de documentacion. No se reporta el uso de RLHF o DPO; el metodo declarado es exclusivamente SFT. La innovacion principal es la especializacion estilistica de bajo coste sobre un modelo base reciente, no una innovacion arquitectonica.

## Capacidades

- Generacion de texto conversacional en castellano con un estilo y tono consistentes orientados a viajes.
- Produccion de recomendaciones de destinos y contenido de viaje en un registro natural.
- Adaptacion del tono y la expresion del contenido generado segun el prompt.
- Integracion como componente de generacion de lenguaje dentro de un sistema RAG externo.
- Conversacion multi-turno (el ejemplo de uso emplea modo conversacional `-cnv` en llama.cpp).
- Soporte de cuantizacion GGUF para inferencia local con llama.cpp.
- Capacidades heredadas del modelo base Qwen3-4B-Instruct-2507 (razonamiento, codigo, tool calling, multilingue) no documentadas ni evaluadas en esta variante; no disponible su grado de conservacion tras el ajuste.

## Casos de uso

- Generacion de respuestas en un sistema de recomendacion de viajes: el modelo actua como capa de redaccion sobre resultados recuperados por un motor RAG, produciendo respuestas naturales en castellano con el tono deseado.
- Asistente conversacional de agencia de viajes: gestiona dialogos multi-turno sobre preferencias del usuario (destinos tranquilos, naturaleza, etc.) y redacta recomendaciones coherentes con el estilo de la marca.
- Generacion de fichas y descripciones de destinos: produce textos descriptivos de lugares con un registro uniforme, utiles para poblar catalogos o webs de contenido.
- Redaccion de itinerarios y sugerencias personalizadas: a partir de los datos aportados por el sistema externo, el modelo compone propuestas de viaje con lenguaje natural.
- Prototipado rapido de asistentes de viaje en local: al distribuirse en GGUF Q4_K_M, permite desplegar un chatbot de viajes en estaciones de trabajo sin GPU de gama alta.
- Experimentacion academica en especializacion estilistica: sirve como caso de estudio de QLoRA sobre Qwen3 para adaptar tono y dominio en castellano con recursos limitados.
- Integracion en backends compatibles con endpoints: la etiqueta `endpoints_compatible` sugiere su uso en servicios de inferencia gestionados, siempre que soporten GGUF.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica explicitamente que no se reportan resultados de evaluacion estandarizados y que la evaluacion futura deberia centrarse en naturalidad conversacional en castellano, consistencia del estilo, coherencia de respuesta y preservacion de caracteristicas tras la cuantizacion.

## Requisitos de hardware

- VRAM/RAM estimada: el repo ocupa 10.5 GB e incluye ambas variantes GGUF. La version BF16 requiere aproximadamente 8 GB solo para los pesos (4B parametros a 2 bytes), mas overhead de contexto; la version Q4_K_M reduce la huella a aproximadamente 2.5-3 GB de pesos.
- GPU recomendadas: para BF16, GPU con 12-16 GB de VRAM (RTX 4080/4090, A10, L4). Para Q4_K_M, GPU consumer de 6-8 GB (RTX 3060, RTX 4060) o incluso CPU con RAM suficiente.
- Cabe en GPU consumer: si, especialmente la variante Q4_K_M en tarjetas de 8 GB o superiores.
- Opciones de despliegue: llama.cpp (documentado por el autor con `llama-cli`), y por formato GGUF es compatible con otros runners basados en llama.cpp como Ollama o servidores `llama-server`. No se documenta soporte para vLLM o TGI en la informacion proporcionada.
- Latencia y throughput: no disponibles. El autor sugiere `--temp 0.7` y `-n 256` en el ejemplo de ejecucion, pero no publica mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Qwen3 Travel Style (este) | ~4B | 8192 (entrenamiento) | Apache-2.0 | GGUF (BF16, Q4_K_M) | Ajuste QLoRA especializado en viajes en castellano; sin benchmarks publicados |
| Qwen/Qwen3-4B-Instruct-2507 (base) | ~4B | no disponible en la informacion | Apache-2.0 | safetensors, GGUF | Modelo base generalista; capacidades e idiomas mas amplios, sin especializacion estilistica |
| Alternativas de viajes en castellano | no disponible | no disponible | no disponible | no disponible | No se dispone de informacion sobre modelos comparables especializados en el mismo dominio |

## Limitaciones y advertencias

- Puede generar informacion inexacta o fabricada sobre destinos, precios, horarios y disponibilidad; no debe tratarse como fuente autoritativa de informacion de viajes.
- No esta disenado para determinar por si mismo la correccion factual ni la relevancia de los destinos; requiere un sistema externo (RAG) para recuperacion y ranking.
- El comportamiento conversacional depende del prompt y de los parametros de generacion.
- La cuantizacion Q4_K_M puede degradar la calidad respecto a la version BF16.
- La evaluacion de la precision en recomendaciones de destinos no ha sido establecida de forma independiente.
- La composicion y procedencia del dataset de entrenamiento no estan documentadas, lo que impide auditar posibles sesgos introducidos por los datos.
- El modelo esta orientado al castellano; su rendimiento en otros idiomas no esta documentado ni evaluado.
- Licencia Apache-2.0 heredada del modelo base; el autor recomienda consultar la licencia del modelo base y verificar que los datos de entrenamiento y componentes adicionales cumplan sus terminos.
- No hay benchmarks publicados, por lo que no es posible comparar su rendimiento de forma objetiva con alternativas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Lepopardo/qwen3-travel-style
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B-Instruct-2507
- llama.cpp: https://github.com/ggml-org/llama.cpp
