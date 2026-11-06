# ArchiveStudio/Qwen3-1.7B-Base

## Resumen

Qwen3-1.7B-Base es un modelo de lenguaje causal de tipo denso perteneciente a la familia Qwen3, desarrollada por el equipo Qwen de Alibaba. Se trata de la variante base (solo preentrenada) del modelo de 1.700 millones de parametros, pensada como punto de partida para tareas de generacion de texto y como base para fine-tuning posterior. El repositorio analizado (ArchiveStudio/Qwen3-1.7B-Base) es una redistribucion de los pesos oficiales bajo licencia Apache 2.0.

El modelo emplea una arquitectura transformer con Grouped Query Attention (16 cabezas para Q y 8 para KV), 28 capas y una longitud de contexto de 32.768 tokens. Cuenta con 1.720.574.976 parametros totales segun los pesos en safetensors, de los cuales aproximadamente 1.400 millones son no-embedding. Se entrena sobre un corpus de 36 billones de tokens en 119 idiomas, con un pipeline de preentrenamiento en tres etapas que prioriza conocimiento general, razonamiento (STEM y codigo) y comprension de contexto largo.

Su relevancia actual radica en que ofrece un modelo compacto, con contexto de 32k y licencia permisiva, adecuado para despliegues con recursos limitados, prototipado rapido y experimentacion con tecnicas de post-entrenamiento. Al ser una variante base, no incluye alineamiento por instrucciones ni modo de razonamiento explicito, lo que condiciona sus casos de uso.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal denso con Grouped Query Attention (GQA) |
| Parametros totales | 1.720.574.976 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 32.768 tokens |
| Tipos de cuantizacion | No disponible en la informacion proporcionada |
| Idiomas soportados | 119 idiomas (segun model card de la familia Qwen3) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (libreria transformers) |

## Arquitectura y entrenamiento

Qwen3-1.7B-Base es un transformer causal denso de 28 capas con atencion por grupos (GQA): 16 cabezas para las consultas y 8 para claves/valores, lo que reduce el coste de memoria del KV cache respecto a atencion multi-cabeza completa. Incorpora qk layernorm en todas las capas, una refinacion arquitectonica introducida en Qwen3 para mejorar la estabilidad del entrenamiento. El modelo base tiene 1.400 millones de parametros no-embedding y una ventana de contexto de 32.768 tokens.

El preentrenamiento se realizo sobre 36 billones de tokens en 119 idiomas, con una mezcla que incluye datos de codigo, STEM, razonamiento, libros, multilingue y datos sinteticos. El pipeline consta de tres etapas: la primera orientada a modelado de lenguaje general y adquisicion de conocimiento; la segunda centrada en razonamiento (STEM, codigo y logica); y la tercera en comprension de contexto largo, extendiendo las secuencias de entrenamiento hasta 32k tokens. Los hiperparametros (learning rate, batch size) se ajustaron mediante estudios de scaling law separados para modelos densos y MoE. No se indica en la informacion disponible si hubo fases de RLHF o DPO, algo esperable en una variante base pero no confirmado.

## Capacidades

- Generacion de texto autoregresiva y modelado de lenguaje general.
- Razonamiento en dominios STEM (matematicas, ciencia, logica) reforzado en la segunda etapa de preentrenamiento.
- Generacion y comprension de codigo, con datos de programacion en el corpus.
- Capacidades multilingues en 119 idiomas.
- Comprension de contexto largo hasta 32.768 tokens.
- No incluye modo de pensamiento (thinking mode) ni alineamiento por instrucciones al ser una variante base.
- No se documenta soporte nativo de tool calling ni function calling en la informacion disponible.
- No se documenta soporte de agentes ni razonamiento multi-paso orquestado.
- No se documentan capacidades de vision ni audio.

## Casos de uso

- Fine-tuning supervisado para dominios verticales: al ser un modelo base con licencia Apache 2.0, sirve como punto de partida para adaptar el modelo a tareas especificas (legal, medico, soporte) con datasets propios, aprovechando su tamano manejable de 1,7B parametros.
- Generacion de texto asistida en produccion con recursos limitados: su tamano permite desplegarlo en una sola GPU consumer y usarlo para autocompletado, redaccion o resumen donde no se requiera un modelo de mayor escala.
- Procesamiento de documentos largos: la ventana de 32.768 tokens permite resumir o extraer informacion de contratos, informes o articulos sin truncar el contenido.
- Generacion de codigo en herramientas internas: con datos de codigo en el preentrenamiento, puede usarse como base para un asistente de programacion tras el correspondiente fine-tuning.
- Prototipado de investigacion en NLP: util para experimentar con tecnicas de post-entrenamiento (SFT, DPO, LoRA) sobre una arquitectura moderna y bien documentada.
- Traduccion y procesamiento multilingue: los 119 idiomas del corpus permiten abordar tareas de traduccion o clasificacion multilingue tras ajuste.
- Base para destilacion o experimentos de cuantizacion: su tamano compacto facilita probar pipelines de cuantizacion y despliegue en entornos con VRAM reducida.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card remite al blog oficial de Qwen3 para los resultados de evaluacion detallados, pero no incluye cifras concretas en el repositorio analizado.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16/BF16: aproximadamente 3,4 GB solo para pesos, mas overhead de activaciones y KV cache (el repositorio ocupa 3,4 GB en safetensors).
- VRAM estimada en cuantizacion de 8 bits: en torno a 1,7-2 GB para pesos.
- VRAM estimada en cuantizacion de 4 bits: en torno a 1-1,5 GB para pesos, aunque el tipo de cuantizacion no se documenta en la informacion disponible.
- Cabe en GPUs consumer: RTX 3060, RTX 4060, RTX 4070, RTX 4090 y similares con 8 GB o mas en precision completa; con cuantizacion, en GPUs de 4-6 GB.
- GPUs de datacenter recomendadas para mayor throughput: A100, H100, L40S.
- Opciones de despliegue: transformers (version >= 4.51.0), text-generation-inference (segun tags), vLLM, llama.cpp y Ollama si se generan pesos GGUF (no confirmado en la informacion disponible).
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Qwen3-1.7B-Base | 1,72B | 32.768 | Apache 2.0 | Hugging Face (transformers) |
| Qwen2.5-1.5B | 1,5B (aprox.) | 32.768 (aprox.) | Apache 2.0 | Hugging Face |
| Llama 3.2 1B | 1,24B | 128.000 | Llama 3.2 Community License | Hugging Face |
| Gemma 2 2B | 2,6B | 8.192 | Gemma Terms of Use | Hugging Face |

Los datos de Qwen2.5-1.5B, Llama 3.2 1B y Gemma 2 2B se incluyen como referencia de categoria; no se dispone de comparativas de rendimiento en la informacion proporcionada. No se han publicado resultados de benchmarks comparativos en la informacion disponible.

## Limitaciones y advertencias

- Es un modelo base (solo preentrenado): no sigue instrucciones de forma fiable ni esta alineado para conversacion; requiere fine-tuning o prompting cuidadoso.
- Riesgo de alucinacion inherente a los modelos de lenguaje; sin alineamiento, la probabilidad de generar contenido factualmente incorrecto es mayor.
- Sesgos potenciales derivados del corpus de preentrenamiento (36 billones de tokens de fuentes web y sinteticas), no evaluados en la informacion disponible.
- Aunque declara 119 idiomas, el rendimiento por idioma no esta documentado; el castellano puede tener cobertura desigual.
- Limitacion de contexto a 32.768 tokens; textos mas largos deben truncarse o dividirse.
- Licencia Apache 2.0 permite uso comercial, pero el redistribuidor (ArchiveStudio) no es el autor original; conviene verificar la integridad de los pesos frente al repositorio oficial de Qwen.
- Requiere transformers >= 4.51.0; versiones anteriores fallan con `KeyError: 'qwen3'`.
- El repositorio tiene 0 descargas y 0 likes, lo que sugiere que es una copia no oficial sin validacion de la comunidad.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/ArchiveStudio/Qwen3-1.7B-Base
- Blog oficial de Qwen3: https://qwenlm.github.io/blog/qwen3/
- GitHub de Qwen3: https://github.com/QwenLM/Qwen3
- Documentacion de Qwen: https://qwen.readthedocs.io/en/latest/
- Paper (Qwen3 Technical Report): https://arxiv.org/abs/2505.09388
