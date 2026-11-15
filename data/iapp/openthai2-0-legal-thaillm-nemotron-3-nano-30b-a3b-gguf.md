# iapp/openthai2.0-legal-thaillm-nemotron-3-nano-30b-a3b-GGUF

## Resumen

OpenThai 2.0 Legal 30B-A3B es un modelo de lenguaje especializado en derecho tailandes, publicado en formato GGUF por iApp en colaboracion con AIEAT dentro del proyecto OpenThai (anteriormente OpenThaiGPT). Su proposito es recuperar y citar legislacion tailandesa de forma estructurada: devuelve el nombre exacto de la ley y el numero de seccion (มาตรา) en JSON, lo que lo convierte en una pieza pensada para integrarse en sistemas de generacion aumentada por recuperacion (RAG) sobre textos legales oficiales.

El modelo parte de la base NVIDIA Nemotron-3-Nano-30B-A3B y ha sido ajustado para el dominio juridico tailandes. Es un Mixture-of-Experts (MoE) con aproximadamente 31.600 millones de parametros totales y unos 3000 millones activos por token, lo que permite ejecutar un modelo de escala 30B en hardware de gama consumer alta. La arquitectura es hibrida Mamba2-Transformer, segun indica la model card.

Esta publicacion concreta es la conversion oficial a GGUF del modelo base de iApp, e incluye tres cuantizaciones (Q4_K_M, Q5_K_M y Q8_0) compatibles con llama.cpp y Ollama. Es relevante ahora porque ofrece una via practica de desplegar un LLM juridico especializado en una unica GPU de 24 GB, con licencia NVIDIA Open Model Agreement y soporte de tailandes e ingles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Hibrida Mamba2-Transformer con Mixture-of-Experts (base NVIDIA Nemotron-3-Nano-30B-A3B) |
| Parametros totales | 31.577.940.288 (~31,6B) |
| Parametros activos | ~3B por token (segun model card) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q4_K_M (~18 GB), Q5_K_M (~21 GB), Q8_0 (~32 GB) |
| Idiomas soportados | Tailandes (th), ingles (en) |
| Licencia | NVIDIA Open Model Agreement (license: other) |
| Formato de pesos | GGUF (safetensors en el modelo base) |

## Arquitectura y entrenamiento

El modelo se construye sobre NVIDIA Nemotron-3-Nano-30B-A3B, una arquitectura hibrida que combina capas Mamba2 con capas Transformer y un esquema Mixture-of-Experts. Con ~31,6B parametros totales y ~3B activos por token, el coste computacional por token se aproxima al de un modelo denso de 3B, mientras que la capacidad representacional se acerca a la de un 30B. La model card advierte que, por esta arquitectura hibrida, es necesario usar una build reciente de llama.cpp.

El ajuste esta orientado al dominio juridico tailandes: el modelo recuerda estatutos y devuelve citas estructuradas en JSON con el nombre de la ley y la seccion. La model card enfatiza el uso con recuperacion (open-book): la precision de citacion en modo open-book es de 0,99 frente a 0,07-0,40 en modo memoria pura, lo que indica que el entrenamiento no elimina la necesidad de RAG. No se detallan en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO.

## Capacidades

- Generacion de texto en tailandes e ingles con enfasis en dominio juridico.
- Recuperacion y citacion de legislacion tailandesa con nombre de ley y numero de seccion (มาตรา).
- Salida estructurada en JSON para integracion en pipelines y sistemas de gestion documental.
- Razonamiento sobre textos legales en escenarios open-book (con contexto recuperado).
- Uso conversacional multi-turno (tag `conversational`).
- Compatibilidad con llama.cpp y Ollama mediante plantilla de chat embebida en el GGUF.
- Compatibilidad con endpoints (tag `endpoints_compatible`).
- No se documentan en la informacion disponible capacidades de vision, audio, tool calling explicito ni modo de razonamiento extendido.

## Casos de uso

- Asistencia juridica con RAG: combinar el modelo con OpenThaiRAG o un indice propio sobre textos oficiales de estatutos para que devuelva citas verificables (ley y seccion) en JSON; la model card reporta 0,99 de precision de citacion en modo open-book.
- Clasificacion y extraccion documental: procesar contratos o escritos en tailandes y extraer referencias normativas estructuradas para alimentar bases de datos juridicas.
- Busqueda legal aumentada: usar las citas generadas como claves para enlazar consultas de usuario con articulos concretos del corpus normativo.
- Atencion al ciudadano: desplegar un asistente que responda dudas sobre normativa tailandesa citando la seccion aplicable, con verificacion humana posterior.
- Soporte a despachos y departamentos juridicos: generar borradores de analisis con referencias normativas que el abogado valida contra el texto vigente.
- Despliegue en hardware modesto: con Q4_K_M (~18 GB) cabe en una GPU de 24 GB, lo que permite montar un servicio interno de consulta legal sin infraestructura de centro de datos.
- Prototipado e investigacion: evaluar tecnicas de RAG juridico multilingue (th/en) con un modelo abierto y cuantizado.

## Benchmarks y rendimiento

La informacion disponible solo reporta la metrica de precision de citacion en modo open-book frente a memoria pura:

| Metrica | Open-book (con recuperacion) | Memoria pura |
|---|---|---|
| Precision de citacion | 0,99 | 0,07-0,40 |

No se han publicado resultados de benchmarks en la informacion disponible (MMLU, HumanEval, GSM8K u otros).

## Requisitos de hardware

- VRAM estimada: ~18 GB con Q4_K_M, ~21 GB con Q5_K_M, ~32 GB con Q8_0.
- GPU recomendadas: una RTX 4090 (24 GB) es suficiente para Q4_K_M y Q5_K_M; para Q8_0 se requiere una GPU de 32 GB o superior (A100 40 GB, H100, etc.).
- Cabe en GPU consumer: si, en tarjetas de 24 GB con Q4_K_M (recomendado por el autor) y Q5_K_M.
- Opciones de despliegue: llama.cpp (build reciente por la arquitectura hibrida Mamba2-Transformer), Ollama (`ollama run hf.co/iapp/...:Q4_K_M`) y cualquier runtime compatible con GGUF y la arquitectura Nemotron-3-Nano.
- Parametros de muestreo recomendados: temperature=0.3, top_p=0.9.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

No se dispone en la informacion proporcionada de datos de rendimiento ni de especificaciones de modelos alternativos comparables (por ejemplo, otros LLM juridicos tailandeses o modelos MoE de tamano similar) que permitan una comparacion cuantitativa fiable.

| Modelo | Parametros | Contexto | Licencia | Formato |
|---|---|---|---|---|
| OpenThai 2.0 Legal 30B-A3B (GGUF) | ~31,6B totales / ~3B activos | no disponible | NVIDIA Open Model Agreement | GGUF |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Las salidas son soporte a la decision, no asesoramiento juridico; debe verificarse cada cita contra el texto vigente del estatuto.
- La tarea mas dificil, segun la model card, es distinguir la seccion aplicable de otra muy proxima (near-miss rejection), y afecta a todos los modelos probados, incluido este.
- Sin recuperacion, la precision de citacion cae drasticamente (0,07-0,40), por lo que el uso en produccion debe ir acompanado de RAG.
- Riesgo de alucinacion en referencias normativas si no se valida contra fuentes oficiales.
- Cobertura limitada a tailandes e ingles; no se documentan otros idiomas.
- La licencia NVIDIA Open Model Agreement impone condiciones especificas para uso comercial; debe revisarse antes de desplegar en produccion.
- Requiere builds recientes de llama.cpp por la arquitectura hibrida Mamba2-Transformer; versiones antiguas pueden no cargar el modelo.
- No se documentan en la informacion disponible la longitud de contexto soportada ni sesgos especificos medidos.

## Enlaces

- Modelo GGUF en Hugging Face: https://huggingface.co/iapp/openthai2.0-legal-thaillm-nemotron-3-nano-30b-a3b-GGUF
- Modelo base: https://huggingface.co/iapp/openthai2.0-legal-thaillm-nemotron-3-nano-30b-a3b
- Sitio web de OpenThai: https://openthai.aieat.or.th
- Anuncio del modelo: https://openthai.aieat.or.th/openthai2p0-legal
- Demo en vivo: https://iapp.co.th/openmodels/openthai2p0-legal
- Discord: https://discord.gg/7KDdKkBGUs
- OpenThaiRAG (repositorio): https://github.com/OpenThaiGPT/openthairag
- Licencia NVIDIA Open Model Agreement: https://www.nvidia.com/en-us/agreements/enterprise-software/nvidia-open-model-agreement/
