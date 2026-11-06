# RunningHubAI/rh-8000-lora

## Resumen

rh-8000-lora es un adaptador LoRA de text-to-image publicado por RunningHubAI, la cuenta oficial de la plataforma RunningHub en Hugging Face. El modelo se presenta como un fine-tuning de un modelo base denominado Z-image-base y se distribuye como un unico archivo de pesos safetensors de 324 MiB, orientado a su uso dentro de flujos de ComfyUI y de la propia plataforma RunningHub. El autor humano acreditado es el usuario @劇毒Shoujo, y la model card indica que se trata de un LoRA asociado al concepto o estilo "JingYao".

La relevancia de esta ficha es limitada y debe interpretarse en ese marco: no se trata de un modelo fundacional ni de un LLM, sino de un adaptador de bajo rango para generacion de imagenes. La informacion publicada es muy escasa: no hay datos sobre la arquitectura del modelo base, el numero de parametros, la longitud de contexto (no aplica en el sentido de un LLM), los datos de entrenamiento, los benchmarks ni la licencia concreta. La model card remite explicitamente a la licencia del proyecto original o del modelo upstream.

Por tanto, esta ficha documenta lo que se puede verificar (tipo de artefacto, formato, tamano, plataformas de uso, autoria y enlaces) y marca como "no disponible" todo aquello que el autor no ha publicado. Es util para quien necesite localizar el artefacto, entender como cargarlo en ComfyUI o RunningHub y saber que limitaciones de informacion existen antes de integrarlo en un pipeline.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador de bajo rango) sobre el modelo base Z-image-base; arquitectura del base no disponible |
| Parametros totales | no disponible (el repo ocupa 0,3 GB; el unico peso listado es de 324 MiB) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica / no disponible (modelo de text-to-image, no de lenguaje) |
| Tipos de cuantizacion | no disponible; se distribuye en safetensors (presumiblemente fp16/bf16, no confirmado) |
| Idiomas soportados | no disponibles (los prompts de text-to-image dependen del codificador de texto del modelo base) |
| Licencia | no disponible; la model card remite a la licencia del proyecto original o upstream |
| Formato de pesos | safetensors (`20260317-02447874.safetensors`, 324 MiB) |

## Arquitectura y entrenamiento

El artefacto es un adaptador LoRA, es decir, un conjunto de matrices de bajo rango que se inyectan en las capas del modelo base para modificar su comportamiento sin reentrenar todos los pesos. La model card indica que el fine-tuning parte de Z-image-base, pero no especifica la arquitectura de ese base (si es un diffusion transformer, un UNet o un modelo de otro tipo), ni el rango del LoRA, ni las dimensiones de las matrices, ni las capas objetivo.

Tampoco se publican datos sobre el conjunto de entrenamiento: no hay numero de imagenes, resolucion, composicion del dataset, tecnicas de regularizacion, hiperparametros (learning rate, pasos, batch size) ni uso de RLHF/DPO (que, por otra parte, no aplica a un adaptador de difusion). El nombre del archivo (`20260317-02447874.safetensors`) sugiere un identificador interno de entrenamiento en la plataforma RunningHub, no un checkpoint con metadatos publicos. No se describe ninguna innovacion tecnica adicional (decodificacion especulativa, atencion lineal, etc.).

## Capacidades

- Generacion de imagenes a partir de texto (text-to-image) mediante un adaptador LoRA sobre Z-image-base.
- Especializacion en el concepto o estilo "JingYao", segun la descripcion de la model card.
- Integracion nativa con ComfyUI como nodo de carga de LoRA.
- Uso en la plataforma RunningHub (version internacional y China) y en Hugging Face.
- Entrenamiento adicional disponible a traves de la pagina de entrenamiento de RunningHub.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, vision, audio ni modo thinking; no aplican a un LoRA de imagen.
- Capacidades multilingues: no disponibles; dependen del codificador de texto del modelo base.

## Casos de uso

- Generacion de ilustraciones de personaje con estilosia "JingYao": el LoRA se carga en ComfyUI junto al modelo base Z-image-base para producir imagenes coherentes con ese concepto a partir de prompts descriptivos.
- Prototipado rapido de conceptos visuales: al ser un adaptador de 324 MiB, se puede intercambiar entre distintos LoRA en un mismo grafo de ComfyUI sin recargar el modelo base, lo que agiliza la exploracion de variantes estilisticas.
- Produccion de assets para juegos o narrativa visual: se puede usar en un pipeline por lotes que genere variaciones de un personaje manteniendo el estilo aprendido por el adaptador.
- Integracion en flujos automatizados de RunningHub: la plataforma ofrece API documentada, de modo que el LoRA puede invocarse desde servicios externos para generar imagenes bajo demanda.
- Pruebas de concepto en entornos de investigacion sobre adaptadores: sirve como ejemplo de LoRA de bajo peso para estudiar tecnicas de composicion de adaptadores y control de estilo.
- Generacion de material de marketing o redes sociales: combinado con prompts y negative prompts ajustados, permite obtener imagenes consistentes con una identidad visual concreta.
- Evaluacion comparativa de LoRA: al ser un artefacto pequeno y aislado, es util para comparar el efecto de distintos adaptadores sobre el mismo modelo base en tareas de estilo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No hay metricas de FID, CLIP score, similitud estetica ni evaluaciones humanas en la model card ni en los resultados de busqueda.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible para el LoRA de forma aislada; depende completamente del modelo base Z-image-base, cuyos requisitos no se documentan. El adaptador en si ocupa 324 MiB en disco.
- GPU recomendadas: no disponibles; vienen determinadas por el modelo base.
- Compatibilidad con GPU de consumo: no confirmada; depende del modelo base y de la resolucion de generacion.
- Opciones de despliegue: ComfyUI (soporte nativo de LoRA), plataforma RunningHub (internacional y China) y carga desde Hugging Face. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a un modelo de difusion.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| rh-8000-lora | LoRA text-to-image sobre Z-image-base | no disponible (324 MiB) | no aplica | no disponible | Hugging Face, ComfyUI, RunningHub |
| rh-ypj-lora-v2-step8000-lora | LoRA text-to-image (RunningHubAI) | no disponible | no aplica | no disponible | Hugging Face |
| Z-image-base | Modelo base de difusion (upstream) | no disponible | no aplica | no disponible | Referenciado como origen del fine-tuning |

La comparativa se limita a los artefactos de la misma familia publicados por RunningHubAI y al modelo base citado, ya que no se dispone de datos tecnicos de alternativas comparables en la informacion proporcionada.

## Limitaciones y advertencias

- Informacion muy escasa: no hay datos de arquitectura del base, dataset, hiperparametros ni evaluaciones, lo que impide validar su calidad de forma objetiva.
- Licencia no disponible: la model card remite a la licencia del proyecto original o upstream; antes de un uso comercial es imprescindible verificar la licencia de Z-image-base y del adaptador.
- Riesgo de sobreajuste al concepto "JingYao": al ser un LoRA de estilo, puede degradar la diversidad y la fidelidad al prompt fuera de ese dominio.
- Sesgos: no documentados; los sesgos del adaptador heredan los del modelo base y del dataset de entrenamiento, que no se describe.
- Alucinacion visual: como todo modelo generativo de imagen, puede producir artefactos, anatomia incorrecta o texto ilegible en las imagenes.
- Dependencia del modelo base: el adaptador no es autonomo; sin Z-image-base (y su codificador de texto) no es funcional, y la version concreta del base puede afectar a los resultados.
- Idiomas: no disponibles; el rendimiento multilingue de los prompts depende del codificador de texto del base.
- Advertencia de produccion: la ausencia de benchmarks y de licencia clara desaconseja su uso en produccion sin una evaluacion interna previa.

## Enlaces

- Hugging Face: https://huggingface.co/RunningHubAI/rh-8000-lora
- Modelo original en RunningHub: https://www.runninghub.cn/model/public/2034104872546603010
- Pagina del autor: https://www.runninghub.cn/user-center/1900565489595371521
- RunningHub International: https://www.runninghub.ai
- RunningHub China: https://www.runninghub.cn
- Documentacion de la API (EN): https://www.runninghub.cn/runninghub-api-doc-en/
- Documentacion de la API (CN): https://www.runninghub.cn/runninghub-api-doc-cn/
- Entrenamiento en RunningHub: https://www.runninghub.ai/page-model
- Modelo relacionado de la misma familia: https://huggingface.co/RunningHubAI/rh-ypj-lora-v2-step8000-lora
