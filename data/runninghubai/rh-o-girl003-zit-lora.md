# RunningHubAI/rh-o-girl003-zit-lora

## Resumen

rh-o-girl003-zit-lora es un adaptador LoRA de generacion de imagenes publicado por RunningHubAI en Hugging Face. Se trata de un ajuste fino derivado de Z-image-turbo, segun indica la propia model card, y se distribuye como un unico fichero de pesos `O_girl003_z-image_lora_v1.safetensors` de 162 MiB (0,2 GB de repositorio). No es un modelo autonomo: necesita el modelo base Z-image-turbo cargado en ComfyUI, en la plataforma RunningHub o en Hugging Face para poder generar imagenes.

El proposito declarado es aportar un estilo o sujeto concreto ("O_girl003_ZIT") sobre el que no se ofrece ninguna descripcion semantica en la documentacion. El autor del ajuste figura como @Yimo dentro de la plataforma RunningHub, que actua como publicador. La model card no incluye informacion sobre el dataset de entrenamiento, el rango del adaptador, el numero de pasos, la tasa de aprendizaje ni el regimen de entrenamiento, por lo que la mayor parte de los parametros tecnicos quedan sin documentar.

Su relevancia es limitada y experimental: el repositorio acumula 0 descargas y 0 "likes" en el momento de la consulta, no declara licencia explicita y no aporta benchmarks. Resulta util unicamente como pieza de un flujo de trabajo en ComfyUI para quien ya utilice Z-image-turbo como base y quiera evaluar este adaptador concreto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador de bajo rango) sobre el modelo base de generacion de imagen Z-image-turbo; arquitectura del modelo base no disponible en la informacion proporcionada |
| Parametros totales | no disponible (el fichero de pesos ocupa 162 MiB) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica / no disponible (modelo de generacion de imagen; no se documenta limite de tokens de prompt) |
| Tipos de cuantizacion | no disponible; se distribuye un unico fichero `.safetensors`, sin variantes GGUF, FP8 u otras |
| Idiomas soportados | no disponible (la model card esta redactada en ingles y chino, pero no se especifican idiomas de prompt) |
| Licencia | no disponible; la model card indica que los derechos permanecen en el autor y remite a la licencia del proyecto original |
| Formato de pesos | safetensors (`O_girl003_z-image_lora_v1.safetensors`, 162 MiB) |

## Arquitectura y entrenamiento

La informacion disponible describe exclusivamente un adaptador LoRA para generacion de texto a imagen. El unico dato tecnico confirmado es el origen del ajuste: "Finetuned from: Z-image-turbo". No se publican el rango (rank), el valor alpha, las capas objetivo, el optimizador, el numero de pasos de entrenamiento, la resolucion de entrenamiento, el tamano del dataset ni la composicion de las imagenes utilizadas. Tampoco se describe si el ajuste se hizo sobre las capas de atencion del transformer de difusion o sobre los bloques de texto.

La tecnica empleada es la habitual en este tipo de adaptadores: se congelan los pesos del modelo base y se entrenan matrices de bajo rango que se suman a determinadas capas, de modo que el fichero resultante es muy pequeno (162 MiB) y se puede combinar con otros LoRA durante la inferencia. No hay indicios de que se haya aplicado RLHF, DPO ni tecnicas de alineacion, ya que no aplican al pipeline declarado. El modelo base Z-image-turbo pertenece a la familia de modelos de difusion Z-Image; sus detalles de arquitectura, numero de parametros y proceso de destilacion no se recogen en la documentacion proporcionada y no deben darse por supuestos.

El identificador "O_girl003_ZIT" que aparece en la model card es, con alta probabilidad, la palabra de activacion (trigger word) que debe incluirse en el prompt para que el adaptador aplique su efecto, aunque esto no se confirma de forma explicita.

## Capacidades

- Generacion de imagenes a partir de texto (pipeline `text-to-image`) mediante un adaptador LoRA.
- Especializacion en un sujeto o estilo concreto identificado como "O_girl003_ZIT", presumiblemente personas o retratos, segun la nomenclatura del nombre; la model card no lo describe.
- Aplicacion sobre el modelo base Z-image-turbo, por lo que hereda las capacidades del base (resolucion, velocidad, fidelidad de prompt) en la medida en que este las ofrezca.
- Compatibilidad declarada con ComfyUI, plataforma RunningHub y Hugging Face como entornos de carga.
- Posibilidad de combinarse con otros LoRA del mismo base, segun el comportamiento estandar de este tipo de adaptadores (no confirmado por el autor).
- Soporte de tool calling / function calling: no aplica.
- Soporte de agentes y razonamiento multi-paso: no aplica.
- Capacidades multilingues: no disponible.
- Capacidades especiales (modo thinking, vision, audio, video): no disponible; el pipeline declarado es unicamente de imagen.

## Casos de uso

- Generacion de retratos consistentes en ComfyUI: el adaptador se cargaria como nodo LoRA sobre Z-image-turbo para producir imagenes de un mismo sujeto o estilo a lo largo de una serie, usando la etiqueta de activacion en el prompt para mantener la coherencia visual.
- Prototipado de personajes para videojuegos o ilustracion editorial: permite generar variaciones rapidas de un diseno de personaje antes de encargar el arte final, siempre que el modelo base ya este integrado en el estudio.
- Automatizacion de generacion de imagenes via API de RunningHub: al estar publicado dentro de esa plataforma, puede invocarse desde sus endpoints para producir lotes de imagenes sin mantener infraestructura de GPU propia.
- Experimentacion con merge de LoRA: al ser un fichero safetensors pequeno, resulta util para pruebas de combinacion de adaptadores sobre Z-image-turbo y para medir como interactua con otros estilos.
- Pruebas de concepto de direccion de arte: un estudio puede generar tableros de referencia con un estilo concreto antes de decidir la linea grafica de una campana o producto.
- Contenido para redes sociales con identidad visual repetida: publicacion de series de imagenes con un mismo personaje o acabado estetico sin reentrenar el modelo base.
- Evaluacion comparativa de adaptadores sobre Z-image-turbo: por su tamano reducido, sirve como caso de prueba para medir el impacto de un LoRA en la fidelidad al prompt y en la aparicion de artefactos.
- Formacion interna: uso como ejemplo practico de como se estructura y se publica un LoRA para ComfyUI en un repositorio de Hugging Face.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas objetivas (FID, CLIP score, similitud de identidad), ni comparaciones cuantitativas con otros adaptadores, ni ejemplos de imagenes generadas.

## Requisitos de hardware

- VRAM para inferencia: no disponible. Al tratarse de un LoRA, el consumo lo determina casi por completo el modelo base Z-image-turbo y la resolucion de generacion, no el adaptador de 162 MiB.
- GPU recomendadas: no disponibles en la documentacion proporcionada. La plataforma RunningHub ofrece ejecucion en la nube, lo que evita requisitos locales.
- Compatibilidad con GPU de consumo: no confirmada. Dependera del modelo base Z-image-turbo y de la cuantizacion aplicada a este; el LoRA en si anade una sobrecarga minima de memoria.
- Opciones de despliegue: ComfyUI (entorno principal declarado), plataforma RunningHub (local e internacional, con API), y carga directa del fichero safetensors desde Hugging Face. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a un pipeline de difusion.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no identifica otros adaptadores LoRA comparables ni ofrece datos de rendimiento que permitan establecer una comparacion con alternativas de la misma categoria sobre Z-image-turbo o sobre otros modelos base de generacion de imagen.

## Limitaciones y advertencias

- Ausencia total de documentacion tecnica: no se publican rango, alpha, capas objetivo, dataset, pasos de entrenamiento ni resolucion de entrenamiento, lo que impide reproducir o auditar el ajuste.
- Licencia no especificada: la model card solo indica que los derechos pertenecen al autor y remite a la licencia del proyecto original. No hay autorizacion explicita de uso comercial, por lo que su utilizacion en produccion es juridicamente arriesgada.
- Dependencia del modelo base: el adaptador no funciona de forma autonoma; requiere Z-image-turbo y esta sujeto a la licencia y a las limitaciones de este.
- Sesgos desconocidos: al no describirse el dataset de entrenamiento, no se puede evaluar que sesgos de genero, etnia, edad o estilo incorpora el adaptador, algo especialmente relevante si genera figuras humanas.
- Riesgo de artefactos y sobreajuste: los LoRA de bajo rango pueden degradar la diversidad de las salidas, repetir poses o fondos y producir deformaciones anatomicas, sobre todo fuera de la distribucion de entrenamiento.
- Prompt en idioma no confirmado: no se especifica en que idioma o idiomas se entreno el adaptador, por lo que el rendimiento con prompts en castellano es incierto.
- Trazabilidad dudosa: la fecha de creacion registrada en los metadatos es 2026-09-27, posterior a la fecha de consulta habitual, lo que sugiere un desfase o una carga automatizada de metadatos.
- Sin validacion por la comunidad: 0 descargas y 0 "likes" implican que no existe evidencia externa de calidad ni de funcionamiento correcto del fichero.
- Posibles restricciones de contenido: la generacion de figuras humanas esta sujeta a las politicas de uso de la plataforma anfitriona (RunningHub) y del modelo base.
- No apto para tareas de razonamiento, codigo, texto, agentes o tool calling: su unico pipeline es la generacion de imagenes.

## Enlaces

- Hugging Face: https://huggingface.co/RunningHubAI/rh-o-girl003-zit-lora
- Model card en chino: https://huggingface.co/RunningHubAI/rh-o-girl003-zit-lora/blob/main/README_cn.md
- Proyecto original en RunningHub: https://www.runninghub.ai/model/public/2087431816022523905
- Pagina del autor (@Yimo): https://www.runninghub.ai/user-center/1977697498418536449
- RunningHub (sitio internacional): https://www.runninghub.ai?utm_source=huggingface&utm_medium=badge&utm_campaign=model_upload&utm_content=rh-2087431816022523905
- RunningHub (sitio China): https://www.runninghub.cn?utm_source=huggingface&utm_medium=badge&utm_campaign=model_upload&utm_content=rh-2087431816022523905
- Documentacion de la API (ingles): https://www.runninghub.cn/runninghub-api-doc-en/
- Documentacion de la API (chino): https://www.runninghub.cn/runninghub-api-doc-cn/
- Pagina de llamada a la API: https://www.runninghub.ai/call-api?utm_source=huggingface&utm_medium=badge&utm_campaign=api_promotion&utm_content=rh-2087431816022523905
- Entrenamiento en RunningHub: https://www.runninghub.ai/page-model
- Detalle de API de Seedance 2.5 (enlace relacionado de la model card): https://www.runninghub.ai/call-api/api-detail/2133100000000700025
- Repositorio de pesos: https://huggingface.co/RunningHubAI/rh-o-girl003-zit-lora/blob/main/O_girl003_z-image_lora_v1.safetensors
