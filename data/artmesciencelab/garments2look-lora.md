# ArtmeScienceLab/Garments2Look-LoRA

## Resumen

Garments2Look-LoRA es un conjunto de dos adaptadores LoRA de rango 32 entrenados sobre el modelo base Qwen/Qwen-Image-Edit-2509 para virtual try-on a nivel de conjunto completo (outfit), es decir, no solo una prenda sino varias prendas y accesorios combinados en una sola imagen de salida. Lo desarrolla ArtmeScienceLab y se publica como adaptadores, no como modelo completo: para usarlo hay que descargar por separado el modelo base Qwen-Image-Edit-2509 y aplicar despues el checkpoint correspondiente.

El sistema resuelve un problema concreto del sector moda: dada una imagen de una persona y un collage OOTD (outfit of the day) con los articulos de referencia, generar una imagen de esa misma persona vistiendo el conjunto objetivo. Se ofrecen dos variantes de tarea: inpainting (la imagen de la persona llega con las regiones de ropa enmascaradas en gris 128) y editing (se parte de la persona con su ropa original y se sustituye por el conjunto de referencia).

Ambos checkpoints se entrenaron con 20.000 muestras durante 2 epocas y se distribuyen en formato safetensors dentro de un repositorio de 0,9 GB. La relevancia actual viene de que el flujo de dos referencias (persona + collage) con control explicito de orden de capas mediante prompt numerado es poco habitual en adaptadores publicos de try-on, aunque el proyecto es muy reciente y con adopcion practicamente nula (0 descargas, 1 like en el momento de redactar esta ficha).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptadores LoRA (rango 32) sobre Qwen/Qwen-Image-Edit-2509; arquitectura interna del modelo base no detallada en la informacion disponible |
| Parametros totales | no disponible (no se publica el recuento de parametros de los adaptadores; repositorio de 0,9 GB) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible; la entrada es de dos imagenes mas un prompt de texto, con imagenes alineadas a multiplos de 16 dentro de un presupuesto de 1.048.576 pixeles |
| Tipos de cuantizacion | no disponible; los checkpoints se distribuyen en safetensors y la cuantizacion aplicable depende del modelo base |
| Idiomas soportados | ingles (en) |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

Se trata de adaptadores LoRA de rango 32 sobre el modelo de edicion de imagen Qwen-Image-Edit-2509. Se publican dos checkpoints con nombres explicitos: `Qwen-Image-Edit-2509-LoRA-2-refer-20k-inpainting-epoch-1.safetensors` y `Qwen-Image-Edit-2509-LoRA-2-refer-20k-editing-epoch-1.safetensors`. En ambos casos el entrenamiento uso 20.000 muestras y 2 epocas completas; el sufijo `epoch-1` es zero-indexado, de modo que corresponde al checkpoint guardado tras la segunda epoca. El nombre `2-refer` indica la configuracion de dos referencias de entrada (imagen de la persona y collage OOTD).

La entrada del sistema son dos imagenes mas un prompt de texto que enumera los articulos con instrucciones de estilo y orden de capas. En la tarea de inpainting, la primera imagen es la persona con las regiones de ropa enmascaradas en gris con valor 128, y no se pasa una mascara separada al script de inferencia. En la tarea de editing, la primera imagen es la persona con su conjunto original, que se sustituye por el conjunto de referencia. El dataset asociado es ArtmeScienceLab/Garments2Look y existe un articulo asociado presentado como CVPR 2026. El entorno de entrenamiento e inferencia probado es Python 3.10, PyTorch 2.7.1 con CUDA 12.8 y una GPU NVIDIA H200. La model card indica que las actualizaciones de codigo y los ejemplos de entrenamiento estan preparados en local y pendientes de publicacion en el repositorio de GitHub.

## Capacidades

- Virtual try-on a nivel de conjunto completo: combina varias prendas y accesorios en una sola generacion, no una prenda aislada.
- Dos modos de tarea independientes con checkpoint propio: inpainting sobre imagen con regiones enmascaradas y editing sobre imagen con ropa original.
- Entrada de dos referencias simultaneas: imagen de persona y collage OOTD de los articulos objetivo.
- Seguimiento de prompt estructurado: el prompt enumera los articulos de forma numerada, indica instrucciones de estilo (por ejemplo, desabrochado, remetido) y define el orden de capas, como `(1) -> (6) -> (2)` en el ejemplo publicado.
- Preservacion de atributos en la tarea de inpainting: el ejemplo de la model card indica mantener identidad, pose y fondo de la figura 1 sin cambios.
- Generacion de imagen a imagen reproducible: semilla por defecto 123, 40 pasos de muestreo y escala de guia (CFG) 4.0, con guardado de un PNG y un JSON con el prompt y los parametros de cada ejecucion.
- Control de resolucion: las imagenes se alinean a multiplos de 16 dentro de un presupuesto de 1.048.576 pixeles.
- No se documenta soporte de tool calling, function calling, agentes, audio, vision general ni modo de razonamiento explicito.

## Casos de uso

- Catalogos de e-commerce: generar la misma prenda sobre distintas personas y poses a partir de una foto de estudio, reduciendo el coste de sesiones fotograficas por cada variante de color o talla.
- Probador virtual en tienda online: el usuario sube una foto propia y un collage con las prendas que quiere probar, y el modelo devuelve una previsualizacion del conjunto completo con accesorios.
- Estilismo asistido: dado un collage OOTD de referencia, producir la imagen de la persona vistiendo exactamente esa combinacion respetando el orden de capas indicado en el prompt, util para herramientas de recomendacion de outfits.
- Pruebas de surtido para compradores de moda: evaluar visualmente como funciona una combinacion de prendas y accesorios antes de fabricar o comprar stock, generando variantes sobre un mismo modelo.
- Marketing y redes sociales: crear imagenes de look completo por temporada o campana a partir de un collage de producto, manteniendo la identidad de la persona de referencia en la variante de inpainting.
- Aumento de datos para otros modelos: generar pares persona-conjunto etiquetados para entrenar sistemas de recomendacion, recuperacion visual o deteccion de prendas.
- Postproduccion de fotografia de producto: sustituir la ropa de una sesion ya realizada por prendas de un collage de referencia sin repetir el rodaje, usando el checkpoint de editing.
- Prototipado de diseno: visualizar como queda una prenda nueva combinada con el resto del outfit de una persona concreta antes de disponer de una muestra fisica.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye tablas comparativas (FID, CLIP, SSIM, LPIPS ni metricas especificas de try-on) ni comparaciones cuantitativas con otros sistemas de virtual try-on.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la informacion proporcionada. Solo se indica que el entorno probado es una NVIDIA H200.
- GPU de referencia: NVIDIA H200, con PyTorch 2.7.1 y CUDA 12.8 bajo Python 3.10.
- Los adaptadores LoRA en si ocupan poco (el repositorio completo pesa 0,9 GB), pero el modelo base Qwen-Image-Edit-2509 debe cargarse integro en memoria y no se documenta su huella de VRAM en la informacion disponible.
- Encaje en GPU de consumo: no confirmado; dado que el entorno de referencia es una H200, no hay datos que permitan afirmar que quepa en GPUs de consumo tipo RTX 4090.
- Opciones de despliegue: el proyecto proporciona un script propio (`scripts/inference/inference.py`) con `--task inpainting` o `--task editing`, `--model-dir`, `--lora`, `--origin`, `--ootd`, `--prompt-file`, `--output`, `--seed`, `--steps` y `--cfg-scale`. La libreria declarada es diffusers, por lo que la integracion pasa por ese ecosistema. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no son aplicables a este tipo de modelo.
- Latencia y throughput: no disponible. Los unicos parametros publicados son 40 pasos de muestreo y CFG 4.0 por generacion.
- Seleccion de GPU: se realiza mediante la variable de entorno `CUDA_VISIBLE_DEVICES`.

## Comparativa con modelos similares

No se dispone de datos de rendimiento ni de especificaciones de modelos comparables en la informacion proporcionada, por lo que no es posible establecer una comparativa fiable con alternativas de la misma categoria. La unica comparacion documentada es interna, entre los dos checkpoints del propio repositorio:

| Checkpoint | Tarea | Entrada figura 1 | Mascara | Entrenamiento |
|---|---|---|---|---|
| `...-inpainting-epoch-1.safetensors` | Inpainting | Persona con regiones de ropa enmascaradas en gris 128 | Implicita en la imagen | 20K muestras, 2 epocas, rango 32 |
| `...-editing-epoch-1.safetensors` | Editing | Persona con su conjunto original | No aplica | 20K muestras, 2 epocas, rango 32 |

## Limitaciones y advertencias

- Licencia no disponible: sin licencia declarada no se puede asumir permiso de uso comercial. Conviene contactar con el autor antes de integrarlo en produccion.
- Idioma limitado al ingles: los prompts y las instrucciones de estilo deben redactarse en ingles; no hay evidencia de soporte multilingue.
- Adopcion practicamente nula: 0 descargas y 1 like en el momento de redactar la ficha, sin comunidad que haya validado el comportamiento fuera del ejemplo publicado.
- Codigo pendiente de publicacion: la model card indica que las actualizaciones de codigo y los ejemplos de entrenamiento estan preparados en local y pendientes de subir al repositorio de GitHub, por lo que los comandos pueden no reproducirse tal cual.
- Dependencia fuerte del formato de entrada: en inpainting la mascara debe venir ya incrustada en la imagen como gris 128 y no se pasa como argumento aparte; en editing la imagen de origen debe mostrar ropa existente. Un uso incorrecto de ese contrato de entrada degrada el resultado.
- Sensibilidad al orden del collage: el orden de los articulos del collage debe coincidir con el prompt numerado, de lo contrario la correspondencia entre prenda y numero se rompe.
- Riesgo de alucinacion visual: no se publican metricas de fidelidad de prenda, textura, logotipos ni de preservacion de identidad, por lo que pueden aparecer artefactos, fusiones de prendas o cambios no deseados en la persona o el fondo.
- Sin benchmarks: no hay numeros que permitan estimar la calidad frente a alternativas comerciales o academicas de virtual try-on.
- Sesgos no evaluados: no se documenta ninguna evaluacion de sesgo por tono de piel, complexion, genero o tipo corporal, un aspecto critico en moda y una fuente habitual de fallos en este tipo de sistemas.
- Datos del articulo no verificables en esta busqueda: la referencia indicada es arXiv 2603.14153 (CVPR 2026) y la busqueda web realizada no devolvio resultados relevantes sobre el modelo, por lo que no se ha podido contrastar informacion adicional.
- Coste de inferencia alto: requiere cargar el modelo base completo y ejecutar 40 pasos de difusion por imagen, sin datos publicos de latencia.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ArtmeScienceLab/Garments2Look-LoRA
- Modelo base: https://huggingface.co/Qwen/Qwen-Image-Edit-2509
- Repositorio de codigo y entrenamiento: https://github.com/ArtmeScienceLab/Garments2Look
- Dataset: https://huggingface.co/datasets/ArtmeScienceLab/Garments2Look
- Articulo (CVPR 2026): https://arxiv.org/abs/2603.14153
