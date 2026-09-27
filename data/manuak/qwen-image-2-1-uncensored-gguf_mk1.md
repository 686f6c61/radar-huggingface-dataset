# Manuak/Qwen-Image-2.1-Uncensored-GGUF_MK1

## Resumen

Manuak/Qwen-Image-2.1-Uncensored-GGUF_MK1 es una cuantizacion en formato GGUF del transformer de generacion de imagen Qwen-Image-2.1, publicada por el usuario Manuak sobre el modelo base Qwen/Qwen-Image-2.1. El repositorio esta pensado para su uso en ComfyUI mediante el nodo ComfyUI-GGUF, y no incluye los componentes auxiliares necesarios para la inferencia (text encoder y VAE), que deben obtenerse por separado. El transformer cuenta con 7.115.124.736 parametros y el repositorio ocupa 105,0 GB, presumiblemente por acumular varias cuantizaciones GGUF del mismo modelo.

El modelo resuelve la generacion de imagenes a partir de prompts de texto (pipeline text-to-image) en equipos con VRAM limitada, al reducir el peso del transformer frente a los pesos completos en bf16 (aproximadamente 33 GB segun las guias consultadas). La etiqueta "Uncensored" del nombre no implica una modificacion de los pesos: segun el analisis publicado en blog.laozhang.ai, las subidas marcadas como "uncensored" aparecidas el dia del lanzamiento son cuantizaciones planas de los mismos pesos, no un modelo reentrenado o filtrado.

El acceso al repositorio esta restringido (gated) y requiere aceptar condiciones en HuggingFace. La licencia declarada es qwen-research, etiquetada como license:other, lo que condiciona el uso comercial. En el momento de la consulta el repositorio registra 0 descargas y 0 likes, por lo que no existe validacion comunitaria de su calidad o integridad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible en detalle; se describe como "image transformer" para text-to-image, derivado de Qwen/Qwen-Image-2.1 |
| Parametros totales | 7.115.124.736 (transformer, dato real de safetensors del modelo base) |
| Longitud de contexto | no disponible (la entrada es un prompt de texto; no se especifica longitud maxima) |
| Tipos de cuantizacion | GGUF; se recomienda Q4_K_M. No se detalla el listado completo de cuantizaciones incluidas en el repositorio |
| Idiomas soportados | no disponible |
| Licencia | qwen-research (etiquetada como license:other en HuggingFace) |
| Formato de pesos | GGUF (transformer). El pipeline completo requiere ademas text encoder en safetensors (qwen3vl_8b_bf16.safetensors o qwen3vl_8b_int8_convrot.safetensors) y VAE (qwen_image_2.1_vae_bf16.safetensors) |

## Arquitectura y entrenamiento

La informacion disponible identifica el modelo como un "image transformer" de generacion de imagen condicionada por texto, integrado en un pipeline que separa tres componentes: el transformer de difusion (cuantizado en GGUF en este repositorio), un text encoder basado en Qwen3-VL de 8.000 millones de parametros y un VAE independiente. No se dispone de detalles sobre el numero de bloques, tipo de atencion, mecanismo de condicionamiento ni estrategia de muestreo.

Tampoco hay informacion publicada en las fuentes consultadas sobre el volumen de tokens de entrenamiento, la composicion del dataset, el uso de RLHF/DPO o preferencias humanas, ni sobre innovaciones tecnicas especificas del modelo base. El repositorio aqui descrito no aporta entrenamiento adicional: es una conversion de pesos a GGUF. El autor no documenta el proceso de cuantizacion, las herramientas empleadas ni las metricas de degradacion respecto al modelo original.

## Capacidades

- Generacion de imagenes a partir de prompts de texto (pipeline text-to-image).
- Ejecucion local en ComfyUI mediante el nodo ComfyUI-GGUF de leejet, con carga de transformer, text encoder y VAE como archivos independientes.
- Uso de text encoder multimodal Qwen3-VL 8B (bf16 o int8), segun los archivos auxiliares referenciados en repositorios equivalentes.
- No se documenta soporte de tool calling, function calling ni comportamiento agentico: no es un modelo de lenguaje conversacional.
- No se documentan capacidades de edicion de imagen, inpainting, outpainting, control por pose o generacion de video en la informacion disponible.
- Capacidades multilingues: no disponible (el campo de idiomas del repositorio esta vacio).
- No se documenta modo de razonamiento explicito ("thinking") ni variantes de decodificacion especulativa.

## Casos de uso

- Generacion de ilustraciones en flujo local con ComfyUI: el transformer cuantizado en GGUF permite cargar el modelo en GPUs de gama alta de consumo, encadenando nodos de prompt, sampler y VAE sin depender de APIs externas.
- Prototipado rapido de concept art: con la cuantizacion Q4_K_M el modelo se puede iterar en sesiones de generacion masiva, descartando resultados y refinando prompts antes de pasar a una pasada final en mayor precision.
- Creacion de assets para videojuegos y prototipos: generacion por lotes de iconos, texturas de referencia o bocetos de personajes partiendo de descripciones textuales, integrable en un pipeline de post-procesado.
- Generacion de imagenes para investigacion en vision por computador: produccion de conjuntos sinteticos de imagenes con distribuciones controladas por prompt para aumentar datasets de entrenamiento o validacion.
- Pruebas de cuantizacion y evaluacion de degradacion: al existir varias cuantizaciones GGUF del mismo transformer en distintos repositorios, sirve como banco de pruebas para medir el impacto de Q4_K_M y otras variantes frente a los pesos bf16.
- Maquetas visuales para marketing y presentaciones: generar variaciones de una idea grafica a partir de un brief textual sin salir del equipo local, util cuando hay restricciones de confidencialidad sobre el contenido.
- Base para fine-tuning con LoRA: el hecho de que el modelo base tenga pesos publicados y una version cuantizada facilita experimentar con adaptadores especificos, siempre que la licencia qwen-research lo permita.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM del transformer en Q4_K_M: estimacion de aproximadamente 5-6 GB a partir de los 7.115.124.736 parametros y del regimen de bits tipico de Q4_K_M. Es una estimacion, no un dato publicado por el autor.
- VRAM del text encoder Qwen3-VL 8B: en bf16 aproximadamente 16 GB; con la variante int8_convrot aproximadamente 8-9 GB (recomendada en los repositorios equivalentes para reducir memoria).
- VAE: peso reducido, por debajo de 1 GB en bf16.
- Total del pipeline: en torno a 10-12 GB con encoder int8 y 15-17 GB con encoder bf16, segun las estimaciones anteriores. Los pesos completos del modelo base en bf16 ocupan aproximadamente 33 GB, segun las guias consultadas.
- Cabe en GPU de consumo: si, en RTX 4090 y RTX 3090 (24 GB) con margen; en tarjetas de 16 GB (RTX 4080, RTX 4060 Ti 16 GB) el encoder bf16 obliga a usar la variante int8 o a descargar componentes a RAM.
- Opciones de despliegue: ComfyUI con ComfyUI-GGUF de leejet. Se advierte de que el cargador antiguo de city96 no se actualiza desde enero y puede fallar con "Unknown model architecture!". No aplican vLLM, llama.cpp, Ollama ni TGI, al no tratarse de un modelo de lenguaje.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros (transformer) | Formato | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Manuak/Qwen-Image-2.1-Uncensored-GGUF_MK1 | 7.115.124.736 | GGUF | qwen-research | Gated, 0 descargas, 0 likes | Objeto de esta ficha |
| Qwen/Qwen-Image-2.1 | no disponible en la informacion | safetensors (bf16) | qwen-research | Modelo base oficial | Referencia de maxima calidad |
| abenzerps/Qwen-Image-2.1-Uncensored-GGUF | mismos pesos de origen | GGUF + safetensors auxiliares | no disponible | Repositorio publico | Incluye encoder y VAE en el propio repositorio |
| 0xSojalSec/Qwen-Image-2.1-Uncensored-GGUF | mismos pesos de origen | GGUF | no disponible | Repositorio publico | Solo transformer; requiere encoder y VAE aparte |
| KasugaiSakura/Qwen-Image-2.1-Uncensored-GGUF | mismos pesos de origen | GGUF + safetensors auxiliares | no disponible | Repositorio publico | Incluye encoder y VAE en el propio repositorio |

No se dispone de datos de rendimiento comparado entre estas variantes. Todas ellas derivan de los mismos pesos base, por lo que las diferencias se limitan a la cuantizacion y al empaquetado de archivos.

## Limitaciones y advertencias

- La etiqueta "Uncensored" no corresponde a un modelo modificado: son cuantizaciones de los mismos pesos, segun el analisis publicado en blog.laozhang.ai. No debe esperarse un comportamiento distinto en cuanto a filtrado respecto al modelo original.
- La licencia qwen-research esta etiquetada como license:other; los terminos exactos no se detallan en la informacion disponible. Al tratarse de una licencia de investigacion, conviene revisar el texto completo antes de cualquier uso comercial o de redistribucion.
- El acceso al repositorio es restringido (gated): es necesario aceptar condiciones en HuggingFace antes de descargar los pesos.
- El repositorio tiene 0 descargas y 0 likes, sin historial de validacion por parte de la comunidad. No hay garantia documentada sobre la integridad o fidelidad de la cuantizacion.
- El autor no publica informacion sobre el proceso de cuantizacion, las herramientas usadas ni la perdida de calidad respecto a bf16.
- La cuantizacion Q4_K_M introduce degradacion en la fidelidad de la imagen generada respecto a los pesos completos; la magnitud no esta documentada.
- El repositorio no incluye text encoder ni VAE, de modo que no es autocontenido y requiere archivos adicionales de otros repositorios.
- No hay informacion sobre idiomas soportados por el text encoder ni sobre su cobertura del castellano.
- Riesgo de sesgos y de contenido inapropiado: al no existir una modificacion de pesos, los sesgos del dataset original de Qwen-Image-2.1 se mantienen. La generacion de contenido sensible puede acarrear implicaciones legales segun la jurisdiccion de uso.
- No se documentan limites de resolucion, relacion de aspecto ni numero maximo de pasos de muestreo.
- El cargador GGUF empleado es critico: versiones no mantenidas pueden fallar al interpretar la arquitectura del modelo.

## Enlaces

- Repositorio principal: https://huggingface.co/Manuak/Qwen-Image-2.1-Uncensored-GGUF_MK1
- Modelo base: https://huggingface.co/Qwen/Qwen-Image-2.1
- Repositorio alternativo con encoder y VAE incluidos: https://huggingface.co/abenzerps/Qwen-Image-2.1-Uncensored-GGUF
- Repositorio alternativo solo transformer: https://huggingface.co/0xSojalSec/Qwen-Image-2.1-Uncensored-GGUF
- Repositorio alternativo con encoder y VAE incluidos: https://huggingface.co/KasugaiSakura/Qwen-Image-2.1-Uncensored-GGUF
- Analisis sobre filtrado, licencia y legalidad: https://blog.laozhang.ai/en/posts/qwen-image-2-1-nsfw
- Guia de ejecucion local y requisitos de ComfyUI-GGUF: https://stashbase.ai/blog/run-qwen-image-2-1-locally-uncensored/
