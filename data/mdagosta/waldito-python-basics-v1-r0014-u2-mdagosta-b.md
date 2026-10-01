# mdagosta/waldito-python-basics-v1-r0014-u2-mdagosta-b

## Resumen

El modelo identificado como `mdagosta/waldito-python-basics-v1-r0014-u2-mdagosta-b` es un modelo de generacion de texto de muy reducido tamano (9.541.632 parametros) publicado en HuggingFace por el usuario `mdagosta`. Segun la model card del autor, se trata de un export del proyecto "OpenWALDO" que reutiliza la arquitectura causal estandar de Llama implementada en la libreria Transformers, junto con un tokenizador propio de tipo "schema-1 byte tokenizer". El repositorio esta etiquetado como `text-generation`, `conversational` y `endpoints_compatible`, lo que indica que el autor lo ha preparado para su despliegue mediante text-generation-inference y endpoints compatibles.

El nombre del repositorio sugiere que se trata de un ajuste fino orientado a fundamentos de Python, aunque la model card no confirma explicitamente el dataset, el idioma ni el objetivo de entrenamiento. El modelo no registra descargas ni "likes" en el momento de la consulta y el tamano del repositorio aparece como 0,0 GB, lo que apunta a un artefacto de pesos muy ligero, coherente con sus aproximadamente 9,5 millones de parametros.

Por su tamano y por la ausencia de datos publicos de entrenamiento, benchmarks o licencia, debe considerarse un modelo experimental o de investigacion mas que un candidato para produccion. Su interes principal radica en el formato de publicacion: incluye ficheros `BOM.json` (inventario de ficheros de la release) y `EU-BOM.json` (mapeo de divulgacion de contenido de entrenamiento conforme al reglamento europeo de IA, GPAI), un patron de trazabilidad poco habitual en modelos de esta escala.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal tipo Llama (implementacion estandar de Transformers) |
| Parametros totales | 9.541.632 |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; el repo declara 0,0 GB) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Tokenizador | OpenWALDO schema-1 byte tokenizer (requiere `trust_remote_code=True`) |
| Libreria | transformers |
| Fecha de creacion | 2026-09-30 |
| Ultima actualizacion | 2026-09-30 |

## Arquitectura y entrenamiento

El modelo emplea la arquitectura de lenguaje causal de Llama tal como se distribuye en la libreria Transformers, con la particularidad de que el tokenizador no es el habitual de Llama sino un "schema-1 byte tokenizer" propio del proyecto OpenWALDO. Esto implica que para cargar el tokenizador es necesario activar `trust_remote_code=True`, lo que conlleva ejecutar codigo personalizado del repositorio; es un punto a auditar antes de cualquier uso en entornos controlados. No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset, la posible fase de ajuste por instrucciones (SFT, RLHF o DPO) ni sobre innovaciones tecnicas como decodificacion especulativa o mecanismos de atencion alternativa.

El unico dato adicional relevante es la presencia de `BOM.json`, que inventaria todos los ficheros de la release, y de `EU-BOM.json`, que contiene el mapeo de divulgacion de contenido de entrenamiento exigido por la normativa europea para modelos de IA de proposito general. No obstante, el contenido de esos ficheros no se ha facilitado en la informacion disponible, por lo que no es posible verificar la procedencia de los datos ni el proceso de entrenamiento.

## Capacidades

- Generacion de texto causal en el formato estandar de un modelo Llama.
- Orientacion declarada por el nombre del repositorio hacia fundamentos de Python (`python-basics-v1`); no confirmada en la model card.
- Etiquetado como `conversational`, lo que sugiere uso en dialogos de tipo asistente, aunque no se detalla el formato de prompt.
- Compatibilidad declarada con text-generation-inference y con endpoints compatibles (`endpoints_compatible`).
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible.
- Capacidades especiales (modo thinking, vision, audio): no disponible.

## Casos de uso

- Experimentacion academica con arquitecturas Llama a escala minima: el modelo permite reproducir el flujo de carga y generacion de un transformer causal en Transformers con un coste de recursos minimo, util para docencia o pruebas de infraestructura.
- Validacion de pipelines de despliegue: al estar etiquetado como compatible con text-generation-inference y endpoints, sirve para probar la integracion de TGI, contenedores y APIs de inferencia sin consumir GPU de gama alta.
- Pruebas de tokenizadores personalizados: el tokenizador OpenWALDO schema-1 basado en bytes permite estudiar el comportamiento de tokenizacion a nivel de byte y compararlo con tokenizadores BPE convencionales.
- Investigacion sobre trazabilidad y cumplimiento normativo: los ficheros `BOM.json` y `EU-BOM.json` lo convierten en un caso de estudio sobre como documentar la divulgacion de contenido de entrenamiento bajo el reglamento europeo de IA.
- Generacion de texto de bajo coste en entornos embebidos o CPU: con 9,5 millones de parametros puede ejecutarse en CPU o en GPUs integradas para tareas de generacion corta y no criticas.
- Ajuste fino y destilacion como modelo de laboratorio: por su tamano reducido es adecuado como banco de pruebas para experimentos de fine-tuning, LoRA o destilacion antes de escalar a modelos mayores.
- Filtrado o clasificacion de texto auxiliar: en tareas de preprocesado donde no se requiere calidad linguistica alta, puede emplearse como generador de etiquetas o completados simples.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (calculada a partir de 9.541.632 parametros):
  - fp32: aproximadamente 38 MB de pesos.
  - fp16/bf16: aproximadamente 19 MB de pesos.
  - int8: aproximadamente 10 MB de pesos.
  - int4: aproximadamente 5 MB de pesos.
  A estas cifras hay que anadir el consumo de activaciones, cache KV y overhead del runtime, que en la practica multiplican varias veces el uso de memoria de los pesos.
- GPU recomendadas: cualquier GPU con al menos 2-4 GB de VRAM es suficiente (GTX 1650, RTX 3050, RTX 4090, A100, H100). El modelo no requiere GPU de datacenter.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU de consumo actual e incluso en iGPU con memoria compartida.
- Cabe en CPU: si, es viable la inferencia en CPU para cargas ligeras.
- Opciones de despliegue: Transformers (con `trust_remote_code=True` para el tokenizador), text-generation-inference, endpoints compatibles. Compatibilidad con llama.cpp, Ollama o vLLM no confirmada en la informacion disponible.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye modelos comparables de referencia y no se dispone de datos de rendimiento, contexto o licencia que permitan una comparacion fundamentada. Como referencia de categoria, modelos de escala similar como TinyLlama (1,1B), Qwen2.5-0.5B o SmolLM-135M son ordenes de magnitud mayores en parametros y no resultan directamente comparables con un modelo de 9,5 millones de parametros.

## Limitaciones y advertencias

- Licencia no disponible: sin una licencia explicita no hay autorizacion clara para uso comercial ni para redistribucion; conviene contactar con el autor antes de cualquier uso en produccion.
- Idiomas soportados no declarados: no se puede garantizar un comportamiento correcto en castellano ni en ningun otro idioma concreto.
- Longitud de contexto desconocida: no se puede planificar el uso en conversaciones multi-turno o documentos largos.
- Datos de entrenamiento no publicos: no hay informacion sobre composicion del dataset, posible presencia de datos personales, sesgos o contaminacion de benchmarks.
- Riesgo de alucinacion elevado: con 9,5 millones de parametros la capacidad de conocimiento factual y de razonamiento es muy limitada; las salidas no deben tratarse como fiables.
- `trust_remote_code=True`: cargar el tokenizador implica ejecutar codigo del repositorio, lo que supone un riesgo de seguridad que debe auditarse antes de su uso.
- Fecha de creacion futura en los metadatos (2026-09-30): el registro presenta una fecha anomala que conviene verificar, ya que puede indicar un artefacto de prueba o un error de publicacion.
- Ausencia de benchmarks: no hay evidencia publica de calidad, por lo que no es recomendable su uso en produccion sin una evaluacion propia.
- Compatibilidad de ecosistema limitada: no se confirma soporte en llama.cpp, Ollama o vLLM, ni disponibilidad de cuantizaciones GGUF publicadas.

## Enlaces

- HuggingFace: https://huggingface.co/mdagosta/waldito-python-basics-v1-r0014-u2-mdagosta-b
- Documentacion de Transformers (arquitectura Llama): https://huggingface.co/docs/transformers/model_doc/llama
- Documentacion de text-generation-inference: https://huggingface.co/docs/text-generation-inference
- No se han encontrado papers, blogs, repositorios o demos adicionales en la informacion disponible.
