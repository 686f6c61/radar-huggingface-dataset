# aisingapore/Qwen-SEA-LION-v5-27B

## Resumen

Qwen-SEA-LION-v5-27B es un modelo de lenguaje multimodal desarrollado por AI Singapore (AI Products Pillar), financiado por el National Research Foundation de Singapur, como parte de la familia SEA-LION (*Southeast Asian Languages In One Network*). Se trata de un ajuste fino (post-entrenamiento) del modelo Qwen/Qwen3.8-27B de Alibaba, del que hereda arquitectura, tokenizador, codificador visual y plantilla de chat sin modificaciones. El objetivo es dotar a las lenguas del sudeste asiático de un modelo de gran tamano con capacidades multilingues reales y comprension nativa de imagen y video.

El modelo cuenta con 27.781.427.952 parametros (aproximadamente 27,8 mil millones) y una ventana de contexto nativa de 262.144 tokens, extensible hasta cerca de 1 millon mediante YaRN. Acepta entradas de texto, imagen y video, y genera salida de texto. Incorpora modo de razonamiento (*thinking*) activado por defecto, con control por peticion para desactivarlo, ajustar la profundidad de razonamiento mediante `reasoning_effort` y preservar el razonamiento previo en el contexto con `preserve_thinking`.

Su relevancia actual radica en dos factores: por un lado, cubre nueve idiomas (birmano, chino, ingles, indonesio, filipino, malayo, tamil, tailandes y vietnamita) con un modelo de escala media-alta bajo licencia MIT, lo que facilita el uso comercial; por otro, incluye prediccion multi-token (MTP) nativa para decodificacion especulativa, lo que reduce la latencia en despliegues de produccion. El repositorio ocupa 55,6 GB y se distribuye en formatos BF16, FP8, INT4 y GGUF.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal multimodal con codificador visual (familia Qwen3.8), heredada de Qwen/Qwen3.8-27B |
| Parametros totales | 27.781.427.952 (aprox. 27,8 B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 262.144 tokens nativos; extensible a ~1M con YaRN |
| Tipos de cuantizacion | BF16 (original), FP8, INT4 y GGUF (llama.cpp) en repositorios separados |
| Idiomas soportados | Birmano (my), chino (zh), ingles (en), indonesio (id), filipino (fil), malayo (ms), tamil (ta), tailandes (th), vietnamita (vi) |
| Licencia | MIT |
| Formato de pesos | safetensors (transformers); variantes GGUF para llama.cpp |
| Modalidades de entrada | Texto, imagen y video |
| Modalidad de salida | Texto |
| Modelo base | Qwen/Qwen3.8-27B |
| Dataset de ajuste | aisingapore/SEA-Instruct-2602 |
| Tamano del repositorio | 55,6 GB |

## Arquitectura y entrenamiento

La arquitectura es la de Qwen3.8-27B sin cambios: un transformer causal denso con codificador visual integrado, tokenizador propio y plantilla de chat heredados. AI Singapore realizo un post-entrenamiento sobre el modelo base en ingles y lenguas del sudeste asiatico, usando el dataset aisingapore/SEA-Instruct-2602. No se especifica en la informacion disponible el numero exacto de tokens de entrenamiento, la composicion detallada del dataset ni si se emplearon tecnicas de RLHF o DPO durante el ajuste.

Entre las innovaciones tecnicas destacables que hereda del modelo base figuran: prediccion multi-token (MTP) nativa, que habilita decodificacion especulativa con un modelo borrador dedicado (aisingapore/Qwen-SEA-LION-v5-27B-SpecDecoder); modo de razonamiento configurable por peticion, con parametros `enable_thinking`, `reasoning_effort` y `preserve_thinking`; y extension de contexto mediante YaRN. El modelo esta pensado para tareas agente de horizonte largo, con planificacion autonoma y manejo de retroalimentacion del entorno.

## Capacidades

- Generacion de texto y razonamiento en modo *thinking* activado por defecto, con control para desactivarlo o modular su profundidad.
- Comprension nativa de imagenes: diagramas STEM, documentos escaneados, graficos y capturas.
- Comprension de video, incluidos videos de hasta una hora de duracion.
- Generacion de codigo y tareas de trabajo profesional (documentos, analisis, investigacion).
- Soporte de tool calling / function calling, con parsers dedicados en vLLM (`qwen3_coder` para llamadas a herramientas, `qwen3` para razonamiento).
- Capacidades agente: planificacion autonoma, razonamiento multi-paso y manejo de retroalimentacion del entorno para completar tareas de extremo a extremo.
- Multilingueismo en nueve idiomas, con enfasis en lenguas del sudeste asiatico (birmano, indonesio, filipino, malayo, tamil, tailandes, vietnamita) ademas de ingles y chino.
- Contexto largo de 262.144 tokens, ampliable a ~1M con YaRN.
- Decodificacion especulativa mediante modelo borrador (SpecDecoder) y MTP nativo.
- Integracion con arneses y herramientas de desarrollo populares.

## Casos de uso

- Atencion al cliente multilingue en el sudeste asiatico: el modelo puede gestionar conversaciones multi-turno en indonesio, malayo, tailandes, vietnamita, filipino o birmano con una ventana de 262.144 tokens, lo que permite mantener historial extenso y documentacion de referencia en el mismo contexto sin truncar.
- Tramitacion documental con vision: procesamiento de facturas, conocimientos de embarque, declaraciones aduaneras o formularios escaneados en lenguas locales, extrayendo datos estructurados gracias al codificador visual y al contexto largo para lotes de documentos.
- Analisis de video para supervision industrial o logistica: el modelo acepta videos de hasta una hora, lo que permite resumir grabaciones de almacen o revision de procesos y generar informes en texto.
- Asistencia a desarrolladores en la region: generacion de codigo y explicaciones tecnicas en ingles e idiomas locales, con soporte de tool calling para integrarse en pipelines de CI/CD o asistentes de IDE mediante vLLM con `--enable-auto-tool-choice`.
- Agentes autonomos de investigacion: tareas de horizonte largo que requieren planificacion, llamadas a herramientas externas y sintesis de resultados, apoyadas en el modo thinking y en la preservacion del razonamiento previo entre pasos.
- Traduccion y localizacion de contenido: traduccion entre ingles, chino y las siete lenguas del sudeste asiatico soportadas, con contexto suficiente para mantener coherencia terminologica en documentos largos.
- Analisis de documentos tecnicos con diagramas: interpretacion de figuras STEM, planos o esquemas junto con el texto circundante, util en educacion tecnica e ingenieria.
- Despliegue en infraestructura limitada: las variantes INT4 y GGUF permiten ejecutar el modelo en entornos con menos VRAM o mediante llama.cpp/Ollama para prototipos y pruebas locales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada en BF16: aproximadamente 56 GB solo para pesos, mas overhead de activaciones y cache KV; se recomienda un minimo de 80 GB para contexto moderado.
- VRAM estimada en FP8: alrededor de 28-30 GB para pesos; viable en una A100 40 GB o H100 con margen para cache KV.
- VRAM estimada en INT4: aproximadamente 14-16 GB para pesos; permite ejecucion en GPUs de consumo alto.
- GPUs recomendadas: H100 80 GB o A100 80 GB para BF16 con contexto largo; A100 40 GB o L40S para FP8; RTX 4090 (24 GB) viable en INT4 o GGUF cuantizado con contexto reducido.
- Cabe en GPU de consumo: si, en cuantizacion INT4 o GGUF (RTX 4090, RTX 3090 de 24 GB); en BF16 no cabe en GPUs de consumo.
- Opciones de despliegue: Transformers (`AutoModelForImageTextToText`), vLLM (con `--reasoning-parser qwen3`, `--enable-auto-tool-choice` y `--tool-call-parser qwen3_coder`), SGLang, llama.cpp mediante la variante GGUF, y el modelo borrador SpecDecoder para decodificacion especulativa.
- Latencia y throughput: no disponibles en la informacion proporcionada; la decodificacion especulativa con MTP y el SpecDecoder estan disenados para reducir la latencia de generacion.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Modalidad | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen-SEA-LION-v5-27B | ~27,8 B | 262.144 (ext. ~1M con YaRN) | Texto, imagen, video | MIT | Hugging Face (BF16, FP8, INT4, GGUF) |
| Qwen/Qwen3.8-27B (base) | ~27 B | 262.144 | Texto, imagen, video | no disponible en la informacion | Hugging Face |
| Alternativas de la misma categoria | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone en la informacion proporcionada de datos de rendimiento comparativo (benchmarks) frente a otros modelos, por lo que la comparacion se limita a parametros, contexto, modalidad, licencia y disponibilidad.

## Limitaciones y advertencias

- Riesgo de alucinacion inherente a los modelos de lenguaje de esta escala; no se documentan tasas especificas en la informacion disponible.
- Sesgos potenciales derivados de los datos de preentrenamiento del modelo base y del dataset de ajuste SEA-Instruct-2602; no se detalla la composicion del dataset ni las medidas de mitigacion aplicadas.
- El modo thinking esta activado por defecto y puede generar varios miles de tokens de razonamiento antes de la respuesta; es necesario ajustar `max_new_tokens` (Qwen recomienda 32.768 para la mayoria de consultas) para evitar truncamientos.
- Aunque el contexto nativo es de 262.144 tokens, la extension a ~1M mediante YaRN puede degradar la calidad; no se documentan evaluaciones de rendimiento en esa configuracion.
- La cobertura linguistica se limita a los nueve idiomas declarados; el rendimiento en otras lenguas no esta garantizado ni documentado.
- La licencia MIT permite uso comercial sin restricciones de atribucion mas alla de la propia licencia, pero no se especifican terminos adicionales de responsabilidad sobre el modelo base.
- No se publican resultados de benchmarks en la informacion disponible, lo que dificulta validar afirmaciones de rendimiento antes de desplegar en produccion.
- El modelo es multimodal de entrada (imagen y video); no genera imagenes ni audio.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/aisingapore/Qwen-SEA-LION-v5-27B
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Coleccion SEA-LION v5: https://huggingface.co/collections/aisingapore/sea-lion-v5
- Variante FP8: https://huggingface.co/aisingapore/Qwen-SEA-LION-v5-27B-FP8
- Variante INT4: https://huggingface.co/aisingapore/Qwen-SEA-LION-v5-27B-INT4
- Variante GGUF (llama.cpp): https://huggingface.co/aisingapore/Qwen-SEA-LION-v5-27B-GGUF
- Modelo borrador para decodificacion especulativa: https://huggingface.co/aisingapore/Qwen-SEA-LION-v5-27B-SpecDecoder
- Dataset de ajuste: https://huggingface.co/datasets/aisingapore/SEA-Instruct-2602
- Sitio del proyecto SEA-LION: https://sea-lion.ai
- Licencia MIT: https://mit-license.org/
