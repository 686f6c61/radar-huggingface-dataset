# RunningHubAI/rh-zimage-turbo-095-runninghub-4000095-lora

## Resumen

`rh-zimage-turbo-095-runninghub-4000095-lora` es un adaptador LoRA de text-to-image publicado por RunningHubAI en Hugging Face. No se trata de un modelo base autonomo, sino de un conjunto de pesos de ajuste fino (81 MiB, formato safetensors) pensado para cargarse sobre el modelo Z-image-turbo dentro de ComfyUI o de la plataforma RunningHub. El adaptador esta orientado a la generacion de imagenes de mujeres de figura alta, segun la descripcion del autor ("Zimage Turbo-Beautiful Woman 095-Tall Model-RunningHub-4000"), y se activa mediante la palabra disparadora `095`.

El interes practico del artefacto es acotado: sirve como ejemplo de LoRA de estilo o de sujeto para el ecosistema Z-image-turbo y como pieza lista para usar en flujos de ComfyUI. No aporta arquitectura propia ni capacidades nuevas mas alla de las del modelo base sobre el que se aplica, y su model card no documenta hiperparametros de entrenamiento, composicion del dataset ni evaluaciones cuantitativas.

La informacion publicada es muy escasa: cero descargas, cero likes, licencia no declarada de forma explicita (el autor remite a la licencia del proyecto original) y ausencia total de benchmarks. Cualquier evaluacion de calidad debe hacerse, por tanto, de forma empirica sobre el modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador de bajo rango) sobre el modelo base Z-image-turbo; la arquitectura del base no se detalla en la model card |
| Parametros totales | no disponible (pesos del adaptador: 81 MiB en safetensors) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo text-to-image, no linguistico) |
| Tipos de cuantizacion | no disponible (el LoRA se distribuye en safetensors; la cuantizacion depende del modelo base y del runtime) |
| Idiomas soportados | no disponible (los prompts dependen del codificador de texto del modelo base) |
| Licencia | no disponible; el autor indica que se siga la licencia del proyecto original o del upstream |
| Formato de pesos | safetensors (fichero `Zimage Turbo-美女095-高挑模特-runninghub-4000【触发词095】.safetensors`) |

## Arquitectura y entrenamiento

El repositorio contiene unicamente pesos LoRA, es decir, matrices de bajo rango que se inyectan en las capas del modelo base Z-image-turbo para modificar su comportamiento generativo. No se especifica en que modulos del transformer se aplican los adaptadores, ni el rango utilizado, ni el valor de alpha, ni la resolucion de entrenamiento. El tamano del fichero (81 MiB) es coherente con un LoRA de rango moderado para un modelo de difusion o de generacion de imagen por transformers, pero no permite inferir la configuracion exacta.

Tampoco se documentan el numero de imagenes de entrenamiento, la composicion del dataset, el uso de regularizacion, el optimizador, la tasa de aprendizaje ni si hubo etapas de curado o filtrado. La unica informacion operativa es la palabra disparadora `095`, que debe incluirse en el prompt para activar el efecto del adaptador, y la indicacion de que el ajuste se realizo sobre Z-image-turbo. El nombre del fichero sugiere un conjunto de entrenamiento de 4000 imagenes ("runninghub-4000"), pero se trata de una inferencia a partir del nombre y no de un dato confirmado por el autor.

## Capacidades

- Generacion de imagenes text-to-image condicionada por prompt, heredando las capacidades del modelo base Z-image-turbo.
- Modulacion de estilo y de sujeto: el LoRA sesga la generacion hacia el concepto entrenado (mujeres de figura alta) cuando se incluye la palabra `095`.
- Integracion nativa en flujos de ComfyUI mediante el nodo de carga de LoRA.
- Compatibilidad con la plataforma RunningHub, que permite ejecutar el modelo en linea y via API.
- No soporta tool calling, function calling ni razonamiento multi-paso: no es un modelo linguistico.
- No dispone de modo thinking, vision de entrada ni audio.
- Capacidades multilingues de prompt: no documentadas; dependen del codificador de texto del base.

## Casos de uso

- Prototipado rapido de estilos en ComfyUI: cargar el LoRA junto al base Z-image-turbo y generar variaciones con el trigger `095` para evaluar si el estilo encaja antes de invertir en un entrenamiento propio.
- Generacion de personajes para moodboards de moda: el adaptador esta orientado a figuras altas y estilizadas, por lo que resulta util para bocetos conceptuales de editorial o lookbook.
- Pruebas A/B de adaptadores: al ser un LoRA pequeno (81 MiB), se puede comparar su efecto frente a otros LoRA del mismo base en un mismo pipeline sin recompilar ni recargar el modelo principal.
- Automatizacion via API de RunningHub: integracion en un backend que llame al endpoint de generacion con el prompt y el trigger para producir imagenes bajo demanda.
- Educacion y demostraciones: sirve como ejemplo didactico de como se estructura un LoRA de text-to-image y como se referencia la palabra disparadora en la model card.
- Base para fine-tuning adicional: el adaptador puede servir de punto de partida o de inspiracion para entrenar un LoRA propio con un dataset mas controlado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas objetivas (FID, CLIP score, evaluaciones humanas) ni comparaciones cuantitativas con otros adaptadores.

## Requisitos de hardware

- VRAM estimada para inferencia: depende enteramente del modelo base Z-image-turbo, que no se especifica; el LoRA en si anade un coste marginal (81 MiB en disco y una fraccion pequena de VRAM al fusionarse o aplicarse en runtime).
- GPU recomendadas: no disponibles para el base; para un modelo de difusion o de imagen por transformers de tamano medio es habitual requerir entre 8 y 24 GB de VRAM en funcion de la resolucion y del uso de optimizaciones.
- Compatibilidad con GPU de consumo: no confirmada; depende del base y del runtime (ComfyUI permite descarga parcial a CPU y offloading).
- Opciones de despliegue: ComfyUI (nativo), plataforma RunningHub (online y API). Otros runtimes no estan documentados para este artefacto.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| rh-zimage-turbo-095-runninghub-4000095-lora | LoRA sobre Z-image-turbo | no disponible (81 MiB de pesos) | no aplica | no disponible | Hugging Face, RunningHub |
| LoRA de estilo genericos para modelos de difusion (p. ej. SDXL) | LoRA | variable (decenas a cientos de MiB) | no aplica | variable segun autor | Hugging Face, Civitai |
| Adaptadores de sujeto para Flux | LoRA | variable | no aplica | variable | Hugging Face |

No se dispone de datos de rendimiento del modelo ni de alternativas comparables dentro del ecosistema Z-image-turbo en la informacion proporcionada, por lo que la comparativa se limita a categoria, formato y licencia.

## Limitaciones y advertencias

- Ausencia total de benchmarks y de evaluacion cualitativa publicada: la calidad del adaptador no esta verificada por terceros.
- Sesgo de dominio: el LoRA esta entrenado para un concepto muy concreto (mujeres de figura alta), lo que puede introducir sesgos de genero, corporalidad y estetica, y degradar la diversidad de las salidas cuando se activa el trigger.
- Riesgo de sobreajuste al concepto: al ser un adaptador de sujeto/estilo, puede forzar la apariencia entrenada incluso cuando el prompt pide otra cosa.
- Licencia no declarada de forma explicita: el autor remite a la licencia del proyecto original; es imprescindible verificar la licencia de Z-image-turbo antes de cualquier uso comercial.
- Dependencia del modelo base: el LoRA no es autonomo; sin Z-image-turbo no produce ninguna salida, y su comportamiento puede variar entre versiones del base.
- Idiomas de prompt no documentados: la calidad con prompts en castellano no esta garantizada.
- Model card minima: sin hiperparametros, sin dataset, sin instrucciones de uso detalladas; el nombre del fichero incluye caracteres no ASCII que pueden complicar la automatizacion de descargas.
- Cero descargas y cero likes en el momento de la consulta: no hay senal de validacion por parte de la comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/RunningHubAI/rh-zimage-turbo-095-runninghub-4000095-lora
- Modelo original en RunningHub: https://www.runninghub.ai/model/public/2113302211518713857
- Pagina del autor: https://www.runninghub.ai/user-center/2064710712105979905
- RunningHub International: https://www.runninghub.ai
- RunningHub China: https://www.runninghub.cn
- Documentacion de la API (EN): https://www.runninghub.cn/runninghub-api-doc-en/
- Documentacion de la API (CN): https://www.runninghub.cn/runninghub-api-doc-cn/
- Entrenamiento en RunningHub: https://www.runninghub.ai/page-model
