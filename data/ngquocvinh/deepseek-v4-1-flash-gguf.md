# ngquocvinh/DeepSeek-V4.1-Flash-GGUF

## Resumen

DeepSeek-V4.1-Flash-GGUF es un repositorio de cuantizaciones community en formato GGUF del modelo deepseek-ai/DeepSeek-V4.1-Flash, publicado por el usuario ngquocvinh. No se trata de un modelo nuevo ni de un ajuste fino: es exclusivamente un paquete de conversión y cuantización orientado a su ejecución con llama.cpp. El modelo subyacente es un MoE disperso multimodal de 763 000 millones de parámetros totales (552 000 millones en el backbone), con unos 8000 millones de parámetros activos durante la fase de prefill y unos 16 000 millones durante la decodificación, y una ventana de contexto máxima de 1 000 000 de tokens.

La relevancia de esta ficha es doble. Por un lado, documenta el estado real del repositorio: a fecha de la información disponible no hay ningún artefacto GGUF publicado, la escalera de cuantizaciones Q1_0 a Q5_K_M figura como pendiente de conversión y validación, y las mediciones de fidelidad frente al checkpoint de referencia no se han añadido. Por otro, sitúa el modelo upstream, que combina atención dispersa comprimida, tablas de búsqueda n-gram Engram, hyper-connections y un codificador de visión en un diseño causal encoder-decoder de 40 capas.

Conviene subrayar que este repositorio no está afiliado ni respaldado por DeepSeek, y que su licencia MIT se hereda del modelo original. Cualquier evaluación de capacidades debe hacerse contra el checkpoint oficial, no contra estos ficheros, que a día de hoy no existen en el Hub.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE disperso multimodal, encoder-decoder causal de 40 capas, con atencion dispersa comprimida, hyper-connections, tablas de busqueda n-gram Engram y codificador de vision |
| Parametros totales | 763 000 millones (552 000 millones de backbone) |
| Parametros activos | Aproximadamente 8000 millones en prefill y 16 000 millones en decode |
| Longitud de contexto | 1 000 000 de tokens (maximo declarado por el modelo upstream) |
| Tipos de cuantizacion | Planificados: Q1_0, Q2_K, Q3_K_M, Q4_K_M, Q5_K_M (todos pendientes de conversion y validacion; ninguno publicado) |
| Idiomas soportados | No disponible |
| Licencia | MIT (heredada del modelo upstream) |
| Formato de pesos | GGUF (libreria llama.cpp); el checkpoint original usa un `quantization_config` mixto FP8/FP4 sobre safetensors |

## Arquitectura y entrenamiento

El modelo upstream DeepSeek-V4.1-Flash es un Mixture-of-Experts disperso y multimodal. Segun la model card citada, emplea un diseno causal encoder-decoder de 40 capas, tablas de busqueda n-gram denominadas Engram, hyper-connections y atencion dispersa comprimida, ademas de un codificador de vision. El reparto de expertos es muy agresivo: de los 763 000 millones de parametros totales solo se activan alrededor de 8000 millones en prefill y 16 000 millones en decode, lo que reduce el coste computacional por token a costa de mantener una huella de memoria dominada por el total de parametros.

Sobre el entrenamiento no se aporta informacion en el material disponible: no se detallan el numero de tokens, la composicion del dataset ni si hubo fases de RLHF, DPO u otras tecnicas de alineamiento. El checkpoint upstream referenciado es `deepseek-ai/DeepSeek-V4.1-Flash` en la revision `dba1be0a40aa45a94ad051997016db3960a90277`, con 48 shards de safetensors y un tamano total de 510 286 023 000 bytes, almacenado en representacion mixta FP8/FP4 declarada por su `quantization_config`. Este repositorio no realiza entrenamiento, ajuste fino ni fusion: unicamente conversion y cuantizacion a GGUF, apoyandose en el trabajo de soporte de DeepSeek-V4.1 presente en el fork `vcruz305/llama.cpp`, commit `5210c7c5ed61dddaee6ed476623abf4b63093d16`.

## Capacidades

- Generacion de texto: el paquete GGUF esta orientado exclusivamente a inferencia de texto; el autor indica que la vision, el proyector multimodal y los componentes especulativos MTP no se reclamaran como soportados salvo conversion y validacion independientes.
- Razonamiento y contexto largo: el modelo upstream declara una ventana de hasta 1 000 000 de tokens, lo que habilita tareas de recuperacion y sintesis sobre documentos extensos.
- Capacidad multimodal en el modelo original: el checkpoint upstream incorpora un codificador de vision, pero dicha capacidad no forma parte del alcance declarado de esta conversion GGUF.
- Soporte de tool calling y function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: la model card upstream incluye una referencia grafica a un benchmark de rendimiento agentico, pero no se ofrecen cifras en la informacion disponible.
- Capacidades multilingues: no disponible.
- Modo de pensamiento explicito (thinking mode): no disponible.

## Casos de uso

- Analisis de documentacion tecnica extensa: la ventana de 1 000 000 de tokens permitiria procesar libros completos, especificaciones o bases de codigo en una sola pasada, reduciendo la necesidad de fragmentacion y recuperacion externa.
- Revision de contratos y documentacion legal: con contexto largo se podrian contrastar clausulas distribuidas en cientos de paginas dentro de una misma ventana, siempre que la cuantizacion elegida preserve la fidelidad necesaria.
- Asistentes de investigacion bibliografica: ingesta de multiples articulos cientificos para resumir, comparar metodologias y extraer resultados en una unica sesion.
- Despliegue en entornos con llama.cpp: el formato GGUF y la compatibilidad con llama.cpp permiten servir el modelo en infraestructura propia sin depender de APIs externas, algo relevante para datos sensibles.
- Prototipado y evaluacion en local: una vez publicadas las cuantizaciones bajas (Q1_0, Q2_K), el modelo podria probarse en estaciones de trabajo con gran cantidad de RAM o en nodos multi-GPU, no en equipos de consumo convencionales.
- Sustitucion de modelos propietarios en pipelines de generacion de texto a gran escala: el caracter abierto de los pesos y la licencia MIT facilitan su integracion en productos comerciales, sujeto a la validacion de calidad de la cuantizacion.
- Experimentacion academica sobre cuantizacion extrema: la escalera planificada de Q1_0 a Q5_K_M constituye un caso de estudio util para medir la degradacion de un MoE de gran tamano bajo compresion agresiva.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del repositorio incluye una imagen de referencia al benchmark de rendimiento agentico del modelo upstream, pero no se acompanan de cifras numericas. El autor indica expresamente que la seccion de mediciones de fidelidad se anadira tras completar una comparacion contra una referencia valida, y que por el momento no se reclama ningun porcentaje de fidelidad.

## Requisitos de hardware

Las siguientes cifras son estimaciones derivadas del numero de parametros totales (763 000 millones) y de las tasas de bits tipicas de cada nivel de cuantizacion GGUF. No proceden de mediciones reales, ya que no se ha publicado ningun artefacto.

- Q1_0 (aproximadamente 1,5-1,75 bits por peso): en torno a 140-165 GB de memoria para los pesos.
- Q2_K (aproximadamente 2,6 bits por peso): en torno a 250 GB.
- Q3_K_M (aproximadamente 3,4 bits por peso): en torno a 330 GB.
- Q4_K_M (aproximadamente 4,8 bits por peso): en torno a 460 GB.
- Q5_K_M (aproximadamente 5,7 bits por peso): en torno a 540 GB.
- GPU recomendadas: no disponible en la informacion proporcionada. Por volumen de memoria, ninguna de las cuantizaciones planificadas cabe en una sola GPU de 80 GB sin agregacion de capas fuera de la GPU o uso de memoria del sistema; en la practica requeriria configuraciones multi-GPU o multi-nodo con CPU offload.
- Compatibilidad con GPU de consumo: no. Incluso la cuantizacion mas agresiva planificada (Q1_0) supera ampliamente los 24 GB de una RTX 4090 o los 32 GB de una RTX 5090.
- Opciones de despliegue: llama.cpp (libreria declarada por el repositorio), en la linea del fork `vcruz305/llama.cpp` para el soporte de DeepSeek-V4.1. Se recomienda anadir memoria del sistema suficiente para el offload, ademas de almacenamiento rapido: el checkpoint original ocupa 510 GB.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

Los datos de los modelos alternativos que figuran a continuacion proceden de conocimiento publico general y no de la informacion proporcionada en esta busqueda; deben verificarse contra las fichas oficiales antes de citarlos.

| Modelo | Parametros totales | Parametros activos | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| DeepSeek-V4.1-Flash-GGUF (este repositorio) | 763 000 millones | ~8 000 millones en prefill / ~16 000 millones en decode | 1 000 000 de tokens | MIT | Sin artefactos GGUF publicados; conversion pendiente |
| DeepSeek-V3 | 671 000 millones | 37 000 millones | 128 000 tokens | MIT (con condiciones de uso) | Pesos y cuantizaciones community disponibles |
| Kimi K2 | 1 000 000 millones | 32 000 millones | 128 000 tokens | MIT modificada | Pesos y cuantizaciones community disponibles |
| Llama 3.1 405B | 405 000 millones | Modelo denso, 405 000 millones | 128 000 tokens | Licencia comunitaria de Meta | Pesos y cuantizaciones community disponibles |

Ninguno de los modelos alternativos declarados en la informacion disponible incorpora una ventana de 1 000 000 de tokens, lo que situaria a DeepSeek-V4.1-Flash en una categoria distinta en cuanto a contexto. No hay datos de rendimiento comparado en el material proporcionado.

## Limitaciones y advertencias

- El repositorio no contiene ningun fichero GGUF en el momento de la informacion disponible: las cinco cuantizaciones planificadas figuran como pendientes de conversion y validacion.
- No se han publicado mediciones de fidelidad frente al checkpoint original, por lo que se desconoce la degradacion real introducida por la cuantizacion.
- La cuantizacion Q1_0 y Q2_K, en un modelo con parametros activos de 8000 a 16 000 millones, implican un riesgo alto de perdida de calidad que solo una evaluacion empirica puede cuantificar.
- El modelo upstream es multimodal, pero este paquete GGUF declara alcance exclusivamente de texto: la vision, el proyector multimodal y los componentes especulativos MTP quedan fuera salvo validacion explicita.
- Sesgos conocidos: no disponible. No se documenta ninguna evaluacion de sesgo, toxicidad o alineamiento en la informacion proporcionada.
- Riesgo de alucinacion: no disponible; no se aportan evaluaciones de veracidad ni tasas de error factual.
- Limitaciones de idioma: no disponible. No se detalla la cobertura linguistica del modelo ni de estas cuantizaciones.
- Licencia: MIT, heredada del modelo upstream. Se exige preservar la atribucion original y el fichero `LICENSE` al redistribuir los artefactos derivados. Al ser una publicacion community, no cuenta con respaldo oficial de DeepSeek.
- El soporte de runtime depende de un fork no oficial de llama.cpp (`vcruz305/llama.cpp`, commit `5210c7c5ed61dddaee6ed476623abf4b63093d16`), lo que implica que la compatibilidad con la rama principal de llama.cpp no esta garantizada.
- El checkpoint original esta almacenado en precision mixta FP8/FP4, no en BF16, lo que anade un riesgo adicional de error acumulado durante la conversion.
- Requisitos de memoria muy elevados (del orden de cientos de GB) que excluyen su uso en hardware de consumo.

## Enlaces

- Repositorio de cuantizaciones GGUF: https://huggingface.co/ngquocvinh/DeepSeek-V4.1-Flash-GGUF
- Modelo upstream en HuggingFace: https://huggingface.co/deepseek-ai/DeepSeek-V4.1-Flash
- Imagen de referencia del benchmark agentico del modelo upstream: https://huggingface.co/deepseek-ai/DeepSeek-V4.1-Flash/resolve/main/assets/dsv41_agentic_performance.png
- Fork de llama.cpp con soporte para DeepSeek-V4.1: https://github.com/vcruz305/llama.cpp
- Pagina de donaciones del autor de las cuantizaciones: https://ko-fi.com/ngquocvinh
