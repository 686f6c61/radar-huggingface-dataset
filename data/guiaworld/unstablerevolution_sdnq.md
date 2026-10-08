# GuiAworld/unstableRevolution_SDNQ

## Resumen

GuiAworld/unstableRevolution_SDNQ es un checkpoint de difusion para edicion de imagen (pipeline image-to-image) construido sobre la arquitectura FLUX.2 Klein Edit y adaptado al formato de cuantizacion SDNQ (SD.Next Quantization Engine). Lo publica el usuario GuiAworld en Hugging Face y parte de un checkpoint de Civitai denominado "Unstable Revolution F2K 4B Alpha", descrito por su autor como el segundo checkpoint de Klein Edit mas popular de esa plataforma.

El modelo resuelve un problema muy concreto: ejecutar un modelo de edicion de imagen de la familia FLUX.2 Klein en hardware de gama baja, en concreto en una GPU Tesla T4 de Google Colab (16 GB de VRAM). La cuantizacion SDNQ almacena los pesos a 4-5 bits con una correccion SVD de bajo rango opcional, lo que reduce drasticamente el consumo de memoria y permite la inferencia en GPUs de consumo sin necesidad de instalar paquetes Python adicionales en el caso de InvokeAI.

El repositorio declara 2.159.894.016 parametros en los ficheros safetensors y un tamano total de 21,4 GB. Se publico el 8 de octubre de 2026 y en el momento de redactar esta ficha acumula 0 descargas y 0 me gusta, por lo que no existe validacion comunitaria ni documentacion tecnica detallada. La licencia y los idiomas soportados no estan declarados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de difusion gestionado por el pipeline diffusers:Flux2KleinPipeline, derivado de FLUX.2 Klein Edit |
| Parametros totales | 2.159.894.016 (segun los ficheros safetensors del repositorio) |
| Parametros activos | no aplica (no es un modelo de mezcla de expertos) |
| Longitud de contexto | no disponible (no es un modelo de lenguaje; no se documenta la resolucion de imagen soportada) |
| Tipos de cuantizacion | SDNQ de 4-5 bits con correccion SVD de bajo rango opcional; la etiqueta del repositorio indica 8-bit y el cuaderno de referencia menciona un checkpoint "4bit-dynamic" |
| Idiomas soportados | no disponible (el prompt de edicion se procesa mediante el codificador de texto del pipeline, sin idiomas declarados) |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Tamano del repositorio | 21,4 GB |
| Tipo de pipeline | image-to-image |
| Libreria | diffusers |

## Arquitectura y entrenamiento

El modelo pertenece a la familia de transformers de difusion introducida por FLUX.2, en su variante Klein Edit, orientada a edicion de imagenes guiada por instrucciones en lugar de generacion pura desde ruido. El pipeline declarado es diffusers:Flux2KleinPipeline, lo que implica un transformer de difusion acompanado de un codificador de texto y un VAE, integrados en el flujo habitual de diffusers.

La innovacion principal de esta publicacion no esta en la arquitectura, sino en la adaptacion de los pesos al esquema SDNQ. Segun la documentacion de InvokeAI, SDNQ almacena los pesos del modelo a 4-5 bits con una correccion SVD de bajo rango opcional, y InvokeAI carga estos modelos como pipelines completos de Hugging Face diffusers, desquantizandolos al vuelo durante la inferencia sin requerir un paquete Python adicional. Esto es lo que permite que un checkpoint derivado de FLUX.2 Klein funcione en una T4 de Colab.

No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset, el uso de RLHF/DPO ni el metodo exacto de ajuste empleado para producir el checkpoint "Unstable Revolution F2K 4B Alpha". Tampoco se documenta si se trata de un fine-tune completo, de una fusion de LoRA o de un ajuste sobre el modelo base. El recuento de parametros del safetensors (2,16 mil millones) no es coherente con el tamano del repositorio (21,4 GB), lo que sugiere que este ultimo incluye componentes adicionales, varias copias de los pesos o versiones en distintas precisiones.

## Capacidades

- Edicion de imagen a partir de una imagen de entrada y una instruccion textual (pipeline image-to-image).
- Reescribado y modulacion de la imagen de entrada conservando la identidad o la composicion original, comportamiento habitual de los modelos de la familia FLUX.2 Klein Edit.
- Integracion nativa con el ecosistema diffusers, incluyendo carga como pipeline completo.
- Despliegue cuantizado en 4-5 bits mediante SDNQ, con desquantizacion en tiempo de inferencia.
- Compatibilidad declarada con flujos de trabajo de InvokeAI mediante su soporte de SDNQ.
- No dispone de soporte documentado de tool calling, function calling, razonamiento multi-paso ni uso como agente.
- No es un modelo de lenguaje: no genera texto, no escribe codigo ni resuelve problemas matematicos.
- No se documentan capacidades multilingues, de audio, de video ni modos de pensamiento.

## Casos de uso

- Retoque fotografico por instrucciones: dado un retrato o una fotografia de producto, el modelo aplica cambios descritos en lenguaje natural (iluminacion, fondo, color) manteniendo la estructura de la imagen original.
- Restauracion de fotografias antiguas en un portatil con GPU de gama media, gracias a que el checkpoint esta cuantizado y no requiere aceleradores de datacenter.
- Generacion de variaciones de producto para comercio electronico: partiendo de una foto base, producir multiples versiones con fondos, angulos de iluminacion o entornos distintos sin volver a fotografiar el articulo.
- Prototipado de direccion de arte en concept art: iterar rapidamente sobre bocetos y referencias para explorar estilos visuales antes de una produccion final.
- Flujos de trabajo con ControlNet y edicion por mascara en InvokeAI o ComfyUI, aprovechando la carga de modelos SDNQ como pipelines de diffusers.
- Experimentacion en cuadernos de Google Colab con GPU T4 gratuita, que es el escenario declarado explicitamente por el autor y para el que existe un cuaderno publicado.
- Ajuste fino adicional sobre un modelo de edicion ya cuantizado y ligero, util para investigadores que quieran iterar sin disponer de un cluster.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

El repositorio no incluye metricas objetivas (FID, CLIP score, SSIM de edicion, evaluaciones tipo GEdit-Bench o similar) ni comparativas cuantitativas con el modelo base o con alternativas. Tampoco se documentan latencia ni throughput medidos.

## Requisitos de hardware

- Pesos del transformer: aproximadamente 1,1 GB a 4 bits y 2,2 GB a 8 bits, calculados a partir de los 2.159.894.016 parametros declarados. La memoria total necesaria es mayor, ya que hay que sumar el codificador de texto, el VAE y las activaciones de difusion.
- Hardware objetivo declarado: GPU Tesla T4 con 16 GB de VRAM en Google Colab. El propio autor indica que el modelo se adapto a SDNQ precisamente para poder ejecutarse en esa GPU.
- GPUs profesionales: A100 (40/80 GB), H100 (80 GB), L40S y L4 son holgadas para este tamano de modelo.
- GPUs de consumo compatibles previsiblemente: RTX 4090 y 3090 (24 GB), RTX 4080 (16 GB), RTX 4070 Ti Super (16 GB), RTX 3060 (12 GB) y, con cuantizacion de 4 bits, tarjetas de 8 GB como la RTX 4060 o la RTX 3070.
- Opciones de despliegue: diffusers (libreria declarada), InvokeAI con soporte SDNQ, y previsiblemente ComfyUI y otros frontends que carguen pipelines de diffusers. Existe un cuaderno de Google Colab publicado por el autor de la adaptacion a SDNQ.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / resolucion | Licencia | Disponibilidad |
|---|---|---|---|---|
| GuiAworld/unstableRevolution_SDNQ | 2,16 mil millones (safetensors) | no disponible | no disponible | Hugging Face, 0 descargas |
| FLUX.2 [klein] Edit (modelo base de referencia) | no disponible | no disponible | no disponible | no disponible en la informacion proporcionada |
| FLUX.1 Kontext [dev] | 12 mil millones (dato de conocimiento publico, no incluido en la busqueda) | edicion por instrucciones, contexto de imagen | licencia no comercial de FLUX.1 | Hugging Face y replicas |
| Qwen-Image-Edit | 20 mil millones (dato de conocimiento publico, no incluido en la busqueda) | edicion por instrucciones | Apache 2.0 | Hugging Face |

La comparativa anterior mezcla datos del repositorio analizado con datos de conocimiento general que no aparecen en los resultados de busqueda facilitados; deben verificarse antes de tomar decisiones de produccion. En terminos de tamano, este checkpoint es entre cinco y diez veces mas pequeno que las alternativas de edicion por instrucciones mas difundidas, lo que explica su capacidad de ejecucion en una T4, pero tambien anticipa una calidad y una fidelidad de edicion potencialmente inferiores. No hay datos objetivos que permitan confirmarlo.

## Limitaciones y advertencias

- La licencia no esta declarada, lo que impide determinar si el uso comercial esta permitido. Es un riesgo legal directo para cualquier despliegue en produccion.
- El modelo deriva de FLUX.2 Klein Edit; las condiciones de la licencia del modelo base y del checkpoint original de Civitai deberian verificarse de forma independiente.
- Cero descargas y cero me gusta en el momento de redactar esta ficha: no existe validacion de la comunidad ni evidencia de que el modelo funcione como se describe.
- El autor no publica model card detallada, dataset de entrenamiento, hiperparametros ni evaluacion cuantitativa.
- La cuantizacion a 4-5 bits con SDNQ introduce perdida de precision respecto al checkpoint original. Es esperable degradacion en detalles finos, texto dentro de la imagen y coherencia en ediciones complejas, aunque no hay mediciones publicadas.
- Riesgo de alucinacion visual: como todo modelo de difusion, puede introducir elementos no presentes en la imagen de entrada, deformar rostros, manos o texto, o ignorar partes de la instruccion.
- No se declaran idiomas soportados para el prompt de edicion, por lo que el comportamiento con instrucciones en castellano no esta garantizado.
- Los repositorios con 0 descargas pueden sufrir cambios, eliminaciones o reemplazos de pesos sin aviso, lo que rompe la reproducibilidad de pipelines en produccion.
- El enlace a Civitai proporcionado apunta al dominio civitai.red, un espejo del sitio original; conviene verificar la fuente antes de descargar.

## Enlaces

- Hugging Face: https://huggingface.co/GuiAworld/unstableRevolution_SDNQ
- Replica en Hugging Face: https://huggingface.co/codeShare/unstableRevolution_SDNQ
- Ficha original en Civitai: https://civitai.red/models/2355813/unstable-revolution-f2k-4b-alpha?modelVersionId=2650607
- Cuaderno de Google Colab de referencia: https://huggingface.co/codeShare/FLUX.2-klein-AIO-SDNQ-4bit-dynamic/blob/main/colab_notebooks/%E2%9A%99%EF%B8%8Frun_klein_edit_aio.ipynb
- Perfil de GitHub del autor: https://github.com/GuiAworld/
- Documentacion de cuantizacion SDNQ en InvokeAI: https://invoke.ai/configuration/sdnq-quantization/
