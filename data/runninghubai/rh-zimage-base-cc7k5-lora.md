# RunningHubAI/rh-zimage-base-cc7k5-lora

## Resumen

rh-zimage-base-cc7k5-lora es un adaptador LoRA de generacion de imagenes a partir de texto (text-to-image) publicado por RunningHubAI, la cuenta de Hugging Face de la plataforma RunningHub. No es un modelo completo: se trata de un fichero de pesos de 243 MiB que se carga sobre el modelo base Z-image-base y que, segun la model card, sirve para embellecer retratos y posturas de personas asiaticas y restaurar el color de las imagenes generadas.

El modelo se distribuye principalmente para su uso dentro del ecosistema ComfyUI, ademas de poder ejecutarse en la propia plataforma RunningHub (tanto en su version internacional como en la china). El autor original del LoRA es el usuario de RunningHub identificado como @tu amigo Cc y la ficha tecnica no aporta informacion sobre el dataset de entrenamiento, el numero de pasos, el rango del adaptador ni la arquitectura interna del modelo base.

La relevancia de esta publicacion es limitada y muy especializada: se trata de un ajuste estetico de nicho, con cero descargas y cero likes en el momento de la consulta, sin licencia declarada de forma explicita y sin resultados de benchmarks. Es util unicamente para quien ya trabaje con el modelo base Z-image-base y necesite un acabado concreto en retrato, no como modelo generalista.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre el modelo base Z-image-base (arquitectura del base no especificada en la informacion disponible) |
| Parametros totales | No disponible (pesos del adaptador: 243 MiB en un unico fichero safetensors) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica / no disponible (modelo de generacion de imagen, no de texto) |
| Tipos de cuantizacion | No disponible (se distribuye en safetensors; no se documentan variantes GGUF, FP8 ni QLoRA) |
| Idiomas soportados | No disponible (los prompts se procesan mediante el codificador de texto del modelo base) |
| Licencia | No disponible. La model card indica que RunningHub publica en nombre del autor, que los derechos de autor permanecen en el autor y que debe seguirse la licencia del proyecto original o del upstream |
| Formato de pesos | safetensors (`zimage-base_Cc风情万种7K5.safetensors`) |
| Tamano del repositorio | 0.3 GB |
| Pipeline declarado | text-to-image |
| Palabras de activacion | `cc-eqwz` |
| Plataformas soportadas | ComfyUI, RunningHub, Hugging Face |
| Fecha de creacion | 2026-09-29 |
| Ultima actualizacion | 2026-09-29 |

## Arquitectura y entrenamiento

La informacion disponible no describe la arquitectura del adaptador ni la del modelo base Z-image-base. Por el tipo declarado (LoRA, text-to-image) y por el pipeline asignado, se trata de un adaptador de bajo rango que se inyecta en las capas de atencion del modelo base de difusion para modificar el estilo de salida sin reentrenar el modelo completo. El unico dato cuantitativo es el tamano del fichero de pesos, 243 MiB, coherente con un adaptador de rango moderado sobre un modelo de difusion de gran tamano.

Tampoco se documentan los datos de entrenamiento: no hay numero de imagenes, composicion del dataset, resoluciones, pasos de entrenamiento, learning rate, ni si hubo tecnicas de alineacion como RLHF, DPO o fine-tuning supervisado adicional. El nombre del fichero incluye el sufijo "7K5", presumiblemente asociado al volumen o configuracion del entrenamiento, pero la model card no lo explica. La unica funcionalidad declarada explicitamente es estetica: embellecer retratos y posturas de personas asiaticas y restaurar el color.

## Capacidades

- Generacion de imagen a partir de texto mediante el pipeline text-to-image heredado del modelo base.
- Embellecimiento de retratos de personas asiaticas, segun la descripcion del autor.
- Correccion y ajuste de posturas en retratos.
- Restauracion y realce de color en las imagenes generadas.
- Activacion mediante la palabra clave `cc-eqwz`, lo que permite invocarlo de forma selectiva en un prompt.
- Integracion directa en flujos de trabajo de ComfyUI como nodo de carga de LoRA.
- Ejecucion en la nube a traves de la plataforma RunningHub y su API.
- No se documenta soporte de tool calling, agentes, razonamiento multi-paso, vision de entrada ni capacidades multimodales distintas del texto a imagen.
- No se documentan capacidades multilingues ni idiomas soportados.

## Casos de uso

- Retoque de retratos en estudio: el LoRA se aplica sobre Z-image-base para generar retratos con un acabado estetico mas cuidado en rasgos faciales y postura, partiendo de un prompt y de la palabra de activacion `cc-eqwz`.
- Correccion de color en lotes de imagenes generadas: cuando el modelo base produce resultados con dominantes de color indeseadas, este adaptador puede emplearse como paso final del pipeline para normalizar la paleta.
- Flujos de trabajo en ComfyUI: se carga como nodo LoRA dentro de un grafo existente de text-to-image, lo que permite combinarlo con otros nodos de control, upscaling o postprocesado sin cambiar la infraestructura.
- Generacion de material para redes sociales y contenido de moda: el enfoque en posturas y estetica de retrato encaja con la produccion rapida de imagenes de figura humana para campanas o publicaciones.
- Prototipado de personajes consistentes: el uso de una palabra de activacion fija ayuda a mantener un estilo reconocible entre distintas generaciones de un mismo personaje.
- Evaluacion de adaptadores LoRA frente a otros estilos: al ser un fichero unico de 243 MiB, resulta barato alternarlo con otros LoRA en pruebas comparativas de estilo dentro del mismo modelo base.
- Automatizacion via API de RunningHub: el modelo puede invocarse a traves de la API de la plataforma para integrar la generacion de retratos en aplicaciones de terceros sin desplegar GPU propia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas objetivas (FID, CLIP score, Human preference) ni comparaciones cuantitativas con otros adaptadores. Tampoco hay datos de latencia o throughput.

## Requisitos de hardware

- Los pesos del adaptador ocupan 243 MiB, por lo que el requisito real de VRAM lo determina el modelo base Z-image-base, no el LoRA en si.
- La VRAM necesaria para inferencia depende del modelo base y de la resolucion de salida; no disponible en la informacion proporcionada.
- GPU recomendadas: no disponible. Al no documentarse el tamano del modelo base, no es posible confirmar si cabe en GPUs de consumo como la RTX 4090 o la RTX 3090.
- Opciones de despliegue documentadas: ComfyUI, la plataforma RunningHub (internacional y china) y los propios ficheros del repositorio de Hugging Face. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que ademas no aplican a un modelo de difusion.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye datos de otros adaptadores LoRA comparables, ni metricas del modelo base Z-image-base que permitan establecer una comparacion objetiva de parametros, contexto, rendimiento o licencia.

## Limitaciones y advertencias

- La licencia no esta identificada de forma explicita: la model card remite a la licencia del proyecto original o del upstream, por lo que el uso comercial no esta claro y requiere verificacion previa con el autor o con RunningHub.
- Especializacion muy estrecha: el adaptador esta descrito solo para embellecer retratos y posturas de personas asiaticas y restaurar color; su comportamiento fuera de ese dominio no esta documentado.
- Riesgo de sobreajuste estetico: al ser un LoRA de estilo, puede homogeneizar los resultados y reducir la diversidad de las generaciones del modelo base.
- Dependencia total del modelo base: sin Z-image-base el fichero de 243 MiB es inutilizable; no es un modelo autonomo.
- Ausencia de ficha tecnica completa: no hay informacion sobre dataset de entrenamiento, sesgos demograficos, resoluciones soportadas ni rangos de fuerza del LoRA, lo que dificulta la reproducibilidad.
- Sesgos potenciales: al estar orientado a un tipo de rasgos y estetica concretos, es previsible un sesgo en la representacion de etnias, edades y tipos corporales, aunque no se han publicado evaluaciones al respecto.
- Riesgo de alucinacion visual: como todo modelo de difusion, puede generar artefactos anatomicos (manos, ojos, proporciones) que el LoRA no corrige necesariamente.
- Adopcion nula verificable: cero descargas y cero likes en el momento de la consulta, sin evidencia de uso en produccion ni de validacion por parte de la comunidad.
- Los resultados de la busqueda web proporcionada no guardan ninguna relacion con el modelo (corresponden a un futbolista); no se ha podido contrastar informacion externa sobre este LoRA.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/RunningHubAI/rh-zimage-base-cc7k5-lora
- Perfil del autor en Hugging Face: https://huggingface.co/RunningHubAI
- Modelo original en RunningHub: https://www.runninghub.cn/model/public/2020132954982322177
- Pagina del autor en RunningHub: https://www.runninghub.cn/user-center/1987470324222631938
- Plataforma RunningHub (internacional): https://www.runninghub.ai
- Plataforma RunningHub (China): https://www.runninghub.cn
- Documentacion de la API de RunningHub (ingles): https://www.runninghub.cn/runninghub-api-doc-en/
- Documentacion de la API de RunningHub (chino): https://www.runninghub.cn/runninghub-api-doc-cn/
- Entrenamiento de modelos en RunningHub: https://www.runninghub.ai/page-model
- No se han encontrado papers, blogs tecnicos ni repositorios adicionales relevantes en la busqueda web disponible.
