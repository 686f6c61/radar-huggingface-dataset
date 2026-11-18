# ReliquaryForge/qwen3-4b-base-dapo-v4

## Resumen

Qwen3-4B-Base es un modelo de lenguaje causal de tipo denso con 4.022 millones de parametros desarrollado por el equipo Qwen de Alibaba. Se trata del modelo base (pretraining, sin ajuste por instrucciones) de la familia Qwen3, publicado bajo licencia Apache 2.0. El repositorio `ReliquaryForge/qwen3-4b-base-dapo-v4` redistribuye estos pesos base, presumiblemente con algun proceso de ajuste posterior no documentado en la model card (el sufijo "dapo" sugiere DAPO, un algoritmo de optimizacion de politicas, aunque no hay confirmacion en la informacion disponible).

La relevancia del modelo radica en su ventana de contexto de 32.768 tokens, su entrenamiento sobre 36 billones de tokens en 119 idiomas y una arquitectura transformer con Grouped Query Attention (32 cabezas de consulta y 8 de clave-valor). Con 3.600 millones de parametros no pertenecientes a embeddings y 36 capas, es un modelo de tamano medio apto para despliegue en hardware de consumo.

Al ser un modelo base, no incorpora alineamiento por RLHF ni modo de razonamiento explicito; esta pensado como punto de partida para fine-tuning o para tareas de continuacion de texto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal denso con Grouped Query Attention (GQA) y qk layernorm |
| Parametros totales | 4.022.468.096 (4,0B) |
| Parametros activos | No aplica (modelo denso) |
| Parametros no-embedding | 3,6B |
| Longitud de contexto | 32.768 tokens |
| Tipos de cuantizacion | No disponible (el repo solo contiene safetensors en precision completa; no se listan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | 119 idiomas segun la model card de Qwen3 (lista concreta no disponible) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (transformers) |
| Capas | 36 |
| Cabezas de atencion | 32 Q / 8 KV (GQA) |
| Tamano del repo | 8,1 GB |
| Libreria | transformers (>= 4.51.0) |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura transformer causal densa de la familia Qwen3, con 36 capas, atencion por grupos (GQA) con 32 cabezas de consulta y 8 de clave-valor, y normalizacion qk layernorm aplicada en todas las capas para mejorar la estabilidad del entrenamiento. El preentrenamiento se realizo en tres fases: la primera orientada a modelado general del lenguaje y adquisicion de conocimiento; la segunda centrada en razonamiento STEM, codigo y logica; y la tercera en comprension de contexto largo, extendiendo las secuencias de entrenamiento hasta 32.000 tokens. El corpus total asciende a 36 billones de tokens en 119 idiomas, con mezcla de datos de codigo, STEM, razonamiento, libros, multilingue y datos sinteticos.

Los hiperparametros (learning rate, batch size) se ajustaron mediante estudios de scaling law especificos para modelos densos y MoE. La model card no documenta el proceso de ajuste que da lugar al sufijo "dapo-v4" del repositorio; no hay informacion disponible sobre si se aplico DAPO, RLHF, DPO u otra tecnica de optimizacion posterior al preentrenamiento.

## Capacidades

- Generacion de texto y continuacion de secuencias (modelo base, sin alineamiento conversacional garantizado).
- Razonamiento logico, matematico y STEM, reforzado en la segunda fase de preentrenamiento.
- Generacion de codigo en multiples lenguajes de programacion.
- Comprension multilingue en 119 idiomas.
- Procesamiento de contexto largo de hasta 32.768 tokens.
- Capacidad de servir como base para fine-tuning supervisado y ajuste por preferencias.
- No se documenta soporte nativo de tool calling ni function calling (es un modelo base).
- No se documenta modo de razonamiento explicito (thinking mode) ni capacidades de vision o audio.
- No se documenta soporte de agentes ni razonamiento multi-paso nativo.

## Casos de uso

- Fine-tuning supervisado para dominios verticales: al ser un modelo base de 4B, es viable ajustarlo con SFT sobre datasets especializados (legal, medico, financiero) en una sola GPU de 24 GB con cuantizacion o tecnicas de PEFT/LoRA.
- Generacion de codigo asistida: el modelo puede completar funciones y traducir entre lenguajes; su contexto de 32k permite incluir varios archivos como referencia en la ventana.
- Clasificacion y etiquetado de texto a gran escala: con 4B parametros y licencia Apache 2.0, es adecuado para pipelines de anotacion masiva o moderacion de contenido en produccion sin coste de licencia.
- Investigacion en alineamiento: sirve como punto de partida para experimentar con DPO, DAPO u otras tecnicas de optimizacion de politicas, dado que parte de pesos base sin alinear.
- Procesamiento de documentos largos: informes, contratos o articulos de hasta 32k tokens pueden procesarse en una sola pasada para resumen o extraccion de entidades.
- Despliegue en hardware de consumo: con cuantizacion a 4 bits (aproximadamente 2,5-3 GB), puede ejecutarse en GPUs consumer como RTX 3060 o superiores para prototipado local.
- Traduccion automatica multilingue: la cobertura de 119 idiomas permite construir sistemas de traduccion para pares linguisticos de bajos recursos.
- Generacion de datos sinteticos: util como modelo generador en pipelines de destilacion o aumentacion de datos para entrenar modelos menores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks especificos para este repositorio en la informacion disponible. La model card remite al blog oficial de Qwen3 para las evaluaciones detalladas del modelo base, pero no incluye cifras concretas en el texto proporcionado.

## Requisitos de hardware

- VRAM estimada en FP16/BF16: aproximadamente 8-9 GB (4,0B parametros x 2 bytes + overhead de activaciones y cache KV).
- VRAM estimada en cuantizacion 8 bits: aproximadamente 4,5-5 GB.
- VRAM estimada en cuantizacion 4 bits: aproximadamente 2,5-3,5 GB.
- GPU recomendadas para FP16: A100 40GB, H100, L40S, RTX 4090 (24 GB) con margen amplio.
- GPU consumer: cabe en RTX 4090, RTX 4080, RTX 3090, RTX 4070 Ti y, con cuantizacion 4 bits, en RTX 3060 12 GB o GPUs con 8 GB.
- Opciones de despliegue: transformers (nativo, requiere >= 4.51.0), text-generation-inference (TGI, etiquetado en el repo), vLLM, llama.cpp/Ollama (previa conversion a GGUF, no incluida en el repo).
- Latencia y throughput: no disponibles en la informacion proporcionada; dependen del hardware y del backend.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Qwen3-4B-Base (este repo) | 4,0B | 32.768 | Apache 2.0 | safetensors | Modelo base, 119 idiomas |
| Qwen2.5-3B | 3,1B | 32.768 | Apache 2.0 | safetensors, GGUF | Generacion anterior, 29 idiomas |
| Llama 3.2 3B | 3,2B | 131.072 | Llama 3.2 Community License | safetensors, GGUF | Mayor contexto, licencia restrictiva |
| Phi-3.5-mini | 3,8B | 131.072 | MIT | safetensors, GGUF | Enfocado en razonamiento, contexto largo |

Los datos de rendimiento comparativo no estan disponibles en la informacion proporcionada; la comparativa se limita a parametros, contexto y licencia.

## Limitaciones y advertencias

- Modelo base sin alineamiento: no esta ajustado para seguir instrucciones ni para conversacion; puede generar contenido inapropiado, repetitivo o divagante si se usa directamente como asistente.
- Riesgo de alucinacion: como todo modelo de lenguaje preentrenado, puede generar afirmaciones factualmente incorrectas con aparente seguridad.
- Sesgos: el corpus de 36 billones de tokens puede contener sesgos de genero, raza, cultura y religion; no se documenta ningun proceso de mitigacion en este repositorio.
- El sufijo "dapo-v4" no esta documentado en la model card; se desconoce que ajuste se aplico sobre los pesos base de Qwen3, lo que introduce incertidumbre sobre el comportamiento real del modelo.
- No se dispone de informacion sobre el proceso de creacion del repositorio por parte de `ReliquaryForge`, un tercero no oficial; se recomienda verificar la integridad de los pesos antes de usarlos en produccion.
- Licencia Apache 2.0 permite uso comercial, pero conviene revisar las condiciones de los pesos originales de Qwen3 y de los datos de entrenamiento subyacentes.
- Cobertura de idiomas declarada de 119, pero sin evaluacion publica por idioma en este repositorio; el rendimiento en idiomas de bajos recursos puede ser desigual.
- Contexto de 32.768 tokens: aunque suficiente para muchas tareas, es inferior al de competidores como Llama 3.2 3B o Phi-3.5-mini (131k).
- Requiere transformers >= 4.51.0; versiones anteriores fallan con `KeyError: 'qwen3'`.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/ReliquaryForge/qwen3-4b-base-dapo-v4
- Blog oficial de Qwen3: https://qwenlm.github.io/blog/qwen3/
- Repositorio GitHub de Qwen3: https://github.com/QwenLM/Qwen3
- Documentacion de Qwen: https://qwen.readthedocs.io/en/latest/
- Paper tecnico (arXiv 2505.09388): https://arxiv.org/abs/2505.09388
