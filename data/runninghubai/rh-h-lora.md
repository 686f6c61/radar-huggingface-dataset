# RunningHubAI/rh-h-lora

## Resumen

rh-h-lora es un adaptador LoRA publicado por RunningHubAI, la plataforma de RunningHub, para su uso en flujos de trabajo de ComfyUI y en la propia plataforma RunningHub. Se trata de un ajuste fino derivado de WAN2.2, el modelo de generacion de video de Alibaba, y su unico artefacto publicado es un fichero de pesos `Kiss_high.safetensors` de 293 MiB. El repositorio no incluye pipeline declarado, licencia explicita, idiomas ni documentacion tecnica mas alla de la model card.

El modelo resuelve una tarea muy acotada: la generacion de video de contenido intimo (besos con lengua) dentro del ecosistema ComfyUI. No es un modelo de lenguaje ni un modelo fundacional, sino un adaptador de bajo rango que modifica el comportamiento de un modelo base de video. Por tanto, su relevancia es limitada fuera de ese nicho creativo y de la plataforma que lo aloja.

La informacion disponible es escasa: cero descargas, cero likes, sin benchmarks, sin ficha de licencia y sin especificaciones de entrenamiento. Esta ficha documenta lo que se puede verificar y marca explicitamente como no disponible todo lo que el autor no ha publicado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador de bajo rango) sobre WAN2.2 |
| Parametros totales | no disponible (el fichero pesa 293 MiB; el numero de parametros no se declara) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo de video, no de texto) |
| Tipos de cuantizacion | no disponible (pesos en safetensors, presumiblemente fp16/bf16) |
| Idiomas soportados | no disponible |
| Licencia | no disponible (la model card remite a la licencia del proyecto original o upstream) |
| Formato de pesos | safetensors (`Kiss_high.safetensors`, 293 MiB) |

## Arquitectura y entrenamiento

El artefacto es un adaptador LoRA, es decir, un conjunto de matrices de bajo rango que se inyectan en las capas del modelo base WAN2.2 para especializarlo en un dominio concreto. WAN2.2 es un modelo de generacion de video de Alibaba, y el sufijo "high" del fichero sugiere que el adaptador esta pensado para la etapa o el modulo de alta resolucion de un pipeline de difusion de video, aunque el autor no lo confirma.

No se han publicado datos sobre el conjunto de entrenamiento: ni numero de pasos, ni resolucion de los clips, ni composicion del dataset, ni si hubo tecnicas de regularizacion o preferencia. La model card se limita a indicar "Finetuned from: WAN2.2" y a ofrecer el fichero de pesos. Tampoco se documenta el rango del LoRA ni el factor alpha.

## Capacidades

- Generacion de video de contenido intimo (besos) dentro de pipelines ComfyUI que usen WAN2.2 como modelo base.
- Integracion como nodo LoRA en flujos de ComfyUI y en la plataforma RunningHub.
- Especializacion estilistica y de contenido sobre el modelo base; no aporta capacidades nuevas fuera de ese dominio.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No tiene capacidades multilingues declaradas (no es un modelo de texto).
- No dispone de modo thinking, vision ni audio como capacidades propias; hereda las del modelo base de video.

## Casos de uso

- Produccion de clips cortos de tematica romantica o intima para proyectos creativos: el LoRA se carga sobre WAN2.2 en ComfyUI y se aplica a prompts especificos para obtener el estilo deseado.
- Prototipado rapido en RunningHub: al estar alojado en la plataforma, se puede probar en linea sin montar infraestructura local, util para evaluar si el adaptador encaja en un flujo mayor.
- Pruebas de concepto de pipelines de video con LoRA: sirve como ejemplo de como estructurar un adaptador de bajo rango sobre WAN2.2 y comparar su efecto frente al modelo base sin ajuste.
- Generacion de material para storyboards o moodboards de ficcion: el adaptador permite explorar escenas concretas con un estilo consistente dentro de una secuencia de video.
- Investigacion sobre especializacion de modelos de difusion de video: util para estudiar como un LoRA de 293 MiB modifica el comportamiento de WAN2.2 en un dominio acotado.
- Demostraciones y contenido para plataformas creativas: el adaptador puede integrarse en flujos de generacion automatizada de clips dentro de ComfyUI para produccion de contenido de nicho.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible para el LoRA aislado; depende del modelo base WAN2.2 y de la resolucion y duracion del video generado.
- GPU recomendadas: no disponibles; para modelos de video de la familia WAN2.2 se suele requerir VRAM alta (A100, H100 o RTX 4090), pero el autor no lo especifica.
- Cabe en GPU de consumo: no confirmado; el adaptador en si ocupa 293 MiB, pero el modelo base de video condiciona el requisito real.
- Opciones de despliegue: ComfyUI, plataforma RunningHub (en linea) y, presumiblemente, cualquier runtime que cargue safetensors compatible con WAN2.2.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. No se han identificado en la informacion proporcionada adaptadores LoRA comparables sobre WAN2.2 ni alternativas de la misma categoria con datos verificables.

## Limitaciones y advertencias

- Contenido explicito: el adaptador esta entrenado para generar escenas de contenido intimo; su uso en produccion debe cumplir las politicas de contenido de la plataforma y la legislacion aplicable.
- Licencia no declarada: la model card remite a la licencia del proyecto original o upstream, lo que impide confirmar si el uso comercial esta permitido.
- Sin datos de entrenamiento: no se puede evaluar la calidad, la estabilidad ni la tendencia a artefactos del adaptador mas alla de probarlo.
- Dependencia del modelo base: cualquier limitacion de WAN2.2 (resolucion, duracion, coherencia temporal) se hereda.
- Riesgo de sobreajuste al dominio: al ser un LoRA especializado, puede degradar la calidad en prompts fuera de su tematica.
- Cero adopcion verificable: sin descargas ni likes, no hay evidencia de la comunidad sobre su funcionamiento.
- Idiomas y sesgos: no documentados.

## Enlaces

- HuggingFace: https://huggingface.co/RunningHubAI/rh-h-lora
- Modelo original en RunningHub: https://www.runninghub.cn/model/public/1994324341684977666
- Pagina del autor: https://www.runninghub.cn/user-center/1934975843624202242
- RunningHub International: https://www.runninghub.ai
- RunningHub China: https://www.runninghub.cn
- Documentacion de la API (EN): https://www.runninghub.cn/runninghub-api-doc-en/
- Documentacion de la API (CN): https://www.runninghub.cn/runninghub-api-doc-cn/
- Entrenamiento en RunningHub: https://www.runninghub.ai/page-model
