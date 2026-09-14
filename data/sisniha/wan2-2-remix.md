# sisniha/wan2.2-Remix

## Resumen

Wan2.2-Remix es un modelo de generacion de video publicado por el usuario sisniha en Hugging Face, construido como un remix (mezcla de pesos y fine-tune) sobre Wan-AI/Wan2.1-T2V-14B y Wan-AI/Wan2.1-I2V-14B, con checkpoints derivados de la familia Wan 2.2 (Wan2.2-T2V-A14B en su variante Lightning de 4 pasos y los repaquetizados de Comfy-Org). El objetivo declarado es generar clips cortos y cinematograficos tanto desde texto (T2V) como desde una imagen (I2V), con enfasis en dinamica humana, movimiento realista y consistencia de escena, sin necesidad de configurar LoRA adicionales.

Segun su propia model card, el modelo incorpora capacidades NSFW de serie y esta orientado a investigacion y creacion artistica. La publicacion esta en fase beta, no acumula descargas ni likes en el momento de la consulta y el repositorio ocupa 314,4 GB, lo que indica que incluye varios checkpoints (modelo de alto ruido y de bajo ruido) en fp8 y fp16, ademas de LoRA de movimiento y pose fusionados.

Resulta relevante como ejemplo del patron dominante en el video generativo abierto: remixes comunitarios que combinan una base Wan 2.2 con LoRA de movimiento, cuantizacion fp8 y compatibilidad con lightx2v para reducir el coste de inferencia. La contrapartida es la escasez de informacion tecnica publicada: no hay benchmarks, no se detallan tokens de entrenamiento ni composicion del dataset, y la licencia queda como "other" sin especificar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Difusion para generacion de video (familia Wan); el autor no detalla la arquitectura interna |
| Parametros totales | No disponible con precision; los modelos base declarados son de 14 000 millones de parametros (Wan2.1-T2V-14B y Wan2.1-I2V-14B) |
| Parametros activos | No disponible; la nomenclatura A14B de la familia Wan 2.2 apunta a una arquitectura de mezcla de expertos, pero la ficha del autor no lo confirma |
| Longitud de contexto | No disponible (no aplicable en el sentido de LLM: genera clips, sin duracion ni resolucion maxima declaradas) |
| Tipos de cuantizacion | fp8 (modelo de alto ruido T2V, modelo de alto ruido I2V y modelo de bajo ruido) y fp16 (repaquetizado de Comfy-Org) |
| Idiomas soportados | No disponible (el texto se codifica con un UMT5-XXL, pero el autor no enumera idiomas) |
| Licencia | other, sin detallar. Los metadatos de Hugging Face lo marcan como not-for-all-audiences, mientras que el frontmatter de la model card indica nfaa: false |
| Formato de pesos | No disponible de forma explicita; se referencian checkpoints cuantizados fp8 y fp16 de la familia Wan 2.2 |
| Tamano del repositorio | 314,4 GB |
| Descargas / likes | 0 / 0 |
| Libreria declarada | wan2.2 |

## Arquitectura y entrenamiento

El autor no describe la arquitectura interna del modelo. Por los materiales enlazados se deduce que se apoya en la pila Wan 2.2: un modelo de alto ruido para T2V (Lightx2v Wan2.2 Lightning, version dyno, cuantizado a fp8), un modelo de alto ruido para I2V y un modelo de bajo ruido, ambos del repaquetizado de Comfy-Org en fp16 y cuantizados a fp8. El pipeline resultante es el tipico de la familia Wan 2.2, con dos etapas de ruido y decodificacion de video.

En cuanto al entrenamiento, la model card solo indica que el modelo se ha "mezclado con datos de LoRA de movimiento de codigo abierto" y refinado con entrenamiento de pose para mejorar el realismo, la precision anatomica y la diversidad de gestos. Se mencionan ademas dos elementos concretos en el changelog de la version I2V v3.0: la incorporacion de un LoRA VBVR para mejorar la comprension espacial y la consistencia de escena, y la introduccion de una optimizacion con UnifiedReward. No se publican numero de tokens, composicion del dataset, ni si hubo etapas de RLHF o DPO.

## Capacidades

- Generacion de video a partir de texto (T2V): clips cortos de estilo cinematografico.
- Generacion de video a partir de imagen (I2V): animacion de una imagen de entrada manteniendo la identidad visual.
- Enfasis declarado en dinamica humana, movimiento realista y consistencia de escena, sin configuracion adicional de LoRA.
- Generacion de contenido NSFW integrada, sin LoRA externos segun el autor.
- Inferencia acelerada: el checkpoint de alto ruido T2V esta basado en Wan2.2 Lightning en su variante de 4 pasos (dyno).
- Compatibilidad declarada con lightx2v sin configuracion extra.
- Integracion en flujos largos: los workflows enlazados incluyen "long video" y "automatic reverse" (SVI2Pro) para extender la duracion.
- Flujo conjunto con modelos de lenguaje: existe un workflow Comfy-Qwen3 publicado por el autor.
- Codificador de texto recomendado por el autor: NSFW-Wan-UMT5-XXL.

## Casos de uso

- Generacion de clips publicitarios cortos: partiendo de un brief de texto, el modelo produce tomas de producto o de persona con movimiento realista, aprovechando la via T2V y la coherencia de escena declarada.
- Animacion de fotografia fija para redes sociales: la via I2V permite convertir un retrato o una fotografia de producto en un clip breve sin reentrenar nada.
- Previsualizacion de storyboards en produccion audiovisual: generar planos de prueba para validar encuadre, ritmo y continuidad antes de rodar.
- Efectos y planos de relleno en postproduccion: crear insertos de corta duracion que se integren en un montaje real, usando el modelo como generador de material auxiliar.
- Prototipado de videojuegos y experiencias interactivas: generar animaciones de personajes y escenas para maquetas jugables.
- Contenido artistico y de autor: la orientacion explicita del modelo a la creacion artistica y a contenido NSFW lo situa en el nicho de la ilustracion y el video para adultos, donde evita depender de LoRA de terceros.
- Flujos de video largo automatizados: con los workflows de "automatic reverse" y SVI2Pro enlazados por el autor, se pueden encadenar clips para construir piezas mas largas de forma semiautomatica.
- Investigacion sobre mezcla de LoRA: sirve como caso de estudio reproducible de como se fusionan LoRA de movimiento y pose sobre una base Wan 2.2 y como afecta la cuantizacion fp8 al resultado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas objetivas (FVD, CLIP score, VBench u otras) ni comparaciones cuantitativas con otros modelos. Los resultados de la busqueda web realizada no aportan datos relevantes sobre este modelo.

## Requisitos de hardware

- Tamano del repositorio completo: 314,4 GB, ya que incluye varios checkpoints (alto ruido T2V, alto ruido I2V y bajo ruido) en fp8 y fp16.
- Inferencia en fp16: cada checkpoint de 14B ronda los 28 GB, por lo que el pipeline completo (alto y bajo ruido) supera ampliamente los 24 GB de una RTX 4090 sin offloading.
- Inferencia en fp8: cada checkpoint baja a aproximadamente 14 GB, de modo que un pipeline de dos etapas necesita del orden de 28-30 GB de VRAM, mas el codificador de texto UMT5-XXL y el decodificador VAE.
- GPU recomendadas: A100 80 GB, H100 80 GB o tarjetas de 48 GB para ejecutar el pipeline completo con holgura. En RTX 4090 (24 GB) es necesario el modo de cuantizacion fp8 junto con offloading a RAM o uso de versiones Lightning de pocos pasos.
- El propio autor promociona el uso en entornos cloud con 48 GB de VRAM (RunningHub), lo que sugiere que 24 GB no es suficiente para el flujo completo tal cual se distribuye.
- Opciones de despliegue: ComfyUI (los checkpoints proceden del repaquetizado de Comfy-Org) y lightx2v, que el autor declara compatible sin configuracion adicional. Los workflows publicados se ejecutan sobre RunningHub.
- No aplican aqui herramientas de servido de LLM como vLLM, TGI, llama.cpp u Ollama: es un modelo de difusion de video, no un transformer autoregresivo de texto.
- Latencia y throughput: no disponibles. El uso de la variante Lightning de 4 pasos apunta a una reduccion del numero de pasos de muestreo, pero no se publican tiempos medidos.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / duracion | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| sisniha/wan2.2-Remix | Base de 14B por checkpoint, sin confirmar el total | No disponible | Sin benchmarks publicados | other, sin detallar | Hugging Face, 0 descargas, beta |
| Wan-AI/Wan2.1-T2V-14B (base declarada) | 14 000 millones | No disponible en esta ficha | No disponible | Licencia propia de Wan | Publico en Hugging Face |
| Wan-AI/Wan2.1-I2V-14B (base declarada) | 14 000 millones | No disponible en esta ficha | No disponible | Licencia propia de Wan | Publico en Hugging Face |
| Wan 2.2 A14B (familia de la que proceden los checkpoints) | No disponible en esta ficha | No disponible en esta ficha | No disponible | Licencia propia de Wan | Publico en Hugging Face y Comfy-Org |

No se dispone de datos suficientes para una comparacion cuantitativa con alternativas de la misma categoria (por ejemplo, otros modelos abiertos de T2V/I2V), ya que ni la model card ni la busqueda web aportan metricas objetivas.

## Limitaciones y advertencias

- Ausencia total de benchmarks: no hay ninguna metrica publicada que permita estimar calidad, coherencia temporal o fidelidad al prompt.
- Sesgos: no se documenta la composicion del dataset de entrenamiento ni de los LoRA fusionados, por lo que no es posible evaluar sesgos demograficos, culturales o de representacion.
- Riesgo de artefactos: en modelos de difusion de video son habituales las incoherencias anatomicas, el parpadeo entre fotogramas, la deformacion de manos y las transiciones bruscas; el autor afirma haber refinado el entrenamiento de pose para mitigarlo, pero no aporta evidencia.
- Duracion: no se declara la longitud maxima de clip soportada; los flujos de "video largo" dependen de workflows externos de encadenado.
- Idioma: no se especifican los idiomas soportados en los prompts de texto; el comportamiento multilingue es, por tanto, no verificado.
- Contenido NSFW: el modelo genera material para adultos de forma nativa. Requiere controles de acceso, filtrado y cumplimiento de la normativa aplicable (por ejemplo, verificacion de edad y legislacion sobre contenido generado). Los metadatos de Hugging Face lo etiquetan como not-for-all-audiences, mientras que el frontmatter de la model card indica nfaa: false: esta contradiccion debe resolverse antes de cualquier despliegue.
- Licencia: figura como "other" sin texto especifico en la informacion disponible. Al derivar de modelos Wan, es imprescindible revisar los terminos de la licencia original de Wan antes de cualquier uso comercial.
- Madurez: el autor declara explicitamente que el modelo esta en fase beta. Con cero descargas y cero likes, no hay evidencia de uso en produccion ni validacion por parte de la comunidad.
- Peso del repositorio: 314,4 GB dificultan el despliegue en infraestructura propia y encarecen el almacenamiento y la transferencia.
- Metadatos anomalos: la fecha de creacion declarada (13 de septiembre de 2026) es posterior a la fecha habitual de publicacion, lo que sugiere un error de registro o una republicacion.
- La busqueda web realizada no devolvio ninguna fuente relevante sobre este modelo; todos los resultados correspondian a una plataforma de streaming ajena al contenido.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/sisniha/wan2.2-Remix
- Modelo base T2V declarado: https://huggingface.co/Wan-AI/Wan2.1-T2V-14B
- Modelo base I2V declarado: https://huggingface.co/Wan-AI/Wan2.1-I2V-14B
- Lightx2v Wan2.2 Lightning (version dyno, fp8): https://huggingface.co/lightx2v/Wan2.2-Lightning/tree/main/Wan2.2-T2V-A14B-4steps-250928-dyno
- Repositorio de lightx2v: https://huggingface.co/lightx2v/Wan2.2-Lightning
- Repaquetizado de Comfy-Org para Wan 2.2: https://huggingface.co/Comfy-Org/Wan_2.2_ComfyUI_Repackaged/tree/main/split_files/diffusion_models
- Codificador de texto recomendado (NSFW-Wan-UMT5-XXL): https://huggingface.co/NSFW-API/NSFW-Wan-UMT5-XXL/tree/main
- Grupo de Telegram del autor: https://t.me/wan22remix
- Ficha en Civitai: https://civitai.com/models/2003153
- Workflow online I2V 3.0 (automatic reverse): https://www.runninghub.ai/post/2033536710499373058/?inviteCode=rh-v1325
- Workflow online I2V v2.1 SVI2Pro (video largo): https://www.runninghub.ai/post/2008833586203463682/?inviteCode=rh-v1325
- Workflow online I2V Comfy-Qwen3: https://www.runninghub.ai/post/1986632318448267265/?inviteCode=rh-v1325
- Workflow online T2V v2.0: https://www.runninghub.ai/post/1991533843182264322/?inviteCode=rh-v1325
