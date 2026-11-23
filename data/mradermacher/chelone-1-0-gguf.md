# mradermacher/Chelone-1.0-GGUF

## Resumen

Chelone-1.0-GGUF es la distribucion en formato GGUF del modelo Chelone-1.0, desarrollado originalmente por Openwist y cuantizado por mradermacher. Se trata de un modelo de aproximadamente 1.170 millones de parametros (1,17 B) afinado mediante LoRA sobre una base no especificada en la informacion disponible, y orientado explicitamente a despliegue on-device y a tareas de tool-use (uso de herramientas). La cuantizacion la publica mradermacher, un autor habitual de conversiones GGUF, con el objetivo de facilitar la ejecucion local en hardware de consumo.

El modelo se distribuye bajo la licencia lfm1.0 (etiquetada como "other" en Hugging Face), lo que condiciona su uso comercial. Solo declara soporte para ingles (en). La relevancia de esta ficha radica en que ofrece una via practica de ejecutar un modelo pequeno especializado en llamadas a herramientas en equipos sin GPU dedicada, gracias a los cuantizados de entre 0,6 GB (Q2_K) y 2,4 GB (f16).

No se dispone de informacion publica sobre arquitectura interna, longitud de contexto, datos de entrenamiento ni resultados de benchmarks en la informacion proporcionada, por lo que esos apartados se marcan como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo transformer afinado con LoRA; detalles no publicados) |
| Parametros totales | 1.170.340.608 (~1,17 B) |
| Parametros activos | no aplica (no es MoE segun la informacion disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | en (ingles) |
| Licencia | lfm1.0 (etiquetada como "other") |
| Formato de pesos | GGUF (cuantizados estaticos); el modelo base original en safetensors |
| Modelo base | Openwist/Chelone-1.0 |
| Tamano del repo | 10,6 GB (incluye todos los cuantizados) |
| Cuantizados ponderados/imatrix | no disponibles en el momento de la publicacion |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna del modelo base Openwist/Chelone-1.0. Los metadatos indican que se trata de un modelo afinado mediante LoRA (tag "lora") sobre una base no identificada, con un total de 1.170.340.608 parametros segun los pesos en safetensors. No se especifica el numero de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron tecnicas de RLHF, DPO u otros metodos de alineamiento.

La unica innovacion tecnica documentada es la propia cuantizacion GGUF realizada por mradermacher: se ofrecen cuantizados estaticos (no ponderados ni imatrix) en un rango que va desde Q2_K (0,6 GB) hasta f16 (2,4 GB). El autor indica que los cuantizados ponderados o con imatrix no estaban disponibles en el momento de la publicacion y que podrian solicitarse mediante una discusion en la comunidad. No se documentan tecnicas como decodificacion especulativa, atencion lineal ni arquitecturas hibridas.

## Capacidades

- Generacion de texto conversacional en ingles (tag "conversational").
- Uso de herramientas (tool-use / function calling), segun los tags del modelo.
- Orientado a despliegue on-device (tag "on-device"), es decir, ejecucion local en dispositivos con recursos limitados.
- Afinado mediante LoRA, lo que sugiere adaptacion a tareas especificas sobre una base general.
- Capacidades multilingues: limitadas al ingles segun la model card.
- No se documentan capacidades de vision, audio, modo thinking ni razonamiento multi-paso explicito.

## Casos de uso

- Asistentes locales de escritorio: al pesar entre 0,6 y 1,3 GB en cuantizados Q2 a Q8, el modelo puede integrarse en aplicaciones de escritorio que necesiten un asistente conversacional en ingles sin conexion a la nube.
- Automatizacion de llamadas a herramientas en agentes ligeros: el tag tool-use indica que esta pensado para invocar funciones o APIs; se usaria como planificador de llamadas en pipelines de automatizacion con recursos limitados.
- Prototipado rapido en portatiles sin GPU: los cuantizados Q4_K_S y Q4_K_M (0,8 GB) permiten ejecutar el modelo en CPU mediante llama.cpp u Ollama, ideal para pruebas de concepto.
- Sistemas embebidos y dispositivos de borde: el tamano reducido (menos de 1 GB en Q4) lo hace candidato para Raspberry Pi o dispositivos similares con memoria limitada.
- Clasificacion y extraccion de informacion en ingles: al ser un modelo pequeno afinado, puede emplearse para tareas de extraccion estructurada o enrutamiento de consultas en aplicaciones de back-office.
- Filtrado y preprocesado en pipelines de datos: su bajo coste de inferencia permite usarlo como primer paso para normalizar o clasificar texto antes de pasarlo a un modelo mayor.
- Educacion e investigacion: util como modelo de referencia para estudiar el efecto de la cuantizacion en modelos pequenos de tool-use, dado el amplio rango de cuantizados publicados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,6 GB con Q2_K, 0,8 GB con Q4_K_S/Q4_K_M, 1,1 GB con Q6_K, 1,3 GB con Q8_0 y 2,4 GB con f16 (mas overhead de contexto).
- GPU recomendadas: cualquier GPU consumer con al menos 2-3 GB de VRAM libre; tambien funciona en CPU. No requiere A100 ni H100.
- Cabe en GPU consumer: si, en practicamente cualquier GPU moderna (GTX 1060 6 GB, RTX 3060, RTX 4090, etc.), e incluso en iGPU con memoria compartida suficiente.
- Opciones de despliegue: llama.cpp, Ollama, y cualquier runtime compatible con GGUF; el modelo base es compatible con transformers (library_name: transformers).
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

No se dispone de datos de rendimiento ni de especificaciones comparables (contexto, benchmarks) de este modelo, por lo que una comparativa rigurosa no es posible con la informacion disponible. Como referencia de categoria, se podria comparar con otros modelos pequenos de tool-use en formato GGUF, pero no se aportan cifras verificables.

| Modelo | Parametros | Contexto | Licencia | Formato |
|---|---|---|---|---|
| Chelone-1.0-GGUF | ~1,17 B | no disponible | lfm1.0 | GGUF |
| Alternativas de ~1 B para tool-use | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Solo soporta ingles; no se declara soporte de castellano ni de otros idiomas.
- No se documentan sesgos conocidos, pero al ser un modelo pequeno afinado con LoRA sobre una base no identificada, el riesgo de sesgos heredados y de alucinacion es relevante y no cuantificado.
- La licencia lfm1.0 (etiquetada como "other") puede imponer restricciones al uso comercial; es necesario revisar los terminos exactos antes de desplegarlo en produccion.
- No se dispone de informacion sobre la longitud de contexto, lo que impide garantizar conversaciones multi-turno largas.
- Los cuantizados de baja calidad (Q2_K, Q3_K_M) pueden degradar notablemente la coherencia; el autor recomienda Q4_K_S o Q4_K_M para un equilibrio velocidad/calidad.
- No hay cuantizados ponderados ni imatrix, lo que limita la calidad maxima alcanzable en tamanos pequenos.
- El modelo tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay validacion de la comunidad.
- No se han publicado benchmarks, por lo que su rendimiento real en tareas de tool-use no esta verificado de forma independiente.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/Chelone-1.0-GGUF
- Modelo base: https://huggingface.co/Openwist/Chelone-1.0
- Pagina de descargas del autor: https://hf.tst.eu/model#Chelone-1.0-GGUF
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafico de calidad de cuantizados (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas sobre cuantizados (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- FAQ y solicitudes de cuantizacion: https://huggingface.co/mradermacher/model_requests
