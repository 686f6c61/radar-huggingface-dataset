# RunningHubAI/rh-celestia-lora

## Resumen

rh-celestia-lora es un adaptador LoRA para generacion de imagenes a partir de texto (text-to-image), publicado por RunningHubAI en su repositorio de Hugging Face. No se trata de un modelo de lenguaje ni de un modelo fundacional completo, sino de un conjunto de pesos de ajuste fino (fine-tuning) de bajo rango que se aplica sobre el modelo base Z-image-base para incorporar un concepto o estilo concreto identificado por la palabra de activacion "Celestia".

El artefacto consiste en un unico fichero safetensors de aproximadamente 81 MiB, lo que es coherente con un adaptador LoRA de rango bajo y no con un modelo completo. Esta pensado para cargarse en ComfyUI, en la plataforma RunningHub o en Hugging Face, y su funcion es modificar el comportamiento del modelo base Z-image-base para que genere imagenes coherentes con el concepto "Celestia" cuando dicha palabra aparece en el prompt.

Su relevancia es limitada y muy especifica: se trata de un recurso de personalizacion visual dentro del ecosistema ComfyUI/RunningHub, no de un modelo evaluable en terminos de razonamiento, codigo o capacidades linguisticas. La informacion publicada por el autor es minima (descripcion de una linea, ficha de fichero y enlaces a la plataforma), por lo que buena parte de las especificaciones tecnicas habituales no estan disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador de bajo rango) sobre modelo base Z-image-base; arquitectura del base no disponible |
| Parametros totales | no disponible (pesos LoRA de 81 MiB; numero de parametros no publicado) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (no es un modelo de lenguaje; el "contexto" seria la longitud del prompt de texto, no publicada) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible (el autor indica que se siga la licencia del proyecto original o del upstream; el modelo base Z-image-base no detalla licencia en la informacion proporcionada) |
| Formato de pesos | safetensors (fichero `20260915-27530293_000000325.safetensors`, 81 MiB) |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA, es decir, una tecnica de ajuste fino parametrizado eficiente (PEFT) que congela los pesos del modelo base e introduce matrices de descomposicion de bajo rango en determinadas capas. El autor indica explicitamente que el ajuste se realizo a partir de Z-image-base ("Finetuned from: Z-image-base"), pero no se detalla la arquitectura interna de dicho modelo base, el numero de tokens de entrenamiento, la composicion del dataset de imagenes, ni si se emplearon tecnicas como RLHF o DPO (poco habituales en text-to-image).

Tampoco se especifican el rango (rank), el alpha, las capas objetivo del LoRA ni la resolucion de entrenamiento. El unico dato cuantitativo disponible es el tamano del fichero de pesos (81 MiB), que sugiere un adaptador de rango bajo y ligero. La unica innovacion documentada es la palabra de activacion ("trigger word") "Celestia", que debe incluirse en el prompt para activar el concepto aprendido.

## Capacidades

- Generacion de imagenes a partir de texto (text-to-image) mediante el modelo base Z-image-base, condicionada por el adaptador LoRA.
- Personalizacion de un concepto o estilo concreto: el adaptador incorpora el concepto "Celestia", activado mediante la palabra clave del mismo nombre en el prompt.
- Integracion con ComfyUI como nodo de carga de LoRA dentro de flujos de trabajo de generacion de imagen.
- Ejecucion en la plataforma RunningHub (version internacional y China) y en Hugging Face.
- No dispone de capacidades de generacion de texto, razonamiento, codigo, matematicas, vision por comprension, tool calling, agentes ni razonamiento multi-paso.
- Capacidades multilingues: no disponible; el prompt de texto depende del codificador de texto del modelo base, no documentado en esta ficha.

## Casos de uso

- Generacion de ilustraciones de personaje: cargar el LoRA en ComfyUI junto con Z-image-base e incluir "Celestia" en el prompt para obtener imagenes coherentes con el concepto entrenado, util para ilustracion conceptual o fan art.
- Produccion de assets para videojuegos o narrativa visual: generar variaciones de un mismo personaje o estilo manteniendo consistencia entre imagenes, aprovechando que el LoRA fija rasgos del concepto.
- Prototipado rapido de ideas visuales: usar el flujo de ComfyUI para iterar sobre prompts con el LoRA activo y comparar resultados antes de invertir en un entrenamiento propio.
- Pruebas de integracion en pipelines de imagen: validar como se comporta un LoRA de 81 MiB en un grafo de ComfyUI (carga, peso del adaptador, orden de nodos) antes de desplegar adaptadores propios.
- Experimentacion con la API de RunningHub: invocar el modelo a traves de la API de la plataforma para generar imagenes de forma programatica en un servicio o demo.
- Educacion y demostracion de LoRA: usar este adaptador como ejemplo practico para explicar como funciona el ajuste fino de bajo rango en modelos de difusion o text-to-image.
- Comparacion de estilos: combinar o contrastar este LoRA con otros adaptadores del mismo modelo base para evaluar la influencia del concepto "Celestia" en la salida.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la informacion proporcionada. El adaptador en si ocupa unos 81 MiB, pero el consumo real depende del modelo base Z-image-base, cuyo tamano y requisitos no se detallan.
- GPU recomendadas: no disponible; depende del modelo base.
- Compatibilidad con GPU de consumo: no disponible; no se puede confirmar sin conocer los requisitos de Z-image-base.
- Opciones de despliegue: ComfyUI (flujo principal recomendado por el autor), plataforma RunningHub (internacional y China) y Hugging Face. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que ademas no aplican a un modelo text-to-image de este tipo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye otros adaptadores LoRA comparables ni datos de rendimiento que permitan una comparacion rigurosa. Como referencia estructural, se trata de un LoRA sobre Z-image-base, pero no se dispone de especificaciones de alternativas en la informacion consultada.

## Limitaciones y advertencias

- Informacion muy escasa: la model card no documenta arquitectura del base, dataset, hiperparametros de entrenamiento ni evaluacion, lo que impide validar su calidad de forma objetiva.
- Dependencia del modelo base: el adaptador solo funciona con Z-image-base; no es util de forma autonoma y su comportamiento hereda las limitaciones de dicho base.
- Licencia no disponible: el autor remite a la licencia del proyecto original o upstream, pero no la concreta. Antes de un uso comercial es imprescindible verificar la licencia de Z-image-base y del propio LoRA.
- Riesgo de sobreajuste o artefactos: al ser un LoRA de concepto, puede reproducir sesgos o rasgos del dataset de entrenamiento y generar artefactos si se usa fuera de su dominio previsto.
- Palabra de activacion obligatoria: sin incluir "Celestia" en el prompt, es probable que el adaptador no aplique el concepto o lo haga de forma debil.
- Idiomas y contexto del prompt: no documentados; la calidad de la generacion dependera del codificador de texto del modelo base.
- Sin garantias de produccion: no hay datos de latencia, throughput ni estabilidad, y el repositorio registra 0 descargas y 0 likes en el momento de la consulta.
- Contenido generado: como todo modelo text-to-image, puede producir contenido inapropiado o no fiel al prompt; requiere filtros y supervision en entornos de produccion.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/RunningHubAI/rh-celestia-lora
- Modelo original en RunningHub: https://www.runninghub.ai/model/public/2099694611791241217
- Pagina del autor: https://www.runninghub.ai/user-center/2098659748161110017
- RunningHub (internacional): https://www.runninghub.ai
- RunningHub (China): https://www.runninghub.cn
- Documentacion de la API (ingles): https://www.runninghub.cn/runninghub-api-doc-en/
- Documentacion de la API (chino): https://www.runninghub.cn/runninghub-api-doc-cn/
- Entrenamiento en RunningHub: https://www.runninghub.ai/page-model
