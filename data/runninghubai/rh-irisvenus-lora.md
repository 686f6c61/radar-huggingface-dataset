# RunningHubAI/rh-irisvenus-lora

## Resumen

rh-irisvenus-lora es un adaptador LoRA de generacion de imagenes a partir de texto publicado por RunningHubAI en Hugging Face. Se trata de un ajuste fino derivado del modelo base Z-Image, orientado a introducir un estilo o concepto concreto identificado por la palabra de activacion `IRISVENUS_`. El repositorio contiene un unico archivo de pesos en formato safetensors de aproximadamente 81 MiB, lo que es coherente con un adaptador de bajo rango y no con un modelo completo.

El modelo se distribuye principalmente para su uso en ComfyUI y en la plataforma RunningHub, que actua como autor y alojador del artefacto. No se publican en la model card detalles sobre la arquitectura del modelo base, el conjunto de datos de entrenamiento, el rango del LoRA ni los hiperparametros utilizados, por lo que la informacion tecnica disponible es muy limitada.

Su relevancia es acotada: se trata de un recurso practico para flujos de trabajo de difusion texto-a-imagen que quieran reproducir un estilo concreto mediante un prompt con la palabra de activacion, pero no aporta innovaciones arquitectonicas ni resultados de evaluacion publicados. El repositorio no registra descargas ni interacciones en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador de bajo rango) sobre modelo base Z-Image; arquitectura del base no disponible |
| Parametros totales | no disponible (pesos del adaptador: ~81 MiB) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo texto-a-imagen) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (los prompts de texto dependen del codificador del modelo base) |
| Licencia | no disponible; la model card remite a la licencia del proyecto original o upstream |
| Formato de pesos | safetensors (`20261118-09815645.safetensors`) |
| Palabra de activacion | `IRISVENUS_` |
| Plataformas | ComfyUI, RunningHub, Hugging Face |
| Tamano del repositorio | ~0,1 GB |

## Arquitectura y entrenamiento

El artefacto es un adaptador LoRA, es decir, un conjunto de matrices de bajo rango que se inyectan en las capas del modelo base Z-Image para modificar su comportamiento generativo sin reentrenar todos los pesos. El tamano del archivo (81 MiB) es consistente con un adaptador de rango bajo aplicado a un modelo de difusion, aunque no se especifica el rango, las capas objetivo ni el factor de escala recomendado.

No se dispone de informacion sobre el dataset de entrenamiento, el numero de pasos, la resolucion de las imagenes de entrenamiento, el optimizador ni si se aplicaron tecnicas como regularizacion o captions automaticos. La model card unicamente indica que el ajuste se realizo en la plataforma RunningHub y que el modelo se deriva de Z-Image. Tampoco se documentan innovaciones tecnicas adicionales.

## Capacidades

- Generacion de imagenes a partir de descripciones textuales, condicionada por el modelo base Z-Image.
- Aplicacion de un estilo o concepto especifico mediante la palabra de activacion `IRISVENUS_` incluida en el prompt.
- Integracion en flujos de trabajo de ComfyUI como nodo de carga de LoRA.
- Ejecucion en la plataforma RunningHub, tanto en su version internacional como en la china.
- Compatibilidad con el pipeline `text-to-image` declarado en los metadatos del repositorio.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, vision, audio ni modo de pensamiento, ya que no es un modelo de lenguaje.

## Casos de uso

- Ilustracion conceptual con estilo propio: el LoRA permite fijar una estetica concreta invocando `IRISVENUS_` en el prompt, lo que resulta util para mantener coherencia visual en una serie de imagenes.
- Prototipado rapido en ComfyUI: al ser un archivo safetensors pequeno, se puede cargar y descargar rapidamente en grafos de nodos para comparar variantes estilisticas sin reconfigurar el modelo base.
- Generacion de assets para videojuegos o narrativa visual: se puede emplear para producir bocetos o ilustraciones de personajes y escenarios con una identidad visual consistente.
- Pruebas de concepto en la plataforma RunningHub: el modelo se puede ejecutar directamente en la nube del proveedor, lo que evita tener que montar infraestructura local de GPU.
- Experimentacion con palabras de activacion: sirve como ejemplo practico para estudiar como un LoRA de bajo rango modifica la salida de un modelo de difusion y como afecta la fuerza del adaptador.
- Integracion en pipelines automatizados de generacion de imagenes mediante la API de RunningHub, para producir lotes de imagenes con el estilo del adaptador.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- El adaptador en si ocupa unos 81 MiB, por lo que su carga anade un coste de memoria despreciable frente al modelo base.
- Los requisitos reales de VRAM vienen determinados por Z-Image, cuyo tamano y arquitectura no se detallan en la informacion disponible.
- No se dispone de datos sobre GPUs recomendadas, latencia ni throughput.
- Opciones de despliegue documentadas: ComfyUI y la plataforma RunningHub. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que ademas no aplican a un modelo de difusion de imagen.
- No se especifica si el modelo base cabe en GPUs de consumo; depende de la variante de Z-Image utilizada.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye modelos comparables de la misma categoria ni datos de rendimiento que permitan establecer una comparacion rigurosa.

## Limitaciones y advertencias

- La licencia no esta especificada en el repositorio; la model card remite a la licencia del proyecto original o upstream, por lo que el uso comercial requiere verificar los terminos de Z-Image y de RunningHub.
- No se documentan sesgos conocidos, pero al ser un ajuste estilistico sobre un modelo de difusion hereda los sesgos del modelo base y de su dataset de entrenamiento.
- Riesgo de alucinacion visual y de artefactos propios de los modelos de difusion, especialmente en manos, texto y estructuras complejas.
- La informacion sobre el entrenamiento es practicamente inexistente, lo que dificulta evaluar la calidad y la robustez del adaptador.
- El uso del adaptador depende de la palabra de activacion `IRISVENUS_`; sin ella, el efecto del LoRA puede ser limitado o nulo.
- No hay datos de evaluacion, descargas ni validacion por parte de la comunidad en el momento de la consulta.
- La fecha de creacion del repositorio (2026-11-18) y la ausencia de actividad sugieren que se trata de un artefacto reciente y sin contraste externo.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/RunningHubAI/rh-irisvenus-lora
- Modelo original en RunningHub: https://www.runninghub.ai/model/public/2123124124775419905
- Pagina del autor en RunningHub: https://www.runninghub.ai/user-center/2095178360195739649
- RunningHub internacional: https://www.runninghub.ai
- RunningHub China: https://www.runninghub.cn
- Documentacion de la API (ingles): https://www.runninghub.cn/runninghub-api-doc-en/
- Documentacion de la API (chino): https://www.runninghub.cn/runninghub-api-doc-cn/
- Entrenamiento en RunningHub: https://www.runninghub.ai/page-model
