# realrebelai/Ming-Image_GGUFs

## Resumen

Ming-Image_GGUFs es un repositorio de cuantizaciones en formato GGUF del modelo de generacion de imagen a partir de texto Ming-Image-0.1-Design, desarrollado originalmente por el equipo inclusionAI. Lo publica el usuario realrebelai con el objetivo de hacer viable la inferencia local del modelo en ComfyUI sobre GPUs de gama media y baja VRAM, mediante el nodo comunitario ComfyUI-GGUF. El modelo de difusion subyacente tiene 6.154.901.056 parametros (~6,15B) y el repositorio completo ocupa 72,0 GB, ya que incluye la escalera completa de cuantizaciones junto con las variantes cuantizadas del encoder de texto.

La propuesta tecnica del repositorio no es una cuantizacion uniforme: emplea una politica de precision mixta denominada HQ, en la que los tensores criticos del modelo de difusion (embeddings de entrada y salida, condicionamiento temporal, modulacion adaLN y los dos stacks de refinamiento) se mantienen siempre en BF16, mientras que el resto de pesos se comprime de forma mas agresiva. El modelo de difusion se compone de 519 tensores, de los cuales 309 permanecen en BF16 en todas las variantes HQ, 120 corresponden a las proyecciones de atencion Q/K/V/O y 30 a la proyeccion descendente de la FFN.

El repositorio tambien incluye dos variantes de bajo consumo del encoder de texto Ling Mini 2.0, un modelo de mezcla de expertos de aproximadamente 17,3B parametros y 642 tensores. En la variante mas agresiva, el backbone no experto se mantiene en Q4_K_M mientras que los grandes bancos de expertos enrutados se comprimen a Q2_K, lo que concentra la perdida de precision en las matrices de expertos en lugar de aplicarla de forma indiscriminada. El interes actual del repositorio esta en que permite ejecutar un modelo de generacion de imagen de 6B con encoder MoE de 17B en hardware de consumo, algo que la version BF16 original no permite.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de difusion (DiT) con stacks de refinamiento (context_refiner, noise_refiner) y modulacion adaLN; encoder de texto Ling Mini 2.0 con mezcla de expertos (MoE) enrutados |
| Parametros totales | 6.154.901.056 (~6,15B) en el modelo de difusion; aproximadamente 17,3B adicionales en el encoder de texto Ling Mini 2.0 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (no se documenta el limite de tokens del prompt; no aplica en el mismo sentido que en un modelo de lenguaje) |
| Tipos de cuantizacion | Modelo de difusion: Q8_0-HQ, Q6_K-HQ, Q5_K_M-HQ, Q4_K_M-HQ, Q3_K_M-HQ y Q2_K-HQ. Encoder de texto: Q4_K_M-HQ y Q2_K-HQ |
| Idiomas soportados | no disponible |
| Licencia | MIT segun la model card del repositorio |
| Formato de pesos | GGUF (convertido desde los pesos originales en BF16) |

## Arquitectura y entrenamiento

El modelo de difusion sigue una arquitectura transformer de difusion con dos rutas de refinamiento diferenciadas: context_refiner para el contexto de condicionamiento y noise_refiner para la senal de ruido. La condicionamiento se inyecta mediante modulacion adaLN (los tensores `*.adaLN_modulation.*`), y la proyeccion del texto del prompt se realiza a traves de `cap_embedder`. La entrada y la salida se gestionan con `all_x_embedder` y `all_final_layer`, y el condicionamiento temporal con `t_embedder`. Todos estos grupos estan excluidos de la cuantizacion en las variantes HQ y se conservan en BF16 de forma permanente.

La construccion de las variantes HQ se realizo en cuatro pasos documentados: conversion de los pesos originales BF16 a un maestro GGUF que preserva la forma de los tensores, cuantizacion de ese maestro con `llama-quantize` para generar ficheros donantes en Q8_0, Q6_K, Q5_K_M, Q4_K_M, Q3_K_M y Q2_K, ensamblado de los modelos finales seleccionando tensores de esos donantes, y copia directa de los datos de tensor ya empaquetados sin descomprimir ni recomprimir. La escalera exacta es: Q8_0-HQ usa Q8_0 en atencion, FFN `w2` y bulk; Q6_K-HQ usa Q8_0 en atencion y `w2` con bulk Q6_K; Q5_K_M-HQ usa Q8_0 en atencion, Q6_K en `w2` y bulk Q5_K_M; Q4_K_M-HQ usa Q8_0 en atencion, Q6_K en `w2` y bulk Q4_K_M; Q3_K_M-HQ baja la atencion a Q6_K y `w2` a Q5_K_M; y Q2_K-HQ usa Q5_K_M en atencion, Q4_K_M en `w2` y Q2_K en el bulk. Por ejemplo, Q4_K_M-HQ se compone de 309 tensores BF16, 120 en Q8_0, 30 en Q6_K y 60 en Q4_K.

Un detalle tecnico relevante es que el metadato `general.architecture` de los GGUF se fijo a Lumina2 unicamente por compatibilidad con el cuantizador y el cargador; la model card advierte explicitamente de que no debe interpretarse que Ming-Image sea un modelo Lumina2. No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset, ni sobre si el modelo base utilizo RLHF, DPO u otra fase de alineamiento. El encoder de texto Ling Mini 2.0 contiene 38 tensores de expertos tridimensionales de gran tamano en las capas MoE enrutadas, y la model card indica que en una revision posterior se anadieron componentes de edicion que habian sido eliminados de los encoders en una version previa.

## Capacidades

- Generacion de imagen a partir de texto (text-to-image) mediante el pipeline etiquetado en HuggingFace, orientada por el sufijo Design del modelo base a tareas de diseno grafico y contenido visual.
- Ejecucion dentro de ComfyUI a traves del nodo ComfyUI-GGUF, con carga separada del modelo de difusion, el encoder de texto y el VAE.
- Cuantizacion en escalera de seis niveles de precision mixta, lo que permite escoger el equilibrio entre calidad y VRAM sin cambiar de modelo.
- Soporte de bajo consumo de VRAM declarado explicitamente en las etiquetas y en el enfoque de las dos variantes del encoder de texto.
- El encoder Ling Mini 2.0 incorpora componentes de edicion segun la model card, lo que sugiere que la familia Ming-Image cubre tareas de edicion de imagen ademas de la generacion pura; no se detalla el alcance exacto en la informacion proporcionada.
- No es un modelo de lenguaje: no soporta tool calling, function calling, agentes, razonamiento multi-paso ni modos de pensamiento. No se documentan capacidades de audio ni de vision de entrada (image-to-image) en la informacion disponible.
- Capacidades multilingues del prompt: no disponibles.

## Casos de uso

- Generacion de assets de diseno en estacion de trabajo local: con la variante Q4_K_M-HQ o Q5_K_M-HQ el modelo de difusion cabe en GPUs de 8-12 GB, lo que permite iterar sobre conceptos visuales sin depender de servicios en la nube ni de cuotas de API.
- Creacion de contenido en pipelines de ComfyUI: el repositorio esta pensado para el flujo de trabajo por nodos de ComfyUI, con carpetas separadas para diffusion_models, text_encoders y vae, lo que facilita encadenar el modelo con nodos de postprocesado, upscaling o composicion.
- Generacion de ilustraciones y carteleria en produccion por lotes: al poder desplegar el modelo en un servidor con una GPU de 24 GB o superior y una de las variantes de menor peso del encoder, se puede procesar colas de prompts de forma continuada.
- Entornos con requisitos de privacidad o sin conectividad: la inferencia es totalmente local, de modo que prompts y resultados no salen de la maquina, algo relevante para estudios que trabajan con material confidencial de cliente.
- Prototipado rapido en portatiles con GPU consumer: las variantes Q3_K_M-HQ y Q2_K-HQ, junto con el encoder Q2_K-HQ, reducen el peso del conjunto lo suficiente para equipos con GPU de gama media, a costa de calidad.
- Experimentacion en investigacion sobre cuantizacion: el repositorio documenta una politica reproducible de precision mixta con grupos de tensores protegidos, por lo que sirve como caso de estudio para medir el impacto de cuantizar atencion, FFN y bloques de condicionamiento por separado.
- Demostraciones y docencia con ComfyUI: el uso de GGUF evita descargar y servir los pesos BF16 completos, lo que simplifica montar talleres o entornos de prueba en hardware limitado.
- Integracion en herramientas internas de marketing para exploracion de variaciones de concepto: el modelo permite generar multiples aproximaciones visuales de una misma idea antes de encargar la produccion final a un disenador.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas cuantitativas de calidad de imagen (FID, CLIP score, evaluaciones humanas) ni comparaciones numericas entre los distintos niveles de cuantizacion. Tampoco se documentan datos de latencia, throughput ni tiempo por imagen para ninguna de las variantes. La busqueda web realizada no devolvio resultados tecnicos utilizables sobre este modelo o su modelo base.

## Requisitos de hardware

- El repositorio completo ocupa 72,0 GB, pero solo es necesario descargar las variantes que se vayan a usar.
- El modelo de difusion tiene ~6,15B parametros y el encoder de texto ~17,3B, por lo que el consumo de VRAM se reparte entre ambos mas el VAE.
- Estimacion orientativa de VRAM para el modelo de difusion (no confirmada por el autor, calculada a partir del numero de parametros y el regimen de bits; las variantes HQ son algo mayores que una cuantizacion uniforme del mismo nombre por los 309 tensores que permanecen en BF16):
  - Q8_0-HQ: aproximadamente 7 GB.
  - Q6_K-HQ: aproximadamente 5,5-6 GB.
  - Q5_K_M-HQ: aproximadamente 4,8-5,2 GB.
  - Q4_K_M-HQ: aproximadamente 4,2-4,6 GB.
  - Q3_K_M-HQ: aproximadamente 3,4-3,8 GB.
  - Q2_K-HQ: aproximadamente 2,7-3,1 GB.
- Estimacion orientativa de VRAM para el encoder de texto Ling Mini 2.0 (no confirmada por el autor):
  - Q4_K_M-HQ: aproximadamente 9-10 GB.
  - Q2_K-HQ: aproximadamente 5-6 GB, ya que el backbone no experto sigue en Q4_K_M y solo los bancos de expertos bajan a Q2_K.
- Con la combinacion Q4_K_M-HQ (difusion) mas Q2_K-HQ (encoder), el conjunto se situa aproximadamente en 9-11 GB antes de contar el VAE y las activaciones, por lo que una GPU con 12 GB puede ser el limite practico y 16 GB o mas ofrece margen.
- GPUs recomendadas: RTX 3060 12 GB, RTX 4070/4080, RTX 4090 24 GB y RTX 5090 para las variantes altas; A100 40/80 GB y H100 para despliegue por lotes o para mantener varias variantes cargadas.
- Cabe en GPU consumer: si, con las variantes Q3_K_M-HQ y Q2_K-HQ y el encoder Q2_K-HQ, en tarjetas de 8-12 GB. Las variantes Q8_0-HQ y Q6_K-HQ quedan fuera de ese rango salvo que se combine con offloading parcial a CPU, cuyo impacto en latencia no esta documentado.
- Opciones de despliegue: ComfyUI con el nodo ComfyUI-GGUF de city96, colocando los ficheros en ComfyUI/models/diffusion_models/ (o la carpeta de UNet GGUF equivalente), ComfyUI/models/text_encoders/ y ComfyUI/models/vae/. Es necesario aplicar el PR https://github.com/city96/ComfyUI-GGUF/pull/484 para el soporte de estos nodos GGUF segun la model card.
- vLLM, TGI, Ollama y llama.cpp como servidor de inferencia no son aplicables a este modelo en la informacion disponible; `llama-quantize` se uso unicamente como herramienta de cuantizacion, no como motor de generacion de imagen.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Formato | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| inclusionAI/Ming-Image-0.1-Design (original) | ~6,15B difusion + ~17,3B encoder de texto | safetensors (BF16) | sin cuantizar | no disponible en la informacion proporcionada | HuggingFace |
| realrebelai/Ming-Image_GGUFs (este repositorio) | mismos pesos, cuantizados | GGUF | Q8_0-HQ a Q2_K-HQ (difusion); Q4_K_M-HQ y Q2_K-HQ (encoder) | MIT | HuggingFace, 3.974 descargas y 12 likes |
| Modelos comparables de terceros | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos verificables en la informacion proporcionada sobre cuantizaciones GGUF equivalentes de otros modelos de generacion de imagen (por ejemplo de la familia Flux o SDXL) con los que establecer una comparacion numerica de parametros, contexto o rendimiento. La busqueda web realizada no aporto resultados tecnicos relevantes.

## Limitaciones y advertencias

- Requiere el PR https://github.com/city96/ComfyUI-GGUF/pull/484; sin el, los nodos GGUF no cargaran estos ficheros en una instalacion estandar de ComfyUI-GGUF.
- El metadato `general.architecture` de los GGUF apunta a Lumina2 por compatibilidad con el cuantizador y el cargador. Cargar el modelo como si fuera Lumina2 es un error y la propia model card lo advierte.
- Las variantes Q3_K_M-HQ y Q2_K-HQ aplican una compresion agresiva; la model card asume un compromiso explicito entre tamano y calidad, pero no publica mediciones del deterioro, por lo que el impacto real en fidelidad al prompt y en coherencia estructural no esta cuantificado.
- Las variantes HQ son mas grandes que una cuantizacion uniforme del mismo nombre, ya que 309 de los 519 tensores del modelo de difusion permanecen en BF16. Conviene no asumir los tamanos tipicos de una Q4_K_M convencional.
- Riesgo de alucinacion: en un modelo generativo de imagen se manifiesta como artefactos, anatomia incorrecta o elementos no solicitados en el prompt, no como texto falso. No se han publicado evaluaciones de fidelidad al prompt.
- Sesgos conocidos: no disponibles. La model card no documenta la composicion del dataset de entrenamiento ni sesgos demograficos, culturales o estilisticos.
- Limitaciones de idioma: no disponibles. No se especifica que idiomas acepta el encoder de texto Ling Mini 2.0 ni como se comporta con prompts en castellano.
- Licencia: el repositorio de cuantizaciones declara MIT. El modelo base inclusionAI/Ming-Image-0.1-Design no especifica licencia en la informacion proporcionada, por lo que conviene verificar los terminos del modelo original antes de un uso comercial, especialmente si la distribucion de los pesos cuantizados hereda condiciones adicionales.
- Al ser un modelo de generacion de imagen, no ofrece tool calling, agentes, razonamiento multi-paso ni ventana de contexto en tokens; cualquier requisito de ese tipo debe cubrirse con un modelo de lenguaje independiente.
- No hay datos de latencia ni de throughput, por lo que la planificacion de capacidad en produccion exige medir en el hardware objetivo.
- El repositorio ocupa 72,0 GB; descargar la escalera completa consume disco y ancho de banda considerables.

## Enlaces

- Repositorio HuggingFace de las cuantizaciones: https://huggingface.co/realrebelai/Ming-Image_GGUFs
- Modelo base original: https://huggingface.co/inclusionAI/Ming-Image-0.1-Design
- Repositorio oficial de Ming-Image: https://github.com/inclusionAI/Ming-Image
- Nodo ComfyUI-GGUF: https://github.com/city96/ComfyUI-GGUF
- PR necesario para los nodos GGUF: https://github.com/city96/ComfyUI-GGUF/pull/484
- Nota sobre la busqueda web: los resultados obtenidos no guardan relacion con el modelo y no se incluyen por no ser material tecnico utilizable.
