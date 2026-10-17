# RunningHubAI/rh-cepai-lora

# Rh-cepai-lora

## Resumen

Rh-cepai-lora es un adaptador LoRA de edicion de imagen publicado en Hugging Face por la cuenta RunningHubAI, que actua como distribuidor en nombre de un autor de su plataforma. El repositorio contiene un unico artefacto: un fichero `safetensors` de 448 MiB (`厕拍-厕所隐藏摄像头-Lorakrea2_cepai_lora.safetensors`), etiquetado con el pipeline `image-text-to-image` y los tags `comfyui` y `lora`, y declarado como finetune de un modelo base denominado `krea2`. No se especifican rango, alpha, modulos objetivo, precision ni procedimiento de entrenamiento.

A diferencia de un modelo generativo completo, un LoRA no es autonomo: necesita cargarse sobre su modelo base dentro de ComfyUI, RunningHub o un pipeline equivalente para producir salida. La model card no documenta la arquitectura del modelo base, el dataset de entrenamiento, el numero de pasos ni el metodo de ajuste, por lo que la informacion tecnica verificable es minima.

Es necesario senalar que el nombre del fichero de pesos describe de forma explicita contenido de tipo voyeuristico obtenido mediante camaras ocultas en aseos. Esto situa el adaptador en el ambito de la generacion de imagenes intimo-sexuales no consentidas, una practica ilegal en Espana y en la mayor parte de jurisdicciones. Esta ficha se limita a documentar el artefacto, su procedencia y sus riesgos tecnicos y legales; no se describe ningun procedimiento de uso.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador de bajo rango) sobre el modelo base `krea2` |
| Parametros totales | No disponible. Estimacion aproximada de 235 millones de parametros a partir del tamano del fichero (448 MiB) asumiendo almacenamiento en fp16; el autor no lo declara |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica (modelo de difusion para imagen, no un modelo de lenguaje) |
| Tipos de cuantizacion | No disponible. El repositorio solo publica pesos en `safetensors`; no se ofrecen variantes GGUF ni cuantizadas |
| Idiomas soportados | No disponible (las etiquetas de idioma no figuran en el repositorio) |
| Licencia | No disponible. La model card indica que el copyright permanece en el autor y remite a la licencia del proyecto original o del modelo base |
| Formato de pesos | `safetensors` |

## Arquitectura y entrenamiento

Se trata de un adaptador LoRA, es decir, un conjunto de matrices de bajo rango que se inyectan en las capas de atencion y/o proyeccion de un modelo de difusion preentrenado para especializarlo en un dominio o estilo concreto. El modelo base declarado es `krea2`, sin mas detalle sobre su version, configuracion o licencia. El repositorio no publica el rango (`r`), el parametro `alpha`, los modulos objetivo ni la tasa de aprendizaje empleada.

Tampoco se documenta el dataset de entrenamiento: no hay numero de imagenes, resolucion, composicion, ni indicacion de si se aplico regularizacion, captioning automatico o ajuste con preferencias humanas. La unica informacion operativa es que el entrenamiento se realizo en la plataforma RunningHub, que ofrece un servicio de entrenamiento de LoRAs. El peso del fichero (448 MiB) sugiere un adaptador de rango relativamente alto para los estandares habituales de la comunidad, pero esto es una inferencia, no un dato confirmado por el autor.

## Capacidades

- Edicion de imagen condicionada por texto e imagen de entrada, segun el pipeline declarado (`image-text-to-image`).
- Aplicacion como adaptador sobre el modelo base `krea2` en flujos de ComfyUI.
- Integracion en la plataforma RunningHub y su API, segun los enlaces de la model card.
- No dispone de generacion de texto, razonamiento, codigo ni matematicas: no es un modelo de lenguaje.
- No soporta tool calling, function calling ni razonamiento multi-paso.
- No se documentan capacidades multilingues ni modos especiales (thinking, audio, video).
- La especializacion declarada del adaptador es la generacion de imagenes de tipo voyeuristico, lo que constituye su unica funcion documentada y no una capacidad de proposito general.

## Casos de uso

No se identifican casos de uso legitimos para este adaptador. Su especializacion declarada consiste en la produccion de imagenes de personas en aseos captadas de forma no consentida, lo que configura material de abuso intimo no consentido y es ilicito en Espana (entre otros, articulos 197 y 197.7 del Codigo Penal, y la Directiva (UE) 2024/1385 sobre violencia contra las mujeres). Por tanto, no se recomienda su despliegue en ningun escenario. Los unicos contextos en los que el artefacto puede tener cabida son de analisis y mitigacion:

- Auditoria de seguridad de plataformas: uso del adaptador como caso de prueba interno para medir si los filtros de contenido de un servicio de generacion de imagenes detectan y bloquean la produccion de material intimo no consentido.
- Entrenamiento de clasificadores de deteccion: generacion controlada de muestras sinteticas en un entorno aislado para alimentar modelos de clasificacion y hashing que permitan identificar y retirar este tipo de contenido en servicios de alojamiento.
- Investigacion academica sobre proliferacion de NCII: analisis de como los ecosistemas de LoRAs y plataformas de inferencia como servicio distribuyen adaptadores abusivos, incluyendo el estudio de la cadena de publicacion y sus lagunas de moderacion.
- Red-teaming de modelos base: evaluacion de si el modelo `krea2` y sus derivados permiten la especializacion hacia dominios prohibidos mediante ajuste ligero, para informar politicas de uso aceptable.
- Analisis forense: caracterizacion de las huellas estadisticas que deja un adaptador de este tipo en la salida de un modelo de difusion, con el objetivo de atribuir y detectar imagenes sinteticas abusivas.
- Cumplimiento normativo: uso como ejemplo documentado en auditorias internas de conformidad con la Ley de Servicios Digitales y el Reglamento europeo de IA, para justificar la necesidad de filtros en la publicacion de pesos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas objetivas (FID, CLIP score, similitud con imagenes de referencia), ni comparaciones cuantitativas con otros adaptadores, ni evaluaciones de fidelidad de edicion.

## Requisitos de hardware

- VRAM adicional del adaptador: aproximadamente 0,5 GB para cargar el fichero de 448 MiB en memoria, sumados a los requisitos del modelo base.
- Requisitos del modelo base `krea2`: no disponibles. El repositorio no indica VRAM, precision ni resolucion de trabajo del modelo sobre el que se monta el LoRA.
- GPU recomendadas: no disponibles para este adaptador. Como referencia no verificada y no extraida del repositorio, los modelos de difusion de la clase Krea/FLUX suelen requerir entre 12 y 24 GB de VRAM segun precision; este dato debe confirmarse con la documentacion del modelo base.
- Compatibilidad con GPU de consumo: no confirmada. Depende exclusivamente del modelo base, no del adaptador.
- Opciones de despliegue: ComfyUI, la plataforma RunningHub y su API son los entornos mencionados por el autor. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de artefacto.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Rh-cepai-lora | LoRA de edicion de imagen sobre `krea2` | No disponible (~235 M estimados) | No aplica | Sin datos publicos | No disponible | Hugging Face y RunningHub |
| Otros LoRAs de edicion de imagen en RunningHub | LoRA sobre modelos base de difusion | No disponible | No aplica | Sin datos publicos | No disponible | RunningHub |
| Adaptadores LoRA de edicion publicados por la comunidad (por ejemplo, familias sobre FLUX o SDXL) | LoRA sobre modelo base | Variable, tipicamente 20-200 M | No aplica | Metricas variables, no comparables entre si | Habitualmente licencias abiertas o de modelo base | Hugging Face, Civitai |

No se dispone de datos publicados que permitan una comparacion cuantitativa honesta con alternativas. La comparativa anterior es estructural y no de rendimiento.

## Limitaciones y advertencias

- Uso ilicito por diseno: el adaptador esta orientado a generar material intimo no consentido, lo que puede constituir delito en Espana y en la mayoria de paises de la Union Europea, con independencia de que las imagenes sean sinteticas.
- Ausencia de licencia explicita: la model card no concede una licencia clara. Se indica que el copyright permanece en el autor y que debe seguirse la licencia del proyecto original o del modelo base, lo que deja el uso comercial en una situacion juridica indeterminada.
- Falta total de documentacion tecnica: no se publican rango, alpha, modulos objetivo, dataset, pasos de entrenamiento ni evaluacion, lo que impide reproducir, auditar o evaluar el adaptador.
- Riesgo de reproduccion de sesgos y de representaciones degradantes de las personas retratadas.
- Dependencia del modelo base: cualquier fallo, cambio de version o retirada de `krea2` inutiliza el adaptador.
- Riesgo reputacional y de cumplimiento para cualquier plataforma que lo aloje o lo sirva, incluidas obligaciones de moderacion bajo la Ley de Servicios Digitales.
- Metadatos anomalos: la fecha de creacion declarada (2026-10-16) es posterior a la fecha actual de consulta habitual, lo que sugiere un error de registro o una fecha manipulada; conviene no tomarla como referencia.
- Contradiccion interna en la model card: el apartado "About this model" contiene unicamente un fragmento `<p>1</p>`, sin descripcion real del modelo.
- Cero traccion verificable: 0 descargas y 0 likes en el momento de la consulta, sin historial de uso que permita inferir calidad o comportamiento real.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/RunningHubAI/rh-cepai-lora
- Modelo original en RunningHub: https://www.runninghub.ai/model/public/2098432106165972994
- Pagina del autor en RunningHub: https://www.runninghub.ai/user-center/1986078446017196033
- Plataforma RunningHub (internacional): https://www.runninghub.ai
- Plataforma RunningHub (China): https://www.runninghub.cn
- Documentacion de la API de RunningHub (ingles): https://www.runninghub.cn/runninghub-api-doc-en/
- Documentacion de la API de RunningHub (chino): https://www.runninghub.cn/runninghub-api-doc-cn/
- Servicio de entrenamiento de modelos de RunningHub: https://www.runninghub.ai/page-model
