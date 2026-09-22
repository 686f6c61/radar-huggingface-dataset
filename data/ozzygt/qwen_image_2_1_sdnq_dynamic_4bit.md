# OzzyGT/Qwen_Image_2_1_sdnq_dynamic_4bit

## Resumen

OzzyGT/Qwen_Image_2_1_sdnq_dynamic_4bit es una version cuantizada a int4 del modelo de generacion de imagenes Qwen/Qwen-Image-2.1, publicada por el usuario OzzyGT. La cuantizacion se ha realizado con SDNQ (SD.Next Quantization) en su modo dinamico e incorpora Hadamard Rotation, una tecnica de rotacion de activaciones que reduce el error introducido al pasar los pesos de bf16 a 4 bits. El resultado es un checkpoint cargable directamente con la libreria diffusers que ocupa 12,2 GB en el repositorio y declara 3.812.110.336 parametros reales en sus ficheros safetensors.

El proposito del modelo es abaratar el coste de inferencia del generador de imagenes base, que en su version bf16 requiere mas memoria de la que ofrecen las GPU de consumo habituales. Al reducir la precision de los pesos, el autor busca que el pipeline completo pueda ejecutarse en equipos modestos combinando la cuantizacion con `enable_model_cpu_offload()` y `vae.enable_tiling()`, tal y como se muestra en el ejemplo de uso de la model card. El checkpoint mantiene la interfaz de la pipeline QwenImage21Pipeline, por lo que se sustituye el modelo original sin cambios de codigo mas alla de registrar el backend SDNQ.

La relevancia de esta ficha es doble: por un lado, documenta una alternativa de despliegue de bajo coste para un modelo de generacion de imagen con soporte de indicaciones en ingles y chino; por otro, advierte de sus limitaciones, entre ellas una licencia de tipo qwen-research orientada a investigacion, la ausencia total de metricas cuantitativas publicadas y una discrepancia entre la model card (int4) y las etiquetas de HuggingFace (8-bit) que conviene verificar antes de integrarlo en produccion. El repositorio no registraba descargas ni "likes" en el momento de redactar esta ficha.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de difusion para generacion texto-a-imagen (pipeline QwenImage21Pipeline de diffusers); numero de bloques, tipo de atencion y dimensiones internas no disponibles |
| Parametros totales | 3.812.110.336 (recuento real de los safetensors) |
| Parametros activos | No aplica: no es un modelo de mezcla de expertos (MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | SDNQ int4 dinamico con Hadamard Rotation; requiere SDNQ >= 0.2.2. La etiqueta de HuggingFace incluye "8-bit", en contradiccion con la model card, que indica int4 |
| Idiomas soportados | Ingles (en) y chino (zh) para las indicaciones de texto |
| Licencia | "other" con license_name qwen-research (licencia de investigacion de Qwen) |
| Formato de pesos | safetensors (libreria diffusers) |
| Modelo base | Qwen/Qwen-Image-2.1 (relacion: quantized) |
| Tamano del repositorio | 12,2 GB |
| Pipeline declarada | text-to-image |
| Fecha de creacion (segun HuggingFace) | 2026-09-21 |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La informacion proporcionada no describe la arquitectura interna del modelo base Qwen-Image-2.1 ni del checkpoint cuantizado: no se detallan el numero de bloques del transformer de difusion, el mecanismo de atencion, la dimension de las representaciones latentes ni la configuracion del codificador de texto. Lo unico verificable es que el modelo se ejecuta a traves de la clase `QwenImage21Pipeline` de diffusers y que se trata de un generador texto-a-imagen condicionado por indicaciones en lenguaje natural, con un VAE que admite tiling (`pipe.vae.enable_tiling()`).

Tampoco se han publicado datos sobre el entrenamiento del checkpoint cuantizado, que es un proceso de post-entrenamiento y no un reentrenamiento: no hubo exposicion a datos nuevos ni fases de RLHF o DPO. La innovacion tecnica declarada es el uso de SDNQ en modo dinamico con Hadamard Rotation. La cuantizacion dinamica calcula los parametros de escala en tiempo de ejecucion en lugar de fijarlos por adelantado, mientras que la rotacion de Hadamard transforma las activaciones para repartir mejor su magnitud y reducir los valores atipicos, que son la principal fuente de error en cuantizaciones agresivas de 4 bits. El autor publica una comparacion visual entre la version bf16 y la version int4 generadas con la misma indicacion y la misma semilla (42), aunque sin metricas objetivas asociadas.

## Capacidades

- Generacion de imagenes a partir de indicaciones de texto en ingles y chino, con resoluciones altas: el ejemplo oficial usa 2528 x 1696 pixeles.
- Renderizado de texto dentro de la imagen: la muestra publicada por el autor incluye rotulos con las cadenas "HALVARD & CO." y "EST. 1931", lo que evidencia cierta capacidad de composicion tipografica, aunque no existen metricas que la cuantifiquen.
- Composicion fotografica compleja: la indicacion de ejemplo describe profundidad de campo, reflejos en cristal, iluminacion direccional e iluminacion especular, lo que sugiere control fino sobre escenas elaboradas.
- Control de la generacion mediante semilla fija y numero de pasos de inferencia (25 pasos en el ejemplo), lo que permite reproducibilidad.
- Ejecucion con descarga parcial a CPU mediante `enable_model_cpu_offload()` y procesado del VAE por teselas con `enable_tiling()`, lo que reduce el pico de memoria.
- Compatibilidad con el ecosistema diffusers: al conservar la interfaz de `QwenImage21Pipeline`, se integra en scripts existentes sin reescribir el codigo.
- No se menciona soporte de tool calling, function calling, razonamiento multi-paso, agentes, vision de entrada, audio ni modo thinking: son capacidades no aplicables o no disponibles en la informacion proporcionada.

## Casos de uso

- Ilustracion editorial y portadas: el modelo puede generar imagenes de gran formato (hasta 2528 x 1696 en el ejemplo publicado) a partir de descripciones narrativas largas, lo que encaja en flujos de trabajo donde el director de arte necesita variaciones rapidas de una escena descrita con detalle.
- Prototipado de campanas de marketing bilingues: al declarar soporte de ingles y chino, permite generar material grafico para mercados anglosajon y sinofono desde el mismo checkpoint, reduciendo la duplicacion de pipelines.
- Generacion de rotulos y carteleria con texto integrado: la muestra oficial contiene rotulacion legible, de modo que el modelo sirve para bocetos de carteles, etiquetas y maquetas de packaging, siempre que despues un disenador valide la tipografia final.
- Entornos de desarrollo con GPU de gama media: la cuantizacion int4 combinada con `enable_model_cpu_offload()` permite ejecutar el pipeline en equipos con memoria limitada, lo que habilita la experimentacion en estaciones de trabajo sin aceleradores de gama alta.
- Generacion de datos sinteticos para investigacion en vision por computador: el modelo puede producir conjuntos de imagenes con atributos controlados por texto, utiles para aumentar datasets de deteccion o segmentacion; la licencia qwen-research limita este uso al ambito de investigacion.
- Investigacion sobre cuantizacion de modelos de difusion: el repositorio incluye una comparacion pareada bf16 frente a int4 con la misma semilla, lo que lo convierte en un banco de pruebas util para medir el deterioro perceptual introducido por SDNQ y Hadamard Rotation.
- Maquetas de interiorismo, escaparatismo y arquitectura: la indicacion de ejemplo describe materiales, iluminacion y distribucion espacial, capacidades que se trasladan a la generacion de visualizaciones preliminares de espacios antes de pasar a un renderizado fisico.
- Automatizacion de variantes creativas en diseno grafico: mediante semilla fija y variaciones de la indicacion se pueden producir familias coherentes de imagenes para pruebas A/B de creatividades publicitarias.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card unicamente ofrece una comparacion visual cualitativa entre el modelo base en bf16 y esta version int4, generadas ambas con la misma indicacion y la misma semilla (42), sin valores numericos de FID, CLIP score, SSIM ni ninguna otra metrica objetiva, y sin datos de latencia o throughput.

## Requisitos de hardware

- VRAM estimada para los pesos: 3.812.110.336 parametros en int4 ocupan aproximadamente 1,9 GB en el caso teorico de 4 bits por parametro; con los parametros de escala de la cuantizacion dinamica y las demas componentes del pipeline (codificador de texto y VAE), el consumo agregado sera sensiblemente mayor. El repositorio ocupa 12,2 GB, un indicio de que incluye componentes adicionales o copias en mayor precision. No hay mediciones publicadas por el autor: cualquier cifra distinta del calculo de pesos es una estimacion, no un dato verificado.
- VRAM estimada para la inferencia: no disponible como medicion. El ejemplo oficial genera a 2528 x 1696 con 25 pasos, una configuracion que exige bastante memoria de activaciones; el propio autor recomienda `enable_model_cpu_offload()` y `vae.enable_tiling()` para reducir el pico.
- GPU recomendadas: no disponibles. Por el volumen de parametros, el modelo deberia caber en GPU de consumo con 8-12 GB o mas de VRAM si se aplican descarga a CPU y tiling, pero esta afirmacion es una extrapolacion del recuento de parametros, no un requisito publicado.
- Cabe en GPU de consumo: previsiblemente si, en tarjetas tipo RTX 3060 12 GB, RTX 4070, RTX 4080 o RTX 4090, siempre que se activen las optimizaciones de memoria indicadas. No hay confirmacion oficial.
- Opciones de despliegue: diffusers con el backend SDNQ registrado (requiere SDNQ >= 0.2.2). No se menciona soporte de llama.cpp, Ollama, TGI ni vLLM, herramientas orientadas a modelos de lenguaje que no aplican a este tipo de pipeline.
- Latencia y throughput: no disponible. Dependera del numero de pasos, de la resolucion y del uso o no de descarga a CPU, que penaliza notablemente el tiempo por imagen.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| OzzyGT/Qwen_Image_2_1_sdnq_dynamic_4bit | 3.812.110.336 (int4) | No disponible | other / qwen-research | HuggingFace, diffusers con SDNQ >= 0.2.2 |
| Qwen/Qwen-Image-2.1 (bf16, modelo base) | No disponible | No disponible | qwen-research | HuggingFace, diffusers |
| Otras cuantizaciones de Qwen-Image-2.1 | No disponible | No disponible | Depende del autor | No disponible |

No se dispone de datos de rendimiento comparado entre estas variantes. La unica comparacion documentada por el autor es visual y pareada entre bf16 e int4 con la misma semilla, sin metricas.

## Limitaciones y advertencias

- Licencia restrictiva: el modelo se distribuye bajo licencia "other" con nombre qwen-research. Es previsible que el uso comercial quede sujeto a condiciones especificas; debe consultarse el texto completo en el enlace de licencia antes de cualquier despliegue en produccion.
- Riesgo de alucinacion y errores de composicion: como todo modelo generativo de imagen, puede producir texto ilegible en rotulos, anatomias incorrectas, perspectivas incoherentes o elementos que no aparecen en la indicacion. La model card no documenta tasas de error.
- Perdida de calidad por cuantizacion: la version int4 no es identica a la bf16. Aunque el autor muestra una comparacion favorable, no se aportan metricas perceptuales ni estudios de degradacion en indicaciones diversas.
- Ambiguedad en la precision declarada: la model card indica int4 mientras que las etiquetas de HuggingFace incluyen "8-bit". Conviene inspeccionar los ficheros safetensors o la configuracion de cuantizacion antes de asumir un consumo de memoria concreto.
- Cobertura idiomatica limitada: solo se declaran ingles y chino. No hay evidencia de rendimiento en castellano ni en otras lenguas, por lo que las indicaciones en espanol pueden degradar la fidelidad del resultado.
- Longitud de contexto del codificador de texto no disponible: no se puede planificar con antelacion el limite de tokens de las indicaciones. El ejemplo publicado usa una indicacion muy larga, lo que sugiere una ventana amplia, pero es una inferencia, no un dato.
- Ausencia de validacion externa: cero descargas y cero "likes" en el momento de redactar la ficha, sin benchmarks, sin evaluaciones de terceros y sin historial de uso en produccion.
- Dependencia de una version concreta de libreria: requiere SDNQ v0.2.2 o superior. Versiones anteriores del backend pueden fallar al cargar los pesos.
- Consumo de memoria elevado en resoluciones altas: el ejemplo oficial a 2528 x 1696 con 25 pasos no esta pensado para GPU de gama baja sin las optimizaciones de descarga a CPU y tiling.
- Fecha de creacion inusual: HuggingFace registra la creacion y la ultima actualizacion el 2026-09-21, dato que se reproduce tal cual y que conviene contrastar.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/OzzyGT/Qwen_Image_2_1_sdnq_dynamic_4bit
- Modelo base Qwen/Qwen-Image-2.1: https://huggingface.co/Qwen/Qwen-Image-2.1
- Texto de la licencia qwen-research: https://huggingface.co/Qwen/Qwen-Image-2.1/blob/main/LICENSE
- Repositorio de SDNQ (SD.Next Quantization): https://github.com/Disty0/sdnq
- Scripts de ejemplo en diffusers-recipes: https://github.com/asomoza/diffusers-recipes/blob/main/models/qwen_image_2_1/README.md
- Imagenes de ejemplo usadas en la comparacion bf16 frente a int4: https://huggingface.co/datasets/OzzyGT/diffusers-examples
- Busqueda web: no se han encontrado resultados relevantes sobre este modelo. Las consultas realizadas devolvieron unicamente paginas de recetas de cocina sin ninguna relacion con el modelo, por lo que no se incluyen como fuentes.
