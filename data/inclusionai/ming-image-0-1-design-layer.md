# inclusionAI/Ming-Image-0.1-Design-Layer

## Resumen

Ming-Image-0.1-Design-Layer es un modelo de difusion para descomposicion de disenos graficos desarrollado por inclusionAI. Su tarea no es generar imagenes desde cero, sino tomar un diseno ya aplanado (un cartel, una tarjeta, una creatividad publicitaria con todos sus elementos fusionados en un unico plano) y separarlo en un numero solicitado de capas RGBA independientes, cada una con su canal alfa, de forma que puedan editarse o recomponerse por separado.

El modelo se distribuye a traves de la libreria diffusers con pipeline `image-text-to-image`: recibe una imagen de entrada y, opcionalmente, un prompt que describe el plan de capas (cuantas capas y que debe contener cada una). Si se omite el prompt, basta con indicar el numero de capas mediante `--num-layers`. La salida son ficheros PNG en formato RGBA que preservan la relacion de aspecto de la imagen original.

Cuenta con aproximadamente 6.154.908.736 parametros (unos 6,15 mil millones) y un repositorio de 65,2 GB en HuggingFace. Se libera bajo licencia MIT, lo que permite uso comercial sin restricciones de royalties. La configuracion validada por el autor requiere una GPU CUDA con 80 GiB de VRAM, 12 pasos de muestreo, escala CFG de 2,0 y precision BF16, con una resolucion de trabajo recomendada de 1024 (o 512 para descomposiciones mas rapidas). Es relevante ahora porque automatiza un cuello de botella clasico en los flujos de produccion de diseno grafico: la separacion manual de capas en herramientas como Photoshop o Figma.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No especificada en la informacion disponible; pipeline de difusion `image-text-to-image` distribuido via diffusers, con soporte de `flash_attention_2` |
| Parametros totales | 6.154.908.736 (aproximadamente 6,15 mil millones) |
| Parametros activos | No aplica (no se describe una arquitectura MoE) |
| Longitud de contexto | No aplica; la condicion de entrada es una imagen mas un prompt de plan de capas |
| Tipos de cuantizacion | No disponible; la precision validada por el autor es BF16 |
| Idiomas soportados | No disponible |
| Licencia | MIT |
| Formato de pesos | safetensors (libreria diffusers) |

Otros datos tecnicos: resolucion de trabajo recomendada 1024 (512 como alternativa rapida), 12 pasos de muestreo, CFG 2,0, salida en PNG RGBA, tamano del repositorio 65,2 GB, 14 likes y 0 descargas en el momento de la consulta, creado el 17 de septiembre de 2026 y actualizado el 22 de septiembre de 2026.

## Arquitectura y entrenamiento

La model card no detalla la arquitectura interna ni el proceso de entrenamiento. Lo que si se documenta es el comportamiento del pipeline: se trata de un modelo de difusion condicionado por imagen y texto (`image-text-to-image`) cuya salida tiene cuatro canales (RGBA), ya que el objetivo es producir capas con transparencia. El uso de `flash_attention_2` como implementacion de atencion en el script de inferencia indica que el backbone emplea mecanismos de atencion de tipo transformer, pero no se especifica si se trata de un DiT, un U-Net o una variante hibrida, ni el numero de tokens de entrenamiento, la composicion del dataset o si hubo fases de ajuste fino con RLHF o DPO. Todos esos datos deben considerarse "no disponibles".

El autor menciona una mejora de prompt (prompt enhancement, PE) que puede apoyarse en `Ling-3.0-flash-VL` o `qwen3.8-27B`, lo que sugiere que el plan de capas se puede generar o reescribir automaticamente con un modelo de vision-lenguaje antes de pasarlo al descomponedor. La unica referencia a evaluacion es el conjunto de test Crello, sobre el que se reportan las metricas RGB L1 (menor es mejor) y Alpha soft IoU (mayor es mejor), aunque sin valores numericos en la informacion disponible.

## Capacidades

- Descomposicion de capas: convierte una imagen de diseno aplanada en un numero solicitado de capas RGBA independientes.
- Control del numero de capas: mediante el parametro `--num-layers N` o mediante un prompt detallado que declare el numero de capas y su contenido.
- Condicionamiento por texto: acepta una especificacion de plan de capas en lenguaje natural para guiar la separacion.
- Preservacion de la relacion de aspecto: la salida mantiene el aspect ratio de la imagen de entrada.
- Salida con transparencia: los resultados se guardan como PNG en RGBA, listos para edicion por capas.
- Recomposicion: la galeria del autor muestra el resultado de recomponer las capas descompuestas sobre el diseno original.
- Soporte de mejora de prompt con modelos externos de vision-lenguaje (`Ling-3.0-flash-VL`, `qwen3.8-27B`).
- No se documentan capacidades de generacion de texto, razonamiento, codigo, matematicas, tool calling, function calling, comportamiento agentico, audio ni video.
- Capacidades multilingues: no disponibles.

## Casos de uso

- Automatizacion de produccion grafica: dado un cartel o creatividad publicitaria ya aplanada, el modelo genera las capas separadas (fondo, texto, ilustracion, logotipo) para que el equipo de diseno las edite sin rehacer el trabajo desde cero.
- Adaptacion de creatividades a distintos formatos: a partir de un diseno plano se obtienen capas RGBA que permiten recolocar, recortar o reescalar elementos para generar variantes de campana en diferentes tamanos sin perder transparencias.
- Plantillas editables para herramientas de diseno: las capas resultantes se pueden importar en editores que trabajan con capas para construir plantillas reutilizables por parte de usuarios no tecnicos.
- Localizacion de materiales de marketing: al aislar las capas de texto del resto de elementos visuales, se pueden sustituir los textos por traducciones manteniendo intactos los graficos y el fondo.
- Recuperacion y modernizacion de archivos antiguos: disenos heredados que solo existen como imagen plana o rasterizada se convierten en capas para poder reutilizarlos con las herramientas actuales.
- Preprocesado para pipelines de generacion: las capas transparentes sirven como entrada limpia para modelos de generacion o de edicion de imagen que necesitan mascaras o elementos aislados.
- Control de calidad y auditoria de marca: separar los elementos permite comprobar de forma automatizada que el logotipo, la tipografia y los colores corporativos cumplen las guias, algo que sobre una imagen plana es mucho mas costoso.
- Demo interactiva de descomposicion: el ejemplo publicado de tarjeta de seis capas sirve como referencia reproducible para evaluar la calidad del modelo antes de integrarlo en un flujo propio.

## Benchmarks y rendimiento

La model card reporta resultados cuantitativos de descomposicion de capas sobre el conjunto de test Crello, con las metricas RGB L1 (menor es mejor) y Alpha soft IoU (mayor es mejor), pero no incluye los valores numericos en la informacion disponible. No se han publicado cifras concretas de benchmarks en la informacion disponible, ni comparaciones con otros modelos, ni datos de latencia o throughput.

| Evaluacion | Conjunto de datos | Metricas | Resultado |
|---|---|---|---|
| Descomposicion de capas | Crello test set | RGB L1 (menor mejor), Alpha soft IoU (mayor mejor) | No disponibles (solo se indica la existencia de la tabla) |

## Requisitos de hardware

- VRAM: la configuracion validada por el autor es una unica GPU CUDA con 80 GiB de VRAM. Con 6,15 mil millones de parametros en BF16, los pesos ocupan aproximadamente 12,3 GB, pero el pipeline completo de difusion a resolucion 1024 con salidas RGBA y multiples capas eleva el consumo muy por encima de esa cifra.
- GPU recomendadas: A100 80 GB, H100 80 GB o H200, al ser las opciones habituales con 80 GiB de memoria. La information disponible solo valida explicitamente la configuracion de 80 GiB, sin nombrar modelos concretos.
- GPU de consumo: no se documenta compatibilidad con GPUs de consumo (RTX 4090 de 24 GB, RTX 3090 de 24 GB, etc.). Dado el requisito declarado de 80 GiB, se debe asumir que no cabe en una GPU de consumo en la configuracion validada; a resolucion 512 y con cuantizacion podria ser viable, pero no esta confirmado por el autor.
- Memoria en disco: el repositorio ocupa 65,2 GB.
- Opciones de despliegue: diffusers para inferencia local mediante el script `infer.py` del repositorio acompanante, y vLLM-Omni para servirlo, con recetas oficiales publicadas por el proyecto (ver enlaces).
- Ajustes de inferencia: `--attn-implementation flash_attention_2`, `--resolution 1024` (o 512 para mayor velocidad), 12 pasos de muestreo, CFG 2,0, precision BF16.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de especificaciones de modelos comparables en la informacion proporcionada. El unico artefacto relacionado documentado es el repositorio acompanante `inclusionAI/Ming-Image`, que contiene el codigo de instalacion, la demo de descomposicion de capas y las utilidades de reescritura de prompt, pero no se aportan cifras comparativas frente a alternativas de descomposicion de capas o de generacion de imagen condicionada.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Datos comparativos |
|---|---|---|---|---|---|
| Ming-Image-0.1-Design-Layer | 6.154.908.736 | No aplica | MIT | HuggingFace (diffusers, safetensors) | No disponibles |
| Alternativas de la misma categoria | No disponible | No disponible | No disponible | No disponible | No disponible |

## Limitaciones y advertencias

- Sesgos conocidos: no disponibles. No se documenta ninguna evaluacion de sesgos del modelo.
- Riesgo de alucinacion: en el contexto de este modelo, el riesgo se traduce en capas mal separadas, elementos duplicados entre capas o atribucion incorrecta de un elemento a la capa equivocada, especialmente con disenos complejos o con solapamientos fuertes. No se aportan tasas de error.
- Numero de capas: si se proporciona un prompt, el numero de capas declarado en ese prompt controla el numero de salidas. Un plan de capas mal formulado produce una descomposicion incorrecta, por lo que la calidad del prompt es critica.
- Idiomas: la lista de idiomas soportados no esta disponible, lo que impide asegurar un comportamiento correcto con textos en castellano dentro de los disenos de entrada o en los planes de capas.
- Contexto: se trata de un modelo de imagen, no de un modelo de lenguaje; no admite conversaciones multi-turno ni ventanas de contexto de texto.
- Requisitos de hardware: la configuracion validada exige 80 GiB de VRAM, lo que excluye el despliegue en GPUs de consumo sin ajustes no documentados.
- Licencia: MIT, sin restricciones conocidas para uso comercial. Se debe conservar el aviso de licencia correspondiente.
- Produccion: no hay datos publicados de latencia, throughput ni estabilidad en cargas concurrentes. El campo `inference: false` de la model card indica que la inferencia no esta habilitada en la infraestructura de HuggingFace, por lo que hay que desplegarlo en infraestructura propia mediante diffusers o vLLM-Omni.
- Fecha del modelo: los metadatos indican creacion en septiembre de 2026; conviene verificar la version vigente del repositorio acompanante antes de integrarlo, ya que los ajustes de inferencia pueden cambiar entre revisiones.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/inclusionAI/Ming-Image-0.1-Design-Layer
- Repositorio de codigo Ming-Image: https://github.com/inclusionAI/Ming-Image
- Demo de descomposicion de capas: https://github.com/inclusionAI/Ming-Image#layer-decomposition-demo
- Reescritura de prompt para descomposicion de capas: https://github.com/inclusionAI/Ming-Image#layer-decomposition-prompt-rewriting
- Receta de vLLM-Omni para Ming-Image: https://github.com/vllm-project/vllm-omni/blob/main/recipes/inclusionAI/Ming-Image.md
- Guia de instalacion de vLLM-Omni: https://docs.vllm.ai/projects/vllm-omni/en/latest/getting_started/quickstart/
- Licencia MIT: https://huggingface.co/inclusionAI/Ming-Image-0.1-Design-Layer/blob/main/LICENSE
