# RunningHubAI/rh-voyeur-handjob-lora

## Resumen

`rh-voyeur-handjob-lora` es un adaptador LoRA publicado por RunningHubAI para su uso dentro de ComfyUI y de la plataforma RunningHub. Segun la model card del autor, los pesos estan afinados a partir de WAN2.2, un modelo de generacion de video, y se distribuyen en un unico fichero `safetensors` de 146 MiB etiquetado como `high_noise`. No se trata de un modelo de lenguaje: es un adaptador de difusion orientado a generacion de video, por lo que las metricas habituales de esta ficha (parametros totales, contexto, benchmarks de razonamiento o codigo) no aplican y se marcan como no disponibles.

El repositorio tiene un tamano total de 0,2 GB, cero descargas y cero likes en el momento de la consulta, y fue creado y actualizado el 4 de noviembre de 2026 con un minuto de diferencia, lo que sugiere una publicacion automatizada desde el pipeline de RunningHub. La model card es practicamente un formulario de plataforma: no incluye descripcion tecnica del entrenamiento, del dataset ni de hiperparametros.

El modelo esta marcado con `not-for-all-audiences` y su nombre y tematica son explicitamente de contenido para adultos. Cualquier uso en produccion requiere verificacion de edad, cumplimiento normativo y, muy probablemente, restricciones adicionales de la plataforma de origen. La licencia no se declara de forma concreta: la card remite a "la licencia del proyecto original o upstream", lo que deja la situacion legal sin resolver para uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA sobre WAN2.2 (modelo de difusion para video); detalles de la arquitectura base no disponibles |
| Parametros totales | no disponible (adaptador LoRA; el fichero pesa 146 MiB) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de difusion, no de lenguaje) |
| Tipos de cuantizacion | no disponible; se distribuye en `safetensors` (precision del adaptador no declarada) |
| Idiomas soportados | no disponible (no es un modelo linguistico) |
| Licencia | no disponible; la card remite a la licencia del proyecto original o upstream |
| Formato de pesos | `safetensors` (`voyeur_handjob_000000160_high_noise.safetensors`) |

## Arquitectura y entrenamiento

El artefacto es un adaptador LoRA, es decir, un conjunto de matrices de bajo rango que se inyectan en las capas de un modelo base congelado. Segun la model card, el modelo base es WAN2.2, un generador de video por difusion. El sufijo `high_noise` del nombre del fichero indica que el adaptador esta pensado para la etapa de alto ruido del proceso de difusion, lo que en la practica implica que se combina con otros componentes (tipicamente un LoRA de bajo ruido y el modelo base) dentro de un grafo de ComfyUI.

No hay informacion sobre el numero de pasos de entrenamiento, el dataset, el rango del LoRA, el learning rate ni si se aplicaron tecnicas como regularizacion o dropout. El nombre incluye el fragmento `000000160`, que podria corresponder a un identificador interno de paso o de checkpoint, pero el autor no lo documenta. Tampoco se detalla si el adaptador afecta solo al modulo de atencion o tambien a las capas feed-forward.

## Capacidades

- Generacion de video condicionada por texto mediante difusion, heredada del modelo base WAN2.2.
- Aplicacion de un estilo o tematica concreta (contenido para adultos) sobre las generaciones del modelo base.
- Integracion en flujos de ComfyUI como nodo de carga de LoRA.
- Uso a traves de la plataforma RunningHub, que ofrece ejecucion online y API.
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso: no es un modelo de lenguaje.
- No dispone de capacidades multilingues en el sentido de comprension de texto; los prompts dependen del codificador de texto del modelo base.
- No se documentan modos especiales (thinking, vision, audio) mas alla de la generacion de video.

## Casos de uso

- Prototipado de video generativo en ComfyUI: cargar el LoRA junto al modelo base WAN2.2 y un LoRA de bajo ruido para explorar variaciones estilisticas en un grafo local.
- Investigacion sobre adaptadores de bajo rango en difusion de video: sirve como ejemplo de adaptador `high_noise` de 146 MiB para estudiar como afecta la inyeccion de LoRA en distintas etapas del muestreo.
- Evaluacion de pipelines de la plataforma RunningHub: el modelo se puede ejecutar online a traves de su API, lo que permite comparar la inferencia remota con la local.
- Pruebas de integracion de nodos LoRA en ComfyUI: util para validar la carga de `safetensors` y la composicion de multiples adaptadores en un mismo grafo.
- Benchmarking de consumo de VRAM: al ser un adaptador pequeno, permite medir el coste marginal de anadir un LoRA al modelo base en distintas configuraciones de hardware.
- Docencia sobre tecnicas de ajuste eficiente: como caso de estudio de publicacion automatizada de adaptadores y de las carencias de documentacion que ello conlleva.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible para el adaptador de forma aislada; el consumo vendra determinado por el modelo base WAN2.2 y por el resto de componentes del grafo (VAE, codificador de texto, LoRA de bajo ruido).
- El adaptador en si ocupa 146 MiB en disco y un espacio similar en memoria al cargarse.
- GPU recomendadas: no disponibles; dependen del modelo base. Para difusion de video se suelen requerir GPUs con 16 GB o mas de VRAM, pero el autor no aporta cifras.
- Compatibilidad con GPU de consumo: no confirmada por el autor; el cuello de botella sera el modelo base, no el LoRA.
- Opciones de despliegue: ComfyUI (formato nativo), plataforma RunningHub (online y API). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a modelos de difusion.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| rh-voyeur-handjob-lora | LoRA sobre WAN2.2 | no disponible (146 MiB) | no aplica | no disponible | Hugging Face, RunningHub |
| Alternativas de LoRA para WAN2.2 | LoRA sobre WAN2.2 | variable | no aplica | variable | no disponible en la informacion proporcionada |
| Modelos de video base (WAN2.2) | difusion de video | no disponible | no aplica | no disponible | no disponible |

No se dispone de datos suficientes para establecer una comparativa cuantitativa con alternativas concretas.

## Limitaciones y advertencias

- Contenido para adultos: el repositorio esta marcado como `not-for-all-adults` y su tematica es explicita; requiere verificacion de edad y control de acceso.
- Licencia ambigua: la card no declara una licencia concreta y remite a la del proyecto upstream, lo que impide confirmar si el uso comercial esta permitido.
- Documentacion practicamente inexistente: no hay datos de entrenamiento, dataset, hiperparametros ni evaluacion, lo que dificulta reproducir o auditar el adaptador.
- Riesgo de artefactos y alucinacion visual: como todo modelo de difusion, puede generar anatomia incoherente, parpadeos entre fotogramas y contenido no solicitado.
- Dependencia del modelo base: el comportamiento final depende de WAN2.2 y de los demas LoRA del grafo; el adaptador aislado no es funcional.
- Sin soporte linguistico propio: la calidad de la generacion dependera del codificador de texto del modelo base y de la formulacion del prompt.
- Repositorio sin traccion: cero descargas y cero likes, sin evidencia de validacion por parte de la comunidad.
- Posible publicacion automatizada: la diferencia de un minuto entre creacion y actualizacion sugiere un pipeline automatico, con el consiguiente riesgo de falta de revision humana.

## Enlaces

- Hugging Face: https://huggingface.co/RunningHubAI/rh-voyeur-handjob-lora
- Modelo original en RunningHub: https://www.runninghub.ai/model/public/2070144788816547841
- Pagina del autor: https://www.runninghub.ai/user-center/1928417917493235713
- RunningHub (internacional): https://www.runninghub.ai
- RunningHub (China): https://www.runninghub.cn
- Documentacion de la API (EN): https://www.runninghub.cn/runninghub-api-doc-en/
- Documentacion de la API (CN): https://www.runninghub.cn/runninghub-api-doc-cn/
- Entrenamiento en RunningHub: https://www.runninghub.ai/page-model
