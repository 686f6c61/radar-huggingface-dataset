# mradermacher/Ling-3.2-air-i1-GGUF

## Resumen

Ling-3.2-air-i1-GGUF es una distribucion de cuantizaciones en formato GGUF del modelo Ling-3.2-air, desarrollado originalmente por inclusionAI. El repositorio lo mantiene mradermacher, un conocido publicador de cuantizaciones, y esta pensado para ejecutar el modelo en entornos con recursos limitados mediante llama.cpp y herramientas compatibles. El modelo base cuenta con 127.486.405.600 parametros totales (aproximadamente 127,5 mil millones), lo que lo situa en la categoria de modelos de gran escala.

La relevancia de esta publicacion radica en que permite desplegar un modelo de este tamano en hardware mas modesto mediante cuantizacion con imatrix, un metodo que ajusta la perdida de precision segun la importancia de cada tensor. El repositorio incluye unicamente el fichero imatrix (1,1 GB) para generar cuantizaciones propias, mientras que las cuantizaciones estaticas listas para usar se alojan en un repositorio separado del mismo autor. La licencia es MIT, lo que facilita su uso comercial.

La model card identifica el modelo como un modelo de vision (vision model), con ficheros mmproj disponibles en el repositorio estatico. El idioma declarado es unicamente ingles. No se proporcionan en la informacion disponible detalles sobre arquitectura interna, longitud de contexto ni proceso de entrenamiento del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | 127.486.405.600 (~127,5 mil millones) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | IQ1_S, IQ1_M, IQ2_XXS, IQ2_XS, IQ2_S, IQ2_M, Q2_K_S, Q2_K, IQ3_XXS, IQ3_XS, IQ3_S, IQ3_M, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_NL (small), IQ4_XS, Q4_0, Q4_1, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K (imatrix) |
| Idiomas soportados | ingles (en) |
| Licencia | MIT |
| Formato de pesos | GGUF (cuantizaciones) e imatrix; modelo base en safetensors |

## Arquitectura y entrenamiento

No se dispone en la informacion proporcionada de detalles sobre la arquitectura del modelo base Ling-3.2-air (tipo de transformer, uso de mezcla de expertos, mecanismos de atencion, etc.). Tampoco se documentan el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO. La model card del repositorio cuantizado no reproduce la informacion tecnica del modelo original, sino que se limita a describir el proceso de cuantizacion.

La innovacion tecnica destacable de esta publicacion es el uso de cuantizaciones ponderadas con imatrix, que emplean una matriz de importancia para preservar mejor la calidad en cuantizaciones agresivas (especialmente en el rango de 1 a 4 bits). El autor indica que las cuantizaciones IQ suelen ser preferibles frente a cuantizaciones no-IQ de tamano similar. Se incluye un fichero imatrix de 1,1 GB para que otros usuarios puedan generar sus propias cuantizaciones.

## Capacidades

- Generacion de texto conversacional, segun la etiqueta "conversational" del repositorio.
- Capacidades de vision: la model card identifica explicitamente el modelo como vision model, con ficheros mmproj en el repositorio estatico.
- Soporte de inferencia en ingles, unico idioma declarado.
- Compatibilidad con endpoints (etiqueta "endpoints_compatible").
- No se documentan en la informacion disponible capacidades de tool calling, function calling, razonamiento multi-paso, modo thinking, audio ni otras capacidades especiales.

## Casos de uso

- Despliegue local de un modelo de ~127,5 mil millones de parametros en estaciones de trabajo con varias GPU consumer: las cuantizaciones IQ2/IQ3 permiten reducir el peso del modelo lo suficiente para repartirlo entre varias GPU de 24 GB, algo inviable con los pesos en precision completa.
- Prototipado de pipelines conversacionales en ingles: la etiqueta "conversational" y la compatibilidad con endpoints permiten integrar el modelo en servicios de chat mediante llama.cpp o servidores compatibles con la API de OpenAI.
- Tareas de vision en local: al incluir ficheros mmproj en el repositorio estatico, el modelo puede emplearse para tareas multimodal (descripcion de imagenes, respuesta a preguntas visuales) sin depender de servicios en la nube.
- Experimentacion e investigacion con cuantizacion: el fichero imatrix publicado permite a investigadores generar cuantizaciones propias con distintos compromisos de tamano y calidad, y comparar el impacto de cada nivel de cuantizacion.
- Evaluacion de modelos de gran escala en hardware limitado: equipos sin acceso a clusters de GPU pueden estudiar el comportamiento de un modelo de ~127,5 mil millones de parametros usando cuantizaciones de 2-3 bits.
- Generacion de texto por lotes en ingles: el formato GGUF y la variedad de cuantizaciones permiten elegir el equilibrio adecuado entre velocidad y fidelidad para procesos offline de generacion de contenido.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: depende de la cuantizacion elegida. Con 127,5 mil millones de parametros, una cuantizacion de 2 bits ronda los 32-40 GB, una de 3 bits los 48-55 GB, una de 4 bits los 65-75 GB y una de 6 bits supera los 100 GB. Estas cifras son estimaciones basadas en el numero de parametros y no en mediciones publicadas en la informacion disponible.
- GPU recomendadas: para cuantizaciones bajas (IQ2/IQ3), configuraciones multi-GPU con RTX 4090 (24 GB), RTX A6000 (48 GB) o L40S; para cuantizaciones medias y altas, A100 80 GB o H100 80 GB, posiblemente en pares.
- GPU consumer: no cabe en una unica GPU consumer. Es necesario repartir el modelo entre varias GPU o usar CPU con suficiente RAM, lo que reduce drasticamente el throughput.
- Opciones de despliegue: llama.cpp, Ollama y servidores compatibles con la API de OpenAI basados en llama.cpp. El repositorio declara compatibilidad con endpoints.
- Latencia y throughput: no disponibles en la informacion proporcionada; en configuraciones multi-GPU con cuantizaciones de 2-3 bits se espera un throughput bajo en comparacion con modelos de menor tamano, pero no hay mediciones publicadas.

## Comparativa con modelos similares

No se dispone de informacion sobre modelos comparables en la documentacion proporcionada. Como referencia estructural, el modelo base pertenece a la familia Ling de inclusionAI, pero no se han facilitado especificaciones de otros miembros de la familia ni de alternativas de tamano similar para establecer una comparacion rigurosa.

| Modelo | Parametros | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| Ling-3.2-air (este, cuantizado) | ~127,5 mil millones | no disponible | MIT | GGUF / safetensors | Hugging Face |
| Alternativas de tamano similar | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- La cuantizacion introduce perdida de calidad respecto al modelo original; las cuantizaciones de 1-2 bits pueden degradar notablemente el rendimiento, especialmente en tareas de razonamiento y codigo.
- El unico idioma declarado es el ingles; el rendimiento en castellano u otros idiomas no esta garantizado y probablemente sea deficiente.
- No se documentan en la informacion disponible sesgos conocidos, tasas de alucinacion ni evaluaciones de seguridad del modelo base.
- El repositorio cuantizado no incluye los ficheros mmproj; para usar las capacidades de vision hay que descargarlos del repositorio estatico del mismo autor.
- El repositorio i1 contiene principalmente el fichero imatrix (1,1 GB); las cuantizaciones listas para usar estan en el repositorio estatico, lo que puede confundir a quien espere pesos directamente descargables aqui.
- La licencia MIT del repositorio cuantizado se hereda del modelo base; conviene verificar que el modelo original mantiene efectivamente esa licencia antes de un uso comercial.
- El modelo base es muy reciente (repositorio creado en noviembre de 2026) y cuenta con cero descargas y cero likes, por lo que no hay evidencia de la comunidad sobre su calidad real.
- Para produccion, el coste de hardware (multi-GPU) y la baja velocidad esperada con cuantizaciones agresivas hacen recomendable evaluar alternativas de menor tamano antes de comprometerse con este modelo.

## Enlaces

- Repositorio Hugging Face (cuantizaciones imatrix): https://huggingface.co/mradermacher/Ling-3.2-air-i1-GGUF
- Repositorio de cuantizaciones estaticas: https://huggingface.co/mradermacher/Ling-3.2-air-GGUF
- Modelo base: https://huggingface.co/inclusionAI/Ling-3.2-air
- Pagina de descargas del autor: https://hf.tst.eu/model#Ling-3.2-air-i1-GGUF
- FAQ y solicitudes de cuantizacion: https://huggingface.co/mradermacher/model_requests
- Grafico comparativo de cuantizaciones (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizaciones: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- README de referencia para uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
