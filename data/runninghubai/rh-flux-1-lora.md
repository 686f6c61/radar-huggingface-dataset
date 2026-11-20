# RunningHubAI/rh-flux.1-lora

## Resumen

rh-flux.1-lora es un adaptador LoRA de edicion de imagen (image-text-to-image) publicado por RunningHubAI en Hugging Face. No se trata de un modelo de lenguaje ni de un modelo base completo, sino de un conjunto de pesos de bajo rango que se aplica sobre un modelo Flux.1 para inducir un estilo visual concreto: render hiperrealista de ciencia ficcion estadounidense de gran produccion, con enfasis en iluminacion dramatica, composicion cinematografica y texturas de alta definicion.

El adaptador esta pensado para su uso en ComfyUI y en la plataforma RunningHub, y su unico artefacto publicado es un fichero safetensors de 292 MiB. Segun la model card, se ha afinado a partir de "F1基础-Krea", un modelo base que no se detalla tecnicamente en la informacion disponible. El repositorio no incluye documentacion sobre el dataset de entrenamiento, hiperparametros, numero de pasos ni composicion de las imagenes de referencia.

Su relevancia es practica y acotada: permite reproducir de forma consistente una estetica de cine de ciencia ficcion (mecas, guerreros bioquimicos, campos de batalla interestelares) sin necesidad de reentrenar un modelo completo. No obstante, la ausencia de licencia explicita y de especificaciones tecnicas limita su adopcion en entornos de produccion con requisitos de trazabilidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador de bajo rango) sobre modelo base Flux.1; arquitectura del modelo base no disponible |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo de imagen, no de texto) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (los prompts de referencia estan en ingles y chino) |
| Licencia | no disponible; la model card indica que el copyright permanece en el autor y que se debe seguir la licencia del proyecto original o upstream |
| Formato de pesos | safetensors (fichero `flux-lora-超写实硬核美式科幻电影大片风格渲染.safetensors`, 292 MiB) |

## Arquitectura y entrenamiento

El artefacto es un adaptador LoRA, es decir, un conjunto de matrices de bajo rango que se inyectan en las capas del modelo base Flux.1 para modificar su comportamiento generativo sin alterar los pesos originales. El fichero pesa 292 MiB, lo que es coherente con un adaptador de rango moderado sobre un modelo de difusion de gran tamano, aunque no se especifica el rango, el modulo objetivo (attention, MLP o ambos) ni el numero de pasos de entrenamiento.

La model card indica que el modelo se ha afinado a partir de "F1基础-Krea" y que el entrenamiento se realizo en la plataforma RunningHub. No se proporciona informacion sobre el dataset (numero de imagenes, resoluciones, proceso de captioning), sobre el uso de tecnicas como regularizacion, dropout o balanceo de conceptos, ni sobre la funcion de perdida. Tampoco se documenta si se emplearon tecnicas de destilacion, decodificacion especulativa u otras optimizaciones, algo por otra parte poco habitual en adaptadores de estilo para difusion.

## Capacidades

- Generacion de imagenes a partir de texto (text-to-image) con estetica de cine de ciencia ficcion hiperrealista.
- Edicion de imagen guiada por texto (image-text-to-image), segun el pipeline declarado en el repositorio.
- Reproduccion de estilos concretos: iluminacion dramatica, tonos oscuros, composicion epica, texturas de aleacion y entornos post-apocalipticos.
- Soporte de escenas con mecas, guerreros bioquimicos, campos de batalla interestelares y criaturas mutadas, segun los ejemplos de prompt de la model card.
- Integracion en flujos de ComfyUI y en la plataforma RunningHub.
- No se documenta soporte de tool calling, agentes, razonamiento multi-paso, vision de entrada, audio ni modo de pensamiento; son capacidades ajenas al tipo de modelo.

## Casos de uso

- Previsualizacion de arte conceptual para producciones audiovisuales: el adaptador permite generar fotogramas clave con estetica de blockbuster de ciencia ficcion para presentar a direccion de arte antes de producir assets definitivos.
- Creacion de key art y posters promocionales: con prompts que combinan "cinematic shot, ultra realistic, dramatic lighting" se obtienen composiciones 16:9 adecuadas para carteleria y material de marketing.
- Diseno de personajes para videojuegos: la capacidad de generar variantes de guerreros bioquimicos o mecas facilita la exploracion de siluetas y materiales antes del modelado 3D.
- Ilustracion de portadas para novela o comic de ciencia ficcion: el estilo hiperrealista y la composicion epica encajan con cubiertas de genero.
- Storyboarding de secuencias de accion: la generacion de escenas de batalla interestelar o explosiones con humo permite construir tableros de secuencia rapidos.
- Prototipado de entornos para produccion virtual: los fondos post-apocalipticos generados pueden servir como referencia para matte painting o entornos de plato.
- Exploracion de estilo en estudios de diseno: comparar variantes con distintos pesos de LoRA (75%-85% segun recomendacion del autor) para calibrar la intensidad del look.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas objetivas (FID, CLIP score, preferencia humana) ni comparaciones cuantitativas con otros adaptadores de estilo.

## Requisitos de hardware

- VRAM estimada: no disponible de forma oficial. Al tratarse de un adaptador LoRA sobre Flux.1, los requisitos vienen determinados por el modelo base, no por el adaptador.
- GPU recomendadas: no disponibles en la informacion proporcionada. Para modelos Flux.1 en general se suele emplear RTX 4090, A100 o H100, pero este dato no lo confirma la model card.
- Compatibilidad con GPU de consumo: no confirmada. Dependera del modelo base y de la cuantizacion aplicada a este.
- Opciones de despliegue: ComfyUI (soporte nativo declarado), plataforma RunningHub y, previsiblemente, cualquier runtime compatible con LoRA sobre Flux.1; no se documentan vLLM, llama.cpp, Ollama ni TGI, que no aplican a modelos de difusion.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| rh-flux.1-lora | LoRA de estilo sobre Flux.1 | no disponible (292 MiB de pesos) | no aplica | no disponible | Hugging Face, RunningHub |
| Alternativas de LoRA de estilo para Flux.1 | LoRA de estilo | variable | no aplica | variable segun autor | Hugging Face, Civitai |
| Modelo base Flux.1 | Modelo de difusion completo | no disponible en esta ficha | no aplica | licencia del proyecto Flux.1 | Hugging Face |

No se dispone de datos de rendimiento comparativo entre este adaptador y otras alternativas de la misma categoria, por lo que la comparativa se limita a aspectos de formato, licencia y disponibilidad.

## Limitaciones y advertencias

- Licencia no disponible: la model card remite a la licencia del proyecto original o upstream, lo que impide determinar con claridad si se permite uso comercial. Es un riesgo relevante para produccion.
- Sesgo de estilo: el adaptador empuja las generaciones hacia una estetica muy concreta (ciencia ficcion hiperrealista estadounidense), lo que puede limitar su uso fuera de ese genero.
- Riesgo de alucinacion visual: como todo modelo generativo de imagen, puede producir anatomias incorrectas, texturas incoherentes o elementos fisicamente imposibles, especialmente en escenas complejas con multitud de objetos.
- Dependencia del modelo base: el comportamiento final depende de "F1基础-Krea" y de la version de Flux.1 sobre la que se aplique; cambios en el base pueden degradar el resultado.
- Ausencia de documentacion de entrenamiento: no se conocen el dataset ni los hiperparametros, lo que dificulta reproducir el ajuste o auditar posibles sesgos en los datos.
- Idiomas: los prompts de referencia estan en ingles y chino; no se documenta el rendimiento con prompts en castellano.
- Cero descargas y cero likes en el momento de la consulta: no hay evidencia de validacion por parte de la comunidad.
- Fecha de creacion futura (2026-11-20) en los metadatos: conviene verificar la integridad y procedencia del repositorio antes de usarlo en produccion.
- Recomendaciones del autor no verificadas: los valores de fuerza de estilo (75%-85%) y calidad (0.8-0.9) son heuristicas del autor, no resultados medidos.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/RunningHubAI/rh-flux.1-lora
- README en chino: https://huggingface.co/RunningHubAI/rh-flux.1-lora/blob/main/README_cn.md
- Modelo original en RunningHub: https://www.runninghub.cn/model/public/2057334938273406978
- Pagina del autor en RunningHub: https://www.runninghub.cn/user-center/1855140774970085377
- Plataforma RunningHub (internacional): https://www.runninghub.ai
- Plataforma RunningHub (China): https://www.runninghub.cn
- Documentacion de la API de RunningHub (ingles): https://www.runninghub.cn/runninghub-api-doc-en/
- Documentacion de la API de RunningHub (chino): https://www.runninghub.cn/runninghub-api-doc-cn/
- Entrenamiento en RunningHub: https://www.runninghub.ai/page-model
