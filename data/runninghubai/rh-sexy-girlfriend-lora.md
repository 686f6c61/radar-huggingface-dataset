# RunningHubAI/rh-sexy-girlfriend-lora

# rh-sexy-girlfriend-lora (RunningHubAI)

## Resumen

`rh-sexy-girlfriend-lora` es un adaptador LoRA de generacion de imagen texto-a-imagen publicado por la cuenta RunningHubAI en Hugging Face, en nombre del autor identificado como @GOODLUCK2024. Se trata de un ajuste fino de bajo rango sobre FLUX.1 D, el modelo de difusion de tipo transformer con formulacion de flujo rectificado de Black Forest Labs. El repositorio contiene un unico archivo de pesos, `性感女友.safetensors`, de 292 MiB, que se carga como capa adicional sobre el modelo base y no como modelo autonomo.

La funcion del adaptador es especializar el modelo base en un unico concepto visual: retratos fotorrealistas de una figura femenina con una estetica concreta (vestido de saten rojo, iluminacion suave, fondo neutro, encuadre de estudio). Es, por tanto, un LoRA de personaje o de estilo, no un modelo de proposito general. Su relevancia practica es la habitual de este tipo de adaptadores: permitir una personalizacion fuerte de un modelo de difusion de gran tamano sin reentrenarlo, con un coste de almacenamiento de 0,3 GB y de computo de entrenamiento muy inferior al de un fine-tuning completo.

El repositorio presenta un nivel de documentacion muy bajo: no se declara rango del LoRA, conjunto de datos, numero de pasos de entrenamiento, palabra de activacion ni licencia explicita. El modelo fue creado el 28 de septiembre de 2026 segun los metadatos (fecha anomala, posterior a la fecha habitual de publicacion), cuenta con cero descargas y cero valoraciones en el momento de redactar esta ficha, y el unico material de referencia es una model card breve de caracter promocional que remite a la plataforma RunningHub para su uso en linea y via API.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (adaptacion de bajo rango) sobre FLUX.1 D, un transformer de difusion con flujo rectificado |
| Parametros totales | No disponible (el autor no publica rango ni recuento de parametros del adaptador) |
| Parametros activos | No aplicable (no es un modelo MoE) |
| Longitud de contexto | No aplicable (modelo de difusion, no de lenguaje). El limite practico del prompt lo fija el encoder de texto del modelo base FLUX.1 D (T5-XXL, hasta 512 tokens; CLIP-L, 77 tokens) |
| Tipos de cuantizacion | No disponibles para el adaptador: se distribuye sin cuantizar en safetensors. La cuantizacion aplica al modelo base FLUX.1 D (bf16, fp8, GGUF Q4-Q8 en el ecosistema ComfyUI) |
| Idiomas soportados | No disponibles. El autor no los declara; el model card esta en ingles y chino. En la practica, el rendimiento del prompt depende del encoder de texto de FLUX.1 D, optimizado para ingles |
| Licencia | No disponible. El autor remite a la licencia del proyecto original. El modelo base FLUX.1 D se distribuye bajo licencia FLUX.1 [dev] no comercial, lo que condiciona el uso comercial del adaptador |
| Formato de pesos | safetensors (un unico archivo, `性感女友.safetensors`, 292 MiB) |
| Tipo de modelo | LoRA de texto-a-imagen (pipeline `text-to-image`) |
| Modelo base | FLUX.1 D (declarado en la model card como "Finetuned from") |
| Tamano del repositorio | 0,3 GB |
| Plataformas compatibles | ComfyUI, RunningHub (nube), Hugging Face |
| Descargas / likes | 0 / 0 |
| Fecha de creacion (metadatos) | 2026-09-28T16:31:01Z |

## Arquitectura y entrenamiento

La arquitectura del adaptador corresponde a una LoRA, es decir, a un par de matrices de bajo rango inyectadas en las capas lineales del modelo base, de modo que la actualizacion de pesos se expresa como un producto de rango reducido. El modelo base declarado es FLUX.1 D, un transformer de difusion de aproximadamente 12 000 millones de parametros que sustituye la atencion completa por atencion con sesgo relativo en las capas dobles y emplea atencion lineal en las capas simples, ademas de una formulacion de flujo rectificado. El adaptador modifica el comportamiento generativo de ese modelo sin alterar su arquitectura.

No se dispone de informacion sobre el entrenamiento: el autor no publica rango, factor alfa, modulos objetivo, numero de pasos, tasa de aprendizaje, resolucion de entrenamiento ni composicion del dataset. Tampoco se documenta ningun tipo de ajuste por preferencias humanas (RLHF, DPO), lo cual es esperable en un adaptador de imagen y no en un modelo de lenguaje. El unico dato cuantitativo es el tamano del archivo: 292 MiB en formato safetensors. A modo de estimacion orientativa, ese tamano corresponderia a unos 150 millones de parametros si los pesos estuvieran almacenados en fp16 (el doble si en fp32, y la mitad en fp8), lo que sugeriria un rango relativamente alto o un numero amplio de capas afectadas. Se trata de una inferencia a partir del tamano del archivo, no de un dato publicado por el autor.

La model card incluye una descripcion textual del tipo de imagen objetivo (retrato de una mujer de cabello negro largo y ondulado, vestido de saten rojo ajustado, maquillaje discreto, fondo beige con una puerta parcialmente visible, iluminacion suave) que funciona en la practica como descripcion del concepto aprendido. No se indica si existe una palabra de activacion ni como separar el efecto del LoRA del resto del prompt.

## Capacidades

- Generacion de imagenes fotorrealistas de retratos femeninos con una estetica concreta y consistente: vestuario, iluminacion y encuadre caracteristicos.
- Personalizacion de FLUX.1 D: el adaptador se combina con el modelo base y se puede activar con peso variable (0,0-1,0) para modular la intensidad del concepto aprendido.
- Integracion directa en flujos de ComfyUI mediante nodos de carga de LoRA, que es la plataforma para la que esta etiquetado el repositorio.
- Ejecucion en la nube mediante la plataforma RunningHub, incluida su API HTTP, sin necesidad de infraestructura propia.
- Control de composicion, vestuario, iluminacion y pose mediante el prompt, dentro de los limites aprendidos durante el ajuste.
- No dispone de tool calling ni de function calling: no es un modelo de lenguaje y no expone interfaz de herramientas.
- No soporta agentes ni razonamiento multi-paso: no hay bucle de decision, planificacion ni memoria conversacional.
- No tiene capacidades de vision como entrada ni de audio; solo acepta texto y produce imagenes.
- Capacidad multilingue: no documentada. La calidad del seguimiento de prompt depende del encoder de texto de FLUX.1 D, con mejor comportamiento en ingles que en otros idiomas.
- No se documenta modo de razonamiento, modo "thinking", salida estructurada ni ninguna capacidad especial adicional.

## Casos de uso

- Ilustracion y retrato digital en estudio: el adaptador se puede usar dentro de un grafo de ComfyUI para generar retratos consistentes de un mismo personaje a lo largo de varias imagenes, cambiando pose, iluminacion o fondo mediante el prompt mientras el LoRA mantiene el aspecto del sujeto.
- Previsualizacion de personajes para narrativa visual: un equipo de guion grafico puede generar decenas de variantes de un personaje antes de encargar ilustracion final, reduciendo el coste de iteracion frente a un encargo tradicional.
- Pruebas de concepto de vestuario y direccion de arte: dado que el LoRA esta especializado en un tipo de prenda y de iluminacion, sirve para validar rapidamente combinaciones de color, tejido (el saten y su respuesta especular) y esquemas de luz suave antes de una sesion fotografica real.
- Generacion por lotes mediante API: el modelo se puede invocar a traves de la API de RunningHub para producir imagenes de forma programatica dentro de un pipeline de publicacion, con el limite de que no hay version autoalojada documentada mas alla de la descarga del safetensors.
- Docencia y experimentacion sobre LoRA: por su tamano reducido (292 MiB) es un ejemplo practico para estudiar como un adaptador de bajo rango desplaza la distribucion de salida de un modelo de difusion, comparando generaciones con y sin el adaptador activo.
- Desarrollo de asistentes de prompt para difusion: sirve como caso de prueba para sistemas que traducen lenguaje natural a prompts tecnicos, ya que permite medir de forma objetiva si el prompt generado activa o no el concepto aprendido.
- Investigacion sobre sesgos en modelos de difusion: el adaptador, muy especializado en un canon estetico concreto, permite analizar como los datos de ajuste estrechan la diversidad de cuerpos, rasgos y edades que produce el modelo base.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye metricas cuantitativas (FID, CLIP score, similitud de sujeto), comparaciones con otros adaptadores ni evaluaciones humanas. Las unicas cifras disponibles son el tamano del adaptador (292 MiB) y el tamano del repositorio (0,3 GB).

## Requisitos de hardware

Advertencia: el autor no publica requisitos de hardware. Las cifras siguientes son estimaciones derivadas de las caracteristicas conocidas del modelo base FLUX.1 D (aproximadamente 12 000 millones de parametros) y del ecosistema de despliegue habitual, no datos extraidos del repositorio.

- VRAM del adaptador: aproximadamente 0,3 GB adicionales sobre el modelo base, ya que el LoRA se carga en memoria junto a este.
- Modelo base FLUX.1 D en bf16: en torno a 24 GB solo para los pesos del transformer, mas los encoders de texto (T5-XXL y CLIP-L) y el VAE; en la practica, un despliegue completo en bf16 ronda los 32-34 GB de VRAM.
- Modelo base en fp8: aproximadamente 12-13 GB para el transformer, con un total del pipeline en torno a 17-18 GB.
- Modelo base en GGUF Q8 / Q4: en torno a 12-13 GB y 6-7 GB respectivamente para el transformer, con el total del pipeline reducido de forma proporcional.
- GPU recomendadas para precision completa: A100 de 40 u 80 GB, H100, L40S o similares. En consumer, la RTX 4090 y la RTX 3090 (24 GB) quedan al limite en bf16 y trabajan con holgura en fp8.
- Cabe en GPU de consumo: si, con cuantizacion. RTX 3060 de 12 GB, RTX 4060 Ti de 16 GB, RTX 4070 Ti Super o RTX 4080 funcionan con el modelo base en fp8 o GGUF Q8; con GGUF Q4 es viable en GPUs de 8 GB con intercambio de memoria controlado.
- Opciones de despliegue: ComfyUI (con nodos de LoRA y, opcionalmente, ComfyUI-GGUF para el modelo base cuantizado), la propia plataforma RunningHub en la nube y su API, y librerias de difusion como Diffusers para cargar el adaptador sobre el pipeline de FLUX.1. No aplica vLLM ni TGI, al no tratarse de un modelo de lenguaje.
- Latencia y throughput: no disponibles. No hay datos publicados de tiempo por imagen ni de imagenes por segundo, ni para ejecucion local ni para la API.

## Comparativa con modelos similares

El autor no publica comparaciones ni se han proporcionado modelos equivalentes concretos en la informacion disponible, por lo que la comparacion se limita a categorias genericas.

| Criterio | rh-sexy-girlfriend-lora | FLUX.1 D sin adaptador | LoRA de personaje generico (categoria) |
|---|---|---|---|
| Parametros | Adaptador sobre FLUX.1 D; recuento no disponible | Aproximadamente 12 000 millones | Variable; no disponible |
| Formato | safetensors, 292 MiB | safetensors / fp8 / GGUF | safetensors, tipicamente 20-300 MiB |
| Especializacion | Alta: un unico concepto visual | Ninguna: proposito general | Alta, pero variable segun el autor |
| Licencia | No declarada; remite a la del proyecto original (FLUX.1 [dev], no comercial) | FLUX.1 [dev] no comercial | Depende de cada publicacion; no disponible |
| Requisitos de hardware | Los del modelo base mas 0,3 GB | Los del modelo base | Los del modelo base mas el adaptador |
| Benchmarks publicados | Ninguno | Ampliamente documentados por el fabricante | Variable; no disponible |
| Disponibilidad | Hugging Face y plataforma RunningHub | Hugging Face y multiples proveedores | Hugging Face, Civitai y otros repositorios |

No se dispone de datos de rendimiento comparativo que permitan afirmar si este adaptador supera o no a alternativas de la misma categoria.

## Limitaciones y advertencias

- Sesgos conocidos: el adaptador esta entrenado sobre un concepto estetico muy concreto, lo que estrecha la diversidad de cuerpos, rasgos faciales, tonos de piel y edades que produce el modelo. Es previsible un sesgo hacia un canon de belleza estandarizado y hacia rasgos del este de Asia, a juzgar por la descripcion de la model card.
- Alucinacion y artefactos: como todo modelo de difusion, puede generar anatomia incorrecta (manos, dedos, extremidades), perspectivas incoherentes y texto ilegible dentro de la imagen. La coherencia del sujeto entre generaciones distintas depende del prompt y de la semilla, no esta garantizada.
- Riesgo de contenido inapropiado: el nombre del modelo y la tematica apuntan a contenido de caracter sugerente. Sin moderacion en el prompt, existe riesgo de generar material sexualizado o no apto para todos los publicos, con las implicaciones legales y de reputacion correspondientes.
- Riesgo de suplantacion de identidad: si el concepto aprendido se combina con un rostro o un nombre de una persona real, el resultado puede constituir un deepfake. No consta que el adaptador incorpore ninguna salvaguarda al respecto.
- Limitaciones de idioma: no se declaran idiomas soportados y no se documenta rendimiento en castellano. La calidad del seguimiento de prompt dependera del encoder de texto de FLUX.1 D.
- Restricciones de licencia: el repositorio no declara licencia propia y remite a la del proyecto original. El modelo base FLUX.1 D se distribuye bajo licencia FLUX.1 [dev] de uso no comercial, por lo que el uso comercial de este adaptador queda restringido salvo que se obtenga una licencia comercial especifica. Conviene verificar los terminos antes de cualquier despliegue en produccion.
- Ausencia de documentacion tecnica: no se publica rango, modulo objetivo, palabra de activacion, dataset ni procedimiento de entrenamiento. Esto hace practicamente imposible reproducir el ajuste o auditar su procedencia.
- Ausencia de validacion comunitaria: el repositorio registra cero descargas y cero valoraciones, esta alojado en una cuenta de plataforma comercial y no cuenta con revision independiente.
- Inconsistencia en los metadatos: las fechas de creacion y actualizacion indican septiembre de 2026, posteriores a la fecha de consulta habitual de los repositorios, lo que sugiere un problema de sellado temporal o de gestion del repositorio.
- Naturaleza del modelo: no es un modelo de lenguaje. No admite contexto largo, tool calling, agentes ni generacion de codigo, y no debe evaluarse con los criterios aplicables a un LLM.
- Coste de inferencia: el adaptador es ligero, pero hereda por completo los requisitos del modelo base FLUX.1 D, que es un modelo de gran tamano y no apto para despliegues en tiempo real sin cuantizacion.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/RunningHubAI/rh-sexy-girlfriend-lora
- Model card en chino (referenciada en el repositorio): README_cn.md
- Modelo original en RunningHub: https://www.runninghub.ai/model/public/1991839590168457218
- Pagina del autor: https://www.runninghub.ai/user-center/1980864188878884866
- Plataforma RunningHub (internacional): https://www.runninghub.ai
- Plataforma RunningHub (China): https://www.runninghub.cn
- Documentacion de la API (ingles): https://www.runninghub.cn/runninghub-api-doc-en/
- Documentacion de la API (chino): https://www.runninghub.cn/runninghub-api-doc-cn/
- Pagina de entrenamiento de modelos: https://www.runninghub.ai/page-model
- Enlace promocional a la API de Seedance 2.5 (sin relacion con este adaptador): https://www.runninghub.ai/call-api/api-detail/2133100000000700025
