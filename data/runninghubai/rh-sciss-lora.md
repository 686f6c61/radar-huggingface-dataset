# RunningHubAI/rh-sciss-lora

## Resumen

rh-sciss-lora es un adaptador LoRA publicado por RunningHubAI para su uso en flujos de trabajo de ComfyUI y en la plataforma RunningHub. Segun la model card, los pesos se han ajustado (finetuned) a partir de un modelo base identificado como `minimax-h3`, si bien no se proporciona informacion adicional sobre la naturaleza exacta de dicho modelo base (modalidad, arquitectura o tamano). El repositorio contiene un unico artefacto de pesos en formato safetensors de 148 MiB, lo que es coherente con un adaptador de bajo rango y no con un modelo completo.

El modelo se distribuye con muy poca documentacion tecnica: no se especifican parametros, longitud de contexto, idiomas, licencia explicita ni resultados de evaluacion. La etiqueta `lora` y la mencion a ComfyUI sugieren que esta orientado a generacion de imagenes o video, aunque la model card no lo confirma de forma directa. La relevancia actual es limitada fuera del ecosistema RunningHub: su utilidad practica depende de cargarlo junto al modelo base `minimax-h3` en la plataforma indicada.

Dado el escaso detalle disponible, esta ficha recoge lo que la informacion proporcionada permite afirmar y marca explicitamente como "no disponible" todo aquello que no se puede verificar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador de bajo rango) sobre el modelo base `minimax-h3`; arquitectura del base no disponible |
| Parametros totales | no disponible (pesos LoRA de 148 MiB; numero de parametros no declarado) |
| Parametros activos | no aplica (no es MoE segun la informacion disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (se distribuye en safetensors; cuantizaciones del base no declaradas) |
| Idiomas soportados | no disponible |
| Licencia | no disponible (la model card remite a la licencia del proyecto original o upstream) |
| Formato de pesos | safetensors (`h3_scissoring.safetensors`, 148 MiB) |

## Arquitectura y entrenamiento

La informacion disponible indica unicamente que se trata de un LoRA, es decir, un adaptador de bajo rango que modifica los pesos de un modelo base congelado. El modelo base declarado es `minimax-h3`, del que no se aportan detalles sobre arquitectura, numero de parametros ni modalidad. El unico fichero de pesos, `h3_scissoring.safetensors`, ocupa 148 MiB, un tamano tipico de adaptadores LoRA para modelos de difusion o de lenguaje de gran tamano, pero no permite inferir el tamano del base.

No se especifican datos de entrenamiento: ni numero de tokens o imagenes, ni composicion del dataset, ni si se emplearon tecnicas de alineacion como RLHF o DPO. Tampoco se documentan innovaciones tecnicas asociadas al adaptador. El nombre del fichero (`h3_scissoring`) sugiere un ajuste orientado a un concepto o estilo concreto, pero la model card no lo confirma. Cualquier afirmacion adicional sobre el proceso de entrenamiento seria especulativa y no se incluye.

## Capacidades

- Aplicacion de un ajuste LoRA sobre el modelo base `minimax-h3`; la naturaleza exacta de la capacidad (generacion de imagen, video o texto) no esta declarada en la informacion disponible.
- Carga en ComfyUI, segun la etiqueta `comfyui` del repositorio.
- Uso en la plataforma RunningHub y a traves de su API, segun los enlaces de la model card.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible.
- Capacidades especiales (modo thinking, vision, audio): no disponible.

## Casos de uso

- Experimentacion en ComfyUI: cargar `h3_scissoring.safetensors` como nodo LoRA junto al modelo base `minimax-h3` para probar el ajuste en flujos de generacion locales, aprovechando que ComfyUI gestiona la carga de adaptadores de forma nativa.
- Prototipado en RunningHub: usar la plataforma indicada en la model card para ejecutar el LoRA sin infraestructura propia, util para evaluar el ajuste antes de integrarlo en un pipeline.
- Integracion via API de RunningHub: invocar el modelo publico referenciado en la model card desde una aplicacion externa mediante la API documentada, para incorporar el ajuste a un producto sin desplegar el modelo base.
- Pruebas de concepto de estilo o concepto: dado el nombre del fichero (`h3_scissoring`), emplearlo para evaluar si el ajuste reproduce el concepto o estilo para el que fue entrenado, comparando resultados con y sin el adaptador.
- Comparacion de adaptadores: cargar distintos LoRA sobre el mismo base `minimax-h3` en ComfyUI para medir diferencias cualitativas entre ajustes, usando este como uno mas de la bateria.
- Reentrenamiento o fusion de pesos: al ser safetensors, el adaptador puede inspeccionarse y combinarse con otras tecnicas de merge de LoRA en entornos que lo soporten, siempre que la licencia del base lo permita.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El adaptador pesa 148 MiB, pero el requisito real lo determina el modelo base `minimax-h3`, cuyas dimensiones no se declaran.
- GPU recomendadas: no disponible, al depender del modelo base.
- Compatibilidad con GPU de consumo: no determinable con la informacion proporcionada.
- Opciones de despliegue: ComfyUI y la plataforma RunningHub son las vias documentadas; el uso de vLLM, llama.cpp, Ollama o TGI no se menciona y depende de la arquitectura del base.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no identifica modelos comparables de la misma categoria ni ofrece datos de rendimiento que permitan establecer una comparacion fundamentada.

## Limitaciones y advertencias

- Documentacion muy escasa: no se declaran parametros, contexto, idiomas ni licencia, lo que dificulta evaluar su idoneidad para produccion.
- Licencia no explicitada: la model card remite a la licencia del proyecto original o upstream, por lo que el uso comercial queda condicionado a los terminos de `minimax-h3`, que no se detallan.
- Dependencia total del modelo base: el adaptador no funciona de forma autonoma y su comportamiento solo puede evaluarse junto a `minimax-h3`.
- Riesgo de alucinacion o artefactos: no evaluable sin datos de entrenamiento ni benchmarks.
- Sesgos conocidos: no documentados.
- Cero descargas y cero likes en el momento de la consulta: no hay evidencia de uso comunitario ni validacion externa.
- La model card contiene texto incompleto (por ejemplo, un parrafo reducido a `<p>,</p>`), lo que sugiere una publicacion apresurada y aumenta el riesgo de metadatos poco fiables.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/RunningHubAI/rh-sciss-lora
- Modelo original en RunningHub: https://www.runninghub.ai/model/public/2098076956729638914
- Pagina del autor en RunningHub: https://www.runninghub.ai/user-center/1986078446017196033
- RunningHub (internacional): https://www.runninghub.ai
- RunningHub (China): https://www.runninghub.cn
- Documentacion de la API (ingles): https://www.runninghub.cn/runninghub-api-doc-en/
- Documentacion de la API (chino): https://www.runninghub.cn/runninghub-api-doc-cn/
- Entrenamiento en RunningHub: https://www.runninghub.ai/page-model
