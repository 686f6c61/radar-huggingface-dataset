# HarimxChoi/WarpQuant-Qwen3.5-4B-R16E4-Text

## Resumen

WarpQuant-Qwen3.5-4B-R16E4-Text es un modelo de lenguaje cuantizado post-entrenamiento, desarrollado por Harim Choi, que exporta únicamente la parte de texto del checkpoint WarpQuant de Qwen3.5-4B. El modelo aplica una técnica de cuantización dual-domain que combina una transformada de Hadamard con sensibilidad Output-Fisher para reducir el peso de los parámetros a 3.65 bits por peso (bpw) manteniendo una calidad competitiva frente a cuantizaciones estándar como Q4_K_M o IQ3_M. Está diseñado para entornos con restricciones de memoria, ofreciendo un payload analítico de 1.788 GiB frente a los 7.846 GiB del modelo en BF16.

El modelo se basa en la arquitectura Qwen3.5-4B, con 4.205.751.296 parámetros totales, y está disponible bajo licencia Apache 2.0. Soporta inglés y coreano. Su relevancia radica en demostrar que es posible comprimir modelos de 4B a menos de 2 GiB sin degradación severa, lo que habilita su despliegue en GPUs de consumo o incluso en CPU con cuantización adicional. El repositorio incluye los pesos en formato safetensors compatibles con BF16, y requiere la rama principal de Transformers para su carga.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3.5-4B (transformer, basado en Qwen3.5) |
| Parametros totales | 4.205.751.296 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | INT3 (block-GPTQ con Hadamard firmado), INT4 (group-128 para embeddings), BF16 (columnas de recuperacion) |
| Idiomas soportados | en, ko |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (valores cuantizados en formato BF16-compatible) |

## Arquitectura y entrenamiento

El modelo es una version cuantizada de Qwen3.5-4B, un transformer denso de 4.2B parametros. La tecnica de cuantizacion WarpQuant aplica una transformada de Hadamard firmada a los pesos de proyeccion, seguida de una cuantizacion base INT3 mediante block-GPTQ. Posteriormente, un criterio de sensibilidad Output-Fisher selecciona un subconjunto de columnas que se mantienen en BF16 para recuperar la precision perdida. El embedding de tokens se cuantiza con INT4 de grupo 128. El resultado es un modelo con un peso analitico de 3.6514 bpw, que reduce el payload a 1.788 GiB.

No se proporcionan detalles sobre el entrenamiento del modelo base (Qwen3.5-4B), como el numero de tokens o la composicion del dataset. La cuantizacion es post-entrenamiento, por lo que no hay fases de RLHF o DPO adicionales. El autor reporta que el repositorio almacena los valores cuantizados en safetensors compatibles con BF16, y que el payload analitico incluye codigos, escalas, valores de recuperacion e indices de columna.

## Capacidades

- Generacion de texto en ingles y coreano, heredada del modelo base Qwen3.5-4B.
- Razonamiento y comprension del lenguaje, evaluado en tareas como ARC-299 y MMLU-13,943.
- Capacidad de conversacion (etiquetado como "conversational" en los tags).
- No se documentan capacidades especiales como tool calling, agentes, vision o audio en esta version de solo texto.
- La cuantizacion reduce la precision en tareas de lenguaje, pero mantiene un rendimiento cercano al modelo BF16 en las metricas reportadas.

## Casos de uso

- Inferencia en dispositivos edge: con un payload de 1.788 GiB, el modelo puede ejecutarse en GPUs de consumo con 2-4 GB de VRAM, permitiendo asistentes de texto locales en portatiles o mini-PCs.
- Chatbots multilingues: al soportar ingles y coreano, puede integrarse en aplicaciones de atencion al cliente para estos idiomas, con baja latencia gracias a su tamano reducido.
- Generacion de contenido asistida: util para redactar borradores, resumir textos o generar respuestas en entornos con recursos limitados, como servidores de bajo coste.
- Prototipado rapido: al ser un modelo pequeno y cuantizado, es adecuado para experimentar con pipelines de generacion de texto sin necesidad de infraestructura de alto rendimiento.
- Educacion e investigacion: sirve como ejemplo de cuantizacion avanzada (Hadamard + Output-Fisher) para estudiar el equilibrio entre compresion y calidad.
- Despliegue en produccion con restricciones de memoria: en escenarios donde el coste de VRAM es critico, este modelo ofrece una alternativa a modelos de 7B o mas, con un rendimiento aceptable en tareas de lenguaje general.

## Benchmarks y rendimiento

La model card del autor incluye una tabla comparativa entre el modelo WarpQuant y otras cuantizaciones del mismo modelo base. Los datos son los siguientes:

| Formato | Text bpw | Payload | WikiText-2 PPL ↓ | ARC-299 ↑ | MMLU-13,943 ↑ |
|---|---:|---:|---:|---:|---:|
| BF16 | 16.00 | 7.846 GiB | 8.3885 | 45.82 | 39.58 |
| Q4_K_M | 5.13 | 2.523 GiB | 8.5472 | 48.83 | 39.48 |
| IQ3_M | 4.09 | 2.015 GiB | 10.6976 | 42.81 | 37.41 |
| **WarpQuant Fisher R16E4** | **3.6514** | **1.788 GiB** | **9.2494** | **46.15** | **38.13** |

El modelo WarpQuant supera a IQ3_M en perplejidad y ARC-299, y se acerca a Q4_K_M en MMLU, con un payload menor. No se han publicado comparaciones con otros modelos de tamano similar fuera de esta tabla.

## Requisitos de hardware

- VRAM estimada: el payload analitico es de 1.788 GiB, por lo que la inferencia puede caber en GPUs con al menos 2 GB de VRAM, aunque se recomienda 4 GB para margen de operacion.
- GPUs recomendadas: NVIDIA RTX 3060, RTX 4060, GTX 1660 Super o superiores; tambien puede ejecutarse en GPUs de datacenter como A10 o T4.
- Compatible con GPUs de consumo: si, siempre que tengan al menos 4 GB de VRAM.
- Opciones de despliegue: el modelo se carga con Transformers (requiere la rama main). No se menciona compatibilidad explicita con vLLM, llama.cpp u Ollama, pero al ser safetensors podria convertirse a GGUF si se dispone de las herramientas adecuadas.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

No se dispone de datos comparativos con otros modelos de la misma categoria (por ejemplo, Qwen2.5-3B cuantizado, Llama-3.2-3B, o Gemma-2-2B). La unica comparacion publicada es contra las variantes BF16, Q4_K_M e IQ3_M del mismo modelo base, que se muestran en la seccion de benchmarks. Por tanto, la comparativa con alternativas externas no esta disponible.

## Limitaciones y advertencias

- La cuantizacion introduce una perdida de precision respecto al modelo BF16, especialmente en tareas de generacion de texto (perplejidad mayor) y en MMLU (38.13 vs 39.58).
- El modelo solo soporta ingles y coreano; no se garantiza un rendimiento adecuado en otros idiomas.
- No se documentan sesgos especificos, pero al ser un modelo derivado de Qwen3.5, puede heredar sesgos presentes en los datos de entrenamiento del modelo base.
- Riesgo de alucinacion: como cualquier LLM, puede generar informacion falsa o inventada, especialmente en contextos de baja perplejidad.
- Requiere la rama main de Transformers, lo que puede implicar inestabilidad en entornos de produccion que usen versiones estables.
- El repositorio tiene 0 descargas y 0 likes, lo que indica que es un modelo reciente y sin validacion amplia por parte de la comunidad.
- La licencia Apache 2.0 permite uso comercial, pero se recomienda verificar la licencia del modelo base Qwen3.5-4B para evitar conflictos.

## Enlaces

- [HuggingFace - WarpQuant-Qwen3.5-4B-R16E4-Text](https://huggingface.co/HarimxChoi/WarpQuant-Qwen3.5-4B-R16E4-Text)
- [Technical report](https://harimxchoi.github.io/projects/warpquant/)
- [GitHub - WarpQuant](https://github.com/HarimxChoi/WarpQuant)
- [Modelo VLM asociado](https://huggingface.co/HarimxChoi/WarpQuant-Qwen3.5-4B-R16E4V4)
