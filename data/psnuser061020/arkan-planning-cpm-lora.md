# psnuser061020/arkan-planning-cpm-lora

## Resumen

El repositorio psnuser061020/arkan-planning-cpm-lora contiene un adaptador LoRA (PEFT) publicado por el usuario psnuser061020 sobre el modelo base Qwen/Qwen2.5-3B-Instruct. No se trata, por tanto, de un modelo completo, sino de un conjunto de pesos de ajuste fino de bajo rango que debe cargarse junto al modelo base de 3,09 mil millones de parametros. El nombre del repositorio sugiere un ajuste orientado a tareas de planificacion (posiblemente ligado a metodos de ruta critica o CPM), pero esta interpretacion no esta confirmada en ninguna documentacion publicada.

La relevancia practica del artefacto es limitada en su estado actual: la model card es la plantilla por defecto de HuggingFace, con todos los campos marcados como [More Information Needed], sin descripcion de datos de entrenamiento, hiperparametros, rango del adaptador ni evaluacion. El repositorio acumula cero descargas y cero likes, y la busqueda web no ha devuelto ninguna referencia tecnica util (los resultados obtenidos son ruido de agregadores de apellidos y tiendas, sin relacion con el modelo).

En consecuencia, esta ficha describe con detalle el modelo base subyacente (Qwen2.5-3B-Instruct, del que si existe informacion publica fiable) y marca explicitamente como "no disponible" todo lo relativo al adaptador. Cualquier uso en produccion exigiria auditar primero los pesos y el proceso de ajuste, dado que se desconoce que datos se utilizaron y con que objetivo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre un transformer decoder-only; el modelo base es Qwen2ForCausalLM |
| Parametros totales | 3,09 B en el modelo base; el repositorio solo contiene el adaptador (0,1 GB en disco). Tamano del adaptador en parametros: no disponible |
| Parametros activos | No aplica: no es un modelo Mixture of Experts |
| Longitud de contexto | 32.768 tokens en el modelo base (ampliable a 131.072 con RoPE scaling tipo YaRN); no declarada para el adaptador |
| Tipos de cuantizacion | No disponible para el adaptador. El modelo base admite bitsandbytes 8/4 bits, AWQ, GPTQ y GGUF (Q2_K a Q8_0) |
| Idiomas soportados | No disponible. El modelo base declara soporte para mas de 29 idiomas |
| Licencia | No disponible en el repositorio del adaptador. El modelo base Qwen2.5-3B se distribuye bajo Qwen Research License |
| Formato de pesos | safetensors (pesos del adaptador en formato PEFT/LoRA) |
| Libreria de carga | peft (version declarada en la model card: PEFT 0.20.0); compatible con transformers |
| Tarea declarada (pipeline) | text-generation |
| Fecha de publicacion | 10 de septiembre de 2026, segun los metadatos de HuggingFace |

## Arquitectura y entrenamiento

El adaptador se apoya en Qwen2.5-3B-Instruct, un transformer decoder-only con 36 capas, dimension oculta de 2048, atencion con query groups (16 cabezas de consulta y 2 de clave/valor, es decir GQA con ratio 8:1), activacion SwiGLU, normalizacion RMSNorm y embeddings posicionales rotatorios (RoPE). El vocabulario del tokenizador cubre 151.936 entradas, lo que favorece la eficiencia multilingue. La familia Qwen2.5 fue preentrenada sobre aproximadamente 18 billones de tokens y el modelo Instruct paso despues por un proceso de ajuste supervisado y optimizacion por preferencias (DPO), segun la documentacion publicada por el equipo de Qwen.

Sobre el proceso de ajuste del adaptador no hay absolutamente ningun dato: se desconoce el rango y el alpha de LoRA, los modulos objetivo (q_proj, k_proj, v_proj, o_proj, MLP), la tasa de aprendizaje, el numero de pasos, el regimen de precision y la composicion del dataset. La etiqueta arxiv:1910.09700 que aparece en los tags del repositorio corresponde al articulo de Lacoste et al. sobre estimacion de emisiones de carbono en aprendizaje automatico, citado en la plantilla de model card, y no a un articulo metodologico del modelo. Tampoco se documenta ninguna innovacion tecnica propia, decodificacion especulativa ni mecanismo de atencion alternativo.

## Capacidades

Advertencia previa: el adaptador no documenta capacidades propias. La lista siguiente describe las capacidades conocidas del modelo base Qwen2.5-3B-Instruct, que pueden haberse visto alteradas (mejoradas o degradadas) por el ajuste LoRA sin que exista forma de verificarlo con la informacion disponible.

- Generacion de texto conversacional multi-turno, con seguimiento de instrucciones y formato de chat.
- Razonamiento de varios pasos y resolucion de problemas matematicos de nivel medio.
- Generacion y explicacion de codigo en lenguajes habituales, asi como depuracion basica.
- Salida estructurada en JSON y otros formatos, util para extraccion de campos.
- Soporte de tool calling y function calling segun el formato de plantilla de chat de Qwen, lo que habilita flujos de agente.
- Capacidad multilingue declarada por el modelo base (mas de 29 idiomas, con especial solidez en chino e ingles).
- Manejo de contextos largos de hasta 32.768 tokens sin tecnicas adicionales.
- Capacidades especiales como vision, audio o modo de razonamiento explicito: no disponibles en este modelo (la variante 3B es exclusivamente de texto).
- Comportamiento del adaptador ante cualquiera de los puntos anteriores: no disponible.

## Casos de uso

Los casos que se enumeran a continuacion son aplicables al modelo base y, de forma condicional, al adaptador, siempre que este se valide previamente. Se indica en cada uno el encaje tecnico y la salvedad correspondiente.

- Descomposicion de tareas de planificacion: dado un objetivo de proyecto descrito en lenguaje natural, el modelo puede generar una lista jerarquica de actividades, dependencias y estimaciones preliminares de duracion. Es el escenario que sugiere el nombre del repositorio (planning, CPM), y encaja con la ventana de 32.768 tokens para absorber el enunciado completo del proyecto.
- Asistencia en la construccion de diagramas de red y rutas criticas: el modelo puede transformar una tabla de tareas y predecesores en una estructura procesable (JSON o CSV) que alimente una herramienta externa de gestion de proyectos, aprovechando su capacidad de salida estructurada.
- Extraccion de informacion de documentacion tecnica: conversion de pliegos, actas de reunion o especificaciones en campos normalizados mediante tool calling o salida JSON, con el fin de alimentar una base de datos de proyecto.
- Automatizacion de atencion al cliente en flujos acotados: conversaciones multi-turno con contexto largo gracias a los 32.768 tokens, viables en una unica GPU de gama media al tratarse de un modelo de 3 B.
- Asistente de codigo integrado en el IDE o en pipelines de CI/CD: revision de diffs, generacion de tests unitarios y explicacion de errores de compilacion, con ayuda de function calling para consultar repositorios o ejecutar comandos.
- Clasificacion y enrutado de tickets o incidencias: categorizacion de texto entrante en un sistema de triaje, tarea en la que un modelo de 3 B ofrece latencia baja y coste reducido.
- Prototipado y experimentacion en local: al ser un adaptador de 0,1 GB sobre un modelo de 3 B, permite iterar en un portatil con GPU de 8-12 GB sin depender de APIs externas.
- Generacion de borradores de informes de seguimiento: resumen de avances, riesgos y desviaciones a partir de notas dispersas, con la salvedad de que las cifras generadas deben verificarse siempre.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del adaptador no incluye ninguna seccion de evaluacion, el repositorio no contiene artefactos de evaluacion y la busqueda web no ha devuelto resultados tecnicos relacionados con este modelo.

Para el modelo base Qwen2.5-3B-Instruct tampoco se reproducen cifras en esta ficha, ya que no forman parte de la informacion proporcionada y no deben inferirse. Cualquier comparacion de rendimiento requeriria ejecutar una evaluacion propia con un conjunto de validacion representativo de la tarea objetivo.

## Requisitos de hardware

Estimaciones calculadas a partir del tamano del modelo base (3,09 B parametros) mas el adaptador LoRA (0,1 GB) y el overhead habitual de la cache KV:

- VRAM en fp16/bf16: aproximadamente 6,5-8 GB para los pesos, mas entre 0,5 y 2 GB de cache KV segun la longitud de contexto utilizada.
- VRAM en 8 bits (bitsandbytes): en torno a 4 GB de pesos.
- VRAM en 4 bits (bitsandbytes, AWQ o GPTQ): en torno a 2,5-3 GB de pesos.
- GGUF Q4_K_M: archivo de aproximadamente 2 GB; muy holgado en GPUs de 8 GB.
- GPU consumer compatibles: si cabe en tarjetas de 8 GB o mas, como RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4080 y RTX 4090. En tarjetas de 6 GB funciona en cuantizacion de 4 bits con contexto reducido.
- GPU de centro de datos: A100, H100, L40S y A10 son sobredimensionadas para un unico modelo de 3 B; su interes estaria en servir muchas replicas concurrentes.
- Opciones de despliegue: transformers con PEFT para fusionar y cargar el adaptador; vLLM y TGI para servicio con batcheo continuo y adaptadores multiples (multi-LoRA); llama.cpp y Ollama para ejecucion local en CPU/GPU tras convertir los pesos a GGUF; SGLang como alternativa de servicio de baja latencia.
- Latencia y throughput: no disponibles. No se han publicado mediciones para este adaptador ni para este ajuste concreto.

## Comparativa con modelos similares

La comparacion se establece entre el modelo base de este repositorio y alternativas de la misma franja de tamano. No se incluye el adaptador como fila independiente porque no hay datos publicados sobre el.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Qwen2.5-3B-Instruct (base de este adaptador) | 3,09 B | 32.768 tokens (131.072 con YaRN) | Qwen Research License | Pesos abiertos en HuggingFace | Uso comercial sujeto a los terminos de la licencia de investigacion de Qwen |
| Llama-3.2-3B-Instruct | 3,21 B | 128.000 tokens | Llama 3.2 Community License | Pesos abiertos en HuggingFace | Contexto mayor y ecosistema amplio; licencia con clausulas de uso aceptable |
| Phi-3.5-mini-instruct | 3,8 B | 128.000 tokens | MIT | Pesos abiertos en HuggingFace | Orientado a razonamiento y codigo; requiere aceptar condiciones en el repositorio |
| Adaptador arkan-planning-cpm-lora | No disponible (adaptador LoRA) | No declarado | No disponible | 0 descargas, 0 likes | Sin model card, sin evaluacion, sin datos de entrenamiento |

El rendimiento comparado en benchmarks no se incluye porque no hay cifras disponibles en la informacion proporcionada para ninguno de los elementos de esta tabla en el contexto de esta ficha.

## Limitaciones y advertencias

- Ausencia total de documentacion: la model card es la plantilla por defecto y no describe datos, objetivo ni metodologia. No es posible reproducir ni auditar el ajuste.
- Licencia del adaptador no declarada. La licencia del modelo base (Qwen Research License) impone condiciones especificas para uso comercial, por lo que un despliegue en produccion exige revisar dichos terminos antes de nada.
- Riesgo de sobreajuste y de olvido catastrofico: los adaptadores LoRA entrenados sobre datasets pequenos o muy especificos suelen degradar capacidades generales del modelo base (multilingue, codigo, salida estructurada) sin que ello sea evidente en pruebas superficiales.
- Riesgo de alucinacion: se desconoce si el ajuste incluye datos que fomenten la invencion de cifras, plazos o dependencias, algo especialmente delicado en tareas de planificacion donde los numeros se presentan como hechos.
- Sesgos: no se ha documentado la composicion del dataset, por lo que no puede descartarse la amplificacion de sesgos presentes en los datos de ajuste. El modelo base tampoco publica una evaluacion de sesgos completa.
- Idiomas: no declarados para el adaptador. Aunque el modelo base cubre mas de 29 idiomas, un ajuste con datos mayoritariamente en ingles puede degradar el rendimiento en castellano.
- Sin validacion de la comunidad: cero descargas y cero likes implican que no existen usuarios que hayan reportado comportamiento, errores o calidad real.
- Etiquetas enganosas: el tag arxiv:1910.09700 no acompana a la metodologia del modelo, sino a la plantilla de calculo de emisiones, por lo que no debe interpretarse como respaldo academico.
- Longitud de contexto efectiva: aunque el modelo base soporta 32.768 tokens, el rendimiento del adaptador en contextos largos no esta verificado.
- Recomendacion operativa: antes de cualquier uso, fusionar el adaptador con el modelo base, ejecutar una bateria de evaluacion propia (tarea objetivo y capacidades generales) y comparar contra el modelo base sin ajustar para cuantificar la ganancia real. Si no hay mejora medible, no hay motivo para asumir el riesgo adicional.

## Enlaces

- Repositorio del adaptador en HuggingFace: https://huggingface.co/psnuser061020/arkan-planning-cpm-lora
- Modelo base Qwen2.5-3B-Instruct: https://huggingface.co/Qwen/Qwen2.5-3B-Instruct
- Blog oficial de la familia Qwen2.5: https://qwenlm.github.io/blog/qwen2.5/
- Repositorio GitHub de Qwen2.5: https://github.com/QwenLM/Qwen2.5
- Libreria PEFT de HuggingFace: https://github.com/huggingface/peft
- Articulo original de LoRA (Hu et al., 2021): https://arxiv.org/abs/2106.09685
- Articulo citado en la plantilla de la model card (Lacoste et al., 2019): https://arxiv.org/abs/1910.09700
- Calculadora de impacto de aprendizaje automatico: https://mlco2.github.io/impact
- Resultados de la busqueda web: no se han encontrado referencias tecnicas relevantes sobre este modelo. Las coincidencias obtenidas corresponden a paginas de significado de apellidos y comercio electronico sin relacion con el artefacto.
