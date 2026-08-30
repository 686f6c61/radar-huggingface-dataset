# liodon-ai/Qwen2.5-Coder-1.5B-Instruct-FP8

## Resumen

El modelo `liodon-ai/Qwen2.5-Coder-1.5B-Instruct-FP8` es una cuantización en FP8 (precisión de 8 bits en coma flotante) del modelo original `Qwen/Qwen2.5-Coder-1.5B-Instruct`, publicada por Liodon AI. Esta versión reduce el tamaño del modelo de 3,1 GB a 1,8 GB, lo que facilita su despliegue en entornos con recursos limitados, manteniendo la calidad del modelo base gracias a un esquema de cuantización dinámica que no requiere dataset de calibración.

La cuantización utiliza el esquema `FP8_DYNAMIC` de la librería `llm-compressor`: los pesos se convierten a FP8 (formato E4M3) por canal de forma estática, mientras que las activaciones se cuantizan dinámicamente por token durante la inferencia. El `lm_head` se deja sin cuantizar para preservar la calidad de la salida. El modelo base pertenece a la familia Qwen2.5-Coder, una serie de modelos de código de código abierto desarrollada por Alibaba Cloud, con arquitectura transformer decoder-only y 1.543.714.304 parámetros en total.

Esta versión FP8 está pensada para desarrolladores que necesitan ejecutar un modelo de generación de código de tamaño reducido en GPUs modernas (compute capability ≥ 8.9) con soporte nativo para FP8, aprovechando las ventajas de velocidad y memoria que ofrece esta precisión. Es compatible con los principales motores de inferencia como vLLM, TGI y SGLang.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Qwen2.5) |
| Parametros totales | 1.543.714.304 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | FP8 (E4M3) dinamico, pesos por canal, activaciones por token |
| Idiomas soportados | no disponible |
| Licencia | other (segun model card) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

Este modelo no ha sido entrenado desde cero, sino que es una cuantizacion del modelo `Qwen/Qwen2.5-Coder-1.5B-Instruct`. La cuantizacion se realizo con `llm-compressor` utilizando el esquema `FP8_DYNAMIC`: los pesos se convierten a FP8 (E4M3) por canal de forma estatica, mientras que las activaciones se cuantizan dinamicamente por token durante la inferencia. No se emplea dataset de calibracion, por lo que los pesos cuantizados son numericamente equivalentes a una conversion directa de los originales, sin sesgo introducido por datos de calibracion. El `lm_head` se mantiene sin cuantizar, una practica estandar para preservar la calidad de las predicciones.

El modelo base, Qwen2.5-Coder-1.5B-Instruct, fue desarrollado por Alibaba Cloud y forma parte de la serie Qwen2.5-Coder, que incluye variantes de 1.5B, 7B, 14B y 32B parametros. Esta serie se entreno con un corpus extenso de codigo y texto, y la version Instruct se ajusto mediante instrucciones para mejorar su capacidad de seguir comandos y generar respuestas utiles. No se dispone de detalles especificos sobre el dataset de entrenamiento del modelo base en la informacion proporcionada.

## Capacidades

- Generacion de texto y codigo: el modelo base Qwen2.5-Coder-1.5B-Instruct esta disenado para tareas de programacion, incluyendo generacion de funciones, completado de codigo y explicacion de fragmentos.
- Razonamiento y conversacion: al ser una version Instruct, es capaz de mantener dialogos multi-turno y responder a preguntas sobre codigo.
- Soporte de tool calling: el modelo base incluye capacidades de llamada a funciones (function calling), aunque no se detallan en la model card de esta cuantizacion.
- Multilingue: el modelo base soporta varios idiomas, pero no se especifican cuales en la informacion disponible.
- Compatibilidad con motores de inferencia: funciona con vLLM, TGI y SGLang, lo que facilita su integracion en entornos de produccion.

## Casos de uso

- Autocompletado de codigo en editores: el modelo puede integrarse en plugins de IDE para sugerir funciones o fragmentos de codigo en tiempo real, gracias a su tamano reducido (1.8 GB) que permite ejecucion local en estaciones de trabajo con GPU moderada.
- Asistente de programacion en entornos con recursos limitados: en configuraciones edge o con GPUs de gama media, este modelo ofrece respuestas de calidad aceptable para tareas de codigo sin necesidad de infraestructura pesada.
- Integracion en pipelines de CI/CD: mediante vLLM o TGI, puede desplegarse como servicio de generacion de codigo para automatizar la creacion de tests, documentacion o refactorizacion en repositorios.
- Chatbots de soporte tecnico especializados en programacion: al ser una version Instruct, puede utilizarse para responder consultas sobre APIs, sintaxis o depuracion en un entorno controlado.
- Prototipado rapido de aplicaciones de generacion de codigo: por su bajo coste de inferencia, es adecuado para experimentar con arquitecturas de agentes que requieren multiples llamadas al modelo.
- Educacion y aprendizaje: puede servir como herramienta de generacion de ejemplos de codigo o explicaciones para estudiantes de programacion, ejecutable en hardware asequible.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El modelo base Qwen2.5-Coder-1.5B-Instruct tiene resultados publicados en el informe tecnico de Qwen2.5-Coder (arXiv:2409.12186), pero no se dispone de datos especificos para esta variante cuantizada.

## Requisitos de hardware

- VRAM estimada: aproximadamente 2 GB (1,8 GB de pesos FP8 mas overhead de ejecucion), aunque el valor exacto depende del motor de inferencia y la configuracion.
- GPU recomendadas: NVIDIA con compute capability ≥ 8.9 (Ada, Hopper o Blackwell), como RTX 4090, L4, L40S, H100, H200, B100, B200 o GB10, para ejecucion FP8 nativa.
- En GPUs mas antiguas (compute capability < 8.9), vLLM y TGI des-cuantizan los pesos a FP16/BF16, perdiendo las ventajas de velocidad y memoria.
- Opciones de despliegue: vLLM, Text Generation Inference (TGI) y SGLang, con comandos de inicio directos documentados en la model card.
- Latencia y throughput: no disponibles en la informacion proporcionada; dependen del hardware y del motor utilizado.

## Comparativa con modelos similares

| Modelo | Parametros | Tamano del repo | Licencia | Formato | Contexto |
|---|---|---|---|---|---|
| liodon-ai/Qwen2.5-Coder-1.5B-Instruct-FP8 | 1,54B | 1,8 GB | other | FP8 safetensors | no disponible |
| Qwen/Qwen2.5-Coder-1.5B-Instruct (base) | 1,54B | 3,1 GB | Apache 2.0 (segun el modelo base) | FP16/BF16 | no disponible |
| liodon-ai/Qwen2.5-Coder-7B-Instruct-FP8 (otra cuantizacion) | 7B | no disponible | other | FP8 safetensors | no disponible |

La comparativa se limita a aspectos de tamano y formato, ya que no se dispone de datos de rendimiento para ninguna de las versiones en la informacion proporcionada.

## Limitaciones y advertencias

- La licencia se indica como "other" en la model card, aunque el modelo base Qwen2.5-Coder-1.5B-Instruct se distribuye bajo Apache 2.0. Es necesario verificar los terminos exactos antes de usar el modelo en entornos comerciales.
- La cuantizacion FP8 requiere hardware NVIDIA con compute capability ≥ 8.9 para obtener todos los beneficios; en GPUs antiguas se pierde eficiencia.
- Al ser una cuantizacion sin calibracion, podria existir una ligera degradacion en tareas muy sensibles a la precision, aunque el esquema dinamico minimiza este efecto.
- El modelo base puede presentar sesgos o alucinaciones en codigo generado, por lo que se recomienda revision humana en aplicaciones criticas.
- No se dispone de informacion sobre la longitud de contexto soportada en esta variante; se debe consultar la documentacion del modelo base.
- Los idiomas soportados no estan especificados en la model card, aunque el modelo base es multilingue.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/liodon-ai/Qwen2.5-Coder-1.5B-Instruct-FP8
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-Coder-1.5B-Instruct
- Informe tecnico Qwen2.5-Coder (arXiv): https://arxiv.org/html/2409.12186v2
- Repositorio llm-compressor: https://github.com/vllm-project/llm-compressor
- Repositorio oficial de la serie Qwen2.5-Coder (GitHub): https://github.com/huggingface/Qwen2.5-Coder
