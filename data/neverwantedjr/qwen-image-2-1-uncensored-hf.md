# NeverWantedJr/Qwen-Image-2.1-Uncensored-HF

## Resumen

Qwen-Image-2.1 Uncensored HF es un paquete de cuantizaciones GGUF del modelo de difusion texto-a-imagen Qwen/Qwen-Image-2.1, publicado por el usuario NeverWantedJr. No se trata de un modelo entrenado desde cero: el autor parte de los pesos base originales de Qwen-Image-2.1 y los empaqueta en formato GGUF, junto con una variante "uncensored" (UC) que elimina los filtros de rechazo del modelo original, de modo que puede generar contenido que el modelo base declinaria. El repositorio incluye tambien los ficheros auxiliares necesarios para ComfyUI: el text encoder Qwen3-VL 8B (en BF16 o Int8) y el VAE del modelo.

El objetivo practico es permitir la generacion de imagenes en local sobre GPU de consumo, algo inviable con los pesos BF16 completos, mediante cuantizaciones que van de 4,15 GB (Q4_0) a 14,23 GB (BF16). La cuantizacion recomendada por el autor es Q4_K_M (4,60 GB), que combinada con el text encoder Int8 en RAM permite ejecutar el pipeline en tarjetas de 8-12 GB de VRAM.

La relevancia es doble: por un lado, acerca un modelo de generacion de imagenes de ultima generacion a equipos domesticos; por otro, la licencia qwen-research y la naturaleza "uncensored" del fine-tune limitan seriamente su uso en produccion comercial. El repositorio, creado el 17 de octubre de 2026, no registra descargas ni valoraciones, por lo que carece de validacion de la comunidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo de difusion texto-a-imagen; la informacion disponible no detalla la arquitectura interna (identificador de arquitectura en ComfyUI: `ModelQwenImage`) |
| Parametros totales | 7.115.124.736 (~7,1 B) segun los safetensors del repositorio |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible; no aplica como contexto de texto. El prompt se procesa con el text encoder Qwen3-VL 8B |
| Tipos de cuantizacion | BF16 (solo variante UC), Q8_0, Q6_K, Q5_K_M, Q4_K_M, Q4_0 |
| Idiomas soportados | No disponible |
| Licencia | `qwen-research` (etiquetada como `license: other`) |
| Formato de pesos | GGUF para el modelo de difusion; safetensors para text encoder y VAE |

## Arquitectura y entrenamiento

El repositorio no documenta la arquitectura interna del modelo de difusion mas alla del identificador `ModelQwenImage` que emplea ComfyUI para cargarlo. Se trata de un modelo de difusion para generacion de imagenes a partir de texto, con un text encoder Qwen3-VL de 8B parametros que codifica el prompt y un VAE propio (`qwen_image_2.1_vae_bf16.safetensors`, 676 MB) que decodifica el latente en imagen. Los pesos distribuidos aqui son cuantizaciones de los pesos base originales de Qwen/Qwen-Image-2.1, no un reentrenamiento.

No se proporcionan datos sobre el corpus de entrenamiento, el numero de tokens, la composicion del dataset ni si hubo etapas de RLHF o DPO. La unica intervencion declarada por el autor es la generacion de las cuantizaciones GGUF y la produccion de la variante "uncensored", de la que tampoco se especifica la metodologia (no se indica si se trata de un fine-tune, de un merge o de una simple eliminacion de filtros en el pipeline). El modelo soporta, segun los workflows oficiales enlazados, tanto texto-a-imagen como edicion de imagen.

## Capacidades

- Generacion de imagenes a partir de descripciones textuales (text-to-image) en local.
- Edicion de imagen guiada por prompt, segun el workflow oficial `image_qwen_image_2_1_image_edit.json` enlazado en la model card.
- Generacion sin filtros de rechazo en la variante "uncensored" (UC), incluyendo contenido que el modelo base rechazaria.
- Integracion nativa con ComfyUI mediante el nodo `Unet Loader (GGUF)` y el ecosistema ComfyUI-GGUF.
- Carga del text encoder en Int8 (`qwen3vl_8b_int8_convrot.safetensors`) para reducir el consumo de VRAM, con offload a RAM del sistema.
- Soporte de cuantizaciones desde Q4_0 hasta BF16, lo que permite ajustar el equilibrio entre calidad y memoria.
- Capacidades multilingues del pipeline: no disponibles en la informacion proporcionada (el text encoder Qwen3-VL es un modelo multimodal, pero no se documenta el soporte idiomatico de este paquete).
- No se documenta soporte de tool calling, function calling ni comportamiento agentico; son capacidades no aplicables a un modelo de difusion.

## Casos de uso

- Generacion de ilustraciones para prototipado de producto: con Q4_K_M (4,60 GB) el modelo cabe en una GPU de 8-12 GB y permite iterar bocetos visuales en local sin coste por API ni envio de prompts a terceros.
- Creacion de material grafico para investigacion sobre sesgos y seguridad en modelos generativos: la variante uncensored permite estudiar que contenidos filtra el modelo base y con que criterios, en un entorno controlado y aislado.
- Edicion de imagenes en flujos de trabajo ComfyUI: el workflow oficial de image edit permite modificar imagenes existentes mediante prompt, util para retoque, sustitucion de fondos o cambios de estilo en lotes pequenos.
- Produccion artistica y conceptual: el autor invita a compartir imagenes generadas en la seccion Community, lo que situa el uso previsto en el ambito creativo y experimental mas que en el industrial.
- Despliegue en estaciones de trabajo sin conexion: al incluir el denoiser, el text encoder y el VAE en el mismo repositorio, el pipeline completo funciona en entornos air-gapped, relevante para laboratorios con requisitos de confidencialidad.
- Evaluacion comparativa de cuantizaciones: las seis variantes publicadas (de Q4_0 a BF16) permiten medir la perdida de calidad visual frente al coste de memoria, un caso de uso metodologico habitual en investigacion sobre cuantizacion de modelos de difusion.
- Generacion de contenido para adultos o sin restricciones en un entorno privado: es la funcion explicita de la variante UC, aunque con las salvedades legales indicadas en la seccion de limitaciones.

## Benchmarks y rendimiento

La model card incluye una imagen de referencia (`assets/Qwen-Image-2.1-Benchmark.png`) con resultados comparativos, pero no se han transcrito cifras numericas en la informacion disponible.

No se han publicado resultados de benchmarks numericos (FID, CLIP score, HPSv2 u otros) en la informacion disponible. Tampoco se ofrecen datos de latencia ni de throughput por cuantizacion.

## Requisitos de hardware

- VRAM para el modelo de difusion: de 4,15 GB (Q4_0) a 14,23 GB (BF16), pasando por 4,60 GB (Q4_K_M, recomendado), 5,22 GB (Q5_K_M), 5,88 GB (Q6_K) y 7,59 GB (Q8_0).
- VRAM o RAM para el text encoder: 17,53 GB en BF16 o 9,35 GB en Int8 (`qwen3vl_8b_int8_convrot.safetensors`, recomendado para memoria baja).
- VAE: 676 MB en BF16.
- Configuracion recomendada por el autor: difusion Q4_K_M en VRAM (~4,6 GB) y text encoder Int8 en RAM (~9,35 GB), lo que deja el pico de VRAM en torno a 4,6 GB mas el overhead de muestreo y decodificacion del VAE.
- Cabe en GPU de consumo: si, con Q4_K_M o inferior en tarjetas de 8 GB (RTX 3060 Ti, RTX 4060), 12 GB (RTX 3060 12 GB, RTX 4070) y 16-24 GB (RTX 4060 Ti 16 GB, RTX 4080, RTX 4090). Con BF16 (14,23 GB) mas el text encoder se hace necesaria una GPU de 24 GB o el offload parcial.
- RAM del sistema: al menos 16 GB si se descarga el text encoder Int8 a CPU; 32 GB recomendables para trabajar con BF16.
- Opciones de despliegue: ComfyUI con el fork `leejet/ComfyUI-GGUF` (soporte nativo de Qwen-Image 2.1). El fork antiguo `city96/ComfyUI-GGUF` provoca el error `Unknown model architecture!` segun la model card.
- Latencia y throughput: no disponibles en la informacion proporcionada. El autor solo indica que ejecutar el text encoder en CPU tiene un impacto practicamente nulo en la velocidad de generacion, porque la codificacion del prompt ocurre una sola vez por prompt.

## Comparativa con modelos similares

| Modelo | Parametros | Formato / tamano | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen-Image-2.1 Uncensored GGUF (este) | ~7,1 B | GGUF, 4,15-14,23 GB | No disponible | qwen-research | HuggingFace, 0 descargas |
| Qwen-Image-2.1 (base, Qwen) | No disponible en la informacion | Safetensors (pesos originales) | No disponible | qwen-research | HuggingFace (modelo base) |
| Qwen-Image-2.1 GGUF (variantes sin censura eliminada del mismo repo) | ~7,1 B | GGUF, 4,05-7,59 GB | No disponible | qwen-research | HuggingFace (mismo repositorio) |
| FLUX.1 / Stable Diffusion 3.5 (categoria equivalente de difusion texto-a-imagen) | No disponible | No disponible | No disponible | No disponible | No disponible |

Las dos primeras alternativas son variantes del mismo modelo: la version base sin cuantizar ofrece la maxima calidad pero exige mucha mas VRAM, y las GGUF sin el sufijo `UC` mantienen los filtros del modelo original. Para FLUX.1 y Stable Diffusion 3.5 no se dispone de datos verificables en la informacion proporcionada, por lo que la comparacion cuantitativa queda pendiente.

## Limitaciones y advertencias

- Licencia `qwen-research`: no es una licencia de uso comercial general. Debe revisarse el texto completo antes de cualquier despliegue en producto; el modelo esta orientado a investigacion.
- La variante "uncensored" elimina los filtros de rechazo, lo que implica riesgo legal y reputacional. La generacion de contenido sexual, violento o que reproduzca la imagen de personas reales puede infringir normativas de distintos paises y las politicas de la plataforma de despliegue.
- Riesgo de alucinacion visual: como todo modelo de difusion, puede producir anatomia incorrecta, texto ilegible en la imagen, incoherencias espaciales y artefactos, especialmente en las cuantizaciones mas agresivas (Q4_0, Q4_K_M).
- Perdida de calidad por cuantizacion no documentada: el autor no publica metricas que cuantifiquen la degradacion de Q4_K_M frente a BF16, solo una recomendacion cualitativa.
- Sesgos: no se documenta ninguna evaluacion de sesgos demograficos, culturales o de representacion. Al derivar de los pesos base, hereda los sesgos de su dataset de entrenamiento, que tampoco se detalla.
- Idiomas: no se especifica que idiomas maneja el pipeline de prompts; el rendimiento en castellano no esta verificado.
- Inconsistencia en el repositorio: la model card enlaza los ficheros a la cuenta `abenzerps/Qwen-Image-2.1-Uncensored-GGUF`, mientras que el ID publicado es `NeverWantedJr/Qwen-Image-2.1-Uncensored-HF`. Conviene verificar que los enlaces de descarga resuelven correctamente.
- Sin validacion de la comunidad: 0 descargas y 0 likes en el momento de la consulta, creado el 17 de octubre de 2026. No hay evidencia independiente de que las cuantizaciones funcionen segun lo descrito.
- Metodologia "uncensored" no documentada: no se indica si se ha modificado el modelo, si se ha hecho un fine-tune o si solo se ha alterado el pipeline, lo que impide evaluar la calidad relativa frente al base.
- Dependencia de un fork concreto: requiere `leejet/ComfyUI-GGUF`; con el fork `city96` el modelo no carga.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/NeverWantedJr/Qwen-Image-2.1-Uncensored-HF
- Modelo base: https://huggingface.co/Qwen/Qwen-Image-2.1
- Repositorio referenciado en la model card (ficheros GGUF): https://huggingface.co/abenzerps/Qwen-Image-2.1-Uncensored-GGUF
- ComfyUI: https://github.com/comfyanonymous/ComfyUI
- ComfyUI-GGUF (fork mantenido con soporte Qwen-Image 2.1): https://github.com/leejet/ComfyUI-GGUF
- Workflow oficial texto-a-imagen: https://github.com/Comfy-Org/workflow_templates/blob/main/templates/image_qwen_image_2_1_t2i.json
- Workflow oficial de edicion de imagen: https://github.com/Comfy-Org/workflow_templates/blob/main/templates/image_qwen_image_2_1_image_edit.json
- Busqueda web: los resultados devueltos no guardan relacion con el modelo ni aportan informacion tecnica utilizable, por lo que no se incluyen.
