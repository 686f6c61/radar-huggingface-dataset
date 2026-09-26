# RunningHubAI/rh-anima-red-medicine-style-lora

## Resumen

rh-anima-red-medicine-style-lora es un ajuste de bajo rango (LoRA) publicado por RunningHubAI para generacion y edicion de imagenes, con pipeline declarado image-text-to-image. Segun la model card, el modelo aplica un estilo visual denominado "Anima-Red Medicine Style" y esta afinado a partir de dos referencias indicadas por el autor: krea2 y anima. El repositorio no contiene un modelo completo, sino unicamente los pesos LoRA que se cargan sobre el modelo base correspondiente dentro de ComfyUI, RunningHub o Hugging Face.

El repositorio ocupa 0.3 GB e incluye dos ficheros en formato safetensors: red_medicine_ill.safetensors (218 MiB) y red_v3.safetensors (44 MiB), lo que sugiere dos variantes de intensidad o de iteracion de entrenamiento del mismo estilo. El modelo acumula 0 descargas y 0 likes en el momento de la consulta y fue creado el 26 de septiembre de 2026, con una actualizacion posterior el mismo dia.

Su relevancia es acotada y especifica: no es un modelo de lenguaje ni un modelo fundacional, sino un adaptador de estilo para flujos de trabajo de generacion de imagen. Resulta util para quien ya trabaja con los modelos base mencionados y necesita reproducir una estetica concreta sin reentrenar, y para integrarlo en automatizaciones mediante la API de RunningHub. La informacion publica sobre licencia, idiomas, cuantizacion y datos de entrenamiento es muy limitada o inexistente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador de bajo rango) sobre un modelo de difusion para imagen; arquitectura del modelo base no detallada |
| Parametros totales | no disponible (los ficheros de pesos ocupan 218 MiB y 44 MiB; no se declara el numero de parametros) |
| Longitud de contexto | no aplica (modelo de imagen); no disponible para el codificador de texto del modelo base |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (dependen del codificador de texto del modelo base) |
| Licencia | no disponible; la model card indica que el copyright permanece en el autor y remite a la licencia del proyecto original o upstream |
| Formato de pesos | safetensors |
| Tipo de modelo | LoRA de edicion/generacion de imagen (image edit) |
| Modelos base declarados | krea2, anima (finetuned from) |
| Pipeline declarado | image-text-to-image |
| Archivos | red_medicine_ill.safetensors (218 MiB), red_v3.safetensors (44 MiB) |
| Tamano del repositorio | 0.3 GB |
| Plataformas compatibles | ComfyUI, RunningHub, Hugging Face |
| Autor | RunningHub-@十二雪 (publicado por RunningHubAI) |

## Arquitectura y entrenamiento

Se trata de un adaptador LoRA, es decir, un conjunto de matrices de bajo rango que se acoplan a las capas de un modelo de difusion preentrenado para modificar su comportamiento estilistico sin reentrenar los pesos completos. La model card no especifica el rango del adaptador, las capas objetivo, la resolucion de entrenamiento, el numero de pasos, el optimizador ni la composicion del dataset. Tampoco se detalla si el entrenamiento se realizo sobre el modelo krea2, sobre anima o sobre ambos de forma secuencial.

Los dos ficheros publicados parecen corresponder a dos variantes del mismo estilo: una de mayor tamano (red_medicine_ill.safetensors, 218 MiB), presumiblemente con mayor capacidad o mas capas entrenadas, y otra mas ligera (red_v3.safetensors, 44 MiB). La model card no explica la diferencia funcional entre ambas, por lo que la eleccion entre una y otra requiere prueba empirica por parte del usuario.

No se documenta ningun mecanismo tecnico adicional (decodificacion especulativa, atencion lineal, destilacion, RLHF o DPO), ni resultados de evaluacion. La unica informacion de procedencia es que el entrenamiento puede realizarse en la propia plataforma RunningHub, segun el enlace incluido en la model card.

## Capacidades

- Generacion de imagenes condicionada por texto, integrada en el pipeline image-text-to-image declarado.
- Edicion o reestilizado de imagenes de entrada: al ser un LoRA de tipo "image edit", se aplica sobre una imagen existente junto con una instruccion textual.
- Transferencia de estilo concreto: reproduce la estetica "Anima-Red Medicine Style" definida por el autor.
- Dos variantes de peso intercambiables (ill y v3) para modular el resultado.
- Compatibilidad con flujos de trabajo de ComfyUI, lo que permite encadenarlo con nodos de control (por ejemplo, ControlNet o IP-Adapter si el modelo base los soporta).
- Uso mediante la API de RunningHub para ejecucion remota y automatizada.
- No soporta tool calling ni function calling: no es un modelo de lenguaje.
- No soporta agentes ni razonamiento multi-paso: no aplica a este tipo de modelo.
- Capacidades multilingues: no documentadas; dependen exclusivamente del codificador de texto del modelo base.
- No se declaran capacidades de audio, video ni modo de razonamiento explicito.

## Casos de uso

- Ilustracion de estilo consistente en produccion grafica: el LoRA permite generar series de imagenes con una misma estetica sin reentrenar el modelo base, lo que reduce coste y tiempo frente a un ajuste completo.
- Reestilizado de fotografias o ilustraciones existentes: al tratarse de un adaptador de edicion image-text-to-image, se puede tomar una imagen de partida y aplicar la estetica del LoRA manteniendo la composicion original.
- Generacion de assets para videojuegos o narrativa visual: util para producir variaciones de personajes y escenarios dentro de una direccion de arte fija, encadenando el LoRA con nodos de control de pose o composicion en ComfyUI.
- Automatizacion por API: la publicacion incluye enlaces a la API de RunningHub, de modo que el adaptador puede invocarse desde un backend para generar imagenes bajo demanda sin gestionar infraestructura de GPU propia.
- Prototipado rapido de portadas y material editorial: la variante ligera (44 MiB) permite iterar con tiempos de carga menores durante las fases de exploracion, reservando la variante de 218 MiB para las versiones finales.
- Comparacion de variantes de estilo en un mismo pipeline: disponer de dos pesos permite hacer pruebas A/B dentro del mismo flujo de ComfyUI para decidir que version encaja mejor con la direccion artistica del proyecto.
- Docencia y demostracion de tecnicas LoRA: el reducido tamano de los ficheros y su compatibilidad con ComfyUI lo hacen adecuado para ejemplos practicos sobre adaptadores de estilo y su efecto en la generacion de imagen.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

La model card no incluye metricas objetivas (FID, CLIP score, similitud estetica, precision de edicion) ni comparaciones cuantitativas con otros adaptadores. Tampoco se documentan tiempos de inferencia ni throughput.

## Requisitos de hardware

- El repositorio solo contiene pesos LoRA (0.3 GB en total), por lo que el requisito real de VRAM lo determina el modelo base sobre el que se aplique, no el adaptador.
- Los modelos base declarados (krea2, anima) no acompanan requisitos de hardware en la informacion disponible.
- A modo orientativo, y como estimacion general para modelos de difusion de imagen de escala media-alta, la inferencia suele requerir del orden de 8 a 12 GB de VRAM con pesos en FP8 o GGUF cuantizado, y de 16 a 24 GB en FP16. Esta cifra es una referencia generica, no un dato confirmado para este modelo.
- GPU recomendadas: no disponibles. Como referencia habitual en este tipo de cargas, RTX 3060 12 GB o superiores cubren los escenarios cuantizados; RTX 4090, A100 o H100 permiten trabajar en precision completa y con lotes mayores.
- Compatibilidad con GPU de consumo: probable en GPUs con 12 GB o mas si el modelo base se carga cuantizado, pero no confirmado por el autor.
- Opciones de despliegue: ComfyUI (entorno principal indicado), plataforma RunningHub y su API. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a modelos de difusion de imagen.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye otros adaptadores LoRA de estilo comparables ni datos de rendimiento que permitan establecer una comparacion objetiva. Cualquier comparacion deberia hacerse contra otros LoRA de estilo para los mismos modelos base (krea2 o anima) y requeriria evaluar licencia, tamano de pesos, compatibilidad con ComfyUI y calidad subjetiva del resultado, datos que no se aportan en esta ficha.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados, pero al ser un LoRA de estilo entrenado por un tercero, puede heredar sesgos del dataset de entrenamiento (no publicado) y del modelo base.
- Riesgo de sobreajuste estilistico: los adaptadores de estilo tienden a imponer su estetica sobre el prompt, lo que puede reducir la diversidad de resultados o dificultar el control fino de la composicion.
- Alucinacion: en modelos de imagen se traduce en artefactos, deformaciones anatomicas o elementos incoherentes respecto al prompt; no hay datos de evaluacion al respecto.
- Diferencia entre las dos variantes: la model card no explica en que se distinguen red_medicine_ill.safetensors y red_v3.safetensors, por lo que su comportamiento debe validarse empiricamente.
- Licencia no disponible: no se especifica una licencia explicita. La model card indica que el copyright permanece en el autor y remite a la licencia del proyecto original o upstream. Esto genera incertidumbre juridica para uso comercial, por lo que se recomienda contactar con el autor antes de desplegarlo en produccion.
- Dependencia de plataforma: parte de la documentacion y de la via de uso recomendada apuntan a los servicios de RunningHub, lo que puede implicar dependencia de un proveedor externo si se utiliza la API.
- Idiomas no documentados: el soporte linguistico de los prompts depende del codificador de texto del modelo base; no hay garantia para el castellano.
- Ausencia de benchmarks: no existen metricas publicadas que permitan estimar calidad, fidelidad al prompt o estabilidad entre semillas.
- Actividad nula: 0 descargas y 0 likes, sin historial de validacion por parte de la comunidad.
- Fechas incoherentes: las marcas temporales del repositorio (septiembre de 2026) son posteriores a la fecha habitual de consulta; conviene verificar el estado actual del repositorio antes de integrarlo.

## Enlaces

- HuggingFace: https://huggingface.co/RunningHubAI/rh-anima-red-medicine-style-lora
- Modelo original en RunningHub: https://www.runninghub.cn/model/public/2074088681828347905
- Pagina del autor: https://www.runninghub.cn/user-center/2011770127833632769
- RunningHub (internacional): https://www.runninghub.ai
- RunningHub (China): https://www.runninghub.cn
- Documentacion de la API (ingles): https://www.runninghub.cn/runninghub-api-doc-en/
- Documentacion de la API (chino): https://www.runninghub.cn/runninghub-api-doc-cn/
- Entrenamiento de modelos en RunningHub: https://www.runninghub.ai/page-model
- Detalle de la API de Seedance 2.5: https://www.runninghub.ai/call-api/api-detail/2133100000000700025
