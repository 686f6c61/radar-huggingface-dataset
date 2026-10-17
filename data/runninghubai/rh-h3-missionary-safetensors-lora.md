# RunningHubAI/rh-h3-missionary.safetensors-lora

## Resumen

rh-h3-missionary.safetensors-lora es un adaptador LoRA publicado por el usuario RunningHubAI en Hugging Face el 17 de octubre de 2026. No se trata de un modelo de lenguaje, sino de un fichero de pesos de bajo rango (148 MiB en formato safetensors) que se aplica sobre un modelo base identificado en la model card como minimax-h3. El repositorio ocupa 0,2 GB e incluye un unico archivo de pesos, sin configuracion de entrenamiento, sin dataset documentado y sin resultados de evaluacion.

El proposito declarado es su carga en ComfyUI, en la plataforma RunningHub o directamente en Hugging Face. La model card es minima: se limita a una tabla de metadatos corporativos, enlaces promocionales a la API de RunningHub y la mencion del modelo base. No se documentan el rango del adaptador, los modulos objetivo, la tasa de aprendizaje, el numero de pasos ni la composicion de los datos de ajuste fino.

La relevancia de esta publicacion es limitada desde un punto de vista tecnico: cero descargas, cero valoraciones, licencia no especificada y ausencia total de documentacion reproducible. El nombre del repositorio sugiere contenido orientado a adultos, lo que condiciona su uso legal y las plataformas en las que puede desplegarse. La ficha que sigue refleja unicamente la informacion verificable disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | adaptador LoRA sobre modelo base de generacion (base declarada: minimax-h3); arquitectura del modelo base no disponible |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica / no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (los prompts dependen del modelo base y del codificador de texto asociado) |
| Licencia | no disponible (la model card indica que se aplica la licencia del proyecto original o del modelo base, sin especificarla) |
| Formato de pesos | safetensors (`H3 Missionary.safetensors`, 148 MiB) |
| Tipo de artefacto | LoRA (adaptador de bajo rango) |
| Modelo base | minimax-h3 |
| Tamano del repositorio | 0,2 GB |
| Plataformas declaradas | ComfyUI, RunningHub, Hugging Face |
| Autor / publicador | RunningHubAI, en nombre del autor indicado en la model card |
| Fecha de creacion | 2026-10-17 |
| Fecha de actualizacion | 2026-10-17 |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

El artefacto es un adaptador LoRA, es decir, un conjunto de matrices de bajo rango que se inyectan en capas concretas de un modelo base congelado para modificar su comportamiento sin reentrenar todos los pesos. Se desconoce el rango, el valor de alpha, el dropout, los modulos objetivo (attention, cross-attention, MLP) y si el adaptador esta destinado a la ruta de UNet, de un transformer de difusion o de un codificador de texto. El unico dato verificable es el tamano del fichero: 148 MiB, coherente con un adaptador de rango moderado sobre un modelo de generacion de gran tamano.

No hay informacion sobre el proceso de entrenamiento: ni numero de imagenes o clips, ni resolucion, ni numero de pasos, ni optimizador, ni si se empleo regularizacion de clase, captions automaticos o ajuste por RLHF/DPO. Tampoco se documenta la procedencia del dataset ni si existe consentimiento sobre el material utilizado. La model card no incluye innovaciones tecnicas de ningun tipo, ni referencias a decodificacion especulativa, atencion lineal u optimizaciones de inferencia.

## Capacidades

- Aplicacion de un concepto o estilo concreto sobre el modelo base minimax-h3 mediante la carga del adaptador LoRA.
- Integracion en flujos de ComfyUI a traves de nodos de carga de LoRA (LoraLoader) y encadenamiento con el resto del grafo.
- Ejecucion en la nube a traves de la plataforma RunningHub, segun la propia model card.
- El contenido generado apunta, por el nombre del repositorio, a material para adultos; no hay confirmacion oficial en la documentacion.
- No realiza generacion de texto, razonamiento, codigo ni matematicas: no es un modelo de lenguaje.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No dispone de capacidades multilingues declaradas ni de modo de pensamiento, vision o audio propios.
- No se documentan capacidades de control fino (ControlNet, IP-Adapter, inpainting), aunque podrian combinarse con ellas desde el flujo externo de ComfyUI.

## Casos de uso

- Inferencia local en ComfyUI: cargar el fichero safetensors con un nodo de LoRA y aplicarlo sobre el modelo base minimax-h3 para generar imagenes o clips con el concepto ajustado; es el escenario para el que se publica el artefacto.
- Ejecucion en la nube sin GPU propia: usar la API de RunningHub para lanzar el grafo que referencia este LoRA, util cuando no se dispone de hardware suficiente para el modelo base.
- Ajuste de peso del adaptador: experimentar con el valor de fuerza del LoRA (tipicamente entre 0,5 y 1,0) y con la escala CFG para encontrar un equilibrio entre fidelidad al concepto y coherencia estructural.
- Fusion de adaptadores: combinar este LoRA con otros adaptadores de estilo o personaje mediante merge ponderado para explorar composiciones, teniendo en cuenta que las fusiones pueden degradar la calidad si los rangos no son compatibles.
- Investigacion sobre tecnicas LoRA: usar el fichero como muestra de un adaptador de 148 MiB para estudiar, por ejemplo, el efecto del rango en la capacidad de generalizacion o el impacto en la memoria de inferencia.
- Creacion de contenido para plataformas para adultos: uso previsto segun el nombre del repositorio, siempre que se cumplan los requisitos de verificacion de edad, las condiciones de servicio de la plataforma de destino y la legislacion aplicable en la jurisdiccion del usuario.
- Pruebas de reproducibilidad en pipelines de generacion: comparar salidas con distintas semillas y parametros para evaluar la varianza del adaptador antes de incorporarlo a un flujo de produccion.
- Prototipado de experiencias interactivas: integrar el flujo en aplicaciones que necesiten generacion de imagen bajo demanda, con las advertencias legales y de contenido correspondientes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

No existen metricas objetivas (FID, CLIP score, similitud de concepto, consistencia temporal) ni comparaciones con otros adaptadores en la model card ni en el repositorio. La ausencia de evaluacion impide estimar la calidad del ajuste mas alla de una inspeccion visual manual.

## Requisitos de hardware

- VRAM estimada para el adaptador: aproximadamente 148 MiB adicionales sobre la memoria que requiera el modelo base minimax-h3 al cargarse en precision completa o cuantizada.
- VRAM total: no disponible, ya que depende enteramente del modelo base y del pipeline (texto a imagen, texto a video, etc.), no documentados en este repositorio.
- GPU recomendadas: no disponible. Cualquier GPU capaz de ejecutar minimax-h3 con la precision elegida sera suficiente en lo que respecta al LoRA.
- GPU de consumo: probablemente viable en tarjetas con 12-24 GB de VRAM si el modelo base cabe en ese presupuesto y se aplican tecnicas de offload; no hay confirmacion oficial.
- Opciones de despliegue: ComfyUI (local) y plataforma RunningHub (nube). vLLM, llama.cpp, Ollama y TGI no son aplicables porque no es un modelo de lenguaje.
- Latencia y throughput: no disponibles. El coste por generacion vendra determinado por el modelo base, no por el adaptador.
- Almacenamiento: 0,2 GB para el repositorio, de los cuales 148 MiB corresponden al fichero de pesos; hay que sumar el peso del modelo base, no incluido.

## Comparativa con modelos similares

No disponible. No se conocen adaptadores comparables de los que se pueda extraer informacion verificable en el contexto de esta publicacion, y la model card no ofrece datos de rendimiento ni de identificacion del modelo base mas alla del nombre "minimax-h3".

A modo orientativo, una comparativa util deberia cubrir los siguientes criterios, ninguno de los cuales puede rellenarse con la informacion disponible: rango del LoRA, modulos objetivo, tamano del fichero, licencia y permisos de uso comercial, existencia de dataset documentado, plataforma de despliegue compatible y calidad medida sobre un conjunto de prueba comun.

## Limitaciones y advertencias

- Licencia no especificada: la model card remite a la licencia del proyecto original o del modelo base sin identificarla, lo que impide determinar si el uso comercial esta permitido. En un contexto de produccion esto es un riesgo legal directo.
- Contenido para adultos probable: el nombre del repositorio sugiere material para adultos. Su generacion, distribucion o alojamiento puede estar restringida o prohibida en funcion de la jurisdiccion, y exige verificacion de edad y cumplimiento de las condiciones de servicio de cada plataforma.
- Restricciones del modelo base: al ser un adaptador, hereda todas las limitaciones, sesgos y condiciones de licencia de minimax-h3, que no se documentan aqui.
- Riesgo de alucinacion: no aplica en el sentido linguistico, pero si existe riesgo de artefactos visuales, incoherencias anatomicas, deformaciones y perdida de consistencia en secuencias, especialmente con pesos de LoRA elevados.
- Ausencia de evaluacion: cero descargas y cero valoraciones implican que no hay validacion independiente de la calidad ni de la estabilidad del adaptador.
- Documentacion insuficiente: sin rango, sin hiperparametros de entrenamiento y sin dataset, la reproducibilidad es practicamente nula.
- Sesgos: no evaluados. Los modelos de generacion de imagenes heredan sesgos de representacion (genero, etnia, corporalidad) de sus datos de entrenamiento, y este adaptador no aporta ninguna mitigacion documentada.
- Idioma: no hay soporte multilingue declarado; la calidad de los prompts dependera del codificador de texto del modelo base.
- Idoneidad para produccion: baja, dado el estado de la documentacion, la falta de licencia clara y la ausencia de pruebas publicadas.
- Publicacion poco contrastada: el repositorio tiene un solo commit temporal (creado y actualizado el mismo dia) y no se aporta versionado ni historial de cambios.

## Enlaces

- Hugging Face: https://huggingface.co/RunningHubAI/rh-h3-missionary.safetensors-lora
- Modelo original en RunningHub: https://www.runninghub.ai/model/public/2094044930074230785
- Pagina del autor en RunningHub: https://www.runninghub.ai/user-center/1986078446017196033
- Plataforma RunningHub: https://www.runninghub.ai
- RunningHub China: https://www.runninghub.cn
- Documentacion de la API (ingles): https://www.runninghub.cn/runninghub-api-doc-en/
- Documentacion de la API (chino): https://www.runninghub.cn/runninghub-api-doc-cn/
- Entrenamiento de modelos en RunningHub: https://www.runninghub.ai/page-model
- Endpoint de la API para Seedance 2.5: https://www.runninghub.ai/call-api/api-detail/2133100000000700025
- Paper o informe tecnico del modelo base: no disponible
- Repositorio de codigo: no disponible
- Demo interactiva adicional: no disponible
