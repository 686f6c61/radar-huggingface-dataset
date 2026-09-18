# rossenburg/twi-sft-v3-6

## Resumen

Sage v3.6 es un conjunto de adaptadores LoRA para un asistente conversacional en twi (akan), desarrollado por el usuario rossenburg. No se trata de un modelo completo, sino de pesos de adaptacion que se cargan sobre el modelo base `ghananlpcommunity/MiniCPM5-1B-Twi`, un modelo de aproximadamente 1.000 millones de parametros segun la nomenclatura de su identificador. El objetivo es dotar a ese modelo base de capacidad de dialogo instruccional en twi mediante un ajuste supervisado (SFT) ligero.

El entrenamiento se realizo con MLX LoRA, con rango 16 y 2.000 iteraciones, y los resultados reportados por el autor son una perdida de entrenamiento de 0,371 y una perdida de validacion de 0,245. Estos valores indican un ajuste razonablemente estable, aunque no aportan informacion sobre capacidades reales fuera de la distribucion de entrenamiento.

La relevancia de esta ficha es acotada pero clara: se trata de un ejemplo de adaptacion de bajo coste de un modelo pequeno a una lengua de bajos recursos con muy poca representacion en los corpus multilingues habituales, como es el twi. El repositorio declara licencia Apache 2.0, soporte para los codigos de idioma `tw` y `aka`, y esta publicado bajo el identificador `rossenburg/twi-sft-v3-6`. No se ha publicado informacion adicional sobre composicion del dataset, ventana de contexto o evaluacion estandarizada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptadores LoRA sobre transformer (arquitectura del modelo base no detallada en la informacion disponible) |
| Parametros totales | No disponible (adaptador LoRA de rango 16; el modelo base es de ~1B de parametros segun su identificador) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (los adaptadores MLX se cargan sobre el modelo base; las cuantizaciones aplicables dependen del modelo base) |
| Idiomas soportados | Twi (`tw`), akan (`aka`) |
| Licencia | Apache 2.0 |
| Formato de pesos | Adaptadores MLX LoRA (carga mediante `mlx_lm`); nombre exacto de fichero no detallado en la informacion disponible |
| Nombre del modelo | Sage v3.6 |
| Modelo base | ghananlpcommunity/MiniCPM5-1B-Twi |
| Tipo de ajuste | SFT con LoRA, rango 16, 2.000 iteraciones, framework MLX |
| Perdida de entrenamiento | 0,371 |
| Perdida de validacion | 0,245 |
| Tamano del repositorio | 0,0 GB |
| Autor | rossenburg |
| Fecha de creacion | 2026-09-18 |

## Arquitectura y entrenamiento

La informacion disponible describe exclusivamente la capa de adaptacion, no la arquitectura subyacente. Se sabe que se empleo MLX LoRA con rango 16 y 2.000 iteraciones de entrenamiento supervisado (SFT) sobre el modelo `ghananlpcommunity/MiniCPM5-1B-Twi`. El rango 16 es un valor bajo, coherente con un ajuste de estilo y formato conversacional mas que con una inyeccion masiva de conocimiento nuevo. No se detalla el numero de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron fases posteriores de RLHF o DPO.

Tampoco se especifica si el modelo base emplea atencion estandar, atencion lineal u otra variante, ni su ventana de contexto nativa. La unica innovacion tecnica documentada es el propio flujo de trabajo: uso de MLX LoRA para adaptar un modelo pequeno a una lengua de bajos recursos, con soporte de carga directa mediante `mlx_lm` y `adapter_path`. La perdida de validacion inferior a la de entrenamiento (0,245 frente a 0,371) sugiere ausencia de sobreajuste evidente en el punto de control reportado, aunque sin curvas de entrenamiento ni metricas por tarea no puede extraerse una conclusion firme.

## Capacidades

- Generacion de texto conversacional en twi, con formato de instruccion del tipo `### Instruction:` / `### Response:`.
- Asistencia tipo chatbot: el nombre del artefacto (Sage) y el formato de prompt indican un uso como asistente de dialogo.
- Cobertura declarada de twi (`tw`) y akan (`aka`), dos codigos estrechamente relacionados.
- Capacidad multilingue adicional: no disponible; no se declara soporte de ingles ni de otras lenguas, aunque el modelo base podria conservar parte de ellas.
- Tool calling / function calling: no disponible (no se menciona en la informacion proporcionada).
- Soporte de agentes y razonamiento multi-paso: no disponible (no se menciona).
- Modo de razonamiento explicito (thinking mode): no disponible.
- Vision o audio: no disponible (no se declara ninguna modalidad adicional a texto).
- Ajuste de instrucciones mediante SFT: confirmado por el propio nombre (`sft`) y por las perdidas reportadas.

## Casos de uso

- Asistencia conversacional en twi para hablantes nativos: el adaptador transforma un modelo base de ~1B en un asistente capaz de responder a instrucciones en twi, util para prototipos de chat en una lengua con poca cobertura en modelos comerciales.
- Atencion al cliente localizada en Ghana: integrado en un flujo de mensajeria, el modelo puede gestionar respuestas frecuentes en twi; al ejecutarse sobre un modelo de ~1B, el coste por token es bajo y permite despliegue en infraestructura modesta.
- Traduccion asistida twi-ingles y viceversa: aunque no se declara explicitamente la capacidad, es un uso natural para un modelo ajustado en una lengua de bajos recursos; requeriria validacion propia porque no hay benchmarks publicados.
- Generacion de contenido divulgativo en twi: redaccion de resumenes, articulos breves o material educativo para comunidades akan, con supervision humana por el riesgo de alucinacion en un modelo de este tamano.
- Prototipado e investigacion en NLP para lenguas de bajos recursos: el repositorio sirve como punto de partida reproducible (MLX LoRA, rango 16, 2.000 iteraciones) para experimentar con tecnicas de adaptacion de bajo coste.
- Integracion en aplicaciones moviles o de escritorio sin conexion en hardware Apple: al cargarse con `mlx_lm`, el modelo puede ejecutarse localmente en equipos con Apple Silicon, lo que resulta util en zonas con conectividad limitada.
- Ajuste incremental sobre el mismo modelo base: los adaptadores pueden servir de punto de partida para futuras iteraciones (Sage v3.7 y posteriores) o para fusionar con el modelo base y publicar un modelo unico.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

Unicos datos numericos reportados por el autor, correspondientes al entrenamiento y no a evaluacion estandarizada:

| Metrica | Valor |
|---|---|
| Perdida de entrenamiento (train loss) | 0,371 |
| Perdida de validacion (validation loss) | 0,245 |
| Iteraciones de entrenamiento | 2.000 |
| Rango LoRA | 16 |

No hay resultados de MMLU, HumanEval, GSM8K, Flores-200 ni de ninguna otra evaluacion reproducible, ni comparaciones con modelos de tamano similar.

## Requisitos de hardware

- Naturaleza del artefacto: son adaptadores LoRA, no pesos completos. Para inferir hay que cargar simultaneamente el modelo base `ghananlpcommunity/MiniCPM5-1B-Twi` y los adaptadores.
- VRAM estimada para inferencia: orientativamente, en torno a 0,7-1 GB para un modelo de ~1B en cuantizacion de 4 bits y 2-3 GB en precision de 16 bits, mas la memoria de la cache KV. Estas cifras son estimaciones basadas en el tamano del modelo base, no datos publicados por el autor.
- GPU recomendadas: no disponibles. El flujo de carga documentado usa MLX, que se ejecuta sobre memoria unificada de Apple Silicon (familias M1, M2, M3, M4 y posteriores).
- Cabe en GPU de consumo: si se convierte a un formato compatible con CUDA o Vulkan, un modelo de ~1B cabe sin problema en tarjetas con 4-8 GB de VRAM, como una RTX 3060 o superiores. No se documenta conversion a GGUF ni a otros formatos en la informacion disponible.
- Opciones de despliegue: `mlx_lm` es la unica via documentada explicitamente (`load` con `adapter_path` y `generate`). No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de informacion sobre alternativas comparables en la documentacion proporcionada. La unica referencia verificable es el propio modelo base.

| Modelo | Parametros | Contexto | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| rossenburg/twi-sft-v3-6 (adaptadores) | Adaptador LoRA rango 16 sobre base de ~1B | No disponible | tw, aka | Apache 2.0 | HuggingFace |
| ghananlpcommunity/MiniCPM5-1B-Twi (base) | ~1B segun identificador | No disponible | No disponible (presumiblemente twi) | No disponible en la informacion proporcionada | HuggingFace |

No se identifican en la informacion disponible otros adaptadores o modelos ajustados para twi con los que establecer una comparacion cuantitativa.

## Limitaciones y advertencias

- Ausencia total de evaluacion publicada: no hay benchmarks, ni evaluacion humana, ni comparacion con lineas base, por lo que el rendimiento real es desconocido.
- Modelo de ~1B de parametros: la capacidad de razonamiento, matematicas y conocimiento factual sera limitada en comparacion con modelos de mayor tamano, con riesgo elevado de alucinacion en preguntas factuales.
- Cobertura linguistica restringida a twi y akan: no se declara soporte fiable de ingles ni de otras lenguas, lo que limita su uso en entornos bilingues.
- Ventana de contexto desconocida: no se puede garantizar el manejo de conversaciones largas ni de documentos extensos.
- Sesgos: no documentados. Al entrenarse sobre un dataset no especificado, puede heredar sesgos del corpus del modelo base y del conjunto de instrucciones empleado, sin que exista informacion para cuantificarlos.
- Adaptadores, no modelo autonomo: requieren el modelo base y una version compatible de `mlx_lm`; un cambio de version o del modelo base puede romper la compatibilidad.
- Dependencia de hardware Apple: el flujo documentado esta atado a MLX. Su uso en GPU NVIDIA o AMD exige conversion previa a otro formato, no descrita por el autor.
- Licencia: los adaptadores se publican bajo Apache 2.0, pero la licencia del modelo base `ghananlpcommunity/MiniCPM5-1B-Twi` no se especifica en la informacion proporcionada y debe verificarse antes de cualquier uso comercial, ya que podria imponer condiciones adicionales.
- Repositorio con 0 descargas y 0 likes: no hay evidencia de uso en produccion ni de validacion por parte de terceros.
- Fechas de publicacion (2026) poco habituales: conviene verificar la integridad y procedencia de los ficheros antes de desplegarlos.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/rossenburg/twi-sft-v3-6
- Modelo base: https://huggingface.co/ghananlpcommunity/MiniCPM5-1B-Twi
- Libreria de carga mencionada en la model card: `mlx_lm` (https://github.com/ml-explore/mlx-lm)
- Papers, blogs, repositorios o demos adicionales: no disponible. Las busquedas web realizadas no devolvieron resultados relevantes sobre este modelo.
