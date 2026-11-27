# masahiroid/LFM3-1.7B-Pyrite-2bit-GGUF

## Resumen

LFM3-1.7B-Pyrite-2bit-GGUF es una cuantizacion extrema a 2 bits del modelo LFM3-1.7B (Base/Instruct) de Liquid AI, publicada por Masahiro Nakatsugawa (n.p.minerva & Co.) bajo el pipeline de baja precision de Project Pyrite y llama.cpp con aceleracion Metal 4. El modelo original es un hibrido no-transformer de Liquid AI con 1.728.801.600 parametros, orientado a inferencia en el borde (edge AI), y esta cuantizacion lo reduce de 3,23 GB en BF16 a 715 MB, una reduccion del 78%.

La relevancia de esta ficha radica en que demuestra que es viable ejecutar un modelo de 1,7B parametros en hardware de consumo con un peso inferior a 1 GB, manteniendo el proceso de razonamiento `<thought>` y la salida bilingue (ingles y japones). Esta pensado para desarrolladores que necesitan desplegar generacion de texto en dispositivos con recursos muy limitados, como portatiles Apple Silicon o sistemas embebidos.

El repositorio ocupa 0,8 GB y la model card reporta mediciones en un Apple M2 Pro con Metal 4: 281,2 tok/s de procesamiento de prompt y 120,2 tok/s de generacion. La licencia es la liquid-license del modelo original, lo que condiciona el uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Hibrida no-transformer (LFM3 de Liquid AI) |
| Parametros totales | 1.728.801.600 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 2 bits (3,43 bpw), GGUF Q2_K |
| Idiomas soportados | en, ja |
| Licencia | liquid-license (other) |
| Formato de pesos | GGUF (llama.cpp) |

## Arquitectura y entrenamiento

El modelo base LFM3-1.7B de Liquid AI se describe en la model card como un modelo hibrido no-transformer, una familia arquitectonica que en Liquid AI combina capas recurrentes y de atencion para reducir el coste computacional en inferencia. No se dispone en la informacion proporcionada de detalles sobre el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO.

La innovacion principal de esta publicacion es el pipeline de cuantizacion extrema de Project Pyrite, que comprime los pesos a 2 bits (3,43 bits por peso efectivos) mediante llama.cpp y aceleracion Metal 4. Segun la model card, la cuantizacion preserva el proceso de razonamiento `<thought>` y la capacidad de salida bilingue del modelo original, algo poco habitual en cuantizaciones de tan baja precision.

## Capacidades

- Generacion de texto conversacional en ingles y japones.
- Razonamiento con proceso interno `<thought>` preservado tras la cuantizacion a 2 bits.
- Salida bilingue (en/ja) segun la model card.
- Compatible con endpoints (tag `endpoints_compatible`).
- Inferencia en CPU/GPU via llama.cpp y Ollama.
- No se documentan en la informacion disponible capacidades de tool calling, function calling, agentes, vision ni audio.

## Casos de uso

- Asistente conversacional en dispositivos de borde: con 715 MB de peso, el modelo cabe en moviles, Raspberry Pi o portatiles de gama baja, permitiendo un chatbot local sin conexion a la nube.
- Traduccion y asistencia bilingue ingles-japones: el modelo conserva la salida en ambos idiomas, util para herramientas de traduccion embebidas en aplicaciones para usuarios japoneses.
- Prototipado rapido en portatiles Apple Silicon: los 120,2 tok/s medidos en M2 Pro permiten iterar sobre prompts y flujos conversacionales sin infraestructura GPU dedicada.
- Razonamiento ligero en local: el modo `<thought>` permite tareas de resolucion de problemas paso a paso en entornos sin acceso a modelos en la nube, por ejemplo en entornos con requisitos de privacidad.
- Educacion y demos de cuantizacion extrema: sirve como referencia tecnica para estudiar el impacto de la cuantizacion a 2 bits en modelos hibridos no-transformer.
- Integracion en aplicaciones de escritorio via Ollama: el Modelfile incluido permite desplegar el modelo como servicio local con `ollama run` para asistentes de escritorio o plugins de editores.

## Benchmarks y rendimiento

Los unicos datos publicados en la informacion disponible son mediciones de rendimiento de inferencia en Apple M2 Pro con Metal 4, no benchmarks de calidad de tarea:

| Metrica | Valor |
|---|---|
| Tamano del modelo | 715 MB (desde 3,23 GB en BF16, -78%) |
| Bits por peso | 3,43 bpw |
| Procesamiento de prompt | 281,2 tok/s |
| Generacion de tokens | 120,2 tok/s |
| Plataforma | Apple M2 Pro, Metal 4 |

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB para los pesos (715 MB); con overhead de contexto y KV cache, el consumo total puede situarse en torno a 1-2 GB, aunque no se especifica en la model card.
- GPU recomendadas: Apple Silicon (M2 Pro medido); cualquier GPU compatible con Metal 4 o con soporte llama.cpp.
- Cabe en GPU de consumo: si, practicamente en cualquier GPU moderna e incluso en CPU, dado el tamano de 715 MB.
- Opciones de despliegue: llama.cpp (`llama-cli`), Ollama (via Modelfile), y cualquier runtime compatible con GGUF.
- Latencia y throughput: 281,2 tok/s de prompt y 120,2 tok/s de generacion en Apple M2 Pro con Metal 4.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| LFM3-1.7B-Pyrite-2bit-GGUF | 1,73B | no disponible | GGUF 2-bit | liquid-license | Hugging Face |
| LFM3-1.7B (original, BF16) | 1,73B | no disponible | safetensors | liquid-license | Hugging Face (Liquid AI) |
| Otras cuantizaciones GGUF de LFM3-1.7B | 1,73B | no disponible | GGUF (mayor precision) | liquid-license | no disponible en la informacion |

No se dispone en la informacion proporcionada de datos de rendimiento comparativo con otros modelos de la misma categoria.

## Limitaciones y advertencias

- La cuantizacion a 2 bits (3,43 bpw) puede degradar la calidad de generacion respecto al modelo en BF16; no se publican benchmarks de calidad que lo cuantifiquen.
- Solo se declaran los idiomas ingles y japones; el rendimiento en castellano no esta garantizado.
- La licencia liquid-license condiciona el uso comercial; es necesario revisar los terminos en liquid.ai antes de desplegar en produccion.
- No se documentan capacidades de tool calling, agentes ni vision, por lo que no es adecuado para pipelines que las requieran.
- Riesgo de alucinacion inherente a modelos de 1,7B parametros, agravado por la baja precision de los pesos.
- No se especifica la longitud de contexto soportada, lo que limita la planificacion de casos de uso con ventanas largas.
- El modelo esta pensado para edge AI; no se recomienda como sustituto de modelos mayores en tareas de razonamiento complejo.

## Enlaces

- Hugging Face: https://huggingface.co/masahiroid/LFM3-1.7B-Pyrite-2bit-GGUF
- README en japones: https://huggingface.co/masahiroid/LFM3-1.7B-Pyrite-2bit-GGUF/blob/main/README.ja.md
- Liquid AI (licencia y modelo base): https://www.liquid.ai
- ORCID del autor: https://orcid.org/0009-0000-3224-0103
