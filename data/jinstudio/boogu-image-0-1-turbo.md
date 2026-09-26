# Jinstudio/Boogu-Image-0.1-Turbo

## Resumen

Boogu-Image-0.1-Turbo es un modelo de generacion de imagen a partir de texto (text-to-image) publicado dentro de la familia Boogu-Image-0.1, un conjunto unificado de modelos de generacion y edicion de imagen que incluye las variantes Base, Turbo, Edit y Edit-Turbo. La familia esta desarrollada por el equipo del proyecto Boogu y se distribuye bajo licencia Apache 2.0; el repositorio analizado se publica bajo la cuenta Jinstudio en Hugging Face. El modelo Turbo es la variante orientada a generacion rapida y estable a partir de prompts de texto, con soporte de renderizado de texto en ingles y chino.

El checkpoint ocupa aproximadamente 10.292.556.288 parametros (unos 10,3 mil millones) en pesos safetensors, con un tamano de repositorio de 38,5 GB, y se integra en el ecosistema diffusers mediante el pipeline `BooguImageTurboPipeline`. El proyecto se presenta como un estudio empirico orientado a demostrar que, con un presupuesto de computo muy inferior al de los sistemas cerrados, una mejora sistematica de la capacidad de comprension, la calidad de datos y el pipeline de entrenamiento permite acercarse al rendimiento de sistemas multimodal cerrados.

Es relevante ahora porque existe un informe tecnico asociado (arXiv:2607.13125, "Boosting Open Agentic Multimodal Generation via Understanding under a Minimal Budget"), porque ya hay soporte de inferencia en vLLM-Omni y un backend experimental para NPU, y porque la familia se publica bajo una licencia permisiva (Apache 2.0) que facilita su uso comercial. El propio equipo advierte que Boogu-Image-0.1 es un proyecto de investigacion y no un lanzamiento oficial de modelo, y que no existe ninguna API o servicio de pago afiliado al proyecto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo de difusion unificado de generacion y edicion de imagen; pipeline diffusers `BooguImageTurboPipeline`) |
| Parametros totales | 10.292.556.288 (~10,3 B) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | ingles (en), chino (zh) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

Datos adicionales: pipeline declarado `text-to-image`; libreria `diffusers`; tamano del repositorio 38,5 GB; repositorio creado el 26 de septiembre de 2026.

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna del modelo (no se especifica si es un transformer de difusion, un modelo hibrido ni la composicion exacta de sus componentes). Lo que si se indica es que forma parte de una familia unificada de generacion y edicion de imagen y que se sirve a traves de un pipeline especifico de diffusers (`BooguImageTurboPipeline`). El informe tecnico asociado enmarca el trabajo bajo el lema de "mejorar la generacion multimodal agentica abierta mediante la comprension con un presupuesto minimo".

En cuanto al entrenamiento, la model card afirma que la escala de datos de entrenamiento es aproximadamente un orden de magnitud menor que la de algunos modelos abiertos comparables, y que la mejora de rendimiento se consigue mediante comprension, calidad de datos y pipeline, mas que por volumen de computo. No se proporcionan en la informacion disponible el numero exacto de tokens, la composicion del dataset ni si se emplearon tecnicas de RLHF o DPO. La variante Edit-Turbo de la misma familia se describe como una variante destilada de cuatro pasos, pero ese dato corresponde al modelo de edicion, no necesariamente a este checkpoint Turbo de text-to-image.

## Capacidades

- Generacion de imagenes a partir de texto (text-to-image) de alta calidad, con la variante Turbo orientada a generacion rapida.
- Renderizado de texto en imagen en ingles y chino, segun la descripcion de la familia.
- Integracion nativa en el ecosistema Hugging Face diffusers mediante `BooguImageTurboPipeline`.
- Compatibilidad con el servidor de inferencia vLLM-Omni (receta oficial publicada por el proyecto vLLM).
- Soporte experimental de backend NPU a traves de la rama `npu` del repositorio.
- No se documentan en la informacion disponible capacidades de tool calling, function calling, razonamiento multi-paso, agentes, vision de entrada ni audio para este checkpoint concreto.

## Casos de uso

- Generacion de imagenes para marketing y publicidad: el modelo produce ilustraciones y composiciones a partir de prompts de texto, y el renderizado de texto en ingles y chino permite incluir titulares o etiquetas dentro de la propia imagen sin postproceso.
- Creacion de material grafico para producto digital: generacion de banners, iconos o fondos para aplicaciones y webs, aprovechando la licencia Apache 2.0 para uso comercial sin restricciones de atribucion obligatoria.
- Generacion rapida de borradores visuales en diseno: la variante Turbo esta pensada para iteracion rapida, lo que la hace util para explorar variaciones de concepto antes de un render final de mayor calidad con la variante Base.
- Contenido localizado para mercados hispanohablantes y chinos: al soportar prompts en ingles y chino, puede emplearse en pipelines de generacion de material grafico para campanas en ambos idiomas.
- Prototipado de pipelines de difusion en investigacion: al integrarse en diffusers y en vLLM-Omni, sirve como base para experimentar con inferencia distribuida, despliegue en servidor y comparativas de arquitectura.
- Pruebas de despliegue en hardware alternativo: la rama NPU permite evaluar el modelo en aceleradores no NVIDIA dentro de entornos de investigacion.
- Generacion de datos sinteticos de imagen para aumento de datasets de vision por computador, siempre que se revise la calidad y los posibles sesgos de la salida.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Existe un informe tecnico asociado (arXiv:2607.13125) que presumiblemente contiene evaluaciones, pero los valores numericos (FID, CLIP score, comparativas de generacion o de edicion) no se incluyen en los datos proporcionados, por lo que no se presentan cifras para no inventar resultados.

## Requisitos de hardware

- VRAM estimada para inferencia: con 10,3 B de parametros, los pesos en precision de 16 bits ocupan aproximadamente 20,6 GB, a los que hay que sumar activaciones y latents de difusion, por lo que se estima un minimo practico de unos 24 GB de VRAM en fp16/bf16 para resoluciones habituales. Estas cifras son estimaciones de calculo, no datos publicados por el autor.
- GPU recomendadas: para fp16 sin cuantizar, GPUs con 24 GB o mas (RTX 4090, RTX 3090, A100 40 GB, H100). Para despliegue en servidor con mayor concurrencia, A100/H100.
- Cabe en GPU de consumo: probablemente en RTX 4090 (24 GB) en fp16 al limite; en tarjetas de 16 GB o menos solo si existen versiones cuantizadas, algo que no esta confirmado en la informacion disponible.
- Opciones de despliegue: diffusers (nativo, via `BooguImageTurboPipeline`), vLLM-Omni (receta oficial Boogu-Image publicado por el proyecto vLLM) y backend NPU experimental (rama `npu`).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Licencia | Disponibilidad | Idiomas | Notas |
|---|---|---|---|---|---|
| Boogu-Image-0.1-Turbo | ~10,3 B | Apache 2.0 | Hugging Face, diffusers, vLLM-Omni | en, zh | Variante Turbo de la familia Boogu; renderizado de texto en ingles y chino |
| FLUX.1-dev (Black Forest Labs) | ~12 B | No comercial | Hugging Face, diffusers | principalmente en | Modelo de generacion de imagen ampliamente adoptado; licencia restrictiva para uso comercial |
| Qwen-Image (Alibaba) | ~20 B | Apache 2.0 | Hugging Face, ModelScope | en, zh | Modelo unificado de generacion y edicion; mayor tamano |
| Stable Diffusion 3.5 Large | ~8,1 B | Stability Community License | Hugging Face, diffusers | principalmente en | Licencia con condiciones de uso comercial sujetas a umbrales de facturacion |

La comparacion de rendimiento (calidad de imagen, fidelidad al prompt, exactitud de texto renderizado) no puede establecerse con los datos disponibles; la tabla se limita a parametros, licencia, disponibilidad e idiomas.

## Limitaciones y advertencias

- Modelo de investigacion: la propia model card indica que Boogu-Image-0.1 es un proyecto de investigacion y no un lanzamiento oficial de modelo.
- Ausencia de benchmarks publicos en la informacion disponible: no se pueden verificar objetivamente sus prestaciones frente a alternativas.
- Riesgo de alucinacion visual: como modelo generativo de imagen, puede producir contenido incorrecto, incoherente o distinto al prompt, sin mecanismo de verificacion en la salida.
- Sesgos potenciales: no se documentan en la informacion disponible los sesgos del dataset de entrenamiento ni las medidas de mitigacion.
- Idiomas: el soporte declarado se limita a ingles y chino; no hay confirmacion de soporte de castellano para el texto renderizado dentro de la imagen.
- Licencia: Apache 2.0 permite uso comercial, pero conviene verificar la procedencia de los datos de entrenamiento y el cumplimiento normativo.
- Aviso del autor sobre servicios no oficiales: existen productos o servicios de pago que usan el nombre "Boogu-Image" sin afiliacion al proyecto.
- Incidencias conocidas: la model card menciona hotfixes para la variante Turbo (revision `hotfix-20260625`) por artefactos visuales, por lo que conviene usar checkpoints corregidos y no la version inicial.
- Repositorio con 0 descargas y 0 likes en el momento del analisis: sin validacion de la comunidad, lo que dificulta contrastar su comportamiento real.

## Enlaces

- Hugging Face: https://huggingface.co/Jinstudio/Boogu-Image-0.1-Turbo
- Hugging Face (organizacion Boogu): https://huggingface.co/Boogu
- Informe tecnico (arXiv): https://arxiv.org/abs/2607.13125
- Pagina del proyecto: https://boogu.org
- Repositorio GitHub: https://github.com/boogu-project/Boogu-Image
- ModelScope: https://modelscope.cn/organization/Boogu
- Galeria: https://boogu-gallery.netlify.app/
- Demo Base: http://demo-base.boogu.org/
- Demo Edit: http://demo-edit.boogu.org/
- Demo Turbo: http://demo-turbo.boogu.org/
- Demo Edit Turbo 1K: https://demo-edit-turbo-1k.boogu.org/
- Demo Edit Turbo 1K5: https://demo-edit-turbo-1k5.boogu.org/
- Receta vLLM-Omni para Boogu-Image: https://github.com/vllm-project/vllm-omni/blob/main/recipes/Boogu/Boogu-Image.md
- Revision del hotfix de Turbo: https://huggingface.co/Boogu/Boogu-Image-0.1-Turbo/tree/hotfix-20260625
