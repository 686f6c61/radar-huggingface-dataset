# RunningHubAI/rh-krea2-turbo-int4-convrot-comfyui.safetensors-unet

## Resumen

rh-krea2-turbo-int4-convrot-comfyui.safetensors-unet es un archivo de pesos de tipo UNET para edicion de imagenes (pipeline image-text-to-image), publicado por RunningHubAI en Hugging Face. Se trata de un derivado afinado (finetuned) del modelo krea2, cuantizado a int4 y empaquetado en formato safetensors para su uso directo en ComfyUI, la plataforma de nodos de generacion y edicion visual. No es un modelo de lenguaje: es un componente de difusion que se carga como nodo UNET dentro de un grafo de ComfyUI.

El repositorio contiene un unico archivo de pesos de aproximadamente 7072 MiB (unos 7,4 GB), lo que corresponde a la version cuantizada a 4 bits con una transformacion denominada "ConvRot" en el nombre. La ficha del autor es muy escueta: no detalla arquitectura interna, numero de parametros, resolucion nativa ni datos de entrenamiento. La licencia no esta declarada de forma explicita y se remite a la licencia del proyecto original.

Su relevancia practica es acotada pero concreta: ofrece una via de ejecucion de un modelo de edicion de imagen tipo krea2 en entornos ComfyUI con requisitos de VRAM reducidos gracias a la cuantizacion int4, y con integracion directa en la plataforma RunningHub (API y despliegue en la nube). Para equipos que ya trabajan con pipelines de difusion en ComfyUI, es un artefacto listo para cargar; para evaluaciones de modelos fundacionales, la informacion publicada es insuficiente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | UNET de difusion (derivado de krea2); detalles internos no disponibles |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no aplica (modelo de imagen); no disponible |
| Tipos de cuantizacion | int4 (variante ConvRot); no se documentan otras |
| Idiomas soportados | no disponible (prompts en lenguaje natural, idioma no especificado) |
| Licencia | no disponible; el autor remite a la licencia del proyecto original |
| Formato de pesos | safetensors (UNET para ComfyUI) |

## Arquitectura y entrenamiento

El autor indica que el modelo es un UNET de edicion de imagen afinado a partir de krea2, cuantizado a int4 y con una variante de pesos etiquetada como "ConvRot". No se publican detalles sobre el backbone (tipo de transformer de difusion, numero de bloques, dimensiones de atencion), el esquema de cuantizacion exacto (por canal, por grupo, con o sin calibracion) ni el proceso de destilado o turbo que sugiere el nombre "Turbo". Tampoco se especifica el numero de pasos de inferencia recomendado, el scheduler, el CFG ni la resolucion de entrenamiento.

No hay informacion sobre el dataset de entrenamiento o afinado: ni numero de imagenes, ni composicion, ni si hubo tecnicas de preferencia (RLHF/DPO) o filtrado de calidad. Tampoco se documenta si el afinado se realizo sobre el modelo base completo o sobre un adaptador. En consecuencia, cualquier afirmacion sobre calidad, fidelidad al prompt o capacidad de edicion seria especulativa.

## Capacidades

- Edicion de imagenes guiada por texto (image-text-to-image): el pipeline declarado es image-text-to-image, lo que implica entrada de imagen y prompt textual.
- Integracion nativa con ComfyUI como nodo UNET dentro de un grafo de difusion.
- Ejecucion en la plataforma RunningHub y a traves de su API.
- Cuantizacion int4 orientada a reducir huella de memoria frente a los pesos originales en precision superior.
- No se documentan capacidades de generacion de video, audio, tool calling, agentes ni razonamiento multi-paso; no aplican a este tipo de artefacto.

## Casos de uso

- Edicion de imagenes por prompt en estudios de diseno: cargar el UNET en un grafo de ComfyUI y aplicar instrucciones textuales para modificar una imagen existente (cambio de estilo, sustitucion de elementos), aprovechando la cuantizacion int4 para trabajar en GPUs de gama media.
- Prototipado rapido de pipelines de difusion: al ser un unico archivo safetensors, permite montar y desmontar flujos en ComfyUI sin gestionar checkpoints completos, util para comparar variantes cuantizadas frente a las originales.
- Despliegue en la nube via RunningHub: usar la API de RunningHub para invocar el modelo en produccion sin gestionar infraestructura propia, adecuado para equipos con cargas variables.
- Automatizacion de variaciones de producto: generar ediciones controladas de imagenes de catalogo (fondos, iluminacion, contexto) mediante prompts, integradas en un pipeline de ComfyUI con nodos de pre y postprocesado.
- Evaluacion de cuantizacion int4 en tareas de edicion: comparar este artefacto con los pesos originales de krea2 para medir la perdida de calidad introducida por la cuantizacion en un caso concreto de edicion.
- Educacion y demostraciones: usar el modelo en talleres de ComfyUI para mostrar el flujo image-text-to-image con un checkpoint ligero y de carga rapida.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el archivo pesa aproximadamente 7,4 GB, por lo que se necesita al menos esa cantidad de VRAM para cargar los pesos, mas el margen para activaciones y el resto del grafo (VAE, text encoder). Como referencia orientativa, un entorno de 12-16 GB de VRAM es el minimo razonable para operar con holgura; no hay datos oficiales.
- GPU recomendadas: no disponibles en la informacion proporcionada. Por tamano de pesos, GPUs consumer de 16 GB o mas (por ejemplo, RTX 4080/4090) y GPUs de datacenter (A100, H100) son candidatas, pero no se confirma compatibilidad ni rendimiento.
- Cabe en GPU consumer: probablemente en modelos con 16 GB o mas de VRAM, condicionado al resto del grafo; no confirmado por el autor.
- Opciones de despliegue: ComfyUI (formato nativo), RunningHub (plataforma y API). No se documenta soporte para vLLM, llama.cpp, Ollama o TGI, que no aplican a un UNET de difusion.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La informacion publicada no identifica modelos comparables con datos verificables de parametros, contexto o rendimiento, y no se dispone de resultados de benchmarks para establecer una comparacion rigurosa.

## Limitaciones y advertencias

- Ficha del autor extremadamente escueta: no hay datos de arquitectura, parametros, entrenamiento ni evaluacion, lo que impide validar el comportamiento del modelo antes de usarlo.
- Licencia no declarada: el autor remite a la licencia del proyecto original (krea2), que no se especifica; el uso comercial queda en una zona de incertidumbre y requiere verificar la licencia upstream.
- Cuantizacion int4: es esperable cierta degradacion de calidad frente a los pesos originales; el autor no publica comparativas.
- Riesgo de sesgos y alucinacion visual: sin documentacion sobre el dataset de entrenamiento, no se pueden evaluar sesgos demograficos, estilisticos o culturales, ni la fidelidad del modelo a prompts complejos.
- Sin idiomas declarados: se desconoce el rendimiento con prompts en castellano frente a otros idiomas.
- Dependencia de la plataforma: el flujo recomendado esta ligado a ComfyUI y RunningHub; fuera de ese ecosistema, la integracion no esta documentada.
- Repositorio sin descargas ni likes en el momento de la consulta: no hay evidencia de uso comunitario ni de soporte.
- Sin garantias de mantenimiento: el artefacto se publico como un unico archivo sin versionado ni changelog.

## Enlaces

- Hugging Face: https://huggingface.co/RunningHubAI/rh-krea2-turbo-int4-convrot-comfyui.safetensors-unet
- Modelo original en RunningHub: https://www.runninghub.cn/model/public/2079624170782150657
- Pagina del autor en RunningHub: https://www.runninghub.cn/user-center/1925758591612162050
- RunningHub International: https://www.runninghub.ai
- RunningHub China: https://www.runninghub.cn
- Documentacion de la API (ingles): https://www.runninghub.cn/runninghub-api-doc-en/
- Documentacion de la API (chino): https://www.runninghub.cn/runninghub-api-doc-cn/
- Entrenamiento en RunningHub: https://www.runninghub.ai/page-model
