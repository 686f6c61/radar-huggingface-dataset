# mradermacher/roberta-base-nvidia-aegis-v2-GGUF

## Resumen

Esta ficha describe el repositorio `mradermacher/roberta-base-nvidia-aegis-v2-GGUF`, publicado por el usuario mradermacher, conocido en HuggingFace por generar cuantizaciones GGUF de modelos de terceros. No se trata de un modelo entrenado desde cero, sino de una conversion a formato GGUF (con 12 niveles de cuantizacion distintos) del modelo base `leomaurodesenv/roberta-base-nvidia-aegis-v2`, cuyo autor original es leomaurodesenv. El repositorio no incluye model card propia: la unica informacion disponible es una plantilla autogenerada por la herramienta de conversion del cuantizador.

Por el identificador del modelo se deduce que se trata de un fine-tune de la arquitectura RoBERTa-base (transformer encoder-only de aproximadamente 125 millones de parametros) sobre el dataset NVIDIA Aegis, orientado a tareas de moderacion y seguridad de contenido. Esta deduccion no viene confirmada por ninguna documentacion publicada en el repositorio de la cuantizacion, que no aporta datos de entrenamiento, licencia, idiomas, benchmarks ni pipeline.

La relevancia de la ficha es fundamentalmente practica: permite ejecutar un clasificador de seguridad de ~125 M de parametros en hardware muy modesto mediante runtime GGUF, aunque con las salvedades importantes de que la licencia del modelo base no esta declarada, el soporte de arquitecturas encoder-only en los runtimes GGUF es limitado y no existen resultados de evaluacion publicados en la informacion disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | RoBERTa-base (transformer encoder-only, 12 capas, 768 dimensiones ocultas, 12 cabezas de atencion). Inferido del identificador; no confirmado en la model card |
| Parametros totales | Aproximadamente 125 M (arquitectura RoBERTa-base). No confirmado en la model card |
| Parametros activos | No aplica (modelo denso, no es MoE) |
| Longitud de contexto | 512 tokens (maximo tipico de RoBERTa-base). No confirmado para este fine-tune |
| Tipos de cuantizacion | F16, Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, IQ4_XS |
| Idiomas soportados | No disponible. El modelo base RoBERTa-base esta entrenado predominantemente en ingles, pero no se confirma para este fine-tune |
| Licencia | No disponible |
| Formato de pesos | GGUF (el modelo de origen se distribuye en safetensors, segun el flujo de conversion indicado: `convert_type: hf`) |
| Modelo de origen | leomaurodesenv/roberta-base-nvidia-aegis-v2 |
| Tarea declarada (pipeline) | No disponible |
| Descargas / likes | 0 / 0 |
| Fecha de creacion | 2026-09-17 (segun metadatos del repositorio) |
| Version de cuantizacion | quantize_version 2, output_tensor_quantised 1 |

## Arquitectura y entrenamiento

La arquitectura subyacente corresponde a RoBERTa-base, un transformer encoder-only con atencion bidireccional completa, 12 capas, 768 dimensiones ocultas y 12 cabezas de atencion. Se trata de un modelo denso (no MoE, no SSM, no hibrido), por lo que no hay parametros activos ni mecanismos de enrutamiento. El repositorio unicamente contiene las conversiones de pesos a GGUF; no se describe ningun proceso de entrenamiento adicional, ni numero de tokens, ni composicion del dataset, ni si hubo RLHF, DPO o ajuste supervisado.

La unica informacion tecnica aportada por el autor de la cuantizacion son los metadatos del proceso de conversion: `quantize_version: 2`, `output_tensor_quantised: 1`, `convert_type: hf` y la lista de cuantizaciones generadas. El nombre del modelo sugiere un ajuste sobre el dataset NVIDIA Aegis de seguridad de contenido, pero no hay confirmacion documental en la informacion disponible, ni detalles sobre la funcion de perdida, el numero de clases de salida o la formulacion exacta de la tarea.

## Capacidades

- Clasificacion de texto: al tratarse de un encoder-only derivado de RoBERTa-base, la capacidad esperable es la clasificacion de secuencias (por ejemplo, etiquetado de seguridad), no la generacion de texto libre.
- Moderacion de contenido: el identificador del modelo apunta a un uso como clasificador de contenido nocivo o no seguro, presumiblemente segun las categorias del dataset NVIDIA Aegis.
- Procesamiento bidireccional: al ser encoder-only, la representacion de cada token considera el contexto completo de la secuencia (hasta el limite de contexto), lo que suele dar buenos resultados en tareas de clasificacion frente a modelos autorregresivos del mismo tamano.
- Tool calling / function calling: no disponible; no es una capacidad esperable en esta arquitectura.
- Soporte de agentes y razonamiento multi-paso: no disponible; no es una capacidad esperable en esta arquitectura.
- Capacidades multilingues: no disponibles.
- Capacidades especiales (vision, audio, modo thinking): no disponibles.
- Generacion de texto, codigo o matematicas: no disponible; no es una capacidad esperable en un encoder-only de 125 M.

## Casos de uso

- Moderacion de contenido en plataformas UGC: el modelo puede actuar como clasificador de comentarios, publicaciones o mensajes, devolviendo una etiqueta de seguridad por cada fragmento de texto. Su tamano reducido permite procesar grandes volumenes por lotes en CPU.
- Guardrail de entrada y salida en pipelines de LLM: integrado antes y despues de un modelo generativo, filtraria prompts maliciosos y respuestas inapropiadas. Al ser un modelo pequeno, anadiria una latencia marginal frente al coste del modelo principal.
- Etiquetado y curado de datasets de seguridad: uso como anotador automatico para preclasificar grandes corpus y reducir el trabajo de revision manual, aprovechando que se puede ejecutar en paralelo en multiples procesos.
- Cumplimiento normativo y auditoria: generacion de registros de clasificacion para documentar el tratamiento de contenido en obligaciones de moderacion (por ejemplo, marcos europeos de servicios digitales), siempre que la licencia del modelo base lo permita.
- Triaje en herramientas de moderacion humana: priorizacion de la cola de revision mediante puntuaciones de riesgo, de modo que los revisores atiendan primero los casos marcados como mas probables de ser problematicos.
- Red teaming y evaluacion de modelos generativos: comprobacion sistematica de si las salidas de un LLM disparan el clasificador de seguridad, como metrica auxiliar en pruebas de robustez.
- Filtrado en tiempo real en entornos con recursos limitados: al ocupar decenas de megabytes en cuantizaciones de 4 bits, puede desplegarse en dispositivos de borde, contenedores pequenos o instancias sin GPU.
- Analisis de conversaciones multi-turno de hasta 512 tokens: suficiente para mensajes individuales o pares de pregunta y respuesta, pero no para hilos largos completos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio de la cuantizacion no incluye metricas propias, y no se ha localizado ninguna evaluacion del modelo base en los resultados de busqueda, que no devolvieron contenido relevante sobre este modelo.

## Requisitos de hardware

- VRAM/RAM estimada para inferencia, calculada a partir de ~125 M de parametros (estimacion propia, no confirmada por el autor):
  - F16: aproximadamente 250 MB.
  - Q8_0: aproximadamente 135 MB.
  - Q6_K: aproximadamente 105 MB.
  - Q5_K_M / Q5_K_S: aproximadamente 90 MB.
  - Q4_K_M / Q4_K_S / IQ4_XS: aproximadamente 80 MB.
  - Q3_K_M / Q3_K_S / Q3_K_L: aproximadamente 65 MB.
  - Q2_K: aproximadamente 50 MB.
- Caben en cualquier GPU de consumo: el modelo completo en F16 ocupa menos de 1 GB, por lo que es viable en RTX 3060, RTX 4090 o incluso en GPUs con 4 GB o menos.
- Inferencia en CPU: viable sin GPU; un encoder de este tamano suele procesar secuencias cortas en milisegundos, aunque no hay mediciones publicadas en la informacion disponible.
- GPU recomendadas: no se requiere ninguna GPU de clase A100, H100 o similar; cualquier acelerador con al menos 2 GB de memoria es suficiente.
- Opciones de despliegue: llama.cpp y runtimes compatibles con GGUF (Ollama, servidores tipo LM Studio). Conviene verificar el soporte efectivo de arquitecturas encoder-only en estos runtimes, historicamente mas limitado que el de modelos decoder-only. Como alternativa, el modelo base en safetensors puede ejecutarse con la libreria Transformers, que ofrece soporte pleno de RoBERTa.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tipo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| roberta-base-nvidia-aegis-v2 (GGUF) | ~125 M | 512 tokens (inferido) | Encoder, clasificacion | No disponible | GGUF en HuggingFace |
| unitary/toxic-bert | ~110 M | 512 tokens (tipico de BERT-base) | Encoder, clasificacion | No verificada en esta ficha | safetensors, HuggingFace |
| facebook/roberta-hate-speech-dynabench-r4-target | ~125 M | 512 tokens (tipico de RoBERTa-base) | Encoder, clasificacion | No verificada en esta ficha | safetensors, HuggingFace |
| Llama Guard 3 | ~8 000 M | mayor que 512 tokens | Decoder, clasificacion generativa | No verificada en esta ficha | safetensors, HuggingFace |

Nota: no se dispone de resultados de benchmarks de este modelo ni de metricas comparativas verificadas en la informacion proporcionada, por lo que la comparacion se limita a parametros, contexto, tipo de arquitectura y formato de distribucion. La diferencia clave frente a alternativas como Llama Guard 3 es el orden de magnitud: un encoder de ~125 M se ejecuta en CPU y con latencias muy inferiores, a cambio de una capacidad de razonamiento y de generalizacion presumiblemente menor.

## Limitaciones y advertencias

- Licencia no declarada: ni el repositorio de la cuantizacion ni la model card indican licencia. El uso comercial del modelo base y de esta conversion es juridicamente incierto y debe verificarse con el autor original antes de cualquier despliegue en produccion.
- Ausencia de model card: la unica documentacion son metadatos autogenerados por la herramienta de conversion. No hay informacion sobre datos de entrenamiento, composicion del dataset, sesgos conocidos ni intencion de uso.
- Cero validacion comunitaria: 0 descargas y 0 likes en el momento de redactar la ficha, lo que implica que no existe retroalimentacion de terceros sobre su comportamiento real.
- Sin benchmarks: no hay ninguna medicion publicada de precision, recall, F1 ni tasas de falsos positivos.
- Riesgo de alucinacion: no aplica en el sentido generativo, pero si aplica el riesgo de clasificaciones incorrectas o sobreconfiadas, especialmente en dominios alejados del dataset de entrenamiento.
- Sesgos: no disponibles. Los clasificadores de seguridad entrenados sobre datasets en ingles tienden a rendir peor en textos en otros idiomas, en variedades dialectales y en contextos culturales no representados, pero este punto no puede confirmarse con la informacion disponible.
- Limitacion de contexto: 512 tokens maximo (inferido) impide analizar documentos largos de una sola pasada; seria necesario fragmentar y agregar resultados.
- Arquitectura encoder-only: no genera texto, no soporta tool calling ni flujos de agentes. Cualquier expectativa en ese sentido es incorrecta.
- Soporte de runtime incierto: el soporte de modelos encoder-only en llama.cpp y derivados ha sido historicamente parcial; conviene probar la carga del GGUF antes de disenar una arquitectura de produccion alrededor de el.
- Metadatos anomalos: la fecha de creacion registrada (2026-09-17) es posterior a la fecha habitual de publicacion de modelos comparables, lo que sugiere una posible inconsistencia en los metadatos del repositorio.
- Idoneidad para moderacion automatizada: cualquier clasificador de seguridad usado para sancionar o bloquear contenido deberia operar con revision humana y umbrales calibrados, dado el impacto sobre los usuarios.

## Enlaces

- Repositorio de la cuantizacion GGUF: https://huggingface.co/mradermacher/roberta-base-nvidia-aegis-v2-GGUF
- Modelo base: https://huggingface.co/leomaurodesenv/roberta-base-nvidia-aegis-v2
- Perfil del autor de la cuantizacion: https://huggingface.co/mradermacher
- Runtime GGUF de referencia: https://github.com/ggerganov/llama.cpp

Nota: la busqueda web realizada para esta ficha no devolvio resultados relevantes sobre el modelo (unicamente enlaces a la plataforma Canva, sin relacion con el contenido). No se han localizado papers, blogs, demos ni repositorios adicionales asociados al modelo en la informacion disponible.
