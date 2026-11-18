# hhjuyh/Qwen3.8-35B-A3B-Hierophant-Aggressive

## Resumen

Qwen3.8-35B-A3B-Hierophant-Aggressive es una variante cuantizada en formato GGUF del modelo Empero Qwen3.8-35B-A3B-Distill, que a su vez deriva del Qwen3.6-35B-A3B de Alibaba. La modificacion principal, denominada Hierophant 1.5, consiste en la aplicacion de un adaptador de rango 1 a escala 1.5 sobre el GGUF Q6_K original, con el objetivo de reducir el comportamiento de rechazo (refusal) del modelo. El merge afecto a 121 tensores y preservo el formato de los 753 tensores del modelo original.

El modelo tiene 35.505.251.456 parametros totales y sigue una arquitectura Mixture of Experts (MoE) con 3B de parametros activos por token, segun se deduce de la nomenclatura A3B. Esta pensado para ejecucion local mediante llama.cpp o LM Studio, con soporte de entrada de imagen y texto gracias al proyector de vision F16 incluido.

Es relevante porque ofrece una alternativa abliterada (con rechazos reducidos) de un modelo de 35B en cuantizaciones manejables (Q4_K_M de 21,71 GB), lo que permite desplegarlo en hardware de consumo alto o estaciones de trabajo. El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica que es un artefacto muy reciente y sin validacion comunitaria.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture of Experts (MoE) transformer, derivada de Qwen3.6-35B-A3B |
| Parametros totales | 35.505.251.456 |
| Parametros activos | 3B (deducido de la nomenclatura A3B) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q6_K, Q4_K_M; proyector de vision F16 |
| Idiomas soportados | en (ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp) |

## Arquitectura y entrenamiento

La arquitectura subyacente es un transformer con mezcla de expertos (MoE) del linaje Qwen3.6-35B-A3B, con 35.505 millones de parametros totales y aproximadamente 3.000 millones activos por token. El modelo original fue destilado por Empero (Qwen3.8-35B-A3B-Distill) y posteriormente cuantizado a GGUF. Sobre esa base, el autor hhjuyh aplico el adaptador Hierophant 1.5 de rango 1 con escala 1.5, una tecnica de abliteracion que modifica direcciones en el espacio de activaciones para atenuar la tendencia al rechazo. El merge toco 121 tensores de los 753 totales, manteniendo intactos los formatos del resto.

No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni si hubo fases de RLHF o DPO en el modelo destilado. La innovacion tecnica destacable es precisamente el procedimiento Hierophant de abliteracion aplicado a escala 1.5, que segun el autor puede provocar que el modelo responda a peticiones que la version upstream declinaria. Se incluye un proyector de vision F16 (0,90 GB) que habilita la entrada de imagenes en llama.cpp.

## Capacidades

- Generacion de texto conversacional en ingles.
- Entrada multimodal imagen-texto mediante el proyector F16 incluido (lectura de titulos en imagenes verificada por el autor en llama.cpp).
- Razonamiento y respuesta a instrucciones heredados del modelo base Qwen3.6-35B-A3B.
- Comportamiento de rechazo reducido gracias a la abliteracion Hierophant 1.5.
- Compatibilidad con endpoints (tag `endpoints_compatible`) y con llama.cpp / LM Studio.
- Soporte de tool calling y function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y multi-step reasoning: no disponible en la informacion proporcionada.
- Capacidades multilingues: limitadas a ingles segun la model card.
- Thinking mode, audio u otras capacidades especiales: no disponible en la informacion proporcionada.

## Casos de uso

- Despliegue local en estaciones de trabajo: la cuantizacion Q4_K_M (21,71 GB) permite ejecutar un modelo MoE de 35B en GPUs con 24 GB de VRAM mediante offloading parcial en llama.cpp o LM Studio.
- Procesamiento de documentos con imagenes: el proyector F16 permite extraer texto de capturas, titulos o imagenes escaneadas junto con consultas en lenguaje natural, integrable en pipelines de digitalizacion.
- Generacion de contenido sin filtros excesivos: la abliteracion reduce rechazos en tareas creativas o de redaccion donde el modelo upstream podria declinar, util para investigacion sobre comportamiento de modelos.
- Experimentacion en investigacion de alineacion: permite comparar el comportamiento del modelo abliterado frente al original para estudiar como la modificacion de direcciones afecta a la distribucion de respuestas.
- Asistente conversacional offline: al ejecutarse en local con llama.cpp, sirve para prototipos de chat sin dependencia de APIs externas ni envio de datos a terceros.
- Base para fine-tuning o cuantizaciones adicionales: al estar en GGUF y bajo Apache 2.0, se puede reutilizar y adaptar en flujos de trabajo con llama.cpp.
- Evaluacion de robustez multimodal: util para probar la calidad del proyector de vision F16 en tareas de image-text-to-text en entornos controlados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: aproximadamente 22 GB para Q4_K_M y 30 GB para Q6_K, mas 1 GB adicional para el proyector de vision F16.
- GPU recomendadas: A100 40/80 GB, H100, RTX 4090 (24 GB, valida para Q4_K_M con ajuste de capas), RTX 3090 (24 GB).
- Cabe en GPU de consumo: si, en RTX 4090 o RTX 3090 con Q4_K_M; Q6_K requiere offloading a RAM del sistema o GPUs de mayor capacidad.
- Opciones de despliegue: llama.cpp, LM Studio; compatibilidad con vLLM, TGI u Ollama no confirmada en la informacion disponible.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Qwen3.8-35B-A3B-Hierophant-Aggressive | 35,5B (3B activos) | no disponible | Apache 2.0 | GGUF | Abliterado, vision F16 |
| empero-ai/Qwen3.8-35B-A3B-Distill-GGUF | 35,5B (3B activos) | no disponible | Apache 2.0 | GGUF | Base sin abliterar |
| Qwen/Qwen3.6-35B-A3B | 35,5B (3B activos) | no disponible | Apache 2.0 | safetensors | Modelo original de Qwen |

## Limitaciones y advertencias

- La abliteracion reduce rechazos, lo que puede aumentar la probabilidad de respuestas a solicitudes que el modelo original declinaria; requiere filtros externos en produccion.
- Riesgo de alucinacion inherente al modelo base; no se han publicado evaluaciones especificas de esta variante.
- Solo soporta ingles segun la model card; el rendimiento en castellano no esta garantizado.
- Longitud de contexto no documentada; no asumir ventanas largas sin verificacion.
- Repositorio sin descargas ni likes: no hay validacion comunitaria ni informes de calidad independientes.
- El procedimiento de merge (escala 1.5, 121 tensores) puede degradar capacidades del modelo original; solo se verifico una prueba basica de texto e imagen.
- Licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantias sobre el comportamiento del modelo abliterado.
- La fecha de creacion (2026-11-17) y el linaje Qwen3.8 sugieren un artefacto experimental; conviene auditar antes de usarlo en produccion.

## Enlaces

- Hugging Face: https://huggingface.co/hhjuyh/Qwen3.8-35B-A3B-Hierophant-Aggressive
- Modelo base (GGUF): https://huggingface.co/empero-ai/Qwen3.8-35B-A3B-Distill-GGUF
- Modelo destilado: https://huggingface.co/empero-ai/Qwen3.8-35B-A3B-Distill
- Modelo original Qwen: https://huggingface.co/Qwen/Qwen3.6-35B-A3B
- Proyecto Hierophant: https://github.com/khimaros/hierophant
