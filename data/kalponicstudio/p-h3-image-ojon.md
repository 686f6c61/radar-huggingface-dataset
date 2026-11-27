# KalponicStudio/P-H3-Image-Ojon

## Resumen

P-H3-Image-Ojon es una coleccion de pesos cuantizados del modelo de generacion de imagenes P-H3-Image, publicado por KalponicStudio. El modelo original es un text-to-image basado en una arquitectura denominada H3, distribuido en BF16 con un tamano de 40,47 GB. Esta publicacion no contiene un modelo nuevo, sino tres artefactos derivados que reducen el peso a entre 11,62 GB y 12,78 GB mediante el cuantizador propio del autor, Ojon v0.1.0, descrito como una herramienta de cuantizacion local-first.

La relevancia de la ficha es practica: permite ejecutar un modelo de generacion de imagenes de gran tamano en hardware de consumo o en GPUs profesionales de gama media con 24 GB de VRAM. El autor reporta una generacion de aproximadamente 2,9 segundos por paso con un esquema de 8 pasos sobre una Intel Arc Pro B60, lo que situa una imagen completa en torno a los 23 segundos en ese hardware.

La informacion disponible es limitada: no se detallan la arquitectura interna, el numero de parametros, el dataset de entrenamiento ni resultados de benchmarks frente al original BF16. La model card advierte explicitamente de que aun no se ha publicado una cifra de paridad frente al modelo sin cuantizar, por lo que la fidelidad de la salida debe validarse en cada caso de uso.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | H3 (modelo de difusion para text-to-image; detalles internos no disponibles) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | W4A8 (comfy-kitchen) y GGUF Q4_K (variante normsafe y variante ComfyUI estandar) |
| Idiomas soportados | no disponible |
| Licencia | other (terminos no detallados en la informacion disponible) |
| Formato de pesos | safetensors (W4A8) y GGUF (Q4_K) |

## Arquitectura y entrenamiento

El modelo base P-H3-Image se describe como un modelo de imagen "basado en H3", sin que la informacion proporcionada detalle la familia arquitectonica concreta (transformer de difusion, DiT, UNet u otra), el numero de parametros ni la composicion del dataset de entrenamiento. Tampoco se indica si hubo etapas de ajuste fino, RLHF, DPO o preferencias humanas. Lo unico verificable es el tamano del checkpoint original en BF16: 40,47 GB.

La innovacion tecnica de esta publicacion es el proceso de cuantizacion con Ojon v0.1.0. Se ofrecen dos estrategias: una cuantizacion W4A8 en safetensors, pensada para ComfyUI con kernels INT8, y una cuantizacion GGUF Q4_K en dos variantes, una de ellas "normsafe", que mantiene las capas de normalizacion en precision completa para preservar estabilidad numerica. El resultado reduce el peso al 29 % del original (de 40,47 GB a 11,62 GB en el caso GGUF). No se documentan tecnicas de decodificacion especulativa ni optimizaciones de atencion.

## Capacidades

- Generacion de imagenes a partir de prompts de texto (pipeline text-to-image).
- Ejecucion en ComfyUI mediante el cargador ComfyUI-GGUF (para los ficheros GGUF) o el cargador estandar con comfy-kitchen (para el fichero W4A8).
- Requiere reutilizar el text encoder y el VAE de la publicacion original de P-H3-Image; no se incluyen en esta publicacion.
- No se documentan capacidades de edicion de imagen, inpainting, controlnet, tool calling, agentes ni soporte multilingue explicito.
- No se documenta modo de razonamiento, vision de entrada ni audio.

## Casos de uso

- Prototipado local de generacion de imagenes en estaciones de trabajo con GPU de 24 GB: los ficheros GGUF Q4_K de 11,62 GB permiten cargar el modelo completo en una Intel Arc Pro B60 o en una RTX 4090, algo inviable con el BF16 de 40,47 GB.
- Integracion en flujos de ComfyUI para artistas tecnicos: al usar el cargador ComfyUI-GGUF estandar, el modelo se inserta en grafos existentes sin reescribir el pipeline, sustituyendo solo el checkpoint.
- Generacion por lotes en entornos con VRAM limitada: el formato W4A8 con kernels INT8 reduce el coste de memoria y puede aumentar el throughput en GPUs con soporte INT8, manteniendo el text encoder y el VAE originales.
- Evaluacion comparativa de tecnicas de cuantizacion: al existir tres artefactos (W4A8, Q4_K normsafe y Q4_K estandar), un equipo puede medir diferencias de calidad y velocidad entre estrategias sobre los mismos prompts.
- Despliegue en hardware no NVIDIA: el autor valida el modelo en Intel Arc Pro B60, lo que lo hace candidato para entornos con GPUs Intel en lugar de CUDA.
- Iteracion rapida en investigacion de difusion: con un ciclo de unos 23 segundos por imagen en 8 pasos sobre Arc Pro B60, es viable explorar variaciones de prompt y semilla en sesiones interactivas.
- Pruebas de regresion visual en CI: los ficheros de menor tamano facilitan almacenar y versionar checkpoints en infraestructura de integracion continua, aunque la ausencia de metricas de paridad obliga a definir umbrales propios.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica que no existe todavia una cifra de paridad frente al modelo BF16 original. El unico dato de rendimiento reportado es de tipo operativo: aproximadamente 2,9 segundos por paso con un esquema de 8 pasos en una Intel Arc Pro B60 de 24 GB.

## Requisitos de hardware

- VRAM estimada: en torno a 12-13 GB para los ficheros GGUF Q4_K (11,62 GB de pesos) y el W4A8 (12,78 GB), mas el consumo del text encoder y el VAE originales, que no se cuantizan en esta publicacion.
- GPU validadas por el autor: Intel Arc Pro B60 (24 GB), con 2,9 s por paso en 8 pasos.
- GPU compatibles por capacidad: cualquier GPU con 16 GB o mas de VRAM deberia poder alojar los pesos cuantizados, aunque no se han publicado pruebas en RTX 4090, A100, H100 ni otras.
- Cabe en GPU de consumo con 16-24 GB, siempre que se sume el coste del text encoder y el VAE.
- Opciones de despliegue: ComfyUI 0.45 o superior, con el cargador ComfyUI-GGUF para los ficheros GGUF o el cargador estandar con comfy-kitchen para W4A8. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no son adecuados para un modelo de difusion de imagen.
- Latencia y throughput: aproximadamente 2,9 s por paso y 8 pasos por imagen en Arc Pro B60, es decir, unos 23 s por imagen en ese hardware. No hay datos para otras GPUs.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| P-H3-Image-Ojon (esta ficha) | no disponible | no disponible | safetensors W4A8, GGUF Q4_K | other | Hugging Face, 0 descargas |
| P-H3-Image BF16 (original) | no disponible | no disponible | BF16, 40,47 GB | other | Referenciado por el autor, no enlazado en la informacion |
| Alternativas de la misma categoria | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de informacion sobre modelos comparables de la misma familia H3 ni sobre alternativas text-to-image con las que contrastar parametros, contexto o rendimiento.

## Limitaciones y advertencias

- Ausencia de metricas de paridad: el autor no ha publicado comparacion numerica entre la salida cuantizada y el BF16 original, por lo que la perdida de calidad es desconocida.
- La cuantizacion Q4_K puede degradar detalles finos, texto dentro de la imagen y coherencia en prompts complejos; la variante normsafe intenta mitigarlo pero no hay evidencia publicada.
- Licencia "other" sin terminos detallados en la informacion disponible: es imprescindible revisar el texto completo de la licencia antes de cualquier uso comercial.
- Dependencia de artefactos externos: el text encoder y el VAE deben obtenerse de la publicacion original de P-H3-Image, lo que anade pasos de configuracion y posibles incompatibilidades de version.
- Requiere ComfyUI 0.45 o superior; versiones anteriores pueden no cargar los formatos GGUF o W4A8.
- Cero descargas y cero likes en el momento de la consulta: no hay evidencia de validacion por parte de la comunidad.
- No se documentan sesgos, idiomas soportados ni comportamiento en prompts no ingleses.
- Riesgo de alucinacion visual inherente a los modelos de difusion: el modelo puede generar contenido plausible pero incorrecto respecto al prompt.
- El rendimiento medido corresponde a una unica GPU (Intel Arc Pro B60); no hay datos de latencia en otras plataformas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/KalponicStudio/P-H3-Image-Ojon
- Repositorio de Ojon (cuantizador): https://github.com/jony100200/Ojon
- Modelo original P-H3-Image BF16: no disponible en la informacion proporcionada
- Paper, blog o demo oficial: no disponible en la informacion proporcionada
