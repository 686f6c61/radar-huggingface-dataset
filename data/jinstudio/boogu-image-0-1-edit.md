# Jinstudio/Boogu-Image-0.1-Edit

## Resumen

Boogu-Image-0.1-Edit es el checkpoint de edición de imagen (pipeline image-to-image) de la familia Boogu-Image-0.1, una colección open source publicada bajo licencia Apache-2.0 por el equipo Boogu. El modelo resuelve la edición de imágenes guiada por instrucciones en lenguaje natural: modificación de contenido, eliminación de objetos, sustitución de elementos y renderizado de texto, con soporte explícito de inglés y chino. El repositorio analizado, Jinstudio/Boogu-Image-0.1-Edit, es una copia publicada por el usuario Jinstudio del checkpoint oficial del equipo Boogu (la model card y los enlaces apuntan a la organización Boogu).

La familia Boogu-Image-0.1 se plantea como un sistema unificado de generación y edición de imágenes e incluye las variantes Base, Turbo, Edit y Edit-Turbo, además de otros derivados. El equipo autor sostiene que, con un presupuesto de cómputo muy inferior al de los sistemas cerrados (Nano Banana Pro, GPT-Image-2), la mejora sistemática de la capacidad de comprensión, la calidad de los datos y el pipeline de entrenamiento permite aproximarse al rendimiento de esos sistemas. Según la propia model card, la escala de datos de entrenamiento es aproximadamente un orden de magnitud menor que la de otros modelos open source comparables.

El checkpoint tiene 10.292.556.288 parámetros reales (unos 10,3 mil millones) según los pesos en safetensors, con un repositorio de 38,5 GB. Se distribuye en formato diffusers y se integra mediante la clase BooguImagePipeline. Es relevante ahora porque ofrece edición de imagen de gama alta con licencia permisiva y soporte multilingüe en/zh, en un momento en que la edición de imágenes open source compite directamente con servicios propietarios. El equipo lo describe explícitamente como un proyecto de investigación y no como un lanzamiento oficial de modelo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible. Modelo de difusion para edicion de imagen (pipeline image-to-image); el tipo concreto de backbone (DiT, MMDiT, etc.) no se detalla en la informacion proporcionada |
| Parametros totales | 10.292.556.288 (~10,3 mil millones), segun los pesos en safetensors |
| Parametros activos | No disponible (no se describe una arquitectura MoE) |
| Longitud de contexto | No disponible (no aplica como contexto de LLM; no se documenta la longitud de prompt soportada) |
| Tipos de cuantizacion | No disponible (el repositorio publica safetensors; no se documentan variantes cuantizadas GGUF, int8 ni int4) |
| Idiomas soportados | Ingles (en) y chino (zh), incluido renderizado de texto chino-ingles |
| Licencia | Apache-2.0 |
| Formato de pesos | Safetensors, libreria diffusers (BooguImagePipeline) |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna del modelo (no se especifica si emplea un transformer de difusion, UNet o un esquema hibrido, ni el numero de bloques, atencion o mecanismos de condicionamiento). Lo que si se documenta es su encaje: es un modelo de difusion para edicion de imagen que se ejecuta mediante la libreria diffusers con el pipeline BooguImagePipeline, y forma parte de una familia unificada que cubre generacion texto-a-imagen (Base, Turbo) y edicion imagen-a-imagen (Edit, Edit-Turbo). La variante Edit-Turbo de la misma familia es una destilacion de cuatro pasos orientada a inferencia rapida, lo que sugiere que la familia combina checkpoints completos con versiones destiladas.

En cuanto al entrenamiento, la model card indica que la escala de datos empleada es aproximadamente un orden de magnitud menor que la de algunos modelos open source existentes, y que el equipo compensa esa limitacion con mejoras sistematicas en tres frentes: capacidad de comprension del modelo, calidad de los datos y diseno del pipeline de entrenamiento. No se aportan en la informacion proporcionada el numero exacto de tokens o pares de entrenamiento, la composicion del dataset, ni si se aplicaron tecnicas de alineacion como RLHF o DPO. Tampoco se describen innovaciones tecnicas concretas (atencion lineal, decodificacion especulativa u otras) mas alla del enfoque de "comprension + datos + pipeline".

## Capacidades

- Edicion de imagen guiada por instrucciones en lenguaje natural sobre una imagen de entrada (pipeline image-to-image).
- Tareas de edicion especificas mencionadas en la model card: eliminacion de elementos, modificacion de contenido y correccion de calidad de imagen.
- Renderizado de texto en imagen con soporte para chino e ingles, una capacidad poco frecuente en modelos open source de su categoria.
- Soporte bilingue declarado: ingles (en) y chino (zh).
- Integracion con el ecosistema diffusers mediante BooguImagePipeline.
- Compatibilidad con servidores de inferencia: recetas oficiales para vLLM-Omni.
- Soporte experimental de backend NPU mediante una rama especifica del repositorio.
- Variante destilada de cuatro pasos disponible en la misma familia (Edit-Turbo) para escenarios de baja latencia.
- No se documentan en la informacion disponible capacidades de tool calling, function calling, agentes, razonamiento multi-paso, vision general, audio ni modo "thinking"; se trata de un modelo de generacion y edicion de imagen, no de un modelo de lenguaje.

## Casos de uso

- Edicion de producto en comercio electronico: el modelo permite sustituir fondos, retirar elementos no deseados o ajustar acabados sobre fotografias de catalogo, manteniendo el objeto principal. Es adecuado porque trabaja directamente sobre imagen de entrada (image-to-image) sin necesidad de reconstruir la escena desde cero.
- Eliminacion de objetos en fotografia y retoque profesional: la model card cita explicitamente las tareas de eliminacion ("removal") como una de las capacidades corregidas en los hotfixes de la familia. Util para limpieza de imagenes de archivo, inmobiliaria o fotoperiodismo.
- Localizacion de creatividades con texto incrustado: el renderizado de texto en chino e ingles permite generar y editar banners, carteles y maquetas publicitarias sin recurrir a edicion manual de tipografia; el equipo mantiene demos online especificas de edicion.
- Previsualizacion rapida en flujos de diseno grafico: integrado via diffusers en herramientas internas, permite iterar variaciones sobre un boceto o una imagen base antes de pasar a produccion final.
- Generacion de variantes para pruebas A/B de marketing: a partir de una imagen aprobada, producir versiones con cambios controlados (color, encuadre, texto) para medir rendimiento de campanas, aprovechando la licencia Apache-2.0 para uso comercial.
- Pipelines de aumento de datos para investigacion en vision por computador: la edicion controlada de imagenes permite construir conjuntos anotados con variaciones sistematicas, con la ventaja de que los pesos son abiertos y auditables.
- Despliegue en infraestructura soberana o con requisitos de privacidad: al poder ejecutarse en local con diffusers o vLLM-Omni, el modelo evita enviar imagenes a APIs de terceros, lo relevante en sectores como salud, banca o administracion publica.
- Prototipado sobre hardware no convencional: la rama NPU permite explorar inferencia en aceleradores distintos de las GPU NVIDIA, util en entornos con restricciones de suministro o coste.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye tablas comparativas con metricas como FID, CLIP-score, GenEval, o evaluaciones de edicion tipo ImgEdit o GEdit-Bench, ni comparaciones numericas frente a otros modelos de edicion de imagen.

No se han documentado tampoco mediciones de latencia, throughput ni consumo de memoria en la informacion proporcionada.

## Requisitos de hardware

Las cifras de VRAM que siguen son estimaciones derivadas del recuento real de parametros (10.292.556.288) y no constituyen datos publicados por el autor:

- Pesos en fp32: aproximadamente 41 GB solo para los pesos; inviable en GPU de consumo.
- Pesos en bf16/fp16: aproximadamente 20,6 GB, mas activaciones y el VAE (habitualmente varios GB adicionales a resoluciones de 1024 px o superiores). El repositorio completo ocupa 38,5 GB.
- Pesos en int8/fp8: aproximadamente 10,3 GB, sin contar activaciones ni codecs.
- Pesos en int4: aproximadamente 5,1 GB, sin contar activaciones; requiere cuantizacion externa, ya que no se documentan variantes cuantizadas en el repositorio.
- Cabe en GPU de consumo con 24 GB (RTX 3090, RTX 4090) en bf16 con margen ajustado, y con mas holgura si se aplica cuantizacion a 8 bits. Las tarjetas de 16 GB requeririan cuantizacion y probablemente offloading.
- GPU profesionales recomendadas para produccion: A100 40/80 GB, H100, L40S o A6000, especialmente si se procesan lotes o resoluciones altas.
- Opciones de despliegue documentadas: diffusers con BooguImagePipeline, servidor de inferencia vLLM-Omni (existe una receta oficial) y backend NPU mediante la rama npu del repositorio.
- No se documenta soporte para llama.cpp, Ollama ni GGUF, formatos propios de modelos de lenguaje y no del pipeline de difusion empleado aqui.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

La informacion proporcionada no incluye especificaciones de modelos competidores, por lo que la comparacion se limita a las variantes de la propia familia y a los sistemas cerrados citados en la model card.

| Modelo | Tipo | Parametros | Contexto o resolucion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Boogu-Image-0.1-Edit | Edicion imagen-a-imagen | 10,3 mil millones (dato real de safetensors) | No disponible | Apache-2.0 | Hugging Face, diffusers, vLLM-Omni |
| Boogu-Image-0.1-Edit-Turbo | Edicion imagen-a-imagen destilada a 4 pasos | No disponible | No disponible | Apache-2.0 | Hugging Face, demos online (1K y 1.5K) |
| Boogu-Image-0.1-Base | Generacion texto-a-imagen | No disponible | No disponible | Apache-2.0 | Hugging Face |
| Boogu-Image-0.1-Turbo | Generacion texto-a-imagen rapida | No disponible | No disponible | Apache-2.0 | Hugging Face (revision hotfix-20260625) |
| Nano Banana Pro | Sistema multimodal cerrado de comprension y generacion | No disponible | No disponible | Propietaria | Solo API |
| GPT-Image-2 | Sistema multimodal cerrado de comprension y generacion | No disponible | No disponible | Propietaria | Solo API |

No se dispone de datos de rendimiento comparativos entre estas opciones en la informacion analizada. La unica afirmacion cuantitativa del autor es que la escala de datos de entrenamiento es aproximadamente un orden de magnitud menor que la de otros modelos open source, compensada mediante mejoras de comprension, datos y pipeline.

## Limitaciones y advertencias

- Proyecto de investigacion: la propia model card advierte de que Boogu-Image-0.1 no es un lanzamiento oficial de modelo, sino un proyecto de investigacion, lo que implica menor garantia de estabilidad y soporte que un producto comercial.
- Advertencia sobre servicios no oficiales: el equipo Boogu declara no ofrecer API de pago, suscripcion ni servicio comercial alguno bajo la marca Boogu-Image, y alerta de productos de pago no afiliados. Conviene verificar la procedencia de cualquier servicio que use ese nombre.
- Repositorio duplicado: el checkpoint analizado esta publicado por el usuario Jinstudio y presenta 0 descargas y 0 likes. No consta verificacion de que sea identico al checkpoint oficial de la organizacion Boogu; para produccion conviene partir del repositorio original.
- Historial de errores corregidos: la misma familia ha requerido hotfixes por degradacion severa de calidad de imagen y por mal rendimiento en tareas de eliminacion (revisiones hotfix-1k-20260708 y hotfix-1k5-20260708 para Edit-Turbo, y hotfix-20260625 para Turbo). Es un indicativo de que las versiones sin parche pueden presentar artefactos.
- Escala de datos reducida: al entrenarse con aproximadamente un orden de magnitud menos de datos que otros modelos open source, cabe esperar menor cobertura de conceptos raros, estilos poco frecuentes o composiciones complejas.
- Riesgo de artefactos y deriva semantica: en modelos de difusion el fallo tipico no es la alucinacion textual, sino la generacion de detalles inexistentes, alteracion de identidad de personas, deformacion de texto o cambios no solicitados fuera de la region editada. La model card no documenta mitigaciones especificas.
- Cobertura idiomatica limitada: solo ingles y chino. No se declara soporte de castellano ni de otras lenguas, por lo que los prompts en espanol pueden degradar el resultado.
- Trazabilidad de datos de entrenamiento: no se especifica la composicion del dataset ni si se filtraron sesgos de representacion demografica, lo que dificulta evaluar sesgos sistematicos en la generacion de personas o culturas.
- Licencia: Apache-2.0 permite uso comercial, modificacion y redistribucion con atribucion y sin garantia. No se declaran restricciones adicionales, aunque la condicion de "proyecto de investigacion" y la ausencia de datos de entrenamiento publicados limitan la auditabilidad para entornos regulados.
- Ausencia de metricas: sin benchmarks publicados no es posible validar de forma independiente la calidad frente a alternativas, lo que obliga a evaluar con datos propios antes de adoptarlo en produccion.
- Licencia del codigo frente a la de los pesos: aunque el repositorio declara Apache-2.0, conviene revisar el archivo LICENSE del proyecto para confirmar que cubre pesos, codigo de inferencia y assets.

## Enlaces

- Modelo en Hugging Face (copia analizada): https://huggingface.co/Jinstudio/Boogu-Image-0.1-Edit
- Organizacion oficial del equipo Boogu en Hugging Face: https://huggingface.co/Boogu
- Informe tecnico (arXiv): https://arxiv.org/abs/2607.13125
- Pagina del proyecto: https://boogu.org
- Repositorio en GitHub: https://github.com/boogu-project/Boogu-Image
- ModelScope: https://modelscope.cn/organization/Boogu
- Galeria de ejemplos: https://boogu-gallery.netlify.app/
- Demo de generacion (Base): http://demo-base.boogu.org/
- Demo de edicion: http://demo-edit.boogu.org/
- Demo Turbo: http://demo-turbo.boogu.org/
- Demo Edit Turbo 1K: https://demo-edit-turbo-1k.boogu.org/
- Demo Edit Turbo 1.5K: https://demo-edit-turbo-1k5.boogu.org/
- Receta de vLLM-Omni para Boogu-Image: https://github.com/vllm-project/vllm-omni/blob/main/recipes/Boogu/Boogu-Image.md
- Rama NPU (soporte inicial de backend NPU): rama `npu` del repositorio de GitHub
- Revisiones hotfix del checkpoint Edit-Turbo: https://huggingface.co/Boogu/Boogu-Image-0.1-Edit-Turbo/tree/hotfix-1k-20260708 y https://huggingface.co/Boogu/Boogu-Image-0.1-Edit-Turbo/tree/hotfix-1k5-20260708
- Revision hotfix del checkpoint Turbo: https://huggingface.co/Boogu/Boogu-Image-0.1-Turbo/tree/hotfix-20260625
