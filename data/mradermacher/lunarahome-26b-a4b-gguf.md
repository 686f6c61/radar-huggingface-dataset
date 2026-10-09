# mradermacher/LunaraHome-26B-A4B-GGUF

## Resumen

LunaraHome-26B-A4B-GGUF es la version cuantizada en formato GGUF del modelo Maxinger15/LunaraHome-26B-A4B, publicada por el usuario mradermacher. Se trata de un ajuste fino mediante LoRA sobre una base identificada con la etiqueta `gemma4`, con 25.233.142.046 parametros totales confirmados en los safetensors del modelo original, es decir, unos 25,2 mil millones de parametros. El objetivo declarado del modelo es actuar como motor de tool calling para domotica, con etiquetas explicitas de `home-assistant` y `music-assistant`, lo que lo orienta a controlar dispositivos y reproducir musica dentro de un hogar digital.

El repositorio que nos ocupa no contiene el modelo original en safetensors, sino una coleccion de cuantizaciones estaticas GGUF (desde Q2_K hasta Q8_0) mas dos ficheros `mmproj` que actuan como proyector multimodal. La presencia de estos ficheros indica que la arquitectura base incorpora capacidad de vision, algo poco habitual en modelos especializados en domotica. El sufijo A4B del nombre sigue la convencion habitual para modelos de mezcla de expertos (MoE) con aproximadamente 4.000 millones de parametros activos, aunque este dato no se confirma en la informacion proporcionada.

Su relevancia actual es limitada pero concreta: es un ejemplo de modelo experimental, con licencia Apache 2.0 y solo 1 like y 0 descargas en el momento de la consulta, pensado para integrarse en asistentes de hogar autoalojados. Frente a soluciones cerradas de domotica, ofrece control total sobre los pesos, ejecucion local y un formato GGUF listo para llama.cpp u Ollama.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (etiqueta `gemma4`; el sufijo A4B sugiere mezcla de expertos, sin confirmar) |
| Parametros totales | 25.233.142.046 (25,2 B), dato real de los safetensors del modelo base |
| Parametros activos | no disponible (el sufijo A4B sugiere ~4.000 millones activos, sin confirmar) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0; mmproj en Q8_0 y f16 |
| Idiomas soportados | aleman (de), ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizado); el modelo base se distribuye en safetensors |

Datos adicionales: repositorio de 184,9 GB (suma de todas las cuantizaciones), biblioteca declarada `transformers`, fecha de creacion 2026-10-09 y actualizacion el mismo dia. No se declara pipeline de inferencia.

## Arquitectura y entrenamiento

No se dispone de informacion tecnica detallada sobre la arquitectura interna en los datos proporcionados. La model card del cuantizador es generica y solo indica que se trata de "static quants of Maxinger15/LunaraHome-26B-A4B". Las etiquetas del repositorio apuntan a una base de la familia Gemma (etiqueta `gemma4`) y a un ajuste mediante LoRA sobre dicha base, con vocacion de tool calling para Home Assistant y Music Assistant. El conteo de parametros (25,2 B) y la nomenclatura A4B encajan con un transformer de tipo mezcla de expertos, pero no hay confirmacion explicita ni datos sobre el numero de tokens de entrenamiento, la composicion del dataset o el uso de RLHF/DPO.

El elemento tecnico mas destacable, y el unico verificable, es la publicacion de dos ficheros `mmproj` (proyector multimodal, en Q8_0 y f16, de 0,9 GB y 1,3 GB respectivamente). Esto implica que el modelo base procesa entrada visual ademas de texto y que el pipeline de llama.cpp puede explotar esa capacidad cargando el proyector junto al modelo cuantizado. El cuantizador advierte de que no hay cuantizaciones ponderadas ni con imatrix disponibles por su parte en el momento de la publicacion.

## Capacidades

- Generacion de texto conversacional en aleman e ingles, con orientacion a dialogos de control domestico.
- Tool calling y function calling: es la capacidad central del ajuste, disenado para invocar herramientas de Home Assistant.
- Integracion con Music Assistant: control de reproduccion musical mediante llamadas a herramientas.
- Procesamiento multimodal: los ficheros `mmproj` indican soporte de entrada de imagen, presumiblemente para descripcion de escenas o contexto visual.
- Razonamiento multi-paso orientado a agentes: la naturaleza de tool calling encadenado permite flujos de varias llamadas para completar una orden domestica.
- Capacidad multilingue limitada a dos idiomas declarados (aleman e ingles); no se declara soporte de castellano.
- Modo de pensamiento explicito: no disponible.
- Capacidades de audio: no disponibles.
- Razonamiento matematico avanzado o generacion de codigo general: no declaradas.

## Casos de uso

- Control de domotica por voz o texto con Home Assistant: el modelo traduce ordenes en lenguaje natural ("apaga las luces del salon") a llamadas de servicio de Home Assistant, usando su entrenamiento especifico en tool calling para ese ecosistema.
- Reproduccion musical contextual con Music Assistant: el ajuste permite seleccionar pistas, listas o altavoces segun la peticion del usuario, invocando las herramientas del reproductor.
- Automatizaciones de hogar basadas en reglas conversacionales: se puede usar como interprete de lenguaje natural en nodos Node-RED o scripts de automatizacion que necesiten decidir que accion ejecutar.
- Centro de voz autoalojado con privacidad total: al ejecutarse localmente en GGUF, las ordenes domesticas y los datos de presencia no salen de la red local, lo que resulta adecuado para instalaciones sensibles.
- Asistente multimodal de supervision: combinado con el proyector `mmproj`, puede recibir una captura de camara y generar una descripcion o proponer una accion de domotica asociada.
- Escenarios de investigacion sobre agentes de herramientas: sirve como banco de pruebas para evaluar como se comporta un ajuste LoRA de 25 B en tareas de invocacion de funciones dentro de un dominio cerrado.
- Prototipado rapido en hardware de consumo: las cuantizaciones IQ4_XS o Q4_K_S permiten levantar el asistente en una estacion de trabajo con una sola GPU de 16-24 GB.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del cuantizador no incluye tablas de MMLU, HumanEval, GSM8K ni evaluaciones especificas de tool calling, y la busqueda web realizada no devolvio ningun resultado relacionado con el modelo.

## Requisitos de hardware

- VRAM estimada a partir del tamano de los ficheros GGUF (pesos unicamente; hay que sumar el cache KV, que depende del contexto y de la configuracion):
  - Q2_K: 10,7 GB de pesos.
  - Q3_K_S: 12,3 GB; Q3_K_M: 13,4 GB; Q3_K_L: 13,9 GB.
  - IQ4_XS: 14,2 GB; Q4_K_S: 15,6 GB; Q4_K_M: 16,9 GB.
  - Q5_K_S: 18,1 GB; Q5_K_M: 19,2 GB.
  - Q6_K: 22,7 GB; Q8_0: 27,0 GB.
  - Proyector multimodal adicional: 0,9 GB (mmproj-Q8_0) o 1,3 GB (mmproj-f16) si se usa la entrada de imagen.
- GPU con 16 GB (RTX 4060 Ti 16 GB, RTX 4080, A4000): viables las cuantizaciones Q2_K, Q3_K y IQ4_XS con contexto moderado.
- GPU con 24 GB (RTX 3090, RTX 4090, A5000): Q4_K_M y Q5_K_S con margen razonable para cache KV; Q5_K_M al limite.
- GPU con 32 GB o mas (A100 40 GB, H100 80 GB, RTX 5090 si se dispone): Q6_K y Q8_0 sin problemas.
- En consumer GPU cabe, por tanto, si se aceptan cuantizaciones de 2 a 5 bits; las de 6 y 8 bits requieren 24-32 GB.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, koboldcpp, llama-cpp-python y text-generation-webui. vLLM y TGI trabajan mejor con los safetensors del modelo base que con los GGUF; para produccion con alto throughput conviene servir `Maxinger15/LunaraHome-26B-A4B` en vLLM.
- Latencia y throughput estimados: no disponibles. Al tratarse probablemente de una arquitectura MoE con pocos parametros activos, la velocidad por token en GPU deberia ser notablemente superior a la de un denso de 25 B, pero este dato no esta confirmado en la informacion proporcionada.

## Comparativa con modelos similares

No se dispone de datos de rendimiento ni de especificaciones completas de terceros en la informacion proporcionada, por lo que no es posible establecer una comparativa rigurosa. El unico punto de referencia documentado es el propio modelo base:

| Modelo | Relacion | Parametros | Contexto | Licencia | Formato |
|---|---|---|---|---|---|
| Maxinger15/LunaraHome-26B-A4B | Modelo base sin cuantizar | 25,2 B | no disponible | Apache 2.0 | safetensors |
| mradermacher/LunaraHome-26B-A4B-GGUF | Cuantizacion del anterior | 25,2 B | no disponible | Apache 2.0 | GGUF |

## Limitaciones y advertencias

- Modelo marcado explicitamente como `experimental` por su autor; no hay evidencia de validacion en produccion.
- Adopcion practicamente nula: 0 descargas y 1 like en el momento de la consulta, lo que implica ausencia de retroalimentacion de la comunidad.
- Solo se declaran dos idiomas (aleman e ingles). No hay soporte declarado de castellano, por lo que su uso en espanol no esta garantizado.
- Ausencia total de benchmarks publicados: no se puede estimar su calidad en tool calling frente a alternativas.
- Riesgo de alucinacion no cuantificado; en un dominio de control domestico, una llamada de herramienta incorrecta puede tener efectos fisicos (por ejemplo, abrir una cerradura o activar un electrodomestico). Se recomienda validacion estricta de las acciones y limites de seguridad en Home Assistant.
- No se documentan sesgos especificos, pero al ser un ajuste fino sobre una base Gemma sin informacion de dataset, se heredan los sesgos desconocidos de dicha base.
- Restricciones de licencia: Apache 2.0 permite uso comercial, modificacion y redistribucion, siempre que se conserve el aviso de licencia y se indiquen los cambios. Conviene verificar la licencia del modelo base por si impone condiciones adicionales.
- La cuantizacion degrada la calidad respecto a los safetensors originales; las variantes Q2_K y Q3_K son las mas afectadas. El autor recomienda Q4_K_S y Q4_K_M por equilibrio entre velocidad y calidad.
- No hay cuantizaciones ponderadas ni generadas con imatrix, que suelen ofrecer mejor relacion calidad/tamano que las estaticas equivalentes.
- El repositorio ocupa 184,9 GB en total; conviene descargar unicamente el fichero de cuantizacion necesario y no el repositorio completo.
- Limitaciones de contexto: al no publicarse la longitud de contexto soportada, no se puede garantizar el manejo de conversaciones largas ni de historiales extensos de automatizaciones.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/LunaraHome-26B-A4B-GGUF
- Modelo base: https://huggingface.co/Maxinger15/LunaraHome-26B-A4B
- Pagina de resumen de cuantizaciones del autor: https://hf.tst.eu/model#LunaraHome-26B-A4B-GGUF
- Solicitudes y preguntas frecuentes del cuantizador: https://huggingface.co/mradermacher/model_requests
- Guia de uso de GGUF de referencia citada en la model card: https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafica comparativa de calidad entre tipos de cuantizacion (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizaciones: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Empresa que financia el trabajo del cuantizador: https://www.nethype.de/
- Nota: la busqueda web realizada no devolvio ningun resultado relevante sobre este modelo, su entrenamiento o sus benchmarks.
