# mradermacher/Qwen3.5-4B-DeepThought-STEM-i1-GGUF

## Resumen

Qwen3.5-4B-DeepThought-STEM-i1-GGUF es una coleccion de cuantizaciones GGUF generadas por mradermacher a partir del modelo xtools-at/Qwen3.5-4B-DeepThought-STEM. Se trata de un modelo de 4.326.350.848 parametros (aproximadamente 4,3 mil millones) afinado mediante LoRA/PEFT sobre una base Qwen3.5, orientado a razonamiento cientifico, matematicas, ciencia y descubrimiento de farmacos. El autor de las cuantizaciones no es el autor del modelo original: mradermacher se limita a producir versiones comprimidas con tecnicas de imatrix y weighted quants para facilitar el despliegue en hardware modesto.

El interes practico de esta publicacion reside en que pone a disposicion del ecosistema local (llama.cpp, Ollama y derivados) un modelo especializado en razonamiento STEM con un rango amplio de cuantizaciones que van desde i1-Q2_K (2,1 GB) hasta i1-Q6_K (3,7 GB). Esto permite ejecutar el modelo en GPUs de consumo e incluso en CPU con RAM suficiente, algo relevante para investigadores que necesitan probar tecnicas de razonamiento cientifico sin depender de infraestructura en la nube.

La model card del repositorio es fundamentalmente una guia de cuantizaciones: no incluye informacion sobre la longitud de contexto, la composicion exacta del dataset de entrenamiento ni resultados de benchmarks. Los metadatos apuntan a un entrenamiento con SFT y destilacion de trazas de razonamiento de modelos como Claude Haiku 5.5, Xiaomi MiMo 2.6 Pro, ChatGPT 6.1 Terra, GPT-5.6 luna y GLM-5.1, ademas de datasets especificos de descubrimiento de farmacos y formulacion farmaceutica. El modelo base incorpora las etiquetas "heretic", "uncensored", "decensored" y "abliterated", lo que indica que se ha aplicado algun tipo de ablacion de rechazos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Qwen3.5); detalles completos no disponibles |
| Parametros totales | 4.326.350.848 (aproximadamente 4,3 mil millones) |
| Parametros activos | No aplica (no es MoE segun la informacion disponible) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | i1-Q2_K, i1-Q3_K_S, i1-IQ3_S, i1-IQ3_M, i1-Q3_K_M, i1-Q3_K_L, i1-IQ4_XS, i1-Q4_0, i1-Q4_K_S, i1-IQ4_NL, i1-Q4_K_M, i1-Q4_1, i1-Q5_K_S, i1-Q5_K_M, i1-Q6_K (mas fichero imatrix) |
| Idiomas soportados | Ingles (segun metadatos `language: en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizaciones); el modelo base en safetensors |

## Arquitectura y entrenamiento

El modelo subyacente es un transformer decoder-only de la familia Qwen3.5 con aproximadamente 4,3 mil millones de parametros. Sobre esa base se aplico un ajuste fino mediante LoRA/PEFT (segun las etiquetas `lora`, `peft` y `unsloth`), orientado a reforzar el razonamiento STEM y, de forma especifica, el descubrimiento de farmacos y la formulacion farmaceutica. El entrenamiento combina SFT con destilacion de trazas de razonamiento de modelos de mayor tamano: Claude Haiku 5.5 (3000 ejemplos de TraceInversion), Xiaomi MiMo 2.6 Pro (250 ejemplos), ChatGPT 6.1 Terra (80 ejemplos), GPT-5.6 luna (102.881 ejemplos), GLM-5.1 (dos datasets, uno de 1M limpio y otro de 1M) y smoltalk2. Ademas se incluyen datasets sinteticos y reales de descubrimiento y formulacion de farmacos.

Las etiquetas del repositorio indican que el modelo base ha sido sometido a un proceso de "abliteration" o decensurado (tags `heretic`, `uncensored`, `decensored`, `abliterated`), lo que implica la eliminacion o reduccion de mecanismos de rechazo en las respuestas. No se dispone de informacion sobre el numero total de tokens de entrenamiento, la composicion exacta del dataset ni si se aplico RLHF o DPO. La innovacion tecnica principal de esta publicacion concreta es el uso de imatrix y weighted quants para preservar la calidad en cuantizaciones agresivas (i1-Q2_K, i1-IQ3_S), lo que permite reducir el peso hasta 2,1 GB manteniendo un comportamiento razonable.

## Capacidades

- Generacion de texto conversacional y de razonamiento paso a paso (etiqueta `reasoning`).
- Razonamiento matematico y cientifico (etiquetas `mathematics`, `science`, `stem`, `scientific-reasoning`).
- Razonamiento especializado en descubrimiento de farmacos y formulacion farmaceutica (`drug-discovery`, `pharmaceutical-formulation`, `pharmaceutics`).
- Capacidades academicas y de investigacion (`academics`).
- Soporte de tool calling / function calling: no confirmado en la informacion disponible.
- Soporte de agentes y razonamiento multi-paso: no confirmado en la informacion disponible.
- Capacidades multilingues: limitadas al ingles segun los metadatos.
- Modo de pensamiento explicito (thinking mode): no confirmado.
- Vision, audio u otras modalidades: no disponibles.
- Comportamiento decensurado/sin rechazos por ablacion, segun las etiquetas del repositorio.

## Casos de uso

- Investigacion en razonamiento cientifico: el modelo puede generar cadenas de razonamiento sobre problemas de matematicas y ciencia, util para estudiar como modelos pequenos destilados abordan tareas STEM y comparar sus trazas con las de modelos mayores.
- Asistencia en formulacion farmaceutica: dado el ajuste especifico sobre datasets de descubrimiento y formulacion de farmacos, puede emplearse como borrador de hipotesis sobre excipientes, vias de administracion o compatibilidades, siempre con supervision experta.
- Prototipado local en portatiles: las cuantizaciones i1-Q4_K_M (2,9 GB) e i1-Q4_K_S (2,7 GB) permiten ejecutar el modelo en GPUs de consumo con 6-8 GB de VRAM, lo que facilita experimentar sin coste de API.
- Educacion y tutoria STEM: con contexto conversacional y capacidad de razonamiento, puede usarse como tutor de matematicas y ciencias en ingles para estudiantes, con la advertencia de verificar sus respuestas.
- Generacion de datos sinteticos de razonamiento: al estar entrenado con trazas destiladas, puede producir razonamientos etiquetados para aumentar datasets de entrenamiento de modelos mas pequenos en dominios cientificos.
- Despliegue en entornos con recursos limitados: mediante llama.cpp u Ollama en CPU con 4-8 GB de RAM usando cuantizaciones i1-Q3_K_M o i1-IQ3_S (2,3-2,4 GB), util para demos offline o entornos air-gapped.
- Experimentacion con modelos ablacionados: investigadores interesados en estudiar el efecto de la ablacion de rechazos sobre el comportamiento en dominios sensibles pueden usar esta variante como referencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (solo pesos, sin overhead de contexto): aproximadamente 2,1 GB (i1-Q2_K), 2,3 GB (i1-IQ3_S), 2,7 GB (i1-Q4_K_S), 2,9 GB (i1-Q4_K_M), 3,3 GB (i1-Q5_K_M), 3,7 GB (i1-Q6_K). Anadir 0,5-2 GB adicionales para KV cache segun contexto.
- GPU recomendadas: cualquier GPU con 4 GB o mas de VRAM para cuantizaciones bajas; RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4090 o A100/H100 para cuantizaciones altas y contextos largos. En GPUs profesionales el modelo ocupa una fraccion minima de memoria.
- Cabe en GPU de consumo: si, en practicamente todas las GPUs dedicadas modernas (GTX 1650 4 GB en adelante) con cuantizaciones i1-Q3 o i1-Q4.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, text-generation-webui, y cualquier runtime compatible con GGUF. El modelo base en safetensors puede servirse con vLLM o TGI, pero las cuantizaciones i1 requieren llama.cpp o derivados.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada. Dado el tamano (4,3B) y las cuantizaciones de 2-4 GB, se espera un throughput alto en GPU de consumo, pero no se aportan cifras verificables.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Qwen3.5-4B-DeepThought-STEM-i1-GGUF (este) | 4,3B | No disponible | Apache 2.0 | GGUF (multiples quants) | Especializado en STEM y farmacia, ablacionado |
| Qwen3.5-4B-DeepThought-STEM (base) | 4,3B | No disponible | Apache 2.0 | Safetensors | Modelo original sin cuantizar |
| Qwen3.5-4B-DeepThought-STEM-GGUF (static quants) | 4,3B | No disponible | Apache 2.0 | GGUF | Cuantizaciones estaticas del mismo modelo, sin imatrix |
| Otros modelos Qwen3.5 de ~4B | No disponible | No disponible | Apache 2.0 (tipico) | Safetensors/GGUF | No se dispone de datos comparativos verificables en la informacion proporcionada |

No se dispone de datos de rendimiento para establecer una comparativa cuantitativa con alternativas de la misma categoria.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados en la informacion disponible; al ser un modelo destilado de trazas de modelos propietarios y entrenado mayoritariamente en ingles, es probable que herede sesgos de esas fuentes.
- Riesgo de alucinacion: elevado en dominios especializados como farmacia y formulacion, donde el modelo puede generar afirmaciones plausibles pero incorrectas; requiere validacion experta obligatoria.
- Limitaciones de contexto o idioma: el modelo esta etiquetado solo en ingles; no se garantiza un rendimiento adecuado en castellano u otros idiomas. La longitud de contexto no esta documentada.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el modelo base incorpora tecnicas de ablacion y datos derivados de modelos de terceros (Claude, ChatGPT, GLM, etc.) cuyos terminos de uso podrian afectar a la redistribucion; conviene revisar la licencia del modelo base original.
- El modelo ha sido decensurado/ablacionado, lo que implica que puede producir contenido sin los filtros habituales; no es apto para despliegues orientados al publico sin moderacion adicional.
- Al ser una cuantizacion, las versiones i1-Q2_K e i1-Q3_K_S presentan degradacion de calidad respecto al modelo original; para uso en produccion se recomienda i1-Q4_K_M o superior.
- No hay informacion sobre la calidad del ajuste fino ni sobre su comportamiento real en tareas STEM mas alla de las etiquetas del repositorio.

## Enlaces

- Repositorio Hugging Face (cuantizaciones i1): https://huggingface.co/mradermacher/Qwen3.5-4B-DeepThought-STEM-i1-GGUF
- Modelo base: https://huggingface.co/xtools-at/Qwen3.5-4B-DeepThought-STEM
- Cuantizaciones estaticas: https://huggingface.co/mradermacher/Qwen3.5-4B-DeepThought-STEM-GGUF
- Pagina de descargas del autor: https://hf.tst.eu/model#Qwen3.5-4B-DeepThought-STEM-i1-GGUF
- FAQ y solicitudes de cuantizacion: https://huggingface.co/mradermacher/model_requests
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafico comparativo de cuantizaciones (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizaciones: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- nethype GmbH: https://www.nethype.de/
