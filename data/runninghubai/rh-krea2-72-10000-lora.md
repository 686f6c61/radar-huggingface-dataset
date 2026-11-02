# RunningHubAI/rh-krea2-72-10000-lora

## Resumen

`rh-krea2-72-10000-lora` es un adaptador LoRA de edicion de imagen publicado por RunningHubAI en Hugging Face. No es un modelo base autonomo: se trata de un conjunto de pesos de bajo rango que se aplica sobre el modelo generativo `krea2` para modificar su comportamiento en una direccion estetica concreta. El autor lo describe como "Krea2-Beauty72-Minimalist High-end Beauty-10000", es decir, un ajuste orientado a la generacion de retratos de belleza con un estilo minimalista y de alta gama.

El repositorio contiene un unico archivo `Krea2-美女72-极简高级美人-10000.safetensors` de 224 MiB, lo que es coherente con un LoRA de rango bajo y no con un modelo completo. El pipeline declarado es `image-text-to-image`, y los tags indican compatibilidad con ComfyUI y con la plataforma RunningHub, donde el autor ofrece inferencia y entrenamiento alojados. La fecha de creacion y actualizacion del repositorio es el 2 de noviembre de 2026.

La relevancia de esta ficha es limitada en terminos de investigacion: se trata de un artefacto de personalizacion estetica para un modelo de difusion propietario o no documentado (`krea2`), sin model card tecnica con detalles de entrenamiento, sin benchmarks y sin licencia explicita mas alla de la remision al proyecto original. Es util para quien quiera reproducir el estilo en un flujo ComfyUI o via API de RunningHub, pero no para evaluar capacidades generales de un modelo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador de bajo rango) sobre el modelo base `krea2`; arquitectura del base no disponible |
| Parametros totales | no disponible (pesos LoRA de 224 MiB; numero de parametros no declarado) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de imagen, no de texto) |
| Tipos de cuantizacion | no disponible; el unico artefacto publicado es un `.safetensors` sin cuantizar |
| Idiomas soportados | no disponible (los prompts dependen del modelo base; el autor publica README en chino e ingles) |
| Licencia | no disponible; la model card remite a la licencia del proyecto original o upstream |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna del adaptador ni del modelo base `krea2`. Por el tipo de artefacto (LoRA de 224 MiB, pipeline `image-text-to-image`, tags `comfyui` y `lora`), se trata de un ajuste de bajo rango aplicado sobre las capas de atencion o proyeccion de un modelo de difusion para texto-a-imagen, en la linea de los adaptadores que se cargan en ComfyUI mediante nodos `LoraLoader`. El nombre del archivo sugiere un entrenamiento con un dataset o paso de entrenamiento identificado como "10000" y un estilo "72" ("美女72-极简高级美人"), pero no se especifica si 10000 se refiere a pasos, imagenes o iteraciones.

No se han publicado datos sobre el numero de imagenes de entrenamiento, la composicion del dataset, el uso de RLHF/DPO (no aplicable en la mayoria de flujos de difusion) ni innovaciones tecnicas como decodificacion especulativa o atencion lineal. Tampoco se documenta la resolucion nativa, el scheduler recomendado ni el peso (strength) optimo del LoRA, que en la practica suele estar entre 0,6 y 1,0 en ComfyUI. Toda esta informacion se considera no disponible.

## Capacidades

- Edicion y generacion de imagen a partir de texto sobre el modelo base `krea2`, con un sesgo estetico hacia retratos de belleza minimalistas y de alta gama.
- Aplicacion como adaptador LoRA en flujos ComfyUI, cargable junto al checkpoint base mediante nodos estandar.
- Ejecucion en la plataforma RunningHub, tanto en su version internacional como en la china, con API documentada.
- No se documentan capacidades de tool calling, function calling, agentes, razonamiento multi-paso ni modos de pensamiento: es un adaptador de imagen, no un modelo de lenguaje.
- Capacidades multilingues de prompt no confirmadas; dependen del codificador de texto del modelo base `krea2`.
- No se documentan capacidades de vision, audio ni video.

## Casos de uso

- Generacion de retratos de belleza para estudio: el LoRA se aplica sobre `krea2` en ComfyUI con un prompt descriptivo y un strength moderado para obtener acabados minimalistas y de alta gama, utiles en maquetas de marca o moodboards.
- Prototipado de campanas de cosmetica: permite iterar rapidamente variaciones de una misma direccion estetica sin reentrenar el modelo base, lo que reduce el coste frente a un fine-tuning completo.
- Produccion de assets para e-commerce de moda y cuidado personal: el adaptador sesga la salida hacia un estilo concreto, lo que ayuda a mantener coherencia visual entre imagenes de un mismo catalogo.
- Integracion via API de RunningHub: el flujo puede invocarse desde servicios externos usando la API documentada, lo que facilita automatizar lotes de imagenes en pipelines de contenido.
- Experimentacion en investigacion de personalizacion: sirve como ejemplo de adaptador de bajo rango para estudiar como un LoRA de 224 MiB modifica la distribucion de salida de un modelo de difusion.
- Educacion y demostraciones de ComfyUI: util para mostrar en talleres como se carga y se ajusta el strength de un LoRA de estilo sobre un checkpoint base.
- No se recomienda para tareas fuera de la generacion de imagen (texto, codigo, razonamiento), para las que el artefacto no esta disenado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No existen metricas de FID, CLIP score, preferencia humana ni comparativas cuantitativas con otros LoRA o modelos de imagen en la model card ni en los metadatos del repositorio.

## Requisitos de hardware

- VRAM estimada: no disponible para el adaptador en si; el consumo lo determina el modelo base `krea2`, cuyo tamano no se documenta.
- GPU recomendadas: no disponible; depende del checkpoint base y de la resolucion de generacion.
- Compatibilidad con GPU de consumo: no confirmada; el LoRA de 224 MiB es ligero, pero el modelo base puede requerir VRAM considerable.
- Opciones de despliegue: ComfyUI (flujo principal), plataforma RunningHub (internacional y china) y su API. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a modelos de difusion de imagen en este formato.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. No se han identificado en la informacion proporcionada modelos comparables de la misma categoria (LoRA de estilo sobre `krea2`) ni se dispone de datos de parametros, contexto o rendimiento de alternativas para establecer una comparacion rigurosa.

## Limitaciones y advertencias

- La licencia no esta declarada de forma explicita; la model card remite a la licencia del proyecto original o upstream, lo que introduce incertidumbre para uso comercial. Es imprescindible verificar la licencia de `krea2` antes de desplegar en produccion.
- No hay model card tecnica: se desconoce el dataset de entrenamiento, el numero de pasos, la resolucion y el strength recomendado, lo que dificulta reproducir resultados.
- Riesgo de sobreajuste al estilo "belleza minimalista": el adaptador puede degradar la diversidad de salidas y empujar todas las generaciones hacia un mismo canon estetico.
- Sesgos potenciales en la representacion de genero, etnia, edad y cuerpo, derivados tanto del dataset del LoRA como del modelo base; no documentados por el autor.
- Riesgo de alucinacion visual (artefactos, anatomias incorrectas, texto ilegible en la imagen) inherente a los modelos de difusion, no cuantificado en esta ficha.
- Dependencia de un modelo base no documentado (`krea2`): si el base cambia o deja de estar disponible, el LoRA puede volverse inutilizable.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta y creado en 2026, sin historial de uso que permita validar su calidad.
- No apto para tareas de lenguaje, codigo o razonamiento: es un artefacto exclusivamente de imagen.

## Enlaces

- Hugging Face: https://huggingface.co/RunningHubAI/rh-krea2-72-10000-lora
- Modelo original en RunningHub: https://www.runninghub.ai/model/public/2096641870406475777
- Pagina del autor: https://www.runninghub.ai/user-center/2086781034826723329
- RunningHub internacional: https://www.runninghub.ai
- RunningHub China: https://www.runninghub.cn
- Documentacion de la API (en): https://www.runninghub.cn/runninghub-api-doc-en/
- Documentacion de la API (cn): https://www.runninghub.cn/runninghub-api-doc-cn/
- Entrenamiento en RunningHub: https://www.runninghub.ai/page-model
- README en chino: https://huggingface.co/RunningHubAI/rh-krea2-72-10000-lora/blob/main/README_cn.md
