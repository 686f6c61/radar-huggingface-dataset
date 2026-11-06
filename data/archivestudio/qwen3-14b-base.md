# ArchiveStudio/Qwen3-14B-Base

## Resumen

Qwen3-14B-Base es la variante base (solo preentrenada, sin ajuste por instrucciones ni alineamiento) del modelo denso de 14.800 millones de parametros de la familia Qwen3, desarrollada por el equipo Qwen de Alibaba. Este repositorio concreto, publicado por el usuario ArchiveStudio, redistribuye los pesos originales bajo licencia Apache 2.0. El modelo emplea una arquitectura transformer causal con atención de tipo grouped-query attention (GQA) y está pensado como punto de partida para fine-tuning, no para uso directo en chat.

La relevancia de Qwen3 radica en su corpus de preentrenamiento de 36 billones de tokens en 119 idiomas, el triple de cobertura lingüística que Qwen2.5, con una mezcla reforzada de datos de código, STEM, razonamiento y material sintético. El entrenamiento se organiza en tres etapas: conocimiento general, razonamiento especializado y extensión de contexto hasta 32.768 tokens. Al ser un modelo base, no incorpora RLHF ni DPO, por lo que no responde de forma conversacional sin un ajuste posterior.

Con 14.768.307.200 parámetros reales según los tensores safetensors (13.200 millones sin contar embeddings) y 40 capas, se sitúa en el rango medio de la familia Qwen3, entre las variantes de 8B y 32B, y compite directamente con modelos densos de tamaño similar de otras familias abiertas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal denso con grouped-query attention (GQA), qk layernorm |
| Parametros totales | 14.768.307.200 (14,8B); 13,2B sin embeddings |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 32.768 tokens |
| Tipos de cuantizacion | No disponible en la informacion proporcionada (formato original en safetensors, compatible con cuantizacion estandar via transformers/llama.cpp) |
| Idiomas soportados | 119 idiomas segun la model card de la familia Qwen3; lista concreta no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (repo de 29,5 GB) |

Especificaciones adicionales: 40 capas, 40 cabezas de atencion para Q y 8 para KV (GQA), etapa de entrenamiento exclusivamente de preentrenamiento.

## Arquitectura y entrenamiento

El modelo es un transformer causal denso de 40 capas con GQA (40 cabezas de consulta frente a 8 de clave-valor), lo que reduce el coste de memoria de la cache KV en inferencia. Incorpora qk layernorm en todas las capas, una refinacion arquitectonica introducida en Qwen3 para mejorar la estabilidad del entrenamiento. No es un modelo MoE, por lo que todos los parametros se activan en cada paso.

El preentrenamiento se realizo sobre 36 billones de tokens en 119 idiomas, con una mezcla que incluye datos de codigo, STEM, razonamiento, libros, multilingue y datos sinteticos. El proceso se divide en tres etapas: la primera cubre modelado de lenguaje general y adquisicion de conocimiento; la segunda refuerza razonamiento en STEM, codigo y logica; la tercera extiende la longitud de secuencia hasta 32k tokens para mejorar la comprension de contexto largo. Los hiperparametros (learning rate, batch size) se ajustaron mediante estudios de scaling law separados para modelos densos y MoE. Al tratarse de un modelo base, no se aplicaron fases de RLHF ni DPO.

## Capacidades

- Generacion de texto autoregresiva y modelado de lenguaje general.
- Razonamiento en dominios STEM, matematicas y logica, reforzado en la segunda etapa de preentrenamiento.
- Generacion y comprension de codigo, con presencia destacada de datos de programacion en el corpus.
- Comprension de contexto largo hasta 32.768 tokens.
- Cobertura multilingue amplia (119 idiomas declarados para la familia).
- Capacidad base para tool calling y razonamiento multi-paso, aunque sin ajuste especifico de instrucciones ni plantillas de chat.
- No incluye modo thinking, vision ni audio en esta variante base.
- Al ser un modelo solo preentrenado, no sigue instrucciones de forma fiable sin fine-tuning o ajuste por instrucciones posterior.

## Casos de uso

- Fine-tuning supervisado para dominios verticales: el modelo sirve como base para ajuste con SFT o LoRA en sectores como legal, sanitario o financiero, partiendo de un conocimiento general amplio y 32k de contexto.
- Generacion de codigo tras ajuste: su corpus reforzado en programacion lo hace adecuado como punto de partida para modelos especializados en autocompletado o generacion de funciones dentro de pipelines de desarrollo.
- Modelo de continuacion de texto y completado en herramientas editoriales: util para tareas de prediccion de siguiente token, resumen extractivo o reescritura cuando se ajusta ligeramente.
- Investigacion en scaling laws y evaluacion de preentrenamiento: al ser un checkpoint base de 14,8B con licencia permisiva, es util para estudios academicos de comportamiento de modelos densos de tamano medio.
- Destilacion de conocimiento: puede emplearse como profesor o alumno en pipelines de destilacion hacia modelos mas pequenos, gracias a su tamano manejable y licencia Apache 2.0.
- Base para modelos de razonamiento: partiendo de este checkpoint se pueden aplicar tecnicas de RL o DPO para construir variantes orientadas a tareas de razonamiento matematico o logico.
- Procesamiento de documentos largos tras ajuste: los 32k tokens de contexto permiten tareas de analisis de contratos, informes o articulos extensos una vez adaptado el modelo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card remite al blog oficial de Qwen3 y al informe tecnico (arXiv:2505.09388) para las evaluaciones detalladas, pero no incluye cifras concretas en el repositorio.

## Requisitos de hardware

- VRAM estimada en precision completa (BF16/FP16): aproximadamente 29,5 GB solo para pesos, mas cache KV y activaciones; se recomienda un minimo de 32-40 GB.
- VRAM estimada en cuantizacion de 8 bits: en torno a 15-16 GB.
- VRAM estimada en cuantizacion de 4 bits: en torno a 8-9 GB, con perdida de calidad asociada.
- GPU recomendadas para BF16: A100 40/80 GB, H100, L40S o varias RTX 4090 en paralelo.
- Cabe en GPU de consumo: si, en cuantizacion de 4 bits en RTX 3090/4090 (24 GB) o incluso en GPUs de 12-16 GB con cuantizaciones agresivas; en BF16 requiere multi-GPU o GPU profesional.
- Opciones de despliegue: transformers (version >= 4.51.0, requerida para evitar el error `KeyError: 'qwen3'`), text-generation-inference, vLLM, llama.cpp y Ollama mediante conversion a GGUF.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Qwen3-14B-Base | 14,8B | 32.768 | Apache 2.0 | Modelo base denso, 119 idiomas, tres etapas de preentrenamiento |
| Qwen2.5-14B | 14,7B | 32.768 (base) | Apache 2.0 | Generacion anterior, menor cobertura linguistica y corpus de 18 billones de tokens |
| Llama 3.1 8B | 8B | 128.000 | Llama 3.1 Community License | Menor tamano, contexto mayor, licencia con restricciones de uso |
| Mistral NeMo 12B | 12B | 128.000 | Apache 2.0 | Contexto mayor, tamano intermedio, orientado a multilingue |

Los datos de rendimiento comparativo entre estos modelos no estan disponibles en la informacion proporcionada; las cifras de parametros y contexto de los modelos alternativos corresponden a sus especificaciones publicas conocidas.

## Limitaciones y advertencias

- Modelo exclusivamente preentrenado: no sigue instrucciones ni mantiene conversaciones coherentes sin ajuste posterior; no debe desplegarse directamente como asistente.
- Riesgo de alucinacion y de generar contenido factualmente incorrecto, especialmente en dominios especializados no cubiertos por el corpus.
- Sesgos potenciales heredados del corpus de preentrenamiento web, sin mitigacion mediante RLHF o DPO.
- La lista concreta de idiomas y su calidad relativa por idioma no esta detallada en la informacion disponible.
- Contexto limitado a 32.768 tokens; tareas que requieran ventanas mayores necesitan tecnicas de extension adicionales.
- Repositorio redistribuido por un tercero (ArchiveStudio) con 0 descargas y 0 likes: no es el repositorio oficial de Qwen, por lo que conviene verificar la integridad de los pesos frente al checkpoint original.
- Requiere transformers >= 4.51.0; versiones anteriores fallan al cargar la arquitectura.
- La licencia Apache 2.0 permite uso comercial, pero el usuario debe asumir la responsabilidad sobre el cumplimiento normativo y la evaluacion de riesgos del modelo ajustado.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/ArchiveStudio/Qwen3-14B-Base
- Blog oficial de Qwen3: https://qwenlm.github.io/blog/qwen3/
- Repositorio GitHub de Qwen3: https://github.com/QwenLM/Qwen3
- Documentacion de Qwen: https://qwen.readthedocs.io/en/latest/
- Informe tecnico (arXiv): https://arxiv.org/abs/2505.09388
