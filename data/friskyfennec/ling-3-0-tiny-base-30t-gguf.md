# FriskyFennec/Ling-3.0-tiny-base-30T-GGUF

## Resumen

Ling-3.0-tiny-base-30T-GGUF es una conversión al formato GGUF del modelo base inclusionAI/Ling-3.0-tiny-base-30T, publicada por el usuario FriskyFennec. Se trata de un modelo de generación de texto de tipo base (no ajustado por instrucciones ni por preferencias humanas), con 8.209.997.600 parámetros (aproximadamente 8,2 mil millones), pensado para experimentación con modelos fundacionales y tareas de completado de texto. La conversión se realizó con una build de desarrollo de llama.cpp (0.4.0-dev).

El interés de esta ficha radica en que permite ejecutar un modelo de ~8,2B en hardware de consumo o en servidores modestos mediante cuantización, sin necesidad de cargar los pesos completos en safetensors. La model card documenta únicamente el uso mediante llama-server con cuantización BF16 y contexto de 8192 tokens, y advierte de que existe una variante separada (FriskyFennec/Ling-3.0-tiny-base-midtrain-GGUF) para quienes necesiten la longitud de contexto completa de 256K.

La licencia es MIT, heredada del modelo original, lo que facilita el uso comercial y la redistribución. No se dispone de datos sobre composición del dataset, idiomas soportados ni resultados de benchmarks, por lo que la evaluación debe hacerse de forma empírica antes de cualquier despliegue en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (la model card no la especifica; es un modelo base de generacion de texto) |
| Parametros totales | 8.209.997.600 (aprox. 8,2B) |
| Parametros activos | no disponible (no se indica que sea un modelo MoE) |
| Longitud de contexto | 8192 tokens en este checkpoint (entrenado con esa longitud); el autor referencia una variante con contexto completo de 256K |
| Tipos de cuantizacion | BF16 confirmado en la model card; el repositorio ocupa 75,6 GB, lo que sugiere varias cuantizaciones adicionales, aunque no se detallan |
| Idiomas soportados | no disponible |
| Licencia | MIT (heredada de inclusionAI/Ling-3.0-tiny-base-30T) |
| Formato de pesos | GGUF (el modelo original esta en safetensors) |

## Arquitectura y entrenamiento

No se han publicado en la informacion disponible detalles sobre la arquitectura interna (tipo de transformer, atencion, uso de MoE o SSM), la composicion del dataset de entrenamiento ni el numero de tokens de entrenamiento. El identificador del modelo base incluye la etiqueta "30T", que el autor no desglosa en la model card, por lo que no es posible confirmar a que hace referencia exactamente (presumiblemente al volumen de tokens de entrenamiento, pero no esta documentado).

El unico dato tecnico de entrenamiento confirmado es que el modelo fue entrenado con una longitud de contexto de 8192 tokens, segun el config.json del modelo original y una aclaracion del propio desarrollador en la seccion de discusiones de Hugging Face. No se documenta si hubo fases de ajuste por instrucciones, RLHF o DPO; el sufijo "base" indica que se trata de un modelo fundacional sin alineamiento posterior. La conversion a GGUF se realizo con llama.cpp build 0.4.0-dev, y el autor valido el funcionamiento con llama-server empleando `--flash-attn auto`, `--mlock` y `--gpu-layers 256`.

## Capacidades

- Generacion de texto y completado de texto libre en modo base (sin plantilla de chat ni rol de sistema).
- Continuacion de prompts narrativos y de estilo diverso, como muestran los ejemplos de la model card (musica, redes sociales, Minecraft).
- Razonamiento y codigo: no hay evidencia documentada en la informacion disponible; al ser un modelo base sin ajuste por instrucciones, su rendimiento en estas tareas no esta garantizado.
- Tool calling / function calling: no soportado de forma nativa (no es un modelo instruct ni se documenta formato de herramientas).
- Agentes y razonamiento multi-paso: no documentado; requeriria ajuste adicional o scaffolding externo.
- Capacidades multilingues: no disponibles; no se especifica la composicion idiomatica del entrenamiento.
- Capacidades especiales: no se documentan modos de razonamiento explicito, vision ni audio.
- Ajuste fino: al ser un modelo base en formato GGUF, es util como punto de partida para experimentos de completado; el ajuste fino sobre GGUF no es el flujo habitual (requiere partir del modelo en safetensors).

## Casos de uso

- Experimentacion con modelos fundacionales: sirve como banco de pruebas para estudiar el comportamiento de un modelo base de ~8,2B en tareas de continuacion de texto, con la ventaja de poder ejecutarse en una unica GPU de 24 GB en BF16.
- Generacion de texto creativo por completado: con los parametros recomendados por el autor (temperatura 0,7, top-p 0,95, top-k 40, penalizacion de repeticion 1,1 con rango 256), el modelo produce continuaciones coherentes de prompts narrativos, util para prototipos de escritura asistida.
- Prototipado de autocompletado en editores o herramientas internas: al ser un modelo de completado puro, encaja en flujos donde se necesita continuar un fragmento de texto sin instrucciones conversacionales.
- Base para ajuste fino posterior: aunque este repositorio este en GGUF, el modelo original en safetensors puede usarse para fine-tuning con LoRA sobre un corpus de dominio y despues reconvertirse a GGUF para inferencia local.
- Evaluacion comparativa de cuantizaciones: el repositorio, de 75,6 GB, permite comparar como afectan distintas cuantizaciones a la perplejidad y a la calidad del texto generado en un mismo modelo de ~8,2B.
- Despliegue en servidor local con llama.cpp: mediante `llama-server` con contexto de 8192 tokens, adecuado para servicios internos de generacion de texto con requisitos de privacidad (los datos no salen de la infraestructura propia).
- Docencia y divulgacion: por su tamano moderado y licencia MIT, es un candidato razonable para demostraciones practicas de cuantizacion y despliegue de LLM en cursos o talleres.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de MMLU, HumanEval, GSM8K ni de ningun otro conjunto de evaluacion, y los resultados de la busqueda web no aportan datos relacionados con el modelo.

## Requisitos de hardware

- VRAM estimada para inferencia (calculada a partir de los 8,2B de parametros; cifras aproximadas, sin contar el cache KV):
  - BF16 / FP16: en torno a 16,4 GB solo de pesos; con cache KV para 8192 tokens, entre 18 y 20 GB.
  - Q8_0: en torno a 8,7 GB.
  - Q6_K: en torno a 6,8 GB.
  - Q5_K_M: en torno a 5,7 GB.
  - Q4_K_M: en torno a 4,9 GB.
- GPU recomendadas: para BF16, una RTX 3090 o RTX 4090 (24 GB) es suficiente; en el entorno profesional, A100 40 GB, L40S o H100 permiten margen para lotes mayores y contextos mas largos. Para cuantizaciones Q4/Q5, bastan GPUs de 8 a 12 GB (RTX 3060 12 GB, RTX 4060 Ti 16 GB).
- Compatibilidad con GPU de consumo: si, en todas las cuantizaciones de 8 bits o inferiores. La BF16 cabe en tarjetas de 24 GB y, con offload parcial de capas a CPU, tambien en tarjetas de 16 GB.
- Opciones de despliegue: llama.cpp / llama-server (flujo validado por el autor), Ollama y cualquier runtime compatible con GGUF. El tag `endpoints_compatible` indica compatibilidad con endpoints tipo API. vLLM y TGI no son la via natural para este repositorio GGUF, aunque vLLM incorpora soporte experimental de GGUF.
- Configuracion de referencia del autor: `llama-server.exe --model Ling-3.0-tiny-base-30T-BF16.gguf --ctx-size 8192 --gpu-layers 256 --main-gpu 0 --flash-attn auto --mlock --timeout 600`.
- Latencia y throughput: no disponibles; no se han publicado mediciones de tokens por segundo ni de latencia en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Rendimiento |
|---|---|---|---|---|---|
| FriskyFennec/Ling-3.0-tiny-base-30T-GGUF (este repositorio) | 8,2B | 8192 tokens | GGUF | MIT | no disponible |
| inclusionAI/Ling-3.0-tiny-base-30T (modelo original) | 8,2B | 8192 tokens (256K en la variante midtrain) | safetensors | MIT | no disponible |
| FriskyFennec/Ling-3.0-tiny-base-midtrain-GGUF | no disponible | 256K | GGUF | MIT (heredada) | no disponible |

No es posible establecer una comparativa de rendimiento con modelos de otras familias de tamano similar (por ejemplo, modelos densos de ~8B de otros proveedores) porque no hay resultados de benchmarks publicados para este modelo en la informacion disponible. Cualquier comparacion deberia basarse en una evaluacion propia con el mismo harness y las mismas tareas.

## Limitaciones y advertencias

- Es un modelo base sin ajuste por instrucciones: no espera plantillas de chat, no sigue ordenes de sistema ni responde adecuadamente a formatos conversacionales sin un prompting muy cuidadoso.
- Riesgo de alucinacion y de deriva tematica elevado en comparacion con modelos alineados, ya que no ha pasado por fases de RLHF o DPO documentadas.
- Sesgos conocidos: no disponibles. No se documenta la composicion del corpus de entrenamiento, por lo que no se puede evaluar que sesgos de genero, raza, ideologia o idioma puede arrastrar.
- Cobertura idiomatica no documentada: no se especifica que idiomas soporta; el uso en castellano no esta validado.
- Limitacion de contexto: este checkpoint esta limitado a 8192 tokens, muy por debajo de los 256K que admite la variante midtrain del mismo autor. Para tareas con documentos largos hay que usar la otra conversion, no esta.
- Licencia MIT: permite uso comercial, modificacion y redistribucion manteniendo el aviso de copyright y la propia licencia. Es una licencia permisiva, sin clausulas de uso aceptable adicionales.
- Ausencia de benchmarks: no hay ninguna metrica publicada, ni siquiera de perplejidad, lo que impide estimar la calidad real del modelo frente a alternativas.
- Estado del repositorio: cero descargas y cero likes en el momento de la consulta, lo que implica ausencia de validacion por parte de la comunidad. Conviene verificar la integridad de los archivos GGUF y la version de llama.cpp antes de usarlos en produccion.
- Repositorio de gran tamano (75,6 GB): la descarga completa es costosa; si solo se necesita una cuantizacion, conviene descargar archivos individuales.
- La model card no documenta el uso de herramientas, agentes ni capacidades multimodales, por lo que no deben asumirse.

## Enlaces

- Repositorio GGUF: https://huggingface.co/FriskyFennec/Ling-3.0-tiny-base-30T-GGUF
- Modelo base original: https://huggingface.co/inclusionAI/Ling-3.0-tiny-base-30T
- Configuracion del modelo base (contexto de 8192): https://huggingface.co/inclusionAI/Ling-3.0-tiny-base-30T/blob/main/config.json
- Aclaracion del desarrollador sobre la longitud de contexto: https://huggingface.co/inclusionAI/Ling-3.0-tiny-base-30T/discussions/1#6a87d5831203c835c7dfcefa
- Variante GGUF con contexto completo (256K): https://huggingface.co/FriskyFennec/Ling-3.0-tiny-base-midtrain-GGUF
- Resultados de busqueda web: no se han encontrado enlaces relevantes al modelo; los resultados devueltos correspondian a dominios sin relacion con este proyecto.
