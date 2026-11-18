# abenzerps/Nanbeige4.3-33B-GSQ-RCO-GGUF

## Resumen

Nanbeige4.3-33B-GSQ-RCO-GGUF es una distribución de cuantizaciones GGUF de precisión mixta del modelo base Nanbeige/Nanbeige4.3-33B, publicada por el usuario abenzerps. El modelo base es un transformer denso de 33.118.977.024 parámetros (aproximadamente 33,1 mil millones) desarrollado por el equipo de Nanbeige, orientado a generación de texto conversacional y razonamiento, con soporte para inglés y chino. Esta versión GGUF traslada el modelo a formatos ejecutables en llama.cpp y Ollama, lo que permite inferencia local en hardware de consumo.

La relevancia de esta ficha radica en que el repositorio ofrece siete niveles de cuantización (desde IQ2_XXS de 2,40 bpw y 9,9 GB hasta Q5_K_M de 5,75 bpw y 23,8 GB), con una variante recomendada IQ2_M de 3,05 bpw y 12,7 GB. Según la model card, es posible ejecutar contexto de 65k tokens con caché KV cuantizada en 4 bits dentro de menos de 12 GB de VRAM total, lo que sitúa a un modelo de 33B al alcance de GPUs consumer de 12 GB como la RTX 3060 o la RTX 4070.

El repositorio acumula 27.004 descargas y 47 likes, con licencia Apache-2.0 heredada del modelo base. La información disponible sobre arquitectura interna, datos de entrenamiento y benchmarks del modelo original es limitada en la documentación proporcionada; esta ficha lo indica explícitamente donde corresponde.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | transformer denso (detalles internos no disponibles) |
| Parametros totales | 33.118.977.024 (33,1B) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | hasta 65.536 tokens segun configuracion de llama.cpp con KV cache q4_0; la model card usa 16k y 32k en ejemplos estandar |
| Tipos de cuantizacion | GGUF: IQ2_XXS (2,40 bpw), IQ2_XS (2,65 bpw), IQ2_M (3,05 bpw), IQ3_XS (3,60 bpw), IQ3_M (3,90 bpw), IQ4_XS (4,50 bpw), Q5_K_M (5,75 bpw) |
| Idiomas soportados | en, zh |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (llama.cpp), compatible con Ollama |

## Arquitectura y entrenamiento

La informacion proporcionada no detalla la arquitectura interna del modelo base Nanbeige4.3-33B mas alla de su naturaleza de transformer de 33,1 mil millones de parametros. No se dispone de datos sobre numero de capas, dimensiones ocultas, mecanismo de atencion (si emplea atencion lineal, GQA o MHA), ni sobre el regimen de entrenamiento: numero de tokens, composicion del dataset, uso de RLHF, DPO u otras tecnicas de alineacion. Tampoco se documenta si el modelo incorpora modos especiales como decodificacion especulativa o razonamiento explicito.

La innovacion tecnica documentada en este repositorio no reside en el modelo base, sino en el proceso de cuantizacion. La nomenclatura GSQ-RCO hace referencia a un esquema de cuantizacion de precision mixta con optimizacion por imatrix (el tag `imatrix` aparece en el repositorio), que asigna distintos niveles de bits por capa o tensor en funcion de su sensibilidad, en lugar de aplicar una tasa uniforme. El resultado son ficheros que preservan mas fidelidad que una cuantizacion uniforme del mismo tamano. La model card incluye una imagen de benchmark comparativo, pero los valores numericos no estan disponibles en el texto extraido.

## Capacidades

- Generacion de texto conversacional multi-turno en ingles y chino.
- Razonamiento y respuesta a instrucciones, segun la orientacion del modelo base y las etiquetas `reasoning` y `conversational` del repositorio.
- Ejecucion local en llama.cpp mediante `llama-cli` y `llama-server` con API compatible con OpenAI.
- Despliegue en Ollama mediante el identificador `hf.co/abenzerps/Nanbeige4.3-33B-GSQ-RCO-GGUF:IQ2_M`.
- Soporte de contexto largo: hasta 65.536 tokens con KV cache cuantizada en 4 bits segun la model card.
- Compatibilidad con endpoints (tag `endpoints_compatible`).
- No se documenta soporte de tool calling, function calling, agentes, vision, audio ni modo thinking explicito en la informacion disponible.

## Casos de uso

- Asistente conversacional local en ingles o chino: el modelo puede mantener dialogos multi-turno en `llama-server` con contexto de 16k a 32k tokens, adecuado para chatbots de escritorio o asistentes personales que no deben enviar datos a la nube.
- Procesamiento de documentos largos en hardware consumer: con la variante IQ2_XXS y KV cache q4_0, se pueden analizar documentos de hasta 65k tokens en una GPU de 12 GB, util para resumen y extraccion de informacion de contratos, informes o articulos extensos.
- Despliegue en estaciones de trabajo sin GPU dedicada de gama alta: la variante IQ2_M de 12,7 GB permite ejecutar un modelo de 33B en GPUs de 16 GB (RTX 4060 Ti, RTX 4080) con margen para contexto moderado.
- Prototipado y evaluacion de modelos grandes: investigadores pueden comparar el comportamiento de un 33B cuantizado frente a modelos menores sin necesidad de infraestructura de centro de datos, gracias a los siete niveles de cuantizacion disponibles.
- Traduccion y generacion bilingue ingles-chino: el soporte nativo de ambos idiomas lo hace util para pipelines de localizacion o generacion de contenido en mercados chinos y angloparlantes.
- Integracion en aplicaciones con API compatible con OpenAI: `llama-server` expone un endpoint compatible que permite sustituir llamadas a APIs comerciales por inferencia local en herramientas que ya usan el formato OpenAI.
- Experimentacion con cuantizacion de precision mixta: el esquema GSQ-RCO sirve como referencia para estudiar el impacto de la cuantizacion por capas en la calidad de un modelo de 33B.

## Benchmarks y rendimiento

La model card incluye una imagen de benchmark (`assets/benchmark.png`) comparando el modelo, pero los valores numericos no estan disponibles en el texto proporcionado. No se han publicado resultados numericos de benchmarks (MMLU, HumanEval, GSM8K u otros) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada segun cuantizacion (solo pesos): 9,9 GB (IQ2_XXS), 10,9 GB (IQ2_XS), 12,7 GB (IQ2_M), 14,8 GB (IQ3_XS), 16,1 GB (IQ3_M), 18,7 GB (IQ4_XS), 23,8 GB (Q5_K_M). A esta cifra hay que sumar la memoria de la cache KV y los buffers de computo.
- Contexto largo de bajo VRAM: la model card afirma que 65k de contexto con `-ctk q4_0 -ctv q4_0` cabe en menos de 12 GB totales en GPUs consumer de 12 GB (RTX 3060 12GB, RTX 4070).
- GPUs recomendadas: RTX 3060 12GB y RTX 4070 para IQ2_XXS/IQ2_M con contexto extendido; RTX 4060 Ti 16GB, RTX 4080 y RTX 4090 para IQ3/IQ4 con contexto mayor; A100 y H100 para Q5_K_M con contexto completo y mayor throughput.
- Cabe en GPU consumer: si, con las variantes IQ2 e IQ3 en GPUs de 12 a 16 GB; Q5_K_M requiere 24 GB o mas (RTX 3090, RTX 4090, A6000).
- Opciones de despliegue: llama.cpp (`llama-cli`, `llama-server`), Ollama. No se documenta soporte de vLLM ni TGI para estos ficheros GGUF.
- Parametros de ejecucion sugeridos en la model card: `-ngl 99`, `-fa` (flash attention), `-b 2048`.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato / disponibilidad | Notas |
|---|---|---|---|---|---|
| Nanbeige4.3-33B (base) | 33,1B | no disponible | Apache-2.0 | safetensors (Hugging Face) | Modelo original sin cuantizar |
| Nanbeige4.3-33B-GSQ-RCO-GGUF (este) | 33,1B | hasta 65k con KV q4_0 | Apache-2.0 | GGUF, 7 variantes | Cuantizacion mixta optimizada para llama.cpp |
| Alternativas de ~30B | no disponible | no disponible | no disponible | no disponible | No se dispone de datos verificados de modelos comparables en la informacion proporcionada |

No se dispone de informacion suficiente para comparar rendimiento numerico con modelos alternativos de la misma categoria.

## Limitaciones y advertencias

- Idiomas limitados a ingles y chino; el rendimiento en castellano no esta documentado y probablemente sea inferior.
- La cuantizacion agresiva (IQ2_XXS, IQ2_XS) puede degradar la calidad de generacion y el razonamiento respecto al modelo en precision completa; la variante recomendada IQ2_M ya implica 3,05 bpw.
- Riesgo de alucinacion inherente a los modelos de lenguaje; no se documentan mitigaciones especificas.
- No se documentan sesgos conocidos del modelo base ni evaluaciones de seguridad.
- No se documenta soporte de tool calling ni de agentes; no debe asumirse su disponibilidad en produccion.
- El contexto maximo de 65k depende de configuracion manual de llama.cpp con KV cache cuantizada; sin esa configuracion, el contexto practico es menor.
- La licencia Apache-2.0 permite uso comercial, pero se recomienda verificar los terminos del modelo base Nanbeige4.3-33B y las condiciones de atribucion del publicador de la cuantizacion.
- El repositorio es una cuantizacion de terceros (abenzerps), no una publicacion oficial de Nanbeige; la calidad de la cuantizacion y su mantenimiento dependen de ese autor.
- Los benchmarks del modelo base no estan disponibles en la informacion proporcionada, lo que impide validar el rendimiento real frente a alternativas.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/abenzerps/Nanbeige4.3-33B-GSQ-RCO-GGUF
- Modelo base: https://huggingface.co/Nanbeige/Nanbeige4.3-33B
- Solicitud de modelos del autor: https://abenzerps.com/request-a-model/
- Imagen de benchmark: https://huggingface.co/abenzerps/Nanbeige4.3-33B-GSQ-RCO-GGUF/resolve/main/assets/benchmark.png
- Licencia Apache-2.0: https://huggingface.co/abenzerps/Nanbeige4.3-33B-GSQ-RCO-GGUF/blob/main/LICENSE
