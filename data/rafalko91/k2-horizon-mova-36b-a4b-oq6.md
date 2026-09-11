# rafalko91/K2-Horizon-MoVA-36B-A4B-oQ6

## Resumen

K2-Horizon-MoVA-36B-A4B-oQ6 es una version cuantizada del modelo K2-Horizon-MoVA-36B-A4B, publicada por el usuario rafalko91 en HuggingFace. Se trata de una conversion a 6 bits realizada con la herramienta oQ (oMLX v0.7.0.dev1), un esquema de cuantizacion de precision mixta desarrollado por jundot. El repositorio pesa 30,9 GB y, segun los metadatos de safetensors, contiene 37.444.792.020 parametros (unos 37,4 mil millones).

El nombre del modelo indica dos cosas: "36B" hace referencia al orden de magnitud del total de parametros, y "A4B" sugiere, siguiendo la convencion habitual en modelos de mezcla de expertos (MoE), un numero de parametros activos del orden de 4000 millones. Esta interpretacion no esta confirmada en la informacion disponible, ya que la model card del autor se limita a documentar los parametros de cuantizacion y no incluye arquitectura, contexto, idiomas ni licencia.

Su relevancia practica es acotada pero concreta: se trata de un formato MLX, lo que lo orienta a inferencia local en equipos Apple Silicon con memoria unificada. No hay datos publicados de benchmarks, no tiene descargas ni valoraciones en el momento de redactar esta ficha, y el repositorio fue creado y actualizado el mismo dia (11 de septiembre de 2026), por lo que se debe tratar como un artefacto sin validacion de la comunidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (la nomenclatura "MoVA" y "A4B" del nombre sugiere mezcla de expertos, sin confirmar) |
| Parametros totales | 37.444.792.020 (~37,4 mil millones), dato de safetensors |
| Parametros activos | no disponible (la nomenclatura "A4B" sugiere del orden de 4000 millones, sin confirmar) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 6 bits, group size 64, precision mixta con oQ (oMLX v0.7.0.dev1) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors en formato MLX, con custom_code |
| Tamano del repositorio | 30,9 GB |
| Libreria declarada | mlx |
| Etiquetas | mlx, safetensors, k2_horizon, oq, quantized, custom_code, 6-bit, region:us |
| Fecha de creacion | 11 de septiembre de 2026 |
| Fecha de ultima actualizacion | 11 de septiembre de 2026 |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

No hay informacion disponible sobre la arquitectura del modelo base. La model card del repositorio no describe el tipo de transformer, el mecanismo de atencion, la composicion del dataset de entrenamiento, el numero de tokens vistos ni si se aplicaron tecnicas de alineacion como RLHF o DPO. El tag "custom_code" indica que el modelo requiere codigo personalizado para cargarse, y el tag "k2_horizon" apunta a una familia de modelos que no ha podido verificarse con la informacion disponible. La designacion "MoVA" tampoco aparece documentada.

Lo unico documentado por el autor es el proceso de cuantizacion: se aplico oQ, una tecnica de cuantizacion de precision mixta de la herramienta oMLX (version 0.7.0.dev1), con un esquema de 6 bits y tamano de grupo 64, y el resultado se serializo en safetensors en formato MLX. La cuantizacion de precision mixta asigna distintos numeros de bits a distintas capas o tensores en funcion de su sensibilidad, con el objetivo de reducir la degradacion respecto a una cuantizacion uniforme del mismo tamano medio.

## Capacidades

- No se dispone de documentacion sobre capacidades especificas del modelo base (generacion de texto, razonamiento, codigo, matematicas o vision).
- No hay confirmacion de soporte de tool calling ni de function calling.
- No hay confirmacion de capacidades de agente o razonamiento multi-paso.
- No se ha publicado la lista de idiomas soportados.
- No hay evidencia de modo de razonamiento explicito (thinking mode), entrada de audio o entrada de imagen.
- Lo unico verificable es su formato de despliegue: inferencia mediante MLX en hardware Apple Silicon, con pesos cuantizados a 6 bits.

## Casos de uso

- Inferencia local en estaciones de trabajo Apple Silicon: con 37,4 mil millones de parametros cuantizados a 6 bits, el conjunto de pesos ocupa unos 28 GB, de modo que el modelo puede ejecutarse en un Mac con memoria unificada de 64 GB o superior sin GPU dedicada ni conexion a servicios en la nube.
- Evaluacion de la cuantizacion oQ: el repositorio sirve como caso de estudio para medir la perdida de calidad de una cuantizacion de precision mixta a 6 bits frente al modelo base sin cuantizar, comparando salidas en tareas de generacion y razonamiento.
- Prototipado en local antes de decidir un despliegue en produccion: permite validar prompts, plantillas de chat y flujos de trabajo en una maquina de sobremesa antes de invertir en infraestructura GPU, siempre que se acepte la perdida de precision introducida por la cuantizacion.
- Asistente de programacion con privacidad de codigo: si el modelo base confirma capacidades de generacion de codigo, puede actuar como backend local de un asistente tipo Continue o similar mediante MLX-LM, manteniendo el codigo fuente fuera de servicios de terceros.
- Recuperacion aumentada sobre documentacion interna (RAG): con ~37 mil millones de parametros hay margen para sintetizar y resumir documentos extensos, aunque el limite practico vendra marcado por la longitud de contexto, que no esta documentada.
- Servicio de bajo coste marginal para un equipo pequeno: desplegado en un unico Mac Studio con 64 o 128 GB de memoria unificada, permite atender cargas moderadas sin coste por token, con la contrapartida de un throughput inferior al de una GPU de centro de datos.
- Experimentacion con familias MoE de bajo numero de parametros activos: si se confirma la hipotesis de ~4 mil millones de parametros activos, el coste computacional por token seria notablemente inferior al de un modelo denso del mismo tamano total, lo que resulta adecuado para tareas de alto volumen y baja latencia.
- Reproduccion de pipelines de cuantizacion: el repositorio documenta bits y group size, lo que permite reproducir el proceso con oMLX y comparar configuraciones alternativas (4 bits, 8 bits) sobre el mismo modelo base.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye MMLU, HumanEval, GSM8K ni ninguna otra metrica, y la busqueda web realizada no ha devuelto resultados relacionados con el modelo.

## Requisitos de hardware

- VRAM/memoria estimada para los pesos: a 6 bits, aproximadamente 0,75 bytes por parametro, lo que para 37.444.792.020 parametros supone unos 28,1 GB solo en pesos. El repositorio ocupa 30,9 GB, coherente con ese calculo mas los metadatos y tensores auxiliares.
- Memoria adicional para cache KV: no disponible, al desconocerse la longitud de contexto y la configuracion de atencion. En la practica conviene reservar varios GB extra.
- Cabe en GPU de consumo: no de forma directa, porque el formato es MLX y esta pensado para memoria unificada de Apple Silicon. En un Mac, se recomienda un minimo de 64 GB de memoria unificada (Mac Studio M1/M2 Ultra, M3/M4 Max con 64 GB o superior); con 32 o 36 GB no cabria con holgura.
- GPU dedicadas: no aplicable sin conversion previa del formato. No se documenta soporte para CUDA ni ROCm.
- Opciones de despliegue: MLX y mlx-lm son las rutas naturales. vLLM y TGI no soportan pesos MLX. llama.cpp y Ollama requeririan una conversion a GGUF que no se proporciona en el repositorio.
- Latencia y throughput: no disponibles. No hay mediciones publicadas de tokens por segundo en ningun hardware.

## Comparativa con modelos similares

No es posible una comparativa rigurosa porque se desconocen la arquitectura, el contexto, la licencia y el rendimiento del modelo. A continuacion se muestran alternativas de la misma categoria de tamano (modelos de mezcla de expertos en la franja de 30 a 50 mil millones de parametros totales) con datos publicos ampliamente conocidos, que se deben verificar en sus propias fichas.

| Modelo | Parametros totales | Parametros activos | Contexto | Licencia | Formato |
|---|---|---|---|---|---|
| K2-Horizon-MoVA-36B-A4B-oQ6 | 37,4 mil millones | no disponible (sugerido ~4 mil millones por el nombre) | no disponible | no disponible | MLX safetensors 6 bits |
| Qwen3-30B-A3B | ~30,5 mil millones | ~3,3 mil millones | 128K (segun configuracion publicada) | Apache 2.0 | safetensors, GGUF, MLX |
| Mixtral 8x7B | ~46,7 mil millones | ~12,9 mil millones | 32K | Apache 2.0 | safetensors, GGUF |
| DeepSeek-V2-Lite | ~15,7 mil millones | ~2,4 mil millones | 32K | licencia propia con clausulas de uso | safetensors |

La diferencia mas relevante frente a estas alternativas no es de rendimiento, sino de trazabilidad: los modelos comparados publican contexto, licencia y evaluaciones, mientras que en este repositorio esos datos no estan disponibles.

## Limitaciones y advertencias

- Licencia no disponible: no se puede determinar si el uso comercial esta permitido. Se debe contactar con el autor antes de cualquier despliegue productivo.
- Model card minima: no documenta arquitectura, contexto, idiomas, datos de entrenamiento ni limitaciones conocidas.
- Modelo cuantizado: se espera una degradacion de calidad respecto al modelo base en 16 bits. A 6 bits la perdida suele ser menor que a 4 bits, pero no existe ninguna evaluacion publicada que lo confirme para este caso.
- Dependencia de codigo personalizado: el tag "custom_code" implica cargar el modelo con trust_remote_code activado, lo que supone ejecutar codigo del repositorio en la maquina local. Conviene revisar ese codigo antes de usarlo.
- Sin validacion de la comunidad: cero descargas y cero likes, repositorio creado y actualizado el mismo dia. No hay evidencia de que el modelo se haya probado.
- Dependencia de MLX: no es ejecutable en CUDA o ROCm sin conversion previa, y no se proporciona una version GGUF. El ecosistema de herramientas compatible es mas reducido que el de llama.cpp.
- Origen del modelo base no verificado: no se ha localizado el repositorio del K2-Horizon-MoVA-36B-A4B sin cuantizar ni documentacion de la familia "k2_horizon", por lo que se desconoce la procedencia de los pesos y los datos con los que se entreno.
- Riesgo de alucinacion y sesgos: sin datos publicados. Cualquier uso en produccion deberia acompanarse de evaluacion propia en el dominio objetivo.
- La busqueda web realizada no devolvio informacion util: los resultados obtenidos no guardan ninguna relacion con el modelo ni con el ambito de la inteligencia artificial.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/rafalko91/K2-Horizon-MoVA-36B-A4B-oQ6
- Herramienta de cuantizacion oQ (oMLX) citada en la model card: https://github.com/jundot/omlx
- Framework MLX, necesario para cargar los pesos: https://github.com/ml-explore/mlx
- Repositorio del modelo base K2-Horizon-MoVA-36B-A4B: no disponible
- Paper o informe tecnico del modelo: no disponible
- Demo o espacio de pruebas: no disponible
- No se han encontrado otros enlaces relevantes en la busqueda web.
