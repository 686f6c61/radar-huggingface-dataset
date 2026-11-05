# richardyoung/Qwen2.5-32B-Instruct-ARA-heretic

## Resumen

Qwen2.5-32B-Instruct-ARA-heretic es una variante "descensurada" (decensored o abliterated) del modelo Qwen2.5-32B-Instruct de Alibaba Cloud, publicada por el usuario richardyoung. La modificacion se ha realizado con la herramienta Heretic v2.0.0 aplicando una tecnica denominada Arbitrary-Rank Ablation (ARA), que interviene sobre los pesos del transformer para reducir la tasa de rechazos ante peticiones que el modelo original declinaria. El resultado es un modelo de chat de 32.763.876.352 parametros reales (32.5B nominales) que mantiene la arquitectura y el tokenizador del original.

La relevancia de esta ficha radica en que permite evaluar el modelo en dos dimensiones: por un lado, las capacidades heredadas del Qwen2.5-32B-Instruct (contexto largo de hasta 131.072 tokens, soporte multilingue de mas de 29 idiomas, buenas aptitudes de codigo, matematicas y generacion de JSON estructurado); por otro lado, el efecto concreto de la ablacion ARA, cuantificado por el autor en un descenso de rechazos de 98/100 a 10/100 con una divergencia KL de 0,0620 respecto al original. Es un modelo pensado para experimentacion e investigacion sobre alineamiento y seguridad, no para despliegues comerciales sin evaluacion adicional.

Arquitectura transformer causal con RoPE, SwiGLU, RMSNorm y sesgo en las proyecciones QKV, con atencion de cabezas agrupadas (GQA) de 40 cabezas de consulta y 8 de clave-valor, 64 capas y 31.0B parametros no de embedding. La licencia declarada es Apache 2.0, pero conviene leer con atencion las advertencias de la seccion de limitaciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal con RoPE, SwiGLU, RMSNorm y sesgo QKV (Qwen2) |
| Parametros totales | 32.763.876.352 (32.5B nominales) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 131.072 tokens en entrenamiento; config.json por defecto a 32.768; generacion hasta 8.192 tokens; extension con YaRN |
| Tipos de cuantizacion | No especificado en la informacion disponible; al estar en safetensors FP16/BF16, admite cuantizacion posterior (GPTQ, AWQ, GGUF) mediante herramientas externas no incluidas en el repo |
| Idiomas soportados | La model card del autor declara `en`; el modelo base Qwen2.5 soporta mas de 29 idiomas, entre ellos espanol, chino, frances, portugues, aleman, italiano, ruso, japones, coreano, vietnamita, tailandes y arabe |
| Licencia | Apache 2.0 (con enlace a la licencia del modelo base Qwen2.5-32B-Instruct) |
| Formato de pesos | safetensors; tamano del repo 65,5 GB; libreria transformers; compatible con text-generation-inference y endpoints_compatible |

## Arquitectura y entrenamiento

El modelo es un transformer causal denso de 64 capas con normalizacion RMSNorm, activacion SwiGLU y RoPE como codificacion posicional, siguiendo la arquitectura Qwen2. La atencion usa GQA con 40 cabezas de consulta y 8 de clave-valor, y las proyecciones QKV incorporan sesgo. El modelo base Qwen2.5-32B-Instruct se entreno en dos fases: preentrenamiento sobre un corpus multilingue de gran escala y postentrenamiento con instrucciones. La model card del autor no detalla el numero exacto de tokens ni la composicion del dataset de postentrenamiento; esa informacion corresponde a la documentacion oficial de Qwen, no incluida en la informacion proporcionada.

La innovacion tecnica de esta variante es la ablacion ARA aplicada con Heretic v2.0.0. Segun los parametros publicados, la intervencion opera en el rango de capas 8 a 60 con un peso de preservacion de comportamiento bueno de 0,8200, un peso de direccionamiento del comportamiento malo de 0,0015, un peso relativo de sobrecorreccion de 0,7196 y un vecindario de 11 direcciones. La tecnica proyecta y elimina direcciones de activacion asociadas a rechazos, en lugar de reentrenar. El autor declara que el proceso es reproducible y publica un directorio `reproduce` con instrucciones. El resultado reportado es una reduccion de rechazos de 98/100 a 10/100, con una divergencia KL media de 0,0620 frente al modelo original, lo que indica que la distribucion de salida se mantiene razonablemente cerca de la original en la mayoria de casos.

## Capacidades

- Generacion de texto y conversacion multi-turno con plantilla de chat (`apply_chat_template`) y roles de sistema, usuario y asistente.
- Razonamiento y conocimientos generales heredados del Qwen2.5-32B-Instruct, con mejoras notables en codigo y matematicas segun la documentacion del modelo base.
- Generacion de codigo en multiples lenguajes y comprension de estructuras de datos, ademas de generacion de salidas estructuradas, especialmente JSON.
- Comprension y generacion de textos largos: manejo de entradas de hasta 32.768 tokens sin configuracion adicional y hasta 131.072 tokens con escalado YaRN; generacion de hasta 8.192 tokens.
- Capacidad multilingue segun el modelo base (mas de 29 idiomas); la model card del autor solo declara ingles como idioma oficial del repo.
- Seguimiento de instrucciones y de system prompts diversos, incluyendo escenarios de role-play y condicionamiento de chatbots.
- Tasa de rechazo muy reducida (10/100 frente a 98/100 del original) ante peticiones que el modelo base declinaria, segun la metrica del autor.
- No se documenta soporte nativo de tool calling o function calling en la informacion proporcionada; el modelo base Qwen2.5-Instruct si lo soporta, pero esta variante no lo declara explicitamente.
- No es multimodal: no procesa vision ni audio.

## Casos de uso

- Investigacion sobre alineamiento y seguridad: el modelo permite estudiar el efecto de la ablacion ARA comparando sus respuestas con las del Qwen2.5-32B-Instruct original, usando la divergencia KL y la tasa de rechazos como metricas reproducibles.
- Evaluacion de tecnicas de descensura: util como linea base para comparar Heretic v2.0.0 con otras aproximaciones (abliterated clasico, fine-tuning con DPO, steering vectors) en un modelo de 32B con licencia permisiva.
- Generacion de codigo en entornos controlados: las capacidades de codigo y de salida JSON del modelo base siguen presentes, por lo que puede usarse en pipelines internos de generacion de tests, documentacion o refactorizacion donde la censura no sea un requisito.
- Procesamiento de documentos largos: con la configuracion YaRN adecuada puede resumir, extraer datos o responder preguntas sobre contratos, informes o articulos de hasta 131.072 tokens, util en tareas de analisis documental por lotes.
- Experimentos de role-play y narrativa: la reduccion de rechazos facilita escenarios creativos con contenido adulto o sensible en entornos de investigacion, siempre con las salvaguardas externas que el operador considere.
- Generacion de datos sinteticos para entrenamiento: puede producir respuestas a prompts que el modelo original rechazaria, util para construir datasets de contraste en estudios de robustez y seguridad.
- Atencion al cliente y asistentes conversacionales internos: la ventana de contexto larga y el seguimiento de instrucciones permiten mantener conversaciones multi-turno con historial extenso, aunque la ausencia de censura exige filtros propios en produccion.

## Benchmarks y rendimiento

La model card del autor solo publica dos metricas comparativas frente al modelo original. No se han publicado resultados de benchmarks academicos (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible para esta variante concreta.

| Metrica | Este modelo | Qwen2.5-32B-Instruct original |
|---|---|---|
| Rechazos | 10/100 | 98/100 |
| Divergencia KL | 0,0620 | 0 (por definicion) |

## Requisitos de hardware

- VRAM estimada para inferencia en BF16/FP16: aproximadamente 65,5 GB de pesos mas overhead de activaciones y cache KV; en la practica se necesitan 2 GPU de 48 GB (A6000, L40S) o una H100 de 80 GB para contexto moderado.
- Cuantizacion a 8 bits (INT8): alrededor de 33-35 GB, cabe en una A100 40 GB o en dos RTX 4090 de 24 GB con tensor parallelism.
- Cuantizacion a 4 bits (GPTQ/AWQ/GGUF Q4): alrededor de 18-20 GB, cabe en una RTX 4090 de 24 GB, aunque con contexto largo la cache KV puede superar la VRAM disponible.
- Cache KV: con GQA de 8 cabezas KV y 64 capas, el consumo es moderado, pero a 131.072 tokens sigue siendo exigente; se recomienda cuantizar la cache o limitar el contexto en consumer GPU.
- GPU recomendadas: H100 80 GB para produccion con contexto largo, A100 80 GB o 2x A100 40 GB, 2x L40S 48 GB; para experimentacion, RTX 4090 24 GB con cuantizacion 4 bits.
- Opciones de despliegue: transformers (libreria declarada), text-generation-inference (tag `text-generation-inference`), vLLM (recomendado por Qwen para contexto largo con YaRN estatico), llama.cpp/Ollama mediante conversion a GGUF no incluida en el repo.
- Latencia y throughput: no disponibles en la informacion proporcionada; Qwen publica mediciones de velocidad para el modelo base en su documentacion de benchmarks, consultables alli.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| richardyoung/Qwen2.5-32B-Instruct-ARA-heretic | 32,5B | 131.072 (32.768 por defecto, YaRN) | Apache 2.0 | Variante descensurada con ARA; 10/100 rechazos; KL 0,0620 |
| Qwen/Qwen2.5-32B-Instruct | 32,5B | 131.072 (32.768 por defecto, YaRN) | Apache 2.0 | Modelo base alineado; 98/100 rechazos; referencia de calidad |
| Otras variantes abliterated de Qwen2.5-32B (p. ej. de la comunidad) | 32,5B | Variable | Apache 2.0 habitualmente | No disponibles en la informacion proporcionada; comparacion cualitativa no posible con datos |
| Qwen2.5-72B-Instruct | 72B | 131.072 | Apache 2.0 (Qwen) | Mayor calidad y VRAM; alternativa si el hardware lo permite |

No se dispone de datos de benchmarks comparativos entre esta variante y otros modelos descensurados de la comunidad en la informacion proporcionada.

## Limitaciones y advertencias

- La ablacion ARA modifica el comportamiento de seguridad del modelo: la tasa de rechazo cae drasticamente (10/100), lo que implica que puede generar contenido que el modelo original filtraria. No debe desplegarse en produccion sin filtros de entrada y salida propios y una evaluacion de riesgos.
- La divergencia KL de 0,0620 indica un cambio medible en la distribucion de salida; en tareas sensibles a la precision (hechos, matematicas, codigo de seguridad critica) conviene validar frente al modelo original.
- Riesgo de alucinacion: inherente a los modelos de 32B; la modificacion no lo reduce y podria aumentarlo en dominios donde el rechazo actuaba como barrera ante preguntas mal formuladas.
- Idiomas: la model card declara solo ingles; el multilingueismo del modelo base se conserva en teoria, pero no hay evaluacion publicada de esta variante en otros idiomas, incluido el espanol.
- Restricciones de licencia: la licencia Apache 2.0 se hereda del modelo base, pero el uso comercial de un modelo descensurado puede contravenir politicas de proveedores de servicios en la nube o plataformas de despliegue; verificar los terminos de la plataforma antes de publicarlo.
- Reproducibilidad: el autor declara el proceso reproducible con Heretic v2.0.0 y publica el directorio `reproduce`, pero no se han verificado de forma independiente los resultados de rechazos y KL.
- Sin soporte declarado de tool calling ni function calling especifico en esta variante; si se necesita, usar el modelo base o validar el comportamiento empirically.
- Fecha de creacion del repo: 5 de noviembre de 2026; con 0 descargas y 0 likes en el momento de la consulta, no hay evidencia de uso en produccion ni de validacion por terceros.

## Enlaces

- [Modelo en HuggingFace](https://huggingface.co/richardyoung/Qwen2.5-32B-Instruct-ARA-heretic)
- [Modelo base Qwen/Qwen2.5-32B-Instruct](https://huggingface.co/Qwen/Qwen2.5-32B-Instruct)
- [Licencia del modelo base](https://huggingface.co/Qwen/Qwen2.5-32B-Instruct/blob/main/LICENSE)
- [Heretic project](https://heretic-project.org)
- [Blog de Qwen2.5](https://qwenlm.github.io/blog/qwen2.5/)
- [Repositorio GitHub de Qwen2.5](https://github.com/QwenLM/Qwen2.5)
- [Documentacion de Qwen](https://qwen.readthedocs.io/en/latest/)
- [Documentacion de despliegue con vLLM](https://qwen.readthedocs.io/en/latest/deployment/vllm.html)
- [Benchmarks de velocidad de Qwen](https://qwen.readthedocs.io/en/latest/benchmark/speed_benchmark.html)
- [Paper de YaRN (arXiv:2309.00071)](https://arxiv.org/abs/2309.00071)
- [Paper de Qwen2 (arXiv:2407.10671)](https://arxiv.org/abs/2407.10671)
