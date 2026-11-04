# RunningHubAI/rh-f.1-3dcg-lora

## Resumen

`rh-f.1-3dcg-lora` es un adaptador LoRA para generacion de imagenes publicado por RunningHubAI en Hugging Face. No se trata de un modelo de lenguaje, sino de un peso auxiliar de 329 MiB que se carga sobre un modelo base de difusion identificado en la model card como "F1基础 D" (F1 base D), y que esta pensado para su uso dentro de flujos de ComfyUI o de la plataforma RunningHub. Su funcion es desplazar el estilo de generacion del modelo base hacia una estetica 3DCG, orientada a retratos y posters de personajes con acabado tridimensional.

La relevancia de este artefacto es limitada fuera de su nicho: no aporta capacidades de razonamiento, codigo ni comprension del lenguaje, y su evaluacion depende enteramente del modelo base sobre el que se aplique. La informacion publicada es escasa: la model card describe parametros de inferencia recomendados (peso 0.8, 25-30 pasos, sampler euler, CFG 3.5-5) pero no documenta el dataset de entrenamiento, la licencia concreta ni los idiomas de los prompts.

El repositorio es muy reciente (creado el 4 de noviembre de 2026) y no registra descargas ni interacciones en el momento de redactar esta ficha. La licencia aparece como "no disponible" y la model card remite a la licencia del proyecto original o del modelo base, lo que introduce incertidumbre para uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador de bajo rango) sobre modelo de difusion; arquitectura del modelo base no disponible |
| Parametros totales | no disponible (peso de 329 MiB en safetensors) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de generacion de imagenes) |
| Tipos de cuantizacion | no disponible; el fichero se distribuye en safetensors de 329 MiB |
| Idiomas soportados | no disponible (los prompts de la model card estan en chino e ingles) |
| Licencia | no disponible (la model card remite a la licencia del proyecto original o del modelo base) |
| Formato de pesos | safetensors (`F.1-CG质感角色人物海报v2.0.safetensors`) |

## Arquitectura y entrenamiento

El artefacto es un adaptador LoRA, es decir, un conjunto de matrices de bajo rango que se inyectan en las capas del modelo base para modificar su comportamiento sin reentrenar los pesos completos. La model card indica que se ha afinado a partir de "F1基础 D", un modelo base cuya arquitectura, tamano y origen no se detallan en la informacion proporcionada. No se especifica el numero de tokens, el volumen del dataset de imagenes, la composicion del mismo ni si se aplicaron tecnicas de regularizacion o de captions automaticos.

Tampoco se documentan innovaciones tecnicas como decodificacion especulativa, atencion lineal o variantes de muestreo propias. Los unicos parametros tecnicos publicados son de inferencia: peso recomendado de 0.8, entre 25 y 30 pasos de muestreo (con indicacion de aumentarlos si la imagen sale borrosa), sampler euler u otro equivalente, y CFG entre 3.5 y 5. Se sugiere describir la escena combinando lenguaje natural y palabras clave.

## Capacidades

- Generacion de imagenes con estetica 3DCG: el adaptador desplaza el estilo del modelo base hacia acabados tridimensionales, orientado a retratos y posters de personajes.
- Control de estilo mediante pesos LoRA: permite ajustar la intensidad del efecto con el peso recomendado de 0.8, aunque el rango efectivo no esta documentado.
- Integracion en ComfyUI: el repositorio esta etiquetado como `comfyui`, por lo que se espera su carga como nodo LoRA en grafos de generacion.
- Uso en la plataforma RunningHub: la model card indica que los pesos pueden cargarse directamente en RunningHub y ofrece enlaces a su API.
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso: es un adaptador de imagen, no un modelo de lenguaje.
- Capacidades multilingues: no documentadas; los prompts de ejemplo estan en chino e ingles.

## Casos de uso

- Ilustracion de personajes para videojuegos: aplicar el LoRA sobre el modelo base en ComfyUI para generar conceptos de personajes con acabado 3DCG consistente, fijando el peso en 0.8 y 25-30 pasos para mantener el estilo.
- Creacion de posters promocionales: usar el adaptador para producir carteles de personajes con estetica tridimensional, ajustando CFG entre 3.5 y 5 para controlar la fidelidad al prompt.
- Prototipado rapido de arte conceptual: generar variaciones de un personaje con el mismo LoRA para explorar direcciones visuales antes de encargar arte final.
- Produccion de assets para redes sociales: generar retratos 3DCG de forma repetible mediante un grafo de ComfyUI guardado, lo que permite lotes con parametros fijos.
- Integracion en pipelines automatizados via API de RunningHub: invocar el modelo desde la API para generar imagenes bajo demanda dentro de una aplicacion, sin gestionar infraestructura propia.
- Experimentacion con estilos sobre el modelo base F1: comparar el resultado del LoRA a distintos pesos para calibrar cuanto estilo 3DCG se quiere inyectar en una serie de imagenes.
- Docencia y demostraciones de LoRA en difusion: usar un adaptador pequeno (329 MiB) como ejemplo practico de carga y ajuste de LoRA en ComfyUI.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma directa; depende del modelo base sobre el que se aplique el LoRA, no del adaptador en si (329 MiB).
- GPU recomendadas: no disponibles en la informacion proporcionada; vendran determinadas por el modelo base de difusion.
- Compatibilidad con GPU de consumo: no confirmada; el adaptador es ligero, pero el modelo base puede requerir VRAM considerable.
- Opciones de despliegue: ComfyUI, plataforma RunningHub y su API; no se documentan otros runners (vLLM, llama.cpp, Ollama, TGI no aplican a un LoRA de difusion).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye otros LoRA de estilo 3DCG ni datos de rendimiento que permitan una comparacion rigurosa.

## Limitaciones y advertencias

- Licencia no disponible: la model card remite a la licencia del proyecto original o del modelo base, por lo que el uso comercial no esta garantizado y requiere verificacion previa.
- Dependencia total del modelo base: el comportamiento, la calidad y los requisitos de hardware dependen de "F1基础 D", cuyas caracteristicas no se documentan.
- Sesgos desconocidos: al no publicarse el dataset de entrenamiento, no es posible evaluar sesgos de representacion en personas, culturas o estilos.
- Riesgo de alucinacion visual: como todo modelo generativo de imagenes, puede producir anatomias incorrectas, texto ilegible o artefactos, especialmente con prompts ambiguos.
- Parametros de inferencia acotados: la model card solo recomienda peso 0.8, 25-30 pasos, sampler euler y CFG 3.5-5; fuera de ese rango el resultado no esta validado.
- Idiomas no documentados: no se especifica que idiomas entiende el modelo base; los ejemplos estan en chino e ingles.
- Repositorio sin validacion comunitaria: cero descargas y cero likes en el momento de la consulta, sin evidencia publica de calidad.
- Sin garantias de soporte: la model card es esencialmente promocional y enlaza a servicios de pago de RunningHub.

## Enlaces

- Hugging Face: https://huggingface.co/RunningHubAI/rh-f.1-3dcg-lora
- Modelo original en RunningHub: https://www.runninghub.cn/model/public/2034086045523906562
- Pagina del autor: https://www.runninghub.cn/user-center/1901824344404738050
- RunningHub (internacional): https://www.runninghub.ai
- RunningHub (China): https://www.runninghub.cn
- Documentacion de la API (ingles): https://www.runninghub.cn/runninghub-api-doc-en/
- Documentacion de la API (chino): https://www.runninghub.cn/runninghub-api-doc-cn/
- Entrenamiento en RunningHub: https://www.runninghub.ai/page-model
