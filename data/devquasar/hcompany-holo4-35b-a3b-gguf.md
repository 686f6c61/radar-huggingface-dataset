# DevQuasar/Hcompany.Holo4-35B-A3B-GGUF

## Resumen

DevQuasar/Hcompany.Holo4-35B-A3B-GGUF es una cuantización en formato GGUF del modelo Hcompany/Holo4-35B-A3B, publicada por el usuario DevQuasar, conocido por distribuir versiones cuantizadas de modelos abiertos bajo el lema "Make knowledge free for everyone". Se trata, por tanto, de un artefacto derivado: el trabajo original corresponde a H Company, mientras que este repositorio solo aporta los pesos convertidos a GGUF para su uso en runtimes de inferencia local.

El modelo base se etiqueta con el pipeline `image-text-to-text`, lo que indica que acepta imágenes y texto como entrada y genera texto como salida; es decir, pertenece a la familia de modelos de visión-lenguaje. La nomenclatura "35B-A3B" del nombre apunta a una arquitectura de mezcla de expertos (MoE) con aproximadamente 35 000 millones de parámetros totales y unos 3000 millones activos por token, aunque la model card del repositorio no documenta ni la arquitectura ni el entrenamiento de forma explícita.

La relevancia de esta publicación es limitada y debe evaluarse con cautela: en el momento de recopilar los datos el repositorio acumula 0 descargas y 0 interacciones, no declara licencia ni idiomas soportados, y presenta inconsistencias internas notables (un recuento de parámetros de 446 571 248 frente al "35B" del nombre, y un tamaño de repositorio de tan solo 0,9 GB). Es, en la práctica, un artefacto recién creado y sin validación comunitaria.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (la nomenclatura "A3B" sugiere un transformer disperso tipo MoE, sin confirmar en la documentacion del repositorio) |
| Parametros totales | 35 000 millones segun el nombre del modelo; 446 571 248 segun el recuento de safetensors reportado (dato discrepante) |
| Parametros activos | aproximadamente 3000 millones segun la nomenclatura "A3B" (no confirmado) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF (los niveles concretos no se detallan en la model card) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

La informacion disponible no permite describir la arquitectura interna del modelo base. Lo unico confirmado es la etiqueta de pipeline `image-text-to-text`, que implica un codificador visual acoplado a un decodificador de lenguaje, y la relacion declarada `base_model: Hcompany/Holo4-35B-A3B`. La lectura del nombre ("35B-A3B") es compatible con un esquema de mezcla de expertos con enrutado disperso, pero la model card no aporta ninguna confirmacion, ni el numero de expertos, ni la dimension del estado oculto, ni el mecanismo de atencion empleado.

Tampoco hay informacion sobre el corpus de entrenamiento, el volumen de tokens, la composicion del dataset, ni sobre si se aplicaron tecnicas de ajuste por preferencias (RLHF, DPO u otras). El repositorio es exclusivamente una conversion de formato: no incluye informacion sobre el proceso de cuantizacion, los niveles GGUF generados, ni las metricas de degradacion respecto al modelo original.

## Capacidades

- Procesamiento conjunto de imagen y texto: la etiqueta `image-text-to-text` confirma que el modelo acepta entradas multimodales con imagenes.
- Generacion de texto condicionada por imagen: capacidad implicita en el pipeline declarado.
- El resto de capacidades (razonamiento multi-paso, generacion de codigo, matematicas, tool calling, function calling, uso como agente, modo de razonamiento explicito, audio, etc.) no estan documentadas en la informacion disponible y no deben darse por supuestas.
- Cobertura multilingue: no disponible.

## Casos de uso

Los siguientes escenarios son aplicaciones tipicas de un modelo de vision-lenguaje con arquitectura dispersa, pero deben tratarse como hipotesis de trabajo: la ausencia de documentacion sobre context window, idiomas y licencia impide validarlos sin pruebas previas.

- Automatizacion de interfaces graficas (computer use): un agente podria capturar la pantalla de una aplicacion, interpretarla y emitir acciones sobre los elementos identificados. El modelo es adecuado en teoria por su naturaleza vision-lenguaje y por el bajo coste por token que implica tener solo unos 3000 millones de parametros activos, aunque no hay evidencia publicada de que soporte este flujo.
- Extraccion estructurada de documentos con componente visual: conversion de facturas, albaranes, formularios escaneados o tablas en imagenes a JSON u otro formato estructurado. Requiere verificar previamente el soporte de salidas estables y la ventana de contexto disponible.
- Respuesta a preguntas sobre documentacion tecnica con diagramas: analisis de esquemas de arquitectura, planos o capturas de paneles de monitorizacion, combinando la imagen con instrucciones textuales.
- Soporte al cliente con adjuntos visuales: atencion de tickets en los que el usuario envia capturas de errores o fotografias del producto, generando una respuesta textual contextualizada.
- Descripcion de imagenes y accesibilidad: generacion de texto alternativo para catalogos, bibliotecas de imagenes o plataformas de contenido, siempre que se valide la calidad en el idioma objetivo.
- Despliegue on-premise con datos sensibles: al distribuirse en GGUF, el modelo puede ejecutarse en infraestructura propia sin conexion a servicios externos, lo que resulta atractivo en entornos con requisitos de confidencialidad, sujeto a la resolucion previa de la licencia.
- Evaluacion y comparacion de pipelines multimodales: uso como referencia en pruebas internas de latencia, calidad de cuantizacion y comportamiento frente a otros VLM en hardware controlado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Ni el repositorio GGUF ni la model card del modelo base incluida como referencia aportan cifras de MMLU, HumanEval, GSM8K, MMMU, DocVQA ni de ninguna otra evaluacion, ni datos de degradacion por cuantizacion respecto a los pesos originales en safetensors.

## Requisitos de hardware

Las estimaciones siguientes asumen el escenario indicado por el nombre del modelo (35 000 millones de parametros totales, 3000 millones activos) y deben tomarse como aproximaciones de ingenieria, no como datos publicados. El tamano de repositorio de 0,9 GB es incompatible con esa hipotesis y podria indicar una subida incompleta o un modelo de tamano mucho menor.

- VRAM estimada para inferencia (pesos, escenario 35B total):
  - Cuantizacion de 4 bits: aproximadamente 20-22 GB.
  - Cuantizacion de 5-6 bits: aproximadamente 26-30 GB.
  - Cuantizacion de 8 bits: aproximadamente 35-37 GB.
  - Precisión completa en FP16/BF16: aproximadamente 70 GB.
- Al ser un modelo disperso con unos 3000 millones de parametros activos, el coste computacional por token es bajo en comparacion con un modelo denso de 35 000 millones, por lo que el throughput deberia ser notablemente superior al de un denso equivalente; las cifras concretas de latencia y tokens por segundo son no disponibles.
- GPU recomendadas: NVIDIA A100 (40 GB o 80 GB) y H100 para despliegues con concurrencia; en el extremo inferior, una RTX 4090 o RTX 3090 con 24 GB puede alojar cuantizaciones de 4 bits, con posible desbordamiento a memoria del sistema si el contexto es largo.
- Cabe en GPU de consumo: si, en GPUs de 24 GB con cuantizacion de 4 bits; para cuantizaciones de 8 bits o precision completa se requiere hardware de centro de datos o multiples GPU.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, llama-cpp-python y servidores compatibles con GGUF. vLLM ofrece soporte experimental de GGUF a traves del backend de llama.cpp, mientras que Text Generation Inference (TGI) no soporta este formato; para TGI habria que usar los pesos originales en safetensors.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

No se dispone de datos verificados de benchmarks ni de especificaciones del modelo base que permitan una comparacion rigurosa con alternativas de la misma categoria. La unica comparacion documentable es la del propio artefacto frente a su modelo de origen.

| Aspecto | Hcompany.Holo4-35B-A3B-GGUF | Hcompany/Holo4-35B-A3B |
|---|---|---|
| Parametros totales | 35 000 millones segun el nombre; 446 571 248 segun safetensors reportado | no disponible |
| Parametros activos | aproximadamente 3000 millones (segun nomenclatura) | no disponible |
| Longitud de contexto | no disponible | no disponible |
| Formato de pesos | GGUF | safetensors (presumiblemente) |
| Licencia | no disponible | no disponible |
| Uso comercial | indeterminado por falta de licencia | indeterminado por falta de licencia |
| Ventaja principal | ejecucion local y en hardware de consumo | precision original, sin degradacion por cuantizacion |
| Desventaja principal | perdida de calidad no medida y ausencia de evaluacion | requiere mas memoria y runtime de mayor complejidad |

## Limitaciones y advertencias

- Ausencia total de validacion: 0 descargas y 0 "likes" en el momento de la recopilacion, sin evaluaciones de terceros ni resultados reproducibles.
- Licencia no declarada: al no especificarse licencia, no puede asumirse permiso de uso comercial ni redistribucion. Es un riesgo legal que debe resolverse consultando el modelo base antes de cualquier despliegue en produccion.
- Discrepancia de parametros: el recuento de 446 571 248 parametros reportado en los metadatos de safetensors contradice el "35B" del nombre del modelo. Es imprescindible verificar que artefacto se esta descargando realmente.
- Tamano de repositorio anormal: 0,9 GB es demasiado reducido para alojar una cuantizacion util de un modelo de 35 000 millones de parametros, incluso en 2 bits. Podria tratarse de una subida incompleta, de una cuantizacion parcial o de un modelo de escala muy inferior.
- Fecha de publicacion inconsistente: el registro indica creacion el 2026-09-28, una fecha futura respecto al momento habitual de consulta; conviene confirmar la vigencia del repositorio.
- Riesgo de alucinacion: no existe documentacion especifica sobre tasas de alucinacion ni sobre evaluaciones de fidelidad factual. En modelos de vision-lenguaje el riesgo se acentua en tareas de OCR y lectura de tablas densas.
- Idiomas no declarados: se desconoce si el modelo maneja correctamente el castellano o si su entrenamiento se concentra en ingles y chino, algo habitual en esta familia de modelos.
- Contexto no documentado: sin longitud de contexto declarada no es posible dimensionar conversaciones multi-turno ni tareas de documentos extensos.
- Cuantizacion no oficial: al no proceder del equipo autor del modelo base, no hay garantia de paridad de comportamiento, de compatibilidad con plantillas de chat concretas ni de soporte por parte de H Company.

## Enlaces

- Repositorio GGUF: https://huggingface.co/DevQuasar/Hcompany.Holo4-35B-A3B-GGUF
- Modelo base: https://huggingface.co/Hcompany/Holo4-35B-A3B
- Sitio del cuantizador: https://devquasar.com
- Repositorio del autor de la cuantizacion en GitHub: https://github.com/csabakecskemeti/devquasar
- Pagina de donaciones del autor: https://ko-fi.com/L4L416YX7C
